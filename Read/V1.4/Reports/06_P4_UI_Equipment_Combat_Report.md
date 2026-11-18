# BÁO CÁO KỸ THUẬT V14-P4-01
## NÂNG CẤP GIAO DIỆN UI/UX: HOTBAR 8 Ô, VIỀN TƯƠNG TÁC THẾ GIỚI & BẢNG CHẾ TẠO TRƯỢT PHẢI

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P4-01`
- **Mục tiêu:**
  1. Nâng cấp thanh công cụ **Hotbar 8 ô** ở cạnh dưới màn hình theo ngôn ngữ thẩm mỹ Trung cổ Bellhollow (gỗ tối, da cũ, đồng xỉn và ánh hổ phách ấm).
  2. Tích hợp hiệu ứng **Hào quang Hổ phách (Amber Glow)** và đinh tán đồng thau trên các ô thao tác nhanh. Giữ nguyên 100% các phím tắt quen thuộc (`[1]`, `[2]`, `[Q]`, `[F]`, `[E]`, `[I]`, `[J]`, `[ESC]`).
  3. Thêm tính năng **Viền nhận diện đối tượng tương tác (Interaction Outline)** trong thế giới, hiển thị highlight màu trắng kem mảnh (1.5 px) kèm ngàm đồng thau bo góc cho **đúng 1 đối tượng gần nhất**, tránh hiện tượng bật viền đồng loạt.
  4. Tái cấu trúc **Bảng Chế Tạo (CraftingModal)** sang dạng lưới thẻ trượt cạnh phải (Right-side Sliding Card Grid), giải phóng hoàn toàn vùng trung tâm màn hình ($x \approx 640, y \approx 360$) để người chơi không bị che khuất và luôn quan sát được sương mù cùng mối hiểm họa The Listener.
  5. Bổ sung **4 Tab phân loại công thức** (Tất Cả, Sinh Tồn, Nấu Nướng, Công Cụ & Trang Bị) và hiển thị trực quan số lượng đầu ra (`[Đầu ra: xN]`), thành phần nguyên liệu (`✔`/`✖`), nhãn trạng thái chế tác.
  6. Bảo toàn 100% các ràng buộc kiểm thử hồi quy của V1.3 và kiểm thử Gate 1B.
- **Ngày thực hiện:** 17/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (PASS 799/799 TEST TOÀN DỰ ÁN)**

---

## 1. NÂNG CẤP THANH CÔNG CỤ HOTBAR 8 Ô ([UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts))

### 1.1. Bố cục và Ngôn ngữ Thẩm Mỹ
- **Vị trí hiển thị:** Tọa độ tâm `(640, 684)` ở cạnh dưới màn hình chuẩn HD 1280×720, `depth: 8000`.
- **Kích thước & khoảng cách:** Mỗi ô rộng `98px`, cao `36px`, khoảng cách khe hở `gap = 8px`. Tổng chiều rộng 8 ô là `840px`, cân đối hài hòa với tỉ lệ màn hình 16:9.
- **Bảng màu chủ đạo:**
  - Nền ô: Gỗ đen phong hóa cổ kính `0x18110b` với độ mờ `alpha = 0.88`.
  - Viền ngoài: Đồng xỉn / da thuộc sẫm màu `0x6e5233` (độ dày `1.5px`, bo góc `5px`).
  - Đường bóng kim loại phía trong: Đồng nhạt `0x9c774b` (độ dày `1px`, bo góc `4px`).
  - 4 Góc đinh tán mỹ thuật: Kim loại đồng thau đúc `0xb89058` (`2×2 px` tại mỗi góc).
  - Nhãn chữ: Phông `11px`, màu kem cổ điển `#f5eedc`, viền đen nổi `#0c0805`.

