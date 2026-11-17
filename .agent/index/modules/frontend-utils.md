# Frontend utilities
All7files fully read as source, no native/web permission, notification, audio or telemetry operation executed.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
FrontEnd/src/utils/emojiGuard.js | 29 | String pictograph predicate and React-tree text/property scan | ReactChildren/isValidElement | Doesnotexecutecomponentfunctions; source guard notfullrenderedDOMproof. | READ:FULL
FrontEnd/src/utils/nativeNotify.js | 85 | Native localpermission/init/tap routing and scheduledtraynotification | CapacitorLocalNotifications | Removesallpluginlisteners; permissionReady canremainfalseafterlaterSettingsgrant; no deliverywhileprocessdeadclaim. | READ:FULL
FrontEnd/src/utils/notifications.js | 82 | Browserpermission,backgroundnotification,beep,titleflash | BrowserNotification/WebAudio/timers | BeepallocatesAudioContextwithoutclose; fallback/vite.svgasset; no routeonnotificationclick. | READ:FULL
FrontEnd/src/utils/notifyPermission.js | 55 | Crossplatformpermissioncheck/request | NativeLocal/Push,webnotifications | Pushregister path bypasses pushNotifybuildguard; reportslocalgrant regardlesspushresult; notnativeverified. | READ:FULL
FrontEnd/src/utils/pushNotify.js | 138 | NativeFCMregistration/listeners/tokenupload/unregister | CapacitorPush,api,buildflag | ForcedONbypassesFCM_CONFIGUREDcontrarycomment; lastTokensetbeforeuploadsuccess; pushStartedneverresetafterlogout/denial; crossaccountregistrationrisk. | READ:FULL
FrontEnd/src/utils/reportWebVitals.js | 72 | DEVvitalsconsole,RAFfps,latencylog | web-vitals,performance | CLSreportedmsincorrectly; notificationlatencylogisnotpaintobservation; productiontelemetrynotimplemented. | READ:FULL
FrontEnd/src/utils/soundManager.js | 342 | SingletonWebAudio/UItones,ambienttrack,preferences,visibility/callpause,useSound | Browseraudio/localStorage | UIeffectsdefaultON conflictsfutureoptionalOFF; visibilityresumeignorescallpause; auxiliarygainnodesnotconnectedasintended; noaudioruntimeproof. | READ:FULL




