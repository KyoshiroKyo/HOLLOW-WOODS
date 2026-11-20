# BÁO CÁO KỸ THUẬT V152-04: QUY HOẠCH TRẠM LỬA SIR VAELEN & THÔNG LỐI NAM XƯỞNG CHUÔNG
**Dự án:** HOLLOW WOODS v1.5.2  
**Thời gian:** 2026-11-20  
**Trạng thái:** Hoàn tất 100% (PASS toàn bộ test suites)

---

## 1. MỤC TIÊU & TỔNG HỢP KẾT QUẢ THỰC HIỆN

| STT | Nhiệm Vụ | Nội Dung & Yêu Cầu | Kết Quả |
|:---:|:---|:---|:---:|
| 1 | **ASSET_REPLACEMENT** | Xóa sạch nhà hộp nâu mái xanh & quầy lều vẽ bằng `Phaser.Graphics`. Thay bằng Sprite Pixel Art thật (`ranger_cabin_wood.png` 88x103px trích xuất từ The Fan-tasy Tileset & `prop_wayfarer_tent.png` 64x56px) | **HOÀN TẤT** |
| 2 | **KNIGHT_VAELEN_ALIGN** | Đặt Sir Vaelen tại `(1435, 710)` ngồi/quỳ cạnh Bếp Lửa Hồng `(1470, 710)`, khoảng cách $35\text{px}$ chuẩn xác, mặt xoay về phía ngọn lửa | **HOÀN TẤT** |
| 3 | **CAMP_PERIMETER_CLEAR** | Dời tảng đá lớn, rương, bụi rậm ra vòng ngoài bãi trại; tim đường mòn xuyên Trạm Lửa thông thoáng 100% | **HOÀN TẤT** |
| 4 | **SOUTH_ROUTE_WORKSHOP** | Dọn cây sồi chắn lối tại `(1340, 990)`, lót dải đường đất liên tục từ Outer Woods sang Xưởng Chuông Bỏ Hoang (`sub_bell_workshop` - điểm D), cắm biển chỉ dẫn `"Xưởng Chuông Bỏ Hoang ↓"` tại `(1300, 985)` | **HOÀN TẤT** |
| 5 | **BOUNDARY_COLLIDERS** | Nâng độ dày toàn bộ collider chu vi Sub Bell Workshop lên $\ge 32\text{px}$, bổ sung case kẹp an toàn trong `clampPlayerToZoneBounds()` GameScene | **HOÀN TẤT** |
| 6 | **REGISTRY_CONNECTIONS** | Đăng ký node `sub_bell_workshop` và kết nối hai chiều `conn_outer_woods_to_bell_workshop` / `conn_bell_workshop_to_outer_woods` trong `ZoneConnectionRegistry.ts` | **HOÀN TẤT** |

---

## 2. NGUYÊN NHÂN GỐC & CHI TIẾT SỬA ĐỔI

### 2.1. Thay thế công trình vẽ bằng code sang Pixel Art thật (#8 & #9)
- **Nguyên nhân gốc:**
  - `createAbandonedRangerOutpost` (tại `1420, 620`) dùng lệnh vẽ `Phaser.Graphics` (`fillRect`, `fillTriangle`) tạo khối hộp màu nâu mái xanh vi phạm Luật An Toàn Thiết Kế V1.5.2.
  - `createHunterLeanToShelter` (tại `1350, 690`) dùng `Phaser.Graphics` vẽ quầy bạt phủ rêu xanh.
- **Giải pháp & File/Dòng sửa đổi:**
  - `public/assets/buildings/ranger_cabin_wood.png`: Trích xuất sạch từ gói `The Fan-tasy Tileset (Free) 1.5.9.zip`, kích thước 88x103 px, tỷ lệ cân đối, phong cách kiến trúc mộc mạc cổ điển, 0 trùng key với `hollow_props_atlas`.
  - `src/config/Constants.ts`: Khai báo hằng số `SPRITE_BUILDING_RANGER_OUTPOST_V15 = 'building_ranger_outpost'`.
  - `src/scenes/PreloadScene.ts`: Nạp texture `building_ranger_outpost` trỏ tới `assets/buildings/ranger_cabin_wood.png`.
  - `src/world/WorldBuilder.ts`:
    - `createAbandonedRangerOutpost`: Xóa toàn bộ lệnh vẽ `Phaser.Graphics`, tạo sprite Pixel Art thật qua `this.safeAddImage(cx, cy, SPRITE_BUILDING_RANGER_OUTPOST_V15)` kèm depth và cullable, collider chân đế chuẩn xác.
    - `createHunterLeanToShelter`: Xóa toàn bộ lệnh vẽ `Phaser.Graphics`, thay bằng `SPRITE_PROP_WAYFARER_TENT_V15` (`prop_wayfarer_tent.png` 64x56 px).

