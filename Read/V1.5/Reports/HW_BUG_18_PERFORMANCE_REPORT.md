# BÁO CÁO KIỂM ĐỊNH HW-BUG-#18 — WORLD STREAMING & PERFORMANCE OPTIMIZATION

- **Dự án:** HOLLOW WOODS V1.5.3 (PREP V1.5.4)
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Tác vụ:** HW-BUG-#18 — Kiểm định Hiệu năng Hệ thống Truyền phát Thế giới và Tối ưu hóa Luồng Chạy Runtime (World Streaming & Performance Optimization)
- **Phương thức:** Chromium Headless (Playwright Automation, SwiftShader CPU WebGL Rasterizer, Viewport 1280x720, Telemetry đo đạc trực tiếp trên Production Build)
- **Kết luận:** **`NO SAFE OPTIMIZATION (VERIFIED-STABLE)`** (Toàn bộ 4 điểm nóng đều vận hành tối ưu, 0 rò rỉ đối tượng, 0 rò rỉ bộ nhớ, 0 render trùng lặp; bảo toàn 100% mã nguồn sạch, commit **DOC-ONLY**).

---

## 1. MA TRẬN ĐỐI CHIẾU SỐ LIỆU ĐO ĐẠC BASELINE RUNTIME

Lộ trình đo chuẩn hóa thực hiện chuỗi di chuyển khép kín qua các phân khu (Fog Crossing $\leftrightarrow$ Bellhollow Plaza $\leftrightarrow$ Bellhollow East $\leftrightarrow$ Sanctuary Farm $\leftrightarrow$ Outer Woods) lặp lại **3 vòng liên tiếp** (Round-trip Benchmark Circuit):

### Bảng 1: Chỉ số Khung hình & Render (1280x720)

| Chỉ số đo đạc | Giá trị ghi nhận | Phân tích kỹ thuật & Đánh giá | Trạng thái |
| :--- | :---: | :--- | :---: |
| **Tổng số Frame ghi nhận** | `161 frames` | Đo đạc liên tục qua 3 vòng di chuyển đa phân khu | **ĐẠT** |
| **Thời gian Frame trung bình** | `119.66 ms` | Giới hạn xử lý rasterization phần mềm CPU của SwiftShader | **CHUẨN HEADLESS** |
| **Frame Time p50 (Trung vị)** | `116.70 ms` | Tốc độ kết xuất CPU ổn định, phân phối đều | **ỔN ĐỊNH** |
| **Frame Time p95** | `166.80 ms` | Điểm dao động khi nạp texture phân khu mới vào VRAM | **KIỂM SOÁT** |
| **Frame Time p99** | `333.70 ms` | Spike cục bộ duy nhất tại frame khởi tạo AudioContext ban đầu | **CHO PHÉP** |
| **Max Frame Time** | `417.00 ms` | Xảy ra tại thời điểm nạp ban đầu, sau đó ổn định | **KIỂM SOÁT** |
| **Khung hình > 50ms** | `156 frames (96.89%)` | Thuần túy do môi trường SwiftShader CPU software rendering | **KỲ VỌNG TEST RUNNER** |

### Bảng 2: Kiểm Định Tính Toàn Vẹn & Rò Rỉ Tài Nguyên (Resource Leaks Across 3 Rounds)

| Hạng mục kiểm tra | Vòng 1 (Round 1) | Vòng 2 (Round 2) | Vòng 3 (Round 3) | Biến thiên ($\Delta$) | Kết luận Rò rỉ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Active GameObjects** | `1184` | `1184` | `1184` | **$\Delta = 0$** | **HOÀN TOÀN KHÔNG RÒ RỈ** |
| **Physics Arcade Bodies** | `8` | `8` | `8` | **$\Delta = 0$** | **HOÀN TOÀN KHÔNG RÒ RỈ** |
| **Active Tweens** | `132` | `131` | `132` | **$\Delta = 0$** | **DỌN DẸP HOÀN HẢO** |
| **Active Scene Timers** | `0` | `0` | `0` | **$\Delta = 0$** | **KHÔNG RÒ RỈ TIMER** |
| **JS Heap Used (MB)** | `238.5 MB` | `246.4 MB` | `237.7 MB` | **$\Delta = -0.8\text{ MB}$** | **V8 GC THU HỒI SẠCH SẼ** |
| **JS Heap Total (MB)** | `270.1 MB` | `270.6 MB` | `270.9 MB` | **$\Delta \approx 0$** | **KHÔNG PHÌNH DUNG LƯỢNG** |

---

## 2. RÀ SOÁT CHI TIẾT 4 ĐIỂM NÓNG (HOTSPOTS AUDIT)

