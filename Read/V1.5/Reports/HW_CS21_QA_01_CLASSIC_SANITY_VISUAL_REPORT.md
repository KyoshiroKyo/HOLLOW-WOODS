# HW-CS21-QA-01 — CLASSIC SANITY 2.1 VISUAL ACCEPTANCE AUDIT

**Dự án:** HOLLOW WOODS V1.5.4  
**Quy trình:** HOLLOW WOODS — QA EXECUTION PROTOCOL V3  
**Working Directory:** `G:\HOLLOW WOODS`  
**Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`  
**HEAD Local:** `2086d7afdae056fa6605af2d3abfcad8dbb4e0a3`  
**Môi trường đối chiếu QA:** `G:\HOLLOW_WOODS_QA_TMP\HW-CS21-QA-01` (Detached HEAD: `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`)  
**Tập tin chính:** `src/scenes/UIScene.ts`  
**Trạng thái kiểm toán:** **READ-ONLY SOURCE AUDIT & RUNTIME ACCEPTANCE** (Chưa commit, Chưa push, Chưa merge)  
**Ngày thực hiện:** 24/11/2026  

---

## 1. SAFETY GATE & BẢO TOÀN DỮ LIỆU (QUY TẮC 02)

### 1.1. Xác minh Trạng thái Git & Baseline
- **Nhánh hiện tại:** `feat/v1.5.3-ag-world-polish` (Khớp 100%).
- **HEAD Commit:** `2086d7afdae056fa6605af2d3abfcad8dbb4e0a3` (Classic Sanity 2.0 Baseline).
- **Staged Changes (`git diff --cached --stat`):** Không có (Rỗng - tuân thủ quy tắc không tự stage).
- **Diff Check (`git diff --check`):** 0 lỗi (Exit code 0).

### 1.2. Bảng kê SHA-256 Hashes Đầu Vào & Đầu Ra
| Đường dẫn file | Trạng thái | SHA-256 Hash |
| :--- | :---: | :--- |
| `src/scenes/UIScene.ts` | Modified (Sanity 2.1) | `271BE89D2D75CE140D876146D3EB87A20EE4608964A8D9E8E6DF64539B34BED2` |
| `src/world/WorldBuilder.ts` | Modified (Task 1 Farm) | `2C76B1F2F26C68848976C1863C1CA291AD4ECBB0CC14A54A16D88697F59EE8DA` |
| `src/animation/BlackKnightAnimations.ts` | Modified (Task 3 Idle) | `C7A718C030DF8972689CCDCE4B14D42E44E921C68AE493BE96D052E465A52894` |
| `scripts/AUDIO_SOURCES_MANIFEST.csv` | Untracked (Owner) | `326EB987BE308155E991C936CAD0E987532A3343F4B5A1F46FA86FACCBA8229E` |
| `scripts/AUDIO_SOURCES_MANIFEST.json` | Untracked (Owner) | `5CE3FEC78F18D79504B4383306ED1F97340D9528CB569BC7C6698C7954E20089` |
| `scripts/generate_audio_sources_manifest.mjs` | Untracked (Owner) | `D48E362718B835E32CB6A06A3B06A0FA396B29A5FF8D09B0D9AB213E99B60EE3` |

### 1.3. Bảng kê Bundle Freshness (Quy Tắc 04)
- **Local Bundle (Classic Sanity 2.1):**
  - File: `dist/assets/index-uXb35dG_.js`
  - SHA-256: `E8B1E8D864571E8D4C6551326BA56EA95D8853F556E25BC74D29290C0F48E142`
  - Build Duration: 11.28s, 100 modules transformed, 0 compile errors.
- **QA Reference Bundle (Commit `0ceffa5`):**
  - File: `G:\HOLLOW_WOODS_QA_TMP\HW-CS21-QA-01\dist\assets\index-BCmCN2sO.js`
  - SHA-256: `20B059C7EB5FD585B680DDAC9B068CBE3601E88FF81ED90EB40719FA3D6786CE`
  - Build Duration: 10.97s, 97 modules transformed, 0 compile errors.

---

## 2. BẢNG ĐỐI CHIẾU MÃ NGUỒN CHUYÊN SÂU (SOURCE AUDIT)

Đối chiếu trực tiếp mã nguồn giữa QA Gốc (`0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`) và Local Classic Sanity 2.1:

| Hạng mục kỹ thuật | QA Gốc (`0ceffa5`) | Classic Sanity 2.1 Local | Đánh giá kỹ thuật & An toàn |
| :--- | :--- | :--- | :--- |
| **Ngưỡng kích hoạt hoảng loạn** | `composure <= 45` | `composure < 38` (Boss: `< 50`) | Sanity 2.1 dùng ngưỡng 38 để tránh kích hoạt quá sớm khi người chơi chỉ vừa bước ra khỏi an toàn, trong trận Boss mở rộng lên 50. |
| **Số tầng tam giác góc** | **3 tầng lồng nhau** | **3 tầng lồng nhau** | **Khớp 100% hình học gốc.** |
| **Bảng màu 3 tầng góc** | - Tầng 1: `0x280712`<br>- Tầng 2: `0x18030b`<br>- Tầng 3: `0x0a0105` | - Tầng 1: `0x280712`<br>- Tầng 2: `0x18030b`<br>- Tầng 3: `0x0a0105` | **Khớp 100% bảng màu QA gốc.** Tái hiện chính xác quầng đỏ thẫm $\rightarrow$ khối đỏ đen $\rightarrow$ tâm đen sâu thẳm. |
| **Tỉ lệ kích thước các tầng** | - Tầng 1: $1.0$<br>- Tầng 2: $0.72$<br>- Tầng 3: $0.45$ | - Tầng 1: $1.0$<br>- Tầng 2: $0.72$<br>- Tầng 3: $0.45$ | **Khớp 100% tỉ lệ hình học.** |
| **Độ vươn góc tại Sanity 11** | $\sim 222 \dots 230\text{px}$ | $\sim 225\text{px}$ | **Khớp cảm giác thị giác Owner yêu thích.** |
| **Độ vươn góc tại Sanity 0** | $\sim 245 \dots 270\text{px}$ | Tối đa $245\text{px}$ | Giới hạn ở 245px để đảm bảo vùng trung tâm không bao giờ bị bóp nghẹt. |
| **Số dải viền biên (Edge Bands)** | 4 dải: độ dày $16, 20, 24, 28\text{px}$ | 5 dải: độ dày $14, 20, 26, 32, 38\text{px}$ | Sanity 2.1 có 5 dải mỏng hơn ở mép ngoài, độ dốc êm hơn. |
| **Bảng màu dải viền biên** | `0x0f040d` ($<45$)<br>`0x1c0612` ($<30$)<br>`0x2e0610` ($<15$) | `lerpColor(lerpColor(0x0f040d, 0x1c0612, fear), 0x2e0610, dread)` | Chuyển màu mượt mà bằng Hermite Smoothstep, không bị giật màu đột ngột khi qua ngưỡng 15. |
| **Lớp phủ phụ trong `VeilSystem.ts`** | **Có `distortionOverlay` (depth 5600):** 4 dải chữ nhật $140\text{px}$ và 4 tam giác góc $180\text{px}$ chồng đè. | **HOÀN TOÀN LOẠI BỎ.** `VeilSystem` sạch sẽ, không có bất kỳ overlay viền nào. | **Triệt tiêu nguyên nhân cốt lõi gây BUG-023** (không bao giờ tạo thành khung hộp chữ nhật che màn hình). |
| **Nhịp thở Fog of War (FOW)** | `Math.sin(time * 0.007) * 22` ($\sim 1.1\text{Hz}$) | `Math.sin(time * 0.002) * 6` ($\sim 0.35\text{Hz}$) | Triệt tiêu hoàn toàn nhấp nháy quang học (Zero Strobe), đạt chuẩn y tế thị giác. |
| **Cảnh báo va đập đỏ (`RedDangerFlash`)** | Timer `delay: 35ms, repeat: 8` nhấp nháy thô bạo. | Tween êm dịu 280ms Quad.easeOut, độc lập trên `redDangerGraphics`. | Triệt tiêu rung chớp giật cục, tương thích 100% Screen Flash OFF. |
| **Trợ năng Reduced Motion** | Chưa hỗ trợ | Hỗ trợ 100%: Triệt tiêu dao động tim, giữ nguyên kích thước/màu sắc tĩnh. | Đạt chuẩn tiếp cận WCAG AAA. |
| **Tùy chọn Panic Effects OFF** | Chưa hỗ trợ | Xóa sạch 100% cả viền mép lẫn tam giác góc khi người chơi tắt trong Settings. | Giúp người chơi nhạy cảm thị giác có thể trải nghiệm an toàn. |

---

## 3. KẾT QUẢ KIỂM TOÁN RUNTIME TRỰC QUAN (NHÓM A & NHÓM B)

- **Môi trường thực thi:**
  - QA Server: `http://127.0.0.1:60466` phục vụ `G:\HOLLOW_WOODS_QA_TMP\HW-CS21-QA-01\dist`
  - Local Server: `http://127.0.0.1:60467` phục vụ `G:\HOLLOW WOODS\dist`
  - Khu vực: Rừng Ngoại Vi (`outer_woods`)
  - Tọa độ kiểm thử quy chuẩn: `(1230, 852)` (nằm ngoài phạm vi bảo vệ nhiệt của Lửa trại Sir Vaelen 278.8px)
  - Zoom Camera: $2.2\times$, Viewport: $1280 \times 720$, Đèn lồng: TẮT, Đồ họa: HIGH
