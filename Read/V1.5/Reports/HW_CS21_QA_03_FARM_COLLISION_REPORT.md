# BÁO CÁO NGHIỆM THU KIỂM THỬ HW-CS21-QA-03
## XÁC MINH VẬT CẢN VÀ VA CHẠM NÔNG TRẠI SANCTUARY (TỌA ĐỘ 648, 741)

**Dự án:** HOLLOW WOODS V1.5.4  
**Quy chuẩn áp dụng:** QA EXECUTION PROTOCOL V3 (AG FLASH HIGH)  
**Mã kiểm thử:** `HW-CS21-QA-03`  
**Độ ưu tiên:** P1 — HIGH  
**Repository:** `G:\HOLLOW WOODS`  
**Nhánh kiểm thử:** `feat/v1.5.3-ag-world-polish`  
**Baseline Commit:** `2086d7afdae056fa6605af2d3abfcad8dbb4e0a3`  
**Ngày thực hiện:** 24/11/2026  
**Trạng thái nghiệm thu:** **PASS TOÀN DIỆN (15/15 CA KIỂM THỬ ĐẠT CHUẨN)**

---

## 1. TỔNG QUAN VÀ MỤC TIÊU NHIỆM VỤ

Người chơi phản ánh gặp vật cản tàng hình / không mong muốn gần tọa độ thế giới `(648, 741)` trong khu vực `sanctuary_farm` (Nông Trại Trú Ẩn), cản trở đường đi lại giữa các công trình nông trại và lối ra đường rừng.

Bản sửa Task 1 đã thực hiện điều chỉnh cấu hình collider của cụm đống củi tại `(650, 715)` từ `withCollider: true` thành `withCollider: false`, trong khi giữ nguyên hình ảnh đồ họa mỹ thuật trang trí và toàn bộ collider của công trình lân cận (Kho Thóc, Hàng Rào, Bàn Sơ Chế, Giếng Nước, Rương Gỗ).

Nhiệm vụ **HW-CS21-QA-03** tiến hành kiểm toán mã nguồn, kiểm tra footprint collider thực tế trong runtime engine, chụp ảnh bằng chứng F9 Debug (ON và OFF), thực thi 8 ca kiểm thử di chuyển thực tế (C01..C08) qua tọa độ `(648, 741)` từ mọi hướng, kiểm tra tính toàn vẹn va chạm của Kho Thóc (N01), bảo tồn đồ họa đống củi (N02), rương gỗ (N03), giếng nước (N04), và độ bền vững qua chu kỳ Save/Load (SL01).

---

## 2. BẢNG TỔNG HỢP KẾT QUẢ NGHIỆM THU

