# BÁO CÁO KỸ THUẬT V14-P5-01
## HỆ SINH THÁI RỪNG GIAI ĐOẠN 1: QUẠ RỪNG & BƯỚM ĐÊM HỔ PHÁCH

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P5-01`
- **Mục tiêu:**
  1. Triển khai 2 loài sinh vật rừng ưu tiên giai đoạn 1: **Quạ Rừng (Crow — `HW-ANI-AMBIENT-000001` / `ani_crow`)** và **Bướm Đêm Hổ Phách (Lantern Moth — `HW-ANI-AMBIENT-000002` / `ani_lantern_moth`)** nhằm làm sống động thế giới mà không làm loãng lối chơi sinh tồn kinh dị.
  2. Tuyệt đối giữ đúng phạm vi tinh gọn: **chưa thêm Cáo/Hươu, không làm hệ thống săn bắt rơi thịt hay chăn nuôi**.
  3. Xây dựng hành vi sinh thái cho Quạ Rừng: đậu cành cây/hàng rào, giật mình bay lên khi có tiếng bước chân chạy ẩu hoặc khi The Listener đi ngang qua, phát tiếng quạ kêu chói tai — tạo cơ chế cảnh báo hai chiều chiến thuật (vừa báo động quái vật cho người chơi, vừa có thể làm lộ vị trí người chơi nếu chạy ẩu).
  4. Xây dựng hành vi sinh thái cho Bướm Đêm Hổ Phách: chỉ xuất hiện vào Hoàng Hôn và Đêm Sương quanh bụi thảo dược, lượn nhẹ quanh ngọn Đèn Lồng `[F]` và Lửa Trại, tạo bầu không khí cổ tích u ám và định hướng tài nguyên trong sương dày.
  5. Kiểm soát nghiêm ngặt hiệu năng WebGL 60 FPS: thiết lập trần số lượng sinh vật đồng thời (**Spawn Cap**: tối đa 6 quạ, 8 bướm/phân khu, trần toàn cảnh 24 cá thể) và cơ chế tự động ngủ đông / culling khi ra ngoài tầm nhìn Camera (> 560px).
  6. Tích hợp âm thanh Web Audio API chất lượng cao trong [AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts): `playCrowCaw()`, `playCrowFlap()`, `playMothFlutter()`.
  7. Bảo toàn 100% kiểm thử hồi quy V1.3 (571 bài test) và nâng tổng số test V1.4 lên 303 bài test (Tổng dự án: 874/874 PASS).
- **Ngày thực hiện:** 17/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (PASS 874/874 TEST TOÀN DỰ ÁN)**

---

## 1. PHẠM VI & ĐỊNH DANH 2 LOÀI SINH VẬT RỪNG ƯU TIÊN

Theo đúng tài liệu thiết kế đã phê duyệt của V1.4, hệ sinh thái động vật hoang dã được thiết kế phục vụ trực tiếp cho trải nghiệm khám phá và áp lực kinh dị tâm lý:

| Tiêu Chí | Quạ Rừng (Woodland Crow) | Bướm Đêm Hổ Phách (Lantern Moth) |
| :--- | :--- | :--- |
| **Content ID** | `HW-ANI-AMBIENT-000001` | `HW-ANI-AMBIENT-000002` |
| **Runtime Key** | `ani_crow` | `ani_lantern_moth` |
| **Phân loại** | Sinh vật môi trường cảnh báo (Ambient Alarm) | Sinh vật dẫn sáng lân tinh (Light Seeker) |
| **Sinh cảnh chính** | Outer Woods, Crooked Path, Sanctuary Farm, Bellhollow, Deep Forest | Outer Woods, Crooked Path, Bellhollow, Sanctuary Farm, Deep Forest |
| **Thời điểm xuất hiện** | Suốt ngày đêm (đặc biệt nhạy cảm lúc Hoàng hôn & Đêm sương) | Chỉ xuất hiện lúc **Hoàng Hôn (DUSK)** và **Đêm Sương (NIGHT)**; ẩn nấp ban ngày |
| **Tương tác chiến thuật**| Giật mình bay lên báo động nguy hiểm hai chiều | Bay lượn quanh Đèn Lồng `[F]` và gợi ý vị trí thảo dược / lửa trại |
| **Hệ thống kinh tế** | **Không rơi thịt / Không săn bắt** | **Không rơi tài nguyên / Không bắt nhốt** |

---

## 2. HÀNH VI SINH THÁI QUẠ RỪNG ([WildlifeEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/WildlifeEntity.ts))

### 2.1. Các Trạng Thái Vòng Đời Của Quạ
1. **`PERCHED` (Đang Đậu):**
   - Quạ đậu yên tĩnh trên các cọc hàng rào (`fence`), cành cây nghiêng (`branch`), mỏm đá rêu phong (`rock`).
   - Cử động tự nhiên: đầu nhấp nhô ngẫu nhiên sau mỗi 3.2 giây (`idleTimer`), rỉa lông hoặc đổi hướng nhìn.
2. **`ALERT` (Cảnh Giác):**
   - Khi người chơi đi bộ lại gần trong cự ly vừa phải (53 - 90 px).
   - Quạ nhấp nhổm đầu liên tục, mắt chuyển sang ánh hổ phách cảnh giác (`0xe67e22`), quay mặt về phía người chơi.
3. **`SPOOKED` (Giật Mình Bay Lên — Scatter & Takeoff):**
   - Kích hoạt khi có chấn động hoặc mối nguy cận kề:
     - **The Listener tiếp cận:** Khoảng cách quái vật tới quạ `< 165 px`.
     - **Người chơi vung vũ khí:** Khoảng cách người chơi tới quạ `< 220 px` khi tung đòn đánh.
     - **Người chơi chạy nước rút (Sprint):** Khoảng cách tới quạ `< 140 px`.
     - **Người chơi tiến quá sát:** Khoảng cách `< 52 px`.
     - **Đuốc Nhựa Thông bùng sáng:** Khoảng cách `< 220 px`.
   - **Hành động khi giật mình:**
     - Gọi `AudioManager.getInstance().playCrowCaw()` phát 2 nhịp quạ kêu khàn đục u ám kèm tiếng đập cánh rào rạt.
     - Phát sự kiện `wildlife_spooked` ra toàn cảnh game.
     - Tween sải cánh bay vút chéo lên bầu trời (`x += ±95px`, `y -= 145px`, mờ dần alpha trong 1350ms).
4. **Hồi Sinh Tự Nhiên (Respawn):**
   - Sau khi bay mất, quạ bước vào thời gian chờ 20 - 30 giây (`respawnTimer = 22000 - 30000ms`). Khi khu vực yên tĩnh trở lại, quạ từ từ bay đáp về vị trí đậu ban đầu.

### 2.2. Cơ Chế Báo Động Hai Chiều (Tactical Double-Edged Sword)
- **Lợi ích cho người chơi:** Khi đang lén lút trong rừng mà từ xa nhìn thấy đàn quạ trên ngọn cây phía trước giật mình kêu thét bay lên ➔ người chơi lập tức nhận biết **The Listener đang tuần tra ở ngay vị trí đó** để kịp thời né tránh hoặc tìm bụi rậm ẩn nấp.
- **Rủi ro cho người chơi (Con dao hai lưỡi):** Nếu người chơi thiếu kiên nhẫn mà bấm Shift chạy nước rút hoặc vung rìu/gậy ẩu làm kinh động đàn quạ ➔ tiếng quạ kêu chói tai sẽ phát ra sóng âm thanh cảnh báo trong bán kính 420px. The Listener ở gần đó sẽ nghe thấy tiếng quạ hoảng loạn và lập tức chuyển sang trạng thái `ALERT` (hiện dấu `?` vàng) đi tới điều tra vị trí đàn quạ vừa bay lên!

---

## 3. HÀNH VI SINH THÁI BƯỚM ĐÊM HỔ PHÁCH ([WildlifeEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/WildlifeEntity.ts))

### 3.1. Đồ Họa & Chuyển Động Lân Tinh
- **Thân bướm:** Thon nhỏ màu nâu hổ phách sẫm `0x78390b`.
- **Cánh lân tinh (Gossamer Wings):** Mỏng manh màu vàng nhạt `0xffe082`, viền vàng cam `0xf39c12`, đốm phấn phát quang `0xfff9c4`. Cánh vỗ liên tục theo tần số cao (8 - 12 Hz).
- **Quầng sáng lân tinh:** Vòng sáng dịu `0xffb300` bán kính 16px tạo cảm giác kỳ ảo lung linh trong sương đêm.
- **Quỹ đạo lượn sóng:** Sử dụng tổ hợp hàm sin/cos tạo chuyển động bồng bềnh dập dờn không trùng lặp.

### 3.2. Chu Kỳ Thời Gian & Thu Hút Bởi Nguồn Sáng
1. **Ban Ngày (DAY):** Khi `TimeSystem` chuyển sang Ban Ngày, bướm đêm tự động giảm độ mờ `alpha` về 0 và ẩn mình vào các kẽ rễ cây ẩm ướt để nghỉ ngơi.
2. **Hoàng Hôn (DUSK) & Đêm Sương (NIGHT):** Bướm đêm xuất hiện trở lại (`alpha -> 1`), bay lượn trên các luống thảo dược hoặc rặng hoa dại.
3. **Bị thu hút bởi Đèn Lồng `[F]`:** Khi người chơi bật đèn lồng đi ngang qua trong cự ly **220 px**, bướm đêm sẽ từ từ bị ánh sáng đèn mê hoặc, bay lượn vòng quanh ngọn đèn của người chơi theo quỹ đạo tròn bán kính 36 - 72 px, tạo cảm giác người chơi là lữ khách được thiên nhiên dẫn lối.
4. **Bị thu hút bởi Lửa Trại làng Bellhollow:** Nếu ở gần Lửa Trại trung tâm đang cháy (< 260px), bướm đêm sẽ lượn dập dờn quanh ngọn lửa ấm áp.

---

## 4. KIỂM SOÁT HIỆU NĂNG WEBGL & SPAWN CAPS ([WildlifeSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts))

Nhằm đảm bảo trò chơi luôn duy trì ổn định **60 FPS** trên mọi cấu hình trình duyệt:
1. **Giới Hạn Số Lượng Phân Khu (Spawn Cap):**
   - `MAX_CROWS_PER_ZONE = 6` (Tối đa 6 quạ mỗi khu).
   - `MAX_MOTHS_PER_ZONE = 8` (Tối đa 8 bướm đêm mỗi khu).
   - `MAX_GLOBAL_ENTITIES = 24` (Trần tối đa toàn game 24 sinh vật hoạt động đồng thời).
2. **Cơ Chế Ngủ Đông / Camera Culling (`CULLING_DISTANCE = 560px`):**
   - Mỗi frame trong `WildlifeSystem.update()`, khoảng cách giữa người chơi và từng sinh vật được kiểm tra:
     - Nếu `dist > 560px` (ngoài khung nhìn camera): chuyển sang `isHibernating = true`, tắt hiển thị (`setVisible(false)`), ngừng toàn bộ tính toán tọa độ và vẽ graphics.
     - Khi camera/người chơi tiến lại gần (`dist <= 560px`): đánh thức sinh vật `isHibernating = false`, bật hiển thị trở lại.
3. **Dọn dẹp Zone Transition:** Khi người chơi chuyển phân khu (`switchZone`), toàn bộ sinh vật khu vực cũ được `destroy()` an toàn, giải phóng triệt để bộ nhớ WebGL trước khi khởi tạo sinh cảnh mới.

---

## 5. THIẾT KẾ ÂM THANH WEB AUDIO API ([AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts))

Hệ thống bổ sung 3 hàm âm thanh chuyên biệt, sử dụng bộ tổng hợp dao động âm học nội suy (Web Audio Synthesis) độc lập, không phụ thuộc file ngoài:
- **`playCrowCaw()`:**
  - Mô phỏng 2 nhịp kêu "Quạ... Quạ!" khàn đục u ám với 2 bộ tạo sóng kết hợp (Sawtooth 680Hz -> 410Hz + Triangle 540Hz -> 360Hz) qua bộ lọc Bandpass (850Hz -> 520Hz, Q: 2.8).
  - Kết hợp với tiếng đập cánh rào rạt. Cooldown chống lặp: 1100ms.
- **`playCrowFlap()`:**
  - 3 nhịp đập cánh dồn dập mô phỏng lông vũ xé gió bằng bộ đệm tiếng ồn trắng (Noise Buffer) qua bộ lọc Lowpass (450Hz).
- **`playMothFlutter()`:**
  - Tiếng cánh bướm dập dờn thanh tao nhẹ nhàng ở dải tần số cao (Sine 1400Hz - 1750Hz, gain rất nhỏ `0.04 * sfxVolume`).

---

## 6. KẾT QUẢ KIỂM THỬ TOÀN DIỆN HỆ THỐNG

### 6.1. Kiểm Tra TypeScript Type Safety
```powershell
npx tsc --noEmit
# Kết quả: EXIT CODE 0 (0 lỗi)
```

### 6.2. Kiểm Thử Hệ Sinh Thái Sinh Vật Hoang Dã ([test_v14_p5_01.mjs](file:///G:/HOLLOW%20WOODS/scripts/test_v14_p5_01.mjs))
- **Kết quả:** **34/34 bài test PASS (100%)**.
  - Phần 1 (Định danh Content ID & Phân loại Sinh vật): 5/5 PASS.
  - Phần 2 (Quản lý Quần thể & Giới hạn WebGL Spawn Cap): 7/7 PASS.
  - Phần 3 (Hành vi Sinh thái Quạ Rừng): 8/8 PASS.
  - Phần 4 (Hành vi Sinh thái Bướm Đêm Hổ Phách): 5/5 PASS.
  - Phần 5 (Tích hợp GameScene & Âm thanh AudioManager): 9/9 PASS.

### 6.3. Bảng Tổng Hợp Kiểm Thử Toàn Diện Hệ Thống V1.4
| Bộ Kiểm Thử | Tệp Kịch Bản | Số Bài Test | Kết Quả |
| :--- | :--- | :---: | :---: |
| **V1.3 Regression Suite (22 module nền tảng)** | `run_v1_3_regression_suite.mjs` | **571** | **571/571 PASS** |
| **V1.4 Save Migration Không Phá Hủy** | `test_save_migration_v14.mjs` | **41** | **41/41 PASS** |
| **V1.4 Chu Kỳ Thời Gian 360s & Math Engine** | `test_time_system_v14.mjs` | **19** | **19/19 PASS** |
| **V1.4 Mưa Sương & Huy Hiệu Ẩm / Thân Nhiệt** | `test_weather_and_status_v14.mjs` | **26** | **26/26 PASS** |
| **V1.4 Cụm Trại Sanctuary Camp Hub** | `test_camp_system_v14.mjs` | **59** | **59/59 PASS** |
| **V1.4 Nông Trại Sanctuary Farm 5 Bước** | `test_v14_p3_02.mjs` | **49** | **49/49 PASS** |
| **V1.4 Hotbar 8 Ô & Bảng Chế Tạo Trượt Phải** | `test_v14_p4_01.mjs` | **34** | **34/34 PASS** |
| **V1.4 Trang Bị 4 Ô & Tự Vệ Sinh Tồn** | `test_v14_p4_02.mjs` | **41** | **41/41 PASS** |
| **V1.4 Sinh Vật Hoang Dã: Quạ Rừng & Bướm Đêm** | `test_v14_p5_01.mjs` | **34** | **34/34 PASS** |
| **TỔNG CỘNG HỆ THỐNG** | | **874** | **874/874 PASS (100%)** |

### 6.4. Đóng Gói Vite Production
```powershell
npm run build
# dist/index.html                    1.10 kB │ gzip:   0.56 kB
# dist/assets/index-DrApkPlo.js  2,265.18 kB │ gzip: 535.04 kB
# ✓ built in 8.54s
```

---

## 7. NÂNG CẤP TRÍ NHỚ NGẮN HẠN & CƠ CHẾ CHỐNG LẶP MỒI NHỬ (V14-P5-02)

### 7.1. Cơ Chế Anti-Repeat Lure Memory ([ListenerAI.ts](file:///G:/HOLLOW%20WOODS/src/systems/ListenerAI.ts))
Để ngăn người chơi lạm dụng ném Mồi Tạo Tiếng Động (`item_noise_lure` [Q]) vào một góc để dắt mũi Kẻ Lắng Nghe liên tục, hệ thống trang bị bộ nhớ ngắn hạn cho thực thể AI:
1. **Mảng trí nhớ âm thanh (`soundMemories: SoundMemoryEntry[]`):**
   - Lưu trữ tọa độ mồi nổ `(x, y)`, tọa độ người chơi ném `(originX, originY)`, số lần lặp `repeatCount`, và mốc thời gian `timestamp`.
   - **Thời gian hết hạn trí nhớ (`MEMORY_EXPIRY_MS`):** Chuẩn **30 giây (30000ms)**. Sau 30 giây không nghe thấy tiếng nổ ở khu vực đó, The Listener sẽ quên dần.
   - **Bán kính nhận diện ném lặp (`REPEAT_LURE_RADIUS`):** Chuẩn **75 px**.
2. **Đường cong suy giảm độ tin cậy của mồi nhử (Lure Effectiveness Curve):**
   - **Lần 1 (`repeatCount = 1`):** Hiệu quả **100% (1.0)**. The Listener hoàn toàn tin tưởng, chạy thẳng tới điểm nổ mồi nhử và dừng lại điều tra trong **1150 ms** (`alertTimer`).
   - **Lần 2 (`repeatCount = 2` trong 30s):** Hiệu quả giảm còn **50% (0.5)**. The Listener bắt đầu nghi ngờ bẫy lặp; nó chỉ đứng điều tra trong **575 ms** và mở rộng phạm vi điều tra về **trung điểm giữa mồi nổ và người ném** (`(soundX + originX) / 2`, `(soundY + originY) / 2`).
   - **Lần 3+ (`repeatCount >= 3` trong 30s):** Hiệu quả chỉ còn **15% (0.15)**. The Listener nhận ra bẫy lặp; nó chỉ khựng lại **600 ms** và lập tức **quay đầu truy lùng thẳng về phía tọa độ người ném (`originX, originY`)**!
3. **Tín hiệu chuyển đổi trạng thái công bằng (Fair-Play Telegraphs):**
   - `PATROL` -> `ALERT`: Dấu `?` vàng xuất hiện, âm thanh nghi vấn phát ra.
   - `ALERT` -> `CHASE`: Đôi mắt đỏ rực sáng lóa, tiếng gầm thét rợn người, nhịp tim dồn dập.
   - `CHASE` -> `SEARCH`: Mất dấu quá 2.2s -> chuyển sang tìm kiếm tại vị trí cuối cùng nhìn thấy với dấu `?` vàng trong 4.5s.
   - `SEARCH` -> `RETURN`: Hết 4.5s không thấy gì -> từ bỏ và quay về tuyến tuần tra với 2.5s nghỉ ngơi không phát hiện lặp.

---

## 8. PHÂN TÁCH RẠCH RÒI THỰC THỂ SĂN ĐUỔI & HIỆN TƯỢNG KÝ ỨC THE ECHO ([TheEcho.ts](file:///G:/HOLLOW%20WOODS/src/entities/TheEcho.ts))

Để tránh người chơi nhầm lẫn bất công giữa Quái vật The Listener và Bóng ma ký ức The Echo:
1. **Lớp Thực Thể Riêng Biệt ([TheEcho.ts](file:///G:/HOLLOW%20WOODS/src/entities/TheEcho.ts)):**
   - Mở rộng từ `Phaser.GameObjects.Container`, sở hữu vầng hào quang sương lam bạc mờ ảo (`0xaed6f1`) và hình bóng lơ lửng chập chờn (`floatTween` chu kỳ 1350ms).
   - Chỉ xuất hiện vào **Hoàng Hôn (DUSK)**, **Đêm Sương (NIGHT)** hoặc tại các khu tàn tích cổ.
2. **Quy Tắc Sống Còn — TUYỆT ĐỐI KHÔNG CÓ SÁT THƯƠNG VẬT LÝ:**
   - Cung cấp phương thức `hasPhysicalDamage(): boolean { return false; }`.
   - Tuyệt đối không trừ máu (`stats.health`), không va chạm vật lý gây Game Over oan uổng cho người chơi.
3. **Cơ Chế Tan Biến & Manh Mối Cốt Truyện:**
   - Khi người chơi lại gần trong cự ly **48 px** hoặc vung vũ khí trúng vào bóng ma:
     - The Echo tự động kích hoạt `dissolve()`, phân rã thành làn khói sương mờ ảo trong 650ms.
     - Tạo áp lực tâm lý nhẹ lên tinh thần: rút **-3 điểm Bình Tâm** (`modifyComposure(-3)`).
     - Để lại dòng thông điệp ký ức chỉ dẫn phương hướng an toàn hoặc hé lộ cốt truyện cổ xưa.
4. **Cảm Biến Bùa Chuông Cổ ([EquipmentSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/EquipmentSystem.ts)):**
   - Khi người chơi đeo Bùa Chuông Cổ (`eqp_bell_ward_charm`), màn hình sẽ rung nhẹ (`shake`) và thông báo chuông ngân khi bước vào phạm vi 220px quanh điểm xuất hiện của The Echo.

---

## 9. 5 SỰ KIỆN THẾ GIỚI ĐỘNG ([WorldEventSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/WorldEventSystem.ts))

Được đăng ký đầy đủ chuẩn Content ID 4 tầng trong Content Registry (`content_registry.json`) và tự động xuất hiện ngẫu nhiên trong các phân khu rừng hoang dã lúc Hoàng Hôn hoặc Đêm Sương:

| STT | Tên Sự Kiện | Content ID | Runtime Key | Cơ Chế & Tác Động Gameplay |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Tiếng Chuông Vọng**<br>*(Bell Echo Event)* | `HW-EVT-BELL-000001` | `event_bell_echo` | Tiếng chuông đồng cổ kính ngân vang từ sâu trong Bellhollow xoa dịu tinh thần người chơi, **hồi phục ngay +5 Bình Tâm**. |
| **2** | **Đợt Sương Dâng**<br>*(Fog Surge Event)* | `HW-EVT-FOG-000001` | `event_fog_surge` | Luồng sương lạnh tràn tới trong **25 giây**: tầm nhìn bị thu hẹp **-35px**, tốc độ ngấm ẩm tăng **+25%**, nhưng bù lại tiếng gió hú giúp che giấu bước chân người chơi tốt hơn. |
| **3** | **Quạ Báo Động**<br>*(Crow Alarm Event)* | `HW-EVT-CROW-000001` | `event_crow_alarm` | Đàn quạ từ xa hoảng loạn kêu thất thanh, cảnh báo và đánh động The Listener di chuyển tới vị trí đó để điều tra. |
| **4** | **Bước Chân Giả**<br>*(False Footsteps Event)* | `HW-EVT-STEP-000001` | `event_false_footsteps` | Tiếng bước chân dồn dập rỗng tuếch vang vọng trong sương sâu tạo áp lực tâm lý giật mình cho người chơi nhưng không có thực thể ngay lập tức. |
| **5** | **Dấu Vết Trại Cũ**<br>*(Abandoned Camp Event)* | `HW-EVT-CAMP-000001` | `event_abandoned_camp` | Tìm thấy tàn tích bếp lửa còn sót lại của người đi rừng xưa: nhận ngay **1 Than Củi (`item_charcoal`)** và **1 Dây Thừng Rừng (`item_forest_rope`)**. |

---

## 10. THIẾT KẾ ÂM THANH MÔI TRƯỜNG WEB AUDIO API MỚI ([AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts))

Hệ thống bổ sung 2 phương thức tổng hợp âm học Web Audio độc lập:
1. **`playFalseFootsteps()`:**
   - 4 nhịp bước chân dồn dập cách nhau 320ms.
   - Sử dụng bộ lọc Bandpass với hệ số cộng hưởng cao (`filter.Q = 4.5`, tần số 320Hz / 280Hz) kết hợp bộ lọc sương The Veil Filter để tạo âm sắc rỗng tuếch xa xăm đặc trưng.
2. **`playWindWhoosh()`:**
   - Mô phỏng luồng gió lạnh sương mù tràn qua tán cây với bộ lọc Lowpass quét từ 180Hz lên 650Hz rồi thoải dần xuống 140Hz trong 3.0 giây.

---

## 11. KẾT QUẢ KIỂM THỬ TOÀN DIỆN HỆ THỐNG

### 11.1. Kiểm Tra TypeScript Type Safety
```powershell
npx tsc --noEmit
# Kết quả: EXIT CODE 0 (0 lỗi)
```

### 11.2. Kiểm Thử V14-P5-02 ([test_v14_p5_02.mjs](file:///G:/HOLLOW%20WOODS/scripts/test_v14_p5_02.mjs))
- **Kết quả:** **56/56 bài test PASS (100%)**.
  - Phần 1 (Trí nhớ ngắn hạn & Chống lặp mồi nhử): 17/17 PASS.
  - Phần 2 (Phân tách Hiện tượng Ký ức The Echo): 11/11 PASS.
  - Phần 3 (5 Sự kiện thế giới động & Content Registry): 15/15 PASS.
  - Phần 4 (Tích hợp GameScene & Âm thanh AudioManager): 13/13 PASS.

### 11.3. Bảng Tổng Hợp Toàn Bộ Kiểm Thử Dự Án (930/930 PASS)
| Bộ Kiểm Thử | Tệp Kịch Bản | Số Bài Test | Kết Quả |
| :--- | :--- | :---: | :---: |
| **V1.3 Regression Suite (22 module nền tảng)** | `run_v1_3_regression_suite.mjs` | **571** | **571/571 PASS** |
| **V1.4 Save Migration Không Phá Hủy** | `test_save_migration_v14.mjs` | **41** | **41/41 PASS** |
| **V1.4 Chu Kỳ Thời Gian 360s & Math Engine** | `test_time_system_v14.mjs` | **19** | **19/19 PASS** |
| **V1.4 Mưa Sương & Huy Hiệu Ẩm / Thân Nhiệt** | `test_weather_and_status_v14.mjs` | **26** | **26/26 PASS** |
| **V1.4 Cụm Trại Sanctuary Camp Hub** | `test_camp_system_v14.mjs` | **59** | **59/59 PASS** |
| **V1.4 Nông Trại Sanctuary Farm 5 Bước** | `test_v14_p3_02.mjs` | **49** | **49/49 PASS** |
| **V1.4 Hotbar 8 Ô & Bảng Chế Tạo Trượt Phải** | `test_v14_p4_01.mjs` | **34** | **34/34 PASS** |
| **V1.4 Trang Bị 4 Ô & Tự Vệ Sinh Tồn** | `test_v14_p4_02.mjs` | **41** | **41/41 PASS** |
| **V1.4 Sinh Vật Hoang Dã: Quạ Rừng & Bướm Đêm** | `test_v14_p5_01.mjs` | **34** | **34/34 PASS** |
| **V1.4 Trí Nhớ Listener, The Echo & World Events** | `test_v14_p5_02.mjs` | **56** | **56/56 PASS** |
| **TỔNG CỘNG HỆ THỐNG** | | **930** | **930/930 PASS (100%)** |

### 11.4. Đóng Gói Vite Production
```powershell
npm run build
# dist/index.html                    1.10 kB │ gzip:   0.56 kB
# dist/assets/index-pcy6s1eU.js  2,272.13 kB │ gzip: 537.02 kB
# ✓ built in 8.54s
```

---

## 12. KẾT LUẬN & SẴN SÀNG CHUYỂN SANG PHẦN 6

Phần 5 (**V14-P5-01 & V14-P5-02: Hệ Sinh Thái Rừng, Trí Nhớ Săn Đuổi & Sự Kiện Thế Giới**) đã chính thức hoàn thiện 100%:
- Quạ Rừng và Bướm Đêm Hổ Phách mang lại sức sống và sự hồi hộp cho khu rừng.
- The Listener trở nên thông minh và đáng sợ hơn với trí nhớ ngắn hạn chống lặp mồi nhử.
- The Echo được tách biệt thành hiện tượng ký ức huyền ảo, an toàn, không có sát thương vật lý oan uổng.
- 5 Sự Kiện Thế Giới ngẫu nhiên mang đến sự bất ngờ và không khí sống động cho từng chuyến thám hiểm.
- Toàn bộ 930 bài kiểm thử đều đạt 100%, bảo vệ tuyệt đối tính ổn định của trò chơi.

---

## 13. NÂNG CẤP V14-P8-03: CHUẨN HÓA HITBOX 4 HƯỚNG, ĐUỐC NHỰA THÔNG CẮM ĐẤT & LẮNG NGHE NGHI NGỜ 2S

### 13.1. Chuẩn Hóa Thông Số Hitbox 4 Hướng & Đẩy Lùi 3 Công Cụ Tự Vệ
- **Triết lý tự vệ sinh tồn:** Toàn bộ công cụ tự vệ tuyệt đối **KHÔNG CÓ ĐỘ BỀN (`hasDurability() === false`)**, không biến game thành chặt chém diệt quái (quái vật không thể bị tiêu diệt vĩnh viễn), mỗi đòn đánh đều tiêu hao Thể Lực (`staminaCost`) và phát ra sóng âm thanh bán kính 120px (`noiseRadius: 120`).
- **Thông số chuẩn hóa:**
  1. **Gậy Gỗ (Walking Staff — `wpn_walking_staff`):**
     - Tầm đánh (`reach`): **42px**, bán kính quét: **42px**.
     - Đẩy lùi (`knockback`): **20px**.
     - Làm choáng (`staggerDuration`): **0.5 giây (500ms)**.
     - Sát thương: **10 HP**.
     - Hồi chiêu (`attackCooldown`): **0.6 giây (600ms)**.
  2. **Giáo Gỗ Bịt Sắt (Iron-Tipped Spear — `wpn_iron_spear` / `HW-WPN-MEL-000001`):**
     - Đâm thẳng tầm xa (`reach`): **72px**, bán kính đâm: **54px**.
     - Đẩy lùi mạnh (`knockback`): **45px**.
     - Làm choáng (`staggerDuration`): **0.85 giây (850ms)**.
     - Sát thương: **25 HP**.
     - Hồi chiêu (`attackCooldown`): **0.9 giây (900ms)**.
  3. **Rìu Đi Rừng (Hunting Hatchet — `wpn_hunting_hatchet`):**
     - Tầm đánh cự ly gần (`reach`): **36px**, bán kính quét: **38px**.
     - Hiệu suất đốn gỗ: **Gấp đôi (`woodcuttingMultiplier: 2.0`)**.
     - Sát thương: **18 HP**.
     - Đẩy lùi (`knockback`): **25px**.
     - Làm choáng (`staggerDuration`): **0.6 giây (600ms)**.
     - Hồi chiêu (`attackCooldown`): **0.55 giây (550ms)**.
- **Phản ứng khi trúng đòn:**
  - Kẻ địch phát hiệu ứng chớp đỏ chói lọi (`setTint(0xff3333)` trong **160ms**).
  - Bị đẩy lùi thực tế theo vector tấn công (`Math.cos(angle) * knockbackDist`) kết hợp xung lực vật lý Arcade Body.

### 13.2. Cơ Chế Cắm Đuốc Nhựa Thông Xuống Đất ([GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))
- **Vật phẩm:** Đuốc Nhựa Thông Khẩn Cấp (`item_resin_flare` — `HW-ITM-CNS-000003`).
- **Cơ chế kích hoạt:** Bấm phím tắt `[3]` hoặc nhấp ô thao tác nhanh:
  - Nhân vật cắm cọc đuốc gỗ trực tiếp xuống đất tại tọa độ chân `(player.x, player.y)`.
  - Tiêu hao 1 đơn vị đuốc trong hành trang.
  - Ngọn lửa bập bùng ấm áp và quầng sáng hổ phách tồn tại chuẩn xác trong **15 giây (15000ms)**.
- **Tác động chiến thuật:**
  - **Xua tan sương mù:** Mặt nạ ánh sáng (`fogOfWarLayer.erase`) đục rỗng lớp sương mù dày đặc trong bán kính **200px** quanh ngọn đuốc.
  - **Xua đuổi The Echo:** Bất kỳ bóng hình ký ức The Echo nào nằm trong bán kính 200px của đuốc đều tự động tan biến thành sương khói.
  - **Ngăn The Listener tiếp cận:** Kích hoạt `repelByFlare(flareX, flareY, 15000)` đẩy quái vật lùi lại và không dám áp sát trong thời gian đuốc cháy.

### 13.3. Nhịp Lắng Nghe Nghi Ngờ 2 Giây Của The Listener ([ListenerAI.ts](file:///G:/HOLLOW%20WOODS/src/systems/ListenerAI.ts))
- **Công bằng cho người chơi (Fair Play):** Khi nghe thấy tiếng động lạ (vung vũ khí, bước chạy hoặc mồi ném [Q]):
  - The Listener lập tức dừng chuyển động (`setVelocity(0, 0)`).
  - Tự động xoay đầu (`setFlipX`) về hướng phát ra âm thanh.
  - Đứng yên lắng nghe nghi ngờ trong đúng **2.0 giây (`alertTimer = 2000`)** kèm biểu tượng `[?]` vàng trên đầu.
  - Cho người chơi 2 giây quý giá để kịp thời di chuyển vào bụi rậm hoặc cắm đuốc tự vệ.

### 13.4. Tương Tác Ánh Nhìn The Echo & EchoApparition ([TheEcho.ts](file:///G:/HOLLOW%20WOODS/src/entities/TheEcho.ts) & [EchoApparition.ts](file:///G:/HOLLOW%20WOODS/src/entities/EchoApparition.ts))
- **Thực thể bí danh:** [EchoApparition.ts](file:///G:/HOLLOW%20WOODS/src/entities/EchoApparition.ts) kế thừa trực tiếp từ `TheEcho`.
- **Tương tác ánh nhìn (Direct Gaze):**
  - **Chỉ xảy ra khi Đèn Lồng đang TẮT (`!isLanternLit`):** Nếu người chơi quay mặt nhìn trực diện vào bóng hình trong bóng tối, bóng ma sẽ gây lạnh gáy và **giảm nhẹ đúng 5 điểm Tĩnh Tâm (`modifyComposure(-5)`)**.
  - **Khi Đèn Lồng đang BẬT (`isLanternLit === true`):** Ánh sáng ấm áp bảo vệ tâm trí người chơi, hoàn toàn miễn nhiễm tụt tĩnh tâm khi nhìn vào Echo.
- **Tan biến thành tàn tro phát sáng (Glowing Ash Particles):**
  - Khi người chơi tiến sát trong cự ly **48px**, The Echo tan biến thành 9 hạt tàn tro lam ngọc phát sáng (`0xaed6f1`) lơ lửng bay lên bầu trời kèm lời thì thầm truyền thuyết (`spec.message`).

---

## 14. BẢNG TỔNG HỢP KIỂM THỬ BƯỚC V14-P8-03

```powershell
node scripts/test_v14_p8_03.mjs
# Kết quả: 16/16 PASSED (100%)

