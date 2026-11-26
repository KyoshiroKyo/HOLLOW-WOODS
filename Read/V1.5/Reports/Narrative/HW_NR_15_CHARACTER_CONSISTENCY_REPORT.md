# HW-NR-15 — CHARACTER VISUAL CONSISTENCY & ANIMATION QA REPORT

- **Mission ID:** `HW-NR-15 — CHARACTER VISUAL CONSISTENCY & ANIMATION QA`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `Codex`
- **Dependencies:** `HW-CHAR-01-R2` + `CHARACTER PROTOTYPES` (`HW-NR-13`, `HW-NR-14`; cập nhật từ chối `HW-NR-12` theo `HW-NR-12-R3`)
- **Mode:** **`READ-ONLY VISUAL & RUNTIME QA + ARCHITECTURAL VERIFICATION`** (`0` sửa đổi `src/` hay `public/assets/`, bảo toàn `Idle 160ms/frame`, camera, collider `18×12`, animation keys & giữ nguyên `BUG-058`/`BUG-059` tách thành nhiệm vụ kỹ thuật riêng)

---

## 1. Đối Chiếu Black Knight V1 $\leftrightarrow$ Verified Black Knight V2 $\leftrightarrow$ Runtime Hiện Tại

1. **Danh tính trong Asset Library & Runtime:**
   - Thư viện chuẩn hóa [Meliodas_Blackwood](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Pixel_Art/01_Characters/Player/Meliodas_Blackwood/) và bản sao lưu ZIP (`169` files, SHA-256 `8fef3b3b...`) giữ nguyên danh tính **`Meliodas Blackwood`** (`V2` `194` files: `03_Sprites` `32` sheet 4 hướng, `04_Animations` `12` GIF, `05_Atlases` `10` cặp PNG/JSON).
2. **Đối chiếu SHA-256 Byte-to-Byte (`05_Atlases/` vs `public/assets/characters/black_knight/`):**
   - Toàn bộ **`10/10` file PNG atlas runtime khớp SHA-256 100%** với bản Verified `Meliodas_Blackwood/05_Atlases/` (`black_knight_armed_idle`, `movement`, `core_combat`, `defense`, `extended_skills`, `conversion_{actions,air,combat,motion,states}`), đồng thời giữ nguyên `black_knight_portrait.png` (`64×64`, SHA-256 `96dfc9fca1bcff39...`).
3. **So sánh 3 thế hệ Black Knight:**
   - **V1.0 (`Fellor` Original — `Black_Knight_All_In_One_New.png`):** `2592×1152` RGBA, ô `144×64`, `34` chuỗi `324` frame, góc nhìn **Side-View 1 hướng**.
   - **V1.4 (`mossbound_wayfarer` legacy — `wayfarer_idle.png`):** `64×64` Top-Down 4 hướng, `vis_h = 29..39 px`, scale `1.50` $\rightarrow$ `43.5..58.5 wpx`, được giữ nguyên ngoài bộ atlas chính.
   - **V2 / Runtime Hiện Hành (`black_knight_*`):** Giữ toàn bộ `10` atlas V2 tại runtime, Idle/Walk/Core/Defense/Extended dùng cell `64×64` (`vis_h = 28..33 px`, `bottom_y = 63`), trong khi nhóm Conversion (`conversion_motion`, `conversion_combat`, `conversion_states`, `conversion_air`) dùng cell lớn hơn (`84×72`, `112×72`, `80×72`, `80×80`).

---

## 2. Kết Quả Kiểm Tra Trạng Thái `BUG-058` & `BUG-059` *(Tách Task Riêng — KHÔNG Gộp Sửa Vào QA)*

Qua kiểm tra mã nguồn [BlackKnightPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L283-L293) và trace trực tiếp trên Chromium headless (`AnimationManager` + `animationstart`/`animationupdate`):

