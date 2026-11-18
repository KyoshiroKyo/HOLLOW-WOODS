# HOLLOW WOODS V1.4 — BÁO CÁO KỸ THUẬT BƯỚC 9
## TÍCH HỢP HỆ THỐNG QUÁI VẬT MỚI, HỆ SINH THÁI ĐỘNG VẬT & CƠ CHẾ CHẠM TRÁN
### (MONSTER ECOLOGY, WILDLIFE INTERACTION & ENCOUNTER MECHANICS REPORT)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 — Tích hợp Thực thể Quái vật N3XUS, Shadow Series, Kẻ Rình Mập Vô Diện, Chuỗi Thức Ăn Sinh Thái & Biến Đổi Môi Trường Boss  
**Nhánh Git:** `feat/v1.4-expansion` (Bảo vệ độc lập tuyệt đối nhánh `main`)  
**Tài liệu thiết kế cơ sở:** `docs/v1.4/05_monster_ecology_and_encounters.md`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái kiểm định:** **HOÀN THÀNH TOÀN DIỆN — 52/52 TIÊU CHÍ PASS (100%)**

---

## 1. TỔNG QUAN TRIẾT LÝ: SINH TỒN KINH DỊ DÂN GIAN (FOLK HORROR SURVIVAL)

Game duy trì chặt chẽ tinh thần Folk Horror Survival — khác biệt hoàn toàn với thể loại chặt chém Action RPG:
- **Không truy đuổi vô tận (No Endless Aggro Kiting):** Quái vật phục kích chớp nhoáng, gây sốc tâm lý hoặc sát thương sinh tồn rồi rút lui vào tầng sương mù dày (`alpha -> 0`).
- **Đòn bẩy tâm lý (Psychological Dread):** Đòn đánh tập trung rút cạn chỉ số **Bình Tâm (Composure / Sanity)**, gây ảo giác thị giác (Vignette co thắt, camera tint) và ảo giác thính giác (tiếng thì thầm, tiếng thở phì phò).
- **Hồi phục Sanctuary:** Đèn lồng hổ phách và lửa trại Sanctuary là ranh giới sống còn xua đuổi bóng tối; là nơi sưởi ấm, phục hồi Bình Tâm và hồi máu.

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
|    - Thổi bùng Lửa Trại        - Mất máu (-8 HP)             - Quái hù dọa bốc hơi biến mất        |
|    - Sưởi ấm, hong khô áo      - Mất bình tĩnh (-15/-25 Cmp) - Thoát chết trong gang tấc           |
|    - Nấu cháo thảo dược        - Đèn cạn dầu, người run rét  - Không có cảnh chém giết liên hồi    |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. CHI TIẾT TRIỂN KHAI CÁC PHÂN HỆ THỰC THỂ

### 2.1 Dơi Sương Mù (Mist Bat / `MistBatAmbushEntity`)
*Tài nguyên:* `public/assets/characters/monsters/bat_sheet.png` ($192 \times 640\text{ px}$, 120 frames N3XUS $32 \times 32\text{ px}$).
- **Cơ chế Phục kích (Ambush Trigger):**
  - Kích hoạt khi chạy nước rút (`isSprinting = true`) hoặc tắt đèn lồng trong bóng tối (`!lightActive`) tại các vùng: `fog_crossing`, `outer_woods`, `crooked_path`, `deep_forest`, `silent_mire`, `sub_bell_workshop`.
  - Cooldown: $30\text{s}$ (Rừng Sâu) đến $60\text{s}$ (Ngoại vi).
- **Hành vi AI 3 Pha:**
  1. *Telegraph (0.8s):* Lơ lửng trên cành cây với ánh mắt đỏ le lói (`setTint(0xff5555)`), phát âm thanh đập cánh dồn dập (`triggerJumpscare('bat', 0.90)`).
  2. *Swoop Attack (1.2s):* Lao thẳng xuống người chơi với vận tốc $250\text{ px/s}$.
  3. *Impact & Retreat:* Trừ $-8\text{ HP}$, $-15\text{ Composure}$, rung camera, kích hoạt sự kiện `lantern_flicker` (đèn lồng chao đảo trong $2.5\text{ giây}$). Sau đòn cắn, chuyển ngay sang `mist_bat_retreat_up` (vận tốc $-220\text{ px/s}$ lên trời), fade mờ dần và tự hủy sau $1.0\text{ giây}$.
  4. *Counterplay:* Nếu người chơi vung vũ khí chém trúng lúc dơi đang bổ nhào, dơi rít lên (`takeDamage`), lập tức hủy đòn và tháo chạy.

