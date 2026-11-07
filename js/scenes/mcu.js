/* Zadanie 3 — zaprogramuj mikrokontroler: ułóż 3 instrukcje we właściwej kolejności.
   Program jest naprawdę „wykonywany” — każda kolejność daje swój efekt na diodzie. */
(function () {
  "use strict";
  const BW = window.BW, esc = BW.esc;
  const CORRECT = ["on", "wait", "off"];
  const STEP = 180;   // czas „wykonania” instrukcji WŁĄCZ/WYŁĄCZ (ms)
  const WAIT = 1000;  // POCZEKAJ 1 SEKUNDĘ

  const ART = `
  <svg class="mcu-svg" viewBox="0 0 320 190" role="img" aria-label="Płytka mikrokontrolera z diodą LED">
    <defs>
      <radialGradient id="ledGlow"><stop offset="0" stop-color="#ff5f6d" stop-opacity=".95"/><stop offset=".4" stop-color="#ff2d55" stop-opacity=".45"/><stop offset="1" stop-color="#ff2d55" stop-opacity="0"/></radialGradient>
    </defs>
    <rect class="pcb" x="12" y="12" width="296" height="166" rx="14"/>
    <circle class="hole" cx="28" cy="28" r="5"/><circle class="hole" cx="292" cy="28" r="5"/>
    <circle class="hole" cx="28" cy="162" r="5"/><circle class="hole" cx="292" cy="162" r="5"/>
    <rect class="usb" x="2" y="72" width="38" height="44" rx="3"/>
    <path class="usb-in" d="M8 84 h22 M8 104 h22"/>
    <g class="header">${Array.from({ length: 14 }, (_, i) => `<rect x="${78 + i * 14}" y="20" width="8" height="8" rx="1.5"/>`).join("")}</g>
    <g class="traces">
      <path d="M40 94 H70 V80 H112"/>
      <path d="M82 28 V60 H112"/>
      <path d="M150 28 V58"/>
      <path d="M208 100 H226"/>
      <path d="M244 100 H262 V112"/>
      <path d="M208 120 H232 V150 H274 V124"/>
      <path d="M150 132 V160 H96"/>
    </g>
    <g class="trace-run">
      <path d="M208 100 H226"/>
      <path d="M244 100 H262 V112"/>
    </g>
    <rect class="crystal" x="70" y="132" width="22" height="12" rx="6"/>
    <rect class="chip" x="112" y="58" width="96" height="74" rx="5"/>
    <g class="pins">${Array.from({ length: 7 }, (_, i) => `<rect x="${118 + i * 13}" y="52" width="6" height="6"/><rect x="${118 + i * 13}" y="132" width="6" height="6"/>`).join("")}</g>
    <circle class="chip-dot" cx="122" cy="68" r="3"/>
    <text class="chip-txt" x="160" y="100" text-anchor="middle">MCU</text>
    <text class="chip-sub" x="160" y="114" text-anchor="middle">32-BIT</text>
    <rect class="resistor" x="226" y="95" width="18" height="10" rx="2"/>
    <circle class="led-glow" cx="262" cy="124" r="40" fill="url(#ledGlow)"/>
    <path class="led-legs" d="M257 132 V146 M267 132 V140"/>
    <path class="led" d="M252 132 V122 a10 10 0 0 1 20 0 V132 Z"/>
    <rect class="led-rim" x="249" y="131" width="26" height="4" rx="1.5"/>
    <text class="lbl" x="262" y="164" text-anchor="middle">LED · D13</text>
    <circle class="pwr" cx="56" cy="40" r="4"/>
    <text class="lbl" x="66" y="43">PWR</text>
    <circle class="rx" cx="56" cy="54" r="3.5"/>
    <text class="lbl" x="66" y="57">TX</text>
  </svg>`;

  BW.registerScene("mcu", {
    mount(el, api) {
      const T = api.T.mcu;
      const OPS = {
        on: { label: T.blocks.on, icon: "led", cls: "op-on", code: "digitalWrite(LED, HIGH);" },
        wait: { label: T.blocks.wait, icon: "clock", cls: "op-wait", code: "delay(1000);" },
        off: { label: T.blocks.off, icon: "off", cls: "op-off", code: "digitalWrite(LED, LOW);" }
      };

      el.innerHTML = `
        ${BW.head(T.eyebrow, T.title, T.text)}
        <div class="art art-mcu">${ART}</div>
        <p class="task">${BW.icon("bolt")} ${esc(T.task)}</p>
        <div class="code-card">
          <div class="code-label code-label-row"><span>${esc(T.program)}</span><span class="led-mini" aria-hidden="true"><i></i>LED</span></div>
          <ol class="slots" data-slots></ol>
          <div class="code-label">${esc(T.palette)}</div>
          <div class="palette" data-palette></div>
          <p class="help">${esc(T.help)}</p>
          <div class="code-actions">
            <button class="btn btn-ghost btn-sm" type="button" data-clear>${BW.icon("trash")}<span>${esc(T.clear)}</span></button>
            <button class="btn btn-primary btn-sm" type="button" data-run disabled>${BW.icon("play")}<span>${esc(T.run)}</span></button>
          </div>
        </div>
        <div class="sys" hidden></div>
        <div class="result" hidden></div>
        <div class="cta" hidden><button class="btn btn-primary" type="button" data-next><span>${esc(T.next)}</span>${BW.icon("arrow")}</button></div>`;

      const svg = el.querySelector(".mcu-svg");
      const slotsEl = el.querySelector("[data-slots]");
      const palEl = el.querySelector("[data-palette]");
      const runBtn = el.querySelector("[data-run]");
      const clearBtn = el.querySelector("[data-clear]");
      const card = el.querySelector(".code-card");
      const sys = el.querySelector(".sys");
      const result = el.querySelector(".result");
      const cta = el.querySelector(".cta");

      let program = [null, null, null];
      let pool;
      do { pool = BW.shuffle(CORRECT); } while (pool.join() === CORRECT.join());
      let running = false, solved = false;

      const blockHtml = (op, attr) =>
        `<button class="block ${OPS[op].cls}" type="button" ${attr}>${BW.icon(OPS[op].icon)}<span>${esc(OPS[op].label)}</span></button>`;

      function render() {
        slotsEl.innerHTML = program
          .map((op, i) => `<li class="slot ${op ? "filled" : ""}" data-i="${i}"><span class="ln">${i + 1}</span>${
            op ? blockHtml(op, `data-slot="${i}" aria-label="${esc(OPS[op].label)} — usuń z programu"`) : `<span class="slot-empty">${esc(T.empty)}</span>`
          }<span class="slot-timer" aria-hidden="true"></span></li>`)
          .join("");
        palEl.innerHTML = pool.length
          ? pool.map((op) => blockHtml(op, `data-op="${op}" aria-label="${esc(OPS[op].label)} — dodaj do programu"`)).join("")
          : `<span class="palette-empty">Wszystkie instrukcje są w programie ✓</span>`;
        const full = program.every(Boolean);
        runBtn.disabled = !full || running || solved;
        clearBtn.disabled = running || solved || program.every((x) => !x);
        card.classList.toggle("is-running", running);
        card.classList.toggle("is-solved", solved);
      }
      render();

      palEl.addEventListener("click", (e) => {
        const b = e.target.closest("[data-op]");
        if (!b || running || solved) return;
        const op = b.getAttribute("data-op");
        const i = program.indexOf(null);
        if (i < 0) return;
        program[i] = op;
        pool.splice(pool.indexOf(op), 1);
        api.sfx.select();
        render();
        const placed = slotsEl.querySelector(`[data-slot="${i}"]`);
        if (placed) placed.classList.add("pop");
        if (program.every(Boolean)) runBtn.classList.add("pulse");
      });
      slotsEl.addEventListener("click", (e) => {
        const b = e.target.closest("[data-slot]");
        if (!b || running || solved) return;
        const i = Number(b.getAttribute("data-slot"));
        const op = program[i];
        program[i] = null;
        // przesuń pozostałe w górę, aby nie było „dziur”
        program = program.filter(Boolean).concat([null, null, null]).slice(0, 3);
        pool.push(op);
        api.sfx.soft();
        runBtn.classList.remove("pulse");
        render();
      });
      clearBtn.addEventListener("click", () => {
        if (running || solved) return;
        program.forEach((op) => op && pool.push(op));
        program = [null, null, null];
        runBtn.classList.remove("pulse");
        render();
      });

      const setLed = (on) => { svg.classList.toggle("led-on", on); card.classList.toggle("led-on", on); };
      const mark = (i) => BW.$$(".slot", slotsEl).forEach((s, k) => {
        s.classList.toggle("exec", k === i);
        if (k < i) s.classList.add("ran");
      });

      async function execute() {
        setLed(false);
        for (let i = 0; i < 3; i++) {
          mark(i);
          const op = program[i];
          if (op === "on") { setLed(true); api.sfx.tick(); await api.wait(STEP); }
          else if (op === "off") { setLed(false); api.sfx.tick(); await api.wait(STEP); }
          else {
            const slot = slotsEl.children[i];
            const timer = slot && slot.querySelector(".slot-timer");
            if (slot) slot.classList.add("waiting");
            const t0 = performance.now();
            const iv = api.every(50, () => {
              const left = Math.max(0, WAIT - (performance.now() - t0));
              if (timer) timer.textContent = (left / 1000).toFixed(1) + " s";
            });
            await api.wait(WAIT);
            clearInterval(iv);
            if (timer) timer.textContent = "";
            if (slot) slot.classList.remove("waiting");
          }
        }
        mark(-1);
      }

      runBtn.addEventListener("click", async () => {
        if (running || solved || !program.every(Boolean)) return;
        running = true;
        runBtn.classList.remove("pulse");
        render();
        api.say(sys, T.uploading, "info");
        svg.classList.add("uploading");
        await api.wait(800);
        svg.classList.remove("uploading");
        svg.classList.add("executing");
        api.say(sys, T.running, "info", { instant: true });
        await execute();
        svg.classList.remove("executing");
        const ok = program.join() === CORRECT.join();
        const endsOn = svg.classList.contains("led-on");
        BW.$$(".slot", slotsEl).forEach((s) => s.classList.remove("ran"));

        if (ok) {
          solved = true;
          running = false;
          render();
          api.sfx.success();
          api.haptic([30, 40, 80]);
          BW.bg.burst();
          api.complete("mcu", 75);
          api.say(sys, T.extra, "ok");
          result.innerHTML = `
            ${BW.winBanner(T.win, "Postęp laboratorium: 75%")}
            <div class="code-snippet">
              <div class="code-cap">${esc(T.codeCaption)}</div>
              <pre><code>${program.map((op) => `<span class="c-${op}">${esc(OPS[op].code)}</span>`).join("\n")}</code></pre>
              <button class="btn btn-ghost btn-sm" type="button" data-replay>${BW.icon("replay")}<span>${esc(T.replay)}</span></button>
            </div>`;
          api.after(250, () => { api.reveal(result, false); api.reveal(cta); });
          result.querySelector("[data-replay]").addEventListener("click", async (e) => {
            const b = e.currentTarget;
            if (b.disabled) return;
            b.disabled = true;
            svg.classList.add("executing");
            await execute();
            svg.classList.remove("executing");
            BW.$$(".slot", slotsEl).forEach((s) => s.classList.remove("ran"));
            b.disabled = false;
          });
        } else {
          api.sfx.error();
          api.haptic([20, 40, 20]);
          api.say(sys, `${T.wrong} ${endsOn ? T.hintStaysOn : T.hintFlash}`, "warn");
          if (endsOn) await api.wait(1200);
          setLed(false);
          running = false;
          render();
        }
      });

      el.querySelector("[data-next]").addEventListener("click", () => api.go("booth"));
    }
  });
})();
