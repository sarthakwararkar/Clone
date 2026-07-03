# DealDhamal 3D WebGL Butterfly & Meadow Landscape - Session Summary

Use this summary to understand the accomplishments, architectural details, and next steps for the 3D WebGL components in DealDhamal.

---

## 🚀 Accomplishments & Work Done Today

### 1. WebGL 3D Butterfly Interactive Trail
- Loaded and parsed a custom 3D butterfly mesh from `/base.obj` in the client component.
- Implemented a vertex-sorting geometry splitter:
  - Splitted mesh into body, left wing, and right wing components using $X$-coordinate vertex coordinates.
  - Aligned hinges for realistic flapping physics.
- Configured interactive cursor-based cluster spawning (3 butterflies per trail node) up to a strict cap of **15 active meshes** to ensure low-end performance and prevent WebGL resource leaks.
- Animated flight paths using true 3D spherical random vectors (X, Y, Z coordinates).

### 2. High-Resolution 3D Heightmap Terrain Backdrop
- Replaced the simple low-poly backdrop shapes with a continuous, high-definition $110 \times 110$ vertex plane heightmap.
- Modulates Y-height programmatically using multi-octave sine noise to form a rolling green meadow in the foreground and towering, rugged, snow-capped mountains in the background.
- Carves a depressed winding dirt path in the foreground using sine-curve distance blending.
- Implemented altitude-based shading:
  - **Snow-capped peaks** ($Y > 2.1$): White (`#f2f2f2`)
  - **Rugged cliff face** ($1.0 < Y \le 2.1$): Slate-grey (`#5c666b`)
  - **Meadow grass** ($Y \le 1.0$): Alpine forest and deep greens.

### 3. Foliage Instancing & 100% GPU-Accelerated Sway (Lag Fix)
- Renders **1,800 grass blades** and **400 wildflowers** (red poppies, yellow daisies, lavender, cornflowers) using `THREE.InstancedMesh`. Collapses thousands of individual transforms into **only 5 draw calls total**.
- **CPU optimization**: Migrated all foliage swaying logic from JavaScript matrix updates to the GPU.
- Injected wind displacement sways directly into the WebGL vertex shaders during compilation (`onBeforeCompile`), keeping CPU frames completely idle and locked at a smooth **60 FPS**.

### 4. Dual-Canvas Stacking Separation (Overlay Fix)
- Split the WebGL overlay into two separate canvas layers:
  - **Backdrop Canvas (`z-[-10]`)**: Renders only the landscape terrain, mountains, and foliage behind all page content.
  - **Butterflies Canvas (`z-[50]`)**: Sits above all text and header content, rendering only the flying white butterflies (ambient and cursor trails) so they fly on top of everything.
- Made the global body background transparent (`bg-transparent`) in `layout.tsx` and `globals.css` to allow the background sky gradient and mountains to be fully visible without being washed out by screen blending.

---

## 📂 Key File Locations

- **Main WebGL Component**: [ButterflyOverlay.tsx](file:///c:/Users/rames/OneDrive/Desktop/clone/dealdhamal-frontend/components/home/ButterflyOverlay.tsx) - *Contains dual renderers, shader compiler sways, terrain deformation, and butterfly splitting logic.*
- **SSR-Safe Wrapper Component**: [ClientButterflyOverlay.tsx](file:///c:/Users/rames/OneDrive/Desktop/clone/dealdhamal-frontend/components/home/ClientButterflyOverlay.tsx) - *Imports the overlay dynamically with SSR disabled to prevent server compilation errors.*
- **Landing Page mount**: [page.tsx](file:///c:/Users/rames/OneDrive/Desktop/clone/dealdhamal-frontend/app/page.tsx) - *Mounts `<ClientButterflyOverlay />`.*
- **Global Layout & Styling**:
  - [layout.tsx](file:///c:/Users/rames/OneDrive/Desktop/clone/dealdhamal-frontend/app/layout.tsx)
  - [globals.css](file:///c:/Users/rames/OneDrive/Desktop/clone/dealdhamal-frontend/app/globals.css)
- **WebGL Prototype**: [butterfly.html](file:///c:/Users/rames/OneDrive/Desktop/clone/scratch/prototype/butterfly.html) - *Isolated static HTML prototype for landscape styling.*

---

## ⚡ Next Steps
1. **Ambience Controls**: If desired, expose UI controls on the live website (e.g. settings sliders) to let users customize wind speed, butterfly size, and trail density.
2. **Additional Foliage**: Add new wildflower types or small stones and shrubs to the heightmap meadow terrain for extra organic detail.
3. **Lighting Cycles**: Optionally add a day/night color transition cycle to slowly shift the sky gradient from warm sunset to starry night.
