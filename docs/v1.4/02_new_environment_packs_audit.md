# HOLLOW WOODS V1.4 — BÁO CÁO KIỂM ĐỊNH CHI TIẾT 6 BỘ ASSET MÔI TRƯỜNG
## NEW ENVIRONMENT PACKS AUDIT & FEASIBILITY REPORT (BƯỚC 2)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mục tiêu:** Nâng cấp V1.4 (Environment Asset Overhaul, Monster Expansion & World Map Development)  
**Nhánh Git đang thực hiện:** `feat/v1.4-expansion` (Bảo toàn 100% nhánh `main` và bản phát hành V1.3)  
**Thư mục Staging kiểm thử:** `staging/env_audit/` (Cách ly tuyệt đối, không ghi đè bất kỳ asset gốc hay mã nguồn game)  
**Ngày thực hiện kiểm định:** 18/11/2026  
**Trạng thái kiểm định:** **HOÀN THÀNH TOÀN DIỆN (AUDITED & CLASSIFIED)**  

---

## 1. NGUYÊN TẮC KIỂM ĐỊNH & PHẠM VI CÁCH LY

1. **Phạm vi kiểm định:**
   - Thực hiện kiểm định kỹ thuật chuyên sâu đối với 6 gói nén môi trường được chỉ định:
     1. `Resurrected RPG 1.1.rar`
     2. `Updated-Trees.zip`
     3. `Forest-Asset-Pack.zip`
     4. `Pixel Art Top Down - Basic v1.2.3.zip`
     5. `The Fan-tasy Tileset (Free) 1.5.9.zip`
     6. `SHADOW Series - The Free Assets.rar` (Tập trung phần Tileset / Môi trường / Bản đồ)
   - **Quy tắc chặn nghiêm ngặt (Strict Stop Constraint):**
     + Chỉ giải nén và phân tích trong thư mục cô lập `staging/env_audit/`.
     + **KHÔNG** chỉnh sửa bất kỳ dòng mã nguồn runtime nào (`src/`).
     + **KHÔNG** thay thế, xóa hoặc ghi đè bất kỳ tài nguyên hiện có nào (`public/assets/`).
     + **KHÔNG** kiểm định các asset quái vật / nhân vật (được bảo lưu xử lý riêng ở bước kế tiếp).

2. **Tiêu chí đánh giá bắt buộc:**
   - **Kích thước & Lưới Tile (Tile Grid & Pixel Density):** Độ chuẩn xác theo bội số lũy thừa 2 (16×16 px, 32×32 px, 64×64 px), tính toàn vẹn của Pixel Art tỉ lệ 1:1 (Nearest-Neighbor, không bị nội suy bilinear làm nhòe viền).
   - **Góc nhìn không gian (Perspective Compatibility):** Bắt buộc phải là góc nhìn **Top-down** hoặc **3/4 Top-down (Top-down Oblique 2.5D)** tương thích với cơ chế Y-Sorting (`depth = Math.floor(y)`) và hộp va chạm chân (`footprint collider`). **Loại bỏ ngay lập tức** các tài nguyên góc nhìn phẳng ngang (2D Side-view / Platformer).
   - **Khả năng ghép nối (Seamlessness & Autotiling):** Kiểm tra tính liền mạch biên, khả năng lặp mẫu (texture repeating) trên CanvasTexture mà không bị lộ đường nối (seam line).
   - **Bảng màu & Bầu không khí (Color Harmony & Atmosphere):** So sánh tương quan màu sắc với bảng màu chủ đạo của *THE FOG THAT REMEMBERS*:
     + Xanh rêu sương mù (`#2d3d24`, `#1a2416`)
     + Đất mùn / Than bùn mục nát (`#3d2d1d`, `#261f18`)
     + Gỗ sồi phong hóa / Đá xám phong rêu (`#555148`, `#383630`)
     + Ánh sáng hổ phách ấm từ đèn lồng và lửa trại (`#ffc048`, `#e58e26`)

3. **Phân loại 3 nhóm chuẩn mực:**
   - **Nhóm (A) — Dùng được ngay:** Tương thích 100% góc nhìn 3/4 Top-down, pixel density chuẩn, bảng màu trầm u ám hài hòa với thế giới Hollow Woods.
   - **Nhóm (B) — Cần xử lý / chuyển đổi:** Góc nhìn 3/4 Top-down chuẩn mực nhưng cần cắt tách frame/sheet, điều chỉnh độ sáng/độ bão hòa (color grading/darkening) hoặc làm khớp viền seamless.
   - **Nhóm (C) — Không phù hợp / Loại bỏ:** Sai góc nhìn (2D Side-view Platformer) hoặc lệch hoàn toàn phong cách nghệ thuật cổ điển.

