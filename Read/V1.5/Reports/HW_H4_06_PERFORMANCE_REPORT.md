# HW-H4-06 — PERFORMANCE PROFILING & TARGETED OPTIMIZATION REPORT

**Project:** HOLLOW WOODS (`V1.5.4 Stability & Bug Fix`)
**Branch:** `feat/v1.5.3-ag-world-polish` (HEAD `0617668a97f462877cbe2c30d304323e8fd48f6e` + uncommitted HW-H4-01..06 changes)
**Target:** Real-GPU Performance Profiling & Optimization (No visual/atmosphere/gameplay regression)
**Status:** **COMPLETED & VERIFIED (MAX 2 BOTTLENECKS FIXED)**

---

## 1. Test Hardware, Browser & Runtime Environment (§2)

| Parameter | Measured Specification |
| --- | --- |
| **OS** | Microsoft Windows (`win32`) |
| **CPU** | `Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz` (`6` cores / `12` logical processors) |
| **GPU** | `NVIDIA GeForce GTX 1070 Ti` (Hardware D3D11 — **NO SwiftShader**) |
| **RAM** | `31.94 GB` |
| **Browser** | Google Chrome `HeadlessChrome/158.0.0.0` (`C:/Program Files/Google/Chrome/Application/chrome.exe`) |
| **WebGL Renderer** | `ANGLE (NVIDIA, NVIDIA GeForce GTX 1070 Ti (0x00001B82) Direct3D11 vs_5_0 ps_5_0, D3D11)` |
| **WebGL Vendor** | `Google Inc. (NVIDIA)` |
| **WebGL Version (Canvas)** | `WebGL 1.0 (OpenGL ES 2.0 Chromium)` |
| **Resolution** | `1280×720` (`devicePixelRatio = 1`) |
| **Builds Tested** | Production `dist/` (`F9 OFF` baseline & after), Vite Dev Server `/?dev=1` (`F9 ON` separate check) |
| **Sampling Protocol** | `10.0s` steady measurement after `1.2s–1.5s` warmup, `2` sequential replicates per scenario (`71` scenarios = `142 BEFORE` + `142 AFTER` = `284` total 10s runs), verified `zoneActual === expectedZone` & `qualityActual === expectedQuality` (no Auto-Fallback triggered). |

> **Presentation Modes Measured:**
> 1. **Real Player VSync Mode (60 Hz D3D11 Compositor):** Standard Chrome launch flags (`--headless=new --enable-webgl --ignore-gpu-blocklist --use-gl=angle --use-angle=d3d11 --enable-precise-memory-info`). Measures real player-facing FPS capped at 60 Hz (`Avg`, `Min`, `1% Low`, `p50/p95/p99`) alongside CPU frame execution time (`ms`).
> 2. **Uncapped Throughput Headroom Mode:** Same GPU flags plus `--disable-frame-rate-limit --disable-gpu-vsync` to reveal raw CPU+WebGL headroom without 60 Hz VSync clamping (`84.50 FPS` BEFORE → `173.45 FPS` AFTER).

---

## 2. Profiler Root-Cause Diagnosis (§5)

Deep frame-timing and WebGL call instrumentation on production `dist/` (`Bellhollow`, `Outer Woods`, `Silent Mire`, `Deep Forest / Hooded Knight`) revealed that **~92% of total frame time resided in WebGL render cost (`10.5–14.2 ms/frame`)**, while simulation `update()` steps took `< 0.9 ms/frame`:

1. **Confirmed Bottleneck #1 — `UIScene` & `QuickCraftSidebar` Per-Frame Static `Graphics` Pipeline Flushing (`5.0–7.4 ms/frame`, `~65` UI Draw Calls/frame):**
   - `UIScene` (`quickSlotContainer`, `verticalTaskbarContainer`, HUD badges/cards) and `QuickCraftSidebar` nested **~40+ static rounded-rectangle `Phaser.GameObjects.Graphics` objects** inside UI `Container`s interleaved with `Image` and `Text` children.
   - In Phaser 3 WebGL, every `Graphics` object inside a `Container` breaks `MultiPipeline` sprite batching, forces polygon triangulation/stroke upload every frame, and emits ~52 extra WebGL draw calls solely for static frames, dividers, connectors, and slots.
   - Additionally, `UIScene.updatePanicVignette` cleared and redrew all 32 edge/corner triangles (`Classic Sanity 2.1`) every frame even when `lightMotionEnabled = false` and panic parameters had not changed.
2. **Confirmed Bottleneck #2 — `GameScene` Unculled World Resource `Container`s, Shared-Shadow Batch Breaks & Per-Frame `1,195`-Object `depthSort()` (`4.0–6.5 ms/frame`, `~140+` World Draw Calls/frame):**
   - `InventorySystem.createNodeVisual()` spawned ~45 resource node `Container`s (`[Graphics baseGfx, Image icon]`) with infinite bob tweens across all zones without registering them for camera culling, keeping off-screen `Container`+`Graphics` nodes rendering and ticking across the whole map.
   - `BlackKnightPlayer.syncFootShadow()` and `BlackKnightPlayer.updateLanternVisual()` called `setDepth()` unconditionally every frame (marking `displayList.sortChildrenFlag = true` across ~1,195 scene objects) and called `lanternOverlayGfx.clear()` + 3 concentric `fillCircle()` draws every frame instead of using a cached radial texture `Image`.

---

## 3. Targeted Optimizations Implemented (2 Bottlenecks Cap Respected — §6)

