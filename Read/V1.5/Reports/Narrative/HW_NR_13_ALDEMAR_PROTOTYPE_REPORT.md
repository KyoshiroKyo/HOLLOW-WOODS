# HW-NR-13 — SIR ALDEMAR CHARACTER PROTOTYPE REPORT

- **Mission ID:** `HW-NR-13 — SIR ALDEMAR CHARACTER PROTOTYPE`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Dependencies:** `APPROVED CHARACTER BIBLE` ([CHARACTER_REGISTRY.md §1 CHAR-005](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md)) + `00F ASSET EVALUATION` ([HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md)) + `DEC-LOCK-13` ([HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md))
- **Mode:** **`SANDBOX PROTOTYPE ONLY` (`HARD STOP` — Không tự tạo quest, không thêm NPC vào map production, không tự quyết định Aldemar biết bí mật nào hay xuất hiện ở đâu)**

---

## 1. Hồ Sơ Nhân Vật, Lựa Chọn Asset & Xác Minh Giấy Phép

1. **Hồ sơ Canon (`CHAR-005` — `Sir Aldemar, The Ashen Knight`):**
   - Đã tiếp nhận hướng nhân vật (`ACCEPTED CHARACTER` tại `Ch. 05 / CHAR-K03`): *Người gìn giữ di vật và ký ức*; giáp xám tro / đồng cũ cổ kính, sắc xanh xám trầm. Quan hệ trực tiếp với `Meliodas`, địa điểm xuất hiện (`di tích / hầm mộ`), quest và bí mật giữ mở hoàn toàn chờ Owner ký `DEC-LOCK-13`.
2. **Đánh giá ứng viên từ kho `00F` (`HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Knights/`):**
   - **Ứng viên tham chiếu được chọn:** **`Maxime_Nourry_Knight`** (`Knight.zip`).
     - *Giấy phép (`License.txt`):* **VERIFIED OK** — cho phép dùng trong dự án thương mại/cá nhân và chỉnh sửa tự do (cấm repackage/resale; credit tùy chọn `Maxime Nourry`).
     - *Đặc điểm kỹ thuật (`CONTACT_SHEET_MAXIME_NOURRY_KNIGHT.png`):* Cell `90×90 px`, `body_h = ~44 px`, có cả dáng **nghỉ ngồi (`knight-rest_sheet.png`)** và uống thuốc (`knight-drink_sheet.png`) rất hợp vai trò *Người Giữ Di Vật*. Tuy nhiên pack gốc là **Side-View Only** (chỉ nhìn phải) nên **không dùng trực tiếp** cho game top-down 4 hướng, mà dùng làm nguồn tham chiếu tạo hình cho nguyên mẫu Top-Down `3/4` 4 hướng + tư thế ngồi `Rest/Relic`.

---

## 2. Bản Sắc Tạo Hình *The Ashen Knight*, Bảng Màu & Bộ Animation Dự Kiến

- **Bảng màu & Nhận diện riêng (tách biệt rõ khỏi `Meliodas`, `Vaelen`, `Mordric`, `Roderick`):**
  - **Giáp xám tro phong hóa (`Weathered Ash Steel`):** Shadow `#32363A` / Base `#62686E` / Edge `#969DA2` / Frosted Rim `#BDC4C7`.
  - **Áo choàng rách xám-lam cổ (`Slate-Teal Cloak`):** `#2A3B3D` / `#485E60` / `#728A8B` *(lạnh trầm, phân tách hoàn toàn với đỏ thẫm của Roderick và vàng ấm của Vaelen)*.
  - **Đồng cũ & Di vật (`Relic Verdigris Bronze`):** `#5E5438` / `#8C7D54` / `#B5A472` cho **khiên tròn khắc ấn đồng cũ**, đai chéo di vật, **cuộn giấy da `#D6C8A2` giắt hông**, và **mũ `Sallet` viền đồng không cắm lông**.
- **Bộ Animation dự kiến theo vai trò *Người Giữ Di Vật / Rest NPC*:**
  - Row `0–3`: **`idle / walk` 4 hướng (`down`, `up`, `left`, `right`)**, `64×64 px`, `43–45 px` thân, `origin (0.5, 1.0)`.
  - Row `4`: **`rest_relic`** (`4f @ ~250ms` — dáng ngồi dựa khiên tròn mở cuộn giấy di vật, kế thừa cảm hứng `knight-rest_sheet.png`), đáy chân cố định tại **`y = 60` (`0 px` tụt/trôi điểm neo khi chuyển từ đứng sang ngồi)**.

