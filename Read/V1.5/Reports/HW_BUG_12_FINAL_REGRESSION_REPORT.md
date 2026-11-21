# BÁO CÁO KIỂM THỬ HỒI QUY TOÀN DIỆN VÀ NGHIỆM THU HOTFIX MỤC BỘ PHẬN (HW-BUG-#12)

**Dự án:** HOLLOW WOODS V1.5.3  
**Nhánh:** `feat/v1.5.3-ag-world-polish`  
**Commit cơ sở kiểm thử:** `33617b24e02fbfefce5a91d8c9dcbe0f1fe70e1a`  
**Ngày thực hiện:** 22/11/2026  
**Công cụ kiểm thử:** Playwright (Chromium Headless / SwiftShader / WebGL Canvas 1280×720), Node.js, TypeScript Compiler.  
**Tệp dữ liệu kiểm thử runtime:** [HW_BUG_12_REGRESSION_DATA.json](HW_BUG_12_REGRESSION_DATA.json)  
**Ảnh chụp kiểm chứng:** [hw_bug12_final_regression.png](Visuals/hw_bug12_final_regression.png)

---

## 1. TỔNG HỢP TRẠNG THÁI NGHIỆM THU ĐỘC LẬP

Tuân thủ nghiêm ngặt nguyên tắc chỉ đánh giá và chốt trạng thái dựa trên bằng chứng đo đạc runtime khách quan, tuyệt đối không tự nâng cấp trạng thái nếu chưa đủ điều kiện môi trường phần cứng.

| Hạng mục | Mã lỗi / Tính năng | Trạng thái nghiệm thu | Cơ sở chứng thực & Điều kiện |
|---|---|---|---|
| **PART A** | **HOTFIX-B1** | **CLOSED-VERIFIED local** | Đo đạc 4 hướng Walk Armed/Unarmed đạt scale 1.0 (30–32px), Run đạt 0.8 / 0.68..0.78. Delta bóng `footShadowGfx` = 0px. Duy nhất 1 actor. Không phóng lớn bất thường. |
| **PART B** | **HOTFIX-B2** | **PARTIAL · EVKey Windows cần Owner xác nhận** | Đạt 100% test case W/A/S/D, Shift, blur reset, focus recovery, packet IME giả lập (229/231) và text input isolation. **Giữ nguyên PARTIAL** do EVKey trên Windows thật cần máy Owner kiểm chứng hook OS. |
| **PART C** | **BUG-032** | **CLOSED-VERIFIED local** | Phân biệt rõ rệt active colliders (4 cặp va chạm) vs physics bodies (247 static · 8 dynamic bodies). 731 animations (5.774 frames) đạt 0 missing frame, 0 frame rác `satyr_sheet`. Smoke combat K3-A/B/C PASS 100%. |
| **PART D** | **BUG-024** | **CLOSED-VERIFIED production local · HOSTED BLOCKED** | Production build local nạp 100% tài nguyên, `dagger_slash.wav` decode sạch, không kẹt loader/spinner. Lập danh mục kiểm thử Hosted P2Game. Tuyệt đối không tự publish và không tự nhận HOSTED PASS. |

---

## 2. KẾT QUẢ ĐO ĐẠC CHI TIẾT TỪNG PHẦN

### PART A — HOTFIX-B1: Locomotion Scaling & Foot Shadow Synchronization

