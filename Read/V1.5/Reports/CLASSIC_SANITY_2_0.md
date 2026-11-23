# Classic Sanity 2.0

## Triển khai

`UIScene.updatePanicVignette()` lấy năm dải viền, màu `0x120b18`, `0x240d24`, `0x3d0b16` và công thức opacity từ `cc40bed060b8`. Dưới Sanity 30, hàm vẽ đúng bốn tam giác cạnh chéo màu `0x0e0513`, với cạnh tăng từ 70 lên 240 px. Bề dày các dải giữ ở 14, 20, 26, 32 và 38 px. Dải sâu nhất có hệ số opacity 0,15, tương đương 6% ở Sanity 0 với Standard và Light Motion tắt.

Opacity nội suy trong hai điểm Sanity đầu sau mỗi ngưỡng để tránh bật đột ngột. Khi Light Motion bật, nhịp vignette ở khoảng 0,35 Hz với nửa biên độ V15-06. Reduced Motion và Light Motion tắt giữ vignette tĩnh ở một mức Sanity cố định. Panic Effects tắt xóa cả lớp trang trí lẫn cảnh báo đỏ khi trúng đòn nếu đang hiện. Cảnh báo HUD, điều kiện vùng an toàn và ngưỡng riêng của boss vẫn dùng quy tắc hiện hành.

Bản vá `558f155` tiếp tục loại phần vẽ trùng trong VeilSystem và dao động Fog of War tần số cao. Fog of War vẫn dùng hệ số tuyến tính từ 1,0 ở Sanity 50 đến 0,45 ở Sanity 0. Mã camera, sprite, texture filtering, animation, gameplay và schema lưu giữ nguyên.

## Kiểm thử

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript và Vite production | Thành công |
| BUG-023 | 15/15. Bước thay đổi bán kính FOW lớn nhất đo được là 0,34 px, không có bước nhảy bất thường |
| Sanity Atmosphere | 25/25 |
| Reduced Motion | 12/12 |
| Ma trận hình ảnh | 64/64 tổ hợp của tám mức Sanity với ngày/đêm, đèn bật/tắt và Rừng Ngoại Vi/Bellhollow |
| Lưu → tải lại trang → Tiếp tục | Đã nạp save và giữ đúng cả bốn tùy chọn |
| FPS trước và sau | Trung vị 10,67 và 10,67 FPS qua ba mẫu 1,5 giây cho mỗi bản, ở cùng cảnh và cài đặt Chromium headless/SwiftShader |

So sánh ảnh ở Rừng Ngoại Vi, tọa độ `(1200, 600)`, camera zoom `2.2×`, 1280×720, đồ họa High, ban đêm, tắt đèn và Sanity 0. Bốn góc thấy rõ và phần giữa đủ sáng để đọc HUD, nhìn nhân vật và đường đi. Đường ghép texture nền vẫn có thể nhìn thấy ở vị trí này.

- [V15-06 từ Git](../../../Backups/steps/restore-original-v1506-verification/V15-06-cc40bed-night-sanity-0.png)
- [Trước Classic Sanity 2.0](../../../Backups/steps/backup_classic_sanity_2_0/before-outer_woods-night-light-0-sanity-0.png)
- [Classic Sanity 2.0](../../../Backups/steps/backup_classic_sanity_2_0/classic-sanity-2-outer_woods-night-light-0-sanity-0.png)
- [Diff từ worktree trước Classic Sanity 2.0](../../../Backups/steps/backup_classic_sanity_2_0/classic-sanity-2.0.patch)
- [Kết quả ma trận và kiểm tra tùy chọn](../../../Backups/steps/backup_classic_sanity_2_0/classic-sanity-2-acceptance.json)

## Giới hạn

Kiểm thử dùng chế độ local của P2Game. Số FPS chỉ so sánh hai bản trong môi trường đồ họa phần mềm, chưa đại diện cho máy người chơi. Screen Flash OFF đã chặn camera flash của đường chạy Sanity. Phân cảnh kết thúc vẫn có hai lệnh flash trực tiếp từ trước và nằm ngoài phạm vi thay đổi. Hai lỗi sprite khi bắt đầu chạy và độ nét giữa chạy với đứng yên cũng nằm ngoài phạm vi.
