import os
import uuid
import datetime
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc

from backend.app.config import settings
from backend.app.database.connection import engine, Base, get_db
from backend.app.models.entities import User, Conversation, Message, Memory, MemoryRelationship, Document
from backend.app.schemas.schemas import (
    UserLogin, UserRegister, UserResponse, TokenResponse,
    MemoryCreate, MemoryUpdate, MemoryResponse,
    ChatMessageRequest, SearchRequest
)
from backend.app.services.memory_engine import CognitiveMemoryEngine

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Personal AI Assistant with Long-Term Semantic Memory",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables on startup & seed default data if empty
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial user and memories if not already existing
    async with AsyncSession(engine) as session:
        result = await session.execute(select(User).where(User.email == "mahalakshmi@example.com"))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                id="usr_default",
                name="K. Mahalakshmi",
                email="mahalakshmi@example.com",
                hashed_password="hashed_demo_pw",
                role="CSE 3rd Year | AI & Full-Stack Developer",
                avatar_text="KM",
                preferences={
                    "autoExtract": True,
                    "confidenceThreshold": 0.75,
                    "retrievalTopK": 5,
                    "conflictDetection": True,
                    "theme": "light"
                }
            )
            session.add(user)

            seed_memories = [
                Memory(id="mem_identity_profile", user_id="usr_default", category="personal", content="Professional Identity: K. Mahalakshmi (Mahalakshmi Kommaranahalli), based in Davanagere, Karnataka, India. B.E. Computer Science & Engineering student at Jain Institute of Technology, Davanagere. GitHub: https://github.com/mahalakshmi-kommaranahalli (38 public repositories, Pull Shark & YOLO badges), Portfolio: https://mahalakshmi-kommaranahalli.github.io/, LinkedIn: https://www.linkedin.com/in/mahalakshmi-kommaranahalli-06aba0341/, Instagram: @its_me_mahaaaa__.", confidence=0.99, status="active", source="Technical Profile 2026", importance=5, tags=["identity", "profile", "github", "portfolio", "linkedin", "davanagere"]),
                Memory(id="mem_edu_be_jitd", user_id="usr_default", category="education", content="Bachelor of Engineering in Computer Science and Engineering (CSE) at Jain Institute of Technology, Davanagere (VTU affiliated). Academic Period: 2024 – Present (Currently 3rd Year). Second-Year Academic Performance: 8.6 CGPA.", confidence=0.99, status="active", source="Academic Records", importance=5, tags=["education", "cse", "jit-davanagere", "vtu", "cgpa-8.6", "btech"]),
                Memory(id="mem_edu_schooling", user_id="usr_default", category="education", content="Pre-Engineering Academic Background: 10th Standard at Sri Gurudeva High School; 12th Standard (Pre-University Course - PUC) at Sir M V PU College.", confidence=0.98, status="active", source="Educational History", importance=4, tags=["schooling", "high-school", "pu-college", "foundational-education"]),
                Memory(id="mem_career_philosophy", user_id="usr_default", category="career", content="Personal Developer Statement & Philosophy: 'I believe in learning by building. Every project gives me an opportunity to explore something new, solve a problem, improve my skills, and turn an idea into reality. My engineering journey is about curiosity, experimentation, teamwork, mentorship, and continuous improvement. KEEP LEARNING. KEEP BUILDING. KEEP GROWING.'", confidence=0.99, status="active", source="Developer Statement", importance=5, tags=["philosophy", "learning-by-building", "mindset", "career-vision"]),
                Memory(id="mem_career_ambitions", user_id="usr_default", category="career", content="Career Ambition: Aiming to become a high-impact Software Development Engineer and AI Innovator building scalable, accessible, and meaningful real-world digital solutions across Full-Stack Web Development, Artificial Intelligence, Machine Learning, and IoT.", confidence=0.98, status="active", source="Professional Goals", importance=5, tags=["career-goal", "software-engineer", "ai-ml", "full-stack", "impact"]),
                Memory(id="mem_achieve_cit_hackathon", user_id="usr_default", category="achievements", content="CIT Hackathon 2026 Achievement: Secured TOP 8 RANKING AMONG 178 PARTICIPATING TEAMS. Built the 'Student Risk Identification and Educator Support System' tackling the challenge of supporting students at risk of falling behind using explainable decision support, attendance metrics, and academic analytics.", confidence=0.99, status="active", source="CIT Hackathon 2026 Results", importance=5, tags=["cit-hackathon-2026", "top-8-award", "student-risk-ai", "hackathon-winner"]),
                Memory(id="mem_achieve_sih_hackathon", user_id="usr_default", category="achievements", content="Smart India Hackathon Preparation: Researched and developed SIH 26001 'Landslide Sentinel AI' for early risk monitoring, alongside exploring TRUST-VISION, weather information trust, blockchain certificates, and AI-based legal summarization.", confidence=0.95, status="active", source="Hackathon Submission & Research", importance=4, tags=["sih-26001", "hackathon", "smart-india-hackathon", "ai-research"]),
                Memory(id="mem_achieve_github_badges", user_id="usr_default", category="achievements", content="GitHub Badges & Activity: Earned 'Pull Shark' and 'YOLO' achievements on GitHub. Active contributor maintaining 38 public repositories demonstrating consistent building, code craftsmanship, and version control discipline.", confidence=0.97, status="active", source="GitHub Profile Inspection", importance=4, tags=["github-badges", "pull-shark", "yolo", "open-source", "38-repos"]),
                Memory(id="mem_proj_arrowhead", user_id="usr_default", category="projects", content="Project 01: ARROWHEAD — Infinite Logic. Minimalist JavaScript infinite logic puzzle game where players solve arrow patterns, test observation speed, accuracy, and sequence navigation. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/arrowhead/.", confidence=0.98, status="active", source="Project Repository arrowhead", importance=4, tags=["game-dev", "javascript", "arrowhead", "github-pages"]),
                Memory(id="mem_proj_memorymaster", user_id="usr_default", category="projects", content="Project 02: MEMORY MASTER GAME — Memoryverse. Interactive educational technology memory game designed to boost concentration and tech knowledge across 20 levels covering Web Tech, AI, Programming, and Cloud Computing. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/memory-master-game/.", confidence=0.98, status="active", source="Project Repository memory-master-game", importance=4, tags=["edtech", "memory-game", "javascript", "gamification"]),
                Memory(id="mem_proj_landslide_ai", user_id="usr_default", category="projects", content="Project 03: Landslide Sentinel AI (SIH 26001). Machine learning early-warning solution analyzing environmental indicators to forecast landslide risks. Developed with Python Flask backend and SVM/Naive Bayes with 85.71% validation accuracy. Deployed on GitHub Pages.", confidence=0.97, status="active", source="Project Repository Landslide-Sentinel-AI", importance=5, tags=["ai-ml", "python-flask", "svm", "naive-bayes", "sih-26001"]),
                Memory(id="mem_proj_mj_hospital", user_id="usr_default", category="projects", content="Project 04: MJ Hospital. Healthcare hospital management web application designed for digital patient records, department coordination, and online clinic operations. Deployed on Vercel: https://mj-hospital.vercel.app/.", confidence=0.95, status="active", source="Vercel Deployment", importance=4, tags=["healthcare", "hospital-management", "web-app", "vercel"]),
                Memory(id="mem_proj_campushub_erp", user_id="usr_default", category="projects", content="Project 05: CampusHub ERP. Comprehensive college management and student services platform featuring student/faculty directories, attendance, fees, grading, and leave workflows. Built with React, Flask, MySQL, and REST APIs. Deployed on Vercel.", confidence=0.96, status="active", source="Vercel Deployment & Codebase", importance=5, tags=["erp", "campushub", "react", "flask", "mysql"]),
                Memory(id="mem_proj_vtu_3rd_sem", user_id="usr_default", category="projects", content="Project 06: VTU 2025 – 3rd Semester Study Hub. Academic platform for VTU 2025 Scheme CSE and ISE students offering 5 theory subjects, 5 modules per subject, syllabus, and video search. Deployed on GitHub Pages.", confidence=0.98, status="active", source="GitHub Repository VTU-2025-3rd-Sem-Notes", importance=4, tags=["vtu-notes", "3rd-sem-cse", "edtech", "github-pages"]),
                Memory(id="mem_proj_assignments_portal", user_id="usr_default", category="projects", content="Project 07: ASSIGNMENTS – Study Assignment Portal. Centralized academic portal organizing engineering assignments with direct document downloads across Computer Networks, Research Methodology, AI (BCS515B), and Theory of Computation. Deployed on GitHub Pages.", confidence=0.97, status="active", source="GitHub Repository ASSIGNMENTS", importance=4, tags=["assignments", "academic-portal", "vtu-coursework"]),
                Memory(id="mem_proj_code_blaster_exe", user_id="usr_default", category="projects", content="Project 09: Code Blaster.exe – Teachers' Day 2026. Interactive digital tribute to mentor Pruthviraj Mundargi honoring guidance and inspiration to learn beyond the classroom. Features secret-code auth, memory timeline, and 5-challenge bug hunting. Deployed on GitHub Pages.", confidence=0.99, status="active", source="GitHub Repository code-blaster-teachers-day", importance=5, tags=["code-blaster", "teachers-day", "tribute", "mentorship"]),
                Memory(id="mem_proj_portfolio_site", user_id="usr_default", category="projects", content="Project 10: Personal Portfolio Website. Central online identity showcasing technical background, education, projects, skills, experience, and certifications. Deployed on GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/.", confidence=0.99, status="active", source="GitHub Pages Deployment", importance=5, tags=["portfolio", "personal-branding", "web-development"]),
                Memory(id="mem_proj_student_risk_sys", user_id="usr_default", category="projects", content="Project 13: Student Risk Identification System. CIT Hackathon 2026 top-8 solution analyzing attendance trends, test scores, and engagement signals to deliver explainable decision-support alerts for educators. Deployed on Netlify.", confidence=0.99, status="active", source="Netlify Deployment & CIT Hackathon", importance=5, tags=["student-risk-ai", "cit-hackathon", "educator-tool"]),
                Memory(id="mem_proj_lora_smart_irrigation", user_id="usr_default", category="projects", content="Project 19: LoRa-Based Smart Irrigation. IoT embedded engineering project featuring long-range wireless telemetry using ESP32 microcontrollers, LoRa transceiver modules, OLED status displays, and soil moisture sensor nodes for automated precision farming.", confidence=0.97, status="active", source="IoT Hardware Prototyping", importance=5, tags=["iot", "esp32", "lora", "smart-irrigation", "embedded-systems"]),
                Memory(id="mem_skills_core_languages", user_id="usr_default", category="skills", content="Core Programming Languages: Experienced in C, Python, Java, and JavaScript for algorithmic problem-solving, backend APIs, IoT firmware, and interactive frontend applications.", confidence=0.98, status="active", source="Technical Stack Assessment", importance=4, tags=["c", "python", "java", "javascript"]),
                Memory(id="mem_skills_frontend_web", user_id="usr_default", category="skills", content="Frontend & Web Development: Proficient in HTML5, CSS3, Modern JavaScript (ES6+), React, Vite, responsive UI design, component-driven development, and lightweight SPA architecture.", confidence=0.98, status="active", source="Technical Stack Assessment", importance=4, tags=["html5", "css3", "javascript", "react", "vite"]),
                Memory(id="mem_skills_backend_databases", user_id="usr_default", category="skills", content="Backend & Database Engineering: Experienced in Python Flask, PHP, RESTful API architecture, MySQL, SQLite, PostgreSQL, SQL querying, schema normalization, and database connectivity.", confidence=0.97, status="active", source="Technical Stack Assessment", importance=4, tags=["flask", "php", "mysql", "sqlite", "postgresql"]),
                Memory(id="mem_skills_ai_ml_models", user_id="usr_default", category="skills", content="Artificial Intelligence & Machine Learning: Applied machine learning fundamentals with Scikit-learn, Naive Bayes classifiers, Support Vector Machines (SVM), data preprocessing, and predictive analytics.", confidence=0.96, status="active", source="Technical Stack Assessment", importance=4, tags=["machine-learning", "scikit-learn", "svm", "naive-bayes"]),
                Memory(id="mem_skills_iot_hardware", user_id="usr_default", category="skills", content="IoT & Embedded Engineering: Skilled with ESP32 microcontrollers, LoRa wireless communication protocols, Arduino IDE, OLED display interfaces, and environmental sensor integration.", confidence=0.96, status="active", source="Hardware Engineering Lab", importance=4, tags=["iot", "esp32", "lora", "arduino"]),
                Memory(id="mem_event_first_meeting_mentor", user_id="usr_default", category="events", content="Milestone: 15 September 2025 — First class at Jain Institute of Technology, Davanagere (JITD) and first meeting with mentor Pruthviraj Mundargi, initiating an impactful journey of technical guidance and hands-on coding.", confidence=0.99, status="active", source="Mentorship Timeline", importance=5, tags=["mentorship", "jitd", "pruthviraj-mundargi", "milestone"]),
                Memory(id="mem_event_code_blaster_event", user_id="usr_default", category="events", content="Milestone: 19 September 2025 — Code Blaster college event at JITD. A transformative experience that ignited the drive to learn beyond syllabus boundaries and build independent real-world software.", confidence=0.99, status="active", source="Mentorship Timeline", importance=5, tags=["code-blaster-event", "jitd", "inspiration"]),
                Memory(id="mem_event_first_tea_mentoring", user_id="usr_default", category="events", content="Milestone: 29 April 2026 — 'First Tea' mentoring session with mentor Pruthviraj Mundargi, discussing technical growth, problem-solving mindset, and future aspirations.", confidence=0.99, status="active", source="Mentorship Timeline", importance=4, tags=["first-tea", "mentorship", "dialogue"]),
                Memory(id="mem_event_teachers_day_tribute", user_id="usr_default", category="events", content="Milestone: 05 September 2026 — Released the 'Code Blaster.exe – Teachers' Day 2026' digital tribute, celebrating mentorship, debugging challenges, and the lifelong motivation to build.", confidence=0.99, status="active", source="Mentorship Timeline", importance=5, tags=["teachers-day-2026", "code-blaster-tribute", "mentorship"]),
                Memory(id="mem_goals_future_roadmap", user_id="usr_default", category="goals", content="Future Development Goals: (1) Advance expertise in state-of-the-art AI & ML architectures; (2) Master full-stack system design and cloud deployments with Docker; (3) Engineer production mobile apps including the MahaAI voice assistant; (4) Expand IoT and embedded intelligence solutions; (5) Build impactful open-source tools that empower education and students.", confidence=0.99, status="active", source="Future Roadmap", importance=5, tags=["future-goals", "ai-engineering", "full-stack", "docker", "iot"])
            ]
            for m in seed_memories:
                session.add(m)

            # Seed initial conversation
            conv = Conversation(id="conv_1", user_id="usr_default", title="Complete Technical Profile & Memory Synchronization")
            session.add(conv)

            m1 = Message(id="msg_1", conversation_id="conv_1", role="user", text="Hi! Here is my complete technical profile, project portfolio, 38 GitHub repositories, CIT Hackathon Top-8 win, and mentorship history. Please add everything to my memory bank!")
            m2 = Message(
                id="msg_2", conversation_id="conv_1", role="assistant",
                text="Hello Mahalakshmi! 🎉 I have successfully ingested and structured your complete technical profile into your Life Memory AI bank. All 31 structured memories, your 8.6 CGPA at JIT Davanagere, 22 projects, CIT Hackathon 2026 Top-8 ranking, and mentorship milestones have been grounded and linked across your Knowledge Graph and Timeline!",
                grounded_memories=["mem_identity_profile", "mem_edu_be_jitd", "mem_achieve_cit_hackathon"], extracted_memories=["mem_identity_profile", "mem_edu_be_jitd", "mem_achieve_cit_hackathon"]
            )
            session.add(m1)
            session.add(m2)

            await session.commit()