---

## 2. KẾT QUẢ KIỂM ĐỊNH KỸ THUẬT TỪNG BỘ ASSET

### 2.1 Bộ Asset 1: `Resurrected RPG 1.1.rar`
- **Thư mục Staging:** `staging/env_audit/01_resurrected_rpg/`
- **Số lượng tệp:** 15 tệp (7 ảnh PNG, 7 tệp nguồn Aseprite `.aseprite`, 1 tệp cấu hình).
- **Danh mục tệp chi tiết:**
  - `Grass.png` ($1024 \times 512\text{ px}$, 19.1 KB, độ mờ đục 38.1%, màu trung bình `#778d5a`).
  - `Grass 2 layer.png` ($1024 \times 512\text{ px}$, 38.0 KB, độ mờ đục 17.0%, màu trung bình `#ab987a`).
  - `Plants.png` ($1024 \times 1024\text{ px}$, 189.0 KB, độ mờ đục 25.1%, màu trung bình `#6b6b4f`).
  - `PlantShadow.png` ($512 \times 512\text{ px}$, 2.6 KB, độ mờ đục bóng đổ đen mờ).
  - `Props.png` ($512 \times 512\text{ px}$, 24.9 KB, độ mờ đục 24.6%, màu trung bình `#a99779`).
  - `Wall.png` ($2048 \times 1024\text{ px}$, 88.4 KB, độ mờ đục 24.3%, màu trung bình `#aa9778`).
  - `portal-Sheet.png` ($3264 \times 112\text{ px}$, 20.7 KB, độ mờ đục 44.8%, màu trung bình `#887b69`).

```
Lưới kiểm tra kích thước Tile:
- Grass.png (1024x512)   -> Lưới 16x16: 64 cols x 32 rows (Chuẩn xác 100%)
                         -> Lưới 32x32: 32 cols x 16 rows (Chuẩn xác 100%)
- Wall.png (2048x1024)   -> Lưới 16x16: 128 cols x 64 rows (Chuẩn xác 100%)
                         -> Lưới 32x32: 64 cols x 32 rows (Chuẩn xác 100%)
- Props.png (512x512)    -> Lưới 16x16: 32 cols x 32 rows (Chuẩn xác 100%)
                         -> Lưới 32x32: 16 cols x 16 rows (Chuẩn xác 100%)
```

- **Phân tích góc nhìn (Perspective):** 
  - Góc nhìn chuẩn **3/4 Top-down RPG**. Vách đá (cliffs) và tường gạch (walls) hiển thị rõ mặt trên nằm ngang và mặt trước thẳng đứng. Cây cối và đạo cụ có góc chiếu xiên nghiêng đồng nhất với nhân vật chính của Hollow Woods.
- **Phân tích bảng màu & Bầu không khí:**
  - Tông cỏ `Grass.png` (`#778d5a`) và tường `Wall.png` (`#aa9778`) mang sắc thái JRPG trung cổ tươi sáng hơn so với sự mục rữa, u ám của Hollow Woods.
  - Tuy nhiên, hình dáng pixel art và cấu trúc khối đá (masonry) cùng khung gỗ dầm (timber frames) rất tinh xảo và hoàn toàn có thể đồng hóa thông qua tiền xử lý giảm độ sáng (Luminance $-25\%$) và tăng sắc xám rêu phong.
- **Đánh giá Seamless & Khả năng Autotile:**
  - Bộ `Grass.png` và `Wall.png` được xếp theo chuẩn Autotile Wang/Blob 47-tile, rất thuận lợi để cắt thành các mẫu chuyển tiếp địa hình đất - cỏ - đá.
- **Phân loại:** **NHÓM (B) — CẦN XỬ LÝ / CHUYỂN ĐỔI**
  - *Lý do:* Góc nhìn và độ phân giải hoàn hảo, có sẵn tệp nguồn `.aseprite`. Cần viết script tự động cắt tách các cụm đạo cụ (hàng rào đá, bia mộ, túp lều, hòm gỗ) và áp dụng bộ lọc hạ tông màu (Color grading LUT) đồng bộ với sương mù của The Veil.

---

