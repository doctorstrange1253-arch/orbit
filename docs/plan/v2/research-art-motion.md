# Research - original badges, artwork rights and product motion

Consolidated 2026-11-07. Source access: 2026-11-06 unless otherwise stated. Phase C topics C03/C11. Status: PARTIAL question coverage.
[Skill: sn-deep-research] [Skill: sn-research-report]

## Evidence boundary

AM's finalized report contains 18 source records and 28 attempt entries, preserved in [the source register](research-source-register.md) and [attempt log](research-attempts.md). Source indexes, marketing homepages, redirects and one asset listing are not independent proof of capabilities or visual quality. No reference artwork was visually inspected, copied, generated or cleared for use. No name, emblem, library, sound design or final motion policy is selected here.

The existing CSS/Motion/Three stack and art/token documents are premises from [Phase B](01-existing-system-audit.md), not a new application audit. No browser, assistive-technology, device or GPU benchmark was run.

## C03 - Meaning, hierarchy and layered construction

| Evidence | What it supports | What it does not support |
|---|---|---|
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/), AM-S04 / C11-S001 | Informative non-text content needs an equivalent alternative; color cannot be the only carrier of meaning; meaningful graphical/component information has contrast requirements with exceptions | Every decorative layer needing identical contrast, or current app conformance |
| [SVG use](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use), AM-S10 | Reusable referenced geometry; viewBox and inheritance/cross-origin constraints | A particular badge silhouette, accessibility tree behavior in every browser or rights to referenced artwork |
| [SVG g](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g), AM-S11 | Grouped transforms and inherited presentation properties; geometry properties do not simply inherit | Educational effectiveness of elaborate layers or a production performance budget |
| [Motion animation](https://motion.dev/docs/react-animation), AM-S01 | HTML/SVG components, keyframes, transforms and coordinated variants | Installed-version compatibility, visual originality or compositor eligibility for every property |
| [Badge study](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1429452/full), AM-S13 | Reported intrinsic-motivation benefits in one 95-student university grammar setting | Marketplace-wide effects, optimal tier/rarity counts, long-term learning or proof that elaborate art improves outcomes |

The SVG references were accessed 2026-11-06; the worker recorded last-modified dates 2026-08-14 and 2026-06-16 respectively. Such metadata is not a pinned runtime version.

### Badge-study interpretation

AM-S13 was published 2024-11-13. Selected full-text sections describe 95 university students studying classical Japanese grammar. Section 4.1 reports a reward-type effect on overall intrinsic motivation with p=0.003 and no significant evaluation-type effect with p=0.287. The worker did not extract allocation, duration, attrition or long-term transfer details. Nonsignificance does not establish equivalence, and the result is not evidence that more rarity tiers or visual complexity will improve learning.

**Inference:** Clear textual identity and distinguishable geometry can communicate hierarchy without relying only on color. Layered construction is technically possible, but aesthetic quality, cultural interpretation, protected-symbol similarity and accessibility still require later design review. No original naming direction or badge catalog is invented in C.

## C11 - Accessibility and rendering cost

### Documented controls

| Source / locator | Documented behavior | Integration limitation |
|---|---|---|
| [Motion accessibility](https://motion.dev/docs/react-accessibility), AM-S07, Automatic | reducedMotion=user suppresses transform/layout animations while preserving other animated values, including opacity and background color | Does not stop unrelated CSS, Three or another animation engine |
| AM-S07, Manual | useReducedMotion can drive alternatives such as opacity, disabled autoplay and no parallax | A hook alone does not establish complete application coverage |
| AM-S01, Animating CSS variables | Animating CSS-variable values can cause paint | Independent transforms or a library label do not certify low rendering cost |
| [Rendering-path article](https://motion.dev/magazine/web-animation-performance-tier-list), AM-S15 | Explains layout, paint, compositing and main-thread/compositor differences | Written by a Motion author; comparisons are interested-party evidence, not independent benchmarks |
| [Google rendering guidance](https://web.dev/articles/reduce-the-scope-and-complexity-of-style-calculations), AM-S18 | Style recalculation/invalidation can contribute to interaction latency; recommends measurement | Chromium-oriented guidance, not a measured app or phone result |

AM-S15 is dated 2025-11-05. Other undated documentation remains an access-date observation. No library-wide performance winner follows from these sources.

### Standard versus the user's explicit rules

WCAG 2.2.2 Level A concerns qualifying automatic motion lasting over five seconds alongside other content, and separately automatic updates. WCAG 1.4.2 concerns automatically playing audio exceeding three seconds. WCAG 2.3.1 Level A permits either no more than three flashes in a second or remaining below its defined flash thresholds; 2.3.3 Level AAA addresses disabling nonessential interaction-triggered motion.

The user's constraints are independent and stricter in places: every ceremony skippable, sound off by default, no more than three flashes per second, reduced-motion alternatives, a 60 fps target and degraded low-end mode. Research does not weaken these to the minimum conditional standard. A skippable reveal, a reduced-motion alternative, sound preferences and an accessible state announcement solve different needs.

**Inference:** Per-screen cost depends on properties, invalidation scope, layers, assets and concurrent work, not simply CSS versus JavaScript. A Motion setting will not automatically govern a Three scene. A future single primary system needs explicit shared control and budget boundaries; no new competing engine is chosen here.

## Runtime, editor and asset rights are different

| Option / source | Opened licensing or commercial evidence | Missing before a final choice |
|---|---|---|
| Existing SVG/CSS | Browser mechanics require no new vendor account in this research | Artwork rights, implementation suitability and runtime measurement are separate |
| Motion, AM-S01/07 | Substantive animation/accessibility documentation | Exact runtime/tool licenses and editor entitlements were not opened in AM |
| [GSAP pricing](https://gsap.com/pricing/), AM-S08; [Standard License](https://gsap.com/community/standard-license/), AM-S17 | Pricing says free; dated custom license and FAQ permit defined commercial uses without charge | Custom restrictions, including defined competing visual-animation-building uses, remain relevant; not MIT or blanket clearance |
| [Rive service terms](https://rive.app/docs/legal/terms-of-service), AM-S12 | Captured section C.1 distinguishes individual accounts from subscribed Teams | Exact prices, runtime license, exports and later IP/content terms not fully read |
| [LottieFiles docs index](https://docs.lottiefiles.com/en), AM-S05 | Navigation located | Generic index licensing banners do not establish a particular player/editor/asset version's terms |
| [Theatre docs index](https://www.theatrejs.com/docs/latest), AM-S09 | Guide navigation located; last edited label 2024-02-01 | Core/Studio/integration licenses, export/runtime and reduced-motion behavior not opened |
| [CC BY 4.0 deed](https://creativecommons.org/licenses/by/4.0/), AM-S14 | Describes commercial sharing/adaptation with attribution, license link and modification notices | The deed is not the legal code and does not clear privacy/publicity/moral or third-party rights |

AM-S17's numbered license is effective 2025-04-30, modified 2025-05-30. The raw extraction also contained older membership wording; the worker preserved that ambiguity and used the dated numbered sections/current FAQ rather than assuming all raw text described the same offer. Incorporated Webflow terms were not opened.

AM inspected metadata for a particular Rive community listing marked CC BY with a CC BY 4.0 link. Neither the preview nor the uploader's rights were verified. It is not proposed artwork; an asset license cannot determine the Rive runtime/editor license or justify copying a fictional universe.

## Evidence-backed tensions

- Positive badge-motivation results in one setting coexist with a null category comparison; the study does not validate every art distinction.
- Reduced motion may intentionally retain some transitions. That does not justify ignoring the project's stronger motion controls.
- Free commercial pricing is not synonymous with a permissive open-source license.
- Renderer guidance supports measuring work, not declaring 60 fps without a device test.
- A technically reconstructed SVG can still copy protected expression; grouped geometry does not confer rights or originality.

## Provisional recommendation and open questions

**Opinion, not final selection:** favor extending existing tokens, bespoke art and motion control rather than purchasing or adding another system solely for ceremonies. Before final selection, resolve the actual production library/license boundary, authoring workflow, accessibility controls and measurable motion budget. The founder must approve visible names/art direction and any scope or procurement change.

Missing evidence: actual visual-reference inspection, original naming/collision checks, contrasting badge/league research, complete runtime/editor terms for the alternative systems and independent device comparisons. No rarity distribution, art workload estimate, assets, animation matrix or Feature Card is finalized in this phase.
