# BÁO CÁO NGHIỆM THU: HW-QA-30 — PRIVATE QA BUILD WITH F9, RETAIL BUILD STILL SAFE

**Dự án:** HOLLOW WOODS — V1.5.4 Preparation
**Mã nhiệm vụ:** HW-QA-30
**Mức độ ưu tiên:** P2 Build & Security Architecture
**Chế độ:** QA BUILD CONFIG + VALIDATION ONLY; DO NOT PUBLISH
**Trạng thái:** HOÀN THÀNH 100% (VERIFIED & VALIDATED)
**Tác giả:** AG Flash High
**Ngày thực hiện:** 22/11/2026

---

## 1. TỔNG QUAN & NGUYÊN NHÂN GỐC (ROOT CAUSE ANALYSIS)

### 1.1. Hiện trạng cơ chế Developer Mode trong mã nguồn
Trong `src/debug/DevSessionPolicy.ts`, biến cờ kiểm soát QA được xác định bằng:
```ts
const env = (import.meta as ImportMeta & {
  env?: { DEV?: boolean; VITE_HOLLOW_WOODS_QA?: string };
}).env;

export const QA_BUILD = env?.DEV === true || env?.VITE_HOLLOW_WOODS_QA === '1';
```
Trong `src/debug/DeveloperModeManager.ts`:
- `canToggleWithSimpleF9()` trả về trực tiếp giá trị của `QA_BUILD`.
- `GameScene.ts` chỉ khởi tạo `DevPanelOverlay` và `HitboxDebugInspector` khi `canToggleWithSimpleF9()` trả về `true`.

### 1.2. Xác nhận nguyên nhân gốc (Confirmed Root Cause)
- Khi thực thi lệnh build tiêu chuẩn (`npm run build`), công cụ Vite biên dịch mã nguồn với chế độ Production (`import.meta.env.DEV = false`) và biến môi trường `VITE_HOLLOW_WOODS_QA` không được thiết lập (hoặc vắng mặt).
- Do đó, hằng số `QA_BUILD` được nén tĩnh thành giá trị `false`. Toàn bộ nhánh điều kiện khởi tạo Dev Panel và Hitbox Inspector bị vô hiệu hóa hoàn toàn trong gói bundle xuất bản (`dist/`).
- **Kết luận:** Đây **KHÔNG** phải lỗi kết xuất hay trục trặc của nền tảng P2Game, mà là cơ chế bảo vệ có chủ đích (Intentional Architectural Gate) nhằm đảm bảo người chơi trong bản Retail không thể kích hoạt gian lận, can thiệp tọa độ, hay mở Dev Panel.

---

## 2. NGUYÊN TẮC BẢO MẬT & MỤC TIÊU THIẾT KẾ (SECURITY GOALS)

### 2.1. Cảnh báo an ninh về "Owner Secret" phía Client
- **Quy tắc bảo mật bất di bất dịch:** Tuyệt đối **KHÔNG** đặt mật khẩu ngầm, query string bí mật (`?owner=123`), hay phím tắt ẩn trong mã nguồn JavaScript phía client để bật Dev Mode trên bản Retail.
- Mọi chuỗi ký tự hay thuật toán giải mã nằm trong client JavaScript đều có thể bị dịch ngược (reverse-engineer) dễ dàng thông qua Chrome DevTools hoặc DevTools console. Nếu người chơi phát hiện secret key, toàn bộ hệ thống Bảng Xếp Hạng (Leaderboards) và tính toàn vẹn của trò chơi trên nền tảng P2Game sẽ bị phá vỡ.

### 2.2. Chiến lược 2 Biến Thể Riêng Biệt (Dual-Variant Architecture)
Để giải quyết nhu cầu kiểm thử nội bộ của Owner/QA mà không gây rủi ro cho bản phát hành công khai:
1. **Biến thể RETAIL (`dist/`):**
   - Không chứa cờ QA (`VITE_HOLLOW_WOODS_QA` vắng mặt).
   - F9 bị vô hiệu hóa hoàn toàn, không tạo DOM `#dev-panel-overlay`, không khởi tạo inspector.
   - Cho phép người chơi lưu dữ liệu vào các slot chuẩn (`hollow_woods_backup_slot_1`) và gửi điểm sinh tồn hợp lệ lên Bảng Xếp Hạng.