### 2.2 Bộ Asset 2: `Updated-Trees.zip`
- **Thư mục Staging:** `staging/env_audit/02_updated_trees/`
- **Số lượng tệp:** 4 tệp (3 ảnh PNG độc lập, 1 tệp nguồn `.aseprite`).
- **Danh mục tệp chi tiết:**
  - `Oak.png` ($80 \times 95\text{ px}$, 1.1 KB, màu trung bình `#335e2d`, top màu: `#408030` [49.0%], `#205030` [23.4%], `#203030` [15.6%]).
  - `Birch.png` ($80 \times 95\text{ px}$, 1.1 KB, màu trung bình `#b47d3b`, top màu: `#e0a040` [48.2%], `#c07030` [21.3%], `#905030` [14.1%]).
  - `Maple.png` ($80 \times 95\text{ px}$, 1.1 KB, màu trung bình `#732530`, top màu: `#a03030` [39.6%], `#702040` [27.7%], `#402030` [20.9%]).
  - `Forest-Asset-Pack.aseprite` (2.1 KB).

- **Phân tích góc nhìn (Perspective):**
  - Góc nhìn **3/4 Top-down chuẩn xác**. Tán cây nở phồng có độ sâu khối hình cầu, thân cây hiển thị gốc rễ cắm sâu xuống mặt đất kèm bóng đổ hình elip mềm đã được tích hợp sẵn ở chân gốc (`alpha = 0.3`).
- **Phân tích tỷ lệ & Pixel Density:**
  - Kích thước $80 \times 95\text{ px}$ hoàn toàn đồng bộ với kích thước cây hiện hữu trong Hollow Woods ($80 \times 113\text{ px}$ và $113 \times 139\text{ px}$).
  - Mật độ pixel art 1:1, viền nét rõ, không dính khử răng cưa mờ.
- **Phân tích bảng màu & Bầu không khí:**
  - Cây Sồi (`Oak.png`): Sắc xanh lục thẫm (`#335e2d`) đặc trưng cho rừng già ẩm ướt nguyên sinh, cực kỳ phù hợp với khu vực Lối Mòn Xuyên Sương (`fog_crossing`) và Làng Chuông (`bellhollow`).
  - Cây Bạch Dương Vàng Hổ Phách (`Birch.png`): Tán lá vàng cam ấm rực rỡ (`#e0a040`), bổ sung trực quan tuyệt vời cho khu vực Trại Trú Ẩn (`sanctuary_farm`) bên ánh đèn lồng.
  - Cây Phong Đỏ Huyết Mộc (`Maple.png`): Tán lá đỏ thẫm u tối (`#732530`), hoàn toàn ăn khớp với không khí nguyền rủa của Miếu Chuông Phế Tích (`broken_bell_shrine`) và Rừng Sâu Abyssal (`deep_forest`).
- **Khả năng tích hợp kỹ thuật:**
  - Chân gốc nằm ngay đáy ảnh, căn chỉnh `origin (0.5, 0.92)` cho phép tính toán Y-sorting và va chạm chân (`footprint collider: 24x12 px`) một cách dễ dàng.
  - Hỗ trợ hoàn hảo cơ chế tán cây mờ trong suốt `updateCanopyTransparency` khi người chơi đi sau thân cây.
- **Phân loại:** **NHÓM (A) — DÙNG ĐƯỢC NGAY (DIRECT USAGE)**
  - *Lý do:* Không cần chỉnh sửa kích thước hay màu sắc; tài nguyên chất lượng cao sẵn sàng đưa trực tiếp vào `PreloadScene.ts`, `WorldBuilder.ts` và `content_registry.json`.

---

### 2.3 Bộ Asset 3: `Forest-Asset-Pack.zip`
- **Thư mục Staging:** `staging/env_audit/03_forest_asset_pack/`
- **Số lượng tệp:** 2 tệp (`Forest-Asset-Pack-Sheet.png`, `Forest-Asset-Pack.aseprite`).
- **Danh mục tệp chi tiết:**
  - `Forest-Asset-Pack-Sheet.png` ($321 \times 129\text{ px}$, 11.1 KB, màu trung bình `#544934`, top màu: `#205030` [12.2%], `#000000` [10.0%], `#203030` [8.7%]).
- **Phân tích chi tiết thành phần (Component Breakdown qua thuật toán Flood-fill Bounding Box):**
  - Tổng số phần tử độc lập tìm thấy: **28 chi tiết môi trường**:
    1. **Gốc cây đại thụ mục nát:** 4 gốc cây cổ thụ bị đốn hạ hoặc rỗng ruột ($43 \times 61\text{ px}$, $46 \times 61\text{ px}$, $42 \times 63\text{ px}$).
    2. **Thân cây đổ chắn đường:** Thân gỗ mục phủ rêu nằm ngang ($27 \times 36\text{ px}$).
    3. **Gốc cây nhỏ & Đụn rễ cây:** 4 gốc cây rễ bám đất ($33 \times 53\text{ px}$, $34 \times 50\text{ px}$, $29 \times 50\text{ px}$).
    4. **Bụi rậm & Đám rêu gai:** 3 cụm bụi cây rậm rạp ($22 \times 22\text{ px}$, $22 \times 21\text{ px}$).
    5. **Cỏ lau & Thảo dược nước:** 1 khóm cây lau nước ($16 \times 30\text{ px}$).
    6. **Nấm rừng phát quang & Đốm đá cuội:** 15 đốm nấm tán nâu, nấm cụm ẩm ướt và sỏi vụn ($8 \times 10\text{ px}$ đến $16 \times 12\text{ px}$).

