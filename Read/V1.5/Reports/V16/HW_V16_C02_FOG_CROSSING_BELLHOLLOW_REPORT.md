# HW-V16-C02 — FOG CROSSING & BELLHOLLOW REMASTERED

- **Project:** HOLLOW WOODS
- **Roadmap Track:** 3.1 (`HW-V16-C02`)
- **Dependency Verified:** `C01` (`77e532f25b6f6723ec0624ce84e0977304f0ec86`, `fix/v1.6-c01-collision`)
- **Worktree / Branch:** `G:\HOLLOW_WOODS_C02` (`feat/v1.6-c02-fog-bellhollow`)
- **Bug Fixed:** `W20-BUG-002` (Bellhollow central E-W road blockage + misplaced stone plaza decals)
- **Status:** COMPLETED — Ready for Owner Visual Inspection

---

## 1. Asset Provenance & License Verification

All new runtime tileset and split tree/prop sprites staged for `fog_crossing` and `bellhollow` originate from verified packs documented in [`HW_ASSET_03_NEW_LIBRARY_AND_RESURRECTED_REPORT.md`](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_ASSET_03_NEW_LIBRARY_AND_RESURRECTED_REPORT.md) and [`HW_ASSET_LICENSE_REPORT.md`](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_ASSET_LICENSE_REPORT.md):

