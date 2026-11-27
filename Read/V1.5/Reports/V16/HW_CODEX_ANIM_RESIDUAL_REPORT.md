# ANIM-RESIDUAL

**NOT REPRODUCED** trong lượt Chromium production 1× tại 4595ac9. Input thật qua CDP xác nhận Walk → Run → Walk khi đổi sang trái, chuyển tự nhiên Fog Crossing → Bellhollow, tự tra kiếm và thao tác X. Trace lưu frame, alpha bounds thực tế, anchor, scale, vận tốc, stamina và camera. Camera giữ 2,2×, foot collider 18×12. Hai frame Walk/Run đã lấy mẫu có cạnh alpha dưới lần lượt −1,50 và −1,14 px so với origin. Chênh lệch trục ngang và silhouette còn thuộc BUG-059.

Kế thừa số đo kiệt sức, hồi thể lực và trở về Idle sau trúng đòn từ FIX15. Các call-site gameplay hiện hành dịch chuyển nhân vật khi bị đẩy rồi gọi playHurt không tham số. Chưa có phép đo trọn chuỗi bị quái đẩy bằng gameplay input. EVKey/UniKey vật lý NOT RUN. Giữ nguyên controller, art và collider.

[Trace ANIM](../Evidence/HW-QUEUE-CONTINUATION/anim_residual.json).
