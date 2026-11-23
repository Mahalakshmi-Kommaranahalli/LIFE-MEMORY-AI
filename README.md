# LIFE MEMORY AI
### Your Memories. Your Conversations. Your Personal AI.

> A production-grade, advanced AI personal cognitive assistant that remembers important facts from previous conversations, extracts structured knowledge automatically, connects related milestones in an interactive knowledge graph, and grounds all responses without ever hallucinating.

---

## 🌟 Visual Theme & Design Philosophy
Built from the ground up featuring an ultra-premium **Light Theme Design System**:
- **Backgrounds**: Slate 50 (`#F8FAFC`) with elevated pure white (`#FFFFFF`) cards and frosted glass highlights.
- **Accents**: Royal Indigo (`#6366F1`), Vibrant Violet (`#8B5CF6`), Electric Sky (`#0EA5E9`), and Emerald Green (`#10B981`).
- **Typography**: Clean, high-contrast typography (`#0F172A`) powered by Plus Jakarta Sans / Inter.
- **Category Badges**: Pastel badges for Career, Education, Goals, Projects, Skills, Preferences, Achievements, Events, Plans, and Personal.

---

## 🚀 Application Pages (Phase 1 Implemented)

1. **Landing Page (`frontend/index.html`)**
   - High-impact hero section, live cognitive loop preview, feature cards, 10-step memory engine walkthrough, and technology showcase.
2. **Authentication (`frontend/login.html` & `frontend/register.html`)**
   - Split card with value propositions, password visibility toggles, form validation, password strength meter, and demo quick-sign-in.
3. **Dashboard (`frontend/dashboard.html`)**
   - Real-time stat counters (Memories, Conversations, Categories, Goals), weekly activity chart (Chart.js), category doughnut distribution, recently captured memories, and monthly synthesis.
4. **Main Chat Assistant (`frontend/chat.html`)**
   - Primary interaction area with persistent conversation history, new conversation generator, user/AI message bubbles with timestamps and citations, typing indicator, and a live **Grounded Memory Drawer** showing the exact memories referenced with confidence scores.
5. **Memory Explorer (`frontend/memories.html`)**
   - Complete memory management: category filtering pills, semantic search, sorting (date/confidence/importance), status filter, Add Memory modal, Edit Memory modal, and permanent delete actions.
6. **Chronological Timeline (`frontend/timeline.html`)**
   - Interactive vertical timeline tracing academic achievements, career milestones, project progress, and life events chronologically.
7. **Relationship Knowledge Graph (`frontend/graph.html`)**
   - NetworkX-compatible interactive graph showing interconnected nodes (Skills &rarr; Projects &rarr; Hackathon Wins &rarr; Career Goals) with physics simulation, zoom/fit controls, and node inspection cards.
8. **Personal Insights (`frontend/insights.html`)**
   - Executive weekly, monthly, and cumulative summaries, goal progress velocity bars, skill mastery matrix, and frequently discussed topics.
9. **Settings & Document Intelligence (`frontend/settings.html`)**
   - Profile management, cognitive engine preferences (confidence slider, top-k retrieval, conflict detection), PyMuPDF document upload and text extraction dropzone, password security, and JSON data export / wipe data tools.

---

## 🧠 The 10-Step Memory Engine Pipeline

```
User Query / Message
       │
       ▼
 [STEP 1] Receive Conversation
       │
       ▼
 [STEP 2] Save Raw Message in PostgreSQL
       │
       ▼
 [STEP 3] LLM Deep Fact Analysis
       │
       ▼
 [STEP 4] Extract Meaningful Knowledge
       │
       ▼
 [STEP 5] Convert into Structured JSON (10 Categories)
       │
       ▼
 [STEP 6] Schema & Boundary Validation
       │
       ▼
 [STEP 7] Detect Duplicates, Contradictions & Historical Validity
       │
       ▼
 [STEP 8] Generate High-Dimensional Vector Embeddings
       │
       ▼
 [STEP 9] Store Approved Vectors in pgvector
       │
       ▼
 [STEP 10] Ground Future Responses via Semantic & Keyword Retrieval
```

---

## 💻 How to Run (Phase 1 Frontend Foundation)

You can launch the frontend instantly with any standard static server:

```powershell
# Using Python
& "C:\Users\MAHALAKSHMI K\AppData\Local\Python\pythoncore-3.14-64\python.exe" -m http.server 3000 --directory frontend

# Or using Node / npx
npx serve frontend -p 3000
```

Then open your browser at:
`http://localhost:3000`

---

## 🛠 Project Structure

```
LIFE MEMORY AI/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI route handlers (auth, chat, memories, graph)
│   │   ├── models/       # SQLAlchemy ORM models (users, memories, embeddings)
│   │   ├── schemas/      # Pydantic V2 validation schemas
│   │   ├── services/     # Memory engine, LLM, retrieval, PyMuPDF parser
│   │   ├── database/     # Async database connection & pgvector session
│   │   ├── utils/        # Token guards, hashing, prompt sanitizers
│   │   ├── tests/        # Automated Pytest suite
│   │   ├── main.py       # FastAPI application entrypoint
│   │   └── config.py     # Pydantic settings & environment configuration
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Container image definition
├── frontend/
│   ├── index.html        # Landing page
│   ├── login.html        # Authentication sign-in
│   ├── register.html     # Registration & onboarding
│   ├── dashboard.html    # Analytics dashboard
│   ├── chat.html         # Main Chat & Memory citation drawer
│   ├── memories.html     # Dedicated Memory Explorer
│   ├── timeline.html     # Chronological milestone timeline
│   ├── graph.html        # Interactive memory relationship graph
│   ├── insights.html     # Grounded cognitive summaries & progress
│   ├── settings.html     # Settings, Privacy, & Document manager
│   ├── css/
│   │   ├── design-system.css # Light-theme tokens, variables, & typography
│   │   ├── components.css    # Buttons, cards, modals, forms, toasts
│   │   └── pages.css         # Responsive page layouts & grid systems
│   └── js/
│       ├── api.js            # Unified API layer (FastAPI + mock fallback)
│       ├── auth.js           # Session guard & badge updates
│       ├── chat.js           # Real-time chat & memory grounding logic
│       ├── dashboard.js      # Stat counters & Chart.js rendering
│       ├── graph.js          # Vis.js & canvas relationship topology
│       ├── insights.js       # Periodic synthesis & goal metrics
│       ├── memories.js       # Memory search, filtering, CRUD modals
│       ├── mock-data.js      # Seed state for CSE student / AI Engineer persona
│       ├── settings.js       # Profile, preferences, & document uploads
│       ├── timeline.js       # Chronological milestone tree
│       └── toast.js          # Instant notification toast notifications
├── docs/
│   └── ARCHITECTURE.md   # Architectural blueprint & engineering specs
├── .env.example          # Environment variables template
├── .gitignore            # Git exclusions
├── docker-compose.yml    # Multi-container orchestration (PostgreSQL + Backend)
└── README.md             # Project documentation
```

