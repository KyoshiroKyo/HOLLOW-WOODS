# 18 — Ma trận phạm vi kiểm toán

| Lĩnh vực | Coverage đã đối chiếu | Còn thiếu |
|---|---|---|
| Git | 16 nhánh, 13 tags, refs/merge-base/divergence/checkpoint; smoke tại B08 | AG worktree, A07 changes; C01/C02 pending |
| Kiến trúc | 102 TypeScript files catalogued; entry/lifecycle và hệ thống core được trace chọn lọc | Full function-by-function audit; runtime shutdown/stress |
| Asset | Hash/size/format và resolution image có thể đọc, source/texture references phân tích tĩnh | G: export/archive và licence review; dynamic usage exhaustive |
| Black Knight | 10 atlas PNG/JSON, state mapping và hai renderer smoke; evidence K1/K2/K3/34-source được tái sử dụng | BUG-059 artwork, visuals/swing đầy đủ ở phiên này NOT RUN |
| World | 17/17 zones dữ liệu, 41 cạnh, 3 TSX hiện có, 1 zone smoke | 16 zone không smoke, Noclip OFF route, collision/boss/softlock QA NOT RUN |
| UI/UX | 17 surfaces được rà theo nhóm, Main Menu/HUD smoke, World Map static | Modal matrix, input phần cứng, responsive/accessibility thực tế, full Ending/Cinematic NOT RUN |
| Gameplay | Static core, save schema, physical browser movement, evidence lịch sử với quy mô ghi riêng | Full story, combat, boss, gamepad, cloud/Continue e2e mới NOT RUN |
| Narrative/Canon | Owner addendum, Technical Bible / update log, Master Game Bible tương đương trên Drive, registries và A01–A10 checkpoints | Bản DOCX Unified chính xác, archive handover CHAR-006 V3.2 riêng NOT ACCESSIBLE; A06-R1 chưa tích hợp, A07 local |
| Hiệu năng | HEADLESS smoke + LAB-01 REAL GPU lịch sử | GPU thật cho B08, CPU/RAM/1% low chuẩn, profile dài NOT RUN |
| Build/P2Game | Clean npm ci bằng cache riêng, typecheck/data/build, 23 validator, 212 literal paths, 31 SDK, Chromium headless hai renderer | Hosted thật/CDN 206 và CloudSave nhà phát hành NOT RUN |
| Quyết định/trao quyền | Roadmap 3.1 còn 52 active, 3 deferred; branch risks và workstream owner | Approvals mở task tiếp theo |

PASS trong evidence chỉ áp dụng cho test đã chạy hoặc có báo cáo rõ checkpoint. PARTIAL dùng cho master audit vì các dữ liệu và ca test ngoài tầm truy cập hoặc chưa chạy.
