# HW-CODEX-WORLD-01 — Interaction & Collision Integrity

Baseline Codex `253cc36844f2c36bdb96a158455a9f18be3b8781`. Bàn giao để Owner nghiệm thu.

## Nguyên nhân và bản sửa

`WorldBuilder` dựng một số sprite bằng tọa độ riêng, còn `GameScene` lấy điểm tương tác từ `zones.json`. Bàn thao tác xưởng hiển thị tại (1340, 1217), nhưng điểm tương tác cũ ở (1300, 1180). Cả bàn và đá có hình mà thiếu body Arcade, vì hàm dựng biên chỉ tạo các collider biên và hazard. Bản sửa dùng cùng điểm neo cho sprite, tương tác và depth của các vật thể đã rà soát. Collider được tạo theo vùng tiếp đất, còn bán kính riêng điều khiển cả hành động [E] và vòng gợi ý.

- Fog Crossing · Neo điểm đọc tại chân biển (240, 180), sửa mũi tên trong trang đọc về phía đông và bổ sung collider chân cho một số vật cản.
- Bellhollow · Căn bảng tin theo chân cọc (664, 266), căn collider bàn chế tạo, thêm nội dung biển Cổng Tây và dựng sprite biển Rừng Ngoại Vi tại (1200, 510).
- Xưởng Chuông Bỏ Hoang · Gắn body 60 × 12 cho bàn và 18 × 8 cho đá. Bổ sung vật thể nhận diện ở điểm tương tác khuôn, nhật ký và văn bia. Khi giữ phím đi thẳng, nhân vật dừng tại Y = 1235 trước bàn và Y = 1251 trước đá. Đi vòng qua đá vẫn được.
- Sanctuary Farm, Outer Woods, Crooked Path và Silent Mire · Căn lại những biển, bàn sơ chế và đá canh gác có cùng lỗi nguồn tọa độ. Các đá dùng chung hàm tạo collider theo phần tiếp đất của frame atlas.

## Phạm vi Git

1. `src/data/tornPagesData.ts` — nội dung và hướng chỉ dẫn.
2. `src/data/zones.json` — điểm neo và bán kính tương tác ở các vị trí đã kiểm tra.
3. `src/scenes/GameScene.ts` — bán kính, prompt và điều kiện khởi tạo F4.
4. `src/types/index.ts` — kiểu dữ liệu bán kính và giá trị mặc định.
5. `src/utils/DebugOverlay.ts` — tái sử dụng F4 để hiển thị tọa độ, zone, object ID, collider và anchor.
6. `src/world/WorldBuilder.ts` — dựng sprite, collider và depth từ điểm neo của vật thể.
7. `tests/hw_codex_world_01_runtime.mjs` — kiểm tra bằng phím [E], WASD và F4/F9. Fixture ngoài tầm đọc Fog đứng ở chỗ trống để vật lý không đẩy nhân vật vào bán kính.

## Kiểm chứng

- `npx tsc --noEmit` và `npm run build` đạt. Vite còn các cảnh báo sẵn có về `startup-status.js` và hai đường dẫn font.
- Lượt điều tra trước đã đạt 15/15 kiểm tra dữ liệu, 24/24 kiểm tra biển và trang đọc. Kiểm tra spawn, trigger và điểm dự phòng dữ liệu bao phủ 17 vùng.
- Chrome headless với WebGL phần cứng. Build QA riêng đã hiển thị và tắt được F4 mà không bật F9. Trong build production với URL `?dev=1`, nhấn F4/F9 không khởi tạo overlay, Hitbox Inspector hoặc Dev Panel. Bài thử chạy localhost với profile mới và chặn SDK P2Game.
- Ảnh baseline và sau sửa được lưu tại `scratch/hw-codex-world-01/before/` và `scratch/hw-codex-world-01/after/`. Ảnh overlay tại `scratch/hw-codex-world-01/qa/07_QA_OVERLAY.png`. Ảnh dùng cho review cục bộ.
- Lượt bàn giao đạt 24/24 kiểm tra browser trên build production, gồm nhấn [E] ngoài tầm biển Fog, đi qua hai cổng, chặn bàn và đá, và khóa F4/F9.
