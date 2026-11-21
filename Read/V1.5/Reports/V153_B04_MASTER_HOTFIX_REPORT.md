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
