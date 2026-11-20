# HOLLOW WOODS V1.5.3 — 04C-K1 Runtime Black Knight

**20/11/2026 · PASS cho nhóm Armed Idle bốn hướng và lỗi registry đã tái hiện · PARTIAL toàn bộ bộ hoạt ảnh · HOSTED BLOCKED**

| Mốc | Kết quả |
|---|---|
| Nhánh | `feat/v1.5.3-batch04`, worktree `/workspace/work/v153-b04/checkout` |
| Điểm đầu | `c89cb8ec06b462d4b3d15387d138b9723cf64824`, xác minh local và GitHub trước khi chỉnh |
| Commit có mã và atlas đã kiểm thử | `0b16b7d4e531607de8bc98053f07a995367b3666` |
| Bàn giao K1 đã xác minh | `7cde6db2a7f7a1d9617c21121687889fd8878d7f` trên GitHub. Bản xuất bổ sung này nằm ở commit tài liệu nối tiếp trên cùng nhánh. Main đối chiếu `b5eaa612f7011b7d9fdc657d31310082d08f281b`, QA Batch 03-R2 `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`. |
| Môi trường | Phaser 4.2.1, TypeScript strict, Vite 5.4.21 và Chromium 156 Cloud. Canvas trên build public và WebGL SwiftShader trên build QA. |

Bắt đầu từ checkpoint 04A sạch. Giữ Save schema 3, SDK v1.1, hai manifest P2Game, Game ID/Leaderboard ID, Developer Mode và các ca 04A đã đóng. Giữ các asset runtime cũ, portrait, migration BlackKnightPlayer, năm bảng tham chiếu và toàn bộ Source Library. Đối chiếu checksum **386 tệp** trong Source Library và Custom_4Dir trước/sau, gồm đủ 324 frame nguồn. K1 chỉ đóng gói 24 frame Armed Idle vào tài nguyên sử dụng trong game. Kho Fellor và các frame rời giữ trong workspace thiết kế theo điều khoản phân phối. [Checkpoint 04A](V153_B04A_RESUME_REPORT.md) · [Giấy phép Fellor](<../../../Pixel_Art/Black Knight/License.txt>).

## Kết quả kế thừa từ các Batch trước

| Mã | Trước K1 | Trạng thái sau K1 |
|---|---|---|
| CLOUD-01A | Đã trích 34 chuỗi, 324 PNG và metadata nguồn từ Fellor. | Kế thừa. Checksum khớp, dùng lại 6 frame RIGHT hiện có. |
| CLOUD-01B | Năm bảng tham chiếu đã hoàn thành. | Kế thừa. Dùng lại artwork đã có và chỉ chỉnh frame đưa vào nhóm Armed Idle. |
| CLOUD-01X | Portrait đã hiển thị trong Chromium. | Kế thừa từ Batch 03-R2. |
| CLOUD-01Y-R | Migration BlackKnightPlayer và alias đã có. | Kế thừa migration. K1 kiểm chứng lại mapping runtime do thay registry. |
| CLOUD-P2-01/02 | Avatar, cover, gallery và hai manifest đã có. | Kế thừa từ Batch 02. |
| CLOUD-02A và CLOUD-02B | Main Menu GIF và HUD Running đã tích hợp. | Kế thừa từ Batch 02/03. |
| B04-00, B04-00A/B/C, B04-00D, BUG-024 | Git/audit đã bàn giao. Các ca startup production local đã kiểm chứng. Hosted còn BLOCKED. | Kế thừa. K1 chỉ khởi động hai build để kiểm tra tài nguyên và luồng nhân vật. |
| B04-01 | Kiểm toán asset runtime đạt. Ba tham chiếu TSX editor còn vắng. | Kiểm tra manifest mới của K1. Phần editor chờ 04B1/04B2. |
| B04-02A, B04-02C, BUG-031, BUG-037, LEG-R8-14 | Đã kiểm chứng cục bộ cách ly QA, vòng đời, panel, phím tắt và nền input. | Kế thừa. K1 mở F9 để đọc hoạt ảnh và chạy Save/Continue trên hai profile. |
| B04-02B/D/E | Các ca đại diện đã kiểm chứng. Bao phủ Inspector, hitbox/hurtbox và Tinh Thần còn PARTIAL. | Kế thừa PARTIAL. Checkpoint giữ owner cho từng mục còn mở. |
| Save schema 3 | Roundtrip và tương thích đã kiểm chứng. | Chạy lại regression liên quan và Save/Continue sau tích hợp atlas. |

