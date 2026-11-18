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

---

## 5. BƯỚC V14-P8-10: TÍCH HỢP NHÓM HIỆP SĨ TÀ ÁC (EVIL KNIGHTS FACTION)

### 5.1. Mục Tiêu & Cơ Chế Gameplay
Triển khai nhóm kẻ địch hiệp sĩ hộ vệ cổ xưa đã sa ngã vào Màn Sương Hắc Ám với 3 cấp bậc chiến đấu rõ rệt:
1. **Đơn vị 1 — Hiệp Sĩ Sa Ngã (`mon_fallen_knight` / `HW-MON-KNIGHT-000001`):**
   - **Tài nguyên:** `2D_SL_Knight_v1.0_3` chuẩn hóa thành spritesheet `fallen_knight_sheet.png` (512x384 px, 8x6 lưới 64x64 px; các hàng: idle, run, attack, pray, hurt, death) và chân dung `portrait_fallen_knight.png` (64x64 px).
   - **Tập tính:** Quỳ cầu nguyện (`pray`) bên phế tích. Khi phát hiện tiếng bước chân chạy ồn hoặc ánh đèn lồng, đứng dậy tuốt kiếm truy đuổi (`run`) và tung chuỗi đòn chém (`attack`). Sau chuỗi đòn chém, hắn rơi vào trạng thái hồi sức sơ hở (`vulnerable`), nhận x2 sát thương từ đòn phản công của người chơi.
   - **Rơi đồ:** Cành Gỗ Khô (`res_dry_wood`) hoặc Đá Lửa (`res_flint`).
2. **Đơn vị 2 — Kỵ Binh Hắc Ám (`mon_dread_horseman` / `HW-MON-KNIGHT-000002`):**
   - **Tài nguyên:** `PixelHorse_V1.0/64x64_Atlas_HorseRider_II_Complete.png` chuẩn hóa thành spritesheet `dread_horseman_sheet.png` (448x384 px, 7x6 lưới 64x64 px; các hàng: idle, trot, gallop, charge, rear, hurt) và chân dung `portrait_dread_horseman.png` (64x64 px).
   - **Tập tính:** Cưỡi chiến mã tuần tra các ngả đường mòn (`crooked_path`, `outer_woods`). Khi phát hiện mục tiêu, chiến mã hí vang giương vó (`rear_prep` kèm âm thanh `playHorseCharge()`), sau đó phóng nước đại càn quét thẳng hàng (`charge`) tốc độ cao. Nếu né được vào bụi rậm hai bên đường, kỵ sĩ bị khựng lại (`cooldown`) để lộ sườn cho người chơi dùng Giáo phản kích.
   - **Rơi đồ:** Đá Lửa (`res_flint`) / Nhựa Cây Thông (`res_tree_resin`).
3. **Đơn vị 3 — Chỉ Huy Hiệp Sĩ Trùm Mũ (`boss_hooded_knight` / `HW-MON-BOSS-000002`):**
   - **Tài nguyên:** `Hooded Knight Sprites` chuẩn hóa thành spritesheet `hooded_knight_sheet.png` (3040x640 px, 19x4 lưới 160x160 px; các hàng: idle, powerup, attack, stagger) và chân dung `portrait_hooded_knight.png` (64x64 px).
   - **Tập tính:** Trấn thủ ngưỡng cửa Rừng Sâu và Tàn tích Đền Cổ (`deep_forest`, `ancient_rune_puzzle`). Sở hữu lượng máu cao (HP = 10). Tụ năng lượng hắc ám (`powerup` kèm âm thanh `playKnightPowerup()`). Nếu người chơi áp sát rọi Đèn Lồng [F] cực mạnh (<= 75px) hoặc ném Đuốc Nhựa Thông, hắn bị ngắt chiêu và rơi vào trạng thái Choáng Váng (`stagger`) nhận x2 sát thương. Nếu không bị ngắt, hắn bung nhát chém cuồng nộ quét diện rộng (`attack`).
   - **Rơi đồ:** Đảm bảo rơi vật phẩm nhiệm vụ độc bản: **Huy Hiệu Hiệp Sĩ Tha Hóa (`quest_corrupted_crest` / `HW-ITM-QST-000002`)**.
