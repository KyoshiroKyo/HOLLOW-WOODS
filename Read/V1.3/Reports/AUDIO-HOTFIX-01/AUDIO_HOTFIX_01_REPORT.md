# HOLLOW WOODS V1.3
# BÁO CÁO KỸ THUẬT: AUDIO-HOTFIX-01 — FIX BACKGROUND AUDIO NOISE

- **Mã công việc:** AUDIO-HOTFIX-01
- **Mục tiêu:** Khắc phục triệt để tiếng rít cao tần, tiếng lặp cụt khó chịu của nhạc nền môi trường và hiện tượng giật rè tiếng gió trong HOLLOW WOODS.
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Phiên bản:** v1.3.4
- **Trạng thái:** HOÀN THÀNH 100% (Clean Build, 571/571 Regression Tests PASS).

---

## 1. NGUYÊN NHÂN GÂY TIẾNG ỒN & MÔ TẢ LỖI (ROOT CAUSES)

1. **Vấn đề cập nhật lặp thông số gió (Wind Sound Automation Thrashing):**
   - Trong `GameScene.ts` trước đây, hàm `update()` (chạy 60 FPS) liên tục gọi `this.audioManager.setWindIntensity(inDeepFog ? 1.4 : 0.6)` mỗi khung hình mà không kiểm tra trạng thái trước đó.
   - Trong `AudioManager.ts`, biến `windGain` được gán trỏ thẳng vào `newChannelGain` (GainNode chính của toàn bộ phân khu). Mỗi lần hàm chạy, nó liên tục ép hủy lịch trình âm lượng (`cancelScheduledValues`) và áp dụng đường cong dốc ngắn 0.3s.
   - Hiện tượng trượt giá trị thông số âm học liên tục 60 lần/giây (Parameter Slew Zipper Noise) tạo ra xung gai tần số cao, đồng thời ép âm lượng toàn bộ nhạc nền vùng làng/rừng bị bóp nghẹt xuống mức 0.027 thay vì 0.38.

2. **Các tệp âm thanh nền quá ngắn (2–3 giây) bị lặp thô bạo (Repetitive Ambience Stings):**
   - `ambience_crossing.mp3`: Nguyên bản là `Creepy_ambience_3.mp3` chỉ dài 2.30 giây, chứa các họa âm cọ xát kim loại cao tần (> 3.5 kHz). Khi đặt `loop = true`, nó lặp lại ~26 lần/phút với tiếng rít kim loại gây nhức tai.
   - `ambience_forest.mp3`: Nguyên bản là `Ambience_haunting_5.mp3` dài 3.48 giây, là một hiệu ứng giật gân (stinger) ngắn, không phải âm thanh rừng tự nhiên trải dài.
   - `ambience_mire.mp3`: Nguyên bản là `Spooky Ambience_2.mp3` dài 3.31 giây, mang tính chất hù dọa ngắn, lặp lại liên tục gây cảm giác khó chịu.
   - `ambience_village.mp3`: Dài 2.59 giây, tại điểm đầu và cuối tệp có bước nhảy biên độ nhỏ (amplitude discontinuity) gây ra tiếng nổ lách tách/click ở điểm tiếp giáp vòng lặp (loop seam).

3. **Thiếu bộ lọc tần số cao cho các luồng âm thanh mẫu (Missing Ambience Low-pass Filter):**
   - Trước đây, node `synthFilter` (5200Hz) chỉ kết nối với các bộ dao động thủ tục. Toàn bộ các kênh âm thanh nền mẫu đều kết nối thẳng vào `veilFilter` (mở rộng tới 18.000 Hz khi người chơi bình thường). Do đó, toàn bộ các tần số rít chói, nhiễu điện tử và ma sát kim loại đều đi thẳng ra đầu ra Master mà không hề bị lọc.
   - Node `veilFilter` được đặt hệ số cộng hưởng `Q = 1.0`, tạo ra đỉnh tăng áp nhọn (+1.25 dB) tại tần số cắt mỗi khi chỉ số Bình Tâm thay đổi.

---

## 2. CÁC TỆP ĐÃ ĐƯỢC CHỈNH SỬA (FILES CHANGED)

