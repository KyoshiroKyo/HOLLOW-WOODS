# BÁO CÁO KỸ THUẬT BƯỚC 12: TÍCH HỢP ÂM THANH & CẤU HÌNH AUDIO MANAGER CHUẨN V1.4
**HOLLOW WOODS V1.4 (The Fog That Remembers)**  
*Ngày hoàn thành:* 18/11/2026  
*Trạng thái:* HOÀN TẤT & ĐẠT CHUẨN TOÀN DIỆN (Zero 404, Zero Orphan Loops, Typecheck 100%)

---

## 1. TỔNG QUAN HỆ THỐNG ÂM THANH V1.4

Dựa trên kết quả rà soát từ `docs/v1.4/08_sound_effects_mapping.md`, hệ thống âm thanh HOLLOW WOODS V1.4 đã được nâng cấp toàn diện từ kiến trúc âm thanh tổng hợp đa tầng (Web Audio API Synthesizer) sang kiến trúc lai (Hybrid Sampled + Procedural Fallback Engine). 

Hệ thống bổ sung **29 tệp âm thanh thực nghiệm chất lượng cao (WAV 44.1kHz 16-bit & High-Bitrate MP3)** được trích xuất và chuẩn hóa từ kho lưu trữ `Sound_Effects/Horror SFX/`, đặt tại thư mục tĩnh:
`public/assets/audio/sfx/v14/`

Toàn bộ các âm thanh này được tải trước tại `src/scenes/PreloadScene.ts` (Category 13: V1.4 High-Fidelity Audio Assets) và tự động đồng bộ bộ đệm Web Audio (`AudioBuffer`) tại `src/audio/AudioManager.ts` thông qua cơ chế `syncWithPhaserCache()`.

---

## 2. PHÂN TẦNG ÂM LƯỢNG (GAIN / BUS MIXING HIERARCHY)

Để đảm bảo không khí kinh dị sinh tồn đặc trưng, không bị chói tai hay lấn át thông tin thính giác quan trọng, cấu trúc Gain Node của AudioManager được phân tầng chuẩn hóa như sau:

| Tầng Bus / Kênh Âm Thanh | Phạm Vi Gain Chuẩn | Mức dB Tương Đương | Cấu Hình Runtime & Mục Đích Kỹ Thuật |
| :--- | :---: | :---: | :--- |
| **Master Bus** | `1.00` | 0 dB | Tuyến tính toàn hệ thống, gắn bộ kiểm soát âm lượng tổng của người chơi. |
| **Ambient & Weather Loop** | `0.20 – 0.30` | -14 dB đến -10 dB | Giá trị mặc định: `0.25`. Duy trì tiếng gió rít rừng sâu, côn trùng đêm, tiếng nước rỉ đầm lầy u ám nhưng không lấn tiếng bước chân và tín hiệu cảnh báo. |
| **Surface Footsteps & Foley** | `0.25 – 0.40` | -12 dB đến -8 dB | Giá trị cơ sở: `0.32`. Bước chân bùn lầy, sàn gỗ mục, sỏi đá, lá khô và nền cỏ rừng. |
| **Monster Telegraph & Scout Signal** | `0.65 – 0.80` | -4 dB đến -2 dB | Tiếng huýt sáo Goblin Scout (`0.75`), tiếng sói gầm gừ (`0.72`), tiếng bước chân Behemoth (`0.78`), tiếng rít Void Stalker (`0.70`). Ưu tiên độ rõ để người chơi phản xạ kịp thời. |
| **Jumpscare & Boss Awakening** | `0.85 – 1.00` | -1.5 dB đến 0 dB | Tiếng dơi rít cắn (`0.85`), hồn ma thét xé màn đêm (`0.90`), stinger hù dọa (`0.95`), drone Miếu Chuông thức tỉnh (`0.90`). Kích hoạt **Audio Ducking** hạ Ambient xuống 50% trong 1.5s. |

---

## 3. CƠ CHẾ CHUYỂN VÙNG & FADE-IN / FADE-OUT

