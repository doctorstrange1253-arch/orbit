# Backend middleware
All8files fully read by coordinator; no module imported, no test/server/DB request executed. Source observations are not runtime reproductions.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
BackEnd/middleware/auth.js | 102 | JWT verification, live user/roles/ban checks, rolesVersion refresh exception and request actor | jsonwebtoken,user,seasonService | Authenticated reads can write daily activity at41-49; stale check only for numeric token version; exact recovery req.path must match mounting. | READ:FULL
BackEnd/middleware/identity.js | 78 | Alternative array-based requireRoles and preventSelfReview | user model | Extra DB read/version check; overlaps separate requireRoles module; target getter is synchronous; actual consumer mounts pending. | READ:FULL
BackEnd/middleware/requireRoles.js | 77 | requireRoles/requireAllRoles/requireAnyRole, three valid product roles | req.user from auth | requireAllRoles with no valid role names passes empty every; do not claim exploitable without caller evidence. | READ:FULL
BackEnd/middleware/adminAuth.js | 109 | requireAdmin cookie/header JWT, live admin/status/tokenVersion, cookie CSRF; requireRole | user,adminCrypto | Unknown portalRole defaults superadmin; cookie decode errors return404; actual authorization requires mounted requireAdmin chain. | READ:FULL
BackEnd/middleware/adminRateLimit.js | 24 | Admin auth8/15min and API120/min rate limits | express-rate-limit | In-memory default storage; deployment/distributed behavior not tested. | READ:FULL
BackEnd/middleware/errorHandler.js | 36 | Validation/duplicate/JWT/cast error translation and generic status response | Express/Mongoose error shapes | Generic branch returns err.message; privacy impact depends on thrown errors. | READ:FULL
BackEnd/middleware/rateLimiter.js | 15 | General100/min and auth10/15min limiters | express-rate-limit | In-memory limits; actual mount/proxy behavior pending. | READ:FULL
BackEnd/middleware/sanitize.js | 34 | Recursive removal of Mongo operators/dotted/prototype keys in request objects | Express request bodies/query/headers | Express5 query getter and mutation semantics require consumer verification; no execution. | READ:FULL




