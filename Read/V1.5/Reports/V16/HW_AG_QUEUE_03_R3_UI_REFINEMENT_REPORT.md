# HW-AG-QUEUE-03-R3 — SELECTIVE UI REFINEMENT REPORT
**Dự án:** HOLLOW WOODS V1.6.0 — The Unbroken Oath  
**Ngày:** 27/11/2026 (18:31 ICT)  
**Branch:** `feat/v1.6-competition-preview`  

---

## 1. MAIN MENU (`src/scenes/MainMenuScene.ts`)

- **Đồng bộ tiêu đề:** Cập nhật phụ đề thành **`THE UNBROKEN OATH`** (`letterSpacing: 1.2`).
- **Giữ nguyên thiết kế:** Thanh menu dài, hình tròn bên trái, mũi tên bên phải (`menu_black_knight_button`), toàn bộ artwork Meliodas bên phải, hoạt ảnh áo choàng, ánh sáng và màn sương giữ nguyên 100%.
- **Tinh chỉnh nút bấm:**
  - Mỗi nút chỉ hiển thị **1 dòng tiêu đề** căn giữa (`16px`, `fontStyle: 'bold'`, `strokeThickness: 2`, `letterSpacing: 0.6`), chiều cao đồng nhất `48px`, khoảng cách `56px`.
  - **TIẾP TỤC HÀNH TRÌNH:**
    - Bỏ dòng thông tin bản lưu thường trực.
    - Có bản lưu: nút hoạt động bình thường, hiển thị tooltip khu vực/checkpoint khi hover (`pointerover`).
    - Chưa có bản lưu: nút mờ (`alpha: 0.42`, tint `0x252b25`, chữ `#7d8578`), không tương tác (`useHandCursor: false`, không bắt click).
  - Tinh chỉnh rõ trạng thái **Normal / Hover-Selected (`scale: 1.015`, tint `0xa37c42`, `#fff7df`) / Disabled**.

---

## 2. WORLD MAP (`src/ui/JournalModal.ts`)

- **Nâng cấp phong cách Fantasy Cartography (Dark Moss & Ember Gold):**
  - Khung bản đồ nền `0x161a14`, viền đôi vàng đồng `0x8d6b34` kèm góc trang trí `0xC8963E`, lưới hải đồ, đường đồng mức quanh Bellhollow, cụm tán rừng, vùng đầm lầy phía Đông Nam và la bàn hoa gió (`B`).
  - Đường mòn kết nối dạng gấp khúc tạo chiều sâu (`0x0b0e0a` casing + vàng đồng `0xC8963E` cho tuyến đã mở, xanh ngọc `0x4ecdc4` cho tuyến sẵn sàng, đỏ đứt nét cho tuyến khóa).
- **Bảo toàn Topology & Fog of War:**
  - Giữ nguyên 10 phân khu, đường kết nối, thống kê `Khai Mở`, vị trí `📍 BẠN Ở ĐÂY` và thêm mốc `⭐ MỤC TIÊU` cho nhiệm vụ đang theo dõi (chỉ hiện trên vùng đã mở/khám phá).
  - **Không tiết lộ vùng chưa khám phá:** các vùng `LOCKED` / `UNIMPLEMENTED` phủ sương tối, hiển thị `🔒 ???` / `🌫️ ???` trên bản đồ và ẩn tên thật, mô tả, điểm mốc, lối thông trong bảng Chi tiết địa danh.

---

## 3. KIỂM CHỨNG & BẢO TOÀN V1.6.0

- `npm run build` (`tsc && vite build`): **PASS** (0 lỗi TypeScript).
- `npx p2game-validate ./dist --slug hollow-woods`: **292 tệp · 79.5 MB · ✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)**.
- Đã chụp ảnh đối chiếu Trước / Sau (`before_mainmenu_nosave.png`, `before_worldmap.png`, `after_mainmenu_nosave.png`, `after_mainmenu_withsave.png`, `after_worldmap.png`).
- **Bảo toàn gói phát hành V1.6.0** (`release/p2game/hollow-woods-p2game-v1.6.0.zip`) — không ghi đè ZIP đã vượt kiểm định Portal.