- **Phân tích góc nhìn (Perspective):**
  - Toàn bộ 28 phần tử đều có góc nhìn **3/4 Top-down**. Mặt cắt của thân cây lộ vân gỗ tròn hơi dẹp elip đặc trưng của góc nhìn nghiêng từ trên xuống.
- **Phân tích bảng màu & Bầu không khí:**
  - Tông màu đạt độ hòa hợp **100%** với bối cảnh của Hollow Woods: màu nâu than bùn ẩm ướt (`#544934`), xanh rêu đậm ngả đen (`#205030`), xám đá ẩm (`#203030`).
  - Cực kỳ lý tưởng để gia tăng mật độ chi tiết tự nhiên cho Đường Mòn Quanh Co (`crooked_path`) và Đầm Lầy Tĩnh Lặng (`silent_mire`), nơi hiện tại đang thiếu các gốc cây đổ làm chướng ngại vật cản đường.
- **Phân loại:** **NHÓM (A) — DÙNG ĐƯỢC NGAY SAU KHI CẮT TÁCH (DIRECT USAGE AFTER SLICING)**
  - *Lý do:* Bản thân đồ họa và màu sắc đạt chuẩn 100%. Chỉ cần một script Node.js ngắn sử dụng `pngjs` để cắt theo tọa độ 28 bounding box đã xác định thành các file PNG riêng lẻ và gán vào hệ sinh thái Decor/Obstacle của `WorldBuilder`.

---

### 2.4 Bộ Asset 4: `Pixel Art Top Down - Basic v1.2.3.zip`
- **Thư mục Staging:** `staging/env_audit/04_pixel_art_top_down_basic/`
- **Số lượng tệp:** 15 tệp (bao gồm tài liệu, gói `.unitypackage`, ảnh tổng quan và thư mục `Texture/`).
- **Danh mục tệp đồ họa chính (`Texture/`):**
  - `TX Tileset Grass.png` ($256 \times 256\text{ px}$, 10.8 KB, độ mờ đục 100%, màu trung bình `#75772d`, top màu: `#707020` [75.4%]).
  - `TX Tileset Stone Ground.png` ($256 \times 256\text{ px}$, 8.3 KB, độ mờ đục 78.0%, màu trung bình `#858276`, top màu: `#808080` [83.5%]).
  - `TX Tileset Wall.png` ($512 \times 512\text{ px}$, 16.9 KB, độ mờ đục 16.1%, màu trung bình `#6a6055`, top màu: `#606060` [25.2%]).
  - `TX Plant.png` / `TX Plant with Shadow.png` ($512 \times 512\text{ px}$, 63.7 KB, màu trung bình `#6d691f`).
  - `TX Props.png` / `TX Props with Shadow.png` ($512 \times 512\text{ px}$, 84.5 KB, màu trung bình `#736555`).
  - `TX Struct.png` ($512 \times 512\text{ px}$, 39.6 KB, độ mờ đục 25.4%, màu trung bình `#6f6754`).
  - `TX Shadow.png` / `TX Shadow Plant.png` ($512 \times 512\text{ px}$, lớp phủ bóng đổ chân thực).

```
Lưới kiểm tra kích thước Tile:
- TX Tileset Grass.png (256x256)        -> Lưới 16x16: 16 cols x 16 rows (Chuẩn xác 100%)
- TX Tileset Stone Ground.png (256x256) -> Lưới 16x16: 16 cols x 16 rows (Chuẩn xác 100%)
- TX Tileset Wall.png (512x512)         -> Lưới 32x32: 16 cols x 16 rows (Chuẩn xác 100%)
- TX Props.png (512x512)                -> Lưới 32x32: 16 cols x 16 rows (Chuẩn xác 100%)
```

- **Phân tích góc nhìn (Perspective):**
  - Chuẩn mực **3/4 Top-down quốc tế**. Toàn bộ hệ thống bóng đổ góc 45 độ hướng Tây Nam ăn khớp tuyệt đối với kiến trúc bóng đổ nhân vật của Hollow Woods.
