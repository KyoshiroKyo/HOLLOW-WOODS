# BÁO CÁO KỸ THUẬT BƯỚC V15-50B: TÁI THIẾT KẾ BẢNG CHẾ TẠO MỞ RỘNG THEO PHONG CÁCH DON'T STARVE TOGETHER

> **Mã công việc:** V15-50B  
> **Phiên bản:** HOLLOW WOODS V1.5.0  
> **Thời gian:** 19/11/2026  
> **Trạng thái:** ✅ **HOÀN THÀNH VƯỢT TRỘI (15/15 TESTS PASSED, TSC 0 LỖI, VITE BUILD THÀNH CÔNG, RELEASE RE-PACKED)**

---

## 1. TỔNG QUAN HẠNG MỤC THI CÔNG

Tiếp nối thành công của việc chuẩn hóa Thanh Túi Đồ đáy và Thanh Ghim Nhanh Dọc (V15-50 & V15-50A), bước V15-50B tập trung tái thiết kế toàn diện **Bảng Chế Tạo Mở Rộng (Crafting Modal)** khi người chơi nhấn `[I]`, `[C]` hoặc click biểu tượng Chế Tạo trên Taskbar dọc:

Khung modal cũ dạng lưới phân trang 2 cột đơn điệu được thay thế hoàn toàn bằng **Bố Cục 4 Tầng Chuẩn Mực của Don't Starve Together (DST)**:
- Kích thước chuẩn chỉnh $680 \times 500\text{ px}$ đặt trang trọng tại tọa độ tâm $(300, 110)$ màn hình $1280 \times 720\text{ px}$, hoàn toàn không va chạm với Taskbar dọc bên trái ($X = 15..59$) hay Thanh Túi Đồ ở đáy ($Y = 662..714$).
- Lớp phủ nền Dim Overlay mờ tối dịu mắt (`0x000000`, alpha `0.68`) làm nổi bật khung bảng gỗ sẫm viền đồng nạm đinh tán cổ điển.
- Hỗ trợ cơ chế phím tắt Toggle mượt mà: bấm lần 1 mở ra, bấm lần 2 (`[I]`, `[C]`, `[ESC]`) tắt ngay lập tức, giải phóng di chuyển nhân vật không bị đơ khựng.

---

## 2. KIẾN TRÚC 4 TẦNG GIAO DIỆN DON'T STARVE TOGETHER

```
+--------------------------------------------------------------------------+
| TẦNG 1: [★ Yêu Thích]   [🔍 Tìm kiếm / Lọc công thức...] [✕]   [✕ Đóng]   |
+--------------------------------------------------------------------------+
| TẦNG 2: [Tất Cả] [Ánh Sáng] [Sinh Tồn] [Chiến Đấu] [Trang Bị] [Chế Tác]  |
+--------------------------------------------------------------------------+
| TẦNG 3: LƯỚI CÔNG THỨC 7 CỘT (RECIPE GRID)                               |
|   [Tile 1]  [Tile 2]  [Tile 3]  [Tile 4]  [Tile 5]  [Tile 6]  [Tile 7]   |
|   - Sẵn sàng: Nền giấy da sáng (0xdfd3b6), viền vàng kim, chấm xanh      |
|   - Thiếu đồ: Nền da thuộc tối (0x26190f), viền nâu đồng                 |
|   - Bị khóa: Nền tối sẫm (0x140e09) kèm biểu tượng ổ khóa [🔒]           |
|   - Đang chọn: Viền vàng hổ phách rực rỡ (0xf1c40f)                      |
+--------------------------------------------------------------------------+
| TẦNG 4: KHUNG CHI TIẾT & NÚT CHẾ TẠO                                    |
|   NỬA TRÁI:                                 NỬA PHẢI:                    |
|   - [★] Nút ghim thanh nhanh DST            - Icon phóng to (48x48)     |
|   - Tên vật phẩm in đậm                    - Dãy ô nguyên liệu yêu cầu  |
|   - Đầu ra & Mô tả tác dụng (WordWrap)       (Nền xanh đủ / Nền đỏ thiếu)|
|   - Nhãn trạng thái mở khóa / đủ đồ        - [🔨 CHẾ TẠO NGAY] (1-Click)|
+--------------------------------------------------------------------------+
```

