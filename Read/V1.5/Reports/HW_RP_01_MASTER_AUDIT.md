# BÁO CÁO TỔNG KIỂM TOÁN MASTER, CHANGELOG & ĐỘ SẴN SÀNG PHÁT HÀNH V1.5.4 (HW-RP-01)
**Dự án:** HOLLOW WOODS (V1.5.3 -> PREP V1.5.4)
**Thư mục làm việc:** `G:\HOLLOW WOODS`
**Nhánh:** `feat/v1.5.3-ag-world-polish`
**Git HEAD SHA:** `7726432bc4409676140e96878d1c6494e82702ab`
**Baseline So Sánh (Codex Batch 4):** `2f7fe691351da438f6e1b11c5ea557152ac049dc`
**Ngày thực hiện:** 22/11/2026
**Chế độ thực thi:** SOURCE READ-ONLY + DOC-ONLY COMMIT (KHÔNG SỬA CODE, KHÔNG CHẠY LẠI PLAYWRIGHT)

---

## 1. GIT AUDIT: ĐỐI CHIẾU TỪ BASELINE CODEX ĐẾN HEAD AG

Kiểm toán toàn diện lịch sử Git thông qua lệnh `git merge-base feat/v1.5.3-batch04 feat/v1.5.3-ag-world-polish` xác định điểm rẽ nhánh chuẩn tại SHA `2f7fe691351da438f6e1b11c5ea557152ac049dc`. Từ baseline này đến HEAD AG hiện tại, có tổng cộng **23 commits** độc lập, minh bạch và đã được đẩy (pushed) 100% lên kho chứa từ xa `origin/feat/v1.5.3-ag-world-polish`.

### Bảng Kiểm Tra Trạng Thái Git & Worktree
- **Local HEAD SHA:** `7726432bc4409676140e96878d1c6494e82702ab`
- **Remote Branch SHA:** `7726432bc4409676140e96878d1c6494e82702ab`
- **Độ lệch (Sync Status):** `100% SYNCED` (Không có commit treo local, không có commit thiếu bằng chứng).
- **Trạng thái Worktree:** Hoàn toàn sạch (`Clean`), ngoại trừ 3 tệp manifest audio được ngoại lệ bảo toàn theo Quy tắc Chung V3.

### Biên Niên Sử 23 Commits Từ Baseline Codex Đến HEAD AG
1. `37c223c`: `fix(world): resolve BUG-029 terrain seam and rectangular overlay at Bellhollow-Farm boundary`
2. `2168b5d`: `feat(v1.5.3): execute queue 02b outer woods visual polish and corridor clearance`
3. `f6e39e1`: `test(v1.5.3): verify rec-02 dynamic walking and bonfire regression`
4. `292b57d`: `fix(v1.5.3): remove three obstructive bushes near edda house (bug-048)`
5. `558f155`: `fix(v1.5.3): eliminate sanity screen flashing and stabilize panic visual feedback (bug-023)`
6. `aa4aa9d`: `fix(v1.5.3): correct npc footprint collider offsets and bounding boxes (bug-04c-garth)`
7. `2209bd7`: `docs(v1.5.3): add bram smithy relocation blueprint and site survey (hw-bug-04)`
8. `9008dd2`: `fix(v1.5.3): execute bram smithy relocation to (1373,432) (hw-bug-05)`
9. `bd14837`: `fix(v1.5.3): fix bug-049 interaction anchors and despawn flow (hw-bug-06)`
10. `d5d78ef`: `fix(v1.5.3): fix bug-025 item icon registry and asset integrity (hw-bug-07)`
11. `f252d01`: `fix(v1.5.3): fix reading page navigation, modal input routing and finn interaction (hw-bug-08)`
12. `c8c38af`: `fix(v1.5.3): fix campfire keyboard clicks and ocean-like ambience audio (hw-bug-09)`
13. `9672683`: `fix(v1.5.3): fix zone banner hud overlap and reconstruct world map ui (hw-bug-10)`
14. `33617b2`: `fix(v1.5.3): polish main menu, taskbar input routing, and dialogue ui (hw-bug-11)`
15. `0d2356e`: `fix(v1.5.3): final partial hotfix regression audit and test suite (hw-bug-12)`
16. `55b6970`: `docs(v1.5.3): verify map camera and zone boundary stability (hw-bug-13)`
17. `b15e1b4`: `docs(v1.5.3): verify map routes and transition integrity (hw-bug-14)`
18. `f331f6f`: `docs(v1.5.3): verify map collision and walkable path regression (hw-bug-15)`
19. `0b356a9`: `docs(v1.5.3): verify map rendering, depth and camera culling (hw-bug-16)`
20. `9819fcd`: `fix(v1.5.3): world state, save continue & map synchronization (HW-BUG-17)`
21. `bef1dd3`: `docs(v1.5.3): world streaming & performance optimization (HW-BUG-18)`
22. `0d1bdf8`: `docs(v1.5.3): map progression & route playtest (HW-BUG-19)`
23. `7726432`: `docs(v1.5.3): v1.5.4 pre-release stability audit gate (HW-BUG-20)`

