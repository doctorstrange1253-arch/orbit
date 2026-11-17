# Feature Pack 2 - Phase C research log

Started/access date: 2026-11-06. Task: FP2-C. GATE: OPEN (Phase C).
Audience: the founder and engineers preparing the master plan.
[Skill: sn-deep-research] [Skill: sn-research-report] [Skill: context7]

## Scope and evidence rules

CP-B was approved with "APPROVE to continue to Phase C". This log covers research only; no Feature Lab invention/shortlist, models, application changes, paid services, installs or servers. The previous audit workflow remains stopped. Existing-system context is in [the audit](01-existing-system-audit.md); its findings are not external research evidence.

Every query and source-open attempt is recorded with method, URL where applicable, access date, outcome and takeaway. Search results are leads, not proof the result page was read. Old research logs are historical and unverified until re-opened. One page supporting several claims still counts as one source. Prices/laws/licensing need current source dates and re-verification before launch; legal/tax conclusions require professional confirmation.

Labels: VERIFIED = source content actually opened and supports the stated claim; LEAD = discovered URL not yet opened; FAILED = tool/request failure; PARTIAL = incomplete extraction or coverage. Facts, Inferences and Opinions are kept separate. No fabricated review, statistic, price, law, quotation or API is allowed.

Native WebSearch failed twice. Direct public HTTP retrieval works, and free Bing RSS search returns relevant source domains, though its broad results require following official navigation rather than assuming exact-query precision. No paid search or downloaded search script is used. The stock research skill's WebUI/default output tree/install/render scripts are intentionally not run under the project restrictions.

The supplied prompt ends during Phase C topic 12. The received topics and explicit F9 evidence requirements below are actionable; unseen later instructions are not reconstructed. The missing tail is still needed before relying on it.

## Coverage index - in progress, not a completion claim

| Topic | Required research | Current verified coverage |
|---|---|---|
| C01 | Demand allocation, claim/wave locks, cold-start fairness, reputation and notification fatigue | [Marketplace note](research-marketplace-economy.md): binary/star-aware ranking and notification-template experiment; allocation/cold-start/frequency-welfare gaps explicit |
| C02 | Leagues, progression, motivation/demotivation, seasons and ethical anti-grind design | Vendor habit reports plus learning/badge evidence; current league criteria/direct SDT/framework-validation questions remain |
| C03 | Original Multiverse theming, tier/badge references, accessible SVG/procedural techniques | [Art/motion note](research-art-motion.md): accessible meaning, construction, badge study and rights boundaries; no visual reference inspection/name clearance |
| C04 | Virtual economies, faucets/sinks, inflation, double-entry/idempotency, minors/India considerations | Five ledger documents from one vendor; precision/retry/correction/atomicity, not issuance/sink/ethics parameters |
| C05 | Browser recording/capture/composition, recovery/upload, processing/streaming/captions and costs | [Media note](research-media-whiteboard.md): API/chunk/upload/billing seams; full support, recovery, processing/captioning and cost comparison gaps |
| C06 | Whiteboard libraries/licenses, collaboration/CRDTs, synced recording, import and accessibility | Basic Excalidraw/tldraw/Fabric/Konva/Yjs/Automerge roles/license boundaries; migration/performance/replay and full tldraw terms incomplete |
| C07 | Notes editors/licenses, math, timestamps, collaboration/PDF and grounded local-model drafts | [Notes/calls note](research-notes-calls.md): editor/advanced-module terms, math, local demo and summary-faithfulness evidence; full timestamp/mobile/grounding guarantees absent |
| C08 | One-to-one media providers, P2P/self-host/managed tradeoffs, TURN, reliability and current pricing | Published provider meters plus LiveKit/media-layer/Jitsi self-host context; no vendor selection or India-network benchmark |
| C09 | India payment aggregation/split flows, taxes, withholding, KYC, payouts, refunds and invoicing | [India/safety note](research-india-safety.md): selected RBI clauses and vendor splits/fees; tax/withholding/invoice/contract details unresolved |
| C10 | Child safety, mentor verification, consent, DPDP, reporting and evidence retention | Original Act/Rules and explanatory release read; actual commencement/amendment/application and live-tutoring safeguards incomplete |
| C11 | Motion performance, accessibility, reduced motion, ceremonies and budgets | W3C/Motion/rendering guidance and rights distinctions; no conformance, device/FPS or alternative-runtime completeness claim |
| C12 | F9 pain-point and learning-science evidence | [33 deduplicated problem codes](research-pain-points.md) plus [science note](research-learning-evidence.md); concentrated qualitative corpus, not prevalence; mechanism/population gaps retained |

Target: at least five quality sources per topic where possible, with disagreements and coverage gaps explicit. F9 evidence receives equal attention; anecdotes are not population statistics or causal proof. This phase does not select the 25-feature shortlist or create the 12 Feature Cards.

## Query and access ledger

All entries below were accessed/attempted on 2026-11-06. Parallel calls are listed in logical probe order, not claimed millisecond execution order.

