# BIÊN BẢN KIỂM ĐỊNH TOÀN DIỆN TỪNG BẢN ĐỒ (MAP-BY-MAP QA AUDIT)
## HOLLOW WOODS V1.4 — THE FOG THAT REMEMBERS
**Ngày kiểm toán:** 18/11/2026  
**Nhánh Git:** `feat/v1.4-expansion`  
**Trạng thái kiểm định:** **100% ĐẠT CHUẨN NGHIỆM THU (ALL CHECKS PASSED)**

---

## A. KIỂM TRA CHUNG TOÀN HỆ THỐNG (GLOBAL CHECKS)

| Hạng Mục Kiểm Tra | Tiêu Chuẩn Kỹ Thuật | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :---: |
| **Asset & Path Integrity** | 0 broken texture/audio path. 100% tệp tin tồn tại trên đĩa cứng `public/`. Không còn texture V1.3 cũ gây lệch tông màu. | Toàn bộ 63 asset đồ họa (38 tile/prop V1.4 Dark Woodland) và 29 file audio SFX V1.4 trong `PreloadScene.ts` & `AudioManager.ts` đều tồn tại thực tế và nạp thành công 100%. | **ĐẠT** |
| **Save/Load & Runtime Keys** | Nạp Save V1.3 an toàn không văng game; bảo toàn 100% ID nhiệm vụ, 4 ô trang bị, rương 12 ô, cờ sự kiện và tọa độ nhân vật. | Chạy bộ kiểm thử tự động `verify_v1_4_save_migration.mjs`: Đạt **88/88 testcases (100% PASS)**. Di trú Idempotent 5 lần liên tiếp chống trùng lặp dữ liệu. | **ĐẠT** |
| **Memory & Audio Cleanup** | Chuyển qua lại liên tục giữa 17 bản đồ không rò rỉ texture WebGL; không để sót vòng lặp Ambient/Drone cũ (Zero Orphan Loops). | Hàm `cleanupAudioLoops()` và `setAmbienceZone()` ngắt sạch toàn bộ Web Audio Node, giải phóng timer nhịp tim và timer ducking khi chuyển cảnh hoặc reload game. | **ĐẠT** |

---

## B. CHECKLIST CHI TIẾT THEO TỪNG KHU VỰC BẢN ĐỒ

### 1. Bellhollow (Làng trung tâm — An toàn tuyệt đối)
- [x] **Nền đất & Đường mòn:** Nền đất nện trung tâm, các thềm đá lát quanh Giếng làng, chân Tháp Chuông và đường mòn phía Đông nối sang Crooked Path ghép nối liền mạch, phân định rõ trục giao thông chính của làng.
- [x] **Ánh sáng Hổ Phách:** Bán kính sáng ấm áp từ Lửa Trại Sanctuary và Đèn Lồng Trụ Làng giữ vững cảm giác che chở an toàn, tương phản tách biệt với vùng tối rìa rừng.
- [x] **Phản hồi Bước Chân (Surface Footsteps):** Hàm `detectCurrentTerrain('bellhollow', x, y)` nhận diện chính xác:
  - Quảng trường & Tháp Chuông ($640 \le x \le 1040, 250 \le y \le 450$): Âm thanh đá lát `sfx_step_stone_1/2`.
  - Hiên nhà & xưởng thợ rèn ($y \le 240$): Âm thanh sàn gỗ `sfx_step_wood_1/2`.
  - Thảm cỏ quanh bờ rào ($y \ge 520$ hoặc $x \le 500$): Âm thanh cỏ `sfx_step_grass`.
  - Lối đi còn lại: Âm thanh đất nện `sfx_step_dirt`.
- [x] **Bảo Toàn Thực Thể & An Toàn Sanctuary:**
  - Garth (Người Canh Cổng: 520, 265), Bà Lão Edda (710, 380), Neris (970, 215), Bram (1045, 365), Finn (760, 260), Hiệp Sĩ Canh Lửa (818, 270) đứng đúng vị trí gốc và có va chạm chân 22x14 px.
  - Điểm Lưu Game, Rương Chứa 12 ô, Nồi Thảo Dược, Lò Rèn hoạt động chuẩn xác.
  - Tuyệt đối 0 quái vật bóng tối xuất hiện trong phạm vi làng (`bellhollow`).

---

