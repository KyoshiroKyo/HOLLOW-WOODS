# HOLLOW WOODS V1.5.3 — 04C-K1 — Đưa artwork đã vẽ vào game, sửa registry/frame báo lỗi

**R10 SPLIT | Lệnh 2/11 | ACTIVE GROUP: 04C-K1 ONLY**

- Codex Cloud | GPT-6.2 Sol (theo lựa chọn UI của Owner) | Suy luận đề xuất: Chuyên sâu.
- Báo cáo riêng: `Read/V1.5/Reports/V153_B04_K1_RUNTIME_REPORT.md`.
- Mã thực thi: `V153-BATCH-04C-K1 EXECUTE REMAINING ONLY`.
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

Sau 04A, ưu tiên nhân vật trước. Không dừng ở file ảnh tham khảo. Bản đầu tiên phải tích hợp một nhóm state đủ hướng đã đạt chuẩn nếu tài nguyên thực có; nếu thiếu, ghi rõ đường dẫn và sửa registry độc lập, không gọi artwork là hoàn tất. K2/K3 chịu trách nhiệm phần còn thiếu. Các tiêu chí full set bên dưới là ràng buộc tương thích, không giao làm hết trong K1.

## Đặc tả chi tiết kế thừa R9 (chỉ thực hiện mục còn mở thuộc phạm vi trên)

## B04-10 — Black Knight artwork recovery & animation QA (04C, nhánh độc lập nếu cần)

### B04-10-K1 — P0: TÍCH HỢP ARTWORK MỚI THẬT VÀO GAME (không dừng ở ảnh tham khảo)

1. Kiểm kê đúng thư mục `Pixel_Art/Black Knight/Source_Library/`, `Custom_4Dir/`, artwork batch trước, asset runtime trong `public/assets/` và registry thật. Với từng chuỗi/hướng, ghi file, SHA, số frame, PNG alpha, nguồn (Fellor hoặc custom), trạng thái đã vẽ/đã đạt/đã pack/đã load/đã hiển thị. Phân biệt contact sheet, preview nền cyan và sprite sản xuất. Nếu file đã vẽ ở worktree/generated output nhưng chưa được lưu vào repo, khôi phục bản thật nếu môi trường có quyền; không giả định máy Cloud truy cập ổ G: hay task khác. Không dùng ảnh screenshot thu nhỏ làm nguồn sprite cuối. Ghi MISSING_FROM_CLOUD nếu không tìm được.
2. Dùng ngay 324 frame nguồn đã trích và các frame custom thực tế có sẵn. Ưu tiên RIGHT Fellor gốc (không vẽ lại), LEFT mirror chỉ khi kiểm tra đúng tay/vũ khí, áo choàng, VFX; nếu cần custom LEFT thì sửa đúng lỗi palette/cyan. UP/DOWN đã có 6 frame Armed Idle mỗi hướng ở bản thử: kiểm tra lại alpha thật, silhouette, tỷ lệ, pivot, nhịp và chất lượng ở zoom game. Không loại vì nền cyan của ảnh preview nếu PNG runtime thực sự trong suốt; không chấp nhận viền cyan còn trên PNG đã tách. Chỉ sửa/tạo frame chưa đạt. Không dùng AG2.0 procedural, hình chữ T/robot, sprite xoay ngang, frame giả.
3. Tạo/đóng atlas production từ **frame riêng đạt chuẩn**, không copy nguyên Reference Sheet nhiều tư thế làm texture. Giữ nguồn 144×64 và metadata khi phù hợp; không ép 64×64 nếu cắt VFX. Kiểm tra non-transparent body, đúng frame count, alpha, foot pivot, animation timing, path/case và đọc được bằng loader thật. Nếu cần chuyển atlas, chuẩn hóa metadata theo renderer đang dùng. Đặt file runtime ở đúng đường dẫn public của repo, không sửa file nguồn Fellor.
4. Kết nối asset mới vào ASSETS_MANIFEST.json, preload, texture/frame registry và BlackKnightAnimations/BlackKnightPlayer tại đúng call site; đối chiếu alias `satyr_sheet`, các frame bị báo thiếu 16/17/20/21, 72 cặp khóa legacy, registration order và fallback. Khắc phục gốc missing frame; không tắt warning hoặc đổi alias Save tùy tiện. Xác minh cờ WAYFARER_USE_PURE_ARTIST_SPRITES theo quy tắc. Không dùng code vẽ fallback nhân vật giả. Khi một state cần đủ bốn hướng mà chưa đạt, không tự gán RIGHT cho UP/DOWN; giữ runtime an toàn đã xác minh cho phần chưa đủ và báo BLOCKED nếu không có thay thế hợp lệ. Không gọi bộ mới hoàn chỉnh trong trường hợp này.
5. Tích hợp theo nhóm state nguyên vẹn đã đạt (đầu tiên Armed Idle 4 hướng nếu đạt, sau đó Unarmed Idle/Walk/Run theo phụ thuộc); không cần đợi hoàn thành tất cả 34 chuỗi mới đưa bất kỳ nhóm hợp lệ nào vào bản QA. Mỗi lần chuyển state phải có đầy đủ tài nguyên hợp lệ cho tất cả đường input có thể tới state đó. Chỉ bật nhóm mới khi kiểm thử không gây mất hình, gián đoạn gameplay hoặc làm hỏng Save. Nếu cần, dùng feature gate QA rõ ràng với asset thật; không phát hành bộ nửa hoàn thiện. Không dùng placeholder AG2.0 để hợp thức hóa fallback.
6. Chạy production local và QA Chromium, điều khiển WASD/arrow để nhìn thấy chính **nhân vật trong game** ở DOWN/UP/LEFT/RIGHT trong cùng build. Kiểm tra frame key bằng F9, đổi hướng, Idle ↔ Walk ↔ Run, chuyển Armed/Unarmed và hành động hiện hành có liên quan; không chỉ xem contact sheet. Lưu ảnh/GIF/video ngắn runtime bốn hướng, bảng key→file→frame thực, console log 0 missing-frame/404 cho nhóm đã nghiệm thu, Save/Continue và TypeScript. Nếu chưa thể tích hợp vì artwork/tool thiếu, ghi lý do, file thiếu, bước cần tiếp theo; hoàn thiện phần độc lập về registry và lỗi runtime, không tuyên bố PASS.
7. Báo rõ số nhóm hướng thực sự tích hợp/đã kiểm thử, dẫn đường dẫn runtime asset mới, commit và bằng chứng. `ARTWORK_READY` không phải `RUNTIME_TESTED`. K1 kết thúc bằng checkpoint cho K2/K3, không vẽ thêm vô hạn hoặc báo xong toàn bộ Black Knight khi chỉ có Idle.

