/**
 * LIFE MEMORY AI — Multi-User Isolated Data & Seed Mock Engine
 * Maintains strict per-account isolation with complete technical profile
 * memories for K. Mahalakshmi (Mahalakshmi Kommaranahalli).
 */

const ACCOUNTS_REGISTRY_KEY = 'lifememory_accounts_v4';
const DATASTORE_VERSION = 'v6_mahalakshmi_complete_profile_2026';
const DEMO_EMAIL = 'mahalakshmi@example.com';

const DEMO_ACCOUNT = {
  id: 'usr_demo',
  name: 'K. Mahalakshmi',
  professionalName: 'Mahalakshmi Kommaranahalli',
  email: DEMO_EMAIL,
  password: 'demo123456',
  role: 'CSE 3rd Year | AI & Full-Stack Developer',
  avatarText: 'KM',
  location: 'Davanagere, Karnataka, India',
  college: 'Jain Institute of Technology, Davanagere',
  cgpa: '8.6 (Second Year)',
  github: 'https://github.com/mahalakshmi-kommaranahalli',
  portfolio: 'https://mahalakshmi-kommaranahalli.github.io/',
  linkedin: 'https://www.linkedin.com/in/mahalakshmi-kommaranahalli-06aba0341/',
  instagram: 'https://www.instagram.com/its_me_mahaaaa__/',
  createdAt: '2024-08-01T00:00:00Z',
  preferences: {
    autoExtract: true,
    confidenceThreshold: 0.75,
    retrievalTopK: 5,
    conflictDetection: true,
    theme: 'light'
  }
};

