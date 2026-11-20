# HOLLOW WOODS V1.5.3 — V153-BATCH-02

**20/11/2026 · HOLLOW WOODS — The Fog That Remembers**  
**Baseline** V1.5.2, nhánh `work` tại `b5eaa612f7011b7d9fdc657d31310082d08f281b`.

Đã thực hiện tuần tự năm nhiệm vụ. Trước khi triển khai, đã xác minh Source Library có 34 chuỗi, 324 PNG RGBA 144×64, 34 metadata, 4 contact sheet, timing 70 ms và neo (72, 63). Ba chuỗi Unarmed Hurt 281–285, Armed Hurt 286–290 và Death 291–299 có dữ liệu riêng. SHA-256 sau batch khớp cả 391 mục trong ảnh chụp kho Fellor và Source Library đầu batch, cùng 51 mục trong ảnh chụp nguồn Fellor và sprite legacy từ CLOUD-01A. Batch dùng trực tiếp thư viện hiện có. [Báo cáo CLOUD-01A](V153_CLOUD_01A_ORIGINAL_BLACK_KNIGHT_EXTRACTION.md).

## CLOUD-01B — PASS · Thiết kế Black Knight bốn hướng

- Tạo năm bảng 1920×1080 trong `Pixel_Art/Black Knight/Custom_4Dir/`. Hai turnaround có đủ DOWN, UP, LEFT và RIGHT, với lưỡi cong vàng cam ở trạng thái Armed và vũ khí cất sau vai phải ở trạng thái Unarmed. Bốn hướng cho mỗi trạng thái có giáp sắt tối, vai nhiều lớp, áo choàng đen và chùm lông đỏ sẫm. Khe T hiện ở góc thấy được mặt mũ.
- Tám tư thế tham chiếu là artwork bổ sung tạo bằng ImageGen. Phần so sánh và các mẫu màu trích từ bản gốc được ghi nguồn trên bảng. Đã đối chiếu với master `ALL_In_One_NEW/Black_Knight_All_In_One_New.png`, các chuỗi trong `Source_Library/`, 16 GIF trong `Preview_GIFs/`, artwork `WEB_Images/`, `License.txt` và `Read me.txt`. [Master Fellor](<../../../Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png>) · [Giấy phép Fellor](<../../../Pixel_Art/Black Knight/License.txt>) · [Read me](<../../../Pixel_Art/Black Knight/Read me.txt>).
- Đã kiểm tra kích thước PNG, hướng nhìn, chuôi kiếm, chùm lông và ghi nguồn trên các bảng. Bảng so sánh đặt trực tiếp tư thế nguồn cạnh thiết kế bổ sung. [Armed](<../../../Pixel_Art/Black Knight/Custom_4Dir/black_knight_armed_turnaround.png>) · [Unarmed](<../../../Pixel_Art/Black Knight/Custom_4Dir/black_knight_unarmed_turnaround.png>) · [Palette](<../../../Pixel_Art/Black Knight/Custom_4Dir/black_knight_palette.png>) · [Vũ khí và áo choàng](<../../../Pixel_Art/Black Knight/Custom_4Dir/black_knight_weapon_cape.png>) · [So sánh gốc và bổ sung](<../../../Pixel_Art/Black Knight/Custom_4Dir/black_knight_design_comparison.png>).
- Thay đổi của nhiệm vụ này nằm trong năm bảng thiết kế. Bước sản xuất còn cần vẽ frame UP/DOWN, duyệt tay cầm và vị trí chuôi ở LEFT/RIGHT qua các pha động, rồi kiểm tra anchor, tỷ lệ và timing trước khi tích hợp.

## CLOUD-P2-01 — PASS · Avatar và nhận diện P2Game

Nguồn `knight_no_text.png` là PNG 1920×1080 của Fellor. Avatar dùng vùng vuông 1024×1024 từ tọa độ (320, 0) và giảm xuống 512×512 bằng nearest-neighbor, giữ khe mũ và ánh cam của vũ khí. Cover 1280×720 lấy frame đầu của GIF có ánh sáng, giữ tỷ lệ 16:9. Quy cách đối chiếu từ slide 21 của handbook trong repo. [Nguồn avatar](<../../../Pixel_Art/Black Knight/WEB_Images/knight_no_text.png>) · [Nguồn cover](<../../../Pixel_Art/Black Knight/WEB_Images/Cover_GIF/Black_Knight_Art_With_Light.gif>) · [Handbook](../../../reference/Handbook_GameDev_Challenge_2026.pptx).