### B04-10-K2/K3 — hoàn tất bộ còn thiếu trong 04C

K2: toàn bộ nhóm di chuyển Armed/Unarmed và combat hiện hành 4 hướng còn thiếu, theo matrix bên dưới; tích hợp từng nhóm đã đạt, kiểm tra chuyển trạng thái. K3: toàn bộ kỹ năng/trạng thái bổ sung theo 34 chuỗi nguồn, atlas, hoàn tất runtime những kỹ năng gameplay đã duyệt; kỹ năng mở rộng chưa duyệt chỉ lưu asset chuẩn hóa, không tự thêm phím hay balance. Jump/Fall/Land lưu ARCHIVED theo scope; Fire Nova là pha Parry, không tự biến thành kỹ năng riêng. K2/K3 không tạo lại hoặc tích hợp lại nhóm K1 đã PASS. Hoàn tất cuối cùng chỉ khi cả ma trận và các state runtime bắt buộc đủ bốn hướng, không còn sprite AG2.0 giả trong tuyến gameplay đã nghiệm thu và 0 missing frame. Tách rõ phần archive/asset-only và runtime, không ép 34 × 4 thành 136 kỹ năng độc lập.

### P0 — Runtime animation registry & missing frames (chỉ sửa phần chưa đạt)

Ảnh F9 hiển thị bộ đếm 136 cảnh báo, nhiều dòng `Frame not found in texture satyr_sheet` (ví dụ frame 16, 17, 20, 21). Nhân vật quay xuống/lưng vẫn thô, lỗi khi tung chiêu đã được Owner báo. Trên checkpoint cũ từng ghi nhận alias `satyr_sheet` trỏ tới `wayfarer_idle.png` trong khi đăng ký frame legacy; đây là hướng điều tra cần xác minh ở HEAD, không phải kết luận chắc cho mọi build. Kiểm tra `src/animation/BlackKnightAnimations.ts`, `src/entities/BlackKnightPlayer.ts`, `src/scenes/PreloadScene.ts`, JSON registry thực, atlas/metadata/frame dimensions và toàn bộ call sites; tìm đường dẫn nếu file đã chuyển tên. Lập mapping key → texture → frame tồn tại → số frame → hướng/state, gồm 72 cặp legacy key và ID Save. Xác minh registration order, alias, fallback, frame indexing và duplicate keys; sửa nguyên nhân, không suppress warning, không thay frame thiếu bằng frame giả hoặc thu hẹp danh sách chức năng để test xanh. 04A chỉ cần ghi nhận/chẩn đoán bằng inspector; 04C sửa độc lập lỗi registry xác minh được dù artwork còn BLOCKED, giữ chuỗi runtime an toàn đã duyệt và khai báo rõ phần thiếu. Không tích hợp artwork sai nét chỉ để hết warning. Test từng state và hướng, chuyển state khi di chuyển, tung chiêu hiện có, đổi vũ khí, va chạm, VFX, input và khi bị gián đoạn; ghi video/GIF preview và log runtime. Không thay đổi balance/cơ chế ngoài scope. Yêu cầu 0 missing-frame warning trong ca nghiệm thu, không coi 0 TypeScript errors là animation PASS. Nếu nguồn mới thiếu, ghi PARTIAL/BLOCKED; bảo toàn full 34 chuỗi nguồn, hướng và toàn bộ mã CLOUD-01C..01Z bên dưới.

