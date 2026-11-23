/**
 * LIFE MEMORY AI — Personal Insights Logic
 */

const INSIGHTS_TEXTS = {
  weekly: {
    title: 'Executive Summary — Weekly Highlights (Nov 17 - Nov 23, 2026)',
    date: 'Current Week',
    summary: 'During the past 7 days, 3 new memories were extracted from active conversations. Key discussions focused on finalizing the Life Memory AI architecture, light theme design system, and reviewing vector embeddings with pgvector. Personal preferences regarding light-mode UI and structured technical documentation were validated.'
  },
  monthly: {
    title: 'Monthly Cognitive Synthesis — November 2026',
    date: 'November 2026',
    summary: 'November has marked substantial progress in your Computer Science senior year. Your primary career goal of transitioning into an AI Engineer has gained structural momentum: you have mapped out the 10-step memory extraction pipeline, planned the research paper for Q1 2027, and networked with NLP researchers at the Global AI Summit.'
  },
  all: {
    title: 'Overall Trajectory & Cumulative Memory Horizon',
    date: '2023 - 2027 Horizon',
    summary: 'Overall, your memory repository spans 10 foundational life milestones across 10 distinct categories. Starting as a Computer Science undergraduate, you systematically acquired proficiencies in Python, PyTorch, and Vector Databases, won 1st Place in the University AI Hackathon, and are currently executing the Life Memory AI capstone project.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setupPeriodTabs();
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
  const data = INSIGHTS_TEXTS[period] || INSIGHTS_TEXTS.weekly;
  document.getElementById('summary-period-title').textContent = data.title;
  document.getElementById('summary-date-badge').textContent = data.date;
  document.getElementById('summary-text').textContent = data.summary;
}