#### Mục tiêu kiểm tra:
1. Black Knight chuyển động Walk / Run ở cả 4 hướng (Down, Up, Left, Right) cho cả 2 trạng thái Armed (Rút kiếm) và Unarmed (Tra kiếm).
2. Tỷ lệ hiển thị (Visual Scale): Walk không bị phóng to bất thường (phải giữ nguyên scale 1.0, chiều cao frame 30–32px); Run chuẩn hóa đúng scale thiết kế (Armed Run: scale 0.8; Unarmed Run: scale 0.68 cho frame 1–6 và 0.78 cho frame 7–12).
3. Bóng đổ chân (`footShadowGfx`): Vị trí bóng phải neo đồng bộ 100% tại `(player.x, player.y)` với độ lệch `delta = 0px`, hiển thị liên tục, không bị trễ khung hình khi chuyển hướng hoặc chạy nhanh.
4. Số lượng thực thể: Bảo đảm duy nhất 1 actor nhân vật chính trên GameScene (`actorCount === 1`).
5. Bảo toàn atlas nguồn của Fellor và các chuỗi animation K1–K3.

#### Số liệu đo đạc thực tế:
- **Số lượng actor player:** `1` (PASS).
- **Walk Armed (4 hướng):**
  - `down`: anim `wayfarer_walk_down`, texture `black_knight_movement`, frame `armed_walk_down_0`, scale: `(1.0, 1.0)`, body: `18×12`, shadow delta: `(0, 0)`.
  - `up`: anim `wayfarer_walk_up`, texture `black_knight_movement`, frame `armed_walk_up_0`, scale: `(1.0, 1.0)`, body: `18×12`, shadow delta: `(0, 0)`.
  - `left`: anim `wayfarer_walk_left`, texture `black_knight_movement`, frame `armed_walk_left_0`, scale: `(1.0, 1.0)`, body: `18×12`, shadow delta: `(0, 0)`.
  - `right`: anim `wayfarer_walk_right`, texture `black_knight_movement`, frame `armed_walk_right_0`, scale: `(1.0, 1.0)`, body: `18×12`, shadow delta: `(0, 0)`.
- **Walk Unarmed (4 hướng):**
  - `down`: anim `wayfarer_unarmed_walk_down`, scale: `(1.0, 1.0)`, shadow delta: `(0, 0)`.
  - `up`: anim `wayfarer_unarmed_walk_up`, scale: `(1.0, 1.0)`, shadow delta: `(0, 0)`.
  - `left`: anim `wayfarer_unarmed_walk_left`, scale: `(1.0, 1.0)`, shadow delta: `(0, 0)`.
  - `right`: anim `wayfarer_unarmed_walk_right`, scale: `(1.0, 1.0)`, shadow delta: `(0, 0)`.
- **Run Armed (4 hướng):**
  - `down`: anim `wayfarer_run_down`, texture `black_knight_conversion_motion`, frame `armed_run_sequence_down_0`, scale: `(0.8, 0.8)`, body: `18×12`, shadow delta: `(0, 0)`.
  - `up`: anim `wayfarer_run_up`, texture `black_knight_conversion_motion`, frame `armed_run_sequence_up_0`, scale: `(0.8, 0.8)`, body: `18×12`, shadow delta: `(0, 0)`.
  - `left`: anim `wayfarer_run_left`, texture `black_knight_conversion_motion`, frame `armed_run_sequence_left_0`, scale: `(0.8, 0.8)`, body: `18×12`, shadow delta: `(0, 0)`.
  - `right`: anim `wayfarer_run_right`, texture `black_knight_conversion_motion`, frame `armed_run_sequence_right_0`, scale: `(0.8, 0.8)`, body: `18×12`, shadow delta: `(0, 0)`.
- **Run Unarmed (4 hướng):**
  - `down`, `up`, `left`, `right`: scale ban đầu: `0.68` (chu kỳ frame 1–6) và chuyển `0.78` (chu kỳ frame 7–12), shadow delta: `(0, 0)`.
- **Chu trình chuyển đổi Run → Walk → Idle:**
  - Run scale = `0.8` → Walk scale = `1.0` → Idle scale = `1.0`.
  - Bóng đổ duy trì `delta = 0px`, `visible = true` xuyên suốt quá trình chuyển đổi.

---

### PART B — HOTFIX-B2: Input Routing, Blur/Focus & IME Packet Handling

