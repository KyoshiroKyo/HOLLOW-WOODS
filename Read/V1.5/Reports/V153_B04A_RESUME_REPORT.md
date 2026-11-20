# HOLLOW WOODS V1.5.3 — 04A · Báo cáo bàn giao R10

**20/11/2026 · PARTIAL tổng thể · Developer Mode và khởi động đã qua các ca nghiệm thu local liệt kê bên dưới · HOSTED BLOCKED**

## Điểm nối Git và phạm vi

| Mốc | Vị trí |
|---|---|
| Điểm đầu kiểm toán và checkpoint Batch 03-R2 | `qa/v1.5.3-batch03-r2` · `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2` · [Draft PR #1](https://github.com/KyoshiroKyo/HOLLOW-WOODS/pull/1) |
| Nhánh bàn giao 04A | `feat/v1.5.3-batch04` · HEAD chứa báo cáo và checkpoint |
| Commit các bản sửa runtime 04A | `35a1cf5181eb69a2ecc6c800e3eb8bbdb45ab8de` · Chốt chẩn đoán và runtime cuối `82468756b40242e29eb9c094a0ae334c02bac24a` |
| Main tại mốc kiểm toán | `b5eaa612f7011b7d9fdc657d31310082d08f281b` |
| Worktree gốc và worktree tách biệt | `/workspace/HOLLOW-WOODS` trên `work` · `/workspace/work/v153-b04/checkout` trên nhánh phát triển |
| Môi trường | Node 24.22.1, npm 11.9.0, Phaser 4.2.1, TypeScript 5.9.3 strict, Vite 5.4.21, SDK v1.1. Chromium Cloud, SwiftShader WebGL và Canvas. Phiên bản package và manifest vẫn là 1.5.2. |

Đã đọc AGENTS cấp repo và Read, AI_IRON_RULES, luật thư mục, checkpoint và báo cáo liên quan. Khảo sát Git trước khi sửa và xác minh checkpoint 03-R2 có trên GitHub. Worktree gốc giữ các thay đổi và 391 checksum tài nguyên nguồn. 04A phát triển từ đúng checkpoint QA trong worktree riêng. Bàn giao trên nhánh phát triển do Owner duyệt. Main, nhánh QA và Draft PR #1 giữ mốc cũ.

Đã lưu nguyên văn 12 tệp R10, gồm chỉ mục và 11 đặc tả, trong thư mục lệnh của dự án. Các mã BUG còn mở giữ owner và thứ tự từ chỉ mục. 04A là nhóm duy nhất được triển khai. [INDEX và hàng chờ](../../../docs/chat_and_commands/V153_BATCH04_R10/00_INDEX_V153_BATCH04_R10.md) · [Checkpoint](V153_BATCH_04_CHECKPOINT.md).

## Trạng thái trước và sau

| Mã | Trước → sau | Tái hiện, nguyên nhân, bản sửa |
|---|---|---|
| B04-00 | Đã bàn giao → CLOSED-VERIFIED | Xác minh remote QA và Draft PR. Bỏ qua triển khai lại checkpoint 03-R2. |
| B04-00A/B/C | Thiếu đối chiếu HEAD → CLOSED-VERIFIED kiểm toán | Tách bản trích đúng QA SHA. So Git, lịch sử V152-DEV-01…04, mã và asset. Các thiếu hụt xác minh được mới chuyển sang hàng sửa. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md) |
| B04-00D | Hai ca B03 đã PASS → PRODUCTION LOCAL PASS regression · HOSTED BLOCKED | SDK chậm, SDK init treo và đường standalone được giữ. Kiểm tra root, subpath, iframe, module 404, ảnh fallback và Canvas. [Startup](V153_P2GAME_BLACK_SCREEN_REPORT.md) |
| BUG-024 | OPEN → CLOSED-VERIFIED production local · HOSTED BLOCKED | Dùng Chromium và HTTP WAV phản hồi 200 nhưng truyền từng đoạn. Màn HTML cũ hiện Tải lại từ đầu, watchdog tuyệt đối hết hạn trong khi Preload còn tải. `index.html` chỉ hiện Retry khi có lỗi. `public/startup-status.js` và `PreloadScene.ts` nhường phần hiển thị cho loader Phaser, dùng tiến trình tổng và byte thật để gia hạn, báo lỗi hữu hạn khi request đứng yên. [Trước](Visuals/V153_BATCH_04A/r10-loader-before.png) · [Sau](Visuals/V153_BATCH_04A/r10-loader-after.png) · [Request đứng yên](Visuals/V153_BATCH_04A/r10-loader-stall.png) |
| B04-01 | Inventory cần chốt → PASS runtime · PARTIAL editor | Sửa generator có phân loại chồng nhau. 245 runtime manifest entry khớp file và size, 176 PNG đọc được, 65 luồng audio, 51 vùng atlas, 51 tile layer. 210/210 đường dẫn loader. Các map Tiled tham chiếu `src/data/maps/tilesets/Tileset_Ground.tsx`, `Objects_Props.tsx` và `Objects_Buildings.tsx`. Ba tệp vắng tại checkpoint nên việc mở map trong editor còn thiếu tileset. Runtime boot dùng asset đóng sẵn và Arcade body. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md) · [QA](V153_BATCH_04_FINAL_QA.md) |
| B04-02A / V152-DEV-01 / LEG-R8-14 | OPEN tại baseline → CLOSED-VERIFIED local | F9 từng mở mà chưa đánh dấu QA. Noclip có thể lưu ở khóa thường. SDK submit chờ xác thực từng lọt qua guard. `DevSessionPolicy.ts`, `CloudSaveService.ts`, `SaveManager.ts`, `LeaderboardService.ts` và `EndingSystem.ts` tạo namespace QA, giữ dấu phiên và kiểm tra lại sau await. Profile QA không ghi tiến trình vào khóa thường, mock không nhận lệnh lưu hay gửi điểm. |
| B04-02B / V152-DEV-02 | PARTIAL → PASS ca đại diện | Chỉnh các điều khiển có UI nhưng thiếu hiệu lực, như giờ NIGHT, nguồn spawn, Infinite Composure và freeze. God Mode được chặn thêm tại các điểm nhận damage trực tiếp đã xác minh. Các thao tác làm thay đổi nhân vật, zone, item, khí hậu và ending ở lượt QA. [Ca kiểm thử](V153_B04_DEV_MODE_UPGRADE_REPORT.md) |
| B04-02C / V152-DEV-03 | OPEN → CLOSED-VERIFIED local cho hotkey, quyền và cleanup | Ctrl+Shift+F9 cũ có thể bật Dev và giữ cheat. `GameScene.ts` ép tắt theo trạng thái, dọn hiệu ứng, bỏ qua repeat và input đang sửa. Sau 5 restart có một DOM panel và một listener Dev. Build public không mở Dev bằng F9 và query, build QA vào F9 theo hướng dẫn. |
| BUG-031 | OPEN → CLOSED-VERIFIED local | Bellhollow gần Edda khoảng (1100,167) từng hiện panel năm tab và bảng cyan riêng. Bỏ đường render bảng cyan, đưa số đo vào Log & Hiệu năng. F8 QA và phím F10 vẫn hoạt động. [Trước](Visuals/V153_BATCH_04A/before-f9-tab-1.png) · [Sau](Visuals/V153_BATCH_04A/r10-single-dev-panel.png) |
| BUG-032 | OPEN → PARTIAL | Đối chiếu đúng Arcade World. Ở fixture Edda có 4 quan hệ va chạm đang bật, 228 body tĩnh bật, 8 body động bật, 695 object scene. Một quan hệ có thể dùng một group gồm nhiều body. Cảnh báo gốc được giữ và số lần lặp liền nhau được gộp. Frame `satyr_sheet` 16/17/20/21 từ ảnh tester giữ OPEN ở 04C-K1. |
| BUG-037 | OPEN → CLOSED-VERIFIED local cho nền input | `src/main.ts` từng giành focus bằng pointerdown và click toàn trang. Listener lấy focus giờ nằm tại canvas. `BlackKnightPlayer.ts` nhả phím giữ trên blur và pointercancel. Chromium bấm nút cạnh game, nhả D, giữ Pause và lấy focus lại từ canvas. Click-away gameplay giữ ở 04E1. |
| B04-02D / V152-DEV-04 | PARTIAL → PASS ca đại diện | Picker xét camera và thứ tự depth, ưu tiên mục tiêu hữu ích, phân biệt body và sprite, chọn đối tượng không body, hỗ trợ Shift+click, bỏ chọn khi destroy và lấy Copy Bug Info. Luồng nhấp picker chặn đòn đánh. Log camera giới hạn 24 mẫu cách 250 ms. Copy Bug Info đọc key/instance/gain/loop của SFX đang phát và nguồn thay đổi Tinh Thần gần nhất trong SurvivalSystem. Tác động từ đòn đánh, item và yếu tố ngoài SurvivalSystem chưa được truy vết riêng. |
| B04-02E | OPEN → PARTIAL | Save/score, input, panel, vòng đời và các tuyến đại diện Noclip OFF đã kiểm tra bằng Chromium. Mọi hit/hurtbox, đối tượng và tuyến chưa được duyệt hết. [Nghiệm thu Developer Mode](V153_B04_DEV_MODE_UPGRADE_REPORT.md) |