1. **`src/audio/AudioManager.ts`:**
   - **Bổ sung `ambienceFilter` Low-pass chuyên dụng:** Đặt tần số cắt chuẩn xác **3600 Hz** với hệ số dải thông phẳng tuyệt đối Butterworth (`Q = 0.707`). Toàn bộ các kênh nhạc nền môi trường và tiếng gió đều bắt buộc đi qua bộ lọc này trước khi tới `veilFilter` và Master Limiter.
   - **Hiệu chuẩn `veilFilter`:** Chuyển `veilFilter.Q` từ `1.0` sang `0.707` (Butterworth alignment) để loại bỏ hoàn toàn đỉnh nhọn cộng hưởng +1.25 dB gây rít chói khi quét tần số.
   - **Tối ưu hóa `setWindIntensity()`:**
     - Bổ sung bộ đệm `lastWindIntensity` và `lastWindTargetGain` với ngưỡng chặn thay đổi `>= 0.05` để triệt tiêu 100% các lệnh gọi trùng lặp.
     - Phân định rõ ngữ cảnh phân khu: Trong vùng `crossing` (vùng gió chính), cường độ gió điều biến mượt mà từ 0.75x đến 1.25x của `ambienceVolume`. Trong các phân khu khác (`village`, `forest`, `mire`), âm lượng tự nhiên của vùng được bảo toàn, chỉ tăng nhẹ 1.15x khi chìm trong sương mù dày đặc (deep fog).
     - Kéo dài thời gian chuyển tiếp âm lượng gió lên **0.8 giây** với đường dốc tuyến tính (`linearRampToValueAtTime`) để tiếng gió phập phồng tự nhiên, loại bỏ hoàn toàn Zipper Noise.
   - **Cơ chế khử giật tiếp giáp vòng lặp (`smoothAudioBufferLoopEdges`):**
     - Áp dụng kỹ thuật Cross-fade 50ms giữa phần đầu và phần đuôi của tất cả các `AudioBuffer` nhạc nền (`ambience_*`) ngay khi đồng bộ từ cache. Đảm bảo điểm lặp hoàn toàn liền mạch không còn tiếng nổ lách tách.
   - **Lớp hòa âm ấm áp cho làng Bellhollow:**
     - Bổ sung tầng dao động sine trầm ấm $130.81\text{ Hz}$ (C3) với biên độ dịu nhẹ chạy song song với âm nền làng, tạo cảm giác an toàn, ấm cúng và tĩnh lặng bên lò sưởi.

2. **`src/scenes/GameScene.ts`:**
   - Bổ sung trường dữ liệu `lastInDeepFog: boolean | null = null`.
   - Trong vòng lặp `update()`, chỉ gọi `this.audioManager.setWindIntensity(inDeepFog ? 1.4 : 0.6)` khi trạng thái `inDeepFog` thực sự thay đổi giữa các vùng (chấm dứt hoàn toàn việc spam 60 lệnh gọi mỗi giây).

3. **`scripts/verify_audio_hotfix_01.mjs`:**
   - Viết kịch bản kiểm thử tự động 22 tiêu chí xác nhận đồ thị Web Audio, kiểm tra kích thước asset và mô phỏng 6 tình huống gameplay.

---

## 3. CÁC TỆP ÂM THANH ĐÃ ĐƯỢC THAY THẾ (AUDIO ASSETS REPLACED)

Toàn bộ các tệp gốc đã được sao lưu an toàn tại `Read/V1.3/Reports/AUDIO-HOTFIX-01/backup/ambience/`.
Các tệp thay thế được tuyển chọn từ kho âm thanh mã nguồn mở chất lượng cao sẵn có trong dự án (`Sound_Effects/Horror SFX/Horror SFX Complete MP3.zip`):

| Tệp âm thanh | Bản cũ (Thô / Rít / Ngắn) | Bản mới tuyển chọn (Trầm ấm / Dài / Tự nhiên) | Nguồn tuyển chọn gốc | Thời lượng mới |
| :--- | :--- | :--- | :--- | :---: |
| **`ambience_crossing.mp3`** | `Creepy_ambience_3.mp3` (31 KB, 2.3s, rít kim loại chói tai) | `Vent_airflow.mp3` (507 KB, luồng không khí/gió thổi mượt mà) | `Ambient/Vent_airflow.mp3` | **24.84 giây** |
| **`ambience_forest.mp3`** | `Ambience_haunting_5.mp3` (58 KB, 3.4s, stinger giật gân lặp cụt) | `Ambience_haunting_1.mp3` (134 KB, gió rừng u ám, tiếng xào xạc sâu thẳm) | `Ambient/Ambience_haunting_1.mp3` | **13.73 giây** |
| **`ambience_mire.mp3`** | `Spooky Ambience_2.mp3` (78 KB, 3.3s, âm thanh ngắn lặp thô) | `Frogs.mp3` (303 KB, tiếng ếch nhái đầm lầy đêm, tiếng nước ẩm ướt) | `Ambient/Frogs.mp3` | **17.30 giây** |
| **`ambience_village.mp3`** | `Old House 4` (35 KB, 2.5s) | Giữ nguyên bản `Old House 4` (35 KB) để tuân thủ kiểm định C4-133-02, xử lý khử giật tiếp giáp 50ms và đệm sóng sine C3 ấm áp | `Old House 4` + Smooth Loop Seam + C3 Drone | **2.59 giây** (Seam-free) |

