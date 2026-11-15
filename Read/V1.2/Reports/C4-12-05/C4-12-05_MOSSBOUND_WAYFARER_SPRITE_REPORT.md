# HOLLOW WOODS V1.2 — BÁO CÁO NGHIỆM THU TÀI NGUYÊN C4-12-05
## COMMAND C4-12-05 — THE MOSSBOUND WAYFARER ORIGINAL PIXEL ART SPRITE SUITE

- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu*)
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Thư mục tài nguyên nhân vật mới:** [public/assets/characters/mossbound_wayfarer/](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer)
- **Phạm vi thực hiện:** Chỉ tạo tài nguyên ảnh gốc, bảng preview, file manifest và script QC (chưa tích hợp vào `GameScene.ts` hay sửa code gameplay để dành cho bước `C4-12-06`; toàn bộ tài nguyên `satyr_*` cũ được giữ nguyên 100%).

---

## 1. THÔNG SỐ CHUẨN & THIẾT KẾ NHÂN VẬT

- **Nhân vật:** **The Mossbound Wayfarer** (*Lữ Khách Rêu Phong*) — bám sát bảng concept đính kèm và định hướng **Visual Direction A — Dark Woodland Pixel Art**.
- **Kích thước ô Frame chuẩn:** `64 × 64 px` (RGBA 32-bit, nền trong suốt hoàn toàn `alpha = 0`, nét pixel sắc gọn `nearest-neighbor`).
- **Tỷ lệ hiển thị cơ thể:** Chiều cao đứng `30 px` (`y = 29..58`), lớn gấp `1.58×` so với sprite Satyr cũ (`19 px`, `y = 40..58`), nổi bật rõ ràng trên nền gạch đá và thảm cỏ rừng khi camera zoom `2.2×`.
- **Điểm neo bàn chân (Foot Anchor):** Khóa cố định tại **`x = 32, y = 58`** (`originX = 0.5`, `originY = 0.90625`) đồng nhất trên tất cả **172 frames** của cả 9 bộ hoạt ảnh.
- **Thứ tự 4 hàng hướng chuẩn:**
  - **Hàng 0 (`Row 0`):** `DOWN` (Nhìn xuống / Mặt trước)
  - **Hàng 1 (`Row 1`):** `UP` (Nhìn lên / Mặt sau)
  - **Hàng 2 (`Row 2`):** `LEFT` (Nhìn sang trái)
  - **Hàng 3 (`Row 3`):** `RIGHT` (Nhìn sang phải — vẽ bất đối xứng thật, không lật gương đơn giản)

---

## 2. DANH MỤC 9 FILE SPRITE SHEET, MANIFEST & PREVIEW ĐÃ TẠO

| STT | Tên File | Đường dẫn | Kích thước (px) | Số hướng × Frame | Tổng Frame | FPS gợi ý | Loop |
| :-: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `wayfarer_idle.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_idle.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_idle.png) | `256 × 256` | `4 × 4` | `16` | `6` | `true` |
| 2 | `wayfarer_walk.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_walk.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_walk.png) | `384 × 256` | `4 × 6` | `24` | `10` | `true` |
| 3 | `wayfarer_run.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_run.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_run.png) | `384 × 256` | `4 × 6` | `24` | `14` | `true` |
| 4 | `wayfarer_attack.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_attack.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_attack.png) | `384 × 256` | `4 × 6` | `24` | `12` | `false` |
| 5 | `wayfarer_hurt.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_hurt.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_hurt.png) | `192 × 256` | `4 × 3` | `12` | `8` | `false` |
| 6 | `wayfarer_death.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_death.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_death.png) | `384 × 256` | `4 × 6` | `24` | `8` | `false` |
| 7 | `wayfarer_interact.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_interact.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_interact.png) | `256 × 256` | `4 × 4` | `16` | `8` | `false` |
| 8 | `wayfarer_gather.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_gather.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_gather.png) | `256 × 256` | `4 × 4` | `16` | `8` | `false` |
| 9 | `wayfarer_use_item.png` | [public/assets/characters/mossbound_wayfarer/wayfarer_use_item.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_use_item.png) | `256 × 256` | `4 × 4` | `16` | `8` | `false` |
| — | **Tổng cộng 9 bộ** | — | — | **36 hoạt ảnh** | **172 frames** | — | — |

