# 🗺️ LỘ TRÌNH KHẮC PHỤC & TIÊU CHÍ NGHIỆM THU (REMEDIATION ROADMAP)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Cơ quan kiểm toán:** Independent Senior Game QA Engineer
> **Thư mục kiểm toán:** `Read/V3.0/Reports/AUDIT_2026-11-14/`
> **Mã báo cáo:** `08_REMEDIATION_ROADMAP.md`
> **Chiến lược thực thi:** Chia làm 4 giai đoạn tuần tự từ cấp bách (Blocker/Critical) đến tối ưu hóa hiệu năng và dọn dẹp mã nguồn.

---

## 1. TỔNG QUAN 4 GIAI ĐOẠN KHẮC PHỤC

```
[ GIAI ĐOẠN 1: CẤP BÁCH ] ──> Sửa Tử Huyệt Giao Diện UI & Chống Soft-Lock
       │
       ▼
[ GIAI ĐOẠN 2: MỸ THUẬT ] ──> Khắc Phục Lỗi Nền Cỏ Bàn Cờ Đen & Chuẩn Hóa Asset
       │
       ▼
[ GIAI ĐOẠN 3: HIỆU NĂNG ] ──> Triệt Tiêu Khựng Giật Di Chuyển & 60 FPS Mượt Mà
       │
       ▼
[ GIAI ĐOẠN 4: DỌN DẸP   ] ──> Xóa Code Chết, Chống Rò Rỉ & Kiểm Thử Tự Động Thật
```

---

## 2. CHI TIẾT TỪNG GIAI ĐOẠN & TIÊU CHÍ NGHIỆM THU

### 🔴 GIAI ĐOẠN 1: KHẮC PHỤC TỬ HUYỆT GIAO DIỆN & CHỐNG SOFT-LOCK (P1 - BLOCKERS)
> **Mục tiêu:** Đưa toàn bộ các cửa sổ giao diện trở về đúng tâm màn hình HD 1280×720, đảm bảo người chơi đọc được hội thoại và hoàn thành game không bị kẹt.

#### 🛠️ Các nhiệm vụ kỹ thuật chi tiết:
- **Task 1.1: Tách rời UI Modals khỏi `GameScene` sang `UIScene`:**
  * Di chuyển các biến và lệnh khởi tạo của `DialogueSystem`, `CraftingModal`, `JournalModal`, `PauseModal`, `DebugOverlay` và `EndingSystem` từ `src/scenes/GameScene.ts` sang **`src/scenes/UIScene.ts`** (nơi Camera có `zoom = 1.0` cố định).
  * Trong `GameScene.ts`, các tương tác mở giao diện sẽ gọi thông qua instance `this.uiScene.openDialogue(...)`, `this.uiScene.openCrafting()`, v.v.
- **Task 1.2: Định vị lại tọa độ hiển thị chuẩn HD:**
  * `DialogueSystem`: Căn giữa tại tọa độ $(640, 590)$, kích thước $1060 \times 185\text{ px}$.
  * `CraftingModal`: Căn giữa tại $(640, 360)$, kích thước $840 \times 520\text{ px}$.
  * `JournalModal`: Căn giữa tại $(640, 360)$, kích thước $840 \times 520\text{ px}$.
  * `PauseModal`: Căn giữa tại $(640, 360)$, kích thước $540 \times 440\text{ px}$.
  * `EndingSystem`: Đặt nút "QUAY VỀ MENU CHÍNH" tại $(640, 645)$.
  * `DebugOverlay`: Đặt bảng chữ F4 tại $(24, 140)$ trên `UIScene`.

