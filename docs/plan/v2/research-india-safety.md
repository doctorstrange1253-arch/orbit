# Research - India payments, privacy and child safety

Consolidated 2026-11-07. Phase C topics C09/C10. Status: PARTIAL, with material legal and safeguarding questions unresolved.
[Skill: sn-deep-research] [Skill: sn-research-report] [Skill: sn-da-non-spreadsheet-analysis]

## Scope and status

This is informational research for a later product plan, not legal or tax advice, approval of money handling, or a completed compliance assessment. Fixed founder constraints remain 15% platform share on optional mentor-priced sessions and a separate 20% subscription share. Those shares do not determine the tax base, payment-processor charges or liability allocation.

IS's finalized report returned 16 source records and 29 attempts. Many records are navigation, promotions or unreadable PDFs, not substantive legal evidence. Exact attempt logs and attributed clauses are preserved in [research-attempts.md](research-attempts.md) and [research-source-register.md](research-source-register.md). The coordinator subsequently extracted the public PIB explainer and original DPDP Act/Rules through the already-installed pdftotext. The original PDFs are retained locally with integrity hashes; they are not approved for public redistribution.

No accountant/lawyer review, provider onboarding, KYC submission, payment, production data inspection or external service account change occurred.

## Source hierarchy and provenance

| Source | Access / status | What it establishes and what it does not |
|---|---|---|
| [RBI PA Master Direction](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12896), IS-S12 | Worker opened 2026-11-06; issued 2025-09-15, RBI/DPSS/2025-26/141 | Selected definitions, due diligence, escrow/refund/settlement clauses. Full effective-date clause, amendment history and incorporated KYC text not completely reviewed |
| [Razorpay pricing](https://razorpay.com/pricing/), IS-S11 | Worker opened 2026-11-06 | Conflicting displayed tariff statements and promotions, not a written applicable quote |
| [Razorpay Route](https://razorpay.com/route/), IS-S13 | Worker opened 2026-11-06 | Advertised linked accounts/splits/transfers; not approval for this proposed flow |
| [Cashfree gateway charges](https://www.cashfree.com/payment-gateway-charges/), IS-S06 | Partial worker extraction, 2026-11-06 | Conditional promotional figures, not an established all-in standard tariff |
| [Cashfree Easy Split](https://www.cashfree.com/easy-split/split-payment-gateway/), IS-S14 | Worker opened 2026-11-06 | Published split/refund/reporting capabilities; no tested funding/recovery guarantee |
| [Stripe India pricing](https://stripe.com/in/pricing), IS-S07; [Connect pricing](https://stripe.com/in/connect/pricing), IS-S15 | Worker opened 2026-11-06 | Published methods/meters and invitation CTA, not India account/charge-model eligibility |
| [Income Tax Act navigation](https://www.incometaxindia.gov.in/income-tax-act-2025), IS-S09 | Navigation only | Does not establish current withholding number/rate/base; linked transition FAQ remained blocked |
| [PIB explainer PDF](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf), IS-S10 | Worker unreadable; coordinator text-read seven pages on 2026-11-07; dated 2025-11-17 | Government explanation and links to original texts; not a substitute for operative law |
| [PIB release](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014) | Coordinator opened, posted 2025-11-14; final URL included reg=48 and lang=2 | Confirms announcement and describes phased compliance; broad summaries need clause-level qualification |
| [DPDP Rules, G.S.R. 846(E)](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf) | Coordinator text-read English pages 24-41 on 2026-11-07; notification dated 2025-11-13, electronic publication identifier 2025-11-14 | Actual Rules and Schedules; not the separate Act-commencement notification or a complete current amendment audit |
| [DPDP Act, No. 22 of 2023](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf) | Coordinator text-read 21 pages on 2026-11-07; assent 2023-08-11 | Enacted provisions; section 1(2) makes commencement notification-dependent |

Access dates after local midnight are 2026-11-07; downloads recorded UTC on 2026-11-06. Do not turn a URL directory date, copyright date or update label into an effective date. Visual PDF figures and signatures were not authenticated; textual extraction and byte integrity were checked.

## C09 - What the opened RBI text says

These are attributed summaries of the selected official clauses in IS-S12, not classification of Orbit as a PA or a merchant.

1. **Roles differ.** Definitions 4(i)/(j) distinguish a fund-handling payment aggregator from infrastructure-only payment gateway. General Directions restrict aggregation to contracted merchants and state that a PA business shall not conduct marketplace business. Whether particular corporate arrangements satisfy this needs professional review.
2. **Responsibilities must be allocated.** Section 8 addresses refunds, failed transactions, returns, complaints and reconciliation in agreements. General Direction (f) sends refunds to the original payment method unless the payer specifically requests another mode belonging to that same payer.
3. **Onboarding is substantive.** Section 13 refers to RBI KYC requirements, consent-based CKYCR retrieval, verifying merchant bank settlement and ensuring marketplace payments concern sellers on that platform. It is not equivalent to checking a mentor checkbox or role string.
4. **Transition details matter.** Section 13(j) gives existing merchants onboarded through 2025-12-31 a transition, and requires onboarding compliance for merchants onboarded from 2026-01-01. Incorporated directions and exceptions were not fully reviewed.
5. **Escrow is not an app field.** Section 16 and Table 1 require non-bank PA collected funds to be in separate escrow with a scheduled commercial bank in India, limited to permitted operations and adequate day-end unsettled payables.
6. **Third-party payouts are conditional.** Table 1 permitted debit (iv) has specific merchant direction, turnover and underlying-transaction conditions. It does not grant unrestricted release to arbitrary parties.
7. **Settlement is agreement-based in this text.** Table 1 refers to the PA-merchant agreement and fair/equitable/transparent timing. It does not establish a universal statutory T+1 deadline or permit indefinite holds.

**Inference:** A marketplace subscription pool, mentor session prepayment, pledge, refundable deposit and provider escrow are not interchangeable flows. The current app's ledger names cannot determine which legal arrangement applies. No escrow/hold design is finalized in research.

## Published provider comparison, not approved procurement

| Option | Opened vendor description | Pricing evidence | Unresolved before modeling |
|---|---|---|---|
| Razorpay gateway + Route | Linked seller/service-provider accounts, amount splitting, transfers and settlement controls; subscription/link/invoice collection mentioned | IS-S11 schedule displayed 2.15% + GST while FAQ repeatedly said 2% + GST; separate first-90-days promotion | Actual contracted rate, Route fee, KYC, hold limits, refunds/reversal funding and eligibility |
| Cashfree gateway + Easy Split | Amount/percentage splits, commission deductions, reconciliation/webhooks and post-settlement adjustment described | 0% new-merchant offer up to INR 20 lakh through 2027-03-31 alongside 1.95%; full conditions not extracted | Applicable tariff, offer eligibility, Easy Split fee, tax treatment and refund liability |
| Stripe Payments + Connect | Different pricing/liability models for Stripe charging accounts versus platform-controlled pricing; onboarding/payout controls | India card headline: 2% domestic Visa/Mastercard, 3% foreign and relevant conversion +2%; debit footnote differs. Platform-price Connect headline: INR 150/active account/month and 0.25% + INR 20/payout | Additional volume charges, exact supported charge/account types, India admission/invitation, taxes, losses and all-in quote |

These are observations of pages opened on 2026-11-06. Promotional/FAQ inconsistencies are not resolved by choosing the most favorable number. Do not insert them as constants into a launch model. Processing fees and taxes are separate from the founder's shares; who bears them is a later decision.

## C09 - Material unresolved questions

- Current income-tax commencement/transition, e-commerce withholding section/subsection/table, rate, base, threshold and timing are UNKNOWN from the opened operative evidence. Do not copy a historical section number, a search-query hypothesis or a familiar rate into the implementation plan.
- GST/TCS rates and bases, educational-service exemptions, principal-versus-agent supplies, invoice issuer, place of supply and tax treatment of the platform share remain unverified.
- Provider-specific KYC/beneficial-owner documents, maximum settlement holds, chargeback/refund recovery, funding reserves and India Connect availability remain unverified.
- No provider's conversion or reliability superiority in India is established by marketing statements.

## C10 - Primary Act and Rules findings

### Commencement: content is not the same as current enforceability

The enacted Act's section 1(2) permits different provisions to commence on different dates through Gazette notification. The 2023 Act PDF alone therefore does not establish which sections were operative on the research date.

Rule 1 of the opened final Rules states:

| Provision group | Textual commencement rule |
|---|---|
| Rules 1, 2 and 17-21 | Date of publication in the Official Gazette |
| Rule 4 | One year after publication |
| Rules 3, 5-16, 22 and 23 | Eighteen months after publication |

The Rules notification is dated 13 November 2025; its publication identifier/footer and PIB announcement refer to 14 November. This note preserves the relative commencement language instead of resolving calendar computation without checking the separate notification and current amendments. On either date basis, the eighteen-month group is not fully effective merely because the 2025 explainer says "full operationalisation." No blanket "all DPDP obligations already active" claim is made.

### Children and educational exemptions

- **Act section 2(f):** a child is an individual who has not completed eighteen years. Section 9(1) addresses verifiable parental/lawful-guardian consent; 9(2) prohibits processing likely to harm a child's wellbeing; 9(3) restricts tracking/behavioral monitoring and targeted advertising. Commencement and exemptions must be considered separately.
- **Rule 10:** due diligence concerns identifying an adult claiming to be the parent through reliable identity/age details or voluntarily supplied details/authorized tokens. The examples include existing-account details and authorized/digital-locker sources. This is not proof a checkbox, uploaded document or phone OTP alone suffices.
- **Rule 12 / Fourth Schedule:** exemptions concern subsections 9(1) and 9(3), subject to specified classes/purposes and conditions. The educational-institution entry restricts processing to tracking/behavioral monitoring for that institution's educational activities or safety of enrolled children. It is not a general exemption for everything marketed as education.
- **Schedule definition:** educational institution includes institutions of learning imparting education, including vocational education. Whether this marketplace/operator qualifies, and whether a particular processing purpose is within the exception, needs legal review. The exception must not be extrapolated to ads, unrelated profiling or all vendors.
- **Section 9(2):** the Schedule language about 9(1)/(3) does not by itself exempt harmful processing under 9(2).

**Inference:** Student public rankings, adaptive behavior profiles, guardians' reports, advertising and recordings need separate purpose/eligibility decisions. An education theme does not settle the legal classification. No child onboarding or safety policy is finalized here.

### Retention, breach response and user rights

| Text | Actual scope to preserve | Avoid this shortcut |
|---|---|---|
| Act sections 6 and 8 | Purpose-limited affirmative consent, withdrawal comparable in ease, processor accountability, erasure subject to lawful retention | "Consent to everything" or automatic indefinite storage |
| Rules 6 and 8(3) | Text includes security/log/personal-data retention provisions, including a one-year period and other-law qualifications | Treating one duration as a universal current recording-retention mandate; commencement/category/application need review |
| Rule 7 | Affected individuals and initial Board notice without delay; detailed Board information within 72 hours or permitted extension | Waiting 72 hours before every notification |
| Rule 14(3) | Published grievance-response arrangements with a reasonable period not exceeding 90 days | Reading the explainer as a universal deadline for every distinct rights operation without the clause context |
| Third Schedule | Specified high-user-count classes and purposes; inactivity rules and exceptions | Applying the same inactivity deletion rule automatically to every small education business |
| Consent Manager schedule | Separate registered role with its own records/conditions | Importing its seven-year record rule wholesale into an ordinary platform |

The coordinator read the full English Rules text and all Act text; extraction does not establish legal suitability or superseding amendments. The separate Act-commencement notification, current amendments and interaction with other laws remain unresolved.

## Tutoring safety still needs authoritative evidence

DPDP is not a complete live-tutoring safeguarding policy. This pass has not established authoritative operational guidance for identity checks, guardian participation, one-to-one supervision, emergency escalation, mandatory reporting, off-platform contact handling, recording consent or evidence preservation across relevant Indian laws. A search for child-safety guidance was challenged and not bypassed.

**Opinion/proposal:** Treat these as launch-blocking policy questions, not optional design polish. Research may propose options later, but the founder must approve the safety policy and obtain qualified advice. That recommendation does not implement any restriction or approve child access.

## Local evidence integrity

| Attachment | SHA256 | Reading scope |
|---|---|---|
| [PIB explainer](sources/pib-dpdp-2025/pib-dpdp-rules-2025.pdf) | 047206c88ce111807baf60f476b8d7f15a7480a2727e76a8ad59e394f49852b4 | Seven extracted text pages |
| [Rules](sources/dpdp-rules-2025/dpdp-rules-2025.pdf) | eabc7d05e013144615d78ddc0e8b9c9aac1920e814f4fad38ce6560951f5aa08 | English Gazette pages 24-41; preceding Hindi pages not independently translated |
| [Act](sources/dpdp-act-2023/dpdp-act-2023.pdf) | 4deb23981d3010c8225a2ff6149e7243dc2268455b299e283afebdd7b72a7d15 | Twenty-one extracted text pages |

Hashes establish local bytes, not authenticated signatures or legal currency. Original source URLs and attempts are in this note and the central ledger. No source PDF is approved for a future public commit without checking redistribution rights.