- **Phân tích vị thế & Tương thích:**
  - Đây chính là **bộ asset cội nguồn (Master Reference Source)** của hệ thống `TX` mà HOLLOW WOODS đã xây dựng từ V1.1 đến nay.
  - Tệp gốc trong gói zip này cung cấp ảnh gốc chất lượng nguyên bản chưa qua nén (lossless PNG) cùng đầy đủ các biến thể bóng đổ riêng rẽ (`TX Shadow.png`), giải quyết triệt để vấn đề mất chi tiết hoặc lem viền trong các bản nén cũ.
- **Phân loại:** **NHÓM (A) — DÙNG ĐƯỢC NGAY (TIÊU CHUẨN NỀN TẢNG / BASELINE STANDARD)**
  - *Lý do:* Đã được kiểm chứng qua toàn bộ 12 phân khu của game, tương thích 100% với hệ thống `Baked CanvasTexture` và cơ chế depth sorting.

---

### 2.5 Bộ Asset 5: `The Fan-tasy Tileset (Free) 1.5.9.zip`
- **Thư mục Staging:** `staging/env_audit/05_the_fantasy_tileset/`
- **Số lượng tệp:** 156 tệp tổ chức theo cấu trúc bài bản: `Art/Buildings/`, `Art/Ground Tileset/`, `Art/Props/`, `Art/Characters/`.
- **Danh mục tệp tiêu biểu:**
  - **Mặt đất:** `Tileset_Ground.png` ($192 \times 224\text{ px}$, màu trung bình `#9bc384`), `Tileset_Road.png` ($96 \times 224\text{ px}$, màu trung bình `#b09061`).
  - **Kiến trúc nhà cửa thôn dã (Mái rạ / Mái rơm):**
    + `Buildings.png` Atlas ($224 \times 544\text{ px}$, màu trung bình `#b6a162`).
    + `House_Hay_1.png` ($88 \times 103\text{ px}$, nhà mái rơm nhỏ).
    + `House_Hay_2.png` ($157 \times 112\text{ px}$, nhà mái rơm đôi kèm gác chuông).
    + `House_Hay_3.png` ($180 \times 128\text{ px}$, nông trang lớn mái rạ).
    + `House_Hay_4_Purple.png` ($128 \times 128\text{ px}$, nhà rơm cổ ngả màu tím trầm).
    + `CityWall_Gate_1.png` ($80 \times 96\text{ px}$, cổng thành gỗ đá).
    + `Well_Hay_1.png` ($56 \times 75\text{ px}$, giếng làng có mái che rơm).
  - **Đạo cụ chi tiết (Props):**
    + `Props.png` Atlas ($288 \times 160\text{ px}$), thùng rượu (`16x20`), giỏ mây (`22x17`), ghế băng gỗ (`14x30`, `14x14`), bảng thông cáo (`44x42`), đống củi chẻ (`32x21`, `32x19`), bờ rào rơm mục (`26x16`, `16x26`, `18x18`), đụn rơm khô (`32x23`, `32x34`, `32x16`), biển chỉ đường (`14x23`, `32x26`), bàn ăn mộc (`34x27`, `20x34`).
  - **Hoạt ảnh chuyển động:** `Animation_Campfire.png` ($256 \times 32\text{ px}$, lửa bập bùng), đuốc gắn tường `Torch_Wall_1.png`.

```
Lưới kiểm tra kích thước Tile:
- Tileset_Ground.png (192x224) -> Lưới 16x16: 12 cols x 14 rows (Chuẩn xác 100%)
- Buildings.png (224x544)      -> Lưới 16x16: 14 cols x 34 rows (Chuẩn xác 100%)
```

- **Phân tích góc nhìn (Perspective):**
  - Góc nhìn **3/4 Top-down cực kỳ xuất sắc**. Các ngôi nhà mái rạ có mặt dốc mái hướng lên trên và mặt tiền hướng thẳng ra màn hình, chân móng tiếp xúc mặt đất phẳng, phù hợp hoàn hảo với hệ thống hộp va chạm và depth sorting của Hollow Woods.
- **Phân tích bảng màu & Độ tương thích bầu không khí:**
  - **Độ lệch màu (Color Discrepancy):** Tông màu nguyên bản của gói này được thiết kế theo phong cách Fantasy JRPG tươi sáng, ban ngày nắng rực:
    + Thảm cỏ màu xanh ngọc bích nhạt (`#9bc384`, `#90e080`).
    + Mái rơm màu vàng sáng rực chói chang (`#f0e050`, `#e0c050`).
    + Đường mòn màu cát vàng rực (`#e0c080`).
  - Bảng màu này **xung đột trực tiếp** với không gian u tối, ma mị, sương giăng của *THE FOG THAT REMEMBERS*. Nếu đưa vào game ngay mà không xử lý màu, các ngôi nhà sẽ trông như đồ họa hoạt hình lạc lõng giữa rừng đêm.
