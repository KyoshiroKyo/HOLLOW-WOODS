# BÁO CÁO KỸ THUẬT V15-50: TÁI THIẾT KẾ THANH TÚI ĐỒ & TRANG BỊ ĐÁY VÀ TASKBAR DỌC DON'T STARVE STYLE

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Phiên bản:** V1.5.0 Production  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 19/11/2026  
**Trạng thái nghiệm thu:** **HOÀN THÀNH 100% (15/15 Tests Passed, 0 Lỗi TypeScript, Build Sạch)**

---

## 1. BỐI CẢNH & YÊU CẦU NÂNG CẤP

Trong các phiên bản trước, thanh công cụ dưới đáy màn hình của game hiển thị một dải 8–9 nút chữ cồng kềnh (ví dụ `[1] Thuốc Đắp`, `[2] Dầu Đèn`, `[3] Trà/Đuốc`, `[Q] Mồi Ném`, `[F] Đèn Lồng`, `[C] Chế Tạo`, `[J] Sổ Tay`, `[ESC] Tạm Dừng`). Thiết kế này bộc lộ các hạn chế:
1. Chiếm dụng diện tích lớn theo chiều ngang, chữ dài dễ che khuất tầm nhìn mặt đất.
2. Thiếu không gian hiển thị trực tiếp 4 ô Trang Bị Cá Nhân (BODY, FEET, BACK, CHARM) khiến người chơi phải liên tục mở bảng phụ [B] để kiểm tra trang bị đang mặc.
3. Không thể hiện được toàn bộ 8 ô Túi Đồ thực tế mà nhân vật đang mang theo người.
4. Nút công cụ hệ thống (Chế Tạo, Sổ Tay, Đèn Lồng, Bản Đồ, Gỡ Kẹt, Tạm Dừng) nằm lẫn với vật phẩm tiêu hao ở đáy màn hình.

**Bước V15-50** tiến hành phân tách và tái cấu trúc toàn diện theo triết lý giao diện sinh tồn kinh điển lấy cảm hứng từ **Don't Starve**:
- **Cụm Đáy Trung Tâm:** Thanh Túi Đồ 8 ô vuông ($42 \times 42\text{ px}$) + 4 ô Trang Bị Cá Nhân ($42 \times 42\text{ px}$) gói gọn trong khung gỗ tối viền đồng cổ cao chỉ $\sim 52\text{ px}$.
- **Cụm Mép Trái Dọc:** Taskbar Biểu Tượng Dọc thanh mảnh ($42\text{ px}$ chiều rộng) gắn sát cạnh trái màn hình gồm 6 biểu tượng chức năng kết nối với nhau.

---

## 2. CHI TIẾT CÁC CẢI TIẾN ĐÃ THỰC HIỆN

### 2.1. Thanh Túi Đồ & Trang Bị ở chính giữa đáy màn hình (`src/scenes/UIScene.ts`)
- **Tọa độ & Kích thước:** Đặt tại tâm $(X = 640, Y = 688)$, tổng chiều rộng $574\text{ px}$, chiều cao $52\text{ px}$. Mép trên tại $Y = 662$, mép đáy tại $Y = 714$ (cách đáy màn hình $6\text{ px}$), giải phóng $100\%$ không gian giữa màn hình.
- **Phong cách Mỹ thuật Pixel Art:**
  - Nền gỗ sẫm cổ kính `0x140e09` (alpha $0.94$), bo góc $6\text{ px}$.
  - Viền kép đồng xỉn `0x5c4224` và `0x8c6d3b`.
  - 4 đinh tán đồng mỹ thuật `0xb89058` ở 4 góc khung.
