# HW-NARRATIVE-00E — LOCAL TRAILER VISUAL & AUDIO REFERENCE REPORT

- **Mission:** `HW-NARRATIVE-00E — LOCAL TRAILER VISUAL & AUDIO ANALYSIS`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** `CINEMATIC REFERENCE ANALYSIS` (Read-only hoàn toàn trên video gốc; không sửa, đổi tên, nén lại hay di chuyển file video; không đụng tới mã nguồn game).
- **Primary Target Video:** `G:\HOLLOW WOODS\HW\Trailer\Video Game Trailer\v12\HOLLOW_WOODS_V12_THE_UNBROKEN_OATH_CINEMATIC_4K60.mp4`
- **Extracted Keyframes Folder:** [HW-TRAILER-REFERENCE/](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/) (`27` khung hình đại diện `1280×720` scaled *nearest-neighbor* từ `3840×2160`)
- **Tooling Used:** `imageio_ffmpeg` (`ffmpeg-win-x86_64-v9.0.2.exe`), PowerShell SHA-256, Python `wave` / `struct` segment RMS analyzer, direct image inspection (`read_file`).

---

## 1. Xác Minh Phiên Bản & Kiểm Kê Thư Mục `v12\` / `Trailer Game\` (§2)

**Kết luận xác minh phiên bản:**
1. Tệp mục tiêu **`HOLLOW_WOODS_V12_THE_UNBROKEN_OATH_CINEMATIC_4K60.mp4`** **KHÔNG PHẢI** là bản `V12.2`. Dù luồng hình ảnh (`video_md5`) trùng khớp 100% với `V12.1` và `V12.2`, bản `V12` mang track audio cũ hơn (`-21.2 LUFS`, `LRA 7.9 LU`, bitrate `279 kb/s`).
2. Trong thư mục `v12\` **CÓ tồn tại** bản **`HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`** (trùng khớp từng byte SHA-256 `a38daf88...` với bản nằm trong `Trailer Game\`) cùng 2 tệp soundtrack riêng `V12_1` và `V12_2`.
3. **Không tồn tại** tệp `V12.2 Ultra Master` riêng nào cho trailer Hollow Woods trong `v12\` hoặc `Trailer Game\` *(bản mang chữ `ULTRA_MASTER` duy nhất trong `Trailer Beta\v9.2\` là `KYOSHIRO_STUDIO_NEW_4K60_ULTRA_MASTER.mp4` chỉ dành cho Studio Intro)*.

| Tệp trong `v12\` & `Trailer Game\` | Dung lượng (bytes) | Thời lượng / Thông số kỹ thuật | Video Stream MD5 | SHA-256 |
| :--- | :---: | :--- | :---: | :--- |
| **`v12\HOLLOW_WOODS_V12_THE_UNBROKEN_OATH_CINEMATIC_4K60.mp4`** *(Target)* | `243,108,092` | `01:10.00` · `3840×2160` · `59.97 fps` · `h264 High (yuv420p, 27494 kb/s)` · `aac LC 48kHz stereo 279 kb/s` | `9fcdf1389b393721a83246cb54c33b67` | `a7848cd1d9ca4aa0d32b1db4eb050bfc912fec0646fe77b6932359077c9a1aeb` |
| `v12\HOLLOW_WOODS_V12_1_CINEMATIC_SOUND_MASTER_4K60.mp4` | `243,294,163` | `01:10.00` · `3840×2160` · `59.97 fps` · `h264 High 27494 kb/s` · `aac LC 48kHz stereo 300 kb/s` | `9fcdf1389b393721a83246cb54c33b67` | `54a34cde148af03bb584f406f1039d47fc30d1b6c7f727379e59067db93b5aa8` |
| **`v12\HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`** *(khớp `Trailer Game\`)* | `243,287,726` | `01:10.00` · `3840×2160` · `59.97 fps` · `h264 High 27494 kb/s` · `aac LC 48kHz stereo 300 kb/s` | `9fcdf1389b393721a83246cb54c33b67` | `a38daf88a54b1db790eb549e271f71a32fa2b0961594483418ca93a93c6427f0` |
| `v12\HOLLOW_WOODS_V12_1_CINEMATIC_SOUNDTRACK.mp3` | `1,921,580` | `01:00.00` · `mp3 48kHz stereo 256 kb/s` | — | `098ef48735eac13636f7a6afa7ca2dc511367fd397072fb2945935503315559c` |
| `v12\HOLLOW_WOODS_V12_2_CINEMATIC_SOUNDTRACK.mp3` | `2,401,964` | `01:00.00` · `mp3 48kHz stereo 320 kb/s` | — | `6ed521e47783b46bb1bb89c2f5e8c8706105a3dcee6449b8e0264f4679cb703f` |

---

## 2. Phân Tích Mỹ Thuật Chi Tiết Qua `14` Khía Cạnh (§3)

*(Quan sát trực tiếp từ các khung hình trích xuất ở `Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/`).*

| Hạng mục | Đặc điểm quan sát trong Trailer V12 | Phân biệt Cinematic vs Gameplay Thực Tế & Hướng Áp Dụng (`World Reconstruction 2.0`) |
| :--- | :--- | :--- |
| **1. Bố cục bản đồ** | Từng phân cảnh dựng theo *stage* ngang gọn gàng, đặt chủ thể rõ ràng trên trục đọc trái→phải (`11s–15s`, `29s`, `41.5s`, `47.5s`, `52s–64s`), tách vùng sáng–tối mạch lạc. | Không bê nguyên sân khấu trailer vào world map; giữ quy hoạch trục đường chính `72–96px` thoáng đãng như `bellhollow` / `LAB-01` để tránh kẹt collider (`W20-BUG-002`). |
| **2. Nhà cửa & Kiến trúc** | Tại `Bellhollow` (`15s–23s`), nhà đá ngói tối có cửa sổ phát sáng hổ phách ấm áp, giếng đá mái ngói nhỏ và cổng tháp chuông dây leo bao quanh sân gạch. | Làng trong trailer vẫn dùng gạch xám cắt khá thẳng vào nền cỏ xanh. Trong World 2.0 dùng **`Serene Village Revamped v1.9` + `Houses Pack`** và mép chuyển tiếp rêu/đá mềm hơn. |
| **3. Cây cổ thụ** | Tán cây xanh rêu sẫm và cây lá tím đỏ xen kẽ (`11s`, `29s`, `36.5s`, `41.5s`), thân cây gồ ghề, đặt theo cụm bo khung màn hình (foreground sát mép dưới & nền trên). | Trong `World 2.0`, thay toàn bộ cây gộp nguyên khối bằng **`Resurrected RPG 1.1`** tách layer `Tree_Trunks` (collider chân) & `Tree_Canopies` (`depth = y + 0.5`) như đã thử nghiệm thành công tại `LAB-01`. |
| **4. Thảm thực vật** | Nấm phát quang xanh dương, cụm nấm cam nhỏ, cỏ dại thưa và đá rêu điểm xuyết rời rạc ngoài trục đường đi (`11s`, `15s`, `29s`, `45s`). | Giữ mật độ cỏ/hoa nhẹ ở mặt đường (`Low_Vegetation` không collider); không để nấm mọc xuyên lên nền gạch quảng trường như đã gặp ở `Bellhollow` runtime. |
| **5. Đường mòn** | Lối đi nổi bật rõ so với nền rừng: sân gạch sáng tại Bellhollow (`15s`), thềm lát gạch nâu sọc ở trạm Vaelen (`29s`) & hang Dark Knight (`52s`), cầu gạch thẳng tại Mire Warden (`41.5s`), dải đất vàng nhạt dưới sương tại Satyr (`47.5s`). | Sử dụng autotile đường mòn đất viền rêu (`Resurrected RPG` / `Grass Land 2.0`) cho rừng, giữ tương phản lối đi rõ ràng ngay cả khi Ambient thấp `0.25–0.38`. |
| **6. Di tích** | Xuất hiện **cột đá rune phát sáng ngọc bích** (`29s` Vaelen: 4 cột; `41.5s` Mire Warden: 3 cột; `52s` hang: 2 cột) và **vòm cửa hang đá rêu có vòng cổ ngữ xanh lam** (`47.5s`, `52s`). | Áp dụng **`EPIC RPG World - Ancient Ruins`** & **`DarkFantasy Starter`** thay cho các cột/bia vector `Phaser.Graphics` trong `silent_mire`, `ancient_rune_puzzle` và `sub_whispering_clearing`. |
| **7. Ánh sáng** | Tương phản mạnh **Ấm vs Lạnh**: cửa sổ nhà/đèn lồng/lửa trại (`#D5A653`) ấm áp vs màn sương tối xanh đen/tím (`#0B1018`, `#281D40`); đặc biệt nhấn **Vòng Sáng Hộ Tâm tròn màu hổ phách** ở `36.5s` & `47.5s`. | Bảo toàn `Vòng Sáng Hộ Tâm [F]` (`hw_lantern_aura_soft_v1` ở `HW-H4-06`) và vùng ánh sáng điểm (`campfire`, `torch`, `mushrooms`) mà không làm tối mù tầm nhìn gameplay. |
| **8. Bóng đổ** | Nhân vật, cây, đèn và di tích đều có bóng oval tối dưới chân (`11s`, `15s`, `29s`, `58s`). | Giữ shadow cached (`hw_world_node_shadow_v1` / `Tree_Shadows` depth `-8500`) tránh tốn Draw Calls trên GPU. |
| **9. Sương mù** | Sương gradient 4 góc & rìa tối phủ đều mượt (ở `45s–47.5s` chuyển sang viền tím/đỏ thẫm gợi áp lực tinh thần). | **Cẩn trọng với `Classic Sanity 2.1`:** trong gameplay giữ đúng `4` góc tam giác đã duyệt (`HW-FX-31/35`), không tạo hộp chữ nhật che giữa màn hình (`BUG-023`), giữ tùy chọn `Reduced Motion`. |
| **10. Tỷ lệ nhân vật** | Camera logic `640×360` cho tỷ lệ NVC (`Meliodas`) ngang tầm với `Edda`, thấp hơn nhẹ so với `Sir Vaelen`, nhỏ gọn hơn hẳn `Hooded/Dark Knight` và `Mire Warden` tạo uy áp boss. | Duy trì `WAYFARER_BASE_SCALE = 1.50` (`1.20` khi chạy), anchor chân `(0.5, 1.0)` và foot hitbox `18×12 px` như đã xác minh ở `LAB-01`. |
| **11. Animation** | Nhịp đi/chạy mượt 4 hướng, Edda lơ lửng sách mở/đóm lửa cam (`17.5s`), Dark Knight giơ kiếm thẳng lên trời niệm phép (`54.5s`), 2 thuộc hạ (`58s`) cầm khiên/kiếm xông lên, Vaelen thủ thế kiếm. | Chú ý: hoạt ảnh Dark Knight Powerup, 2 thuộc hạ `Knight_2/3`, và Vaelen vào hang đều là **dựng phim cinematic**, chưa phải AI/combat runtime (`NAR-017/018/027`). |
| **12. Camera & Framing** | Khung `16:9` có **thanh letterbox đen trên/dưới** rất mỏng, tiêu đề zone viết hoa serif vàng (`LỐI MÒN XUYÊN SƯƠNG`, `BELLHOLLOW`, `THE VEIL`, `MIRE WARDEN`, `DARK KNIGHT`) đặt cố định chính giữa mép trên. | Dùng letterbox + header serif tương tự **chỉ** cho **Cutscene Prologue / Story Moment** nếu Owner duyệt `OQ-19`; gameplay chính giữ HUD chuẩn `UIScene`. |
| **13. Giao diện hội thoại** | Khung chữ nhật Dark Moss tối viền vàng mảnh `#C8963E`, có ô chân dung vuông bên trái + đường kẻ ngang phân tách tên diễn giả (`Edda — Người Giữ Chuông`, `Sir Vaelen — Kỵ Sĩ Trầm Mặc`, `Dark Knight`), chữ trắng serif sắc nét tối đa `2–3` dòng. | Rất đồng bộ với bảng màu `AI_IRON_RULES.md` (`#141712` / `#C8963E` / `#E8DFC8`) — phù hợp chuẩn hóa kiểu chữ & lề cho hộp thoại dài tiếng Việt trong `UIScene.ts`. |
| **14. Hiệu ứng giả tưởng** | Múa vòng kép vàng hổ phách (`41.5s`, `64s` quanh Meliodas), vòng tròn ma pháp cổ ngữ tím (`54.5s`, `64s` dưới chân Dark Knight), vòng sáng trắng xanh quanh Vaelen (`64s`), đốm tro bay trong sương & chém sáng trắng từ Mire Warden (`41.5s`). | Phân biệt rõ VFX trailer (`Dark Resonance`, vòng hỗ trợ Vaelen) với gameplay thật; khi triển khai phải tách particle nhẹ theo `Graphics Quality` để giữ `60 FPS`. |

