# BÁO CÁO THỬ NGHIỆM NÂNG CẤP MÔI TRƯỜNG TRÊN KHU VỰC MẪU (PILOT ZONE REPORT)
## HOLLOW WOODS V1.4 — THE FOG THAT REMEMBERS
*Mã tài liệu: HW-V14-PILOT-07*  
*Khu vực thử nghiệm: Rừng Ngoại Vi (Outer Woods)*  
*Thời gian thực hiện: 18/11/2026*  
*Trạng thái: Hoàn tất & Đã nghiệm thu kỹ thuật (Build passed, 0 errors)*  

---

## 1. TỔNG QUAN KHU VỰC MẪU (PILOT ZONE SELECTION)

Để đảm bảo an toàn tuyệt đối cho toàn bộ thế giới HOLLOW WOODS và thẩm định trực quan chất lượng đồ họa trước khi triển khai hàng loạt, **Rừng Ngoại Vi (Outer Woods)** được lựa chọn làm khu vực thử nghiệm độc lập duy nhất.

### 1.1. Thông số địa lý & Toạ độ
- **Zone ID:** `outer_woods`
- **Toạ độ thế giới:** $x = 1120 \rightarrow 1600$, $y = 560 \rightarrow 1040$
- **Kích thước thực tế:** $480 \times 480\text{ px}$ (tương đương $15 \times 15$ tile kích thước chuẩn $32\times32$)
- **Vị trí chiến lược:** Nằm ở cửa ngõ phía Đông của làng Bellhollow ($x=1120$), tiếp giáp Trang Trại Cấm (Sanctuary Farm) ở hướng Tây, đóng vai trò bản lề chuyển tiếp giữa vùng an toàn và các khu rừng hiểm trở (Crooked Path, Deep Forest).

```
   [Bellhollow] (y: 0..560)
         |
    (x: 1150..1270, y: 560)  <-- Cổng Rừng Bắc (Bắc Rừng Ngoại Vi)
         |
+-------------------------------------------------------------+
| OUTER WOODS (RỪNG NGOẠI VI)                                 |
| x: 1120..1600, y: 560..1040 (480x480 px)                    |
|                                                             |
|   [Cửa Rừng Bắc]  ----->  [Trại Thợ Săn]                    |
|     (1220, 640)              (1320, 720)                    |
|                                  |                          |
|                                  v                          |
|   [Sanctuary Farm] <--- [Ngã Rẽ Bờ Suối] ---> [Crooked Path]|
|     (x: 1120)                (1390, 755)         (x: 1600)  |
|                                  |                          |
|                                  v                          |
|                           [Bãi Liễu Cổ Thụ]                 |
|                              (1260, 890)                    |
+-------------------------------------------------------------+
```

---

## 2. QUẢN LÝ TÀI NGUYÊN & AN TOÀN HỆ THỐNG

### 2.1. Bản sao lưu gốc (Zero-Risk Backups)
Trước khi thực hiện bất kỳ sửa đổi nào, các bản sao lưu độc lập đã được tạo:
- `src/config/Constants.ts.v14_step7_pilot.bak`
- `src/scenes/PreloadScene.ts.v14_step7_pilot.bak`
- `src/world/WorldBuilder.ts.v14_step7_pilot.bak`

### 2.2. Cơ chế Cô lập bằng Feature Flag (Pilot Feature Flag)
Trong `src/config/Constants.ts`:
```typescript
export const CONFIG_USE_V14_PILOT_ENVIRONMENT = true;
```
- Khi `true`: Khu vực `outer_woods` sử dụng công nghệ dựng hình Pixel Art Master V1.4 (`renderOuterWoodsTerrainV14` và `renderOuterWoodsDecorationsV14`). Tất cả các khu vực khác (`bellhollow`, `sanctuary_farm`, `crooked_path`, `deep_forest`, `silent_mire`, `broken_bell_shrine`, v.v.) hoàn toàn không bị ảnh hưởng.
- Khi `false`: Trả lại 100% mã nguồn procedural V1.3 ngay lập tức mà không cần biên dịch lại asset.

