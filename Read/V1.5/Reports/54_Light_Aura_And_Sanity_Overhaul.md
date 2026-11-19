# BÁO CÁO KỸ THUẬT V15-54: BỎ ĐÈN LỒNG CẦM TAY, TẠO VÒNG SÁNG [F] TIÊU HAO THỂ LỰC, GIẢM ĐÈN ĐƯỜNG & ĐỔI TÊN CHỈ SỐ THÀNH "TINH THẦN"

> **Dự án:** HOLLOW WOODS V1.5 (Visual & Gameplay Overhaul)  
> **Mã công việc:** V15-54  
> **Trạng thái:** HOÀN THÀNH 100% (23/23 Tests Passed, TypeScript 0 Errors, Build Thành Công)  
> **Thời gian:** 19/11/2026  

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH NÂNG CẤP

Nhằm gia tăng tính chân thực, loại bỏ các chi tiết đồ họa cồng kềnh che khuất nhân vật, tạo chiều sâu chiến thuật cho cơ chế sinh tồn bóng đêm và thống nhất thuật ngữ chuẩn kinh dị tâm lý, bước **V15-54** thực hiện 4 nhóm cải tiến đột phá:

1. **Đổi tên toàn diện chỉ số "Bình Tâm" thành "Tinh Thần" (Sanity):** Thống nhất mọi nhãn hiển thị HUD, mô tả vật phẩm, hội thoại NPC và hướng dẫn gameplay.
2. **Loại bỏ Đèn Lồng cầm tay & Khối tròn đặc thô ráp:** Thay bằng **Vòng Sáng Ấm Dịu (Soft Radial Warm Aura)** 3 lớp chuyển sắc mịn bao quanh nhân vật.
3. **Cơ chế cân bằng chi phí Ánh Sáng [F] qua Thể Lực (Stamina Drain):**
   - **Bật sáng [F]:** Tiêu hao ngay **10 Thể Lực**. Nếu Thể Lực < 10, chặn bật và phát cảnh báo: `⚠️ Không đủ Thể Lực để nhóm lửa hộ tâm! (Cần 10 Thể Lực)`.
   - **Duy trì sáng:** Tiêu hao đều đặn **1.2 Thể Lực/giây**.
   - **Tự dập tắt:** Khi Thể Lực tụt xuống `< 5` (hoặc kiệt sức), hào quang ấm áp lập tức vụt tắt và hiện thông báo: `Thể lực cạn kiệt, hào quang ấm áp vụt tắt!`.
4. **Chuẩn hóa HUD góc trên trái thành 3 Thanh Chuẩn:**
   - Thu gọn khung từ chiều cao 96px (4 thanh) xuống **80px (3 thanh)**:
     1. **Sinh Lực (Máu)** — Đỏ
     2. **Thể Lực (Stamina)** — Vàng hổ phách
     3. **Tinh Thần (Sanity)** — Tím thạch anh
   - Xóa bỏ thanh "Dầu Đèn" cũ, giữ nút `[F] SÁNG: BẬT/TẮT` tại hàng huy hiệu phụ gọn gàng bên dưới (`y = 98px`).
   - Đổi item "Dầu Đèn" thành **"Hương Trầm Tinh Thần"** (hồi ngay **+25 Tinh Thần**).
5. **Giảm 45% mật độ & độ sáng Đèn Đường:** Tháo bỏ 34 cột đèn dọc các lối đi rừng ngoài bìa rừng (Outer Woods, Crooked Path, Deep Forest, Silent Mire, Broken Bell Shrine), chỉ giữ lại đúng 3 ngọn đèn cổ kính tại trung tâm Làng Bellhollow với bán kính và độ đậm hào quang giảm 45%.

---

## 2. CHI TIẾT CÁC TỆP NGUỒN ĐÃ ĐIỀU CHỈNH

