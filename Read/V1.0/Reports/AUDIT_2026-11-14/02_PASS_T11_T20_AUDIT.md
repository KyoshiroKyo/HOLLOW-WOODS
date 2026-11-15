# 🔍 BÁO CÁO KIỂM TOÁN ĐỘC LẬP: CHU KỲ 2 (PASS T11 – T20)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Tài liệu đối chiếu:** Báo cáo Chu kỳ 2 trong `Read/V3.0/Reports/`, mã nguồn `src/`, file thực thi `scripts/`, cấu hình Git & GitHub
> **Ngày thực hiện:** 2026-11-14
> **Nguyên tắc làm việc:** Kiểm tra thực tế vận hành trên Canvas, đối chiếu nhị phân và toán học camera transform, vạch trần các kiểm thử hình thức

---

## 1. KẾT QUẢ KIỂM TRA ĐẶC BIỆT THEO YÊU CẦU KIỂM TOÁN

### 1.1. Dự án có thật sự chạy được không?
- **Biên dịch mã nguồn (Type Check):** Lệnh `npx tsc --noEmit` hoàn thành với **0 errors, 0 warnings** (TypeScript Strict Mode).
- **Đóng gói phân phối (Vite Build):** Lệnh `npm run build` đóng gói thành công bản production trong **5.20s**; tạo ra file bundle `dist/assets/index-BO38XdeW.js` (dung lượng 1,805.39 kB / nén gzip: 417.62 kB).
- **Thực tế vận hành trong Game (Runtime Reality):** **KHÔNG THỂ CHƠI BÌNH THƯỜNG TRÊN TRÌNH DUYỆT.** Mặc dù không gặp lỗi cú pháp hay crash JavaScript ngay khi mở, game gặp phải 4 lỗi hiển thị tử huyệt:
  1. Hộp thoại NPC bị Camera Zoom 2.2× đẩy văng xuống Y = 866 px (ngoài màn hình 720p).
  2. Bàn Chế Tạo (`CraftingModal`) và Sổ Tay (`JournalModal`) bị Camera Zoom 2.2× phóng to thành `1848×1144` px, tràn ra ngoài 4 cạnh màn hình, mất toàn bộ nút bấm viền ngoài.
  3. Màn hình kết thúc Act 6 và nút "QUAY VỀ MENU CHÍNH" bị đẩy xuống Y = 987 px, người chơi không thể click chuột để thoát khỏi credits -> **Soft-lock ở cuối game**.
  4. Nền cỏ toàn bộ thế giới bị loang lổ thủng lỗ chỗ như bàn cờ đen do cắt nhầm tile từ T07.

### 1.2. Có bị PASS sau khi chỉ kiểm tra file tồn tại không?
- **XÁC NHẬN: CÓ 100%. ĐÂY LÀ HÌNH THỨC KIỂM THỬ HÌNH THỨC (SHALLOW TESTING).**
- Bằng chứng cốt lõi nằm ở file `scripts/verify_v3_release.mjs`:
  * Cả 10 tiêu chí phát hành đều được "kiểm toán" thuần túy bằng các lệnh tìm kiếm chuỗi văn bản:
    `fs.existsSync(filePath)` và `fs.readFileSync(filePath).includes('từ_khóa')`.
  * Không hề có bất kỳ headless browser test (như Playwright hoặc Puppeteer), không kiểm tra kích thước thực tế sau phép biến đổi Camera Transform của Phaser, không kiểm tra pixel thực trên Canvas.
  * Do đó, chỉ cần file mã nguồn có khai báo đúng tên hàm/biến, script kiểm thử đã tự động chấm **PASS**, tạo ra ảo tưởng kỹ thuật rằng dự án đã "Đạt chuẩn phát hành 100%".

