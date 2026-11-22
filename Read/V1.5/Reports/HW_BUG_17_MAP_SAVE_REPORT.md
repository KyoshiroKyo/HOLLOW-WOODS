# BÁO CÁO KIỂM ĐỊNH HW-BUG-#17 — WORLD STATE, SAVE/CONTINUE & MAP SYNCHRONIZATION

- **Dự án:** HOLLOW WOODS V1.5.3 (PREP V1.5.4)
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Tác vụ:** HW-BUG-#17 — Kiểm định và đồng bộ hóa Chuỗi Trạng thái Thế giới, Lưu/Tiếp tục (Save/Continue) và Bản đồ Thế giới Giấy Da (World Map Synchronization)
- **Phương thức:** Chromium Headless (Playwright Automation, SwiftShader WebGL, Telemetry đo đạc trực tiếp trên runtime production)
- **Kết luận:** **`FIXED & VERIFIED`** (Phát hiện và xử lý triệt để 01 lỗi gốc trong đồng bộ vòng đời phân khu khi Restart, kiểm chứng đạt chuẩn 8/8 bài test độc lập với 0 lỗi console, 0 lỗi page, 0 asset 404).

---

## 1. MA TRẬN ĐỐI CHIẾU THỰC NGHIỆM ĐỒNG BỘ SAVE/CONTINUE & MAP

| STT | Bài kiểm định (Test Case) | Điều kiện kiểm thử | Kết quả thực tế đo đạc | Đánh giá đồng bộ | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **New Game & Save tại Fog Crossing** | Xuất phát New Game tại Lối Mòn Xuyên Sương $\to$ Lưu thủ công $\to$ Continue | `zone=fog_crossing`, `playerPos=(120, 195)`, Camera bounds: `(0, 0, 1600, 1040)` | Phục hồi chính xác vị trí ban đầu và biên camera | **PASS** |
| **2** | **Di chuyển Bellhollow $\to$ Save/Continue** | Sang Bellhollow tại $(800, 260) \to$ Lưu thủ công $\to$ Nạp lại Checkpoint | `zone=bellhollow`, `playerPos=(800, 260)`, `hasVisitedBellhollow=true` | Bảo lưu phân khu làng và tọa độ điểm đứng | **PASS** |
| **3** | **Di chuyển Sanctuary Farm $\to$ Save/Continue** | Sang Nông Trại Trú Ẩn $(650, 700) \to$ Lưu $\to$ Nạp lại Checkpoint | `zone=sanctuary_farm`, `playerPos=(650, 700)`, `hasVisitedFarm=true` | Phục hồi phân khu nông trại và đánh dấu đã ghé thăm | **PASS** |
| **4** | **Đồng bộ World Map trước & sau Save** | Mở Bản đồ Giấy Da tại Farm trước và sau Save/Continue | `activeZone=sanctuary_farm`, beacon tại `(563, 401)`, `discoveredCount=3` | Con trỏ `📍 BẠN ĐANG Ở ĐÂY` đặt chuẩn đỉnh node Nông Trại | **PASS** |
| **5** | **Bảo tồn Tiến trình & Mở khóa Cổng** | Đặt cờ `entered_sanctuary_farm`, `farm_cleared`, ghé thăm `outer_woods` | Cờ và danh sách vùng mở khóa được khôi phục nguyên vẹn 100% | Cơ chế tuần tự hóa Save schema 3 toàn vẹn | **PASS** |
| **6** | **Chơi lại (Restart) sau khi khám phá** | Khám phá nhiều vùng $\to$ gọi `handleRestartGame()` | `zone=fog_crossing`, `playerPos=(120, 195)`, `visited=['fog_crossing', 'bellhollow']`, cờ reset | Reset hoàn toàn về điểm khởi đầu, không kẹt vùng cũ | **PASS** |
| **7** | **Đóng/Mở liên tục World Map sau Continue** | Bật/tắt `ParchmentWorldMapModal` 5 chu kỳ liên tiếp | `finalIsOpen=false`, `pulseTween` giải phóng sạch sẽ, không rò rỉ tween | Quản lý vòng đời tween và container chuẩn xác | **PASS** |
| **8** | **Cập nhật động Mục tiêu Nhiệm vụ trên Map** | Đổi quest từ Q02 sang Q03 $\to$ gọi `refreshTrackedQuest()` | Subtitle và nhãn `🎯 MỤC TIÊU KẾ TIẾP` đổi động tương ứng mục tiêu mới | World Map phản ánh chính xác mục tiêu nhiệm vụ | **PASS** |