| ID | Method / query | URL | Outcome | Takeaway |
|---|---|---|---|---|
| C-P001 | Native WebSearch: RBI payment aggregator directions 2026 official escrow settlement guidelines | No source response received | FAILED | Responses upstream stream ended before a terminal event; no search evidence obtained |
| C-P002 | Native WebFetch: WCAG motion criteria extraction | https://www.w3.org/TR/WCAG22/ | PARTIAL / ambiguous provenance | Tool supplied a large page-text extraction, but the summary denied live retrieval; its claims were not accepted until direct HTTP corroboration |
| C-P003 | Native WebSearch retry: RBI payment aggregator directions 2026; restricted to rbi.org.in | No source response received | FAILED | Same upstream error; native search retries stopped |
| C-P004 | Node built-in HTTP GET: WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | HTTP 200; extraction failed | 512,457 HTML bytes and correct title received; initial runtime regex did not locate sections; not a fetch failure |
| C-P005 | Free public Bing RSS: RBI payment aggregator directions 2026 escrow | https://www.bing.com/search?format=rss&q=RBI%20payment%20aggregator%20directions%202026%20escrow | HTTP 200; 8 leads | Mostly official RBI navigation pages, not the actual regulatory text; no substantive law verified |
| C-P006 | Node HTTP GET with exact id-anchor extraction | https://www.w3.org/TR/WCAG22/ | VERIFIED source passages | Recovered actual text and levels for 2.2.2, 2.3.1 and 2.3.3; see C11-S001 |
| C-P007 | Free public Bing RSS: tldraw license commercial | https://www.bing.com/search?format=rss&q=tldraw%20license%20commercial | HTTP 200; 10 leads | tldraw official product/docs/repository pages found; their license terms have not yet been opened |
| C-P008 | Bing RSS: ASER Centre 2024 digital access report 2026 | https://www.bing.com/search?format=rss&q=ASER%20Centre%202024%20digital%20access%20report%202026 | HTTP 200, irrelevant results | Returned unrelated Telegram URLs; discarded, zero research evidence |
| C-P009 | Bing RSS: OECD TALIS 2024 digital teaching barriers 2026 | https://www.bing.com/search?format=rss&q=OECD%20TALIS%202024%20digital%20teaching%20barriers%202026 | HTTP 200, broad leads | OECD homepage discovered; no actual TALIS findings retrieved |
| C-P010 | DuckDuckGo HTML: ASER Centre digital access report 2026 | https://html.duckduckgo.com/html/?q=ASER%20Centre%20digital%20access%20report%202026 | HTTP 200, relevant leads | 40 result anchors included duplicate links; displayed first 12 anchors, not 12 independent sources. Pratham/ASER source URLs require opening |
| C-P011 | Direct HTTP OECD homepage | https://www.oecd.org/ | BLOCKED: HTTP 403 | Just a moment challenge; no bypass or substantive claim |
| C-P012 | Intended Coursera/Miller DuckDuckGo batch | No HTTP request executed | FAILED LOCAL | Shell quote serialization failed before Node ran; corrected with String.fromCharCode |
| C-P013 | DuckDuckGo: Coursera App Store reviews 2026 | https://html.duckduckgo.com/html/?q=Coursera%20App%20Store%20reviews%202026 | HTTP 200; 10 unique leads | Actual Apple/Google listing URLs discovered; secondary review sites not adopted as facts |
| C-P014 | DuckDuckGo: Evan Miller How Not To Sort By Average Rating Wilson | https://html.duckduckgo.com/html/?q=Evan%20Miller%20How%20Not%20To%20Sort%20By%20Average%20Rating%20Wilson | HTTP 200; 10 unique leads | Original author article discovered; search snippets not evidence |
| C-P015 | Direct original-article GET | https://www.evanmiller.org/how-not-to-sort-by-average-rating.html | HTTP 200; OPENED | Article dated 2009-02-06 explicitly applies Wilson to positive/negative ratings, not a five-star scale |
| C-P016 | Coordinator cross-check of ME-S06 | https://docs.tigerbeetle.com/coding/reliable-transaction-submission/ | HTTP 200; OPENED | Persist/reuse operation identity on retries; same source, not new independent evidence |
| C-P017 | Coordinator cross-check of ME-S07 | https://docs.tigerbeetle.com/coding/recipes/correcting-transfers/ | HTTP 200; OPENED | Additive corrections preserve the event/error history |
| C-P018 | Coordinator cross-check of ME-S09 | https://blog.duolingo.com/friend-streak/ | HTTP 200; OPENED | Mutual invitations/up to five friends and reported 22% activity association corroborated; published 2024-08-05, modified 2026-03-17 |
| C-P019 | Coordinator cross-check of ME-S16 | https://blog.duolingo.com/how-duolingo-streak-builds-habit/ | HTTP 200; OPENED | Vendor +0.38% activity and +1.7% seven-day retention reports corroborated; not independent causal findings; published 2022-01-31, modified 2026-06-09 |
| C-P020 | Public Apple review feed; ID derived from discovered App Store URL | https://itunes.apple.com/us/rss/customerreviews/id=736535961/sortBy=mostRecent/json | HTTP 200; 50 entries | Read first eight 1-3-star entries for problem mining; deliberately negative convenience sample, not representative; no reviewer names retained |

### ME worker attempts, recovered through SendMessage

All dates: 2026-11-06. The missing StructuredOutput tool did not validate this return. Sources/limits are retained in [the partial marketplace note](research-marketplace-economy.md). Request counts: six discovery requests, 19 source HTTP requests, one local PDF failure before HTTP. Repeated URLs and redirects are not independent sources.

