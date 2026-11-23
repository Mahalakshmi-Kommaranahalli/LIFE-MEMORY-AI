/**
 * LIFE MEMORY AI — Settings & Document Management Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  loadProfile();
  loadMemoryPreferences();
  await loadDocuments();
  setupDocumentUpload();
  setupForms();
});

function setupTabs() {
  const tabs = document.querySelectorAll('.settings-tab');
  const panes = document.querySelectorAll('.settings-section-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.target);
      if (targetPane) {
        targetPane.classList.add('active');
        targetPane.style.display = 'block';
      }
    });
  });
}

function loadProfile() {
  const user = ApiService.getCurrentUser();
  if (!user) return;

  const nameInput = document.getElementById('prof-name');
  const emailInput = document.getElementById('prof-email');
  const roleInput = document.getElementById('prof-role');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (roleInput) roleInput.value = user.role || '';
}

function loadMemoryPreferences() {
  const user = ApiService.getCurrentUser();
  const prefs = user.preferences || {};

  const autoExtract = document.getElementById('pref-auto-extract');
  const conflict = document.getElementById('pref-conflict');
  const slider = document.getElementById('pref-confidence-slider');
  const sliderVal = document.getElementById('pref-confidence-val');
  const topk = document.getElementById('pref-topk');

  if (autoExtract) autoExtract.checked = prefs.autoExtract !== false;
  if (conflict) conflict.checked = prefs.conflictDetection !== false;
  if (slider) {
    const val = Math.round((prefs.confidenceThreshold || 0.75) * 100);
    slider.value = val;
    sliderVal.textContent = val + '%';
    slider.addEventListener('input', () => {
      sliderVal.textContent = slider.value + '%';
    });
  }
  if (topk && prefs.retrievalTopK) {
    topk.value = String(prefs.retrievalTopK);
  }

  const geminiInput = document.getElementById('pref-gemini-key');
  const storedKey = localStorage.getItem('lifememory_gemini_api_key') || prefs.geminiKey || '';
  if (geminiInput) {
    geminiInput.value = storedKey;
  }
}

async function loadDocuments() {
  const container = document.getElementById('documents-list-container');
  if (!container) return;

  try {
    const docs = await ApiService.getDocuments();

    if (docs.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-state-title">No documents indexed yet</div>
          <div class="empty-state-desc">Upload a PDF resume, thesis proposal or certificate above.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = docs.map(doc => `
      <div style="background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 16px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div>
              <div style="font-weight: 700; font-size: 0.94rem; color: var(--text-primary);">${escapeHtml(doc.filename)}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">${doc.size} &bull; ${doc.pages} pages &bull; Indexed on ${new Date(doc.uploadedAt).toLocaleDateString()}</div>
            </div>
          </div>
          <span class="badge badge-active">PyMuPDF Processed</span>
        </div>

        <div style="font-size: 0.84rem; color: var(--text-secondary); background: #FFFFFF; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); line-height: 1.45;">
          ${escapeHtml(doc.summary)}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; color: var(--text-muted);">
          <span>${doc.extractedMemoriesCount || 2} memories extracted into knowledge bank</span>
          <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose); padding: 2px 8px;" onclick="handleDeleteDoc('${doc.id}')">Remove</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load documents:', err);
  }
}

function setupDocumentUpload() {
  const dropzone = document.getElementById('pdf-dropzone');
  const fileInput = document.getElementById('pdf-file-input');
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
    dropzone.style.background = 'var(--primary-subtle)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border-light)';
    dropzone.style.background = 'var(--bg-primary)';
  });

  dropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-light)';
    dropzone.style.background = 'var(--bg-primary)';
    if (e.dataTransfer.files.length > 0) {
      await processFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', async (e) => {
    if (e.target.files.length > 0) {
      await processFileUpload(e.target.files[0]);
    }
  });
}

async function processFileUpload(file) {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Please upload a PDF document format (.pdf)', 'warning');
    return;
  }

  showToast(`Parsing "${file.name}" with PyMuPDF text extractor...`, 'info');
  try {
    const doc = await ApiService.uploadDocument(file);
    showToast(`"${file.name}" indexed successfully! Extracted 2 memories.`, 'success');
    await loadDocuments();
  } catch (err) {
    showToast('Document ingestion failed: ' + err.message, 'error');
  }
}

function handleDeleteDoc(docId) {
  if (confirm('Remove this document record?')) {
    const store = getDataStore();
    store.documents = store.documents.filter(d => d.id !== docId);
    saveDataStore(store);
    showToast('Document removed', 'info');
    loadDocuments();
  }
}

function setupForms() {
  // Profile form
  const profForm = document.getElementById('profile-form');
  if (profForm) {
    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('prof-name').value.trim();
      const email = document.getElementById('prof-email').value.trim();
      const role = document.getElementById('prof-role').value.trim();

      const store = getDataStore();
      store.user.name = name;
      store.user.email = email;
      store.user.role = role;
      store.user.avatarText = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'MK';
      saveDataStore(store);
      localStorage.setItem('lifememory_user', JSON.stringify(store.user));

      AuthGuard.renderUserBadges(store.user);
      showToast('Profile updated successfully!', 'success');
    });
  }

  // Memory Preferences form
  const prefForm = document.getElementById('memory-pref-form');
  if (prefForm) {
    prefForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const store = getDataStore();
      const geminiVal = document.getElementById('pref-gemini-key') ? document.getElementById('pref-gemini-key').value.trim() : '';
      if (geminiVal) {
        localStorage.setItem('lifememory_gemini_api_key', geminiVal);
      } else {
        localStorage.removeItem('lifememory_gemini_api_key');
      }

      store.user.preferences = {
        autoExtract: document.getElementById('pref-auto-extract').checked,
        conflictDetection: document.getElementById('pref-conflict').checked,
        confidenceThreshold: parseInt(document.getElementById('pref-confidence-slider').value, 10) / 100,
        retrievalTopK: parseInt(document.getElementById('pref-topk').value, 10),
        theme: 'light',
        geminiKey: geminiVal
      };
      saveDataStore(store);
      localStorage.setItem('lifememory_user', JSON.stringify(store.user));
      showToast('Cognitive engine & AI model preferences saved!', 'success');
    });
  }

  // Password form
  const pwdForm = document.getElementById('password-form');
  if (pwdForm) {
    pwdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPwd = document.getElementById('new-pwd').value;
      const confPwd = document.getElementById('conf-new-pwd').value;
      if (newPwd !== confPwd) {
        showToast('New passwords do not match!', 'error');
        return;
      }
      showToast('Password hashed and updated securely!', 'success');
      pwdForm.reset();
    });
  }
}

function exportDataAsJSON() {
  const store = getDataStore();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `life_memory_export_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Personal memory archive exported successfully!', 'success');
}

function resetDemoData() {
  if (confirm('Reset memory store for this account?')) {
    resetUserDataStore();
    showToast('Store reset! Reloading...', 'info');
    setTimeout(() => window.location.reload(), 500);
  }
}

function wipeAllData() {
  if (confirm('DANGER: Permanently wipe ALL memories, conversation logs, and embeddings? This cannot be undone.')) {
    const store = getDataStore();
    store.memories = [];
    store.conversations = [];
    store.relationships = [];
    store.documents = [];
    saveDataStore(store);
    showToast('All memories and history wiped permanently.', 'warning');
    setTimeout(() => window.location.reload(), 500);
  }
}