node scripts/test_v14_p7_02_release_gate.mjs
# Kết quả: 38/38 PASSED (100%)

npx tsc --noEmit
# Kết quả: EXIT CODE 0 (0 lỗi)

npm run build
# dist/index.html                    1.10 kB │ gzip:   0.56 kB
# dist/assets/index-DrA3-BBM.js  2,342.25 kB │ gzip: 556.31 kB
# ✓ built in 7.97s
```

---

## 15. TÍCH HỢP SINH VẬT SÓI XƯƠNG (SKULL WOLF — BƯỚC V14-P8-08)

### 15.1. Chuẩn Hóa Tài Nguyên Đồ Họa Từ Gói Skullwolf / Massacre Sprite Sheet
- **Nguồn tài nguyên:** Trích xuất từ gói `Pixel_Art/Skullwolf/` (`Massacre Sprite Sheet.png` 448×256 px và `Massacre.aseprite`).
- **Xử lý Node.js (`pngjs`):**
  - **Spritesheet hành động:** [skull_wolf_sheet.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/monsters/skull_wolf_sheet.png) gồm 4 hàng × 7 cột khung hình chuẩn hóa 64×64 px:
    - Hàng 0 (Y=0): Hoạt ảnh `idle` thở nhịp nhàng (6 frames).
    - Hàng 1 (Y=64): Hoạt ảnh `lunge` chồm vồ mồi tốc độ cao (5 frames).
    - Hàng 2 (Y=128): Hoạt ảnh `walk` rình rập trong sương mù (4 frames).
    - Hàng 3 (Y=192): Hoạt ảnh `death` tan rã thành tàn tro phát sáng (7 frames).
    - Bàn chân được căn chỉnh đồng bộ tại `y=58` (khớp hoàn hảo với trọng tâm `origin (0.5, 0.90625)` trong Arcade Physics).
    - Tự động phủ bóng đổ mềm elip mờ (`rgba(0, 0, 0, 0.25)`) dưới bàn chân để ăn khớp mặt đất rừng.
  - **Chân dung minh họa:** [portrait_skull_wolf.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/monsters/portrait_skull_wolf.png) kích thước 64×64 px, cắt riêng cận cảnh hộp sọ sói sắc bén, nền viền vignette gothic lam đen.

### 15.2. Đăng Ký Hệ Thống Định Danh 4 Tầng & Bảng Vật Phẩm / Công Thức
- **ContentRegistry 4 tầng ([content_registry.json](file:///g:/HOLLOW%20WOODS/src/data/content_registry.json) & [registryData.ts](file:///g:/HOLLOW%20WOODS/src/registry/registryData.ts)):**
  - **Asset IDs:** `HW-AST-CHAR-SKULLWOLF` (spritesheet), `HW-AST-PORT-SKULLWOLF` (portrait).
  - **Mục quái vật:** Content ID `HW-MON-BEAST-000001`, runtimeKey `mon_skull_wolf`.
  - **Mục vật phẩm rơi:** Content ID `HW-ITM-MAT-000004`, runtimeKey `mat_skull_fang` (Nanh Xương Cổ).
- **Vật phẩm & Công thức chế tạo ([items.json](file:///g:/HOLLOW%20WOODS/src/data/items.json)):**
  - Vật phẩm `mat_skull_fang`: Vật phẩm nguyên liệu quý rơi từ tro tàn Sói Xương khi bị tiêu diệt (tối đa x10/ô).
  - Công thức `craft_skull_fang_spear`: Rèn Giáo Gỗ Bịt Sắt Gia Cố Nanh Sói (+3 sát thương, tăng tầm đẩy lùi).
  - Công thức `craft_skull_fang_charm`: Chế tác Bùa Nanh Sói Xương (giảm 25% sát thương nhận từ quái thú hoang dã).

### 15.3. Trí Tuệ Nhân Tạo & Tập Tính Săn Đêm ([SkullWolfEntity.ts](file:///g:/HOLLOW%20WOODS/src/entities/SkullWolfEntity.ts) & [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts))
- **Địa bàn sinh sống:** Chỉ xuất hiện khi trời chập tối và đêm đen (`DUSK` và `NIGHT`) tại `crooked_path`, `deep_forest` và rìa `silent_mire`. Tuyệt đối không bao giờ bước qua ranh giới an toàn của Làng Bellhollow.
- **Máy trạng thái AI 6 bậc:**
  - `PATROL`: Đi tuần tra chậm rãi quanh lãnh thổ trong màn đêm.
  - `STALK`: Đánh hơi và rình rập người chơi từ rìa màn sương mù, phát ra tiếng xương lách cách (`playBoneRattle`).
  - `FEAR_LIGHT`: **Sợ hãi ánh lửa** — Khi người chơi bật Đèn Lồng [F], đứng gần Lửa Trại hoặc cắm Đuốc Nhựa Thông, Sói Xương lập tức chùn bước, lùi giật lùi về bóng tối ngoài bán kính ánh sáng (`lightRadius + 45px`), phát tiếng gầm gừ đe dọa (`playWolfGrowl`).
  - `LUNGE`: **Tấn công chồm vồ** — Khi người chơi ở trong bóng tối (đèn tắt/cạn dầu) trong phạm vi 160px, sói chồm tới với vận tốc 195px/s (`playWolfLunge`). Gây 15 HP, 15 Composure, rung màn hình và đẩy văng người chơi. Có cơ chế chống dính đa chấn thương lặp (`hasHitPlayerInCurrentLunge`).
  - `HURT`: Khi bị trúng vũ khí người chơi vung chém, sói nhấp nháy đỏ (`setTint(0xff4444)`), bị đẩy lùi theo góc va chạm và choáng 550ms.
  - `DISSOLVE`: Nhận đủ 3 sát thương, Sói Xương phát tiếng tan rã (`playWolfDissolve`), tan biến thành tro tàn và rơi ra 1 Nanh Xương Cổ (`mat_skull_fang`).
- **Kinh động Quạ Rừng:** Khi Sói Xương di chuyển trong phạm vi 130px quanh quạ đang đậu, quạ lập tức giật mình cất cánh kêu toáng lên báo động.

### 15.4. Sổ Tay Sinh Vật Bestiary & Chân Dung Nghệ Thuật ([JournalModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/JournalModal.ts))
- **Mở khóa tự nhiên:** Tự động mở khóa trang Sổ Tay khi người chơi tiến lại gần quan sát thấy Sói Xương trong bán kính 260px hoặc hạ gục cá thể.
- **Khung chân dung nghệ thuật:** Khi mở mục Sói Xương trong Sổ Tay, góc trên bên phải trang phải hiển thị chân dung hộp sọ sói viền vàng kim (`#d4af37`) nổi bật trên nền đá thạch anh tối. Khi chưa quan sát, hiển thị khung bí ẩn với dấu chấm hỏi `❓`.