### 2. Outer Woods (Rừng ngoài / Vành đai)
- [x] **Khớp Nối Chuyển Tiếp (Transition Tile):** Dải ranh giới chuyển đổi mượt mà giữa đất ẩm làng Bellhollow sang rêu phong và lá mục của Rừng Ngoài.
- [x] **Y-Sorting & Occlusion Tán Cây:** Hàm `updateCanopyTransparency(playerX, playerY)` tự động hạ `alpha` của tán cây sồi đại thụ xuống `0.35` khi nhân vật Satyr đi phía sau tán cây, bảo đảm người chơi không bao giờ bị mất dấu nhân vật.
- [x] **Cơ Chế Phục Kích Dơi & Hồn Ma (N3XUS Ambush):**
  - **Dơi Sương Mù (`MistBatAmbushEntity`):** Chỉ xuất hiện vào Hoàng Hôn (`DUSK`) hoặc Đêm (`NIGHT`) khi người chơi chạy nước rút (`isSprinting`) hoặc tắt đèn lồng trong bóng tối. Lao xuống hù dọa, trừ 8 HP, 15 Composure, phát âm thanh dơi rít cắn (`triggerJumpscare('bat')`), sau đó bay vút lên sương mù rút lui (không truy đuổi vô tận). Cooldown: 45 giây.
  - **Hồn Ma Phiêu Bạt (`WanderingShadeEntity`):** Xuất hiện khi Đêm xuống và Bình Tâm < 50%. Lướt xuyên vật cản, hạ 25 Composure và gây sốc nhiệt -15°C. Tan biến ngay khi người chơi bật Đèn Lồng Hổ Phách hoặc chạy vào vòng lửa ấm. Cooldown: 75 giây.

---

### 3. Deep Forest (Rừng sâu)
- [x] **Không Khí Thị Giác & Tầm Nhìn:** Mật độ sương mù dày (`fogDensity: 0.82`), bóng tối sâu (`darkness: 0.85`), nhưng các vệt cỏ xanh rêu và rễ cây phát sáng nhẹ vẫn bảo đảm khả năng nhận diện hướng đi, không gây ức chế điều hướng.
- [x] **Hệ Thống Chạm Trán Shadow Series:**
  - Sói Xương Đêm (`SkullWolfEntity`): Đi tuần theo cặp vào ban đêm, phản ứng với tiếng chạy và tiếng quạ bay; sợ ánh lửa trại.
  - Quạ Bóng Tối (`ShadowCrowEntity`): Báo động khi người chơi áp sát.
  - Mắt Bóng Đêm (`ShadowEyesEntity`): Rình rập trong bụi rậm làm sụt giảm Bình Tâm.
  - Quy tắc phân bổ mật độ tối đa: 5 thực thể; bán kính ngủ đông culling 560 px duy trì mốc 60 FPS mượt mà.
- [x] **Goblin Scout (Kẻ Rình Mập Vô Diện):**
  - Sử dụng tệp sprite silhouette dao găm bóng đêm `goblin_scout_v5_weapons_dagger_1_silhouette.png` (kích thước frame chuẩn 64x64 px) với bộ lọc tím đen ma mị.
  - Đóng vai trò kẻ trinh sát chỉ điểm: Bám theo người chơi ở cự ly an toàn 130 – 180 px, định kỳ huýt sáo rợn gáy (`playMonsterTelegraph('scout_whistle')`) báo động quái vật cấp cao.
  - Khi người chơi chiếu Đèn Lồng hoặc tiến sát dưới 70 px: chém dao chớp nhoáng, ném bom khói và tàng hình lẩn mất vào rừng sâu (`alpha -> 0`). 0 lỗi hiển thị khung hình.

---

### 4. Khu Vực Đầm Lầy (Swamp / Marshlands: `silent_mire` & `drowned_mire_depths`)
- [x] **Nền Đất Bùn Lầy & Ghép Nối:** Tile bùn đen, vũng nước sâu và cỏ lau đầm lầy ghép nối chuẩn seamless, loại bỏ hoàn toàn đường viền hở.
- [x] **Va Chạm Bờ Nước & Lối Đi Ván Gỗ:** Hệ thống ván gỗ nổi và cầu gỗ mục nát dẫn qua đầm lầy có collider biên giới rõ ràng, không gây kẹt góc nhân vật.
- [x] **Âm Thanh Foley & Ambient:**
  - Khi bước trên bùn: phát ngẫu nhiên không lặp lại `sfx_step_mud_1` hoặc `sfx_step_mud_2` với pitch jitter 0.92 – 1.08.
  - Khi bước trên ván gỗ: phát `sfx_step_wood_1/2`.
  - Ambient đầm lầy phát tiếng nước rỉ, côn trùng u tịch ở mức gain 0.25 (-12 dB).
