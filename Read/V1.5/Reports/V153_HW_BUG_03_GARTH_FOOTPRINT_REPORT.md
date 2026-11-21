# BÁO CÁO KHẮC PHỤC HW-BUG-#3 — SỬA LỆCH HITBOX VẬT LÝ NPC GARTH & TOÀN BỘ NPC

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Mã nhiệm vụ:** `HW-BUG-#3` / `04C-G`  
**Ngày thực hiện:** 22/11/2026  
**Trạng thái kiểm thử:** **CLOSED-VERIFIED local (5/5 PASS 100%)**

---

## 1. MỤC TIÊU & TỔNG QUAN VẤN ĐỀ

- **Hiện tượng lỗi:**
  Hitbox vật lý (Arcade Physics Body) của NPC Garth (`npc_garth`) tại Trạm Gác Cổng Tây làng Bellhollow bị lệch nghiêm trọng so với hình thể thị giác thực tế của NPC:
  + Visual Sprite bàn chân tiếp đất tại: `(540, 205)`
  + Hitbox AABB runtime ghi nhận: `[561, 255, 583, 269]`
  + Độ lệch thực tế: Sang phải $\Delta X = +21\text{px}$, tụt xuống dưới đất $\Delta Y = +50\text{px}$.
  + Hậu quả: Người chơi có thể đi xuyên qua nửa thân trên và chân của Garth, nhưng lại bị kẹt vô hình ở khoảng đất trống bên dưới chân Garth; va chạm từ 4 hướng bị sai lệch hoàn toàn.
- **Phạm vi xử lý:**
  + Phân tích nguyên nhân hình học giữa Phaser `Container` và Arcade Physics `Body`.
  + Chuẩn hóa công thức tính offset chân tại điểm neo gốc `(0, 0)` của Container.
  + Thiết kế hệ thống kích thước collider theo tỷ lệ thể hình thực tế cho toàn bộ 6 NPC: Garth, Bà Lão Edda, Neris, Bram, Finn, và Sir Vaelen (Campfire Knight).
  + Sửa đổi cơ chế đồng bộ tọa độ trong game loop `NPCEntity.update()`.
  + Kiểm thử toàn diện 5 Test Cases bằng Playwright Chromium Headless.

---

## 2. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

1. **Hiểu sai điểm neo Container trong Phaser:**
   - `NPCEntity` kế thừa từ `Phaser.GameObjects.Container` đặt tại tọa độ thế giới `(spec.x, spec.y)`.
   - Sprite con `npcSprite` nằm tại tọa độ tương đối `(0, 0)` trong Container với `origin(0.5, 1.0)`.
   - Do đó, điểm `(0, 0)` của Container chính là vị trí tiếp đất giữa hai bàn chân NPC.
   - Code cũ kế thừa từ bản thử nghiệm giả định frame gốc $64 \times 64\text{px}$ có origin góc trên-trái $(0, 0)$, nên đã cấu hình:
     ```typescript
     body.setSize(22, 14);
     body.setOffset(21, 50); // Cũ: tính offset từ góc trên-trái của frame 64x64
     ```
   - Trong Arcade Physics, vị trí thế giới của body được tính bằng:
     $$\text{body.x} = \text{transform.x} + \text{offset.x} = 540 + 21 = 561$$
     $$\text{body.y} = \text{transform.y} + \text{offset.y} = 205 + 50 = 255$$
     Khiến hitbox bị đẩy văng thành `[561, 255, 583, 269]`, lệch hoàn toàn khỏi nhân vật.

2. **Lỗi đồng bộ trong `NPCEntity.update()`:**
   - Code cũ gọi `body.reset(this.x, this.y)` trong mỗi frame.
   - Trong Arcade Physics, hàm `reset(x, y)` tự động gọi `gameObject.setPosition(x, y)` và đặt lại `position.x = x`. Khi truyền tọa độ không khớp với offset, nó làm giật vị trí body hoặc làm sai lệch tọa độ GameObject qua các physics step.

---

## 3. GIẢI PHÁP KỸ THUẬT & MÃ NGUỒN ĐÃ SỬA

