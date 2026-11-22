# BÁO CÁO KIỂM TOÁN TƯƠNG TÁC: HW-BUG-25A — VERIFY REMOVED STORM LAMP INTERACTION (REVISED)

**Dự án:** HOLLOW WOODS — V1.5.4 PREP
**Workdir:** `G:\HOLLOW WOODS`
**Branch:** `feat/v1.5.3-ag-world-polish`
**Chế độ:** READ-ONLY SOURCE + RUNTIME AUDIT (DOC-ONLY COMMIT)
**Thời gian thực hiện:** 2026-11-22
**Commit cơ sở đã xử lý:** `3b1982bac12a5e96941d99ed431cd2f1372bde15` (HW-FIX-21)
**Kết luận tổng thể:** **A: Removed correctly, no ghost $\implies$ VERIFIED-BY-PRIOR-COMMIT** (Đạt 6/6 tiêu chí kiểm toán, không còn tàn dư ma, không yêu cầu can thiệp mã nguồn tại HW-BUG-25B).

---

## 1. MỤC TIÊU & BỐI CẢNH

"Trụ Đèn Bão" từng là một điểm tương tác checkpoint tạm thời (`ow_lantern_checkpoint_1`) tại tọa độ `(1220, 600)` thuộc phân khu Outer Woods với hành động `ignite_lantern_checkpoint` và nhãn `[E] Thắp Sáng Trụ Đèn`.
Trong bản dọn dẹp địa hình HW-FIX-21 (commit `3b1982b`), đối tượng này đã được loại bỏ hoàn toàn khỏi `src/data/zones.json` và `src/data/maps/outer_woods.json` để tránh gây nhiễu cốt truyện và xung đột với hệ thống Trạm Lửa của Sir Vaelen.

Nhiệm vụ HW-BUG-25A tiến hành kiểm toán sâu (Source Deep-Search & Runtime Physical Audit) nhằm xác nhận:
1. Không còn bất kỳ tàn dư nào của objectId/actionId trong mã nguồn, bản đồ và hệ thống nhiệm vụ.
2. Vùng tọa độ (1220, 600) hoàn toàn sạch sẽ, không có prompt ma hay collider mồ côi.
3. Bảo toàn 100% các nguồn nhiệt/đèn lồng hợp lệ khác trong game.
4. Tương thích ngược an toàn tuyệt đối với Save file cũ chứa cờ legacy.

---

## 2. KẾT QUẢ RÀ SOÁT MÃ NGUỒN TOÀN DIỆN (SOURCE DEEP-SEARCH)

| Hạng mục kiểm tra | Từ khóa tìm kiếm | Vị trí quét | Kết quả rà soát |
|:---|:---|:---|:---:|
| **ObjectId Trụ Đèn Bão** | `ow_lantern_checkpoint_1` | Toàn bộ `src/`, `maps/`, `zones.json` | **0 kết quả** (Đã xóa sạch) |
| **ActionId Thắp Đèn** | `ignite_lantern_checkpoint` | Toàn bộ `src/`, `GameScene.ts` | **0 kết quả** (Đã xóa sạch) |
| **Chuỗi giao diện Tiếng Việt** | `"Thắp Sáng Trụ Đèn"`, `"Trụ Đèn Bão"` | Toàn bộ `src/`, UI scenes | **0 kết quả** (Đã xóa sạch) |
| **Object trong Tilemap JSON** | ID 22 (`outer_woods.json`) | `src/data/maps/outer_woods.json` | **0 kết quả** (Đã xóa sạch) |
| **Hệ thống Nhiệm vụ (Quest)** | Tham chiếu checkpoint đèn | `quests.json`, `QuestSystem.ts` | **0 kết quả** (Nhiệm vụ `SQ09_BROKEN_LANTERN` chỉ dùng item `item_broken_patrol_lantern` cho Garth, không phụ thuộc vào checkpoint này) |

---

## 3. KẾT QUẢ KIỂM THỬ RUNTIME CHI TIẾT (6/6 CHECKS PASS)

Script kiểm toán: `tests/hw_bug_25a_storm_lamp_audit.py`