Đọc 34 chuỗi/324 frame Source Library, 16 GIF, coverage matrix và checkpoint R2. Khóa LEFT PARTIAL: xác minh nhiễm cyan trên alpha thật (không nhầm nền preview cyan), tỷ lệ, palette, tay cầm, anchor, timing, silhouette; chỉnh/tạo artwork bổ sung từ nguồn Fellor và turnaround hợp lệ bằng công cụ phù hợp. RIGHT gốc giữ nguyên; LEFT có thể mirror nếu kiểm tra tính đối xứng và không làm sai tay/đồ đeo, nếu không phải có artwork hợp lệ. UP/DOWN riêng không quay sprite ngang. Không dùng code tự vẽ, không kéo giãn ảnh, không dùng AG2.0, không ghi đè nguồn. Python chỉ crop, tách alpha, resample nearest, pack, validate. Không tiếp tục tích hợp atlas chưa đạt duyệt. Hoàn thành các task CLOUD-01C..01Z chưa đạt theo tiêu chí chi tiết ngay dưới đây và matrix thật: Idle/Walk/Run armed/unarmed, Light/Heavy, combo, Weapon Art, Parry, Buff, Roll, Weapon On/Off, Hurt, Death và các chuỗi áp dụng khác ở 4 hướng; Jump/Land chỉ tích hợp nếu scope đã duyệt; giữ Fire Nova đúng chức năng nguồn nếu thuộc Parry. Không tuyên bố 34 kỹ năng mới khi 34 chuỗi nguồn gồm trạng thái/hiệu ứng. Preview GIF/atlas và runtime ở kích thước thật, zero empty frames trong chuỗi body có nội dung (effect-only slots có lý do phải ghi riêng), không viền màu, chân ổn định, không cắt VFX, tương thích 72 legacy keys và các ID Save. Nếu thiếu công cụ/duyệt artwork, ghi BLOCKED; không ngăn sửa lỗi độc lập, không lấp giả.

#### Đặc tả Black Knight đầy đủ kế thừa từ Batch 03 (chỉ xử lý mục còn thiếu; không chạy lại những phần PASS)

### Tiêu chí truy vết — CLOUD-01B
#### BLACK KNIGHT ORIGINAL CHARACTER RECONSTRUCTION

STATUS: REFERENCE SHEETS COMPLETED IN BATCH 02 — QUALITY GATE ONLY nếu đầu ra hợp lệ.

