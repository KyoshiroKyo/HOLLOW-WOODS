# HW-H4-12A — CRAFTING MODAL DOUBLE-TOGGLE INPUT FIX REPORT

- **Project:** HOLLOW WOODS (`Target: V1.5.4`)
- **Branch:** `feat/v1.5.3-ag-world-polish`
- **H4-11B Checkpoint SHA (Local & Remote):** `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d` (`fix(boss): clean up Mire Warden sonic roar timers and encounter lifecycle`)
- **Baseline SHA (`H4-12A`):** `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`
- **Bug:** `H4-NEW-04`
- **Status:** `FIXED-PENDING-OWNER` (`0 git commit`, `0 git push` cho `H4-12A` — chờ Owner duyệt)

---

## 1. Checkpoint `HW-H4-11B`

- Đã đối chiếu Git diff và toàn bộ bằng chứng `HW-H4-11B` (`B01–B10` `10/10 PASS`).
- Đã stage riêng 6 tệp của `HW-H4-11B` (`MireWardenBoss.ts`, `GameScene.ts`, `V153_TESTER_BUG_REGISTRY.md`, `HW_H4_11B_MIRE_WARDEN_TIMER_REPORT.md`, `hw_h4_11b_before.json`, `hw_h4_11b_after.json`), commit `fix(boss): clean up Mire Warden sonic roar timers and encounter lifecycle` và push thành công lên `origin/feat/v1.5.3-ag-world-polish`.
- `H4-11B LOCAL_SHA = REMOTE_SHA = 11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d` (`0 0`).

---

## 2. Hiện Tượng `BEFORE` & Nguyên Nhân Gốc

### 2.1 Tái hiện thực tế trên `11d91dd` (`hw_h4_12a_before.json`)
- **C01 (nhấn `KeyC` thật một lần khi `CraftingModal` đóng):** `afterKeyC = false`, `uiKeydownC = 3`, `toggleCount = 1`, `openCount = 1`, `closeCount = 1`. Call trace đo được:
  1. `12448.8ms`: DOM `keydown` (`code: "KeyC"`, `repeat: false`).
  2. `12449.0ms`: `UIScene.kb.emit(keydown-C)` (`listenerCount: 3`).
  3. `12449.5ms`: Listener #1 (`CraftingModal.ts:154`) gọi `CraftingModal.toggle()` → `open()` (`isOpen = true`).
  4. `12517.2ms`: Listener #3 (`UIScene.ts:857`) thấy `this.craftingModal.isOpen === true` nên gọi trực tiếp `this.craftingModal.close()` (bỏ qua debounce `250ms` của `toggle()`), làm bảng đóng ngay lập tức.
- **C03 (giữ `KeyC` / `repeat: true`):** Không chặn `event.repeat`, dẫn tới `toggleCount = 53`, `uiToggleCraftingCount = 26`, `afterHold = false`.
- **C06 (mở Journal `[J]` rồi nhấn `KeyC`):** `CraftingModal.open()` (`L1350`) đóng Journal rồi mở Crafting, sau đó listener `UIScene.ts:857` lại đóng luôn Crafting (`journalOpenAfterC = false`, `craftingOpenAfterC = false`).

