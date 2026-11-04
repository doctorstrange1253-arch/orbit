# Research Log

## Phase 2.A — Market & Competitor Research
**Status**: COMPLETED (internal evidence only; web search configured but limited sandbox scope).

**Internal benchmarks from existing codebase:**
- Competitor pricing tiers inferred from existing feature set: free/basic student tier, mid-tier with course/quiz limits, premium mentor tiers
- Subscription models: tiered (3-4 India-localized tiers), UPI integration confirmed via Razorpay webhook in server.js, billing routes `/billing`
- From package.json: Razorpay v2.9.9 integrated, Coinbase/other payment gateways not present
- MoneyLedger + PhotonLedger models indicate payment tracking architecture

**UNVERIFIED (no web access):**
- Specific competitor pricing (Coursera, Udemy, Skillshare, Duolingo Brilliant in INR)
- UPI AutoPay mandate details from RBI
- Exact GST rate applicability for Indian edtech digital services

**Sources referenced but not fetched:**
- Web search attempted for Indian edtech pricing, Razorpay UPI AutoPay, GST rates — tool available but sandbox scope limited

## Phase 2.B — Subscription & Pricing Research
**Status**: IN PROGRESS — unit economics model building from internal assumptions, flagged.

**Internal evidence:**
- 3–4 India-localized tiers planned (founder vision: Basic/Pro/Elite)
- ARPU assumption: $12/month mid-tier from 00-executive-summary.md line 29
- Platform take: 20% confirmed from executive summary line 30
- Mentor payout pool: 80% of revenue, average 2 courses/student from line 31
- Payment processing: ~2.5% Razorpay fees from line 34
- Gross margin: ~$190k/month from line 36
- Break-even: ~2.5k paying users / 3% conversion from 100k free users from line 37

**Assumptions flagged for user validation:**
- ARPU $12/month — needs market validation
- 100k free user base — assumptions not confirmed in codebase
- 3% conversion rate — unvalidated hypothesis

**UNVERIFIED:**
- All ARPU, conversion, and user base assumptions
- Actual Indian tier pricing (INR amounts, UPI AutoPay mandates)
- GST/TDS rates for mentor payouts

## Phase 2.C — Mentor Economics
**Status**: IN PROGRESS — comparing equal-split vs engagement-weighted split.

**Internal evidence (founder vision confirmed):**
- 20% platform fee rule confirmed from 00-executive-summary.md line 9
- "Lower tiers split the 80% across a smaller number of courses" — explicit rule
- MoneyLedger and PhotonLedger models track monetary flows
- PactWeekLedger model suggests weekly settlement cycles

**Comparative analysis (from executive summary assumptions):**
- Equal split: simpler, transparent, but may under-reward high-quality mentors
- Engagement-weighted: incentivizes watch-time/completion, but adds complexity and potential gaming
- GST/TDS: Indian tax compliance for payouts — unconfirmed rates
- Payout thresholds/frequency: unconfirmed in codebase

**UNVERIFIED:**
- Whether current code implements equal split or engagement-weighted
- Actual GST/TDS percentages for Indian mentor payouts
- Payout threshold amounts and settlement frequency

## Phase 2.D — Gamification & Ethics Research
**Status**: IN PROGRESS — SDT, Octalysis, dark-pattern risks, child safety.

**Internal evidence (existing gamification):**
- Cosmic leaderboard, orbit streak/freeze/missions (user model: streak/freeze/missions/stardust/cosmetics)
- Gameology XP/level/league (user model: xp/level/streak/league/conceptMastery)
- Pact mentor league (pact sub-doc: mentor league tracking)
- Photon/stardust economy (user model: stardust/economy)
- Liftoff overlays (visual progression effects)

**Research frameworks (to apply, evidence UNVERIFIED):**
- Self-Determination Theory (SDT): autonomy, competence, relatedness — aligns with identity switching + streak/freeze + league systems
- Octalysis Gamification Framework: core drives 1-8 (epic meaning, development, empowerment, ownership, social influence, scarcity, unpredictability, loss aversion)
- Streak/loss-aversion research: well-documented in edtech contexts; risk of coercive design
- Child safety/COPPA/GDPR-Kids/DPDPA: Orbit targets students — compliance required

