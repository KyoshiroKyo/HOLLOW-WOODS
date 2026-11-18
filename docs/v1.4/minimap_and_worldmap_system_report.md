# BÁO CÁO KỸ THUẬT: HỆ THỐNG MINI-MAP GÓC MÀN HÌNH & BẢN ĐỒ THẾ GIỚI GIẤY DA (PHÍM M)
**Dự án:** HOLLOW WOODS (Phaser 4 - Dark Woodland Survival Horror)  
**Phiên bản:** v1.4.0  
**Ngày hoàn thành:** 18/11/2026  
**Trạng thái:** HOÀN THÀNH TOÀN DIỆN (100% TIÊU CHÍ KỸ THUẬT)

---

## 1. TỔNG QUAN HỆ THỐNG ĐỊNH HƯỚNG 2 CHẾ ĐỘ

Nhằm giải quyết dứt điểm phản hồi về sự mất phương hướng khi di chuyển qua các phân khu rừng rậm mù sương, hệ thống định hướng 2 chế độ đã được thiết kế và triển khai đồng bộ với phong cách **Dark Woodland Pixel Art** (tông gỗ mun, đồng cổ, giấy da ố vàng, mực cháy xém và ánh sáng hổ phách):

```
+-----------------------------------------------------------------------------------------+
| [HD 1280x720 Screen]                                                                    |
|                                                                                         |
|  [Thanh Sinh Tồn Góc Trái]                    [🧭 Mini-map Góc Phải 190x144 px (Phím N)]|
|  - Sinh lực / Thể lực                         - Khung gỗ viền đồng cổ bán trong suốt    |
|  - Bình tâm / Dầu đèn                         - Render địa hình tĩnh vào Texture 1 lần  |
|                                               - Mũi tên hổ phách xoay theo hướng nhìn   |
|                                               - Vị trí đèn lồng, đốm lửa trại           |
|                                               - TUYỆT ĐỐI KHÔNG HIỂN THỊ QUÁI VẬT       |
|                                                                                         |
|                    +------------------------------------------+                         |
|                    | [Bản Đồ Thế Giới Giấy Da - Phím M]       |                         |
|                    | - Khung 980x600 px giữa màn hình         |                         |
|                    | - Topology 10 phân khu: Bellhollow tâm   |                         |
|                    | - Cơ chế Sương Mù Khám Phá (Fog of War)  |                         |
|                    | - Con trỏ vị trí nhấp nháy phát sáng     |                         |
|                    | - Đóng bằng phím M / ESC / nút X         |                         |
|                    +------------------------------------------+                         |
+-----------------------------------------------------------------------------------------+
```

---

## 2. CHI TIẾT TRIỂN KHAI KỸ THUẬT

### 2.1. Chế độ 1 — Mini-map Góc Trên Bên Phải (`MiniMapWidget.ts`)
- **Vị trí & Kích thước:** Tọa độ $(1070, 104)$, kích thước khung $190 \times 144$ px, diện tích map hiển thị $180 \times 120$ px. Không che khuất thanh sinh tồn bên góc trái cũng như các thông báo trung tâm.
- **Tối ưu hiệu năng kết xuất (Zero Runtime Overhead):**
  - Địa hình tĩnh (cỏ nền, đường mòn đất nện, đầm lầy, vách đá, cổng chuyển cảnh) được kết xuất vào `CanvasTexture` duy nhất **1 lần** khi người chơi bước vào phân khu mới (`updateZoneTerrain`).
  - Sử dụng chế độ nội suy `Phaser.Textures.FilterMode.NEAREST` đảm bảo các pixel sắc nét, không bị nhòe mờ.
  - Mỗi frame (`updateDynamicMarkers`) chỉ thực hiện vẽ lại các điểm chấm sáng động (mũi tên hướng nhìn nhân vật `player.facing`, đèn lồng đã thắp, lửa trại trung tâm).
- **Bảo toàn yếu tố kinh dị:** Tuyệt đối loại trừ toàn bộ thực thể quái vật (Bat, Ghost, Shadow, The Listener, Mire Warden) khỏi Mini-map, giữ trọn vẹn sự bất ngờ và căng thẳng khi khám phá.
- **Phím tắt:** Bật/tắt nhanh bằng phím `N` (`toggle()`).