### 2.2 Toàn bộ danh sách listener & đường gọi phím `[C]`
Trước khi sửa, phím `C` có **4 đường xử lý đồng thời**:
1. [CraftingModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/CraftingModal.ts#L154): `addKey('keydown-C', () => this.toggle())` (trên `UIScene.input.keyboard`, đăng ký tại `UIScene.ts:668`).
2. [JournalModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/JournalModal.ts#L376): `addKey('keydown-C', ...)` (trên `UIScene.input.keyboard`, đăng ký tại `UIScene.ts:669`).
3. [UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L857): `this.input.keyboard.on('keydown-C', ...)` (đã tự đóng `journalModal`/`tornPageModal`, chọn QuickSlot 5 và gọi `toggleCrafting()`).
4. [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L872): DOM `window` capture thêm `'craft'` cho `'KeyC'`, được `GameScene.ts:1970,2028` đọc ở `update()`.
- Ngoài ra, khi kiểm thử 10 chu kỳ nhanh (`C07`), ghi nhận cơ chế nội bộ của `Phaser.Input.Keyboard.KeyboardManager.queue` có thể phát lại cùng một tham chiếu `KeyboardEvent` (`keydown`) trong `KeyboardPlugin.update()` khi `keyup` đổi `prevType` trước `GameEvents.POST_STEP` (`KeyboardPlugin.js:777-801`, `KeyboardManager.js:262`).

---

## 3. Giải Pháp Mục Tiêu & Backup

- **Backup trước sửa (`Backups/steps/backup_hw_h4_12a/`):**
  - `CraftingModal.ts`: `SHA256 = 2FF9375C3F7D4D7AF30610D2FD90046FDF836CF28E70EB559DA9F6A454785AF0`
  - `JournalModal.ts`: `SHA256 = F78562B6ABB7511F05C9D8F332F60AA2C062FD26DFFCC089D31B71C0459A56C2`
  - `UIScene.ts`: `SHA256 = 4E1C8F621FF9B824F974630A75E0BC8F846456677AFD5DD4E4D9A34B791859C1`
  - `BlackKnightPlayer.ts`: `SHA256 = 5432C59DD06FEFB7372E418AE06B962107370F1F1F18E0AF974D9E326C374094`
- **Các file đã sửa (chỉ đúng hunk `H4-NEW-04`, bảo toàn tối ưu `H4-06`):**
  1. [src/ui/CraftingModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/CraftingModal.ts#L154) (`SHA256 = 0D2BE065901C0D78782B4365BB45625B696ED488BB57A66D5A8CC0162B5F6590`): Gỡ `addKey('keydown-C', () => this.toggle())`.
  2. [src/ui/JournalModal.ts](file:///g:/HOLLOW%20WOODS/src/ui/JournalModal.ts#L375) (`SHA256 = 404A6B8E52912B9676D00D85ADBDB24DA2B6B66EFC78CF7EC519863B83CAC7DE`): Gỡ `addKey('keydown-C', ...)` trùng (đã được `UIScene` xử lý đồng bộ).
  3. [src/entities/BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L872) (`SHA256 = BF90EFF229AE6499A83D971B1B586D77DA3F6E40CC7866181F84FD47B0F1A723`): Gỡ `'KeyC'` khỏi nhánh thêm `pendingOneShotActions.add('craft')` (giữ `'KeyI'`, `'Tab'`).
  4. [src/scenes/UIScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/UIScene.ts#L856-L873) (`SHA256 = 037472D70CD46FF1D2F9EFD5CE60CF438B88BBB0937B869307F90366BD6755B3`): Quy về **một handler `keydown-C` duy nhất** tại `UIScene`, lọc `event === lastKeyCEvent` (chống replay từ `KeyboardManager.queue`), lọc `event.repeat` (chống giữ phím) và guard `gameOverModal?.isOpen`.

---

## 4. Bảng So Sánh `BEFORE` / `AFTER` (`C01–C12` + `SMOKE_UI`)

Bằng chứng: [hw_h4_12a_before.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-12A/hw_h4_12a_before.json) · [hw_h4_12a_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-12A/hw_h4_12a_after.json) · Ảnh: [before_c01_after_keyC.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-12A/before_c01_after_keyC.png) vs [after_c01_after_keyC.png](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-12A/after_c01_after_keyC.png).

| Ca | Phân loại thao tác | `BEFORE` (`11d91dd`) | `AFTER` (bản sửa hiện tại) | Kết quả |
| --- | --- | --- | --- | :---: |
| `C01` | `REAL-KEYBOARD` (nhấn `KeyC` khi đóng) | **FAIL:** `uiKeydownC=3`, `open=1, close=1`, `afterKeyC=false` | `uiKeydownC=1`, `gsKeydownC=0`, `toggle=1, open=1, close=0`, `afterKeyC=true`, `craftingVisible=true`, `focusTag=CANVAS` | **PASS** |
| `C02` | `REAL-KEYBOARD` (nhấn `KeyC` khi mở) | `beforeOpen=true`, `afterOpen=false` | `close=1, open=0`, `afterOpen=false`, `isAnyModalOpen=false`, `movedRight=true` (`800 -> 826.9`) | **PASS** |
| `C03` | `REAL-KEYBOARD + REPEAT` (giữ `KeyC` + `repeat:true`) | **FAIL:** `toggle=53`, `afterHold=false` | `domEvents` có 1 `repeat:false` + 6 `repeat:true`, `toggle=1, open=1, close=0`, `afterHold=true` | **PASS** |
| `C04` | `REAL-MOUSE` (click nút Taskbar Craft) | `open=1, close=0`, `afterMouse=true` | `open=1, close=0`, `afterMouse=true` | **PASS** |
| `C05` | `REAL-INPUT` (đóng bằng `ESC` & nút `[X]`) | `afterEsc=false`, `afterCloseBtn=false` | `afterEscOpen=false`, `afterCloseBtnOpen=false`, `movedRight=true` | **PASS** |
| `C06` | `REAL-KEYBOARD` (mở `[J]` rồi nhấn `KeyC`) | **FAIL:** `journalOpenAfterC=false`, `craftingOpenAfterC=false` | `journalOpenBeforeC=true`, `journalOpenAfterC=false`, `craftingOpenAfterC=true`, `open=1, close=0` | **PASS** |
| `C07` | `REAL-KEYBOARD` (`10` chu kỳ mở/đóng `KeyC`) | — | `10/10` chu kỳ PASS (`openCount=10, closeCount=10, toggleCount=10`, `0` lỗi) | **PASS** |
| `C08` | `REAL-INPUT` (mở chuột/đóng `C` & mở `C`/đóng chuột) | — | `openMouse=true, closeKeyC=true, openKeyC=true, closeMouse=true` | **PASS** |
| `C09` | `STAGED-INTEGRATION` (chế tạo `craft_lantern_oil` đủ đồ) | — | `oil: 0 -> 1`, `res_tree_resin: 4 -> 3`, `res_dry_wood: 4 -> 3`, đóng `[C]` sạch | **PASS** |
| `C10` | `STAGED-INTEGRATION` (chế tạo thiếu đồ) | — | `oilAfter=0`, `invUnchanged=true` | **PASS** |
| `C11` | `REAL-KEYBOARD` (Pause/Resume & `blur`/`focus` → `KeyC`) | — | `pauseOpened=true, pauseClosed=true, craftingOpenAfterC=true, open=1, close=0` | **PASS** |
| `C12` | `REAL-KEYBOARD` (Restart `GameScene`/`UIScene` 2 lần → `KeyC`) | — | `uiKeydownC=1` ổn định qua 3 lần chạy (`1 -> 1 -> 1`), `gsKeydownC=0`, `open=1, close=0` | **PASS** |
| `SMOKE_UI` | Quickbar, Equipment `[B]`, Journal `[J]`, Map `[N]`, Pause `[ESC]`, `H4-06` | — | `equipOpenB=true`, `journalOpenJ=true`, `worldMapOpenN=true`, `pauseOpenEsc=true`, `pauseClosedEsc=true`, `H4-06` QuickCraft/baked textures nguyên vẹn, `0` lỗi *(Ghi nhận `[M]` vẫn `worldMapOpenM=false` do `H4-NEW-05` chưa sửa)* | **PASS** |

---

## 5. Kết Quả Build, Kiểm Tra Dữ Liệu & Script Tĩnh

- **TypeScript (`npm run check`):** Exit **`0`** (`0` lỗi).
- **Production Build (`npm run build`):** Exit **`0`**, tạo `dist/assets/index-FGtorazy.js` (`1,186.59 kB`).
- **Verify Data (`npm run verify:data`):** Exit **`0`** (`15/15 PASS`).
- **Console / Page Errors (`C01–C12` & `SMOKE_UI`):** **`0` / `0`**.
- **`git diff --check` & `scripts/temp/`:** Exit **`0`**, `scripts/temp/` trống (`0` tệp).
- **Ghi chú script tĩnh V1.5.x kế thừa:** Các script grep tĩnh lịch sử (`test_v15_50a` `13/15`, `test_v15_50b` chưa đạt toàn bộ chuỗi tĩnh `CraftingModal`, `test_v15_26` `25/29`, `test_v152_06b` `23/25`, `test_v15_44` `11/17`) chứa các kỳ vọng chuỗi cũ từ V1.5.2/V1.5.0B/V15-44 (bao gồm chính assertion cũ của `V15-44` yêu cầu `JournalModal` giữ `addKey('keydown-C', ...)` và chữ `[✕ I / ESC] Đóng`). Theo quy chuẩn, giữ nguyên các test lịch sử đó không sửa để ép PASS.

---

## 6. Giới Hạn & Ghi Nhận Ngoài Phạm Vi

- Kiểm thử trình duyệt chạy trên Headless Edge SwiftShader CPU với QA Bellhollow save fixture độc lập.
- Phím `[I]` (`keydown-I`) vẫn giữ hành vi hiện hành và **không** sửa đổi trong nhiệm vụ này do phạm vi `H4-NEW-04` chỉ định sửa duy nhất phím `[C]`.
- Phím `[M]` (`H4-NEW-05`, quan sát trong `SMOKE_UI`: `worldMapOpenM = false`) và `isRolling()` trong `GameScene.ts:7057` tiếp tục được giữ nguyên cho nhiệm vụ riêng theo quy tắc Phase 2.
- **Registry ([V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md)):** Đã cập nhật `H4-NEW-04` sang **`FIXED-PENDING-OWNER`** (chờ Owner duyệt).