[Batch 02](V153_BATCH_02_IMPLEMENTATION.md) · [Batch 03-R2](V153_BATCH_03_IMPLEMENTATION.md) · [Batch 04A](V153_B04A_RESUME_REPORT.md) · [Checkpoint](V153_BATCH_04_CHECKPOINT.md).

## Artwork, atlas và runtime

| Hướng | Nguồn artwork và kiểm tra | Atlas · frame runtime |
|---|---|---|
| DOWN | 6 frame bổ sung ImageGen từ Batch 03-R2. Xử lý 6 pixel viền xanh ở lưỡi kiếm. | Hàng 0 · `armed_idle_down_0…5` · Chromium quan sát 6/6 |
| UP | 6 frame bổ sung ImageGen từ Batch 03-R2. Xử lý 1 pixel viền xanh ở lưỡi kiếm. | Hàng 1 · `armed_idle_up_0…5` · Chromium quan sát 6/6 |
| LEFT | 6 frame R2 khôi phục từ thư mục trích thử `/workspace/work/v153-batch-03/armed-idle-left-r2`. Hash ảnh ImageGen gốc `9053abcc4536c7128e46d7b80820d736f36ce776df96323f2a686837f33ee8ae`. Xử lý 12 pixel viền xanh, cân giáp/áo choàng về tông tối của RIGHT, hiệu chỉnh tông vàng lưỡi kiếm và giữ chùm lông đỏ cùng tư thế tay cầm của R2. | Hàng 2 · `armed_idle_left_0…5` · Chromium quan sát 6/6 |
| RIGHT | 6 frame Fellor trong `03-armed-idle`, cell 032–037. RGBA so khớp từng byte trong vùng cắt. Nguồn profile có phần mũ trụ tối hơn ba hướng bổ sung. | Hàng 3 · `armed_idle_right_0…5` · Chromium quan sát 6/6 |

Atlas PNG RGBA **384×256**, 24 vùng **64×64**, loop **70 ms/frame** và **420 ms/chu kỳ**. Tất cả ô đều có artwork, điểm cuối vùng alpha ở y=63 theo tọa độ biên của ảnh. Crop vùng trong suốt từ canvas nguồn **144×64** với hộp `[40,0,104,64]`. Không cắt pixel có alpha, không co kéo, không lật nguồn RIGHT để tạo LEFT. Origin runtime vẫn `0.5,1.0`, body **18×12** offset **23,46** trên cả atlas và sprite legacy. Phaser dùng pixel art nearest. [PNG trong game](../../../public/assets/characters/black_knight/black_knight_armed_idle.png) · [Metadata, source SHA từng frame và vùng atlas](../../../public/assets/characters/black_knight/black_knight_armed_idle.json).

| Asset mới | Size · SHA-256 |
|---|---|
| `public/assets/characters/black_knight/black_knight_armed_idle.png` | 26.670 B · `ff47e472f4c50bae5970fd6022633a2037f53bc04e8b3e4876c7d5bcd6ec092c` |
| `public/assets/characters/black_knight/black_knight_armed_idle.json` | 16.183 B · `9f2fd1ee078d818198e0a49a8ffa9dc29558a0013a2baf65ec12675aed81af7d` |