- **Giải pháp chuyển đổi kỹ thuật khả thi:**
  - Hình dáng pixel art của các ngôi nhà mái rạ này là **chất lượng cao nhất** từng thấy để tái hiện làng cổ Bellhollow và Nông trại Trú ẩn (`sanctuary_farm`).
  - Chỉ cần đưa qua bộ lọc xử lý ảnh tự động:
    1. Giảm Luminance (độ sáng) từ $30\% - 40\%$.
    2. Giảm Saturation (độ bão hòa màu vàng tươi) và chuyển dịch Hue về sắc rơm mốc, xám tro, rêu bám ẩm ướt.
    3. Giữ nguyên viền pixel và thêm ánh sáng hổ phách vàng ấm từ ô cửa sổ.
- **Phân loại:** **NHÓM (B) — CẦN XỬ LÝ / CHUYỂN ĐỔI (COLOR GRADING & DESATURATION)**
  - *Lý do:* Cấu trúc kiến trúc và góc nhìn 3/4 Top-down hoàn toàn tương thích và rất giá trị cho việc nâng cấp làng Bellhollow. Bắt buộc phải chuyển đổi bảng màu trước khi tích hợp vào game.

---

### 2.6 Bộ Asset 6: `SHADOW Series - The Free Assets.rar` (Phần Tileset / Môi trường / Bản đồ)
- **Thư mục Staging:** `staging/env_audit/06_shadow_series/`
- **Số lượng tệp liên quan môi trường:**
  - `SHADOW Series - The Free Assets/SHADOW Series - Pixel Tile Map Asset Pack 3/tile map.png` ($576 \times 384\text{ px}$, 16.4 KB, màu trung bình `#1a1315`, top màu: `#101010` [79.0%], `#302020` [17.0%]).
  - `SHADOW Series - Void Gate/SHADOW Series - Abyssal Gate.png` ($160 \times 59\text{ px}$, 3.7 KB, màu trung bình `#11190e`, top màu: `#000000` [37.9%], `#202020` [27.8%]).
  - Tệp nguồn `.aseprite` tương ứng.

```
Lưới kiểm tra kích thước Tile của tile map.png (576x384):
- Lưới 16x16: 36 cols x 24 rows (Chuẩn xác 100%)
- Lưới 24x24: 24 cols x 16 rows (Chuẩn xác 100%)
- Lưới 32x32: 18 cols x 12 rows (Chuẩn xác 100%)
```

- **Phân tích góc nhìn (Perspective Evaluation - BẮT BUỘC):**
  - **Kiểm định thực tế tệp `tile map.png`:**
    + Toàn bộ cấu trúc của `tile map.png` được vẽ theo góc nhìn **2D SIDE-VIEW PLATFORMER (SIDE-SCROLLER / METROIDVANIA)**:
      * Mặt cỏ chỉ có một dải mỏng vài pixel ở mép trên cùng, phía dưới là một mặt cắt dọc đứng (cross-section) của các tầng đất đá đi thẳng xuống.
      * Có các gờ sàn một chiều (one-way drop-through platform) được thiết kế cho việc nhảy từ dưới lên và đáp xuống.
      * Có các chông nhọn (spikes) chĩa thẳng đứng từ dưới sàn lên và thạch nhũ (stalactites) từ trần hang đâm thẳng xuống.
      * Không hề có bề mặt sàn nằm ngang (ground plane) để nhân vật có thể đi lại tự do theo trục 2.5D ($X, Y$).
    + **Kết luận góc nhìn:** **SAI GÓC NHÌN HOÀN TOÀN** so với gameplay Top-down của HOLLOW WOODS. Nếu sử dụng các tile này làm nền đất top-down, người chơi sẽ có cảm giác như nhân vật đang đi trên một vách tường đứng bị lật nghiêng, phá vỡ hoàn toàn ảo giác không gian 2.5D.
- **Kiểm định tệp `SHADOW Series - Abyssal Gate.png` ($160 \times 59\text{ px}$):**
  - Cổng đá cổ ngữ hư không (Void Gate): Là một công trình đứng dạng tháp cổng vòm ma quái với năng lượng bóng tối cuộn xoáy.
  - Sắc màu: Đen tuyền huyền bí (`#11190e`), rất phù hợp với phong cách tà thuật sâu thẳm của Rừng Sâu Abyssal (`deep_forest`) hoặc Đài Cổ Ngữ (`ancient_rune_puzzle`).
  - Do là một thực thể đứng (monolith/portal structure), nó hoàn toàn có thể được đặt tại ranh giới phân khu với `origin (0.5, 1.0)` và hộp va chạm chân đế.
