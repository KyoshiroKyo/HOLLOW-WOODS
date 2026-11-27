# HW-CODEX-01A · Armed Idle Down

**Sẵn sàng để Owner duyệt artwork · 27/11/2026**
Baseline đã nghiệm thu `bb13cae254103c98be1e67186f3ed6909aa2e4f8`. Phạm vi là 6 frame Armed Idle hướng Down của Meliodas Black Knight V2. [BUG-059 Artwork Readiness](../HW-CODEX-00-R1/03_MELODIAS_ARTWORK_READINESS.md) · [B01](../../V16/HW_V16_B01_BUG058_SCALE_REPORT.md) · [B02](../../V16/HW_V16_B02_BUG059_ARTWORK_REPORT.md)

Pilot giữ lưỡi kiếm cong màu hổ phách, plume đỏ, giáp tầng, khe chữ T tối và áo choàng rách. Chân, kiếm và tay cầm giữ cùng cụm pixel xuyên suốt. Chuyển động nằm ở plume, vài cụm sáng trên giáp vai và mép áo choàng. Bản pilot có mũ và giáp vai sáng hơn đôi chút so với pose Run F00, với hai chân đặt nền theo Armed Idle hiện hành. Owner có thể kiểm khác biệt này trên ba nhóm ở cùng đường nền. [Bảng so sánh A/B/C](04_IDLE_RUN_COMPARISON.png) · [GIF 6 frame](03_ARMED_IDLE_DOWN_PREVIEW.gif)

| Nhóm Down | Ô | Alpha đục/frame | Chiều cao hình | Pivot · ground Y | Scale × camera |
|---|---|---:|---:|---|---|
| A · Armed Idle hiện hành | 64×64 | 375–407 | 28–31 px | (0.5, 1.0) · 64 | 1.50 × 2.2 |
| B · Armed Idle Pilot | 84×72 | 739–760 | 37–40 px | (0.5, 0.875) · 63 | 1.15 × 2.2 |
| C · Conversion Run hiện hành | 84×72 | 597–684 | 36–41 px | (0.5, 0.875) · 63 | 1.14 × 2.2 |

Chỉ F02 và F03 chạm mốc 40 px trong dải mục tiêu 40–44 px. Bốn frame còn lại cao 37–38 px. Chiều cao tính trong world của pilot là 42,55–46,00 px ở scale ứng viên 1,15. Conversion Run Down là 41,04–46,74 px ở scale hiện hành. Giữ kích thước nguyên gốc của cụm pixel để bảo toàn tỷ lệ vào pose Idle và đặt chân tại cùng đường nền. Dải 739–760 texel nằm trong mục tiêu 650–800. [Số đo tất cả 24 frame](05_FRAME_METRICS.json)

## Kiểm tra pilot

- PNG RGBA 504×72 chứa sáu ô 84×72 liền nhau. Sáu hash RGBA khác nhau. Mỗi frame có một vùng alpha liên thông, biên alpha 0/255 và 0 texel dư chroma theo phép dò trên màu pixel.
- Cả sáu frame có pivot `(0.5, 0.875)`, neo `(42, 63)` và hàng pixel đục thấp nhất ở Y=62. Hash vùng chân và vùng lưỡi kiếm/tay cầm lần lượt trùng qua cả sáu frame.
- GIF giải mã được 6 frame, mỗi frame 160 ms, một vòng 960 ms và lặp vô hạn. Chuyển F05 → F00 đổi 18 texel RGBA, trong đó 4 texel đổi alpha. Độ trùng silhouette ở điểm lặp là 99,5%.
- Kiểm native 1×, nearest-neighbor 4× và tỉ lệ chiếu tĩnh `scale ứng viên × 2.2`. Bảng review dựng từ sprite PNG ngoài game. Runtime chưa được tích hợp pilot. [Sprite sheet](01_ARMED_IDLE_DOWN_PILOT.png) · [Contact sheet](02_ARMED_IDLE_DOWN_CONTACT_SHEET.png)
- TypeScript và Vite build được chạy theo quy tắc repository. Diff bàn giao giới hạn trong thư mục review `HW-CODEX-01A`. [Nguồn và quyền sử dụng](06_PROVENANCE_AND_LICENSE.md) · [Manifest](SHA256SUMS.txt)

## Quyết định của Owner

- **APPROVE ARTWORK PILOT** · Chấp nhận hướng artwork pilot để lập lượt sản xuất 90 frame còn lại, đưa tổng số frame của BUG-059 lên 96.
- **REQUEST ARTWORK REFINEMENT** · Chỉ định điểm cần chỉnh ở pilot, chẳng hạn mũ/giáp vai hoặc biên độ plume trong vòng Idle.
