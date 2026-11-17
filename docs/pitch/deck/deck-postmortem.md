# Deck_v4 post-mortem
Date: 2026-11-16. Written for the founder and the revised deck builder.
Inspected all14pages rendered from docs/pitch/deck/v4/Deck_v4.pdf at200dpi. The PDF is image-backed; these observations concern its actual rendered slides, not untested editable-PPTX parity.
The old PPTX/PDF/data/research are preserved. The following concrete flaws must not recur in the new ten-slide READ deck.

| ID | Slide | Concrete flaw | Revision rule |
|---|---|---|---|
| PM01 | All | Main file contains14slides, including three Q&A backups, instead of the new exact10-slide architecture. | Keep backups separate; merge Solution/How it works. |
| PM02 | 1 | Product name is a small corner label while the long headline dominates; it does not establish Orbit as the cover focal point. | Orbit72pt; product screenshot/loop and audience have distinct grid modules. |
| PM03 | 1 | Cover headline wraps across three large lines and spends much of the slide on a generic statement. | Condensed hook, one audience line, modular cover poster. |
| PM04 | 1,5 | The same enrollment-planets screenshot repeats without explaining the missing request/mentor workflow. | Use four different safe screens and actual numbered callouts; do not imply end-to-end proof. |
| PM05 | 1 | Screenshot is letterboxed with pale bands and has no callouts; its tiny UI text is unreadable at placement. | Precise crop and standard frame,callouts/caption outside busy content. |
| PM06 | 2 | No hero evidence element; two prose blocks and a placeholder occupy the body with large unused gaps. | Strong sourced statistic or honestly labeled method hero;>=18%body focal area. |
| PM07 | 2 | Specific origin episode is still FILL, despite being the slide's central authenticity proof. | Use actual founder episode or replace with explicit known-origin/method panel. |
| PM08 | 3 | Customer insight consists mostly of oversized FILL labels and an unprovided quote. | Discovery ledger, hypotheses, validation method and visible zero-interview status. |
| PM09 | 3 | No sample size, population, date or source method is available in the customer findings area. | No invented discovery; secondary evidence includes those fields. |
| PM10 | 4 | Four-step flow ends at building the course and omits learner practice/rating, weakening the complete value loop. | Five-step Request/Threshold/Signal/Build/Learn+Rate flow with actor/status. |
| PM11 | 4 | Flow contains no screenshots, comparison matrix or distinct identity responsibilities. | Annotated thumbnails plus comparison and identity modules. |
| PM12 | 4,5 | Very wide headlines wrap to two lines and consume the top third of otherwise sparse slides. | Headline28pt,one line<=64characters; dense bodygrid. |
| PM13 | 5 | How-it-works screenshot shows enrollment planets, not the request or mentor-response step listed beside it. | Each thumbnail must match the annotated step; missing step staysPlanned. |
| PM14 | 5 | A FILL request/mentor-screen note wraps toward the footer rule, reducing separation. | Fixed module slots/character budgets; fail overflow rather than shrink. |
| PM15 | 6 | Progress proof is three broad source labels beside an idle recorder screen; no detailed status table or repository counts. |12-14feature rows,source-vs-runtime distinction,datedcounts andNotyet panel. |
| PM16 | 6 | Recorder image is mostly a black empty preview; it is not evidence of captured media or successful publication. | Caption idle/prototype honestly; prefer safe high-resolution source selection, never fake recording. |
| PM17 | 7 | Market has an unconfirmed GEU beachhead, missing officialcount and a100payer target without a complete bottom-up chain. | Explicit proposedICP,officialcountorunknown,threeESTIMATEscenarios/sensitivity. |
| PM18 | 7 | No current competitor price anchors or deliberately excluded segments are shown. | Priceobservationsdated/source-qualified;focus andNotyetsegments explicit. |
| PM19 | 8 | Unit economics is one scenario table; requested split diagram, waterfall, cost breakdown and break-evenchart are absent. | Separate modules and denominators; costs/assumptions visible. |
| PM20 | 8 | Rs237break-even depends on an80/20price mix hidden in a small line; reader can mistake it for Core-only. | Directlabelper-scenario break-even and mix,neverpromisefixedprofitdate. |
| PM21 | 8 | FixedmonthlyRs15000andvariablecosts are estimates but their source/usage breakdown is not on the main slide. | Cost-to-serve table,usage assumptions andsourcechips. |
| PM22 | 9 |90-day plan is three prose columns, not dated milestones across Product/Supply/Demand owners. | Gantt,10-12numericmilestones,8KPIs,channels,cost/owner andkillrules. |
| PM23 | 9 | Every plan owner remainsFILL; source code cannot prove actual team commitments. | Real people/hours or unassignedfunctionalroles; no fabricatedownership. |
| PM24 | 10 | Team slide is a generic responsibility table with no names,proof,hours or photos/monograms. | RealTeamCards if supplied; otherwisecapabilityverification/fill-gap panel. |
| PM25 | 11 | Ask defaults to the fullRs200000cap with coarse categories,not a justifiedinitialamount. | Bottom-up90daylaunchbudget andprioritytranches belowcap;realquoteorESTIMATE. |
| PM26 | 11 | Fund bars show amounts but no share,timing,deliverable or releasedmilestone. | Item/amount/share/month/milestone tablewithdirectbars. |
| PM27 | 11 | Right-hand runway explanation crosses the footer separator,visible on the rendered slide. | Bounds/overlap checker; lockedfooterzone. |
| PM28 | 12 | Backup repeats contribution numbers but adds little sensitivity or formula detail. | Separate<=4pageQ&Awithbasis/scenarios/methods/risks/funddetail. |
| PM29 | 13 | Methods backup is still a placeholder form rather than a report of actual evidence gathering. | Evidenceledgerwithretrievedsource,method/year/n/limits;primarydataexplicitlyabsent. |
| PM30 | 14 | Risk table has no namedowner,date,threshold or decisionaction; all ownersFILL. | RiskRule with quantified trigger/proposedfunction andunknownstatus. |
| PM31 | All | Serifoversizedheadlines and openeditorialcolumns look like a genericreport,not the requestedengineer-blueprintposter. | ConsistentSegoegrid,module tags/hairlines,tables/charts/images;nostockthreecardlayout. |
| PM32 | All | Content slides fall far below160-300words,6-10modules and10distinctdatapoints. | Automated densitybudgets,notclaimedvisualdensity. |
| PM33 | All | Source footers are crowded broadreferences rather than per-numberlinkedprovenance. | sources.json IDs,chips andSourceStrip;everyquantitativeclaimtraceable. |
| PM34 | All | Wide unfilled bodyblocks exceed0.5x0.5in and lack a modular information structure. | >=93%modulecoverage;gridtiling andinternalcontentoccupation checks. |
| PM35 | All | PDF is raster-backed,so text does not zoom as editable/vector text despite clean-looking renders. | LibreOffice-nativevectorPDF; presentation-safeimagePPTX isadditionalonly. |

## What to keep
Retain lightpaperbackground, restrainedink/accentcontrast, clearly statedprototype/sampledata andseparate20/80subscriptionversus15%session economics. Keep honestweaknessesvisible,but replaceFILL-heavymodules with actual evidence/methods/assumptions until founderfactsarrive.
No claim that the old deck was dishonest throughout: many limitations were correctly disclosed. Its main failures are sparseinformationstructure,unresolvedcentralfacts,weakproofmapping,default-capfunding anduntestededitable/renderparity.
