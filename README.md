# GeoExplorer – Coming Soon

Taktyczny interfejs "coming soon" w stylu terminala GIS (React + Next.js, JavaScript).

## Funkcje

- **Wierne odwzorowanie designu** — paleta kolorów, typografia (IBM Plex Mono/Sans), spacing i animacje (scanlines, CRT flicker, boot sequence, glitch) 1:1 z kodu źródłowego
- **Animowane tło WebGL** — topograficzne linie konturowe (FBM noise) z reakcją na ruch myszy
- **Pełne i18n (11 języków)** — polski, angielski, niemiecki, francuski, hiszpański, włoski, portugalski, niderlandzki, ukraiński, czeski, szwedzki
- **Automatyczna detekcja języka** na podstawie:
  1. nagłówka `Accept-Language` (middleware, SSR bez mrugania treści),
  2. lokalizacji IP klienta (`ipapi.co`, z fallbackiem do `navigator.language`),
  3. ręcznego wyboru przez przełącznik w HUD (zapis w cookie, `locale_source=user`).
- Formularz newslettera z walidacją, ekranem potwierdzenia i zapisem subskrybentów
- Responsywny układ (mobile → desktop)

## Newsletter — zapisy

Priorytet (w kolejności): **Web3Forms** (zalecane, bez serwera) →
Google Sheets (Apps Script) → lokalne API.

### Web3Forms (0 zł, 0 skryptów, 0 serwera)

1. Wejdź na **https://web3forms.com**, podaj swój e-mail i skopiuj Access Key.
2. Skopiuj `.env.local.example` → `.env.local` i wstaw klucz:

```
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=twoj-klucz
```

Od tej pory każdy zapis przychodzi na Twój e-mail i jest widoczny
w dashboardzie Web3Forms. Nic więcej nie konfigurujesz.

### Tryb lokalny (fallback)

Jeśli żaden z powyższych nie jest ustawiony, formularz używa lokalnych
endpointów Next.js:

- **`POST /api/subscribe`** — zapis e-maila do `data/subscribers.json`
  (walidacja formatu, deduplikacja, zapis lokalizacji językowej i daty).
- **`GET /api/subscribers`** — eksport listy jako **CSV**
  (opcjonalnie zabezpieczony: ustaw `SUBSCRIBERS_ADMIN_KEY` w env,
  a następnie wyślij nagłówek `x-admin-key`).

> Uwaga: zapis do pliku działa na samodzielnym hoście (Twój komputer/VPS).
> Na platformach serverless (np. Vercel) plik nie jest trwały.

### Tryb Google Sheets (Apps Script) — opcjonalny

Formularz może pisać prosto do arkusza Google — nie potrzebujesz żadnego
serwera ani bazy:

1. Otwórz **sheets.new**, nazwij kartę `Subscribers` (kolumny: email, locale, source, createdAt).
2. **Rozszerzenia → Apps Script** i wklej:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Subscribers");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Subscribers");
    sheet.appendRow(["email", "locale", "source", "createdAt"]);
  }
  var data = JSON.parse(e.postData.contents);
  var email = String(data.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "invalid_email" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var existing = sheet.getDataRange().getValues();
  var isNew = existing.every(function (row) {
    return String(row[0]).toLowerCase() !== email;
  });
  if (isNew) {
    sheet.appendRow([email, data.locale || "en", data.source || "page", new Date().toISOString()]);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Wdróż → Nowe wdrożenie → Aplikacja internetowa**:
   *Wykonuj jako*: Ja → *Dostęp*: Każdy użytkownik → skopiuj URL (kończy się na `/exec`).
   > Po każdej zmianie kodu skryptu: zapisz i **Wdróż → Zarządzaj wdrożeniami →
   > Edytuj → Wersja: Nowa wersja** (inaczej starsza wersja bez `doPost`
   > zwróci błąd 405).
4. Skopiuj `.env.local.example` → `.env.local` i wstaw URL:

```
NEXT_PUBLIC_NEWSLETTER_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
```

Od tej pory każdy zapis ląduje w arkuszu — bez serwera, bez kosztów.
Jeśli URL nie jest ustawiony, formularz domyślnie używa lokalnego `/api/subscribe`.

> Formularz wysyła dane jako `text/plain` — Apps Script nie obsługuje
> preflight (OPTIONS) dla `application/json` (błąd CORS 405), natomiast
> requesty „proste" przechodzą normalnie.

### Ścieżka rozwoju (masowe wysyłki)

Gdy zbierzesz subskrybentów i będziesz chciał wysyłać kampanie,
podepnij darmowe, open source narzędzie:

- **Listmonk** (open source, GPLv3) — self-hosted przez Docker
  (`docker run -d -p 3000:3000 listmonk/listmonk`), własne listy,
  szablony i wysyłka. Importuj listę z eksportu CSV.
- **Brevo / Resend** — darmowe limity (300/100 e-maili dziennie),
  proste API do wysyłki na subskrybentów.

## Uruchomienie

```bash
npm install
npm run dev      # http://localhost:3000
```

## Produkcja

```bash
npm run build
npm start
```

## Struktura

```
src/
├── app/
│   ├── layout.js          # fonty, metadata per locale, Material Symbols
│   ├── page.js            # odczyt cookie locale (SSR)
│   └── globals.css        # design tokens (Tailwind v4 @theme) + animacje CRT
├── components/
│   ├── GeoExplorerPage.js # główna scena (boot, glitch, HUD, newsletter, stopka)
│   ├── ShaderBackground.js# tło WebGL (topograficzne kontury)
│   └── LocaleSwitcher.js  # przełącznik języka
├── lib/
│   └── i18n.js            # słowniki 11 języków + detekcja (IP, Accept-Language)
└── middleware.js          # ustawia wstępny język z Accept-Language
```

## Stack

Next.js 16 (App Router), React 19, Tailwind CSS v4, JavaScript.
