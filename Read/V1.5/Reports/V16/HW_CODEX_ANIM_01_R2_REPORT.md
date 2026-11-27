# HW-CODEX-ANIM-01-R2

**NOT REPRODUCED** với sai clip trong kịch bản đã đo · Source baseline `1f74f49eef8c75938af60f09985ab78f5041531d`.

| Build | Tổ hợp Idle/Walk/Run, 4 hướng, 2 tư thế | Walk/Run px/s cực đại | Frame Walk/Run sai so với trạng thái sprint |
| --- | ---: | --- | ---: |
| Production 1× | 24/24 | 85 / 140 | 0 |
| Private QA 2× | 24/24 | 170 / 280 | 0 |
| Private QA 3× | 24/24 | 255 / 420 | 0 |

Trace WebGL ghi clip/frame, velocity, stamina, pivot, texture, scale, collider và camera. Có nhả Shift, đổi hướng, giữ phím và blur; tư thế kiếm thử bằng X trong fixture, sau đó bật lại auto-weapon. Collider locomotion 18×12 và camera 2.2 ở cả ba lượt. Walk dùng 1.50, Armed Run 1.14, Unarmed Run 0.99/1.11 theo điều chỉnh BUG-058. Những tỷ lệ theo clip đã có trong source. Báo cáo ANIM-01 trước đó chứa phép đo vùng alpha, xác nhận khác silhouette theo pose. Giữ thay đổi artwork ở cổng BUG-059.

Không có patch runtime, vì vậy chỉ xuất video đối chiếu production hiện tại, cùng trace riêng 2×/3× tại `scratch/hw-codex-anim-01-r2/`. Tái hiện riêng hit/knockback, IME vật lý và exhaustion có kiểm soát: NOT RUN. Fixture không diễn tập chuyến đi tự nhiên qua mọi zone. Production build và TypeScript thừa hưởng từ commit cùng source; build QA PASS. Đã đóng Chromium/Vite của từng lượt.