| Mã Lỗi | Trạng Thái Hiện Tại Trong Runtime | Bằng Chứng Đo Thực Tế | Hành Động Đề Xuất |
|---|---|---|---|
| **`BUG-058`** *(Scale Pop / Co Giãn Chạy)* | **`DEFERRED / MITIGATED BY WORKAROUND` — Chưa sửa dứt điểm ở nguồn atlas** | `BlackKnightPlayer.ts:283-293` vẫn phải áp hệ số bù runtime `base * 0.8 = 1.20` cho `wayfarer_run_*` (đồng thời ép `originY` động từ `1.0` $\rightarrow$ `0.875`) và `base * 0.68 / 0.78` (`1.02` vs `1.17`) cho 2 nửa của `wayfarer_unarmed_run_*`. Nếu `animationstart` kích hoạt trước khi sprite đổi `texture.key`, khung `frame-0` bị vẽ ở `scale 1.50`. | Tách sang **`TASK-DEV-BUG-058-059`** riêng cho Codex. |
| **`BUG-059`** *(Chênh Lệch Độ Nét Idle/Walk `30px` vs Run `41px`)* | **`OPEN / UNFIXED`** | `black_knight_armed_idle` (`64×64`) có `vis_h = 28..31 px` (`scale 1.50` $\rightarrow$ `42.0..46.5 wpx`); `black_knight_conversion_motion` (`84×72`) ở `armed_run_sequence_*` có `vis_h = 34..43 px` (`unarmed_run` `38..50 px`), tạo mật độ pixel HD cao hơn rõ rệt khi ấn `Shift` (chụp thực tế tại `NR15_02_RUN_DOWN.png`). Atlas `black_knight_movement.png` thực chất đã có sẵn `armed_run` / `unarmed_run` khổ `64×64` (`vis_h = 26..32 px`) nhưng bị `BlackKnightAnimations.ts` ghi đè bằng `conversion_motion`. | Tách sang **`TASK-DEV-BUG-058-059`**: chuẩn hóa cùng một mật độ pixel hoặc kích hoạt bản `64×64` đồng nhất sau khi Owner duyệt. |

*(Tuân thủ đúng quy trình: QA KHÔNG sửa `BlackKnightPlayer.ts` hay `BlackKnightAnimations.ts` để tự xử lý 2 lỗi này).*

---

## 3. Kiểm Tra Animation Thực Tế & Bảo Toàn Hợp Đồng Kỹ Thuật

| Hạng Mục Kiểm Tra | Giá Trị Đo Thực Tế Trong Runtime (`Chromium WebGL`) | Đánh Giá |
|---|---|:---:|
| **`Idle` Timing (`Armed & Unarmed`, 4 hướng)** | `8/8` clip (`wayfarer_idle_{down,up,left,right}`, `wayfarer_unarmed_idle_*`): `6` frames, **`160.0 ms/frame`** (`6.25 FPS`), chu kỳ `960 ms`, `repeat = -1`. Bảo toàn nguyên vẹn. | **PASS** |
| **`Walk` & `Run`** | `Walk` (`6f @ 170 ms/frame` = `1020 ms`, `black_knight_movement`, `64×64 @ 1.50×`); `Run` (`12f @ 70 ms/frame` = `840 ms`, `black_knight_conversion_motion`, `84×72 @ 1.20×`). | **PASS (Run có BUG-059)** |
| **Chiến Đấu & Phòng Thủ (`4` hướng)** | Kích hoạt thực tế qua bàn phím `GameScene`: Light Attack `[Space]` (`6f @ 75 ms`), Heavy Attack `[K]` (`6f @ 100 ms`), Parry `[V]` (`6f @ 75 ms`), Roll `[Z]` (`6f @ 57 ms`), Weapon Art `[R]` (`6f @ 83.33 ms`, `112×72`), Weapon Toggle `[X]` (`weapon_on/off`). | **PASS** |
| **Atlas Bounds & Empty Frames** | `0` ô rỗng (`empty = 0`) trên toàn bộ `10/10` atlas runtime. Mọi khung Idle/Walk/Core Combat đều khóa đáy chân `bottom_y = 63` trong cell `64×64`. | **PASS** |
| **Origin, Collider & Filtering** | `origin = (0.5, 1.0)` (tại Idle/Walk; `conversion_motion` `84×72` điều chỉnh `originY = 0.875` giữ đúng chân đế), `bodySize = [18, 12]`, `bodyOffset = [26, 52]`, `pixelArt: true`, `antialias: false`, `roundPixels: true`, `nearestFilter = 1` (`NEAREST`). | **PASS** |
| **Hiệu Ứng Giả Tưởng Đã Duyệt** | Vòng Sáng `[F]` (`Soft Radial Warm Aura`), chuỗi VFX `weapon_art` / `fire_wave` / `flame_stream` / `buff` trong `black_knight_extended_skills` (`192` frames, `0` empty) & lớp `L3_spectral_fx_master` của `Headless Warden` (`NR-14`) hoạt động tách lớp độc lập, không ảnh hưởng collider `18×12`. | **PASS** |

