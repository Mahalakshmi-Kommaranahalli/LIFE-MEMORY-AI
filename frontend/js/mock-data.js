/**
 * LIFE MEMORY AI — Multi-User Isolated Data & Seed Mock Engine
 * Maintains strict per-account isolation so each user has their own
 * dedicated memory bank, conversations, knowledge graph, and timeline.
 */

const ACCOUNTS_REGISTRY_KEY = 'lifememory_accounts_v2';
const DEMO_EMAIL = 'mahalakshmi@example.com';

const DEMO_ACCOUNT = {
  id: 'usr_demo',
  name: 'Mahalakshmi K',
  email: DEMO_EMAIL,
  password: 'demo123456',
  role: 'CSE Student & AI Engineer',
  avatarText: 'MK',
  createdAt: '2026-09-01T00:00:00Z',
  preferences: {
    autoExtract: true,
    confidenceThreshold: 0.75,
    retrievalTopK: 5,
    conflictDetection: true,
    theme: 'light'
  }
};

const DEMO_INITIAL_MEMORIES = [
  {
    id: 'mem_1',
    category: 'career',
    content: 'User ambition: Aspires to become a Senior AI / Machine Learning Engineer focusing on LLMs and cognitive architectures.',
    confidence: 0.98,
    status: 'active',
    source: 'Conversation with Assistant',
    createdAt: '2026-09-15T10:30:00Z',
    updatedAt: '2026-09-15T10:30:00Z',
    validFrom: '2026-09-15',
    importance: 5,
    tags: ['ai-engineer', 'career-goal', 'ml']
  },
  {
    id: 'mem_2',
    category: 'education',
    content: 'Computer Science and Engineering (CSE) senior undergraduate student graduating in 2027.',
    confidence: 0.96,
    status: 'active',
    source: 'Profile Onboarding',
    createdAt: '2026-09-15T10:32:00Z',
    updatedAt: '2026-09-15T10:32:00Z',
    validFrom: '2023-08-01',
    importance: 4,
    tags: ['cse', 'undergrad', 'btech']
  },
  {
    id: 'mem_3',
    category: 'skills',
    content: 'Proficient in Python, PyTorch, FastAPI, PostgreSQL, Vector Databases, and Modern Web Development.',
    confidence: 0.94,
    status: 'active',
    source: 'Chat on Technical Stack',
    createdAt: '2026-09-20T14:15:00Z',
    updatedAt: '2026-10-05T11:20:00Z',
    validFrom: '2026-09-20',
    importance: 4,
    tags: ['python', 'pytorch', 'fastapi', 'pgvector']
  },
  {
    id: 'mem_4',
    category: 'projects',
    content: 'Developing "Life Memory AI" — an intelligent persistent personal memory assistant with hybrid RAG and knowledge graph.',
    confidence: 0.99,
    status: 'active',
    source: 'Project Planning Chat',
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-11-20T16:00:00Z',
    validFrom: '2026-10-01',
    importance: 5,
    tags: ['capstone', 'rag', 'knowledge-graph', 'fastapi']
  },
  {
    id: 'mem_5',
    category: 'goals',
    content: 'Goal: Publish an academic paper or open-source technical writeup on Long-Term AI Memory Retrievability by Q1 2027.',
    confidence: 0.91,
    status: 'active',
    source: 'Goals Discussion',
    createdAt: '2026-10-12T16:45:00Z',
    updatedAt: '2026-10-12T16:45:00Z',
    validFrom: '2026-10-12',
    importance: 4,
    tags: ['research', 'paper', 'goals-2027']
  },
  {
    id: 'mem_6',
    category: 'preferences',
    content: 'Prefers crisp light-mode user interfaces, high contrast typography, and clean structured markdown documentation.',
    confidence: 0.95,
    status: 'active',
    source: 'Design Consultation',
    createdAt: '2026-10-18T18:20:00Z',
    updatedAt: '2026-11-23T15:00:00Z',
    validFrom: '2026-10-18',
    importance: 3,
    tags: ['ui-ux', 'light-mode', 'design']
  },
  {
    id: 'mem_7',
    category: 'achievements',
    content: 'Won 1st Place in University AI Hackathon for building an autonomous memory agent prototype.',
    confidence: 0.97,
    status: 'active',
    source: 'Conversation on Celebrations',
    createdAt: '2026-10-25T11:10:00Z',
    updatedAt: '2026-10-25T11:10:00Z',
    validFrom: '2026-10-25',
    importance: 5,
    tags: ['hackathon', 'award', 'autonomous-agents']
  },
  {
    id: 'mem_8',
    category: 'plans',
    content: 'Planning to complete DeepLearning.AI Advanced LLM and Vector Search Specialization before December 2026.',
    confidence: 0.89,
    status: 'active',
    source: 'Study Schedule Discussion',
    createdAt: '2026-11-02T13:40:00Z',
    updatedAt: '2026-11-02T13:40:00Z',
    validFrom: '2026-11-02',
    importance: 3,
    tags: ['learning', 'certification', 'llm']
  },
  {
    id: 'mem_9',
    category: 'personal',
    content: 'Likes listening to instrumental lo-fi beats while coding, drinks green tea in the morning, and values daily deep work blocks.',
    confidence: 0.88,
    status: 'active',
    source: 'Routine Reflection Chat',
    createdAt: '2026-11-10T08:15:00Z',
    updatedAt: '2026-11-10T08:15:00Z',
    validFrom: '2026-11-10',
    importance: 2,
    tags: ['habits', 'routine', 'deep-work']
  },
  {
    id: 'mem_10',
    category: 'events',
    content: 'Attended the Global AI Summit 2026 in October — networked with NLP researchers and vector database engineers.',
    confidence: 0.92,
    status: 'active',
    source: 'Conference Debrief',
    createdAt: '2026-11-14T17:30:00Z',
    updatedAt: '2026-11-14T17:30:00Z',
    validFrom: '2026-10-28',
    importance: 3,
    tags: ['conference', 'networking', 'ai-summit']
  }
];