### Fix 1 — `UIScene` & `QuickCraftSidebar` Cached Texture Baking & Dirty Checking
- **Files:** [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts), [QuickCraftSidebar.ts](file:///g:/HOLLOW%20WOODS/src/ui/QuickCraftSidebar.ts)
- Replaced static UI panel/slot/button/divider `Graphics` inside `quickSlotContainer`, `verticalTaskbarContainer`, `QuickCraftSidebar.container`, and top-level HUD panels (`statCardBg`, `questBg`, `zoneBadgeBg`, `timeWidgetBg`, `timeClockDialImg`, `lanternStatusBg`, `moistureBadgeBg`, `temperatureBadgeBg`, `slotHighlightImg`, `taskbarLanternGlow`, `readyDot`) with pre-baked `NEAREST`-filtered `Phaser.GameObjects.Image` textures generated once via `generateTexture(...)` and existing `HUDIconGenerator.generateUIFrameTextures(...)` keys (`UI_TEX_QC_SLOT_IDLE` / `READY` / `HOVER`).
- Preserved exact pixel geometry, colors, rounded borders, bronze rivets, and hover/active/equipped visual states; removed dead `statIconsGraphics`; added state-signature dirty checking to `UIScene.updatePanicVignette` (preserving Classic Sanity 2.1 `0x280712` / `0x18030b` / `0x0a0105` triangles and smooth `0.0022` phase identically).

### Fix 2 — `InventorySystem` World Node Culling + Cached Shadows & `BlackKnightPlayer` Lantern/DepthSort Guard
- **Files:** [InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts), [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts), [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts)
- Replaced per-node `baseGfx` (`Graphics.fillEllipse`) inside `InventorySystem` resource containers with shared cached shadow texture `hw_world_node_shadow_v1` (`Image`), tracked `bobTween`, and added `InventorySystem.updateCameraCulling(camera, margin)` hooked into `GameScene.create()` and `GameScene.updateEntityCameraCulling()` (culling off-screen resource containers, pausing off-screen tweens, and keeping depleted nodes hidden).
- Replaced `BlackKnightPlayer.lanternOverlayGfx` per-frame `clear()` + 3 `fillCircle()` redraws with cached `132×132` radial texture `hw_lantern_aura_soft_v1` (`lanternOverlayImg`) modulated by smooth sinusoidal alpha, and guarded `setDepth()` in `syncFootShadow()` and `updateLanternVisual()` so stationary depth never queues redundant scene sorts.

*(All original files prior to edits were backed up in `Backups/steps/backup_hw_h4_06/`.)*

---

## 4. Before / After Benchmark Results (§3 & §4)

### 4.1 Executive Summary (Across All 4 Zones × 2 Qualities × Sanity 100/11/0)

| Suite (`24` scenarios = `48` runs Before + `48` runs After each) | Metric | BEFORE | AFTER | Improvement |
| --- | --- | --- | --- | --- |
| **VSync 60 Hz (Player Default Mode)** | Avg FPS | `58.33 FPS` | **`59.90 FPS`** | Locks cleanly at 60 Hz (`+1.57 FPS`) |
| **VSync 60 Hz (Player Default Mode)** | 1% Low FPS | `30.27 FPS` | **`41.87 FPS`** | **`+38.3%`** smoother frame pacing |
| **VSync 60 Hz (Player Default Mode)** | Avg CPU Frame Time | `12.08 ms` | **`6.37 ms`** | **`-47.3%`** (`-5.71 ms`) |
| **VSync 60 Hz (Player Default Mode)** | `UIScene` Render CPU | `5.82 ms` | **`0.57 ms`** | **`-90.2%`** (`-5.25 ms`) |
| **VSync 60 Hz (Player Default Mode)** | WebGL Draw Calls/frame | `199.7` | **`92.6`** | **`-53.6%`** (`-107.1` calls) |
| **Uncapped D3D11 GPU+CPU Headroom** | Avg FPS | `84.50 FPS` | **`173.45 FPS`** | **`+105.3%` (`2.05×` throughput)** |
| **Uncapped D3D11 GPU+CPU Headroom** | 1% Low FPS | `43.77 FPS` | **`88.86 FPS`** | **`+103.0%` (`2.03×` 1% Low)** |
| **Uncapped D3D11 GPU+CPU Headroom** | Avg CPU Frame Time | `11.65 ms` | **`5.59 ms`** | **`-52.0%`** (`-6.06 ms`) |
| **Uncapped D3D11 GPU+CPU Headroom** | `UIScene` Render CPU | `6.00 ms` | **`0.58 ms`** | **`-90.3%`** (`-5.42 ms`) |
| **Uncapped D3D11 GPU+CPU Headroom** | WebGL Draw Calls/frame | `200.5` | **`92.1`** | **`-54.1%`** (`-108.4` calls) |

---

### 4.2 Production VSync Baseline vs After (`F9 OFF`, `1280×720`, Real GTX 1070 Ti D3D11)

Note on coordinates: `Hooded Knight (Deep Forest)` spawns at `deep_forest` (`x: 2080, y: -80` player spawn; `WildlifeSystem` spawns active `HoodedKnightBoss` at `(1300, 260)` + 2 `FallenKnightEntity` escorts).

| Zone | Quality | Sanity | Lantern | Avg FPS (B → A, ±sd) | Min FPS (B → A) | 1% Low (B → A) | p50 / p95 / p99 ms (B → A) | CPU ms (B → A) | GS / UI ms (B → A) | Draws (B → A) | Gfx Vis/Tot (B → A) | Tw / Lis / Tex / RT (A) | Heap MB (B → A) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bellhollow | HIGH | 100 | ON | `56.08±0.01` → **`59.56±0.37`** | `28.55→23.95` | `31.07→30.43` | `17.9/22.6/28.2` → **`16.7/17.6/25.2`** | `13.00→8.27` | `6.34/5.79` → **`6.43/0.70`** | `206.1→92.8` | `155/335 → 80/259` | `133/176/529/1` | `260.8→250.7` |
| Bellhollow | HIGH | 11 | ON | `56.08±0.16` → **`59.61±0.12`** | `30.34→24.27` | `33.49→28.27` | `17.9/22.6/26.9` → **`16.7/17.1/28.4`** | `13.46→8.16` | `6.79/5.85` → **`6.39/0.66`** | `206.7→94.3` | `155/335 → 80/259` | `133/176/529/1` | `276.7→262.1` |
| Bellhollow | HIGH | 0 | OFF | `56.02±0.10` → **`59.55±0.63`** | `29.68→31.22` | `32.62→34.49` | `18.0/22.6/28.6` → **`16.7/17.2/29.5`** | `12.99→7.71` | `6.42/5.74` → **`6.06/0.58`** | `204.9→92.7` | `156/335 → 81/259` | `133/176/529/1` | `263.5→259.3` |
| Bellhollow | MEDIUM | 100 | ON | `56.08±0.01` → **`59.88±0.06`** | `34.08→31.30` | `36.09→34.14` | `18.0/21.6/24.4` → **`16.7/17.1/25.3`** | `12.43→7.61` | `6.05/5.51` → **`5.93/0.61`** | `205.1→92.0` | `155/335 → 80/259` | `133/176/529/1` | `266.5→243.8` |
| Bellhollow | MEDIUM | 11 | ON | `56.11±0.13` → **`59.84±0.28`** | `30.98→30.59` | `36.58→40.25` | `17.9/21.6/25.1` → **`16.7/16.9/19.9`** | `12.68→7.11` | `6.23/5.63` → **`5.58/0.57`** | `206.0→93.5` | `155/335 → 80/259` | `132/176/529/1` | `267.9→250.3` |
| Bellhollow | MEDIUM | 0 | OFF | `56.22±0.12` → **`59.75±0.35`** | `34.13→32.10` | `37.23→35.24` | `17.9/21.8/24.1` → **`16.7/17.1/26.8`** | `12.41→7.24` | `6.14/5.44` → **`5.76/0.56`** | `205.1→91.7` | `156/335 → 81/259` | `132/176/529/1` | `268.8→249.4` |
| Outer Woods | HIGH | 100 | ON | `59.44±0.86` → **`59.94±0.01`** | `19.91→28.38` | `29.07→39.56` | `16.7/19.0/27.1` → **`16.7/16.9/20.2`** | `11.90→6.24` | `5.01/5.79` → **`4.53/0.59`** | `212.2→102.0` | `145/346 → 72/270` | `132/176/529/1` | `257.9→246.0` |
| Outer Woods | HIGH | 11 | ON | `59.77±0.21` → **`60.02±0.01`** | `24.19→35.87` | `32.27→45.01` | `16.7/17.1/23.9` → **`16.7/16.9/17.8`** | `11.05→5.92` | `4.73/5.32` → **`4.32/0.55`** | `217.4→106.4` | `148/349 → 76/273` | `134/176/529/1` | `263.3→262.3` |
| Outer Woods | HIGH | 0 | OFF | `60.04±0.01` → **`60.01±0.03`** | `39.42→36.72` | `47.33→44.39` | `16.7/16.9/18.3` → **`16.7/16.9/20.0`** | `10.64→6.35` | `4.64/5.06` → **`4.74/0.56`** | `220.4→110.0` | `153/351 → 80/275` | `134/176/530/1` | `257.4→264.6` |
| Outer Woods | MEDIUM | 100 | ON | `59.52±0.28` → **`59.92±0.13`** | `27.05→38.57` | `33.07→42.80` | `16.7/19.0/25.6` → **`16.7/17.0/20.9`** | `11.54→5.98` | `4.86/5.66` → **`4.42/0.60`** | `211.1→100.0` | `144/346 → 72/270` | `132/176/529/1` | `261.5→264.6` |
| Outer Woods | MEDIUM | 11 | ON | `56.16±1.28` → **`59.80±0.16`** | `17.48→28.41` | `21.56→31.57` | `16.8/23.6/35.2` → **`16.7/17.1/25.8`** | `15.25→7.34` | `6.52/7.41` → **`5.36/0.70`** | `213.2→103.9` | `147/349 → 76/273` | `134/176/529/1` | `265.4→263.2` |
| Outer Woods | MEDIUM | 0 | OFF | `59.42±0.57` → **`60.02±0.01`** | `18.19→40.09` | `28.96→48.33` | `16.7/18.3/26.1` → **`16.7/16.9/19.0`** | `11.69→6.19` | `5.17/5.43` → **`4.62/0.56`** | `214.1→107.2` | `152/351 → 81/275` | `134/176/530/1` | `269.2→250.3` |
| Silent Mire | HIGH | 100 | ON | `59.42±0.56` → **`60.01±0.03`** | `22.36→46.56` | `25.68→54.98` | `16.7/18.4/29.8` → **`16.7/16.9/17.2`** | `11.56→5.46` | `4.49/6.15` → **`3.94/0.59`** | `187.1→82.5` | `145/339 → 75/263` | `132/176/530/1` | `278.2→267.4` |
| Silent Mire | HIGH | 11 | ON | `57.92±0.67` → **`59.96±0.06`** | `19.69→34.67` | `21.32→41.28` | `16.7/21.9/41.4` → **`16.7/17.0/20.3`** | `13.19→5.97` | `5.33/6.75` → **`4.38/0.61`** | `191.2→89.7` | `148/342 → 80/267` | `133/176/530/1` | `273.7→273.2` |
| Silent Mire | HIGH | 0 | OFF | `59.05±0.18` → **`59.98±0.06`** | `19.46→33.50` | `22.00→41.97` | `16.7/19.1/32.4` → **`16.7/16.9/18.9`** | `12.03→5.90` | `4.93/6.07` → **`4.34/0.59`** | `191.1→88.4` | `151/344 → 81/268` | `134/176/532/1` | `270.5→260.2` |
| Silent Mire | MEDIUM | 100 | ON | `58.75±0.15` → **`59.91±0.11`** | `19.73→28.31` | `20.96→40.22` | `16.7/19.2/38.9` → **`16.7/16.9/18.2`** | `12.35→5.63` | `4.81/6.49` → **`4.07/0.63`** | `185.8→80.4` | `145/339 → 75/263` | `132/176/530/1` | `255.9→255.6` |
| Silent Mire | MEDIUM | 11 | ON | `58.58±1.15` → **`60.00±0.03`** | `18.10→34.14` | `22.16→42.18` | `16.7/20.4/35.4` → **`16.7/17.0/19.6`** | `12.63→5.97` | `5.03/6.51` → **`4.31/0.62`** | `190.9→84.5` | `149/343 → 78/266` | `134/176/530/1` | `261.8→259.3` |
| Silent Mire | MEDIUM | 0 | OFF | `59.51±0.18` → **`59.96±0.10`** | `18.91→38.76` | `27.25→44.06` | `16.7/16.9/26.9` → **`16.7/16.9/21.3`** | `10.62→5.91` | `4.28/5.44` → **`4.33/0.58`** | `190.4→86.7` | `151/344 → 81/268` | `134/176/532/1` | `260.0→256.4` |
| Hooded Knight (Deep Forest) | HIGH | 100 | ON | `58.82±1.46` → **`59.96±0.11`** | `20.34→36.66` | `29.94→49.14` | `16.7/19.3/23.0` → **`16.7/16.9/17.6`** | `12.56→5.36` | `5.25/6.17` → **`4.09/0.44`** | `186.8→84.0` | `140/351 → 70/275` | `132/176/529/1` | `261.7→260.5` |
| Hooded Knight (Deep Forest) | HIGH | 11 | ON | `58.58±1.05` → **`60.02±0.04`** | `20.30→38.74` | `22.49→49.14` | `16.7/19.4/32.8` → **`16.7/16.8/17.4`** | `11.97→5.72` | `5.06/5.75` → **`4.30/0.45`** | `192.2→90.5` | `143/354 → 74/278` | `134/176/529/1` | `270.4→254.4` |
| Hooded Knight (Deep Forest) | HIGH | 0 | OFF | `59.96±0.07` → **`59.94±0.01`** | `31.59→33.12` | `39.83→38.51` | `16.7/16.9/20.4` → **`16.7/16.9/21.4`** | `10.79→6.26` | `4.70/5.05` → **`4.75/0.55`** | `191.7→95.7` | `151/356 → 81/280` | `134/176/530/1` | `268.1→252.9` |
| Hooded Knight (Deep Forest) | MEDIUM | 100 | ON | `59.63±0.40` → **`60.05±0.01`** | `22.50→49.07` | `29.82→52.39` | `16.7/16.9/21.8` → **`16.7/16.9/17.7`** | `10.14→4.84` | `3.98/5.20` → **`3.57/0.44`** | `185.1→80.2` | `140/351 → 70/275` | `132/176/529/1` | `270.2→256.8` |
| Hooded Knight (Deep Forest) | MEDIUM | 11 | ON | `59.08±1.19` → **`60.01±0.03`** | `20.69→43.05` | `30.85→47.46` | `16.7/18.8/22.6` → **`16.7/16.9/18.8`** | `11.93→5.55` | `4.85/5.99` → **`4.14/0.48`** | `189.0→85.3` | `144/355 → 73/278` | `134/176/529/1` | `281.2→254.6` |
| Hooded Knight (Deep Forest) | MEDIUM | 0 | OFF | `59.58±0.64` → **`60.01±0.01`** | `25.72→38.47` | `34.95→48.97` | `16.7/17.6/24.9` → **`16.7/16.9/18.2`** | `11.22→6.23` | `4.80/5.40` → **`4.67/0.48`** | `189.8→87.5` | `151/356 → 81/280` | `134/176/530/1` | `270.1→269.1` |

---

### 4.3 Uncapped Throughput Headroom (`--disable-frame-rate-limit --disable-gpu-vsync`, `F9 OFF`)

| Zone | Quality | Sanity | Lantern | Avg FPS (BEFORE → AFTER, ±sd) | 1% Low FPS (B → A) | p50 / p95 / p99 ms (B → A) | CPU ms (B → A) | UI ms (B → A) | Draws (B → A) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bellhollow | HIGH | 100 | ON | `83.84±1.20` → **`165.28±6.36`** | `50.71→95.59` | `11.6/14.8/17.4` → **`5.9/7.1/9.2`** | `11.68→5.83` | `5.49→0.53` | `206.1→93.0` |
| Bellhollow | HIGH | 11 | ON | `81.78±3.05` → **`170.06±1.03`** | `45.49→112.49` | `11.7/16.2/20.5` → **`5.8/6.5/7.5`** | `12.00→5.67` | `5.65→0.50` | `207.2→94.2` |
| Bellhollow | HIGH | 0 | OFF | `81.56±8.38` → **`162.59±4.77`** | `45.44→83.97` | `11.7/16.8/20.1` → **`5.8/8.1/10.4`** | `12.11→5.93` | `5.68→0.52` | `205.1→92.4` |
| Bellhollow | MEDIUM | 100 | ON | `87.14±0.13` → **`158.13±0.25`** | `53.16→92.49` | `11.3/12.8/17.0` → **`6.1/8.0/9.9`** | `11.25→6.10` | `5.32→0.58` | `205.2→91.8` |
| Bellhollow | MEDIUM | 11 | ON | `85.41±1.62` → **`154.25±1.61`** | `54.25→79.76` | `11.4/13.7/17.1` → **`6.2/8.3/11.0`** | `11.46→6.24` | `5.42→0.58` | `206.0→93.5` |
| Bellhollow | MEDIUM | 0 | OFF | `89.01±0.21` → **`146.64±4.83`** | `57.50→75.05` | `11.1/12.3/15.1` → **`6.3/10.5/12.6`** | `10.99→6.58` | `5.19→0.60` | `204.1→91.2` |
| Outer Woods | HIGH | 100 | ON | `84.97±4.17` → **`182.83±6.15`** | `45.83→85.30` | `11.2/16.2/19.9` → **`5.1/8.1/10.5`** | `11.53→5.24` | `6.02→0.58` | `212.4→102.0` |
| Outer Woods | HIGH | 11 | ON | `78.37±0.54` → **`170.94±6.89`** | `33.28→84.25` | `11.4/20.2/26.3` → **`5.5/8.5/10.6`** | `12.49→5.62` | `6.36→0.61` | `218.2→106.8` |
| Outer Woods | HIGH | 0 | OFF | `77.61±0.55` → **`137.74±12.39`** | `32.31→59.33` | `11.6/20.5/26.4` → **`6.7/11.4/13.9`** | `12.61→7.02` | `6.32→0.76` | `217.9→105.8` |
| Outer Woods | MEDIUM | 100 | ON | `82.72±0.72` → **`179.38±3.34`** | `36.81→102.62` | `11.2/18.4/24.2` → **`5.3/7.3/8.9`** | `11.83→5.34` | `6.17→0.62` | `211.0→100.9` |
| Outer Woods | MEDIUM | 11 | ON | `74.74±1.61` → **`173.82±3.11`** | `38.59→82.18` | `12.2/20.6/24.1` → **`5.5/8.0/10.3`** | `13.10→5.51` | `6.67→0.62` | `213.9→103.2` |
| Outer Woods | MEDIUM | 0 | OFF | `76.14±3.12` → **`158.91±6.90`** | `37.73→78.78` | `12.1/19.7/24.5` → **`5.8/9.3/11.4`** | `12.87→6.05` | `6.37→0.65` | `215.1→104.0` |
| Silent Mire | HIGH | 100 | ON | `98.56±0.33` → **`191.34±13.68`** | `54.35→86.67` | `9.8/12.7/15.9` → **`4.8/7.6/9.8`** | `9.86→5.00` | `5.67→0.64` | `186.3→82.8` |
| Silent Mire | HIGH | 11 | ON | `87.36±8.87` → **`188.07±4.09`** | `46.13→95.07` | `10.7/16.5/20.2` → **`5.0/7.4/9.7`** | `11.25→5.08` | `6.20→0.63` | `193.2→86.8` |
| Silent Mire | HIGH | 0 | OFF | `82.28±1.63` → **`189.43±7.69`** | `40.02→106.02` | `11.2/18.6/21.8` → **`5.0/7.2/8.8`** | `11.88→5.04` | `6.39→0.60` | `196.4→87.5` |
| Silent Mire | MEDIUM | 100 | ON | `83.91±7.87` → **`186.81±22.29`** | `41.80→84.49` | `11.1/17.3/21.9` → **`5.0/8.2/10.6`** | `11.70→5.14` | `6.56→0.65` | `185.1→81.1` |
| Silent Mire | MEDIUM | 11 | ON | `84.22±1.09` → **`161.65±6.31`** | `40.90→77.27` | `10.9/17.6/21.2` → **`5.7/9.8/11.6`** | `11.62→5.93` | `6.35→0.72` | `191.2→86.0` |
| Silent Mire | MEDIUM | 0 | OFF | `73.27±2.34` → **`160.91±4.94`** | `24.55→74.78` | `12.1/22.4/31.8` → **`5.6/9.7/11.8`** | `13.39→5.96` | `7.11→0.70` | `194.4→85.7` |
| Hooded Knight (Deep Forest) | HIGH | 100 | ON | `93.09±3.74` → **`179.31±15.32`** | `52.02→80.37` | `10.2/13.9/17.4` → **`5.2/8.3/10.3`** | `10.50→5.32` | `5.66→0.47` | `187.1→84.0` |
| Hooded Knight (Deep Forest) | HIGH | 11 | ON | `86.98±3.19` → **`192.66±9.76`** | `40.02→105.85` | `10.8/15.4/21.1` → **`4.9/7.0/8.7`** | `11.25→4.96` | `5.90→0.43` | `190.7→89.8` |
| Hooded Knight (Deep Forest) | HIGH | 0 | OFF | `81.63±2.87` → **`176.10±9.14`** | `36.17→88.05` | `11.3/18.5/23.9` → **`5.4/8.1/10.2`** | `12.00→5.44` | `5.96→0.43` | `194.7→90.1` |
| Hooded Knight (Deep Forest) | MEDIUM | 100 | ON | `95.16±5.31` → **`215.42±0.11`** | `49.73→117.16` | `9.9/14.8/18.9` → **`4.5/6.0/7.9`** | `10.28→4.42` | `5.76→0.45` | `185.1→81.2` |
| Hooded Knight (Deep Forest) | MEDIUM | 11 | ON | `93.80±1.25` → **`186.63±1.97`** | `50.66→85.30` | `10.2/14.0/17.5` → **`5.0/8.0/10.2`** | `10.41→5.12` | `5.65→0.50` | `189.9→87.5` |
| Hooded Knight (Deep Forest) | MEDIUM | 0 | OFF | `84.50±5.52` → **`173.82±15.90`** | `42.99→99.75` | `10.9/17.5/21.4` → **`5.5/8.2/9.7`** | `11.59→5.54` | `6.05→0.49` | `196.6→88.2` |

---

### 4.4 Isolated Variable Factorial (`Silent Mire`, VSync, Sanity `100 / 11 / 0` × Lantern `ON / OFF`)

| Quality | Sanity | Lantern | Avg FPS (B → A) | 1% Low (B → A) | CPU ms (B → A) | UI ms (B → A) | Draws (B → A) | FOW Redraws/10s (B → A) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HIGH | 100 | ON | `59.89 → 60.02` | `38.35 → 43.70` | `10.21 → 5.51` | `5.50 → 0.58` | `187.7 → 82.0` | `2 → 0` |
| HIGH | 100 | OFF | `60.03 → 60.03` | `47.77 → 45.41` | `9.26 → 5.26` | `5.00 → 0.54` | `187.7 → 81.3` | `95 → 93` |
| HIGH | 11 | ON | `59.55 → 59.72` | `34.12 → 34.59` | `10.58 → 6.36` | `5.52 → 0.64` | `193.2 → 87.5` | `60 → 62` |
| HIGH | 11 | OFF | `60.03 → 59.84` | `45.99 → 41.62` | `10.34 → 5.86` | `5.36 → 0.58` | `194.7 → 89.3` | `62 → 61` |
| HIGH | 0 | ON | `59.70 → 60.02` | `34.79 → 45.32` | `11.41 → 5.75` | `5.81 → 0.56` | `196.9 → 88.4` | `43 → 40` |
| HIGH | 0 | OFF | `59.89 → 60.01` | `40.47 → 43.02` | `10.35 → 6.03` | `5.43 → 0.61` | `196.6 → 87.8` | `54 → 47` |
| MEDIUM | 100 | ON | `60.02 → 60.03` | `42.99 → 47.02` | `9.38 → 5.25` | `5.18 → 0.57` | `185.3 → 79.8` | `0 → 0` |
| MEDIUM | 100 | OFF | `59.43 → 60.01` | `31.63 → 45.95` | `10.13 → 5.76` | `5.42 → 0.62` | `184.2 → 79.5` | `86 → 85` |
| MEDIUM | 11 | ON | `59.02 → 60.02` | `21.74 → 45.93` | `11.00 → 5.71` | `5.71 → 0.60` | `190.7 → 84.6` | `64 → 62` |
| MEDIUM | 11 | OFF | `59.64 → 59.99` | `30.33 → 45.56` | `10.92 → 5.25` | `5.57 → 0.54` | `192.3 → 85.3` | `64 → 60` |
| MEDIUM | 0 | ON | `59.73 → 59.85` | `31.47 → 38.53` | `10.50 → 6.31` | `5.39 → 0.63` | `191.9 → 88.0` | `38 → 42` |
| MEDIUM | 0 | OFF | `59.83 → 59.91` | `32.17 → 39.67` | `10.12 → 5.86` | `5.33 → 0.60` | `190.2 → 88.5` | `46 → 42` |

---

### 4.5 Continuous WASD Walking Stress (`HIGH`, `Sanity 11`, `Lantern ON`, FOW Re-Rendered ~465–520× / 10s)

| Zone | Avg FPS (B → A) | 1% Low FPS (B → A) | p50 / p95 / p99 ms (B → A) | CPU ms (B → A) | GS / UI ms (B → A) | Draws (B → A) | FOW Redraws (B → A) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bellhollow (Walking) | `59.61 → 59.97` | `33.61 → 42.39` | `16.7/17.9/22.9` → `16.7/16.9/19.3` | `12.39 → 6.70` | `6.02/5.22` → `5.23/0.43` | `210.2 → 92.6` | `465 → 468` |
| Silent Mire (Walking) | `60.08 → 59.92` | `47.27 → 40.24` | `16.7/16.8/17.1` → `16.7/16.9/21.2` | `9.14 → 5.64` | `3.43/5.00` → `4.10/0.56` | `188.2 → 84.0` | `512 → 506` |
| Hooded Knight (Walking) | `59.69 → 59.91` | `31.77 → 42.55` | `16.7/17.3/22.4` → `16.7/16.9/20.8` | `11.17 → 6.28` | `4.44/5.52` → `4.43/0.67` | `193.6 → 89.8` | `517 → 520` |

---

### 4.6 Separate F9 ON Debug Overlay Check (`Vite Dev Server`, `Sanity 11`, `Lantern ON`, `HitboxDebugInspector` active)

| Mode | Zone | Quality | Avg FPS (B → A) | 1% Low FPS (B → A) | p50 / p95 / p99 ms (B → A) | CPU ms (B → A) | UI ms (B → A) | Draws (B → A) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VSYNC | Bellhollow | HIGH | `58.69 → 59.73` | `29.09 → 32.27` | `16.7/19.2/31.1` → `16.7/16.9/22.0` | `13.06 → 7.47` | `5.84 → 0.57` | `206.6 → 93.3` |
| VSYNC | Bellhollow | MEDIUM | `58.05 → 59.97` | `29.94 → 48.59` | `16.7/23.9/38.0` → `16.7/16.9/18.4` | `13.82 → 6.74` | `6.09 → 0.56` | `205.5 → 92.3` |
| VSYNC | Silent Mire | HIGH | `58.92 → 59.87` | `30.92 → 42.97` | `16.7/20.4/29.4` → `16.7/16.9/19.9` | `11.52 → 6.00` | `5.88 → 0.65` | `188.6 → 84.8` |
| VSYNC | Silent Mire | MEDIUM | `59.89 → 60.01` | `37.56 → 49.86` | `16.7/17.6/21.1` → `16.7/16.9/17.4` | `10.64 → 5.49` | `5.66 → 0.59` | `188.3 → 83.6` |
| UNCAPPED | Bellhollow | HIGH | `85.44 → 161.92` | `48.17 → 90.92` | `11.2/15.2/19.1` → `6.0/7.8/10.1` | `11.48 → 5.96` | `5.42 → 0.53` | `206.8 → 93.5` |
| UNCAPPED | Bellhollow | MEDIUM | `83.81 → 170.22` | `47.66 → 90.87` | `11.4/15.4/19.1` → `5.7/6.8/9.1` | `11.68 → 5.63` | `5.54 → 0.50` | `205.8 → 92.5` |
| UNCAPPED | Silent Mire | HIGH | `100.03 → 198.36` | `51.73 → 103.66` | `9.7/12.3/15.6` → `4.8/7.1/8.8` | `9.72 → 4.85` | `5.53 → 0.61` | `190.1 → 85.2` |
| UNCAPPED | Silent Mire | MEDIUM | `104.62 → 219.51` | `73.55 → 114.32` | `9.4/10.4/11.7` → `4.5/5.3/7.0` | `9.32 → 4.32` | `5.29 → 0.52` | `187.5 → 83.3` |

---

## 5. Visual Parity, Memory & Hardware CPU/GPU Telemetry

- Before / After comparison PNGs preserved at [Visuals/HW-H4-06](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-06) (`56` PNG files across `bellhollow`, `outer_woods`, `silent_mire`, `hooded_knight`, `HIGH`/`MEDIUM`, `Sanity 100/11/0`, `Lantern ON/OFF`, and `F9 ON`):
  - Visual inspection confirmed **0 visual degradation**: HUD panels, borders, rivets, hotbar highlight, vertical taskbar, quick-craft slots & ready dots, Classic Sanity 2.1 3-layer corner vignette (`0x280712` / `0x18030b` / `0x0a0105`), Veil fog layers, fireflies, and Vòng Sáng Hộ Tâm glow match identically.
- **CPU / GPU & Memory Summary:**
  - **CPU Frame Execution Time (`24`-scenario mean):** `12.08 ms -> 6.37 ms` (`-47.3%`) under 60 Hz VSync; `11.65 ms -> 5.59 ms` (`-52.0%`) Uncapped, with `UIScene` render time reduced by **`90.2%`** (`5.82 ms -> 0.57 ms`).
  - **GPU / WebGL Render Workloads:** Measured directly via `NVIDIA GeForce GTX 1070 Ti` D3D11 ANGLE throughput (`84.50 -> 173.45 FPS`, `2.05×`) and per-frame WebGL draw calls (`199.7 -> 92.6`, **`-53.6%`**). *(Standard WebGL in Chromium does not expose `EXT_disjoint_timer_query` raw GPU shader microseconds without privileged flags, so GPU cost is captured via draw-call batching reduction and Uncapped D3D11 frame throughput.)*
  - **JS Heap & Phaser Resource Counters:**
    - JS Heap (`VSync 4Z`): `255.9–281.2 MB` BEFORE → `243.8–273.2 MB` AFTER (stable/slightly lower heap across all zones).
    - Active/Total `Graphics` objects: **`~140–156 / ~335–356` BEFORE → `~70–81 / ~259–280` AFTER** (`-75` persistent `Graphics` eliminated).
    - `Textures`: **`501 → 529–532`** (`+28` lightweight pre-baked cached UI/shadow/lantern textures, eliminating per-frame geometry tessellation).
    - `RenderTextures`: **`1 → 1`** (unchanged `fogOfWarLayer`), `Tweens`: **`~132–134 → ~132–134`**, `Listeners`: **`176 → 176`** (zero leak).

---

## 6. Excluded Benchmark Runs & Root-Cause Disclosure (§4 & §8)

During the initial benchmark pass, **76 mismatched scenario rows (152 individual 10-second runs: `76` BEFORE + `76` AFTER)** had `zoneActual !== expectedZone` and were **strictly excluded** from all averages and official conclusions above:

1. **Initial VSync 4-Zones (`hw_h4_06_before_vsync_zones.json` lines `7–24` in `task-22591.log`; `hw_h4_06_after_vsync_zones.json` lines `7–24` in `task-22766.log`):** `18` BEFORE + `18` AFTER scenarios (`36 + 36 = 72` runs) intended for `outer_woods`, `silent_mire`, and `hooded_knight` all remained in `bellhollow` (`Draws ~205–207` BEFORE / `91.5–94.3` AFTER).
2. **Initial Uncapped 4-Zones (`hw_h4_06_before_uncapped.json` lines `7–24` in `task-22608.log`; `hw_h4_06_after_uncapped.json` lines `7–24` in `task-22775.log`):** `18` BEFORE + `18` AFTER scenarios (`36 + 36 = 72` runs) remained in `bellhollow`.
3. **Initial Walk Stress Rows (`hw_h4_06_before_vsync_factorial_walk.json` lines `13` & `15` in `task-22595.log`; `hw_h4_06_after_vsync_factorial_walk.json` lines `13` & `15` in `task-22770.log`):** `2` BEFORE + `2` AFTER walk scenarios (`4 + 4 = 8` runs: `WALK bellhollow` and `WALK hooded_knight`) had `zoneActual === 'silent_mire'` (`FOW=508–512`).
4. **Root Cause:** Reusing a browser context after playing or loading another zone caused `CloudSaveService.loadGameProgress()` to read `${LOCAL_PREFIX}slot_1` (`hollow_woods_save_slot_1`) ahead of `hollow_woods_v1_savegame`, overriding the `?zone=` query target and spawn position.
5. **Resolution & Clean Replacement:** All multi-zone runners were fixed to execute `localStorage.clear()` prior to seeding saves plus strict runtime assertion `zoneActual === expectedZone` (`deep_forest` at `(2080, -80)` for active `HoodedKnightBoss` scene), producing the clean replacement runs (`task-22812.log`, `task-22817.log`, `task-22824.log`, `task-22828.log`) used in §4 (`71` verified matched scenarios = `284` clean 10s runs).

---

## 7. Targeted Regression Verification (§6 & §7)

All checks below executed directly on the restored final `src/` and freshly rebuilt production `dist/` (`index-DXsbV141.js`):

| Check / Suite | Scope & Assertions | Result |
| --- | --- | --- |
| `npm run check` (`tsc --noEmit`) | Full TypeScript strict type-check across repository | **PASS** (`0` errors) |
| `npm run build` (`tsc && vite build`) | Production bundle build (`index-DXsbV141.js`, SHA-256 `78047B9C1D302AC1525A1423EA650C26D8EA2027F00BF2CE7B418E8E68D18F05`) | **PASS** |
| `npm run verify:data` | Items, recipes, dialogues, quests, registry, lore JSON validation | **15 / 15 PASS** |
| `tests/hw_bug_21b_walk_run_verification.py` | 4-dir walk/sprint, Shift release, key repeat, blur/IME, Pause ESC, Armed/Unarmed, Outer Woods, combat (`task-22840` & rerun `task-22907`) | **10 / 10 PASS** |
| `tests/hw_bug_26b_walkrun_fix_verification.py` | Shift 600ms watchdog, obstacle guardrail, unblocked sprint, combat action lock clearing, Save Schema 3 (`task-22907`) | **5 / 5 PASS** |
| **HUD, QuickCraft & Tooltips (`task-23012`)** | `quickSlotContainer`, `verticalTaskbarContainer`, `QuickCraftSidebar` (`ui_tex_qc_slot_*` baked textures); hotbar slot click selection (`0↔1`, highlight shift); tooltips for populated `ItemTooltipHelper`, empty hotbar/equip `bottomTooltipContainer`, taskbar `taskbarTooltipContainer`; QuickCraft hover flyout open/close, UI Craft click (`item_lantern_oil` `+1`), 4-slot scroll (`1/2 ↔ 2/2`); ESC Pause/Resume HUD visibility toggle | **PASS** |
| **`InventorySystem` Culling, Harvest & Respawn (`task-23012`)** | `37` resource nodes using baked `hw_world_node_shadow_v1` `Image` (0 per-node `Graphics`); Bellhollow shows `6`, culls `31` (`bobTween.paused=true`); transitions to Outer Woods (`9` visible, `bellhollow` culled) & Silent Mire (`4` visible, `bellhollow` culled); `checkHarvestNearby('node_wood_3')` hides depleted node cleanly across `updateCameraCulling()` and restores on respawn | **PASS** |
| **Y-Depth & Player Shadow (`task-23012`)** | Above Garth (`py=175, pDepth=175, sDepth=174 < npcDepth=205`) and below Garth (`py=235, pDepth=235, sDepth=234 > npcDepth=205`) | **PASS** |
| **Classic Sanity 2.1 (`task-23012`)** | `Sanity=100` inactive (`key=""`); `Sanity=11` with `lightMotion=false` holds `"1100_40_1_s"` with dirty-check (`1` `clear()` across 3 ticks); `lightMotion=true` animates cleanly (`3` `clear()`s); restoring `100` clears active vignette cleanly | **PASS** |
| **Vòng Sáng Hộ Tâm `[F]` (`task-23012`)** | `[F]` toggles `False → True → False`, syncing `lanternOverlayImg` (`hw_lantern_aura_soft_v1`), `lanternStatusBg` (`ui_hw_lantern_off_v1 ↔ ui_hw_lantern_lit_v1`), and `taskbarLanternGlow` | **PASS** |
| **Idle `160ms` & Scale Pop Consistency (`task-23012`)** | Armed (`wayfarer_idle_down`) & Unarmed (`wayfarer_unarmed_idle_down`) config `160ms/frame` (`6.25 FPS`); 3.2s live sample = `20` updates, `0` restarts, **`159.76 ms`** mean interval; `scaleY`: Idle `1.50`, Walk `1.50`, Run `1.20` | **PASS** |
| **Console / Page Errors (`task-23012`)** | Production `dist/` runtime log monitor | **0 console / 0 page errors** |

---

## 8. Source Restore, SHA-256 Verification & Preserved Evidence

- **Restored `HW-H4-06` Modified Source Files (Current Final `src/` SHA-256 & Line Delta vs `Backups/steps/backup_hw_h4_06/`):**
  - [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts): SHA-256 `5432C59DD06FEFB7372E418AE06B962107370F1F1F18E0AF974D9E326C374094` (`171,140` bytes, `+376 / -352` vs BEFORE backup)
  - [QuickCraftSidebar.ts](file:///g:/HOLLOW%20WOODS/src/ui/QuickCraftSidebar.ts): SHA-256 `F4F703226673F8402D9E4C0E4C514474DD6287E827239CD7F9C8983952D1AC8C` (`30,313` bytes, `+104 / -77` vs BEFORE backup)
  - [InventorySystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/InventorySystem.ts): SHA-256 `33EF27A0B168F5139E3B6A4148F39B304495C9F9029A3DF77058C336D2CCAF92` (`17,290` bytes, `+66 / -8` vs BEFORE backup)
  - [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts): SHA-256 `FA1B9ADFFC27FE16E273F5B7E186D8ACB0ECCEB4313EED0A73D6BE4E593A4C77` (`325,253` bytes, `+6 / -0` vs BEFORE backup)
  - [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts): SHA-256 `2FF9375C3F7D4D7AF30610D2FD90046FDF836CF28E70EB559DA9F6A454785AF0` (`99,416` bytes, `+43 / -28` vs BEFORE backup)
- **Production Bundle SHA-256 Verified Across Both Restored Build (`task-22828`) & Clean Rebuild (`task-22894`):**
  - `dist/assets/index-DXsbV141.js`: `78047B9C1D302AC1525A1423EA650C26D8EA2027F00BF2CE7B418E8E68D18F05` (`1,206,278` bytes)
  - `dist/assets/game-data-DB3Gx1Mn.js`: `F107FB292E24590FD44EC57CE823C7D70757EFB8861A9162F66BC5B63B4A989F` (`189,627` bytes)
  - `dist/assets/vendor-phaser-CUeKjumc.js`: `281440CB845162A5F064045A952B82F7C7B4EAC2E3877EA8DF7643AB76650EE5` (`1,685,164` bytes)
- **Transparency Note on Automated Cleanup:**
  - `Backups/steps/after_hw_h4_06/` was automatically removed by the `finally` block in `task-22828` immediately after restoring `src/` and rebuilding `dist/`, so direct file-to-file SHA-256 comparison against that temporary directory cannot be re-executed post-cleanup; instead, identical byte-for-byte bundle output (`index-DXsbV141.js`, SHA-256 `78047B9C...`) verifies source equivalence with the AFTER benchmark build.
  - Raw JSON files previously written under `scripts/temp/` were deleted during temporary folder cleanup (`TEMP_FILE_COUNT=0`), while all raw benchmark task stdout logs, aggregated tables, regression logs, and `56` comparison PNGs are permanently archived in-repo at [Evidence/HW-H4-06](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-06) and [Visuals/HW-H4-06](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-06).
- **Pre-existing uncommitted repository changes preserved untouched:** [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json), [EndingSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/EndingSystem.ts), [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts), [WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts), existing reports/manifests. Zero `git commit`, zero `git push`.
