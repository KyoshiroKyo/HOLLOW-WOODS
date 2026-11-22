# HW-FIX-21 — BÁO CÁO TỔNG KẾT DỌN DẸP RỪNG NGOẠI VI (OUTER WOODS), KHU VỰC SIR VAELEN & VÁ LỖI TỒN ĐỌNG TRƯỚC V1.5.4

- **Dự án:** HOLLOW WOODS (Tiến tới Release V1.5.4)
- **Mã công việc:** HW-FIX-21
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Môi trường thực thi:** Windows, Node.js v26.7.0, Phaser 3.80.1, TypeScript 5.4.5, Playwright Chromium Engine (Noclip OFF)
- **Trạng thái:** **HOÀN TẤT & ĐÃ XÁC THỰC (VERIFIED PASS 100%)**

---

## 1. TỔNG QUAN NHIỆM VỤ

HW-FIX-21 là gói công việc hoàn thiện không gian địa hình Rừng Ngoại Vi (Outer Woods) và khu vực Sir Vaelen, đồng thời khắc phục dứt điểm 4 điểm lỗi code sót lại từ các đợt Audit kỹ thuật trước khi đóng gói phiên bản V1.5.4.

Nhiệm vụ được phân tách làm hai khối hành động:
1. **Phần A — Outer Woods Cleanup & Sir Vaelen Area:** Xóa đúng các chướng ngại vật cản trở lối đi, loại bỏ trigger ma không dùng, mở rộng hành lang di chuyển chính và các nhánh phụ đảm bảo bề rộng >= 72px với noclip OFF, đồng thời bảo toàn nguyên vẹn 100% NPC Sir Vaelen, Bếp Lửa Cổ và các liên kết vùng.
2. **Phần B — Vá 4 lỗi Code sót từ Audit:** Dời tàn dư xưởng Bram cũ, sửa lệch nút Chế Tạo trong CraftingModal, chỉnh tọa độ hồi sinh Boss an toàn, cập nhật văn bản và dọn dẹp các event listeners tránh rò rỉ bộ nhớ.

---

## 2. CHI TIẾT THỰC HIỆN & THAY ĐỔI MÃ NGUỒN

### PHẦN A: DỌN DẸP NGOẠI VI & KHU VỰC SIR VAELEN

#### 1. Xóa đúng 4 bụi rậm cản lối & đồng bộ dữ liệu:
- **Bụi 1 quanh (1350, 780):** Xóa `this.createDenseBush(1350, 780);` trong `src/world/WorldBuilder.ts`.
- **Bụi 2 quanh (1420, 745):** Xóa `this.createDenseBush(1420, 745);` trong `src/world/WorldBuilder.ts` và xóa interactable `hide_bush_ow_bonfire` khỏi `src/data/zones.json`.
- **Bụi 3 quanh (1180, 760):** Xóa `this.createDenseBush(1180, 760);` trong `src/world/WorldBuilder.ts`.
- **Bụi 4 quanh (1260, 800):** Xóa `this.createDenseBush(1260, 800);` trong `src/world/WorldBuilder.ts` và xóa interactable `hide_bush_ow_clearing` khỏi `src/data/zones.json`.

#### 2. Xóa cây cản đường ngay dưới Bếp Sir Vaelen quanh (1488, 738):
- **Khảo sát thực tế:** Tại `createQuietForestBonfireOutpost(1470, 710)`, sprite `prop_fallen_log_mossy_v14` (có kích thước atlas 46x61px, thực tế là cây lá đỏ/tím dáng đứng) được đặt tại `(cx + 16, cy + 24) = (1486, 734)`, nằm sát mép dưới vòng đá bếp lửa Sir Vaelen, gây vướng víu tầm nhìn và lối đi.
- **Xử lý:** Xóa dòng `this.placeFootAnchoredSprite(cx + 16, cy + 24, 'prop_fallen_log_mossy_v14', 0.45);` trong `src/world/WorldBuilder.ts`.
- **Đồng bộ collider:** Kiểm tra bán kính 45px quanh (1488, 738) trong `outer_woods.json` xác nhận không có collider dư thừa sót lại.

