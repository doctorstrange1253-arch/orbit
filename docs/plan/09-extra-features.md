# 09 Extra Features & Prioritization Matrix

**Owner**: Principal Product Architect + Senior Product Critic  
**Phase**: Phase 5 deliverable #9  
**Evidence**: `BackEnd/models/` (40+ models), `FrontEnd/src/`

---

## 1. Feature Pool

The codebase and founder vision suggest numerous potential features:
1. AI Tutor Chat (real-time Q&A during lessons)
2. Spaced Repetition Flashcards (Anki-style review engine)
3. Study Squads / Guilds (small group collaborative learning)
4. Mentor Office Hours (scheduled drop-in video Q&A)
5. Verifiable Certificates (blockchain or cryptographically signed PDF certificates)
6. Parent / Guardian Dashboard (progress tracking for minors)
7. Offline Mode (PWA workbox caching + Capacitor local storage)
8. Timestamped Notes (synced with video playback)
9. Referral System (stardust reward for inviting peers)
10. Accessibility Voice Mode (speech-to-text / text-to-speech)

---

## 2. Prioritization Matrix (Impact vs Effort)

| Feature | Impact (1–5) | Effort (1–5) | Priority | Rationale |
|---|---|---|---|---|
| **Verifiable Certificates** | 4 | 2 | **P1 (Immediate)** | High trust value for students; low implementation cost |
| **Timestamped Notes** | 4 | 2 | **P1 (Immediate)** | High utility during video lessons; easy integration |
| **Referral System** | 5 | 2 | **P1 (Immediate)** | Essential for viral user acquisition (free user growth) |
| **Spaced Repetition** | 4 | 3 | **P2 (Short-term)** | Strong learning retention boost; builds on quiz engine |
| **Study Squads / Guilds** | 4 | 4 | **P2 (Short-term)** | Great for retention and social gamification |
| **Mentor Office Hours** | 4 | 3 | **P2 (Short-term)** | Leverages existing Socket.io video call infrastructure |
| **AI Tutor Chat** | 5 | 4 | **P3 (Medium-term)** | High value but depends on Ollama stability and cost |
| **Parent Dashboard** | 3 | 3 | **P3 (Medium-term)** | Compliance requirement for DPDPA/COPPA markets |
| **Offline Mode** | 4 | 4 | **P3 (Medium-term)** | Complex data sync logic with MongoDB backend |
| **Accessibility Voice Mode**| 3 | 5 | **P4 (Future)** | High engineering effort; niche initial demand |

---

## 3. Open Questions for User (blocking)

1. **Top 3 features**: Confirm P1 features (Certificates, Timestamped Notes, Referral System) for Phase 1 MVP. — **BLOCKING**.
2. **Parent dashboard**: Is DPDPA/COPPA compliance required for launch market (India)? If yes, Parent Dashboard moves to P1.

---

## 4. Dependencies

- 02-identity-system.md — student/mentor permissions for features
- 03-subscription-architecture.md — feature gating by subscription tier
- Existing Socket.io and database models

---

## 5. Acceptance Criteria

- [ ] P1 features (Certificates, Timestamped Notes, Referral System) specified in implementation backlog
- [ ] Feature gating implemented in backend middleware for subscription tiers
- [ ] Referral tracking creates stardust rewards upon signup completion

*Prepared by: Principal Product Architect + Senior Product Critic — d:/orbit-main/orbit-main/docs/plan/09-extra-features.md*