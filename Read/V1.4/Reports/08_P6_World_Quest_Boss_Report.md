# BÁO CÁO KỸ THUẬT V14-P6-01 & V14-P6-02
## KHÁM PHÁ TIỂU KHU, NHIỆM VỤ 5 NPC & TRẬN TRÙM GIẢI ĐỐ KẺ NUỐT TIẾNG CHUÔNG

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P6-01` & `V14-P6-02`
- **Mục tiêu:**
  1. Xây dựng 3 tiểu khu / địa danh khám phá có mục đích gameplay và câu chuyện rõ ràng:
     - **Xưởng Chuông Bỏ Hoang (Abandoned Bell Workshop — `sub_bell_workshop` / `HW-ZON-SUB-000001`):** Nhánh ven Outer Woods; nơi tìm thấy Phụ Kiện Sắt Rèn Cổ Ngữ (`mat_runed_iron`), Khuôn Đúc Chuông Cũ (`item_bell_mold`) và Nhật Ký Thợ Rèn (`lore_blacksmith_journal`).
     - **Hầm Rễ Cổ (Root Cellar — `sub_root_cellar` / `HW-ZON-SUB-000002`):** Lối xuống ngầm liên kết với Sanctuary Farm; chứa Rễ Thuốc Cổ Quý Hiếm (`item_medicinal_roots`), câu đố cửa khóa rễ cây và Bích Họa Nguồn Gốc Màn Sương (`lore_fog_origin`).
     - **Khoảng Trống Thì Thầm (Whispering Clearing — `sub_whispering_clearing` / `HW-ZON-SUB-000003`):** Nằm giữa Outer Woods và Deep Forest; sở hữu 3 cột đá vọng âm (`inspect_echo_pillar_1/2/3`) và bài học phân biệt âm thanh thật - ảo với The Echo.
  2. Mở rộng chuỗi nhiệm vụ phụ liên kết mật thiết với 5 NPC làng Bellhollow:
     - **Thợ rèn Bram (`SQ01_RUNED_IRON`):** Giao nộp Phụ Kiện Sắt Rèn Cổ Ngữ để rèn/nâng cấp trang bị.
     - **Bà lão Edda (`SQ02_BELL_MEMORY`):** Giải mã ký ức Khuôn Đúc Chuông Cũ.
     - **Dược sĩ Neris (`SQ03_CELLAR_TEA`):** Thu hoạch Rễ Thuốc Cổ tại Hầm Rễ Cổ để sắc Trà Thảo Dược An Thần.
     - **Đội trưởng Garth (`SQ04_CLEARING_PATROL`):** Tuần tra 3 cột đá Khoảng Trống Thì Thầm, nhận thưởng Ủng Đi Rừng (`eqp_trail_boots`).
     - **Cậu bé đưa tin Finn (`SQ05_FINN_INTEL`):** Lắng nghe tin tức và các lối mòn bí mật.
  3. Nâng cấp Sổ Tay Lữ Khách (`JournalModal.ts`):
     - **Tab 1 [1. NHIỆM VỤ]:** Bộ lọc `[TẤT CẢ]`, `[CHÍNH]`, `[PHỤ]`, danh sách nhiệm vụ và bảng chi tiết mục tiêu.
     - **Tab 2 [2. CỔ THƯ & MANH MỐI]:** Phân tách 2 chế độ `[📜 CỔ THƯ & MANH MỐI]` (bảo toàn 100% thuật toán phân trang Modulo cho Gate 1B) và `[🐾 SỔ TAY SINH VẬT]` (hồ sơ 4 loài sinh vật: Quạ Rừng, Bướm Đêm, The Echo, The Listener).
     - **Tab 3 [3. BẢN ĐỒ THẾ GIỚI]:** Hiển thị 10 phân khu canon + 3 tiểu khu mới, phân biệt trạng thái đã khám phá và vùng bí ẩn.
  4. Triển khai trận chạm trán cao trào dạng Giải đố dưới áp lực (Puzzle-Boss Encounter — `V14-P6-02`):
     - Trùm: **Kẻ Nuốt Tiếng Chuông (The Mire Warden — `mon_mire_warden` / `HW-MON-BOSS-000001`)** tại Miếu Chuông / Mạch Rễ (`broken_bell_shrine`).
     - Thay thanh máu đỏ bằng **Thanh Độ Ổn Định Phong Ấn** 3 nấc cổ ngữ trên HUD đỉnh màn hình.
     - Tự động tạo **Checkpoint Save an toàn** ngay trước khi Boss thức tỉnh.
     - **Pha 1 — Dẫn Dụ & Làm Choáng (Lure & Stagger 3.5s):** Boss bị thu hút bởi Mồi Tạo Tiếng Động [Q] hoặc tiếng chạy nước rút, húc vào Trụ Cổ Ngữ phát sáng gây choáng 3.5s để người chơi dùng [E] hoặc Giáo Gỗ kích hoạt phong ấn nấc 1 & 2.
     - **Pha 2 — Bóng Tối & Thắp Sáng Lại (Darkness & Re-light):** Sương đặc bao phủ, triệu hồi 2 ảo ảnh The Echo giả; người chơi dùng Đèn Lồng [F] hoặc Đuốc thắp sáng lại 3 Đài Cổ Ngữ xung quanh tế đàn để làm mù Boss và khóa ấn tối hậu nấc 3.
     - **Kết thúc & Phần thưởng cốt truyện:** Màn sương đặc tan dần, Boss hóa đá vĩnh viễn thành tượng rêu hoa; trao thưởng **Trái Tim Mạch Rễ Cổ (`relic_heart_of_roots`)** độc bản (không rơi đồ để farm lặp lại) và Lưỡi Chuông Đồng (`quest_bronze_clapper`).
  5. Đạt 100% kiểm thử: 68/68 bài test V14-P6-01, 41/41 bài test V14-P6-02, 571/571 bài test hồi quy V1.3, `npx tsc --noEmit` 0 lỗi.
- **Ngày thực hiện:** 18/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (1,006+ TESTS PASS TOÀN DỰ ÁN)**

---

## 1. THIẾT KẾ & XÂY DỰNG 3 TIỂU KHU KHÁM PHÁ ƯU TIÊN

Cả 3 tiểu khu đều được đăng ký đầy đủ vào hệ thống mã chuẩn V1.4, liên kết 2 chiều với thế giới bên ngoài và tích hợp logic phân tầng [WorldGatingSystem.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts):

| Tiểu Khu | Content ID & RuntimeKey | Vị Trí & Lối Vào | Tầng Quy Tắc (Gating) | Tài Nguyên & Khám Phá |
| :--- | :--- | :--- | :--- | :--- |
| **Xưởng Chuông Bỏ Hoang** | `HW-ZON-SUB-000001`<br>`sub_bell_workshop` | Nhánh phía Nam Outer Woods (`to_bell_workshop`) | `LAYER_1_CORE`<br>(Luôn mở ven rừng) | • Phụ Kiện Sắt Rèn Cổ Ngữ (`mat_runed_iron`)<br>• Khuôn Đúc Chuông Cũ (`item_bell_mold`)<br>• Cổ thư: Nhật Ký Thợ Rèn (`lore_blacksmith_journal`) |
| **Hầm Rễ Cổ** | `HW-ZON-SUB-000002`<br>`sub_root_cellar` | Cửa sập ngầm Sanctuary Farm (`to_root_cellar`) | `LAYER_1_CORE`<br>(Luôn mở dưới nông trại) | • Rễ Thuốc Cổ Quý Hiếm (`item_medicinal_roots`)<br>• Cơ chế khóa rễ ánh sáng (`solve_cellar_lock`)<br>• Cổ thư: Bích Họa Nguồn Gốc Sương (`lore_fog_origin`) |
| **Khoảng Trống Thì Thầm** | `HW-ZON-SUB-000003`<br>`sub_whispering_clearing` | Nhánh Tây Deep Forest (`to_whispering_clearing`) | `LAYER_2_FRONTIER`<br>(Cần tiến trình Q03) | • 3 Cột đá vọng âm (`inspect_echo_pillar_1/2/3`)<br>• Cơ chế phân biệt tiếng bước chân ảo The Echo<br>• Căn cứ hoàn thành nhiệm vụ trinh sát của Garth |

---

## 2. CHUỖI NHIỆM VỤ PHỤ GẮN VỚI 5 NPC LÀNG BELLHOLLOW

Toàn bộ 5 nhiệm vụ phụ được đăng ký chính thức vào `sideQuestLog` ([lore.json](file:///G:/HOLLOW%20WOODS/src/data/lore.json)), có hội thoại tương ứng trong [dialogues.json](file:///G:/HOLLOW%20WOODS/src/data/dialogues.json) và tích hợp hoàn thành tại [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts):

| Mã Nhiệm Vụ | Tên Nhiệm Vụ & NPC Giao | Điều Kiện & Luồng Hoàn Thành | Phần Thưởng & Giá Trị |
| :--- | :--- | :--- | :--- |
| **`SQ01_RUNED_IRON`** | **Sắt Rèn Cổ Ngữ**<br>(Thợ rèn Bram) | Tiến vào Xưởng Chuông Bỏ Hoang, nhặt Phụ Kiện Sắt Rèn Cổ Ngữ (`mat_runed_iron`) đem về bàn giao cho Bram. | Mở khóa rèn trang bị nâng cấp, kinh nghiệm rèn đúc. |
| **`SQ02_BELL_MEMORY`** | **Ký Ức Quả Chuông Cũ**<br>(Bà lão Edda) | Tìm thấy Khuôn Đúc Chuông Cũ (`item_bell_mold`) tại Xưởng Chuông, mang về cho Edda giải mã truyền thuyết tiếng chuông. | Mở khóa Bùa Chuông Cổ (`eqp_bell_ward_charm`), phục hồi 50 Bình Tâm. |
| **`SQ03_CELLAR_TEA`** | **Dược Liệu Hầm Rễ**<br>(Dược sĩ Neris) | Xuống Hầm Rễ Cổ, thu hoạch Rễ Thuốc Cổ Quý Hiếm (`item_medicinal_roots`), giải cơ quan rễ cây và nấu Trà An Thần. | 3 Trà Thảo Dược An Thần, xoa dịu hoảng loạn, hồi phục thân nhiệt. |
| **`SQ04_CLEARING_PATROL`**| **Trinh Sát Vùng Thì Thầm**<br>(Đội trưởng Garth) | Đi vào Khoảng Trống Thì Thầm, chạm và kiểm tra đủ 3 Cột Đá Vọng Âm, đối mặt với tiếng bước chân ảo của The Echo. | **Ủng Đi Rừng (`eqp_trail_boots`)** giúp di chuyển vững chãi trên bùn lầy. |
| **`SQ05_FINN_INTEL`** | **Tin Đồn Lối Mòn Bí Mật**<br>(Cậu bé Finn) | Nói chuyện với Finn tại bến giếng làng, lắng nghe tin đồn về cửa sập Hầm Rễ và lối mòn dẫn vào Xưởng Chuông. | Mở khóa đánh dấu 3 tiểu khu trên bản đồ thế giới. |

---

## 3. THIẾT KẾ TRẬN ĐẤU TRÙM GIẢI ĐỐ: KẺ NUỐT TIẾNG CHUÔNG (V14-P6-02)

### 3.1. Triết Lý Kinh Dị Giải Đố (Non-Hack-and-Slash Boss Encounter)
- Trận đấu trùm diễn ra tại **Miếu Chuông Phế Tích (`broken_bell_shrine`)** sau khi người chơi đã giải quyết thành công chuỗi Cổ Ngữ Đầm Lầy (`mire_pillars_solved`).
- **Tuyệt đối không sử dụng thanh máu đỏ (HP bar):** Không biến tựa game kinh dị sinh tồn thành game hành động chặt chém vô hồn. Người chơi sống sót bằng sự nhạy bén âm thanh, kỹ năng định vị trong sương mù và giải đố không gian dưới áp lực sinh tử.
- **Thanh Độ Ổn Định Phong Ấn (Boss Seal Bar) trên HUD ([UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts)):**
  - Khung đồng chạm khắc cổ ngữ đặt tại đỉnh màn hình (`640, 42`).
  - 3 nấc phong ấn thiêng liêng:
    1. `ᚱ ANH NĂNG CỔ`: Phong ấn dòng năng lượng thượng cổ.
    2. `ᚦ ĐỊA MẠCH RỄ`: Phong ấn mạch rễ ngầm đầm lầy.
    3. `ᛉ BẢO HỘ CHUÔNG`: Khóa ấn vĩnh viễn bảo vệ tiếng chuông làng.
  - Vòng sáng ấn rực ngọc lam (`0x00d2d3`) kèm âm vang chuông đồng ngân nga mỗi khi một nấc phong ấn được kích hoạt.
- **Điểm lưu an toàn tự động (Safe Checkpoint Save):**
  - Ngay khi người chơi tiếp cận Miếu Chuông trước lúc Boss thức tỉnh, trò chơi tự động tạo bản lưu checkpoint: `SaveManager.saveGame('TRƯỚC MIẾU CHUÔNG — ĐIỂM HỒI SINH AN TOÀN', 'broken_bell_shrine', 4120, 280)`.
  - Nếu gặp tai nạn hoặc tử vong trong trận đấu, người chơi lập tức hồi sinh ngay trước cửa Miếu Chuông với đầy đủ trang bị nguyên vẹn.

---

### 3.2. Thực Thể Boss & 2 Pha Hành Vi Chi Tiết ([MireWardenBoss.ts](file:///G:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts))

#### A. Trạng Thái Vòng Đời Của Boss
- **`DORMANT` ➔ `AWAKENING`:** Ẩn mình dưới mạch rễ ngầm, gầm rống trồi lên làm rung chuyển màn hình (`camera.shake(1200, 0.02)`). Cổng Tây bị rào chắn rễ cây cổ thụ phong tỏa tạm thời.
- **`STALK`:** Di chuyển rình mò chậm rãi (~75 px/s), lắng nghe âm thanh tiếng bước chân.
- **`INVESTIGATING`:** Lần theo hướng phát ra tiếng động vừa nghe thấy (~115 px/s).
- **`CHARGING`:** Khi phát hiện âm thanh lớn (Mồi Tạo Tiếng Động [Q] hoặc chạy nước rút), Boss rống lên cuồng nộ và lao húc với tốc độ kinh hoàng (~240 px/s).
- **`STAGGERED` (Bị Choáng Chuẩn 3.5s):** Khi đâm trúng Trụ Cổ Ngữ phát sáng, Boss bị choáng váng trong đúng **3500ms (`STAGGER_DURATION_MS = 3500`)**, không thể di chuyển hay tấn công, thân thể rung lắc và hiển thị nhãn tương tác `[E] KÍCH HOẠT ẤN PHONG ẤN!`.
- **`PHASE_TRANSITION` ➔ `ENSHROUDED`:** Chuyển sang Pha 2 khi bị phong ấn 2 nấc đầu. Thân thể biến chuyển màu tím thẫm ma mị, mắt rực tím đầm lầy.
- **`DEFEATED`:** Bị phong ấn 3/3 nấc, hóa đá vĩnh viễn thành tượng cổ phủ đầy rêu và hoa nở.

#### B. Pha 1 — Dẫn Dụ & Làm Choáng (Lure & Stagger)
1. Đấu trường bố trí 2 Trụ Cổ Ngữ: Trụ Tây Bắc (`4350, 180`) và Trụ Đông Bắc (`4650, 180`). Ban đầu Trụ Tây Bắc phát sáng hào quang ngọc lam rực rỡ (`0x00d2d3`).
2. Người chơi ném **Mồi Tạo Tiếng Động [Q]** vào gần Trụ phát sáng hoặc chạy nước rút tạo tiếng bước chân đánh động.
3. Kẻ Nuốt Tiếng Chuông lập tức chuyển sang trạng thái `CHARGING` lao thẳng về vị trí phát ra âm thanh.
4. Khi Boss húc trúng Trụ Cổ Ngữ phát sáng: Trụ vỡ vụn, mảnh đá văng tung tóe, Boss bị **Choáng Váng trong 3.5 giây**.
5. Người chơi tiến lại gần nhấn phím `[E]` hoặc vung vũ khí **Giáo Gỗ / Gậy Gỗ** để khóa ấn nấc 1 (`ᚱ ANH NĂNG CỔ`).
6. Trụ Đông Bắc bừng sáng tiếp nối, quy trình dẫn dụ lặp lại để hoàn thành nấc 2 (`ᚦ ĐỊA MẠCH RỄ`).

#### C. Pha 2 — Bóng Tối, Ảo Ảnh The Echo & Thắp Sáng Lại (Darkness & Re-light)
1. Khi hoàn thành nấc 2, Boss rống lên cuồng nộ giải phóng màn sương mù đặc quánh (`thick mist`), làm suy giảm mạnh tầm nhìn bóng tối.
2. Hai ảo ảnh tàn dư ký ức **The Echo** xuất hiện lơ lửng quanh tế đàn, phát ra những lời thì thầm ma quái và tiếng bước chân ảo để làm rối loạn khả năng phán đoán của người chơi.
3. 3 Đài Cổ Ngữ xung quanh tế đàn (Tây `4280, 310`, Nam `4500, 390`, Đông `4720, 310`) bị dập tắt chìm trong bóng đêm.
4. Người chơi phải bật **Đèn Lồng [F]** hoặc cắm **Đuốc Nhựa Thông** chạy tới tương tác thắp sáng lại từng Đài Cổ Ngữ.
5. Khi cả 3 Đài Cổ Ngữ bừng cháy ánh lửa hổ phách ấm áp:
   - Toàn bộ ảo ảnh The Echo bị thanh tẩy và tan biến vào màn sương.
   - Bệ Thờ Trung Tâm (`4500, 250`) tỏa ánh sáng vàng kim thánh thiện (`0xf1c40f`).
   - Boss bị ánh sáng cổ ngữ thiêng liêng làm mù lòa, lảo đảo ngã gục ngay tại trung tâm Bệ Thờ!
6. Người chơi tiến lại Bệ Thờ nhấn `[E]` thực hiện nghi thức khóa ấn tối hậu nấc 3 (`ᛉ BẢO HỘ CHUÔNG`).

---

### 3.3. Kết Thúc Nghi Thức & Di Vật Cốt Truyện Tối Thượng
- Khi nấc phong ấn 3/3 hoàn thành:
  - Màn sương độc quanh Miếu Chuông tan biến, ánh bình minh hổ phách rọi qua tán cây.
  - Rào chắn rễ cây cổ thụ tại cổng Tây tự động tiêu tan.
  - Boss hóa thành bức tượng đá phủ rêu hoa cổ kính yên nghỉ muôn đời trong lòng đất mẹ.
  - Người chơi nhận được phần thưởng di vật cốt truyện độc bản:
    - **Trái Tim Mạch Rễ Cổ (`relic_heart_of_roots` — `HW-ITM-RELIC-000001`):** Di vật nhiệm vụ cao quý (`category: 'quest'`, `maxStack: 1`), không thể vứt bỏ hay xếp chồng.
    - **Lưỡi Chuông Đồng Cổ (`quest_bronze_clapper`):** Bổ sung an toàn vào túi đồ nếu người chơi chưa nhặt trước đó.
  - Ghi nhận 2 cờ cốt truyện vĩnh viễn: `boss_mire_warden_defeated` và `root_seal_restored`.
  - **Tuyệt đối không có cơ chế hồi sinh hay rơi đồ farm lặp lại (No Farm Loop):** Giữ trọn vẹn giá trị cao trào và ý nghĩa cốt truyện duy nhất của chuyến hành trình sinh tồn.
  - Tự động tạo bản lưu chiến thắng an toàn: `SaveManager.saveGame('CHIẾN THẮNG MIẾU CHUÔNG — PHONG ẤN HOÀN TẤT', 'broken_bell_shrine', 4500, 260)`.

---

## 4. BẢNG TỔNG HỢP KIỂM THỬ KỸ THUẬT

### 4.1. Kết Quả Kiểm Thử Bộ Mới `test_v14_p6_02.mjs`
Toàn bộ 41/41 kịch bản kiểm thử chuyên sâu về trận trùm giải đố đều đạt kết quả xuất sắc:

```text
======================================================================
   HOLLOW WOODS V1.4 — BỘ KIỂM THỬ TRẬN TRÙM GIẢI ĐỐ MIẾU CHUÔNG (V14-P6-02)
