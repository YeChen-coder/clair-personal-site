# Clair Y. Chen — Personal Site (Orchard)

[Chinese version](README_zh.md)

**Orchard version:** https://clair-chen.yechenworking.workers.dev/


## The Story Behind the Design

The orchard version is a personal site built for me by **Grok Build** and hosted on Cloudflare. There is a reason I make a point of naming the AI responsible: my apologies to everyone's eyes, but the tree and apples on the page are... a little visually overwhelming. Still, I have to admit that the design is both distinctive and memorable, so I have kept it for now. — I've since had Claude Code redesign it.

The snake's body still looks broken. I asked Claude Code many times to fix the broken segments, and it still couldn't get it right. But it's watchable — focus on the big picture and don't sweat the artwork on something like this.

The apple tree and apples have now been replaced with nicer-looking ones. They're a bit less distinctive, but overall this version is better.

Later, after seeing a UI with a particle effect that flips from a profile image into the next scene, I built a second version. Despite that update, I still think the second version is far less distinctive than the apple tree:

- **Second version:** The sci-fi particle effects are more modern, and the copy is better—the second version was polished by a person, while the first version still contains raw AI-generated copy that I need to revise. It communicates information well, but its visual identity is weak and its memorability is close to zero because the design is too conventional.
- **First version:** The apple tree may be rough, but this is no longer the 1980s, when impressive animation was rare. Today, people see elaborate effects and cinematic transitions everywhere and have already grown tired of them.

What matters most is giving people something they will remember—provided, of course, that they remember it for the right reasons.

## About the Site