---

## 3. Đối Chiếu Narrative & Phân Tích Âm Thanh (§4)

### 3.1 Đối Chiếu Toàn Bộ Văn Bản / Thoại Quan Sát Trực Tiếp Trong Video `V12` Với Master Bible
- **`01.5s–09.0s` Studio:** Khớp Intro sói trắng + tay cầm DualSense neon và con dấu sumi-e `KYOSHIRO STUDIO`.
- **`11.0s–13.5s` (`LỐI MÒN XUYÊN SƯƠNG`):** Caption thực tế trên màn hình là *"Trong một chuyến đi, anh nghe thấy tiếng chuông vọng đến từ nơi tưởng chừng chẳng còn ai sinh sống."* — **Chú ý quan trọng:** Vẫn dùng đại từ **`"anh"`** và **`"tiếng chuông"`** (gần với `V9` / `DLG-001`), chưa chuyển sang `"lời cầu cứu"` như định hướng mới của Owner (`OQ-02`).
- **`15.0s` (`BELLHOLLOW`):** *"Khi tỉnh lại, anh đã quên mất mình là ai."* (`DLG-003` dạng rút gọn).
- **`17.5s–23.0s` (`Edda — Người Giữ Chuông`):** Khớp nguyên văn 100% **`DLG-006`** và **`DLG-007`** (đã chuyển xưng hô sang **`"ngươi"`**).
- **`29.0s` (`Sir Vaelen — Kỵ Sĩ Trầm Mặc`):** Khớp nguyên văn 100% **`DLG-009`** (*"Có những lời thề, người lập ra đã chẳng còn nhớ..."*).
- **`36.5s` (`THE VEIL`):** Khớp nguyên văn **`DLG-011`** (*"Giữa màn sương, chỉ Vòng Sáng Hộ Tâm còn soi đường."*).
- **`45.0s–47.5s` (`SATYR — BÓNG MA TRONG SƯƠNG`):** `45.0s` hiện *"Có những thứ màn sương chưa từng trả lại..."* → `47.5s` hiện *"...và có những thứ không muốn bị lãng quên."* (chính xác từng chữ so với hình ảnh chụp được).
- **`52.0s–64.0s` (`DARK KNIGHT`):** `52.0s–54.5s` khớp nguyên văn **`DLG-012`** (*"Năm ấy, ngài dạy ta không được khuất phục trước bóng tối…"*); `58.0s–64.0s` Sir Vaelen hiện **`DLG-014` + `DLG-015`** ghép trên cùng thẻ thoại (*"Ngài có thể đã quên… nhưng ta thì chưa. / Ta cũng từng chờ đợi như ngươi… nhưng chưa bao giờ từ bỏ lời thề."*).
- **`66.5s–68.5s` (Title Reveal):** Khớp nguyên văn 100% **`DLG-031–034`** + `SINH TỒN · KINH DỊ TÂM LÝ · BÍ ẨN / KYOSHIRO STUDIO`.

