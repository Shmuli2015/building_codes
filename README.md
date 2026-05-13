# Building entry codes — search by street and number

A [Next.js](https://nextjs.org) 16 (App Router) app in Hebrew (RTL) with an optional [Google Sheets API](https://developers.google.com/sheets/api) connection via a service account. Without credentials, the app shows sample rows.

## Run locally

```bash
npm install
cp .env.example .env.local
# Edit .env.local — see the environment variables table below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sheet layout

The first row must be headers. You need to map at least **address** (or street), **number**, and **code**; other columns are optional. Full header-to-field mapping is in [`lib/building-codes.ts`](lib/building-codes.ts) (`HEADER_TO_FIELD`).

Example header row (Hebrew sheet): `אזור` · `כתובת` · `מספר` · `סוג קוד` · `קוד` · `הערה` (columns A–F).

Default read range: `גיליון1!A:F` (tab name matches common Hebrew Google Sheets UI). If your tab is named differently (e.g. `Sheet1`), set `GOOGLE_SHEET_RANGE` in `.env.local`.

## Google Cloud and Sheets API

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Sheets API**.
3. Create a **service account** → generate and download a JSON key.
4. Share the spreadsheet with the service account email (Viewer).
5. Paste the full JSON into `GOOGLE_SERVICE_ACCOUNT_JSON` as a single line in `.env.local` / Vercel.

`GOOGLE_SHEET_ID` is in the sheet URL between `/d/` and `/edit`.

## Environment variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEET_ID` | Spreadsheet ID |
| `GOOGLE_SHEET_RANGE` | A1 notation (default `גיליון1!A:F`; match your tab name) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON |
| `CODES_CACHE_TTL_MS` | Server cache TTL in ms (default `180000`) |
| `NEXT_PUBLIC_SITE_URL` | (Optional) Canonical site URL for `metadataBase` and Open Graph |

Without `GOOGLE_SHEET_ID` / `GOOGLE_SERVICE_ACCOUNT_JSON`, the app runs in **demo** mode with sample data.

## Deploy (Vercel)

Add the same variables in the project settings. Do not commit `GOOGLE_SERVICE_ACCOUNT_JSON` to the repo.

## API

- `GET /api/codes` — JSON with `rows`, `warnings`, `source`, `fetchedAt`, `cacheExpiresAt`, `cacheHit`.
- `GET /api/codes?refresh=1` — bypass cache and reload from the sheet.

## Local checks

```bash
npm run lint
npm run build
```
