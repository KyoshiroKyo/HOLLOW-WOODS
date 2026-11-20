# HOLLOW WOODS V1.5.3 — 04D — Sửa âm thanh và nâng cấp hiệu ứng môi trường, ánh sáng, visual comfort

**R10 SPLIT | Lệnh 8/11 | ACTIVE GROUP: 04D ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Cao.
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04D_AUDIO_ATMOSPHERE_REPORT.md`.
- Mã thực thi: `V153-BATCH-04D EXECUTE REMAINING ONLY`.
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

Ưu tiên BUG-023 gây khó chịu; không cần người chơi xem lại flash. Dùng audio thật trong repo, nếu kho G: chưa có thì liệt kê tệp cần cung cấp. Không tạo âm thanh giả để báo PASS. Kiểm tra lửa trại/ambience/tiếng rè và cân ánh sáng sau B2. Chỉ sửa audio unlock nếu tái xuất hiện, đã báo PASS local.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

## B04-11 — Audio repair & real assets (04D) — CLOUD-CLEAN-03

Tái hiện tiếng rè/rít ở các zone, khi di chuyển, núp bụi, đổi gió/sương, menu, pause, transition, reload, focus/unfocus và đối chiếu bản tester. Kiểm tra loop ngắn và điểm nối, gain clipping, automation lặp mỗi frame (`setWindIntensity`, `updateVeilFilter`, AudioParam scheduling), filter, trùng AudioContext, cleanup nodes/listeners, footstep, ambience, BGM, SFX. Không chỉ dùng lowpass để che tiếng rè; đối chiếu file nguồn, loop và khi núp bụi trước khi xác định nguyên nhân. Sửa nguyên nhân đã xác minh; nghe thử và đo khi có công cụ; không nói hết tiếng rè chỉ vì không tái hiện. Dùng audio runtime thật sẵn có, giữ license. Nếu audio nguồn chỉ có trên G: thì lập MISSING_FROM_CLOUD inventory, nguồn, format, kích thước và đề xuất nén hợp lý (không ghi đè nguồn) cho Owner/team cung cấp; không giả audio bằng code hoặc tải file thay thế tùy tiện. Không commit file nặng không được phép; kiểm tra policy/LFS và quyền phân phối trước mọi bổ sung. Thiếu audio là blocker cho phần liên quan; game không được treo vì asset optional thiếu.

### B04-11A — BUG-026/027: sửa đúng nội dung và chất lượng âm thanh

Tester báo lửa trại nghe giống gõ bàn phím, âm thanh môi trường bình thường giống sóng biển; trước đó còn rè/rít. Kiểm tra mapping thật của campfire, ambience village/crossing/forest/farm/mire, footsteps, wind/rain/sanity/heartbeat, UI/crafting và các SFX liên quan. Nghe riêng từng channel nếu môi trường hỗ trợ, sau đó nghe trong runtime; mute/solo QA để khoanh vùng nguồn. Đối chiếu file gốc, thời lượng, đặc tính âm thanh, loop seam, playbackRate, gain, spatial distance, fade và chồng instance. Không kết luận tiếng gõ là zipper noise hay tiếng biển là gió trước khi có bằng chứng. Kiểm tra campfire đúng tiếng củi cháy nhẹ, không lặp xung gắt; ambience vùng làng/nông trại/rừng tự nhiên, phân biệt đầm lầy nếu phù hợp; âm biển chỉ dùng khi bối cảnh hợp lệ. Khi rời/trở lại camp và đi qua ranh giới, crossfade mượt, không nhân đôi track hoặc reset âm quá nhiều. Không thêm âm thanh tự sinh bằng code, không thay bằng asset Internet tùy tiện. Nếu thiếu file nguồn thật đã duyệt (G: chưa đồng bộ), ghi `MISSING_FROM_CLOUD` cùng mapping cần cung cấp, giữ runtime ổn định; không báo PASS âm thanh chỉ từ test script. Acceptance: nghe thử tối thiểu 60 giây mỗi ambience liên quan khi có thể, kiểm tra loop/transition và mute/unmute/pause/Continue; lưu kết quả nghe thực và đo kỹ thuật, ghi NOT LISTENED nếu Cloud không có khả năng nghe. Báo cáo riêng nguồn đã dùng và phần còn chờ tester. Không bắt team phải dùng thiết bị âm lượng cao.

## B04-12 — Fog, lighting & environment quality (04D) — CLOUD-FIX-08

Đồng nhất Dark Woodland Pixel Art; ánh sáng có chủ đích, giữ readability, phân tầng sương theo zone, tránh phủ hết UI, tile seam và banding. Sửa artifact khi zoom, di chuyển, chuyển cảnh, Canvas/WebGL. Giữ cơ chế Vòng Sáng/Tinh Thần; tối ưu cache và tránh render toàn texture mỗi frame. Đo hiệu năng trước/sau.

### B04-12A — BUG-023: Tinh Thần FX an toàn, giảm chuyển động và ánh sáng nhấp nháy

Tester báo cứ mất Tinh Thần là màn hình chớp chớp gây đau mắt. Tái hiện bằng QA log/đếm FX và kiểm tra trạng thái, không yêu cầu tester tiếp tục xem hiệu ứng gây khó chịu. Kiểm tra các listener composure/sanity, scene update, flash/shake/fade/tween, điều kiện ngưỡng, zone transitions, overlay và cleanup. Không phát flash toàn màn hình lặp mỗi tick/mỗi lần giảm chỉ số, không dùng strobe/nhấp nháy tương phản mạnh. Thay bằng phản hồi ổn định, nhẹ nhàng: viền tối mềm, thay đổi màu/thông báo và thanh Tinh Thần rõ ràng, chuyển cảnh từ từ nếu hợp lý. Giữ nội dung kinh dị và cơ chế gameplay, không xóa Tinh Thần, không làm mất khả năng nhận biết nguy hiểm. Ưu tiên không nhấp nháy gây khó chịu ngay mặc định; giảm camera shake/FX chuyển động và hỗ trợ tùy chọn giảm hiệu ứng/chuyển động nếu Settings hiện hữu cho phép, tôn trọng `prefers-reduced-motion` nơi phù hợp và không dùng tùy chọn để miễn sửa lỗi mặc định. Không làm tối quá mức HUD/nhân vật.

Acceptance: kiểm tra Tinh Thần giảm liên tục, qua ngưỡng, hồi phục, vùng an toàn, mưa/sương, bật/tắt Vòng Sáng, đổi map, New Game/Continue, settings và pause. Xác minh không có flash toàn màn hình lặp, không có tween/overlay trùng, không giật camera/nháy tại biên và feedback mất Tinh Thần vẫn rõ. Test bằng đếm sự kiện/tween/visual state, không tạo video nhấp nháy làm tài liệu. Nếu không xác minh được lý do giảm Tinh Thần, giữ BUG-022 mở. Giữ P0 đến khi nghiệm thu bằng bằng chứng và trải nghiệm an toàn.

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
