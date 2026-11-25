# HW-H4-11A — THE ECHO SCREEN FLASH SETTINGS FIX REPORT

- **Project:** HOLLOW WOODS (`V1.5.4`)
- **Branch / Baseline SHA:** `feat/v1.5.3-ag-world-polish` / `c8f624f9c3e1410eef856b0e8934f7b0c21ac2cd`
- **Bug:** `H4-NEW-09`
- **Status:** `FIXED-PENDING-OWNER` *(Targeted fix verified locally; awaiting Owner approval/playtest)*
- **Git Commit / Push:** None (`0 git commit`, `0 git push` — Hard Stop respected)

---

## 1. Tái Hiện Trước Khi Sửa (`BEFORE` Evidence)

Kiểm chứng trực tiếp trên production `dist/` tại baseline `c8f624f9c3e1410eef856b0e8934f7b0c21ac2cd` ([hw_h4_11a_before.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-11A/hw_h4_11a_before.json)):

- **Screen Flash `OFF`, Reduced Motion `OFF` (`echo_crooked_tree`):** `flashCount_FlashOff = 1` (`bugReproduced_FlashOffEmittedFlash: true`), `composureDelta1 = -5`, `notices1 = 1`.
- **Screen Flash `ON`, Reduced Motion `ON` (`echo_mire_entrance`):** `flashCount_ReducedMotion = 1` (`bugReproduced_ReducedMotionEmittedFlash: true`), `notices2 = 1`.
- **Despawn mid-tween (`echo2.destroy()`):** `undestroyedBeforeEchoDestroy = 2` → `undestroyedAfterEchoDestroy = 2` (đồ họa `Graphics` phủ màn hình và tween `onComplete` bị bỏ lại không được dọn khi entity hủy sớm).

---

## 2. Nguyên Nhân Gốc & Giải Pháp (`src/entities/TheEcho.ts`)

1. **Nguyên nhân gốc:**
   - [TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts) (`L109-121` cũ) tạo trực tiếp `scene.add.graphics()` phủ `1280×720` (`0x2c3e50`, `alpha: 0.22`, `depth: 9999`) và tween mờ `300ms` mà không kiểm tra `SettingsManager.getInstance().isScreenFlashEnabled()` (vốn đã kết hợp cả `screenFlashEnabled && !isReducedMotionPreferred()`).
   - Ngoài ra, `flash` và tween chưa được theo dõi trên instance nên khi thực thể despawn / bị `destroy()` / scene shutdown hoặc kích hoạt lại, đối tượng đồ họa và callback `onComplete` không được dọn sạch.
