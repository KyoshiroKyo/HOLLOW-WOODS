# BỘ LỆNH ĐIỀU HÀNH PHÁT TRIỂN HOLLOW WOODS V1.4
## THE FOG THAT REMEMBERS — SURVIVAL & CONTENT EXPANSION
**Nền tảng:** Antigravity IDE (AG) | **Workspace:** `G:\HOLLOW WOODS`  
**Phiên bản gốc:** V1.3.x (Bản ổn định P2Game) ➔ **Nhánh phát triển:** `feat/v1.4-expansion`  
**Ngày thiết lập:** 17/11/2026 | **Tác giả:** Kyoshiro Game Studio

---

> [!IMPORTANT]
> **QUY TẮC AN TOÀN TUYỆT ĐỐI CHO TẤT CẢ CÁC LỆNH:**
> 1. **Bảo vệ bản V1.3.3 đang chạy P2Game:** Toàn bộ công việc V1.4 được thực hiện trên nhánh Git riêng `feat/v1.4-expansion`.
> 2. **Bảo toàn 100% Save V1.3:** Không đổi trực tiếp các runtime key cũ (`res_dry_wood`, `item_lantern_oil`, `quest_bronze_clapper`...) trong code. Content ID chỉ đóng vai trò tra cứu ánh xạ hai chiều.
> 3. **Không phá vỡ bản sắc kinh dị dân gian:** Chiến đấu là tự vệ đẩy lùi (Survival Defense), trùm cuối là Giải đố môi trường dưới áp lực (Tactical Puzzle Boss), không làm game chặt chém cày cuốc.
> 4. **Nguyên tắc cổng kiểm soát (Gate Control):** Sau mỗi phần, AG phải chạy kiểm tra `npx tsc --noEmit`, test chức năng liên quan, tạo Git checkpoint và báo cáo kết quả chi tiết trước khi bạn gửi lệnh tiếp theo.

---

# MỤC LỤC LỘ TRÌNH 8 PHẦN