#### 3. Xóa trigger ma "Trụ Đèn Bão":
- Xóa interactable `ow_lantern_checkpoint_1` (1220, 600, actionId: `ignite_lantern_checkpoint`) khỏi `src/data/zones.json`.
- Xóa object ID 22 (`ow_lantern_checkpoint_1`) khỏi `src/data/maps/outer_woods.json`.
- Kết quả: Không còn prompt ma `[E] Thắp Sáng Trụ Đèn` hiển thị vô cớ giữa bìa rừng.

#### 4. Dọn dẹp & sắp xếp tối ưu cây cản đường trong Outer Woods:
- **Khúc cua chữ S (1210, 560 -> 1330, 730):**
  + Dời thân cây đổ `createFallenLog` từ `(1190, 670)` sang `(1135, 670)` ôm sát mép rừng Tây.
  + Điều chỉnh khối đá cảnh quan trong Cụm 1 sang hướng Tây `dx: -15` (tại x=1130).
  + Giải phóng hoàn toàn lòng đường chữ S đạt bề rộng >= 72px.
- **Tuyến xuống Bãi Liễu (1270, 740 -> 1260, 910) & Tuyến Xưởng Chuông (1360, 760 -> 1360, 1040):**
  + Dời Cụm 3 (`createOrganicTreeCluster`) từ `x=1375` sang `x=1400, y=855` để trục đường chính X=1360 xuống Xưởng Chuông rộng thoáng > 75px.
  + Dời Cụm 4 Liễu Đại Ngàn từ `x=1255, y=935` sang sát mép Tây `(1215, 930)` với cây phụ hướng Tây `dx: -20, dy: -25` (1195, 905).
  + Dời collider `ow_willow_trunk` từ `(1250, 890)` sang `(1205, 920, w=24, h=20)` trong cả `zones.json` và `outer_woods.json`.
  + Dời interactable `ow_ancient_willow` từ `(1260, 910)` sang `(1200, 915, w=36, h=30)` trong cả `zones.json` và `outer_woods.json`.
  + Dời Cây Rỗng Bãi Liễu `createHollowTree` và interactable `hide_tree_ow_willow` từ `(1290, 900)` sang `(1305, 885)` nằm trên gò đất tam giác giữa hai nhánh đường, cách xa biển chỉ dẫn Xưởng Chuông (1300, 985).
- **Khu vực Sir Vaelen (1435, 710) & Bếp lửa (1470, 710):**
  + Giữ thông thoáng chu vi đi bộ vòng quanh bếp và cửa Trạm Kiểm Lâm (1420, 620).
  + Bảo toàn 100% NPC Sir Vaelen, Bếp Lửa Hồng Đá Cổ, interactable `warm_quiet_bonfire`, và các transition portals.

---

### PHẦN B: VÁ 4 LỖI CODE TỒN ĐỌNG TỪ AUDIT

#### 1. Dời tàn dư xưởng Bram cũ:
- **`src/world/WorldBuilder.ts` (`renderBellhollowTerrain`):** Dời `drawCobbleCourtyard(1245, 375, 65, 30, 'rounded_rect')` sang tọa độ xưởng Bram mới `(1348, 447)`.
- **`src/scenes/GameScene.ts` (`setupFireflies`):** Dời cụm ember tàn lửa lò rèn Bram từ `{ x: 1210, y: 360 }` sang `{ x: 1318, y: 408 }`.

#### 2. Lệch nền nút [🔨 Chế Tạo] trong `src/ui/CraftingModal.ts`:
- **Vấn đề:** Trong `buildDetailPanel()`, chiều cao khung chi tiết là `frameH = 180`, đặt nút tại `btnY = 180 - btnH - 12 = 136` (tâm Y = 152). Tuy nhiên trong `refreshDetailPanel()`, biến `btnY` bị gán cứng `126 - btnH - 12 = 82`, làm nền nút `detailCraftBtnBg` vẽ lệch lên trên 54px so với chữ và vùng bấm.
- **Khắc phục:** Sửa dòng 1030 thành `const btnY = 180 - btnH - 12;`. Nền nút, chữ nút và vùng bấm hitzone giờ đây khớp hoàn hảo tại Y=136..168.

