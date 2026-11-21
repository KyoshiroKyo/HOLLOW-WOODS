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
| B04-10-K3 · Roll đứng tại chỗ và trộn sheet phòng thủ | CLOSED-VERIFIED local ở K3-B | Nhánh Update đè velocity 220 thành 0 ngay lúc lăn. Giữ velocity tới khi Arcade chặn hoặc hết i-frame. Trace Canvas/WebGL có AABB dừng y=280 ở hàng rào với Noclip OFF. Từng clip B có đúng texture/frame và một actor. [Báo cáo](V153_B04_K3_COMBAT_REPORT.md). |
| B04-10-K3 · Buff legacy, neo VFX và thời điểm Weapon Art | CLOSED-VERIFIED local ở K3-C | Baseline [F] từng gọi texture Buff legacy khi Unarmed; [R] từng phát va chạm trên Idle. C tách cả hai Buff khỏi [F], giữ va chạm [R] ngay frame 0 và thêm bảy nhóm asset-only. Canvas/WebGL đối chiếu texture, frame và AABB; tất cả 26 nhóm hoạt ảnh có coverage bốn hướng. [Báo cáo](V153_B04_K3_COMBAT_REPORT.md). |
| Restart Canvas · HOTFIX-C | CLOSED-VERIFIED local | Đồng bộ zone badge sau CREATE của UIScene mới. Canvas và WebGL qua vòng đời Restart với đúng một actor, canvas và badge, không còn drawImage. [Báo cáo](V153_B04_MASTER_HOTFIX_REPORT.md). |
| Footprint NPC Garth · phát hiện trong K2 | OPEN · 04C-G | Sprite (540,205), AABB tại physics step [561,255,583,269], tái hiện cả 04B2 và K2. Body có va chạm ở đúng AABB. Cần rà offset và neo chân của hành vi NPC. |
| HOTFIX-A1 | CLOSED-VERIFIED local | Bỏ bếp Thợ Săn và collider, giữ bếp Vaelen. Chromium kiểm tra các tuyến với Noclip tắt và tương tác sưởi. [Báo cáo](V153_B04_MASTER_HOTFIX_REPORT.md). |
| HOTFIX-A2 | CLOSED-VERIFIED local | Sắt cổ ngữ có sprite tại điểm E, chỉ nhặt một lần. Continue vẫn ẩn item sau khi tiêu hao. [Báo cáo](V153_B04_MASTER_HOTFIX_REPORT.md). |
| HOTFIX-B1 | PARTIAL · local | Đã chuẩn hóa hai Run live và neo bóng sau bước physics. Chưa tái hiện phóng lớn trong Walk ở bốn hướng Armed/Unarmed. [Báo cáo](V153_B04_MASTER_HOTFIX_REPORT.md). |
| HOTFIX-B2 | PARTIAL · local | Chromium đạt ca phím thật, packet IME giả lập, blur và nhập văn bản. EVKey Windows cần xác nhận. [Báo cáo](V153_B04_MASTER_HOTFIX_REPORT.md). |
| BUG-051 | CLOSED-VERIFIED local · 04C-G P0 | Thoại Garth từng ghi sai cờ so với điều kiện khóa. Chromium xác nhận cờ cổng, collider và đi bộ qua Cổng Đông. [Báo cáo](V153_B04CG_P0_REPORT.md). |
| BUG-052 | CLOSED-VERIFIED local · 04C-G P0 | Garth, Edda hoặc Neris đều mở cổng khi hoàn tất thoại mở cổng. Mở thoại và Escape giữ khóa. Cả ba nhánh giữ cổng mở sau Continue schema 3. [Báo cáo](V153_B04CG_P0_REPORT.md). |
| BUG-053 | CLOSED-VERIFIED local · 04C-G P0 | HUD cập nhật khi nhận quest Edda, Giữ Lửa Trong Sương, Dấu Vết Đồng Đội Cũ và chỉ dẫn tìm khuôn của Sir Vaelen. [Báo cáo](V153_B04CG_P0_REPORT.md). |
| BUG-054 | CLOSED-VERIFIED local · 04C-G P0 | HUD, Sổ Tay, World Map và Continue thống nhất qua nhận, chọn, hoàn tất nhiệm vụ. Chọn quest muộn trong Sổ Tay giữ nguyên quyền mở vùng. [Báo cáo](V153_B04CG_P0_REPORT.md). |
| LEG-R8-14 | CLOSED-VERIFIED local | Chỉ mở F9 đã latch lượt Dev, Save QA tách khóa, mock SDK xác minh chặn sau await và luồng gửi điểm sạch. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md). |

| Hàng chờ | Chủ sở hữu để tiếp tục |
|---|---|
| BUG-021/022/029, phần map của BUG-033 | 04B1 đã chốt kết quả theo hàng trên. Phần layout/Map UI và chiều khóa theo tiến trình giữ đúng nhóm sở hữu. |
| BUG-048, BUG-049 | Hai bụi cần Owner định danh; rà thêm tương tác/despawn ở các vùng chưa thử. [Báo cáo 04B2](V153_B04B2_WORLD_ART_LAYOUT_REPORT.md). |
| BUG-025, phần logic BUG-038–043 | 04C-G và 04E1. |
| BUG-023/026/027 | 04D. Chưa có nghiệm thu thiết bị đối với chớp, audio lửa trại hoặc ambience. |
| BUG-028/030/033/035/036, phần UI BUG-037–043 | 04E1. |
| LEG-R8-03 và phần frame BUG-032 | Registry CLOSED-VERIFIED local tại 04C-K1. Hoạt ảnh combat và Hurt/Death chuyển K2/K3 theo ma trận. |
| Các mã LEG-R8 khác | Kế thừa từng trạng thái và owner trong INDEX R10. |
