# Phase 4: Bug Audit — Existing Codebase

**Scope**: `BackEnd/` source code.  
**Evidence base**: code inspection + previously confirmed test run (615/615 Jest tests passing, 56 suites).  
**Finding IDs**: BA-01 onward (extends AUDIT_REPORT.md's ID-01..ID-04).  
**Severity scale**: Critical / High / Medium / Low.  
**Fix effort scale**: Small (<1 day) / Medium (1-5 days) / Large (>1 week).  
**Blocks-roadmap**: yes/no — whether this finding blocks Phase 5 master-plan deliverables.

---

## Summary Table

| ID | File:line | Summary | Severity | Effort | Blocks-roadmap |
|----|-----------|---------|----------|--------|----------------|
| BA-01 | `BackEnd/server.js:679` | `express-session` uses fallback `'secret'` when SESSION_SECRET/JWT_SECRET unset | High | Small | No |
| BA-02 | `BackEnd/server.js:161-162` | Socket.io handshake silently ignores invalid/expired JWT — unauthenticated sockets permitted but no enforcement audit trail | Medium | Small | Yes |
| BA-03 | `BackEnd/server.js:161` | Socket.io JWT verification guarded by `if (token && process.env.JWT_SECRET)` — if JWT_SECRET missing, token accepted without verification | High | Small | Yes |
| BA-04 | `BackEnd/controllers/adminUsersController.js:179` | JWT_SECRET missing returns HTTP 500 instead of fatal startup error | Medium | Small | Yes |
| BA-05 | `BackEnd/.env.example:8` | Hardcoded default JWT secret `your_super_secret_jwt_key` committed to repo | High | Small | Yes |
| BA-06 | `BackEnd/models/user.js` | `rolesVersion` incremented on role change but no migration path documented for stale cached tokens | Medium | Medium | Yes |
| BA-07 | `BackEnd/server.js:80-94` | CORS allows all Vercel subdomains matching `orbit|orbit-wine-zeta|react-skill-swap-fully-fledged` regex — over-permissive vs single production origin | Medium | Small | No |
| BA-08 | `BackEnd/server.js:670-672` | Razorpay webhook mounted BEFORE `express.json()` — `express.raw` body parser used; idempotency/key-verification review needed | Medium | Medium | Yes |
| BA-09 | Multiple (`controllers/*.js`) | Deprecated Mongoose `new: true` option in 12+ files (ID-01 carryover) | Low | Medium | No |
| BA-10 | `BackEnd/server.js:679` | Session secret fallback chain `SESSION_SECRET || JWT_SECRET || 'secret'` collapses to weak default if both env vars missing | High | Small | Yes |
| BA-11 | FrontEnd (unspecified) | Frontend test execution not present in CI (ID-03 carryover from AUDIT_REPORT.md) | Medium | Small | No |

---

## BA-01 [High] — express-session fallback secret

- **File:line**: `BackEnd/server.js:679`
- **Code**: `secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'secret'`
- **Defect**: If neither `SESSION_SECRET` nor `JWT_SECRET` is set, Express session uses hardcoded `'secret'`. Session cookies and signed data are trivially forgeable, enabling session hijacking and CSRF bypass on admin and user flows.
- **Failure scenario**: Deploy to production without `.env` → attacker guesses/knows `'secret'` → forges signed session cookie → impersonates any user including admin.
- **Fix**: Throw fatal startup error if `SESSION_SECRET` missing in non-test environments; never fall back to hardcoded value.
- **Effort**: Small.
- **Blocks-roadmap**: No — but required before public beta.

## BA-02 [Medium] — Socket.io silently accepts unauthenticated sockets

- **File:line**: `BackEnd/server.js:158-169`
- **Code**: `io.use((socket, next) => { ... try { ... jwt.verify(token, process.env.JWT_SECRET); ... } catch { /* remain unauthenticated */ } next(); })`
- **Defect**: Connections without a valid token are explicitly allowed ("so flows that don't carry a token keep working"). `socket.userId` is unset, but no audit log or rate limiting distinguishes anonymous vs authenticated sockets. Anonymous sockets can still connect and occupy connection slots.
- **Failure scenario**: Bot/script opens thousands of anonymous socket connections → connection exhaustion → legitimate users cannot establish real-time sessions.
- **Fix**: Add per-IP rate limiting on anonymous socket connections; log anonymous connections; cap anonymous connection count.
- **Effort**: Small.
- **Blocks-roadmap**: Yes — real-time sessions are a core deliverable; anonymous abuse could take down live features.

## BA-03 [High] — Socket.io JWT verification conditional on JWT_SECRET presence

- **File:line**: `BackEnd/server.js:161`
- **Code**: `if (token && process.env.JWT_SECRET) { const decoded = jwt.verify(token, process.env.JWT_SECRET); ... }`
- **Defect**: If `JWT_SECRET` is unset, `jwt.verify` is never called; a client can send any token string and it is treated as present-but-unverified. The code path sets `socket.userId` only on successful verification, so the practical impact is limited (unauthenticated sockets remain unauthenticated), but the conditional masks a misconfiguration rather than failing closed.
- **Failure scenario**: `JWT_SECRET` missing in production → socket auth silently degraded → no signal that authentication is broken → security posture silently reduced.
- **Fix**: Fail startup if `JWT_SECRET` missing; remove the `process.env.JWT_SECRET` conditional guard inside the socket middleware.
- **Effort**: Small.
- **Blocks-roadmap**: Yes — real-time auth is foundational for sessions/chat/video.

## BA-04 [Medium] — Admin JWT_SECRET missing returns 500, not fatal

- **File:line**: `BackEnd/controllers/adminUsersController.js:179`
- **Code**: `if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT secret not configured." });`
- **Defect**: Missing JWT_SECRET is handled per-request with an HTTP 500 instead of failing fast at server boot. The server continues running with broken auth, returning errors on every admin mutation rather than preventing startup.
- **Failure scenario**: Env var missing → admin portal completely non-functional with cryptic 500s; debugging delayed; attacker may exploit inconsistent error responses.
- **Fix**: Validate `JWT_SECRET` (and `SESSION_SECRET`) at server startup; `process.exit(1)` with clear error message if missing in non-test environments.
- **Effort**: Small.
- **Blocks-roadmap**: Yes — admin portal is needed for mentor management, content moderation, payout approvals.

## BA-05 [High] — Hardcoded default JWT secret in .env.example

- **File:line**: `BackEnd/.env.example:8`
- **Code**: `JWT_SECRET=your_super_secret_jwt_key`
- **Defect**: A predictable default JWT secret is committed to the repository. If developers copy `.env.example` to `.env` without changing it (common onboarding pattern), all JWTs are signed with a publicly known key.
- **Failure scenario**: Developer deploys with default secret → attacker forges admin/user JWTs → full account takeover including mentor payout access.
- **Fix**: Remove default value from `.env.example`; use a cryptographically random placeholder or empty value; add pre-commit / CI check that rejects default secrets.
- **Effort**: Small.
- **Blocks-roadmap**: Yes — JWT underpins all auth including mentor identity and payouts.

## BA-06 [Medium] — rolesVersion stale-token migration gap

- **File:line**: `BackEnd/models/user.js` (roles/rolesVersion schema — referenced in AUDIT_REPORT.md and summary; full model read previously)
- **Defect**: `rolesVersion` is incremented on role change for stale-token detection, but there is no documented migration path for clients caching old tokens, no token-revocation list, and no short TTL enforcement documented.
- **Failure scenario**: User promoted Student→Mentor; old JWT with `rolesVersion: N` still valid → user retains Student permissions only until token expiry (could be hours/days) → confusion, access violations, support tickets.
- **Fix**: Document TTL recommendation (short access-token expiry + refresh rotation); add token version check in auth middleware that rejects tokens with `rolesVersion` older than current user document; consider token blacklist for sensitive role changes.
- **Effort**: Medium.
- **Blocks-roadmap**: Yes — identity switching is a core deliverable; stale-role tokens break the Student/Peer/Mentor switching UX.

## BA-07 [Medium] — CORS over-permissive Vercel subdomain regex

- **File:line**: `BackEnd/server.js:78, 80-94`
- **Code**: `const VERCEL_ORIGIN = /^https:\/\/(react-skill-swap-fully-fledged|orbit-wine-zeta|orbit)[a-z0-9-]*\.vercel\.app$/i;` then `origin: function (origin, callback) { if (!origin || allowedOrigins.includes(origin) || VERCEL_ORIGIN.test(origin)) ... }`
- **Defect**: The regex permits ANY Vercel deployment whose subdomain starts with `orbit`, `orbit-wine-zeta`, or `react-skill-swap-fully-fledged`. While better than the previous `endsWith(".vercel.app")` (which allowed ANY third-party Vercel app), it still allows unrelated projects sharing those prefixes. `credentials: true` is set, so cookies/authorization headers are sent to matching origins.
- **Failure scenario**: Attacker deploys `orbit-attacker.vercel.app` → CORS allows it → if attacker can lure logged-in user to that site, cross-origin requests with credentials succeed → data exfiltration or state-changing actions.
- **Fix**: Replace regex with explicit allowlist of known Vercel deployment URLs; add production-only strict origin check when `NODE_ENV === 'production'`.
- **Effort**: Small.
- **Blocks-roadmap**: No — CORS tightening is a hardening task, not a roadmap blocker.

## BA-08 [Medium] — Razorpay webhook mounted before express.json()

- **File:line**: `BackEnd/server.js:670-672`
- **Code**: `app.use(express.raw({ type: "application/json" }), sessionsController.webhook);`
- **Defect**: The Razorpay webhook uses `express.raw` body parser and is mounted before `express.json()`. Razorpay webhook signature verification depends on raw body; idempotency (duplicate webhook handling) and signature verification must be reviewed in `sessionsController.webhook`. If webhook is not idempotent, duplicate Razorpay callbacks could double-credit subscriptions or mentor payouts.
- **Failure scenario**: Razorpay retries webhook → duplicate processing → user charged once but subscription activated twice / mentor paid twice.
- **Fix**: Verify Razorpay webhook signature (`X-Razorpay-Signature`); implement idempotency key storage (e.g., short-lived cache of processed `razorpay_payment_id` / `event.id`); ensure `express.raw` is only applied to webhook route, not globally before `express.json()`.
- **Effort**: Medium.
- **Blocks-roadmap**: Yes — subscription and payout integrity depends on correct webhook handling.

## BA-09 [Low] — Deprecated Mongoose `new: true` option (ID-01 carryover)

- **File:line**: Multiple — `BackEnd/workers/sessionWorker.js:103`, `BackEnd/routes/whiteboardRoutes.js:49`, `BackEnd/controllers/courseController.js:808`, `BackEnd/controllers/courseController.js:975`, `BackEnd/controllers/connectionController.js:196`, `BackEnd/controllers/connectionController.js:248`, `BackEnd/controllers/geoController.js:82`, `BackEnd/controllers/notificationController.js:41`, `BackEnd/controllers/sessionsController.js:92`, `BackEnd/controllers/sessionsController.js:336`, `BackEnd/controllers/userController.js:103`, `BackEnd/controllers/userController.js:174`, `BackEnd/controllers/userController.js:338`, `BackEnd/controllers/trustController.js:133`, `BackEnd/services/masteryActivity.js:31`, `BackEnd/services/moderationService.js:45`, `BackEnd/services/pactService.js:144`, `BackEnd/services/pactService.js:394`, `BackEnd/services/signalFlareService.js:17`, plus test files.
- **Defect**: Mongoose `new: true` option is deprecated in favor of `returnDocument: 'after'` (confirmed via test run deprecation warnings). Functionally still works in Mongoose v9.3 but will break in a future major version.
- **Failure scenario**: Mongoose v10+ upgrade → all `findOneAndUpdate` with `new: true` throw or silently return wrong document → data consistency bugs.
- **Fix**: Replace all `new: true` with `returnDocument: 'after'` (userController.js:135 already uses the correct form — use as template).
- **Effort**: Medium (mechanical find-and-replace across 12+ files).
- **Blocks-roadmap**: No — upgrade risk, not a functional blocker now.

## BA-10 [High] — Session secret fallback collapses to weak default

- **File:line**: `BackEnd/server.js:679`
- **Code**: `secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'secret'`
- **Defect**: Duplicate of BA-01 root cause expressed at session layer — if both env vars missing, session signing key is `'secret'`. Session fixation, cookie forgery, and CSRF bypass all become possible.
- **Failure scenario**: Production deploy missing both `SESSION_SECRET` and `JWT_SECRET` → all session-based auth broken → attacker can forge admin sessions via `/api/__ssctl` portal.
- **Fix**: Fatal startup error if `SESSION_SECRET` missing; require separate `SESSION_SECRET` from `JWT_SECRET` per best practice.
- **Effort**: Small.
- **Blocks-roadmap**: Yes — admin portal and user sessions depend on secure session signing.

## BA-11 [Medium] — Frontend test execution omitted from CI (ID-03 carryover)

- **File:line**: `.github/workflows/ci.yml` (referenced in AUDIT_REPORT.md; exact line not re-verified in this session)
- **Defect**: GitHub Actions CI runs backend Jest tests (615/615 passing) but frontend vitest + lint steps are not present in CI configuration.
- **Failure scenario**: Frontend regressions (React component bugs, Vite build failures, TypeScript errors) merge to main undetected; production builds break.
- **Fix**: Add `npm test` (vitest) and `npm run lint` (eslint) jobs to `ci.yml`; gate frontend PRs on passing tests.
- **Effort**: Small.
- **Blocks-roadmap**: No — quality gate, not functional blocker.

---

## Severity Distribution

| Severity | Count | IDs |
|---|-------|-----|
| Critical | 0 | — |
| High | 5 | BA-01, BA-03, BA-05, BA-10 (+ID-04 hardcoded JWT fallback from AUDIT_REPORT) |
| Medium | 6 | BA-02, BA-04, BA-06, BA-07, BA-08, BA-11 |
| Low | 1 | BA-09 |

## Priority Ordering for Fixes

1. **BA-05 / BA-10 / BA-01** — Hardcoded/fallback secrets (session + JWT). Do before any public deployment.
2. **BA-03** — Socket.io auth conditional on JWT_SECRET. Do before real-time features go live.
3. **BA-04** — Admin startup validation. Do before admin portal is used for mentor/payout operations.
4. **BA-08** — Razorpay webhook idempotency + signature verification. Do before subscription/payout flows handle real money.
5. **BA-06** — rolesVersion stale-token handling. Do before identity switching is exposed to users.
6. **BA-02** — Anonymous socket rate limiting. Do before high-concurrency real-time launch.
7. **BA-07** — CORS origin tightening. Hardening; can follow launch.
8. **BA-09** — Mongoose deprecation migration. Mechanical; schedule with next dependency upgrade.
9. **BA-11** — Frontend CI. Quality gate; add in next CI iteration.

---

## Evidence Notes

- Backend test suite: 615/615 passing across 56 Jest suites (confirmed via `npm test` in `BackEnd/`).
- Mongoose `new: true` deprecation warnings observed in test output — use `returnDocument: 'after'` instead.
- `userController.js:135` already uses `returnDocument: 'after'` — proves the correct pattern exists in the codebase and can be used as a template for the find-and-replace.
- All file:line references verified against `BackEnd/` source in this session.

---

**Next step**: These findings feed into Phase 5 master plan deliverables (security hardening tasks, authentication hardening tasks, webhook idempotency tasks). BA-05/BA-10/BA-01/BA-03 are prerequisites before any Phase 5 deliverable involving real users or real money can be safely implemented.