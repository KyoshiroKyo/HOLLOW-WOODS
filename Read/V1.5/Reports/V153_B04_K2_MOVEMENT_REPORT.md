# HOLLOW WOODS V1.5.3 — 04C-K2 · Hoạt ảnh di chuyển Black Knight

**21/11/2026 · PASS local cho 20 clip K2 và một actor qua vòng đời · PARTIAL cho kiểm tra restart sạch console · HOSTED BLOCKED**

Nhánh `feat/v1.5.3-batch04`, worktree `/workspace/work/v153-b04/checkout`. Baseline 04B2 `d357ebd35529b94d59ca76f6c3741c9f32161037`. Bản tái hiện trước sửa P0 `4f6eb7e2a844e70b26a7f62b013d5d9274fc935f`. Runtime sau sửa `5feed142c9861b12ac0473ae535d8877c2faf814`. Bằng chứng và checkpoint đi ở commit tài liệu tiếp theo. [Ma trận 26 nhóm](V153_CHARACTER_ANIMATION_MATRIX.md) · [Checkpoint](V153_BATCH_04_CHECKPOINT.md)

## BLACK KNIGHT OLD/NEW SPRITE MIXING — ROOT CAUSE & FIX

Ảnh trước xác nhận đúng báo cáo Owner. Mỗi mẫu RIGHT cùng camera 2,20× và khung 64×64, nhưng có ba clip dùng profile Fellor tối trong atlas K2 bên cạnh các góc custom giáp nổi rõ. Armed Idle RIGHT của K1 có cùng vấn đề nhận diện khi đi từ Armed Walk mới về Idle. Đây là lỗi phối hợp nguồn artwork được registry chọn cho **một** BlackKnightPlayer. Đổi texture key riêng lẻ không giải quyết được vì ba clip lỗi vốn đã nằm trong atlas mới. [Sáu trạng thái RIGHT trước/sau có key](Visuals/V153_B04C_K2/six-states-right-before-after.webp) · [Bốn hướng sau sửa](Visuals/V153_B04C_K2/six-states-four-directions.webp) · [48 mẫu trước/sau và metadata runtime](Visuals/V153_B04C_K2/six-states-metadata.json)

| Clip bị ảnh hưởng | Texture và artwork trước sửa P0 | Sau sửa |
|---|---|---|
| Armed Idle RIGHT | `black_knight_armed_idle`, sáu frame Fellor nguyên bản, profile tối. | Dùng sáu frame bổ sung RIGHT từ `black_knight_movement`. Tái hiện trực tiếp ở bước Walk → Idle. PNG/JSON K1 giữ nguyên byte và tiếp tục cấp ba hướng còn lại. |
| Armed Run RIGHT | `black_knight_movement`, 12 frame Fellor, thấy dáng lớn và khối áo choàng tối. | Sáu frame RIGHT custom theo cùng tạo hình giáp, mũ, plume và áo choàng của Walk/Idle. Kiếm cong hạ thấp, ember nằm ở lưỡi. |
| Unarmed Idle cả nhóm | `black_knight_movement`, RIGHT gồm sáu profile Fellor tối, một số frame custom có vệt sáng trước ngực như kiếm cầm. | 24 pose Idle mới, tay trống, chân tiếp đất cùng hàng. Vỏ kiếm tối nằm ở phía lưng và khuất một phần sau áo choàng. |
| Unarmed Run cả nhóm | `black_knight_movement`, RIGHT gồm 12 frame Fellor đen. Các dải còn lại có viền hổ phách ở vỏ kiếm. | RIGHT cùng thiết kế giáp với Walk và Idle. Giữ poses chạy đã đạt ở ba hướng kia, hạ sáng vỏ kiếm để phân biệt với lưỡi rút. |
| Unarmed Walk | `black_knight_movement`, tay trống, nét hổ phách trên lưng dễ đọc thành kiếm phát sáng ở cỡ runtime. | Giữ tư thế và frame order Walk. Thu hẹp palette của vỏ kiếm sang nâu da tối, giữ chùm lông đỏ riêng. |
| Armed Walk | `black_knight_movement`, đã có pose Walk riêng, giáp và kiếm hợp lệ. | Giữ artwork nguồn và sáu pose/hướng. Chuẩn hóa điểm chạm đất để khớp Idle. |

