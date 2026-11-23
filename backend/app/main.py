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
                name="Mahalakshmi K",
                email="mahalakshmi@example.com",
                hashed_password="hashed_demo_pw",
                role="CSE Student & AI Engineer",
                avatar_text="MK",
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
                Memory(id="mem_1", user_id="usr_default", category="career", content="User ambition: Aspires to become a Senior AI / Machine Learning Engineer focusing on LLMs and cognitive architectures.", confidence=0.98, status="active", source="Conversation with Assistant", importance=5, tags=["ai-engineer", "career-goal", "ml"]),
                Memory(id="mem_2", user_id="usr_default", category="education", content="Computer Science and Engineering (CSE) senior undergraduate student graduating in 2027.", confidence=0.96, status="active", source="Profile Onboarding", importance=4, tags=["cse", "undergrad", "btech"]),
                Memory(id="mem_3", user_id="usr_default", category="skills", content="Proficient in Python, PyTorch, FastAPI, PostgreSQL, Vector Databases, and Modern Web Development.", confidence=0.94, status="active", source="Chat on Technical Stack", importance=4, tags=["python", "pytorch", "fastapi", "pgvector"]),
                Memory(id="mem_4", user_id="usr_default", category="projects", content="Developing 'Life Memory AI' — an intelligent persistent personal memory assistant with hybrid RAG and knowledge graph.", confidence=0.99, status="active", source="Project Planning Chat", importance=5, tags=["capstone", "rag", "knowledge-graph", "fastapi"]),
                Memory(id="mem_5", user_id="usr_default", category="goals", content="Goal: Publish an academic paper or open-source technical writeup on Long-Term AI Memory Retrievability by Q1 2027.", confidence=0.91, status="active", source="Goals Discussion", importance=4, tags=["research", "paper", "goals-2027"]),
                Memory(id="mem_6", user_id="usr_default", category="preferences", content="Prefers crisp light-mode user interfaces, high contrast typography, and clean structured markdown documentation.", confidence=0.95, status="active", source="Design Consultation", importance=3, tags=["ui-ux", "light-mode", "design"]),
                Memory(id="mem_7", user_id="usr_default", category="achievements", content="Won 1st Place in University AI Hackathon for building an autonomous memory agent prototype.", confidence=0.97, status="active", source="Conversation on Celebrations", importance=5, tags=["hackathon", "award", "autonomous-agents"]),
                Memory(id="mem_8", user_id="usr_default", category="plans", content="Planning to complete DeepLearning.AI Advanced LLM and Vector Search Specialization before December 2026.", confidence=0.89, status="active", source="Study Schedule Discussion", importance=3, tags=["learning", "certification", "llm"]),
                Memory(id="mem_9", user_id="usr_default", category="personal", content="Likes listening to instrumental lo-fi beats while coding, drinks green tea in the morning, and values daily deep work blocks.", confidence=0.88, status="active", source="Routine Reflection Chat", importance=2, tags=["habits", "routine", "deep-work"]),
                Memory(id="mem_10", user_id="usr_default", category="events", content="Attended the Global AI Summit 2026 in October — networked with NLP researchers and vector database engineers.", confidence=0.92, status="active", source="Conference Debrief", importance=3, tags=["conference", "networking", "ai-summit"]),
            ]
            for m in seed_memories:
                session.add(m)

            # Seed initial conversation
            conv = Conversation(id="conv_1", user_id="usr_default", title="Career Planning & AI Engineering Roadmap")
            session.add(conv)

            m1 = Message(id="msg_1", conversation_id="conv_1", role="user", text="Hi! I am a final year CSE student and my lifelong dream is to become a top AI engineer. What path should I take?")
            m2 = Message(
                id="msg_2", conversation_id="conv_1", role="assistant",
                text="Hello! As a CSE senior aiming for a career in AI Engineering, your computer science fundamentals give you a massive advantage. I have noted your ambition and educational stage in your memory bank! To reach the top tier of AI engineering, I recommend focusing on modern LLM orchestration, Retrieval-Augmented Generation (RAG), vector embeddings, and deploying scalable FastAPI services.",
                grounded_memories=["mem_1", "mem_2"], extracted_memories=["mem_1", "mem_2"]
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
