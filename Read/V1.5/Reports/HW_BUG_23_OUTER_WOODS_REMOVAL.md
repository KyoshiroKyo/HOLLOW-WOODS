# BÁO CÁO NGHIỆM THU: HW-BUG-23 — VERIFY FIVE OUTER WOODS PROP REMOVALS (REVISED)

**Dự án:** HOLLOW WOODS — V1.5.4 PREP
**Workdir:** `G:\HOLLOW WOODS`
**Branch:** `feat/v1.5.3-ag-world-polish`
**Chế độ:** SOURCE READ-ONLY + VERIFICATION AUDIT (DOC-ONLY COMMIT)
**Thời gian nghiệm thu:** 2026-11-22
**Commit cơ sở đã xử lý:** `3b1982bac12a5e96941d99ed431cd2f1372bde15` (HW-FIX-21)
**Kết luận tổng thể:** **VERIFIED-BY-PRIOR-COMMIT** (ĐẠT 7/7 HẠNG MỤC KIỂM THỬ RUNTIME)

---

## 1. MỤC TIÊU & BỐI CẢNH

Trước khi ra mắt bản V1.5.4, khu vực Outer Woods cần được dọn dẹp các vật thể (prop cây/bụi) gây vướng víu tầm nhìn và cản trở di chuyển trên các lộ trình chính.
Owner đã chỉ định khảo sát và xử lý 5 prop cụ thể tại khu vực Outer Woods.

Qua rà soát lịch sử commit tại HEAD (`8dab105`), toàn bộ 5 prop và 2 prompt tàng hình (`hide_bush_ow_bonfire`, `hide_bush_ow_clearing`) đã được xử lý triệt để trong commit **`3b1982bac12a5e96941d99ed431cd2f1372bde15`** (`HW-FIX-21 — OUTER WOODS CLEANUP, SIR VAELEN AREA & PRE-V1.5.4 CODE HOTFIXES`).

Nhiệm vụ HW-BUG-23 (REVISED) thực hiện kiểm toán độc lập (Verification Audit) nhằm:
1. Đối chiếu chính xác tọa độ do Owner chỉ định và tọa độ mã nguồn đã loại bỏ.
2. Kiểm thử runtime trong game thực tế bằng Playwright headless browser.
3. Xác nhận không còn sprite, không còn collider mồ côi, noclip OFF đi xuyên thông thoáng, không còn prompt ma, và bảo toàn 100% các NPC, tương tác hợp lệ lân cận.

---

## 2. MA TRẬN ĐỐI CHIẾU 5 PROP MỤC TIÊU

| TT | Định danh Prop | Tọa độ Owner | Tọa độ Source (`WorldBuilder.ts`) | Độ lệch ($\Delta x, \Delta y$) | Sprite / Texture | Collider mồ côi | Trạng thái Nghiệm thu |
|:---|:---|:---:|:---:|:---:|:---|:---:|:---:|
| 1 | Bụi rậm lối mòn Đông | (1351, 776) | (1350, 780) | 1px, 4px ($\approx 4.1\text{px}$) | Đã xóa (`createDenseBush(1350, 780)`) | **0 (Sạch)** | **VERIFIED-ABSENT** |
| 2 | Bụi rậm Trạm Lửa Sir Vaelen | (1415, 742) | (1420, 745) | 5px, 3px ($\approx 5.8\text{px}$) | Đã xóa (`createDenseBush(1420, 745)`) | **0 (Sạch)** | **VERIFIED-ABSENT** |
| 3 | Bụi rậm ngã ba Tây | (1182, 756) | (1180, 760) | 2px, 4px ($\approx 4.5\text{px}$) | Đã xóa (`createDenseBush(1180, 760)`) | **0 (Sạch)** | **VERIFIED-ABSENT** |
| 4 | Bụi rậm Bãi Rừng Thưa | (1255, 797) | (1260, 800) | 5px, 3px ($\approx 5.8\text{px}$) | Đã xóa (`createDenseBush(1260, 800)`) | **0 (Sạch)** | **VERIFIED-ABSENT** |
| 5 | Cây lá đỏ/tím dưới bếp Sir Vaelen | (1488, 738) | (1486, 734) | 2px, 4px ($\approx 4.5\text{px}$) | Đã xóa (`prop_fallen_log_mossy_v14`) | **0 (Sạch)** | **VERIFIED-ABSENT** |

> [!NOTE]
> Độ lệch giữa tọa độ Owner ước lượng bằng mắt trong viewport và tọa độ neo chân vật thể trong source code chỉ từ 4.1px đến 5.8px (hoàn toàn trùng khớp cùng một đối tượng).

---

## 3. KẾT QUẢ KIỂM THỬ RUNTIME CHI TIẾT (7/7 CHECKS PASS)

Script kiểm thử: `tests/hw_bug_23_prop_removal_verification.py`

