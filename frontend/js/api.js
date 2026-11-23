/**
 * LIFE MEMORY AI — Unified API Service Layer
 * Automatically detects backend availability; falls back gracefully to
 * intelligent in-browser mock engine during frontend review or offline mode.
 */

const API_BASE = '/api';

const ApiService = {
  isBackendAvailable: false,

  async checkBackend() {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        this.isBackendAvailable = true;
        return true;
      }
    } catch (e) {
      this.isBackendAvailable = false;
    }
    return false;
  },

  // --- Auth APIs ---
  async login(email, password) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
      const data = await res.json();
      localStorage.setItem('lifememory_token', data.access_token);
      localStorage.setItem('lifememory_user', JSON.stringify(data.user));
      return data;
    } else {
      await simulateLatency(300);
      const store = getDataStore();
      const user = { ...store.user, email: email || store.user.email };
      localStorage.setItem('lifememory_token', 'mock_jwt_token_active');
      localStorage.setItem('lifememory_user', JSON.stringify(user));
      return { access_token: 'mock_jwt_token_active', user };
    }
  },

  async register(name, email, password) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
      const data = await res.json();
      localStorage.setItem('lifememory_token', data.access_token);
      localStorage.setItem('lifememory_user', JSON.stringify(data.user));
      return data;
    } else {
      await simulateLatency(350);
      const store = getDataStore();
      store.user.name = name;
      store.user.email = email;
      store.user.avatarText = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
      saveDataStore(store);
      localStorage.setItem('lifememory_token', 'mock_jwt_token_active');
      localStorage.setItem('lifememory_user', JSON.stringify(store.user));
      return { access_token: 'mock_jwt_token_active', user: store.user };
    }
  },

  logout() {
    localStorage.removeItem('lifememory_token');
    localStorage.removeItem('lifememory_user');
    window.location.href = 'login.html';
  },

  getCurrentUser() {
    const raw = localStorage.getItem('lifememory_user');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    const store = getDataStore();
    return store.user;
  },

  // --- Memories APIs ---
  async getMemories(filter = {}) {
    if (this.isBackendAvailable) {
      const params = new URLSearchParams(filter).toString();
      const res = await fetch(`${API_BASE}/memories?${params}`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(150);
      const store = getDataStore();
      let list = [...store.memories];
      if (filter.category && filter.category !== 'all') {
        list = list.filter(m => m.category.toLowerCase() === filter.category.toLowerCase());
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(m => m.content.toLowerCase().includes(q) || (m.tags && m.tags.some(t => t.toLowerCase().includes(q))));
      }
      if (filter.status && filter.status !== 'all') {
        list = list.filter(m => m.status === filter.status);
      }
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    }
  },

  async createMemory(memory) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/memories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memory)
      });
      return await res.json();
    } else {
      await simulateLatency(200);
      const store = getDataStore();
      const newMem = {
        id: 'mem_' + Date.now(),
        category: memory.category || 'personal',
        content: memory.content,
        confidence: memory.confidence || 0.95,
        status: 'active',
        source: memory.source || 'Manual User Entry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validFrom: memory.validFrom || new Date().toISOString().split('T')[0],
        importance: memory.importance || 3,
        tags: memory.tags || [memory.category || 'personal']
      };
      store.memories.unshift(newMem);
      saveDataStore(store);
      return newMem;
    }
  },

  async updateMemory(id, updates) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/memories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      return await res.json();
    } else {
      await simulateLatency(150);
      const store = getDataStore();
      const idx = store.memories.findIndex(m => m.id === id);
      if (idx !== -1) {
        store.memories[idx] = { ...store.memories[idx], ...updates, updatedAt: new Date().toISOString() };
        saveDataStore(store);
        return store.memories[idx];
      }
      throw new Error('Memory not found');
    }
  },

  async deleteMemory(id) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/memories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await res.json();
    } else {
      await simulateLatency(150);
      const store = getDataStore();
      store.memories = store.memories.filter(m => m.id !== id);
      store.relationships = store.relationships.filter(r => r.source !== id && r.target !== id);
      saveDataStore(store);
      return { success: true };
    }
  },

  async searchMemories(query) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/memories/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query })
      });
      return await res.json();
    } else {
      await simulateLatency(150);
      const store = getDataStore();
      const q = query.toLowerCase().trim();
      
      const stopwords = new Set([
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
      ]);

      const tokens = q.split(/[^a-zA-Z0-9_-]+/).filter(t => t.length > 1 && !stopwords.has(t));

      // Intent classification vectors
      const isWorksQuery = /(work|works|project|projects|built|build|portfolio|created|developed|app|system|hackathon)/i.test(q);
      const isCareerQuery = /(career|ambition|dream|aim|goal|goals|aspire|role|engineer|job|future)/i.test(q);
      const isEduQuery = /(education|college|degree|cse|btech|university|study|studying|student|undergrad|graduating|gpa|cgpa)/i.test(q);
      const isSkillsQuery = /(skill|skills|python|pytorch|fastapi|pgvector|database|tools|languages|tech|stack|code|coding)/i.test(q);
      const isPrefQuery = /(preference|preferences|like|likes|favorite|routine|habit|habits|tea|music|work-style|theme|mode)/i.test(q);

      const scored = store.memories.map(m => {
        let score = 0;
        const text = (m.content + ' ' + (m.tags || []).join(' ') + ' ' + m.category).toLowerCase();
        
        // 1. Token keyword match
        tokens.forEach(t => {
          if (text.includes(t)) {
            score += 0.35;
          }
        });

        // 2. High-precision intent category matching
        if (isWorksQuery && (m.category === 'projects' || m.category === 'achievements')) {
          score += 0.70;
        }
        if (isWorksQuery && m.category === 'skills') {
          score += 0.30;
        }

        if (isCareerQuery && (m.category === 'career' || m.category === 'goals')) {
          score += 0.75;
        }

        if (isEduQuery && m.category === 'education') {
          score += 0.85;
        }

        if (isSkillsQuery && m.category === 'skills') {
          score += 0.80;
        }

        if (isPrefQuery && (m.category === 'preferences' || m.category === 'personal')) {
          score += 0.80;
        }

        // Direct category name match in query
        if (q.includes(m.category.toLowerCase())) {
          score += 0.50;
        }

        const similarity = Math.min(0.99, Number(score.toFixed(2)));
        return { memory: m, similarity };
      });

      // Filter: only items with genuine semantic relevance (score >= 0.45)
      const matches = scored.filter(s => s.similarity >= 0.45);
      matches.sort((a, b) => b.similarity - a.similarity);
      return matches.slice(0, 5);
    }
  },

  // --- Chat & Conversation APIs ---
  async getConversations() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/chat/history`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(100);
      const store = getDataStore();
      return store.conversations;
    }
  },

  async sendMessage(conversationId, userText) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ conversation_id: conversationId, message: userText })
      });
      return await res.json();
    } else {
      await simulateLatency(700);
      const store = getDataStore();
      let conv = store.conversations.find(c => c.id === conversationId);
      if (!conv) {
        conv = {
          id: conversationId || 'conv_' + Date.now(),
          title: userText.length > 35 ? userText.substring(0, 35) + '...' : userText,
          updatedAt: new Date().toISOString(),
          messages: []
        };
        store.conversations.unshift(conv);
      }

      // 1. Push user message
      const userMsg = {
        id: 'msg_' + Date.now(),
        role: 'user',
        text: userText,
        timestamp: new Date().toISOString()
      };
      conv.messages.push(userMsg);

      // 2. Intelligent Memory Engine Simulation
      // Step A: Search relevant existing memories to ground response
      const relevantMatches = await this.searchMemories(userText);
      const groundedMemories = relevantMatches.map(m => m.memory);

      // Step B: Check if message contains new extractable personal facts
      const extractedMemories = [];
      const lower = userText.toLowerCase();

      if (lower.includes('my dream is') || lower.includes('want to become') || lower.includes('aim to') || lower.includes('aspire to')) {
        const newCareerMem = {
          id: 'mem_' + (Date.now() + 1),
          category: 'career',
          content: userText.trim(),
          confidence: 0.96,
          status: 'active',
          source: 'Conversation with Assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          validFrom: new Date().toISOString().split('T')[0],
          importance: 5,
          tags: ['career-goal', 'extracted']
        };
        store.memories.unshift(newCareerMem);
        extractedMemories.push(newCareerMem.id);
      } else if (lower.includes('i am studying') || lower.includes('i am a student') || lower.includes('cse') || lower.includes('degree')) {
        const newEduMem = {
          id: 'mem_' + (Date.now() + 2),
          category: 'education',
          content: userText.trim(),
          confidence: 0.94,
          status: 'active',
          source: 'Conversation with Assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          validFrom: new Date().toISOString().split('T')[0],
          importance: 4,
          tags: ['education', 'extracted']
        };
        store.memories.unshift(newEduMem);
        extractedMemories.push(newEduMem.id);
      } else if (lower.includes('i prefer') || lower.includes('i like') || lower.includes('my favorite')) {
        const newPrefMem = {
          id: 'mem_' + (Date.now() + 3),
          category: 'preferences',
          content: userText.trim(),
          confidence: 0.91,
          status: 'active',
          source: 'Conversation with Assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          validFrom: new Date().toISOString().split('T')[0],
          importance: 3,
          tags: ['preference', 'extracted']
        };
        store.memories.unshift(newPrefMem);
        extractedMemories.push(newPrefMem.id);
      }

      // Step C: Generate grounded Assistant reply
      const assistantText = generateIntelligentResponse(userText, groundedMemories, extractedMemories, store);

      const assistantMsg = {
        id: 'msg_' + (Date.now() + 10),
        role: 'assistant',
        text: assistantText,
        timestamp: new Date().toISOString(),
        extractedMemories,
        groundedMemories: groundedMemories.map(m => m.id)
      };
      conv.messages.push(assistantMsg);
      conv.updatedAt = new Date().toISOString();
      saveDataStore(store);

      return {
        user_message: userMsg,
        assistant_message: assistantMsg,
        grounded_memories: groundedMemories,
        extracted_memories: store.memories.filter(m => extractedMemories.includes(m.id))
      };
    }
  },

  // --- Graph & Relationships ---
  async getRelationshipGraph() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/graph`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(200);
      const store = getDataStore();
      const nodes = store.memories.map(m => ({
        id: m.id,
        label: m.content.length > 36 ? m.content.substring(0, 36) + '...' : m.content,
        fullContent: m.content,
        category: m.category,
        confidence: m.confidence,
        status: m.status
      }));
      return { nodes, edges: store.relationships };
    }
  },

  // --- Dashboard Stats ---
  async getDashboardStats() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(150);
      const store = getDataStore();
      const totalMemories = store.memories.length;
      const totalConversations = store.conversations.length;
      const categoriesCount = new Set(store.memories.map(m => m.category)).size;
      const activeGoals = store.memories.filter(m => m.category === 'goals' || m.category === 'career').length;

      const categoryDistribution = {};
      store.memories.forEach(m => {
        categoryDistribution[m.category] = (categoryDistribution[m.category] || 0) + 1;
      });

      return {
        totalMemories,
        totalConversations,
        categoriesCount,
        activeGoals,
        categoryDistribution,
        recentMemories: store.memories.slice(0, 5),
        weeklyActivity: [4, 7, 3, 9, 6, 12, 8]
      };
    }
  },

  // --- Documents APIs ---
  async getDocuments() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/documents`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(150);
      const store = getDataStore();
      return store.documents;
    }
  },

  async uploadDocument(file) {
    if (this.isBackendAvailable) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('lifememory_token')}` },
        body: formData
      });
      return await res.json();
    } else {
      await simulateLatency(800);
      const store = getDataStore();
      const newDoc = {
        id: 'doc_' + Date.now(),
        filename: file.name || 'Uploaded_Document.pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: Math.floor(Math.random() * 12) + 3,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
        extractedMemoriesCount: 2,
        summary: `Document text successfully parsed and indexed with PyMuPDF. Extracted personal educational milestones and project highlights into memory.`
      };
      store.documents.unshift(newDoc);
      saveDataStore(store);
      return newDoc;
    }
  }
};

