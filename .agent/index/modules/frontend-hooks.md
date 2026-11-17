# Frontend hooks
All15files fully read by coordinator. No hooks mounted or application/browser/test started.
path | lines | role / dataflow | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
FrontEnd/src/hooks/useContextLossWarning.js | 34 | Manual warning state/trigger, not automatic context monitoring | React | Placeholder effect watches no context despite description; consumer wiring needed. | READ:FULL
FrontEnd/src/hooks/useFlares.js | 34 | Flare count/fire/own queries and invalidation | ReactQuery,flares | Own query key has no account identity; errors not transformed here. | READ:FULL
FrontEnd/src/hooks/useGameology.js | 55 | Progress/catalog/leaderboard/history/award hooks | ReactQuery,gameology | Private query keys unscoped by account; award metadata passed through. | READ:FULL
FrontEnd/src/hooks/useKnowledge.js | 68 | Privateconcept/path/map/mastery and publiccatalog/map hooks | ReactQuery,knowledge | Private me/path/mastery keys not account-scoped; publicmap has userId. | READ:FULL
FrontEnd/src/hooks/useLazyScene.js | 6 | Stable lazy scene initialization with null Suspense fallback | React | Loader changes after mount ignored intentionally; no localerror boundary. | READ:FULL
FrontEnd/src/hooks/useNow.js | 23 | Intervalclock, UTCtoday/yesterday, one-time dayIndex | React,Date | useDayIndex never advances at midnight; timedconsumers can remainstale. | READ:FULL
FrontEnd/src/hooks/useOnlineUsers.js | 38 | Presence set from singleton socket events | authStore,socket | Anonymous connect handler never removed; online state not cleared onlogout. | READ:FULL
FrontEnd/src/hooks/usePact.js | 54 | Mentor standing/history/pulse queries and seenmutation | ReactQuery,pact | Private keys unscoped byaccount; no currentidentity guard in hook. | READ:FULL
FrontEnd/src/hooks/useQualityTier.js | 33 | WebGL2probe, device heuristic tier, live reducedmotion fallback | React,matchMedia,WebGL | Hardwareheuristic not measuredperformance; no resize-tierupdate; probe explicitly loses context. | READ:FULL
FrontEnd/src/hooks/useSigilState.js | 66 | Authsnapshot level/streak/league and sharedstardust | authStore | Falls back to Photon/stardust aliases; not separate implementedStudent/Mentorwallets. | READ:FULL
FrontEnd/src/hooks/useSignalFlareListener.jsx | 50 | Socket response becomes materialization overlay | authStore,socket,PlanetMaterialization | Pending event not cleared whenaccount changes; listener source notauthority. | READ:FULL
FrontEnd/src/hooks/useSocket.js | 92 | Shared socket lifecycle, legacy roles refresh, cacheinvalidations, moderationredirect | auth/UIstores,ReactQuery,api/socket | Fullnavigation onforce-disconnect; singletonownership sharedwithotherhooks; no crossaccountcacheclear here. | READ:FULL
FrontEnd/src/hooks/useSoul.js | 113 | Route+roles resolves visualworld, sharedpages mentor>student>peer, setstartstransit | Registry,palette,auth,identityStore,router | Route/committedcontext/eligibility conflated; setdoesnotcheckdestinationmembership; no source-workguard. | READ:FULL
FrontEnd/src/hooks/useStreak.js | 30 | UTCrecency labels fromGameology | useGameology,useToday | Loading/error fallsbackzero/never; cannot establishtrueemptystate. | READ:FULL
FrontEnd/src/hooks/useXpToast.js | 75 | SocketXPtoasts, tiercrossingceremony, queryinvalidation | Auth/socket,UIicons,ReactQuery,pulse/tierMeta | lasttierref notresetperaccount; firsteventinitializesnotinitialuserstate; history/cacheinvalidationspartial. | READ:FULL




