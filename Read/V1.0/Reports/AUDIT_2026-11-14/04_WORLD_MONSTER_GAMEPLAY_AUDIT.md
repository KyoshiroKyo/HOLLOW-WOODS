# 🔍 BÁO CÁO KIỂM TOÁN ĐỘC LẬP: WORLD, MONSTER & GAMEPLAY AUDIT
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Mã báo cáo:** `04_WORLD_MONSTER_GAMEPLAY_AUDIT.md`
> **Phạm vi kiểm tra:** Trải nghiệm thực tế thế giới 5 phân khu, môi trường rừng & làng, quái vật bóng đêm, và 9 cơ chế Gameplay cốt lõi
> **Ngày thực hiện:** 2026-11-14

---

## 1. BẢNG TỔNG QUAN ĐÁNH GIÁ 5 HẠNG MỤC LỚN

| Hạng mục kiểm tra | Tiêu chí thẩm định | Kết quả thực tế trên mã nguồn & tài nguyên | Đánh giá |
|---|---|---|:---:|
| **1. TERRAIN (Địa hình)** | Độ lặp nền cỏ, chuyển tiếp bề mặt, hở tile | Lặp ô cỏ 32×32 vô tận; **không có tile transition**; **tile cỏ bị thủng 202 px trong suốt làm lộ nền đen bàn cờ** | ❌ **FAILED** |
| **2. FOREST (Rừng rậm)** | Cây cối, bụi rậm, chiều sâu, tán cây & collider | Đủ 3 loại sồi + cây khô + 2 cây rỗng; collider gốc 20×12 px tốt; nhưng bố trí thành 2 hàng song song thiếu chiều sâu | ⚠️ **PARTIAL** |
| **3. VILLAGE (Làng Bellhollow)** | Tỷ lệ công trình, đường đi, khả năng tiếp cận | Nhà (112×80), Tháp chuông (80×112) đúng tỷ lệ; đường đi rộng rãi; tiếp cận 100% các điểm cần thiết | ✅ **VERIFIED** |
| **4. MONSTERS (Quái vật)** | Preload, vị trí spawn, Animation & AI, Encounter | Preload & Spawn đúng vị trí; AI 6 trạng thái hoạt động; **HOÀN TOÀN KHÔNG CÓ ANIMATION (ảnh tĩnh trượt ngang)** | ⚠️ **PARTIAL** |
| **5. GAMEPLAY (9 cơ chế)** | Khả năng vận hành thực tế vs Khai báo mã nguồn | **5/9 cơ chế hoạt động thực tế 100%**; **4/9 cơ chế chạy ngầm trong code nhưng bị Camera Zoom 2.2× phá hủy UI** | ⚠️ **PARTIAL** |

---

## 2. PHÂN TÍCH CHI TIẾT PHẦN 1: TERRAIN (ĐỊA HÌNH & TILEMAP)

### 2.1. Nền cỏ có bị lặp quá nhiều không?
- **Hiện trạng kỹ thuật trong `src/world/WorldBuilder.ts`:**
  * Toàn bộ 5 phân khu thế giới (chiều rộng bản đồ lên tới hơn 5000 px) đều dùng chung một câu lệnh:
    ```typescript
    const ground = this.scene.add.tileSprite(bounds.x, bounds.y, bounds.width, bounds.height, baseTexture);
    ```
  * `baseTexture` được gán bằng `TILE_FOREST_GRASS` (`tile_forest_grass.png`, kích thước ô chỉ **32×32 px**).
  * Việc lặp lại một hoa văn 32×32 pixel trên một diện tích hàng triệu pixel vuông tạo ra sự lặp lại đơn điệu và nặng nề về mặt thị giác.
  * Trầm trọng hơn: File `tile_forest_grass.png` bị cắt nhầm vào ô trang trí của `forest_Tileset.png`, chứa một đốm bóng đổ sẫm màu ở góc. Đốm đen này bị nhân bản đều đặn mỗi 32 pixel, tạo thành một mạng lưới chấm đen dày đặc trên toàn bộ bề mặt thế giới.