### 15.5. Nghiệm Thu Kiểm Thử Tự Động Toàn Diện
- `node scripts/verify_v14_p8_08_skull_wolf.mjs`: **42/42 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `node scripts/test_v14_step_8_1.mjs`: **71/71 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi (EXIT CODE 0)**.
- `npm run build`: **Đóng gói thành công (dist/assets/index-*.js)**.

---

## 16. TÍCH HỢP NHÓM QUÁI VẬT BÓNG TỐI (SHADOW MONSTERS — BƯỚC V14-P8-09)

### 16.1. Chuẩn Hóa Tài Nguyên Đồ Họa Từ 3 Gói Quái Vật Bóng Tối
- **1. Quạ Bóng Tối (Shadow Crow) — từ gói Crow Animations:**
  - Gộp các hoạt ảnh `crow_idle.png`, `crow_walk.png`, `crow_jump.png`, `crow_attack.png`, `crow_damage.png`, `crow_death2.png` thành spritesheet chuẩn hóa [shadow_crow_sheet.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/monsters/shadow_crow_sheet.png):
  - Kích thước 384×384 px (6 hàng × 6 cột 64×64 px).
  - Row 0: `idle` đậu nghỉ quan sát (4 frames).
  - Row 1: `walk` đi bộ trên cành/đá (4 frames).
  - Row 2: `jump` vỗ cánh cất tiếng caw báo động (6 frames).
  - Row 3: `attack` sà xuống mổ quấy rối (5 frames).
  - Row 4: `damage` bị thương khi trúng đòn (3 frames).
  - Row 5: `death` tan biến thành khói đen (6 frames).
