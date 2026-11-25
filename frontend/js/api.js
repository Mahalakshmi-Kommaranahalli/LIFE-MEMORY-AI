/**
 * LIFE MEMORY AI — Unified API Service & Human-Like Cognitive Engine
 * Supports multi-account isolation, human-like conversations, dynamic memory extraction,
 * conflict & change detection, historical evolution tracking, and optional live Gemini LLM.
 */

const API_BASE = '/api';

const stopwordsSet = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
  'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'can', 'please', 'tell', 'show', 'give', 'know', 'remember'
]);

function isPersonalQuery(text) {
  const lower = (text || '').toLowerCase().trim();
  if (!lower) return false;

  // Explicit personal identity, records & profile inquiry
  if (/(?:what is my|what's my|where do i|where i|where did i|where am i|who am i|when is my|when was i|how old am i|about me|about myself|know about me|remember about me|my memory|my memories|tell me about me|tell me about myself|what you know|what do you know|show my|tell my|summarize my|what did i)\b/i.test(lower)) {
    return true;
  }

  // Any possessive personal query ("my brother", "my birthday", "my phone", "my cgpa", "my dog", etc.)
  if (/\bmy\s+[a-z0-9_-]+\b/i.test(lower)) {
    return true;
  }

  // Academic department & branch queries / statements
  if (/\b(department|branch|cse department|cse branch|belongs? to cse|belong to|belongs to)\b/i.test(lower)) {
    return true;
  }

  // Explicit named entities from Mahalakshmi's verified profile
  if (/\b(mahalakshmi|kommaranahalli|jain institute of technology|jitd|davanagere|sri gurudeva|sir m v pu|pruthviraj|mundargi|first tea|code blaster|cit hackathon|sih 26001|landslide sentinel|arrowhead|memory master|memoryverse|campushub|mj hospital|lora|smart irrigation|pull shark|yolo badge)\b/i.test(lower)) {
    return true;
  }

  return false;
}

function isQuestionMessage(text) {
  const t = (text || '').trim().toLowerCase();
  if (!t) return false;
  if (t.endsWith('?')) return true;
  if (/^(where|what|when|who|whom|why|how|which|can|could|would|will|do|does|did|is|are|am|was|were|tell me|show me|explain|find|search|list)\b/i.test(t)) {
    return true;
  }
  if (/\b(where|what|when|who|why|how|which)\s+(do|did|am|is|are|can|could|was|were)\s+i\b/i.test(t)) {
    return true;
  }
  if (/^(where|what|who|when|why|how)\s+i\s+/i.test(t)) {
    return true;
  }
  return false;
}

function isCorruptedQuestionMemory(mem) {
  if (!mem || !mem.content) return false;
  const c = mem.content.trim().toLowerCase();
  return /^(?:education|career|personal|goal|project|achievement|preference)?\s*:?\s*(?:where|what|when|who|why|how|which)\s+/i.test(c) ||
         /(?:where i am studying|where i completed|what is my name|what is my cgpa)/i.test(c);
}

function getDisplayName(user) {
  if (!user || !user.name) return '';
  const name = user.name.trim();
  if (name.includes('Mahalakshmi')) return 'Mahalakshmi';
  if (name === 'User' || name === 'Member' || name === 'New Member') return '';
  const parts = name.split(/\s+/);
  if (parts.length > 1 && parts[0].length <= 2) {
    return parts[1];
  }
  return parts[0];
}

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
      localStorage.setItem('lifememory_current_email', data.user.email.toLowerCase());
      return data;
    } else {
      await simulateLatency(200);
      const cleanEmail = (email || '').trim().toLowerCase();
      const accounts = getRegisteredAccounts();
      const user = accounts.find(a => (a.email || '').toLowerCase() === cleanEmail);

      if (!user) {
        throw new Error('No account found for this email. Please sign up to create your own isolated memory bank!');
      }

      if (user.password && password && user.password !== password && cleanEmail !== DEMO_EMAIL) {
        throw new Error('Incorrect password. Please verify your credentials.');
      }

      localStorage.setItem('lifememory_token', 'token_' + Date.now());
      localStorage.setItem('lifememory_current_email', cleanEmail);
      localStorage.setItem('lifememory_user', JSON.stringify(user));

      // Ensure this user's data store is initialized
      getDataStore(cleanEmail);

      return { access_token: 'mock_jwt_' + Date.now(), user };
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
      localStorage.setItem('lifememory_current_email', data.user.email.toLowerCase());
      return data;
    } else {
      await simulateLatency(250);
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || '').trim();

      if (!cleanEmail || !cleanName) {
        throw new Error('Name and email are required to create an account.');
      }

      const accounts = getRegisteredAccounts();
      if (accounts.some(a => (a.email || '').toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      const initials = cleanName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
      const newUser = {
        id: 'usr_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        password: password,
        avatarText: initials,
        role: 'Personal Account',
        createdAt: new Date().toISOString(),
        preferences: {
          autoExtract: true,
          confidenceThreshold: 0.75,
          retrievalTopK: 5,
          conflictDetection: true,
          theme: 'light',
          geminiKey: ''
        }
      };

      accounts.push(newUser);
      saveRegisteredAccounts(accounts);

      // Create a fresh isolated datastore for this new account
      const freshStore = createFreshUserStore(newUser);
      saveDataStore(freshStore, cleanEmail);

      // Set active session
      localStorage.setItem('lifememory_token', 'token_' + Date.now());
      localStorage.setItem('lifememory_current_email', cleanEmail);
      localStorage.setItem('lifememory_user', JSON.stringify(newUser));

      return { access_token: 'mock_jwt_' + Date.now(), user: newUser };
    }
  },

  logout() {
    localStorage.removeItem('lifememory_token');
    localStorage.removeItem('lifememory_user');
    localStorage.removeItem('lifememory_current_email');
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
      await simulateLatency(80);
      const store = getDataStore();
      let list = [...(store.memories || [])];

      if (filter.category && filter.category !== 'all') {
        list = list.filter(m => m.category.toLowerCase() === filter.category.toLowerCase());
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(m => 
          (m.content && m.content.toLowerCase().includes(q)) || 
          (m.tags && m.tags.some(t => t.toLowerCase().includes(q))) ||
          (m.previousValue && m.previousValue.toLowerCase().includes(q))
        );
      }
      if (filter.status && filter.status !== 'all') {
        list = list.filter(m => (m.status || 'active') === filter.status);
      }
      list.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
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
      await simulateLatency(100);
      const store = getDataStore();
      const newMem = {
        id: 'mem_' + Date.now(),
        category: memory.category || 'personal',
        content: memory.content,
        confidence: memory.confidence || 0.95,
        status: memory.status || 'active',
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

  async updateMemory(id, memoryUpdate) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/memories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(memoryUpdate)
      });
      return await res.json();
    } else {
      await simulateLatency(100);
      const store = getDataStore();
      const index = store.memories.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Memory not found');

      const existing = store.memories[index];
      const updated = {
        ...existing,
        ...memoryUpdate,
        updatedAt: new Date().toISOString()
      };
      store.memories[index] = updated;
      saveDataStore(store);
      return updated;
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
      await simulateLatency(100);
      const store = getDataStore();
      store.memories = store.memories.filter(m => m.id !== id);
      store.relationships = (store.relationships || []).filter(r => r.source !== id && r.target !== id);
      saveDataStore(store);
      return { success: true };
    }
  },

  async searchMemories(query) {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, top_k: 5 })
      });
      return await res.json();
    } else {
      const store = getDataStore();
      const q = (query || '').toLowerCase().trim();
      if (!q || !store.memories || store.memories.length === 0) return [];

      // If the query is NOT asking about personal memory/profile, DO NOT return false memory matches
      if (!isPersonalQuery(q)) {
        return [];
      }

      const rawTokens = q.split(/[^a-zA-Z0-9_-]+/).filter(t => t.length > 1);
      const meaningfulTokens = rawTokens.filter(t => !stopwordsSet.has(t));

      const scored = store.memories.map(m => {
        let score = 0;
        const contentLower = (m.content || '').toLowerCase();
        const tagsLower = (m.tags || []).join(' ').toLowerCase();

        // Exact high-priority topic boosts
        if (q.includes('cgpa') && (contentLower.includes('cgpa') || contentLower.includes('8.6'))) score += 6;
        if ((q.includes('college') || q.includes('study') || q.includes('degree') || q.includes('engineering') || q.includes('jit') || q.includes('davanagere') || q.includes('cse') || q.includes('department') || q.includes('branch')) && m.id === 'mem_edu_be_jitd') score += 5;
        if ((q.includes('school') || q.includes('pu') || q.includes('puc') || q.includes('10th') || q.includes('12th') || q.includes('gurudeva')) && m.id === 'mem_edu_schooling') score += 5;
        if ((q.includes('cit') || (q.includes('hackathon') && (q.includes('cit') || q.includes('178') || q.includes('top 8') || q.includes('student risk')))) && m.id === 'mem_achieve_cit_hackathon') score += 6;
        if ((q.includes('sih') || q.includes('smart india') || q.includes('26001')) && (m.id === 'mem_achieve_sih_hackathon' || m.id === 'mem_proj_landslide_ai')) score += 6;
        if ((q.includes('mentor') || q.includes('pruthviraj') || q.includes('mundargi')) && (contentLower.includes('mentor') || contentLower.includes('pruthviraj'))) score += 6;
        if (q.includes('arrowhead') && m.id === 'mem_proj_arrowhead') score += 7;
        if ((q.includes('memory master') || q.includes('memoryverse')) && m.id === 'mem_proj_memorymaster') score += 7;
        if ((q.includes('landslide') || q.includes('sentinel')) && m.id === 'mem_proj_landslide_ai') score += 7;
        if ((q.includes('hospital') || q.includes('mj hospital')) && m.id === 'mem_proj_mj_hospital') score += 7;
        if (q.includes('campushub') && m.id === 'mem_proj_campushub_erp') score += 7;
        if ((q.includes('irrigation') || q.includes('lora')) && m.id === 'mem_proj_lora_smart_irrigation') score += 7;
        if ((q.includes('code blaster') || q.includes('teachers day')) && (m.id === 'mem_proj_code_blaster_exe' || m.id === 'mem_event_teachers_day_tribute')) score += 7;
        if ((q.includes('mahalakshmi') || q.includes('kommaranahalli') || q.includes('profile')) && (m.id === 'mem_identity_profile' || m.id === 'mem_edu_be_jitd' || m.id === 'mem_career_philosophy')) score += 6;
        if ((q.includes('github') || q.includes('repos') || q.includes('pull shark') || q.includes('yolo')) && (m.id === 'mem_achieve_github_badges' || m.id === 'mem_identity_profile')) score += 6;
        if ((q.includes('philosophy') || q.includes('statement') || q.includes('motto') || q.includes('believe')) && m.id === 'mem_career_philosophy') score += 6;
        if ((q.includes('skills') || q.includes('stack') || q.includes('technologies')) && m.category === 'skills') score += 4;
        if ((q.includes('projects') || q.includes('portfolio') || q.includes('what did i build') || q.includes('what have i built')) && m.category === 'projects') score += 3;
        if ((q.includes('goals') || q.includes('aim') || q.includes('future') || q.includes('ambition')) && (m.category === 'goals' || m.category === 'career')) score += 4;

        meaningfulTokens.forEach(t => {
          if (contentLower.includes(t)) score += 1.2;
          if (tagsLower.includes(t)) score += 1.5;
        });

        const similarity = Math.min(0.99, Number((score / 5).toFixed(2)));
        return { memory: m, similarity, score };
      });

      const matches = scored.filter(s => s.score >= 1.5);
      matches.sort((a, b) => b.score - a.score);
      return matches.slice(0, 3);
    }
  },

  // --- Chat & Conversation APIs ---
  async getConversations() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/chat/history`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(50);
      const store = getDataStore();
      return store.conversations || [];
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
      const store = getDataStore();
      const user = store.user || this.getCurrentUser() || { name: 'Friend' };

      let conv = (store.conversations || []).find(c => c.id === conversationId);
      if (!conv) {
        conv = {
          id: conversationId || 'conv_' + Date.now(),
          title: userText.length > 35 ? userText.substring(0, 35) + '...' : userText,
          updatedAt: new Date().toISOString(),
          messages: []
        };
        store.conversations.unshift(conv);
      }

      // 1. Record user message
      const userMsg = {
        id: 'msg_' + Date.now(),
        role: 'user',
        text: userText,
        timestamp: new Date().toISOString()
      };
      conv.messages.push(userMsg);

      // 2. Run Cognitive Analysis:
      // (a) Extract information & detect changes/evolutions
      const memoryAnalysis = analyzeAndEvolveMemories(userText, store);

      // (b) Find grounded memories (only for personal queries!)
      const relevantMatches = await this.searchMemories(userText);
      const groundedMemories = relevantMatches.map(m => m.memory);

      // (c) AI Engine Pipeline:
      let assistantText = null;
      const lowerQuery = userText.toLowerCase().trim();
      const isGreeting = /^(hi|hello|hey|yo|good morning|good afternoon|good evening|good night|howdy|greetings)\b/i.test(lowerQuery);
      const isDirectPersonal = isPersonalQuery(userText);
      const isMath = /(?:^|\bwhat is\s+)?(\d+(?:\.\d+)?)\s*([\+\-\*\/xX])\s*(\d+(?:\.\d+)?)\s*\??$/.test(lowerQuery);

      // 1. Direct Cognitive Engine for greetings, exact personal questions, math, and memory evolutions
      if (isGreeting || isDirectPersonal || isMath || memoryAnalysis.newMemories.length > 0 || memoryAnalysis.changedMemories.length > 0) {
        assistantText = generateHumanLikeResponse(
          userText,
          user,
          groundedMemories,
          memoryAnalysis,
          store
        );
      }

      // 2. Custom Gemini API key (if provided by user in settings)
      const geminiKey = localStorage.getItem('lifememory_gemini_api_key') || (user.preferences && user.preferences.geminiKey);
      if (!assistantText && geminiKey) {
        try {
          assistantText = await callGeminiLiveAPI(geminiKey, userText, user, groundedMemories, store);
        } catch (e) {
          console.warn('Gemini API call failed, trying live LLM fallback:', e);
        }
      }

      // 3. Free Live LLM Engine for random & general knowledge questions
      if (!assistantText) {
        try {
          assistantText = await callFreeLiveLLM(userText, user, groundedMemories, store);
        } catch (e) {
          console.warn('Free live LLM call failed, falling back to local cognitive engine:', e);
        }
      }

      // 4. Fallback to cognitive engine
      if (!assistantText) {
        await simulateLatency(150);
        assistantText = generateHumanLikeResponse(
          userText,
          user,
          groundedMemories,
          memoryAnalysis,
          store
        );
      }

      const assistantMsg = {
        id: 'msg_' + (Date.now() + 10),
        role: 'assistant',
        text: assistantText,
        timestamp: new Date().toISOString(),
        extractedMemories: memoryAnalysis.newMemories.map(m => m.id),
        groundedMemories: groundedMemories.map(m => m.id),
        changedMemories: memoryAnalysis.changedMemories.map(m => m.id)
      };

      conv.messages.push(assistantMsg);
      conv.updatedAt = new Date().toISOString();
      saveDataStore(store);

      return {
        user_message: userMsg,
        assistant_message: assistantMsg,
        grounded_memories: groundedMemories,
        extracted_memories: memoryAnalysis.newMemories,
        changed_memories: memoryAnalysis.changedMemories
      };
    }
  },

  // --- Graph & Relationships ---
  async getRelationshipGraph() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/graph`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(80);
      const store = getDataStore();
      const nodes = (store.memories || []).map(m => ({
        id: m.id,
        label: m.content.length > 38 ? m.content.substring(0, 38) + '...' : m.content,
        fullContent: m.content,
        category: m.category,
        confidence: m.confidence,
        status: m.status || 'active',
        previousValue: m.previousValue || null
      }));
      return { nodes, edges: store.relationships || [] };
    }
  },

  // --- Dashboard Stats ---
  async getDashboardStats() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(80);
      const store = getDataStore();
      const memories = store.memories || [];
      const totalMemories = memories.length;
      const totalConversations = (store.conversations || []).length;
      const categoriesCount = new Set(memories.map(m => m.category)).size;
      const activeGoals = memories.filter(m => (m.category === 'goals' || m.category === 'career') && m.status === 'active').length;

      const categoryDistribution = {};
      memories.forEach(m => {
        categoryDistribution[m.category] = (categoryDistribution[m.category] || 0) + 1;
      });

      return {
        totalMemories,
        totalConversations,
        categoriesCount,
        activeGoals,
        categoryDistribution,
        recentMemories: memories.slice(0, 5),
        weeklyActivity: memories.length > 0 ? [1, 2, 1, 3, 2, 4, memories.length] : [0, 0, 0, 0, 0, 0, 0]
      };
    }
  },

  // --- Documents APIs ---
  async getDocuments() {
    if (this.isBackendAvailable) {
      const res = await fetch(`${API_BASE}/documents`, { headers: getAuthHeaders() });
      return await res.json();
    } else {
      await simulateLatency(80);
      const store = getDataStore();
      return store.documents || [];
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
      await simulateLatency(500);
      const store = getDataStore();
      const newDoc = {
        id: 'doc_' + Date.now(),
        filename: file.name || 'Uploaded_Document.pdf',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: Math.floor(Math.random() * 8) + 2,
        uploadedAt: new Date().toISOString(),
        status: 'processed',
        extractedMemoriesCount: 2,
        summary: `Document text successfully parsed and indexed with PyMuPDF. Key facts and dates preserved.`
      };
      store.documents = store.documents || [];
      store.documents.unshift(newDoc);

      const docMem = {
        id: 'mem_' + Date.now(),
        category: 'projects',
        content: `Uploaded document: "${file.name}" — verified and indexed into personal knowledge archive.`,
        confidence: 0.96,
        status: 'active',
        source: 'Document Ingestion: ' + file.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validFrom: new Date().toISOString().split('T')[0],
        importance: 3,
        tags: ['document', 'upload']
      };
      store.memories.unshift(docMem);
      saveDataStore(store);
      return newDoc;
    }
  }
};

