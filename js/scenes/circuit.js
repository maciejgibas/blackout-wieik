/* Zadanie 1 — zbuduj pierwszy obwód: wybór źródła energii + przesuwany przełącznik */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;

  const ICONS = {
    battery: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="13" y="11" width="22" height="31" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><rect x="19" y="5" width="10" height="6" rx="1.5" fill="currentColor"/><path d="M26 17l-6 9h6l-4 9" fill="none" stroke="#ffd54a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    potato: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 28c-2-10 6-18 16-17 10 1 15 8 13 16-2 9-10 13-18 12-6-1-10-5-11-11z" fill="#c9a063" stroke="#8a6532" stroke-width="2"/><circle cx="19" cy="22" r="1.6" fill="#7a5426"/><circle cx="28" cy="30" r="1.6" fill="#7a5426"/><circle cx="31" cy="20" r="1.3" fill="#7a5426"/><circle cx="18" cy="33" r="1.3" fill="#7a5426"/></svg>`,
    tea: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 18h24v14a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M34 22h3a4 4 0 0 1 0 8h-3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 22h20v10a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z" fill="#b5651d" opacity=".55"/><path class="steam" d="M17 13c-2-2 2-4 0-7M23 13c-2-2 2-4 0-7M29 13c-2-2 2-4 0-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>`
  };

  const ART = `
  <svg class="circuit-svg" viewBox="0 0 320 210" role="img" aria-label="Schemat obwodu: źródło zasilania, przewody, wyłącznik i żarówka">
    <defs>
      <radialGradient id="bulbGlow">
        <stop offset="0" stop-color="#fff7c9" stop-opacity=".95"/>
        <stop offset=".35" stop-color="#ffd54a" stop-opacity=".5"/>
        <stop offset="1" stop-color="#ffb000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="glow" cx="270" cy="104" r="62" fill="url(#bulbGlow)"/>
    <g class="wires">
      <path d="M50 91 V40 H130"/>
      <path d="M190 40 H270 V84"/>
      <path d="M270 138 V180 H50 V128"/>
    </g>
    <g class="flow">
      <path d="M50 91 V40 H130"/>
      <path d="M190 40 H270 V84"/>
      <path d="M270 138 V180 H50 V128"/>
    </g>
    <!-- gniazdo baterii -->
    <rect class="slot" x="31" y="88" width="38" height="44" rx="6"/>
    <text class="slot-q" x="50" y="116">?</text>
    <g class="battery">
      <rect class="batt-body" x="36" y="96" width="28" height="32" rx="4"/>
      <rect class="batt-tip" x="44" y="91" width="12" height="5" rx="1.5"/>
      <path class="batt-bolt" d="M52 102 l-5 8 h5 l-3 8"/>
    </g>
    <text class="lbl" x="78" y="114">ŹRÓDŁO</text>
    <!-- wyłącznik -->
    <circle class="contact" cx="130" cy="40" r="4.5"/>
    <circle class="contact" cx="190" cy="40" r="4.5"/>
    <line class="lever" x1="130" y1="40" x2="190" y2="40"/>
    <text class="lbl" x="160" y="62" text-anchor="middle">WYŁĄCZNIK</text>
    <!-- żarówka -->
    <g class="rays">
      <path d="M270 62 v-10 M300 74 l7 -7 M240 74 l-7 -7 M312 104 h10 M228 104 h-10 M300 134 l7 7 M240 134 l-7 7"/>
    </g>
    <circle class="glass" cx="270" cy="104" r="20"/>
    <path class="filament" d="M262 108 l3 -9 l5 9 l5 -9 l3 9"/>
    <path class="support" d="M262 108 V121 M278 108 V121"/>
    <rect class="base" x="261" y="121" width="18" height="17" rx="2.5"/>
    <path class="base-lines" d="M261 126 h18 M261 131 h18"/>
    <text class="lbl" x="262" y="160" text-anchor="end">ŻARÓWKA</text>
  </svg>`;

  BW.registerScene("circuit", {
    mount(el, api) {
      const T = api.T.circuit;
      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title)}
        <div class="art art-circuit">${ART}</div>
        <div class="tiles" role="group" aria-label="Źródło energii">
          ${["battery", "potato", "tea"].map((k) => `
            <button class="tile" type="button" data-k="${k}">
              <span class="tile-ico">${ICONS[k]}</span>
              <span class="tile-lbl">${esc(T.options[k].label)}</span>
            </button>`).join("")}
        </div>
        <div class="switch-box locked">
          <div class="slide-switch" data-sw>
            <div class="sw-fill"></div>
            <span class="sw-text">${esc(T.switchHint)} →</span>
            <span class="sw-text-on">${esc(T.switchOn)}</span>
            <button class="sw-knob" type="button" role="switch" aria-checked="false" aria-label="${esc(T.switchHint)}">${BW.icon("bolt")}</button>
          </div>
        </div>
        <div class="sys"></div>
        <div class="result" hidden></div>
        <div class="cta" hidden><button class="btn btn-primary" type="button" data-next><span>${esc(T.next)}</span>${BW.icon("arrow")}</button></div>`;

      const svg = el.querySelector(".circuit-svg");
      const sys = el.querySelector(".sys");
      const tiles = BW.$$(".tile", el);
      const box = el.querySelector(".switch-box");
      const sw = el.querySelector("[data-sw]");
      const knob = el.querySelector(".sw-knob");
      const result = el.querySelector(".result");
      const cta = el.querySelector(".cta");

      let hasBattery = false, closed = false;
      api.say(sys, T.start, "info");

      /* --- wybór źródła energii --- */
      tiles.forEach((t) =>
        t.addEventListener("click", () => {
          if (hasBattery) return;
          const k = t.getAttribute("data-k");
          if (k === "battery") {
            hasBattery = true;
            t.classList.add("selected");
            tiles.forEach((x) => { if (x !== t) x.disabled = true; });
            svg.classList.add("has-battery");
            box.classList.remove("locked");
            api.sfx.good();
            api.haptic(25);
            api.say(sys, `${T.options.battery.msg} ${T.nowSwitch}`, "ok");
            api.after(400, () => box.classList.add("hint"));
          } else {
            t.classList.add("tried");
            t.classList.remove("wiggle"); void t.offsetWidth; t.classList.add("wiggle");
            if (k === "tea") api.sfx.error(); else api.sfx.soft();
            api.haptic([15, 40, 15]);
            api.say(sys, T.options[k].msg, k === "tea" ? "warn" : "info");
          }
        })
      );

      /* --- przesuwany przełącznik --- */
      let dragging = false, moved = false, startX = 0, startPos = 0, pos = 0;
      const maxPos = () => Math.max(1, sw.clientWidth - knob.offsetWidth - 8);
      const setPos = (p, animate) => {
        const m = maxPos();
        pos = BW.clamp(p, 0, m);
        sw.classList.toggle("anim", !!animate);
        knob.style.transform = `translateX(${pos}px)`;
        const f = pos / m;
        sw.style.setProperty("--f", f.toFixed(3));
        svg.style.setProperty("--f", f.toFixed(3));
      };
      setPos(0);

      const lockedNudge = () => {
        api.sfx.error();
        api.haptic([20, 30, 20]);
        sw.classList.remove("shake"); void sw.offsetWidth; sw.classList.add("shake");
        api.say(sys, T.lockedSwitch, "warn");
      };

      const close = () => {
        if (closed) return;
        closed = true;
        setPos(maxPos(), true);
        sw.classList.add("on");
        knob.setAttribute("aria-checked", "true");
        knob.disabled = true;
        svg.classList.add("closed");
        box.classList.remove("hint");
        api.sfx.success();
        api.haptic([30, 40, 70]);
        BW.bg.burst();
        api.complete("circuit", 25);
        api.say(sys, T.fact, "ok");
        result.innerHTML = BW.winBanner(T.win, "Postęp laboratorium: 25%");
        api.after(350, () => { api.reveal(result, false); api.reveal(cta); });
      };

      knob.addEventListener("pointerdown", (e) => {
        if (closed) return;
        if (!hasBattery) { lockedNudge(); return; }
        dragging = true; moved = false;
        startX = e.clientX; startPos = pos;
        try { knob.setPointerCapture(e.pointerId); } catch (err) { /* ignorujemy */ }
        sw.classList.add("dragging");
      });
      knob.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 5) moved = true;
        setPos(startPos + dx);
        if (pos >= maxPos() * 0.96) { dragging = false; sw.classList.remove("dragging"); close(); }
      });
      const end = () => {
        if (!dragging) return;
        dragging = false;
        sw.classList.remove("dragging");
        if (!moved || pos > maxPos() * 0.7) close();
        else { setPos(0, true); api.sfx.soft(); }
      };
      knob.addEventListener("pointerup", end);
      knob.addEventListener("pointercancel", end);
      knob.addEventListener("lostpointercapture", end);
      // klawiatura (Enter/Spacja) — kliknięcie bez wskaźnika
      knob.addEventListener("click", (e) => {
        if (e.detail !== 0 || closed) return;
        if (!hasBattery) lockedNudge(); else close();
      });
      // dotknięcie toru (poza gałką)
      sw.addEventListener("click", (e) => {
        if (e.target.closest(".sw-knob") || closed) return;
        if (!hasBattery) lockedNudge(); else close();
      });

      const onResize = () => { if (closed) setPos(maxPos()); };
      window.addEventListener("resize", onResize);

      el.querySelector("[data-next]").addEventListener("click", () => api.go("motor"));
      return () => window.removeEventListener("resize", onResize);
    }
  });
})();
