# HOLLOW WOODS V1.5.3 — Tiến độ Batch 03-R2

**20/11/2026 · nhánh `work` · HEAD `b5eaa61` · RELEASE BLOCKED**

Đã tiếp tục worktree chứa Batch 02 và kết quả R1. Cả 53 tệp Batch 02 còn ở workspace. Sáu tệp có cập nhật R1 đã được đối chiếu với ảnh và kết quả kiểm thử. R2 chỉnh thêm HTML, bootstrap, NPC và chỉ mục. Kho nguồn Fellor và 324 PNG Source Library khớp SHA-256 đầu Batch 02.

| Nhóm | Kết quả |
|---|---|
| B03-RESUME-00 | LOCAL PASS. Đối chiếu nguồn, file thực tế và bằng chứng R1. |
| P0 production và SDK | PRODUCTION LOCAL PASS ở root/subpath/iframe. Ca SDK chậm, init treo, module 404, WebGL tắt đều có hành vi kiểm thử. Hosted BLOCKED. |
| Bellhollow và collision | PARTIAL. Đã sửa vùng đen gần Neris và lỗi kích thước collider tĩnh. Đã đi Fog Crossing → Bellhollow, qua Cổng Đông khóa/mở theo hai fixture, tới Crooked Path, về Bellhollow, sang Outer Woods và đi hai chiều Sanctuary Farm. Còn lượt xuyên suốt bằng tiến trình thật. |
| Hội thoại và HUD | Đã sửa khóa modal J khi thoại, Esc trao thưởng sớm, badge to, La Bàn còn hiện và overflow thoại. Đã kiểm tra ba NPC. E tiến đến câu trả lời và Neris trao thưởng đúng một lần. Esc khôi phục HUD/input. Công đoạn QA phát hiện phím resume bị xóa ở Pause và đã xác nhận chu trình mở/đóng trong production iframe. |
| CLOUD-01C | PARTIAL. Armed Idle có 18 frame bổ sung cho UP, DOWN và LEFT. RIGHT tham chiếu sáu frame Fellor. LEFT R2 cải thiện tỷ lệ và tay cầm nhưng còn viền cyan và lệch tông giáp so với RIGHT. |
| CLOUD-01X / CLOUD-01Y-R | LOCAL PASS. Chân dung 64×64 dùng ảnh Fellor. GameScene dùng `BlackKnightPlayer`, registry và JSON mang tên mới. Giữ 72 cặp key và các alias cũ. |
| CLOUD-02A-R / CLOUD-02C | LOCAL PASS R1. Menu 12 frame, 10 fps, phụ đề Việt, ba viewport, bốn trạng thái HUD và hồi sức ở ngưỡng hiện hành 30. |
| CLOUD-FIX-09 | LOCAL PASS qua Chromium Continue → Save → Reload. Giữ schema 3, vũ khí, vật phẩm, quest, quyền vùng và trồng trọt. Save metadata 1.5.0 và 1.5.1 được phân biệt với schema số. |
| CLOUD-P2-01 / 02 / 03 | Giữ avatar, cover, sáu ảnh hiện có và hai manifest đồng bộ. Gallery mới phụ thuộc tích hợp Knight và nghiệm thu màn chơi. |
| CLOUD-01D → 01W, 01Y, 01Z | Các nhóm còn lại chờ gate chất lượng Armed Idle và coverage. Bản chạy dùng sprite legacy. |
| CLOUD-CLEAN-03 / 05 | PARTIAL. Audio unlock và phép đo đổi ramp đạt trong test cục bộ. Hiện tượng rè/rít của người chơi chưa được tái hiện. Chưa đo hiệu năng toàn tuyến. |
| CLOUD-QA-01 → 03 / CLOUD-RELEASE-01 | QA cục bộ theo phạm vi nêu trên. Release BLOCKED tại hosted, artwork và lượt gameplay đầy đủ. |

[Checkpoint](V153_BATCH_03_CHECKPOINT.md) · [Sổ lỗi](V153_BATCH_03_CRITICAL_BUG_REGISTER.md) · [Startup production](V153_P2GAME_BLACK_SCREEN_REPORT.md) · [World](V153_WORLD_REPAIR_REPORT.md) · [UI](V153_UI_UX_REPORT.md) · [Naming](V153_LEGACY_NAMING_MIGRATION.md) · [Ma trận](V153_CHARACTER_ANIMATION_MATRIX.md) · [Branding](V153_P2GAME_BRANDING_REPORT.md) · [QA](V153_FINAL_QA_REPORT.md) · [Toàn dự án](V153_FULL_PROJECT_REPORT.md).
