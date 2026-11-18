# BÁO CÁO MỞ RỘNG MÔI TRƯỜNG TOÀN HỆ THỐNG & KHỞI TẠO BẢN ĐỒ MỚI
## HOLLOW WOODS V1.4 — THE FOG THAT REMEMBERS
*Mã tài liệu: HW-V14-EXP-08*  
*Giai đoạn: Bước 8 — Toàn diện Môi trường Nền & Cấu trúc Bản đồ Mở rộng*  
*Thời gian thực hiện: 18/11/2026*  
*Trạng thái: Hoàn tất & Đã nghiệm thu tự động (Build Passed 100%, 0 Error)*  

---

## 1. TỔNG QUAN NHIỆM VỤ & CHIẾN LƯỢC TRIỂN KHAI

Tiếp nối thành công của khu vực thử nghiệm mẫu (Outer Woods) tại Bước 7, Bước 8 đã mở rộng đồng bộ toàn bộ hệ thống môi trường nền của HOLLOW WOODS theo thiết kế tại `04_environment_replacement_plan.md` và kiến trúc bản đồ Hybrid Open World phân tầng tại `06_world_map_expansion_plan.md`.

### 1.1. Các mục tiêu then chốt đã hoàn thành:
1. **Nâng cấp môi trường nền cho 12 phân khu hiện có:** Thay thế toàn bộ địa hình và đạo cụ procedural cũ bằng asset Pixel Art Master V1.4 (chuẩn kích thước $16\times16$ và $32\times32$, tỉ lệ điểm ảnh 1:1, góc nhìn 3/4 Top-down, bảng màu Dark Woodland).
2. **Khởi tạo và xây dựng cấu trúc 5 phân khu mở rộng mới:** Tạo lập hoàn chỉnh địa hình, vách đá, cổng vòm cổ ngữ, đạo cụ, tài nguyên sinh tồn và các dấu vết cốt truyện/nhật ký bí ẩn.
3. **Thiết lập hệ thống cổng chuyển vùng 2 chiều (Two-Way Transitions):** Đảm bảo chuyển dịch không gian liền mạch, tọa độ spawn an toàn không bị kẹt góc va chạm.
4. **Tuân thủ nghiêm ngặt Ràng buộc Dừng (Gated Constraint):** Hoàn thiện môi trường, địa hình và cấu trúc bản đồ trước; tuyệt đối chưa kích hoạt hệ thống spawn quái vật mới trong 5 phân khu mở rộng để cô lập lỗi.

---

## 2. NÂNG CẤP MÔI TRƯỜNG NỀN CÁC PHÂN KHU HIỆN CÓ (GROUP-BY-GROUP OVERHAUL)

Toàn bộ 12 phân khu hiện có được nâng cấp theo 4 nhóm sắc thái địa hình và ánh sáng riêng biệt:

```
+---------------------------------------------------------------------------------------------------------+
|                                    BẢNG SẮC THÁI ĐỊA HÌNH & ÁNH SÁNG V1.4                               |
+---------------------------------------------------------------------------------------------------------+
| Nhóm 1: LÕI VĂN MINH LÀNG CỔ (Bellhollow, Sanctuary Farm)                                               |
| -> Nền cỏ rêu ấm (#2b3c23), đường đá cuội (tile_cobble_road_v14), thềm đá phiến, nhà mái rạ đôi       |
|    House Edda & Neris (Fan-tasy Pack 5), giếng làng đá cuội, luống cày đất mùn (tile_tilled_soil_v14). |
|                                                                                                         |
| Nhóm 2: RỪNG CẬN BIÊN & TIỂU KHU (Fog Crossing, Outer Woods, Whispering Clearing, Bell Workshop)       |
| -> Nền cỏ 3 biến thể chống lặp (tile_forest_grass_v14_a..c), đường mòn đất sỏi (tile_dirt_trail_v14),  |
|    quần thể Sồi rêu phong (Oak), Bạch Dương hổ phách (Birch), thân cây mục đổ, lều trại thợ săn.       |
|                                                                                                         |
| Nhóm 3: VÙNG HOANG VU & VỰC RỄ (Crooked Path, Deep Forest, Root Cellar)                                 |
| -> Đại lộ đá cổ nứt nẻ, vách đá dựng đứng (cliff_face_western_v14), chùm rễ cây đại thụ trồi           |
|    (prop_tangled_roots_v14), đất tím than hư vô (tile_abyssal_soil_v14), cây Phong đỏ huyết dụ (Maple). |
|                                                                                                         |
| Nhóm 4: CẤM ĐỊA ĐẦM LẦY & MIẾU PHẾ TÍCH (Silent Mire, Ancient Rune Puzzle, Broken Bell Shrine)          |
| -> Than bùn ngậm nước sẫm màu (tile_swamp_mud_v14_a..b), cầu ván gỗ phong hóa                          |
|    (tile_wood_plank_weathered_v14), khóm lau sậy nước, cây khô chết đứng, cột đá cổ ngữ phát quang.     |
+---------------------------------------------------------------------------------------------------------+
```

