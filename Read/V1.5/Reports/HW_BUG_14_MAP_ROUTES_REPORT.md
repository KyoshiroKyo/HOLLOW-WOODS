# BÁO CÁO KIỂM ĐỊNH HW-BUG-#14 — MAP ROUTES & TRANSITION INTEGRITY

- **Dự án:** HOLLOW WOODS V1.5.3 (PREP V1.5.4)
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Tác vụ:** HW-BUG-#14 — Đánh giá tính toàn vẹn của các tuyến đường và chuyển vùng thế giới (Map Routes & Transition Integrity)
- **Phương thức:** Chromium Headless (Playwright Automation, Noclip OFF, không dùng F9 giả lập quest)
- **Kết luận:** **`VERIFIED-NO-CHANGE`** (Hệ thống tuyến đường, rào chắn cốt truyện và cơ chế chuyển tiếp hoạt động hoàn hảo, đạt 100% tiêu chí kiểm định, 0 lỗi runtime, commit **DOC-ONLY**).

---

## 1. PHÂN BIỆT ĐỊNH DANH VÀ TOPOLOGY CÁC PHÂN KHU (ZONE TOPOLOGY AUDIT)

Đối chiếu mã nguồn giữa ba tệp quản lý phân khu:
1. **`src/data/zones.json` (17 phân khu):**
   - 9 phân khu bề mặt chính: `fog_crossing`, `bellhollow`, `sanctuary_farm`, `outer_woods`, `crooked_path`, `deep_forest`, `silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`.
   - 8 phân khu mở rộng và tiểu khu ngầm: `sub_bell_workshop`, `sub_root_cellar`, `sub_whispering_clearing`, `abyssal_chasm`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`.
2. **`src/world/ZoneConnectionRegistry.ts` (10 phân khu node):**
   - Quản lý 10 node chiến lược trên mạng lưới bản đồ chính (9 phân khu bề mặt + `sub_bell_workshop`), gồm 24 kết nối cấu trúc (12 cặp hai chiều).
3. **`src/ui/ParchmentWorldMapModal.ts` (10 điểm mốc hiển thị):**
   - 10 node thể hiện trên bản đồ da cừu (gồm 9 phân khu bề mặt + `abyssal_chasm`).
4. **Nhận định kỹ thuật:** Sự chênh lệch số lượng phân khu giữa 17 (zones.json) và 10 (registry/map modal) là hoàn toàn có chủ đích theo thiết kế kiến trúc phân tầng (Layer 1 Core, Layer 2 Frontier, Layer 3 Forbidden & Dungeons), không phải lỗi bất đồng bộ.

---

## 2. BẢNG ROUTE MATRIX HOÀN CHỈNH (ROUTE & TRANSITION MATRIX)

Dưới đây là bảng ma trận kiểm kê toàn bộ các tuyến chuyển vùng chính thức của trò chơi:

| Connection / Transition ID | From &rarr; To | Entry XY (Target Spawn) | Exit XY (Return Point) | Reverse Connection | Điều kiện mở khóa (Required Flag / Quest) | Trạng thái kỹ thuật |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `conn_fog_to_bellhollow` / `to_bellhollow` | `fog_crossing` &rarr; `bellhollow` | (520, 260) | (440, 180) | `conn_bellhollow_to_fog` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_bellhollow_to_fog` / `to_fog_crossing` | `bellhollow` &rarr; `fog_crossing` | (440, 180) | (520, 260) | `conn_fog_to_bellhollow` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_bellhollow_to_farm` / `to_sanctuary_farm` | `bellhollow` &rarr; `sanctuary_farm` | (650, 580) | (650, 510) | `conn_farm_to_bellhollow` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_farm_to_bellhollow` / `to_bellhollow_from_farm` | `sanctuary_farm` &rarr; `bellhollow` | (650, 510) | (650, 580) | `conn_bellhollow_to_farm` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_bellhollow_to_outer_woods` / `to_outer_woods` | `bellhollow` &rarr; `outer_woods` | (1210, 580) | (1210, 510) | `conn_outer_woods_to_bellhollow` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_outer_woods_to_bellhollow` / `to_bellhollow_from_ow` | `outer_woods` &rarr; `bellhollow` | (1210, 510) | (1210, 580) | `conn_bellhollow_to_outer_woods` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_farm_to_outer_woods` / `to_outer_woods_from_farm` | `sanctuary_farm` &rarr; `outer_woods` | (1140, 750) | (1080, 750) | `conn_outer_woods_to_farm` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_outer_woods_to_farm` / `to_farm_from_ow` | `outer_woods` &rarr; `sanctuary_farm` | (1080, 750) | (1140, 750) | `conn_farm_to_outer_woods` | Luôn mở (Tầng 1 Core) | **ACTIVE** |
| `conn_bellhollow_to_crooked_path` / `to_crooked_path` | `bellhollow` &rarr; `crooked_path` | (1640, 280) | (1540, 280) | `conn_crooked_path_to_bellhollow` | Flag: `east_gate_unlocked` | **LOCKED** (Đầu game) / **ACTIVE** (Sau mở cổng) |
| `conn_crooked_path_to_bellhollow` / `to_bellhollow_from_cp` | `crooked_path` &rarr; `bellhollow` | (1540, 280) | (1640, 280) | `conn_bellhollow_to_crooked_path` | Lối rút lui an toàn | **ACTIVE** |
| `conn_outer_woods_to_crooked_path` / `to_crooked_path_from_ow` | `outer_woods` &rarr; `crooked_path` | (1640, 500) | (1540, 780) | `conn_crooked_path_to_outer_woods` | Cần mở Cổng Đông (`crooked_path`) | **LOCKED** (Đầu game) / **ACTIVE** (Sau mở cổng) |
| `conn_crooked_path_to_outer_woods` / `to_outer_woods_from_cp` | `crooked_path` &rarr; `outer_woods` | (1540, 780) | (1640, 500) | `conn_outer_woods_to_crooked_path` | Lối rẽ né quái vật | **ACTIVE** |
| `conn_outer_woods_to_bell_workshop` / `to_bell_workshop` | `outer_woods` &rarr; `sub_bell_workshop` | (1360, 1100) | (1360, 960) | `conn_bell_workshop_to_outer_woods` | Luôn mở (Khám phá xưởng đúc) | **ACTIVE** |
| `conn_bell_workshop_to_outer_woods` / `to_outer_woods_from_bw` | `sub_bell_workshop` &rarr; `outer_woods` | (1360, 980) | (1360, 1100) | `conn_outer_woods_to_bell_workshop` | Luôn mở (Rời xưởng đúc) | **ACTIVE** |
| `to_root_cellar` | `sanctuary_farm` &rarr; `sub_root_cellar` | (800, 1100) | (800, 960) | `to_farm_from_cellar` | Luôn mở (Chòi nông cụ) | **ACTIVE** |
| `to_farm_from_cellar` | `sub_root_cellar` &rarr; `sanctuary_farm` | (800, 980) | (800, 1100) | `to_root_cellar` | Luôn mở (Trở lên nông trại) | **ACTIVE** |
| `conn_crooked_path_to_deep_forest` / `to_deep_forest` | `crooked_path` &rarr; `deep_forest` | (2080, -80) | (2080, 60) | `conn_deep_forest_to_crooked_path` | Quest: `Q04_ANCIENT_RUNES`, Flag: `talked_to_neris` | **LOCKED** (Gated) |
| `conn_deep_forest_to_crooked_path` / `to_crooked_path_from_df` | `deep_forest` &rarr; `crooked_path` | (2080, 60) | (2080, -80) | `conn_crooked_path_to_deep_forest` | Lối thoát an toàn về Đường Mòn | **ACTIVE** |
| `conn_deep_forest_to_silent_mire` / `to_silent_mire_from_df` | `deep_forest` &rarr; `silent_mire` | (2920, 200) | (2800, -260) | `conn_silent_mire_to_deep_forest` | Quest: `Q04_ANCIENT_RUNES` | **LOCKED** (Gated) |
| `conn_silent_mire_to_deep_forest` / `to_deep_forest_from_sm` | `silent_mire` &rarr; `deep_forest` | (2800, -260) | (2920, 200) | `conn_deep_forest_to_silent_mire` | Lối dốc đá lên rừng nguyên sinh | **ACTIVE** |
| `conn_crooked_path_to_silent_mire` / `to_silent_mire` | `crooked_path` &rarr; `silent_mire` | (2940, 320) | (2820, 280) | `conn_silent_mire_to_crooked_path` | Quest: `Q04_ANCIENT_RUNES:t1` | **LOCKED** (Gated) |
| `conn_silent_mire_to_crooked_path` / `to_crooked_path_from_sm` | `silent_mire` &rarr; `crooked_path` | (2820, 280) | (2940, 320) | `conn_crooked_path_to_silent_mire` | Lối bước lên khỏi vũng lầy | **ACTIVE** |
| `conn_silent_mire_to_rune_puzzle` / `to_rune_puzzle` | `silent_mire` &rarr; `ancient_rune_puzzle` | (3390, 260) | (3340, 260) | `conn_rune_puzzle_to_silent_mire` | Quest: `Q04_ANCIENT_RUNES` | **LOCKED** (Gated) |
| `conn_rune_puzzle_to_silent_mire` / `to_silent_mire_from_puzzle` | `ancient_rune_puzzle` &rarr; `silent_mire` | (3300, 260) | (3420, 260) | `conn_silent_mire_to_rune_puzzle` | Rời gò đất cổ ngữ | **ACTIVE** |
| `conn_silent_mire_to_shrine` / `to_shrine` | `silent_mire` &rarr; `broken_bell_shrine` | (4050, 280) | (3940, 320) | `conn_shrine_to_silent_mire` | Flag: `mire_root_seal_broken`, Quest: `Q05_SOLVE_MIRE` | **LOCKED** (Gated) |
| `conn_shrine_to_silent_mire` / `to_silent_mire_from_shrine` | `broken_bell_shrine` &rarr; `silent_mire` | (3940, 320) | (4050, 280) | `conn_silent_mire_to_shrine` | Lối rời miếu chuông | **ACTIVE** |
| `to_whispering_clearing` | `deep_forest` &rarr; `sub_whispering_clearing` | (1840, -180) | (1840, -90) | `to_deep_forest_from_wc` | Quest: `Q03_PREPARE_RESOURCES` | **LOCKED** (Gated) |
| `to_deep_forest_from_wc` | `sub_whispering_clearing` &rarr; `deep_forest` | (1840, -80) | (1840, -220) | `to_whispering_clearing` | Lối về Rừng Sâu | **ACTIVE** |
| `to_crooked_path_from_wc` | `sub_whispering_clearing` &rarr; `crooked_path` | (1840, 60) | (1840, -80) | *(Không có — thiết kế vách đá)* | Lối rơi/nhảy một chiều xuống Đường Mòn | **INTENTIONALLY ONE-WAY** |
| `to_whispering_grove_sanctum` | `sub_whispering_clearing` &rarr; `whispering_grove_sanctum` | (1600, -420) | (1840, -310) | `to_whispering_clearing_from_wgs` | Quest: `Q04_ANCIENT_RUNES` | **LOCKED** (Gated) |
| `to_whispering_clearing_from_wgs` | `whispering_grove_sanctum` &rarr; `sub_whispering_clearing` | (1840, -310) | (1600, -420) | `to_whispering_grove_sanctum` | Rời thánh địa cổ thụ | **ACTIVE** |
| `to_abyssal_chasm` | `deep_forest` &rarr; `abyssal_chasm` | (2240, -700) | (2240, -570) | `to_deep_forest_from_ac` | Flag: `abyssal_gate_unlocked` | **LOCKED** (Gated) |
| `to_deep_forest_from_ac` | `abyssal_chasm` &rarr; `deep_forest` | (2240, -600) | (2240, -700) | `to_abyssal_chasm` | Rời Vực Sâu về Rừng Sâu | **ACTIVE** |
| `to_drowned_mire_depths` | `silent_mire` &rarr; `drowned_mire_depths` | (3380, 780) | (3380, 700) | `to_silent_mire_from_dmd` | Flag: `mire_drained` | **LOCKED** (Gated) |
| `to_silent_mire_from_dmd` | `drowned_mire_depths` &rarr; `silent_mire` | (3380, 700) | (3380, 780) | `to_drowned_mire_depths` | Lối thoát Vùng Trũng Đầm Lầy | **ACTIVE** |
| `to_outer_woods_via_shortcut` | `silent_mire` &rarr; `outer_woods` | (1540, 700) | (2920, 420) | `to_silent_mire_via_shortcut` | Lối tắt khai mở sau khi giải đố | **ACTIVE** |
| `to_silent_mire_via_shortcut` | `outer_woods` &rarr; `silent_mire` | (2920, 420) | (1530, 680) | `to_outer_woods_via_shortcut` | Lối tắt hai chiều | **ACTIVE** |
| `to_sunken_crypt_ruins` | `ancient_rune_puzzle` &rarr; `sunken_crypt_ruins` | (3600, -100) | (3520, 180) | `to_rune_puzzle_from_scr` | Flag: `clapper_collected` | **LOCKED** (Gated) |
| `to_rune_puzzle_from_scr` | `sunken_crypt_ruins` &rarr; `ancient_rune_puzzle` | (3520, 180) | (3600, -100) | `to_sunken_crypt_ruins` | Rời Hầm Mộ Chìm | **ACTIVE** |
| `to_veil_origin_cavern` | `sub_root_cellar` &rarr; `veil_origin_cavern` | (800, 1500) | (800, 1400) | `to_root_cellar_from_voc` | Flag: `knight_commander_defeated` | **LOCKED** (Gated) |
| `to_root_cellar_from_voc` | `veil_origin_cavern` &rarr; `sub_root_cellar` | (800, 1400) | (800, 1500) | `to_veil_origin_cavern` | Rời Hang Cội Nguồn | **ACTIVE** |