| ID | Method / query | URL | Outcome / takeaway |
|---|---|---|---|
| ME-L01 | Bing RSS: "Trip Radar" Uber 2026 OR "How Not To Sort By Average Rating" OR "Batching smartphone notifications can improve well-being" | https://www.bing.com/search?format=rss&q=%22Trip%20Radar%22%20Uber%202026%20OR%20%22How%20Not%20To%20Sort%20By%20Average%20Rating%22%20OR%20%22Batching%20smartphone%20notifications%20can%20improve%20well-being%22 | HTTP 200; field extraction failed |
| ME-L02 | Same exact discovery query, bounded raw extraction | https://www.bing.com/search?format=rss&q=%22Trip%20Radar%22%20Uber%202026%20OR%20%22How%20Not%20To%20Sort%20By%20Average%20Rating%22%20OR%20%22Batching%20smartphone%20notifications%20can%20improve%20well-being%22 | HTTP 200; irrelevant travel results rejected |
| ME-L03 | Bing RSS: evanmiller.org rating Bayesian Wilson | https://www.bing.com/search?format=rss&q=evanmiller.org%20rating%20Bayesian%20Wilson | HTTP 200; unrelated tax results rejected |
| ME-L04 | Bing RSS: Duolingo leagues leaderboard 2026 | https://www.bing.com/search?format=rss&q=Duolingo%20leagues%20leaderboard%202026 | HTTP 200; broad homepage/reference/store leads, no league rules |
| ME-L05 | Bing RSS: TigerBeetle documentation transfers idempotency 2026 | https://www.bing.com/search?format=rss&q=TigerBeetle%20documentation%20transfers%20idempotency%202026 | HTTP 200; unrelated results rejected |
| ME-L06 | Context7 library discovery: tigerbeetle / double-entry ledger idempotency transfers reversals | https://context7.com/api/v2/libs/search?libraryName=tigerbeetle&query=double-entry%20ledger%20idempotency%20transfers%20reversals | HTTP 200; real /websites/tigerbeetle ID |
| ME-L07 | Context7 retrieval for discovered ID | https://context7.com/api/v2/context?libraryId=%2Fwebsites%2Ftigerbeetle&query=double%20entry%20bookkeeping%20immutable%20transfers%20idempotency%20reversals%20pending%20void%20linked%20transfers&type=txt | HTTP 200; original-source discovery, not independent primary evidence |
| ME-L08 | Direct HTTP | https://www.duolingo.com/ | HTTP 200 shell; no substantive text |
| ME-L09 | Direct HTTP | https://docs.tigerbeetle.com/coding/two-phase-transfers/ | HTTP 200; primary source opened |
| ME-L10 | Direct HTTP reference discovery | https://en.wikipedia.org/wiki/Duolingo | HTTP 200; tertiary claims excluded |
| ME-L11 | Direct HTTP | https://play.google.com/store/apps/details?id=com.duolingo&hl=en | HTTP 200; three visible reviews screened out of ME scope |
| ME-L12 | Direct HTTP | https://docs.tigerbeetle.com/coding/reliable-transaction-submission/ | HTTP 200; source opened |
| ME-L13 | Direct HTTP | https://docs.tigerbeetle.com/coding/recipes/correcting-transfers/ | HTTP 200; source opened |
| ME-L14 | Direct HTTP | https://docs.tigerbeetle.com/coding/data-modeling/ | HTTP 200; source opened |
| ME-L15 | Direct HTTP | https://blog.duolingo.com/friend-streak/ | HTTP 200; product mechanism/vendor metric, not learning experiment |
| ME-L16 | Direct HTTP | https://blog.duolingo.com/how-weve-improved-the-duolingo-learning-experience-this-year-and-a-sneak-peek-toward-2020/ | HTTP 200; historic partial excerpt, screened out |
| ME-L17 | Direct HTTP reference discovery | https://en.wikipedia.org/wiki/Gamification_of_learning | HTTP 200; references incompletely extracted; tertiary effects not adopted |
| ME-L18 | Intended in-memory PDF extraction | https://research.duolingo.com/papers/yancey.kdd20.pdf?ref=blog.duolingo.com | Local syntax failure before HTTP; no evidence |
| ME-L19 | Direct HTTP PDF, memory only | https://research.duolingo.com/papers/yancey.kdd20.pdf?ref=blog.duolingo.com | HTTP 200, body unreadable; DOI identity only |
| ME-L20 | One reference re-extraction | https://en.wikipedia.org/wiki/Gamification_of_learning | HTTP 200; actual SDT/DOI links discovered; not an independent source |
| ME-L21 | DOI resolution | https://doi.org/10.1145/3394486.3403351 | HTTP 302 to ACM; identity only |
| ME-L22 | PubMed canonicalization | https://pubmed.ncbi.nlm.nih.gov/11392867 | HTTP 301; no abstract |
| ME-L23 | Direct HTTP publisher page | https://dl.acm.org/doi/10.1145/3394486.3403351 | HTTP 403 challenge; no bypass |
| ME-L24 | Direct HTTP | https://blog.duolingo.com/how-duolingo-streak-builds-habit/ | HTTP 200; product report, method limitations retained |
| ME-L25 | Direct HTTP canonical record | https://pubmed.ncbi.nlm.nih.gov/11392867/ | HTTP 203 cookie challenge; no abstract |
| ME-L26 | Direct HTTP index | https://research.duolingo.com/ | HTTP 200; bibliographic/data-description lead only, not paper findings |

### MW worker attempts and coordinator corroboration

