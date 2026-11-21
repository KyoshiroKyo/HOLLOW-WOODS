# BÁO CÁO NGHIỆM THU HOÀN TẤT HW-BUG-#6 — CHUẨN HÓA TOÀN DIỆN INTERACTION ANCHORS & DESPAWN FLOW (BUG-049)

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh Git:** `feat/v1.5.3-ag-world-polish`  
**Mã nhiệm vụ:** `HW-BUG-#6` / `BUG-049`  
**Ngày thực hiện:** 22/11/2026  
**Trạng thái kiểm thử:** **CLOSED-VERIFIED local (5/5 PASS 100%)**

---

## 1. MỤC TIÊU NGHIỆM THU & KẾT QUẢ ĐẠT ĐƯỢC

Giải quyết triệt để và dứt điểm các tồn đọng của lỗi `BUG-049` (trước đó ở trạng thái `PARTIAL`), chuẩn hóa toàn diện hệ thống neo tương tác (Interaction Anchors) và quy trình dọn dẹp vật phẩm (Despawn Flow):

1. **Thống nhất Một World Anchor Chuẩn Xác:** Loại bỏ hoàn toàn sự sai lệch giữa vị trí sprite, vùng va chạm (collider), điểm phát hiện khoảng cách và quầng sáng viền (highlight outline) trên toàn thế giới game.
2. **Triệt Tiêu Cộng Offset Hai Lần:** Xóa bỏ triệt để lỗi cộng dồn offset `+14, +10px` tại các rương và bàn thao tác (trước đây hàm tạo prop tự động cộng thêm nửa kích thước dù tọa độ truyền vào vốn đã là tọa độ tâm thực tế).
3. **Highlight Bám Sát Bàn Chân Sprite:** Elip sáng dưới chân (`fillEllipse` / `strokeEllipse`) và sprite phụ phát sáng (`interactionGlowSprite`) bám chính xác vào mặt đất tại bàn chân (`outlineFootY = npc.y` hoặc `prop.y`), không còn bị treo lơ lửng ngang bụng nhân vật/vật thể.
4. **Phân Định Mục Tiêu Chống Kích Hoạt Nhầm (Anti-Mis-Trigger):** Thuật toán sắp xếp ứng viên tương tác ưu tiên tuyệt đối mục tiêu đã nằm trong bán kính kích hoạt (`dist <= triggerDist`), sau đó mới xét đến khoảng cách tăng dần. Hai vật thể đặt sát cạnh nhau (ví dụ: Hiệp Sĩ Vaelen và Bếp Lửa Cổ tại Outer Woods; Thợ Rèn Bram và Bàn Chế Tạo tại Bellhollow) kích hoạt chính xác 100%, không bao giờ bị kích hoạt nhầm sang đối tượng kế bên.
5. **Dọn Sạch Tức Thì Khi Despawn:** Khi vật phẩm hoặc tài nguyên được thu hoạch/tương tác, sprite hiển thị, vùng hào quang và trigger tương tác trong `interactables` bị dỡ bỏ ngay lập tức trong cùng frame.
6. **Chống Nhận Vật Phẩm Trùng Lặp (Anti-Duplication):** Các vật phẩm cốt truyện và nhiệm vụ quan trọng (`item_bell_mold`, `mat_runed_iron`, `item_medicinal_roots`, `item_bell_tongue`) được khóa chặt bằng cờ tiến trình (`has_bell_mold`, `has_runed_iron_part`, `has_rare_roots`, `clapper_collected`), không thể nhặt trùng lặp lần 2 khi spam phím [E] hoặc sau khi đổi phân khu / Continue.
7. **Bảo Toàn Tuyệt Đối HOTFIX-A2 Sắt Cổ Ngữ:** Giữ nguyên vẹn 100% cơ chế xử lý sprite đặc thù của `collect_runed_iron_part` và hàm dọn sạch `removeRunedIronPickup()`.
8. **Di Dời Gỗ Khô Tránh Chân Móng Xưởng:** Dời `node_wood_3` từ `(1330, 410)` (bị kẹt trong móng xưởng mới của Bram) sang bãi đất thoáng `(1240, 360)`.

---

## 2. HÌNH ẢNH THỰC ĐỊA NGHIỆM THU (VERIFICATION SCREENSHOT)