---

## 2. NGUYÊN NHÂN GỐC & BIỆN PHÁP KHẮC PHỤC (ROOT CAUSE & FIX)

### Nguyên nhân gốc (Root Cause):
Trong [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L240-L248):
- Khi người chơi chọn `Chơi Lại (Restart)` qua `handleRestartGame()` sau khi đã phiêu lưu qua nhiều vùng (như Bellhollow, Sanctuary Farm), phương thức `scene.restart({ isContinue: false })` kích hoạt lại vòng đời Phaser Scene.
- Tuy nhiên, trong `init(data)` và nhánh `!this.isContinueMode` của `create()`, thuộc tính `this.currentZoneId` và `this.previousZoneId` của thể hiện Scene trước đó không được đặt lại về `'fog_crossing'`.
- Hệ quả là khi khởi tạo nhân vật tại vị trí mới `(120, 195)`, hàm `clampPlayerToZoneBounds()` lại áp dụng hình hộp bao (bounding box) của phân khu cũ (`sanctuary_farm`, giới hạn `minX = 472, minY = 550`), ép nhân vật văng tới tọa độ `(472, 550)` và khiến `PlayerState` nhận diện sai phân khu hiện tại.

### Giải pháp kỹ thuật (Implementation Fix):
1. **Khởi tạo sạch trong `init()`:** Trong [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L248-L249), khi `!isContinueMode`, gán tường minh `this.currentZoneId = 'fog_crossing'` và `this.previousZoneId = 'fog_crossing'`.
2. **Đồng bộ hóa phân khu xuất phát trong `create()`:** Tại nhánh `else` (New Game / Restart), cập nhật đồng bộ 4 thành phần cốt lõi:
   ```typescript
   this.currentZoneId = initialZone.id;
   this.previousZoneId = initialZone.id;
   this.playerState.setCurrentZone(initialZone.id);
   this.worldBuilder.setActiveZone(initialZone.id);
   ```
   Điều này đảm bảo mọi trạng thái Scene, State và WorldBuilder đều hoàn toàn hội tụ về `'fog_crossing'`.

---

## 3. CHI TIẾT THỰC THI 8 BÀI KIỂM THỬ (DETAILED TEST EXECUTION)

Dữ liệu đo đạc chi tiết được lưu trữ tại [Read/V1.5/Reports/HW_BUG_17_SAVE_DATA.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_BUG_17_SAVE_DATA.json):

### TEST 1 — New Game $\to$ Save tại Fog Crossing $\to$ Continue
- **Tọa độ trước lưu:** `posX = 120, posY = 195`, phân khu `fog_crossing`.
- **Tọa độ sau Continue:** `posX = 120, posY = 195`, phân khu `fog_crossing`.
- **Camera Bounds:** `x = 0, y = 0, width = 1600, height = 1040`.
- **Kết quả:** Đồng bộ 100% giữa tọa độ lưu và điểm phục hồi nhân vật.

### TEST 2 — Di chuyển tới Bellhollow $\to$ Save $\to$ Reload/Continue
- **Vị trí lưu:** Làng Bellhollow `(800, 260)`.
- **Sau khi nạp checkpoint:** Nhân vật xuất hiện chuẩn xác tại `(800, 260)`.
- **Trạng thái khám phá:** `playerState.hasVisitedZone('bellhollow') == true`.

### TEST 3 — Di chuyển tới Sanctuary Farm $\to$ Save $\to$ Reload/Continue
- **Vị trí lưu:** Nông Trại Trú Ẩn `(650, 700)`.
- **Sau khi nạp checkpoint:** Nhân vật xuất hiện tại `(650, 700)`.
- **Trạng thái khám phá:** `playerState.hasVisitedZone('sanctuary_farm') == true`.

### TEST 4 — World Map Modal Verification (Before & After Save)
- **Trước khi lưu:**
  - `activeZone`: `sanctuary_farm`.
  - Node tương ứng: `id = 'sanctuary_farm'`, tọa độ hiển thị `canvasX = 495, canvasY = 415`.
  - Vị trí con trỏ `📍 BẠN ĐANG Ở ĐÂY`: `x = 563, y = 401` (ngay trên đỉnh node tại `canvasX + width/2, canvasY - 14`).
  - Số khu vực đã khám phá: `3/10`.