All dates: 2026-11-06. The [media/whiteboard note](research-media-whiteboard.md) preserves claim locators, licensing/date limits and gaps. Six discovery queries; 19 top-level source opens plus at least one automatic locale redirect. The original worker did not certify the entire early redirect chain. No recording, upload, provider operation or app code was executed.

| ID | Method / query | URL | Outcome / takeaway |
|---|---|---|---|
| C-P021 | Coordinator direct HTTP: tldraw licensing | https://tldraw.dev/community/license | HTTP 200; development/production distinction, 100-day trial and hobby watermark corroborated; full terms still unknown |
| C-P022 | Coordinator direct HTTP: Stream pricing | https://developers.cloudflare.com/stream/pricing/ | HTTP 200; updated 2026-10-27; capacity/delivery/reservation/preload units corroborated, dollar symbol only; current WebRTC broadcasts not recordable per page |
| MW-Q01 | Bing: MDN getDisplayMedia MediaRecorder browser audio capture 2026 | https://www.bing.com/search?format=rss&q=MDN%20getDisplayMedia%20MediaRecorder%20browser%20audio%20capture%202026 | HTTP 200; unrelated results rejected |
| MW-Q02 | Bing: Excalidraw Fabric.js Konva official documentation license 2026 | https://www.bing.com/search?format=rss&q=Excalidraw%20Fabric.js%20Konva%20official%20documentation%20license%202026 | HTTP 200; Excalidraw-only useful leads |
| MW-Q03 | Bing: getDisplayMedia | https://www.bing.com/search?format=rss&q=getDisplayMedia | HTTP 200; unrelated results rejected |
| MW-Q04 | Bing: quoted Fabric/Konva/Yjs/Automerge domains | https://www.bing.com/search?format=rss&q=%22fabricjs.com%22%20OR%20%22konvajs.org%22%20OR%20%22docs.yjs.dev%22%20OR%20%22automerge.org%22 | HTTP 200; unrelated results rejected |
| MW-Q05 | Context7: MDN capture/storage/audio documentation | https://context7.com/api/v2/libs/search?libraryName=mdn&query=MediaRecorder%20getDisplayMedia%20getUserMedia%20canvas%20captureStream%20storage%20quotas%20Web%20Audio%20documentation | HTTP 200; actual MDN library identifiers |
| MW-Q06 | gh search repos "fabric.js OR konva OR yjs OR automerge OR cloudflare-docs" --sort stars --order desc --limit 15 --json fullName,url,description | https://api.github.com/search/repositories (endpoint; exact serialized query not printed) | CLI returned empty list; no source evidence or HTTP status printed |
| MW-L01 | Intended first source batch S02-S05 | No HTTP requests executed | Shell quote failure before execution; corrected once |
| MW-S01 | Direct HTTP | https://tldraw.dev/ | HTTP 200; official navigation lead |
| MW-S02 | Direct HTTP | https://tldraw.dev/community/license | HTTP 200; licensing documentation opened |
| MW-S03 | Direct HTTP | https://tldraw.dev/pricing | HTTP 200; annual/sales-led pricing, no numeric quote |
| MW-S04 | Direct HTTP | https://excalidraw.com/ | HTTP 200 shell; no interactive capability proof |
| MW-S05 | Context7 retrieval for actual MDN ID | https://context7.com/api/v2/context?libraryId=%2Fwebsites%2Fdeveloper_mozilla_en-us&query=MediaRecorder%20getDisplayMedia%20getUserMedia%20captureStream%20createMediaStreamDestination%20storage%20quotas&type=txt | HTTP 200; original-source discovery, not independent evidence |
| MW-S06 | Direct HTTP | https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia | HTTP 200; conditional audio/permission reference; JS compatibility table uninspected |
| MW-S07 | Direct HTTP | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder | HTTP 200; recorder API overview |
| MW-S08 | Direct HTTP | https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination | HTTP 200; audio output seam, not a tested mixing recipe |
| MW-S09 | gh api repos/excalidraw/excalidraw/readme | https://api.github.com/repos/excalidraw/excalidraw/readme | Successful body decode; HTTP status not printed; editor/hosted-service distinction |
| MW-S10 | Direct HTTP linked legal text | https://tldraw.dev/legal/tldraw-license | HTTP 404; full operative terms unavailable |
| MW-S11 | Direct HTTP | https://tldraw.dev/docs/sync | HTTP 200; room authority, persistence and migration boundaries |
| MW-S12 | Direct HTTP | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event | HTTP 200; delayed chunk/timing guidance |
| MW-S13 | Direct HTTP with automatic locale redirect | https://developer.chrome.com/docs/web-platform/screen-sharing-controls#systemAudio | Final https://developer.chrome.com/docs/web-platform/screen-sharing-controls?hl=fa returned 200; old translated guidance, not current browser matrix |
| MW-S14 | Direct HTTP | https://tldraw.dev/docs/collaboration | HTTP 200; public/ephemeral demo limitations |
| MW-S15 | Direct HTTP navigation | https://developers.cloudflare.com/r2/ | HTTP 200; no R2 price comparison established |
| MW-S16 | gh api contents/LICENSE?ref=master | https://api.github.com/repos/excalidraw/excalidraw/contents/LICENSE?ref=master | Full MIT text read; HTTP status not printed; copyright year not release/effective date |
| MW-S17 | Direct HTTP navigation | https://developers.cloudflare.com/stream/ | HTTP 200; actual pricing/upload links discovered |
| MW-S18 | Direct HTTP | https://developers.cloudflare.com/stream/pricing/ | HTTP 200; actual vendor units and constraints, not negotiated/India-performance evidence |
| MW-S19 | Direct HTTP | https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/ | HTTP 200; upload-size/resumability/metadata rules |
| MW-L06 | Return-tool lookup | No source URL | StructuredOutput unavailable; evidence delivered through SendMessage, not schema-validated |

