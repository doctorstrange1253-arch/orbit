# Frontend build script
path | lines | role | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
FrontEnd/scripts/write-google-services.mjs | 49 | BuildtimeGoogleclientconfig materializer fromenvironment raw/base64JSON,existingfilewins | Nodefs/path/url | Fullreadtextonly; notexecuted; writescredential-adjacentfile andreturns0onparsefailure; JSONshape notverifiedhere. | READ:FULL




