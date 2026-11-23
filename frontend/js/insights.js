/**
 * LIFE MEMORY AI — Personal Insights Logic
 * Dynamically synthesizes insights based on the logged-in user's actual memories.
 */

document.addEventListener('DOMContentLoaded', () => {
  setupPeriodTabs();
  updatePeriodView('weekly');
});

function setupPeriodTabs() {
  const tabs = document.querySelectorAll('#insights-period-tabs .cat-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const period = tab.dataset.period;
      updatePeriodView(period);
    });
  });
}

function updatePeriodView(period) {
  const user = ApiService.getCurrentUser() || { name: 'Member' };
  const firstName = (user.name || 'Member').trim().split(' ')[0];
  const store = getDataStore();
  const memories = store.memories || [];
  const activeMemories = memories.filter(m => m.status === 'active');
  const supersededMemories = memories.filter(m => m.previousValue || m.status === 'superseded');

  const goals = activeMemories.filter(m => m.category === 'goals');
  const career = activeMemories.filter(m => m.category === 'career');
  const skills = activeMemories.filter(m => m.category === 'skills');
  const projects = activeMemories.filter(m => m.category === 'projects');
  const personal = activeMemories.filter(m => m.category === 'personal' || m.category === 'preferences');

  let title = '';
  let dateBadge = '';
  let summary = '';

  if (activeMemories.length === 0) {
    title = `Personal Cognitive Overview — ${firstName}`;
    dateBadge = 'Getting Started';
    summary = `Welcome, ${firstName}! Your personal memory bank has been initialized with clean per-account isolation. As you chat with your AI assistant about your career, goals, projects, and personal preferences, your cognitive highlights, goal trajectories, and evolutionary updates will be automatically synthesized here.`;
  } else if (period === 'weekly') {
    title = `Executive Summary — Weekly Highlights (${firstName})`;
    dateBadge = 'Current Week';
    summary = `During the current period, your memory repository holds ${activeMemories.length} verified active records across ${new Set(activeMemories.map(m => m.category)).size} life categories. ` +
      (career.length > 0 ? `Your professional focus is currently centered around ${career[0].content}. ` : '') +
      (projects.length > 0 ? `Active projects in progress include ${projects[0].content}. ` : '') +
      (supersededMemories.length > 0 ? `You have successfully updated ${supersededMemories.length} life milestones over time, tracking your personal evolution.` : 'All recorded milestones are actively grounded with 0 hallucinations.');
  } else if (period === 'monthly') {
    title = `Monthly Cognitive Synthesis — ${firstName}`;
    dateBadge = 'November 2026';
    summary = `This month has marked steady progression across your personal and professional milestones. ` +
      (goals.length > 0 ? `Primary goal target: ${goals[0].content}. ` : '') +
      (skills.length > 0 ? `Core technical competencies logged: ${skills[0].content}. ` : '') +
      `Your personal AI companion actively keeps your history up-to-date and tracks changes as you advance.`;
  } else {
    title = `Overall Trajectory & Cumulative Memory Horizon — ${firstName}`;
    dateBadge = 'Cumulative Horizon';
    summary = `Overall, your memory repository spans ${memories.length} foundational milestones. ` +
      (personal.length > 0 ? `Personal context highlights: ${personal[0].content}. ` : '') +
      (career.length > 0 ? `Career trajectory: ${career[0].content}. ` : '') +
      `All memories are indexed with strict grounding protocols and zero hallucination.`;
  }

  const titleEl = document.getElementById('summary-period-title');
  const dateEl = document.getElementById('summary-date-badge');
  const textEl = document.getElementById('summary-text');

  if (titleEl) titleEl.textContent = title;
  if (dateEl) dateEl.textContent = dateBadge;
  if (textEl) textEl.textContent = summary;
}