4. **Vật phẩm & Công thức chế tạo:**
   - Vật phẩm: `quest_corrupted_crest` (Huy Hiệu Hiệp Sĩ Tha Hóa) trong [items.json](file:///G:/HOLLOW%20WOODS/src/data/items.json).
   - Công thức: `craft_purified_crest_ward` (Thanh Tẩy Huy Hiệu Tha Hóa cùng Nhựa Thông và Thảo Dược thành Bùa Chuông Đồng).

### 5.2. An Toàn Vùng Làng (Safe Zone Compliance)
Tất cả 3 đơn vị Hiệp Sĩ Tà Ác tuân thủ nghiêm ngặt ranh giới Safe Zone:
- Ranh giới làng Bellhollow (`zoneId === 'bellhollow' && playerX <= 1620`), Nông trại Trú ẩn (`sanctuary_farm`), Cửa ngõ Sương mù (`fog_crossing`).
- Nếu người chơi lùi vào vùng an toàn hoặc đang ẩn nấp trong bụi rậm (`isPlayerHiding`), Hiệp Sĩ Sa Ngã lập tức quay về quỳ cầu nguyện, Kỵ Binh Hắc Ám tiếp tục tuần tra và Chỉ Huy Hiệp Sĩ trở về vị trí canh gác.

### 5.3. Âm Thanh Tổng Hợp Procedural Web Audio API
Bổ sung 5 phương thức âm thanh thời gian thực trong [AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts):
- `playArmorClank()`: Tiếng va chạm giáp sắt vang rền (metallic clank & parry resonance).
- `playHorseCharge()`: Tiếng vó ngựa dồn dập & ngựa hí báo hiệu cú phóng nước đại.
- `playKnightSwordSlash()`: Tiếng vung kiếm chém sắc bén xé gió.
- `playKnightPowerup()`: Tiếng tụ năng lượng bóng tối ù rền tăng dần tần số.
- `playKnightDefeat()`: Tiếng giáp sắt đổ ầm xuống đất và vỡ vụn kim loại khi ngã xuống.

### 5.4. Kết Quả Kiểm Thử Nghiệm Thu V14-P8-10
- `node scripts/verify_v14_p8_10_evil_knights.mjs`: **63/63 PASS (100%)**.
- `node scripts/verify_v14_p8_09_shadow_monsters.mjs`: **60/60 PASS (100%)**.
- `node scripts/verify_v14_p8_08_skull_wolf.mjs`: **42/42 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi**.
- `npm run build`: **Bản build đóng gói hoàn tất thành công trong 7.70s**.

---

## PHẦN 6: BÁO CÁO THIẾT KẾ LẠI TUYẾN ĐƯỜNG VÒNG THÁP CHUÔNG & CHẶN LỐI THẲNG (V14-P8-13)

### 6.1. Mục Tiêu & Cơ Chế Gameplay
Bước **V14-P8-13** tái cấu trúc toàn diện lộ trình tiếp cận khu vực Tháp Chuông (Bell Tower / The Broken Bell Shrine) từ làng Bellhollow:
- **Loại bỏ lối đi thẳng:** Chặn đứt con đường thẳng một mạch từ Cổng Đông sang Miếu Chuông để biến hành trình tiếp cận thành một cuộc thám hiểm sinh tồn đậm chất kỳ bí và thử thách.
- **Tăng chiều sâu phiêu lưu:** Kéo dài thời gian trải nghiệm, buộc người chơi phải quản lý Dầu Đèn (Lantern Oil) và Bình Tâm (Composure) trên lộ trình dài hơn, chú ý quan sát biển chỉ đường, tận dụng các chỗ ẩn nấp và thu thập nguyên liệu sinh tồn dọc đường.

### 6.2. Chướng Ngại Vật Cầu Đá Cổ Bị Sập & Thông Điệp Dẫn Hướng
Tại vị trí lối đi thẳng cũ (`crooked_path` tại $x = 1790, y = 280$):
1. **Dựng chướng ngại vật môi trường tự nhiên kết hợp cốt truyện:**
   - **Vực sương sâu (`Deep Mist Chasm`):** Lòng vực sâu thẳm đen kịt ($72 \times 88$ px) với sương mù cuộn xoáy mờ ảo dưới đáy vực, chia cắt hoàn toàn hai bờ.
   - **Mố cầu đá gãy đôi (`Collapsed Stone Piers`):** Các phiến đá granite cổ kính rêu phong nứt vỡ nham nhở, sập nghiêng cắm xuống lòng vực sương.
   - **Thân cây đại thụ đổ ngang (`Massive Fallen Tree Trunk`):** Khối gỗ sồi cổ thụ mục sẫm màu dài 80px chắn ngang trọn vẹn bề rộng lòng đường, phủ rêu nhung xanh thẫm và các cụm nấm mộc nhĩ / nấm cam.
   - **Cổng sắt rỉ sét khóa chặt (`Rusted Iron Gate with Heavy Chains`):** Hàng rào chông sắt nhọn gỉ hoen màu đồng cháy, xà sắt gia cố quấn chằng chịt dây xích đen và ổ khóa đồng niêm phong kiên cố.
   - **Khối va chạm Arcade Physics (`cp_collapsed_bridge_blocker`):** Kích thước $38 \times 86$ px với `isSolid: true` và `immovable = true`, ngăn tuyệt đối người chơi và quái vật đi xuyên qua.
2. **Cơ chế dẫn hướng người chơi (`GameScene.ts` & `zones.json`):**
   - Đăng ký `collapsed_shrine_bridge` (bán kính tương tác 55px).
   - Khi người chơi lại gần lối tắt bị chặn này ($< 65$px) hoặc nhấn `[E]` kiểm tra, hiển thị thông điệp dẫn hướng rõ ràng (kèm cooldown chống lặp 6 giây):
     > *"Cây cầu đá dẫn thẳng tới Tháp Chuông đã sập nát... Mình buộc phải tìm đường vòng qua Rừng Ngoài và Đường Mòn Quanh Co."*
   - Đồng bộ thông điệp này khi người chơi kiểm tra Cổng Đông (`inspect_east_gate`).

### 6.3. Tuyến Đường Vòng Uốn Lượn 3 Chặng (Winding Detour)
1. **Chặng 1: Từ Làng Bellhollow rẽ sang Rừng Ngoài (Outer Woods):**
   - Nền địa hình (`outer_woods_ground_baked_v14`) vẽ lại mạng lưới đường đất với các khúc cua chữ S uốn lượn rõ nét xuyên qua rặng thông và sồi rậm rạp:
     + Khúc cua 1: Cửa rừng Bắc $(1210, 560)$ uốn sang Tây $(1170, 625)$ men theo rặng sồi.
     + Khúc cua 2: Lượn chữ S sang Đông qua Trại Thợ Săn $(1270, 735) \rightarrow (1330, 730)$.
     + Khúc cua 3: Lượn vòng qua Bãi Suối Rừng $(1440, 810)$ và phiến đá cuội vượt suối nối sang The Crooked Path $(1555, 775)$.
2. **Chặng 2: Vòng qua Đường Mòn Quanh Co (The Crooked Path) sát bìa Rừng Sâu:**
   - Nền địa hình (`crooked_path_ground_baked_v14`) đón nhánh đường từ Outer Woods $(1610, 500) \rightarrow (1660, 440) \rightarrow (1750, 410) \rightarrow (1860, 360)$.
   - Uốn lượn ngược lên nhánh Bắc: $(1980, 280) \rightarrow (2060, 200) \rightarrow (2140, 150) \rightarrow (2280, 150)$ chạy dọc bìa Rừng Sâu và gần Xưởng Chuông Bỏ Hoang.
   - Dựng Biển Chỉ Đường gỗ cổ (`sign_detour_winding`) tại ngã rẽ $(2060, 170)$:
     > *"📜 Biển Chỉ Đường: ◄ Hướng Bắc: Bìa Rừng Sâu & Xưởng Chuông | Lối Vòng Đầm Lầy & Tháp Chuông: Phía Đông Nam ►"*
3. **Chặng 3: Vòng ngược xuống phía Nam qua Cây Cầu Gỗ Phụ Xuyên Sương tiếp cận Tháp Chuông:**
   - Tuyến đường từ nhánh Bắc vòng cong ngược xuống phía Nam: $(2280, 150) \rightarrow (2420, 220) \rightarrow (2540, 300) \rightarrow (2660, 365) \rightarrow (2740, 390)$.
   - **Cây Cầu Gỗ Phụ Xuyên Sương (`createDetourWoodenBridge`):** Tọa độ $(2740, 390)$, dài 68px, rộng 34px bắc qua khe sương lầy. Ván gỗ sồi cũ màu nâu ấm, đà dầm dọc, 4 cọc lan can buộc dây thừng rừng (`mat_forest_rope`), viền rêu xanh và sương mù mờ ảo dưới gầm cầu.
   - Nối tiếp mượt mà vào Đầm Lầy Tĩnh Lặng $(2880, 380)$ dẫn thẳng tới sân sau Miếu Chuông Phế Tích (`broken_bell_shrine`).

### 6.4. Bố Trí Nơi Ẩn Nấp, Nguyên Liệu Thu Thập & Quạ Cảnh Báo
1. **Điểm Ẩn Nấp (Stealth Hiding Spots):**
   - `hide_bush_ow_s_curve` $(1180, 650)$ — Bụi Rậm Khúc Cua Chữ S trong Rừng Ngoài.
   - `hide_bush_cp_detour` $(2520, 330)$ — Bụi Rậm Khe Sương trong Crooked Path.
   - `hide_tree_detour_bridge` $(2680, 390)$ — Thân Cây Rỗng Cầu Phụ trong Crooked Path.
2. **Điểm Thu Thập Nguyên Liệu Sinh Tồn (`GameScene.ts` & `zones.json`):**
   - `gather_wood_ow_1` $(1240, 660)$: Nhặt 2 Gỗ Khô (`res_dry_wood`).
   - `gather_resin_ow_1` $(1360, 630)$: Thu thập 2 Nhựa Cây (`res_tree_resin`).
   - `gather_herbs_ow_1` $(1480, 830)$: Hái 2 Thảo Dược Bạc (`res_herbs`).
   - `gather_wood_cp_1` $(2060, 210)$: Nhặt 2 Gỗ Khô (`res_dry_wood`).
   - `gather_resin_cp_1` $(2240, 150)$: Thu thập 2 Nhựa Thông (`res_tree_resin`).
   - `gather_herbs_cp_1` $(2640, 350)$: Hái 2 Thảo Dược Bạc (`res_herbs`).
   - Tích hợp cờ trạng thái (`gathered_*`) ngăn nhặt lặp vô hạn, kèm âm thanh tương tác `playInteract()`.
3. **Quạ Cảnh Báo & Động Vật Hoang Dã (`WildlifeSystem.ts`):**
   - `crow_bridge_collapsed` $(1750, 260)$: Đậu trên cọc gỗ mố cầu sập, cất tiếng kêu báo động hiểm nguy vực sâu.
   - `crow_detour_bridge` $(2710, 370)$: Đậu gần Cầu Gỗ Phụ, bay hoảng loạn khi quái vật hoặc người chơi tiến tới gần.
   - Nâng `MAX_CROWS_PER_ZONE` lên 8 và `MAX_GLOBAL_ENTITIES` lên 28 để bảo đảm hiệu năng mượt mà 60 FPS.

### 6.5. Kết Quả Kiểm Thử Nghiệm Thu V14-P8-13
- `node scripts/verify_v14_p8_13_detour_path.mjs`: **32/32 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `node scripts/verify_v14_p8_12_menu_hud_redesign.mjs`: **26/26 PASS (100%)**.
- `node scripts/verify_v14_p8_10_evil_knights.mjs`: **63/63 PASS (100%)**.
- `node scripts/verify_v14_p8_09_shadow_monsters.mjs`: **60/60 PASS (100%)**.
- `node scripts/verify_v14_p8_08_skull_wolf.mjs`: **42/42 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: **Bản build sản xuất hoàn tất thành công trong 10.28s**.

---

## 7. BƯỚC V14-P8-14A: CHUẨN HÓA BỘ SPRITE CHO NPC HIỆP SĨ CANH LỬA & TÁCH BẠCH TÀI NGUYÊN VỚI HIỆP SĨ TÀ ÁC

### 7.1. Mục Tiêu & Chuẩn Hóa Tài Nguyên Đồ Họa (Campfire Knight)
1. **Nguồn tài nguyên gốc:**
   - Sử dụng gói tài nguyên `Pixel_Art/2D_SL_Knight_v1.0_3` với bố cục ô block chuẩn $128 \times 64$ px theo `_Info.txt`.
   - Nhân vật hiệp sĩ mang bộ giáp bạc nguyên bản sáng bóng, tôn nghiêm và kiên định, đại diện cho NPC thân thiện bên đống lửa sưởi ấm tâm trí người lữ hành.
2. **Xử lý trích xuất chuẩn hóa bằng Node.js (`pngjs`) (`scripts/extract_campfire_knight_assets.mjs`):**
   - **Hoạt ảnh quỳ chống kiếm canh lửa (`campfire_knight_pray_sheet.png`):**
     + 12 khung hình trích từ `Pray.png` (4 cột $\times$ 3 hàng khối $128 \times 64$ px).
     + Kích thước dải ngang chuẩn: $768 \times 64$ px ($12 \times 64$ px).
     + Cắt vùng giữa $[32..95]$ ($64$ px) theo chiều ngang và $[0..63]$ ($64$ px) theo chiều dọc.
     + Căn điểm tựa bàn chân bottom-center tại $(32, 63)$, nền RGBA trong suốt.
     + Thêm bóng đổ elip mềm dưới chân bàn chân: tâm $(32, 60)$, bán trục $rx = 14, ry = 4$, độ mờ alpha tối đa $0.25$ (64/255) với hiệu ứng suy giảm tâm êm dịu.
     + Lưu đồng bộ tại `public/assets/characters/npcs/` và `public/assets/characters/villagers/`.
   - **Hoạt ảnh đứng trò chuyện (`campfire_knight_idle_sheet.png`):**
     + 8 khung hình trích từ `Idle.png` (2 cột $\times$ 4 hàng khối $128 \times 64$ px).
     + Kích thước dải ngang chuẩn: $512 \times 64$ px ($8 \times 64$ px).
     + Cắt vùng giữa $64 \times 64$ px, căn điểm tựa bàn chân bottom-center $(32, 63)$, nền RGBA trong suốt.
     + Bóng đổ elip mềm chân alpha $0.25$.
     + Lưu đồng bộ tại `public/assets/characters/npcs/` và `public/assets/characters/villagers/`.
   - **Chân dung NPC Hiệp Sĩ Canh Lửa (`portrait_campfire_knight.png`):**
     + Khung hình $64 \times 64$ px chuẩn hóa hội thoại thoại.
     + Trích xuất vùng đầu vai từ frame 0 của `Idle.png` (vùng $32 \times 32$ px tại $x \in [48..79], y \in [16..47]$ bao trọn nón giáp bạc, khe mắt visor, gorget và giáp vai).
     + Phóng to $2\times$ bằng thuật toán Nearest-Neighbor pixel-perfect, nền RGBA trong suốt.
     + Lưu đồng bộ tại `public/assets/characters/npcs/` và `public/assets/characters/villagers/`.

### 7.2. Tách Bạch Hoàn Toàn Tài Nguyên Với Nhóm Hiệp Sĩ Tà Ác (`src/entities/EvilKnights.ts`)
1. **Thiết lập Hợp đồng Phân Tách Tài Nguyên (`EVIL_KNIGHTS_ASSET_CONTRACT`):**
   - Cam kết phân định rõ ràng giữa phe phái Hiệp Sĩ Tà Ác trong rừng và NPC Hiệp Sĩ Canh Lửa thân thiện bên lửa trại:
     + **Phe Kẻ Thù Tha Hóa (`EVIL_KNIGHTS`):**
       * `FallenKnightEntity`: Sử dụng `SPRITE_FALLEN_KNIGHT` (`assets/characters/enemies/fallen_knight_sheet.png`, $512 \times 384$ px).
       * `DreadHorsemanEntity`: Sử dụng `SPRITE_DREAD_HORSEMAN` (`assets/characters/enemies/dread_horseman_sheet.png`, $448 \times 384$ px từ `PixelHorse_V1.0`).
       * `HoodedKnightBoss`: Sử dụng `SPRITE_HOODED_KNIGHT` (`assets/characters/bosses/hooded_knight_sheet.png`, $3040 \times 640$ px từ `Hooded Knight Sprites`).
     + **Phe Đồng Minh Thân Thiện (`NPCS`):**
       * `Campfire Knight`: Sử dụng riêng biệt bộ giáp bạc nguyên bản (`campfire_knight_pray_sheet.png`, `campfire_knight_idle_sheet.png`, `portrait_campfire_knight.png` trong `assets/characters/npcs/`).
2. **Nghiêm cấm dùng chung & chồng lấn:**
   - `EvilKnights.ts` tuyệt đối không import hay tham chiếu đến các sprite hay chân dung của Campfire Knight.
   - Giữ nguyên vẹn toàn bộ tệp tài nguyên quái vật kẻ thù đã hoàn thiện ở bước V14-P8-10.

### 7.3. Tích Hợp Hệ Thống Cốt Lõi (Constants, Preload & Content Registry)
1. **Định danh Hằng Số (`src/config/Constants.ts`):**
   - `SPRITE_CAMPFIRE_KNIGHT_PRAY = 'campfire_knight_pray_sheet'`
   - `SPRITE_CAMPFIRE_KNIGHT_IDLE = 'campfire_knight_idle_sheet'`
   - `PORTRAIT_CAMPFIRE_KNIGHT = 'portrait_campfire_knight'`
2. **Khởi nạp Tài Nguyên (`src/scenes/PreloadScene.ts`):**
   - Nạp 2 spritesheet ($64 \times 64$ frame size) và 1 image portrait trong `PreloadScene`.
3. **Đăng Ký Danh Mục Nội Dung Chuẩn (`content_registry.json` & `registryData.ts`):**
   - Đăng ký 3 Asset Records: `HW-AST-CHAR-CAMPFIREKNIGHT-PRAY`, `HW-AST-CHAR-CAMPFIREKNIGHT-IDLE`, `HW-AST-PORT-CAMPFIREKNIGHT`.
   - Đăng ký thực thể NPC mới: `HW-NPC-KNIGHT-000001` (Hiệp Sĩ Canh Lửa — Campfire Knight) với `runtimeKey`: `npc_campfire_knight`, trạng thái `PROPOSED_V1_4`.

### 7.4. Kết Quả Kiểm Thử Nghiệm Thu V14-P8-14A
- `node scripts/verify_v14_p8_14a_campfire_knight.mjs`: **41/41 PASS (100%)**.
- `node scripts/verify_v14_p8_10_evil_knights.mjs`: **63/63 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: **Bản build sản xuất đóng gói hoàn tất thành công trong 7.17s**.

---

## 8. BƯỚC V14-P8-14B: ĐƯA NPC HIỆP SĨ CANH LỬA VÀO VỊ TRÍ QUỲ CANH GÁC BÊN LỬA TRẠI SANCTUARY CAMP TẠI LÀNG BELLHOLLOW VÀ KÍCH HOẠT VÙNG BẢO VỆ KHU NGHỈ NGƠI

### 8.1. Nạp Tài Nguyên & Đăng Ký Hoạt Ảnh (`src/scenes/PreloadScene.ts`)
1. **Khởi nạp tài nguyên đồ họa:**
   - Nạp spritesheet quỳ cầu nguyện `campfire_knight_pray_sheet.png` ($768 \times 64$ px, 12 frames $64 \times 64$).
   - Nạp spritesheet đứng trò chuyện `campfire_knight_idle_sheet.png` ($512 \times 64$ px, 8 frames $64 \times 64$).
   - Nạp ảnh chân dung pixel art sắc nét `portrait_campfire_knight.png` ($64 \times 64$ px).
2. **Đăng ký hoạt ảnh:**
   - `anim_campfire_knight_pray`: 12 frames, tốc độ 4 fps, lặp vô tận (`repeat: -1`).
   - `anim_campfire_knight_idle`: 8 frames, tốc độ 6 fps, lặp vô tận (`repeat: -1`).
   - Đồng bộ và hỗ trợ song song các key alias `npc_campfire_knight_pray` và `npc_campfire_knight_idle` trong `NPCEntity.ts`.

### 8.2. Bố Trí Thực Thể & Hành Vi NPC (`src/entities/NPCEntity.ts`, `src/scenes/GameScene.ts`)
1. **Tọa độ canh gác bên bếp lửa:**
   - Đặt thực thể `npc_campfire_knight` tại tọa độ $(818, 270)$, ngay sát bên cạnh Lửa Trại Trung Tâm Sanctuary Campfire $(780, 260) \rightarrow (798, 275)$ tại làng Bellhollow.
   - Tư thế mặc định: Quỳ chống kiếm với hoạt ảnh `anim_campfire_knight_pray`, mặt hướng sang trái (`setFlipX(true)`) nhìn thẳng vào ngọn lửa hồng.
2. **Hộp va chạm vật lý & Phân tầng độ sâu:**
   - Hộp va chạm chân nhỏ gọn $22 \times 14$ px với offset $(-11, -7)$, cố định `immovable = true` chống người chơi đi xuyên qua thân NPC.
   - Độ sâu Y-Sorting chuẩn xác: Khởi tạo với `depth = 270` và liên tục cập nhật theo `Math.floor(this.y)` trong vòng lặp game.
3. **Bong bóng nhắc tương tác `[E]`:**
   - Khung bo góc bán trong suốt màu đen tuyền ánh xanh (`0x090e15`, alpha $0.70$) viền vàng kim (`0xd4af37`, alpha $0.75$).
   - Tự động thay đổi độ mờ theo cự ly tiếp cận ($0.45 \rightarrow 1.0$) và nhịp bập bùng êm ái, không che khuất tầm nhìn.

### 8.3. Kích Hoạt Vùng Bảo Vệ Khu Nghỉ Ngơi (`src/systems/CampSanctuarySystem.ts`, `src/systems/SurvivalSystem.ts`)
1. **Bảo vệ an toàn tuyệt đối khỏi quái vật:**
   - Bán kính bảo hộ: $180$ px quanh tâm Lửa Trại làng Bellhollow có Hiệp Sĩ Canh Lửa bảo hộ.
   - Khi nhân vật chính ở trong vòng ánh lửa Sanctuary Camp, toàn bộ các đòn tấn công của quái vật (Sói Xương, Quạ Bóng Tối, Trùm Bóng Tối, Hiệp Sĩ Sa Ngã, Kỵ Binh Hắc Ám, Chỉ Huy Hiệp Sĩ Trùm Mũ và Kẻ Lắng Nghe) đều bị vô hiệu hóa an toàn tuyệt đối.
   - Cơ chế phòng thủ xua đuổi `applySanctuaryRepulsion()`: Bất kỳ quái vật nào dám bước vào ranh giới $180$ px đều bị áp lực thánh hỏa đẩy dạt ra ngoài ($dist \ge 200$ px), triệt tiêu vận tốc và hủy bỏ trạng thái rình rập/lao tới.
2. **Gia tốc hồi phục sinh tồn (+20% Composure & Moisture Drying):**
   - Tăng thêm $+20\%$ tốc độ hồi phục Bình Tâm (`composureMult = 1.20`), nâng tốc độ hồi phục từ $+8.0 \rightarrow +9.6$ điểm/s.
   - Tăng thêm $+20\%$ tốc độ hong khô Độ Ẩm (`dryingMult = 1.20`), giúp người chơi ráo nước nhanh chóng sau khi lội đầm lầy hoặc đi dưới mưa sương.
3. **Chuyển đổi dáng đứng - quỳ mượt mà:**
   - Khi người chơi nhấn `[E]` bắt đầu đối thoại: Hiệp sĩ lập tức đứng dậy, chuyển sang dáng đứng trò chuyện `anim_campfire_knight_idle` và quay mặt về phía người chơi.
   - Khi cuộc trò chuyện kết thúc: Hiệp sĩ trở lại tư thế quỳ chống kiếm `anim_campfire_knight_pray` và hướng mặt về ngọn lửa hồng.

### 8.4. Kết Quả Kiểm Thử Nghiệm Thu V14-P8-14B
- `node scripts/verify_v14_p8_14b_campfire_knight_sanctuary.mjs`: **61/61 PASS (100%)**.
- `node scripts/verify_v14_p8_14a_campfire_knight.mjs`: **41/41 PASS (100%)**.
- `node scripts/verify_v14_p8_14c_campfire_knight_quests.mjs`: **84/84 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: **Bản build sản xuất đóng gói hoàn tất thành công trong 7.54s**.

---

## 9. BƯỚC V14-P8-14C: ĐĂNG KÝ ĐỊNH DANH, CHUỖI 3 NHIỆM VỤ TIẾN TRÌNH & HỘI THOẠI HIỆP SĨ CANH LỬA

### 9.1. Đăng Ký Định Danh Chuẩn ContentRegistry 4 Tầng
1. **Đồng bộ mã định danh nội dung (`content_registry.json` & `src/registry/registryData.ts`):**
   - **Asset ID mới:** `HW-AST-NPC-CAMPFIREKNIGHT` trỏ tới `assets/characters/npcs/campfire_knight_idle_sheet.png`.
   - **Content ID chuẩn:** `HW-NPC-ALLY-000001`
     + `runtimeKey`: `"npc_campfire_knight"`
     + `nameVi`: `"Hiệp Sĩ Canh Lửa"`
     + `category`: `"npcs"`
     + `layer`: `"LAYER_1_CORE"`
     + `assetRefs`: `["HW-AST-NPC-CAMPFIREKNIGHT", "HW-AST-CHAR-CAMPFIREKNIGHT-PRAY", "HW-AST-CHAR-CAMPFIREKNIGHT-IDLE", "HW-AST-PORT-CAMPFIREKNIGHT"]`
   - Bảo toàn bản ghi tương thích ngược `HW-NPC-KNIGHT-000001` để bảo đảm các bài kiểm thử bước 14A đạt 100%.

### 9.2. Thiết Kế Chuỗi 3 Nhiệm Vụ Tiến Trình (`src/data/lore.json`)
Chuỗi nhiệm vụ của Hiệp Sĩ Canh Lửa được thiết kế đan cài chặt chẽ với cốt truyện, bản đồ thế giới uốn lượn và các cơ chế sinh tồn cốt lõi:
1. **Nhiệm vụ 1 — "Giữ Lửa Trong Sương" (`SQ06_KEEP_FIRE`, Hồi 2):**
   - *Mục tiêu:* Thu thập 2 Gỗ Khô (`res_dry_wood`) và 2 Nhựa Thông (`res_tree_resin`) quanh bìa rừng; tiếp nhiên liệu nâng cấp Lửa Trại Trung Tâm làng Bellhollow lên Cấp 2; trinh sát bìa Rừng Ngoài (Outer Woods).
   - *Ý nghĩa gameplay:* Hướng dẫn người chơi cơ chế quản lý tài nguyên sinh tồn và nâng cấp vùng an toàn (Camp Sanctuary).
2. **Nhiệm vụ 2 — "Dấu Vết Đồng Đội Cũ" (`SQ07_LOST_COMRADES`, Hồi 3):**
   - *Mục tiêu:* Men theo con đường vòng uốn lượn qua Outer Woods tới Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`) ở phía Nam; thu hồi Phôi Sắt Cổ Ngữ (`mat_runed_iron`) và Mảnh Nhật Ký Kỵ Sĩ (`item_knight_journal_page`); mang về trao cho Hiệp Sĩ.
   - *Ý nghĩa gameplay:* Dẫn dắt người chơi khám phá cấu trúc đường vòng và tiểu khu xưởng rèn, hé lộ số phận bi thương của đoàn hiệp sĩ bảo vệ chuông.
3. **Nhiệm vụ 3 — "Giải Thoát Cho Những Kẻ Tha Hóa" (`SQ08_PURIFY_FALLEN`, Hồi 4):**
   - *Mục tiêu:* Vượt qua Đầm Lầy Tĩnh Lặng tiến sâu vào cấm địa Rừng Sâu; đánh bại Chỉ Huy Hiệp Sĩ Trùm Mũ (`Hooded Knight Boss`); mang Huy Hiệu Hiệp Sĩ Tha Hóa (`quest_corrupted_knight_crest` / `quest_corrupted_crest`) về bên đống lửa để hiệp sĩ niệm chú thanh tẩy.
   - *Ý nghĩa gameplay:* Cao trào chiến đấu phe phái hiệp sĩ, thanh tẩy tà khí giải thoát cho các linh hồn sa ngã.
4. **Cổ thư truyền tích (`lore_campfire_knight_vow`):**
   - Bổ sung văn thư "Lời Thề Của Đoàn Hiệp Sĩ Canh Lửa", giải thích sứ mệnh bảo vệ ngọn lửa thánh và nguồn gốc của những người canh giữ ánh sáng giữa The Veil.

### 9.3. Hệ Thống Hội Thoại Tiếng Việt Tự Nhiên (`src/data/dialogues.json`)
Xây dựng 8 nhánh đối thoại hoàn chỉnh với văn phong trầm ấm, tôn nghiêm của một chiến binh canh giữ đốm lửa cuối cùng:
- `campfire_knight_intro`: Lời chào đầu tiên bên đống lửa, nhắc nhở về sự đáng sợ của bóng đêm và giao nhiệm vụ 1.
- `campfire_knight_q1_reminder`: Nhắc nhở thu thập củi khô và nhựa thông để tiếp sức cho ngọn lửa.
- `campfire_knight_q1_complete`: Lời cảm tạ khi ngọn lửa bùng sáng Cấp 2, hé lộ nỗi lo về các đồng đội mất tích và kích hoạt nhiệm vụ 2.
- `campfire_knight_q2_reminder`: Hướng dẫn lần theo dấu vết con đường vòng phía Nam dẫn tới xưởng chuông.
- `campfire_knight_q2_complete`: Xúc động khi đọc lại những dòng nhật ký cuối cùng của người bạn cũ, giao nhiệm vụ quyết định tiến vào Rừng Sâu.
- `campfire_knight_q3_reminder`: Cảnh báo sức mạnh tà ám của Chỉ Huy Hiệp Sĩ Trùm Mũ giữa sương sâu.
- `campfire_knight_q3_complete`: Buổi lễ thanh tẩy xúc động bên ánh lửa trại, hoàn tất chuỗi nhiệm vụ và ban phước lành vĩnh cửu.
- `campfire_knight_idle_talk`: Những câu chuyện lãng đãng về thời hoàng kim của vương quốc và triết lý về ngọn lửa trong sương.

### 9.4. Tích Hợp Thế Giới, Thực Thể & Bảo Toàn Lưu Trữ
1. **Định vị trong thế giới (`src/data/zones.json`):**
   - Đặt `npc_campfire_knight` tại tọa độ $(818, 270)$ ngay cạnh Lửa Trại Trung Tâm làng Bellhollow (`bellhollow`), tạo điểm nhấn trực quan ấm áp giữa quảng trường làng.
2. **Hành vi thực thể (`src/entities/NPCEntity.ts`):**
   - Tích hợp 2 hoạt ảnh: quỳ cầu nguyện (`npc_campfire_knight_pray`) khi người chơi ở xa và đứng trò chuyện (`npc_campfire_knight_idle`) khi tương tác.
   - Hàm `setInteracting(active, targetX)` điều khiển hiệp sĩ quay mặt về phía nhân vật chính khi đối thoại và quay lại đống lửa khi kết thúc.
3. **Bảo tồn dữ liệu (`src/systems/SaveManager.ts` & `src/data/items.json`):**
   - Khai báo vật phẩm `item_knight_journal_page` và `quest_corrupted_knight_crest`.
   - Bổ sung khóa vật phẩm vào `KNOWN_ITEM_KEYS` của `SaveManager.ts`, bảo đảm toàn bộ cờ nhiệm vụ (`campfire_knight_q1_accepted`, `campfire_knight_q1_completed`, v.v.) và trạng thái hoàn thành task được lưu trữ và tải lại nguyên vẹn 100%.
4. **Vòng đời tương tác trò chơi (`src/scenes/GameScene.ts`):**
   - Kết nối `CampSanctuarySystem` với Hiệp Sĩ Canh Lửa: khi đứng gần hiệp sĩ và đống lửa, tốc độ hồi phục định thần tăng 20% và nhân vật khô ráo nhanh gấp đôi.
   - Tự động kích hoạt đối thoại bằng phím `[E]`, kiểm tra điều kiện vật phẩm/nhiệm vụ và cập nhật tiến trình quest tương ứng.

### 9.5. Kết Quả Kiểm Thử Toàn Diện Nghiệm Thu V14-P8-14C
- `node scripts/verify_v14_p8_14c_campfire_knight_quests.mjs`: **84/84 PASS (100%)**.
- `node scripts/verify_v14_p8_14a_campfire_knight.mjs`: **41/41 PASS (100%)**.
- `node scripts/verify_v14_p8_10_evil_knights.mjs`: **63/63 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: **Bản build sản xuất đóng gói hoàn tất thành công (8.69s)**.

---

## 10. BƯỚC V14-P8-15A: THIẾT LẬP BIẾN TIẾN TRÌNH THỨC TỈNH KÝ ỨC VÀ KÍCH HOẠT MANH MỐI GIAI ĐOẠN 0 & 1 VỀ HIỆP SĨ ĐEN

### 10.1. Thiết Lập Biến Tiến Trình `memoryAwakeningStage` (`src/state/PlayerState.ts`, `src/systems/SaveManager.ts`)
1. **Khai báo trong PlayerState:**
   - Bổ sung thuộc tính `memoryAwakeningStage: number = 0` đại diện cho 4 giai đoạn thức tỉnh ký ức cốt truyện:
     + `0`: Kẻ Lữ Hành Mất Trí (The Mossbound Wayfarer) — bắt đầu game, mất sạch ký ức.
     + `1`: Manh Mối Xưởng Chuông & Văn Bia Cổ — biết về sự tồn tại của Hiệp Sĩ Đen và lời nguyền Mạch Rễ.
     + `2`: Tàn Tích Kỵ Sĩ & Giác Ngộ Sứ Mệnh — xâu chuỗi các mảnh nhật ký và ký ức chiến binh.
     + `3`: Đại Thức Tỉnh (Chân Tướng Hiệp Sĩ Đen) — nhớ lại toàn bộ danh tính và phong ấn tối hậu.
   - Thiết lập giá trị mặc định $= 0$ trong hàm khởi tạo và hàm `reset()`.
2. **Cơ chế lưu trữ và di trú an toàn (Non-Destructive Migration):**
   - Mở rộng giao diện `SaveData` với trường tùy chọn `memoryAwakeningStage?: number`.
   - Đưa `'memoryAwakeningStage'` vào tập hợp `knownKeys` trong `sanitizeAndMigrateSaveData` để ngăn trường này bị đẩy nhầm vào `legacyExtraData`.
   - Điền giá trị mặc định an toàn $= 0$ khi nạp các file save V1.3 cũ hoặc save mới tạo.
   - Kẹp giá trị hợp lệ trong phạm vi $0 \le \text{stage} \le 3$, bảo toàn giá trị khi lưu và nạp lại qua chu kỳ round-trip.

### 10.2. Kích Hoạt Giai Đoạn 0 — Kẻ Lữ Hành Mất Trí (`src/data/dialogues.json`)
1. **Bối cảnh khởi đầu:**
   - Người chơi bắt đầu cuộc hành trình với danh xưng "The Mossbound Wayfarer", khoác trên mình bộ giáp đen rêu phong và hoàn toàn mất sạch ký ức quá khứ.
2. **Lời thoại Hiệp Sĩ Canh Lửa:**
   - Trong nhánh đối thoại mở đầu `campfire_knight_intro` bên đống lửa, Hiệp Sĩ Canh Lửa thoáng nhìn thấy bộ giáp đen và ngọn đèn quen thuộc của bạn với ánh mắt kinh ngạc nhưng kìm lại:
     > *"Khoan đã... Bộ giáp đen đó... và cách ngươi giữ ngọn đèn... ta ngỡ người đó đã tan biến trong màn sương từ lâu rồi... Không, có lẽ ta nhìn nhầm trong ánh lửa chập chờn."*

### 10.3. Kích Hoạt Giai Đoạn 1 — Manh Mối Tại Xưởng Chuông & Văn Bia Cổ (`src/data/lore.json`, `src/data/zones.json`, `src/scenes/GameScene.ts`)
1. **Cổ thư truyền tích (`lore_black_knight_chronicle`):**
   - Đăng ký văn thư cổ "VĂN BIA CỔ: HIỆP SĨ ĐEN VÀ PHONG ẤN ĐẠI MẠCH RỄ" vào `subAreaLoreEntries`.
   - Nội dung kể về "Hiệp Sĩ Đen (Black Knight)" — vị chỉ huy tối cao năm xưa dám tiến vào tâm điểm Mạch Rễ cổ xưa để phong ấn lời nguyền và chấp nhận đánh đổi toàn bộ ký ức của chính mình.
2. **Bố trí điểm khám phá thế giới:**
   - Đăng ký interactable `inspect_black_knight_stele` (`read_black_knight_stele`) tại tọa độ $(1400, 1180)$ trong Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`).
