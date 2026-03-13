/**
 * joints.js — Joint geometry definitions and Three.js mesh builders.
 *
 * Each joint config describes:
 *   - convexRadius: radius of the convex (ball-like) surface
 *   - concaveRadius: radius of the concave (socket-like) surface
 *   - concaveDepth: how deep the socket arc is (0–1 fraction of concaveRadius)
 *   - label: display name
 *   - description: clinical context
 */

import * as THREE from 'three';

export const JOINT_CONFIGS = {
  glenohumeral: {
    label: 'Glenohumeral (Shoulder)',
    description: 'Ball-and-socket. Large convex humeral head articulates with small, shallow concave glenoid fossa.',
    convexRadius: 1.0,
    concaveRadius: 1.15,
    concaveDepth: 0.35,
    convexColor: 0xe8c49a,
    concaveColor: 0xa8d8ea,
    motionArc: Math.PI * 0.6,
  },
  knee: {
    label: 'Tibiofemoral (Knee)',
    description: 'Modified hinge. Convex femoral condyles roll/glide on the relatively flat (concave) tibial plateau.',
    convexRadius: 1.1,
    concaveRadius: 1.4,
    concaveDepth: 0.18,
    convexColor: 0xe8c49a,
    concaveColor: 0xa8d8ea,
    motionArc: Math.PI * 0.55,
  },
  ankle: {
    label: 'Talocrural (Ankle)',
    description: 'Hinge joint. Convex talar dome articulates with concave tibial mortise.',
    convexRadius: 0.9,
    concaveRadius: 1.05,
    concaveDepth: 0.42,
    convexColor: 0xe8c49a,
    concaveColor: 0xa8d8ea,
    motionArc: Math.PI * 0.5,
  },
  hip: {
    label: 'Hip (Coxofemoral)',
    description: 'Deep ball-and-socket. Convex femoral head fits deeply into concave acetabulum.',
    convexRadius: 1.0,
    concaveRadius: 1.08,
    concaveDepth: 0.65,
    convexColor: 0xe8c49a,
    concaveColor: 0xa8d8ea,
    motionArc: Math.PI * 0.65,
  },
};

/**
 * Build a Three.js Group representing the joint pair.
 * Returns { group, convexMesh, concaveMesh, config }
 */
export function buildJoint(jointKey) {
  const config = JOINT_CONFIGS[jointKey];
  const group = new THREE.Group();

  // --- Materials ---
  const convexMat = new THREE.MeshPhongMaterial({
    color: config.convexColor,
    shininess: 80,
    transparent: true,
    opacity: 0.92,
    side: THREE.FrontSide,
  });

  const concaveMat = new THREE.MeshPhongMaterial({
    color: config.concaveColor,
    shininess: 40,
    transparent: true,
    opacity: 0.75,
    side: THREE.BackSide, // render inside of the socket
  });

  const concaveOuterMat = new THREE.MeshPhongMaterial({
    color: config.concaveColor,
    shininess: 40,
    transparent: true,
    opacity: 0.25,
    side: THREE.FrontSide,
  });

  // --- Convex surface (bone moving) ---
  const convexGeo = new THREE.SphereGeometry(config.convexRadius, 48, 48);
  const convexMesh = new THREE.Mesh(convexGeo, convexMat);
  convexMesh.castShadow = true;

  // Add a bone "shaft" to the convex side for orientation cues
  const shaftGeo = new THREE.CylinderGeometry(0.22, 0.3, 2.8, 20);
  const shaftMat = new THREE.MeshPhongMaterial({ color: config.convexColor, shininess: 60 });
  const shaft = new THREE.Mesh(shaftGeo, shaftMat);
  shaft.position.y = 1.8;
  convexMesh.add(shaft);

  // --- Concave surface (socket / fixed side) ---
  const concaveGeo = new THREE.SphereGeometry(config.concaveRadius, 48, 48);
  // Two meshes: backside (shows interior) + faint frontside for depth
  const concaveMeshInner = new THREE.Mesh(concaveGeo, concaveMat);
  const concaveMeshOuter = new THREE.Mesh(concaveGeo, concaveOuterMat);
  const concaveGroup = new THREE.Group();
  concaveGroup.add(concaveMeshInner);
  concaveGroup.add(concaveMeshOuter);

  // Add a "bone block" behind the socket for anatomical context
  const blockGeo = new THREE.BoxGeometry(2.2, 1.4, 1.0);
  const blockMat = new THREE.MeshPhongMaterial({ color: config.concaveColor, shininess: 30 });
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.position.set(0, 0, -config.concaveRadius * 0.7);
  block.castShadow = true;
  concaveGroup.add(block);

  // --- Positioning ---
  // Concave fixed at origin
  concaveGroup.position.set(0, 0, 0);
  // Convex starts resting inside the socket
  convexMesh.position.set(0, 0, 0);

  group.add(concaveGroup);
  group.add(convexMesh);

  return { group, convexMesh, concaveGroup, config };
}

/**
 * Cartilage contact arc visualization (arc drawn on convex surface)
 */
export function buildContactArc(convexRadius) {
  const points = [];
  const segments = 32;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 0.5 - Math.PI * 0.25;
    points.push(new THREE.Vector3(
      Math.sin(angle) * convexRadius * 1.01,
      Math.cos(angle) * convexRadius * 1.01,
      0
    ));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 2 });
  return new THREE.Line(geo, mat);
}