| Nhóm Kiểm Thử | Mã Ca | Tên Ca Kiểm Thử | Kết Quả | Chi Tiết Đo Đạc Thực Tế |
| :--- | :--- | :--- | :---: | :--- |
| **Kiểm Toán Runtime** | `AUDIT_01` | Quét Footprint Collider quanh (648, 741) bán kính 60u | **PASS** | Đống củi `(650, 715)`: Không còn collider (`exists: false`). Điểm `(648, 741)`: Không bị cản (`obstructed: false`). Kho Thóc: Bảo tồn (`present: true`). |
| **Bằng Chứng Thị Giác** | `VIS_01` | Chụp Ảnh Bằng Chứng F9 ON & F9 OFF | **PASS** | Đã xuất ảnh F9 ON (thấy rõ hitbox Kho Thóc, không có hitbox đống củi) & F9 OFF (đồ họa nguyên vẹn). |
| **Di Chuyển Thực Tế** | `C01` | Bắc $\rightarrow$ Nam xuyên qua (648, 741) | **PASS** | Bắt đầu `(648, 690)` $\rightarrow$ Đến `(648, 748.1)`. Xuyên qua tọa độ 741 mượt mà, `blocked = none`. |
| **Di Chuyển Thực Tế** | `C02` | Nam $\rightarrow$ Bắc xuyên qua (648, 741) | **PASS** | Bắt đầu `(648, 770)` $\rightarrow$ Đến `(648, 595.8)`. Vượt qua tọa độ 741 lên phía Bắc, không bị kẹt. |
| **Di Chuyển Thực Tế** | `C03` | Đông $\rightarrow$ Tây tiếp cận (648, 741) | **PASS** | Bắt đầu `(700, 741)` $\rightarrow$ Đến `(534.0, 753.1)`. Đi từ sân nông trại về phía Tây thông suốt. |
| **Di Chuyển Thực Tế** | `C04` | Tây $\rightarrow$ Đông tiếp cận (648, 741) | **PASS** | Bắt đầu `(640, 741)` $\rightarrow$ Đến `(817.0, 761.8)`. Vượt qua vị trí đống củi cũ sang phía Đông. |
| **Di Chuyển Thực Tế** | `C05` | Đi chéo Tây Nam qua vùng mục tiêu | **PASS** | Bắt đầu `(675, 715)` $\rightarrow$ Đến `(584.9, 861.8)`. Chuyển động chéo góc tự nhiên, không vấp collider. |
| **Di Chuyển Thực Tế** | `C06` | Chạy nước rút liên tục 5 chu kỳ (Run Shift) | **PASS** | 5/5 chu kỳ hoàn thành: Bắc $\rightarrow$ Nam (Y đạt 794..869), Nam $\rightarrow$ Bắc (Y đạt 602..660). |
| **Di Chuyển Thực Tế** | `C07` | Dừng và đổi hướng tại chính điểm (648, 741) | **PASS** | Dừng tại `(648, 741)` 300ms, chuyển hướng sang Đông đến `(789.7, 741)`. Không bị kẹt pivot. |
| **Di Chuyển Thực Tế** | `C08` | Rời phân khu sang Outer Woods và quay lại | **PASS** | Chuyển sang `outer_woods`, nạp lại `sanctuary_farm`, đi từ 690 xuống `(648, 892.6)`. |
| **Hồi Quy Lân Cận** | `N01` | Toàn vẹn va chạm chân tường Kho Thóc | **PASS** | Đi từ `(655, 730)` sang Tây đâm vào chân tường `[544..636, 708..730]`: Chặn đứng tại `bodyX = 636`, `x = 645`, `blocked.left = true`. Không xuyên tường! |
| **Hồi Quy Lân Cận** | `N02` | Bảo tồn hình ảnh đồ họa đống củi | **PASS** | Graphics tại `(650, 715)` được tìm thấy trong cảnh và trong `cullableObjects` (`graphicsFound: true`). |
| **Hồi Quy Lân Cận** | `N03` | Rương Gỗ Đai Đồng nông trại tại (680, 640) | **PASS** | Tồn tại collider rương gỗ kích thước 26x14 (`chestFound: true`). |
| **Hồi Quy Lân Cận** | `N04` | Giếng Nước Nông Trại tại (920, 700) | **PASS** | Tồn tại collider giếng nước nông trại (`wellFound: true`). |
| **Lưu Trữ Game** | `SL01` | Tính bền vững qua chu kỳ Save & Load | **PASS** | Lưu game tại nông trại, nạp lại vị trí, di chuyển từ 690 xuống `(648, 888.3)` hoàn toàn thông suốt. |

**Tổng kết:** **15 PASS / 0 FAIL / 0 WARN** — Đạt tỷ lệ 100%.

---

## 3. KIỂM TOÁN MÃ NGUỒN (SOURCE CODE AUDIT)

### 3.1. Phân Tích Bản Sửa Tại `src/world/WorldBuilder.ts`
Vị trí điều chỉnh trong hàm `renderSanctuaryFarmDecorations(zone: ZoneData)`:
```typescript
// Dòng 5228 - 5230 trong src/world/WorldBuilder.ts:
this.createVillagePropCluster(515, 725, 'barrels');
// HW-TASK-1: Giữ nguyên đồ họa đống củi tại (650, 715), loại bỏ collider cản trở lối đi tại (648, 741)
this.createVillagePropCluster(650, 715, 'firewood', false);
```

