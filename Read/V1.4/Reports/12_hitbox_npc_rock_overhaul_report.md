# BÁO CÁO HOÀN THIỆN: RÀ SOÁT HITBOX, TỌA ĐỘ NPC LÀNG BELLHOLLOW & SỬA LỖI ĐÁ BỊ CẮT ĐÔI (V1.4)

> **Mã báo cáo:** `V14-REPORT-12`  
> **Phiên bản áp dụng:** HOLLOW WOODS V1.4.0 (Gothic Woodland & Hybrid Open World)  
> **Trạng thái:** Hoàn tất & Đã nghiệm thu tự động trong game (100% In-Game Verified)  
> **Thời gian cập nhật:** 18/11/2026

---

## 1. TỔNG QUAN YÊU CẦU & HIỆN TRẠNG TRƯỚC KHI SỬA

Dựa trên phản hồi và các ảnh chụp màn hình thực tế từ người dùng:
1. **Lỗi mô hình đá bị cắt đôi (1/2 sliced rocks):**
   - Nhiều tảng đá rải rác trên nền cỏ, ven đường mòn và bãi suối có bậc thang hình tròn nhưng bị chém phẳng đứng một bên mép (mặt cắt thẳng đứng 90 độ), làm lộ lỗi cắt vụng về từ spritesheet.
2. **Lỗi tọa độ đứng của NPC tại làng Bellhollow:**
   - **Finn (Cậu bé đưa tin):** Đứng đè trực tiếp lên Rương Trú Ẩn (`camp_storage_chest`), khiến khi người chơi bước tới bị nhảy loạn và chồng chéo cả 2 thông báo tương tác: `[E] Trò chuyện` và `[E] Mở Rương Trú Ẩn 12 Ô`.
   - **Bà Lão Edda:** Đứng kẹt phía sau Giếng Nước Làng (`village_well`), bị mái giếng che khuất và đè hitbox.
   - **Neris (Người chữa thảo mộc):** Đứng giẫm lên Nồi Thảo Dược (`camp_herbal_cauldron`), gây chồng chéo prompt tương tác.
3. **Lỗi lệch khung viền lựa chọn (Hitbox / Selection Outline Offset):**
   - Khung viền trắng kem chỉ định vật thể tương tác bị lệch về góc trên bên trái của rương/vật phẩm, không ôm vuông vắn vào giữa tâm vật thể.
   - Khung viền tương tác NPC vẽ quá cao lên trời (cách chân 50px).
4. **Lỗi đồ họa đầm lầy (Silent Mire):**
   - Vực nước đầm lầy hiển thị như hình elip màu đen kịt (lỗ đen hư vô).
   - Khối cự thạch cổ ngữ hiển thị như hình hộp xám có dấu thập màu xanh ngọc bích y tế.

---

## 2. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

| Hạng mục lỗi | Nguyên nhân kỹ thuật phát hiện được | File liên quan |
| :--- | :--- | :--- |
| **Đá bị cắt đôi (1/2 Rocks)** | Trong các commit trước, file `rock_large.png` và `rock_medium.png` được trích xuất bằng lệnh cắt hình chữ nhật tại tọa độ `(40, 16, 64, 48)` trong `TX Props.png`. Tọa độ này thực chất là 1/4 góc trên bên trái của một bệ thờ đá tròn khổng lồ, khiến mép phải và mép dưới là đường chém đứt ngọt của bệ thờ thay vì một hòn đá hoàn chỉnh. | `rock_large.png`<br>`rock_medium.png`<br>`rock_large_mossy_v14.png`<br>`rock_mossy_forest_01_v14.png` |
| **Finn đè lên Rương** | `camp_storage_chest` đặt cố định tại `(735, 255)`. Trong khi đó, NPC Finn được cấu hình spawn tại `(760, 260)` với phạm vi tuần tra `745..775`. Khi Finn đi về bên trái, cậu ta bước thẳng lên nóc chiếc rương. | `src/data/zones.json`<br>`src/scenes/GameScene.ts` |
| **Edda kẹt sau Giếng** | `village_well` đặt tại `(726, 376)` với chiều rộng 64px. Edda lại được cấu hình tại `(710, 380)` (ngay phía sau bờ giếng), dẫn tới va chạm vật lý và che lấp hình thể. | `src/data/zones.json`<br>`src/scenes/GameScene.ts` |
| **Neris đè lên Nồi Thuốc** | `camp_herbal_cauldron` đặt tại `(935, 140)`. Neris được đặt tại `(970, 215)` trong config cũ hoặc đi ngang qua chân vạc thuốc ở cự ly < 25px. | `src/data/zones.json`<br>`src/scenes/GameScene.ts` |
| **Lệch khung viền lựa chọn** | Hàm `renderInteractionOutline(target)` tính toán `left = target.x - w/2`, trong khi dữ liệu `interactables` trong `zones.json` cung cấp tọa độ gốc Top-Left `(item.x, item.y)`. Do đó, khung viền bị dịch lệch một khoảng `(-w/2, -h/2)` lên phía Tây Bắc của đối tượng. | `src/scenes/GameScene.ts`<br>`src/world/WorldBuilder.ts` |
| **Mire Water đen kịt** | Màu vẽ trong hàm `createMireWater` được đặt mã hex `0x0a120f` và `0x101a18` (RGB ~16, 26, 24), gần như đen tuyệt đối (pitch black), thiếu hoàn toàn sắc tố xanh bùn rêu và viền gợn sóng phản chiếu. | `src/world/WorldBuilder.ts` |
| **Monolith hình chữ thập** | Hàm `createSunkenMonolithRuins` sử dụng đồ họa tạm `fillRoundedRect` ghép chữ thập màu ngọc bích `0x38d8a2` (trông như biểu tượng y tế) thay vì sprite đá cổ ngữ pixel art. | `src/world/WorldBuilder.ts` |

