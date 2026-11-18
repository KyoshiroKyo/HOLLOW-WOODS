# HOLLOW WOODS V1.5 — THÔNG SỐ CÂN BẰNG SINH TỒN & BÌNH TÂM
## HỆ THỐNG TINH THẦN (BÌNH TÂM), RÚT MÁU LŨY TIẾN & KHU AN TOÀN

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã tài liệu:** `V15-05`, `V15-06`, `V15-07` & `V15-08` / `03_Sanity_Vision_And_NightAI.md`  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (69/69 bài kiểm tra tự động PASS [19/19 V15-05 + 16/16 V15-06 + 23/23 V15-07 + 11/11 V15-08], 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. NGUYÊN TẮC CÂN BẰNG BÌNH TÂM (COMPOSURE DYNAMICS)

Bình Tâm (Composure, thang điểm $0 - 100$) là trụ cột sinh tồn tâm lý cốt lõi của HOLLOW WOODS. Trong bản nâng cấp V1.5:
- **Xóa bỏ triệt để lỗi cảnh báo sai ban ngày:** Trước đây, khi tắt Đèn Lồng vào Ban Ngày (DAY) hoặc đứng trong làng Bellhollow an toàn, hệ thống vẫn nhầm tưởng người chơi đang ở trong sương tối và kích hoạt cảnh báo đỏ "HOẢNG LOẠN!" cùng viền vignette co giật.
- **Tách biệt rõ ràng 3 trạng thái môi trường:**
  1. **Nguồn Nhiệt / Lửa Trại Đang Cháy (`nearCampfire`):** Hồi phục mạnh Sinh Lực ($+4.0\text{ HP/s}$) và Bình Tâm ($+4.0\text{ Composure/s}$, gia tốc khi trong Sanctuary).
  2. **Ban Ngày (DAY) hoặc Vùng An Toàn Làng Bellhollow (`isProtected`):** Bình Tâm không tự tụt mà được hồi phục tự nhiên mượt mà ($+1.5\text{ Composure/s}$) nhờ ánh nắng tự nhiên và sự che chở của cư dân làng. Tự động xóa sạch viền vignette và tắt biểu ngữ cảnh báo.
  3. **Hoàng Hôn (DUSK) & Đêm Sương (NIGHT) ngoài vùng hoang dã:** Khi tắt Đèn Lồng, Bình Tâm tụt dần theo bảng cấu hình `TIME_CONFIG`. Khi Bình Tâm suy giảm, cơ chế rút Sinh Lực lũy tiến 3 cấp độ sẽ được kích hoạt.

---

### 2. BẢNG THÔNG SỐ 3 CẤP ĐỘ SUY GIẢM BÌNH TÂM (PROGRESSIVE COMPOSURE DRAIN TIERS)

Khi nhân vật ở ngoài vùng an toàn, vào ban đêm / hoàng hôn và không thắp sáng Đèn Lồng:

| Cấp Độ | Ngưỡng Bình Tâm | Tác Động Lên Sinh Lực (HP) | Tác Động Lên Thể Lực (Stamina) | Tác Động Di Chuyển | Hiệu Ứng Nghe Nhìn (Audio/Visual) | Biện Pháp Cứu Sinh |
|:---|:---:|:---|:---|:---:|:---|:---|
| **Cấp 1: Ngưỡng Bất An** *(Uneasy)* | **25 đến 40 / 100** | **Không mất máu** ($0\text{ HP/s}$) | Tốc độ hồi Thể Lực giảm **15%** (`recoveryRate *= 0.85`) | Tốc độ bình thường ($100\%$) | Định kỳ mỗi $10\text{s}$ phát ra **tiếng thở nhẹ cảnh báo** (`playUneasyBreathing`) | Bật Đèn Lồng [F], uống Trà Rễ Thảo Dược |
| **Cấp 2: Ngưỡng Sợ Hãi** *(Frightened)* | **10 đến 24 / 100** | Bắt đầu rút máu: **-1.5 HP mỗi 2.0 giây** ($-0.75\text{ HP/s}$) | Tốc độ hồi Thể Lực giảm **15%** | Tốc độ di chuyển giảm **10%** (`speedMultiplier *= 0.90`) | Nhịp tim hồi hộp vừa phải ($750\text{ms}$), viền màn hình tím sẫm nhấp nháy hữu cơ | Thắp sáng Đèn Lồng [F], cắm Đuốc Nhựa Thông, dùng Cao Dược |
| **Cấp 3: Hoảng Loạn Cực Độ** *(Extreme Panic)* | **Dưới 10 / 100** *(và chạm 0)* | Rút máu nặng: **-3.5 HP mỗi 1.5 giây** ($-2.333\text{ HP/s}$) | Tốc độ hồi Thể Lực giảm **15%** | Tốc độ di chuyển giảm mạnh **20%** (`speedMultiplier *= 0.80`) | Nhịp tim dồn dập ($480\text{ms}$), **camera rung giật nhẹ theo nhịp tim** (`shake(160, 0.0035)` mỗi $1.5\text{s}$), viền màn hình co bóp đỏ thẫm (`0x3d0b16`) | **BẮT BUỘC LẬP TỨC:** Thắp Đèn Lồng [F], cắm Đuốc, uống Trà An Thần hoặc chạy thục mạng về nguồn lửa |

---

### 3. CƠ CHẾ TỰ ĐỘNG GIẢI PHÓNG & TẮT BIỂU NGỮ CẢNH BÁO

1. **Tự động tắt cảnh báo khi vượt ngưỡng an toàn:**
   - Ngay khi Bình Tâm hồi phục vượt lên $\ge 40/100$, hoặc khi người chơi thắp sáng Đèn Lồng [F], hoặc bước vào làng Bellhollow / đứng cạnh Lửa Trại / trời sáng ban ngày:
     - `this.panicVignetteGraphics.clear()` được gọi ngay lập tức.
     - Biến cờ `isPanicVignetteActive = false`.
     - Nhịp tim `setHeartbeatActive(false)`.
     - Toàn bộ popup cảnh báo "HOẢNG LOẠN!" bị vô hiệu hóa.
2. **Âm thanh Procedural Web Audio API:**
   - `playUneasyBreathing()`: Tổng hợp luồng khí thở nhẹ thông qua noise buffer kết hợp bandpass filter ($320\text{Hz} \to 180\text{Hz}$, $Q = 1.5$), tạo cảm giác nhân vật run rẩy, bất an một cách tự nhiên và điện ảnh.
   - Nhịp tim 2 pha (Thump-Thump) tăng tốc từ $750\text{ms}$ lên $480\text{ms}$ khi bước vào ngưỡng Hoảng Loạn Cực Độ.

---

### 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & BIÊN DỊCH

- **Kiểm thử tự động (`verify_v15_05_sanity_mechanics.mjs`):**
  - **19/19 bài kiểm tra ĐẠT (PASS 100%)**:
    1. Nhận diện chính xác pha BAN NGÀY (`DAY`).
    2. Bảo vệ kép: Ban Ngày hoặc Làng Bellhollow an toàn.
    3. Hồi phục tự nhiên $+1.5\text{ Composure/s}$ khi được bảo vệ.
    4. Hồi phục $+4.0\text{ Composure/s}$ khi đứng cạnh lửa trại.
    5. Chỉ rút máu ngoài vùng an toàn / ban đêm và khi tắt đèn lồng.
    6. Ngưỡng Hoảng Loạn Cực Độ ($<10$): Rút Sinh Lực $-3.5\text{ HP}$ mỗi $1.5\text{s}$ ($-2.333\text{ HP/s}$).
    7. Ngưỡng Sợ Hãi ($10..24$): Rút Sinh Lực $-1.5\text{ HP}$ mỗi $2\text{s}$ ($-0.75\text{ HP/s}$).
    8. Ngưỡng Bất An ($\le 40$): Giảm $15\%$ tốc độ hồi Thể Lực (`recoveryRate *= 0.85`).
    9. Kiểm tra ngưỡng Hoảng Loạn Cực Độ ($<10$) trong di chuyển.
    10. Hoảng Loạn Cực Độ giảm $20\%$ tốc độ di chuyển (`speedMultiplier *= 0.80`).
    11. Kiểm tra ngưỡng Sợ Hãi ($10..24$) trong di chuyển.
    12. Ngưỡng Sợ Hãi giảm $10\%$ tốc độ di chuyển (`speedMultiplier *= 0.90`).
    13. `UIScene` nhận diện trạng thái BAN NGÀY.
    14. Tự động tắt cảnh báo khi Ban Ngày, Khu An Toàn hoặc Bình Tâm $\ge 40$.
    15. Xóa sạch viền đỏ hoảng loạn ngay khi vượt ngưỡng nguy hiểm.
    16. `AudioManager` có hàm phát tiếng thở nhẹ cảnh báo `playUneasyBreathing`.
    17. Hoảng loạn cực độ kích hoạt nhịp tim dồn dập ($480\text{ms}$).
    18. Hoảng loạn cực độ kích hoạt rung camera theo nhịp tim.
    19. Ngưỡng Bất An định kỳ phát tiếng thở nhẹ cảnh báo.
- **Kiểm tra TypeScript (`npx tsc --noEmit`):** **0 lỗi biên dịch**.
- **Kiểm tra đóng gói (`npm run build`):** Hoàn tất thành công trong **11.12s**.

---

### 5. BƯỚC V15-06: THU HẸP TẦM NHÌN ĐỘNG & HIỆU ỨNG THỊ GIÁC U ÁM

#### 5.1. Liên kết Trực Tiếp Bình Tâm (Composure) Vào Bán Kính Chiếu Sáng
Bình Tâm không chỉ tác động lên Sinh Lực mà còn chi phối trực tiếp tầm quan sát của nhân vật. Khi tâm trí bị sương mù xâm thực:
- **Phương thức toán học (`VeilSystem.getComposureVisionScale`):**
  $$\text{Scale}(C) = \begin{cases} 1.0 & \text{khi } C \ge 50 \\ \text{lerp}(0.45, 1.0, \frac{C}{50.0}) = 0.45 + 0.55 \times \frac{C}{50.0} & \text{khi } 0 \le C < 50 \end{cases}$$
- **Hành vi cụ thể:**
  - $C \ge 50\%$: Giữ nguyên $100\%$ ($1.0$) bán kính tầm nhìn cơ bản và quầng sáng đèn lồng.
  - $C = 25\%$: Tầm nhìn co lại còn $72.5\%$ ($0.725$).
  - $C = 0\%$: Thu hẹp cực đại xuống mức sàn $45\%$ ($0.45$) so với bình thường.
  - Kể cả khi nhân vật đang bật đèn lồng, quầng sáng cũng bị bóp nhỏ và xuất hiện hiệu ứng chập chờn (`panicFlickerSeverity = (50 - C) / 50`) như ngọn lửa sắp lụi tàn trong sương mù.

#### 5.2. Lớp Phủ Viền Tối Co Bóp Theo Nhịp Tim (Dark Tendril Vignette)
Khi Bình Tâm rơi xuống dưới ngưỡng nguy kịch ($C < 30\%$):
- Hệ thống kích hoạt hiệu ứng **Dark Tendril Vignette** ở 4 góc màn hình (`VeilSystem.ts` & `UIScene.ts`):
  - **4 dải viền mở rộng:** Độ dày từ $36\text{px}$ tăng dần lên đến $140\text{px}$ khi $C \to 0$.
  - **4 cụm tam giác tua bóng tối:** Phủ kín 4 góc màn hình với kích thước từ $80\text{px}$ vươn dài tới $260\text{px}$, co bóp nhịp nhàng theo nhịp tim hoảng loạn (`heartbeatPulse`).
  - Màu sắc: Tím sẫm hắc ám (`0x120617`), alpha lũy tiến từ $0.2 \to 0.75$, tạo cảm giác bóng tối như những xúc tu sương mù đang siết chặt lấy tầm mắt người chơi.

#### 5.3. Cơ Chế Chuyển Tiếp Tầm Nhìn Êm Dịu (Smooth Vision Transition)
- Khi người chơi hồi phục Bình Tâm (bật đèn [F], uống Trà Rễ Thảo Dược, bước vào vùng Lửa Trại), bán kính mục tiêu `targetBaseRadius` lớn hơn bán kính hiện tại `currentLanternRadius`.
- Thay vì nở to đột ngột gây chói mắt (flash) hoặc giật cục, `GameScene.ts` áp dụng hệ số nội suy:
  $$\text{lerpFactor} = 0.045$$
- Với $60\text{ FPS}$, sau 90 frames ($\approx 1.5\text{ giây}$), độ mở bán kính đạt $1 - (1 - 0.045)^{90} \approx 98.4\%$, chuyển tiếp từ tốn, mượt mà và tự nhiên theo chuẩn game sinh tồn phiêu lưu.

---

### 6. BẢNG TỔNG HỢP KIỂM THỬ V15-06 (`verify_v15_06_vision_and_dark_tendril.mjs`)

| Nhóm Kiểm Thử | Nội Dung Kiểm Tra | Kết Quả |
|:---|:---|:---:|
| **VeilSystem.ts** | Phương thức `getComposureVisionScale`, ngưỡng $\ge 50\% \to 1.0$, thu hẹp về $0.45$ tại $0\%$, Dark Tendril $< 30\%$, 4 góc tam giác tua đen tím | **PASS** (5/5) |
| **Toán học Thu Hẹp** | Kiểm tra chính xác các mốc $100\%$, $50\%$, $25\%$ ($0.725$) và $0\%$ ($0.45$) | **PASS** (4/4) |
| **UIScene.ts** | Phương thức `getComposureVisionFactor`, đồng bộ viền tối 4 góc co bóp theo nhịp tim khi $< 30\%$ | **PASS** (2/2) |
| **GameScene.ts** | Gọi `getComposureVisionScale`, nhân `compScale` vào `targetBaseRadius`, quầng sáng chập chờn khi $< 50\%$, phát hiện mở rộng tầm nhìn, `lerpFactor = 0.045` trong $\sim 1.5\text{s}$ | **PASS** (5/5) |
| **Tổng Cộng** | **Tất cả các tiêu chí của V15-06** | **16/16 PASS (100%)** |

---

### 7. BƯỚC V15-07: HỆ SỐ HUNG HÃN BAN ĐÊM (NIGHT AGGRESSION MULTIPLIER)

#### 7.1. Cấu Trúc Hệ Thống Cân Bằng Chu Kỳ Ngày / Hoàng Hôn / Đêm
Hệ thống kết nối trực tiếp giữa [DayNightSystem.ts](file:///g:/HOLLOW%20WOODS/src/systems/DayNightSystem.ts) với [ListenerAI.ts](file:///g:/HOLLOW%20WOODS/src/systems/ListenerAI.ts) và [SkullWolfEntity.ts](file:///g:/HOLLOW%20WOODS/src/entities/SkullWolfEntity.ts) thông qua giao diện `NightAggressionConfig`:

| Tiêu Chí Kỹ Thuật | Ban Ngày (DAY) | Hoàng Hôn (DUSK) | Đêm Sương (NIGHT) |
|:---|:---:|:---:|:---:|
| **The Listener: Tốc độ tuần tra** | $30\text{ px/s}$ *(Chậm rãi rìa rừng)* | $42\text{ px/s}$ *(Bình thường)* | $42\text{ px/s}$ |
| **The Listener: Tốc độ truy đuổi** | $90\text{ px/s}$ | $105\text{ px/s}$ *(Cơ bản)* | **$136.5\text{ px/s}$ (+30%)** |
| **The Listener: Bán kính phát hiện âm thanh** | $140\text{ px}$ | **$161\text{ px}$ (+15%)** | **$196\text{ px}$ (+40%)** |
| **The Listener: Thời gian đứng nghe nghi ngờ** | $2.0\text{ giây}$ ($2000\text{ms}$) | $1.5\text{ giây}$ ($1500\text{ms}$) | **$0.75\text{ giây}$ ($750\text{ms}$)** *(Lao tới vồ ngay)* |
| **The Listener: Thời gian bám vết tích mất dấu** | $1.8\text{ giây}$ | $2.2\text{ giây}$ | **$3.5\text{ giây}$** *(Bám dai dẳng hơn)* |
| **The Listener: Thời gian lùng sục hiện trường** | $3.5\text{ giây}$ | $4.5\text{ giây}$ | **$6.5\text{ giây}$** *(Tìm kiếm quyết liệt)* |
| **Sói Xương: Trạng thái hoạt động** | **Rút về hang nghỉ ngơi** (`den_rest`) | Bắt đầu thức giấc săn mồi | **Săn Đêm Hung Hãn** |
| **Sói Xương: Phối hợp bọc sườn (Flanking)** | Tắt | Tắt | **Bật (Sói 1: $-35^\circ$, Sói 2: $+35^\circ$)** |
| **Sói Xương: Tốc độ vồ (Lunge Speed)** | $195\text{ px/s}$ | $195\text{ px/s}$ | **$243.75\text{ px/s}$ (+25%)** |
| **Sói Xương: Khoảng cách ép rìa đèn lồng** | An toàn trong hang | $45 - 50\text{ px}$ | **$15\text{ px}$** *(Ép sát ngay mép sáng)* |
| **Sói Xương: Vượt ranh giới khi Bình Tâm $< 25\%$** | Không | Không | **Dám lao chồm qua ánh sáng để cắn** |

#### 7.2. Tín Hiệu Cảnh Báo Công Bằng Khi Đêm Xuống (Fair Warning Telegraphed Feedback)
Khi đồng hồ chu kỳ thế giới vừa chuyển sang pha **Đêm Sương (`NIGHT`)**:
1. **Âm thanh tổng hợp Procedural Web Audio API:**
   - `playCrackedBellToll()`: Tiếng chuông nứt ngân trầm với 6 hài âm bất hòa ($115\text{Hz}, 168\text{Hz}, 248\text{Hz}, 375\text{Hz}, 520\text{Hz}, 780\text{Hz}$), mô phỏng tiếng chuông cổ rạn nứt u ám từ Miếu Chuông Vỡ.
   - `playDistantWolfHowl()`: Tiếng sói hú xa xăm trong sương ($320\text{Hz} \to 540\text{Hz} \to 280\text{Hz}$, vibrato $5.2\text{Hz}$, lọc bandpass $650\text{Hz}$), cất lên sau tiếng chuông $450\text{ms}$.
2. **Hiệu ứng thị giác & Camera:**
   - **Mắt The Listener:** Hai đốm mắt đỏ rực (`0xff1111` / `0xff5555`) lóe sáng mạnh mẽ với tween phóng to $1.6\times$ trong bóng tối.
   - **Mắt Sói Xương:** Hai hốc mắt đầu lâu rực màu xanh lân tinh hắc ám (`0x00ffcc` / `0xaaffea`).
   - **Popup HUD & Rung Camera:** Thông báo `"🌙 ĐÊM SƯƠNG BUÔNG XUỐNG! Tiếng sói hú xa xăm... Kẻ Lắng Nghe và bầy quái vật bước vào trạng thái Săn Đêm!"` đi kèm rung chấn nhẹ `shake(350, 0.0025)`.

---

### 8. BẢNG TỔNG HỢP KIỂM THỬ V15-07 (`verify_v15_07_night_aggression.mjs`)

| Nhóm Kiểm Thử | Nội Dung Kiểm Tra | Kết Quả |
|:---|:---|:---:|
| **DayNightSystem.ts** | Interface `NightAggressionConfig`, phương thức `getNightAggressionConfig`, thông số chuẩn 3 pha DAY / DUSK / NIGHT | **PASS** (5/5) |
| **ListenerAI.ts** | Thuộc tính `currentPhase`, `aggressionConfig`, tốc độ tuần tra/truy đuổi, thời gian nghe nghi ngờ $0.75\text{s}$, thời gian bám dấu vết $3.5\text{s}$, thời gian tìm kiếm $6.5\text{s}$ | **PASS** (5/5) |
| **TheListener.ts** | Phương thức `setTimePhase`, đồng bộ bán kính nghe, hàm `onNightfall`, vẽ mắt đỏ rực `drawGlowingEyes` | **PASS** (2/2) |
| **SkullWolfEntity.ts** | Trạng thái `den_rest`, mắt xanh lân tinh `0x00ffcc`, ép rìa đèn $15\text{px}$, tăng $25\%$ tốc độ vồ, lao chồm qua ánh sáng khi $C < 25\%$, bọc sườn | **PASS** (6/6) |
| **WildlifeSystem.ts** | Truyền góc lệch bọc sườn $\pm 0.61\text{ rad}$ ($\pm 35^\circ$) cho cặp sói và chỉ số Bình Tâm | **PASS** (1/1) |
| **AudioManager & GameScene** | Chuông nứt `playCrackedBellToll`, sói hú `playDistantWolfHowl`, lắng nghe `phase_changed` kích hoạt cảnh báo đêm xuống | **PASS** (4/4) |
| **Tổng Cộng** | **Tất cả các tiêu chí của V15-07** | **23/23 PASS (100%)** |

---

### 9. BƯỚC V15-08: NÂNG CẤP ÁP LỰC BAN ĐÊM CHO QUẠ BÓNG TỐI, BÓNG MẮT VÀ NHÓM HIỆP SĨ TÀ ÁC

#### 9.1. Quạ Bóng Tối (Shadow Crow)
- **Mắt Đỏ Phát Sáng Ban Đêm:** Quạ đậu trên cành hoặc tảng đá trong đêm phát sáng chấm đỏ rực (`0xff2222`, tâm $1.8\text{px}$, quầng hào quang mờ $3.5\text{px}$ `0xff6666`), cảnh báo nguy hiểm tiềm tàng.
- **Tầm Phát Hiện Tăng 35% Ban Đêm:**
  - Bán kính phát hiện cảnh giác: từ $200\text{px}$ tăng lên $270\text{px}$ ($200 \times 1.35$).
  - Bán kính sà xuống tấn công quấy rối (Dive Attack): từ $190\text{px}$ tăng lên $256\text{px}$ ($190 \times 1.35$) khi người chơi tắt đèn.
- **Sóng Âm Báo Động Đi Xa Gấp Rưỡi:**
  - Âm lượng sóng âm báo động tăng từ $2.2$ lên $3.3$ ($2.2 \times 1.5$).
  - Phát sự kiện `shadow_crow_alarm` với bán kính truyền âm ban đêm là $360\text{px}$ (ban ngày là $240\text{px}$).
  - Kích động The Listener lao đến kiểm tra và bầy Sói Xương gần đó chuyển hướng truy lùng mục tiêu.

#### 9.2. Bóng Mắt Sương Mù (Shadow Eyes)
- **Mở Rộng Mật Độ Sinh Cảnh Đêm:**
  - Bổ sung các điểm sinh cảnh tại các ngã rẽ rừng sâu hiểm trở: `crooked_path` ($x=1100, y=260$ và $x=1680, y=290$) và mở rộng `deep_forest` ($x=740, y=280$ và $x=1120, y=310$).
- **Tăng Tốc Độ Rút Bình Tâm 40% Ban Đêm:**
  - Khi người chơi nhìn phải Bóng Mắt trong cự ly $190\text{px}$ mà không thắp đèn lồng, lượng Bình Tâm bị hút mỗi giây tăng từ $8.0$ lên **$11.2\text{ điểm}$** ($8.0 \times 1.40$).
- **Tan Biến Khi Gặp Ánh Sáng:**
  - Khi người chơi rọi thẳng Đèn Lồng [F] vào, Bóng Mắt lập tức phát âm thanh rên rỉ tan biến (`playShadowEyesDissolve`), kích hoạt animation `shadow_eyes_dissolve` và tự hủy sau $500\text{ms}$.

#### 9.3. Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction)
Bao gồm Hiệp Sĩ Sa Ngã (`FallenKnightEntity`), Kỵ Sĩ Kinh Hoàng (`DreadHorsemanEntity`) và Chỉ Huy Hiệp Sĩ Trùm Mũ (`HoodedKnightBoss`):
- **Khói Đen Mờ Tỏa Ra Quanh Kiếm & Giáp:**
  - Ban đêm, thanh kiếm và bộ giáp sắt rỉ sét tỏa ra làn khói đen tím huyền bí (`darkAuraGfx`, bán kính từ $22\text{px}$ đến $38\text{px}$, màu $0x180924$ / $0x2d1240$) và thân thể ám sắc tím tối (`0x9988aa`).
- **Giảm 25% Thời Gian Nghỉ Giữa Các Đòn Đánh:**
  - `FallenKnightEntity`: Cooldown giữa các đòn vung kiếm giảm từ $1800\text{ms}$ xuống **$1350\text{ms}$** ($1800 \times 0.75$). Thời gian vung chém giảm từ $900\text{ms}$ xuống **$675\text{ms}$**. Tầm phát hiện ban đêm tăng từ $130\text{px}$ lên **$180\text{px}$** ($270\text{px}$ nếu người chơi bật đèn).
  - `DreadHorsemanEntity`: Cooldown giữa các đợt phi ngựa phóng giáo giảm từ $2800\text{ms}$ xuống **$2100\text{ms}$** ($2800 \times 0.75$). Tốc độ tuần tra ban đêm tăng từ $42\text{px/s}$ lên **$62\text{px/s}$**.
  - `HoodedKnightBoss`: Cooldown giữa các đòn chém cuồng nộ giảm từ $3200\text{ms}$ xuống **$2400\text{ms}$** ($3200 \times 0.75$). Cooldown sau khi hồi phục choáng giảm từ $2000\text{ms}$ xuống **$1500\text{ms}$**. Tốc độ truy lùng di tích tăng từ $52\text{px/s}$ lên **$65\text{px/s}$**.
- **Quy Tắc Ranh Giới Bất Biến:**
  - Tất cả quái vật tuyệt đối tôn trọng ranh giới Vùng An Toàn làng Bellhollow ($x \le 1620$), Farm Sanctuary và bán kính bảo hộ của Lửa Trại ($180\text{px}$ quanh `ctx.campfirePos`), không bao giờ xâm nhập hoặc truy sát người chơi khi đang trú ẩn an toàn.

---

### 10. BẢNG TỔNG HỢP KIỂM THỬ V15-08 (`verify_v15_08_night_pressure.mjs`)

| Nhóm Kiểm Thử | Nội Dung Kiểm Tra | Kết Quả |
|:---|:---|:---:|
| **ShadowCrowEntity** | Chấm mắt đỏ rực (`0xff2222`), tầm phát hiện & sà mổ tăng $35\%$, âm lượng báo động tăng gấp rưỡi ($3.3$), phát sự kiện `shadow_crow_alarm` | **PASS** (3/3) |
| **ShadowEyesEntity** | Hút Bình Tâm tăng $40\%$ ($8 \to 11.2\text{ pts/s}$), mở rộng sinh cảnh `crooked_path` & `deep_forest`, tan biến khi rọi đèn | **PASS** (3/3) |
| **EvilKnights Faction** | Khói đen mờ và ám tím (`0x9988aa`), giảm $25\%$ cooldown hồi chiêu (Fallen: $1350\text{ms}$, Horseman: $2100\text{ms}$, Boss: $2400\text{ms}$), tăng tốc độ tuần tra/truy đuổi | **PASS** (3/3) |
| **Hệ Thống Sinh Thái** | Lắng nghe `shadow_crow_alarm` kích động bầy Sói Xương, tuyệt đối tôn trọng vùng an toàn làng và bán kính bảo hộ Lửa Trại | **PASS** (2/2) |
| **Tổng Cộng** | **Tất cả các tiêu chí của V15-08** | **11/11 PASS (100%)** |

