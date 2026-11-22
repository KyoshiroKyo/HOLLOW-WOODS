# BÁO CÁO NGHIỆM THU: HW-MAP-28 — TINH CHỈNH BỐ CỤC CÂY & ĐƯỜNG ĐI PHÍA NAM RỪNG NGOẠI VI (SOUTHERN OUTER WOODS TREE COMPOSITION & PATH POLISH)

**Dự án:** HOLLOW WOODS — Chuẩn bị phát hành V1.5.4\
**Nhánh:** `feat/v1.5.3-ag-world-polish`\
**Mã nhiệm vụ:** `HW-MAP-28`\
**Mức độ ưu tiên:** P2 Visual Polish / Navigation QA\
**Baseline Git:** `5aca54654ed4a786546d0b672e4ecfb9949d63b2` (HW-MAP-27)\
**Ngày thực hiện:** 22/11/2026\
**Trạng thái:** HOÀN THÀNH TOÀN DIỆN & ĐẠT 100% TEST NỘI BỘ (5/5 PASS)

---

## 1. TỔNG QUAN VẤN ĐỀ & MỤC TIÊU THIẾT KẾ

Từ ghi nhận của Owner khi khảo sát khu vực nhân vật tại `(1283, 923)`:
- **Tình trạng ban đầu:** Các cây cổ thụ và bụi rậm ở khu vực phía Nam Outer Woods (quanh Bãi Liễu và ranh giới Nam) tụ lại quá dày đặc trong một phạm vi hẹp (~120x120 px). Tán lá lớn của 4 cây đại thụ (liễu 1215, liễu phụ 1195, sồi 1200, thông 1260) dán sát vào nhau tạo thành một khối cam/vàng đồng nhất, che khuất tầm nhìn của người chơi, che bóng dáng nhân vật, và làm khu vực mất đi vẻ tự nhiên, thoáng đãng so với các khoảng rừng mở đầu game.
- **Mục tiêu HW-MAP-28:**
  1. Phân lớp cây lớn, cây nhỏ, bụi và đá thành cụm hữu cơ có khoảng thở thị giác (breathing room), không chỉ đơn thuần giảm số lượng cây mà tái cấu trúc vị trí và tầng bậc tự nhiên.
  2. Đồng bộ Cây Liễu Đại Thụ trung tâm về đúng tọa độ của Clue tương tác `ow_ancient_willow` `(1200, 915)` và collider gốc cây `ow_willow_trunk`, giúp cây liễu trở thành một kỳ quan thiên nhiên độc lập (landmark).
  3. Lùi các cây phụ và cây viền Nam vào sát rìa rừng phía Tây và đường ranh giới phía Nam (phía sau hàng rào gỗ mục vừa bổ sung ở HW-MAP-27), giải phóng hoàn toàn vòm trời và khoảng cỏ trung tâm `(1283, 923)`.
  4. Mở thoáng tầm nhìn hướng tới Cây Rỗng Ẩn Nấp Bãi Liễu `(1305, 885)` và Biển Chỉ Dẫn Xưởng Chuông `(1300, 985)`.
  5. Đảm bảo 100% khả năng di chuyển mượt mà với Noclip OFF qua toàn bộ 5 tuyến đường của Outer Woods theo chuẩn HW-BUG-24A.

---

## 2. BẢNG KIỂM KÊ CHI TIẾT TỪNG PROP TRƯỚC VÀ SAU KHI ĐIỀU CHỈNH

