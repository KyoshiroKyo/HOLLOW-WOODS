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

## Regression Batch 04A

Đã lặp các ca production tại checkpoint GitHub `0ceffa58` và sau khi nâng cấp Developer Mode. Giữ `base: './'`, hai manifest, SDK v1.1 và lựa chọn WebGL/Canvas. Chromium kiểm tra root, subpath, iframe 1600×900 ở DPR 1,25, resize 1280↔1600, reload, New Game, Continue schema 3, Vòng Sáng và audio unlock. F9 mặc định tắt trên build public. Build QA kiểm tra riêng. [Iframe production](Visuals/V153_BATCH_04A/r2-boot-iframe-continue.png).

Ca SDK chậm 5 giây vào menu sau khi thấy trạng thái chờ. Ca init treo hiện Tải lại, fixture init/ready đạt một lần sau khi tải lại. Lỗi mạng SDK đi theo standalone. Module 404 hiện thông báo riêng. PNG menu cinematic bị 404 có chủ đích vẫn hiển thị fallback. Chromium tắt WebGL vào menu bằng Canvas. Lượt iframe sạch có 0 exception và 0 lỗi HTTP. [SDK chậm](Visuals/V153_BATCH_04A/r2-boot-slow-sdk.png) · [SDK treo](Visuals/V153_BATCH_04A/r2-boot-pending-after.png) · [Module 404](Visuals/V153_BATCH_04A/r2-boot-missing-module.png).

`curl -I` tới endpoint SDK thực nhận CONNECT 403 từ môi trường Cloud. **HOSTED BLOCKED.** Chưa có bản build hoặc log cho sự cố màn hình đen của người chơi. Cần preview có quyền truy cập cùng Console và Network log để xác nhận ở hosted.

## BUG-024 · R10

Đã tái hiện bằng Chromium production local và server trả WAV từng đoạn qua HTTP. Chỉ rút ngắn 45 giây của watchdog xuống 3,8 giây trong fixture để đo cả hai build cùng điều kiện. Loader thật tiếp tục nhận dữ liệu trong khoảng 5 giây tại `assets/audio/sfx/v14/dagger_slash.wav`. Bản trước hiện Tải lại dù WAV trả 200 và thanh tải còn chạy.

HTML cũ cho hiện nút Tải lại ngay khi bắt đầu, kể cả ở giai đoạn Preload. Timer cũ đếm từ lần mở trang, độc lập với lượng dữ liệu nhận được. Bản mới hiện nút khi vào trạng thái lỗi và chỉ duy trì một lớp loading hiển thị. Phaser nạp scene, báo tiến trình khi tỷ lệ tổng hoặc byte tài nguyên tiến lên, rồi watchdog gia hạn theo hoạt động thật. Vẫn giữ deadline nếu yêu cầu đứng yên. Tệp dagger là PCM 16-bit 44.100 Hz, dài 0,620 s. `sanity_gasp`, `scout_whistle`, `skull_wolf_growl` và `skull_wolf_snarl` đều nằm trong loader. [Trước](Visuals/V153_BATCH_04A/r10-loader-before.png) · [Sau](Visuals/V153_BATCH_04A/r10-loader-after.png) · [Bị giữ request](Visuals/V153_BATCH_04A/r10-loader-stall.png).

Lượt cache Chromium dùng cùng profile với hai reload liên tiếp ở subpath. Mỗi lượt vào menu, có đúng một canvas và không hiện Tải lại. Hai reload có 11 event phục vụ từ cache mỗi lượt; log có 0 lỗi trang và 0 lỗi HTTP. SDK được chặn có chủ đích bằng CDP để chọn standalone và vẫn giữ cài đặt cache trình duyệt. [Log runtime](Visuals/V153_BATCH_04A/r10-runtime-verification.json).