---

## 3. KẾT QUẢ KIỂM THỬ PLAYWRIGHT RUNTIME (NOCLIP OFF)

Bộ kịch bản kiểm thử [scripts/test_hw_bug14_route_integrity.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug14_route_integrity.py) đã thực thi toàn diện 6 bài kiểm tra tương tác:

### Test 1: Các tuyến mở hai chiều vùng lõi (Walk & Return)
- **1.1 Fog Crossing <-> Bellhollow qua Cổng Tây:** Đi East tới (532, 235) chuyển `bellhollow`; đi West về (321, 235) chuyển `fog_crossing`. &rarr; **PASS**
- **1.2 Bellhollow <-> Sanctuary Farm qua Lối Nam:** Đi South tới (650, 597) chuyển `sanctuary_farm`; đi North về (650, 476) chuyển `bellhollow`. &rarr; **PASS**
- **1.3 Bellhollow <-> Outer Woods qua Lối Đông Nam:** Đi South tới (1210, 602) chuyển `outer_woods`; đi North về (1210, 515) chuyển `bellhollow`. &rarr; **PASS**
- **1.4 Sanctuary Farm <-> Outer Woods qua Lối Thông:** Đi East tới (1140, 750) chuyển `outer_woods`; đi West về (1080, 750) chuyển `sanctuary_farm`. &rarr; **PASS**