- **2. Bóng Mắt Sương Mù (Mist Stalker / Shadow Eyes) — từ gói monster_pack_1_free:**
  - Xử lý `monster001eyes.png` thành spritesheet chuẩn [shadow_eyes_sheet.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/monsters/shadow_eyes_sheet.png):
  - Kích thước 384×144 px (3 hàng × 8 cột 48×48 px).
  - Row 0: `idle` cặp mắt lập lòe trong sương (8 frames).
  - Row 1: `look` liếc ngang đảo mắt rùng rợn (8 frames).
  - Row 2: `dissolve` bốc hơi tan rã thành sương khói khi bị ánh sáng rọi vào (8 frames).
- **3. Trùm Bóng Tối Khổng Lồ (Abyssal Shade Behemoth) — từ gói 2023.10.6 dark fantasy big boss free:**
  - Gộp các dải hoạt ảnh và hiệu ứng địa chấn thành [shadow_big_boss_sheet.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/bosses/shadow_big_boss_sheet.png):
  - Kích thước 1280×640 px (8 hàng × 16 cột 80×80 px).
  - Căn đồng bộ trọng tâm chân tại `y=67` và tâm chấn `y=67` (khớp hoàn hảo giữa thân quái vật và sóng xung kích địa chấn).
  - Row 0: `idle` thở nhịp nhàng (16 frames).
  - Row 1: `walk` bước chân nặng nề làm rung chuyển mặt đất (16 frames).
  - Row 2..4: `combo_slam` chuỗi 3 pha vung tay đập đất tạo sóng xung kích địa chấn lan tỏa (16 frames/hàng).
  - Row 5: `vulnerable_miss` tư thế đánh trượt vào không khí bị khựng lại lộ sơ hở trong 2.5 giây.
  - Row 6: `hit` nhấp nháy choáng váng khi nhận đòn (16 frames).
  - Row 7: `death` nổ tung bóng tối sụp đổ (16 frames).
  - **Chân dung minh họa Boss:** [portrait_shadow_big_boss.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/bosses/portrait_shadow_big_boss.png) kích thước 64×64 px, cắt cận cảnh đầu trùm với viền vàng kim quý tộc.

