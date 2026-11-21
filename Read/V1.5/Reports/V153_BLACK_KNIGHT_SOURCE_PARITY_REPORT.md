# V153-R10 — Black Knight Full Conversion và Source Parity

**PARTIAL cho full conversion qua gameplay. Audit 34/34 chuỗi và 324/324 frame nguồn. 34/34 chuỗi có bản custom đủ số frame và nhịp nguồn đã kiểm chứng, gồm 5 PASS live và 29 ASSET-ONLY.**

Baseline `61b244562c9aacd81125144d0f29e5043a9fe84c`, runtime `6bb15b80479f1206e2eaba878cd5903434f63ea4`, nhánh `feat/v1.5.3-batch04`. Phạm vi chỉ là actor Black Knight, texture/atlas, registry và hồ sơ nghiệm thu. Art, runtime và đường gọi gameplay được ghi theo từng loại.

## Kiểm kê source

Master Fellor 2.592×1.152 RGBA, SHA-256 `d75455e35e29f06e1bcfd41c349158b0548016c556f6d3e85c0ac2007a5eedac`. Đọc 34 tệp metadata, so pixel RGBA nội ô 142×62 của 324 PNG trích xuất với master, kiểm perimeter trong suốt và thứ tự liên tục 0–323. Không thiếu nguồn. Bảng phía dưới dùng quan hệ pha và số frame/nhịp. Artwork custom không nhằm trùng pixel với nguồn. [Audit theo từng ô](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/full-source-audit.json) · [Frame map nguồn](V153_F0_0_BLACK_KNIGHT_FRAME_MAP.md)

Ảnh master và các ô Fellor là `SOURCE_REFERENCE`. Tệp đính kèm `Banner.aseprite` có 1 frame RGBA, 128×64, được giữ ở vai trò tham chiếu. Ảnh contact sheet trong hồ sơ này đọc trực tiếp từ PNG atlas custom. Ảnh runtime chụp actor thật tại `postrender` của Chromium. Cả thư mục art gốc và năm atlas đã nghiệm thu khớp với baseline.

## Bảng mapping 34 hoạt ảnh nguồn

`PASS` áp dụng cho clip live khớp coverage đủ nguồn. `ASSET-ONLY` áp dụng cho bản đầy đủ đã chạy bằng fixture trên actor thật và chưa gắn gameplay. `PARTIAL` ghi bản rút gọn hoặc sai nhịp/số frame nguồn. `OPEN` áp dụng khi chưa có bản phù hợp. Runtime được kiểm theo `textureKey` và `textureFrame`; tên `wayfarer_*`/`satyr_*` vẫn là alias tương thích.

