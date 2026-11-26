# HW-NR-14 — ORIGINAL HEADLESS WARDEN PROTOTYPE REPORT

- **Mission ID:** `HW-NR-14 — ORIGINAL HEADLESS WARDEN PROTOTYPE`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Dependency:** `APPROVED HEADLESS WARDEN ART SPECIFICATION` ([HEADLESS_WARDEN_ASSET_SPECIFICATION.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HEADLESS_WARDEN_ASSET_SPECIFICATION.md) `ART-K01`) + Concept Sheet Owner cung cấp ([Bảng thiết kế Hiệp sĩ Vô diện Hollow Woods.png](file:///G:/HOLLOW%20WOODS/HW/Trailer/B%E1%BA%A3ng%20thi%E1%BA%BFt%20k%E1%BA%BF%20Hi%E1%BB%87p%20s%C4%A9%20V%C3%B4%20di%E1%BB%87n%20Hollow%20Woods.png))
- **Mode:** **`VISUAL PROTOTYPE ONLY` (`HARD STOP` — Không tạo boss runtime, AI, kỹ năng, loot hay quest; `0` sửa đổi `src/` và `public/assets/`)**

---

## 1. Tuân Thủ Nguyên Bản (`ART-K01` & Bảo Vệ Bản Quyền)

- **100% nguyên bản:** Không sao chép hay pixel-trace spritesheet thương mại (`Mattz Art` tiếp tục bị chặn hoàn toàn), và không cắt ghép trực tiếp ảnh minh họa concept thành spritesheet game.
- **Đặc tả thiết kế bám sát Concept Owner:**
  - **Giáp tối màu:** Thép đen-xám `#1B1D21` / `#2B3038` / `#525B66`, cổ giáp khép kín, hoa văn **nhánh cây / rễ cổ bằng đồng mờ `#8A7348` / `#C8963E`** trước ngực.
  - **Áo choàng đỏ rượu (`Crimson Mantle`):** Áo choàng hai tà rách sờn `#3B1219` / `#6B1D29` / `#8F2D3B` bay từ hai cầu vai kỵ sĩ + tấm trùm hông chiến mã viền đồng.
  - **Chiến mã ma thuật (`Armored Warhorse`):** Lông đen `#121418` / `#1E2329`, giáp đầu *chanfron* viền đồng, bóng đổ riêng `L0_Shadow` (`64×18`).
  - **Linh hỏa xanh bạc (`Silvery-Cyan Spectral Flame`):** Tách lớp bán trong suốt `#E5F5EB` / `#8FD0AC` / `#3E6E5D` tại hốc cổ giáp, bờm/đuôi/móng/hốc mắt ngựa và lưỡi đại kiếm.

---

## 2. Phân Tách `3` Lớp Sprite, Master Sheet & Atlas Thử Nghiệm (`128×128` 4 Hướng)

Toàn bộ tài sản nguyên mẫu xuất cô lập tại [HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/):

| Tệp nguyên mẫu (`RGBA8888`, `trimmed: false`) | Kích thước & Cấu trúc | Vai trò kỹ thuật |
| :--- | :---: | :--- |
| [L1_mount_master.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/L1_mount_master.png) | `768×2560` (`6×20` ô `128×128`) | Thân chiến mã, giáp *chanfron*, barding đồng & vải hông đỏ rượu |
| [L2_rider_master.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/L2_rider_master.png) | `768×2560` (`6×20` ô `128×128`) | Kỵ sĩ không đầu, ngực hoa văn rễ đồng, choàng 2 tà đỏ rượu & đại kiếm |
| [L3_spectral_fx_master.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/L3_spectral_fx_master.png) | `768×2560` (`6×20` ô `128×128`) | Overlay linh hỏa xanh bạc *(bật/tắt độc lập cho `Reduced Motion`)* |
| [headless_warden_master_sheet.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/headless_warden_master_sheet.png) | `768×2560` (`94,947` B) | Master sheet gộp `L1+L2+L3` |
| [headless_warden_atlas.json](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/headless_warden_atlas.json) | `38,579` B (`88` frames) | Atlas JSON Hash (`trimmed: false`, `pivot (0.5, 1.0)`) |
| [headless_warden_portrait_64x64.png](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/Characters/Bosses/The_Headless_Warden/headless_warden_portrait_64x64.png) | `64×64` | Portrait giáp vai rễ đồng + linh hỏa cổ |

---

## 3. Bằng Chứng Trực Quan & Kết Quả Kiểm Chứng `Visual Sandbox`

- **Visual Contact Sheet & Animated GIF Preview (`Read/V1.5/Reports/Visuals/HW-NR-14/`):**
  - 🖼️ [HEADLESS_WARDEN_MASTER_CONTACT_SHEET.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14/HEADLESS_WARDEN_MASTER_CONTACT_SHEET.png)
  - 🎞️ [HEADLESS_WARDEN_ANIMATION_PREVIEW.gif](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14/HEADLESS_WARDEN_ANIMATION_PREVIEW.gif) (`70,808` bytes, chu trình `Idle → Walk → Run → Powerup → Disappear` phóng `2×` *nearest-neighbor*)
  - 🖼️ [HEADLESS_WARDEN_SANDBOX_SCREENSHOT.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-14/HEADLESS_WARDEN_SANDBOX_SCREENSHOT.png)
- **Sandbox Phaser `4.2.1` Độc Lập:** [LAB_03_HEADLESS_WARDEN_SANDBOX](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/World_Labs/LAB_03_HEADLESS_WARDEN_SANDBOX/index.html)

### Kết Quả Kiểm Tra Thực Tế (`Chromium Headless QA` & `Atlas Metrics`)
| Hạng mục kiểm định | Kết quả đo thực tế | Trạng thái |
| :--- | :--- | :---: |
| **`5` bộ Animation × `4` Hướng (`down/up/left/right`)** | `88` frames trong atlas: `Idle` (`4f × 4d`), `Walk` (`4f × 4d`), `Run` (`4f × 4d`), `Powerup` (`4f × 4d` kiếm giơ cao + xoáy linh hỏa), `Disappear` (`6f × 4d` đại kiếm cắm đất & tan biến lên trên). Phím `[1..5]` & `[WASD]` chạy khớp 100%. | **PASS** |
| **Phân lớp `L1 / L2 / L3` độc lập** | Phím `[L]` tắt/mở sạch lớp `L3_Spectral_FX` (`off: false → on: true`) mà không làm hỏng silhouette `L1+L2`. | **PASS** |
| **Origin, Kích thước & Tỷ lệ Boss** | Toàn bộ `idle/walk` giữ đáy chân cố định tại **`idle_walk_bottom_ys = [124]`** (`0 px` trôi neo), `origin (0.5, 1.0)`, `scale = 1.00`, dáng đứng uy nghi vượt rõ `Meliodas (~45 wpx)` và `Hooded Knight (~71 wpx)` trên cùng baseline `y = 225`, **`console_errors = []`**. | **PASS** |

*(Lưu ý quy trình: Bộ sprite `128×128` này là **nguyên mẫu khối phân lớp nguyên bản (`layered proportional prototype`)** chứng minh tỷ lệ, hướng top-down `3/4`, phân lớp `L1/L2/L3` và khung animation; khâu vẽ tay tinh chỉnh pixel cuối cùng và đặc tả gameplay boss sẽ chỉ thực hiện sau khi Owner phê duyệt `DEC-LOCK-14`.)*

---

## 4. Hard Stop
- **Chỉ sản xuất prototype hình ảnh ngoài `src/` & `public/assets/`.**
- **Không** tạo boss runtime, AI, kỹ năng, loot hoặc quest; **không** xóa tài nguyên; **không** commit/push. Việc triển khai gameplay đòi hỏi bản đặc tả riêng sau khi Owner phê duyệt `DEC-LOCK-14` ([HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)).