2. **Biến thể PRIVATE QA (`dist-qa/`):**
   - Chỉ được build khi Owner kích hoạt script chuyên dụng với biến môi trường cục bộ `VITE_HOLLOW_WOODS_QA='1'`.
   - Xuất bản ra thư mục cô lập độc lập `dist-qa/`, không ghi đè vào `dist/` hay `release/`.
   - Kích hoạt toàn bộ phím tắt F9, giao diện Dev Panel (HW-DEV-29), Hitbox Inspector, và watermark `HOLLOW WOODS QA · outer_woods`.
   - Tự động kích hoạt cơ chế cách ly Save (`QA_SAVE_KEY: hollow_woods_qa_v1_savegame`) và chặn triệt để mọi hành động gửi điểm BXH (`canReportProgress() === false`).

---

## 3. HIỆN THỰC HÓA CHI TIẾT (IMPLEMENTATION DETAILS)

### 3.1. Script Tự Động Build Cô Lập: `scripts/build_qa_private.ps1`
Tạo script PowerShell chuyên dụng với khả năng cô lập biến môi trường chỉ trong tiến trình hiện tại:
- **Bảo toàn môi trường gốc:** Đọc và lưu giá trị cũ của `VITE_HOLLOW_WOODS_QA` trong phạm vi Process.
- **Kích hoạt an toàn trong khối `try/finally`:** Thiết lập `VITE_HOLLOW_WOODS_QA = '1'`, chạy kiểm tra kiểu `npx tsc --noEmit`, và biên dịch Vite tới thư mục chỉ định `dist-qa/`.
- **Khôi phục tuyệt đối:** Khối `finally` luôn hoàn trả biến môi trường về trạng thái ban đầu, ngăn chặn việc rò rỉ cờ QA sang các lần build Retail tiếp theo trong cùng terminal session.
- **Tích hợp Serve cục bộ:** Hỗ trợ tham số `-Serve` và `-Port <cổng>` để khởi chạy nhanh máy chủ HTTP kiểm thử cho Owner.

### 3.2. Cách Ly Dữ Liệu Lưu Trữ (Save Data Isolation)
- Khi `QA_BUILD` hoạt động:
  - `SaveManager` và `CloudSaveService` chuyển hướng toàn bộ việc đọc/ghi sang khóa riêng `hollow_woods_qa_v1_savegame` và `hollow_woods_qa_settings`.
  - Khóa dữ liệu của người chơi Retail (`hollow_woods_backup_slot_1`, `hollow_woods_v1_savegame`) hoàn toàn không bị đụng chạm, bảo vệ 100% dữ liệu Save Schema 3 của người chơi thực tế.

### 3.3. Chặn Báo Cáo Tiến Trình & Gian Lận Điểm Số (Progress Blocker)
- `DeveloperModeManager.canReportProgress()` trả về `!QA_BUILD && !this.devSession`.
- Trong bản QA Build (`QA_BUILD = true`), phương thức này luôn trả về `false`.
- Toàn bộ các điểm gọi gửi điểm:
  1. `LeaderboardService.submitScore()` -> Trả về `{ accepted: false, reason: 'developer_mode_session' }`.
  2. `GameScene.handleGameOver()` -> Chặn phát tín hiệu `window.p2.gameOver()`.
  3. `EndingSystem.triggerEnding()` -> Chặn phát tín hiệu điểm thưởng kết thúc game.

---

## 4. KHUYẾN NGHỊ KIẾN TRÚC CHO P2GAME HOSTED PRIVATE STAGING

