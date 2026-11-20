# V153-BATCH-03 — UI và Main Menu

**CLOUD-02A-R · LOCAL PASS · 20/11/2026**

Đã bỏ giãn chữ rộng của dòng tiếng Anh, thêm phụ đề **DỊ CẢNH RỪNG SƯƠNG** và giữ hai dòng tách rời các nút. Biên alpha trên, phải và dưới của atlas Black Knight được chuyển tiếp dài hơn để lớp artwork hòa với nền forest. Đối chiếu pixel xác nhận RGB và kích thước atlas và fallback giống Batch 02. Scene dựng phong cảnh núi và sương của artwork Fellor. Campfire và placeholder đã được gỡ khỏi Scene ở Batch 02. [MainMenuScene](../../../src/scenes/MainMenuScene.ts) · [Trước](../../../public/media/screen_v153_01_main_menu.png).

Chromium xác nhận 12 frame thực sự đổi pixel ở 10 fps, ảnh tĩnh xuất hiện khi atlas lỗi giải mã, đủ năm nút, Continue nhận Save, và chuột, mũi tên, Enter, H, Esc hoạt động. Kiểm tra ba viewport cho thấy mép dưới của hai phụ đề nằm trên vạch ngăn. [1280×720](Visuals/V153_BATCH_03/menu-1280.png) · [1600×900](Visuals/V153_BATCH_03/menu-1600.png) · [1920×1080](Visuals/V153_BATCH_03/menu-1920.png) · [Fallback](Visuals/V153_BATCH_03/menu-fallback.png).

**CLOUD-01X · LOCAL PASS.** Portrait mới dùng artwork Fellor và khớp khung hội thoại 64×64. Hai texture key cũ đều đã dùng ảnh mới. [Chân dung trong hội thoại](Visuals/V153_BATCH_03/portrait-dialogue.png).

CLOUD-02A và CLOUD-02B kế thừa kiểm thử cục bộ của Batch 02. [Kết quả Batch 02](V153_BATCH_02_IMPLEMENTATION.md).

## R2 — Hội thoại, NPC, nhiệm vụ và La Bàn

Trước sửa, khung tên Neris rộng 246 px ở camera 2,2×. Sau sửa, ở khoảng cách 78 pixel-world, bảng tên rộng 112 px và nằm trong vùng nhìn. Đến gần, prompt tương tác ghi tên NPC và bảng world-space nhường chỗ. Zoom và camera đứng yên trong lượt mở, đóng thoại. [Bảng tên runtime](Visuals/V153_BATCH_03/r2-neris-nameplate.png).

Dòng thoại tiếng Việt 427 ký tự được thử bằng renderer thật. E tiến đến lựa chọn Neris bằng yêu cầu tương tác từ hàng đợi phím, kể cả lúc update điều khiển nhân vật tạm dừng. Mép dưới nội dung ở y=640,5 và nút tiếp tục bắt đầu ở y=654,5 sau sửa. Hành động J/I/B/N không che hội thoại. Esc dừng đoạn thoại và khôi phục HUD, La Bàn, quick slot và input. Neris, Garth và Edda qua lượt mở, đóng và mở lại. Với Neris, Esc trước khi chọn giữ nguyên tiến trình và trao phần thưởng diễn ra đúng một lần sau khi chọn. [Trước](Visuals/V153_BATCH_03/r2-neris-dialogue-before.png) · [1280×720](Visuals/V153_BATCH_03/r2-neris-responsive-1280.png) · [1600×900](Visuals/V153_BATCH_03/r2-neris-responsive-1600.png) · [1920×1080](Visuals/V153_BATCH_03/r2-neris-responsive-1920.png).

Ba trạng thái nội dung nhiệm vụ đã được đưa qua renderer HUD. Với nội dung dài, văn bản kết thúc ở y=191, đáy panel y=205, La Bàn bắt đầu y=211. Thu gọn và mở panel bằng chuột chạy ở ba viewport. Preview giới hạn hai dòng tiêu đề và sáu dòng chi tiết. Có thể đọc đầy đủ theo nhiệm vụ trong Sổ tay. [UIScene](../../../src/scenes/UIScene.ts).

Esc từng mở được Tạm dừng nhưng không đóng qua đường phím vật lý vì GameScene xóa state trước khi đọc yêu cầu resume. Đã đọc yêu cầu trước khi reset. Chromium production xác nhận hai vòng mở và đóng bằng Esc ở root và một vòng trong iframe.

CLOUD-02C kiểm thử bốn trạng thái Chạy của R1 và trạng thái HUD khi thoát thoại R2. CLOUD-02E-R đạt các ca local nói trên. CLOUD-02, CLOUD-02D, CLOUD-02F và CLOUD-02G còn phần thiết kế hoặc nghiệm thu toàn game. [Bốn trạng thái Chạy](Visuals/V153_BATCH_03/running-hud.png) · [QA](V153_FINAL_QA_REPORT.md).