### 2.2. Có chuyển tiếp giữa cỏ, đất, đá, bùn không? (Tile Transitions)
- **HOÀN TOÀN KHÔNG CÓ BẤT KỲ TILE CHUYỂN TIẾP NÀO:**
  * Trong `renderZoneTerrain`:
    * Đường mòn đất (`tile_dirt_trail`) được vẽ bằng các dải chữ nhật cứng nhắc: `y: 160, width: bounds.width, height: 50`.
    * Đường đá cuội (`tile_cobble_road`) tại làng Bellhollow là các hình chữ nhật phẳng lì: `y: 240, width: bounds.width, height: 60`.
    * Sân Miếu Chuông (`tile_stone_floor`) là một khối hộp chữ nhật: `x + 200, y: 160, w: 560, h: 280`.
    * Đầm lầy Silent Mire sử dụng trực tiếp `tile_swamp_mud` phủ nguyên khối chữ nhật.
  * Không hề có hệ thống Auto-tiling (như 47-tile bitmasking hay Wang tiles), không có tile bo viền (edge/corner tiles), không có hiệu ứng hòa trộn alpha (alpha blending/feathering) ở mép đường. Bờ cỏ và lòng đường gặp nhau bằng một đường thẳng sắc lẹm 90 độ hoàn toàn thiếu tự nhiên.

### 2.3. Có bị hở tile hoặc sai kích thước không?
- **Hiện tượng "thủng lỗ chỗ" (Visual Seams & Holes):**
  * Về mặt toán học, `TileSprite` của Phaser ghép các ô 32×32 liền kề nhau không bị khe hở pixel giữa các ô.
  * **TUY NHIÊN:** Kết quả kiểm toán nhị phân từ Pass T07 cho thấy trong 1024 pixel của ô `tile_forest_grass.png`, có tới **202 pixel hoàn toàn trong suốt (Alpha = 0)**.
  * Do các pixel ở rìa ô bị trong suốt, khi ghép cạnh nhau, mặt đất xuất hiện hàng vạn "lỗ thủng", để lộ màu nền đen xì `#0b0c10` của canvas bên dưới. Mặt đất trông giống như một tấm lưới rách hoặc bàn cờ loang lổ.
  * Kích thước các tile bị trộn lẫn: Cỏ và Bùn là 32×32 px, trong khi Đá cuội (`tile_cobble_road`) và Sàn đá (`tile_stone_floor`) lại là 16×16 px, dẫn đến tỷ lệ mật độ pixel (texel density) không đồng nhất khi hiển thị.

---

## 3. PHÂN TÍCH CHI TIẾT PHẦN 2: FOREST (KHU RỪNG THE CROOKED PATH)

### 3.1. Có đủ cây, bụi rậm, gốc cây và vật trang trí không?
- **Khảo sát số lượng đối tượng trong phân khu rừng `crooked_path`:**
  * **Cây sồi cổ thụ:** Được sinh bằng vòng lặp toán học cách đều 180 px (`for (let x = bounds.x + 80; x < bounds.x + bounds.width - 80; x += 180)`). Tổng cộng khoảng **14 cây sồi** được chia làm 2 hàng trên và dưới.
  * **Gốc cây rỗng (Hollow Tree):** Có đúng **2 cây rỗng** đặt tại `(1900, 180)` và `(2350, 420)` làm nơi ẩn nấp.
  * **Bụi rậm dày đặc (Dense Bush):** Có **3 cụm bụi rậm** tại `(1820, 260)`, `(2180, 200)`, và `(2500, 380)`.
  * **Tảng đá (Rock):** Có **1 tảng đá** tại `(2100, 280)`, nhưng vẫn bị vẽ bằng hình elip hình học `fillEllipse` nguyên bản!
- **Đánh giá mật độ:** Trên một phân khu dài gần 1200 pixel, số lượng vật thể môi trường khá thưa thớt. Khoảng không gian ở giữa đường mòn bị trống trải, thiếu các chi tiết nhỏ như nấm, cành cây khô rơi rụng, cỏ dại hay lá rụng.

### 3.2. Khu rừng có chiều sâu không?
- **Chiều sâu theo trục Y (Y-Sorting):**
  * Tốt. Cây cối được cấu hình `tree.setDepth(y)`, người chơi cấu hình `this.setDepth(Math.floor(this.y))`. Khi nhân vật di chuyển từ trên xuống dưới, thứ tự hiển thị trước sau giữa người và gốc cây chuyển đổi chính xác.
  * Có 3 biến thể cây sồi (`tree_oak_1..3`) thay đổi luân phiên theo modulo tọa độ X, tạo sự đa dạng về hình thái tán lá.
