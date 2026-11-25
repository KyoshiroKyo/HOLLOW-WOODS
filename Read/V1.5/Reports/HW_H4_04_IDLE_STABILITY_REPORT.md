# HW-H4-04 — IDLE ANIMATION STABILITY REPORT

- **Mã nhiệm vụ:** `HW-H4-04` (HYDRO HIGH ENGINEERING PROTOCOL V4)
- **Branch / HEAD:** `feat/v1.5.3-ag-world-polish` / `0617668a97f462877cbe2c30d304323e8fd48f6e`
- **Kết luận kỹ thuật (`NO-CODE-FIX` — Xác minh đạt chuẩn):** Không phát sinh lỗi hồi quy trên cấu hình **160 ms/frame (~6.25 FPS, chu kỳ 960 ms)** ở cả **Armed Idle** và **Unarmed Idle** trên đủ 4 hướng (`down`, `up`, `left`, `right`). Theo quy tắc sửa lỗi có điều kiện (§3), **không chỉnh sửa** mã nguồn `BlackKnightAnimations.ts`, `BlackKnightPlayer.ts`, scale, atlas hay chất lượng render. Không `git commit` và không `git push`.

---

## 1. Kiểm Tra Mã Nguồn (`BlackKnightAnimations.ts` & `BlackKnightPlayer.ts`)