---

## 4. Đối Chiếu Tỷ Lệ Giữa Các Kỵ Sĩ & Nguyên Mẫu (`Scale Parity Matrix`)

Đo trực tiếp từ pixel thật (PNG RGBA) và chuẩn hóa trên cùng mặt phẳng `2.0× Camera Zoom` ([NR15_KNIGHT_CONSISTENCY_MATRIX.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15/NR15_KNIGHT_CONSISTENCY_MATRIX.png)):

| Nhân Vật / Nguyên Mẫu | Nguồn / Trạng Thái | Cell & Scale Runtime | Chiều Cao Thật (`raw_h`) | Chiều Cao Thế Giới (`world_h`) | Đánh Giá Tỷ Lệ |
|---|---|---|---:|---:|---|
| **`Meliodas Blackwood` (Idle)** | Runtime (`black_knight_armed_idle`) | `64×64` @ `1.50×` | `28–31 px` | **`42.0–46.5 wpx`** | **CHUẨN HERO** |
| **`Meliodas Blackwood` (Run)** | Runtime (`conversion_motion`) | `84×72` @ `1.20×` | `34–43 px` | `40.8–51.6 wpx` | Lệch mật độ (`BUG-059`) |
| **`Sir Vaelen`** | Runtime NPC (`campfire_knight_idle_sheet`) | `64×64` @ `1.00×` | `46–47 px` | **`46.0–47.0 wpx`** | **PASS** (khớp Meliodas) |
| **`Fallen Knight`** | Runtime Enemy (`fallen_knight_sheet`) | `64×64` @ `1.00×` | `38–47 px` | `38.0–47.0 wpx` | **PASS** |
| **`Dread Horseman`** | Runtime Enemy (`dread_horseman_sheet`) | `64×64` @ `1.00×` | `41–56 px` | `41.0–56.0 wpx` | **PASS** (đơn vị cưỡi) |
| **`Hooded Knight Boss`** | Runtime Boss (`hooded_knight_sheet`) | `160×160` @ `1.00×` | `64–123 px` (đứng `71 px`) | `71.0 wpx` (đứng) | **PASS** (tầm Boss) |
| **`Sir Aldemar` (`HW-NR-13`)** | Sandbox Prototype Only (`Prototypes/Sir_Aldemar`) | `64×64` @ `1.00×` | `43–45 px` | `43.0–45.0 wpx` | Prototype blockout (chờ vẽ tay `TASK-B02`) |
| **`The Headless Warden` (`HW-NR-14`)** | Sandbox Prototype Only (`Bosses/The_Headless_Warden`) | `128×128` @ `1.00×` | `98–101 px` | `98.0–101.0 wpx` | Prototype Boss 3 lớp (`L1/L2/L3`) |
| **`Sir Roderick`** | **`HW-NR-12-R3`: Từ chối blockout `HW-NR-12`** | *Chờ chọn real asset* | — | — | Xem [HW_NR_12_R3_RODERICK_ASSET_SELECTION.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NR_12_R3_RODERICK_ASSET_SELECTION.md) |

---

## 5. Kết Quả Kiểm Thử Runtime (`Chromium Headless QA` + Checks)

