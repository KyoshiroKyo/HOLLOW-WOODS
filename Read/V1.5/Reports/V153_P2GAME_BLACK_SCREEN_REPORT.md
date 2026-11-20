# V153-BATCH-03-R2 — Màn hình đen khi khởi động

**20/11/2026 · nhánh `work` · PRODUCTION LOCAL PASS · HOSTED BLOCKED**

Build production thử nghiệm dùng Vite 5.4.21, package và hai manifest vẫn ghi 1.5.2. Lệnh `npx tsc --noEmit` và `node_modules/.bin/vite build --outDir /workspace/work/v153-batch-03-r2/site-before` dùng output riêng. Chưa có ZIP đang chạy công khai, URL preview được cấp quyền, log Console/Network hay thông tin trình duyệt của lần báo lỗi. Vì vậy kết quả ghi dưới đây áp dụng cho build cục bộ.

| Ca trước sửa | Kết quả đã tái hiện |
|---|---|
| SDK tải chậm 5 giây | Sau 2 giây, tài liệu vẫn `loading`, chưa có body và canvas. Thẻ script đồng bộ nằm trong head chặn parser. |
| SDK trả một Promise `init` đang chờ | Tài liệu hoàn tất, canvas tồn tại và vẫn đen vì startup chờ `p2.init()` mà chưa có deadline ở phía ứng dụng. |
| SDK standalone và đường dẫn con | Main Menu hiển thị tại `/preview/hollow-woods/` với Chromium và SwiftShader. |

Đã thêm trạng thái tải trong HTML, xử lý lỗi tải module và timeout khởi động. SDK được nạp với listener gắn trước request, có deadline 12 giây cho script và 11 giây cho `p2.init()`. Giữ tham số SDK 10 giây và chế độ standalone hiện hành khi SDK trả lỗi. Có nút Tải lại khi SDK treo. Trạng thái tải ẩn sau frame Main Menu được vẽ lên canvas hợp lệ. [HTML](../../../index.html) · [Main](../../../src/main.ts) · [Startup status](../../../public/startup-status.js).

Build cuối sau sửa gameplay và UI dùng `node_modules/.bin/vite build --outDir /workspace/work/v153-batch-03-r2/site-final-input`. Chromium đã chạy lại đủ các ca bên dưới trên build này. Root và subpath đạt. Vite sao chép font và script trạng thái vào output. Font, module, manifest và asset runtime được phục vụ bằng đường dẫn tương đối.

| Ca production sau sửa | Kết quả |
|---|---|
| SDK chậm 5 giây | Thấy trạng thái tải ngay và vào Main Menu sau khi tải. |
| SDK init treo và thử lại | Thấy thông báo P2Game và nút Tải lại. Lượt reload với SDK fixture hoạt động gọi init và ready một lần. |
| SDK trả lỗi mạng | Game vào nhánh standalone hiện hành. |
| Module 404 có chủ đích | Hiện thông báo lỗi tải mã trò chơi. |
| Iframe cục bộ 1600×900, DPR 1,25, subpath | WebGL, chuột New Game, phím D, Ctrl+Shift+F9, Vòng Sáng, mở khóa audio, Continue schema 3 và Esc mở/đóng Tạm dừng đều hoạt động. 0 lỗi JavaScript, HTTP 4xx hoặc request fail trong lượt iframe sạch. |
| Chromium tắt WebGL | Canvas hiện Main Menu ổn định. |

[Canvas đen trước](Visuals/V153_BATCH_03/r2-boot-pending-before.png) · [Trạng thái SDK chậm](Visuals/V153_BATCH_03/r2-boot-slow-sdk.png) · [Báo lỗi khi SDK treo](Visuals/V153_BATCH_03/r2-boot-pending-after.png) · [Continue từ iframe](Visuals/V153_BATCH_03/r2-boot-iframe-continue.png).

**Nghiệm thu hosted.** Cần bản thực sự có lỗi hoặc log Console, Network và URL preview hợp lệ để xác nhận nguyên nhân public. Khi Dashboard hỗ trợ rollback, Owner có thể chọn build gần nhất đã chơi được, kiểm tra menu và Continue bằng profile test rồi đối chiếu log với preview mới. Release gate hiện BLOCKED.
