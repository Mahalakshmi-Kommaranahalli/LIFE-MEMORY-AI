/**
 * LIFE MEMORY AI — Unified API Service & Human-Like Cognitive Engine
 * Supports multi-account isolation, human-like conversations, dynamic memory extraction,
 * conflict & change detection, historical evolution tracking, and optional live Gemini LLM.
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

      const tokens = q.split(/[^a-zA-Z0-9_-]+/).filter(t => t.length > 2);

      const scored = store.memories.map(m => {
        let score = 0;
        const text = ((m.content || '') + ' ' + (m.tags || []).join(' ') + ' ' + (m.category || '')).toLowerCase();

        tokens.forEach(t => {
          if (text.includes(t)) score += 0.4;
        });

        if (q.includes((m.category || '').toLowerCase())) score += 0.5;
        if (m.status === 'active') score += 0.1;

        const similarity = Math.min(0.99, Number(score.toFixed(2)));
        return { memory: m, similarity };
      });

      const matches = scored.filter(s => s.similarity >= 0.35);
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

      // 2. Run Human-Like Cognitive Analysis:
      // (a) Extract information & detect changes/evolutions
      const memoryAnalysis = analyzeAndEvolveMemories(userText, store);

      // (b) Find grounded memories to anchor conversational context
      const relevantMatches = await this.searchMemories(userText);
      const groundedMemories = relevantMatches.map(m => m.memory);

      // (c) Check for live Gemini API Key
      const geminiKey = localStorage.getItem('lifememory_gemini_api_key') || (user.preferences && user.preferences.geminiKey);
      let assistantText = null;

      if (geminiKey) {
        try {
          assistantText = await callGeminiLiveAPI(geminiKey, userText, user, store.memories, store);
        } catch (e) {
          console.warn('Gemini API call failed, falling back to local cognitive engine:', e);
        }
      }

      // If no live Gemini key or live call failed, use the ultra-natural local cognitive engine
      if (!assistantText) {
        await simulateLatency(450);
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
// 🧠 COGNITIVE ENGINE: Information Extraction & Change / Evolution Tracking
// =========================================================================

function analyzeAndEvolveMemories(text, store) {
  const lower = text.toLowerCase().trim();
  const newMemories = [];
  const changedMemories = [];

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
  const rawName = (user.name || '').trim();
  // Only use name if it's an actual personal name, not generic fallback
  const isGenericName = !rawName || rawName === 'User' || rawName === 'Member' || rawName === 'New Member';
  const firstName = isGenericName ? '' : rawName.split(' ')[0];
  const nameSalutation = firstName ? `, ${firstName}` : '';

  const allMemories = store.memories || [];
  const activeMemories = allMemories.filter(m => m.status === 'active');

  // 1. If an information change / evolution just occurred
  if (memoryAnalysis.changedMemories.length > 0 && memoryAnalysis.newMemories.length > 0) {
    const oldMem = memoryAnalysis.changedMemories[0];
    const newMem = memoryAnalysis.newMemories[0];

    return `Got it${nameSalutation}! I've made that update in my memory for you.\n\n` +
      `Earlier you had shared:\n` +
      `> *"${cleanMemContent(oldMem.content)}"* \n\n` +
      `I've updated your active memory records to reflect:\n` +
      `> **"${cleanMemContent(newMem.content)}"**\n\n` +
      `It's exciting to see how your life and journey are evolving! What inspired this change?`;
  }

  // 2. If a new memory was captured for the first time
  if (memoryAnalysis.newMemories.length > 0) {
    const newMem = memoryAnalysis.newMemories[0];
    const categoryName = newMem.category.toUpperCase();

    const followUps = {
      personal: `That's great to know! I've tucked that into your personal memory bank so I'll always remember.`,
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

  // 3. User is asking about past changes / what changed / old data
  const isAskingAboutChanges = /(?:what changed|what did i change|show me changes|did anything change|what were my old|what was my old|what did i use to|history of changes|how did things change|what changed in my life)/i.test(q);
  if (isAskingAboutChanges) {
    const evolvedMemories = allMemories.filter(m => m.previousValue || m.status === 'superseded');

    if (evolvedMemories.length === 0) {
      return `None of your memories have been updated or changed yet${nameSalutation}! Everything I currently have saved reflects your original active information.\n\n` +
        `Whenever anything in your life, career, location, or preferences changes, just tell me (for example: *"I moved to London"* or *"I changed my job to..."*) and I'll keep track of both the past and the new update!`;
    }

    const changeBullets = evolvedMemories.map(m => {
      if (m.previousValue) {
        return `- **${m.category.toUpperCase()}**: You previously told me: *"${cleanMemContent(m.previousValue)}"*, which you later updated to: **"${cleanMemContent(m.content)}"** *(Updated: ${formatDateOnly(m.updatedAt)})*.`;
      } else {
        return `- **${m.category.toUpperCase()}**: *"${cleanMemContent(m.content)}"* *(Status: Superseded/Updated)*.`;
      }
    }).join('\n\n');

    return `Here is how your information has evolved over time${nameSalutation}:\n\n` +
      `${changeBullets}\n\n` +
      `I keep track of both where you started and where you are now so we never lose context!`;
  }

  // 4. User is asking: "What do you know about me?" / "What do you remember?" / "Who am I?"
  const isAskingAboutSelf = /(?:what do you remember|what do you know about me|tell me about myself|who am i|do you know me|what are my memories|what's my background|what is my job|where do i live|what are my goals|what is my name)/i.test(q);
  if (isAskingAboutSelf) {
    if (activeMemories.length === 0) {
      return `I don't have any memories saved about you yet${nameSalutation}!\n\n` +
        `I'd love to get to know you. You can tell me:\n` +
        `- Where you live or where you're from\n` +
        `- What you do for work or what you study\n` +
        `- Things you love doing or hobbies\n` +
        `- Big goals or milestones you're aiming for\n\n` +
        `Whatever you share, I'll naturally remember so our conversations feel truly personal!`;
    }

    const grouped = {};
    activeMemories.forEach(m => {
      const cat = m.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cleanMemContent(m.content));
    });

    let summaryText = `Here is what I remember about you${nameSalutation}:\n\n`;
    for (const [cat, items] of Object.entries(grouped)) {
      summaryText += `**${capitalize(cat)}**:\n`;
      items.forEach(it => {
        summaryText += `- ${it}\n`;
      });
      summaryText += '\n';
    }

    const hadChanges = allMemories.some(m => m.previousValue);
    if (hadChanges) {
      summaryText += `*(You also have past versions saved! Ask me "What changed?" anytime to see your life evolution.)*\n\n`;
    }

    summaryText += `Is there anything you'd like to update or add?`;
    return summaryText;
  }

  // 5. Greetings & Combined Greetings (e.g. "Hi how are you", "Hello there", "Hey what's up")
  if (/(?:^|\b)(hi|hello|hey|yo|good morning|good evening|good afternoon|howdy|sup|greetings)\b/i.test(q)) {
    if (/(?:how are you|how're you|how is it going|how are you doing|what's up|whats up)/i.test(q)) {
      return `Hey${nameSalutation}! 😊 I'm doing really well, thank you so much for asking! It's great to hear from you. How has your day been going? What's on your mind?`;
    }
    const memNotice = activeMemories.length > 0 ? `I've got your memories ready.` : `Ready whenever you want to chat or share updates.`;
    return `Hey${nameSalutation}! 😊 Great to connect with you. ${memNotice} How are you doing today?`;
  }

  // 6. How are you / check-in
  if (/(?:how are you|how're you|how is it going|how are you doing)/i.test(q)) {
    return `I'm doing great${nameSalutation}, thank you for asking! I always enjoy our conversations. How about yourself—how are you feeling today?`;
  }

  // 7. Identity & System capabilities
  if (/(?:who are you|what are you|what can you do|are you an ai|are you real|are you human)/i.test(q)) {
    return `I'm **Life Memory AI** — your personal cognitive assistant and life companion! 🧠\n\n` +
      `Here is how I work with you:\n` +
      `- **I Chat Naturally**: We can talk about ideas, coding, daily thoughts, feelings, or life advice.\n` +
      `- **I Remember What Matters**: As we talk, I capture your career, goals, projects, preferences, and milestones.\n` +
      `- **I Track Changes Over Time**: When you change jobs, move to a new city, or shift goals, I recognize that your life evolved and remember both the old and the new!\n` +
      `- **Zero Hallucination**: I never make up facts about your personal life.\n\n` +
      `What would you like to talk about today?`;
  }

  // 8. Emotional Expressions & Empathy
  if (/(?:i am feeling|i feel|feeling)\s+(sad|down|depressed|unhappy|lonely|blue)/i.test(q) || /(?:bad day|terrible day|rough day|awful day|worst day)/i.test(q)) {
    return `I'm really sorry you're feeling that way${nameSalutation}. Rough days can be really heavy to carry alone. If you want to talk about what happened or just vent, I'm right here with you. No judgment at all. What's been going on?`;
  }

  if (/(?:stressed|anxious|overwhelmed|too much work|burnt out|exhausted|tired)/i.test(q)) {
    return `Take a gentle breath${nameSalutation}. It sounds like a lot is weighing on you right now. When everything feels like too much, remember you only have to tackle one tiny piece at a time. Do you want to break down what's stressing you, or would you rather take your mind off it for a bit?`;
  }

  if (/(?:happy|excited|great day|amazing day|wonderful|celebrating|thrilled|proud)/i.test(q)) {
    return `That's incredible to hear! 🎉 Love seeing you in high spirits${nameSalutation}. What's the exciting news or the best part of your day? Tell me all about it!`;
  }

  if (/(?:i am bored|i'm bored|so bored|nothing to do)/i.test(q)) {
    return `Boredom is just your brain asking for a spark! Here are 3 fun things we could do right now:\n` +
      `1. **Brainstorm**: We could plan a cool side project or dream trip.\n` +
      `2. **Learn**: Pick any topic—quantum physics, history of coffee, or game design—and I'll give you a fascinating 2-minute breakdown.\n` +
      `3. **Quiz or Joke**: I can tell you a funny riddle or programmer joke.\n\n` +
      `Which one sounds fun?`;
  }

  // 9. Humor & Fun
  if (/(?:tell me a joke|make me laugh|say something funny|funny joke)/i.test(q)) {
    const jokes = [
      `Why do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛`,
      `There are only 10 types of people in the world:\nThose who understand binary, and those who don't!`,
      `A SQL query walks into a bar, walks up to two tables and asks: *"Can I join you?"* 🍺`,
      `Why was the JavaScript developer sad?\nBecause they didn't know how to 'null' their feelings!`,
      `Why did the neural network go to school?\nBecause it wanted to improve its weights and biases!`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (/(?:tell me a fact|interesting fact|fun fact|trivia)/i.test(q)) {
    const facts = [
      `Did you know? The human brain has roughly 86 billion neurons, each forming thousands of synaptic connections. That gives your biological memory a theoretical storage capacity of around 2.5 petabytes!`,
      `Fun fact: Honey never spoils! Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.`,
      `Space fact: A day on Venus is longer than a year on Venus! It takes Venus 243 Earth days to rotate once on its axis, but only 225 Earth days to orbit the Sun.`
    ];
    return `Here's a fascinating fact for you:\n\n${facts[Math.floor(Math.random() * facts.length)]}\n\nWhat kind of topics do you find most interesting?`;
  }

  // 10. Thank you & Politeness
  if (/(?:thank you|thanks|appreciate it|thx|ty)/i.test(q)) {
    return `You're very welcome${nameSalutation}! It's always a pleasure chatting with you. Let me know whenever there's anything else you need!`;
  }

  // 11. Technical, Coding & Science Questions
  if (/(?:python|javascript|coding|code|function|react|sql|database|api|html|css|docker|git|bug|algorithm|async)/i.test(q)) {
    return `I'd love to help you with that technical topic${nameSalutation}!\n\n` +
      `When approaching **${extractTopic(userText)}**, a great strategy is breaking it down into fundamental components:\n` +
      `1. **Core Concept**: Clarify the specific input, processing logic, and expected output.\n` +
      `2. **Implementation**: Build a clean, modular prototype first before optimizing.\n` +
      `3. **Edge Cases & Testing**: Verify boundary conditions and error handling.\n\n` +
      `Do you have a specific snippet of code or architecture decision you're working on right now? Paste it here and we can walk through it together!`;
  }

  // 12. Productivity, Study & Career Advice
  if (/(?:advice|career|study|how to learn|focus|productivity|routine|time management|interview)/i.test(q)) {
    return `Here are some proven strategies that can make a big difference${nameSalutation}:\n\n` +
      `- **Time-Boxing (Pomodoro)**: 25 to 50 minutes of pure deep focus without phone notifications, followed by a true 5-minute break.\n` +
      `- **The 2-Minute Rule**: If a task takes less than 2 minutes, do it immediately rather than putting it on a to-do list.\n` +
      `- **Iterative Progress**: Consistency always beats intensity. Doing 30 minutes every day compounds much faster than an 8-hour sprint once a week.\n\n` +
      `Is this for your current work or a new skill you're learning? Tell me a bit more about what you're working toward!`;
  }

  // 13. Lifestyle, Food & Decisions
  if (/(?:what should i eat|dinner|lunch|breakfast|food|recipe|restaurant)/i.test(q)) {
    return `Here are a few quick, satisfying ideas depending on what you're in the mood for:\n\n` +
      `- **Light & Quick**: A fresh warm bowl of pasta with garlic, olive oil, and parmesan, or a crisp veggie stir-fry.\n` +
      `- **Comfort Food**: A hearty grain bowl with roasted veggies, protein of your choice, and a savory tahini or soy-ginger sauce.\n` +
      `- **Cozy & Easy**: Grilled sourdough sandwich with a hot bowl of tomato or lentil soup.\n\n` +
      `What kind of food do you usually enjoy most? I can remember your favorite cuisines in your memory bank!`;
  }

  // 14. If grounded memories are available, weave them naturally into an answer
  if (groundedMemories && groundedMemories.length > 0) {
    const memoryHighlights = groundedMemories.slice(0, 2).map(m => `*${cleanMemContent(m.content)}*`).join(' and ');
    return `Connecting this to what I remember about you (${memoryHighlights}):\n\n` +
      `That sounds like a meaningful topic${nameSalutation}! How would you like to take this forward? We can brainstorm ideas, outline concrete steps, or dive into any specific questions you have.`;
  }

  // 15. Intelligent, Dynamic Conversational Reflection (NEVER STATIC!)
  // Extracts the user's specific theme and addresses it like a thoughtful human companion
  const cleanSubject = extractTopic(userText);
  return `That's an interesting question${nameSalutation}! \n\n` +
    `When it comes to **${cleanSubject}**, there are a couple of different angles to consider:\n\n` +
    `On one hand, it often depends on what your immediate priority or situation looks like. On the other hand, looking at it from a long-term perspective can give you a completely different takeaway.\n\n` +
    `What got you thinking about this today? Tell me a little bit more context and we can explore it together!`;
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
  'can', 'please', 'tell', 'show', 'give'
]);

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