- **Phân loại:**
  - **Tài nguyên Địa hình / Bản đồ (`tile map.png`):** **NHÓM (C) — KHÔNG PHÙ HỢP / LOẠI BỎ (REJECT)** do xung đột cơ chế góc nhìn Side-view.
  - **Tài nguyên Cổng Hư Không (`Abyssal Gate.png`):** **NHÓM (B) — TÁI SỬ DỤNG CÓ CHỌN LỌC (SELECTIVE REUSE)** làm công trình chuyển cảnh phế tích ranh giới.

---

## 3. BẢNG MA TRẬN ĐỐI SOÁT & PHÂN LOẠI TOÀN BỘ 6 BỘ ASSET

| STT | Tên Gói Asset | Tệp Đồ Họa Chính | Kích Thước / Lưới | Góc Nhìn | Khả Năng Ghép Nối | Bảng Màu & Bầu Không Khí | Phân Nhóm | Đề Xuất Sử Dụng Trong V1.4 |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---:|:---|
| **1** | **Resurrected RPG 1.1** | `Grass.png`, `Wall.png`, `Props.png` | $1024 \times 512$ đến $2048 \times 1024$ (Lưới 16, 32) | 3/4 Top-down | Tốt (Autotile 47-tile) | Hơi tươi sáng, cần hạ tông xám rêu | **(B) Cần xử lý** | Cắt các đạo cụ lều trại, tường thành đá, vách đá cho `sub_bell_workshop` & `deep_forest` |
| **2** | **Updated-Trees** | `Oak.png`, `Birch.png`, `Maple.png` | $80 \times 95\text{ px}$ (Sprite độc lập) | 3/4 Top-down | Rất tốt (Có bóng đổ elip chân) | Xuất sắc (Lục rêu `#335e2d`, Vàng hổ phách `#b47d3b`, Đỏ huyết `#732530`) | **(A) Dùng ngay** | Nạp trực tiếp làm hệ sinh thái cây mới cho `fog_crossing`, `bellhollow`, `sanctuary_farm`, `broken_bell_shrine` |
| **3** | **Forest-Asset-Pack** | `Forest-Asset-Pack-Sheet.png` | $321 \times 129\text{ px}$ (28 phần tử) | 3/4 Top-down | Độc lập từng cụm | Tuyệt đối ăn khớp (`#544934` bùn mục, rêu đen, nấm rậm) | **(A) Dùng ngay (sau cắt)** | Cắt tách 28 sprite gốc cây đổ, nấm hoang dã, đụn rễ để chặn đường và trang trí `crooked_path` & `silent_mire` |
| **4** | **Pixel Art Top Down - Basic v1.2.3** | `TX Tileset Grass`, `Stone Ground`, `Wall`, `Props` | $256 \times 256$ đến $512 \times 512$ (Lưới 16, 32) | 3/4 Top-down | Hoàn hảo (Seamless Autotile) | Tiêu chuẩn gốc (`#75772d`, `#858276`, `#736555`) | **(A) Dùng ngay** | Sử dụng làm bộ nguồn gốc chất lượng cao thay thế các bản nén cũ trên toàn bộ 12 phân khu |
| **5** | **The Fan-tasy Tileset (Free) 1.5.9** | `Tileset_Ground`, `Buildings.png`, 4 nhà mái rạ, đạo cụ | $192 \times 224$ đến $224 \times 544$ (Lưới 16, 32) | 3/4 Top-down | Rất tốt (156 tệp chi tiết) | Quá tươi sáng (`#9bc384`, `#f0e050`), cần đổi màu sang rơm mục và gỗ ẩm | **(B) Cần xử lý** | Nâng cấp toàn diện kiến trúc làng Bellhollow và Nông trại Sanctuary Farm sau khi color grading |
| **6** | **SHADOW Series - Free Assets** | `tile map.png`<br>`Abyssal Gate.png` | $576 \times 384\text{ px}$<br>$160 \times 59\text{ px}$ | **Side-view Platformer**<br>Tháp đứng vòm | Không thể lặp Top-down<br>Độc lập | Tối tăm, u ám, huyền bí ma mị (`#1a1315`, `#11190e`) | `tile map`: **(C) Loại bỏ**<br>`Gate`: **(B) Chọn lọc** | **Loại bỏ hoàn toàn `tile map.png`** do sai góc nhìn. Giữ `Abyssal Gate.png` làm cổng đá dịch chuyển phế tích cổ |