# --- Health Check ---
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}

# --- Auth Endpoints ---
@app.post("/api/auth/register", response_model=TokenResponse)
async def register(req: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = "usr_" + str(uuid.uuid4())[:8]
    initials = "".join([part[0] for part in req.name.split() if part])[:2].upper() or "US"
    user = User(
        id=user_id,
        name=req.name,
        email=req.email,
        hashed_password="mock_hashed_" + req.password,
        avatar_text=initials,
        role="CSE Student & AI Engineer",
        preferences={"autoExtract": True, "confidenceThreshold": 0.75, "theme": "light"}
    )
    db.add(user)
    await db.commit()

    user_resp = UserResponse(
        id=user.id, name=user.name, email=user.email,
        role=user.role, avatarText=user.avatar_text, preferences=user.preferences
    )
    return TokenResponse(access_token="jwt_token_" + user.id, user=user_resp)

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(req: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        # For seamless demo experience:
        user = User(
            id="usr_default", name="Mahalakshmi K", email=req.email,
            hashed_password="demo", role="CSE Student & AI Engineer", avatar_text="MK",
            preferences={"autoExtract": True, "confidenceThreshold": 0.75, "theme": "light"}
        )
        db.add(user)
        await db.commit()

    user_resp = UserResponse(
        id=user.id, name=user.name, email=user.email,
        role=user.role, avatarText=user.avatar_text, preferences=user.preferences or {}
    )
    return TokenResponse(access_token="jwt_token_" + user.id, user=user_resp)

# --- Memories Endpoints ---
@app.get("/api/memories")
async def get_memories(category: str = "all", search: str = "", status: str = "all", db: AsyncSession = Depends(get_db)):
    query = select(Memory).where(Memory.user_id == "usr_default")
    if category and category != "all":
        query = query.where(Memory.category == category)
    if status and status != "all":
        query = query.where(Memory.status == status)

    result = await db.execute(query.order_by(desc(Memory.created_at)))
    memories = result.scalars().all()

    items = []
    for m in memories:
        items.append({
            "id": m.id,
            "category": m.category,
            "content": m.content,
            "confidence": m.confidence,
            "status": m.status,
            "source": m.source,
            "importance": m.importance,
            "tags": m.tags or [],
            "validFrom": m.valid_from,
            "createdAt": m.created_at.isoformat(),
            "updatedAt": m.updated_at.isoformat()
        })
    if search:
        s = search.lower()
        items = [i for i in items if s in i["content"].lower() or any(s in t.lower() for t in i["tags"])]
    return items

@app.post("/api/memories")
async def create_memory(req: MemoryCreate, db: AsyncSession = Depends(get_db)):
    mem_id = "mem_" + str(uuid.uuid4())[:8]
    mem = Memory(
        id=mem_id,
        user_id="usr_default",
        category=req.category,
        content=req.content,
        confidence=req.confidence or 0.95,
        status=req.status or "active",
        source=req.source or "Manual Entry",
        importance=req.importance or 3,
        tags=req.tags or [],
        valid_from=req.validFrom or datetime.datetime.utcnow().strftime("%Y-%m-%d")
    )
    db.add(mem)
    await db.commit()
    return {"id": mem.id, "status": "created"}

@app.put("/api/memories/{memory_id}")
async def update_memory(memory_id: str, req: MemoryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.id == memory_id))
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    if req.category: mem.category = req.category
    if req.content: mem.content = req.content
    if req.status: mem.status = req.status
    if req.importance is not None: mem.importance = req.importance
    if req.tags is not None: mem.tags = req.tags

    await db.commit()
    return {"id": mem.id, "status": "updated"}

@app.delete("/api/memories/{memory_id}")
async def delete_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Memory).where(Memory.id == memory_id))
    await db.commit()
    return {"success": True}

