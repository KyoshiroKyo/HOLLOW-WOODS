# HW-V16-A08 — OPENING CUTSCENE HYBRID CINEMATIC PRODUCTION REPORT

- **PROJECT:** HOLLOW WOODS
- **STUDIO:** KYOSHIRO STUDIO
- **TARGET:** `V1.6.0 — THE UNBROKEN OATH` (`ROADMAP: 3.1`)
- **TASK ID:** `HW-V16-A08`
- **STATUS:** **`A08 PREPRODUCTION COMPLETE / PRODUCTION PENDING`** *(Dừng đúng cổng Owner Approval Gate tại `§8` — KHÔNG sản xuất video chính thức và KHÔNG tích hợp runtime trước khi được duyệt)*
- **DEPENDENCY TRACKING:** `A03–A06/A06-R1` hoàn tất (`PASS`); `A07` đang bảo toàn checkpoint tại `G:/HOLLOW WOODS` (`36f43b6`, chưa tự chạy A07/A09).
- **RUNTIME CODE CHANGES IN A08:** **`0` tệp nguồn (`src/` và `public/assets/`) được chỉnh sửa hoặc ghi đè.**

---

## 1. Phạm Vi Đã Hoàn Thành (Preproduction Only — Tuân Thủ `§8` & `HARD STOP`)

1. **Storyboard & Shot Spec đầy đủ `6` shot (`CS01–CS06`, tổng `28.0s`):**
   - Tài liệu phê duyệt chi tiết đủ `17` trường mỗi shot: [HW_V16_A08_STORYBOARD_APPROVAL.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A08_STORYBOARD_APPROVAL.md).
   - Bảng tổng hợp keyframes (`1480×740`) & `6` khung keyframe riêng (`960×540`) gắn nhãn rõ `NON-FINAL STORYBOARD KEYFRAME (PREPRODUCTION)`: [A08_STORYBOARD_BOARD_6SHOTS.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A08/A08_STORYBOARD_BOARD_6SHOTS.png).
2. **Tuân thủ Canon Tuyệt Đối (`§2`, `§3`, `DEC-LOCK-01..06, 20`):**
   - Giữ ẩn hoàn toàn tên `Meliodas Blackwood`, danh hiệu `The Wolf Lord` / `Tổng Chỉ Huy`, không nêu tên hai học trò trong `CS01`.
   - Không xác định nguồn gốc lời cầu cứu (`UNKNOWN`), không chốt số năm, không gán nhân quả `7 hồi chuông`, không dùng lý giải tự phong ấn `Algiz` hay tái sinh.
   - Không dùng `CHAR-006 / The Headless Warden`, không đưa `Knight_2 / Knight_3` làm nhân vật Canon, không dùng nguyên track `V12.2` làm cutscene/gameplay loop.
   - Đánh dấu tường minh **`DRAFT`** đối với thiết kế huy hiệu *Đoàn Kỵ Sĩ Hắc Lang* trong `CS02` (`DEC-LOCK-06` còn mở).
3. **Thẩm Định Nguồn Mỹ Thuật & Âm Thanh (`§3`, `§7`):**
   - **Artwork chính dùng cho Preproduction:** `Asset_Art/Meliodas_Blackwood/01_LATEST_ARTWORK/` (`meliodas_idle_armed_4dir.png` `384×256`, `meliodas_walk_armed_4dir.png` `384×256`, `meliodas_idle_unarmed_4dir.png` `384×256`, `hollow_woods_black_knight_cover.png` `1280×720`) dưới giấy phép thương mại hợp lệ của *Fellor / BitBlast Studio* + dựng lại nội bộ bởi *Kyoshiro Studio* (`LICENSE_AND_CREDITS.md`); `02_CURRENT_RUNTIME/` chỉ dùng để đối chiếu tương thích gameplay (`CS06`), tuyệt đối loại trừ `03_LEGACY_ARCHIVE/`.
   - **Audio 5 Track & License Check:** Tách riêng `Ambient`, `Music`, `SFX`, `Narration`, `Subtitle` trong [SOUND_CUE_SHEET.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/SOUND_CUE_SHEET.json) và phụ đề dự thảo [HOLLOW_WOODS_OPENING_CINEMATIC_V1_SUBTITLES_VI.vtt](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/HOLLOW_WOODS_OPENING_CINEMATIC_V1_SUBTITLES_VI.vtt); ghi nhận rõ bản nhạc `HOLLOW_WOODS_V12_2_CINEMATIC_SOUNDTRACK.mp3` (`01:00.00`) chỉ là mixdown stereo chưa có DAW stems (`AUD-K12`) và đề xuất biên tập `sfx_bell_short_fade` (`2.6–2.8s`) thay cho `bell_toll_low.wav` (`11.222s`, `NAR-029`).
