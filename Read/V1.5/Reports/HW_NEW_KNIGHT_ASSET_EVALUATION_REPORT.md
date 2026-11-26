# HW-NARRATIVE-00F — NEW KNIGHT ASSET ORGANIZATION & EVALUATION REPORT

- **Mission:** `HW-NARRATIVE-00F — NEW KNIGHT ASSET ORGANIZATION & EVALUATION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** `ASSET ORGANIZATION & VISUAL AUDIT` (`0` thay đổi sprite production, `0` xóa/di chuyển archive gốc, `0` tạo boss hay Black Knight V2 giả).
- **Primary Asset Root:** `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT`
- **Visual Evidence Folder:** [Visuals/HW-NEW-KNIGHT-ASSETS/](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/)

---

## 1. Bảo Toàn Dữ Liệu & Tổ Chức Kho Lưu Trữ (`§2`)

Tuân thủ tuyệt đối P0: **GIỮ NGUYÊN `4` tệp ZIP gốc tại `HOLLOW_WOODS_EXPORT\`** (`0` xóa, `0` di chuyển, `0` ghi đè), sao chép kiểm tra SHA-256 sang kho archive hiện hành [Pixel_Art/Rar/Characters/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Rar/Characters/), và giải nén an toàn (đã chặn zip-slip, chặn file thực thi, kiểm `0` xung đột tên file) vào thư mục thư viện nhân vật có sẵn [Pixel_Art/Characters/Knights/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Knights/).

| Archive gốc (`HOLLOW_WOODS_EXPORT\`) | Kích thước & Uncompressed | SHA-256 (Khớp 100% Bản Gốc ↔ Bản Sao) | Bản sao trong `Pixel_Art\Rar\Characters\` | Thư mục giải nén (`Pixel_Art\Characters\Knights\`) | Files |
| :--- | :---: | :--- | :--- | :--- | :---: |
| `Knight.zip` | `79,921 B` / `168,318 B` | `c5ff5dce2062717a4dd5e1d16426980b39dcf716d8554eea55720c184e389423` | `Pixel_Art\Rar\Characters\Knight.zip` | `Maxime_Nourry_Knight\` | `9` |
| `Water Warrior.zip` | `43,132 B` / `87,281 B` | `62bffb05c7f566e7e214da5344f9237d0a515d57fe5fa2de8c8888d1a51cf1fe` | `Pixel_Art\Rar\Characters\Water Warrior.zip` | `Water_Warrior\` | `2` |
| `heavy_knight_free.zip` | `93,202 B` / `97,162 B` | `857eb691b86dd29dc4d927b4a7ba92f05ee02e270e03632874f30dcd98908dda` | `Pixel_Art\Rar\Characters\heavy_knight_free.zip` | `Heavy_Knight_Free\` | `8` |
| `Mystic Autumn Knights.zip` | `2,020,980 B` / `2,266,103 B` | `a7e9be575bea576ee0f2f77b138a7276555b4941ab6fbdbb85299c0919a6d8eb` | `Pixel_Art\Rar\Characters\Mystic Autumn Knights.zip` | `Mystic_Autumn_Knights\` | `36` |

*(Ghi chú audio/tileset kèm theo: `Mystic_Autumn_Knights` chứa `8` sheet `sprites/*.png`, `1` track `music/Crystal_Caves_of_Eldoria.mp3`, và `27` SFX `.wav` trong `sounds/`, được giữ nguyên khối theo gói trong `Mystic_Autumn_Knights\` để tránh phân mảnh giấy phép).*

---

## 2. Đánh Giá Kỹ Thuật, Bản Quyền & Đối Chiếu Tỷ Lệ Runtime (`§3`)

### 2.1 Tham Chiếu Runtime Hiện Hành (`public/assets/characters/`)
- **`Meliodas Blackwood` (`Black Knight V2` — Codex):** `64×64` Top-Down 4 hướng (`body_h = 30px`, scale `1.50` = `~45 wpx`, anchor `(0.5, 1.0)`). **GIỮ NGUYÊN làm nhân vật chính (`CANON-APPROVED`), KHÔNG thay bằng bất kỳ pack mới nào.**
- **`Sir Vaelen` (`campfire_knight_idle_sheet.png`):** `64×64` Top-Down (`body_h = 47px`).
- **`Hooded Knight` (`hooded_knight_sheet.png`):** `160×160` Top-Down Boss (`body_h = 71px`).
- **`Fallen Knight` (`fallen_knight_sheet.png`):** `64×64` Top-Down Enemy (`body_h = 47px`).

### 2.2 Đánh Giá Chi Tiết `4` Pack Kỵ Sĩ Mới
| Tiêu chí | Pack 1: `Maxime_Nourry_Knight` (`Knight.zip`) | Pack 2: `Water_Warrior` (`Water Warrior.zip`) | Pack 3: `Heavy_Knight_Free` (`heavy_knight_free.zip`) | Pack 4: `Mystic_Autumn_Knights` (`Mystic Autumn Knights.zip`) |
| :--- | :--- | :--- | :--- | :--- |
| **Tác giả / Nguồn** | **Maxime Nourry** (`maxime-nourry.itch.io`) | Không ghi tác giả / URL trong ZIP | **Art by Jahnu** (`jahnu.itch.io/heavy-knight-64-64`) | `wantosure` (đối chiếu từ Master Bible `ASSET-K07`, không có metadata trong ZIP) |
| **Giấy phép (License)** | **VERIFIED OK** (`License.txt`: thương mại & chỉnh sửa OK; cấm resale/repackage; credit tùy chọn) | **UNVERIFIED / NO LICENSE IN ZIP** *(cấm dùng production tới khi xác minh bản quyền)* | **VERIFIED OK** (`license.txt`: thương mại miễn phí/trả phí & chỉnh sửa OK; cấm resale/NFT/AI/crypto) | **UNVERIFIED / NO LICENSE IN ZIP** *(itch.io từng lỗi cache ở `ASSET-K07`; phải lưu license tải kèm trước khi dùng)* |
| **Sprite sheets & Frame** | `6` PNG transparent + `knight.aseprite`: `whitefx` & `greyfx` (`630×540`, `7×6`), `drink` (`270×270`), `rest` (`180×180`), `death1` (`270×180`), `death2` (`360×360`) | `1` PNG transparent (`288×720`, `6×15` = `70` non-empty frames) + `.aseprite`: Idle/Walk/Attack/Hurt/Dissolve | `7` PNG transparent: `idle` (`12f`), `walk` (`8f`), `run` (`8f`), `jump` (`7f`), `light_attack` (`~23f`), `hurt` (`5f`), `death` (`6f`) | `8` PNG (`640×640`) + `27` WAV SFX + `1` MP3 (`dark_armored_knight.png`, `autumn_fantasy_tileset`, slimes, coins, fruits...) |
| **Canvas & Body Height** | `90×90` cell · thân `~44px` | `48×48` cell · thân `~38px` | `208×112` cell · thân `~60px` | Toàn sheet `640×640` (**Nền caro xám-trắng opaque + chữ "IDLE/RUN/ROLL/HIT/DEATH" dính chết trong PNG!**) |
| **Góc nhìn & Tương thích Phaser** | **Side-View Only** (chỉ nhìn phải) — cần lật/vẽ thêm 4 hướng nếu dùng top-down thật | **Top-Down 3-Dir** (Down, Side, Up — đủ hướng nhất), nhưng phong cách chibi vàng/xanh lá xung đột hoàn toàn với Hollow Woods | **Side-View Only** (chất lượng animation mượt, scale lớn ngang cấp mini-boss) | **Side-View Only + Không có Alpha** (`bbox` đặc kín `640×640`) — **KHÔNG thể cắt đưa thẳng vào Phaser runtime** nếu không tách nền & vẽ lại hướng |
| **Đề xuất phân bổ (Chưa gán chính thức)** | **Ứng viên tham chiếu / Rest NPC cho `Sir Aldemar` (`Ashen Knight`)** nhờ tông giáp xám tro đồng bộ + license sạch; **cần dựng top-down trước runtime** | **KHÔNG ĐỀ XUẤT** cho `Vaelen / Mordric / Roderick / Aldemar` (lệch tone thẩm mỹ & thiếu license) | **Ứng viên tham chiếu tạo hình cho `Sir Roderick` (`Crimson Knight`)** nhờ giáp tối + vải choàng đỏ thẫm + license sạch; **Side-View only nên không dùng trực tiếp top-down gameplay** | Chỉ dùng **tham chiếu bảng màu thu/SFX WAV** (sau khi xác minh license `wantosure`); **loại `dark_armored_knight.png`** khỏi ứng viên runtime trực tiếp |

### 2.3 Kiểm Kê Thêm `32x32Materials.png` & `64x64Materials.png` (§3)
- **Vị trí tìm thấy:** `G:\HOLLOW WOODS\HW\Trailer\32x32Materials.png` (`323,520` bytes, `320×640`, SHA-256 `ca22ae95ba4d40ba16efb36f45f5c9b704117b69b7c47d9632025ecf29c53593`) và `G:\HOLLOW WOODS\HW\Trailer\64x64Materials.png` (`1,102,002` bytes, `640×1280`, SHA-256 `b26128ac4c7895a7c01819e0c2a8b86050b2b316f999bc1f1fb331132bd72c8c`). *(Chưa nằm trong `HOLLOW_WOODS_EXPORT`).*
- **Đặc điểm:** Cùng bộ `200` icon thảo mộc/tinh thể/nguyên liệu xếp lưới `10×20` (`32×32` và `64×64`), nhưng có **nền trắng đặc (không tách alpha)** và phong cách vẽ bóng mượt *casual RPG* khác với nét pixel dark-fantasy hiện hành của game; **chưa kèm file giấy phép (`LICENSE UNKNOWN`)**. Khuyến nghị chỉ giữ tại `HW\Trailer\` làm tư liệu tham khảo icon, không nhập vào `public/assets/`.

---

## 3. Bằng Chứng Trực Quan & Contact Sheets (`§4`)

Toàn bộ `5` ảnh bằng chứng đã được tạo bằng nội suy *Nearest-Neighbor* trên nền Dark Moss `#141712` tại [Visuals/HW-NEW-KNIGHT-ASSETS/](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/):

1. **Tổng hợp đối chiếu tỷ lệ với nhân vật runtime (`Meliodas BK V2`, `Sir Vaelen`, `Hooded Knight`, `Fallen Knight`):**
   - 🖼️ [KNIGHT_ORDER_ASSET_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/KNIGHT_ORDER_ASSET_COMPARISON.png)
2. **Contact Sheet riêng cho từng pack:**
   - 🖼️ [CONTACT_SHEET_MAXIME_NOURRY_KNIGHT.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/CONTACT_SHEET_MAXIME_NOURRY_KNIGHT.png)
   - 🖼️ [CONTACT_SHEET_WATER_WARRIOR.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/CONTACT_SHEET_WATER_WARRIOR.png)
   - 🖼️ [CONTACT_SHEET_HEAVY_KNIGHT_FREE.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/CONTACT_SHEET_HEAVY_KNIGHT_FREE.png)
   - 🖼️ [CONTACT_SHEET_MYSTIC_AUTUMN_KNIGHTS.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NEW-KNIGHT-ASSETS/CONTACT_SHEET_MYSTIC_AUTUMN_KNIGHTS.png)
