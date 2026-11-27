# HW-AG-B07 — SAVE MIGRATION: EDDA RUNE CHARM (LEGACY SAVE RECOVERY)

**Dự án:** HOLLOW WOODS V1.6.1 (`feat/v1.6-competition-preview`)  
**Ngày:** 27/11/2026 (23:21 ICT)  
**Tham chiếu:** `HW-AG-FIX-23` / `HW-AG-FIX-13`  
**Baseline checkpoint:** `9c940b6d20bfe0b432e51e6ec4597a65cc316ead`

---

## 1. BỐI CẢNH

Trước bản vá `HW-AG-FIX-23`, lỗi thứ tự xử lý tại `DialogueSystem.ts:478` khiến:
- Cờ `edda_rune_charm_granted` và `dlg_reward:edda_rune_guide` được đặt thành `true`.
- Nhưng `eqp_bell_ward_charm` **không được cấp** vào `inventory`.

Các Save được tạo ra trước FIX-23 mà đã hoàn thành `edda_rune_guide` sẽ bị ở trạng thái không nhất quán này. Nhiệm vụ B07 triển khai migration tự động, an toàn, không phá hủy để phục hồi vật phẩm bị thiếu khi nạp Save.

---

## 2. TRIỂN KHAI MIGRATION

**File thay đổi:** `src/systems/SaveManager.ts`

**Phương thức mới:** `SaveManager.migrateEddaRuneCharmV161()` (private static)

**Điểm gọi:** Cuối `sanitizeAndMigrateSaveData()`, trước khi `return` — đảm bảo cả `loadGame()` lẫn `loadGameAsync()` (Cloud Save) đều được áp dụng tự động.

### Điều kiện kích hoạt migration (phải thỏa đủ cả 3)
1. **Chưa migrate:** Chưa có cờ `migrated_edda_rune_charm_v161` trong `flags` hoặc `storyFlags`.
2. **Đã làm Edda:** Có ít nhất một trong hai cờ `edda_rune_charm_granted` hoặc `dlg_reward:edda_rune_guide`.
3. **Chưa có charm ở bất kỳ vị trí nào:**
   - `inventory`: không có entry `eqp_bell_ward_charm` với `count > 0`.
   - `equippedSlots.charm`: khác `'eqp_bell_ward_charm'`.
   - `storageChest`: không có entry `eqp_bell_ward_charm` với `count > 0`.

### Hành động
- Nếu đủ 3 điều kiện → thêm `['eqp_bell_ward_charm', 1]` vào `inventory`.
- Đồng bộ `edda_rune_charm_granted` và `dlg_reward:edda_rune_guide` sang cả `flags` và `storyFlags` (guard chống cấp trùng khi nói chuyện lại với Edda).
- Gắn `migrated_edda_rune_charm_v161` vào cả `flags` và `storyFlags` → **idempotent** (chỉ chạy 1 lần).
- Nếu charm đã có ở inventory/equippedSlots/storageChest → không cấp thêm, chỉ gắn idempotency flag.
- Nếu chưa gặp Edda (không có cờ thưởng) → bỏ qua hoàn toàn.

### Giữ nguyên Save Schema 3
- Không thêm trường mới vào `SaveData` interface.
- Chỉ sửa nội dung các trường hiện có (`inventory`, `flags`, `storyFlags`).
- Tương thích ngược 100% với Save Schema 3.

---

## 3. KẾT QUẢ KIỂM THỬ

### 3.1 Node Migration Test (`scripts/verify_b07_edda_save_migration.mjs`)
Dùng mock Save Schema 3, không chạm Chromium, không chạm Save thật của Owner.

| Test Case | Mô tả | Kết quả |
|---|---|---|
| TC1 | Save cũ bị lỗi (cờ có, 0 charm ở mọi nơi) → phục hồi 1 charm + cờ idempotency | **PASS** |
| TC2 | Nạp lại Save đã migrate lần 2 → vẫn 1 charm, không nhân đôi | **PASS** |
| TC3 | Save hợp lệ có sẵn charm trong `inventory` → giữ nguyên 1, không cấp thêm | **PASS** |
| TC4 | Charm đang đeo ở `equippedSlots.charm` → không cấp thêm vào túi | **PASS** |
| TC5 | Charm cất trong `storageChest` → không cấp thêm vào túi | **PASS** |
| TC6 | Save mới chưa gặp Edda (không có cờ) → 0 charm, không migration | **PASS** |

### 3.2 Toàn bộ pipeline CI-like
| Lệnh | Kết quả |
|---|---|
| `npx tsc --noEmit` | **PASS** (0 lỗi) |
| `npm run build` (`tsc && vite build`) | **PASS** (11.82s, 102 modules) |
| `node scripts/verify_v16_b05_quest_hardening.mjs` | **6/6 PASS** |
| `node scripts/verify_b07_edda_save_migration.mjs` | **6/6 PASS** |

---

## 4. FILE THAY ĐỔI

| File | Thay đổi |
|---|---|
| `src/systems/SaveManager.ts` | Thêm `migrateEddaRuneCharmV161()` (private static, 54 dòng) + 1 lời gọi trong `sanitizeAndMigrateSaveData()` |
| `scripts/verify_b07_edda_save_migration.mjs` | Script kiểm thử 6 ca Node-only mới |
| `Read/V1.5/Reports/V16/HW_AG_B07_SAVE_MIGRATION_REPORT.md` | Báo cáo này |

---

## 5. BẢO ĐẢM AN TOÀN

- **Không ghi đè Save thật của Owner:** Migration chỉ chạy khi nạp Save qua `sanitizeAndMigrateSaveData()`. File localStorage/Cloud không bị ghi lại cho đến khi Owner tự lưu game.
- **Không thay đổi Save Schema 3:** Interface `SaveData` giữ nguyên 100%.
- **Không chạm `G:\HOLLOW_WOODS_CODEX`**, không merge `main`, không sửa ZIP V1.6.0.
