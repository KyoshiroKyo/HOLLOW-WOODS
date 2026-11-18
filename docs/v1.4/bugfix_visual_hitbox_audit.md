# BÁO CÁO RÀ SOÁT LỖI ĐỒ HỌA, HITBOX & VA CHẠM — HOLLOW WOODS V1.4

**Ngày thực hiện:** 18/11/2026  
**Phiên bản dự án:** HOLLOW WOODS V1.4.0 (Phaser 4 + TypeScript)  
**Mục tiêu:** Rà soát toàn diện mã nguồn tạo bản đồ, nhà cửa, cây cối, biên khu vực và nhân vật theo phản hồi từ người chơi; xây dựng công cụ kiểm tra trực quan F9 Debug Overlay.

---

## 1. CÔNG CỤ KIỂM TRA KỸ THUẬT: F9 HITBOX & VISUAL DEBUG INSPECTOR

Hệ thống đã tích hợp công cụ kiểm tra va chạm thời gian thực tại [src/utils/HitboxDebugInspector.ts](file:///g:/HOLLOW%20WOODS/src/utils/HitboxDebugInspector.ts):
- **Phím kích hoạt:** Bật / Tắt nhanh bằng phím `F9` (mặc định **TẮT** khi vào game).
- **Vẽ viền va chạm Arcade Physics:**
  - **Vật cản tĩnh (Static Colliders):** Vẽ khối màu đỏ bán trong suốt (`rgba(255, 0, 0, 0.32)`) kèm viền đỏ sáng (`#ff3333`) và chấm tâm định vị cho 100% vật cản thuộc `WorldBuilder.colliderGroup` và `zones.json`.
  - **Vùng tương tác (Interactables):** Vẽ viền vàng hổ phách bán trong suốt (`rgba(241, 196, 15, 0.20)`) cho toàn bộ rương, bụi rậm ẩn nấp, thảo dược, bia đá.
  - **Nhân vật & Thực thể di động:** Vẽ hitbox xanh lục (`#00ffcc`) cho người chơi cùng điểm neo gót chân (Anchor); vẽ hitbox tím/đỏ cho The Listener, Skull Wolf, Hiệp sĩ sa ngã.
- **HUD hiển thị thông số:** Góc trên bên trái hiển thị tọa độ gót chân `X, Y`, tên phân khu hiện tại (`currentZoneId`), tổng số collider tĩnh và số thực thể dynamic đang nạp.

---

## 2. PHÂN TÍCH NGUYÊN NHÂN LỖI 1: ĐI XUYÊN QUA NHÀ & VẬT CẢN TÀNG HÌNH GẦN NHÀ

### A. Lỗi lệch 16px do cơ chế tính `body.offset` trong Phaser Arcade Physics
Trong [src/world/WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts) (các hàm `createBuilding`, `createBellTower`, `createTree`, `setupZoneColliders`):
```typescript
// Mã nguồn hiện tại trong WorldBuilder.ts:
const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
body.setVisible(false);
(body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
(body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);
```

#### Phân tích toán học & cơ chế engine:
1. Khi gọi `this.colliderGroup.create(cx, cy, undefined)`, Phaser tạo một Sprite với texture mặc định 32×32 pixel, tâm đặt tại `(cx, cy)` và điểm neo mặc định là `origin = (0.5, 0.5)`.
2. Do đó, góc trên-trái hiển thị (`displayOrigin`) của Sprite nằm tại:
   $$\text{DisplayOriginX} = 16\text{ px}, \quad \text{DisplayOriginY} = 16\text{ px}$$
3. Trong Arcade Physics, công thức tính tọa độ thực của hitbox là:
   $$\text{Body.position.x} = \text{Sprite.x} - \text{DisplayOriginX} + \text{offset.x}$$
   $$\text{Body.position.y} = \text{Sprite.y} - \text{DisplayOriginY} + \text{offset.y}$$
4. Khi lập trình viên gán `setOffset(-colW / 2, -colH / 2)`, giá trị offset bị thiếu bù trừ 16 pixel của texture gốc:
   $$\text{Actual Body X} = (cx - 16) - \frac{colW}{2} = \left(cx - \frac{colW}{2}\right) - 16$$
   $$\text{Actual Body Y} = (cy - 16) - \frac{colH}{2} = \left(cy - \frac{colH}{2}\right) - 16$$
5. **Hậu quả trực tiếp:** Toàn bộ hộp va chạm bị **lệch sang trái 16px và trồi lên trên 16px** so với vị trí mong muốn!

### B. Hiện tượng tại Nhà Edda (x=648, y=50) & Nhà Neris (x=914, y=44)
1. **Tại sao đi xuyên qua nhà:**
   - Kích thước đồ họa sprite nhà là `112×80 px`, chiếm vùng không gian từ $Y = 26$ đến $Y = 106$.
   - Chiều cao hộp va chạm được khai báo là $colH = 42\text{ px}$.
   - Do bị lệch lên trên 16px, hộp va chạm chỉ bao phủ từ $Y = 40$ đến $Y = 82$.
   - **Khoảng hở chết:** Vùng chân tường và cửa ra vào từ $Y = 82$ đến $Y = 106$ (**rộng 24 pixel**) hoàn toàn trống rỗng không có bất kỳ collider nào. Người chơi đi từ phía nam lên sẽ bước xuyên thẳng vào lòng nhà và đứng trên nóc/tường nhà!
2. **Tại sao có vật cản tàng hình gần nhà:**
   - Do hộp va chạm bị lệch sang trái 16px, cạnh trái của collider nằm tại $X = 635$ (trong khi mép tường nhà bắt đầu tại $X = 648$).
   - Khoảng không gian **13px ngoài sân hiên bên trái nhà** bị collider vô hình chiếm giữ, khiến người chơi đang đi trên nền đất trống thì bị chặn đứng lại như đụng phải "tường vô hình".
3. **Hiện tượng tương tự trên cây cối:**
   - Tại hàm `createTree` ([line 3000](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3000)) và `placeVariantTree` ([line 3978](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3978)), gốc cây rộng 20px nhưng collider bị lệch sang trái 16px. Người chơi va vào không khí bên trái thân cây, nhưng lại đi xuyên qua nửa thân cây bên phải.

---

## 3. PHÂN TÍCH NGUYÊN NHÂN LỖI 2: KHE HỞ BIÊN BẢN ĐỒ Ở RỪNG SÂU (DEEP FOREST)

Qua rà soát tọa độ hình học giữa [src/data/zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json) và [src/world/WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L6913-L6936), phát hiện 2 nguyên nhân cốt lõi:

### A. Khoảng trống 85px giữa các cây viền bản đồ
Trong `WorldBuilder.ts`:
```typescript
// Dàn cây viền phía Bắc (wy: -610..-570)
for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 105) {
  this.createTree(x, -590 + ((x % 3) * 18), 'Cây Rừng Cổ Thụ Viền Bắc');
}
// Dàn cây viền phía Tây (wx: 1620..1660)
for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
  this.createTree(1640 + ((Math.abs(y) % 2) * 20), y, 'Cây Rừng Cổ Thụ Viền Tây');
}
```
1. Bước nhảy rải cây là `105 px` (phía Bắc/Nam) và `95 px` (phía Tây/Đông).
2. Đường kính gốc cây có collider chỉ rộng `20 px`.
3. **Khoảng hở:** Giữa 2 thân cây liên tiếp tồn tại một khoảng hở từ **$75 - 85\text{ px}$** (trong khi người chơi chỉ rộng $14\text{ px}$).
4. Vị trí rải cây viền lại nằm sâu bên trong bản đồ so với biên vật lý của `zones.json`:
   - Dãy cây Bắc đặt tại $Y = -590$, cách biên bản đồ $Y = -640$ tới **50 pixel**.
   - Dãy cây Tây đặt tại $X = 1640$, cách biên bản đồ $X = 1600$ tới **40 pixel**.
5. Người chơi lách qua khoảng trống giữa 2 thân cây sẽ lọt vào "vùng đệm chết" (dead zone) giữa hàng cây và vách biên, không thể quay trở ra nếu bị cản bởi tán lá lớn.

### B. Xung đột đè Boundary Collider lên Trigger chuyển vùng (Transition Overlaps)
Phát hiện **3 vị trí nghẽn lối** nghiêm trọng tại Deep Forest:
1. **Lối vào Vực Sâu Bóng Tối (`to_abyssal_chasm`):**
   - Vùng kích hoạt: $X = 2200..2280, Y = -640..-616$.
   - Collider biên `df_bound_top`: $X = 1600..2880, Y = -640, H = 30$.
   - **Xung đột:** Collider biên chạy dài liền mạch đè kín trọn vẹn 80px cửa ngõ, ngăn cản người chơi chạm vào trigger nếu không đi chéo góc.
2. **Lối vào Đầm Lầy Tĩnh Lặng (`to_silent_mire_from_df`):**
   - Vùng kích hoạt: $X = 2840..2880, Y = -320..-200$.
   - Collider biên `df_bound_right`: $X = 2850..2880, Y = -640..0, H = 640$.
   - **Xung đột:** Collider biên chạy dọc suốt 640px không hề chừa khoảng mở cho cổng sang Silent Mire.
3. **Lối vào Khoảng Trống Thì Thầm (`to_whispering_clearing`):**
   - Vùng kích hoạt: $X = 1800..1880, Y = -60..-20$.
   - Collider biên `df_bound_bottom_left`: $X = 1600..2000, Y = -25..0$.
   - **Xung đột:** Bờ tường đáy phía nam cắt ngang qua nửa dưới của trigger chuyển vùng.

---

## 4. PHÂN TÍCH NGUYÊN NHÂN LỖI 3: THIẾU NHẤT QUÁN TỶ LỆ SCALE & DEPTH SORTING

### A. Thiếu nhất quán về hệ số Scale & Hitbox
1. **Cây cối (Trees):**
   - Hệ số `scale` được rải ngẫu nhiên từ `0.86` đến `1.20` để tạo độ đa dạng thị giác (`placeVariantTree`).
   - Tuy nhiên, kích thước hộp va chạm gốc cây luôn cố định là `20×12 px` (hoặc `24×12 px` với cây rỗng).
   - Với cây cổ thụ đại ngàn scale `1.20×`, tán lá và thân cây to hơn 20% nhưng chân gốc va chạm lại quá nhỏ, người chơi đi lún sâu vào rễ cây trước khi bị cản.
   - Với cây nhỏ scale `0.86×`, hitbox lại nhô ra ngoài vỏ cây.
2. **Tảng đá (Rocks):**
   - Sprite đá lớn và vừa được nạp với các tỷ lệ co giãn khác nhau giữa các phân khu (từ `0.8×` đến `1.5×`), nhưng `createRock` tạo collider dựa trên kích thước ước tính thay vì kích thước thực sau scale.
3. **Thiếu `refreshBody()` trên Sprite vật lý:**
   - Trong Arcade Physics, khi gọi `sprite.setScale(...)` hoặc `sprite.setOrigin(...)` trên một đối tượng đã có Physics Body, nếu không gọi `sprite.refreshBody()` (đối với Static Body) hoặc `body.setSize()` đồng bộ, khung va chạm sẽ giữ nguyên tỷ lệ cũ và lệch điểm neo so với hình ảnh hiển thị.

### B. Sai lệch Thứ tự Hiển thị (Y-Sorting / Depth Sorting)
1. **Lỗi đè hình tại công trình nhà cửa:**
   - Sprite nhà được gán `house.setDepth(y + h)` (với Nhà Edda là $50 + 48 = 98$).
   - Nhân vật Wayfarer dùng depth động theo chân đứng: `player.setDepth(player.y)`.
   - Khi nhân vật đi vào vùng chân tường bị hổng collider ($Y = 85..97$), tọa độ $Y$ của nhân vật nhỏ hơn $98$, dẫn đến việc **hình ảnh ngôi nhà được render đè lên toàn bộ cơ thể nhân vật**, khiến người chơi biến mất sau bức tường phía trước.
2. **Móng nhà và bóng đổ tiếp xúc:**
   - Các hình vẽ bóng đổ móng nhà (`footingGfx`) được gán cứng `setDepth(-95)`. Khi có các lớp nền gạch lát đá (`setDepth(-80)` hoặc `-90`), bóng móng nhà bị chìm xuống dưới lớp gạch lát sân hiên.
3. **Các vật thể gán Depth cố định:**
   - Phát hiện 24 vị trí trong `WorldBuilder.ts` gán depth tĩnh (như 10, 50, 100) thay vì gán theo trục $Y$, gây ra hiện tượng nhân vật đi vòng ra phía sau nhưng vẫn bị vật thể vẽ đè lên mặt.

---

## 5. BẢNG TỔNG HỢP DANH SÁCH LỖI VÀ TỆP TIN LIÊN QUAN

| Nhóm lỗi | Tệp tin & Vị trí | Mô tả chi tiết lỗi | Mức độ |
| :--- | :--- | :--- | :---: |
| **Lệch Offset -16px** | [WorldBuilder.ts:3080](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3080) | `createBuilding`: `setOffset(-colW/2, -colH/2)` làm lệch hitbox nhà sang trái 16px, lên trên 16px. | **Nghiêm trọng** |
| **Lệch Offset -16px** | [WorldBuilder.ts:3107](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3107) | `createBellTower`: Hitbox Tháp chuông lệch khỏi bệ đá 16px. | **Nghiêm trọng** |
| **Lệch Offset -16px** | [WorldBuilder.ts:3003](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3003), [3983](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3983) | `createTree`, `placeVariantTree`: Hitbox gốc cây lệch khỏi thân 16px. | **Trung bình** |
| **Thiếu Collider Chân Nhà** | [WorldBuilder.ts:3075](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3075) | Hitbox nhà chỉ cao 42px trong khi sprite cao 80px; hở 24px cửa ra vào. | **Nghiêm trọng** |
| **Hở biên Rừng Sâu** | [WorldBuilder.ts:6915-6936](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L6915-L6936) | Hàng cây viền rải cách nhau 105px, hở khe 85px và cách biên 50px. | **Nghiêm trọng** |
| **Đè Collider lên Cổng** | [zones.json](file:///g:/HOLLOW%20WOODS/src/data/zones.json#L240-L310) | `df_bound_top`, `df_bound_right` đè bít lối vào Abyssal Chasm và Silent Mire. | **Nghiêm trọng** |
| **Bỏ sót type: wall** | [WorldBuilder.ts:4776](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L4776) | `setupZoneColliders` chỉ nạp `type === 'boundary'`, bỏ rơi các wall trong JSON. | **Trung bình** |
| **Sai lệch Depth Nhà** | [WorldBuilder.ts:3070](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3070) | `house.setDepth(y + h)` đè lên nhân vật khi nhân vật bước vào khe hở chân tường. | **Trung bình** |

---

## 6. KẾT LUẬN & ĐỀ XUẤT CHO BƯỚC TIẾP THEO

1. **Về công cụ:** Chế độ `F9 Hitbox Debug Inspector` đã sẵn sàng hoạt động trong game, cung cấp cái nhìn trực quan chính xác về mọi khối va chạm và tọa độ nhân vật.
2. **Về nguyên nhân gốc rễ:**
   - Đã xác định chính xác công thức toán học sai lệch `-16px` của `setOffset` trên Sprite Arcade Physics mặc định.
   - Đã chỉ rõ khoảng hổng 24px dưới chân các ngôi nhà tại làng Bellhollow.
   - Đã định vị chính xác 3 điểm nghẽn collider đè lên cổng chuyển vùng và khoảng hở 85px giữa các cây viền Rừng Sâu.
3. **Khuyến nghị bước tiếp theo:** Tiến hành sửa chữa có kiểm soát theo từng cụm lỗi (Bellhollow Buildings -> Deep Forest Boundaries -> Scale & Depth Consistency) dựa trên số liệu kiểm toán chi tiết trong báo cáo này.
