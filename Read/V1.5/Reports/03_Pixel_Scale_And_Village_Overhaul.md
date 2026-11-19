# BÁO CÁO KỸ THUẬT BƯỚC V15-03: CHUẨN HÓA TỶ LỆ PIXEL ART, KIẾN TRÚC LÀNG BELLHOLLOW, HITBOX NPC & CORNER SLIDING

> **Mã công việc:** V15-03  
> **Dự án:** HOLLOW WOODS V1.5 (Visual & Gameplay Overhaul)  
> **Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
> **Trạng thái:** HOÀN TẤT XUẤT SẮC (100% TEST PASS, 0 LỖI TSC, BUILD VITE THÀNH CÔNG)

---

## 1. TỔNG QUAN & BỐI CẢNH NÂNG CẤP

Trong các phiên bản trước đây, không gian làng Bellhollow và tương tác vật lý gặp phải một số nghịch lý về tỷ lệ thị giác và bẫy va chạm:
1. **Lỗi Hitbox NPC tọa độ âm:**
   - Trong `src/entities/NPCEntity.ts`, hộp va chạm chân NPC bị lỗi `body.setOffset(-11, -7)` (hoặc `-bw/2, -bh`), khiến hitbox bay lệch ra khỏi frame 64×64 px của sprite, dẫn đến hiện tượng nhân vật đi xuyên người NPC hoặc đụng tường vô hình từ xa.
2. **Nghịch lý tỷ lệ kiến trúc nhà dân vs nhân vật:**
   - Các ngôi nhà cũ (Nhà Edda, Nhà Neris, Trạm gác) có chiều cao chỉ 24–48px, nhỏ hơn cả nhân vật (36–44px trên frame 64×64 px).
   - Cần chuẩn hóa kiến trúc các ngôi nhà, mái ngói, khung cửa và Tháp Chuông tại làng Bellhollow đạt chiều cao thực tế từ 88px đến 144px, giữ sắc nét Nearest-Neighbor.
3. **Chồng lấn Static Colliders & Rãnh nứt hàng rào 4px:**
   - Hàng rào làng bị chia thành nhiều đoạn nhỏ tạo khe hở 4px làm kẹt hitbox 14×8 px của nhân vật.
   - Hiện tượng chồng lấn 3 tầng (Triple-layer Overlap) giữa `zones.json`, `AutoPerimeterWallsModule` và cây viền biên đẩy số lượng collider tĩnh lên quá cao, gây sụt giảm FPS.
4. **Khựng cứng khi di chuyển chéo vào góc tường (Corner Snagging):**
   - Khi di chuyển chéo hoặc sượt qua góc 90° của gốc cây, vách nhà hoặc hàng rào, nhân vật bị khựng cứng do một trục vận tốc bị khóa.

---

## 2. NỘI DUNG KỸ THUẬT ĐÃ TRIỂN KHAI

### 2.1. Sửa triệt để lỗi Hitbox NPC âm tọa độ (`src/entities/NPCEntity.ts`)
- Tính toán điểm tựa bàn chân (bottom-center) của frame sprite thực tế trong frame 64×64 px:
  - `body.setSize(22, 14)`: Chiều rộng 22px, chiều cao 14px ôm sát hai bàn chân.
  - `body.setOffset(21, 50)`: Căn giữa theo trục X $\frac{64 - 22}{2} = 21\,\text{px}$, đáy chân chạm $y = 64$ ($64 - 14 = 50\,\text{px}$).
  - Loại bỏ hoàn toàn mọi offset âm trong `NPCEntity.ts`.

### 2.2. Chuẩn hóa tỷ lệ kiến trúc nhà dân & Tháp Chuông tại Làng Bellhollow (`src/world/WorldBuilder.ts`)
- **Quy mô kiến trúc chuẩn mực:**
  - **Nhà Bà Lão Edda (Người Giữ Chuông):** Kích thước 160×144 px (tâm $X = 1160, Y = 130$), cao hơn gấp 3 lần nhân vật, có ống khói nhả khói ấm áp và đống củi xếp cạnh hiên.
  - **Nhà Neris (Thầy Thuốc Thảo Mộc):** Kích thước 152×136 px (tâm $X = 570, Y = 430$) cạnh Vườn Thảo Dược Sanctuary và nồi đun dược liệu.
  - **Tháp Chuông Cổ Bellhollow:** Dựng chân đế móng đá vững chãi với chuông đồng cổ kính ngân vang.
  - **Trạm Gác Cổng Tây & Xưởng Rèn Bram:** Bố cục thoáng đãng, khoảng cách giữa các NPC tối thiểu 160px để bảng tên không bao giờ bị đè chồng lên nhau.
- **Hộp va chạm chân tường thông minh (Foot-level Hitbox):**
  - Hitbox chỉ bao phủ 30–32px dưới đáy chân tường (`colW = 130..136, colH = 30..32`), chừa toàn bộ phần thân trên và mái ngói cho phép nhân vật đi lướt tự nhiên phía sau với cơ chế Y-sorting hoàn hảo.

### 2.3. Tinh gọn Static Colliders & Vá bẫy khe hở hàng rào 4px
- **Gộp hàng rào thành Composite Colliders:**
  - `Hàng Rào Cổng Tây`: Thanh liền mạch 92×12 px tại $(556, 286)$.
  - `Hàng Rào Bắc Làng`: Thanh liền mạch 94×12 px tại $(825, 88)$.
  - `Hàng Rào Vườn Dược Tây Nam`: Thanh liền mạch 94×12 px tại $(660, 510)$.
  - `Hàng Rào Cổng Đông`: Thanh liền mạch dài 142×12 px tại $(1131, 232)$.
  - Xóa bỏ 100% các khe hở 4px gây kẹt nhân vật.
- **Tối ưu hóa gốc cây & triệt tiêu chồng lấn:**
  - `createTree()` tạo hitbox gốc cây chuẩn 20×16 px tại $(x, y+2)$.
  - Hỗ trợ cờ `withCollider: boolean = true`, tắt va chạm cho toàn bộ dải cây trang trí nằm sâu ngoài biên không thể tiếp cận (`c: false`).

### 2.4. Thuật toán Trượt Mép Tường & Tangent Slide (`src/entities/SatyrPlayer.ts`)
- **Tangent Corner Slide trong `handleMovement()`:**
  - Khi người chơi nhấn di chuyển chéo mà một trục bị chặn bởi tường vuông góc (`isXBlocked` hoặc `isYBlocked`), hệ thống tự động chuyển 100% vận tốc `currentSpeed` sang trục còn lại thông thoáng thay vì bị giảm còn $0.707\times$ hay khựng đứng.
- **Corner Assist (`applyCornerAssistWith`):**
  - Ngưỡng sai số góc lệch tâm `CORNER_THRESHOLD = 10px`.
  - Lực đẩy lướt `SLIDE_NUDGE = 2.0px/frame`.
  - Tự động đẩy trượt nhẹ vòng qua mép vật cản khi chỉ chạm rìa $\le 10\text{ px}$.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG

1. **`scripts/verify_v15_03_corner_sliding_and_colliders.mjs`:**
   - **25/25 bài kiểm tra ĐẠT (PASS 100%)**.
2. **`scripts/test_v15_03_pixel_scale_and_village_overhaul.mjs`:**
   - **24/24 bài kiểm tra ĐẠT (PASS 100%)**.
3. **Biên dịch & Đóng gói:**
   - `npx tsc --noEmit`: 0 lỗi.
   - `npm run build`: Vite build thành công trong 10.54s.
