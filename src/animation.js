/**
 * animation.js — Arthrokinematic motion logic.
 *
 * Implements the concave-convex rule:
 *
 * CONVEX-on-CONCAVE (e.g. humeral head on glenoid):
 *   Roll and glide are in OPPOSITE directions.
 *   → Pure roll would dislocate the joint; glide counteracts this.
 *
 * CONCAVE-on-CONVEX (e.g. knee flexion, tibia on femur):
 *   Roll and glide are in the SAME direction.
 *
 * The animation drives the convex mesh through an arc while
 * decomposing movement into roll (self-rotation) + glide (translation).
 * Spin is added as axial rotation around the bone shaft axis.
 */

import * as THREE from 'three';

export class ArthroAnimation {
  constructor({ convexMesh, config }) {
    this.convexMesh = convexMesh;
    this.config = config;

    // State
    this.t = 0;           // normalized time 0–1
    this.playing = false;
    this.speed = 1.0;
    this.direction = 1;   // 1 = forward, -1 = reverse (ping-pong)

    // Motion toggles
    this.rollEnabled = true;
    this.glideEnabled = true;
    this.spinEnabled = false;

    // Rule: 'convex-on-concave' | 'concave-on-convex'
    this.rule = 'convex-on-concave';

    // Original position to restore on reset
    this._origin = convexMesh.position.clone();
    this._originRot = convexMesh.rotation.clone();
  }

  setRule(rule) {
    this.rule = rule;
    this.reset();
  }

  setJoint(convexMesh, config) {
    this.convexMesh = convexMesh;
    this.config = config;
    this._origin = convexMesh.position.clone();
    this._originRot = convexMesh.rotation.clone();
    this.t = 0;
    this.direction = 1;
  }

  play()  { this.playing = true; }
  pause() { this.playing = false; }

  reset() {
    this.t = 0;
    this.direction = 1;
    this.playing = false;
    this._applyTransform(0);
  }

  /**
   * Advance the animation by delta seconds.
   */
  tick(delta) {
    if (!this.playing) return;

    // Advance time
    this.t += delta * this.speed * 0.35 * this.direction;

    // Ping-pong
    if (this.t >= 1) { this.t = 1; this.direction = -1; }
    if (this.t <= 0) { this.t = 0; this.direction = 1; }

    this._applyTransform(this.t);
  }

  _applyTransform(t) {
    const { motionArc, convexRadius } = this.config;

    // Eased time (smooth start/stop)
    const te = easeInOut(t);

    // Total arc swept by the bone (e.g. 0 → 108° for shoulder)
    const boneAngle = (te - 0.5) * motionArc; // centered around 0

    // --- GLIDE (translation) ---
    // Convex center traces an arc around the center of the concave sphere.
    // The radius of this arc = concaveRadius (surface of the socket).
    // We animate in the XY plane (sagittal view).
    const arcRadius = this.config.concaveRadius;

    let posX = 0;
    let posY = 0;

    if (this.glideEnabled) {
      // The convex center travels along the concave sphere surface arc
      posX = Math.sin(boneAngle) * arcRadius;
      posY = Math.cos(boneAngle) * arcRadius - arcRadius; // offset so neutral = (0,0)
    }

    this.convexMesh.position.set(posX, posY, this._origin.z);

    // --- ROLL (self-rotation of convex bone) ---
    let rollAngle = 0;

    if (this.rollEnabled) {
      if (this.rule === 'convex-on-concave') {
        // Convex rolls opposite to glide direction (prevents dislocation)
        // Roll amount ≈ same magnitude as the arc swept, but opposite sign
        rollAngle = -boneAngle * 1.2;
      } else {
        // Concave-on-convex: roll same direction as glide
        rollAngle = boneAngle * 1.2;
      }
    }

    // --- SPIN (axial rotation) ---
    let spinAngle = 0;
    if (this.spinEnabled) {
      spinAngle = te * Math.PI * 0.4;
    }

    this.convexMesh.rotation.set(0, spinAngle, rollAngle);
  }
}

function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}