1. **Crossfade Ambient Chuyển Vùng (Smooth Zone Transitions):**
   - Khi Satyr di chuyển qua ranh giới giữa 17 phân khu (Bellhollow, Drowned Mire, Ancient Grove, Ruined Crypt, Abyssal Chasm, Void Cavern...), AudioManager thực hiện chuyển đổi môi trường qua `setAmbienceZone(zoneId, 2.0)`.
   - Thời gian Crossfade được thiết lập chuẩn **`2.0 giây`** (trong dải khuyến nghị 1.8 – 2.5s), triệt tiêu hoàn toàn hiện tượng "pop/click" âm thanh hoặc ngắt quãng đột ngột.
2. **Boss Awakening Drone Transition:**
   - Khi kích hoạt chạm trán Boss Mire Warden (`triggerMireWardenBossEncounter`): Kênh drone gầm gừ trầm đục fade-in tuyến tính trong **`1.0 giây`** đạt đỉnh gain `0.90`, đồng thời kích hoạt nhịp tim đập dồn dập (Heartbeat interval 550ms) và hạ Ambient nền xuống 50%.
   - Khi phong ấn hoàn tất (`finishMireWardenDefeat`): Drone thực hiện fade-out êm dịu trong **`2.0 giây`** trước khi ngắt kết nối hoàn toàn, trả lại tiếng chuông đồng thanh tẩy `playBronzeBellToll()`.
3. **Suy Giảm Âm Thanh Không Gian (Spatial Attenuation):**
   - Hàm `playSpatialSFX(key, sourceX, sourceY, listenerX, listenerY, maxRadius, baseVolume)` tính toán khoảng cách Euclidean:
     $$\text{Volume} = \text{baseVolume} \times \max\left(0, 1 - \frac{\text{distance}}{\text{maxRadius}}\right)$$
   - Tín hiệu quái vật ở rìa màn hình (bán kính 300 – 450px) suy giảm chân thực theo khoảng cách, giúp định vị phương hướng nguy hiểm.

---

## 4. CƠ CHẾ CHỐNG LẶP (ANTI-REPETITION) & GIỚI HẠN KÊNH (POLYPHONY)

1. **Pitch & Volume Jitter Ngẫu Nhiên:**
   - Mọi âm thanh Foley bước chân và quái vật đều đi qua bộ biến thiên tham số âm học `applyJitter(baseVol, 0.10, 0.92, 1.08)`:
     * **Pitch Jitter (Tần số phát lại):** `playbackRate` biến thiên ngẫu nhiên trong khoảng $[0.92, 1.08]$ (±8%).
     * **Volume Jitter (Cường độ):** Biên độ âm lượng biến thiên ngẫu nhiên trong khoảng $[0.90, 1.10] \times \text{baseVolume}$ (±10%).
2. **Thuật Toán Trộn Bề Mặt Không Lặp (No-Repeat Shuffle):**
   - Đối với các bề mặt có $\ge 2$ file âm thanh (`mud_1`/`mud_2`, `wood_1`/`wood_2`, `stone_1`/`stone_2`), hàm `getNoRepeatSample(sampleKeys)` lưu giữ mẫu vừa phát gần nhất và loại trừ nó trong lần kích hoạt kế tiếp. Điều này loại bỏ hoàn toàn cảm giác "bước chân máy móc".
3. **Quản Lý Polyphony & Cooldown Kênh:**
   - **Kênh bước chân:** Polyphony tối đa = 3 kênh song song. Cooldown tối thiểu giữa 2 bước chân = **`120ms`** (ngăn chặn tình trạng spam bước chân khi chạy nhanh hoặc va chạm góc tường).
   - **Kênh quái vật:** Polyphony tối đa = 2 kênh đồng thời (`maxPolyphony = 2`), tự động ngắt âm thanh cũ nhất nếu có tiếng gầm mới xuất hiện.
   - **Ambush Lockout (Chống dồn dập Jumpscare):** Khóa an toàn **`3.0 giây`** (`lastAmbushTriggerTime`) giữa các lần kích hoạt jumpscare dơi/ma, ngăn chặn người chơi bị hoảng loạn âm thanh quá mức hoặc lỗi audio spike.

---

## 5. BẢNG DANH MỤC 29 FILE ÂM THANH THỰC TẾ & MAPPING V1.4