3. **Cơ chế tự động chuyển giai đoạn trong GameScene:**
   - Khi người chơi bước vào phân khu Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`), hệ thống kiểm tra và tự động nâng `memoryAwakeningStage` từ $0 \rightarrow 1$, đồng thời mở khóa cổ thư `lore_black_knight_chronicle` và hiển thị thông báo popup dẫn chuyện.
   - Khi hoàn thành Nhiệm vụ 1 (`SQ06_KEEP_FIRE` / `campfire_knight_q1_complete`), `memoryAwakeningStage` cũng tự động được nâng lên 1 nếu chưa đạt.
   - Khi tương tác đọc Văn Bia Cổ (`read_black_knight_stele`) hoặc Nhật Ký Thợ Rèn (`read_blacksmith_journal`), hệ thống mở khóa cổ thư và xác nhận tiến trình giai đoạn 1.

### 10.4. Kết Quả Kiểm Thử Nghiệm Thu V14-P8-15A
- `node scripts/verify_v14_p8_15a_memory_awakening.mjs`: **27/27 PASS (100%)**.
- `node scripts/verify_v14_p8_14b_campfire_knight_sanctuary.mjs`: **61/61 PASS (100%)**.
- `node scripts/verify_v14_p8_14c_campfire_knight_quests.mjs`: **84/84 PASS (100%)**.
- `node scripts/verify_v14_p8_14a_campfire_knight.mjs`: **41/41 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: **Bản build sản xuất đóng gói hoàn tất thành công trong 7.67s**.

---

## 11. BÁO CÁO NGHIỆM THU BƯỚC V14-P8-15B: CAO TRÀO NHẬN DIỆN THÂN PHẬN HIỆP SĨ ĐEN, CẬP NHẬT HUD & LỜI THOẠI TOÀN LÀNG BELLHOLLOW

### 11.1. Kích Hoạt Giai Đoạn 2 — Chạm Trán Hooded Knight Boss & Tiếng Gọi The Echo (`src/entities/EvilKnights.ts`, `src/systems/EchoSystem.ts`, `src/entities/EchoApparition.ts`)
1. **Khoảnh khắc nhận diện của Trùm Hiệp Sĩ Trùm Mũ (`HoodedKnightBoss`):**
   - Khi người chơi tiến vào phạm vi giao chiến ($\text{dist} \le 220\text{ px}$), cờ `hasRecognizedCommander` kích hoạt lần đầu:
     + Trùm lập tức khựng lại trong bàng hoàng, chuyển trạng thái sang `stagger` trong $2200\text{ ms}$ (`this.play('hooded_knight_stagger')`).
     + Hệ thống phát sự kiện `hooded_knight_commander_recognition` kèm câu thoại bàng hoàng:
       > *"Không thể nào... Hơi thở bóng tối trên bộ giáp đen ấy... Ngài chính là Chỉ Huy Hiệp Sĩ Đen?! Sao ngài lại quay mũi kiếm về phía chúng tôi?"*
     + Hiển thị thông báo popup dẫn chuyện sinh động qua HUD UIScene.
     + Nếu `memoryAwakeningStage < 2`, hệ thống tự động nâng lên $2$, mở khóa các chương ký ức 1, 2, 3 và phát sự kiện `memory_awakening_stage_changed`.
2. **Tiếng vọng The Echo & Ký ức bóng ma (`TheEcho`, `EchoSystem`):**
   - Khi các ảo ảnh The Echo xuất hiện và tan biến thành tàn tro phát sáng, tiếng thì thầm của ký ức vọng lại danh hiệu Chỉ Huy:
     > *"Hỡi vị Chỉ Huy Hiệp Sĩ Đen... ngài đã thức tỉnh trong màn sương sao?... Đừng theo chiếc đèn thứ hai... hãy nhìn ký hiệu cổ nơi miếu chuông để phục hồi phong ấn..."*
   - Tự động đồng bộ tiến trình lên Giai đoạn 2 nếu người chơi tiếp xúc Echo trước khi đối đầu trùm.

### 11.2. Kích Hoạt Giai Đoạn 3 — Đại Thức Tỉnh & Lễ Phục Hồi Thân Phận Bên Bếp Lửa (`src/scenes/GameScene.ts`, `src/data/dialogues.json`)
1. **Hạ gục Boss và thu hồi Huy Hiệu Hiệp Sĩ Tha Hóa:**
   - Khi hạ gục `HoodedKnightBoss`, vật phẩm nhiệm vụ `quest_corrupted_crest` được trao cho người chơi, cờ `boss_hooded_knight_defeated` được lưu trữ an toàn trong `PlayerState`.
2. **Nghi thức quỳ gối phục hồi danh xưng tại Sanctuary Camp:**
   - Khi người chơi mang `quest_corrupted_crest` về báo cáo cho Hiệp Sĩ Canh Lửa để hoàn thành nhiệm vụ 3 (`SQ08_PURIFY_FALLEN`):
     + Hiệp sĩ kiểm tra vết chém chéo và biểu tượng quân huy, nhận ra đây là Quân Huy Tổng Chỉ Huy.
     + Hiệp sĩ buông gươm, quỳ một gối phủ phục trước người chơi với sự kính phục tuyệt đối:
       > *"Thần... xin kính cẩn bái kiến Ngài, Chỉ Huy Hiệp Sĩ Đen (The Black Knight)! Năm xưa chính ngài đã tự phong ấn ký ức để bảo vệ linh hồn khỏi lời nguyền The Veil... Giờ đây ngài đã thức tỉnh và trở về giải cứu chúng thần!"*
     + Hệ thống thanh tẩy huy hiệu thành Bùa Hộ Thân Hiệp Sĩ (`eqp_bronze_bell_charm`).
     + Nâng `memoryAwakeningStage` lên mức cao nhất $= 3$, kích hoạt sự kiện `memory_awakening_completed`.

### 11.3. Cập Nhật Danh Hiệu HUD & Sổ Tay Ký Ức Phong Cách Hổ Phách (`src/scenes/UIScene.ts`, `src/ui/JournalModal.ts`, `src/data/lore.json`)
1. **Cập nhật danh hiệu HUD góc trên bên trái (`UIScene.ts`):**
   - Khi `memoryAwakeningStage >= 3`:
     + Tên người chơi chuyển từ `🌲 The Mossbound Wayfarer` sang: `⚔️ Hiệp Sĩ Đen (Black Knight)`.
     + Màu sắc đổi sang ánh hổ phách vinh quang `#ffc048` với viền đậm đồng sẫm `#3d1a04` dày 3px.
     + Đồng bộ tức thì trong `redrawStats()` và lắng nghe sự kiện `memory_awakening_changed`.