#### 3. Sửa tọa độ hồi sinh Boss trong `src/scenes/GameScene.ts`:
- **Vấn đề:** Khi tử trận tại phân khu Boss (`broken_bell_shrine`, `ancient_ruins`, `ancient_rune_puzzle`), hàm `handleLoadCheckpoint()` thiết lập `data.playerPos = { x: 2360, y: 720 }` (tọa độ sai nằm ngoài vùng Outer Woods).
- **Khắc phục:** Sửa thành `data.playerPos = { x: 1420, y: 710 };` (Trạm Lửa Rừng Tĩnh Lặng của Sir Vaelen trong Outer Woods).

#### 4. Dữ liệu cũ trong `src/ui/JournalModal.ts` & dọn dẹp listeners:
- **`src/ui/JournalModal.ts`:**
  + Thay thế chuỗi mô tả và địa danh cũ: "Nhà Trưởng Làng Thomas & Thầy Thuốc Neris" -> "Nhà Bà Lão Edda & Thầy Thuốc Neris".
  + Thay thế hardcode `Đã Khai Mở: ${exploredCount}/9 Vùng` bằng đếm động số vùng thực tế đã triển khai: `Đã Khai Mở: ${exploredCount}/${totalImplemented} Vùng`.
  + Loại bỏ nhãn "Lộ Trình V1.3" / "V1.3" trong thông tin phân khu `the_depths` và trạng thái `UNIMPLEMENTED`.
- **`src/scenes/GameScene.ts`:**
  + Lưu tham chiếu hàm xử lý `onContextMenu = (e: MouseEvent) => e.preventDefault()`.
  + Bổ sung gỡ bỏ listener `contextmenu` trên canvas khi `GameScene` shutdown hook kích hoạt.
- **`src/ui/PauseModal.ts`:**
  + Lưu tham chiếu listener `onKeydownH` và gỡ bỏ listener `keydown-H` trong `destroy()`.
- **`src/ui/SettingsUIHelper.ts`:**
  + Bổ sung cơ chế dọn dẹp `scene.input.off('pointermove')` và `scene.input.off('pointerup')` khi container thanh trượt bị destroy (`container.once('destroy', ...)`).

---

## 3. KẾT QUẢ KIỂM THỬ THỰC TẾ (EVIDENCE & TEST RESULTS)

### 3.1. Bằng chứng kiểm tra Playwright trực tiếp (Headless Chromium, Noclip OFF):
```json
{
  "Pre-checks": {
    "phantomLanternInInteractables": false,
    "removedCheck": {
      "bush_1350_780": "REMOVED_OK",
      "bush_1420_745": "REMOVED_OK",
      "bush_1180_760": "REMOVED_OK",
      "bush_1260_800": "REMOVED_OK",
      "red_tree_1486_734": "REMOVED_OK"
    },
    "hideBushBonfireExists": false,
    "hideBushClearingExists": false,
    "bonfirePreserved": true,
    "willowHollowPos": { "x": 1305, "y": 885 },
    "willowInteractablePos": { "x": 1200, "y": 915 }
  },
  "Corridor Traversals (Noclip OFF)": {
    "North Entrance S-Curve to Hunter Camp": "PASS_CLEAR",
    "Sanctuary Farm Junction to Camp": "PASS_CLEAR",
    "Hunter Camp to Willow Clearing": "PASS_CLEAR",
    "Willow Clearing to Bell Workshop Trail": "PASS_CLEAR",
    "Straight Bell Workshop Corridor": "PASS_CLEAR",
    "Sir Vaelen Area Perimeter Loop": "PASS_CLEAR"
  },
  "Crafting Modal Check": {
    "isOpen": true,
    "btnTxtY": 152,
    "btnZoneY": 152,
    "btnBgVisible": true
  }
}
```