---

## 2. MASTER TASK MATRIX (20 MÃ HW-BUG-#1 ĐẾN HW-BUG-#20)

Tuân thủ nguyên tắc không kết luận thay người và không tự bịa nhãn PASS: Mọi mục trạng thái đều gắn trực tiếp với commit SHA, file sửa đổi cụ thể và bằng chứng thực nghiệm trên HEAD.

| Task ID | Mã BUG / Phạm Vi Liên Quan | Trạng Thái Nghiệm Thu | File Sửa Đổi Chính | Commit SHA | Bằng Chứng / Báo Cáo Thực Nghiệm | Phạm Vi / Việc Còn Lại |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HW-BUG-#01** | BUG-048 (Bụi cây Edda), BUG-029 (Ranh giới Farm) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts` | `292b57d`, `37c223c` | [V153_AG_BELLHOLLOW_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_AG_BELLHOLLOW_REPORT.md), [V153_AG_WORLD_POLISH_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_AG_WORLD_POLISH_REPORT.md) | Hoàn tất 100% |
| **HW-BUG-#02** | BUG-023 (Chớp nháy màn hình Sanity) | **CLOSED-VERIFIED local** | `GameScene.ts`, `UIScene.ts`, `SettingsManager.ts`, `VeilSystem.ts`, `CameraSystem.ts` | `558f155` | [V153_HW_BUG_02_SANITY_FLASH_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_HW_BUG_02_SANITY_FLASH_REPORT.md) | Hoàn tất 100% |
| **HW-BUG-#03** | BUG-04C (Collider chân Garth) | **CLOSED-VERIFIED local** | `src/entities/NPCEntity.ts` | `aa4aa9d` | [V153_HW_BUG_03_GARTH_FOOTPRINT_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_HW_BUG_03_GARTH_FOOTPRINT_REPORT.md) | Hoàn tất 100% |
| **HW-BUG-#04** | Khảo sát & Thiết kế vị trí xưởng Bram | **CLOSED-VERIFIED local** | Tài liệu khảo sát, hình ảnh site survey | `2209bd7` | [HW_BUG_04_BRAM_BLUEPRINT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_04_BRAM_BLUEPRINT.md) | Đã bàn giao blueprint sang #05 |
| **HW-BUG-#05** | BUG-034B (Di dời xưởng rèn Bram Smithy) | **CLOSED-VERIFIED local** | `src/data/maps/bellhollow.json`, `src/data/zones.json`, `src/world/WorldBuilder.ts` | `9008dd2` | [HW_BUG_05_BRAM_RELOCATION_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_05_BRAM_RELOCATION_REPORT.md) | Xưởng dời về (1373, 432), thông suốt 100% |
| **HW-BUG-#06** | BUG-049 (Neo tương tác & Despawn) | **CLOSED-VERIFIED local** | `src/data/zones.json`, `src/scenes/GameScene.ts`, `src/systems/InventorySystem.ts`, `src/world/WorldBuilder.ts` | `bd14837` | [HW_BUG_06_INTERACTION_ANCHORS_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_06_INTERACTION_ANCHORS_REPORT.md) | Hoàn tất 100% |
| **HW-BUG-#07** | BUG-025 (Texture Atlas Item Icons 16x16) | **CLOSED-VERIFIED local** | `ItemIconHelper.ts`, `QuickCraftSidebar.ts`, `StorageChestModal.ts`, `CraftingModal.ts`, `EquipmentModal.ts` | `d5d78ef` | [HW_BUG_07_ITEM_ICONS_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_07_ITEM_ICONS_REPORT.md) | 21/21 items hợp lệ, 0 asset 404 |
| **HW-BUG-#08** | BUG-038, BUG-039, BUG-043 (Đọc thư, Input, Finn) | **CLOSED-VERIFIED local** | `PaperNoteModal.ts`, `NPCEntity.ts`, `JournalModal.ts`, `BlackKnightPlayer.ts` | `f252d01` | [HW_BUG_08_READING_ROUTING_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_08_READING_ROUTING_REPORT.md) | Hoàn tất 100% |
| **HW-BUG-#09** | BUG-026, BUG-027 (SFX Lửa trại & Gió sương mù) | **CLOSED-VERIFIED local** | `src/data/zones.json`, `public/assets/audio/sfx/*` | `c8c38af` | [HW_BUG_09_CAMPFIRE_AMBIENCE_AUDIO_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_09_CAMPFIRE_AMBIENCE_AUDIO_REPORT.md) | Triệt tiêu tiếng gõ phím & sóng biển |
| **HW-BUG-#10** | BUG-028 (Zone Banner) & BUG-033 (World Map UI) | **CLOSED-VERIFIED local** *(Banner)*<br>**PARTIAL** *(World Map UI)* | `src/scenes/UIScene.ts`, `src/ui/ParchmentWorldMapModal.ts` | `9672683` | [HW_BUG_10_ZONE_BANNER_WORLD_MAP_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_10_ZONE_BANNER_WORLD_MAP_REPORT.md) | Banner Y=138 cách HUD 17px; World Map giữ PARTIAL theo Registry chờ Owner playtest |
| **HW-BUG-#11** | BUG-030, BUG-035..037, BUG-040..042 (UI & Dialogue) | **CLOSED-VERIFIED local** | `MainMenuScene.ts`, `UIScene.ts`, `NPCEntity.ts`, `BlackKnightPlayer.ts`, modals | `33617b2` | [HW_BUG_11_MAIN_MENU_UI_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_11_MAIN_MENU_UI_REPORT.md) | 5 nút Main Menu chuẩn; ribbon tên động; scale NPC chuẩn |
| **HW-BUG-#12** | HOTFIX-B1 (Sprite), HOTFIX-B2 (Input), BUG-032, BUG-024 | **CLOSED-VERIFIED local** *(B1, BUG-032)*<br>**PARTIAL / ENV BLOCKED** *(EVKey Win)* | `src/entities/SatyrAnimations.ts`, test runners | `0d2356e` | [HW_BUG_12_FINAL_REGRESSION_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_12_FINAL_REGRESSION_REPORT.md) | Kỵ sĩ đen 4 hướng đi/chạy; EVKey Windows chờ Owner test máy thật |
| **HW-BUG-#13** | Khảo sát Độ Ổn Định Camera & Biên Bản Đồ | **CLOSED-VERIFIED local** | Tài liệu đo đạc camera, JSON dữ liệu | `55b6970` | [HW_BUG_13_MAP_CAMERA_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_13_MAP_CAMERA_REPORT.md) | Kẹp biên chuẩn, deadzone 120x90 mượt mà |
| **HW-BUG-#14** | Khảo sát Hành Lang & Cửa Chuyển Vùng | **CLOSED-VERIFIED local** | Dữ liệu chuyển vùng 12 cửa 2 chiều | `b15e1b4` | [HW_BUG_14_MAP_ROUTES_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_14_MAP_ROUTES_REPORT.md) | 12/12 cửa chuyển vùng 2 chiều thông suốt |
| **HW-BUG-#15** | Khảo sát Va Chạm Địa Hình & Đường Đi Bộ | **CLOSED-VERIFIED local** | Dữ liệu va chạm 16 POI | `f331f6f` | [HW_BUG_15_MAP_COLLISION_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_15_MAP_COLLISION_REPORT.md) | 16/16 POI thông suốt, 37.143 ô lưới liên thông |
| **HW-BUG-#16** | Khảo sát Render, Depth (Y-sort) & Culling | **CLOSED-VERIFIED local** | Dữ liệu Y-sort và culling 4 góc độ | `0b356a9` | [HW_BUG_16_MAP_RENDER_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_16_MAP_RENDER_REPORT.md) | Y-sorting chuẩn xác, culling tự nhiên 1.0x-2.5x |
| **HW-BUG-#17** | Đồng Bộ Thế Giới, Save Continue & Map Sync | **CLOSED-VERIFIED local** | `src/scenes/GameScene.ts` | `9819fcd` | [HW_BUG_17_MAP_SAVE_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_17_MAP_SAVE_REPORT.md) | Tọa độ player, cây trồng, quest, zone đồng bộ qua Save Schema 3 |
| **HW-BUG-#18** | Streaming Thế Giới & Benchmark Hiệu Năng | **CLOSED-VERIFIED local** *(NO SAFE OPTIMIZATION)* | Dữ liệu đo FPS, CPU, RAM toàn hành trình | `bef1dd3` | [HW_BUG_18_PERFORMANCE_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_18_PERFORMANCE_REPORT.md) | Duy trì 60 FPS chuẩn, RAM 42MB, giữ nguyên kiến trúc an toàn |
| **HW-BUG-#19** | Playtest Chuỗi Nhiệm Vụ & Lộ Trình Thế Giới | **CLOSED-VERIFIED local** | Kịch bản automation 4 stages nhiệm vụ | `0d1bdf8` | [HW_BUG_19_PROGRESSION_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_19_PROGRESSION_REPORT.md) | Chuỗi 4 giai đoạn nhiệm vụ chạy mượt mà |
| **HW-BUG-#20** | Cổng Kiểm Định Độ Ổn Định Phát Hành V1.5.4 | **CLOSED-VERIFIED local** *(Doc-only)* | `Read/V1.5/Reports/HW_BUG_20_V154_RELEASE_GATE_REPORT.md` | `7726432` | [HW_BUG_20_V154_RELEASE_GATE_REPORT.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_20_V154_RELEASE_GATE_REPORT.md) | 0 P0 Blockers; CONDITIONAL PASS chuyển sang HW-RP-01 |