- **8 Ô Túi Đồ Bên Trái ($42 \times 42\text{ px}$):**
  - Đặt từ $X = -258\text{ px}$ đến $X = +64\text{ px}$ (bước nhảy $46\text{ px}$).
  - Phím tắt `[1]`..`[8]` hiển thị nhỏ gọn ở góc trên trái ô (font $9\text{ px}$ bold, màu vàng kem `#baa892` hoặc `#f1c40f`).
  - Biểu tượng vật phẩm emoji/pixel art sắc nét hiển thị ở trung tâm ô (🌿 Thuốc đắp, 🪔 Dầu đèn, 🍵 Trà thảo dược, 🪵 Củi/Đuốc, 🔔 Mồi ném/Chuông, 🪨 Đá lửa, 💧 Nhựa cây, 🍄 Nấm, 🍲 Súp, 🧥/👢/🎒/🔔 Trang bị).
  - Số lượng xếp chồng (stack count) đặt gọn ở góc dưới phải `setOrigin(1, 1)` (font $10.5\text{ px}$ bold `#2ecc71` viền đen $2\text{ px}$, ví dụ `x2`, `x15`), tuyệt đối không đè phím tắt hay biểu tượng trung tâm.
  - Ô đang chọn (Selected Slot) có viền kép ánh sáng hổ phách `0xf39c12` & `0xffe082`, nẹp đồng 4 góc vàng sáng `0xfff3d1`.
  - Hỗ trợ cả click chuột trực tiếp vào từng ô lẫn nhấn phím số `1`–`8` trên bàn phím:
    * `item_herbal_poultice` -> Sử dụng hồi phục Sinh Lực và Bình Tâm.
    * `item_lantern_oil` -> Sử dụng châm đầy dầu đèn lồng.
    * `food_calming_tea` / `item_resin_flare` -> Dùng trà trấn an hoặc cắm đuốc cứu nạn.
    * `item_noise_lure` -> Ném mồi nhử đánh lạc hướng quái vật.
    * `food_roasted_mushroom` / `food_forest_root_soup` -> Thưởng thức thức ăn hồi máu/thể lực.
    * Trang bị (`eqp_...`) -> Tự động mặc vào ô tương ứng.
    * Nguyên liệu -> Hiển thị thông báo và số lượng hiện có.
- **Vách Ngăn Đồng Xỉn:** Đặt tại $X = 92\text{ px}$ ngăn cách cụm Túi Đồ và Trang Bị, trang bị đinh tán đồng thau `0xd4af37`.
- **4 Ô Trang Bị Cá Nhân Bên Phải ($42 \times 42\text{ px}$):**
  - 4 ô: `BODY` (Giáp/Áo), `FEET` (Giày), `BACK` (Ba lô), `CHARM` (Bùa hộ mệnh).
  - Nền tím đen huyền bí `0x141018`, nhãn nhỏ mờ ở đỉnh ô.
  - Khi ô trống: hiển thị biểu tượng bóng mờ (🧥, 👢, 🎒, 🔔) với alpha $0.35$.
  - Khi đang mặc trang bị: viền vàng kim `0xd4af37`, biểu tượng sáng rõ rực rỡ với alpha $1.0$.
  - Nhấp chuột vào ô trang bị: mở ngay bảng Trang Bị [B] để quản lý.

---

### 2.2. Taskbar Biểu Tượng Dọc ở mép trái màn hình (`src/scenes/UIScene.ts`)
- **Tọa độ & Kích thước:** Đặt sát cạnh trái tại $(X = 37, Y = 266)$, chiều rộng thanh mảnh $42\text{ px}$, chiều cao $256\text{ px}$. Nằm gọn bên dưới cụm thanh máu ($Y \le 134$) và trên thanh đáy ($Y \ge 662$).
- **Cấu trúc 6 Nút Chức Năng Nối Liền:**
  1. `[I / C]` **Chế Tạo** (Biểu tượng ⚒️, phím tắt `I`): Mở Bàn Chế Tạo [I] / [C].
  2. `[J]` **Sổ Tay Lữ Khách** (Biểu tượng 📖, phím tắt `J`): Mở Sổ Tay theo dõi nhiệm vụ, ký ức và bản đồ.
  3. `[F]` **Đèn Lồng Sương Mù** (Biểu tượng 🏮, phím tắt `F`):
     - Khi đèn BẬT: Hào quang cam vàng hổ phách `0xf39c12` phát sáng rực rỡ quanh ô, biểu tượng đèn lồng sáng $100\%$.
     - Khi đèn TẮT: Nền gỗ tối bình thường, biểu tượng mờ nhẹ $60\%$.
  4. `[N]` **Mở Rộng La Bàn / Bản Đồ** (Biểu tượng 🧭, phím tắt `N`): Bật/tắt La Bàn Mini và Bản Đồ Giấy Da Thế Giới.
  5. `[F8]` **Thoát Kẹt An Toàn** (Biểu tượng 🥾, phím tắt `F8`): Kích hoạt ngay cơ chế gỡ kẹt `emergencyUnstuckPlayer()` về điểm an toàn.
  6. `[ESC]` **Hệ Thống & Tạm Dừng** (Biểu tượng ⚙️, phím tắt `ESC`): Mở Menu Tạm Dừng, lưu game và cài đặt.
