# HW-AG-FIX-15 — PHYSICAL EVKEY QA PREPARATION REPORT
**Dự án:** HOLLOW WOODS V1.6.1 (`feat/v1.6-competition-preview`, baseline commit `8b627d5`)  
**Tham chiếu:** `B03 / HOTFIX-B2` (`HW_V16_B03_MOVEMENT_IME_REPORT.md`)  
**Ngày:** 27/11/2026 (19:56 ICT)  

---

## 1. TRẠNG THÁI NGHIỆM THU HIỆN TẠI

- **Kiểm thử tự động (Chromium IME giả lập — `HW_V16_B03_MOVEMENT_IME_REPORT.md`):** Đã đạt `18/18` kiểm thử tự động trên `BlackKnightPlayer`.
- **Kiểm thử bàn phím vật lý với EVKey / UniKey thật trên Windows:** **`NOT RUN — CHỜ OWNER NGHIỆM THU THỰC TẾ`**.
- **Lưu ý phạm vi:** Không cài đặt/thay đổi EVKey, UniKey hay cấu hình Windows; không chỉnh sửa `BlackKnightPlayer.ts` hay Movement Controller.

---

## 2. HƯỚNG DẪN KHỞI ĐỘNG BẢN QA CHO OWNER

Owner có thể dùng một trong hai cách (không chạm vào bản P2Game ZIP):
1. **Cách 1 (Khuyên dùng — 1 click):** Mở `G:\HOLLOW_WOODS_C02\release\HOLLOW_WOODS_V1.5_STANDALONE\` (bản V1.6.0 `35317c0`) và nhấp đúp **`CHƠI_GAME.bat`** → tự mở `http://localhost:8080/`.
2. **Cách 2 (Bản `dist/` mới nhất `8b627d5`):** Chạy `npm run preview -- --port 4173` tại `G:\HOLLOW_WOODS_C02` và mở `http://localhost:4173/`.

---

## 3. CHECKLIST KIỂM THỬ EVKEY / UNIKEY & BÀN PHÍM TIẾNG ANH

Thực hiện lần lượt ở **2 chế độ**: **(A) Bàn phím Tiếng Anh (ENG)** và **(B) EVKey / UniKey Tiếng Việt (Telex & VNI, bật dấu tiếng Việt)**:

| STT | Kịch bản kiểm thử | Kết quả kỳ vọng | ENG | EVKey Telex | EVKey VNI |
|---:|---|---|---:|---:|---:|
| 1 | Nhấn giữ riêng lẻ `W`, `A`, `S`, `D` (2–3 giây/hướng) | Nhân vật di chuyển mượt, không giật, không dừng giữa chừng | [ ] | [ ] | [ ] |
| 2 | Di chuyển chéo (`W+D`, `W+A`, `S+D`, `S+A`) rồi nhả 1 phím | Chuyển hướng mượt, không kẹt hướng cũ | [ ] | [ ] | [ ] |
| 3 | Nhả toàn bộ phím đột ngột sau khi chạy nhanh | Nhân vật dừng ngay lập tức, **không bị trôi / dính phím (anti-stuck)** | [ ] | [ ] | [ ] |
| 4 | Giữ `Shift` + `WASD` (chạy nước rút) rồi nhả `Shift` trước / sau `WASD` | Vào/thoát trạng thái chạy mượt, không kẹt `Shift` | [ ] | [ ] | [ ] |
| 5 | Đang giữ `W` hoặc `D` → bấm **`Alt + Tab`** sang cửa sổ khác → quay lại click vào game | Nhân vật dừng khi mất focus; quay lại click canvas bấm `WASD` chạy bình thường, không kẹt phím | [ ] | [ ] | [ ] |
| 6 | Phím chức năng: `E` (tương tác), `F` (Vòng Sáng), `Space` (đánh), `J` (Sổ Tay), `I / C` (Chế Tạo), `M` (Mute) | Kích hoạt đúng 1 lần mỗi lần bấm, không lặp đôi hay mất phím do bộ gõ dấu | [ ] | [ ] | [ ] |
| 7 | Nhập văn bản tiếng Việt trong ô tìm kiếm (ví dụ DevPanel `[F9]` → ô tìm kiếm vật phẩm, nếu test QA) | Gõ được dấu tiếng Việt bình thường trong `<input>` mà **không** làm nhân vật di chuyển ngầm phía sau | [ ] | [ ] | [ ] |

---

## 4. MẪU GHI NHẬN LỖI (NẾU PHÁT HIỆN KHI OWNER TEST)

Nếu một mục bị **FAIL**, Owner vui lòng ghi nhanh 4 dòng để `HW-Code` xử lý chính xác:
- **Bộ gõ & Phiên bản:** (VD: `EVKey 5.x Telex`, bật/tắt `Sửa lỗi gợi ý / SendKeys`)
- **Trình duyệt & Build:** (VD: `Chrome`, `STANDALONE` hoặc `localhost:4173`)
- **Mục STT bị lỗi + Thao tác tái hiện:** (VD: `STT 3 — giữ W+A rồi nhả nhanh bị trôi sang trái`)
- **Tần suất:** (`Luôn bị` / `Thỉnh thoảng`)