### 1.3. Chu kỳ 2 (Cycle 2) có làm hỏng Chu kỳ 1 (Cycle 1) không?
- **XÁC NHẬN: CÓ, PHÁ HỎNG TOÀN DIỆN HỆ THỐNG GIAO DIỆN.**
- Trong Cycle 1, trò chơi được thiết kế trên độ phân giải ảo 640×360 với Camera Zoom = 1.0.
- Đến Cycle 2 (Pass T11), kiến trúc nâng cấp Canvas lên Native HD 1280×720 và áp dụng `this.cameras.main.setZoom(2.2)` cho `GameScene` để phóng đại thế giới Pixel Art.
- **Lỗi kiến trúc cốt tử:** Thay vì đưa toàn bộ các cửa sổ giao diện (Modals/Overlays) vào `UIScene` (nơi có Camera Zoom = 1.0 cố định), nhóm phát triển lại khởi tạo `DialogueSystem`, `CraftingModal`, `JournalModal`, `PauseModal`, `DebugOverlay`, và `EndingSystem` trực tiếp bên trong `GameScene` với cờ `setScrollFactor(0)`!
- **Công thức biến đổi tọa độ Camera trong Phaser 3:**
  $$\text{Screen X} = 640 + (X - 640) \times 2.2$$
  $$\text{Screen Y} = 360 + (Y - 360) \times 2.2$$
  Kích thước hiển thị: $\text{Size}_{\text{screen}} = \text{Size}_{\text{native}} \times 2.2$.
- **Hậu quả tàn phá:**
  * Toàn bộ các hộp thoại, bảng chế tạo, sổ tay, menu tạm dừng, debug overlay và hoạt cảnh kết thúc đều bị nhân tỷ lệ 220%, vỡ bố cục, lệch tâm nghiêm trọng và văng ra ngoài khung hình canvas 1280×720.

### 1.4. Có hệ thống trùng lặp không?
- **XÁC NHẬN: CÓ 3 HỆ THỐNG TRÙNG LẶP RÕ RỆT:**
  1. **Hệ thống HUD:** Tồn tại song song `src/ui/HUDScene.ts` và `src/scenes/UIScene.ts`. Cả hai đều tự vẽ đồ họa 4 thanh máu/thể lực/dầu đèn/bình tâm, tự quản lý trạng thái đèn lồng và banner phân khu.
  2. **Hệ thống Quản lý Sinh tồn:** `SatyrPlayer.ts` có hàm `updateSurvivalStats(dt)` riêng (tự trừ thể lực, dầu đèn, bình tâm vào `this.stats`). Cùng lúc đó, `SurvivalSystem.ts` cũng chạy hàm `update(dt)` riêng (tự trừ thể lực, dầu đèn, bình tâm vào `this.playerState.stats`).
  3. **Hệ thống Quái vật:** Tồn tại `src/entities/monsters/Monster.ts` (lớp trừu tượng) và `src/entities/TheListener.ts` (kế thừa độc lập).

### 1.5. Có code không được sử dụng (Dead Code) không?
- **XÁC NHẬN: CÓ NHIỀU FILE & MÃ NGUỒN CHẾT:**
  1. `src/ui/HUDScene.ts`: Mặc dù được import và đăng ký vào mảng `scene` của `GameConfig.ts`, nhưng trong `GameScene.ts` lệnh gọi duy nhất là `this.scene.launch('UIScene')`. File `HUDScene.ts` **HOÀN TOÀN KHÔNG BAO GIỜ ĐƯỢC CHẠY**.
  2. `src/utils/ScaleManager.ts`: File chứa hàm tính toán tỷ lệ mở rộng nguyên số `calculateIntegerScale` (640×360) từ thời prototype, **HOÀN TOÀN KHÔNG CÓ BẤT KỲ FILE NÀO IMPORT HAY SỬ DỤNG** trong toàn bộ dự án.
  3. `src/entities/player/Satyr.ts`: File chỉ chứa 2 dòng re-export `SatyrPlayer`, không có bất kỳ file nào import.
  4. Các nhãn thoại `this.promptBubble` trong `NPCEntity.ts`: Bị che khuất hoặc ghi đè hoàn toàn bởi `UIScene.setInteractionPrompt`.

