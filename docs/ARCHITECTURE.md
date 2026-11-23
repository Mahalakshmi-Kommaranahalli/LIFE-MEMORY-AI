# LIFE MEMORY AI — Architectural Blueprint

## System Overview
**Life Memory AI** is a personal cognitive intelligence system designed to remember key facts, goals, timelines, projects, and personal preferences from conversations, grounding responses using persistent Retrieval-Augmented Generation (RAG).

```
+-------------------------------------------------------------------------+
|                               FRONTEND                                  |
|   Modern Vanilla JS + CSS3 + Chart.js + Force Graph (Light Palette)     |
|   Landing | Auth | Chat | Dashboard | Memories | Timeline | Graph | ... |
+-------------------------------------------------------------------------+
                                   | (REST API / Fetch)
                                   v
+-------------------------------------------------------------------------+
|                            FASTAPI BACKEND                              |
|   - Auth & JWT Guard (Argon2 / BCrypt)                                  |
|   - Conversation & Message Controller                                   |
|   - Memory Extraction Engine (LLM Parser + Structured Validator)        |
|   - Retrieval Engine (Hybrid Semantic + Keyword Search)                 |
|   - Knowledge Graph Engine (NetworkX Graph Analysis)                    |
|   - Document Intelligence Service (PyMuPDF PDF Text & Chunking)         |
+-------------------------------------------------------------------------+
            |                                          |
            v                                          v
+------------------------+                +-------------------------+
|     POSTGRESQL DB      |                |   AI PROVIDER / LLM     |
|  - Users               |                |  - Configurable LLM     |
|  - Conversations       |                |    (OpenAI, Gemini,     |
|  - Messages            |                |     Mock Dev Engine)    |
|  - Memories            |                |  - Embeddings API       |
|  - pgvector Embeddings |                +-------------------------+
|  - Relationships       |
|  - Documents           |
+------------------------+
```

## Light Theme Visual System
- Base Background: Slate 50 (`#F8FAFC`) with crisp White (`#FFFFFF`) card surfaces.
- Accent Gradient: Indigo (`#6366F1`) to Violet (`#8B5CF6`) and Cyan (`#0EA5E9`).
- Borders: Refined soft border (`#E2E8F0`) with subtle backdrop blur and clean drop shadows.
- Typography: Inter / Plus Jakarta Sans system with high contrast text (`#0F172A`).
- Badges: Category-coded pastel badges with colored text.