**Provenance.** Các frame cũ là artwork **Fellor / BitBlast Studio** ở Source Library `03-armed-idle`, `04-unarmed-idle`, `14-unarmed-run`, `15-armed-run`. Giữ toàn bộ pixel, PNG gốc, archive, metadata và credit. Atlas mới có 126 frame **CUSTOM_ART** dựa trên mẫu Fellor và artwork đã được dùng của dự án. Sheet custom chỉ dùng để trích ô, lọc nền và căn neo. Nhóm Unarmed được duyệt vị trí tay/vỏ ở từng frame trước khi giảm sáng các điểm hổ phách. Atlas không chứa matte cyan, ô trống hay frame legacy. [Giấy phép Fellor](<../../../Pixel_Art/Black Knight/License.txt>)

**Đường render.** `PreloadScene` nạp hai atlas và texture tương thích. `BlackKnightAnimations` đăng ký mỗi clip bốn hướng khi đủ sáu frame theo hướng, giữ alias `satyr_*`. `BlackKnightPlayer` chọn clip bằng hướng, tốc độ và trạng thái cầm kiếm. Trong cửa sổ hành động X 400 ms, sprite dùng Idle đã xác minh của **trạng thái đích** thay cho clip chuyển vũ khí có tạo hình cũ. Hồi phục, thời lượng lock, luật tự đổi vũ khí theo vùng và clip/alias legacy giữ nguyên. Artwork riêng cho động tác rút và tra kiếm vẫn thuộc K3. Nếu nhóm Walk/Run thiếu frame, chuyển động vật lý tiếp tục và player hiển thị Idle đúng trạng thái. Không gắn tên Unarmed cho một clip Armed.

**Kiểm tra lớp chồng.** BlackKnightPlayer là một sprite gốc. Bóng chân dùng Graphics. GameScene có sprite highlight cho đối tượng tương tác, ẩn khi không dùng và hủy lúc shutdown. Atlas cũ và mới có thể cùng nạp vào Texture Manager. Bộ đếm runtime quét các sprite nhân vật đang visible, có alpha và đủ điều kiện render trên camera chính, đồng thời đối chiếu instance chính và canvas. Bảng trước/sau ghi **một actor mỗi mẫu**. Log vòng đời ghi tối đa một actor và một canvas trong 365 khung trước reload và 24 khung sau reload tính đến restart. Actor cũ bị hủy, actor mới dùng đúng Idle DOWN. Ca restart từ 04B2 và hai bản K2 đều có cùng lỗi vẽ Text trong Canvas. Kết quả đếm actor đạt, mục console khi restart giữ PARTIAL. [Log vòng đời](Visuals/V153_B04C_K2/lifecycle.json)

## Coverage và texture mapping

D, U, L, R tương ứng DOWN, UP, LEFT, RIGHT. Tất cả 24 clip gameplay trong sáu nhóm có sáu frame mỗi hướng. Giá trị ms là timing đã đăng ký của clip. `black_knight_movement` chứa 120 frame K2 và sáu frame thay riêng cho Armed Idle RIGHT. Tổng runtime sáu nhóm dùng 144 frame, gồm 18 frame K1 được giữ nguyên trong ba hướng còn lại.