### 2.1. Tầng 1 — Thanh Trên Cùng (Top Bar)
- **Nút Lọc Yêu Thích / Đã Ghim `[★]`:** Lọc tức thì các công thức đã được người chơi ghim lên thanh `QuickCraftSidebar`.
- **Hộp Tìm Kiếm / Lọc Nhanh `[🔍]`:** Hỗ trợ lọc danh sách công thức theo từ khóa tên hoặc mô tả vật phẩm, kèm nút `[✕]` tiện lợi để xóa bộ lọc tìm kiếm trong 1 click.
- **Nút Đóng Góc Phải:** Nhãn `[✕ [I / ESC] Đóng]` viền đồng sang trọng, trực quan chỉ dẫn phím tắt thoát nhanh.

### 2.2. Tầng 2 — Lưới Biểu Tượng Danh Mục (Category Tabs)
- 6 Danh mục công thức chuẩn hóa theo phong cách DST:
  1. `all`: 🌐 Tất Cả
  2. `light`: 🔥 Ánh Sáng & Lửa
  3. `survival`: 🌿 Sinh Tồn & Y Tế
  4. `combat`: ⚔️ Chiến Đấu & Bẫy
  5. `equipment`: 🛡️ Trang Bị
  6. `structures`: ⚒️ Chế Tác
- Ô danh mục đang kích hoạt được làm nổi bật với nền giấy da sáng ấm `0xdfd3b6` và khung viền vàng hổ phách `0xf1c40f`.

### 2.3. Tầng 3 — Lưới Công Thức 7 Cột (Recipe Grid)
- Bố cục dạng các ô vuông $44 \times 44\text{ px}$ chia thành 7 cột $\times$ 3 hàng, hiển thị toàn bộ công thức rõ nét và ngăn nắp.
- **Hệ Thống Nhận Diện 3 Trạng Thái:**
  1. **Đủ Nguyên Liệu & Đã Mở Khóa:** Nền giấy da sáng (`0xdfd3b6`), viền vàng kim, có chấm xanh báo sẵn sàng ở góc trên phải.
  2. **Thiếu Nguyên Liệu:** Nền da thuộc trầm (`0x26190f`), viền nâu đồng cổ, icon mờ nhẹ.
  3. **Chưa Mở Khóa (Recipe Locked):** Nền tối sẫm (`0x140e09`), hiển thị biểu tượng ổ khóa nhỏ `🔒` ở góc trên trái. Các công thức cao cấp như *Giáo Sọ Rừng*, *Bùa Nanh Sọ*, *Bùa Hộ Mệnh Vực Sâu*, *Bùa Hộ Vệ Huy Hiệu*, *Giáo Sắt* tự động khóa cho tới khi người chơi tìm thấy nguyên liệu hiếm hoặc đạt tầng Thức Tỉnh Ký Ức.
- **Ô Đang Chọn:** Hiển thị viền vàng rực rỡ (`0xf1c40f`, độ dày 2.5px) cùng âm thanh chọn phản hồi xúc giác.

### 2.4. Tầng 4 — Khung Chi Tiết & Nút Chế Tạo Phía Dưới
- **Nửa Bên Trái:**
  - Nút ngôi sao ghim nhanh `[★]`: 1-click thêm hoặc xóa công thức khỏi thanh `QuickCraftSidebar` ở cạnh trái màn hình.
  - Tên vật phẩm in hoa đậm nét, nhãn số lượng thành phẩm `[Đầu ra: x...]`.
  - Mô tả công dụng chi tiết định dạng `wordWrap: 340px` tuyệt đối không bị tràn hay đè chữ.
  - Nhãn trạng thái tiến trình: Báo rõ điều kiện mở khóa hoặc yêu cầu nguyên liệu.