4. **Chuẩn Bị Hợp Đồng Tích Hợp Cho `HW-V16-A09` (`§12` — Chỉ đặc tả, không sửa code):**
   - Tài liệu JSON chuẩn bị đầy đủ `8` điểm tích hợp kỹ thuật bám sát `MainMenuScene.ts`, `GameScene.ts`, `SettingsManager.ts`, `AudioManager.ts`: [A09_INTEGRATION_CONTRACT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/A09_INTEGRATION_CONTRACT.json).
   - Quy định rõ: **New Game** (`isContinue: false`) phát intro; **Continue** (`isContinue: true`) bỏ qua intro; **Skip** (`ESC/SPACE/ENTER` + nút UI, tắt audio mượt `<=250ms`); **Fallback lỗi media** chuyển êm vào `GameScene.startAct0Intro()` chống màn đen; **Subtitle `.vtt`** không tràn dấu tiếng Việt; **Reduced Motion** (`SettingsManager.isReducedMotionPreferred()`) tắt pan/rung chuyển sang crossfade tĩnh `>=400ms`; **Audio Settings** đồng bộ `masterVolume`, `musicVolume`, `sfxVolume`, `isMuted`; **Control Handoff** tại `Fog Crossing (120, 195)` giữ nguyên `memoryAwakeningStage = 0`, HUD `🌲 Lữ Khách Rêu Phong` và `Save Schema 3`.

---

## 2. Manifest Ứng Viên & Quy Cách Xuất Bản Hậu Phê Duyệt (`§9`, `§10`)

Chi tiết manifest preproduction: [OPENING_CINEMATIC_PREPROD_MANIFEST.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/OPENING_CINEMATIC_PREPROD_MANIFEST.json).

- **Thư mục xuất dự kiến sau phê duyệt (ngoài runtime `public/assets/`):** `HOLLOW_WOODS_EXPORT/Cinematics/Opening_V1/` (không đưa vào `public/assets/` trước `A09`, không ghi đè asset cũ).
- **Thông số ứng viên chờ Owner duyệt (chưa xem là spec cuối & chưa render trước gate):**
  - `HOLLOW_WOODS_OPENING_CINEMATIC_V1_MASTER.mp4` — Master archive (`4K 60fps` chỉ dùng nếu quy trình pixel-integer / vector nguồn đáp ứng thật, không tự nhận upscale là native 4K).
  - `HOLLOW_WOODS_OPENING_CINEMATIC_V1_GAME_READY.mp4` — Runtime candidate (`1080p`, `30fps` hoặc `60fps`, `H.264 MP4 yuv420p` kiểm tra tương thích trình duyệt & dung lượng).
  - `HOLLOW_WOODS_OPENING_CINEMATIC_V1_SUBTITLES_VI.vtt` — Bản dự thảo đã tạo trong thư mục Evidence để đối chiếu duyệt câu chữ.
  - `OPENING_CINEMATIC_MANIFEST.json` & `SHA256SUMS.txt` — Sẽ đo thực tế và ghi checksum ngay khi video thật được render sau Owner Approval.

---

## 3. Kiểm Định QA Preproduction vs Media Production (`§11`, `A08-T01`..`A08-T12`)

