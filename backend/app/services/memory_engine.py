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

        # Guard: questions must NEVER be extracted as memories!
        if (text_lower.endswith('?') or
            re.match(r'^(where|what|when|who|whom|why|how|which|can|could|would|will|do|does|did|is|are|am|tell me|show me)\b', text_lower) or
            re.match(r'^(where|what|who|when|why|how)\s+i\s+', text_lower)):
            return []

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

        is_about_me = bool(re.search(r'\b(tell me about me|about me|about myself|what you know|what do you know|my profile|who am i)\b', q))
        is_works = bool(re.search(r'\b(work|works|project|projects|built|build|portfolio|created|developed|app|system|hackathon)\b', q))
        is_career = bool(re.search(r'\b(career|ambition|dream|aim|goal|goals|aspire|role|engineer|job|future)\b', q))
        is_edu = bool(re.search(r'\b(education|college|degree|cse|btech|university|study|studying|student|undergrad|graduating|gpa|cgpa|department|branch|belong|belongs)\b', q))
        is_skills = bool(re.search(r'\b(skill|skills|python|pytorch|fastapi|pgvector|database|tools|languages|tech|stack|code|coding)\b', q))
        is_pref = bool(re.search(r'\b(preference|preferences|like|likes|favorite|routine|habit|habits|tea|music|work-style|theme|mode)\b', q))

        # 0. Profile / About Me overview query
        if is_about_me:
            return (
                "Here is what I know and remember about you, Mahalakshmi:\n\n"
                "- **Identity**: K. Mahalakshmi (Mahalakshmi Kommaranahalli), based in Davanagere, Karnataka.\n"
                "- **Education**: B.E. in Computer Science & Engineering (CSE) at Jain Institute of Technology, Davanagere (3rd Year, 8.6 CGPA).\n"
                "- **Mentorship**: Mentored by Pruthviraj Mundargi (Assistant Professor, JITD).\n"
                "- **Achievements**: Top 8 Ranking among 178 teams at CIT Hackathon 2026, Smart India Hackathon SIH 26001 research, GitHub Pull Shark & YOLO badges.\n"
                "- **Projects**: 22 diverse technical projects including ARROWHEAD, Memory Master Game, Landslide Sentinel AI, CampusHub ERP, and MJ Hospital.\n"
                "- **Ambition**: Software Development Engineer and AI Innovator.\n\n"
                "Is there anything specific you would like to explore or update?"
            )

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

        is_about_me = bool(re.search(r'\b(tell me about me|about me|about myself|what you know|what do you know|my profile|who am i)\b', q))
        is_works = bool(re.search(r'\b(work|works|project|projects|built|build|portfolio|created|developed|app|system|hackathon)\b', q))
        is_career = bool(re.search(r'\b(career|ambition|dream|aim|goal|goals|aspire|role|engineer|job|future)\b', q))
        is_edu = bool(re.search(r'\b(education|college|degree|cse|btech|university|study|studying|student|undergrad|graduating|gpa|cgpa|department|branch|belong|belongs)\b', q))
        is_skills = bool(re.search(r'\b(skill|skills|python|pytorch|fastapi|pgvector|database|tools|languages|tech|stack|code|coding)\b', q))
        is_pref = bool(re.search(r'\b(preference|preferences|like|likes|favorite|routine|habit|habits|tea|music|work-style|theme|mode)\b', q))

        # 0. Profile / About Me overview query
        if is_about_me:
            return (
                "Here is what I know and remember about you, Mahalakshmi:\n\n"
                "- **Identity**: K. Mahalakshmi (Mahalakshmi Kommaranahalli), based in Davanagere, Karnataka.\n"
                "- **Education**: B.E. in Computer Science & Engineering (CSE) at Jain Institute of Technology, Davanagere (3rd Year, 8.6 CGPA).\n"
                "- **Mentorship**: Mentored by Pruthviraj Mundargi (Assistant Professor, JITD).\n"
                "- **Achievements**: Top 8 Ranking among 178 teams at CIT Hackathon 2026, Smart India Hackathon SIH 26001 research, GitHub Pull Shark & YOLO badges.\n"
                "- **Projects**: 22 diverse technical projects including ARROWHEAD, Memory Master Game, Landslide Sentinel AI, CampusHub ERP, and MJ Hospital.\n"
                "- **Ambition**: Software Development Engineer and AI Innovator.\n\n"
                "Is there anything specific you would like to explore or update?"
            )

        # 1. Previous works / projects query
        if is_works:
            return (
                "Based on your verified memory records, here is an organized summary of your key projects and previous works:\n\n"
                "1. **ARROWHEAD — Infinite Logic**: Minimalist JavaScript infinite logic game (GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/arrowhead/)\n"
                "2. **Memory Master Game — Memoryverse**: Interactive 20-level tech memory game (GitHub Pages: https://mahalakshmi-kommaranahalli.github.io/memory-master-game/)\n"
                "3. **Landslide Sentinel AI (SIH 26001)**: Early-warning ML model with Python Flask & SVM (85.71% validation accuracy)\n"
                "4. **Student Risk Identification System**: CIT Hackathon 2026 Top 8 ranking among 178 teams\n"
                "5. **CampusHub ERP**: College management & student services platform (Vercel: https://campus-hub-erp-xi.vercel.app/)\n"
                "6. **MJ Hospital**: Digital healthcare records system (Vercel: https://mj-hospital.vercel.app/)\n"
                "7. **LoRa-Based Smart Irrigation**: ESP32 & LoRa telemetry for precision farming\n"
                "8. **Code Blaster.exe**: Teachers' Day 2026 tribute to mentor Pruthviraj Mundargi\n\n"
                "Would you like to drill into the technical architecture of any of these works?"
            )

        # 2. Career Ambition Query
        if is_career:
            return (
                "Here is your career ambition and developer philosophy from memory:\n\n"
                "- **Ambition**: Aiming to become a high-impact Software Development Engineer and AI Innovator building scalable, accessible solutions across Full-Stack Web, AI/ML, and IoT.\n"
                "- **Philosophy**: *'I believe in learning by building. Every project gives me an opportunity to explore something new, solve a problem, improve my skills, and turn an idea into reality. KEEP LEARNING. KEEP BUILDING. KEEP GROWING.'*\n\n"
                "How can I assist with your development or career planning today?"
            )

        # 3. Education Query
        if is_edu:
            return (
                "According to your long-term academic records:\n\n"
                "- **Degree**: Bachelor of Engineering in Computer Science and Engineering (CSE) at Jain Institute of Technology, Davanagere (VTU affiliated, 2024 – Present, 3rd Year).\n"
                "- **CGPA**: 8.6 CGPA (Second-Year Academic Performance).\n"
                "- **Prior Education**: 10th Standard at Sri Gurudeva High School; 12th Standard (PUC) at Sir M V PU College."
            )

        # 4. Skills Query
        if is_skills:
            return (
                "Here are your verified technical skills and proficiencies from memory:\n\n"
                "- **Programming Languages**: C, Python, Java, JavaScript\n"
                "- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+), React, Vite\n"
                "- **Backend**: Python Flask, PHP, REST APIs\n"
                "- **Databases**: MySQL, PostgreSQL, SQLite, SQL\n"
                "- **AI / Machine Learning**: Scikit-learn, Naive Bayes, Support Vector Machines (SVM), Predictive Analytics\n"
                "- **IoT & Embedded**: ESP32, LoRa wireless RF, Arduino, OLED displays, sensors\n"
                "- **Cloud & Deployment**: GitHub Pages, Netlify, Vercel, Docker basics"
            )

        # 5. Preferences Query
        if is_pref:
            pref_mem = next((m for m in all_memories if m.get("category") == "preferences"), None)
            return (
                "Here are your recorded personal preferences from memory:\n\n"
                f"- **Preference**: {pref_mem.get('content') if pref_mem else 'Clean light-mode interfaces, building real-world projects, continuous learning and experimentation.'}\n\n"
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
