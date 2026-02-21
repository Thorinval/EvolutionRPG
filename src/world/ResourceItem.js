import * as THREE from 'three';

/** Available resource types. */
export const RESOURCE_TYPES = [
  { id: 'fruit',  name: 'Fruit',  color: 0xff3b3b, value: 1, weight: 40, shape: 'sphere'   },
  { id: 'stone',  name: 'Pierre', color: 0x9a9a9a, value: 1, weight: 30, shape: 'box'      },
  { id: 'stick',  name: 'Bâton',  color: 0x7b4513, value: 1, weight: 20, shape: 'cylinder' },
  { id: 'bone',   name: 'Os',     color: 0xf0ead6, value: 2, weight: 8,  shape: 'box'      },
  { id: 'ember',  name: 'Braise', color: 0xff6600, value: 3, weight: 2,  shape: 'sphere'   },
];

/**
 * A single collectable resource object in the world.
 */
export class ResourceItem {
  /**
   * @param {THREE.Scene}    scene
   * @param {object}         type    - one of RESOURCE_TYPES entries
   * @param {THREE.Vector3}  position
   */
  constructor(scene, type, position) {
    this.scene    = scene;
    this.type     = type;
    this.position = position.clone();
    this.active   = true;
    this._bobTime = Math.random() * Math.PI * 2;

    const mat = new THREE.MeshLambertMaterial({
      color: type.color,
      emissive: new THREE.Color(type.color).multiplyScalar(0.15),
    });

    let geo;
    switch (type.shape) {
      case 'sphere':
        geo = new THREE.SphereGeometry(0.24, 8, 6);
        break;
      case 'box':
        geo = new THREE.BoxGeometry(0.28, 0.22, 0.28);
        break;
      case 'cylinder':
        geo = new THREE.CylinderGeometry(0.055, 0.055, 0.52, 6);
        break;
      default:
        geo = new THREE.SphereGeometry(0.24, 8, 6);
    }

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    // Random initial rotation for visual variety
    this.mesh.rotation.y = Math.random() * Math.PI * 2;
    scene.add(this.mesh);

    // Point light for embers
    if (type.id === 'ember') {
      this._light = new THREE.PointLight(0xff6600, 1.2, 4);
      this._light.position.copy(this.position);
      scene.add(this._light);
    }
  }

  update(delta) {
    if (!this.active) return;
    this._bobTime += delta * 2.2;
    const bob = Math.sin(this._bobTime) * 0.12;
    this.mesh.position.y = this.position.y + 0.35 + bob;
    this.mesh.rotation.y += delta * 1.1;
    if (this._light) {
      this._light.position.y = this.position.y + 0.35 + bob;
    }
  }

  collect() {
    this.active = false;
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    if (this._light) {
      this.scene.remove(this._light);
      this._light = null;
    }
  }
}
