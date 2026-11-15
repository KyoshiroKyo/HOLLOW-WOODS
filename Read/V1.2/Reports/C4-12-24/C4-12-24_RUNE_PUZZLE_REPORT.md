# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-24
## XÂY DỰNG KHÔNG GIAN MÔI TRƯỜNG VÀ TÍCH HỢP KHU VỰC CÂU ĐỐ CỔ NGỮ — ANCIENT RUNE PUZZLE AREA

- **Mã hiệu:** `COMMAND C4-12-24`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Phân khu Câu Đố Cổ Ngữ (`ancient_rune_puzzle`, Layer 3 — Forbidden, $x = 3350..3700, y = 150..430$).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 3 — Forbidden Regions).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 53/53 TESTS C4-12-24, 78/78 REGRESSION C4-12-23, 0 COMPILER ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-24

Theo cấu trúc thế giới V1.2, **Ancient Rune Puzzle Area (Khu Vực Câu Đố Cổ Ngữ)** là tâm điểm huyền bí và cốt lõi gameplay của **Tầng 3 — Forbidden Regions**, tọa lạc trên một gò đất đá nổi cao ráo giữa trung tâm Đầm Lầy Tĩnh Lặng (*Silent Mire*), tại tọa độ $x = 3350..3700, y = 150..430$. Đây là nơi trấn giữ phong ấn tối cổ ngăn cách thế giới phàm trần với Miếu Chuông Phế Tích (*The Broken Bell Shrine*).

Để giải trừ kết giới miếu chuông, người chơi phải giải mã trận địa **Ba Cột Đá Tiếng Vọng** (*The Echoing Runestones*):
1. **Cột Đá Trăng Khuyết (Pillar of the Crescent Moon):** Tọa độ $(3400, 220)$ ở góc Tây Bắc, mang sắc lam thiên thanh huyền bí (`#5dade2`).
2. **Cột Đá Rễ Rừng (Pillar of the Forest Roots):** Tọa độ $(3520, 360)$ ở phía Nam, mang sắc xanh lục bảo rực rỡ (`#58d68d`).
3. **Cột Đá Con Mắt (Pillar of the Ancient Eye):** Tọa độ $(3640, 220)$ ở góc Đông Bắc, mang sắc tím thạch anh ma mị (`#af7ac5`).

Command **C4-12-24** tập trung hiện thực hóa toàn bộ không gian môi trường và cơ chế vận hành câu đố với các tiêu chuẩn kỹ thuật hàng đầu:
- **Thiết kế không gian sân đá cổ kính (Dais Courtyard):** Tách lớp bề mặt địa hình thành một CanvasTexture độc lập (`ancient_rune_puzzle_ground_baked_v12`) tại độ sâu `depth = -97`, nổi bật với nền đá phiến đa giác, vòng tròn phù văn nghi thức khắc sâu vào đá và các rãnh dẫn năng lượng phát quang mềm mại.
- **Tích hợp tài nguyên đồ họa pixel-art sắc nét:** Tận dụng tối đa bộ sprite pixel-art gốc gồm `pillar_moon.png` ($32 \times 61\text{ px}$), `pillar_root.png` ($31 \times 61\text{ px}$), `pillar_eye.png` ($32 \times 52\text{ px}$) và `stone_altar.png` ($60 \times 42\text{ px}$).
- **Cơ chế phản hồi đa giác quan (Audio & Visual Feedback):**
  - Kích hoạt đúng cột đá: Chuông pha lê ngân vang cộng hưởng (`playRunestoneResonance`), cột đá bừng sáng hào quang và phóng cột tia sáng năng lượng lên bầu trời sương mù.
  - Kích hoạt sai thứ tự: Tiếng gầm rền rĩ hạ âm (`playRunestoneError`), cột đá rung giật chớp đỏ, toàn bộ chuỗi được hoàn tác mượt mà và phát tín hiệu đánh động thực thể *The Listener* lao tới điều tra.
  - Hoàn thành toàn bộ câu đố: Hợp âm khải hoàn C-E-G-C vang dội (`playRunestoneChord`), bệ thờ trung tâm và 3 cột đá đồng loạt bừng sáng, chớp sáng ngọc lục bảo toàn màn hình, hoàn thành nhiệm vụ `Q05_SOLVE_MIRE`, mở khóa `Q06_RETRIEVE_CLAPPER` và tự động lưu game.
- **Cơ chế chống gian lận & chặn lặp thao tác (Anti-Duplication Guards):**
  - Khóa vĩnh viễn tương tác câu đố sau khi đã giải thành công, ngăn chặn tình trạng người chơi spam phím [E] nhận trùng lặp nhiệm vụ hoặc kích hoạt lại hiệu ứng.
  - Ngăn chặn bấm trùng lặp một cột đá đã thắp sáng trong cùng một lượt giải.
  - Bảo lưu trạng thái qua hệ thống lưu/tải game: khôi phục nguyên vẹn trạng thái rực sáng của cả 3 cột đá và bệ thờ trung tâm khi tải game.

