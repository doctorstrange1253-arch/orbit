# Frontend studio helpers
All3studio source/test files indexed; no media, canvas or application test execution.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
FrontEnd/src/studio/cuts.js | 49 | normalize/add/total cuts, skipTarget and source/effective time conversion | None | Conversion assumes normalized ordered ranges; EPS0.05boundary behavior must preserve exacttime semantics; no physical media editing. | READ:FULL
FrontEnd/src/studio/__tests__/cuts.test.js | 84 | L2full | Ten tests for cutnormalization,overlapmerge,skip,effective/source time and120sroundtrip | Vitest,cuts | Puredeclaredcoverage,NOT_RUN; no realmediaexport/codec/time-mapvalidation. | READ:FULL
FrontEnd/src/studio/recorderStage.js | 124 | Four layoutspecs,scriptbuilder,availabilitylayoutresolution,easedrectblend,CanvasdrawCover | Canvas2D/mediaelements | Composition only, not recorder durability/permissions; layout400ms transition is not approvednewworldtiming. | READ:FULL




