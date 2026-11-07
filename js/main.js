/* Start aplikacji — wznowienie postępu z bieżącej sesji */
(function () {
  "use strict";
  const BW = window.BW;
  BW.state.load();
  BW.app.init();

  // Sceny, do których można wrócić po odświeżeniu strony, wraz z wymaganymi etapami
  const REQUIRES = {
    intro: [], matura: [], circuit: [],
    motor: ["circuit"], mcu: ["circuit", "motor"], booth: ["circuit", "motor", "mcu"],
    launch: ["circuit", "motor", "mcu", "booth"],
    finish: ["launch"], study: ["launch"]
  };
  let start = BW.state.data.scene;
  const req = REQUIRES[start];
  if (!req || !BW.app.hasScene(start) || !req.every((s) => BW.state.data.done[s])) start = "intro";
  if (start === "intro") BW.state.reset();
  BW.app.go(start, { instant: true });
})();
