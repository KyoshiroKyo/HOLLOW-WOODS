# BÁO CÁO ĐỒNG BỘ VÀ KIỂM KÊ TÀI NGUYÊN (HW-ASSET-01)

- **Dự án:** HOLLOW WOODS — V1.5.4 PREPARATION
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Mã nhiệm vụ:** `HW-ASSET-01 — RECONCILE ASSET MANIFEST`
- **Chế độ:** `ASSET METADATA FIX` (Không thay đổi asset nhị phân, không tự ý sửa Content Registry)
- **Ngày thực hiện:** 22/11/2026
- **Trạng thái:** HOÀN THÀNH (Đồng bộ 100% Manifest với tài nguyên thực tế trên đĩa)

---

## 1. TỔNG QUAN ĐỐI CHIẾU TRƯỚC VÀ SAU (BEFORE / AFTER)

| Chỉ số (Metric) | Manifest cũ (Before) | Manifest mới (After) | Chênh lệch (Delta) | Ghi chú kỹ thuật |
| :--- | :---: | :---: | :---: | :--- |
| **Tổng số file (totalFiles)** | 250 | **269** | **+19** | Bổ sung 16 file atlas Black Knight, 2 file atlas item icons, 1 file archive wayfarer. |
| **Tổng dung lượng (totalBytes)** | 69,443,014 B | **78,105,582 B** | **+8,662,568 B** | +8.26 MB (bao gồm cập nhật kích thước 2 file MP3 và các atlas mới). |
| **Danh mục Audio** | 65 | 65 | 0 | Đã đồng bộ kích thước chuẩn của 2 file MP3 ambience. |
| **Danh mục Characters** | 61 | **78** | **+17** | +16 Black Knight conversion/skills + 1 wayfarer archive. |
| **Danh mục Environment** | 69 | 69 | 0 | Giữ nguyên 100% tài nguyên môi trường, gạch và công trình. |
| **Danh mục Monsters** | 9 | 9 | 0 | Đầy đủ sprite sheet quái vật. |
| **Danh mục UI** | 36 | 36 | 0 | Đầy đủ icon, font, panel, slot. |
| **Danh mục Other** | 10 | **12** | **+2** | +2 file atlas `item_icons_atlas.json` & `.png`. |
| **Missing paths on disk** | — | **0** | — | 100% đường dẫn trong manifest đều tồn tại thực tế trên đĩa. |
| **File trên đĩa chưa manifest**| 19 | **0** | **-19** | 100% file trong `public/assets/` đã được lập chỉ mục đầy đủ. |
| **Đường dẫn trùng (Duplicates)**| 0 | **0** | 0 | Không có bất kỳ đường dẫn nào bị khai báo trùng lặp. |

---

## 2. CHI TIẾT CÁC TÀI NGUYÊN ĐƯỢC BỔ SUNG VÀ CẬP NHẬT

### 2.1. 19 Đường dẫn mới được bổ sung vào Manifest
1. `public/assets/characters/black_knight/black_knight_conversion_actions.json` (116,370 B)
2. `public/assets/characters/black_knight/black_knight_conversion_actions.png` (213,006 B)
3. `public/assets/characters/black_knight/black_knight_conversion_air.json` (146,658 B)
4. `public/assets/characters/black_knight/black_knight_conversion_air.png` (282,852 B)
5. `public/assets/characters/black_knight/black_knight_conversion_combat.json` (345,283 B)
6. `public/assets/characters/black_knight/black_knight_conversion_combat.png` (967,763 B)
7. `public/assets/characters/black_knight/black_knight_conversion_motion.json` (140,613 B)
8. `public/assets/characters/black_knight/black_knight_conversion_motion.png` (472,099 B)
9. `public/assets/characters/black_knight/black_knight_conversion_states.json` (233,702 B)
10. `public/assets/characters/black_knight/black_knight_conversion_states.png` (715,692 B)
11. `public/assets/characters/black_knight/black_knight_core_combat.json` (46,344 B)
12. `public/assets/characters/black_knight/black_knight_core_combat.png` (111,020 B)
13. `public/assets/characters/black_knight/black_knight_defense.json` (138,631 B)
14. `public/assets/characters/black_knight/black_knight_defense.png` (288,641 B)
15. `public/assets/characters/black_knight/black_knight_extended_skills.json` (125,940 B)
16. `public/assets/characters/black_knight/black_knight_extended_skills.png` (313,019 B)
17. `public/assets/characters/mossbound_wayfarer.rar` (185,541 B)
18. `public/assets/atlases/item_icons_atlas.json` (19,794 B)
19. `public/assets/atlases/item_icons_atlas.png` (7,388 B)

### 2.2. Tài nguyên được cập nhật kích thước (Updated Assets Metadata)
- **`public/assets/audio/ambience/ambience_crossing.mp3`:**
  - Kích thước cũ: `507,529 B` $\rightarrow$ Kích thước thực tế: `2,771,121 B` (+2.16 MB).
- **`public/assets/audio/ambience/ambience_village.mp3`:**
  - Kích thước cũ: `35,143 B` $\rightarrow$ Kích thước thực tế: `1,557,211 B` (+1.45 MB).
- **`public/assets/characters/black_knight/black_knight_armed_idle.json`:** `16,183 B` $\rightarrow$ `16,880 B`.
- **`public/assets/characters/black_knight/black_knight_movement.json`:** `77,038 B` $\rightarrow$ `81,537 B`.
- **`public/assets/ui/fonts/OFL-NotoSans.txt`:** `4,114 B` $\rightarrow$ `4,232 B`.
- **`public/assets/atlases/hollow_props_atlas.json`:** `20,799 B` $\rightarrow$ `22,037 B`.

