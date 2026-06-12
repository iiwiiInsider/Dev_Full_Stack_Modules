# OneDrive Moodboard

A responsive, animated web app built with Express, EJS, and Axios that turns your OneDrive folders into a visual moodboard. Sign in with Microsoft, browse your OneDrive, and render any folder of images as a fluid CSS grid.

## Features
- OAuth2 sign-in with Microsoft (Azure AD / Entra) via Microsoft Graph
- Browse root and Pictures; open any folder
- Server fetches Graph data; client uses Axios to talk to our API
- Responsive, Masonry-like CSS grid with variable tile spans
- Strong defaults: Helmet, compression, rate limiting (add-on), sessions

## Setup
1) Create an app registration in Azure Portal
   - Azure Portal → Microsoft Entra ID (Azure AD) → App registrations → New registration
   - Name: OneDrive Moodboard (any)
   - Supported account types: Choose per your needs
   - Redirect URI (type Web): `http://localhost:3000/auth/callback`
   - Register

2) Collect values for .env
   - AZURE_CLIENT_ID: From your app’s Overview page (Application (client) ID)
   - AZURE_TENANT: Use `common` to support both personal and org accounts, or your Directory (tenant) ID/domain for org-only
   - AZURE_REDIRECT_URI: Must match `http://localhost:3000/auth/callback` you added
   - AZURE_CLIENT_SECRET: App → Certificates & secrets → New client secret → copy the Secret Value

3) Add Microsoft Graph API permissions
   - App → API permissions → Add a permission → Microsoft Graph → Delegated permissions
   - Required: `offline_access`, `Files.Read`, `User.Read`
   - Optional: `Files.Read.All`, `Files.ReadWrite` (for broader folder/file access)
   - For organizational tenants, click “Grant admin consent” if needed

4) Copy `.env.example` to `.env` and fill values:

```
PORT=3000
SESSION_SECRET=your_secret
AZURE_TENANT=common
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
AZURE_REDIRECT_URI=http://localhost:3000/auth/callback
AZURE_SCOPES=offline_access Files.Read User.Read Files.Read.All Files.ReadWrite
```

3. Install and run:

```
npm install
npm run dev
```

Open http://localhost:3000 and click "Connect OneDrive".

## Notes
- Thumbnails are proxied by redirecting to Graph thumbnail URLs per item id
- Adjust scopes to your needs; prefer least privilege
- This project uses ESM (type: module)

## Scripts
- `npm run dev` — run with live reload (Node --watch)
- `npm start` — production mode
