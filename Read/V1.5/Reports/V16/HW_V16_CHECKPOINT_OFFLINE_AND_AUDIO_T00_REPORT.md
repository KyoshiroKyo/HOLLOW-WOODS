# HW-V16-RELEASE-CHECKPOINT, HW-V16-OFFLINE-01 & HW-AUDIO-T00 REPORT
**Dự án:** HOLLOW WOODS V1.6.0 — The Unbroken Oath\
**Ngày:** 27/11/2026 (17:38 ICT)\
**Branch:** `feat/v1.6-competition-preview`\
**Checkpoint Commit (code):** `35317c0ef397edb8da3ce7471a18e5b87cada6a9`\

---

## PHẦN 1 — HW-V16-RELEASE-CHECKPOINT

- **Trạng thái Portal:** HOLLOW WOODS V1.6.0 đã vượt qua **P2Game Portal Technical Validation** lúc **17:22 ngày 27/11/2026** với **0 lỗi chặn, 0 cảnh báo và 0 lỗi console**.
- **Lỗi đã xác nhận khắc phục trên Portal:** `SE-004` (`navigator.clipboard.writeText`) và `RT-002` (`focus-without-user-activation`).
- **Bảo toàn hiện vật:**
  - Source code checkpoint: `35317c0ef397edb8da3ce7471a18e5b87cada6a9` (`feat/v1.6-competition-preview`).
  - P2Game ZIP V1.6.0: `release/p2game/hollow-woods-p2game-v1.6.0.zip` (`62,269,979 bytes`, SHA-256: `0726213E47F6C09901D8267BBFB6EF139B860FEC15AEA7E3EB2291BF599AB190`).
  - P2Game Fallback V1.5.5-R2: `release/p2game/hollow-woods-p2game-v1.5.5-r2.zip` (`62,427,767 bytes`, SHA-256: `F6BFBA92438CEC8364D37FA2FECDD9E89D9AA955BC5828080414BED9CFA241E5`).
- **Phương án hợp nhất `main` (chờ Owner nghiệm thu gameplay, CHƯA merge):**
  1. Kiểm tra `git diff main..feat/v1.6-competition-preview --stat` để xác nhận chỉ gồm các nhóm `Group 1-3`, `R1`, `RT-002` và báo cáo V16.
  2. Sau khi Owner phê duyệt gameplay: `git checkout main && git merge --no-ff feat/v1.6-competition-preview` và `git tag v1.6.0-competition-preview`.
  3. Push `main` + tag lên `origin` và kiểm tra Remote SHA.

---

## PHẦN 2 — HW-V16-OFFLINE-01 (BẢN DỰ PHÒNG OFFLINE THI ĐẤU 28/11/2026)

Đã xuất bản offline từ đúng `dist/` của `35317c0` bằng pipeline `npm run release:standalone` (không sửa gameplay, không ghi đè ZIP P2Game):

- **Thư mục chạy trực tiếp:** `G:\HOLLOW_WOODS_C02\release\HOLLOW_WOODS_V1.5_STANDALONE\` (`296` tệp, gồm `index.html`, `assets/`, `CHƠI_GAME.bat`, `server.ps1`, `CHƠI_GAME.sh`, `HUONG_DAN_CHOI_GAME.txt`).
- **Tệp ZIP đóng gói V1.6.0 Offline:** `G:\HOLLOW_WOODS_C02\release\HOLLOW_WOODS_V1.6.0_OFFLINE_COMPETITION.zip` (`62,274,273 bytes`, SHA-256: `B9F9B58A23FC8A319D712393B843DABCE93F93863E77E7CF928869D4638F0510`).
- **Tính độc lập mạng:** `src/main.ts` tự động chạy chế độ dự phòng khi không có `window.p2`, lưu tiến trình vào `localStorage` cục bộ.
- **Hướng dẫn khởi động nhanh cho Owner (Windows):**
  1. Giải nén `HOLLOW_WOODS_V1.6.0_OFFLINE_COMPETITION.zip` (hoặc mở thẳng `G:\HOLLOW_WOODS_C02\release\HOLLOW_WOODS_V1.5_STANDALONE\`).
  2. Nhấp đúp **`CHƠI_GAME.bat`** — script tự bật local HTTP server tại `http://localhost:8080/` (ưu tiên `python`, `py`, `npx serve`, hoặc PowerShell `HttpListener` có sẵn trên Windows) và tự mở trình duyệt.
  3. *(macOS/Linux)*: chạy `./CHƠI_GAME.sh`.

---

## PHẦN 3 — HW-AUDIO-T00 — AUDIO ASSESSMENT & REMASTER ROADMAP (READ-ONLY)

### 3.1. Kiểm kê hệ thống âm thanh hiện tại (`public/assets/audio/`)
Tổng cộng **65 tệp / 67.63 MB** (20 `.mp3` = `44.01 MB`, 45 `.wav` = `23.61 MB`):