### NC worker attempts and coordinator corroboration

All dates: 2026-11-06. The [notes/calls document](research-notes-calls.md) preserves precise license/meter boundaries. NC made two search requests and nine source opens, all source HTTP 200; one search command failed before HTTP. Its handoff was not schema-validated. The coordinator's four later opens are separate accesses, not additional independent sources for the same URLs.

| ID | Method / query | URL | Outcome / takeaway |
|---|---|---|---|
| NC-L01 | Intended editor search | No HTTP request executed | Local quoting failure, no source evidence |
| NC-L02 | DuckDuckGo: 2026 editor documentation license (site:tiptap.dev OR site:lexical.dev OR site:docs.slatejs.org OR site:blocknotejs.org OR site:prosemirror.net) | https://html.duckduckgo.com/html/?q=2026%20editor%20documentation%20license%20(site%3Atiptap.dev%20OR%20site%3Alexical.dev%20OR%20site%3Adocs.slatejs.org%20OR%20site%3Ablocknotejs.org%20OR%20site%3Aprosemirror.net) | HTTP 200; actual source links discovered |
| NC-L03 | Direct HTTP NC-S01 | https://tiptap.dev/feature-comparison | HTTP 200; core/platform boundary; dynamic price placeholders not invented |
| NC-L04 | Direct HTTP NC-S02 | https://lexical.dev/docs/intro | HTTP 200; architecture, Yjs and serialization; license not established in text |
| NC-L05 | Direct HTTP NC-S03 | https://docs.slatejs.org/ | HTTP 200; vendor MIT/beta statements; old relative update label not converted to a date |
| NC-L06 | Direct HTTP NC-S04 | https://www.blocknotejs.org/pricing | HTTP 200; core/XL license and commercial-plan FAQ |
| NC-L07 | DuckDuckGo: 2026 video call pricing (site:livekit.io OR site:daily.co OR site:100ms.live OR site:agora.io OR site:twilio.com) | https://html.duckduckgo.com/html/?q=2026%20video%20call%20pricing%20(site%3Alivekit.io%20OR%20site%3Adaily.co%20OR%20site%3A100ms.live%20OR%20site%3Aagora.io%20OR%20site%3Atwilio.com) | HTTP 200; actual provider pages discovered |
| NC-L08 | Direct HTTP NC-S05 | https://www.100ms.live/pricing | HTTP 200; participant/recording and other meters; flattened toggle limits retained |
| NC-L09 | Direct HTTP NC-S06 | https://www.daily.co/pricing/video-sdk/ | HTTP 200; graduated RTC, recording and activation/retention rules |
| NC-L10 | Direct HTTP NC-S07 | https://www.twilio.com/en-us/video/pricing | HTTP 200; expressly current as of October 2026; per-participant/room/composition/GB-day meters |
| NC-L11 | Direct HTTP NC-S08 | https://www.agora.io/en/pricing/video-calling/ | HTTP 200; RTC/proxy/recording rates; standard-minute weighting not opened |
| NC-L12 | Direct HTTP NC-S09 | https://kb.livekit.io/articles/3947254704-understanding-livekit-cloud-pricing | HTTP 200; meter definitions, no current numeric plan prices |
| NC-return | Return-tool lookup | No source URL | StructuredOutput unavailable; evidence preserved through SendMessage, no validation claim |
| C-P023 | Coordinator cross-check: BlockNote | https://www.blocknotejs.org/pricing | HTTP 200; selected XL GPL/commercial and displayed $195/$2,340/$390 plan passages corroborated; full terms still unread |
| C-P024 | Coordinator cross-check: Daily | https://www.daily.co/pricing/video-sdk/ | HTTP 200; participant versus recorded-minute rates and video-track billing distinction corroborated |
| C-P025 | Coordinator cross-check: Twilio | https://www.twilio.com/en-us/video/pricing | HTTP 200; October 2026 date, Group Rooms/TURN and recording/composition/storage units corroborated |
| C-P026 | Coordinator opens supplied ProseMirror navigation lead, upgraded to HTTPS | https://prosemirror.net/ | HTTP 200; schemas/plugins/collaboration and free commercial use stated; exact license text not opened |

## Discovered leads - not factual citations

