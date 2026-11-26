# HW-NARRATIVE-00G — AUDIO INTEGRATION PLAN (`AUDIO BIBLE & V12.2 ALIGNMENT`)

- **Mission:** `HW-NARRATIVE-00G — CHARACTER ART, OPENING CUTSCENE & AUDIO PLAN`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** `DESIGN PLANNING ONLY` (`0` thay đổi `AudioManager.ts`, `0` sửa/thay thế/xóa tệp trong `public/assets/audio/` hay `HOLLOW_WOODS_EXPORT/Sound_Effects/`)
- **Dependencies:** `Unified Edition Ch. 13` (`AUD-K12`, `NAR-028`, `NAR-029`, `NR-07`), `HW-NARRATIVE-00E` ([HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md)), `HW-NARRATIVE-00F` ([HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_NEW_KNIGHT_ASSET_EVALUATION_REPORT.md))
- **Verified Audio Inventory & Runtime Engine:** [AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts) (`3,976` dòng), [HW_AUDIO_ASSET_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_AUDIO_ASSET_INDEX.json) (`1,281` entries: `65` runtime + `1,216` source), `public/assets/audio/` (`65` tệp).

---

## 1. Phân Định Chuẩn Nghệ Thuật: Đã Duyệt vs `TRAILER-ONLY` vs Khoảng Trống

