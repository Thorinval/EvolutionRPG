import * as THREE from 'three';
import { STAGES } from '../evolution/EvolutionSystem.js';

/**
 * PrimateCharacter — builds a primate mesh from primitives.
 * Appearance evolves from hunched ape to upright Homo Sapiens.
 */
export class PrimateCharacter {
  constructor(scene) {
    this.scene = scene;
    this.root  = new THREE.Group();
    scene.add(this.root);
    this._build(0);
  }

  /** Rebuild the character for the given stage id. */
  updateStage(stage) {
    this._build(stage.id);
  }

  _build(stageId) {
    // Remove previous geometry
    while (this.root.children.length) {
      const c = this.root.children[0];
      c.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      this.root.remove(c);
    }

    const cfg = STAGES[stageId];
    const s   = cfg.bodyScale;

    const skin = new THREE.MeshLambertMaterial({ color: cfg.skinColor });
    const fur  = cfg.furColor
      ? new THREE.MeshLambertMaterial({ color: cfg.furColor })
      : skin;

    // ── Torso ───────────────────────────────────────────────────
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28 * s, 0.34 * s, 0.68 * s, 8),
      fur
    );
    torso.rotation.z = cfg.bodyTilt;
    torso.position.y = 0.98 * s;
    torso.castShadow = true;
    this.root.add(torso);

    // ── Head ────────────────────────────────────────────────────
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.27 * s, 10, 8),
      skin
    );
    const headY  = 1.53 * s + Math.sin(cfg.bodyTilt) * 0.14 * s;
    const headZ  = Math.sin(cfg.bodyTilt) * 0.1;
    head.position.set(0, headY, headZ);
    head.castShadow = true;
    this.root.add(head);

    // ── Snout (reduces as we evolve) ────────────────────────────
    const snoutFactor = Math.max(0, 1 - stageId * 0.22);
    if (snoutFactor > 0.05) {
      const snout = new THREE.Mesh(
        new THREE.SphereGeometry(0.11 * s * snoutFactor, 6, 4),
        skin
      );
      snout.position.set(0, headY - 0.04 * s, headZ + 0.22 * s);
      this.root.add(snout);
    }

    // ── Eyes ────────────────────────────────────────────────────
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const eyeGeo = new THREE.SphereGeometry(0.04 * s, 5, 4);
    const eyeZ   = headZ + 0.22 * s;

    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.1 * s, headY + 0.03 * s, eyeZ);
    this.root.add(lEye);

    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
    rEye.position.set( 0.1 * s, headY + 0.03 * s, eyeZ);
    this.root.add(rEye);

    // ── Arms ─────────────────────────────────────────────────────
    const armLen = 0.78 * s * cfg.armScale;
    const armGeo = new THREE.CylinderGeometry(0.095 * s, 0.075 * s, armLen, 6);
    const armTilt = Math.PI / 7 + Math.abs(cfg.bodyTilt) * 0.5;

    const lArm = new THREE.Mesh(armGeo, fur);
    lArm.rotation.z =  armTilt;
    lArm.position.set(-0.42 * s, 0.98 * s - armLen * 0.08, 0);
    lArm.castShadow = true;
    this.root.add(lArm);

    const rArm = new THREE.Mesh(armGeo, fur);
    rArm.rotation.z = -armTilt;
    rArm.position.set( 0.42 * s, 0.98 * s - armLen * 0.08, 0);
    rArm.castShadow = true;
    this.root.add(rArm);

    // ── Legs ─────────────────────────────────────────────────────
    const legLen = 0.72 * s * cfg.legScale;
    const legGeo = new THREE.CylinderGeometry(0.115 * s, 0.09 * s, legLen, 6);
    const legBend = Math.abs(cfg.bodyTilt) * 0.5;

    const lLeg = new THREE.Mesh(legGeo, fur);
    lLeg.position.set(-0.17 * s, 0.4 * s - legLen * 0.1, 0);
    lLeg.rotation.z =  legBend;
    lLeg.castShadow = true;
    this.root.add(lLeg);

    const rLeg = new THREE.Mesh(legGeo, fur);
    rLeg.position.set( 0.17 * s, 0.4 * s - legLen * 0.1, 0);
    rLeg.rotation.z = -legBend;
    rLeg.castShadow = true;
    this.root.add(rLeg);

    // ── Tool (stage ≥ 1) ─────────────────────────────────────────
    if (stageId >= 1) {
      this._addTool(stageId, s);
    }

    // ── Loincloth for Homo Sapiens ───────────────────────────────
    if (stageId === 4) {
      const cloth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3 * s, 0.38 * s, 0.38 * s, 8),
        new THREE.MeshLambertMaterial({ color: 0x7a5c1e })
      );
      cloth.position.y = 0.72 * s;
      this.root.add(cloth);
    }
  }

  _addTool(stageId, s) {
    if (stageId >= 3) {
      // Spear
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * s, 0.03 * s, 1.8 * s, 6),
        new THREE.MeshLambertMaterial({ color: 0x6b3a1f })
      );
      shaft.rotation.z = Math.PI / 6;
      shaft.position.set(0.58 * s, 1.2 * s, 0);
      this.root.add(shaft);

      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.07 * s, 0.22 * s, 6),
        new THREE.MeshLambertMaterial({ color: 0xb0b0b0 })
      );
      tip.rotation.z = Math.PI / 6;
      tip.position.set(0.74 * s, 2.1 * s, 0);
      this.root.add(tip);
    } else {
      // Stone hand-axe
      const stone = new THREE.Mesh(
        new THREE.BoxGeometry(0.14 * s, 0.1 * s, 0.07 * s),
        new THREE.MeshLambertMaterial({ color: 0x808080 })
      );
      stone.position.set(0.5 * s, 0.8 * s, 0);
      this.root.add(stone);
    }
  }

  get mesh() { return this.root; }
}
