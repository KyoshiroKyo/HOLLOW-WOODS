# HOLLOW WOODS V1.4 — THIẾT KẾ HỆ SINH THÁI QUÁI VẬT & CƠ CHẾ CHẠM TRÁN
## MONSTER ECOLOGY, ENCOUNTER MECHANICS & BEHAVIORAL AI SPECIFICATION (BƯỚC 5)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 (Environment Asset Overhaul, Monster Expansion & World Map Development)  
**Nhánh Git đang thực hiện:** `feat/v1.4-expansion` (Bảo vệ độc lập tuyệt đối nhánh `main` và bản phát hành V1.3)  
**Tài liệu cơ sở:** `docs/v1.4/03_monster_packs_audit.md` (Kiểm định kỹ thuật 3 gói asset quái vật)  
**Ngày hoàn thiện thiết kế:** 18/11/2026  
**Trạng thái thiết kế:** **HOÀN THÀNH — SẴN SÀNG TRIỂN KHAI MÃ NGUỒN (ARCHITECTED & FORMALIZED)**  

---

## 1. TRIẾT LÝ THIẾT KẾ: SINH TỒN KINH DỊ DÂN GIAN (FOLK HORROR SURVIVAL)

Khác biệt hoàn toàn với các tựa game hành động chặt chém (Hack & Slash / Action RPG), HOLLOW WOODS: *The Fog That Remembers* đặt trọng tâm vào **sự căng thẳng tâm lý (Psychological Dread)**, **bảo toàn tài nguyên sinh tồn** và **nỗi sợ hãi bóng đêm trong sương mù**.

```
+----------------------------------------------------------------------------------------------------+
|                         VÒNG LẶP KINH DỊ SINH TỒN (SURVIVAL HORROR LOOP)                          |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    [BẤT AN & TÍN HIỆU]  --->  [ĐOÁN BIẾT & LẨN TRÁNH]  --->  [CHẠM TRÁN & KHỦNG HOẢNG]            |
|    - Tiếng quạ kêu hoảng       - Tắt đèn lồng nấp bụi        - Dơi quấy rối chớp nhoáng            |
|    - Đom đóm tắt sáng          - Giữ hơi thở, đi rón rén     - Ma quái hút cạn Bình Tâm            |
|    - Sương mù cuộn xoáy        - Đi vòng tránh đường         - Sói xương rình rập cắn xé           |
|                                                                     |                              |
|                                                                     v                              |
|    [HỒI PHỤC SANCTUARY] <---  [HẬU QUẢ SINH TỒN]       <---  [KẾT THÚC CHỚP NHOÁNG]               |
|    - Thổi bùng Lửa Trại        - Mất máu (HP tụt)            - Quái hù dọa bốc hơi biến mất        |
|    - Sưởi ấm, hong khô áo      - Mất bình tĩnh (Composure)   - Thoát chết trong gang tấc           |
|    - Nấu cháo thảo dược        - Đèn cạn dầu, người run rét  - Không có cảnh chém giết liên hồi    |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### 3 Nguyên Tắc Cốt Lõi:
1. **Không truy đuổi vô tận (No Endless Aggro Kiting):** Quái vật không bám đuổi người chơi từ đầu này đến đầu kia bản đồ. Chúng là một phần của sinh cảnh hoang dã; chúng phục kích, gây chấn thương, gieo rắc hoang mang rồi rút lui vào bóng đêm sương mù.
2. **Đòn bẩy tâm lý qua chỉ số Bình Tâm (Composure / Sanity Threat):** Quái vật hù dọa nhắm vào tâm trí người chơi. Bình Tâm tụt dốc sẽ làm méo mó màn hình, gây ảo giác âm thanh và biến màn đêm thành địa ngục thị giác.
3. **Môi trường là đồng minh và kẻ thù:** Ánh sáng đèn lồng và lửa trại là ranh giới sống còn xua đuổi bóng tối; bóng đêm và sương mù dày là nơi ẩn nấp của những thực thể cổ xưa.

---

## 2. PHÂN HỆ 1: NHÓM HÙ DỌA CHỚP NHOÁNG (AMBUSH & JUMPSCARE HARASSMENT)
*Tài nguyên sử dụng:* Gói `N3XUS Starter FREE` — Đã kiểm định chuẩn $32 \times 32\text{ px}$, 120 frame Top-down 4 hướng.

### 2.1 Dơi Sương Mù (Mist Bat / `mon_mist_bat`)
- **Định danh Registry:** `HW-MON-BAT-000001` (`runtimeKey: mon_mist_bat`, `assetId: HW-AST-MON-MISTBAT`).
- **Bản chất sinh học:** Loài dơi ăn thịt cổ xưa nhiễm khí độc của The Veil, làm tổ trên các vòm tán cây sồi rậm rạp (`tree_oak_*`).
- **Cơ chế Phục kích (Ambush Trigger):**
  - Kích hoạt khi người chơi chạy nước rút (`isSprinting = true`) qua các gốc cây sồi cổ hoặc bụi rậm rậm rạp vào lúc Hoàng Hôn (`DUSK`) hoặc Đêm (`NIGHT`).
  - Hoặc khi người chơi di chuyển trong bóng tối mà tắt Đèn Lồng quá $12\text{ giây}$.
  - Xác suất kích hoạt: $18\%$ mỗi khi người chơi băng qua vùng tán cây (Cooldown tối thiểu giữa 2 lần dơi xuất hiện: $45\text{ giây}$).

```
SƠ ĐỒ TRẠNG THÁI AI DƠI SƯƠNG MÙ:
[SLEEPING IN CANOPY] 
       | (Player sprints near / Lantern off in dark)
       v