### 1.6. GitHub có đồng bộ với HEAD hiện tại không?
- **Kho lưu trữ từ xa (Remote):** `https://github.com/KyoshiroKyo/HOLLOW-WOODS.git`
- **Nhánh theo dõi:** `main` đồng bộ với `origin/main` tại commit `5f09c73` (*"docs: cap nhat bao cao Git Push Success va Readme Index"*).
- **Hiện trạng vùng làm việc cục bộ:** Toàn bộ mã nguồn game đã được đẩy lên GitHub tại commit `5f09c73`. Hiện tại, trong workspace chỉ có các file báo cáo chẩn đoán và kiểm toán mới sinh (`FULL_DIAGNOSTIC_REPORT.md`, thư mục `Read/V3.0/Reports/AUDIT_2026-11-14/`, `scripts/generate_full_diagnostic.mjs`) đang ở trạng thái chưa stage/commit (tuân thủ nghiêm ngặt quy tắc không push trong phiên kiểm toán).

---

## 2. BẢNG TỔNG HỢP KẾT QUẢ ĐỐI CHIẾU 10 PASS (T11 – T20)

| Pass | Hạng mục kiểm toán | Tuyên bố trong báo cáo cũ | Hiện trạng thực tế đối chiếu mã nguồn | Đánh giá độc lập |
|---|---|---|---|:---:|
| **T11** | Resolution & Camera | Nâng cấp Native HD 1280×720, Camera Zoom 2.2×, integer scaling, deadzone 32×24 | Cấu hình đúng trong `GameConfig.ts` & `CameraSystem.ts`. Nhưng Zoom 2.2× áp lên `GameScene` làm vỡ toàn bộ giao diện Modal | ⚠️ **PARTIAL** |
| **T12** | Typography Tiếng Việt | `HDTextHelper.ts` chống răng cưa, `FilterMode.LINEAR`, `setResolution(2)`, áp dụng toàn dự án | `HDTextHelper` hoạt động tốt. Tuy nhiên `PreloadScene.ts` vẫn dùng tọa độ cũ 640×360 khiến chữ nạp bị lệch góc trên trái | ⚠️ **PARTIAL** |
| **T13** | Dialogue System | Khung thoại HD 1060×185 px tại (640, 590), chữ 20px, chân dung 140×140 px, PASS 100% | **LỖI TỬ HUYỆT:** Nằm trong `GameScene`, bị Zoom 2.2× đẩy văng xuống Y = 866 px (ngoài màn hình 720p). Người chơi không thấy thoại | ❌ **FAILED** |
| **T14** | HUD & Quick Slots | 4 thanh chỉ số 220px, Khung nhiệm vụ 360×84 px, phím tắt đáy (640, 685) trong `UIScene` | Giao diện hiển thị đúng trên `UIScene` (zoom 1.0). Nhưng `HUDScene.ts` là code chết; thanh chỉ số không sync với `SatyrPlayer` | ⚠️ **PARTIAL** |
| **T15** | Crafting & Journal | Bàn Chế Tạo & Sổ Tay căn giữa (640, 360), kích thước 840×520 px, tự ẩn thanh phím tắt | **LỖI TỬ HUYỆT:** Nằm trong `GameScene`, bị Zoom 2.2× phóng to thành 1848×1144 px, vỡ tung màn hình, mất toàn bộ nút bấm viền | ❌ **FAILED** |
| **T16** | Main Menu & Pause Menu | Menu chính rừng đêm + Dark Rogue đèn lồng; Pause Menu (ESC) phong cách phiêu lưu HD | `MainMenuScene` (zoom 1.0) hiển thị đẹp, đúng chuẩn. Nhưng `PauseModal` (nằm trong `GameScene`) bị zoom 2.2× cắt cụt nút bấm | ⚠️ **PARTIAL** |
| **T17** | Lighting, Fog & Debug | Mặt nạ đèn lồng động bám sát Dark Rogue, 55 hạt đom đóm, F4 Debug Overlay hiển thị 64×64 | `updateFogOfWar` tạo/hủy Graphics ở 60 FPS gây giật khung hình. **F4 Debug bị Zoom 2.2× đẩy văng sang X = -715 px (ngoài màn hình)** | ⚠️ **PARTIAL** |
| **T18** | Ending Cinematic | Act 6 Time Rift HD, lộ ô tô/quốc lộ, 7 dòng chữ kết thúc trang trọng, nút về Menu chính | **LỖI TỬ HUYỆT:** Nằm trong `GameScene`, dòng thoại bị đẩy xuống Y=910 px, nút về Menu bị đẩy xuống Y=987 px -> **Soft-lock ở kết thúc** | ❌ **FAILED** |
| **T19** | Release QA | Script `verify_v3_release.mjs` đạt 10/10 PASS, `tsc --noEmit` 0 errors, đóng gói `dist/` | Kiểm thử hình thức (chỉ grep chuỗi ký tự text, không test canvas). Che giấu toàn bộ 4 lỗi tử huyệt về giao diện | ⚠️ **PARTIAL** |
| **T20** | Git, README & Push | Tạo `.gitignore`, `README.md`, an toàn file < 95 MB, push GitHub thành công | Hoàn thành chính xác. Repository GitHub đồng bộ với commit `5f09c73`, file README và `.gitignore` chuẩn mực | ✅ **VERIFIED** |

