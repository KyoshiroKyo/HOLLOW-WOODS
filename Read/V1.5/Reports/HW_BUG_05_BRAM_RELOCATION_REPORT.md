# BÁO CÁO THI CÔNG HOÀN TẤT HW-BUG-#5 — DI DỜI TOÀN BỘ CỤM XƯỞNG RÈN BRAM

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Mã nhiệm vụ:** `HW-BUG-#5` / `BUG-034B`  
**Ngày thực hiện:** 22/11/2026  
**Trạng thái kiểm thử:** **CLOSED-VERIFIED local (5/5 PASS 100%)**

---

## 1. MỤC TIÊU THI CÔNG & KẾT QUẢ ĐẠT ĐƯỢC

Thực hiện di dời trọn vẹn toàn bộ quần thể Xưởng Rèn & Lò Lửa của Bram từ vị trí cũ `(1270, 360)` sang vị trí mới `(1373, 432)` theo đúng đồ án Blueprint đã được Project Owner phê duyệt:
- **Tâm móng xưởng mới:** `(1373, 432)`
- **Vector dịch chuyển tịnh tiến:** $\vec{D} = (+103, +72)$
- **Dọn sạch 100% vị trí cũ:** Không còn bất kỳ sprite thừa, collider móng cũ hay bàn chế tạo cũ nào sót lại ở `(1270, 360)`. Tuyệt đối không sinh 2 xưởng rèn.
- **Bảo toàn 100% tài nguyên:** Không đè lên bất kỳ tài nguyên nhiệm vụ (`mat_runed_iron`, `res_dry_wood`, `res_tree_resin`), quest flags, hay NPC lân cận nào.
- **Giải phóng lối đi:** Trục đường từ Quảng Trường Trung Tâm xuống Lối Rừng Ngoại Vi (`1210, 510`) được mở rộng thênh thang, không còn bị góc mái xưởng che chắn.

---

## 2. HÌNH ẢNH HOÀN THIỆN THỰC ĐỊA (AFTER SCREENSHOT)

![Xưởng Bram hoàn thiện tại vị trí mới](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/bram_smithy_relocated_after.png)
*Hình ảnh thực tế xưởng rèn Bram tại (1373, 432) sau khi thi công: Móng xưởng, lò than hồng rực, ống khói, cụm củi đốt, Bram tại (1333, 477), Bàn chế tạo tại (1395, 455), nhánh đường đất uốn lượn vào sân, không gian thông thoáng tuyệt đối.*

---

## 3. CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN THEO TỪNG TỆP

### 3.1. `src/world/WorldBuilder.ts`
1. **Dời xưởng rèn chính:**
   Thay `this.createCraftingWorkshopPavilion(1270, 360);` thành `this.createCraftingWorkshopPavilion(1373, 432);`.
   Sprite $176 \times 148\text{px}$, footing chân móng, và collider static box $154 \times 32\text{px}$ tự động dịch chuyển đồng bộ sang `[1296, 400, 1450, 432]`.
2. **Dời cụm củi đốt:**
   Thay `this.createVillagePropCluster(1330, 380, 'firewood');` thành `this.createVillagePropCluster(1433, 452, 'firewood');`.
3. **Dời vệt sáng nền đất nung ấm:**
   Thay `addWarmGroundPool(1240, 375, 56, 0.22);` thành `addWarmGroundPool(1343, 447, 56, 0.22);`.
4. **Giải tỏa bụi cây xung đột:**
   Dời bụi cây `{ x: 1416, y: 348, s: 0.94 }` trong mảng `bushPlacements` sang rìa ngoài Đông Nam `{ x: 1475, y: 410, s: 0.94 }`, giải phóng không gian cho mảng tường đông của xưởng.
5. **Giải tỏa cành gỗ mục xung đột:**
   Dời khúc gỗ mục `{ x: 1364, y: 340, w: 20, h: 4 }` trong `fallenBranches` sang bãi đất cũ `{ x: 1250, y: 350, w: 20, h: 4 }`.
6. **Di dời cụm sương mù khí quyển:**
   Dời cụm sương `addBoundaryMist(1330, 395, ...)` xuống sát chân hàng rào Nam `addBoundaryMist(1330, 520, ...)` để giữ quầng sáng than hồng rực rỡ và rõ nét.
7. **Bổ sung nhánh đường đất vào sân xưởng mới:**
   Thêm nhánh uốn lượn `drawOrganicDirtPath([{ x: 1190, y: 375, r: 20 }, { x: 1260, y: 410, r: 19 }, { x: 1330, y: 440, r: 20 }], false);`.

### 3.2. `src/data/zones.json`
1. Cập nhật vị trí Bram: `"x": 1333, "y": 477`.
2. Cập nhật vị trí Bàn chế tạo: `"x": 1395, "y": 455`.