[TELEGRAPHING (0.8s)] -> Tiếng đập cánh + 2 mắt đỏ le lói trên cành cây
       |
       v
[SWOOP ATTACK (1.2s)] -> Lao thẳng chéo xuống mặt người chơi (attack_down / left / right)
       |
       v
[IMPACT RESOLUTION]   -> Trừ 8 HP, Trừ 15 Composure, Chao đảo ánh đèn lồng
       |
       v
[VANISH RETREAT]      -> Chao lượn vút lên cao (walk_up), tan biến vào Veil Canopy Fog
```

- **Tác động Sinh tồn:**
  - Gây sát thương vật lý nhẹ: $-8\text{ HP}$.
  - Gây hoảng loạn tâm lý: $-15\text{ Composure}$ (Bình Tâm).
  - Làm chao đảo ánh sáng: Đèn lồng bị chớp giật liên hồi trong $2.5\text{ giây}$ (`intensity flicker`).
- **Tín hiệu cảnh báo (Telegraphing Cues):**
  - *Âm thanh:* Tiếng cánh vỗ phành phạch dồn dập (`sfx_bat_flutter`) kèm tiếng rít chói tai (`sfx_bat_screech`).
  - *Thị giác:* Hai chấm mắt đỏ rực lóe lên trong tán lá cây ngay phía trên đầu người chơi $0.8\text{ giây}$ trước khi bổ nhào.
- **Cơ chế Biến mất (Vanish):** Sau đúng 1 cú bổ nhào cắn táp, dơi không quay lại cắn tiếp mà lập tức đổi hướng bay vút lên trên màn hình (`walk_up`) và mờ dần vào tầng sương mù thượng tầng (`alpha -> 0` trong 1.0s), hoàn toàn giải tỏa áp lực cận chiến.

---

### 2.2 Hồn Ma Phiêu Bạt (Wandering Shade / `mon_wandering_shade`)
- **Định danh Registry:** `HW-MON-GHOST-000001` (`runtimeKey: mon_wandering_shade`, `assetId: HW-AST-MON-WANDERINGSHADE`).
- **Bản chất tâm linh:** Tàn dư linh hồn của những lữ khách lạc lối bị sương mù The Veil giam giữ, mang hình hài chiếc áo liệm trắng bạc dập dềnh trong giá lạnh.
- **Cơ chế Phục kích Tâm lý (Psychological Ambush):**
  - Xuất hiện khi Bình Tâm của người chơi giảm xuống dưới $50\%$ (`composure < 50`), hoặc khi tiếp cận các khu vực phế tích tâm linh (`broken_bell_shrine`, `ancient_rune_puzzle`, `sub_bell_workshop`) vào ban đêm.
  - Tần suất: Tối đa 1 Hồn Ma trong bán kính $400\text{ px}$. Cooldown phục kích: $90\text{ giây}$.

```
SƠ ĐỒ TRẠNG THÁI AI HỒN MA:
[UNMANIFESTED SPIRIT]
       | (Composure < 50 OR entering haunted shrine at night)
       v