| # | Tên nguồn | Frame nguồn | Ô master | Clip chọn qua gameplay hoặc fixture đã duyệt trước, atlas, frame/hướng | Bản đủ nguồn đã thử, atlas, frame×ms | Trạng thái |
|---:|---|---:|---:|---|---|---|
| 01 | Weapon on | 18 | 0–17 | `weapon_on` · defense · 6 | `weapon_on_sequence` · `black_knight_conversion_states` · 18×70 ms | ASSET-ONLY |
| 02 | Weapon off | 14 | 18–31 | `weapon_off` · defense · 6 | `weapon_off_sequence` · `black_knight_conversion_states` · 14×70 ms | ASSET-ONLY |
| 03 | Armed Idle | 6 | 32–37 | `idle` · armed_idle / movement · 6 | Live · 6×70 ms | PASS |
| 04 | Unarmed Idle | 6 | 38–43 | `unarmed_idle` · movement · 6 | Live · 6×70 ms | PASS |
| 05 | Heavy Attack 1 | 19 | 44–62 | `heavy_attack` · core_combat · 6 | `heavy_attack_1_sequence` · `black_knight_conversion_combat` · 19×70 ms | ASSET-ONLY |
| 06 | Heavy Attack 2 | 8 | 63–70 | `heavy_attack` · core_combat · 6 | `heavy_attack_2_sequence` · `black_knight_conversion_combat` · 8×70 ms | ASSET-ONLY |
| 07 | Heavy Attack 3 | 13 | 71–83 | `heavy_attack` · core_combat · 6 | `heavy_attack_3_sequence` · `black_knight_conversion_combat` · 13×70 ms | ASSET-ONLY |
| 08 | Attack 1 | 9 | 84–92 | `attack` · core_combat · 6 | `light_attack_1_sequence` · `black_knight_conversion_combat` · 9×70 ms | ASSET-ONLY |
| 09 | Attack 2 | 9 | 93–101 | `attack_combo` · core_combat · 6 | `light_attack_2_sequence` · `black_knight_conversion_combat` · 9×70 ms | ASSET-ONLY |
| 10 | Attack 3 | 11 | 102–112 | `attack_combo` · core_combat · 6 | `light_attack_3_sequence` · `black_knight_conversion_combat` · 11×70 ms | ASSET-ONLY |
| 11 | Attack 4 | 11 | 113–123 | `thrust / flame_stream` · extended_skills · 6 | `light_attack_4_sequence` · `black_knight_conversion_combat` · 11×70 ms | ASSET-ONLY |
| 12 | Armed Roll | 12 | 124–135 | `roll` · defense · 6 | `armed_roll_sequence` · `black_knight_conversion_motion` · 12×70 ms | ASSET-ONLY |
| 13 | Unarmed Roll | 12 | 136–147 | `unarmed_roll` · defense · 6 | `unarmed_roll_sequence` · `black_knight_conversion_motion` · 12×70 ms | ASSET-ONLY |
| 14 | Unarmed Run | 12 | 148–159 | `unarmed_run` · conversion_motion · trước K2 movement · 12 | `unarmed_run_sequence` · `black_knight_conversion_motion` · 12×70 ms | PASS |
| 15 | Armed Run | 12 | 160–171 | `run` · conversion_motion · trước K2 movement · 12 | `armed_run_sequence` · `black_knight_conversion_motion` · 12×70 ms | PASS |
| 16 | Unarmed Jump | 6 | 172–177 | — | `unarmed_jump` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 17 | Unarmed Mid air | 1 | 178 | — | `unarmed_mid_air` · `black_knight_conversion_air` · 1×70 ms | ASSET-ONLY |
| 18 | Unarmed Fall light | 6 | 179–184 | — | `unarmed_fall_light` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 19 | Unarmed Fall heavy | 6 | 185–190 | — | `unarmed_fall_heavy` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 20 | Unarmed Land | 6 | 191–196 | — | `unarmed_land` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 21 | Armed Jump | 6 | 197–202 | — | `armed_jump` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 22 | Armed Mid air | 1 | 203 | — | `armed_mid_air` · `black_knight_conversion_air` · 1×70 ms | ASSET-ONLY |
| 23 | Armed Fall light | 6 | 204–209 | — | `armed_fall_light` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 24 | Armed Fall heavy | 6 | 210–215 | — | `armed_fall_heavy` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 25 | Armed Land | 6 | 216–221 | — | `armed_land` · `black_knight_conversion_air` · 6×70 ms | ASSET-ONLY |
| 26 | Weapon Art | 35 | 222–256 | `weapon_art` · extended_skills · 6 | `weapon_art_sequence` · `black_knight_conversion_combat` · 35×70 ms | ASSET-ONLY |
| 27 | Parry start | 6 | 257–262 | `parry` · defense · 6 | `parry_start_sequence` · `black_knight_defense` · 6×70 ms | ASSET-ONLY |
| 28 | Parry | 15 | 263–277 | `parry_success` · defense · 6 | `parry_success_sequence` · `black_knight_conversion_states` · 15×70 ms | ASSET-ONLY |
| 29 | Parry miss | 3 | 278–280 | `parry_miss` · conversion_actions · 3 | `parry_miss` · `black_knight_conversion_actions` · 3×70 ms | PASS |
| 30 | Unarmed Hurt | 5 | 281–285 | `unarmed_hurt` · defense · 6 | `unarmed_hurt_sequence` · `black_knight_defense` · 5×70 ms | ASSET-ONLY |
| 31 | Armed Hurt | 5 | 286–290 | `hurt` · defense · 6 | `armed_hurt_sequence` · `black_knight_defense` · 5×70 ms | ASSET-ONLY |
| 32 | Death | 9 | 291–299 | `death` · defense · 6 | `death_sequence` · `black_knight_conversion_states` · 9×70 ms | ASSET-ONLY |
| 33 | Unarmed Buff | 12 | 300–311 | `unarmed_buff` · extended_skills · 6 | `unarmed_buff_sequence` · `black_knight_conversion_states` · 12×70 ms | ASSET-ONLY |
| 34 | Armed Buff | 12 | 312–323 | `armed_buff` · extended_skills · 6 | `armed_buff_sequence` · `black_knight_conversion_states` · 12×70 ms | ASSET-ONLY |

## Chênh lệch còn lại

Cả 34 chuỗi có bản custom đủ frame ở trụ artwork và renderer. Cột clip chọn qua gameplay cho biết các chuỗi vẫn dùng bản cô đọng. Các chuỗi đầy đủ ở cột bên cạnh giữ 70 ms/frame. Jump, Mid-air, Fall và Land chỉ có đường phát asset-only theo quy tắc dự án.

