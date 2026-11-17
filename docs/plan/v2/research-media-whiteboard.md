# Research - recording, media and shared whiteboard

Access date: 2026-11-06. Phase C topics C05/C06. Status: PARTIAL.
[Skill: sn-deep-research] [Skill: context7] [Skill: sn-search-code]

## Boundary and coverage

MW returned evidence through SendMessage after StructuredOutput was unavailable; no schema validation is claimed. Its six discovery requests and at least 20 source HTTP requests reached the configured pass boundary. One automatic locale redirect was not fully instrumented, so an exact transport-level total beyond the observed redirect is unknown. No app code, uploads, installs, browser setup, paid API or library migration was executed.

The coordinator directly re-opened tldraw licensing guidance and Cloudflare Stream pricing. The remaining substantive source reads below are attributed to the worker. Current app recorder/Board details are supplied context from [Phase B](01-existing-system-audit.md), not re-audited here. No provider, library, procurement, safety policy or new feature is selected.

| Topic | Established evidence | Important gaps |
|---|---|---|
| C05 recording/media | Browser capture/recording/chunk caveats; processed-audio output; one vendor's upload and storage/delivery billing | Full browser/OS matrix, local durable buffering/quotas/eviction, compositing/retakes, processing/captions, multi-provider cost comparison |
| C06 whiteboard/collaboration | Excalidraw/tldraw boundaries plus coordinator-checked Fabric/Konva/Yjs/Automerge license texts and README roles | Full feature/performance matrix, complete tldraw legal terms, actual custom-Board migration and synchronized replay evidence |

## Sources and access status

All sources were accessed on 2026-11-06. Unknown publication dates are not replaced by access dates; last-modified labels are not release/version guarantees.

