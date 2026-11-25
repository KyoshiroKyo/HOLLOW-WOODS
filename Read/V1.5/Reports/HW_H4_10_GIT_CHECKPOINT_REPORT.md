# HW-H4-10 — OWNER-APPROVED GIT CHECKPOINT & QA CANDIDATE DELIVERY REPORT

- **Project:** HOLLOW WOODS (`Target: V1.5.4 QA Candidate`)
- **Studio:** KYOSHIRO STUDIO
- **Branch:** `feat/v1.5.3-ag-world-polish`
- **Remote:** `https://github.com/KyoshiroKyo/HOLLOW-WOODS.git`
- **Baseline SHA Before Checkpoint:** `0617668a97f462877cbe2c30d304323e8fd48f6e`
- **Release Gate Status:** **`CONDITIONAL GO`** *(Internal QA Candidate Only — Public Release / Tag / `main` Merge NOT EXECUTED)*
- **Protocol:** `HYDRO HIGH ENGINEERING PROTOCOL V4` (`MODE: CHECKPOINT & DELIVERY ONLY`)

---

## 1. Summary of Verified Commits Created (`C1`–`C8`)

> *(Lưu ý theo §10: Báo cáo này được đưa lên GitHub ở commit doc-only kế tiếp ngay sau `C8`; báo cáo không tự tham chiếu SHA của chính commit chứa nó.)*

| # | Scope / Task ID | Commit SHA | Commit Message | Files Committed | GitHub Link |
| :---: | --- | --- | --- | --- | --- |
| `C1` | `HW-H4-01` (`BUG-HW-CS21-01`) | `1f9d9a7264b00d1fa7dd7c4d8d41aa011e118776` | `fix(ending): honor SettingsManager flash, shake, and reduced motion in EndingSystem` | `src/systems/EndingSystem.ts` | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/1f9d9a7264b00d1fa7dd7c4d8d41aa011e118776 |
| `C2` | `HW-H4-03` | `997701f716f6981d7cc80d045ef073735e8c7845` | `fix(world): clear Silent Mire, Sunken Crypt, and Drowned Mire collider bottlenecks` | `src/data/zones.json`, `src/world/WorldBuilder.ts` (Silent Mire/Crypt/Depths hunks) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/997701f716f6981d7cc80d045ef073735e8c7845 |
| `C3` | `HW-H4-05` | `71a32cb83528fe7358d5cdc16514209d8064dad4` | `fix(lifecycle): clean scene event listeners on restart and align cauldron/chest Y-depth` | `src/world/WorldBuilder.ts` (cauldron/chest Y-depth), `src/systems/WildlifeSystem.ts` (listener cleanup hunks), `src/scenes/GameScene.ts` (`customSceneEvents` shutdown hunk) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/71a32cb83528fe7358d5cdc16514209d8064dad4 |
| `C4` | `HW-H4-06` | `9a5db89fbc8a0b331953a0e8ff542fa680dd4b80` | `perf(render): bake static HUD/QuickCraft/shadow textures and cull world resource nodes` | `src/scenes/UIScene.ts`, `src/ui/QuickCraftSidebar.ts`, `src/systems/InventorySystem.ts`, `src/entities/BlackKnightPlayer.ts`, `src/scenes/GameScene.ts` (`updateEntityCameraCulling` hunks) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/9a5db89fbc8a0b331953a0e8ff542fa680dd4b80 |
| `C5` | `HW-H4-07` (`H4-NEW-01`/`02` partial) | `0055a7e4af442706f92b98739123a313bec7f097` | `fix(boss): correct Hooded & Fallen Knight zone coordinates and block defeated respawn` | `src/systems/WildlifeSystem.ts` (`FALLEN_KNIGHT_HABITATS`, `HOODED_KNIGHT_HABITATS`, `boss_hooded_knight_defeated` guard) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/0055a7e4af442706f92b98739123a313bec7f097 |
| `C6` | `HW-H4-08` | `a80ec99036d8dc0300a2aa563ebab6dd684fac94` | `fix(save): restore unlockedLoreIds, cleanly reset weapon/campfire/Act0, and support legacy chest/crest` | `src/state/PlayerState.ts`, `src/systems/SaveManager.ts`, `src/services/CloudSaveService.ts`, `src/scenes/GameScene.ts` (`cancelPendingGameSave` & `updateAct0Progression` hunks) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/a80ec99036d8dc0300a2aa563ebab6dd684fac94 |
| `C7` | `HW-H4-08-R1` (`HW-CS21-06`) | `19684021f79e13bb05abfae0ba86f0358bcd39ac` | `test(qa): harden HW-BUG-12..19 and 26B assertions, exit codes, and BGM abort classification` | `scripts/test_hw_bug12..19.py` (`8` scripts), `tests/hw_bug_26b_walkrun_fix_verification.py`, `Read/V1.5/Reports/HW_BUG_12..19_*.json`, `bug023/hw_fix23a/hw_fx31/hw_stab32_metrics.json`, `38` updated regression PNGs (`59` files total) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/19684021f79e13bb05abfae0ba86f0358bcd39ac |
| `C8` | `HW-H4-00`–`HW-H4-09` Docs & Registry Sync | `080258d54493b156aaeb10f65edeb2fc0259960d` | `docs(qa): record HW-H4-00..09 stability reports, bug registry sync, and QA evidence` | [V153_TESTER_BUG_REGISTRY.md](V153_TESTER_BUG_REGISTRY.md), `HW_H4_00`..`HW_H4_09_*.md`, `Evidence/HW-H4-06..09/*`, `Visuals/HW-H4-01,03,04,05,06,07/*` (`130` files total) | https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/080258d54493b156aaeb10f65edeb2fc0259960d |