---

## 3. CHI TIẾT ĐỐI CHIẾU KỸ THUẬT TỪNG PASS (T11 – T20)

### 📌 PASS T11: RESOLUTION & CAMERA
- **Báo cáo cũ tuyên bố:** Cấu hình Canvas Native HD 1280×720, Camera thế giới Zoom 2.2× (`CameraSystem.ts`), làm tròn pixel mượt mà, integer scaling.
- **File nguồn đối chiếu:** `src/config/GameConfig.ts`, `src/config/Constants.ts`, `src/systems/camera/CameraSystem.ts`, `src/scenes/GameScene.ts`.
- **Tính năng có tồn tại không:** Có tồn tại. `GameConfig.ts` thiết lập width: 1280, height: 720. `CameraSystem.ts` thiết lập `setSize(1280, 720)`, `setZoom(2.2)`, `setRoundPixels(true)`.
- **Bằng chứng chạy thực tế:** `npm run build` thành công, camera bám theo nhân vật mượt mà với lerp (0.1, 0.1) và deadzone 32×24.
- **Mâu thuẫn & Lỗi phát hiện:**
  * Việc áp dụng Zoom 2.2× lên Camera chính của `GameScene` là nguyên nhân gốc rễ (Root Cause) phá hủy toàn bộ hệ thống giao diện người dùng (UI Modals) được gắn trong `GameScene`.
  * `ScaleManager.ts` bị bỏ quên, không được tích hợp vào hệ thống mới.
- **Đánh giá:** ⚠️ **PARTIAL**

---

### 📌 PASS T12: TYPOGRAPHY TIẾNG VIỆT
- **Báo cáo cũ tuyên bố:** Xây dựng `HDTextHelper.ts` áp dụng bộ font `Segoe UI/Roboto`, `setResolution(2)`, `FilterMode.LINEAR`, tự động làm mới bộ lọc khi cập nhật văn bản, xóa bỏ hoàn toàn font mờ răng cưa.
- **File nguồn đối chiếu:** `src/utils/HDTextHelper.ts`, `src/scenes/MainMenuScene.ts`, `src/scenes/UIScene.ts`, `src/systems/DialogueSystem.ts`, `src/ui/CraftingModal.ts`, `src/ui/JournalModal.ts`.
- **Tính năng có tồn tại không:** Có tồn tại và hoạt động xuất sắc về mặt xử lý chuỗi ký tự và font rendering.
- **Bằng chứng chạy thực tế:** Hầu hết các đoạn văn bản trong `MainMenuScene` và `UIScene` đều sử dụng `HDTextHelper.createText(...)`.
- **Mâu thuẫn & Lỗi phát hiện:**
  * Vẫn còn một số vị trí sử dụng trực tiếp `scene.add.text` không qua helper:
    * `src/scenes/PreloadScene.ts` (dòng 58, 64): Sử dụng tọa độ prototype cũ `VIRTUAL_WIDTH / 2 = 320, VIRTUAL_HEIGHT / 2 = 180`, khiến dòng chữ *"Đang xuyên qua Màn Sương..."* bị lệch về góc trên bên trái trên màn hình HD 1280×720.
    * `src/entities/NPCEntity.ts` (dòng 42): Nametag NPC dùng font serif 9px thô sơ, khi zoom 2.2× bị vỡ nét.
