# BÁO CÁO KIỂM ĐỊNH HW-BUG-#13 — MAP CAMERA & ZONE BOUNDARY STABILITY

- **Dự án:** HOLLOW WOODS V1.5.3 (PREP V1.5.4)
- **Nhánh:** `feat/v1.5.3-ag-world-polish`
- **Tác vụ:** HW-BUG-#13 — Đánh giá độ ổn định của camera bản đồ và phân định ranh giới phân khu
- **Phương pháp:** Chromium Headless (Playwright Automation, Noclip OFF, không dùng QA Teleport)
- **Kết luận:** **`VERIFIED-NO-CHANGE`** (Hệ thống Camera và phân vùng Starter Zone hoạt động hoàn hảo, đạt 100% tiêu chí kiểm định, 0 lỗi runtime, giữ nguyên mã nguồn).

---

## 1. TỔNG QUAN HỆ THỐNG ĐIỀU KHIỂN CAMERA & RANH GIỚI

Qua khảo sát và đối chiếu cấu trúc runtime giữa `src/systems/camera/CameraSystem.ts`, `src/scenes/GameScene.ts`, `src/world/WorldBuilder.ts` và `src/data/zones.json`:

1. **Khung nhìn liên tục (Continuous World Bounds):**
   - Các phân khu liền kề thuộc cụm Starter (`fog_crossing`, `bellhollow`, `sanctuary_farm`, `outer_woods`) được cấu hình camera bounds đồng nhất `{ x: 0, y: 0, width: 1600, height: 1040 }` thông qua `applyCameraBoundsForZone()`.
   - Cơ chế này loại bỏ hoàn toàn hiện tượng camera bị giật (snap), nảy khung (jitter) hay hở mép nền thế giới (letterbox/void gaps) khi người chơi bước qua đường phân ranh giữa các phân khu mở liền kề.

2. **Tham số bám theo mượt mà (Smooth Follow & Deadzone):**
   - Zoom chuẩn: `DEFAULT_WORLD_ZOOM = 2.2`.
   - Bám theo mục tiêu: `startFollow(target, true, 0.1, 0.1)`.
   - Vùng chết camera (Deadzone): `setDeadzone(32, 24)` ngăn các dao động vi mô của nhân vật gây rung lắc khung nhìn.
   - Góc xoay (Rotation): Cố định `cam.rotation = 0` trên toàn bộ chu trình di chuyển.

3. **Thuật toán nhận diện phân khu (Zone Area Priority):**
   - Hàm `detectCurrentZone(footPos)` trong `WorldBuilder.ts` sắp xếp các zone theo diện tích tăng dần (`sortedZonesByArea`).
   - Đảm bảo khi nhân vật đứng tại vùng giao thoa (seam) hoặc rìa tiếp giáp, phân khu con hoặc phân khu cụ thể hơn luôn được ưu tiên, loại trừ triệt để tình trạng đảo zone qua lại liên tục (zone flip-flop).

---

## 2. KẾT QUẢ ĐO ĐẠC 6 KỊCH BẢN KIỂM THỬ (PLAYWRIGHT AUTOMATION)

Bộ kiểm thử tự động `scripts/test_hw_bug13_camera_stability.py` chạy trực tiếp trên bản dựng production (`dist`) với cấu hình Noclip = OFF, thu thập dữ liệu telemetry vào bộ nhớ và xuất file `Read/V1.5/Reports/HW_BUG_13_CAMERA_DATA.json`.

| STT | Kịch bản kiểm thử | Tọa độ xuất phát & lộ trình | Kết quả phân khu | Góc xoay / Zoom | Camera Bounds & Follow | Trạng thái |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: |
| **A** | **Fog Crossing <-> Bellhollow qua Cổng Tây** | Start: `(450, 235)` (Fog Crossing)<br>Walk East (KeyD): `(532.2, 235)` (Bellhollow)<br>Walk West (KeyA): `(321.1, 235)` (Fog Crossing) | `fog_crossing` &rarr; `bellhollow` &rarr; `fog_crossing` | Rotation = 0<br>Zoom = 2.20 | Bounds: `{0, 0, 1600, 1040}`<br>Follow: 100% duy trì | **PASS** |
| **B** | **Bellhollow <-> Sanctuary Farm qua lối Nam** | Start: `(650, 520)` (Bellhollow)<br>Walk South (KeyS): `(650, 597.2)` (Farm)<br>Walk North (KeyW): `(650, 476.8)` (Bellhollow) | `bellhollow` &rarr; `sanctuary_farm` &rarr; `bellhollow` | Rotation = 0<br>Zoom = 2.20 | Bounds: `{0, 0, 1600, 1040}`<br>Follow: 100% duy trì | **PASS** |
| **C** | **Bellhollow <-> Outer Woods qua lối Đông Nam** | Start: `(1210, 520)` (Bellhollow)<br>Walk South (KeyS): `(1210, 602.2)` (Outer Woods)<br>Walk North (KeyW): `(1210, 515.8)` (Bellhollow) | `bellhollow` &rarr; `outer_woods` &rarr; `bellhollow` | Rotation = 0<br>Zoom = 2.20 | Bounds: `{0, 0, 1600, 1040}`<br>Follow: 100% duy trì | **PASS** |
| **D1** | **Đi dọc ranh giới Fog Crossing (x=465)** | Walk dọc x=465, y=190 &rarr; 250 (song song trục ranh giới x=480) | 100% giữ nguyên `fog_crossing` (0 lần chạm Bellhollow) | Rotation = 0<br>Zoom = 2.20 | Bounds: `{0, 0, 1600, 1040}`<br>Follow: 100% duy trì | **PASS** |
| **D2** | **Đi dọc ranh giới Bellhollow (y=535)** | Walk dọc y=535, x=580 &rarr; 680 (song song trục ranh giới y=560) | 100% giữ nguyên `bellhollow` (0 lần chạm Farm) | Rotation = 0<br>Zoom = 2.20 | Bounds: `{0, 0, 1600, 1040}`<br>Follow: 100% duy trì | **PASS** |
| **E1** | **Đứng tại ranh Cổng Tây (x=480, y=220) trong 2.5s** | Đứng yên 2500ms tại vị trí phân định x=480, y=220 (25 mẫu đo) | 100% giữ nguyên `bellhollow` (0 lần flip-flop) | Rotation = 0<br>Zoom = 2.20 | Scroll & Zoom tĩnh, không rung lắc | **PASS** |
| **E2** | **Đứng tại ranh Farm (x=650, y=560) trong 2.5s** | Đứng yên 2500ms tại vị trí phân định x=650, y=560 (25 mẫu đo) | 100% giữ nguyên `sanctuary_farm` (0 lần flip-flop) | Rotation = 0<br>Zoom = 2.20 | Scroll & Zoom tĩnh, không rung lắc | **PASS** |
| **F** | **Save / Continue sát ranh giới (x=475, y=220)** | Lưu tại `(475, 220)` (`fog_crossing`). Thực hiện `handleLoadCheckpoint()` | Tọa độ nạp lại: `(475, 220)`<br>Zone: `fog_crossing` | Rotation = 0<br>Zoom = 2.20 | Bounds: `{0, 0, 1600, 1040}`<br>Follow: 100% bám nhân vật | **PASS** |