- **Hạn chế về chiều sâu không gian (Layering / Parallax):**
  * Toàn bộ cây cối được đặt trên cùng một mặt phẳng thế giới. Thiếu hẳn lớp cây mờ phía hậu cảnh (Background Parallax Trees) và lớp cành lá phía tiền cảnh (Foreground Canopy Shadows) để tạo cảm giác ngột ngạt, rậm rạp của một khu rừng kinh dị sinh tồn.
  * Bố cục 2 hàng cây chạy song song thẳng tắp khiến khu rừng có cấu trúc dạng "hành lang phẳng" (linear corridor) hơn là một khu rừng nguyên sinh tự nhiên.

### 3.3. Tán cây và Collider có phù hợp không?
- **Điểm neo gốc (Anchor):** `tree.setOrigin(0.5, 0.88)` đặt gốc cây khớp đúng với tọa độ vật lý.
- **Hộp va chạm gốc cây:** `body.setSize(20, 12)` với offset `(-10, -6)`.
- **Đánh giá trải nghiệm di chuyển:**
  * Hộp va chạm nhỏ `20×12` px nằm gọn ở gốc cây, trong khi tán lá sồi rộng từ 95 px đến 113 px.
  * Khi người chơi đi từ phía trên xuống, nhân vật có thể đi xuyên mượt mà bên dưới tán lá và chỉ bị cản lại khi chạm vào thân gỗ ở gốc.
  * Đây là một điểm sáng thiết kế tốt, mang lại cảm giác nhân vật thực sự bước đi dưới bóng râm của cây cổ thụ.

---

## 4. PHÂN TÍCH CHI TIẾT PHẦN 3: VILLAGE (LÀNG BELLHOLLOW)

### 4.1. Tỷ lệ công trình, đường sá và NPC
- **Kích thước các công trình trong làng:**
  * `house_edda.png` (Nhà Edda): `112 × 80` px (Mái rạ nâu ấm áp).
  * `house_neris.png` (Nhà Neris): `112 × 80` px (Mái ngói xanh rêu thảo dược).
  * `bell_tower.png` (Tháp Chuông cổ): `80 × 112` px (Tháp chuông đá cao vút).
  * `village_well.png` (Giếng nước): `48 × 48` px.
  * `crafting_bench.png` (Bàn chế tạo): `48 × 32` px.
  * Thân hình nhân vật và NPC: Khoảng `24 × 48` px (trong khung 64×64).
- **Đánh giá tỷ lệ thẩm mỹ:**
  * Ngôi nhà rộng gấp 4.6 lần và cao gấp 1.7 lần nhân vật, thể hiện đúng tỷ lệ một căn nhà gỗ nhỏ thời trung cổ.
  * Tháp chuông cao gấp 2.3 lần nhân vật, tạo điểm nhấn kiến trúc uy nghi ở trung tâm làng.
  * Tỷ lệ giữa nhà ở, giếng nước, bàn chế tạo và nhân vật hoàn toàn cân xứng và hài hòa theo chuẩn mực Pixel Art cổ điển.

### 4.2. Khả năng di chuyển và tiếp cận các vị trí cần thiết
- **Bố cục vật lý và không gian di chuyển:**
  * Phân khu làng Bellhollow có diện tích `1120 × 540` px.
  * Trục đường chính lát đá cuội rộng 60 px chạy ngang từ X: 480 đến X: 1600.
  * Có 3 nhánh đường phụ dẫn thẳng tới:
    1. Cửa nhà bà lão Edda (đường nhánh 40×130 px tại X: 700).
    2. Cửa nhà thảo dược sĩ Neris (đường nhánh 40×130 px tại X: 960).
    3. Chân Tháp Chuông làng (đường nhánh 50×120 px tại X: 820).
- **Collider chân tường:**
  * Các ngôi nhà có collider đặt ở chân tường (`body.setSize(w, 24)`), cho phép người chơi bước lên bậc thềm và đứng ngay trước cửa nhà để tương tác với NPC.
  * Tháp chuông có collider `80×32` tại chân, chừa trọn vẹn bệ thờ chuông ở tọa độ `(840, 350)` để người chơi gắn Lưỡi Chuông.
  * **Kết luận:** Người chơi hoàn toàn có thể di chuyển thông suốt, không bị bất kỳ chướng ngại vật nào gây kẹt góc hay cản trở lối đi.

---

## 5. PHÂN TÍCH CHI TIẾT PHẦN 4: MONSTERS (QUÁI VẬT BÓNG ĐÊM)