This is the personal site of [Clair Y. Chen](https://github.com/YeChen-coder): a literal illustrated fruit tree in which every apple represents a project.

The GitHub Pages profile URL, `YeChen-coder.github.io`, redirects to the orchard version.

## Stack

The site uses static HTML, CSS, and JavaScript and is hosted on the Cloudflare Workers free tier. No build step is required.

## Local Preview

```bash
python3 -m http.server 8765
# Open http://localhost:8765
```

## Deployment to Cloudflare

Upload the folder contents—or deploy them directly with Wrangler Pages or Workers—to the `clair-chen` Worker. Keep `index.html`, `styles.css`, `app.js`, `snake.js`, and `assets/` together.

# Dev Log and Rants

I added an AI chatbot feature built on AWS Bedrock AgentCore. I assumed a chatbot was a very well-designed problem; I didn't expect it to cause trouble.

Real-world constraints play a part too — there are quite a few issues tangled up here.

First, by default the AI coding agent feeds it the READMEs from my GitHub repositories. But my READMEs mostly record the real problems I ran into, how they worked, and how I solved them — they aren't standard documentation — so I had to expand the context sources.

Second, I like writing README updates on the GitHub web UI, and I usually write them in Chinese. So I set up two scheduled tasks:

1. Periodically (every two or three days), have Claude Code translate updates to my Chinese READMEs into the default English READMEs.
2. Convert the newly changed Chinese .md files to text and send them to AWS, so it knows my latest progress and the chatbot gets up-to-date data.

That was mostly done last night. Claude Code's results looked good, so I went to bed — and then today, when I tried it, things broke again.

The problem was mainly the job description feature. The idea is that a visitor (say, a recruiter) pastes in a job description, and the AWS backend matches it against my materials — essentially a higher-order RAG.

But because it's multi-turn, and I'm using Haiku (the cheapest model), the default agent only gets the first 1,500 characters, due to model capability and token cost. As everyone knows, job descriptions are usually full of boilerplate. If the core requirements are buried behind the company outlook, company intro, or "We're looking for someone who…", the matching is completely lost.

For a problem like this, Claude Code could just add a layer up front, right? Such a simple, obvious thing: throw in a prompt to rewrite it. In the Jesus Says Hi project, Claude Code even proposed this itself, so why couldn't it think of it here? Is rewriting really that hard to come up with, that it has to wait for me to suggest it? — Ugh, Claude Code is driving me crazy! Matching a pasted job description is already a workflow, the result of multiple agents. Even before any of today's changes, it already had this step: extract the key points, hand them to the next agent to search my materials, then carry on as normal. That key-point extraction layer can actually be reused directly.

But Claude Code never thought about what happens in a multi-turn conversation. Specifically: the visitor pastes the description, my AWS backend sends back the match results — and then the visitor asks a follow-up. What then? Claude Code never considered this. It just tested that single step and told me it was done. The direct result: for any follow-up question, what gets sent to AWS is the first 1,500 characters of the job description pasted earlier, not the key points summarized by an LLM layer. Of course that blows up — it's a total non sequitur. The fix is easy, too: reuse. That layer is already written, so in the browser just swap the message from the full job description to the summary.

Wait — this is another trap.

When I was using the OpenAI API, I could reset the instructions for just the current exchange in session.update. But now I'm using the Bedrock Converse API, which isn't quite like OpenAI's Realtime API. The underlying models are all pretty similar, but the mechanisms differ a lot.

On Bedrock, only the messages included in this request count. If they aren't included, the model has no idea what happened, because it's stateless.

But that's actually easier to work with: OpenAI is stateful, and the server stores the whole conversation for you — once something is added to the conversation, it's hard to remove. Stateless gives you much better control over the whole context.

Bedrock is actually closer to how I originally understood a Large Language Model's context window: it's just System plus Messages.

System is the system prompt. Since it's stateless, you resend it with every request.

Messages are the last 6 history entries, each truncated to 1,500 characters, plus the new question. With that, it's easy to get creative.

The first thing settled at this point: replace the raw job description text.

It definitely can't go in the system prompt — what if someone writes something in it that causes a prompt injection? It can't go in system no matter what, and there's nowhere else, so with only two options, it has to go in a message.

Routing is decided by the same LLM (Claude Haiku 4.5) itself, not by keyword matching. For each question, the agent passes the routing rules (in the system prompt), the tool list, and the visitor's question to the model together, and the model decides whether to show the cat, look up materials, leave a message, do JD matching, or just answer directly.

Since such models now exist — OpenAI has explicitly said there are globally available models that only make a choice and don't output text — I explored whether, in the current setup, the high-cost model used for routing could be swapped for one of these choice-only models.

Since we're on the topic, I might as well go through it all. Let's stick to Bedrock, since that's where this scenario lives.

There are two main kinds of routing on Bedrock:

1. Intent routing: figure out what the visitor wants, then take the matching flow. This is exactly what I need, e.g. deciding whether they want to see the cat, look up materials, leave a message, or do job description matching.
2. Model routing: decide whether a question goes to a cheap small model or an expensive large one. This isn't really relevant to what we're doing right now.

Bedrock's Converse API has a toolConfig / toolChoice parameter with several modes:
• auto: the model decides whether to call a tool and whether to speak — this is what I'm using now
• any: it must call a tool and can't output text directly
• tool: it must call the specified tool

So it's entirely feasible technically. To switch to a dedicated router that only chooses and doesn't output text, you'd pick a cheaper small model (Haiku is already cheap, but there are cheaper ones, like Amazon Nova Micro), give it a choice tool with options A, B, C, D, and set the parameter to any, forcing it to return only the choice.

It suddenly strikes me that commercial and personal use really are a version apart. Commercial solutions are a generation ahead of personal tools like Dify: in industry, routers matured long ago — it's a proper term of art that's been around for who knows how many years — while personal tools only took off in the last few months, and people are just starting to explore all kinds of uses.

The second option is Bedrock Agents' Supervisor with Routing mode. It's Bedrock's managed multi-agent feature: the supervisor first tries to hand simple requests directly to the right sub-agent, and sends unclear ones through the full orchestration flow. But it belongs to the managed Bedrock Agents product, while we write our own loop running on AgentCore, so it doesn't really fit. Integrating it would mean reimplementing what we have over there. I think it's still worth learning more about, but I'll set it aside and finish the current topic first.

The third option is Intelligent Prompt Routing. It does model routing: between two models in the same family (e.g. Claude Haiku and Sonnet), it automatically picks one to answer based on estimated difficulty. I suspect this is what the engineer I interviewed with a couple of days ago was talking about. Afterward I spent about ten minutes wondering how to route based on question difficulty — hand-write a rule-based system? Turns out AWS, the veteran cloud vendor, already ships Intelligent Prompt Routing, so my crude rule-based approach can go straight in the bin. I have to admit my learning pace is still too slow — or more precisely, I haven't put effort into the cloud vendors' ready-made solutions; all my energy went into building a "cyber boyfriend."

The fourth is vector-similarity routing. It doesn't need an LLM and isn't rule-based: it turns the visitor's question into a vector and checks which route's examples it's closest to. It takes a single embedding call, tens of milliseconds, costs basically nothing, and the results are stable. The downside is that it can't understand complex or vague phrasing. As for rule-based, nobody really uses it anymore — let it rest in the dust of history.


I evaluated whether our site should add a standalone router right now, and my conclusion is: not really.

Two main reasons:

1. Architecturally unnecessary: right now routing and answering are done in one call, with a reminder in the same prompt, so routing itself costs no extra money or time. A standalone router would definitely add a call; latency isn't really the main issue (a few milliseconds over the cloud vendor's internal network), but it still adds a layer of complexity.
2. Not cost-effective: a standalone router really pays off when the main model is expensive (e.g. Sonnet, Opus). Route with a cheap small model first and you call the expensive model less. For example, if the user just wants to reset a password, handle it and be done — no need for Sonnet, let alone Opus. But we aren't doing that kind of model routing at all, and we're already on the cheapest model, Haiku, so there are only pennies to save.

