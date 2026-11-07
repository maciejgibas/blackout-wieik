/* Certyfikat „HONOROWY INŻYNIER WIEiK” — jeden rysunek na <canvas>
   używany zarówno w podglądzie, jak i w pliku PDF. */
(function () {
  "use strict";
  const BW = window.BW;
  const FONT = "'Exo 2', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const MONO = "'JetBrains Mono', Menlo, Consolas, monospace";
  const NAVY = "#0b2647", CYAN = "#1597c9", INK = "#2b4766", SOFT = "#5f7d9c";

  let logoPromise = null;
  function loadLogo() {
    if (logoPromise) return logoPromise;
    const C = window.BW_CONFIG || {};
    logoPromise = new Promise((res) => {
      if (!C.logo) return res(null);
      const img = new Image();
      img.onload = () => res(img.naturalWidth || img.width ? img : null);
      img.onerror = () => res(null);
      img.src = C.logo;
    });
    return logoPromise;
  }

  let fontsPromise = null;
  function fontsReady() {
    if (fontsPromise) return fontsPromise;
    if (!document.fonts || !document.fonts.load) return (fontsPromise = Promise.resolve());
    const loads = ['900 40px "Exo 2"', '800 40px "Exo 2"', '600 40px "Exo 2"', '400 40px "Exo 2"', '500 20px "JetBrains Mono"']
      .map((f) => document.fonts.load(f, "ĄĘŁŃÓŚŹŻąęłńóśźż").catch(() => null));
    fontsPromise = Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2000))]);
    return fontsPromise;
  }

  function fit(ctx, text, weight, size, family, maxW) {
    let s = size;
    ctx.font = `${weight} ${s}px ${family}`;
    while (ctx.measureText(text).width > maxW && s > 8) {
      s -= 1;
      ctx.font = `${weight} ${s}px ${family}`;
    }
    return s;
  }

  /* Tekst z odstępami między literami (ctx.letterSpacing nie wszędzie działa) */
  function spaced(ctx, text, cx, y, spacing) {
    const chars = Array.from(text);
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = cx - total / 2;
    const align = ctx.textAlign;
    ctx.textAlign = "left";
    chars.forEach((c, i) => { ctx.fillText(c, x, y); x += widths[i] + spacing; });
    ctx.textAlign = align;
    return total;
  }

  function wrap(ctx, text, maxW) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((w) => {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function boltPath(ctx, cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx - 1.5 * s, cy - 6 * s); ctx.lineTo(cx + 3.5 * s, cy - 6 * s); ctx.lineTo(cx + 1 * s, cy - 1.2 * s);
    ctx.lineTo(cx + 4 * s, cy - 1.2 * s); ctx.lineTo(cx - 2.5 * s, cy + 7 * s); ctx.lineTo(cx - 0.6 * s, cy + 0.8 * s);
    ctx.lineTo(cx - 3.8 * s, cy + 0.8 * s); ctx.closePath();
  }

  function cornerTraces(ctx, u, W, H) {
    ctx.save();
    ctx.strokeStyle = "rgba(21,151,201,0.22)";
    ctx.fillStyle = "rgba(21,151,201,0.30)";
    ctx.lineWidth = 2 * u;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const sets = [
      [[46, 120], [46, 80], [80, 46], [190, 46]],
      [[46, 160], [66, 140], [66, 96], [96, 66], [150, 66]],
      [[86, 46], [86, 30]],
      [[46, 210], [30, 226]]
    ];
    const pad = (x, y) => { ctx.beginPath(); ctx.arc(x, y, 4.2 * u, 0, Math.PI * 2); ctx.fill(); };
    [[1, 1, 0, 0], [-1, 1, W, 0], [1, -1, 0, H], [-1, -1, W, H]].forEach(([sx, sy, ox, oy]) => {
      sets.forEach((pts) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => {
          const px = ox + sx * x * u, py = oy + sy * y * u;
          i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        });
        ctx.stroke();
        const e = pts[pts.length - 1], s0 = pts[0];
        pad(ox + sx * e[0] * u, oy + sy * e[1] * u);
        pad(ox + sx * s0[0] * u, oy + sy * s0[1] * u);
      });
    });
    ctx.restore();
  }

  function badgeIcon(ctx, kind, cx, cy, r, u) {
    ctx.save();
    ctx.strokeStyle = NAVY; ctx.fillStyle = NAVY;
    ctx.lineWidth = 2.4 * u; ctx.lineCap = "round"; ctx.lineJoin = "round";
    const k = r / 26;
    if (kind === 0) { // żarówka
      ctx.beginPath(); ctx.arc(cx, cy - 4 * k, 9 * k, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 5 * k, cy + 6 * k); ctx.lineTo(cx + 5 * k, cy + 6 * k);
      ctx.moveTo(cx - 4 * k, cy + 10 * k); ctx.lineTo(cx + 4 * k, cy + 10 * k); ctx.stroke();
    } else if (kind === 1) { // silnik
      ctx.beginPath(); ctx.arc(cx, cy, 11 * k, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 9 * k, cy + Math.sin(a) * 9 * k); ctx.stroke();
      }
    } else if (kind === 2) { // układ scalony
      ctx.strokeRect(cx - 8 * k, cy - 8 * k, 16 * k, 16 * k);
      ctx.beginPath();
      for (let i = -1; i <= 1; i++) {
        const o = i * 5 * k;
        ctx.moveTo(cx + o, cy - 8 * k); ctx.lineTo(cx + o, cy - 12 * k);
        ctx.moveTo(cx + o, cy + 8 * k); ctx.lineTo(cx + o, cy + 12 * k);
        ctx.moveTo(cx - 8 * k, cy + o); ctx.lineTo(cx - 12 * k, cy + o);
        ctx.moveTo(cx + 8 * k, cy + o); ctx.lineTo(cx + 12 * k, cy + o);
      }
      ctx.stroke();
    } else { // model 3D
      ctx.beginPath();
      ctx.moveTo(cx, cy - 11 * k); ctx.lineTo(cx + 10 * k, cy - 5.5 * k); ctx.lineTo(cx + 10 * k, cy + 5.5 * k);
      ctx.lineTo(cx, cy + 11 * k); ctx.lineTo(cx - 10 * k, cy + 5.5 * k); ctx.lineTo(cx - 10 * k, cy - 5.5 * k); ctx.closePath();
      ctx.moveTo(cx - 10 * k, cy - 5.5 * k); ctx.lineTo(cx, cy); ctx.lineTo(cx + 10 * k, cy - 5.5 * k);
      ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 11 * k);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Rysuje certyfikat. Proporcje A4 (1 : 0,7071).
   * d = { name, date, certNo, eventName }
   */
  function draw(ctx, W, H, d, logo) {
    const C = window.BW_CONFIG || {};
    const T = BW.TEXT.certificate;
    const u = W / 1000;
    ctx.save();
    ctx.textBaseline = "alphabetic";

    // tło
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#f8fbff"); g.addColorStop(1, "#e7f1fa");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const rg = ctx.createRadialGradient(W / 2, H * 0.42, 10 * u, W / 2, H * 0.42, 520 * u);
    rg.addColorStop(0, "rgba(45,226,255,0.10)"); rg.addColorStop(1, "rgba(45,226,255,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

    cornerTraces(ctx, u, W, H);

    // ramki
    ctx.strokeStyle = NAVY; ctx.lineWidth = 3 * u;
    ctx.strokeRect(22 * u, 22 * u, W - 44 * u, H - 44 * u);
    ctx.strokeStyle = CYAN; ctx.lineWidth = 1.2 * u;
    ctx.strokeRect(31 * u, 31 * u, W - 62 * u, H - 62 * u);

    ctx.textAlign = "center";
    const cx = W / 2;

    // logo
    let y = 62 * u;
    if (logo) {
      const lh = 54 * u;
      const lw = lh * ((logo.naturalWidth || logo.width) / (logo.naturalHeight || logo.height || 1));
      try { ctx.drawImage(logo, cx - lw / 2, y, lw, lh); } catch (e) { /* ignorujemy */ }
      y += lh + 30 * u;
    } else {
      ctx.fillStyle = CYAN;
      boltPath(ctx, cx, y + 26 * u, 3.4 * u); ctx.fill();
      y += 84 * u;
    }

    // nagłówek uczelni
    ctx.fillStyle = SOFT;
    const header = `${(C.universityName || "").toUpperCase()}  ·  ${(C.facultyName || "").toUpperCase()}`;
    fit(ctx, header, 600, 13 * u, FONT, 780 * u);
    spaced(ctx, header, cx, y, 1.2 * u);

    // CERTYFIKAT
    y += 50 * u;
    ctx.fillStyle = CYAN;
    ctx.font = `700 ${19 * u}px ${FONT}`;
    spaced(ctx, T.kicker, cx, y, 9 * u);

    // tytuł
    y += 66 * u;
    ctx.fillStyle = NAVY;
    const title = (C.certificate && C.certificate.title) || "HONOROWY INŻYNIER WIEiK";
    fit(ctx, title, 900, 60 * u, FONT, 820 * u);
    ctx.fillText(title, cx, y);

    // separator z piorunem
    y += 28 * u;
    ctx.strokeStyle = "rgba(21,151,201,0.6)"; ctx.lineWidth = 1.6 * u;
    ctx.beginPath(); ctx.moveTo(cx - 200 * u, y); ctx.lineTo(cx - 22 * u, y);
    ctx.moveTo(cx + 22 * u, y); ctx.lineTo(cx + 200 * u, y); ctx.stroke();
    ctx.fillStyle = CYAN; boltPath(ctx, cx, y, 1.9 * u); ctx.fill();

    // odbiorca
    y += 42 * u;
    ctx.fillStyle = SOFT;
    ctx.font = `400 ${16 * u}px ${FONT}`;
    ctx.fillText(T.awardedTo, cx, y);
    y += 46 * u;
    ctx.fillStyle = NAVY;
    const name = (d.name || "").trim();
    if (name) fit(ctx, name, 800, 40 * u, FONT, 700 * u);
    else fit(ctx, T.anonymous, 700, 30 * u, FONT, 700 * u);
    ctx.fillText(name || T.anonymous, cx, y);

    // treść
    y += 40 * u;
    ctx.fillStyle = INK;
    ctx.font = `400 ${16.5 * u}px ${FONT}`;
    wrap(ctx, T.body, 640 * u).forEach((ln, i) => ctx.fillText(ln, cx, y + i * 25 * u));

    // odznaki
    const by = 556 * u, r = 25 * u;
    T.badges.forEach((label, i) => {
      const bx = cx + (i - 1.5) * 118 * u;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45,226,255,0.14)"; ctx.fill();
      ctx.strokeStyle = CYAN; ctx.lineWidth = 1.8 * u; ctx.stroke();
      badgeIcon(ctx, i, bx, by, r, u);
      // znaczek „zaliczone”
      ctx.beginPath(); ctx.arc(bx + r * 0.72, by - r * 0.72, 8 * u, 0, Math.PI * 2);
      ctx.fillStyle = "#14b87a"; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.8 * u;
      ctx.beginPath(); ctx.moveTo(bx + r * 0.72 - 3.6 * u, by - r * 0.72);
      ctx.lineTo(bx + r * 0.72 - 1 * u, by - r * 0.72 + 2.8 * u); ctx.lineTo(bx + r * 0.72 + 3.8 * u, by - r * 0.72 - 2.8 * u);
      ctx.stroke();
      ctx.fillStyle = NAVY;
      fit(ctx, label, 700, 11 * u, FONT, 112 * u);
      spaced(ctx, label, bx, by + r + 20 * u, 1 * u);
    });

    // pieczęć
    const sx = 872 * u, sy = 556 * u, sr = 56 * u;
    ctx.save();
    ctx.translate(sx, sy); ctx.rotate(-0.12);
    ctx.strokeStyle = CYAN; ctx.lineWidth = 2.4 * u;
    ctx.beginPath(); ctx.arc(0, 0, sr, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1 * u; ctx.setLineDash([3 * u, 4 * u]);
    ctx.beginPath(); ctx.arc(0, 0, sr - 7 * u, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = CYAN; boltPath(ctx, 0, -27 * u, 1.5 * u); ctx.fill();
    ctx.fillStyle = NAVY; ctx.textAlign = "center";
    ctx.font = `700 ${11 * u}px ${FONT}`; ctx.fillText(T.seal[0], 0, -2 * u);
    ctx.font = `900 ${21 * u}px ${FONT}`; ctx.fillText(T.seal[1], 0, 20 * u);
    ctx.font = `700 ${10 * u}px ${FONT}`; ctx.fillText(T.seal[2], 0, 34 * u);
    ctx.restore();

    // stopka
    const fy = 645 * u;
    ctx.strokeStyle = "rgba(11,38,71,0.18)"; ctx.lineWidth = 1 * u;
    ctx.beginPath(); ctx.moveTo(70 * u, fy - 24 * u); ctx.lineTo(W - 70 * u, fy - 24 * u); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `500 ${12 * u}px ${MONO}`;
    ctx.textAlign = "left"; ctx.fillText(`${T.date}: ${d.date}`, 70 * u, fy);
    ctx.textAlign = "right"; ctx.fillText(`${T.number}: ${d.certNo}`, W - 70 * u, fy);
    ctx.textAlign = "center";
    ctx.font = `600 ${12.5 * u}px ${FONT}`;
    fit(ctx, d.eventName || "", 600, 12.5 * u, FONT, 420 * u);
    ctx.fillText(d.eventName || "", cx, fy);
    ctx.fillStyle = SOFT;
    ctx.font = `400 ${11.5 * u}px ${FONT}`;
    ctx.fillText(T.note, cx, fy + 26 * u);

    ctx.restore();
  }

  async function renderTo(canvas, d, withLogo) {
    await fontsReady();
    const logo = withLogo === false ? null : await loadLogo();
    const ctx = canvas.getContext("2d");
    draw(ctx, canvas.width, canvas.height, d, logo);
    return canvas;
  }

  /* Generuje PDF A4 (poziomo). Gdy logo „skaża” płótno (np. przy otwarciu z dysku
     przez file://), certyfikat jest renderowany ponownie bez logo. */
  async function toPdfBlob(d) {
    const W = 2339, H = 1654; // A4 przy ~200 dpi
    const make = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
    let canvas = make();
    await renderTo(canvas, d, true);
    let jpeg;
    try {
      jpeg = await BW.pdf.canvasToJpeg(canvas, 0.92);
    } catch (e) {
      // skażonego płótna nie da się „oczyścić” — rysujemy od nowa na świeżym, bez logo
      canvas.width = 1; canvas.height = 1;
      canvas = make();
      await renderTo(canvas, d, false);
      jpeg = await BW.pdf.canvasToJpeg(canvas, 0.92);
    }
    canvas.width = 1; canvas.height = 1; // zwolnij pamięć (ważne na iOS)
    const C = window.BW_CONFIG || {};
    return BW.pdf.fromJpeg(jpeg, W, H, {
      title: `${(C.certificate && C.certificate.title) || "Certyfikat"} — ${d.certNo}`,
      author: `${C.facultyShort || ""} ${C.universityName || ""}`.trim()
    });
  }

  function makeNumber() {
    const C = window.BW_CONFIG || {};
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 5; i++) s += abc[(Math.random() * abc.length) | 0];
    return `${C.facultyShort || "WIEiK"}-${new Date().getFullYear()}-${s}`;
  }

  BW.certificate = { renderTo, toPdfBlob, fontsReady, makeNumber };
})();