const DEMO_INITIAL_MEMORIES = [
  // --- Professional Identity & Education ---
  {
    id: 'mem_identity_profile',
    category: 'personal',
    content: 'Professional Identity: K. Mahalakshmi (Mahalakshmi Kommaranahalli), based in Davanagere, Karnataka, India. B.E. Computer Science & Engineering student at Jain Institute of Technology, Davanagere. GitHub: https://github.com/mahalakshmi-kommaranahalli (38 public repositories, Pull Shark & YOLO badges), Portfolio: https://mahalakshmi-kommaranahalli.github.io/, LinkedIn: https://www.linkedin.com/in/mahalakshmi-kommaranahalli-06aba0341/, Instagram: @its_me_mahaaaa__.',
    confidence: 0.99,
    status: 'active',
    source: 'Technical Profile 2026',
    createdAt: '2026-11-25T10:00:00Z',
    updatedAt: '2026-11-25T10:00:00Z',
    validFrom: '2024-01-01',
    importance: 5,
    tags: ['identity', 'profile', 'github', 'portfolio', 'linkedin', 'davanagere']
  },
  {
    id: 'mem_edu_be_jitd',
    category: 'education',
    content: 'Bachelor of Engineering in Computer Science and Engineering (CSE) at Jain Institute of Technology, Davanagere (VTU affiliated). Academic Period: 2024 – Present (Currently 3rd Year). Second-Year Academic Performance: 8.6 CGPA.',
    confidence: 0.99,
    status: 'active',
    source: 'Academic Records',
    createdAt: '2026-11-25T10:01:00Z',
    updatedAt: '2026-11-25T10:01:00Z',
    validFrom: '2024-08-01',
    importance: 5,
    tags: ['education', 'cse', 'jit-davanagere', 'vtu', 'cgpa-8.6', 'btech']
  },
  {
    id: 'mem_edu_schooling',
    category: 'education',
    content: 'Pre-Engineering Academic Background: 10th Standard at Sri Gurudeva High School; 12th Standard (Pre-University Course - PUC) at Sir M V PU College.',
    confidence: 0.98,
    status: 'active',
    source: 'Educational History',
    createdAt: '2026-11-25T10:02:00Z',
    updatedAt: '2026-11-25T10:02:00Z',
    validFrom: '2022-06-01',
    importance: 4,
    tags: ['schooling', 'high-school', 'pu-college', 'foundational-education']
  },

  // --- Career Ambitions & Philosophy ---
  {
    id: 'mem_career_philosophy',
    category: 'career',
    content: 'Personal Developer Statement & Philosophy: "I believe in learning by building. Every project gives me an opportunity to explore something new, solve a problem, improve my skills, and turn an idea into reality. My engineering journey is about more than completing a degree. It is about curiosity, experimentation, teamwork, mentorship, and continuous improvement. KEEP LEARNING. KEEP BUILDING. KEEP GROWING."',
    confidence: 0.99,
    status: 'active',
    source: 'Developer Statement',
    createdAt: '2026-11-25T10:03:00Z',
    updatedAt: '2026-11-25T10:03:00Z',
    validFrom: '2026-11-25',
    importance: 5,
    tags: ['philosophy', 'learning-by-building', 'mindset', 'career-vision']
  },
  {
    id: 'mem_career_ambitions',
    category: 'career',
    content: 'Career Ambition: Aiming to become a high-impact Software Development Engineer and AI Innovator building scalable, accessible, and meaningful real-world digital solutions across Full-Stack Web Development, Artificial Intelligence, Machine Learning, and IoT.',
    confidence: 0.98,
    status: 'active',
    source: 'Professional Goals',
    createdAt: '2026-11-25T10:04:00Z',
    updatedAt: '2026-11-25T10:04:00Z',
    validFrom: '2026-09-01',
    importance: 5,
    tags: ['career-goal', 'software-engineer', 'ai-ml', 'full-stack', 'impact']
  },

  // --- Hackathon Achievements ---
  {
    id: 'mem_achieve_cit_hackathon',
    category: 'achievements',
    content: 'CIT Hackathon 2026 Achievement: Secured TOP 8 RANKING AMONG 178 PARTICIPATING TEAMS. Built the "Student Risk Identification and Educator Support System" tackling the challenge of supporting students at risk of falling behind using explainable decision support, attendance metrics, and academic analytics.',
    confidence: 0.99,
    status: 'active',
    source: 'CIT Hackathon 2026 Results',
    createdAt: '2026-11-25T10:05:00Z',
    updatedAt: '2026-11-25T10:05:00Z',
    validFrom: '2026-03-15',
    importance: 5,
    tags: ['cit-hackathon-2026', 'top-8-award', 'student-risk-ai', 'hackathon-winner']
  },
  {
    id: 'mem_achieve_sih_hackathon',
    category: 'achievements',
    content: 'Smart India Hackathon Preparation: Researched and developed SIH 26001 "Landslide Sentinel AI" for early risk monitoring, alongside exploring TRUST-VISION, weather information trust, blockchain certificates, and AI-based legal summarization.',
    confidence: 0.95,
    status: 'active',
    source: 'Hackathon Submission & Research',
    createdAt: '2026-11-25T10:06:00Z',
    updatedAt: '2026-11-25T10:06:00Z',
    validFrom: '2026-08-10',
    importance: 4,
    tags: ['sih-26001', 'hackathon', 'smart-india-hackathon', 'ai-research']
  },
  {
    id: 'mem_achieve_github_badges',
    category: 'achievements',
    content: 'GitHub Badges & Activity: Earned "Pull Shark" and "YOLO" achievements on GitHub. Active contributor maintaining 38 public repositories demonstrating consistent building, code craftsmanship, and version control discipline.',
    confidence: 0.97,
    status: 'active',
    source: 'GitHub Profile Inspection',
    createdAt: '2026-11-25T10:07:00Z',
    updatedAt: '2026-11-25T10:07:00Z',
    validFrom: '2026-10-01',
    importance: 4,
    tags: ['github-badges', 'pull-shark', 'yolo', 'open-source', '38-repos']
  },

  // --- Featured Projects ---
  {
    id: 'mem_proj_arrowhead',
    category: 'projects',
    content: 'Project 01: ARROWHEAD — Infinite Logic. Minimalist JavaScript infinite logic puzzle game where players solve arrow patterns, test observation speed, accuracy, and sequence navigation. Features player dashboard, high scores, accuracy statistics, and game timer. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/arrowhead/.',
    confidence: 0.98,
    status: 'active',
    source: 'Project Repository arrowhead',
    createdAt: '2026-11-25T10:08:00Z',
    updatedAt: '2026-11-25T10:08:00Z',
    validFrom: '2026-04-10',
    importance: 4,
    tags: ['game-dev', 'javascript', 'arrowhead', 'github-pages', 'interactive']
  },
  {
    id: 'mem_proj_memorymaster',
    category: 'projects',
    content: 'Project 02: MEMORY MASTER GAME — Memoryverse. Interactive educational technology memory game designed to boost concentration and tech knowledge across 20 levels covering Web Tech, AI, Programming, and Cloud Computing with achievement badges and timer. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/memory-master-game/.',
    confidence: 0.98,
    status: 'active',
    source: 'Project Repository memory-master-game',
    createdAt: '2026-11-25T10:09:00Z',
    updatedAt: '2026-11-25T10:09:00Z',
    validFrom: '2026-05-18',
    importance: 4,
    tags: ['edtech', 'memory-game', 'javascript', 'gamification', 'github-pages']
  },
  {
    id: 'mem_proj_landslide_ai',
    category: 'projects',
    content: 'Project 03: Landslide Sentinel AI (SIH 26001). Machine learning early-warning solution analyzing environmental indicators to forecast landslide risks. Developed with Python Flask backend, evaluating Naive Bayes and Support Vector Machines (SVM) with an initial 85.71% accuracy on experimental validation sets. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/Landslide-Sentinel-AI/.',
    confidence: 0.97,
    status: 'active',
    source: 'Project Repository Landslide-Sentinel-AI',
    createdAt: '2026-11-25T10:10:00Z',
    updatedAt: '2026-11-25T10:10:00Z',
    validFrom: '2026-08-15',
    importance: 5,
    tags: ['ai-ml', 'python-flask', 'svm', 'naive-bayes', 'sih-26001', 'disaster-tech']
  },
  {
    id: 'mem_proj_mj_hospital',
    category: 'projects',
    content: 'Project 04: MJ Hospital. Healthcare hospital management web application designed for digital patient records, department coordination, and online clinic operations. Deployed on Vercel: https://mj-hospital.vercel.app/.',
    confidence: 0.95,
    status: 'active',
    source: 'Vercel Deployment',
    createdAt: '2026-11-25T10:11:00Z',
    updatedAt: '2026-11-25T10:11:00Z',
    validFrom: '2026-07-20',
    importance: 4,
    tags: ['healthcare', 'hospital-management', 'web-app', 'vercel']
  },
  {
    id: 'mem_proj_campushub_erp',
    category: 'projects',
    content: 'Project 05: CampusHub ERP. Comprehensive college management and student services platform featuring student/faculty directories, attendance tracking, fee management, academic grading, and leave workflows. Built with React, PHP, Flask, MySQL, and REST APIs. Deployed on Vercel: https://campus-hub-erp-xi.vercel.app/.',
    confidence: 0.96,
    status: 'active',
    source: 'Vercel Deployment & Codebase',
    createdAt: '2026-11-25T10:12:00Z',
    updatedAt: '2026-11-25T10:12:00Z',
    validFrom: '2026-06-12',
    importance: 5,
    tags: ['erp', 'campushub', 'react', 'flask', 'mysql', 'college-management']
  },
  {
    id: 'mem_proj_vtu_3rd_sem',
    category: 'projects',
    content: 'Project 06: VTU 2025 – 3rd Semester Study Hub. Dedicated academic platform for VTU 2025 Scheme CSE and ISE students offering 5 theory subjects, 5 modules per subject, practical syllabus, model questions, and video lecture search. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/VTU-2025-3rd-Sem-Notes/.',
    confidence: 0.98,
    status: 'active',
    source: 'GitHub Repository VTU-2025-3rd-Sem-Notes',
    createdAt: '2026-11-25T10:13:00Z',
    updatedAt: '2026-11-25T10:13:00Z',
    validFrom: '2025-11-10',
    importance: 4,
    tags: ['vtu-notes', '3rd-sem-cse', 'edtech', 'academic-hub', 'github-pages']
  },
  {
    id: 'mem_proj_assignments_portal',
    category: 'projects',
    content: 'Project 07: ASSIGNMENTS – Study Assignment Portal. Centralized academic portal organizing engineering assignments with direct document downloads across Computer Networks, Research Methodology, AI (BCS515B), and Theory of Computation. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/ASSIGNMENTS/.',
    confidence: 0.97,
    status: 'active',
    source: 'GitHub Repository ASSIGNMENTS',
    createdAt: '2026-11-25T10:14:00Z',
    updatedAt: '2026-11-25T10:14:00Z',
    validFrom: '2026-02-14',
    importance: 4,
    tags: ['assignments', 'academic-portal', 'vtu-coursework', 'github-pages']
  },
  {
    id: 'mem_proj_webtech_lab',
    category: 'projects',
    content: 'Project 08: Web Technology Programs. Collection of practical laboratory implementations including HTML basic tags, timetable structures with rowspan/colspan, advanced CSS selectors, and validated registration forms. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/Web-Technology-Programs/.',
    confidence: 0.98,
    status: 'active',
    source: 'GitHub Repository Web-Technology-Programs',
    createdAt: '2026-11-25T10:15:00Z',
    updatedAt: '2026-11-25T10:15:00Z',
    validFrom: '2025-12-05',
    importance: 3,
    tags: ['web-technology', 'lab-programs', 'html-css-js', 'github-pages']
  },
  {
    id: 'mem_proj_code_blaster_exe',
    category: 'projects',
    content: 'Project 09: Code Blaster.exe – Teachers\' Day 2026. Interactive digital tribute to mentor Pruthviraj Mundargi honoring guidance and inspiration to learn beyond the classroom. Features secret-code authentication, interactive memory timeline, personal tribute notes, and a 5-challenge bug-hunting debugging mission. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/code-blaster-teachers-day/.',
    confidence: 0.99,
    status: 'active',
    source: 'GitHub Repository code-blaster-teachers-day',
    createdAt: '2026-11-25T10:16:00Z',
    updatedAt: '2026-11-25T10:16:00Z',
    validFrom: '2026-09-05',
    importance: 5,
    tags: ['code-blaster', 'teachers-day', 'tribute', 'mentorship', 'interactive-gamification']
  },
  {
    id: 'mem_proj_portfolio_site',
    category: 'projects',
    content: 'Project 10: Personal Portfolio Website. Central online identity showcasing technical background, education, projects, skills, experience, and certifications (inspired by mentor Pruthviraj Mundargi\'s portfolio). Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/.',
    confidence: 0.99,
    status: 'active',
    source: 'GitHub Pages Deployment',
    createdAt: '2026-11-25T10:17:00Z',
    updatedAt: '2026-11-25T10:17:00Z',
    validFrom: '2026-03-01',
    importance: 5,
    tags: ['portfolio', 'personal-branding', 'web-development', 'github-pages']
  },
  {
    id: 'mem_proj_skillgraph_ai',
    category: 'projects',
    content: 'Project 11: SkillGraph AI. AI-driven skill mapping and career path visualizer developed to model interconnected technology competencies and personalized learning pathways. Deployed on Netlify: https://skillgraph-ai.netlify.app/.',
    confidence: 0.96,
    status: 'active',
    source: 'Netlify Deployment',
    createdAt: '2026-11-25T10:18:00Z',
    updatedAt: '2026-11-25T10:18:00Z',
    validFrom: '2026-07-01',
    importance: 4,
    tags: ['skillgraph-ai', 'career-mapping', 'ai-skills', 'netlify']
  },
  {
    id: 'mem_proj_orbitx',
    category: 'projects',
    content: 'Project 12: ORBITX. Interactive creative web experience exploring dynamic browser-based animations and interactive UI paradigms. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/orbitx/.',
    confidence: 0.95,
    status: 'active',
    source: 'GitHub Repository orbitx',
    createdAt: '2026-11-25T10:19:00Z',
    updatedAt: '2026-11-25T10:19:00Z',
    validFrom: '2026-04-01',
    importance: 3,
    tags: ['orbitx', 'interactive-web', 'creative-frontend', 'github-pages']
  },
  {
    id: 'mem_proj_student_risk_sys',
    category: 'projects',
    content: 'Project 13: Student Risk Identification System. CIT Hackathon 2026 top-8 solution analyzing attendance trends, test scores, and engagement signals to deliver explainable decision-support alerts for educators. Deployed on Netlify: https://extraordinary-tanuki-4887a8.netlify.app/.',
    confidence: 0.99,
    status: 'active',
    source: 'Netlify Deployment & CIT Hackathon',
    createdAt: '2026-11-25T10:20:00Z',
    updatedAt: '2026-11-25T10:20:00Z',
    validFrom: '2026-03-12',
    importance: 5,
    tags: ['student-risk-ai', 'cit-hackathon', 'educator-tool', 'decision-support', 'netlify']
  },
  {
    id: 'mem_proj_vtu_5th_sem',
    category: 'projects',
    content: 'Project 14: VTU 5th Semester CSE Notes. Academic resource platform cataloging 5th semester coursework: BCS501 (SE & PM), BCS502 (Computer Networks), BCS503 (Theory of Computation), BCS515B (AI), and BCSL504 Lab.',
    confidence: 0.96,
    status: 'active',
    source: 'GitHub Repository VTU-2022-CSE-5th-Sem-Syllabus',
    createdAt: '2026-11-25T10:21:00Z',
    updatedAt: '2026-11-25T10:21:00Z',
    validFrom: '2026-09-20',
    importance: 4,
    tags: ['vtu-notes', '5th-sem-cse', 'syllabus', 'academic-hub']
  },
  {
    id: 'mem_proj_jit_complete_erp',
    category: 'projects',
    content: 'Project 15: JIT Complete ERP (SQLite Version). Specialized college ERP tailored to Jain Institute of Technology workflow requirements with role-based dashboards for Students, Faculty, and HODs, fee tracking, leave approvals, and attendance. Built with React, Flask, SQLite, and REST APIs.',
    confidence: 0.96,
    status: 'active',
    source: 'Internal Project Desktop/JIT-Complete-ERP',
    createdAt: '2026-11-25T10:22:00Z',
    updatedAt: '2026-11-25T10:22:00Z',
    validFrom: '2026-05-01',
    importance: 4,
    tags: ['jit-erp', 'sqlite', 'react-flask', 'college-software']
  },
  {
    id: 'mem_proj_mahadev_dashboard',
    category: 'projects',
    content: 'Project 16: MahaDev Student Dashboard. Personal student productivity interface featuring a built-in 25-minute Pomodoro focus timer, theme customization, and personalized daily workflow organizers.',
    confidence: 0.94,
    status: 'active',
    source: 'Personal Productivity Tools',
    createdAt: '2026-11-25T10:23:00Z',
    updatedAt: '2026-11-25T10:23:00Z',
    validFrom: '2026-06-05',
    importance: 3,
    tags: ['productivity', 'pomodoro-timer', 'dashboard', 'student-tool']
  },
  {
    id: 'mem_proj_maha_ai_assistant',
    category: 'projects',
    content: 'Project 17: MahaAI — Personal AI Assistant. Voice-activated Android assistant concept inspired by Siri and Alexa, designed with wake-word detection, voice command processing, and a hybrid edge/cloud AI architecture.',
    confidence: 0.93,
    status: 'active',
    source: 'Mobile AI Exploration',
    createdAt: '2026-11-25T10:24:00Z',
    updatedAt: '2026-11-25T10:24:00Z',
    validFrom: '2026-08-01',
    importance: 4,
    tags: ['mahaai', 'voice-assistant', 'android', 'speech-ai', 'concept']
  },
  {
    id: 'mem_proj_kannada_with_maha',
    category: 'projects',
    content: 'Project 18: Kannada with Maha. Multilingual real-time communication platform bridging regional linguistic barriers through authenticated public chat, voice messages, and bidirectional automated Telugu <-> Kannada translation.',
    confidence: 0.94,
    status: 'active',
    source: 'Multilingual Chat Architecture',
    createdAt: '2026-11-25T10:25:00Z',
    updatedAt: '2026-11-25T10:25:00Z',
    validFrom: '2026-09-10',
    importance: 4,
    tags: ['kannada-with-maha', 'multilingual', 'translation', 'telugu-kannada', 'chat']
  },
  {
    id: 'mem_proj_lora_smart_irrigation',
    category: 'projects',
    content: 'Project 19: LoRa-Based Smart Irrigation. IoT embedded engineering project featuring long-range wireless telemetry using ESP32 microcontrollers, LoRa transceiver modules, OLED status displays, and soil moisture sensor nodes for automated precision farming.',
    confidence: 0.97,
    status: 'active',
    source: 'IoT Hardware Prototyping',
    createdAt: '2026-11-25T10:26:00Z',
    updatedAt: '2026-11-25T10:26:00Z',
    validFrom: '2026-04-20',
    importance: 5,
    tags: ['iot', 'esp32', 'lora', 'smart-irrigation', 'embedded-systems', 'sensors']
  },

  // --- Technical Skills ---
  {
    id: 'mem_skills_core_languages',
    category: 'skills',
    content: 'Core Programming Languages: Experienced in C, Python, Java, and JavaScript for algorithmic problem-solving, backend APIs, IoT firmware, and interactive frontend applications.',
    confidence: 0.98,
    status: 'active',
    source: 'Technical Stack Assessment',
    createdAt: '2026-11-25T10:27:00Z',
    updatedAt: '2026-11-25T10:27:00Z',
    validFrom: '2024-09-01',
    importance: 4,
    tags: ['c', 'python', 'java', 'javascript', 'core-languages']
  },
  {
    id: 'mem_skills_frontend_web',
    category: 'skills',
    content: 'Frontend & Web Development: Proficient in HTML5, CSS3, Modern JavaScript (ES6+), React, Vite, responsive UI design, component-driven development, and lightweight SPA architecture.',
    confidence: 0.98,
    status: 'active',
    source: 'Technical Stack Assessment',
    createdAt: '2026-11-25T10:28:00Z',
    updatedAt: '2026-11-25T10:28:00Z',
    validFrom: '2025-01-01',
    importance: 4,
    tags: ['html5', 'css3', 'javascript', 'react', 'vite', 'frontend']
  },
  {
    id: 'mem_skills_backend_databases',
    category: 'skills',
    content: 'Backend & Database Engineering: Experienced in Python Flask, PHP, RESTful API architecture, MySQL, SQLite, PostgreSQL, SQL querying, schema normalization, and database connectivity.',
    confidence: 0.97,
    status: 'active',
    source: 'Technical Stack Assessment',
    createdAt: '2026-11-25T10:29:00Z',
    updatedAt: '2026-11-25T10:29:00Z',
    validFrom: '2025-06-01',
    importance: 4,
    tags: ['flask', 'php', 'mysql', 'sqlite', 'postgresql', 'rest-apis', 'sql']
  },
  {
    id: 'mem_skills_ai_ml_models',
    category: 'skills',
    content: 'Artificial Intelligence & Machine Learning: Applied machine learning fundamentals with Scikit-learn, Naive Bayes classifiers, Support Vector Machines (SVM), data preprocessing, and predictive analytics.',
    confidence: 0.96,
    status: 'active',
    source: 'Technical Stack Assessment',
    createdAt: '2026-11-25T10:30:00Z',
    updatedAt: '2026-11-25T10:30:00Z',
    validFrom: '2026-01-01',
    importance: 4,
    tags: ['machine-learning', 'scikit-learn', 'svm', 'naive-bayes', 'predictive-analytics']
  },
  {
    id: 'mem_skills_iot_hardware',
    category: 'skills',
    content: 'IoT & Embedded Engineering: Skilled with ESP32 microcontrollers, LoRa wireless communication protocols, Arduino IDE, OLED display interfaces, and environmental sensor integration.',
    confidence: 0.96,
    status: 'active',
    source: 'Hardware Engineering Lab',
    createdAt: '2026-11-25T10:31:00Z',
    updatedAt: '2026-11-25T10:31:00Z',
    validFrom: '2026-02-01',
    importance: 4,
    tags: ['iot', 'esp32', 'lora', 'arduino', 'sensors', 'embedded']
  },
  {
    id: 'mem_skills_cloud_deployment',
    category: 'skills',
    content: 'Cloud & Deployment Ecosystem: Proven hands-on track record deploying web applications across GitHub Pages, Netlify, Vercel, and Railway; actively learning Docker containerization and modern cloud infrastructure.',
    confidence: 0.98,
    status: 'active',
    source: 'Deployment Track Record',
    createdAt: '2026-11-25T10:32:00Z',
    updatedAt: '2026-11-25T10:32:00Z',
    validFrom: '2026-03-01',
    importance: 4,
    tags: ['github-pages', 'netlify', 'vercel', 'railway', 'docker', 'devops']
  },

  // --- Mentorship & Key Milestones ---
  {
    id: 'mem_event_first_meeting_mentor',
    category: 'events',
    content: 'Milestone: 15 September 2025 — First class at Jain Institute of Technology, Davanagere (JITD) and first meeting with mentor Pruthviraj Mundargi, initiating an impactful journey of technical guidance and hands-on coding.',
    confidence: 0.99,
    status: 'active',
    source: 'Mentorship Timeline',
    createdAt: '2026-11-25T10:33:00Z',
    updatedAt: '2026-11-25T10:33:00Z',
    validFrom: '2025-09-15',
    importance: 5,
    tags: ['mentorship', 'jitd', 'pruthviraj-mundargi', 'first-meeting', 'milestone']
  },
  {
    id: 'mem_event_code_blaster_event',
    category: 'events',
    content: 'Milestone: 19 September 2025 — Code Blaster college event at JITD. A transformative experience that ignited the drive to learn beyond syllabus boundaries and build independent real-world software.',
    confidence: 0.99,
    status: 'active',
    source: 'Mentorship Timeline',
    createdAt: '2026-11-25T10:34:00Z',
    updatedAt: '2026-11-25T10:34:00Z',
    validFrom: '2025-09-19',
    importance: 5,
    tags: ['code-blaster-event', 'jitd', 'inspiration', 'milestone']
  },
  {
    id: 'mem_event_first_tea_mentoring',
    category: 'events',
    content: 'Milestone: 29 April 2026 — "First Tea" mentoring session with mentor Pruthviraj Mundargi, discussing technical growth, problem-solving mindset, and future aspirations.',
    confidence: 0.99,
    status: 'active',
    source: 'Mentorship Timeline',
    createdAt: '2026-11-25T10:35:00Z',
    updatedAt: '2026-11-25T10:35:00Z',
    validFrom: '2026-04-29',
    importance: 4,
    tags: ['first-tea', 'mentorship', 'dialogue', 'milestone']
  },
  {
    id: 'mem_event_teachers_day_tribute',
    category: 'events',
    content: 'Milestone: 05 September 2026 — Released the "Code Blaster.exe – Teachers\' Day 2026" digital tribute, celebrating mentorship, debugging challenges, and the lifelong motivation to build.',
    confidence: 0.99,
    status: 'active',
    source: 'Mentorship Timeline',
    createdAt: '2026-11-25T10:36:00Z',
    updatedAt: '2026-11-25T10:36:00Z',
    validFrom: '2026-09-05',
    importance: 5,
    tags: ['teachers-day-2026', 'code-blaster-tribute', 'mentorship', 'celebration']
  },

  // --- Future Goals & Plans ---
  {
    id: 'mem_goals_future_roadmap',
    category: 'goals',
    content: 'Future Development Goals: (1) Advance expertise in state-of-the-art AI & ML architectures; (2) Master full-stack system design and cloud deployments with Docker; (3) Engineer production mobile apps including the MahaAI voice assistant; (4) Expand IoT and embedded intelligence solutions; (5) Build impactful open-source tools that empower education and students.',
    confidence: 0.99,
    status: 'active',
    source: 'Future Roadmap',
    createdAt: '2026-11-25T10:37:00Z',
    updatedAt: '2026-11-25T10:37:00Z',
    validFrom: '2026-11-25',
    importance: 5,
    tags: ['future-goals', 'ai-engineering', 'full-stack', 'docker', 'iot', 'open-source']
  },
  {
    id: 'mem_preferences_workstyle',
    category: 'preferences',
    content: 'Workstyle & Coding Preferences: Thrives in high-focus deep work sessions, embraces clean high-contrast light-themed user interfaces, modular architecture, and structured technical documentation.',
    confidence: 0.95,
    status: 'active',
    source: 'Developer Profile',
    createdAt: '2026-11-25T10:38:00Z',
    updatedAt: '2026-11-25T10:38:00Z',
    validFrom: '2026-10-18',
    importance: 3,
    tags: ['workstyle', 'preferences', 'deep-work', 'clean-code', 'light-mode']
  }
];

