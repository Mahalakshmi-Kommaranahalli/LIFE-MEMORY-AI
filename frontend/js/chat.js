/**
 * LIFE MEMORY AI — Chat Assistant Logic
 */

let activeConversationId = null;
let conversations = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadConversations();
  setupChatEvents();
});

async function loadConversations() {
  try {
    conversations = await ApiService.getConversations();
    // Deduplicate and filter out empty draft conversations
    const nonEmpty = conversations.filter(c => c.messages && c.messages.length > 0);
    if (nonEmpty.length > 0) {
      conversations = nonEmpty;
    }
    renderConversationList();

    if (conversations.length > 0) {
      selectConversation(conversations[0].id);
    } else {
      startNewConversation();
    }
  } catch (err) {
    console.error('Failed to load conversations:', err);
    showToast('Failed to load conversations', 'error');
  }
}

function renderConversationList() {
  const container = document.getElementById('conversations-list');
  if (!container) return;

  container.innerHTML = conversations.map(c => `
    <div class="conv-item ${c.id === activeConversationId ? 'active' : ''}" onclick="selectConversation('${c.id}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: var(--text-muted);"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="conv-item-title">${escapeHtml(c.title || 'Conversation')}</span>
    </div>
  `).join('');
}

function selectConversation(id) {
  activeConversationId = id;
  renderConversationList();

  const conv = conversations.find(c => c.id === id);
  if (!conv) return;

  document.getElementById('active-chat-title').textContent = conv.title;
  renderMessages(conv.messages || []);
  updateMemoryDrawer(conv.messages || []);
}