Loader nạp hai tệp tương đối trong Preload khi `WAYFARER_USE_PURE_ARTIST_SPRITES=true`. Texture `black_knight_armed_idle` cấp frame cho `wayfarer_idle_<dir>` và alias `satyr_idle_<dir>` cùng hướng. `BlackKnightPlayer` tiếp tục chọn state theo vũ khí và input, bỏ lật sprite theo nhánh legacy do cả hai tên khóa đều dùng frame có hướng sẵn. Khi atlas thiếu một hướng hoặc một frame, registry dùng cả bốn clip Idle hiện hành và giữ cảnh báo thật hiển thị. [Loader](../../../src/scenes/PreloadScene.ts#L498) · [Registry](../../../src/animation/BlackKnightAnimations.ts#L56) · [Player](../../../src/entities/BlackKnightPlayer.ts#L1300).

## Kết quả từng mã trong đợt K1

| Mã | Trước K1 | Cách xử lý và bằng chứng | Sau K1 |
|---|---|---|---|
| B04-10-K1 | Artwork chưa tích hợp. | Kết nối Preload → atlas → registry → BlackKnightPlayer. Chromium quan sát 24 frame ở 4 hướng trên hai build. | RUNTIME_TESTED cho Armed Idle. |
| CLOUD-01C | DOWN/UP đã có frame bổ sung, RIGHT có nguồn Fellor, LEFT R2 có nhiễm màu và giáp sáng hơn. | Làm sạch viền, cân palette LEFT R2, xử lý các pixel viền kiểm được ở UP/DOWN. Cả nhóm chạy đủ 6 frame mỗi hướng. | RUNTIME_TESTED cho Armed Idle. |
| CLOUD-01Y | Chưa có atlas mới đã nạp. | Đóng gói PNG/JSON, kiểm byte, alpha, vùng cắt và ký hiệu cho 24 frame. Hai build nạp PNG/JSON qua HTTP 200. | PARTIAL toàn bộ atlas, đạt nhóm Armed Idle. |
| CLOUD-01Z | BlackKnightPlayer dùng asset hiện hành. | Chọn atlas theo state và hướng, giữ alias, kiểm idle → walk/run → hành động, Save/Continue và fallback khi atlas thiếu frame. | PARTIAL toàn bộ tích hợp, đạt nhóm Armed Idle. |
| BUG-032 phần frame | OPEN. Baseline ghi 136 cảnh báo `satyr_sheet`. | Loader chỉ có frame 0…15. Registry đọc bảng cũ đòi tới frame 49 trước khi ghi đè cùng khóa. Bỏ lượt đăng ký sai nguồn. Frame 16/17 từng xuất hiện 8 lần mỗi frame và 20/21 xuất hiện 5 lần mỗi frame. Hai build chuẩn ghi 0 cảnh báo missing-frame. | CLOSED-VERIFIED local cho lỗi frame. Bộ đếm vật lý thuộc kết quả 04A. |
| LEG-R8-03 | OPEN với cảnh báo frame và các triệu chứng combat. | Cùng nguyên nhân và sửa registry như BUG-032. Kiểm 72 cặp khóa có hướng, 15 cặp khóa không hậu tố và 467 tham chiếu frame phía Wayfarer. | CLOSED-VERIFIED local cho registry. Combat toàn bộ, Hurt và Death còn mở. |
| BUG-051 | Owner báo Cổng Đông vẫn khóa sau ba NPC. | Ghi registry và hàng chờ 04C-G. Nguyên nhân gameplay chưa xác minh. | OPEN tại 04C-G. |
| BUG-052 | Yêu cầu một trong ba hội thoại mở cổng. | Ghi tiêu chí Garth hoặc Edda hoặc Neris. Chưa thử từng nhánh hội thoại. | OPEN tại 04C-G. |
| BUG-053 | Owner báo nhiệm vụ nhận từ Sir Vaelen/NPC chưa xuất hiện. | Ghi ca cần kiểm tra quest ID và sự kiện cập nhật. Nguyên nhân chưa xác minh. | OPEN tại 04C-G. |
| BUG-054 | Yêu cầu đồng bộ nhiệm vụ đang theo dõi. | Ghi phạm vi HUD, Sổ Tay, World Map và Save/Load. Nguyên nhân chưa xác minh. | OPEN tại 04C-G. |
| B04-10-K2/K3 | 25 nhóm còn thiếu coverage runtime bốn hướng. | Giữ ma trận và các ca còn thiếu. Công việc thuộc các Batch sau. | OPEN theo lịch R10. |

[Registry tester](V153_TESTER_BUG_REGISTRY.md) · [Ma trận đầy đủ](V153_CHARACTER_ANIMATION_MATRIX.md).

## Kiểm thử và ảnh

| Ca thực chạy | Kết quả |
|---|---|
| `npx tsc --noEmit`, `git diff --check` | Exit 0. |
| `python scripts/pack_v153_black_knight_armed_idle.py <Black Knight source> <LEFT R2 frames> --output <temp>` | Đóng gói lại khớp từng byte hai tệp đã commit. |
| `node scripts/generate_assets_manifest.mjs` · `node scripts/verify_zero_404_assets.mjs` | Manifest 247 file. Loader/Audio **212/212** đường dẫn, 0 thiếu. |
| `node scripts/test_v153_save_schema3.mjs` · `node scripts/verify_v15_27_performance_and_save_compatibility.mjs` | Cả hai exit 0, Save lịch sử **49/49**, khóa QA và tương thích schema 3 đạt. |
| `node_modules/.bin/vite build --outDir <temp>` · `VITE_HOLLOW_WOODS_QA=1 node_modules/.bin/vite build --outDir <temp>` | Build production cục bộ và QA đạt. Không đóng gói bản phát hành. Kiểm thử tại subpath `/preview/hollow-woods/`. |
| Chromium với input S/↑/A/→ | New Game, nối Walk → Armed Idle ở cả bốn hướng, thấy đủ 6 tên frame/hướng trong mỗi build. Không lật X, origin và kích thước body đúng. Canvas public và WebGL QA cùng nạp atlas PNG/JSON với HTTP 200. |
| Chromium chuyển state | Shift+→ chạy, Space đánh thường, X tra/rút kiếm qua unarmed Idle, sau đó về atlas. Ca riêng xác minh K Trọng Kích UP, R Tuyệt Kỹ LEFT, V Đỡ Đòn DOWN, Z Lăn RIGHT, rồi về đúng Idle từng hướng. Các clip hành động dùng asset legacy. |
| Chromium lưu/nạp | Esc → nút Lưu thủ công → reload → nút Tiếp tục. Tọa độ và zone khớp sau nạp schema 3, source frame trở về atlas theo hướng DOWN. Public và QA dùng profile cục bộ riêng. |
| Chromium QA F9 | Inspector báo `Animation wayfarer_idle_right #3`. |
| Chromium fixture cắt một entry atlas | Bỏ entry `armed_idle_up_5` khỏi response JSON. Có cảnh báo chính xác, bốn hướng về đầy đủ clip `wayfarer_idle`, 0 lỗi trang và 0 cảnh báo `satyr_sheet`. |

### Console và cảnh báo còn thấy

| Nguồn | Cảnh báo và phạm vi |
|---|---|
| Baseline Chromium c89cb8e | 136 callback cảnh báo thiếu frame từ `satyr_sheet`. |
| Chromium public và QA tại runtime 0b16b7d | 0 missing-frame, JS exception, HTTP 4xx hoặc request fail trong hai lượt chuẩn. SDK mock chủ động chọn standalone, nên có thông báo SDK không tìm thấy `window.p2`. |
| Chromium QA SwiftShader | Có cảnh báo auto-fallback chất lượng khi FPS dưới 38 trong 4 giây. Log đo 6,0 FPS tại thời điểm đó và hạ về MEDIUM. Đây là số của máy Cloud dùng phần mềm. Nghiệm thu hiệu năng thiết bị thật thuộc 04E2. |
| Fixture atlas hỏng có chủ đích | Cảnh báo thiếu đúng `armed_idle_up_5`. App giữ cả bốn hướng Idle cũ và 0 lỗi trang. |
| Vite local | Cảnh báo thư mục build ngoài project, script startup tải tĩnh và hai font WOFF giữ URL để phân giải lúc chạy. Build exit 0, lượt Chromium có 0 HTTP 4xx. |

[Log JSON của baseline, các clip, network, Save và console](Visuals/V153_B04C_K1/runtime-checks.json).

### Ảnh trước và sau

- **Trước K1.** Chromium mở build QA checkpoint `c89cb8e` và đi bằng bàn phím tại Fog Crossing. Bốn hướng dùng texture cũ `wayfarer_idle`. [Bốn hướng trước sửa](Visuals/V153_B04C_K1/armed-idle-baseline-details.png) · [Ảnh LEFT trước, nguyên khung](Visuals/V153_B04C_K1/armed-idle-baseline-left.png).
- **Sau K1.** Bốn screenshot 1280×720 chụp từ build QA Canvas trong Fog Crossing sau input thật, với điểm xuất phát QA tránh lời nhắc che nhân vật. Ảnh ghép cắt từ các screenshot này. [Bốn hướng cận cảnh](Visuals/V153_B04C_K1/armed-idle-runtime-details.png) · [DOWN](Visuals/V153_B04C_K1/armed-idle-down.png) · [UP](Visuals/V153_B04C_K1/armed-idle-up.png) · [LEFT](Visuals/V153_B04C_K1/armed-idle-left.png) · [RIGHT](Visuals/V153_B04C_K1/armed-idle-right.png) · [F9](Visuals/V153_B04C_K1/qa-f9-armed-idle.png) · [Continue public](Visuals/V153_B04C_K1/production-continue.png).

## Tệp thay đổi

| Thay đổi | Đường dẫn | Mục đích |
|---|---|---|
| Sửa | `ASSETS_MANIFEST.json` | Đăng ký PNG/JSON mới. |
| Sửa | `src/config/Constants.ts` | Bật atlas đã kiểm chứng và khai báo texture key. |
| Sửa | `src/scenes/PreloadScene.ts` | Nạp PNG/JSON bằng đường dẫn tương đối. |
| Sửa | `src/animation/BlackKnightAnimations.ts` | Đăng ký hướng, alias, kiểm đủ frame và chọn fallback. |
| Sửa | `src/entities/BlackKnightPlayer.ts` | Bỏ lật sprite theo phỏng đoán legacy khi đã có frame đúng hướng. |
| Thêm | `scripts/pack_v153_black_knight_armed_idle.py` | Đóng gói và xác thực atlas từ nguồn đã kiểm chứng. |
| Thêm | `public/assets/characters/black_knight/black_knight_armed_idle.png` | Atlas hiển thị trong game. |
| Thêm | `public/assets/characters/black_knight/black_knight_armed_idle.json` | Metadata atlas, nguồn, checksum, vùng và nhịp. |
| Sửa | `Read/V1.5/README_INDEX.md` | Mục liên kết báo cáo K1. |
| Sửa | `Read/V1.5/Reports/V153_BATCH_04_CHECKPOINT.md` | Checkpoint và owner phần còn mở. |
| Sửa | `Read/V1.5/Reports/V153_BATCH_04_IMPLEMENTATION.md` | Kết quả tổng hợp K1. |
| Sửa | `Read/V1.5/Reports/V153_CHARACTER_ANIMATION_MATRIX.md` | Coverage hoạt ảnh và provenance. |
| Sửa | `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md` | Trạng thái BUG-032 và backlog BUG-051–054. |
| Thêm | `Read/V1.5/Reports/V153_B04_K1_RUNTIME_REPORT.md` | Bản xuất Markdown này. |
| Thêm | `Read/V1.5/Reports/Visuals/V153_B04C_K1/` | `armed-idle-baseline-details.png`, `armed-idle-baseline-left.png`, `armed-idle-down.png`, `armed-idle-up.png`, `armed-idle-left.png`, `armed-idle-right.png`, `armed-idle-runtime-details.png`, `production-continue.png`, `qa-f9-armed-idle.png` và `runtime-checks.json`. |

Tổng 24 tệp so với checkpoint 04A. [Diff GitHub](https://github.com/KyoshiroKyo/HOLLOW-WOODS/compare/c89cb8ec06b462d4b3d15387d138b9723cf64824...feat/v1.5.3-batch04).

## Blocker và phần còn mở

- K2/K3 tiếp tục Unarmed Idle, Walk, Run, combat, kỹ năng và các state còn thiếu. K1 nghiệm thu nội dung **1/26 nhóm bốn hướng**. Tỷ lệ/head pose có thể khác khi chuyển sang các clip legacy. Chưa nghiệm thu từng kỹ năng trong cả bốn hướng, nhánh Hurt/Death và hành động hiếm trong playthrough. [Ma trận coverage](V153_CHARACTER_ANIMATION_MATRIX.md).
- Raw Custom_4Dir và Source Library có trong worktree thiết kế cục bộ khi làm K1. Nếu môi trường tiếp theo thiếu thư mục đó, lấy lại từ kho dự án được cấp quyền theo provenance trong JSON. Atlas đã tích hợp được lưu trong Git.
- Kế thừa HOSTED BLOCKED và gate release từ 04A. Cloud nhận CONNECT 403 khi truy cập SDK hosted và chưa có URL preview cùng log Console/Network thật của bản người chơi gặp lỗi. Phần còn mở của 04A đã gắn owner theo lịch R10. [Checkpoint](V153_BATCH_04_CHECKPOINT.md).

Dừng sau K1. Theo INDEX R10, command đầu tiên tiếp theo sau khi Owner duyệt là `V153-BATCH-04B1 EXECUTE REMAINING ONLY`. Để gửi ChatGPT nghiệm thu, tải tệp Markdown gốc và đính kèm hai ảnh ghép trước/sau cùng log JSON khi cần đối chiếu. [Lệnh 04B1](../../../docs/chat_and_commands/V153_BATCH04_R10/03_V153_B04B1_PLAYTEST_MAP_CAMERA_TERRAIN.md).