### 2.1. `src/entities/SatyrPlayer.ts`
- **Loại bỏ đồ họa cũ:** Xóa bỏ hoàn toàn sprite đèn lồng cầm tay và khối tròn đặc `fillCircle(lx, ly, 9)`.
- **Vòng Sáng Ấm Dịu (Soft Radial Warm Aura):** Dựng hiệu ứng ánh sáng 3 lớp tán mờ đặt tại `depth = this.depth - 1`:
  - Lớp 1 (Vành ngoài): Bán kính `64px`, alpha `0.02`, màu `0xf39c12`.
  - Lớp 2 (Trung gian): Bán kính `44px`, alpha `0.038`, màu `0xf1c40f`.
  - Lớp 3 (Lõi ấm): Bán kính `26px`, alpha `0.065`, màu `0xffe082`.
- **Hàm `toggleLantern()`:** Kiểm tra `stats.stamina < 10`. Nếu thiếu thể lực, báo popup và không bật; nếu đủ, trừ ngay 10 điểm Thể Lực và chuyển trạng thái bật/tắt.

### 2.2. `src/systems/SurvivalSystem.ts`
- **Tiêu hao Thể Lực theo thời gian:** Mỗi giây duy trì sáng trừ `1.2 * dt` điểm Thể Lực.
- **Tự động tắt sáng khi kiệt sức:** Khi `stats.stamina < 5`, tự động gán `stats.isLanternOn = false`, phát sự kiện `lantern_exhausted` và đồng bộ `stats_changed`.
- Đổi toàn bộ nhãn và comment từ "Bình Tâm" sang "Tinh Thần".

### 2.3. `src/scenes/UIScene.ts`
- **Khung 3 thanh chuẩn:** Thu gọn chiều cao thẻ `statCardBg` xuống 80px (từ 96px).
- **Căn chỉnh tọa độ HUD:**
  - Sinh Lực (Health): `y: 32`
  - Thể Lực (Stamina): `y: 48`
  - Tinh Thần (Sanity): `y: 64` (màu `#a29bfe` / `#fd79a8` / `#ff3838`)
  - Ẩn vĩnh viễn nhãn `oilValText`.
- **Hàng huy hiệu phụ:** Đặt tại `y: 98` (khớp cả `create()` và `updateStatusBadges()`). Nút ánh sáng đổi thành `✨ [F] SÁNG: BẬT` / `🌑 [F] SÁNG: TẮT`.
- **Vật phẩm Hương Trầm Tinh Thần:** Cập nhật `tryConsumeLanternOil()` để hồi phục `+25 Tinh Thần`, kiểm tra nếu Tinh Thần đã đầy 100% thì không tiêu hao lãng phí.

### 2.4. `src/world/WorldBuilder.ts`
- **Giảm 45% bán kính và độ đậm đèn đường:**
  - Bán kính halo: `36 -> 20px`, `24 -> 13px`, `12 -> 7px`.
  - Alpha halo: `0.05 -> 0.028`, `0.09 -> 0.050`, `0.16 -> 0.088`.
- **Loại bỏ đèn đường dư thừa:** Xóa toàn bộ 34 cột đèn dọc các bìa rừng Outer Woods, Crooked Path, Deep Forest, Silent Mire, Broken Bell Shrine và mép ngoài làng.
- **Giữ lại đúng 3 cột đèn tại trung tâm Làng Bellhollow:**
  1. `(482, 195)`: Chốt Canh Cổng Tây của Garth
  2. `(780, 250)`: Quảng Trường Lửa Trại Trung Tâm
  3. `(900, 335)`: Lối đi Nam Quảng Trường & Tháp Chuông

### 2.5. `src/data/items.json` & `src/data/dialogues.json`
- Đổi `item_lantern_oil`: Tên `"Hương Trầm Tinh Thần"`, hiệu ứng `"composure": 25`.
- Đổi công thức `craft_lantern_oil`: Tên `"Luyện Hương Trầm Tinh Thần"`, nguyên liệu 1 Nhựa thông + 1 Gỗ khô.
- Rà soát sạch sẽ 100%, không còn bất kỳ chữ "Bình Tâm" hay "Dầu Đèn" nào trong cả 2 tệp dữ liệu.