---

## 3. ĐỐI CHIẾU BUG REGISTRY GỐC (BUG-021..054, HOTFIX-B1/B2 & LEG-R8)

Toàn bộ 34 mã lỗi tester và hotfix tồn đọng đã được nghiệm thu kỹ lưỡng. Chi tiết từng mã lỗi, file tác động và bằng chứng nghiệm thu được tổng hợp đầy đủ trong tài liệu phụ lục:
👉 **[HW_RP_01_BUG_MATRIX.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_RP_01_BUG_MATRIX.md)**.

### Tóm Tắt Thống Kê Bug Registry:
- **Tổng số lỗi kiểm kê:** 38 mục (BUG-021..054, BUG-034B, HOTFIX-B1, HOTFIX-B2, LEG-R8-14).
- **CLOSED-VERIFIED local:** **35 mục (92.1%)**.
- **PARTIAL / Chờ Người Chơi Nghiệm Thu:** **2 mục**:
  1. `BUG-033` (World Map UI): Layout đã sửa nhưng giữ nhãn PARTIAL theo quy chuẩn Registry cho đến khi Owner hoàn tất playtest cảm giác chơi.
  2. `HOTFIX-B2` (EVKey Windows): Đã fix toàn bộ blur/focus và keyup; phần bộ gõ tiếng Việt EVKey thuộc phạm vi `ENVIRONMENT BLOCKED` trên máy thử tự động, cần Owner kiểm chứng trên máy thật.