@app.post("/api/memories/search")
async def search_memories(req: SearchRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.user_id == "usr_default"))
    memories = result.scalars().all()
    mem_dicts = [{"id": m.id, "category": m.category, "content": m.content, "tags": m.tags or []} for m in memories]

    matches = CognitiveMemoryEngine.calculate_semantic_similarity(req.query, mem_dicts)
    output = []
    for m_dict, sim in matches:
        full_m = next(m for m in memories if m.id == m_dict["id"])
        output.append({
            "memory": {
                "id": full_m.id,
                "category": full_m.category,
                "content": full_m.content,
                "confidence": full_m.confidence,
                "status": full_m.status,
                "source": full_m.source,
                "createdAt": full_m.created_at.isoformat()
            },
            "similarity": sim
        })
    return output

# --- Chat Endpoints ---
@app.get("/api/chat/history")
async def get_chat_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Conversation).where(Conversation.user_id == "usr_default").order_by(desc(Conversation.updated_at)))
    convs = result.scalars().all()
    output = []
    for c in convs:
        msg_result = await db.execute(select(Message).where(Message.conversation_id == c.id).order_by(Message.timestamp))
        messages = msg_result.scalars().all()
        output.append({
            "id": c.id,
            "title": c.title,
            "updatedAt": c.updated_at.isoformat(),
            "messages": [
                {
                    "id": m.id,
                    "role": m.role,
                    "text": m.text,
                    "timestamp": m.timestamp.isoformat(),
                    "groundedMemories": m.grounded_memories or [],
                    "extractedMemories": m.extracted_memories or []
                } for m in messages
            ]
        })
    return output

