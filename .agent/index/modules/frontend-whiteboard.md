# Frontend whiteboard
All10whiteboard source/style/test files indexed at assigned depth; no RTC, socket, browser or application test execution.
path | lines | read scope | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | --- | ---
FrontEnd/src/whiteboard/constants.js | 73 | full | Tools/shape IDs,palettes,defaults,optypes,templates,caps and clientlocalID | performance | Clientcap5000objects differs server6000; uniqueness not durableidentity; no new schemasapproved. | READ:FULL
FrontEnd/src/whiteboard/sync.js | 196 | full | WhiteboardSync negotiated reliable/unreliable RTC channels with socket fallback, op queue, snapshots, cursors/chat/reactions | Existing peer connection, socket, Board, RAF | Drops oldest committed op after500queue; payloads not room-filtered locally; destroy keeps safe.onopen and cached channels; reconnect/merge guarantees need engine check. | READ:FULL
FrontEnd/src/whiteboard/board.js | 553 | full1-190,191-380,381-553 | Board scene/pages/viewport, dirty/live canvases, Lamport ops, undo/redo, erase, snapshots, PNG/SVG export | constants,objects,Canvas2D,Image | DELETE/CLEAR ignore newer object revisions; snapshot omits tombstones and page deletion history; remote operations bypass local caps; SVG interpolates color/src attributes unescaped. Source-only, no exploit/runtime test. | READ:FULL
FrontEnd/src/whiteboard/DraggableVideoTile.jsx | 242 | full1-150,151-242 | Persisted draggable/resizable/collapsible videoPiP, pointercapture, corner snapping | callLayoutStore,React,DOM | Clampspositionnotwidthtoverysmallstage; stage-onlyresizeunobserved; no keyboardmove/resize; source-only. | READ:FULL
FrontEnd/src/whiteboard/Whiteboard.jsx | 722 | sectionmap;1-190,386-505,613-722;unread191-385,506-612 | Board/syncmount,12sserverautosave,localtools/chat/reactions,math/code/media/export UI | Board,WhiteboardSync,objects,richText,api,CSS | Mountcapturesinitialroom/userwhileautosavefollowsnewroomId; save/hydrationerrorshidden; nofinalsaveonclose; globalkeysinterceptchat; no durableack/replayauthority. | READ:KEY_SECTIONS
FrontEnd/src/whiteboard/Whiteboard.css | 157 | L2head1-60,104-157 andselectormap | Layering,glasscontrols,tools/styles/chat/pages/modals,mobile/reducedreactionrules | Whiteboardclasses/globaltokens | Many26-42pxtargets; limitedreducedmotionselector; visualoverlap/contrastnotrendered. | READ:KEY_SECTIONS
FrontEnd/src/whiteboard/__tests__/board.test.js | 115 | L2full | Eleven source tests for op convergence, stale readd,undo/redo,pixeleraser,geometry,snapshotroundtrip | Vitest,Board,objects,constants | Immediatepairdelivery doesnotexercise reordering/concurrentdeletes; no snapshot tombstone/convergence/exportsecurity coverage; NOT_RUN. | READ:FULL
FrontEnd/src/whiteboard/__tests__/Whiteboard.dom.test.jsx | 104 | L2full | Five DOM tests:reactionwire/legacyvectors/toolset/penundo/toolchange | Vitest,TestingLibrary,Whiteboard;stubCanvas/RAF/API | Rendering/network/durableautosave nottested; globalsstubbed; NOT_RUN. | READ:FULL
FrontEnd/src/whiteboard/richText.js | 120 | full | Canvas-rendered code token colors/line numbers and simplemathsuper/subscripts toPNGdataURL | Canvas2D,fonts | NotLaTeX/semanticmath; headerclaims fractionstackingbuttokenizeronlysup/sub; no inputsizecap here. | READ:FULL
FrontEnd/src/whiteboard/objects.js | 259 | full1-140,141-259 | Stroke smoothing,bboxes,drawing,hittesting,constrainedshapegeometry | Path2D,Canvas2D,imagecache | Filledellipse/trianglehitusesboundingrectangle; code/mathbecomeimages; blankstroke bboxinfinite ifuncheckedcaller. | READ:FULL