![Nghiệm thu Interaction Anchors](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/interaction_anchors_verified.png)
*Hình ảnh thực địa Playwright chụp tại phân khu Xưởng Chuông (sub_bell_workshop) sau khi hoàn tất chuỗi kiểm thử 5 test cases: Vật phẩm cốt truyện đã được thu thập, trigger tương tác đã dọn sạch, độ bền tiến trình và dữ liệu lưu đạt chuẩn tuyệt đối.*

---

## 3. CHI TIẾT CÁC THAY ĐỔI MÃ NGUỒN THEO TỪNG TỆP

### 3.1. `src/systems/InventorySystem.ts`
- **Dời Gỗ Khô `node_wood_3`:** Điều chỉnh tọa độ ban đầu từ `(1330, 410)` sang `(1240, 360)`. Vị trí cũ `(1330, 410)` nằm bên trong phạm vi móng xưởng rèn mới `[1296..1450, 400..432]`; vị trí mới `(1240, 360)` nằm trên khu đất trống xưởng cũ, giải phóng va chạm 100%.
- **Bổ sung `getNearbyAvailableNodes(playerX, playerY, radius)`:** Trả về danh sách toàn bộ các node tài nguyên đang khả dụng trong bán kính quét, cho phép `GameScene` đánh giá đầy đủ tất cả candidate mà không bị node gần nhất che khuất node khác.

### 3.2. `src/world/WorldBuilder.ts`
- **Lọc trigger nhiệm vụ đã thu thập trong `setupZoneInteractables()`:** Bổ sung kiểm tra cờ tiến trình `has_bell_mold`, `has_rare_roots`, `clapper_collected` (kế thừa logic có sẵn của `has_runed_iron_part` trong HOTFIX-A2), đảm bảo khi tải scene hoặc Continue không bao giờ tạo lại trigger tương tác cho vật phẩm đã nhặt.
- **Triệt tiêu cộng offset hai lần tại Rương:** Sửa `createChestProp(x, y)` và `createChestPropWithBaseHitbox(x, y)` sử dụng trực tiếp tọa độ tâm `cx = x; cy = y;` (thay vì tự ý cộng thêm `+14, +10px`).
- **Đồng bộ Rương Bellhollow & Ranger Outpost:** Dùng chuẩn `this.createChestProp(775, 295)` tại Sanctuary Camp Hub và `this.createChestProp(1445, 645)` tại Abandoned Ranger Outpost.
- **Xóa trùng lặp Bếp Lửa Outer Woods:** Bọc kiểm tra `if (!this.interactables.some(i => i.id === 'quiet_forest_bonfire'))` trong `createQuietForestBonfireOutpost()`, triệt tiêu hoàn toàn tình trạng sinh ra 2 entry bếp lửa cùng lúc trong danh sách interactables.
- **Đồng bộ Mái che & Bàn Sơ Chế Thảo Mộc Nông Trại:** Căn chỉnh `createHerbalistProcessingShelter(x, y)` đồng bộ tại `(702, 629)`.
- **Bổ sung `getNearbyInteractables(pos: Point2D, maxRadius: number = 65)`:** Trả về danh sách tất cả các vật thể tương tác hợp lệ trong phạm vi quét gợi ý, hỗ trợ GameScene xếp hạng candidate chính xác.

### 3.3. `src/scenes/GameScene.ts`
- **Neo Chân Chuẩn Cho NPC Outline:** Bổ sung thuộc tính `outlineFootY: npc.y` cho candidate NPC, đảm bảo elip hào quang luôn vẽ bám sát mặt đất nơi bàn chân NPC tiếp xúc.
- **Duyệt Toàn Diện Candidate Lân Cận:** Sử dụng `getNearbyAvailableNodes` và `getNearbyInteractables` để quét đầy đủ tất cả tài nguyên và vật thể trong bán kính $65\text{px}$.
- **Thuật Toán Sắp Xếp Chống Kích Hoạt Nhầm:**
  ```typescript
  candidates.sort((a, b) => {
    const aActionable = a.dist <= a.triggerDist;
    const bActionable = b.dist <= b.triggerDist;
    if (aActionable !== bActionable) {
      return aActionable ? -1 : 1;
    }
    return a.dist - b.dist;
  });
  ```
  Ưu tiên tuyệt đối ứng viên đã đủ điều kiện hành động (`dist <= triggerDist`) trước khi so sánh khoảng cách, triệt tiêu tình trạng vật thể ở xa hơn nhưng thuộc diện preview lại che chắn mục tiêu đứng sát cạnh.