### 5.1. The Listener và The Echo có được Preload không?
- **Kiểm tra `src/scenes/PreloadScene.ts`:**
  * Dòng 135: `this.load.image(SPRITE_THE_LISTENER, 'assets/monsters/the_listener.png');`
  * Dòng 138: `this.load.image(SPRITE_THE_ECHO, 'assets/monsters/the_echo.png');`
  * Cả 2 texture đều được nạp đầy đủ vào bộ nhớ đệm đồ họa của Phaser trước khi GameScene khởi tạo.

### 5.2. Có Spawn đúng vị trí quy định không?
- **The Listener:**
  * Được khởi tạo trong `GameScene.ts` (hàm `spawnTheListener`) với 3 điểm tuần tra (waypoints) nằm sâu trong rừng Crooked Path: `(1950, 220)`, `(2280, 380)`, `(2600, 240)`.
  * Đúng vị trí phân khu rừng rậm ngăn cách giữa làng và đầm lầy theo kịch bản cốt truyện.
- **The Echo:**
  * Trong Act 0 (Fog Crossing), xuất hiện tại `(280, 180)` dưới dạng đồ họa bán trong suốt `act0EchoGfx` để dẫn lối người chơi về làng Bellhollow.
  * Trong `EchoSystem.ts`, bóng ma Echo xuất hiện chớp tắt khi bình tâm của người chơi sụt giảm xuống dưới mức nguy hiểm.

### 5.3. Có Animation và AI không? (BẤT THƯỜNG QUÁI VẬT TRƯỢT TĨNH)
- **Animation: ❌ HOÀN TOÀN KHÔNG CÓ HOẠT ẢNH!**
  * Tệp `public/assets/monsters/the_listener.png` là một **ảnh tĩnh đơn lẻ (Single Frame 64×64 px)** được cắt từ `idle.png frame 0`.
  * Không có spritesheet, không có hoạt ảnh bước đi, vung đao hay gầm thét.
  * Khi di chuyển tuần tra hay rượt đuổi người chơi, quái vật chỉ là một **bức ảnh phẳng trượt tịnh tiến ngang trên màn hình (Sliding Static Sprite)**.
  * Tương tự, `the_echo.png` là ảnh tĩnh 32×64 px không có animation frames.
- **Trí tuệ nhân tạo (AI): ✅ CÓ HỆ THỐNG AI ĐẦY ĐỦ TRONG `ListenerAI.ts`:**
  * Quản lý cỗ máy trạng thái (FSM) gồm 6 trạng thái:
    1. `PATROL`: Đi tuần giữa các waypoints với vận tốc 45 px/s.
    2. `ALERT_TELEGRAPH`: Cảnh giác khi nghe tiếng động, hiển thị icon chấm than '!' trên đầu trong 0.8s.
    3. `INVESTIGATE_SOUND`: Tiến tới vị trí phát ra tiếng bước chân chạy nhanh hoặc mồi nổ.
    4. `CHASE`: Rượt đuổi người chơi với vận tốc cao (110 px/s).
    5. `SEARCH`: Mất dấu người chơi, tìm kiếm quanh khu vực trong 3.5s.
    6. `RETURN`: Từ bỏ truy lùng, quay trở lại lộ trình tuần tra ban đầu.

### 5.4. Có thể kích hoạt Encounter (Chạm trán) không?
- **Cơ chế kích hoạt chạm trán trong `GameScene.ts`:**
  * **Kích hoạt qua tiếng ồn bước chân:** Khi người chơi nhấn giữ Shift để chạy nhanh (`isSprinting`), `listenerMonster.hearSound(...)` được gọi mỗi 0.25s ở cự ly nghe 140 px. Quái vật ngay lập tức chuyển sang trạng thái cảnh giác và lao tới điều tra.
  * **Kích hoạt qua mồi ném (Phím Q):** Mồi nổ phát ra âm thanh âm lượng cực đại (bán kính nghe mở rộng), kéo quái vật rời khỏi vị trí rình rập.
  * **Tấn công và gây sát thương:** Khi cự ly giữa quái vật và người chơi $\le 28$ px và người chơi không ẩn nấp (`!isHiding`):
    * Người chơi bị trừ 25 Máu và 30 Bình tâm.
    * Màn hình rung lắc mạnh (`cameraSystem.shake`) và chớp đỏ cảnh báo.
    * Hiện thông báo nguy cấp: *"⚠️ BẠN ĐÃ BỊ KẺ LẮNG NGHE TẤN CÔNG! Hãy nấp ngay vào Thân Cây Rỗng!"*.
  * **Sự kiện rượt đuổi Act 5 (Act 5 Chase Sequence):** Sau khi giải mã xong đầm lầy, sương mù chuyển sang màu tím đậm, The Listener kích hoạt truy đuổi tốc độ cao bắt buộc người chơi phải chạy tháo thân về cổng làng.