### Test 2: Chuyển tiếp tiểu khu Portal (Outer Woods <-> Bell Workshop)
- Bước vào trigger lối vào xưởng rèn chuông tại `(1360, 980)`.
- Kích hoạt chuyển tiếp Portal 2B: Player hạ cánh an toàn tại `(1360, 1131.2)` trong `sub_bell_workshop`.
- Bước ngược về lối thoát tại `(1360, 1040)`: Player trở lại an toàn tại `(1360, 944.6)` trong `outer_woods`.
- **Đánh giá:** 0 kẹt collider, hiệu ứng chuyển cảnh flash camera chuẩn xác. &rarr; **PASS**

### Test 3: Chu trình di chuyển liên tục nhiều phân khu (Sequential Multi-Zone Circuit)
- Di chuyển liên tục theo vòng: `fog_crossing` &rarr; `bellhollow` &rarr; `sanctuary_farm` &rarr; `outer_woods` &rarr; `bellhollow`.
- Toàn bộ chu trình không reload game scene:
  - 0 lần double-trigger.
  - Phân khu cập nhật chính xác từng chặng (`circuit_log` khớp 100%).
  - Nhạc nền và camera bounds duy trì trơn tru. &rarr; **PASS**

### Test 4: Dao động qua lại tại ranh giới (Boundary Edge Oscillation & Debounce)
- Nhân vật đứng tại ranh giới Bellhollow - Farm (`y = 555..565`), bước qua bước lại liên tiếp 3 chu kỳ (South &rarr; North &rarr; South &rarr; North &rarr; South &rarr; North).
- Cơ chế Debounce và Cooldown xử lý mượt mà:
  - 100% các lần bước xuống ghi nhận đúng `sanctuary_farm`.
  - 100% các lần bước lên ghi nhận đúng `bellhollow`.
  - 0 hiện tượng treo trạng thái hoặc bất đồng bộ. &rarr; **PASS**