- **Đánh giá:** ⚠️ **PARTIAL**

---

### 📌 PASS T13: DIALOGUE SYSTEM
- **Báo cáo cũ tuyên bố:** Đại tu hộp thoại HD đặt tại tọa độ `(640, 590)`, kích thước `1060×185` px, viền vàng mộc, chân dung `140×140` px, tên người nói 24px, nội dung câu thoại 20px, phím E/Space chuyển thoại, đạt PASS 100%.
- **File nguồn đối chiếu:** `src/systems/DialogueSystem.ts`, `src/scenes/GameScene.ts` (dòng 155).
- **Tính năng có tồn tại không:** File mã nguồn có đầy đủ các thông số đồ họa này.
- **Bằng chứng chạy thực tế:** **KHÔNG THỂ THẤY TRÊN MÀN HÌNH GAME (LỖI TỬ HUYỆT).**
- **Mâu thuẫn & Lỗi phát hiện:**
  * `DialogueSystem` được khởi tạo bằng `new DialogueSystem(this)` trong `GameScene`.
  * Dưới tác động của Camera Zoom 2.2× với tâm màn hình (640, 360), tọa độ Y = 590 bị đẩy xuống:
    $$\text{Screen Y} = 360 + (590 - 360) \times 2.2 = 360 + 506 = \mathbf{866\text{ px}}$$
  * Màn hình canvas chỉ có chiều cao 720 px, do đó hộp thoại bị văng 146 px ra ngoài đáy màn hình! Người chơi hoàn toàn không thể đọc lời thoại của bất kỳ NPC nào.
- **Đánh giá:** ❌ **FAILED**

---

### 📌 PASS T14: HUD & QUICK SLOTS
- **Báo cáo cũ tuyên bố:** 4 thanh chỉ số sinh tồn rộng 220 px ở góc trên trái, Khung nhiệm vụ `360×84` px ở góc trên phải, thanh phím tắt đáy thoáng đãng tại `(640, 685)` trong `UIScene`.
- **File nguồn đối chiếu:** `src/scenes/UIScene.ts`, `src/ui/HUDScene.ts`, `src/state/PlayerState.ts`, `src/entities/SatyrPlayer.ts`.
- **Tính năng có tồn tại không:** Có tồn tại trong `UIScene.ts`.
- **Bằng chứng chạy thực tế:** `UIScene` chạy ở Camera Zoom = 1.0 nên các thanh chỉ số và khung nhiệm vụ hiển thị chuẩn xác tại các góc màn hình 1280×720.
- **Mâu thuẫn & Lỗi phát hiện:**
  * **Trùng lặp & Dead code:** `src/ui/HUDScene.ts` bị bỏ rơi, không bao giờ được khởi chạy.
  * **Mất đồng bộ chỉ số sinh tồn:** `SatyrPlayer.ts` tự trừ stamina trong biến cục bộ `this.stats` mà không cập nhật sang `playerState.stats`, khiến thanh Thể lực trên HUD không giảm khi nhân vật chạy nhanh.
- **Đánh giá:** ⚠️ **PARTIAL**

---

