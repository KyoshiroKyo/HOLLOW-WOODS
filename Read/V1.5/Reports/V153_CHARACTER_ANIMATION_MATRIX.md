# V153-BATCH-04C-K1 — Ma trận hoạt ảnh Black Knight

**20/11/2026 · Armed Idle RUNTIME_TESTED · 1/26 nhóm bốn hướng · Các nhóm còn thiếu giữ ở K2/K3**

`6 QA` là sáu frame bổ sung đã qua kiểm tra kỹ thuật và hướng nhìn. `Ứng viên` là artwork chờ duyệt. `Nguồn` ghi clip thực sự có trong Source Library. Các clip nguồn là profile RIGHT. `Pha nguồn` dùng ô tương ứng trong clip gốc. Các ô `Thiếu` chưa có clip bốn hướng phù hợp. `6 runtime` nghĩa là sáu frame đã đóng atlas, nạp và quan sát trong Chromium. Các hàng khác ghi coverage artwork nguồn và tiếp tục dùng registry legacy ở runtime nếu có.

| Animation | DOWN | UP | LEFT | RIGHT | Đối chiếu Source Library |
|---|---|---|---|---|---|
| Armed Idle | 6 runtime · custom | 6 runtime · custom | 6 runtime · R2 chỉnh màu | 6 runtime · Fellor | 03 Armed Idle · 24/24 trong atlas |
| Armed Walk | Thiếu | Thiếu | Thiếu | Thiếu | Cần artwork Walk riêng |
| Armed Run | Thiếu | Thiếu | Thiếu | 12 nguồn | 15 Armed Run |
| Unarmed Idle | Thiếu | Thiếu | Thiếu | 6 nguồn | 04 Unarmed Idle |
| Unarmed Walk | Thiếu | Thiếu | Thiếu | Thiếu | Cần artwork Walk riêng |
| Unarmed Run | Thiếu | Thiếu | Thiếu | 12 nguồn | 14 Unarmed Run |
| Light Attack | Thiếu | Thiếu | Thiếu | 40 nguồn | 08–11 Attack 1–4 |
| Heavy Attack | Thiếu | Thiếu | Thiếu | 40 nguồn | 05–07 Heavy Attack 1–3 |
| Attack Combo | Thiếu | Thiếu | Thiếu | Pha nguồn | 05–11, theo ranh từng đòn |
| Attack Recovery | Thiếu | Thiếu | Thiếu | Pha nguồn | Cuối các đòn 05–11 và 26 |
| Thrust | Thiếu | Thiếu | Thiếu | Pha nguồn | 11 Attack 4 |
| Ground Slam | Thiếu | Thiếu | Thiếu | Ứng viên nguồn | 10 Attack 3 và 05 Heavy Attack 1 |
| Flame Stream | Thiếu | Thiếu | Thiếu | Pha nguồn | 11 Attack 4 |
| Fire Wave | Thiếu | Thiếu | Thiếu | Ứng viên nguồn | 07 Heavy Attack 3, đối chiếu 10–11 |
| Aerial Somersault | Thiếu | Thiếu | Thiếu | Pha nguồn | 26 Weapon Art |
| Weapon Art | Thiếu | Thiếu | Thiếu | 35 nguồn | 26 Weapon Art |
| Parry | Thiếu | Thiếu | Thiếu | 6 + 15 + 3 nguồn | 27–29. Fire Nova là pha VFX trong 28 Parry |
| Armed Roll | Thiếu | Thiếu | Thiếu | 12 nguồn | 12 Armed Roll |
| Unarmed Roll | Thiếu | Thiếu | Thiếu | 12 nguồn | 13 Unarmed Roll |
| Weapon On | Thiếu | Thiếu | Thiếu | 18 nguồn | 01 Weapon On |
| Weapon Off | Thiếu | Thiếu | Thiếu | 14 nguồn | 02 Weapon Off |
| Armed Buff | Thiếu | Thiếu | Thiếu | 12 nguồn | 34 Armed Buff |
| Unarmed Buff | Thiếu | Thiếu | Thiếu | 12 nguồn | 33 Unarmed Buff |
| Armed Hurt | Thiếu | Thiếu | Thiếu | 5 nguồn | 31 Armed Hurt |
| Unarmed Hurt | Thiếu | Thiếu | Thiếu | 5 nguồn | 30 Unarmed Hurt |
| Death | Thiếu | Thiếu | Thiếu | 9 nguồn | 32 Death, nguồn có một clip chung |

10 clip Jump, Mid Air, Fall Light, Fall Heavy và Land của Armed và Unarmed nằm ở mục 16–25, trạng thái ARCHIVED. Cả 34 metadata và 324 PNG nguồn được bảo toàn. Thư mục nguồn cục bộ `Pixel_Art/Black Knight/Source_Library/`. [Frame Map](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Coverage legacy](V153_F0_0_ANIMATION_COVERAGE_MATRIX.md).

Armed Idle dùng khung RGBA 144×64, neo (72, 63), 6 frame/hướng, 70 ms/frame và loop 420 ms. 12 frame UP/DOWN dùng ImageGen bổ sung theo Fellor. LEFT R1 giữ ở trạng thái ứng viên. LEFT R2 tiến gần tỷ lệ của RIGHT và thể hiện tay gần để trống, song phép trích thử còn 1–3 pixel nhiễm màu nền cyan trong bốn frame và giáp sáng hơn khi đổi hướng. Ảnh so sánh R2 giữ làm bằng chứng QA. Đây là tình trạng lịch sử trước K1. Metadata đầu vào cục bộ tại `Pixel_Art/Black Knight/Custom_4Dir/Animation_Frames/armed-idle/metadata.json`. Worktree thiết kế cục bộ giữ `Visuals/V153_BATCH_03/armed-idle-native.gif` và `armed-idle-left-r2-review.png`.

Bản thử R2 có SHA-256 `9053abcc4536c7128e46d7b80820d736f36ce776df96323f2a686837f33ee8ae`. K1 chọn lại 6 frame LEFT R2, xử lý viền và palette. Atlas đã nạp đủ 24 frame và chạy 4/4 hướng. Cột RIGHT giữ pixel nguồn. K2/K3 hoàn thiện các nhóm khác theo lộ trình mà không đóng gói lại nhóm Idle đã đạt. [Báo cáo K1](V153_B04_K1_RUNTIME_REPORT.md) · [Bốn hướng trong game](Visuals/V153_B04C_K1/armed-idle-runtime-details.png).
