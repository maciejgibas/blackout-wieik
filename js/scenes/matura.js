/* Etap 0 — Czy jesteś maturzystą? (obie odpowiedzi prowadzą dalej) */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;

  BW.registerScene("matura", {
    mount(el, api) {
      const T = api.T.matura;
      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title)}
        <div class="badge-art" aria-hidden="true">
          <div class="id-card">
            <div class="id-chip">${BW.icon("chip")}</div>
            <div class="id-lines"><i></i><i></i><i></i></div>
            <div class="id-tag">PRZEPUSTKA · LAB</div>
          </div>
        </div>
        <div class="choice-stack" role="group" aria-label="${esc(T.title)}">
          <button class="btn btn-choice" type="button" data-v="yes">${BW.icon("cap")}<span>${esc(T.yes)}</span></button>
          <button class="btn btn-choice" type="button" data-v="no">${BW.icon("rocket")}<span>${esc(T.no)}</span></button>
        </div>
        <div class="sys" hidden></div>
        <div class="cta" hidden><button class="btn btn-primary" type="button" data-next><span>${esc(T.next)}</span>${BW.icon("arrow")}</button></div>`;

      const sys = el.querySelector(".sys");
      const cta = el.querySelector(".cta");
      const btns = BW.$$("[data-v]", el);
      const card = el.querySelector(".id-card");

      btns.forEach((b) =>
        b.addEventListener("click", () => {
          const v = b.getAttribute("data-v");
          btns.forEach((x) => { x.classList.toggle("selected", x === b); x.setAttribute("aria-pressed", String(x === b)); });
          api.state.set({ matura: v });
          card.classList.add("granted");
          api.sfx.good();
          api.say(sys, v === "yes" ? T.yesMsg : T.noMsg, "ok");
          api.reveal(cta);
        })
      );
      el.querySelector("[data-next]").addEventListener("click", () => api.go("circuit"));
    }
  });
})();
