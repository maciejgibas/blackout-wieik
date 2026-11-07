/* Efekty dźwiękowe syntezowane w Web Audio — bez plików audio.
   Kontekst audio uruchamia się dopiero po pierwszym dotknięciu (wymóg iOS/Android). */
(function () {
  "use strict";
  let ctx = null, master = null, muted = false, hum = null;
  const VOL = 0.6;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : VOL;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }

  function unlock() {
    const c = ensure();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  }
  ["pointerdown", "touchend", "click", "keydown"].forEach((ev) =>
    window.addEventListener(ev, unlock, { passive: true, capture: true })
  );

  function tone(o) {
    const c = ensure();
    if (!c || muted || c.state !== "running") return;
    try {
      const t = c.currentTime + (o.delay || 0);
      const dur = o.dur || 0.12;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = o.type || "sine";
      osc.frequency.setValueAtTime(o.freq || 440, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t + (o.attack || 0.006));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch (e) { /* ignorujemy */ }
  }

  const sfx = {
    click() { tone({ freq: 900, to: 1300, type: "triangle", dur: 0.05, vol: 0.08 }); },
    tick() { tone({ freq: 1500, type: "sine", dur: 0.04, vol: 0.06 }); },
    select() { tone({ freq: 520, to: 780, type: "triangle", dur: 0.1, vol: 0.12 }); },
    soft() { tone({ freq: 420, to: 360, type: "triangle", dur: 0.14, vol: 0.1 }); },
    error() { tone({ freq: 190, to: 120, type: "sawtooth", dur: 0.22, vol: 0.06 }); },
    good() { [660, 990].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.14, vol: 0.13, delay: i * 0.08 })); },
    success() { [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: "triangle", dur: 0.24, vol: 0.14, delay: i * 0.09 })); },
    power() {
      tone({ freq: 70, to: 820, type: "sawtooth", dur: 1.1, vol: 0.05 });
      tone({ freq: 140, to: 1600, type: "sine", dur: 1.1, vol: 0.05 });
    },
    fanfare() {
      [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) =>
        tone({ freq: f, type: "triangle", dur: i === 6 ? 0.6 : 0.16, vol: 0.13, delay: i * 0.11 })
      );
    }
  };

  /* Szum pracującego silnika — częstotliwość zależy od prędkości */
  const humApi = {
    start() {
      const c = ensure();
      if (!c || hum) return;
      try {
        const o = c.createOscillator();
        const f = c.createBiquadFilter();
        const g = c.createGain();
        o.type = "sawtooth";
        o.frequency.value = 40;
        f.type = "lowpass";
        f.frequency.value = 300;
        g.gain.value = 0;
        o.connect(f); f.connect(g); g.connect(master);
        o.start();
        hum = { o, f, g };
      } catch (e) { hum = null; }
    },
    set(x) {
      if (!hum || !ctx) return;
      const t = ctx.currentTime;
      hum.o.frequency.setTargetAtTime(38 + x * 210, t, 0.06);
      hum.f.frequency.setTargetAtTime(260 + x * 1400, t, 0.06);
      hum.g.gain.setTargetAtTime(x < 0.01 ? 0 : 0.012 + x * 0.04, t, 0.08);
    },
    stop() {
      if (!hum || !ctx) { hum = null; return; }
      const h = hum; hum = null;
      try {
        h.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        h.o.stop(ctx.currentTime + 0.4);
      } catch (e) { /* ignorujemy */ }
    }
  };

  window.BW.audio = {
    unlock,
    sfx,
    hum: humApi,
    isMuted: () => muted,
    setMuted(m) {
      muted = !!m;
      if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : VOL, ctx.currentTime, 0.02);
    }
  };
})();