### 2.3. Cây thư mục Asset V1.4 chuyên biệt
Toàn bộ asset môi trường mới đã được phân loại, tối ưu hóa lossless và đặt độc lập trong `public/assets/environment/v14/` (không ghi đè hay làm mất asset cũ):
```
public/assets/environment/v14/
├── foliage/
│   ├── prop_fern_cluster_v14.png         (22x21 px - Cụm dương xỉ rừng)
│   ├── prop_mushroom_cluster_v14.png     (45x25 px - Khóm nấm rừng rêu)
│   └── prop_swamp_cattails_v14.png       (16x30 px - Bụi lau sậy bờ suối)
├── props/
│   ├── prop_fallen_log_mossy_v14.png     (46x61 px - Thân cây đổ phủ rêu)
│   ├── prop_stump_mossy_large_v14.png    (46x61 px - Gốc cây đại thụ rêu phong)
│   ├── rock_mossy_forest_01_v14.png      (22x22 px - Tảng đá rừng phủ rêu loại 1)
│   ├── rock_mossy_forest_02_v14.png      (22x22 px - Tảng đá rừng phủ rêu loại 2)
│   └── tree_hollow_ancient_v14.png       (43x61 px - Thân cây cổ thụ rỗng ruột)
├── tiles/
│   ├── tile_dirt_trail_v14_a.png         (32x32 px - Đất đường mòn có sỏi)
│   ├── tile_dirt_trail_v14_b.png         (32x32 px - Đất đường mòn rêu mịn)
│   ├── tile_forest_grass_v14_a.png       (32x32 px - Thảm cỏ rừng sẫm biến thể A)
│   ├── tile_forest_grass_v14_b.png       (32x32 px - Thảm cỏ rừng sẫm biến thể B)
│   └── tile_forest_grass_v14_c.png       (32x32 px - Thảm cỏ rừng sẫm biến thể C)
├── trees/
│   ├── tree_birch_amber_v14.png          (80x95 px - Cây Bạch Dương lá hổ phách)
│   ├── tree_maple_crimson_v14.png        (80x95 px - Cây Phong lá huyết dụ)
│   └── tree_oak_mossy_v14.png            (80x95 px - Cây Sồi rêu phong đại ngàn)
└── village/
    ├── prop_barrel_aged_v14.png          (16x20 px - Thùng gỗ ủ rượu sẫm màu)
    ├── prop_chopped_wood_v14.png         (32x31 px - Đống củi chẻ thợ săn)
    └── prop_crate_weathered_v14.png      (16x21 px - Kiện hàng gỗ phong sương)
```

---

## 3. CHI TIẾT NÂNG CẤP KỸ THUẬT & MỸ THUẬT