const DEMO_INITIAL_CONVERSATIONS = [
  {
    id: 'conv_profile_sync',
    title: 'Complete Technical Profile & Memory Synchronization',
    updatedAt: '2026-11-25T10:30:00Z',
    messages: [
      {
        id: 'msg_sync_1',
        role: 'user',
        text: 'Hi! Here is my complete technical profile, project portfolio, 38 GitHub repositories, CIT Hackathon Top-8 win, and mentorship history. Please add everything to my memory bank!',
        timestamp: '2026-11-25T10:28:00Z'
      },
      {
        id: 'msg_sync_2',
        role: 'assistant',
        text: 'Hello Mahalakshmi! 🎉 I have successfully ingested and structured your complete technical profile into your Life Memory AI bank.\n\nHere is what I have indexed:\n- **Identity & Education**: 3rd Year CSE at Jain Institute of Technology, Davanagere with an impressive 8.6 CGPA, and your background at Sri Gurudeva High School & Sir M V PU College.\n- **Featured Projects**: ARROWHEAD, Memory Master Game (Memoryverse), Landslide Sentinel AI (SIH 26001), CampusHub ERP, MJ Hospital, VTU Study Hubs, Code Blaster tribute, SkillGraph AI, Student Risk Identification System, and LoRa Smart Irrigation.\n- **Hackathons & Milestones**: Your standout **Top 8 finish among 178 teams at CIT Hackathon 2026**, your GitHub achievements (Pull Shark, YOLO, 38 repos), and meaningful mentorship milestones with Pruthviraj Mundargi.\n- **Engineering Philosophy**: "Learning by building. KEEP LEARNING. KEEP BUILDING. KEEP GROWING."\n\nAll nodes and relationship links have been mapped in your Knowledge Graph, and all chronological milestones are active in your Timeline!',
        timestamp: '2026-11-25T10:28:05Z',
        extractedMemories: [
          'mem_identity_profile', 'mem_edu_be_jitd', 'mem_achieve_cit_hackathon', 
          'mem_proj_arrowhead', 'mem_proj_landslide_ai', 'mem_career_philosophy'
        ],
        groundedMemories: [
          'mem_identity_profile', 'mem_edu_be_jitd', 'mem_achieve_cit_hackathon', 
          'mem_skills_core_languages', 'mem_career_philosophy'
        ]
      },
      {
        id: 'msg_sync_3',
        role: 'user',
        text: 'What do you remember about my college performance and hackathon achievement?',
        timestamp: '2026-11-25T10:29:30Z'
      },
      {
        id: 'msg_sync_4',
        role: 'assistant',
        text: 'You are pursuing your Bachelor of Engineering in Computer Science and Engineering at Jain Institute of Technology, Davanagere, currently in your 3rd year with a strong 8.6 CGPA from your second year. At the CIT Hackathon 2026, you achieved a Top 8 position out of 178 participating teams by building the Student Risk Identification and Educator Support System!',
        timestamp: '2026-11-25T10:29:33Z',
        extractedMemories: [],
        groundedMemories: ['mem_edu_be_jitd', 'mem_achieve_cit_hackathon', 'mem_proj_student_risk_sys']
      }
    ]
  }
];