#### Mục tiêu kiểm tra:
1. Nhận diện phím di chuyển W/A/S/D và Shift tăng tốc độ chạy chính xác.
2. Vòng đời Blur/Focus: Khi cửa sổ trình duyệt mất tiêu điểm (`window.blur`), lập tức xóa sạch mọi phím đang giữ (`movementHolds.size === 0`), triệt tiêu hoàn toàn vận tốc di chuyển (`velocity = (0, 0)`), chống lỗi nhân vật tự động trôi/chạy vô hạn. Khi nhận lại tiêu điểm (`window.focus`), phục hồi điều khiển bình thường không bị kẹt phím.
3. Phân biệt gói IME (UniKey/EVKey / OS IME composition): Gói giả lập IME keyup (`keyCode 229` / `231` / `key: 'Process'`) không được phép giải phóng phím phần cứng thật đang giữ. Phím chỉ được giải phóng khi có sự kiện `keyup` thật với mã phím tiêu chuẩn.
4. Nhập văn bản (DOM Text Input): Khi focus vào ô nhập text (`input`, `textarea`), bàn phím của Phaser bị tắt (`keyboard.enabled = false`) và giải phóng sạch gameplay input. Khi blur ô nhập, bàn phím Phaser được hoàn trả an toàn.
5. **Quy tắc cứng về EVKey Windows:** Tầng hook bàn phím mức hệ điều hành của EVKey/UniKey trên Windows chỉ có thể kiểm thử toàn diện trên máy vật lý của Owner. Giữ nguyên trạng thái `PARTIAL`.

#### Số liệu đo đạc thực tế:
- **Giữ phím di chuyển (KeyW):** Vận tốc Y trước khi blur = `-85 px/s`, phím W đang active (PASS).
- **Sự kiện Window Blur:** Phím W active sau blur = `false`, số lượng hold = `0`, vận tốc Y sau blur = `0 px/s` (PASS).
- **Phục hồi Focus & di chuyển phím mới (KeyD):** Vận tốc X = `+85 px/s`, nhả phím D vận tốc X = `0 px/s` (PASS).
- **Thử nghiệm gói IME Keyup (keyCode 229 / 'Process'):**
  - Gói keyup IME gửi tới khi đang giữ W: `stillHeldAfterImeKeyup = true` (không bị nhả oan phím thật).
  - Gói keyup phần cứng thật (keyCode 87): `releasedAfterRealKeyup = true` (giải phóng sạch phím).
- **Ngăn chặn xung đột DOM Text Input:**
  - Khi ô nhập input focus: `isPhaserKeyboardDisabled = true`, `isTextInputFocused = true`.
  - Khi ô nhập input blur: `isPhaserKeyboardRestored = true`.

---

### PART C — BUG-032: Phân Biệt Bộ Đếm Collider vs Bodies & Kiểm Thử Khói Combat

#### Mục tiêu kiểm tra:
1. Xác minh hệ thống chẩn đoán kỹ thuật (`DeveloperModeManager` và `DevPanelOverlay`): Phân biệt rạch ròi giữa số lượng quan hệ va chạm đang bật (`activeColliders`) và số lượng thân vật lý đang bật (`staticBodies` và `dynamicBodies`).
2. Kiểm toán toàn bộ 731 animations trong animation registry: Bảo đảm không còn bất kỳ frame nào thiếu (`missingFramesCount === 0`) và không còn tham chiếu tới texture cũ `satyr_sheet` (`satyrSheetFramesCount === 0`).
3. Kiểm thử khói chiến đấu (K3-A/B/C Combat Smoke Check): Light Attack, Heavy Attack, Weapon Art, Roll đều phát hoạt ảnh từ atlas chuẩn, hoàn tất vòng đời animation an toàn, không quăng ngoại lệ, không hồi quy.

