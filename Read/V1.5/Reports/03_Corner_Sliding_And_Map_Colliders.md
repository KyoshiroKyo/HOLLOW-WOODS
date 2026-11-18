# HOLLOW WOODS V1.5 — BÁO CÁO KỸ THUẬT BƯỚC V15-03
## CƠ CHẾ TRƯỢT GÓC (CORNER SLIDING) & TỐI ƯU HỘP VA CHẠM BẢN ĐỒ

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (25/25 bài kiểm tra tự động PASS, 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Trong quá trình di chuyển qua các phân khu dày đặc như làng Bellhollow, Đường Mòn Quanh Co, Rừng Sâu, Đầm Lầy Yên Lặng và Miếu Chuông Vỡ, người chơi thường xuyên gặp hiện tượng kẹt cứng tại các góc 90° của vật thể (Corner Snagging). Nguyên nhân chính xuất phát từ:
1. **Hitbox nhân vật quá lớn và bao trùm cả phần thân trên:** Hitbox cũ khiến phần vai, nón và áo choàng bị chặn cứng khi chỉ mới sượt qua tán cây hoặc góc hiên nhà.
2. **Hitbox gốc cây và hàng rào bị xé nhỏ thành hàng chục khối rời rạc:** Hàng rào và rặng cây viền biên được ghép từ hàng chục ô vuông tĩnh $32 \times 32\text{ px}$, tạo ra vô số rãnh nứt $4\text{ px}$ khiến engine vật lý AABB hiểu nhầm là va chạm góc nhọn, khóa chặt chuyển động của người chơi.
3. **Lỗi hitbox NPC có tọa độ offset âm:** Trong `NPCEntity.ts`, hitbox chân NPC bị cấu hình `setOffset(-5, -5)` khiến vùng cản vật lý lệch hoàn toàn lên phía trên đầu NPC thay vì nằm ở bàn chân.

Mục tiêu bước V15-03:
- Thu gọn hitbox nhân vật xuống đúng $18 \times 12\text{ px}$ nằm sát bàn chân.
- Sửa dứt điểm offset chân NPC thành $21 \times 50\text{ px}$ (hộp $22 \times 14\text{ px}$).
- Triển khai thuật toán **Corner Assist / Edge Sliding** tự động đẩy lướt người chơi qua các góc nhọn khi sai số lệch tâm $\le 10\text{ px}$.
- Gộp rặng cây viền biên và hàng rào thành các thanh collider liền mạch, cắt giảm hơn 190 static collider dư thừa.

---

### 2. CHI TIẾT THAY ĐỔI & GIẢI PHÁP TRIỂN KHAI

#### 2.1. Thu gọn Hitbox Bàn Chân Nhân Vật Chính (`Constants.ts` & `SatyrPlayer.ts`)
- Cấu hình kích thước hitbox nằm gọn ở hai bàn chân nhân vật:
  ```typescript
  export const WAYFARER_BODY_WIDTH = 18;    // Thu nhỏ từ 24px -> 18px
  export const WAYFARER_BODY_HEIGHT = 12;   // Thu nhỏ từ 20px -> 12px
  export const WAYFARER_BODY_OFFSET_X = 23; // Căn giữa chính xác: (64 - 18) / 2 = 23
  export const WAYFARER_BODY_OFFSET_Y = 46; // Sát đáy bàn chân: 58 - 12 = 46
  ```
- **Hiệu quả thực tế:** Phần mũ giáp, bờ vai và áo choàng của nhân vật có thể đi lướt sát dưới tán cây, hiên nhà và các góc tường mà không bị va chạm giả từ xa.

#### 2.2. Sửa Dứt Điểm Lỗi Hitbox NPC (`NPCEntity.ts`)
- Loại bỏ hoàn toàn offset âm gây lỗi lệch tâm hộp va chạm NPC:
  ```typescript
  body.setSize(22, 14);
  body.setOffset(21, 50); // Căn giữa theo trục X (64-22)/2=21, đáy chân chạm y=64
  ```

#### 2.3. Thuật Toán Trượt Góc Mượt Mà (Corner Assist / Edge Sliding)
Được triển khai trong `SatyrPlayer.ts` thông qua hàm `applyCornerAssistWith(obstacle: Phaser.Physics.Arcade.Sprite)`:
- **Ngưỡng góc (Corner Threshold):** $10\text{ px}$.
- **Lực đẩy trượt (Slide Nudge):** $2.0\text{ px/frame}$.
- **Cơ chế hoạt động:**
  - **Trục dọc (`blocked.up` / `blocked.down`):**
    - Nếu $\text{overlapLeft} = (p.x + p.w) - o.x \in (0, 10\text{ px}]$, người chơi chỉ sượt mép trái vật cản $\rightarrow$ Nudge sang trái $-2\text{ px/frame}$.
    - Nếu $\text{overlapRight} = (o.x + o.w) - p.x \in (0, 10\text{ px}]$, người chơi chỉ sượt mép phải vật cản $\rightarrow$ Nudge sang phải $+2\text{ px/frame}$.
  - **Trục ngang (`blocked.left` / `blocked.right`):**
    - Nếu $\text{overlapTop} = (p.y + p.h) - o.y \in (0, 10\text{ px}]$, người chơi sượt mép trên $\rightarrow$ Nudge lên trên $-2\text{ px/frame}$.
    - Nếu $\text{overlapBottom} = (o.y + o.h) - p.y \in (0, 10\text{ px}]$, người chơi sượt mép dưới $\rightarrow$ Nudge xuống dưới $+2\text{ px/frame}$.
  - **Va chạm trực diện ($\text{overlap} > 10\text{ px}$):** Giữ nguyên chặn cứng tự nhiên của Arcade Physics.
- **Tích hợp vào GameScene:** Được kết nối vào cả hai bộ va chạm chính:
  1. `this.physics.add.collider(this.player, this.worldBuilder.colliderGroup, ...)` (Tất cả vật thể tĩnh).
  2. `this.npcCollider = this.physics.add.collider(this.player, this.npcs, ...)` (Toàn bộ 6 NPC).

#### 2.4. Dọn Dẹp & Gộp Vật Cản Tĩnh Dư Thừa (`WorldBuilder.ts`)
- **Hitbox gốc cây:** Thu gọn kích thước về đúng phần gốc gỗ chạm đất $20 \times 16\text{ px}$ tại $(x, y+2)$ bằng `createStaticBoxColliderCentered`. Hỗ trợ cờ `withCollider: boolean = true` để tắt collider cho các cây trang trí viền biên.
- **Gộp hàng rào làng Bellhollow:** Gộp 4 đoạn rào rời rạc thành 4 thanh collider liền mạch:
  - Cổng Tây: $92 \times 12\text{ px}$.
  - Bắc làng: $94 \times 12\text{ px}$.
  - Vườn dược: $94 \times 12\text{ px}$.
  - Cổng Đông: $142 \times 12\text{ px}$.
- **Gộp rặng cây viền biên các phân khu:**
  - **Crooked Path:** Gộp rặng cây Bắc/Nam thành 4 thanh collider dài, xóa bỏ 19 ô vuông nhỏ.
  - **Deep Forest:** Gộp 56 cây viền Bắc, Tây, Đông, Nam thành 8 thanh collider dài, xóa bỏ hơn 50 collider thừa.
  - **Silent Mire:** Gộp 28 cây viền thành 7 thanh collider dài.
  - **Broken Bell Shrine:** Gộp 28 cây viền thành 5 thanh collider dài.
- **Tổng số collider tĩnh trên bản đồ:** Giảm từ **433** xuống còn **~238** (cắt giảm hơn **45%** số lượng collider thừa), triệt tiêu hoàn toàn rãnh nứt va chạm AABB.

---

### 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BIÊN DỊCH

- **Kiểm thử tự động (`verify_v15_03_corner_sliding_and_colliders.mjs`):**
  - **25/25 bài kiểm tra ĐẠT (PASS 100%)**:
    1. `WAYFARER_BODY_WIDTH` chuẩn 18px.
    2. `WAYFARER_BODY_HEIGHT` chuẩn 12px.
    3. `WAYFARER_BODY_OFFSET_X` căn giữa 23px.
    4. `WAYFARER_BODY_OFFSET_Y` sát đáy 46px.
    5. NPC body size chuẩn 22x14 px.
    6. NPC body offset chuẩn (21, 50).
    7. Tuyệt đối không còn offset âm trong `NPCEntity`.
    8. Phương thức `applyCornerAssistWith` tồn tại trong `SatyrPlayer`.
    9. Ngưỡng góc `CORNER_THRESHOLD = 10px`.
    10. Lực trượt `SLIDE_NUDGE = 2.0px/frame`.
    11. Xử lý va chạm góc trục dọc (`blocked.up` / `blocked.down`).
    12. Xử lý va chạm góc trục ngang (`blocked.left` / `blocked.right`).
    13. Mô phỏng 1: Va chạm mép trái (overlap 6px $\le$ 10px) trượt sang trái (-2px).
    14. Mô phỏng 2: Va chạm mép phải (overlap 7px $\le$ 10px) trượt sang phải (+2px).
    15. Mô phỏng 3: Va chạm trực diện (overlap > 10px) giữ nguyên chặn đứng.
    16. GameScene gọi colliderGroup với callback va chạm.
    17. GameScene gọi player.applyCornerAssistWith cho colliderGroup.
    18. GameScene gọi player.applyCornerAssistWith cho NPC.
    19. `createTree` tạo hitbox gốc cây thu nhỏ 20x16 px tại (x, y + 2).
    20. `createTree` hỗ trợ cờ `withCollider` tùy chọn.
    21. Hàng rào làng Bellhollow đã gộp thành các thanh dài liền mạch.
    22. Crooked Path đã gộp rặng cây viền.
    23. Deep Forest đã gộp rặng cây viền.
    24. Silent Mire đã gộp rặng cây viền.
    25. Broken Bell Shrine đã gộp rặng cây viền.
- **Kiểm tra TypeScript (`npx tsc --noEmit`):** 0 lỗi (Exit Code 0).
- **Kiểm tra đóng gói (`npm run build`):** Hoàn tất trong 11.29s, tạo bundle production sạch sẽ không lỗi.