const DEMO_INITIAL_CONVERSATIONS = [
  {
    id: 'conv_1',
    title: 'Career Planning & AI Engineering Roadmap',
    updatedAt: '2026-11-23T14:20:00Z',
    messages: [
      {
        id: 'msg_1',
        role: 'user',
        text: 'Hi! I am a final year CSE student and my lifelong dream is to become a top AI engineer. What path should I take?',
        timestamp: '2026-11-23T14:18:00Z'
      },
      {
        id: 'msg_2',
        role: 'assistant',
        text: 'Hello Mahalakshmi! It is fantastic to connect with you. As a CSE senior aiming for a career in AI Engineering, your computer science fundamentals give you a massive advantage. I have noted your ambition and educational stage in your memory bank! To reach the top tier of AI engineering, I recommend focusing on modern LLM orchestration, Retrieval-Augmented Generation (RAG), vector embeddings, and deploying scalable FastAPI services.',
        timestamp: '2026-11-23T14:18:05Z',
        extractedMemories: ['mem_1', 'mem_2'],
        groundedMemories: []
      },
      {
        id: 'msg_3',
        role: 'user',
        text: 'What do you remember about my current ambitions and college degree?',
        timestamp: '2026-11-23T14:19:30Z'
      },
      {
        id: 'msg_4',
        role: 'assistant',
        text: 'Based on our long-term memories, you are a Computer Science and Engineering (CSE) senior undergraduate student (graduating in 2027), and your core career goal is to become a Senior AI / Machine Learning Engineer focusing on LLMs and cognitive architectures. You are also building Life Memory AI as a major project!',
        timestamp: '2026-11-23T14:19:33Z',
        extractedMemories: [],
        groundedMemories: ['mem_1', 'mem_2', 'mem_4']
      }
    ]
  },
  {
    id: 'conv_2',
    title: 'Architecture Review: Life Memory AI',
    updatedAt: '2026-11-22T19:40:00Z',
    messages: [
      {
        id: 'msg_2_1',
        role: 'user',
        text: 'Let us review the memory extraction pipeline for Life Memory AI.',
        timestamp: '2026-11-22T19:38:00Z'
      },
      {
        id: 'msg_2_2',
        role: 'assistant',
        text: 'The 10-step memory engine pipeline handles conversation receipt, PostgreSQL persistence, LLM analysis, structured JSON extraction, validation, conflict detection, embedding generation, pgvector storage, and retrieval readiness. It ensures zero hallucination of personal memories.',
        timestamp: '2026-11-22T19:38:04Z',
        extractedMemories: ['mem_4'],
        groundedMemories: ['mem_3', 'mem_4']
      }
    ]
  }
];