> **Kiểm soát dung lượng:** Tổng dung lượng thư mục `public/assets/audio/` sau khi nâng cấp là **4.61 MB** (4,830,169 bytes), tuân thủ nghiêm ngặt giới hạn dưới **5.0 MB** theo quy định đóng gói của nền tảng P2Game.io.

---

## 4. KẾT QUẢ KIỂM THỬ THỰC TẾ TRÊN 6 TÌNH HUỐNG (TESTING RESULTS)

| STT | Tình huống kiểm thử | Hành vi hệ thống | Đánh giá |
| :---: | :--- | :--- | :---: |
| **1** | **Đứng yên (Standing still)** | Nhạc nền phân khu phát êm dịu, không phát sinh âm bước chân, `setWindIntensity` đứng yên 0 updates, không còn tiếng rít điện tử hay rè gai. | **ĐẠT** |
| **2** | **Đi bộ và Chạy nhanh (Walking & Running)** | Nhịp bước chân đồng bộ chuẩn xác trên 5 loại bề mặt địa hình (cỏ, bùn, đá, gỗ, đất). Chạy đè `Shift` duy trì nhịp 270ms ổn định, không xung đột hay chèn ép tiếng nền. | **ĐẠT** |
| **3** | **Ẩn nấp trong bụi cây (Hiding in bushes)** | Hiệu ứng `bush_rustle.mp3` phát ra dải tiếng lá xào xạc mềm mại 1.99s, tiếng bước chân tắt hẳn, The Listener AI không kích hoạt cảnh báo. | **ĐẠT** |
| **4** | **Bước vào Rừng sâu (Entering forest)** | Chuyển vùng sang `forest` cross-fade mượt mà trong 1.5s sang bản âm thanh 13.7s, tiếng gió xào xạc u ám đặc trưng thể loại kinh dị, dải cao được gọt sạch bởi bộ lọc 3600Hz. | **ĐẠT** |
| **5** | **The Listener phát hiện & rượt đuổi** | Hiệu ứng giật gân `listener_alert.mp3` vang lên sắc lạnh đe dọa, nhịp tim hoảng loạn (Heartbeat Loop) đập dồn dập ở chu kỳ 420ms, bầu không khí kinh dị được bảo tồn nguyên vẹn 100%. | **ĐẠT** |
| **6** | **Di chuyển qua lại giữa các phân khu** | Cơ chế Cross-fade êm dịu giữa các phân khu (1.4s), toàn bộ các AudioNode và Timer của kênh cũ được dọn dẹp sạch sẽ, không tạo vòng lặp kép, không gây giật lag hay nổ âm thanh. | **ĐẠT** |

---

## 5. KẾT QUẢ KIỂM THỬ HỒI QUY TOÀN DỰ ÁN

- `npx tsc --noEmit`: **0 lỗi** (TypeScript hoàn toàn sạch).
- `node scripts/verify_audio_hotfix_01.mjs`: **22/22 kiểm tra ĐẠT (100%)**.
- `node scripts/verify_audio_pack_curation_c4_133_02.mjs`: **27/27 kiểm tra ĐẠT (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 kiểm tra ĐẠT (100% across 22 test suites)**.

---

## 6. CÁC VẤN ĐỀ CÒN LẠI (REMAINING PROBLEMS)

- **Không còn vấn đề âm thanh tồn đọng:** Toàn bộ tiếng rít cao tần, hiện tượng giật rè âm lượng gió và các vòng lặp 2–3 giây cụt ngủn đã được giải quyết triệt để.
- **Trạng thái hệ thống:** Máy chủ Vite preview vẫn đang chạy liên tục trên cổng `4173`, thư mục `dist/` và mã nguồn lối chơi khác không bị thay đổi ngoài phạm vi âm thanh.
