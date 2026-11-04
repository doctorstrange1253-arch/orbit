# 13 Deployment & DevOps Runbook

**Owner**: Staff Engineer  
**Phase**: Phase 5 deliverable #13  
**Evidence**: Dockerfile, fly.toml, railway.json, render.yaml, GitHub Actions CI (`ci.yml`)

---

## 1. Deployment Environments

| Environment | Purpose | Target Platform | URL / Endpoint |
|---|---|---|---|
| Development | Local feature development | Local Node + MongoDB + Redis | `http://localhost:3000` |
| Staging | Integration testing & review | Render / Fly.io staging app | `staging.orbit.app` |
| Production | Live user traffic | Fly.io / Render production cluster | `orbit.app` |

---

## 2. Environment Variables Checklist

Strict validation enforced at server boot (fixing BA-01..BA-10):
- `NODE_ENV=production`
- `PORT=3000`
- `MONGO_URI=mongodb+srv://...` (encrypted cluster connection)
- `REDIS_URL=redis://...` (Socket.io adapter)
- `JWT_SECRET=<cryptographically secure random 64-byte string>`
- `SESSION_SECRET=<cryptographically secure random 64-byte string>`
- `ADMIN_JWT_SECRET=<cryptographically secure random 64-byte string>`
- `RAZORPAY_KEY_ID=rzp_live_...`
- `RAZORPAY_KEY_SECRET=<secret>`
- `CORS_ORIGIN=https://orbit.app,https://www.orbit.app`

---

## 3. Deployment Procedure

1. **Pre-Deployment Check**:
   - Run backend tests (`npm test` in `BackEnd/`) — must pass 100%.
   - Run frontend build (`npm run build` in `FrontEnd/`) — must compile successfully.
   - Verify all required production environment variables are set in hosting dashboard.

2. **Deployment Execution**:
   - Push to `main` branch triggers GitHub Actions CI (`ci.yml`).
   - CI runs backend tests and frontend checks.
   - On success, automated deployment triggers on Fly.io / Render via container push (`Dockerfile`).

3. **Post-Deployment Verification**:
   - Hit health check endpoint: `GET /api/health` — must return HTTP 200 within 50ms.
   - Verify Socket.io Redis adapter connectivity.
   - Test Razorpay webhook test event delivery.

---

## 4. Acceptance Criteria

- [ ] Dockerfile builds successfully and passes security vulnerability scan
- [ ] Server refuses to boot if any required secret (`JWT_SECRET`, `SESSION_SECRET`, `MONGO_URI`) is missing
- [ ] Automated CI/CD pipeline deploys successfully on `main` branch push
- [ ] Health check endpoint responds correctly post-deployment

*Prepared by: Staff Engineer — d:/orbit-main/orbit-main/docs/plan/13-deployment-devops.md*