const DEMO_INITIAL_RELATIONSHIPS = [
  { source: 'mem_edu_be_jitd', target: 'mem_skills_core_languages', type: 'enabled_skill', label: 'Curriculum Foundation' },
  { source: 'mem_skills_core_languages', target: 'mem_skills_frontend_web', type: 'expanded_to', label: 'Web Tech Expansion' },
  { source: 'mem_skills_core_languages', target: 'mem_skills_backend_databases', type: 'expanded_to', label: 'Server Engineering' },
  { source: 'mem_skills_core_languages', target: 'mem_proj_arrowhead', type: 'applied_in', label: 'Built Logic Engine' },
  { source: 'mem_skills_frontend_web', target: 'mem_proj_memorymaster', type: 'applied_in', label: 'Developed 20 Levels' },
  { source: 'mem_skills_backend_databases', target: 'mem_proj_campushub_erp', type: 'applied_in', label: 'Designed DB & APIs' },
  { source: 'mem_skills_backend_databases', target: 'mem_proj_jit_complete_erp', type: 'applied_in', label: 'SQLite & Flask Roles' },
  { source: 'mem_skills_ai_ml_models', target: 'mem_proj_landslide_ai', type: 'applied_in', label: 'SVM & Naive Bayes' },
  { source: 'mem_skills_ai_ml_models', target: 'mem_proj_student_risk_sys', type: 'applied_in', label: 'Risk Analytics Model' },
  { source: 'mem_proj_student_risk_sys', target: 'mem_achieve_cit_hackathon', type: 'led_to', label: 'Top 8 / 178 Teams' },
  { source: 'mem_proj_landslide_ai', target: 'mem_achieve_sih_hackathon', type: 'submitted_to', label: 'SIH 26001 Track' },
  { source: 'mem_skills_iot_hardware', target: 'mem_proj_lora_smart_irrigation', type: 'applied_in', label: 'ESP32 & LoRa Nodes' },
  { source: 'mem_event_first_meeting_mentor', target: 'mem_event_code_blaster_event', type: 'sparked', label: 'Coding Drive' },
  { source: 'mem_event_code_blaster_event', target: 'mem_proj_code_blaster_exe', type: 'inspired', label: 'Teachers Day Tribute' },
  { source: 'mem_proj_code_blaster_exe', target: 'mem_event_teachers_day_tribute', type: 'celebrated_on', label: 'Launched Tribute' },
  { source: 'mem_skills_frontend_web', target: 'mem_proj_portfolio_site', type: 'built', label: 'Online Showcase' },
  { source: 'mem_proj_portfolio_site', target: 'mem_identity_profile', type: 'showcases', label: 'Public Identity' },
  { source: 'mem_skills_cloud_deployment', target: 'mem_achieve_github_badges', type: 'demonstrated_by', label: 'Pull Shark & YOLO' },
  { source: 'mem_career_philosophy', target: 'mem_career_ambitions', type: 'guides', label: 'Engineering Vision' },
  { source: 'mem_achieve_cit_hackathon', target: 'mem_career_ambitions', type: 'validates', label: 'Technical Execution' },
  { source: 'mem_career_ambitions', target: 'mem_goals_future_roadmap', type: 'targets', label: 'Continuous Growth' }
];

