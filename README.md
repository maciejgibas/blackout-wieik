# BLACKOUT: URATUJ WIEiK

Mobilna gra przeglądarkowa na stoisko WIEiK Politechniki Krakowskiej. Uczestnik w kilka minut uruchamia wirtualne laboratorium: obwód → silnik → mikrokontroler → zadanie na stoisku → start całego laboratorium → certyfikat PDF.

Czysty HTML/CSS/JavaScript, bez instalacji, logowania, backendu i bez etapu budowania.

## Uruchomienie

**Najprościej:** otwórz `index.html` w przeglądarce (dwuklik).

**Zalecane (tak, jak na hostingu):** lokalny serwer w katalogu projektu:

```bash
python3 -m http.server 8080
# albo
npx serve .
```

Następnie wejdź na `http://localhost:8080`. Aby sprawdzić grę na telefonie w tej samej sieci Wi-Fi, otwórz `http://<IP-komputera>:8080`.

> Przy otwarciu z dysku (`file://`) wszystko działa, ale przeglądarka może nie pozwolić umieścić logo w pliku PDF. Certyfikat wygeneruje się wtedy bez logo. Na serwerze HTTP(S) logo jest zawsze na certyfikacie.

## Publikacja i kod QR

1. Wgraj **cały katalog** na dowolny hosting statyczny (GitHub Pages, Netlify, Cloudflare Pages, serwer uczelni). Nie trzeba niczego konfigurować po stronie serwera.
2. Wpisz publiczny adres gry w `config.js` → `publicUrl`.
3. Otwórz `https://twoj-adres/qr.html`, sprawdź kod i kliknij **DRUKUJ**. Wydruk zawiera tylko tytuł, hasło i kod QR.

Strona musi być serwowana przez **HTTPS**, bo bez tego niektóre telefony blokują pobieranie plików i wibracje.

## Konfiguracja: `config.js`

| Pole | Co zmienia |
|---|---|
| `eventName` | nazwę wydarzenia na ekranie startowym i certyfikacie |
| `eventDate` | stałą datę na certyfikacie (puste = dzisiejsza) |
| `logo` | ścieżkę lub URL logo (SVG/PNG); puste = bez logo |
| `facultyUrl`, `admissionsUrl` | odnośniki na ekranie „Studiuj na WIEiK”; puste = przycisk ukryty |
| `prize.name`, `prize.note` | nagrodę w komunikacie „Odbierz pamiątkę” |
| `boothModelHint` | opis rekwizytu, który gracz ma znaleźć na stoisku |
| `study.areas` | kafelki z obszarami kształcenia |
| `certificate.title`, `askForName`, `fileName` | tytuł certyfikatu, pole imienia i nazwę pliku PDF |
| `sound.enabledByDefault`, `haptics` | domyślny dźwięk i wibracje |
| `kioskIdleResetSeconds` | tryb kiosku: powrót do startu po N sekundach bezczynności (0 = wyłączony) |

Wszystkie dialogi i komunikaty są w `js/texts.js`.

**Przed wydarzeniem do sprawdzenia:**
- Podmień `assets/logo-wieik.svg` na oficjalne logo wydziału. Dołączony plik jest tylko neutralnym znakiem zastępczym.
- Zweryfikuj adresy `facultyUrl` i `admissionsUrl`.
- Dopasuj `study.areas` do aktualnej oferty kierunków. Obecne opisy są celowo ogólne.

## Struktura

```
index.html            szkielet aplikacji (HUD, scena, warstwy efektów)
config.js             konfiguracja wydarzenia
qr.html               generator kodu QR do wydruku (dla organizatorów)
css/styles.css        cały wygląd i animacje
js/texts.js           wszystkie teksty gry
js/core/
  util.js             DOM, ikony, wibracje, formatowanie
  state.js            postęp zapisywany w sessionStorage (w ramach sesji)
  audio.js            efekty dźwiękowe syntezowane w Web Audio (bez plików)
  background.js       animowane ścieżki PCB w tle (canvas)
  confetti.js         konfetti z piorunami
  pdf.js              własny generator PDF (canvas → JPEG → PDF), bez bibliotek
  certificate.js      rysunek certyfikatu (podgląd i PDF)
  app.js              router scen, przejścia, HUD, okna dialogowe, obsługa błędów
js/scenes/            po jednym pliku na etap gry
js/main.js            start i wznowienie sesji
```

Nowy etap to nowy plik w `js/scenes/` z `BW.registerScene("id", { mount(el, api) { … } })` i wpis `<script>` w `index.html`. API sceny automatycznie sprząta timery i animacje przy zmianie ekranu.

## Prywatność

- Gra nie wysyła żadnych danych. Nie ma analityki, ciasteczek ani backendu.
- Postęp zapisuje się tylko w `sessionStorage` karty i znika po jej zamknięciu.
- Imię wpisane na certyfikat nie jest zapisywane. Trafia wyłącznie do pliku PDF tworzonego na urządzeniu.
- Z zewnątrz ładowane są tylko fonty Google Fonts. Bez internetu gra działa na fontach systemowych. `qr.html` pobiera dodatkowo bibliotekę QR z cdnjs.

## Zgodność

Testowane automatycznie (pełne przejście gry, generowanie PDF, wznowienie po odświeżeniu, ponowna gra) na silnikach Chromium (Android/Chrome) i WebKit (iPhone/Safari) w widoku 375×667. Gra respektuje ustawienie „ogranicz ruch” (`prefers-reduced-motion`). Wibracje działają tylko na urządzeniach, które je obsługują (Android). Na iPhonie przeglądarka je pomija.