- 5 dòng PASS live gồm Armed/Unarmed Idle, Armed/Unarmed Run và Parry Miss. Ba utility mới ngoài 34 dòng cũng có đường gọi live.
- 29 dòng ASSET-ONLY gồm 10 chuỗi trên không, đáp đất, 8 chuỗi Heavy/Light Attack và Weapon Art, 11 chuỗi Roll, vũ khí, Parry, Hurt, Death và Buff. Cột clip đã duyệt chỉ rõ bản live ngắn hoặc hành động hiện chưa có đường gọi.

## Tích hợp và bằng chứng Chromium

- **A.** Interact, Gather, Use Item là ba nhóm bổ sung ngoài 34 dòng master, với hai trạng thái vũ khí × bốn hướng. Parry Miss thuộc #29, phát khi hết cửa sổ cũ; nhánh Parry Success không phát Miss. Dùng phím 1, E để thử thuốc, nhặt `node_wood_2` và tương tác NPC. Trace giữ đủ sáu frame trong các ca này và đúng một lần trừ thuốc. [Ingress Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/ingress-canvas.json) · [Ingress WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/ingress-webgl.json)
- **B.** Jump, Mid-air, Fall Light/Heavy và Land có đủ Armed/Unarmed. Mid-air là một pose giữ từ apex custom như độ dài nguồn. Tất cả là asset-only; physics, collider và input game giữ hợp đồng hiện hành.
- **C.** 3 Heavy Attack, 4 Attack và Weapon Art có chuỗi theo thứ tự pha nguồn. Weapon Art giữ 35 frame do đã nối chuẩn bị, các cung liên tiếp, lướt/cuộn, đáp và recovery. Các chuỗi đầy đủ được kiểm trên actor thật bằng fixture và giữ asset-only. Biến thể live đã duyệt vẫn giữ duration, phím và hành vi đã duyệt.
- **Những khoảng trống còn lại sau C.** Bản đủ nguồn của Roll, rút/tra kiếm, Parry Success, Death và Buff được tích hợp dưới alias `*_sequence`. Sửa riêng các pose Armed Buff bị mất kiếm ở pha tan VFX. Unarmed Buff giữ tay trống ở tất cả bốn hướng. Parry Start và hai Hurt tận dụng artwork K3-B theo dải custom tương ứng.
- **Run.** Phím Shift + WASD sử dụng 12 frame mới ở cả hai trạng thái kiếm, cùng chu kỳ 840 ms như K2. Pha chân khi chuyển Walk ↔ Run và nhịp nhấp nhô của Vòng Sáng được quy đổi theo chu kỳ cũ.

Registry và loader cũ còn đường mặc định lấy hình từ sheet Wayfarer/Satyr khi clip custom thiếu, điển hình là ba clip utility. Loader mới loại spritesheet cũ khỏi preload. Player khởi tạo bằng custom Armed Idle và fallback stance khớp trạng thái kiếm. Registry kiểm đủ frame trước khi tạo clip và giữ alias cũ. Bằng chứng dưới đây kiểm frame thấy ở `postrender`, alias tương ứng, một actor và AABB cục bộ `[-9,-18,18,12]`. QA ảnh kiểm alpha, viền, bbox, hash và số pixel vàng của kiếm. Contact sheet được đối chiếu thủ công về vị trí kiếm, hướng và mốc chân.

- `actions` · 28 clip, 156 frame đã nhìn thấy trên mỗi renderer. [Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/actions-runtime-canvas.png) · [WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/actions-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/actions-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/actions-trace-webgl.json) · [Contact sheet](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/actions-contact.png) · [QA atlas theo frame](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/actions-asset-qa.json)

- `air` · 40 clip, 200 frame đã nhìn thấy trên mỗi renderer. [Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/air-runtime-canvas.png) · [WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/air-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/air-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/air-trace-webgl.json) · [Contact sheet](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/air-contact.png) · [QA atlas theo frame](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/air-asset-qa.json)

- `combat` · 32 clip, 460 frame đã nhìn thấy trên mỗi renderer. [Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/combat-runtime-canvas.png) · [WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/combat-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/combat-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/combat-trace-webgl.json) · [Contact sheet](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/combat-contact.png) · [QA atlas theo frame](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/combat-asset-qa.json)

- `states` · 24 clip, 320 frame đã nhìn thấy trên mỗi renderer. [Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/states-runtime-canvas.png) · [WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/states-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/states-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/states-trace-webgl.json) · [Contact sheet](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/states-contact.png) · [QA atlas theo frame](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/states-asset-qa.json)