const DEMO_INITIAL_DOCUMENTS = [
  {
    id: 'doc_profile_2026',
    filename: 'K_Mahalakshmi_Technical_Profile_2026.pdf',
    size: '2.1 MB',
    pages: 18,
    uploadedAt: '2026-11-25T10:00:00Z',
    status: 'processed',
    extractedMemoriesCount: 31,
    summary: 'Complete technical dossier detailing 22 projects, 38 GitHub repositories, CIT Hackathon Top-8 award, 8.6 CGPA at JIT Davanagere, LoRa IoT smart irrigation, and mentorship milestones.'
  },
  {
    id: 'doc_cit_hackathon_2026',
    filename: 'CIT_Hackathon_Student_Risk_System.pdf',
    size: '1.2 MB',
    pages: 10,
    uploadedAt: '2026-11-25T10:05:00Z',
    status: 'processed',
    extractedMemoriesCount: 4,
    summary: 'Technical architecture of the Student Risk Identification System presented at CIT Hackathon 2026: attendance analytics, risk indicators, and explainable educator dashboard.'
  }
];

// --- Registered Accounts Management ---
function getRegisteredAccounts() {
  const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
  let accounts = [];
  if (raw) {
    try { accounts = JSON.parse(raw); } catch (e) { accounts = []; }
  }
  // Guarantee demo account is in the registry with up-to-date profile
  const demoIdx = accounts.findIndex(a => (a.email || '').toLowerCase() === DEMO_EMAIL);
  if (demoIdx >= 0) {
    accounts[demoIdx] = { ...DEMO_ACCOUNT, ...accounts[demoIdx], name: DEMO_ACCOUNT.name, role: DEMO_ACCOUNT.role, avatarText: DEMO_ACCOUNT.avatarText };
  } else {
    accounts.unshift(DEMO_ACCOUNT);
  }
  localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
  return accounts;
}

function saveRegisteredAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
}

function getUserStoreKey(email) {
  const safeEmail = (email || 'anonymous').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `lifememory_userstore_${safeEmail}`;
}

function getCurrentUserEmail() {
  const userRaw = localStorage.getItem('lifememory_user');
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u && u.email) return u.email.trim().toLowerCase();
    } catch (e) {}
  }
  const currentEmail = localStorage.getItem('lifememory_current_email');
  if (currentEmail) return currentEmail.trim().toLowerCase();
  return null;
}

function createFreshUserStore(user) {
  const firstName = (user.name || 'Friend').trim().split(' ')[0];
  return {
    version: DATASTORE_VERSION,
    user: {
      id: user.id || ('usr_' + Date.now()),
      name: user.name || 'New Member',
      email: (user.email || '').trim().toLowerCase(),
      avatarText: user.avatarText || 'U',
      role: user.role || 'Personal Account',
      preferences: user.preferences || {
        autoExtract: true,
        confidenceThreshold: 0.75,
        retrievalTopK: 5,
        conflictDetection: true,
        theme: 'light'
      }
    },
    memories: [],
    conversations: [
      {
        id: 'conv_welcome_' + Date.now(),
        title: 'Getting to Know You',
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg_welcome_' + Date.now(),
            role: 'assistant',
            text: `Hi ${firstName}! 👋 Welcome to Life Memory AI. I'm your personal AI companion.\n\nI'm designed to chat and interact with you like a real human friend, while remembering the details of your life that matter most to you.\n\nFeel free to talk to me about anything: where you live, what you do, your goals, hobbies, thoughts, or what's happening in your day. As we chat, I'll naturally remember what you share — and if anything in your life changes later on, just let me know and I'll keep track of how things evolved!\n\nHow are you feeling today?`,
            timestamp: new Date().toISOString(),
            extractedMemories: [],
            groundedMemories: []
          }
        ]
      }
    ],
    relationships: [],
    documents: []
  };
}