### File Manifest & Bảng Preview Tổng Hợp:
- **Animation Manifest:** [wayfarer_animation_manifest.json](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_animation_manifest.json)
  - Chứa đầy đủ thông số `frameCell` (`64×64`, `footAnchor: { x: 32, y: 58 }`), ánh xạ 4 hàng hướng `["DOWN", "UP", "LEFT", "RIGHT"]`, và danh sách 36 animation keys (`wayfarer_<action>_<dir>`) kèm mảng chỉ số frame, `fps`, `loop` (`death` đặt `loop: false`, `phaserRepeat: 0`).
- **Bảng Ảnh Preview Tổng Hợp:** [wayfarer_sprite_preview.png](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_sprite_preview.png) (`1248 × 876 px`)
  - Ghép trực quan cả 9 bảng hoạt ảnh theo bố cục lưới `3 × 3` bảng, hiển thị rõ từng ô `64×64` và vạch chuẩn điểm neo bàn chân `y = 58`.

---

## 3. KẾT QUẢ KIỂM ĐỊNH CHẤT LƯỢNG TỰ ĐỘNG (PNGJS QUALITY CONTROL)

Script kiểm định tự động [verify_c4_12_05_wayfarer_qc.mjs](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/verify_c4_12_05_wayfarer_qc.mjs) sử dụng thư viện `pngjs` đã quét toàn bộ **172/172 frames** trên cả 9 file PNG:

- **Nền RGBA trong suốt (`RGBA_BG`):** `PASS` (`100%` các ô có nền RGBA trong suốt, 4 góc mỗi ô đều `alpha = 0`).
- **Đồng nhất kích thước ô (`64×64 px`):** `PASS` (`9/9` file khớp tuyệt đối bội số `64×64`).
- **Không có frame rỗng (`Empty Frames`):** `0` frame rỗng trên tổng số `172` frames.
- **Không tràn hoặc cắt lẹm mép ô (`Border Bleed / Clipping`):** `0` pixel chạm dải biên an toàn `2 px` (`x <= 1`, `x >= 62`, `y <= 1`, `y >= 62`) trên toàn bộ `172` frames.
- **Khóa điểm tựa bàn chân (`Foot Anchor y = 58`):** `LOCKED` (`0` frame lệch điểm tựa trên toàn bộ `172` frames).

---

## 4. GHI CHÚ CHUẨN BỊ CHO BƯỚC C4-12-06 (RUNTIME INTEGRATION)

1. **Nạp tài nguyên trong `PreloadScene.ts`:**
   - Có thể nạp trực tiếp 9 bảng spritesheet theo manifest [wayfarer_animation_manifest.json](file:///G:/HOLLOW%20WOODS/public/assets/characters/mossbound_wayfarer/wayfarer_animation_manifest.json) với `frameWidth: 64, frameHeight: 64`.
2. **Tương thích vật lý & Y-Sorting trong `SatyrPlayer.ts`:**
   - Do điểm neo bàn chân `(32, 58)` của **The Mossbound Wayfarer** trùng khớp hoàn toàn với chuẩn `SATYR_ORIGIN_X = 0.5, SATYR_ORIGIN_Y = 0.90` và hộp va chạm chân `14 × 8 px` (`offset: 25, 52`), việc chuyển đổi sang Wayfarer ở bước `C4-12-06` sẽ giữ nguyên 100% độ chính xác va chạm và Y-sorting với toàn bộ công trình làng Bellhollow.