If I later want to make it better and smarter, or find the current performance really isn't good enough and it misroutes often, I'll switch then.

---

Everything in the world really does come at a price. Last night I just charged ahead, and looking back, it turns out Claude Code — honest-looking as it is — dug quite a few holes too.

<img width="1093" height="677" alt="image" src="https://github.com/user-attachments/assets/682aece9-ef58-4738-b295-f8dcfd479a8a" />

It started when I updated some content today and took a quick look at Bedrock's observability. That's when I found that every job description query costs $0.10. That's about 0.6 RMB — every single time.

Round it up and that's 1 RMB per query. Where does it end? So I looked into it: why does it cost so much? My question was mostly because I'm already using a low-end model — just Haiku 4.5, not Sonnet, not Opus. It's supposed to be cheap, so why is it still this expensive?

After digging, it turned out to be my fault again — I didn't check the framework on the spot after it finished writing it.

The current logic for job description matching:

1. First, a large-context model extracts the keywords. These aren't single words but clustered concepts (e.g. RAG-related, LangChain, LlamaIndex).
2. But that's not the main point; the trouble comes after: for each requirement, it searches my library once and has the model read the results. What it reads is the top 6 retrieved chunks plus my base résumé; for the second requirement, another 6 chunks plus the base résumé.

The RAG matching up front really doesn't cost much; the cost is all the tokens the model reads. The 6 chunks are easy — cut them down to 3. It's a brute-force, not-very-clever fix, but it works, and it's not the main point anyway.

The main point is that it had the model read my base résumé (i.e. llms.txt) 10 times — the whole thing, 10 times over.

It still needs an overall optimization. What I most want to rant about is that I can't understand how it ended up doing this. Wouldn't normal intuition say to check all 12 requirements together?

I know hybrid search isn't very precise for matching here, but my gut says the framework Codex originally designed for me was wrong. I can't say exactly what's wrong; it just feels like this should be done as a whole.

So I changed it. The main issue was that for the base résumé (that .txt), it read the full text every time, and the chunks selected for each requirement largely overlapped.

Rather than splitting into 10 agents that keep rereading the same content, combine them: search separately, but have the model answer in one go. That's the right way.