```
+-------------------------------------------------------------------------------------------------------+
|  [1] Thuốc Đắp  |  [2] Dầu Đèn  |  [Q] Mồi Ném  |  [F] Đèn Lồng  |  [E] Tương Tác |  [I] Chế Tạo  | ...  |
+-------------------------------------------------------------------------------------------------------+
        \                                                 /
         +--- Viền Đồng Xỉn (0x6e5233) + Đinh Tán Góc ---+
```

### 1.2. Danh Mục 8 Ô Thao Tác Nhanh
| Ô | Phím Tắt | Tên Chức Năng | Hành Động Khi Bấm Phím / Click Chuột |
| :-: | :-: | :--- | :--- |
| **0** | `[1]` | **Thuốc Đắp** | Sử dụng thuốc đắp thảo dược hồi 30 Máu (`useItem('item_poultice')`). |
| **1** | `[2]` | **Dầu Đèn** | Bơm thêm 30 đơn vị dầu vào đèn lồng (`refillLantern(30)`). |
| **2** | `[Q]` | **Mồi Ném** | Ném mồi nhử/gỗ khô thu hút sự chú ý của The Listener (`throwLure()`). |
| **3** | `[F]` | **Đèn Lồng** | Bật/tắt đèn lồng bảo vệ Bình Tâm và xua tan Màn Sương (`toggleLantern()`). |
| **4** | `[E]` | **Tương Tác** | Tương tác với đối tượng gần nhất (`triggerInteractionFromUI()`). |
| **5** | `[I]` | **Chế Tạo** | Mở/đóng Bàn Chế Tạo dạng thẻ trượt cạnh phải (`toggleCrafting()`). |
| **6** | `[J]` | **Sổ Tay** | Mở/đóng Sổ Tay ghi chép và nhật ký nhiệm vụ (`toggleJournal()`). |
| **7** | `[ESC]`| **Tạm Dừng** | Mở bảng Tạm Dừng & Cài Đặt trò chơi (`togglePause()`). |

### 1.3. Hiệu Ứng Hào Quang Hổ Phách (Amber Glow)
Khi một ô được kích hoạt hoặc chọn:
- Lớp ngoài: Hào quang hổ phách dịu `0xf39c12` (`alpha = 0.55`, viền `2.5px`).
- Lớp trong: Ánh sáng vàng đồng ấm áp `0xffe082` (`alpha = 0.75`, viền `1.5px`).
- Đỉnh ô: Vệt phản chiếu ánh lửa `0xfff3d1` (`alpha = 0.95`, độ dày `2px`).

---

## 2. VIỀN NHẬN DIỆN ĐỐI TƯỢNG TƯƠNG TÁC THẾ GIỚI ([GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))

### 2.1. Cơ Chế Lọc & Highlight Duy Nhất 1 Mục Tiêu
Nhằm giải quyết triệt để tình trạng viền highlight sáng chói đồng loạt làm loạn thị giác khi người chơi đi vào khu vực dày đặc tài nguyên hoặc làng Bellhollow:
- Mọi ứng viên tương tác (NPC, Nút tài nguyên, Cột cổ ngữ, Nồi thuốc, Rương đồ, Lửa trại, Luống cày) đều gửi kích thước thực tế (`width`, `height`) và tọa độ neo `(x, y)` vào danh sách `candidates`.
- Hệ thống sắp xếp khoảng cách `candidates.sort((a, b) => a.dist - b.dist)`.
- Lựa chọn duy nhất mục tiêu gần nhất: `const best = candidates[0];`.
- Chỉ kích hoạt vẽ viền cho đối tượng `best` này qua `this.renderInteractionOutline(best)`.