## Công việc đã có bằng chứng nên bỏ qua

- Giữ kết quả Batch 02/03, nguồn Fellor, 34 chuỗi/324 PNG, bảng tạo hình, portrait và migration BlackKnightPlayer. Giữ avatar/cover, GIF menu và HUD Running. Không tạo lại sprite, atlas, artwork hoặc các asset đã nghiệm thu.
- Giữ Save schema 3, ID tương thích, SDK v1.1, Game ID, Leaderboard ID, renderType và hai manifest P2Game trong checkpoint. Bài Save lịch sử đang đạt 49/49. Chỉ thêm kiểm thử namespace QA và ứng dụng guard liên quan.
- Giữ các bản sửa B03 cho SDK chậm/treo, NPC Neris/Garth/Edda, quest reward, camera và các tuyến đã xác minh. Kiểm tra lại entry point startup và một số tuyến đi bộ vì liên quan trực tiếp đến 04A. Audio unlock đã đạt trong iframe.
- Các mục 04A đã qua ở worktree tiếp tục được tái sử dụng. R10 tập trung vào overlay/watchdog, profiler trùng, ý nghĩa bộ đếm, focus, guard điểm nhận damage đã tái hiện và bằng chứng nghiệm thu.

## Tệp thay đổi

Hai commit runtime có tổng cộng **23 tệp sửa, 2 tệp thêm, 0 tệp xóa, +1.076/−506**. `ASSETS_MANIFEST.json` cập nhật registry. PNG, audio, map, animation, sprite atlas và asset đã tích hợp giữ nguyên. Các ảnh thêm ở commit bàn giao là ảnh kiểm thử.

