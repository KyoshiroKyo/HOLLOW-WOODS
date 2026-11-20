# HOLLOW WOODS V1.5.3 — 04C-K3 — Hoàn thiện chiến đấu, kỹ năng, trạng thái 4 hướng và nghiệm thu nhân vật

**R10 SPLIT | Lệnh 6/11 | ACTIVE GROUP: 04C-K3 ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Chuyên sâu (Max nếu cần).
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04_K3_COMBAT_REPORT.md`.
- Mã thực thi: `V153-BATCH-04C-K3 EXECUTE REMAINING ONLY`.
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

Tiếp tục K1/K2, không lặp nhóm đã đạt. Chỉ sản xuất nhóm kỹ năng/trạng thái còn thiếu. Tích hợp các kỹ năng đã duyệt, giữ asset-only cho skill mở rộng chưa duyệt; Jump/Fall/Land archive, Fire Nova thuộc Parry. Chốt 34 chuỗi nguồn, ma trận 26 nhóm, runtime thật, 0 missing frame; không ép 34 chuỗi thành 136 kỹ năng. Nếu thiếu artwork/tool, không dùng sprite giả và không báo hoàn thành.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

### Tiêu chí truy vết — CLOUD-01G → CLOUD-01P
#### FULL COMBAT & EXTENDED SKILL ANIMATION

Hoàn thiện tài nguyên chiến đấu theo bốn hướng:

- Light Attack.
- Heavy Attack.
- Attack Combo.
- Attack Recovery.
- Thrust.
- Ground Slam.
- Flame Stream.
- Fire Wave.
- Aerial Somersault.
- Weapon Art.

Đối chiếu toàn bộ chuỗi với Frame Map của 34 animation gốc.

Xác định đòn nào là animation độc lập và đòn nào thuộc cùng một combo hoặc Weapon Art.

Không bỏ qua những chuyển động gốc chỉ vì chúng phức tạp.

Không tự biến tên mô tả tạm thời thành tên chính thức của tác giả.

Fire Nova phải được bảo toàn như một pha hiệu ứng trong Parry thành công theo kết quả F0-0.

Không tự tách Fire Nova thành kỹ năng gameplay độc lập.

Các hoạt ảnh mở rộng được chuẩn bị để sử dụng trong tương lai.

Chưa tự ý thêm:

- Skill Tree.
- Kỹ năng mới vào gameplay.
- Cooldown mới.
- Công thức sát thương mới.
- Phím kỹ năng chưa được Project Owner phê duyệt.

Chỉ tích hợp các kỹ năng phù hợp với hệ thống chiến đấu hiện có.

Yêu cầu animation:

- Hướng vũ khí tương ứng hướng nhân vật.
- Hiệu ứng lửa đồng bộ với chuyển động.
- Không tự đổi kích thước vũ khí.
- Không cắt mất VFX.
- Không làm nhân vật biến dạng giữa các frame.
- Bảo toàn thứ tự và nhịp chuyển động gốc khi sử dụng frame Fellor.

---

### Tiêu chí truy vết — CLOUD-01Q → CLOUD-01W
#### DEFENSIVE ACTIONS, WEAPON STATES & CHARACTER STATES

Hoàn thiện đủ bốn hướng cho:

- Parry.
- Armed Roll.
- Unarmed Roll.
- Weapon On.
- Weapon Off.
- Armed Buff.
- Unarmed Buff.
- Armed Hurt.
- Unarmed Hurt.
- Death.

Yêu cầu riêng:

1. Parry giữ đúng chuỗi hiệu ứng gốc, bao gồm pha Fire Nova đã xác minh.
2. Armed Roll và Unarmed Roll không được sử dụng nhầm sprite.
3. Rút/tra kiếm phải có chuyển động rõ ràng.
4. Buff sử dụng hào quang đỏ sẫm phù hợp bản gốc.
5. Buff không được gộp với Vòng Sáng [F].
6. Hurt phải phân biệt hai trạng thái vũ khí.
7. Death chỉ sử dụng đúng chuỗi nguồn, không lẫn ba frame Armed Hurt như lỗi cũ.
8. Bảo toàn hiệu ứng tan biến cách điệu của Death.
9. Không giới hạn Hurt và Death ở hai frame nếu làm mất chuyển động gốc.

Jump / Fall / Land:

- Bảo toàn toàn bộ tài nguyên gốc.
- Phân loại ARCHIVED.
- Không thêm hệ thống nhảy vào game trong batch này.

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

### Tiêu chí truy vết — CLOUD-01Z
#### BLACK KNIGHT RUNTIME INTEGRATION

Tích hợp artwork Black Knight đã đạt chất lượng vào game.

Nếu chưa đủ artwork chính diện hoặc sau lưng, không được dùng sprite giả để lấp chỗ trống.

Hoãn phần tích hợp phụ thuộc artwork còn thiếu.

Nếu kiến trúc hiện tại sử dụng:

WAYFARER_USE_PURE_ARTIST_SPRITES

thì thiết lập true theo quy tắc dự án khi chế độ này tương thích với bộ artwork đã duyệt.

Kiểm tra:

- WASD.
- Arrow Keys.
- Vietnamese IME.
- Đi bộ.
- Chạy.
- Chuyển hướng.
- Di chuyển chéo.
- Light Attack.
- Heavy Attack hiện có.
- Parry hiện có.
- Roll hiện có.
- Rút/tra kiếm.
- Hurt.
- Death.
- Vòng Sáng.
- Tinh Thần.
- Hương Trầm Tinh Thần.

Đồng bộ hướng animation, collider, camera và hành động chiến đấu theo kiến trúc gameplay hiện tại.

Không làm thay đổi tốc độ di chuyển, độ khó hoặc chỉ số chiến đấu ngoài phạm vi.

Không tích hợp kỹ năng mở rộng chưa được phê duyệt về gameplay.

Kiểm tra Save/Load cũ và mới.

Kiểm tra cả profile mới và Save schema 3 cũ trên Chromium. Không ghi đè dữ liệu người chơi. Chỉ kích hoạt tài nguyên mới khi đã qua kiểm tra hình ảnh và chuyển trạng thái. Phần có sẵn nhưng chưa được thay thế phải ghi rõ là legacy, không gọi là artwork mới hoàn chỉnh.

---

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
