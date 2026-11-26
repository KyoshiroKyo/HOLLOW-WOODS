# HW-V16-B02 — BLACK KNIGHT V2 ARTWORK CONSISTENCY (`BUG-059`)

- **PROJECT:** HOLLOW WOODS
- **STUDIO:** KYOSHIRO STUDIO
- **TARGET:** V1.6.0 — THE UNBROKEN OATH
- **ROADMAP:** 3.1
- **TASK ID:** HW-V16-B02
- **BUG ID:** BUG-059
- **DEPENDENCY:** HW-V16-B01 (`ce88553ad2a2a5062e8234c2e36a62edfcce6371` — VERIFIED)
- **STATUS:** `PARTIAL — SOURCE ART ASSET GAP (RUNTIME FILTER HARDENED, B01 PRESERVED)`
- **BRANCH:** `fix/v1.6-b02-bug059-artwork`
- **WORKTREE:** `G:\HOLLOW_WOODS_B02` (isolated from primary `G:\HOLLOW WOODS` worktree holding uncommitted A07 changes)
- **BASE SHA:** `ce88553ad2a2a5062e8234c2e36a62edfcce6371`

---

## 1. ENTRY GATE & WORKTREE ISOLATION

- Verified `HW-V16-B01` checkpoint (`fix/v1.6-b01-bug058-scale` at `ce88553ad2a2a5062e8234c2e36a62edfcce6371`).
- Primary repository `G:\HOLLOW WOODS` (`feat/v1.5.3-ag-world-polish`) preserves uncommitted `HW-V16-A07` local edits untouched.
- Executed all `HW-V16-B02` analysis, hardening, build verification, and artifacts inside isolated worktree `G:\HOLLOW_WOODS_B02` on branch `fix/v1.6-b02-bug059-artwork`.
- Backup created prior to editing `src/scenes/PreloadScene.ts` at `Backups/steps/backup_hw_v16_b02/PreloadScene.ts` (excluded from git).

---

## 2. ROOT CAUSE VERIFICATION (ALL 12 CHECKS)

Full diagnostic audit across renderer configuration (`src/config/GameConfig.ts`, `src/utils/ScaleManager.ts`, `src/scenes/PreloadScene.ts`, `src/systems/GraphicsQualitySystem.ts`), live WebGL runtime telemetry, PNG binary forensics, and `Asset_Art/Meliodas_Blackwood/` (`01_LATEST_ARTWORK/`, `02_CURRENT_RUNTIME/`, `03_LEGACY_ARCHIVE/`, `HW_ART_REF_02_MELODIAS_LATEST_ASSET_ARCHIVE_REPORT.md`):

| Audit Dimension | Observed Result | Conclusion |
|---|---|---|
| Texture filtering / `NEAREST`/`LINEAR` | All 8 queried `black_knight_*` WebGL textures report `scaleMode: 1` (`Phaser.Textures.FilterMode.NEAREST`), `glTexture: true`. Hardened explicitly for all `10` atlases + portraits in `PreloadScene.ts`. | **Not a filter bug** |
| `PixelArt` / `antialias` / `roundPixels` | `GameConfig`: `pixelArt: true`, `antialias: false`, `roundPixels: true`, `type: Phaser.WEBGL` (`rendererType: 2`). | **Clean** |
| Texture override / Atlas generation | `AtlasTextureResolver` targets environment props (`atlas_props`), not `black_knight_*`. PNG files in `public/assets/characters/black_knight/` match `01_LATEST_ARTWORK` SHA-256 **10/10 identically** (`9/9` atlases + `black_knight_portrait.png`; JSON hashes differ only by formatting/CRLF). | **Already latest lossless PNGs** |
| Alpha channels | `softAlphaPct = 0.00%` across every frame of `black_knight_armed_idle`, `black_knight_movement`, `black_knight_conversion_motion`, `black_knight_core_combat`, `black_knight_defense`. | **Zero anti-aliased edge blur** |
| Camera / Graphics `HIGH` vs `MEDIUM` / `RenderTexture` | `camZoom = 2.2` fixed across states; `HIGH` (`1280×720` fog RT) vs `MEDIUM` (`640×360` fog RT) leaves player `scaleMode: 1` identical. `ScaleManager` sets `imageRendering = 'pixelated'` at `1280×720` (`auto` only when CSS scaling is fractional, affecting the full canvas equally). | **Not selective between Idle/Walk/Run** |
| **Source resolution & K1/K2/Conversion artwork differences** | **`K1` (`black_knight_armed_idle`) & `K2 V2` (`black_knight_movement`)** use `64×64` cells with **`29.5–32.0 px`** character height (`340–466` opaque texels) rendered at `scale = 1.50` (`0.67` source texels per world px). **`Conversion 34-Seq` (`black_knight_conversion_motion`)** uses `84×72` cells with **`39.0–46.5 px`** character height (**`647–908` opaque texels — `1.7×–2.3×` higher detail**, `~600–720` unique colors) rendered at `scale = 1.14 / 0.99 / 1.11` (`0.88–1.01` source texels per world px). | **PRIMARY ROOT CAUSE** |

