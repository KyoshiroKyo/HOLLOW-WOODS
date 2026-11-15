# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT COMMAND C4-12-19
## XÂY DỰNG BẢN ĐỒ MÔI TRƯỜNG CHO NÔNG TRẠI SANCTUARY FARM VÀ KẾT NỐI VỚI LÀNG BELLHOLLOW

- **Mã hiệu:** `COMMAND C4-12-19`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phạm vi áp dụng:** Khu vực Nông Trại Sanctuary Farm (`sanctuary_farm`, Layer 1 — Core World) & Cổng Nam kết nối Làng Bellhollow (`bellhollow`).
- **Phong cách nghệ thuật:** Visual Direction A — Dark Woodland Pixel Art.
- **Kiến trúc không gian:** World Structure C — Hybrid Open World (Tầng 1 — Core World).
- **Trạng thái thực thi:** **HOÀN THÀNH TOÀN DIỆN (100% PASS — 44/44 TESTS, 0 ERRORS)**.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH THIẾT KẾ C4-12-19

Dựa trên mặt bằng phân tầng Vùng Lõi (Core World Blockout từ C4-12-17), cơ chế canh tác thảo dược 4 ô đất (Farming MVP từ C4-12-16) và sổ đăng ký kết nối vùng (Zone Connection Registry C4-12-11), bước C4-12-19 triển khai thiết kế chi tiết môi trường cảnh quan cho **Nông Trại Trú Ẩn (Sanctuary Farm)** với các mục tiêu cốt lõi:

1. **Thiết kế không gian ấm cúng, thoáng đãng và có trật tự:** Biến vùng đất phía Nam làng Bellhollow thành một nông trại trú ẩn bình dị, hòa hợp với thiên nhiên rừng sồi cổ thụ, tách biệt khỏi sự u ám của sương mù nhưng vẫn giữ được phong cách *Dark Woodland Pixel Art*.
2. **Khu vực Canh tác Thảo Dược (Sanctuary Herb Terrace):** Tái định vị 4 ô đất trồng thảo dược (`plot_1` đến `plot_4`) vào một gò đất màu mỡ có bờ đá bo viền, có máng nước tưới và xô múc nước bằng gỗ; khoảng cách giữa các ô rộng rãi ($\ge 40\text{ px}$ giữa 2 cột, $\ge 30\text{ px}$ giữa 2 hàng) để người chơi di chuyển, đứng tưới, gieo hạt và thu hoạch hoàn toàn thông thoáng.
3. **Mái che & Bàn sơ chế (Herbalist Processing Shelter & Workbench):** Bố trí một giàn che gỗ (Pergola) có mái lợp ván nghiêng, treo những chùm thảo mộc phơi khô, đặt bàn sơ chế gỗ với cối chày đá, thớt băm và hũ thuốc thảo mộc; tích hợp chức năng chế tạo phím `[E]` tương đương bàn chế tạo trung tâm làng.
4. **Giếng nước nông trại & Nguồn tưới (Farm Water Well):** Bố trí giếng đá cổ tại $(920, 700)$ cấp nước ngọt mát lành cho nông trại, có rãnh dẫn nước và máng gỗ.
5. **Đạo cụ môi trường sinh động (Storytelling Props):** Bổ sung xe cút kít gỗ (Wheelbarrow) chở đất mùn và mầm cây, rương trữ nông sản, cụm củi khô, thùng gỗ nông trại, đèn lồng cột gỗ dẫn hướng và hệ thống biển chỉ dẫn (Biển Đón Nông Trại & Biển Đề Danh Vườn Dược).
6. **Kết nối mượt mà với Làng Bellhollow:** Con đường đất nén tự nhiên kéo dài từ Cổng Nam Bellhollow $(610..710, 560)$ uốn lượn xuống sân trung tâm nông trại, không có bất kỳ vật cản hay hộp va chạm nào chặn đứng đường đi của người chơi.

---

## 2. CHI TIẾT CÁC THAY ĐỔI VÀ TÍCH HỢP HỆ THỐNG

### 2.1. Tái Định Vị 4 Ô Đất & Tự Động Di Chuyển Dữ Liệu Lưu (`src/state/PlayerState.ts`)
- **Tọa độ thực tế mới tại Vườn Dược Nông Trại:**
  - `plot_1`: $(760, 640)$ — Hàng trên, bên trái
  - `plot_2`: $(840, 640)$ — Hàng trên, bên phải (cách $80\text{ px}$ tim sang tim)
  - `plot_3`: $(760, 690)$ — Hàng dưới, bên trái (cách $50\text{ px}$ hàng trên)
  - `plot_4`: $(840, 690)$ — Hàng dưới, bên phải
- **Cơ chế Tương Thích Ngược & Tự Động Nâng Cấp Tọa Độ (`auto-migration`):**
  Trong phương thức `setHerbPlots()` của `PlayerState`, khi người chơi tải lại file save cũ (từng lưu tọa độ tạm thời tại Bellhollow $1045, 430$), hệ thống sẽ tự động ánh xạ về 4 vị trí chuẩn xác mới tại Sanctuary Farm mà không làm mất trạng thái cây trồng (`empty`, `planted`, `growing`, `harvest_ready`) hay thời gian sinh trưởng đã tích lũy.

