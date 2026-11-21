# V153-BATCH-04C-K3 — Ma trận hoạt ảnh Black Knight

**21/11/2026 · 26 nhóm hoạt ảnh × 4 hướng · 6 K1/K2 · 4 K3-A · 8 K3-B · 8 K3-C**

**Full Conversion · 34 chuỗi nguồn / 324 frame đã đối chiếu.** Bảng phía dưới lưu phạm vi nghiệm thu K1–K3. Bảng 34 dòng mới ghi riêng frame và nhịp nguồn, texture/atlas, clip live và bản asset-only. Alias `wayfarer_*` và `satyr_*` của actor trỏ về artwork custom. Giữ bảng K1–K3 để đối chiếu phạm vi cũ. [Ma trận source parity và frame trace](V153_BLACK_KNIGHT_SOURCE_PARITY_REPORT.md)

`4D` = PASS LOCAL — 4-DIR VERIFIED. Các chiều trạng thái được ghi theo thứ tự: Artwork validated / Runtime tested / Gameplay tested / Mirrored / Temporary fallback / Blocked / Not tested. Với các ô `4D`, giá trị là Có/Có/Có/Không/Không/Không/Không trong phạm vi từng nhóm đã nghiệm thu. Với `4D-AO`, artwork và runtime đạt PASS LOCAL — 4-DIR VERIFIED. Gameplay ghi ASSET/ANIMATION ONLY; các chiều Mirrored, Temporary fallback, Blocked và Not tested của phần artwork/runtime đều Không. Với các ô `Thiếu`, `Nguồn`, `Pha nguồn` hoặc `Ứng viên`, giá trị là Không/Không/Không/Không/Không/Không/Có đối với bản tích hợp K3. Mục Có ở phần nguồn ghi đúng clip tham chiếu đang có.

| Animation | DOWN | UP | LEFT | RIGHT | Đối chiếu Source Library |
|---|---|---|---|---|---|
| Armed Idle | 6 4D · K1 | 6 4D · K1 | 6 4D · K1 R2 | 6 4D · K2 custom | 03 Fellor và toàn bộ atlas K1 giữ nguyên. RIGHT chuyển visual ở K2 sau tái hiện P0. |
| Armed Walk | 6 4D · custom | 6 4D · custom | 6 4D · custom | 6 4D · custom | Artwork Walk riêng ở atlas K2 |
| Armed Run | 6 4D · custom | 6 4D · custom | 6 4D · custom | 6 4D · custom | 15 Armed Run Fellor giữ 12 nguồn RIGHT, runtime dùng profile custom đồng nhất. |
| Unarmed Idle | 6 4D · custom | 6 4D · custom | 6 4D · custom | 6 4D · custom | 04 Unarmed Idle Fellor giữ 6 nguồn RIGHT. |
| Unarmed Walk | 6 4D · custom | 6 4D · custom | 6 4D · custom | 6 4D · custom | Artwork Walk riêng, vỏ kiếm tối ở phía lưng. |
| Unarmed Run | 6 4D · custom | 6 4D · custom | 6 4D · custom | 6 4D · custom | 14 Unarmed Run Fellor giữ 12 nguồn RIGHT. |
| Light Attack | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 08–11 Fellor tham chiếu. Prefix `attack`, 75 ms, impact 2. |
| Heavy Attack | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 05–07 Fellor tham chiếu. Prefix `heavy_attack`, 100 ms, impact 3. |
| Attack Combo | 6 4D | 6 4D | 6 4D | 6 4D | Custom. Prefix `attack_combo`, 75 ms, impact 2. |
| Attack Recovery | 2 4D mỗi đòn | 2 4D mỗi đòn | 2 4D mỗi đòn | 2 4D mỗi đòn | Frame 4–5 ở mỗi đòn trên rồi về Armed Idle. |
| Thrust | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo pha 11 Attack 4. `thrust`, 70 ms, 80×64, pivot (40,56). |
| Ground Slam | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo 05 và 10. `ground_slam`, 100 ms, 112×72, pivot (56,60). |
| Flame Stream | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo pha 11 Attack 4. `flame_stream`, 100 ms, 112×80, pivot (56,68). |
| Fire Wave | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo 07 và 11. `fire_wave`, 95 ms, 112×80, pivot (56,68). |
| Aerial Somersault | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo pha trong 26. `aerial_somersault`, 100 ms, 96×80, pivot (48,70). |
| Weapon Art | 6 4D | 6 4D | 6 4D | 6 4D | Custom theo nguồn 26. `weapon_art`, 83⅓ ms, 112×72, pivot (56,62). [R] hit ở frame 0. |
| Parry | 6 + 6 4D | 6 + 6 4D | 6 + 6 4D | 6 + 6 4D | Custom, 27–29 tham chiếu. `parry` 75 ms; `parry_success` 65 ms. 28 Fire Nova thuộc thành công. |
| Armed Roll | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 12 tham chiếu. `roll` 57 ms. |
| Unarmed Roll | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 13 tham chiếu. `unarmed_roll` 57 ms. |
| Weapon On | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 01 tham chiếu. `weapon_on` 65 ms. |
| Weapon Off | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 02 tham chiếu. `weapon_off` 65 ms. |
| Armed Buff | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo nguồn 34. `armed_buff`, 140 ms, 64×64, pivot (32,64). |
| Unarmed Buff | 6 4D-AO | 6 4D-AO | 6 4D-AO | 6 4D-AO | Custom theo nguồn 33. `unarmed_buff`, 140 ms, 64×64, pivot (32,64). Tay trống. |
| Armed Hurt | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 31 tham chiếu. `hurt` 62,5 ms. |
| Unarmed Hurt | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 30 tham chiếu. `unarmed_hurt` 62,5 ms. |
| Death | 6 4D | 6 4D | 6 4D | 6 4D | Custom, 32 tham chiếu. `death` 125 ms. Clip chung, kết thúc ở tàn lửa. |

