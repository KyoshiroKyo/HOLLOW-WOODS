# BÁO CÁO KỸ THUẬT BƯỚC V152-06A: HUD, STAMINA & TYPOGRAPHY FIX
**Dự án:** HOLLOW WOODS (v1.5.2)  
**Ngày thực hiện:** 20/11/2026  
**Trạng thái kiểm tra:** `npx tsc --noEmit` (0 lỗi), `npm run build` (PASS 100%), Test Suite 18/18 PASS.

---

## I. TỔNG QUAN NGUYÊN NHÂN GỐC (ROOT CAUSE ANALYSIS)

### 1. Nguyên nhân 3 thanh Sinh Lực / Thể Lực / Tinh Thần bị tàng hình (đen/trống) & Chữ `Thể Lực: 80/80` bị kẹt:
* **Nguyên nhân 1 (Xung đột Depth DisplayList):**  
  `statCardBg`, `statBarsGraphics`, `statIconsGraphics` khi tạo trong `UIScene.create()` **không được gán `setDepth()`**, dẫn đến độ sâu mặc định là `depth = 0`. Trong khi đó, các lớp phủ toàn màn hình như `sanctuaryGlowGraphics` (`depth = 895`) và `panicVignetteGraphics` (`depth = 900`) vẽ các tam giác tối góc màn hình (`fillTriangle(0, 0, ...)`) đè hoàn toàn lên vùng tọa độ x: 14..390, y: 10..90.
* **Nguyên nhân 2 (Hình học vẽ thanh):**  
  Phương thức `drawThickBar` sử dụng `fillRoundedRect` với chiều cao nhỏ (`h = 9px`) và bán kính cong trong bộ dựng WebGL Graphics của Phaser 4.2.1 dễ gây lỗi tam giác hóa rỗng khi scale tỷ lệ.
* **Nguyên nhân 3 (Chữ Thể Lực 80/80 bị kẹt):**  
  Tại dòng 290 `UIScene.ts`, chuỗi ban đầu bị hardcode tĩnh là `'Thể Lực: 80/80'` (trong khi toàn bộ dữ liệu Canon trong `PlayerState.ts` và `SurvivalSystem.ts` đều là 100/100). Do `statBarsGraphics` bị che khuất và cơ chế dirty-check của `redrawStats()` phụ thuộc vào `stats_changed` (với ngưỡng dirty 0.05 chưa cập nhật từng khung hình và không được gọi trong vòng lặp `update()`), nhãn này không đồng bộ mượt mà theo thời gian thực.

### 2. Nguyên nhân ngọn lửa Main Menu bị nhảy đè lên chữ:
* **Nguyên nhân:**  
  Trong `MainMenuScene.ts`, đối tượng đồ họa `flameCore` (`Phaser.GameObjects.Graphics`) được vẽ bằng tọa độ tuyệt đối `(fireX, groundY)`, nhưng gốc tọa độ biến hình (`origin`) của một đối tượng Graphics trong Phaser luôn là `(0, 0)` của màn hình.  
  Khi chạy tween `scaleY: 1.15`, phép nhân tỷ lệ từ `(0, 0)` đã đẩy toàn bộ các đỉnh của ngọn lửa trôi dịch xuống dưới theo trục Y khoảng ~80px (`groundY * 0.15`), đè trực tiếp lên dòng chữ *"The Mossbound Wayfarer • Bên Ngọn Lửa Trại Bellhollow"*.

### 3. Nguyên nhân icon ô [3] bị ô vuông trắng (`□ x2`):
* **Nguyên nhân:**  
  Ô [3] (chỉ số index 2) chứa vật phẩm khởi đầu `res_dry_wood` (Gỗ Khô, số lượng 2). Trong `getItemIconChar()`, biểu tượng được gán là emoji khúc gỗ `🪵` (Unicode U+1FAB5).  
  Đây là ký tự mới từ Unicode 13.0 (phát hành cuối năm 2020). Font stack hệ thống mặc định của `HDTextHelper` trước đây là `"Segoe UI", "Roboto", "Inter", system-ui, sans-serif`, **không chứa Segoe UI Emoji / Noto Color Emoji**, khiến renderer của Canvas/WebGL trên Windows không tìm thấy glyph và hiển thị ký tự rỗng (tofu/ô vuông trắng `□`).

---

## II. CÁC BIỆN PHÁP ĐÃ THỰC HIỆN

### 1. Khôi phục 100% hiển thị sắc nét 3 thanh sinh tồn & luồng Thể Lực:
* Đặt độ sâu phân tầng minh bạch cho toàn bộ Stat Card trong `UIScene.ts`:
  - `statCardBg`: `depth = 8050`
  - `statBarsGraphics`: `depth = 8051`
  - `statIconsGraphics` & 3 Image Icons (`heartIcon`, `staminaIcon`, `composureIcon`): `depth = 8052`
  - `playerNameText`, `healthValText`, `staminaValText`, `composureValText`: `depth = 8053`
  - Khung phụ bên dưới (`lanternStatusBg`, `moistureBadgeBg`, `temperatureBadgeBg`): `depth = 8050`, texts: `depth = 8053`.
