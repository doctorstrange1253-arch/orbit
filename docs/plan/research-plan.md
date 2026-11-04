# Phase 1: Brief Research & Planning Plan

## 1. Current Product State (Confirmed from files read)

- **Product**: A fully built space‑themed gamified skill‑swap / mentorship platform.
- **Backend**: Node.js 18+, Express v5.2, Mongoose v9.3, Socket.io v4.8 + Redis adapter, Bull job queues, JWT + session auth, Cloudinary for media, Razorpay webhook for payments, Firebase Admin for push, email (Nodemailer + Brevo/SMTP tests), TOTP via speakeasy, passport OAuth (Google/GitHub/LinkedIn).
- **Frontend**: React v19 + Vite v8 + Tailwind v4, Zustand v5 stores, React Query v5, Leaflet maps, Lucide icons, Framer Motion, Capacitor (Android APK), PWA (workbox).
- **Database**: MongoDB (mongoose models directory = 40+ models including User, Course, OrbitSession, Subscription, Plan, MoneyLedger, PhotonLedger, SignalFlare, PactWeekLedger, FeatureFlag, etc.).
- **Real-time**: WebSocket rooms for video calls, chat, whiteboard, sessions, signal flares.
- **Gamification already present**: cosmic leaderboard, orbit streak/freeze/missions, gameology XP/level/league, pact mentor league, liftoff overlays, photon/stardust economy.
- **Routes**: `/auth`, `/user`, `/courses`, `/mentor/*`, `/student/*`, `/peer/*`, `/orbit`, `/billing`, `/pact`, `/knowledge`, `/flares`, etc.
- **Tests**: 615 backend Jest tests passing (56 suites); frontend has vitest + React Testing Library configured but CI run unknown.
- **Deployments**: Dockerfile, fly.toml, railway.json, render.yaml, GitHub Actions CI (`ci.yml`), Vercel config.

## 2. What Needs to Be Built / Designed (from founder vision)

| Area | Open Design Questions | Evidence Needed |
|---|---|---|
| Identity switching | Unlock conditions (Student→Peer→Mentor), RBAC, shared vs isolated data, per-identity cockpit UI, self-review prevention | Market research on role-switching + platform safety patterns |
| Subscriptions | 3–4 India‑localized tiers, lowest = 2 courses, INR/UPI/GST, proration/downgrade/dunning | Competitor pricing (Coursera, Udemy, Skillshare, Brilliant, Duolingo) + Razorpay/Cashfree subscription APIs |
| Mentor economics | 20% platform fee rule, equal vs engagement-weighted split, clawbacks, GST/TDS, payout thresholds | Marketplace commission benchmarks + Indian tax compliance |
| Course-request engine | Deduplication/clustering, thresholds, mentor notifications, claim flow, anti‑brigading | Prior art on demand-driven course creation |
| Dynamic 3D map | Course → space journey algorithm (planets=modules, stations=checkpoints, boss=exams), edge cases, anti‑cheat | 3D WebGL research + educational game UX |
| AI quiz engine | Ollama architecture (LoRA vs RAG vs hybrid), model selection, cost/hardware, quality gates | Ollama model library + quiz generation research |
| Gamification | Mechanics per identity, economy balance, ethics guardrails | Gamification psychology research (Octalysis, SDT, streak research) |

## 3. Phased Execution Plan

### Step 1 — Skill Routing & Orientation (complete)
- Printed folder tree (depth 3, no node_modules/.git).
- Identified stack, frameworks, entry points, CI configs.
- Read `BackEnd/server.js`, `package.json` (both), `FrontEnd/src/App.jsx`, `BackEnd/models/user.js`.
- Discovered skills in `C:/Users/Dell/.claude/skills/` — listed all skill dirs, read SKILL.md for `sn-deep-research`, `sn-research-report`, `sn-md-to-html-report`, `sn-prepare-citations`, `sn-da-excel-workflow`, `sn-da-non-spreadsheet-analysis`, `sn-image-base`, `tabbit`.
- Created `docs/plan/` directory.
- Produced Skill Routing Table (`docs/plan/01-skill-routing.md`).

### Step 2 — Market & Competitor Research (Phase 2.A–B)
Target sources: official pricing pages, Razorpay/Cashfree docs, Indian edtech platforms, Razorpay UPI AutoPay mandates, DPDP Act. Use web search/fetch tools. If web access unavailable, mark UNVERIFIED.

### Step 3 — Economics Simulation (Phase 2.C)
Build editable unit-economics model (pessimistic/base/optimistic) with assumptions flagged. Use `sn-da-excel-workflow` if Excel needed; otherwise create a self-contained spreadsheet via manual tabular markdown.

### Step 4 — Gamification & Ethics Research (Phase 2.D)
Findings from peer-reviewed gamification literature, Octalysis, self-determination theory, streak/loss-aversion studies; dark‑pattern risks; child safety (COPPA/GDPR‑Kids/DPDPA).

### Step 5 — AI Quiz Architecture (Phase 2.E)
Ollama model catalog (current versions), fine‑tuning vs RAG evidence, hardware/cost for local inference at scale, fallback strategy.

### Step 6 — 3D Space UI Research (Phase 2.F)
Three.js / React Three Fiber / Babylon.js; WebGPU status; shader‑based starfields; camera spline animation; performance budgets for Android; accessibility (reduced‑motion); 2D fallback.

### Step 7 — Existing Code Audit (Phase 4)
Run existing backend tests if not already done; lint frontend; review models/routes/controllers for role‑escalation, IDOR, webhook idempotency, N+1 queries, hard‑coded secrets; document bugs in `docs/plan/bug-audit.md`.

### Step 8 — Master Plan Deliverables (Phase 5)
Write 16 plan docs + 1 visual overview in `docs/plan/`.

### Step 9 — Stop & Interview (Phase 6)
Present 10‑line summary + 5 biggest decisions; ask interview questions in batches of 5–7 grouped by theme; recommend defaults; mark blocking questions; end with "what I will do next once you approve."

## 4. Deliverable Locations

- All planning docs: `d:/orbit-main/orbit-main/docs/plan/`
- Research log: `d:/orbit-main/orbit-main/docs/plan/research-log.md`
- Thinking notes: `d:/orbit-main/orbit-main/docs/plan/thinking.md`
- Bug audit: `d:/orbit-main/orbit-main/docs/plan/bug-audit.md`
- Executive summary: `d:/orbit-main/orbit-main/docs/plan/00-executive-summary.md`

## 5. Assumptions & Constraints

- **No existing files will be modified** (plan mode only).
- **No secrets** in outputs.
- **External web search**: if unavailable, mark as UNVERIFIED rather than fabricate.
- **Language**: Hinglish fine in chat; documents in English.
- **Ultracode**: on — exhaustive research preferred.
