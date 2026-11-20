# V153 CLOUD-01A — Trích xuất Black Knight và cô lập artwork legacy

**20/11/2026 · HOLLOW WOODS — The Fog That Remembers**

Đã trích xuất **34 chuỗi, 324 frame PNG RGBA, 34 metadata JSON và 4 contact sheet** từ Black Knight v1.0 của Fellor / BitBlast Studio. Thư viện nằm tại `Pixel_Art/Black Knight/Source_Library/`. Đây là tài nguyên nội bộ của dự án, nằm ngoài cây asset runtime `public/`. [Source Library](<../../../Pixel_Art/Black Knight/Source_Library/>) · [Frame Map đã duyệt](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Giấy phép Fellor](<../../../Pixel_Art/Black Knight/License.txt>)

## Kiểm tra bằng hình ảnh

| Contact sheet | Ô master | Frame | Nội dung |
|---|---:|---:|---|
| [Weapon transitions, idle & heavy attacks](<../../../Pixel_Art/Black Knight/Source_Library/Contact_Sheets/01-weapon-idle-heavy.png>) | 0–83 | 84 | Rút/tra kiếm, hai Idle, ba đoạn Heavy Attack. |
| [Attacks, rolls & runs](<../../../Pixel_Art/Black Knight/Source_Library/Contact_Sheets/02-attacks-rolls-run.png>) | 84–171 | 88 | Bốn đoạn Attack, hai Roll và hai Run. |
| [Side-scroller archive & Weapon Art](<../../../Pixel_Art/Black Knight/Source_Library/Contact_Sheets/03-aerial-weapon-art.png>) | 172–256 | 85 | Hai bộ Jump/Mid air/Fall/Land lưu trữ, Weapon Art. |
| [Parry, hurt, death & buffs](<../../../Pixel_Art/Black Knight/Source_Library/Contact_Sheets/04-parry-damage-buffs.png>) | 257–323 | 67 | Ba pha Parry, hai Hurt, Death và hai Buff. |

## Trích xuất và kiểm thử

- Mỗi thư mục mang số nhóm và tên từ Frame Map. File PNG ghi thứ tự trong chuỗi và chỉ số ô master. `metadata.json` ghi thứ tự, thời lượng frame và chuỗi, trạng thái vũ khí, hướng nguồn, hình chữ nhật pixel gốc, hàng/cột, chỉ số frame GIF, anchor, SHA-256 master và giấy phép. Thứ tự frame trong chuỗi bắt đầu từ 1. Chỉ số ô master và GIF bắt đầu từ 0. [Ví dụ metadata Death](<../../../Pixel_Art/Black Knight/Source_Library/32-death/metadata.json>)
- Giữ nguyên canvas gốc **144×64 px** và mọi byte RGBA trong vùng `142×62`. Chỉ đặt dải viền 1 px đã xác minh thành trong suốt. Mỗi frame dùng neo tham chiếu `(72, 63)` tính từ góc trên trái, tương ứng tâm ngang và biên dưới của vùng nội dung. Đây là quy ước thư viện vì gói gốc thiếu thông tin pivot. Neo này bảo toàn khoảng dịch chuyển trong ảnh nguồn. Collider và origin cho runtime thuộc đợt tích hợp sau.
- Đọc timing từ đủ 16 GIF. Cả 324 frame giữ **70 ms/frame**. Metadata ánh xạ đủ 330 lượt phát, gồm sáu lượt lặp của Parry start. Thứ tự từng nhóm bám Frame Map. Các đoạn combo giữ đúng ranh giới nguồn. Fire Nova vẫn nằm trong chuỗi **Parry** ô 263–277. Mười chuỗi Jump, Mid air, Fall và Land có cờ lưu trữ side-scroller. [Parry start](<../../../Pixel_Art/Black Knight/Source_Library/27-parry-start/metadata.json>) · [Parry](<../../../Pixel_Art/Black Knight/Source_Library/28-parry/metadata.json>)
- Giải mã lại toàn bộ PNG bằng `pngjs`. 324/324 khớp byte nội dung với master, 324/324 có biên trong suốt và 0 frame rỗng. Thứ tự, tọa độ và 34 nhóm khớp Frame Map. **Unarmed Hurt 281–285, Armed Hurt 286–290, Death 291–299** được kiểm tra riêng. SHA-256 của nguồn Fellor và các file sprite legacy trước/sau trùng khớp.
- `npx tsc --noEmit` trả mã **0** trước và sau trích xuất. `git diff --check` đạt. Phạm vi mới gồm **362 file** trong Source Library và báo cáo này. Working tree đã có sáu thay đổi tài liệu V153-F0-0 từ trước CLOUD-01A.