---

## 3. RÀ SOÁT VÀ ĐÁNH GIÁ RỦI RO CONTENT REGISTRY (CONTENT REGISTRY RISKS)

Kiểm tra đối chiếu 32 định nghĩa tài nguyên trong `src/data/content_registry.json`:
- **16 / 32 tài nguyên** (`HW-AST-CHAR-SKULLWOLF` đến `HW-AST-NPC-CAMPFIREKNIGHT`) tồn tại 100% trên đĩa và khớp hoàn toàn với manifest (các sprite sheet quái vật, boss, hiệp sĩ campfire và portrait UI).
- **10 tài nguyên biểu tượng (`HW-AST-ICON-000001` đến `HW-AST-ICON-000010`):**
  - Đường dẫn trong registry: `assets/icons/*.png` (không tồn tại dạng file rời trên đĩa).
  - **Phân tích runtime:** Trò chơi hiện tại **không nạp** các file icon rời này. Từ phiên bản V1.5.3 (BUG-025 / HW-BUG-#7), hệ thống `src/utils/ItemIconHelper.ts` đã gom toàn bộ 43 biểu tượng vật phẩm vào atlas duy nhất: `public/assets/atlases/item_icons_atlas.png` & `.json`.
  - **Mức độ rủi ro:** THẤP (Không gây lỗi 404 khi chạy game; đây là vết tích thiết kế thời kỳ V1.0–V1.2).
- **3 tài nguyên nhân vật legacy (`HW-AST-CHAR-000001` đến `HW-AST-CHAR-000003`):**
  - `satyr_spritesheet.png`: Được bảo vệ bởi fallback an toàn trong `GameScene.ts:716` (`this.textures.exists('satyr_spritesheet') ? ... : '__DEFAULT'`).
  - `wayfarer_spritesheet.png`: Không có lời gọi nạp trực tiếp; runtime sử dụng các sheet module trong `public/assets/characters/mossbound_wayfarer/`.
  - `the_listener.png`: Registry ghi `assets/sprites/the_listener.png`, nhưng mã nguồn runtime `PreloadScene.ts:717` nạp đúng `assets/monsters/the_listener.png` (tồn tại thực tế trên đĩa).
  - **Mức độ rủi ro:** THẤP (Không ảnh hưởng gameplay runtime).
- **3 tài nguyên âm thanh legacy (`HW-AST-SFX-000001` đến `HW-AST-SFX-000003`):**
  - Các file `sfx_woodland_wind_loop.mp3`, `sfx_forest_night_ambience.mp3`, `sfx_swamp_frogs_ambience.mp3` không được gọi nạp trong `PreloadScene.ts` hay `AudioManager.ts`. Hệ thống âm thanh V1.5 sử dụng `ambience_crossing.mp3`, `ambience_forest.mp3`, `ambience_mire.mp3`, v.v.
  - **Mức độ rủi ro:** THẤP.
- **Quy tắc tuân thủ:** Không tự ý sửa `content_registry.json` vì chưa có asset thay thế chính thức từ Owner; dữ liệu trên được ghi nhận phục vụ việc chuẩn hóa tài liệu phát hành V1.5.4.

---

## 4. KẾT QUẢ KIỂM THỬ XÁC THỰC (VALIDATION)

1. **Kiểm tra tính toàn vẹn Manifest:**
   - Script Node xác minh: `269 / 269` file tồn tại thực tế trên đĩa (0 missing paths).
   - Kích thước byte trong manifest khớp 100% với kích thước thực tế trên filesystem NTFS.
   - 0 đường dẫn trùng lặp.
2. **Kiểm tra Zero 404 Runtime (`scripts/verify_zero_404_assets.mjs`):**
   - Quét toàn bộ 212 đường dẫn tài nguyên được khai báo trong `PreloadScene.ts` và `AudioManager.ts`.
   - Kết quả: **212 / 212 tài nguyên tồn tại vật lý** trong thư mục `public/`.
   - Đạt chuẩn **ZERO 404** tại thời điểm nạp game.
3. **Kiểm tra biên dịch sản phẩm (`npm run build`):**
   - Lệnh thực thi: `npm run build` (`tsc && vite build`).
   - Thời gian hoàn thành: **12.42 giây**.
   - Kết quả: **EXIT CODE 0** (0 lỗi TypeScript, 0 lỗi bundling Vite).
4. **Bảo toàn dữ liệu Owner:**
   - 3 file manifest audio untracked của Owner (`AUDIO_SOURCES_MANIFEST.csv`, `AUDIO_SOURCES_MANIFEST.json`, `generate_audio_sources_manifest.mjs`) được giữ nguyên vẹn 100% và không bị stage.

---

## 5. THÔNG TIN COMMIT & CHECKPOINT

- **Tệp tin staged:**
  - `ASSETS_MANIFEST.json`
  - `Read/V1.5/Reports/HW_ASSET_01_MANIFEST_AUDIT.md`
- **Tệp tin KHÔNG stage:** Các file nhị phân MP3/atlas, các file untracked audio manifest ngoại lệ của Owner, bytecode cache `__pycache__`.
- **Commit Message:** `fix(assets): reconcile asset manifest with physical worktree resources`
- **Trạng thái:** Sẵn sàng commit và push lên nhánh `feat/v1.5.3-ag-world-polish`.