### Check 1: Xác minh dữ liệu vùng và Display List
- Quét toàn bộ danh sách `interactables` của Outer Woods: `ow_lantern_checkpoint_1` và `ignite_lantern_checkpoint` trả về `False`.
- Quét toàn bộ Display List trong bán kính 40px quanh (1220, 600): Không có bất kỳ sprite nào chứa texture hoặc tên "lantern".
- **Kết quả:** **PASS**.

### Check 2: Khảo sát vật lý & prompt tại tọa độ (1220, 600) với Noclip OFF
- Đặt nhân vật với foot anchor tại `(1220, 600)` và `body.checkCollision.none = false`:
  - `Collision at (1220, 600)`: **False** (Không có collider ngầm hay chướng ngại vật mồ côi).
  - `Active interactable`: **None** (Không có prompt tàng hình).
  - `UI interactPrompt`: **Invisible / None** (Giao diện không hiển thị prompt ma nào).
- **Kết quả:** **PASS**.

### Check 3: Phân biệt rõ ràng với Biển Chỉ Dẫn hợp lệ `ow_signpost` tại (1220, 640)
- Tại tọa độ `(1220, 640)` (cách vị trí đèn cũ 40px về phía Nam):
  - Biển đá chỉ dẫn `ow_signpost` tồn tại bình thường với prompt `[E] Đọc Biển Chỉ Dẫn Rừng Ven`.
  - Phân biệt minh bạch giữa biển chỉ dẫn đang hoạt động và vị trí đèn bão đã dọn dẹp.
- **Kết quả:** **PASS**.

### Check 4: Bảo toàn các nguồn nhiệt và đèn lồng khác trong game
- **Bếp Lửa Hồng Đá Cổ của Sir Vaelen (1470, 710):** Tồn tại, interactable `warm_quiet_bonfire` kích hoạt bình thường (`[E] Sưởi Ấm Bên Lửa Cổ`).
- **Đèn Lồng Cầm Tay [F] của Người Lữ Khách:** Thử nghiệm bấm phím [F] chuyển đổi trạng thái `stats.isLanternOn` (False $\to$ True $\to$ False) thành công 100%, vòng sáng hoạt động bình thường.
- **Kết quả:** **PASS**.

### Check 5: Mô phỏng tương thích an toàn với file Save cũ (Legacy Save Migration)
- Tạo dữ liệu SaveData giả lập chứa các cờ di sản: `flags: ['ow_lantern_checkpoint_1', 'ignite_lantern_checkpoint']`.
- Chạy qua logic bóc tách của `SaveManager.ts`:
  - Các cờ cũ được nạp và lưu trữ an toàn trong danh sách `flags` của người chơi.
  - Không ném ngoại lệ, không gây lỗi văng game, bảo toàn tuyệt đối Save Schema 3 mà không cần can thiệp lược đồ.
- **Kết quả:** **PASS**.

### Check 6: Minh chứng trực quan (Visual Screenshots)
1. `Read/V1.5/Reports/Visuals/HW_BUG_25A/hw_bug_25a_cleared_lantern_area.png`: Khu vực tọa độ (1220, 600) hoàn toàn trống thoáng, mặt đất tự nhiên sạch bóng sprite đèn ma.
2. `Read/V1.5/Reports/Visuals/HW_BUG_25A/hw_bug_25a_stone_sign_interaction.png`: Nhân vật đứng tại (1220, 638) tương tác bình thường với Biển Chỉ Dẫn `ow_signpost`.
3. `Read/V1.5/Reports/Visuals/HW_BUG_25A/hw_bug_25a_handheld_lantern_active.png`: Vòng sáng đèn lồng cầm tay phím [F] rực sáng ổn định.

---

## 4. KẾT LUẬN & ĐỀ XUẤT NHIỆM VỤ TIẾP THEO

- **Trạng thái phân loại:** **Phương án A: Removed correctly, no ghost $\implies$ VERIFIED-BY-PRIOR-COMMIT**.
- Toàn bộ Trụ Đèn Bão đã được commit HW-FIX-21 loại bỏ đúng quy cách kỹ thuật, không có prompt ma, không có collider mồ côi và không làm ảnh hưởng đến bất kỳ tính năng gameplay nào khác.
- **Đối với nhiệm vụ HW-BUG-25B:** Không có blocker hoặc lỗi tàn dư nào cần sửa chữa. HW-BUG-25B chỉ cần xác nhận **NO FIX REQUIRED / VERIFIED-BY-PRIOR-COMMIT**.