| Trường metadata | V1.5.2 | V153-BATCH-02 |
|---|---|---|
| `assets.avatar`, `assets.icon` | [media/avatar_512x512.png](../../../public/media/avatar_512x512.png) | [media/hollow_woods_avatar.png](../../../public/media/hollow_woods_avatar.png) |
| `assets.cover`, `assets.background` | [media/cover_banner_1280x720.png](../../../public/media/cover_banner_1280x720.png) | [media/hollow_woods_black_knight_cover.png](../../../public/media/hollow_woods_black_knight_cover.png) |
| `description`, `shortDescription` | Mô tả cũ | Mô tả tiếng Việt về Black Knight, Vòng Sáng, Thể Lực, Tinh Thần, chế tạo và Miếu Chuông Phế Tích |

- Đồng bộ `p2game.json` và `public/p2game.json`. Đổi favicon trong `index.html` sang avatar mới. Cập nhật `scripts/build_p2game_release.mjs` để lần đóng gói được phê duyệt sau này dùng manifest gốc và media đã chuẩn bị. `readReleaseMetadata()` đọc và kiểm tra nguồn để có thể xác minh riêng. [Manifest gốc](../../../p2game.json) · [Manifest web](../../../public/p2game.json) · [Script release](../../../scripts/build_p2game_release.mjs).
- Kiểm thử tự động xác nhận hai manifest giống nhau, kích thước hai ảnh đúng và mọi trường ngoài nhóm media và mô tả khớp baseline. Kiểm tra SDK V1.1 đạt 31/31. Asset avatar và cover được phục vụ nguyên byte qua HTTP 200 trên Vite.
- Dashboard của game hiện hữu cần xác nhận ở lần nghiệm thu P2Game. Nếu Dashboard quản lý bản ghi hiển thị riêng, dùng avatar làm icon, cover làm ảnh bìa và mô tả trong manifest. Tài liệu web trả HTTP 403 từ Cloud. Kích thước xuất dựa trên handbook lưu trong repo.

## CLOUD-02A — PASS · Cinematic Main Menu

- `MainMenuScene.ts` đặt chữ HOLLOW WOODS, subtitle và điều hướng ở bên trái, artwork Fellor ở bên phải. Lớp rừng từ `WEB_BG.png`, sương dùng texture có sẵn, nút dùng chất liệu UI Pack runtime. `PreloadScene.ts` khai báo atlas và ảnh dự phòng, `ASSETS_MANIFEST.json` ghi các đường dẫn runtime mới. Artwork diorama trước đây được giữ trong kho asset. [Scene](../../../src/scenes/MainMenuScene.ts) · [Preload](../../../src/scenes/PreloadScene.ts) · [Nguồn nền](<../../../Pixel_Art/Black Knight/WEB_Images/WEB_BG.png>).
- Tạo `public/assets/ui/menu/black_knight_cinematic.png` gồm 12 frame 640×360, xếp 3×4. Phaser phát lặp ở 10 fps, giữ thứ tự và 100 ms mỗi frame của GIF gốc. Frame tĩnh `black_knight_fallback.png` lấy từ bản GIF không có ánh sáng. Các file cùng thư mục gồm `black_knight_woodland.png`, `black_knight_button.png` và `black_knight_button_hover.png`. [Atlas](../../../public/assets/ui/menu/black_knight_cinematic.png) · [Ảnh tĩnh](../../../public/assets/ui/menu/black_knight_fallback.png) · [GIF dự phòng nguồn](<../../../Pixel_Art/Black Knight/WEB_Images/Cover_GIF/Black_Knight_Art.gif>).
- Chromium 1280×720 xác nhận frame đổi và pixel artwork thay đổi. Đã bấm New Game, Continue, Cài đặt, Bảng xếp hạng, Biên niên sử và Điều khiển, thử mũi tên, Enter, H và Esc. Bản lưu cách ly schema 3 từ `SaveManager` xuất hiện trên nút Continue và tải lại Fog Crossing. Khi làm cho atlas lỗi giải mã trong phiên QA riêng, Scene hiển thị ảnh tĩnh. UI Pack đạt 25/25 và kiểm kê đường dẫn runtime đạt 211/211.
- Ảnh đối chiếu ghi từ Canvas trình duyệt. [Main Menu trước](Visuals/V153_BATCH_02/menu-before.png) · [Main Menu sau](../../../public/media/screen_v153_01_main_menu.png) · [Dự phòng](Visuals/V153_BATCH_02/menu-fallback.png).

## CLOUD-02B — PASS · Render, typography và UI