| Đạo cụ / Thực thể | Vị trí Trước (Before) | Vị trí Sau (After) | Thay đổi hình học & Tác dụng thị giác |
| :--- | :--- | :--- | :--- |
| **Cụm Liễu — Cây Chính** | `(1215, 930)` (`tree_weeping_willow` 80x95) | `(1200, 915)` (`tree_weeping_willow` 80x95) | Đồng bộ 100% với `ow_ancient_willow` & `ow_willow_trunk`. Cây liễu đứng độc lập, xòe tán rủ xanh mướt bên bờ rãnh nước, trở thành tâm điểm kỳ quan bãi liễu. |
| **Cụm Liễu — Cây Phụ** | `(1195, 905)` (`tree_weeping_willow` 80x95, cách cây chính 32px) | `(1162, 897)` (`tree_weeping_willow` 80x95, lùi Tây) | Lùi sâu về bìa rừng phía Tây, tạo hiệu ứng chuyển tiếp tầng sâu từ rừng già vào bãi thưa, triệt tiêu hoàn toàn khối tán dán đè. |
| **Cụm Liễu — Bụi Gốc** | `(1229, 940)` (`bush_dense_2` 41x47) | `(1184, 923)` & `(1214, 921)` | Bụi rậm chia đôi ôm sát chân gốc cây liễu, không còn chìa ra lòng đường cỏ. |
| **Cụm Liễu — Đá Rêu Mộc** | *Chưa có* | `(1218, 927, w: 22, h: 14)` | Bổ sung tảng đá rêu phong tự nhiên kết nối giữa gốc liễu và thân gỗ mục ven bờ. |
| **Thân Cây Đổ Bãi Liễu** | `(1220, 955, 62px, góc 8°)` | `(1215, 955, 54px, góc 6°)` | Căn chỉnh gọn gàng men theo viền cỏ Nam, tạo ranh giới tự nhiên nằm phía trên hàng rào gỗ mục. |
| **Cụm Cổ Thụ Bìa Tây** | `(1130, 865)` + sub `(1142, 890)` | `(1130, 865)` + sub `(1115, 885)` | Tán cây phụ được kéo lùi sang mép Tây, giải phóng hoàn toàn hành lang rộng rãi giữa X: 1140..1180. |
| **Cây Rỗng Bãi Liễu** | `(1305, 885)` (`hollow_tree` 40x32) | `(1305, 885)` *(Bảo tồn vị trí)* | Cây rỗng cổ thụ đứng uy nghiêm trên gò đất tam giác; nay lộ rõ 100%, không bị tán cây phía Nam che lấp. |
| **Cây Viền Nam 1** | `(1200, 985)` (`tree_mossy_oak_grand` 80x95) | `(1175, 995)` (`tree_mossy_oak_grand` 80x95) | Lùi về góc Tây Nam ôm sát cọc rào gỗ mục `(1175, 1020)`, mở toang không gian thảm cỏ giữa liễu và ranh giới. |
| **Cây Viền Nam 2** | `(1260, 990)` (`tree_mist_pine` 70x98, tán vươn tới y=892) | `(1235, 1010)` (`tree_mist_pine` 70x98, lùi sát ranh giới) | Tán cây lùi sâu về phía sau rào gỗ mục, giải phóng toàn bộ vòm trời và khoảng nhìn tại `(1283, 923)`. |
| **Bụi Rậm Viền Nam** | `(1280, 970)` (`bush_dense_1` 50x44) | `(1275, 990)` (`bush_dense_1` 50x44) | Dời nép sát cụm đá ranh giới phía Nam, tạo gờ phân cách tự nhiên bên cạnh biển chỉ dẫn. |
| **Đá Tảng Viền Nam** | *Chưa có* | `(1265, 985, w: 28, h: 16)` | Khối đá rêu phong tự nhiên che chắn điểm giao giữa hàng rào gỗ mục và biển chỉ dẫn. |
| **Biển Chỉ Dẫn Xưởng Chuông** | `(1300, 985)` | `(1300, 985)` *(Bảo tồn vị trí)* | Biển gỗ đứng độc lập, thoáng đãng, hướng dẫn người chơi đi xuống Xưởng Chuông Bỏ Hoang. |
| **Hitbox `ow_willow_trunk`** | `(1205, 920, 24x20)` | `(1190, 905, 20x14)` | Khớp chuẩn xác theo chân gốc liễu đại thụ tại `(1200, 915)`. |
| **Clue `ow_ancient_willow`** | `(1200, 915)` | `(1200, 915)` *(Bảo tồn vị trí)* | Trùng khớp tuyệt đối với gốc cây đại thụ; prompt `[E]` hiển thị trang nhã. |

---

## 3. BỘ ẢNH ĐỐI CHIẾU TRỰC QUAN (BEFORE / AFTER & F9 ON / OFF)

Toàn bộ ảnh chụp kiểm thử ở camera zoom 2.2x được lưu trữ tại `Read/V1.5/Reports/Visuals/HW_MAP_28/`:

1. **Bãi Cỏ & Điểm Khảo Sát Phía Nam `(1283, 923)`:**
   - Trước: `ow_1283_923_before_f9_off.png` & `ow_1283_923_before_f9_on.png` — Cây và bụi vây kín, tán cây thông 1260 và liễu 1215 đè nghẽn tầm mắt nhân vật.
   - Sau: `ow_1283_923_after_f9_off.png` & `ow_1283_923_after_f9_on.png` — Không gian bãi cỏ mở toang, ánh sáng ngập tràn, vòm cây phân tầng rõ rệt, thấy rõ gò cây rỗng và biển chỉ dẫn.
2. **Khúc Cua Chữ S `(1187, 621)` (Hồi quy HW-MAP-27):**
   - Trước: `ow_1187_621_before_f9_off.png` & `ow_1187_621_before_f9_on.png`
   - Sau: `ow_1187_621_after_f9_off.png` & `ow_1187_621_after_f9_on.png` — Lòng đường tiếp tục duy trì độ thông thoáng tuyệt đối >= 72px.
