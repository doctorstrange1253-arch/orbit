# 11 Implementation Roadmap & Milestones

**Owner**: Principal Product Architect + Staff Engineer  
**Phase**: Phase 5 deliverable #11  
**Evidence**: Master plan documents 00 through 10

---

## 1. Overview & Phased Timeline

Total estimated timeline to production launch: **16 weeks** (4 months). Divided into 4 distinct milestones (4 weeks each).

---

## 2. Milestone Breakdown

### Milestone 1: Foundation & Security Hardening (Weeks 1–4)
*Focus: Fix critical security findings, establish strict env validation, implement identity RBAC.*
- **Week 1**: Fix all High severity bug audit findings (BA-01, BA-03, BA-05, BA-10, BA-04). Remove fallback secrets, enforce strict startup validation.
- **Week 2**: Implement identity RBAC middleware and `rolesVersion` stale-token rejection (BA-06). Finalize identity hierarchy (Student/Peer/Mentor).
- **Week 3**: Secure Razorpay webhook with signature verification and idempotency caching (BA-08). Tighten CORS origins (BA-07).
- **Week 4**: Add frontend Vitest test suite and ESLint to GitHub Actions CI (`ci.yml` — BA-11). Baseline unit-economics model.

### Milestone 2: Monetization & Marketplace Economics (Weeks 5–8)
*Focus: Subscription tiers, mentor payouts, course-request engine.*
- **Week 5**: Implement 4 subscription tiers (Free/Pro/Elite/Mentor) with INR pricing and Razorpay integration.
- **Week 6**: Build mentor payout ledger logic (20% platform fee, equal split rule, PactWeekLedger settlement).
- **Week 7**: Scaffold course-request engine with deduplication clustering and threshold triggers (5/25/50).
- **Week 8**: Implement mentor claim flow and anti-brigading rate limits.

### Milestone 3: Immersive UI & AI Quiz Engine (Weeks 9–12)
*Focus: 3D space navigation, Ollama RAG quiz generation.*
- **Week 9**: Integrate React Three Fiber (R3F) and Three.js into frontend Vite build. Build course → space journey layout generator.
- **Week 10**: Implement 2D fallback map and reduced-motion accessibility settings. Test mobile performance on Android (Capacitor).
- **Week 11**: Set up Ollama connection and RAG prompt pipeline for automated quiz generation.
- **Week 12**: Build mentor quiz review queue and cached question bank fallback.

### Milestone 4: Gamification Polish & Beta Launch (Weeks 13–16)
*Focus: Gamification ethics guardrails, P1 extra features, beta rollout.*
- **Week 13**: Refine Octalysis gamification loops, streak freezes, and study session ethical time limit prompts.
- **Week 14**: Build P1 extra features (Verifiable Certificates, Timestamped Notes, Referral System).
- **Week 15**: End-to-end integration testing, security penetration testing, and load testing (1,000 concurrent sockets).
- **Week 16**: Public Beta launch with 100k free user onboarding and monitoring.

---

## 3. Resource Allocation

| Role | Allocation | Responsibilities |
|---|---|---|
| Full-Stack Staff Engineer (2) | 100% | Backend security, webhook, payouts, AI RAG pipeline |
| Frontend React/3D Engineer (1) | 100% | R3F 3D space UI, identity cockpit, 2D fallback |
| Game/UX Designer (1) | 50% | Gamification loops, UI state transitions, accessibility |
| QA / DevOps Engineer (1) | 50% | CI pipeline, load testing, deployment monitoring |

---

## 4. Acceptance Criteria

- [ ] Milestone 1 completed with 0 high-severity security findings in CI
- [ ] Milestone 2 subscription and payout flows successfully tested in Razorpay test mode
- [ ] Milestone 3 3D space UI achieves stable 30fps on target Android test device
- [ ] Milestone 4 public beta successfully launched with all P1 features active

*Prepared by: Principal Product Architect + Staff Engineer — d:/orbit-main/orbit-main/docs/plan/11-implementation-roadmap.md*