- `motion` · 16 clip, 192 frame đã nhìn thấy trên mỗi renderer. [Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/motion-runtime-canvas.png) · [WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/motion-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/motion-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/motion-trace-webgl.json) · [Contact sheet](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/motion-contact.png) · [QA atlas theo frame](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/motion-asset-qa.json)

- `references` · 12 clip, 64 frame đã nhìn thấy trên mỗi renderer. [Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/references-runtime-canvas.png) · [WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/references-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/references-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/references-trace-webgl.json)

- **Điều khiển thực.** Tám tổ hợp kiếm × hướng, mỗi tổ hợp chạy Idle → Walk → Run → Idle với đủ 6 / 6 / 12 / 6 frame đã render. Khi SwiftShader bỏ qua frame do thời gian render dài, phép thử thu thập frame qua các vòng lặp và đặt lại vị trí, thể lực trong vùng kiểm thử. Registry xác nhận 682 tên animation khớp texture/frame custom trên cả hai renderer. [Ảnh Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/locomotion-runtime-canvas.png) · [Ảnh WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/locomotion-runtime-webgl.png) · [Trace Canvas](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/locomotion-trace-canvas.json) · [Trace WebGL](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/locomotion-trace-webgl.json)

## File thay đổi và chi phí texture

- `src/entities/BlackKnightPlayer.ts` nối utility, Parry Miss và Run vào đường gọi có sẵn. Khởi tạo và fallback dùng stance custom. `src/animation/BlackKnightAnimations.ts` và `BlackKnightConversion.json` đăng ký frame theo atlas, thời lượng và hướng. `src/config/Constants.ts` và `src/scenes/PreloadScene.ts` khai báo và nạp atlas mới.
- Năm cặp PNG/JSON mới trong `public/assets/characters/black_knight/` mang tiền tố `black_knight_conversion_`, lần lượt `actions`, `air`, `combat`, `states`, `motion`. Metadata ghi các tấm artwork AI custom được tuyển, ô nguồn và SHA-256. Fellor là tác giả art tham chiếu. Không ghi đè Source Library hay năm atlas K1/K2/K3 đã nghiệm thu.
- Năm PNG thêm 2.65 MB dung lượng tải nén, khoảng 38.22 MiB RGBA nếu giải nén cả năm. Mỗi atlas tối đa 2016×2016. Mức tăng là ước lượng từ file ảnh và không tính bộ nhớ riêng của trình duyệt. 18 sprite sheet legacy và `satyr_sheet` đã được loại khỏi đường nạp game.
- `scripts/pack_v153_black_knight_conversion.py`, `scripts/qa_v153_black_knight_combat.py` và `scripts/qa_v153_black_knight_source_parity.py` cung cấp đóng gói, kiểm atlas và chạy lại Chromium. Nhật ký và ảnh nằm bên dưới `Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/`.

## Kiểm thử và handoff

- `npm run check` và `npm run build` PASS. Vite giữ các cảnh báo có sẵn về hai font URL và script startup. `verify_zero_404_assets.mjs` PASS 212/212. `test_v153_save_schema3.mjs` PASS hai ca schema 3 và cách ly QA. `git diff --check` PASS.
- Chromium 156 qua Playwright với Canvas và ANGLE SwiftShader WebGL. SDK được thay bằng fixture loopback cho ca kiểm thử local. Registry trace xác nhận alias `wayfarer_*` và `satyr_*` có cùng frame custom. Các ca parity không ghi nhận HTTP 404 hoặc missing frame.
- Canvas với Space bốn hướng xác nhận đòn cũ vẫn hit một lần ở frame 2, giữ hai frame recovery và trở lại idle. Save/Continue schema 3, hai chiều Fog Crossing/Bellhollow, rút/tra kiếm bốn hướng và restart đều giữ một actor. Ca restart tái hiện lỗi Phaser Text `drawImage` đã ghi ở K3-C, actor mới và việc dọn timer vẫn xác nhận được. [Trace Light Attack](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/attack-recovery-canvas.json) · [Trace vòng đời](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/canvas-lifecycle.json) · [Ảnh restart](Visuals/V153_BLACK_KNIGHT_SOURCE_PARITY/canvas-single-actor-restart.png)
- `test_v152_05_black_knight_combat.mjs` lịch sử FAIL 52 đạt, 14 không đạt. Baseline 64 đạt, 2 không đạt vì preview backup vắng và cờ artist đã bật. 12 assertion chênh lệch vẫn kiểm tên loader/config V1.5.2 đã được thay thế. Test này được giữ nguyên và báo kết quả riêng.

Nhánh `feat/v1.5.3-batch04`. Commit chứa báo cáo là checkpoint local. Kiểm thử chỉ áp dụng bản build local. Trạng thái hosted P2Game giữ theo checkpoint trước.
