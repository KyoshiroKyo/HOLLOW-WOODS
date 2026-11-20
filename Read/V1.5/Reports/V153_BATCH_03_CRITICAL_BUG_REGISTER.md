# V153-BATCH-03-R2 — Sổ lỗi nghiêm trọng

**20/11/2026 · Source đích V1.5.3 · package thử nghiệm 1.5.2**

| ID | Mức | Lỗi và chẩn đoán | Trạng thái và bằng chứng |
|---|---|---|---|
| CLOUD-P2-FIX-01 → 05 | P0 | SDK tải đồng bộ chặn parser và một Promise init treo giữ canvas đen. | Production local PASS ở root, subpath, iframe và Canvas fallback. Hosted BLOCKED vì thiếu build/log công khai. [Báo cáo](V153_P2GAME_BLACK_SCREEN_REPORT.md). |
| CLOUD-FIX-04A / 02A | P0/P1 | Phaser refresh đưa collider tĩnh về kích thước texture mặc định 32×32. | PARTIAL. Kích thước thiết kế được giữ qua refresh. F9 xác nhận các thân nhà, bàn thuốc và cổng. Đã đi từ Fog Crossing qua lối y=232, cạnh nhà Neris, qua Cổng Đông tới Crooked Path và trở về. Cổng khóa vẫn chặn đúng. Đã qua được hai chiều Bellhollow ↔ Sanctuary Farm. [Báo cáo](V153_WORLD_REPAIR_REPORT.md). |
| CLOUD-FIX-01A | P1 | Camera x≈279 nhìn ra trái nền Bellhollow bắt đầu tại x=480. | Lỗi vùng tối gần Neris đã xác nhận và sửa trong fixture. Camera sau sửa x=480, zoom 2,2. Còn QA liên vùng. [Trước](Visuals/V153_BATCH_03/r2-neris-world-before.png) · [Sau](Visuals/V153_BATCH_03/r2-neris-world-after.png). |
| CLOUD-02E-R | P0/P1 | J ẩn panel mà dialogue vẫn hoạt động. Esc gọi hoàn thành và trao thuốc. Dòng 427 ký tự chạm phần hướng dẫn tiếp tục. | Đã sửa khóa modal và tuần tự đóng hội thoại. Chromium qua E/Esc và mở lại ở Neris, Garth, Edda. E tiến đến lựa chọn và Neris trao thuốc đúng một lần. [Trước](Visuals/V153_BATCH_03/r2-neris-dialogue-before.png) · [Sau](Visuals/V153_BATCH_03/r2-neris-dialogue-after.png). |
| CLOUD-02F / CLOUD-FIX-10 | P0/P1 | Khi Tạm dừng mở, GameScene xóa yêu cầu Esc trước khi đọc. | Production local PASS hai vòng mở/đóng bằng Esc ở root và một vòng trong iframe. Thiết kế Pause/Settings còn PARTIAL. [UI](V153_UI_UX_REPORT.md). |
| CLOUD-02G-R | P1 | La Bàn vẫn hiện lúc HUD ẩn. Khung tên thừa ảnh hưởng việc đọc chữ khi camera zoom 2,2. | La Bàn và HUD hiện/ẩn nhất quán tại Neris. Kích thước badge Neris quy đổi 246 → 112 px. Giới hạn số dòng preview nhiệm vụ. Còn lượt modal/responsive toàn game. |
| CLOUD-FIX-09 | P0 | Cloud normalizer loại schema, vũ khí và dữ liệu tiến trình. SaveManager bỏ loại cây và trạng thái đất. | LOCAL PASS. Round trip Node và Chromium Continue → Save → Reload → Continue đều đạt trên schema 3. [Checkpoint](V153_BATCH_03_CHECKPOINT.md). |
| CLOUD-CLEAN-03 | P1 | Người chơi báo rè/rít. | NOT REPRODUCED trong phép đo đổi ramp 48 kHz và kiểm tra bốn file ambience. AudioContext mở khóa trên production local. Còn ca âm thanh thiết bị và chuyển vùng kéo dài. |
| B03-P0-RECHECK | P0 | Chơi thử tuyến đầy đủ, kiểm tra không soft lock hoặc mất dữ liệu. | PARTIAL. Các đoạn fixture và phím thật đã có bằng chứng. Còn lượt xuyên suốt bằng tiến trình nhiệm vụ, vật cản trên tuyến chưa đi và hosted. [QA](V153_FINAL_QA_REPORT.md). |
