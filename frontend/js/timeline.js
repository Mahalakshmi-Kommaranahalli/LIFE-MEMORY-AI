/**
 * LIFE MEMORY AI — Timeline Logic
 */

let timelineFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  await loadTimeline();
  setupTimelineFilters();
});

async function loadTimeline() {
  try {
    const memories = await ApiService.getMemories({ category: timelineFilter });
    
    // Sort chronologically (earliest to latest or latest to earliest)
    const sorted = [...memories].sort((a, b) => {
      const dateA = new Date(a.validFrom || a.createdAt);
      const dateB = new Date(b.validFrom || b.createdAt);
      return dateB - dateA;
    });

    renderTimeline(sorted);
  } catch (err) {
    console.error('Failed to load timeline:', err);
    showToast('Failed to load timeline', 'error');
  }
}

function renderTimeline(items) {
  const container = document.getElementById('timeline-items-list');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 0;">
        <div class="empty-state-title">No milestones found in this category</div>
        <div class="empty-state-desc">Select "All Milestones" or chat with the assistant to record new timeline events.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const dateFormatted = formatTimelineDate(item.validFrom || item.createdAt);
    return `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-item-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-${item.category}">${item.category}</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">${dateFormatted}</span>
            </div>
            <span style="font-size: 0.74rem; color: var(--text-muted);">${item.source || 'Conversation'}</span>
          </div>

          <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); line-height: 1.5; margin-bottom: 8px;">
            ${escapeHtml(item.content)}
          </div>

          ${item.previousValue ? `
            <div style="margin-bottom: 8px; padding: 6px 10px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; border-radius: 4px; font-size: 0.78rem; color: #92400E;">
              <strong>↻ Evolved from:</strong> ${escapeHtml(item.previousValue)}
            </div>
          ` : ''}

          ${item.tags && item.tags.length > 0 ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
              ${item.tags.map(t => `<span style="font-size: 0.72rem; padding: 2px 8px; background: var(--bg-secondary); border-radius: 4px; color: var(--text-muted);">#${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function setupTimelineFilters() {
  const pills = document.querySelectorAll('#timeline-pills .cat-tab-btn');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      timelineFilter = pill.dataset.cat;
      loadTimeline();
    });
  });
}

function formatTimelineDate(dateStr) {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

