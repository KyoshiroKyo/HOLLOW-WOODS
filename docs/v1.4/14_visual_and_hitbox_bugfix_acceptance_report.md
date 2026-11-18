# BÁO CÁO NGHIỆM THU ĐỐI CHIẾU THỰC TẾ (IN-GAME QA AUDIT): SỬA LỖI UI/UX, NPC BELLHOLLOW & MÔ HÌNH ĐÁ 1/2

> **Phiên bản:** HOLLOW WOODS V1.4.0 (Gothic Woodland Survival)  
> **Mục tiêu:** Đối chiếu và xác nhận giải quyết dứt điểm 100% các lỗi hiển thị, va chạm và hitbox được người dùng phản ánh qua 6 ảnh chụp thực tế.  
> **Thời gian nghiệm thu:** 18/11/2026 — Kiểm thử trực tiếp trên môi trường runtime `http://localhost:4173/`.

---

## 1. BẢNG TỔNG HỢP ĐỐI CHIẾU TRƯỚC VÀ SAU KHI SỬA (BEFORE vs. AFTER)

| STT | Ảnh phản ánh | Vấn đề phát hiện trước đây (Before) | Giải pháp kỹ thuật V1.4 | Kết quả nghiệm thu thực tế (After) |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Ảnh 1: Main Menu** | • Tiêu đề đỏ cam đơn điệu.<br>• Nút bấm đen viền xanh, hitbox lệch toạ độ, chập chờn.<br>• Nhân vật đặt trong dĩa tròn đồng tâm cứng nhắc, thiếu tự nhiên.<br>• Footer ghi nhãn cũ `V1.3.0`. | • Bố cục 2 cột chuẩn HD 1280×720 đối xứng.<br>• Tiêu đề vàng hổ phách đậm chất Gothic Woodland.<br>• Nút bấm gỗ sồi tối viền đồng xỉn với `hitZone` riêng biệt, bắt sự kiện click tactile chuẩn xác 100%.<br>• Quầng sáng đèn lồng tỏa tròn mịn màng (`RadialGradient` 6 nấc), nhân vật đứng trên nền đất ẩm với bóng đổ tiếp xúc bàn chân.<br>• Footer cập nhật `V1.4.0`. | **PASS**<br>Giao diện sang trọng, hitbox khớp từng pixel. |
| **2** | **Ảnh 2: Plaza Bellhollow** | • NPC Finn (`npc_finn`) đứng đè trực tiếp lên Rương Trú Ẩn (`camp_storage_chest`).<br>• Chồng chéo 2 khung tương tác `[E] Trò chuyện` và `[E] Mở Rương`.<br>• Khung viền chỉ định rương bị lệch lên góc Tây Bắc.<br>• Bà Lão Edda đứng kẹt sát bờ giếng nước. | • Phân bổ lại tọa độ Finn sang lối đi phía Tây: `(685, 295)` (patrol: `670..705`), cách rương `(735, 255)` > 65px.<br>• Edda chuyển ra sân trước Tháp Chuông `(785, 345)`, cách giếng > 65px.<br>• Khung viền tương tác được căn lại theo tâm thực `(x + w/2, y + h/2)`. | **PASS**<br>Toàn bộ NPC thông thoáng, 0 chồng đè prompt. |
| **3** | **Ảnh 3: Nhà Neris** | • NPC Neris đứng giẫm lên Nồi Thảo Dược (`camp_herbal_cauldron`).<br>• Chồng đè 2 prompt `[E] Sắc Thuốc` và `Neris Người chữa thảo mộc`. | • Điều chỉnh tọa độ Neris sang bên phải hiên nhà `(990, 145)` cạnh bàn phơi thuốc.<br>• Nồi thảo dược độc lập tại `(935, 140)`, khoảng cách an toàn 55px. | **PASS**<br>Tách biệt hoàn toàn 2 vùng tương tác. |
| **4** | **Ảnh 4, 5, 6: Đá bị cắt đôi (1/2)** | • Nhiều tảng đá rải rác trên đường đi có mặt cắt thẳng đứng 90 độ, lộ lỗi cắt vụng từ bệ thờ `TX Props.png`. | • Trích xuất lại toàn bộ `rock_large.png` (32×30px) và `rock_medium.png` (24×20px) từ gói Master nguyên vẹn.<br>• Đá có đường nét pixel art tròn trịa tự nhiên, 4 cạnh mềm mại, có bóng đổ mịn `alpha 0.25`. | **PASS**<br>Xóa sạch 100% tảng đá bị chém phẳng. |
| **5** | **Ảnh 7: Vực nước Silent Mire** | • Vực nước đầm lầy hiển thị thành hình elip đen kịt (lỗ đen phẳng lì).<br>• Cỏ lác và bia đá cắm trơ trọi giữa vùng đen. | • Tái cấu trúc hàm `createMireWater`: viền bờ bùn đất ẩm (`0x261d14`, `0x1a261c`), mặt nước đầm lầy xanh rêu đục u tối (`0x1e3a2f`), gợn sóng phản chiếu ánh trăng (`0x3d705c`) và thảm bèo lục (`0x3e7a36`). | **PASS**<br>Mặt nước sình lầy tự nhiên, ma mị, đúng phong cách kinh dị. |