| ID | Source | Status/date metadata | Evidence boundary |
|---|---|---|---|
| MW-S01 | [tldraw home](https://tldraw.dev/) | HTTP 200; undated; LEAD | Navigation only |
| MW-S02 | [tldraw license guidance](https://tldraw.dev/community/license) | HTTP 200; undated; OPENED and coordinator corroborated | Documentation of licensing model; linked underlying terms unavailable |
| MW-S03 | [tldraw pricing](https://tldraw.dev/pricing) | HTTP 200; undated; OPENED | Sales-led annual commercial pricing; no numeric quote established |
| MW-S04 | [Excalidraw application](https://excalidraw.com/) | HTTP 200 shell; PARTIAL | No browser/interactive feature test |
| MW-S05 | [Context7 MDN retrieval](https://context7.com/api/v2/context?libraryId=%2Fwebsites%2Fdeveloper_mozilla_en-us&query=MediaRecorder%20getDisplayMedia%20getUserMedia%20captureStream%20createMediaStreamDestination%20storage%20quotas&type=txt) | HTTP 200; LEAD | Original MDN pages were subsequently opened; not independent primary evidence |
| MW-S06 | [getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) | HTTP 200; modified 2026-09-07 per worker; OPENED | MDN reference; interactive compatibility table not inspected |
| MW-S07 | [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) | HTTP 200; modified 2026-10-07 per worker; OPENED | API overview, not universal codec or recovery guarantee |
| MW-S08 | [createMediaStreamDestination](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination) | HTTP 200; modified 2025-06-03 per worker; OPENED | Audio destination seam; example-specific browser wording not generalized |
| MW-S09 | [Excalidraw repository README](https://github.com/excalidraw/excalidraw) | Opened through gh API readme endpoint; date/version unknown | Distinguishes editor package from hosted application services |
| MW-S10 | [Linked tldraw legal page](https://tldraw.dev/legal/tldraw-license) | HTTP 404; UNAVAILABLE | No operative-contract conclusion from this page |
| MW-S11 | [tldraw sync](https://tldraw.dev/docs/sync) | HTTP 200; undated; OPENED | Vendor architecture/migration/persistence guidance, not benchmarks |
| MW-S12 | [MediaRecorder dataavailable](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event) | HTTP 200; modified 2026-10-26 per worker; OPENED | Documented timing/failure conditions, not incidence rates |
| MW-S13 | [Chrome screen-sharing controls](https://developer.chrome.com/docs/web-platform/screen-sharing-controls#systemAudio) | Redirected to [Persian locale](https://developer.chrome.com/docs/web-platform/screen-sharing-controls?hl=fa); HTTP 200; dateModified 2022-09-29 | Older translated guidance; not used to claim a 2026 browser matrix |
| MW-S14 | [tldraw collaboration](https://tldraw.dev/docs/collaboration) | HTTP 200; undated; OPENED | Demo privacy/lifetime differs from production integration |
| MW-S15 | [Cloudflare R2 overview](https://developers.cloudflare.com/r2/) | HTTP 200; modified 2026-10-01 per worker; LEAD | Navigation, not a verified R2 price comparison |
| MW-S16 | [Excalidraw MIT license](https://github.com/excalidraw/excalidraw/blob/master/LICENSE) | Opened through gh contents API at master; copyright 2020; release/commit not pinned | Full license text read by worker; dependencies/assets not separately reviewed |
| MW-S17 | [Cloudflare Stream overview](https://developers.cloudflare.com/stream/) | HTTP 200; modified 2026-04-21 per worker; LEAD | Navigation only |
| MW-S18 | [Stream pricing](https://developers.cloudflare.com/stream/pricing/) | HTTP 200; updated 2026-10-27; OPENED and coordinator corroborated | Published billing inputs, not negotiated contract/India performance |
| MW-S19 | [Direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/) | HTTP 200; modified 2026-10-12 per worker; OPENED | Provider-specific upload protocol usage, not proof of local crash recovery |
| C06-S001 | [Fabric.js license](https://github.com/fabricjs/fabric.js/blob/master/LICENSE) | Coordinator gh API exit 0; complete 1,243-character text | MIT; blob 94cbfebf065dd7cc97a358ca3583e9828ef89415 |
| C06-S002 | [Konva license](https://github.com/konvajs/konva/blob/master/LICENSE) | Coordinator gh API exit 0; complete 1,172-character text | MIT text despite classifier NOASSERTION; blob a25747cf170708ecbe162fcd4f50396993155d59 |
| C06-S003 | [Yjs license](https://github.com/yjs/yjs/blob/main/LICENSE) | Coordinator gh API exit 0; complete 1,211-character text | MIT text despite classifier NOASSERTION; blob f55e8b4846a2796967970bc4ad02d3e6abda3bac |
| C06-S004 | [Automerge license](https://github.com/automerge/automerge/blob/main/LICENSE) | Coordinator gh API exit 0; complete 1,075-character text | MIT; blob 18812465f040a79603e588aec3153f1d68cdeac6 |
| C06-S005 | [Fabric.js README](https://github.com/fabricjs/fabric.js/blob/master/README.md) | Coordinator gh API exit 0; targeted excerpt, not entire document | Features and package boundaries; blob e100151f6b724702984994d1796551bc901e3d7b |
| C06-S006 | [Konva README](https://github.com/konvajs/konva/blob/master/README.md) | Coordinator gh API exit 0; introductory excerpt | Core versus commercial editor distinction; blob 9b033a576aa5b262a11665b78ad5072ff5ab488a |
| C06-S007 | [Yjs README](https://github.com/yjs/yjs/blob/main/README.md) | Coordinator gh API exit 0; introductory excerpt | Documented capabilities, not independent benchmarks; blob deeda5721d37dd36ab5b1402c6ad68ba1ebce12d |
| C06-S008 | [Automerge README](https://github.com/automerge/automerge/blob/main/README.md) | Coordinator gh API exit 0; introductory excerpt | Sync/local-first and language boundary; blob afffbf5a5854d5e34269c272ff3ef015b19b71fe |

The coordinator additions were accessed 2026-11-06. Blob hashes identify returned file contents, not release commits. Exact release versions and transitive/asset notices remain unverified. MIT permits commercial use with the notice condition; optional sponsorship/support requests in READMEs are not extra conditions inferred into the opened license. README package migrations and performance claims require release/benchmark checks before implementation.

## C05 - Facts

- **Capture permissions/audio:** MW-S06 describes a secure context, user activation and fresh permission for each display capture. Video is required; audio is optional and depends on browser, OS and selected surface. Requesting system audio does not guarantee an audio track. Locators: Syntax, Return value, Security. The dedicated getUserMedia compatibility page was not opened.
- **Recording primitives:** MW-S07 documents pause/resume/stop/requestData and MIME support probing. Output is MediaStream-derived Blobs and actual bitrates may differ from requests. It does not establish destructive retakes, frame-accurate editing, muxing or durable recovery.
- **Chunk timing:** MW-S12 warns that task delays, Safari capture pausing and Android screen locking can delay delivery and enlarge chunks. Chunk count is not a reliable elapsed-time clock; a separate timer is needed. These are documented cases, not quantified cross-version failure rates.
- **Processed audio:** MW-S08 exposes an associated MediaStream from an audio destination and a recorder example. This supports an output seam, not a complete tested mic-plus-tab mixing recipe.
- **Upload:** MW-S19 limits basic direct POST to 200 MB; tus is required above that and recommended on unreliable connections even below it. The backend provisions an upload URL without exposing its token. Creation-time expiry/duration metadata and retained video IDs matter; later metadata is ignored. Full protocol/offline recovery is still unverified.

### Published Stream billing inputs

MW-S18 was directly corroborated on 2026-11-06. Dollar symbols are reproduced as displayed; no exchange rate, tax or negotiated term is assumed, and the extracted page did not explicitly establish an ISO currency code.

| Dimension | Published value / rule | Modeling caution |
|---|---|---|
| Stored capacity | Prepaid increments of $5/month per 1,000 minutes of capacity | Purchased capacity is not identical to utilized minutes; avoid treating a tiny library as continuously priced fractional capacity |
| Delivery | $1 per 1,000 delivered minutes | Preloading/buffering and multiple viewers consume delivery, not only human watch time |
| Upload reservations | Pending direct/tus uploads reserve maxDurationSeconds until completion or expiry | Incomplete uploads can temporarily consume capacity |
| Included Stream processing | Ingress and Stream encoding included; no extra Stream egress fee stated | Separate Media Transformations are separately priced; not every edit/composite is free |
| Uploaded playback rounding | Four-second segments for uploaded content | Billable duration differs from exact interaction timestamps |
| Browser cache | Cached playback not billable | Do not assume every mobile player caches segments |
| Current WebRTC limitation | Coordinator-read page states broadcasts cannot currently be recorded | This Stream statement is not a one-to-one conference/recording solution |

**Inference:** A stored-capacity/delivery model can be parameterized later, but a single dollars-per-minute headline is not a realistic end-to-end studio budget. No cost-per-hour spreadsheet or provider choice is created in C.

## C06 - License and integration comparison

| Option | Commercial/license evidence | Documented scope | Unverified boundary |
|---|---|---|---|
| Excalidraw | MIT text grants use/modification/distribution/sale with notice retention and warranty disclaimer | Editor drawing/image/undo/pan/zoom and PNG/SVG/scene-JSON export | Hosted collaboration/local-first/PWA/encryption features are not automatically a bundled durable backend; migration/dependency terms not checked |
| tldraw | Guidance says default development-only; production requires active trial/commercial/discretionary hobby license; trial 100 days; hobby watermark | Sync ecosystem, custom schemas/migrations, legacy snapshot import | Actual commercial price and full linked legal terms unknown; source availability is not permissive commercial licensing |
| Fabric.js | Coordinator read complete MIT text: commercial use/sale permitted with notices; no warranty | README excerpt: object transforms/grouping, shapes/controls/brushes, filters and JPG/PNG/JSON/SVG I/O; typed/modular | Renderer/editor framework, not an established hosted collaborative whiteboard; release/package pinning and specific stylus/PDF/replay behavior unverified |
| Konva | Coordinator read MIT text; GitHub classifier returned NOASSERTION, so classification alone was not trusted | README excerpt: 2D scene graph, shape events/drag/transforms/animation/cache/export; React integration | Full editor services, document auth/persistence and large-board performance require implementation/evidence; commercial Polotno is a separate product |
| Yjs | Coordinator read complete MIT text despite GitHub NOASSERTION metadata | README intro documents shared Map/Array types, network-agnostic collaboration, offline editing, snapshots, undo and cursors | No custom-Board adapter, authorization/durability proof or independent scaling benchmark established |
| Automerge | Coordinator read complete MIT text | README intro: CRDTs, compact format and sync protocol; Rust core exposed through JavaScript/WASM | No app migration/replay or comparative performance measured; vendor memory-improvement claim not adopted as a Yjs comparison |

MW-S11 documents one authoritative server room per document. Multiple instances can split collaboration or overwrite state. In-memory storage needs snapshot persistence to survive restart; SQLite is a documented alternative. Its Cloudflare template uses Durable Objects/SQLite plus R2 for assets, but does not itself provide application authorization, upload limits or long-term document history. These are vendor claims, not tested deployment behavior.

The same source describes coordinated client/server custom schemas and migrations. Its opt-in comments lane is separately persisted/permissioned and excluded from ordinary document snapshots. MW-S14 says demo rooms are publicly accessible and data is deleted after roughly a day. None of these examples is production authorization for the existing app.

## Inferences and opinions

**Inference:** A recorded video, a drawing snapshot and audio-synchronized stroke history are different artifacts. Neither MediaRecorder nor scene JSON alone establishes seekable timed replay. Timing/order, pause/edit mapping and checkpoints remain research gaps; no file-size or learning advantage is measured.

**Inference:** Existing recorder/Board reuse remains plausible, but neither editor establishes a drop-in conversion. Local recording durability, resumable network upload and server-side board persistence are separate failure boundaries.

**Opinion/proposal:** Keep the current app's one-shared-whiteboard constraint, but do not pick an external library until missing licenses, actual migration cost and persistence/access-control requirements are resolved. No new vendor/contract/safety choice is finalized.

## Complete discovery and access record

All dates are 2026-11-06. HTML opens used Node GET with a 20-second timeout and no script execution. GitHub used gh. Exact source URLs are in the register above and the central research ledger.

| Attempt | Query / request | Outcome |
|---|---|---|
| MW-Q01 | Bing: MDN getDisplayMedia MediaRecorder browser audio capture 2026 | HTTP 200; unrelated results rejected |
| MW-Q02 | Bing: Excalidraw Fabric.js Konva official documentation license 2026 | HTTP 200; Excalidraw-only useful leads |
| MW-Q03 | Bing: getDisplayMedia | HTTP 200; unrelated results rejected |
| MW-Q04 | Bing: "fabricjs.com" OR "konvajs.org" OR "docs.yjs.dev" OR "automerge.org" | HTTP 200; unrelated results rejected |
| MW-Q05 | Context7 libraryName=mdn; MediaRecorder getDisplayMedia getUserMedia canvas captureStream storage quotas Web Audio documentation | HTTP 200; actual MDN library ID |
| MW-Q06 | gh search repos "fabric.js OR konva OR yjs OR automerge OR cloudflare-docs" --sort stars --order desc --limit 15 --json fullName,url,description | CLI returned empty list; no source discovered; HTTP status not printed |
| MW-L01 | Initial intended batch for MW-S02 through MW-S05 | Local shell quote failure before any HTTP request; corrected once |
| MW-S01 through MW-S19 | Each register URL opened once through its stated method | Outcomes and date/language limitations retained above; Chrome locale redirect added at least one request |
| MW-L06 | StructuredOutput lookup | Tool unavailable; evidence delivered through SendMessage, not schema-validated |

Useful but unopened leads: [captions](https://developers.cloudflare.com/stream/edit-videos/adding-captions/), [resumable uploads](https://developers.cloudflare.com/stream/uploading-videos/resumable-uploads/), [own player](https://developers.cloudflare.com/stream/viewing-videos/using-own-player/), [large recording-chunk discussion](https://blog.addpipe.com/dealing-with-huge-mediarecorder-slices/). They are not yet factual citations.

## Remaining work and F9 boundary

No complete browser/OS, local storage quota/eviction, encoding ladder, captions, frame-accurate retake, multi-provider cost or audio-stroke replay assessment exists yet. Basic license and library-role gaps were filled by the coordinator; full capability/performance comparisons and unavailable tldraw legal terms remain unresolved. Multiple pages from one vendor do not independently establish safety or reliability in India.

Documentation describes operational problems such as absent audio, delayed chunks, upload limits, demo-room exposure and migration hazards. These are not independent learner/creator complaints and are not counted toward the required 30 real F9 pain points. No application changes, feature shortlist or later-phase design was performed.