### 2.6. `src/scenes/GameScene.ts` & `README.md`
- Lắng nghe event `lantern_exhausted` để hiện thông báo `Thể lực cạn kiệt, hào quang ấm áp vụt tắt!`.
- Cập nhật thông báo đài lửa và cặp mắt sương mù thành `Hào Quang [F]` và `Tinh Thần`.
- Cập nhật bảng phím tắt `README.md` ghi nhận chi phí thể lực khi bật/duy trì hào quang.

---

## 3. KẾT QUẢ KIỂM TOÁN TỰ ĐỘNG (AUTOMATED TEST AUDIT)

Script kiểm toán tự động `scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs` thực hiện 23 bước kiểm tra:

```
--- 1. Kiểm tra SatyrPlayer.ts: Vòng Sáng Ấm Dịu & Chi Phí 10 Thể Lực ---
  [PASS] toggleLantern kiểm tra Thể Lực < 10 trước khi bật sáng
  [PASS] toggleLantern trừ 10 điểm Thể Lực khi bật sáng
  [PASS] Có cảnh báo khi Thể Lực không đủ 10
  [PASS] Đã xóa khối tròn đặc đèn lồng cứng cũ
  [PASS] Có vòng sáng ấm dịu chuyển sắc mịn

--- 2. Kiểm tra SurvivalSystem.ts: Tiêu Hao 1.2 Thể Lực/giây & Tự Tắt khi Cạn Kiệt ---
  [PASS] Có tiêu hao 1.2 Thể Lực/giây khi bật hào quang sáng
  [PASS] Tự động tắt khi Thể Lực < 5
  [PASS] Phát event lantern_exhausted khi cạn Thể Lực

--- 3. Kiểm tra UIScene.ts: Khung 3 Thanh Chỉ Số Chuẩn & Hương Trầm Tinh Thần ---
  [PASS] Khung chỉ số thu gọn còn 80px (3 thanh chuẩn)
  [PASS] Nhãn chỉ số đổi sang Tinh Thần
  [PASS] Nút trạng thái đổi sang Hào Quang Sáng Bật/Tắt
  [PASS] tryConsumeLanternOil sử dụng Hương Trầm Tinh Thần (+25 Tinh Thần)
  [PASS] Hàng huy hiệu phụ cập nhật khớp y: 98px

--- 4. Kiểm tra WorldBuilder.ts: Giảm 45% Đèn Đường & Giữ Đúng 3 Cột Đèn Trung Tâm Làng ---
  [PASS] Số lượng cột đèn đường trong toàn bộ game đúng bằng 3 (thực tế: 3)
  [PASS] Giữ cột đèn tại Cổng Tây (482, 195)
  [PASS] Giữ cột đèn Quảng Trường Trung Tâm (780, 250)
  [PASS] Giữ cột đèn Nam Quảng Trường (900, 335)
  [PASS] Giảm 45% alpha hào quang đèn đường

--- 5. Kiểm tra items.json & dialogues.json: Sạch 100% "Bình Tâm" & "Dầu Đèn" ---
  [PASS] items.json sạch 100% không còn "Bình Tâm" hay "Dầu Đèn"
  [PASS] dialogues.json sạch 100% không còn "Bình Tâm" hay "Dầu Đèn"
  [PASS] item_lantern_oil có tên là "Hương Trầm Tinh Thần"
  [PASS] Hương Trầm Tinh Thần hồi phục +25 Tinh Thần
  [PASS] Công thức craft_lantern_oil là "Luyện Hương Trầm Tinh Thần"

--- TỔNG KẾT KIỂM TOÁN TỰ ĐỘNG V15-54 ---
Passed: 23 | Failed: 0
>>> TẤT CẢ CÁC BƯỚC KIỂM TOÁN V15-54 THÀNH CÔNG RỰC RỠ! <<<
```

- **TypeScript check (`npm run check`):** 0 lỗi.
- **Production Build (`npm run build`):** Thành công trong 10.71s, xuất bản mã nguồn tối ưu tại `dist/`.