| Nhóm và mã | Trước K2 | D / U / L / R đã tích hợp | Frame / ms / chu kỳ | Prefix runtime · texture |
|---|---|---|---|---|
| Armed Idle · CLOUD-01C | K1 đã đạt 4 hướng, sau đó tái hiện lỗi silhouette RIGHT khi đi với Walk mới | K1 / K1 / K1 / custom đã sửa | 6 × 70 ms = 420 ms mỗi hướng | `wayfarer_idle_<dir>` · `black_knight_armed_idle` ở D/U/L · `black_knight_movement` ở R |
| Armed Walk · B04-10-K2 | Chưa có Walk Fellor riêng, runtime dùng sheet cũ | custom / custom / custom / custom | 6 × 170 ms = 1.020 ms | `wayfarer_walk_<dir>` · `black_knight_movement` |
| Armed Run · B04-10-K2 | Fellor RIGHT 12 nguồn, runtime legacy | custom / custom / custom / custom | 6 × 140 ms = 840 ms | `wayfarer_run_<dir>` · `black_knight_movement` |
| Unarmed Idle · B04-10-K2 | Fellor RIGHT 6 nguồn, runtime legacy | custom / custom / custom / custom | 6 × 70 ms = 420 ms | `wayfarer_unarmed_idle_<dir>` · `black_knight_movement` |
| Unarmed Walk · B04-10-K2 | Đi bộ dùng chung key với Armed, thiếu clip riêng | custom / custom / custom / custom | 6 × 170 ms = 1.020 ms | `wayfarer_unarmed_walk_<dir>` · `black_knight_movement` |
| Unarmed Run · B04-10-K2 | Fellor RIGHT 12 nguồn, runtime legacy | custom / custom / custom / custom | 6 × 140 ms = 840 ms | `wayfarer_unarmed_run_<dir>` · `black_knight_movement` |

CLOUD-01D–01F theo phạm vi gait R10 đi từ art chưa đủ đến 20 clip runtime bốn hướng. CLOUD-01Y có atlas production và metadata cho K2. CLOUD-01Z áp dụng registry cho player và kiểm thử state. Portrait CLOUD-01X, migration CLOUD-01Y-R, alias, các clip K3 và phần đã nghiệm thu trước K2 được kế thừa. [PNG atlas](../../../public/assets/characters/black_knight/black_knight_movement.png) · [Nguồn từng clip, SHA-256, frame bounds và timing](../../../public/assets/characters/black_knight/black_knight_movement.json)

Atlas RGBA **896×576**, một texture, khoảng **1,97 MiB** pixel nếu giải mã RGBA8. Mỗi frame hiển thị **64×64**, origin **(0.5, 1.0)**, mốc chân theo biên pixel y=63. Idle và Walk có chân theo mốc này, Run giữ độ nhấc theo pha. Body **18×12**, offset **23,46**. Nearest-neighbor đọc trực tiếp từ source texture trong Chromium. Hình Run có thân nghiêng và pha rời mặt đất. Hình Walk thẳng hơn và có bước đặt chân riêng, với chu kỳ dài hơn Run.

## Kiểm thử runtime và bằng chứng

| Ca | Kết quả kiểm tra |
|---|---|
| Chromium Canvas · 20 clip K2 | Ghi toàn bộ 120 frame thực sự được canvas render. Từng hướng có chuỗi Idle → Walk → Run → Idle qua WASD, Shift, phím mũi tên. Khung giữ 64×64, origin (0.5, 1.0), body 18×12, nearest và không lật X. Atlas cũ K1 chỉ cấp Armed Idle D/U/L. |
| Đổi hướng, chéo và bàn phím | Canvas ghi chuyển LEFT↔RIGHT, UP↔DOWN, vận tốc chéo và đứng lại. Kiểm tra IME không điều khiển game từ ô nhập và Unicode `ư` vẫn map sang W khi canvas có focus theo hành vi hiện hành. |
| Rút / tra kiếm | Phím X qua bốn hướng, hai trạng thái. Trong lock, Idle tương ứng dùng đúng texture và chỉ có một actor. Điều kiện tự rút/tra theo vùng vẫn hoạt động. |
| Vòng đời | New Game, chuyển Fog Crossing ↔ Bellhollow bằng phím, restart qua `handleRestartGame()` và Continue local. Kiểm tra instance cũ sau restart và số actor/canvas qua từng mốc. **PASS cho một actor**, **PARTIAL cho restart sạch console** do lỗi vẽ Text đã tồn tại ở 04B2. [Stack cùng lỗi ở ba build](Visuals/V153_B04C_K2/restart-compare.json) |
| Save schema 3 | Pause → Lưu thủ công → reload → Continue ở Fog Crossing (290,255). Profile local công khai và profile QA có log riêng. |
| Fallback cố ý thiếu frame | Xóa `armed_run_up_5` ở response thử. Alias legacy tồn tại trong registry. Shift+D vẫn chạy vật lý và sprite hiển thị Idle RIGHT đã sửa, không chuyển sang silhouette cũ. Đồng thời xóa `armed_idle_right_5` ở atlas K1 trong fixture. Frame K1 RIGHT cũ không còn là đầu vào bắt buộc khi đủ RIGHT thay thế. |
| Va chạm | Noclip OFF, có event vật lý đúng đối tượng với hàng rào, NPC Garth, gốc cây và xưởng Bram. Cả bốn mặt chạm được đối chiếu với build 04B2. |
| Canvas / WebGL | Mỗi renderer quan sát **24/24 hướng/trạng thái và 144/144 frame** của sáu nhóm, gồm **120/120 frame K2**. Hai lượt chuẩn không có thiếu frame, ngoại lệ JS hoặc HTTP lỗi. WebGL SwiftShader tự giảm chất lượng ở khoảng 5,1 FPS trong máy Cloud. [Bằng chứng định lượng](Visuals/V153_B04C_K2/README.md) |
| Tĩnh và build | `npx tsc --noEmit`, `git diff --check`, `npm run build -- --outDir <scratch>`, Vite build QA, `node scripts/verify_zero_404_assets.mjs` 214/214, `node scripts/test_v153_save_schema3.mjs` hai nhóm PASS, Save lịch sử 49/49. Re-pack PNG/JSON khớp byte bằng `python scripts/pack_v153_black_knight_movement.py <reviewed_artwork> --output <scratch>`. |

