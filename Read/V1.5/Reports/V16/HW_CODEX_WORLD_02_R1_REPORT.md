# WORLD-02-R1

**PASS** trong Private QA. Baseline về Sanctum (960, −580) dù gửi (1600, −420), chấp nhận Vực Sâu và Hang Cội Rễ, và dùng điểm dự phòng Bellhollow khi gửi tọa độ ngoài bounds. Teleport giờ từ chối phân khu pending và yêu cầu hộp chân nằm trong bounds trước và sau SafeSpawnResolver. Sau teleport hợp lệ, Arcade Body đồng bộ ngay từ sprite theo offset chân.

Bốn yêu cầu bất hợp lệ giữ vị trí và phân khu hiện tại, có thông báo. Ancient Rune Puzzle (3380, 260) nằm trong bounds, không chồng collider sau khi đồng bộ body. TypeScript và build QA đạt. Luồng production Save/Continue giữ cách xử lý đã qua FIX15, gồm năm fixture save cũ trong vùng pending. Không có bằng chứng phải thay quy tắc hồi phục production.

[QA trước](../Evidence/HW-QUEUE-CONTINUATION/world_02_r1_before.json) · [QA sau](../Evidence/HW-QUEUE-CONTINUATION/world_02_r1_after.json).
