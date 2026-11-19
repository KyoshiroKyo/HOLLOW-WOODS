# BÁO CÁO KỸ THUẬT V15-50C: NÂNG CẤP CHI TIẾT GIAO DIỆN CHẾ TẠO CHUẨN 100% THEO ẢNH DON'T STARVE TOGETHER

> **Thời gian thực hiện:** 19/11/2026  
> **Không gian làm việc:** `G:\HOLLOW WOODS`  
> **Nhánh:** `feat/v1.5-visual-gameplay-overhaul`  
> **Tài liệu tham khảo đối chiếu:** 2 ảnh chụp giao diện gốc Don't Starve Together do người dùng cung cấp (Ảnh 1: *Apicultural Notes Flyout Card & Ribbon*; Ảnh 2: *Expanded Crafting Menu & Garland Detail Card*).

---

## 1. MỤC TIÊU VÀ ĐỐI CHIẾU NÂNG CẤP CHI TIẾT

| Thành phần DST gốc | Hiện trạng trước chỉnh sửa | Cải tiến nâng cấp chuẩn 100% (V15-50C) |
| :--- | :--- | :--- |
| **Ảnh 1: Mũi tên kết nối (Bracket Pointer)** | Thẻ nổi bay độc lập bên cạnh thanh dọc | Thêm mũi tên tam giác gỗ chạm khắc viền đồng chĩa sang trái (`fillTriangle(0, -9, -11, 0, 0, 9)`), trỏ thẳng vào tâm ô ghim đang hover. |
| **Ảnh 1: Đỉnh thẻ (Top Crest)** | Mép trên hình chữ nhật bo góc phẳng | Chạm khắc khối vòm đỉnh (Ornate Top Crest Notch) nẹp đồng cổ đối xứng. |
| **Ảnh 1: Bố cục Thẻ nổi** | Tiêu đề góc trái, mô tả góc trên, nút bấm góc phải | Căn giữa toàn bộ: Tiêu đề in đậm gothic serif ở trên cùng, hàng ô vuông nguyên liệu ở giữa, mô tả căn giữa, nút `[🔨 Chế Tạo Ngay]` căn giữa dưới đáy. |
| **Ảnh 1: Ô nguyên liệu (Square Boxes)** | Dải badge hình chữ nhật nằm ngang kèm text | Ô vuông hoàn chỉnh (36×36 px), icon lớn ở giữa, số lượng `has/need` ở đáy. Nền đỏ sẫm `0x78281f` viền `0xc0392b` khi thiếu (0/8), nền giấy da sáng `0xede4d1` viền `0x2ecc71` khi đủ (2/2). |
| **Ảnh 2: Tai sách mép phải (Bookmark Tabs)** | Khung bảng chữ nhật trơn ở mép phải | Dãy 6 tai sách bookmark dọc nhô ra mép phải khung bảng (`Right Edge Bookmark Tabs`), hỗ trợ click chuyển nhanh 6 danh mục, tab active nhô ra thêm 6px và sáng viền vàng kim. |
| **Ảnh 2: Hộp tìm kiếm "Everything"** | Ô tìm kiếm nền tối xám viền nâu | Lớp nền giấy da sáng ấm `0xede4d1` viền khắc chìm `0x8c6d3b` chuẩn phong cách ô "Everything" trong DST. |
| **Ảnh 2: Thanh cuộn lưới (Diamond Scrollbar)** | Lưới công thức không có thanh cuộn thị giác | Bổ sung thanh cuộn chạm khắc DST với nút mũi tên lên `▲`, con trượt hình thoi (Diamond Thumb `◆`) và nút mũi tên xuống `▼`. |
| **Ảnh 2: Khung xem trước & Biến thể Skin** | Khung xem trước icon đơn thuần | Bổ sung nhãn `◀ Cổ Điển ▶` (Classic Skin Variant) bên dưới icon preview mô phỏng chuẩn giao diện chế tác DST. |

---

## 2. CÁC TẬP TIN ĐÃ NÂNG CẤP

1. **`src/ui/QuickCraftSidebar.ts`**:
   - Tích hợp `pointer` tam giác chạm khắc trỏ sang trái.
   - Bổ sung vòm đỉnh chạm khắc `Ornate Top Crest Notch`.
   - Bố cục căn giữa chuẩn mực: Tiêu đề `recipe.name` -> Dãy ô nguyên liệu vuông căn giữa -> Mô tả ngắn gọn -> Nút chế tạo căn giữa.
   - Thể hiện chính xác màu nền đỏ sẫm khi thiếu nguyên liệu (0/8) và nền giấy da sáng khi đủ (2/2).
2. **`src/ui/CraftingModal.ts`**:
   - Tích hợp `buildRightEdgeBookmarkTabs` và `redrawRightBookmarkTabs` với 6 tab bookmark dọc mép phải.
   - Nâng cấp Search Bar sang nền giấy da sáng ấm `0xede4d1` phong cách *"Everything"*.
   - Vẽ thanh cuộn hình thoi (Diamond Scrollbar) DST ở mép phải lưới công thức Tầng 3.
   - Bổ sung nhãn biến thể `◀ Cổ Điển ▶` (Classic) trong khung xem trước Tầng 4.
3. **`scripts/test_v15_50c_dst_visual_fidelity_and_bookmarks.mjs`**:
   - Bộ 10 bài kiểm thử tự động xác minh từng chi tiết đồ họa chuẩn DST.

---

## 3. KẾT QUẢ KIỂM THỬ VÀ BIÊN DỊCH

- **Kiểm thử TypeScript:** `npx tsc --noEmit` -> **0 lỗi (Exit Code 0)**.
- **Kiểm thử hồi quy 50A:** `test_v15_50a` -> **15/15 PASS (100%)**.
- **Kiểm thử hồi quy 50B:** `test_v15_50b` -> **15/15 PASS (100%)**.
- **Kiểm thử thị giác 50C:** `test_v15_50c` -> **10/10 PASS (100%)**.
- **Kiểm thử đóng gói Vite:** `npm run build` -> **Thành công 100% trong 11.35s**.