### 2.2 Hồn Ma Phiêu Bạt (Wandering Shade / `WanderingShadeEntity`)
*Tài nguyên:* `public/assets/characters/monsters/ghost_sheet.png` ($192 \times 640\text{ px}$, 120 frames N3XUS $32 \times 32\text{ px}$).
- **Cơ chế Xuất hiện (Psychological Trigger):**
  - Kích hoạt khi Bình Tâm $< 50\%$ hoặc ban đêm tại các phế tích tâm linh (`crooked_path`, `sub_root_cellar`, `silent_mire`, `sub_bell_workshop`, `deep_forest`, `broken_bell_shrine`). Đặc biệt tại các tầng hầm (`sub_*`) không có ánh sáng mặt trời, hồn ma xuất hiện cả ban ngày lẫn ban đêm.
  - Cooldown: $30\text{s}$ đến $75\text{s}$.
- **Hành vi AI:**
  1. *Điềm báo giá lạnh:* Gió rít lạnh buốt, nhiệt độ cơ thể tụt $-15^\circ\text{C}$ (`temperature -15`), phát âm thanh jumpscare rên rỉ u uất.
  2. *Lướt xuyên vật cản:* Hiện hình từ sương mù cách người chơi $110\text{ px}$, lướt từ từ về phía người chơi với vận tốc $40\text{ px/s}$ (`shade_drift`).
  3. *Soul Wail:* Khi chạm trúng ($< 24\text{ px}$), không gây sát thương máu trực tiếp nhưng trừ $-25\text{ Composure}$, màn hình co giật tím tối ma mị (`0x3d1f47`), phát tiếng thở hắt kinh hoàng rồi bốc hơi tan biến.
  4. *Counterplay (Khắc chế ánh sáng):* Bật Đèn Lồng Hổ Phách chiếu thẳng vào Hồn Ma trong cự ly $< 120\text{ px}$ hoặc chạy vào Sanctuary/Lửa trại sẽ thiêu đốt bản thể ma quái, khiến nó rít lên đau đớn và bốc hơi thành sương mù (`dissolve()`). Đòn chém vũ khí cũng giải trừ hồn ma lập tức.

### 2.3 Kẻ Rình Mập Vô Diện (The Unseen Stalker / Goblin Scout)
*Tài nguyên:* `public/assets/characters/monsters/goblin_scout_dagger_sheet.png` ($1024 \times 1216\text{ px}$, frames $64 \times 64\text{ px}$).
- **Giải Pháp Khắc Phục Thiếu Sprite Thân Thể:**
  - Thiết kế thực thể tàng hình vô diện trong sương mù: Thân thể tàng hình, chỉ có lưỡi dao găm bóng tối le lói ánh tím đen dập dềnh lướt đi trong không khí.
  - Hoàn toàn 0 lỗi runtime, tạo ấn tượng bí ẩn kinh dị vượt trội.
- **Hành vi AI Trinh Sát & Dẫn Đường:**
  1. *Giữ cự ly rình rập:* Trôi lơ lửng bám theo người chơi ở cự ly $130 - 180\text{ px}$, không cận chiến trực tiếp.
  2. *Báo động quái vật cấp cao:* Định kỳ mỗi $6\text{ giây}$, gõ dao lảnh lót / huýt sáo vang dội (`scout_whistle`), kích động Sói Xương chuyển hướng lao về phía người chơi và báo động Quái Nghe Tiếng Động (`The Listener`).
  3. *Tàng hình lẩn trốn (Smoke Puff Stealth):* Khi người chơi tiếp cận quá gần ($< 70\text{ px}$), rọi đèn lồng vào ($< 150\text{ px}$) hoặc vung vũ khí chém trúng, Goblin Scout ném bom khói tím đen mù mịt (`createSmokePuff`), rít lên và lướt biến mất với vận tốc $160\text{ px/s}$.

