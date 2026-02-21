/**
 * Evolution system data — 5 stages from Australopithecus to Homo Sapiens.
 */
export const STAGES = [
  {
    id: 0,
    name: 'Australopithecus',
    description: 'Premier ancêtre bipède. Se nourrit de fruits et de plantes.',
    icon: '🦍',
    requiredTotal: 0,
    requiredResources: {},
    speed: 3.0,
    skinColor: 0x3d1c02,
    furColor:  0x2a1200,
    bodyTilt:  -0.45,
    armScale:  1.15,
    legScale:  0.85,
    bodyScale: 0.85,
  },
  {
    id: 1,
    name: 'Homo Habilis',
    description: 'Utilise des outils rudimentaires. Commence la chasse.',
    icon: '🪨',
    requiredTotal: 20,
    requiredResources: { fruit: 10, stone: 5 },
    speed: 3.5,
    bonus: '+Vitesse • Fabrication d\'outils',
    skinColor: 0x6b3a1f,
    furColor:  0x4a2610,
    bodyTilt:  -0.28,
    armScale:  1.05,
    legScale:  0.9,
    bodyScale: 0.9,
  },
  {
    id: 2,
    name: 'Homo Erectus',
    description: 'Maîtrise le feu. Explore de nouveaux territoires.',
    icon: '🔥',
    requiredTotal: 50,
    requiredResources: { fruit: 20, stone: 15, stick: 10 },
    speed: 4.0,
    bonus: '+Vitesse • Contrôle du feu',
    skinColor: 0x9b6b4f,
    furColor:  0x7a4a2a,
    bodyTilt:  -0.12,
    armScale:  0.97,
    legScale:  0.97,
    bodyScale: 0.95,
  },
  {
    id: 3,
    name: 'Homo Neanderthalensis',
    description: 'Chasseur habile. Développe une culture sociale complexe.',
    icon: '🏹',
    requiredTotal: 100,
    requiredResources: { stone: 25, stick: 20, bone: 10 },
    speed: 4.5,
    bonus: '+Force • Langage primitif',
    skinColor: 0xb8855f,
    furColor:  0x9a6040,
    bodyTilt:  -0.04,
    armScale:  0.92,
    legScale:  1.02,
    bodyScale: 1.0,
  },
  {
    id: 4,
    name: 'Homo Sapiens',
    description: 'Sapience totale. L\'Homme moderne est né!',
    icon: '🧠',
    requiredTotal: 180,
    requiredResources: { stone: 30, bone: 20, ember: 10 },
    speed: 5.0,
    bonus: '+Intellect • Langage • Art',
    skinColor: 0xd4a574,
    furColor:  null,
    bodyTilt:  0,
    armScale:  0.87,
    legScale:  1.08,
    bodyScale: 1.05,
  },
];

/**
 * EvolutionSystem — tracks collected resources and manages stage progression.
 */
export class EvolutionSystem {
  constructor() {
    this.stageIndex = 0;
    this.resources  = { fruit: 0, stone: 0, stick: 0, bone: 0, ember: 0 };
    this.totalCollected = 0;

    // Callbacks (set externally)
    this._listeners = { evolve: [], collect: [] };
  }

  get currentStage() { return STAGES[this.stageIndex]; }
  get stages()        { return STAGES; }

  on(event, fn) {
    if (this._listeners[event]) this._listeners[event].push(fn);
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach((fn) => fn(data));
  }

  addResource(type) {
    const amount = type.value ?? 1;
    this.resources[type.id] = (this.resources[type.id] || 0) + amount;
    this.totalCollected += amount;
    this._emit('collect', type);
    this._checkEvolution();
  }

  _checkEvolution() {
    if (this.stageIndex >= STAGES.length - 1) return;
    const next = STAGES[this.stageIndex + 1];
    if (this._canEvolve(next)) this._evolve(next);
  }

  _canEvolve(nextStage) {
    if (this.totalCollected < nextStage.requiredTotal) return false;
    for (const [res, need] of Object.entries(nextStage.requiredResources)) {
      if ((this.resources[res] || 0) < need) return false;
    }
    return true;
  }

  _evolve(stage) {
    this.stageIndex = stage.id;
    this._emit('evolve', stage);
  }

  /** 0‒1 progress toward the next evolution. */
  getProgressToNext() {
    if (this.stageIndex >= STAGES.length - 1) return 1;
    const next = STAGES[this.stageIndex + 1];
    return Math.min(1, this.totalCollected / next.requiredTotal);
  }

  getNextStage() {
    if (this.stageIndex >= STAGES.length - 1) return null;
    return STAGES[this.stageIndex + 1];
  }

  /** Detailed per-resource progress toward next stage. */
  getResourceProgress() {
    if (this.stageIndex >= STAGES.length - 1) return [];
    const next = STAGES[this.stageIndex + 1];
    return Object.entries(next.requiredResources).map(([id, need]) => ({
      id,
      have: this.resources[id] || 0,
      need,
    }));
  }
}