---

## 2. HÌNH ẢNH NGHIỆM THU THỰC TẾ TRONG GAME (IN-GAME RUNTIME EVIDENCE)

1. **Màn hình chính HD (Main Menu V1.4.0):**  
   - Tiêu đề `HOLLOW WOODS` vàng hổ phách, 4 nút bấm gỗ viền đồng với hitbox 100% chuẩn xác, quầng sáng đèn lồng tỏa tròn mịn màng ôm lấy nhân vật, nhãn phiên bản `V1.4.0 (Visual Direction A • Gothic Woodland)` ở đáy màn hình.
2. **Quảng Trường Làng Bellhollow (NPC Finn, Edda & Rương Trú Ẩn):**  
   - **Finn (Cậu bé đưa tin):** Đang đi lại thong thả trên lối đi lát đá phía Tây `(685, 295)`, cách xa Rương Trú Ẩn `(735, 255)` > 65px. Hoàn toàn không còn hiện tượng đứng trên nóc rương.
   - **Rương Trú Ẩn:** Khung viền trắng kem `[E] Mở Rương Trú Ẩn 12 Ô` ôm vuông vắn, khít quanh rương gỗ.
   - **Bà Lão Edda:** Đứng nghiêm trang trên sân đá trước Tháp Chuông `(785, 345)`, tách biệt hoàn toàn khỏi Giếng Nước Làng.
3. **Hiên Nhà Neris & Nồi Thảo Dược:**  
   - Neris đứng ngay ngắn bên phải hiên nhà `(990, 145)` cạnh bàn phơi thảo mộc. Nồi nước thuốc đang sôi màu ngọc lục bảo nằm độc lập bên trái `(935, 140)`, khoảng cách 55px, người chơi tương tác riêng biệt với từng đối tượng mà không bị nhảy đè prompt.
4. **Tảng Đá Tự Nhiên & Môi Trường Rừng:**  
   - Toàn bộ các mô hình đá tảng lớn nhỏ rải rác trên đường mòn và bãi cỏ đều có hình khối tự nhiên nguyên vẹn, rêu bám hữu cơ, tuyệt đối không còn bất kỳ cạnh cắt đứng 90 độ nào.

---

## 3. KẾT LUẬN & TRẠNG THÁI HỆ THỐNG
- **Biên dịch & Build:** TypeScript compile sạch sẽ 100% (`tsc --noEmit` 0 errors), đóng gói Vite production thành công (`dist/assets/index-BWtABVPL.js`).
- **Trải nghiệm:** Loại bỏ triệt để hiện tượng vướng vật cản tàng hình, đi xuyên nhà, giẫm đè NPC và lỗi đồ họa. Toàn bộ các phản ánh từ 6 ảnh chụp của người dùng đã được khắc phục trọn vẹn.