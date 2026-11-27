# HW-CODEX-INTRO-01 — Cinematic Startup & Prologue

- Nhánh · `feat/v1.6-codex-development`
- Baseline · `c1c14b2168ddf40d9b6b9cdfc2e6a04c889317b6`
- Trạng thái · Chờ Owner nghiệm thu

## Startup

Baseline vẽ Preload trong iframe kể cả khi host đang hiển thị màn chờ. Thanh của game có thể báo 100% trước khi dựng xong Main Menu. Tín hiệu SDK được gửi trong sự kiện render của scene, còn lớp trạng thái HTML đóng bằng hook riêng sau render.

Sau khi SDK xác nhận phiên hosted, camera Preload của game không vẽ và host điều khiển màn chờ. Standalone vẫn có thanh tải và chuyển sang trạng thái chuẩn bị menu ở bước cuối. Watchdog và trạng thái lỗi tải vẫn hoạt động. Hook `POST_RENDER` chỉ gửi `ready()` một lần, sau khi menu hoạt động, Preload đã dừng, canvas có kích thước và trạng thái HTML đã đóng. Cách triển khai theo hợp đồng `init()` → dựng khung hình đầu tiên → `ready()` của [SDK P2Game 1.1](https://www.npmjs.com/package/@p2game.io/sdk/v/1.1.0).

## Prologue

New Game chuyển hẳn từ Main Menu sang `PrologueScene`. Ba thẻ A08 giữ nguyên văn bản và thứ tự. Hình được dựng từ sprite đèn, Meliodas, tháp chuông, cây và texture sương đã có trong repo, với chuyển cảnh mờ dần và ánh sáng theo từng thẻ. Prologue dùng font Hollow Woods UI có tiếng Việt, text raster 2× trở lên, căn giữa và chừa khoảng cho dấu. Reduced Motion bỏ chuyển động sương và fade của prologue. ESC, Space, Enter hoặc click vẫn có thể bỏ qua. Tên **THE UNBROKEN OATH** được đồng bộ tại title HTML, Preload và mô tả manifest. Tiêu đề lore trong phần biên niên sử giữ nguyên.

Code dựng Main Menu, artwork Meliodas bên phải, khung áo choàng, bố cục thanh menu và asset nguồn được bảo toàn. ZIP V1.6.0 và nhánh main giữ nguyên.

## Kiểm thử

| Hạng mục | Kết quả |
| --- | --- |
| TypeScript và Vite build | PASS, 0 lỗi |
| V152-08 SDK, V15-48 focus/HUD, P2Game local validator | 31/31, 28/28, 23/23 |
| SE-004 | Không có `navigator.clipboard` hoặc `clipboard-write` trong app bundle |
| RT-002 | Kiểm tra static và trace focus canvas qua thao tác người dùng |
| Standalone | Menu hiện sau khi tải, đủ ba thẻ A08 tự chạy đến Fog Crossing. Lượt riêng xác nhận Space bỏ qua đến Fog Crossing |
| Iframe sandbox mô phỏng | PASS với UMD SDK chính thức 1.1.0. Host nhận một message ready và đóng màn chờ, ESC vào Fog Crossing |
| Portal công khai | NOT RUN |

Vite còn cảnh báo đã có về startup script và hai đường dẫn font. Validator xác nhận cả hai font có trong dist. Kiểm thử Chromium dùng profile riêng với localhost và ghi khung từ canvas gameplay thật. Các tệp PNG và trace JSON nằm trong [Evidence](../Evidence/HW-CODEX-INTRO-01/).

Ảnh Before/iframe dùng SDK stub để tái hiện hai lớp chờ khi Preload đạt 100%. Ảnh After/iframe-sdk dùng SDK UMD chính thức với host chạy trên localhost, ghi request handshake và ready. Hai phiên đều giả lập host, còn vòng đời và khung hình game chạy thật trên Chromium. Bản dùng SDK chính thức xác nhận camera Preload và trạng thái HTML đều ẩn trong iframe, Main Menu đã vẽ trước ready, ready chỉ phát một lần, và focus canvas xảy ra sau thao tác người dùng.
