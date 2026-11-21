# V153-BATCH-04C-K3 — Chiến đấu và trạng thái của Black Knight

**21/11/2026 · K3 PARTIAL · K3-A 4/4 và K3-B 8/8 nhóm đã kiểm thử bốn hướng**

Nhánh `feat/v1.5.3-batch04`, mốc vào `e91809963955c60778cc763427c56d052528df4a`. Mốc vào khớp GitHub và worktree triển khai sạch. Bốn nhóm K3-A dùng ba clip mỗi hướng, gồm pha hồi phục nằm trong từng clip. Hồ sơ kiểm thử dùng Chromium cục bộ và profile riêng với SDK mô phỏng. Hosted P2Game vẫn BLOCKED.

## A. Task ledger

| Mã | Trước | Sau checkpoint B | Kết quả |
|---|---|---|---|
| K3-A · 01 Light Attack | OPEN · sheet legacy | PASS LOCAL — 4-DIR VERIFIED | 6 frame/hướng × 75 ms. Va chạm ở frame 2, khóa đến hết frame 5. |
| K3-A · 02 Heavy Attack | OPEN · sheet legacy | PASS LOCAL — 4-DIR VERIFIED | 6 frame/hướng × 100 ms. Va chạm ở frame 3 và vẫn có hai frame hồi phục. |
| K3-A · 03 Attack Combo | OPEN · chỉ có pha nguồn | PASS LOCAL — 4-DIR VERIFIED | Đòn nhẹ tiếp theo được chấp nhận ở cùng hướng trong 250 ms thời gian game sau đòn đầu dùng thế chém thấp riêng. Hai lần nhấn hợp lệ phát đúng hai lần hitbox. |
| K3-A · 04 Attack Recovery | OPEN · mở khóa theo timer cũ | PASS LOCAL — 4-DIR VERIFIED | Hai frame hồi phục 4–5 của mỗi đòn. Kết thúc clip trở về Armed Idle đúng hướng. Ngắt trước va chạm hủy hit và tháo listener. |
| K3-B · 05 Parry | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 27–29, Fire Nova là pha VFX thành công. |
| K3-B · 06 Armed Roll | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 12. |
| K3-B · 07 Unarmed Roll | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 13. |
| K3-B · 08 Weapon On | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 01. |
| K3-B · 09 Weapon Off | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 02. |
| K3-B · 10 Armed Hurt | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 31. |
| K3-B · 11 Unarmed Hurt | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 30. |
| K3-B · 12 Death | OPEN | PASS LOCAL — 4-DIR VERIFIED | Nguồn 32, clip chung. |
| K3-C · 13 Armed Buff | OPEN | NOT TESTED | Nguồn 34. |
| K3-C · 14 Unarmed Buff | OPEN | NOT TESTED | Nguồn 33. |
| K3-C · 15 Thrust | OPEN | NOT TESTED | Pha nguồn 11. |
| K3-C · 16 Ground Slam | OPEN | NOT TESTED | Đối chiếu 05 và 10. |
| K3-C · 17 Flame Stream | OPEN | NOT TESTED | Pha nguồn 11. |
| K3-C · 18 Fire Wave | OPEN | NOT TESTED | Đối chiếu 07, 10 và 11. |
| K3-C · 19 Aerial Somersault | OPEN | NOT TESTED | Pha nguồn 26. |
| K3-C · 20 Weapon Art | OPEN | NOT TESTED | Nguồn 26. |

Kế thừa sáu nhóm Idle, Walk và Run từ K1/K2. Ba hướng Armed Idle tiếp tục dùng atlas K1, RIGHT dùng đoạn đã nghiệm thu ở K2. Các tệp atlas K1/K2, portrait và Source Library giữ nguyên SHA qua diff. Bằng chứng mở khóa, đi vùng và Save/Continue ở phần dưới là hồi quy của bản chạy K3-A. [K1](V153_B04_K1_RUNTIME_REPORT.md) · [K2](V153_B04_K2_MOVEMENT_REPORT.md) · [Ma trận 26 nhóm](V153_CHARACTER_ANIMATION_MATRIX.md)

## B. Nguyên nhân và mapping