### 2.2. Chế độ 2 — Bản đồ Thế giới Giấy Da Cổ (`ParchmentWorldMapModal.ts`)
- **Thiết kế Mỹ thuật:** Khung kích thước $980 \times 600$ px đặt tại trung tâm màn hình $(640, 360)$, mô phỏng bản đồ vẽ tay trên giấy da cổ với viền mực cháy xém, hoa văn la bàn cổ điển và các tuyến đường mòn gạch nối.
- **World Topology:** Sơ đồ 10 phân khu lấy **Làng Bellhollow** $(470, 280)$ làm trung tâm:
  1. *Làng Bellhollow (Trại Tị Nạn An Toàn)*: $(470, 280)$
  2. *Rìa Rừng Ngoài (Outer Woods)*: $(280, 280)$
  3. *Lối Mòn Quanh Co (Crooked Path)*: $(470, 160)$
  4. *Rừng Sâu U Tối (Deep Forest)*: $(660, 160)$
  5. *Lối Chuyển Sương Mù (Fog Crossing)*: $(280, 420)$
  6. *Nông Trại Sanctuary (Sanctuary Farm)*: $(470, 420)$
  7. *Đầm Lầy Tĩnh Lặng (Silent Mire)*: $(660, 280)$
  8. *Bàn Cờ Cổ Ngữ (Ancient Rune Puzzle)*: $(660, 420)$
  9. *Miếu Chuông Phế Tích (Broken Bell Shrine)*: $(830, 280)$
  10. *Vực Thẳm Vô Tận (Abyssal Chasm)*: $(830, 160)$
- **Cơ chế Sương Mù Khám Phá (Fog of War Persistence):**
  - Tự động đọc dữ liệu khám phá từ `PlayerState.hasVisitedZone(zoneId)`.
  - Phân khu chưa từng bước chân đến bị che phủ bởi lớp sương mù mực xám với biểu tượng `🌫️` và nhãn `Chưa Khám Phá`.
  - Phân khu đã đến được vén sương, hiển thị đầy đủ tên tiếng Việt, mô tả địa danh và manh mối nhiệm vụ.
  - Dữ liệu sương mù được lưu trữ bền vững cùng file save game thông qua `SaveManager`.
- **Định vị Người chơi:** Vị trí hiện tại được làm nổi bật với con trỏ `📍 VỊ TRÍ HIỆN TẠI` kèm hiệu ứng tween nhấp nháy phát sáng hổ phách (`amber pulse tween`).
- **Tạm dừng gameplay:** Khi mở bản đồ thế giới bằng phím `M`, nhân vật tự động dừng vận tốc (`setVelocity(0, 0)`), chu kỳ thời gian và quái vật tạm thời đóng băng, đảm bảo an toàn cho người chơi khi định hướng.

---

## 3. TÍCH HỢP HỆ THỐNG (SCENE HOOKS)

1. **`src/scenes/UIScene.ts`:**
   - Quản lý vòng đời của `miniMapWidget` và `parchmentWorldMapModal`.
   - Bắt phím `keydown-N` (toggle Mini-map) và `keydown-M` (toggle Parchment Map).
   - Mở rộng getter `isAnyModalOpen` bao gồm `parchmentWorldMapModal.isOpen`.
2. **`src/scenes/GameScene.ts`:**
   - Tích hợp `keyM` và `keyN` với dọn dẹp bộ nhớ an toàn trong lifecycle shutdown.
   - Khi `isUIBusy` kích hoạt (kể cả khi mở bản đồ), vô hiệu hóa điều khiển và triệt tiêu vận tốc người chơi.
   - Trong `applyCameraBoundsForZone(zoneId)`: Tự động cập nhật bản đồ địa hình tĩnh cho phân khu mới.
   - Trong `update()`: Đồng bộ vị trí và hướng nhìn người chơi lên Mini-map mỗi khung hình.

---

## 4. KẾT QUẢ KIỂM TOÁN TỰ ĐỘNG

Chạy kịch bản `scripts/verify_step2_minimap_and_worldmap.mjs`:
- **Thành phần MiniMapWidget:** Đạt 9/9 tiêu chí (Tọa độ, kích thước, canvas texture, dynamic markers, zero-monster rule).
- **Thành phần ParchmentWorldMapModal:** Đạt 7/7 tiêu chí (Khung giấy da 980x600, Bellhollow center, Fog of War, beacon pulse).
- **Tích hợp UIScene:** Đạt 7/7 tiêu chí (Phím M/N, isAnyModalOpen, API mini-map).
- **Runtime GameScene:** Đạt 6/6 tiêu chí (Bắt phím cứng, đóng băng khi bận, cập nhật tĩnh khi chuyển zone, cập nhật động mỗi frame).
- **Tổng cộng:** 24/24 tiêu chí ĐẠT CHUẨN 100%.
- **Biên dịch Production (`npm run build`):** Không lỗi, chunk WebGL nén gzip hoàn hảo.
