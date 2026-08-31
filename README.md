<<<<<<< HEAD
# Gathotkaca X-Shield — Implementation (Milestone 1: SOC Dashboard)

Scope of this milestone: a working, secure, end-to-end vertical slice —
**SOC Dashboard** — wired to the real Wazuh Indexer API, plus the full
app shell (sidebar/topbar) matching the reference design for all 9
sections. Only SOC Dashboard has live data; the rest are visible in
navigation but marked "Soon" per the rule against inventing business
functionality that hasn't been defined/confirmed yet.

## A. Design Analysis

**Pages found in the reference (9 sections, ~35 sub-views):** Executive
Dashboard, CISO Dashboard, SOC Dashboard, SOC L2 Console (6 tabs), AI
Cyber Security Copilot (6 tabs), Vulnerability Dashboard, Regulatory &
Security Compliance Dashboard (5 tabs), Security Data & Integration Hub
(7 tabs), MSSP Portal (10 tabs).

**Shared layout:** fixed dark-navy left sidebar (nav + theme toggle),
white topbar (page title/subtitle, business-unit filter, date-range
filter, notifications, user menu), KPI stat-card row, then a grid of
chart/table panels. Consistent severity color coding (red/orange/yellow/
green = critical/high/medium/low) across every dashboard.

**Navigation:** all 9 sections are siblings in one persistent sidebar;
sub-sections (SOC L2, AI Copilot, Compliance, Data Hub, MSSP) use a
horizontal tab bar under the page header.

**API needs identified:**
- SOC Dashboard, SOC L2 Console, Vulnerability Dashboard → Wazuh Indexer
  (+ Wazuh Manager for agent/system status)
- AI Copilot tabs → Ollama (local LLM) for summarization/analysis/chat
- Threat Intelligence panels (SOC L2, AI Copilot IOC Analysis) →
  ThreatFox, VirusTotal, AbuseIPDB
- Executive / CISO / Compliance / Data Hub / MSSP dashboards → **no
  clear source in the given `.env` list.** These show business KPIs
  (compliance %, business-unit breakdowns, client/tenant data, policy
  lifecycle) that aren't native to Wazuh or the threat-intel APIs. Per
  the brief's own instruction not to invent business features, these are
  **not implemented yet** — see Open Questions.

## B. Project Architecture

```
src/
├── app/
│   ├── api/soc/                 # Server-only route handlers (proxy layer)
│   │   ├── alerts-by-severity/route.ts
│   │   ├── alerts-trend/route.ts
│   │   ├── live-events/route.ts
│   │   └── top-rules/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx           # Sidebar + sidebar-toggle context
│   │   └── soc/page.tsx         # SOC Dashboard (implemented)
│   ├── layout.tsx / page.tsx / globals.css
├── components/
│   ├── layout/                  # Sidebar, Topbar
│   ├── dashboard/                # Panel-specific chart/table components
│   └── ui/                      # Panel + loading/empty/error primitives
├── services/                     # ONE file per external API — the only
│   ├── wazuh-indexer.ts          # place that knows upstream response shape
│   └── wazuh-manager.ts
├── lib/
│   ├── env.ts                    # server-only, validated env access
│   ├── http.ts                   # typed fetch wrapper (timeout/error kinds)
│   └── api-result.ts             # HttpError → ApiResult<T> mapping
├── types/soc.ts                  # Types for OUR normalized API responses
└── hooks/useApiResult.ts         # Client hook: loading/empty/error/ready
```

Data flow: `UI Component → useApiResult() → /api/soc/* route handler →
services/wazuh-*.ts → Wazuh Indexer/Manager`. Credentials only ever
exist in `services/*` and `lib/env.ts`, both guarded by the `server-only`
package, which fails the build if imported from a Client Component.

## Authentication (DB-based — implemented this milestone)

- `users` table, migration in `db/migrations/001_users.sql`.
- Login: `POST /api/auth/login` (email+password → bcrypt check →
  httpOnly JWT cookie `gxs_session`, 8h expiry).
- Logout: `POST /api/auth/logout` clears the cookie.
- Session check: `GET /api/auth/me`.
- `src/middleware.ts` protects every `/dashboard/*` route at the edge —
  no valid session cookie redirects to `/login?next=<path>`.
- No public signup route on purpose (internal security tool). Create the
  first user with the provided script — see "How to Run" below.

**Password hashing:** bcrypt (cost 12), via `bcryptjs`. **Session:** JWT
signed with `JWT_SECRET` (HS256), verified both in middleware (Edge
runtime, `jose`) and in `/api/auth/me` (Node runtime).

## C. API Mapping (updated)

