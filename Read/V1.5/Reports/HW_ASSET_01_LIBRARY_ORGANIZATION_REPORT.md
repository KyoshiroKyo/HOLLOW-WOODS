# HW-ASSET-01 — MASTER ASSET LIBRARY ORGANIZATION REPORT

- **Dự án:** `HOLLOW WOODS` (`Target: V1.5.4 — World Reconstruction 2.0 Preparation`)
- **Studio:** `KYOSHIRO STUDIO`
- **Nhánh:** `feat/v1.5.3-ag-world-polish`
- **HEAD SHA:** `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d` (`fix(boss): clean up Mire Warden sonic roar timers and encounter lifecycle`)
- **Checkpoint bảo toàn:** `HW-H4-12A` (`src/entities/BlackKnightPlayer.ts`, `src/scenes/UIScene.ts`, `src/ui/CraftingModal.ts`, `src/ui/JournalModal.ts`, `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md` — giữ nguyên vẹn `0` sửa đổi)
- **Ngày thực hiện:** `2026-11-26`

---

## 1. Cấu trúc thư mục trước khi sắp xếp

Trước khi tổ chức lại:
- **`Pixel_Art/` (`368` tệp):** Nằm lẫn lộn trực tiếp ở cấp gốc `Pixel_Art/` gồm file ảnh rời (`AnimationSheet_Character.png`, `UI_Platinum_*.png`), file bản quyền rời (`Contact.txt`, `License.txt`, `PenzillaDesign_StandardLicense.pdf`), 35 tệp `.zip`/`.rar` lẫn với thư mục đã giải nén (`extracted/`, `SHADOW_Series_The_Free_Assets/`), ảnh JPG tham khảo UI (`UI Pack/*.jpg`), boss, quái vật, NPC và kỵ sĩ.
- **`Sound_Effects/` (`1,216` tệp):** Gồm 5 nhóm đặt lẫn ở cấp gốc (`8-bit  16-bit Sound Effects (x25) Pack/`, `Horror SFX/`, `The Knight’s Quiet Fire/`, `Super Dialogue Audio Pack v1.zip`, `_extracted_dialogue/` chứa `550` file thật của `Super Dialogue Audio Pack v1` kèm `633` file rác AppleDouble `__MACOSX/._*`).
- **`public/assets/` (`269` tệp):** Kho tài nguyên runtime đang phục vụ trực tiếp game (`atlases/`, `audio/`, `buildings/`, `characters/`, `environment/`, `monsters/`, `ui/`) — được khóa bảo vệ tuyệt đối.

---

## 2. Cấu trúc thư mục sau khi sắp xếp

### 2.1 `Pixel_Art/` (368 tệp — Bảo toàn 100% file & lịch sử Git)
- `01_Characters/`: `Player/` (`Satyr/`, `Black_Knight_Archive/`), `Knights/` (`2D_SL_Knight_v1.0_3/`, `EleonoreAndJoanna/`, `Archives/`), `NPCs/` (`SmithNPC/`, `town-folk-2-free-v1.0/`, `Dark_Rogue/`, `Red_Cloak_Character/`, `N3XUS_Starter/`, `GandalfHardcore/`), `Portraits/` (`Portraits_v1/`, `Archives/`)
- `02_Bosses/`: `Mire_Warden/` (`Wetlands_Boss_Primary/`, `Wetlands_Boss_Bundle_Copy/`), `Hooded_Knight/`, `Other_Bosses/` (`Dark_Fantasy_Big_Boss/`, `Undead executioner.zip`)
- `03_Creatures/`: `Monsters/` (`Shadow_Crow/`, `Skullwolf/`, `Shadow_Eyes_Monster001/`, `Pixel_Bat_Pig_Spider_Worms/`, `Archives/`), `Wildlife/` (`PixelHorse_V1.0/`, `Rat.zip`), `Entities/` (`SHADOW Series - Hallokin`, `Shadeflit`, `The Blind Huntress 128px/48px`, `Archives/`)
- `04_Buildings/Castles/`: `Pixel_Castle_Interior_Tileset_v1.0.zip`, `Pixel_Castle_Medieval_Tileset_v1.0.zip`
- `05_Vegetation/Trees/`: `Forest_Asset_Pack/`, `Updated_Trees/`
- `06_Terrain/Tilesets/`: `TopDownFantasy_Forest/`, `SHADOW_Pixel_Tile_Map_Pack_3/`, `Pixel_Art_Top_Down_Basic/`
- `07_World_Objects/`: `Bridges_And_Gates/SHADOW_Void_Gate/`, `Rocks_And_Props/TopDownFantasy_Forest/`
- `08_Items_Equipment/Weapons/`: `Demon_sword.zip`
- `09_UI_UX/`: `Icons/`, `HUD/`, `Panels/`, `World_Map/`
- `10_Visual_Effects/Magic/`: `GandalfHardcore character effects.zip`
- `12_Reference_Art/`: `UI_Mockups/` (8 ảnh JPG tham khảo giao diện), `Environment_Mockups/TopDownFantasy_Forest/`
- `99_Unclassified/Archives_Pending_Inspection/`: 3 tệp `.rar` chưa giải nén (`ForgottenMemories.rar`, `Ramses Free Package_2.rar`, `Resurrected RPG 1.1.rar`)
- **Giữ nguyên tại chỗ (Script/Rule-protected per Phase E):**
  - `Pixel_Art/Black Knight/` (`29` tệp — `extract_black_knight_wayfarer.mjs:17` & `Read/AI_IRON_RULES.md:37`)
  - `Pixel_Art/The Fan-tasy Tileset (Free) 1.5.9.zip` (`1` tệp — `scripts/restore_tiled_tileset_images.py:19`)

