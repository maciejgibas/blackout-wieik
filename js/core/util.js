/* Narzędzia wspólne: DOM, ikony, wibracje, formatowanie */
(function () {
  "use strict";
  const BW = (window.BW = window.BW || {});

  BW.esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  BW.$ = (sel, root) => (root || document).querySelector(sel);
  BW.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  BW.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  BW.fmt = (str, vars) => String(str).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));

  BW.reducedMotion = () => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  };

  BW.haptic = (pattern) => {
    try {
      if (window.BW_CONFIG && BW_CONFIG.haptics === false) return;
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) { /* brak wsparcia — ignorujemy */ }
  };

  BW.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  BW.formatDate = (d) => {
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
  };
  BW.formatTime = (d) => {
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  /* Przygotowanie animacji „rysowania” konturów SVG */
  BW.prepDraw = (root) => {
    BW.$$(".draw", root).forEach((p) => {
      let len = 600;
      try { if (p.getTotalLength) len = Math.ceil(p.getTotalLength()) || 600; } catch (e) { /* fallback */ }
      p.style.setProperty("--len", len);
    });
  };

  /* Ikony liniowe 24×24 */
  const I = {
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M4 12.5 9.5 18 20 6.5"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
    rocket: '<path d="M12 2c4 3 6 7 5 12l-5 3-5-3c-1-5 1-9 5-12z"/><circle cx="12" cy="9" r="2"/><path d="M7 14l-3 3 1 4 3-3M17 14l3 3-1 4-3-3"/>',
    soundOn: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    soundOff: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6 0 6-1.5S14 5 12 9z"/>',
    replay: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/>',
    school: '<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M10 21v-5h4v5"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    power: '<path d="M12 3v8"/><path d="M6.3 7.5a7.5 7.5 0 1 0 11.4 0"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M8 14.5A6 6 0 1 1 16 14.5c-.8.8-1 1.6-1 2.5H9c0-.9-.2-1.7-1-2.5z"/>',
    motor: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 10V4.5M13.7 13l4.8 2.8M10.3 13l-4.8 2.8"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3"/>',
    cube: '<path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z"/><path d="M3.5 7 12 11.5 20.5 7M12 11.5v10"/>',
    robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9.5 16h5M2.5 12v3M21.5 12v3"/>',
    led: '<path d="M8 13V9a4 4 0 0 1 8 0v4z"/><path d="M6 13h12M10 13v8M14 13v5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    off: '<path d="M8 13V9a4 4 0 0 1 8 0v4z"/><path d="M6 13h12M10 13v8M14 13v5M3 3l18 18"/>'
  };
  BW.icon = (name, cls) =>
    `<svg class="ico ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ""}</svg>`;

  BW.head = (eyebrow, title, sub) =>
    `<header class="scene-head">
       <span class="eyebrow">${BW.esc(eyebrow)}</span>
       <h2 tabindex="-1">${BW.esc(title)}</h2>
       ${sub ? `<p class="lead">${BW.esc(sub)}</p>` : ""}
     </header>`;

  BW.winBanner = (title, sub) =>
    `<div class="win" role="status">
       <span class="win-ico">${BW.icon("check")}</span>
       <div><strong>${BW.esc(title)}</strong>${sub ? `<span>${BW.esc(sub)}</span>` : ""}</div>
     </div>`;

  BW.logoImg = (cls) => {
    const C = window.BW_CONFIG || {};
    if (!C.logo) return "";
    return `<img class="${cls || ""}" src="${BW.esc(C.logo)}" alt="${BW.esc(C.facultyShort || "")} — logo" data-optional>`;
  };

  /* Brakujące opcjonalne obrazki (np. logo) po prostu znikają */
  document.addEventListener(
    "error",
    (e) => {
      const t = e.target;
      if (t && t.tagName === "IMG" && t.hasAttribute("data-optional")) t.remove();
    },
    true
  );
})();
