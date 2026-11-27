# HW-CODEX-01B · Review 15 frame Armed Idle

**Chờ Owner duyệt bốn hướng · 27/11/2026**

Bộ review gồm sáu frame South R1 đã duyệt và chín keyframe mới cho North, West và East. Bản kiểm tra này tiếp nối checkpoint khảo sát `b00cc2b6f4d8febbc0c7c8b7c96808325de42040`. Art Authority là R1 `7a553919bc70ea25052ecf2246321c1c0792274e`. Baseline runtime Competition Preview tại `35317c0ef397edb8da3ce7471a18e5b87cada6a9` giữ nguyên. [Bộ review RGBA](ARMED_IDLE_FOUR_DIRECTIONS.png) · [So sánh R1 và Conversion Run](R1_AND_CONVERSION_RUN_COMPARISON.png)

| Hướng | Chiều cao khảo sát | Chiều cao bộ review | Texel đục | Đánh giá Codex |
|---|---:|---:|---:|---|
| South R1 | 37–40 px | 37–40 px | 736–757 | Sáu frame gốc, chuẩn đối chiếu |
| North | 41–43 px | 40 px | 844–875 | Mặt sau của mũ, plume thấp hơn và kiếm ở bên phải màn hình. Cape vẫn cho silhouette rộng hơn các góc cạnh |
| West | 34–36 px | 36–38 px | 701–722 | Cụm giáp và độ lớn gần South hơn, kiếm đưa thấp về trái |
| East | 33–34 px | 35–37 px | 593–609 | Dựng riêng theo East Run. Cán kiếm và phần áo choàng đọc rõ, hai pha thấp hơn đáy dải South 2 px |

Hướng Bắc đã giảm độ vươn dọc. Hai hướng ngang tăng độ chi tiết bằng pixel mới từ artwork chỉnh. Ảnh so sánh dùng camera 2.2 và cùng scale 1.15 cho bốn hướng Idle. Conversion Run dùng scale tham chiếu 1.14. Tỷ lệ được đánh giá từ hình, điểm trụ và phối cảnh, đồng thời xem bounds và texel. Chênh lệch nhỏ ở East và độ rộng áo choàng North là các điểm cần Owner xem. Đây là đánh giá tĩnh và preview pha. Gameplay **NOT RUN**.

## Kiểm chứng và tệp review

- Chín PNG riêng **PASS** về 84×72 RGBA, alpha nhị phân, thanh lọc viền cyan và SHA-256 khác nhau. 15 ô trên sheet 504×288 đúng mapping. Sáu ô South khớp pixel RGBA với Pilot R1.
- Neo (42,63), pivot (0.5,0.875). Hàng chân đục cuối của chín frame ở Y=62. Vùng chân và pixel kiếm hổ phách giữ ổn định qua từng hướng. Các pha thay đổi tư thế đọc qua plume, mép cape và cụm vai.
- Giải mã GIF xác nhận 160 ms/frame, có lặp, alpha khớp sheet ở từng frame. South có sáu frame, các hướng mới có ba frame. [South](Previews/south.gif) · [North](Previews/north.gif) · [West](Previews/west.gif) · [East](Previews/east.gif)
- Bảng contact [1×](CONTACT_SHEET_1X.png) · [2×](CONTACT_SHEET_2X.png) · [4×](CONTACT_SHEET_4X.png) dùng nearest-neighbor. [Frame Metrics](FRAME_METRICS.json) · [Manifest](SHA256SUMS.txt) · [Provenance](PROVENANCE_AND_ARCHIVE.md)

**Đề xuất Owner** · Nghiệm thu nhận diện ba hướng ở bảng cùng scale. Nếu độ lớn East hoặc mép cape North chưa đạt, chỉnh riêng hai vùng này trước khi cho phép mở rộng. Kết quả hiện thuộc review artwork bốn hướng. BUG-059 vẫn mở.
