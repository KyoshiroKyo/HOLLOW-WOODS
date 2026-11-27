# HW-V16-COMPETITION-01-R1 — FINAL RELEASE CORRECTION REPORT
**Dự án:** HOLLOW WOODS V1.6.0 — The Unbroken Oath  
**Ngày:** 27/11/2026 (14:50 ICT)  
**Branch:** `feat/v1.6-competition-preview`  

---

## 1. CÁC VẤN ĐỀ ĐÃ KHẮC PHỤC TRONG R1

### 1.1. SE-004 (`navigator.clipboard.writeText`) — ĐÃ XỬ LÝ TRIỆT ĐỂ
- **File:** `src/debug/DevPanelOverlay.ts` (dòng 781–788 và 914–941)
- **Nguyên nhân:** `copy-log` và `copyBugInfo()` vẫn gọi `navigator.clipboard.writeText()` trực tiếp, bị static scan của P2Game gắn lỗi **SE-004** do manifest (`p2game.json`, `public/p2game.json`) không khai báo quyền `clipboard-write`.
- **Khắc phục:** Loại bỏ hoàn toàn mọi lời gọi `navigator.clipboard.writeText()` trong `src/debug/DevPanelOverlay.ts`, thay bằng `presentCopyTextarea(...)` hiển thị `<textarea readonly>` và tự động `.select()` để người dùng copy thủ công khi cần trong DevPanel.
- **Xác minh:** `npx p2game-validate ./dist --slug hollow-woods` đạt **0 cảnh báo, 0 thông tin** cho cả **V1.6.0** và **V1.5.5-R1**.

### 1.2. Demo Reset (`SaveManager.clearSave()`) — ĐÃ TẠM LOẠI BỎ
- **File:** `src/scenes/MainMenuScene.ts`
- **Khắc phục:** Đã gỡ bỏ nút `🔄 Đặt Lại Demo` khỏi Settings Modal để tránh rủi ro xóa nhầm dữ liệu lưu chính của người chơi khi chưa có cơ chế lưu demo độc lập.

### 1.3. B05 Quest Hardening — PHÂN ĐỊNH RÕ PHẠM VI KIỂM THỬ
Trong `scripts/verify_v16_b05_quest_hardening.mjs` (**6/6 PASS**):
- **3 bài kiểm thử logic runtime trên Node** (chạy `PlayerState`, `QuestSystem`, `WorldGatingSystem`, `BossEncounterSystem` thật):
  1. `OPEN-02`: `broken_bell_shrine` giữ khóa trước khi phá phong ấn rễ.
  2. `quest_purification_key` đã tiêu thụ sau `mire_root_seal_broken` không thể chế tạo lại.
  3. `BossEncounterSystem.completeEncounter()` chỉ rơi `relic_heart_of_roots` một lần kể cả khi vật phẩm đã bị tiêu thụ.
- **3 bài kiểm thử tĩnh (static source assertions)** (không phải Full Runtime PASS trong Phaser):
  4. Kiểm tra source `DialogueSystem.ts`: guard `edda_rune_guide` (`hadRuneCharmBeforePass || state.hasFlag('edda_rune_charm_granted')`) và `setStoryFlag(rewardMarker)`.
  5. Kiểm tra source `DialogueSystem.ts`: scope `dlg_reward:${dialogueKey}` và điều kiện `!questAlreadyOwned && !runeCharmAlreadyGranted`.
  6. Kiểm tra source `GameScene.ts`: guard điều hướng Vaelen/Bram (`!isSealAlreadyBroken`, `!isKeyAlreadyCrafted`).

---

## 2. KIỂM THỬ TRÌNH DUYỆT NGẮN (ISOLATED SMOKE TEST)

Chạy bằng Chrome Headless qua CDP với `--user-data-dir` tạm trong `os.tmpdir()` (tách biệt hoàn toàn, không chạm save của Owner), sau đó giải phóng tiến trình Chrome và HTTP server:
- `[PASS]` `MainMenuScene` khởi động sạch.
- `[PASS]` Mở đầu (`startNewGame`), bấm `Space` bỏ qua Prologue cards và chuyển cảnh vào `GameScene` (`fog_crossing`) + `UIScene`.
- `[PASS]` 3 Micro-Hints kích hoạt đúng cờ (`hint_lantern_shown`, `hint_interact_shown`, `hint_journal_shown`).
- `[PASS]` `Save` (`handleSaveManual`) -> reload trang -> xuất hiện nút `Continue` -> `continueGame()` vào lại `GameScene` thành công.
- `[PASS]` Không có lỗi runtime hay console error phát sinh.

---

## 3. KẾT QUẢ VALIDATOR CHÍNH THỨC P2GAME

Lệnh: `npx p2game-validate ./dist --slug hollow-woods`
- **V1.6.0 (trên `feat/v1.6-competition-preview`):**
  `292 tệp · 79.5 MB · tải trọng khởi động 3.0 MB` — **`✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)`**
- **V1.5.5-R1 (baseline `0927971` + chỉ vá SE-004 ở `DevPanelOverlay.ts`, không chứa code Competition):**
  `292 tệp · 79.5 MB · tải trọng khởi động 3.0 MB` — **`✓ ĐẠT — sẵn sàng gửi kiểm duyệt (0 cảnh báo, 0 thông tin)`**

---

## 4. CÁC GÓI PHÁT HÀNH & BẢO TOÀN DỮ LIỆU

| Phiên bản | Đường dẫn | Kích thước | SHA-256 | Trạng thái |
|---|---|---|---|---|
| **V1.6.0 Competition Preview** | `release/p2game/hollow-woods-p2game-v1.6.0.zip` | 62,269,881 bytes | `59D88C2ECC837282D63856BC1E494EDB57E67A803C6571B0F0B59941709D951F` | ✅ Mới (đạt Validator) |
| **V1.5.5-R1 Fallback (SE-004 fixed)** | `release/p2game/hollow-woods-p2game-v1.5.5-r1.zip` | 62,427,643 bytes | `B76D033D0D5D609989B7E79732D45637566C71D7E9AF11912938C7903DDF5F4B` | ✅ Mới (đạt Validator) |
| **V1.5.5 gốc** | `release/p2game/hollow-woods-p2game-v1.5.5.zip` | 62,268,850 bytes | — | ✅ Bảo toàn |
| **V1.5.2 gốc** | `release/p2game/hollow-woods-p2game-v1.5.2.zip` | 62,268,811 bytes | — | ✅ Bảo toàn |

---

> ⚠️ **REVIEW GATE — DỪNG CHỜ OWNER NGHIỆM THU.**  
> Không tự merge `main`, không tự publish lên P2Game.