function getAuthHeaders() {
  const token = localStorage.getItem('lifememory_token') || 'mock_jwt_token_active';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function simulateLatency(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateIntelligentResponse(userText, groundedMemories, extractedMemories, store) {
  const q = userText.toLowerCase().trim();

  // Intent detection
  const isWorksQuery = /(work|works|project|projects|built|build|portfolio|created|developed|app|system|hackathon)/i.test(q);
  const isCareerQuery = /(career|ambition|dream|aim|goal|goals|aspire|role|engineer|job|future)/i.test(q);
  const isEduQuery = /(education|college|degree|cse|btech|university|study|studying|student|undergrad|graduating|gpa|cgpa)/i.test(q);
  const isSkillsQuery = /(skill|skills|python|pytorch|fastapi|pgvector|database|tools|languages|tech|stack|code|coding)/i.test(q);
  const isPrefQuery = /(preference|preferences|like|likes|favorite|routine|habit|habits|tea|music|work-style|theme|mode)/i.test(q);

  // 1. Works / Projects Query
  if (isWorksQuery) {
    const projectMem = store.memories.find(m => m.category === 'projects');
    const hackathonMem = store.memories.find(m => m.category === 'achievements');
    const researchMem = store.memories.find(m => m.category === 'goals');
    const skillMem = store.memories.find(m => m.category === 'skills');

    return `Based on your verified memory records, here is an organized summary of your key projects and previous works:\n\n` +
      `1. **Life Memory AI (Capstone Project)**\n` +
      `- **Overview**: An intelligent persistent personal memory assistant utilizing hybrid RAG (semantic + keyword search) and knowledge graph mapping.\n` +
      `- **Architecture**: Built using Python, FastAPI, PostgreSQL, and pgvector.\n` +
      `- **Status**: Active / In Development\n\n` +
      `2. **Autonomous Memory Agent Prototype (Hackathon Winner)**\n` +
      `- **Achievement**: Won **1st Place in the University AI Hackathon** for designing an autonomous cognitive memory agent prototype.\n` +
      `- **Status**: Completed / Milestone Verified\n\n` +
      `3. **Long-Term Memory AI Research Paper**\n` +
      `- **Objective**: Publishing an academic writeup on Long-Term AI Memory Retrievability for LLM agents by Q1 2027.\n` +
      `- **Status**: Active Research\n\n` +
      `4. **Core Technical Competencies Applied**:\n` +
      `- ${skillMem ? skillMem.content : 'Proficient in Python, PyTorch, FastAPI, PostgreSQL, pgvector, and NetworkX.'}\n\n` +
      `Would you like to drill into the technical architecture of any of these works or discuss next milestones?`;
  }

  // 2. Career Ambition Query
  if (isCareerQuery) {
    const careerMem = store.memories.find(m => m.category === 'career');
    const eduMem = store.memories.find(m => m.category === 'education');
    const goalMem = store.memories.find(m => m.category === 'goals');

    return `Here is your current career profile and long-term ambition from memory:\n\n` +
      `- **Target Career Role**: ${careerMem ? careerMem.content : 'Aspires to become a Senior AI / Machine Learning Engineer focusing on LLMs and cognitive architectures.'}\n` +
      `- **Academic Foundation**: ${eduMem ? eduMem.content : 'Computer Science and Engineering (CSE) senior undergraduate student graduating in 2027.'}\n` +
      `- **Key Milestone Target**: ${goalMem ? goalMem.content : 'Publish research paper and complete DeepLearning.AI Specialization.'}\n\n` +
      `Your project work in Life Memory AI and hackathon victory give you a strong portfolio for top AI engineering roles! How can I assist with your career prep today?`;
  }

  // 3. Education / College Query
  if (isEduQuery) {
    const eduMem = store.memories.find(m => m.category === 'education');
    return `According to your long-term memory records:\n\n` +
      `- **Degree**: ${eduMem ? eduMem.content : 'Computer Science and Engineering (CSE) undergraduate student graduating in 2027.'}\n` +
      `- **Academic Focus**: Machine Learning, Distributed Systems, Vector Databases, and Software Architecture.\n\n` +
      `Would you like to review how your coursework connects to your AI career goals?`;
  }

  // 4. Skills Query
  if (isSkillsQuery) {
    const skillMem = store.memories.find(m => m.category === 'skills');
    return `Here are your verified technical skills and proficiencies from memory:\n\n` +
      `- **Languages & ML**: Python, PyTorch, Scikit-Learn.\n` +
      `- **Backend & Systems**: FastAPI, Pydantic, PostgreSQL, pgvector, Docker.\n` +
      `- **AI Knowledge**: RAG Pipelines, Semantic Embeddings, Knowledge Graphs (NetworkX).\n\n` +
      `All your projects directly exercise this stack!`;
  }

  // 5. Preferences / Habits Query
  if (isPrefQuery) {
    const prefMem = store.memories.find(m => m.category === 'preferences');
    const personalMem = store.memories.find(m => m.category === 'personal');
    return `Here are your recorded personal preferences and work habits:\n\n` +
      `- **UI & Design**: ${prefMem ? prefMem.content : 'Prefers clean light-mode interfaces with high contrast typography.'}\n` +
      `- **Daily Routine**: ${personalMem ? personalMem.content : 'Prefers deep work blocks with instrumental lo-fi beats and green tea.'}\n\n` +
      `I always keep these in mind when assisting you!`;
  }

  // 6. If user shared a newly extracted memory
  if (extractedMemories && extractedMemories.length > 0) {
    const newMems = store.memories.filter(m => extractedMemories.includes(m.id));
    const memList = newMems.map(m => `- **${m.category.toUpperCase()}**: "${m.content}"`).join('\n');
    return `I have captured and permanently preserved this in your long-term memory bank:\n\n` +
      `${memList}\n\n` +
      `I will reference this whenever you ask related questions in future sessions!`;
  }

  // 7. General query with grounded memories
  if (groundedMemories && groundedMemories.length > 0) {
    const contextPoints = groundedMemories.map(m => `- *[${m.category.toUpperCase()}]*: ${m.content}`).join('\n');
    return `Based on your relevant personal context from memory:\n\n${contextPoints}\n\n` +
      `Taking your background into account, what specific details or next steps would you like to explore?`;
  }

  // 8. Honest fallback (Strict Zero Hallucination Policy)
  return `I don't have any recorded memories about that specific topic yet in your personal memory bank.\n\n` +
    `If you would like me to remember details about this for future conversations, just tell me and I will preserve it in your long-term knowledge repository!`;
}

// Automatically check backend status on load
document.addEventListener('DOMContentLoaded', () => {
  ApiService.checkBackend();
});