- Ở mốc vào, `attack()` và `heavyAttack()` phát `player_attack` khi nhân vật vẫn hiện frame Armed Idle. Sprite đòn đánh sau đó dùng sheet `wayfarer_attack` hoặc `wayfarer_heavy_attack`. Có timer riêng có thể cắt nhịp kết thúc. Danh sách spawn và cây hiển thị Chromium cho thấy cùng một actor.
- Atlas `black_knight_core_combat` đăng ký cho cả `wayfarer_<tên>_<hướng>` và `satyr_<tên>_<hướng>`. Ở chế độ artist, bộ phát chỉ chọn atlas này cho ba đòn. Nếu thiếu clip, nó giữ idle artist cùng hướng và xử lý đòn qua thời gian cảnh. Khóa sát thương phát đúng một lần khi frame chạm bắt đầu. Watchdog cảnh đặt lại khi clip tiến frame và gỡ toàn bộ listener/timer khi bị ngắt.
- Hai frame hồi phục dùng cùng clip với đòn. Cửa sổ combo chỉ chọn cách thể hiện của lần nhấn đã vượt kiểm tra khóa, cooldown và thể lực. Light vẫn 8 thể lực, cooldown tối đa 350 ms. Heavy vẫn 20 thể lực, cooldown 1.200 ms, cộng 12 px reach, 8 px radius, poise 50 và hệ số 2,2 ở các xử lý đã dùng hệ số đó.
- Cả 72 frame có kích thước 64×64. Pivot `(0.5,1)`, chân atlas neo quanh y=63, scale `(1,1)`, AABB Arcade `18×12`, offset `(23,46)`, hình chữ nhật cục bộ `[-9,-18,18,12]`, rotation 0. Hitbox đòn giữ bán kính và tâm dịch theo trục hướng của GameScene. Theo fixture gậy mặc định, Light đến 42 px bán kính 42, Heavy đến 54 px bán kính 50.

| Nhóm | Prefix frame | DOWN / UP / LEFT / RIGHT | Timing | Active / Recovery |
|---|---|---|---|---|
| Light | `attack` | mỗi hướng `0…5` | 75 ms/frame, 450 ms danh định | 2 / 4–5 |
| Heavy | `heavy_attack` | mỗi hướng `0…5` | 100 ms/frame, 600 ms danh định | 3 / 4–5 |
| Combo | `attack_combo` | mỗi hướng `0…5` | 75 ms/frame, 450 ms danh định | 2 / 4–5 |
| Recovery | ba prefix trên | mỗi clip có hai frame cuối | 150 hoặc 200 ms danh định | 4–5, rồi về Idle |

## C. Artwork, giấy phép và file thay đổi

Ba sheet custom ImageGen tham chiếu Fellor 05–11 về chuyển động và K1/K2 về mẫu giáp. Mỗi hướng là artwork riêng. Script chỉ bỏ nền cyan và căn theo cùng tỷ lệ/hướng, rồi đóng gói các pixel vào atlas. Phiên bản trong game giữ chùm lông đỏ, giáp nhiều lớp, áo choàng rách và kiếm cong. Các file gốc của Fellor / BitBlast Studio vẫn ở kho nguồn. Giấy phép cho phép dùng và sửa trong game, hạn chế phân phối asset rời. [Giấy phép](<../../../Pixel_Art/Black Knight/License.txt>)

| Tệp | SHA-256 / mục đích |
|---|---|
| `public/assets/characters/black_knight/black_knight_core_combat.png` | `5126a4a490f84f1b31437fe110dfdeecebd184e07a4075b7531c9f4596c633fd` · 768×384 RGBA, 72 frame, 110 KB |
| `public/assets/characters/black_knight/black_knight_core_combat.json` | `24a80fdece9b739b69a43aa21d5d10077f342617b7c024211e4eae84819e352d` · chỉ số frame, pivot, pha, tọa độ nguồn và SHA mỗi sheet |
| `src/entities/BlackKnightPlayer.ts` | Timing va chạm và audio swing, alternate light, hồi phục, hủy và watchdog. |
| `src/animation/BlackKnightAnimations.ts`, `src/scenes/PreloadScene.ts`, `src/config/Constants.ts` | Load atlas và đăng ký canonical/alias. |
| `scripts/qa_v153_black_knight_combat.py` | QA nguồn → atlas → key registry, alpha, cyan, kích thước, bounds, SHA và contact sheet. |
| Báo cáo này, ma trận, registry, checkpoint, `Read/V1.5/README_INDEX.md` | Trạng thái và bàn giao. |
| `Read/V1.5/Reports/Visuals/V153_B04C_K3/` | Ảnh so sánh trong game, contact sheet, frame trace và log. |

