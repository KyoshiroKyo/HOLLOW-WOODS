# V153-F0-0 — Quy tắc, kiến trúc và kiểm kê Black Knight

**20/11/2026 · HOLLOW WOODS — The Fog That Remembers · V1.5.2 → V1.5.3**

Đã kiểm chứng **34 chuỗi trong 324 ô có nội dung** và **16 GIF với 330 frame phát**. Định hướng V1.5.3 là **di chuyển bốn hướng, chiến đấu bốn hướng và mở rộng đầy đủ hoạt ảnh Black Knight**. Bốn bảng `Custom_4Dir` đang `MISSING FROM CLOUD`. Baseline TypeScript chạy thành công.

## Baseline và quy tắc

Workspace Codex Cloud `/workspace/HOLLOW-WOODS`, nhánh `work`, working tree ban đầu sạch. HEAD `b5eaa612f7011b7d9fdc657d31310082d08f281b` là commit *HOLLOW WOODS v1.5.2 Production Release*. Baseline cài Phaser 4.2.1, Vite 5.4.21 và TypeScript 5.9.3 strict. Cấu hình P2Game gốc và bản trong `public/` đều khai báo version 1.5.2, SDK 1.1 và Cloud Save. Renderer tường minh tại `type` trong cấu hình Phaser và lúc khởi tạo, chọn WebGL khi hỗ trợ và Canvas khi cần. [package.json](../../../package.json) · [tsconfig.json](../../../tsconfig.json) · [p2game.json](../../../p2game.json) · [src/main.ts](../../../src/main.ts#L39)

- Đã đọc hai tài liệu quy tắc, chuẩn thư mục, manifest và cấu hình. Các luật V152 được giữ nguyên. Hai tài liệu trong `Read/` bổ sung kiến trúc và phạm vi V1.5.3. Root vắng `AGENTS.md`, nên thêm hướng dẫn đọc ngắn theo yêu cầu Project Owner. Đây là ngoại lệ cụ thể so với danh sách Markdown ở root trong quy chuẩn thư mục. [AGENTS.md](../../../AGENTS.md) · [Read/AGENTS.md](../../AGENTS.md) · [Quy tắc thép](../../AI_IRON_RULES.md) · [Quy chuẩn thư mục](../../../docs/FOLDER_STRUCTURE_RULES.md)
- Quy chuẩn yêu cầu build trước khi commit. V153-F0-0 chuẩn bị tài liệu để review, baseline chỉ chạy `npx tsc --noEmit`. Mô tả thư mục còn ghi Phaser 3, trong khi package cài Phaser 4.2.1. [Quy chuẩn thư mục](../../../docs/FOLDER_STRUCTURE_RULES.md) · [package-lock.json](../../../package-lock.json)
- Luật pixel art có giấy phép cho môi trường, `pixelArt` và Y-sorting theo chân được khóa cho V1.5.3. Hàng rào gãy dựng bằng Graphics vẫn hiện diện trong baseline. Đây là một chênh lệch đã thấy khi đối chiếu luật, ngoài phạm vi chỉnh sửa của đợt này. [GameConfig](../../../src/config/GameConfig.ts#L25) · [Hàng rào baseline](../../../src/world/WorldBuilder.ts#L2648)

## Black Knight — The Mossbound Wayfarer

Gói `Pixel_Art/Black Knight/` có 29 file. Master `ALL_In_One_NEW/Black_Knight_All_In_One_New.png` là 2592×1152 px, lưới 18×18, mỗi ô 144×64 px với viền màu 1 px và nội dung nền trong. Kiểm tra `Preview_GIFs/` xác nhận 16 GIF 512×256 px, 70 ms/frame, 6–40 frame/GIF. Bản đồ ghi đủ 34 dải màu, frame chuyển tiếp, flash, VFX che thân và các ô Death thưa pixel. Tất cả 324 ô có nội dung. [Frame map và danh sách GIF](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Read me.txt](<../../../Pixel_Art/Black Knight/Read me.txt>)

### Web Images và Cover

Mười file nằm trong `WEB_Images/`, trong đó `Cover_GIF/` là thư mục con. Hai cover đều 1920×1080 px và có 12 frame × 100 ms. Đối chiếu hình tượng chính với `Black_Knight_Art.gif` và cận cảnh mũ với `knight_no_text.png`. Giữ mũ sắt tối và khe chữ T, lông mũ đỏ sẫm/tím nâu, giáp vai nhiều lớp, áo choàng đen rách, tỷ lệ người và lưỡi cong cam vàng. Khi tra kiếm, giữ chuôi/vũ khí sau lưng. Tia sáng của cover và nền Web chỉ dùng cho minh họa. [WEB_Images](<../../../Pixel_Art/Black Knight/WEB_Images/>) · [Cover_GIF](<../../../Pixel_Art/Black Knight/WEB_Images/Cover_GIF/>)

| File trong `WEB_Images/` | Kích thước | Vai trò |
|---|---:|---|
| `knight.png` | 1920×1080 | Poster cận cảnh có tiêu đề và nhãn New Animations. |
| `knight_no_text.png` | 1920×1080 | Cận cảnh không chữ, thấy khe T tối và vũ khí cam sau vai. |
| `WEB_BG.png` | 1920×1080 | Nền web xanh rêu. |
| `Cover_GIF/Black_Knight_Art.gif` | 1920×1080 | Tham chiếu chính về giáp, lông mũ, áo choàng rách và vũ khí. |
| `Cover_GIF/Black_Knight_Art_With_Light.gif` | 1920×1080 | Bố cục cover với tia sáng chéo. |
| `Banner.png` | 1152×576 | Banner logo. |
| `Banner_v2.png` | 128×64 | Banner logo. |
| `Banner_v22.png` | 256×128 | Banner logo. |
| `Banner_v4.png` | 512×256 | Banner logo. |
| `Banner.aseprite` | 128×64 | Nguồn chỉnh sửa banner, 1 frame, 32 bit. |

### Custom 4 hướng

Đã tìm theo đường dẫn, tên và lịch sử Git hiện có trong Cloud. Thư mục `Pixel_Art/Black Knight/Custom_4Dir/` vắng mặt. Khả năng hiện diện tại `G:\HOLLOW WOODS` chưa được xác minh.

| File dự kiến | Trạng thái | Phần chưa đánh giá |
|---|---|---|
| `knight_4dir_armed_move.png` | MISSING FROM CLOUD | DOWN, UP, LEFT, RIGHT của Armed Idle/Walk/Run. |
| `knight_4dir_unarmed_move.png` | MISSING FROM CLOUD | Bốn hướng Unarmed, vị trí và độ hiện diện vũ khí sau lưng. |
| `knight_4dir_attack.png` | MISSING FROM CLOUD | Bốn hướng đòn đánh, pha chuẩn bị, quỹ đạo và recovery. |
| `knight_skills_states.png` | MISSING FROM CLOUD | Kỹ năng, Hurt/Death, Buff, hướng và hiệu ứng. |

Với cả bốn bảng, số frame, ô thiếu hoặc trùng, hướng, độ khớp chuyển động gốc, tỷ lệ, mũ, chùm lông, áo choàng, tay cầm, kích thước vũ khí, màu VFX và giá trị tham chiếu đều `NOT_CHECKED`. Kiểm tra bản nguyên và thông tin ghi công khi có file.

### Độ phủ và artwork cần bổ sung

- **Di chuyển** cần artwork UP/DOWN đúng góc nhìn cho Armed/Unarmed Idle, Walk và Run. Nguồn không có chuỗi Walk chuyên biệt. Cần tư thế Walk riêng ở bốn hướng theo hai trạng thái. Hai hướng ngang của Idle/Run có nguồn, cần khôi phục đủ chu kỳ và đối chiếu tay cầm khi lật.
- **Chiến đấu và trạng thái** cần artwork top-down cho Light/Heavy, combo, recovery, Weapon Art, Parry, hai Roll, rút/tra kiếm, hai Buff, hai Hurt và Death. Nguồn ngang có nhiều pha mà runtime bỏ qua. Death nguồn có một chuỗi, cần duyệt cách dùng cho hai trạng thái. Chân dung cần bố cục thấy được mũ và khe chữ T.
- **Kỹ năng mở rộng** có Thrust và Flame Stream cùng Attack 4, Ground Slam là ứng viên từ đoạn chém thấp, Fire Wave chưa có chuỗi rời đã xác minh, Aerial Somersault thuộc Weapon Art, Fire Nova thuộc Parry thành công. Giữ thiết kế kỹ năng ở mức nghiên cứu artwork. Giữ Jump, Mid air, Fall và Land tại kho nguồn. [Tọa độ và bằng chứng GIF](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Ma trận đầy đủ](V153_F0_0_ANIMATION_COVERAGE_MATRIX.md)

## Kiến trúc và 12 điểm runtime

Loader nạp 18 atlas Wayfarer và portrait. Registry dùng `wayfarer_<action>_<dir>` và bí danh `satyr_<action>_<dir>`. `satyr_sheet` nạp lại `wayfarer_idle.png`, chỉ có ô 0–15. 27 định nghĩa fallback trong `satyr_animations.json` gồm các chỉ số tới 49 và được registry Wayfarer ghi đè ở đường nạp đầy đủ. Đây là rủi ro khi thiếu texture đích. Chuỗi phục vụ tích hợp vẫn đi từ loader qua registry đến player, giữ Content ID và keys. `WAYFARER_USE_PURE_ARTIST_SPRITES` hiện `false` và chỉ có khai báo. Đợt tích hợp cần đưa `true` vào đường nạp đã xác minh. [Loader](../../../src/scenes/PreloadScene.ts#L475) · [Registry fallback](../../../src/animation/SatyrAnimations.ts#L142) · [Dữ liệu legacy](../../../src/data/satyr_animations.json) · [Constants](../../../src/config/Constants.ts#L40)

Đối chiếu trực tiếp 380 ô trong PNG, định nghĩa nguồn và đường chọn animation trong TypeScript. Thời điểm combat dưới đây suy ra từ thứ tự lệnh và fps đã đăng ký. Kiểm tra trình duyệt và đo FPS nằm ở nhiệm vụ tích hợp.

| # | Điểm đã kiểm tra | Kết quả |
|---:|---|---|
| 1 | Code vẽ nhân vật | Xác nhận 8 atlas có hàng UP/DOWN được sinh bằng code từ các nét hình học. Player dùng sprite, Graphics tại constructor phục vụ bóng và Vòng Sáng. [Bộ tạo ảnh](../../../scripts/extract_black_knight_wayfarer.mjs#L140) · [Player](../../../src/entities/SatyrPlayer.ts#L185) |
| 2 | Hurt/Death | Không có ô alpha rỗng trong atlas. Hurt chỉ lấy 281–283 của Unarmed Hurt, dừng trước phần hồi sắc. Death lấy 288–293, lẫn 3 ô Armed Hurt và thiếu 294–299. Flash trắng, trắng xám và mảnh tan trong nguồn là có chủ ý. [Định nghĩa atlas](../../../scripts/extract_black_knight_wayfarer.mjs#L371) |
| 3 | Unarmed Run | 6/6 ô RIGHT khớp ô 148, 150, 152, 154, 156, 158 của Fellor. LEFT lật đúng pixel, UP/DOWN trùng Armed Run và chỉ có 3 pose khác nhau trên 6 frame. [Nguồn atlas](../../../scripts/extract_black_knight_wayfarer.mjs#L413) · [Cách chọn Run](../../../src/entities/SatyrPlayer.ts#L1356) |
| 4 | Portrait | File 64×64 opaque, ảnh dồn vào lưỡi cam và để phần mũ ở rìa phải. UI hiển thị texture 64×64. Lệch nằm trong bố cục file nguồn runtime, quy trình crop cũ chưa có bằng chứng. [Portrait](../../../public/assets/characters/mossbound_wayfarer/wayfarer_portrait.png) · [Đường hiển thị](../../../src/scenes/UIScene.ts#L3519) |
| 5 | Chùm lông | Mất ở mũ dựng bằng code trong các hàng UP/DOWN của tám atlas, gồm Idle/Walk/Run và Unarmed. DOWN còn có khe mắt vàng. Frame flash hoặc che mũ cần đánh giá theo nguồn. [Bộ tạo mũ](../../../scripts/extract_black_knight_wayfarer.mjs#L177) |
| 6 | Artwork UP/DOWN | Ba atlas Attack/Heavy/Weapon Art giữ thân ngang và đè cung lửa. Bảy atlas còn lại gồm Hurt, Death, Parry, hai Roll, Buff và Toggle sao chép RIGHT cho cả UP/DOWN. [Bộ xuất ảnh](../../../scripts/extract_black_knight_wayfarer.mjs#L474) |
| 7 | Hướng đòn đánh | Registry và hitbox đã nhận bốn hướng. Hình nhân vật trong ba sheet tấn công chỉ có hai hướng ngang thực, LEFT lật từ RIGHT. [Light Attack](../../../src/entities/SatyrPlayer.ts#L1630) · [Registry](../../../src/animation/SatyrAnimations.ts#L55) |
| 8 | VFX lửa / nhịp đánh | Cung lửa UP/DOWN được ghi cố định trên cả frame chuẩn bị. `player_attack` phát trước khi play clip Light/Heavy/Weapon Art. Ví dụ Light quét hitbox ngay, cung lửa gốc bắt đầu ở frame 4 khoảng 250 ms theo 12 fps. [Cung tĩnh](../../../scripts/extract_black_knight_wayfarer.mjs#L285) · [Thứ tự phát và xử lý](../../../src/entities/SatyrPlayer.ts#L1640) · [GameScene](../../../src/scenes/GameScene.ts#L427) |
| 9 | Tỷ lệ khung và crop | Khung 64×64 đồng nhất. Ô Idle DOWN/UP cao 38–39 px, RIGHT 29–31 px. Crop mất pixel ở Attack ô 87–89 và Weapon Art ô 228, 234, 246. Ví dụ ô 234 mất 34 pixel khác trong suốt. [Logic crop](../../../scripts/extract_black_knight_wayfarer.mjs#L57) |
| 10 | Anchor | Player đặt origin `(0.5, 1.0)` một lần, dùng tọa độ sprite để Y-sort và lấy vị trí chân. Collider `18×12`, offset `(23, 46)`, đáy ở y=58 trong tile 64. Khung Idle DOWN/UP có pixel cuối y=61, RIGHT y=62. Crop Attack dịch offset X từ 39 đến 51 làm lệch đặt hình tương đối. Cần kiểm tra chân, collider và scale khi dùng artwork mới. [Constants](../../../src/config/Constants.ts#L63) · [Player](../../../src/entities/SatyrPlayer.ts#L195) · [Vị trí chân](../../../src/entities/SatyrPlayer.ts#L2496) |
| 11 | Rút/tra kiếm | Hiện một clip `weapon_toggle` dùng chung theo hướng, gồm 5 ô On và 1 ô Off. Trạng thái vũ khí cập nhật trước phát clip. Timer 400 ms ngắn hơn 6 frame ở 10 fps. Thiếu hai chuỗi riêng đủ pha. [Định nghĩa atlas](../../../scripts/extract_black_knight_wayfarer.mjs#L457) · [Toggle](../../../src/entities/SatyrPlayer.ts#L1942) |
| 12 | Armed/Unarmed | Walk dùng chung khi đã tra kiếm, Hurt/Death không phân nhánh theo vũ khí. Idle/Run dọc trùng giữa hai trạng thái, Roll có hai clip. `[F]` gọi `wayfarer_buff` của Armed cả khi tra kiếm. [Đi/chạy](../../../src/entities/SatyrPlayer.ts#L1356) · [Hurt/Death](../../../src/entities/SatyrPlayer.ts#L1980) · [Vòng Sáng](../../../src/entities/SatyrPlayer.ts#L2280) |

Gameplay khởi tạo sprite với scale mặc định `(1, 1)` và atlas 64×64. Với frame không có pivot tùy biến, Phaser giữ origin chuẩn hóa khi đổi frame và tính lại điểm neo hiển thị theo kích thước. Dùng 64×64 nếu bảo toàn hình. Với đòn rộng, nghiên cứu atlas lớn hoặc lớp VFX có neo riêng, kiểm lại điểm chân và body ở kích thước mới. Giữ Vòng Sáng, Tinh Thần, Hương Trầm, F9, NPC, khu vực, nhiệm vụ và Save/Load. [Khởi tạo player](../../../src/scenes/GameScene.ts#L412) · [Quy tắc V1.5.3](../../AI_IRON_RULES.md#5-khóa-định-danh-và-phạm-vi-v153)

## UI Pack, Running UI và giấy phép

`Pixel_Art/UI Pack/` có 8 JPG tham chiếu và không có ZIP/điều khoản cấp phép riêng trong thư mục. Báo cáo V152-06B ghi nguồn từ `Humble Gift - Paper UI System_v1.1.zip`, `Humble Gift - Paper UI System_v1.3.zip`, `Humble Gift - World Map Scroll v1.0.zip` và `Pocket Inventory Series #2 Pixel Map.zip`. Các ZIP được nêu đều `MISSING FROM CLOUD`. Kiểm tra được **28 PNG runtime, 53.050 byte**, đều có trong manifest và khai báo loader. [UI Pack](<../../../Pixel_Art/UI Pack/>) · [Hồ sơ nguồn V152-06B](V152_06B_UI_PACK_ASSET_INTEGRATION_REPORT.md) · [Loader](../../../src/scenes/PreloadScene.ts#L886)

| Loại UI | Bằng chứng hiện có |
|---|---|
| Panel 9-slice | `panels/ui_pack_panel_{hud,quest,dialogue,modal,cutout_modal}.png`. Có ảnh panel, chưa thấy insets hoặc dùng NineSlice trong `src/`. |
| Journal | `books/ui_pack_open_book.png`, `ui_pack_open_book_desk.png`. |
| Parchment | `scrolls/ui_pack_{world_map_scroll,scroll_compact,map_pin}.png`. |
| Tabs và buttons | `icons/ui_pack_tab_{journal,craft,equip,map}.png` và `ui_pack_btn_wood{,_hover}.png`. |
| Portrait frames | JPG tham chiếu có khung. UI dựng khung thoại bằng Graphics, chưa thấy PNG UI Pack riêng cho khung portrait. |
| Health, Stamina và Composure bars | HUD vẽ ba thanh từ stats trên `ui_pack_panel_hud`. Chưa thấy PNG thanh riêng. |
| Icons, slots | `icons/ui_pack_equip_{back,body,charm,feet}.png`, ghim bản đồ và 6 PNG trong `slots/`, gồm năm loại slot và nền hotbar. |
| Ribbons và modal backgrounds | `panels/ui_pack_ribbon_header{,_alt}.png`, panel modal/ngữ cảnh và nền sách. |
| Tooltip assets | JPG có mẫu tooltip. Runtime dựng nền tooltip bằng Graphics, chưa thấy PNG tooltip chuyên biệt. |

<details>
<summary>Tám ảnh JPG trong Pixel_Art/UI Pack</summary>

| File | Kích thước | Nội dung tham chiếu |
|---|---:|---|
| `047cccbc6042420f0761194c83474e73.jpg` | 736×1390 | Sheet giấy, sách, panel, tab, ribbon, nút và thanh. |
| `0ce549b56db00a6f58ee845a2b10b0c5.jpg` | 1200×750 | Giao diện sách trang bị, khung chân dung và nhãn tab. |
| `13ae2f19f8f00d9c69c5e06a7ff42f59.jpg` | 735×490 | Panel giấy, thẻ, nút, icon và tooltip. |
| `23e95cb9153cdfdbb721c6b2375f7a5d.jpg` | 1200×675 | Giao diện chế tạo với bảng công thức và hàng biểu tượng. |
| `37b6836147feffccf047fcad3a4a9da6.jpg` | 735×420 | Card chân dung, tab, nút và bảng danh mục. |
| `671f42bd0b30dc98be8ad4da6cbe85ba.jpg` | 1200×675 | Sách túi đồ, khung nhân vật và cụm chỉ số. |
| `82895b5ece6075065dcf266af7e943f4.jpg` | 1200×675 | Nhật ký dạng sổ mở, ô vật phẩm và tab bên. |
| `ba92d0203dff0b3864bdfb6b0b1ef943.jpg` | 640×480 | Portrait, HP/MP bars, kho đồ, tab và ô mô tả. |

</details>

Running UI khóa bốn trạng thái `normal` (Bình thường), `sprinting` (Đang chạy), `low_stamina` (Sắp hụt sức) và `exhausted` (Hồi sức), dùng bảng màu Dark Moss & Ember Gold trong luật V1.5.3. Player cập nhật `stats.isSprinting`, đặt cờ kiệt sức riêng khi Thể Lực ≤0 rồi mở chạy ở **≥30 điểm**, do điều kiện 30 lồng trong điều kiện 25. Max mặc định 100. HUD hiện đổi màu thanh ở **≤30%**. Mốc thiết kế mới là **25%** cho cảnh báo và hồi chạy. Chốt khác biệt với Project Owner trước khi áp dụng ngưỡng mới. [Chạy và kiệt sức](../../../src/entities/SatyrPlayer.ts#L1154) · [HUD](../../../src/scenes/UIScene.ts#L825) · [PlayerState](../../../src/state/PlayerState.ts#L87)

Fellor/BitBlast Studio cho phép dùng cá nhân, thương mại, chỉnh sửa và đưa vào game, app hoặc video. Cấm bán lại hay phân phối asset dưới dạng độc lập, kể cả sau khi chỉnh sửa. Cấm NFT, dùng làm dữ liệu huấn luyện AI hoặc nhận tác quyền/nhãn hiệu. Ghi công được khuyến khích. Giấy phép áp dụng cho gói Black Knight, còn quyền tái sử dụng JPG, PNG xuất từ UI Pack và artwork Custom cần xác minh theo nguồn tương ứng. [License.txt](<../../../Pixel_Art/Black Knight/License.txt>) · [Read me.txt](<../../../Pixel_Art/Black Knight/Read me.txt>)

## Manifest, âm thanh và script hiện có

`ASSETS_MANIFEST.json` ghi `totalFiles = 237`, các nhóm liệt kê 235 mục. `public/assets/characters/mossbound_wayfarer.rar` là mục thiếu trên disk. 19 PNG Wayfarer, 28 PNG UI Pack và 65 file audio đều khớp mục trong manifest và hiện diện. Xác minh loader, key và tham chiếu động/JSON trước mọi đề xuất xóa. Luật hiệu năng V1.5.3 yêu cầu quản lý vòng đời WebAudio và scene, cập nhật HUD theo thay đổi và đo FPS thực tế. [Manifest](../../../ASSETS_MANIFEST.json) · [Quy tắc âm thanh](../../AI_IRON_RULES.md#8-ui-âm-thanh-và-hiệu-năng)

| Phạm vi | Script hiện có và giới hạn |
|---|---|
| Sprite frame, animation, combat | `scripts/test_v152_05_black_knight_combat.mjs` kiểm kích thước, khai báo và tên phương thức. Có assertion legacy yêu cầu cờ `false` và ảnh preview trong `Backups/` đang vắng mặt. Kiểm tra nội dung frame cần bằng chứng bổ sung. `scripts/extract_black_knight_wayfarer.mjs` là bộ xuất ghi đè asset, chỉ đọc trong đợt này. |
| Asset references và missing textures | `scripts/verify_zero_404_assets.mjs` quét literal `assets/…` tại Preload và AudioManager. `scripts/audit_map_reachability_and_assets.mjs` có kiểm file/kích thước sprite và BFS. `scripts/verify_data_integrity.mjs` và `tests/verify_content_registry.mjs` kiểm dữ liệu và registry. |
| Movement, reachability | `scripts/verify_v15_02_movement_fix.mjs`, `scripts/verify_v15_03_corner_sliding_and_colliders.mjs`, `scripts/test_v15_57_check_passages.mjs` và audit BFS. |
| Running UI và UI Pack | `scripts/test_v152_06a_hud_stamina.mjs` và `scripts/test_v152_06b_ui_pack.mjs`. |
| Audio | `scripts/test_v152_02_audio_sanctuary.mjs`, `scripts/test_v15_fix_02_audio.mjs` và `scripts/test_v15_39_bgm_system.mjs`. |
| Performance và Save/Load | `scripts/verify_v15_27_performance_and_save_compatibility.mjs`, `scripts/test_v152_09_asset_chunk_optimization.mjs` và `scripts/test_browser_click_new_game.mjs`. |
| P2Game | `scripts/test_v152_08_p2game_sdk.mjs`, `scripts/test_v15_53_p2game_release_automation.mjs` và `scripts/build_p2game_release.mjs`. |

<details>
<summary>Toàn bộ 77 file trong scripts/ và 1 file trong tests/</summary>

```text
scripts/audit_map_reachability_and_assets.mjs
scripts/build_p2game_release.mjs
scripts/build_standalone_release.mjs
scripts/cleanup_redundant_assets.mjs
scripts/compress_audio_ffmpeg.ps1
scripts/extract_black_knight_wayfarer.mjs
scripts/generate_assets_manifest.mjs
scripts/pack_source_for_gemini.mjs
scripts/test_browser_click_new_game.mjs
scripts/test_v152_02_audio_sanctuary.mjs
scripts/test_v152_04_vaelen_workshop.mjs
scripts/test_v152_05_black_knight_combat.mjs
scripts/test_v152_06a_hud_stamina.mjs
scripts/test_v152_06b_ui_pack.mjs
scripts/test_v152_07_lighting_dark_shadow.mjs
scripts/test_v152_08_p2game_sdk.mjs
scripts/test_v152_09_asset_chunk_optimization.mjs
scripts/test_v15_03_pixel_scale_and_village_overhaul.mjs
scripts/test_v15_15_lighting_fog_and_ysorting.mjs
scripts/test_v15_30_torn_page_modal.mjs
scripts/test_v15_31_vaelen_bonfire_outpost.mjs
scripts/test_v15_32_peaceful_dialogue_and_knight_quests.mjs
scripts/test_v15_33_paper_note_and_signposts.mjs
scripts/test_v15_34_safe_spawn_and_unstuck.mjs
scripts/test_v15_38_vaelen_rest_blessing.mjs
scripts/test_v15_39_bgm_system.mjs
scripts/test_v15_40_rune_puzzle_colliders.mjs
scripts/test_v15_41_rune_seam_and_walkway.mjs
scripts/test_v15_42_wetlands_boss_sprite.mjs
scripts/test_v15_43_deep_forest_corridor.mjs
scripts/test_v15_44_modal_toggle_and_shortcuts.mjs
scripts/test_v15_45_boss_shrine_guidance.mjs
scripts/test_v15_46_boss_pillar_damage_and_free_break.mjs
scripts/test_v15_47_boss_composure_assault_and_zero_mechanics.mjs
scripts/test_v15_48_iframe_focus_and_hud_layout.mjs
scripts/test_v15_50_bottom_bar_and_vertical_taskbar.mjs
scripts/test_v15_50a_parchment_hotbar_and_quick_craft_sidebar.mjs
scripts/test_v15_50b_dst_crafting_modal_redesign.mjs
scripts/test_v15_50c_dst_visual_fidelity_and_bookmarks.mjs
scripts/test_v15_53_p2game_release_automation.mjs
scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs
scripts/test_v15_57_check_passages.mjs
scripts/test_v15_58a_hallucinations_and_apparitions.mjs
scripts/test_v15_58b_whisper_trap_and_light_dilemma.mjs
scripts/test_v15_58c_heartbeat_vignette_panic.mjs
scripts/test_v15_59_ending_screen_and_branching.mjs
scripts/test_v15_60_quest_chain_restructuring.mjs
scripts/test_v15_61_pixel_art_trees_and_village_clean.mjs
scripts/test_v15_fix_02_audio.mjs
scripts/verify_data_integrity.mjs
scripts/verify_pre_release_audit.mjs
scripts/verify_v15_02_movement_fix.mjs
scripts/verify_v15_03_corner_sliding_and_colliders.mjs
scripts/verify_v15_04_f9_debug_separation.mjs
scripts/verify_v15_05_sanity_mechanics.mjs
scripts/verify_v15_06_vision_and_dark_tendril.mjs
scripts/verify_v15_07_night_aggression.mjs
scripts/verify_v15_08_night_pressure.mjs
scripts/verify_v15_09_pixel_art_standardization.mjs
scripts/verify_v15_10_bellhollow_buildings.mjs
scripts/verify_v15_11_foliage_and_terrain.mjs
scripts/verify_v15_12_pickups_and_props.mjs
scripts/verify_v15_13_bellhollow_layout.mjs
scripts/verify_v15_16_story_and_dialogue.mjs
scripts/verify_v15_17_villager_stories.mjs
scripts/verify_v15_18_knight_awakening.mjs
scripts/verify_v15_19_environmental_storytelling.mjs
scripts/verify_v15_20_multiple_endings.mjs
scripts/verify_v15_21_loading_screen.mjs
scripts/verify_v15_22_main_menu.mjs
scripts/verify_v15_23_settings_and_guides.mjs
scripts/verify_v15_24_hud_redesign.mjs
scripts/verify_v15_25_npc_labels_and_dialogue.mjs
scripts/verify_v15_26_modals_and_tooltips.mjs
scripts/verify_v15_27_performance_and_save_compatibility.mjs
scripts/verify_v15_29_debug_boxes_and_outline.mjs
scripts/verify_zero_404_assets.mjs
tests/verify_content_registry.mjs
```

</details>

## TypeScript, phạm vi Git và điểm dừng

`npx tsc --noEmit` trả mã **0** cả trước và sau cập nhật tài liệu, với **0 lỗi TypeScript**. Git xác nhận cả sáu thay đổi dành cho review PR thuộc phạm vi tài liệu.

| File | Thay đổi |
|---|---|
| `AGENTS.md` | Hướng dẫn ngắn tại root. |
| `Read/AGENTS.md` | Phạm vi V153-F0-0 và quy tắc vận hành V1.5.3. |
| `Read/AI_IRON_RULES.md` | Khóa thiết kế, hoạt ảnh, kiến trúc, UI, môi trường và audio. |
| `Read/V1.5/Reports/V153_F0_0_RULES_AND_INVENTORY.md` | Báo cáo này. |
| `Read/V1.5/Reports/V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md` | Frame map, 16 GIF và tọa độ đề xuất đã đối chiếu. |
| `Read/V1.5/Reports/V153_F0_0_ANIMATION_COVERAGE_MATRIX.md` | Ma trận và đối chiếu atlas runtime. |

### Trước CLOUD-01

1. Project Owner duyệt frame map, kiến trúc và cung cấp bốn file `Custom_4Dir` nếu chúng nằm ở workspace local. Thiếu artwork top-down hợp lệ là blocker để tích hợp bốn hướng.
2. Duyệt nguồn artwork cho Walk, UP/DOWN và portrait, phương án Death theo vũ khí và cách xử lý các VFX rộng. Xác minh quyền UI Pack trước công việc dùng thêm UI Pack. Chốt 25% hay hành vi hồi chạy 30 điểm trước khi chỉnh gameplay Thể Lực.

### Thứ tự nhiệm vụ nhân vật đề xuất

1. Duyệt tham chiếu, quyền sử dụng và chuẩn tay cầm, silhouette, hướng và neo.
2. Kiểm tra cả bốn bảng bổ sung, sau đó chuẩn bị Armed/Unarmed Idle/Walk/Run và portrait.
3. Chuẩn bị và kiểm tra Light/Heavy/Combo/Recovery, Weapon Art, Parry/Roll và chuyển trạng thái kiếm. Bảo toàn khả năng điều khiển sẵn có.
4. Chuẩn bị Buff, Hurt/Death và tư liệu VFX kỹ năng mở rộng. So lại timing, chân/va chạm và HUD trong lượt tích hợp được duyệt.

**Điểm dừng V153-F0-0.** Thay đổi đã chuẩn bị để Project Owner review. CLOUD-01 chờ phê duyệt.
