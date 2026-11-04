# 04 Mentor Economics

**Owner**: Staff Engineer + Principal Product Architect  
**Phase**: Phase 5 deliverable #4  
**Evidence**: `00-executive-summary.md`, `BackEnd/models/moneyledger.js`, `BackEnd/models/photonledger.js`, `BackEnd/models/pactweekledger.js`

---

## 1. Current State (from codebase)

- MoneyLedger model tracks monetary flows (subscriptions, payouts, refunds)
- PhotonLedger tracks stardust/photon economy transactions
- PactWeekLedger suggests weekly settlement cycles
- 20% platform fee confirmed as non-negotiable founder rule
- "Lower tiers split the 80% across a smaller number of courses" — explicit concentration rule

---

## 2. Payout Split Models

### Option A — Equal Split (current founder rule)

```
Mentor payout = (80% of revenue − processor fees) / number of enrolled courses
```

| Pros | Cons |
|---|---|
| Simple, transparent, easy to explain | Under-rewards high-quality/high-engagement mentors |
| Predictable for mentors | No incentive to improve course quality/watch-time |
| Easy to audit | Concentration: mentors with fewer courses earn proportionally more |

### Option B — Engagement-Weighted Split

```
Mentor payout = (80% of revenue − processor fees) × (mentor engagement weight / total engagement weight)
Engagement weight = watch-time + completion rate + ratings + peer reviews
```

| Pros | Cons |
|---|---|
| Incentivizes quality and completion | Complex to calculate and explain |
| Rewards mentors who drive outcomes | Potential gaming (inflating watch-time, rating manipulation) |
| Aligns mentor incentives with student success | Requires more data tracking |

### Recommendation: Hybrid (Phase 1 equal split → Phase 2 engagement-weighted)

Start with equal split for transparency and simplicity. Add engagement weighting after 6 months once watch-time/completion data is reliable. This addresses red-team objection #2 (20% fee is arbitrary — but it's non-negotiable, so focus on split fairness).

---

## 3. Payout Rules (proposed)

| Rule | Value | Source |
|---|---|---|
| Platform fee | 20% | Founder vision — non-negotiable |
| Mentor pool | 80% of revenue − processor fees | Executive summary |
| Split method | Equal (Phase 1) → Engagement-weighted (Phase 2) | Recommendation |
| Payout threshold | ₹1,000 minimum | Proposed — **UNVERIFIED** |
| Payout frequency | Weekly (PactWeekLedger model exists) | Codebase evidence |
| TDS on payouts | To be confirmed | **UNVERIFIED** — requires user input |
| GST on mentor earnings | To be confirmed | **UNVERIFIED** — requires user input |

---

## 4. Open Questions for User (blocking)

1. **Split method**: Equal split vs engagement-weighted — confirm starting point and transition timeline. — **BLOCKING** for payout service specification.
2. **Payout threshold**: Minimum INR amount before payout? Recommend ₹1,000.
3. **Payout frequency**: Weekly (per PactWeekLedger) or monthly?
4. **TDS**: Is TDS deducted on mentor payouts? At what rate (10%? 5%?)
5. **GST on payouts**: Does platform collect GST on mentor service fees?
6. **Refund clawback**: If a student refunds, is mentor payout clawed back proportionally?

---

## 5. Dependencies

- 03-subscription-architecture.md — revenue tiers determine mentor pool size
- BA-08 (Razorpay webhook idempotency) — payout integrity depends on correct payment capture
- Unit-economics.xlsx — mentor pool sizing at different conversion scenarios

---

## 6. Acceptance Criteria

- [ ] Mentor dashboard shows earnings breakdown (platform fee, processor fees, net payout)
- [ ] Weekly payout cycle triggered by PactWeekLedger settlement
- [ ] Payouts only released above threshold amount
- [ ] Refund events trigger proportional mentor payout adjustment
- [ ] All payout transactions logged in MoneyLedger + PhotonLedger

*Prepared by: Staff Engineer + Principal Product Architect — d:/orbit-main/orbit-main/docs/plan/04-mentor-economics.md*