| STT | Audio Key (AudioManager) | Tệp Nguồn Gốc | Thư Mục Triển Khai (`public/assets/...`) | Định Dạng | Vai Trò & Điểm Kích Hoạt |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `sfx_step_mud_1` | `Blood Splat Mud 1.wav` | `audio/sfx/v14/footstep_mud_1.wav` | WAV 44.1k | Bước chân bùn lầy Đầm Lầy Chìm |
| 2 | `sfx_step_mud_2` | `Blood Splat Mud 2.wav` | `audio/sfx/v14/footstep_mud_2.wav` | WAV 44.1k | Bước chân bùn lầy Đầm Lầy Chìm (Biến thể 2) |
| 3 | `sfx_step_wood_1` | `Wood Floor Creak 1.wav` | `audio/sfx/v14/footstep_wood_1.wav` | WAV 44.1k | Bước chân cầu gỗ / Hầm rượu làng |
| 4 | `sfx_step_wood_2` | `Wood Floor Creak 2.wav` | `audio/sfx/v14/footstep_wood_2.wav` | WAV 44.1k | Bước chân cầu gỗ / Hầm rượu làng (Biến thể 2) |
| 5 | `sfx_step_stone_1` | `Stone Footstep 1.wav` | `audio/sfx/v14/footstep_stone_1.wav` | WAV 44.1k | Bước chân Tàn Tích Hầm Mộ Cổ / Vực Thẳm |
| 6 | `sfx_step_stone_2` | `Stone Footstep 2.wav` | `audio/sfx/v14/footstep_stone_2.wav` | WAV 44.1k | Bước chân Tàn Tích Hầm Mộ Cổ (Biến thể 2) |
| 7 | `sfx_step_leaves_1` | `Leaves Rustle Footstep 1.mp3` | `audio/sfx/v14/footstep_leaves_1.mp3` | MP3 320k | Bước chân lá mục Outer Woods / Rừng Cổ |
| 8 | `sfx_bat_flap` | `Monster Insect Flap 1.wav` | `audio/sfx/v14/bat_flap.wav` | WAV 44.1k | Tiếng vỗ cánh bầy dơi mai phục |
| 9 | `sfx_bat_screech` | `Monster Insect Screech 1.wav`| `audio/sfx/v14/bat_screech.wav` | WAV 44.1k | Tiếng rít đàn dơi lao vào cắn |
| 10 | `sfx_bat_bite` | `Bite Crunch 1.wav` | `audio/sfx/v14/bat_bite.wav` | WAV 44.1k | Tiếng cắn gây sát thương sinh lực |
| 11 | `sfx_ghost_moan` | `Ghost Moan 1.wav` | `audio/sfx/v14/ghost_moan.wav` | WAV 44.1k | Tiếng rên rỉ u uất của Hồn Ma |
| 12 | `sfx_ghost_whisper` | `Ghost Whisper 1.wav` | `audio/sfx/v14/ghost_whisper.wav` | WAV 44.1k | Tiếng thì thầm hư ảo hạ Bình Tâm |
| 13 | `sfx_ghost_scream` | `Ghost Scream 1.wav` | `audio/sfx/v14/ghost_scream.wav` | WAV 44.1k | Tiếng hét kinh hoàng khi hồn ma áp sát |
| 14 | `sfx_ghost_dissipate`| `Ghost Dissipate 1.wav` | `audio/sfx/v14/ghost_dissipate.wav` | WAV 44.1k | Tiếng tan biến vào làn sương mù |
| 15 | `sfx_jumpscare_stinger`| `Horror Impact Stinger 1.wav`| `audio/sfx/v14/jumpscare_stinger.wav`| WAV 44.1k | Âm stinger giật bắn người khi bị phục kích |
| 16 | `sfx_sanity_gasp` | `Breath Gasp Choke 1.wav` | `audio/sfx/v14/sanity_gasp.wav` | WAV 44.1k | Tiếng thở dốc nghẹn ngào khi Sanity sụt |
| 17 | `sfx_scout_whistle` | `Whistle High Creepy 1.wav` | `audio/sfx/v14/scout_whistle.wav` | WAV 44.1k | Tiếng huýt sáo trinh sát Goblin Scout |
| 18 | `sfx_dagger_slash` | `Blade Slash Fast 1.wav` | `audio/sfx/v14/dagger_slash.wav` | WAV 44.1k | Tiếng dao găm chém chớp nhoáng |
| 19 | `sfx_wolf_growl` | `Wolf Growl Low 1.wav` | `audio/sfx/v14/skull_wolf_growl.wav` | WAV 44.1k | Tiếng gầm gừ từ xa của Skull Wolf |
| 20 | `sfx_wolf_snarl` | `Wolf Snarl Attack 1.wav` | `audio/sfx/v14/skull_wolf_snarl.wav` | WAV 44.1k | Tiếng cắn xé tấn công của Skull Wolf |
| 21 | `sfx_behemoth_roar` | `Beast Roar Deep 1.wav` | `audio/sfx/v14/behemoth_roar.wav` | WAV 44.1k | Tiếng rống địa chấn của Behemoth |
| 22 | `sfx_behemoth_thud` | `Ground Stomp Heavy 1.wav` | `audio/sfx/v14/behemoth_thud.wav` | WAV 44.1k | Tiếng dộng đất rung chuyển của Behemoth |
| 23 | `sfx_void_drone` | `Dark Drone Rumble 1.wav` | `audio/sfx/v14/void_stalker_drone.wav`| WAV 44.1k | Tiếng ù rền bóng tối của Void Stalker |
| 24 | `sfx_void_screech` | `Dark Shrill Screech 1.wav` | `audio/sfx/v14/void_stalker_screech.wav`| WAV 44.1k | Tiếng rít vô diện của Void Stalker |
| 25 | `sfx_boss_drone` | `Boss Summon Drone 1.wav` | `audio/sfx/v14/boss_drone.wav` | WAV 44.1k | Drone trầm Miếu Chuông thức tỉnh |
| 26 | `sfx_rune_shift` | `Stone Rune Slide 1.wav` | `audio/sfx/v14/rune_shift.wav` | WAV 44.1k | Tiếng dịch chuyển đá phong ấn cổ ngữ |
| 27 | `sfx_bell_toll_low` | `Bronze Bell Resonance 1.wav`| `audio/sfx/v14/bell_toll_low.wav` | WAV 44.1k | Tiếng chuông đồng vang vọng thanh tẩy |
| 28 | `sfx_chest_creak` | `Old Chest Open 1.wav` | `audio/sfx/v14/chest_creak.wav` | WAV 44.1k | Tiếng mở rương báu cổ xưa |
| 29 | `sfx_journal_page` | `Page Turn Rustle 1.wav` | `audio/sfx/v14/journal_page.wav` | WAV 44.1k | Tiếng lật trang nhật ký cổ cốt truyện |

