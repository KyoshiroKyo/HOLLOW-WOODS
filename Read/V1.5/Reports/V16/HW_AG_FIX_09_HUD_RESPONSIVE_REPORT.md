# HW-AG-FIX-09 — HUD RESPONSIVE POLISH REPORT
**Dự án:** HOLLOW WOODS V1.6.0 — The Unbroken Oath  
**Ngày:** 27/11/2026 (19:20 ICT)  
**Branch:** `feat/v1.6-competition-preview`  

---

## 1. KẾT QUẢ KIỂM TRA BỐ CỤC HUD ĐA ĐỘ PHÂN GIẢI

Kiểm tra thực tế trên Chrome Headless CDP ở 3 độ phân giải (`960×540`, `1280×720`, `1920×1080`) với tỷ lệ gốc `1280×720` (`Phaser.Scale.FIT`):

| Thành phần HUD | Tọa độ logic (`1280×720`) | Trạng thái tại `960×540` / `1280×720` / `1920×1080` |
|---|---|---|
| **Khung Chỉ Số & Danh Xưng** | `x: 12..392`, `y: 10..92` + badges `y: 98..120` | ✅ Gọn, không tràn/cắt |
| **Đồng Hồ Ngày Đêm** | `x: 668..912` (`width: 244`) | ✅ Cách khung nhiệm vụ `8px`, không chồng |
| **Khung Nhiệm Vụ & Zone Badge** | `x: 920..1260` (`width: 340`, `bottom: 112`) | ✅ Căn phải chuẩn, `wordWrap` đầy đủ |
| **Danh xưng dài (`Meliodas Blackwood — The Wolf Lord` / `The Nameless Wayfarer`)** | `playerNameText`: `x: 26..242`, `runningStateText`: `x: 303..377` | ✅ Không chồng (`gap >= 61px`), đã bổ sung `fitPlayerNameText()` |

---

## 2. SỬA LỖI PHÒNG NGỪA THỰC TẾ (`src/scenes/UIScene.ts`)

- Thêm hàm `fitPlayerNameText()` được gọi khi khởi tạo, khi `runningStateText` đổi (`Bình thường` / `Đang chạy` / `Sắp hụt sức` / `Hồi sức`) và khi danh xưng nhân vật thay đổi qua `IdentityRevealResolver`.
- Nếu `playerNameText.width > maxAllowedW` (`377 - statusWidth - 36`), tự động thu `scaleX` vừa khít để **không bao giờ** đè lên nhãn trạng thái chạy ở góc phải khung; các danh xưng vừa khung giữ nguyên `scale = 1`.
- **Không sửa** thiết kế HUD, màu sắc chỉ số, Classic Sanity, chỉ số nhân vật hay hệ thống thời gian.

---

## 3. KIỂM CHỨNG & ẢNH ĐỐI CHIẾU

- `npm run build` (`tsc && vite build`): **PASS** (0 lỗi).
- `npx p2game-validate ./dist --slug hollow-woods`: **292 tệp · 79.5 MB · ✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)**.
- Ảnh kiểm tra Trước / Sau: `hud_before_1280_longname.png`, `hud_before_960x540.png`, `hud_after_1280_longname.png`, `hud_after_960x540.png`, `hud_after_1920x1080.png`.
