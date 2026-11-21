# V153 04B — Hotfix phát hành lượt 1

Baseline `ac9030a13e912241a76e6ecc5deb7d6d0ecf46ed` trên `feat/v1.5.3-batch04`. Mỗi phần ghi SHA triển khai và bằng chứng tại commit cập nhật báo cáo trên cùng nhánh.

## A1 — PASS LOCAL

SHA triển khai `fc844fe99fa894874ab59c496a9d7121fc4d4a35`. Trên Chromium Canvas, giữ D từ (1296, 730) làm nhân vật dừng ở x=1299 với `blocked.right=true`. Chỉ một body (`1308,712,24,16`) của bếp Thợ Săn được nạp. Khai báo `ow_firepit_rock` không tạo body thứ hai ở ca này. FPS mẫu lúc bị chặn khoảng 46, bằng chứng trực tiếp là collision. Không đo benchmark hiệu năng.

Bỏ bếp Thợ Săn trong `WorldBuilder.ts`, `zones.json` và map Tiled `outer_woods.json`. Bỏ prompt về tro tàn và handler tương ứng trong `GameScene.ts`. Body lều, đá, thùng và bếp Vaelen trong vùng lấy mẫu không đổi.

Build TypeScript/Vite PASS. Giữ D cùng điểm bắt đầu đến x≈1437. Shift+W qua vị trí bếp cũ, rẽ đông rồi bắc quanh trại, đi hai chiều Xưởng Chuông, tất cả với Noclip tắt. Nhấn E tại bếp Vaelen phục hồi hơn 15 Tinh Thần tính cả hồi thụ động và hạ độ ẩm. Không có lỗi trang hoặc HTTP trong ca này. [Trước sửa](Visuals/V153_B04_MASTER_HOTFIX/a1-before.json) · [Sau sửa](Visuals/V153_B04_MASTER_HOTFIX/a1-after.json)

## A2 — PASS LOCAL

SHA triển khai `12448d5dfdfc269a33581dbdf737b75e6a1c374d`. Trước sửa, điểm tương tác (1330,1240) không có sprite và E lần hai tăng túi từ một lên hai. `WorldBuilder.ts` dùng sprite pixel-art 24×24 `res_runed_iron` đã nạp, neo chân theo đúng object. `GameScene.ts` dùng cờ bền `has_runed_iron_part`, gỡ sprite và prompt khi nhận thưởng hoặc khi đã nhận từ bàn thao tác. Giữ item và quest ID.

Build TypeScript/Vite và hai ca schema 3 PASS. Chromium thấy sắt ngoài tầm E, nhặt được đúng một `mat_runed_iron`, đánh dấu `SQ01_RUNED_IRON/t1` và tắt prompt. Sau khi tiêu hao sắt, lưu và Continue rồi nhấn E lại, số lượng vẫn bằng 0, không có sprite hay prompt sắt. [Bản ghi trước](Visuals/V153_B04_MASTER_HOTFIX/a2-before.json) · [Bản ghi sau](Visuals/V153_B04_MASTER_HOTFIX/a2-after.json) · [Ảnh trước](Visuals/V153_B04_MASTER_HOTFIX/a2-before.png) · [Ảnh sau](Visuals/V153_B04_MASTER_HOTFIX/a2-after.png)

## C — Canvas Restart — PASS LOCAL

SHA triển khai `4061858b5268e206647e9c1c0dac8bf516c0b1e3`. Chromium Canvas tái hiện stack `GameScene.create → applyCameraBoundsForZone → updateMiniMapZone → updateZoneBadge → drawImage`. Chặn đo tại Text cũ xác nhận `setText` gọi trên chính instance đã mất Scene khi UIScene ở trạng thái SHUTDOWN. New Game ở baseline còn có badge mặc định không khớp vùng lúc bắt đầu.

`GameScene.ts` đồng bộ minimap khi HUD mới phát CREATE và chỉ cập nhật UIScene đang chạy ở các lần chuyển vùng. `UIScene.ts` giải phóng các tham chiếu badge khi shutdown. Build PASS. Canvas xác minh New Game, ba Restart liên tiếp, Save/Continue rồi Restart, chuyển vùng rồi Restart. WebGL smoke xác minh New Game và một Restart. Các snapshot có đúng một actor, một canvas và một zone badge. Badge và dữ liệu minimap khớp vùng, chính sách ẩn minimap vẫn áp dụng. Không còn cập nhật Text cũ, exception hoặc 404 trong các ca này. [Baseline](Visuals/V153_B04_MASTER_HOTFIX/c-before-canvas.json) · [Canvas](Visuals/V153_B04_MASTER_HOTFIX/c-after-canvas.json) · [WebGL](Visuals/V153_B04_MASTER_HOTFIX/c-after-webgl.json)

