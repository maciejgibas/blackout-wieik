/* Ekran powitalny — wyłączone laboratorium, kontury urządzeń rysują się stopniowo */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;

  const ART = `
  <svg class="intro-svg" viewBox="0 0 360 200" aria-hidden="true">
    <g class="lab-outline">
      <!-- blat -->
      <path class="draw" style="--d:.1s" d="M8 182 H352"/>
      <path class="draw thin" style="--d:.2s" d="M20 182 V196 M340 182 V196"/>

      <!-- obwód: żarówka + bateria -->
      <circle class="draw" style="--d:.4s" cx="62" cy="64" r="20"/>
      <path class="draw thin" style="--d:.7s" d="M54 68 l3 -8 l5 8 l5 -8 l3 8"/>
      <rect class="draw" style="--d:.6s" x="53" y="84" width="18" height="12" rx="2"/>
      <rect class="draw" style="--d:.8s" x="36" y="130" width="46" height="24" rx="4"/>
      <rect class="draw" style="--d:.9s" x="82" y="137" width="5" height="10" rx="1"/>
      <path class="draw thin" style="--d:1s" d="M62 96 V112 H24 V142 H36"/>
      <path class="draw thin" style="--d:1.1s" d="M87 142 H104 V64 H82"/>

      <!-- mikrokontroler -->
      <rect class="draw" style="--d:.9s" x="128" y="102" width="106" height="64" rx="7"/>
      <rect class="draw" style="--d:1.2s" x="160" y="116" width="42" height="34" rx="3"/>
      <path class="draw thin" style="--d:1.4s" d="M166 116 v-6 M174 116 v-6 M182 116 v-6 M190 116 v-6 M198 116 v-6 M166 150 v6 M174 150 v6 M182 150 v6 M190 150 v6 M198 150 v6"/>
      <path class="draw thin" style="--d:1.5s" d="M202 128 H220 V116"/>
      <path class="draw thin" style="--d:1.6s" d="M140 112 h10 M140 120 h10 M140 128 h10"/>
      <circle class="standby" cx="220" cy="112" r="4"/>

      <!-- silnik -->
      <circle class="draw" style="--d:1.2s" cx="296" cy="118" r="40"/>
      <circle class="draw" style="--d:1.5s" cx="296" cy="118" r="28" stroke-dasharray="4 5"/>
      <circle class="draw" style="--d:1.6s" cx="296" cy="118" r="8"/>
      <path class="draw thin" style="--d:1.7s" d="M296 110 V92 M303 122 L318 131 M289 122 L274 131"/>
      <path class="draw" style="--d:1.4s" d="M262 158 H330 V170 H262 Z"/>

      <!-- połączenia PCB -->
      <path class="draw trace" style="--d:1.8s" d="M104 168 H128"/>
      <path class="draw trace" style="--d:1.9s" d="M234 150 H248 L258 140"/>
      <circle class="pad" cx="104" cy="168" r="2.5"/><circle class="pad" cx="258" cy="140" r="2.5"/>
    </g>
  </svg>`;

  BW.registerScene("intro", {
    mount(el, api) {
      const T = api.T.intro, C = api.C;
      el.innerHTML = `
        <div class="intro-top">
          <span class="eyebrow">${esc(C.eventName)}</span>
        </div>
        <div class="art art-intro">${ART}<div class="art-scan" aria-hidden="true"></div><span class="power-tag">ZASILANIE: <b>OFF</b></span></div>
        <h1 class="game-title" tabindex="-1">
          <span class="t1" data-text="BLACKOUT:">BLACKOUT:</span>
          <span class="t2">URATUJ WIEiK</span>
        </h1>
        <p class="tagline">${esc(T.tagline)}</p>
        <div class="intro-lines">
          ${T.lines.map((l, i) => `<p class="reveal" style="--d:${0.5 + i * 0.45}s">${esc(l)}</p>`).join("")}
        </div>
        <div class="cta">
          <button class="btn btn-primary btn-xl pulse" type="button" data-start>${BW.icon("power")}<span>${esc(T.start)}</span></button>
        </div>`;
      BW.prepDraw(el);
      el.querySelector("[data-start]").addEventListener("click", (e) => {
        e.currentTarget.disabled = true;
        api.state.reset();
        BW.audio.sfx.power();
        BW.bg.burst();
        api.go("matura");
      });
    }
  });
})();
