/* The serpent in the orchard.
 *
 * The snake follows a fixed closed track: it coils up the trunk (passing behind
 * and in front of it), slides out along the left limb into the leaves, pauses to
 * lift its head toward an apple and taste the air, then loops back and winds
 * down the trunk.
 * When someone picks an apple, it leaves the track and crawls over to that apple,
 * stays while the apple is open, then finds its way back to the track.
 * The body follows the trail the head leaves behind, so it goes exactly where
 * the head has been, which is how a real snake moves.
 *
 * Coordinates are the tree SVG's 900×1100 viewBox. Depth (z) > 0 is in front
 * of the trunk; those parts are drawn in a layer above the trunk and branches.
 */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const backLayer = document.querySelector(".snake-back");
  const frontLayer = document.querySelector(".snake-front");
  if (!backLayer || !frontLayer) return;

  // ---------- track ----------
  const TRUNK_X = 469;
  const RADIUS = 52; // coil radius around the trunk
  const TILT = 3; // vertical half-height of a coil seen in perspective
  const TOP_Y = 676; // where the coil meets the left limb
  const BOTTOM_Y = 915;
  // The left limb as drawn in the tree (centreline and width at each end).
  const LIMB = [[455, 700], [420, 690], [370, 650], [330, 600]];
  const LIMB_W = [34, 13];
  const BODY_HALF = 11;

  const helix = (fromAngle, toAngle, fromY, toY, steps) => {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const k = i / steps;
      const a = fromAngle + (toAngle - fromAngle) * k;
      const y = fromY + (toY - fromY) * k;
      pts.push({ x: TRUNK_X + RADIUS * Math.cos(a), y: y + TILT * Math.sin(a), z: RADIUS * Math.sin(a) });
    }
    return pts;
  };

  // Catmull-Rom through control points, with a slither wave across the direction of travel.
  const spline = (ctrl, steps, wave = 0, waveLen = 46, zFrom = 0, zTo = 0) => {
    const pts = [];
    const n = ctrl.length - 1;
    for (let seg = 0; seg < n; seg++) {
      const p0 = ctrl[Math.max(seg - 1, 0)];
      const p1 = ctrl[seg];
      const p2 = ctrl[seg + 1];
      const p3 = ctrl[Math.min(seg + 2, n)];
      for (let i = seg === 0 ? 0 : 1; i <= steps; i++) {
        const t = i / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const f = (a, b, c, d) =>
          0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        pts.push({ x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) });
      }
    }
    // arc length for the wave phase and the depth ramp
    let len = 0;
    const acc = [0];
    for (let i = 1; i < pts.length; i++) {
      len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      acc.push(len);
    }
    return pts.map((p, i) => {
      const prev = pts[Math.max(i - 1, 0)];
      const next = pts[Math.min(i + 1, pts.length - 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const d = Math.hypot(dx, dy) || 1;
      const k = acc[i] / len;
      // fade the wave in and out so it joins the coil smoothly
      const amp = wave * Math.sin(Math.PI * Math.min(1, k * 1.6, (1 - k) * 1.6));
      const off = amp * Math.sin((acc[i] / waveLen) * Math.PI * 2);
      return { x: p.x - (dy / d) * off, y: p.y + (dx / d) * off, z: zFrom + (zTo - zFrom) * Math.min(1, k * 3) };
    });
  };

  const LEFT = TRUNK_X - RADIUS;
  // a point beside the limb: side +1 rides on top of it, −1 hangs underneath
  const besideLimb = (t, side) => {
    const B = (q) => {
      const u = 1 - q;
      return [0, 1].map((k) =>
        u * u * u * LIMB[0][k] + 3 * u * u * q * LIMB[1][k] + 3 * u * q * q * LIMB[2][k] + q * q * q * LIMB[3][k]
      );
    };
    const [x, y] = B(t);
    const [ax, ay] = B(Math.max(0, t - 0.01));
    const [bx, by] = B(Math.min(1, t + 0.01));
    let nx = -(by - ay);
    let ny = bx - ax;
    const d = Math.hypot(nx, ny) || 1;
    nx /= d;
    ny /= d;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const half = (LIMB_W[0] + (LIMB_W[1] - LIMB_W[0]) * Math.pow(t, 0.85)) / 2;
    const off = (half + BODY_HALF - 1) * side;
    return { x: x + nx * off, y: y + ny * off };
  };
  const tip = besideLimb(1, 0);
  const raw = [
    // Up the trunk: from the front at the bottom, 1¼ turns, ending at its left side.
    // The coils must climb steeply enough that, seen from the front, the body
    // never bends more tightly than its own width at the trunk's sides.
    ...helix(Math.PI / 2, Math.PI * 3, BOTTOM_Y, TOP_Y, 160),
    // up along the top of the left limb, into the leaves
    ...spline([{ x: LEFT, y: TOP_Y }, ...[0.4, 0.6, 0.8, 1].map((t) => besideLimb(t, 1))], 16, 3.5, 62, 0, 22).slice(1),
    // the turn among the leaves, where it stops below the apple
    ...spline(
      [
        besideLimb(1, 1),
        { x: tip.x - 14, y: tip.y - 14 },
        { x: tip.x - 22, y: tip.y + 2 },
        { x: tip.x - 10, y: tip.y + 18 },
        besideLimb(0.94, -1),
      ],
      10, 0, 44, 22, 22
    ).slice(1),
    // back down underneath the limb
    ...spline([...[0.94, 0.7, 0.45].map((t) => besideLimb(t, -1)), { x: LEFT, y: TOP_Y + 30 }], 16, 3.5, 62, 22, 0).slice(1),
    // and down the trunk, ¾ of a turn, back to the start
    ...helix(Math.PI, Math.PI * 2.5, TOP_Y + 30, BOTTOM_Y, 110).slice(1),
  ];

  // resample by 3D arc length so the snake moves at an even pace
  const cum = [0];
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1];
    const b = raw[i];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.6));
  }
  const TRACK = cum[cum.length - 1] + Math.hypot(raw[0].x - raw.at(-1).x, raw[0].y - raw.at(-1).y);
  const STEP = 1;
  const track = [];
  for (let s = 0, j = 0; s < TRACK; s += STEP) {
    while (j < raw.length - 2 && cum[j + 1] < s) j++;
    const a = raw[j];
    const b = raw[j + 1];
    const t = Math.min(1, (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1));
    track.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
  }
  const at = (s) => {
    const n = track.length;
    const f = ((s % TRACK) + TRACK) % TRACK / STEP;
    const i = Math.floor(f) % n;
    const a = track[i];
    const b = track[(i + 1) % n];
    const t = f - Math.floor(f);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
  };

  // the moment on the track where the head is at the tip of the branch
  let PAUSE_AT = 0;
  {
    let best = Infinity;
    track.forEach((p, i) => {
      if (p.z > 10 && p.x < best) {
        best = p.x;
        PAUSE_AT = i * STEP;
      }
    });
  }

  // an open path resampled by arc length, for routes planned on the fly
  const dist3 = (a, b) => Math.hypot(b.x - a.x, b.y - a.y, (b.z - a.z) * 0.6);
  const makePath = (pts) => {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist3(pts[i - 1], pts[i]));
    const length = cum.at(-1);
    const pointAt = (s) => {
      s = Math.max(0, Math.min(length, s));
      let lo = 0;
      let hi = cum.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= s) lo = mid;
        else hi = mid;
      }
      const a = pts[lo];
      const b = pts[hi];
      const t = (s - cum[lo]) / ((cum[hi] - cum[lo]) || 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
    };
    return { length, pointAt };
  };

  // ---------- body ----------
  const LENGTH = 420;
  const SEGMENTS = 90;
  const MAX_W = 22;
  const CHUNK = 8; // body points per drawn piece

  const widthAt = (u) => {
    // u: 0 at the head, 1 at the tail tip
    if (u < 0.05) return MAX_W * (0.86 + u * 1.2);
    if (u < 0.12) return MAX_W * (0.8 + (u - 0.05) * 2.8); // neck, then the body thickens
    if (u < 0.55) return MAX_W;
    return MAX_W * Math.max(0.07, 1 - Math.pow((u - 0.55) / 0.45, 1.35) * 0.93);
  };

  const el = (tag, attrs, parent) => {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    parent?.appendChild(node);
    return node;
  };

  const makeLayer = (root, front) => {
    const g = el("g", { class: front ? "snake-layer is-front" : "snake-layer is-back" }, root);
    const shadow = front ? el("g", { class: "snake-shadow", transform: "translate(2.5 3.5)" }, g) : null;
    const body = el("g", { class: "snake-body" }, g);
    const belly = el("g", { class: "snake-belly" }, g);
    const sheen = el("g", { class: "snake-sheen" }, g);
    const marks = el("g", { class: "snake-marks" }, g);
    const head = el("g", { class: "snake-head" }, g);
    return { g, shadow, body, belly, sheen, marks, head, pools: new Map() };
  };
  const layers = { back: makeLayer(backLayer, false), front: makeLayer(frontLayer, true) };

  // reuse <path> nodes between frames
  const take = (layer, group, cls, i) => {
    const key = cls;
    if (!layer.pools.has(key)) layer.pools.set(key, []);
    const pool = layer.pools.get(key);
    while (pool.length <= i) pool.push(el("path", { class: cls }, layer[group]));
    pool[i].removeAttribute("visibility");
    return pool[i];
  };
  const hideFrom = (layer, cls, i) => {
    const pool = layer.pools.get(cls) || [];
    for (let k = i; k < pool.length; k++) pool[k].setAttribute("visibility", "hidden");
  };

  const fmt = (n) => n.toFixed(1);
  const ribbon = (pts, side, offset, scale) => {
    // a strip along the body: offset across it (as a fraction of width), scaled width
    const L = [];
    const R = [];
    for (const p of pts) {
      const cx = p.x + p.nx * p.w * offset * side;
      const cy = p.y + p.ny * p.w * offset * side;
      const hw = (p.w * scale) / 2;
      L.push(`${fmt(cx + p.nx * hw)},${fmt(cy + p.ny * hw)}`);
      R.push(`${fmt(cx - p.nx * hw)},${fmt(cy - p.ny * hw)}`);
    }
    return `M${L.join("L")}L${R.reverse().join("L")}Z`;
  };

  const headShape = (w) => {
    const k = (n) => fmt(n * w);
    return (
      `M${k(-0.45)},${k(-0.42)} C${k(0.25)},${k(-0.5)} ${k(0.5)},${k(-0.7)} ${k(1.05)},${k(-0.64)} ` +
      `C${k(1.55)},${k(-0.56)} ${k(1.9)},${k(-0.28)} ${k(1.94)},${k(-0.02)} ` +
      `C${k(1.92)},${k(0.22)} ${k(1.6)},${k(0.48)} ${k(1.05)},${k(0.55)} ` +
      `C${k(0.5)},${k(0.6)} ${k(0.2)},${k(0.44)} ${k(-0.45)},${k(0.42)} Z`
    );
  };

  const buildHead = (layer) => {
    const g = el("g", {}, layer.head);
    const tongue = el("path", { class: "snake-tongue" }, g);
    const shape = el("path", { class: "snake-head-shape" }, g);
    const jaw = el("path", { class: "snake-jaw" }, g);
    const crown = el("path", { class: "snake-head-mark" }, g);
    const outline = el("path", { class: "snake-head-outline" }, g);
    const brow = el("path", { class: "snake-brow" }, g);
    const eye = el("circle", { class: "snake-eye" }, g);
    const pupil = el("ellipse", { class: "snake-pupil" }, g);
    const glint = el("circle", { class: "snake-glint" }, g);
    const nostril = el("circle", { class: "snake-nostril" }, g);
    return { g, tongue, shape, jaw, crown, outline, brow, eye, pupil, glint, nostril };
  };
  const heads = { back: buildHead(layers.back), front: buildHead(layers.front) };

  // ---------- state ----------
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let headS = PAUSE_AT - 640; // start mid-climb, coiled on the trunk
  let pausedFor = 0;
  let lean = 0; // 0..1, how far the neck is reaching toward the apple
  let idle = 0; // 0..1, the resting movement while it waits: fades in when it stops, out when it moves
  let flick = { start: -1, dur: 0.55 };
  let nextFlick = 1.5;
  let clock = 0;
  let lookTarget = null;
  let DEFAULT_APPLE = { x: 318, y: 546 }; // replaced below by the apple nearest the turn
  const SPEED = 34; // viewBox units per second
  const PAUSE = 3.6;
  const SEEK_SPEED = 78; // hurrying to an apple someone picked
  const HOME_SPEED = 52;
  const REJOIN = PAUSE_AT - 100; // where a trip home rejoins the loop: on the way out along the limb

  // The body follows the trail the head leaves behind, so the head can take any route.
  let trail = [];
  for (let s = headS - LENGTH - 40; s <= headS; s += 1) trail.push(at(s));
  const pushHead = (p) => {
    if (dist3(trail.at(-1), p) < 0.4) return;
    trail.push(p);
    if (trail.length > 2600) trail = trail.slice(-1500);
  };
  // the point `back` units behind the head, along the trail
  const behindHead = (back) => {
    let acc = 0;
    for (let i = trail.length - 1; i > 0; i--) {
      const d = dist3(trail[i], trail[i - 1]);
      if (acc + d >= back) {
        const t = (back - acc) / (d || 1);
        const a = trail[i];
        const b = trail[i - 1];
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
      }
      acc += d;
    }
    return { ...trail[0] };
  };

  let mode = "loop"; // loop -> seek -> hold -> home -> loop
  let route = null;
  let routeS = 0;
  let chosen = null; // { node, x, y, r }: the apple it is going to or guarding

  const fruitPos = (node) => {
    const m = /translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(node.getAttribute("transform") || "");
    return m ? { x: +m[1], y: +m[2] } : null;
  };
  {
    // the apple the snake reaches for: whichever hangs closest to where it stops
    const stop = at(PAUSE_AT);
    let best = Infinity;
    document.querySelectorAll(".fruit").forEach((node) => {
      const p = fruitPos(node);
      const d = p ? Math.hypot(p.x - stop.x, p.y - stop.y) : Infinity;
      if (d < best) {
        best = d;
        DEFAULT_APPLE = p;
      }
    });
  }
  const fruitRadius = (node) => {
    const m = /scale\(\s*([\d.]+)/.exec(node.getAttribute("transform") || "");
    return 25 * (m ? +m[1] : 1);
  };

  function routeToApple(apple) {
    const h = trail.at(-1);
    const back = behindHead(10);
    const raw = [];
    let from = h;
    const onTrunk = Math.abs(Math.hypot(h.x - TRUNK_X, h.z) - RADIUS) < 4 && h.y > TOP_Y - 30;
    if (onTrunk) {
      // keep circling the way it was going, climbing, until it is in front of the trunk
      const th0 = Math.atan2(h.z, h.x - TRUNK_X);
      const thBack = Math.atan2(back.z, back.x - TRUNK_X);
      let dth = th0 - thBack;
      dth = ((dth + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      const slope0 = Math.max(-35, Math.min(50, (h.y - back.y) / (Math.abs(dth) > 0.01 ? dth : 0.01)));
      const turn = ((((Math.PI / 2 - th0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) + 0.0001;
      const steps = Math.ceil(turn * 30);
      let yb = h.y - TILT * Math.sin(th0);
      for (let i = 1; i <= steps; i++) {
        const phi = (turn * i) / steps;
        const slope = slope0 + (-31 - slope0) * Math.min(1, phi);
        yb = Math.max(612, yb + (slope * turn) / steps);
        const a = th0 + phi;
        raw.push({ x: TRUNK_X + RADIUS * Math.cos(a), y: yb + TILT * Math.sin(a), z: RADIUS * Math.sin(a) });
      }
      from = raw.at(-1) || h;
    }
    // carry on in the direction it was already heading (straight up, if it just reached the trunk's front)
    let dx = onTrunk ? 0 : from.x - back.x;
    let dy = onTrunk ? -1 : from.y - back.y;
    const dd = Math.hypot(dx, dy) || 1;
    const ctrl = [from, { x: from.x + (dx / dd) * 22, y: from.y + (dy / dd) * 22 }];
    // from the trunk it first climbs up into the crown
    if (onTrunk && apple.y < from.y - 120) ctrl.push({ x: TRUNK_X, y: Math.min(from.y - 60, 590) });
    // It stops just short of the apple on the side it comes from, facing it.
    const base = ctrl.at(-1);
    let ax = base.x - apple.x;
    let ay = base.y - apple.y;
    const ad = Math.hypot(ax, ay) || 1;
    ax /= ad;
    ay /= ad;
    if (ay < -0.2) ay = -0.2; // never park right on top of an apple: come at it from the side
    const an = Math.hypot(ax, ay) || 1;
    ax /= an;
    ay /= an;
    const goal = { x: apple.x + ax * (apple.r + 16), y: apple.y + ay * (apple.r + 16) };
    const pre = { x: goal.x + ax * 34, y: goal.y + ay * 34 };
    // then meanders across the leaves in a loose S rather than a straight line
    const ex = pre.x - base.x;
    const ey = pre.y - base.y;
    const el = Math.hypot(ex, ey) || 1;
    const bends = Math.floor(el / 105);
    let side = ex > 0 ? -1 : 1;
    for (let i = 1; i <= bends; i++) {
      const k = i / (bends + 1);
      ctrl.push({ x: base.x + ex * k + (-ey / el) * 38 * side, y: base.y + ey * k + (ex / el) * 38 * side });
      side = -side;
    }
    ctrl.push(pre, goal);
    raw.push(...spline(ctrl, 14, 6, 84, from.z, 22).slice(1));
    return makePath([h, ...raw]);
  }

  function routeHome() {
    const h = trail.at(-1);
    const back = behindHead(10);
    const dx = h.x - back.x;
    const dy = h.y - back.y;
    const dd = Math.hypot(dx, dy) || 1;
    const join = at(REJOIN);
    const before = at(REJOIN - 34);
    const ctrl = [
      h,
      { x: h.x + (dx / dd) * 20, y: h.y + (dy / dd) * 20 },
      { x: (h.x + before.x) / 2 + 16, y: Math.max(h.y, before.y) - 10 },
      before,
      join,
    ];
    const raw = spline(ctrl, 14, 3, 70, h.z, 22);
    raw[raw.length - 1].z = join.z;
    return makePath([h, ...raw.slice(1)]);
  }

  function goTo(node) {
    const p = fruitPos(node);
    if (!p) return;
    chosen = { node, x: p.x, y: p.y, r: fruitRadius(node) };
    route = routeToApple(chosen);
    routeS = 0;
    pausedFor = 0;
    mode = "seek";
  }
  function goHome() {
    chosen = null;
    route = routeHome();
    routeS = 0;
    mode = "home";
  }
  const fruitNodes = [...document.querySelectorAll(".fruit")];
  const onSelection = () => {
    if (reduceMotion) return;
    const active = fruitNodes.find((n) => n.classList.contains("is-active"));
    if (active && (!chosen || chosen.node !== active)) goTo(active);
    else if (!active && chosen) goHome();
  };
  const watcher = new MutationObserver(onSelection);
  fruitNodes.forEach((n) => watcher.observe(n, { attributes: true, attributeFilter: ["class"] }));

  document.querySelectorAll(".fruit").forEach((node) => {
    const look = () => {
      lookTarget = fruitPos(node);
      if (clock - flick.start > 0.8) flick.start = clock; // it notices
    };
    node.addEventListener("pointerenter", look);
    node.addEventListener("focus", look);
    node.addEventListener("pointerleave", () => (lookTarget = null));
    node.addEventListener("blur", () => (lookTarget = null));
  });

  // ---------- frame ----------
  function draw() {
    // sample the body from head to tail
    const pts = [];
    {
      let i = trail.length - 1;
      let acc = 0;
      for (let k = 0; k <= SEGMENTS; k++) {
        const want = (k / SEGMENTS) * LENGTH;
        while (i > 0 && acc + dist3(trail[i], trail[i - 1]) < want) {
          acc += dist3(trail[i], trail[i - 1]);
          i--;
        }
        let p;
        if (i > 0) {
          const a = trail[i];
          const b = trail[i - 1];
          const t = (want - acc) / (dist3(a, b) || 1);
          p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
        } else p = { ...trail[0] };
        p.u = k / SEGMENTS;
        pts.push(p);
      }
    }
    // reach toward the apple with the neck: at the branch tip, or at an apple someone picked
    const target = chosen || lookTarget || DEFAULT_APPLE;
    if (lean > 0.001) {
      const h = pts[0];
      const dx = target.x - h.x;
      const dy = target.y - h.y;
      const d = Math.hypot(dx, dy) || 1;
      // the neck bobs a little toward the apple while it waits
      const reach = Math.min(24, d * 0.3) * lean * (1 + 0.16 * Math.sin(clock * 1.7) * idle);
      for (const p of pts) {
        const k = Math.max(0, 1 - p.u / 0.2);
        const e = k * k * (3 - 2 * k);
        p.x += (dx / d) * reach * e;
        p.y += (dy / d) * reach * e;
      }
    }
    // While it waits it never goes completely still: a slow wave runs down the
    // body toward the tail, and the head sways as if looking around.
    if (idle > 0.01) {
      const base = pts.map((p) => ({ x: p.x, y: p.y }));
      for (let i = 0; i < pts.length; i++) {
        const a = base[Math.max(i - 1, 0)];
        const b = base[Math.min(i + 1, pts.length - 1)];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const nx = -(a.y - b.y) / d;
        const ny = (a.x - b.x) / d;
        const u = pts[i].u;
        const env = Math.sin(Math.min(1, u / 0.14) * (Math.PI / 2)) * (0.55 + 0.9 * u);
        const wave = Math.sin(((u * LENGTH) / 72) * Math.PI * 2 - clock * 2.3) * 3.4 * env;
        const look = Math.sin(clock * 1.25) * 5.5 * Math.pow(Math.max(0, 1 - u / 0.3), 2);
        const off = idle * (wave + look);
        pts[i].x += nx * off;
        pts[i].y += ny * off;
      }
    }

    // tangents, normals (pointing to the snake's upper side), widths
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(i - 1, 0)];
      const b = pts[Math.min(i + 1, pts.length - 1)];
      let tx = a.x - b.x;
      let ty = a.y - b.y; // toward the head
      const d = Math.hypot(tx, ty) || 1;
      tx /= d;
      ty /= d;
      let nx = -ty;
      let ny = tx;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      const p = pts[i];
      p.tx = tx;
      p.ty = ty;
      p.nx = nx;
      p.ny = ny;
      p.w = widthAt(p.u) * (1 + (p.z / RADIUS) * 0.07);
    }

    // The whole body is always drawn, unbroken, in the layer behind the trunk.
    // Stretches that pass in front of the trunk are drawn again on top of it.
    // They switch over at the trunk's sides (depth 0), where both layers show
    // the identical body, so the joins can't be seen.
    const runs = [{ front: false, pts }];
    let cur = null;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].z >= 0) {
        if (!cur) {
          cur = { front: true, pts: i > 0 ? [pts[i - 1]] : [] };
          runs.push(cur);
        }
        cur.pts.push(pts[i]);
      } else if (cur) {
        cur.pts.push(pts[i]); // overlap one point past the switch
        cur = null;
      }
    }

    const counts = new Map();
    const next = (layer, cls) => {
      const key = layer === layers.front ? `f${cls}` : `b${cls}`;
      const n = counts.get(key) || 0;
      counts.set(key, n + 1);
      return n;
    };
    for (const run of runs) {
      if (run.pts.length < 2) continue;
      const layer = run.front ? layers.front : layers.back;
      if (layer.shadow) {
        // keep the cast shadow off the cut ends, where it would show as a seam
        const first = run.pts[0] === pts[0] ? 0 : 4;
        const last = run.pts.at(-1) === pts.at(-1) ? run.pts.length : run.pts.length - 4;
        const shade = run.pts.slice(first, last);
        if (shade.length > 1) take(layer, "shadow", "snake-shadow-path", next(layer, "snake-shadow-path")).setAttribute("d", ribbon(shade, 1, 0, 1));
      }
      // A coil seen from the side overlaps itself, and one outline crossing
      // itself would leave holes. Short overlapping pieces, tail first, don't.
      const n = run.pts.length;
      for (let end = n; end > 1; end -= CHUNK) {
        const piece = run.pts.slice(Math.max(0, end - CHUNK - 2), end);
        if (piece.length < 2) continue;
        take(layer, "body", "snake-body-path", next(layer, "snake-body-path")).setAttribute("d", ribbon(piece, 1, 0, 1));
        take(layer, "body", "snake-belly-path", next(layer, "snake-belly-path")).setAttribute("d", ribbon(piece, -1, 0.3, 0.38));
        take(layer, "body", "snake-sheen-path", next(layer, "snake-sheen-path")).setAttribute("d", ribbon(piece, 1, 0.26, 0.16));
      }
    }
    // dorsal diamonds, fixed to the body so they travel with it
    const phase = headS % 22;
    for (let s = phase + 26; s < LENGTH * 0.93; s += 22) {
      const i = Math.round((s / LENGTH) * SEGMENTS);
      const p = pts[Math.min(i, SEGMENTS)];
      const layer = p.z >= 0 ? layers.front : layers.back;
      const len = p.w * 0.34;
      const half = p.w * 0.36;
      const cx = p.x + p.nx * p.w * 0.06;
      const cy = p.y + p.ny * p.w * 0.06;
      const d =
        `M${fmt(cx + p.tx * len / 2)},${fmt(cy + p.ty * len / 2)}` +
        `L${fmt(cx + p.nx * half)},${fmt(cy + p.ny * half)}` +
        `L${fmt(cx - p.tx * len / 2)},${fmt(cy - p.ty * len / 2)}` +
        `L${fmt(cx - p.nx * half)},${fmt(cy - p.ny * half)}Z`;
      take(layer, "marks", "snake-mark", next(layer, "snake-mark")).setAttribute("d", d);
      const fl = p.w * 0.1;
      const fx = cx + p.tx * p.w * 0.42;
      const fy = cy + p.ty * p.w * 0.42;
      take(layer, "marks", "snake-fleck", next(layer, "snake-fleck")).setAttribute(
        "d",
        `M${fmt(fx + p.tx * fl)},${fmt(fy + p.ty * fl)}L${fmt(fx + p.nx * fl * 0.7)},${fmt(fy + p.ny * fl * 0.7)}L${fmt(fx - p.tx * fl)},${fmt(fy - p.ty * fl)}L${fmt(fx - p.nx * fl * 0.7)},${fmt(fy - p.ny * fl * 0.7)}Z`
      );
    }
    for (const layer of [layers.back, layers.front]) {
      for (const cls of ["snake-shadow-path", "snake-body-path", "snake-belly-path", "snake-sheen-path", "snake-mark", "snake-fleck"]) {
        const key = layer === layers.front ? `f${cls}` : `b${cls}`;
        hideFrom(layer, cls, counts.get(key) || 0);
      }
    }

    // head
    const h = pts[0];
    const front = h.z >= 0;
    const head = front ? heads.front : heads.back;
    heads.front.g.setAttribute("visibility", front ? "visible" : "hidden");
    heads.back.g.setAttribute("visibility", front ? "hidden" : "visible");
    const w = h.w * 1.08;
    let angle = (Math.atan2(h.ty, h.tx) * 180) / Math.PI;
    const flip = h.tx < 0 ? -1 : 1; // keep the eye on top whichever way it faces
    head.g.setAttribute(
      "transform",
      `translate(${fmt(h.x)} ${fmt(h.y)}) rotate(${angle.toFixed(1)}) scale(1 ${flip})`
    );
    head.shape.setAttribute("d", headShape(w));
    const k = (n) => fmt(n * w);
    head.jaw.setAttribute("d", `M${k(0.35)},${k(0.3)} Q${k(1.2)},${k(0.42)} ${k(1.8)},${k(0.14)}`);
    head.crown.setAttribute("d", `M${k(-0.15)},${k(-0.2)} L${k(0.42)},${k(-0.02)} L${k(-0.15)},${k(0.16)} L${k(0.12)},${k(-0.02)} Z`);
    head.outline.setAttribute(
      "d",
      `M${k(1.62)},${k(-0.44)} C${k(1.82)},${k(-0.3)} ${k(1.93)},${k(-0.16)} ${k(1.94)},${k(-0.02)} C${k(1.92)},${k(0.22)} ${k(1.72)},${k(0.4)} ${k(1.5)},${k(0.48)}`
    );
    head.brow.setAttribute("d", `M${k(0.82)},${k(-0.5)} Q${k(1.14)},${k(-0.62)} ${k(1.42)},${k(-0.42)}`);
    head.eye.setAttribute("cx", k(1.12));
    head.eye.setAttribute("cy", k(-0.25));
    head.eye.setAttribute("r", k(0.21));
    // pupil looks at the apple, in head-local coordinates
    const a = (angle * Math.PI) / 180;
    const ex = h.x + Math.cos(a) * 1.12 * w;
    const ey = h.y + Math.sin(a) * 1.12 * w;
    let lx = target.x - ex;
    let ly = target.y - ey;
    const ld = Math.hypot(lx, ly) || 1;
    const localX = (lx * Math.cos(a) + ly * Math.sin(a)) / ld;
    const localY = ((-lx * Math.sin(a) + ly * Math.cos(a)) / ld) * flip;
    head.pupil.setAttribute("cx", fmt((1.12 + localX * 0.07) * w));
    head.pupil.setAttribute("cy", fmt((-0.25 + localY * 0.07) * w));
    head.pupil.setAttribute("rx", k(0.095));
    head.pupil.setAttribute("ry", k(0.105));
    head.glint.setAttribute("cx", k(1.05));
    head.glint.setAttribute("cy", k(-0.32));
    head.glint.setAttribute("r", k(0.05));
    head.nostril.setAttribute("cx", k(1.6));
    head.nostril.setAttribute("cy", k(-0.12));
    head.nostril.setAttribute("r", k(0.045));
    // tongue: two quick flutters per flick
    const ft = clock - flick.start;
    let out = 0;
    if (flick.start >= 0 && ft < flick.dur) {
      const env = Math.sin((ft / flick.dur) * Math.PI);
      out = env * (0.75 + 0.25 * Math.sin((ft / flick.dur) * Math.PI * 4)) * 1.0 * w;
    }
    if (out > 0.3) {
      const x0 = 1.82 * w;
      const x1 = x0 + out;
      const fork = Math.min(out, 0.38 * w);
      head.tongue.setAttribute(
        "d",
        `M${fmt(x0)},0 L${fmt(x1)},0 M${fmt(x1)},0 l${fmt(fork)},${fmt(-fork * 0.55)} M${fmt(x1)},0 l${fmt(fork)},${fmt(fork * 0.55)}`
      );
      head.tongue.setAttribute("stroke-width", fmt(0.1 * w));
      head.tongue.removeAttribute("visibility");
    } else head.tongue.setAttribute("visibility", "hidden");
  }

  function step(dt) {
    clock += dt;
    const resting = mode === "hold" || (mode === "loop" && pausedFor > 0);
    idle += ((resting ? 1 : 0) - idle) * Math.min(1, dt * (resting ? 1.2 : 3));
    if (mode === "seek" || mode === "home") {
      const left = route.length - routeS;
      const top = mode === "seek" ? SEEK_SPEED : HOME_SPEED;
      const v = top * Math.max(0.3, Math.min(1, left / 70, (routeS + 20) / 60));
      routeS = Math.min(route.length, routeS + v * dt);
      pushHead(route.pointAt(routeS));
      lean = mode === "seek" && left < 50 ? Math.min(1, lean + dt * 1.5) : Math.max(0, lean - dt * 2);
      if (routeS >= route.length) {
        if (mode === "seek") {
          mode = "hold";
          flick.start = clock + 0.3;
          nextFlick = clock + 1.8;
        } else {
          mode = "loop";
          headS = REJOIN;
        }
      }
    } else if (mode === "hold") {
      lean = Math.min(1, lean + dt * 1.4);
    } else {
      const toPause = (((PAUSE_AT - headS) % TRACK) + TRACK) % TRACK;
      if (pausedFor > 0) {
        pausedFor -= dt;
        lean = Math.min(1, lean + dt * 1.4);
        if (pausedFor < 0.9) lean = Math.max(0, pausedFor / 0.9);
      } else {
        // ease into the stop at the branch tip
        const slow = toPause < 60 ? 0.35 + 0.65 * (toPause / 60) : 1;
        const move = SPEED * slow * dt;
        if (toPause > 0 && toPause <= move) {
          headS += toPause;
          pausedFor = PAUSE;
          flick.start = clock + 0.7;
          nextFlick = clock + 2.2;
        } else headS += move;
        lean = Math.max(0, lean - dt * 2);
      }
      pushHead(at(headS));
    }
    if (clock > nextFlick) {
      flick.start = clock;
      nextFlick = clock + (mode === "hold" ? 1.6 + Math.random() * 1.6 : 2.6 + Math.random() * 3.2);
    }
  }

  if (reduceMotion) {
    draw();
    return;
  }

  let visible = true;
  const stage = document.getElementById("treeStage");
  if (stage && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    }).observe(stage);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (visible) {
      step(dt);
      draw();
    }
    requestAnimationFrame(frame);
  }
  draw();
  requestAnimationFrame(frame);
})();
