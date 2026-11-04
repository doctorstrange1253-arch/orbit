# 02 Identity System & Switching

**Owner**: Principal Product Architect  
**Phase**: Phase 5 deliverable #2  
**Evidence**: `BackEnd/models/user.js`, `BackEnd/server.js`, `FrontEnd/src/App.jsx`

---

## 1. Current State (from codebase)

The user schema (`BackEnd/models/user.js`) supports:
- `roles: string[]` — array of roles (`peer_learner`, `mentor`, `student`)
- `rolesVersion` — incremented on role change for stale-token detection
- `orbit` sub-doc — streak, freeze, missions, stardust, cosmetics
- `gameology` sub-doc — XP, level, streak, league, conceptMastery
- `pact` sub-doc — mentor league tracking
- `cosmic` sub-doc — score, tier, season
- `admin` sub-doc — TOTP, backup codes, portalRole
- Geo 2dsphere index on location

The frontend (`FrontEnd/src/App.jsx`) implements:
- Three identity windows: `/peer/*`, `/mentor/*`, `/student/*`
- `identityStore` Zustand store
- `soulForPathname()` resolver mapping URL → identity
- `getLayeredNebula()` palette per identity
- `TransitSequence` soul-switching ceremony (shared route)
- `MentorInviteWatcher`, `SignalFlareListener` — cross-identity listeners
- Deep-link auth and FCM push

---

## 2. Design Requirements

| Requirement | Source |
|---|---|
| User can switch between Student, Peer, Mentor identities | Founder vision |
| Switching must preserve state/transactions (stardust, XP, progress) | Founder vision |
| Role unlock conditions must be defined (Student→Peer→Mentor) | Open question #1 |
| RBAC must enforce identity-scoped actions | Founder vision |
| No self-review prevention (mentor cannot review own course) | Open question #1 |
| Shared vs isolated data per identity must be decided | Open question #1 |
| Per-identity cockpit UI | Founder vision |

---

## 3. Proposed Identity Model

### 3.1 Three Distinct Core Identities

Per founder instruction, **Peer** is maintained as a **distinct third identity** alongside Student and Mentor, with its own dedicated progression, helper karma, doubt-solving bounties, and review quests.

```
   ┌─────────────┐       Unlock via Course Completion       ┌─────────────┐       Application + Verification       ┌─────────────┐
   │   Student   │ ───────────────────────────────────────> │    Peer     │ ─────────────────────────────────────> │   Mentor    │
   │ (Learn/Quiz)│ <─────────────────────────────────────── │ (Help/Review)│ <───────────────────────────────────── │(Create/Earn)│
   └─────────────┘          Voluntary Switch / Revert       └─────────────┘         Voluntary Switch / Revert       └─────────────┘
```

- **Student Identity**: Focuses on consuming course modules, watching video checkpoints, taking Ollama-generated quizzes, leveling up, and managing personal study streaks.
- **Peer Identity (Distinct Third Identity)**: Focuses on collaborative learning, peer-reviewing homework submissions, answering doubt-solving bounties in study squads, earning "Helper Karma" and Stardust bounties, and participating in peer leagues.
- **Mentor Identity**: Focuses on course authorship, teaching, curriculum design, student analytics (Mission Control), and earning INR payout revenue shares (80% pool).

### 3.2 Data Model & Identity Isolation

- **Shared (identity-agnostic)**: User profile, email, authentication tokens, unified Stardust/Photon wallet balance, global badges, achievements, and cryptographic certificates.
- **Identity-Scoped (Isolated per Identity)**:
  - *Student*: Course enrollments, lesson progress, quiz scores, student streak.
  - *Peer*: Helper karma, resolved doubt bounties, pending peer-review queue, review accuracy score.
  - *Mentor*: Owned courses, student enrollment analytics, mentor league tier, INR revenue ledger.

### 3.3 Switching & Unlock Rules

| Action | Condition | Effect |
|---|---|---|
| Student → Peer Unlock | Complete at least 2 courses + score ≥80% on checkpoint quizzes + 0 active fraud flags | Peer identity unlocked in `user.roles`; user can switch via `TransitSequence` ceremony |
| Peer → Mentor Unlock | Peer in good standing for 30+ days + ≥50 resolved doubt bounties + mentor application approved + ID verification + TOTP enabled | Mentor identity unlocked; course creation tools enabled |
| Mutual Switching | Always allowed between unlocked identities | UI context transitions (`getLayeredNebula` palette updates); wallet persists; active session state switches to target identity cockpit |
| Anti-Abuse (Self-Review) | Middleware enforcement | A user switching to Peer cannot review submissions for a course where they are enrolled as a Student or author as a Mentor |

### 3.4 RBAC Enforcement

Middleware pattern (`BackEnd/middleware/identity.js` — planned):
- `requireIdentity(['peer'])` — verifies user has `peer_learner` in `roles` and active session is in peer mode.
- `requireIdentityVersion()` — rejects JWTs where `rolesVersion` < `user.rolesVersion` (fixing BA-06).
- `preventSelfReview(courseId, userId)` — prevents a user from reviewing their own submissions or courses.

---

## 4. Open Questions for User (blocking)

1. **Peer Stardust Rewards**: Should peer-review bounties be funded by platform stardust emission or optional student tips?
2. **Simultaneous Multi-Role**: Can a user have active student coursework and active peer review sessions open in separate browser tabs simultaneously? (Recommended: Yes via isolated identity context).
3. **Mentor Downgrade**: If a mentor's course is un-published for quality issues, does their Mentor identity revert to Peer automatically?

---

## 5. Dependencies

- BA-06 (rolesVersion stale-token handling) — fixes token validity across role changes
- BA-05/BA-10 (session/JWT secret hardening) — auth integrity for identity switching
- Phase 5 doc 03 (subscription architecture) — tier-based course slots affect identity capabilities
- Phase 5 doc 07 (gamification) — per-identity streak/XP systems

---

## 6. Acceptance Criteria

- [ ] User can switch identities via TransitSequence ceremony without losing shared wallet balance
- [ ] Peer→Mentor unlock requires all conditions; system rejects incomplete applications
- [ ] Mentor cannot review/rate their own course (self-review prevention enforced)
- [ ] JWT rolesVersion mismatch triggers token rejection with clear error
- [ ] Per-identity cockpit renders correct palette (getLayeredNebula) and navigation
- [ ] Mid-subscription role change preserves subscription benefits

*Prepared by: Principal Product Architect — d:/orbit-main/orbit-main/docs/plan/02-identity-system.md*