### 2.2. Đăng Ký Đối Tượng Tương Tác Mới (`src/data/zones.json`)
Bổ sung danh mục tương tác hoàn chỉnh cho `sanctuary_farm`:
1. `farm_storage_chest` $(680, 640)$: Rương trữ nông sản và hạt giống.
2. `farm_processing_bench` $(685, 630)$ với `type: "workbench"`: Cho phép người chơi đứng tại nông trại mở giao diện chế tạo thuốc đắp thảo mộc và bình dầu đèn.
3. `farm_water_well` $(920, 700)$: Giếng nước ngọt nông trại, kiểm tra và hiển thị thông điệp thư giãn.
4. `farm_welcome_sign` $(615, 590)$: Biển gỗ đón khách tại cửa ngõ phía Bắc nông trại.
5. `farm_herb_terrace_sign` $(730, 625)$: Biển đề danh và hướng dẫn canh tác tại Vườn Dược.

### 2.3. Xử Lý Tương Tác Môi Trường Trong GameScene (`src/scenes/GameScene.ts`)
Tích hợp các câu thoại phản hồi sinh động khi người chơi nhấn `[E]` tương tác với cảnh vật nông trại:
- **Giếng Nước Nông Trại:** *"💧 Giếng Nước Nông Trại: Nguồn nước trong lành mát lạnh dùng để tưới 4 luống thảo dược."*
- **Biển Gỗ Nông Trại:** *"📜 Biển Gỗ: 'NÔNG TRẠI TRÚ ẨN — Vùng đất bình yên để gieo trồng thảo dược và dự trữ sinh tồn.'"*
- **Biển Vườn Dược:** *"🌿 Vườn Dược Sanctuary: '4 Ô đất màu mỡ trồng Thảo Dược Bạc. Nhấn [E] khi đứng gần ô đất để gieo hạt hoặc thu hoạch.'"*

### 2.4. Đồ Họa Cảnh Quan & Đạo Cụ Pixel Art (`src/world/WorldBuilder.ts`)
Triển khai đồ họa độc quyền theo chuẩn nghệ thuật *Dark Woodland*:
- `createHerbalistProcessingShelter(x: 685, y: 625)`:
  - 4 cột gỗ sồi già chịu lực vát cạnh.
  - Mái che dốc lợp ván gỗ phong rêu xanh mướt.
  - 4 bó thảo dược phơi khô đa sắc độ (vàng óng, xanh nhạt, xanh non) treo dưới xà nhà.
  - Mặt bàn gỗ dày với thớt băm, cối chày đá màu xám bạc và lọ thuốc hổ phách phản quang.
- `createSanctuaryHerbTerrace(x: 730, y: 625)`:
  - Máng nước gỗ dài chứa mặt nước trong veo màu xanh ngọc bích (`0x29b6f6`) có gợn sáng.
  - Xô múc nước bằng gỗ đai sắt với quai cầm chắc chắn.
  - Biển cắm cọc gỗ mộc mạc đề danh vườn dược.
- `createFarmWheelbarrow(x: 615, y: 710)`:
  - Xe cút kít 1 bánh gỗ cổ điển, có càng đẩy đôi.
  - Chở đầy đất mùn màu mỡ và những nhánh thảo mộc tươi vừa thu hoạch.
- **Tối ưu vị trí cây cối:** Di dời các gốc cây thông cũ tại $(760, 660)$ và $(840, 660)$ sang bờ dốc phía Bắc $(760, 595)$ và $(850, 595)$ để giải phóng hoàn toàn không gian cho 4 ô đất, tuyệt đối không có thân cây hay bóng cây che khuất luống thảo mộc.

---

## 3. BẢNG TỌA ĐỘ VÀ VÙNG DI CHUYỂN NÔNG TRẠI SANCTUARY

