# BÁO CÁO KỸ THUẬT BƯỚC V15-34: HỆ THỐNG AN TOÀN VỊ TRÍ NẠP SAVE (SAFE SPAWN RESOLVER) & CƠ CHẾ GỠ KẸT ĐỊA HÌNH KHẨN CẤP [F8]

**Mã phân đoạn:** `V15-34`  
**Ngày hoàn thiện:** `19/11/2026`  
**Phiên bản dự án:** `HOLLOW WOODS V1.5`  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Trạng thái kiểm tra:** `PASS 100% (tsc: 0 lỗi, build: thành công, unit test: PASS)`

---

## 1. Bối Cảnh & Nguyên Nhân Gốc Rễ Bug Kẹt Cổng Sắt / Ẩn Nấp
Dựa trên ảnh chụp màn hình ghi nhận tại khu vực Lối Mòn Quanh Co (`crooked_path`) và Cột Mốc Tiền Tuyến:
1. **Va chạm chồng lấn công trình lớn (`Large Obstacle Overlap`):**
   - Tại vị trí gần biển báo Cột Mốc Tiền Tuyến có công trình cổng vòm / rào chắn cầu đá sập (`cp_collapsed_bridge_blocker` hoặc cổng sắt tiền tuyến) với kích thước thực tế `36×84px`.
   - Ngay cạnh đó là điểm bụi rậm ẩn nấp `hide_bush`. Khi người chơi tương tác chui vào bụi cây hoặc lưu/nạp điểm checkpoint gần đó, tọa độ nhân vật bị trượt vào mép trong của collider công trình.
2. **Hạn chế của bộ gỡ kẹt cũ (`Nudge Offsets < 32px`):**
   - Hàm `unstuckPlayerFromColliders()` cũ chỉ thử nghiệm các bước dịch chuyển tối đa `32px` (`0, ±32`, `±32, 0`). Khi người chơi nằm trong hoặc sát một khối vật cản lớn (rộng/cao `64px - 100px`), toàn bộ các offset nhỏ đều vẫn nằm trong diện tích của collider đó, khiến thuật toán thất bại hoàn toàn.
3. **Kẹt cờ trạng thái ẩn nấp (`Stuck isHiding State`):**
   - Cờ `stats.isHiding` bị ghi nhớ trong save hoặc không được giải phóng triệt để, dẫn đến lời nhắc `[E] / [WASD] Bước ra khỏi chỗ trốn` treo vĩnh viễn trên đầu nhân vật.
   - Khi bấm phím WASD di chuyển, vật lý Arcade đẩy ngược lại do va chạm cổng sắt. Khi nhấn `[E]`, hàm thoát ẩn nấp cũ lại trả nhân vật về `lastSafePosition` (vốn đã bị kẹt ở chân cổng), tạo thành vòng lặp kẹt cứng.

---

## 2. Các Giải Pháp Kỹ Thuật Đã Triển Khai

### 2.1. Bộ Tự Động Dò Vị Trí An Toàn (`SafeSpawnResolver.ts`)
Xây dựng mô-đun độc lập chuyên xử lý kiểm toán và tái định vị vị trí nạp / spawn nhân vật:
- **`getFootBoundingBox(x, y, padding)`**: Tính toán chính xác AABB bàn chân dựa theo chuẩn `SatyrPlayer` (`WAYFARER_BODY_WIDTH = 18`, `WAYFARER_BODY_HEIGHT = 12`, `x - 9 .. x + 9`, `y - 12 .. y`).
- **`isPositionBlocked(scene, x, y, padding)`**: Quét toàn bộ các đối tượng vật lý tĩnh trong `scene.worldBuilder.colliderGroup` và kiểm tra ranh giới thế giới (`x: 20..4980`, `y: -230..1380`).
- **`findNearestSafePosition(scene, startX, startY, maxRadius = 160, step = 16)`**: Quét xoắn ốc từ `16px` đến `160px` theo 16 góc phân bố đều (`0°`, `22.5°`, `45°`, ...), ưu tiên hướng mặt đường (Nam/Đông Nam/Tây Nam).
- **`getSanctuaryFallback(zoneId)`**: Điểm cứu hộ an toàn tuyệt đối cho từng phân khu nếu bán kính 160px vẫn bị phong tỏa:
  - `bellhollow`: Cổng làng Bellhollow an toàn `(1280, 380)`.
  - `crooked_path`: Mặt đường cái Crooked Path `(1600, 340)`.
  - `sanctuary_farm`: Trang trại an lành `(640, 1480)`.
  - `sub_vaelen_camp`: Trạm lửa Vaelen ấm áp `(2360, 720)`.
  - `deep_forest`: Cửa ngõ Rừng Già `(2000, 150)`.
  - `silent_mire`: Bến thuyền Đầm Lầy `(3100, 360)`.
