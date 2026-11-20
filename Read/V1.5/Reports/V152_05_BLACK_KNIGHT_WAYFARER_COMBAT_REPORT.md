# BÁO CÁO HOÀN THÀNH BƯỚC V152-05: TRÍCH XUẤT BLACK KNIGHT WAYFARER 4 HƯỚNG & TÍCH HỢP HỆ THỐNG CHIẾN ĐẤU

**Dự án:** HOLLOW WOODS v1.5.2 (`G:\HOLLOW WOODS`)  
**Mã bước:** `V152-05`  
**Ngày thực hiện:** 20/11/2026  
**Thư mục sao lưu:** `Backups/steps/backup_v152_05/`  

---

## 1. THÔNG SỐ GÓI ASSET GỐC (`Read me.txt` & All_In_One)

### 1.1. Thông tin từ `Pixel_Art\Black Knight\Read me.txt`
- **Tác giả:** [Fellor] (https://fellor.itch.io/)
- **Phiên bản:** Version 1.0 (Phát hành: 2025-09-22 / Unity: 2026-07-08)
- **Giấy phép:** Miễn phí sử dụng cho cả mục đích cá nhân và thương mại (Free for personal & commercial use).
- **Quy mô:** Gồm 34 hoạt ảnh hiệp sĩ (34 animations for a knight), định dạng Sprite Sheets (PNG) & Preview GIFs.

### 1.2. Cấu trúc lưới Bit-Exact của `Black_Knight_All_In_One_New.png`
- **Kích thước ảnh tổng:** $2592 \times 1152\text{ px}$.
- **Cấu trúc lưới:** $18\text{ cột} \times 18\text{ hàng} = 324\text{ ô}$ (Cell $0 \dots 323$).
- **Kích thước 1 frame gốc:** $144 \times 64\text{ px}$ (Nội dung sprite nằm trong $142 \times 62\text{ px}$, bao bọc bởi 1px viền màu).
- **Điểm neo chân:** Chân nhân vật tiếp đất tại $y = 61 \dots 62\text{ px}$ (ngay trên viền đáy $y = 63$), tương thích tuyệt đối với `originY = 1.0`.
- **Phân bổ 16 nhóm hoạt ảnh:**
  1. Cells 0..31 (32 frames): `BK_weapon_on-off` (Rút & tra kiếm)
  2. Cells 32..37 (6 frames): `BK_weapon_idle` (Nghỉ cầm kiếm)
  3. Cells 38..43 (6 frames): `BK_unarmed_idle` (Nghỉ tay không)
  4. Cells 44..83 (40 frames): `BK_heavy_attack` (Trọng kích 3 đòn liên hoàn)
  5. Cells 84..123 (40 frames): `BK_light_attack` (Chém nhanh 4 combo)
  6. Cells 124..135 (12 frames): `BK_weapon_roll` (Lăn né có vũ khí)
  7. Cells 136..147 (12 frames): `BK_unarmed_roll` (Lăn né tay không)
  8. Cells 148..159 (12 frames): `BK_unarmed_run` (Chạy tay không)
  9. Cells 160..171 (12 frames): `BK_weapon_run` (Chạy cầm vũ khí)
  10. Cells 172..196 (25 frames): `BK_unarmed_jump`
  11. Cells 197..221 (25 frames): `BK_weapon_jump`
  12. Cells 222..256 (35 frames): `BK_weapon_art` (Tuyệt kỹ kiếm khí AoE)
  13. Cells 257..280 (24 frames): `BK_parry` (Đỡ đòn & phản công)
  14. Cells 281..299 (19 frames): `BK_hurt` (281..287) & `BK_death` (288..299)
  15. Cells 300..311 (12 frames): `BK_unarmed_buff` (Cúi quỳ / nhặt đồ)
  16. Cells 312..323 (12 frames): `BK_weapon_buff` (Niệm ấn Tinh Thần / Vòng Sáng)

---

## 2. XUẤT 18 SPRITESHEET CHUẨN 4 HƯỚNG & DYNAMIC REACH FRAMING

### 2.1. Giải pháp chống cắt cụt mũi kiếm (Dynamic Weapon Reach Framing)
- **Vấn đề bản cũ:** Khung hình Phaser là $64 \times 64\text{ px}$. Khi hiệp sĩ vung kiếm chém, mũi kiếm vươn sang phải tới $x = 112 \dots 115\text{ px}$. Bản cũ crop cố định tâm khiến mũi kiếm chạm mép và bị xén đứt 12px.
- **Giải pháp:** Áp dụng Dynamic Reach Framing trong `scripts/extract_black_knight_wayfarer.mjs`:
  + Quét biên độ `maxX` của mũi kiếm thật. Nếu $maxX > 102$, cửa sổ crop tự động dịch chuyển để giữ trọn vẹn $100\%$ các pixel mũi kiếm (kết thúc tại $dx = 62 \dots 63$), bảo toàn nguyên vẹn 32/32 pixel mũi kiếm bit-exact mà không làm méo hình.
  + Hàng 2 (LEFT): Lật ngang chuẩn tâm từ Hàng 3 (RIGHT).
  + Hàng 0 (DOWN) & Hàng 1 (UP):
    - Động tác cơ bản (`idle`, `walk`, `run`, `unarmed_idle`, `unarmed_run`): Dùng biến thể pixel art trực diện (giáp ngực & khe mắt vàng cho DOWN; áo choàng phủ lưng than chì cho UP).
    - Kỹ năng chiến đấu phức tạp: Giữ 100% nét họa sĩ gốc, tích hợp Directional Slash Arc VFX hướng lên cho UP và hướng xuống cho DOWN.
- **Cờ cấu hình:** Đã thêm `export const WAYFARER_USE_PURE_ARTIST_SPRITES = false;` trong `src/config/Constants.ts`.

### 2.2. Danh mục 18 Spritesheets vật lý (`public/assets/characters/mossbound_wayfarer/`)
| # | Tên file | Kích thước | Số frame/hướng | Mô tả |
|---|---|---|---|---|
| 1 | `wayfarer_idle.png` | $256 \times 256\text{ px}$ | 4 frames $\times$ 4 rows | Nghỉ có vũ khí |
| 2 | `wayfarer_walk.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Đi bộ thư thái |
| 3 | `wayfarer_run.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Chạy có vũ khí |
| 4 | `wayfarer_hurt.png` | $192 \times 256\text{ px}$ | 3 frames $\times$ 4 rows | Trúng đòn giật lùi |
| 5 | `wayfarer_death.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Gục ngã tiếp đất |
| 6 | `wayfarer_interact.png` | $256 \times 256\text{ px}$ | 4 frames $\times$ 4 rows | Cử chỉ tương tác |
| 7 | `wayfarer_gather.png` | $256 \times 256\text{ px}$ | 4 frames $\times$ 4 rows | Cúi gập hái thảo mộc |
| 8 | `wayfarer_use_item.png` | $256 \times 256\text{ px}$ | 4 frames $\times$ 4 rows | Dùng bình dược phẩm |
| 9 | `wayfarer_attack.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Đòn đánh nhanh (Light Attack) |
| 10 | `wayfarer_unarmed_idle.png` | $256 \times 256\text{ px}$ | 4 frames $\times$ 4 rows | Nghỉ tay không |
| 11 | `wayfarer_unarmed_run.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Chạy tay không |
| 12 | `wayfarer_heavy_attack.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Đòn Trọng Kích bổ phá poise |
| 13 | `wayfarer_weapon_art.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Tuyệt kỹ kiếm khí AoE |
| 14 | `wayfarer_parry.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Giương kiếm đỡ đòn |
| 15 | `wayfarer_roll.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Lăn né có vũ khí |
| 16 | `wayfarer_unarmed_roll.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Lăn né tay không |
| 17 | `wayfarer_buff.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Niệm ấn Vòng Sáng / Tinh Thần |
| 18 | `wayfarer_weapon_toggle.png` | $384 \times 256\text{ px}$ | 6 frames $\times$ 4 rows | Động tác rút / tra kiếm |

- **Ảnh xem trước 4 hướng:** Lưu tại `Backups/steps/backup_v152_05/preview_wayfarer_4dir.png` ($384 \times 1024\text{ px}$).

---

## 3. BẢNG ĐIỀU KHIỂN CHIẾN ĐẤU & KỸ NĂNG V1.5.2

| Hành động | Phím bấm điều khiển | Chi phí Thể Lực (STA) | Thời gian hồi (Cooldown) | Hiệu ứng đặc biệt |
|---|---|---|---|---|
| **Light Attack** | **Chuột trái** / `Space` | **8 STA** | **0.35s** (350ms) | Chém nhanh, tự rút kiếm nếu đang tra kiếm |
| **Heavy Attack** | **Chuột phải** / `K` | **20 STA** | **1.2s** (1200ms) | Gồng chém phá poise Hiệp Sĩ Sa Ngã; chặn `contextmenu` mặc định |
| **Weapon Art** | `R` | **35 STA** | **5.0s** (5000ms) | Bão kiếm khí AoE bán kính 96px, đẩy lùi mạnh + làm choáng 2.0s |
| **Parry** | `V` | **12 STA** | **1.5s** (1500ms) | Cửa sổ i-frame đỡ đòn 0.45s; làm choáng quái cận chiến, phát keng kim loại |
| **Roll** | `Ctrl` / `Z` | **18 STA** | **0.9s** (900ms) | Lăn né lướt nhanh 220px/s, i-frame né 100% sát thương trong 0.35s |
| **Vòng Sáng** | `F` | **10 STA** | 0.18s debounce | Kích hoạt vòng sáng bảo hộ, chạy anim `wayfarer_buff` |
| **Rút / Tra kiếm** | `X` (thủ công) hoặc **Tự động** | 0 | 0.4s | Tự tra kiếm ở vùng an toàn (Làng, Nông Trại, Trạm Lửa Sir Vaelen), tự rút khi vào rừng/combat |

---

## 4. KẾT QUẢ KIỂM THỬ HỆ THỐNG

1. **`npx tsc --noEmit`:** **PASS 100%**, 0 lỗi cú pháp hay kiểu dữ liệu TypeScript Strict.
2. **`npm run build` (Vite 5.4):** **PASS 100%**, build thành công bundle production trong 11.24s.
3. **`node scripts/verify_zero_404_assets.mjs`:** **180/180 PASS**, không thiếu bất kỳ asset nào (Zero 404).
4. **`node scripts/audit_map_reachability_and_assets.mjs`:** **73/73 PASS (100%)**, toàn bộ 18 phân khu thông suốt, 100% spritesheet đạt chuẩn.
5. **`node scripts/test_v152_05_black_knight_combat.mjs`:** **67/67 PASS (100%)**, xác nhận đầy đủ 18 sheets, các phím bấm, hàm chiến đấu và animation 4 hướng.
