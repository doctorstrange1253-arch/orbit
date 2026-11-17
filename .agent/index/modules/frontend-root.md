# Frontend package/configuration
All8files fully read as text; no builds/tests/config imports. Dependency ranges are declared versions, not installed resolution proof.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
FrontEnd/.gitignore | 29 | Ignoreslogs/dependencies/builds/envlocal/editorfiles | Git | Exampleenvallowlistnotpermissiontoreadsecrets; ignoredfilesstillindexedbyuserexceptionswhereapplicable. | READ:FULL
FrontEnd/capacitor.config.json | 23 | app.orbit.mobile shell,dist,remoteHTTPSserver,HTTP/splashplugins | Capacitor | Nativeapp loadsremoteVercelorigin,not necessarilylocaldist; no currentdevice/deploymentproof. | READ:FULL
FrontEnd/eslint.config.js | 42 | React/JS flatlint,build/nativeexclusions,somehookswarnings | ESLint/hooks/refresh/globals | Warningsnotzeroissues; noTypeScriptcheck; notexecuted. | READ:FULL
FrontEnd/index.html | 110 | Metadata/fonts/themeboot/splash/noscript/mainentry | Externalfonts,localStorage,main.jsx | Legacycanonicalorigin andpreloadfont404history; splashlightcontrast; noexternalfetch. | READ:FULL
FrontEnd/package.json | 80 | React19/Vite8/R3F/Three/Motion/Capacitor/query stack;dev/build/lint/testscripts | Declarednpmdependencies | BuildfirstwritesGoogleconfig; no typecheckscript; notexecuted. | READ:FULL
FrontEnd/playwright.config.js | 8 | ChromiumE2Econfig,60stimeout,baseURLoverride | Playwright | No serverstartup here; existingserverrequired; NOT_RUN. | READ:FULL
FrontEnd/vercel.json | 8 | SPAfallback rewrite | Vercel | No backendproxydeclaredhere; deploymentscopeunverified. | READ:FULL
FrontEnd/vite.config.js | 157 | React/Tailwind/compression/PWA/chunks/proxy/Vitest;buildtimeFCMprobe | Viteplugins,fs,Googleconfig | Importreadscredential-adjacentclientconfig; normalbuildexcluded; autoUpdatePWA notdurableofflinecourseproof; pushforcedONelsewherecontradictsguardclaim. | READ:FULL