---

## 6. PHÂN TÍCH CHI TIẾT PHẦN 5: BẢNG KIỂM TOÁN 9 CƠ CHẾ GAMEPLAY CỐT LÕI

Dưới đây là bảng đối chiếu chi tiết giữa **tính năng thực sự hoạt động trong game** và **tính năng chỉ mới được khai báo trong code nhưng bị lỗi vô hiệu hóa**:

| Cơ chế Gameplay | Trạng thái thực tế | Cơ chế hoạt động chi tiết | Điểm nghẽn / Lỗi kỹ thuật phát hiện |
|---|:---:|---|---|
| **1. Thu thập tài nguyên (Gathering)** | ✅ **HOẠT ĐỘNG 100%** | 14 điểm tài nguyên (Gỗ, Đá lửa, Nhựa thông, Thảo dược) rải khắp 5 phân khu. Lại gần cự ly 34 px nhấn `[E]` nhặt đồ, có hiệu ứng nổ hạt và tự hồi sinh sau 40s. | Không có lỗi. Hoạt động trơn tru. |
| **2. Quản lý kho đồ (Inventory)** | ✅ **HOẠT ĐỘNG 100%** | `PlayerState` lưu trữ số lượng từng vật phẩm trong Map. Bắt sự kiện cộng/trừ chính xác. Thanh phím tắt đáy cập nhật số lượng Thuốc đắp và Mồi ném theo thời gian thực. | Không có lỗi. Dữ liệu chuẩn xác. |
| **3. Bàn Chế Tạo (Crafting)** | ⚠️ **CHỈ CHẠY CODE NGẦM** | `CraftingSystem.ts` có đủ 3 công thức chế tạo sinh tồn (Dầu Đèn, Thuốc Đắp, Mồi Tiếng Động). Hàm `craft()` trừ đúng nguyên liệu và cộng đúng sản phẩm. | **LỖI TỬ HUYỆT:** `CraftingModal` nằm trong `GameScene`, bị Zoom 2.2× phóng to thành `1848×1144` px, tràn vỡ màn hình, người chơi không thể click nút chế tạo! |
| **4. Đèn Lồng Sinh Tồn (Lantern)** | ✅ **HOẠT ĐỘNG 100%** | Nhấn `[F]` bật/tắt đèn. Bật đèn tiêu hao dầu (0.8/s), tỏa quầng sáng hổ phách ấm áp bám theo nhân vật, hồi phục Bình tâm. Tắt đèn thì ánh sáng thu hẹp và Bình tâm sụt giảm. | Hoạt động tốt. Nhưng `updateFogOfWar` tạo/hủy Graphics ở 60 FPS gây giật cục định kỳ. |
| **5. Sổ Tay Lữ Khách (Journal)** | ⚠️ **CHỈ CHẠY CODE NGẦM** | `JournalModal.ts` và `lore.json` định nghĩa hoàn chỉnh Tab 1 (Danh sách nhiệm vụ & Các hồi) và Tab 2 (Các trang cổ thư & Manh mối). Phím `[J]` mở sổ tay. | **LỖI TỬ HUYỆT:** `JournalModal` nằm trong `GameScene`, bị Zoom 2.2× phóng to thành `1848×1144` px, tràn vỡ màn hình, không thể đọc trang hay chuyển tab! |
| **6. Hệ thống Nhiệm Vụ (Quest)** | ✅ **HOẠT ĐỘNG 100%** | Chuỗi 7 nhiệm vụ từ Act 0 (`Q00_WAKE_UP`) đến Act 6 (`Q06_RETRIEVE_CLAPPER`). Khung nhiệm vụ góc trên phải của `UIScene` cập nhật tên quest và task mục tiêu hiện tại chuẩn xác. | Hoạt động hoàn hảo trên `UIScene` (zoom 1.0). |
| **7. Hệ thống Giải Đố (Puzzles)** | ✅ **HOẠT ĐỘNG 100%** | - **Câu đố 1 (Chiếc Đèn Ma):** Tiếp cận đèn ma bị đẩy lùi về lối mòn; soi sáng đủ 3 cây ký hiệu bằng đèn lồng sẽ hóa giải đèn ma.<br>- **Câu đố 2 (Cột Đá Silent Mire):** Kích hoạt đúng thứ tự Mặt Trăng -> Rễ Cây -> Con Mắt để mở đường; bấm sai tự reset. | Hoạt động chuẩn xác 100%, có chống soft-lock và phát âm thanh/hiệu ứng ánh sáng. |
| **8. Cơ chế Ẩn Nấp (Hiding)** | ✅ **HOẠT ĐỘNG 100%** | Tiếp cận Thân Cây Rỗng (`hollow_tree`), nhấn `[E]` để chui vào trong ẩn nấp. Nhân vật tàng hình, vận tốc về 0. The Listener hoàn toàn không phát hiện được người chơi khi đi ngang qua. | Hoạt động rất tốt, tạo trải nghiệm lén lút sinh tồn chân thực. |
| **9. Hoạt cảnh Kết Thúc (Ending)** | ⚠️ **CHỈ CHẠY CODE NGẦM** | Gắn Lưỡi Chuông vào bệ thờ tháp chuông rung chuông vang dội -> Rung lắc chớp trắng -> Kích hoạt Khe Thời Đại Time Rift hé lộ xe ô tô quốc lộ -> Chạy 7 dòng credits kết thúc. | **LỖI TỬ HUYỆT:** Nằm trong `GameScene` (zoom 2.2×). Lời thoại bị đẩy xuống Y=910 px, nút "QUAY VỀ MENU CHÍNH" bị đẩy xuống Y=987 px -> **Người chơi bị kẹt vĩnh viễn (Soft-lock)!** |

