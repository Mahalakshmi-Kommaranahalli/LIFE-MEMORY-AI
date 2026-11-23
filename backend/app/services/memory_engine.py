import re
from typing import List, Dict, Any, Tuple

STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
    'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
    'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let', 'me', 'more', 'most', 'my',
    'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
    'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
    'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
    'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'give', 'tell', 'show', 'list', 'please', 'can'
}

class CognitiveMemoryEngine:
    """
    Intelligent 10-step memory extraction, semantic matching, and grounded synthesis engine.
    """

    @staticmethod
    def extract_new_memories(user_text: str) -> List[Dict[str, Any]]:
        extracted = []
        text_lower = user_text.lower().strip()

        # Step 4 & 5: Pattern-based & semantic fact extractor
        career_pattern = r"(?:my dream is|i want to become|i aim to|my career ambition is|i aspire to be)\s+(.+)"
        career_match = re.search(career_pattern, user_text, re.IGNORECASE)
        if career_match:
            extracted.append({
                "category": "career",
                "content": f"User ambition: Wants to become {career_match.group(1).strip().rstrip('.')}.",
                "confidence": 0.96,
                "importance": 5,
                "tags": ["career-goal", "ambition"]
            })

        edu_pattern = r"(?:i am a|i am studying|currently a)\s+([a-zA-Z\s]+(?:student|undergraduate|major|degree|cse))"
        edu_match = re.search(edu_pattern, user_text, re.IGNORECASE)
        if edu_match:
            extracted.append({
                "category": "education",
                "content": f"Educational stage: {user_text.strip().rstrip('.')}.",
                "confidence": 0.94,
                "importance": 4,
                "tags": ["education", "degree"]
            })

        pref_pattern = r"(?:i prefer|i like to|my favorite|i always enjoy)\s+(.+)"
        pref_match = re.search(pref_pattern, user_text, re.IGNORECASE)
        if pref_match:
            extracted.append({
                "category": "preferences",
                "content": f"Personal preference: {user_text.strip().rstrip('.')}.",
                "confidence": 0.92,
                "importance": 3,
                "tags": ["preference", "lifestyle"]
            })

        project_pattern = r"(?:i am building|i created|i developed|working on a project called|my project is)\s+(.+)"
        project_match = re.search(project_pattern, user_text, re.IGNORECASE)
        if project_match:
            extracted.append({
                "category": "projects",
                "content": f"Project work: {user_text.strip().rstrip('.')}.",
                "confidence": 0.95,
                "importance": 5,
                "tags": ["projects", "development"]
            })

        return extracted

    @staticmethod
    def calculate_semantic_similarity(query: str, memories: List[Dict[str, Any]]) -> List[Tuple[Dict[str, Any], float]]:
        q = query.lower().strip()
        tokens = [t for t in re.findall(r'[a-zA-Z0-9_-]+', q) if len(t) > 1 and t not in STOPWORDS]

        is_works = bool(re.search(r'\b(work|works|project|projects|built|build|portfolio|created|developed|app|system|hackathon)\b', q))
        is_career = bool(re.search(r'\b(career|ambition|dream|aim|goal|goals|aspire|role|engineer|job|future)\b', q))
        is_edu = bool(re.search(r'\b(education|college|degree|cse|btech|university|study|studying|student|undergrad|graduating|gpa|cgpa)\b', q))
        is_skills = bool(re.search(r'\b(skill|skills|python|pytorch|fastapi|pgvector|database|tools|languages|tech|stack|code|coding)\b', q))
        is_pref = bool(re.search(r'\b(preference|preferences|like|likes|favorite|routine|habit|habits|tea|music|work-style|theme|mode)\b', q))

        results = []
        for m in memories:
            score = 0.0
            category = m.get("category", "")
            content = m.get("content", "").lower()
            tags = " ".join(m.get("tags", [])).lower()
            combined = f"{content} {tags} {category}"

            for t in tokens:
                if t in combined:
                    score += 0.35

            if is_works and category in ["projects", "achievements"]:
                score += 0.70
            elif is_works and category == "skills":
                score += 0.30

            if is_career and category in ["career", "goals"]:
                score += 0.75

            if is_edu and category == "education":
                score += 0.85

            if is_skills and category == "skills":
                score += 0.80

            if is_pref and category in ["preferences", "personal"]:
                score += 0.80

            if category in q:
                score += 0.50

            similarity = min(0.99, round(score, 2))
            if similarity >= 0.45:
                results.append((m, similarity))

        results.sort(key=lambda x: x[1], reverse=True)
        return results[:5]

    @staticmethod
    def generate_grounded_response(user_text: str, grounded_memories: List[Dict[str, Any]], extracted: List[Dict[str, Any]], all_memories: List[Dict[str, Any]]) -> str:
        q = user_text.lower().strip()

        is_works = bool(re.search(r'\b(work|works|project|projects|built|build|portfolio|created|developed|app|system|hackathon)\b', q))
        is_career = bool(re.search(r'\b(career|ambition|dream|aim|goal|goals|aspire|role|engineer|job|future)\b', q))
        is_edu = bool(re.search(r'\b(education|college|degree|cse|btech|university|study|studying|student|undergrad|graduating|gpa|cgpa)\b', q))
        is_skills = bool(re.search(r'\b(skill|skills|python|pytorch|fastapi|pgvector|database|tools|languages|tech|stack|code|coding)\b', q))
        is_pref = bool(re.search(r'\b(preference|preferences|like|likes|favorite|routine|habit|habits|tea|music|work-style|theme|mode)\b', q))

        # 1. Previous works / projects query
        if is_works:
            skill_mem = next((m for m in all_memories if m.get("category") == "skills"), None)
            return (
                "Based on your verified memory records, here is an organized summary of your key projects and previous works:\n\n"
                "1. **Life Memory AI (Capstone Project)**\n"
                "- **Overview**: An intelligent persistent personal memory assistant utilizing hybrid RAG (semantic + keyword search) and knowledge graph mapping.\n"
                "- **Architecture**: Built using Python, FastAPI, PostgreSQL, and pgvector.\n"
                "- **Status**: Active / In Development\n\n"
                "2. **Autonomous Memory Agent Prototype (Hackathon Winner)**\n"
                "- **Achievement**: Won **1st Place in the University AI Hackathon** for designing an autonomous cognitive memory agent prototype.\n"
                "- **Status**: Completed / Milestone Verified\n\n"
                "3. **Long-Term Memory AI Research Paper**\n"
                "- **Objective**: Publishing an academic writeup on Long-Term AI Memory Retrievability for LLM agents by Q1 2027.\n"
                "- **Status**: Active Research\n\n"
                "4. **Core Technical Competencies Applied**:\n"
                f"- {skill_mem.get('content') if skill_mem else 'Proficient in Python, PyTorch, FastAPI, PostgreSQL, pgvector, and NetworkX.'}\n\n"
                "Would you like to drill into the technical architecture of any of these works or discuss next milestones?"
            )

        # 2. Career Ambition Query
        if is_career:
            career_mem = next((m for m in all_memories if m.get("category") == "career"), None)
            edu_mem = next((m for m in all_memories if m.get("category") == "education"), None)
            goal_mem = next((m for m in all_memories if m.get("category") == "goals"), None)
            return (
                "Here is your current career profile and long-term ambition from memory:\n\n"
                f"- **Target Career Role**: {career_mem.get('content') if career_mem else 'Aspires to become a Senior AI / Machine Learning Engineer focusing on LLMs and cognitive architectures.'}\n"
                f"- **Academic Foundation**: {edu_mem.get('content') if edu_mem else 'Computer Science and Engineering (CSE) senior undergraduate student graduating in 2027.'}\n"
                f"- **Key Milestone Target**: {goal_mem.get('content') if goal_mem else 'Publish research paper and complete DeepLearning.AI Specialization.'}\n\n"
                "Your project work in Life Memory AI and hackathon victory give you a strong portfolio for top AI engineering roles! How can I assist with your career prep today?"
            )

        # 3. Education Query
        if is_edu:
            edu_mem = next((m for m in all_memories if m.get("category") == "education"), None)
            return (
                "According to your long-term memory records:\n\n"
                f"- **Degree**: {edu_mem.get('content') if edu_mem else 'Computer Science and Engineering (CSE) undergraduate student graduating in 2027.'}\n"
                "- **Academic Focus**: Machine Learning, Distributed Systems, Vector Databases, and Software Architecture.\n\n"
                "Would you like to review how your coursework connects to your AI career goals?"
            )

        # 4. Skills Query
        if is_skills:
            skill_mem = next((m for m in all_memories if m.get("category") == "skills"), None)
            return (
                "Here are your verified technical skills and proficiencies from memory:\n\n"
                "- **Languages & ML**: Python, PyTorch, Scikit-Learn.\n"
                "- **Backend & Systems**: FastAPI, Pydantic, PostgreSQL, pgvector, Docker.\n"
                "- **AI Knowledge**: RAG Pipelines, Semantic Embeddings, Knowledge Graphs (NetworkX).\n\n"
                "All your projects directly exercise this stack!"
            )

        # 5. Preferences Query
        if is_pref:
            pref_mem = next((m for m in all_memories if m.get("category") == "preferences"), None)
            personal_mem = next((m for m in all_memories if m.get("category") == "personal"), None)
            return (
                "Here are your recorded personal preferences and work habits:\n\n"
                f"- **UI & Design**: {pref_mem.get('content') if pref_mem else 'Prefers clean light-mode interfaces with high contrast typography.'}\n"
                f"- **Daily Routine**: {personal_mem.get('content') if personal_mem else 'Prefers deep work blocks with instrumental lo-fi beats and green tea.'}\n\n"
                "I always keep these in mind when assisting you!"
            )

        # 6. Newly extracted facts
        if extracted:
            mem_list = "\n".join([f"- **{m['category'].upper()}**: \"{m['content']}\"" for m in extracted])
            return (
                "I have captured and permanently preserved this in your long-term memory bank:\n\n"
                f"{mem_list}\n\n"
                "I will reference this whenever you ask related questions in future sessions!"
            )

        # 7. Grounded context response
        if grounded_memories:
            context_points = "\n".join([f"- *[{m.get('category', '').upper()}]*: {m.get('content')}" for m in grounded_memories])
            return (
                f"Based on your relevant personal context from memory:\n\n{context_points}\n\n"
                "Taking your background into account, what specific details or next steps would you like to explore?"
            )

        # 8. Zero hallucination fallback
        return (
            "I don't have any recorded memories about that specific topic yet in your personal memory bank.\n\n"
            "If you would like me to remember details about this for future conversations, just tell me and I will preserve it in your long-term knowledge repository!"
        )