| Thư mục | Số tệp | Dung lượng | Ghi chú kỹ thuật |
|---|---:|---:|---|
| `bgm/` | 5 | `36.37 MB` | 5 track `.mp3` (`evergrove.mp3` 7.63 MB, `forgotten_orchard.mp3` 7.44 MB, `knights_quiet_fire.mp3` 7.40 MB, `beyond_the_hills.mp3` 7.10 MB, `embervale.mp3` 6.79 MB) |
| `sfx/` | 50 | `26.03 MB` | 45 `.wav` (`23.61 MB`) + 5 `.mp3`; lớn nhất: `behemoth_thud.wav` (6.53 MB), `boss_drone.wav` (2.22 MB), `bell_toll_low.wav` (2.05 MB / 11.22s), `rune_shift.wav` (1.41 MB), `footstep_leaves_1.mp3` (2.64 MB) |
| `ambience/` | 4 | `4.55 MB` | `ambience_crossing.mp3` (2.64 MB), `ambience_village.mp3` (1.49 MB), `ambience_forest.mp3`, `ambience_mire.mp3` |
| `dialogue/` | 6 | `0.68 MB` | `dialogue_bram/edda/finn/garth/neris/text_blip.wav` (Sir Vaelen & Sir Mordric dùng fallback `dialogue_garth`) |

### 3.2. Phân tích tiếng chuông mở đầu & khả năng rút xuống ~7 giây
- `playBronzeBellToll()` (`src/audio/AudioManager.ts:2648`) phát `bronze_bell` (`assets/audio/sfx/bell_low.mp3`, `173 KB`) với `maxPolyphony = 1`.
- `playCrackedBellToll()` (`AudioManager.ts:2687`) phát `bell_toll_low.wav` (`11.22s` gốc, playbackRate `0.85` → `~13.2s`).
- Nguyên nhân cảm giác chuông mở đầu kéo dài ~22s: `startAct0Intro()` phát chuông ở `800ms`, sau đó khi người chơi bước qua `x >= 175` tại `fog_crossing`, `triggerAct0AtmosphereTelegraph()` phát thêm lượt chuông thứ 2 (cộng dồn 2 lượt liên tiếp hoặc đuôi chuông kéo dài).
- **Phương án thử nghiệm đề xuất (sau cuộc thi):**
  1. Cắt/fade-out tự nhiên `bell_low.mp3` & `bell_toll_low` xuống **~7.0 giây** (attack `0–0.2s`, sustain `0.2–2.5s`, exponential natural decay `2.5–7.0s`).
  2. Thêm guard trong `triggerAct0AtmosphereTelegraph()` không phát lại chuông nếu `startAct0Intro()` vừa phát trong vòng 15s (hoặc dùng biến thể soft distant chime).

### 3.3. Lộ trình tối ưu dung lượng (67.63 MB → mục tiêu ~38–42 MB)
1. **Chuyển `.wav` dung lượng lớn sang `.ogg`/`.mp3` (160–192 kbps):**
   - `behemoth_thud.wav` (6.53 MB), `boss_drone.wav` (2.22 MB), `bell_toll_low.wav` (2.05 MB), `rune_shift.wav` (1.41 MB) và 41 `.wav` SFX khác (`23.61 MB` tổng) có thể giảm xuống **~3–5 MB** (tiết kiệm **~18–20 MB**) mà không giảm chất lượng cảm nhận.
2. **Chuẩn hóa bitrate `bgm/` (36.37 MB) & `footstep_leaves_1.mp3` (2.64 MB):**
   - Re-encode 5 track BGM về **160 kbps stereo / 44.1 kHz** (hoặc OGG Q5) giúp giảm `36.37 MB` xuống **~20–24 MB** (tiết kiệm **~12–16 MB**), kèm kiểm tra `footstep_leaves_1.mp3` (2.64 MB bất thường cho 1 tiếng bước chân).
   - Tổng sau tối ưu dự kiến: **~32–38 MB** (đạt mục tiêu ~40 MB).

### 3.4. Tình trạng Audio Lifecycle & B06 còn tồn đọng
- Các lỗi B06 đã xử lý trong `AudioManager.ts` (xem `HW_V16_B06_AUDIO_SYSTEM_REPORT.md`): sửa rò rỉ 5 capture listeners (`H4-NEW-06`), đồng bộ `Music Slider <-> BGM`, đồng bộ `[M] Mute <-> SettingsManager`, trim `ambience_forest` (`0.28`), và guard `Double-BGM race`.
- **Hạng mục tồn đọng sau cuộc thi:**
  1. **Trailer nguồn:** Tệp video/audio trailer gốc (`G:\HOLLOW WOODS\HW\Trailer\Video Game Trailer\v12\HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`, `-18.0 LUFS` theo báo cáo `HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md`) **không có trong workspace `G:\HOLLOW_WOODS_C02`**. Cần Owner cung cấp tệp trailer nguồn nếu muốn đối chiếu/remaster trực tiếp theo âm sắc trailer.
  2. **Voice riêng cho Sir Vaelen & Sir Mordric:** Đang dùng fallback `dialogue_garth.wav` (chưa có asset giọng riêng được phê duyệt).
  3. **Loudness normalization toàn cục:** Cần cân chỉnh các SFX/BGM theo chuẩn `-18.0 LUFS` / `-1.0 dBFS` True Peak của bản `V12.2` trong giai đoạn Audio Remaster.