function initDataStore(targetEmail) {
  const email = (targetEmail || getCurrentUserEmail() || DEMO_EMAIL).toLowerCase();
  const key = getUserStoreKey(email);

  if (email === DEMO_EMAIL) {
    const demoData = {
      version: DATASTORE_VERSION,
      user: DEMO_ACCOUNT,
      memories: DEMO_INITIAL_MEMORIES,
      conversations: DEMO_INITIAL_CONVERSATIONS,
      relationships: DEMO_INITIAL_RELATIONSHIPS,
      documents: DEMO_INITIAL_DOCUMENTS
    };
    localStorage.setItem(key, JSON.stringify(demoData));
    localStorage.setItem('lifememory_user', JSON.stringify(DEMO_ACCOUNT));
    localStorage.setItem('lifememory_current_email', DEMO_EMAIL);
    return demoData;
  } else {
    const accounts = getRegisteredAccounts();
    const acc = accounts.find(a => a.email.toLowerCase() === email) || {
      id: 'usr_' + Date.now(),
      name: 'User',
      email: email,
      avatarText: 'U',
      role: 'Personal Account'
    };
    const fresh = createFreshUserStore(acc);
    localStorage.setItem(key, JSON.stringify(fresh));
    return fresh;
  }
}

function getDataStore(targetEmail) {
  const email = (targetEmail || getCurrentUserEmail() || DEMO_EMAIL).toLowerCase();
  const key = getUserStoreKey(email);
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.memories) && parsed.version === DATASTORE_VERSION) {
        return parsed;
      }
    } catch (e) {}
  }
  return initDataStore(email);
}

function saveDataStore(data, targetEmail) {
  const email = (targetEmail || (data.user && data.user.email) || getCurrentUserEmail() || DEMO_EMAIL).toLowerCase();
  const key = getUserStoreKey(email);
  data.version = DATASTORE_VERSION;
  localStorage.setItem(key, JSON.stringify(data));
}

function resetUserDataStore(email) {
  const target = (email || getCurrentUserEmail() || DEMO_EMAIL).toLowerCase();
  const key = getUserStoreKey(target);
  localStorage.removeItem(key);
  return initDataStore(target);
}

// Ensure accounts list and current profile are ready on script load
getRegisteredAccounts();
getDataStore(DEMO_EMAIL);

if (typeof window !== 'undefined') {
  window.getDataStore = getDataStore;
  window.saveDataStore = saveDataStore;
  window.resetUserDataStore = resetUserDataStore;
  window.getRegisteredAccounts = getRegisteredAccounts;
  window.saveRegisteredAccounts = saveRegisteredAccounts;
  window.createFreshUserStore = createFreshUserStore;
}