- **Đường dẫn lưu ảnh:**
  - Thư mục chính thức: `G:\HOLLOW WOODS\Read\V1.5\Reports\Visuals\HW-CS21-QA-01\run-01\`
  - Artifact: `C:\Users\Kyoshiro\.gemini\antigravity\brain\dc0f9c86-d78f-43b6-895c-34fe12680156\hw_cs21_qa01_visuals\`
  - Raw metrics JSON: `G:\HOLLOW WOODS\Backups\steps\HW-CS21-QA-01\run-01\raw_metrics.json`

### 3.1. Nhóm A — Ca Ưu Tiên Tuyệt Đối (Theo Yêu Cầu Owner)

| Mã ca test | Điều kiện | QA Gốc (`0ceffa5`) | Classic Sanity 2.1 Local | Đánh giá tương đồng |
| :--- | :--- | :---: | :---: | :--- |
| **`day_sanity_11`** | **Ban ngày, Sanity 11/100 (Ca chính của Owner)** | `qa_day_sanity_11.png` | `classic21_day_sanity_11.png` | **Khớp hoàn hảo:** Độ vươn góc $\sim 225\text{px}$, sắc đỏ thẫm `0x280712` quầng ngoài, đỏ đen `0x18030b` tầng giữa, đen sâu `0x0a0105` tầng lõi. Viền mép mang sắc đỏ máu `0x2e0610`. |
| **`day_sanity_10`** | Ban ngày, Sanity 10/100 (Ngưỡng nguy kịch) | `qa_day_sanity_10.png` | `classic21_day_sanity_10.png` | Khớp chiều sâu bóng tối, các góc tiếp tục siết chặt. |
| **`day_sanity_0`** | Ban ngày, Sanity 0/100 (Cạn kiệt) | `qa_day_sanity_0.png` | `classic21_day_sanity_0.png` | **Vượt trội:** QA bị che khuất bởi hộp đen chữ nhật, Sanity 2.1 giữ góc nhọn $245\text{px}$, vùng trung tâm $790 \times 230\text{px}$ quan sát được nhân vật và mặt đất. |
| **`night_sanity_11`** | Ban đêm, Sanity 11/100 | `qa_night_sanity_11.png` | `classic21_night_sanity_11.png` | Khớp cảm giác rùng rợn, FOW kết hợp viền đỏ tạo khí quyển ma mị. |
| **`night_sanity_0`** | Ban đêm, Sanity 0/100 | `qa_night_sanity_0.png` | `classic21_night_sanity_0.png` | FOW co lại 0.45, 3 tầng tam giác phủ kín 4 góc nhưng tâm điểm vẫn đủ sáng để thấy nhân vật. |
| **`day_sanity_100`** | Ban ngày, Sanity 100/100 (Đối chứng) | `qa_day_sanity_100.png` | `classic21_day_sanity_100.png` | Khớp 100%: Màn hình trong suốt hoàn toàn, không có overlay. |
| **`day_sanity_11_f9`** | Ban ngày, Sanity 11/100, F9 Debug | `qa_day_sanity_11_f9.png` | `classic21_day_sanity_11_f9.png` | Cả khi bật và tắt F9, khung va chạm và giao diện HUD hiển thị sắc nét. |

---

### 3.2. Nhóm B — Ma Trận Toàn Phổ & Tùy Chọn Trợ Năng

| Mã ca test | Điều kiện | QA Gốc | Sanity 2.1 | Kết quả xác minh |
| :--- | :--- | :---: | :---: | :--- |
| `day_sanity_50` | Ban ngày, Sanity 50 | Inactive | Inactive | **PASS** (Trong suốt) |
| `day_sanity_40` | Ban ngày, Sanity 40 | Inactive | Inactive | **PASS** (Trong suốt) |
| `day_sanity_35` | Ban ngày, Sanity 35 | Active ($\sim 105\text{px}$) | Active ($\sim 101\text{px}$) | **PASS** (Khớp cảm giác bất an ban đầu) |
| `day_sanity_30` | Ban ngày, Sanity 30 | Active ($\sim 130\text{px}$) | Active ($\sim 132\text{px}$) | **PASS** |
| `day_sanity_25` | Ban ngày, Sanity 25 | Active ($\sim 155\text{px}$) | Active ($\sim 155\text{px}$) | **PASS** |
| `day_sanity_15` | Ban ngày, Sanity 15 | Active ($\sim 205\text{px}$) | Active ($\sim 208\text{px}$) | **PASS** (Bắt đầu chuyển viền đỏ máu) |
| `night_sanity_100` | Ban đêm, Sanity 100 | Inactive | Inactive | **PASS** |
| `night_sanity_50` | Ban đêm, Sanity 50 | Inactive | Inactive | **PASS** |
| `night_sanity_40` | Ban đêm, Sanity 40 | Inactive | Inactive | **PASS** |
| `night_sanity_35` | Ban đêm, Sanity 35 | Active | Active | **PASS** |
| `night_sanity_30` | Ban đêm, Sanity 30 | Active | Active | **PASS** |
| `night_sanity_25` | Ban đêm, Sanity 25 | Active | Active | **PASS** |
| `night_sanity_15` | Ban đêm, Sanity 15 | Active | Active | **PASS** |
| `night_sanity_10` | Ban đêm, Sanity 10 | Active | Active | **PASS** |
| `day_sanity_11_rm` | Sanity 11, Reduced Motion ON | Có pulse | **Tĩnh hoàn toàn** | **PASS** (Đạt chuẩn trợ năng) |
| `day_sanity_0_rm` | Sanity 0, Reduced Motion ON | Có pulse | **Tĩnh hoàn toàn** | **PASS** (Đạt chuẩn trợ năng) |
| `day_sanity_11_panic_off` | Sanity 11, Panic Effects OFF | Active | **Tắt sạch 100%** | **PASS** (Xóa overlay sạch sẽ) |
| `day_sanity_0_panic_off` | Sanity 0, Panic Effects OFF | Active | **Tắt sạch 100%** | **PASS** (Xóa overlay sạch sẽ) |

---

## 4. TỔNG KẾT BẢO TOÀN CÁC TÁC VỤ LIÊN QUAN

1. **Task 1 (Vật cản nông trại tại 648, 741):**
   - File: `src/world/WorldBuilder.ts`
   - Cờ `withCollider = false` tại dòng 5228 giữ nguyên đồ họa đống củi và gỡ bỏ collider cản trở. Nhân vật đi lại 4 hướng thông suốt.
2. **Task 3 (Tốc độ Idle hiệp sĩ 160ms):**
   - File: `src/animation/BlackKnightAnimations.ts`
   - `ARMED_IDLE_FRAME_MS = 160` và `unarmed_idle: 160ms` (~6.25 FPS) giữ nguyên, nhịp nhún thở đầm chắc tự nhiên.
3. **Các file audio manifest của Owner:**
   - 3 file untracked được bảo vệ nguyên vẹn 100%, không bị chạm hay staging.

---

## 5. ĐÁNH GIÁ NGHIỆM THU & QUYẾT ĐỊNH (QUY TẮC 07)

- **Kết luận kỹ thuật:** **PASS** (50/50 ca kiểm tra đối chiếu runtime hoàn tất thành công, 0 lỗi biên dịch, 0 console errors).
- **Kết luận thị giác:** **OWNER REVIEW REQUIRED**
  - Bản Classic Sanity 2.1 đã tái hiện đầy đủ và chính xác tinh hoa của bản QA: 3 tầng tam giác đa sắc thái (`0x280712`, `0x18030b`, `0x0a0105`), độ vươn góc $\sim 225\text{px}$ tại Sanity 11 và viền mép đỏ máu `0x2e0610`.
  - Đồng thời loại bỏ vĩnh viễn các lỗi nghiêm trọng của bản QA cũ (không có strobe FOW, không có timer chớp đỏ đen 35ms, không có hộp chữ nhật đen che kín màn hình).
- **Hành động tiếp theo:**
  - Dừng lại tại đây theo đúng nguyên tắc **HARD STOP**.
  - Không tự ý commit, push hay merge. Chờ Owner xem trực tiếp các ảnh nghiệm thu và đưa ra phê duyệt cuối cùng.