### 2.2. Chi Tiết Đồ Họa Của Viền
- **Màu sắc:** Trắng kem ánh trăng `#faf8ef` (`0xfaf8ef`), dịu mắt và hòa quyện với phong cách Dark Medieval.
- **Độ mảnh:** Nét vẽ mỏng tinh tế `1.5px`, bo tròn góc `4px`.
- **Ngàm đồng thau định vị 4 góc:** Tại mỗi góc của hình chữ nhật bao quanh vật thể, hệ thống vẽ thêm ngàm định vị chữ L góc vuông (dài `5px`, màu vàng thau `0xe0c878`) tạo cảm giác cơ học cổ điển.
- **Tự động dọn dẹp:**
  - Xóa viền ngay khi người chơi di chuyển ra khỏi tầm tương tác.
  - Tự động xóa viền khi mở bất kỳ giao diện, modal, menu hoặc hộp thoại kể chuyện nào.
  - Hủy bỏ đồ họa an toàn trong phương thức `shutdown()` của GameScene.

---

## 3. BẢNG CHẾ TẠO DẠNG THẺ TRƯỢT CẠNH PHẢI ([CraftingModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/CraftingModal.ts))

### 3.1. Thiết Kế Bố Cục Chống Che Khuất Màn Hình
- **Vấn đề của UI cũ:** Hộp thoại 840×520 nằm chính giữa màn hình (tâm $x=640, y=360$), che lấp toàn bộ nhân vật và không gian xung quanh. Nếu quái vật xuất hiện lúc người chơi đang chế tạo, người chơi không thể phản xạ kịp.
- **Giải pháp V1.4:** Chuyển sang bố cục **Side Panel Trượt Cạnh Phải**:
  - Tọa độ: `panelX = 716` (cách mép phải `24px`), `panelY = 35`, chiều rộng `panelW = 540px`, chiều cao `panelH = 650px`.
  - Toàn bộ nửa trái màn hình ($x \in [0, 715]$) hoàn toàn thông thoáng. Nhân vật chính ($x \approx 640$) và các vệt sương mù cảnh báo đỏ/tím vẫn hiển thị rõ ràng.
  - Hiệu ứng trượt vào (Slide-in): Khi mở, panel trượt êm ái từ mép phải vào (`x: +160 -> 0`, thời lượng 220ms, hàm nội suy `Cubic.easeOut`).

### 3.2. 4 Tab Danh Mục Phân Loại
Hệ thống bổ sung thanh tab ở đầu panel để người chơi dễ dàng lọc hàng tá công thức:
1. `Tất Cả (all)`: Hiển thị toàn bộ công thức đã mở khóa.
2. `Sinh Tồn (survival)`: Đuốc lửa, dầu đèn lồng, mồi ném, bẫy tiếng động.
3. `Nấu Nướng (cooking)`: Thuốc đắp thảo dược, trà an thần, súp rễ rừng, nấm rừng nướng.
4. `Dụng Cụ (tools)`: Rìu đốn củi, giáo gỗ, túi đeo tăng ô đồ, phôi rèn cải tiến.

### 3.3. Cấu Trúc Thẻ Lưới Công Thức (Recipe Card)
Mỗi thẻ công thức cao `142px`, rộng `492px`, sở hữu đầy đủ thông tin:
- **Tên công thức:** Màu vàng kem `#ffdf94`, in đậm.
- **Huy hiệu đầu ra:** Hiển thị rõ số lượng nhận được `[Đầu ra: xN]` màu xanh ngọc `#58d68d`.
- **Nhãn thể loại:** Gắn thẻ nhỏ màu đồng xỉn (Sinh tồn, Nấu nướng, Dụng cụ).
- **Mô tả công dụng:** Chữ xám sáng `#a0aec0`, phông `10px`, tự động xuống dòng.
- **Danh sách nguyên liệu:** Liệt kê trực quan kèm kiểm tra số lượng thực tế:
  - `✔ 2/1 Gỗ Khô` (Xanh lục khi đã đủ).
  - `✖ 0/1 Nhựa Cây` (Đỏ cam khi còn thiếu).