Đo runtime cho thấy Canvas backing 1280×720, camera thế giới 2,2× và UI 1×. Baseline luôn ép CSS `pixelated` kể cả khi Canvas hiển thị 1,25× hoặc 1,5×. Tại Chromium, khoảng trắng của chuỗi font dự phòng từng rộng 12 px ở HUD 10 px. Phaser cũng áp lại bộ lọc NEAREST cho Text khi tải lại bitmap chữ vào WebGL. Tiêu đề nhiệm vụ rộng 394 px trong baseline.

- `main.ts`, `ScaleManager.ts` và `GameConfig.ts` dùng kích thước hiển thị và DPR để chọn `pixelated` ở bội số nguyên, lấy mẫu mặc định của trình duyệt ở bội số lẻ. Sprite giữ bộ lọc riêng và camera giữ zoom cũ. `HDTextHelper.ts` tạo bitmap chữ ít nhất 2× và áp lại LINEAR mỗi lần Phaser cập nhật Text. `index.html` nạp hai font Noto Sans cục bộ, có đủ ký tự tiếng Việt dựng sẵn và dấu tổ hợp. [Giấy phép SIL OFL](../../../public/assets/ui/fonts/OFL-NotoSans.txt).
- Sửa nhãn chỉ số, Quest Tracker, nhắc tương tác và số lượng vật phẩm trong `UIScene.ts`, nhãn NPC trong `NPCEntity.ts`, bố cục chữ trong `JournalModal.ts`, `EquipmentModal.ts`, `CraftingModal.ts` và `ItemTooltipHelper.ts`. Cài đặt, Tạm dừng và Hội thoại hưởng phần sửa font và bộ lọc chung. `ASSETS_MANIFEST.json` có hai WOFF và giấy phép. Điều kiện Thể Lực, cơ chế chạy và dữ liệu game khớp baseline.
- Chromium xác nhận ở DPR 1 rằng Canvas giữ 1280×720, CSS lần lượt dùng `pixelated`, `auto` và `auto` ở ba kích thước dưới. Bộ lọc Text đổi từ 9728 sang 9729. Nhãn HUD 11,5 px có khoảng trắng xấp xỉ 2,99 px. Tiêu đề nhiệm vụ còn 278 px và phần nội dung 307 px trong panel 340 px. Đã thử chữ Việt có dấu trong menu, tên NPC, thoại mẫu dài, nhắc tương tác, Sổ tay, Chế tạo, Trang bị, Cài đặt và Tạm dừng. HUD/Stamina đạt 18/18.
- Trong iframe cục bộ khác cổng, Canvas hiển thị 1600×900 ở DPR 1,25. Chuột mở New Game, phím D di chuyển, F đổi trạng thái Vòng Sáng và F9 bật/tắt Developer Mode. Sprite đo được NEAREST (9728), Text đo được LINEAR (9729). Hover ô Hương Trầm Tinh Thần hiển thị số lượng và tooltip tiếng Việt. Dòng dài nhất rộng 231 px trong khung 260 px. [Tooltip trong iframe cục bộ](Visuals/V153_BATCH_02/iframe-tooltip.png).

| Kích thước Canvas hiển thị | Baseline | Batch 02 |
|---|---|---|
| 1280×720 | [Trước](Visuals/V153_BATCH_02/before-hud-1280.png) | [Sau](Visuals/V153_BATCH_02/after-hud-1280.png) |
| 1600×900 | [Trước](Visuals/V153_BATCH_02/before-hud-1600.png) | [Sau](Visuals/V153_BATCH_02/after-hud-1600.png) |
| 1920×1080 | [Trước](Visuals/V153_BATCH_02/before-hud-1920.png) | [Sau](Visuals/V153_BATCH_02/after-hud-1920.png) |

[Cài đặt, Túi đồ/Chế tạo, Sổ tay, Trang bị, Tạm dừng, Hội thoại và Tương tác trước và sau](Visuals/V153_BATCH_02/ui-panels-before-after.jpg).

## CLOUD-P2-02 — PASS · Sáu ảnh runtime

Đã chọn sáu PNG 1280×720 chụp trực tiếp từ Canvas Chromium. Các cảnh sau menu đi qua bản đồ và đối tượng hiện có, với điểm xuất phát chọn bằng tham số QA có sẵn của game. Phím chơi thật dùng để di chuyển, bật Vòng Sáng, đánh và mở Chế tạo. Crooked Path ghi nhận một đòn cận chiến thực sự trúng Kẻ Lắng Nghe. Silent Mire chụp trên cầu với Vòng Sáng bật. Ảnh lấy từ phiên QA cách ly, Developer Mode tắt và khung hình chỉ chứa game. [Contact sheet](Visuals/V153_BATCH_02/p2game-contact-sheet.png).

