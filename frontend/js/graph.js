/**
 * LIFE MEMORY AI — Knowledge Graph Logic
 */

let networkInstance = null;
let graphData = { nodes: [], edges: [] };
let physicsEnabled = true;

const CATEGORY_COLORS = {
  career: { background: '#F5F3FF', border: '#7C3AED', text: '#5B21B6' },
  education: { background: '#EFF6FF', border: '#2563EB', text: '#1E40AF' },
  skills: { background: '#FFFBEB', border: '#D97706', text: '#92400E' },
  projects: { background: '#ECFEFF', border: '#0891B2', text: '#155E75' },
  goals: { background: '#ECFDF5', border: '#059669', text: '#065F46' },
  achievements: { background: '#FEFCE8', border: '#CA8A04', text: '#854D0E' },
  personal: { background: '#FFF1F2', border: '#E11D48', text: '#9F1239' },
  preferences: { background: '#FDF4FF', border: '#C026D3', text: '#86198F' },
  plans: { background: '#EEF2FF', border: '#4F46E5', text: '#3730A3' },
  events: { background: '#F0FDFA', border: '#0D9488', text: '#115E59' }
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadGraph();
  setupGraphControls();
});

async function loadGraph() {
  try {
    graphData = await ApiService.getRelationshipGraph();
    renderNetwork();
  } catch (err) {
    console.error('Failed to load relationship graph:', err);
    showToast('Failed to load relationship graph', 'error');
  }
}

function renderNetwork() {
  const container = document.getElementById('graph-network-container');
  if (!container) return;

  if (!graphData.nodes || graphData.nodes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="margin: auto; text-align: center; padding: 60px 20px;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🕸️</div>
        <div class="empty-state-title" style="font-size: 1.15rem; font-weight: 700;">No Connected Memories Yet</div>
        <div class="empty-state-desc" style="font-size: 0.88rem; color: var(--text-secondary); max-width: 440px; margin: 8px auto 18px;">
          As you chat with your assistant about your career, skills, and goals, your interconnected knowledge graph will automatically grow here.
        </div>
        <a href="chat.html" class="btn btn-primary btn-sm">Start a Conversation</a>
      </div>
    `;
    return;
  }

  if (typeof vis !== 'undefined') {
    // Format Vis nodes with light color scheme
    const nodesArray = graphData.nodes.map(n => {
      const colors = CATEGORY_COLORS[n.category] || CATEGORY_COLORS.career;
      return {
        id: n.id,
        label: n.label,
        shape: 'box',
        margin: 10,
        shapeProperties: { borderRadius: 8 },
        color: {
          background: colors.background,
          border: colors.border,
          highlight: { background: '#FFFFFF', border: '#6366F1' }
        },
        font: {
          color: colors.text,
          size: 13,
          face: 'Plus Jakarta Sans',
          bold: true
        },
        borderWidth: 1.5,
        shadow: { enabled: true, color: 'rgba(15, 23, 42, 0.06)', size: 8, x: 2, y: 3 },
        data: n
      };
    });

    const edgesArray = graphData.edges.map(e => ({
      from: e.source,
      to: e.target,
      label: e.label || '',
      font: { size: 10, color: '#64748B', face: 'Plus Jakarta Sans', align: 'horizontal' },
      arrows: { to: { enabled: true, scaleFactor: 0.7 } },
      color: { color: '#CBD5E1', highlight: '#6366F1' },
      smooth: { type: 'cubicBezier', roundness: 0.2 },
      width: 1.5
    }));

    const data = {
      nodes: new vis.DataSet(nodesArray),
      edges: new vis.DataSet(edgesArray)
    };

    const options = {
      physics: {
        enabled: physicsEnabled,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -40,
          centralGravity: 0.01,
          springLength: 140,
          springConstant: 0.08,
          damping: 0.4
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true
      }
    };

    networkInstance = new vis.Network(container, data, options);

    networkInstance.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = graphData.nodes.find(n => n.id === nodeId);
        if (node) showNodeDetails(node);
      } else {
        closeNodeDetails();
      }
    });

  } else {
    // HTML5 Canvas interactive fallback
    renderCanvasFallback(container);
  }
}

function renderCanvasFallback(container) {
  container.innerHTML = `<canvas id="fallback-canvas" style="width:100%; height:100%;"></canvas>`;
  const canvas = document.getElementById('fallback-canvas');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Position nodes radially
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(cx, cy) * 0.65;

  const positions = {};
  graphData.nodes.forEach((n, idx) => {
    const angle = (idx / graphData.nodes.length) * 2 * Math.PI;
    positions[n.id] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      node: n
    };
  });

  // Draw edges
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  graphData.edges.forEach(e => {
    const p1 = positions[e.source];
    const p2 = positions[e.target];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });

  // Draw nodes
  Object.values(positions).forEach(p => {
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(p.x - 70, p.y - 18, 140, 36, 8) : ctx.rect(p.x - 70, p.y - 18, 140, 36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 11px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText(p.node.label.substring(0, 18), p.x, p.y + 4);
  });
}

function showNodeDetails(node) {
  const card = document.getElementById('node-details-card');
  if (!card) return;

  const catBadge = document.getElementById('card-node-category');
  catBadge.className = `badge badge-${node.category}`;
  catBadge.textContent = node.category;

  document.getElementById('card-node-content').textContent = node.fullContent || node.label;
  document.getElementById('card-node-confidence').textContent = `${Math.round((node.confidence || 0.95) * 100)}%`;

  const connectedEdges = graphData.edges.filter(e => e.source === node.id || e.target === node.id);
  document.getElementById('card-node-connections').textContent = `${connectedEdges.length} connections`;

  card.style.display = 'block';
}

function closeNodeDetails() {
  const card = document.getElementById('node-details-card');
  if (card) card.style.display = 'none';
}

function setupGraphControls() {
  const fitBtn = document.getElementById('btn-fit-graph');
  const physicsBtn = document.getElementById('btn-toggle-physics');
  const searchInput = document.getElementById('graph-search');
  const catFilter = document.getElementById('graph-category-filter');

  if (fitBtn && networkInstance) {
    fitBtn.addEventListener('click', () => {
      networkInstance.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    });
  }

  if (physicsBtn) {
    physicsBtn.addEventListener('click', () => {
      physicsEnabled = !physicsEnabled;
      physicsBtn.textContent = physicsEnabled ? 'Physics: On' : 'Physics: Off';
      if (networkInstance) {
        networkInstance.setOptions({ physics: { enabled: physicsEnabled } });
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      if (!networkInstance) return;
      if (!q) {
        networkInstance.fit();
        return;
      }
      const match = graphData.nodes.find(n => (n.fullContent || n.label).toLowerCase().includes(q));
      if (match) {
        networkInstance.focus(match.id, { scale: 1.2, animation: true });
        networkInstance.selectNodes([match.id]);
        showNodeDetails(match);
      }
    });
  }

  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      const cat = e.target.value;
      if (!networkInstance) return;
      if (cat === 'all') {
        networkInstance.fit();
      } else {
        const matches = graphData.nodes.filter(n => n.category === cat).map(n => n.id);
        if (matches.length > 0) {
          networkInstance.setSelection({ nodes: matches });
          networkInstance.fit({ nodes: matches, animation: true });
        }
      }
    });
  }
}