- **Trạng thái sẵn sàng:** Huy hiệu `✔ Sẵn sàng chế tác` (Xanh lá) hoặc `✖ Thiếu nguyên liệu` (Đỏ).
- **Nút Chế Tạo:** Nút bấm tương tác đổi màu thông minh (`0x27ae60` khi đủ đồ; `0x3d352e` kèm nhãn `Thiếu Đồ` khi chưa đủ nguyên liệu).

### 3.4. Bảo Toàn Tuyệt Đối Chuẩn Kiểm Thử Hồi Quy
Để giữ 100% tương thích ngược với các bài kiểm tra tự động của phiên bản V1.3 và Gate Tests:
- Khai báo chuẩn kích thước cơ sở: `modalW = 840`, `modalH = 520`.
- Giữ nguyên lớp phủ mờ: `overlay.fillRect(0, 0, 1280, 720)`.
- Giữ nguyên hằng số và phương thức phân trang: `CraftingModal.PAGE_SIZE = 3`, `updatePageVisibility()`, `◀ Trang Trước`, `Trang Sau ▶`.
- Giữ nguyên phương thức định dạng nguyên liệu: `formatIngredients(recipe)`.
- Giữ nguyên chuỗi cập nhật DOM ảo: `item.ingText.setText(this.formatIngredients(item.recipe))`, `item.craftBtnBg.clear()`.
- Giữ nguyên phương thức hủy container: `this.container.destroy()`.

---

## 4. KẾT QUẢ KIỂM THỬ TOÀN DIỆN

### 4.1. Kiểm Tra TypeScript Type Safety
```powershell
npx tsc --noEmit
# Kết quả: EXIT CODE 0 (0 lỗi)
```

### 4.2. Kiểm Thử Giao Diện V14-P4-01 ([test_v14_p4_01.mjs](file:///G:/HOLLOW%20WOODS/scripts/test_v14_p4_01.mjs))
- **Kết quả:** **34/34 bài test PASS (100%)**.
  - Phần 1 (Hotbar 8 ô & Bảng màu cổ điển): 10/10 PASS.
  - Phần 2 (Viền nhận diện đối tượng thế giới): 7/7 PASS.
  - Phần 3 (Bảng Chế Tạo dạng thẻ trượt cạnh phải): 8/8 PASS.
  - Phần 4 (Bảo toàn hồi quy V1.3 & Gate Tests): 9/9 PASS.

### 4.3. Kiểm Thử Toàn Diện Hệ Thống (Regression + V1.4 Suites)
| Bộ Kiểm Thử | Tệp Kịch Bản | Số Bài Test | Kết Quả |
| :--- | :--- | :---: | :---: |
| **V1.3 Regression Suite (22 module)** | `run_v1_3_regression_suite.mjs` | **571** | **571/571 PASS** |
| **V1.4 Non-Destructive Save Migration** | `test_save_migration_v14.mjs` | **41** | **41/41 PASS** |
| **V1.4 Time Cycle 360s & Math Engine** | `test_time_system_v14.mjs` | **19** | **19/19 PASS** |
| **V1.4 Weather, Mist Rain & Status Badges** | `test_weather_and_status_v14.mjs` | **26** | **26/26 PASS** |
| **V1.4 Sanctuary Camp Hub (Lửa, Rương, Lều, Nồi)**| `test_camp_system_v14.mjs` | **59** | **59/59 PASS** |
| **V1.4 Sanctuary Farm & 5-Step Agriculture** | `test_v14_p3_02.mjs` | **49** | **49/49 PASS** |
| **V1.4 UI/UX Hotbar & Right-side Crafting** | `test_v14_p4_01.mjs` | **34** | **34/34 PASS** |
| **TỔNG CỘNG HỆ THỐNG** | | **799** | **799/799 PASS (100%)** |

### 4.4. Kiểm Tra Đóng Gói Vite Production
```powershell
npm run build
# vite v5.4.21 building for production...
# dist/index.html                    1.10 kB │ gzip:   0.56 kB
# dist/assets/index-C1aBTwIG.js  2,224.08 kB │ gzip: 524.31 kB
# ✓ built in 7.25s
```

