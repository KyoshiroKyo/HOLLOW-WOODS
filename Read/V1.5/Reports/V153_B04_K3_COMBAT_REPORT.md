# V153-BATCH-04C-K3 — Chiến đấu và trạng thái của Black Knight

**21/11/2026 · K3 PARTIAL · Checkpoint K3-A**

Nhánh `feat/v1.5.3-batch04`, mốc vào `e91809963955c60778cc763427c56d052528df4a`. Mốc vào khớp GitHub và worktree triển khai sạch. Bốn nhóm K3-A dùng ba clip mỗi hướng, gồm pha hồi phục nằm trong từng clip. Hồ sơ kiểm thử dùng Chromium cục bộ và profile riêng với SDK mô phỏng. Hosted P2Game vẫn BLOCKED.

## A. Task ledger

| Mã | Trước | Sau checkpoint A | Kết quả |
|---|---|---|---|
| K3-A · 01 Light Attack | OPEN · sheet legacy | PASS LOCAL — 4-DIR VERIFIED | 6 frame/hướng × 75 ms. Va chạm ở frame 2, khóa đến hết frame 5. |
| K3-A · 02 Heavy Attack | OPEN · sheet legacy | PASS LOCAL — 4-DIR VERIFIED | 6 frame/hướng × 100 ms. Va chạm ở frame 3 và vẫn có hai frame hồi phục. |
| K3-A · 03 Attack Combo | OPEN · chỉ có pha nguồn | PASS LOCAL — 4-DIR VERIFIED | Đòn nhẹ tiếp theo được chấp nhận ở cùng hướng trong 250 ms thời gian game sau đòn đầu dùng thế chém thấp riêng. Hai lần nhấn hợp lệ phát đúng hai lần hitbox. |
| K3-A · 04 Attack Recovery | OPEN · mở khóa theo timer cũ | PASS LOCAL — 4-DIR VERIFIED | Hai frame hồi phục 4–5 của mỗi đòn. Kết thúc clip trở về Armed Idle đúng hướng. Ngắt trước va chạm hủy hit và tháo listener. |
| K3-B · 05 Parry | OPEN | NOT TESTED | Nguồn 27–29, Fire Nova là pha VFX thành công. |
| K3-B · 06 Armed Roll | OPEN | NOT TESTED | Nguồn 12. |
| K3-B · 07 Unarmed Roll | OPEN | NOT TESTED | Nguồn 13. |
| K3-B · 08 Weapon On | OPEN | NOT TESTED | Nguồn 01. |
| K3-B · 09 Weapon Off | OPEN | NOT TESTED | Nguồn 02. |
| K3-B · 10 Armed Hurt | OPEN | NOT TESTED | Nguồn 31. |
| K3-B · 11 Unarmed Hurt | OPEN | NOT TESTED | Nguồn 30. |
| K3-B · 12 Death | OPEN | NOT TESTED | Nguồn 32, clip chung. |
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

Lệnh tiếp nối `V153-BATCH-04C-K3 EXECUTE REMAINING ONLY — K3-B: 05–12; giữ K3-C sau cổng checkpoint.` Tiêu chí A và các blocker được giữ trong hồ sơ để tiếp tục khi vào B.
