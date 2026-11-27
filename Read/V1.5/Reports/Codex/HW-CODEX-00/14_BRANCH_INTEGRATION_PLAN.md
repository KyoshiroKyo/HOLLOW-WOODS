# 14 — Integration plan đề xuất

Dùng B08 `c9de0c2` làm ứng viên baseline kỹ thuật, với development `e4edb07` là nguồn công việc đã được AG ghi nhận. Lý do chọn B08 là ancestry của B01–B04 và B06 plus baseline world/narrative đang có. A06-R1, B05 và B07 đi nhánh riêng. A07 còn dựa trên worktree chỉ AG sở hữu. [Branch matrix](02_GITHUB_BRANCH_AUDIT.md)

| Nhánh/workstream | Dependency và bằng chứng | Rủi ro |
|---|---|---|
| A06-R1 | Merge base `53eabbe`; B08 ahead 10, behind 1. Hai tuyến Owner duyệt và AG có fixture evidence | Cả hai phía sửa `GameScene.ts`, `UIScene.ts`, `SaveManager.ts`. Xung đột ngữ nghĩa gồm gate stage, listener, API hydrate và active quest |
| A07 | Bước 2/5 trong checkpoint. 4 source changes và 2 tệp untracked từ báo cáo AG | Bảo vệ thay đổi local và staged renames. So khớp tiến trình Q05/SQ08, boss reward, thresholds 50/3/65 sau khi tích hợp |
| B05 / B07 | `73a5d63` + `76a235f` là docs-only. B05 cần A07, B07 cần A06-R1/A07/B05 | Duplicate rewards/trust với save cũ thiếu marker; compatibility IDs và source B08 có metadata version mới |
| B08 | Standalone/host simulation PASS, real hosted chưa chạy | B08 đụng SaveManager và input startup. Chạy lại iframe/Continue và 206 trên staging khi có quyền riêng |
| C01/C02 | Collision/topology và Fog Crossing/Bellhollow do AG. Chưa tìm thấy head/report mới | Tránh để C03–C10 song song sửa cùng zone/terrain registry khi các checkpoint đó đang dở |
| CHAR-006 | Nhánh archive mỹ thuật, Gate B | Không đưa thiết kế/gói thương mại vào nhánh tích hợp hoặc thêm runtime |

Trình tự cần Owner duyệt: (1) AG xác minh trạng thái và checkpoint A07; (2) thử tích hợp A06-R1 với B08 trong worktree chuyên biệt rồi kiểm hồi quy reveal/UI/save; (3) nối checkpoint A07 và test ảnh hưởng thật trước B05/B07; (4) xác nhận head C01/C02 và kiểm tuyến tự nhiên, xong mới khóa đầu vào C03–C10; (5) kiểm hosted staging khi Owner mở gate. Đề xuất này không cấp quyền Git hoặc thay thế quyền bàn giao của AG.
