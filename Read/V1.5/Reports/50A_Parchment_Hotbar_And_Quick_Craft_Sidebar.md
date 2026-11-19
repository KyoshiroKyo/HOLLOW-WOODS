# BÁO CÁO KỸ THUẬT BƯỚC V15-50A: TÁI THIẾT KẾ THANH TÚI ĐỒ NỀN GIẤY DA SÁNG ẤM & THANH GHIM NHANH DỌC DON'T STARVE TOGETHER

> **Mã công việc:** V15-50A  
> **Phiên bản:** HOLLOW WOODS V1.5.0  
> **Thời gian:** 19/11/2026  
> **Trạng thái:** ✅ **HOÀN THÀNH VƯỢT TRỘI (15/15 TESTS PASSED, TSC 0 LỖI, VITE BUILD THÀNH CÔNG, RELEASE RE-PACKED)**

---

## 1. TỔNG QUAN HẠNG MỤC THI CÔNG

Tiếp nối bước V15-50, bước V15-50A nâng cấp trải nghiệm HUD và thao tác người chơi lên chuẩn mực **Don't Starve Together (DST)** với 2 hệ thống cốt lõi:
1. **Thanh Túi Đồ & Trang Bị Đáy (Warm Parchment Hotbar):**
   - 8 ô Túi Đồ ($42 \times 42\text{ px}$) được phủ **nền giấy da sáng ấm (`0xdfd3b6` / `0xede4d1`)** nằm gọn trong khung gỗ tối viền đồng cổ, tương phản mực đen cổ điển cho số phím tắt `[1]`..`[8]` và viền sáng vàng hổ phách (`0xf1c40f` / `0xf39c12`) khi đang chọn hoặc rê chuột qua.
   - Vách gỗ chạm khắc tinh xảo (`sepGfx`) nẹp đồng nạm đinh phân cách sang 4 ô Trang Bị Cá Nhân ($42 \times 42\text{ px}$: BODY, FEET, BACK, CHARM) có icon bóng mờ khi trống và viền vàng kim khi mặc đồ.
2. **Thanh Ghim Nhanh Dọc (Pinned Pages Quick Craft Sidebar - DST Style):**
   - Đặt cột dọc thanh mảnh ($42\text{ px}$) ép sát cạnh trái màn hình tại `x: 37` ngay dưới cụm nút hệ thống (liên kết qua ngàm gỗ chạm khắc).
   - Phần dưới chứa 4–5 ô Công Thức Ghim Nhanh (Pinned Recipes: Đuốc/Dầu Đèn, Thuốc Đắp, Mồi Ném, Lửa Trại/Than Củi, Dây Thừng Rừng, Trà Thảo Dược, Nấm Nướng) kèm nút cuộn Lên/Xuống `[▲]` `[▼]`.
   - **Thẻ Chế Tạo Nhanh Nổi (Apicultural Notes Style Flyout Card):**
     * Bung ngay bên phải thanh dọc tại `x: 74` khi hover hoặc click vào ô ghim.
     * Hiển thị Tên món đồ, icon, mô tả tác dụng ngắn gọn.
     * Dàn hàng ngang các **Ô Nguyên Liệu (Ingredient Badges)**: tô nền đỏ mềm (`0x78281f` / `#c0392b`) nếu thiếu (`0/2`), tô nền xanh thảo mộc (`0x27ae60` / `#2ecc71`) nếu đủ (`2/2`).
     * Nút `[🔨 Chế Tạo Ngay]` 1-click trực tiếp: trừ nguyên liệu chính xác (atomic deduction), phát âm thanh `playCraftSuccess()`, cập nhật real-time số lượng và hiển thị thông báo popup mà không hề che khuất tầm nhìn gameplay trung tâm.

---

## 2. CHI TIẾT FILE THAY ĐỔI & KIẾN TRÚC

1. **[src/ui/QuickCraftSidebar.ts](file:///g:/HOLLOW%20WOODS/src/ui/QuickCraftSidebar.ts) (MỚI):**
   - Quản lý toàn bộ vòng đời của Thanh Ghim Nhanh và Thẻ Nổi.
   - Hỗ trợ cuộn qua lại (`scrollUp()`, `scrollDown()`) giữa danh sách 8 công thức sinh tồn thiết yếu.
   - Cơ chế hẹn giờ đóng mềm `startHideTimer()` / `cancelHideTimer()` (grace period 250ms) giúp người chơi lướt chuột mượt mà từ ô ghim sang thẻ nổi mà không bị tắt đột ngột.
   - Tích hợp chặt chẽ với `CraftingSystem`, `PlayerState`, `AudioManager`, và `HDTextHelper`.
2. **[src/scenes/UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts):**
   - Cập nhật 8 ô Túi Đồ sang nền giấy da sáng ấm `0xdfd3b6` viền giấy `0x8c7853` và viền vàng hổ phách `0xf1c40f` khi hover/select.
   - Khắc vách gỗ chạm khắc nổi `fillRoundedRect(88, -20, 8, 40, 2)` nẹp chỉ đồng `0x8a6d3b` và đinh tán tròn `fillCircle(92, 0, 2.5)`.
   - Tích hợp `QuickCraftSidebar` vào `create()`, dọn dẹp trong `shutdown`, đồng bộ hiển thị trong `setHUDVisible`, `setDialogueActive`, `handleModalOpened` và `updateQuickSlotCounts`.
3. **[scripts/test_v15_50a_parchment_hotbar_and_quick_craft_sidebar.mjs](file:///g:/HOLLOW%20WOODS/scripts/test_v15_50a_parchment_hotbar_and_quick_craft_sidebar.mjs) (MỚI):**
   - Bộ 15 bài kiểm thử tự động xác minh toàn diện mọi quy chuẩn giao diện, màu sắc, vị trí, logic nguyên liệu và phản hồi chế tạo.

---

## 3. KẾT QUẢ KIỂM THỬ & XÁC MINH TOÀN BỘ

- `node scripts/test_v15_50a_parchment_hotbar_and_quick_craft_sidebar.mjs`: **15/15 TESTS PASSED (100%)**
- `node scripts/test_v15_50_bottom_bar_and_vertical_taskbar.mjs`: **15/15 TESTS PASSED (100%)**
- `node scripts/test_v15_48_iframe_focus_and_hud_layout.mjs`: **28/28 TESTS PASSED (100%)**
- `npx tsc --noEmit`: **0 lỗi biên dịch**
- `npm run build`: **Vite build thành công trong 10.55s**
- `scripts/pack_source_for_gemini.mjs`: **Đóng gói lại toàn bộ bản phát hành Web P2Game ($51.54\text{ MB}$) và gói mã nguồn Gemini ($1.39\text{ MB}$)**