### 3.2 Phân Tích Âm Thanh Định Lượng (`FFmpeg ebur128` + Segment RMS) & Phạm Vi `NOT VERIFIED`
| Phiên bản kiểm tra | Integrated (LUFS) | LRA (LU) | True Peak | Bellhollow / Edda (`14–24s` RMS) | Vaelen / Cave (`24–33s` / `51–65s`) | Outro Title (`65–70s` RMS) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`V12_THE_UNBROKEN_OATH`** *(Target)* | `-21.2 LUFS` | `7.9 LU` | `-1.0 dBFS` | `-29.0 dBFS` / `-26.2 dBFS` | `-27.8` / `-23.1 dBFS` | `-25.5 dBFS` (peak `-13.0`) |
| `V12_1_CINEMATIC_SOUND_MASTER` | `-17.7 LUFS` | `9.1 LU` | `-0.9 dBFS` | `-26.2 dBFS` / `-25.6 dBFS` | `-22.0` / `-18.5 dBFS` | `-26.5 dBFS` (peak `-12.4`) |
| **`V12_2_CINEMATIC_SOUND_POLISH`** | `-18.0 LUFS` | `12.1 LU` | `-0.9 dBFS` | **`-32.1 dBFS` / `-29.5 dBFS`** *(giảm chuông lặp)* | `-22.0` / `-18.5 dBFS` *(giữ nguyên)* | **`-28.9 dBFS`** (peak `-15.9`, *bỏ chuông cuối*) |

