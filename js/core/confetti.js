/* Konfetti z małymi piorunami — rysowane na osobnym płótnie nad interfejsem */
(function () {
  "use strict";
  const cv = document.getElementById("fx");
  const COLORS = ["#2de2ff", "#3a7bff", "#ffd54a", "#3dffa8", "#ffffff", "#9b8cff"];
  let raf = 0;

  function bolt(c, s) {
    c.beginPath();
    c.moveTo(-1.5 * s, -6 * s); c.lineTo(3.5 * s, -6 * s); c.lineTo(1 * s, -1.2 * s);
    c.lineTo(4 * s, -1.2 * s); c.lineTo(-2.5 * s, 7 * s); c.lineTo(-0.6 * s, 0.8 * s);
    c.lineTo(-3.8 * s, 0.8 * s); c.closePath(); c.fill();
  }

  window.BW.confetti = function (opts) {
    if (!cv || !cv.getContext) return;
    const o = opts || {};
    const ctx = cv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    const reduced = window.BW.reducedMotion();
    const count = reduced ? 40 : o.count || 170;
    const parts = [];
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      parts.push({
        x: fromLeft ? -10 : W + 10,
        y: H * (0.55 + Math.random() * 0.25),
        vx: (fromLeft ? 1 : -1) * (180 + Math.random() * 420),
        vy: -(520 + Math.random() * 520),
        r: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 10,
        s: 1.6 + Math.random() * 1.8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        bolt: Math.random() < 0.55,
        wob: Math.random() * 6
      });
    }
    cancelAnimationFrame(raf);
    let last = performance.now();
    const t0 = last;
    const loop = (t) => {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      parts.forEach((p) => {
        p.vy += 900 * dt;
        p.vx *= 1 - 1.4 * dt;
        p.vy *= 1 - 0.9 * dt;
        p.x += (p.vx + Math.sin((t / 1000) * 3 + p.wob) * 30) * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        if (p.y < H + 30) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.bolt) bolt(ctx, p.s);
        else ctx.fillRect(-p.s * 2, -p.s, p.s * 4, p.s * 2);
        ctx.restore();
      });
      if (alive && t - t0 < 6000) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(loop);
  };
})();
