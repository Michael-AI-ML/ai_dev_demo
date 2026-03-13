# Kinesiology Demo — Arthrokinematics Visualizer

An interactive browser-based 3D visualization of arthrokinematic principles for undergraduate Kinesiology education. Built with [Three.js](https://threejs.org/) and [Vite](https://vitejs.dev/).

## What It Teaches

**Arthrokinematics** describes how joint surfaces move relative to one another. This demo visualizes the three fundamental motions:

| Motion | Description |
|--------|-------------|
| **Roll** | New contact points on one surface meet new points on the other — like a wheel rolling on pavement |
| **Glide (Slide)** | One point on a surface translates across new points on the opposing surface |
| **Spin** | Rotation around a stationary mechanical axis (e.g., radial head on capitulum) |

### The Concave-Convex Rule

| Moving Surface | Roll Direction | Glide Direction |
|---|---|---|
| Convex | Same as bone motion | **Opposite** to bone motion |
| Concave | Same as bone motion | **Same** as bone motion |

## Joints Modeled

- **Glenohumeral (Shoulder)** — large convex humeral head / shallow glenoid fossa
- **Tibiofemoral (Knee)** — convex femoral condyles / relatively flat tibial plateau
- **Talocrural (Ankle)** — convex talar dome / concave tibial mortise
- **Hip (Coxofemoral)** — deep ball-and-socket

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later

### Install & Run

```bash
git clone <repo-url>
cd kinesiology_demo
npm install
npm run dev
```

Open your browser to `http://localhost:5173`

### Build for Production (deploy to course LMS)

```bash
npm run build
# Output in dist/ — upload to any static host or LMS file manager
```

## Project Structure

```
kinesiology_demo/
├── index.html          # Entry HTML, UI scaffold
├── src/
│   ├── main.js         # Boot: wires scene, joints, animation, UI
│   ├── scene.js        # Three.js renderer, camera, lights, orbit controls
│   ├── joints.js       # Joint geometry configs and mesh builders
│   ├── animation.js    # Arthrokinematic motion math (concave-convex rule)
│   ├── arrows.js       # Motion vector arrow overlays
│   └── style.css       # Dark-theme UI styles
├── package.json
└── vite.config.js
```

## Roadmap

- [ ] Anatomical 3D bone models (GLTF import from open anatomy libraries)
- [ ] Sagittal/frontal/transverse plane view toggle
- [ ] Frame-by-frame step controls for classroom use
- [ ] Contact point trace (shows path of contact arc during motion)
- [ ] AI explanation panel (Claude API) — student asks questions, gets answers synced to animation
- [ ] Export frames as PNG/GIF for slide decks
- [ ] Additional joints: radiohumeral, subtalar, CMC thumb, AC joint

## License

MIT
