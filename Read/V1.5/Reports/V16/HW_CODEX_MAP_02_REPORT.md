# HW-CODEX-MAP-02 — Bản đồ địa hình minh họa

Bổ sung vào FIX15 tại baseline 4fd8aaf6bcaa20d1dd4b156306b80da0ab0b3dc4. Candidate ZIP phát hành thử trước MAP-02 được giữ nguyên.

Bản đồ chiếu từ bounds trong zones.json, hướng Bắc ở trên và cùng tỷ lệ hai trục. Tám vùng chính và bốn vị trí lồng hoặc dưới mặt đất tạo mẫu số 12. Năm vùng pending nằm ngoài danh sách. Cây, nhà, tháp chuông và bề mặt đã bake dùng tài nguyên hiện có. Các nét nối che phủ đoạn từ trigger tới điểm đến của tuyến đã biết, theo ZoneConnectionRegistry. Dấu phong ấn đọc WorldGatingSystem và trạng thái cầu. Địa hình chưa khám phá chỉ có mặt giấy và sương. Gợi ý nhiệm vụ có thể hiện trong vùng chưa mở.

Bản đồ dùng một CanvasTexture 920×480, khoảng 1,68 MiB RGBA. Chỉ vẽ khi mở lần đầu hoặc khi tập vùng đã khám phá đổi. Dấu vị trí, mục tiêu, đường và cổng cập nhật khi mở bản đồ hoặc đổi mục tiêu đang theo dõi. Scene dọn texture cùng modal. Cờ khám phá Bellhollow dành cho bản đồ dùng trường flags hiện hành vì dữ liệu cũ mặc định đưa làng vào visitedZones. Save cũ có bằng chứng đã tiến xa vẫn mở địa hình theo tiến trình hiện có. Không đổi schema, điểm BXH, collider, cổng gameplay hoặc Canon.

| Kiểm thử | Kết quả |
| --- | --- |
| TypeScript và build production/Private QA | PASS |
| Validator P2Game local | 23/23 |
| Chromium production | 4/4. New Game chỉ hiện Fog Crossing và gợi ý Bellhollow. N mở/đóng 10 lần, ổn định số lớp và một texture. Đi sang Bellhollow rồi Save/Continue giữ khám phá. F4/F9 bị khóa. |
| Chromium Private QA | 2/2. Fixture toàn vùng hiển thị 12 vùng, gồm bốn vị trí lồng. F4/F9 hoạt động, QA dùng save riêng và chặn gửi điểm. |
| Kích thước cửa sổ | 960×540, 1280×720, 1920×1080, ảnh runtime. |
| Portal thật, thiết bị cảm ứng, bộ gõ tiếng Việt vật lý, kiểm thử reduced motion riêng | NOT RUN |

Trên Windows, Chromium headless và GTX 1070 Ti, thời gian từ thao tác mở N tới khi nhận trạng thái mở là khoảng 158 ms trước và 142 ms sau. Trung vị của 10 lần mở lại khoảng 82 ms. p50/p95 frame time là 16,7/16,8 ms ở cả hai build. Đo bằng CDP có độ trễ lấy mẫu và số lượt lạnh thấp. Các số này mô tả lượt thử, chưa xác lập mức tăng tốc trên thiết bị khác.

[Ảnh trước, New Game](../Evidence/HW-CODEX-MAP-02/01_before_new_game.png) · [Ảnh sau, New Game](../Evidence/HW-CODEX-MAP-02/03_after_new_game.png) · [Bellhollow](../Evidence/HW-CODEX-MAP-02/04_after_bellhollow.png) · [Fixture vùng đã khám phá](../Evidence/HW-CODEX-MAP-02/07_after_qa_explored.png).

[Trace baseline](../Evidence/HW-CODEX-MAP-02/runtime_before.json) · [Trace production](../Evidence/HW-CODEX-MAP-02/runtime_production.json) · [Trace Private QA](../Evidence/HW-CODEX-MAP-02/runtime_private_qa.json) · [Validator](../Evidence/HW-CODEX-MAP-02/validator.json).