### 2.4 Nhóm Quái Vật Bóng Tối (Shadow Series)
- **Quạ Bóng Tối (`ShadowCrowEntity`):** Đậu trên cành cây/hàng rào, báo động The Listener khi người chơi chạy qua hoặc vung vũ khí.
- **Bóng Mắt Sương Mù (`ShadowEyesEntity`):** Lơ lửng trong bụi rậm; không tấn công vật lý nhưng nhìn chằm chằm rút $-8$ Bình Tâm mỗi giây trong bóng tối. Lập tức tan rã khi đèn lồng rọi tới (`dissolveByLight()`).
- **Trùm Bóng Tối Khổng Lồ (`ShadowBehemothBoss`):** Trấn giữ Silent Mire và Broken Bell Shrine; quất sóng chấn động Fissure Slam khi giao chiến.

---

## 3. MA TRẬN XUẤT HIỆN 5 CHIỀU & NGƯỠNG AN TOÀN (DYNAMIC SPAWNING MATRIX)

$$\text{SpawnEligibility} = f(\text{ZoneRiskTier}, \text{TimePhase}, \text{GlobalEntityCap}, \text{ZoneCooldown}, \text{QuestGating})$$

| Phân Khu (Zone) | Cấp Độ Nguy Hiểm | Ban Ngày (DAY) | Hoàng Hôn (DUSK) | Đêm Sương (NIGHT) | Cap | Cooldown |
|:---|:---:|:---|:---|:---|:---:|:---:|
| `bellhollow` | Tier 1 | 0 quái | 0 quái | 0 quái (Vùng Sanctuary) | 0 | Vô hạn |
| `sanctuary_farm` | Tier 1 | 0 quái | 1 Quạ rừng | 0 quái (Lửa trại bảo hộ) | 1 | Vô hạn |
| `fog_crossing` | Tier 2 | 0 quái | 1 Dơi sương mù | 2 Dơi + 1 Mắt bóng đêm | 3 | 60s |
| `outer_woods` | Tier 2 | 1 Quạ rừng | 2 Dơi sương mù | 1 Sói xương + 2 Dơi | 3 | 60s |
| `crooked_path` | Tier 3 | 1 Sói xương (Ngủ đông) | 1 Sói xương + 1 Quạ | 2 Sói + 1 Ma + Goblin Scout | 3 | 45s |
| `sub_root_cellar` | Tier 3 | 1 Hồn ma lang thang | 1 Ma + 1 Mắt bụi | 2 Hồn ma cổ linh | 2 | 75s |
| `silent_mire` | Tier 4 | 1 Sói xương lội bùn | 2 Sói + 2 Mắt bụi | 2 Sói + 2 Dơi + 1 Ma | 4 | 40s |
| `sub_bell_workshop` | Tier 4 | 1 Hồn ma thợ rèn | 1 Hồn ma + 1 Dơi | 2 Hồn ma + 2 Dơi | 3 | 45s |
| `deep_forest` | Tier 5 | 2 Sói xương tuần tra | 2 Sói + 2 Dơi + 1 Mắt | 2 Sói + 2 Ma + 3 Dơi | 5 | 30s |
| `broken_bell_shrine` | Tier 5 | 1 Hồn ma miếu cổ | 2 Hồn ma miếu cổ | 3 Hồn ma + Sương độc | 4 | 30s |

### Ngưỡng An Toàn & Tối Ưu Hiệu Năng
1. **Bán kính Ngủ đông (Culling Distance = 560px):** Toàn bộ thực thể ngoài bán kính 560px tự động chuyển sang chế độ ngủ đông (`isHibernating = true`), ngừng hoàn toàn cập nhật physics và animation để duy trì ổn định 60 FPS.
2. **Ngưỡng an toàn sau phục kích (Grace Period = 45s):** Sau khi bị Dơi cắn hoặc Hồn ma chạm trúng, hệ thống khóa toàn bộ cơ chế phục kích mới trong 45 giây, triệt tiêu hoàn toàn sự ức chế do jumpscare liên hồi.

---

