/** Emoji mapping used in the HUD. */
const RES_EMOJI = { fruit: '🍎', stone: '🪨', stick: '🪵', bone: '🦴', ember: '🔥' };

export class UI {
  /**
   * @param {EvolutionSystem} evolutionSystem
   * @param {Player}          player
   */
  constructor(evolutionSystem, player) {
    this.evo    = evolutionSystem;
    this.player = player;
    this._panelVisible  = false;
    this._notifTimer    = null;

    this._buildHUD();
    this._bindKeys();

    // Wire evolution events
    evolutionSystem.on('evolve',  (stage) => this._showEvolutionNotif(stage));
    evolutionSystem.on('collect', (type)  => this._showCollectPop(type));
  }

  update() {
    this._updateHUD();
  }

  // ── DOM construction ────────────────────────────────────────────

  _buildHUD() {
    const hud = document.createElement('div');
    hud.id = 'hud';
    document.body.appendChild(hud);

    this._stageEl    = this._el('div', 'stage-display', hud);
    this._resEl      = this._el('div', 'resources-panel', hud);
    this._progressEl = this._el('div', 'progress-container', hud);

    const hint = this._el('div', 'controls-hint', hud);
    hint.textContent =
      '🖱️ Clic = capturer souris  •  WASD / ↑↓←→ = Déplacer  •  '
      + 'Approchez des ressources pour les collecter  •  [E] = Arbre d\'Évolution';

    this._notifEl   = this._el('div', 'evolution-notification');
    this._notifEl.style.display = 'none';
    document.body.appendChild(this._notifEl);

    this._popContainer = this._el('div', 'collect-feedback');
    document.body.appendChild(this._popContainer);

    this._panelEl = this._el('div', 'evolution-panel');
    this._panelEl.style.display = 'none';
    document.body.appendChild(this._panelEl);

    this._winEl = this._el('div', 'win-screen');
    this._winEl.style.display = 'none';
    document.body.appendChild(this._winEl);
  }

  _bindKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        this._panelVisible = !this._panelVisible;
        this._panelEl.style.display = this._panelVisible ? 'block' : 'none';
        if (this._panelVisible) this._renderPanel();
      }
    });
  }

  // ── HUD update ──────────────────────────────────────────────────

  _updateHUD() {
    const stage    = this.evo.currentStage;
    const res      = this.evo.resources;
    const total    = this.evo.totalCollected;
    const progress = this.evo.getProgressToNext();
    const next     = this.evo.getNextStage();

    // Stage name
    this._stageEl.innerHTML = `${stage.icon} <strong>${stage.name}</strong>`;

    // Resources row
    this._resEl.innerHTML = Object.entries(RES_EMOJI)
      .map(([id, em]) => `<span class="res-item">${em} ${res[id] || 0}</span>`)
      .join('') + `<span class="res-total">Total: ${total}</span>`;

    // Progress bar
    if (next) {
      const pct  = Math.round(progress * 100);
      const reqs = this._formatReqs(next);
      this._progressEl.innerHTML = `
        <div class="progress-label">Évolution vers ${next.icon} ${next.name} — ${pct}%</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        <div class="progress-req">${reqs}</div>`;
    } else {
      this._progressEl.innerHTML =
        '<div class="progress-label">🏆 Évolution complète — Vous êtes Homo Sapiens!</div>';
    }
  }

  _formatReqs(stage) {
    const res = this.evo.resources;
    const parts = Object.entries(stage.requiredResources).map(([id, need]) => {
      const have  = res[id] || 0;
      const color = have >= need ? '#90EE90' : '#ffb6c1';
      return `<span style="color:${color}">${RES_EMOJI[id]} ${have}/${need}</span>`;
    });
    const t     = this.evo.totalCollected;
    const tn    = stage.requiredTotal;
    const tc    = t >= tn ? '#90EE90' : '#ffb6c1';
    parts.push(`<span style="color:${tc}">Total ${t}/${tn}</span>`);
    return parts.join('  ');
  }

  // ── Evolution panel ─────────────────────────────────────────────

  _renderPanel() {
    const stages = this.evo.stages;
    const cur    = this.evo.stageIndex;
    let html = '<h2>🧬 Arbre d\'Évolution</h2><div class="evolution-tree">';

    stages.forEach((s, i) => {
      let cls = 'evo-stage ';
      if (i < cur)      cls += 'evo-done';
      else if (i === cur) cls += 'evo-current';
      else              cls += 'evo-locked';

      html += `<div class="${cls}">
        <div class="evo-icon">${s.icon}</div>
        <div class="evo-name">${s.name}</div>
        <div class="evo-desc">${s.description}</div>
        ${s.bonus ? `<div class="evo-bonus">✨ ${s.bonus}</div>` : ''}
      </div>`;
      if (i < stages.length - 1) html += '<div class="evo-arrow">↓</div>';
    });

    html += '</div><p class="evo-close">Appuyez sur [E] pour fermer</p>';
    this._panelEl.innerHTML = html;
  }

  // ── Notifications ───────────────────────────────────────────────

  _showEvolutionNotif(stage) {
    this._notifEl.style.display = 'block';
    this._notifEl.innerHTML = `
      <div class="notif-icon">${stage.icon}</div>
      <div class="notif-title">🧬 ÉVOLUTION!</div>
      <div class="notif-name">${stage.name}</div>
      <div class="notif-desc">${stage.description}</div>
      ${stage.bonus ? `<div class="notif-bonus">✨ ${stage.bonus}</div>` : ''}`;

    clearTimeout(this._notifTimer);
    this._notifTimer = setTimeout(() => {
      this._notifEl.style.display = 'none';
    }, 5000);

    if (stage.id === 4) {
      setTimeout(() => this._showWin(), 4000);
    }
  }

  _showCollectPop(type) {
    const pop = document.createElement('div');
    pop.className = 'collect-pop';
    pop.textContent = `+${type.value ?? 1} ${RES_EMOJI[type.id] ?? ''} ${type.name}`;
    // Slight horizontal spread so multiple pops are legible
    pop.style.left = `${44 + Math.random() * 12}%`;
    this._popContainer.appendChild(pop);
    setTimeout(() => pop.remove(), 1500);
  }

  _showWin() {
    this._winEl.style.display = 'flex';
    this._winEl.innerHTML = `
      <div class="win-content">
        <div class="win-icon">🏆</div>
        <h1>FÉLICITATIONS!</h1>
        <h2>Vous êtes Homo Sapiens!</h2>
        <p>Vous avez accompli le voyage de l'évolution, du primate au premier Homme moderne.</p>
        <p>Total de ressources collectées: <strong>${this.evo.totalCollected}</strong></p>
        <button onclick="location.reload()">🔄 Recommencer</button>
      </div>`;
  }

  // ── Utility ─────────────────────────────────────────────────────

  _el(tag, id, parent) {
    const el = document.createElement(tag);
    el.id = id;
    if (parent) parent.appendChild(el);
    return el;
  }
}
