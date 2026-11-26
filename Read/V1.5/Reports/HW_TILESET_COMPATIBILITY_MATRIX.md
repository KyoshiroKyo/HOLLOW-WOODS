# BẢNG ĐỐI CHIẾU ĐỘ TƯƠNG THÍCH CÁC BỘ TILESET (HW-ASSET-03)
**DỰ ÁN:** HOLLOW WOODS — WORLD RECONSTRUCTION 2.0  
**NGÀY THỰC HIỆN:** 2026-11-26  

---

| Bộ tài nguyên (Asset Pack) | Tile Size | Định dạng | Góc nhìn | Tương thích Phaser 4 | Tệp Bản đồ TMX / TMJ | Khu vực đề xuất sử dụng | Đánh giá mỹ thuật & Độ ưu tiên |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Resurrected RPG 1.1 (Immunity)** | 32×32 | PNG + Aseprite | Top-Down 45° | **HOÀN HẢO** | Cần dựng Tiled | **Outer Woods & Deep Forest** | **ƯU TIÊN 1 (Chủ đạo):** Cực kỳ ăn khớp với Black Knight & Trailer V12.2. |
| **EPIC RPG World - Ancient Ruins** | 32×32 | PNG + TMX | Top-Down 45° | **HOÀN HẢO** | Có sẵn (5 tệp TMX/TSX) | **Ancient Stone Bridge & Glade** | **ƯU TIÊN 2:** Có sẵn map Tiled hoàn chỉnh, nhiều di tích đá đổ nát đẹp mắt. |
| **EPIC RPG World - Grass Land 2.0** | 32×32 | PNG + TMX | Top-Down 45° | **HOÀN HẢO** | Có sẵn (2 tệp TMX/TSX) | **Verdant Crossroad & Trade Route** | **ƯU TIÊN 2:** Bãi cỏ xanh tự nhiên, lối mòn rộng rãi, không cản trở di chuyển. |
| **Serene Village Revamped v1.9** | 32×32 | PNG | Top-Down 45° | **TỐT** | Cần dựng Tiled | **Bellhollow Hamlet (Safe Zone)** | **ƯU TIÊN 1 cho Làng:** Nhà cửa, hàng rào gỗ, giếng nước, chậu hoa thanh bình. |
| **Houses Pack** | 32×32 / 48×48 | PNG | Top-Down | **TỐT** | Cần dựng Tiled | **Bellhollow & Forgotten Farmstead** | **ƯU TIÊN 2:** Kiến trúc nhà tranh, mái ngói cổ kính thời Trung cổ. |
| **DarkFantasy FREE Starter** | 32×32 | PNG + TMX | Top-Down 45° | **HOÀN HẢO** | Có sẵn (2 tệp TMX) | **Deep Hollow Sanctuary & Crypt** | **ƯU TIÊN 2:** Tông màu tối ma mị, tượng đá quái dị, bàn thờ cổ. |
| **RF Catacombs v1.0** | 32×32 | PNG | Top-Down | **TỐT** | Cần dựng Tiled | **Forgotten Crypt Entrance & Hầm mộ** | **ƯU TIÊN 1 cho Dungeon:** Tường gạch hầm mộ, đuốc, đầu lâu, bậc thang đá. |
| **Dead Swamp** | 32×32 | PNG | Top-Down | **TỐT** | Cần dựng Tiled | **Silent Mire & Mire Basin (Boss)** | **ƯU TIÊN 1 cho Đầm lầy:** Nước bùn đặc, rêu phong, cây khô héo mục nát. |
| **Mangrove Swamp Sampler** | 32×32 | PNG | Top-Down | **TỐT** | Cần dựng Tiled | **Silent Mire - North** | **ƯU TIÊN 2:** Cây đước rễ chùm mọc ngập nước, dây leo. |
| **Kauzz Cave Tiles & RPGW Caves** | 32×32 | PNG | Top-Down | **TỐT** | Cần dựng Tiled | **Hang đá ngầm & Abyssal Chasm** | **ƯU TIÊN 2:** Thạch nhũ, hang tối, vực thẳm đá nham nhở. |
| **TF DarkDimension & Updated** | 32×32 | PNG | Top-Down | **KHÁ** | Cần dựng Tiled | **Abyssal Gate & Void World** | **ƯU TIÊN 3:** Chiều không gian dị giới màu tím thẫm ma mị. |
| **Pocket Inventory Series #2 Pixel Map**| Vector/PNG | PNG Spritesheet | UI Giao diện | **HOÀN HẢO** | Hệ thống icon UI | **Toàn bộ hệ thống World Map [M]** | **ƯU TIÊN TUYỆT ĐỐI cho UI:** Bản đồ cuộn da dê, ghim địa danh, la bàn. |

---

## TỔNG KẾT NGUYÊN TẮC PHỐI CẢNH 2.0
1. **Quy chuẩn tỷ lệ:** 100% sử dụng lưới **`32×32 px`** làm tiêu chuẩn sàn và collider.
2. **Chiều sâu hiển thị (Y-sorting):** Các gốc cây cổ thụ từ `Resurrected RPG` cao từ 128px đến 256px phải đặt origin tại chân gốc cây `(0.5, 0.95)` để nhân vật Black Knight có thể đi lướt phía trước hoặc khuất sau tán cây mượt mà.
3. **Phân tách vùng mỹ thuật rõ ràng:** Không trộn các gam màu đối lập; giữ màu ấm vàng ở Bellhollow, chuyển dần sang sương lam trầm ở Outer Woods, rêu xanh đen ở Silent Mire và tím huyền bí ở Cổng Abyssal.
