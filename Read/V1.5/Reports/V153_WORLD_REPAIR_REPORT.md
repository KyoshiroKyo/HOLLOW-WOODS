# V153-BATCH-03-R2 — Bellhollow, camera và collider

**CLOUD-FIX-04A / CLOUD-FIX-02A / CLOUD-FIX-01A · PARTIAL · 20/11/2026**

Fixture schema 3 dùng Continue đến (570, 492) để gặp Neris (570, 460). Camera zoom 2,2 nhìn từ x≈279 trong khi nền Bellhollow bắt đầu x=480. Vùng tối nằm ngoài lớp nền đã dựng và xuất hiện cả khi chưa mở thoại. Camera của làng giờ dùng bounds Bellhollow có sẵn. Physics world, zoom và dữ liệu bản đồ giữ giới hạn hiện hành. [Trước](Visuals/V153_BATCH_03/r2-neris-world-before.png) · [Sau](Visuals/V153_BATCH_03/r2-neris-world-after.png) · [Bounds camera](../../../src/scenes/GameScene.ts).

F9 xác nhận các collider tạo bằng hộp tĩnh đều nhận 32×32 từ texture mặc định sau khi Phaser làm mới static group. Đã đặt kích thước hiển thị của đối tượng vô hình theo footprint đã khai báo trước khi đồng bộ body. Nhà Neris trở về 130×30, bàn thuốc trái 24×10 và Cổng Đông 16×76. Cổng Đông tiếp tục bật collider trong fixture chưa mở khóa. [F9 trước](Visuals/V153_BATCH_03/r2-neris-f9-before.png) · [F9 sau](Visuals/V153_BATCH_03/r2-neris-f9-after.png) · [Tạo collider](../../../src/world/WorldBuilder.ts).

Dùng W đi từ (541, 481) tới (541, 448) ở ngách nhà Neris. Hộp chân 18×12 dừng đúng mép nam của thân nhà tại y=430. Dùng D tại lối hợp lệ y=232 từ Fog Crossing (427, 232) chuyển sang Bellhollow (489,33; 232). Y=190 bị giới hạn bởi ranh Biên Tây Bắc đã khai báo, nên chọn phía nam trạm gác theo đường thật. Các lượt này dùng fixture để đặt điểm xuất phát và đi bằng input thật. TypeScript và Git diff đạt.

Kiểm tra Cổng Đông bằng hai fixture schema 3 ở (1450, 280). Dừng ở x=1468 với cờ va chạm phải khi cổng khóa. Sau khi Continue fixture đã có cờ mở cổng, collider 16×76 tắt, đi D qua Crooked Path và A quay về Bellhollow. Từ (1210, 514) đi S sang Outer Woods ở (1210; 574,92). Các lượt này dùng đường và cổng thật với tiến trình thiết lập sẵn trong profile QA. Chromium ghi 0 lỗi JavaScript, HTTP và network trong lượt kiểm tra.

Fixture bắt đầu tại Bellhollow (653, 514) cũng qua được lối nam tới Sanctuary Farm ở x=653, y≈571. Đi thêm về phía nam, chờ cooldown chuyển vùng và đi W về Bellhollow ở x=653, y≈541. Trace khớp hai portal vào và ra nông trại. Cổng Đông vẫn khóa trong lượt này.

Còn lượt chơi mới xuyên suốt bằng tiến độ nhiệm vụ thật, các lượt tương tác crafting và farming tại bản đồ, các vùng sâu và vị trí cây, hàng rào, Y-sorting trên các tuyến chưa đi.
