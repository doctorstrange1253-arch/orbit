# Backend taxonomy data
All5files fully read by coordinator, not imported or evaluated. Editorial taxonomy labels are not teaching qualification, safe-service authorization or universal curriculum coverage.
path | lines | role / exports | dependencies | risks / TODOs | receipt
--- | ---: | --- | --- | --- | ---
BackEnd/data/taxonomy.js | 138 | Flattens RAW into constellations/genres/topics; slugify,lookups,normaliseTopics,ancestryOf,searchTopics,tree,STATS | Fourtaxonomy parts | Label-derived IDs lack explicit version/alias migration; negative searchlimit returns slice semantics; taxonomy not qualification. | READ:FULL
BackEnd/data/taxonomyPart1.js | 61 | RAW sciences,mathematics,computing,engineering topics | taxonomy.js | Broad editorial domains; no independent curriculum/credential validation. | READ:FULL
BackEnd/data/taxonomyPart2.js | 63 | RAW health,business,law/civics,languages | taxonomy.js | Regulated/advice topics listed without service eligibility evidence; not approved clinical/legal practice. | READ:FULL
BackEnd/data/taxonomyPart3.js | 71 | RAW humanities,socialsciences,visualarts,music,performance | taxonomy.js | Topic listing not learning outcomes or content rights; display labels feed IDs. | READ:FULL
BackEnd/data/taxonomyPart4.js | 45 | RAW craft/trades,body/sport/wellbeing,life skills | taxonomy.js | Health/traditional-care and hazardous activities require separate policies; taxonomy does not establish efficacy/safety. | READ:FULL




