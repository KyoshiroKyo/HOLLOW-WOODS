# BÁO CÁO KỸ THUẬT V14-P4-02
## HỆ THỐNG 4 Ô TRANG BỊ CÁ NHÂN, ĐÁNH ĐỔI CHỈ SỐ & CƠ CHẾ TỰ VỆ SINH TỒN

- **Dự án:** HOLLOW WOODS — THE FOG THAT REMEMBERS (V1.4)
- **Mã phân đoạn:** `V14-P4-02`
- **Mục tiêu:**
  1. Xây dựng **Hệ thống 4 Ô Trang Bị Cá Nhân** chuyên biệt (`BODY`, `FEET`, `BACK`, `CHARM`) có đánh đổi chỉ số chiến thuật rõ ràng, giải quyết các bất cập địa hình và thời tiết của rừng sương mà **tuyệt đối không áp dụng cơ chế độ bền (durability = false)**.
  2. Bổ sung giao diện **EquipmentModal (Phím `[B]`)** theo ngôn ngữ mỹ thuật Dark Medieval, hỗ trợ so sánh chỉ số trước/sau khi mặc (`previewStatModifiers`) và lựa chọn vũ khí tự vệ.
  3. Hoàn thiện **Cơ chế Tự Vệ Sinh Tồn (Survival Defense)**: Hitbox tính toán theo hướng nhìn (`down`, `up`, `left`, `right`) và tầm với (`reach`), tích hợp 3 loại vũ khí đặc thù (`wpn_walking_staff`, `wpn_iron_spear`, `wpn_hunting_hatchet`).
  4. Triển khai **Đuốc Nhựa Thông Khẩn Cấp (`item_resin_flare`)**: Quầng sáng 260px trong 15 giây xua đuổi The Listener (`triggerFlareRepel`) và cơ chế cảm biến rung chuông của **Bùa Chuông Cổ (`eqp_bell_ward_charm`)** khi tiếp cận Ký Ức Echo.
  5. Đăng ký đầy đủ 8 vật phẩm và 6 công thức mới vào [items.json](file:///G:/HOLLOW%20WOODS/src/data/items.json), liên kết 2 chiều với `ContentRegistry`.
  6. Bảo toàn 100% kiểm thử hồi quy V1.3 (571 bài test) và nâng tổng số test V1.4 lên 269 bài test (Tổng hệ thống: 840/840 PASS).
- **Ngày thực hiện:** 17/11/2026
- **Trạng thái:** **HOÀN THÀNH 100% (PASS 840/840 TEST TOÀN DỰ ÁN)**

---

## 1. THIẾT KẾ 4 Ô TRANG BỊ CÁ NHÂN & ĐÁNH ĐỔI CHỈ SỐ ([EquipmentSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/EquipmentSystem.ts))

### 1.1. Bảng 4 Ô Trang Bị Chuyên Biệt
Hệ thống không sử dụng các chỉ số phòng ngự RPG truyền thống (như giáp số học ảo) mà tập trung vào các thông số tác động trực tiếp lên vòng lặp sinh tồn:

| Ô Trang Bị | Mã Vật Phẩm | Tên Trang Bị | Hiệu Ứng Lợi Ích (Buff) | Cơ Chế Đánh Đổi (Trade-off) |
| :---: | :---: | :---: | :--- | :--- |
| **`BODY`** | `eqp_moss_cloak` | **Áo Choàng Rêu** | Giảm **40%** tốc độ ngấm Độ Ẩm (`moistureGainMod = 0.6`) và giảm **40%** tốc độ nhiễm lạnh Thân Nhiệt (`coldGainMod = 0.6`). | Giảm nhẹ **5%** tốc độ chạy nước rút (`sprintSpeedMod = 0.95`). |
| **`FEET`** | `eqp_trail_boots` | **Ủng Đi Rừng** | Giảm **30%** bán kính phát ra tiếng bước chân (`noiseRadiusMod = 0.70`), giúp di chuyển lướt vững chãi **không bị làm chậm** trên vùng đất lầy Silent Mire (`mireSlowImmune = true`). | Giữ nguyên tốc độ tối đa cơ sở (1.0), không tăng tốc độ chạy nước rút để duy trì cân bằng hành động lén lút (stealth). |
| **`BACK`** | `eqp_field_backpack`| **Túi Hành Trang** | Mở rộng sức chứa túi đồ nhanh thêm **+4 ô** (từ 8 ô lên tối đa 12 ô) (`inventorySlotsBonus = 4`). | Tăng **15%** mức tiêu hao Thể Lực khi chạy nước rút do tải trọng nặng (`staminaDrainMod = 1.15`). |
| **`CHARM`** | `eqp_bell_ward_charm`| **Bùa Chuông Cổ** | Giảm **25%** tốc độ suy giảm Bình Tâm trong bóng tối và sương đêm (`composureDrainMod = 0.75`). | Cảm biến rung nhẹ và ngân chu cảnh báo khi người chơi đến gần bóng ma Ký Ức (The Echo). |

### 1.2. Nguyên Tắc Cốt Lõi: Độ Bền Vĩnh Cửu (No Durability)
- **Quy tắc kiến trúc:** `EquipmentSystem.getInstance().hasDurability() === false`.
- **Lý do thiết kế:** Tránh cơ chế mài mòn trang bị gây phiền toái, buộc người chơi phải liên tục sửa đồ trong game sinh tồn kinh dị tâm lý. Mỗi trang bị một khi đã chế tạo thành công sẽ trở thành người bạn đồng hành tin cậy xuyên suốt hành trình.

### 1.3. Cơ Chế So Sánh Chỉ Số Trước / Sau Khi Mặc
`EquipmentSystem` cung cấp phương thức `previewStatModifiers(slot, prospectiveItemKey)` trả về cấu trúc so sánh:
- `current`: Các chỉ số hệ số hiện tại người chơi đang có.
- `preview`: Các chỉ số hệ số sau khi trang bị món đồ mới.
- `deltas`: Mức chênh lệch cụ thể, phục vụ hiển thị trực quan màu xanh lá (tích cực) và màu đỏ cam (đánh đổi) trên bảng giao diện.

---

## 2. GIAO DIỆN TRANG BỊ CÁ NHÂN ([EquipmentModal.ts](file:///G:/HOLLOW%20WOODS/src/ui/EquipmentModal.ts))

### 2.1. Bố Cục Thẩm Mỹ & Thao Tác
- **Phím tắt đóng/mở:** Phím `[B]` (Backpack / Equipment) được đăng ký toàn cục trên `UIScene.ts`.
- **Kích thước modal:** Khung chuẩn HD `920 × 600 px` tại trung tâm màn hình, độ sâu `depth: 9000`.
- **Phong cách thị giác:** Khung gỗ phong hóa `0x140e0a`, viền đồng xỉn `0x5c4228`, đinh tán góc đồng thau `0xb89058`, nhãn chữ vàng kem `#f4ecd8`.
- **4 Khung Slot chuyên biệt:**
  - `[ÁO CHOÀNG]` (Body Slot)
  - `[ỦNG RỪNG]` (Feet Slot)
  - `[TÚI ĐEO]` (Back Slot)
  - `[BÙA HỘ THÂN]` (Charm Slot)
- **Bảng So Sánh Chỉ Số Cột Phải:** Hiển thị chi tiết từng dòng thuộc tính:
  - Tốc độ ngấm ẩm / nhiễm lạnh
  - Bán kính tiếng ồn bước chân
  - Tiêu hao thể lực chạy nước rút
  - Ô chứa hành trang khả dụng
  - Kháng bùn lầy Silent Mire
  - Tụt Bình Tâm bóng tối
- **Nút Tháo / Mặc Nhanh:** Thao tác 1-click trực quan kèm thông báo âm thanh click gỗ/kim loại êm ái.

---

## 3. CƠ CHẾ TỰ VỆ SINH TỒN & VŨ KHÍ ([SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts) & [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))

### 3.1. Danh Mục 3 Loại Vũ Khí Tự Vệ Sinh Tồn
Người chơi có thể chuyển đổi vũ khí kích hoạt qua phương thức `setActiveWeapon(weaponId)` trên `PlayerState`:

```
+----------------------------------------------------------------------------------------------------------------+
|  VŨ KHÍ             | TẦM VỚI | BÁN KÍNH QUÉT | ĐẨY LÙI (Knockback) | HAO THỂ LỰC | TIẾNG ĐỘNG | ĐẶC TÍNH CHIẾN THUẬT       |
|---------------------+---------+---------------+---------------------+-------------+------------+----------------------------|
| Gậy Lữ Hành         |  28 px  |     42 px     |       130 px/s      |   14 STA    |   180 px   | Đẩy lùi nhẹ, tạo khoảng mở |
| Giáo Gỗ Bịt Sắt     |  56 px  |     54 px     |       240 px/s      |   26 STA    |   240 px   | Tầm xa, đâm điểm yếu quái  |
| Rìu Rừng Nhỏ        |  24 px  |     38 px     |       160 px/s      |   16 STA    |   190 px   | Chém gần, x2 tốc độ đốn củi|
+----------------------------------------------------------------------------------------------------------------+
```

### 3.2. Tính Toán Hitbox Theo Hướng Mặt & Tầm Với (Reach)
Khi người chơi bấm phím đánh (Phím `[SPACE]` hoặc vung vũ khí), hệ thống tính toán tọa độ hitbox phía trước mặt nhân vật dựa trên thuộc tính `facing` (`down`, `up`, `left`, `right`) và chỉ số `reach` của vũ khí:
- **Hướng DOWN:** Tọa độ tâm `(px, py + reach)`, kích thước hộp `(radius * 1.6, reach * 1.4)`.
- **Hướng UP:** Tọa độ tâm `(px, py - reach)`, kích thước hộp `(radius * 1.6, reach * 1.4)`.
- **Hướng LEFT:** Tọa độ tâm `(px - reach, py)`, kích thước hộp `(reach * 1.4, radius * 1.6)`.
- **Hướng RIGHT:** Tọa độ tâm `(px + reach, py)`, kích thước hộp `(reach * 1.4, radius * 1.6)`.

### 3.3. Ràng Buộc Thể Lực & Sóng Âm Thanh Cảnh Báo
1. **Kiểm tra Thể Lực:** Nhân vật chỉ được phép vung vũ khí nếu `stats.stamina >= weapon.staminaCost`. Nếu thiếu thể lực, đòn đánh sẽ bị hủy và phát âm thanh cạn kiệt.
2. **Sóng âm thanh cảnh báo:** Mỗi cú vung vũ khí phát ra sóng âm trong bán kính `noiseRadius` (`180 - 240px`). Sóng âm này lập tức kích hoạt thính giác của The Listener, khiến quái vật quay đầu hoặc tiến về vị trí phát ra âm thanh.

### 3.4. QUY TẮC SỐNG CÒN TUYỆT ĐỐI (SURVIVAL LAW)
> [!IMPORTANT]
> **VŨ KHÍ KHÔNG THỂ GIẾT CHẾT VĨNH VIỄN THE LISTENER HOẶC BIẾN QUÁI VẬT THÀNH NƠI CÀY FARM LOOT.**
> Đòn đánh trúng chỉ có tác dụng:
> 1. Đẩy lùi quái vật ra xa vị trí người chơi theo vector va chạm (`knockbackForce`).
> 2. Gây hiệu ứng choáng/khựng ngắn (`staggerMs = 450 - 650ms`) để người chơi có 1-2 giây thoát thân hoặc chạy vào bụi rậm ẩn nấp.
> 3. Quái vật không rơi vật phẩm (loot) khi bị đánh lui.

---

## 4. ĐUỐC NHỰA THÔNG KHẨN CẤP & CẢM BIẾN KÝ ỨC ECHO

### 4.1. Đuốc Nhựa Thông Khẩn Cấp (`item_resin_flare`)
- **Cách thức hoạt động:** Người chơi có thể chế tạo từ Gỗ Khô và Nhựa Cây, cắm đuốc xuống đất qua phương thức `deployResinFlare(x, y)` trên `GameScene.ts`.
- **Hiệu ứng môi trường:**
  - Tạo ra một quầng sáng rực rỡ với bán kính lớn **260 px**, xuyên thủng màn sương đêm.
  - Tồn tại liên tục trong **15 giây** (15,000 ms) trước khi tàn lụi.
  - Vùng ánh sáng của Đuốc ngăn chặn việc tụt Bình Tâm khi đứng trong quầng sáng.
- **Xua đuổi The Listener:**
  - Khi The Listener bước vào vùng bán kính 260px của đuốc, phương thức `triggerFlareRepel(flareX, flareY, 3500)` được kích hoạt.
  - Ánh sáng chói lóa làm mù tạm thời quái vật, khiến The Listener quay lưng tháo chạy ra xa nguồn sáng và rơi vào trạng thái hoang mang trong 3.5 giây.

### 4.2. Cảm Biến Ký Ức Của Bùa Chuông Cổ (`eqp_bell_ward_charm`)
- Khi người chơi trang bị Bùa Chuông Cổ ở ô `CHARM` và di chuyển trong phạm vi **200 px** gần các điểm ký ức bóng ma (The Echo):
  - Bùa phát tín hiệu rung nhẹ trên camera (`shake(120, 0.002)`).
  - Phát âm thanh chuông ngân dịu nhẹ (`bell_ring`, volume `0.35`) báo hiệu có manh mối cốt truyện ẩn giấu trong màn sương.

---

## 5. ĐĂNG KÝ VẬT PHẨM & CÔNG THỨC TRONG DATA REGISTRY

### 5.1. 8 Vật Phẩm Mới Trong [items.json](file:///G:/HOLLOW%20WOODS/src/data/items.json)
1. `eqp_moss_cloak`: Áo Choàng Rêu (Slot `BODY`, stack 1, giá trị bán 22).
2. `eqp_trail_boots`: Ủng Đi Rừng (Slot `FEET`, stack 1, giá trị bán 18).
3. `eqp_field_backpack`: Túi Hành Trang (Slot `BACK`, stack 1, giá trị bán 25).
4. `eqp_bell_ward_charm`: Bùa Chuông Cổ (Slot `CHARM`, stack 1, giá trị bán 30).
5. `wpn_walking_staff`: Gậy Lữ Hành (Loại vũ khí gậy, tầm 28px, knockback 130).
6. `wpn_iron_spear`: Giáo Gỗ Bịt Sắt (Loại vũ khí giáo đâm, tầm 56px, knockback 240).
7. `wpn_hunting_hatchet`: Rìu Rừng Nhỏ (Loại vũ khí rìu chặt, tầm 24px, knockback 160).
8. `item_resin_flare`: Đuốc Nhựa Thông Khẩn Cấp (Vật phẩm tiêu hao khẩn cấp, stack 5).

### 5.2. 6 Công Thức Chế Tạo Mới
1. `craft_moss_cloak`: 4 Vải Lanh Thô (`res_linen_cloth`) + 2 Rêu Đầm Lầy (`crop_mire_moss`).
2. `craft_trail_boots`: 3 Vải Lanh Thô (`res_linen_cloth`) + 2 Dây Thừng Rừng (`item_forest_rope`).
3. `craft_field_backpack`: 4 Vải Lanh Thô (`res_linen_cloth`) + 3 Dây Thừng Rừng (`item_forest_rope`) + 1 Phụ Kiện Sắt Rèn (`item_runed_iron_part`).
4. `craft_iron_spear`: 3 Gỗ Khô (`res_dry_wood`) + 1 Dây Thừng Rừng (`item_forest_rope`) + 2 Phụ Kiện Sắt Rèn (`item_runed_iron_part`).
5. `craft_hunting_hatchet`: 2 Gỗ Khô (`res_dry_wood`) + 1 Dây Thừng Rừng (`item_forest_rope`) + 1 Phụ Kiện Sắt Rèn (`item_runed_iron_part`).
6. `craft_resin_flare`: 2 Gỗ Khô (`res_dry_wood`) + 3 Nhựa Cây (`res_tree_resin`) + 1 Than Củi (`item_charcoal`).

---

## 6. KẾT QUẢ KIỂM THỬ TOÀN DIỆN HỆ THỐNG

### 6.1. Kiểm Tra TypeScript Type Safety
```powershell
npx tsc --noEmit
# Kết quả: EXIT CODE 0 (0 lỗi)
```

### 6.2. Kiểm Thử Hệ Thống Trang Bị & Tự Vệ ([test_v14_p4_02.mjs](file:///G:/HOLLOW%20WOODS/scripts/test_v14_p4_02.mjs))
- **Kết quả:** **41/41 bài test PASS (100%)**.
  - Phần 1 (4 Ô Trang Bị Cá Nhân & Đánh Đổi Chỉ Số): 14/14 PASS.
  - Phần 2 (Giao Diện Trang Bị EquipmentModal): 6/6 PASS.
  - Phần 3 (Vũ Khí Tự Vệ Sinh Tồn & Hitbox Theo Hướng): 9/9 PASS.
  - Phần 4 (Đuốc Nhựa Thông Khẩn Cấp & Cảm Biến Ký Ức): 5/5 PASS.
  - Phần 5 (Đăng Ký Vật Phẩm & Công Thức Trong items.json): 7/7 PASS.

### 6.3. Bảng Tổng Hợp Kiểm Thử Toàn Diện Hệ Thống V1.4
| Bộ Kiểm Thử | Tệp Kịch Bản | Số Bài Test | Kết Quả |
| :--- | :--- | :---: | :---: |
| **V1.3 Regression Suite (22 module nền tảng)** | `run_v1_3_regression_suite.mjs` | **571** | **571/571 PASS** |
| **V1.4 Save Migration Không Phá Hủy** | `test_save_migration_v14.mjs` | **41** | **41/41 PASS** |
| **V1.4 Chu Kỳ Thời Gian 360s & Math Engine** | `test_time_system_v14.mjs` | **19** | **19/19 PASS** |
| **V1.4 Mưa Sương & Huy Hiệu Ẩm / Thân Nhiệt** | `test_weather_and_status_v14.mjs` | **26** | **26/26 PASS** |
| **V1.4 Cụm Trại Sanctuary Camp Hub** | `test_camp_system_v14.mjs` | **59** | **59/59 PASS** |
| **V1.4 Nông Trại Sanctuary Farm 5 Bước** | `test_v14_p3_02.mjs` | **49** | **49/49 PASS** |
| **V1.4 Hotbar 8 Ô & Bảng Chế Tạo Trượt Phải** | `test_v14_p4_01.mjs` | **34** | **34/34 PASS** |
| **V1.4 Trang Bị 4 Ô & Tự Vệ Sinh Tồn** | `test_v14_p4_02.mjs` | **41** | **41/41 PASS** |
| **TỔNG CỘNG HỆ THỐNG** | | **840** | **840/840 PASS (100%)** |

### 6.4. Đóng Gói Vite Production
```powershell
npm run build
# dist/index.html                    1.10 kB │ gzip:   0.56 kB
# dist/assets/index-C1KclVKC.js  2,248.01 kB │ gzip: 531.24 kB
# ✓ built in 8.51s
```

---

## 7. KẾT LUẬN & SẴN SÀNG CHO PHẦN 5

Phân đoạn **V14-P4-02** đã khép lại trọn vẹn **Phần 4: Giao Diện UI/UX, Hệ Thống Trang Bị & Cơ Chế Tự Vệ**:
- Hệ thống trang bị 4 ô mang tính chiến thuật sâu sắc, hỗ trợ đắc lực cho người chơi đối phó với sương lạnh, bóng tối, đầm lầy mà không gây ức chế nhờ nguyên tắc độ bền vĩnh cửu.
- Vũ khí tự vệ tạo ra khoảng trống sinh tồn kịp thời trước The Listener nhưng vẫn duy trì nỗi sợ nguyên bản, không làm biến chất thể loại game kinh dị sinh tồn.

Hệ thống đã sẵn sàng 100% để bước sang **Phần 5: Wildlife Ecosystem & The Listener AI Memory Upgrade**.