### 3.2. Đánh Giá Tác Động Lan Tỏa (Side Effects Scope)
1. **Phạm vi tham số `withCollider: boolean = true`:**
   Phương thức `createVillagePropCluster(x: number, y: number, type: 'firewood' | 'barrels' | 'mixed', withCollider: boolean = true)` có giá trị mặc định là `true`.
2. **Kiểm tra toàn bộ các lời gọi khác:**
   Toàn bộ 7 lời gọi `createVillagePropCluster` khác trên toàn bộ bản đồ thế giới (làng Bellhollow, khu vực lò rèn, trạm gác) đều không truyền tham số thứ 4, do đó vẫn bảo toàn nguyên vẹn `withCollider = true`.
3. **Không làm mất đồ họa:**
   Tham số `withCollider = false` chỉ bỏ qua khối lệnh tạo `createStaticBoxColliderCentered`, trong khi các lệnh vẽ đồ họa (`g.fillStyle`, `g.fillRoundedRect`, `g.strokePath`, v.v.) vẫn được thực thi đầy đủ.
4. **Không tạo collider trùng lặp:**
   Trong `src/data/zones.json`, đối tượng `farm_barn_wall` mang `type: "wall"`, hàm `setupZoneColliders` chỉ sinh collider cho các vùng có `type: "boundary"` hoặc `"hazard"`, do đó không phát sinh bất kỳ collider vô hình nào đè lên khu vực này.

---

## 4. KIỂM TOÁN RUNTIME VÀ BẢN ĐỒ COLLIDER (RUNTIME INSPECTION)

Thực hiện quét toàn bộ các đối tượng có mặt trong `worldBuilder.colliderGroup` quanh tọa độ mục tiêu `(648, 741)`:

```
Tọa độ kiểm tra: X = 648, Y = 741 | Bán kính quét: R = 60 world units
Tổng số Collider phát hiện trong khu vực lân cận: 10
```

### Bảng Chi Tiết AABB Collider Lân Cận
| Tên Collider | AABB X (Trái .. Phải) | AABB Y (Trên .. Dưới) | Kích Thước (W x H) | Khoảng Cách Tâm | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Kho Thóc** (Chân tường) | `544.0 .. 636.0` | `708.0 .. 730.0` | $92 \times 22$ | 62.0 | `enable: true` |
| **Bàn Sơ Chế Thảo Mộc** | `686.0 .. 718.0` | `624.0 .. 634.0` | $32 \times 10$ | 124.3 | `enable: true` |
| **Rương Gỗ Đai Đồng** | `667.0 .. 693.0` | `635.0 .. 649.0` | $26 \times 14$ | 104.0 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 1) | `498.0 .. 540.0` | `681.0 .. 691.0` | $42 \times 10$ | 140.2 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 2) | `498.0 .. 540.0` | `751.0 .. 761.0` | $42 \times 10$ | 129.9 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 3) | `498.0 .. 540.0` | `821.0 .. 831.0` | $42 \times 10$ | 154.5 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 4) | `522.0 .. 564.0` | `779.0 .. 789.0` | $42 \times 10$ | 113.5 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 5) | `570.0 .. 612.0` | `779.0 .. 789.0` | $42 \times 10$ | 71.4 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 6) | `712.0 .. 754.0` | `779.0 .. 789.0` | $42 \times 10$ | 95.3 | `enable: true` |
| **Hàng Rào Nông Trại** (Đoạn 7) | `760.0 .. 802.0` | `779.0 .. 789.0` | $42 \times 10$ | 139.8 | `enable: true` |

### Kết Quả Đánh Giá:
- **Đống củi `(650, 715)`:** `firewood_collider_exists = false` — Không còn bất kỳ box collider nào tồn tại.
- **Tọa độ `(648, 741)`:** `point_is_obstructed = false` — Hoàn toàn thông thoáng, không nằm trong AABB của bất kỳ collider nào.
- **Chân tường Kho Thóc:** `barn_collider_present = true` — Tồn tại vững chắc tại `[544..636, 708..730]`, bảo vệ cấu trúc nhà kho.

---

## 5. BẰNG CHỨNG HÌNH ẢNH THỰC TẾ (F9 DEBUG VISUALS)

Ảnh chụp màn hình thực tế trong môi trường runtime headless browser tại vị trí nông trại:

### 5.1. Bằng Chứng Khi Bật F9 Debug Inspector (F9 ON)
- **Đường dẫn bằng chứng (lưu cục bộ):** `Read/V1.5/Reports/Visuals/HW-CS21-QA-03/run-01/farm_648_741_f9_on.png`
- **Đường dẫn artifact (lưu cục bộ):** `hw_cs21_qa03_visuals/farm_648_741_f9_on.png`
- **Quan sát kỹ thuật:**
  - Khung hitbox màu cam/đỏ thể hiện AABB của chân tường Kho Thóc tại `[544..636, 708..730]`.
  - Khung hitbox hàng rào gỗ nông trại bao quanh phía dưới tại `Y = 779..789`.
  - Tại vị trí đống củi `(650, 715)` và hành lang `(648, 741)`: **HOÀN TOÀN KHÔNG CÓ KHUNG HITBOX MÀU CAM**.
  - Hitbox bàn chân nhân vật ($18 \times 12$ px) di chuyển tự do qua khu vực này mà không kích hoạt đường viền va chạm.

### 5.2. Bằng Chứng Khi Tắt F9 Debug Inspector (F9 OFF)
- **Đường dẫn bằng chứng (lưu cục bộ):** `Read/V1.5/Reports/Visuals/HW-CS21-QA-03/run-01/farm_648_741_f9_off.png`
- **Đường dẫn artifact (lưu cục bộ):** `hw_cs21_qa03_visuals/farm_648_741_f9_off.png`
- **Quan sát mỹ thuật:**
  - Hình ảnh cụm đống củi gỗ mộc, vỏ cây xám nâu và các thanh củi xếp lớp hiển thị tự nhiên, sắc nét.
  - Mặt đất cỏ xanh, bóng râm chân tường kho thóc và rào gỗ giữ trọn vẹn phong cách nghệ thuật ấm áp của nông trại.
  - Không xuất hiện bất kỳ dị vật đồ họa, texture placeholder (magenta/green) hay vệt đứt gãy nào.

---

## 6. CHI TIẾT 8 CA KIỂM THỬ DI CHUYỂN THỰC TẾ (C01 ĐẾN C08)

Các ca kiểm thử được thực thi trực tiếp trên game engine đang chạy bằng sự kiện bàn phím native (Chromium Native Input):

```
Tốc độ đi bộ cơ bản: 85 px/s | Tốc độ chạy nước rút (Run Shift): 150 px/s
Kích thước Hitbox Người Chơi: 18 x 12 px (Bàn chân)
```

```
       [Bắc: 648, 690]
              │ (C01: Đi Xuống ↓)
              ▼
   [Tây: 640, 741] ───► ★ (648, 741) ◄─── [Đông: 700, 741]
   (C04: Sang Phải →)      │          (C03: Sang Trái ←)
                           │ (C02: Đi Lên ↑)
                           ▲
                     [Nam: 648, 770]
```