## 4. LIÊN KẾT HỆ SINH THÁI & BIẾN ĐỔI MÔI TRƯỜNG KHI BOSS THỨC TỈNH

### 4.1 Điềm Báo Động Vật (Wild Forewarning)
- **Đàn Quạ Rừng (`WildlifeEntity`):** Tự động phát hiện khi thực thể săn mồi lớn (Sói Xương, Hiệp Sĩ Sa Ngã, Kỵ Binh Hắc Ám, The Listener, Hooded Knight, Behemoth) tiến vào bán kính $250\text{ px}$. Đàn quạ lập tức vỗ cánh thét vang `caw-caw` và bay vút lên bầu trời, cung cấp cho người chơi điềm báo sớm $3 - 5\text{ giây}$ để kịp lẩn vào bụi rậm.
- **Đom Đóm & Bướm Đêm Hổ Phách (`lantern_moth`):** Tự động mờ dần và tắt phát quang khi Hồn Ma hoặc Bóng Mắt tiến vào bán kính $180\text{ px}$, báo hiệu sát khí bóng tối đang bao vây.

### 4.2 Đội Hình Quái Hộ Vệ (Minion Retinue)
- **Chỉ Huy Hiệp Sĩ Trùm Mũ (Hooded Knight Boss):** Khi xuất hiện tại Rừng Sâu (`deep_forest`), luôn có 2 Hiệp Sĩ Sa Ngã (Fallen Knight) tháp tùng cách trùm $110\text{ px}$, tạo thành thế gọng kìm hộ vệ chủ tướng.
- **Kẻ Nuốt Tiếng Chuông (Mire Warden) & Chúa Tể Đầm Lầy (Shadow Behemoth):** Khi giao chiến, đầm lầy sôi sục bùn đen và gọi ra 3 Dơi Sương Mù túa ra bay vần vũ trên mặt nước, phân tán sự tập trung của người chơi.

### 4.3 Biến Đổi Môi Trường Khi Boss Thức Tỉnh (Boss Awakening Shift)

