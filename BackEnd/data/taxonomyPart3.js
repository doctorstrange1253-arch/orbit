const RAW = [
  {
    slug: "humanities",
    label: "Humanities and Letters",
    blurb: "What people have written, believed, and remembered.",
    genres: {
      "History": ["Ancient History", "Medieval History", "Modern History", "Indian History", "World Wars", "Colonial History", "Economic History", "History of Science", "Oral History Method", "Archival Research", "Historiography"],
      "Literature": ["Poetry", "The Novel", "Short Fiction", "Drama", "Literary Criticism", "Comparative Literature", "Postcolonial Literature", "Children's Literature", "Classical Epics", "Close Reading"],
      "Philosophy": ["Logic", "Ethics", "Metaphysics", "Epistemology", "Political Philosophy", "Philosophy of Mind", "Philosophy of Science", "Aesthetics", "Eastern Philosophy", "Existentialism", "Stoicism"],
      "Religion and Spirituality": ["Comparative Religion", "Hindu Philosophy", "Buddhist Studies", "Islamic Studies", "Biblical Studies", "Jain Studies", "Sikh Studies", "Vedanta", "Meditation Traditions", "Religious Ethics"],
      "Archaeology and Heritage": ["Field Archaeology", "Epigraphy", "Numismatics", "Museum Studies", "Conservation of Artefacts", "Heritage Management", "Palaeography"],
      "Writing": ["Creative Writing", "Screenwriting", "Playwriting", "Essay Writing", "Memoir", "Journalism", "Investigative Reporting", "Editing and Proofreading", "Ghostwriting", "Poetry Craft", "Worldbuilding", "Publishing Process"],
    },
  },
  {
    slug: "social-sciences",
    label: "Society and Mind",
    blurb: "How people behave together, and why.",
    genres: {
      "Psychology": ["Introductory Psychology", "Developmental Psychology", "Social Psychology", "Cognitive Psychology", "Abnormal Psychology", "Personality Theory", "Organisational Psychology", "Educational Psychology", "Sport Psychology", "Psychological Assessment", "Behavioural Economics"],
      "Sociology": ["Social Theory", "Urban Sociology", "Rural Sociology", "Caste and Class", "Gender Studies", "Family and Kinship", "Sociology of Religion", "Deviance and Crime", "Social Movements", "Qualitative Methods"],
      "Economics": ["Microeconomics", "Macroeconomics", "Development Economics", "International Trade", "Public Economics", "Labour Economics", "Econometrics", "Monetary Economics", "Agricultural Economics", "Environmental Economics", "Economic Survey Reading"],
      "Political Science": ["Comparative Politics", "International Relations", "Political Theory", "Geopolitics", "Diplomacy", "Public Policy", "Conflict Studies", "Nationalism"],
      "Geography and Anthropology": ["Physical Geography", "Human Geography", "Cartography", "Geographic Information Systems", "Cultural Anthropology", "Linguistic Anthropology", "Ethnography", "Demography", "Migration Studies"],
      "Education": ["Pedagogy", "Curriculum Design", "Assessment Design", "Early Childhood Education", "Inclusive Education", "Educational Technology", "Classroom Management", "Teacher Training", "Adult Learning", "Homeschooling"],
      "Communication": ["Public Speaking", "Debate", "Rhetoric", "Interpersonal Communication", "Cross-Cultural Communication", "Media Literacy", "Presentation Design", "Storytelling for Work", "Facilitation"],
    },
  },
  {
    slug: "arts-visual",
    label: "Visual Arts and Design",
    blurb: "Making things that are looked at, and making them well.",
    genres: {
      "Drawing and Painting": ["Pencil Drawing", "Charcoal", "Ink Illustration", "Watercolour", "Acrylic Painting", "Oil Painting", "Gouache", "Figure Drawing", "Portraiture", "Landscape Painting", "Still Life", "Perspective Drawing", "Colour Theory", "Botanical Illustration", "Miniature Painting", "Madhubani", "Warli", "Gond Art"],
      "Digital Art": ["Digital Illustration", "Concept Art", "Character Design", "Environment Design", "Storyboarding", "Comic Art", "Manga Art", "Pixel Art", "Vector Illustration", "Matte Painting", "Digital Painting in Procreate", "Photobashing"],
      "Graphic Design": ["Typography", "Layout and Grid", "Logo Design", "Brand Identity", "Packaging Design", "Editorial Design", "Poster Design", "Infographic Design", "Print Production", "Design Systems"],
      "Product and UX": ["User Research", "Interaction Design", "Wireframing", "Prototyping in Figma", "Usability Testing", "Information Architecture", "Design Handoff", "Accessibility in Design", "Service Design", "Motion for Interfaces"],
      "3D and Motion": ["Blender Modelling", "Sculpting in ZBrush", "3D Texturing", "Rigging and Animation", "Lighting and Rendering", "Motion Graphics", "After Effects", "Visual Effects Compositing", "Houdini Simulation", "Architectural Visualisation"],
      "Photography": ["Camera Fundamentals", "Composition", "Portrait Photography", "Street Photography", "Landscape Photography", "Wildlife Photography", "Product Photography", "Wedding Photography", "Astrophotography", "Studio Lighting", "Photo Editing in Lightroom", "Retouching", "Film Photography", "Darkroom Printing", "Photojournalism"],
      "Architecture and Space": ["Architectural Design", "Interior Design", "Landscape Architecture", "Urban Design", "Sustainable Architecture", "Vernacular Architecture", "Architectural Drawing", "Model Making", "Lighting Design", "Set Design"],
    },
  },
  {
    slug: "music-sound",
    label: "Music and Sound",
    blurb: "Organised sound, and the discipline behind it.",
    genres: {
      "Theory and Ear": ["Music Theory", "Sight Reading", "Ear Training", "Harmony", "Counterpoint", "Rhythm Training", "Composition", "Arranging", "Orchestration", "Songwriting", "Film Scoring", "Music History"],
      "Indian Classical": ["Hindustani Vocal", "Carnatic Vocal", "Raga Theory", "Tala and Laya", "Sitar", "Sarod", "Bansuri", "Sarangi", "Santoor", "Veena", "Mridangam", "Tabla", "Pakhawaj", "Ghatam", "Harmonium", "Dhrupad", "Thumri", "Bhajan and Kirtan"],
      "Western Instruments": ["Acoustic Guitar", "Electric Guitar", "Fingerstyle Guitar", "Classical Guitar", "Bass Guitar", "Piano", "Keyboard", "Violin", "Cello", "Double Bass", "Flute", "Clarinet", "Saxophone", "Trumpet", "Trombone", "Drum Kit", "Ukulele", "Mandolin", "Accordion", "Harmonica"],
      "Voice": ["Vocal Technique", "Breath Support", "Belting", "Falsetto and Mix", "Choral Singing", "Vocal Health", "Beatboxing", "Rap Technique", "Vocal Improvisation", "Stage Presence for Singers"],
      "Genre Craft": ["Jazz Improvisation", "Jazz Comping", "Blues", "Rock Performance", "Metal Technique", "Funk Rhythm", "Reggae", "Latin Rhythms", "Folk Traditions", "Qawwali", "Ghazal", "Sufi Music", "Bollywood Playback", "Gospel", "Country", "Flamenco"],
      "Production": ["Digital Audio Workstations", "Ableton Live", "FL Studio", "Logic Pro", "Sound Design", "Synthesis", "Sampling", "Beat Making", "Mixing", "Mastering", "Home Studio Setup", "Microphone Technique", "Live Sound Engineering", "Podcast Production", "Foley and Dialogue Editing", "DJing"],
    },
  },
  {
    slug: "performance",
    label: "Performance and Story",
    blurb: "Work that only exists while someone is doing it.",
    genres: {
      "Acting": ["Acting Technique", "Method Acting", "Improvisation", "Audition Craft", "Voice for Actors", "Movement for Actors", "Scene Study", "Monologue Work", "Camera Acting", "Theatre Acting", "Voice Acting", "Dubbing"],
      "Dance": ["Bharatanatyam", "Kathak", "Odissi", "Kuchipudi", "Mohiniyattam", "Manipuri", "Kathakali", "Bhangra", "Garba", "Lavani", "Ballet", "Contemporary Dance", "Jazz Dance", "Hip Hop Dance", "Breaking", "Salsa", "Bachata", "Tango", "Ballroom", "Belly Dance", "Choreography", "Dance Fitness"],
      "Theatre Craft": ["Directing", "Stagecraft", "Lighting for Stage", "Costume Design", "Makeup for Stage", "Puppetry", "Street Theatre", "Mime", "Physical Theatre", "Dramaturgy", "Production Management"],
      "Film and Video": ["Cinematography", "Camera Operation", "Directing for Screen", "Film Editing", "Colour Grading", "Sound for Film", "Documentary Making", "Short Film Production", "Screen Acting Direction", "Film Analysis"],
      "Creator Craft": ["YouTube Production", "Short-Form Video", "Streaming Setup", "On-Camera Presence", "Podcast Hosting", "Interview Technique", "Audience Building", "Live Event Hosting", "Stand-Up Comedy", "Sketch Comedy", "Magic and Illusion"],
      "Circus and Spectacle": ["Juggling", "Aerial Silks", "Acrobatics", "Fire Performance", "Clowning", "Stilt Walking"],
    },
  },
];

module.exports = { RAW };