======================================================================

--- PHẦN 1: Triết Lý Kinh Dị Giải Đố & Thanh Độ Ổn Định Phong Ấn ---
  [PASS] UIScene khai báo container riêng cho Boss Seal Bar
  [PASS] UIScene có phương thức showBossSealBar()
  [PASS] UIScene có phương thức updateBossSealBar()
  [PASS] UIScene có phương thức hideBossSealBar()
  [PASS] UIScene khởi tạo buildBossSealBar() trong chu trình create()
  [PASS] Thanh phong ấn hiển thị 3 nấc cổ ngữ đặc trưng
  [PASS] Tự động lưu điểm hồi sinh an toàn trước khi Boss thức tỉnh
  [PASS] Hiển thị thông báo lưu an toàn trên màn hình

--- PHẦN 2: Thực Thể Boss & Pha 1 Dẫn Dụ - Choáng ---
  [PASS] Tệp mã nguồn MireWardenBoss.ts tồn tại
  [PASS] MireWardenBoss định nghĩa đủ các trạng thái DORMANT, CHARGING, STAGGERED
  [PASS] MireWardenBoss định nghĩa đủ các trạng thái PHASE_TRANSITION, ENSHROUDED, DEFEATED
  [PASS] Thời gian làm choáng Boss chuẩn xác 3.5 giây (3500ms)
  [PASS] Boss theo dõi trạng thái isStaggered
  [PASS] Boss có phương thức stagger()
  [PASS] Boss có phương thức applySeal() tăng nấc phong ấn
  [PASS] Boss tiếp nhận âm thanh đánh động từ mồi nhử hoặc tiếng chạy
  [PASS] Boss có phương thức lao húc triggerCharge()
  [PASS] GameScene kết nối Mồi Tạo Tiếng Động [Q] kích hoạt Boss lao húc
  [PASS] GameScene làm choáng Boss khi đâm trúng Trụ Cổ Ngữ phát sáng
  [PASS] GameScene có phương thức handleBossSealInteraction()
  [PASS] Tương tác [E] xuất hiện khi tiếp cận Boss bị choáng
  [PASS] Tấn công bằng vũ khí khi Boss bị choáng cũng kích hoạt phong ấn

