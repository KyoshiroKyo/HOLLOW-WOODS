# HW-AG-FIX-11 — JOURNAL SHORTCUT CONSISTENCY REPORT
**Dự án:** HOLLOW WOODS V1.6.1 (Baseline trên `feat/v1.6-competition-preview`)\
**Ngày:** 27/11/2026 (19:34 ICT)\
**Branch:** `feat/v1.6-competition-preview`\

---

## 1. NGUYÊN NHÂN GỐC

- Trong `src/ui/JournalModal.ts` (dòng 392–397) vẫn tồn tại listener cục bộ `addKey('keydown-M', ...)` chuyển tab sang `'map'` khi Sổ Tay đang mở — tàn dư xung đột `H4-NEW-05` với phím `M` (Bật/tắt âm thanh trong `GameScene.handleMutePress()`).
- Trong `JournalModal.ts` không còn nhãn chữ `[M]` sai lệch (tab bản đồ đã dùng `[4. BẢN ĐỒ THẾ GIỚI]` và `keydown-FOUR`).

---

## 2. FILE THAY ĐỔI

- **`src/ui/JournalModal.ts`** (dòng 391–392):
  - Xóa `addKey('keydown-M', ...)` khỏi `JournalModal`, giữ nguyên `addKey('keydown-FOUR', ...)` cho tab `[4. BẢN ĐỒ THẾ GIỚI]`.
  - Không sửa `InputController`, `AudioManager` hay `BlackKnightPlayer`.

---

## 3. KẾT QUẢ KIỂM THỬ (CHROME HEADLESS CDP + VALIDATOR)

Chạy `verify_fix11.mjs` trên bản build `dist/`:
- `[PASS]` Phím **`M`** khi chơi bình thường: bật/tắt Mute (`audioManager.isMuted`), **không** mở Sổ Tay.
- `[PASS]` Phím **`M`** khi Sổ Tay đang mở: **không** chuyển tab sang `'map'` (giữ nguyên tab `'quest'`).
- `[PASS]` Phím **`4`** khi Sổ Tay đang mở: chuyển sang tab `'map'` (Bản Đồ Thế Giới).
- `[PASS]` Phím **`J`**: mở/đóng Sổ Tay bình thường.
- `[PASS]` **0** lỗi console / runtime exception.
- `npm run build`: **PASS** (0 lỗi).
- `npx p2game-validate ./dist --slug hollow-woods`: **292 tệp · 79.5 MB · ✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)**.

---

## 4. GHI NHẬN CHUYỂN `HW-Code` (NGOÀI PHẠM VI `JournalModal`)

- Kiểm tra thực tế cho thấy phím **`N`** (`KeyN` trong `BlackKnightPlayer.ts` / `keyN` trong `GameScene.ts`) hiện chưa nối tới `journalModal.openMapTab()` (chỉ nút `[N] Bản Đồ` trên `UIScene` mở được khi click). Theo giới hạn nhiệm vụ không sửa `GameScene` input / `BlackKnightPlayer`, mục này được ghi nhận để `HW-Code` xử lý nếu muốn bật phím tắt `N` trực tiếp.
