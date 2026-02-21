import * as THREE from 'three';
import { ResourceItem, RESOURCE_TYPES } from './ResourceItem.js';

const WORLD_SIZE  = 200;
const RESPAWN_MIN = 6000;   // ms
const RESPAWN_MAX = 14000;  // ms
const RESOURCE_COUNT = 110;
const TREE_COUNT     = 160;

/**
 * Procedural terrain height formula.
 * Must match the vertex shader used when building the terrain mesh.
 */
function heightAt(x, z) {
  let h = 0;
  h += Math.sin(x * 0.05)         * Math.cos(z * 0.05)         * 3.0;
  h += Math.sin(x * 0.12 + 1.3)   * Math.cos(z * 0.10 - 0.7)  * 1.5;
  h += Math.sin(x * 0.25 + 2.1)   * Math.cos(z * 0.22 + 1.1)  * 0.7;
  h += Math.sin(x * 0.50 + 0.5)   * Math.cos(z * 0.50 - 0.3)  * 0.3;
  // Flatten the central spawn area
  const d = Math.sqrt(x * x + z * z);
  if (d < 10) h *= d / 10;
  return h;
}

export class World {
  constructor(scene) {
    this.scene     = scene;
    this.resources = [];
  }

  /** Expose terrain height for other systems. */
  getHeightAt(x, z) { return heightAt(x, z); }

  generate() {
    this._setupLighting();
    this._buildTerrain();
    this._buildTrees(TREE_COUNT);
    this._spawnResources(RESOURCE_COUNT);
  }

  /** Called every frame — animates bobbing resource pickups. */
  update(delta) {
    for (const r of this.resources) r.update(delta);
  }

  /**
   * Walk the active resource list and collect any that are within
   * the player's collection radius.
   */
  checkResourceCollection(player) {
    const now    = performance.now();
    if (now - player.lastCollectTime < 250) return;

    const pos    = player.position;
    const radius = player.collectionRadius;

    for (let i = this.resources.length - 1; i >= 0; i--) {
      const res = this.resources[i];
      if (!res.active) continue;

      if (pos.distanceTo(res.position) < radius) {
        res.collect();
        player.evolutionSystem.addResource(res.type);
        player.lastCollectTime = now;
        this.resources.splice(i, 1);

        // Schedule respawn
        const delay = RESPAWN_MIN + Math.random() * (RESPAWN_MAX - RESPAWN_MIN);
        setTimeout(() => this._spawnOne(), delay);

        break; // one resource per check
      }
    }
  }

  // ── Private helpers ────────────────────────────────────────────

  _setupLighting() {
    this.scene.add(new THREE.AmbientLight(0xffe4c4, 0.55));

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
    sun.position.set(60, 120, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(2048);
    sun.shadow.camera.near   = 1;
    sun.shadow.camera.far    = 300;
    sun.shadow.camera.left   = -110;
    sun.shadow.camera.right  =  110;
    sun.shadow.camera.top    =  110;
    sun.shadow.camera.bottom = -110;
    this.scene.add(sun);

    this.scene.add(new THREE.HemisphereLight(0x87ceeb, 0x3d7a3d, 0.38));
  }

  _buildTerrain() {
    const segs = 120;
    const geo  = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos    = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);

      // Vertex colour by altitude
      let r, g, b;
      if      (h < -1.8) { r = 0.18; g = 0.38; b = 0.75; }  // deep water
      else if (h < -0.5) { r = 0.26; g = 0.52; b = 0.80; }  // shallow water
      else if (h <  0.2) { r = 0.80; g = 0.74; b = 0.50; }  // sand
      else if (h <  2.2) { r = 0.25; g = 0.55; b = 0.18; }  // grass
      else if (h <  3.8) { r = 0.15; g = 0.40; b = 0.12; }  // forest
      else               { r = 0.55; g = 0.50; b = 0.45; }  // rock

      colors[i * 3]     = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshLambertMaterial({ vertexColors: true })
    );
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  _buildTrees(count) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2c0a });
    const leafCols = [0x2d6a1e, 0x3d8a25, 0x1e4e10];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * (WORLD_SIZE - 20);
      const z = (Math.random() - 0.5) * (WORLD_SIZE - 20);

      // Skip spawn area
      if (Math.sqrt(x * x + z * z) < 12) continue;

      const h = heightAt(x, z);
      if (h < 0.3) continue; // no trees in water / sand

      const treeH = 1.6 + Math.random() * 2.2;
      const group = new THREE.Group();

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.24, treeH, 6),
        trunkMat
      );
      trunk.position.y = treeH / 2;
      trunk.castShadow  = true;
      group.add(trunk);

      for (let j = 0; j < 3; j++) {
        const r    = (1.4 - j * 0.28) * (0.85 + Math.random() * 0.3);
        const leaf = new THREE.Mesh(
          new THREE.ConeGeometry(r, 1.1 - j * 0.15, 8),
          new THREE.MeshLambertMaterial({ color: leafCols[j] })
        );
        leaf.position.y = treeH + j * 0.75 + 0.3;
        leaf.castShadow  = true;
        group.add(leaf);
      }

      group.position.set(x, h, z);
      this.scene.add(group);
    }
  }

  _spawnResources(count) {
    for (let i = 0; i < count; i++) this._spawnOne();
  }

  _spawnOne() {
    let x, z, h;
    let attempts = 0;
    do {
      x = (Math.random() - 0.5) * (WORLD_SIZE - 24);
      z = (Math.random() - 0.5) * (WORLD_SIZE - 24);
      h = heightAt(x, z);
      attempts++;
    } while (h < 0 && attempts < 10);

    if (h < 0) return; // couldn't find dry land

    const type = this._pickType();
    this.resources.push(new ResourceItem(this.scene, type, new THREE.Vector3(x, h, z)));
  }

  _pickType() {
    const total = RESOURCE_TYPES.reduce((s, t) => s + t.weight, 0);
    let rand = Math.random() * total;
    for (const t of RESOURCE_TYPES) {
      rand -= t.weight;
      if (rand <= 0) return t;
    }
    return RESOURCE_TYPES[0];
  }
}