@app.post("/api/chat/send")
async def send_chat_message(req: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    # 1. Fetch or create conversation
    conv_id = req.conversation_id
    if not conv_id:
        conv_id = "conv_" + str(uuid.uuid4())[:8]
        conv = Conversation(id=conv_id, user_id="usr_default", title=req.message[:35])
        db.add(conv)
    else:
        result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
        conv = result.scalar_one_or_none()
        if not conv:
            conv = Conversation(id=conv_id, user_id="usr_default", title=req.message[:35])
            db.add(conv)

    # 2. Add user message
    user_msg_id = "msg_" + str(uuid.uuid4())[:8]
    user_msg = Message(id=user_msg_id, conversation_id=conv_id, role="user", text=req.message)
    db.add(user_msg)

    # 3. Memory Extraction & Semantic Retrieval
    mem_result = await db.execute(select(Memory).where(Memory.user_id == "usr_default"))
    all_memories = mem_result.scalars().all()
    mem_dicts = [
        {"id": m.id, "category": m.category, "content": m.content, "tags": m.tags or [], "confidence": m.confidence}
        for m in all_memories
    ]

    # Calculate similarity
    relevant_matches = CognitiveMemoryEngine.calculate_semantic_similarity(req.message, mem_dicts)
    grounded_dicts = [m[0] for m in relevant_matches]
    grounded_ids = [m["id"] for m in grounded_dicts]

    # Extract new facts if shared
    new_facts = CognitiveMemoryEngine.extract_new_memories(req.message)
    extracted_ids = []
    for f in new_facts:
        new_mem_id = "mem_" + str(uuid.uuid4())[:8]
        new_mem = Memory(
            id=new_mem_id,
            user_id="usr_default",
            category=f["category"],
            content=f["content"],
            confidence=f["confidence"],
            status="active",
            importance=f["importance"],
            tags=f["tags"],
            source="Conversation with Assistant"
        )
        db.add(new_mem)
        extracted_ids.append(new_mem_id)

    # 4. Generate intelligent grounded response
    assistant_text = CognitiveMemoryEngine.generate_grounded_response(
        req.message, grounded_dicts, new_facts, mem_dicts
    )

    asst_msg_id = "msg_" + str(uuid.uuid4())[:8]
    asst_msg = Message(
        id=asst_msg_id,
        conversation_id=conv_id,
        role="assistant",
        text=assistant_text,
        grounded_memories=grounded_ids,
        extracted_memories=extracted_ids
    )
    db.add(asst_msg)
    conv.updated_at = datetime.datetime.utcnow()
    await db.commit()

    return {
        "user_message": {"id": user_msg_id, "role": "user", "text": req.message, "timestamp": user_msg.timestamp.isoformat()},
        "assistant_message": {"id": asst_msg_id, "role": "assistant", "text": assistant_text, "timestamp": asst_msg.timestamp.isoformat(), "groundedMemories": grounded_ids, "extractedMemories": extracted_ids},
        "grounded_memories": grounded_dicts,
        "extracted_memories": new_facts
    }

# --- Graph Endpoint ---
@app.get("/api/graph")
async def get_graph(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.user_id == "usr_default"))
    memories = result.scalars().all()
    nodes = [
        {
            "id": m.id,
            "label": m.content[:36] + "..." if len(m.content) > 36 else m.content,
            "fullContent": m.content,
            "category": m.category,
            "confidence": m.confidence,
            "status": m.status
        }
        for m in memories
    ]
    edges = [
        {"source": "mem_2", "target": "mem_3", "label": "Learned at College"},
        {"source": "mem_3", "target": "mem_4", "label": "Used to Build"},
        {"source": "mem_4", "target": "mem_7", "label": "Won Hackathon"},
        {"source": "mem_4", "target": "mem_5", "label": "Research Paper"},
        {"source": "mem_3", "target": "mem_1", "label": "Prepares for Role"},
        {"source": "mem_8", "target": "mem_1", "label": "Deep Specialization"},
        {"source": "mem_10", "target": "mem_1", "label": "Industry Connections"}
    ]
    return {"nodes": nodes, "edges": edges}

