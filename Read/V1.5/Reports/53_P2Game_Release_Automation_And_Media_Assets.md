# BÁO CÁO KỸ THUẬT BƯỚC V15-53: XÂY DỰNG QUY TRÌNH TỰ ĐỘNG HÓA POST-BUILD VÀ XUẤT BẢN P2GAME RELEASE V1.5

> **Mã công việc:** V15-53  
> **Phiên bản:** HOLLOW WOODS V1.5.0  
> **Thời gian:** 19/11/2026  
> **Trạng thái:** ✅ **HOÀN THÀNH 100% (48/48 CHECKS PASS, TSC 0 LỖI, RELEASE:P2GAME BUILD THÀNH CÔNG, METADATA & MEDIA ĐỒNG BỘ HOÀN HẢO)**

---

## 1. TỔNG QUAN HẠNG MỤC THI CÔNG

Nhằm đảm bảo mỗi lần cập nhật phiên bản HOLLOW WOODS V1.5 đều tự động xuất bản một gói phát hành hoàn chỉnh, chính quy, sẵn sàng nạp ngay lên nền tảng **P2Game.io** mà không cần thao tác thủ công, bước V15-53 thiết lập quy trình tự động hóa **Post-Build Pipeline**:

1. **Kết xuất Bộ Nhận Diện Pixel Art Chuẩn Nearest-Neighbor:**
   - Sử dụng tài nguyên runtime thực tế của bản V1.5 để kết xuất 6 tác phẩm hình ảnh sắc nét, không bị nhòe (không nội suy bilinear/bicubic), giữ nguyên từng pixel cổ điển:
     * `media/avatar_512x512.png` ($512 \times 512\text{ px}$): Ảnh đại diện lữ khách The Mossbound Wayfarer cầm đèn lồng tỏa ánh hào quang hổ phách trong sương đêm, khung viền đồng nạm đinh tán cổ điển.
     * `media/cover_banner_1280x720.png` ($1280 \times 720\text{ px}$): Ảnh bìa & hình nền phân cảnh bên bếp lửa trại ấm áp cùng Sir Vaelen — Kỵ Sĩ Trầm Mặc giữa rừng sương mù, biểu ngữ "HOLLOW WOODS: The Fog That Remembers - V1.5 Production Release".
     * `media/screen_01_bellhollow_v15.png` ($1280 \times 720\text{ px}$): Toàn cảnh Làng Bellhollow V1.5 với Tháp Chuông Cổ, Lò Rèn, Giếng Làng, Dân Làng Edda & Garth cùng hệ thống HUD Don't Starve (Taskbar dọc 42px & Thanh Túi Đồ 8 ô giấy da + 4 ô Trang Bị đáy).
     * `media/screen_02_sir_vaelen_fire.png` ($1280 \times 720\text{ px}$): Trạm Lửa Rừng Tĩnh Lặng ngoài bìa làng, Sir Vaelen đứng bên đốm lửa bập bùng cùng lời thoại sâu sắc về màn sương ký ức.
     * `media/screen_03_crafting_ui.png` ($1280 \times 720\text{ px}$): Giao diện Bảng Chế Tạo 4 Tầng Don't Starve Together ($680 \times 500\text{ px}$) mở rộng giữa màn hình với tab danh mục, lưới công thức có ổ khóa `🔒` và khung xem trước nguyên liệu tỉ lệ xanh/đỏ trực quan.
     * `media/screen_04_boss_shadow.png` ($1280 \times 720\text{ px}$): Trận chiến kịch tính với Boss SHADOW Series tại Miếu Chuông Phế Tích, sóng âm chuông trầm, 3 Trụ Phong Ấn Mạch Rễ tỏa ánh cổ ngữ và cảnh báo áp lực Bình Tâm (Hoảng loạn tột độ).