[CHILLING TELEGRAPH (1.5s)] -> Gió rít lạnh buốt, nhiệt độ -15°C, sương đổi sắc tím ma mị
       |
       v
[DRIFTING MANIFEST]         -> Hiện hình từ sương mù cách 80px, lướt xuyên vật cản (walk_*)
       |
       +---> [IF PLAYER USES LANTERN / REACHES CAMPFIRE] -> Rít gào, bốc hơi tan biến (death_*)
       |
       v (If touching player)
[SOUL WAIL ATTACK]          -> Hút cạn linh hồn (attack_*): Trừ 25 Composure, màn hình đen co thắt
       |
       v
[FADE INTO MIST]            -> Tan rã thành hạt sương lạnh vô hình sau đòn tấn công
```

- **Tác động Sinh tồn:**
  - Không gây sát thương máu trực tiếp ($0\text{ HP}$).
  - Tấn công hủy diệt Bình Tâm: Giáng đòn trừ $-25\text{ Composure}$.
  - Gây sốc nhiệt rét buốt: Hạ thân nhiệt tức thì $-15^\circ\text{C}$ (`temperature -15`), làm cơ thể run rẩy và tiêu hao thể lực gấp đôi khi chạy.
  - Hiệu ứng thị giác hoảng loạn: Màn hình kích hoạt hiệu ứng thị sai viền đen co giật (Vignette Horror Distortion) và sương mù xung quanh đổi sang màu tím lam ma quái (`#3d1f47`).
- **Tín hiệu cảnh báo (Telegraphing Cues):**
  - *Âm thanh:* Tiếng thì thầm hư vô không rõ lời thoại chạy vòng quanh hai tai (`sfx_ghost_whisper_spatial`), tiếng chuông gió lạnh lẽo.
  - *Môi trường:* Hạt sương xung quanh chuyển động chậm lại, ngọn lửa đèn lồng bị hút năng lượng thu nhỏ bán kính sáng chỉ còn một nửa.
- **Cơ chế Khắc chế & Giải trừ (Counterplay):**
  - Bật Đèn Lồng Hổ Phách chiếu thẳng vào Hồn Ma trong $1.5\text{ giây}$ sẽ thiêu đốt bản thể ma quái, khiến nó hú lên đau đớn (`hurt_*`) và tan biến (`death_*`).
  - Chạy vào vòng bảo vệ của Lửa Trại Sanctuary: Hồn ma không thể vượt qua ranh giới ánh sáng thiêng, lập tức bốc hơi thành sương mù.

---

## 3. PHÂN HỆ 2: NHÓM QUÁI VẬT CHÍNH (SHADOW PREDATORS & APEX BEHEMOTH)

### 3.1 Phân tích Thực Thể Hợp Lệ & Chỉ Số Cốt Lõi

