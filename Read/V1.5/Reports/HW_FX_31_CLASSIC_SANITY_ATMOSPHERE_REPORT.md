# BÁO CÁO NGHIỆM THU: HW-FX-31 — KHÔI PHỤC HIỆU ỨNG KINH DỊ TÂM LÝ & TÙY CHỌN TIẾP CẬN

- **Dự án:** HOLLOW WOODS — PREP V1.5.4
- **Mã nhiệm vụ:** `HW-FX-31`
- **Mức độ ưu tiên:** HIGH — Cảm Giác Không Khí Kinh Dị Cổ Điển & Trợ Năng Người Chơi
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Tình trạng:** **HOÀN THÀNH TOÀN DIỆN 100% (4 BỘ TEST SUITE PASS — 0 LỖI CONSOLE)**
- **Ngày hoàn thành:** 22/11/2026
- **Tác giả:** AG Gemini Flash High

---

## 1. NGUYÊN NHÂN GỐC & ĐỐI CHIẾU THỰC TRẠNG (ROOT CAUSE ANALYSIS)

### 1.1. Vì sao cảm giác kinh dị cổ điển bị suy giảm?
Trong phiên bản trước (commit `558f155`), để giải quyết triệt để lỗi chớp nháy màn hình tần số cao BUG-023:
1. `compFlicker` tần số cao tại `GameScene.ts` bị loại bỏ nhằm bảo vệ an toàn quang học cho mắt người chơi.
2. Lớp phủ `distortionOverlay` vẽ mép màn hình trùng lặp trong `VeilSystem.ts` bị tắt hoàn toàn để tránh hiện tượng giao thoa sóng với `UIScene`.
3. Trong `UIScene.ts`, lớp `panicVignetteGraphics` được vẽ bằng màu đỏ đen/huyết dụ thẫm (`0x20050e`, `0x120208`, `0x080104`) và chỉ sử dụng các khối tam giác góc sắc nhọn đơn giản.
4. Hệ quả là màu sắc **sương tím ám ảnh cổ điển** (`0x24143f`, `0x271039`) và mép **xanh tím than** (`0x100b1c`) – vốn là linh hồn tạo nên cảm giác u uất, rợn gáy đặc trưng của khu rừng Hollow Woods – đã vô tình bị phai mờ, khiến hình ảnh trông giống như cảnh báo nhận sát thương hơn là nỗi kinh hoàng tâm lý từ từ bóp nghẹt tâm trí Wayfarer.

### 1.2. Phân biệt rõ rệt giữa hiệu ứng bị xóa và hiệu ứng khôi phục
- **Hiệu ứng bị xóa vĩnh viễn (TUYỆT ĐỐI KHÔNG KHÔI PHỤC):**
  * `compFlicker` tần số cao gây chao đảo co giật quầng sáng FOW mỗi 16ms/29ms.
  * Lệnh gọi `camera.flash()` chu kỳ cao gây chớp lóa toàn màn hình.
  * Hai lớp vignette vẽ trùng lặp giữa `VeilSystem` và `UIScene`.
- **Hiệu ứng kinh dị thẩm mỹ được khôi phục chuẩn hóa (HW-FX-31):**
  * Sương tím u tối ở bốn góc màn hình với chuyển sắc bo mềm hữu cơ (Organic Curved Mist Fans).
  * Vệt đỏ thẫm huyết dụ (`0x581b2c`) cách điệu ố nhẹ ở 4 mép màn hình khi Tinh Thần rơi vào mức Nguy Kịch (< 15%).
  * Ngưỡng kích hoạt hoảng sợ mới: Bắt đầu từ Tinh Thần < 40% (UNEASE).
  * Công tắc điều khiển độc lập trong Cài đặt (Hiệu ứng Hoảng Sợ & Dao động Ánh sáng).

---

## 2. KIẾN TRÚC HIỆU ỨNG HOẢNG SỢ MỚI (4 PHÂN CẤP TINH THẦN)

Ngưỡng kích hoạt hoảng sợ thẩm mỹ được thiết lập chính xác tại **Tinh Thần < 40%**:

| Phân cấp trạng thái | Ngưỡng Tinh Thần | Đặc điểm trực quan | Âm thanh & Quầng sáng | Ghi chú an toàn |
| :--- | :---: | :--- | :--- | :--- |
| **A. NORMAL** | `40 .. 100` | Không viền hoảng sợ, không sương tím, không vệt đỏ. Màn hình trong trẻo. | Nhịp tim tắt; Quầng sáng FOW giữ kích thước chuẩn theo môi trường. | Khi hồi phục từ mức thấp về $\ge 40$, kích hoạt tween fade-out 280ms êm dịu. |
| **B. UNEASE (Bất An)** | `25 .. 39` | Bốn góc màn hình xuất hiện các lớp sương tím tối (`0x24143f`) rất nhẹ. Mép xanh tím than (`0x100b1c`) mờ ảo. | Nhịp tim Web Audio 95..115 BPM trầm đục. Quầng sáng FOW dao động êm dịu nếu bật Light Motion. | Chưa có vệt đỏ; tâm màn hình thoáng 100%. |
| **C. PANIC (Hoảng Sợ)** | `15 .. 24` | Sương tím rõ rệt hơn (`0x271039`), mép tối ép vào vừa phải, tâm màn hình hoàn toàn rõ ràng. | Nhịp tim dồn dập 115..125 BPM; Tầm nhìn thu hẹp tự nhiên theo FOW. | Nhịp thở sương 0.35 Hz êm ái khi bật Light Motion. |
| **D. CRITICAL (Nguy Kịch)** | `0 .. 14` | Bốn góc tím sẫm sâu; xuất hiện các vệt đỏ thẫm huyết dụ (`0x581b2c`) cách điệu ở mép ngoài. | Nhịp tim dồn dập $\ge 130$ BPM; Quầng sáng FOW thu hẹp tối đa còn 0.45x. | Cường độ được giới hạn an toàn; tâm màn hình thoáng, không che HUD, nhân vật hay chiến đấu. |

---

## 3. THIẾT KẾ ĐỒ HỌA SƯƠNG GÓC BO MỀM & VỆT ĐỎ THẪM

### 3.1. Bảng màu cổ điển được tái hiện chuẩn xác
- **Sương tím tối:** `#24143f` (Lớp sương huyền bí lan tỏa ngoài cùng).
- **Sương tím ấm trung gian:** `#271039` (Lớp chuyển sắc hữu cơ ở giữa).
- **Mép xanh tím than:** `#100b1c` (Viền bao bọc mép màn hình).
- **Điểm nhấn đỏ thẫm huyết dụ:** `#581b2c` (Chỉ xuất hiện tại mép khi hoảng sợ nguy kịch < 15%).

### 3.2. Cấu trúc quạt sương góc bo mềm (Organic Corner Mist Fan)
Thay vì sử dụng các tam giác vuông sắc cạnh đơn điệu, phương thức `drawCornerMist` chia góc thành 3 tam giác ghép liên hoàn tạo đường cong mềm mại theo tỷ lệ vàng:
- Điểm neo tại góc màn hình `(cx, cy)`.
- Các điểm trung gian lượn sóng tại bán kính $0.85R$ và $0.45R$.
- Tạo cảm giác sương khói mờ ảo tự nhiên như đang bò dần vào từ 4 góc rừng già.
- **Hiệu năng:** Tái sử dụng đối tượng `Phaser.Graphics` hiện có (`panicVignetteGraphics`, depth 900), **không cấp phát bất kỳ Texture, Canvas hay RenderTexture mới** nào trong update loop.

### 3.3. Quản lý vệt đỏ hoảng loạn độc lập với redDangerGraphics
- Vệt đỏ panic được vẽ trực tiếp bên trong `panicVignetteGraphics` dưới dạng các dải ố cách điệu ở 4 mép màn hình ($x \in [280, 440]$, $[840, 1020]$, $y \in [200, 350]$, $[410, 560]$).
- Lớp `redDangerGraphics` (depth 901) được bảo toàn nguyên vẹn 100% cho chức năng cảnh báo mất máu/nhận sát thương, triệt tiêu hoàn toàn xung đột hiển thị.

---

## 4. HỆ THỐNG CÀI ĐẶT TRỢ NĂNG (ACCESSIBILITY SETTINGS)

Đã bổ sung 2 công tắc điều khiển và 1 bộ chọn cường độ vào hệ thống:

### 4.1. Công tắc A — HIỆU ỨNG HOẢNG SỢ (Panic Visuals)
- **Tên hiển thị:** `👁️ Hiệu Ứng Hoảng Sợ (Panic Visuals)`
- **Mặc định:** `ON` (BẬT).
- **Hành vi khi ON:** Hiển thị đầy đủ sương tím, mép tối và vệt đỏ panic theo các mức Tinh Thần.
- **Hành vi khi OFF:** Vô hiệu hóa ngay lập tức toàn bộ các lớp sương và viền hoảng sợ trang trí. Chỉ số Tinh Thần, âm thanh nhịp tim, hành vi AI quái vật và bán kính FOW thiết yếu của gameplay vẫn hoạt động bình thường, không tạo lợi thế bất công.

