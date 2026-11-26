# HW-MAP-VISUAL-IMPROVEMENT-PLAN — KẾ HOẠCH NÂNG CẤP BẢN ĐỒ & MÔI TRƯỜNG (CHUẨN TRAILER V12.2)

- **Dự án:** HOLLOW WOODS (`WORLD RECONSTRUCTION 2.0`)
- **Nguyên tắc cốt lõi:** Sửa lỗi hình học & điều hướng trước, làm đẹp sau; giữ nguyên toàn bộ giới hạn hiệu năng của `HW-H4-06` (VSync `60 FPS`, `draw calls <= 100`, giữ kiến trúc 1 baked CanvasTexture / khu vực + `registerCullable` thay cho tile object lẻ hoặc shader nặng), không động vào Classic Sanity 2.1, Vòng Sáng Hộ Tâm hay chuỗi nhiệm vụ/lời thoại đang đóng băng.
- **Kho tài nguyên sẵn có sau `HW-ASSET-01`:** Có thể tái sử dụng trực tiếp bộ cây cối, bụi rậm, đá rêu, gạch nứt, đạo cụ hầm ngầm & hiệu ứng ánh sáng đã phân loại trong `Pixel_Art/` và `public/assets/`.

---

## 1. Đối Chiếu Tiêu Chuẩn Trailer V12.2 (`HOLLOW_WOODS_V12_2_CINEMATIC_SOUND_POLISH_4K60.mp4`)

| Yếu tố thị giác trong Trailer V12.2 | Ghi nhận tại cảnh chuẩn (`16s–60s`) | Áp dụng vào Game World |
| :--- | :--- | :--- |
| **Tầng thực vật viền đường (`16s`, `34s`)** | Cây cao (sồi, phong đỏ, bạch dương) đứng thành cụm 2–4 gốc dọc bìa đường; chân gốc được neo bởi dương xỉ, bụi cỏ nhỏ, cành mục và 1–2 cụm nấm phát sáng lam/cam. | Tăng mật độ cụm trang trí không-collider (ground foliage) ở hai bên đường mòn `sanctuary_farm`, `outer_woods` và dọc viền sẫm của `crooked_path`. |
| **Điểm nhấn ánh sáng ấm vs nền sẫm (`25s`, `42s`)** | Lửa trại và cột đèn tạo vùng sáng vàng ấm nổi bật trên nền rêu xanh thẫm & viền vignette đen sâu. | Giảm độ sáng gắt của gạch xám ở `broken_bell_shrine`, `ancient_rune_puzzle`, và đặc biệt bổ sung lớp phủ tối + đốm sáng cổ ngữ cho 3 khu hầm/vực mới. |
| **Khắc phục nhược điểm tile vuông của chính V12.2 (`16s`, `51s`)** | Cả Trailer V12.2 cũng còn lộ rìa gạch đá cắt thẳng vào nền cỏ. | Khi bake Canvas địa hình, vẽ viền đá vỡ/răng cưa bất đối xứng kèm lớp phủ rêu bán trong suốt đè lên mép gạch thay vì đường cắt thẳng 90°. |

---

## 2. Lộ Trình Triển Khai Theo 4 Đợt (Chờ Owner Phê Duyệt Từng Đợt)

### Đợt 1 — `HW-MAP-01`: Sửa Lỗi Cổng, Collider & Chồng Lấn Biên (`P0` Bắt Buộc Trước)
1. **Mở thông `deep_forest -> abyssal_chasm` (`HW-H4-03-AUDIT`):** Nới `triggerRect.height` của `to_abyssal_chasm` xuống `y = -620` (hoặc mở rộng `physics.world.bounds.y` xuống `-660` khi đứng trong `deep_forest` nếu cổng đã mở) để `foot.y = -622` chắc chắn chạm trigger.
2. **Giải phóng cụm `sub_whispering_clearing <-> whispering_grove_sanctum` (`MAP-BUG-001`, `MAP-BUG-002`):**
   - Tách hai vùng `whispering_grove_sanctum` và `deep_forest` hết chồng lấn (hoặc tắt tường chu vi tự động hướng Nam của `whispering_grove_sanctum` & rà lại khe hở `AutoPerimeterWallsModule` cho cổng Bắc của `sub_whispering_clearing`).
   - Dời vị trí 2 trigger Bắc của `sub_whispering_clearing` (`to_deep_forest_from_wc` và `to_whispering_grove_sanctum`) ra hai vị trí tách biệt (ví dụ Tây-Bắc và Đông-Bắc) thay vì đè lên nhau `80x14px`.
   - Sửa `defaultSpawn` và `to_whispering_clearing_from_wgs` của `whispering_grove_sanctum` ra khỏi `df_bound_left` (`x >= 1650`) và đồng bộ đường về từ `crooked_path` nếu cần 2 chiều.
3. **Sửa `ancient_rune_puzzle` (`MAP-BUG-003`):** Đặt `to_silent_mire_from_puzzle` vào trong biên (`x >= 3350`), dời `Đèn Đá Nghi Thức` khỏi `(3380, 260)`, và bổ sung rào chắn / điều kiện phía Bắc khi `sunken_crypt_ruins` chưa mở khóa.
4. **Sửa Hitbox Cây Phong Đỏ & Mép Cổng (`MAP-BUG-004`, `MAP-BUG-009`):** Chuẩn hóa hàm sinh cây phong đỏ để hitbox nhỏ ôm đúng chân thân cây thay vì lơ lửng trên tán lá; xén lại đoạn tường `auto_east` / `bell_bound_east_bottom` / `shrine_bound_left_bottom` / `Biển Chỉ Dẫn` / `Cột Mốc` đang lẹm vào các trigger. Thu nhỏ collider `createMireWater` thành cụm elip/đa hộp gọn theo vùng nước thật.

