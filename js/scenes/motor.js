/* Zadanie 2 — uruchom silnik: suwak sygnału sterującego (uproszczony PWM),
   zielona strefa 45–65% utrzymana przez 2 sekundy. */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;
  const ZONE_MIN = 45, ZONE_MAX = 65, HOLD = 2;
  const RING = 2 * Math.PI * 112;
  const MAX_DEG = 1260; // °/s przy 100%

  function coils() {
    let s = "";
    for (let i = 0; i < 6; i++) {
      const a = i * 60;
      s += `<g transform="rotate(${a} 120 120)"><rect class="coil" x="108" y="34" width="24" height="22" rx="5"/><path class="coil-wind" d="M111 40 h18 M111 45 h18 M111 50 h18"/></g>`;
    }
    return s;
  }

  const ART = `
  <svg class="motor-svg" viewBox="0 0 240 240" role="img" aria-label="Animowany silnik elektryczny">
    <defs>
      <radialGradient id="rotorG" cx=".4" cy=".35">
        <stop offset="0" stop-color="#5a6f8c"/><stop offset="1" stop-color="#1b2738"/>
      </radialGradient>
      <radialGradient id="coreGlow">
        <stop offset="0" stop-color="#2de2ff" stop-opacity=".45"/><stop offset="1" stop-color="#2de2ff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="ring-track" cx="120" cy="120" r="112"/>
    <circle class="ring-zone" cx="120" cy="120" r="112" transform="rotate(-90 120 120)" style="stroke-dasharray:${RING.toFixed(1)};stroke-dashoffset:${RING.toFixed(1)}"/>
    <circle class="housing-fins" cx="120" cy="120" r="100"/>
    <circle class="housing" cx="120" cy="120" r="94"/>
    <circle class="core-glow" cx="120" cy="120" r="90" fill="url(#coreGlow)"/>
    <g class="coils">${coils()}</g>
    <circle class="speed-ring" cx="120" cy="120" r="54"/>
    <g class="rotor">
      <circle cx="120" cy="120" r="46" fill="url(#rotorG)" stroke="#7fa6d6" stroke-width="1.5"/>
      <path class="mag-n" d="M120 120 L120 76 A44 44 0 0 1 158.1 142 Z"/>
      <path class="mag-s" d="M120 120 L158.1 142 A44 44 0 0 1 81.9 142 Z"/>
      <path class="mag-n2" d="M120 120 L81.9 142 A44 44 0 0 1 120 76 Z"/>
      <path class="rotor-spokes" d="M120 120 L120 78 M120 120 L156 141 M120 120 L84 141"/>
      <circle cx="120" cy="88" r="4" class="rotor-mark"/>
      <circle cx="120" cy="120" r="11" class="shaft"/>
      <circle cx="120" cy="120" r="4" class="shaft-in"/>
    </g>
  </svg>`;

  function pwmPath(v) {
    const P = 50, top = 6, bot = 34;
    const h = (v / 100) * P;
    let d = `M0 ${bot}`;
    for (let k = 0; k < 6; k++) {
      const x0 = k * P;
      if (h > 0.5) d += ` L${x0} ${bot} L${x0} ${top} L${(x0 + h).toFixed(1)} ${top} L${(x0 + h).toFixed(1)} ${bot}`;
      d += ` L${x0 + P} ${bot}`;
    }
    return d;
  }

  BW.registerScene("motor", {
    mount(el, api) {
      const T = api.T.motor;
      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title, T.text)}
        <div class="art art-motor">
          ${ART}
          <div class="motor-chip" data-chip>${esc(T.zoneOut)}</div>
        </div>
        <div class="control-card">
          <div class="ctrl-head">
            <span>${esc(T.sliderLabel)} <em>(PWM)</em></span>
            <output data-val>0%</output>
          </div>
          <svg class="pwm" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path data-pwm d="${pwmPath(0)}"/></svg>
          <div class="range" style="--v:0">
            <div class="range-track"><div class="range-zone"><span>${ZONE_MIN}–${ZONE_MAX}%</span></div><div class="range-fill"></div></div>
            <input type="range" min="0" max="100" step="1" value="0" aria-label="Sygnał sterujący silnika, od 0 do 100 procent" data-range>
          </div>
          <div class="range-scale"><span>0%</span><span>50%</span><span>100%</span></div>
          <p class="task">${BW.icon("clock")} ${esc(T.task)}</p>
        </div>
        <div class="sys"></div>
        <p class="note">${esc(T.note)}</p>
        <div class="result" hidden></div>
        <div class="cta" hidden><button class="btn btn-primary" type="button" data-next><span>${esc(T.next)}</span>${BW.icon("arrow")}</button></div>`;

      const svg = el.querySelector(".motor-svg");
      const rotor = svg.querySelector(".rotor");
      const coilEls = BW.$$(".coil", svg);
      const glow = svg.querySelector(".core-glow");
      const speedRing = svg.querySelector(".speed-ring");
      const ring = svg.querySelector(".ring-zone");
      const chip = el.querySelector("[data-chip]");
      const input = el.querySelector("[data-range]");
      const range = el.querySelector(".range");
      const out = el.querySelector("[data-val]");
      const pwm = el.querySelector("[data-pwm]");
      const sys = el.querySelector(".sys");
      const result = el.querySelector(".result");
      const cta = el.querySelector(".cta");

      let v = 0, w = 0, angle = 0, hold = 0, done = false, band = "", wasIn = false, lastHoldShown = -1;
      api.say(sys, T.comments.zero, "info", { instant: true });
      band = "zero";

      const bandOf = (x) =>
        x <= 0 ? "zero" : x < 35 ? "low" : x < ZONE_MIN ? "mid" : x <= ZONE_MAX ? "ok" : x < 90 ? "high" : "max";

      const onInput = () => {
        v = Number(input.value) || 0;
        out.textContent = v + "%";
        range.style.setProperty("--v", v);
        pwm.setAttribute("d", pwmPath(v));
        const b = bandOf(v);
        if (b !== band) {
          band = b;
          api.say(sys, T.comments[b], b === "ok" ? "ok" : b === "max" || b === "high" ? "warn" : "info", { instant: true });
        }
      };
      input.addEventListener("input", onInput);
      input.addEventListener("change", onInput);

      BW.audio.hum.start();

      api.loop((dt) => {
        const target = v / 100;
        w += (target - w) * Math.min(1, dt * (target > w ? 1.7 : 1.1));
        if (w < 0.0005) w = 0;
        angle = (angle + w * MAX_DEG * dt) % 360;
        rotor.setAttribute("transform", `rotate(${angle.toFixed(2)} 120 120)`);
        const g = Math.min(1, w * 1.4);
        const op = (0.14 + g * 0.86).toFixed(3);
        for (let i = 0; i < coilEls.length; i++) coilEls[i].style.opacity = op;
        glow.style.opacity = (g * 0.9).toFixed(3);
        speedRing.style.opacity = Math.max(0, (w - 0.25) * 1.2).toFixed(3);
        BW.audio.hum.set(w);

        if (done) return;
        const inZone = v >= ZONE_MIN && v <= ZONE_MAX;
        if (inZone) {
          if (!wasIn) { api.haptic(12); api.sfx.tick(); }
          hold += dt;
        } else {
          hold = Math.max(0, hold - dt * 3);
        }
        wasIn = inZone;
        const f = Math.min(1, hold / HOLD);
        ring.style.strokeDashoffset = (RING * (1 - f)).toFixed(1);
        svg.classList.toggle("in-zone", inZone);
        const shown = inZone ? Math.max(0, HOLD - hold).toFixed(1) : null;
        if (shown !== lastHoldShown) {
          lastHoldShown = shown;
          chip.textContent = inZone ? `${T.zoneIn} ${shown} s` : T.zoneOut;
          chip.classList.toggle("ok", inZone);
        }
        if (hold >= HOLD) success();
      });

      function success() {
        done = true;
        input.disabled = true;
        ring.style.strokeDashoffset = "0";
        svg.classList.add("done");
        chip.textContent = "SILNIK: ONLINE";
        chip.classList.add("ok");
        api.sfx.success();
        api.haptic([30, 40, 80]);
        BW.bg.burst();
        api.complete("motor", 50);
        api.say(sys, T.fact, "ok");
        result.innerHTML = BW.winBanner(T.win, "Postęp laboratorium: 50%");
        api.after(300, () => { api.reveal(result, false); api.reveal(cta); });
      }

      el.querySelector("[data-next]").addEventListener("click", () => api.go("mcu"));
      return () => BW.audio.hum.stop();
    }
  });
})();
