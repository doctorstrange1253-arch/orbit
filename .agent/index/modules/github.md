# CI configuration
Bothworkflowfiles fully read only; no CI changed, triggered or inspected remotely.
path | lines | role | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
.github/workflows/ci.yml | 67 | mainpush/PR Node22 backendJest,frontendlint/Vitest/build | checkout/setup-node,npmci,package scripts | passWithNoTests canpassmissingdiscovery; noPlaywright/agenttoolchecks; socketbuildplaceholder; actualCIstatusNOT_RUN. | READ:FULL
.github/workflows/android-apk.yml | 90 | mainfrontendpush/manual Node22/JDK21/SDK36 debugAPK build/artifact | Actions,SDK,npm,Capacitor,Gradle,secretnameGoogleconfig | BuildsdebugnotreleaseAPK; precompressedassetdeletioninsideCIonly; no signing/device/permissionproof; sourceworkflowreadnotexecution. | READ:FULL