#### Số liệu đo đạc thực tế:
- **Bộ đếm chẩn đoán runtime:**
  - `perfColliderCount` (Quan hệ va chạm đang bật): `4`
  - `perfStaticBodyCount` (Thân vật lý tĩnh đang bật): `247`
  - `perfDynamicBodyCount` (Thân vật lý động đang bật): `8`
  - So sánh thực tế từ `physics.world`: Trùng khớp 100% (`actualColliderCount = 4`, `actualStaticBodyCount = 247`, `actualDynamicBodyCount = 8`).
  - Phân biệt rõ rệt hai chỉ số: `areMetricsDistinguished = true` (PASS).
- **Kiểm toán frame hoạt ảnh:**
  - Tổng số animations đăng ký: `731`
  - Tổng số frames kiểm tra: `5.774`
  - Số frame bị thiếu (Missing Frames): `0` (PASS)
  - Số frame kế thừa từ `satyr_sheet`: `0` (PASS)
- **Kiểm thử khói các đòn đánh & chuyển động (K3-A/B/C):**
  - Light Attack: Kích hoạt thành công `wayfarer_attack_up` từ atlas `black_knight_core_combat`.
  - Heavy Attack: Kích hoạt thành công `wayfarer_heavy_attack_up`.
  - Weapon Art: Kích hoạt thành công `wayfarer_weapon_art_up` từ atlas `black_knight_extended_skills`.
  - Roll: Kích hoạt thành công `wayfarer_roll_up` từ atlas `black_knight_defense`, cờ `_isRolling = true`.

---

### PART D — BUG-024: Kiểm Tra Loader Local & Danh Mục Nghiệm Thu Hosted P2Game

#### Kết quả kiểm tra Loader trên bản Build Local:
1. Màn hình chờ khởi động (`#game-startup`):
   - Chuyển pha `preload` ngay khi có tiến trình nạp tài nguyên đầu tiên (`startupPhase = 'preload'`).
   - Tự động ẩn hoàn toàn khi màn hình chờ game tiếp quản (`startupHidden = true`).
   - Không bị kích hoạt trạng thái lỗi hay nút "Tải lại" oan uổng (`startupElementError = false`, `data-state = null`).
2. Tài nguyên âm thanh SFX và Ambience:
   - Toàn bộ các tệp âm thanh cốt lõi được nạp và giải mã thành công trong bộ nhớ cache WebAudio:
     - `dagger_slash`: cached = true, decoded = true.
     - `scout_whistle`: cached = true, decoded = true.
     - `sanity_gasp`: cached = true, decoded = true.
     - `ambience_village`: cached = true, decoded = true.
     - `ambience_crossing`: cached = true, decoded = true.
     - `attack_swing`: cached = true, decoded = true.
     - `lantern_toggle`: cached = true, decoded = true.
3. Nhạc nền BGM:
   - 5 bản BGM sử dụng cơ chế Streaming Audio qua `HTMLAudioElement` độc quyền trong `AudioManager`, giải phóng hơn 500MB RAM giải mã WebAudio PCM không cần thiết trên thiết bị người chơi.

---

## 3. CHECKLIST NGHIỆM THU NỀN TẢNG HOSTED P2GAME (HOSTED ACCEPTANCE CHECKLIST)

Do hạn chế về sandbox và quy tắc an toàn (không tự ý deploy lên server môi trường staging/production), trạng thái của BUG-024 trên môi trường máy chủ lưu trữ (Hosted) được bảo lưu là **HOSTED BLOCKED**.

Dưới đây là Danh mục kiểm thử nghiệm thu bắt buộc phải thực hiện khi gói bản phát hành lên máy chủ lưu trữ P2Game (`https://games.p2game.io/`):

- [ ] **1. CDN Asset Delivery & CORS Headers:**
  - Kiểm tra toàn bộ file nạp (`.png`, `.json`, `.wav`, `.mp3`, `.woff`) có mã phản hồi HTTP 200/304 từ CDN.
  - Bảo đảm header `Access-Control-Allow-Origin: *` hợp lệ, không phát sinh lỗi chặn CORS khi nạp audio decode qua WebAudio.
