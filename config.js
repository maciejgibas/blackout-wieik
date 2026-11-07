/* =========================================================================
   BLACKOUT: URATUJ WIEiK — plik konfiguracyjny wydarzenia
   -------------------------------------------------------------------------
   Tutaj zmienisz nazwę wydarzenia, nagrodę, logo i adresy stron.
   Treści dialogów gry znajdziesz w pliku: js/texts.js
   ========================================================================= */
window.BW_CONFIG = {
  /* Nazwa wydarzenia — widoczna na ekranie startowym i na certyfikacie */
  eventName: "Targi Edukacyjne 2026",

  /* Data na certyfikacie. Puste = dzisiejsza data z urządzenia gracza. */
  eventDate: "",

  /* Dane jednostki */
  universityName: "Politechnika Krakowska",
  facultyName: "Wydział Inżynierii Elektrycznej i Komputerowej",
  facultyShort: "WIEiK",

  /* Logo (SVG/PNG, ścieżka względna lub pełny URL).
     Dołączony plik to neutralny znak zastępczy — podmień go na oficjalne logo
     wydziału zgodne z księgą znaku. Puste "" = brak logo. */
  logo: "assets/logo-wieik.svg",

  /* Oficjalne strony (ZWERYFIKUJ przed wydarzeniem). Puste "" = przycisk ukryty. */
  facultyUrl: "https://wieik.pk.edu.pl",
  admissionsUrl: "https://rekrutacja.pk.edu.pl",

  /* Publiczny adres gry — używany przez narzędzie qr.html do wygenerowania kodu QR.
     Puste = qr.html podpowie bieżący adres strony. */
  publicUrl: "",

  /* Nagroda na stoisku */
  prize: {
    name: "przygotowany gadżet",
    note: "Nagrody dostępne do wyczerpania zapasów."
  },

  /* Zadanie fizyczne — opis rekwizytu, który gracz ma odnaleźć na stoisku */
  boothModelHint: "wydrukowany w 3D model silnika elektrycznego",

  /* Ekran „Studiuj na WIEiK”. Opisy celowo ogólne — dopasuj je do aktualnej
     oferty kierunków i specjalności wydziału. */
  study: {
    heading: "STUDIUJ NA WIEiK",
    intro: "To, co przed chwilą zrobiłeś w grze, na studiach robisz naprawdę — w laboratoriach, z prawdziwym sprzętem i ludźmi, którzy pasjonują się techniką.",
    areas: [
      { icon: "bolt",  title: "Elektrotechnika i energetyka", text: "Obwody, maszyny elektryczne, odnawialne źródła energii i sieci przyszłości." },
      { icon: "motor", title: "Napędy i elektromobilność",     text: "Silniki, energoelektronika i sterowanie — od hulajnogi po tramwaj." },
      { icon: "chip",  title: "Systemy wbudowane",             text: "Mikrokontrolery, programowanie urządzeń i Internet Rzeczy." },
      { icon: "robot", title: "Automatyka i sterowanie",       text: "Czujniki, regulatory i układy, które same podejmują decyzje." }
    ]
  },

  /* Certyfikat */
  certificate: {
    title: "HONOROWY INŻYNIER WIEiK",
    askForName: true,               // pole „Imię na certyfikacie” (nie jest nigdzie zapisywane)
    fileName: "certyfikat-honorowy-inzynier-wieik.pdf"
  },

  /* Dźwięk i wibracje */
  sound: { enabledByDefault: true },
  haptics: true,

  /* Tryb kiosku (np. tablet na stoisku): po tylu sekundach bezczynności gra
     wraca do ekranu startowego. 0 = wyłączone. */
  kioskIdleResetSeconds: 0
};
