# Identity Worlds research: infinite and seamless backgrounds

**Phase:** B, IW-B. **Access date:** 2026-11-09. **Coverage:** 15 substantive sources, not a selected architecture or runtime proof.

[Central ledger](research-log.md). Data-only source captures are under .agent/scratch/iw-b-infinite-jzp1pe, one source per directory with body/metadata and extracted text where applicable. Main verified 18 capture byte/SHA256 records: 15 substantive sources, one license and two auxiliary Context7 endpoints. Thirteen selected short passages were independently matched to captured text; other documentation was read by the research reader. Context7 aggregation and license text are not extra quality-source votes. Nothing was installed or executed from these source captures.

## 1. Separate the meanings of infinite

A procedural backdrop can avoid obvious image repetition while lesson/course information remains finite and stable. A CSS animation repeating forever is not unbounded coordinate space, chunk streaming, reverse-travel continuity or a growing lesson graph. B3-07 explicitly defines repetition; B3-05/B3-14 describe procedural sampling mechanisms. Neither establishes an infinite Orbit world.

This distinction preserves existing lesson IDs, progress and routes. The desired appearance and the bounded working set can be analyzed together in C without inventing lessons or keeping every visited visual object alive. It is a research implication, not an adopted origin-rebasing, shader or pooling implementation.

## 2. Evidence-backed methods and limits

| Area | Source-supported mechanism | What it does not guarantee |
|---|---|---|
| Original procedural fields | B3-05 explains smooth interpolated noise; B3-14 describes 2D/3D sampling, fractal/domain-warp options | Independent chunk seeds do not automatically join; cross-browser/kernel equivalence, version continuity and reverse regeneration are untested |
| Spatial streaming | B3-11 describes an engine grid-cell loading/unloading system driven by streaming-source distance | This is not a Three.js/browser drop-in or an approved chunk/window/eviction contract |
| Pooling | B3-04 describes a fixed collection reused across allocation lifetimes, with size/exhaustion/reset tradeoffs | Oversized pools waste memory; stale state/references are not automatically cleared; native fragmentation discussion is not JavaScript GC proof |
| Instancing | B3-01 supports shared geometry/material with per-instance transforms and fewer draw calls | It does not remove vertex/fragment work, overdraw, textures, CPU picking, dense labels or accessibility obligations |
| Resource reuse/disposal | B3-02 distinguishes geometry/material/texture lifetimes; material disposal does not dispose textures | Removing a mesh, recycling a slot or calling one dispose method is not complete CPU/GPU teardown; shared assets need ownership rules |
| On-demand rendering | B3-06 documents demand frames, invalidation, reuse, instancing and LOD | Invalidation schedules rather than immediately renders; moving scenes still need scheduling. No measured battery/performance benefit is established here |
| CSS layers | B3-08/B3-09 explain transformed/compositor-friendly composition and layer cost | Many promoted full-screen layers or unbounded will-change are not free; older examples are not current mobile benchmarks |
| Large coordinates | B3-12 describes higher-precision and translated/camera-relative world-space methods | Engine-specific methods are not Three.js APIs; no browser precision/distance/rebase budget is adopted |
| Mobile memory | B3-03 notes the lack of a portable maximum-VRAM query and recommends estimating usage/constrained settings | Download size, JS heap, process memory, GPU memory and compositor allocations are not interchangeable |
| Context restoration | B3-10 simulates context loss/restore; B3-13 explains resource/state recreation | A restored event alone is not a fresh correct frame, resumed input or successful lesson travel |

### Continuity and ownership

Stable logical coordinates/configuration can be distinguished from nearby rendering coordinates. The later design would need to define shared boundary evaluation, reproducible configuration/versioning and what happens during reverse re-entry, including negative coordinates. Smoothness of a noise field is not a test of a complete streamed scene. No coordinate system or generation algorithm is fixed by this research.

