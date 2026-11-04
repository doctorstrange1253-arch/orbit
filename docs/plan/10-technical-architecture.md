# 10 Technical Architecture & Scalability Plan

**Owner**: Staff Engineer  
**Phase**: Phase 5 deliverable #10  
**Evidence**: `BackEnd/server.js`, `BackEnd/package.json`, `FrontEnd/package.json`, Dockerfile, fly.toml, railway.json, render.yaml

---

## 1. Current Architecture

- **Backend**: Node.js 18+, Express v5.2, Mongoose v9.3, Socket.io v4.8 + Redis adapter, Bull job queues, JWT + session auth
- **Frontend**: React v19, Vite v8, Tailwind CSS v4, Zustand v5, React Query v5, Capacitor APK, PWA workbox
- **Deployments**: Dockerfile, fly.toml, railway.json, render.yaml, GitHub Actions CI (`ci.yml`)

---

## 2. Scaling Bottlenecks & Mitigations

| Bottleneck | Risk | Mitigation |
|---|---|---|
| **Socket.io Real-Time Rooms** | Single server memory exhaustion during high concurrency | Redis adapter (`@socket.io/redis-adapter`) already configured in server.js — scales horizontally across nodes |
| **MongoDB Connection Pool** | Connection starvation under load | Tune `maxPoolSize: 50` in Mongoose connection config; connection pooling via Mongoose v9 |
| **Ollama LLM Inference** | CPU/GPU saturation on quiz generation | Offload inference to dedicated GPU worker nodes; Bull queue rate-limiting; fallback to cached question banks |
| **Video Call / WebRTC Signaling** | SFU/MCU bandwidth limits | Use socket signaling for peer-to-peer WebRTC where possible; route media through dedicated SFU (Mediasoup / LiveKit) at scale |
| **Database Query Performance** | N+1 queries or missing indexes | Enforce index audits (Geo 2dsphere index already in user.js); use lean queries for read-heavy lists |

---

## 3. Security Hardening (Addressing Bug Audit BA-01..BA-11)

1. **Secret Management**: Throw fatal startup error if `JWT_SECRET`, `SESSION_SECRET`, or `ADMIN_JWT_SECRET` missing. Remove default secrets from `.env.example` (BA-01, BA-03, BA-04, BA-05, BA-10).
2. **Socket Authentication**: Remove `process.env.JWT_SECRET` conditional guard in socket handshake; enforce token verification (BA-03).
3. **Webhook Security**: Ensure Razorpay webhook uses exact raw body parsing and strict signature verification + idempotency caching (BA-08).
4. **CORS Tightening**: Replace loose Vercel regex with strict production origin whitelist (BA-07).
5. **CI/CD Pipeline**: Add frontend Vitest test suite and ESLint checks to GitHub Actions `.github/workflows/ci.yml` (BA-11 / ID-03).

---

## 4. Open Questions for User (blocking)

1. **Hosting target**: Confirm primary production target (Fly.io, Railway, or Render). — **BLOCKING** for deployment configuration.
2. **SFU for video**: Do paid Orbit sessions require a dedicated WebRTC SFU (LiveKit/Twilio) or is P2P sufficient?

---

## 5. Dependencies

- All Phase 4 bug audit fixes (BA-01 through BA-11)
- Redis cluster setup for Socket.io scaling
- GPU node provisioning for Ollama

---

## 6. Acceptance Criteria

- [ ] Backend boots successfully with strict environment validation (no fallback secrets)
- [ ] Socket.io cluster scales across multiple Node processes via Redis adapter
- [ ] Razorpay webhook verifies signature and prevents duplicate processing
- [ ] GitHub Actions CI runs both backend Jest tests and frontend Vitest/lint suites
- [ ] Load test simulation passes 1,000 concurrent socket connections without dropouts

*Prepared by: Staff Engineer — d:/orbit-main/orbit-main/docs/plan/10-technical-architecture.md*