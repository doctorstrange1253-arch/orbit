# Backend utilities
All8utilities indexed as source only; no imports, external calls or runtime checks.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
BackEnd/utils/roomMembership.js | 42 | verifyRoomMember accepts call participant or connection participant | CallHistory,Connection,mongoose | No call/connection status predicate; historic/rejected connection membership may grant Board access; actual use mounted in whiteboard routes. | READ:FULL
BackEnd/utils/adminAudit.js | 34 | audit best-effort AuditLog create; clientIp from forwarded header | AuditLog | Errors swallowed/logged; forwarded IP trust depends on proxy; append-only not enforced here. | READ:FULL
BackEnd/utils/adminCrypto.js | 73 | AES-GCM TOTP encryption,scrypt key, separate admin JWT,constant-time compare,randomtoken | nodecrypto,jsonwebtoken,environment names | No secret values read; key derivation on each call; configuration required and errors explicit. | READ:FULL
BackEnd/utils/contentModeration.js | 90 | Keyword policy, three strikes, escalating10h+5h bans, failclosed missinguser | user,bannedKeywords | Read-modify-save warning counts can race; keyword hit is not contextual safety assessment. | READ:FULL
BackEnd/utils/events.js | 3 | Shared in-process EventEmitter | nodeevents | Not durable/distributed event delivery. | READ:FULL
BackEnd/utils/safetyCheck.js | 32 | Separate whole-word English keyword predicate | None | Duplicates broader keyword subsystem; benign/educational contexts can match; source use pending. | READ:FULL
BackEnd/utils/bannedKeywords.js | 309 | L1-200,201-310; unread:none; static inspection only | CommonJS exports BANNED_KEYWORDS, checkForBannedContent, validateSkillContent, validateBio; precompiled case-insensitive whole-word moderation | Native RegExp/Set; no imports | L236-239: unconditional word boundaries miss standalone listed terms ending/starting in punctuation, including "18+", "a$$", "@ss"; L118-120,258-268: legitimate tutoring text containing "private lesson" or "one on one" is rejected regardless of context—review moderation policy | READ:FULL
BackEnd/utils/sendEmail.js | 245 | L1-200,201-246; unread:none; static inspection only; callers uninspected | Exports sendLoginNotification, sendRegistrationNotification, sendEmail, sendPasswordResetEmail; shared HTML templates/Brevo dispatch; login/registration log and swallow failures, generic/reset propagate them | Node 18+ native fetch; Brevo HTTPS API; BREVO_API_KEY, BREVO_SENDER_EMAIL or EMAIL_USER, FRONTEND_URL environment configuration | L116,166,216: names interpolated unescaped into HTML can inject links/markup if caller-supplied names contain HTML; upstream sanitization unknown. L21-34: no application timeout, so a stalled provider can prolong awaited sends. L217,237: reset expiry is hardcoded to one hour; alignment with actual token expiry unverified | READ:FULL




