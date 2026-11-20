# HOLLOW WOODS V1.5.3 — 04F — Chơi xuyên suốt, kiểm toán và báo cáo toàn game, nghiệm thu P2Game/team

**R10 SPLIT | Lệnh 11/11 | ACTIVE GROUP: 04F ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Chuyên sâu (Max nếu cần).
- Báo cáo riêng: `Read/V1.5/Reports/V153_BATCH_04_FINAL_QA.md`.
- Mã thực thi: `V153-BATCH-04F EXECUTE REMAINING ONLY`.
- Không thực hiện mã khác hoặc tự tăng version.

## Quy tắc chung — áp dụng cho duy nhất batch trong file này

- HOLLOW WOODS — THE FOG THAT REMEMBERS V1.5.3. Repository: https://github.com/KyoshiroKyo/HOLLOW-WOODS. Codex Cloud `/workspace/HOLLOW-WOODS`; không giả định truy cập được ổ G:. Stack theo lockfile thực: Phaser 4.2.1, TypeScript Strict, Vite 5.4, P2Game SDK v1.1. Model do Owner chọn trong UI; không tự đổi.
- Đọc `AGENTS.md`, `Read/AGENTS.md`, `Read/AI_IRON_RULES.md`, `docs/FOLDER_STRUCTURE_RULES.md` và checkpoint mới nhất; nếu thiếu file thì ghi rõ. Không ghi đè luật; giữ lịch sử. Đọc manifest/registry/source thuộc phạm vi, không quét lại toàn bộ source ở mỗi batch. Không cần nhận lại R1–R9.
- Xác minh Git status, branch, HEAD, worktree, diff và checkpoint trước khi sửa. Batch 03-R2 QA `qa/v1.5.3-batch03-r2` @ `0ceffa5`, Draft PR #1, main lịch sử `b5eaa61` chỉ là mốc tham chiếu; không giả định là HEAD mới nhất. Khôi phục phần 04A chưa push từ task cũ trước khi chuyển chat. Không reset/clean/force push, không ghi đè nhánh QA cũ, không merge main/publish. Chỉ push nhánh phát triển/QA đã được Owner duyệt, kiểm tra secret/license/kích thước và xác minh remote SHA; nếu thiếu quyền, báo BLOCKED, không giả thành công.
- Lọc việc: `OPEN / PARTIAL / REOPENED` mới đưa vào danh sách sửa; `CLOSED-VERIFIED` bỏ khỏi hàng chờ, giữ trong ledger chỉ để truy vết/hồi quy khi liên quan; `BLOCKED` ghi điều kiện khôi phục và tiếp tục phần độc lập. Đối chiếu bằng chứng với HEAD, test ngắn nếu cần. Không suy diễn PASS từ log cũ, không lặp công việc đã đạt. Không sửa lỗi đã đóng chỉ vì có trong đặc tả dưới đây. Nếu tái xuất hiện, ghi SHA/bước tái hiện và mở lại đúng mã. Không thực hiện task thuộc file batch khác.
- Không chạy lại Batch 02/03, không trích lại nguồn/frame hoặc vẽ lại reference/portrait đã đạt, không lặp migration BlackKnightPlayer, không viết lại Save schema 3, SDK, HUD Running, avatar/cover/menu GIF đã đạt. Các lỗi mới liên quan vẫn phải sửa nếu xác minh được. `satyr_sheet` alias hợp lệ không bắt buộc đổi tên; missing frame phải chữa nguyên nhân.
- Bảo toàn Black Knight / The Mossbound Wayfarer, Fellor và license, UI Pack, Dark Woodland Pixel Art, Dark Moss & Ember Gold (#141712, #1F241B, #C8963E, #E09F3E, chữ #E8DFC8/#C8CFC2), Hybrid Open World C, các zone/quest/safe-zone/return route theo thiết kế. Giữ Vòng Sáng [F], Tinh Thần, Hương Trầm Tinh Thần, F9 cho QA, Game ID, leaderboard, Save schema 3/legacy IDs, renderType tường minh và SDK v1.1. Không thêm mini-map (World Map và La Bàn hiện có được sửa).
- Asset thật từ kho được cấp phép: không vẽ nhân vật/cây/nhà bằng code, không dùng artwork hình khối AG2.0, không ghi đè nguồn Fellor. Graphics chỉ dành cho debug, ánh sáng, sương, bóng, UI tối giản hợp lệ. Python chỉ xử lý/crop/pack/validate ảnh, không dựng hình nhân vật giả. Pixel art nearest/pivot đúng, không frame rỗng, không missing frame/404 ở ca đã test. Không lấy Internet hay tự upload audio/archive nguồn nặng khi chưa được duyệt. Nếu thiếu asset: ghi đường dẫn, tác động, MISSING_FROM_CLOUD/BLOCKED, tiếp tục việc độc lập.
- Giữ import Phaser tường minh theo luật; đọc đoạn liên quan ở file lớn; không tạo file rác ở root; không commit dist/node_modules/Backups/Save thật/token/asset không có quyền. Kiểm tra WebAudio/listener/timer/tween cleanup, tránh update thừa. Không tuyên bố 60 FPS nếu chưa đo. Không sửa test/assertion để báo xanh.
- Chơi thử runtime bằng Chromium với input thật, không chỉ chạy TypeScript hoặc teleport. Dùng mock SDK/profile QA cách ly cho Dev, không dùng leaderboard/save thật. Không bắt tester xem lại màn hình chớp gây đau mắt; ưu tiên kiểm tra log và ngăn nhấp nháy. Không bịa screenshot/test. Production local khác hosted P2Game; không publish. Nếu quota sắp hết, lưu checkpoint, không retry liên tục hoặc vượt hạn mức.
- Mặc định một batch/lượt, từng command tuần tự; dừng sau khi báo cáo. Không tự chạy batch tiếp theo. Khi chuyển chat, chỉ dùng nhánh/SHA chứa checkpoint đã xác minh hoặc patch bàn giao an toàn. Nếu mất worktree, dừng phần phụ thuộc, không tái tạo mù quáng.

## Chỉ dẫn phạm vi riêng

Chỉ bắt đầu nghiệm thu cuối khi các nhóm bắt buộc đã có báo cáo; nếu còn blocker có thể chạy QA độc lập nhưng release vẫn BLOCKED. Full playthrough không dùng Dev/unlock/teleport; fixture và test tự động riêng. Đối chiếu tất cả BUG-021..050/LEG-R8-01..20 và bug mới; nếu có regression, sửa nhỏ có phạm vi hoặc giao lại đúng nhóm, không làm lại toàn bộ. Không merge/publish, không coi hosted PASS khi chưa kiểm tra. Tạo báo cáo tổng dự án và gói bằng chứng cho Owner/ChatGPT.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

## B04-15 — Tester workflow & evidence (04F)

Tạo hướng dẫn clean checkout branch QA, đúng Node/dependency theo repo, npm ci nếu lockfile hợp lệ, lệnh dev/build/preview đã kiểm tra, lệnh bật F9 và cách báo lỗi. Tạo QA checklist theo từng zone, test New Game/Continue, NPC, camera, quái, giải đố, item, farming, audio, UI, Save schema 3, FPS. Bổ sung hướng dẫn F9 theo đúng QA build, Ctrl+Shift+F9 ép tắt, các toggle inspector, Object Picker và Copy Bug Info; cách ghi nhận collider vô hình khi noclip OFF, không dùng QA save để thi đấu Leaderboard, cách kết thúc lượt Dev an toàn. Phân tách bản QA Batch 03 đã bàn giao với nhánh Batch 04; chỉ bàn giao bản QA nâng cấp Dev khi B04-02E đạt. Không giả định tester report đã có. Bug template: SHA/branch, browser, OS, zone, tọa độ F9, quest state, bước tái hiện, expected/actual, video/screenshot nếu có (không bắt buộc video), F9 Copy Bug Info, console/network, mức P0/P1/P2. Không yêu cầu tester chia sẻ dữ liệu hoặc Save thật; dùng save QA riêng. Phân biệt automated/browser và tester thực tế; không tuyên bố team đã test nếu chưa nhận báo cáo. Nếu repo private, Owner cấp quyền collaborator hợp lệ, không đổi visibility.

## B04-16 — Natural playthrough & regression (04F)

Dùng browser trên production local: New Game -> progression tự nhiên -> mở các vùng theo quest -> giải đố -> kết thúc hiện có, quay về và Continue ở checkpoint. Test cả lối phụ, đường hẹp, các NPC, combat, trạng thái môi trường, audio, crafting/farming, reload và save cũ. F9 chỉ chẩn đoán; lượt dùng save fixture được đánh dấu riêng. Nếu không chơi hết, ghi chính xác quest/zone cuối, blocker, thời điểm và bằng chứng; không PASS toàn game bằng fixture. Sửa bug tái hiện và rerun targeted + regression. Kiểm thử độc lập theo từng nhóm, không làm lại hàng loạt các test không liên quan trong mỗi lần sửa nhỏ.

## B04-17 — Final integrity & release gate (04F) — CLOUD-QA-01..03 / CLOUD-RELEASE-01

Chạy npx tsc --noEmit, git diff --check, các script hiện có (SDK, asset 404, Save lịch sử, UI/iframe, gameplay/animation, data, audio) xác minh output thật, không sửa assertion để che bug. Đối chiếu baseline 31/31 SDK, 25/25 UI Pack, 18/18 HUD, 28/28 iframe, 15/15 data, 49/49 Save, 0/210 đường dẫn thiếu theo báo cáo Batch 03; số lượng có thể đổi hợp lệ nếu manifest đổi, phải giải thích.

- B04-17C: production build regression, root/subpath/iframe, slow SDK, offline failure, resize, reload, Canvas/WebGL, load asset.
- B04-17D: P2Game hosted compatibility; chỉ nghiệm thu khi thực sự truy cập preview/hosted được phép, nếu thiếu quyền/log ghi HOSTED BLOCKED.
- B04-17E: kiểm tra cấu trúc package theo tài liệu P2Game, đúng metadata/avatar/cover/gallery, ID/leaderboard không đổi, rollback theo SHA đã xác minh. Không upload/publish; không tạo release chính thức. Build kiểm thử cục bộ được phép, package validation chỉ nếu không có side effect phát hành.

- B04-17F: regression V152-DEV-01..04 sau toàn bộ Batch 04. Chạy lại acceptance B04-02E và kiểm tra normal playthrough không bị tác động bởi Dev, không có overlay mặc định, không gửi QA score lên leaderboard thật, không làm bẩn Save production; đối chiếu audit baseline với HEAD cuối. Nếu thiếu bằng chứng, giữ BLOCKED/PARTIAL theo từng gate.

### B04-17G — R8 tester regression gate (kế thừa R7/R6)

Đối chiếu BUG-021..050, LEG-R8-01..20 và mọi lỗi tester cũ trong registry. Bắt buộc kiểm tra đầu làng bằng điều khiển thật; ranh giới Farm/safe-zone/Tinh Thần qua lại; hiệu ứng không chớp lặp; startup/Retry/SDK và dagger_slash; icon item toàn registry + runtime; campfire/ambience nghe đúng nguồn; banner/menu không che HUD; terrain nối liền. Bổ sung regression R6: đúng một Dev panel 5 thẻ, thống kê collider có định nghĩa, World Map tất cả node/nhãn trong khung và topology đúng, nhà thợ rèn dùng asset thật/lối đi hợp lệ, menu redesign GIF đúng nguồn, toolbar click/hotkey cùng trạng thái, click-away/blur/iframe focus không kẹt input hoặc click-through. Xác minh missing satyr_sheet warning thực sự biến mất do animation registry hợp lệ, không do lọc log. Regression R7: đọc thư hai trang bằng A/D và click; E/Space cất và đóng, Esc đóng đúng quy tắc; Save/Reload mở lại không trùng, NPC/đọc bảng tin cạnh nhau chọn đúng mục tiêu; kiểm tra mọi dialogue/nameplate về font, tỷ lệ và bố cục; NPC scale/footprint đúng với Knight atlas cuối và không chặn lối đi. Tối thiểu một lượt natural playthrough sạch, không dùng quyền Dev, bên cạnh fixture QA. Ghi trạng thái từng lỗi, SHA, evidence; không tuyên bố hosted hoặc tester PASS nếu chưa có. P0 chưa xác minh hoặc thiếu đồ họa/âm thanh bắt buộc giữ release BLOCKED; không merge/publish. Đưa kết quả vào báo cáo toàn dự án B04-18.


### B04-17H — R8 layout acceptance & handoff evidence

Chạy regression riêng trên cùng SHA cuối: Lối Nam/biển chỉ đúng tuyến; nhà Garth và NPC đã chuyển đồng bộ, không còn collider/trigger tại vị trí cũ; Finn spawn/home (909,231) xác nhận qua F9, tỷ lệ đúng; khu bếp/lều/rương không còn đèn trang trí thừa được chỉ định; hai bụi Edda biến mất cả sprite và collider/trigger, nền/lối đi liền mạch; Hốc Sồi có visual/logic đúng thiết kế, E/vòng highlight/tên đúng mục tiêu cho biển/gỗ/lều/bếp/rương/Finn/Garth/Edda. Dùng input thực, New Game và Continue, qua lại map và reload; không dùng noclip hoặc teleport để coi route PASS. Kiểm tra cả bản thường tắt Dev và QA bật Dev để đối chiếu. Tạo ảnh before/after, tọa độ và danh sách entity IDs; nếu thiếu ảnh Owner hoặc không xác định được hai bụi, ghi BLOCKED với bằng chứng. Đối chiếu lại BUG-044..050, ghi rõ CHANGE DONE hay PARTIAL/FAIL/BLOCKED. Không tự thay đổi tọa độ Finn đã yêu cầu.

## B04-18 — Báo cáo toàn bộ dự án (04F, CLOUD-REPORT-01)

Cập nhật `Read/V1.5/Reports/V153_FULL_PROJECT_REPORT.md` dựa trên hiện trạng thực, không chỉ diff Batch 04. Bao gồm kiến trúc và thư mục, dependencies/SDK, Black Knight/34 chuỗi/coverage matrix, combat, ID/item, inventory/equipment/crafting, NPC/creatures/quest, tất cả zone/map connections, terrain/prop/nhà, UI/UX/Menu, fog/lighting/audio, farming, Save/Load, F9, media P2Game, hiệu năng, lỗi đã sửa/lỗi còn tồn tại, technical debt và định hướng sau này. Phân biệt triển khai/đã test/chưa test/đang làm/BLOCKED/đề xuất. Báo cáo tổng hợp không thay thế test. B04-18 là bước tổng hợp cuối trong 04F; không tự mở version mới.

## Reporting & execution discipline

Sau từng task: cập nhật `Read/V1.5/Reports/V153_BATCH_04_CHECKPOINT.md` (hoặc đúng quy chuẩn repo), mã task, trạng thái PASS/PARTIAL/FAIL/BLOCKED/NOT TESTED, file thay đổi, test đã chạy, bằng chứng trước/sau, bước tiếp theo. Báo cáo audit `V153_B04_DEV_MODE_BASELINE_AUDIT.md`, nâng cấp `V153_B04_DEV_MODE_UPGRADE_REPORT.md`, báo cáo tổng hợp `V153_BATCH_04_IMPLEMENTATION.md`, `V153_BATCH_04_TESTER_GUIDE.md`, `V153_BATCH_04_FINAL_QA.md`, cập nhật `V153_FULL_PROJECT_REPORT.md` và README_INDEX theo quy chuẩn. Ghi rõ lỗi chưa tái hiện, artwork chưa duyệt, audio thiếu, hosted, QA team. Không tự động retry vô hạn, không vượt giới hạn dịch vụ. Chỉ đọc source liên quan, chia nhóm artwork nhỏ, test theo phạm vi, không chạy song song các nhiệm vụ độc lập trong cùng batch. Nếu gần hết quota hoặc bị ngắt, lưu checkpoint trong khả năng môi trường; không đánh dấu PASS khi chưa có bằng chứng. Trả link/SHA thật nếu push thành công. Giữ release BLOCKED cho tới khi các gate P0, artwork bắt buộc, playthrough, hosted và nghiệm thu Owner đạt.


## Bảng truy vết mã cũ → nhóm thực hiện hiện tại (không phải danh sách lệnh cần chạy lại)

| Mã đã có | Nơi thực hiện/đối chiếu R8 |
|---|---|
| V153-F0-0, CLOUD-01A, Batch 02, B03-RESUME-00 | B04-00/00A/01; bảo toàn nguồn, kiểm tra checkpoint |
| B03-P0-00, CLOUD-P2-FIX-01..05, B03-P0-RECHECK | B04-00D, B04-03..07, B04-16/17 |
| V152-DEV-01..04 | B04-00A/B/C, B04-02A..02E, B04-17F |
| CLOUD-01B..01Z (gồm 01Y-R) | B04-10: chỉ phần còn thiếu, giữ nguyên mã và aliases |
| CLOUD-02..02G, 02A-R, 02E-R, 02G-R | B04-07, B04-13A/B/D/E |
| CLOUD-FIX-01..04 (gồm 01A/02A/04A) | B04-03..06, B04-06B (layout R8) |
| CLOUD-FIX-05..07, 09 | B04-07..09, B04-07C (interaction R8) |
| CLOUD-FIX-08, CLOUD-CLEAN-03 | B04-11/12 |
| CLOUD-FIX-10, CLOUD-CLEAN-05 | B04-14 |
| CLOUD-P2-01..03 | B04-13C và B04-17E |
| CLOUD-QA-01..03, CLOUD-REPORT-01, CLOUD-RELEASE-01 | B04-15..18 |

## Danh sách lỗi toàn dự án để đối chiếu, KHÔNG phải hàng chờ sửa lại

## 5. Registry lỗi tester cần phân loại tại HEAD (giữ mã R8 để truy vết)

Giữ mã lỗi từ R8; các hiện tượng dưới đây chưa được xác nhận đã đóng ở HEAD. Không đưa lỗi CLOSED-VERIFIED vào danh sách sửa. Đây là báo cáo hiện tượng, chưa phải nguyên nhân gốc hay bằng chứng đã sửa. Mã dưới đây là mã theo dõi đề xuất; đối chiếu registry hiện có và lưu alias nếu trùng mã, không đổi ID runtime/Save. Tạo/cập nhật registry đúng quy chuẩn repo, ưu tiên `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md`. Mỗi lỗi có SHA/build, zone, tọa độ nếu có, bước tái hiện, kết quả mong đợi/thực tế, nguyên nhân xác minh, file sửa, QA, trạng thái và bằng chứng. Không cần Owner quay video; tự tái hiện bằng bàn phím, Chromium và F9.

| Bug ID | Hiện tượng | Ưu tiên | Chủ sở hữu sửa / nghiệm thu |
|---|---|---|---|
| BUG-021 | Camera quay mòng mòng ở đầu làng, Owner không quay được video | P0 | B04-03 (04B), B04-02D chỉ chẩn đoán |
| BUG-022 | Đứng/đi qua ranh giới Sanctuary Farm mất Tinh Thần bất thường | P0 | B04-03 + B04-09 (04B/C) |
| BUG-023 | Mất Tinh Thần khiến màn hình chớp nhiều lần, tester đau mắt | P0 | B04-12 (04D); giảm/chặn sớm hiệu ứng lỗi nếu tái hiện trong 04B |
| BUG-024 | Màn hình khởi động có popup Tải lại khi thanh nạp chưa xong, dòng dagger_slash đang hiển thị | P0 | B04-00D (04A), B04-17 (04F) |
| BUG-025 | Thiếu icon item, cần xác minh toàn bộ Inventory/Quickbar/Equipment | P1; P0 nếu chặn gameplay | B04-09 + B04-13A (04C/E) |
| BUG-026 | Lửa trại nghe như tiếng gõ phím | P1 | B04-11 (04D) |
| BUG-027 | Ambience bình thường nghe như ngoài biển | P1 | B04-11 (04D) |
| BUG-028 | Banner chuyển vùng đè lên đồng hồ/HUD, banner và toast cùng xuất hiện | P1 | B04-13A (04E), B04-03 kiểm tra trigger |
| BUG-029 | Mảng nền/ranh giới màu cắt thẳng tại Sanctuary Farm và tuyến map khác | P1; P0 nếu mất đường đi | B04-03/04 (04B) |
| BUG-030 | Menu cần kiểm tra tiêu đề bị cắt, chữ mờ, phụ đề Continue và bố cục nút | P1 | B04-13A/B (04E) |
| BUG-031 | Panel DEV 5 thẻ và Performance Profiler & Hitbox Debug cũ cùng xuất hiện, che HUD/map | P1; P0 nếu chặn input hoặc phá cách ly Dev | B04-02C/E (04A) |
| BUG-032 | Hai bảng cùng hiện Collider: 4 và Colliders: 327; cần định nghĩa và đối chiếu bộ đếm, 136 warning gồm missing satyr_sheet frames | P1; missing frame runtime vẫn P0 B04-10 | B04-02D (04A), B04-10 (04C), B04-14 (04E) |
| BUG-033 | World Map [N] tràn khung trái; nhãn vị trí hiện tại đè tên Bellhollow, mục tiêu và phong ấn chồng nhau | P1; P0 nếu chỉ sai đường tiến trình bắt buộc | B04-03 (04B: dữ liệu), B04-13D (04E: UI) |
| BUG-034 | Nhà thợ rèn Bellhollow có mảng mái/tường/cửa màu phẳng không đồng nhất, vùng thao tác và tỷ lệ NPC cần kiểm tra | P1; P0 nếu chặn tương tác bắt buộc | B04-06 (04B), B04-07 (04C) |
| BUG-035 | Thiết kế Main Menu hiện tại chưa đạt mong muốn: nút dài dạng mũi tên, chữ/nhãn Continue bố trí chưa đẹp, cần thiết kế lại | P1 | B04-13B (04E) |
| BUG-036 | Thanh công cụ dọc, phím tắt và chuột chưa đồng bộ; bấm ngoài panel không đóng được theo tester | P1 | B04-13E (04E), B04-02C đối với QA |
| BUG-037 | Click ra ngoài vùng game có thể gây kẹt trạng thái phím/modal hoặc không đóng được UI; cần phân biệt trong canvas và ngoài iframe/browser | P0 nếu mất điều khiển/không thể tiếp tục | B04-02C (04A: nền input), B04-13E (04E), B04-17 (04F) |

| BUG-038 | Đọc thư/nhật ký nhiều trang: D không chuyển trang tiếp, A không trở lại trang trước | P1; P0 nếu chặn manh mối bắt buộc | B04-07A (04C: logic), B04-13F (04E: UI/input) |
| BUG-039 | E/Space không cất thư vào Sổ Tay và đóng giao diện như nhãn hướng dẫn | P0 nếu không thể thoát/tiếp tục hoặc mất manh mối; P1 nếu có cách thoát hợp lệ khác | B04-07A (04C), B04-13F (04E), B04-17G (04F) |
| BUG-040 | Hội thoại Finn/Garth có dải trang trí lệch tên, khoảng trống lớn, khung và vùng nội dung chưa cân đối | P1 | B04-13F (04E), B04-07A (04C: kiểm tra logic) |
| BUG-041 | Tên/chức danh NPC và font/kích thước không đồng nhất ở nameplate và dialogue | P1 | B04-13F (04E) |
| BUG-042 | NPC dân làng nhìn quá lớn so với nhân vật chính hiện tại | P1 | B04-07B (04C), B04-13F (04E: nhãn), B04-17G (04F) |
| BUG-043 | Nhãn [E] Đã đọc (Xem lại) cùng xuất hiện sát nhãn Finn [E], gây cạnh tranh mục tiêu tương tác | P1; P0 nếu không thể tương tác đúng mục tiêu | B04-07A (04C: chọn mục tiêu), B04-13F (04E: hiển thị) |

| BUG-044 | Lối Nam Bellhollow: đường đi/biển chỉ dẫn không nhất quán; hình biển, nhãn E, vòng tương tác có dấu hiệu lệch nhau | P1; P0 nếu chặn tuyến bắt buộc | B04-06B (04B), B04-07C (04C) |
| BUG-045 | Bố trí Garth và căn nhà ở đầu làng chưa hợp lý, cần di chuyển cả nhà và NPC | P1; P0 nếu gây camera loop/softlock | B04-06B (04B), B04-03A, B04-07C |
| BUG-046 | Yêu cầu bố trí Finn tại tọa độ world (909,231) trong Bellhollow | CHANGE / P1 | B04-06B (04B), B04-07C (04C) |
| BUG-047 | Lều/bếp/rương/đèn ở khu trại có dấu hiệu thừa hoặc chồng vùng thao tác; bỏ đèn cạnh bếp ở khu được chỉ định | CHANGE / P1 | B04-06B (04B), B04-12 (04D) |
| BUG-048 | Hai bụi cây gần bà Edda cần loại bỏ để thông thoáng lối đi | CHANGE / P1 | B04-06B (04B), B04-05, B04-07C |
| BUG-049 | Vòng highlight và nhãn tương tác Gỗ Khô, Lều Trú Ẩn, Bếp Lửa, biển và vật thể có thể không bám đúng hình/điểm vật lý | P1; P0 nếu không thể tương tác đúng | B04-06B (04B: transform), B04-07C (04C: target), B04-13F (04E: label) |
| BUG-050 | Hốc Sồi Ngàn Năm có trigger/khung debug nhưng ảnh không thấy cây sồi tương ứng; cần xác minh asset/culling/spawn/depth, không xóa manh mối | P1; P0 nếu chặn nhiệm vụ | B04-06B (04B), B04-07C/09 (04C) |

Các lỗi cũ ở R6 và mọi phiên trước vẫn giữ nguyên. Không đánh dấu PASS chỉ vì test tĩnh đạt; không tuyên bố đã có nguyên nhân của camera quay hoặc tiếng audio khi chưa tái hiện/đo/nghe. Với BUG-023, không bắt tester xem lại màn hình chớp; ưu tiên vô hiệu hóa nhấp nháy lặp gây khó chịu trong build QA, kiểm thử bằng log và kiểm tra trạng thái render không cần người xem chịu hiệu ứng. Nếu không tái hiện, ghi NOT REPRODUCED/PARTIAL và bằng chứng, không tự đóng lỗi. P0 chưa xử lý/chưa nghiệm thu tiếp tục chặn phát hành. Nếu 04A đã hoàn tất từ sau báo cáo Owner, không chạy lại; xác minh checkpoint rồi chỉ xử lý BUG-024, BUG-031/032/037 hoặc phần 04A mới chưa đạt trước khi chuyển nhóm theo yêu cầu.

### Mã truy vết lịch sử — không phải danh sách triển khai lại

Các mã `LEG-R8-*` là tên đối chiếu mới, KHÔNG khẳng định repo từng đăng ký BUG-001..020. Nếu registry thật có mã tương ứng, giữ mã gốc và gắn alias. Không tạo ticket trùng; một lỗi có thể liên quan nhiều nhóm nhưng chỉ một nhóm sở hữu bản sửa chính. Trạng thái dưới đây là trạng thái tiếp nhận, Codex phải xác minh lại bằng HEAD mới nhất. `Đã báo sửa` không đồng nghĩa đã nghiệm thu toàn game.

| Mã truy vết | Lỗi / yêu cầu cần kiểm tra | Trạng thái tiếp nhận | Nhóm chủ trì |
|---|---|---|---|
| LEG-R8-01 | P2Game hosted đen màn hình; SDK tải chậm hoặc init không hoàn tất, loader/Retry | Đã báo sửa local; hosted BLOCKED | 04A/04F |
| LEG-R8-02 | Nhân vật hiện thành hình đen chữ T/robot ở UP/DOWN; hướng ngang khác nét; hình mất khi đổi state | PARTIAL; chưa có atlas 4 hướng được duyệt | 04C |
| LEG-R8-03 | `satyr_sheet` báo missing frame 16/17/20/21 và các frame khác; animation/tung chiêu sai, hurt/death lỗi | Còn tester report; regression P0 | 04C |
| LEG-R8-04 | Tên class/file/texture Satyr cũ; khóa legacy và Save phải giữ tương thích | Migration đã báo thực hiện; kiểm tra phần còn sót | 04C |
| LEG-R8-05 | Armed Idle LEFT còn viền cyan/lệch palette, UP/DOWN thử nghiệm; Walk/Run/kỹ năng đủ 4 hướng chưa hoàn thiện | PARTIAL | 04C |
| LEG-R8-06 | Mảng nền đen cạnh nhà Neris, camera nhìn ngoài map, đường đầu làng và ranh giới chuyển vùng | Đã báo sửa fixture; có report mới | 04B |
| LEG-R8-07 | Collider vô hình, static body 32×32 sai kích thước, cây/đá/hàng rào/nhà chặn đường | Đã báo sửa một số ca; cần quét toàn map | 04B |
| LEG-R8-08 | Nền đất/đường/tileset thô, seam, rêu/cây/nhà pha asset giả; Y-sorting/đổ bóng/culling | Cần kiểm tra, cải thiện thực tế | 04B |
| LEG-R8-09 | Khu Sir Vaelen/Outer Woods có 2 bếp và 1 lều; lửa/đạo cụ/hiệu ứng chồng, lối đi bị hẹp | Cần tối ưu, xác định chức năng từng bếp | 04B |
| LEG-R8-10 | Tuyến Khuôn Đúc Chuông Cũ: nền gãy khúc, prompt/nhân vật sát HUD, lời gọi thư ở vị trí bất thường | Chưa tái hiện đầy đủ | 04B/04C |
| LEG-R8-11 | UI/hội thoại Neris/Garth/Edda, J mở Journal chồng lock, Esc cấp thưởng sớm, tên và text tràn | Đã báo sửa local; kiểm tra toàn NPC | 04C/04E |
| LEG-R8-12 | Nhiệm vụ/đường dẫn 7 chặng/zone gate/câu đố, item khóa, phần thưởng, thu thập, farming | Cần natural playthrough và kiểm tra dữ liệu | 04C/04F |
| LEG-R8-13 | Save schema 3 từng mất schema, vũ khí, loại cây, đất chuẩn bị; tiến trình/legacy Save | Đã báo sửa fixture; regression bắt buộc | 04C/04F |
| LEG-R8-14 | Dev F9 chỉ mở chưa đánh dấu, Save QA đi vào khóa thường, submit chờ auth vẫn gửi; F9 cũ/mới, inspector/5 tab/focus/cleanup | 04A đã báo cách ly mock PASS; chưa có checkpoint nghiệm thu cuối | 04A |
| LEG-R8-15 | Audio rè/rít, ambience loop ngắn, đổi gió/sương, núp bụi làm thay đổi âm; thiếu audio gốc trên Cloud | Chưa tái hiện toàn bộ; cần nguồn thật | 04D |
| LEG-R8-16 | HUD Running đủ 4 trạng thái, UI font/DPR, inventory/equipment, thanh nhanh, tooltip/nhãn, journal | Có phần đã báo sửa; còn lỗi UI mới | 04E |
| LEG-R8-17 | Main Menu bếp lửa/nhân vật placeholder cũ, GIF cinematic và bố cục menu chưa đẹp | GIF đã báo tích hợp; regression và redesign | 04E |
| LEG-R8-18 | Avatar P2Game `knight_no_text.png`, cover ảnh tĩnh từ GIF núi, gallery gameplay và 2 manifest JSON | Batch 02 đã báo cập nhật; hosted chưa nghiệm thu | 04E/04F |
| LEG-R8-19 | Quái Listener/DreadHorseman, patrol/safe zone, wildlife, spawn/despawn, animation; lỗi runtime/hiệu năng | Chưa nghiệm thu xuyên suốt | 04C/04E |
| LEG-R8-20 | Tính toàn vẹn file, đường dẫn/case, asset thiếu, dependency, code, 404, memory leak, release/SDK | Các bộ test cũ báo PASS local; audit và final QA mới bắt buộc | 04A/04F |

## Báo cáo bắt buộc sau khi sửa (để Owner gửi ChatGPT đánh giá)

Sau mỗi command, cập nhật `Read/V1.5/Reports/V153_BATCH_04_CHECKPOINT.md` và registry `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md` (hoặc đường dẫn hợp lệ theo quy chuẩn repo). Cuối batch tạo báo cáo riêng theo tên ở đầu file; cập nhật README_INDEX và báo cáo tổng hợp. Không chỉ trả một câu PASS.

Báo cáo phải chứa:
1. Nhánh, SHA đầu/cuối, worktree, môi trường, diff summary, remote SHA/PR nếu thực sự bàn giao; xác nhận main/QA cũ không bị ghi đè.
2. Bảng từng mã task/BUG: trạng thái trước → sau, bước tái hiện, nguyên nhân đã xác minh hoặc chưa tái hiện, sửa gì, file/dòng liên quan, build/SHA kiểm chứng. Phân biệt CLOSED-VERIFIED, PARTIAL, BLOCKED, FAIL, NOT TESTED, REOPENED; ghi rõ các mục đã bỏ qua do đã đóng và lý do. Không biến NOT TESTED thành PASS.
3. Danh sách file thêm/sửa/xóa, tài nguyên thật sử dụng, đường dẫn/texture/metadata/runtime mapping nếu có, ảnh trước/sau hoặc log/evidence và tác động đến Save/quest/SDK. Với map: entity ID, tọa độ cũ/mới, collider và route; với nhân vật: số frame/hướng, asset nào thực sự xuất hiện trong game, ma trận còn thiếu; với UI: input/focus/resolution; với audio/performance: số liệu đo và điều kiện test phù hợp.
4. Lệnh test thực chạy, kết quả (pass/total, exit code, console/network), ca runtime New Game/Continue hoặc fixture đúng phạm vi. Ghi `LOCAL PASS`, `PRODUCTION LOCAL PASS`, `HOSTED PASS` hoặc `HOSTED BLOCKED` tách biệt. TypeScript `npx tsc --noEmit` và `git diff --check`, targeted QA cuối batch; full suite ở 04F. Không suy diễn tester thực tế đã chơi.
5. Lỗi chưa xong, tài nguyên còn thiếu, rủi ro, quyết định chưa được Owner xác nhận, bước tiếp theo cụ thể hoặc BLOCKED, gate phát hành (vẫn BLOCKED nếu thiếu điều kiện bắt buộc). Checkpoint phải ghi rõ command đầu tiên chưa xong, đủ để mở chat mới khi đã bàn giao an toàn.
6. Cuối phản hồi chat Codex, gửi nguyên bản tóm tắt đủ các mục 1–5 cùng link/path báo cáo, ảnh và hướng dẫn lấy file để Owner gửi cho ChatGPT. Không tuyên bố ChatGPT tự nhận báo cáo. Nếu báo cáo quá dài, gửi file .md và summary trong chat.

**STOP:** kết thúc đúng batch này; nếu công việc đã CLOSED-VERIFIED toàn bộ, trả báo cáo SKIPPED (kèm chứng cứ), không sửa lại. Nếu quota/blocker, checkpoint và dừng an toàn. Không tự chuyển batch.