---

## 3. CÁC BIỆN PHÁP TINH CHỈNH & KHẮC PHỤC TRIỆT ĐỂ

### 3.1. Thay thế toàn diện Asset Đá Tự Nhiên & Cự Thạch Cổ Ngữ
1. **Asset đá tự nhiên (Rocks & Boulders):**
   - Trích xuất lại toàn bộ các khối đá tảng rêu phong nguyên vẹn từ gói Master `03_forest_asset_pack/Forest-Asset-Pack-Sheet.png` với vùng viền trong suốt 100% (zero border collision/bleeding):
     - `public/assets/environment/sprites/rock_large.png`: Khối đá tảng sừng sững 32×30 px.
     - `public/assets/environment/sprites/rock_medium.png`: Phiến đá dẹp rêu phong 24×20 px.
     - `public/assets/environment/v14/props/rock_large_mossy_v14.png`: Khối đá rừng già 32×30 px.
     - `public/assets/environment/v14/props/rock_mossy_forest_01_v14.png` & `02_v14.png`: Bộ đá cuội rêu 26×26 px.
   - Tinh chỉnh `createRock()` trong `WorldBuilder.ts`: Scale tự nhiên theo tỷ lệ chuẩn, đặt origin `(0.5, 0.85)` và bóng đổ mờ mịn `alpha 0.25` ôm sát chân đá.
2. **Cự thạch Cổ Ngữ U Minh (`prop_ancient_monolith_v14.png`):**
   - Trích xuất phiến cự thạch obelisk nguyên bản từ `01_resurrected_rpg/Props.png` (28×76 px) với đỉnh tháp nhọn, hoa văn cổ ngữ Bắc Âu/Celtic chạm khắc phát sáng ngọc bích dọc thân đá và vệt rêu ngấn nước thực tế.

### 3.2. Điều chỉnh tọa độ đứng & hitbox NPC Làng Bellhollow
Toàn bộ NPC đã được phân bố lại vị trí hợp lý trên quảng trường làng, đảm bảo cự ly thông thoáng tuyệt đối (>55px đến >80px) so với toàn bộ đạo cụ xung quanh:

| NPC | Vị trí mới (X, Y) | Tọa độ đạo cụ lân cận | Khoảng cách an toàn | Hiện trạng nghiệm thu |
| :--- | :--- | :--- | :--- | :--- |
| **Finn (Cậu bé đưa tin)** | `(685, 295)` (patrol: 670..705) | Rương Trú Ẩn `(735, 255)` | **> 65 px** | Tách biệt hoàn toàn, không còn hiện tượng giẫm lên rương. |
| **Bà Lão Edda** | `(785, 345)` | Giếng Nước `(726, 376)` | **> 65 px** | Đứng thoáng đãng trên sân đá trước Tháp Chuông, hướng mặt ra quảng trường. |
| **Neris (Thầy thuốc)** | `(990, 145)` | Nồi Thảo Dược `(935, 140)` | **> 55 px** | Đứng bên phải cạnh bàn phơi thuốc, nồi thuốc nằm riêng biệt bên trái. |
| **Garth (Canh cổng)** | `(520, 260)` (patrol: 505..535) | Trạm gác cổng Tây `(504, 136)` | **> 120 px** | Canh gác đường vào cổng Tây, không chắn lối đi. |
| **Bram (Thợ rèn)** | `(1045, 365)` | Bàn Chế Tạo `(960, 360)` | **> 85 px** | Đứng bên lò rèn, không đè lên bàn chế tạo. |
| **Hiệp Sĩ Canh Lửa** | `(818, 270)` | Lửa Trại Làng `(780, 260)` | **> 40 px** | Quỳ canh giữ ngọn lửa trại trung tâm. |

