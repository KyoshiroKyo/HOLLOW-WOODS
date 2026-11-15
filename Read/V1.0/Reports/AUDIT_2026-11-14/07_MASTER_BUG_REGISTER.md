# 🐛 SỔ ĐĂNG KÝ LỖI TOÀN HỆ THỐNG (MASTER BUG REGISTER)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Mã báo cáo:** `07_MASTER_BUG_REGISTER.md`
> **Phân loại mức độ nghiêm trọng:**
> - 🔴 **BLOCKER / FATAL:** Gây kẹt game, soft-lock, hoặc mất hoàn toàn tính năng cốt lõi.
> - 🟠 **CRITICAL:** Vỡ giao diện nghiêm trọng, tràn màn hình, hỏng hiển thị diện rộng.
> - 🟡 **MAJOR:** Ảnh hưởng xấu đến cảm giác điều khiển (gameplay feel), áp lực hiệu năng rác bộ nhớ hoặc mâu thuẫn asset.
> - 🟢 **MODERATE / MINOR:** Code chết, rò rỉ bộ nhớ dài hạn hoặc bất cập thẩm mỹ nhỏ.

---

## 1. BẢNG TỔNG HỢP TOP 10 LỖI NGHIÊM TRỌNG NHẤT

| Bug ID | Mức độ | Phân hệ ảnh hưởng | Tóm tắt lỗi | Nguyên nhân cốt lõi |
|---|:---:|---|---|---|
| **BUG-01** | 🔴 **BLOCKER** | `DialogueSystem` | Hộp thoại NPC bị đẩy văng xuống Y = 866 px (ngoài màn hình 720p). Người chơi không đọc được lời thoại. | Khởi tạo trong `GameScene`, bị Camera Zoom 2.2× tịnh tiến $360 + (590-360)\times 2.2 = 866\text{ px}$. |
| **BUG-02** | 🔴 **BLOCKER** | `EndingSystem` | Nút "QUAY VỀ MENU CHÍNH" bị đẩy xuống Y = 987 px (ngoài màn hình). Gây **Soft-lock vĩnh viễn** ở cuối Act 6. | Gắn trong `GameScene`, bị Camera Zoom 2.2× tịnh tiến $360 + (645-360)\times 2.2 = 987\text{ px}$. |
| **BUG-03** | 🟠 **CRITICAL** | `CraftingModal` & `JournalModal` | Bàn Chế Tạo & Sổ Tay bị phóng đại thành `1848×1144` px, tràn vỡ ngoài 4 cạnh màn hình, mất toàn bộ nút bấm. | Gắn trong `GameScene`, kích thước $840\times 520\text{ px}$ bị nhân tỉ lệ $2.2\times$ thành $1848\times 1144\text{ px}$. |
| **BUG-04** | 🟠 **CRITICAL** | `WorldBuilder` / `Terrain` | Nền cỏ `tile_forest_grass.png` chứa 202 px trong suốt và 202 px đen, làm mặt đất thế giới thủng lỗ chỗ như bàn cờ rách. | Script cắt nhầm vào ô bụi cây bóng đổ của `forest_Tileset.png` thay vì dùng `TX Tileset Grass.png`. |
| **BUG-05** | 🟡 **MAJOR** | `SatyrPlayer` / Movement | Nhân vật bị khựng giật liên tục khi di chuyển chéo (Diagonal Movement Stutter). | Thuật toán `updateFacingDirection` lật hướng liên tục khi $\|X\|=\|Y\|$, khởi động lại animation liên tục. |
| **BUG-06** | 🟡 **MAJOR** | `GameScene` / Lighting | Vòng lặp `updateFogOfWar` cấp phát và hủy `Graphics` 60 lần/giây, gây áp lực rác GC (Micro-stuttering). | `this.make.graphics()` và `lightG.destroy()` chạy trong vòng lặp game loop 60 FPS. |
| **BUG-07** | 🟡 **MAJOR** | `SatyrPlayer` / Asset | Mâu thuẫn danh tính: Lore gọi là Satyr (sừng dê) nhưng sprite là Dark Rogue (áo choàng). Walk và Run dùng chung frame [4..9]. | Slices từ Midjourney AI không có animation running riêng, chứa lẫn tư thế vung vũ khí. |
| **BUG-08** | 🟡 **MAJOR** | `TheListener` / Asset | Quái vật The Listener là ảnh tĩnh đơn lẻ 64×64 px trượt ngang trên mặt đất, hoàn toàn không có animation. | Chỉ trích xuất duy nhất 1 frame tĩnh từ `idle.png frame 0`, không ghép spritesheet bước đi. |
| **BUG-09** | 🟢 **MODERATE** | Architecture / Stats | Trùng lặp quản lý sinh tồn: `SatyrPlayer` trừ stamina cục bộ không sync sang `PlayerState`; `HUDScene.ts` là code chết. | Thiếu kiến trúc đồng bộ trạng thái duy nhất (Single Source of Truth); `UIScene` vẽ lại 4 thanh chỉ số 60 FPS. |
| **BUG-10** | 🟢 **MODERATE** | `PauseModal` & `DebugOverlay` | PauseMenu bị cắt cụt nút lưu game; F4 Debug Overlay bị đẩy văng sang tọa độ X = -715 px (ngoài mép trái màn hình). | Gắn vào `GameScene` (zoom 2.2×) làm bảng thông số debug bị tịnh tiến $640 + (24-640)\times 2.2 = -715.2\text{ px}$. |