- [x] **Sinh Vật Đầm Lầy:** Sói Xương lội bùn và Chúa Tể Đầm Lầy (`ShadowBehemothBoss`) xuất hiện tại đúng tọa độ sinh cảnh, không spawn đè lên chướng ngại vật.

---

### 5. Khu Rừng Cổ & Tàn Tích Cổ Ngữ (Ancient Grove & Ruins)
- [x] **Hitbox & Occlusion Cây Đại Thụ & Tàn Tích:**
  - Thân cây đại thụ titan, tảng đá cổ và cột đá cổ ngữ có hộp va chạm chân chuẩn xác.
  - Tán cây đại thụ tự động trong suốt khi nhân vật Satyr đi vòng ra phía sau.
- [x] **Cơ Chế Giải Đố Cổ Ngữ (Rune Puzzle):**
  - Trụ Mặt Trăng (`pillar_moon`), Trụ Rễ Cây (`pillar_root`), Trụ Con Mắt (`pillar_eye`) và Bàn Thờ Đá (`stone_altar`) kích hoạt chính xác theo thứ tự.
  - Dữ liệu phong ấn và nhật ký được đồng bộ lưu trữ vào Save data `flags`.
- [x] **Cơ Chế Đánh Thức Boss (Mire Warden Awakening):**
  - Kích hoạt tại Miếu Chuông Vỡ (`broken_bell_shrine`): Rào chắn rễ cổ thụ phong tỏa lối thoát, drone trầm thức tỉnh fade-in 1.0s lên gain 0.90, nhịp tim dồn dập 550ms, ambient ducking 50%.
  - Khi đánh bại Boss: Drone fade-out êm ái 2.0s, tiếng chuông đồng vang vọng thanh tẩy, trao vật phẩm cốt truyện duy nhất [Trái Tim Mạch Rễ Cổ] và danh hiệu [Người Thanh Tẩy Màn Sương].

---

### 6. Khu Vực Bóng Tối / Hang Động Nguồn Gốc (Shadow Origin / Cavern)
- [x] **Ánh Sáng Cục Bộ Trong Môi Trường Tối Sâu:** Phân khu Vực Thẳm (`abyssal_chasm`) và Hang Cội Nguồn Màn Sương (`veil_origin_cavern`) có độ tối cực đại (`darkness: 0.90`). Đèn lồng của Satyr tỏa quầng sáng vàng hổ phách ổn định với bán kính 140 px.
- [x] **Toàn Vẹn Cổng Chuyển Vùng Hai Chiều (Transition Two-Way Alignment):**
  - Đã kiểm tra 39 cổng chuyển vùng của toàn bộ 17 phân khu.
  - **LỖI ĐÃ PHÁT HIỆN & ĐÃ SỬA:** Cổng `to_whispering_clearing_from_wgs` ban đầu có tọa độ `targetSpawn` $(1840, -340)$ chạm vào mép dưới của solid collider `wc_bound_top` ($y: -360..-340$). Đã điều chỉnh dời điểm spawn xuống vị trí an toàn $(1840, -310)$, đồng bộ với `returnPoint` của cổng ngược chiều. Tỷ lệ lỗi collider sau sửa: **0 lỗi (100% Thông Thoáng)**.
- [x] **Mạch Tiến Trình Cốt Truyện `THE FOG THAT REMEMBERS`:** Cơ chế cửa khóa, mảnh ký ức cốt truyện và di vật kích hoạt trơn tru, mở ra bí mật nguồn gốc của The Veil mà không gây kẹt logic game.

---

## C. BẢNG TỔNG HỢP KIỂM ĐỊNH THEO TỪNG BẢN ĐỒ