---

## 3. BẰNG CHỨNG HÌNH ẢNH (VISUAL ARTIFACTS)

Tất cả ảnh chụp màn hình được thu thập tự động trong quá trình Playwright kiểm thử thực tế và lưu tại thư mục `Read/V1.5/Reports/Visuals/`:

1. **Lộ trình A (Fog Crossing <-> Bellhollow qua Cổng Tây):**
   ![Route A - Fog to Bellhollow](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug13_route_a_fog_bellhollow.png)

2. **Lộ trình B (Bellhollow <-> Sanctuary Farm qua lối Nam):**
   ![Route B - Bellhollow to Farm](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug13_route_b_bellhollow_farm.png)

3. **Lộ trình C (Bellhollow <-> Outer Woods qua lối Đông Nam):**
   ![Route C - Bellhollow to Outer Woods](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug13_route_c_bellhollow_outerwoods.png)

4. **Kịch bản D (Đi dọc ranh giới không bước qua):**
   ![Case D - Boundary Parallel Walk](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug13_case_d_boundary_walk.png)

5. **Kịch bản E (Đứng yên tại đường nối ranh giới 2.5s):**
   ![Case E - Seam Standing](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug13_case_e_seam_standing.png)

6. **Kịch bản F (Save / Continue sát ranh giới):**
   ![Case F - Save Continue Seam](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/hw_bug13_case_f_save_continue.png)

---

## 4. CHI TIẾT ĐO ĐẠC TELEMETRY

- **Tổng số mẫu đo lường telemetry thu thập:** 127 mẫu.
- **Tỷ lệ khung hình duy trì camera follow:** 100% (127/127 mẫu `hasFollowTarget === true`).
- **Tỷ lệ ổn định góc xoay:** 100% (127/127 mẫu `cam.rotation === 0.0`).
- **Hiện tượng giật bounds:** 0 lần (Bounds toàn bộ Starter Zone giữ nguyên `1600×1040`).
- **Hiện tượng đảo zone bất thường (Flip-flop):** 0 lần.
- **Lỗi JavaScript Console / Page Errors:** 0 lỗi (`pageErrors: []`, `consoleErrors: []`).
- **File số liệu đính kèm:** [`Read/V1.5/Reports/HW_BUG_13_CAMERA_DATA.json`](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_13_CAMERA_DATA.json).

---

## 5. KIỂM DUYỆT BIÊN DỊCH VÀ ĐÓNG GÓI

- **Kiểm tra kiểu dữ liệu TypeScript:**
  `npx tsc --noEmit` &rarr; **EXIT 0** (Clean, 0 errors).
- **Kiểm tra đóng gói bản dựng Production:**
  `npm run build` &rarr; **EXIT 0** (Vite build thành công trong 14.25s, chunks `game-data`, `index`, `vendor-phaser` sẵn sàng).
- **Kiểm tra an toàn Git:**
  - 3 tệp âm thanh ngoại lệ (`AUDIO_SOURCES_MANIFEST.csv`, `AUDIO_SOURCES_MANIFEST.json`, `generate_audio_sources_manifest.mjs`) giữ nguyên untracked.
  - Không sửa đổi mã nguồn game khi không có lỗi tái hiện.

---

## 6. KẾT LUẬN & CAM KẾT VẬN HÀNH

- **Kết luận:** **`VERIFIED-NO-CHANGE`** (DOC-ONLY commit).
- Toàn bộ 6 kịch bản kiểm thử ổn định camera và ranh giới phân khu đạt chuẩn 100%.
- Không tự ý sửa mã nguồn ngoài phạm vi; không tự ý triển khai nhiệm vụ tiếp theo; tuân thủ nghiêm ngặt HARD STOP.