### 2.2 `Sound_Effects/` (1,216 tệp — Không tạo kho `Audio/` trùng lặp)
- `03_Player_SFX/Movement/8bit_16bit_Pack/` (`1` tệp: `Jump 1.wav`)
- `04_Combat_SFX/Impact/8bit_16bit_Pack/` (`6` tệp: `Blow*`, `Hit damage 1.wav`, `Boss hit 1.wav`)
- `07_World_SFX/Interactions/8bit_16bit_Pack/` (`11` tệp)
- `08_UI_SFX/`: `Click/` (`3`), `Inventory/` (`2`), `Notification/` (`1`)
- `09_Voice_Dialogue/NPCs/Super_Dialogue_Audio_Pack_v1/` (`545` tệp WAV thoại chia 10 nhóm cảm xúc + diễn viên lồng tiếng, CC BY 4.0)
- `11_Audio_Licenses/`: `Licenses/` (`3` PDF bản quyền & danh sách diễn viên) & `Sources/` (`4` file nén nguồn `Horror SFX/*.zip`, `Super Dialogue Audio Pack v1.zip`)
- `99_Unclassified/_macos_metadata/` (`635` tệp AppleDouble `._*` / `.DS_Store` giữ nguyên để bảo toàn 100% số lượng file trước/sau, chờ Owner duyệt dọn)
- **Giữ nguyên tại chỗ (Script-protected per Phase E):**
  - `Sound_Effects/The Knight’s Quiet Fire/` (`5` tệp MP3 — được `scripts/test_v15_39_bgm_system.mjs:47` kiểm tra trực tiếp)

---

## 3. Thống kê số lượng Pixel Art

| Nhóm | Số lượng | Chi tiết |
| :--- | :---: | :--- |
| Kho thiết kế gốc `Pixel_Art/` | **368** | 338 đã phân loại/di chuyển + 30 giữ tại chỗ (script/rule) |
| Tài nguyên runtime `public/assets/` (non-audio) | **204** | 203 `ACTIVE-RUNTIME` + 1 `mossbound_wayfarer.rar` (`UNUSED-CANDIDATE` giữ nguyên) |
| **Tổng danh mục `HW_PIXEL_ART_ASSET_INDEX.json`** | **572** | `Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_PIXEL_ART_ASSET_INDEX.json` |

---

## 4. Thống kê số lượng Audio

| Nhóm | Số lượng | Chi tiết |
| :--- | :---: | :--- |
| Kho âm thanh gốc `Sound_Effects/` | **1,216** | 1,211 đã phân loại/di chuyển + 5 BGM giữ tại chỗ (`test_v15_39_bgm_system.mjs`) |
| Tài nguyên runtime `public/assets/audio/` | **65** | 5 BGM + 4 Ambience + 6 Dialogue + 21 Core SFX + 29 V1.4 SFX |
| **Tổng danh mục `HW_AUDIO_ASSET_INDEX.json`** | **1,281** | `Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_AUDIO_ASSET_INDEX.json` |

---

## 5. Số lượng tài nguyên đã di chuyển

- **Tổng số tệp đã di chuyển an toàn:** **`1,549`** tệp (`0` xung đột, `0` ghi đè):
  - `Pixel_Art/`: **`338`** tệp (**`297`** bằng `git mv` bảo toàn lịch sử + **`41`** tệp untracked bằng `shutil.move`).
  - `Sound_Effects/`: **`1,211`** tệp (bằng `shutil.move` an toàn, khu vực `.gitignore`).
