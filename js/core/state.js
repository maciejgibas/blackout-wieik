/* Stan gry zapamiętywany w ramach sesji przeglądarki (sessionStorage).
   Nie przechowujemy żadnych danych osobowych — imię z certyfikatu NIE trafia tutaj. */
(function () {
  "use strict";
  const KEY = "blackout-wieik-v1";

  const fresh = () => ({
    scene: "intro",
    progress: 0,
    matura: null,
    done: {},
    certNo: null,
    finishedAt: null,
    muted: null
  });

  const S = {
    data: fresh(),

    load() {
      try {
        const raw = sessionStorage.getItem(KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d && typeof d === "object") {
            this.data = Object.assign(fresh(), d, { done: Object.assign({}, d.done) });
            this.data.progress = Math.max(0, Math.min(100, Number(this.data.progress) || 0));
          }
        }
      } catch (e) { this.data = fresh(); }
      return this.data;
    },

    save() {
      try { sessionStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* tryb prywatny itp. */ }
    },

    set(patch) {
      Object.assign(this.data, patch);
      this.save();
    },

    complete(stage, progress) {
      this.data.done[stage] = true;
      if (progress > this.data.progress) this.data.progress = progress;
      this.save();
    },

    reset() {
      const muted = this.data.muted;
      this.data = fresh();
      this.data.muted = muted;
      this.save();
    }
  };

  window.BW.state = S;
})();