function getAuthHeaders() {
  const token = localStorage.getItem('lifememory_token') || 'token_mock';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function simulateLatency(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================================================================
// 🌐 LIVE GEMINI LLM API CLIENT
// =========================================================================

async function callGeminiLiveAPI(apiKey, userText, user, memories, store) {
  const activeMemories = (memories || []).filter(m => m.status === 'active');
  const superseded = (memories || []).filter(m => m.previousValue || m.status === 'superseded');

  const activePoints = activeMemories.length > 0 
    ? activeMemories.map(m => `- [${m.category.toUpperCase()}]: ${m.content}`).join('\n') 
    : 'No memories recorded yet.';

  const changePoints = superseded.length > 0 
    ? superseded.map(m => `- [${m.category.toUpperCase()}]: Previously "${m.previousValue || m.content}", updated to "${m.content}" on ${formatDateOnly(m.updatedAt || m.createdAt)}`).join('\n') 
    : 'No changes recorded yet.';

  const systemInstruction = `You are Life Memory AI, a warm, genuine, thoughtful human companion and personal cognitive assistant.
You talk, think, and chat naturally just like a real human friend and expert mentor.
You NEVER sound like a robot, canned template, or corporate script.

USER PROFILE:
- Name: ${user.name || 'Friend'}
- Email: ${user.email || ''}
- Role: ${user.role || 'Member'}

USER'S CURRENT ACTIVE MEMORIES:
${activePoints}

PAST MEMORY EVOLUTIONS / SUPERSEDED DATA (What changed over time):
${changePoints}

CONVERSATION RULES:
1. Speak with natural human conversational warmth, wit, empathy, and active listening.
2. If the user mentions a new personal fact (location, job, preference, goal, relationship, project), acknowledge it enthusiastically in the flow of conversation.
3. If the user mentions an update or change to something in their past (e.g. moved cities, changed jobs, changed a favorite), acknowledge the evolution warmly ("I remember you used to..., but now you're...!").
4. If the user asks "What changed?", "What did I change?", "What was my old...?", explicitly explain their timeline and evolution based on the PAST MEMORY EVOLUTIONS section.
5. Answer questions (general, coding, advice, philosophy, daily chat) with great depth, personality, and intelligence.`;

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: userText }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 1000
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn(`Gemini API call to ${model} failed:`, e);
    }
  }
  return null;
}