- **Source Completeness Check (`C1`–`C6`):** Ngay sau `C6`, `git diff -- src/` rỗng (`0` dòng tồn đọng ngoài commit).

---

## 2. Files Protected & Left Unstaged (`§7`)

Tuân thủ nghiêm `.gitignore`, `FOLDER_STRUCTURE_RULES.md` và `HW-H4-10`:
- **Untracked pre-existing files của Owner (giữ nguyên không stage):**
  - `scripts/AUDIO_SOURCES_MANIFEST.csv`
  - `scripts/AUDIO_SOURCES_MANIFEST.json`
  - `scripts/generate_audio_sources_manifest.mjs`
  - `Read/V1.5/Reports/HW_CS21_QA_06_CHECKPOINT_REPORT.md`
  - `Read/V1.5/Reports/Visuals/HW-CS21-QA-*` (`90` PNG files từ đợt QA CS21 trước)
- **Ignored / Runtime / Local Backup directories (không stage):**
  - `node_modules/`, `dist/`, `Backups/` (`backup_hw_h4_03/05/06/07/08`), `public/assets/characters/mossbound_wayfarer.rar` (`*.rar` trong `.gitignore`), `scripts/__pycache__/`, `tests/__pycache__/`.
- **Team UI / Out-of-scope:** Không chạm hoặc tích hợp nhánh/chức năng Team UI.

---

## 3. Verification Results Before & At Checkpoint (`§5`, `§6`, `§10`)

| Check | Result | Verified Scope & Output |
| --- | :---: | --- |
| TypeScript (`npm run check` / `tsc --noEmit`) | **PASS** (`exit 0`) | `0` lỗi TypeScript trên 12 file `src/` cuối cùng |
| Production Build (`npm run build`) | **PASS** (`exit 0`) | Build `dist/` sạch (`dist/assets/index-B48zhYTu.js`, `1,182.77 kB`) |
| Data Integrity (`npm run verify:data`) | **PASS** (`exit 0`) | `15/15` kiểm tra dữ liệu `items`, `recipes`, `dialogues`, `quests`, `registry`, `lore` |
| Zero-404 Assets (`verify_zero_404_assets.mjs`) | **PASS** (`exit 0`) | `212/212` tài nguyên hợp lệ (`0` thiếu) |
| Content Registry (`verify_content_registry.mjs`) | **PASS** (`exit 0`) | `92` entries, `0` duplicate, `7/7` lookup PASS |
| Save Schema 3 Unit (`test_v153_save_schema3.mjs`) | **PASS** (`exit 0`) | `2/2` suites PASS trên `CloudSaveService.ts` |
| Python Syntax (`py_compile` 9 scripts) | **PASS** (`exit 0`) | `9/9` script (`#12..#19`, `26B`) hợp lệ cú pháp |
| `git diff --check` / `git diff --cached --check` | **PASS** (`exit 0`) | `0` lỗi xung đột hay khoảng trắng |
| `HW-H4-06` Preservation (`C4`) | **YES** | Bảo toàn 100% UI Texture Baking (`UIScene`, `QuickCraftSidebar`), World Node Culling + Cached Shadows (`InventorySystem`, `GameScene`), DepthSort Guard (`BlackKnightPlayer`). Kết quả GPU thực GTX 1070 Ti D3D11 (đo ở `HW-H4-06` trước `H4-07/08`): `59.55–60.05 FPS` VSync, `173.45 FPS` Uncapped, `92.6` draw calls. |
| Regression Evidence Reused from `HW-H4-08/R1` & `HW-H4-09` (`0` edit `src/` sau lần chạy hợp lệ) | **PASS** (`Staged Integration` + `Unit`) | `HW-BUG-#12..#19` & `26B` (`9/9 exit=0`), Negative Fail-Fast (`3/3 exit=1`), `Save E2E 13/13`, `depletedNodes`, `CLOUD_LOCAL_PRIORITY_PASS`, `task-23706` 14-domain staged check. |

