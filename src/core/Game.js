import * as THREE from 'three';
import { InputManager } from './InputManager.js';
import { World } from '../world/World.js';
import { Player } from '../player/Player.js';
import { EvolutionSystem } from '../evolution/EvolutionSystem.js';
import { UI } from '../ui/UI.js';

export class Game {
  constructor() {
    // ── Three.js core ──────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0xadd8e6, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      60, window.innerWidth / window.innerHeight, 0.1, 600
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // ── Systems ────────────────────────────────────────────────
    this.inputManager   = new InputManager(this.renderer.domElement);
    this.evolutionSystem = new EvolutionSystem();
    this.world          = new World(this.scene);
    this.player         = new Player(
      this.scene,
      this.camera,
      this.inputManager,
      this.evolutionSystem,
      this.world
    );
    this.ui = new UI(this.evolutionSystem, this.player);

    // ── Resize ────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  start() {
    this.world.generate();
    this.player.spawn(new THREE.Vector3(0, 0, 0));
    this._buildStartOverlay();
    this._loop();
  }

  _buildStartOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'lock-overlay';
    overlay.innerHTML = `
      <div class="lock-box">
        <h1>🦍 EvolutionRPG</h1>
        <p>Explorez le monde, collectez des ressources</p>
        <p>et évoluez jusqu'à Homo Sapiens!</p>
        <div class="start-btn">▶ Commencer</div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      this.inputManager.requestLock();
      overlay.remove();
    });

    // Also remove overlay when pointer lock obtained
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement && overlay.parentNode) {
        overlay.remove();
      }
    });
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.player.update(delta);
    this.world.update(delta);
    this.world.checkResourceCollection(this.player);
    this.ui.update();

    this.renderer.render(this.scene, this.camera);
  }
}