### 3.3. `src/data/maps/bellhollow.json`
1. Cập nhật Tiled Object `npc_bram`: `"x": 1333, "y": 462`, `"patrolMinX": 1333`, `"patrolMaxX": 1333`.
2. Cập nhật Tiled Object `village_crafting_bench`: `"x": 1395, "y": 455`.
3. Cập nhật Tiled Object `crafting_bench` (collider): `"x": 1375, "y": 449`.

---

## 4. BẢNG ĐỐI CHIẾU THÔNG SỐ RUNTIME (BEFORE vs AFTER)

| Thực thể | Tọa độ CŨ (Old) | Hitbox CŨ (Old AABB) | Tọa độ MỚI (After) | Hitbox MỚI (After AABB) | Trạng thái |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Móng Xưởng Rèn** | `(1270, 360)` | `[1193, 328, 1347, 360]` | **`(1373, 432)`** | **`[1296, 400, 1450, 432]`** | **PASS** |
| **Thợ Rèn Bram** | `(1230, 405)` | `[1218, 391, 1242, 405]` | **`(1333, 477)`** | **`[1321, 463, 1345, 477]`** | **PASS** |
| **Bàn Chế Tạo** | `(1292, 383)` | `[1272, 377, 1312, 389]` | **`(1395, 455)`** | **`[1375, 449, 1415, 461]`** | **PASS** |
| **Lò Than Hồng** | `(1215, 336)` | Tâm phát sáng $R=70$ | **`(1318, 408)`** | Tâm phát sáng $R=70$ | **PASS** |
| **Khói Ống Khói** | `(1222, 216)` | Particle emitter | **`(1325, 288)`** | Particle emitter | **PASS** |
| **Cụm Củi Gỗ** | `(1330, 380)` | Prop trang trí hiên | **`(1433, 452)`** | Prop trang trí hiên | **PASS** |
| **Vệt Đất Ấm** | `(1240, 375)` | Canvas baked pool $R=56$ | **`(1343, 447)`** | Canvas baked pool $R=56$ | **PASS** |

---

## 5. KẾT QUẢ BỘ KIỂM THỬ PLAYWRIGHT CHROMIUM (`test_hw_bug05_bram_relocation.py`)

- **Test Case 1 (Dọn sạch vị trí cũ):**
  + Số lượng xưởng rèn collider: đúng duy nhất 1 xưởng.
  + Vị trí móng cũ `(1270, 360)` không còn collider nào tồn tại.
  + Bàn chế tạo và Bram tại vị trí cũ được xóa sạch hoàn toàn $\rightarrow$ **PASS**.
- **Test Case 2 (Xác minh cụm xưởng mới):**
  + Collider móng xưởng mới đo đạc runtime: `[1296, 400, 1450, 432]`.
  + Bram tại `(1333, 477)`: AABB `[1321, 463, 1345, 477]`, $\Delta\text{Chân} = (0.0, 0.0)$.
  + Bàn chế tạo tại `(1395, 455)`: AABB `[1375, 449, 1415, 461]` $\rightarrow$ **PASS**.
- **Test Case 3 (Va chạm Noclip OFF):**
  + Player di chuyển từ phía Nam tiếp cận móng xưởng mới bị chặn chính xác tại mép chân móng $Y = 432$, không thể xuyên thấu.
  + Hành lang giữa Bram ($Y=477$) và hàng rào Nam ($Y=536$) rộng $59\text{px}$, đi lại thông suốt $\rightarrow$ **PASS**.
- **Test Case 4 (Tương tác [E] kép):**
  + Tiếp cận Bram tại `(1320, 477)`, nhấn `[E]`: Kích hoạt hội thoại `bram_chat` (`dialogueSystem.isActive = true`).
  + Tiếp cận Bàn chế tạo tại `(1395, 475)`, nhấn `[E]`: Mở modal chế tạo `craftingModal.isOpen = true` $\rightarrow$ **PASS**.
- **Test Case 5 (Độ bền tiến trình & Console Errors):**
  + Save game thành công với `SaveManager.saveGame`.
  + Chuyển zone sang `outer_woods` rồi quay lại `bellhollow`: Cụm xưởng mới, Bram và Bàn chế tạo giữ nguyên vẹn tọa độ.
  + Số lỗi console ghi nhận: **0 errors** $\rightarrow$ **PASS**.

---

## 6. KIỂM TRA BIÊN DỊCH VÀ ĐÓNG GÓI

- `npx tsc --noEmit`: 0 errors (Exit Code 0).
- `npm run build`: 0 errors (Vite production build thành công trong 14.07s).

---

## 7. KẾT LUẬN

Nhiệm vụ **HW-BUG-#5** đã hoàn tất xuất sắc toàn diện. Cụm xưởng rèn của Thợ Rèn Bram đã được di dời an toàn, chuẩn xác và sạch sẽ sang tọa độ mới `(1373, 432)`, nâng cao mỹ quan và độ thông thoáng của Làng Bellhollow mà không gây bất kỳ lỗi hồi quy nào. Đã cập nhật Tester Bug Registry sang `CLOSED-VERIFIED local`.
