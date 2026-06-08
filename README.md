# Aikvis — Next.js Storefront + Admin

E-commerce storefront (COD only) with admin panel, MySQL database, and FTP image uploads.

## Tech stack

- Next.js 16 (App Router)
- MySQL (Hostinger)
- JWT admin auth
- FTP uploads (Hostinger)

## Local development

```bash
cd aikvis
cp .env.example .env.local
# Fill all values in .env.local
npm install
npm run dev
```

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Deploy on Vercel (step by step)

### 1. Push code to GitHub

Push the **`aikvis`** folder as the project root (or set **Root Directory** = `aikvis` in Vercel if the repo is the parent `NEW_NEXT` folder).

### 2. Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework Preset:** Next.js (auto-detected)
4. **Root Directory:** `aikvis` (if repo contains parent folder)
5. **Node.js Version:** 20.x (set in Project → Settings → General)

### 3. Environment variables (Vercel → Settings → Environment Variables)

Add **all** of these for **Production**, **Preview**, and **Development**:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | e.g. `srv905.hstgr.io` |
| `DB_PORT` | `3306` |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `DB_SSL` | `false` (set `true` if Hostinger requires SSL) |
| `JWT_KEY` | Long random secret string |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `SETUP_SECRET` | Secret for one-time DB setup API |
| `FTP_HOST` | FTP server IP/hostname |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `FTP_BASE_URL` | Public asset domain (no `https://`) |
| `FTP_UPLOAD_DIR` | `/public_html/` |
| `FTP_SECURE` | `false` |
| `FTP_PRODUCT_DIR` | `aikvis-products` |

> Never commit `.env.local` — use Vercel dashboard only for production secrets.

### 4. Hostinger — allow Vercel to reach MySQL (CRITICAL)

In **hPanel → Databases → Remote MySQL**:

1. Open **Remote MySQL**
2. Add access host: **`%`** (allows Vercel serverless to connect)
3. Save

Without this, the Vercel **build will pass** but the **live site** will show empty data / errors because MySQL blocks external connections (`ETIMEDOUT`).

Use hostname `srv905.hstgr.io` (or your Hostinger DB host) — not `localhost`.

### 5. Deploy

Click **Deploy**. Vercel runs `npm install` and `npm run build` automatically.

### 6. First-time database setup (after deploy)

Run once after the first successful deploy:

```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/api/setup \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

Or use Postman with:

- **Method:** POST
- **URL:** `https://YOUR-DOMAIN.vercel.app/api/setup`
- **Header:** `x-setup-secret: YOUR_SETUP_SECRET`

This creates all tables, default admin, site config, and seed products (first install only).

### 7. Login to admin

- URL: `https://YOUR-DOMAIN.vercel.app/admin/login`
- Use `ADMIN_USERNAME` / `ADMIN_PASSWORD` from env vars

Change the admin password after first login if you used a temporary one.

## Custom domain

1. Vercel → Project → **Settings → Domains**
2. Add your domain (e.g. `aikvis.com`)
3. Update DNS at your registrar as Vercel instructs
4. HTTPS is automatic

## Project structure

| Path | Purpose |
|------|---------|
| `/` | Storefront home |
| `/admin` | Admin dashboard |
| `/admin/products` | Product CRUD |
| `/admin/orders` | Orders management |
| `/admin/site-config` | Logos, branding, Meta pixel |
| `/api/setup` | One-time DB init (protected) |

## Build

```bash
npm run build
npm start
```

## Notes

- **Region:** `vercel.json` uses `bom1` (Mumbai) for faster India traffic — change in `vercel.json` if needed.
- **FTP uploads:** Admin image upload uses serverless functions (60s timeout).
- **Caching:** Storefront pages are cached; admin changes invalidate cache on save.
