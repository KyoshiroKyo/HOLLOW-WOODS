# HOLLOW WOODS V1.5 — BÁO CÁO KỸ THUẬT BƯỚC V15-04
## TÁCH BẢNG KIỂM TRA KỸ THUẬT [F9] KHỎI GIAO DIỆN NGƯỜI CHƠI

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (16/16 bài kiểm tra tự động PASS, 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. BỐI CẢNH & YÊU CẦU

Trong các phiên bản thử nghiệm trước đây, bảng kiểm tra kỹ thuật và giám sát hiệu năng (`HitboxDebugInspector` / Phím tắt `F9`) được neo tại tọa độ `(16, 106)`. Đây là vị trí nằm ngay sát dưới khung 4 thanh chỉ số sinh tồn của người chơi (Sinh Lực, Thể Lực, Dầu Đèn, Bình Tâm tại `X: 12..374, Y: 8..100`). Khi bảng này được bật, nó che lấp toàn bộ góc nhìn bên trái và tạo cảm giác đè lên các chỉ số quan trọng. Ngoài ra, việc thiếu cơ chế cô lập trạng thái khởi tạo có thể khiến Arcade Physics debug hiển thị các ô dây đỏ/vàng trên bản đồ đối với người chơi thông thường.

Mục tiêu bước V15-04:
1. **Khóa chặt trạng thái khởi tạo:** Chế độ debug F9 và Arcade Physics Debug luôn ở trạng thái **TẮT hoàn toàn (false)** khi người chơi vào game, đảm bảo trải nghiệm mỹ thuật Dark Woodland Pixel Art tuyệt đối nguyên bản.
2. **Neo bảng thông số F9 sang cạnh phải màn hình:** Khi nhà phát triển nhấn `[F9]`, bảng được neo tự động vào góc dưới bên phải màn hình (cách mép phải 16px, cách đáy 16px), thu gọn font chữ về `11px` (Consolas/monospace), cách xa hơn 500px so với cụm 4 thanh chỉ số ở góc trên bên trái.

---

### 2. CHI TIẾT THAY ĐỔI KỸ THUẬT

#### 2.1. Chuẩn hóa Khởi tạo Debug trong `HitboxDebugInspector.ts`
- **Tắt mặc định:** `private isEnabled: boolean = false;`
- **Khóa Arcade Physics Debug trong constructor:**
  ```typescript
  if (this.scene.physics && this.scene.physics.world) {
    this.scene.physics.world.drawDebug = false;
    if (this.scene.physics.world.debugGraphic) {
      this.scene.physics.world.debugGraphic.clear();
      this.scene.physics.world.debugGraphic.setVisible(false);
    }
  }
  ```
- **Thu gọn kích thước chữ:** Chuyển đổi font chữ từ `11.5px` sang `11px`, `lineSpacing: 1.5`, giảm độ cao tổng thể của bảng xuống dưới 260px.
- **Neo động vào góc dưới bên phải (Bottom-Right Anchor):**
  ```typescript
  const bounds = this.infoText.getBounds();
  const boxW = Math.max(370, bounds.width + 20);
  const boxH = bounds.height + 16;
  const posX = Math.max(16, 1264 - boxW); // Cách mép phải 16px (1280 - 16 = 1264)
  const posY = Math.max(16, 704 - boxH);  // Cách đáy 16px (720 - 16 = 704)
  this.uiContainer.setPosition(posX, posY);
  ```
- **Bổ sung API quản trị:** `isDebugEnabled(): boolean` và `setDebugEnabled(enabled: boolean): void`.

#### 2.2. Bảo hiểm Trạng thái Khởi tạo trong `GameScene.ts`
- Tại thời điểm khởi tạo `HitboxDebugInspector`:
  ```typescript
  this.hitboxInspector = new HitboxDebugInspector(this, this.player, this.uiScene);
  if (this.physics && this.physics.world) {
    this.physics.world.drawDebug = false;
    if (this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.clear();
      this.physics.world.debugGraphic.setVisible(false);
    }
  }
  ```
- Đảm bảo khi người chơi vào game, không có bất kỳ lệnh vẽ ô dây đỏ (`0xff0000`) hay ô vàng (`0xf1c40f`) nào xuất hiện trên thế giới.

#### 2.3. Tách bạch hoàn toàn khỏi `UIScene.ts`
- Giao diện người chơi trong `UIScene.ts` được cách ly tuyệt đối khỏi các cấu trúc debug.
- Cụm 4 thanh chỉ số sinh tồn (`X: 12..374, Y: 8..100`), Khung Nhiệm Vụ (`X: 920..1260, Y: 16..94`), Mini-map (`X: 1070..1260, Y: 104..248`) và Thanh Quickslots (chính giữa đáy `X: 500..780`) hoàn toàn không bị bảng F9 xâm phạm.

---

### 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BIÊN DỊCH

- **Kiểm thử tự động (`verify_v15_04_f9_debug_separation.mjs`):**
  - **16/16 bài kiểm tra ĐẠT (PASS 100%)**:
    1. `isEnabled` mặc định là `false` (TẮT hoàn toàn).
    2. `debugGfx` mặc định ẩn (`setVisible(false)`).
    3. `uiContainer` mặc định ẩn (`setVisible(false)`).
    4. Arcade Physics `drawDebug` mặc định tắt khi khởi tạo.
    5. Đã xóa bỏ hoàn toàn vị trí cũ `(16, 106)`.
    6. Font chữ bảng F9 đã được thu gọn về `11px`.
    7. Bảng F9 tự động neo vào góc phải/dưới màn hình dựa trên kích thước text.
    8. `GameScene` khởi tạo `hitboxInspector` sạch sẽ.
    9. `GameScene` đảm bảo `physics.world.drawDebug` luôn là `false`.
    10. `GameScene` đảm bảo `debugGraphic` luôn ẩn.
    11. `UIScene` hoàn toàn tách biệt, không chứa logic debug nội bộ.
    12. Cụm 4 thanh chỉ số sinh tồn nằm an toàn tại `X: 12..374, Y: 8..100`.
    13. Vị trí X ($\ge 850\text{ px}$) nằm sát cạnh phải màn hình.
    14. Vị trí Y ($\ge 400\text{ px}$) nằm ở nửa dưới màn hình.
    15. Vị trí X cách xa cụm thanh chỉ số ít nhất $510\text{ px}$.
    16. Vị trí Y cách xa cụm thanh chỉ số ít nhất $338\text{ px}$.
- **Kiểm tra TypeScript (`npx tsc --noEmit`):** **0 lỗi biên dịch**.
- **Kiểm tra đóng gói (`npm run build`):** Hoàn tất trong **9.79s** không phát sinh lỗi.
