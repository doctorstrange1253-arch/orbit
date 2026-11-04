# Phase 6: Structured Interview & Open Decisions

**File Location**: `docs/plan/16-interview-questions.md`  
**Status**: Ready for Founder / Stakeholder Review  
**Rule**: Review this document, provide your answers, and we will proceed to Milestone 1 execution.

---

## 1. 10-Line Executive Summary of the Plan

1. **Orbit** is a fully built gamified space-themed learning platform (Node.js/Express backend + React/Vite frontend) with 615 passing backend tests.
2. The architecture centers around **three distinct, swappable identities** (**Student**, **Peer**, **Mentor**), preserving shared wallets while isolating identity progression.
3. Subscription tiers (*Orbit Basic* ₹0, *Orbit Pro* ₹299, *Orbit Elite* ₹599, *Orbit Mentor* ₹999) are localized for India (INR, UPI AutoPay, 18% GST).
4. The mentor revenue model enforces the non-negotiable **20% platform fee**, distributing the remaining 80% across enrolled courses with equal splits (Phase 1).
5. A **course-request engine** crowdsources demand, using clustering algorithms to trigger mentor creation when thresholds (5/25/50 requests) are met.
6. The learning journey features a **dynamic 3D space UI** (React Three Fiber) mapping course modules to planets and checkpoints to space stations, with automatic 2D SVG fallback.
7. An **AI quiz generation engine** leverages Ollama RAG (Llama-3.2-8b / Qwen-2.5-7b) with mandatory mentor review queues and cached question bank fallbacks.
8. Gamification is governed by Self-Determination Theory and Octalysis core drives, backed by ethical safeguards (streak freezes, session time limit breathers).
9. A thorough code audit identified 11 vulnerabilities (hardcoded secrets, missing JWT startup checks, CORS tightening) with precise file:line evidence in `docs/plan/bug-audit.md`.
10. A 4-milestone, 16-week execution roadmap is established in `docs/plan/11-implementation-roadmap.md`, ready for Milestone 1 security hardening upon final sign-off.

---

## 2. 5 Biggest Strategic Decisions Made

1. **Distinct Third Identity (Peer)**: Maintained Peer as a full, standalone identity with helper karma and doubt-solving bounties, rather than a transient state.
2. **Phase 1 Equal Split**: Adhered to the founder's strict 80% mentor pool equal split rule for predictable Phase 1 accounting, deferring engagement weighting to Phase 2.
3. **Fail-Fast Security Posture**: Prioritized eliminating all fallback secrets (`JWT_SECRET`, `SESSION_SECRET`) and enforcing strict server boot validation as an absolute blocker before rollout.
4. **Hybrid 3D/2D Rendering**: Specified React Three Fiber for immersive space navigation with automatic graceful degradation to 2D SVG maps for mobile performance and accessibility.
5. **Human-in-the-Loop AI Governance**: Mandated mentor review for all AI-generated Ollama quiz questions to protect educational rigor and platform trust.

---

## 3. Interview Questions by Theme (with Recommended Defaults)

### Theme 1: Identity & Peer Role Mechanics
1. **Peer Unlock Threshold**: Should unlocking the **Peer** identity require completing 2 courses + scoring ≥80% on checkpoint quizzes + 3 successful peer reviews?
   - **Recommended Default**: **Yes** (ensures peers have mastered foundational content before assisting others).
2. **Peer Monetization**: Should Peer identity earn Stardust/Photon bounties and Helper Karma, but remain non-monetized for INR payouts (which are reserved for Mentors)?
   - **Recommended Default**: **Yes** (prevents gaming while rewarding community contribution).

### Theme 2: Subscriptions & Pricing (INR)
3. **Tier Pricing & Course Slots**: Do you approve *Orbit Basic* (Free, 2 slots), *Orbit Pro* (₹299/mo, 5 slots), *Orbit Elite* (₹599/mo, Unlimited), and *Orbit Mentor* (₹999/mo, Unlimited + creator tools)?
   - **Recommended Default**: **Yes** (competitive with Indian edtech SaaS benchmarks).
4. **Dunning & Grace Period**: Should failed subscription payments trigger a 3-day grace period followed by feature limitation at day 7?
   - **Recommended Default**: **Yes** (standard SaaS practice balancing retention and revenue).

### Theme 3: Mentor Economics & Payouts
5. **Payout Threshold**: Should mentor payouts have a minimum threshold of ₹1,000 before release, settled weekly per `PactWeekLedger`?
   - **Recommended Default**: **Yes** (prevents high micro-transaction processing fees).
6. **Refund Clawback**: If a student receives a refund, should the mentor's revenue share for that course be adjusted proportionally in the next ledger cycle?
   - **Recommended Default**: **Yes** (prevents platform liability for refunded enrollments).

### Theme 4: 3D UI & AI Quiz Engine
7. **3D Default**: Should the immersive 3D R3F space journey map be enabled by default with automatic fallback to 2D if mobile framerate <20fps?
   - **Recommended Default**: **Yes** (delivers high visual impact while ensuring low-end Android playability).
8. **Ollama Model**: Do you approve `llama3.2:8b` running locally with RAG context over course transcripts for automated quiz generation?
   - **Recommended Default**: **Yes** (optimal balance of reasoning and VRAM footprint).

---

## 4. Blocking Questions Summary
- **All 8 questions above are blocking** for their respective subsystem specifications. Approving the recommended defaults allows immediate unblocking.

## 5. Next Steps Upon Approval
Once you review this file and reply with your approval (or custom selections):
1. Record your decisions in stakeholder governance.
2. Begin **Milestone 1 execution**: Fix High-severity security findings (BA-01 through BA-10), remove fallback secrets, enforce strict environment validation at boot.
3. Scaffold identity RBAC middleware (`BackEnd/middleware/identity.js`).
4. Integrate frontend Vitest test suite into GitHub Actions CI (`ci.yml`).

*Prepared by: Principal Product Architect & Senior Product Critic — docs/plan/16-interview-questions.md*