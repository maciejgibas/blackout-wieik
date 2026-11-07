/* Ekran końcowy — certyfikat (podgląd + PDF), pamiątka, studia, ponowna gra */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;
  let pdfUrl = null;

  BW.registerScene("finish", {
    mount(el, api) {
      const T = api.T.finish, C = api.C;
      const st = api.state.data;
      if (!st.certNo) api.state.set({ certNo: BW.certificate.makeNumber() });
      if (!st.finishedAt) api.state.set({ finishedAt: Date.now() });
      if (st.progress < 100) api.complete("launch", 100);

      const askName = !(C.certificate && C.certificate.askForName === false);
      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title, T.subtitle)}
        <div class="cert-wrap">
          <canvas class="cert-preview" role="img" aria-label="Podgląd certyfikatu ${esc((C.certificate && C.certificate.title) || "")}"></canvas>
          <div class="cert-shine" aria-hidden="true"></div>
        </div>
        ${askName ? `
        <label class="field">
          <span>${esc(T.nameLabel)}</span>
          <input type="text" maxlength="32" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done" placeholder="${esc(T.namePlaceholder)}" data-name>
          <small>${esc(T.nameNote)}</small>
        </label>` : ""}
        <div class="btn-stack">
          <button class="btn btn-primary" type="button" data-pdf>${BW.icon("download")}<span>${esc(T.pdf)}</span></button>
          <div class="pdf-msg" hidden></div>
          <button class="btn btn-gold" type="button" data-prize>${BW.icon("gift")}<span>${esc(T.prize)}</span></button>
          <button class="btn btn-ghost" type="button" data-study>${BW.icon("school")}<span>${esc(T.study)}</span></button>
          <button class="btn btn-ghost" type="button" data-replay>${BW.icon("replay")}<span>${esc(T.replay)}</span></button>
        </div>`;

      const canvas = el.querySelector(".cert-preview");
      const nameIn = el.querySelector("[data-name]");
      const pdfBtn = el.querySelector("[data-pdf]");
      const pdfMsg = el.querySelector(".pdf-msg");

      const data = () => ({
        name: nameIn ? nameIn.value.replace(/\s+/g, " ").trim() : "",
        date: C.eventDate || BW.formatDate(new Date()),
        certNo: api.state.data.certNo,
        eventName: C.eventName || ""
      });

      let drawing = false, again = false;
      async function preview() {
        if (drawing) { again = true; return; }
        drawing = true;
        try {
          const wCss = Math.max(260, canvas.clientWidth || 320);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = Math.min(1400, Math.round(wCss * dpr));
          if (canvas.width !== w) { canvas.width = w; canvas.height = Math.round(w * 0.7071); }
          await BW.certificate.renderTo(canvas, data());
        } catch (e) { console.error(e); }
        drawing = false;
        if (again) { again = false; preview(); }
      }
      preview();

      let deb = 0;
      if (nameIn) {
        nameIn.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(preview, 160); });
        nameIn.addEventListener("keydown", (e) => { if (e.key === "Enter") nameIn.blur(); });
      }
      let rt = 0;
      const onResize = () => { clearTimeout(rt); rt = setTimeout(preview, 200); };
      window.addEventListener("resize", onResize);

      /* --- PDF --- */
      pdfBtn.addEventListener("click", async () => {
        if (pdfBtn.disabled) return;
        pdfBtn.disabled = true;
        const label = pdfBtn.querySelector("span");
        label.textContent = T.pdfBusy;
        pdfBtn.classList.add("busy");
        try {
          const blob = await BW.certificate.toPdfBlob(data());
          if (pdfUrl) { try { URL.revokeObjectURL(pdfUrl); } catch (e) { /* ignorujemy */ } }
          pdfUrl = URL.createObjectURL(blob);
          const fname = (C.certificate && C.certificate.fileName) || "certyfikat.pdf";
          const a = document.createElement("a");
          a.href = pdfUrl;
          a.download = fname;
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();
          pdfMsg.className = "pdf-msg ok";
          pdfMsg.innerHTML = `<span>${esc(T.pdfDone)}</span><a href="${pdfUrl}" target="_blank" rel="noopener" download="${esc(fname)}">${BW.icon("external")}${esc(T.pdfOpen)}</a>`;
          pdfMsg.hidden = false;
          api.sfx.good();
          api.haptic(20);
        } catch (e) {
          console.error(e);
          pdfMsg.className = "pdf-msg err";
          pdfMsg.textContent = T.pdfError;
          pdfMsg.hidden = false;
          api.sfx.error();
        }
        label.textContent = T.pdf;
        pdfBtn.classList.remove("busy");
        pdfBtn.disabled = false;
      });

      /* --- pamiątka --- */
      el.querySelector("[data-prize]").addEventListener("click", () => {
        const fin = new Date(api.state.data.finishedAt || Date.now());
        const card = BW.overlay.open(`
          <div class="prize-badge" aria-hidden="true">
            <span class="pb-ring"></span><span class="pb-ring r2"></span>
            <span class="pb-core">${BW.icon("check")}</span>
          </div>
          <h3 class="prize-title">${esc(T.prizeTitle)}</h3>
          <div class="prize-meta">
            <span>LAB ${esc(C.facultyShort)}: <b>100% ONLINE</b></span>
            <span>${esc(BW.formatTime(fin))} · ${esc(BW.formatDate(fin))}</span>
            <span class="mono">${esc(api.state.data.certNo)}</span>
          </div>
          <p>${esc(BW.fmt(T.prizeMsg, { prize: (C.prize && C.prize.name) || "przygotowany gadżet", note: (C.prize && C.prize.note) || "" }))}</p>
          <button class="btn btn-primary" type="button" data-close>${esc(T.close)}</button>`, { cls: "ov-prize" });
        card.querySelector("[data-close]").addEventListener("click", () => BW.overlay.close());
        api.sfx.success();
        api.haptic([30, 30, 30]);
      });

      el.querySelector("[data-study]").addEventListener("click", () => api.go("study"));
      el.querySelector("[data-replay]").addEventListener("click", () => {
        if (pdfUrl) { try { URL.revokeObjectURL(pdfUrl); } catch (e) { /* ignorujemy */ } pdfUrl = null; }
        api.state.reset();
        api.go("intro");
      });

      return () => { window.removeEventListener("resize", onResize); clearTimeout(deb); clearTimeout(rt); };
    }
  });
})();