### 📌 PASS T15: CRAFTING & JOURNAL MODALS
- **Báo cáo cũ tuyên bố:** Căn giữa màn hình tại `(640, 360)`, kích thước bảng `840×520` px, áp dụng `HDTextHelper` cho toàn bộ công thức và cổ thư, tự động ẩn giao diện xung quanh khi mở.
- **File nguồn đối chiếu:** `src/ui/CraftingModal.ts`, `src/ui/JournalModal.ts`, `src/scenes/GameScene.ts` (dòng 170, 182).
- **Tính năng có tồn tại không:** Mã nguồn có đầy đủ các hàm xử lý công thức chế tạo và xem nhật ký nhiệm vụ/cổ thư.
- **Bằng chứng chạy thực tế:** **BỊ PHÓNG ĐẠI KHỔNG LỒ VÀ VỠ BỐ CỤC (LỖI TỬ HUYỆT).**
- **Mâu thuẫn & Lỗi phát hiện:**
  * Cả hai modal đều được tạo với đối số `this` là `GameScene`.
  * Dưới tác động của Camera Zoom 2.2×, kích thước hiển thị thực tế của bảng modal trở thành:
    $$\text{Width} = 840 \times 2.2 = \mathbf{1848\text{ px}}\quad (\text{vượt quá 1280 px})$$
    $$\text{Height} = 520 \times 2.2 = \mathbf{1144\text{ px}}\quad (\text{vượt quá 720 px})$$
  * Bảng chế tạo và sổ tay bị phóng to 220%, tràn ra ngoài cả 4 cạnh màn hình, mất toàn bộ tiêu đề, nút đóng `[✕]` và các nút chuyển trang/chế tạo ở viền ngoài.
- **Đánh giá:** ❌ **FAILED**

---

### 📌 PASS T16: MAIN MENU & PAUSE MENU
- **Báo cáo cũ tuyên bố:** Menu chính chuẩn HD 1280×720, cảnh rừng đêm mờ ảo, Dark Rogue đứng dưới ánh đèn lồng vàng ấm áp. Menu tạm dừng (ESC) phong cách phiêu lưu HD.
- **File nguồn đối chiếu:** `src/scenes/MainMenuScene.ts`, `src/ui/PauseModal.ts`, `src/scenes/GameScene.ts` (dòng 195).
- **Tính năng có tồn tại không:** Có tồn tại.
- **Bằng chứng chạy thực tế:**
  * `MainMenuScene` chạy độc lập ở zoom 1.0, hiển thị xuất sắc hình ảnh Dark Rogue đứng dưới ánh đèn lồng, cây cổ thụ, sương trôi và các nút bấm hoạt động mượt mà.
- **Mâu thuẫn & Lỗi phát hiện:**
  * `PauseModal.ts` được khởi tạo trong `GameScene` (zoom 2.2×). Kích thước bảng `540×440` px bị phóng đại thành `1188×968` px (vượt quá chiều cao 720 px), khiến phần dưới chứa nút Lưu Game và Quay Về Menu bị cắt cụt khỏi màn hình.
- **Đánh giá:** ⚠️ **PARTIAL**

---

### 📌 PASS T17: LIGHTING, FOG & DEBUG OVERLAY
- **Báo cáo cũ tuyên bố:** Mặt nạ đèn lồng động bám sát Dark Rogue trên khung hình HD 1280×720 (zoom 2.2×), 55 hạt đom đóm lập lòe 3 màu sắc quanh các điểm tài nguyên, phím F4 hiển thị Debug Overlay khung 64×64 và collider 14×8.
- **File nguồn đối chiếu:** `src/scenes/GameScene.ts`, `src/systems/VeilSystem.ts`, `src/utils/DebugOverlay.ts`.
- **Tính năng có tồn tại không:** Có mã nguồn triển khai đầy đủ.
- **Bằng chứng chạy thực tế:**
  * Đom đóm lơ lửng hình sin hoạt động tốt (`updateFireflies`).
  * Ánh sáng đèn lồng vàng ấm áp bám theo nhân vật.
