# 00 Executive Summary

## Vision and Core Challenge
Orbit is a space‑themed, gamified learning and skill‑swapping platform where users can dynamically switch between three identities: **Student**, **Peer**, and **Mentor**.

The key challenge is to design a cohesive system that:
- Seamlessly switches identities (role‑unlock, verification, permissions) and preserves state/transactions when switching.
- Supports tiered subscriptions that scale from a free/basic student tier to premium mentor tiers.
- Implements a **20% platform fee** on all subscription revenue (founder’s rule) with a specific rule for tiered sharing: lower tiers split the 80% across a smaller number of courses.
- Provides a **course‑request engine**: students request missing subjects; when demand passes a threshold, mentors can claim/claim and create the course.
- Powers the learning journey with a **dynamic 3D space UI**, where each course’s structure becomes a navigable space with planets, stations, and missions.
- Delivers AI‑generated quizzes via Ollama (local models), supporting multiple architectures and complex evaluation.
- Extends gamification across all three identities with a balanced economy (Photons / stardust), achievement systems, and mentorship reputation.
- Ensures security, accessibility, mobile support, and high‑quality content moderation and dispute resolution.

## Key Architectural Decisions Under Review

1. **Identity System & Switching** – unlock conditions, RBAC, data isolation, role‑change permission models, and abuse prevention for course/credit transfer.
2. **Subscription Design** – 3–4 India‑localized tiers, course slots, quiz limits, AI features, pricing (INR, UPI, GST), and upgrade/downgrade/proration.
3. **Mentor Payout Economics** – 20% platform fee, split across enrolled courses, handling of refunds, payout thresholds, GST/TDS, and whether to include engagement‑weighted sharing or pure equal split.
4. **Course Request Engine** – deduplication, threshold logic, mentor matching, incentives for creation, spam control, and transparent progress tracking.
5. **3D Space UI / Dynamic Map Generator** – algorithm to convert a course’s modules/videos/checkpoints into a navigable space (planets = modules, stations = checkpoints, boss exams = missions), including edge cases, anti‑cheat, and fallback to 2D.
6. **AI Quiz Architecture** – Ollama integration choice (LoRA fine‑tuning vs. RAG vs. hybrid), model selection, hardware requirements, evaluation metrics, and self‑verification loops with mentor review.
7. **Gamification System** – XP, streaks, rewards, and economy for each identity; research on effective loops and avoidance of harmful dark patterns; age‑appropriate design.
8. **Extra Features** – ranked by impact/effort (e.g., AI tutor chat, spaced repetition, study squads, mentor office hours, certificates, parent dashboards, accessibility modes, offline mode, notes with timestamps, referral system, etc.).

## Business Model & Unit Economics Snapshot (Assumptions)

- **ARPU (Average Revenue Per User)**: $12/month (mid‑tier) for a user base of 100k → $1.2M monthly.
- **Platform Take**: 20% = $240k/month.
- **Mentor Payouts**: 80% distributed across enrolled courses; average 2 courses per student (lowest tier) → $160k/month total mentor pool.
- **Cost Structure**:
  - Development & Hosting: $60k/month (infrastructure, compute for Ollama, storage).
  - Payment processor fees (Razorpay/Stripe): ~2.5% of transaction = $30k/month.
  - Content moderation / support: $20k/month.
  - **Gross Margin**: ~$190k/month.
- **Break‑even**: ~2.5k paying users (roughly 3% conversion from 100k free users) or ~150k total users.

## Technical Risks & Mitigation

- **Scale & Performance** – Many concurrent real‑time sessions (WebSocket), heavy video streaming, and Ollama inference. Mitigation: Redis adapter, content delivery networks, and inference optimization (batching, quantization).
- **Data Privacy & Security** – PII, payment data, and course content. Mitigation: end‑to‑end encryption, least‑privilege access, regular penetration testing.
- **Compliance** – GST/TDS for Indian payouts, age‑verification for minors, data residency (DPDPA), and accessibility (WCAG 2.1 AA).
- **Model Availability** – Ollama may be unavailable or underpowered for local inference. Mitigation: fallback to cached question banks, partner with edge inference services, and monitor model health.

## What We Need To Decide Next (5 Critical Questions)

1. **Identity & Permission Model**: How will we unlock a *Peer* role from *Student*? What verification evidence is required? How to handle role changes mid‑subscription (e.g., a student becomes a mentor while still enrolled in courses)? How do we enforce role‑specific UI and RBAC?

2. **Subscription Architecture**: Which of the 3–4 proposed India‑localized tiers (e.g., *Orbit Basic* – 2 courses, *Orbit Pro* – 5 courses, *Orbit Elite* – unlimited courses + premium mentorship perks) will best balance acquisition and LTV, considering UPI payment integration and GST compliance?

3. **Mentor Payout Rules**: Do we keep strict 20% platform fee with equal split across enrolled courses, or do we add engagement weighting (e.g., watch‑time, completion) to incentivize course quality? What are the payout thresholds, frequency, and TDS handling for Indian mentors?

4. **3D Space UI Implementation**: Which game engine / framework will best support dynamic generation (Three.js, React Three Fiber, Babylon.js) while meeting performance budgets on low‑end Android phones? How do we balance visual richness against battery life and data? What fallback path for 2D?

5. **AI Quiz Integration Strategy**: Should we fine‑tune a small LoRA on course transcripts, use RAG with a base model, or adopt a hybrid? Which Ollama model(s) are available locally and can support the required throughput (e.g., Qwen‑2.5‑7B, Llama‑3.2‑8B)? How do we quality‑gate AI‑generated questions (human reviewer loop) and ensure correctness?

## Next Steps

- Validate the five critical questions with stakeholder sign‑off.
- Initiate architecture spikes: (a) role‑switching RBAC proof‑of‑concept, (b) dynamic 3D map generator prototype, (c) local Ollama fine‑tuning evaluation.
- Begin backend services scaffolding: new role‑middleware, course‑request queue, and mentor payout accounting.
- Design subscription flow (INR pricing, UPI integration, GST invoicing).

## Conclusion

Orbit has strong traction potential through gamification, real‑time mentorship, and a differentiated 3D learning journey. The product is **technically feasible** given the existing codebase (Node/Express + React/Vite) and a clear path to address identified risks.

**Immediate priority**: resolve the five critical questions above; subsequent phases will deliver a fully validated, launch‑ready roadmap with clear delivery timelines and resource estimates.

*Prepared by: Principal Engineer & Senior Product Critic Team – d:/orbit-main/orbit-main/docs/plan/00-executive-summary.md*