Kiểm tra 5 bảng trong Custom_4Dir/ về góc nhìn top-down, tỷ lệ pixel với sprite gốc, silhouette, chùm lông, tay cầm vũ khí và vị trí đeo kiếm. Không tái tạo bảng đạt chuẩn. Nếu chỉ một hướng chưa đạt, sửa đúng hướng đó. Armed Idle LEFT đã được báo PARTIAL vì lệch phong cách RIGHT Fellor; ưu tiên sprite ngang nguồn hợp lệ thay vì vẽ lại cả hai hướng. Nếu dùng mirror, kiểm tra tay/vũ khí, hướng hiệu ứng và chùm lông, không bắt buộc mirror nếu làm sai hình. Artwork mới phải được ghi nhận là bản bổ sung dựa trên Fellor, không phải frame chính hãng.

Đây là yêu cầu chất lượng bắt buộc cho artwork; không trì hoãn sửa lỗi độc lập.

Nguồn tham chiếu chính thức:

`Pixel_Art/Black Knight/`

Đặc biệt sử dụng:

- Black_Knight_All_In_One_New.png.
- Source_Library/.
- Toàn bộ 16 GIF animation.
- Black_Knight_Art.gif.
- Black_Knight_Art_With_Light.gif.
- knight_no_text.png.
- Các WEB_Images còn lại.
- License.txt.
- Read me.txt.

Source Library đã được CLOUD-01A báo tạo thành công gồm:

- 34 chuỗi animation gốc.
- 324 frame PNG RGBA.
- 34 metadata.
- 4 contact sheet.
- Canvas nguồn 144×64.

Không trích xuất lại nếu thư viện hiện tại hợp lệ.

#### CHARACTER IDENTITY LOCK

Nhân vật chính chính thức:

BLACK KNIGHT — THE MOSSBOUND WAYFARER.

Bảo toàn:

- Mũ trụ sắt tối.
- Khe nhìn chữ T.
- Chùm lông đỏ sẫm trên mũ theo artwork tham chiếu.
- Giáp vai nhiều lớp.
- Giáp thân.
- Áo choàng đen rách.
- Thanh đao cong phát sáng màu cam vàng.
- Vị trí đeo kiếm sau lưng.
- Tỷ lệ cơ thể.
- Phong cách Pixel Art của Fellor.

Không tự thiết kế nhân vật khác.

#### REJECT AG2.0 ARTWORK

Các sprite UP/DOWN do AG2.0 sử dụng code để vẽ trước đây không được dùng làm nguồn tạo hình mới.

Chỉ được đọc asset legacy để kiểm tra thông số kỹ thuật, loader, animation key, kích thước và khả năng tương thích.

Không được:

- Vẽ nhân vật bằng Phaser Graphics.
- Vẽ nhân vật bằng hình học procedural.
- Xoay ảnh side-view để tạo hướng UP/DOWN.
- Dán vệt kiếm cam cố định.
- Sử dụng lại hình nhân vật lỗi.
- Recolor sprite cũ để giả lập artwork mới.

Cho phép sử dụng code để trích xuất, cắt frame, xử lý alpha, căn chỉnh, đóng atlas và kiểm tra artwork.

#### FOUR-DIRECTION TURNAROUND

Đối chiếu năm bảng đã tạo; chỉ bổ sung hoặc sửa Reference Sheet còn thiếu:

1. Armed Knight — DOWN / UP / LEFT / RIGHT.
2. Unarmed Knight — DOWN / UP / LEFT / RIGHT.
3. Weapon Reference.
4. Armor and Cape Reference.
5. Character Palette.
6. Body Proportion Reference.

Ưu tiên giữ tối đa artwork LEFT/RIGHT chính hãng.

Xây dựng mới artwork UP/DOWN dựa trực tiếp vào thiết kế gốc.

Không dùng artwork sai góc nhìn đã được F0-0 phát hiện.

Các Reference Sheet mới phải có nguồn gốc rõ ràng và không được ghi nhận là artwork nguyên bản của Fellor.

Nếu chưa có công cụ tạo artwork hoặc chưa có ảnh bổ sung đạt yêu cầu:

- Đánh dấu CLOUD-01B/B04-10 BLOCKED cho phần phụ thuộc.
- Xuất đặc tả hình ảnh cần cung cấp.
- Không thay thế bằng sprite giả.
- Tạm giữ các nhiệm vụ phụ thuộc artwork mới.
- Tiếp tục các nhiệm vụ độc lập về UI, môi trường và sửa lỗi.

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