| Lead | URL | Status / next use |
|---|---|---|
| RBI home | https://www.rbi.org.in/ | LEAD; follow to current official directions |
| RBI returned alternate home | https://www.rbi.org.in/Home.aspx/Home.aspx/scripts/home.aspx | LEAD; unusual returned path, not assumed valid |
| RBI public information | https://m.rbi.org.in/commonperson/English/Scripts/Home.aspx | LEAD |
| RBI reports index | https://m.rbi.org.in/Scripts/BS_ViewPublicationReport.aspx | LEAD |
| RBI press release index | https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx | LEAD; not a specific release |
| RBI notifications index | https://www.rbi.org.in/Scripts/NotificationUser.aspx | LEAD; locate actual text before citing law |
| RBI vacancies | https://opportunities.rbi.org.in/Scripts/Vacancies.aspx | Out of research scope; not evidence |
| RBI encyclopedia result | https://en.wikipedia.org/wiki/Reserve_Bank_of_India | Secondary background lead, not regulatory authority |
| tldraw product | https://www.tldraw.com/ | LEAD |
| tldraw Make Real | https://makereal.tldraw.com/ | LEAD; not a license source |
| tldraw repository | https://github.com/tldraw/tldraw | LEAD; GitHub access must use gh |
| tldraw offline | https://offline.tldraw.com/ | LEAD |
| tldraw SDK docs | https://tldraw.dev/ | LEAD; follow official licensing/docs links |
| tldraw organization | https://github.com/tldraw | LEAD; GitHub access must use gh |
| tldraw examples | https://preview.tldraw.com/ | LEAD |
| tldraw Computer | https://computer.tldraw.com/ | LEAD; not a license source |
| tldraw MCP article | https://tldraw.dev/blog/tldraw-mcp-app | LEAD; not needed for current planning scope |
| tldraw package | https://www.npmjs.com/package/tldraw | LEAD; license text and SDK terms still need primary verification |

The WebFetch summary also named https://www.w3.org/TR/2024/REC-WCAG22-20241212/ as a version URL. That exact version page/date was not independently opened in this probe; do not treat it as verified metadata yet.

## C11-S001 - WCAG 2.2 motion and flashing