### 16.2. Đăng Ký Hệ Thống Định Danh 4 Tầng & Bảng Vật Phẩm / Công Thức
- **ContentRegistry 4 tầng ([content_registry.json](file:///g:/HOLLOW%20WOODS/src/data/content_registry.json) & [registryData.ts](file:///g:/HOLLOW%20WOODS/src/registry/registryData.ts)):**
  - **Asset IDs:**
    - `HW-AST-CHAR-SHADOWCROW`: Quạ Bóng Tối (`shadow_crow_sheet.png`)
    - `HW-AST-CHAR-SHADOWEYES`: Bóng Mắt Sương Mù (`shadow_eyes_sheet.png`)
    - `HW-AST-CHAR-SHADOWBOSS`: Trùm Bóng Tối Khổng Lồ (`shadow_big_boss_sheet.png`)
    - `HW-AST-PORT-SHADOWBOSS`: Chân dung Trùm Bóng Tối (`portrait_shadow_big_boss.png`)
  - **Mục Quái Vật & Boss:**
    - `HW-MON-SHADOW-000001` (`mon_shadow_crow`): Quạ Bóng Tối
    - `HW-MON-SHADOW-000002` (`mon_shadow_eyes`): Bóng Mắt Sương Mù
    - `HW-MON-BOSS-000003` (`boss_shadow_behemoth`): Trùm Bóng Tối Khổng Lồ
  - **Mục Vật Phẩm Rơi:**
    - `HW-ITM-MAT-000005` (`mat_shadow_essence`): Mảnh Tinh Chất Bóng Tối (x5/ô).
- **Vật phẩm & Công thức mới ([items.json](file:///g:/HOLLOW%20WOODS/src/data/items.json)):**
  - `craft_abyssal_ward_charm`: Thanh Tẩy Bùa Hộ Mệnh Vực Thẳm (kết hợp Mảnh Tinh Chất Bóng Tối với Bùa Chuông Đồng và Nhựa Thông Cổ, tạo khiên chống hoảng loạn tối thượng).

### 16.3. Trí Tuệ Nhân Tạo (AI) & Cơ Chế Chiến Đấu ([ShadowMonsters.ts](file:///g:/HOLLOW%20WOODS/src/entities/ShadowMonsters.ts) & [WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts))
- **1. Quạ Bóng Tối (ShadowCrowEntity):**
  - **Báo động The Listener:** Đậu trên cành khô ở Outer Woods / Deep Forest. Khi phát hiện người chơi chạy trong cự ly 200px, quạ kêu sắc nhọn (`playShadowCrowCaw`) và phát sóng âm đánh động The Listener trực tiếp tìm tới.
  - **Sà mổ quấy rối (Dive Attack):** Nếu người chơi đứng trong bóng tối quá 2.5s không bật đèn lồng, quạ sà xuống cắn xé (`playShadowCrowAttack`), gây 8 HP và -10 Composure. Bị đánh trúng sẽ tan biến thành khói đen.
- **2. Bóng Mắt Sương Mù (ShadowEyesEntity):**
  - Lơ lửng ẩn hiện trong sương mù dày tại Deep Forest và Silent Mire vào ban đêm.
  - **Rút cạn Bình Tâm:** Khi người chơi trong cự ly 170px và tắt đèn, mắt phát tiếng thì thầm quỷ dị (`playShadowEyesGaze`) rút 8 Composure mỗi giây.
  - **Khắc tinh ánh sáng (Dissolve by Light):** Khi người chơi bật Đèn Lồng [F] rọi tới (`dist <= lightRadius + 24px`), cặp mắt lập tức phát tiếng xèo xèo bốc hơi (`playShadowEyesDissolve`), tan biến vĩnh viễn và mở khóa Bestiary.
- **3. Trùm Bóng Tối Khổng Lồ (ShadowBehemothBoss):**
  - Trấn giữ vùng cấm Silent Mire và Miếu Chuông Phế Tích.
  - **Chuỗi đòn đập đất địa chấn (Combo Fissure):** Gầm vang trời (`playBehemothRoar`), vung tay đập đất tạo rung chấn màn hình và cảnh báo đỏ mặt đất. Người chơi đứng gần bị trúng 25 HP, 20 Composure và bị văng ra xa.
  - **Cơ chế sơ hở phản công (Vulnerable Miss):** Sau khi tung đòn hụt (người chơi lùi tránh kịp thời), Trùm bị khựng lại trong **2.5 giây** (`vulnerable_miss`), thân xác phát sáng lân tinh lam (`0xbbddff`). Trong khoảng thời gian này, mọi đòn đánh của người chơi vào Boss đều được **nhân đôi sát thương (x2 Critical)**!
  - Khi HP = 0, Boss gầm tiếng tan vỡ (`playBehemothDefeat`), nổ tung thành tro tàn và rơi ra **Mảnh Tinh Chất Bóng Tối** (`mat_shadow_essence`).
- **Ranh giới an toàn (Safe Zone):** Cả 3 loài quái vật bóng tối đều bị chặn tuyệt đối ngoài rìa Làng Bellhollow (`x <= 1620`), Nông Trại Sanctuary và Cửa Ngõ Sương Mù.

### 16.4. Sổ Tay Sinh Vật (Bestiary [J]) & Âm Thanh Đặc Trưng ([JournalModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/JournalModal.ts) & [AudioManager.ts](file:///g:/HOLLOW%20WOODS/src/audio/AudioManager.ts))
- **Bestiary:** Bổ sung đầy đủ 3 mục `shadow_crow`, `shadow_eyes`, `shadow_behemoth` vào hệ thống quan sát tự nhiên.
- **Chân dung nghệ thuật:** Khi chọn Trùm Bóng Tối Khổng Lồ trong Sổ Tay, góc trên bên phải hiển thị chân dung [portrait_shadow_big_boss.png](file:///g:/HOLLOW%20WOODS/public/assets/characters/bosses/portrait_shadow_big_boss.png) đóng khung viền vàng kim `#d4af37`.
- **Âm thanh tổng hợp:** 9 phương thức Web Audio mới tái hiện chân thực từ tiếng rít quạ, tiếng mắt bốc hơi xèo xèo đến tiếng bước chân làm rung chuyển đất và tiếng gầm trầm đục của Boss.

### 16.5. Nghiệm Thu Kiểm Thử Tự Động Bước V14-P8-09
- `node scripts/verify_v14_p8_09_shadow_monsters.mjs`: **60/60 PASS (100%)**.
- `node scripts/verify_v14_p8_08_skull_wolf.mjs`: **42/42 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `node scripts/test_v14_step_8_1.mjs`: **71/71 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi (EXIT CODE 0)**.
- `npm run build`: **Đóng gói hoàn tất không lỗi (dist/assets/index-XUWRsU9w.js)**.