- **Sau khi lưu và nạp lại:** Toàn bộ thông số tọa độ beacon, activeZone và số lượng vùng khám phá khớp $100\%$ so với trước khi lưu.
- **Minh chứng trực quan:**
  ![World Map tại Sanctuary Farm](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW_BUG_17/hw_bug17_world_map_farm.png)

### TEST 5 — Quest Progression & Zone Gating Unlock $\to$ Save/Continue
- **Dữ liệu giả lập tiến trình:** Cờ `entered_sanctuary_farm`, `farm_cleared`, mở khóa và ghé thăm `outer_woods`.
- **Kiểm định sau khi nạp điểm lưu:**
  - `farmEnteredPreserved`: `true`.
  - `outerWoodsVisitedPreserved`: `true`.
  - Danh sách `visitedZones`: `['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']`.
  - Danh sách `unlockedZones`: `['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']`.

### TEST 6 — Restart sau khi khám phá nhiều vùng
- **Hành vi sau khi gọi `handleRestartGame()`:**
  - Phân khu GameScene: `fog_crossing` (**ĐÃ FIX**).
  - Phân khu PlayerState: `fog_crossing`.
  - Vị trí xuất phát nhân vật: `posX = 120, posY = 195` (**ĐÃ FIX**, không còn bị kẹt tại `472, 550`).
  - Danh sách vùng ghé thăm: Đặt lại về mặc định ban đầu `['fog_crossing', 'bellhollow']`.
  - Tổng số cờ tiến trình: `0`.
  - Trạng thái modal bản đồ: Đóng hoàn toàn (`isOpen = false`).

### TEST 7 — Đóng/Mở World Map liên tục sau Continue
- Thực hiện 5 chu kỳ đóng/mở nhanh `open()` và `close()` trên `ParchmentWorldMapModal`.
- Kết quả: `finalIsOpen = false`, `pulseTween` được dừng và dọn dẹp triệt để (`finalTweenCleaned = true`), không phát sinh lỗi đồ họa hay rò rỉ bộ nhớ.

### TEST 8 — Cập nhật động Mục tiêu Nhiệm vụ trên World Map
- Chuyển tracked quest sang `Q02_MEET_NERIS` (Gặp Neris tại Làng Bellhollow) $\to$ Bản đồ hiển thị tiêu đề `🎯 HỒI 1: THUỐC CỨU SINH MẠNG • Làng Chuông Cổ` cùng huy hiệu `🎯 MỤC TIÊU KẾ TIẾP`.
- Chuyển tracked quest sang `Q03_PREPARE_RESOURCES` (Chuẩn bị vật tư) và gọi `refreshTrackedQuest()` $\to$ Bản đồ cập nhật mượt mà sang `🎯 HỒI 2: CHUẨN BỊ VÀO RỪNG CẤM • Làng Chuông Cổ` cùng huy hiệu mục tiêu kế tiếp mà không cần khởi tạo lại modal.

---

## 4. TỔNG KẾT & TUÂN THỦ NGUYÊN TẮC AN TOÀN

1. **Bảo tồn Schema & File Lưu Thật:**
   - Hoàn toàn giữ nguyên `SaveSchema` phiên bản 3.
   - Quá trình kiểm thử tự động sử dụng phân vùng QA `hollow_woods_qa_v1_savegame`, không tác động hoặc ghi đè file lưu thật của người chơi (`hollow_woods_v1_savegame`).
2. **Không vi phạm file ngoại lệ:**
   - 3 file âm thanh ngoại lệ (`scripts/AUDIO_SOURCES_MANIFEST.csv`, `scripts/AUDIO_SOURCES_MANIFEST.json`, `scripts/generate_audio_sources_manifest.mjs`) được giữ nguyên trạng thái untracked, không bị can thiệp.
3. **Phạm vi sửa đổi tối thiểu:**
   - Chỉ chỉnh sửa 01 file duy nhất: [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L245-L250) với tổng cộng 7 dòng thay đổi, tập trung chính xác vào đồng bộ vòng đời Scene.