---

## 7. TỔNG KẾT & ĐÁNH GIÁ CHUNG CỦA KIỂM TOÁN VIÊN ĐỘC LẬP

### 🎯 Điểm Sáng Kỹ Thuật Đạt Chuẩn (Highlights):
1. **Mạch logic Game Loop hoàn chỉnh:** Hệ thống thu thập tài nguyên, chế tạo, nhiệm vụ 7 hồi, câu đố 3 cột đá, đèn lồng và cơ chế ẩn nấp né tránh quái vật đều được lập trình với tư duy game design rất chặt chẽ, không có lỗi logic ngầm.
2. **Kiến trúc làng Bellhollow chuẩn mực:** Tỷ lệ công trình, đường đi lối lại và collider chân tường tạo nên một không gian làng quê trung cổ hài hòa, ấm áp và dễ điều hướng.
3. **AI Quái vật The Listener phản ứng âm thanh tốt:** FSM 6 trạng thái xử lý tiếng ồn chạy nhanh và mồi ném rất nhạy bén, tạo được áp lực sinh tồn.

### ⚠️ Những Lỗi Nghiêm Trọng Phá Hủy Trải Nghiệm Thực Tế (Critical Bottlenecks):
1. **Lỗi Tile cỏ bàn cờ đen loang lổ (T07):** Do cắt nhầm 202 pixel trong suốt, mặt đất toàn bộ thế giới trông như một bãi phế tích thủng lỗ chỗ, phá hủy hoàn toàn mỹ thuật Pixel Art.
2. **Quái vật The Listener trượt tĩnh không có Animation (T10):** Một con quái vật đáng sợ trong lore nhưng khi xuất hiện lại là một bức ảnh tĩnh đơn lẻ trượt ngang như một tấm bìa carton, làm mất đi 90% không khí kinh dị.
3. **Lỗi Camera Zoom 2.2× làm tê liệt 4/9 hệ thống Gameplay (T13, T15, T18):**
   * Người chơi không thể chế tạo đồ (vì Bàn Chế Tạo nổ to tràn màn hình).
   * Người chơi không thể đọc sổ tay cổ thư (vì Sổ Tay nổ to tràn màn hình).
   * Người chơi không thể nói chuyện với NPC (vì Hộp thoại rơi xuống đáy màn hình).
   * Người chơi bị kẹt cứng ở màn hình kết thúc Act 6 (vì Nút bấm quay về Menu chính bị đẩy ra ngoài màn hình).

---
*Báo cáo kiểm toán độc lập được thực hiện bởi Senior Game QA Engineer – Dự án HOLLOW WOODS V3.0.*
