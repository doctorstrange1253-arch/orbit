# Research - notes editors and one-to-one media

Access date: 2026-11-06. Phase C topics C07/C08. Status: PARTIAL.
[Skill: sn-deep-research] [Skill: context7] [Skill: sn-search-academic]

## Evidence boundary

NC's interim message captured only its first two searches/nine opens. Its finalized workflow record contains six search requests and twenty source GETs, including one redirect; 19 HTTP-200 responses include a TOC and an abstract, not 19 substantive confirmations. The finalized record supersedes the interim snapshot. No app action, provider API usage, installation or worker file write occurred. The coordinator corroborated selected BlockNote/Daily/Twilio passages, opened the supplied ProseMirror navigation lead and read Lexical's actual MIT license through gh.

Additional finalized evidence covers LiveKit rates/self-hosted TURN, mediasoup's low-level SFU, dated Jitsi recording guidance, partial BlockNote commercial terms, Tiptap math and a local-inference demo. Detailed mobile/IME/timestamp behavior, full operative licenses, P2P/India network evidence and transcript-grounding validation remain incomplete. A pricing page or demo does not prove operational quality or authorize procurement. Fixed 15% session and separate 20% subscription platform shares remain unchanged.

## Source register

All worker source accesses were recorded as 2026-11-06. The finalized pass used native Node GET with manual redirect handling; one HTTP 308 canonicalized LiveKit pricing, and 19 other responses returned 200. Navigation/abstract/partial content is not automatically substantive support. Unknown publication/effective dates remain unknown.