---

## 2. CHI TIẾT CÁC HẠNG MỤC THI CÔNG & KIẾN TRÚC HỆ THỐNG

### 2.1. Quản lý Tài nguyên Đồ họa (Pixel-Art Sprite Integrity)
Đã kiểm toán và xác nhận toàn bộ sprite Cột Đá và Bệ Thờ đều tồn tại hợp lệ và đạt tỷ lệ hiển thị chuẩn:
- `pillar_moon.png`: $32 \times 61\text{ px}$ — Ký hiệu Trăng Khuyết chạm khắc tinh xảo.
- `pillar_root.png`: $31 \times 61\text{ px}$ — Thân đá cuộn rễ cây cổ xưa.
- `pillar_eye.png`: $32 \times 52\text{ px}$ — Con mắt viễn cổ mở ra giữa phiến đá.
- `stone_altar.png`: $60 \times 42\text{ px}$ — Bệ thờ đá nguyên khối với rãnh hứng năng lượng.

### 2.2. Nướng Bề Mặt Địa Hình Sân Đá Cổ Ngữ (`ancient_rune_puzzle_ground_baked_v12`)
Toàn bộ bề mặt sân đá cổ ngữ ($350 \times 280\text{ px}$, $x = 3350..3700, y = 150..430$) được nướng tự động vào `CanvasTexture` độc lập tại `depth = -97`:
1. **Sân đá cổ hình elip nhiều tầng:**
   - Nền đá sẫm màu `#1e2824`, `#2b3632` và `#3a4742` với bán kính $155 \times 115\text{ px}$.
   - Viền đá phiến bo tròn bao quanh sân với các phiến đá slate cổ (`#485550`, `#5c6b65`).
2. **Vòng tròn phù văn nghi thức & Rãnh dẫn năng lượng (Energy Channels):**
   - Vòng tròn phù văn đường kính kép $110 \times 75\text{ px}$ viền xanh ngọc bích cổ kính (`#324a42`, `#4b6e62`).
   - Ba đường rãnh dẫn năng lượng ba tầng kết nối trực tiếp từ tâm bệ thờ $(3520, 280)$ đến từng chân cột đá:
     * Nhánh Tây Bắc: Dẫn tới Cột Trăng $(3400, 220)$.
     * Nhánh Nam: Dẫn tới Cột Rễ $(3520, 360)$.
     * Nhánh Đông Bắc: Dẫn tới Cột Mắt $(3640, 220)$.
3. **Mạng lưới phiến đá lát sân đan xen (Interlocking Flagstones):**
   - Hơn 60 phiến đá lát sân với bảng màu đá rêu cổ (`#3e4c46`, `#475650`, `#50615a`, `#34413b`), viền đá tối và các đốm rêu phát quang sinh học.
4. **Bệ đá móng nâng cao (Pedestals):**
   - Đúc móng đá nâng cao riêng biệt cho cả 3 cột đá và bệ thờ trung tâm với bóng đổ tự nhiên và viền nét pixel sắc nét.

### 2.3. Cấu trúc Đạo cụ & Kiến trúc Sân Đá Cổ Ngữ (`WorldBuilder.ts`)
1. **Hệ thống Cột Đá Cổ Ngữ tương tác (`createRunestonePillar`):**
   - Tạo vòng hào quang elip chân đế và ký hiệu cổ ngữ trên thân cột với hiệu ứng thở nhẹ nhàng khi ở trạng thái nghỉ (`alpha = 0.22..0.38`, chu kỳ 1.8s–2.2s).
   - Tích hợp cột tia sáng năng lượng vươn cao (`beamGraphics`, `depth = 650`) ẩn ban đầu và bừng sáng khi kích hoạt.
   - Hộp va chạm chân cột gọn gàng $20 \times 16\text{ px}$, chừa khoảng không gian đi lại xung quanh $360^\circ$ hoàn toàn thoải mái.
   - Bộ lưu trữ thực thể trực quan `runestoneVisuals` (Map) hỗ trợ cập nhật phát sáng tức thì qua `setPillarLit()`.
   - Cơ chế bảo vệ chống tạo trùng lặp sprite (`runestoneVisuals.has(pillarId)` guard).
2. **Bệ Thờ Trung Tâm Trận Địa (`createStoneAltar`):**
   - Đặt tại tâm điểm trận địa $(3520, 280)$, kích thước $60 \times 42\text{ px}$.
   - Hào quang bệ thờ ngọc lục bảo (`0x38d8a2`) và cột tia sáng thiên giới vươn cao 110 px chiếu rọi thẳng lên không trung khi giải đố thành công.
