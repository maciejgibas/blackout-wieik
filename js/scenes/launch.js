/* Finał — panel sterowania i uruchomienie całego laboratorium */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;
  const ARC = Math.PI * 62; // długość łuku wskaźnika

  const miniRotor = (cx, cy) => `
    <g class="m-motor">
      <circle cx="${cx}" cy="${cy}" r="27" class="m-house"/>
      <g class="m-rotor" style="transform-origin:${cx}px ${cy}px">
        <circle cx="${cx}" cy="${cy}" r="17" class="m-rot"/>
        <path d="M${cx} ${cy} L${cx} ${cy - 16} M${cx} ${cy} L${cx + 13.9} ${cy + 8} M${cx} ${cy} L${cx - 13.9} ${cy + 8}" class="m-spoke"/>
        <circle cx="${cx}" cy="${cy}" r="4" class="m-shaft"/>
      </g>
    </g>`;

  const ART = `
  <svg class="lab-svg" viewBox="0 0 320 170" role="img" aria-label="Wizualizacja laboratorium: silniki, diody LED i wskaźnik sprawności">
    <g class="wires">
      <path d="M24 44 H296"/><path d="M42 44 V92"/><path d="M278 44 V92"/>
      <path d="M69 128 H98"/><path d="M222 128 H251"/><path d="M160 44 V62"/>
    </g>
    <g class="flow">
      <path d="M24 44 H296"/><path d="M42 44 V92"/><path d="M278 44 V92"/>
      <path d="M69 128 H98"/><path d="M222 128 H251"/><path d="M160 44 V62"/>
    </g>
    <g class="leds">${Array.from({ length: 9 }, (_, i) => `<circle class="lab-led" cx="${32 + i * 32}" cy="22" r="6"/>`).join("")}</g>
    ${miniRotor(42, 120)}
    ${miniRotor(278, 120)}
    <path class="g-track" d="M98 128 A62 62 0 0 1 222 128"/>
    <path class="g-val" d="M98 128 A62 62 0 0 1 222 128" style="stroke-dasharray:0 ${ARC.toFixed(1)}"/>
    <text class="g-num" x="160" y="122" text-anchor="middle">0%</text>
    <text class="g-lbl" x="160" y="142" text-anchor="middle">SPRAWNOŚĆ</text>
  </svg>`;

  BW.registerScene("launch", {
    mount(el, api) {
      const T = api.T.launch;
      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title)}
        <div class="panel">
          <div class="panel-title"><span class="dot"></span>${esc(T.panelTitle)}</div>
          <ul class="sys-list">
            ${T.systems.map((s, i) => `
              <li style="--d:${0.1 + i * 0.12}s">
                <span class="sl-ico">${BW.icon(s.icon)}</span>
                <span class="sl-name">${esc(s.name)}</span>
                <span class="sl-status">${BW.icon("check")}${esc(s.status)}</span>
              </li>`).join("")}
          </ul>
        </div>
        <div class="launch-zone">
          <button class="launch-btn" type="button" data-launch>
            <span class="lb-ring"></span><span class="lb-ring r2"></span>
            <span class="lb-inner">${BW.icon("power")}<b>${esc(T.button)}</b></span>
          </button>
        </div>
        <div class="art art-lab">${ART}</div>
        <div class="result" hidden></div>
        <div class="cta" hidden><button class="btn btn-primary" type="button" data-next>${BW.icon("gift")}<span>${esc(T.next)}</span>${BW.icon("arrow")}</button></div>`;

      const svg = el.querySelector(".lab-svg");
      const leds = BW.$$(".lab-led", svg);
      const gVal = svg.querySelector(".g-val");
      const gNum = svg.querySelector(".g-num");
      const btn = el.querySelector("[data-launch]");
      const zone = el.querySelector(".launch-zone");
      const result = el.querySelector(".result");
      const cta = el.querySelector(".cta");
      let launched = false;

      const setGauge = (p) => {
        gVal.style.strokeDasharray = `${((ARC * p) / 100).toFixed(1)} ${ARC.toFixed(1)}`;
        gNum.textContent = Math.round(p) + "%";
      };

      btn.addEventListener("click", async () => {
        if (launched) return;
        launched = true;
        btn.disabled = true;
        btn.classList.add("pressed");
        api.sfx.power();
        api.haptic([20, 30, 20, 30, 90]);
        BW.flash();
        BW.bg.burst();
        el.classList.add("powering");
        api.reveal(el.querySelector(".art-lab"));
        svg.classList.add("on-wires");
        await api.wait(350);
        svg.classList.add("on-motors");
        leds.forEach((l, i) => api.after(i * 120, () => { l.classList.add("on"); api.sfx.tick(); }));

        await new Promise((res) => {
          const t0 = performance.now(), D = 2300;
          const stop = api.loop(() => {
            const k = Math.min(1, (performance.now() - t0) / D);
            setGauge((1 - Math.pow(1 - k, 3)) * 100);
            if (k >= 1) { stop(); res(); }
          });
        });

        api.complete("launch", 100);
        api.state.set({ finishedAt: api.state.data.finishedAt || Date.now() });
        el.classList.add("online");
        svg.classList.add("online");
        BW.flash();
        BW.confetti();
        api.sfx.fanfare();
        api.haptic([60, 50, 60, 50, 160]);
        zone.classList.add("gone");
        result.innerHTML = `
          ${BW.winBanner(T.win)}
          <div class="final-lines">${T.lines.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`;
        api.after(300, () => { api.reveal(result, false); api.reveal(cta); });
      });

      el.querySelector("[data-next]").addEventListener("click", () => api.go("finish"));
    }
  });
})();