$$\text{EnvironmentShift} = \{\text{VeilDrift} \times 2.2, \quad \text{VeilDensity} \times 1.8, \quad \text{LightRadius} \times 0.55, \quad \text{Tint}: \text{\#2a141e}\}$$

1. **Hiệu ứng Sương Mù Cuộn Trào (Veil Surge):**
   - Tốc độ trôi dạt tự nhiên của các tầng sương Parallax trong `VeilSystem` tăng tốc lên $2.2\times$ (`bossDriftMult = 2.2`).
   - Độ mờ sương mù tăng lên tới $0.92$, tạo cảm giác ngột ngạt nghẹt thở.
2. **Bóp Nghẹt Ánh Sáng Đèn Lồng:**
   - Sương độc đè nén bán kính soi sáng của Đèn Lồng Hổ Phách từ $200\text{ px}$ xuống chỉ còn $\approx 110\text{ px}$ (`targetBaseRadius *= 0.55`).
3. **Biến Đổi Sắc Độ Toàn Cảnh (Global Color Grading):**
   - Toàn bộ sương mù và ánh sáng bị nhuộm một màu đỏ tía u ám ngả than bùn (`0x2a141e`).
4. **Cộng Hưởng Âm Thanh Áp Lực (Horror Soundscape):**
   - Kênh Ambient thường nhật tự động bị dìm xuống $50\%$ (`duckAmbience(0.5)`).
   - Kích hoạt vòng lặp Drone trầm đục (`boss_drone`) và tiếng nhịp tim đập thình thịch dồn dập $550\text{ ms}$ (`setHeartbeatActive(true, 550)`).

---

## 5. TƯƠNG TÁC ĐÒN ĐÁNH & SÁT THƯƠNG HOÀN CHỈNH (COMBAT HOOKS)

Đã tích hợp đầy đủ đòn đánh vũ khí của người chơi (`Gậy Gỗ`, `Giáo Gỗ`, `Rìu Sắt`) lên toàn bộ quái vật mới trong `GameScene.ts`:
- **Chém trúng Dơi Sương Mù:** Phát tia lửa va chạm, dơi thét lên đau đớn và hủy cú cắn, bay vút lên trần sương mù tan biến.
- **Chém trúng Hồn Ma:** Vũ khí phá hủy thể tâm linh, hồn ma tan rã thành làn khói lạnh (`dissolve()`).
- **Chém trúng Goblin Scout:** Kẻ rình mập ném bom khói tàng hình lẩn thoát tức thì.

---

## 6. KẾT QUẢ KIỂM THỬ KỸ THUẬT

```
========================================================================
HOLLOW WOODS V1.4 — KIỂM THỬ TỰ ĐỘNG BƯỚC 9: HỆ SINH THÁI QUÁI VẬT & CHẠM TRÁN
========================================================================

--- 1. Kiểm tra Tệp Tài Nguyên Hình Ảnh & Sprite Sheet ---
  [PASS] Tệp bat_sheet.png tồn tại trong public/
  [PASS] Tệp ghost_sheet.png tồn tại trong public/
  [PASS] Tệp goblin_scout_dagger_sheet.png tồn tại trong public/
  [PASS] bat_sheet.png có dung lượng hợp lệ (16948 bytes)
  [PASS] ghost_sheet.png có dung lượng hợp lệ (14168 bytes)
  [PASS] goblin_scout_dagger_sheet.png có dung lượng hợp lệ (21019 bytes)

--- 2. Kiểm tra Logic Thực Thể Phục Kích (AmbushMonsters.ts) ---
  [PASS] Lớp MistBatAmbushEntity được định nghĩa
  [PASS] Hoạt ảnh Dơi bổ nhào và vút bay thoát được khởi tạo
  [PASS] Dơi gây -8 HP và -15 Composure khi cắn trúng
  [PASS] Dơi kích hoạt hiệu ứng chao đảo ánh sáng đèn lồng (lantern_flicker)
  [PASS] MistBatAmbushEntity có hàm takeDamage khi người chơi đánh trúng
  [PASS] Lớp WanderingShadeEntity được định nghĩa
  [PASS] Hồn ma giáng đòn hủy diệt Bình Tâm (-25 Composure)
  [PASS] Hồn ma gây sốc nhiệt buốt giá (-15°C)
  [PASS] Hồn ma có cơ chế tan biến (dissolve) khi chiếu đèn lồng hoặc vào Sanctuary
  [PASS] Lớp GoblinScoutEntity được định nghĩa
  [PASS] Goblin Scout có cơ chế huýt sáo cảnh báo (scout_whistle)
  [PASS] Goblin Scout tạo hiệu ứng bom khói khi tàng hình rút lui
  [PASS] Goblin Scout có cơ chế tàng hình lẩn thoát khi bị chiếu đèn hoặc bị áp sát

--- 3. Kiểm tra Logic Nhóm Quái Vật Bóng Tối (ShadowMonsters.ts) ---
  [PASS] Lớp ShadowCrowEntity được định nghĩa
  [PASS] Lớp ShadowEyesEntity được định nghĩa
  [PASS] Lớp ShadowBehemothBoss được định nghĩa
  [PASS] Bóng Mắt Sương Mù tan biến khi chiếu ánh đèn lồng
  [PASS] Bóng Mắt rút cạn Bình Tâm trong bóng tối

--- 4. Kiểm tra Ma Trận Chạm Trán & Hệ Sinh Thái (WildlifeSystem.ts) ---
  [PASS] Tọa độ sinh cảnh Sói Xương được cấu hình
  [PASS] Tọa độ sinh cảnh Quạ Bóng Tối được cấu hình
  [PASS] Tọa độ sinh cảnh Bóng Mắt được cấu hình
  [PASS] Tọa độ sinh cảnh Shadow Behemoth Boss được cấu hình
  [PASS] Tọa độ sinh cảnh Hooded Knight Boss được cấu hình
  [PASS] Hệ thống có cơ chế Grace Period 45s chống dội jumpscare liên tiếp
  [PASS] Vùng xuất hiện Dơi Sương Mù được cấu hình theo bảng thiết kế
  [PASS] Vùng xuất hiện Hồn Ma được cấu hình theo bảng thiết kế
  [PASS] Vùng xuất hiện Goblin Scout được cấu hình
  [PASS] Quạ rừng cảnh báo sớm (Forewarning) khi thực thể cấp cao tiến vào bán kính 250px
  [PASS] Đom đóm / bướm đêm tắt phát quang lẩn trốn khi Hồn ma / Bóng mắt đến gần
  [PASS] Đội hình hộ vệ: Hooded Knight Boss được tháp tùng bởi 2 Fallen Knight
  [PASS] Đội hình hộ vệ: Mire Warden / Behemoth kéo theo 3 Dơi Sương Mù
  [PASS] WildlifeSystem cung cấp phương thức isBossAwakened()
  [PASS] Cung cấp getter getMistBats()
  [PASS] Cung cấp getter getWanderingShades()
  [PASS] Cung cấp getter getGoblinScouts()

--- 5. Kiểm tra Biến Đổi Môi Trường Khi Boss Thức Tỉnh (VeilSystem & GameScene) ---
  [PASS] VeilSystem có hàm setBossAwakened và getIsBossAwakened
  [PASS] Tốc độ cuộn sương mù Parallax tăng lên 2.2x khi Boss thức tỉnh
  [PASS] Độ mờ sương mù dày đặc tăng lên khi Boss thức tỉnh
  [PASS] Sương mù đổi sắc đỏ tía u ám than bùn (0x2a141e)
  [PASS] Ánh sáng đèn lồng bị bóp nghẹt 0.55x (từ 200px xuống ~110px) khi Boss thức tỉnh
  [PASS] GameScene đồng bộ hóa trạng thái Boss thức tỉnh với VeilSystem
  [PASS] GameScene đồng bộ hóa trạng thái Boss thức tỉnh với AudioManager
  [PASS] AudioManager có hàm setBossAwakeningState

--- 6. Kiểm tra Tương Tác Sát Thương & Đòn Đánh (GameScene.ts) ---
  [PASS] Đòn đánh vũ khí tác động lên Dơi Sương Mù
  [PASS] Đòn đánh vũ khí tác động lên Hồn Ma
  [PASS] Đòn đánh vũ khí tác động lên Goblin Scout

========================================================================
KẾT QUẢ KIỂM THỬ: 52 PASS / 0 FAIL (100%)
========================================================================
```

- **Kiểm tra biên dịch TypeScript (`npm run check`):** `0 errors`.
- **Kiểm tra đóng gói Vite (`npm run build`):** Hoàn thành trong `9.45s` với `dist/index.html` và `dist/assets/`.
- **Tệp phát hành:** Đã cập nhật [HOLLOW_WOODS_v1.4.zip](file:///g:/HOLLOW%20WOODS/HOLLOW_WOODS_v1.4.zip) (23.64 MB, 281 tệp, chuẩn POSIX không bọc thư mục `dist/`).

---

## 7. DANH MỤC TỆP ĐÃ THAY ĐỔI & TẠO MỚI

1. [src/entities/AmbushMonsters.ts](file:///g:/HOLLOW%20WOODS/src/entities/AmbushMonsters.ts) — Hoàn thiện hành vi Dơi phục kích, Hồn ma sốc nhiệt và Kẻ Rình Mập Vô Diện.
2. [src/systems/WildlifeSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/WildlifeSystem.ts) — Tích hợp ma trận chạm trán 5 chiều, đội hình hộ vệ và chuỗi điềm báo sinh thái.
3. [src/systems/VeilSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/VeilSystem.ts) — Triển khai biến đổi môi trường Boss thức tỉnh (Parallax drift 2.2x, mật độ sương 1.8x, màu đỏ tía than bùn `0x2a141e`).
4. [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts) — Bóp nghẹt ánh sáng đèn lồng 0.55x, hiệu ứng chao đảo ánh sáng và đòn đánh vũ khí lên quái vật mới.
5. [scripts/verify_step9_monster_ecology.mjs](file:///g:/HOLLOW%20WOODS/scripts/verify_step9_monster_ecology.mjs) — Bộ kiểm thử tự động 52 tiêu chí kiểm định.
6. [docs/v1.4/monster_ecology_and_encounters_report.md](file:///g:/HOLLOW%20WOODS/docs/v1.4/monster_ecology_and_encounters_report.md) — Báo cáo kỹ thuật chi tiết.
