// Static site plus one small API: /api/chat and /api/warm are rate-limited here and forwarded to
// AWS, signed with SigV4 so only this Worker can call it. /api/chat goes to the agent on AgentCore
// Runtime (CHAT_BACKEND = "agentcore") or, as a fallback, to the chat Lambda ("lambda");
// /api/warm always goes to the Lambda, which wakes the database.
const API_PATHS = new Set(["/api/chat", "/api/warm"]);
const MAX_BODY = 24000; // a pasted job description plus recent history

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

async function api(request, env, url) {
  if (request.method !== "POST" || !API_PATHS.has(url.pathname)) return json(404, { error: "not_found" });
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return json(403, { error: "forbidden" });

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const limiter = url.pathname === "/api/chat" ? env.CHAT_LIMITER : env.WARM_LIMITER;
  if (!(await limiter.limit({ key: ip })).success) return json(429, { error: "rate_limited" });

  const body = await request.text();
  if (body.length > MAX_BODY) return json(413, { error: "too_large" });

  try {
    if (url.pathname === "/api/chat" && env.CHAT_BACKEND === "agentcore") return await agent(body, ip, env);
    const target = new URL(url.pathname.replace(/^\/api/, ""), env.CHAT_FUNCTION_URL);
    const res = await signedPost(target, body, env, "lambda");
    return new Response(res.body, {
      status: res.status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    });
  } catch {
    return json(502, { error: "upstream" });
  }
}

// AgentCore Runtime InvokeAgentRuntime. One runtime session per visitor IP (hashed), so a visitor's
// follow-ups reuse a warm session; the conversation itself still travels in the request body.
async function agent(body, ip, env) {
  const region = env.AWS_REGION || "us-east-1";
  const target = new URL(`https://bedrock-agentcore.${region}.amazonaws.com/runtimes/` +
    `${encodeURIComponent(env.AGENT_RUNTIME_ARN)}/invocations?qualifier=DEFAULT`);
  const session = "visitor-" + await sha256(`clair-chat:${ip}`);
  const res = await signedPost(target, body, env, "bedrock-agentcore",
    { "x-amzn-bedrock-agentcore-runtime-session-id": session });
  if (!res.ok) return json(res.status === 429 ? 429 : 502, { error: "upstream" });
  // The agent always answers 200 and puts its own status, if any, in the body.
  const data = await res.json().catch(() => ({ error: "upstream", status: 502 }));
  const { status = 200, ...payload } = data;
  return json(status, payload);
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

// ---- AWS Signature Version 4, just enough for a JSON POST to Lambda or AgentCore ----

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const sha256 = async (data) => hex(await crypto.subtle.digest("SHA-256", enc.encode(data)));
async function hmac(key, data) {
  const k = await crypto.subtle.importKey("raw", typeof key === "string" ? enc.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

// RFC 3986 encoding; applied to an already-encoded path segment it double-encodes, as SigV4 expects
// for every service except S3.
const rfc3986 = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

async function signedPost(target, body, env, service, extraHeaders = {}) {
  const region = env.AWS_REGION || "us-east-1";
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = amzDate.slice(0, 8);
  const payloadHash = await sha256(body);
  const headers = {
    "content-type": "application/json",
    host: target.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...extraHeaders,
  };
  const names = Object.keys(headers).sort();
  const query = [...target.searchParams].map(([k, v]) => `${rfc3986(k)}=${rfc3986(v)}`).sort().join("&");
  const canonical = [
    "POST", target.pathname.split("/").map(rfc3986).join("/"), query,
    names.map((n) => `${n}:${headers[n]}\n`).join(""),
    names.join(";"), payloadHash,
  ].join("\n");
  const scope = `${day}/${region}/${service}/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256(canonical)].join("\n");
  let key = await hmac(`AWS4${env.AWS_SECRET_ACCESS_KEY}`, day);
  for (const part of [region, service, "aws4_request"]) key = await hmac(key, part);
  const signature = hex(await hmac(key, toSign));
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${env.AWS_ACCESS_KEY_ID}/${scope}, ` +
    `SignedHeaders=${names.join(";")}, Signature=${signature}`;
  delete headers.host;
  return fetch(target, { method: "POST", headers, body });
}
