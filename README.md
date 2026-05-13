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

The application expects two main data sources in your Google Sheet:

### 1. Building Codes (Main Tab)
- Default tab name: `גיליון1` (Override with `GOOGLE_SHEET_RANGE`).
- Expected columns: `area`, `street`, `number`, `code`, `kind`, `note` (mapping is flexible, see `lib/building-codes.ts`).

### 2. Authorized Emails (Auth Tab)
- Default tab name: `מורשים` (Override with `GOOGLE_SHEET_AUTH_RANGE`).
- Expects a list of emails in the first column (Column A).

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