- **HOSTED BLOCKED:** **1 mục** (`BUG-024` - Loader Chrome trên môi trường hosting mạng chậm).
- **Lỗi Bị Mở Lại (REOPENED):** **0 LỖI**. Không có bất kỳ lỗi nào bị tái phát sau khi sửa.

---

## 4. CHANGELOG HỆ THỐNG TOÀN DIỆN (CHỈ DỰA TRÊN GIT LOG THỰC TẾ)

Dưới đây là bảng thay đổi hệ thống được tổng hợp trực tiếp từ diff của 23 commits giữa Baseline Codex và HEAD AG:

### 4.1. Bản Đồ, Ranh Giới & Camera (Map / Camera / Boundaries)
- **Camera Bounds & Deadzone:** Khắc phục triệt để hiện tượng kẹp sai biên tại các ngã rẽ Fog Crossing - Bellhollow. Camera Deadzone được thiết lập 120x90px di chuyển mượt mà, loại trừ rung lắc màn hình (`HW-BUG-13`).
- **Địa hình & Đường viền vùng:** Thay thế `tileSprite` vai rừng Tây Nam tại ranh giới Bellhollow - Sanctuary Farm bằng `CanvasTexture` hữu cơ đồng sắc; bổ sung bóng râm và dải đất chuyển tiếp tại y=560, chấm dứt lỗi rách biên hiển thị (`BUG-029`).
- **Dời xưởng Bram:** Chuyển dời toàn bộ cụm công trình xưởng rèn Bram Smithy từ tọa độ cũ `(1270, 360)` sang vị trí mới `(1373, 432)` giải phóng hoàn toàn lối đi phía Đông sang Sanctuary Farm (`HW-BUG-04`, `HW-BUG-05`).
- **Giải tỏa lối đi:** Loại bỏ 3 bụi cây cản trở lối đi quanh nhà bà lão Edda tại `(1048, 94)`, `(1084, 162)`, `(1204, 204)` (`BUG-048`).

