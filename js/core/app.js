/* Rdzeń aplikacji: rejestr scen, przejścia, HUD postępu, okna dialogowe,
   obsługa błędów i tryb kiosku. */
(function () {
  "use strict";
  const BW = window.BW;
  const C = window.BW_CONFIG || {};
  const T = BW.TEXT;

  const scenes = {};
  BW.registerScene = (id, def) => { scenes[id] = def; };

  const stage = document.getElementById("stage");
  const sr = document.getElementById("sr");
  let current = null;
  let transitioning = false;

  /* ---------- API przekazywane scenom ---------- */
  function makeApi(sc) {
    const timers = new Set();
    const loops = new Set();
    const api = {
      T, C,
      sfx: BW.audio.sfx,
      haptic: BW.haptic,
      state: BW.state,
      go,
      after(ms, fn) {
        const id = setTimeout(() => { timers.delete(id); if (sc.alive) fn(); }, ms);
        timers.add(id);
        return id;
      },
      wait(ms) { return new Promise((r) => api.after(ms, r)); },
      every(ms, fn) {
        const id = setInterval(() => { if (sc.alive) fn(); else clearInterval(id); }, ms);
        timers.add(id);
        return id;
      },
      /* pętla animacji; fn(dt, t) — zwraca funkcję zatrzymującą */
      loop(fn) {
        const L = { id: 0, stopped: false };
        let last = performance.now();
        const tick = (t) => {
          if (!sc.alive || L.stopped) return;
          const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
          last = t;
          try { fn(dt, t); } catch (e) { L.stopped = true; throw e; }
          if (!L.stopped) L.id = requestAnimationFrame(tick);
        };
        L.id = requestAnimationFrame(tick);
        loops.add(L);
        return () => { L.stopped = true; cancelAnimationFrame(L.id); loops.delete(L); };
      },
      complete(stageId, progress) {
        BW.state.complete(stageId, progress);
        updateHud();
      },
      /* Komunikat systemu z efektem pisania */
      say(el, text, kind, opts) {
        const o = opts || {};
        el.hidden = false;
        el.classList.remove("ok", "warn", "info", "err");
        el.classList.add(kind || "info");
        el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
        if (sr) sr.textContent = text;
        if (el._typer) { clearInterval(el._typer); el._typer = null; }
        if (o.instant || BW.reducedMotion()) { el.textContent = text; return; }
        let i = 0;
        el.textContent = "";
        const step = Math.max(1, Math.round(text.length / 55));
        el._typer = setInterval(() => {
          if (!sc.alive) { clearInterval(el._typer); return; }
          i += step;
          el.textContent = text.slice(0, i);
          if (i >= text.length) { clearInterval(el._typer); el._typer = null; }
        }, 16);
        timers.add(el._typer);
      },
      reveal(el, scroll) {
        el.hidden = false;
        if (scroll !== false) {
          requestAnimationFrame(() => {
            try { el.scrollIntoView({ behavior: BW.reducedMotion() ? "auto" : "smooth", block: "nearest" }); } catch (e) { /* stare przeglądarki */ }
          });
        }
      },
      _dispose() {
        timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
        loops.forEach((L) => { L.stopped = true; cancelAnimationFrame(L.id); });
        timers.clear(); loops.clear();
      }
    };
    return api;
  }

  /* ---------- Nawigacja między scenami ---------- */
  function go(id, opts) {
    const o = opts || {};
    if (transitioning && !o.force) return;
    if (!scenes[id]) id = "intro";
    transitioning = true;
    BW.overlay.close(true);
    const prev = current;
    current = null;
    if (prev) {
      prev.sc.alive = false;
      try { prev.cleanup && prev.cleanup(); } catch (e) { console.error(e); }
      prev.api._dispose();
      prev.el.classList.add("leaving");
      setTimeout(() => prev.el.remove(), 320);
    }
    const mount = () => {
      const el = document.createElement("section");
      el.className = `scene scene-${id}`;
      el.setAttribute("data-scene", id);
      stage.appendChild(el);
      stage.scrollTop = 0;
      const sc = { alive: true };
      const api = makeApi(sc);
      let cleanup = null;
      try {
        cleanup = scenes[id].mount(el, api) || null;
      } catch (e) {
        console.error(e);
        showError();
      }
      current = { id, el, sc, api, cleanup };
      BW.state.set({ scene: id });
      document.body.setAttribute("data-scene", id);
      updateHud();
      const h = el.querySelector("h1, h2");
      if (h && !o.instant) { try { h.focus({ preventScroll: true }); } catch (e) { /* ignorujemy */ } }
      setTimeout(() => { transitioning = false; }, 260);
    };
    if (prev && !o.instant) setTimeout(mount, 200);
    else mount();
  }

  /* ---------- HUD ---------- */
  const hud = {
    fill: document.getElementById("hudFill"),
    pct: document.getElementById("hudPct"),
    bar: document.getElementById("hudBar"),
    status: document.getElementById("hudStatus"),
    steps: BW.$$("#hudSteps [data-s]")
  };
  let shownPct = 0, pctRaf = 0;
  function updateHud() {
    const d = BW.state.data;
    const p = d.progress;
    if (hud.fill) hud.fill.style.width = p + "%";
    if (hud.bar) hud.bar.setAttribute("aria-valuenow", String(p));
    hud.steps.forEach((s) => s.classList.toggle("on", !!d.done[s.getAttribute("data-s")]));
    if (hud.status) {
      hud.status.textContent = p >= 100 ? T.hud.online : p > 0 ? "BOOT…" : T.hud.offline;
      hud.status.classList.toggle("online", p >= 100);
      hud.status.classList.toggle("boot", p > 0 && p < 100);
    }
    document.body.classList.toggle("lab-online", p >= 100);
    BW.bg.setLevel(p / 100);
    // animowany licznik
    cancelAnimationFrame(pctRaf);
    const from = shownPct, t0 = performance.now(), D = 700;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / D);
      shownPct = Math.round(from + (p - from) * (1 - Math.pow(1 - k, 3)));
      if (hud.pct) hud.pct.textContent = shownPct;
      if (k < 1) pctRaf = requestAnimationFrame(tick);
    };
    pctRaf = requestAnimationFrame(tick);
  }

  /* ---------- Okno dialogowe ---------- */
  const ovRoot = document.getElementById("overlay");
  let ovClose = null, ovReturnFocus = null;
  BW.overlay = {
    open(html, opts) {
      const o = opts || {};
      ovReturnFocus = document.activeElement;
      ovRoot.innerHTML = `<div class="ov-backdrop"></div><div class="ov-card ${o.cls || ""}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
      ovRoot.classList.add("open");
      ovRoot.removeAttribute("aria-hidden");
      const card = ovRoot.querySelector(".ov-card");
      ovClose = o.onClose || null;
      if (o.dismissible !== false) {
        ovRoot.querySelector(".ov-backdrop").addEventListener("click", () => BW.overlay.close());
      }
      requestAnimationFrame(() => {
        const f = card.querySelector("button, a[href]") || card;
        try { f.focus({ preventScroll: true }); } catch (e) { /* ignorujemy */ }
      });
      return card;
    },
    close(silent) {
      if (!ovRoot.classList.contains("open")) return;
      ovRoot.classList.remove("open");
      ovRoot.setAttribute("aria-hidden", "true");
      const cb = ovClose; ovClose = null;
      setTimeout(() => { if (!ovRoot.classList.contains("open")) ovRoot.innerHTML = ""; }, 260);
      if (!silent && cb) cb();
      if (!silent && ovReturnFocus && ovReturnFocus.focus) { try { ovReturnFocus.focus({ preventScroll: true }); } catch (e) { /* ignorujemy */ } }
    },
    isOpen: () => ovRoot.classList.contains("open")
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && BW.overlay.isOpen()) {
      const card = ovRoot.querySelector(".ov-card");
      if (card && !card.hasAttribute("data-locked")) BW.overlay.close();
    }
  });

  /* Rozbłysk całego ekranu */
  BW.flash = () => {
    const f = document.createElement("div");
    f.className = "screen-flash";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1200);
  };

  /* ---------- Obsługa błędów ---------- */
  let errShown = false;
  function showError() {
    if (errShown) return;
    errShown = true;
    const t = document.createElement("div");
    t.className = "toast-err";
    t.setAttribute("role", "alert");
    t.innerHTML = `<span>${BW.esc(T.errors.generic)}</span><button class="btn btn-ghost btn-sm" type="button">${BW.esc(T.errors.restart)}</button>`;
    t.querySelector("button").addEventListener("click", () => {
      BW.state.reset();
      location.reload();
    });
    document.body.appendChild(t);
  }
  window.addEventListener("error", (e) => { if (e && e.error) { console.error(e.error); showError(); } });
  window.addEventListener("unhandledrejection", (e) => { console.error(e && e.reason); showError(); });

  /* ---------- Dźwięk / dotyk ---------- */
  function initMute() {
    const btn = document.getElementById("muteBtn");
    let m = BW.state.data.muted;
    if (m === null || m === undefined) m = !(C.sound && C.sound.enabledByDefault !== false);
    const apply = () => {
      BW.audio.setMuted(m);
      btn.innerHTML = BW.icon(m ? "soundOff" : "soundOn");
      btn.setAttribute("aria-label", m ? T.hud.unmute : T.hud.mute);
      btn.setAttribute("aria-pressed", String(m));
    };
    apply();
    btn.addEventListener("click", () => {
      m = !m;
      BW.state.set({ muted: m });
      apply();
      if (!m) BW.audio.sfx.select();
    });
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest(".btn, .tile, .block");
    if (b && !b.disabled) { BW.audio.sfx.click(); BW.haptic(8); }
  });

  /* ---------- Tryb kiosku ---------- */
  function initKiosk() {
    const limit = Number(C.kioskIdleResetSeconds) || 0;
    if (limit <= 0) return;
    let lastInput = Date.now();
    ["pointerdown", "keydown", "input", "scroll"].forEach((ev) =>
      window.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true })
    );
    setInterval(() => {
      if (BW.state.data.scene !== "intro" && Date.now() - lastInput > limit * 1000) {
        lastInput = Date.now();
        BW.state.reset();
        go("intro", { force: true });
      }
    }, 3000);
  }

  BW.app = {
    init() {
      const logo = document.getElementById("hudLogo");
      if (logo) {
        if (C.logo) logo.src = C.logo;
        else logo.remove();
      }
      const lbl = document.getElementById("hudLabel");
      if (lbl) lbl.textContent = T.hud.label;
      hud.steps.forEach((s) => { const k = s.getAttribute("data-s"); if (T.hud.steps[k]) s.textContent = T.hud.steps[k]; });
      initMute();
      initKiosk();
      shownPct = BW.state.data.progress;
      if (hud.pct) hud.pct.textContent = shownPct;
    },
    go,
    hasScene: (id) => !!scenes[id]
  };
})();