3. **Cây Liễu Cổ Thụ Landmark `(1200, 915)`:**
   - Sau: `ow_willow_1200_915_after_f9_off.png` & `ow_willow_1200_915_after_f9_on.png` — Gốc liễu cổ thụ nổi bật trang nghiêm bên tảng đá rêu, prompt `[E] Quan Sát Cây Liễu Cổ Thụ` hiển thị rõ ràng.
4. **Cây Rỗng Bãi Liễu Ẩn Nấp `(1305, 885)`:**
   - Sau: `ow_hollow_tree_1305_885_after_f9_off.png` & `ow_hollow_tree_1305_885_after_f9_on.png` — Điểm ẩn nấp chiến thuật trên gò đồi tam giác thoáng đãng, dễ tiếp cận từ 4 hướng.
5. **Biển Chỉ Dẫn Xưởng Chuông `(1300, 985)`:**
   - Sau: `ow_signpost_1300_985_after_f9_off.png` & `ow_signpost_1300_985_after_f9_on.png` — Biển chỉ dẫn cọc gỗ đứng vững chãi bên cạnh cụm đá rêu và hàng rào ranh giới.

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG BẰNG TEST SUITE (5/5 PASS)

Kịch bản kiểm thử độc lập `tests/hw_map_28_tree_polish_verification.py` chạy trực tiếp trên nền Playwright headless, khởi động game thực tế với Noclip OFF:

```text
=== CHECK 1: Willow Grove Landmark & Alignment ===
  Willow clue found: True at {'x': 1200, 'y': 915}
  Ancient Willow sprite: True at {'x': 1200, 'y': 915}
  Companion Willow sprite: True at {'x': 1162, 'y': 897}
  Interaction execute: True
  -> CHECK 1 PASS: Willow grove landmark and clue aligned and functional!

=== CHECK 2: Hollow Tree Stealth Hiding Spot ===
  Hollow tree spot found: True at {'x': 1305, 'y': 885}
  Enter hiding: True, Exit hiding: True
  -> CHECK 2 PASS: Hollow tree stealth hiding spot verified!

=== CHECK 3: Southern Rim Composition & Signpost ===
  Signpost found: True at {'x': 1300, 'y': 985}
  Player clearing at (1283, 923) clear of colliders: True
  Signpost approach clear: True
  -> CHECK 3 PASS: Southern rim and signpost clear and unobstructed!

=== CHECK 4: Physical Traversal Across 5 Defined Routes (Noclip OFF) ===
  Route 1: North Entry <-> Hunter Camp (S-Curve): Clear=True (Blocked: [])
  Route 2: Camp <-> Junction <-> Sir Vaelen: Clear=True (Blocked: [])
  Route 3: Junction <-> Bell Workshop corridor: Clear=True (Blocked: [])
  Route 4: Willow Clearing & Forest Edge: Clear=True (Blocked: [])
  Route 5: Willow Edge Loop -> Workshop Corridor: Clear=True (Blocked: [])
  -> CHECK 4 PASS: All 5 routes 100% physically traversable with Noclip OFF!

=== CHECK 5: Performance & Culling Integrity ===
  Total cullables in scene: 368
  South Outer Woods cullables: 24
  South Outer Woods static colliders: 12
  -> CHECK 5 PASS: Culling and collider performance clean!

==================================================
FINAL RESULT: ALL PASS (5/5)
==================================================
```

### 4.1. Kiểm thử hồi quy toàn diện (Master Regression Suite)
- `tests/hw_rp02_final_regression_suite.py`: **100% PASS (0 console errors, 0 page errors)**.
- `npx tsc --noEmit`: **Exit code 0 (Zero type errors)**.
- `npm run build`: **Vite production build thành công (16.80s)**.

---

## 5. TUÂN THỦ NGUYÊN TẮC AN TOÀN DỰ ÁN

1. **Bảo tồn tính toàn vẹn thế giới:** Không xóa bỏ bất kỳ cơ chế gameplay, ẩn nấp (`hide_tree_ow_willow`), tương tác (`inspect_ow_willow`), biển chỉ dẫn hay ranh giới bản đồ.
2. **Không trùng lặp đồ họa/vật lý:** Tất cả cây và đá mới/chuyển dịch đều dùng sprite Pixel Art thật từ `Constants.ts`, neo origin `(0.5, 1.0)`, depth = baseY và đăng ký `registerCullable`.
3. **Bảo toàn tệp Manifest của Owner:** Giữ nguyên vẹn 3 tệp manifest audio untracked (`scripts/AUDIO_SOURCES_MANIFEST.csv`, `scripts/AUDIO_SOURCES_MANIFEST.json`, `scripts/generate_audio_sources_manifest.mjs`).
4. **Định dạng code:** `git diff --check` đạt 0 lỗi trailing whitespace.