---

## 4. Preserved Evidence Paths (`§10.11`)

- `Read/V1.5/Reports/Evidence/HW-H4-06/` (`step-22791-v1-summary.txt`, logs `task-22591..23012`)
- `Read/V1.5/Reports/Evidence/HW-H4-07/` (`hw_h4_07_baseline.json`, `hw_h4_07_after.json`)
- `Read/V1.5/Reports/Evidence/HW-H4-08/` (`hw_h4_08_save_baseline.json`, `hw_h4_08_save_after.json`, `hw_h4_08_harness_runs.json`, `hw_h4_08_r1_verification.json`, `hw_h4_08_r1_extra_checks.json`)
- `Read/V1.5/Reports/Evidence/HW-H4-09/` (`hw_h4_09_full_regression.json`)
- `Read/V1.5/Reports/Visuals/HW-H4-01/`, `03/`, `04/`, `05/`, `06/`, `07/`

---

## 5. Remaining Bugs Synced to `HW-H4-09` & `V153_TESTER_BUG_REGISTRY.md` (`§8`, `§10.12`)

- **`FIXED-PENDING-OWNER` (Chưa tự chuyển `CLOSED-VERIFIED` cho tới khi Owner playtest thực tế):** `BUG-HW-CS21-01`, `HW-H4-03` (Silent Mire/Crypt/Depths), `HW-H4-05` (Listener Leak & Y-Depth), `HW-H4-06` (Perf Optimization), `HW-H4-08` (5 Save/Reset/Legacy defects), `HW-CS21-06` & `#12..#19` Harnesses.
- **`PARTIAL` (`3`):**
  1. `H4-NEW-01`: Đã sửa Boss/Fallen Knight trong `WildlifeSystem.ts`; các bảng `SKULL_WOLF_HABITATS`, `SHADOW_*_HABITATS`, `DREAD_HORSEMAN_HABITATS`, `ZONE_HABITATS` vẫn dùng tọa độ cục bộ.
  2. `H4-NEW-02` / `OPEN-03`: Đã chặn Hooded Knight hồi sinh; nhánh hủy thoại `ESC` (`DialogueSystem.cancelDialogue()`) chưa phát `'dialogue_completed'`.
  3. `HOTFIX-B2`: Pass tự động Watchdog/IME packet; chờ kiểm tra hook vật lý `EVKey`/`UniKey` trên Windows thật.
- **`OPEN` (`9`):**
  - `H4-NEW-03` / `OPEN-01` (**P1**): Mire Warden rơi `relic_heart_of_roots x2` & gán sớm `clapper_collected`.
  - `OPEN-02` (**P1**): Nhánh Stage 6 vào `broken_bell_shrine` thiếu `mire_pillars_solved || mire_puzzle_solved` không kích hoạt Mire Warden.
  - `H4-NEW-04` (**P1**): Phím `[C]` tự mở/đóng ngay `CraftingModal`; `[I]` mở `CraftingModal`.
  - `H4-NEW-05` (**P1**): Xung đột phím `[M]` (Mute Audio thắng World Map; dùng `[N]`).
  - `H4-NEW-06` (**P1**): `AudioManager.setupAutoplayUnlock()` rò rỉ 5 `window` listeners `{ capture: true }`.
  - `H4-NEW-07` (**P1/P2**): `public/assets/characters/mossbound_wayfarer.rar` (185.5 KB) vẫn lọt vào `dist/`; lệch version `1.5.2`/`1.5.1`/`1.4.0`.
  - `H4-NEW-08` (**P2**): `MireWardenBoss.triggerSonicRoar()` chưa guard `!this.active || !this.scene`.
  - `H4-NEW-09` (**P2**): `TheEcho.checkDirectGaze()` flash bỏ qua `SettingsManager.isScreenFlashEnabled()`.
  - `HW-H4-03-AUDIT` & `TMP-01/02` (**P2**): `to_abyssal_chasm` hụt `2 px` ở `footY = -622`, `bell_to_fog_y280`, và script audit `V1.4.0` cũ.
- **`BLOCKED` (`2` + `HOTFIX-B2`):** `BUG-024` (P2Game hosted CDN Range 206) và `BUG-033` / Owner acceptance (World Map 5 expansion zones, đồ họa, nghe âm thanh thật `BUG-026/027`).
- **`DEFERRED` (`2` — Dành riêng Codex):** `HW-CS21-04` (`BUG-058` Scale Pop) và `HW-CS21-05` (`BUG-059` HD Consistency).

---

- **RELEASE GATE:** **`CONDITIONAL GO`** *(Internal QA Candidate Only)*
- **PUBLIC RELEASE:** **`NOT EXECUTED`** (`HARD STOP` awaiting Owner review & next directive)
