/**
 * LIFE MEMORY AI — Memory Explorer Logic
 */

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';
let currentStatus = 'all';
let allMemoriesList = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadMemories();
  setupFilters();
  setupModals();
});

async function loadMemories() {
  try {
    allMemoriesList = await ApiService.getMemories({
      category: currentCategory,
      search: currentSearch,
      status: currentStatus
    });

    applySorting();
    renderMemoriesGrid();
    updateCounts();
  } catch (err) {
    console.error('Failed to load memories:', err);
    showToast('Failed to load memories', 'error');
  }
}

function applySorting() {
  if (currentSort === 'newest') {
    allMemoriesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === 'oldest') {
    allMemoriesList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (currentSort === 'confidence') {
    allMemoriesList.sort((a, b) => b.confidence - a.confidence);
  } else if (currentSort === 'importance') {
    allMemoriesList.sort((a, b) => (b.importance || 3) - (a.importance || 3));
  }
}

function renderMemoriesGrid() {
  const container = document.getElementById('memories-container');
  if (!container) return;

  if (allMemoriesList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="empty-state-title">No memories found</div>
        <div class="empty-state-desc">Try clearing your search query or switching categories.</div>
        <button class="btn btn-secondary btn-sm" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = allMemoriesList.map(mem => `
    <div class="memory-card">
      <div class="memory-card-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-${mem.category}">${mem.category}</span>
          <span class="badge badge-${mem.status || 'active'}">${mem.status || 'active'}</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-ghost btn-sm" style="padding: 4px;" title="Edit Memory" onclick="openEditModal('${mem.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" style="padding: 4px; color: var(--accent-rose);" title="Delete Memory" onclick="handleDeleteMemory('${mem.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <div class="memory-content">
        ${escapeHtml(mem.content)}
      </div>

      ${mem.previousValue ? `
        <div style="margin: 6px 0; padding: 6px 10px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; border-radius: 4px; font-size: 0.78rem; color: #92400E;">
          <strong>↻ Evolved from:</strong> ${escapeHtml(mem.previousValue)}
        </div>
      ` : ''}

      <!-- Tags -->
      ${mem.tags && mem.tags.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${mem.tags.map(t => `<span style="font-size: 0.72rem; padding: 2px 7px; background: var(--bg-secondary); border-radius: var(--radius-full); color: var(--text-muted);">#${escapeHtml(t)}</span>`).join('')}
        </div>
      ` : ''}

      <!-- Confidence Bar -->
      <div style="margin-top: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 3px;">
          <span>Confidence Score</span>
          <span style="font-weight: 700; color: var(--primary);">${Math.round(mem.confidence * 100)}%</span>
        </div>
        <div class="memory-score-bar">
          <div class="memory-score-fill" style="width: ${Math.round(mem.confidence * 100)}%;"></div>
        </div>
      </div>

      <div class="memory-card-footer">
        <span>Source: <strong>${escapeHtml(mem.source || 'Conversation')}</strong></span>
        <span>${formatDate(mem.createdAt)}</span>
      </div>
    </div>
  `).join('');
}

function updateCounts() {
  const store = getDataStore();
  const totalEl = document.getElementById('total-badge');
  if (totalEl) totalEl.textContent = store.memories.length;
}

function setupFilters() {
  // Category tabs
  const pills = document.querySelectorAll('.cat-tab-btn');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.cat;
      loadMemories();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('memory-search-input');
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadMemories();
    }, 250);
  });

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applySorting();
    renderMemoriesGrid();
  });

  // Status select
  const statusSelect = document.getElementById('status-select');
  statusSelect.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    loadMemories();
  });
}

function resetFilters() {
  currentCategory = 'all';
  currentSearch = '';
  currentStatus = 'all';
  document.getElementById('memory-search-input').value = '';
  document.querySelectorAll('.cat-tab-btn').forEach(p => {
    if (p.dataset.cat === 'all') p.classList.add('active');
    else p.classList.remove('active');
  });
  loadMemories();
}

// Modal handling
function openAddModal() {
  document.getElementById('add-modal').classList.add('active');
}
function closeAddModal() {
  document.getElementById('add-modal').classList.remove('active');
}

function openEditModal(id) {
  const mem = allMemoriesList.find(m => m.id === id);
  if (!mem) return;

  document.getElementById('edit-id').value = mem.id;
  document.getElementById('edit-cat').value = mem.category;
  document.getElementById('edit-content').value = mem.content;
  document.getElementById('edit-status').value = mem.status || 'active';
  document.getElementById('edit-tags').value = (mem.tags || []).join(', ');

  document.getElementById('edit-modal').classList.add('active');
}
function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

function setupModals() {
  // Add Form
  const addForm = document.getElementById('create-memory-form');
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('create-cat').value;
    const content = document.getElementById('create-content').value.trim();
    const importance = parseInt(document.getElementById('create-importance').value, 10);
    const tags = document.getElementById('create-tags').value.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await ApiService.createMemory({
        category,
        content,
        importance,
        tags,
        source: 'Manual Memory Explorer Entry',
        confidence: 0.98
      });
      showToast('Memory stored into vector store!', 'success');
      addForm.reset();
      closeAddModal();
      await loadMemories();
    } catch (err) {
      showToast('Error saving memory: ' + err.message, 'error');
    }
  });

  // Edit Form
  const editForm = document.getElementById('edit-memory-form');
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const category = document.getElementById('edit-cat').value;
    const content = document.getElementById('edit-content').value.trim();
    const status = document.getElementById('edit-status').value;
    const tags = document.getElementById('edit-tags').value.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await ApiService.updateMemory(id, { category, content, status, tags });
      showToast('Memory updated successfully!', 'success');
      closeEditModal();
      await loadMemories();
    } catch (err) {
      showToast('Error updating memory: ' + err.message, 'error');
    }
  });
}

async function handleDeleteMemory(id) {
  if (confirm('Permanently delete this memory? It will be removed from future contextual retrievals.')) {
    try {
      await ApiService.deleteMemory(id);
      showToast('Memory permanently deleted from vector index', 'info');
      await loadMemories();
    } catch (err) {
      showToast('Error deleting memory: ' + err.message, 'error');
    }
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