2. **Tự Động Đồng Bộ Metadata p2game.json Đầy Đủ & Chính Quy:**
   - Tự động đọc version từ `package.json` (`"1.5.0"`) và ngày hiện tại (`updatedAt`).
   - Khai báo chuẩn xác `studio: "Kyoshiro"`, độ phân giải chuẩn $1280 \times 720\text{ px}$, hệ thống thẻ tags `["survival", "horror", "pixel-art", "exploration", ...]`.
   - Cung cấp mô tả chi tiết tiếng Việt và danh mục phím tắt điều khiển V1.5 mới nhất.
   - Ánh xạ đường dẫn tương đối trực tiếp tới avatar, cover, background và mảng 4 screenshots trong `media/`.
   - Xuất đồng bộ ra 3 vị trí:
     * `public/p2game.json` (nguồn tĩnh cho dev/build)
     * `dist/p2game.json` (thư mục gốc bên trong gói ZIP web)
     * `release/p2game/p2game.json` (bản sao lưu kiểm toán)

3. **Đóng Gói Gói Phát Hành P2Game Web Release ZIP:**
   - Tự động nén toàn bộ thư mục `dist/` (đã gồm `index.html`, `p2game.json`, `media/` và `assets/`) thành file sạch:
     `release/p2game/hollow-woods-p2game-v1.5.0.zip` ($52.18\text{ MB}$, 348 file, loại trừ hoàn toàn file rác).

4. **Tích Hợp Lệnh Build Đồng Bộ Một Bước Vào package.json:**
   - Cấu hình script `"release:p2game": "npm run build && node scripts/build_p2game_release.mjs"`.

---

## 2. DANH MỤC FILE THỰC THI & SẢN PHẨM

| Đường Dẫn Tệp | Mục Đích & Vai Trò |
|:---|:---|
| [scripts/build_p2game_release.mjs](file:///g:/HOLLOW%20WOODS/scripts/build_p2game_release.mjs) | Kịch bản tự động hóa kết xuất 6 hình ảnh Pixel Art, sinh `p2game.json` và nén file ZIP |
| [scripts/test_v15_53_p2game_release_automation.mjs](file:///g:/HOLLOW%20WOODS/scripts/test_v15_53_p2game_release_automation.mjs) | Bộ 48 bài kiểm tra tự động xác minh toàn diện quy trình và tính toàn vẹn gói phát hành |
| [package.json](file:///g:/HOLLOW%20WOODS/package.json) | Bổ sung script `"release:p2game"` |
| [public/p2game.json](file:///g:/HOLLOW%20WOODS/public/p2game.json) | Metadata P2Game V1.5.0 chính quy |
| [release/p2game/p2game.json](file:///g:/HOLLOW%20WOODS/release/p2game/p2game.json) | Bản sao lưu metadata kiểm toán |
| [public/media/](file:///g:/HOLLOW%20WOODS/public/media/) | Thư mục 6 tệp hình ảnh Pixel Art V1.5 |
| [release/p2game/media_v1.5/](file:///g:/HOLLOW%20WOODS/release/p2game/media_v1.5/) | Bản sao lưu 6 tệp hình ảnh Pixel Art V1.5 |
| [release/p2game/hollow-woods-p2game-v1.5.0.zip](file:///g:/HOLLOW%20WOODS/release/p2game/hollow-woods-p2game-v1.5.0.zip) | Gói nén Web Release chính thức sẵn sàng upload |

---

## 3. KẾT QUẢ KIỂM THỬ & XÁC MINH TOÀN BỘ

- `node scripts/test_v15_53_p2game_release_automation.mjs`: **48/48 TESTS PASSED (100%)**
- `npm run check` (`tsc --noEmit`): **0 Lỗi biên dịch TypeScript**
- `npm run release:p2game`: **Build và đóng gói thành công tuyệt đối (52.18 MB)**
- Tính toàn vẹn gói ZIP: Kiểm tra tự động xác nhận có mặt đầy đủ `p2game.json`, `index.html` và toàn bộ 6 file trong `media/` ngay tại root gói ZIP.