---

## 2. CHI TIẾT PHÂN TÍCH TỪNG LỖI TRONG TOP 10

### 🔴 BUG-01: HỘP THOẠI NPC VĂNG NGOÀI MÀN HÌNH (OFF-SCREEN DIALOGUE)
- **Mức độ:** BLOCKER / FATAL
- **Tệp nguồn:** `src/systems/DialogueSystem.ts`, `src/scenes/GameScene.ts` (dòng 155).
- **Các bước tái hiện:**
  1. Khởi động game, đi về phía đông đến cổng làng Bellhollow gặp NPC Garth tại tọa độ (530, 220).
  2. Xuất hiện dòng chữ `[E] Trò chuyện với Garth`. Nhấn phím `E`.
  3. Thanh phím tắt dưới đáy biến mất, nhân vật dừng lại.
- **Kết quả thực tế:** Không có bất kỳ hộp thoại, văn bản hay chân dung nào xuất hiện trên màn hình. Người chơi lầm tưởng game bị treo đơ.
- **Kết quả kỳ vọng:** Hộp thoại 1060×185 px hiện rõ ở đáy màn hình chuẩn HD 1280×720, hiển thị tên Garth, chân dung và 3 câu thoại cảnh báo.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH TOÁN HỌC 100%):**
  * `DialogueSystem` được gán vào `GameScene` (nơi có Camera Zoom = 2.2, tâm phóng 640, 360).
  * Container đặt tại (640, 590). Tọa độ màn hình thực tế:
    $$\text{Screen Y} = 360 + (590 - 360) \times 2.2 = 360 + 506 = \mathbf{866\text{ px}}$$
  * Màn hình chỉ cao 720 px, nên hộp thoại bị văng 146 px ra ngoài đáy màn hình!

---

### 🔴 BUG-02: SOFT-LOCK Ở HOÀT CẢNH KẾT THÚC ACT 6 (ENDING CINEMATIC LOCK)
- **Mức độ:** BLOCKER / FATAL
- **Tệp nguồn:** `src/systems/EndingSystem.ts`, `src/scenes/GameScene.ts` (dòng 160).
- **Các bước tái hiện:**
  1. Hoàn thành thu thập Lưỡi Chuông Đồng (`item_bronze_clapper`), đến bệ Tháp Chuông làng Bellhollow.
  2. Nhấn `[E]` kích hoạt chuông rung.
  3. Màn hình rung lắc, Khe Thời Đại (Time Rift) mở ra và đóng lại, màn hình chuyển sang màu đen để hiện credits.
- **Kết quả thực tế:** 7 dòng chữ credits bị phóng đại và trôi lệch. Sau khi hết 15.6 giây, nút "QUAY VỀ MENU CHÍNH" không thấy đâu. Người chơi không thể tương tác chuột hay bàn phím để thoát, game bị kẹt cứng (Soft-lock).
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH TOÁN HỌC 100%):**
  * `EndingSystem` gắn vào `GameScene` (zoom 2.2×).
  * Nút quay về Menu đặt tại Y = 645. Tọa độ màn hình thực tế:
    $$\text{Screen Y} = 360 + (645 - 360) \times 2.2 = 360 + 627 = \mathbf{987\text{ px}}$$
  * Nút bấm rơi xuống dưới đáy màn hình tới 267 px, không một chuột nào có thể click tới được!

---

### 🟠 BUG-03: BÀN CHẾ TẠO VÀ SỔ TAY PHÓNG ĐẠI TRÀN MÀN HÌNH (MODAL OVERFLOW)
- **Mức độ:** CRITICAL
- **Tệp nguồn:** `src/ui/CraftingModal.ts`, `src/ui/JournalModal.ts`, `src/scenes/GameScene.ts` (dòng 170, 182).
- **Các bước tái hiện:**
  1. Vào game, nhấn phím `[I]` để mở Bàn Chế Tạo hoặc phím `[J]` để mở Sổ Tay Lữ Khách.
