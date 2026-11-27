# HW-AG-FIX-17 — HIDING INTERACTION PROMPT REPORT

**Project:** HOLLOW WOODS V1.6.1  
**Branch:** `feat/v1.6-competition-preview`  
**Priority:** P2  
**Status:** COMPLETED & VERIFIED IN PHASER RUNTIME (0 Console Errors)

---

## 1. Nguyên nhân gốc rễ

Qua kiểm tra tại khu vực **Trạm Lửa Rừng Tĩnh Lặng** `(1470, 710)`, gần **Sir Vaelen** `(1435, 710)`, phát hiện hai vấn đề trong `src/scenes/GameScene.ts`:

1. **Vật thể ẩn nấp gần Sir Vaelen không kích hoạt ẩn nấp và rơi vào nhánh `"Đã tương tác với: ..."`:**  
   `hide_tree_ow_north` (*Cây Rỗng Rừng Ven* tại `(1360, 620)`) và 5 `hiding_spot` khác trong `src/data/zones.json` (`hide_tree_ow_willow`, `hide_bush_cp_entrance`, `hide_bush_cp_sentinel`, `sm_hide_bush_north`, `sm_hide_tree_titan`) có `type: "hiding_spot"`, nhưng trường `actionId` lại đặt theo `id` riêng thay vì `"hide_player"`.  
   Trong `GameScene.executeMapInteraction` (`src/scenes/GameScene.ts:6420`), hệ thống chỉ xử lý nhánh ẩn nấp khi `actionId === 'hide_player'`, nên khi nhấn `[E]` tại `Cây Rỗng Rừng Ven`, game rơi vào nhánh `else` và hiển thị `"Đã tương tác với: Cây Rỗng Rừng Ven"` mà không cho nhân vật ẩn nấp.
2. **Nội dung Interaction Prompt chưa thống nhất theo chuẩn mới:**  
   - Trước khi ẩn nấp (`GameScene.ts:5109`), mỗi `hiding_spot` hiển thị chuỗi `promptText` khác nhau (như `"[E] Ẩn Nấp Vào Cây Rỗng"`, `"Nhấn [E] Ẩn nấp trong bụi rậm"`, ...).  
   - Trong khi đang ẩn nấp (`GameScene.ts:4732` và `6427`), game hiển thị `"[E] / [WASD] Bước ra khỏi chỗ trốn"` thay vì `"[E] Rời chỗ ẩn nấp"`.

---

## 2. Giải pháp & File thay đổi

Chỉ chỉnh sửa cục bộ trong **`src/scenes/GameScene.ts`** (không sửa `zones.json`, `WorldBuilder.ts`, collider, bán kính tương tác hay cơ chế ẩn nấp, tránh xung đột với WORLD-01 của Codex):

1. **`src/scenes/GameScene.ts` (dòng 5109–5152, `handleInteractions`):**  
   - Xác định `const isHidingSpot = nearby.type === 'hiding_spot' || nearby.actionId === 'hide_player';`.
   - Khi `isHidingSpot` đúng, chuẩn hóa `rawPrompt = 'Ẩn nấp'` để hiển thị `"[E] Ẩn nấp"` trong tầm tương tác (`<= 52px`) và `"Ẩn nấp"` ở rìa quét (`52–65px`). Các vật thể tương tác thông thường giữ nguyên `nearby.promptText`.
   - Khi kích hoạt `action`, truyền `'hide_player'` vào `this.executeMapInteraction(...)` nếu là `isHidingSpot`, giúp toàn bộ các điểm `type: 'hiding_spot'` (bao gồm `Cây Rỗng Rừng Ven` gần Sir Vaelen) đều thực hiện ẩn nấp đúng cách.
2. **`src/scenes/GameScene.ts` (dòng 4732 & dòng 6427):**  
   - Đổi prompt khi đang ẩn nấp thành `"[E] Rời chỗ ẩn nấp"` (giữ nguyên cơ chế thoát bằng `[E]` hoặc `[WASD]`).

---

## 3. Kết quả kiểm thử (TypeScript + Playwright Runtime)

- `npx tsc --noEmit`: **PASS** (exit code 0).
- Kiểm thử thực tế trên Vite + Chromium (`?dev=1`, 0 console/page errors):

| Tình huống kiểm thử | Trước khi sửa | Sau khi sửa |
|---|---|---|
| Tiếp cận `Cây Rỗng Rừng Ven` `(1360, 620)` gần Sir Vaelen & nhấn `[E]` | Prompt `[E] Ẩn Nấp Vào Cây Rỗng`; nhấn `[E]` hiện `"Đã tương tác với: Cây Rỗng Rừng Ven"`, `isHiding = false` | Nhân vật vào trạng thái ẩn nấp (`isHiding = true`), prompt chuyển thành **`[E] Rời chỗ ẩn nấp`** |
| Nhấn `[E]` lần nữa để rời `Cây Rỗng Rừng Ven` | Không ở trạng thái ẩn nấp | Thoát ẩn nấp (`isHiding = false`, `"Đã bước ra khỏi chỗ trốn."`), prompt hiển thị **`[E] Ẩn nấp`** |
| Tiếp cận bụi rậm ẩn nấp `(1150, 655)` → ẩn nấp → thoát | Trước: `[E] Ẩn nấp trong bụi rậm`; Trong: `[E] / [WASD] Bước ra khỏi chỗ trốn` | Trước: **`[E] Ẩn nấp`**; Trong: **`[E] Rời chỗ ẩn nấp`**; Sau: **`[E] Ẩn nấp`** |
| Vật thể thường: `Bếp Lửa Hồng Rừng Tĩnh Lặng` `(1470, 710)` | `[E] Sưởi Ấm Bên Lửa Cổ` | **`[E] Sưởi Ấm Bên Lửa Cổ`** (không bị ảnh hưởng) |

### Ảnh đối chiếu Trước / Sau (Artifacts)

- Trước khi sửa (gần Sir Vaelen, nhấn E bị `"Đã tương tác với: Cây Rỗng Rừng Ven"`): `fix17_before_2_after_press_e.png`
- Trước khi sửa (khi đang ẩn nấp trong bụi rậm): `fix17_before_4_hiding_bush.png`
- Sau khi sửa (gần Sir Vaelen, đang ẩn nấp với prompt `[E] Rời chỗ ẩn nấp`): `fix17_after_2_after_press_e.png`
- Sau khi sửa (sau khi rời chỗ ẩn nấp, prompt `[E] Ẩn nấp`): `fix17_after_3_after_exit.png`