Pooling and streaming need separate contracts: a pool governs slot reuse, while a streaming policy governs which region/data/resources are active or retained. Stale asynchronous completion must not repopulate an evicted or repurposed slot. This is a failure mode to specify/test later, not a new coordinator implementation.

Shared resources require a lifetime longer than any single chunk that borrows them. B3-02 also explains application responsibility for ImageBitmap CPU-resource closure where applicable, and that disposed-but-reused resources may be recreated. Unconditional per-chunk disposal and indefinite retention are both incomplete answers. No leak freedom is inferred from source API availability.

### CSS, Canvas/WebGL and mobile

Restrained CSS layers can suit decorative fallback presentation; WebGL can consolidate a larger composition and support procedural fields/3D depth. Those possibilities have different costs and lifecycle obligations. B3-08 is a historical comparison, not a ranking of present-day engines/devices. B3-09 warns that layers cost memory and management; B3-03 requires conservative resource estimation rather than assuming every GPU has a known budget.

Compressed GPU formats may reduce GPU memory/bandwidth, subject to support and quality. A small JPG/PNG download does not imply a small decoded GPU texture. Instancing lowers draw calls but cannot make hundreds of overlapping labels or expensive fragment effects disappear. The current A2 click/density issues are therefore not resolved by citing instancing.

## 3. Opened source register

All accesses2026-11-09. UNDATED means publication date was not established. Each body is verified from actual retrieval; GitHub content was read through gh, not executed. Living technical docs are not guaranteed to describe every deployed package/version.

