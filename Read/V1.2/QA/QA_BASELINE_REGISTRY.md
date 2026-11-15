# HOLLOW WOODS V1.2 — QA BASELINE REGISTRY

- **Dự án:** HOLLOW WOODS V1.2 — *Dị Cảnh Rừng Liễu (The Fog That Remembers)*
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Trạng thái Dev Server:** Đang chạy tại `http://127.0.0.1:3000/` (`::1:3000`, PID `15104`)
- **Kiểm tra TypeScript (`npx tsc --noEmit`):** `PASS` (`0` lỗi biên dịch)

---

## 1. DANH SÁCH CÁC ĐIỂM KIỂM TRA CƠ SỞ (BASELINE QA CHECKLIST)

| Hạng mục kiểm tra | Phương thức kiểm tra | Trạng thái hiện tại | Ghi chú |
| :--- | :--- | :---: | :--- |
| **1. Biên dịch TypeScript (`strict`)** | Tự động (`npx tsc --noEmit`) | **PASS** | `0` lỗi trên toàn bộ `src/`. |
| **2. Điều khiển di chuyển (`WASD` / Mũi tên / `W` key)** | Code Audit (`SatyrPlayer.ts`, `SatyrAnimations.ts`) | **PASS** | Đã có chốt chặn tránh animation 0-frame khi nhấn `W`. |
| **3. Tương thích bộ gõ Tiếng Việt (`UniKey` / `EVKey`)** | Code Audit (`SatyrPlayer.ts` — Physical `KeyboardEvent.code`) | **PASS** | Bắt theo mã phím vật lý `KeyW/A/S/D`, xử lý an toàn `blur/focus` và `isComposing`. |
| **4. Thu thập tài nguyên & Bàn chế tạo làng Bellhollow** | Code & Node BFS Audit (`WorldBuilder.ts`, `GameScene.ts`) | **PASS** | `17/17` điểm tương tác tiếp cận 100%, không kẹt collider. |
| **5. Bộ tài nguyên gốc `The Mossbound Wayfarer` (9 sheets)** | Tự động (`verify_c4_12_05_wayfarer_qc.mjs` với `pngjs`) | **PASS** | `172/172` frames đạt chuẩn `64×64`, nền RGBA, `FootAnchor(32,58)` khóa chặt. |
| **6. Trải nghiệm trực tiếp trên trình duyệt (Browser Runtime)** | Người chơi mở trình duyệt kiểm tra trực tiếp | **NOT TESTED** | Không chạy trình duyệt tự động trong bước `C4-12-00`. |

---

## 2. CÁC VẤN ĐỀ CÒN TỒN ĐỌNG CẦN XỬ LÝ TRONG LỘ TRÌNH V1.2

1. **Chưa đồng nhất số hiệu phiên bản giữa các file (Version Mismatch):**
   - [package.json](file:///G:/HOLLOW%20WOODS/package.json#L4): `"version": "3.0.0"` (`"name": "hollow-woods-v3"`).
   - [index.html](file:///G:/HOLLOW%20WOODS/index.html#L6): `<title>HOLLOW WOODS V3.0 – The Fog That Remembers</title>`.
   - [MainMenuScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L213): Hiển thị `'V3.0.0 (PASS G4 FINALE) | Phaser 4 + TypeScript (strict) | 1280×720 HD'`.
   - [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L24-L58): `SAVE_KEY = 'hollow_woods_v3_savegame'` và `version: '3.0.0'`.
   - [EndingSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/EndingSystem.ts#L250): Hiển thị `'HOLLOW WOODS V1.1'` ở màn hình kết thúc.
   - *(Lưu ý: Ghi nhận nguyên trạng tại bước `C4-12-00`, chưa tự ý sửa các file code này cho đến khi có yêu cầu cụ thể).*
2. **Tích hợp nhân vật chính `The Mossbound Wayfarer` vào Runtime (`C4-12-06` & `C4-12-07`):**
   - Bộ 9 sprite sheet của Wayfarer đã tạo xong trong `public/assets/characters/mossbound_wayfarer/`, nhưng `PreloadScene.ts`, `GameScene.ts`, `MainMenuScene.ts` và `SatyrPlayer.ts` hiện vẫn đang nạp `satyr_sheet.png` cũ.
3. **Đồng bộ tạo hình riêng biệt cho 3 NPC Dân làng (`C4-12-08` & `C4-12-09`):**
   - Cần nâng cấp và kiểm tra hiển thị runtime của Garth, Bà Lão Edda và Neris theo đúng đặc trưng nghề nghiệp.
4. **Hoàn thiện kiến trúc bản đồ `Hybrid Open World` & Nông trại nhỏ (`C4-12-10` đến `C4-12-16`):**
   - Mở rộng kết nối *Sanctuary Farm*, *Outer Woods*, *The Crooked Path*, *Silent Mire*, *Broken Bell Shrine* và cơ chế canh tác thảo mộc MVP.