- Đã dọn **`243`** thư mục rỗng cũ còn sót lại sau di chuyển; **không xóa bất kỳ tệp nào**.

---

## 6. Tài nguyên runtime & tham chiếu đang hoạt động được bảo vệ

- **`public/assets/**` (`269` tệp):** Bảo vệ tuyệt đối (`0` thay đổi, `0` sai khác SHA-256).
- **Tài nguyên gốc giữ nguyên vị trí do script/doc tham chiếu (`35` tệp):**
  1. `Pixel_Art/Black Knight/` (`29` tệp) → phụ thuộc `scripts/extract_black_knight_wayfarer.mjs:17` & `Read/AI_IRON_RULES.md:37`.
  2. `Pixel_Art/The Fan-tasy Tileset (Free) 1.5.9.zip` (`1` tệp) → phụ thuộc `scripts/restore_tiled_tileset_images.py:19`.
  3. `Sound_Effects/The Knight’s Quiet Fire/` (`5` tệp MP3) → phụ thuộc `scripts/test_v15_39_bgm_system.mjs:47`.

---

## 7. Tài nguyên chưa phân loại

Xem chi tiết tại [HW_UNCLASSIFIED_ASSETS_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_UNCLASSIFIED_ASSETS_REPORT.md):
- **`3` tệp `.rar`** chưa giải nén kiểm tra nội dung tại `Pixel_Art/99_Unclassified/Archives_Pending_Inspection/` (`ForgottenMemories.rar`, `Ramses Free Package_2.rar`, `Resurrected RPG 1.1.rar`).
- **`635` tệp AppleDouble / macOS metadata** tại `Sound_Effects/99_Unclassified/_macos_metadata/`.

---

## 8. Danh sách file trùng lặp & biến thể

Xem chi tiết tại [HW_DUPLICATE_ASSETS_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_DUPLICATE_ASSETS_REPORT.md):
- **`68` nhóm trùng SHA-256** (`21` cặp `SOURCE AND RUNTIME COPY` hợp lệ, `44` nhóm `EXACT DUPLICATE` trong nguồn/runtime — bao gồm phát hiện `ambience_crossing.mp3 == footstep_leaves_1.mp3`, `craft_success.wav == ui_confirm.wav`, `interact.wav == ui_select.wav`, cùng `EleonoreAndJoanna`, `2D_SL_Knight_v1.0.zip`, `Humble Gift Paper UI System v1 vs v1.1` — và `3` nhóm AppleDouble).
- **`18` nhóm trùng tên khác nội dung / biến thể** (gồm biến thể `end-Attack 3.png` kích thước `1235x87` vs `1729x87` của Wetlands Boss, bản `The Blind Huntress` 128px vs 48px, `Dark Rogue`, `Vamphare` draft vs original).

---

## 9. Migration Map & Contact Sheets

- Migration Map: [HW_ASSET_MIGRATION_MAP.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_ASSET_MIGRATION_MAP.json)
- Pixel Art Index: [HW_PIXEL_ART_ASSET_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_PIXEL_ART_ASSET_INDEX.json)
- Audio Index: [HW_AUDIO_ASSET_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_AUDIO_ASSET_INDEX.json)
- **10 Contact Sheets kèm tên file** trong `Read/V1.5/Reports/Visuals/HW-ASSET-01/`:
  - [contact_01_characters.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_01_characters.png) · [contact_02_bosses.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_02_bosses.png) · [contact_03_creatures.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_03_creatures.png) · [contact_04_buildings.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_04_buildings.png) · [contact_05_vegetation.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_05_vegetation.png) · [contact_06_terrain.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_06_terrain.png) · [contact_07_world_objects.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_07_world_objects.png) · [contact_08_items.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_08_items.png) · [contact_09_ui.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_09_ui.png) · [contact_10_visual_effects.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-ASSET-01/contact_10_visual_effects.png)

---

## 10. Vị trí Backup ngoài Repository

- **Thư mục Backup:** `G:\HOLLOW_WOODS_EXPORT\BACKUP_HW_ASSET_01_20261126_065034`
- **Xác minh:** `1,584 / 1,584` tệp (`1,596.03 MB`) sao chép và đối chiếu SHA-256 đạt **100%**.

---

## 11. Kiểm tra Hash Integrity sau di chuyển