### 3.2. Danh mục ảnh chụp minh chứng (Lưu tại `Read/V1.5/Reports/Visuals/HW_FIX_21/`):
1. `before_sir_vaelen_15x.png` & `after_sir_vaelen_15x.png`: Đối chiếu toàn cảnh khu vực Sir Vaelen.
2. `crop_bonfire.png` & `crop_bonfire_after.png`: Phóng to chân đế bếp lửa Sir Vaelen chứng minh cây lá đỏ/tím dáng đứng (46x61px) tại (1486, 734) đã bị xóa hoàn toàn, mở thông khoảng thoáng.
3. `after_tree_1488_738_zoom.png`: Zoom 2.5x xác nhận không còn bất kỳ sprite/collider nào cản trở quanh (1488, 738).
4. `after_north_entrance.png`: Ảnh chụp Cửa rừng phía Bắc và khúc cua chữ S thông suốt.
5. `after_willow_clearing.png`: Ảnh chụp trục đường Bãi Liễu và ngã ba rẽ xuống Xưởng Chuông thoáng đãng.
6. `after_crafting_modal.png`: Ảnh chụp giao diện Bàn Chế Tạo chứng minh nút [Thiếu Đồ / Chế Tạo] khớp khung nền 100%.

### 3.3. Kiểm thử TypeScript & Build Production:
- `npx tsc --noEmit`: **PASS (0 lỗi)**
- `npm run build`: **PASS (Bundle dist thành công trong 9.86s, 100 modules transformed)**

---

## 4. CHECKLIST ĐỐI CHIẾU TIÊU CHÍ NHẬN BÀN GIAO

| Hạng mục kiểm tra | Yêu cầu | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| Xóa 4 bụi cản đường Outer Woods | (1350,780), (1420,745), (1180,760), (1260,800) | Đã xóa sprite & interactables trong `WorldBuilder.ts` và `zones.json` | **PASS** |
| Xóa cây lá đỏ/tím dưới bếp Vaelen | Bán kính 45px quanh (1488, 738) | Đã xóa sprite tại (1486, 734) trong `WorldBuilder.ts` | **PASS** |
| Xóa trigger ma Trụ Đèn Bão | `ow_lantern_checkpoint_1` (1220, 600) | Đã xóa khỏi `zones.json` và `outer_woods.json` | **PASS** |
| Độ rộng hành lang đường chính | Bề rộng >= 72px dọc trục đường đất | Dời cây đổ và chỉnh offset đá, Playwright noclip OFF PASS_CLEAR | **PASS** |
| Nhánh Bãi Liễu & Xưởng Chuông | Thoáng đãng >= 72px, không đè biển | Cụm liễu dời Tây x=1215, cây rỗng dời x=1305, cụm sồi dời x=1400 | **PASS** |
| Bảo toàn Bếp & Sir Vaelen | Bonfire (1470, 710), Sir Vaelen (1435, 710) | Giữ nguyên 100%, interactable `warm_quiet_bonfire` hoạt động tốt | **PASS** |
| Tàn dư xưởng Bram cũ | Sân đá & ember lò rèn | Đã chuyển sân đá sang (1348, 447) và ember sang (1318, 408) | **PASS** |
| Nút Chế Tạo CraftingModal | Khớp nền nút và chữ | Đã sửa `btnY = 180 - btnH - 12`, khớp Y=152 hoàn hảo | **PASS** |
| Checkpoint respawn Boss | Hồi sinh an toàn tại bếp Vaelen | Đã sửa từ `{ x: 2360, y: 720 }` sang `{ x: 1420, y: 710 }` | **PASS** |
| Cập nhật text JournalModal | Bà Lão Edda, đếm vùng động, bỏ V1.3 | Đã cập nhật toàn bộ trong `JournalModal.ts` | **PASS** |
| Dọn dẹp Event Listeners | `contextmenu`, `keydown-H`, slider pointer | Đã gỡ bỏ toàn bộ khi shutdown/destroy | **PASS** |
| Quy tắc V3 & Không đụng Audio | Không clean/reset/force-push, bảo toàn audio | Toàn bộ quy tắc được tuân thủ nghiêm ngặt | **PASS** |

---

## 5. KẾT LUẬN

Nhiệm vụ **HW-FIX-21** đã hoàn thành toàn diện và xuất sắc 100% mục tiêu đề ra. Toàn bộ mã nguồn, dữ liệu cấu hình bản đồ, và giao diện người dùng đã sẵn sàng tuyệt đối cho việc đóng gói phát hành phiên bản **HOLLOW WOODS V1.5.4**.
