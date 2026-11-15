# 🛡️ BÁO CÁO THIẾT LẬP KIỂM TOÁN ĐỘC LẬP (INDEPENDENT AUDIT SETUP)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Kiểm toán viên:** Independent Senior Game QA Engineer
> **Thời điểm thiết lập:** 2026-11-14
> **Mục tiêu:** Đánh giá chất lượng thực tế của game một cách khách quan, độc lập; tuyệt đối không thiên vị hoặc cố chứng minh các báo cáo PASS trước đây là đúng.
> **Mã hồ sơ kiểm toán:** `AUDIT_2026-11-14`

---

## 1. XÁC NHẬN CẤU TRÚC VÀ THƯ MỤC DỰ ÁN

Hệ thống kiểm toán đã rà soát và xác nhận sự tồn tại thực tế của các thư mục và thành phần cốt lõi:

| Thành phần | Đường dẫn thực tế | Trạng thái xác nhận | Ghi chú kiểm toán |
|---|---|:---:|---|
| **Project Root** | `G:\HOLLOW WOODS V3` | ✅ HỢP LỆ | Thư mục gốc chứa toàn bộ dự án |
| **package.json** | `G:\HOLLOW WOODS V3\package.json` | ✅ HỢP LỆ | Quản lý định danh `hollow-woods-v3@3.0.0` |
| **src/** | `G:\HOLLOW WOODS V3\src` | ✅ HỢP LỆ | Chứa 12 phân hệ mã nguồn TypeScript |
| **public/assets/** | `G:\HOLLOW WOODS V3\public\assets` | ✅ HỢP LỆ | Chứa tài nguyên đồ họa (PNG) và âm thanh |
| **scripts/** | `G:\HOLLOW WOODS V3\scripts` | ✅ HỢP LỆ | Chứa 16 công cụ Node.js và script QA |
| **Read/V3.0/** | `G:\HOLLOW WOODS V3\Read\V3.0` | ✅ HỢP LỆ | Chứa tài liệu thiết kế và báo cáo kỹ thuật |

---

## 2. CÔNG NGHỆ VÀ PHIÊN BẢN ĐANG SỬ DỤNG

Thông tin được trích xuất trực tiếp từ `package.json` và tệp khóa thực tế `package-lock.json`:

- **Game Engine:** `Phaser 4.2.1` (phụ thuộc chính thức: `"phaser": "^4.2.1"`)
- **Ngôn ngữ phát triển:** `TypeScript 5.9.3` (cấu hình devDependencies: `"typescript": "^5.5.0"`)
- **Công cụ đóng gói (Bundler):** `Vite 5.4.21` (cấu hình devDependencies: `"vite": "^5.4.0"`)
- **Công cụ phân tích ảnh nhị phân:** `pngjs 7.0.0`
- **Mô hình hiển thị đồ họa:** Native Canvas HD `1280×720`, World Camera Zoom `2.2×`, UI Camera Zoom `1.0`

---

## 3. DANH SÁCH CÁC BÁO CÁO "PASS" ĐÃ TÌM THẤY TRONG DỰ ÁN

Trong quá trình khảo sát thư mục `Read/V3.0/Reports/`, kiểm toán viên độc lập đã ghi nhận các tài liệu nghiệm thu kỹ thuật đã được tạo trước đây:

1. **`V3.0_PASS_G1_REPORT.md`:** Nghiệm thu kỹ thuật khởi tạo Phaser, tích hợp Satyr và camera.
2. **`V3.0_PASS_G2_REPORT.md`:** Nghiệm thu kỹ thuật 4 chỉ số sinh tồn, hội thoại NPC Edda/Neris, bàn chế tạo và sổ tay.
3. **`V3.0_PASS_G3_REPORT.md`:** Nghiệm thu kỹ thuật Màn Sương The Veil, AI quái vật The Listener và 2 câu đố môi trường.
4. **`V3.0_PASS_G4_REPORT.md`:** Nghiệm thu kỹ thuật phân đoạn mở đầu Act 0, cuộc rượt đuổi Act 5 và kết thúc Act 6.
5. **`V3.0_PASS_G5_RELEASE_REPORT.md`:** Báo cáo phát hành PASS G5 xác nhận 10/10 tiêu chí đạt PASS qua script `verify_v3_release.mjs`.
6. **`V3.0_10H_OVERHAUL_REPORT.md`:** Báo cáo tổng kết đại tu 10 giờ (Cycle 1 & Cycle 2: T01 – T19) xác nhận chuyển đổi Pixel Art thật và chuẩn HD 1280×720.
7. **`V3.0_GIT_PUSH_SUCCESS.md`:** Báo cáo xác nhận đồng bộ mã nguồn và tài nguyên lên GitHub repository KyoshiroKyo/HOLLOW-WOODS.
8. **`FULL_DIAGNOSTIC_REPORT.md` (tại thư mục gốc):** Báo cáo chẩn đoán sự cố kỹ thuật vừa được lập bởi Principal QA.

---

## 4. NHỮNG VẤN ĐỀ CHỦ DỰ ÁN ĐÃ PHẢN ÁNH THỰC TẾ

Dù các báo cáo kiểm tra tự động trước đây ghi nhận 10/10 PASS (dựa trên sự tồn tại của chuỗi ký tự và compile thành công), Chủ dự án đã chỉ ra hàng loạt vấn đề nghiêm trọng ảnh hưởng trực tiếp đến trải nghiệm chơi game thực tế (gameplay reality):

1. **Nhân vật chính di chuyển bị khựng hoặc lệch frame:**
   - Hoạt ảnh bước đi/chạy của Dark Rogue (`SatyrPlayer.ts`) không mượt, có hiện tượng nhảy sang tư thế hành động khác khi đổi hướng hoặc đi chéo.
2. **Không thể tương tác với NPC & biến mất Hộp thoại:**
   - Người chơi đứng cạnh NPC nhấn phím `[E]` không thấy xuất hiện hộp thoại đối thoại.
   - Nhân vật bị khóa cứng điều khiển (soft-lock), không di chuyển được tiếp.
   - Nghi vấn kỹ thuật: Hộp thoại bị tạo sai trong `GameScene` (bị Camera Zoom 2.2× đẩy văng xuống ngoài đáy màn hình tại tọa độ Y = 866 px).
3. **Mặt đất bị lỗi ô vuông lặp lại có bóng đen & mất cảm giác khu rừng:**
   - Mặt đất bị lát bởi một mạng lưới ô vuông 32×32 px lốm đốm bóng đen và lỗ thủng kỳ dị thay vì nền cỏ xanh liền mạch.
   - Cây cối phân bố thưa thớt (bước nhảy 180 px), để lộ các mảng đất lỗi.
4. **Hiệu năng bị khựng giật (Micro-stuttering) định kỳ:**
   - Di chuyển trong game bị sụt giảm khung hình đột ngột do áp lực thu gom rác bộ nhớ (Garbage Collection) và tái phân bổ thẻ Canvas ngầm liên tục mỗi frame.

---

## 5. NHỮNG NGUYÊN TẮC VÀ GIỚI HẠN KHI THỰC HIỆN KIỂM TOÁN

### A. Nguyên tắc kiểm toán độc lập:
- Đánh giá dựa trên bằng chứng kỹ thuật khách quan (mã nguồn, cấu trúc dữ liệu, IHDR header file nhị phân, toán học tọa độ Phaser).
- Không mặc định các báo cáo cũ là đúng; mọi lỗi kỹ thuật dù nhỏ nhất đều phải được ghi nhận trung thực.

### B. Giới hạn kiểm toán trong phiên làm việc:
- **Không chạy `npm run dev`** hoặc tương tác qua trình duyệt đồ họa thật do chạy trên môi trường terminal headless; kiểm toán viên sử dụng phương pháp phân tích tĩnh nâng cao (advanced static code audit), kiểm tra binary IHDR của assets, và mô phỏng toán học ma trận Camera Phaser 3/4.
- **Tuân thủ tuyệt đối 7 quy tắc ràng buộc:**
  1. Chỉ đọc, kiểm tra và ghi báo cáo.
  2. KHÔNG sửa code, asset hoặc cấu hình.
  3. KHÔNG xóa, di chuyển hoặc ghi đè file hiện có.
  4. KHÔNG commit hoặc push Git.
  5. KHÔNG cài hoặc nâng cấp dependency.
  6. Không chạy nhiều tác vụ audit song song.
  7. Không kết luận thành công nếu chưa có bằng chứng xác đáng.

---
*Tài liệu được khởi tạo và xác nhận bởi Independent Senior Game QA Engineer — 2026-11-14.*