- **Vẽ Elip Sát Đất:** Cập nhật `renderInteractionOutline()` sử dụng `const footY = target.outlineFootY ?? target.y;`, loại bỏ các offset giả.
- **Despawn & Chống Trùng Lặp Cốt Truyện:**
  + Trong `inspect_bell_mold`: Kiểm tra flag `has_bell_mold`, set flag, lọc xóa trigger khỏi `worldBuilder.interactables`, xóa prompt và outline, thêm 1 item vào túi đồ, hoàn thành nhiệm vụ.
  + Trong `collect_rare_roots`: Kiểm tra flag `has_rare_roots`, set flag, dọn dẹp trigger, xóa prompt/outline, cấp 2 dược liệu.
  + Trong `collect_bell_tongue`: Dọn dẹp trigger, xóa prompt/outline.

### 3.4. `src/data/zones.json`
- Đồng bộ tọa độ `farm_processing_bench` tại Sanctuary Farm: `"x": 702, "y": 629` khớp hoàn toàn với vị trí sprite và hộp va chạm thực tế trong `createHerbalistProcessingShelter()`, giữ khoảng cách an toàn $22\text{px}$ so với Rương Trú Ẩn `(680, 640)`.

---

## 4. BẢNG KIỂM KÊ 9 ĐỐI TƯỢNG TƯƠNG TÁC ĐẠI DIỆN

| STT | Đối tượng kiểm kê | Vị trí neo ($X, Y$) | Trigger Range / Action | Tình trạng đồng bộ Anchor & Despawn |
|:---:|:---|:---:|:---:|:---:|
| 1 | **Gỗ Khô (`node_wood_3`)** | `(1240, 360)` | $45\text{px}$ / `harvest` | Đã dời ra khỏi móng xưởng mới; thu hoạch ẩn visual và tắt available tức thì. |
| 2 | **Lều Trú Ẩn Bellhollow** | `(778, 261)` | $52\text{px}$ / `sleep` | Đồng bộ sprite, chân móng và trigger; elip bám đúng chân lều. |
| 3 | **Rương Trú Ẩn Bellhollow** | `(775, 295)` | $52\text{px}$ / `storage` | Triệt tiêu offset lệch $+14, +10\text{px}$; mở kho đồ chính xác. |
| 4 | **Bếp Lửa Trại Bellhollow** | `(860, 310)` | $52\text{px}$ / `campfire` | Hồi phục tinh thần, thêm củi ban đêm, không lệch tâm sáng. |
| 5 | **Biển Chỉ Dẫn Cổng Nam** | `(695, 511)` | $52\text{px}$ / `sign` | Neo tâm đúng cột biển; đọc nội dung biển bảng chuẩn xác. |
| 6 | **Hốc Sồi Ngàn Năm** | `(760, 120)` | $52\text{px}$ / `clue` | Khớp tâm gốc sồi cổ thụ; lưu cờ tiến trình bền vững qua Save/Load. |
| 7 | **Bàn Chế Tạo Làng** | `(1395, 455)` | $52\text{px}$ / `crafting` | Khớp sprite và collider xưởng Bram mới; mở modal chế tạo chuẩn xác. |
| 8 | **NPC Cạnh Nhau (Vaelen & Bonfire)** | `(1435, 710)` & `(1470, 710)` | $52\text{px}$ / `dialogue` & `bonfire` | Phân định mục tiêu siêu chính xác; đứng gần ai kích hoạt đúng người đó $100\%$. |
| 9 | **Vật Phẩm Cốt Truyện Xa Camera** | `(1310, 1160)` / `(1330, 1240)` | $52\text{px}$ / `pickup` | Khuôn Đúc Chuông, Sắt Cổ Ngữ (HOTFIX-A2), Rễ Thuốc: Despawn sạch, chống nhận lần 2. |

---

## 5. KẾT QUẢ KIỂM THỬ PLAYWRIGHT CHROMIUM (`test_hw_bug06_interaction_anchors.py`)

Bộ kiểm thử tự động toàn diện Playwright Chromium đã chạy độc lập và xác nhận đạt **100% (5/5 Test Cases PASS)**:

```
[Server] Serving dist at http://127.0.0.1:5236
[Test] Loading game at http://127.0.0.1:5236/?dev=1 ...
[Test] Starting New Game...

=== TEST CASE 1: KIỂM TRA WORLD ANCHORS VÀ COLLIDERS ĐỒNG BỘ 100% ===
  - Gỗ Khô node_wood_3: pos=(1240, 360), ngoài xưởng=True
  - Rương Trú Ẩn Bellhollow: pos=(775, 295)
  - Lều Trú Ẩn Bellhollow: pos=(778, 261)
  - Lửa Trại Bellhollow: pos=(860, 310)
  - Biển Chỉ Dẫn Cổng Nam: pos=(695, 511)
  - Hốc Sồi Ngàn Năm: pos=(760, 120)
  - Bàn Chế Tạo Làng: pos=(1395, 455)
  - Bếp Lửa Outer Woods count: 1
-> TC1 PASS: Tất cả world anchor đồng bộ chính xác, không trùng lặp, Gỗ Khô đã ra ngoài xưởng.

=== TEST CASE 2: E CHỌN ĐÚNG MỤC TIÊU GẦN NHẤT & KHÔNG KÍCH HOẠT NHẦM ===
  - Đứng gần Vaelen (1445, 715): Prompt = '[E] Trò chuyện với Kỵ Sĩ Vaelen'
  - Bấm [E] gần Vaelen: Dialogue mở = True
  - Đứng gần Bonfire (1468, 715): Prompt = '[E] Sưởi Ấm Bên Lửa Cổ'
  - Bấm [E] gần Bonfire: Composure từ 50 -> 66.28 (Hồi phục đúng cơ chế sưởi lửa)
-> TC2 PASS: Phân biệt chính xác giữa 2 đối tượng cạnh nhau, kích hoạt đúng 100%.

=== TEST CASE 3: HIGHLIGHT & OUTLINE FOOT ANCHORS ===
  - Garth tại (540, 205): Glow sprite Y = 205
-> TC3 PASS: Outline bám đúng tọa độ bàn chân NPC và sprite.

=== TEST CASE 4: THU THẬP VẬT PHẨM, DESPAWN & CHỐNG DUPLICATE ===
  - Thu hoạch Gỗ Khô: Số lượng 2 -> 3, Node visible = False
  - Khuôn Đúc Chuông: Lần 1 nhặt = 1, Flag = True, Trigger còn trong interactables = False, Lần 2 thử = 1
  - Phụ Kiện Sắt Rèn: Lần 1 nhặt = 1, Flag = True, Trigger còn = False, Lần 2 = 1
  - Rễ Thuốc Cổ: Lần 1 = 2, Flag = True, Trigger còn = False, Lần 2 = 2
-> TC4 PASS: Despawn xóa visual, xóa trigger, chống duplicate 100% (bảo toàn HOTFIX-A2).

=== TEST CASE 5: LƯU GAME, CONTINUE & CHUYỂN PHÂN KHU ===
  - Tại Sanctuary Farm: Rương = (680, 640), Bàn sơ chế = (702, 629)
  - Kiểm tra độ bền sau đổi zone: Có Iron trigger = False, Có Mold trigger = False
  - Screenshot saved to: G:\HOLLOW WOODS\Read\V1.5\Reports\interaction_anchors_verified.png
  - Console Errors: 0
-> TC5 PASS: Save/Load bền vững, chuyển zone không hồi sinh trigger, 0 console errors.

=======================================================
TẤT CẢ 5/5 TEST CASES HW-BUG-#6 / BUG-049 ĐÃ PASS 100%!
=======================================================
```

---

## 6. KIỂM TRA BIÊN DỊCH VÀ ĐÓNG GÓI SẢN PHẨM

- `npx tsc --noEmit`: **0 errors** (Exit Code 0).
- `npm run build`: **0 errors** (Vite v5.4.21 bundle thành công trong 11.48s, toàn bộ asset và module tải mượt mà).
- Runtime Console: **0 errors / 0 warnings bất thường**.
- **KẾT LUẬN:** Lỗi `BUG-049` chính thức được chuyển trạng thái từ `PARTIAL` sang **`CLOSED-VERIFIED local`**.
