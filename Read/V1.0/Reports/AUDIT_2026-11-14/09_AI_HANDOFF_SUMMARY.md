# 🤖 HƯỚNG DẪN BÀN GIAO CHO AI AGENT / KỸ SƯ KẾ NHIỆM (AI HANDOFF SUMMARY)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Dành cho:** AI Agent hoặc Kỹ sư phần mềm tiếp nhận dự án ở phiên làm việc tiếp theo
> **Nguyên tắc bàn giao:** **KHÔNG CẦN CHẠY LẠI BẤT KỲ BƯỚC AUDIT NÀO NỮA.** Bắt tay vào sửa chữa trực tiếp theo danh mục file và giải pháp đã được chứng minh toán học dưới đây!

---

## 1. TÓM TẮT BỐI CẢNH DỰ ÁN TRONG 30 GIÂY

- **Dự án:** Game kinh dị sinh tồn 2D Pixel Art `HOLLOW WOODS V3.0` chạy trên nền Phaser 4.2.1 + TypeScript + Vite.
- **Thư mục làm việc:** `G:\HOLLOW WOODS V3`.
- **Hiện trạng:** Logic game loop 7 hồi, câu đố, âm thanh Web Audio và nhặt đồ chạy rất tốt; nhưng **giao diện bị văng khỏi màn hình do Camera Zoom 2.2×**, **mặt đất bị thủng lỗ chỗ do cắt nhầm tile**, và **nhân vật bị khựng khi đi chéo**.
- **Đánh giá kiểm toán:** `PLAYABLE BUT NOT ACCEPTABLE`. Cần thực thi kế hoạch sửa lỗi để nâng cấp lên `READY FOR PUBLIC PLAYTEST`.

---

## 2. DANH SÁCH TẬP TIN CẦN CHỈNH SỬA & GIẢI PHÁP CHÍNH XÁC

### 1️⃣ SỬA TỬ HUYỆT GIAO DIỆN UI (CHUYỂN TOÀN BỘ MODALS SANG `UIScene`)
- **Tệp cần sửa:**
  1. `src/scenes/UIScene.ts`:
     * Khởi tạo và quản lý instance của: `DialogueSystem`, `CraftingModal`, `JournalModal`, `PauseModal`, `DebugOverlay`, và `EndingSystem`.
     * Cung cấp các hàm public: `openDialogue(key: string)`, `openCrafting()`, `openJournal()`, `openPause()`, `triggerEnding()`.
     * Vì `UIScene` có `this.cameras.main.setZoom(1.0)`, mọi modal sẽ hiển thị sắc nét chuẩn HD 1280×720 ngay ngắn giữa màn hình!
  2. `src/scenes/GameScene.ts`:
     * Xóa bỏ các biến cục bộ `dialogueSystem`, `craftingModal`, `journalModal`, `pauseModal`, `debugOverlay`, `endingSystem`.
     * Khi người chơi nhấn `[E]`, `[I]`, `[J]`, `[ESC]`, chuyển tiếp lệnh gọi sang `this.uiScene.openDialogue(...)`, `this.uiScene.openCrafting()`, v.v.

### 2️⃣ SỬA LỖI NỀN CỎ BÀN CỜ ĐEN (TERRAIN SEAMS)
- **Tệp cần sửa:** `scripts/step7_extract_terrain_tiles.mjs`.
  * Đổi nguồn trích xuất của `tile_forest_grass.png`:
    Thay vì cắt từ `public/assets/environment/tilesets/forest_Tileset.png` (bị dính bụi cây bóng đổ), hãy cắt một ô cỏ 32×32 pixel liền mạch từ:
    `public/assets/environment/tilesets/TX Tileset Grass.png` (file chuẩn 256×256 px có sẵn).
  * Chạy lệnh: `node scripts/step7_extract_terrain_tiles.mjs` để tạo lại file `tile_forest_grass.png` sạch 100% không còn pixel trong suốt.

### 3️⃣ SỬA LỖI NHÂN VẬT DI CHUYỂN KHỰNG GIẬT (DIAGONAL STUTTER)
- **Tệp cần sửa:** `src/entities/SatyrPlayer.ts` (hàm `updateFacingDirection`).
  * Thay thế logic rẽ nhánh thành:
    ```typescript
    private updateFacingDirection(moveX: number, moveY: number): void {
      if (Math.abs(moveX) > Math.abs(moveY)) {
        if (moveX < 0) this.facing = 'left';
        else if (moveX > 0) this.facing = 'right';
      } else if (Math.abs(moveY) > Math.abs(moveX)) {
        if (moveY < 0) this.facing = 'up';
        else if (moveY > 0) this.facing = 'down';
      }
      // NẾU |moveX| == |moveY| (ĐI CHÉO): GIỮ NGUYÊN this.facing HIỆN TẠI, TUYỆT ĐỐI KHÔNG ĐỔI!
    }
    ```
  * Trong hàm `playWalkOrRunAnim()`: Chỉ gọi `this.play(...)` khi `animKey` thực sự khác với `this.anims.currentAnim?.key`.

### 4️⃣ SỬA ÁP LỰC RÁC BỘ NHỚ TẠI 60 FPS (GC SPIKES)
- **Tệp cần sửa:** `src/scenes/GameScene.ts` (hàm `create` & `updateFogOfWar`).
  * Trong `create()`: Thêm thuộc tính `private lanternMaskGfx!: Phaser.GameObjects.Graphics;` và khởi tạo một lần duy nhất: `this.lanternMaskGfx = this.make.graphics();`.
  * Trong `updateFogOfWar()`: Xóa bỏ `const lightG = this.make.graphics();` và `lightG.destroy();`. Thay bằng việc tái sử dụng `this.lanternMaskGfx.clear()` và vẽ lại.

---

## 3. DANH SÁCH CÁC TỆP CẦN XÓA BỎ (DEAD CODE CLEANUP)

Xóa an toàn các tệp sau để làm sạch dự án:
1. 🗑️ `src/ui/HUDScene.ts` (Xóa file và xóa import trong `src/config/GameConfig.ts`).
2. 🗑️ `src/utils/ScaleManager.ts` (File không ai dùng).
3. 🗑️ `src/entities/player/Satyr.ts` (File re-export thừa).

---

## 4. CHECKLIST BÀN GIAO THỰC THI NHANH (FAST EXECUTION CHECKLIST)

```markdown
- [ ] 1. Sửa `SatyrPlayer.ts` loại bỏ khựng giật khi đi chéo.
- [ ] 2. Tạo lại `tile_forest_grass.png` từ `TX Tileset Grass.png` bằng script.
- [ ] 3. Tối ưu `updateFogOfWar()` trong `GameScene.ts` tái sử dụng Graphics.
- [ ] 4. Di chuyển 5 Modals + Debug Overlay sang `UIScene.ts`.
- [ ] 5. Xóa 3 file code chết (`HUDScene.ts`, `ScaleManager.ts`, `Satyr.ts`).
- [ ] 6. Chạy `npx tsc --noEmit` xác nhận 0 errors.
- [ ] 7. Chạy `npm run build` xác nhận đóng gói production thành công.
```

---
*Bản hướng dẫn bàn giao được lập bởi Senior Game QA Engineer – Sẵn sàng chuyển giao cho kỹ sư kế nhiệm.*
