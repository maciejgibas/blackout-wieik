/* =========================================================================
   Wszystkie teksty gry w jednym miejscu.
   Zmienne w nawiasach klamrowych ({prize}, {hint}) są podmieniane
   wartościami z config.js.
   ========================================================================= */
window.BW = window.BW || {};
BW.TEXT = {
  hud: {
    label: "LABORATORIUM",
    offline: "OFFLINE",
    online: "ONLINE",
    steps: { circuit: "OBWÓD", motor: "SILNIK", mcu: "MCU", booth: "STOISKO" },
    mute: "Wycisz dźwięk",
    unmute: "Włącz dźwięk"
  },

  intro: {
    tagline: "Masz kilka minut, żeby uruchomić laboratorium. Podejmujesz wyzwanie?",
    lines: [
      "W naszym wirtualnym laboratorium właśnie wyłączono zasilanie.",
      "Twoje zadanie? Uruchomić obwody, rozkręcić silnik i zaprogramować mikrokontroler.",
      "Brzmi trudno? Spokojnie. Każdy inżynier kiedyś zaczynał."
    ],
    start: "ROZPOCZNIJ MISJĘ"
  },

  matura: {
    eyebrow: "ODPRAWA PRZED MISJĄ",
    title: "JESTEŚ MATURZYSTĄ?",
    yes: "TAK, W TYM ROKU ZDAJĘ MATURĘ",
    no: "JESZCZE NIE, ALE CHĘTNIE SPRÓBUJĘ",
    yesMsg: "Świetnie! Sprawdźmy, czy masz inżynierskiego nosa.",
    noMsg: "Nie trzeba mieć matury, żeby zacząć odkrywać elektronikę!",
    next: "DO LABORATORIUM"
  },

  circuit: {
    eyebrow: "ZADANIE 1/4 · OBWÓD ELEKTRYCZNY",
    title: "CO BĘDZIE POTRZEBNE, ŻEBY ZAŚWIECIĆ ŻARÓWKĘ?",
    start: "Obwód jest gotowy, brakuje tylko jednego elementu. Wybierz źródło energii.",
    options: {
      battery: { label: "Bateria", msg: "Dobry wybór! Mamy źródło energii." },
      potato:  { label: "Ziemniak", msg: "Ciekawy pomysł! Z odpowiednimi elektrodami ziemniak może być częścią prostego ogniwa. Ale dzisiaj stawiamy na baterię." },
      tea:     { label: "Kubek herbaty", msg: "Pomaga w nauce, ale naszego obwodu raczej nie zasili." }
    },
    nowSwitch: "Teraz zamknij obwód — przesuń przełącznik w prawo.",
    lockedSwitch: "Przełącznik działa, ale bez źródła energii żarówka nawet nie mrugnie. Najpierw wybierz źródło.",
    switchHint: "PRZESUŃ, ABY ZAMKNĄĆ OBWÓD",
    switchOn: "OBWÓD ZAMKNIĘTY",
    win: "OBWÓD DZIAŁA! PIERWSZE ZADANIE ZALICZONE.",
    fact: "Prąd płynie tylko wtedy, gdy obwód jest zamknięty. Wyłącznik niczego nie „produkuje” — po prostu łączy albo przerywa drogę dla ładunków.",
    next: "DALEJ"
  },

  motor: {
    eyebrow: "ZADANIE 2/4 · SILNIK ELEKTRYCZNY",
    title: "CZAS WPRAWIĆ COŚ W RUCH!",
    text: "Silnik czeka na odpowiedni sygnał sterujący. Sprawdź, czy potrafisz ustawić jego pracę.",
    task: "Ustaw suwak w zielonej strefie 45–65% i utrzymaj przez 2 sekundy.",
    sliderLabel: "SYGNAŁ STERUJĄCY",
    comments: {
      zero: "Silnik odpoczywa.",
      low: "Pierwsze obroty! Coś zaczyna się dziać.",
      mid: "Coraz żwawiej! Jeszcze odrobinę.",
      ok: "Idealnie. Stabilna praca.",
      high: "Trochę za szybko — zwolnij odrobinę.",
      max: "Pełna moc! Ale do tego zadania wystarczy trochę mniej."
    },
    zoneOut: "USTAW 45–65%",
    zoneIn: "STREFA OPTYMALNA · TRZYMAJ",
    win: "SILNIK URUCHOMIONY. WŁAŚNIE POZNAŁEŚ PODSTAWY STEROWANIA.",
    fact: "W prawdziwych układach podobną rolę pełni sygnał PWM: zasilanie jest bardzo szybko włączane i wyłączane. Im dłużej trwa stan „włączony”, tym większa średnia moc trafia do silnika.",
    note: "Uproszczona symulacja: suwak zmienia wypełnienie sygnału sterującego, a animacja pokazuje ogólną zależność — nie dokładny model pracy prawdziwego silnika.",
    next: "DALEJ"
  },

  mcu: {
    eyebrow: "ZADANIE 3/4 · MIKROKONTROLER",
    title: "TERAZ TROCHĘ PROGRAMOWANIA!",
    text: "Mikrokontroler wykona dokładnie to, co mu polecisz. Pytanie tylko, czy polecisz mu to we właściwej kolejności.",
    task: "Cel: dioda ma się zapalić, świecić przez sekundę i zgasnąć.",
    blocks: { on: "WŁĄCZ DIODĘ LED", wait: "POCZEKAJ 1 SEKUNDĘ", off: "WYŁĄCZ DIODĘ LED" },
    program: "TWÓJ PROGRAM",
    palette: "DOSTĘPNE INSTRUKCJE",
    empty: "pusty slot",
    help: "Dotknij instrukcji, aby dodać ją do programu. Dotknij jej w programie, aby ją usunąć.",
    run: "WGRAJ I URUCHOM",
    clear: "WYCZYŚĆ",
    uploading: "Wgrywam program do mikrokontrolera…",
    running: "Program działa — obserwuj diodę.",
    wrong: "Prawie! Spróbuj zmienić kolejność instrukcji.",
    hintFlash: "Dioda tylko mignęła — przerwa musi być pomiędzy włączeniem a wyłączeniem.",
    hintStaysOn: "Dioda świeci i ani myśli zgasnąć. Zastanów się, które polecenie powinno być ostatnie.",
    win: "PROGRAM DZIAŁA! MIKROKONTROLER WYKONUJE TWOJE POLECENIA.",
    extra: "Właśnie wykonałeś pierwszy krok w kierunku programowania urządzeń elektronicznych.",
    codeCaption: "Tak mógłby wyglądać Twój program w języku C:",
    replay: "URUCHOM JESZCZE RAZ",
    next: "DALEJ"
  },

  booth: {
    eyebrow: "ZADANIE 4/4 · WYZWANIE NA STOISKU",
    title: "CZAS NA PRAWDZIWĄ INŻYNIERIĘ!",
    text1: "Na ekranie wszystko wygląda prosto. Ale inżynieria to nie tylko symulacje.",
    text2: "Podejdź do naszego stoiska i odnajdź przygotowany model techniczny.",
    hintTitle: "Czego szukasz?",
    hint: "Szukaj: {hint}. Poproś osobę na stoisku, żeby pokazała Ci model i opowiedziała, jak działa.",
    found: "ODNALAZŁEM MODEL",
    confirmTitle: "NA PEWNO TO TEN?",
    yes: "TAK, MISJA WYKONANA",
    no: "NIE, JESZCZE POSZUKAM",
    noMsg: "Dobry inżynier sprawdza dwa razy. Szukaj dalej!",
    wait: "Rozejrzyj się po stoisku — model na Ciebie czeka.",
    win: "MODEL ODNALEZIONY. CZAS URUCHOMIĆ CAŁY SYSTEM!",
    next: "DO PANELU STEROWANIA"
  },

  launch: {
    eyebrow: "FINAŁ",
    title: "PANEL STEROWANIA LABORATORIUM",
    panelTitle: "STATUS SYSTEMÓW",
    systems: [
      { icon: "bulb",  name: "Obwód elektryczny",      status: "GOTOWY" },
      { icon: "motor", name: "Silnik elektryczny",     status: "GOTOWY" },
      { icon: "chip",  name: "Mikrokontroler",         status: "GOTOWY" },
      { icon: "cube",  name: "Stanowisko techniczne",  status: "GOTOWE" }
    ],
    button: "URUCHOM LABORATORIUM",
    gauge: "SPRAWNOŚĆ",
    win: "GRATULACJE! LABORATORIUM WIEiK ZOSTAŁO URUCHOMIONE.",
    lines: [
      "Obwody działają, silniki się obracają, a mikrokontroler wykonuje polecenia.",
      "Wygląda na to, że masz zadatki na inżyniera!"
    ],
    next: "ODBIERZ CERTYFIKAT"
  },

  finish: {
    eyebrow: "LABORATORIUM ONLINE",
    title: "MISJA ZAKOŃCZONA SUKCESEM!",
    subtitle: "Właśnie ukończyłeś ekspresowy kurs uruchamiania wirtualnego laboratorium.",
    nameLabel: "Imię na certyfikacie (opcjonalnie)",
    namePlaceholder: "np. Ola",
    nameNote: "Nie zapisujemy go nigdzie — zostaje tylko na Twoim urządzeniu.",
    pdf: "POBIERZ CERTYFIKAT PDF",
    pdfBusy: "GENERUJĘ PDF…",
    pdfDone: "Certyfikat gotowy! Jeśli pobieranie się nie rozpoczęło, użyj linku poniżej.",
    pdfOpen: "Otwórz certyfikat PDF",
    pdfError: "Nie udało się wygenerować PDF. Spróbuj ponownie za chwilę.",
    prize: "ODBIERZ PAMIĄTKĘ NA STOISKU",
    study: "STUDIUJ NA WIEiK",
    replay: "ZAGRAJ PONOWNIE",
    prizeTitle: "MISJA UKOŃCZONA",
    prizeMsg: "Pokaż ekran ukończenia gry obsłudze stoiska i zapytaj o {prize}. {note}",
    close: "ZAMKNIJ"
  },

  certificate: {
    kicker: "CERTYFIKAT",
    awardedTo: "przyznany dla",
    anonymous: "Uczestnika misji BLACKOUT",
    body: "Za pomyślne uruchomienie obwodu elektrycznego, sterowanie silnikiem, zaprogramowanie mikrokontrolera i ukończenie wyzwania inżynierskiego.",
    note: "Certyfikat pamiątkowy — gra edukacyjna WIEiK Politechniki Krakowskiej.",
    badges: ["OBWÓD", "SILNIK", "MIKROKONTROLER", "WYZWANIE"],
    date: "DATA",
    number: "NR",
    seal: ["LAB", "100%", "ONLINE"]
  },

  study: {
    eyebrow: "CO DALEJ?",
    site: "STRONA WYDZIAŁU",
    admissions: "REKRUTACJA",
    back: "WRÓĆ DO CERTYFIKATU"
  },

  errors: {
    generic: "Ups! Coś poszło nie tak. Spróbuj odświeżyć stronę.",
    restart: "ZACZNIJ OD NOWA"
  }
};
