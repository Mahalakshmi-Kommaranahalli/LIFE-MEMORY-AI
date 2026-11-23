/**
 * LIFE MEMORY AI — Seed Mock Data Store
 * Provides rich, realistic data for CSE student / AI Engineer persona.
 * Automatically initializes in localStorage if not already present.
 */

const SEED_DATA_KEY = 'lifememory_data_v1';

const INITIAL_MEMORIES = [
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

const INITIAL_CONVERSATIONS = [
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
        text: 'Hello! It is fantastic to connect with you. As a CSE senior aiming for a career in AI Engineering, your computer science fundamentals give you a massive advantage. I have noted your ambition and educational stage in your memory bank! To reach the top tier of AI engineering, I recommend focusing on modern LLM orchestration, Retrieval-Augmented Generation (RAG), vector embeddings, and deploying scalable FastAPI services.',
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

const INITIAL_RELATIONSHIPS = [
  { source: 'mem_2', target: 'mem_3', type: 'enabled_skill', label: 'Learned at College' },
  { source: 'mem_3', target: 'mem_4', type: 'applied_in', label: 'Used to Build' },
  { source: 'mem_4', target: 'mem_7', type: 'led_to', label: 'Won Hackathon' },
  { source: 'mem_4', target: 'mem_5', type: 'motivates', label: 'Research Paper' },
  { source: 'mem_3', target: 'mem_1', type: 'qualifies_for', label: 'Prepares for Role' },
  { source: 'mem_8', target: 'mem_1', type: 'accelerates', label: 'Deep Specialization' },
  { source: 'mem_10', target: 'mem_1', type: 'networked_for', label: 'Industry Connections' }
];

const INITIAL_DOCUMENTS = [
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

// Initialize LocalStorage Data Store
function initDataStore() {
  const existing = localStorage.getItem(SEED_DATA_KEY);
  if (!existing) {
    const data = {
      user: {
        id: 'usr_default',
        name: 'Mahalakshmi K',
        email: 'mahalakshmi@example.com',
        avatarText: 'MK',
        role: 'CSE Student & AI Engineer',
        preferences: {
          autoExtract: true,
          confidenceThreshold: 0.75,
          retrievalTopK: 5,
          conflictDetection: true,
          theme: 'light'
        }
      },
      memories: INITIAL_MEMORIES,
      conversations: INITIAL_CONVERSATIONS,
      relationships: INITIAL_RELATIONSHIPS,
      documents: INITIAL_DOCUMENTS
    };
    localStorage.setItem(SEED_DATA_KEY, JSON.stringify(data));
    return data;
  }
  return JSON.parse(existing);
}

function getDataStore() {
  const raw = localStorage.getItem(SEED_DATA_KEY);
  return raw ? JSON.parse(raw) : initDataStore();
}

function saveDataStore(data) {
  localStorage.setItem(SEED_DATA_KEY, JSON.stringify(data));
}

