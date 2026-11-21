# V153 — Registry lỗi tester R10

Dùng mã trong INDEX R10. Hàng **OPEN** của batch khác giữ ở chủ sở hữu ghi dưới đây. Tránh tạo bản sửa trùng. [INDEX nguyên văn](../../../docs/chat_and_commands/V153_BATCH04_R10/00_INDEX_V153_BATCH04_R10.md).

| ID | Trạng thái | Dấu hiệu và phạm vi |
|---|---|---|
| BUG-021 | CLOSED-VERIFIED local | Camera áp Bellhollow và Fog tại cùng (461,232) khi trigger sớm bị dò vùng đảo lại. Chuyển commit theo tọa độ chân và dùng bounds liên tục. [Log](V153_B04B1_WORLD_CAMERA_REPORT.md). |
| BUG-022 | CLOSED-VERIFIED local | Farm thiếu ở điều kiện safe zone của Survival. NIGHT trong Farm không còn drain rừng. Hai phía ranh x=1120 đã thử 30 giây. |
| BUG-029 | PARTIAL | Cải thiện đường qua Farm/Outer Woods, Workshop và nền năm vùng mở rộng bằng tile đã có. Khu còn khóa chờ nghiệm thu thực địa. |
| BUG-033 | PARTIAL | World Map đọc transitions thật và giữ gate. Nhãn chồng, tràn khung và bố cục giữ 04E1. |
| BUG-024 | CLOSED-VERIFIED production local · HOSTED BLOCKED | Chromium thấy Tải lại với loader còn tải (`dagger_slash.wav` truyền từng đoạn). R10 chỉ hiển thị Tải lại khi thật sự lỗi/đứng yên và nhường chỗ cho Preload. Tệp WAV PCM 44.100 Hz, 54.808 byte đạt kiểm tra decode. [Trước](Visuals/V153_BATCH_04A/r10-loader-before.png) · [Sau](Visuals/V153_BATCH_04A/r10-loader-after.png) · [Đứng tải](Visuals/V153_BATCH_04A/r10-loader-stall.png). |
| BUG-031 | CLOSED-VERIFIED local | Hai bảng xuất hiện trong audit ở Bellhollow. Đã chuyển profiler vào tab Log & Hiệu năng. F10 giữ bảng kết quả benchmark khi gọi bằng tay. [Trước](Visuals/V153_BATCH_04A/before-f9-tab-1.png) · [Sau](Visuals/V153_BATCH_04A/r10-single-dev-panel.png). |
| BUG-032 | PARTIAL | Quan hệ xử lý va chạm khác số body vật lý. Panel đã phân biệt quan hệ đang bật và body static/dynamic đang bật. Phần cảnh báo frame `satyr_sheet` CLOSED-VERIFIED local tại K1, từ 136 xuống 0. Các lỗi chuyển động/đòn đánh chưa kiểm thử đầy đủ ở K2/K3. [K1](V153_B04_K1_RUNTIME_REPORT.md). |
| BUG-037 | CLOSED-VERIFIED local cho nền input | Main nghe pointerdown và click toàn trang nên cướp focus của panel/website. Focus chỉ nằm ở canvas khi click vùng game. Nhả trạng thái giữ trên blur và pointercancel. Click-away gameplay vẫn thuộc 04E1. |
| BUG-034 | CLOSED-VERIFIED local | Mảng xám trong nguồn nhà rèn. Bản tường đá và cửa thông gió dùng TX Wall, bàn rèn khớp body và E, Bram giữ ID. |
| BUG-044 | CLOSED-VERIFIED local | Luống Graphics cạnh nhà Neris dời khỏi hành lang. Biển/trigger tại (695,511), Tile Nam–Farm cùng pha. Đã thử hai chiều. |
| BUG-045 | CLOSED-VERIFIED local | Trạm Tây (562,160), Garth (540,205). Tới từ hai phía, hội thoại đúng, rotation 0 qua cổng. |
| BUG-046 | CLOSED-VERIFIED local | Finn chân (909,231), Tiled (909,216), patrol 901–914. Hội thoại, New Game và Continue đều có bằng chứng. |
| BUG-047 | CLOSED-VERIFIED local | Gỡ cột (900,335). Giữ bếp, lều, rương và cột đèn khác. E và nạp 1 củi được thử ban đêm. |
| BUG-048 | BLOCKED | Cần Owner định danh hai bụi Edda. Giữ các instance ở (1048,94), (1084,162), (1204,204) và lân cận. |
| BUG-049 | PARTIAL | Vòng và khoảng cách dùng chung điểm neo. Ca đại diện đã thử. Đối tượng ở vùng ngoài camera demo còn cần rà. |
| BUG-050 | CLOSED-VERIFIED local | Frame cây sồi thật ở (760,120). E mở đúng manh mối, cờ giữ qua Continue. |
| B04-10-K2 · phối tạo hình | CLOSED-VERIFIED local ở sáu nhóm Idle/Walk/Run | Các profile Fellor tối nằm trong atlas mới trước sửa. Đã dùng artwork custom đồng nhất cho RIGHT, giữ PNG/JSON K1 và nguồn Fellor. Hai bộ log trước/sau có texture, frame, matrix và count một actor. [Báo cáo](V153_B04_K2_MOVEMENT_REPORT.md). |
| B04-10-K3 · vị trí khung va chạm và sheet tấn công | CLOSED-VERIFIED local cho K3-A | Đòn cũ phát hitbox lúc đang Idle rồi đổi sang sheet legacy. Light, Heavy và đòn nối cùng actor nay phát ở active frame của atlas và hoàn tất hồi phục. Phần phòng thủ/kỹ năng giữ OPEN trong K3. [K3](V153_B04_K3_COMBAT_REPORT.md). |
| Restart Canvas · đối chiếu K2 | OPEN · 04E1 | Phaser Text `drawImage` trên context null xảy ra ở 04B2 và các build K2. Actor cũ được hủy, actor mới duy nhất. [Stack runtime](Visuals/V153_B04C_K2/restart-compare.json). |
| Footprint NPC Garth · phát hiện trong K2 | OPEN · 04C-G | Sprite (540,205), AABB tại physics step [561,255,583,269], tái hiện cả 04B2 và K2. Body có va chạm ở đúng AABB. Cần rà offset và neo chân của hành vi NPC. |
| BUG-051 | OPEN · 04C-G | Tester báo Cổng Đông vẫn khóa sau khi trò chuyện với cả Garth, Edda và Neris. Kiểm tra nhánh hội thoại, điều kiện mở cổng và flag runtime/Save. |
| BUG-052 | OPEN · 04C-G | Thay điều kiện mở Cổng Đông thành hoàn tất hội thoại mở cổng của Garth **hoặc** Edda **hoặc** Neris. Kiểm thử riêng ba lộ trình và hội thoại chưa hoàn tất. |
| BUG-053 | OPEN · 04C-G | Nhiệm vụ vừa nhận từ Sir Vaelen hoặc NPC khác cần xuất hiện ngay sau khi nhận. Kiểm tra quest ID và sự kiện cập nhật. |
| BUG-054 | OPEN · 04C-G | Đồng bộ nhiệm vụ đang theo dõi giữa HUD, Sổ Tay, World Map và Save/Load. Kiểm tra nhận, đổi, hoàn tất và Continue. |
| LEG-R8-14 | CLOSED-VERIFIED local | Chỉ mở F9 đã latch lượt Dev, Save QA tách khóa, mock SDK xác minh chặn sau await và luồng gửi điểm sạch. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md). |

