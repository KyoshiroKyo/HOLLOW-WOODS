# HOLLOW WOODS V1.5.3 — 04B1 — Chơi thử đầu làng, camera, ranh giới các vùng, nền đất/đường đi

**R10 SPLIT | Lệnh 3/11 | ACTIVE GROUP: 04B1 ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Chuyên sâu.
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04B1_WORLD_CAMERA_REPORT.md`.
- Mã thực thi: `V153-BATCH-04B1 EXECUTE REMAINING ONLY`.
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

Chơi thử production local bằng New Game/Continue và điều khiển thật trước khi sửa. Lập ảnh baseline từng zone, route/quest gates, camera, tile seam, cảnh sát biên, vị trí và F9 logs; không yêu cầu Owner quay video. Chỉ sửa camera/transition/topology/terrain/roads. Nếu cần sửa collider cụ thể gắn với route, ghi một bản sửa chính, chuyển nhà/cây/props sang B2. Giữ B2 toàn bộ layout Owner yêu cầu. Không coi fixture teleport là playthrough.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

## B04-03 — Map bounds, camera & transitions (04B) — CLOUD-FIX-01A/04/04A

Rà soát từng zone thực từ data registry; không giả định mọi map cũ tồn tại. Kiểm tra map nhỏ hơn viewport, camera follow/clamp ở bốn góc, zoom/DPR/resize, nền bị khuyết, seam, layer order, camera reset sau transition. Kiểm thử Bellhollow, Fog Crossing, Sanctuary Farm, Outer Woods, Crooked Path, Silent Mire, Broken Bell Shrine và các zone thực khác. Sửa lỗi đi vào vùng đen, spawn ngoài map, exit sai cờ, vòng lặp chuyển map, return route. Không mở khóa vùng chưa đến nhiệm vụ. Kiểm tra mép trái nhà Neris, mảng nền chữ nhật, East Gate cả lúc khóa/mở, lối Bellhollow y=232 theo báo cáo (xác minh tọa độ thực), hai chiều Sanctuary Farm. Chơi bằng phím với noclip OFF. Nếu camera viewport rộng hơn zone, không kéo méo nền; dùng giới hạn/border phù hợp và kiểm tra không lộ vùng ngoài map trái ý đồ.

### B04-03 — Tester regression: seam, camera và điểm chuyển vùng

Ảnh tester mới có đất bị cắt ngang bằng đường thẳng, mảng màu hình chữ nhật lớn, đường đi gãy khúc, prompt `[E] Kiểm tra Khuôn Đúc Chuông Cũ`, dòng gọi có thư khẩn từ làng xuất hiện ở phía trên, nhân vật sát thanh Quickbar dưới. Khu vực nghi là tuyến tới Abandoned Bell Workshop; phải xác minh zone ID/tọa độ và state thật bằng F9, không coi vị trí suy đoán là kết luận. Kiểm tra world/chunk bounds, terrain layer/texture load, culling, render depth, overlay sương/ánh sáng, trigger và nguồn lời thoại, điều kiện/độ dài hiển thị. Không che seam bằng lớp màu đen/sương; sửa gốc. Đi thực bằng phím cả hai chiều, camera và HUD không che thao tác cần thiết. Nếu cần UI riêng ghi B04-13; không phá thiết kế camera có chủ đích. Ảnh trước/sau cả route, test no-clip OFF, sau reload và chuyển cảnh; không chỉ teleport.

### B04-03A — BUG-021/022/029: Camera đầu làng và ranh giới Sanctuary Farm

- Tái hiện bằng New Game và Continue tại tuyến Fog Crossing → Bellhollow, trước nhà Garth, lối đầu làng và hai chiều qua lại; đứng yên sát ranh giới, đi bộ/chạy, đổi hướng, mở/đóng hội thoại, resize/iframe và reload. Owner báo camera quay mòng mòng nhưng chưa có video; phân biệt rotation, follow jitter, zoom, giật scroll, tween/FX và transition lặp. Ghi camera rotation/scroll/zoom/bounds, follow target, player x/y và enter/exit events bằng QA F9; không cần người dùng quay lại.
- Kiểm tra camera follow bị đăng ký nhiều lần, reset/tween/shake/rotate/zoom còn sống sau chuyển scene, sai tọa độ world/local, camera bounds giao nhau hoặc thay đổi liên tục, trigger overlap và zone switching. Đây là giả thuyết cần kiểm chứng. Camera top-down ổn định theo thiết kế, không xoay hoặc giật ngoài ý đồ, không snap/lặp tại biên; mỗi lượt chuyển vùng hợp lệ chỉ kích hoạt một lần, không mất input hoặc player. Không tắt mọi camera FX để che nguyên nhân.
- Tái hiện Sanctuary Farm ở đoạn đường giữa giếng/luống/ao phía trái và khu lửa trại/lều phía phải theo ảnh. Kiểm tra zone registry, polygon/rect bounds, priority, safe-zone, trigger, fog exposure, delta/time step, cooldown, trạng thái ẩm/lạnh, quái/ảo giác, nguồn giảm Tinh Thần và save/continue. Đối chiếu thiết kế hiện có: vùng được xác định là an toàn không được bị áp dụng drain của rừng do sai biên; nếu khu vực thực sự có nguy hiểm hợp lệ thì phải có dấu hiệu rõ ràng, không tự xóa cơ chế. Không đổi balance toàn game để sửa seam. Phân biệt BUG-022 (logic) và BUG-023 (FX); phối hợp B04-09/12, không sửa trùng.
- Tái lập ranh giới terrain bằng tileset thật nếu có, sửa mảng màu cắt dọc/ngang, nối đường đi và độ sâu hình ảnh. Không che lỗi bằng phủ tối/sương.
- Acceptance: đi bộ/chạy qua mỗi chiều tối thiểu 5 lần và đứng yên sát biên ít nhất 30 giây theo mỗi trạng thái vùng đại diện; kiểm tra New Game/Continue, F9 tắt và bật QA, noclip OFF, thời tiết/ngày đêm nếu liên quan. Ghi chuỗi zone/safe-zone/Tinh Thần và camera state; không phát sinh transition lặp, camera xoay/giật bất thường, drain sai vùng, banner spam. Kiểm tra lại toàn bộ tuyến liên quan, không chỉ điểm chụp. Nếu hiệu ứng chớp lỗi phát hiện trong 04B, ưu tiên chặn spam/nhấp nháy sớm, ghi thay đổi cho 04D và giữ cơ chế Tinh Thần.

### B04-03B — BUG-033: topology dữ liệu World Map [N]

Đọc registry zone, adjacency/exit/return, gate, quest objective, unlock/discovery flags và tọa độ sơ đồ. Ảnh cho thấy bản đồ 4/10 vùng mở, node chưa khám phá bên trái vượt khung và mục tiêu/nhãn phong ấn chồng nhau; đây là bằng chứng UI, không đủ để kết luận dữ liệu tuyến thật sai. Xác minh danh sách vùng, hướng đi, tên Việt/Anh và đích từng quest step (đặc biệt Silent Mire/Đầm Lầy Tĩnh Lặng, lối qua Crooked Path và mục tiêu xuất hiện với tên khác nếu có). Không tự hợp nhất hai zone chỉ vì tên giống, không đổi ID, không mở khóa vùng chưa khám phá. Lập dữ liệu topology đúng thực tế cho B04-13D; kiểm tra bản đồ và runtime cùng state. Sửa logic topology ở 04B nếu sai, giao layout node/labels cho 04E. Không làm mini-map mới.

## B04-04 — Terrain & roads (04B) — CLOUD-FIX-01

Cải thiện nền đất, đá lát, rêu, cỏ, đường đất, bãi trống, ranh giới terrain; ưu tiên tile thật có sẵn. Liên kết đường chính/phụ, tạo chuyển tiếp tự nhiên, giảm lặp, không để đường hình chữ nhật khuyết hoặc vô lý. Kiểm tra tile dimensions, tile IDs, render scale, collision tile, path connectivity. Giữ không gian NPC, lối ra/vào, tài nguyên và tuyến quest. Không vẽ toàn bộ map bằng Graphics hoặc tạo hàng nghìn GameObjects ground khi tilemap phù hợp. Screenshot trước/sau mỗi zone. Bellhollow cần quảng trường nhận diện rõ, đường nối nhà/NPC/chế tạo/nông trại/cổng rừng, tránh dải lát đá xám quá rộng và nền olive lặp trống; rừng có lối tự nhiên, điểm mốc và ranh giới rõ. Các vùng nguy hiểm vẫn mở theo quest, không thêm map chỉ để tăng diện tích.

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