### Frame đặc biệt

| Ô | Kết quả |
|---|---|
| 178, 203 | Tư thế Mid air một frame, giữ nguyên và có cờ lưu trữ. |
| 265–266 | VFX Parry che kín nhân vật. Hai frame đều có dữ liệu alpha. |
| 281, 286, 291–292 | Flash trắng/xám thuộc đúng chuỗi Hurt hoặc Death. |
| 282, 287 | Mỗi bản GIF khác nhẹ RGB tại 8 pixel. PNG xuất giữ pixel master. |
| 293–299 | Mảnh tan của Death. Ba frame cuối còn 24, 10 và 4 pixel khác trong suốt, giữ nguyên. |
| 320 | Pixel alpha 59 trong Armed Buff được giữ nguyên. GIF dùng alpha 255 tại pixel này. |

## Artwork cần cho bốn hướng

**RIGHT** dùng được làm nguồn ngang gốc cho đủ 34 chuỗi. Hướng chủ đạo là RIGHT. Weapon Art, các đoạn Attack và Roll giữ các tư thế xoay theo chuyển động nguồn. **LEFT** là ứng viên lật ngang cho Idle, Run và các pha tương thích. Cần duyệt tay cầm, vị trí chuôi trên lưng, quỹ đạo kiếm và chi tiết bất đối xứng trước khi dùng cho Light/Heavy, Weapon Art, Roll, Parry, rút/tra kiếm, Buff và Hurt. Thư viện hiện chỉ xuất hướng nguồn.

**UP/DOWN** còn thiếu artwork đúng góc cho cả Armed/Unarmed Idle, Walk, Run, Light/Heavy Attack và các đoạn combo/recovery, Weapon Art, Parry, hai Roll, rút/tra kiếm, hai Buff, hai Hurt và Death. Các pha kỹ năng lửa đi theo chuỗi tương ứng. Walk chuyên biệt cần chuẩn bị cho cả bốn hướng vì nguồn Fellor chỉ có Run. Jump/Fall/Land đang ở phạm vi lưu trữ. Khi duyệt artwork mới, đối chiếu mũ sắt tối với khe T, chùm lông đỏ sẫm, vai nhiều lớp, áo choàng rách, tỷ lệ và lưỡi cong cam vàng hoặc chuôi đeo lưng. [Ma trận nguồn](V153_F0_0_ANIMATION_COVERAGE_MATRIX.md) · [Cover Fellor](<../../../Pixel_Art/Black Knight/WEB_Images/Cover_GIF/Black_Knight_Art.gif>) · [Cận cảnh mũ](<../../../Pixel_Art/Black Knight/WEB_Images/knight_no_text.png>)

## Phạm vi đổi tên legacy

