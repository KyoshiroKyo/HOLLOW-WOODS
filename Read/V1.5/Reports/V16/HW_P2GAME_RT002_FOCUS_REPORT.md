# HW-P2GAME-RT002 — RUNTIME FOCUS COMPATIBILITY REPORT
**Dự án:** HOLLOW WOODS V1.6.0 — The Unbroken Oath  
**Ngày:** 27/11/2026 (17:16 ICT)  
**Branch:** `feat/v1.6-competition-preview`  

---

## 1. NGUYÊN NHÂN GỐC LỖI RT-002

Portal Runtime Validation của P2Game chạy game trong iframe hạn chế `focus-without-user-activation` và ghi nhận **3 console errors** lúc khởi động:
`Permissions policy violation: focus-without-user-activation is not allowed in this document.`

Các nguồn gây lỗi:
1. `src/main.ts` (dòng 88): `autoFocus: true` ghi đè `GameConfig.ts` (`autoFocus: false`), khiến Phaser tự động focus khi boot mà chưa có user activation.
2. `src/main.ts` (`focusGameCanvas`), `src/scenes/GameScene.ts` (dòng 1688 gọi `focusCanvas()` ngay khi `create()`), `src/scenes/UIScene.ts` (`focusGameCanvas()`): gọi `window.focus()` và `canvas.focus()` không kiểm tra `navigator.userActivation?.isActive`.
3. `src/debug/DevPanelOverlay.ts`: gọi trực tiếp `document.getElementById('game-canvas')?.focus()`.

---

## 2. GIẢI PHÁP ĐÃ TRIỂN KHAI

1. **Helper chung [focusHelper.ts](file:///G:/HOLLOW_WOODS_C02/src/utils/focusHelper.ts):**
   - `focusGameCanvasSafely(canvas?)`: kiểm tra `navigator.userActivation?.isActive === true`; chỉ gọi `target.focus({ preventScroll: true })` khi đang có user activation và `document.activeElement !== target`; **loại bỏ hoàn toàn `window.focus()`**.
2. **`src/main.ts`:** Đặt `autoFocus: false` (nhất quán với `GameConfig.ts`) và chuyển `focusGameCanvas` sang `focusGameCanvasSafely(...)`.
3. **`src/scenes/GameScene.ts`:** Xóa lời gọi `focusCanvas()` khi `create()`; chỉ focus trong `this.input.on('pointerdown', ...)` qua `focusGameCanvasSafely(this.game?.canvas)`.
4. **`src/scenes/UIScene.ts` & `src/debug/DevPanelOverlay.ts`:** Chuyển toàn bộ lời gọi focus canvas sang `focusGameCanvasSafely(...)`.
5. **Cập nhật kiểm thử V15-48 (`scripts/test_v15_48_iframe_focus_and_hud_layout.mjs`):** Cập nhật assertion cho `autoFocus: false` và `focusGameCanvasSafely` (26/28 PASS; 2 mục fail không liên quan RT-002 là tiêu đề `V1.5` cũ và `timeBoxW` cũ của UIScene, giữ nguyên không sửa tiêu chí kiểm thử).

---

## 3. BẰNG CHỨNG KIỂM CHỨNG

1. **Kiểm thử trình duyệt trong iframe có `Permissions-Policy: focus-without-user-activation=()`:**
   - Khởi động `MainMenuScene` trước mọi tương tác người dùng: **0** `Permissions-Policy` violations, **0** console errors.
   - Click vào iframe → `activeElement` = `game-canvas`, `hasFocus: true` → vào `GameScene`, bấm `D` (WASD) → nhân vật di chuyển `120.0 -> 145.5`.
   - Tổng kết: **0** policy violations, **0** console errors trong suốt phiên.
2. **Official P2Game Validator (`npx p2game-validate ./dist --slug hollow-woods`):**
   - **V1.6.0:** `292 tệp · 79.5 MB · tải trọng khởi động 3.0 MB` — **`✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)`** (xác nhận SE-004 không tái xuất hiện).
   - **V1.5.5-R2** (baseline `0927971` + chỉ vá SE-004 & RT-002, không chứa code Competition): `292 tệp · 79.5 MB · tải trọng khởi động 3.0 MB` — **`✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)`**.

---

## 4. GÓI PHÁT HÀNH & CHECKSUM

| Phiên bản | Đường dẫn | Kích thước | SHA-256 |
|---|---|---|---|
| **V1.6.0 Competition Preview** | `release/p2game/hollow-woods-p2game-v1.6.0.zip` | 62,269,979 bytes | `0726213E47F6C09901D8267BBFB6EF139B860FEC15AEA7E3EB2291BF599AB190` |
| **V1.5.5-R2 Fallback (SE-004 + RT-002)** | `release/p2game/hollow-woods-p2game-v1.5.5-r2.zip` | 62,427,767 bytes | `F6BFBA92438CEC8364D37FA2FECDD9E89D9AA955BC5828080414BED9CFA241E5` |
| **Các gói cũ (`v1.5.2`, `v1.5.5`, `v1.5.5-r1`)** | `release/p2game/` | Bảo toàn nguyên trạng | — |
