# Deployment Guide for Intern Diary

Frontend (React) on **Vercel**, backend (Express) on **Render**, data in **MongoDB Atlas**.
Deploy the backend first so you know its URL.

## 1. Backend on Render (Web Service)

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` (runs `node server.js`) |
| Node version | 20.19 or newer (declared in `server/package.json` `engines`) |
| Health check path (optional) | `/api/health` |

### Environment variables (Render → Environment)

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | yes | Atlas connection string |
| `JWT_SECRET` | yes | any long random string; changing it logs everyone out |
| `CLIENT_URL` | yes | your Vercel URL, e.g. `https://intern-diary.vercel.app` (no trailing slash; comma-separate several) |
| `NODE_ENV` | yes | `production` (`development` allows every CORS origin) |
| `GEMINI_API_KEY` | for AI | needed for PDF-to-job extraction and AI news summaries |
| `GEMINI_MODEL` | no | `gemini-3.5-flash-lite` (default) or `gemini-3.1-flash-lite`; other values are rejected |
| `ALLOW_VERCEL_PREVIEWS` | no | `true` to also allow `https://*.vercel.app` preview URLs |
| `NEWS_AUTO_REFRESH` | no | default on; refreshes news in the background when it is older than `NEWS_AUTO_REFRESH_HOURS` (default 6) |
| `NEWS_CRON_ENABLED` / `NEWS_CRON_SCHEDULE` | no | in-process cron; does not fire while a free instance is asleep |
| `NEWS_MAX_ARTICLES_PER_RUN`, `NEWS_LLM_REQUEST_BUDGET` | no | default 20 / 20 per refresh |
| `PORT` | no | Render sets it automatically |

MongoDB Atlas → Network Access must allow Render's outbound IPs (simplest: `0.0.0.0/0`).

## 2. Frontend on Vercel

Either project setup works:

- **Root Directory = `client`** (recommended): Framework preset *Create React App*, build `npm run build`, output `build`. `client/vercel.json` provides SPA routing.
- **Root Directory = repository root**: the root `vercel.json` installs and builds `client/` and serves `client/build` with SPA routing.

### Environment variable (Vercel → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://<your-render-service>.onrender.com/api` |

It is baked in at build time: **redeploy after changing it.**

## 3. After deploying

1. Open `https://<render-service>.onrender.com/api/health`: expect `{"status":"ok","database":"connected"}`.
2. Open the Vercel site, sign up and log in.
3. As an admin, open **Tech News** and click **Refresh news** to fill the news collection (or just wait: the first visit triggers a background refresh).
4. On the admin page, upload a job PDF, review the extracted fields and publish.

## Notes and limitations

- **Free Render instances sleep** after ~15 minutes idle; the first request takes ~30–60 s. Open the site a minute before presenting.
- **Uploads** (resumes, job PDFs) are stored in MongoDB (`storedfiles` collection, 5 MB max per file), so they survive Render restarts. Files uploaded before this change were on local disk and may be gone.
- **Uploaded files are reachable by anyone who has the link** (`/api/files/<id>`).
- **Admin accounts**: set `role: "admin"` on a user document in Atlas.
