# HW-CODEX-01B · Directional Artwork Validation

**PARTIAL về đồng nhất mỹ thuật · Chờ Owner duyệt · 27/11/2026**

Baseline nghệ thuật đã được Owner duyệt tại `7a553919bc70ea25052ecf2246321c1c0792274e`. Baseline làm việc sau đồng bộ là `c6b4cd95722d69ec4d4ad036a4bd8f0a0709e0c5`, mang Runtime Competition Preview `35317c0ef397edb8da3ce7471a18e5b87cada6a9`. Bộ South R1 giữ nguyên sáu frame. [So sánh bốn hướng](FOUR_DIRECTION_COMPARISON.png) · [So sánh Conversion Run](CONVERSION_RUN_COMPARISON.png)

| Hướng | Keyframe mới | Chiều cao | Texel đục | Đánh giá Codex |
|---|---:|---:|---:|---|
| South R1 | 0 | 37–40 px | 736–757 | Chuẩn đã duyệt |
| North | 3 | 41–43 px | 837–846 | Mũ sau và cape đọc rõ, kiếm ở tay phải. Silhouette lớn hơn 01A-R1 |
| West | 3 | 34–36 px | 589–594 | Kiếm kéo về trái, giáp vai và cape đọc đúng hướng. Dáng đọc thấp hơn South |
| East | 3 | 33–34 px | 550–560 | Được dựng độc lập, cape về trái, tay xa bị che một phần. Kích thước đọc nhỏ nhất |

[Contact sheet](KEYFRAME_CONTACT_SHEET.png) · [Số đo](FRAME_METRICS.json)

**PASS tự động** · 9 keyframe riêng, 3 ô 84×72 cho mỗi hướng trong sheet RGBA 252×72. Tất cả dùng pivot (0.5, 0.875), điểm neo (42, 63), hàng chân thấp nhất Y=62, alpha 0/255 và không có texel viền cyan theo phép dò. Ba pha mỗi hướng lấy plume, mép cape và chi tiết sáng vai từ từng pose nguồn. Thân, chân và vũ khí dùng pose trung tính của chính hướng đó để giữ ổn định. West và East được tạo từ các output khác nhau, theo Conversion Run tương ứng.

**PARTIAL qua đánh giá hình** · Nhận diện và hướng được giữ đủ để review. Độ chênh chiều cao và độ chi tiết làm West/East đọc nhỏ hơn South, trong khi North đọc to hơn khi đứng cùng camera 2.2 và scale 1.15. Tôi giữ nguyên kích thước pixel thu được để không che chênh lệch. Bảng contact là preview pha ở 160 ms làm mốc tham chiếu. Gameplay và animation hoàn chỉnh chưa được kiểm. Owner approval **PENDING**.

**Đề xuất** · Review nhận diện/handedness trước, sau đó tinh chỉnh tương quan kích thước của ba hướng nếu Owner thấy cần. BUG-059 vẫn mở. Đây là checkpoint artwork riêng, chưa tích hợp runtime. HW-WDN-T01 và CHAR-006 Integration tiếp tục HOLD.

[Provenance và quyền sử dụng](PROVENANCE_AND_ARCHIVE.md) · [Manifest](SHA256SUMS.txt)
