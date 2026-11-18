# HOLLOW WOODS V1.5 — THÔNG SỐ CÂN BẰNG SINH TỒN & BÌNH TÂM
## HỆ THỐNG TINH THẦN (BÌNH TÂM), RÚT MÁU LŨY TIẾN & KHU AN TOÀN

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã tài liệu:** `V15-05` / `03_Sanity_Vision_And_NightAI.md`  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (19/19 bài kiểm tra tự động PASS, 0 lỗi TypeScript, bản dựng Vite thành công)  

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
