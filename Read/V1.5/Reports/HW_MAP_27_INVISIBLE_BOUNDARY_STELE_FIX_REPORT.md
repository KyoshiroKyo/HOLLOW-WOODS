# BÁO CÁO NGHIỆM THU: HW-MAP-27 — BỔ SUNG ĐỒ HỌA RANH GIỚI VÔ HÌNH, DI DỜI BỤI ẨN NẤP & BIA ĐÁ TƯỞNG NIỆM KỴ SĨ

**Dự án:** HOLLOW WOODS — Chuẩn bị phát hành V1.5.4\
**Nhánh:** `feat/v1.5.3-ag-world-polish`\
**Mã nhiệm vụ:** `HW-MAP-27`\
**Mức độ ưu tiên:** P1 Visual / Collision\
**Baseline Git:** `edc3041329f59fedaf3ce4811dd43327f2d69fb8`\
**Ngày thực hiện:** 22/11/2026\
**Trạng thái:** HOÀN THÀNH TOÀN DIỆN & ĐẠT 100% TEST NỘI BỘ (5/5 PASS)

---

## 1. TỔNG QUAN VẤN ĐỀ & BỐI CẢNH

Từ phản hồi thực tế của Owner khi khảo sát bản đồ **Rừng Ngoại Vi (Outer Woods)**, phát hiện 3 vấn đề gây cản trở trải nghiệm khám phá và điều khiển của người chơi:

1. **Tường vô hình gây đâm sầm tại ranh giới Nam `(1283, 923)`:**
   - Người chơi đi xuống phía Nam hoặc rẽ sang bờ Tây gặp chướng ngại vật cản lại mà không thấy vật cản đồ họa nào, ngỡ ngàng tưởng game bị lỗi va chạm ảo.
   - *Kiểm toán hình học thực tế:* Hai collider `ow_bound_bottom_left` (`1120..1320, y: 1020, 200x32`) và `farm_bound_right_bottom` (`1100..1132, 840..1040, 32x220`) là **ranh giới bản đồ hợp lệ** (nhằm giữ người chơi trong thế giới game và phân luồng lối đi chính xác xuống Xưởng Chuông), nhưng **hoàn toàn thiếu đồ họa chắn trực quan** (Missing Visual Props), dẫn đến tình trạng "thảm cỏ mở toang nhưng lại có tường vô hình".
2. **Bụi rậm khúc cua chữ S án ngữ giữa lòng đường `(1187, 621)`:**
   - Bụi rậm `hide_bush_ow_s_curve` đặt tại `(1180, 650)` nằm đè lên chính giữa lối mòn đất đỏ, che khuất toàn bộ nhân vật khi bước qua và chắn tầm nhìn tới cây thông già có cụm nhựa thông tại `(1170, 630)`.
3. **Bia đá tưởng niệm kỵ sĩ nằm chình ình giữa ngã ba đường `(1250, 720)`:**
   - Bia đá cổ `env_knights_memorial_stele` đặt tại `(1250, 720)` nằm ngay tâm điểm giao cắt giữa 3 hướng đường chính (sang Nông trại Sanctuary Farm, xuống Xưởng Chuông Bỏ Hoang, và lên Trại thợ săn / Bếp Sir Vaelen), cản trở trực quan và gây vướng víu cho việc di chuyển liên vùng.

---

## 2. KẾT QUẢ KIỂM TOÁN HÌNH HỌC (HITBOX & GEOMETRY AUDIT)

Kiểm toán hình học với Playwright ở chế độ Arcade Debug Graphics (F9 ON) và zoom camera 2.2x đo đạc chi tiết:

| Khu vực khảo sát | Tọa độ mục tiêu | Collider / Thực thể hiện hữu | Tình trạng ban đầu | Giải pháp chuẩn mực HW-MAP-27 |
| :--- | :--- | :--- | :--- | :--- |
| **Ranh giới Nam & Tây Nam** | `(1283, 923)` & `y=1020` | `ow_bound_bottom_left` (`1120..1320, y: 1020`) & `farm_bound_right_bottom` (`1100..1132, y: 840..1040`) | Collider ranh giới hợp lệ nhưng không có đồ họa chắn | Bổ sung 4 cọc rào gỗ mục `SPRITE_WOODEN_FENCE` phía Nam tại `y: 1020` (`x: 1130, 1175, 1220, 1265`) và 2 cọc phía Tây (`x: 1125, y: 920, 965`). Không tạo thêm static body vật lý để tránh trùng lặp. Giữ thông suốt cổng xuống Xưởng Chuông (`x >= 1320`). |
| **Khúc cua chữ S** | `(1187, 621)` | `hide_bush_ow_s_curve` (`1180, 650`) & cây resin (`1170, 630`) | Bụi rậm nằm đè lên lòng đường đất, che khuất nhân vật | Di dời bụi rậm sang ven đường phía Tây tại `(1150, 655)`, nằm gọn giữa tảng đá và thân cây mục. Mở thông thoáng lòng đường >= 72px và giải phóng 100% tầm nhìn tới cây nhựa thông `(1170, 630)`. |
| **Ngã ba đường Outer Woods** | `(1250, 720)` | `env_knights_memorial_stele` (`1250, 720`) | Bia đá nằm trên tảng đá giữa lòng ngã ba đường | Di dời bia đá về hốc râm mát trang nghiêm dưới tán cây sồi đại thụ ven đường tại `(1260, 645)`. Mở toang ngã ba đường đi 4 hướng, bảo toàn toàn bộ tương tác và cốt truyện. |

---

## 3. CHI TIẾT CÁC CHỈNH SỬA MÃ NGUỒN

Đồng bộ nhất quán trên 3 tệp nguồn cấu trúc thế giới game:

### 3.1. `src/world/WorldBuilder.ts`
1. **Di dời bụi ẩn nấp:**
   ```typescript
   // HW-MAP-27: Dời bụi rậm từ (1180, 650) sang ven đường phía Tây (1150, 655), giải phóng 100% tầm nhìn và lòng đường khúc cua S
   this.createDenseBush(1150, 655); // Bụi Rậm Khúc Cua Chữ S (Ven đường)
   ```
2. **Bổ sung đồ họa rào gỗ mục chắn ranh giới bản đồ:**
   ```typescript
   // HW-MAP-27: Hàng rào gỗ mục ven rừng che chắn trực quan cho ranh giới vô hình ow_bound_bottom_left & farm_bound_right_bottom
   // Đảm bảo không tạo thêm body vật lý (tận dụng collider ranh giới sẵn có) và không chắn lối xuống Xưởng Chuông (x >= 1320)
   const southBorderFenceX = [1130, 1175, 1220, 1265];
   for (const fx of southBorderFenceX) {
     const fence = this.scene.add.image(fx, 1020, SPRITE_WOODEN_FENCE);
     fence.setOrigin(0, 0.78);
     fence.setDepth(1020);
     this.registerCullable(fence, fx + 23, 1020, 40);
   }
   const westBorderFenceY = [920, 965];
   for (const fy of westBorderFenceY) {
     const fence = this.scene.add.image(1125, fy, SPRITE_WOODEN_FENCE);
     fence.setOrigin(0, 0.78);
     fence.setDepth(fy);
     this.registerCullable(fence, 1125 + 23, fy, 40);
   }
   ```
3. **Di dời Bia Đá Tưởng Niệm Kỵ Sĩ:**
   - Cập nhật tọa độ đăng ký Clue tương tác trong danh sách `envProps`:
     ```typescript
     id: 'env_knights_memorial_stele',
     name: 'Bia Đá Tưởng Niệm Kỵ Sĩ',
     type: 'clue',
     x: 1260,
     y: 645,
     width: 36,
     height: 36,
     promptText: '[E] Đọc Bia Đá Tưởng Niệm Kỵ Sĩ',
     actionId: 'inspect_knights_memorial_stele'
     ```
   - Cập nhật hàm dựng sprite đồ họa `renderEnvironmentalStorytellingProps()`:
     ```typescript
     // 1. Bia Đá Tưởng Niệm Kỵ Sĩ (outer_woods, 1260, 645) - HW-MAP-27: Dời về hốc trang nghiêm ven đường râm mát dưới tán sồi
     const stele = this.safeAddImage(1260, 645, SPRITE_STONE_ALTAR);
     stele.setDepth(645);
     this.registerCullable(stele, 1260, 645, 60);
     ```