Chạy lại QA atlas bằng `python scripts/qa_v153_black_knight_combat.py --evidence /tmp/v153-k3-qa` (Pillow và NumPy). Kiểm tra khớp từng pixel với sheet nguồn bằng cách thêm `--source <thư-mục-sheet>`. [Contact sheet](Visuals/V153_B04C_K3/core-combat-contact.png) · [Coverage và hash theo frame](Visuals/V153_B04C_K3/core-combat-asset-qa.json)

## D. Bằng chứng runtime

Ảnh trước/sau lấy trực tiếp từ Canvas ở cùng cỡ viewport, khu Fog Crossing và camera zoom 2,2. Hàng baseline lấy ở frame đang đánh của sheet cũ. Hàng K3-A lấy từ lần draw phát va chạm. Trace giữ timestamp, renderer, frame, texture, điểm va chạm, AABB, scale và actor. [So sánh bốn hướng](Visuals/V153_B04C_K3/core-combat-runtime-before-after.png)

[Trace baseline Canvas](Visuals/V153_B04C_K3/before-canvas.json) · [Trace Canvas](Visuals/V153_B04C_K3/after-canvas.json) · [Trace WebGL SwiftShader](Visuals/V153_B04C_K3/after-webgl.json) · [F9, mục tiêu thật và teardown](Visuals/V153_B04C_K3/checks-canvas.json) · [Vòng đời và Save/Continue](Visuals/V153_B04C_K3/canvas-lifecycle.json)

## E. Kết quả kiểm thử K3-A

| Ca | Kết quả |
|---|---|
| TypeScript và build Vite production/QA | PASS. `npx tsc --noEmit` và `npm run build` cho cả hai cấu hình. |
| Script QA atlas | PASS tài nguyên. 12 clip / 72 frame, checksum khớp, 0 rỗng, alpha 0/255, 0 pixel cyan, bounds và phase khớp. |
| `verify_zero_404_assets.mjs` | 216/216 asset tồn tại. |
| Chromium 156 Canvas | 12/12 clip đủ 6 frame, một actor, đúng frame hit/recovery. 0 HTTP 404, 0 missing frame, 0 page error trong lượt combat. |
| Chromium 156 WebGL SwiftShader | 12/12 clip đủ 6 frame và recovery, cùng hitbox/origin. 0 HTTP 404, 0 missing frame, 0 page error trong lượt combat. Lượt đầu tái hiện watchdog cắt clip ở FPS thấp. Sửa watchdog theo tiến độ frame rồi chạy lại đủ. |
| Fallen Knight thật trong profile QA | Spawn qua F9 ở (310,245), actor chính tại (268,245), nhìn RIGHT. HP `1000 → 990 → 968` tại active frame Light/Heavy. Khí lực trước mỗi đòn vẫn qua cơ chế hiện hành. |
| Hủy đòn, listener, pause | Hurt trước active frame giữ nguyên số hit. Listener update/stop/complete về cùng bộ đếm `[3,1,1]`. Pause bằng Escape và nút Tiếp tục trả điều khiển. |
| K1/K2, chuyển vùng và Save | Hai chiều Fog Crossing ↔ Bellhollow, bốn hướng và rút/tra kiếm theo hành vi ở checkpoint, Shift và đi chéo. Manual Save/Continue khôi phục schema 3 tại (290,255). `test_v153_save_schema3.mjs` PASS cả hai ca, gồm tách khóa QA và chặn SDK. |
| Restart | PARTIAL về console. Restart trong lúc Heavy hủy actor và tác vụ cũ trước active frame, chỉ một actor mới. Lỗi Phaser Text `drawImage` nền Canvas vẫn OPEN ở 04E1. |
| V152-05 script cũ | 64 PASS / 2 FAIL ở cả baseline và K3-A. Thiếu preview trong thư mục backup cũ và assertion đòi cờ artist bằng `false`. Assertion giữ nguyên. |
| Hiệu năng | Đo 120 mẫu RAF trong hồ sơ QA. WebGL qua GPU ảo SwiftShader đã giảm quality tự động. Kết quả timing trong hồ sơ là theo frame thực, mục tiêu 60 FPS vẫn mở. |