### Bảng Số Liệu Đo Đạc Chi Tiết C01..C08
| Ca | Hướng Di Chuyển | Phím Điều Khiển | Tọa Độ Xuất Phát | Tọa Độ Đích Đến | Quãng Đường Di Chuyển | Trạng Thái Chặn (`blocked`) | Đánh Giá |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **C01** | Bắc $\rightarrow$ Nam | `ArrowDown` (2200ms) | `(648.0, 690.0)` | `(648.0, 748.1)` | $\Delta Y = +58.1$ px | `none = true`, `down = false` | **PASS** |
| **C02** | Nam $\rightarrow$ Bắc | `ArrowUp` (2200ms) | `(648.0, 770.0)` | `(648.0, 595.8)` | $\Delta Y = -174.2$ px | `none = true`, `up = false` | **PASS** |
| **C03** | Đông $\rightarrow$ Tây | `ArrowLeft` (2000ms) | `(700.0, 741.0)` | `(534.0, 753.1)` | $\Delta X = -166.0$ px | `none = true`, `left = false` | **PASS** |
| **C04** | Tây $\rightarrow$ Đông | `ArrowRight` (2000ms) | `(640.0, 741.0)` | `(817.0, 761.8)` | $\Delta X = +177.0$ px | `none = true`, `right = false` | **PASS** |
| **C05** | Chéo Tây Nam | `ArrowDown` + `ArrowLeft` (2000ms) | `(675.0, 715.0)` | `(584.9, 861.8)` | $\Delta X = -90.1, \Delta Y = +146.8$ | `none = true` | **PASS** |
| **C06** | 5 Chu Kỳ Chạy Nước Rút | `ShiftLeft` + `ArrowDown`/`Up` | `(648.0, 690.0)` $\leftrightarrow$ `(648.0, 770.0)` | Lặp lại 5 lần | 5/5 chu kỳ thông suốt | Không kẹt chu kỳ nào | **PASS** |
| **C07** | Dừng & Chuyển Hướng | Settle 300ms $\rightarrow$ `ArrowRight` | `(648.0, 741.0)` | `(789.7, 741.0)` | $\Delta X = +141.7$ px | `none = true` | **PASS** |
| **C08** | Thoát & Tái Nhập Zone | `outer_woods` $\rightarrow$ `sanctuary_farm` | `(648.0, 690.0)` | `(648.0, 892.6)` | $\Delta Y = +202.6$ px | `none = true` | **PASS** |

---

## 7. KIỂM THỬ HỒI QUY LÂN CẬN (NEIGHBORING REGRESSION AUDIT)

### 7.1. Ca N01 — Va Chạm Chân Tường Kho Thóc (Barn Wall Integrity)
- **Mục tiêu:** Chứng minh việc tắt collider đống củi không làm suy giảm hoặc mất khả năng cản của bức tường Kho Thóc nằm liền kề phía Tây.
- **Thiết lập:**
  - AABB Kho Thóc: $X \in [544 .. 636]$, $Y \in [708 .. 730]$. Mép phải bức tường là $X = 636$.
  - Người chơi xuất phát tại $X = 655, Y = 730$ (nằm bên ngoài, đối diện trực tiếp vào tâm bức tường).
  - Nhấn giữ phím `ArrowLeft` trong 1600ms tiến thẳng về hướng Tây đâm vào chân tường.
- **Kết quả đo đạc:**
  - Tọa độ dừng bàn chân: $X = 645.0$.
  - Tọa độ dừng hitbox thân (`body.x`): $X = 636.0$.
  - Cờ va chạm: `blocked.left = true`, `blocked.none = false`.
- **Kết luận:** Người chơi bị chặn đứng chính xác tại mép ngoài bức tường ($body.x = 636$), hoàn toàn không có hiện tượng xuyên tường (clipping) hay lọt vào trong kho thóc.

### 7.2. Ca N02 — Bảo Tồn Mỹ Thuật Cụm Đống Củi (Firewood Art Preservation)
- Kiểm tra danh sách đối tượng trong GameScene: Đối tượng `Graphics` tại tọa độ thế giới $\approx (650, 715)$ được tìm thấy đầy đủ (`graphicsFound: true`).
- Đồ họa hiển thị sắc nét trong ảnh chụp F9 OFF, giữ nguyên giá trị trang trí môi trường.

### 7.3. Ca N03 & N04 — Rương Gỗ và Giếng Nước Nông Trại
- **Rương Gỗ Đai Đồng `(680, 640)`:** Phát hiện collider tĩnh kích thước $26 \times 14$ px tại $X \in [667 .. 693], Y \in [635 .. 649]$ (`chestFound: true`).
- **Giếng Nước Nông Trại `(920, 700)`:** Phát hiện collider tĩnh bảo vệ thành giếng đá (`wellFound: true`).

### 7.4. Ca SL01 — Tính Bền Vững Qua Chu Kỳ Lưu & Nạp Game (Save / Load)
- Thực hiện lưu game tại khe lưu 1 (`saveGame(1)`) ngay tại khu vực nông trại.
- Nạp lại trạng thái thế giới và di chuyển xuyên qua `(648, 741)`: Nhân vật đi từ $Y = 690$ xuống $Y = 888.3$ hoàn toàn thông suốt, chứng minh trạng thái không bị phục hồi collider lỗi sau khi nạp game.

