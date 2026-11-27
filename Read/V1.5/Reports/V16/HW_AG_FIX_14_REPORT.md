# HW-AG-FIX-14 — SLOW NETWORK REGRESSION REPORT
**Dự án:** HOLLOW WOODS V1.6.1 (`feat/v1.6-competition-preview`)\
**Tham chiếu:** `BUG-024 / B08`\
**Ngày:** 27/11/2026 (19:53 ICT)\
**Chế độ:** Chỉ kiểm thử & báo cáo (Không sửa `PreloadScene`, `startup-status.js`, `P2Game SDK` hay bản build dự thi)\

---

## 1. PHƯƠNG PHÁP & PHÂN BIỆT MÔI TRƯỜNG

- **Môi trường kiểm thử:** Chrome Headless CDP trên bản build `dist/` phục vụ qua local HTTP server hỗ trợ `Accept-Ranges: bytes` / `206 Partial Content`, sử dụng `Network.emulateNetworkConditions` để giả lập mạng chậm.
- **Phân biệt với Hosted P2Game thực tế:** Kiểm thử này dùng **mạng giả lập local (`127.0.0.1`)** và **không có CDN/iframe thật của P2Game Portal** (không có `window.p2` cloud CDN), nên phản ánh hành vi của `startup-status.js`, `PreloadScene` và watchdog dưới băng thông hạn chế nhưng không thay thế kiểm thử tải trực tiếp từ CDN P2Game.

---

## 2. KẾT QUẢ CÁC TÌNH HUỐNG KIỂM THỬ

### Tình huống 1 — Giả lập mạng chậm (`~800 KB/s`, latency `80 ms`)
- **Thời gian vào `MainMenuScene`:** **`58,680 ms` (~58.7 giây)** — vượt qua mốc watchdog ban đầu (`45,000 ms`) nhưng `PreloadScene` phát sự kiện `hollow-woods:startup-progress` liên tục giúp re-arm watchdog đúng thiết kế.
- **Yêu cầu tải lại sai thời điểm (`state === 'error'`):** **Không xuất hiện (`false`)**.
- **Audio HTTP Responses trong Preload:** `72` phản hồi (`72` HTTP `200`, `0` HTTP `206` ở pha Preload do Phaser XHR preload toàn bộ buffer; streaming `HTMLAudioElement` dùng `Range 206` khi phát BGM trong `GameScene`).
- **Request errors:** `0` | **Console errors:** `0`.
- **Ảnh bằng chứng:**
  - Đang tải dưới mạng chậm: `Read/V1.5/Reports/Evidence/HW-AG-FIX-14/loading_slow_progress.png`
  - Vào `MainMenuScene` thành công: `Read/V1.5/Reports/Evidence/HW-AG-FIX-14/loading_slow_mainmenu.png`

### Tình huống 2 — Lỗi tải thực sự (HTTP `500` trên `assets/index-*.js`)
- **Trạng thái `#game-startup`:** Chuyển ngay sang `state="error"`, hiển thị `"Không tải được mã trò chơi. Hãy tải lại trang."` kèm nút **`Tải lại`**.
- **Request errors:** `2` (do HTTP 500 giả lập) | **Console errors:** `1` (do `startup-status.js` log lỗi khởi động).
- **Ảnh bằng chứng:** `Read/V1.5/Reports/Evidence/HW-AG-FIX-14/loading_real_error.png`

---

## 3. KẾT LUẬN & TÀI NGUYÊN

- **Kết luận `BUG-024 / B08`:** **PASS** trên môi trường mạng chậm giả lập — hệ thống phân biệt chính xác giữa **tải chậm có tiến độ** (không hiện nút tải lại sai thời điểm kể cả khi vượt 45s) và **lỗi tải thực sự** (hiện nút `Tải lại`).
- **JSON số liệu:** `Read/V1.5/Reports/Evidence/HW-AG-FIX-14/slow_network_metrics.json`.
- **Dọn tiến trình:** Đã đóng toàn bộ Chrome Headless và local test server sau kiểm thử.