2. **Trọn vẹn 4 Chương Hồi Ức trong Sổ Tay [J] (`lore.json` & `JournalModal.ts`):**
   - Đăng ký trọn vẹn 4 Chương Hồi Ức vào `loreEntries`:
     + `lore_memory_chapter_1`: "HỒI ỨC I: KẺ LỮ HÀNH MẤT TRÍ TRONG SƯƠNG"
     + `lore_memory_chapter_2`: "HỒI ỨC II: MANH MỐI XƯỞNG CHUÔNG & VĂN BIA CỔ"
     + `lore_memory_chapter_3`: "HỒI ỨC III: TIẾNG GỌI THE ECHO & KẺ SA NGÃ"
     + `lore_memory_chapter_4`: "HỒI ỨC IV: ĐẠI THỨC TỈNH — CHÂN TƯỚNG HIỆP SĨ ĐEN"
   - Trong Tab Mảnh Ký Ức của `JournalModal.ts`:
     + Các thẻ thuộc chương hồi ức được đánh dấu biểu tượng kiếm `⚔️` nổi bật với viền ánh vàng đồng `0x9c7a28` và nền hổ phách trầm `0x201a14`.
     + Trang phải hiển thị huy hiệu `⚔️` cùng tiêu đề vàng kim `#ffc048` và tên tác giả trang trọng.
     + Bổ sung cơ chế phân trang 7 mục/trang (`itemsPerPage = 7`) kèm chỉ số trang bên trái để người chơi có thể lật mở đọc toàn bộ kho tàng cổ thư một cách hoàn hảo.