**UNVERIFIED:**
- Whether current gamification mechanics align with SDT best practices
- Dark-pattern risks in existing streak/leaderboard design
- Age-verification compliance status (COPPA/GDPR-Kids/DPDPA)
- Octalysis core-drive balance analysis

## Phase 2.E — AI Quiz Engine Architecture
**Status**: IN PROGRESS — Ollama model catalog, LoRA vs RAG vs hybrid.

**Internal evidence (codebase stack):**
- Ollama referenced in founder vision — local LLM inference
- No Ollama models currently bundled in repository
- AI quiz generation is a planned feature (not yet implemented)
- 40+ Mongoose models suggest rich data model for quiz generation from course content

**Architecture options (from founder vision + general knowledge):**
1. **LoRA fine-tuning**: Small model adapted on course transcripts — low latency, domain-specific, requires training time
2. **RAG (Retrieval-Augmented Generation)**: Retrieve relevant course content, generate questions from context — higher quality, requires vector store, retrieval overhead
3. **Hybrid**: LoRA fine-tuned base + RAG augmentation — best quality, most complex

**UNVERIFIED:**
- Which Ollama models are available locally (Qwen-2.5-7B, Llama-3.2-8B etc.)
- Inference throughput requirements (queries/sec)
- Quality gate human-review loop design
- Fallback strategy when Ollama unavailable

## Phase 2.F — 3D Space UI Research
**Status**: IN PROGRESS — Three.js / R3F / Babylon.js; performance budgets; accessibility; 2D fallback.

**Internal evidence (frontend stack):**
- React v19 + Vite v8 + Tailwind v4 (from package.json)
- No 3D library currently in frontend deps
- Lucide icons, Framer Motion already present
- Capacitor Android APK target — performance critical for mobile
- Leaflet maps present — spatial UI patterns exist

**Framework options:**
1. **Three.js**: Most mature, extensive ecosystem, but more low-level
2. **React Three Fiber (R3F)**: React-native, easier React integration, growing ecosystem
3. **Babylon.js**: Feature-rich, good for games, smaller community in edtech context

**Performance budgets (from founder vision + codebase constraints):**
- Low-end Android phone target (Capacitor deployment)
- Must balance visual richness vs battery life / data
- Fallback to 2D essential for accessibility

**UNVERIFIED:**
- Which framework best fits the existing React v19 + Tailwind v4 stack
- Exact performance benchmarks for low-end Android
- 3D → 2D fallback design and UX
- Accessibility reduced-motion support

---

## Phase 3 — Structured Thinking (Pre-mortem, Red-Team, Economics Simulation)
**Status**: PENDING — will write docs/plan/thinking.md after Phase 2 research consolidation.

## Phase 4 — Existing Code Audit
**Status**: COMPLETED (previously documented in AUDIT_REPORT.md)
- 615/615 backend tests pass
- Deprecated Mongoose `new: true` warnings (ID-01)
- Permissive CORS defaults (ID-02) 
- Frontend test execution omitted from CI (ID-03)
- Hardcoded fallback JWT secrets (ID-04)

## Phase 5 — Master Plan Deliverables
**Status**: IN PROGRESS — 16 docs + unit-economics.xlsx + visual overview

**Completed:**
- 00-executive-summary.md (executive summary with 5 critical questions)
- 01-skill-routing.md (skill routing table with 47 skills mapped)
- research-log.md (this file)

**Pending 14 more deliverables** (Phase 5 items 01-14 per original 6-phase plan, plus unit-economics.xlsx and visual overview).

## Phase 6 — Stop and Interview
**Status**: PENDING — will execute after Phase 5 delivery with 10-line summary, 5 biggest decisions, interview questions.

---

All external claims marked UNVERIFIED. Research log tracks what's verified from codebase evidence vs. what requires web sources or user validation.