| Nhóm tham chiếu | Tệp và tên cần rà trong đợt đổi tên |
|---|---|
| Class, type và alias | `src/entities/SatyrPlayer.ts` có `SatyrPlayer` và alias value/type `WayfarerPlayer`. `src/entities/player/Satyr.ts` re-export `Satyr` và `SatyrPlayer`. `src/types/index.ts` định nghĩa `SatyrAnimState`. Các nơi import class gồm `GameScene.ts`, `systems/camera/CameraSystem.ts`, `utils/DebugOverlay.ts` và `utils/HitboxDebugInspector.ts`. |
| Registry animation | `src/animation/SatyrAnimations.ts` có `registerSatyrAnimations`, `registerWayfarerAnimations` và đăng ký `wayfarer_<action>_<dir>`, `satyr_<action>_<dir>` cùng alias không hướng. `src/data/satyr_animations.json` chứa fallback. `GameScene.ts` và `MainMenuScene.ts` gọi registry. |
| Loader, texture và cấu hình | `src/config/Constants.ts` chứa `SATYR_*`, `WAYFARER_*` và kích thước/origin/collider dùng chung với `SafeSpawnResolver.ts`. `PreloadScene.ts` nạp `satyr_sheet` từ `wayfarer_idle.png` và hai khóa `satyr_portrait`, `wayfarer_portrait`. `UIScene.ts`, `DialogueSystem.ts` và `src/data/dialogues.json` tham chiếu portrait. `CullingOptimizationModule.ts` có kiểm tra tên `wayfarer_player`. |
| File asset và kiểm thử | `public/assets/characters/mossbound_wayfarer/wayfarer_*.png`, `public/assets/characters/satyr/satyr_portrait.png`, `Pixel_Art/Satyr/`, `ASSETS_MANIFEST.json` và bản ghi asset `HW-AST-CHAR-000001`, `HW-AST-CHAR-000002` trong `src/registry/registryData.ts` / `src/data/content_registry.json`. Các consumer kiểm thử chính gồm `scripts/extract_black_knight_wayfarer.mjs`, `test_v152_05_black_knight_combat.mjs`, `verify_v15_22_main_menu.mjs`, `test_browser_click_new_game.mjs` và `audit_map_reachability_and_assets.mjs` trong `scripts/`. |
| Save và Content ID | `lore_satyr_journal` là item/runtime key trong `src/data/items.json`, hai bản registry và danh sách tương thích trong `SaveManager.ts`. Alias gồm `traveler_journal`, `satyr_journal`, `nhat_ky`. `lore_wayfarer_inner_journal` là ID lore trong `src/data/lore.json`, được mở bởi `PlayerState.ts`, `GameScene.ts`, `EvilKnights.ts` và đọc bởi `JournalModal.ts`. Hai ID có thể nằm trong `inventory` hoặc `unlockedLoreIds` của dữ liệu lưu. Đường lưu dùng `SaveManager.ts` và `CloudSaveService.ts`, gồm `hollow_woods_v1_savegame`, `hollow_woods_v3_savegame`, `hollow_woods_backup_slot_1`, `progress` và `hw_save_slot_1`. Schema lưu hiện hành chứa trạng thái và ID, không có trường tên class player hoặc animation key. |
| Tên hiển thị và tham chiếu lịch sử | `EndingSystem.ts` và `VeilSystem.ts` còn lời thoại Satyr. `MainMenuScene.ts`, `UIScene.ts` và hồ sơ P2Game dùng The Mossbound Wayfarer. `prop_wayfarer_tent` là key đạo cụ riêng trong loader, `WorldBuilder.ts` và manifest. Tìm không phân biệt hoa thường cho `Satyh/satyh` chỉ thấy tên trong quy tắc lịch sử, chưa thấy tham chiếu runtime hoặc Save. |

## Trước CLOUD-01B

Artwork top-down hợp lệ vẫn là đầu vào còn thiếu. Bốn bảng `Custom_4Dir` chưa có trong Cloud. Cần duyệt nguồn hoặc artwork mới cho UP/DOWN và Walk, xác minh tay cầm khi lật LEFT, và chốt cách dùng Death chung cho hai trạng thái trang bị. Artwork portrait cũng cần bố cục tập trung vào mũ và khe nhìn. Bản trích xuất ngang và bốn contact sheet đã sẵn sàng để duyệt. CLOUD-01A dừng tại kho thiết kế.