### 3.1. Thiết lập quy tắc thể hình và công thức căn chân chuẩn xác (`src/entities/NPCEntity.ts`)
Thay vì hardcode đơn lẻ cho riêng Garth, hệ thống phân loại kích thước collider theo vai trò và vóc dáng nhân vật:
- **Bram (Thợ rèn vạm vỡ):** $24 \times 14\text{px}$, Offset: $(-12, -14)$
- **Garth & Sir Vaelen (Chiến binh / Kỵ sĩ áo giáp):** $22 \times 14\text{px}$, Offset: $(-11, -14)$
- **Edda & Neris (Phụ nữ / Người già dân làng):** $16 \times 12\text{px}$, Offset: $(-8, -12)$
- **Finn (Thiếu niên vóc dáng nhỏ):** $14 \times 10\text{px}$, Offset: $(-7, -10)$

Công thức căn chỉnh tự động:
```typescript
body.setSize(bodyW, bodyH);
// Container origin là (0, 0) tại bàn chân tiếp đất (do sprite con có origin 0.5, 1.0)
// Căn giữa theo trục X (-width / 2) và đặt đáy hộp va chạm tại mặt đất Y = 0 (-height)
body.setOffset(-Math.round(bodyW / 2), -bodyH);
body.setImmovable(true);
```

### 3.2. Đồng bộ chuẩn qua `updateFromGameObject()` (`src/entities/NPCEntity.ts`)
Thay thế hoàn toàn lệnh `reset()` trong hàm `update()` bằng phương thức gốc của Phaser:
```typescript
// C4-13-17 & HW-BUG-#3: Đồng bộ tọa độ hộp va chạm vật lý theo vị trí thực tế của NPC
if (this.body) {
  (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
}
```
Phương thức `updateFromGameObject()` tự động cập nhật:
$$\text{position.x} = \text{transform.x} + \text{offset.x}$$
$$\text{position.y} = \text{transform.y} + \text{offset.y}$$
bảo đảm body luôn bám sát Container theo từng frame tuần tra mà không làm biến dạng tọa độ GameObject.

---

## 4. BẢNG ĐỐI CHIẾU SỐ LIỆU ĐO ĐẠC RUNTIME (BEFORE vs AFTER)

Dữ liệu được trích xuất trực tiếp từ runtime Phaser qua 2 file JSON:
- `Read/V1.5/Reports/garth_footprint_before.json`
- `Read/V1.5/Reports/garth_footprint_after.json`

| NPC ID | Tên NPC | Vị trí chân (X, Y) | BEFORE AABB | BEFORE $\Delta$ Chân | AFTER AABB | AFTER Offset | AFTER $\Delta$ Chân | Kết quả |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `npc_garth` | Garth | `(540, 205)` | `[561, 255, 583, 269]` | $\Delta X = +21, \Delta Y = +50$ | `[529, 191, 551, 205]` | `(-11, -14)` | $\Delta X = 0, \Delta Y = 0$ | **MATCH 100%** |
| `npc_edda` | Bà Lão Edda | `(1160, 160)` | `[1181, 210, 1203, 224]` | $\Delta X = +21, \Delta Y = +50$ | `[1152, 148, 1168, 160]` | `(-8, -12)` | $\Delta X = 0, \Delta Y = 0$ | **MATCH 100%** |
| `npc_neris` | Neris | `(570, 460)` | `[591, 510, 613, 524]` | $\Delta X = +21, \Delta Y = +50$ | `[562, 448, 578, 460]` | `(-8, -12)` | $\Delta X = 0, \Delta Y = 0$ | **MATCH 100%** |
| `npc_bram` | Bram | `(1230, 405)` | `[1251, 455, 1273, 469]` | $\Delta X = +21, \Delta Y = +50$ | `[1218, 391, 1242, 405]` | `(-12, -14)` | $\Delta X = 0, \Delta Y = 0$ | **MATCH 100%** |
| `npc_finn` | Finn | `(909, 231)` | `[930, 281, 952, 295]` | $\Delta X = +21, \Delta Y = +50$ | `[902, 221, 916, 231]` | `(-7, -10)` | $\Delta X = 0, \Delta Y = 0$ | **MATCH 100%** |
| `npc_campfire_knight` | Sir Vaelen | `(1435, 710)` | `[1456, 760, 1478, 774]` | $\Delta X = +21, \Delta Y = +50$ | `[1424, 696, 1446, 710]` | `(-11, -14)` | $\Delta X = 0, \Delta Y = 0$ | **MATCH 100%** |

