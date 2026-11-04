# 03 Subscription Architecture

**Owner**: Principal Product Architect  
**Phase**: Phase 5 deliverable #3  
**Evidence**: `00-executive-summary.md`, `BackEnd/server.js` (Razorpay webhook), `BackEnd/models/subscription.js`, `BackEnd/models/plan.js`, `BackEnd/models/moneyledger.js`

---

## 1. Current State (from codebase)

- Razorpay webhook mounted at `BackEnd/server.js:670-672` (`express.raw` body parser, `sessionsController.webhook`)
- Subscription, Plan, MoneyLedger, PhotonLedger models exist in `BackEnd/models/`
- Billing routes at `/billing`
- Payment processing fee assumption: ~2.5% (from executive summary)
- 20% platform fee is non-negotiable founder rule (executive summary line 9-10)

---

## 2. Proposed Tier Structure (India-localized, INR)

| Tier | Name | Price/mo (INR) | Course Slots | Quiz Limit | AI Features | Mentor Perks |
|---|---|---|---|---|---|---|
| Free | Orbit Basic | ₹0 | 2 | 5/week | No | View-only |
| Paid L1 | Orbit Pro | ₹299 | 5 | 25/week | Basic (cached banks) | Create 1 course |
| Paid L2 | Orbit Elite | ₹599 | Unlimited | 100/week | Full (Ollama-generated) | Create 5 courses + payouts |
| Paid L3 | Orbit Mentor | ₹999 | Unlimited | Unlimited | Full + priority | Unlimited courses + featured placement |

**All pricing UNVERIFIED — requires market validation against Indian edtech benchmarks.**

---

## 3. Pricing & Compliance Rules

| Rule | Source |
|---|---|
| 20% platform fee on all subscription revenue | Founder vision — non-negotiable |
| 80% mentor payout pool distributed across enrolled courses | Executive summary line 10 |
| Lower tiers split 80% across fewer courses (concentration effect) | Executive summary line 10 |
| INR pricing, UPI payment integration | Founder vision |
| GST compliance on digital education services | Required for India |
| UPI AutoPay mandate (RBI recurring payments) | Required for subscriptions |
| Proration on upgrade/downgrade | Standard subscription practice |

---

## 4. Upgrade / Downgrade / Proration

| Scenario | Behavior |
|---|---|
| Upgrade mid-cycle | Immediate access to new tier; prorated charge for remaining cycle |
| Downgrade mid-cycle | Access continues until cycle end; new limits apply at next renewal |
| Cancel | Access until period end; data retained 90 days; stardust preserved |
| Dunning (failed payment) | 3-day grace → limited access → suspension at day 7; reactivation clears arrears |

---

## 5. Open Questions for User (blocking)

1. **Tier pricing**: Confirm ₹299/₹599/₹999 monthly INR pricing — or provide actual target prices. — **BLOCKING** before payment flow can be specified.
2. **Free tier limits**: Confirm 2 course slots, 5 quizzes/week for free tier. — **BLOCKING**.
3. **GST rate**: Confirm 18% GST on digital education services (or provide correct rate). — **BLOCKING** for invoicing.
4. **UPI AutoPay**: Confirm recurring mandate flow; what happens when mandate expires?
5. **Payout threshold**: Minimum INR amount before mentor payout released? Frequency (weekly/monthly)?
6. **TDS**: Is TDS deducted on mentor payouts? At what rate?

---

## 6. Dependencies

- BA-08 (Razorpay webhook idempotency + signature verification) — required before any real money flows
- 02-identity-system.md — mentor tier requires Mentor identity unlock
- 04-mentor-economics.md — payout split rules
- Unit-economics.xlsx — ARPU, conversion, break-even modeling

---

## 7. Acceptance Criteria

- [ ] Four tiers (Free/Pro/Elite/Mentor) with INR pricing displayed on pricing page
- [ ] Razorpay webhook verifies signature and handles duplicates idempotently
- [ ] Upgrade/downgrade prorates correctly; access changes take effect immediately or at cycle end per rule
- [ ] Failed payment triggers dunning sequence (grace → limited → suspended)
- [ ] GST invoice generated for each payment (INR + GST line items)
- [ ] Mentor payout pool = 80% of revenue minus processor fees, split per payout rules

*Prepared by: Principal Product Architect — d:/orbit-main/orbit-main/docs/plan/03-subscription-architecture.md*