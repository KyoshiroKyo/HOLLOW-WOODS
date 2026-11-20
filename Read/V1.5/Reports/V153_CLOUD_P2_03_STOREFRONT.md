# CLOUD-P2-03 — P2Game storefront

**LOCAL PASS · DASHBOARD/HOSTED BLOCKED · 20/11/2026**

| Trường manifest | Tệp đã đối chiếu | Kích thước và nguồn |
|---|---|---|
| `assets.avatar`, `assets.icon` | `media/hollow_woods_avatar.png` | PNG 512×512, crop mũ và ánh lửa Fellor từ `knight_no_text.png`. |
| `assets.cover`, `assets.background` | `media/hollow_woods_black_knight_cover.png` | PNG 1280×720, frame trang bìa từ `Black_Knight_Art_With_Light.gif`. |
| `assets.screenshots` | `media/screen_v153_*.png` | Sáu ảnh runtime 1280×720 theo thứ tự Main Menu, Bellhollow, Outer Woods, Crooked Path, Silent Mire, Crafting. |

Hai manifest đồng nhất với SHA-256 Batch 02. Preview production cục bộ phục vụ manifest và cả tám PNG qua subpath với HTTP 200 và MIME đúng. Đã đối chiếu kích thước, dữ liệu tải qua HTTP và artwork đã duyệt trong Batch 02. [Manifest](../../../p2game.json) · [Avatar](../../../public/media/hollow_woods_avatar.png) · [Cover](../../../public/media/hollow_woods_black_knight_cover.png) · [Ảnh đối chiếu Batch 02](Visuals/V153_BATCH_02/p2game-contact-sheet.png).

Khi nghiệm thu Dashboard, Owner kiểm tra crop của card và banner bằng hai tệp trên, mở hosted preview và đối chiếu thứ tự gallery. Gallery Batch 03 phụ thuộc việc tích hợp và nghiệm thu Black Knight bốn hướng. Người tạo artwork nguồn là Fellor / BitBlast Studio. [License](<../../../Pixel_Art/Black Knight/License.txt>) · [Báo cáo khởi động](V153_P2GAME_BLACK_SCREEN_REPORT.md).
