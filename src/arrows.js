/**
 * arrows.js — Motion vector arrows overlaid on the joint.
 * Shows roll direction (curved arrow) and glide direction (straight arrow).
 */

import * as THREE from 'three';

export function buildArrows(scene) {
  const arrows = {};

  // Glide arrow (straight, shows translation direction)
  const glideDir = new THREE.Vector3(1, 0, 0);
  arrows.glide = new THREE.ArrowHelper(glideDir, new THREE.Vector3(0, 1.2, 0), 1.5, 0x00ff88, 0.35, 0.25);
  arrows.glide.visible = false;
  scene.add(arrows.glide);

  // Roll arrow (curved approximation using a torus arc)
  const rollGeo = new THREE.TorusGeometry(0.7, 0.035, 8, 32, Math.PI * 0.8);
  const rollMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
  arrows.rollArc = new THREE.Mesh(rollGeo, rollMat);
  arrows.rollArc.position.set(0, 1.8, 0);
  arrows.rollArc.visible = false;
  scene.add(arrows.rollArc);

  // Arrowhead for roll arc
  const headGeo = new THREE.ConeGeometry(0.12, 0.3, 12);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xff8800 });
  arrows.rollHead = new THREE.Mesh(headGeo, headMat);
  arrows.rollHead.position.set(0.7, 1.8, 0);
  arrows.rollHead.visible = false;
  scene.add(arrows.rollHead);

  return arrows;
}

/**
 * Update arrow positions and directions to match current animation state.
 * @param {object} arrows - arrow objects from buildArrows
 * @param {THREE.Mesh} convexMesh - the moving bone mesh
 * @param {string} rule - 'convex-on-concave' | 'concave-on-convex'
 * @param {object} enabled - { roll, glide }
 */
export function updateArrows(arrows, convexMesh, rule, enabled) {
  const pos = convexMesh.position;

  // --- Glide arrow ---
  if (enabled.glide) {
    const glideDir = new THREE.Vector3(pos.x, pos.y, 0).normalize();
    if (glideDir.lengthSq() < 0.001) glideDir.set(1, 0, 0);
    arrows.glide.setDirection(glideDir);
    arrows.glide.position.set(pos.x * 0.5, pos.y * 0.5 + 1.5, pos.z);
    arrows.glide.visible = true;
  } else {
    arrows.glide.visible = false;
  }

  // --- Roll arc ---
  if (enabled.roll) {
    arrows.rollArc.position.copy(pos).add(new THREE.Vector3(0, 1.1, 0));
    arrows.rollHead.position.copy(pos).add(new THREE.Vector3(0.7, 1.1, 0));

    // Flip arc direction based on rule
    const flipRoll = rule === 'convex-on-concave' ? -1 : 1;
    const boneX = pos.x;
    arrows.rollArc.rotation.z = Math.sign(boneX || 1) * flipRoll * 0.3;

    arrows.rollArc.visible = true;
    arrows.rollHead.visible = true;
  } else {
    arrows.rollArc.visible = false;
    arrows.rollHead.visible = false;
  }
}