| Vị trí / Đối tượng | Tọa độ Thế giới $(x, y)$ | Kích thước | Chiều sâu (Depth) | Chức năng / Tương tác |
| :--- | :---: | :---: | :---: | :--- |
| **Cổng vào từ Bellhollow** | $(610..710, 560)$ | $100\text{ px}$ rộng | Ground (1) | Lối đi thông thoáng nối làng vào nông trại |
| **Sân trung tâm Nông Trại** | $(600..720, 600..740)$ | $120 \times 140\text{ px}$ | Ground (1) | Sân sinh hoạt, quay đầu và đi lại tự do |
| **Nhà kho nông trại** | $(540, 680)$ | $100 \times 50\text{ px}$ | $730$ | Công trình bối cảnh nông thôn với mái rơm |
| **Mái che & Bàn sơ chế** | $(685, 625)$ | $46 \times 22\text{ px}$ | $639$ | Bàn sơ chế dược liệu, tương tác chế tạo `[E]` |
| **Rương Trú Ẩn Nông Trại** | $(680, 640)$ | $22 \times 16\text{ px}$ | $645$ | Rương trữ vật phẩm, tương tác `[E]` |
| **Xe cút kít nông sản** | $(615, 710)$ | $24 \times 12\text{ px}$ | $718$ | Đạo cụ kể chuyện không gian |
| **Vườn Dược (Herb Terrace)** | $(730..865, 625..720)$ | $135 \times 95\text{ px}$ | Ground (2) | Vùng đất gieo trồng thảo dược bạc |
| **Ô đất 1 (`plot_1`)** | $(760, 640)$ | $40 \times 20\text{ px}$ | $640$ | Canh tác 4 giai đoạn, tương tác `[E]` |
| **Ô đất 2 (`plot_2`)** | $(840, 640)$ | $40 \times 20\text{ px}$ | $640$ | Canh tác 4 giai đoạn, tương tác `[E]` |
| **Ô đất 3 (`plot_3`)** | $(760, 690)$ | $40 \times 20\text{ px}$ | $690$ | Canh tác 4 giai đoạn, tương tác `[E]` |
| **Ô đất 4 (`plot_4`)** | $(840, 690)$ | $40 \times 20\text{ px}$ | $690$ | Canh tác 4 giai đoạn, tương tác `[E]` |
| **Giếng Nước Nông Trại** | $(920, 700)$ | $28 \times 28\text{ px}$ | $705$ | Giếng đá cấp nước, kiểm tra tương tác `[E]` |

---

## 4. KẾT QUẢ KIỂM THỬ VÀ XÁC NHẬN CHẤT LƯỢNG

Hệ thống đã trải qua quy trình kiểm thử tự động nghiêm ngặt thông qua bộ script `scripts/verify_sanctuary_farm_c4_12_19.mjs` và các bài kiểm tra hồi quy:

### 4.1. Kết quả kiểm tra C4-12-19 (`verify_sanctuary_farm_c4_12_19.mjs`)
- **Nhóm 1 — Toàn vẹn Bản Lưu Dự Phòng (Pre-Backup):** 6/6 PASS (Đầy đủ bản sao lưu trước khi sửa đổi tại `Backups/C4-12-19_PRE_BACKUP/`).
- **Nhóm 2 — Tọa độ Ô Đất & Di Chuyển Tự Động (`PlayerState.ts`):** 6/6 PASS (4 ô đất đặt chính xác, hỗ trợ chuyển đổi dữ liệu lưu từ bản cũ mượt mà).
- **Nhóm 3 — Cấu hình Phân Khu & Interactables (`zones.json`):** 8/8 PASS (Kích thước 640x480, đủ 5 đối tượng tương tác mới, phân loại workbench chuẩn).
- **Nhóm 4 — Đồ Họa Cảnh Quan & Đạo Cụ (`WorldBuilder.ts`):** 11/11 PASS (Khởi tạo đầy đủ mái che sơ chế, máng nước, xe cút kít, dời cây cối an toàn).
- **Nhóm 5 — Xử Lý Tương Tác Cảnh Vật (`GameScene.ts`):** 5/5 PASS (Phản hồi tương tác giếng nước, biển gỗ chào đón và biển vườn dược hoạt động chuẩn xác).
- **Nhóm 6 — Thông Thoáng Luồng Di Chuyển & Va Chạm:** 8/8 PASS (Không có hộp va chạm đè lên ô đất, khoảng cách giữa 2 cột đạt $80\text{ px}$, khoảng cách giữa 2 hàng đạt $50\text{ px}$, lối vào phía Bắc rộng $100\text{ px}$ hoàn toàn tự do).
- **TỔNG KẾT:** **44 / 44 BÀI TEST ĐẠT (100% PASS)**.

### 4.2. Kiểm tra Hồi Quy (Regression Tests)
- `verify_farming_c4_12_16.mjs`: **33 / 33 PASS (100%)** — Toàn bộ cơ chế gieo hạt, trừ túi đồ, tính thời gian không drift, chống nhân đôi và thu hoạch tiếp tục vận hành hoàn hảo.
- `verify_core_world_blockout_c4_12_17.mjs`: **49 / 49 PASS (100%)** — Khung mặt bằng Core World, phân vùng biên viễn, rào chắn phân đoạn và camera bounds không bị xáo trộn.
- `npx tsc --noEmit`: **0 ERRORS** — Kiểm tra kiểu dữ liệu toàn dự án sạch sẽ tuyệt đối.
- **Trình duyệt / Vite Server:** Server chạy ổn định tại `http://localhost:3000/`, tốc độ khung hình duy trì $60\text{ FPS}$ mượt mà, không giật lag khi chuyển động camera qua lại giữa Làng Bellhollow và Sanctuary Farm.

---

## 5. KẾT LUẬN VÀ BƯỚC TIẾP THEO

Bước **`C4-12-19`** đã hoàn thành xuất sắc việc xây dựng thế giới môi trường cho Nông trại Sanctuary Farm, tạo nên một không gian canh tác thảo dược ấm áp, sinh động và kết nối thông suốt với Làng Bellhollow.

Dự án đã sẵn sàng cho bước tiếp theo trong lộ trình Vùng Lõi:
👉 **COMMAND C4-12-20: Mở Rộng Bản Đồ Môi Trường Vùng Rừng Ven (Outer Woods Map Expansion).**