Cơ chế âm thanh sử dụng tệp swing của game, phát theo frame va chạm. Kho audio riêng và nghiệm thu thiết bị tiếp tục ở 04D.

## F. Bàn giao checkpoint A

Runtime và QA asset commit `0a927c226587a3f82957b06183138ecf9f9a6fe2`. GitHub của nhánh phát triển xác định commit báo cáo và bằng chứng. [Runtime commit](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/0a927c226587a3f82957b06183138ecf9f9a6fe2) · [Nhánh phát triển](https://github.com/KyoshiroKyo/HOLLOW-WOODS/tree/feat/v1.5.3-batch04)

Checkpoint báo cáo A đã được push và xác minh trên GitHub tại `d65bf7b8956214602f624677636e60e59a015674` trước khi bắt đầu B. [Bàn giao A](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/d65bf7b8956214602f624677636e60e59a015674)

## G. K3-B — Kiểm tra nghi ngờ sprite legacy

| Phân loại | Ảnh trong lượt thực hiện | Cách đọc |
|---|---|---|
| `SOURCE_REFERENCE` | Bảng 4 hướng `identity.png`; các bảng `fellor-light.png`, `fellor-heavy.png`, `fellor-defense.png`, `fellor-weapon.png`, `fellor-damage.png`. | Bảng identity lấy mẫu tạo hình K1/K2. Các sheet Fellor có silhouette gốc nhìn ngang, dùng đối chiếu chuyển động từ kho nguồn. Đường dẫn làm việc thuộc `/workspace/work/v153-b04/k3/{a,b}`; nguồn Fellor ở `Pixel_Art/Black Knight/Source_Library/`. |
| `BASELINE_BEFORE` | Hàng Baseline trong ảnh so sánh K3-A và cột Before của K3-B. Trace tương ứng mang phase `before`. | Ảnh Chromium từ mốc trước thay đổi. Roll và Hurt baseline từng hiển thị sheet `wayfarer_roll`, `wayfarer_unarmed_roll`, `wayfarer_hurt`; rút/tra kiếm nhảy thẳng vào idle. |
| `CUSTOM_ART_CANDIDATE` | Các sheet ImageGen nền cyan trong quá trình chọn và duyệt, kể cả ảnh lưới chín sheet B. | Artwork đầu vào trước alpha/scale/atlas. SHA từng tấm được ghi trong `meta.sources` của JSON atlas. |
| `RUNTIME_ATLAS` | Contact sheet có nền tối `core-combat-contact.png`, `defense-contact.png`; hàng K3 trong ảnh so sánh; ảnh Chromium theo chuỗi. | Contact sheet đọc pixel từ PNG runtime. Ảnh Chromium lấy từ camera trong lúc chính actor dùng frame đã đăng ký. Trace texture/frame xác minh việc nạp và phát. |

Cả hai bộ K3 dùng giáp nhiều lớp và plume đỏ của K1/K2 trong các pose nguyên vẹn. Áo choàng khép theo Roll và vỡ thành hạt ở Death. Hurt có một pha flash ngắn theo mẫu Fellor. Unarmed Roll/Hurt để tay trống, chỉ giữ vỏ tối trên lưng. Weapon On/Off có một blade sáng ở pha rút hoặc tra, endpoint giữ đúng trạng thái. Không cần thay atlas K1/K2. [Contact sheet B](Visuals/V153_B04C_K3/defense-contact.png) · [QA B theo frame](Visuals/V153_B04C_K3/defense-asset-qa.json)

### Mapping và nguyên nhân theo mã

Bổ sung `black_knight_defense.png` (768×1.152 RGBA, 216 frame, 282 KiB) và metadata tương ứng. PNG SHA-256 `4e1f5fb8e294363860a31723097e551342c5b6009033ed05c0b3badaca0acaad`, JSON SHA-256 `d65e678b9c6e457197c6339db2f139efef4ac97b41022e2531b9420ab118f7e2`. Khung 64×64, scale (1,1), origin (0.5,1), AABB 18×12 offset (23,46) ở cả bốn hướng. Cả canonical `wayfarer_` và alias `satyr_` dùng cùng nguồn. Thay đổi B trong bốn file TypeScript và script QA như mục C, cộng atlas B và hồ sơ runtime.

| Mã | Trước checkpoint B | Mapping sau trên texture `black_knight_defense` | Thời gian và hành vi |
|---|---|---|---|
| 05 Parry | Guard legacy, phản đòn nhảy về Idle | `wayfarer_parry_<dir>` → `parry_<dir>_0…5`; `wayfarer_parry_success_<dir>` → `parry_success_<dir>_0…5` | 75 ms/frame, giữ cửa sổ đỡ 450 ms. Phản đòn thành công dùng clip riêng 65 ms/frame, vòng lửa ở frame 2. Xử lý `parry_success` giữ nguyên, phát một lần. |
| 06 Armed Roll | Legacy, input lăn nhưng vận tốc bị xóa | `wayfarer_roll_<dir>` → `roll_<dir>_0…5` | 57 ms/frame, tay giữ kiếm. 350 ms i-frame. |
| 07 Unarmed Roll | Legacy, cùng lỗi vận tốc | `wayfarer_unarmed_roll_<dir>` → `unarmed_roll_<dir>_0…5` | 57 ms/frame, tay trống. 350 ms i-frame. |
| 08 Weapon On | Đổi thẳng sang Armed Idle | `wayfarer_weapon_on_<dir>` → `weapon_on_<dir>_0…5` | 65 ms/frame, giữ khóa 400 ms. Ô kiểm thử X được cách ly khỏi đổi vũ khí tự động theo vùng. |
| 09 Weapon Off | Đổi thẳng sang Unarmed Idle | `wayfarer_weapon_off_<dir>` → `weapon_off_<dir>_0…5` | 65 ms/frame, giữ khóa 400 ms. Frame cuối tay trống. |
| 10 Armed Hurt | Cùng sheet cũ với Unarmed | `wayfarer_hurt_<dir>` → `hurt_<dir>_0…5` | 62,5 ms/frame. Phản ứng chấn động và giữ kiếm. |
| 11 Unarmed Hurt | Có thể hiện kiếm từ trạng thái Armed | `wayfarer_unarmed_hurt_<dir>` → `unarmed_hurt_<dir>_0…5` | 62,5 ms/frame. Tay trống cả sáu frame. |
| 12 Death | Chạy legacy | `wayfarer_death_<dir>` → `death_<dir>_0…5` | 125 ms/frame. Tan thành hạt và dừng ở tàn lửa. |

Vòng cập nhật cũ đặt vận tốc Roll thành 0 ngay trong lượt xử lý input. Trước sửa cả hai lượt RIGHT dịch chuyển 0 px. Sau sửa vận tốc 220 px/s được giữ đến khi Arcade Physics chặn hoặc cửa sổ lăn hết. Hàng rào Tây có mặt trên y=280. Ở Canvas, tại x=552, chân nhân vật đi từ y=262 đến y=286, cạnh dưới AABB dừng đúng y=280, có `touching.down` với Noclip OFF. Tách thời gian gameplay của các state B khỏi việc chờ đủ frame ở FPS thấp. Timer hành động được gỡ khi ngắt, tử vong, reset hoặc hủy actor. [Trace B trước sửa](Visuals/V153_B04C_K3/defense-before-canvas.json)

### Bằng chứng Chromium của checkpoint B

| Ca | Kết quả |
|---|---|
| Chromium 156 Canvas, sản xuất cục bộ | 36 clip / 216 frame quan sát được, 9 clip dạng hành động gồm hai nhánh Parry × 4 hướng. Một actor, 0 texture legacy trong các clip đang xét, 0 missing frame, 0 HTTP 404. |
| Chromium 156 WebGL SwiftShader | 36 clip / 216 frame, khóa và trạng thái cuối khớp. Một actor, 0 texture legacy, 0 missing frame, 0 HTTP 404. Ba lượt chẩn đoán trước chốt đã phân biệt timer cũ cắt clip, input trong i-frame bị test gọi muộn, và đổi vũ khí tự động sau clip hoàn chỉnh. |
| Vòng đời | Manual X cả hai chiều và bốn hướng dùng atlas B. Fog Crossing ↔ Bellhollow bằng phím với áo giáp đúng trạng thái. Save/Continue schema 3 về (290,255). Restart trong Roll hủy actor và timer cũ, chỉ còn một actor. Phaser Text `drawImage` vẫn OPEN 04E1. |
| Roll | Cả Armed/Unarmed dịch chuyển đúng trục 4 hướng; kiểm tra né đòn trong i-frame và cờ vulnerable trở lại khi hết i-frame. Cạnh dưới AABB của Unarmed Roll ở hàng rào dừng y=280 trên Canvas lẫn WebGL với Noclip OFF. |
| Parry và Death | Nhấn V guard, gửi hit đến nhánh game `playHurt` trong cửa sổ để quan sát đúng event phản đòn một lần. Death đứng ở frame hạt cuối, actor được dùng lại ở ca respawn. |
| Hồi quy | K3-A Canvas chạy lại 12/12 clip trên bản B. K1/K2 và atlas A giữ cùng SHA. TypeScript, build, 218/218 đường asset và hai ca Save schema 3 đạt. QA script xác minh 216 frame B và 72 frame A. |
| Hiệu năng | 50 mẫu RAF, Canvas 43,24 FPS, p95 50 ms. WebGL SwiftShader 7,74 FPS, p95 200 ms. Số đo cục bộ trong Cloud, auto quality hạ xuống LOW. Mục tiêu 60 FPS vẫn OPEN. |

Ảnh chuỗi dùng Canvas 1.280×720, camera zoom 2,2 và crop 164×132 theo pivot thực tế. Mỗi cột giữ cùng hướng. Roll di chuyển qua nền thật trong khi camera theo nhân vật. Cột cuối của Death giữ đúng frame tàn lửa đã render. [So sánh BEFORE/AFTER B](Visuals/V153_B04C_K3/defense-runtime-before-after.png) · [Chuỗi K3-A](Visuals/V153_B04C_K3/core-runtime-sequences.png) · [Chuỗi K3-B](Visuals/V153_B04C_K3/defense-runtime-sequences.png)

[Frame trace A ở build B](Visuals/V153_B04C_K3/core-sequence-canvas.json) · [B Canvas](Visuals/V153_B04C_K3/defense-after-canvas.json) · [B WebGL](Visuals/V153_B04C_K3/defense-after-webgl.json) · [B Save, chuyển vùng, restart](Visuals/V153_B04C_K3/defense-lifecycle-canvas.json)

### Handoff checkpoint B

Runtime và atlas B ở `6a64978d09b0f9f88c96b85f509a1c34ec097fe3`. Commit kế tiếp trên nhánh phát triển giữ tài liệu và ảnh chốt B. Đã dừng phạm vi thực hiện tại K3-B theo yêu cầu kiểm tra sprite của Owner. K3 giữ **PARTIAL**, 12/20 nhóm đã xác minh. Tám nhóm K3-C vẫn OPEN. Hosted, 60 FPS, và lỗi Phaser Text khi restart vẫn ở các gate cũ. [Runtime B](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commit/6a64978d09b0f9f88c96b85f509a1c34ec097fe3) · [Lịch sử checkpoint](https://github.com/KyoshiroKyo/HOLLOW-WOODS/commits/feat/v1.5.3-batch04) · [Checkpoint](V153_BATCH_04_CHECKPOINT.md)

Lệnh tiếp nối khi Owner mở phạm vi và cổng thực thi đáp ứng đủ điều kiện. `V153-BATCH-04C-K3 EXECUTE REMAINING ONLY — K3-C: 13–20. Xác minh HEAD của checkpoint B; giữ nguyên A/B đã PASS; chỉ bật gameplay cho kỹ năng đã duyệt.`