Các screenshot metadata trước/sau dùng cùng zoom **2,20×**, hướng, mốc ngày và tên frame 0 để trực tiếp so silhouette. GIF và contact sheet riêng có **tất cả frame** của 20 clip, lấy từ canvas sau khi render. Timing của GIF lấy từ clip runtime. [Năm vòng lặp gameplay](Visuals/V153_B04C_K2/README.md)

## Tệp, cảnh báo và phần còn mở

- `src/config/Constants.ts`, `src/scenes/PreloadScene.ts` mở đường nạp texture mới. `src/animation/BlackKnightAnimations.ts` kiểm đủ frame và quản lý liên kết hướng/alias. `src/entities/BlackKnightPlayer.ts` chọn gait theo vũ khí, bảo toàn pha bước và lựa chọn pose an toàn.
- `scripts/pack_v153_black_knight_movement.py`, `ASSETS_MANIFEST.json`, PNG/JSON atlas mới. Artwork thô được giữ trong `/workspace/work/v153-b04/k2/approved-r3`, SHA từng sheet lưu trong JSON. Các artifact kiểm thử là ảnh game và log, giữ quy định phân phối của Fellor.
- Khi chạm vào body Garth, world step ghi AABB `[561,255,583,269]` với sprite ở `(540,205)`. Baseline 04B2 tái hiện đúng cùng sai lệch. Ghi vào backlog NPC và giữ phạm vi K2. [Build 04B2](Visuals/V153_B04C_K2/colliders-04b2.json) · [Build K2](Visuals/V153_B04C_K2/colliders.json)
- Cảnh báo SDK standalone và tự giảm chất lượng trên Chromium headless có log. Ca restart Canvas tách riêng ghi `Cannot read properties of null (reading 'drawImage')` trong chuỗi Phaser `Frame.updateUVs → Text.updateText` trên cả 04B2 và K2. Giữ lỗi vòng đời Text mở để rà ở nhóm UI. Vite cảnh báo script startup tĩnh và hai URL font được phân giải khi chạy. Gate hiệu năng thiết bị thật và preview hosted vẫn mở.
- Hai manifest P2Game, SDK, combat, sát thương, cooldown, kỹ năng, Save schema và world layout giữ nguyên. Hai nhánh tham chiếu `main` và QA cũ có SHA `b5eaa612f7011b7d9fdc657d31310082d08f281b` và `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`.

Dừng sau K2. 04C-K3 cần phê duyệt riêng. Các lỗi map chưa đóng của 04B2, BUG-051–054, kiểm thử hosted và gate phát hành ở đúng backlog.