### 2.2. Định vị Sir Vaelen & Quy hoạch bãi trại Trạm Lửa
- **Nguyên nhân gốc:**
  - Có sự lệch tọa độ giữa `CampSanctuarySystem.ts` (`knightY: 705`), `GameScene.ts` (`y: 705`) và `zones.json` (`y: 710`).
  - Một số bụi cây và đá tảng trang trí (`createDenseBush(1460, 730)`, `createRock(1410, 750)`) nằm áp sát lòng đường mòn và tim trại.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/systems/CampSanctuarySystem.ts`: Đồng bộ `knightX = 1435`, `knightY = 710`, `campfireX = 1470`, `campfireY = 710` (khoảng cách chính xác $35\text{px}$).
  - `src/scenes/GameScene.ts`: Đồng bộ tọa độ khởi tạo `npc_campfire_knight` tại `(1435, 710)`.
  - `src/world/WorldBuilder.ts`:
    - Dời bụi rậm tại `(1460, 730)` sang `(1420, 745)` ở rìa ngoài bãi trại.
    - Dời tảng đá lớn tại `(1410, 750)` sang `(1390, 765)` giải phóng hoàn toàn tim đường mòn.

### 2.3. Sửa dứt điểm nhánh đường Nam nối sang Xưởng Chuông Bỏ Hoang (#9)
- **Nguyên nhân gốc:**
  - Trong `renderOuterWoodsTerrain`, dải bóng tối rừng sâu `southForestShade` phủ một mảng lớn từ $y = 960$ đến $1040$ khiến khu vực nối sang Xưởng Chuông bị chìm trong khoảng đen void.
  - Lối mòn `drawWoodsPath` ở phía Nam chỉ vẽ tới Bãi Liễu `(1260, 910)` rồi đứt quãng, không nối tới ranh giới $y = 1040$.
  - Cây cổ thụ `createTree(1340, 990, 'Cây Cổ Thụ Viền Nam', true)` nằm ngay giữa tim hành lang lối đi sang Xưởng Chuông.
  - `ZoneConnectionRegistry.ts` thiếu định nghĩa node `sub_bell_workshop` và kết nối chuyển vùng.
- **Giải pháp & File/Dòng sửa đổi:**
  - `src/world/WorldBuilder.ts`:
    - Dời cây cổ thụ từ `(1340, 990)` sang `(1260, 990)`, giải phóng hoàn toàn hành lang chuyển vùng $x = 1320..1400$.
    - Bổ sung biển chỉ dẫn mộc mạc: `this.createStoneSign(1300, 985, 'XƯỞNG CHUÔNG BỎ HOANG ↓')`.
    - Mở rộng mạng lưới `drawWoodsPath` nối thẳng từ Bãi Trại `(1330, 730) -> (1360, 760) -> (1360, 840) -> (1360, 920) -> (1360, 980) -> (1360, 1040)` bán kính $r = 24..28\text{px}$ và nhánh phụ từ Bãi Liễu `(1260, 910) -> (1300, 960) -> (1360, 980)`.
    - Trong `renderSubBellWorkshopTerrain`: lót tiếp hành lang đất nung từ $y = 1040$ nối vào quảng trường xưởng đúc.
  - `src/world/ZoneConnectionRegistry.ts`:
    - Thêm neighbor `sub_bell_workshop` cho node `outer_woods`.
    - Khởi tạo node `sub_bell_workshop` với ranh giới `bounds: { x: 1120, y: 1040, width: 480, height: 400 }`.
    - Đăng ký cặp kết nối hai chiều `conn_outer_woods_to_bell_workshop` và `conn_bell_workshop_to_outer_woods`.
  - `src/data/zones.json`:
    - Bổ sung interactable `sign_sub_bell_workshop` tại `(1300, 985)`.
    - Tăng độ dày toàn bộ các boundary colliders của `sub_bell_workshop` (`bw_bound_top_left/right`, `bw_bound_bottom`, `bw_bound_left/right`) lên $\ge 32\text{px}$.
  - `src/scenes/GameScene.ts`: Bổ sung case kẹp an toàn cho `sub_bell_workshop` trong `clampPlayerToZoneBounds()`.

---

## 3. KẾT QUẢ KIỂM THỬ TOÀN DIỆN

```text
1. TypeScript Strict Compilation:
   npx tsc --noEmit -> EXIT CODE 0 (0 lỗi)

2. Step V152-04 Dedicated Test Suite:
   node scripts/test_v152_04_vaelen_workshop.mjs
   -> 25/25 tests PASS (100%)

3. Sir Vaelen Bonfire Outpost Test Suite:
   node scripts/test_v15_31_vaelen_bonfire_outpost.mjs
   -> 24/24 tests PASS (100%)

4. Master Map Reachability & Assets Audit:
   node scripts/audit_map_reachability_and_assets.mjs
   -> 73/73 tests PASS (100%)
   - 100% Asset thực tế trên đĩa
   - 0 collider trùng lặp
   - Toàn bộ 18 phân khu thông suốt BFS

5. Quest Chain Restructuring Audit:
   node scripts/test_v15_60_quest_chain_restructuring.mjs
   -> 72/72 tests PASS (100%)

6. Audio & Data Integrity Test Suites:
   node scripts/test_v15_fix_02_audio.mjs -> 12/12 PASS
   node scripts/verify_data_integrity.mjs -> 15/15 PASS
```

---

## 4. KẾT LUẬN
Bước **V152-04** đã được triển khai hoàn hảo. Bản đồ khu vực Trạm Lửa Sir Vaelen và tuyến đường sang Xưởng Chuông Bỏ Hoang đã đạt chuẩn mỹ thuật Pixel Art thật, thông suốt luồng chuyển vùng, bịt kín chu vi an toàn. Hệ thống sẵn sàng cho bước **V152-05**.