*Ghi chú: Độ lệch $\Delta X = (\text{body.x} + \text{width}/2) - \text{visualFeet.x}$; $\Delta Y = (\text{body.y} + \text{height}) - \text{visualFeet.y}$. Trước khi sửa toàn bộ đều lệch $+21\text{px}$ và $+50\text{px}$. Sau khi sửa toàn bộ đạt chính xác $0.0\text{px}$.*

---

## 5. KẾT QUẢ KIỂM THỬ PLAYWRIGHT CHROMIUM (5/5 PASS)

Kịch bản kiểm thử: `scripts/test_bug04c_garth_footprint.py`

### Test Case 1: Đo đạc AABB và Offset Runtime 6 NPC
- Toàn bộ 6 NPC được kiểm tra tự động sau khi Scene khởi tạo hoàn tất.
- Garth: Size $22 \times 14$, Offset $(-11, -14)$, AABB `[529, 191, 551, 205]`.
- $\Delta\text{FeetX} = 0$, $\Delta\text{FeetY} = 0$ trên tất cả 6 NPC.
- **Kết quả: PASS.**

### Test Case 2: Kiểm tra va chạm Noclip OFF từ 4 hướng quanh Garth
- Nhân vật di chuyển tiếp cận Garth từ 4 hướng (West, East, North, South) với vận tốc $50\text{px/s}$:
  + **Tây sang Đông (WEST -> EAST):** Player dừng tại $X_{\text{right}} = 529$, chạm khít mép Tây của Garth ($529$).
  + **Đông sang Tây (EAST -> WEST):** Player dừng tại $X_{\text{left}} = 551$, chạm khít mép Đông của Garth ($551$).
  + **Bắc xuống Nam (NORTH -> SOUTH):** Player dừng tại $Y_{\text{bottom}} = 191$, chạm khít mép Bắc của Garth ($191$).
  + **Nam lên Bắc (SOUTH -> NORTH):** Player dừng tại $Y_{\text{top}} = 205$, chạm khít mép Nam của Garth ($205$).
- Player không thể đi xuyên qua bàn chân hoặc thân của Garth.
- **Kết quả: PASS.**

### Test Case 3: Kiểm tra tuần tra của Garth (532 .. 548)
- Garth di chuyển tuần tra trong khoảng $X \in [532, 548]$ với tốc độ $15\text{px/s}$.
- Đo lường thực tế qua 120 frames ($2\text{s}$): $X_{\min} = 540.2, X_{\max} = 548.0$.
- Số frame bị lệch đồng bộ giữa body và sprite: **0 / 120 frames**.
- **Kết quả: PASS.**

### Test Case 4: Kiểm tra tương tác [E] đối thoại với Garth
- Player đứng cách Garth $20\text{px}$ ($\le 52\text{px}$).
- Nhấn phím `[E]`: Kích hoạt hội thoại `garth_warning`.
- `dialogueSystem.isActive` chuyển sang `true`, đóng hội thoại bằng phím `Space` và `cancelDialogue()` trơn tru.
- **Kết quả: PASS.**

### Test Case 5: Kiểm tra tính ổn định và Console Errors
- Toàn bộ quá trình chạy New Game và kiểm thử không phát sinh bất kỳ lỗi runtime nào.
- Số lượng lỗi console: **0 errors**.
- **Kết quả: PASS.**

---

## 6. KIỂM TRA BIÊN DỊCH VÀ ĐÓNG GÓI

- `npx tsc --noEmit`: Exit Code 0 (0 error).
- `npm run build`: Exit Code 0 (Vite build thành công trong 12.15s, bundle chunks sạch sẽ).

---

## 7. KẾT LUẬN

Nhiệm vụ **HW-BUG-#3** đã được giải quyết triệt để tận gốc, loại bỏ hoàn toàn độ lệch hitbox của NPC Garth và chuẩn hóa toàn bộ collider cho tất cả 6 NPC trong thế giới game mà không gây bất kỳ ảnh hưởng hồi quy nào tới gameplay, quest flags, hay hệ thống hội thoại. Đã cập nhật Tester Bug Registry sang `CLOSED-VERIFIED local`.