| Hàng chờ | Chủ sở hữu để tiếp tục |
|---|---|
| BUG-021/022/029, phần map của BUG-033 | 04B1 đã chốt kết quả theo hàng trên. Phần layout/Map UI và chiều khóa theo tiến trình giữ đúng nhóm sở hữu. |
| BUG-048, BUG-049 | Hai bụi cần Owner định danh; rà thêm tương tác/despawn ở các vùng chưa thử. [Báo cáo 04B2](V153_B04B2_WORLD_ART_LAYOUT_REPORT.md). |
| BUG-051–054 | 04C-G. Bổ sung theo Owner trong 04C-K1, chưa triển khai hoặc tái hiện tại K1. |
| BUG-025, phần logic BUG-038–043 | 04C-G và 04E1. |
| BUG-023/026/027 | 04D. Chưa có nghiệm thu thiết bị đối với chớp, audio lửa trại hoặc ambience. |
| BUG-028/030/033/035/036, phần UI BUG-037–043 | 04E1. |
| LEG-R8-03 và phần frame BUG-032 | Registry CLOSED-VERIFIED local tại 04C-K1. Hoạt ảnh combat và Hurt/Death chuyển K2/K3 theo ma trận. |
| Các mã LEG-R8 khác | Kế thừa từng trạng thái và owner trong INDEX R10. |