### 3.2. `src/data/zones.json`
- Cập nhật tọa độ `hide_bush_ow_s_curve`: `"x": 1150, "y": 655` (trước đó: `1180, 650`).
- Cập nhật tọa độ `env_knights_memorial_stele`: `"x": 1260, "y": 645` (trước đó: `1250, 720`).

### 3.3. `src/data/maps/outer_woods.json`
- Cập nhật đối tượng `hide_bush_ow_s_curve` (id: 19): `"x": 1150, "y": 655`.
- Cập nhật đối tượng `env_knights_memorial_stele` (id: 24): `"x": 1260, "y": 645`.

---

## 4. BỘ ẢNH ĐỐI CHIẾU TRỰC QUAN (BEFORE / AFTER & F9 ON / OFF)

Bộ ảnh chụp kiểm thử ở độ phân giải 1280x720 và camera zoom 2.2x được lưu trữ tại `Read/V1.5/Reports/Visuals/HW_MAP_27/`:

### 4.1. Khúc cua chữ S & Bụi rậm `(1187, 621)`
- **Trước khi sửa:**
  - `ow_1187_621_before_f9_off.png`: Bụi rậm nằm giữa lòng đường đất, che khuất người chơi.
  - `ow_1187_621_before_f9_on.png`: Bụi rậm và collider cây chắn ngang tuyến đường.
- **Sau khi sửa:**
  - `ow_1187_621_after_f9_off.png`: Lòng đường đất thông thoáng hoàn toàn, bụi rậm dời nép vào ven rừng phía Tây, nhìn rõ người chơi và cây nhựa thông.
  - `ow_1187_621_after_f9_on.png`: Lối đi rộng >= 72px không còn bất kỳ collider nào cản trở.

### 4.2. Ranh giới phía Nam `(1283, 923)` & Hàng rào gỗ mục
- **Trước khi sửa:**
  - `ow_1283_923_before_f9_off.png`: Bãi cỏ xanh mở toang nhưng người chơi đi xuống bị đâm vào tường vô hình.
  - `ow_1283_923_before_f9_on.png`: Hộp va chạm màu tím của `ow_bound_bottom_left` nằm trơ trọi giữa thảm cỏ.
- **Sau khi sửa:**
  - `ow_1283_923_after_f9_off.png`: Hàng rào gỗ mục pixel art cổ điển chắn ngang mép rừng phía Nam và phía Tây, tạo lý do thị giác hoàn toàn tự nhiên vì sao người chơi không thể đi tiếp.
  - `ow_1283_923_after_f9_on.png`: Collider ranh giới khớp hoàn hảo với vị trí hàng rào gỗ mục; lối rẽ phía Đông xuống Xưởng Chuông rộng mở.

### 4.3. Ngã ba đường & Bia đá tưởng niệm
- **Trước khi sửa:**
  - `ow_stele_1250_720_f9_off.png`: Bia đá nằm giữa lòng ngã ba đường.
  - `ow_stele_1250_720_f9_on.png`: Collider bia đá án ngữ tâm lộ.
- **Sau khi sửa:**
  - `ow_stele_1250_720_after_f9_off.png` & `ow_stele_1250_720_after_f9_on.png`: Tâm ngã ba đường thông thoáng 100%, không còn vật cản.
  - `ow_stele_1260_645_after_f9_off.png` & `ow_stele_1260_645_after_f9_on.png`: Bia đá tọa lạc uy nghiêm, thanh tịnh trong hốc bóng râm ven đường dưới gốc sồi đại thụ.