---

## 6. KIỂM THỬ TÍCH HỢP & DỌN DẸP BỘ NHỚ (ZERO ORPHAN LOOPS & ZERO 404)

1. **Preload & Đăng Ký Hệ Thống:**
   - 29 file audio đều được khai báo chính xác trong `PreloadScene.ts` với tiền tố đường dẫn `assets/audio/sfx/v14/`.
   - Tất cả 29 audio key đều được đăng ký trong danh sách mẫu của `AudioManager.preloadSampledAudio()` và `syncWithPhaserCache()`.
   - Kết quả: Không có bất kỳ cảnh báo 404 missing audio file nào trong bảng điều khiển console.
2. **Dọn Dẹp Triệt Để Vòng Lặp Âm Thanh (Orphan Loops Cleanup):**
   - Tại `AudioManager.cleanupAudioLoops()` và `stopAll()`: Toàn bộ `duckTimer`, `heartbeatTimer`, `bossDroneSource`, và `bossDroneGain` đều được ngắt kết nối và giải phóng bộ nhớ Web Audio API khi chuyển scene hoặc tải lại file lưu (`SaveManager.loadGame`).
   - Tại `GameScene.finishMireWardenDefeat()` và sự kiện `shutdown`: Tự động gọi `this.audioManager.setBossAwakeningState(false)` và `cleanupAudioLoops()`, triệt tiêu hoàn toàn lỗi âm thanh lặp vô hạn (drone loop) sau khi đánh bại boss hoặc thoát game.
3. **Tính Toàn Vẹn Mã Nguồn:**
   - Đã kiểm tra `npx tsc --noEmit`: 0 lỗi type.
   - Đã biên dịch sản xuất `npm run build`: Hoàn tất thành công, các chunk bundle được tạo gọn gàng.
   - Ràng buộc không can thiệp cấu trúc bản đồ hay chỉ số quái vật được tuân thủ nghiêm ngặt 100%.

---
*Tài liệu kỹ thuật được lưu trữ tại:* `docs/v1.4/09_audio_integration_report.md`  
*Hệ thống sẵn sàng vận hành trên nhánh:* `feat/v1.4-expansion`