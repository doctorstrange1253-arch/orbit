const RAW = [
  {
    slug: "sciences",
    label: "The Sciences",
    blurb: "The study of what the world is made of and how it behaves.",
    genres: {
      "Physics": ["Classical Mechanics", "Electromagnetism", "Thermodynamics", "Optics", "Special Relativity", "General Relativity", "Quantum Mechanics", "Particle Physics", "Nuclear Physics", "Condensed Matter", "Fluid Dynamics", "Acoustics", "Biophysics", "Computational Physics"],
      "Chemistry": ["General Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Biochemistry", "Electrochemistry", "Polymer Chemistry", "Medicinal Chemistry", "Spectroscopy", "Green Chemistry", "Lab Technique and Safety"],
      "Biology": ["Cell Biology", "Genetics", "Molecular Biology", "Microbiology", "Human Anatomy", "Human Physiology", "Immunology", "Neuroscience", "Evolutionary Biology", "Botany", "Zoology", "Ecology", "Marine Biology", "Bioinformatics", "Virology"],
      "Earth and Space": ["Geology", "Meteorology", "Oceanography", "Climate Science", "Astronomy", "Astrophysics", "Planetary Science", "Cosmology", "Seismology", "Soil Science", "Hydrology", "Remote Sensing"],
      "Scientific Practice": ["Experimental Design", "Scientific Writing", "Peer Review", "Research Ethics", "Grant Writing", "Lab Notebook Discipline", "Reproducibility", "Science Communication"],
    },
  },
  {
    slug: "mathematics",
    label: "Mathematics and Logic",
    blurb: "The discipline of exact reasoning, from arithmetic to proof.",
    genres: {
      "Foundations": ["Arithmetic", "Pre-Algebra", "Algebra", "Geometry", "Trigonometry", "Pre-Calculus", "Mathematical Notation", "Proof Technique", "Set Theory", "Mathematical Logic"],
      "Analysis": ["Single-Variable Calculus", "Multivariable Calculus", "Real Analysis", "Complex Analysis", "Differential Equations", "Partial Differential Equations", "Vector Calculus", "Fourier Analysis", "Numerical Analysis"],
      "Algebra and Structure": ["Linear Algebra", "Abstract Algebra", "Group Theory", "Ring and Field Theory", "Number Theory", "Combinatorics", "Graph Theory", "Topology", "Category Theory"],
      "Probability and Statistics": ["Probability Theory", "Descriptive Statistics", "Inferential Statistics", "Regression Analysis", "Bayesian Statistics", "Experimental Statistics", "Time Series", "Stochastic Processes", "Survival Analysis", "Causal Inference"],
      "Applied Mathematics": ["Mathematical Modelling", "Optimisation", "Operations Research", "Game Theory", "Cryptography Mathematics", "Actuarial Mathematics", "Financial Mathematics", "Control Theory"],
      "Competitive and Exam": ["Olympiad Algebra", "Olympiad Geometry", "Olympiad Number Theory", "Olympiad Combinatorics", "Quantitative Aptitude", "Mental Arithmetic", "Vedic Mathematics"],
    },
  },
  {
    slug: "computing",
    label: "Computing and Software",
    blurb: "Instructing machines, and the craft of the systems built on them.",
    genres: {
      "Programming Languages": ["Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust", "Ruby", "Swift", "Kotlin", "PHP", "Scala", "Haskell", "Elixir", "Lua", "R", "MATLAB", "Shell Scripting"],
      "Computer Science": ["Data Structures", "Algorithms", "Computational Complexity", "Operating Systems", "Computer Networks", "Compilers", "Computer Architecture", "Databases", "Distributed Systems", "Concurrency", "Formal Methods", "Programming Language Theory"],
      "Web Development": ["HTML and CSS", "React", "Vue", "Svelte", "Angular", "Next.js", "Node.js", "Django", "Rails", "Laravel", "Spring Boot", "REST API Design", "GraphQL", "WebSockets", "Web Accessibility", "Web Performance", "Browser Internals"],
      "Mobile Development": ["Android Native", "iOS Native", "React Native", "Flutter", "Mobile UI Patterns", "App Store Release", "Mobile Performance", "Offline-First Design"],
      "Data and AI": ["SQL", "Data Cleaning", "Pandas", "Data Visualisation", "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Reinforcement Learning", "Large Language Models", "Prompt Engineering", "MLOps", "Feature Engineering", "Recommender Systems", "Data Warehousing", "Stream Processing"],
      "Infrastructure": ["Linux Administration", "Docker", "Kubernetes", "CI and CD", "Infrastructure as Code", "AWS", "Azure", "Google Cloud", "Observability", "Site Reliability", "Networking Operations", "Cost Optimisation"],
      "Security": ["Application Security", "Network Security", "Cryptography Practice", "Penetration Testing", "Reverse Engineering", "Malware Analysis", "Digital Forensics", "Cloud Security", "Threat Modelling", "Secure Code Review", "Capture the Flag"],
      "Games and Graphics": ["Unity", "Unreal Engine", "Godot", "Game Design", "Shader Programming", "3D Mathematics", "Physics Engines", "Level Design", "Game Audio Implementation", "Real-Time Rendering"],
      "Craft and Practice": ["Git and Version Control", "Testing and TDD", "Refactoring", "Code Review", "Debugging", "Software Architecture", "Design Patterns", "Technical Writing", "Pair Programming", "Legacy Code Rescue"],
      "Interview and Career": ["Coding Interview Practice", "System Design Interview", "Behavioural Interview", "Take-Home Projects", "Portfolio Building", "Open Source Contribution"],
    },
  },
  {
    slug: "engineering",
    label: "Engineering and Making",
    blurb: "Turning principle into a thing that holds.",
    genres: {
      "Mechanical": ["Statics", "Dynamics", "Strength of Materials", "Machine Design", "Heat Transfer", "Internal Combustion Engines", "Mechatronics", "Vibration Analysis", "Manufacturing Processes", "Tribology"],
      "Electrical and Electronics": ["Circuit Analysis", "Analogue Electronics", "Digital Electronics", "Signals and Systems", "Power Systems", "Power Electronics", "Microcontrollers", "Embedded C", "FPGA and Verilog", "PCB Design", "Antenna Design", "Instrumentation"],
      "Civil and Structural": ["Structural Analysis", "Reinforced Concrete", "Steel Design", "Geotechnical Engineering", "Surveying", "Transportation Engineering", "Water Resources", "Construction Management", "Earthquake Engineering", "Quantity Surveying"],
      "Chemical and Process": ["Mass and Energy Balance", "Reaction Engineering", "Separation Processes", "Process Control", "Plant Design", "Process Safety", "Petroleum Refining"],
      "Aerospace and Automotive": ["Aerodynamics", "Propulsion", "Flight Mechanics", "Orbital Mechanics", "Vehicle Dynamics", "Automotive Electronics", "Drone Design", "Rocketry"],
      "Robotics": ["Robot Kinematics", "Robot Control", "ROS", "Motion Planning", "Robot Perception", "Industrial Automation", "PLC Programming", "SCADA"],
      "Design Tools": ["AutoCAD", "SolidWorks", "Fusion 360", "CATIA", "Revit", "ANSYS", "MATLAB Simulink", "KiCad", "Blender for Engineering"],
      "Maker Practice": ["3D Printing", "CNC Machining", "Laser Cutting", "Arduino Projects", "Raspberry Pi Projects", "Soldering", "Prototyping", "Reverse Engineering Hardware"],
    },
  },
];

module.exports = { RAW };