- **Kết quả thực tế:** Một chiếc bảng khổng lồ choán ngợp toàn bộ màn hình, tiêu đề ở trên đỉnh bị mất, các nút chế tạo và nút đóng `[✕]` bị văng ra ngoài mép màn hình.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH TOÁN HỌC 100%):**
  * Bảng thiết kế kích thước $840 \times 520\text{ px}$. Dưới Camera Zoom 2.2× của `GameScene`, kích thước bị nhân lên:
    $$\text{Width} = 840 \times 2.2 = \mathbf{1848\text{ px}}\quad (\text{Canvas rộng 1280 px})$$
    $$\text{Height} = 520 \times 2.2 = \mathbf{1144\text{ px}}\quad (\text{Canvas cao 720 px})$$

---

### 🟠 BUG-04: MẶT ĐẤT BÀN CỜ ĐEN THỦNG LỖ CHỖ (CHECKERBOARD TERRAIN SEAMS)
- **Mức độ:** CRITICAL
- **Tệp nguồn:** `public/assets/environment/tiles/tile_forest_grass.png`, `scripts/step7_extract_terrain_tiles.mjs`.
- **Hiện tượng thực tế:** Mặt đất cỏ xanh ở tất cả các phân khu bị biến thành một mạng lưới kẻ ô bàn cờ đen dày đặc, có hàng vạn đốm đen và lỗ thủng để lộ màu nền `#0b0c10`.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH NHỊ PHÂN IHDR):**
  * Script cắt tile lấy vùng (0,0, 32, 32) từ `forest_Tileset.png`. Đây là ngọn của một bụi cây có đổ bóng.
  * Phân tích nhị phân cho thấy có tới **202 pixel Alpha = 0** và **202 pixel màu gần đen (RGB < 30)** trên tổng số 1024 pixel của tile 32×32. Khi ghép `TileSprite`, các lỗ thủng này lặp lại mỗi 32 pixel.
  * Trong khi đó, file chuẩn `TX Tileset Grass.png` (256×256 px) có sẵn trong dự án thì lại bị bỏ quên.

---

### 🟡 BUG-05: NHÂN VẬT DI CHUYỂN KHỰNG GIẬT KHI ĐI CHÉO (DIAGONAL STUTTER)
- **Mức độ:** MAJOR
- **Tệp nguồn:** `src/entities/SatyrPlayer.ts` (hàm `updateFacingDirection` & `playWalkOrRunAnim`).
- **Hiện tượng thực tế:** Giữ tổ hợp phím W+D hoặc S+A để đi chéo, nhân vật bị rung lắc hướng nhìn, chân bước cà nhắc và khựng giật liên tục.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH MÃ NGUỒN):**
  * Điều kiện `Math.abs(moveX) > Math.abs(moveY)` trả về false khi đi chéo ($1 == 1$).
  * Trục nhìn bị giật qua lại giữa trục ngang và dọc, làm hàm `playWalkOrRunAnim()` liên tục ngắt và gọi lại `play(animKey, true)` từ frame 0.

---

### 🟡 BUG-06: ÁP LỰC RÁC BỘ NHỚ TẠI 60 FPS (LIGHTING GC SPIKES)
- **Mức độ:** MAJOR
- **Tệp nguồn:** `src/scenes/GameScene.ts` (hàm `updateFogOfWar`, dòng 990).
- **Hiện tượng thực tế:** Cứ mỗi 1..3 giây, game lại bị khựng nhẹ (micro-stuttering) một nhịp khi nhân vật đang di chuyển.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH MÃ NGUỒN):**
  * Mỗi frame đều gọi `const lightG = this.make.graphics()` rồi xóa trên RenderTexture và gọi `lightG.destroy()`.
  * Cấp phát và hủy 60 đối tượng Graphics mỗi giây khiến V8 Garbage Collector liên tục kích hoạt chu kỳ dừng luồng để dọn dẹp heap memory.

---

### 🟡 BUG-07: MÂU THUẪN DANH TÍNH ASSET & CHUNG DÃI FRAME WALK/RUN
- **Mức độ:** MAJOR
- **Tệp nguồn:** `public/assets/characters/satyr/satyr_sheet.png`, `src/data/satyr_animations.json`.
- **Hiện tượng thực tế:** Cốt truyện nói nhân vật là Satyr mang sừng dê, nhưng hình ảnh là Dark Rogue áo choàng. Khi bấm Shift chạy nhanh, nhân vật chỉ đi bộ nhanh hơn chứ không có dáng chạy riêng.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH NHỊ PHÂN & JSON):**
  * Ảnh cắt từ gói AI Midjourney Dark Rogue.
  * Trong `satyr_animations.json`, cả `satyr_walk` và `satyr_run` đều trỏ vào `frames: [4, 5, 6, 7, 8, 9]`.