function renderMessages(messages) {
  const container = document.getElementById('messages-container');
  if (!container) return;

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="margin: auto;">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="empty-state-title">New Conversation Started</div>
        <div class="empty-state-desc">Ask a question or share personal updates. The assistant retrieves relevant memories to ground its response without hallucinating.</div>
      </div>
    `;
    return;
  }

  const allMemories = getDataStore().memories;

  container.innerHTML = messages.map(msg => {
    const isUser = msg.role === 'user';
    const timeStr = formatTime(msg.timestamp);

    let memoryTagsHtml = '';
    if (!isUser && msg.groundedMemories && msg.groundedMemories.length > 0) {
      const citedMemories = allMemories.filter(m => msg.groundedMemories.includes(m.id));
      memoryTagsHtml = `
        <div class="message-memory-tags">
          <span style="font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Grounded by:
          </span>
          ${citedMemories.map(m => `
            <span class="badge badge-${m.category}" title="${escapeHtml(m.content)}">${m.category}</span>
          `).join('')}
        </div>
      `;
    }

    if (!isUser && msg.extractedMemories && msg.extractedMemories.length > 0) {
      memoryTagsHtml += `
        <div style="margin-top: 6px;">
          <span class="badge badge-active" style="font-size: 0.7rem;">+ Captured ${msg.extractedMemories.length} New Memory</span>
        </div>
      `;
    }

    return `
      <div class="message-row ${isUser ? 'user' : 'assistant'}">
        <div class="message-avatar">
          ${isUser ? 'MK' : 'AI'}
        </div>
        <div>
          <div class="message-bubble">
            ${formatMessageText(msg.text)}
            ${memoryTagsHtml}
          </div>
          <div class="message-meta">
            <span>${timeStr}</span>
            ${!isUser ? `<button onclick="copyMessage('${escapeAttr(msg.text)}')" style="color: var(--text-muted); font-size: 0.72rem; display: inline-flex; align-items: center; gap: 3px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  scrollToBottom();
}

function updateMemoryDrawer(messages) {
  const drawerBody = document.getElementById('drawer-memory-list');
  const badge = document.getElementById('grounded-count-badge');
  if (!drawerBody) return;

  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const allMemories = getDataStore().memories;

  let citedMemories = [];
  if (lastAssistant && lastAssistant.groundedMemories && lastAssistant.groundedMemories.length > 0) {
    citedMemories = allMemories.filter(m => lastAssistant.groundedMemories.includes(m.id));
  } else {
    // If none cited in current reply, display top active memory highlights
    citedMemories = allMemories.slice(0, 3);
  }

  if (badge) badge.textContent = `${citedMemories.length} Active`;

  if (citedMemories.length === 0) {
    drawerBody.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 30px 10px; font-size: 0.85rem;">
        No memories cited yet. Ask questions about your career, projects, or goals to see real-time memory retrieval!
      </div>
    `;
    return;
  }

  drawerBody.innerHTML = citedMemories.map(m => `
    <div class="retrieved-memory-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span class="badge badge-${m.category}">${m.category}</span>
        <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">${Math.round(m.confidence * 100)}% Match</span>
      </div>
      <div style="font-size: 0.84rem; color: var(--text-primary); font-weight: 500; line-height: 1.45;">
        ${escapeHtml(m.content)}
      </div>
      <div class="memory-score-bar">
        <div class="memory-score-fill" style="width: ${Math.round(m.confidence * 100)}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.72rem; color: var(--text-muted);">
        <span>${escapeHtml(m.source || 'Memory Store')}</span>
        <span>${formatDateShort(m.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

function setupChatEvents() {
  const form = document.getElementById('chat-form');
  const textarea = document.getElementById('chat-input');
  const newChatBtn = document.getElementById('btn-new-chat');
  const clearChatBtn = document.getElementById('btn-clear-chat');
  const toggleDrawerBtn = document.getElementById('btn-toggle-drawer');

  // Auto-resize textarea
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
  });

  // Enter to send
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  // Send message
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (!text) return;

    textarea.value = '';
    textarea.style.height = 'auto';

    // Show user message immediately
    const conv = conversations.find(c => c.id === activeConversationId);
    if (conv) {
      conv.messages.push({
        id: 'msg_temp_' + Date.now(),
        role: 'user',
        text,
        timestamp: new Date().toISOString()
      });
      renderMessages(conv.messages);
    }

    // Show typing
    document.getElementById('typing-container').style.display = 'block';
    scrollToBottom();

    try {
      const response = await ApiService.sendMessage(activeConversationId, text);
      document.getElementById('typing-container').style.display = 'none';

      // Refresh conversations & reload
      conversations = await ApiService.getConversations();
      const currentConv = conversations.find(c => c.id === activeConversationId);
      if (currentConv) {
        renderMessages(currentConv.messages);
        updateMemoryDrawer(currentConv.messages);
      }

      if (response.extracted_memories && response.extracted_memories.length > 0) {
        showToast(`Captured ${response.extracted_memories.length} new fact into long-term memory!`, 'success');
      }
    } catch (err) {
      document.getElementById('typing-container').style.display = 'none';
      showToast('Error sending message: ' + err.message, 'error');
    }
  });

  newChatBtn.addEventListener('click', () => {
    startNewConversation();
  });

  clearChatBtn.addEventListener('click', () => {
    if (confirm('Clear messages in this conversation?')) {
      const conv = conversations.find(c => c.id === activeConversationId);
      if (conv) {
        conv.messages = [];
        const store = getDataStore();
        const storeConv = store.conversations.find(c => c.id === activeConversationId);
        if (storeConv) storeConv.messages = [];
        saveDataStore(store);
        renderMessages([]);
        updateMemoryDrawer([]);
        showToast('Conversation cleared', 'info');
      }
    }
  });

  if (toggleDrawerBtn) {
    toggleDrawerBtn.addEventListener('click', () => {
      const drawer = document.getElementById('memory-drawer');
      if (drawer.style.display === 'none') {
        drawer.style.display = 'flex';
      } else {
        drawer.style.display = 'none';
      }
    });
  }
}

function startNewConversation() {
  const currentConv = conversations.find(c => c.id === activeConversationId);
  if (currentConv && (!currentConv.messages || currentConv.messages.length === 0)) {
    // Already in a blank conversation
    selectConversation(currentConv.id);
    return;
  }

  // Remove existing empty conversations to keep list clean
  conversations = conversations.filter(c => c.messages && c.messages.length > 0);

  const newId = 'conv_' + Date.now();
  const newConv = {
    id: newId,
    title: 'New Conversation',
    updatedAt: new Date().toISOString(),
    messages: []
  };
  conversations.unshift(newConv);
  const store = getDataStore();
  store.conversations = conversations;
  saveDataStore(store);

  activeConversationId = newId;
  renderConversationList();
  selectConversation(newId);
  showToast('New conversation ready', 'info');
}

function scrollToBottom() {
  const container = document.getElementById('messages-container');
  if (container) {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }
}

function formatMessageText(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    let l = escapeHtml(line);
    // Bold
    l = l.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    l = l.replace(/`([^`]+)`/g, '<code style="background: rgba(99,102,241,0.08); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--primary);">$1</code>');
    // Numbered lists e.g. 1.
    const numMatch = l.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      return `<div style="display: flex; gap: 8px; margin: 4px 0;"><span style="font-weight: 700; color: var(--primary);">${numMatch[1]}.</span><span>${numMatch[2]}</span></div>`;
    }
    // Bullet lists e.g. - or *
    if (l.startsWith('- ') || l.startsWith('* ')) {
      return `<div style="display: flex; gap: 8px; margin: 3px 0 3px 12px;"><span style="color: var(--primary);">&bull;</span><span>${l.substring(2)}</span></div>`;
    }
    return l;
  });

  return formattedLines.join('<br>');
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function escapeAttr(text) {
  return (text || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function copyMessage(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Message copied to clipboard', 'info');
  });
}

