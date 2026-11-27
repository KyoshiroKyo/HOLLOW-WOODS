# Meliodas Blackwood V2 · BUG-059 Artwork Readiness

**Trạng thái 27/11/2026** · Có đủ clip Idle/Walk hiện hành để chạy game. Thiếu **96 frame thay thế đạt chất lượng Conversion Run** trong phạm vi nguồn đã kiểm. B01 và phần lọc texture của B02 nằm trong baseline B08 `c9de0c21`. [B01](../../V16/HW_V16_B01_BUG058_SCALE_REPORT.md) · [B02](../../V16/HW_V16_B02_BUG059_ARTWORK_REPORT.md)

## Nguồn và đối chiếu

- Kho `Asset_Art/Meliodas_Blackwood` khớp **220/220 SHA-256**, gồm 86 tệp trong `01_LATEST_ARTWORK`. Bản snapshot `02_CURRENT_RUNTIME` khớp bit với toàn bộ 21 tệp nhân vật `black_knight_*` đã đối chiếu trên nhánh Codex. Trong `01_LATEST_ARTWORK`, 9 PNG atlas và 1 PNG portrait khớp SHA-256 runtime. K1 Armed Idle có trong snapshot và bản legacy, với PNG runtime khớp bản K1 legacy. [Đối chiếu tệp và frame](Evidence/08_meliodas_artwork_audit.json)
- Phép sàng lọc gồm 585 đường dẫn ứng viên và tham chiếu từ kho Meliodas, export và các vị trí liên quan trong inventory. Có 47 đường dẫn sheet Idle/Walk và 17 descriptor có frame Idle/Walk bốn hướng. Các descriptor phù hợp đều dùng ô 64×64 và có 0 tên Idle/Walk theo mẫu Conversion. Bốn sheet Idle/Walk `meliodas_*_4dir.png` đều là lưới 384×256, 6 cột × 4 hàng, mỗi ô 64×64. Các preview GIF, gameplay GIF và contact sheet dùng để đối chiếu hình thức. Ba sheet trung gian `armed_walk.png`, `right_runs.png` và `unarmed_idle.png` được báo cáo archive ghi là chưa xuất từ Cloud. ZIP vẫn đóng. [Báo cáo archive](../../HW_ART_REF_02_MELODIAS_LATEST_ASSET_ARCHIVE_REPORT.md) · [Danh sách ứng viên và số đo](Evidence/08_meliodas_artwork_audit.json)

## Ma trận thiếu

Mỗi ô gồm sáu frame cần bàn giao, chỉ số `0..5` theo nhịp của clip. Cộng 4 clip × 4 hướng × 6 frame = **96**. Tất cả slot tương ứng đã có artwork 64×64 trong runtime. Mỗi slot dưới đây cần artwork mới đạt yêu cầu B02.

| Mẫu tên đề xuất | Down | Up | Left | Right | Tổng thiếu |
|---|---:|---:|---:|---:|---:|
| `armed_idle_sequence_{dir}_{0..5}` | 6 | 6 | 6 | 6 | 24 |
| `unarmed_idle_sequence_{dir}_{0..5}` | 6 | 6 | 6 | 6 | 24 |
| `armed_walk_sequence_{dir}_{0..5}` | 6 | 6 | 6 | 6 | 24 |
| `unarmed_walk_sequence_{dir}_{0..5}` | 6 | 6 | 6 | 6 | 24 |

## Mapping và đo trực tiếp

Kích thước thân hình đo theo vùng alpha khác 0, bao gồm plume/áo choàng/vũ khí. Các khoảng dưới đây là min–max từng frame trên atlas ở baseline, còn B02 dùng số tổng hợp theo nhóm. Cả 192 frame đo được đều có alpha nhị phân. Tên `satyr_*` tiếp tục là alias của `wayfarer_*`. [Số đo chi tiết](Evidence/08_meliodas_artwork_audit.json) · [Registry](../../../../../src/animation/BlackKnightAnimations.ts)

| Clip | Texture đang dùng | Ô | Chiều cao alpha / texel đục | Scale | Chiều cao trong world |
|---|---|---|---|---|---|
| Armed Idle | `black_knight_armed_idle` Down/Up/Left, `black_knight_movement` Right | 64×64 | 28–32 px / 329–495 | 1.50 | 42–48 px |
| Unarmed Idle | `black_knight_movement` | 64×64 | 31–32 px / 306–424 | 1.50 | 46.5–48 px |
| Armed Walk | `black_knight_movement` | 64×64 | 30–32 px / 357–436 | 1.50 | 45–48 px |
| Unarmed Walk | `black_knight_movement` | 64×64 | 31–32 px / 299–429 | 1.50 | 46.5–48 px |
| Armed Run | `black_knight_conversion_motion`, 12 frame/hướng | 84×72 | 34–43 px / 592–758 | 1.14 | 38.76–49.02 px |
| Unarmed Run | `black_knight_conversion_motion`, 12 frame/hướng | 84×72 | 38–50 px / 658–948 | 0.99 ở frame 0–5, 1.11 ở frame 6–11 | 41.58–49.95 px |

Idle/Walk dùng origin runtime `(0.5, 1.0)` với ô 64×64. Conversion Run khai báo pivot `(0.5, 0.875)`, tương ứng hàng Y=63 theo hệ tọa độ ô 72 px. Sau khi Phaser đổi frame, lớp player đồng bộ chân với collider `18×12`. Baseline dùng zoom 2.2, Idle 160 ms/frame, Walk 170 ms/frame và mỗi vòng Run 840 ms. Chênh lệch texel giữa các clip vẫn tồn tại dưới NEAREST. [B01](../../V16/HW_V16_B01_BUG058_SCALE_REPORT.md) · [B02](../../V16/HW_V16_B02_BUG059_ARTWORK_REPORT.md)

## Tiêu chí nhận bộ artwork

Nhận PNG RGBA với ô 80×72 hoặc 84×72, pivot `(0.5, 0.875)`, nền trong suốt và biên alpha cứng. Dùng vùng hình khoảng 40–44 px chiều cao và khoảng 650–800 texel đục làm dải tham chiếu. Kiểm tra silhouette, giáp, plume, áo choàng, hướng nhìn, trạng thái kiếm và chân theo từng pose. Giữ đúng nhịp Idle/Walk và điểm tiếp đất cạnh Run. Đánh giá scale thực tế quanh 1.05–1.15 theo màn hình so sánh và collider để giữ kết quả B01. Kèm bảng provenance, quyền sử dụng, sơ đồ hàng/cột và danh sách 96 frame để Owner nghiệm thu trước tích hợp. [Đề xuất nhiệm vụ](05_CODEX_FIRST_DEVELOPMENT_TASK.md)