| ID / capture directory | Source / date or version | Short verified passage or document fact |
|---|---|---|
| B3-01 / instancing | [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html), UNDATED | "The usage of 'InstancedMesh' will help you to reduce the number of draw calls" |
| B3-02 / disposal | [Three.js resource disposal](https://threejs.org/manual/pages/how-to-dispose-of-objects.html), UNDATED | "The disposal of a material has no effect on textures." |
| B3-03 / mdn-webgl | [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), publication UNDATED; modified2026-10-31 | "WebGL doesn't offer APIs to query the maximum amount of video memory on the system because such queries are not portable." |
| B3-04 / pool | [Robert Nystrom, Object Pool](https://gameprogrammingpatterns.com/object-pool.html), UNDATED chapter | "The pool may waste memory on unneeded objects" |
| B3-05 / noise | [The Book of Shaders, Noise](https://thebookofshaders.com/11/), UNDATED | "This smooth randomness is a game changer for graphical engineers or artists" |
| B3-06 / r3f-v9 | [R3F Scaling performance at v9.8.2](https://github.com/pmndrs/react-three-fiber/blob/v9.8.2/docs/advanced/scaling-performance.mdx), chapter date UNDATED; version-pinned content | "Calling invalidate multiple times will not render multiple times." |
| B3-07 / css-loop | [MDN animation-iteration-count](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-iteration-count), publication UNDATED; modified2026-07-21 | "The animation will repeat forever." |
| B3-08 / css-parallax | [web.dev, Parallaxin'](https://web.dev/articles/speed-parallax), metadata dateModified2011-12-20; historical technique comparison | "We’re effectively dealing with a single hardware accelerated bitmap." |
| B3-09 / css-layers | [web.dev, Compositor properties/layer count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count), metadata dateModified2015-03-20 | "layers require memory and management." |
| B3-10 / lose-context | [MDN WEBGL_lose_context](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context), publication UNDATED; modified2026-10-30 | "Simulates restoring the context." |
| B3-11 / world-partition | [Epic World Partition](https://dev.epicgames.com/documentation/en-us/unreal-engine/world-partition-in-unreal-engine), UNDATED; engine reference only | "provides you with an automatic streaming system to load and unload those cells based on distance from a streaming source." |
| B3-12 / large-world | [Epic Large World Coordinates rendering](https://dev.epicgames.com/documentation/en-us/unreal-engine/large-world-coordinates-rendering-in-unreal-engine-5), UNDATED; engine reference only | "Math with LWC takes longer to compute, thus is more expensive." |
| B3-13 / context-restored | [MDN webglcontextrestored](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextrestored_event), publication UNDATED; modified2026-10-26 | "You need to reinitialize the state of your WebGL application and recreate resources." |
| B3-14 / fastnoise-js-readme | [FastNoise Lite JavaScript README](https://github.com/Auburn/FastNoiseLite/blob/master/JavaScript/README.md), UNDATED | Documents 2D/3D sampling and coordinate-based noise options; no API/version/kernel equivalence adopted |
| B3-15 / fastnoise-readme | [FastNoise Lite README](https://github.com/Auburn/FastNoiseLite/blob/master/README.md), UNDATED | Its stated C++/Intel7820X/Win10 comparisons are not browser/mobile measurements |

[FastNoise Lite license](https://github.com/Auburn/FastNoiseLite/blob/master/LICENSE) was separately opened: MIT, copyright2020; retain notices if ever adopted. No package/source was incorporated. Two Context7 captures helped discover/cross-check Three.js docs but are not counted as independent additional sources.

## 4. Discovery and failure ledger

| Actual query/action,2026-11-09 | Outcome |
|---|---|
| gh search repos "three.js"; gh search issues "InstancedMesh memory dispose repo:mrdoob/three.js" | Repositories found; issue titles not used as factual evidence |
| Three.js InstancedMesh dispose cleanup resources manual official | Search discovery, actual Three.js docs checked |
| React Three Fiber scaling performance on demand rendering reuse instancing docs | Search discovery; version-pinned docs retrieved |
| MDN WebGL best practices VRAM budget mobile context lost restored | Search discovery; real MDN bodies checked |
| Book of Shaders noise tileless procedural smooth noise | Search discovery; authored noise chapter checked |
| Game Programming Patterns object pool memory fragmentation free object initialization | Search discovery; authored pool chapter checked |
| site:web.dev parallax scrolling CSS 3D performance | Search discovery; historical web.dev articles opened |
| site:developer.mozilla.org animation-iteration-count infinite webglcontextrestored resources recreated | Search discovery; relevant actual bodies opened |
| webglcontextrestored MDN previously created textures buffers need recreated | Search discovery; restored-resource reference checked |
| gh search repos "FastNoiseLite"; content APIs | README/JavaScript README/license retrieved as data, not executed |
| Context7 Three.js search/context endpoints | Both retrieved; auxiliary aggregation, not extra primary-source count |
| site:dev.epicgames.com world partition streaming cells memory | Search response denied live execution; summary excluded. Candidate URL subsequently retrieved as actual HTTP200/article |
| site:dev.epicgames.com large world coordinates rendering float precision | Same provenance limitation; actual subsequent article retrieval verified |

All 18 retained metadata/body records passed main byte/hash checks. The two native Glob lookups that missed scratch metadata did not prove absence; scoped filesystem checks found the actual records. No inaccessible search summary is counted as a technical source.

## 5. Future proof required: not run in B

- Deterministic boundary/regeneration tests, negative coordinates and reverse re-entry for fixed seed/configuration/version.
- First/middle/final/reverse travel at1/30/100/300levels with settled visible and semantic selection, not URL arrival alone.
- Bounds on live chunks, pool slots, pending work and caches during repeated travel; exhaustion, stale completion and reset cases.
- Separate JS/CPU, GPU/resource, compositor/layer, frame-time and draw-call observations; repeated mount/unmount/eviction/re-entry and teardown baselines.
- Shared-resource lifetime and final disposal; precision/jitter around large-coordinate and rebasing boundaries.
- Sustained physical-device and background/foreground operation, constrained-quality and reduced-motion fallback.
- Context-loss recovery followed by correct fresh rendering, pointer/keyboard input and travel.

No fixed pool/window/budget, shader art, origin-rebasing scheme, flat memory, seamless rendering, device performance, leak freedom or successful redesigned course journey is accepted by this research. C can evaluate designs; implementation remains gated by new CP-C.