2. **Sửa đổi mục tiêu duy nhất tại [TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts):**
   - **Backup trước sửa:** [Backups/steps/backup_hw_h4_11a/TheEcho.ts](file:///g:/HOLLOW%20WOODS/Backups/steps/backup_hw_h4_11a/TheEcho.ts) (`SHA256: EA260DDF011FEA272B4E55212AB0AC982EA2FBC5E3A22C3A2C59F82A11781DC4`)
   - **Sau sửa:** [src/entities/TheEcho.ts](file:///g:/HOLLOW%20WOODS/src/entities/TheEcho.ts) (`SHA256: 0EAE8021FFDE35E7FEBCE5FBBDBC2670E4A136276E406087175B05D254F00CFD`)
   - Chi tiết:
     - Import [SettingsManager](file:///g:/HOLLOW%20WOODS/src/systems/SettingsManager.ts#L269-L271) và tái sử dụng `SettingsManager.getInstance().isScreenFlashEnabled()`.
     - Trong `checkDirectGaze()`: guard `!this.active || !this.scene || !this.scene.sys?.isActive?.()`, giữ nguyên logic trừ `-5 Composure` & `onGazeNotice`, chỉ tạo overlay `0x2c3e50` (`0.22` alpha) khi `isScreenFlashEnabled()` là `true`, kèm `clearGazeFlash()` chống flash trùng lặp.
     - Trong `dissolve()` & `destroy()`: dọn `gazeFlashTween`, `gazeFlashGfx`, `dissolveTween` và `floatTween`, đồng thời guard `!this.active || !this.scene || !this.scene.sys?.isActive?.()` trong `dissolve()` `onComplete`.
   - Không chỉnh sửa `UIScene.ts`, `GameScene.ts`, `SettingsManager.ts`, `MireWardenBoss.ts`, hay Classic Sanity 2.1.

```diff
diff --git a/src/entities/TheEcho.ts b/src/entities/TheEcho.ts
index 63c148b..07b8152 100644
--- a/src/entities/TheEcho.ts
+++ b/src/entities/TheEcho.ts
@@ -1,6 +1,7 @@
 import * as Phaser from 'phaser';
 import { SPRITE_THE_ECHO } from '../config/Constants';
 import { PlayerState } from '../state/PlayerState';
+import { SettingsManager } from '../systems/SettingsManager';
 import { EchoSpec } from '../types';

@@ -19,6 +20,9 @@ export class TheEcho extends Phaser.GameObjects.Container {
   private auraGfx: Phaser.GameObjects.Graphics;
   private spriteObj?: Phaser.GameObjects.Image;
   private floatTween?: Phaser.Tweens.Tween;
+  private gazeFlashGfx?: Phaser.GameObjects.Graphics;
+  private gazeFlashTween?: Phaser.Tweens.Tween;
+  private dissolveTween?: Phaser.Tweens.Tween;

@@ -64,12 +68,26 @@ export class TheEcho extends Phaser.GameObjects.Container {
     scene.add.existing(this);
   }

+  private clearGazeFlash(): void {
+    if (this.gazeFlashTween) {
+      this.gazeFlashTween.stop();
+      this.gazeFlashTween.remove();
+      this.gazeFlashTween = undefined;
+    }
+    if (this.gazeFlashGfx) {
+      if (this.gazeFlashGfx.scene) {
+        this.gazeFlashGfx.destroy();
+      }
+      this.gazeFlashGfx = undefined;
+    }
+  }
+
   public checkDirectGaze(playerX: number, playerY: number, playerFacing: string, isLanternLit: boolean): boolean {
-    if (this.isDissolved) return false;
+    if (this.isDissolved || !this.active || !this.scene || !this.scene.sys?.isActive?.()) return false;

@@ -105,18 +123,22 @@ export class TheEcho extends Phaser.GameObjects.Container {
     PlayerState.getInstance().modifyComposure(-5);

-    // Hiệu ứng rùng mình thoáng qua
-    if (this.scene) {
+    // Hiệu ứng rùng mình thoáng qua — tuân thủ Screen Flash & Reduced Motion trong SettingsManager
+    if (this.scene && this.scene.sys?.isActive?.() && SettingsManager.getInstance().isScreenFlashEnabled()) {
+      this.clearGazeFlash();
       const flash = this.scene.add.graphics();
       flash.fillStyle(0x2c3e50, 0.22);
       flash.fillRect(0, 0, 1280, 720);
       flash.setScrollFactor(0);
       flash.setDepth(9999);
-      this.scene.tweens.add({
+      this.gazeFlashGfx = flash;
+      this.gazeFlashTween = this.scene.tweens.add({
         targets: flash,
         alpha: 0,
         duration: 300,
-        onComplete: () => flash.destroy()
+        onComplete: () => {
+          this.clearGazeFlash();
+        }
       });
     }
```

---

## 3. Kết Quả Kiểm Tra Sau Khi Sửa (`AFTER` & `BUG-023` Regression)

Bằng chứng lưu tại [hw_h4_11a_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-11A/hw_h4_11a_after.json) và [bug023_metrics_11a.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-11A/bug023_metrics_11a.json) trên production `dist/` mới (`dist/assets/index-DwGEtDJl.js`):

| Ca kiểm tra | Kết quả | Số liệu quan sát thực tế |
| --- | :---: | --- |
| `A01 — Screen Flash OFF` | **PASS** | `flashDelta = 0`, vẫn áp dụng `-5 Composure` và `noticeCount = 1` |
| `A02 — Screen Flash ON` | **PASS** | `flashDelta = 1` (`0x2c3e50`), re-trigger thay thế sạch (`undestroyedBeforeCleanup = 1` → `0` khi destroy) |
| `A03 — Reduced Motion ON` | **PASS** | `flashDelta = 0` dù `screenFlashEnabled = true`, gameplay `-5 Composure` giữ nguyên |
| `A04 — Runtime Settings Toggle` | **PASS** | `OFF -> ON -> OFF -> RM_ON` cho số lượng flash tương ứng `0 -> 1 -> 0 -> 0` |
| `A05 — Despawn & Scene Shutdown` | **PASS** | `checkDirectGaze` sau destroy trả `false`, `undestroyedAfterAllDespawns = 0`; `handleRestartGame()` giữa chừng flash tween tạo `0` console/page errors |
| `A06 — Classic Sanity 2.1 & BUG-023` | **PASS** | Sanity 11 (`activeLow=true, veilDrawn=false`) → 100 (`activeHigh=false`); `test_bug023_sanity_flash.py` đạt **15/15 PASS** (`exit code = 0`, `Console Errors: 0`) |
| `npm run check` (`tsc --noEmit`) | **PASS** | `exit code = 0` |
| `npm run build` (`tsc && vite build`) | **PASS** | `exit code = 0` (`dist/assets/index-DwGEtDJl.js`, `1,183.63 kB`) |
| `npm run verify:data` | **PASS** | `exit code = 0` (`15/15 PASS`) |
| `git diff --check` & `scripts/temp/` | **PASS** | `exit code = 0`, `scripts/temp/` trống (`0` tệp) |

---

## 4. Giới Hạn Còn Tồn Tại & Trạng Thái Registry

- Các hạt tàn tro nhỏ (`9` particle `2px` trong `dissolve()`) vẫn chạy tween tan biến tự nhiên khi tiếp xúc Echo (không phải Screen Flash); kiểm thử runtime thực hiện trên Headless Edge SwiftShader CPU và `test_bug023_sanity_flash.py` chạy qua wrapper chỉ fallback Chrome → Edge (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) trong thư mục scratch (không sửa file `scripts/test_bug023_sanity_flash.py` gốc).
- Đã cập nhật [V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md): `H4-NEW-09` chuyển sang **`FIXED-PENDING-OWNER`** (chờ Owner playtest xác nhận).