- **Mâu thuẫn & Lỗi phát hiện (LỖI HIỂN THỊ & HIỆU NĂNG):**
  * **Lỗi rác bộ nhớ tại 60 FPS:** Hàm `updateFogOfWar()` liên tục gọi `const lightG = this.make.graphics()` rồi gọi `lightG.destroy()` 60 lần mỗi giây, tạo áp lực Garbage Collection khổng lồ gây ra hiện tượng giật cục (micro-stuttering).
  * **Lỗi F4 Debug văng khỏi màn hình:** Bảng chữ debug được đặt tại tọa độ `(24, 140)` với `setScrollFactor(0)` trong `GameScene` (zoom 2.2×). Tọa độ hiển thị thực tế:
    $$\text{Screen X} = 640 + (24 - 640) \times 2.2 = 640 - 1355.2 = \mathbf{-715.2\text{ px}}$$
    Bảng thông số Debug bị văng hoàn toàn ra ngoài mép trái màn hình 715 px! Người chơi nhấn F4 không thể nhìn thấy bất kỳ thông tin nào.
- **Đánh giá:** ⚠️ **PARTIAL**

---

### 📌 PASS T18: ENDING CINEMATIC
- **Báo cáo cũ tuyên bố:** Hoạt cảnh Hồi kết Act 6 The First Toll chuẩn HD 1280×720, Khe Thời Đại (Time Rift) đa tầng tại `(640, 300)` hé lộ xe ô tô và quốc lộ, 7 dòng chữ kết thúc trang trọng, nút quay về Menu chính.
- **File nguồn đối chiếu:** `src/systems/EndingSystem.ts`, `src/scenes/GameScene.ts` (dòng 160).
- **Tính năng có tồn tại không:** Mã nguồn có đầy đủ các giai đoạn cutscene, hiệu ứng chuông rung và văn bản credits.
- **Bằng chứng chạy thực tế:** **SOFT-LOCK VÀ VĂNG NGOÀI MÀN HÌNH (LỖI TỬ HUYỆT).**
- **Mâu thuẫn & Lỗi phát hiện:**
  * `EndingSystem` được gắn vào `GameScene` (zoom 2.2×).
  * Lời thoại Time Rift đặt tại `Y = 610` bị đẩy xuống:
    $$\text{Screen Y} = 360 + (610 - 360) \times 2.2 = 360 + 550 = \mathbf{910\text{ px}}\quad (\text{ngoài màn hình 190 px})$$
  * Nút "QUAY VỀ MENU CHÍNH" đặt tại `Y = 645` bị đẩy xuống:
    $$\text{Screen Y} = 360 + (645 - 360) \times 2.2 = 360 + 627 = \mathbf{987\text{ px}}\quad (\text{ngoài màn hình 267 px})$$
  * **Hậu quả:** Người chơi xem xong hoạt cảnh rung chuông nhưng không thể thấy câu thoại hé lộ cốt truyện, và không thể click vào nút quay về Menu chính vì nút nằm ngoài màn hình -> Game bị kẹt vĩnh viễn ở màn hình đen kết thúc.
- **Đánh giá:** ❌ **FAILED**

---

### 📌 PASS T19: RELEASE QA VERIFICATION
- **Báo cáo cũ tuyên bố:** Chạy `node scripts/verify_v3_release.mjs` xác nhận toàn bộ 10/10 tiêu chí phát hành đạt PASS, `tsc --noEmit` 0 errors, `npm run build` đóng gói `dist/` thành công.
- **File nguồn đối chiếu:** `scripts/verify_v3_release.mjs`, `package.json`, thư mục `dist/`.
- **Tính năng có tồn tại không:** Script kiểm thử tự động có tồn tại.
- **Bằng chứng chạy thực tế:** Script chạy ra kết quả 10/10 PASS; `tsc` và `build` hoàn thành trơn tru.
- **Mâu thuẫn & Lỗi phát hiện:**
  * Toàn bộ 10 bài test trong `verify_v3_release.mjs` chỉ kiểm tra sự tồn tại của file và kiểm tra chuỗi văn bản tĩnh (`includes(...)`).
  * Đây là kiểm thử mù (False Verification): Bỏ qua hoàn toàn việc kiểm tra hiển thị thực tế trên Canvas, che đậy toàn bộ các lỗi tử huyệt về lệch tọa độ camera zoom, lỗi tile cỏ bàn cờ đen, và lỗi tràn màn hình của các modal.