| STT | Tên Bản Đồ (Zone ID) | Kích Thước (px) | Môi Trường Nền | Âm Thanh & Bề Mặt | Thực Thể & NPC | Trạng Thái QA |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| 1 | `fog_crossing` | $480 \times 360$ | Lối mòn sương mù | Bước chân đất | Điểm bắt đầu game | **PASS** |
| 2 | `bellhollow` | $1120 \times 960$ | Làng trung tâm V1.4 | Gỗ / Đá lát / Đất / Cỏ | 6 NPC cốt lõi, Sanctuary | **PASS** |
| 3 | `sanctuary_farm` | $640 \times 480$ | Nông trại trú ẩn | Đất nện / Luống cây | Đất trồng, đom đóm | **PASS** |
| 4 | `sub_root_cellar` | $640 \times 400$ | Hầm rễ cổ | Sàn ván gỗ | Rương ngầm, Hồn ma | **PASS** |
| 5 | `outer_woods` | $480 \times 480$ | Rừng vành đai | Lá mục / Rêu ẩm | Quạ, Dơi, Sói, Hồn ma | **PASS** |
| 6 | `sub_bell_workshop`| $480 \times 400$ | Xưởng đúc chuông bỏ hoang | Sàn gỗ cũ / Đá | Hồn ma thợ rèn, phế tích | **PASS** |
| 7 | `crooked_path` | $1280 \times 640$ | Lối mòn quanh co | Đất rừng / Cầu gãy | The Listener tuần tra | **PASS** |
| 8 | `sub_whispering_clearing` | $480 \times 360$ | Khoảng rừng thì thầm | Thảm cỏ rậm | Đàn quạ, đom đóm hổ phách | **PASS** |
| 9 | `deep_forest` | $1280 \times 640$ | Rừng sâu sương dày | Đất ẩm / Rễ cây | Sói xương, Goblin Scout | **PASS** |
| 10 | `abyssal_chasm` | $1280 \times 640$ | Vực thẳm không đáy | Vách đá sỏi | Vực đá sâu, Void Stalker | **PASS** |
| 11 | `whispering_grove_sanctum` | $960 \times 440$ | Thánh địa Cây Đại Ngàn | Rêu xanh / Nền thánh | Cây đại thụ Titan, cấm địa | **PASS** |
| 12 | `silent_mire` | $1120 \times 640$ | Đầm lầy im lặng | Bùn lầy / Cầu ván | Quái đầm lầy, vũng nước sâu | **PASS** |
| 13 | `drowned_mire_depths` | $1120 \times 640$ | Đầm lầy chìm | Bùn sâu / Cầu ván mục | Bùn đen, sinh vật bóng tối | **PASS** |
| 14 | `ancient_rune_puzzle` | $350 \times 280$ | Tế đàn cổ ngữ | Đá phiến cổ | 3 Trụ đá giải đố, Bàn thờ | **PASS** |
| 15 | `sunken_crypt_ruins` | $1130 \times 640$ | Tàn tích Hầm Mộ Cổ | Nền đá tàn tích | Cột đá đổ, Hồn ma cổ linh | **PASS** |
| 16 | `broken_bell_shrine` | $960 \times 600$ | Miếu Chuông Vỡ | Nền miếu đá | Boss Kẻ Nuốt Tiếng Chuông | **PASS** |
| 17 | `veil_origin_cavern` | $1120 \times 640$ | Hang Cội Nguồn Màn Sương | Đá hang động | Trái Tim Màn Sương V1.4 | **PASS** |

---

## D. TỔNG KẾT & XÁC NHẬN RÀNG BUỘC DỪNG

1. **Số Lỗi Kỹ Thuật Đã Phát Hiện & Khắc Phục:**
   - Đã phát hiện và sửa dứt điểm lỗi va chạm tọa độ spawn tại cổng `to_whispering_clearing_from_wgs` ($y: -340 \rightarrow -310$).
   - Đã hoàn thiện và đấu nối các thực thể phục kích (`MistBatAmbushEntity`, `WanderingShadeEntity`, `GoblinScoutEntity`) chuẩn thiết kế N3XUS & Shadow Series mà không làm xáo trộn gameplay gốc.
2. **Kiểm Tra Build & Typecheck:**
   - `npx tsc --noEmit`: 0 lỗi type.
   - `npm run build`: Hoàn tất thành công gói xuất bản Vite trong 10.47s.
3. **Tuân Thủ Ràng Buộc Dừng:**
   - Tuyệt đối không thêm bản đồ hay cơ chế ngoài phạm vi thiết kế V1.4.
   - Giữ nguyên trạng 100% layout bản đồ, chỉ số chiến đấu và cấu trúc Save/Load.
   - Toàn bộ 17 phân khu của HOLLOW WOODS V1.4 đã sẵn sàng cho bản phát hành chính thức!
