/**
 * main.js — Entry point. Wires scene, joint, animation, UI, and render loop.
 */

import * as THREE from 'three';
import { createScene } from './scene.js';
import { buildJoint, JOINT_CONFIGS } from './joints.js';
import { ArthroAnimation } from './animation.js';
import { buildArrows, updateArrows } from './arrows.js';

// ─── Boot ────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('three-canvas');
const { scene, camera, renderer, controls } = createScene(canvas);

// ─── Joint state ─────────────────────────────────────────────────────────────

let currentJointKey = 'glenohumeral';
let joint = buildJoint(currentJointKey);
scene.add(joint.group);

// ─── Animation ────────────────────────────────────────────────────────────────

const anim = new ArthroAnimation({ convexMesh: joint.convexMesh, config: joint.config });

// ─── Arrows ───────────────────────────────────────────────────────────────────

const arrows = buildArrows(scene);

// ─── UI wiring ───────────────────────────────────────────────────────────────

// Joint selector
document.querySelectorAll('#joint-selector .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#joint-selector .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Remove old joint
    scene.remove(joint.group);

    // Build new joint
    currentJointKey = btn.dataset.joint;
    joint = buildJoint(currentJointKey);
    scene.add(joint.group);

    // Update animation target
    anim.setJoint(joint.convexMesh, joint.config);

    // Update description overlay
    updateJointLabel(currentJointKey);
  });
});

// Rule selector
const ruleText = document.getElementById('rule-text');
const ruleDescriptions = {
  'concave-on-convex':
    'When the <strong>concave</strong> surface moves, roll and glide occur in the <strong>same</strong> direction as bone motion.',
  'convex-on-concave':
    'When the <strong>convex</strong> surface moves, roll and glide occur in <strong>opposite</strong> directions — glide prevents joint dislocation.',
};

document.querySelectorAll('#rule-selector .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#rule-selector .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const rule = btn.dataset.rule;
    anim.setRule(rule);
    ruleText.innerHTML = ruleDescriptions[rule];
    updateMotionIndicator(rule);
  });
});

// Motion toggles
document.getElementById('toggle-roll').addEventListener('change', e => {
  anim.rollEnabled = e.target.checked;
  document.getElementById('card-roll').classList.toggle('active', e.target.checked);
});
document.getElementById('toggle-glide').addEventListener('change', e => {
  anim.glideEnabled = e.target.checked;
  document.getElementById('card-glide').classList.toggle('active', e.target.checked);
});
document.getElementById('toggle-spin').addEventListener('change', e => {
  anim.spinEnabled = e.target.checked;
  document.getElementById('card-spin').classList.toggle('active', e.target.checked);
});

// Playback buttons
document.getElementById('btn-play').addEventListener('click', () => anim.play());
document.getElementById('btn-pause').addEventListener('click', () => anim.pause());
document.getElementById('btn-reset').addEventListener('click', () => {
  anim.reset();
  // Reapply mesh to scene in case it got replaced
});

// Speed slider
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
speedSlider.addEventListener('input', () => {
  anim.speed = parseFloat(speedSlider.value);
  speedValue.textContent = anim.speed.toFixed(1) + 'x';
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function updateJointLabel(jointKey) {
  const config = JOINT_CONFIGS[jointKey];
  document.getElementById('motion-desc').textContent = config.description;
}

function updateMotionIndicator(rule) {
  const nameEl = document.getElementById('motion-name');
  nameEl.textContent = rule === 'convex-on-concave'
    ? 'Roll ↕  Glide ↓  (opposite)'
    : 'Roll ↕  Glide ↑  (same dir)';
}

// Initial label
updateJointLabel(currentJointKey);
document.getElementById('card-roll').classList.add('active');
document.getElementById('card-glide').classList.add('active');

// ─── Render loop ─────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Tick animation
  anim.tick(delta);

  // Update motion arrows
  updateArrows(arrows, joint.convexMesh, anim.rule, {
    roll: anim.rollEnabled,
    glide: anim.glideEnabled,
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
