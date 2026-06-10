# Building Entry Codes Search

A modern [Next.js](https://nextjs.org) 16 (App Router) application in Hebrew (RTL) for searching building entry codes. The data is fetched from Google Sheets with a built-in authentication layer.

## Key Features

- **Authenticated Access**: Login page requiring an authorized email and a password.
- **Google Sheets Integration**: Fetches building codes and authorized emails directly from a spreadsheet.
- **Premium UI**: Clean, RTL-optimized interface with glassmorphism, smooth animations (Framer Motion), and a light theme.
- **WhatsApp Integration**: Optional banner for users to submit or update codes via WhatsApp.
- **Secure Sessions**: JWT-based session management.

## Setup & Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Spreadsheet Configuration

The application expects two tabs in the same Google Spreadsheet. Share the sheet with your service account email (Editor or Viewer).

### 1. Building Codes (main tab)

- **Tab name:** `גיליון1` (override with `GOOGLE_SHEET_RANGE`, e.g. `Sheet1!A:F`)
- **Range:** `A:F` — row 1 is headers, data starts at row 2
- **Empty rows** are skipped

| Column | Header (Hebrew) | Header (English) | Field | Required |
|--------|-----------------|------------------|-------|----------|
| A | שכונה / אזור | area | Neighborhood / area | No |
| B | כתובת / רחוב | street | Street name | **Yes** |
| C | מספר | number | Building number | **Yes** |
| D | סוג / סוג קוד | kind | Code type (e.g. קוד, מפתח) | No |
| E | קוד | code | Entry code | **Yes** |
| F | הערה | note | Notes | No |

**Example (row 1 = headers):**

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| שכונה | כתובת | מספר | סוג | קוד | הערה |
| וותיקה | העלייה | 3 | מפתח | 1417 | |
| וותיקה | ינאי | 3 | קוד | 3131 | |

Header labels are flexible: Hebrew or English aliases are accepted (see `lib/building-codes.ts`). Each logical field is mapped once from the header row — duplicate columns for the same field are ignored.

### 2. Authorized Emails (auth tab)

- **Tab name:** `מורשים` (override with `GOOGLE_SHEET_AUTH_RANGE`)
- **Range:** `A:A` — one authorized email per cell
- **No header row** — put emails starting at row 1 (every non-empty value in column A is treated as an allowed login email)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_SHEET_ID` | The ID of your Google Spreadsheet. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full service account JSON as a single line. |
| `ADMIN_PASSWORD` | The master password for site access. |
| `GOOGLE_SHEET_RANGE` | (Optional) Range for codes (default `גיליון1!A:F`). |
| `GOOGLE_SHEET_AUTH_RANGE` | (Optional) Range for authorized emails (default `מורשים!A:A`). |
| `NEXT_PUBLIC_WHATSAPP_E164` | (Optional) WhatsApp number for the contact banner (e.g. `972501234567`). |
| `AUTH_ALLOWLIST_DEV_EMAIL` | (Optional) Email allowed in dev mode when sheet is disconnected. |
| `CODES_CACHE_TTL_MS` | (Optional) Server cache TTL in ms (default `180000`). |

## Deployment

Deploy easily on Vercel. Ensure all environment variables are added to the project settings. Do not commit `.env.local` or service account keys to your repository.

## Development Checks

```bash
npm run lint    # Check for code quality issues
npm run build   # Validate production build
```