# --- Dashboard Stats ---
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Memory).where(Memory.user_id == "usr_default"))
    memories = result.scalars().all()
    conv_result = await db.execute(select(Conversation).where(Conversation.user_id == "usr_default"))
    convs = conv_result.scalars().all()

    cat_dist = {}
    for m in memories:
        cat_dist[m.category] = cat_dist.get(m.category, 0) + 1

    recent = [
        {
            "id": m.id,
            "category": m.category,
            "content": m.content,
            "confidence": m.confidence,
            "source": m.source,
            "createdAt": m.created_at.isoformat()
        }
        for m in memories[:5]
    ]

    return {
        "totalMemories": len(memories),
        "totalConversations": len(convs),
        "categoriesCount": len(cat_dist),
        "activeGoals": cat_dist.get("goals", 0) + cat_dist.get("career", 0),
        "categoryDistribution": cat_dist,
        "recentMemories": recent,
        "weeklyActivity": [4, 7, 3, 9, 6, 12, 8]
    }

# --- Documents Endpoint ---
@app.get("/api/documents")
async def get_documents():
    return [
        {
            "id": "doc_1",
            "filename": "AI_Engineering_Curriculum_2026.pdf",
            "size": "1.4 MB",
            "pages": 14,
            "uploadedAt": "2026-11-15T10:00:00Z",
            "status": "processed",
            "extractedMemoriesCount": 3,
            "summary": "Comprehensive curriculum overview detailing Vector Databases, PyTorch, RAG architectures, and model evaluation metrics."
        },
        {
            "id": "doc_2",
            "filename": "Undergraduate_Project_Proposal_Final.pdf",
            "size": "890 KB",
            "pages": 8,
            "uploadedAt": "2026-11-20T14:30:00Z",
            "status": "processed",
            "extractedMemoriesCount": 2,
            "summary": "Official senior design thesis proposal for Life Memory AI: Persistent Semantic Memory Engine for Personal AI Agents."
        }
    ]

# Mount frontend static directory so FastAPI serves both API and Web UI
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