10 clip Jump, Mid Air, Fall Light, Fall Heavy và Land của Armed và Unarmed nằm ở mục 16–25, trạng thái ARCHIVED. Cả 34 metadata và 324 PNG nguồn được bảo toàn. Thư mục nguồn cục bộ `Pixel_Art/Black Knight/Source_Library/`. [Frame Map](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md) · [Coverage legacy](V153_F0_0_ANIMATION_COVERAGE_MATRIX.md).

Armed Idle dùng khung RGBA 144×64, neo (72, 63), 6 frame/hướng, 70 ms/frame và loop 420 ms. 12 frame UP/DOWN dùng ImageGen bổ sung theo Fellor. LEFT R1 giữ ở trạng thái ứng viên. LEFT R2 tiến gần tỷ lệ của RIGHT và thể hiện tay gần để trống, song phép trích thử còn 1–3 pixel nhiễm màu nền cyan trong bốn frame và giáp sáng hơn khi đổi hướng. Ảnh so sánh R2 giữ làm bằng chứng QA. Đây là tình trạng lịch sử trước K1. Metadata đầu vào cục bộ tại `Pixel_Art/Black Knight/Custom_4Dir/Animation_Frames/armed-idle/metadata.json`. Worktree thiết kế cục bộ giữ `Visuals/V153_BATCH_03/armed-idle-native.gif` và `armed-idle-left-r2-review.png`.

Bản thử R2 có SHA-256 `9053abcc4536c7128e46d7b80820d736f36ce776df96323f2a686837f33ee8ae`. K1 chọn lại 6 frame LEFT R2, xử lý viền và palette. Atlas đã nạp đủ 24 frame và chạy 4/4 hướng. Cột RIGHT giữ pixel nguồn. K2 giữ PNG/JSON và 18 frame game của K1 ở D/U/L. Sáu frame Armed Idle RIGHT thay thế nằm trong atlas K2 sau khi P0 được tái hiện cùng các clip Walk/Run. [Báo cáo K1](V153_B04_K1_RUNTIME_REPORT.md) · [Bốn hướng trong game](Visuals/V153_B04C_K1/armed-idle-runtime-details.png).


K2 dùng atlas RGBA 896×576 và 126 frame đã xác minh. Kích thước mỗi frame 64×64, origin (0.5, 1.0), mốc chân y=63, body 18×12 offset (23,46). Idle 70 ms/frame, Walk 170 ms/frame, Run 140 ms/frame. Bốn hướng của cả năm nhóm K2 đều có sáu frame. Tại K2, artwork rút/tra riêng còn OPEN và đã khép tại K3-B. [Báo cáo K2](V153_B04_K2_MOVEMENT_REPORT.md) · [Atlas và nguồn từng clip](../../../public/assets/characters/black_knight/black_knight_movement.json) · [Runtime](Visuals/V153_B04C_K2)


K3-A dùng atlas `black_knight_core_combat`, frame 64×64, origin (0.5,1), neo chân y=63, body Arcade 18×12 offset (23,46). Registry `wayfarer_<prefix>_<hướng>` và `satyr_<prefix>_<hướng>` dùng cùng frame `<prefix>_<hướng>_<i>`. Timing, từng bounds, nguồn, hash, test và ảnh trước/sau trong báo cáo. [K3](V153_B04_K3_COMBAT_REPORT.md) · [Atlas và metadata](../../../public/assets/characters/black_knight/black_knight_core_combat.json)

K3-B dùng atlas `black_knight_defense`, 36 clip × 6 frame, bốn hướng. Kích thước, origin và offset cùng K3-A. Đòn hiển thị bằng actor hiện có. Hai clip Parry dùng chung nhóm nghiệm thu. [Ảnh/log](Visuals/V153_B04C_K3) · [Metadata atlas](../../../public/assets/characters/black_knight/black_knight_defense.json)

K3-C có 32 clip/192 frame trên atlas `black_knight_extended_skills`. Cả hai renderer kiểm đúng texture, frame render và AABB tương đối `[-9,-18,18,12]`. Kỹ năng gameplay đã bật của K3-C là Weapon Art. [Atlas](../../../public/assets/characters/black_knight/black_knight_extended_skills.json) · [Báo cáo](V153_B04_K3_COMBAT_REPORT.md)