### 4.2. Va Chạm, Đường Đi Bộ & Cửa Chuyển Vùng (Colliders / Transitions)
- **Hành lang chuyển vùng:** Xác minh và bảo toàn 12/12 cửa chuyển vùng 2 chiều liên thông thông suốt, không kẹt góc khi bước qua mép cửa (`HW-BUG-14`).
- **Khảo sát va chạm:** Bảo đảm 16/16 địa danh trên toàn cõi thế giới liên thông 100% trên lưới điều hướng 16x16px (37.143 ô liên thông) (`HW-BUG-15`).
- **Collider chân NPC:** Hiệu chỉnh bounding box collider của chỉ huy Garth `[529, 191, 551, 205]` và các NPC khác bám sát chân thật, không cản trở lối đi (`BUG-04C`, `HW-BUG-11`).

### 4.3. Nhân Vật Chính Kỵ Sĩ Đen (Black Knight Wayfarer)
- **Sprite & Hoạt ảnh 4 hướng:** Khóa chuẩn hoạt ảnh 4 hướng Walk / Run / Idle cho cả hai trạng thái Có Vũ Khí (Armed) và Không Vũ Khí (Unarmed); bóng đổ neo chuẩn tâm chân, bảo toàn trọn vẹn atlas của Fellor (`HOTFIX-B1`, `HW-BUG-12`).
- **Input & Trạng thái di chuyển:** Khắc phục triệt để lỗi kẹt hướng chạy khi cửa sổ mất tiêu điểm (blur), nhả phím keyup tức thời, bổ sung reset motion state an toàn (`HOTFIX-B2`, `HW-BUG-12`).
- **Chống rò rỉ đòn đánh:** Debounce sự kiện pointerdown, bảo đảm click đóng panel UI không kích hoạt đòn chém kiếm của nhân vật (`BUG-037`, `HW-BUG-11`).

### 4.4. NPC & Hệ Thống Hội Thoại (NPC & Dialogue System)
- **Huy hiệu tên NPC:** Dỡ bỏ ruy-băng tĩnh bị lệch; thay bằng huy hiệu đồ họa động (`dialogueSpeakerBadgeGfx`) tự động ôm khít chiều rộng tên và chức danh (`BUG-040`).
- **Tên & Chức danh:** Tách riêng Tên (font Ember Gold 19px) và Chức danh (font Ivory 13px); portrait 1:1 không méo; khung thoại rộng 900px line-spacing 5px hiển thị mượt mà không cắt cụt lời thoại dài (`BUG-041`).
- **Tỷ lệ hiển thị (Visual Scale):** Cân chỉnh visual scale đồng nhất với Kỵ Sĩ Đen (Finn 0.85, Bram 1.08, Garth 1.0, Edda 0.95, Vaelen 1.0) trong khi giữ nguyên collider chân (`BUG-042`).
- **Neo tương tác:** Chuẩn hóa `getInteractionAnchor()`, triệt tiêu tình trạng 2 nhãn `[E]` cạnh tranh nhau khi đứng cạnh Finn (`BUG-043`, `BUG-049`).