### Test 5: Thực thi rào chắn cốt truyện (East Gate Locked Enforcement)
- Xuất phát đầu game khi Cổng Đông chưa mở (`east_gate_unlocked = false`).
- Nhân vật đi về phía Cổng Đông từ `x = 1450` tới `x = 1468` tại `y = 280`.
- Rào chắn hoạt động chuẩn xác:
  - Nhân vật bị chặn lại tại `(1468, 280)` không thể lọt qua `crooked_path`.
  - Giữ nguyên trạng thái phân khu `bellhollow`.
  - Không gây đóng băng nhân vật, không input locked vô cớ. &rarr; **PASS**

### Test 6: Lưu game tại Phân khu B rồi Continue
- Đặt nhân vật sâu trong `sanctuary_farm` tại `(650, 620)`.
- Thực hiện lưu game thủ công `handleSaveManual()`.
- Nạp lại trò chơi qua `handleLoadCheckpoint()`.
- Tọa độ sau nạp: `(650, 620)`, phân khu `sanctuary_farm`, camera follow target được bảo toàn 100%. &rarr; **PASS**

---

## 4. BẰNG CHỨNG HÌNH ẢNH (VISUAL ARTIFACTS)

Các ảnh chụp màn hình kiểm định tự động được lưu tại thư mục [Read/V1.5/Reports/Visuals/](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/):