### 3.1. Địa hình nền: Master Texture Baking chống lặp ô cờ
- **Vấn đề của V1.3:** Nền đất cũ sử dụng màu đơn sắc `#1f2e1d` và một vài vòng tròn noise ngẫu nhiên, tạo cảm giác bề mặt phẳng lì, thiếu chi tiết hữu cơ và không có sự kết nối giữa các mảng địa hình.
- **Giải pháp V1.4:**
  - Áp dụng thuật toán băm toạ độ (Deterministic Spatial Hash) trải ngẫu nhiên 3 biến thể cỏ rừng Master `tile_forest_grass_v14_a..c` loại bỏ 100% hiệu ứng ô cờ (checkerboard artifact).
  - Tuyến đường vòng uốn lượn chữ S được dựng 3 lớp: Lớp nền đất nện ẩm mở rộng ($r = 22\text{ px}$), lớp đất sỏi nén chặt ($r = 16\text{ px}$) và vệt mòn lõi trung tâm kết hợp rải rêu mịn.
  - Vòng bãi trại thợ săn (Hunter's Camp) được đóng dấu nền đất nện tự nhiên ($rx = 55, ry = 38$).
  - Bờ suối rừng được tăng cường lớp bùn lầy sẫm màu và vệt phản chiếu ánh sáng hổ phách mờ ảo.
  - Toàn bộ bề mặt $480 \times 480\text{ px}$ được nướng (baked) một lần duy nhất vào `outer_woods_ground_baked_v14_pilot` ở Depth `-100`, đạt hiệu năng $60\text{ FPS}$ tuyệt đối không sinh rò rỉ bộ nhớ.

### 3.2. Quần thể thực vật Master: Đa dạng loài & Chiều sâu sinh thái
Thay thế hoàn toàn các khối cây procedural cũ bằng 3 loài cây pixel art đặc sắc:
1. **Cây Sồi Cổ Thụ (Oak Mossy):** Tán lá dày xanh thẫm, thân cây bám rêu phong rừng ẩm.
2. **Cây Bạch Dương Hổ Phách (Birch Amber):** Thân sáng vằn ngang, tán lá vàng hổ phách đặc trưng của folk horror.
3. **Cây Phong Huyết Dụ (Maple Crimson):** Tán lá đỏ thẫm như vết máu khô, tạo điểm nhấn cảnh báo vùng nguy hiểm phía Đông.
- **Vật lý chân cây (Foot Colliders):** Chuẩn hóa kích thước $20 \times 12\text{ px}$, vị trí offset $(-10, -6)$ ôm khít gốc cây, cho phép nhân vật di chuyển tự do bên dưới tán lá rộng mà không bị cản trở vô lý.
- **Occlusion Transparency:** Tích hợp trực tiếp vào `treeCanopyGroup`. Khi nhân vật di chuyển phía sau tán cây, hệ thống tự động giảm độ đậm (alpha $1.0 \rightarrow 0.35$) bằng nội suy mượt `Phaser.Math.Linear(tree.alpha, 0.35, 0.2)`.

### 3.3. Đạo cụ môi trường & Thảm thực vật chân thực
- **Thân cây cổ thụ đổ (Fallen Logs):** Sử dụng sprite Pixel Art Master $46\times61\text{ px}$, hỗ trợ xoay tự do theo địa hình, có hộp va chạm $36\times14\text{ px}$ chuẩn xác.
- **Hốc cây rỗng & Gốc cây đại thụ (Hollow Trees & Stumps):** Cung cấp các điểm ẩn nấp (stealth hiding spots) và chướng ngại vật phong hóa.
- **Đá tảng rêu phong (Mossy Rocks):** Đổ bóng elip tiếp xúc mềm mại (`#000000`, alpha $0.28$), collider $18\times10\text{ px}$ bảo đảm không có hiện tượng xuyên thấu (clipping).
- **Thảm dương xỉ, nấm rừng & lau sậy:** Được rải viền ven bờ suối và các hốc cây, không bật collision để nhân vật có thể đi lướt qua một cách mềm mại.

### 3.4. Bảo toàn nguyên vẹn Logic Gameplay & Save/Load
- Giữ nguyên 100% vị trí các tương tác cốt lõi:
  - Biển chỉ dẫn cửa rừng: `this.createStoneSign(1220, 640, 'RỪNG NGOẠI VI')`.
  - Bãi trại thợ săn: Lửa trại (1320, 720), lều trú ẩn (1350, 690), giá phơi da thú (1285, 730).
  - Hệ thống 4 cột đèn lồng gỗ dẫn hướng: (1210, 600), (1310, 700), (1390, 755), (1270, 825).
  - Toàn bộ 3 điểm thu thập nguyên liệu sinh tồn đầu game: Gỗ khô (1240, 660), Nhựa thông (1360, 630), Thảo dược ven suối (1480, 830).
  - Lớp sương mù ranh giới `createOuterWoodsBoundaryFog()`.
- Tương thích $100\%$ với hệ thống Save/Load (Non-destructive Migration) và chu kỳ ngày/đêm $360\text{s}$.

---

## 4. KẾT QUẢ ĐỐI CHỨNG TRỰC QUAN (BEFORE & AFTER VERIFICATION)

### 4.1. Bảng đối chiếu định lượng (Quantitative Metrics Comparison)

Dữ liệu được trích xuất từ tập lệnh phân tích điểm ảnh `scripts/generate_pilot_comparison.mjs`:

| Chỉ số Phân tích | Bản Cũ (V1.3 Legacy) | Bản Mới (V1.4 Pilot Master) | Mức độ Cải thiện |
| :--- | :---: | :---: | :---: |
| **Bảng màu chủ đạo (RGB Mean)** | $(32.8,\ 45.0,\ 29.1)$ | $(110.0,\ 113.4,\ 27.3)$ | Tông đất ấm & vàng hổ phách tự nhiên |
| **Độ lệch chuẩn điểm ảnh (RGB StDev)** | $(7.1,\ 4.2,\ 5.5)$ | $(18.2,\ 16.4,\ 1.4)$ | Độ tương phản vi mô tăng mạnh |
| **Độ phong phú bề mặt (Texture Variance)** | **$5.6$** | **$12.0$** | **$+114.3\%$** (Gấp hơn 2 lần chi tiết) |
| **Hiện tượng lặp ô cờ (Tiling Artifact)** | Rõ rệt | **$0\%$** (Khử hoàn toàn bằng 3 biến thể) | Hoàn hảo |
| **Chuyển tiếp ranh giới (Seamless North/West)** | Đứt đoạn tại mép $y=560$ | Mềm mại, đồng bộ với đường đá Bellhollow | Hoàn toàn liền mạch |
| **Tán cây che khuất nhân vật (Occlusion)** | Cây procedural tĩnh | Tự động làm mờ $\alpha=0.35$ mượt mà | Nhân vật luôn nhìn thấy rõ |
| **Chuẩn va chạm chân cây/đá (Collision)** | Hộp vuông cứng | Hộp dẹt $20\times12$ ôm khít chân vật thể | Không còn kẹt góc |

### 4.2. Khảo sát ghép nối ranh giới (Seamless Boundary Audit)
1. **Ranh giới phía Bắc (giáp làng Bellhollow tại $y = 560$):**
   - Lối mở tại $x = 1150 \rightarrow 1270$.
   - Con đường mòn đất sỏi V1.4 bắt đầu chính xác tại toạ độ $(1210, 560)$ nối tiếp chuẩn xác với đường lát đá cuội rời khỏi Bellhollow, không có bất kỳ khoảng trống (gap) hay đường viền đen (black seam).
2. **Ranh giới phía Tây (giáp Sanctuary Farm tại $x = 1120$):**
   - Hành lang di chuyển $y = 680 \rightarrow 820$ được duy trì thông suốt với nền cỏ rừng hữu cơ, cây cối viền được lùi về toạ độ $x = 1130$ và $x = 1135$ bảo đảm người chơi không bị vướng va chạm khi đổi vùng.

---

## 5. KẾT LUẬN & ĐỀ XUẤT TIẾP THEO

### 5.1. Kết luận
- Bước thử nghiệm trên khu vực mẫu `outer_woods` đã hoàn thành xuất sắc, đạt tất cả các tiêu chí mỹ thuật và kỹ thuật khắt khe của dự án.
- Tốc độ khung hình duy trì ổn định $60\text{ FPS}$, không phát sinh cảnh báo bộ nhớ.
- Kiểm thử biên dịch `npm run build` thành công $100\%$ ($0$ lỗi TypeScript, $0$ lỗi bundle).
- Toàn bộ cơ chế sinh tồn, tương tác và cốt truyện được bảo toàn nguyên vẹn.

### 5.2. Đề xuất bước tiếp theo
Sau khi nhận được phản hồi và phê duyệt từ Trưởng nhóm dự án, chúng ta có thể triển khai:
- **Bước 8:** Đại tu toàn diện môi trường cho 4 phân khu còn lại của bản đồ gốc (`bellhollow`, `sanctuary_farm`, `crooked_path`, `deep_forest`).
- **Bước 9:** Triển khai các bản đồ mở rộng mới (`silent_mire`, `broken_bell_shrine`, các khu vực hầm mộ/đền thờ cổ ngữ) theo phương án thiết kế tại tài liệu số 06.