| Thứ tự | Khung hình | Đường dẫn tương đối trong manifest |
|---|---|---|
| 1 | Main Menu mới với Black Knight | [media/screen_v153_01_main_menu.png](../../../public/media/screen_v153_01_main_menu.png) |
| 2 | Bellhollow Village và lửa trại | [media/screen_v153_02_bellhollow.png](../../../public/media/screen_v153_02_bellhollow.png) |
| 3 | Outer Woods và trạm lửa | [media/screen_v153_03_outer_woods.png](../../../public/media/screen_v153_03_outer_woods.png) |
| 4 | Giao chiến ở The Crooked Path | [media/screen_v153_04_crooked_path.png](../../../public/media/screen_v153_04_crooked_path.png) |
| 5 | Vòng Sáng tại Silent Mire | [media/screen_v153_05_silent_mire.png](../../../public/media/screen_v153_05_silent_mire.png) |
| 6 | Túi đồ và Chế tạo | [media/screen_v153_06_crafting.png](../../../public/media/screen_v153_06_crafting.png) |

`assets.screenshots` trong hai manifest dùng thứ tự trên. Bốn ảnh trước vẫn có trong `public/media/`. Cả sáu PNG giải mã được, đúng kích thước và trả HTTP 200 cùng nội dung nguyên byte trên Vite. Nếu Dashboard duy trì gallery riêng, thứ tự trong bảng là thứ tự tải lên đề xuất. Bộ ảnh quảng bá cuối cần được chụp lại khi Black Knight bốn hướng đã chạy trong gameplay. [Gallery trước](../../../public/media/screen_01_bellhollow_v15.png) · [Gallery sau](Visuals/V153_BATCH_02/p2game-contact-sheet.png).

## Kiểm tra cuối và giới hạn

| Loại | Kết quả |
|---|---|
| Source | `npx tsc --noEmit`, `git diff --check` và `node --check scripts/build_p2game_release.mjs` đạt. Mã Save/Load, Cloud Save, SDK, các map, nhiệm vụ, SatyrPlayer, registry animation và Developer Mode giữ nguyên so với baseline. |
| Tự động | P2Game SDK 31/31, UI Pack 25/25, HUD/Stamina 18/18, kiểm kê asset 211 hợp lệ và 0 thiếu, iframe focus/layout 28/28, dữ liệu 15/15. Hai manifest đồng nhất. HTTP 200 cho 8 URL media và 8 mục UI mới. Hai test UI V1.5.2 được cập nhật để kiểm tra bộ 28 UI Pack trong danh mục mở rộng và typography hiện tại. |
| Tự động · Save cũ | `verify_v15_27_performance_and_save_compatibility.mjs` đạt 48/49 ở cả HEAD và batch. Một assertion lịch sử đòi `buildSaveData` ghi `1.5.0`, trong khi mã baseline ghi `1.5.1`. Đã chạy lại các file nguyên bản từ Git để xác nhận hai kết quả trùng nhau. |
| Browser thực tế | Chromium WebGL chạy New Game, Continue từ Save schema 3, menu động và fallback, các panel và ba kích thước Canvas. Lượt standalone sạch có 0 lỗi JS, 0 console error và 0 HTTP error. Thử ảnh tĩnh dự phòng có chủ đích làm atlas lỗi giải mã. |

SDK V1.1 và các ID hiện hữu được giữ trong source và manifest. URL script SDK báo `ERR_TUNNEL_CONNECTION_FAILED` trong Cloud, nên các lượt Chromium chạy nhánh dự phòng standalone. Việc xác minh Dashboard và iframe hosted cần một phiên trên P2Game. Bài kiểm tra gói lịch sử V1.5.0 phụ thuộc ZIP đã tạo và dữ liệu media cũ. Batch dừng ở mã nguồn, asset và tài liệu trong worktree.

Danh mục asset lịch sử vẫn có mục `public/assets/characters/mossbound_wayfarer.rar` từ baseline. Archive này vắng trong Cloud. Đã đối chiếu riêng tám mục mới với số byte trên đĩa và response HTTP. Sprite và texture mà game nạp nằm trong lượt kiểm kê 211 đường dẫn.

**Nhiệm vụ tiếp theo đề xuất** CLOUD-01C dùng hai turnaround để vẽ các frame theo hướng còn thiếu, đối chiếu mẫu gốc, mép trong suốt, bàn tay cầm kiếm và anchor trước khi đưa vào runtime.