---

### 🟡 BUG-08: QUÁI VẬT THE LISTENER LÀ ẢNH TĨNH TRƯỢT NGANG
- **Mức độ:** MAJOR
- **Tệp nguồn:** `public/assets/monsters/the_listener.png`, `src/entities/TheListener.ts`.
- **Hiện tượng thực tế:** The Listener đi tuần và rượt đuổi người chơi như một bức ảnh phẳng trượt trên mặt đất, không có bất kỳ cử động chân tay hay vung vũ khí nào.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH ASSET):**
  * File `the_listener.png` chỉ là 1 frame ảnh tĩnh duy nhất (64×64 px) trích từ `idle.png frame 0`.

---

### 🟢 BUG-09: TRÙNG LẶP HỆ THỐNG SINH TỒN & CODE CHẾT
- **Mức độ:** MODERATE
- **Tệp nguồn:** `SatyrPlayer.ts`, `SurvivalSystem.ts`, `src/ui/HUDScene.ts`, `UIScene.ts`.
- **Hiện tượng thực tế:** Thanh thể lực trên HUD không giảm khi chạy nhanh vì `SatyrPlayer` trừ trong biến nội bộ. `UIScene` xóa và vẽ lại 4 thanh chỉ số 60 FPS trên CPU. File `HUDScene.ts` không bao giờ chạy.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH MÃ NGUỒN):**
  * Thiếu mô hình Single Source of Truth giữa Entity và State Singleton.

---

### 🟢 BUG-10: PAUSE MENU CẮT CỤT & F4 DEBUG OVERLAY VĂNG NGOÀI MÀN HÌNH
- **Mức độ:** MODERATE
- **Tệp nguồn:** `src/ui/PauseModal.ts`, `src/utils/DebugOverlay.ts`.
- **Hiện tượng thực tế:** Nhấn ESC thì các nút Lưu Game ở đáy bị cắt cụt; nhấn F4 không thấy bảng thông số debug đâu.
- **Nguyên nhân cốt lõi (ĐÃ XÁC MINH TOÁN HỌC):**
  * Cả hai đều nằm trong `GameScene` (zoom 2.2×). Bảng F4 Debug ở tọa độ X = 24 bị đẩy sang:
    $$\text{Screen X} = 640 + (24 - 640) \times 2.2 = \mathbf{-715.2\text{ px}}\quad (\text{văng ra ngoài mép trái!})$$

---

## 3. PHÂN ĐỊNH NGUYÊN NHÂN: ĐÃ XÁC MINH vs CÒN NGHI NGỜ

### ✅ Những nguyên nhân ĐÃ ĐƯỢC XÁC MINH 100% (Verified Causes):
1. **Phép biến đổi Camera Transform của Phaser:** $Pos_{\text{screen}} = Center + (Pos_{\text{native}} - Center) \times Zoom$. Công thức này chứng minh toán học chuẩn xác 100% nguyên nhân hộp thoại rơi xuống Y = 866 px, nút ending rơi xuống Y = 987 px, F4 rơi sang X = -715 px và các modal nổ to 220%.
2. **Lỗi Pixel Nhị phân trong `tile_forest_grass.png`:** Đã đo đạc nhị phân qua Node.js Buffer, chứng minh có 202 pixel trong suốt gây thủng mặt đất.
3. **Logic Jitter hướng nhìn:** Đã chứng minh qua cấu trúc rẽ nhánh `if (|moveX| > |moveY|)` trong `SatyrPlayer.ts`.
4. **Áp lực rác GC tại 60 FPS:** Đã chứng minh bằng lệnh gọi `this.make.graphics()` và `lightG.destroy()` nằm trong `updateFogOfWar`.
5. **Code chết:** Đã chứng minh `HUDScene.ts` và `ScaleManager.ts` không có bất kỳ lệnh import/launch nào được kích hoạt.

### ❓ Những nguyên nhân CÒN NGHI NGỜ (Suspected Causes / Cần theo dõi thêm):
1. **Hiệu năng GPU Fill-rate trên máy cấu hình yếu:** Mức độ tụt giảm FPS khi RenderTexture 1280×720 kết hợp 2 lớp TileSprite sương mù trên các dòng máy dùng chip đồ họa tích hợp cũ (Intel HD 4000/620).
2. **Rò rỉ bộ nhớ dài hạn của Event Emitter:** Mức độ tích tụ callback trên Singleton `PlayerState` khi người chơi trải qua phiên chơi kéo dài trên 60 phút và chết/hồi sinh nhiều lần.

---
*Báo cáo được lập độc lập bởi Senior Game QA Engineer.*
