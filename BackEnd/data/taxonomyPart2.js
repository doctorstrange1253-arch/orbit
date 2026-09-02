const RAW = [
  {
    slug: "health",
    label: "Health, Medicine and Care",
    blurb: "The body, the mind, and the work of keeping both well.",
    genres: {
      "Medical Foundations": ["Gross Anatomy", "Medical Physiology", "Pathology", "Pharmacology", "Medical Microbiology", "Histology", "Embryology", "Medical Genetics", "Biostatistics for Medicine", "Clinical Reasoning"],
      "Clinical Specialties": ["Internal Medicine", "General Surgery", "Paediatrics", "Obstetrics and Gynaecology", "Psychiatry", "Dermatology", "Ophthalmology", "Orthopaedics", "Cardiology", "Neurology", "Radiology", "Anaesthesiology", "Emergency Medicine", "Oncology"],
      "Allied Health": ["Nursing Practice", "Physiotherapy", "Occupational Therapy", "Speech and Language Therapy", "Radiography", "Medical Laboratory Technology", "Optometry", "Pharmacy Practice", "Dental Hygiene", "Paramedic Practice"],
      "Nutrition": ["Macronutrients", "Clinical Nutrition", "Sports Nutrition", "Paediatric Nutrition", "Diet Planning", "Food Science", "Eating Disorder Support", "Public Health Nutrition"],
      "Mental Health": ["Cognitive Behavioural Therapy", "Counselling Skills", "Trauma-Informed Practice", "Addiction Support", "Grief Support", "Child Psychology Practice", "Mindfulness-Based Therapy", "Crisis Intervention"],
      "Public Health": ["Epidemiology", "Health Policy", "Global Health", "Vaccination Programmes", "Health Economics", "Environmental Health", "Community Health Work"],
      "Caregiving": ["Elder Care", "Palliative Care", "Newborn Care", "Special Needs Support", "Home Nursing", "First Aid and CPR", "Dementia Care"],
      "Veterinary": ["Small Animal Practice", "Large Animal Practice", "Veterinary Surgery", "Animal Nutrition", "Poultry Health", "Aquaculture Health"],
    },
  },
  {
    slug: "business",
    label: "Business, Work and Money",
    blurb: "How enterprises are built, run, and paid for.",
    genres: {
      "Accounting and Finance": ["Financial Accounting", "Management Accounting", "Cost Accounting", "Auditing", "Taxation", "Corporate Finance", "Financial Modelling", "Valuation", "Financial Statement Analysis", "Treasury Management", "Forensic Accounting"],
      "Investing and Markets": ["Equity Research", "Technical Analysis", "Fundamental Analysis", "Derivatives", "Fixed Income", "Portfolio Management", "Risk Management", "Commodities", "Foreign Exchange", "Cryptocurrency Markets", "Real Estate Investing"],
      "Entrepreneurship": ["Idea Validation", "Business Model Design", "Startup Finance", "Fundraising and Pitching", "Go-To-Market", "Bootstrapping", "Franchising", "Small Business Operations", "Family Business", "Social Enterprise"],
      "Marketing": ["Brand Strategy", "Content Marketing", "Search Engine Optimisation", "Paid Advertising", "Social Media Marketing", "Email Marketing", "Marketing Analytics", "Copywriting", "Public Relations", "Influencer Marketing", "Market Research", "Conversion Optimisation"],
      "Sales": ["Consultative Selling", "Cold Outreach", "Negotiation", "Account Management", "Sales Operations", "Retail Selling", "Channel Sales", "Proposal Writing"],
      "Product and Project": ["Product Management", "Product Discovery", "Roadmapping", "Agile Practice", "Scrum Mastery", "Kanban", "Project Management", "Programme Management", "Stakeholder Management", "Requirements Gathering"],
      "Operations": ["Supply Chain Management", "Logistics", "Procurement", "Inventory Management", "Lean and Six Sigma", "Quality Management", "Warehouse Operations", "Manufacturing Operations", "Vendor Management"],
      "People and Leadership": ["Recruitment", "Interviewing Skills", "Performance Management", "Compensation Design", "Learning and Development", "Organisational Design", "Team Leadership", "Difficult Conversations", "Remote Team Management", "Employer Branding"],
      "Personal Finance": ["Budgeting", "Debt Management", "Insurance Literacy", "Retirement Planning", "Tax Planning for Individuals", "Credit Scores", "Financial Independence", "Estate Planning Basics"],
      "Business Analysis": ["Excel and Spreadsheets", "Business Intelligence", "KPI Design", "Process Mapping", "Data Storytelling", "Forecasting", "Pricing Strategy", "Unit Economics"],
    },
  },
  {
    slug: "law-civics",
    label: "Law, Governance and Civics",
    blurb: "The rules a society writes for itself, and how they are argued.",
    genres: {
      "Foundations of Law": ["Constitutional Law", "Contract Law", "Tort Law", "Criminal Law", "Property Law", "Administrative Law", "Evidence", "Civil Procedure", "Jurisprudence", "Legal Research", "Legal Writing", "Moot Court"],
      "Commercial Law": ["Company Law", "Competition Law", "Securities Regulation", "Banking Law", "Insolvency and Bankruptcy", "Contract Drafting", "Mergers and Acquisitions", "Commercial Arbitration"],
      "Specialised Practice": ["Intellectual Property", "Patent Drafting", "Trademark Practice", "Data Protection and Privacy", "Technology Law", "Environmental Law", "Labour and Employment Law", "Family Law", "Tax Law", "Immigration Law", "Media Law", "Human Rights Law", "Maritime Law", "Space Law"],
      "Governance and Policy": ["Public Administration", "Policy Analysis", "Legislative Drafting", "Local Government", "Electoral Systems", "Public Procurement", "Regulatory Compliance", "Anti-Corruption Practice"],
      "Civics and Citizenship": ["Civic Literacy", "Rights Awareness", "Consumer Rights", "Tenant Rights", "Workers' Rights", "Right to Information", "Community Organising", "Municipal Engagement"],
      "Exam Preparation": ["Judiciary Exam Preparation", "Bar Examination", "Law Entrance Preparation", "Civil Services General Studies", "Civil Services Optional Subjects", "Legal Aptitude"],
    },
  },
  {
    slug: "languages",
    label: "Languages and Translation",
    blurb: "Every tongue a person might want to be understood in.",
    genres: {
      "English": ["Spoken English", "English Grammar", "English Pronunciation", "Academic English", "Business English", "IELTS Preparation", "TOEFL Preparation", "English for Interviews", "Reading Comprehension", "English Vocabulary"],
      "Indian Languages": ["Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "Assamese", "Urdu", "Sanskrit", "Bhojpuri", "Konkani", "Kashmiri", "Maithili", "Nepali", "Sindhi", "Tulu"],
      "European Languages": ["French", "German", "Spanish", "Italian", "Portuguese", "Dutch", "Russian", "Polish", "Swedish", "Norwegian", "Danish", "Finnish", "Greek", "Czech", "Hungarian", "Romanian", "Ukrainian", "Turkish", "Latin", "Ancient Greek"],
      "Asian Languages": ["Mandarin Chinese", "Cantonese", "Japanese", "Korean", "Thai", "Vietnamese", "Indonesian", "Malay", "Burmese", "Khmer", "Tagalog", "Mongolian", "Tibetan"],
      "Middle Eastern and African": ["Modern Standard Arabic", "Egyptian Arabic", "Levantine Arabic", "Gulf Arabic", "Hebrew", "Persian", "Pashto", "Swahili", "Amharic", "Hausa", "Yoruba", "Zulu", "Somali"],
      "Sign and Constructed": ["Indian Sign Language", "American Sign Language", "British Sign Language", "Braille Literacy", "Esperanto"],
      "Language Work": ["Translation Practice", "Interpretation", "Subtitling", "Localisation", "Transcription", "Language Teaching Method", "Accent Coaching", "Etymology"],
    },
  },
];

module.exports = { RAW };