### 4.2. Công tắc B — DAO ĐỘNG ÁNH SÁNG (Light Motion)
- **Tên hiển thị:** `✨ Dao Động Ánh Sáng (Light Motion)`
- **Mặc định:** `OFF` (TẮT) cho người chơi mới nhằm chống mỏi mắt và co giật tiền đình.
- **Hành vi khi ON:** Cho phép nhịp thở ánh sáng 0.25 Hz của FOW và hiệu ứng hổ phách của đèn lồng dao động êm ái.
- **Hành vi khi OFF:** Quầng sáng FOW và đèn lồng hiển thị tĩnh hoàn toàn. Viền sương panic hiển thị tĩnh không nhấp nháy.
- **Quy tắc ưu tiên tối thượng của REDUCED MOTION:** Khi người chơi bật Chế độ Giảm chuyển động (`Reduced Motion = ON`), hệ thống tự động cưỡng chế triệt tiêu 100% dao động quang học kể cả khi Công tắc B đang bật.

### 4.3. Bộ chọn Cường Độ Hoảng Sợ (Panic Intensity)
- **Tùy chọn:** `🌱 NHẸ (0.65x)` / `⚖️ CHUẨN (1.0x)` / `🔥 RÕ (1.35x)`
- **Mặc định:** `⚖️ CHUẨN`.
- Chỉ điều chỉnh độ dày và độ mờ của lớp sương trang trí, hoàn toàn không can thiệp cơ chế gameplay.

### 4.4. Tái cấu trúc Giao Diện Cài Đặt dạng 2 Tab (Dual-Tab Settings UX)
Cả hai giao diện **MainMenuScene** và **PauseModal** đều được nâng cấp hệ thống Tab chuyên nghiệp:
- **Tab 1: `🔊 ÂM LƯỢNG & LƯU TRỮ`:** Chứa thanh trượt Nhạc Nền (BGM), Hiệu Ứng (SFX), Âm Lượng Tổng (Master), Nút Bật/Tắt Tiếng (Mute), và Nút Xóa Bản Lưu An Toàn (2-Step Safe Clear).
- **Tab 2: `👁️ HÌNH ẢNH & TIẾP CẬN`:** Chứa Mức Đồ Họa (Graphics Quality), Rung Màn Hình (Screen Shake), Hiệu Ứng Hoảng Sợ (Panic Visuals), Dao Động Ánh Sáng (Light Motion), và Cường Độ Hoảng Sợ (Panic Intensity).
- **Ưu điểm vượt trội:** Loại bỏ hoàn toàn tình trạng nhồi nhét, tràn khung hay che nút; mang lại trải nghiệm tinh tế, gọn gàng cho người chơi.

---

## 5. THƯ VIỆN ẢNH CHỨNG CỨ TRỰC QUAN (VISUAL EVIDENCE GALLERY)

Toàn bộ ảnh nghiệm thu chụp tại cùng tọa độ `outer_woods` (1200, 600), cùng góc camera và thiết lập đồ họa HIGH, F9 debug OFF, không có hitbox đỏ/vàng:

1. **`01_normal_100.png`**: Tinh Thần 100 — Trạng thái NORMAL, màn hình trong trẻo, không có sương tím hay viền tối.
2. **`02_unease_35.png`**: Tinh Thần 35 — Trạng thái UNEASE, sương tím nhẹ lượn ở bốn góc, mép tối nhẹ, quầng sáng bắt đầu co hẹp.
3. **`03_panic_20.png`**: Tinh Thần 20 — Trạng thái PANIC, sương tím rõ nét ở bốn góc, áp lực thị giác tăng cao, tâm màn hình vẫn thoáng.
4. **`04_critical_10.png`**: Tinh Thần 10 — Trạng thái CRITICAL, sương tím sẫm sâu kết hợp vệt đỏ thẫm huyết dụ (`0x581b2c`) ở các mép ngoài.
5. **`05_critical_10_reduced_motion.png`**: Tinh Thần 10 khi bật Reduced Motion — Sương tím và viền hiển thị tĩnh tuyệt đối, quầng sáng tĩnh, không rung lắc.
6. **`06_critical_10_panic_visuals_off.png`**: Tinh Thần 10 khi tắt Panic Visuals — Toàn bộ viền sương và vệt đỏ trang trí biến mất, tầm nhìn gameplay giữ nguyên.