- **Xác nhận kỹ thuật:** Phiên bản `V12` mục tiêu nhẹ âm lượng hơn (`-21.2 LUFS`), trong khi `V12.1` nâng độ dày nhạc giao hưởng/cao trào lên `-17.7 LUFS`, và **`V12.2`** đã cắt giảm rõ năng lượng chuông tại phân đoạn `14–24s` (`-5.9 dB` tại Bellhollow, `-3.9 dB` tại Edda) và hạ `outro_title` xuống `-28.9 dBFS` đúng như mô tả lịch sử của Unified Edition (`NAR-029`).
- **Mục ghi rõ `NOT VERIFIED` (§4):**
  1. Trailer sử dụng thẻ thoại/text im lặng kèm nhạc nền & SFX — **không có giọng lồng tiếng nhân vật (voice-over) để kiểm âm bằng tai người** (`audio lời thoại nói: NOT VERIFIED / N/A`).
  2. Tên nốt nhạc cụ thể của motif (`D–F–E–A` piano/cello) ghi trong Bible là dữ liệu tài liệu lịch sử; quy trình tự động bằng FFmpeg chỉ đo được phổ/động học âm lượng (LUFS/LRA/dBFS), **chưa thực hiện ký âm tai người trực tiếp cho từng nốt (`PITCH TRANSCRIPTION: NOT VERIFIED BY TOOL`)**.