---

## 5. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG BẰNG TEST SUITE

Kịch bản kiểm thử độc lập `tests/hw_map_27_barrier_stele_verification.py` chạy trực tiếp trên nền Playwright headless, khởi động game thực tế và kiểm tra 5 tiêu chí:

```text
=== CHECK 1: Knight Memorial Stele Verification ===
  Stele found: True at {'x': 1260, 'y': 645}
  Sanity boost: 50 -> 65 (Delta: +15)
  Flag set: True, Lore unlocked: True
  Old location (1250, 720) clear of colliders: True
  -> CHECK 1 PASS: Knight Memorial Stele relocated, functional and crossroads clear!

=== CHECK 2: Relocated Hiding Bush Verification ===
  Bush found: True at {'x': 1150, 'y': 655}
  Enter hiding success: True, Exit hiding success: True
  Old road position (1180, 650) clear: True
  -> CHECK 2 PASS: Hiding bush relocated to roadside, functional, and road clear!

=== CHECK 3: Resource Nodes near S-Curve ===
  Resin node: True at {'x': 1170, 'y': 630}, approach clear: True
  Wood node: True at {'x': 1190, 'y': 675}, approach clear: True
  -> CHECK 3 PASS: Resource nodes fully accessible!

=== CHECK 4: Boundary Visual Props (Fences) ===
  Total fence sprites rendered: 51
  South boundary fence X: [1130, 1175, 1220, 1265] (y=1020)
  West boundary fence Y: [920, 965] (x=1125)
  Collision boundary check: before fence (y=980) clear=True, at fence boundary (y=1030) blocked=True
  -> CHECK 4 PASS: Boundary fences rendered accurately and align with collision boundary!

=== CHECK 5: Paths & Zone Transitions Clearance ===
  Bell Workshop corridor (1360, 1000) clear: True
  Sanctuary Farm gateway (1120, 750) clear: True
  North corridor (1250, 600) clear: True
  -> CHECK 5 PASS: All paths and zone transitions fully clear and unobstructed!

==================================================
FINAL RESULT: ALL PASS (5/5)
==================================================
```

### 5.1. Kiểm thử hồi quy toàn diện (Master Regression Suite)
- Chạy `tests/hw_rp02_final_regression_suite.py`: **100% PASS (0 console errors, 0 page errors)**.
- Chạy `tests/hw_bug_26b_walkrun_fix_verification.py`: **100% PASS (5/5 test suites)**.
- Chạy `npx tsc --noEmit`: **Exit code 0 (Zero type errors)**.
- Chạy `npm run build`: **Vite production build thành công (16.56s)**.

---

## 6. TUÂN THỦ NGUYÊN TẮC AN TOÀN DỰ ÁN

1. **Bảo tồn tính toàn vẹn vật lý:** Không tự ý xóa bỏ các collider ranh giới bản đồ cần thiết (`ow_bound_bottom_left`, `farm_bound_right_bottom`). Sử dụng đồ họa pixel art thật để hiển thị trực quan rào chắn.
2. **Không sinh rác vật lý:** Hàng rào gỗ mục mới được tạo dưới dạng đối tượng Image tĩnh có culling, không sinh thêm arcade body vật lý mới.
3. **Bảo toàn cốt truyện & tiến trình:** Toàn bộ flag `inspected_knights_memorial_stele`, lore `lore_knights_memorial_stele`, phần thưởng +15 Tinh thần và modal Torn Page được giữ nguyên vẹn 100%.
4. **Bảo toàn tệp Manifest của Owner:** Giữ nguyên vẹn 3 tệp manifest audio untracked (`scripts/AUDIO_SOURCES_MANIFEST.csv`, `scripts/AUDIO_SOURCES_MANIFEST.json`, `scripts/generate_audio_sources_manifest.mjs`).
5. **Định dạng code:** `git diff --check` đạt 0 lỗi trailing whitespace.
