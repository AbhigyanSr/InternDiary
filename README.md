<div align="center">

<br />

# Intern Diary

*A field journal for placement season.*

Find internships, track every application, plan your preparation,<br />
learn from real interview experiences and follow the tech news that matters to you.

<br />

![React](https://img.shields.io/badge/React_18-315C48?style=flat-square&logo=react&logoColor=F7F6F2)
![Express](https://img.shields.io/badge/Express_5-315C48?style=flat-square&logo=express&logoColor=F7F6F2)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-315C48?style=flat-square&logo=mongodb&logoColor=F7F6F2)
![Gemini](https://img.shields.io/badge/Gemini_AI-315C48?style=flat-square&logo=googlegemini&logoColor=F7F6F2)
![Vercel](https://img.shields.io/badge/Vercel-242424?style=flat-square&logo=vercel&logoColor=F7F6F2)
![Render](https://img.shields.io/badge/Render-242424?style=flat-square&logo=render&logoColor=F7F6F2)

<br />

[Features](#features) &nbsp;·&nbsp; [Highlights](#highlights) &nbsp;·&nbsp; [Architecture](#architecture) &nbsp;·&nbsp; [Getting started](#getting-started) &nbsp;·&nbsp; [Deployment](#deployment) &nbsp;·&nbsp; [API](#api)

</div>

<br />

---

## About

Placement preparation is usually scattered across forwarded PDFs, personal spreadsheets, to-do apps and word-of-mouth advice. **Intern Diary** brings it together in one web application with two roles:

- **Students** browse opportunities, track applications, plan their preparation, read and share interview experiences, and get tech news filtered to their chosen domains.
- **Admins** publish opportunities (with AI that turns a job-description PDF into a ready-to-review posting), moderate interview experiences and refresh the news feed.

<br />

## Features

| | |
|---|---|
| **AI job posting from a PDF** | Upload a job description; Gemini extracts the title, company, type, location, skills, experience, apply link and deadline into the form for review. Nothing is published until an admin confirms. |
| **AI-curated tech news** | Five industry RSS feeds are read, summarised and tagged by Gemini, and filtered to each student's domains: Web Dev, Cloud, DevOps, AI/ML and Cybersecurity. Visitors who aren't logged in see the three latest headlines. |
| **Opportunity feed** | Internships, hackathons and webinars with type filters, active and missed sections, full details, the original JD PDF and one-click *Mark as applied*. |
| **Application tracker** | Every application with status, notes, search and pagination. Applying from the feed adds it automatically, and duplicates are blocked. |
| **Interview experiences** | Round-by-round accounts with difficulty, outcome and tips. Submissions wait in an admin moderation queue; visitors get a short preview. |
| **Preparation planner** | A checklist for DSA, resume, behavioural and application prep. |
| **Dashboard** | Active opportunities, applications tracked, interviews and offers, and prep progress at a glance. |
| **Profile and resume** | Choose your domains and upload a PDF resume you can open from anywhere. |
| **Accounts and roles** | JWT sessions, hashed passwords, separate student and admin areas, and a password reset flow. |

<br />

## Highlights

**Applied AI with a person in the loop.** Gemini responses are forced into a JSON schema and validated on the server. A single bad field is left blank and flagged for the admin instead of failing the whole extraction.

**Defence against prompt injection.** PDF and article text is treated as untrusted data, only approved models can be used, and AI output is checked against a fixed set of technology domains before it is stored.

**Responsible scraping.** The news crawler obeys each site's `robots.txt`, including crawl delays, spaces out its requests, uses timeouts, and fetches full pages only for articles it will store. One failing feed never stops the others.

**Cost-aware on a free tier.** Each run caps articles and Gemini requests, skips stored URLs before any AI call, and rotates between feeds. If Gemini is unavailable, articles are saved with the feed's own summary.

**Duplicate-free by design.** Article URLs are normalised and protected by a unique index; applications use a partial unique index per student and opportunity.

**Built for free hosting.** Uploaded PDFs live in MongoDB, so they survive Render restarts, and news refreshes itself on the first visit after six hours because a sleeping server cannot run scheduled jobs.

**A designed product.** An editorial design system built on shared tokens: a paper background, Georgia headlines, Inter for interface text and a single forest-green accent.

<br />

## Architecture

```
  React (Vercel)  ──  REST + JWT  ──▶  Express API (Render)  ──▶  MongoDB Atlas
                                              │
                                              ├──▶  Gemini API   (job extraction, news enrichment)
                                              └──▶  RSS feeds    (news ingestion)
```

| Layer | Stack |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS with custom design tokens, Context API |
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcrypt, Multer, pdf-parse |
| AI and data | `@google/genai`, rss-parser, Cheerio, node-cron |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

**Collections:** `User` · `Opportunity` · `Application` · `Task` · `Interview` · `News` · `StoredFile`

<br />

## Getting started

**Requirements:** Node.js 20.19 or newer, and a MongoDB database (local or Atlas).

```bash
git clone https://github.com/AbhigyanSr/InternDiary.git
cd InternDiary

# Backend
cd server
npm install
cp .env.example .env      # then fill in the values below
npm start                 # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm start                 # http://localhost:3000
```

### Environment variables

Backend, in `server/.env`:

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret for signing login tokens |
| `GEMINI_API_KEY` | for AI | PDF extraction and news summaries |
| `GEMINI_MODEL` | no | `gemini-3.5-flash-lite` (default) or `gemini-3.1-flash-lite` |
| `CLIENT_URL` | in production | Allowed frontend origin(s), comma-separated |
| `NODE_ENV` | in production | `production` |
| `NEWS_AUTO_REFRESH` | no | Refresh stale news on visit (default `true`, every 6 hours) |

Frontend, set at build time:

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend URL ending in `/api` (defaults to `http://localhost:5000/api`) |

The full list, including news tuning options, is in [`server/.env.example`](server/.env.example).

> **Admin access:** set `role` to `"admin"` on a user document in MongoDB.

<br />

## Deployment

| Service | Settings |
|---|---|
| **Render** (backend) | Root directory `server` · Build `npm install` · Start `npm start` · Health check `/api/health` |
| **Vercel** (frontend) | Root directory `client` with the Create React App preset, or the repository root using `vercel.json` |
| **MongoDB Atlas** | Allow Render's outbound IPs in Network Access |

Step-by-step instructions are in [`DEPLOYMENT.md`](DEPLOYMENT.md). Free Render instances sleep after about fifteen minutes idle and take up to a minute to wake.

<br />

## API

| Area | Endpoints | Access |
|---|---|---|
| Auth | `POST /api/auth/register` · `login` · `forgot-password` · `verify-otp` · `reset-password` | Public |
| Jobs | `GET /api/jobs` · `POST` · `PUT /:id` · `DELETE /:id` · `POST /parse-pdf` | Students read, admins write |
| Applications | `GET /api/applications` · `POST` · `PATCH /:id` · `DELETE /:id` | Owner |
| Tasks | `GET /api/tasks` · `POST` · `PATCH /:id` · `DELETE /:id` | Owner |
| Interviews | `GET /api/interviews` · `GET /:id` · `POST` · `GET /pending` · `PUT /:id/approve` · `DELETE /:id` | Guests preview, admins moderate |
| News | `GET /api/news/public` · `/personalized` · `/status` · `POST /refresh` | Guests see three, admins refresh |
| Users and files | `GET /api/users/me` · `PUT /preferences` · `POST /api/user/resume` · `GET /api/files/:id` | Logged in |

<br />

## Project structure

```
InternDiary/
├── client/                  React frontend
│   ├── public/
│   └── src/
│       ├── components/      Layout, route guards, job and news cards
│       ├── context/         Auth state
│       ├── pages/           Landing, dashboard, news, interviews, tracker, planner, profile, admin
│       ├── services/        API client
│       └── index.css        Design tokens and shared styles
├── server/                  Express backend
│   ├── controllers/         Request handlers
│   ├── middleware/          Auth, admin and upload middleware
│   ├── models/              Mongoose schemas
│   ├── routes/              API routes
│   ├── utils/               Gemini, news scraper, ingestion and cron, file storage
│   ├── tests/               News pipeline tests
│   └── NEWS_INGESTION.md    How the news pipeline works
├── DEPLOYMENT.md
└── vercel.json
```

<br />

## Testing

```bash
cd server
npm test
```

Runs 14 tests for the news pipeline: URL normalisation, schema rules, deduplication, AI output validation, request budgets, overlapping runs, cron behaviour, feed failures, content extraction and `robots.txt` handling. All external services are mocked.

<br />

## Roadmap

- Email delivery for password-reset codes and stronger account security
- A mobile navigation menu
- Private, login-protected resume links
- Deadline reminders and a calendar view

<br />

---

<div align="center">

<br />

**Intern Diary**

<sub>Created by <a href="https://github.com/AbhigyanSr">AbhigyanSr</a> and contributors · ISC License</sub>

<br />

</div>