| Staged File (`public/assets/environment/remastered/`) | Source Pack | License | Size | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| [`resurrected_grass.png`](file:///G:/HOLLOW_WOODS_C02/public/assets/environment/remastered/resurrected_grass.png) | `Resurrected_RPG` (`Grass.png`) | Commercial License (`Immunity`) | `1024x512` (19.6 KB) | Texturized `32x32` forest grass base tiles (`cols 10..13, rows 0..1`) baked into `fog_crossing` & `bellhollow` terrain canvases |
| [`resurrected_dirt_path.png`](file:///G:/HOLLOW_WOODS_C02/public/assets/environment/remastered/resurrected_dirt_path.png) | `Resurrected_RPG` (curated from `LAB-01`) | Commercial License (`Immunity`) | `128x128` (3.4 KB) | Seamless dirt center tile `(96, 96, 32, 32)` blended into dirt trails |
| [`resurrected_props_atlas.png`](file:///G:/HOLLOW_WOODS_C02/public/assets/environment/remastered/resurrected_props_atlas.png) + [`resurrected_props_atlas.json`](file:///G:/HOLLOW_WOODS_C02/public/assets/environment/remastered/resurrected_props_atlas.json) | `Resurrected_RPG` (`LAB-01` packed atlas, 58 frames) | Commercial License (`Immunity`) | `1024x1024` (117.6 KB + 21.4 KB) | Split `Tree_Trunks` + `Tree_Canopies`, shadows, mossy boulders, stumps, rune monolith, & moss bushes |

All existing V1.5 Bellhollow medieval architecture assets (`house_elder_edda.png`, `house_herbalist_neris.png`, `smithy_workshop_bram.png`, `gatehouse_garth.png`, `bell_tower_grand.png`, `village_well_detailed.png`) and NPC sprites remain unchanged and verified via `verify_v15_10_bellhollow_buildings.mjs`.

---

## 2. Implemented Changes

### A. Asset Keys & Loading ([`Constants.ts`](file:///G:/HOLLOW_WOODS_C02/src/config/Constants.ts), [`PreloadScene.ts`](file:///G:/HOLLOW_WOODS_C02/src/scenes/PreloadScene.ts))
- Exported `ATLAS_RESURRECTED_PROPS`, `TILE_RESURRECTED_GRASS`, and `TILE_RESURRECTED_DIRT_PATH`.
- Preloaded `resurrected_props_atlas` (`atlas`), `resurrected_grass`, and `resurrected_dirt_path` (`image`) under `public/assets/environment/remastered/`, verified `216/216` zero-404 asset audit.

### B. `fog_crossing` Remaster ([`WorldBuilder.ts`](file:///G:/HOLLOW_WOODS_C02/src/world/WorldBuilder.ts))
- **`renderFogCrossingTerrain`**: Replaced the flat olive noise floor and coarse trail fill with tiled `Resurrected_RPG` grass variations (`cols 10..13, rows 0..1`) glazed with a moody forest vignette, `TILE_RESURRECTED_DIRT_PATH` center fill (`96, 96, 32, 32`), and rounded moss-edged stone threshold pavers at `x = 452..515`. Preserved trail alignment (`y = 184` -> `y = 232` at `x = 480`) into Bellhollow.
- **Props & Split Tree Layering (`LAB-01` pattern)**: Added `placeResurrectedSplitTree` (ground shadow -> `Tree_Trunks` at `depth = Math.round(y)` -> `Tree_Canopies` at `depth = Math.round(y) + 0.5` registered in `treeCanopyGroup` for player-behind fade, **0 canopy colliders**) and `placeResurrectedProp`.
- Replaced rotated red-tree placeholder visuals in `fog_crossing` (`createFallenLog(220, 130)` and west barrier `trunkLog`) with `stump_moss_2`, `rock_moss_cluster_1`, `rock_moss_outcrop_1`, `monolith_rune`, and `bush_moss_*`, while keeping `fog_crossing` spawn `(120, 195)`, Act 0 Echo/telegraph progression, and clear central trail `y = 180..255`.

### C. `bellhollow` Remaster & `W20-BUG-002` Fix ([`WorldBuilder.ts`](file:///G:/HOLLOW_WOODS_C02/src/world/WorldBuilder.ts), [`zones.json`](file:///G:/HOLLOW_WOODS_C02/src/data/zones.json))
- **`W20-BUG-002` Main Avenue Clearance**: Relocated all three central road blockers out of the `y = 238..298` main east-west thoroughfare into a cohesive **South Courtyard Sanctuary Wing** and **North Plaza Perimeter**:
  - `camp_shelter_tent`: `(778, 261)` -> **`(798, 378)`** (`zones.json` + `WorldBuilder.createSanctuaryCampHub`)
  - `camp_storage_chest`: `(775, 295)` -> **`(856, 376)`** (`zones.json` + `WorldBuilder.createSanctuaryCampHub`)
  - `createVillageLanternPost`: `(780, 250)` -> **`(772, 218)`** (`WorldBuilder.renderDecorations`)
  - Updated [`test_hw_bug06_interaction_anchors.py`](file:///G:/HOLLOW_WOODS_C02/scripts/test_hw_bug06_interaction_anchors.py) TC1 anchor assertions to `(856, 376)` and `(798, 378)`.
- **Misplaced Plaza Decals Removed**: Relocated glowing mushrooms (`(712, 326)`, `(816, 346)`) and swamp puddle (`(688, 318)`) off the central cobblestone plaza bricks onto shaded peripheral grass (`(504, 128)`, `(598, 368)`, `(1048, 462)`, `(1396, 514)`) and the eastern muddy drainage border (`(1310, 526)`, `(1475, 332)`).
- **`renderBellhollowTerrain` & Forest Rim**: Integrated `TILE_RESURRECTED_GRASS` meadow floor, `TILE_RESURRECTED_DIRT_PATH` organic dirt trails, soft rounded path stepping stones, and split Trunk+Canopy trees along the outer northern/eastern woodland borders (`createBellhollowVegetation`) while leaving `villageInteriorTrees` empty and NPC positions untouched.

### D. Collider Mapping Summary
- Preserved total zone/boundary colliders (`310 -> 311` net across loaded immediate world due to `fog_crossing` stump/rock/monolith foot boxes `(16x10..22x10)` replacing the single old `18x10` log collider).
- Split trees in `fog_crossing` and Bellhollow outer rim use **0 canopy colliders** (`withCollider: false` behind boundary fences, or `18x10` trunk-base collider only).
- Relocated colliders in Bellhollow:
  - `Lều Trú Ẩn`: `(778, 263, 38x16)` -> **`(798, 380, 38x16)`**
  - `Rương Gỗ Đai Đồng`: `(775, 297, 26x14)` -> **`(856, 378, 26x14)`**
  - `Cột Đèn Lồng`: `(780, 249, 10x8)` -> **`(772, 217, 10x8)`**

---

## 3. Verification, Performance & Parity Results

### Build & Automated Test Suites (After Final Edit)
- `npm run check` (`tsc --noEmit`): **PASS** (`0` errors)
- `npm run verify:data`: **PASS** (`15/15` checks)
- `npm run build`: **PASS** (`vite build` succeeded in `11.43s`)
- `node scripts/verify_v15_10_bellhollow_buildings.mjs`: **PASS**
- `node scripts/test_v15_61_pixel_art_trees_and_village_clean.mjs`: **PASS**
- `node scripts/verify_zero_404_assets.mjs`: **PASS** (`216/216` valid, `0` HTTP 404)
- `python scripts/test_hw_bug06_interaction_anchors.py`: **PASS** (`5/5` test cases including Save/Continue persistence & updated `(856, 376)` / `(798, 378)` anchors, `0` console errors)
- Legacy script notes (pre-existing V15-61/atlas baseline diffs, untouched by C02): `verify_v15_11_foliage_and_terrain.mjs` fails only on pre-existing raw tree PNG size expectations (`70x98` vs `112x160`), and `verify_v15_12_pickups_and_props.mjs` fails only on 4 pickup keys resolved via `hollow_props_atlas` (`AtlasTextureResolver`). All C02-touched constants/methods in both pass.

### Runtime Playwright Verification (`HIGH`/`MEDIUM`, `DAY`/`NIGHT`, `Sanity 100/11/0`, WASD Traversal)
Executed via `c02_verify.py` in headless Chromium + SwiftShader (`zoom = 2.2`, `1280x720`):
- **Errors:** `0` console errors, `0` pageerrors, `0` HTTP `>=400`.
- **WASD Traversal (`fog_crossing` -> `bellhollow`):** Walked East from `(420, 232)` smoothly into `bellhollow` (`x: 539, y: 232`, `zone: "bellhollow"`).
- **W20-BUG-002 Main Road Straight Traversal (`y = 265`):**
  - BEFORE (starting at `(680, 265)`): deflected North around tent/chest (`endX: 871, endY: 250`).
  - AFTER East (`(680, 265)` -> `[KeyD]`): `endX: 878, endY: 265`, **`straightZeroDeflection: true`**!
  - AFTER West (`[KeyA]` back): `endX: 710, endY: 265`, **`straightZeroDeflection: true`**!
- **Interactables & NPC Prompts Verified:**
  - `Garth`: `[E] Trò chuyện với Garth`
  - `Bà Lão Edda`: `[E] Trò chuyện với Bà Lão Edda`
  - `Neris`: `[E] Trò chuyện với Neris`
  - `Bram`: `[E] Trò chuyện với Bram`
  - `East Gate`: `[E] Kiểm tra Cổng Đông (Khóa chặt)`
  - `Tent` (`798, 392`): `[E] Nghỉ ngơi tại Lều Trú Ẩn`
  - `Chest` (`856, 392`): `[E] Mở Rương Trú Ẩn 12 Ô`
  - Crafting toggle `[C]` + `B01/B02` player artwork (`black_knight_movement`, `scaleX: 1.5, scaleY: 1.5`) verified intact.

### Performance Metrics (Before vs After, Headless SwiftShader `zoom = 2.2`)

| State (`c02_metrics_BEFORE.json` vs `c02_metrics_AFTER.json`) | Before FPS / FrameTime | After FPS / FrameTime | Before -> After Objects | Before -> After Textures | Before -> After Heap (MB) | Colliders |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `fog_crossing` DAY (`HIGH`) | `7.4` fps / `134.85` ms | `8.5` fps / `118.29` ms | `1176 -> 1224` | `529 -> 532` | `250.22 -> 250.21` | `310 -> 311` |
| `fog_crossing` NIGHT (`HIGH`) | `9.4` fps / `106.32` ms | `9.4` fps / `106.49` ms | `1176 -> 1224` | `529 -> 532` | `255.23 -> 251.13` | `310 -> 311` |
| `bellhollow` DAY (`HIGH`) | `11.3` fps / `88.54` ms | `12.6` fps / `79.62` ms | `1179 -> 1227` | `530 -> 533` | `252.46 -> 252.70` | `310 -> 311` |
| `bellhollow` NIGHT (`HIGH`) | `10.9` fps / `92.04` ms | `12.7` fps / `78.96` ms | `1179 -> 1227` | `530 -> 533` | `253.32 -> 253.94` | `310 -> 311` |
| `bellhollow` DAY (`MEDIUM`) | `10.9` fps / `91.36` ms | `10.6` fps / `94.76` ms | `1179 -> 1227` | `530 -> 533` | `252.93 -> 260.63` | `310 -> 311` |
| `bellhollow` Sanity `100` | `10.1` fps / `99.08` ms | `12.0` fps / `83.04` ms | `1179 -> 1227` | `530 -> 533` | `263.78 -> 253.37` | `310 -> 311` |
| `bellhollow` Sanity `11` (UI/tick `14`->`20`) | `10.8` fps / `92.85` ms | `11.3` fps / `88.34` ms | `1179 -> 1227` | `530 -> 533` | `263.85 -> 253.44` | `310 -> 311` |
| `bellhollow` Sanity `0` (UI/tick `3`->`8`) | `10.8` fps / `92.71` ms | `12.1` fps / `82.98` ms | `1179 -> 1227` | `530 -> 533` | `263.98 -> 257.04` | `310 -> 311` |

*(F9 WebGL draw calls in `BELLHOLLOW_COLLISION`: `81 -> 83`.)*

---

## 4. Before & After Visual Comparison

| View | Before (`77e532f`) | After (`HW-V16-C02`) |
| :--- | :--- | :--- |
| Fog Crossing Day | [`BEFORE_FOG_CROSSING_DAY.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_FOG_CROSSING_DAY.png) | [`AFTER_FOG_CROSSING_DAY.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_FOG_CROSSING_DAY.png) |
| Fog Crossing Night | [`BEFORE_FOG_CROSSING_NIGHT.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_FOG_CROSSING_NIGHT.png) | [`AFTER_FOG_CROSSING_NIGHT.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_FOG_CROSSING_NIGHT.png) |
| Fog Crossing Collision (`F9`) | [`BEFORE_FOG_CROSSING_COLLISION.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_FOG_CROSSING_COLLISION.png) | [`AFTER_FOG_CROSSING_COLLISION.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_FOG_CROSSING_COLLISION.png) |
| Bellhollow Overview | [`BEFORE_BELLHOLLOW_OVERVIEW.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_BELLHOLLOW_OVERVIEW.png) | [`AFTER_BELLHOLLOW_OVERVIEW.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_BELLHOLLOW_OVERVIEW.png) |
| Bellhollow Main Road | [`BEFORE_BELLHOLLOW_MAIN_ROAD.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_BELLHOLLOW_MAIN_ROAD.png) | [`AFTER_BELLHOLLOW_MAIN_ROAD.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_BELLHOLLOW_MAIN_ROAD.png) |
| Bellhollow Night | [`BEFORE_BELLHOLLOW_NIGHT.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_BELLHOLLOW_NIGHT.png) | [`AFTER_BELLHOLLOW_NIGHT.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_BELLHOLLOW_NIGHT.png) |
| Bellhollow Collision (`F9`) | [`BEFORE_BELLHOLLOW_COLLISION.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/BEFORE_BELLHOLLOW_COLLISION.png) | [`AFTER_BELLHOLLOW_COLLISION.png`](file:///G:/HOLLOW_WOODS_C02/Read/V1.5/Reports/Visuals/HW-V16-C02/AFTER_BELLHOLLOW_COLLISION.png) |

---

## 5. Git Checkpoint & Boundaries Preserved

- Touched **only** `fog_crossing` & `bellhollow` terrain/props/interactables — `outer_woods`, `sanctuary_farm`, Headless Warden, Ending, Quest topology, NPC identities, package version, and P2Game publish untouched.
- Note for Owner review: Relocation of `camp_shelter_tent`, `camp_storage_chest`, and north plaza lantern follows the approved `W20-BUG-002` fix; aesthetic composition in `fog_crossing` and `bellhollow` awaits final Owner visual sign-off (`PENDING OWNER APPROVAL` if further layout tweaks are desired).
