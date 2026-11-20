# V153 — Registry lỗi tester R10

Dùng mã trong INDEX R10. Hàng **OPEN** của batch khác giữ ở chủ sở hữu ghi dưới đây. Tránh tạo bản sửa trùng. [INDEX nguyên văn](../../../docs/chat_and_commands/V153_BATCH04_R10/00_INDEX_V153_BATCH04_R10.md).

| ID | Trạng thái 04A | Dấu hiệu và phạm vi |
|---|---|---|
| BUG-024 | CLOSED-VERIFIED production local · HOSTED BLOCKED | Chromium thấy Tải lại với loader còn tải (`dagger_slash.wav` truyền từng đoạn). R10 chỉ hiển thị Tải lại khi thật sự lỗi/đứng yên và nhường chỗ cho Preload. Tệp WAV PCM 44.100 Hz, 54.808 byte đạt kiểm tra decode. [Trước](Visuals/V153_BATCH_04A/r10-loader-before.png) · [Sau](Visuals/V153_BATCH_04A/r10-loader-after.png) · [Đứng tải](Visuals/V153_BATCH_04A/r10-loader-stall.png). |
| BUG-031 | CLOSED-VERIFIED local | Hai bảng xuất hiện trong audit ở Bellhollow. Đã chuyển profiler vào tab Log & Hiệu năng. F10 giữ bảng kết quả benchmark khi gọi bằng tay. [Trước](Visuals/V153_BATCH_04A/before-f9-tab-1.png) · [Sau](Visuals/V153_BATCH_04A/r10-single-dev-panel.png). |
| BUG-032 | PARTIAL | Quan hệ xử lý va chạm khác số body vật lý. Panel đã phân biệt quan hệ đang bật và body static/dynamic đang bật. Mất frame `satyr_sheet` 16/17/20/21 trong báo cáo tester còn mở ở 04C-K1. |
| BUG-037 | CLOSED-VERIFIED local cho nền input | Main nghe pointerdown và click toàn trang nên cướp focus của panel/website. Focus chỉ nằm ở canvas khi click vùng game. Nhả trạng thái giữ trên blur và pointercancel. Click-away gameplay vẫn thuộc 04E1. |
| LEG-R8-14 | CLOSED-VERIFIED local | Chỉ mở F9 đã latch lượt Dev, Save QA tách khóa, mock SDK xác minh chặn sau await và luồng gửi điểm sạch. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md). |

| Hàng chờ | Chủ sở hữu để tiếp tục |
|---|---|
| BUG-021/022/029, phần map của BUG-033 | 04B1. Camera vòng ở đầu làng, ranh Farm ảnh hưởng Tinh Thần, nền/đường và dữ liệu Map. |
| BUG-034, BUG-044–050 | 04B2 và 04C-G tùy logic. Giữ ID và tọa độ trong INDEX. |
| BUG-025, phần logic BUG-038–043 | 04C-G và 04E1. |
| BUG-023/026/027 | 04D. Chưa có nghiệm thu thiết bị đối với chớp, audio lửa trại hoặc ambience. |
| BUG-028/030/033/035/036, phần UI BUG-037–043 | 04E1. |
| LEG-R8-03 và phần frame BUG-032 | 04C-K1. |
| Các mã LEG-R8 khác | Kế thừa từng trạng thái và owner trong INDEX R10. |