- **Hệ Thống Tooltip Chuyên Nghiệp:**
  - Hover qua bất kỳ nút Taskbar nào: hiển thị thẻ giấy da viền đồng nạm đinh ở cạnh phải $(X = 62\text{ px})$ với tiêu đề, phím tắt màu cam và mô tả chức năng chi tiết.
  - Hover qua bất kỳ ô Túi Đồ hoặc Trang Bị đáy: hiển thị hộp thông tin `ItemTooltipHelper` chi tiết chỉ số, tác dụng, nguồn thu thập hoặc thông báo ô trống.

---

### 2.3. Căn Chỉnh Khung Hình 1280×720 & Triệt Tiêu Che Khuất
- **Bảng Debug [F9] (`src/utils/HitboxDebugInspector.ts`):**
  - Cập nhật công thức neo: `posY = Math.max(16, Math.min(650 - boxH, 704 - boxH))` để khi bật Debug [F9], mép đáy bảng thông số luôn $\le 650\text{ px}$, cách thanh đáy $12\text{ px}$, hoàn toàn không bị đè lên Thanh Túi Đồ & Trang Bị.
- **Không Gian Gameplay Trung Tâm:**
  - Vùng trung tâm màn hình ($X: 60..1220$, $Y: 135..660$) hoàn toàn thông thoáng cho việc quan sát nhân vật, quái vật, sương mù và tương tác môi trường.
- **Đồng Bộ Ẩn/Hiện Khi Mở Giao Diện:**
  - Cả Taskbar dọc và Thanh Đáy tự động ẩn mượt mà qua `setHUDVisible` và `setDialogueActive` khi mở Modal hoặc nói chuyện với NPC.

---

## 3. KẾT QUẢ KIỂM THỬ & BUILD

- **Kiểm thử chuyên biệt V15-50:**
  `node scripts/test_v15_50_bottom_bar_and_vertical_taskbar.mjs`: **15/15 PASS (100%)**.
- **Kiểm thử hồi quy toàn diện:**
  - `node scripts/test_v15_48_iframe_focus_and_hud_layout.mjs`: **28/28 PASS (100%)**.
  - `node scripts/audit_map_reachability_and_assets.mjs`: **73/73 PASS (100%)**.
  - `node scripts/test_v15_47_boss_composure_assault_and_zero_mechanics.mjs`: **28/28 PASS (100%)**.
  - `node scripts/test_v15_46_boss_pillar_damage_and_free_break.mjs`: **22/22 PASS (100%)**.
  - `node scripts/verify_v15_03_corner_sliding_and_colliders.mjs`: **25/25 PASS (100%)**.
  - `node scripts/test_v15_40_rune_puzzle_colliders.mjs`: **12/12 PASS (100%)**.
  - `node scripts/test_v15_41_rune_seam_and_walkway.mjs`: **12/12 PASS (100%)**.
- **Biên dịch TypeScript:**
  `npx tsc --noEmit`: **0 lỗi biên dịch**.
- **Đóng gói Vite:**
  `npm run build`: **Thành công trong 10.55s**, tạo thư mục `dist/` sạch sẽ.

---

## 4. DANH MỤC TỆP NGUỒN SỬA ĐỔI

1. [src/scenes/UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts): Tái thiết kế toàn diện `buildQuickSlots()` thành thanh Túi Đồ 8 ô + Trang Bị 4 ô đáy, xây dựng Taskbar Dọc `buildVerticalTaskbar()`, tích hợp `useOrSelectSlot()`, `showTaskbarTooltip()`, `updateTaskbarLanternState()` và các phím tắt 1–8.
2. [src/utils/HitboxDebugInspector.ts](file:///g:/HOLLOW%20WOODS/src/utils/HitboxDebugInspector.ts): Căn chỉnh giới hạn đáy `posY <= 650px` chống đè lên thanh đáy.
3. [scripts/test_v15_50_bottom_bar_and_vertical_taskbar.mjs](file:///g:/HOLLOW%20WOODS/scripts/test_v15_50_bottom_bar_and_vertical_taskbar.mjs): Bộ kiểm thử tự động 15 bài kiểm tra nghiệm thu.