Source: [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/), W3C. Accessed 2026-11-06 via direct HTTPS, status 200, correct HTML title. Exact anchors: [2.2.2](https://www.w3.org/TR/WCAG22/#pause-stop-hide), [2.3.1](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold), [2.3.3](https://www.w3.org/TR/WCAG22/#animation-from-interactions). Primary standard; counts as one source, not three. Publication/version metadata beyond the current page URL remains unverified in this probe.

### Facts

- 2.2.2 is Level A. Automatically started moving/blinking/scrolling information lasting more than five seconds alongside other content needs pause/stop/hide controls, unless essential. Automatically updating information alongside other content separately needs pause/stop/hide or frequency control, unless essential; do not incorrectly apply the five-second exception to every auto-update.
- 2.3.1 is Level A. It restricts flashes to no more than three in a one-second period, or requires remaining below the specified general/red-flash thresholds.
- 2.3.3 is Level AAA. Nonessential interaction-triggered motion must support being disabled. Short supporting excerpt: "Motion animation triggered by interaction can be disabled".

### Inferences for this product

- The user's blanket no-more-than-three-flashes rule is stricter than relying on WCAG 2.3.1's threshold exception. Research must not weaken that explicit constraint.
- A skippable ceremony and a reduced-motion alternative address different needs; neither alone demonstrates complete accessibility conformance.
- The standard does not certify the current app. Browser/assistive-technology and device acceptance are still owed from Phase B.

### Opinions / proposals, not final decisions

Retain the user's stricter motion constraints during comparison of CSS/Motion/3D approaches. No animation library, sound design, league name, badge direction or performance measurement is selected or claimed by this first source.

## Final reconciliation and additional coordinator attempts

Consolidated 2026-11-07. The five finalized worker records are preserved in [research-source-register.md](research-source-register.md) (88 source records, 94 attributed claims) and [research-attempts.md](research-attempts.md) (134 actual attempt entries). Those totals include navigation, duplicates, partial content and failures, not that many independent verified facts. Finalized ME/NC evidence contains later sources omitted from interim messages; earlier rows above are historical attempt snapshots, not an instruction to discard finalized evidence. MW and failed-CE recovery are separately retained in their topic notes.

The following coordinator requests ran before the interruption and are now logged. API/CLI success is stated as actually observed; a published copyright year, source URL or HTTP 200 challenge page is not operative licensing, law or substantive evidence by itself. Public PDF files are isolated reference attachments; no source code or script was executed. Dates after local midnight are recorded as session 2026-11-07 with original UTC timestamps where available.

| ID | Date / method or query | Requested URL / endpoint | Actual outcome / scope |
|---|---|---|---|
| C-P027 | 2026-11-06; gh license API | https://api.github.com/repos/fabricjs/fabric.js/license | Exit 0; complete MIT text, 1,243 characters; source URL returned by API; release not pinned |
| C-P028 | 2026-11-06; gh license API | https://api.github.com/repos/konvajs/konva/license | Exit 0; MIT text despite classifier NOASSERTION; complete 1,172 characters |
| C-P029 | 2026-11-06; gh license API | https://api.github.com/repos/yjs/yjs/license | Exit 0; MIT text despite classifier NOASSERTION; complete 1,211 characters |
| C-P030 | 2026-11-06; gh license API | https://api.github.com/repos/automerge/automerge/license | Exit 0; complete MIT text, 1,075 characters |
| C-P031 | 2026-11-06; gh license API | https://api.github.com/repos/facebook/lexical/license | Exit 0; returned meta/lexical license URL, complete MIT text, 1,088 characters |
| C-P032 | 2026-11-06; gh README API | https://api.github.com/repos/fabricjs/fabric.js/readme | Exit 0; feature/package excerpt, not full version/compatibility validation |
| C-P033 | 2026-11-06; gh README API | https://api.github.com/repos/konvajs/konva/readme | Exit 0; 2D scene-graph/library versus complete editor distinction |
| C-P034 | 2026-11-06; gh README API | https://api.github.com/repos/yjs/yjs/readme | Exit 0; introductory shared-type/network-agnostic/offline claims, not independent benchmarks |
| C-P035 | 2026-11-06; gh README API | https://api.github.com/repos/automerge/automerge/readme | Exit 0; CRDT/sync/local-first excerpt; performance marketing not adopted as a comparison |
| C-P036 | Session 2026-11-07; UTC 2026-11-06T18:42:28Z; direct PDF GET | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf | HTTP 200; 302,936 bytes, PDF header/hash recorded; new isolated reference directory |
| C-P037 | Session 2026-11-07; native PDF Read | Local PIB attachment, pages requested 1-3 | Failed: pdftoppm absent; no page/figure content claimed, no install |
| C-P038 | Session 2026-11-07; installed pdftotext file-input method | Local PIB attachment | Seven text pages extracted/read; references exposed original Act/Rules URLs |
| C-P039 | Session 2026-11-07; UTC 2026-11-06T18:50:30Z; direct PDF GET | https://research.duolingo.com/papers/yancey.kdd20.pdf?ref=blog.duolingo.com | HTTP 200; 460,463 bytes, PDF header/hash recorded; local reference only |
| C-P040 | Session 2026-11-07; installed pdftotext and file reads | Local notification paper | Nine-page paper text read; math/table rendering limits retained; no publisher challenge bypass |
| C-P041 | Session 2026-11-07; UTC 2026-11-06T18:54:42Z; direct PDF GET | https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf | HTTP 200; 2,492,944 bytes, header/hash recorded; actual URL from PIB references |
| C-P042 | Session 2026-11-07; installed pdftotext and bounded file reads | Local final DPDP Rules | English Gazette pages 24-41 read; commencement/child/schedule clauses distinguished; Hindi pages not independently translated |
| C-P043 | Session 2026-11-07; UTC 2026-11-06T19:01:02Z; direct PDF GET | https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf | HTTP 200; 182,082 bytes, header/hash recorded; original referenced Act |
| C-P044 | Session 2026-11-07; installed pdftotext and bounded file reads | Local DPDP Act | Twenty-one text pages read; enactment and notification-dependent commencement kept separate |
| C-P045 | Session 2026-11-07; UTC 2026-11-06T19:29:24Z; DuckDuckGo query: Uber Trip Radar matching 2026 site:uber.com | https://html.duckduckgo.com/html/?q=Uber%20Trip%20Radar%20matching%202026%20site%3Auber.com | HTTP 200; actual Uber blog/help leads; snippets not mechanics evidence |
| C-P046 | Session 2026-11-07; UTC 2026-11-06T19:29:25Z; query: Fiverr levels criteria 2026 site:help.fiverr.com | https://html.duckduckgo.com/html/?q=Fiverr%20levels%20criteria%202026%20site%3Ahelp.fiverr.com | HTTP 200; official level/success-score leads |
| C-P047 | Session 2026-11-07; query: Organizing instruction study improve student learning worked examples site:ies.ed.gov | https://html.duckduckgo.com/html/?q=Organizing%20instruction%20study%20improve%20student%20learning%20worked%20examples%20site%3Aies.ed.gov | HTTP 202 CAPTCHA; no result/evidence and no bypass |
| C-P048 | Session 2026-11-07; query: in-game virtual currencies principles 2025 site:commission.europa.eu | https://html.duckduckgo.com/html/?q=in-game%20virtual%20currencies%20principles%202025%20site%3Acommission.europa.eu | HTTP 202 CAPTCHA; no source/evidence |
| C-P049 | Session 2026-11-07; query: online tutoring safeguarding children site:learning.nspcc.org.uk | https://html.duckduckgo.com/html/?q=online%20tutoring%20safeguarding%20children%20site%3Alearning.nspcc.org.uk | HTTP 202 CAPTCHA; no source/evidence |
| C-P050 | Session 2026-11-07; query: Income Tax Act 2025 e-commerce operator TDS 2026 site:incometaxindia.gov.in | https://html.duckduckgo.com/html/?q=Income%20Tax%20Act%202025%20e-commerce%20operator%20TDS%202026%20site%3Aincometaxindia.gov.in | HTTP 202 CAPTCHA; remaining search requests stopped, no bypass |
| C-P051 | Session 2026-11-07; UTC 2026-11-06T19:44:23Z; direct source GET | https://www.uber.com/us/en/blog/trip-radar/ | HTTP 406 Not Acceptable; no allocation mechanics read |
| C-P052 | Same batch; direct source GET | https://help.fiverr.com/hc/en-us/articles/360010560118-Understanding-Fiverr-s-freelancer-levels | HTTP 403 challenge; no level criteria read |
| C-P053 | Same batch; direct source GET | https://help.fiverr.com/hc/en-us/articles/21965360854673-Success-score | HTTP 403 challenge; no algorithm criteria read |
| C-P054 | Session 2026-11-07; source reread/navigation | https://www.evanmiller.org/how-not-to-sort-by-average-rating.html | HTTP 200; actual binary-Bayesian and star-rating article links discovered; same source, not independent replication |
| C-P055 | Session 2026-11-07; UTC 2026-11-06T19:46:47Z; direct article GET | https://www.evanmiller.org/bayesian-average-ratings.html | HTTP 200; setup/update/loss-function excerpt; dated 2012-11-06, binary example not universal tuning |
| C-P056 | Same batch; direct article GET | https://www.evanmiller.org/ranking-items-with-star-ratings.html | HTTP 200; star-histogram/Dirichlet approximation setup/derivation excerpt; dated 2014-09-16 |
| C-P057 | Same batch; direct source GET | https://help.uber.com/driving-and-delivering/article/trip-radar?nodeId=010666f0-5925-4bc6-957f-3244039b1e6a | HTTP 404; no claim from the search title |
| C-P058 | Session 2026-11-07; UTC 2026-11-06T19:46:50Z; creator-source corroboration | https://community.udemy.com/en/discussion/96284/i-honestly-regret-making-my-first-course | HTTP 200; opening excerpt corroborated, not entire thread or earnings verification |
| C-P059 | Same batch; creator-source corroboration | https://community.udemy.com/en/discussion/149352/zero-sales-in-one-month-tales-of-a-struggling-instructor | HTTP 200; opening report/help request corroborated; publication date unknown |
| C-P060 | Same batch; official announcement GET | https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014 | HTTP 200 with reg=48/lang=2 final URL; posted 2025-11-14; phased compliance explanation, not replacement for operative law |

Recovered CE attempts and their limits are fully recorded in [research-creator-evidence.md](research-creator-evidence.md): four completed search requests, two source opens and one unique local pre-HTTP error. Its final transport failure interrupted collection; no nonexistent completed report is claimed. MW's message evidence is preserved in [research-media-whiteboard.md](research-media-whiteboard.md), including its actual attempts and uninstrumented early redirect limit. No completed source work was replayed to repair formatting.

## Reconciled coverage and decision boundary

- Seven topic notes now cover all received research areas with supported facts, inferences and explicit unanswered questions. The numeric/source quotas are not treated as proof of complete topic coverage.
- [research-pain-points.md](research-pain-points.md) has 33 distinct coded experience observations from 37 raw observations with four explicit merges. These are real source reports, not 33 independent people or verified current defects; the six-page, three-product corpus is concentrated and includes old/undated material.
- C01 has binary/star-aware ranking and a detailed notification-template experiment, but allocation efficiency/cold-start/fatigue questions remain. C02 still lacks direct source support for some frameworks/current league criteria. C04 has accounting mechanics, not inflation/ethics parameters.
- C05/C06 have API/license/persistence evidence, but not a tested full support/performance/recovery/replay comparison. C07/C08 now include finalized self-hosting/price/license additions, but no approved vendor/contract or India reliability claim.
- C09/C10 have selected RBI clauses and actual DPDP text, not a completed tax, commencement/amendment or live-tutoring safeguarding assessment. C03/C11 have construction/accessibility/rights guidance, not actual visual clearance or device benchmarks.
- Learning evidence includes peer-reviewed and abstract/secondary material with methodological boundaries; worked examples, mastery, direct metacognition and population-specific validation remain gaps.

The original prompt tail remains missing. No C2 invention, score weights, Feature Cards, spreadsheet or new money/branding/safety/scope choice has been finalized. CP-C must expose these limitations and ask whether to proceed to Feature Lab or revise/hold research; source availability and budgets are not hidden approvals.

## Current continuation

Consolidation is complete enough for an explicit coverage review, not a claim that every research question is answered. Next: fresh document/link/registry/preservation checks, write the CP-C research checkpoint with gaps and choices, set the waiting gate and end the turn. No new broad research workflow or CAPTCHA/paid-service bypass.

## Phase F course-class and subject-routing annex - 2026-11-08

The Phase C continuation above is historical. The founder's separate explicit Phase F request authorizes research then a proposed plan before the parent FQ04 ratio answer; it does not reopen C/E, approve a business policy or permit implementation.

- [F source/access/query/claim/gap ledger](research-course-tiers-subject-routing.md) preserves the actual four research returns and access limits. [Proposed decision/engineering annex](course-tiers-subject-routing-proposal.md) covers commercial classes/entitlements, selected-course-only Mentor allocation, classification/appeal guards, shared subjects/Flare and league separation. Both are PROPOSED, not final E changes.
- wf_3efd5079-369 returned seven original structured outputs: four research reports, two drafts, one bounded independent reviewer with no surviving findings.57 distinct source-record IDs/88 classified claims include local/planned, blocked, partial, unverified and synthetic material; they are not57 independent current-policy confirmations or additions to the historical C totals.
- Published access/payout mechanisms were opened for selected Udemy/Coursera pages and representation guidance for W3C SKOS. Udemy's displayed versus dated scheduled rate conflict, formal course-quality/appeal effectiveness, Skillshare allocation, Coursera partner payout, UNESCO/complete curriculum coverage, real class costs/units/staffing/prices and legal/runtime/provider behavior remain unresolved. Vendor policy is not outcome proof; native search summaries and irrelevant RSS results were not accepted as fresh evidence.
- Main checked source-ID references, independent six initial paise vectors/all80000 monotone original-row prefix steps/five supplied basis-refund fixtures, and an additional B14/R1 guard against retained-pool re-apportionment. These are synthetic/document checks only, not approved money incidence/funding or app acceptance. Actual file/anchor/preservation validation remains part of the F control record.
- Fixed subscription20% platform/remaining80% ONLY that learner's eligible enrolled-course Mentors and separate optional-session15% remain intact. Three classes, T1 highest-cost, cheapest-plan one T2+one T3, unit values/caps/periods, taxonomy releases, reviewers/appeals and optional class-view policies require founder/qualified review. Parent weighting PAUSED/UNANSWERED; CP-F unposted/unapproved, no final E/model/app/provider/DB/server/package/credential/commit actions.