- [PHẦN 0: KHỞI TẠO NHÁNH, KIỂM TOÁN V1.3 & XÂY DỰNG CONTENT REGISTRY](#phan-0)
- [PHẦN 1: CHU KỲ THỜI GIAN, THỜI TIẾT & HUY HIỆU TRẠNG THÁI](#phan-1)
- [PHẦN 2: KHU TRẠI SINH TỒN SANCTUARY & ĐIỂM TỰA LÀNG BELLHOLLOW](#phan-2)
- [PHẦN 3: ĐỔI MỚI GIAO DIỆN UI/UX SINH TỒN & HOTBAR LƯỚI](#phan-3)
- [PHẦN 4: VẬT PHẨM MỚI, 4 Ô TRANG BỊ & CHIẾN ĐẤU TỰ VỆ](#phan-4)
- [PHẦN 5: HỆ SINH THÁI ĐỘNG VẬT & NÂNG CẤP KINH DỊ](#phan-5)
- [PHẦN 6: TIỂU KHU KHÁM PHÁ & ĐẤU TRÙM GIẢI ĐỐ MÔI TRƯỜNG](#phan-6)
- [PHẦN 7: CHIẾN LƯỢC BẢO TOÀN SAVE V1.3 & DI TRÚ DỮ LIỆU AN TOÀN](#phan-7)
- [PHẦN 8: GÓI NỘI DUNG DATA-DRIVEN (CONTENT PACKS) & NGHIỆM THU TOÀN DIỆN](#phan-8)

---

<a id="phan-0"></a>
# PHẦN 0: KHỞI TẠO NHÁNH, KIỂM TOÁN V1.3 & XÂY DỰNG CONTENT REGISTRY

Mục tiêu phần này là tạo lập một nền tảng dữ liệu sạch, an toàn, không có nguy cơ xung đột ID trước khi chạm vào logic gameplay.

---

### Lệnh 0.1: Tạo nhánh Git `feat/v1.4-expansion` & Kiểm toán hiện trạng V1.3

```text
Chào Antigravity, chúng ta bắt đầu dự án mở rộng HOLLOW WOODS V1.4 (The Fog That Remembers) tại thư mục G:\HOLLOW WOODS. 

Nhiệm vụ đầu tiên là kiểm toán toàn diện mã nguồn hiện tại và tạo nhánh phát triển an toàn:
1. Kiểm tra trạng thái Git hiện tại, tạo tag an toàn 'v1.3.3-p2game-freeze', sau đó tạo và chuyển sang nhánh mới: 'git checkout -b feat/v1.4-expansion'.
2. Quét toàn bộ mã nguồn V1.3 để lập danh sách kiểm toán thực tế (Audit Report):
   - Danh sách tất cả file dữ liệu JSON trong src/data/ (vật phẩm, công thức, vùng đất, hội thoại).
   - Danh sách các runtime key đang được lưu trong src/state/SaveManager.ts và src/state/PlayerState.ts.
   - Kiểm tra hệ thống vũ khí/tấn công hiện tại trong SatyrPlayer.ts / GameScene.ts xem đã có hitbox/sát thương thực hay mới chỉ có hoạt ảnh vung gậy.
   - Rà soát các phím tắt hiện tại (1, 2, Q, E, F, I, J, ESC) để đảm bảo không bị trùng phím sau này.
3. Chạy lệnh kiểm tra TypeScript (npx tsc --noEmit) và bộ kiểm thử hiện có (node scripts/run_v1_3_regression_suite.mjs) để xác nhận hệ thống cơ sở đang đạt 100% PASS.
4. Xuất kết quả kiểm toán thành bảng tóm tắt và báo cáo cho mình trước khi chuyển sang bước tiếp theo.
```

---

### Lệnh 0.2: Xây dựng Content Registry & Hệ thống mã định danh 4 tầng

```text
Chúng ta thực hiện bước tiếp theo của Phần 0: Xây dựng hệ thống Content Registry theo kiến trúc mã định danh 4 tầng của V1.4.

YÊU CẦU KỸ THUẬT:
1. Tạo tệp mới 'src/data/content_registry.json' quản lý danh mục toàn bộ nội dung của HOLLOW WOODS theo chuẩn định danh:
   - Tầng 1 (Content ID): HW-[TYPE]-[SUBTYPE]-[SEQ] (Ví dụ: HW-ITM-RES-000001).
   - Tầng 2 (Runtime Key): snake_case_key hiện hữu (Ví dụ: res_dry_wood).
   - Tầng 3 (Asset ID): HW-AST-[CAT]-[SEQ] (Ví dụ: HW-AST-ICON-000001).
   - Tầng 4 (Dev/Mod ID): Tách biệt hoàn toàn, không nhầm lẫn với Content ID.
2. Tạo module quản lý 'src/systems/ContentRegistry.ts':
   - Chứa phương thức 'resolveItem(idOrKey: string)' cho phép tìm kiếm hai chiều (truy vấn bằng Content ID hoặc runtimeKey đều trả về cùng một bản ghi dữ liệu).
   - Cung cấp các hàm kiểm tra trùng lặp (collision check), đảm bảo một khái niệm nội dung chỉ có duy nhất một Content ID.
3. Nạp đầy đủ 10 vật phẩm gốc từ snapshot V1.3 vào registry (Gỗ khô, Đá lửa, Nhựa cây, Thảo dược, Hạt giống, Dầu đèn, Thuốc đắp, Mồi tiếng động, Lưỡi chuông, Nhật ký) kèm theo trường runtimeKey tương ứng để bảo toàn khả năng tương thích 100%.
4. Chạy 'npx tsc --noEmit', viết một bài kiểm tra nhỏ 'tests/verify_content_registry.mjs' xác nhận việc ánh xạ hai chiều hoạt động trơn tru. Báo cáo kết quả và tạo commit Git.
```

---

### Lệnh 0.3: Chuẩn hóa bộ dữ liệu vật phẩm & công thức ban đầu (Chống trùng lặp)

```text
Chúng ta hoàn thiện bước cuối của Phần 0: Chuẩn hóa dữ liệu vật phẩm và công thức chế tạo, giải quyết dứt điểm các nguy cơ trùng lặp tên gọi giữa các tài liệu thiết kế.

CÁC ĐIỀU CHỈNH CẦN THỰC HIỆN:
1. Hợp nhất khái niệm 'Tree Resin' và 'Pine Resin': 
   - Giữ nguyên runtimeKey gốc là 'res_tree_resin'.
   - Đặt Content ID chuẩn là 'HW-ITM-RES-000003'.
   - Tên hiển thị song ngữ chuẩn hóa: Tiếng Việt là 'Nhựa Thông', Tiếng Anh là 'Pine Resin' (không tạo 2 ID riêng lẻ nếu chúng cùng bản chất).
2. Chuẩn hóa 'Trà An Thần' (Calming Herbal Tea):
   - Đặt Content ID là 'HW-ITM-FOOD-000001', runtimeKey là 'food_calming_tea'.
3. Khai báo sẵn các mục tiêu vật phẩm mới sẽ dùng trong V1.4 ở trạng thái 'PROPOSED' trong registry (Chưa kích hoạt vào gameplay runtime):
   - Dây Thừng Rừng: HW-ITM-MAT-000001 (mat_forest_rope)
   - Than Củi: HW-ITM-MAT-000002 (mat_charcoal)
   - Phôi Sắt Cổ Ngữ: HW-ITM-MAT-000003 (mat_runed_iron)
   - Nấm Nướng: HW-ITM-FOOD-000002 (food_roasted_mushroom)
   - Súp Rễ Rừng: HW-ITM-FOOD-000003 (food_root_soup)
4. Đảm bảo toàn bộ mã nguồn hiện tại của V1.3 không bị ảnh hưởng. Chạy kiểm tra TypeScript và báo cáo danh mục registry vừa cập nhật.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 0:** AG phải báo cáo trạng thái Git nhánh `feat/v1.4-expansion`, báo cáo kết quả kiểm toán V1.3 và file `content_registry.json` đạt chuẩn trước khi chuyển sang Phần 1.

---

<a id="phan-1"></a>
# PHẦN 1: CHU KỲ THỜI GIAN, THỜI TIẾT & HUY HIỆU TRẠNG THÁI

Mục tiêu phần này là mang lại nhịp thở sinh tồn 6 phút/ngày, biến màn sương tĩnh thành môi trường sống động có biến chuyển ánh sáng và thời tiết.

---

### Lệnh 1.1: Triển khai DayNightSystem & Đồng hồ tròn 3 pha thời gian

```text
Mình thực hiện bước 1.1 của Phần 1: Triển khai hệ thống Chu kỳ Ngày - Hoàng Hôn - Đêm Sương (DayNightSystem) với chu kỳ 360 giây (6 phút thực).

CÁC BƯỚC THỰC HIỆN:
1. Tạo module mới 'src/systems/DayNightSystem.ts':
   - Quản lý một ngày dài 360 giây gồm 3 pha:
     + Pha Ban Ngày (DAY): 180s (50%) - Ánh sáng rừng ấm áp, tầm nhìn sương mù 220px, Bình Tâm ổn định khi tắt đèn.
     + Pha Hoàng Hôn (DUSK): 90s (25%) - Ánh cam tím, tầm nhìn 150px, bắt đầu có gió lạnh, Bình Tâm giảm nhẹ nếu không có đèn.
     + Pha Đêm Sương (NIGHT): 90s (25%) - Bóng tối đặc quánh, tầm nhìn không đèn giảm còn 55px, kích hoạt mối đe dọa bóng đêm nếu đứng ngoài ánh sáng quá lâu.
   - Cung cấp các hàm API: 'getCurrentPhase()', 'getTimeOfDay()', 'getDayCount()', 'getAmbientTint()', 'getFogRadius()'.
2. Trong 'src/scenes/UIScene.ts':
   - Tạo widget Đồng Hồ Tròn 3 múi màu (Vàng hổ phách - Cam hoàng hôn - Xanh tím đêm) đặt ở góc trên bên trái màn hình.
   - Có kim đồng hồ xoay mượt theo thời gian thực và nhãn hiển thị: 'Ngày X — Mùa Sương Lạnh'.
3. Trong 'src/scenes/GameScene.ts':
   - Kết nối DayNightSystem với lớp ánh sáng (VeilSystem / Lighting): chuyển màu ánh sáng môi trường mượt mà theo từng pha.
   - Đảm bảo thời gian tạm dừng (pause) khi người chơi mở Menu tạm dừng hoặc hộp thoại cốt truyện.
4. Kiểm tra 'npx tsc --noEmit', kiểm tra widget hiển thị đúng trong game và tạo Git checkpoint.
```

---

### Lệnh 1.2: Triển khai hiệu ứng Mưa Sương (Mist Rain) & Tương tác thính giác

```text
Mình thực hiện tiếp bước 1.2: Bổ sung trạng thái thời tiết Mưa Sương (Mist Rain) ngẫu nhiên theo vùng, tác động trực tiếp đến tầm nhìn và thính giác.

YÊU CẦU KỸ THUẬT:
1. Trong 'src/systems/DayNightSystem.ts' (hoặc WeatherSystem riêng):
   - Thêm cơ chế thời tiết 'Mist Rain' có xác suất xuất hiện khi bước vào Hoàng Hôn hoặc tại các vùng ẩm ướt (như Silent Mire).
   - Quản lý thời lượng mưa (ví dụ: kéo dài 60s - 90s rồi tạnh).
2. Tác động hình ảnh & âm thanh:
   - Trong GameScene: Tạo hiệu ứng hạt mưa sương mảnh trôi nhẹ theo hướng gió và phủ lớp gợn nước mờ trên mặt đất.
   - Trong AudioManager: Bổ sung lớp âm thanh tiếng mưa rơi lộp bộp êm dịu, không lấn át tiếng bước chân hay cảnh báo của quái vật.
3. Tác động gameplay cân bằng hai chiều:
   - Tiếng mưa giúp làm giảm 40% bán kính phát ra tiếng bước chân của người chơi (The Listener khó nghe thấy bước chân hơn).
   - Ngược lại, mưa làm tăng tốc độ tích tụ Độ Ẩm và che bớt tiếng thở từ xa của quái vật, đòi hỏi người chơi phải quan sát mắt thường nhiều hơn.
4. Chạy kiểm tra TypeScript, đảm bảo hiệu ứng hạt không gây sụt giảm khung hình dưới 60 FPS, tạo Git checkpoint.
```

---

### Lệnh 1.3: Triển khai Huy hiệu Trạng thái phụ: Độ Ẩm (Moisture) & Thân Nhiệt (Temperature)

```text
Chúng ta hoàn thiện bước 1.3: Triển khai 2 huy hiệu trạng thái phụ (Moisture & Temperature Badges) gắn liền với Mưa Sương và Đêm Lạnh.

LƯU Ý THIẾT KẾ QUAN TRỌNG:
Tuyệt đối KHÔNG tạo thêm 2 thanh đo (meter bar) mới trên màn hình vì sẽ làm rối HUD. Chỉ sử dụng 2 biểu tượng huy hiệu nhỏ (16x16 px) hiển thị ngay dưới cụm chỉ số sinh tồn và chỉ sáng cảnh báo khi có nguy cơ.

CHI TIẾT TRIỂN KHAI:
1. Cập nhật 'src/state/PlayerState.ts' và 'src/systems/SurvivalSystem.ts':
   - Thêm thuộc tính 'moisture' (0 - 100):
     + [Khô Ráo - DRY] (0 - 29%): Trạng thái bình thường.
     + [Ẩm Lạnh - DAMP] (30 - 69%): Tích tụ khi đi dưới mưa hoặc qua đầm lầy.
     + [Ướt Sũng - SOAKED] (70 - 100%): Thể lực hồi chậm hơn 25%, dầu đèn hao nhanh hơn 15%.
   - Thêm thuộc tính 'temperature' (Thân nhiệt):
     + [Ấm Áp - WARM] / [Nhiễm Lạnh - CHILLY] / [Cóng Lạnh - FREEZING].
     + Chỉ nhiễm lạnh khi ban đêm tắt đèn lồng ở ngoài trời rét hoặc bị ướt sũng quá lâu.
   - Cơ chế giải trừ: Đứng cạnh Lửa Trại, Lò Rèn của Bram hoặc uống Trà An Thần sẽ hong khô và sưởi ấm rất nhanh về mức DRY / WARM.
2. Trong 'src/scenes/UIScene.ts':
   - Vẽ 2 huy hiệu Pixel Art nhỏ (Giọt nước và Ngọn lửa/Nhiệt kế) đổi màu cảnh báo theo 3 cấp độ.
3. Chạy kiểm tra TypeScript, xác nhận logic tăng/giảm hoạt động ổn định và tạo commit Git.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 1:** AG chạy kiểm thử `npx tsc --noEmit`, kiểm tra chu kỳ thời gian 360s, hiệu ứng mưa và 2 huy hiệu trạng thái hoạt động chính xác trước khi sang Phần 2.

---

<a id="phan-2"></a>
# PHẦN 2: KHU TRẠI SINH TỒN SANCTUARY & ĐIỂM TỰA LÀNG BELLHOLLOW

Mục tiêu phần này là biến Làng Bellhollow thành một Sanctuary Hub hoàn chỉnh, kết nối các công trình sinh tồn với các NPC thân thuộc.

---

### Lệnh 2.1: Nâng cấp Lửa Trại 3 cấp (Campfire System)

```text
Mình thực hiện bước 2.1 của Phần 2: Nâng cấp cụm Lửa Trại Thợ Săn (Sanctuary Campfire) thành công trình sinh tồn 3 cấp độ lửa.

YÊU CẦU KỸ THUẬT:
1. Trong 'src/systems/CampSanctuarySystem.ts' (tạo mới):
   - Quản lý công trình Lửa Trại tại tọa độ trung tâm (gần 1320, 720) với 3 cấp độ:
     + Cấp 1 (Tàn lửa): Vòng sáng hẹp (bán kính 70px), chỉ đủ sưởi ấm nhẹ khi đứng sát.
     + Cấp 2 (Lửa vừa): Vòng sáng 150px, hong khô quần áo với tốc độ vừa phải, giữ ấm ổn định.
     + Cấp 3 (Lửa bùng sáng): Vòng sáng 240px, đẩy lùi hoàn toàn bóng ma The Echo ở rìa sương mù, hong khô cực nhanh.
   - Cơ chế tiếp nhiên liệu: Người chơi nhấn [E] để bỏ thêm Gỗ Khô (+30s nhiên liệu) hoặc Nhựa Thông (+60s nhiên liệu và bùng sáng rực rỡ).
2. Trong 'src/scenes/GameScene.ts':
   - Đồng bộ vòng sáng động của Lửa Trại với hệ thống chiếu sáng (Lighting / VeilSystem).
   - Khi lửa tàn, tự động sinh ra 1-2 Than Củi (Charcoal) có thể thu thập để làm nguyên liệu chế tạo.
3. Chạy kiểm tra TypeScript, kiểm tra tương tác nạp nhiên liệu và tạo Git checkpoint.
```

---

### Lệnh 2.2: Triển khai Rương Lưu Trữ 12 ô (StorageChestModal)

```text
Chúng ta thực hiện tiếp bước 2.2: Triển khai Rương Gỗ Lưu Trữ (Storage Chest) 12 ô tại khu trại để giảm tải hành trang cho người chơi trước mỗi chuyến đi rừng.

YÊU CẦU KỸ THUẬT:
1. Tạo giao diện mới 'src/ui/StorageChestModal.ts':
   - Thiết kế dạng bảng đôi (Split-view) tông gỗ cổ điển viền đồng:
     + Bên trái: Hành trang của người chơi (Inventory).
     + Bên phải: Rương lưu trữ gồm lưới 12 ô vuông.
   - Cho phép người chơi bấm chuột hoặc dùng phím để chuyển đồ qua lại nhanh chóng giữa Túi đồ và Rương.
   - Hiển thị rõ số lượng vật phẩm trong từng ô.
2. Lưu trữ dữ liệu:
   - Dữ liệu rương được lưu trữ độc lập trong cấu trúc Save (ví dụ: 'storageChestInventory: Record<string, number>').
   - Đảm bảo khi chuyển vùng bản đồ hoặc tải lại game, đồ vật cất trong rương không bị biến mất hay nhân đôi.
3. Trong 'src/world/WorldBuilder.ts':
   - Đặt mô hình Rương Gỗ cạnh Lửa Trại với vùng va chạm StaticBody chuẩn xác (không chặn lối đi của người chơi).
4. Kiểm tra 'npx tsc --noEmit', kiểm thử việc cất và lấy đồ vật và tạo Git commit.
```

---

### Lệnh 2.3: Triển khai Nồi Sắc Thảo Dược & Lều Trú Ẩn (Herbal Cauldron & Tent)

```text
Chúng ta hoàn thiện bước cuối của Phần 2: Triển khai Nồi Sắc Thảo Dược (Herbal Cauldron) và Lều Trú Ẩn (Survivor Tent) tại làng Bellhollow.

CHI TIẾT TRIỂN KHAI:
1. Nồi Sắc Thảo Dược (Herbal Cauldron) - Đặt tại sân vườn của Neris:
   - Người chơi tương tác [E] để mở bảng công thức nấu nước/sắc thuốc:
     + Công thức 'Trà An Thần': 2 Thảo Dược Bạc + 1 Nước Giếng ➔ Tạo 1 Trà An Thần (Uống hồi 45 Bình Tâm, giữ ấm 60s).
     + Công thức 'Thuốc Đắp Tinh Luyện': 2 Thảo Dược Bạc + 1 Nhựa Thông ➔ Hồi 50 Sinh Lực và cầm máu.
   - Thêm hiệu ứng khói thuốc màu trắng bay nhẹ trên miệng nồi khi đang nấu.
2. Lều Trú Ẩn (Survivor Tent) - Đặt cạnh Lửa Trại:
   - Cho phép người chơi nhấn [E] để 'Nghỉ ngơi qua đêm' (Sleep through the night).
   - Cơ chế an toàn: Chỉ cho phép ngủ khi Lửa Trại đang cháy ít nhất ở Cấp 2.
   - Hiệu ứng: Màn hình chuyển đen mượt mà (Fade to Black), thời gian nhảy vọt từ Đêm sang Rạng Sáng hôm sau, hồi 40 Sinh Lực và 50 Bình Tâm, nhưng tiêu hao 1 phần lương thực hoặc dầu đèn dự trữ.
3. Chạy kiểm tra TypeScript và xác minh chuỗi tương tác sinh tồn trong khu trại hoạt động hoàn hảo.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 2:** AG báo cáo kiểm tra toàn bộ hoạt động của Lửa Trại 3 cấp, Rương 12 ô, Nồi Sắc Thuốc và Lều Nghỉ. Đảm bảo dữ liệu rương được lưu an toàn trước khi sang Phần 3.

---

<a id="phan-3"></a>
# PHẦN 3: ĐỔI MỚI GIAO DIỆN UI/UX SINH TỒN & HOTBAR LƯỚI

Mục tiêu phần này là nâng cấp trải nghiệm thị giác và thao tác điều khiển: viền sáng đối tượng khi đứng gần, thanh hotbar lưới dưới đáy và bảng chế tạo trượt không che khuất màn hình.

---

### Lệnh 3.1: Hiệu ứng Viền Sáng Tương Tác Pixel Outline (Khoảng cách <= 52px)

```text
Mình thực hiện bước 3.1 của Phần 3: Cải thiện khả năng nhận diện mục tiêu bằng hiệu ứng Viền Sáng Trắng Kem (Interactive Pixel Outline) quanh vật thể tương tác.

YÊU CẦU KỸ THUẬT:
1. Trong 'src/scenes/GameScene.ts':
   - Xác định vật thể tương tác gần nhất với người chơi trong bán kính <= 52px (Cây lấy gỗ, Bụi thảo dược, Hòm đồ, Bàn chế tạo, Lửa trại hoặc NPC).
   - Khi vật thể được chọn làm mục tiêu ưu tiên, vẽ một đường viền sáng màu trắng kem mảnh (1px - 2px Pixel Outline hoặc quầng sáng Highlight nhẹ) ôm sát thân vật thể.
   - Khi người chơi bước ra xa (> 52px), viền sáng tự động mờ dần và biến mất.
2. Đồng bộ nhãn phím:
   - Hiển thị nhãn phím bấm gọn gàng [E] hoặc [Chuột Trái] ngay phía trên đầu vật thể đang có viền sáng.
   - Đảm bảo tại một thời điểm chỉ có DUY NHẤT một vật thể được làm nổi bật để người chơi không bị phân tâm.
3. Kiểm tra hiệu năng đảm bảo không render shader quá nặng trên WebGL, kiểm tra 'npx tsc --noEmit' và tạo checkpoint.
```

---

### Lệnh 3.2: Thanh Hotbar lưới 8 ô đáy màn hình & Nút chức năng lớn

```text
Chúng ta thực hiện tiếp bước 3.2: Thiết kế lại thanh Hotbar dưới đáy màn hình theo bố cục dạng lưới ô vuông trực quan.

CHI TIẾT TRIỂN KHAI:
1. Trong 'src/scenes/UIScene.ts':
   - Xây dựng thanh Hotbar gồm cụm 8 ô vuông (Grid Slots) đặt ở chính giữa cạnh dưới màn hình:
     + Khung ô vuông mang phong cách gỗ tối viền đồng xỉn, kích thước tiêu chuẩn 36x36 px hoặc 40x40 px.
     + Hiển thị rõ biểu tượng vật phẩm (Icon), số lượng xếp chồng (Stack count ở góc dưới phải) và số phím tắt [1] đến [8] ở góc trên trái.
     + Ô đang được chọn (Active slot) có viền sáng màu vàng hổ phách nổi bật.
2. Bố trí nút chức năng nhanh ở góc dưới bên trái:
   - Nút [C] hoặc [I] Chế Tạo: Biểu tượng Búa & Đe.
   - Nút [J] Sổ Tay Nhiệm Vụ: Biểu tượng Cuốn Sách Cổ.
3. Ràng buộc điều khiển:
   - Giữ nguyên 100% hệ thống phím tắt: nhấn các phím số [1]–[8] để trang bị/sử dụng nhanh vật phẩm, phím [Q] ném mồi tiếng động, phím [F] bật/tắt đèn lồng.
4. Chạy kiểm tra TypeScript và kiểm thử thao tác bằng cả chuột lẫn bàn phím.
```

---

### Lệnh 3.3: Bảng Chế Tạo trượt bên phải (Right-Side Slide Crafting Panel)

```text
Chúng ta hoàn thiện bước 3.3: Nâng cấp Bảng Chế Tạo (CraftingModal) sang dạng thẻ trượt bên phải màn hình để không che khuất tầm nhìn của người chơi.

CÁC BƯỚC THỰC HIỆN:
1. Tái cấu trúc 'src/ui/CraftingModal.ts':
   - Thay vì mở bảng modal to che kín chính giữa màn hình, chuyển bảng Chế Tạo thành Panel trượt mượt mà (Slide-in) từ mép phải màn hình sang, chiếm khoảng 40% - 45% chiều rộng bên phải.
   - Người chơi vẫn quan sát được nhân vật và không gian xung quanh ở nửa bên trái màn hình trong khi đang chế tạo (giúp phát hiện kịp thời nếu có quái vật tiếp cận).
2. Bố cục bên trong bảng Chế Tạo:
   - Danh sách công thức chia làm các nhóm: [Nhiên Liệu & Đèn], [Thuốc & Nấu Ăn], [Công Cụ & Vũ Khí], [Trang Bị].
   - Hiển thị dạng lưới thẻ (Card Grid): mỗi thẻ gồm biểu tượng sản phẩm, tên, nguyên liệu cần có (ví dụ: 'Gỗ khô: 3/2', 'Nhựa thông: 1/1' - hiển thị màu xanh nếu đủ, màu đỏ nếu thiếu) và nút bấm [Chế Tạo].
3. Phím tắt thao tác:
   - Nhấn [C], [I] hoặc phím [ESC] để đóng mở bảng chế tạo trượt một cách êm ái.
4. Chạy kiểm tra TypeScript, kiểm thử thao tác chế tạo thực tế và tạo Git checkpoint.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 3:** AG kiểm tra hiển thị Viền sáng đối tượng, Hotbar 8 ô và Bảng Craft trượt bên phải hoạt động trơn tru trên trình duyệt, không lỗi console, sau đó báo cáo tiến độ.

---

<a id="phan-4"></a>
# PHẦN 4: VẬT PHẨM MỚI, 4 Ô TRANG BỊ & CHIẾN ĐẤU TỰ VỆ

Mục tiêu phần này là bổ sung các vật phẩm sinh tồn trọng tâm, 4 ô trang bị có sự đánh đổi chiến thuật và hệ thống chiến đấu tự vệ có tầm đánh/đẩy lùi rõ ràng.

---

### Lệnh 4.1: Bổ sung 7 vật phẩm sinh tồn & chuỗi công thức mới vào gameplay

```text
Mình thực hiện bước 4.1 của Phần 4: Kích hoạt 7 vật phẩm sinh tồn mới vào chuỗi thu thập và chế tạo trong gameplay runtime.

DANH SÁCH 7 VẬT PHẨM & CÔNG DỤNG:
1. Nhựa Thông (Pine Resin) - HW-ITM-RES-000003: Thu hoạch từ thân cây thông già ở Outer Woods; dùng nạp Lửa Trại hoặc làm Đuốc Nhựa Thông.
2. Dây Thừng Rừng (Forest Rope) - HW-ITM-MAT-000001: Bện từ 3 Cỏ Dai / Rễ Cây tại Bàn Chế Tạo; dùng làm vũ khí và túi đồ.
3. Than Củi (Charcoal) - HW-ITM-MAT-000002: Lấy từ Lửa Trại cháy tàn hoặc Lò Rèn Bram; dùng sắc thuốc và rèn công cụ.
4. Phôi Sắt Cổ Ngữ (Runed Iron Part) - HW-ITM-MAT-000003: Tìm thấy trong Xưởng Chuông Bỏ Hoang hoặc đổi với Bram; dùng chế tạo Giáo Gỗ Bịt Sắt và sửa chuông.
5. Trà An Thần (Calming Herbal Tea) - HW-ITM-FOOD-000001: Nấu tại Nồi Thảo Dược; hồi 45 Bình Tâm và xóa nhiễm lạnh trong 60s.
6. Nấm Nướng (Roasted Mushroom) - HW-ITM-FOOD-000002: Nướng tại Lửa Trại; hồi 25 Sinh Lực.
7. Đuốc Nhựa Thông (Resin Flare) - HW-ITM-CNS-000003: Chế tạo từ Gỗ Khô + Nhựa Thông; cắm xuống đất tạo vùng sáng rực trong 15s xua sương khẩn cấp.

YÊU CẦU:
- Cập nhật 'src/data/items.json' và 'src/data/recipes.json' tương thích với ContentRegistry.
- Gắn node khai thác Nhựa Thông lên các thân cây tại Outer Woods.
- Kiểm tra 'npx tsc --noEmit' và thử nghiệm chế tạo đầy đủ các món mới.
```

---

### Lệnh 4.2: Hệ thống 4 ô Trang bị Cá nhân (Equipment System)

```text
Chúng ta thực hiện tiếp bước 4.2: Triển khai hệ thống 4 ô Trang bị Cá nhân (BODY, FEET, BACK, CHARM) tuân thủ nguyên tắc đánh đổi chiến thuật (Trade-off).

CHI TIẾT 4 Ô TRANG BỊ:
1. Ô Thân (BODY) - Áo Choàng Rêu Lót Lông (Moss Cloak):
   - Chế tạo từ Vải Cũ + Rêu Rừng + Dây Thừng Rừng.
   - Tác dụng: Giảm 40% tốc độ tích tụ Độ Ẩm và Nhiễm Lạnh ban đêm, nhưng giảm nhẹ 5% tốc độ chạy nước rút.
2. Ô Giày (FEET) - Ủng Đi Rừng (Trail Boots):
   - Phần thưởng từ nhiệm vụ của Garth.
   - Tác dụng: Giảm 30% bán kính phát ra tiếng bước chân khi đi bộ/chạy và chống trượt trên bùn Silent Mire.
3. Ô Lưng (BACK) - Túi Hành Trang (Field Backpack):
   - Chế tạo từ Vải Bố + Dây Thừng Rừng.
   - Tác dụng: Mở rộng sức chứa túi đồ từ 8 ô lên 12 ô.
4. Ô Phụ Kiện (CHARM) - Bùa Chuông Đồng (Bell Ward Charm):
   - Phần thưởng từ Bà Lão Edda.
   - Tác dụng: Giảm 25% tốc độ tụt Bình Tâm khi ở gần thực thể siêu nhiên và phát tiếng rung nhẹ cảnh báo khi có Echo ẩn nấp gần đó.

YÊU CẦU KỸ THUẬT:
- Tạo module 'src/systems/EquipmentSystem.ts' quản lý việc trang bị/tháo đồ và tính toán chỉ số cộng dồn.
- Cập nhật giao diện Túi đồ trong UIScene để hiển thị trực quan 4 ô trang bị này.
- Kiểm tra 'npx tsc --noEmit' và tạo commit Git.
```

---

### Lệnh 4.3: Cơ chế Chiến đấu Tự vệ (Survival Defense Combat)

```text
Chúng ta hoàn thiện bước 4.3: Triển khai cơ chế Chiến đấu Tự vệ (Survival Defense) có giới hạn và phản hồi va chạm thực chất.

NGUYÊN TẮC CỐT LÕI:
Chiến đấu trong game chỉ nhằm mục đích tự vệ, đẩy lùi nguy hiểm để tháo chạy hoặc giải đố, tuyệt đối không biến game thành hành động chặt chém cày quái. Không áp dụng cơ chế độ bền (durability) gây phiền hà.

CÁC BƯỚC TRIỂN KHAI:
1. Trong 'src/entities/SatyrPlayer.ts' (hoặc Mossbound Wayfarer):
   - Triển khai hitbox tấn công thực sự 4 hướng (Đông, Tây, Nam, Bắc) khi người chơi vung vũ khí bằng [Phím Cách] hoặc [Chuột Trái]:
     + Gậy Gỗ (Walking Staff): Tầm đánh 42px, đẩy lùi nhẹ (knockback 20px), làm choáng 0.5s, sát thương thấp (10 HP), thời gian hồi chiêu 0.6s.
     + Giáo Gỗ Bịt Sắt (Iron-Tipped Spear): Tầm đánh xa 72px, đẩy lùi mạnh (knockback 45px), sát thương 25 HP, thời gian hồi chiêu 0.9s (đâm theo đường thẳng).
     + Rìu Đi Rừng (Hunting Hatchet): Tầm đánh 36px, dùng chặt gỗ nhanh gấp đôi và tự vệ cự ly gần.
2. Tác động âm thanh & quái vật:
   - Khi vung vũ khí trúng hoặc hụt, tạo ra sóng âm thanh nhỏ thu hút The Listener trong bán kính 120px. Người chơi phải cân nhắc kỹ trước khi tấn công!
   - Kẻ địch khi trúng đòn có hoạt ảnh nhấp nháy đỏ (Hurt Flash) và giật lùi theo hướng đánh.
3. Kiểm tra 'npx tsc --noEmit', kiểm thử hitbox và tạo Git checkpoint.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 4:** AG kiểm tra việc chế tạo 7 vật phẩm mới, đeo 4 món trang bị và kiểm thử cơ chế đánh đẩy lùi của Giáo Gỗ/Gậy Gỗ. Báo cáo kết quả chi tiết.

---

<a id="phan-5"></a>
# PHẦN 5: HỆ SINH THÁI ĐỘNG VẬT & NÂNG CẤP KINH DỊ

Mục tiêu phần này là mang lại sự sống tự nhiên cho khu rừng thông qua Quạ Rừng và Bướm Đêm, đồng thời nâng cấp độ thông minh của The Listener và làm rõ hiện tượng ảo ảnh The Echo.

---

### Lệnh 5.1: Động vật môi trường đợt 1: Quạ Rừng (Hệ thống cảnh báo hai chiều)

```text
Mình thực hiện bước 5.1 của Phần 5: Triển khai loài Quạ Rừng (Crow) - đóng vai trò hệ thống cảnh báo môi trường tự nhiên hai chiều.

YÊU CẦU KỸ THUẬT:
1. Tạo entity mới 'src/entities/CrowEntity.ts':
   - Quạ thường đậu thành từng nhóm 2-3 con trên cành cây mục, hàng rào hoặc cột mốc ở Outer Woods và The Crooked Path.
   - Các trạng thái AI cơ bản:
     + IDLE: Đậu rỉa lông, thỉnh thoảng nghiêng đầu quan sát.
     + ALERT: Ngẩng cao đầu khi nghe tiếng bước chân người chơi đến gần.
     + FLEE: Vỗ cánh bay vút lên ngọn cây và phát ra tiếng kêu 'Quạ... Quạ...' inh ỏi.
2. Tác động cảnh báo hai chiều:
   - Nếu người chơi chạy nhanh (giữ Shift) hoặc gây ồn trong bán kính 90px, quạ sẽ hoảng sợ bay lên.
   - ĐẶC BIỆT: Nếu quái vật The Listener tiến vào bán kính 150px của quạ, đàn quạ cũng sẽ bay tán loạn và kêu lớn ➔ Giúp người chơi từ xa nhận biết quái vật đang đến gần!
   - Tuy nhiên, tiếng quạ kêu lớn cũng sẽ làm The Listener chú ý điều tra khu vực đó.
3. Quản lý tài nguyên & hiệu năng:
   - Sau khi bay khỏi màn hình 4 giây, quạ tự động hủy (despawn) hoặc quay về vị trí tổ để bảo đảm hiệu năng 60 FPS.
4. Kiểm tra TypeScript, kiểm thử phản ứng của quạ trong game và tạo checkpoint.
```

---

### Lệnh 5.2: Động vật môi trường đợt 1: Bướm Đêm Hổ Phách (Định hướng ánh sáng)

```text
Chúng ta thực hiện tiếp bước 5.2: Triển khai Bướm Đêm Hổ Phách (Lantern Moth) - sinh vật huyền ảo tương tác với nguồn sáng trong đêm sương.

CHI TIẾT TRIỂN KHAI:
1. Tạo entity mới 'src/entities/LanternMothEntity.ts':
   - Xuất hiện ngẫu nhiên vào pha Hoàng Hôn và Đêm Sương tại các vùng sương mù sâu.
   - Hoạt ảnh: 2 cánh phát sáng lân tinh màu vàng hổ phách dịu nhẹ, bay lượn chập chờn theo quỹ đạo hình sin tự nhiên.
2. Tương tác với ánh sáng:
   - Bị thu hút bởi các nguồn sáng: Khi người chơi bật Đèn Lồng [F] hoặc khi đứng gần Lửa Trại, bướm đêm sẽ bay lượn lờ xung quanh vùng sáng.
   - Trong sương mù dày, nhìn thấy bướm đêm là dấu hiệu báo trước có một nguồn sáng tự nhiên hoặc Đèn Cổ Ngữ ở gần đó.
3. Cơ chế nhẹ nhàng:
   - Sinh vật hoàn toàn vô hại, không có va chạm chặn đường (No collision body).
   - Tối đa chỉ xuất hiện đồng thời 4-6 con trên toàn màn hình để giữ sạch sẽ khung hình.
4. Chạy kiểm tra TypeScript, quan sát bướm đêm bay trong đêm sương và tạo Git commit.
```

---

### Lệnh 5.3: Nâng cấp AI The Listener & Phân tách Bóng Ma Ký Ức (The Echo)

```text
Chúng ta hoàn thiện bước 5.3: Nâng cấp trí thông minh cho thực thể The Listener và phân tách rõ ràng hiện tượng Bóng Ma Ký Ức (The Echo).

CÁC NÂNG CẤP BẮT BUỘC:
1. Nâng cấp trí nhớ ngắn hạn cho The Listener ('src/entities/ListenerMonster.ts'):
   - Thêm cơ chế chống lừa lặp lại (Anti-Repeat Lure Memory): Nếu người chơi ném Mồi Tiếng Động [Q] tại cùng một vị trí quá 2 lần trong vòng 40 giây, The Listener sẽ không bị mắc lừa nữa mà sẽ lập tức quay sang tìm kiếm nguồn phát ra cú ném (vị trí người chơi).
   - Bổ sung trạng thái nghi ngờ: Quay đầu lắng nghe 2 giây trước khi lao đến điểm phát ra tiếng động.
2. Phân tách rõ ràng Bóng Ma Ký Ức The Echo ('src/entities/EchoApparition.ts'):
   - The Echo KHÔNG PHẢI quái vật săn mồi, không có sát thương vật lý và không kích hoạt Game Over.
   - The Echo xuất hiện mờ ảo ở rìa màn hình vào ban đêm, khi người chơi tiến lại gần sẽ nghe tiếng thì thầm kể lại các mảnh ký ức về ngày ngôi làng bị sương mù nuốt chửng, sau đó tan biến thành những đốm sáng tro tàn.
   - Chỉ làm giảm nhẹ Bình Tâm (-5) nếu người chơi đứng nhìn thẳng vào nó mà không bật đèn lồng.
3. Chạy kiểm tra TypeScript, kiểm thử hành vi của Listener và The Echo, tạo checkpoint.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 5:** AG chạy thử kịch bản: Quạ bay cảnh báo khi quái lại gần, bướm bay quanh đèn lồng, Listener không bị lừa bởi 1 vị trí mồi quá 2 lần. Báo cáo kết quả trước khi sang Phần 6.

---

<a id="phan-6"></a>
# PHẦN 6: TIỂU KHU KHÁM PHÁ & ĐẤU TRÙM GIẢI ĐỐ MÔI TRƯỜNG

Mục tiêu phần này là mở rộng chiều sâu bản đồ bằng 3 tiểu khu khám phá và triển khai trận Đấu Trùm Cao Trào "Kẻ Nuốt Tiếng Chuông" theo cơ chế Giải Đố Dưới Áp Lực.

---

### Lệnh 6.1: Tích hợp 3 tiểu khu khám phá (Sub-areas)

```text
Mình thực hiện bước 6.1 của Phần 6: Bổ sung 3 tiểu khu gắn liền với cấu trúc bản đồ hiện hữu (không phình to bản đồ trống trải).

CHI TIẾT 3 TIỂU KHU:
1. Xưởng Chuông Bỏ Hoang (Abandoned Bell Workshop) - Nằm ở rìa phía Đông Outer Woods:
   - Một xưởng rèn cũ đổ nát phủ đầy rêu phong.
   - Chứa bàn thao tác cổ, nơi người chơi tìm thấy 'Phôi Sắt Cổ Ngữ' và mảnh nhật ký của người thợ đúc chuông năm xưa.
2. Hầm Rễ Cổ (Root Cellar) - Lối vào bí mật dưới nền đất Sanctuary Farm:
   - Một không gian ngầm ẩm ướt với rễ cây đại thụ xuyên qua vách đá.
   - Nơi thu hoạch Nấm Rừng quý hiếm và nguồn nước ngầm thanh khiết để nấu trà.
3. Khoảng Trống Thì Thầm (Whispering Clearing) - Nằm sâu trong Deep Forest:
   - Một bãi đất trống hình tròn bao quanh bởi các thân cây cổ thụ uốn cong kỳ dị.
   - Nơi thường xuyên xuất hiện ảo ảnh The Echo và là điểm giao thoa tiếng chuông dẫn đường đến Khu vực Đấu Trùm Cổ Ngữ.
4. Cập nhật 'src/world/WorldBuilder.ts' và 'src/data/zones.json':
   - Tích hợp các công trình và lối vào liền mạch, gắn Collider chuẩn xác.
5. Kiểm tra TypeScript và chạy bộ kiểm tra va chạm.
```

---

### Lệnh 6.2: Triển khai Đấu Trùm Giải Đố Môi Trường: "Kẻ Nuốt Tiếng Chuông"

```text
Chúng ta thực hiện tiếp bước 6.2: Triển khai trận Chạm Trán Trùm Cao Trào (Tactical Puzzle Boss Encounter) chống lại thực thể 'Kẻ Nuốt Tiếng Chuông' (The Mire Warden).

NGUYÊN TẮC THIẾT KẾ:
Trận đấu trùm diễn ra sau khi người chơi kích hoạt xong 3 cột đá Cổ Ngữ. Đây là trận đấu 'Giải Đố Dưới Áp Lực', người chơi không thể chém chết Boss trực diện mà phải dùng Mồi Tiếng Động, Đèn Lồng và các Trụ Lửa Cổ Ngữ để hóa giải lớp giáp sương mù.

CHI TIẾT 2 PHA CHIẾN ĐẤU:
1. Tạo module 'src/entities/BossMireWarden.ts' và 'src/systems/BossEncounterSystem.ts':
   - Đấu trường là Sân Đá Cổ hình tròn có 3 'Trụ Lửa Cổ Ngữ' (Runed Fire Pillars) ở 3 góc.
   - Hiển thị thanh tiến trình 'Độ Ổn Định Phong Ấn' (hoặc thanh máu Boss lớn) ở cạnh trên màn hình.
2. Pha 1 (100% ➔ 50% Phong ấn): Săn Mồi Bằng Tiếng Động:
   - Boss mù hoàn toàn nhưng lao cực nhanh theo đường thẳng hướng về tiếng động phát ra.
   - Người chơi phải đứng sau các Trụ Lửa Cổ Ngữ hoặc ném Mồi Tiếng Động [Q] vào trụ để dẫn dụ Boss húc thẳng vào thân trụ đá.
   - Khi Boss va vào trụ, trụ bùng cháy làm Boss bị choáng (Stun 3.5 giây) và làm nứt lớp giáp sương mù. Người chơi dùng Giáo Gỗ hoặc Gậy Gỗ tấn công điểm yếu để đẩy tiến trình phong ấn.
3. Pha 2 (< 50% Phong ấn): Cơn Ác Mộng Sương Đêm:
   - Boss gầm vang dập tắt 2 trụ lửa và gọi sương mù dày đặc bao phủ sân đấu kèm 2 ảo ảnh Echo quấy rối.
   - Người chơi phải dùng Đuốc Nhựa Thông hoặc Đèn Lồng [F] thắp sáng lại các trụ lửa, né tránh đòn quét bóng đêm của Boss để tung đòn thanh tẩy kết thúc trận chiến.
4. Phần thưởng & Kết cục:
   - Tiếng chuông lớn ngân vang xua tan vĩnh viễn màn sương độc, mở khóa danh hiệu và mảnh ký ức cốt truyện hoàn chỉnh.
5. Kiểm tra 'npx tsc --noEmit', kiểm thử toàn bộ luồng trận đánh và tạo commit Git.
```

---

### Lệnh 6.3: Tích hợp Sổ Tay Nhật Ký (Journal) & Thư Mục Sinh Vật (Bestiary)

```text
Chúng ta hoàn thiện bước 6.3: Nâng cấp giao diện Sổ Tay Nhật Ký [Phím J] gồm danh mục Nhiệm Vụ, Bản Ghi Ký Ức và Thư Mục Sinh Vật (Bestiary).

CÁC BƯỚC THỰC HIỆN:
1. Trong 'src/ui/JournalModal.ts':
   - Thiết kế sổ tay dạng sách cổ 2 trang lật mở:
     + Trang 1: [Nhiệm Vụ] - Danh sách nhiệm vụ chính và nhiệm vụ phụ từ dân làng Bellhollow.
     + Trang 2: [Mảnh Ký Ức] - Các trang nhật ký, bản ghi Echo và câu chuyện về tháp chuông.
     + Trang 3: [Sinh Vật Rừng - Bestiary] - Ghi nhận hình ảnh và tập tính của Quạ Rừng, Bướm Đêm, The Listener và The Mire Warden sau khi người chơi đã chạm trán/quan sát trong game.
2. Cơ chế mở khóa tự nhiên:
   - Bestiary không yêu cầu giết động vật; chỉ cần người chơi đứng quan sát sinh vật trong phạm vi nhìn thấy hoặc kích hoạt sự kiện thành công thì mục sinh vật đó sẽ tự động sáng lên trong sổ tay.
3. Chạy kiểm tra TypeScript, kiểm thử việc mở sổ tay bằng phím [J] và tạo Git checkpoint.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 6:** AG chạy thử kịch bản khám phá Xưởng Chuông, kích hoạt và vượt qua trận Boss Mire Warden bằng cơ chế lừa húc trụ đá, mở sổ tay [J] kiểm tra Bestiary trước khi sang Phần 7.

---

<a id="phan-7"></a>
# PHẦN 7: CHIẾN LƯỢC BẢO TOÀN SAVE V1.3 & DI TRÚ DỮ LIỆU AN TOÀN

Mục tiêu phần này là xây dựng cơ chế Save Migration không phá hủy (Non-Destructive Save Migrator), đảm bảo file save cũ của người chơi tải lên V1.4 không bao giờ bị mất đồ, hỏng nhiệm vụ hay lỗi game.

---

### Lệnh 7.1: Xây dựng Non-Destructive Save Migrator trong SaveManager

```text
Mình thực hiện bước 7.1 của Phần 7: Xây dựng bộ di trú dữ liệu lưu game an toàn (Non-Destructive Save Migrator) trong SaveManager.ts.

CÁC NGUYÊN TẮC BẢO TOÀN SAVE BẮT BUỘC:
1. Khi người chơi nạp file lưu từ V1.3:
   - Hệ thống đọc trường 'saveVersion'. Nếu là bản cũ (hoặc không có version), tự động nhận diện là Legacy V1.3 Save.
   - TUYỆT ĐỐI KHÔNG xóa hoặc đổi tên bất kỳ trường dữ liệu hay runtimeKey cũ nào trong save (ví dụ: 'inventory', 'questFlags', 'res_dry_wood', 'quest_bronze_clapper'...).
2. Bổ sung giá trị mặc định an toàn (Fallback Defaults) cho các tính năng mới của V1.4:
   - 'dayCount': Mặc định = 1.
   - 'timeOfDay': Mặc định = 0 (Bắt đầu sáng sớm ngày mới).
   - 'moisture': Mặc định = 0 (Trạng thái DRY - Khô ráo, không bị phạt oan).
   - 'temperature': Mặc định = 80 (Trạng thái WARM - Ấm áp).
   - 'equippedSlots': Mặc định = { body: null, feet: null, back: null, charm: null }.
   - 'storageChestInventory': Mặc định = {} (Rương rỗng).
   - 'unlockedBestiary': Mặc định = [].
3. Xử lý khóa lạ (Unknown Keys):
   - Nếu trong file save có bất kỳ khóa dữ liệu nào chưa nằm trong registry mới, hệ thống vẫn phải lưu giữ nguyên vẹn trong một trường dự phòng 'legacyExtraData', không được phép vứt bỏ.
4. Cơ chế sao lưu tự động trước khi di trú:
   - Tự động tạo bản sao lưu dự phòng 'hollow_woods_save_backup_v1_3' trong localStorage trước khi ghi đè save mới.
5. Cập nhật 'src/state/SaveManager.ts', chạy 'npx tsc --noEmit' và tạo Git checkpoint.
```

---

### Lệnh 7.2: Bộ kiểm thử hồi quy Save/Load tự động (Save Regression Suite)

```text
Chúng ta thực hiện tiếp bước 7.2: Xây dựng kịch bản kiểm thử tự động xác minh tính toàn vẹn 100% của Save V1.3 khi nâng cấp lên V1.4.

CÁC BÀI KIỂM THỬ CẦN THỰC HIỆN:
1. Tạo kịch bản kiểm thử mới 'scripts/verify_v1_4_save_migration.mjs':
   - Bài test 1 (Legacy Save Load): Nạp một file save V1.3 mẫu có đầy đủ túi đồ, vị trí nhân vật và cờ nhiệm vụ dở dang. Xác nhận game nạp thành công mà không mất bất kỳ vật phẩm nào.
   - Bài test 2 (Defaults Injection): Xác nhận các trường mới (dayCount, moisture, storageChest...) được điền giá trị mặc định chính xác.
   - Bài test 3 (Round-trip Persistence): Thực hiện chuỗi Thao tác ➔ Lưu game ➔ Tải lại game ➔ Kiểm tra xem đồ trong Rương 12 ô và 4 ô trang bị có được lưu đúng vị trí không.
   - Bài test 4 (Idempotent Check): Chạy di trú 5 lần liên tiếp trên cùng một file save; xác nhận không có hiện tượng nhân đôi đồ vật (Duplication exploit) hay trùng lặp nhiệm vụ.
2. Chạy kịch bản kiểm thử bằng Node.js và đảm bảo 100% các bài test PASS. Báo cáo kết quả chi tiết.
```

---

> [!NOTE]
> **ĐIỂM DỪNG PHẦN 7:** AG phải chứng minh bài test `verify_v1_4_save_migration.mjs` đạt 100% PASS, xác nhận file save cũ tương thích hoàn toàn trước khi sang Phần 8.

---

<a id="phan-8"></a>
# PHẦN 8: GÓI NỘI DUNG DATA-DRIVEN (CONTENT PACKS) & NGHIỆM THU TOÀN DIỆN

Mục tiêu phần này là tổ chức mã nguồn mở rộng dưới dạng các gói nội dung JSON an toàn (chuẩn bị cho Mod sau này) và chạy nghiệm thu tổng thể toàn bộ dự án V1.4.

---

### Lệnh 8.1: Đóng gói 4 Gói Dữ Liệu Tích Hợp (Built-in Data Packs)

```text
Mình thực hiện bước 8.1 của Phần 8: Tổ chức các tính năng mở rộng của V1.4 thành các gói dữ liệu chuẩn JSON (Built-in Content Packs) có kiểm tra manifest.

QUY TẮC AN TOÀN:
Tuyệt đối KHÔNG nạp hay thực thi các đoạn mã JavaScript tự do từ bên ngoài (để đảm bảo chính sách bảo mật CSP trên nền tảng P2Game.io và trình duyệt). Chỉ sử dụng định dạng dữ liệu thuần túy (JSON Schema).

XÂY DỰNG 4 GÓI NỘI DUNG:
1. Gói 1: 'HW-MOD-PACK-000001' — Woodland Wildlife Pack (Chứa cấu hình spawn, vùng hoạt động và âm thanh của Quạ Rừng và Bướm Đêm).
2. Gói 2: 'HW-MOD-PACK-000002' — Survival Equipment Pack (Chứa dữ liệu 4 trang bị: Áo choàng rêu, Ủng đi rừng, Túi hành trang, Bùa chuông đồng).
3. Gói 3: 'HW-MOD-PACK-000003' — Camp & Cooking Pack (Chứa công thức Nồi Thảo Dược, 3 cấp Lửa Trại, Rương 12 ô và Lều Trú Ẩn).
4. Gói 4: 'HW-MOD-PACK-000004' — Ancient Relics & Boss Pack (Chứa dữ liệu câu đố Cổ Ngữ, 3 tiểu khu và thông số trận Boss Mire Warden).
5. Xây dựng module kiểm tra 'src/systems/ContentPackValidator.ts':
   - Xác thực cấu trúc tệp manifest, kiểm tra xung đột Content ID và xác minh phiên bản tương thích trước khi nạp gói.
6. Chạy 'npx tsc --noEmit', kiểm tra bộ nạp gói hoạt động ổn định và tạo commit Git.
```

---

### Lệnh 8.2: Tổng kiểm thử nghiệm thu hồi quy V1.4 (Full Acceptance Gate)

```text
Chúng ta thực hiện bước cuối cùng: Chạy toàn bộ quy trình kiểm thử nghiệm thu toàn diện (Acceptance Gate) để sẵn sàng đóng gói bản phát hành V1.4.

CÁC BƯỚC NGHIỆM THU:
1. Chạy toàn bộ bộ kiểm thử hồi quy kế thừa từ V1.3:
   - 'node scripts/run_v1_3_regression_suite.mjs' (Xác nhận toàn bộ 571 bài test cũ vẫn đạt PASS 100%).
2. Chạy bộ kiểm thử tính năng mới của V1.4:
   - Kiểm tra Content Registry, DayNightSystem, Campfire, Hotbar, Boss Encounter và Save Migration.
3. Kiểm tra chất lượng kỹ thuật:
   - Chạy 'npx tsc --noEmit' (0 lỗi).
   - Chạy 'npm run build' (Bản build đóng gói hoàn tất không có cảnh báo bất thường).
4. Khởi chạy máy chủ thử nghiệm cục bộ và thực hiện một vòng chơi thực tế (Playtest):
   - Bắt đầu ngày mới tại Bellhollow ➔ Thăm vườn Neris nấu Trà An Thần ➔ Bước ra Outer Woods thấy Quạ bay cảnh báo ➔ Nhặt Nhựa Thông chế Đuốc ➔ Hoàng hôn buông xuống, Đêm sương lạnh ➔ Quay về Lửa Trại Cấp 3 sưởi ấm, cất đồ vào Rương ➔ Tiến vào sân Cổ Ngữ giải đố và trải nghiệm trận Boss Mire Warden.
5. Tạo Git Tag chính thức 'v1.4.0-survival-expansion' và xuất báo cáo nghiệm thu toàn diện cho Project Owner.
```

---

> [!TIP]
> **HƯỚNG DẪN DÀNH CHO BẠN (PROJECT OWNER):**  
> Mỗi khi làm việc với Antigravity IDE, bạn chỉ cần sao chép (Copy) nguyên văn từng khối lệnh (từ Lệnh 0.1, 0.2...) dán vào khung chat của AG. Sau khi AG hoàn thành và báo cáo kết quả của lệnh đó, bạn kiểm tra lại trước khi gửi lệnh tiếp theo. Cách làm này giúp AG tập trung cao độ, không bị quá tải và không bao giờ làm hỏng các tính năng cũ của game.
