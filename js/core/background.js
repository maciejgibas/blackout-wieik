/* Animowane tło: ścieżki PCB z impulsami energii.
   Jasność i liczba impulsów rosną wraz z postępem uruchamiania laboratorium. */
(function () {
  "use strict";
  const cv = document.getElementById("bg");
  if (!cv || !cv.getContext) { window.BW.bg = { setLevel() {}, burst() {} }; return; }
  const ctx = cv.getContext("2d");
  const GRID = 26;
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

  let W = 0, H = 0, dpr = 1, traces = [], pulses = [], layer = null;
  let level = 0.04, target = 0.04, last = 0, raf = 0, burst = 0;
  const still = window.BW.reducedMotion();

  function makeTrace() {
    const cols = Math.ceil(W / GRID), rows = Math.ceil(H / GRID);
    let x = Math.floor(Math.random() * cols) * GRID;
    let y = Math.floor(Math.random() * rows) * GRID;
    let dir = Math.floor(Math.random() * 4) * 2; // start poziomo/pionowo
    const pts = [[x, y]];
    const segs = 2 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segs; s++) {
      const n = 2 + Math.floor(Math.random() * 7);
      const d = DIRS[dir];
      x += d[0] * GRID * n;
      y += d[1] * GRID * n;
      pts.push([x, y]);
      dir = (dir + (Math.random() < 0.5 ? 1 : 7)) % 8;
    }
    let len = 0;
    const segLen = [];
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      segLen.push(l); len += l;
    }
    return { pts, segLen, len };
  }

  function pointAt(tr, d) {
    let acc = 0;
    for (let i = 0; i < tr.segLen.length; i++) {
      const l = tr.segLen[i];
      if (acc + l >= d) {
        const k = (d - acc) / l, a = tr.pts[i], b = tr.pts[i + 1];
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      }
      acc += l;
    }
    return tr.pts[tr.pts.length - 1];
  }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    traces = [];
    const n = Math.round((W * H) / 16000) + 14;
    for (let i = 0; i < n; i++) traces.push(makeTrace());
    pulses = [];

    layer = document.createElement("canvas");
    layer.width = cv.width; layer.height = cv.height;
    const l = layer.getContext("2d");
    l.setTransform(dpr, 0, 0, dpr, 0, 0);
    l.lineCap = "round"; l.lineJoin = "round";
    l.strokeStyle = "rgba(70,170,255,0.16)";
    l.lineWidth = 1.6;
    traces.forEach((t) => {
      l.beginPath();
      t.pts.forEach((p, i) => (i ? l.lineTo(p[0], p[1]) : l.moveTo(p[0], p[1])));
      l.stroke();
      [t.pts[0], t.pts[t.pts.length - 1]].forEach((p) => {
        l.beginPath(); l.arc(p[0], p[1], 3.2, 0, Math.PI * 2);
        l.fillStyle = "rgba(70,170,255,0.20)"; l.fill();
      });
    });
    // siatka punktów
    l.fillStyle = "rgba(90,170,255,0.06)";
    for (let x = 0; x < W; x += GRID) for (let y = 0; y < H; y += GRID) l.fillRect(x, y, 1, 1);
  }

  function draw(dt) {
    level += (target - level) * Math.min(1, dt * 1.5);
    if (burst > 0) burst = Math.max(0, burst - dt * 0.6);
    const L = Math.min(1.4, level + burst);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalAlpha = 0.35 + Math.min(1, L) * 0.65;
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const want = Math.round(2 + L * 34);
    while (pulses.length < want && traces.length) {
      pulses.push({ tr: traces[(Math.random() * traces.length) | 0], d: 0, v: 50 + Math.random() * 120 });
    }
    ctx.lineCap = "round";
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.d += p.v * dt * (0.6 + L);
      if (p.d > p.tr.len || pulses.length > want + 4) { pulses.splice(i, 1); continue; }
      const head = pointAt(p.tr, p.d), tail = pointAt(p.tr, Math.max(0, p.d - 26));
      const a = 0.25 + Math.min(1, L) * 0.6;
      ctx.strokeStyle = `rgba(45,226,255,${(a * 0.35).toFixed(3)})`;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(head[0], head[1]); ctx.stroke();
      ctx.strokeStyle = `rgba(190,245,255,${a.toFixed(3)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(head[0], head[1]); ctx.stroke();
    }
  }

  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    if (still) { draw(1); return; }
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  let rt = 0;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { build(); start(); }, 180);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else start();
  });

  build();
  start();

  window.BW.bg = {
    setLevel(x) { target = Math.max(0.04, Math.min(1, x)); if (still) { level = target; draw(1); } },
    burst() { burst = 0.8; }
  };
})();
