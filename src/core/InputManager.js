/**
 * InputManager — keyboard and pointer-lock mouse handling.
 */
export class InputManager {
  constructor(domElement) {
    this._keys = {};
    this._mouseDx = 0;
    this._mouseDy = 0;
    this.isPointerLocked = false;
    this._domElement = domElement;

    document.addEventListener('keydown', (e) => { this._keys[e.code] = true; });
    document.addEventListener('keyup',   (e) => { this._keys[e.code] = false; });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this._mouseDx += e.movementX;
        this._mouseDy += e.movementY;
      }
    });
  }

  requestLock() {
    if (!this.isPointerLocked) {
      this._domElement.requestPointerLock();
    }
  }

  isKeyDown(code) {
    return !!this._keys[code];
  }

  /** Returns accumulated mouse delta since last call and resets it. */
  consumeMouseDelta() {
    const dx = this._mouseDx;
    const dy = this._mouseDy;
    this._mouseDx = 0;
    this._mouseDy = 0;
    return { dx, dy };
  }
}