| Test ID | Hạng mục kiểm tra | Trạng thái | Ghi chú thực tế |
| :--- | :--- | :---: | :--- |
| **`A08-T01`** | Storyboard đủ `6` shot (`CS01–CS06`) | **PASS** | Đủ 6 shot × 17 trường spec + 7 tệp hình keyframe trong `Visuals/HW-V16-A08/`. |
| **`A08-T02`** | Thời lượng khớp mục tiêu `28` giây (`DEC-LOCK-20`) | **PASS** | `4s + 5s + 5s + 5s + 5s + 4s = 28.0s` (gồm chuyển tiếp gameplay live ở `CS06`). |
| **`A08-T03`** | Không tiết lộ thân phận | **PASS** | `0` chuỗi `Meliodas`, `Wolf Lord`, `Tổng Chỉ Huy`, `Vaelen`, `Mordric` trong keyframe/subtitle/narration. |
| **`A08-T04`** | Không mâu thuẫn Canon (`DEC-LOCK-01..23`) | **PASS** | Giữ nguồn gọi `UNKNOWN`, không `Algiz`/tái sinh/chốt năm/`7 hồi chuông`, đánh dấu `CREST DRAFT`. |
| **`A08-T05`** | Artwork đúng phiên bản | **PASS** | Dùng `01_LATEST_ARTWORK` (`Black Knight V2`), giữ `02_CURRENT_RUNTIME` chỉ để kiểm tương thích; không dùng legacy/robot placeholder. |
| **`A08-T06`** | Không dùng asset chưa xác minh license | **PASS** | Xác minh `LICENSE_AND_CREDITS.md` (Fellor + Kyoshiro Studio) và `AUDIO_INTEGRATION_PLAN.md` (`65` runtime files); không dùng pack chưa kiểm. |
| **`A08-T07`** | Subtitle đồng bộ video thật | **`NOT RUN`** | Chờ Owner duyệt gate (`§8`) để render MP4 thật mới đo sync thực tế. |
| **`A08-T08`** | Không nhấp nháy hoặc lỗi frame MP4 | **`NOT RUN`** | Chờ pha render sau phê duyệt (`§9`). |
| **`A08-T09`** | Audio mix rõ, không clipping (`-18..-20 LUFS`) | **`NOT RUN`** | Chờ chốt Narration/Music track & render master sau phê duyệt. |
| **`A08-T10`** | Codec, FPS, resolution & duration đo từ file xuất | **`NOT RUN`** | Chưa render file MP4 chính thức trước Owner Gate. |
| **`A08-T11`** | Browser playback candidate (`H.264 yuv420p`) | **`NOT RUN`** | Chờ bản `GAME_READY.mp4` sau phê duyệt. |
| **`A08-T12`** | `SHA-256` & Export Integrity của media xuất | **`NOT RUN`** | Chỉ tạo `SHA256SUMS.txt` khi media xuất tồn tại sau phê duyệt. |

---

## 4. Danh Sách Tệp Bàn Giao (`Deliverables`)

- [HW_V16_A08_STORYBOARD_APPROVAL.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A08_STORYBOARD_APPROVAL.md)
- [HW_V16_A08_OPENING_CINEMATIC_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V16/HW_V16_A08_OPENING_CINEMATIC_REPORT.md)
- `Read/V1.5/Reports/Evidence/HW-V16-A08/`: [OPENING_CINEMATIC_PREPROD_MANIFEST.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/OPENING_CINEMATIC_PREPROD_MANIFEST.json), [SOUND_CUE_SHEET.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/SOUND_CUE_SHEET.json), [A09_INTEGRATION_CONTRACT.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/A09_INTEGRATION_CONTRACT.json), [HOLLOW_WOODS_OPENING_CINEMATIC_V1_SUBTITLES_VI.vtt](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A08/HOLLOW_WOODS_OPENING_CINEMATIC_V1_SUBTITLES_VI.vtt)
- `Read/V1.5/Reports/Visuals/HW-V16-A08/`: [A08_STORYBOARD_BOARD_6SHOTS.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A08/A08_STORYBOARD_BOARD_6SHOTS.png) và `CS01`..`CS06` `.png`

**HARD STOP ENFORCED:** Dừng tại **Owner Approval Gate (`§8`)** — không sản xuất video chính thức, không chỉnh sửa `SaveManager`, `GameScene`, `AudioManager` hoặc chạy `A09` trước khi Owner phê duyệt gói preproduction này.
