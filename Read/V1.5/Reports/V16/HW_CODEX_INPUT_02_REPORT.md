# INPUT-02

**NOT REPRODUCED** trên production 1× tại 1a0a346. Bốn ca Chromium đạt. Nhả Shift và phím di chuyển xóa chạy. Bản đồ và Sổ tay khóa di chuyển, Esc đóng modal và phím đã nhả không kẹt. CompositionEvent giả lập trong input khóa gameplay và điều khiển trở lại khi canvas lấy focus. Kế thừa ca blur/refocus từ FIX15. Không sửa input controller.

EVKey/UniKey vật lý **NOT RUN**. Trace composition kiểm đường xử lý event của browser và không xác nhận driver bàn phím hoặc IME hệ điều hành.

[Trace Chromium](../Evidence/HW-QUEUE-CONTINUATION/input_02.json).
