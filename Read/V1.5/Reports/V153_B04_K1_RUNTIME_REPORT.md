# HOLLOW WOODS V1.5.3 — 04C-K1 Runtime Black Knight

**20/11/2026 · PASS cho nhóm Armed Idle bốn hướng và lỗi registry đã tái hiện · PARTIAL toàn bộ bộ hoạt ảnh · HOSTED BLOCKED**

| Mốc | Kết quả |
|---|---|
| Nhánh | `feat/v1.5.3-batch04`, worktree `/workspace/work/v153-b04/checkout` |
| Điểm đầu | `c89cb8ec06b462d4b3d15387d138b9723cf64824`, xác minh local và GitHub trước khi chỉnh |
| Commit có mã và atlas đã kiểm thử | `0b16b7d4e531607de8bc98053f07a995367b3666` |
| Checkpoint bàn giao | HEAD nhánh phát triển chứa báo cáo và ảnh K1. Main đối chiếu `b5eaa612f7011b7d9fdc657d31310082d08f281b`, QA Batch 03-R2 `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`. |
| Môi trường | Phaser 4.2.1, TypeScript strict, Vite 5.4.21 và Chromium 156 Cloud. Canvas trên build public và WebGL SwiftShader trên build QA. |

Bắt đầu từ checkpoint 04A sạch. Giữ Save schema 3, SDK v1.1, hai manifest P2Game, Game ID/Leaderboard ID, Developer Mode và các ca 04A đã đóng. Giữ các asset runtime cũ, portrait, migration BlackKnightPlayer, năm bảng tham chiếu và toàn bộ Source Library. Đối chiếu checksum **386 tệp** trong Source Library và Custom_4Dir trước/sau, gồm đủ 324 frame nguồn. K1 chỉ đóng gói 24 frame Armed Idle vào tài nguyên sử dụng trong game. Kho Fellor và các frame rời giữ trong workspace thiết kế theo điều khoản phân phối. [Checkpoint 04A](V153_B04A_RESUME_REPORT.md) · [Giấy phép Fellor](<../../../Pixel_Art/Black Knight/License.txt>).

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

## Lỗi và phạm vi

| Mã | Trước → sau | Xác minh |
|---|---|---|
| B04-10-K1 / CLOUD-01C | PARTIAL → RUNTIME_TESTED · Armed Idle 4/4 | Khắc phục viền và tông giáp LEFT R2. Đủ 24 frame được đăng ký, nạp và hiển thị trong hai build cục bộ. |
| BUG-032 phần frame / LEG-R8-03 phần registry | OPEN → CLOSED-VERIFIED local | Baseline có đúng **136** cảnh báo `satyr_sheet`. Trong đó, frame 16 và 17 mỗi frame xuất hiện 8 lần, frame 20 và 21 mỗi frame xuất hiện 5 lần. Alias texture chỉ có frame 0…15. Registry cũ đăng ký bảng legacy yêu cầu đến frame 49 trước khi ghi đè toàn bộ các khóa đó. Bỏ lần đăng ký sai nguồn. Registry hiện hành giữ 72 cặp khóa có hướng, 15 cặp không hậu tố và 467 tham chiếu frame phía Wayfarer đã được kiểm tra. Hai build sạch có **0** cảnh báo missing-frame. Các hiện tượng combat khác trong LEG-R8-03 tiếp tục ở K2/K3. |
| CLOUD-01Y/Z | BLOCKED toàn bộ → PARTIAL | Atlas và tích hợp đủ một nhóm Armed Idle. Những nhóm khác vẫn có mapping runtime kế thừa. |
| BUG-051–054 | Báo cáo Owner → OPEN tại 04C-G | Cổng Đông và điều kiện Garth hoặc Edda hoặc Neris, hiển thị nhiệm vụ mới và đồng bộ theo dõi. Đã ghi hàng chờ. [Registry](V153_TESTER_BUG_REGISTRY.md) |

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

**Console.** Hai lượt chuẩn có 0 missing-frame, JS exception, HTTP 4xx hoặc request fail. Có cảnh báo SDK standalone đúng fixture và auto-fallback chất lượng trên SwiftShader Cloud. Không dùng số FPS này làm chuẩn thiết bị thật. [JSON kiểm chứng gồm baseline, các clip, network, Save và console](Visuals/V153_B04C_K1/runtime-checks.json).

**Ảnh thực tế.** Bốn screenshot 1280×720 chụp từ build QA Canvas trong Fog Crossing sau input thật, với điểm xuất phát QA tránh lời nhắc che nhân vật. Ảnh ghép cắt từ các screenshot này. [Bốn hướng cận cảnh](Visuals/V153_B04C_K1/armed-idle-runtime-details.png) · [DOWN](Visuals/V153_B04C_K1/armed-idle-down.png) · [UP](Visuals/V153_B04C_K1/armed-idle-up.png) · [LEFT](Visuals/V153_B04C_K1/armed-idle-left.png) · [RIGHT](Visuals/V153_B04C_K1/armed-idle-right.png) · [F9](Visuals/V153_B04C_K1/qa-f9-armed-idle.png) · [Continue public](Visuals/V153_B04C_K1/production-continue.png).

## Tệp thay đổi và phần còn mở

- Runtime có 5 tệp sửa gồm `ASSETS_MANIFEST.json`, `BlackKnightAnimations.ts`, `Constants.ts`, `BlackKnightPlayer.ts` và `PreloadScene.ts`. Thêm hai tệp atlas và `scripts/pack_v153_black_knight_armed_idle.py`. Không xóa tệp.
- Báo cáo, checklist và bằng chứng nằm trong `Read/V1.5/Reports/`. Cập nhật README_INDEX, ma trận nhân vật, registry, checkpoint và báo cáo tổng hợp. [Danh sách thay đổi](https://github.com/KyoshiroKyo/HOLLOW-WOODS/compare/c89cb8ec06b462d4b3d15387d138b9723cf64824...feat/v1.5.3-batch04).
- K2/K3 tiếp tục Unarmed Idle, Walk, Run, combat, kỹ năng và các state còn thiếu. K1 nghiệm thu nội dung **1/26 nhóm bốn hướng**. Tỷ lệ/head pose có thể khác khi chuyển sang các clip legacy. Chưa nghiệm thu từng kỹ năng trong cả bốn hướng, nhánh Hurt/Death và hành động hiếm trong playthrough. [Ma trận coverage](V153_CHARACTER_ANIMATION_MATRIX.md).
- Raw Custom_4Dir và Source Library có trong worktree thiết kế cục bộ khi làm K1. Nếu môi trường tiếp theo thiếu thư mục đó, lấy lại từ kho dự án được cấp quyền theo provenance trong JSON. Atlas đã tích hợp được lưu trong Git.
- Kế thừa HOSTED BLOCKED và gate release từ 04A. Cần URL preview và log thật. Phần còn mở của 04A đã gắn owner theo lịch R10. [Checkpoint](V153_BATCH_04_CHECKPOINT.md).

Dừng sau K1. Theo INDEX R10, command đầu tiên tiếp theo sau khi Owner duyệt là `V153-BATCH-04B1 EXECUTE REMAINING ONLY`. Mở báo cáo tại commit bàn giao trên GitHub và chọn tải Markdown gốc để gửi ChatGPT. [Lệnh 04B1](../../../docs/chat_and_commands/V153_BATCH04_R10/03_V153_B04B1_PLAYTEST_MAP_CAMERA_TERRAIN.md).
