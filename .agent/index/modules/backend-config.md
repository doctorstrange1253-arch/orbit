# Backend configuration
Three files fully read as text. Environment names were read in source; no environment-file contents or values accessed. No module imported.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
BackEnd/config/cloudinary.js | 10 | Configures/exports Cloudinary v2 from environment names | cloudinary | Import has configuration side effect; no connection/provider test. | READ:FULL
BackEnd/config/passport.js | 93 | Conditional Google/GitHub/LinkedIn strategies; findOrCreateUser returns user/isNewUser | passport strategies,crypto,bcrypt,user,dotenv | Import loads dotenv; LinkedIn passes wrapper as user at87-88 unlike other strategies; email linking and fallback-verification policies require scrutiny. | READ:FULL
BackEnd/config/redis.js | 17 | Creates/exports Redis client from host/port with local default | ioredis | Import starts connection; not executed; auth/TLS configuration not present in this file. | READ:FULL