- **`findSafeExitFromHiding(scene, currentX, currentY, moveDir)`**: Xác định điểm bước ra khỏi chỗ trốn hướng về phía thông thoáng, loại trừ tuyệt đối hướng có cổng sắt và tường đá.

### 2.2. Reset Sạch Toàn Bộ Cờ Trạng Thái Khi Tạo & Nạp Save
- Bổ sung `SatyrPlayer.resetAllActionAndMotionStates()`:
  - `this.stats.isHiding = false;`
  - `this.hidingTimestamp = 0;`
  - `this.setVisible(true);`
  - `this.setAlpha(1);`
  - `if (this.body) this.body.enable = true;`
  - `this.forceUnlockActionState();`
  - `this.resetAllInputState();`
  - `this.playIdleAnim();`
- Cập nhật `SaveManager`:
  - Trong `buildSaveData`, `sanitizeAndMigrateSaveData` và `applySaveToState`: luôn ép buộc `stats.isHiding = false`, `stats.isSprinting = false`.

### 2.3. Sanity Check Trong Game Loop (`GameScene.update`)
- Khi nhân vật có cờ `stats.isHiding === true`, hệ thống kiểm tra xem có bất kỳ bụi cây/hốc cây nào trong bán kính `96px` không:
  - Nếu **KHÔNG** ở gần chỗ trốn nào: Ngay lập tức giải phóng trạng thái ẩn nấp, tắt lời nhắc `[E] / [WASD] Bước ra khỏi chỗ trốn`, đưa nhân vật trở lại trạng thái bình thường.
  - Nếu **CÓ** ở gần chỗ trốn: Chỉ cần sau `150ms` bấm bất kỳ phím di chuyển nào (`WASD`/Mũi tên) hoặc phím `[E]`, hệ thống sẽ gọi `SafeSpawnResolver.findSafeExitFromHiding` để bước ra mặt đường thoáng đãng.

### 2.4. Phím Tắt Khẩn Cấp [F8] & Nút "GỠ KẸT VỀ ĐIỂM AN TOÀN"
- **Phím tắt nhanh [F8]:** Người chơi có thể bấm `[F8]` bất cứ lúc nào trong game để tự động thoát khỏi vật cản và dịch chuyển về điểm an toàn gần nhất với thông báo popup:
  `🛡️ Đã gỡ kẹt thành công về điểm an toàn gần nhất!`
- **Nút trên PauseModal [ESC]:**
  - Mở rộng chiều cao modal lên `580px` (`modalY = 70`).
  - Bổ sung nút: `🛡️ GỠ KẸT VỀ ĐIỂM AN TOÀN [F8]` (màu hổ phách cam `#e67e22`).
  - Cập nhật dòng nhắc phía dưới: `💡 Phím [F8]: Gỡ Kẹt Khẩn Cấp • [H]: Xem Hướng Dẫn Phím • [ESC]: Tiếp Tục`.

---

## 3. Danh Mục Tệp Thay Đổi
1. `src/systems/SafeSpawnResolver.ts` *(Mới - 210 dòng)*: Bộ thuật toán quét và giải quyết vị trí an toàn.
2. `src/systems/SaveManager.ts` *(Cập nhật)*: Export `SafeSpawnResolver`, ép sạch cờ `isHiding` khi save & load.
3. `src/entities/SatyrPlayer.ts` *(Cập nhật)*: Thêm `resetAllActionAndMotionStates()`, `getMovementInputDirection()`, mở rộng `exitHiding(targetExitPos)`.
4. `src/ui/PauseModal.ts` *(Cập nhật)*: Thêm nút gỡ kẹt khẩn cấp `[F8]`, mở rộng khung hiển thị, hỗ trợ callback `onEmergencyUnstuck`.
5. `src/scenes/GameScene.ts` *(Cập nhật)*:
   - Dò quét an toàn `SafeSpawnResolver.resolveSafeSpawn` khi `Continue`.
   - Bắt phím tắt `[F8]` gọi `emergencyUnstuckPlayer()`.
   - Sanity check tự dọn dẹp cờ ẩn nấp nếu không ở gần chỗ trốn.
   - Sử dụng `SafeSpawnResolver.findSafeExitFromHiding` khi bước ra khỏi bụi cây.
6. `scripts/test_v15_34_safe_spawn_and_unstuck.mjs` *(Mới)*: Bộ kịch bản tự động kiểm thử 5 hạng mục đạt 100%.

---

## 4. Kết Quả Kiểm Thử Kỹ Thuật
- `node scripts/test_v15_34_safe_spawn_and_unstuck.mjs`: **PASS 100% (5/5 tiêu chí)**.
- `npx tsc --noEmit`: **0 lỗi TypeScript (Clean compilation)**.
- `npm run build`: **Đóng gói Production `dist/` thành công (13.15s, 0 lỗi cảnh báo cú pháp)**.
- Thư mục sao lưu an toàn: `backup_v15_34/`.