---

## 3. Bằng Chứng Nguyên Mẫu (`Contact Sheet`, `Animation Preview` & `4-Knight Sandbox`)

- **Sprite & Portrait Prototype *(cô lập hoàn toàn ngoài `src/` & `public/assets/`)*:**
  - [aldemar_topdown_prototype_sheet.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Prototypes/Sir_Aldemar/aldemar_topdown_prototype_sheet.png) (`256×320` RGBA8888, `5` hàng × `4` cột `64×64`)
  - [aldemar_portrait_64x64.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Prototypes/Sir_Aldemar/aldemar_portrait_64x64.png) (`64×64` Portrait)
- **Contact Sheet, Animated GIF Preview & 4-Knight Scale Comparison (`Read/V1.5/Reports/Visuals/HW-NR-13/`):**
  - 🖼️ [ALDEMAR_PROTOTYPE_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-13/ALDEMAR_PROTOTYPE_CONTACT_SHEET.png)
  - 🎞️ [ALDEMAR_ANIMATION_PREVIEW.gif](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-13/ALDEMAR_ANIMATION_PREVIEW.gif) (`10,098` bytes, 20 frames @ `220ms`, phóng `2×` *nearest-neighbor*)
  - 🖼️ [KNIGHT_ORDER_4_COMPARISON.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-13/KNIGHT_ORDER_4_COMPARISON.png)
  - 🖼️ [KNIGHT_VISUAL_SANDBOX_4_KNIGHTS.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-13/KNIGHT_VISUAL_SANDBOX_4_KNIGHTS.png)
- **Sandbox Phaser `4.2.1` Độc Lập (`4` Kỵ Sĩ cùng sân khấu):**
  - [LAB_02_KNIGHT_VISUAL_SANDBOX](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_02_KNIGHT_VISUAL_SANDBOX/index.html) (`Meliodas`, `Sir Vaelen`, `Sir Roderick`, `Sir Aldemar` + phím `WASD` & phím `[R]` bật/tắt dáng ngồi `ald_rest`).

### Kết Quả Kiểm Chứng Thực Tế (`Chromium Headless QA` & `Pillow Metrics`)
| Chỉ tiêu kiểm tra | Số liệu đo thực tế | Kết quả |
| :--- | :--- | :---: |
| **Góc nhìn, `origin`, `scale` & Pixel Density** | Canvas `64×64 @ 1.00×` (khớp pixel `1:1` với `Sir Vaelen` & `Sir Roderick` dưới Camera Zoom `2.2×`), `pixelArt: true`, `roundPixels: true`, `origin (0.5, 1.0)`. | **PASS** |
| **Độ ổn định đáy chân (`Standing` & `Rest`)** | `stand_bottom_ys = [60]`, `rest_bottom_ys = [60]` trên `20/20` frames (`0 px` trôi neo khi đi hoặc ngồi nghỉ). | **PASS** |
| **Tỷ lệ 4 Kỵ Sĩ (`Meliodas / Vaelen / Roderick / Aldemar`)** | `Meliodas`: `~45 wpx` (`1.50×`), `Vaelen`: `~47 wpx`, `Roderick`: `~46–48 px`, **`Aldemar`: `43–45 px`** (khớp đều chiều cao `Maxime Nourry Ref ~44 px`). | **PASS** |
| **Điều khiển Sandbox (`WASD` + `[R] Rest`)** | `[R]` chuyển chuẩn sang `'ald_rest'`; `S/W/A/D` chạy chuẩn `'ald_down/up/left/right'` với `scaleX = 1, scaleY = 1`, **`console_errors = []`**. | **PASS** |

*(Lưu ý minh bạch: Spritesheet nguyên mẫu hiện là **proportional top-down blockout proxy** phục vụ kiểm định tỷ lệ, bảng màu, hướng và sandbox; phần vẽ tay chi tiết shading cuối cùng thuộc `TASK-B02` sau khi Owner duyệt `DEC-LOCK-13`.)*

---

## 4. Hard Stop
- **Không** tự quyết định `Sir Aldemar` biết bí mật nào, xuất hiện ở zone nào hay vai trò sống/chết.
- **Không** tự tạo quest, **không** thêm NPC vào map production (`0` sửa đổi `src/` và `public/assets/`), **không** xóa tài nguyên, **không** commit/push. Chờ **Owner** duyệt thiết kế.