1. **Chuyển trạng thái & 4 hướng (`W/A/S/D` + `Shift` + combat keys `[Space/K/V/Z/R/X]`):** Tất cả animation transitions khớp phím vật lý (`wayfarer_walk_{down,left,up,right}`, `wayfarer_run_{down,right}`, `attack/heavy_attack/parry/roll/weapon_art/weapon_off`).
2. **Camera Zoom (`1.5×`, `2.0×`, `2.2×`, `3.0×`):** `pixelArt: true`, `roundPixels: true`, `scale` player không bị camera làm biến dạng (`disp` giữ nguyên `[96, 96]` trên `black_knight_armed_idle`).
3. **Day / Dusk Transition:** Chụp thực tế Ban Ngày (`NR15_01_DAY_IDLE_DOWN.png`) và Hoàng Hôn (`NR15_03_NIGHT_PHASE.png`); `player.alpha = 1`, `tintTopLeft = 0xffffff` ổn định, không mất viền hay mờ bóng.
4. **Hiệu năng & Console Errors:** `consoleErrors = []` (`0`), `pageErrors = []` (`0`), `failedHttp = []` (`0`). Trong môi trường Chromium giả lập phần mềm **SwiftShader** chất lượng HIGH mặc định đo được `7.0 FPS` (`avgMs = 143.7 ms`) *(lưu ý: benchmark phần mềm SwiftShader chạy LOW graphics tại `test_hw_bug18` được dùng cho FPS mục tiêu 60 FPS; cần chạy kiểm tra trên GPU thật nếu đo framerate production)*.
5. **Save/Load & Reload Round-Trip:** Reload trang & nhấn Continue khởi tạo lại `GameScene` tại `fog_crossing` `(120, 195)` với đúng `texture = black_knight_armed_idle`, `anim = wayfarer_idle_down`, `scale = [1.5, 1.5]`, `origin = [0.5, 1]`, `0` lỗi tải asset *(lưu ý: nhánh `s.saveGame()` gọi thử trong harness chưa phải hàm public trên Scene nên trạng thái load lại đọc từ spawn mặc định khi chưa nhấn Save tay)*.
6. **Kiểm tra tĩnh toàn dự án (`Post-check`):**
   - `npm run check` (`tsc --noEmit`): **PASS (`0` errors)**
   - `npm run verify:data`: **PASS (`15/15` kiểm tra dữ liệu)**

---

## 6. Bằng Chứng Trực Quan Đính Kèm (`Visuals/HW-NR-15/`)

- 🖼️ [NR15_KNIGHT_CONSISTENCY_MATRIX.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15/NR15_KNIGHT_CONSISTENCY_MATRIX.png) — Ma trận đối chiếu tỷ lệ toàn bộ kỵ sĩ V1 $\rightarrow$ V2 $\rightarrow$ Runtime $\rightarrow$ Prototypes ở `2.0×` Zoom.
- 🖼️ [NR15_01_DAY_IDLE_DOWN.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15/NR15_01_DAY_IDLE_DOWN.png) — Screenshot runtime Chromium (`Idle` `64×64 @ 1.50×`, Ban Ngày).
- 🖼️ [NR15_02_RUN_DOWN.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15/NR15_02_RUN_DOWN.png) — Screenshot runtime Chromium (`Run` `84×72 @ 1.20×`, ghi nhận trực quan `BUG-059`).
- 🖼️ [NR15_03_NIGHT_PHASE.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-15/NR15_03_NIGHT_PHASE.png) — Screenshot runtime Chromium chuyển pha `Hoàng Hôn`.

---

## 7. Hard Stop Compliance
- **0** thay đổi mã nguồn `src/` (kể cả `BlackKnightPlayer.ts`), **0** thay đổi `public/assets/`, **0** tạo Black Knight V2 giả, **0** xóa asset cũ, **0** commit/push.
- Đã tách riêng **`BUG-058` & `BUG-059`** khỏi báo cáo QA để bàn giao **Codex** xử lý ở nhiệm vụ kỹ thuật độc lập (`TASK-DEV-BUG-058-059`).