---

## 4. KẾ HOẠCH HÀNH ĐỘNG CHO BƯỚC TIẾP THEO (STEP 3 ROADMAP)

Dựa trên kết quả kiểm định, quy trình xử lý tài nguyên ở Bước 3 được phân rã như sau:

1. **Nhóm ưu tiên triển khai trực tiếp (Gói 2 & Gói 4):**
   - Đưa ngay 3 loại cây chất lượng cao (`Oak.png`, `Birch.png`, `Maple.png`) từ `staging/env_audit/02_updated_trees/` vào thư mục `public/assets/environment/foliage/`.
   - Đăng ký vào ContentRegistry 4 tầng với Content ID:
     + `HW-ENV-TREE-OAK-000001` (`runtimeKey: tree_oak_v14`)
     + `HW-ENV-TREE-BIRCH-000001` (`runtimeKey: tree_birch_amber`)
     + `HW-ENV-TREE-MAPLE-000001` (`runtimeKey: tree_maple_crimson`)
   - Thiết lập cấu hình Footprint Collider chuẩn xác trong `WorldBuilder.ts` ($24 \times 12\text{ px}$, tâm chân đáy) và tích hợp vào hệ thống tán cây mờ `updateCanopyTransparency`.

2. **Nhóm xử lý cắt tách tự động (Gói 3):**
   - Viết script Node.js `scripts/slice_forest_pack.mjs` sử dụng `pngjs` để tự động bóc tách 28 sprite từ `Forest-Asset-Pack-Sheet.png` dựa trên ma trận tọa độ đã quét được.
   - Xuất khẩu thành các tệp PNG chuẩn Nearest-Neighbor:
     + `prop_stump_mossy_large_01.png`, `prop_stump_mossy_large_02.png`
     + `prop_fallen_log_mossy.png` (dùng làm chướng ngại vật chắn đường vòng Tháp Chuông)
     + `prop_shroom_cluster_amber.png`, `prop_swamp_reed.png`
   - Đăng ký vào `content_registry.json` tầng Đạo cụ Môi trường (`HW-ENV-PROP-*`).

3. **Nhóm tiền xử lý hạ tông màu & chuyển đổi (Gói 5 & Gói 1):**
   - Viết script xử lý ma trận điểm ảnh Node.js:
     + Giảm độ sáng Luminance $30\% - 35\%$.
     + Dịch chuyển sắc độ (Hue shift) từ vàng rơm tươi sáng sang xám tro mục rữa và rêu phong ẩm ướt.
     + Thêm ánh sáng hổ phách ấm vào các ô cửa sổ của 4 ngôi nhà mái rạ (`House_Hay_1..4`).
   - Tích hợp các ngôi nhà mới vào làng Bellhollow thay thế cho các khối nhà tạm hiện thời.

4. **Biện pháp xử lý Gói 6 (SHADOW Series):**
   - **Cách ly tuyệt đối và loại bỏ hoàn toàn `tile map.png`** khỏi đường ống tích hợp bản đồ của game để bảo đảm tính nhất quán góc nhìn Top-down.
   - Trích xuất riêng tệp `Abyssal Gate.png` để lưu trữ làm tài nguyên dự phòng cho cổng dịch chuyển hư không ở phân khu Đầm Lầy Tĩnh Lặng hoặc Rừng Sâu Abyssal.

---

## 5. XÁC NHẬN TUÂN THỦ NGUYÊN TẮC (STRICT VERIFICATION)

- [x] **Không sửa mã nguồn:** Toàn bộ thư mục `src/` không có bất kỳ thay đổi nào.
- [x] **Không ghi đè tài nguyên:** Toàn bộ thư mục `public/assets/` giữ nguyên trạng thái gốc của phiên bản V1.3/V1.4 baseline.
- [x] **Cách ly thư mục kiểm thử:** Toàn bộ quá trình giải nén, kiểm tra kích thước tile, chạy script phân tích màu sắc và bounding box chỉ diễn ra trong `staging/env_audit/` và `scripts/`.
- [x] **Không kiểm định quái vật:** Đã loại trừ toàn bộ asset nhân vật/boss trong gói SHADOW Series ra khỏi báo cáo môi trường này.
- [x] **Báo cáo đầy đủ:** Toàn bộ dữ liệu kỹ thuật, số liệu đo lường thực tế và phân loại A/B/C đã được ghi nhận chi tiết tại tài liệu này (`docs/v1.4/02_new_environment_packs_audit.md`).

---
*Báo cáo được khởi tạo tự động và xác minh kỹ thuật bởi Antigravity Engine Core.*