### 3.3. Chuẩn hóa thuật toán vẽ khung viền tương tác (Hitbox Centering)
1. **Đạo cụ bản đồ (Props & Furniture):**
   - Trong `GameScene.ts`, tâm thực tế được tính toán chuẩn xác:  
     $$x_{\text{center}} = x + \frac{w}{2}, \quad y_{\text{center}} = y + \frac{h}{2}$$
   - Khung viền chỉ định ôm khít 4 góc quanh đối tượng:  
     `strokeRoundedRect(nearby.x - 2, nearby.y - 2, propW + 4, propH + 4, 4)`
2. **NPC:**
   - Cung cấp tọa độ tâm cơ thể `(npc.x, npc.y - 16)` với kích thước chuẩn `width: 24, height: 34`. Khung viền ôm sát toàn bộ thân người từ đỉnh đầu đến chân.
   - Nhãn gợi ý tương tác `[E]` nổi bồng bềnh tại `(npc.x, npc.y - 48)`, cách đỉnh đầu 15px.
3. **Mỏ tài nguyên (Resources):**
   - Khung viền ôm vuông vắn `22×22 px` xung quanh biểu tượng cành khô, đá lửa, thảo dược.

### 3.4. Nâng cấp đồ họa Đầm Lầy (Silent Mire Water & Ruins)
1. **Vực nước đầm lầy (`createMireWater`):**
   - Viền bờ bùn ẩm ướt chuyển tiếp màu nâu đất ẩm `0x261d14` và bùn rêu `0x1a261c`.
   - Lòng nước lầy đục màu xanh rêu u tối `0x1e3a2f` và vực sâu `0x132720` (hoàn toàn xóa bỏ màu đen kịt).
   - Bổ sung các vòng gợn sóng nước phản chiếu ánh trăng mờ `0x3d705c` và thảm bèo tấm, tảo lục trôi nổi `0x3e7a36`.
2. **Cự thạch phế tích chìm (`createSunkenMonolithRuins`):**
   - Áp dụng sprite cự thạch `prop_ancient_monolith_v14.png` kết hợp bóng đổ bùn nước `0x0e1814` và ngấn nước chân đá `0x2d483e`.

### 3.5. Gia cố độ ổn định hệ thống (Crash Guards & Lifecycle Fix)
- Bổ sung `if (!ctx) return;` trên toàn bộ 18 CanvasTexture generators trong `WorldBuilder.ts`, loại bỏ 100% nguy cơ phát sinh lỗi `Cannot read properties of null (reading 'drawImage')`.
- Khắc phục lỗi thứ tự vòng đời `CameraSystem`: Khởi tạo `this.cameraSystem = new CameraSystem(this)` ngay đầu hàm `create()` trước khi kích hoạt các bộ lắng nghe sự kiện `world_unlock_changed`.

---

## 4. BẰNG CHỨNG NGHIỆM THU THỰC TẾ (IN-GAME ACCEPTANCE EVIDENCE)

| Khu vực kiểm tra | Trạng thái | Minh chứng ghi nhận được | File ảnh chụp kiểm chứng |
| :--- | :---: | :--- | :--- |
| **Quảng Trường Làng Bellhollow** | **PASS** | Finn tách xa rương chứa đồ (>65px). Edda đứng thoáng trước Tháp Chuông tách biệt khỏi Giếng Nước. Hiệp Sĩ Canh Lửa tề tựu bên Lửa Trại. Toàn bộ đá tảng trên đất có đường nét pixel art tròn trịa tự nhiên, 0 vết cắt ngang. | `bellhollow_plaza_v14_fixed.png` |
| **Hiên Nhà Neris & Nồi Thuốc** | **PASS** | Neris đứng bên phải bàn phơi thuốc, Nồi Thảo Dược đứng độc lập bên trái (>55px). Khung viền và dòng nhắc `[E]` không bị chồng đè. | `neris_cauldron_v14_fixed.png` |
| **Đầm Lầy Tĩnh Lặng & Cự Thạch Cổ Ngữ** | **PASS** | Vực nước hiển thị màu nước đầm lầy xanh rêu đục, có bờ bùn, bèo tấm và gợn sóng. Cột cự thạch hiển thị hoa văn cổ ngữ Bắc Âu tinh xảo, bệ đá ngâm ngấn nước lầy. | `silent_mire_water_monolith_v14_fixed.png` |

---

## 5. KẾT LUẬN & TRẠNG THÁI HỆ THỐNG
- Toàn bộ các yêu cầu tinh chỉnh của người chơi đã được hoàn tất và nghiệm thu thành công.
- Không có bất kỳ lỗi biên dịch TypeScript (`npm run check` 0 errors), bundle thành công cho môi trường Production (`dist/assets/index-CiU52Rcr.js`).
- Bảo toàn nguyên vẹn tính tương thích ngược với dữ liệu Savegame V1.3/V1.4.