| Thực Thể Quái Vật | Phân Loại & Vai Trò | Máu (HP) | Tốc Độ | Tầm Nhận Biết | Sát Thương | Hành Vi & Điểm Yếu |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **Sói Xương Đêm**<br>(`mon_skull_wolf`) | Kẻ săn mồi hung tợn mặt đất (Pack Hunter) | 120 | 95 px/s | 180 px (Mắt)<br>320 px (Tai) | 20 HP<br>$-10$ Composure | Đi săn theo cặp; nhạy cảm với tiếng chạy nước rút. Sợ ánh lửa trại Sanctuary Cấp 2. |
| **Mắt Bóng Đêm**<br>(`mon_shadow_eyes`) | Sinh vật do thám phục kích bụi (Watcher) | 1 (Bất tử) | 0 px/s | 200 px | 0 HP<br>$-8$ Composure | Ẩn trong bụi rậm; không đánh nhưng nhìn chằm chằm làm tụt Sanity và hú gọi Sói Xương. |
| **Quạ Đêm Sương**<br>(`mon_shadow_crow`) | Sinh vật điềm báo trên không (Harbinger) | 15 | 110 px/s | 250 px | 5 HP | Đậu trên cọc rào / ngọn cây. Khi quái mạnh tới gần, quạ bay tán loạn báo động. |
| **Đại Thú Đầm Lầy**<br>(`boss_wetlands_behemoth`) | Chúa tể đầm lầy cổ đại (Stationary Apex Boss) | 1600 | 0 px/s | 450 px | 35 HP<br>$-25$ Composure | Trùm ngập nửa mình dưới hồ sâu đầm lầy; táp cắn vươn xa, quật sóng bùn đen và phun độc. |

---

### 3.2 Bảng Quy Luật Xuất Hiện Ngẫu Nhiên Có Kiểm Soát (Dynamic Spawning Matrix)

Để loại bỏ hoàn toàn sự ức chế do quái xuất hiện tràn lan bừa bãi, hệ thống tuân thủ ma trận 5 chiều:

$$\text{SpawnEligibility} = f(\text{ZoneRiskTier}, \text{TimePhase}, \text{GlobalEntityCap}, \text{ZoneCooldown}, \text{QuestGating})$$

```
+---------------------------------------------------------------------------------------------------------------------------------------+
|                                      BẢNG QUY LUẬT XUẤT HIỆN THEO PHÂN KHU & KHUNG GIỜ V1.4                                         |
+----------------------+-----------+-------------------------+-------------------------+-------------------------+-----------+----------+
| Phân Khu (Zone)      | Cấp Đô    | Ban Ngày (DAY)          | Hoàng Hôn (DUSK)        | Đêm Sương (NIGHT)       | Mật Độ Tối| Cooldown |
|                      | Nguy Hiểm | 0s - 180s               | 180s - 240s             | 240s - 360s             | Đa (Cap)  | Xuất Hiện|
+----------------------+-----------+-------------------------+-------------------------+-------------------------+-----------+----------+
| bellhollow           | Tier 1    | Không có quái           | Không có quái           | 0 quái (Vùng Sanctuary) | 0         | Vô hạn   |
| sanctuary_farm       | Tier 1    | Không có quái           | 1 Quạ rừng cảnh báo     | 0 quái (Lửa trại bảo hộ)| 1         | Vô hạn   |
| fog_crossing         | Tier 2    | Không có quái           | 1 Dơi sương mù          | 2 Dơi + 1 Mắt bóng đêm  | 3         | 60s      |
| outer_woods          | Tier 2    | 1 Quạ rừng              | 2 Dơi sương mù          | 1 Sói xương + 2 Dơi     | 3         | 60s      |
| crooked_path         | Tier 3    | 1 Sói xương (Ngủ đông)  | 1 Sói xương + 1 Quạ     | 2 Sói xương + 1 Hồn ma  | 3         | 45s      |
| sub_root_cellar      | Tier 3    | 1 Hồn ma lang thang     | 1 Hồn ma + 1 Mắt bụi    | 2 Hồn ma cổ linh        | 2         | 75s      |
| silent_mire          | Tier 4    | 1 Sói xương lội bùn     | 2 Sói xương + 2 Mắt bụi | 2 Sói + 2 Dơi + 1 Ma    | 4         | 40s      |
| sub_bell_workshop    | Tier 4    | 1 Hồn ma thợ rèn        | 1 Hồn ma + 1 Dơi        | 2 Hồn ma + 2 Dơi        | 3         | 45s      |
| deep_forest          | Tier 5    | 2 Sói xương tuần tra    | 2 Sói + 2 Dơi + 1 Mắt   | 2 Sói + 2 Ma + 3 Dơi    | 5         | 30s      |
| broken_bell_shrine   | Tier 5    | 1 Hồn ma miếu cổ        | 2 Hồn ma miếu cổ        | 3 Hồn ma + Sương độc    | 4         | 30s      |
+----------------------+-----------+-------------------------+-------------------------+-------------------------+-----------+----------+
```