The first half of the flow stays the same: search once per requirement to get 10 batches of results; then normalize, merge, and deduplicate; finally feed the deduplicated content, the 10 requirements, and the base résumé to the model together, and have it judge all 10 at once. Much smarter.

No, wait — I'm still reading Claude Code's analysis.

It mentioned in passing that results had previously mixed things up, attributing project A's work to project B. But that can be controlled: just label each chunk with an ID and the project it belongs to.

That made my teeth hurt. Didn't we already do this in the Jesus project? It's ingestion enrichment! Isn't that standard practice — why didn't it do it for me? Ugh, my head hurts. Isn't this standard? Didn't it treat this metadata as part of the chunk?

Fine, fine, fine. I genuinely think this is standard practice — it's a best practice.

And I sincerely think the Opus model should have designed it this way from the start! Why am I only finding out now because it mentioned it offhand? How much other junk is there that it didn't mention?

OK — though I know I probably won't change how I work. A lot of this knowledge is still new to me, and for newer stuff I still like to charge ahead until I get a result and then look back. It's more efficient, and I'm less likely to lose motivation and stop midway because I can't see any results.

But from now on, for things I've done once and have some foundation in, I'll properly have Claude Code draft a somewhat more detailed plan first.

One more issue: Haiku 5.5 is supposedly 1/10 the price of Haiku 4.5 — great — but why won't my AWS account let me use Haiku 5.5? — I'd imagined plenty of obstacles, but I really didn't expect to be blocked by this.

I've opened a support ticket, but from what I've read online, AWS decides per account whether you can use Haiku 5.5, and plenty of people have been rejected. I'm annoyed, and I don't care — I'm already working on a Plan B.

Let me see how this would work with an Anthropic API key instead.

How can this be? You're a cloud vendor — selling models is your business! You're getting paid anyway; who refuses to let people buy?

---

The ticket can wait a couple of days. What's left now is a bunch of small, scattered chores; the overall architecture doesn't really need changes anymore. It is what it is.

The enrichment from before is done: whenever something is mentioned, its source and metadata need to be attached.

Right now there are mainly these things:

1. AWS budget cap and status notices
For my wallet's sake, I set a cap of $10 a month. But AWS only supports daily, monthly, and quarterly budgets; I want weekly, so I have to build it myself.
And it doesn't end there:
• If it gets shut off for exceeding the limit, it first has to notify me, so I don't think the backend crashed and panic.
• It also has to tell visitors on the page, so they know the program is working fine and only paused for budget reasons.
• It needs to be granular, too: only the most token-hungry job description matching is paused; regular Q&A and other features still work. So the chatbot page has to explain clearly why this feature is paused, what's going on, and when it will be back.
2. Update plan for the résumé llms.txt
I want it updated dynamically on a schedule. I love writing logs on GitHub and commit many times a day, sometimes just to post a rant rather than a major code update. If I set up GitHub Actions to trigger on every push, it would fire way too often, which is really annoying. So I want scheduled updates.
This llms.txt is currently used in two places:
• One is on Cloudflare, for other people's crawler bots. Lots of people use AI for background checks now; rather than having the AI crawl a complex CSS structure, just give it a txt it can use directly — accurate and no hallucinating.
• The other is AWS Bedrock AgentCore: when the model generates answers and does job description matching, it needs this txt too.

On syncing these two sources:
• The original idea was to make the txt on Cloudflare the single source of truth and have AWS fetch it on the fly when needed. But that request got rejected with an error, and I haven't had time to look into why. Still, it's a viable path, and I'll tackle it first later.
• Another solution is to store it in S3. But that doesn't really solve anything — I'd still have to log in to the AWS CLI on my device periodically, and constantly logging in is annoying.

This is on hold for now. I've written a lot these past couple of days, so for now I just need to make sure the txt is up to date as of today; the other mechanisms can wait, since it doesn't change that often.

3. Site copy updates
The project descriptions on the site need updating too, and it's a fair amount of work. I'll have to review all that cringey, AI-flavored copy again — I really don't want to.