### 11.4. Mở Khóa Lời Thoại Đặc Biệt Toàn Làng Bellhollow (`src/data/dialogues.json`, `src/scenes/GameScene.ts`)
Khi người chơi đạt Giai đoạn 3 (`memoryAwakeningStage >= 3`), toàn bộ dân làng Bellhollow mở khóa các nhánh đối thoại kính trọng dành cho vị cứu tinh:
- **Garth – Người Gác Cổng (`garth_black_knight_reverence`):** Ngỡ ngàng nhận ra người lữ khách từng bị nghi ngờ chính là vị Chỉ Huy Hiệp Sĩ Đen huyền thoại; cúi đầu xin lỗi và tuyên bố cổng làng luôn rộng mở đón bước chân ngài.
- **Bà Edda – Người Giữ Chuông (`edda_black_knight_reverence`):** Khẳng định đã nhận ra khí phách kiên định ngay từ lúc mang lưỡi chuông trở về; cầu chúc thần linh và tổ tiên che chở cho vị hiệp sĩ giải cứu làng.
- **Neris – Thảo Dược Sư (`neris_black_knight_reverence`):** Kể về tiếng thì thầm hân hoan của gió rừng và mạch rễ chào đón vị Hộ Vệ Vĩ Đại; cam kết cung cấp thảo dược tinh hoa nhất.
- **Bram – Thợ Rèn Làng (`bram_black_knight_reverence`):** Thán phục đường kiếm thần tốc của vị đại kiếm sư năm xưa; tự hào được tu bổ và rèn đúc vũ khí cho Chỉ Huy.
- **Finn – Cậu Bé Tinh Nghịch (`finn_black_knight_reverence`):** Ánh mắt sáng ngời ngưỡng mộ người anh hùng trong truyền thuyết; ước mơ rèn luyện để trở thành hiệp sĩ bảo vệ tháp chuông làng.
- **Hiệp Sĩ Canh Lửa (`campfire_knight_idle_talk`):** Giữ vững lời thề trung thành, nhắc nhở ngài mở Sổ Tay [J] để hồi tưởng toàn bộ 4 Chương Hồi Ức.

### 11.5. Kết Quả Kiểm Thử Nghiệm Thu V14-P8-15B
- `node scripts/verify_v14_p8_15b_black_knight_awakening.mjs`: **63/63 PASS (100%)**.
- `node scripts/verify_v14_p8_15a_memory_awakening.mjs`: **27/27 PASS (100%)**.
- `node scripts/verify_v1_4_save_migration.mjs`: **88/88 PASS (100%)**.
- `node scripts/run_v1_3_regression_suite.mjs`: **571/571 PASS (100%)**.
- `npx tsc --noEmit`: **0 lỗi biên dịch**.
- `npm run build`: **Bản build sản xuất đóng gói hoàn tất thành công trong 8.29s**.



