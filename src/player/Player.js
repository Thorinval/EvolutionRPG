import * as THREE from 'three';
import { PrimateCharacter } from './PrimateCharacter.js';

export class Player {
  /**
   * @param {THREE.Scene}        scene
   * @param {THREE.Camera}       camera
   * @param {InputManager}       inputManager
   * @param {EvolutionSystem}    evolutionSystem
   * @param {World}              world
   */
  constructor(scene, camera, inputManager, evolutionSystem, world) {
    this.scene           = scene;
    this.camera          = camera;
    this.input           = inputManager;
    this.evolutionSystem = evolutionSystem;
    this.world           = world;

    // Position and movement
    this.position = new THREE.Vector3();
    this._isMoving = false;
    this._walkTime = 0;

    // Third-person camera angles
    this._yaw      = 0;    // horizontal orbit
    this._pitch    = 0.35; // vertical angle (radians)
    this._camDist  = 9;

    // Resource collection
    this.collectionRadius = 2.5;
    this.lastCollectTime  = 0;

    // Build character
    this.character = new PrimateCharacter(scene);

    // React to evolution
    evolutionSystem.on('evolve', (stage) => this.character.updateStage(stage));
  }

  spawn(position) {
    this.position.copy(position);
    const h = this.world.getHeightAt(position.x, position.z);
    this.position.y = h;
    this.character.mesh.position.copy(this.position);
  }

  update(delta) {
    this._handleCameraRotation();
    this._handleMovement(delta);
    this._animateWalk(delta);
    this._syncMesh();
    this._updateCamera();
  }

  _handleCameraRotation() {
    const { dx, dy } = this.input.consumeMouseDelta();
    this._yaw   -= dx * 0.003;
    this._pitch += dy * 0.003;
    this._pitch  = Math.max(-0.05, Math.min(Math.PI * 0.38, this._pitch));
  }

  _handleMovement(delta) {
    const speed = this.evolutionSystem.currentStage.speed;

    const fwd   = new THREE.Vector3(-Math.sin(this._yaw), 0, -Math.cos(this._yaw));
    const right = new THREE.Vector3( Math.cos(this._yaw), 0, -Math.sin(this._yaw));
    const dir   = new THREE.Vector3();

    if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp'))    dir.add(fwd);
    if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown'))  dir.sub(fwd);
    if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft'))  dir.sub(right);
    if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) dir.add(right);

    this._isMoving = dir.lengthSq() > 0;

    if (this._isMoving) {
      dir.normalize();
      this.position.addScaledVector(dir, speed * delta);

      // Face movement direction
      this.character.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    }

    // Terrain following
    const h = this.world.getHeightAt(this.position.x, this.position.z);
    this.position.y = h;

    // World boundary
    const bound = 94;
    this.position.x = Math.max(-bound, Math.min(bound, this.position.x));
    this.position.z = Math.max(-bound, Math.min(bound, this.position.z));
  }

  /** Subtle idle / walk bobbing via mesh root scale & y offset. */
  _animateWalk(delta) {
    if (this._isMoving) {
      this._walkTime += delta * 8;
    } else {
      this._walkTime += delta * 1.2; // gentle idle sway
    }
    const bob = this._isMoving
      ? Math.sin(this._walkTime) * 0.06
      : Math.sin(this._walkTime) * 0.02;
    this.character.mesh.position.y = this.position.y + bob;
  }

  _syncMesh() {
    this.character.mesh.position.x = this.position.x;
    this.character.mesh.position.z = this.position.z;
  }

  _updateCamera() {
    const d     = this._camDist;
    const pitch = this._pitch;
    const yaw   = this._yaw;

    const cx = this.position.x + d * Math.sin(yaw)  * Math.cos(pitch);
    const cy = this.position.y + d * Math.sin(pitch) + 2;
    const cz = this.position.z + d * Math.cos(yaw)  * Math.cos(pitch);

    this.camera.position.set(cx, cy, cz);
    this.camera.lookAt(
      this.position.x,
      this.position.y + 1.4,
      this.position.z
    );
  }
}
