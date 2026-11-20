# HOLLOW WOODS V1.5.3 — 04A — Khôi phục công việc dở dang, Dev F9, loader, QA isolation

**R10 SPLIT | Lệnh 1/11 | ACTIVE GROUP: 04A ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Cao.
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04A_RESUME_REPORT.md`.
- Mã thực thi: `V153-BATCH-04A EXECUTE REMAINING ONLY`.
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

Tiếp tục đúng worktree 04A. Nếu đã hoàn thành theo checkpoint mới nhất, chỉ bàn giao và báo SKIPPED. Kiểm toán read-only lịch sử chỉ làm nếu thiếu bằng chứng; sửa phần còn thiếu sau audit. Đối chiếu nhánh QA đã push, không thực hiện lại handoff 03. Bắt buộc chốt checkpoint/commit/push nhánh Batch 04 riêng nếu quyền đã được cấp; dừng trước K1. Nếu phát hiện nhấp nháy nguy hiểm trong test, ngăn hoặc vô hiệu hóa hiệu ứng lỗi ở QA và ghi rõ giao 04D sửa chính thức.

### 2. Loại khỏi danh sách triển khai lại (theo báo cáo Owner đã cung cấp)

| Mã/phần việc | Kết quả đã báo | Hành động R9 |
|---|---|---|
| V153-F0-0 / CLOUD-01A | Rules, kiểm kê, 34 chuỗi, 324 PNG RGBA, 34 metadata, 4 contact sheet | Giữ nguồn, không trích lại/viết lại rules |
| CLOUD-01B | 5 bảng tham chiếu Armed/Unarmed và các chi tiết tạo hình | Tái sử dụng, chỉ sửa artwork cụ thể không đạt; không dựng lại cả bộ |
| CLOUD-01X | Portrait từ artwork mới đã hiện trong Chromium qua hai texture key | Không tạo portrait lần nữa nếu vẫn hợp lệ |
| CLOUD-01Y-R | BlackKnightPlayer và tương thích 72 cặp legacy key đã báo hoạt động | Không làm migration lần hai; chỉ sửa import/registry còn lỗi thực tế; không xóa alias Save |
| CLOUD-P2-01/02 | Avatar 512×512, cover 1280×720, 6 ảnh gallery, hai manifest | Giữ ảnh/cấu hình đạt; chỉ chụp lại gallery sau nâng cấp runtime; hosted vẫn chưa nghiệm thu |
| CLOUD-02A | Main Menu 12 frame GIF 10 FPS, fallback hình tĩnh | Không tạo lại atlas/GIF hoặc cảnh bếp lửa; giữ artwork, chỉ redesign UI còn yêu cầu |
| CLOUD-02B / Running HUD | Render chữ Việt/DPR, HUD 4 trạng thái | Không viết lại lớp render/HUD; sửa lỗi mới cụ thể nếu còn |
| B03 startup | SDK tải chậm và init treo đã sửa/test production local root/subpath/iframe/Canvas | Không sửa lại hai nguyên nhân đã đạt; BUG-024 mới và hosted vẫn mở |
| B03 NPC | Esc/J, phần thưởng Neris một lần, mở/đóng Neris/Garth/Edda | Không làm lại logic đã đạt; lỗi thư, bố cục, scale, interaction mới vẫn mở |
| B03 map | Camera nhìn ngoài nền ở fixture, static collider 32×32, một số tuyến đã test | Không áp lại bản fix cũ; lỗi camera xoay, biên Farm, các tuyến chưa test và layout mới vẫn mở |
| B03 Save | Schema 3, vũ khí, khóa vùng, đất/loại cây/luống; Save lịch sử 49/49 | Không đổi schema hay viết lại hệ Save; regression khi tích hợp |
| 04A Dev safety | Cách ly QA Save lưu/nạp/xóa, giữ khóa thường, mock SDK 0 lệnh trong ca cách ly; đã dựng production và QA | Không thực hiện lại phần đã có; xác minh checkpoint và chỉ hoàn thiện gate/Inspector/Input còn thiếu |
| Audio unlock | AudioContext mở khóa local; chưa tái hiện tiếng rè | Không sửa unlock nếu đạt; tiếng rè, campfire và ambience vẫn chưa đóng |

Đây là phân loại tiếp nhận theo báo cáo, không phải khẳng định HEAD mới nhất đã được kiểm chứng. Chưa có báo cáo cuối 04A trong thông tin Owner cung cấp. Đừng tự giả định bất kỳ bug mới nào (BUG-021..050) đã đóng chỉ vì một test cũ đạt.


## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

## B04-00D — Black screen: kiểm tra hồi quy có mục tiêu / lỗi mới (04A) — CLOUD-P2-FIX-01..05

Kiểm tra boot root/subpath/iframe, SDK tải chậm/thất bại và init treo, preload errors, WebGL/Canvas theo SDK, resize, reload, Save cũ, no Save, cache. Thu console/network log. Xác minh game vào menu và New Game/Continue. Không vô hiệu hóa SDK hay giả lập thành công. Build test local ở thư mục tách biệt theo script đã kiểm tra; không publish. Hosted chỉ PASS khi có bằng chứng thật; thiếu SDK/hosting/log player thì HOSTED BLOCKED. Đối chiếu index.html, vite.config, package.json, hai manifest thực tế, SDK bootstrap, Boot/Preload/MainMenu, Save/AudioManager; trace lỗi base URL, case-sensitive path, chunks, MIME, CSP/CORS, canvas size, preload và cache. Sửa nguyên nhân được xác minh nếu còn tồn tại, không để canvas đen vô hạn; loading/error/retry theo hợp đồng SDK. Ghi log, screenshot và đường dẫn báo cáo V153_P2GAME_BLACK_SCREEN_REPORT.md; không coi local PASS là hosted PASS.

### B04-00D-R6 — BUG-024: loading overlay / dagger_slash

Ảnh tester hiển thị màn hình preload, thanh tiến trình chưa hết, dòng `Đang nạp: dagger_slash` và popup `Đang khởi động HOLLOW WOODS... / Tải lại`. Không suy luận dagger_slash chắc chắn là tệp hỏng: có thể là asset cuối được báo, lỗi timeout/overlay hoặc SDK. Ghi elapsed time, event progress/filecomplete/loaderror/complete, key/URL, HTTP status, kích thước, MIME, decode audio/image, các pending request, scene state, SDK state và boot overlay state. Kiểm tra popup có che loading hợp lệ, retry có reset sạch và có tự biến mất khi preload/menu thực sự sẵn sàng. Kiểm tra đúng asset key dagger_slash và các tài nguyên liền trước/sau theo registry thật. Thử cold cache, warm cache, mạng chậm, asset optional bị thiếu, SDK không phản hồi, root/subpath/iframe, reload nhiều lần. Không bỏ qua asset bắt buộc, không giả tiến trình 100%, không dùng timeout đơn thuần để che lỗi; có timeout hữu hạn và lỗi/Retry hữu ích, phân biệt optional fallback với thiếu asset bắt buộc. Chỉ một loader/overlay hoạt động, không tạo scene/canvas/audio context trùng sau Retry. TypeScript và production browser boot phải đạt; hosted vẫn BLOCKED nếu thiếu bằng chứng.

## B04-01 — File integrity & asset registry (04A)

Quét file nguồn, manifest, JSON schemas, references, case-sensitive paths, animation keys, tile indices, atlas regions, duplicate registrations, imports, orphan references, licenses. Kiểm tra ảnh/audio đọc được, đường dẫn hợp lệ, phân biệt source asset và runtime asset. Lập inventory, thiếu file nào ghi path/source dự kiến/tác động. Không xóa chỉ vì grep thấy 0 reference (dynamic refs). Xác minh dependency lockfile; không nâng cấp Phaser/Vite/SDK vô cớ. Quét audio nặng có ở repo hay không và chỉ dùng file thật sẵn có hợp lệ; nguồn local G: không truy cập được từ Cloud nếu chưa đồng bộ.

## B04-02 — Developer Mode F9 & QA inspector (04A)

Mở rộng công cụ F9 hiện có, không tạo hệ thống trùng. Hiển thị zone ID, tọa độ world/screen, camera bounds, world bounds, zoom, physics body, collider type/owner, tile collision, spawn/exit, quest flags, depth, animation key/frame, audio track/state, FPS/frame time khi đo được. Có toggle từng lớp để tester xác định chính xác vật cản vô hình. Cho phép copy thông tin bug (không kèm token hay dữ liệu cá nhân). Debug không ghi vào Save/leaderboard thật; không dùng debug để chứng minh quest natural playthrough. Không bật overlay mặc định cho người chơi.

### B04-02A — Dev Session & leaderboard: CLOSED candidate, regression only

Đã có báo cáo cách ly Save QA và mock SDK đạt. Không triển khai lại. Xác minh đúng SHA, kiểm tra ngắn các guard latch khi mở F9, async submit, Save QA riêng, dữ liệu người chơi thường không đổi; chỉ sửa nếu có ca tái hiện FAIL hoặc phần gate chưa có bằng chứng. Không gửi điểm thật. Ghi nhận nếu thiếu xác minh hosted.

### B04-02B — Dev gameplay controls & 5-tab overlay

Bảo toàn toàn bộ API V152-DEV-02 đang hoạt động. Bổ sung Infinite Composure riêng nếu thiếu, các điều khiển hồi đầy chỉ số, và sửa các API/toggle không có hiệu ứng thực. Dùng registry thật cho teleport/item/creature; chỉ thao tác trong lượt QA, xác nhận điểm đến hợp lệ. Không thêm gameplay thật chỉ để phục vụ debug. Giữ cấu trúc 5 thẻ, hiện tiêu đề dễ đọc và trạng thái các toggle khớp runtime. Thêm gọn nhóm chẩn đoán map/camera/collision/audio/animation, không tạo hệ thống overlay thứ hai. Kiểm tra 1280×720, 1920×1080, iframe, bàn phím, IME, focus. Đóng panel không làm mất kiểm soát nhân vật.

### B04-02C — Hotkey, emergency production view & scene cleanup

F9 giữ luồng toggle trong dev/QA được phép. Ctrl+Shift+F9 là lệnh ép tắt/production view có tính idempotent theo yêu cầu Owner: gọi nhiều lần vẫn tắt, không vô tình bật lại. Vì baseline dùng chính tổ hợp này để mở production debug, cần bảo toàn một đường vào tester đã được cấp quyền (ví dụ QA build/config được xác minh và F9); ghi rõ khác biệt và hướng dẫn tester. Không tạo đường mở ẩn mới trong public production để né bảo vệ. Không bật overlay mặc định. Khi ép tắt, ẩn inspector, clear lớp debug, dừng profiler/timer không cần thiết; xử lý trạng thái debug gameplay còn hiệu lực an toàn, không tự biến dữ liệu Dev thành Save thật, không xóa cờ phiên Dev. Nếu cần production playthrough sạch, mở phiên dữ liệu riêng hợp lệ. Kiểm tra hotkey repeat, keydown/up, overlay focus, dialog/pause, resize, scene shutdown/destroy, restart và nhiều lượt chuyển vùng. Tháo listener, overlay, pointer handler, timer, tween, khôi phục focus #game-canvas và input đúng chủ sở hữu khóa, không mở khóa nhầm gameplay đang pause/dialogue. Đếm listener/overlay sau ít nhất 5 lượt chuyển/restart đại diện nếu môi trường cho phép.

### B04-02D — Inspector & Object Picker nâng cấp

Thêm vào inspector hiện có (không dùng Graphics vẽ asset gameplay): toggle riêng collider/hitbox/hurtbox/trigger/interact/AI/camera/world bounds/tile collision nếu hệ thống hỗ trợ. Hiện camera scroll/zoom, world/viewport, ID, asset key, world x/y, origin, scale, depth/Y-sort, body width/height/offset, collider owner/layer/type, trạng thái static/dynamic, HP/AI/animation key/frame khi có. Chọn vật thể theo camera transform và thứ tự hiển thị, xử lý vật không có body, cho phân biệt sprite bounds và physics bounds, chọn cây/nhà/cổng/đá/bụi/nền/trigger đại diện. Tô rõ overlap/ghost collider với nhãn ID để tái hiện lỗi nhưng không tự kết luận mọi chồng lấn là lỗi. Cung cấp Copy Bug Info (không secret, Save thật hoặc dữ liệu cá nhân). Quan sát animation và audio track/instance/gain/loop state khi có, không thay đổi hệ audio chỉ để hiện thông số. Debug-only, không thêm mini-map.

**R6 — bổ sung công cụ thu bằng chứng không cần video:** Thêm vào panel hiện có (không tạo tab thứ sáu/overlay thứ hai) khả năng copy snapshot và nhật ký ngắn có giới hạn của camera (scroll, rotation, zoom, follow target, bounds, transition/tween), zone/safe-zone hiện tại và trước đó, nguồn thay đổi Tinh Thần, event camera FX/flash/shake, input và asset key/frame. Với item picker/Inventory diagnostics, nếu có thể hiện thêm item ID và texture/frame resolved. Audio hiện track/SFX key, gain/loop/instance count. Chỉ lưu dữ liệu QA cục bộ, không thu Save thật hoặc dữ liệu cá nhân; giới hạn tần suất và dung lượng, không spam mỗi frame, không thay đổi gameplay. Nếu 04A quota hạn chế, ưu tiên phần Dev safety trước; ghi checkpoint phần chẩn đoán chưa đạt để nhóm chuyên trách bổ sung. Acceptance: Copy Bug Info cho đúng tọa độ/zone/camera state và không còn log lặp gây tụt FPS.

### B04-02C/D-R6 — BUG-031/032/037: hợp nhất Dev cũ/mới, thống nhất bộ đếm và cơ chế input

- Tái hiện F9 ở Bellhollow gần nhà Edda (x≈1100, y≈167 theo ảnh), xem panel 5 thẻ bên phải và bảng cyan Performance Profiler & Hitbox Debug ở góc dưới. Kiểm kê đường tạo/tắt, hotkey F8/F9/F10, listener, DOM/Phaser layers, timer, quyền QA, source thật và đường gọi của cả hai. Nếu HEAD đã khác ảnh, ghi regression evidence, không tạo lại hệ thống cũ.
- Chỉ giữ một giao diện Dev chính: 5 thẻ hiện có, nhập các thông số profiler cũ vào thẻ Log & Hiệu năng; giữ F8 quality, F10 stress test và mọi công cụ hữu ích nếu có, với cùng quyền QA. Không để bảng profiler dạng nổi thứ hai tự bật, không xóa API đo có ích; gỡ đường render/listener dư sau khi chuyển đủ chức năng. Inspector world layer vẫn độc lập để bật/tắt từng loại, không đồng nghĩa mở hai bảng. Panel có thu gọn, đóng, scroll, tên thẻ dễ hiểu; không buộc game che NPC/hành lang, không đè UI không kiểm soát; thử collapse và viewport nhỏ. Khi đóng/ép tắt, mọi lớp debug phải ẩn đúng, cờ phiên Dev vẫn dính, cheat và Save/leaderboard cách ly như B04-02A/C.
- Collider 4 và 327 có thể là số physics collider handles so với số static bodies/obstacles. Xác minh định nghĩa trước khi sửa. Thống nhất nguồn dữ liệu, nhãn và đơn vị: registered collision pairs, active static/dynamic bodies, triggers, map colliders, visible/total objects, texture count; chỉ hiện số thật, không gọi texture count là dung lượng VRAM. FPS và frame time ghi khoảng lấy mẫu. Log giữ bản gốc + nhóm key/frame và đếm lần xuất hiện; giới hạn buffer/refresh để không spam, không tắt warning để làm sạch giả. Missing frames `satyr_sheet` (16,17,20,21 trong ảnh) chuyển P0 cho B04-10; nếu phát hiện ở 04A thì ghi rõ call site và evidence để 04C sửa registry.
- BUG-037 nền input: kiểm tra focus canvas/iframe, `blur`, `visibilitychange`, pointer cancel, keyboard key-up ngoài canvas, modal owners và cleanup. Nhả trạng thái phím/drag giữ dở khi mất focus, không tiếp tục di chuyển/chạy/tung chiêu hoặc tự bật lại panel khi quay lại. Không dùng listener toàn trang chặn thao tác của website chủ. Trả lại focus khi người dùng click vào vùng game thích hợp; không tự cướp focus ngoài game. Quy tắc click-away cho modal gameplay triển khai B04-13E, không mở khóa hội thoại đang giữ input.
- Acceptance: chỉ một panel Dev hiện hữu/hiển thị; 5 tab hoạt động; F9/F8/F10 và Ctrl+Shift+F9 đúng chế độ; đóng bằng nút và hotkey; 5 lần scene/restart không nhân đôi DOM/listener; test mất focus/khôi phục và mock Save/Leaderboard; so sánh bộ đếm với physics thật; production không lộ Dev. Chụp trước/sau, ghi số lượng instance và test. Không sửa lại phần 04A đã PASS; chỉ chạy targeted regression và cập nhật checkpoint.

### B04-02E — Developer Mode acceptance gate & team evidence

Chạy targeted tests và browser QA cho từng tính năng V152-DEV-01..04. Kiểm thử riêng session/leaderboard mock, Save isolation, 5 tab, hotkeys, focus, lifecycle, picker và các lớp debug. Xác nhận đường đi Bellhollow, hai phía gốc cây, lối hẹp, nhà Neris, cổng/trigger với noclip OFF; dùng F9 chỉ chẩn đoán. Kiểm thử Vòng Sáng [F] và safe zone hiển thị không đổi gameplay; đóng Dev rồi kiểm tra HUD sạch. Lưu ảnh trước/sau 1280×720 và viewport khác nếu có, log và test results. Báo cáo `Read/V1.5/Reports/V153_B04_DEV_MODE_UPGRADE_REPORT.md` và bảng đối chiếu PASS/PARTIAL/BLOCKED/FAIL/NOT TESTED theo từng yêu cầu gốc. Cập nhật tester guide, README_INDEX, checkpoint. Không sửa lại phần đã PASS, không báo đạt toàn bộ khi chỉ TypeScript xanh. Nếu gate Dev safety FAIL, không giao bản Dev cho tester hoặc release; tiếp tục việc khác độc lập nếu an toàn.

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