Nếu trong tương lai Owner muốn triển khai bản QA Build lên môi trường Web/Cloud của nền tảng P2Game (thay vì chỉ chạy localhost):
1. **Phân tách Kênh Phát Hành (Release Channel Separation):**
   - Đăng ký 2 Game ID hoặc 2 Channel riêng biệt trên cổng P2Game Developer Portal:
     - `Hollow Woods (Retail / Public)`: Chạy gói bundle từ `dist/`.
     - `Hollow Woods - Internal QA (Private / Staging)`: Chạy gói bundle từ `dist-qa/`, cấu hình quyền truy cập (Access Control) chỉ gán cho tài khoản Owner/Tester.
2. **Xác thực Phía Máy Chủ (Server-Side / SDK Auth):**
   - Không dựa vào logic client. Nếu bắt buộc chung 1 build, phải sử dụng API của P2Game SDK để lấy định danh người dùng đã ký điện tử (`window.p2.user.getAuthToken()`), gửi về backend xác thực vai trò `ROLE_OWNER` hoặc `ROLE_TESTER` trước khi mở khóa F9.

---

## 5. KẾT QUẢ KIỂM THỬ XÁC MINH (TEST RESULTS)

Tập lệnh kiểm thử tự động `tests/hw_qa_30_private_build_validation.py` chạy qua 4 phần xác minh độc lập:

| Phần kiểm thử | Nội dung kiểm chứng | Kết quả |
| :--- | :--- | :---: |
| **PART 1: Static Bundle Analysis** | Bundle Retail (`index-Bp99cIv6.js`) và QA (`index-_3z-YGqu.js`) có mã băm khác biệt; `canToggleWithSimpleF9` nén tĩnh thành hằng số boolean chuẩn. | **PASS** |
| **PART 2: Retail Build Runtime (dist/)** | Chạy `dist/` trên cổng riêng: `canToggleWithSimpleF9() === false`; devPanel không được tạo; nhấn F9 không xuất hiện overlay; `canReportProgress() === true`; không ghi vào `QA_SAVE_KEY`. | **PASS** |
| **PART 3: Private QA Build Runtime (dist-qa/)** | Chạy `dist-qa/` trên cổng riêng: `canToggleWithSimpleF9() === true`; devPanel được tạo; nhấn F9 mở overlay `display: flex`; `canReportProgress() === false`; lưu game ghi đúng vào `QA_SAVE_KEY`. | **PASS** |
| **PART 4: Release & Metadata Protection** | `package.json` và `p2game.json` giữ nguyên phiên bản 1.5.2; không ghi đè release ZIP hay thay đổi cấu hình retail. | **PASS** |

**TỔNG KẾT:** `4 / 4 PHASES PASSED (100% SUCCESS) — Exit Code 0`

---

## 6. THƯ VIỆN CHỨNG CỨ TRỰC QUAN (VISUAL EVIDENCE GALLERY)

Toàn bộ ảnh chụp màn hình kiểm chứng lưu trữ tại `Read/V1.5/Reports/Visuals/HW_QA_30/`:
1. **`01_retail_build_f9_disabled.png`**: Bản Retail Build (`dist/`) tải trên máy chủ HTTP độc lập — Phím F9 bị vô hiệu hóa hoàn toàn, không có giao diện Dev Panel hay Hitbox Debugger, bảo đảm an toàn 100% cho người chơi công khai.
2. **`02_private_qa_build_f9_active.png`**: Bản Private QA Build (`dist-qa/`) — Phím F9 hoạt động mượt mà, mở bảng điều khiển nổi Dev Panel Overlay (HW-DEV-29) và hiển thị watermark giám sát QA `HOLLOW WOODS QA · outer_woods`.

---

## 7. KẾT LUẬN

Nhiệm vụ **HW-QA-30** đã thiết lập thành công giải pháp đóng gói và kiểm thử Private QA Build chuẩn mực, an toàn tuyệt đối cho Hollow Woods V1.5.4:
- Owner có thể tạo bản build QA đầy đủ tính năng F9 bất cứ lúc nào bằng một lệnh PowerShell đơn giản:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/build_qa_private.ps1 -Serve
  ```
- Bản phân phối Retail công khai tiếp tục được bảo vệ nghiêm ngặt, loại bỏ hoàn toàn nguy cơ rò rỉ công cụ debug hay gian lận trên P2Game.
