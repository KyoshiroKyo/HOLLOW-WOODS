# HW-CODEX-UI-LORE-01

Baseline 4bdc351c53698936b16af8d812921eaaa8df9eec. Triển khai trên nhánh Codex sau Queue Continuation.

## FIX-06-R1

Chromium chạy đến vòng kích hoạt rồi tiến vào vùng tan biến của đúng echo_fog_gate. Baseline đã nằm trong màn hình ở 1280×720 nhờ bản vá FIX15, nhưng tiền tố ✨ kích hoạt nhầm màu xanh success. Echo nay chọn info rõ ràng và dùng khổ chữ tối đa 500 px trên canvas logic. Dùng cơ chế giới hạn chiều cao và canh lề trong cả lúc popup trôi hiện hành. Nguyên văn Echo, trigger và mốc ký ức giữ nguyên.

PASS ở 960×540, 1280×720 và 1920×1080. Baseline dùng màu #66d99a và ba dòng. Bản sửa dùng #E8DFC8 và bốn dòng, chiều rộng chữ 498 px logic. Mép chữ nằm trong canvas ở ba viewport. [Trước](../Evidence/HW-CODEX-UI-LORE-01/before_1280x720.png) · [960×540](../Evidence/HW-CODEX-UI-LORE-01/after_960x540.png) · [1280×720](../Evidence/HW-CODEX-UI-LORE-01/after_1280x720.png) · [1920×1080](../Evidence/HW-CODEX-UI-LORE-01/after_1920x1080.png).

## LORE-SYNC

HUD và tóm tắt Ending dùng một resolver. Mốc 0–1 hiển thị The Nameless Wayfarer, từ mốc 2 hiển thị The Lone Wolf cho tới khi có cả mốc 3 và chứng cứ hợp lệ Q05 hoặc SQ08. Khi xác thực, HUD, popup, tóm tắt và bản ghi liên quan dùng Lord Meliodas Blackwood — The Wolf Lord. Đồng bộ các cách gọi cũ ở hội thoại Edda/Neris/Garth/Finn, vài tooltip và tác giả các mục Sổ tay trong phạm vi bàn giao. Cảnh và ghi chép Ending dùng bản che khi thiếu chứng cứ, tránh gán việc nhớ lại danh tính cho người chơi khi chưa xác thực.

Bản thảo cho Hồi Ức II–III, văn bia, nguyên nhân biến cố trong nhật ký và văn bản hướng dẫn Q05 vẫn chờ duyệt nội dung riêng. Các mục đó, lời Echo, text nhiệm vụ và Prologue giữ nguyên. Giữ ID, cờ, quest rewards, ngưỡng chọn Ending và Schema 3.

Chromium xác nhận đủ ba danh xưng, mốc 3 thiếu chứng cứ còn ở Stage II, Save/Continue với chứng cứ giữ Stage III và mở nhật ký im lặng. A06 **24/24**, A07 **23/23**, TypeScript và build production đạt. Không chạy lại kiểm toán Lore toàn bộ. [Trace baseline](../Evidence/HW-CODEX-UI-LORE-01/runtime_before.json) · [Trace production](../Evidence/HW-CODEX-UI-LORE-01/runtime_after.json).
