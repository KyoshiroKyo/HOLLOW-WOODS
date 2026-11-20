# HOLLOW WOODS V1.5.3 — 04C-K2 — Hoàn thiện di chuyển Armed/Unarmed 4 hướng

**R10 SPLIT | Lệnh 5/11 | ACTIVE GROUP: 04C-K2 ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Chuyên sâu.
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04_K2_MOVEMENT_REPORT.md`.
- Mã thực thi: `V153-BATCH-04C-K2 EXECUTE REMAINING ONLY`.
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

Đọc matrix K1 và chỉ xử lý Idle/Walk/Run chưa đạt. Atlas/registry tiêu chí chung bên dưới chỉ áp dụng nhóm này, không tạo lại portrait hoặc migration, không đóng các nhóm chiến đấu chưa test. Bắt buộc tích hợp thật các nhóm đủ điều kiện và kiểm tra WASD/arrow/IME, 4 hướng, chéo, anchor, chuyển state, missing frame, Save. Thiếu Walk thật thì đánh dấu thiếu, không phát chậm Run để báo PASS.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

### Tiêu chí truy vết — CLOUD-01C → CLOUD-01F
#### FULL FOUR-DIRECTION MOVEMENT

Hoàn thiện:

| Animation | Hướng bắt buộc |
|---|---|
| Armed Idle | DOWN / UP / LEFT / RIGHT |
| Armed Walk | DOWN / UP / LEFT / RIGHT |
| Armed Run | DOWN / UP / LEFT / RIGHT |
| Unarmed Idle | DOWN / UP / LEFT / RIGHT |
| Unarmed Walk | DOWN / UP / LEFT / RIGHT |
| Unarmed Run | DOWN / UP / LEFT / RIGHT |

Mỗi nhóm animation thực hiện và kiểm tra riêng.

Yêu cầu:

- Hoạt ảnh đi lên thực sự quay lưng.
- Hoạt ảnh đi xuống thực sự nhìn chính diện.
- Không sử dụng hoạt ảnh ngang cho hướng dọc.
- Áo choàng chuyển động tự nhiên.
- Chùm lông không biến mất ngẫu nhiên.
- Tỷ lệ nhân vật nhất quán.
- Trạng thái cầm kiếm và tra kiếm khác nhau rõ ràng.
- Run phải khác Walk về tư thế và chuyển động, không chỉ tăng frame rate.

Bộ gốc thiếu Walk chuyên biệt.

Không tuyên bố Walk đã có nếu chỉ phát chậm Run.

Tạo Walk mới dựa trên tạo hình đã xác minh, hoặc đánh dấu thiếu artwork.

Kiểm tra loop, timing và chuyển tiếp giữa Idle, Walk và Run.

Không tích hợp các sprite chưa được kiểm tra vào runtime. Các dải UP/DOWN thử nghiệm hiện đã có sáu frame mỗi hướng; kiểm tra số ô thật, alpha sạch (không viền cyan/xám/đỏ nhiễu), pivot, kích thước, nhịp thở và chuyển động ở kích thước game. Chỉ tái tạo frame lỗi. Không sử dụng preview nền cyan như atlas runtime.

#### CHECKPOINT CLOUD-01C → CLOUD-01F

Thực hiện theo thứ tự nhóm nhỏ, ghi rõ mapping từng mã với công việc thực tế trong checkpoint. Ưu tiên CLOUD-01C tạo các frame UP/DOWN cần thiết cho Armed Idle, xác minh tay cầm vũ khí, anchor, timing và chất lượng pixel; tiếp tục các nhóm di chuyển còn lại sau khi đạt gate. Mã chi tiết đã định nghĩa trong registry dự án (nếu có) được ưu tiên; không tự đổi mã đã khóa.

Mỗi chuỗi phải có PNG thực tế, metadata, contact sheet và preview animation. Kiểm tra chuyển động ở kích thước runtime, không chỉ ảnh phóng lớn. Không kéo giãn Reference Sheet tĩnh thành nhiều frame giả. Không coi 4 tư thế đứng yên là 4 chuỗi animation.

---

### Tiêu chí truy vết — CLOUD-01X + CLOUD-01Y
#### PORTRAIT, SPRITE ATLAS & ANIMATION REGISTRY

#### Character Portrait — đã báo sửa, không tạo lại

Giữ portrait đã tích hợp và hai key tương thích; chỉ sửa nếu tái hiện lỗi thực. Không đưa vào hàng chờ vẽ.

#### Production Sprite Atlas

Chuẩn hóa toàn bộ artwork đã đạt kiểm tra.

Yêu cầu:

- PNG RGBA.
- Nền trong suốt.
- Không blur.
- Không có viền phân nhóm.
- Không cắt mất nội dung.
- Không lấy nhầm frame.
- Không đăng ký frame rỗng.
- Kiểm tra baseline.
- Sprite anchor nhất quán.
- Nearest-neighbor khi cần scale.

Canvas nguồn là 144×64.

Không tự ép mọi animation vào 64×64 nếu làm mất áo choàng, vũ khí hoặc VFX.

Xem xét tách VFX khỏi sprite nhân vật hoặc dùng atlas phù hợp.

Xác minh pivot runtime thay vì mặc định sử dụng neo thư viện (72, 63).

Tạo Animation Registry rõ ràng cho toàn bộ bốn hướng.

Cập nhật Animation Coverage Matrix.

Coverage Matrix phải theo dõi từng trạng thái × hướng, phân biệt SOURCE_ORIGINAL, CUSTOM_ART, VALIDATED, RUNTIME_TESTED, BLOCKED và ARCHIVED (hoặc trường tương đương). Lưu số frame, timing, nguồn, pivot và đường dẫn. Giữ đủ 26 nhóm: Armed/Unarmed Idle, Walk, Run; Light Attack, Heavy Attack, Attack Combo, Attack Recovery, Weapon Art, Thrust, Ground Slam, Flame Stream, Fire Wave, Aerial Somersault; Parry, Armed/Unarmed Roll, Weapon On/Off, Armed/Unarmed Buff, Armed/Unarmed Hurt, Death. Không bắt buộc coi các pha của cùng một chuỗi nguồn là kỹ năng gameplay riêng. Fire Nova thuộc Parry; Jump/Fall/Land được lưu trữ. Đối chiếu đủ 34 chuỗi nguồn, không bỏ sót.

Mỗi animation phải có trạng thái, nguồn, số frame và đường dẫn thực tế.

Chỉ chuyển sang tích hợp khi bộ artwork cần cho runtime đạt yêu cầu.

---

### CLOUD-01Y-R — migration tên đã báo hoàn tất, không chạy lại

Giữ BlackKnightPlayer/BlackKnightAnimations và aliases legacy đang hợp lệ. Chỉ kiểm tra/sửa mapping cụ thể gây missing frame hoặc import hỏng. Không thay Save ID, không find-replace hàng loạt, không xóa nguồn hoặc alias đang dùng. Nếu còn tên Satyr trong class/file nhân vật chính chưa chuyển, đối chiếu checkpoint trước khi sửa; tên texture/ID legacy hợp lệ không phải lỗi cần xóa.

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