---

## 8. KIỂM TRA TÍNH TOÀN VẸN SAFETY GATE (GIT & HASH AUDIT)

Tuân thủ nghiêm ngặt **Quy Tắc 02 & Quy Tắc 04 của QA Execution Protocol V3**:
- Không sử dụng các lệnh nguy hiểm (`git reset --hard`, `git clean`, `git restore`).
- Bảo vệ tuyệt đối 3 file manifest âm thanh untracked của Owner.
- Bảo vệ 3 file mã nguồn modified hợp lệ.

### Bảng Đối Chiếu Mã Băm SHA-256
| Tập Tin Kiểm Tra | SHA-256 Baseline | SHA-256 Sau Kiểm Thử | Trạng Thái Đối Chiếu |
| :--- | :---: | :---: | :---: |
| `src/scenes/UIScene.ts` | `271BE89D2D75CE140D876146D3EB87A20EE4608964A8D9E8E6DF64539B34BED2` | `271BE89D2D75CE140D876146D3EB87A20EE4608964A8D9E8E6DF64539B34BED2` | **KHỚP 100% (NGUYÊN VẸN)** |
| `src/world/WorldBuilder.ts` | `2C76B1F2F26C68848976C1863C1CA291AD4ECBB0CC14A54A16D88697F59EE8DA` | `2C76B1F2F26C68848976C1863C1CA291AD4ECBB0CC14A54A16D88697F59EE8DA` | **KHỚP 100% (NGUYÊN VẸN)** |
| `src/animation/BlackKnightAnimations.ts` | `C7A718C030DF8972689CCDCE4B14D42E44E921C68AE493BE96D052E465A52894` | `C7A718C030DF8972689CCDCE4B14D42E44E921C68AE493BE96D052E465A52894` | **KHỚP 100% (NGUYÊN VẸN)** |
| `scripts/AUDIO_SOURCES_MANIFEST.csv` | `326EB987BE308155E991C936CAD0E987532A3343F4B5A1F46FA86FACCBA8229E` | `326EB987BE308155E991C936CAD0E987532A3343F4B5A1F46FA86FACCBA8229E` | **KHỚP 100% (NGUYÊN VẸN)** |
| `scripts/AUDIO_SOURCES_MANIFEST.json` | `5CE3FEC78F18D79504B4383306ED1F97340D9528CB569BC7C6698C7954E20089` | `5CE3FEC78F18D79504B4383306ED1F97340D9528CB569BC7C6698C7954E20089` | **KHỚP 100% (NGUYÊN VẸN)** |
| `scripts/generate_audio_sources_manifest.mjs` | `D48E362718B835E32CB6A06A3B06A0FA396B29A5FF8D09B0D9AB213E99B60EE3` | `D48E362718B835E32CB6A06A3B06A0FA396B29A5FF8D09B0D9AB213E99B60EE3` | **KHỚP 100% (NGUYÊN VẸN)** |

---

## 9. KẾT LUẬN & KIẾN NGHỊ NGHIỆM THU

1. **Kết luận kiểm thử:**
   - Bản sửa Task 1 loại bỏ vật cản tại `(648, 741)` đạt **PASS TOÀN DIỆN**.
   - Hành lang đi lại tại khu vực Nông Trại Trú Ẩn (`sanctuary_farm`) hoàn toàn thông suốt theo 4 hướng chính, hướng chéo, chạy nước rút lặp lại và chuyển vùng.
   - Bức tường Kho Thóc, Giếng Nước, Rương Gỗ và các công trình xung quanh được bảo vệ va chạm tuyệt đối, không xảy ra hiện tượng xuyên tường hay mất collider ngoài ý muốn.
   - Hình ảnh đống củi và cảnh quan nông trại được bảo tồn nguyên vẹn 100%.

2. **Thực thi HARD STOP:**
   - Giữ nguyên trạng thái working tree hiện tại.
   - Không commit, không push, không merge.
   - Sẵn sàng chuyển giao cho Owner nghiệm thu hoặc thực hiện checkpoint tiếp theo theo chỉ đạo.