### 3.3 Thuật Toán Culling & Ngưỡng An Toàn (Safety Capping)
1. **Bán kính Ngủ đông (Culling Radius):** Toàn bộ thực thể quái vật nằm ngoài bán kính $560\text{ px}$ so với người chơi sẽ tự động chuyển sang trạng thái ngủ đông (`isSleeping = true`), ngừng hoàn toàn tính toán va chạm và cập nhật hoạt ảnh WebGL để bảo toàn mốc 60 FPS.
2. **Ngưỡng an toàn sau phục kích (Grace Period):** Sau khi người chơi trúng đòn phục kích của Dơi hoặc Hồn Ma, hệ thống áp dụng bộ đếm thời gian miễn nhiễm phục kích $45\text{ giây}$. Trong thời gian này, không có thêm bất kỳ thực thể hù dọa nào được phép xuất hiện.

---

## 4. PHÂN HỆ 3: VAI TRÒ ĐẶC BIỆT CỦA GOBLIN SCOUT (KẺ RÌNH MẬP VÔ DIỆN)

### 4.1 Bối Cảnh Tài Nguyên & Giải Pháp Thiết Kế Khắc Phục
Như đã xác minh chính xác tại Bước 3 (`03_monster_packs_audit.md`), gói `goblin_scout_v5_silhouette_free.zip` chỉ chứa duy nhất 158 frame của chiếc dao găm bóng đêm (`weapons_dagger_1_silhouette.png`, kích thước $15 \times 15\text{ px}$ trong khung $64 \times 64$), thiếu hoàn toàn thân thể nhân vật Goblin Scout.

Để biến khiếm khuyết tài nguyên này thành một **điểm nhấn sáng tạo kinh dị độc đáo**, HOLLOW WOODS V1.4 thiết lập cơ chế **Kẻ Rình Mập Vô Diện (The Unseen Stalker / Void Dagger)**:

```
+----------------------------------------------------------------------------------------------------+
|                         CƠ CHẾ KẺ RÌNH MẬP VÔ DIỆN (THE UNSEEN STALKER)                            |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [THỰC THỂ TÀNG HÌNH TRONG SƯƠNG MÙ]                                                                |
|  - Thân thể: Vô hình hoàn toàn trong sương mù, chỉ có vệt khúc xạ ánh sáng mờ nhạt                 |
|  - Điểm nhận diện: Chiếc dao găm bóng tối le lói ánh tím đen trôi nổi lướt đi trong không khí       |
|  - Sprite sử dụng: goblin_scout_v5_weapons_dagger_1_silhouette.png (100% khớp asset thực tế)      |
|                                                                                                    |
|  [VAI TRÒ TRINH SÁT & BÁO ĐỘNG (THE SPOTTER)]:                                                     |
|  - Không trực tiếp giao chiến tay đôi sát phạt                                                     |
|  - Bám theo người chơi ở khoảng cách 140px, gõ dao vào đá phát ra tiếng kêu *keng keng* lảnh lót   |
|  - Tiếng gõ dao kích động toàn bộ Sói Xương và Quái Nghe Tiếng Động (The Listener) lao tới         |
|  - Khi người chơi chiếu Đèn Lồng Hổ Phách vào: Rít lên, ném bom khói và tàng hình lẩn mất         |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

### 4.2 Phương Án Kỹ Thuật Hai Tầng (Two-tier Technical Fallback)
1. **Tầng 1 (Mặc định - The Unseen Stalker):** 
   - Sử dụng trực tiếp `goblin_scout_v5_weapons_dagger_1_silhouette.png`.
   - Render chiếc dao găm trôi lơ lửng kèm theo hiệu ứng hạt khói đen bán trong suốt (`particle_dark_smoke`) dưới chân cán dao.
   - Hoàn toàn không phát sinh lỗi runtime do thiếu texture thân thể.
2. **Tầng 2 (Mở rộng - Khi người chơi muốn thực thể có hình hài):**
   - Lấy sprite thân thể `monsters/goblin/goblin-sheet.png` từ gói `N3XUS Starter` ($192 \times 1280\text{ px}$) làm thân nền, phủ bộ lọc màu bóng tối toàn phần (Shadow Tint `0x111115`), và gắn chiếc dao găm `weapons_dagger_1` lên lớp trên cùng (`weaponLayer`).

---

## 5. PHÂN HỆ 4: LIÊN KẾT HỆ SINH THÁI & PHẢN ỨNG THỨC TỈNH TRÙM (BOSS AWAKENING)

### 5.1 Chuỗi Phản Ứng Phân Cấp Sinh Thái (Ecological Food Chain)

```
[QUẠ ĐÊM / ĐOM ĐÓM]  -- (Hoảng loạn bay tán loạn / Tắt sáng) -->  Báo động có dã thú lớn tới gần
         |
         v
[GOBLIN SCOUT]       -- (Gõ dao lảnh lót / Thổi còi sương)   -->  Chỉ điểm vị trí con mồi
         |
         v
[SÓI XƯƠNG / HIỆP SĨ]--> (Bao vây gọng kìm / Tấn công)       -->  Gây áp lực sinh tử
         |
         v