| Fitur | API | Environment Variable | Method | Keterangan |
|---|---|---|---|---|
| Login | Internal DB | `DATABASE_URL`, `JWT_SECRET` | POST `/api/auth/login` | bcrypt + JWT cookie |
| Logout | — | — | POST `/api/auth/logout` | Clears cookie |
| Session check | Internal DB (JWT only, no DB hit) | `JWT_SECRET` | GET `/api/auth/me` | |
| Route protection | — | `JWT_SECRET` | Edge middleware | Redirects to `/login` |
| Alerts by Severity (donut) | Wazuh Indexer `_search` + range agg on `rule.level` | `WAZUH_INDEXER_*`, `WAZUH_INDEXER_ALERTS_INDEX` | POST | `/api/soc/alerts-by-severity` |
| Alerts Over Time (trend) | Wazuh Indexer `_search` + date_histogram | `WAZUH_INDEXER_*` | POST | `/api/soc/alerts-trend` |
| Live Events (last 10) | Wazuh Indexer `_search` sorted desc | `WAZUH_INDEXER_*` | POST | `/api/soc/live-events` |
| Top Alerting Rules | Wazuh Indexer `_search` + terms agg | `WAZUH_INDEXER_*` | POST | `/api/soc/top-rules` |
| Agent/system health (internal, no panel yet) | Wazuh Manager `/agents/summary/status` | `WAZUH_API_*` | GET (Bearer, cached token) | `services/wazuh-manager.ts` |



## D. Implementation

See source tree above. Every panel independently fetches its own route
so one failing panel never breaks the page (`live-events` failing
doesn't stop `alerts-trend` from rendering).

## E. `.env.example`

See `.env.example` in the project root — every variable from your list
is present with no values, plus inline comments on what consumes it and
whether it's wired up yet.

## F. Verification

Manual checks performed on the code (this environment cannot run
`npm run dev` against a live Wazuh instance, so these are static/logic
checks, not a live build — see "How to verify yourself" below):

- ✅ No credential is referenced outside `lib/env.ts` / `services/*`,
  and both are marked `server-only`.
- ✅ Every route handler wraps its service call in try/catch and always
  returns HTTP 200 with a typed `ApiResult` — the UI never sees a raw
  5xx from `fetch`, and can distinguish empty vs. error vs. loading.
- ✅ All panels handle loading/empty/error independently (no single
  point of failure).
- ✅ Tables scroll horizontally on small screens instead of breaking
  the grid (`overflow-x-auto`); sidebar collapses to an off-canvas
  drawer under `lg` breakpoint.
- ⚠️ Not yet run through `tsc`/`next build` in this environment — do
  this locally as the first step (see below) since a real Wazuh
  Indexer response may not match the aggregation shape assumed in
  `wazuh-indexer.ts` exactly (this varies by Wazuh version).

## G. Daftar Masalah dan Perbaikan (Open Questions / Known Gaps)

| No | Masalah | File | Dampak | Perbaikan |
|---|---|---|---|---|
| 1 | Executive/CISO/Compliance/Data Hub/MSSP dashboards confirmed as "API dan DB" but exact schema/tables and which additional external APIs aren't defined yet | n/a | Can't build these yet without inventing table/field names | Need per-section: table schema (or confirm I design it) + which external API(s) feed which stat cards |
| ~~2~~ | ~~No auth flow implemented~~ | — | — | **Resolved this milestone** — DB-based auth (bcrypt + JWT cookie + edge middleware) now implemented |
| 2 | Wazuh Indexer aggregation field names (`rule.level`, `rule.description.keyword`, `agent.name`) assumed from typical Wazuh index templates | `services/wazuh-indexer.ts` | May not match your actual index mapping | Confirm field names against your real index, or share a sample document |
| 3 | Stat cards seen in the reference (Total Events, Incidents, MTTD, MTTR) not implemented | `dashboard/soc/page.tsx` | KPI row missing from SOC Dashboard | MTTD/MTTR need incident timestamps — confirm source (Wazuh doesn't track "incidents" natively) |
| 4 | Ollama/Bitdefender/ThreatFox/VirusTotal/AbuseIPDB integrations not yet used | `lib/env.ts` (getters exist, unused) | AI Copilot & threat-intel panels not built | Next milestone once SOC Dashboard is confirmed correct |
| 5 | No signup UI (by design) | — | First user must be created via CLI script | Run `scripts/create-user.mjs` once, documented below |

## How to Run (updated)

```bash
npm install
cp .env.example .env          # fill in real values, including DATABASE_URL and JWT_SECRET
psql "$DATABASE_URL" -f db/migrations/001_users.sql
node scripts/create-user.mjs --email you@company.com --password "change-me" --name "Your Name" --role admin
npm run dev
```

Visit `http://localhost:3000` → redirected to `/login` (via middleware,
since `/dashboard/soc` now requires a session) → sign in → SOC
Dashboard.

## H. Cara Menjalankan

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

Open `http://localhost:3000` — it redirects to `/dashboard/soc`.

**Before relying on this in production:** run `npm run build` to catch
any TypeScript/aggregation-shape mismatches against your real Wazuh
Indexer response, and confirm the field names noted in Open Question 3.
=======
# gathotkaca-x-shield
>>>>>>> 052414e2057a469e6f1ea451870ab60fced62b4a