* Viết lại `drawThickBar()` dùng `fillRect` chuẩn Pixel Art cho nền rãnh tối (`0x0a0d14`), viền (`0x3d4a5d`), thân thanh và gờ nổi 3D (`lightColor`), triệt tiêu 100% rủi ro geometry error của `fillRoundedRect`.
* Đồng bộ `staminaValText` ban đầu thành `'Thể Lực: 100/100'` và cập nhật giá trị thực tế `stats.stamina/stats.maxStamina`.
* Trong `UIScene.update()`, bổ sung gọi `this.redrawStats()`. Nhờ bộ lọc dirty check, khi chạy nhanh giữ Shift, thanh vàng co lại mượt từng pixel và con số `Thể Lực: XX/100` nhảy liên tục theo thời gian thực.
* Trong `SurvivalSystem.ts`, hạ ngưỡng dirty check `stamina` từ `0.05` xuống `0.01` để phát sự kiện cực nhạy.

### 2. Khử mờ nhòe chữ & tối ưu Typography HD:
* Trong `index.html`: Chuyển `image-rendering` trên thẻ `canvas` từ `pixelated` về `auto`, cho phép bộ nội suy trình duyệt làm mượt chữ vector/UI khi co giãn theo màn hình `Scale.FIT` (vẫn bảo toàn `pixelArt: true` trong canvas của Phaser).
* Trong `HDTextHelper.ts`: Bổ sung font emoji chuẩn `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji"`, tính toán `getOptimalResolution()` động từ `window.devicePixelRatio` (từ 2 đến 3), tự động làm tròn tọa độ `Math.round(x, y)`.
* Trong `PreloadScene.ts`: Chuyển toàn bộ 6 vị trí văn bản sang `HDTextHelper.createText()`, font size chẵn, stroke 2-4px sắc lẹm.

### 3. Neo cố định ngọn lửa Main Menu:
* Trong `MainMenuScene.ts`: Đặt `flameCore.setPosition(fireX, groundY)` và vẽ các đỉnh tam giác tương đối quanh tâm `(0, 0)`.
* Cập nhật tween ngọn lửa chỉ biến thiên nhẹ `scaleY: 1.06, scaleX: 0.96` và alpha tại chỗ; ngọn lửa bập bùng vững chãi trong hố đá, không bị trôi trục Y đè lên chữ.
* Đổi nhãn phím tắt chân trang Main Menu từ `[F] Đèn` thành `[F] Vòng Sáng`.

### 4. Gỡ bỏ Mini-map & Thêm Huy Hiệu Khu Vực + Chống tràn Quest + Sửa ô [3]:
* Đặt `MiniMapWidget.container.setVisible(false)` và chuyển hướng phím `[N]` mở thẳng `ParchmentWorldMapModal` mà không hiện thông báo popup phiền toái.
* Dựng huy hiệu phân khu nhỏ gọn `zoneBadgeContainer` ngay dưới khung Nhiệm Vụ: hiển thị `🧭 [Tên Khu Vực]` kèm nút bấm `🗺️ [N] Bản Đồ` mở trực tiếp bản đồ giấy da.
* Tự động co giãn chiều cao `redrawQuestBox()` theo số dòng thực tế (`wordWrap` + padding đáy >= 14px), triệt tiêu lỗi tràn viền khi mô tả nhiệm vụ dài.
* Trong `HUDIconGenerator.ts`, thiết kế texture Pixel Art 16×16 px chuẩn `HUD_ICON_WOOD` (`hud_icon_wood`) gồm 2 khúc gỗ xếp chồng có vòng năm và thớ gỗ sắc nét.
* Trong `UIScene.ts`, tạo mảng `inventorySlotImages`. Đối với `res_dry_wood` và `item_resin_flare`, hiển thị trực tiếp Sprite Image `HUD_ICON_WOOD`, chấm dứt hoàn toàn hiện tượng ô vuông trắng `□`.

### 5. Tăng thời lượng thông báo (Toast):
* Viết lại `showPopupMessage()`:
  - Thời gian giữ chữ (`holdDuration`): `Math.min(7000, Math.max(4000, 4000 + msg.length * 40))` (đạt 4.5s – 7.5s tùy độ dài thông báo).
  - Fade-out mượt mà trong 500ms (0.5s).

---

## III. KẾT QUẢ KIỂM TOÁN
1. **TypeScript Compile (`npx tsc --noEmit`):** PASS (0 errors).
2. **Production Bundle (`npm run build`):** PASS (Hoàn thành trong 13.59s).
3. **Automated Test Suite (`scripts/test_v152_06a_hud_stamina.mjs`):** 18/18 PASS 100%.
4. **Bảo tồn mã nguồn:** Tuân thủ AI IRON RULES, sao lưu đầy đủ tại `Backups/steps/backup_v152_06a/`.