- [ ] **2. Audio Streaming Range Requests (206 Partial Content):**
  - Xác nhận máy chủ Web/CDN hỗ trợ HTTP Range Requests cho các tệp MP3 BGM streaming (`knights_quiet_fire.mp3`, `embervale.mp3`,...).
  - Đảm bảo trình duyệt không tải lại toàn bộ file MP3 mỗi lần loop.
- [ ] **3. Loader Watchdog & Latency Tolerance:**
  - Kiểm tra trên mạng 3G/4G mô phỏng (Fast 3G / Slow 3G):
    - Khung `#game-startup` không hiện lỗi "Khởi động quá lâu" trước ngưỡng 45 giây.
    - Sự kiện `hollow-woods:startup-progress` kích hoạt liên tục giữ watchdog sống trong suốt quá trình tải asset nặng.
- [ ] **4. Iframe Parent Messaging & SDK Handshake:**
  - Trò chơi chạy bên trong `iframe` của cổng P2Game.
  - Xác nhận script `p2game-sdk.v1.js` khởi tạo thành công không bị block bởi Content-Security-Policy (CSP).
  - Hàm `p2.gameOver(...)` gửi payload điểm số lên hệ thống mẹ an toàn.
- [ ] **5. WebGL Context Loss & Mobile Wake-up:**
  - Kiểm tra tab trình duyệt bị đưa vào background (sleep/tab switch) trên thiết bị di động / laptop tiết kiệm pin:
    - Khi active lại tab, WebGL context phục hồi bình thường.
    - Không crash renderer và không bị lặp âm thanh.
- [ ] **6. AudioContext Autoplay Policy Handshake:**
  - Kiểm tra chính sách chặn âm thanh tự động của trình duyệt (Chrome/Safari Autoplay Policy):
    - Màn hình chờ hướng dẫn click chuột/chạm tay đầu tiên để `resume()` AudioContext sạch sẽ.
    - Không có cảnh báo đỏ `The AudioContext was not allowed to start` trong console.
- [ ] **7. Cloud Save Lifecycle:**
  - Xác minh `window.addEventListener('beforeunload')` và `p2.auth.onChange` đồng bộ dữ liệu savegame về local storage / cloud storage tức thời trước khi người chơi đóng tab.
- [ ] **8. Clean Console Zero Errors:**
  - Console môi trường Hosted hoàn toàn không có lỗi ngoại lệ unhandled, không có tài nguyên 404.

---

## 4. KẾT LUẬN & ĐỀ XUẤT BÀN GIAO

1. Toàn bộ 4 phần của nhiệm vụ **HW-BUG-#12** đã hoàn tất đo đạc thực nghiệm với độ chính xác tuyệt đối:
   - **PART A:** Hoàn tất xác minh không phóng lớn trong Walk, scale chuẩn 1.0, shadow bám delta = 0px → **CLOSED-VERIFIED local**.
   - **PART B:** Bảo đảm an toàn input routing, blur/focus và packet IME; tuân thủ quy tắc giữ **PARTIAL** chờ Owner thử nghiệm thực tế với bộ gõ EVKey trên hệ điều hành Windows thật.
   - **PART C:** Đã phân biệt rạch ròi các bộ đếm collider vs bodies trên Dev Panel, 0 missing frame, 0 frame `satyr_sheet`, đòn đánh combat K3 không hồi quy → **CLOSED-VERIFIED local**.
   - **PART D:** Loader local hoàn hảo, sẵn sàng danh mục kiểm thử Hosted P2Game → **CLOSED-VERIFIED production local · HOSTED BLOCKED**.
2. **HARD STOP:** Giữ nguyên các tệp mã nguồn sạch (không có sửa đổi phát sinh do không tái hiện lỗi mới), cập nhật Bug Registry và dừng chờ phản hồi từ Project Owner.