- **Đánh giá:** ⚠️ **PARTIAL**

---

### 📌 PASS T20: GIT, README & GITHUB PUSH
- **Báo cáo cũ tuyên bố:** Tạo `.gitignore` chuẩn, kiểm tra an toàn dung lượng < 95 MB, tạo `README.md` chuyên nghiệp hiển thị trên GitHub, push force thành công lên `https://github.com/KyoshiroKyo/HOLLOW-WOODS`.
- **File nguồn đối chiếu:** `.gitignore`, `README.md`, cấu hình git trong `.git/`.
- **Tính năng có tồn tại không:** Tồn tại 100%.
- **Bằng chứng chạy thực tế:**
  * File `.gitignore` loại trừ đúng các thư mục nặng (`node_modules/`, `dist/`, `scripts/temp/`, `*.rar`).
  * File `README.md` trình bày đầy đủ thông tin dự án, hướng dẫn cài đặt và lệnh chạy.
  * Git remote trỏ chính xác về `https://github.com/KyoshiroKyo/HOLLOW-WOODS.git`. Commit `5f09c73` hiện diện trên remote `origin/main`.
- **Mâu thuẫn & Lỗi phát hiện:** Không có mâu thuẫn kỹ thuật.
- **Đánh giá:** ✅ **VERIFIED**

---

## 4. TỔNG KẾT TOÀN DIỆN 20 PASS (CYCLE 1 & CYCLE 2)

### 📊 Thống kê trạng thái kiểm toán 20 PASS:
- **✅ VERIFIED (Đạt chuẩn kỹ thuật & khớp thực tế 100%):** **4 / 20 PASS** (T04, T05, T06, T20)
- **⚠️ PARTIAL (Có tính năng nhưng sai lệch tài liệu, vướng lỗi hoặc có code chết):** **12 / 20 PASS** (T01, T02, T03, T08, T09, T10, T11, T12, T14, T16, T17, T19)
- **❌ FAILED (Lỗi tử huyệt, phá hủy trải nghiệm hoặc sai hoàn toàn):** **4 / 20 PASS** (T07, T13, T15, T18)

### 🚨 BẢNG DANH MỤC 4 TỬ HUYỆT KỸ THUẬT CỐT LÕI CẦN SỬA ĐỔI:
1. **Tử huyệt Tile cỏ (T07):** Bóc tách lại `tile_forest_grass.png` từ `TX Tileset Grass.png` (256×256 px) để xóa sạch mạng lưới bàn cờ đen thủng lỗ chỗ trên toàn thế giới.
2. **Tử huyệt Camera Zoom 2.2× phá hủy UI Modals (T13, T15, T16, T17, T18):** Chuyển toàn bộ việc quản lý và hiển thị của `DialogueSystem`, `CraftingModal`, `JournalModal`, `PauseModal`, `DebugOverlay` và `EndingSystem` sang **`UIScene`** (nơi có Camera Zoom = 1.0 cố định), tách rời hoàn toàn khỏi `GameScene`.
3. **Tử huyệt Áp lực rác bộ nhớ tại 60 FPS (T10, T17):** Tái sử dụng (object pooling/caching) một đối tượng `Graphics` duy nhất cho mặt nạ ánh sáng trong `updateFogOfWar` thay vì liên tục `make.graphics()` và `destroy()`.
4. **Tử huyệt Mất đồng bộ chỉ số sinh tồn (T14):** Hợp nhất logic quản lý sinh tồn giữa `SatyrPlayer.ts` và `SurvivalSystem.ts`, đảm bảo mọi thay đổi về Thể lực, Dầu đèn và Bình tâm đều cập nhật trực tiếp vào `PlayerState.getInstance().stats`.

---
*Báo cáo kiểm toán độc lập được thực hiện bởi Senior Game QA Engineer – Dự án HOLLOW WOODS V3.0.*
