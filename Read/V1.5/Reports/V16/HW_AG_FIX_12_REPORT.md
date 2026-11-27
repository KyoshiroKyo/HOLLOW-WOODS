# HW-AG-FIX-12 — EQUIPMENT UI HINT CONSISTENCY REPORT
**Dự án:** HOLLOW WOODS V1.6.1 (Baseline trên `feat/v1.6-competition-preview`)\
**Ngày:** 27/11/2026 (19:37 ICT)\
**Branch:** `feat/v1.6-competition-preview`\

---

## 1. ĐỐI CHIẾU PHÍM TẮT THỰC TẾ (`UIScene.ts` & `BlackKnightPlayer.ts`)

Kiểm tra thực tế tại `src/scenes/UIScene.ts:890–920`:
- **`C` (`KeyC`), `I` (`KeyI`), `Tab` (`Tab`)**: Cả 3 phím đều mở/đóng menu Chế Tạo (`toggleCrafting()`). Trong UI thanh bên (`UIScene.ts:1454`) và `p2game.json` (`[I/C]: Chế tạo`), hai phím chính thức hiển thị cho người chơi là **`[I / C]`**.
- **`B` (`KeyB`)**: Mở/đóng bảng Trang Bị (`EquipmentModal`).

---

## 2. FILE THAY ĐỔI (`src/ui/EquipmentModal.ts`)

- Tại `renderAvailableInventory()` (dòng 369–395):
  - Cập nhật thông báo rỗng từ 1 dòng `"Chưa có trang bị phù hợp. Chế tạo vật phẩm tại [I]."` thành hộp thông báo gọn 2 dòng có viền đồng bộ với thẻ trang bị (`w = 450`, `h = 54`, `wordWrap` an toàn):
    - Dòng 1: **`Chưa có trang bị phù hợp`** (`#E8DFC8`, đậm)
    - Dòng 2: **`[I / C]`** (`#E09F3E`, đậm) **`Mở menu chế tạo`** (`#C8CFC2`)
  - Giữ nguyên hoàn toàn cơ chế gán phím, Inventory, EquipmentSystem và artwork hiện tại.

---

## 3. KIỂM CHỨNG & ẢNH ĐỐI CHIẾU

- `npm run build` (`tsc && vite build`): **PASS** (0 lỗi).
- `npx p2game-validate ./dist --slug hollow-woods`: **292 tệp · 79.5 MB · ✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)**.
- Ảnh Trước / Sau: `equip_before.png`, `equip_after.png`.
