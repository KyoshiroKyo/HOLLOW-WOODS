# HOLLOW WOODS V1.2 — BÁO CÁO THIẾT LẬP NỀN TẢNG C4-12-00
## COMMAND C4-12-00 — VERSION FOUNDATION & DIRECTION REGISTRY

- **Dự án:** HOLLOW WOODS V1.2 — *Dị Cảnh Rừng Liễu (The Fog That Remembers)*
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Mã bước:** `C4-12-00`
- **Trạng thái:** **PASS**
- **Phạm vi thực hiện:** Khảo sát hiện trạng dự án, thiết lập cấu trúc tài liệu V1.2, ghi nhận định hướng nghệ thuật & cấu trúc thế giới, hoàn toàn không chỉnh sửa code gameplay và không chạy bất kỳ lệnh ghi/xóa Git nào.

---

## 1. KẾT QUẢ KHẢO SÁT HIỆN TRẠNG DỰ ÁN & DEV SERVER

1. **Cấu trúc thư mục mã nguồn (`src/`):**
   - `src/animation/` (`SatyrAnimations.ts`)
   - `src/audio/` (`AudioManager.ts`)
   - `src/config/` (`Constants.ts`)
   - `src/data/` (`dialogues.json`, `items.json`, `lore.json`, `quests.json`, `recipes.json`, `satyr_animations.json`, `zones.json`)
   - `src/entities/` (`NPCEntity.ts`, `SatyrPlayer.ts`, `TheListener.ts`)
   - `src/scenes/` (`BootScene.ts`, `PreloadScene.ts`, `MainMenuScene.ts`, `GameScene.ts`, `UIScene.ts`)
   - `src/state/` (`PlayerState.ts`)
   - `src/systems/` (`DialogueSystem.ts`, `EchoSystem.ts`, `EndingSystem.ts`, `InventorySystem.ts`, `PuzzleSystem.ts`, `SaveManager.ts`, `SurvivalSystem.ts`, `VeilSystem.ts`, `camera/CameraSystem.ts`)
   - `src/ui/` (`CraftingModal.ts`, `JournalModal.ts`, `PauseModal.ts`)
   - `src/utils/` (`DebugOverlay.ts`, `HDTextHelper.ts`)
   - `src/world/` (`WorldBuilder.ts`)
2. **Bảo toàn tài liệu lịch sử:**
   - `Read/V1.0/` và `Read/V1.1/` được giữ nguyên vẹn 100%, không chỉnh sửa hay xóa bất kỳ file nào.
3. **Trạng thái Vite Dev Server:**
   - Đang chạy ổn định tại cổng `3000` (`::1:3000`, `PID 15104`), được giữ nguyên không khởi động lại hay mở thêm server thứ hai.

---

## 2. GHI NHẬN ĐIỂM CHƯA ĐỒNG NHẤT VỀ SỐ HIỆU PHIÊN BẢN (CHƯA SỬA CODE)

Qua khảo sát thực tế, các file trong dự án hiện đang mang số hiệu phiên bản khác nhau giữa `V3.0`, `V1.1` và định hướng mục tiêu `V1.2`:

| File | Vị trí dòng | Giá trị hiện tại | Ghi chú |
| :--- | :---: | :--- | :--- |
| [package.json](file:///G:/HOLLOW%20WOODS/package.json#L2-L4) | `L2–L4` | `"name": "hollow-woods-v3"`, `"version": "3.0.0"` | Giữ nguyên theo yêu cầu `C4-12-00` |
| [index.html](file:///G:/HOLLOW%20WOODS/index.html#L6) | `L6` | `<title>HOLLOW WOODS V3.0 – The Fog That Remembers</title>` | Giữ nguyên theo yêu cầu `C4-12-00` |
| [README.md](file:///G:/HOLLOW%20WOODS/README.md#L1) | `L1` | `# 🌲 HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS` | Giữ nguyên theo yêu cầu `C4-12-00` |
| [MainMenuScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L213) | `L213` | `'V3.0.0 (PASS G4 FINALE) \| Phaser 4 + TypeScript (strict) \| 1280×720 HD'` | Giữ nguyên theo yêu cầu `C4-12-00` |
| [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L24-L58) | `L24, L58` | `SAVE_KEY = 'hollow_woods_v3_savegame'`, `version: '3.0.0'` | Giữ nguyên để bảo toàn tương thích file save hiện có |
| [EndingSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L250) | `L250` | `'HOLLOW WOODS V1.1'` | Giữ nguyên theo yêu cầu `C4-12-00` |

---

## 3. ĐỊNH HƯỚNG NGHỆ THUẬT, NHÂN VẬT, THẾ GIỚI & LỐI CHƠI V1.2

1. **Hướng nghệ thuật A — Dark Woodland Pixel Art:**
   - Pixel art rừng sâu u tối kết hợp kiến trúc làng gỗ – đá trung cổ, đường đá cuội, hàng rào gỗ, rừng thông/liễu nhiều lớp và ánh sáng đèn lồng hổ phách ấm áp xuyên qua màn sương.
2. **Nhân vật chính — The Mossbound Wayfarer (*Lữ Khách Rêu Phong*):**
   - Lữ khách trẻ khoác áo choàng xanh rêu phủ lá rừng, đeo cuộn hành lý sau lưng, tay cầm cây gậy gỗ treo đèn lồng ấm áp (`64×64 px`, điểm neo bàn chân `(32, 58)`).
3. **Ba NPC Dân làng Bellhollow:**
   - **Garth** (Người gác cổng), **Bà lão Edda** (Người giữ chuông) và **Neris** (Thầy thuốc thảo mộc).
4. **Cấu trúc thế giới C — Hybrid Open World:**
   - **Layer 1 (Core World — Mở từ đầu):** *Fog Crossing*, *Bellhollow*, *Sanctuary Farm*.
   - **Layer 2 (Frontier — Mở dần theo nhiệm vụ):** *Outer Woods*, *The Crooked Path*.
   - **Layer 3 (Forbidden Regions — Khóa theo cốt truyện/giải đố):** *Silent Mire*, *Broken Bell Shrine*.
5. **Tám trụ cột lối chơi:**
   - Sinh tồn, Bầu không khí rừng sâu huyền bí, Khám phá, Thu thập, Chế tạo, Nhiệm vụ, Giải đố và Nông trại nhỏ (*Sanctuary Farming*).

---

## 4. DANH SÁCH FILE TÀI LIỆU ĐÃ TẠO / CẬP NHẬT TRONG C4-12-00

1. [Read/V1.2/README_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.2/README_INDEX.md)
2. [Read/V1.2/Assets/ASSET_DIRECTION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.2/Assets/ASSET_DIRECTION_REGISTRY.md)
3. [Read/V1.2/QA/QA_BASELINE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.2/QA/QA_BASELINE_REGISTRY.md)
4. [Read/V1.2/Reports/C4-12-00/C4-12-00_FOUNDATION.md](file:///G:/HOLLOW%20WOODS/Read/V1.2/Reports/C4-12-00/C4-12-00_FOUNDATION.md)

---

## 5. KẾT QUẢ KIỂM TRA (VERIFICATION STATUS)

- **Kiểm tra cấu trúc thư mục & tài liệu V1.2:** **PASS**
- **Kiểm tra biên dịch TypeScript (`npx tsc --noEmit`):** **PASS** (`0` lỗi)
- **Kiểm tra hoạt động cổng Vite Dev Server (`::1:3000`):** **PASS** (Đang lắng nghe tại port `3000`, `PID 15104`)
- **Kiểm tra trải nghiệm trực tiếp trên trình duyệt (Browser Runtime):** **NOT TESTED** (Dành cho người chơi tự kiểm tra trực tiếp trên trình duyệt)
