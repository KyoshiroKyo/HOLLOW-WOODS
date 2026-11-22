# BÁO CÁO KIỂM ĐỊNH HW-BUG-#15 — MAP COLLISION & WALKABLE PATH REGRESSION

- **Dự án:** HOLLOW WOODS V1.5.3 (PREP V1.5.4)
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Tác vụ:** HW-BUG-#15 — Đánh giá hồi quy va chạm và thông suốt lộ trình di chuyển (Map Collision & Walkable Path Regression)
- **Phương thức:** Chromium Headless (Playwright Automation, Noclip OFF, kiểm thử vật lý thực nghiệm)
- **Kết luận:** **`VERIFIED-NO-CHANGE`** (Hệ thống va chạm tĩnh, ranh giới thế giới và các lối đi bộ chính đều thông suốt 100%, không phát hiện collider rác/vô hình, collider đúp sau Save/Continue = 0, commit **DOC-ONLY**).

---

## 1. BẢNG ĐỐI CHIẾU VẬT LÝ VÀ ĐỘ THÔNG SUỐT LỘ TRÌNH (COLLISION MATRIX)

| STT | Phân khu (Zone) | Tọa độ (XY) | Đối tượng kiểm định (Object ID / Name) | Hộp va chạm AABB (Kích thước / Vị trí) | Kết quả kiểm định thực nghiệm | Trạng thái |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| **1** | `fog_crossing` | (120, 195) &rarr; (192, 195) | Lối mòn ban sơ (Main starter trail) | Open path, không có collider chắn trục đường chính | Nhân vật di chuyển mượt mà từ spawn (120, 195) sang Đông | **PASS** |
| **2** | `fog_crossing` | (200, 58) | Hàng rào / Cây phía Bắc (`bound_top`) | `rect=(0, 0, 480, 40)` | Chặn người chơi an toàn ở `y = 58`, ngăn rơi khỏi map | **PASS** |
| **3** | `fog_crossing` | (450, 235) &rarr; (645, 235) | Hành lang Cổng Tây (`to_bellhollow`) | Cửa ngõ mở thông giữa hai hàng rào `(448, 0)` và `(448, 260)` | Thông suốt 100%, bước qua ranh giới x=480 êm ái | **PASS** |
| **4** | `bellhollow` | (540, 205) | NPC Garth (`npc_garth`) | Container foot hitbox `[531, 197, 549, 213]` | Đường vòng phía Nam `(510..640, 250)` thông thoáng; đâm trực diện bị chặn đúng chân | **PASS** |
| **5** | `bellhollow` | (680, 230) & (800, 260) | Nhà Edda & Giếng nước Quảng trường | Giếng: `(800, 255, 36, 30)`; Nhà: `(640, 180, 96, 64)` | Trục đường trung tâm `y=245..260` đi ngang quảng trường không vướng collider | **PASS** |
| **6** | `bellhollow` | (1050, 220) | NPC Neris (`npc_neris`) | Container foot hitbox `[1041, 212, 1059, 228]` | Tuyến đường sang Cổng Đông rộng thoáng, lướt qua Neris an toàn | **PASS** |
| **7** | `bellhollow` | (1190, 375) &rarr; (1320, 406) | Nhánh đường đất vào xưởng Bram mới | Đường đất hữu cơ `drawOrganicDirtPath`, đã dọn củi và bụi cây | Lối vào sân xưởng Bram hoàn toàn rộng mở, không còn vật cản | **PASS** |
| **8** | `bellhollow` | (1373, 432) | Móng xưởng rèn Bram (`crafting_workshop_pavilion`) | Footing collider `[1296, 400, 1450, 432]` | Đâm từ Nam lên bị chặn đúng chân tường tại `y = 450` (body.bottom chạm 432) | **PASS** |
| **9** | `sanctuary_farm` | (650, 520) &rarr; (650, 676) | Lối Nam Bellhollow &rarr; Nông Trại Trú Ẩn | Trục rải đá thông suốt, ranh giới seam `y=560` | Chuyển vùng tự nhiên, không snapback, không giật lùi | **PASS** |
| **10** | `sanctuary_farm` | (700, 660) &rarr; (872, 680) | Khu 4 ô thảo mộc & bờ đá (`herb_terrace`) | Lối đi bộ ven ruộng bậc thang dược liệu | Hành lang đi lại thu hái thảo dược rộng rãi, không kẹt góc bờ đá | **PASS** |
| **11** | `sanctuary_farm` | (650, 990) &rarr; (650, 1026) | Hàng rào Nam Nông Trại (`farm_bound_bottom_left`) | `rect=(480, 1020, 300, 32)` | Chặn đứng người chơi tại `player.y = 1026` (body.bottom chạm đúng 1020) | **PASS** |
| **12** | `outer_woods` | (1210, 520) &rarr; (1210, 621) | Cửa ngõ Đông Nam Bellhollow &rarr; Rừng Ngoại Vi | Khoảng hở hàng rào `(1150, 535, 120, 25)` | Lối mòn đất thông suốt dẫn thẳng vào vành đai rừng ven | **PASS** |
| **13** | `outer_woods` | (1347, 939) &rarr; (1360, 1100) | Lối vào Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`) | Trigger Portal `rect=(1320, 1000, 80, 40)` | Kích hoạt chuyển cảnh an toàn vào xưởng tại `(1360, 1100)`, không kẹt phế tích | **PASS** |
| **14** | Liên khu | (1080, 750) &rarr; (1162, 750) | Hành lang liên thông Nông Trại <-> Rừng Ngoại Vi | Trigger thông khu `(1100, 680, 20, 140)` | Người chơi qua lại tự do giữa Farm và Outer Woods | **PASS** |
| **15** | `bellhollow` | (1468, 280) | Rào chắn Cổng Đông chưa mở (`east_gate`) | Cánh cổng gỗ xích sắt `rect=(1580, 200, 20, 160)` | Chặn người chơi tại `(1468, 280)`, ngăn lọt sang `crooked_path` khi chưa mở | **PASS** |

---

## 2. KẾT QUẢ KIỂM THỬ PLAYWRIGHT RUNTIME (NOCLIP OFF)

Bộ kiểm thử tự động [scripts/test_hw_bug15_collision_regression.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug15_collision_regression.py) được thực thi độc lập trên bản dựng production:

### Case A: Fog Crossing & Lối vào Bellhollow
- **A1:** Đi từ điểm xuất phát `(120, 195)` sang Đông dọc lối mòn đạt `(189.4, 195)`. Tuyến đường mở thông suốt.
- **A2:** Đi lên Bắc đâm vào hàng rào cây `y=40` &rarr; Bị chặn đứng an toàn tại `(200, 58)`.
- **A3:** Đi xuyên qua Cổng Tây làng Bellhollow đạt `(645.5, 235)` &rarr; Không va chạm vô hình.
- &rarr; **CASE A PASS: True**

### Case B: Bellhollow (Edda, Neris, Garth, Bram & Quảng Trường)
- **B1:** Đi vòng qua Trạm gác Garth trên trục đường đạt `(640.3, 250)`. Hitbox Garth đã chuẩn hóa ở HW-BUG-#3 không còn cản trở mặt đường.
- **B2:** Đi qua khu nhà Bà lão Edda và Giếng nước trung tâm đạt `(791.5, 244.2)`.
- **B3:** Đi qua trạm Neris đạt `(1092.1, 259.8)`.
- **B4:** Đi theo đường đất uốn lượn vào sân xưởng Bram mới đạt `(1320.3, 406)`. Đâm lên chân móng xưởng bị cản chuẩn tại `(1350, 450)`.
- &rarr; **CASE B PASS: True**

### Case C: Bellhollow <-> Sanctuary Farm
- **C1:** Đi qua lối Nam vào Nông Trại đạt `(650, 676.6)` &rarr; Chuyển vùng an toàn sang `sanctuary_farm`.
- **C2:** Đi bộ dọc theo khu vườn bậc thang thảo dược đạt `(872.7, 680.8)` &rarr; Khoảng không gian canh tác rộng rãi.
- **C3:** Thử nghiệm va chạm chân hàng rào Nam nông trại &rarr; Player body bị giữ vững tại `player.y = 1026` (body.bottom = 1020).
- &rarr; **CASE C PASS: True**

### Case D: Outer Woods (Trại Thợ Săn, Sir Vaelen & Xưởng Chuông)
- **D1:** Đi từ cửa ngõ Đông Nam Bellhollow vào Outer Woods đạt `(1210, 621.3)`.
- **D2:** Di chuyển xuyên qua vành đai rừng ven xuống cửa phế tích đạt `(1347.8, 939.8)`.
- **D3:** Bước vào trigger xưởng đúc chuông &rarr; Đưa nhân vật tới an toàn tại `(1360, 1100)` trong `sub_bell_workshop`.
- &rarr; **CASE D PASS: True**

### Case E: Các tuyến mở hợp lệ & Kiểm tra Collider đúp sau Save/Continue
- **E1:** Đi qua hành lang liên thông Farm <-> Outer Woods đạt `(1162.2, 750)` thuộc `outer_woods`.
- **E2:** Đi tới rào chắn Cổng Đông khi đang khóa &rarr; Bị giữ chắc chắn tại `(1468, 280)`.
- **E3 — Kiểm tra Collider trùng lặp sau Save/Continue:**
  - Tổng số Collider Static Bodies trước khi Save: `0` (Được quản lý trong Group).
  - Tổng số Collider Children trong `worldBuilder.colliderGroup` trước khi Save: `326`.
  - Thực hiện lưu game `handleSaveManual()` và nạp lại qua `handleLoadCheckpoint()`.
  - Tổng số Collider Children trong `worldBuilder.colliderGroup` sau khi Continue: `326`.
  - **Độ chênh lệch (Delta):** $\Delta = 0$ (Hoàn toàn không sinh ra collider rác hay collider trùng lặp).
- &rarr; **CASE E PASS: True**

---

## 3. BẰNG CHỨNG HÌNH ẢNH (VISUAL ARTIFACTS)

Các ảnh chụp màn hình kiểm định lưu tại [Read/V1.5/Reports/Visuals/](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/):

1. **Case A — Fog Crossing & Lối vào Cổng Tây:**
   ![Case A Visual](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug15_case_a_fog_crossing.png)

2. **Case B — Lộ trình Làng Bellhollow & Xưởng Bram (1373, 432):**
   ![Case B Visual](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug15_case_b_bellhollow.png)

3. **Case C — Lối đi & Ruộng Dược liệu Sanctuary Farm:**
   ![Case C Visual](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug15_case_c_farm.png)

4. **Case D — Tuyến Rừng Ngoại Vi & Xưởng Chuông Bỏ Hoang:**
   ![Case D Visual](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug15_case_d_outer_woods.png)

5. **Case E — Hành lang liên thông, Rào chắn Cổng Đông & Save/Continue:**
   ![Case E Visual](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug15_case_e_gating_save_continue.png)

---

## 4. DỮ LIỆU ĐO ĐẠC TELEMETRY & KIỂM ĐỊNH MÃ NGUỒN

- **Dữ liệu JSON thu thập:** [Read/V1.5/Reports/HW_BUG_15_COLLISION_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_15_COLLISION_DATA.json).
- **Lỗi JavaScript Console:** 0.
- **Lỗi Trang (Page Errors):** 0.
- **Số lượng collider bị lỗi cần phẫu thuật:** 0 (Không phát hiện lỗi cản trở bất thường).
- **TypeScript Check:** `npx tsc --noEmit` &rarr; **EXIT 0** (Clean).
- **Production Build:** `npm run build` &rarr; **EXIT 0** (Vite build thành công trong 13.35s).
- **Bảo toàn tệp âm thanh ngoại lệ:** Ba file `AUDIO_SOURCES_MANIFEST.csv`, `AUDIO_SOURCES_MANIFEST.json` và `generate_audio_sources_manifest.mjs` được giữ nguyên untracked.

---

## 5. KẾT LUẬN & CAM KẾT VẬN HÀNH

- **Kết luận:** **`VERIFIED-NO-CHANGE`** (DOC-ONLY commit).
- Toàn bộ bản đồ, hệ thống va chạm vật lý AABB, ranh giới và lối đi bộ đều đạt chuẩn 100%.
- Không tự ý sửa mã nguồn khi không có hồi quy lỗi; tuân thủ nghiêm ngặt HARD STOP ngay sau HW-BUG-#15.
