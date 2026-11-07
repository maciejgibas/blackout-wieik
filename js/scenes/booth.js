/* Zadanie 4 — wyzwanie na stoisku: rozmowa z obsługą i odnalezienie modelu 3D.
   Gra NIE udaje wykrywania przedmiotu — to zadanie oparte na interakcji z ludźmi. */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;

  function gearPath(cx, cy, teeth, rO, rI) {
    const step = (Math.PI * 2) / teeth;
    const pt = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      d += (i ? " L" : "M") + pt(rI, a);
      d += " L" + pt(rO, a + step * 0.14);
      d += " L" + pt(rO, a + step * 0.46);
      d += " L" + pt(rI, a + step * 0.6);
    }
    return d + " Z";
  }

  const ART = `
  <svg class="booth-svg" viewBox="0 0 260 200" role="img" aria-label="Wydrukowany w 3D model koła zębatego">
    <defs>
      <pattern id="layers" width="6" height="3.2" patternUnits="userSpaceOnUse">
        <rect width="6" height="1.3" fill="#2de2ff" opacity=".28"/>
      </pattern>
    </defs>
    <!-- drukarka 3D: rama i głowica -->
    <path class="frame" d="M20 186 H240 M30 186 V18 H230 V186"/>
    <path class="rail" d="M30 34 H230"/>
    <g class="nozzle"><rect x="-12" y="26" width="24" height="16" rx="3"/><path d="M-5 42 L0 50 L5 42 Z"/></g>
    <path class="bed" d="M48 176 H212"/>
    <g class="gear">
      <path class="gear-body" d="${gearPath(130, 112, 14, 56, 45)}"/>
      <path class="gear-fill" d="${gearPath(130, 112, 14, 56, 45)}" fill="url(#layers)"/>
      <circle class="gear-hub" cx="130" cy="112" r="16"/>
      <circle class="gear-hole" cx="130" cy="112" r="6"/>
      <path class="gear-spokes" d="M130 96 V67 M130 128 V157 M114 112 H85 M146 112 H175"/>
    </g>
    <g class="found-mark">
      <circle class="found-ring" cx="130" cy="112" r="70"/>
      <path class="draw found-check" d="M100 112 L122 134 L162 90"/>
    </g>
  </svg>`;

  BW.registerScene("booth", {
    mount(el, api) {
      const T = api.T.booth, C = api.C;
      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title)}
        <div class="art art-booth">${ART}<span class="art-tag">REAL WORLD · STOISKO WIEiK</span></div>
        <p class="lead">${esc(T.text1)}</p>
        <p class="lead strong">${esc(T.text2)}</p>
        <div class="hint-card">
          <span class="hint-ico">${BW.icon("search")}</span>
          <div><strong>${esc(T.hintTitle)}</strong><span>${esc(BW.fmt(T.hint, { hint: C.boothModelHint }))}</span></div>
        </div>
        <div class="sys" hidden></div>
        <div class="result" hidden></div>
        <div class="cta">
          <button class="btn btn-primary" type="button" data-found>${BW.icon("check")}<span>${esc(T.found)}</span></button>
          <button class="btn btn-primary" type="button" data-next hidden><span>${esc(T.next)}</span>${BW.icon("arrow")}</button>
        </div>`;
      BW.prepDraw(el);

      const svg = el.querySelector(".booth-svg");
      const sys = el.querySelector(".sys");
      const result = el.querySelector(".result");
      const foundBtn = el.querySelector("[data-found]");
      const nextBtn = el.querySelector("[data-next]");

      foundBtn.addEventListener("click", () => {
        const card = BW.overlay.open(`
          <div class="ov-ico">${BW.icon("cube")}</div>
          <h3>${esc(T.confirmTitle)}</h3>
          <p>${esc(BW.fmt("Model, którego szukasz: {hint}.", { hint: C.boothModelHint }))}</p>
          <div class="btn-stack">
            <button class="btn btn-primary" type="button" data-yes>${BW.icon("check")}<span>${esc(T.yes)}</span></button>
            <button class="btn btn-ghost" type="button" data-no>${BW.icon("search")}<span>${esc(T.no)}</span></button>
          </div>`);
        card.querySelector("[data-no]").addEventListener("click", () => {
          BW.overlay.close(true);
          api.sfx.soft();
          api.say(sys, T.noMsg, "warn");
          api.reveal(sys);
        });
        card.querySelector("[data-yes]").addEventListener("click", () => {
          BW.overlay.close(true);
          confirmFound();
        });
      });

      function confirmFound() {
        foundBtn.hidden = true;
        svg.classList.add("found");
        api.sfx.success();
        api.haptic([30, 40, 80]);
        BW.bg.burst();
        api.complete("booth", 75);
        sys.hidden = true;
        result.innerHTML = BW.winBanner(T.win, "Wszystkie cztery systemy gotowe do startu.");
        api.after(600, () => { api.reveal(result, false); nextBtn.hidden = false; api.reveal(nextBtn); });
      }

      nextBtn.addEventListener("click", () => api.go("launch"));
    }
  });
})();