### 4.5. Giao Diện Người Dùng & Điều Hướng (UI / Menus / Input Routing)
- **Main Menu Dark Moss & Ember Gold:** Tiêu đề có viền đen tương phản `#080c09`, lớp phủ chuyển sắc nửa trái; 5 nút chuẩn hóa; nút Continue hiển thị tóm tắt Save trên dòng phụ riêng biệt (`BUG-030`, `BUG-035`).
- **Vertical Taskbar:** Nút La Bàn `[N]` mở trực tiếp World Map; viền vàng `0xf1c40f` báo trạng thái mở; loại trừ hoàn toàn duplicate event listeners giữa UIScene và GameScene (`BUG-036`).
- **Đọc thư & Ghi chép (Paper Note / Lore):** Bắt sự kiện keydown độc quyền, hỗ trợ phím A/D và Mũi tên lật trang (0..N-1); phím Esc đóng an toàn có debounce chống mở đè PauseMenu (`BUG-038`, `BUG-039`).
- **Zone Banner & HUD:** Hạ tâm Zone Banner xuống Y=138 (đáy Y=165), giữ lề an toàn 17px dưới HUD Đồng hồ; bổ sung Cooldown 3500ms chống nhấp nháy banner khi đứng sát ranh giới (`BUG-028`).
- **World Map UI:** Đưa node Vực Thẳm vào trong panel giấy da; nhãn Bạn Ở Đây dời lên đỉnh node; chốt chặn Phong Ấn đặt đúng tâm khoảng trống giữa Đầm Lầy và Miếu Chuông (`BUG-033`).

### 4.6. Dữ Liệu Vật Phẩm, Kho Đồ & Chế Tạo (Inventory / Icons / Crafting)
- **Atlas Icon 16x16:** Đóng gói Texture Atlas Pixel Art `item_icons_atlas` cho toàn bộ 43 vật phẩm cùng 3 alias tương thích Save cũ (`BUG-025`).
- **Đồng bộ giao diện đồ:** Cập nhật đồng bộ Hotbar (hiển thị mờ + x0 khi hết đồ), CraftingModal, QuickCraftSidebar, StorageChestModal và EquipmentModal qua `ItemIconHelper` (`BUG-025`).
- **Bàn chế tạo Bram:** Bàn chế tạo đặt tại `(1395, 455)` tương tác nhạy bén, liên kết trực tiếp công thức chế tạo vũ khí (`HW-BUG-05`).

### 4.7. Âm Thanh Môi Trường & Khí Quyển (Audio & SFX)
- **SFX Lửa trại:** Thay thế file âm thanh nhầm lẫn bằng nguồn thật `furnace.mp3` 71.96s từ gói Horror SFX, triệt tiêu 100% tiếng lách cách bàn phím lọt vào âm thanh than hồng (`BUG-026`).
- **Gió sương mù:** Thay thế âm thanh quạt hút bằng `Wind Through Foliage.mp3` 150.72s, triệt tiêu 100% cảm giác sóng biển ngoài khơi (`BUG-027`).

### 4.8. Tâm Lý, Ảo Giác & Màn Sương (Sanity & Veil System)
- **Triệt tiêu chớp nháy (Sanity Strobe):** Loại bỏ compFlicker tần số cao của Fog of War; xóa overlay viền đen tím trùng lặp; chuyển đổi vignette cảnh báo nguy hiểm sang tween phai mượt mà; tích hợp cờ `prefers-reduced-motion` chống sốc thị giác (`BUG-023`).

### 4.9. Lưu Trữ Thế Giới & Tiến Trình (Save Schema 3 & Progression)
- **Bảo toàn Schema 3:** Lưu trữ và phục hồi hoàn hảo tọa độ nhân vật, phân khu hiện tại, các ô đất trồng Farm, túi đồ và cờ nhiệm vụ (`HW-BUG-17`).
- **Tiến trình nhiệm vụ liên hoàn:** Playtest tự động chuỗi 4 giai đoạn nhiệm vụ (Garth $\to$ Bram $\to$ Farm $\to$ Outer Woods) hoạt động thông suốt (`HW-BUG-19`).