const DEMO_INITIAL_RELATIONSHIPS = [
  { source: 'mem_2', target: 'mem_3', type: 'enabled_skill', label: 'Learned at College' },
  { source: 'mem_3', target: 'mem_4', type: 'applied_in', label: 'Used to Build' },
  { source: 'mem_4', target: 'mem_7', type: 'led_to', label: 'Won Hackathon' },
  { source: 'mem_4', target: 'mem_5', type: 'motivates', label: 'Research Paper' },
  { source: 'mem_3', target: 'mem_1', type: 'qualifies_for', label: 'Prepares for Role' },
  { source: 'mem_8', target: 'mem_1', type: 'accelerates', label: 'Deep Specialization' },
  { source: 'mem_10', target: 'mem_1', type: 'networked_for', label: 'Industry Connections' }
];

const DEMO_INITIAL_DOCUMENTS = [
  {
    id: 'doc_1',
    filename: 'AI_Engineering_Curriculum_2026.pdf',
    size: '1.4 MB',
    pages: 14,
    uploadedAt: '2026-11-15T10:00:00Z',
    status: 'processed',
    extractedMemoriesCount: 3,
    summary: 'Comprehensive curriculum overview detailing Vector Databases, PyTorch, RAG architectures, and model evaluation metrics.'
  },
  {
    id: 'doc_2',
    filename: 'Undergraduate_Project_Proposal_Final.pdf',
    size: '890 KB',
    pages: 8,
    uploadedAt: '2026-11-20T14:30:00Z',
    status: 'processed',
    extractedMemoriesCount: 2,
    summary: 'Official senior design thesis proposal for Life Memory AI: Persistent Semantic Memory Engine for Personal AI Agents.'
  }
];

// --- Registered Accounts Management ---
function getRegisteredAccounts() {
  const raw = localStorage.getItem(ACCOUNTS_REGISTRY_KEY);
  let accounts = [];
  if (raw) {
    try { accounts = JSON.parse(raw); } catch (e) { accounts = []; }
  }
  // Guarantee demo account is in the registry
  if (!accounts.some(a => (a.email || '').toLowerCase() === DEMO_EMAIL)) {
    accounts.unshift(DEMO_ACCOUNT);
    localStorage.setItem(ACCOUNTS_REGISTRY_KEY, JSON.stringify(accounts));
  }
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
      user: DEMO_ACCOUNT,
      memories: DEMO_INITIAL_MEMORIES,
      conversations: DEMO_INITIAL_CONVERSATIONS,
      relationships: DEMO_INITIAL_RELATIONSHIPS,
      documents: DEMO_INITIAL_DOCUMENTS
    };
    localStorage.setItem(key, JSON.stringify(demoData));
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
      if (parsed && Array.isArray(parsed.memories)) {
        return parsed;
      }
    } catch (e) {}
  }
  return initDataStore(email);
}

function saveDataStore(data, targetEmail) {
  const email = (targetEmail || (data.user && data.user.email) || getCurrentUserEmail() || DEMO_EMAIL).toLowerCase();
  const key = getUserStoreKey(email);
  localStorage.setItem(key, JSON.stringify(data));
}

function resetUserDataStore(email) {
  const target = (email || getCurrentUserEmail() || DEMO_EMAIL).toLowerCase();
  const key = getUserStoreKey(target);
  localStorage.removeItem(key);
  return initDataStore(target);
}

// Ensure accounts list is ready on script load
getRegisteredAccounts();

if (typeof window !== 'undefined') {
  window.getDataStore = getDataStore;
  window.saveDataStore = saveDataStore;
  window.resetUserDataStore = resetUserDataStore;
  window.getRegisteredAccounts = getRegisteredAccounts;
  window.saveRegisteredAccounts = saveRegisteredAccounts;
  window.createFreshUserStore = createFreshUserStore;
}
