# HW-NR-12 — SIR RODERICK CHARACTER PROTOTYPE REPORT

- **Mission ID:** `HW-NR-12 — SIR RODERICK CHARACTER PROTOTYPE`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Dependencies:** `APPROVED CHARACTER BIBLE` ([CHARACTER_REGISTRY.md §1 CHAR-004](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md)) + `00F ASSET EVALUATION` ([HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md)) + `DEC-LOCK-13` ([HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md))
- **Mode:** **`SANDBOX PROTOTYPE ONLY` (`HARD STOP` — Chưa đưa vào production game, `0` sửa `src/` hay `public/assets/`, `0` tự gán số phận, vị trí xuất hiện hoặc vai trò boss)**

---

## 1. Hồ Sơ Nhân Vật, Chọn Ứng Viên & Xác Minh Giấy Phép

1. **Trạng thái Canon (`CHAR-004`):** **`Sir Roderick — The Crimson Knight`** đã được Owner tiếp nhận hướng nhân vật (`ACCEPTED CHARACTER` tại `Ch. 05 / CHAR-K03`), hình tượng trọng danh dự, nghĩa vụ, mặc giáp thép phối áo choàng đỏ thẫm. Quan hệ thầy trò với `Meliodas`, quan hệ `Vaelen/Mordric`, vị trí zone, quest và số phận đang giữ mở chờ Owner ký **`DEC-LOCK-13` (`OQ-K04`)**.
2. **Đánh giá ứng viên từ thư viện hiện có (`HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Knights/`):**
   - **Ứng viên được chọn làm Visual Reference:** **`Heavy_Knight_Free`** (`Art by Jahnu`).
     - *Giấy phép (`license.txt`):* **VERIFIED OK** — cho phép dùng trong dự án thương mại/phi thương mại và chỉnh sửa tự do (cấm tái phân phối file gốc, NFT, AI, crypto; ghi công khuyến nghị `"Art by Jahnu"`).
     - *Góc nhìn & Lý do không dùng trực tiếp:* **Side-View Only** (`208×112` px/cell, `body_h ~60 px`). Theo quy tắc nghiêm ngặt của `HW-NR-12` (*"Không sử dụng asset Side-view trực tiếp nếu không phù hợp top-down"*), **TUYỆT ĐỐI KHÔNG** đưa thẳng spritesheet của `Heavy_Knight_Free` vào game mà dùng nó làm nguồn tham chiếu tỷ lệ giáp, mũ lông đỏ và áo choàng để dựng **nguyên mẫu Top-Down `3/4` 4 hướng nguyên bản** đồng bộ với `Meliodas` & `Sir Vaelen`.
   - **Các gói bị loại:** `Water_Warrior` (chibi vàng/xanh lệch tông mỹ thuật & thiếu license), `Mystic_Autumn_Knights` (Side-View nền caro opaque `640×640` & thiếu license). (`Maxime_Nourry_Knight` giữ làm ref cho `Sir Aldemar`).

---

## 2. Thiết Kế Bảng Màu, Giáp, Biểu Tượng & Bộ Animation Mục Tiêu

- **Bảng màu *The Crimson Knight* (hài hòa trên nền Dark Moss `#141712` & vùng sương `Ambient 0.22–0.35`):**
  - **Giáp thép tối:** Gunmetal `#2C313B` / Steel Base `#4C5462` / Highlight `#7E8A9E` / Specular `#AFBACA` *(sáng nhẹ hơn giáp đen-tro của Meliodas để dễ phân biệt trong bóng tối)*.
  - **Áo choàng & Lông mũ Đỏ Thẫm (`Crimson Mantle`):** Bóng `#4A121A` / Chính `#841F2C` / Nếp sáng `#B83442` *(khác biệt hoàn toàn với sắc tím `The Veil` của Mordric và vàng-cam ấm của Vaelen)*.
  - **Biểu tượng & Khóa đồng (`Order Crest`):** Đồng mờ `#8A6E38` / Vàng đồng `#CCAA60` với **huy hiệu hình thoi đỏ viền vàng** trước giáp ngực/tabard & sau lưng áo choàng *(không khóa cứng huy hiệu sói khi `DEC-LOCK-06` chưa chốt)*.
- **Thông số kỹ thuật Top-Down `3/4` (`4` hướng `down / up / left / right`, `64×64`):**
  - Canvas cell **`64×64 px`**, chiều cao nhân vật **`46–48 px`**, `origin (0.5, 1.0)`, `scale = 1.00`, đáy chân cố định tại **`y = 60` (`0 px` trôi chân)**, biên pixel *nearest-neighbor* `RGBA8888`.