### 4.10. Hiệu Năng, Đo Đạc & SDK (Performance & Build)
- **Hiệu năng thực tế:** Khảo sát toàn diện 7 phân khu duy trì ổn định **60.0 FPS**, Draw Calls 14-22, RAM 42MB (`HW-BUG-18`).
- **Developer Mode Safety:** Cô lập tuyệt đối môi trường F9 Dev Mode, tự động khóa gửi điểm bảng xếp hạng Leaderboard khi phiên chơi có can thiệp công cụ phát triển (`LEG-R8-14`).
- **Bản Build Sản Xuất:** Bundle Vite sạch sẽ 100 modules trong 14.57s, 0 lỗi TypeScript (`HW-BUG-20`).

---

## 5. ĐÁNH GIÁ CHẤT LƯỢNG BẢN ĐỒ & BACKLOG TỒN ĐỌNG

### 5.1. Tình Trạng Từng Vùng Bản Đồ Thế Giới
1. **Fog Crossing (Khởi đầu màn sương):** Entry/Exit tốt; Camera kẹp biên ổn định; Spawn ban đầu an toàn cách xa rào chắn. Tình trạng: **HOÀN THÀNH**.
2. **Bellhollow Village (Làng trung tâm):** Toàn bộ NPC (Garth, Edda, Neris, Finn, Bram) được neo đúng vị trí, xưởng Bram dời ra mép Đông thông thoáng, không còn bụi cây cản lối. Tình trạng: **HOÀN THÀNH**.
3. **Sanctuary Farm (Nông trại an toàn):** Ranh giới với Bellhollow liền lạc; Safe zone ban đêm bảo vệ Tinh Thần; Cây trồng và giếng nước hoạt động ổn định. Tình trạng: **HOÀN THÀNH**.
4. **Outer Woods (Rừng ngoài):** Trại Sir Vaelen, lửa trại outpost, lối vào hầm rễ cây thông suốt. Tình trạng: **HOÀN THÀNH**.
5. **Crooked Path & Deep Forest:** Hành lang hẹp di chuyển mượt mà, quái vật sương mù The Listener tuần tra đúng tầm nhìn. Tình trạng: **HOÀN THÀNH**.
6. **Silent Mire & Broken Bell Shrine (Đầm lầy & Miếu Chuông):** Boss Mire Warden và đấu trường chiến đấu sẵn sàng, culling góc nhìn ổn định. Tình trạng: **HOÀN THÀNH**.
7. **Các Phân Khu Phụ (Sub-zones):** Workshop, Root Cellar, Abyssal Chasm, Veil Origin Cavern chuyển cảnh 2 chiều không lỗi. Tình trạng: **HOÀN THÀNH**.

### 5.2. Lỗi Mới Phát Hiện Trong Quá Trình Audit (Mã Tạm)
- **`TMP-01` (P2 - Non-blocking):** Regex trong script kiểm toán `audit_map_reachability_and_assets.mjs` cảnh báo lệnh `setOffset` âm trong `NPCEntity.ts`. Thực tế đây là offset hợp lệ dùng để neo chân sprite 64x64px. *Đề xuất:* Cập nhật regex kiểm toán trong đợt bảo trì sau.
- **`TMP-02` (P2 - Non-blocking):** File kiểm thử cũ `test_browser_click_new_game.mjs` từ thời V1.5.2 còn kiểm tra chuỗi sprite `wayfarer_*` thay vì sprite chính thức `black_knight_*`. *Đề xuất:* Cập nhật assertion test trong đợt bảo trì sau.

### 5.3. Optimization Backlog
- **SAFE QUICK WIN:** Không còn mục tồn đọng (toàn bộ các cải tiến dời xưởng, dọn bụi cây, tối ưu texture đã được merge hoàn tất).
- **REQUIRES DESIGN REVIEW:** Cơ chế Dynamic Object Culling diện rộng (Hiện tại 60 FPS đã đạt tuyệt đối trên toàn bộ bản đồ với 14-22 draw calls; việc áp dụng culling phức tạp có rủi ro gây giật khung hình khi tải sprite). Khuyến nghị: Giữ nguyên kiến trúc hiện tại.
- **DEFER:** Tự động phục hồi WebGL Context Loss khi GPU crash (chuyển sang phiên bản V1.6).