--- PHẦN 3: Pha 2 — Bóng Tối, Ảo Ảnh The Echo & Thắp Sáng Lại ---
  [PASS] MireWardenBoss có phương thức chuyển đổi enterPhase2()
  [PASS] GameScene kích hoạt startMireWardenPhase2() khi đạt nấc phong ấn 2
  [PASS] GameScene triệu hồi ảo ảnh The Echo đánh lạc hướng
  [PASS] Màn sương đặc bao trùm đấu trường trong Pha 2
  [PASS] GameScene quản lý danh sách 3 Đài Cổ Ngữ
  [PASS] GameScene có phương thức handleRelightBrazier()
  [PASS] Yêu cầu người chơi bật Đèn Lồng [F] hoặc dùng Đuốc để thắp sáng đài lửa
  [PASS] Vẽ ngọn lửa bừng sáng khi đài lửa được kích hoạt
  [PASS] Kiểm tra điều kiện thắp sáng đủ 3 Đài Cổ Ngữ
  [PASS] GameScene có phương thức khóa ấn tối hậu handleBossFinalSeal()

--- PHẦN 4: Kết Thúc Nghi Thức & Di Vật Cốt Truyện ---
  [PASS] items.json chứa Di vật Trái Tim Mạch Rễ Cổ (relic_heart_of_roots, Quest Item)
  [PASS] Di vật không xếp chồng (maxStack = 1)
  [PASS] SaveManager KNOWN_ITEM_KEYS đăng ký relic_heart_of_roots
  [PASS] GameScene có phương thức finishMireWardenDefeat()
  [PASS] Trao thưởng di vật Trái Tim Mạch Rễ Cổ cho người chơi
  [PASS] Đặt cờ vĩnh viễn boss_mire_warden_defeated
  [PASS] Đặt cờ vĩnh viễn root_seal_restored
  [PASS] Giải phóng rào chắn rễ cây cổ thụ ở cổng Tây
  [PASS] Boss hóa đá vĩnh viễn thành tượng rêu hoa cổ thụ (không thể tái sinh/farm lặp lại)

======================================================================
KẾT QUẢ KIỂM THỬ: 41 PASSED, 0 FAILED (100%)
======================================================================
```

### 4.2. Bảng Theo Dõi Kiểm Thử Toàn Diện
- `npx tsc --noEmit`: **0 LỖI (Exit Code 0)**.
- `run_v1_3_regression_suite.mjs`: **571/571 BÀI TEST PASS (100%)**.
- Toàn bộ 11 bộ kiểm thử V1.4: **PASS 100%**.
- **Tổng số test toàn dự án:** **1,006+ TEST PASS TUYỆT ĐỐI (0 THẤT BẠI)**.
- `npm run build`: **Bản build Vite hoàn tất thành công trong 7.13s**.
