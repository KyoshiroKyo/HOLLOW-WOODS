# HW-CODEX-01A-R1 · Báo cáo tinh chỉnh artwork

**Hoàn tất kiểm tra nội bộ · Chờ Owner duyệt artwork · BUG-059 còn mở**

Baseline local và GitHub khi bắt đầu là `fde44d2881510db7332dbb40434e60e2054b919b` trên `feat/v1.6-codex-development`. Phạm vi là sáu frame Armed Idle Down. Giáp vai có viền bậc rõ hơn, mặt trên vai và mũ dùng các cụm sáng nhỏ. Mảng ngực tối hơn và có mặt cắt rõ ở viền trên. Nhìn từ camera 2.2, các mặt giáp ngang dễ đọc hơn. Tư thế Idle vẫn có hai chân trụ và nhìn chính diện hơn pose Run. [Bảng A/B/C](04_ARTWORK_ABC_COMPARISON.png) · [Contact sheet](02_ARMED_IDLE_DOWN_R1_CONTACT_SHEET.png) · [GIF](03_ARMED_IDLE_DOWN_R1_PREVIEW.gif)

| Phép đo | 01A | 01A-R1 | Conversion Run Down |
|---|---:|---:|---:|
| Số frame | 6 | 6 | 12 |
| Kích thước ô | 84×72 | 84×72 | 84×72 |
| Alpha đục/frame | 739–760 | 736–757 | 597–684 |
| Chiều rộng × chiều cao vùng hình | 39–40 × 37–40 px | 39–40 × 37–40 px | 38–45 × 36–41 px |
| Chiều cao phép chiếu tĩnh, camera 2.2 | 93,61–101,20 px | 93,61–101,20 px | 90,29–102,83 px |
| Neo và cạnh dưới | (42,63), pixel thấp nhất Y=62 | (42,63), pixel thấp nhất Y=62 | (42,63), cạnh dưới thay đổi theo pha Run |
| F05 → F00, texel đổi RGBA / alpha | 18 / 4 | 18 / 4 | — |

R1 thay đổi 243 texel mỗi frame, gồm ba texel trong suốt hóa ở viền vai. Toàn bộ bounds ở độ phân giải gốc và khi chiếu tĩnh khớp 01A theo từng frame. Tại các tọa độ F00 đã chỉnh và còn đục, số texel có luma ≥110 giảm từ 20 xuống 9 ở mũ và từ 15 xuống 9 ở vai. Đây là phép đếm vùng sáng trong vùng chỉnh. Đánh giá chất lượng dùng hình đối chiếu với Run. Bốn frame vẫn cao 37–38 px, hai frame cao 40 px. [Số đo đủ 24 frame](05_FRAME_METRICS.json)

## Ma trận nghiệm thu

| ID | Tiêu chí | Kết quả | Căn cứ |
|---|---|---|---|
| ART-01 | Số frame | PASS | 6 ô và 6 SHA-256 RGBA riêng |
| ART-02 | Kích thước | PASS | 84×72, sheet một hàng 504×72 |
| ART-03 | Định dạng | PASS | PNG RGBA 8 bit mỗi kênh |
| ART-04 | Alpha | PASS | 0 texel bán trong suốt ở cả 6 frame |
| ART-05 | Viền cyan | PASS | Dò màu 0 texel nghi cyan và kiểm hình 4× |
| ART-06 | Ground anchor | PASS | (42,63), hàng gót chân Y=62 trên toàn clip |
| ART-07 | Chân | PASS | Tọa độ và hash vùng chân khớp 01A từng frame |
| ART-08 | Tay cầm kiếm | PASS | Landmark (29,51) và hash vùng tay cầm/kiếm khớp 01A |
| ART-09 | Thời gian frame | PASS | Bộ giải mã GIF đọc 160 ms cả 6 frame |
| ART-10 | Thời gian vòng | PASS | 960 ms và lặp vô hạn |
| ART-11 | Điểm lặp | PASS | Đối chiếu GIF và pixel. 18 texel đổi RGBA, 4 đổi alpha, IoU silhouette 99,5% như 01A |
| ART-12 | Giáp vai | PASS · đánh giá Codex | Các cụm sáng nhỏ hơn và gờ góc cạnh hơn |
| ART-13 | Giáp ngực | PASS · đánh giá Codex | Giảm dải sáng tròn quanh cổ, làm rõ mặt giáp tối |
| ART-14 | Mũ và bảng màu | PASS · đánh giá Codex | Cụm thép từ Run, khe chữ T và plume vẫn đọc rõ |
| ART-15 | Góc nhìn | PASS · đánh giá Codex | Mặt trên mũ và vai rõ hơn, tinh chỉnh cục bộ giữ pose Idle |
| ART-16 | Nhận diện | PASS · đánh giá Codex | Giữ giáp đen, plume, kiếm, áo choàng, tư thế và hướng Down |
| ART-17 | Artwork gốc | PASS | 7/7 hash nguồn 01A và hash PNG Conversion khớp |
| ART-18 | Provenance | PASS | Archive local có ảnh nguồn, prompt, script, mapping và checksum |
| ART-19 | Runtime | PASS | 0 tệp runtime, gameplay, camera hoặc asset gốc thay đổi |
| ART-20 | Manifest | PASS | Bảy checksum deliverable R1 và 23 checksum archive local |
| ART-21 | Remote commit | NOT RUN tại lúc lập commit | Xác minh sau push được ghi trong completion report cùng SHA |

Owner visual approval **PENDING**. Kiểm tra gameplay và đọc silhouette trong các zone thật **NOT RUN**. R1 dùng camera 2.2 dưới dạng phép chiếu nearest-neighbor tĩnh. Quy trình dùng một lượt ImageGen và một chỉnh cục bộ trên keyframe. Không gặp quota blocker. [Archive và quyền sử dụng](06_PROVENANCE_AND_ARCHIVE.md) · [Manifest R1](SHA256SUMS.txt)

**Đề xuất Owner chọn `APPROVE ARTWORK PILOT`** nếu diện mạo ở camera 2.2 đạt kỳ vọng. Kết quả đó áp dụng cho chất lượng pilot. Sản xuất 90 frame còn lại và tích hợp runtime là các bước phê duyệt riêng.