- **Danh sách Animation cần cho Production (`TASK-B02` sau khi Owner duyệt `DEC-LOCK-13`):**
  - Nếu giữ vai trò **NPC / Cứu hộ / Đồng minh (`PROPOSED`):** `idle` (`6f @ 160ms`), `walk` (`6f @ 150ms`), `rest_kneel` (`4f`), `interact_salute` (`6f`) ở đủ 4 hướng (`down/up/left/right`).
  - *(Nếu Owner chọn bổ sung pha chiến đấu phụ ở `DEC-LOCK-13`, mở rộng thêm `attack` + `hurt` — hiện chưa tự đặt vai trò chiến đấu hay boss).*

---

## 3. Tài Sản Nguyên Mẫu Đã Dựng & Kiểm Chứng `Knight Visual Sandbox`

### 3.1 Bộ File Nguyên Mẫu & Bằng Chứng Trực Quan *(Cô lập 100% ngoài `src/` & `public/assets/`)*
- **Sprite Prototype (`64×64` 4×4 `down/up/left/right`, proportional blockout proxy để test tỷ lệ & anchor):**
  - [roderick_topdown_prototype_sheet.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Prototypes/Sir_Roderick/roderick_topdown_prototype_sheet.png) (`256×256` RGBA8888, `16` frames `64×64`)
  - [roderick_portrait_64x64.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Prototypes/Sir_Roderick/roderick_portrait_64x64.png) (`64×64` Portrait)
- **Visual Contact Sheet & Scale Parity (`Read/V1.5/Reports/Visuals/HW-NR-12/`):**
  - 🖼️ [RODERICK_PROTOTYPE_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-12/RODERICK_PROTOTYPE_CONTACT_SHEET.png)
  - 🖼️ [RODERICK_SCALE_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-12/RODERICK_SCALE_COMPARISON.png)
  - 🖼️ [KNIGHT_VISUAL_SANDBOX_SCREENSHOT.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-12/KNIGHT_VISUAL_SANDBOX_SCREENSHOT.png)
- **Sandbox Độc Lập (`Phaser 4.2.1`):**
  - [LAB_02_KNIGHT_VISUAL_SANDBOX](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_02_KNIGHT_VISUAL_SANDBOX/index.html) (`pixelArt: true`, `roundPixels: true`, `antialias: false`, zoom `2.2×`, đặt cạnh `Meliodas BK V2` & `Sir Vaelen`, điều khiển WASD 4 hướng).

### 3.2 Kết Quả Nghiệm Thu Thực Tế (`Chromium Headless QA` & `Pillow Metrics`)
| Tiêu chí nghiệm thu (`HW-NR-12 §ACCEPTANCE`) | Kết quả đo thực tế | Đánh giá |
| :--- | :--- | :---: |
| **Tỷ lệ đối chiếu `Meliodas` & `Sir Vaelen`** | `Meliodas BK V2`: `~45 wpx` (`64×64 @ 1.50`); `Sir Vaelen`: `~47 wpx` (`64×64 @ 1.00`); **`Sir Roderick Prototype`: `46–48 px` (`64×64 @ 1.00`)** — khớp đều hàng ngang trên cùng baseline `y = 210`; `Heavy_Knight_Free` Side-View (`~60 px`) bị loại khỏi drop-in. | **PASS** |
| **Độ ổn định Anchor `(0.5, 1.0)`** | Kiểm tra `16/16` frame trong sheet: `frame_bottom_ys = [60]` đồng nhất 100%, `0 px` lệch chân; trong Phaser Sandbox: `originX = 0.5, originY = 1` không đổi trên cả 4 hướng. | **PASS** |
| **Không mờ pixel & Không nhảy scale (`WASD`)** | Render `Phaser.CANVAS` (`pixelArt: true, roundPixels: true, antialias: false`); di chuyển `S/W/A/D` kích hoạt đúng `rod_down/rod_up/rod_left/rod_right`, `scaleX = 1, scaleY = 1` xuyên suốt, **`console_errors = []`**. | **PASS** |
| **Chất lượng mỹ thuật bước tiếp theo** | Bản sprite hiện tại đóng vai trò **nguyên mẫu khối tỷ lệ (`proportional top-down blockout proxy`)** phục vụ kiểm định tỷ lệ/bảng màu/sandbox; bước `TASK-B02` sẽ vẽ tay chi tiết shading cuối cùng khớp nét với `Meliodas BK V2` / `Vaelen` sau khi Owner duyệt. | **PENDING `TASK-B02`** |

---

## 4. Hard Stop
- **Chưa đưa vào production game:** `0` chỉnh sửa `src/`, `public/assets/`, `dialogues.json`, `WildlifeSystem.ts` hay `EvilKnights.ts`.
- **Không** tự đặt số phận, vị trí zone hay vai trò boss cho `Sir Roderick`, **không** xóa tài nguyên gốc, **không** commit/push. Chờ **Owner** duyệt thiết kế & ký `DEC-LOCK-13` trước khi sang bước hoàn thiện pixel art `TASK-B02`.