1. **[BlackKnightAnimations.ts](file:///g:/HOLLOW%20WOODS/src/animation/BlackKnightAnimations.ts):**
   - Armed Idle: `ARMED_IDLE_FRAMES_PER_DIRECTION = 6` (`#L17`), `ARMED_IDLE_FRAME_MS = 160` (`#L18`), đăng ký qua `actions.set('idle', { frames: armedIdle, frameMs: 160, repeat: -1 })` (`#L99-L105`), dùng texture `black_knight_armed_idle` cho `down`/`up`/`left` và `black_knight_movement` (`armed_idle_right_*` đồng bộ từ B04-10-K2) cho `right`.
   - Unarmed Idle: `MOVEMENT_CLIPS.unarmed_idle = { frameMs: 160 }` (`#L70`), thu từ `black_knight_movement` với `repeat = -1`.
   - Thông số Phaser tạo ra: `frameRate = 1000 / 160 = 6.25` FPS, `msPerFrame = 160`, `skipMissedFrames = true` (`#L136-L139`).
   - Đối chiếu [BlackKnightConversion.json](file:///g:/HOLLOW%20WOODS/src/animation/BlackKnightConversion.json): không có clip trùng tên `idle` hoặc `unarmed_idle` ghi đè.

2. **[BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts):**
   - `playIdleAnim()` (`#L1446-L1456`) kiểm tra khóa hành động và đợi các clip phòng thủ/hành động (`BLACK_KNIGHT_DEFENSE_KEY`, `BLACK_KNIGHT_CONVERSION_ACTIONS_KEY`) hoàn tất trước khi chuyển về Idle.
   - Chặn restart mỗi khung hình: chỉ gọi `this.safePlayAnim(key, true)` (truyền `ignoreIfPlaying = true`) khi `this.anims.currentAnim?.key !== key || !this.anims.isPlaying` (`#L1453`). Do đó các lời gọi lặp từ `handleMovement()` (`#L1283`), `GameScene.ts:1823` (Pause) và `GameScene.ts:1937` (UI mở) đều no-op khi Idle đang phát đúng key.
   - `syncBodyFootAnchor()` (`#L247-L267`) neo gốc chân cố định tại `(0.5, 1.0)` và giữ physics body `18 × 12 px` đồng nhất kể cả khi `Run` chuyển tạm sang `scale = 1.2` / `1.02` rồi trở lại `scale = 1.5` khi về Idle.
   - **Ghi nhận thiết kế `checkZoneWeaponAutoState()` (`#L1063-L1068`, `#L1984-L1995`):** Cứ mỗi `600 ms`, game tự tra kiếm về Unarmed trong vùng an toàn (`bellhollow`, `sanctuary_farm`, hoặc cách đống lửa Sir Vaelen `(1435, 710)` ≤ `160 px`) và tự rút kiếm về Armed ở vùng nguy hiểm (`outer_woods`). Khi bấm `[X]` ngược trạng thái phân khu, sau `~600 ms` nhân vật tự trở về tư thế chuẩn của vùng.

---

## 2. Đo Đạc Runtime `>= 10 Giây` Cho Toàn Bộ 8 Trạng Thái Idle

Môi trường đo: `vite preview` phục vụ bản production `dist/` (WebGL render `51.2–57.0 FPS` trên `1280×720`), `Noclip = OFF`, spy sự kiện `animationstart`, `animationrestart`, `animationrepeat`, `animationupdate` và wrapper `player.play`. Thời lượng mỗi trạng thái: `10.3 giây`.

| Trạng thái & Animation Key | Texture Atlas | Frames / Định mức | Updates (10.3s) | Restarts / Play Calls | Repeats | Frame Delta TB (Scene ms) | Min / Max Scene (ms) | Sprite FPS đo được | Game Render FPS TB | Drift Chân / Body (`18×12`) | Ảnh minh chứng |
| --- | --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | --- |
| `wayfarer_idle_down` | `black_knight_armed_idle` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **160.00 ms** | 125.1 / 197.4 | **6.25 FPS** | 51.22 FPS | `0.0 px` / `18×12` | [idle_armed_down.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_armed_down.png) |
| `wayfarer_idle_up` | `black_knight_armed_idle` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **159.77 ms** | 141.8 / 178.5 | **6.26 FPS** | 56.73 FPS | `0.0 px` / `18×12` | [idle_armed_up.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_armed_up.png) |
| `wayfarer_idle_left` | `black_knight_armed_idle` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **159.95 ms** | 156.1 / 178.5 | **6.25 FPS** | 57.03 FPS | `0.0 px` / `18×12` | [idle_armed_left.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_armed_left.png) |
| `wayfarer_idle_right` | `black_knight_movement` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **159.80 ms** | 155.9 / 176.4 | **6.26 FPS** | 57.04 FPS | `0.0 px` / `18×12` | [idle_armed_right.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_armed_right.png) |
| `wayfarer_unarmed_idle_down` | `black_knight_movement` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **159.98 ms** | 141.3 / 177.1 | **6.25 FPS** | 57.00 FPS | `0.0 px` / `18×12` | [idle_unarmed_down.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_unarmed_down.png) |
| `wayfarer_unarmed_idle_up` | `black_knight_movement` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **159.87 ms** | 142.9 / 177.2 | **6.26 FPS** | 56.85 FPS | `0.0 px` / `18×12` | [idle_unarmed_up.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_unarmed_up.png) |
| `wayfarer_unarmed_idle_left` | `black_knight_movement` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **160.04 ms** | 142.9 / 176.4 | **6.25 FPS** | 56.84 FPS | `0.0 px` / `18×12` | [idle_unarmed_left.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_unarmed_left.png) |
| `wayfarer_unarmed_idle_right` | `black_knight_movement` | 6 / `160 ms` (`6.25 FPS`) | 64 | **0 / 0** | 11 | **159.87 ms** | 155.8 / 175.9 | **6.26 FPS** | 56.94 FPS | `0.0 px` / `18×12` | [idle_unarmed_right.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-H4-04/idle_unarmed_right.png) |

- Chuỗi chỉ số frame (`1 → 2 → 3 → 4 → 5 → 6 → 1...`) tuần tự đều đặn qua `11` vòng lặp trên mọi hướng, `origin = (0.5, 1.0)`, `scale = (1.5, 1.5)`, `maxFootDriftX/Y = 0`, `maxBodyShiftX/Y = 0`, `console_errors = []`, `page_errors = []`.

---

## 3. Kiểm Tra Các Chuyển Tiếp & Tốc Độ Walk / Run

| Kịch bản chuyển tiếp | Chuỗi Animation Key thực tế (kèm `scale` & `body`) | Restarts | Delta Idle sau khi quay về | Kết quả |
| --- | --- | :---: | :---: | --- |
| **Idle → Walk → Idle (Armed)** | `wayfarer_idle_down (1.5)` → `wayfarer_walk_right (1.5, 170ms)` → `wayfarer_idle_right (1.5)`, `body 18×12` | `0` | **160.0 ms** (`14` updates) | **PASS** |
| **Idle → Walk → Idle (Unarmed)** | `wayfarer_unarmed_idle_down (1.5)` → `wayfarer_unarmed_walk_left (1.5)` → `wayfarer_unarmed_idle_left (1.5)`, `body 18×12` | `0` | **158.8 ms** (`11` updates) | **PASS** |
| **Idle → Run → Idle (Armed)** | `wayfarer_idle_down (1.5)` → `wayfarer_run_left (1.2, 70ms × 12)` → `wayfarer_idle_left (1.5)`, `body 18×12` | `0` | **158.4 ms** (`11` updates) | **PASS** |
| **Idle → Run → Idle (Unarmed)** | `wayfarer_unarmed_idle_down (1.5)` → `wayfarer_unarmed_run_right (1.02)` → `wayfarer_unarmed_walk_right (1.5)` → `wayfarer_unarmed_idle_right (1.5)`, `body 18×12` | `0` | **160.8 ms** (`11` updates) | **PASS** |
| **Idle → Attack → Idle (`Space`)** | `wayfarer_idle_down (1.5)` → `wayfarer_attack_down (75ms)` → `wayfarer_idle_down (1.5)`, chân giữ nguyên `(1200, 620)` | `0` | **159.7 ms** (`13` updates) | **PASS** |
| **Idle → Roll → Idle (`KeyZ`)** | `wayfarer_idle_down (1.5)` → `wayfarer_roll_down (57ms)` → `wayfarer_idle_down (1.5)`, kết thúc tại `(1200, 693.33)` `18×12` | `0` | **159.0 ms** (`13` updates) | **PASS** |
| **Armed → Unarmed → Armed (`KeyX` tại Outer Woods)** | `wayfarer_idle_down` → `wayfarer_weapon_off_down` → `wayfarer_unarmed_idle_down` → `wayfarer_weapon_on_down` → `wayfarer_idle_down` (và chu kỳ kế tiếp sau `~600 ms` do `checkZoneWeaponAutoState`) | `0` | **162.1 ms** (`6` updates cuối) | **PASS** |
| **Toggle `[X]` trong vùng an toàn (`Bellhollow`)** | `wayfarer_unarmed_idle_down` → `wayfarer_weapon_on_down` → `wayfarer_idle_down` → tự thu kiếm `wayfarer_weapon_off_down` → `wayfarer_unarmed_idle_down` | `0` | **160.5 ms** (`5` updates) | **PASS** |
| **Pause → Resume (`Escape`)** | `GameScene.ts:1823` gọi `playIdle()` trong khi Pause → `playCallsCount = 0`, giữ nguyên `wayfarer_unarmed_idle_down` | `0` | **159.8 ms** (`19` updates) | **PASS** |
| **Walk / Run Speed Invariance** | `Walk`: `spd = 85 px/s`, `wayfarer_walk_right`, `170 ms/frame`; `Run`: `spd = 140 px/s`, `wayfarer_run_right`, `70 ms/frame` (`12` frame = `840 ms`) | — | — | **PASS** |

---

## 4. Kiểm Tra TypeScript, Build & Regression

Đã dọn sạch toàn bộ script tạm trong `scripts/temp/` (`TEMP_FILE_COUNT=0`) và kiểm tra:

- `npm run check` (`tsc --noEmit`): **PASS** (exit code `0`).
- `npm run build` (`tsc && vite build`): **PASS** (exit code `0`).
- `npm run verify:data`: **PASS** (`15/15` kiểm tra dữ liệu đạt).
- `python tests/hw_bug_21b_walk_run_verification.py`: **PASS** (`10/10` test Walk/Run/Shift/Focus/Modal/Armed-Unarmed/Outer Woods/Combat đạt).
- `python tests/hw_bug_26b_walkrun_fix_verification.py`: Trong lần chạy gộp dưới tải CPU (`task-22302`), `TEST 2` (Collision Guardrail) chạm race timing `time.sleep(0.8)` (`isSprinting == True` chưa quá ngưỡng `250 ms` sau va chạm); khi chạy xác minh ngay sau đó (`task-22307`), toàn bộ **5/5 suites PASS 100%** (`exit code 0`, không sửa code hay test).
- `git diff --check`: **PASS** (`0`).
- **Trạng thái repo:** Không thêm thay đổi mới nào vào `src/`, `tests/` hay `scripts/` từ nhiệm vụ `HW-H4-04`.