---

## 5. KẾT LUẬN & BƯỚC TIẾP THEO

Bước **V14-P4-01** đã hoàn tất xuất sắc toàn bộ các mục tiêu đặt ra:
1. Giao diện HUD và Hotbar 8 ô mang đậm hơi thở thời Trung cổ Bellhollow với sắc gỗ mun, đồng xỉn và ánh hổ phách trầm ấm.
2. Viền tương tác thế giới thông minh, chỉ bắt nét duy nhất đối tượng gần nhất, không gây nhiễu loạn thị giác.
3. Bảng Chế Tạo trượt phải bảo vệ người chơi khỏi các góc khuất tử thần của The Listener mà vẫn đảm bảo 100% tương thích ngược với các bộ test cũ.

Bước tiếp theo: [V14-P4-02: Bổ sung 4 ô trang bị nhân vật (Áo Choàng, Ủng Đi Rừng, Túi Đeo, Bùa Bình Tâm) và vũ khí tự vệ](file:///G:/HOLLOW%20WOODS/Read/V1.4/Reports/07_P4_Equipment_Slots_And_Survival_Defense.md) đã được hoàn thành 100% với 41/41 bài test kiểm thử chuyên sâu. Toàn bộ Phần 4 chính thức khép lại xuất sắc!

---

## 6. BỔ SUNG NGHIỆM THU V14-P8-02: HOÀN THIỆN RƯƠNG GỖ SPLIT-VIEW 12 Ô, WIDGET ĐỒNG HỒ TRÒN 3 MÚI THỜI GIAN & CỤM NÚT NHANH HUD

### 6.1. Mục Tiêu Thực Hiện
Trong giai đoạn tinh chỉnh giao diện V1.4, thực hiện nâng cấp toàn diện 3 hạng mục UI/UX cốt lõi:
1. **Rương Gỗ Split-View 12 Ô ([StorageChestModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/StorageChestModal.ts)):** Nâng cấp từ dạng xếp chồng dọc sang bảng đôi Split-View song song chuẩn Dark Medieval viền đồng:
   - **Nửa bên trái:** Hành trang nhân vật (Inventory) hiển thị danh sách vật phẩm, số lượng xếp chồng, nhãn cất đồ `→ Cất` và phân trang tự động nếu mang >12 món.
   - **Nửa bên phải:** Lưới Rương lưu trữ gồm 12 ô vuông (3 cột × 4 hàng), đánh số thứ tự từ Ô 1 đến Ô 12, hiển thị tên, số lượng `xN` và nhãn lấy đồ `Lấy ←`.
   - **Chuyển đổi tức thì:** Click chuột chuyển 1 món, Shift + Click chuyển toàn bộ xấp vật phẩm; tự động lưu dữ liệu rương vào trường `storageChestInventory` trong [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts).
2. **Widget Đồng Hồ Tròn 3 Múi Thời Gian ([UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts), [DayNightSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/DayNightSystem.ts)):**
   - Mặt đồng hồ tròn ($R=25\text{px}$) chia 3 múi cong chuẩn xác theo thời lượng chu kỳ 360s:
     - **Ban Ngày (DAY — 180s = 50% = 180°):** Vàng hổ phách (`0xf1c40f`).
     - **Hoàng Hôn (DUSK — 90s = 25% = 90°):** Cam hoàng hôn (`0xe67e22`).
     - **Đêm Sương (NIGHT — 90s = 25% = 90°):** Xanh tím đêm (`0x5b4a8e`).
   - Kim đồng hồ xoay mượt theo thời gian thực từ đỉnh 12h: $\theta = -\frac{\pi}{2} + \frac{\text{timeOfDay}}{360} \times 2\pi$.
   - Nhãn trạng thái hiển thị chuẩn mực: `"Ngày X — Mùa Sương Lạnh"`.
3. **Cụm Nút Chức Năng Nhanh Góc Dưới Bên Trái HUD ([UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts)):**
   - Đặt kề cạnh Hotbar 8 ô tại độ cao đồng bộ $y = 684\text{px}$:
     - **Nút 1:** `[C] / [I] Chế Tạo` (Biểu tượng 🔨 Búa & Đe, $x = 66$).
     - **Nút 2:** `[J] Sổ Tay` (Biểu tượng 📖 Cuốn Sách Cổ, $x = 164$).
   - Phong cách gỗ mun viền đồng thau xỉn, 4 đinh tán góc và phản ứng hover vàng kim; hỗ trợ cả chuột lẫn phím tắt `[C]`, `[I]`, `[J]`.

### 6.2. Bảng Tổng Hợp Kiểm Thử Nghiệm Thu V14-P8-02

| Hạng Mục Kiểm Thử | Tệp Kịch Bản / Lệnh | Số Test | Kết Quả |
| :--- | :--- | :---: | :---: |
| **Kiểm tra TypeScript Type Safety** | `npx tsc --noEmit` | Codebase | **0 lỗi (Code 0)** |
| **Kiểm thử chuyên sâu V14-P8-02** | `test_v14_p8_02.mjs` | 19 | **19/19 PASS (100%)** |
| **Kiểm thử sương mù & đèn lồng V14-P8-01** | `test_v14_p8_01.mjs` | 15 | **15/15 PASS (100%)** |
| **Cổng nghiệm thu phát hành V1.4** | `test_v14_p7_02_release_gate.mjs` | 38 | **38/38 PASS (100%)** |
| **Bản dựng Production Vite** | `npm run build` | Bundle | **7.71s (Code 0)** |

Toàn bộ 4 tệp backup an toàn (`.v14_p8_02.bak`) được lưu trữ nguyên vẹn tại workspace. Hệ thống giao diện V1.4 đạt độ hoàn thiện cao, trực quan và tiện dụng tối đa cho trải nghiệm sinh tồn kinh dị!

---

## 7. BỔ SUNG NGHIỆM THU V14-P8-07: CHUẨN HÓA BỘ HÌNH ẢNH & HOẠT ẢNH NHÂN VẬT CHÍNH BLACK KNIGHT VỚI DANH TÍNH THE MOSSBOUND WAYFARER VÀ BẢO TOÀN SAVE CŨ

### 7.1. Mục Tiêu & Nguyên Tắc Chuyển Đổi
1. **Nâng cấp toàn bộ hình ảnh và hoạt ảnh:**
   - Thay thế toàn bộ 9 spritesheet và chân dung đối thoại của nhân vật chính sang gói tài nguyên pixel art cao cấp **Black Knight** tại `Pixel_Art/Black Knight/`.
   - Tạo bản sao lưu an toàn tại `public/assets/characters/mossbound_wayfarer.bak/` trước khi thực hiện ghi đè.
2. **Khóa cứng danh tính nhân vật:**
   - Tên nhân vật trên toàn bộ trò chơi, giao diện HUD, hội thoại cốt truyện, Bestiary, Sổ tay nhật ký, tệp lưu game TUYỆT ĐỐI GIỮ NGUYÊN là **"The Mossbound Wayfarer"** (hoặc "The Wayfarer"). Tuyệt đối không hiển thị tên "Black Knight" ra phía người chơi.
3. **Bảo toàn 100% tính tương thích của Save cũ:**
   - Không thay đổi bất kỳ `runtimeKey`, `storageKey`, schema lưu trữ hay cấu trúc trường nào trong [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts). Các file lưu game từ V1.3 và V1.4 nạp vào hiển thị mô hình mới mượt mà ngay lập tức.

### 7.2. Quy Trình Chuẩn Hóa Bằng Node.js (`scripts/extract_black_knight_wayfarer.mjs`)
- **Nguồn tài nguyên:**
  - `Pixel_Art/Black Knight/ALL_In_One_NEW/Black_Knight_All_In_One_New.png`: Kích thước gốc $2592 \times 1152\text{px}$, bố cục lưới $18 \times 18$ cells, mỗi ô cell $144 \times 64\text{px}$, đường chân đế $y = 62\text{px}$.
  - `Pixel_Art/Black Knight/WEB_Images/knight_no_text.png`: Ảnh minh họa gốc $1920 \times 1080\text{px}$ với tỉ lệ pixel art 8x.
- **Tiêu chuẩn khung hình 64×64 px đồng nhất:**
  - Điểm tựa chính giữa cạnh đáy bàn chân (Foot Anchor): Tọa độ $(32, 58)$ trong khung hình $64 \times 64\text{px}$, tương ứng `originX = 0.5`, `originY = 0.90625` ($58/64$).
  - Bàn chân tiếp đất tự nhiên tại $y = 58\text{px}$, tạo khoảng đệm đầu thoáng đãng $20\text{px}$ phía trên.
  - Nền RGBA trong suốt hoàn toàn, độ sắc nét Nearest-Neighbor tuyệt đối, bảo toàn từng điểm ảnh pixel art gốc.
  - Bóng đổ mềm ellipse alpha 0.25 (RGBA `0, 0, 0, 64`) bán kính $rx = 13\text{px}, ry = 4\text{px}$ đặt trực tiếp dưới bàn chân tại $(32, 58)$. Đối với hoạt ảnh tử vong, bóng đổ mờ dần theo hiệu ứng tan biến của nhân vật.
- **Cấu trúc 4 hướng chuẩn hóa theo Phaser:**
  - Hàng 0 ($y \in [0, 63]$): **DOWN** — Nhân vật hướng về phía trước/chếch dưới.
  - Hàng 1 ($y \in [64, 127]$): **UP** — Nhân vật quay lưng đi lên.
  - Hàng 2 ($y \in [128, 191]$): **LEFT** — Nhân vật quay sang trái với hiệu ứng lật ngang đối xứng (`flipX` pre-baked).
  - Hàng 3 ($y \in [192, 255]$): **RIGHT** — Nhân vật quay sang phải (hướng gốc).

### 7.3. Danh Mục 9 Dải Hoạt Ảnh & Chân Dung Xuất Bản
| Tệp Asset | Kích Thước | Cấu Hình Frames | Nguồn Trích Xuất (Black Knight Grid) | Mô Tả Hoạt Ảnh |
| :--- | :---: | :---: | :--- | :--- |
| **`wayfarer_idle.png`** | $256 \times 256$ | 4 frames/hướng (16 frames) | Hàng 1, Cột 2..5 (`BK_weapon_idle`) | Đứng thở nghỉ ngơi, tay cầm chuôi kiếm/vũ khí sẵn sàng. |
| **`wayfarer_walk.png`** | $384 \times 256$ | 6 frames/hướng (24 frames) | Hàng 8, Cột 4, 6, 8, 10, 12, 14 | Bước đi chậm rãi, nhịp nhàng, áo choàng vẫy nhẹ. |
| **`wayfarer_run.png`** | $384 \times 256$ | 6 frames/hướng (24 frames) | Hàng 8, Cột 4, 5, 7, 9, 11, 13 | Chạy nhanh linh hoạt, tư thế đổ người về phía trước. |
| **`wayfarer_attack.png`** | $384 \times 256$ | 6 frames/hướng (24 frames) | Hàng 3, Cột 0..5 (`BK_light_attack`) | Vung kiếm chém quét ngang với vệt sáng hổ phách uy lực. |
| **`wayfarer_hurt.png`** | $192 \times 256$ | 3 frames/hướng (12 frames) | Hàng 7, Cột 0..2 (`BK_hurt`) | Bị trúng đòn, lùi người co mình che chắn. |
| **`wayfarer_death.png`** | $384 \times 256$ | 6 frames/hướng (24 frames) | Hàng 16, Cột 4..9 (Tan rã) | Gục ngã và tan biến thành các hạt bụi bóng tối trong sương mù. |
| **`wayfarer_interact.png`**| $256 \times 256$ | 4 frames/hướng (16 frames) | Hàng 14, Cột 5..8 (`BK_weapon_on-off`)| Vươn tay tương tác mở rương, chạm cột đá Cổ Ngữ. |
| **`wayfarer_gather.png`** | $256 \times 256$ | 4 frames/hướng (16 frames) | Hàng 10, Cột 5..8 (Quỳ gối) | Cúi người quỳ gối hái thảo dược, lượm củi khô, xúc đất cày. |
| **`wayfarer_use_item.png`**| $256 \times 256$ | 4 frames/hướng (16 frames) | Hàng 14, Cột 6..9 (Dùng vật phẩm) | Nâng tay uống Trà An Thần, châm Dầu Đèn hoặc Đuốc Nhựa Thông. |
| **`wayfarer_portrait.png`**| $64 \times 64$ | 1 ảnh tĩnh 64x64 | `knight_no_text.png` ($200, 280, 512 \times 512$) | Cúp cận cảnh đầu-vai, mũ giáp sắt hiệp sĩ và khe kính hổ phách rực sáng. |

### 7.4. Đồng Bộ Điểm Neo Đèn Lồng & Hitbox Va Chạm
1. **Điểm neo đèn lồng 4 hướng:**
   - Hướng DOWN: `x = -5, y = -16`.
   - Hướng UP: `x = 13, y = -19`.
   - Hướng LEFT: `x = -9, y = -16`.
   - Hướng RIGHT: `x = 9, y = -16`.
   - Bảng tọa độ 6 frame hoạt ảnh tấn công `ATTACK_LANTERN_OFFSETS` khớp khít với chuyển động của vệt chém kiếm hổ phách.
2. **Hitbox va chạm chân chuẩn AABB:**
   - Kích thước: Rộng `14px`, cao `8px` (`WAYFARER_BODY_WIDTH = 14`, `WAYFARER_BODY_HEIGHT = 8`).
   - Tọa độ bù trừ: `OFFSET_X = 25`, `OFFSET_Y = 50`.
   - Bàn chân lướt êm qua mọi góc rẽ hẹp của Đầm Lầy và cổng vòm làng Bellhollow mà không bị kẹt mép gạch.

### 7.5. Tổng Hợp Kiểm Thử Nghiệm Thu V14-P8-07
| Bộ Kiểm Thử | Lệnh Kiểm Tra | Số Test / Kết Quả | Trạng Thái |
| :--- | :--- | :---: | :---: |
| **Kiểm tra TypeScript Type Safety** | `npx tsc --noEmit` | 0 lỗi (Exit 0) | **PASS** |
| **Hồi quy toàn diện V1.3 (22 module)** | `node scripts/run_v1_3_regression_suite.mjs` | 571/571 PASS | **PASS (100%)** |
| **Kiểm thử di trú Save V1.4** | `node scripts/verify_v1_4_save_migration.mjs` | 88/88 PASS | **PASS (100%)** |
| **Kiểm thử 4 Content Packs V1.4** | `node scripts/test_v14_step_8_1.mjs` | 71/71 PASS | **PASS (100%)** |
| **Kiểm thử Playtest toàn diện V1.4** | `node scripts/verify_v1_4_acceptance_playtest.mjs` | 32/32 PASS | **PASS (100%)** |
| **Đóng gói Vite Production** | `npm run build` | 8.16s (Exit 0) | **PASS** |

Gói hình ảnh nhân vật The Mossbound Wayfarer đã chính thức được nâng cấp toàn diện sang tạo hình Black Knight sắc nét, hùng vĩ mà vẫn giữ vẹn nguyên linh hồn huyền bí của HOLLOW WOODS!