---

## 4. Danh Mục `27` Khung Hình Đại Diện Đã Trích Xuất (`Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/`)

| # | Tệp ảnh (`1280×720`) | Timestamp | Khu vực / Cảnh | Đặc điểm mỹ thuật quan sát & Hướng áp dụng |
| :-: | :--- | :---: | :--- | :--- |
| `01` | [01_studio_logo_controller_01.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/01_studio_logo_controller_01.5s.png) | `01.5s` | Studio Intro | Sương đêm xanh-tím, mặt trời đỏ, hoa anh đào & tay cầm neon trên bệ đá — giữ nguyên làm intro độc lập (`Ch. 12`). |
| `02` | [02_studio_wolf_dark_05.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/02_studio_wolf_dark_05.5s.png) | `05.5s` | Studio Intro | Cận cảnh sói trắng ngậm tay cầm trên nền đêm — transition trước logo giấy dó. |
| `03` | [03_studio_kyoshiro_sumie_09.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/03_studio_kyoshiro_sumie_09.0s.png) | `09.0s` | Studio Intro | Huy hiệu sumi-e mặt trời đỏ + chữ `KYOSHIRO STUDIO` — giữ nguyên không chỉnh sửa. |
| `04` | [04_fog_crossing_intro_11.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/04_fog_crossing_intro_11.0s.png) | `11.0s` | `Fog Crossing` | NVC bước từ sương trên nền cỏ rêu tối, cây lá xanh/tím, nấm lam phát sáng; chữ `"anh"` & `"tiếng chuông"` — tham khảo không khí Act 0, thay cây bằng `Resurrected RPG`. |
| `05` | [05_fog_crossing_bell_clue_13.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/05_fog_crossing_bell_clue_13.5s.png) | `13.5s` | `Fog Crossing` | Cuối đoạn lối mòn, góc máy giữ tỷ lệ `640×360` rõ rệt — tham khảo mật độ thưa lối đi rộng ở `fog_crossing` World 2.0. |
| `06` | [06_bellhollow_awakening_15.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/06_bellhollow_awakening_15.0s.png) | `15.0s` | `Bellhollow` | Quảng trường gạch xám, 2 nhà đá cửa sổ hổ phách, tháp chuông dây leo, giếng đá, đèn lồng & Edda — thay đường gạch cắt thẳng bằng `Serene Village` & giữ trục đường trống `y=260`. |
| `07` | [07_edda_dialogue_card_1_17.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/07_edda_dialogue_card_1_17.5s.png) | `17.5s` | `Bellhollow` | Khung thoại `Edda` (`DLG-006`) + portrait vuông trái viền vàng `#C8963E` — mẫu chuẩn typography UI tiếng Việt 3 dòng. |
| `08` | [08_edda_dialogue_card_2_20.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/08_edda_dialogue_card_2_20.5s.png) | `20.5s` | `Bellhollow` | Thẻ thoại thứ 2 của `Edda` (`DLG-007`: *"tiếng gọi còn vương lại trong gió..."*) — làm rõ nhịp chia thẻ 2 bước khi tích hợp thoại dài. |
| `09` | [09_edda_square_wide_23.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/09_edda_square_wide_23.0s.png) | `23.0s` | `Bellhollow` | Kết thúc cảnh Edda trước fade — đối chiếu vị trí đứng của NPC và giếng trung tâm tránh vướng đường đi. |
| `10` | [10_vaelen_campfire_arrive_25.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/10_vaelen_campfire_arrive_25.5s.png) | `25.5s` | `Outer Woods` | Sân đá trạm lửa Sir Vaelen, 4 cột đá rune phát sáng, lều cắm trại & đốm lửa hổ phách — chuẩn bố cục không gian thoáng quanh lửa trại tránh `Triple Stack` (`W20-BUG-006`). |
| `11` | [11_vaelen_oath_dialogue_29.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/11_vaelen_oath_dialogue_29.0s.png) | `29.0s` | `Outer Woods` | `Sir Vaelen — Kỵ Sĩ Trầm Mặc` (`DLG-009`), ánh lửa ấm tương phản nền rừng xanh tối — dùng làm mẫu màu ánh sáng cho trạm lửa World 2.0. |
| `12` | [12_vaelen_ember_hold_32.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/12_vaelen_ember_hold_32.0s.png) | `32.0s` | `Outer Woods` | Dữ nhịp đốm lửa bay trước chuyển cảnh `The Veil` — tham khảo mật độ hạt ember vừa phải cho `High/Medium Quality`. |
| `13` | [13_the_veil_darkness_34.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/13_the_veil_darkness_34.5s.png) | `34.5s` | `The Veil` / Rừng | Hạ sáng toàn cảnh khi màn đêm xuống, bóng thực thể lưỡi hái lờ mờ — minh họa cảm giác rủi ro khi tắt đèn. |
| `14` | [14_ho_tam_lantern_veil_36.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/14_ho_tam_lantern_veil_36.5s.png) | `36.5s` | `The Veil` / Rừng | Quầng sáng tròn `Vòng Sáng Hộ Tâm` soi rõ NVC & thực thể đen phía sau (`DLG-011`) — khớp hướng texture `hw_lantern_aura_soft_v1` đã tối ưu ở `HW-H4-06`. |
| `15` | [15_mire_warden_reveal_38.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/15_mire_warden_reveal_38.5s.png) | `38.5s` | `Mire Warden` | Đường cầu đá hẹp qua đầm, 3 cột rune phía sau & cây héo rải rác — trong World 2.0 thay bằng `Dead Swamp` + `Mangrove` và sân boss đủ rộng. |
| `16` | [16_mire_warden_clapper_fight_41.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/16_mire_warden_clapper_fight_41.5s.png) | `41.5s` | `Mire Warden` | Chém vòng sáng trắng của boss + vòng aura hổ phách kép quanh Meliodas — tham khảo tương phản VFX chiến đấu trên nền tối. |
| `17` | [17_mire_warden_hold_43.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/17_mire_warden_hold_43.5s.png) | `43.5s` | `Mire Warden` | Nhịp cuối pha đụng độ trước cắt cảnh Satyr — lưu ý đây là dàn dựng cinematic, không bỏ cơ chế 3 trụ runtime. |
| `18` | [18_satyr_shadow_appear_45.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/18_satyr_shadow_appear_45.0s.png) | `45.0s` | `Satyr` / Rừng tối | `SATYR — BÓNG MA TRONG SƯƠNG`, dải đất vàng hẹp dưới sương đỏ-tím, cửa hang đá cổ ngữ ở mép phải (*"Có những thứ màn sương chưa từng trả lại..."*). |
| `19` | [19_satyr_pursuit_dialogue_47.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/19_satyr_pursuit_dialogue_47.5s.png) | `47.5s` | `Satyr` / Cửa hang | Satyr rượt sát lưng với ánh Hộ Tâm thu hẹp + vòm hang phát cổ ngữ xanh lam — tham khảo thiết kế cổng hang động `veil_origin_cavern` / `sub_root_cellar` trong `Kauzz Cave Tiles`. |
| `20` | [20_satyr_cave_mouth_49.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/20_satyr_cave_mouth_49.5s.png) | `49.5s` | Cửa hang | Fade chuyển tối khi Meliodas áp sát miệng hang — tham khảo nhịp transition không flash chói. |
| `21` | [21_cave_dark_knight_confront_52.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/21_cave_dark_knight_confront_52.0s.png) | `52.0s` | `Dark Knight` (Hang) | Toàn cảnh hang gạch đá đối xứng: miệng hang trái, 2 cột rune, `Dark Knight` đứng trước, 2 thuộc hạ đứng cánh; thẻ thoại `DLG-012` — thuộc `TRAILER-ONLY`. |
| `22` | [22_cave_dark_knight_line1_54.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/22_cave_dark_knight_line1_54.5s.png) | `54.5s` | `Dark Knight` (Hang) | Dark Knight giơ kiếm tạo vòng ma pháp cổ ngữ tím dưới chân — tham khảo concept `Dark Resonance` (chỉ áp khi duyệt `OQ-04` / `NR-05`). |
| `23` | [23_cave_combat_subordinates_58.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/23_cave_combat_subordinates_58.0s.png) | `58.0s` | `Dark Knight` (Hang) | `Sir Vaelen` tiến vào từ trái giữ chân `Knight_2/Knight_3` trong khi Meliodas đối diện Dark Knight (`DLG-014/015`) — cảnh hỗ trợ `TRAILER-ONLY` (`OQ-16`). |
| `24` | [24_cave_vaelen_oath_support_61.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/24_cave_vaelen_oath_support_61.5s.png) | `61.5s` | `Dark Knight` (Hang) | 3 luồng aura rõ rệt: trắng-lam dưới chân Vaelen, vàng hổ phách quanh Meliodas, tím quanh Dark Knight — chuẩn nhận diện phe/cảm xúc bằng màu sắc. |
| `25` | [25_cave_climax_duel_64.0s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/25_cave_climax_duel_64.0s.png) | `64.0s` | `Dark Knight` (Hang) | Khoảnh khắc giao kiếm cao trào trước fade ra Title — tách biệt hoàn toàn với runtime `HoodedKnightBoss` cho tới khi Owner chốt `OQ-04`. |
| `26` | [26_title_reveal_fade_66.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/26_title_reveal_fade_66.5s.png) | `66.5s` | `Title Reveal` | Nền `Bellhollow` phủ tối cùng lớp chữ serif `DLG-031–034` dần hiện — dùng làm tham chiếu mỹ thuật marketing/teaser. |
| `27` | [27_title_reveal_full_68.5s.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-TRAILER-REFERENCE/27_title_reveal_full_68.5s.png) | `68.5s` | `Title Reveal` | Khung kết chuẩn chữ rõ ràng: `HOLLOW WOODS — KHU RỪNG ĐANG DÕI THEO`, `SINH TỒN · KINH DỊ TÂM LÝ · BÍ ẨN / KYOSHIRO STUDIO` (`TRAILER-ONLY`). |