3. **Bia Đá Cổ Thư Đầm Lầy (`createAncientRuneStele`):**
   - Đặt tại vị trí dễ tiếp cận $(3460, 290)$, khắc ghi gợi ý thứ tự cổ ngữ bằng văn tự cổ rực sáng mờ ảo.
4. **Bốn Đỉnh Đá Nghi Thức (Ancient Stone Braziers):**
   - Bố trí tại 4 góc sân đá: $(3380, 260)$, $(3660, 260)$, $(3460, 370)$, $(3580, 370)$.
   - Chân đế đá sẫm màu chứa than hồng ma mị tím lam (`#8e44ad`, `#bb86fc`) tạo điểm nhấn khí quyển huyền bí.

### 2.4. Máy Trạng Thái Câu Đố & Bộ Lọc Chống Lặp (`PuzzleSystem.ts`)
Nâng cấp toàn diện phương thức `interactPillar(pillarId)`:
- **Bộ lọc `alreadySolved`:** Nếu câu đố đã giải (kiểm tra `isMirePuzzleSolved` hoặc cờ `mire_pillars_solved`), lập tức trả về `{ solved: true, failed: false, alreadySolved: true }` với thông báo khóa an toàn, ngăn chặn cộng điểm/thưởng trùng lặp.
- **Bộ lọc `alreadyLit`:** Nếu người chơi bấm lại vào cột đá đã kích hoạt trong chuỗi hiện tại, trả về `{ solved: false, failed: false, alreadyLit: true }` cùng tiến trình hiện tại.
- **Kiểm tra thứ tự kích hoạt chuẩn:** So khớp với mảng `correctSequence` (`['pillar_moon', 'pillar_root', 'pillar_eye']`):
  - *Đúng bước kế tiếp:* Đẩy `pillarId` vào chuỗi, bật trạng thái `pillarStates`, trả về `stepIndex` (1/3 hoặc 2/3).
  - *Hoàn thành bước cuối (3/3):* Bật cờ `mire_pillars_solved` và `mire_puzzle_solved`, đánh dấu `isMirePuzzleSolved = true`.
  - *Sai thứ tự:* Xóa sạch chuỗi (`currentSequence = []`), hoàn tác toàn bộ `pillarStates` về `false`, trả về `{ failed: true, solved: false, stepIndex: 0 }`.

### 2.5. Hệ Thống Âm Thanh Động (`AudioManager.ts`)
Bổ sung và tinh chỉnh 3 hàm âm thanh chuyên biệt tuân thủ tiêu chuẩn Web Audio API và không gây rò rỉ AudioNode:
1. `playRunestoneResonance(noteIndex)`: Chuông cộng hưởng pha lê theo cao độ tăng dần (Nốt 0: 330Hz, Nốt 1: 440Hz, Nốt 2: 554Hz) với sóng sine êm dịu và thời gian ngân vang 0.8s.
2. `playRunestoneError()`: Tiếng gầm vọng hạ âm bất hòa từ lòng đất đầm lầy, kết hợp sóng sawtooth (115Hz $\rightarrow$ 45Hz) và sóng sine (90Hz $\rightarrow$ 35Hz) tạo cảm giác rùng rợn và cảnh báo nguy hiểm.
3. `playRunestoneChord()`: Hợp âm khải hoàn C-E-G-C (C4: 261.6Hz, E4: 329.6Hz, G4: 392.0Hz, C5: 523.2Hz) ngân vang rạng rỡ 2.4s khẳng định chiến thắng.

### 2.6. Đồng Bộ Trạng Thái & Xử Lý Sự Kiện Gameplay (`GameScene.ts` & `PlayerState.ts`)
- **Tương tác Cột Đá (`handlePillarInteraction`):**
  - Nhận diện cột đá, gọi `PuzzleSystem.interactPillar(pillarId)`.
  - Xử lý mượt mà 5 kịch bản: `alreadySolved`, `alreadyLit`, `failed`, `solved`, và bước chuyển tiếp.
  - Khi thất bại: Rung chấn camera $250\text{ ms}$, chớp đỏ cột đá qua `setPillarLit(pillarId, false, true)`, hoàn tác visual qua `resetAllPillars()`, hoàn tác quest qua `playerState.resetQuestTasks('Q05_SOLVE_MIRE')` và báo động thực thể *The Listener* tại $(3520, 280)$ với bán kính thính giác 2.5x.
  - Khi hoàn thành: Hợp âm khải hoàn, chớp sáng ngọc lục bảo camera $500\text{ ms}$, kích hoạt lễ hội ánh sáng qua `triggerRunePuzzleSolvedCelebration()`, hoàn thành toàn bộ 3 nhiệm vụ con của `Q05_SOLVE_MIRE`, chuyển tiếp sang `Q06_RETRIEVE_CLAPPER` và gọi `SaveManager.saveGame()`.