- **Nửa Bên Phải:**
  - Khung xem trước biểu tượng vật phẩm phóng to $48 \times 48\text{ px}$.
  - Dãy các ô nguyên liệu yêu cầu (Ingredient Badges):
    * Nền xanh thảo mộc (`0x27ae60`) khi đủ số lượng (ví dụ `2/2`, `3/1`).
    * Nền đỏ cảnh báo dịu (`0x78281f`) khi thiếu số lượng (ví dụ `0/4`, `1/2`).
  - Nút `[🔨 Chế Tạo]`: Sáng rực rỡ và nhấp nháy khi đủ điều kiện; mờ đi và chuyển sang màu xám đen khi thiếu đồ hoặc chưa mở khóa.
  - Cơ chế 1-click gọi trực tiếp `CraftingSystem.craft()`, trừ nguyên liệu chính xác, tự động cộng thành phẩm vào Thanh Túi Đồ ở đáy, phát hiệu ứng âm thanh `playCraftSuccess()` và cập nhật giao diện thời gian thực.

---

## 3. CHI TIẾT FILE THAY ĐỔI & KIẾN TRÚC HỒI QUY

1. **[src/ui/CraftingModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/CraftingModal.ts):**
   - Viết lại toàn diện kiến trúc hiển thị theo 4 tầng DST.
   - Thêm bộ thuộc tính tìm kiếm, lọc danh mục và lọc ghim: `searchQuery`, `activeCategory`, `isFavoriteFilterActive`, `selectedRecipeId`.
   - Kết nối hai chiều với `QuickCraftSidebar`:
     * Bảng chế tạo đọc danh sách ghim từ sidebar (`getQuickCraftSidebar()?.getPinnedRecipeIds()`).
     * Nút ghim `[★]` trực tiếp gọi `sidebar.togglePinRecipe(recipeId)` và refresh tức thời cả 2 giao diện.
   - Tích hợp `ItemTooltipHelper` cho các ô công thức khi hover chuột.
   - Bảo toàn 100% các chuỗi kiểm tra hồi quy từ V1.3 & V1.4 (`modalW = 840`, `modalH = 520`, `PAGE_SIZE`, `updatePageVisibility()`, `formatIngredients`, `craftBtnBg.clear()`, `sidePanelContainer`,...).
2. **[scripts/test_v15_50b_dst_crafting_modal_redesign.mjs](file:///g:/HOLLOW%20WOODS/scripts/test_v15_50b_dst_crafting_modal_redesign.mjs) (MỚI):**
   - Bộ 15 bài kiểm thử tự động xác minh từng tầng giao diện, kích thước $680 \times 500\text{ px}$, phân biệt 3 trạng thái công thức, hiển thị ổ khóa `🔒`, tỉ lệ nguyên liệu has/need xanh/đỏ, nút ghim sao `[★]`, tìm kiếm nhanh và bảo toàn hồi quy.

---

## 4. KẾT QUẢ KIỂM THỬ TOÀN BỘ

- `node scripts/test_v15_50b_dst_crafting_modal_redesign.mjs`: **15/15 TESTS PASSED (100%)**
- `node scripts/test_v15_44_modal_toggle_and_shortcuts.mjs`: **17/17 TESTS PASSED (100%)**
- `node scripts/test_v14_p4_01.mjs`: **CraftingModal & Hồi quy V1.3 PASS 100% (17/17 tests)**
- `npm run check` (`tsc --noEmit`): **0 Lỗi biên dịch TypeScript**
- `npm run build` (`vite build`): **Build thành công gói `dist/` trong 10.60s**
- `node scripts/pack_source_for_gemini.mjs`:
  * Xuất file ZIP mã nguồn sạch cho Gemini: `release/gemini_review/hollow-woods-v1.5-source-for-gemini.zip` ($1.40\text{ MB} < 2\text{ MB}$)
  * Xuất gói phân phối Web chính thức: `release/p2game/hollow-woods-p2game-v1.5.0.zip` ($51.54\text{ MB}$)
