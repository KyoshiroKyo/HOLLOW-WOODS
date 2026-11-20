# BÁO CÁO HOÀN THÀNH BƯỚC V152-02 — HOLLOW WOODS v1.5.2

## 1. Nguyên nhân gốc
- **Tập tin rác ở thư mục gốc:** Tồn đọng 3 tệp `.bak` lịch sử (`index.html.v15_48.bak`, `package.json.v15_53.bak`, `README.md.v15_54.bak`).
- **Thiếu khóa SFX/Ambience:** 4 tệp âm thanh thực tế (`herb_gather.wav`, `monster_step.mp3`, `rune_resonance.mp3`, `rune_error.mp3`) tồn tại trong asset nhưng chưa được đăng ký vào manifest; hai ambience `ambience_mire` và `ambience_crossing` để ở lazy manifest khiến dễ bị rơi vào nhiễu nâu procedural.
- **Xung đột / Giật âm lượng BGM:** Quá trình chuyển track/suppress/duck BGM tạo `window.setInterval` mới mà không hủy interval ramp trước đó của `currentBGMAudio`, gây đè lệnh volume giật cục.
- **Rò rỉ âm thanh mưa:** `stopAmbience(false)` chỉ xử lý fade out cho kênh ambience chính mà bỏ sót fade-out và cleanup `rainSource`/`rainGain`.
- **Âm thanh Trạm Lửa Sir Vaelen chưa cô lập:** Khi đứng bên đốm lửa, tiếng mưa rừng, gió rít hoặc nhịp tim/ảo giác vẫn xen lẫn, làm mất đi sự thanh tịnh, ấm áp đặc trưng của khu bảo trợ.

## 2. Danh sách file/dòng đã sửa
- **Thư mục gốc:**
  - Di chuyển 3 file `.bak` vào `Backups/steps/backup_v152_02/root_bak/`.
- **`src/audio/AudioManager.ts`:**
  - Dòng 40–121: Thêm `herb_gather`, `monster_step`, `ambience_mire`, `ambience_crossing` vào `CORE_SFX_MANIFEST`. Thêm `runestone`, `runestone_err` vào `LAZY_SFX_MANIFEST`. Gắn `runestone` và `runestone_err` vào `ZONE_SFX_MAP` cho `silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`.
  - Dòng 145: Thêm `private activeBGMRampInterval: number | null = null;`, `private isSanctuaryMusicOnly: boolean = false;`.
  - Dòng 970+: Bổ sung kiểm tra `isSanctuaryMusicOnly` trong `setAmbienceZone`.
  - Dòng 1240–1330: Cập nhật `stopAmbience(false)` hạ âm và ngắt `rainSource`/`rainGain` sau 700ms.
  - Dòng 1360–1540: Chèn `window.clearInterval(this.activeBGMRampInterval)` trước khi tạo ramp mới trong `playBGM`, `stopBGM`, `setBGMSuppressed`, `setSanityDucking`, `stopAll`, `destroy`.
  - Dòng 1500–1530: Thêm phương thức `isSanctuaryActive()` và `setSanctuaryMusicOnly(active, fadeDuration)`.
  - Dòng 1575+, 2595+, 3163+, 3201+: Chặn nhịp tim, ảo giác (`playCrackedBellToll`, `playFalseFootsteps`), và gió rít (`playWindWhoosh`) khi đang ở chế độ Sanctuary.
- **`src/systems/CampSanctuarySystem.ts`:**
  - Thêm `import { AudioManager } from '../audio/AudioManager';`.
  - Thêm phương thức `isSanctuaryMusicOnly()` và `updateSanctuaryAudio(playerX, playerY, zoneId)`.
- **`src/scenes/GameScene.ts`:**
  - Dòng 2547–2560: Tích hợp `this.audioManager.setSanctuaryMusicOnly(true, 1.2)` khi đứng trong Trạm Lửa Sir Vaelen (1470, 710 / 1435, 705 bán kính 180px) và `setSanctuaryMusicOnly(false, 1.2)` khi rời khỏi.

## 3. Kết quả chạy kiểm thử
- `npx tsc --noEmit`: **0 lỗi** (Exit code 0).
- `node scripts/test_v15_39_bgm_system.mjs`: **29/29 PASSED**.
- `node scripts/test_v15_fix_02_audio.mjs`: **12/12 PASSED**.
- `node scripts/test_v152_02_audio_sanctuary.mjs`: **22/22 PASSED**.