- **Missing files:** `0`
- **Overwritten files:** `0`
- **Hash mismatches (`Pixel_Art/` + `Sound_Effects/`):** `0 / 1,584`
- **Hash mismatches (`public/assets/`):** `0 / 269`

---

## 12. Build & Kiểm tra tĩnh

- `npm run check` (`tsc --noEmit`): **PASS** (exit `0`)
- `npm run verify:data`: **15/15 PASS** (`43` items, `18` recipes, `92` content_registry, `29` lore entries)
- `npm run build` (`tsc && vite build`): **PASS** (`dist/assets/index-FGtorazy.js` `1,186.59 kB`, `17.56s`)
- `git diff --check`: **PASS** (exit `0`)

---

## 13. Asset 404 & Audio Script Verification

- `node scripts/verify_zero_404_assets.mjs`: **212/212 HỢP LỆ, 0 THIẾU (404)**
- `node scripts/test_v15_39_bgm_system.mjs`: **29 PASSED, 0 FAILED**

---

## 14. Runtime Smoke Test (`dist/` qua Playwright)

- `pass: true` | `mainMenuActive: true` | `textureCount: 170` | `missingTex: []`
- `audioCacheCount: 60` | `audioRegisteredCount: 54`
- `gameActive: true` | `uiActive: true` | `zoneId: "fog_crossing"` | `playerTexture: "black_knight_armed_idle"`
- `pageErrors: []` | `consoleErrors: []` | `httpErrors: []`

---

## 15. Các hạn chế & Đề xuất cho Owner

1. **Tài nguyên giữ nguyên do phụ thuộc script/tài liệu (`35` tệp):** Có thể chuyển nốt về cấu trúc chuẩn sau khi Owner duyệt cập nhật đường dẫn trong `restore_tiled_tileset_images.py`, `extract_black_knight_wayfarer.mjs`, `test_v15_39_bgm_system.mjs`, và `Read/AI_IRON_RULES.md`.
2. **Metadata rác AppleDouble (`635` tệp trong `_macos_metadata/`)** và **`3` tệp `.rar` chưa giải nén:** Chờ Owner duyệt dọn hoặc giải nén kiểm tra trước khi xóa/phân loại sâu hơn.
3. **`scripts/AUDIO_SOURCES_MANIFEST.json` & `.csv`:** Được bảo toàn nguyên vẹn (`0` sửa đổi). Nếu Owner muốn đồng bộ lại đường dẫn `relPath` mới trong `Sound_Effects/`, chỉ cần cập nhật `generate_audio_sources_manifest.mjs` theo cấu trúc thư mục mới.
4. **Trùng lặp nội bộ runtime (`ambience_crossing.mp3 == footstep_leaves_1.mp3`):** Giữ nguyên theo quy tắc Phase I/§12; khuyến nghị Owner kiểm tra lại âm thanh `footstep_leaves_1.mp3` ở một task audio riêng sau này.

```text
PIXEL ART INVENTORY: 572 (368 Pixel_Art + 204 public/assets non-audio)
AUDIO INVENTORY: 1281 (1216 Sound_Effects + 65 public/assets/audio)
FILES BEFORE: 1853 (368 Pixel_Art + 1216 Sound_Effects + 269 public/assets)
FILES AFTER: 1853 (368 Pixel_Art + 1216 Sound_Effects + 269 public/assets)
FILES MOVED: 1549 (338 Pixel_Art [297 git mv + 41 untracked] + 1211 Sound_Effects)
DUPLICATE CANDIDATES: 68 SHA-256 exact groups + 18 same-name variant groups
UNCLASSIFIED FILES: 638 (3 unextracted .rar in Pixel_Art/99_Unclassified + 635 macOS metadata files in Sound_Effects/99_Unclassified)
MISSING FILES: 0
OVERWRITTEN FILES: 0
HASH INTEGRITY: PASS (1584/1584 source + 269/269 public/assets matched)
RUNTIME ASSETS PRESERVED: YES (269/269 public/assets + 35 script-referenced source files untouched)
PRODUCTION SOURCE MODIFIED: NO
BUILD STATUS: PASS (npm run check + npm run verify:data 15/15 + npm run build)
ASSET 404 STATUS: PASS (212/212 valid, 0 missing)
BACKUP LOCATION: G:\HOLLOW_WOODS_EXPORT\BACKUP_HW_ASSET_01_20261126_065034
REPORT LOCATION: Read/V1.5/Reports/HW_ASSET_01_LIBRARY_ORGANIZATION_REPORT.md
FINAL STATUS: PASS
```
