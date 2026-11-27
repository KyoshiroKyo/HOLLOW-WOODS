# V1.6.1 P2Game — Gói bàn giao upload

Nguồn build 44ac91c0955cf0b9536711dc5dc1ac04292f672c, đã đối chiếu trên nhánh feat/v1.6-codex-development. Tạo build production mới, đóng ZIP từ build và chạy Chromium từ thư mục giải nén. Root ZIP có index.html, p2game.json 1.6.1 và tài nguyên tương ứng.

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và Vite production | Đạt, 0 lỗi chặn |
| P2Game validator local | 23/23, 0 lỗi chặn. Cảnh báo sáu ảnh media cũ không được manifest tham chiếu. |
| Chromium giải nén | 25/25, không lỗi runtime. Kiểm New Game, Skip, di chuyển, Save/Continue, thưởng Edda, bản đồ và F4/F9 khóa. |
| Khớp hồi quy UI-LORE-01 | App bundle trùng SHA-256 với build đã kiểm Echo ở ba viewport và Save/Continue danh xưng. |
| ZIP và SE-004 | 292 tệp, đối chiếu SHA-256 từng tệp với build. Scan bundle SE-004 đạt. |

Gói Owner upload nằm tại release/p2game/v1.6.1-upload/HOLLOW_WOODS_V1.6.1_P2GAME_RELEASE.zip. Dung lượng 62.448.652 byte. SHA-256 54319f14a5ba555e832054e471f5f7b5eae733f43045a066c8a5e0385b41d88d.

Giữ các kết quả hồi quy áp dụng từ Queue Continuation và UI-LORE-01. Chưa chạy Portal thật hoặc cloud SDK thật. ZIP V1.6.0 và ba candidate hiện có giữ nguyên. Chỉ bàn giao local để Owner upload.

[Kiểm ZIP](../Evidence/HW-P2GAME-RELEASE-161/archive-check.json) · [Validator](../Evidence/HW-P2GAME-RELEASE-161/validator.json) · [Smoke](../Evidence/HW-P2GAME-RELEASE-161/production_smoke.json).
