/**
 * LIFE MEMORY AI — Dashboard Logic
 */

let weeklyChart = null;
let categoryChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
  setupAddMemoryForm();
});

async function loadDashboardData() {
  try {
    const stats = await ApiService.getDashboardStats();

    // Populate stat counters
    document.getElementById('stat-total-memories').textContent = stats.totalMemories;
    document.getElementById('stat-total-convs').textContent = stats.totalConversations;
    document.getElementById('stat-categories-count').textContent = stats.categoriesCount;
    document.getElementById('stat-active-goals').textContent = stats.activeGoals;

    // Update sidebar badges if present
    const memBadge = document.getElementById('memory-count-badge');
    if (memBadge) memBadge.textContent = stats.totalMemories;
    const chatBadge = document.getElementById('chat-count-badge');
    if (chatBadge) chatBadge.textContent = stats.totalConversations;

    // Render Recent Memories
    renderRecentMemories(stats.recentMemories);

    // Render Charts
    renderCharts(stats);
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    showToast('Failed to load dashboard statistics', 'error');
  }
}

function renderRecentMemories(memories) {
  const container = document.getElementById('recent-memories-container');
  if (!container) return;

  if (!memories || memories.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 20px;"><div class="empty-state-desc">No memories saved yet. Start chatting or add one manually!</div></div>`;
    return;
  }

  container.innerHTML = memories.map(mem => `
    <div style="background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span class="badge badge-${mem.category}">${mem.category}</span>
        <span style="font-size: 0.74rem; color: var(--text-muted);">${formatDate(mem.createdAt)}</span>
      </div>
      <div style="font-size: 0.88rem; color: var(--text-primary); font-weight: 500; line-height: 1.45;">
        ${escapeHtml(mem.content)}
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">
        <span>Source: ${escapeHtml(mem.source || 'Conversation')}</span>
        <span style="font-weight: 600; color: var(--primary);">${Math.round(mem.confidence * 100)}% verified</span>
      </div>
    </div>
  `).join('');
}

function renderCharts(stats) {
  const weeklyCanvas = document.getElementById('weeklyActivityChart');
  const catCanvas = document.getElementById('categoryDoughnutChart');

  if (typeof Chart === 'undefined') {
    // If Chart.js CDN didn't load, render crisp SVG fallback
    renderFallbackCharts(weeklyCanvas, catCanvas, stats);
    return;
  }

  // 1. Weekly Activity Line / Bar Chart
  if (weeklyCanvas) {
    const ctx = weeklyCanvas.getContext('2d');
    if (weeklyChart) weeklyChart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    weeklyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Memories Processed',
          data: stats.weeklyActivity || [4, 7, 3, 9, 6, 12, 8],
          borderColor: '#6366F1',
          borderWidth: 2.5,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#6366F1',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          backgroundColor: gradient,
          fill: true,
          tension: 0.38
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748B' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748B', precision: 0 }
          }
        }
      }
    });
  }

  // 2. Category Doughnut Chart
  if (catCanvas) {
    const ctx = catCanvas.getContext('2d');
    if (categoryChart) categoryChart.destroy();

    const catLabels = Object.keys(stats.categoryDistribution || { career: 2, education: 2, goals: 2, skills: 2, projects: 2 });
    const catCounts = Object.values(stats.categoryDistribution || { career: 2, education: 2, goals: 2, skills: 2, projects: 2 });

    const colorPalette = [
      '#6366F1', '#8B5CF6', '#EC4899', '#0EA5E9',
      '#10B981', '#F59E0B', '#E11D48', '#0D9488', '#4F46E5', '#CA8A04'
    ];

    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: catLabels.map(capitalize),
        datasets: [{
          data: catCounts,
          backgroundColor: colorPalette.slice(0, catLabels.length),
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Plus Jakarta Sans', size: 11 },
              color: '#334155',
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 12
            }
          }
        },
        cutout: '68%'
      }
    });
  }
}

function renderFallbackCharts(weeklyCanvas, catCanvas, stats) {
  if (weeklyCanvas) {
    weeklyCanvas.parentElement.innerHTML = `
      <div style="height: 100%; display: flex; align-items: flex-end; gap: 14px; padding: 20px 10px; justify-content: space-around;">
        ${(stats.weeklyActivity || [4, 7, 3, 9, 6, 12, 8]).map((val, i) => `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1;">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">${val}</div>
            <div style="width: 100%; max-width: 28px; height: ${val * 16}px; background: var(--gradient-brand); border-radius: 4px;"></div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Modal handling
function openAddMemoryModal() {
  document.getElementById('add-memory-modal').classList.add('active');
}

function closeAddMemoryModal() {
  document.getElementById('add-memory-modal').classList.remove('active');
}

function setupAddMemoryForm() {
  const form = document.getElementById('add-memory-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('new-mem-category').value;
    const content = document.getElementById('new-mem-content').value.trim();
    const tagsInput = document.getElementById('new-mem-tags').value;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      await ApiService.createMemory({
        category,
        content,
        tags,
        source: 'Manual Dashboard Entry',
        confidence: 0.98
      });
      showToast('New long-term memory recorded successfully!', 'success');
      form.reset();
      closeAddMemoryModal();
      await loadDashboardData();
    } catch (err) {
      showToast('Failed to save memory: ' + err.message, 'error');
    }
  });
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