- **Tương tác Bệ Thờ & Bia Cổ (`handleInteractions`):**
  - `inspect_rune_altar`: Báo cáo tình trạng ba rãnh dẫn năng lượng và số cột đã kích hoạt.
  - `read_rune_clue_stele`: Mở khóa tri thức `lore_runestones` và hiển thị gợi ý cổ thiêng: *"Khi Trăng Khuyết soi bóng đáy nước (1), Rễ Sâu thức giấc đâm xuyên bùn lầy (2), Con Mắt viễn cổ mở ra dẫn lối qua đầm (3)."*
- **Khôi phục trạng thái lưu (`create()`):**
  - Tự động kiểm tra cờ `mire_pillars_solved` khi khởi động GameScene, khôi phục `puzzleSystem.isMirePuzzleSolved = true` và kích hoạt ngay hào quang rực rỡ của toàn bộ trận địa.

---

## 3. KẾT QUẢ KIỂM TOÁN VÀ XÁC MINH KỸ THUẬT

### 3.1. Biên dịch TypeScript
- **Lệnh thực thi:** `npx tsc --noEmit`
- **Kết quả:** **0 lỗi biên dịch (Exit code 0)**.

### 3.2. Bộ Kiểm Tra Tự Động Toàn Diện C4-12-24 (`scripts/verify_rune_puzzle_c4_12_24.mjs`)
Bộ kiểm tra chạy tự động đánh giá 53 tiêu chí nghiêm ngặt:
1. **Pre-Backup Integrity:** 8/8 mục kiểm tra đạt (Thư mục và 7 tệp backup tồn tại đầy đủ).
2. **Sprite Asset Integrity & Dimensions:** 8/8 mục kiểm tra đạt (Cả 4 tệp PNG tồn tại và kích thước pixel hoàn toàn chính xác).
3. **Zones Registry Structure (`zones.json`):** 7/7 mục kiểm tra đạt (Bounds $3350..3700, 150..430$, colliders, interactables và transition hoạt động).
4. **PuzzleSystem Logic & Sequence Simulation:** 7/7 mục kiểm tra đạt (Đúng thứ tự, `alreadySolved`, `alreadyLit`, `stepIndex`, `resetPillars`).
5. **PlayerState Synchronization:** 2/2 mục kiểm tra đạt (`resetQuestTasks`, tự động chuyển sang `Q06_RETRIEVE_CLAPPER`).
6. **AudioManager Feedback Methods:** 3/3 mục kiểm tra đạt (Đầy đủ 3 hàm âm thanh cổ ngữ).
7. **WorldBuilder Visual Rendering & Safeguards:** 11/11 mục kiểm tra đạt (Địa hình nướng, 3 cột đá, bệ thờ, bia cổ, đỉnh lửa, chống tạo trùng lặp).
8. **GameScene Event Handlers & Persistence:** 7/7 mục kiểm tra đạt (Xử lý bệ thờ, bia cổ, kịch bản giải đố, phục hồi khi tải game).
- **Tổng kết:** **53/53 PASSED (100% SUCCESS)**.

### 3.3. Kiểm Tra Hồi Quy Toàn Bộ Hệ Thống Đã Xây Dựng
Tất cả các bộ test kiểm tra hồi quy của các phân khu trước đó đều đạt 100%:
- `verify_silent_mire_c4_12_23.mjs`: **78/78 PASSED**
- `verify_deep_forest_c4_12_22.mjs`: **PASSED**
- `verify_crooked_path_c4_12_21.mjs`: **PASSED**
- `verify_outer_woods_c4_12_20.mjs`: **PASSED**
- `verify_sanctuary_farm_c4_12_19.mjs`: **PASSED**
- `verify_core_world_blockout_c4_12_17.mjs`: **PASSED**
- `verify_farming_c4_12_16.mjs`: **33/33 PASSED**
- `verify_audio_c4_12_15.mjs`: **42/42 PASSED**
- `verify_gameplay_quest_c4_12_14.mjs`: **40/40 PASSED**

---

## 4. TỔNG KẾT VÀ SẴN SÀNG CHO BƯỚC TIẾP THEO

Command **C4-12-24** đã hoàn thành xuất sắc toàn bộ yêu cầu đề ra. Khu vực Câu Đố Cổ Ngữ đã trở thành một điểm nhấn cảnh quan lộng lẫy và giàu tính giải đố tương tác, kết nối liền mạch với cốt truyện và hệ thống âm thanh/sinh tồn của HOLLOW WOODS V1.2.

Sẵn sàng chuyển sang bước tiếp theo:
- **Command kế tiếp:** `C4-12-25 — XÂY DỰNG PHÂN KHU FORBIDDEN: MIẾU CHUÔNG PHẾ TÍCH — BROKEN BELL SHRINE`.