[APEX BOSS / BEHEMOTH]-> (Biến đổi toàn bộ môi trường phân khu) ->  Trận chiến cao trào
```

1. **Hệ thống Điềm Báo từ Động vật (Wild Forewarning):**
   - Đàn Quạ Đêm (`WildlifeEntity`): Khi một thực thể cấp cao (Sói Xương đầu đàn, The Listener, Hiệp Sĩ Sa Ngã) bước vào bán kính $250\text{ px}$, đàn quạ lập tức vỗ cánh thét vang `caw-caw` và bay vút lên ngọn cây. Người chơi có đúng $3 - 5\text{ giây}$ để kịp tìm bụi rậm ẩn nấp (`hiding_spot`).
   - Đom đóm & Bướm đêm: Tự động tắt phát quang và rơi rụng khi Hồn Ma hoặc sát khí bóng tối xuất hiện trong phạm vi $180\text{ px}$.

2. **Đội Hình Hộ Vệ Tháp Tùng (Minion Retinue):**
   - Khi **Hooded Knight Boss** xuất hiện tại Deep Forest: Luôn có 2 Fallen Knight mang giáp xỉn đi tuần tiễu cách trùm $120\text{ px}$, tạo thành thế gọng kìm bảo vệ chủ tướng.
   - Khi **The Shadowed Wetlands Behemoth** trỗi dậy tại Silent Mire: Đầm lầy sôi sục bùn đen, 3 Dơi Sương Mù túa ra từ rễ cây cổ thụ bay vần vũ trên mặt nước làm phân tán sự tập trung của người chơi.

---

### 5.2 Hiệu Ứng Biến Đổi Môi Trường Khi Đánh Thức Trùm (Boss Awakening Environmental Shift)

Khi trận đối đầu với Trùm được kích hoạt (ví dụ: đánh thức *Mire Warden* hoặc *Shadowed Wetlands Behemoth*):

$$\text{EnvironmentShift} = \{\text{VeilDensity} \times 2, \quad \text{LightRadius} \times 0.55, \quad \text{Tint}: \text{\#240d18}\}$$

1. **Hiệu ứng Sương Mù Cuộn Trào (Veil Surge):**
   - Tốc độ trôi dạt của các lớp sương Parallax trong `VeilSystem` tăng từ $1.0\times$ lên $2.2\times$.
   - Độ mờ sương mù dày đặc tăng lên, bóp nghẹt bán kính chiếu sáng của Đèn Lồng Hổ Phách từ $200\text{ px}$ xuống chỉ còn $110\text{ px}$.
2. **Biến đổi Sắc Độ Toàn Cảnh (Global Color Grading):**
   - Toàn bộ ánh sáng môi trường bị nhuộm một màu đỏ tía u ám ngả than bùn (`camera.setTint(0x2a141e)`).
3. **Cộng Hưởng Âm Thanh U Hồn:**
   - Âm thanh môi trường thường nhật (tiếng dế mèn, tiếng gió nhẹ) bị ngắt hoàn toàn, thay thế bằng tiếng thở phì phò trầm đục của đại quái thú kết hợp tiếng chuông đồng vọng lại từ hư vô.

---

## 6. CẤU TRÚC DỮ LIỆU DỰ KIẾN (DATA SCHEMA INTEGRATION)

Dữ liệu hệ sinh thái quái vật mới được tích hợp vào `content_registry.json` và cấu hình phân khu trong `zones.json` theo cấu trúc 4 tầng:

```json
{
  "monsters": [
    {
      "contentId": "HW-MON-BAT-000001",
      "runtimeKey": "mon_mist_bat",
      "assetId": "HW-AST-MON-MISTBAT",
      "category": "jumpscare_harasser",
      "stats": {
        "maxHealth": 20,
        "speed": 130,
        "damage": 8,
        "sanityDrain": 15,
        "cooldownSeconds": 45
      },
      "habitats": ["fog_crossing", "outer_woods", "silent_mire"]
    },
    {
      "contentId": "HW-MON-GHOST-000001",
      "runtimeKey": "mon_wandering_shade",
      "assetId": "HW-AST-MON-WANDERINGSHADE",
      "category": "psychological_specter",
      "stats": {
        "maxHealth": 40,
        "speed": 55,
        "damage": 0,
        "sanityDrain": 25,
        "tempDrain": 15,
        "cooldownSeconds": 90
      },
      "habitats": ["sub_root_cellar", "broken_bell_shrine", "ancient_rune_puzzle"]
    },
    {
      "contentId": "HW-MON-SCOUT-000001",
      "runtimeKey": "mon_unseen_scout",
      "assetId": "HW-AST-MON-GOBLINDAGGER",
      "category": "spotter_harbinger",
      "stats": {
        "maxHealth": 50,
        "speed": 110,
        "detectionRadius": 220,
        "alarmRadius": 320
      },
      "habitats": ["crooked_path", "deep_forest"]
    }
  ]
}
```

---

## 7. XÁC NHẬN TUÂN THỦ RÀNG BUỘC DỪNG (STRICT VERIFICATION)

- [x] **Chỉ xuất bản thiết kế hệ thống và cấu trúc dữ liệu:** Tuyệt đối không viết mã nguồn vào `src/entities/` hay `src/systems/`.
- [x] **Không thêm quái vật vào game ở bước này:** Trò chơi runtime giữ nguyên trạng thái gốc của V1.3/V1.4 baseline.
- [x] **Giải quyết thấu đáo vấn đề thiếu sprite Goblin Scout:** Đã thiết kế phương án sáng tạo "Kẻ Rình Mập Vô Diện" (The Unseen Stalker) hoàn toàn khớp với tệp dao găm thực tế, không gây lỗi runtime.
- [x] **Bảo đảm chất Folk Horror Survival:** Quái vật phục kích chớp nhoáng, nhắm vào Bình Tâm và sự bất an; không biến game thành hành động chặt chém.

---
*Bản thiết kế được lập tự động và xác nhận kỹ thuật bởi Antigravity Engine Core.*