### Why `BUG-059` Cannot Be Resolved by Code Alone Without Violating Art/Parity Constraints
1. **No Conversion-tier (`~40–46 px` / `84×72`) `Armed Idle`, `Unarmed Idle`, `Armed Walk`, or `Unarmed Walk` sprites exist** in `01_LATEST_ARTWORK/` (`Atlases_Latest/` or `Spritesheets_4Dir/`), `02_CURRENT_RUNTIME/`, or `03_LEGACY_ARCHIVE/`.
2. `K1` (`black_knight_armed_idle`, `0b16b7d4`) provides `armed_idle_{down,up,left}` at the same `~30 px` density as `K2 V2` (`black_knight_movement`, `5feed142`, which only supplies `armed_idle_right`, `walk`, and fallback `64×64` `run`).
3. Reverting `Run` from 12-frame `Conversion` (`black_knight_conversion_motion`) down to 6-frame `K2 V2` (`64×64`) would break V153 12-frame Source Parity, break existing `hw_bug_21b` / `hw_bug_26b` assertions (`armed_run_sequence`), and contradict Section 3 (*"Ưu tiên K2 V2 và Conversion mới nhất theo hành động"*) and Section 5 (*"Bảo toàn kết quả B01"*).
4. Upscaling/sharpening `K1`/`K2` Idle & Walk sprites or redrawing missing frames is explicitly prohibited by Sections 2 and 5. Therefore, per Section 5, `HW-V16-B02` enforces runtime `NEAREST` filtering cleanly and records **`PARTIAL`** with a formal Asset Request below.

---

## 3. IMPLEMENTED CHANGES & GUARDRAILS

- **`src/scenes/PreloadScene.ts`:** Explicitly enforced `Phaser.Textures.FilterMode.NEAREST` across all `10` `BLACK_KNIGHT_*` atlases (`BLACK_KNIGHT_ARMED_IDLE_KEY`, `BLACK_KNIGHT_MOVEMENT_KEY`, `BLACK_KNIGHT_CORE_COMBAT_KEY`, `BLACK_KNIGHT_DEFENSE_KEY`, `BLACK_KNIGHT_EXTENDED_SKILLS_KEY`, `BLACK_KNIGHT_CONVERSION_ACTIONS_KEY`, `BLACK_KNIGHT_CONVERSION_AIR_KEY`, `BLACK_KNIGHT_CONVERSION_COMBAT_KEY`, `BLACK_KNIGHT_CONVERSION_STATES_KEY`, `BLACK_KNIGHT_CONVERSION_MOTION_KEY`) and both portrait keys (`SATYR_PORTRAIT_KEY`, `WAYFARER_PORTRAIT_KEY`).
- Preserved `HW-V16-B01` scale stabilization (`1.14` Armed Run, `0.99 / 1.11` Unarmed Run, `18×12` world collider, bottom foot anchor), `Idle` `160 ms/frame`, `cameraZoom = 2.2`, walk/sprint speeds (`85` / `140`), and legacy/K1 references intact.

---

## 4. SPECIFIC ASSET REQUEST (REQUIRED TO CLOSE `BUG-059` TO `PASS`)

To unify sharpness across `Idle`, `Walk`, and `Run` at the `Conversion 34-Seq` HD pixel-art tier (matching `black_knight_conversion_motion` `armed_run_sequence` / `unarmed_run_sequence` & `black_knight_conversion_states`):
- **Cell size & pivot:** `80×72` or `84×72` RGBA8888 PNG (`softAlphaPct = 0%`, `nearest-neighbor`), `pivot (0.5, 0.875)` (`y = 63`).
- **Character pixel height in cell:** `~40–44 px` (`~650–800` opaque texels) so it renders at `~1.05–1.15` scale cleanly alongside `Conversion` Run (`~45–47` world px).
- **Missing 4-direction sequences (`down`, `up`, `left`, `right` × `6 frames` each = `96` frames total):**
  1. `armed_idle_sequence_{dir}_{0..5}` (`24` frames)
  2. `unarmed_idle_sequence_{dir}_{0..5}` (`24` frames)
  3. `armed_walk_sequence_{dir}_{0..5}` (`24` frames)
  4. `unarmed_walk_sequence_{dir}_{0..5}` (`24` frames)

---

## 5. VERIFICATION SUMMARY

| Check / Matrix | Scope | Result |
|---|---|---|
| `npm run check` (`tsc --noEmit`) | TypeScript build | PASS (exit `0`) |
| `npm run verify:data` | Data integrity | PASS (`15/15`) |
| `npm run build` | Production bundle (`tsc && vite build`) | PASS (exit `0`) |
| 48-Case Matrix (`verify_b02_matrix.py`) | `4 dirs` × `3 states (idle/walk/run)` × `Armed/Unarmed` × `60/30 fps` + `Run→Idle`, `HIGH`/`MEDIUM` graphics, Skills (`attack`, `heavy_attack`, `weapon_art`, `parry`, `roll`), `Save/Continue` Schema 3, `camZoom = 2.2`, `body = 18×12`, `scaleMode = 1 (NEAREST)` | PASS (`48/48` cases, `0` errors) |
| `tests/hw_bug_21b_walk_run_verification.py` | 4-dir Walk/Sprint, Shift release, IME, modal, Armed/Unarmed, combat smoke | PASS (`10/10`) |
| `tests/hw_bug_26b_walkrun_fix_verification.py` | Shift watchdog, collision guardrail, sprint resume, action locks, Save Schema 3 | PASS (`5/5`) |

---

## 6. DELIVERABLES

- Report: `Read/V1.5/Reports/V16/HW_V16_B02_BUG059_ARTWORK_REPORT.md`
- Evidence (`Read/V1.5/Reports/Evidence/HW-V16-B02/`):
  - `asset_checksums.json`
  - `alpha_bounds_and_density_audit.json`
  - `runtime_mapping_before_after.json`
  - `test_matrix_48_cases.json`
- Visuals (`Read/V1.5/Reports/Visuals/HW-V16-B02/`):
  - `b02_source_sharpness_contact_sheet.png`
  - `b02_runtime_contact_sheet.png`