### Check 1: Xác nhận không còn 5 Sprite mục tiêu
- Quét toàn bộ children list của `GameScene`:
  - Prop 1 [1350, 780] & [1351, 776]: `foundProps = 0`, `strictNear = 0` $\implies$ **PASS**
  - Prop 2 [1420, 745] & [1415, 742]: `foundProps = 0`, `strictNear = 0` $\implies$ **PASS**
  - Prop 3 [1180, 760] & [1182, 756]: `foundProps = 0`, `strictNear = 0` $\implies$ **PASS**
  - Prop 4 [1260, 800] & [1255, 797]: `foundProps = 0`, `strictNear = 0` $\implies$ **PASS**
  - Prop 5 [1486, 734] & [1488, 738]: `foundProps = 0`, `strictNear = 0` $\implies$ **PASS**
- **Kết quả:** Cả 5 sprite đã bị dọn sạch 100%.

### Check 2: Kiểm tra không tồn tại Collider mồ côi (Orphan Colliders)
- Kiểm tra toàn bộ tĩnh vật trong `WorldBuilder.colliderGroup`:
  - Không có bất kỳ collider mồ côi nào gắn với 5 prop đã xóa tại cả 5 vị trí.
- **Kết quả:** **PASS** (Zero orphan colliders).

### Check 3: Thử nghiệm di chuyển thực tế với Noclip OFF
- Đặt Player foot anchor tại từng tọa độ mục tiêu Owner với chế độ vật lý đầy đủ (`body.checkCollision.none = false`):
  - Prop 1 at (1351, 776): `Overlap = False` $\implies$ **CLEAR**
  - Prop 2 at (1415, 742): `Overlap = False` $\implies$ **CLEAR**
  - Prop 3 at (1182, 756): `Overlap = False` $\implies$ **CLEAR**
  - Prop 4 at (1255, 797): `Overlap = False` $\implies$ **CLEAR**
  - Prop 5 at (1488, 738): `Overlap = False` $\implies$ **CLEAR**
- **Kết quả:** Người chơi di chuyển hoàn toàn thông thoáng qua tất cả 5 vị trí mà không bị kẹt hay cản trở bởi bất kỳ collider ma nào.

### Check 4: Loại bỏ hoàn toàn Prompt ma (Ghost Prompts)
- Kiểm tra danh sách `zone.interactables`:
  - `hide_bush_ow_bonfire` (tại 1420, 745): **KHÔNG TỒN TẠI** (Đã xóa)
  - `hide_bush_ow_clearing` (tại 1260, 800): **KHÔNG TỒN TẠI** (Đã xóa)
  - `ow_lantern_checkpoint_1` (checkpoint đèn lồng thừa): **KHÔNG TỒN TẠI** (Đã xóa)
- **Kết quả:** Không còn bất kỳ prompt ma nào nổi lên khi đi ngang qua các khu vực đã dọn dẹp.

### Check 5: Bảo toàn các điểm ẩn nấp hợp lệ (Stealth Hiding Spots)
- Các điểm ẩn nấp chiến thuật còn lại trong Outer Woods:
  - `hide_tree_ow_north` (1360, 620): Tồn tại, prompt `[E] Ẩn Nấp Vào Cây Rỗng` $\implies$ **INTACT**
  - `hide_tree_ow_willow` (1305, 885): Tồn tại, prompt `[E] Ẩn Nấp Vào Cây Rỗng` $\implies$ **INTACT**
- **Kết quả:** Tính năng stealth của Outer Woods được bảo toàn đúng thiết kế.

### Check 6: Khu vực Sir Vaelen & Bếp Lửa Cổ nguyên vẹn
- `npc_campfire_knight` (Sir Vaelen) tại (1435, 710): **TỒN TẠI, NGUYÊN VẸN**
- `warm_quiet_bonfire` (Bếp Lửa Hồng Rừng Tĩnh Lặng) tại (1470, 710): **TỒN TẠI, HOẠT ĐỘNG BÌNH THƯỜNG**
- Portal chuyển cảnh Bellhollow (`to_bellhollow_from_ow`) & Crooked Path (`to_crooked_path_from_ow`): **HOÀN TOÀN BÌNH THƯỜNG**
- Tuyến hành lang Xưởng Chuông (1360, 760..1040): Độ rộng lối đi $\ge 72\text{px}$, không vật cản.

### Check 7: Hình ảnh nghiệm thu thực tế
- Ảnh 1: `Read/V1.5/Reports/Visuals/HW_BUG_23/hw_bug_23_vaelen_cleared_area.png` — Quang cảnh khu vực trạm lửa Sir Vaelen thông thoáng, sạch sẽ, không còn bụi rậm che chắn hay cây chắn lối dưới bếp lửa.
- Ảnh 2: `Read/V1.5/Reports/Visuals/HW_BUG_23/hw_bug_23_clearing_bushes_removed.png` — Lối mòn Đông và Bãi Rừng Thưa đã được dọn sạch bụi rậm, tầm nhìn rộng thoáng.

---

## 4. KẾT LUẬN

Nhiệm vụ **HW-BUG-23 (REVISED)** nghiệm thu đạt 100% các tiêu chí kỹ thuật:
- **Trạng thái:** **VERIFIED-BY-PRIOR-COMMIT**
- **Commit chứng minh:** `3b1982bac12a5e96941d99ed431cd2f1372bde15` (HW-FIX-21)
- **Quyết định:** Không thực hiện bất kỳ thay đổi nào vào gameplay code hay dọn thêm môi trường ngoài chỉ định; tiến hành đóng task bằng doc-only commit.