| ID | Source | Evidence/date | Limit |
|---|---|---|---|
| NC-S01 | [Tiptap feature comparison](https://tiptap.dev/feature-comparison) | OPENED by worker; date unknown | Core statement and platform feature boundaries; dynamic base-price placeholders unresolved |
| NC-S02 | [Lexical introduction](https://lexical.dev/docs/intro) | OPENED by worker; version/date unknown | Architecture/extensions/serialization; exact license not in extracted text |
| NC-S03 | [Slate introduction](https://docs.slatejs.org/) | OPENED by worker; relative update label four years ago | Documentation states MIT and beta/API warnings; linked license text not opened |
| NC-S04 | [BlockNote pricing](https://www.blocknotejs.org/pricing) | OPENED; selected XL/pricing passages corroborated by coordinator; date unknown | Vendor licensing FAQ, not full legal terms; exact currency code not established |
| NC-S05 | [100ms pricing](https://www.100ms.live/pricing) | OPENED by worker; effective date unknown | Flattened selector/calculator/support states partly ambiguous; dollar symbol not ISO currency proof |
| NC-S06 | [Daily Video SDK pricing](https://www.daily.co/pricing/video-sdk/) | OPENED; selected rate/unit passages corroborated; effective date unknown | Detailed storage cadence and ISO currency not established |
| NC-S07 | [Twilio Video pricing](https://www.twilio.com/en-us/video/pricing) | OPENED and selected facts corroborated; expressly current as of October 2026 | Vendor offer, not a network benchmark; extracted dollar symbol alone not ISO currency proof |
| NC-S08 | [Agora video pricing](https://www.agora.io/en/pricing/video-calling/) | OPENED by worker; effective date unknown | Proxy table explicitly uses US$/USD; standard-minute conversion documentation not opened |
| NC-S09 | [LiveKit pricing explanation](https://kb.livekit.io/articles/3947254704-understanding-livekit-cloud-pricing) | OPENED by worker; relative update label 11 months ago | Meter definitions; current rate page is separately NC-S16 |
| NC-S10 | [LiveKit old rate URL](https://livekit.io/pricing) | HTTP 308 to NC-S16; LEAD | Redirect, not an independent source |
| NC-S11 | [LiveKit deployment](https://docs.livekit.io/transport/self-hosting/deployment/) | OPENED; date unknown | Embedded authenticated TURN and certificate/firewall/resource requirements, not deployment testing |
| NC-S12 | [mediasoup documentation](https://mediasoup.org/documentation/) | Navigation only | No architecture/price inference from a TOC |
| NC-S13 | [BlockNote XL terms](https://www.blocknotejs.org/legal/blocknote-xl-commercial-license) | PARTIAL text through start of section 6.2 | Active deployment license, application/developer limits and termination; remainder not reviewed |
| NC-S14 | [Lexical homepage demo description](https://lexical.dev/) | OPENED; demo not executed | Browser-local WASM inference example, not transcript grounding or measured mobile performance |
| NC-S15 | [Tiptap extensions](https://tiptap.dev/docs/editor/extensions/overview) | OPENED catalog | Mathematics/collaboration and paid-tier labels; not every extension license/behavior |
| NC-S16 | [LiveKit canonical pricing](https://livekit.com/pricing) | OPENED; effective date/ISO currency not explicit | Published connection/bandwidth/transcoding/track meters, not all-in quote |
| NC-S17 | [mediasoup overview](https://mediasoup.org/documentation/overview/) | OPENED; date unknown | Low-level signaling-agnostic SFU/media layer, no mixing/transcoding or complete app services |
| NC-S18 | [Jitsi hosted-component announcement](https://jitsi.org/blog/introducing-jaas-components/) | Published 2022-12-16, modified 2024-04-23 | Historical Jigasi offering; not current JaaS pricing/SLA |
| NC-S19 | [Dialogue summarization faithfulness paper](https://aclanthology.org/2024.acl-long.677/) | Abstract only; 2024-08 | Unsupported inference/detection findings; sample/effect sizes and full paper not read |
| NC-S20 | [Jitsi FAQ](https://jitsi.org/user-faq/) | Dated FAQ, modified 2024-05-28 | Self-hosting/SFU/Jibri/mobile description; current service/SLA/P2P/TURN/license terms not verified |
| C07-S001 | [ProseMirror](https://prosemirror.net/) | Coordinator GET 200; date/version unknown | Homepage documents schemas/plugins/collaboration and free commercial use; exact license text not opened |
| C07-S002 | [Lexical MIT license](https://github.com/meta/lexical/blob/main/LICENSE) | Coordinator gh API exit 0, full text read; blob b93be90515ccd0b9daedaa589e42bf5929693f1f | Commercial use with notices; version/transitive licenses not reviewed |

Finalized source claims and all later NC attempts are retained in the source/attempt annexes. A file blob identifies content, not the release version or legal advice.

## C07 - Editor comparison

| Option | Source-backed capability | License/commercial boundary | Unknown or untested |
|---|---|---|---|
| Tiptap | Editor with separate platform collaboration/document/conversion features | NC-S01 calls core MIT/free, but platform/Pro features and document charges are separate | Every extension's license, exact base prices, mobile fidelity, math/timestamp and local draft workflow |
| ProseMirror | Extensible schemas, modular/plugins and built-in collaboration support described | C07-S001 says open source and legally free for commercial use; exact license text not inspected | Full notes UI/storage/export, current release/compatibility and deployment costs |
| Lexical | Framework-agnostic core, React bindings, optional extensions, Yjs and JSON/HTML/Markdown conversion; homepage describes browser-local model examples | MIT core text was opened by coordinator through gh; advanced integrations/dependencies have separate review needs | Toolbar/storage are application work; transcript timestamps/PDF/mobile limits and draft factuality unverified |
| Slate | React/plugin-first framework; operations permit collaboration layered above core; HTML serialization examples linked | Introduction states MIT; warns of beta/breaking advanced APIs | Complete collaboration service, current release status, export fidelity/mobile/IME behavior |
| BlockNote | Core blocks/UI/collaboration/comments; advanced exporters/AI/layouts in XL | Worker-read FAQ: core MPL-2.0; XL GPL-3.0 or commercial dual license; coordinator corroborated XL boundary | Full legal terms/distribution conditions, exact currency, math/timestamp behaviors and local-model factuality |

NC-S04's FAQ describes core use in closed-source/commercial apps while expecting modifications to BlockNote source files to be shared; that is the vendor's summary, not a legal analysis of distribution triggers. Its commercial FAQ says one application per license. Advanced XL export/AI features must not be silently treated as permissive core features.

The coordinator directly observed BlockNote's Business display of $195/month with $2,340 billed yearly and a $390/month reference price; Enterprise is custom. These are displayed plan values, not an accepted offer or proof of ISO currency. Tiptap's unresolved placeholders are deliberately not converted into invented prices; its worker-read footnote distinguishes a 30-day trial from production use outside staging.

**Inference:** Generic editor support for collaboration, AI or serialization does not establish transcript-grounded notes, timestamp citation correctness, private student annotations or approved publication. No source here validates a local Ollama draft workflow or its learning effect.

**Opinion/proposal:** Keep core, advanced packages, hosted services and authored content as separate evaluation rows. No editor/library choice or notes schema is finalized.

## C08 - Published media billing comparison

Values below are dated access observations, not total-cost estimates. Dollar symbols are reproduced as published; do not convert to INR or assume identical currency/region/tax treatment without checking the applicable contract. Agora's source explicitly uses USD in its proxy table. Free pools, bundles and recorded/participant units are not interchangeable.

| Provider | RTC / free allowance | Recording or related meter | Principal limitation |
|---|---|---|---|
| 100ms (NC-S05) | 10,000 conference participant-minutes/month free; displayed paid $0.004/participant-minute | 300 free recording minutes then displayed $0.0135/minute | SD/HD selector effects and detailed meter definitions not fully established |
| Daily (NC-S06) | 10,000 free participant-minutes/month; initial video/audio $0.004, audio-only $0.00099 per participant-minute | Video $0.01349 per recorded wall-clock minute; additional displayed storage $0.003/minute | Any camera/screen-share video track changes the session from audio-only billing; storage cadence unknown |
| Twilio (NC-S07) | Group Rooms $0.004/participant-minute; trial credit mentioned, amount unverified | Participant tracks $0.004/participant-minute; composition $0.01/composed minute | First 10 GB storage free, then $0.00167/GB/day; recording and composition are additional meters |
| Agora (NC-S08) | Audio/HD/Full HD/2K/2K+ $0.99/$3.99/$8.99/$15.99/$35.99 per 1,000 participant-minutes | Cloud audio/HD/Full HD $1.49/$5.99/$13.49 per 1,000 minutes | Prepaid standard minutes are a different unit; resolution weighting not verified |
| LiveKit (NC-S09/16) | Guide separates connection-minutes and downstream GB; canonical pricing documents Build/Ship/Scale below | Transcoding and track egress have distinct allowances/overages | Effective date/currency and actual usage topology require contract/model checks |
| mediasoup / Jitsi (NC-S17/20) | Documented self-hosted media layers; mediasoup low-level SFU, Jitsi Videobridge with Jibri recording | Surrounding signaling, TURN/recording setup and operations are not automatically supplied | Actual deployment, precise license/P2P/TURN terms and current hosted prices unverified |

### Further published units, not normalized estimates

| Source | Published detail | Caveat |
|---|---|---|
| NC-S05 | Live-stream viewing: 10,000 free then $0.0012/viewer-minute; encoding: 1,000 free then $0.04/minute | Mode/billing definitions require follow-up |
| NC-S05 | Live transcription: 300 free then $0.017/minute; post-call: 300 free then $0.004/minute; AI summary: 300 free then $0.0035/minute; RTMP: 300 free then $0.04/minute | No factuality, safety or recording-consent conclusion follows |
| NC-S05 | Custom discount discussion above $5,000 monthly usage | No negotiated rate established |
| NC-S06 | Audio recording $0.005/recorded minute; RTMP $0.015/encoded minute; HLS $0.03/encoded minute | Recording wall-clock differs from RTC participant billing |
| NC-S06 | Realtime transcription $0.0059/unmuted participant-minute; post-call $0.0043/recorded minute | Different units and activation conditions |
| NC-S06 | Advanced firewall control including TURN override $500/month | Not a claim that normal calls always need this add-on |
| NC-S07 | Transcription $0.027/room-minute; Group Rooms list up to 50 participants and unlimited TURN relay | Vendor documentation, not a measured India reliability advantage |
| NC-S08 | Cloud Proxy automatic mode free; forced UDP/TCP/TLS billed at greater of usage or monthly minimum | Forced proxy is not automatically equivalent to a standard TURN deployment |
| NC-S08 | Forced-proxy minima: $500 up to 200 peak concurrent users; $1,000 for 201-1,000; $2,000 for 1,001-2,000; quote above | Source explicitly uses USD here; usage adds resolution-dependent rates |
| NC-S08 | On-prem recording audio/HD/Full HD $0.99/$3.99/$8.99 per 1,000 minutes; webpage HD/Full HD $14/$28 | On-prem recording does not prove self-hostable RTC transport |
| NC-S09 | Room/web composites use elapsed minutes; participant composites use participant-minutes | Track egress/most WHIP ingress not requiring transcoding does not mean zero bandwidth/other charges |

### Daily graduated rates

NC-S06 explicitly describes graduated pricing, not repricing all usage at the final volume tier. First 10,000 minutes form the free pool; paid bands below are as displayed. Enterprise arrangements remain quote-only.

| Monthly participant-minute band | Video/audio | Audio-only |
|---|---|---|
| 10,001-100,000 | $0.0040 | $0.00099 |
| 100,000-500,000 | $0.0037 | $0.00092 |
| 500,000-1,000,000 | $0.0034 | $0.00085 |
| 1,000,000-10,000,000 | $0.0030 | $0.00074 |
| 10,000,000-25,000,000 | $0.0026 | $0.00064 |
| 25,000,000-50,000,000 | $0.0022 | $0.00054 |
| 50,000,000+ | $0.0015 | $0.00036 |

### Agora standard-minute bundles

NC-S08 displays 10,000 free standard minutes, then $45.99/month for 50,000, $133.99 for 150,000, $339.99 for 400,000, $659.99 for 800,000 and $1,217.99 for 1.5 million; Enterprise custom. The unopened weighting specification prevents calling the free bundle "10,000 HD-video minutes." Free-bundle exhaustion can suspend service; paid bundles describe weekly postpaid overage against prepaid balance/card.

## Operational inferences and unresolved comparisons

- Session duration alone is insufficient for cost comparison when participant count, tracks/composition, storage, bandwidth or transcription activation differ. This follows from NC-S06/07/09; no final unit-economics model is built here.
- Daily's FAQ describes no hard cap that stops chargeable calls after free usage, and short diagnostic retention (one day unpaid, three days with a card). Later incident investigation may therefore require a separate retention arrangement; that consequence is inference, not measured user incidence.
- A few seconds of screen sharing can change Daily's billing classification. Free RTC minutes do not imply free recording. These are documented constraints, not prevalence estimates or F9 user-complaint counts.
- Twilio managed Group Rooms and TURN are documented. Daily/100ms managed usage, Agora proxy/on-prem recording and LiveKit meters are documented; that does not establish their entire P2P/self-host product surface or relative weak-network performance in India.
- Mutual recording consent, storage/access/evidence retention and minors policies remain IS-owned research and later founder decisions. No provider choice, legal compliance conclusion or new financial share follows from a pricing page.

## Complete attempt record

All dates are 2026-11-06. Exact URLs for NC-S01 through NC-S09 are above and in the central ledger; the coordinator's additional opens are logged there separately.

| Attempt | Query / opened source | Outcome |
|---|---|---|
| NC-L01 | Intended Q1 editor search | Local shell quoting failure; no HTTP request |
| NC-L02 | DuckDuckGo: 2026 editor documentation license (site:tiptap.dev OR site:lexical.dev OR site:docs.slatejs.org OR site:blocknotejs.org OR site:prosemirror.net) | HTTP 200; actual editor URLs discovered |
| NC-L03-06 | NC-S01 through NC-S04 respectively | Four HTTP 200 substantive source opens |
| NC-L07 | DuckDuckGo: 2026 video call pricing (site:livekit.io OR site:daily.co OR site:100ms.live OR site:agora.io OR site:twilio.com) | HTTP 200; actual provider URLs discovered |
| NC-L08-12 | NC-S05 through NC-S09 respectively | Five HTTP 200 substantive source opens |
| Return-tool lookup | StructuredOutput | Missing; complete partial evidence delivered through SendMessage without claiming validation |

Further unopened leads: [Tiptap commercial license](https://tiptap.dev/pro-license), [Agora standard pricing definitions](https://docs.agora.io/en/realtime-media/rtc/reference/pricing), [Slate collaboration](https://docs.slatejs.org/walkthroughs/07-enabling-collaborative-editing) and [Slate serialization](https://docs.slatejs.org/concepts/10-serializing). BlockNote XL terms are now partially read as NC-S13, and the old LiveKit rate URL was followed to the opened NC-S16 canonical page; do not retain their earlier unopened status as the final scope.

## Additional finalized evidence and unresolved guarantees

### LiveKit meters and self-hosting

NC-S16's canonical price page lists the following access-date values; dollar symbols are reproduced, not converted or assumed to include regional taxes.

| Plan | Base / connection / downstream allowance | Published overage |
|---|---|---|
| Build | $0/month; 5,000 WebRTC minutes; 50 GB downstream; 100 concurrent connections | Paid-plan and limit behavior must be checked before use |
| Ship | Starts $50/month; 150,000 WebRTC minutes; 250 GB downstream | $0.0005/minute; $0.12/GB |
| Scale | Starts $500/month; 1.5 million WebRTC minutes; 3 TB downstream | $0.0004/minute; $0.10/GB |
| Enterprise | Custom | Written quote required |

The source describes 60/600/8,000 transcoding minutes for Build/Ship/Scale shared by import and recording/export, with Ship video/audio overages $0.02/$0.005 and Scale $0.015/$0.004 per minute. Track egress has separate allowances and $0.001/minute paid-plan overage. These are not one universal recording rate or an all-in cost per booking.

NC-S11 describes an authenticated embedded TURN server and trusted certificates, HTTPS, firewall, CPU and bandwidth deployment concerns. NC-S17 describes mediasoup as a low-level signaling-agnostic SFU without mixing/transcoding, so application services and recording integrations remain work. NC-S20's dated Jitsi FAQ describes self-installation, Videobridge and Jibri for recording/RTMP; the old public-service description is not a current SLA or price quote. None establishes India-network superiority or that self-hosting is free to operate.

### Commercial terms and local drafts

NC-S13's partial BlockNote XL terms through early section 6.2 describe one application/production environment, five developers, an active license for deployed use and cessation on termination unless separately licensed. Its trial is 30-day nonproduction evaluation; startup discounts require written confirmation. Later clauses were not read. Annual pricing versus monthly-renewal wording remains a contract/order question, not silently reconciled entitlement.

NC-S15's catalog documents Tiptap LaTeX Mathematics, Collaboration/Caret and UniqueID, with commercial labels on exports/comments/snapshots/tracked changes and AI tools. A node identifier does not establish a transcript timestamp, and a catalog is not every extension's operative license.

NC-S14 describes SmolLM2/BERT-NER examples running locally via WebAssembly, but the demo was not executed. NC-S19 is an ACL 2024 dialogue-summary abstract reporting plausible unsupported inferences in GPT-4/Alpaca summaries and difficult automatic detection. Full methods, sample and numerical effects were not read. Together they support a reason to distinguish local execution from factual grounding; they do not validate an Ollama transcript draft, mentor approval or current mobile feasibility. Human review is not an accuracy guarantee.

All later NC queries/opens are in the finalized attempt annex. Earlier interim message/source gaps are retained as history, not the final evidence boundary.

## Remaining work

Pin full operative licenses/packages; establish timestamp anchors, mobile/IME/export fidelity and grounded draft validation; confirm P2P/TURN/recording limits, current Jitsi/media-layer licenses, vendor currency/contract and Agora weighting. Actual India reliability remains unverified. No chart, package, hosted call, spreadsheet, Feature Card or later phase has been started.