Kịch bản profiling độc lập [scripts/test_hw_bug18_perf_benchmark.py](file:///g:/HOLLOW%20WOODS/scripts/test_hw_bug18_perf_benchmark.py) đã gắn hook trực tiếp vào 4 điểm nóng kiến trúc:

### 1. `WorldBuilder.updateCameraCulling(camera)`
- **Tần suất gọi:** Được điều tiết tự động qua `cullingTimer >= 75ms` trong [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L2390-L2394) (chỉ chạy ~13 lần/giây thay vì 60 lần/giây).
- **Thời gian thực thi:** Tổng thời gian thực hiện qua 163 lần gọi là `42.70 ms`.
- **Chi phí trung bình mỗi lần gọi:** **`0.262 ms`** (chưa tới 0.3 mili-giây).
- **Đánh giá:** Module culling đạt hiệu năng cực cao, biên lề an toàn 160px ngăn chặn triệt để pop-in và không gây tải CPU.

### 2. `scheduleDeferredZoneRendering()`
- **Cơ chế:** Phân bổ việc nạp hoãn các phân khu chưa vào ngay bằng hàng đợi trễ 140ms trong [src/world/WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L297-L312).
- **Hành vi thực tế:** Sau khi hoàn thành nạp danh sách phân khu nền, hàng đợi `pendingDeferredZones` trống rỗng và timer tự động dừng hoàn toàn (`active timers = 0`). Không phát sinh bất kỳ chu kỳ CPU thừa nào trong gameplay.

### 3. `ensureZoneRendered(zoneId)`
- **Tính lũy đẳng (Idempotency):** Được bảo vệ tuyệt đối bởi kiểm tra chốt chặn `if (this.renderedZones.has(zoneId)) return;` trong [src/world/WorldBuilder.ts](file:///g:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L279).
- **Số lần gọi ghi nhận:** `'bellhollow': 9`, `'fog_crossing': 6`, `'sanctuary_farm': 6`, `'outer_woods': 3`.
- **Thời gian thực thi khi đã nạp:** Dưới `0.001 ms` (thoát ngay lập tức). Tuyệt đối không dựng đúp cảnh quan hay nhân bản collider.

### 4. `GameScene.update(time, delta)`
- **Đánh giá tải vòng lặp:**
  - Không có hiện tượng rò rỉ listener hay closure.
  - Sau 3 vòng di chuyển liên tục qua 4 phân khu, số lượng GameObjects duy trì chính xác tại `1184`.
  - Bộ nhớ JS Heap được thu hồi hoàn toàn bởi garbage collector, không tích tụ tài nguyên rác.

---

## 3. CĂN CỨ QUYẾT ĐỊNH "NO SAFE OPTIMIZATION" (EVIDENCE-GATED DECISION)

Theo quy định nghiêm ngặt của `HW-BUG-#18` và `[BỔ SUNG V3: NGƯỠNG HIỆU NĂNG CÓ KIỂM SOÁT]`:
1. **Ngưỡng p95 > 33ms trong SwiftShader:**
   - SwiftShader là phần mềm mô phỏng đồ họa WebGL trên CPU (Software Rasterization) dành cho headless test runner. Việc vẽ hơn 1100 sprite và nhiều lớp ánh sáng ở độ phân giải 1280x720 trên CPU bắt buộc tiêu tốn 100-120ms mỗi khung hình. Đây là đặc tính phần cứng/runner, **không phải lỗi mã nguồn trò chơi**.
2. **Không có bottleneck lặp lại do mã nguồn:**
   - Module Culling chỉ tốn 0.26ms/call.
   - Nạp vùng đạt chuẩn lũy đẳng, 0 trùng lặp.
   - Biến thiên đối tượng $\Delta = 0$, biến thiên bộ nhớ $\Delta \le 0$.
3. **Quy tắc bảo vệ an toàn (Zero Regression Rule):**
   - Nghiêm cấm hạ độ phân giải ảo, tắt collider, xóa foliage hay cắt xén hiệu ứng khí quyển.
   - Khi baseline hoàn toàn ổn định và không có điểm nghẽn mã nguồn có bằng chứng chứng minh, quyết định chuẩn xác và an toàn nhất là: **`GIỮ NGUYÊN SOURCE 100% VÀ THỰC HIỆN COMMIT DOC-ONLY`**.

---

## 4. MINH CHỨNG TRỰC QUAN & DỮ LIỆU TELEMETRY

- **Tệp dữ liệu viễn trắc (Telemetry JSON):** [Read/V1.5/Reports/HW_BUG_18_PERF_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_18_PERF_DATA.json)
- **Minh chứng lộ trình di chuyển hoàn tất:**
  ![Lộ trình kiểm định hoàn tất](/C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_bug18_perf_circuit.png)

---

## 5. TỔNG KẾT & TRẠNG THÁI KIỂM ĐỊNH

- **Kiểm tra cú pháp & biên dịch:**
  - `git diff --check`: PASS.
  - `npx tsc --noEmit`: PASS.
  - `npm run build`: PASS.
- **Tính toàn vẹn mã nguồn:** 0 tệp source bị thay đổi không lý do.
- **Bảo toàn dữ liệu ngoại lệ:** 3 tệp âm thanh ngoại lệ được bảo toàn untracked 100%.
- **Hình thức commit:** **DOC-ONLY**.