#### 🎯 Tiêu chí nghiệm thu Giai đoạn 1 (Acceptance Criteria):
1. Nhấn `[E]` nói chuyện với Garth, Edda, Neris: Hộp thoại hiện rõ nét tại đáy màn hình, hiển thị đầy đủ tên, ảnh chân dung và từng dòng chữ chạy hiệu ứng máy đánh chữ.
2. Nhấn `[I]` hoặc `[TAB]`: Bàn chế tạo hiện ngay ngắn giữa màn hình, các nút công thức và nút `[✕]` đóng hiển thị trọn vẹn, click chế tạo thành công.
3. Nhấn `[J]`: Sổ tay lữ khách hiện chuẩn giữa màn hình, lật các trang cổ thư và chuyển tab nhiệm vụ bình thường.
4. Nhấn `[ESC]`: Menu tạm dừng hiện giữa màn hình, nút "LƯU ĐIỂM HÀNH TRÌNH" và "QUAY VỀ MENU CHÍNH" nhìn thấy rõ và click được.
5. Hoàn thành Hồi kết Act 6: 7 dòng credits chạy xong, nút "QUAY VỀ MENU CHÍNH" xuất hiện ở tọa độ $(640, 645)$ và click được để trở về `MainMenuScene`, **chấm dứt 100% lỗi soft-lock**.

---

### 🟠 GIAI ĐOẠN 2: KHẮC PHỤC NỀN CỎ BÀN CỜ ĐEN & CHUẨN HÓA ASSET (P2 - CRITICAL VISUALS)
> **Mục tiêu:** Khôi phục vẻ đẹp nguyên bản của thế giới Pixel Art, xóa sạch các lỗ thủng trong suốt trên mặt đất và đồng nhất danh tính nhân vật.

#### 🛠️ Các nhiệm vụ kỹ thuật chi tiết:
- **Task 2.1: Cắt lại Tile Nền Cỏ Chuẩn từ `TX Tileset Grass.png`:**
  * Viết lại `scripts/step7_extract_terrain_tiles.mjs`: Thay vì cắt từ `forest_Tileset.png`, trích xuất ô cỏ liền mạch 32×32 pixel từ file chuẩn có sẵn `public/assets/environment/tilesets/TX Tileset Grass.png`.
  * Xác minh file đầu ra `public/assets/environment/tiles/tile_forest_grass.png` có **0 pixel trong suốt (Alpha = 255 đạt 100%)** và màu sắc đồng nhất.
- **Task 2.2: Thay thế hình vẽ hình học còn sót lại trong `WorldBuilder.ts`:**
  * Thay thế hàm `createRock` (đang dùng `fillEllipse`) bằng sprite tảng đá pixel art thật từ `TX Props with Shadow.png`.
  * Thay thế hàm `createMireWater` (đang dùng `fillEllipse`) bằng sprite vũng nước đầm lầy thực thụ.
- **Task 2.3: Đồng nhất danh tính Satyr / Dark Rogue:**
  * Cập nhật văn bản trong `lore.json`, `dialogues.json` hoặc bổ sung cặp sừng dê pixel art vào spritesheet của Dark Rogue để khớp với truyền thuyết nhân vật chính.

#### 🎯 Tiêu chí nghiệm thu Giai đoạn 2 (Acceptance Criteria):
1. Toàn bộ mặt đất của 5 phân khu thế giới phủ thảm cỏ xanh mượt mà, **không còn bất kỳ một đốm đen hay lỗ thủng trong suốt nào**.
2. Xóa sạch 100% các lệnh `fillEllipse`, `strokeEllipse` trong `WorldBuilder.ts`.
3. Hình ảnh nhân vật đồng nhất với cốt truyện và ảnh chân dung.

---

### 🟡 GIAI ĐOẠN 3: TỐI ƯU HÓA HIỆU NĂNG & DI CHUYỂN MƯỢT MÀ (P3 - PERFORMANCE & FEEL)
> **Mục tiêu:** Triệt tiêu hoàn toàn hiện tượng di chuyển khựng giật, chấm dứt rác bộ nhớ tại 60 FPS và bổ sung animation cho quái vật.

#### 🛠️ Các nhiệm vụ kỹ thuật chi tiết:
- **Task 3.1: Sửa thuật toán hướng nhìn trong `SatyrPlayer.ts`:**
  * Khi di chuyển chéo ($|moveX| == |moveY|$), **giữ nguyên hướng nhìn hiện tại (`this.facing`)** thay vì ép về trục Y:
    ```typescript
    if (Math.abs(moveX) > Math.abs(moveY)) {
      this.facing = moveX < 0 ? 'left' : 'right';
    } else if (Math.abs(moveY) > Math.abs(moveX)) {
      this.facing = moveY < 0 ? 'up' : 'down';
    }
    // Nếu bằng nhau (đi chéo): GIỮ NGUYÊN this.facing, KHÔNG ĐỔI!
    ```
  * Chỉ gọi `this.play(animKey, true)` khi `this.facing` thực sự thay đổi hoặc trạng thái chạy/đi thay đổi, không reset frame.