| Hạng mục âm thanh | Trạng thái | Kết quả đối chiếu từ nguồn & `00E` |
| :--- | :---: | :--- |
| **Chất lượng nghệ thuật Trailer `V12.2`** | **ĐÃ ĐƯỢC OWNER KHEN / DUYỆT HƯỚNG TRAILER** | Owner đánh giá rất cao âm thanh `HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4` (`-18.0 LUFS`, `LRA 12.1 LU`, bỏ chuông lặp ở `14–24s` `-5.9 dB`, bỏ chuông ở 5s outro). |
| **Áp dụng nguyên track Trailer `60s` vào game** | **`CẤM / REJECTED`** | Tệp [HOLLOW_WOODS_V12_2_CINEMATIC_SOUNDTRACK.mp3](file:///G:/HOLLOW%20WOODS/HW/Trailer/Video%20Game%20Trailer/v12/HOLLOW_WOODS_V12_2_CINEMATIC_SOUNDTRACK.mp3) (`01:00.00`, `48kHz stereo 320kb/s`, SHA-256 `6ed521e4...`) là bản trộn *mixdown* một khối — **chưa có các stem tách rời** trong container/workspace. **KHÔNG loop 60s trailer trong gameplay** (`AUD-K12`). |
| **Hệ thống âm thanh runtime hiện hành (`65` tệp)** | **`GAME-IMPLEMENTED` (Bảo toàn)** | `5` BGM MP3, `4` Ambience MP3, `6` Dialogue WAV, `50` SFX (`sfx/` + `sfx/v14/`), Master DynamicsCompressor + Sanctuary isolation ([V152_02_AUDIO_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/V152_02_AUDIO_REPORT.md)). |

---

## 2. Kiểm Kê & Kế Hoạch Tích Hợp Theo `5` Nhóm Âm Thanh (`Ch. 13` & `AudioManager.ts`)

### 2.1 BGM — Nhạc Nền & Motif `D–F–E–A` (`NAR-028`)
**Hiện có trong `public/assets/audio/bgm/` (`BGM_MANIFEST` từ gói `The Knights Quiet Fire` trong `HOLLOW_WOODS_EXPORT/Sound_Effects/Music/`):**
- `bgm_knights_quiet_fire` (`knights_quiet_fire.mp3` ← `A Quiet Hearth - Gates of Vortalania.mp3`): Dùng cho Trạm Lửa Vaelen & Ending.
- `bgm_embervale` (`embervale.mp3`): Đêm trạm lửa / không khí tĩnh.
- `bgm_beyond_the_hills` (`beyond_the_hills.mp3`): Outer Woods ban ngày.
- `bgm_evergrove` (`evergrove.mp3`): Whispering Clearing & rừng sâu dịu.
- `bgm_forgotten_orchard` (`forgotten_orchard.mp3`): Xưởng chuông / Hầm rễ / Khoảng ký ức lore.

**Kế hoạch nghiên cứu tích hợp thêm từ chuẩn `V12.2` (`NR-07` — Chưa sửa code):**
1. **Tách/sản xuất 4 stem & loop riêng theo motif `D–F–E–A`** *(khi Owner bàn giao file dự án DAW / stem gốc từ quy trình `V12.2`, `OQ-20`)*:
   - `bgm_prologue_memory` *(Stem Piano `D–F–E–A` thưa, ~30s seamless loop hoặc one-shot synced cho `CS01–CS06`)*.
   - `bgm_vaelen_oath_cello` *(Stem Cello lời thề hòa hợp/crossfade mượt tại trạm lửa mà vẫn giữ được độ tĩnh của `Sanctuary`)*.
   - `bgm_dark_knight_dissonance` *(Biến tấu hòa âm tối trên cùng motif `D–F–E–A` khi gặp `Dark Knight` / `HoodedKnightBoss`)*.
   - `bgm_ending_unbroken` *(Piano + Cello + Đàn dây + Gió theo `Ending Bible`, tuyệt đối không chèn chuông lặp liên tục sau nghi thức mở đầu)*.
2. **Bảo toàn kỷ luật crossfade & slider:** Mọi track mới đều phải đi qua bus BGM (`HTMLAudioElement` / `AudioParam` ramp kèm `clearInterval(activeBGMRampInterval)` đã kiểm ở `V152-02`) và tuân thủ slider Master / Music / BGM hiện có.

### 2.2 Ambience — Âm Thanh Môi Trường Đa Tầng (`AmbienceZone`)
**Hiện có trong `public/assets/audio/ambience/`:** `ambience_crossing.mp3`, `ambience_village.mp3`, `ambience_forest.mp3`, `ambience_mire.mp3` kết hợp lớp gió/mưa procedural + `updateVeilFilter(inDeepFog, composure)` trong `AudioManager.ts:743`.

**Kế hoạch tối ưu theo từng vùng (`Table 13` / `Ch. 13`):**
- **`fog_crossing` & Rừng sâu:** Giữ nền gió/sương loãng; chống re-trigger lặp lại cue mở đầu mỗi lần người chơi bước qua ranh giới chuyển vùng (`zone transition debounce`).
- **`bellhollow` & Đọc Lore / Nhật Ký (`[J]` / Torn Page):** Bổ sung cơ chế **Focus Attenuation** (hạ nhẹ tầng gió/ambience `-4` đến `-6 dB` trong `600ms` khi mở bảng đọc dài) giúp tập trung đọc mà không tắt hẳn thế giới.
- **Trạm Lửa `Sir Vaelen` (`CampSanctuarySystem`):** Bảo toàn tuyệt đối chế độ `isSanctuaryMusicOnly` (`V152-02`): chặn tiếng mưa bão, nhịp tim, tiếng gió rít và ảo giác khi đứng trong vòng bảo vệ `180px` quanh lửa trại.
- **Vùng `The Veil` / Tâm lý thấp (`Classic Sanity 2.1`):** Giữ sự tách bạch giữa `ambience` với bộ `updateDynamicHeartbeat` để người chơi không bị dội âm ù rè kéo dài.

### 2.3 Tiếng Chuông (`Bell Cues`) — Sửa Bất Cập Độ Dài Asset Hiện Hành (`NAR-029`)
**Phát hiện kỹ thuật đã đo trực tiếp:**
- `bronze_bell` ([bell_low.mp3](file:///G:/HOLLOW%20WOODS/public/assets/audio/sfx/bell_low.mp3)) & `bell_toll_low` ([bell_toll_low.wav](file:///G:/HOLLOW%20WOODS/public/assets/audio/sfx/v14/bell_toll_low.wav): `2ch 48kHz`, **thời lượng thực đo tới `11.222s`**!).
- Khi `startAct0Intro()` (`GameScene.ts:1417`) hoặc sự kiện sương/đêm phát chuông `11.2s` chồng lên BGM/Ambience dễ tạo cảm giác nặng nề kéo dài, trái với tinh chỉnh đã được Owner khen ở `V12.2` (`NAR-029`).

**Đặc tả Cue Chuông mới cho `NR-07`:**
1. **`sfx_bell_short_fade` (~`2.6–2.8s` one-shot có *tail fade-out* mượt):** Biên tập cắt & fade từ nguồn chuẩn `48kHz` (không đè mất `bell_toll_low.wav` gốc). Dùng riêng cho **Prologue `CS03`**, cue báo ranh giới sương lúc đầu game, và chuyển nhịp nhẹ — đảm bảo **không bao giờ phát đè nhau** (giữ cooldown tối thiểu `2,500–3,000 ms`).
2. **Bảo toàn 2 tiếng chuông nghi thức Ending (`EndingSystem.ts:313-317`):**
   - `true_ending` & `sacrifice_ending`: Giữ `playBronzeBellToll()` đúng lúc đánh **First Toll**, sau đó **nhạc kết chuyển sang `bgm_ending` không kèm tiếng chuông lặp lại**.
   - `fog_loop_ending` & cảnh báo sương nứt: Giữ `playCrackedBellToll()` (`in-game procedural / bell_toll_low`), tuyệt đối giữ chặn không phát bên trong Trạm Lửa Vaelen (`!this.isSanctuaryMusicOnly`).

### 2.4 Âm Thanh Hội Thoại (`Dialogue Audio` — Khắc Phục Khoảng Trống Kỵ Sĩ)
**Hiện có trong `public/assets/audio/dialogue/` & `AudioManager.ts:2287-2359`:**
- `DialogueSystem.ts:167` gọi `playNPCSpeech(speaker)` cho `5` dân làng Bellhollow (`dialogue_garth.wav` `0.336s`, `dialogue_edda.wav` `0.350s`, `dialogue_neris.wav`, `dialogue_bram.wav`, `dialogue_finn.wav`).
- `DialogueSystem.ts:197` gọi `playDialogueBlip()` (`dialogue_text_blip.wav` `0.449s`, cooldown `45ms`) cho nhịp gõ từng ký tự.
- **Khoảng trống phát hiện:**
  1. Khi nói chuyện với **Sir Vaelen** (`17` keys!) hoặc **Hooded Knight / Sir Mordric**, `playNPCSpeech()` hiện rơi mặc định về `dialogue_garth` — khiến giọng hiệp sĩ trùng với người gác cổng!
  2. Chưa có giọng gợi ý riêng cho **`Sir Roderick`**, **`Sir Aldemar`**, hay âm rền uy nghiêm cho **`The Headless Warden`**.
  3. Nguồn nội bộ [Super_Dialogue_Audio_Pack_v1/](file:///G:/HOLLOW%20WOODS/HOLLOW_WOODS_EXPORT/Sound_Effects/Voice_Dialogue/NPCs/Super_Dialogue_Audio_Pack_v1/) (`CC BY 4.0 — Dillon Becker`) trong kho đã có sẵn các diễn viên lồng tiếng khác nhau (`Alex Brodie`, `Ian Lampert`, `Sean Lenhart`, `Karen Cenon`, `Meghan Christian`) — hoàn toàn đủ để tuyển thêm slot `dialogue_vaelen`, `dialogue_dark_knight`, `dialogue_roderick`, `dialogue_aldemar` mà không vi phạm bản quyền.
  4. **Kiểm âm `00E`:** Trailer `V12`/`V12.2` dùng thẻ thoại im lặng (0 voice-over dài), nên giữ lối thiết kế *voice bark ngắn (greeting/grunt/sigh 0.3–0.6s) + typewriter blip nhẹ* thay vì full-sentence VO gây lệch ngôn ngữ Việt/Anh.
- **Quy tắc mix hội thoại:** Khi mở hộp thoại NPC/Story (`DialogueSystem.startDialogue`), tự động giảm nhẹ volume `Ambience / Wind / Rain` khoảng `-3 dB` đến `-5 dB` rồi khôi phục mượt lúc `endDialogue()`.

### 2.5 Cues Điện Ảnh & Combat Mới (`Cinematic, Hộ Tâm & Boss Cues`)
| Bối cảnh / Đối tượng | Cue đề xuất cần nghiên cứu tích hợp (`NR-07`) | Nguồn ứng viên / Yêu cầu bản quyền |
| :--- | :--- | :--- |
| **Vòng Sáng Hộ Tâm `[F]`** | Thêm *sub-harmonic warm chime* rất êm (`320–440Hz` mềm) kèm tiếng bật nhẹ để đồng bộ cảm giác *"cộng hưởng hài hòa"* trong `V12.2` (không chỉ là tiếng công tắc `lantern_toggle.mp3` cơ khí). | Kết hợp `AudioManager` procedural warm chord + sample nhẹ. |
| **Opening Prologue (`CS01–CS06`)** | 1 cue `prologue_oath_pad`, 1 cue `prologue_bell_short_fade` (`2.8s` tại `CS03`), 1 cue chuyển sương `mist_shift_soft` (`CS04`, không jumpscare). | Đồng bộ timeline 28s, tự fade-out nếu người chơi bấm Skip. |
| **Kỵ Sĩ & Hang `Dark Knight` (`V12.2`)** | Khi `Hooded Knight` / `Mordric` niệm lực tím (`Dark Resonance`), kết hợp sub-drone trầm + xung năng lượng cổ ngữ tối (`boss_drone` + `rune_resonance` lọc trầm); không chồng 2 `jumpscare_stinger` liên tiếp. | Đang có `boss_drone.wav`, `rune_shift.wav`; xem xét bổ sung SFX trong gói `Mystic_Autumn_Knights/sounds/` (`27` WAVs) **chỉ sau khi xác minh license `wantosure`**. |
| **`The Headless Warden` (`Boss tương lai`)** | `warden_hoof_heavy`, `warden_ghost_neigh` (hí ma), `warden_spectral_flame` (lửa rền lạnh), `warden_greatsword_cleave`. | **CHƯA ĐƯỢC dùng `skull_wolf_*` hay `behemoth_*` làm tạm lâu dài**; phải tuyển/tổng hợp bộ riêng có ghi manifest trong `AUDIO_SOURCES_MANIFEST`. |

---

## 3. Tiêu Chuẩn Kỹ Thuật Mastering & Nghiệm Thu (`AUDIO QA GATES`)

1. **Định dạng nguồn:** Chuẩn hóa mọi asset mới về **`48 kHz` Stereo** (`WAV` PCM 16-bit/24-bit cho cue ngắn/dialogue hoặc `MP3 192–320 kbps` / `OGG` cho BGM/Ambience dài).
2. **Mức âm lượng gameplay (`Loudness Discipline`):** Trailer `V12.2` mix ở `-18.0 LUFS` (`LRA 12.1 LU`) để nghe điện ảnh; nhưng khi vào game thực tế phải chuẩn hóa mức **tổng BGM/Ambience cân bằng quanh `-20 LUFS` đến `-18 LUFS`**, giữ *headroom* đỉnh dưới `-1.0 dBTP` và chạy qua `masterLimiter` của `AudioManager` để không bao giờ bị clipping khi nhiều enemy/SFX nổ cùng lúc.
3. **Cổng pháp lý (`Zero Unverified Assets`):** Mỗi tệp âm thanh mới trước khi chép vào `public/assets/audio/` bắt buộc có dòng ghi nhận trong `AUDIO_SOURCES_MANIFEST` / `HW_AUDIO_ASSET_INDEX.json` (Tác giả, URL nguồn, Giấy phép thương mại/CC BY, Ngày tải, SHA-256). Đang ghi nhận **`27` WAV trong `Mystic_Autumn_Knights` ở trạng thái chờ xác minh license**.
4. **Hàng đợi kiểm định sau khi tích hợp (`NR-07`):** Xác nhận Zero 404 trong `PreloadScene`/`AudioManager`, kiểm `clearInterval` chống rò rỉ gain ramp, xác minh Trạm Lửa Sir Vaelen vẫn cô lập tiếng bão/nhịp tim 100%, và test tai người thực tế bởi Owner (`BUG-026/027` acceptance gate).