```text
M	ASSETS_MANIFEST.json
M	index.html
M	public/startup-status.js
M	scripts/generate_assets_manifest.mjs
A	scripts/test_v153_dev_score_safety.mjs
M	scripts/test_v153_save_schema3.mjs
M	scripts/test_v15_48_iframe_focus_and_hud_layout.mjs
M	src/audio/AudioManager.ts
M	src/debug/DevPanelOverlay.ts
A	src/debug/DevSessionPolicy.ts
M	src/debug/DeveloperModeManager.ts
M	src/entities/BlackKnightPlayer.ts
M	src/main.ts
M	src/scenes/GameScene.ts
M	src/scenes/PreloadScene.ts
M	src/services/CloudSaveService.ts
M	src/services/LeaderboardService.ts
M	src/systems/EndingSystem.ts
M	src/systems/GraphicsQualitySystem.ts
M	src/systems/QuestSystem.ts
M	src/systems/SaveManager.ts
M	src/systems/SurvivalSystem.ts
M	src/systems/WeatherSystem.ts
M	src/systems/WildlifeSystem.ts
M	src/utils/HitboxDebugInspector.ts
```

Diff gồm 80 tệp, trong đó có 32 ảnh Chromium và 12 đặc tả R10. Blob lớn nhất trong phần bàn giao là ảnh 851.185 byte. Đã kiểm tra liên kết trong báo cáo, mẫu secret phổ biến, nguồn Fellor và phạm vi file trước khi push. Tệp Markdown thêm gồm báo cáo này, audit nền Dev, báo cáo nâng cấp Dev, báo cáo QA/Implementation, checkpoint 04A và registry lỗi tester. Đã cập nhật `Read/V1.5/README_INDEX.md`, báo cáo startup và tester guide. Thư mục `Visuals/V153_BATCH_04A` lưu ảnh trước/sau và số đo fixture. `docs/chat_and_commands/V153_BATCH04_R10` chứa 12 tệp R10. [Cây ảnh và log](Visuals/V153_BATCH_04A) · [Chỉ mục tài liệu](../README_INDEX.md) · [Danh sách thay đổi trên GitHub](https://github.com/KyoshiroKyo/HOLLOW-WOODS/compare/0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2...feat/v1.5.3-batch04).

## Kiểm thử tại checkpoint

Chạy tại worktree phát triển với Node/lockfile trên. TypeScript, hai build thử và các script regression chính bên dưới đã exit 0. Mục V15-05 ghi riêng kết quả so với baseline.

| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` · `npm run check` | PASS. |
| `node_modules/.bin/vite build --outDir /workspace/work/v153-b04/r10/site-public-final` · `VITE_HOLLOW_WOODS_QA=1 node_modules/.bin/vite build --outDir /workspace/work/v153-b04/r10/site-qa-final` | PASS cả hai build local, output riêng. |
| `node scripts/test_v153_save_schema3.mjs` | PASS map Save metadata/compatibility/farming/roundtrip và hủy cloud request đang chờ của QA. |
| `node scripts/verify_v15_27_performance_and_save_compatibility.mjs` | 49/49. |
| `node scripts/test_v153_dev_score_safety.mjs` | PASS gửi một lần, duplicate và kích hoạt Dev khi chờ auth hoặc trước retry. |
| `node scripts/test_v152_08_p2game_sdk.mjs` | 31/31. |
| `node scripts/test_v152_06b_ui_pack.mjs` · `node scripts/test_v152_06a_hud_stamina.mjs` | 25/25 · 18/18. |
| `node scripts/test_v15_48_iframe_focus_and_hud_layout.mjs` | 28/28. Assertion focus theo listener canvas hiện hành, có thêm Chromium click bên ngoài đối chiếu. |
| `node scripts/verify_data_integrity.mjs` · `node scripts/verify_zero_404_assets.mjs` · `node scripts/test_v15_34_safe_spawn_and_unstuck.mjs` | 15/15 · 210/210 URL loader · SafeSpawn PASS. |
| `node scripts/verify_v15_05_sanity_mechanics.mjs` | 14/19, exit 1 trên baseline và nhánh 04A, cùng năm assertion lịch sử về vùng bảo vệ, trạng thái ngày và cảnh báo hoảng loạn. |
| `git diff --check` | PASS cho diff mã và tài liệu dự án. Các lệnh upload được lưu nguyên văn. |

**PRODUCTION LOCAL PASS.** Chromium khởi động từ root, subpath và iframe; SDK chậm 5 giây vẫn vào menu, init treo hiển thị lỗi và Retry, fixture bình thường gọi init/ready một lần. SDK lỗi chuyển standalone, module 404 hiện thông báo chính xác, thiếu ảnh cinematic dùng fallback, WebGL bị tắt vào Canvas. Iframe 1600×900 DPR 1,25 kiểm tra resize, New Game, phím D, F, audio unlock và Continue schema 3, 0 lỗi trang hoặc HTTP. Các request 404/ERR_FAILED bị chèn trong ca lỗi khớp với lỗi đầu vào. Một profile cache thường tải lạnh rồi reload hai lần, mỗi lần có đúng một canvas và vào menu. Mỗi reload ghi 11 cache hit và 0 lỗi trang/HTTP. [Startup](V153_P2GAME_BLACK_SCREEN_REPORT.md) · [Continue trong iframe](Visuals/V153_BATCH_04A/r10-boot-iframe-continue.png) · [Số đo runtime](Visuals/V153_BATCH_04A/r10-runtime-verification.json).

**LOCAL PASS · mock SDK.** Trên hai build cuối tại commit `8246875`, lượt public sạch gửi `survival-score` và `gameOver` đúng một lần, lưu hai khóa SDK mock. Lượt QA iframe có 0 lệnh storage, submit hoặc gameOver, kể cả khi F9 đã đóng. Profile cách ly giữ dữ liệu thường. [QA iframe](Visuals/V153_BATCH_04A/r10-qa-iframe-1600.png).

**LOCAL PASS · tuyến đi bộ đại diện.** Bellhollow (541,481) đến khoảng (541,448) bằng W trong ngách nhà Neris. Nhà ở (505,400) body 130×30, nhân vật body 18×12. D từ Fog Crossing qua Bellhollow đến khoảng (487,232). Outer Woods, hai phía gốc cây (1271,576) 18×10 dừng lần lượt ở x=1261/1298 rồi đi vòng phía nam x≈1303, y≈614. Qua Cổng Đông, fixture QA mở cổng và đặt điểm đầu (1440,280), giữ D có auto-repeat qua trigger đến Đường Mòn Quanh Co (1616,280). Kiểm tra dùng build QA cuối và Noclip OFF, không dùng để nghiệm thu chuỗi nhiệm vụ mở cổng. Các điểm đầu có fixture, bước qua vật cản dùng phím, Noclip OFF. Lượt cây có một request stream BGM `ERR_ABORTED` lúc đổi track. [Picker trước](Visuals/V153_BATCH_04A/before-picker-near-neris.png) · [Picker sau](Visuals/V153_BATCH_04A/after-object-picker.png) · [Hai phía gốc cây](Visuals/V153_BATCH_04A/after-tree-footprint.png) · [Trước Cổng Đông](Visuals/V153_BATCH_04A/r10-east-gate-before.png) · [Qua Cổng Đông](Visuals/V153_BATCH_04A/r10-east-gate-after.png) · [1920×1080](Visuals/V153_BATCH_04A/after-outer-woods-1920.png).

**LOCAL PASS · F10 và audio snapshot.** Đã hoàn thành một lượt F10 ở Bellhollow, tải JSON và đối chiếu 493 texture với Texture Manager tại thời điểm chốt mẫu. Nhãn và JSON cũ gắn số đếm texture với VRAM. Bản sửa dùng số texture và lưu JSON dưới khóa QA riêng. Kết quả 133 mẫu được dùng để kiểm chứng luồng báo cáo trên SwiftShader Cloud. Dùng hai instance WAV `dagger_slash` đang phát để đối chiếu gain, loop, số instance và dọn sau khi phát xong. Thử `pointercancel` và `visibilitychange` bằng sự kiện fixture khi đang giữ D thật. [F10 trước](Visuals/V153_BATCH_04A/r10-benchmark-before.png) · [F10 sau](Visuals/V153_BATCH_04A/r10-benchmark-after.png) · [Số liệu runtime](Visuals/V153_BATCH_04A/r10-runtime-verification.json).

Kiểm toán baseline giữ nguyên các kết quả âm thanh 18/22, combat 65/66, chunk 14/15 do test đòi backup cục bộ vắng trong Git. Map mock báo 11 cặp body trùng và waypoint Garth/Bram/Finn cần tái hiện trong nhóm map. [Các ca và nguyên nhân](V153_B04_DEV_MODE_BASELINE_AUDIT.md).

## Phần còn mở và điều kiện tiếp tục

- **HOSTED BLOCKED / release BLOCKED.** Cloud nhận CONNECT 403 tại SDK hosted. Cần URL preview hợp lệ của bản gặp lỗi và log Console/Network của người chơi để nghiệm thu. Các fixture local dùng SDK mock hoặc chủ động thử standalone.
- **04A PARTIAL.** Kiểm tra cả lớp hit/hurtbox, từng loại đối tượng, nguồn đổi Tinh Thần ngoài hệ sinh tồn, tuyến đầy đủ và số đo ở thiết bị thật còn thiếu. Không xác nhận 60 FPS hoặc natural playthrough. Còn ba TSX editor vắng. Bảng kiểm thử rollback/luồng tester hosted đợi môi trường.
- **04C-K1 OPEN.** Frame `satyr_sheet` 16/17/20/21 từ báo cáo tester và runtime mapping Black Knight thuộc batch kế. Ưu tiên sprite thật đã có, giữ texture alias khi cần. Ma trận target bốn hướng vẫn theo R10. [Ma trận hiện có](V153_CHARACTER_ANIMATION_MATRIX.md).
- **Checkpoint tiếp theo.** Owner xét báo cáo 04A, duyệt riêng lệnh 04C-K1 nếu đạt. Sau khi duyệt, tiếp tục từ HEAD nhánh phát triển và file `02_V153_B04C-K1_BLACK_KNIGHT_RUNTIME_FIRST.md`. Dừng ở 04A. [Checkpoint](V153_BATCH_04_CHECKPOINT.md) · [Registry](V153_TESTER_BUG_REGISTRY.md).

Để gửi ChatGPT đánh giá, mở trang GitHub của tệp này và tải Markdown gốc. Kèm checkpoint và thư mục ảnh ở cùng SHA để giữ đúng bằng chứng.