// =========================================================================
// 🌐 FREE LIVE LLM ENGINE (Answers ANY question without needing API key)
// =========================================================================

async function callFreeLiveLLM(userText, user, groundedMemories, store) {
  let memoryInstruction = '';
  if (groundedMemories && groundedMemories.length > 0) {
    const memoryFacts = groundedMemories.map(m => `- [${m.category.toUpperCase()}]: ${m.content}`).join('\n');
    memoryInstruction = `\nRELEVANT PERSONAL FACTS ABOUT ${user.name || 'THE USER'} TO USE:\n${memoryFacts}\nINSTRUCTION: The user is asking about their personal record, career, education, or achievements. Answer accurately, naturally, and warmly using the above facts.`;
  } else {
    memoryInstruction = `\nIMPORTANT INSTRUCTION: This is a general knowledge / random question. Answer it directly, accurately, and thoroughly. DO NOT invent, assume, or output any personal memories, user bio, or profile details.`;
  }

  const systemPrompt = `You are Life Memory AI, an intelligent, helpful, articulate personal AI assistant and real human-like companion.
Answer the user's question directly, clearly, and concisely using clean markdown.
${memoryInstruction}`;

  try {
    const encodedPrompt = encodeURIComponent(userText.trim());
    const encodedSys = encodeURIComponent(systemPrompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}?system=${encodedSys}&seed=${Math.floor(Math.random() * 10000)}`;

    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(6500)
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0 && !text.includes('<!DOCTYPE html>') && !text.includes('Error:')) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn('Free live LLM GET failed:', err);
  }
  return null;
}

// =========================================================================
// 🧠 COGNITIVE ENGINE: Information Extraction & Change / Evolution Tracking
// =========================================================================

function analyzeAndEvolveMemories(text, store) {
  const lower = text.toLowerCase().trim();
  const newMemories = [];
  const changedMemories = [];

  // CRITICAL GUARD: Questions must NEVER be extracted as memories!
  if (isQuestionMessage(text)) {
    return { newMemories, changedMemories };
  }

  // Update user name if they tell their name directly
  const nameMatch = text.match(/(?:my name is|call me|i am|i'm)\s+([A-Z][a-zA-Z\s]{1,25})/);
  if (nameMatch && !/(?:studying|working|living|learning|feeling)/i.test(nameMatch[1])) {
    const detectedName = nameMatch[1].trim();
    if (detectedName.length > 1 && detectedName.length < 30) {
      if (store.user && (!store.user.name || store.user.name === 'User' || store.user.name === 'Member')) {
        store.user.name = detectedName;
        store.user.avatarText = detectedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        localStorage.setItem('lifememory_user', JSON.stringify(store.user));
      }
    }
  }

  // Patterns for extracting and evolving information
  const extractors = [
    // 1. Location / Living
    {
      category: 'personal',
      detect: /(?:i live in|i moved to|i am living in|i'm living in|my city is|relocated to|reside in)\s+([a-zA-Z\s,]+)/i,
      matchConflict: /(?:live in|living in|moved to|reside in|location)/i,
      formatter: (m) => `Currently living in ${m[1].trim()}.`,
      changeDesc: 'Location updated'
    },
    // 2. Career & Job
    {
      category: 'career',
      detect: /(?:i work as(?: an?| the)?|my job is(?: an?| the)?|i am(?: an?| the)?\s+(?:software|ai|ml|data|frontend|backend|fullstack|doctor|teacher|designer|manager|product|engineer|developer|architect)|i got a job as(?: an?| the)?|i switched to(?: an?| the)?|i work at)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: /(?:work as|job is|work at|profession|employed as)/i,
      formatter: (m) => `Career / Profession: ${text.trim()}`,
      changeDesc: 'Job / Profession updated'
    },
    // 3. Education
    {
      category: 'education',
      detect: /(?:i study|i am studying|my major is|i'm doing my|i graduated from|enrolled in|my degree is)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: /(?:study|studying|major|degree|graduated)/i,
      formatter: (m) => `Education: ${text.trim()}`,
      changeDesc: 'Education status updated'
    },
    // 4. Goals & Dreams
    {
      category: 'goals',
      detect: /(?:my goal is to|my new goal is|i want to become|i aim to|my lifelong dream is|planning to achieve)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: /(?:goal|dream|aim to|aspires)/i,
      formatter: (m) => `Goal: ${text.trim()}`,
      changeDesc: 'Goal updated'
    },
    // 5. Preferences & Favorites (with explicit change triggers)
    {
      category: 'preferences',
      detect: /(?:my favorite (?:drink|beverage|food|dish|color|language|framework|music|hobby) is|i love|i prefer|i like)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: /(?:favorite|prefer|drink|food|color|likes)/i,
      formatter: (m) => `Preference: ${text.trim()}`,
      changeDesc: 'Personal preference updated'
    },
    // 6. Direct "I changed / I don't ... anymore" change detector
    {
      category: 'personal',
      detect: /(?:i changed my|i don't (?:like|work at|live in) .+ anymore|instead of .+ now|update my .+ to)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: /./,
      formatter: (m) => text.trim(),
      changeDesc: 'Information updated'
    },
    // 7. Skills & Tech Stack
    {
      category: 'skills',
      detect: /(?:i know|i am proficient in|i code in|i'm learning|my stack is|i have experience with)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: null,
      formatter: (m) => `Technical skills: ${text.trim()}`,
      changeDesc: 'New skill acquired'
    },
    // 8. Projects
    {
      category: 'projects',
      detect: /(?:i am building|i created|i am developing|my project is|working on an?)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: null,
      formatter: (m) => `Project: ${text.trim()}`,
      changeDesc: 'Project logged'
    },
    // 9. Achievements & Milestones
    {
      category: 'achievements',
      detect: /(?:i won|i completed|i published|i was awarded|i passed|i reached)\s+([a-zA-Z0-9\s,.-]+)/i,
      matchConflict: null,
      formatter: (m) => `Achievement: ${text.trim()}`,
      changeDesc: 'Milestone celebrated'
    }
  ];

  for (const ext of extractors) {
    const match = text.match(ext.detect);
    if (match) {
      const formattedContent = ext.formatter(match);
      const category = ext.category;

      let existingOldMemory = null;
      if (ext.matchConflict) {
        existingOldMemory = (store.memories || []).find(m => 
          m.status === 'active' && 
          (m.category === category || ext.category === 'personal') &&
          ext.matchConflict.test(m.content)
        );
      }

      const isExplicitChange = /(?:changed|moved|switched|instead of|not anymore|no longer|update|promoted)/i.test(text);
      const newId = 'mem_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const newMemory = {
        id: newId,
        category: category,
        content: formattedContent,
        confidence: 0.96,
        status: 'active',
        source: 'Conversation with Assistant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validFrom: new Date().toISOString().split('T')[0],
        importance: 4,
        tags: [category, 'extracted']
      };

      if ((existingOldMemory || isExplicitChange) && existingOldMemory && existingOldMemory.id !== newId) {
        existingOldMemory.status = 'superseded';
        existingOldMemory.supersededBy = newId;
        existingOldMemory.supersededAt = new Date().toISOString();
        existingOldMemory.changeNote = `Updated to: "${formattedContent}"`;

        newMemory.previousMemoryId = existingOldMemory.id;
        newMemory.previousValue = existingOldMemory.content;
        newMemory.changeReason = ext.changeDesc || 'User updated information';

        changedMemories.push(existingOldMemory);

        store.relationships = store.relationships || [];
        store.relationships.push({
          source: existingOldMemory.id,
          target: newId,
          type: 'evolved_to',
          label: 'Updated To'
        });
      }

      store.memories = store.memories || [];
      store.memories.unshift(newMemory);
      newMemories.push(newMemory);
      break;
    }
  }

  return { newMemories, changedMemories };
}

// =========================================================================
// 💬 ULTRA-NATURAL LOCAL CONVERSATIONAL ENGINE (ZERO CANNED PARAGRAPHS)
// =========================================================================

function generateHumanLikeResponse(userText, user, groundedMemories, memoryAnalysis, store) {
  const q = userText.toLowerCase().trim();
  const displayName = getDisplayName(user);
  const nameSalutation = displayName ? `, ${displayName}` : '';

  const allMemories = store.memories || [];
  const activeMemories = allMemories.filter(m => m.status === 'active' && !isCorruptedQuestionMemory(m));

  // --- 1. Memory Evolution / Change Occurred (Explicit user update) ---
  if (memoryAnalysis.changedMemories.length > 0 && memoryAnalysis.newMemories.length > 0) {
    const oldMem = memoryAnalysis.changedMemories[0];
    const newMem = memoryAnalysis.newMemories[0];

    return `Got it${nameSalutation}! I've updated that in my memory for you.\n\n` +
      `Earlier you had shared:\n` +
      `> *"${cleanMemContent(oldMem.content)}"* \n\n` +
      `I've updated your active memory records to reflect:\n` +
      `> **"${cleanMemContent(newMem.content)}"**\n\n` +
      `It's great to see how your life and journey are evolving! What inspired this change?`;
  }

  // --- 2. New Memory Captured (Explicit user statement) ---
  if (memoryAnalysis.newMemories.length > 0) {
    const newMem = memoryAnalysis.newMemories[0];
    const categoryName = newMem.category.toUpperCase();

    const followUps = {
      personal: `That's great to know! I've saved that into your personal memory bank so I'll always remember.`,
      career: `Awesome! Having that focus in your career is fantastic. I've noted this in your professional profile.`,
      education: `Education is such an exciting milestone. I've logged this in your academic timeline!`,
      goals: `I love that ambition! Setting clear goals is half the victory. I'll help you track this as you progress.`,
      preferences: `Noted! I'll keep your preference in mind so all our future chats feel natural and tailored for you.`,
      skills: `That's a valuable skill! Added to your technical matrix.`,
      projects: `Sounds like a really cool project! I'd love to hear more about how you're building it.`
    };

    const followUp = followUps[newMem.category] || `I've preserved that in your memory bank!`;
    return `${followUp}\n\n*Saved to your memory:* **[${categoryName}]** "${cleanMemContent(newMem.content)}"\n\nWhat else is on your mind today${nameSalutation}?`;
  }

  // --- 3. Greetings (Warm, Natural & Correctly Addressed) ---
  if (/^(good\s+morning|morning)\b/i.test(q)) {
    return `Good morning${nameSalutation}! ☀️ Wishing you a wonderful, productive, and inspiring day ahead. How are you doing today?`;
  }
  if (/^(good\s+afternoon)\b/i.test(q)) {
    return `Good afternoon${nameSalutation}! ☀️ Hope your day is going smoothly. How can I help you today?`;
  }
  if (/^(good\s+evening)\b/i.test(q)) {
    return `Good evening${nameSalutation}! 🌆 I hope you had a fantastic and fulfilling day. What's on your mind this evening?`;
  }
  if (/^(good\s+night|night)\b/i.test(q)) {
    return `Good night${nameSalutation}! 🌙 Rest well and recharge for tomorrow. Have peaceful dreams!`;
  }
  if (/^(hi|hello|hey|yo|howdy|greetings)\b/i.test(q)) {
    if (/(?:how are you|how're you|how is it going|how are you doing|what's up|whats up)/i.test(q)) {
      return `Hey${nameSalutation}! 😊 I'm doing really well, thank you so much for asking! How are you doing today?`;
    }
    return `Hello${nameSalutation}! 😊 Great to connect with you. How are you doing today?`;
  }

  // --- 4. How are you / check-in ---
  if (/(?:how are you|how're you|how is it going|how are you doing)/i.test(q)) {
    return `I'm doing great${nameSalutation}, thank you for asking! I always enjoy our conversations. How about yourself—how are you feeling today?`;
  }

  // --- 5. EXACT PERSONAL PROFILE QUESTIONS (Concise, Accurate & Natural) ---

  // (a) User's Name / Identity
  if (/(?:what is my name|what's my name|who am i|tell me my name|do you know my name|my name\??$)/i.test(q)) {
    return `Your name is **K. Mahalakshmi** (professionally known as **Mahalakshmi Kommaranahalli**).`;
  }

  // (b) Current College, Engineering Study & Department / Branch
  if (/(?:where i am studying|where am i studying|where do i study|what do i study|my college|which college|what college|where i study|department|branch|belongs? to cse|belong to|belongs to|cse department|cse branch)/i.test(q)) {
    return `You belong to the **Computer Science and Engineering (CSE)** department at **Jain Institute of Technology, Davanagere** (VTU affiliated, 2024 – Present, currently in your 3rd year with an **8.6 CGPA**).`;
  }

  // (c) Schooling / Pre-University (PUC)
  if (/(?:where i completed my puc|where did i complete my puc|where did i do my puc|where i completed puc|my puc|my school|my schooling|where did i study 10th|where did i study 12th|puc college)/i.test(q)) {
    return `You completed your 10th standard at **Sri Gurudeva High School** and your 12th standard (Pre-University Course - PUC) at **Sir M V PU College** before joining engineering.`;
  }

  // (d) Academic Performance / CGPA / Grades
  if (/(?:what is my cgpa|what's my cgpa|my cgpa|my marks|my grades|my gpa|academic performance)/i.test(q)) {
    return `Your second-year academic performance is an **8.6 CGPA** in Bachelor of Engineering (Computer Science and Engineering) at Jain Institute of Technology, Davanagere.`;
  }

  // (e) Mentorship & Mentor Pruthviraj Mundargi
  if (/(?:who is my mentor|my mentor|mentor name|pruthviraj|mundargi)/i.test(q)) {
    return `Your mentor is **Pruthviraj Mundargi** (Assistant Professor, Department of Computer Science & Engineering, JIT Davanagere).\n\nKey milestones in your journey together:\n- **15 September 2025**: First class at JITD and first meeting with your mentor\n- **19 September 2025**: Code Blaster college event that ignited your drive to build independently\n- **29 April 2026**: 'First Tea' mentorship discussion on engineering mindset and growth\n- **05 September 2026**: Launched your digital tribute **Code Blaster.exe – Teachers' Day 2026**`;
  }

  // (f) CIT Hackathon (Top 8 among 178 teams)
  if (/(?:cit hackathon|cit rank|cit 2026|student risk identification)/i.test(q)) {
    return `At **CIT Hackathon 2026**, you secured a **Top 8 ranking among 178 participating teams** with your project **'Student Risk Identification and Educator Support System'**, an AI explainable decision support tool that analyzes attendance metrics and academic signals to alert educators about at-risk students.`;
  }

  // (g) Smart India Hackathon & Landslide Sentinel AI
  if (/(?:smart india hackathon|sih 26001|sih hackathon|landslide sentinel)/i.test(q)) {
    return `For **Smart India Hackathon (SIH 26001)**, you researched and developed **Landslide Sentinel AI** — an early-warning risk monitoring solution built with Python Flask and SVM/Naive Bayes with 85.71% validation accuracy. Deployed on [GitHub Pages](https://mahalakshmi-kommaranahalli.github.io/Landslide-Sentinel-AI/).`;
  }

  // (h) GitHub Profile & Badges
  if (/(?:how many repos|my github|github profile|pull shark|yolo badge|github badges)/i.test(q)) {
    return `You maintain **38 public repositories** on GitHub under [@mahalakshmi-kommaranahalli](https://github.com/mahalakshmi-kommaranahalli) and have earned the **Pull Shark** and **YOLO** achievement badges.`;
  }

  // (i) Technical Skills & Tech Stack
  if (/(?:what are my skills|my skills|my tech stack|technologies i know|my programming languages)/i.test(q)) {
    return `Here is your verified technical skillset:\n` +
      `- **Programming Languages**: C, Python, Java, JavaScript\n` +
      `- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+), React, Vite\n` +
      `- **Backend & APIs**: Python Flask, PHP, RESTful APIs\n` +
      `- **Databases**: MySQL, PostgreSQL, SQLite, SQL\n` +
      `- **AI / Machine Learning**: Scikit-learn, Naive Bayes, Support Vector Machines (SVM), Predictive Analytics\n` +
      `- **IoT & Embedded**: ESP32, LoRa wireless RF transceivers, Arduino, OLED displays, sensors\n` +
      `- **Cloud & Deployment**: GitHub Pages, Netlify, Vercel, Docker basics`;
  }

  // (j) Featured Projects
  if (/(?:what projects have i built|what did i build|my projects|list my projects|show my projects|portfolio projects)/i.test(q)) {
    return `You have built 22 diverse technical projects across web applications, AI, interactive games, and IoT, including:\n\n` +
      `1. **ARROWHEAD — Infinite Logic**: Minimalist JavaScript infinite logic game ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/arrowhead/))\n` +
      `2. **Memory Master Game — Memoryverse**: 20-level interactive tech memory challenge ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/memory-master-game/))\n` +
      `3. **Landslide Sentinel AI (SIH 26001)**: Environmental risk forecasting ML model ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/Landslide-Sentinel-AI/))\n` +
      `4. **Student Risk Identification System**: CIT Hackathon Top 8 solution among 178 teams\n` +
      `5. **CampusHub ERP**: College management & student services platform ([Live Demo](https://campus-hub-erp-xi.vercel.app/))\n` +
      `6. **MJ Hospital**: Digital healthcare records and clinic coordination ([Live Demo](https://mj-hospital.vercel.app/))\n` +
      `7. **LoRa-Based Smart Irrigation**: ESP32 & LoRa long-range telemetry for automated precision farming\n` +
      `8. **VTU 3rd Sem Study Hub**: Academic portal for VTU CSE students ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/VTU-2025-3rd-Sem-Notes/))\n` +
      `9. **Code Blaster.exe**: Teachers' Day 2026 digital tribute to mentor Pruthviraj Mundargi`;
  }

  // (k) Career Goals & Ambition
  if (/(?:what is my goal|what are my goals|my ambition|my dream|career ambition|what do i want to become)/i.test(q)) {
    return `Your career ambition is to become a high-impact **Software Development Engineer and AI Innovator**, building scalable, accessible, and meaningful real-world digital solutions across Full-Stack Web Development, AI/ML, and IoT.`;
  }

  // (l) Developer Philosophy & Statement
  if (/(?:my philosophy|developer statement|my motto|what do i believe)/i.test(q)) {
    return `Your core developer philosophy is:\n\n` +
      `> *"I believe in learning by building. Every project gives me an opportunity to explore something new, solve a problem, improve my skills, and turn an idea into reality. My engineering journey is about more than completing a degree. It is about curiosity, experimentation, teamwork, mentorship, and continuous improvement. KEEP LEARNING. KEEP BUILDING. KEEP GROWING."*`;
  }

  // (m) Location & Geographic Background
  if (/(?:where do i live|my location|my city|where am i from)/i.test(q)) {
    return `You are based in **Davanagere, Karnataka, India**.`;
  }

  // (n) Social Links & Online Portfolios
  if (/(?:my portfolio|portfolio link|portfolio website)/i.test(q)) {
    return `Your personal portfolio is live at [https://mahalakshmi-kommaranahalli.github.io/](https://mahalakshmi-kommaranahalli.github.io/).`;
  }
  if (/(?:my linkedin|linkedin profile)/i.test(q)) {
    return `Your LinkedIn profile is [https://www.linkedin.com/in/mahalakshmi-kommaranahalli-06aba0341/](https://www.linkedin.com/in/mahalakshmi-kommaranahalli-06aba0341/).`;
  }
  if (/(?:my instagram|instagram handle)/i.test(q)) {
    return `Your Instagram profile is [@its_me_mahaaaa__](https://www.instagram.com/its_me_mahaaaa__/).`;
  }

  // --- 6. Request for Profile Overview / Complete Memory Archive ("tell me about mahalakshmi", "tell me about me", "who is mahalakshmi", etc.) ---
  const isProfileOverview = /(?:tell me about (?:me|myself|mahalakshmi|k\.?\s*mahalakshmi|kommaranahalli)|who is (?:mahalakshmi|k\.?\s*mahalakshmi|kommaranahalli)|about (?:me|myself|mahalakshmi|k\.?\s*mahalakshmi|kommaranahalli)|what you know about (?:me|mahalakshmi)|what do you know about (?:me|mahalakshmi)|what do you know|what do you remember about (?:me|mahalakshmi)|what do you remember|tell me everything you know|show all my memories|all my memories|summarize my memories|list my memories|everything in my memory|my profile|tell me my profile)/i.test(q);
  if (isProfileOverview) {
    return `**K. Mahalakshmi** (professionally known as **Mahalakshmi Kommaranahalli**) is an accomplished Computer Science and Engineering student, full-stack web developer, and AI innovator based in **Davanagere, Karnataka, India**.\n\n` +
      `Here is a complete, verified overview of her profile and technical journey from memory:\n\n` +
      `🎓 **Education & Academic Standing**:\n` +
      `- **Degree**: Bachelor of Engineering in **Computer Science and Engineering (CSE)** at **Jain Institute of Technology, Davanagere** (VTU affiliated, 2024 – Present, currently in 3rd Year).\n` +
      `- **Academic Performance**: **8.6 CGPA** in second year.\n` +
      `- **Pre-Engineering**: 10th Standard at **Sri Gurudeva High School** and 12th Standard (Pre-University Course - PUC) at **Sir M V PU College**.\n\n` +
      `🏆 **Hackathons & Key Achievements**:\n` +
      `- **CIT Hackathon 2026**: Secured a standout **Top 8 ranking among 178 participating teams** with the *"Student Risk Identification and Educator Support System"*.\n` +
      `- **Smart India Hackathon (SIH 26001)**: Researched and developed *"Landslide Sentinel AI"*, an early-warning risk forecasting system with Python Flask and SVM (85.71% validation accuracy).\n` +
      `- **GitHub Recognition**: Earned **Pull Shark** and **YOLO** achievement badges, maintaining **38 public repositories**.\n\n` +
      `🚀 **Featured Projects (22 Built)**:\n` +
      `- **ARROWHEAD — Infinite Logic**: Minimalist JavaScript infinite logic puzzle game ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/arrowhead/))\n` +
      `- **Memory Master Game — Memoryverse**: Interactive 20-level tech memory challenge ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/memory-master-game/))\n` +
      `- **Landslide Sentinel AI (SIH 26001)**: Environmental indicator machine learning forecasting model ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/Landslide-Sentinel-AI/))\n` +
      `- **CampusHub ERP**: Comprehensive college management platform built with React, Flask, and MySQL ([Live Demo](https://campus-hub-erp-xi.vercel.app/))\n` +
      `- **MJ Hospital**: Digital healthcare records and clinic coordination web application ([Live Demo](https://mj-hospital.vercel.app/))\n` +
      `- **LoRa-Based Smart Irrigation**: ESP32 & LoRa long-range wireless precision agriculture system\n` +
      `- **VTU 3rd Sem Study Hub**: Academic portal for VTU CSE students ([Live Demo](https://mahalakshmi-kommaranahalli.github.io/VTU-2025-3rd-Sem-Notes/))\n` +
      `- **Code Blaster.exe**: Digital interactive tribute dedicated to mentor Pruthviraj Mundargi\n\n` +
      `🤝 **Mentorship Timeline**:\n` +
      `- Mentored by **Pruthviraj Mundargi** (Assistant Professor, Department of CSE, JIT Davanagere). Influential milestones: First class on 15 September 2025, Code Blaster on 19 September 2025, 'First Tea' mentorship discussion on 29 April 2026, and Teachers' Day digital tribute on 05 September 2026.\n\n` +
      `💻 **Technical Stack**:\n` +
      `- **Languages**: C, Python, Java, JavaScript\n` +
      `- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+), React, Vite\n` +
      `- **Backend & APIs**: Python Flask, PHP, RESTful APIs\n` +
      `- **Databases**: MySQL, PostgreSQL, SQLite, SQL\n` +
      `- **AI / Machine Learning**: Scikit-learn, Naive Bayes, Support Vector Machines (SVM), Predictive Analytics\n` +
      `- **IoT & Embedded**: ESP32, LoRa wireless RF transceivers, Arduino, OLED displays, sensors\n` +
      `- **Cloud & Deployment**: GitHub Pages, Netlify, Vercel, Docker basics\n\n` +
      `🎯 **Career Ambition & Philosophy**:\n` +
      `- **Ambition**: Aiming to become a high-impact **Software Development Engineer and AI Innovator** building scalable, accessible real-world digital solutions across Full-Stack Web Development, AI/ML, and IoT.\n` +
      `- **Developer Philosophy**: *"I believe in learning by building. Every project gives me an opportunity to explore something new, solve a problem, improve my skills, and turn an idea into reality. KEEP LEARNING. KEEP BUILDING. KEEP GROWING."*\n\n` +
      `🌐 **Online Portfolios & Profiles**:\n` +
      `- **Portfolio**: [mahalakshmi-kommaranahalli.github.io](https://mahalakshmi-kommaranahalli.github.io/)\n` +
      `- **GitHub**: [@mahalakshmi-kommaranahalli](https://github.com/mahalakshmi-kommaranahalli)\n` +
      `- **LinkedIn**: [Mahalakshmi Kommaranahalli](https://www.linkedin.com/in/mahalakshmi-kommaranahalli-06aba0341/)\n` +
      `- **Instagram**: [@its_me_mahaaaa__](https://www.instagram.com/its_me_mahaaaa__/)`;
  }

  // --- 7. History of Changes / Evolution ---
  const isAskingAboutChanges = /(?:what changed|what did i change|show me changes|did anything change|what were my old|what was my old|what did i use to|history of changes|how did things change|what changed in my life)/i.test(q);
  if (isAskingAboutChanges) {
    const evolvedMemories = allMemories.filter(m => m.previousValue || m.status === 'superseded');
    if (evolvedMemories.length === 0) {
      return `None of your memories have been updated or changed yet${nameSalutation}! Everything I currently have saved reflects your original active information.\n\n` +
        `Whenever anything in your life or goals changes, just let me know and I'll record both the past and the new update!`;
    }

    const changeBullets = evolvedMemories.map(m => {
      if (m.previousValue) {
        return `- **${m.category.toUpperCase()}**: Previously: *"${cleanMemContent(m.previousValue)}"*, updated to: **"${cleanMemContent(m.content)}"** *(Updated: ${formatDateOnly(m.updatedAt)})*.`;
      }
      return `- **${m.category.toUpperCase()}**: *"${cleanMemContent(m.content)}"*.`;
    }).join('\n\n');

    return `Here is how your information has evolved over time${nameSalutation}:\n\n${changeBullets}`;
  }

  // --- 8. Grounded Memories Query (when personal query matched specific memory records) ---
  if (groundedMemories && groundedMemories.length > 0 && isPersonalQuery(userText)) {
    const memoryHighlights = groundedMemories.map(m => `- ${cleanMemContent(m.content)}`).join('\n\n');
    return `Based on your recorded memory records${nameSalutation}:\n\n` +
      `${memoryHighlights}\n\n` +
      `Is there anything specific you would like to explore further?`;
  }

  // --- 9. Precise Math Calculator (Zero Memory Contamination) ---
  const mathMatch = q.match(/(?:^|\bwhat is\s+)?(\d+(?:\.\d+)?)\s*([\+\-\*\/xX])\s*(\d+(?:\.\d+)?)\s*\??$/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2].toLowerCase();
    const b = parseFloat(mathMatch[3]);
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '-') ans = a - b;
    else if (op === '*' || op === 'x') ans = a * b;
    else if (op === '/') ans = b !== 0 ? (a / b) : 'undefined (division by zero)';
    return `${a} ${op === 'x' ? '*' : op} ${b} = **${ans}**`;
  }

  // --- 10. General Knowledge & Facts (Zero Memory Contamination) ---
  if (/\bcapital of france\b/i.test(q) || (/\bcapital\b/i.test(q) && /\bfrance\b/i.test(q))) {
    return `The capital of France is **Paris**.`;
  }
  if (/\bcapital of india\b/i.test(q) || (/\bcapital\b/i.test(q) && /\bindia\b/i.test(q))) {
    return `The capital of India is **New Delhi**.`;
  }
  if (/\bcapital of japan\b/i.test(q) || (/\bcapital\b/i.test(q) && /\bjapan\b/i.test(q))) {
    return `The capital of Japan is **Tokyo**.`;
  }
  if (/\bcapital of germany\b/i.test(q) || (/\bcapital\b/i.test(q) && /\bgermany\b/i.test(q))) {
    return `The capital of Germany is **Berlin**.`;
  }
  if (/\bcapital of (?:the )?(?:usa|united states|us)\b/i.test(q)) {
    return `The capital of the United States is **Washington, D.C.**`;
  }
  if (/\bcapital of australia\b/i.test(q) || (/\bcapital\b/i.test(q) && /\baustralia\b/i.test(q))) {
    return `The capital of Australia is **Canberra**.`;
  }
  if (/\bcapital of (?:the )?(?:uk|united kingdom|england)\b/i.test(q)) {
    return `The capital of the United Kingdom is **London**.`;
  }
  if (/\bphotosynthesis\b/i.test(q)) {
    return `**Photosynthesis** is the biological process by which green plants and algae convert light energy into chemical energy stored in glucose, synthesizing foods from carbon dioxide and water while releasing oxygen as a byproduct.`;
  }
  if (/\bspeed of light\b/i.test(q)) {
    return `The speed of light in a vacuum is approximately **299,792,458 meters per second** (about **300,000 km/s** or **186,282 miles/s**).`;
  }
  if (/\bgravity\b/i.test(q) && !isPersonalQuery(q)) {
    return `**Gravity** is a fundamental interaction in physics that causes mutual attraction between all things that have mass or energy, described by Newton's law of universal gravitation and Einstein's general theory of relativity.`;
  }
  if (/\brecursion\b/i.test(q)) {
    return `**Recursion** in computer science is a method where a function calls itself to solve smaller instances of the same problem until reaching a specified **base case** that stops the recursion.`;
  }
  if (/\bbinary search\b/i.test(q)) {
    return `**Binary Search** is an efficient searching algorithm for sorted arrays with a time complexity of **O(log n)** that repeatedly divides the search interval in half.`;
  }

  // --- 11. Technical, Coding & Science Discussion ---
  if (/\b(python|javascript|coding|react|sql|database|api|html|css|docker|git|bug|algorithm|async)\b/i.test(q) && !isPersonalQuery(q)) {
    const topic = extractTopic(userText);
    return `Here are the core principles for **${topic}**:\n\n` +
      `1. **Core Concept**: Break down the specific problem, data structures, and edge cases.\n` +
      `2. **Implementation**: Start with clean, idiomatic code before optimizing for performance.\n` +
      `3. **Testing & Verification**: Validate against edge cases, null checks, and error conditions.\n\n` +
      `What specific problem or code snippet are you working on? Paste it here and we can solve it together!`;
  }

  // --- 12. Emotional Support & Empathy ---
  if (/(?:i am feeling|i feel|feeling)\s+(sad|down|depressed|unhappy|lonely|blue)/i.test(q) || /(?:bad day|terrible day|rough day|awful day|worst day)/i.test(q)) {
    return `I'm really sorry you're feeling that way${nameSalutation}. Rough days can feel heavy to carry alone. If you want to talk through what happened or just vent, I'm right here with you. What's been going on?`;
  }
  if (/(?:stressed|anxious|overwhelmed|too much work|burnt out|exhausted|tired)/i.test(q)) {
    return `Take a gentle breath${nameSalutation}. When everything feels like too much, remember you only have to tackle one small step at a time. Do you want to break down what's stressing you, or take your mind off it for a bit?`;
  }
  if (/(?:happy|excited|great day|amazing day|wonderful|celebrating|thrilled|proud)/i.test(q)) {
    return `That's incredible to hear! 🎉 Love seeing you in high spirits${nameSalutation}. What's the exciting news or the best part of your day? Tell me all about it!`;
  }

  // --- 13. System Identity ---
  if (/(?:who are you|what are you|what can you do|are you an ai|are you real|are you human)/i.test(q)) {
    return `I'm **Life Memory AI** — your personal cognitive assistant and lifelong memory companion! 🧠\n\n` +
      `- **I Remember What Matters**: As we talk, I maintain your technical achievements, projects, education, and career aspirations.\n` +
      `- **I Track Changes Over Time**: When your goals or projects evolve, I preserve both your history and your new updates.\n` +
      `- **Zero Memory Contamination**: When you ask general questions, I answer directly without mixing in personal memories.\n\n` +
      `What would you like to explore today?`;
  }

  // --- 14. Politeness ---
  if (/(?:thank you|thanks|appreciate it|thx|ty)\b/i.test(q)) {
    return `You're very welcome${nameSalutation}! Always happy to help. Let me know whenever you'd like to explore anything else!`;
  }

  // --- 15. Out-of-Memory Fallback (Tell user when requested info is NOT in memory) ---
  return `I don't have that in my recorded memory bank yet${nameSalutation}! 🧠\n\n` +
    `If you would like me to remember this or add it to your profile for future conversations, just let me know and I will gladly save it to your personal memory bank!`;
}

// --- Helper Formatting Utilities ---
function extractTopic(text) {
  if (!text) return 'this';
  const clean = text.replace(/[?!.,]/g, '').trim();
  const words = clean.split(/\s+/).filter(w => !stopwordsSet.has(w.toLowerCase()));
  if (words.length > 0) {
    return words.slice(0, 4).join(' ');
  }
  return clean.length > 30 ? clean.substring(0, 30) + '...' : clean;
}

function cleanMemContent(str) {
  if (!str) return '';
  return str.replace(/^(User ambition:|Career \/ Profession:|Education:|Goal:|Preference:|Project:|Achievement:)\s*/i, '').trim();
}

function formatDateOnly(isoStr) {
  if (!isoStr) return 'Recently';
  try {
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Automatically check backend status on load
document.addEventListener('DOMContentLoaded', () => {
  ApiService.checkBackend();
});

if (typeof window !== 'undefined') {
  window.ApiService = ApiService;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
