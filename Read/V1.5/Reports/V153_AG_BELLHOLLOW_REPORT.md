# HOLLOW WOODS V1.5.3 — AG BELLHOLLOW WORLD POLISH REPORT
## HW-BUG-#1 / QUEUE 03A — BUG-048 EDDA BUSHES REMOVAL

**Agent:** Antigravity (AG Flash High)<br>
**Repository:** `KyoshiroKyo/HOLLOW-WOODS`<br>
**Working Directory:** `G:\HOLLOW WOODS`<br>
**Working Branch:** `feat/v1.5.3-ag-world-polish`<br>
**Ngày thực hiện:** 22/11/2026<br>
**Trạng thái:** `CLOSED-VERIFIED local`<br>

---

## 1. TỔNG QUAN & BỐI CẢNH NHIỆM VỤ

- **Mã lỗi:** `BUG-048` (Phần rà soát cảnh quan làng Bellhollow - Khu vực quanh nhà bà Edda).
- **Trạng thái trước sửa:** `BLOCKED` trong `V153_TESTER_BUG_REGISTRY.md` do cần Owner định danh chính xác các bụi cây cụ thể gây cản trở và chỉ định xóa, tránh xóa nhầm các bụi cảnh quan tự nhiên khác.
- **Chỉ đạo chính thức từ Project Owner (HW-BUG-#1):**
  Owner đã xác định chính xác ba tọa độ world coordinates của ba bụi cây cản trở quanh nhà bà Edda cần gỡ bỏ:
  1. `{ x: 1048, y: 94 }`: Bụi rậm phía Tây Bắc nhà Edda.
  2. `{ x: 1084, y: 162 }`: Bụi rậm chắn lối tiếp cận phía Tây trước nhà Edda.
  3. `{ x: 1204, y: 204 }`: Bụi rậm phía Đông Nam hiên nhà Edda.

### Yêu cầu bảo toàn nghiêm ngặt:
1. Xóa đúng và đủ 3 entry tương ứng trong danh sách bố trí bụi rậm.
2. Giữ nguyên $100\%$ các bụi cây khác trong Làng Bellhollow và toàn bộ thế giới.
3. Không sửa đổi logic hàm `placeBush()` dùng chung, không sửa đổi texture hay asset đồ họa.
4. Bảo toàn $100\%$ NPC Edda tại tọa độ `(1160, 160)`, hitbox móng nhà Edda tại `(1160, 130)`, hệ thống hội thoại phím `[E]`, các cờ nhiệm vụ (`talked_to_edda`, `met_edda`), và Save Schema 3.
5. Kiểm thử đối chứng hình ảnh BEFORE / AFTER cùng tọa độ và góc nhìn camera.
6. Kiểm thử runtime Playwright với Noclip OFF: đi bộ thông suốt qua vị trí các bụi cũ và tương tác thành công với Edda.

---

## 2. PHÂN TÍCH KỸ THUẬT & MÃ NGUỒN (SOURCE AUDIT)

- **Tệp nguồn:** [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts)
- **Phương thức khởi tạo:** `createBellhollowVegetation()`
- **Cấu trúc dữ liệu:** Mảng `bushPlacements` định nghĩa các vị trí đặt bụi rậm tự nhiên quanh làng:
  ```typescript
  const bushPlacements: Array<{ x: number; y: number; s: number; t: number }> = [
    { x: 490, y: 168, s: 0.85, t: 0xc8dac2 },
    { x: 618, y: 122, s: 0.82, t: 0xd4e4ce },
    { x: 774, y: 104, s: 0.80, t: 0xd4e4ce },
    { x: 896, y: 86, s: 0.85, t: 0xcadac4 },
    // 3 bụi quanh nhà Edda trước khi sửa:
    { x: 1048, y: 94, s: 0.88, t: 0xc8dac2 },
    { x: 1084, y: 162, s: 0.84, t: 0xc4d6be },
    { x: 1204, y: 204, s: 0.92, t: 0xb8ccb0 },
    { x: 1352, y: 214, s: 0.95, t: 0xaec2a6 },
    ...
  ```
- **Bản chất của `placeBush()`:**
  - Hàm `placeBush(x, y, scale, tint)` khởi tạo `Phaser.GameObjects.Image` với texture `TEX_BUSH` tại độ sâu `DEPTH_GROUND_DECORATION + 1`.
  - Hàm **không gán Arcade Physics Body** (không có collider vật lý), nhưng tạo ra vật cản thị giác lớn che khuất mặt đất, nhân vật, và lối tiếp cận trước hiên nhà Edda.
  - Sau khi xóa 3 entry này, khu vực quanh nhà Edda trở nên thông thoáng, trực quan, người chơi dễ dàng nhận diện lối vào và tiếp cận NPC Edda mà không bị cành lá che khuất.

---

## 3. THỰC HIỆN CHỈNH SỬA

Trong `src/world/WorldBuilder.ts`:
- Đã gỡ bỏ chính xác 3 dòng:
  ```diff
  -      { x: 1048, y: 94, s: 0.88, t: 0xc8dac2 },
  -      { x: 1084, y: 162, s: 0.84, t: 0xc4d6be },
  -      { x: 1204, y: 204, s: 0.92, t: 0xb8ccb0 },
  ```
- Bổ sung chú thích rõ ràng:
  `// BUG-048 / HW-BUG-#1: Đã xóa chính xác 3 bụi cây cản trở quanh nhà Edda tại (1048, 94), (1084, 162), (1204, 204)`

---

## 4. BẢNG ĐỐI CHỨNG HÌNH ẢNH (BEFORE / AFTER VISUAL EVIDENCE)

Toàn bộ ảnh chụp được thực hiện tự động bằng Playwright Chromium tại cùng vị trí camera, cùng tỷ lệ zoom và cùng điều kiện ánh sáng thế giới:

| Góc chụp & Vị trí | BEFORE (Trước khi gỡ) | AFTER (Sau khi gỡ sạch 3 bụi) |
|---|---|---|
| **Góc 1: Toàn cảnh nhà Edda (Zoom 1.0x)**<br>Camera: `(1160, 160)` | [before_angle1_10x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/before_angle1_edda_overview_10x.png) | [after_angle1_10x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/after_angle1_edda_overview_10x.png) |
| **Góc 1: Cận cảnh nhà Edda (Zoom 1.5x)**<br>Camera: `(1160, 160)` | [before_angle1_15x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/before_angle1_edda_overview_15x.png) | [after_angle1_15x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/after_angle1_edda_overview_15x.png) |
| **Góc 2: Lối vào phía Tây (Zoom 1.5x)**<br>Camera: `(1060, 140)` | [before_angle2_west_15x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/before_angle2_west_bushes_15x.png) | [after_angle2_west_15x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/after_angle2_west_bushes_15x.png) |
| **Góc 3: Hiên phía Đông Nam (Zoom 1.5x)**<br>Camera: `(1210, 190)` | [before_angle3_se_15x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/before_angle3_southeast_bush_15x.png) | [after_angle3_se_15x.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_01/after_angle3_southeast_bush_15x.png) |

### Nhận xét đối chiếu:
- **Tại lối vào phía Tây `(1084, 162)`:** Bụi cây rậm rạp trước hiên đã biến mất hoàn toàn, giải phóng lối đi từ đường chính dẫn vào sân nhà Edda.
- **Tại góc Tây Bắc `(1048, 94)`:** Khoảng đất cạnh tường hồi phía Tây nhà Edda thoáng sạch, lộ rõ thảm cỏ tự nhiên.
- **Tại góc Đông Nam `(1204, 204)`:** Khu vực cạnh bậc thềm phía Đông sạch bóng, không còn lùm lá che khuất góc nhìn.
- Các bụi rậm tự nhiên khác tại `(896, 86)` (phía Tây) và `(1352, 214)` (phía Đông) được giữ nguyên vẹn $100\%$, không bị suy suyển.

---

## 5. KẾT QUẢ KIỂM THỬ KỸ THUẬT & RUNTIME (VERIFICATION RESULTS)

### 5.1. Biên dịch TypeScript & Build sản xuất
- **Typecheck:**
  ```powershell
  npx tsc --noEmit
  # Kết quả: 0 errors (Exit Code 0)
  ```
- **Vite Production Build:**
  ```powershell
  npm run build
  # Kết quả: Build hoàn tất trong 10.20s (Exit Code 0)
  ```

### 5.2. Kiểm thử Runtime bằng Playwright (`scripts/qa_bug048_edda_bushes.py`)
Quy trình kiểm thử tự động thực hiện các bước:
1. Khởi động game trên Chromium Canvas chuẩn độ phân giải $1280 \times 720$.
2. **Kiểm tra va chạm vị trí cũ (Noclip OFF):**
   - Đặt Player tại `(1020, 162)` phía Tây của bụi cũ `(1084, 162)`.
   - Giữ phím `ArrowRight` (đi bộ sang Đông) qua vị trí `(1084, 162)`.
   - Player di chuyển mượt mà tới `(1166, 162)` mà không bị chặn, vận tốc và tọa độ tăng liên tục ($0$ collider cản trở).
   - Đặt Player tại `(1160, 204)` phía Tây của bụi cũ `(1204, 204)`.
   - Giữ phím `ArrowRight` (đi bộ sang Đông) qua vị trí `(1204, 204)`.
   - Player di chuyển mượt mà tới `(1292, 204)` mà không bị chặn ($0$ collider cản trở).
3. **Kiểm tra tương tác NPC Edda:**
   - Đặt Player tại `(1140, 160)` (cách Edda $20\text{ px}$ về bên trái).
   - Nhấn phím `KeyE`.
   - Trạng thái `isDialogueActive` chuyển thành `true`.
   - Hộp thoại trò chuyện với bà Edda mở thành công, hiển thị đầy đủ văn bản hội thoại cốt truyện.
4. **Bảo toàn Quest Flags & Save State:**
   - Các cờ `talked_to_edda` và `met_edda` hoạt động bình thường theo kịch bản cốt truyện.
   - Không xuất hiện bất kỳ warning hoặc exception nào trong console log.

---

## 6. KẾT LUẬN & NGHIỆM THU

- **BUG-048** đã được xử lý triệt để, đúng nguồn gốc, an toàn tuyệt đối và đạt chuẩn $100\%$ theo yêu cầu của Project Owner.
- Trạng thái cập nhật chính thức: **`CLOSED-VERIFIED local`**.
