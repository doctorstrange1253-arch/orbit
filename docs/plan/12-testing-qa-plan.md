# 12 Testing & Quality Assurance Plan

**Owner**: Staff Engineer  
**Phase**: Phase 5 deliverable #12  
**Evidence**: `BackEnd/tests/` (56 test suites, 615 tests passing), frontend vitest setup

---

## 1. Testing Strategy

Orbit employs a four-tier testing pyramid:
1. **Unit Tests**: Jest (backend) + Vitest (frontend) for individual functions, models, and components.
2. **Integration Tests**: Supertest (backend API routes) + React Testing Library (component interactions).
3. **End-to-End (E2E) Tests**: Playwright for critical user journeys (signup → subscription → identity switch → course completion → mentor payout).
4. **Load / Stress Tests**: Artillery or k6 for Socket.io concurrent connection and chat/video room scaling.

---

## 2. Current Status & Gaps

- **Backend**: Excellent coverage — 615 passing tests across 56 test suites.
- **Frontend**: Vitest and Playwright-core configured in `FrontEnd/package.json`, but execution omitted from CI workflow (`ci.yml`).
- **Gap**: Need to add frontend test execution to CI (BA-11) and write E2E test suites for the core booking and payment loops.

---

## 3. Test Suites to Implement

| Suite | Tool | Scope | Target Pass Rate |
|---|---|---|---|
| Auth & Identity | Jest | JWT verification, rolesVersion check, identity switching | 100% |
| Subscription & Billing | Jest / Supertest | Razorpay webhook signature, proration, dunning | 100% |
| Payout Calculation | Jest | 20% platform fee, equal split, payout threshold | 100% |
| Course Request Engine | Jest | Deduplication clustering, threshold triggers, rate limits | 100% |
| Frontend Component UI | Vitest / RTL | Identity cockpit, 3D/2D toggle, streak counter | 100% |
| E2E User Journey | Playwright | Full student enrollment → lesson completion → certificate | 100% |
| Socket.io Load Test | Artillery | 1,000 concurrent socket connections + room messaging | <1% error rate |

---

## 4. Acceptance Criteria

- [ ] Backend Jest test suite maintains 100% pass rate (615+ tests)
- [ ] Frontend Vitest + lint jobs successfully integrated into GitHub Actions CI (`ci.yml`)
- [ ] Playwright E2E test suite covers core student-to-mentor workflow
- [ ] Socket.io load test verifies Redis adapter horizontal scaling under 1,000 concurrent connections

*Prepared by: Staff Engineer — d:/orbit-main/orbit-main/docs/plan/12-testing-qa-plan.md*