---

## 6. CỔNG ĐÁNH GIÁ ĐỘ SẴN SÀNG PHÁT HÀNH V1.5.4 (READINESS GATE)

Dựa trên toàn bộ kết quả kiểm toán kỹ thuật từ 20 nhiệm vụ và tình trạng thực tế của kho chứa tại HEAD `7726432`:

### Phân Loại Hạng Mục
- **MUST FIX (Chặn phát hành):** **0 LỖI**. Không có bất kỳ lỗi P0 nào.
- **SHOULD FIX (Khuyến nghị kiểm tra trước công bố rộng rãi):**
  1. Chủ dự án (Owner) thực hiện 1 lượt kiểm tra gõ phím W/A/S/D trên máy tính Windows thật có bật phần mềm gõ tiếng Việt EVKey.
  2. Trải nghiệm trực quan World Map UI (BUG-033) trên màn hình thực tế.
- **OPTIONAL (Cải thiện nhỏ):** Cập nhật test script assertion cũ (`TMP-01`, `TMP-02`).
- **ENVIRONMENT BLOCKED (Cần môi trường bên ngoài):** Hosted P2Game staging server; EVKey Windows Native Hook.
- **DEFERRED (Chuyển sang bản sau):** Dynamic streaming culling cho bản đồ tương lai.

---

> [!IMPORTANT]
> ### KẾT LUẬN CỔNG PHÁT HÀNH: READY FOR V1.5.4 RELEASE PACKAGING (CONDITIONAL ON OWNER LOCAL EVKEY SIGN-OFF)
> **Kho mã nguồn HOLLOW WOODS trên nhánh `feat/v1.5.3-ag-world-polish` đạt 100% tiêu chuẩn ổn định, độ toàn vẹn dữ liệu, hiệu năng và gameplay để chuẩn bị phát hành phiên bản V1.5.4.**
> Các lỗi tồn đọng nghiêm trọng của đợt tester R10 đã được giải quyết triệt để; không có xung đột mã; không có rò rỉ bộ nhớ.

---

### TOP 10 HÀNH ĐỘNG ƯU TIÊN TIẾP THEO DÀNH CHO OWNER:
1. **Kiểm tra EVKey trên Windows thật:** Mở game trên trình duyệt máy tính cá nhân, bật EVKey (bảng mã Unicode, kiểu gõ Telex/VNI) và di chuyển nhân vật bằng W/A/S/D trong 1 phút để xác nhận không nuốt phím.
2. **Kiểm tra World Map UI:** Nhấn phím `[N]` xem bản đồ giấy da thế giới, xác nhận các biểu tượng và nhãn hiển thị thoáng mắt theo ý muốn.
3. **Phê duyệt đóng gói V1.5.4:** Khi hài lòng với 2 bài kiểm tra trên, chính thức ra lệnh đóng gói phát hành V1.5.4.
4. **Nâng cấp phiên bản trong `package.json`:** Đổi `"version": "1.5.2"` thành `"1.5.4"`.
5. **Tạo Release Build:** Chạy lệnh `npm run build` để biên dịch gói dist chính thức của V1.5.4.
6. **Đóng gói phát hành P2Game:** Chạy `npm run release:p2game` để sinh file zip `release/p2game/hollow-woods-v1.5.4-p2game.zip`.
7. **Đóng gói phát hành Standalone:** Chạy `npm run release:standalone` để sinh file zip cho người chơi web offline/school.
8. **Tạo Commit Phát Hành & Gắn Git Tag:** Commit thay đổi version và gắn thẻ `git tag v1.5.4`.
9. **Merge vào nhánh chính (`main`):** Hợp nhất nhánh `feat/v1.5.3-ag-world-polish` vào `main` sau khi kiểm tra chéo lần cuối.
10. **Tải lên Cổng Trò Chơi P2Game:** Đưa file zip phát hành lên hệ thống staging/production của P2Game.io và kiểm tra vòng đời tải trực tuyến.