- **Task 3.2: Tái sử dụng đối tượng Graphics (Object Pooling) trong `updateFogOfWar`:**
  * Khởi tạo cố định một đối tượng `this.lanternMaskGfx` trong `GameScene.create()`.
  * Trong `updateFogOfWar()`, chỉ gọi `this.lanternMaskGfx.clear()` và vẽ lại, thay vì gọi `this.make.graphics()` và `lightG.destroy()` 60 lần/giây.
- **Task 3.3: Thêm cờ Dirty Flag cho `redrawStats` trong `UIScene`:**
  * Chỉ vẽ lại 4 thanh chỉ số khi giá trị Máu, Thể lực, Dầu đèn hoặc Bình tâm thực sự thay đổi so với frame trước, chấm dứt việc vẽ lại vô ích 60 lần/giây.
- **Task 3.4: Bổ sung Spritesheet bước đi cho The Listener:**
  * Trích xuất đủ 4..6 frame di chuyển từ `Pixel_Art/Undead executioner.zip` để tạo animation bước đi cho quái vật thay vì để ảnh tĩnh trượt ngang.

#### 🎯 Tiêu chí nghiệm thu Giai đoạn 3 (Acceptance Criteria):
1. Người chơi di chuyển chéo (W+D, S+A) mượt mà êm ái, **không còn hiện tượng rung lắc hướng nhìn hay khựng chân**.
2. Bộ nhớ JavaScript Heap ổn định phẳng lì khi bật đèn lồng và sương mù, **triệt tiêu hoàn toàn các đợt micro-stuttering do GC spikes**.
3. Quái vật The Listener có cử động bước chân chân thực khi tuần tra và rượt đuổi.

---

### 🟢 GIAI ĐOẠN 4: DỌN DẸP MÃ NGUỒN, CHỐNG RÒ RỈ & BỘ KIỂM THỬ THẬT (P4 - GOVERNANCE & QA)
> **Mục tiêu:** Xóa bỏ toàn bộ rác mã nguồn, ngăn chặn rò rỉ bộ nhớ dài hạn và xây dựng bộ kiểm thử tự động đo đạc trên Canvas thực tế.

#### 🛠️ Các nhiệm vụ kỹ thuật chi tiết:
- **Task 4.1: Xóa bỏ các tệp mã nguồn chết (Dead Code Elimination):**
  * Xóa file `src/ui/HUDScene.ts` (và bỏ import trong `GameConfig.ts`).
  * Xóa file `src/utils/ScaleManager.ts`.
  * Xóa file `src/entities/player/Satyr.ts`.
- **Task 4.2: Dọn dẹp Event Listener chống rò rỉ bộ nhớ:**
  * Bổ sung cơ chế `this.playerState.off('stats_changed')` khi `UIScene` bị đóng hoặc chuyển cảnh.
- **Task 4.3: Nâng cấp script kiểm toán tự động `verify_v3_release.mjs`:**
  * Bổ sung các bài kiểm tra toán học tọa độ viewport và kiểm tra nhị phân pixel của asset, không chấm PASS hình thức chỉ dựa trên việc tìm kiếm chuỗi văn bản (`includes(...)`).

#### 🎯 Tiêu chí nghiệm thu Giai đoạn 4 (Acceptance Criteria):
1. Lệnh `npx tsc --noEmit` đạt 0 errors, 0 warnings với codebase sạch sẽ 100%.
2. Không còn bất kỳ file chết nào trong dự án.
3. Bộ kiểm thử tự động phản ánh trung thực chất lượng thực tế của game.

---
*Lộ trình được thiết kế độc lập bởi Senior Game QA Engineer – Dự án HOLLOW WOODS V3.0.*
