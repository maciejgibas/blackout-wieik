/* Minimalny generator PDF (bez bibliotek): jedna strona A4 z obrazem JPEG.
   Certyfikat jest renderowany na <canvas>, więc polskie znaki i fonty
   wyglądają dokładnie tak jak na ekranie. */
(function () {
  "use strict";

  function bytes(str) {
    const a = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 0xff;
    return a;
  }

  /* Tekst w słowniku /Info jako UTF-16BE (obsługa polskich znaków) */
  function pdfText(str) {
    let h = "FEFF";
    for (let i = 0; i < str.length; i++) h += str.charCodeAt(i).toString(16).padStart(4, "0");
    return "<" + h.toUpperCase() + ">";
  }

  function pdfDate(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `D:${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  }

  /**
   * @param {Uint8Array} jpeg  – bajty obrazu JPEG
   * @param {number} imgW, imgH – wymiary obrazu w pikselach
   * @param {{pageW?:number,pageH?:number,title?:string,author?:string}} meta
   * @returns {Blob}
   */
  function fromJpeg(jpeg, imgW, imgH, meta) {
    const m = meta || {};
    const pw = m.pageW || 841.89, ph = m.pageH || 595.28; // A4 poziomo, w punktach
    const parts = [];
    const offsets = [];
    let pos = 0;
    const push = (x) => {
      const b = typeof x === "string" ? bytes(x) : x;
      parts.push(b);
      pos += b.length;
    };
    const obj = (n, ...body) => {
      offsets[n] = pos;
      push(`${n} 0 obj\n`);
      body.forEach(push);
      push("\nendobj\n");
    };

    push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>`);
    obj(4,
      `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      jpeg,
      "\nendstream"
    );
    const content = `q\n${pw} 0 0 ${ph} 0 0 cm\n/Im0 Do\nQ\n`;
    obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    obj(6, `<< /Title ${pdfText(m.title || "Certyfikat")} /Author ${pdfText(m.author || "")} /Producer (BLACKOUT WIEiK) /CreationDate (${pdfDate(new Date())}) >>`);

    const xref = pos;
    let x = "xref\n0 7\n0000000000 65535 f \n";
    for (let n = 1; n <= 6; n++) x += String(offsets[n]).padStart(10, "0") + " 00000 n \n";
    push(x);
    push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: "application/pdf" });
  }

  /* Canvas → bajty JPEG (z obsługą starszych przeglądarek) */
  function canvasToJpeg(canvas, quality) {
    return new Promise((resolve, reject) => {
      const fromDataUrl = () => {
        try {
          const url = canvas.toDataURL("image/jpeg", quality);
          const bin = atob(url.split(",")[1]);
          resolve(bytes(bin));
        } catch (e) { reject(e); }
      };
      try {
        if (!canvas.toBlob) return fromDataUrl();
        canvas.toBlob((blob) => {
          if (!blob) return fromDataUrl();
          if (blob.arrayBuffer) blob.arrayBuffer().then((b) => resolve(new Uint8Array(b)), reject);
          else {
            const fr = new FileReader();
            fr.onload = () => resolve(new Uint8Array(fr.result));
            fr.onerror = () => reject(fr.error);
            fr.readAsArrayBuffer(blob);
          }
        }, "image/jpeg", quality);
      } catch (e) { reject(e); }
    });
  }

  window.BW.pdf = { fromJpeg, canvasToJpeg };
})();