---

## 6. MA TRẬN KHÔNG GIAN, THỜI GIAN & AN TOÀN (DAY / NIGHT & SAFE ZONES)

| Khu vực | Tinh Thần | Trạng thái hiển thị | Nhịp tim Audio | Cơ chế an toàn |
| :--- | :---: | :---: | :---: | :--- |
| **Outer Woods (Ban Ngày)** | `20%` | **Sương tím PANIC kích hoạt** | **124 BPM dồn dập** | Ban ngày ngoài tự nhiên KHÔNG phải Safe Zone. |
| **Outer Woods (Ban Đêm)** | `20%` | **Sương tím PANIC kích hoạt** | **124 BPM dồn dập** | Ban đêm ngoài tự nhiên hiển thị đầy đủ hiệu ứng hoảng sợ. |
| **Làng Bellhollow** | `10%` | **TẮT HOÀN TOÀN** | **TẮT** | Làng an toàn tuyệt đối 24/7. |
| **Sanctuary Farm** | `10%` | **TẮT HOÀN TOÀN** | **TẮT** | Nông trang có kết giới bảo vệ tâm trí. |
| **Lửa trại Sir Vaelen (1470, 710)**| `10%` | **TẮT HOÀN TOÀN** | **TẮT** | Hơi ấm lửa trại xua tan nỗi sợ. |

---

## 7. KẾT QUẢ KIỂM THỬ XÁC MINH & HỒI QUY (VALIDATION & REGRESSION)

Toàn bộ 4 kịch bản kiểm thử độc lập đã chạy và đạt kết quả tuyệt đối:

| Kịch bản kiểm thử | Mô tả nội dung kiểm tra | Số ca test | Kết quả | Console Errors |
| :--- | :--- | :---: | :---: | :---: |
| **`scripts/test_hw_fx31_sanity_atmosphere.py`** | Kiểm thử 25 ca toàn diện: 4 mức Sanity, Ngày/Đêm, Safe Zones, Toggles, Persistence, Modals, FOW Performance | **25 / 25** | **PASS 100%** | **0** |
| **`scripts/test_bug023_sanity_flash.py after`** | Kiểm tra hồi quy triệt tiêu chớp nháy quang học, zero strobe | **15 / 15** | **PASS 100%** | **0** |
| **`scripts/test_hw_fix23a_reduced_motion.py`** | Kiểm tra hồi quy an toàn quang học đèn lồng & Reduced Motion | **12 / 12** | **PASS 100%** | **0** |
| **`scripts/test_hw_qa23b_fow_camera.py`** | Kiểm tra hồi quy telemetry FOW hai chu kỳ >=9s, FPS, Camera audit | **4 Suites (18 tests)** | **PASS 100%** | **0** |
| **`npx tsc --noEmit`** | Kiểm toán toàn vẹn kiểu dữ liệu tĩnh TypeScript | Toàn bộ dự án | **PASS (0 lỗi)** | **0** |
| **`npm run build`** | Biên dịch và đóng gói gói sản phẩm phân phối Vite production | Toàn bộ bundle | **PASS (0 lỗi)** | **0** |

### Đo lường hiệu năng FOW & GPU/CPU:
- Thời gian thực thi `updateFogOfWar()` trung bình: **$0.10\text{ ms}$** (thỏa mãn tiêu chuẩn $< 4.0\text{ ms}$).
- Số lần vẽ lại FOW khi đứng yên trong 500ms: **$5\text{ lần}$** (thỏa mãn tiêu chuẩn $\le 20\text{ lần}$).
- GPU/CPU: Không tạo rò rỉ bộ nhớ, không tạo đối tượng mới mỗi frame.

---

## 8. KẾT LUẬN

Nhiệm vụ **HW-FX-31** đã khôi phục thành công 100% không khí kinh dị tâm lý cổ điển của HOLLOW WOODS:
- Sương tím u tối và vệt đỏ huyết dụ được hồi sinh đầy tính nghệ thuật.
- Người chơi có toàn quyền kiểm soát trải nghiệm thông qua các công tắc trợ năng mới trong Cài đặt.
- Các tiêu chuẩn an toàn quang học và thành quả chống chớp màn hình của BUG-023 được bảo toàn nghiêm ngặt.
- Mã nguồn và cấu hình sẵn sàng cho bước kiểm toán phát hành V1.5.4.