---

### Đợt 2 — `HW-MAP-02`: Bản Đồ Thế Giới 17 Khu Vực & Đồng Bộ Phím (`P1`)
1. **Khép `H4-NEW-05`:** Thống nhất phím `[M]` và `[N]` đều mở/đóng `ParchmentWorldMapModal` (chuyển Mute sang icon/tổ hợp khác hoặc `[Ctrl+M]`/`Settings` theo quyết định Owner), chặn rò rỉ phím `[M]` khi `JournalModal` đang mở, và giữ dòng hướng dẫn phím rõ ràng tách khỏi dòng Quest.
2. **Nâng cấp `ZoneConnectionRegistry` + `ParchmentWorldMapModal` lên đủ `17/17` phân khu (`MAP-BUG-005`, `MAP-BUG-006`, `MAP-BUG-007`):**
   - Bố trí bản đồ theo **đúng la bàn thực địa**:
     - Trục Tây -> Đông: `fog_crossing` -> `bellhollow` -> `crooked_path` -> `silent_mire` (chứa `ancient_rune_puzzle`) -> `broken_bell_shrine`.
     - Nhánh Nam Bellhollow: `sanctuary_farm` (-> `sub_root_cellar` -> `veil_origin_cavern`) & `outer_woods` (-> `sub_bell_workshop`).
     - Nhánh Bắc Crooked Path: `deep_forest` (-> `sub_whispering_clearing` -> `whispering_grove_sanctum`; chính Bắc -> `abyssal_chasm`).
     - Nhánh phụ Vùng Cấm: `silent_mire` (Nam -> `drowned_mire_depths`; Bắc từ `ancient_rune_puzzle` -> `sunken_crypt_ruins`).
   - Hỗ trợ zoom/pan nhẹ hoặc card hover tooltip dùng chính trường `clue` & danh sách điểm mốc cho khu vực phức tạp, và luôn giữ bộ đếm `X/17 Khu Vực` + marker `"📍 BẠN ĐANG Ở ĐÂY"` cho mọi vùng kể cả hầm ngầm.
   - Đồng bộ `JournalModal` map tab (xóa `the_depths` cũ, đồng bộ `17` node) và bỏ `'bellhollow'` khỏi `visitedZones` mặc định lúc New Game (`MAP-BUG-008`).

---

### Đợt 3 — `HW-MAP-03`: Hoàn Thiện 5 Khu Vực Mở Rộng & Thay Placeholder `sub_root_cellar` (`P1`)
Thay nền `tileSprite` trần bằng các hàm `render*Terrain()` + `render*Decorations()` nung sẵn vào `CanvasTexture` riêng (1 texture nền/vùng, giữ `draw calls < 100`):
1. **`abyssal_chasm` (Vực Sâu Bóng Tối):** Nền đá bazan nứt nẻ thẫm màu, rãnh vực tối hai bên hông, trụ đá đổ, khói tím hư không và quầng sáng cổ ngữ dẫn đường.
2. **`drowned_mire_depths` (Vùng Trũng Đầm Lầy):** Đất bùn ngập nông pha vũng nước tối phản chiếu, xương rễ cây chết, cọc gỗ mục, cụm nấm phát sáng và lau sậy.
3. **`whispering_grove_sanctum` (Thánh Địa Cây Đại Ngàn):** Thảm rêu rừng sâu sẫm hài hòa với `deep_forest` (thay cho cỏ xanh sáng lạc tông), vòng cổ thụ trắng/vàng bao quanh cổ thụ trung tâm với tia nắng hổ phách lọc qua vòm lá.
4. **`sunken_crypt_ruins` (Hầm Mộ Cổ Ngữ):** Nền đá phiến rêu tối (giảm độ sáng gạch hiện tại ít nhất 40%), cột trụ gãy, quan tài/bia cổ ngữ và đuốc lửa xanh lạnh.
5. **`veil_origin_cavern` (Hang Cội Nguồn Màn Sương):** Động thạch anh/rễ cổ thụ hắc ám, mạch năng lượng Màn Sương phát sáng dịu làm tâm điểm Act cuối.
6. **`sub_root_cellar` (`MAP-BUG-012`):** Thay 3 hình tròn vector xanh và khung chữ `X` bằng sàn đất nén + rễ cây cổ thụ bện tự nhiên, kệ thảo mộc và giá đèn dầu từ kho `Pixel_Art/`.

---

### Đợt 4 — `HW-MAP-04`: Làm Mềm Biên Vùng & Phối Cảnh Chuẩn Trailer V12.2 (`P2`)
1. **Khử đường cắt vuông giữa các phân khu (`MAP-BUG-011`):** Bổ sung gradient chuyển sắc + mảng cỏ/rêu/đất loang ở biên các canvas (`whispering_grove_sanctum`, `sub_whispering_clearing`, `sub_bell_workshop`, `outer_woods`, `fog_crossing`) để không còn đường thẳng phân chia màu nền.
2. **Làm tự nhiên hóa lối đi & ao hồ:** Bo rìa đường đá `outer_woods`, thêm viền đá cuội và rong rêu tự nhiên cho ao `sanctuary_farm` (kèm collider gọn cho mặt nước ao).
3. **Bồi đắp chi tiết chân cụm cây (`createOrganicTreeCluster`):** Thêm cỏ bụi, dương xỉ và đá cuội nhỏ quanh gốc tại những khoảng trống thưa ở `sanctuary_farm` và `outer_woods`, tận dụng tối đa hệ thống `registerCullable` hiện có để giữ nguyên hiệu năng VSync `60 FPS`.