## B1 — PARTIAL

SHA triển khai `e4de67eee638b56308ed103ce92201c9c1dfef3f`. Chromium Canvas ở zoom 2.2× kiểm từng frame Idle, Walk và Run ở cả bốn hướng, Armed và Unarmed. Idle cao 28–32 px theo alpha; cả 48 frame Walk cao 30–32 px, dùng ô 64×64 không trim và scale 1. Chưa tái hiện frame phóng lớn trong Walk độc lập. Run có hình vẽ cao 34–50 px ngay tại scale 1, với độ chênh lớn nhất ở nửa đầu Unarmed Run.

`BlackKnightPlayer.ts` giảm scale hiển thị hai Run live theo kích thước nguồn, giữ nguyên PNG/JSON, pivot và chu kỳ 840 ms. Run còn 27,2–35,1 px theo alpha; Idle và Walk giữ mức gốc. Bù hệ số trò chơi về nguồn Arcade để AABB thế giới vẫn `[-9,-18,18,12]`. Đồng bộ bóng tại post-update sau khi Arcade cập nhật vị trí. Độ trễ bóng đo khi chạy/rẽ trước sửa đến 7 px, sau sửa 0 ở các mẫu.

Build PASS. Tám tổ hợp thực hiện Idle → Walk → Run → Idle đủ mọi frame. Kiểm tra thêm đổi hướng khi giữ Shift, nhả Shift về Walk và đứng yên. WebGL New Game/Restart smoke PASS sau thay đổi listener bóng. Cần bằng chứng từ máy Owner cho hiện tượng phóng lớn trong Walk nếu tiếp tục xảy ra. [So sánh Canvas 2.2×](Visuals/V153_B04_MASTER_HOTFIX/b1-runtime-compare.png) · [Frame, pivot, tỷ lệ và AABB](Visuals/V153_B04_MASTER_HOTFIX/b1-frame-compare.json)

## B2 — PARTIAL · EVKey Windows cần Owner xác nhận

SHA triển khai `6851702a9f8f6fa80a14eb6c7e81381078dc1b13`. Chromium Linux tái hiện logic cũ giải phóng W khi nhận keyup gói IME có `code=KeyW`. Keydown gói IME cũng đưa hold đã xác nhận vào watchdog ngắn. Khi focus một ô nhập, Phaser vẫn giữ global DOM capture dù các keyboard plugin của Scene bị tắt.

`BlackKnightPlayer.ts` giữ ưu tiên `event.code`, phân loại packet 229/231 và lưu deadline theo từng phím. Packet keyup không giải phóng một hold đã nhận. Keyup chuẩn giải phóng ngay, kể cả có cờ composition với code và mã phím chuẩn. Shift lấy từ modifier xác nhận. Khi trình duyệt không nhận thêm tín hiệu, hold đã xác nhận có giới hạn 2 giây và hold chỉ có packet có giới hạn 450 ms. Blur và nhập văn bản xóa trạng thái gameplay. Global capture nhường cho ô nhập và được khôi phục khi quay lại game.

Build PASS và bộ focus/HUD 28/28 PASS. Chromium kiểm W không repeat, Shift+W qua packet giả lập, nhả Shift về Walk, nhả W/D thật, đường chéo, đổi hướng, mũi tên, hết hạn khi mất sự kiện, blur/focus, nhập `wsad` và lấy lại điều khiển. Không có môi trường Windows với EVKey trong ca này. Hành vi khi sự kiện bị chặn trước khi tới trình duyệt vẫn cần xác nhận trên máy Owner. [Bản ghi trước](Visuals/V153_B04_MASTER_HOTFIX/b2-before.json) · [Bản ghi sau](Visuals/V153_B04_MASTER_HOTFIX/b2-after.json)

## Checkpoint bàn giao

| Nhóm | Checkpoint đã xác minh trên GitHub |
|---|---|
| A1 | `d4695755682922e28256c1f3dabea0dfb7c3c216` |
| A2 | `adcd504503a348367f396f0e69749f95539fc7e3` |
| C | `8ef1c42cfa57335f6879c28f10ea40dded9681f7` |
| B1 | `640856dd8c25a0d892de0321c4776879d3b88852` |
| B2 | Commit bàn giao chứa báo cáo này, với SHA triển khai ghi ở mục B2. |

Dừng sau lượt 1. Nền đất và cảnh quan thuộc lượt 2.