1. **Test 1 — Core Bidirectional Routes:**
   ![Core Routes](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug14_test1_core_routes.png)

2. **Test 2 — Workshop Subzone Portal:**
   ![Workshop Portal](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug14_test2_workshop_portal.png)

3. **Test 3 — Sequential Circuit:**
   ![Circuit Test](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug14_test3_circuit.png)

4. **Test 4 — Boundary Oscillation:**
   ![Oscillation Test](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug14_test4_oscillation.png)

5. **Test 5 — Gated East Gate:**
   ![Gated East Gate](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug14_test5_gated_east_gate.png)

6. **Test 6 — Save Continue Zone B:**
   ![Save Continue Zone B](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug14_test6_save_continue.png)

---

## 5. DỮ LIỆU TELEMETRY & CHỈ SỐ KỸ THUẬT

Dữ liệu JSON thu thập lưu tại [Read/V1.5/Reports/HW_BUG_14_ROUTES_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_14_ROUTES_DATA.json):
- **Tổng số lỗi Console:** 0.
- **Tổng số lỗi Trang (Page Errors):** 0.
- **Tỷ lệ tuyến đường hợp lệ:** 100% (41/41 transitions trong zones.json đều có tọa độ spawn nằm trong bounds và không kẹt collider).
- **Tuyến một chiều hợp lệ:** 1 tuyến duy nhất theo thiết kế (`to_crooked_path_from_wc` từ Whispering Clearing xuống Crooked Path).
- **Số tuyến hỏng (BROKEN):** 0.

---

## 6. KIỂM DUYỆT BIÊN DỊCH VÀ ĐÓNG GÓI

- **Kiểm tra kiểu dữ liệu TypeScript:** `npx tsc --noEmit` &rarr; **EXIT 0** (0 errors).
- **Kiểm tra đóng gói bản dựng Production:** `npm run build` &rarr; **EXIT 0** (Vite build thành công trong 13.61s).
- **Kiểm tra tính an toàn Git:**
  - 3 tệp âm thanh ngoại lệ (`AUDIO_SOURCES_MANIFEST.csv`, `AUDIO_SOURCES_MANIFEST.json`, `generate_audio_sources_manifest.mjs`) giữ nguyên untracked.
  - Không sửa đổi mã nguồn game khi không có lỗi phát sinh.

---

## 7. KẾT LUẬN & CAM KẾT VẬN HÀNH

- **Kết luận:** **`VERIFIED-NO-CHANGE`** (DOC-ONLY commit).
- Mạng lưới chuyển vùng, rào chắn cốt truyện và cơ chế Safe Spawn của HOLLOW WOODS V1.5.3 hoàn toàn toàn vẹn và ổn định.
- Không tự ý sửa mã nguồn ngoài phạm vi; không tự ý triển khai nhiệm vụ tiếp theo; tuân thủ nghiêm ngặt HARD STOP.
