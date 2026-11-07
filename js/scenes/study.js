/* Ekran „Studiuj na WIEiK” — treści i odnośniki z config.js */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;

  BW.registerScene("study", {
    mount(el, api) {
      const T = api.T.study, C = api.C;
      const S = C.study || {};
      const link = (url, label, primary) =>
        url ? `<a class="btn ${primary ? "btn-primary" : "btn-ghost"}" href="${esc(url)}" target="_blank" rel="noopener">${BW.icon("external")}<span>${esc(label)}</span></a>` : "";
      el.innerHTML = `
        ${BW.head(T.eyebrow, S.heading || "STUDIUJ NA WIEiK", S.intro)}
        <div class="study-hero" aria-hidden="true">
          ${BW.logoImg("study-logo")}
          <div class="study-uni">${esc(C.universityName)}<br><b>${esc(C.facultyName)}</b></div>
        </div>
        <ul class="areas">
          ${(S.areas || []).map((a, i) => `
            <li style="--d:${0.08 * i}s">
              <span class="area-ico">${BW.icon(a.icon || "bolt")}</span>
              <div><strong>${esc(a.title)}</strong><span>${esc(a.text)}</span></div>
            </li>`).join("")}
        </ul>
        <div class="btn-stack">
          ${link(C.facultyUrl, T.site, true)}
          ${link(C.admissionsUrl, T.admissions, false)}
          <button class="btn btn-ghost" type="button" data-back>${BW.icon("arrow", "flip")}<span>${esc(T.back)}</span></button>
        </div>`;
      el.querySelector("[data-back]").addEventListener("click", () => api.go("finish"));
    }
  });
})();
