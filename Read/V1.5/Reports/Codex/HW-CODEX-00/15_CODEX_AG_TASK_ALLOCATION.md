# 15 — Phân công theo bộ phận và workstream

| Bộ phận | Trách nhiệm |
|---|---|
| HOLLOW WOODS — Lore | Canon, nhân vật, hội thoại, quest narrative và worldbuilding. Đề xuất mới cần Owner khóa |
| HOLLOW WOODS — Design | Concept, pixel art, spritesheet, animation/VFX và review hình ảnh. Bàn giao asset, provenance và trạng thái duyệt |
| HOLLOW WOODS — Code | Roadmap, đặc tả, integration gate, đối chiếu GitHub và nghiệm thu |
| Hollow Woods - Dev / Codex | Thiết kế hệ thống và triển khai nhiệm vụ nặng đã được Owner duyệt |
| Antigravity | Các sửa lỗi nhẹ, kiểm kê, giấy phép, validation, QA độc lập, benchmark support và báo cáo |
| Trailer, Sanity, QA, Audio | Luồng chuyên biệt khi Owner xác nhận. Dùng hồ sơ bàn giao cho ngữ cảnh |

| Roadmap | Codex đề xuất sau duyệt | AG / dependency / trạng thái hiện tại |
|---|---|---|
| A01–A06 | Review giao diện kiến trúc nếu được giao về sau | Có báo cáo; A06-R1 có evidence ở nhánh riêng, không chạy lại phần đã có bằng chứng |
| A07–A10 | Thiết kế cinematic integration chỉ sau khi A08 có media duyệt | AG A07 đang tiếp tục; A08 tiền kỳ, A09 blocked, A10 draft |
| B01–B04 | B02 fidelity recovery cần Design; dùng B01/B03/B04 làm evidence | B01–B04 đã có checkpoint. EVKey vật lý và visual BUG-059 còn mở |
| B05–B08 | Review dependency nếu được giao | B05 docs blocked, B06 local evidence, **B07/B08 vẫn thuộc AG** |
| C01–C10 | C03–C10 là scope thiết kế sau C01/C02, C09 ưu tiên chuẩn bị spec | **C01/C02 vẫn thuộc AG**, không tái giao |
| D01–D05, D08 | Character design integration, ưu tiên Meliodas theo phạm vi Owner duyệt | Design cung cấp artwork, AG kiểm license và QA |
| E01–E05, E07 | Kiến trúc monster/boss và balance cho các entity đã duyệt | AG benchmark, thử encounter và hồi quy |
| F01–F06 | Profiling design, tối ưu memory/render/lifecycle sau đo | AG benchmark hỗ trợ. Đo real GPU/low spec |
| G01–G06 | Xử lý kiến trúc phức tạp nếu cần, chờ gate cuối | AG QA trên build đã được phép, release do Owner quyết định |
| D06, D07, E06 | CHAR-006 chỉ sau asset và Owner approval | DEFERRED. AG QA độc lập sau tích hợp được phép |

Không truy cập được các thread chuyên biệt từ lượt này. Dùng GitHub, các registry và Bible làm điểm đối chiếu; một đề xuất không đổi trạng thái Canon, mỹ thuật hoặc quyền tích hợp. Mọi task có report, commit, push, remote SHA theo Git Policy.