### 2.1. Chi tiết nâng cấp các công trình làng Bellhollow
- **Nhà của Edda (Người Giữ Chuông):** Tích hợp sprite `building_house_edda_v14.png` ($157\times112\text{ px}$) từ The Fan-tasy Tileset, mái rạ xám mốc phủ rêu phong, ô cửa sổ hắt ánh sáng hổ phách ấm áp.
- **Nhà của Neris (Thảo Dược):** Tích hợp sprite `building_house_neris_v14.png` ($128\times128\text{ px}$), mái rạ ngả tím thẫm ma mị, thềm đá hiên nhà rộng rãi thông thoáng cho vị trí đứng của NPC Neris $(970, 130)$.
- **Giếng Làng Cổ:** Tích hợp sprite `building_village_well_v14.png` ($56\times75\text{ px}$), thành giếng đá cuội viền rêu có cột gỗ và mái che rơm cổ kính.
- **Quần thể cây đại thụ:** Hàm `createTree` tự động phân phối loài cây theo địa hình: Cây Sồi rêu phong (`tree_oak_mossy_v14`), Cây Bạch Dương hổ phách (`tree_birch_amber_v14`), Cây Phong đỏ (`tree_maple_crimson_v14`) và Cây Cổ Thụ Đại Ngàn (`tree_oak_ancient_titan_v14`).

---

## 3. CẤU TRÚC 5 PHÂN KHU MỞ RỘNG MỚI (5 NEW EXPANSION MAPS)

| STT | Phân Khu Mới (Zone ID) | Tên Tiếng Việt | Kích Thước | Tầng Thế Giới | Ánh Sáng & Sương Mù | Cổng Kết Nối Trọng Tâm | Tài Nguyên & Cốt Truyện |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|
| **1** | `abyssal_chasm` | Vực Sâu Bóng Tối | $1280 \times 640$ | Tier 5 (Cấm địa) | $0.15\text{ lux}$ (Tối nhất game), sương tím than dày đặc (`#14081c`) | Cổng Hư Không (Abyssal Gate) nối từ phía Bắc `deep_forest` $(2240, -660)$ | Đá thạch anh đen, bia đá cổ ngữ, tàn tích cỗ xe hiệp sĩ cũ |
| **2** | `drowned_mire_depths` | Đầm Lầy Chìm | $1120 \times 640$ | Tier 4 (Rất cao) | $0.22\text{ lux}$, nước đục sủi bọt, hơi ẩm đọng giọt (`#18241b`) | Cầu Cảng Gỗ Mục nối từ phía Nam `silent_mire` $(3380, 780)$ | Sen đầm lầy, rương sắt chìm dưới nước, nhật ký ngư phủ |
| **3** | `whispering_grove_sanctum` | Thánh Địa Cây Đại Ngàn | $960 \times 440$ | Tier 2 (Thánh địa) | $0.55\text{ lux}$ (Ấm áp thanh bình), sương ngọc bích (`#2e3d24`) | Vòm Rễ Cổ Thụ nối từ `sub_whispering_clearing` $(1840, -360)$ | Bàn tế lễ rêu hoa, nhựa cây thần Cấp 3, vùng thanh tẩy tâm linh |
| **4** | `sunken_crypt_ruins` | Hầm Mộ Cổ Ngữ | $1130 \times 640$ | Tier 4 (Cổ tích) | $0.18\text{ lux}$, tro bụi phủ quan tài hiệp sĩ, ánh đá lam ngọc | Cầu thang đá ngầm mở ra từ tâm đài `ancient_rune_puzzle` $(3520, 160)$ | Dãy cột đá cổ ngữ, bia tưởng niệm hiệp sĩ, quan tài đá cổ |
| **5** | `veil_origin_cavern` | Hang Cội Rễ Hư Vô | $1120 \times 640$ | Tier 5 (Cội nguồn) | $0.12\text{ lux}$, băng giá cực hạn, dòng sương nguyên thủy (`#0f0c14`) | Khe nứt đá ngầm từ đáy `sub_root_cellar` $(800, 1420)$ | Bệ thờ Trái Tim Màn Sương, huyết thư Chỉ Huy Hiệp Sĩ Đen |

---

## 4. MA TRẬN KẾT NỐI KHÔNG GIAN HAI CHIỀU (TOPOLOGY VERIFICATION)

Hệ thống kết nối giữa 17 phân khu hiện tại đạt $39$ cổng chuyển vùng logic hai chiều:

```
                             [abyssal_chasm] (Tier 5)
                                    ^
                                    | (Cổng Cổ Ngữ Hư Không)
                                    v
 [whispering_grove_sanctum] <==> [deep_forest] <===================+
            ^                           ^                          |
            | (Vòm Rễ Cổ)               | (Đường Mòn Rừng Bắc)     |
            v                           v                          v
 [sub_whispering_clearing] <===> [BELLHOLLOW] <== (Đường Vòng) ==> [crooked_path]
            ^                           ^                          |
            |                           |                          | (Cầu Sập)
            v                           v                          v
     [fog_crossing]             [sanctuary_farm]             [silent_mire]
                                        ^                          ^
                                        |                          | (Cầu Ván Gỗ)
                                        v                          v
                                  [outer_woods]         [drowned_mire_depths] (Mới)
                                        ^
                                        |
                                        v
                                [sub_root_cellar]
                                        ^
                                        | (Khe Nứt Đá Ngầm)
                                        v
                               [veil_origin_cavern] <=== (Mạch Nước) ===> [sunken_crypt_ruins]
                                                                                  ^
                                                                                  | (Đài Cổ Ngữ)
                                                                                  v
                                                                       [ancient_rune_puzzle]
```

---

## 5. KẾT QUẢ KIỂM ĐỊNH TỰ ĐỘNG & NGHIỆM THU KỸ THUẬT

Tập lệnh kiểm thử tự động `scripts/verify_step8_expansion.mjs` đã thực thi kiểm tra toàn diện và xuất kết quả:

```
=== BẮT ĐẦU KIỂM ĐỊNH TỰ ĐỘNG BƯỚC 8 (WORLD EXPANSION VERIFICATION) ===

1. KIỂM TRA PHÂN KHU (ZONES INTEGRITY):
- Tổng số phân khu đăng ký: 17
[PASS] Toàn bộ 17 phân khu có bounds, defaultSpawn và atmosphere hợp lệ.

2. KIỂM TRA CỔNG CHUYỂN VÙNG (TRANSITION TWO-WAY TOPOLOGY):
  [2-WAY OK] deep_forest <=====> abyssal_chasm
  [2-WAY OK] silent_mire <=====> drowned_mire_depths
  [2-WAY OK] sub_whispering_clearing <=====> whispering_grove_sanctum
  [2-WAY OK] ancient_rune_puzzle <=====> sunken_crypt_ruins
  [2-WAY OK] sub_root_cellar <=====> veil_origin_cavern
[PASS] Đã kiểm tra 39 cổng chuyển vùng, 5 cặp phân khu mở rộng mới kết nối 2 chiều hoàn hảo.

3. KIỂM TRA VA CHẠM ĐIỂM XUẤT PHÁT (SAFE SPAWN AUDIT):
[PASS] Tất cả điểm xuất phát thông thoáng, không bị kẹt va chạm.

4. KIỂM TRA BẢO TOÀN NPC & CÔNG TRÌNH CỐT LÕI (BELLHOLLOW & CORE HUBS):
- NPCs trong làng Bellhollow: Bảo toàn 100% (Garth, Edda, Neris, Bram, Finn, Campfire Knight)
[PASS] Toàn bộ NPC cốt lõi và hub an toàn làng Bellhollow được bảo toàn.

5. KIỂM TRA VẸN TOÀN TẬP ASSET V1.4 MỚI:
[PASS] Toàn bộ 38/38 asset V1.4 hợp lệ, chuẩn kích thước và không bị lỗi giải mã.

6. KIỂM TRA RÀNG BUỘC DỪNG (MONSTER SPAWNS IN NEW ZONES AUDIT):
[PASS TUYỆT ĐỐI] Toàn bộ 5 phân khu mới hoàn toàn không có quái vật spawn sớm. Sẵn sàng cho Giai đoạn tiếp theo.

=== KẾT QUẢ KIỂM ĐỊNH TỰ ĐỘNG BƯỚC 8 ===
Lỗi nghiêm trọng: 0
Cảnh báo: 0
>>> HỆ THỐNG MÔI TRƯỜNG VÀ BẢN ĐỒ MỞ RỘNG V1.4 ĐẠT 100% TIÊU CHUẨN NGHIỆM THU! <<<
```

### 5.1. Kết quả đóng gói biên dịch (Production Build Verification)
- **TypeScript:** `tsc --noEmit` đạt $0$ lỗi type.
- **Vite Production Bundler:** `npm run build` hoàn thành trong $9.87\text{s}$, tạo gói phân phối sạch tại `dist/` ($2,488.23\text{ kB}$ bundle, nén gzip $592.11\text{ kB}$).

---

## 6. KẾT LUẬN & SẴN SÀNG CHO BƯỚC 9

Bước 8 đã hoàn thành xuất sắc toàn bộ các mục tiêu đặt ra:
1. Môi trường nền của 12 phân khu cũ đã được nâng cấp lên chuẩn Pixel Art Master V1.4 đồng bộ, sống động và đậm chất folk horror.
2. 5 phân khu mở rộng mới đã được khởi tạo hoàn chỉnh về cấu trúc địa lý, khí quyển, ánh sáng, đạo cụ phế tích, điểm thu thập tài nguyên và di vật cốt truyện.
3. Ràng buộc dừng được tuân thủ tuyệt đối: 0 quái vật spawn sớm trong các vùng mới, đảm bảo hệ thống ổn định và dễ cô lập lỗi.

Sẵn sàng chuyển sang **Bước 9 — Triển khai Hệ Sinh Thái Quái Vật Mở Rộng & Cơ Chế Chạm Trán Phục Kích**.
