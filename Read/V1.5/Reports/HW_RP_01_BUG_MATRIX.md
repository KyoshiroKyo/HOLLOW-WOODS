# PHỤ LỤC: MA TRẬN CHI TIẾT BUG REGISTRY V1.5.3 (HW-RP-01)
**Dự án:** HOLLOW WOODS (V1.5.3 -> PREP V1.5.4)
**Nhánh:** `feat/v1.5.3-ag-world-polish`
**Git HEAD SHA:** `7726432bc4409676140e96878d1c6494e82702ab`
**Ngày kiểm định:** 22/11/2026
**Chế độ:** DOC-ONLY AUDIT APPENDIX

---

## MA TRẬN CHI TIẾT TỪNG MÃ LỖI (BUG-021 ĐẾN BUG-054 & HOTFIX/LEG-R8)

| Mã BUG | Trạng thái Trước (Baseline) | Trạng thái Hiện tại (HEAD) | File Đã Sửa Đổi / Tác Động | Commit SHA | Nghiệm Thu Thực Tế & Ghi Chú | Reopened? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-021** | OPEN (Camera Bellhollow & Fog xung đột) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts`, `src/systems/camera/CameraSystem.ts` | Baseline / `37c223c` | Camera chuyển vùng theo tọa độ chân, bounds liên tục. | **KHÔNG** |
| **BUG-022** | OPEN (Farm thiếu an toàn ban đêm) | **CLOSED-VERIFIED local** | `src/systems/SurvivalSystem.ts`, `src/data/zones.json` | Baseline | Đã bổ sung Farm vào safe zone; đêm không còn drain Tinh Thần. | **KHÔNG** |
| **BUG-023** | OPEN (Chớp nháy màn hình Sanity) | **CLOSED-VERIFIED local** | `src/scenes/GameScene.ts`, `src/scenes/UIScene.ts`, `src/systems/SettingsManager.ts`, `src/systems/VeilSystem.ts`, `src/systems/camera/CameraSystem.ts` | `558f155` | Triệt tiêu compFlicker tần số cao; tween phai mượt mà; 8/8 regression tests PASS. | **KHÔNG** |
| **BUG-024** | OPEN (Chrome báo reload khi nạp audio) | **CLOSED-VERIFIED production local · HOSTED BLOCKED** | `src/scenes/PreloadScene.ts`, `public/assets/audio/` | Baseline / `0d2356e` | Tệp WAV PCM 44.1kHz giải mã chuẩn; chỉ hiển thị Reload khi đứng tải thực tế. | **KHÔNG** |
| **BUG-025** | OPEN (Thiếu / lỗi icon vật phẩm) | **CLOSED-VERIFIED local** | `src/utils/ItemIconHelper.ts`, `src/ui/QuickCraftSidebar.ts`, `src/ui/StorageChestModal.ts`, `src/ui/CraftingModal.ts`, `src/ui/EquipmentModal.ts` | `d5d78ef` | Tạo Texture Atlas 16x16 cho 43 items + 3 alias; 6/6 Playwright test PASS. | **KHÔNG** |
| **BUG-026** | OPEN (SFX lửa trại nghe như gõ phím) | **CLOSED-VERIFIED local** | `src/data/zones.json`, `public/assets/audio/sfx/ambience_village.mp3` | `c8c38af` | Thay thế bằng `furnace.mp3` 71.96s; triệt tiêu 100% tiếng ticking click. | **KHÔNG** |
| **BUG-027** | OPEN (SFX môi trường nghe như sóng biển) | **CLOSED-VERIFIED local** | `src/data/zones.json`, `public/assets/audio/sfx/ambience_crossing.mp3` | `c8c38af` | Thay thế bằng `Wind Through Foliage.mp3` 150.72s; triệt tiêu cảm giác sóng biển. | **KHÔNG** |
| **BUG-028** | OPEN (Zone Banner che HUD Đồng hồ) | **CLOSED-VERIFIED local** | `src/scenes/UIScene.ts` | `9672683` | Hạ tâm banner xuống Y=138 (đáy Y=165), lề an toàn 17px dưới đồng hồ. | **KHÔNG** |
| **BUG-029** | OPEN (Vết rách địa hình Bellhollow - Farm) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts` | `37c223c` | Thay tileSprite vai rừng bằng CanvasTexture đồng sắc; thêm bóng râm và dải đất chuyển tiếp. | **KHÔNG** |
| **BUG-030** | OPEN (Tiêu đề Main Menu bị lóa / chìm) | **CLOSED-VERIFIED local** | `src/scenes/MainMenuScene.ts` | `33617b2` | Thêm viền stroke tương phản #080c09; lớp phủ chuyển sắc Dark Moss & Ember Gold. | **KHÔNG** |
| **BUG-031** | OPEN (Hai bảng Dev xuất hiện đồng thời) | **CLOSED-VERIFIED local** | `src/systems/DeveloperModeManager.ts` | Baseline | Gom profiler vào tab Log & Hiệu năng; F10 giữ bảng benchmark độc lập. | **KHÔNG** |
| **BUG-032** | OPEN (Nhầm lẫn bộ đếm va chạm & body) | **CLOSED-VERIFIED local** | `src/systems/DeveloperModeManager.ts` | `0d2356e` | Tách biệt collider pairs (4 active) và physical bodies (247 static, 8 dynamic); 731 animations 0 frame rác. | **KHÔNG** |
| **BUG-033** | PARTIAL (Bố cục World Map [N]) | **PARTIAL** *(Quy định Registry)* | `src/ui/ParchmentWorldMapModal.ts` | `9672683` | Đã đưa node Vực Thẳm vào trong panel, nhãn Bạn Ở Đây dời lên đỉnh, chốt chặn vào tâm. Giữ nhãn PARTIAL chờ Owner trải nghiệm. | **KHÔNG** |
| **BUG-034** | OPEN (Mảng xám công trình thợ rèn cũ) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts` | Baseline | Dùng TX Wall tường đá, cửa thông gió khớp body. | **KHÔNG** |
| **BUG-034B**| OPEN (Dời xưởng Bram tránh chặn đường) | **CLOSED-VERIFIED local** | `src/data/maps/bellhollow.json`, `src/data/zones.json`, `src/world/WorldBuilder.ts` | `9008dd2` | Dời toàn bộ cụm xưởng sang (1373, 432); giải phóng hành lang sang Farm 100%. | **KHÔNG** |
| **BUG-035** | OPEN (Bố cục Main Menu chưa chuẩn UX) | **CLOSED-VERIFIED local** | `src/scenes/MainMenuScene.ts` | `33617b2` | Đúng 5 nút chuẩn Dark Moss & Ember Gold; Continue hiển thị trạng thái Save riêng biệt. | **KHÔNG** |
| **BUG-036** | OPEN (Thanh công cụ dọc lệch phím/chuột) | **CLOSED-VERIFIED local** | `src/scenes/UIScene.ts`, `src/scenes/GameScene.ts` | `33617b2` | La bàn [N] kích hoạt trực tiếp World Map; viền vàng 0xf1c40f báo trạng thái mở; khử duplicate event. | **KHÔNG** |
| **BUG-037** | OPEN (Click-away cướp focus / rò input) | **CLOSED-VERIFIED local** | `src/entities/BlackKnightPlayer.ts`, modals | `33617b2` | Click ngoài đóng modal an toàn; debounce chống rò rỉ đòn đánh gameplay khi đóng panel. | **KHÔNG** |
| **BUG-038** | OPEN (Liệt phím A/D khi đọc thư) | **CLOSED-VERIFIED local** | `src/ui/PaperNoteModal.ts`, `src/ui/JournalModal.ts` | `f252d01` | Thay thế update polling bằng keydown capture độc quyền; hỗ trợ lật trang 0..N-1. | **KHÔNG** |
| **BUG-039** | OPEN (Rò rỉ input & Pause chồng khi đóng thư)| **CLOSED-VERIFIED local** | `src/ui/PaperNoteModal.ts`, `src/entities/BlackKnightPlayer.ts` | `f252d01` | Esc debounce 300ms chống trùng Pause; cất vào Sổ Tay 1 lần duy nhất, chống duplicate lore. | **KHÔNG** |
| **BUG-040** | OPEN (Ruy-băng tên thoại méo mó) | **CLOSED-VERIFIED local** | `src/scenes/UIScene.ts` | `33617b2` | Thay ribbon tĩnh bằng badge đồ họa động `dialogueSpeakerBadgeGfx` tự co giãn ôm chữ. | **KHÔNG** |
| **BUG-041** | OPEN (Text thoại dài bị cắt cụt / portrait méo)| **CLOSED-VERIFIED local** | `src/scenes/UIScene.ts` | `33617b2` | Tách riêng Tên (Ember Gold) và Chức danh (Ivory); text wrap 900px line-spacing 5px; portrait 1:1. | **KHÔNG** |
| **BUG-042** | OPEN (Scale NPC không đồng nhất với Kỵ Sĩ) | **CLOSED-VERIFIED local** | `src/entities/NPCEntity.ts` | `33617b2` | Chuẩn hóa scale visual: Finn 0.85, Bram 1.08, Garth 1.0, Edda 0.95, Vaelen 1.0; giữ nguyên collider. | **KHÔNG** |
| **BUG-043** | OPEN (Trùng lặp 2 nhãn [E] cạnh Finn) | **CLOSED-VERIFIED local** | `src/entities/NPCEntity.ts`, `src/scenes/GameScene.ts` | `f252d01` | Gỡ hardcode [E] nameplate; thêm `setTargeted(targeted)`; ưu tiên tương tác thư mới đọc. | **KHÔNG** |
| **BUG-044** | OPEN (Luống Graphics chắn nhà Neris) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts` | Baseline | Dời luống đồ họa khỏi hành lang; biển báo tại (695, 511). | **KHÔNG** |
| **BUG-045** | OPEN (Trạm lính Tây & Garth xoay cổng) | **CLOSED-VERIFIED local** | `src/data/zones.json`, `src/world/WorldBuilder.ts` | Baseline | Garth đặt tại (540, 205); rotation = 0 qua cổng. | **KHÔNG** |
| **BUG-046** | OPEN (Finn lệch vị trí và tuần tra) | **CLOSED-VERIFIED local** | `src/data/zones.json`, `src/entities/NPCEntity.ts` | Baseline | Finn chân (909, 231), patrol 901-914 ổn định. | **KHÔNG** |
| **BUG-047** | OPEN (Cột đèn (900,335) chắn đường) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts` | Baseline | Gỡ cột đèn chắn; bảo toàn bếp, lều, rương. | **KHÔNG** |
| **BUG-048** | OPEN (3 bụi cây cản lối quanh nhà Edda)| **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts` | `292b57d` | Xóa 3 bụi cây tại (1048,94), (1084,162), (1204,204); lối đi quanh nhà Edda thông suốt. | **KHÔNG** |
| **BUG-049** | OPEN (Lệch neo tương tác & rương mở 2 lần)| **CLOSED-VERIFIED local** | `src/data/zones.json`, `src/scenes/GameScene.ts`, `src/systems/InventorySystem.ts`, `src/world/WorldBuilder.ts` | `bd14837` | Thống nhất world anchor `getInteractionAnchor()`; outline sát chân; chống nhặt trùng quest item. | **KHÔNG** |
| **BUG-050** | OPEN (Cây sồi manh mối chưa tương tác) | **CLOSED-VERIFIED local** | `src/world/WorldBuilder.ts`, `src/data/zones.json` | Baseline | Cây sồi (760, 120) mở manh mối chuẩn; cờ giữ qua Continue. | **KHÔNG** |
| **BUG-051** | OPEN (Thoại Garth ghi sai cờ cổng Đông) | **CLOSED-VERIFIED local** | `src/data/dialogues.json`, `src/world/WorldGatingSystem.ts` | Baseline | Đồng bộ cờ mở cổng và điều kiện khóa; đi bộ qua Cổng Đông thông suốt. | **KHÔNG** |
| **BUG-052** | OPEN (Nhánh mở cổng Garth / Edda / Neris) | **CLOSED-VERIFIED local** | `src/world/WorldGatingSystem.ts`, `src/data/dialogues.json` | Baseline | Cả 3 NPC mở cổng chuẩn khi xong thoại; Esc giữ khóa; Continue bảo toàn. | **KHÔNG** |
| **BUG-053** | OPEN (HUD Tracker không hiện quest mới) | **CLOSED-VERIFIED local** | `src/scenes/UIScene.ts`, `src/systems/QuestManager.ts` | Baseline | HUD cập nhật ngay khi nhận quest Edda, Giữ Lửa, Dấu Vết Đồng Đội. | **KHÔNG** |
| **BUG-054** | OPEN (Lệch trạng thái Quest giữa HUD & Sổ Tay)| **CLOSED-VERIFIED local** | `src/scenes/UIScene.ts`, `src/ui/JournalModal.ts`, `src/systems/QuestManager.ts` | Baseline | HUD, Sổ Tay, World Map và Continue thống nhất 100% dữ liệu quest. | **KHÔNG** |
| **HOTFIX-B1**| PARTIAL (Hoạt ảnh Black Knight 4 hướng) | **CLOSED-VERIFIED local** | `src/entities/SatyrAnimations.ts`, atlas | `0d2356e` | 4 hướng Walk/Run Armed/Unarmed chuẩn; bóng đổ neo đúng; 0 sprite lệch. | **KHÔNG** |
| **HOTFIX-B2**| PARTIAL (Kẹt phím W/A/S/D / IME EVKey) | **PARTIAL / ENV BLOCKED** | `src/scenes/GameScene.ts`, `src/entities/BlackKnightPlayer.ts` | `0d2356e` | Blur/Focus, keyup, reset movement state hoàn tất; EVKey Windows chờ Owner test máy thật. | **KHÔNG** |
| **LEG-R8-14**| OPEN (Developer Mode leak điểm Leaderboard) | **CLOSED-VERIFIED local** | `src/systems/DeveloperModeManager.ts`, `src/services/LeaderboardService.ts` | Baseline / `test_v153_dev_score_safety.mjs` | Kích hoạt F9 tự động khóa gửi điểm vĩnh viễn trong phiên; test tự động PASS. | **KHÔNG** |
