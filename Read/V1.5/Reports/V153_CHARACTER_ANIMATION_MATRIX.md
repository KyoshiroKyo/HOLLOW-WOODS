# V153-BATCH-03-R2 — Ma trận hoạt ảnh Black Knight

**20/11/2026 · CLOUD-01C PARTIAL · CLOUD-01D → 01W BLOCKED tại gate Armed Idle**

`6 QA` là sáu frame bổ sung đã qua kiểm tra kỹ thuật và hướng nhìn. `Ứng viên` là artwork chờ duyệt. `Nguồn` ghi clip thực sự có trong Source Library. Các clip nguồn là profile RIGHT. `Pha nguồn` dùng ô tương ứng trong clip gốc. Các ô `Thiếu` chưa có clip bốn hướng phù hợp. Toàn bộ cột mô tả artwork chuẩn bị cho V1.5.3. Registry gameplay hiện hành vẫn phát atlas legacy.

| Animation | DOWN | UP | LEFT | RIGHT | Đối chiếu Source Library |
|---|---|---|---|---|---|
| Armed Idle | 6 QA | 6 QA | 6 ứng viên | 6 nguồn | 03 Armed Idle |
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

10 clip Jump, Mid Air, Fall Light, Fall Heavy và Land của Armed và Unarmed nằm ở mục 16–25, trạng thái ARCHIVED. Cả 34 metadata và 324 PNG nguồn được bảo toàn. [Source Library](<../../../Pixel_Art/Black Knight/Source_Library/>) · [Frame Map](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Coverage legacy](V153_F0_0_ANIMATION_COVERAGE_MATRIX.md).

Armed Idle dùng khung RGBA 144×64, neo (72, 63), 6 frame/hướng, 70 ms/frame và loop 420 ms. 12 frame UP/DOWN dùng ImageGen bổ sung theo Fellor. LEFT R1 giữ ở trạng thái ứng viên. LEFT R2 tiến gần tỷ lệ của RIGHT và thể hiện tay gần để trống, song phép trích thử còn 1–3 pixel nhiễm màu nền cyan trong bốn frame và giáp sáng hơn khi đổi hướng. Ảnh so sánh R2 giữ làm bằng chứng QA. Các frame ứng viên chưa được đóng atlas hoặc nạp trong loader. [Metadata và provenance](<../../../Pixel_Art/Black Knight/Custom_4Dir/Animation_Frames/armed-idle/metadata.json>) · [Preview gốc 1×](Visuals/V153_BATCH_03/armed-idle-native.gif) · [So sánh LEFT R2](Visuals/V153_BATCH_03/armed-idle-left-r2-review.png).

Bản thử R2 có SHA-256 `9053abcc4536c7128e46d7b80820d736f36ce776df96323f2a686837f33ee8ae`. Gate tiếp theo là dải LEFT giữ đường nét mũ trụ, màu giáp và điểm đặt chân khi đổi hướng từ RIGHT, với tay gần để trống và alpha sạch. Sau đó tiếp tục Armed Walk và các nhóm còn lại theo thứ tự phase. CLOUD-01Y và CLOUD-01Z chờ coverage bốn hướng.
