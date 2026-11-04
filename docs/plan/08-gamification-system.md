# 08 Gamification System & Ethics

**Owner**: Game/UX Designer  
**Phase**: Phase 5 deliverable #8  
**Evidence**: `BackEnd/models/user.js` (orbit sub-doc, gameology sub-doc, pact sub-doc, cosmic sub-doc), `FrontEnd/src/App.jsx`

---

## 1. Current State (from codebase)

- **Orbit sub-doc**: streak, freeze, missions, stardust, cosmetics
- **Gameology sub-doc**: XP, level, streak, league, conceptMastery
- **Pact sub-doc**: mentor league tracking
- **Cosmic sub-doc**: score, tier, season
- Liftoff overlays and leaderboard components present in frontend

---

## 2. Gamification Frameworks

### Self-Determination Theory (SDT)
- **Autonomy**: Identity switching (Student/Peer/Mentor), choosing learning paths through 3D space map.
- **Competence**: Concept mastery levels, quiz achievements, skill badges, XP progression.
- **Relatedness**: Peer skill-swapping, Pact mentor leagues, cosmic leaderboard.

### Octalysis Framework (Core Drives 1–8)
1. **Epic Meaning**: Space-themed exploration, saving the galaxy through learning.
2. **Development & Accomplishment**: XP, levels, leagues, streak badges.
3. **Empowerment of Creativity**: Course-request engine, mentor course creation.
4. **Ownership & Possession**: Stardust wallet, cosmetic ship upgrades, NFT/certificates.
5. **Social Influence**: Leaderboards, peer reviews, mentor ratings.
6. **Scarcity & Impatience**: Limited-time cosmic seasons, exclusive cosmetics.
7. **Unpredictability & Curiosity**: Mystery reward drops, randomized quiz challenges.
8. **Loss Avoidance**: Streak freeze mechanics (user.js `freeze` field), league relegation warnings.

---

## 3. Ethics Guardrails & Dark-Pattern Prevention

| Risk | Harm | Mitigation |
|---|---|---|
| **Streak Anxiety** | Users experience stress/guilt over breaking a 100-day streak | Automatic streak freeze accumulation; "vacation mode" pause; gentle tone |
| **Exploitative Monetization** | Pushing stardust purchases via artificial scarcity | Clear pricing; no pay-to-win mechanics in core progression; cap daily spending |
| **Minor Protection (COPPA/DPDPA)** | Collecting excessive data from student minors | Minimal data collection for students; parental control dashboard; no targeted ads |
| **Addictive Loops** | Endless scrolling/grinding detrimental to learning | Built-in study session time limits; "take a break" stellar breather prompts |

---

## 4. Open Questions for User (blocking)

1. **Streak policy**: Confirm streak freeze mechanics (how many free freezes per month?). — **BLOCKING**.
2. **Economy sinks**: What are stardust/photons spent on? (Cosmetics, course unlocks, mentor tips?). — **BLOCKING**.
3. **Parental controls**: Is a parent dashboard required for student accounts? (Mandatory for DPDPA/COPPA compliance).

---

## 5. Dependencies

- 02-identity-system.md — per-identity streak and XP isolation
- 03-subscription-architecture.md — premium cosmetics tied to subscription tiers
- User model (`BackEnd/models/user.js`) schema updates for new gamification features

---

## 6. Acceptance Criteria

- [ ] XP and level calculated correctly on lesson completion
- [ ] Streak increments daily on activity; streak freeze prevents reset when triggered
- [ ] Cosmic leaderboard ranks users accurately by season score
- [ ] Study session time limit prompt appears after 2 hours of continuous use (ethical safeguard)
- [ ] Parental control dashboard restricts spending and monitors study time for minor accounts

*Prepared by: Game/UX Designer — d:/orbit-main/orbit-main/docs/plan/08-gamification-system.md*