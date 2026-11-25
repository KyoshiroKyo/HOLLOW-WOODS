# HW-H4-11B — MIRE WARDEN SONIC ROAR TIMER LIFECYCLE FIX REPORT

- **Project:** HOLLOW WOODS (`Target: V1.5.4`)
- **Branch:** `feat/v1.5.3-ag-world-polish`
- **H4-11A Checkpoint SHA (Local & Remote):** `9f0f72c65c076fd381a3381b167c52b0dc8bed98` (`fix(echo): respect screen flash settings and clean up effect lifecycle`)
- **Baseline SHA (`H4-11B`):** `9f0f72c65c076fd381a3381b167c52b0dc8bed98`
- **Bug:** `H4-NEW-08`
- **Verification Classification:** `STAGED-INTEGRATION` (Production `dist/`, QA save fixture độc lập nạp qua Main Menu **TIẾP TỤC HÀNH TRÌNH**, đi bộ vào `broken_bell_shrine` kích hoạt boss, kết hợp probe đo timer/callback/graphics)
- **Status:** `FIXED-PENDING-OWNER` (`0 git commit`, `0 git push` cho `H4-11B` — chờ Owner duyệt)

---

## 1. Checkpoint `HW-H4-11A`

- Đã đối chiếu diff và toàn bộ bằng chứng `HW-H4-11A` trước khi sửa `H4-11B`.
- Đã stage riêng 6 tệp thuộc `HW-H4-11A` (`src/entities/TheEcho.ts`, `Read/V1.5/Reports/HW_H4_11A_ECHO_SCREEN_FLASH_REPORT.md`, 3 JSON trong `Read/V1.5/Reports/Evidence/HW-H4-11A/`, `Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md`).
- Commit & Push thành công lên `origin/feat/v1.5.3-ag-world-polish`:
  - `LOCAL_SHA = REMOTE_SHA = 9f0f72c65c076fd381a3381b167c52b0dc8bed98` (`0 0`).
  - Bảo toàn đầy đủ `H4-06`, `H4-07`, `H4-08`, `H4-11A`, `BUG-058`/`059` và toàn bộ tệp untracked của Owner.

---

## 2. Nguyên Nhân Gốc

1. **Vòng đời timer & Graphics trong [MireWardenBoss.ts](file:///g:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts#L386-L434):**
   - `triggerSonicRoar()` tạo `shockGfx` (`scene.add.graphics()`) và 3 `TimerEvent` (`this.scene.time.addEvent({ delay: 20, repeat: 25 })`, `delayedCall(500)`, `delayedCall(900)`) nhưng không lưu tham chiếu trên instance.
   - Không có phương thức `destroy()` trên `MireWardenBoss` và `defeat()` không dừng Sonic Roar đang chạy:
     - Khi `boss.destroy()` xảy ra giữa chừng (`B02`), `shockGfx` không bị hủy, sóng âm tiếp tục tick thêm `20` lần, `delayedCall(500)` vẫn gọi `onHitPlayerCallback()`, và `delayedCall(900)` gọi `this.bossSprite.play(...)` trên sprite đã hủy gây `TypeError: Cannot read properties of undefined (reading 'play')`.
     - Khi `boss.defeat()` xảy ra giữa chừng (`B03`), `isRoaring` vẫn giữ `true`, `shockGfx` vẫn tồn tại, sóng âm chạy tiếp `20` lần và `onHitPlayerCallback()` vẫn bắn vào người chơi sau khi boss đã `DEFEATED`.
   - Callback của `startBossFight()`, `applySeal()`, `enterPhase2()` cũng thiếu guard `!this.isEntityAndSceneActive()` / `DEFEATED`.
2. **Vòng đời `GameScene` khi Restart (`B05` & `B07`):**
   - Trong [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts), `init()` (`L253-294`) và `shutdown` (`L854-993`) chưa reset `this.isBossFightActive`, `this.mireWardenBoss`, `bossArenaBarrier`, `bossArenaEchoes`, `runePillarTargets`, `brazierTargets` và `BossEncounterSystem.getInstance().reset()`. Hệ quả ở `BEFORE` (`B05`) là sau `handleRestartGame()`, phiên chơi mới ở `fog_crossing` vẫn mang `isBossFightActive = true` và `mireWardenBoss` trỏ tới instance cũ đã hủy (`active = false`), ngăn boss spawn lại ở phiên mới.

---

## 3. Bảng So Sánh `BEFORE` / `AFTER` (`B01–B10`)

Bằng chứng gốc: [hw_h4_11b_before.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-11B/hw_h4_11b_before.json) · [hw_h4_11b_after.json](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-H4-11B/hw_h4_11b_after.json).

| Ca | Mô tả | `BEFORE` (`9f0f72c`) | `AFTER` (bản sửa hiện tại) | Kết quả |
| --- | --- | --- | --- | :---: |
| `B01` | Sonic Roar khi boss còn active | 3 timer tạo, 26 wave ticks, 0 active cuối *(fail điều kiện HP do `GameScene.ts:7057` xem mục 8)* | `3` timer tạo, `26` wave ticks, `delayed_500` & `delayed_900` thực thi sạch, `timersActiveAfter = 0`, `undestroyedGfx = 0`, `isRoaring = false`, `0` lỗi | **PASS** |
| `B02` | `boss.destroy()` giữa chừng Sonic Roar | **FAIL:** `activeTimersRightAfterDestroy = 3`, `undestroyedGfxRightAfterDestroy = 1`, `ticksAfterDestroy = 20`, `hitCallbacksAfterDestroy = 1`, crash `TypeError: Cannot read properties of undefined (reading 'play')` | `activeTimersRightAfterDestroy = 0`, `undestroyedGfxRightAfterDestroy = 0`, `ticksAfterDestroy = 0`, `hitCallbacksAfterDestroy = 0`, `delayedCallbacksExecuted = []`, `0` lỗi | **PASS** |
| `B03` | `boss.defeat()` giữa chừng Sonic Roar | **FAIL:** `activeTimersRightAfterDefeat = 3`, `undestroyedGfxRightAfterDefeat = 1`, `isRoaringAfterDefeat = true`, `ticksAfterDefeat = 20`, `hitCallbacksAfterDefeat = 1` | `activeTimersRightAfterDefeat = 0`, `undestroyedGfxRightAfterDefeat = 0`, `isRoaringAfterDefeat = false`, `ticksAfterDefeat = 0`, `hitCallbacksAfterDefeat = 0`, `bossStateFinal = 'DEFEATED'`, `0` lỗi | **PASS** |
| `B04` | `GameScene` shutdown trước khi callback chạy | **PASS:** `gameSceneActiveAfter = false`, `0` ticks/hits sau shutdown | `gameSceneActiveAfter = false`, `ticksAfterShutdown = 0`, `hitCallbacksAfterShutdown = 0`, `sonicTimersActive = 0`, `undestroyedGfx = 0`, `0` lỗi | **PASS** |
| `B05` | Restart `GameScene` giữa chừng Sonic Roar | **FAIL:** Sau restart vẫn giữ `isBossFightActive = true` & `mireWardenBossIsNull = false` (`mireWardenBossActive = false`) | `gameSceneActive = true`, `isBossFightActive = false`, `mireWardenBossIsNull = true`, `oldBossActive = false`, `hitCalls = 0`, `ticksAfterRestart = 0`, `undestroyedGfx = 0`, `0` lỗi | **PASS** |
| `B06` | Kích hoạt Sonic Roar nhiều lần & chống gọi trùng | **PASS:** `3` timers/lần, bỏ qua gọi đúp khi đang `isRoaring`, tổng `2` hit hợp lệ qua 2 chu kỳ | `timersRightAfterDoubleCall = 3`, `hitAfterCycle1 = 1`, `activeAfterCycle1 = 0`, `hitTotalAfter2Cycles = 2`, `timersCreatedTotal = 6`, `sonicTimersActive = 0`, `undestroyedGfx = 0`, `0` lỗi | **PASS** |
| `B07` | Boss xuất hiện lại ở phiên mới sau restart | — | `isNewInstance = true`, `newBossActive = true`, `oldHits = 0`, `newHits = 1`, `newBossIsRoaring = false`, `0` lỗi | **PASS** |
| `B08` | Lặp `10` chu kỳ lifecycle (5 hoàn tất + 5 destroy) | — | `validHits = 5`, `cancelledHits = 0`, `sonicTimersCreated = 30`, `sonicTimersActive = 0`, `undestroyedGfx = 0`, `0` lỗi | **PASS** |
| `B09` | Đặc tả Sonic Roar (trạng thái, 26 tick, 500ms/900ms) | — | `isRoaringDuring = true`, `spyHits = 1`, `waveTicks = 26`, `isRoaringAfter = false`, `stateAfter = 'STALK'`, `sonicTimerAfter = 8867.81ms`, `0` lỗi | **PASS** |
| `B10` | Kết thúc trận đấu (`takeDamage -> defeat`) & phần thưởng | — | `bossHp = 0`, `bossState = 'DEFEATED'`, `delayedCallbacksExecuted = []`, `hpAfterWait = 100`, `boss_mire_warden_defeated`, `root_seal_restored`, `title_purifier_of_mist`, `quest_bronze_clapper = 1`, `relic_heart_of_roots = 2` (`OPEN-01` bảo toàn), `lore_mire_warden_memory = true`, `0` lỗi | **PASS** |

---

## 4. Kiến Trúc Timer Lifecycle Sau Sửa

1. **Theo dõi tập trung trên `MireWardenBoss`:** `sonicRoarWaveTimer`, `sonicRoarHitTimer`, `sonicRoarEndTimer`, `sonicShockGfx`.
2. **Dọn đồng bộ (`cleanupSonicRoar()`):** gọi `scene.time.removeEvent(timer)` + `timer.remove(false)` cho cả 3 timer, destroy `sonicShockGfx` nếu còn gắn `scene`, và đặt `isRoaring = false`.
3. **Các điểm thu hồi tự động:**
   - Khi `defeat()` chạy (`currentState = 'DEFEATED'`), gọi `cleanupSonicRoar()` để dừng mọi đòn sóng âm còn dở nhưng vẫn giữ nguyên `anim_boss_wetlands_death` và tween fade chiến thắng.
   - Khi `destroy(fromScene?)` chạy, gọi `cleanupSonicRoar()`, gỡ listener `Phaser.Scenes.Events.SHUTDOWN`, hủy tweens trên entity / `auraGfx` / `invulnerableContainer` rồi `super.destroy(fromScene)`.
   - Khi `Phaser.Scenes.Events.SHUTDOWN` kích hoạt (`onSceneShutdown()`), dọn `cleanupSonicRoar()`.
4. **Guard trạng thái trong callback:** `isEntityAndSceneActive()` (`this.active && this.scene && this.scene.sys?.isActive?.()`) cùng kiểm tra `currentState !== 'DEFEATED'` và `this.isRoaring` trước khi vẽ sóng âm, kích hoạt `onHitPlayerCallback()`, hoặc chuyển animation `bossSprite`.
5. **Reset vòng đời tại `GameScene.init()` & `shutdown`:** dọn và đưa `mireWardenBoss = null`, `isBossFightActive = false`, barrier/pillars/braziers/echoes về mặc định và gọi `BossEncounterSystem.getInstance().reset()`.

---

## 5. File Đã Sửa, Sao Lưu & Git Diff

- **Backup trước sửa (`Backups/steps/backup_hw_h4_11b/`):**
  - `MireWardenBoss.ts`: `SHA256 = 7266A66F0C833618F46D0A773D4885CE2EC9417A6FCD1A27697F0EF59873AE83`
  - `GameScene.ts`: `SHA256 = 86A3156ECF025251A7E86E725CD80A00616471BCAF9A0873320DD04207B79DF3`
- **File mã nguồn sau sửa:**
  - [src/entities/MireWardenBoss.ts](file:///g:/HOLLOW%20WOODS/src/entities/MireWardenBoss.ts) (`SHA256 = 906F6127706115C3B670983FC3D5154CB486273FCAADC96F3648600002C23738`) — `constructor`, `isEntityAndSceneActive()`, `onSceneShutdown()`, `clearTimerEvent()`, `cleanupSonicRoar()`, `startBossFight()`, `triggerSonicRoar()`, `applySeal()`, `enterPhase2()`, `defeat()`, `destroy()`.
  - [src/scenes/GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts) (`SHA256 = 1BAFE4FFA16DC72F92F79B1A494CF7304C419C6D8C9718819EA9459E172DDF77`) — bổ sung reset `mireWardenBoss` / `isBossFightActive` / arena targets & `BossEncounterSystem.reset()` trong `init()` & `shutdown`.

```diff
diff --git a/src/entities/MireWardenBoss.ts b/src/entities/MireWardenBoss.ts
index 78c6d26..052f15d 100644
--- a/src/entities/MireWardenBoss.ts
+++ b/src/entities/MireWardenBoss.ts
@@ -68,6 +68,10 @@ export class MireWardenBoss extends Phaser.GameObjects.Container {
   public sonicAttackTimer: number = 6000;
   public isRoaring: boolean = false;
+  private sonicRoarWaveTimer?: Phaser.Time.TimerEvent;
+  private sonicRoarHitTimer?: Phaser.Time.TimerEvent;
+  private sonicRoarEndTimer?: Phaser.Time.TimerEvent;
+  private sonicShockGfx?: Phaser.GameObjects.Graphics;
@@ -133,6 +137,38 @@ export class MireWardenBoss extends Phaser.GameObjects.Container {
     this.setVisible(false);
+    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
   }
+  private isEntityAndSceneActive(): boolean { ... }
+  private onSceneShutdown(): void { this.cleanupSonicRoar(); }
+  private clearTimerEvent(timer?: Phaser.Time.TimerEvent): undefined { ... }
+  private cleanupSonicRoar(): void { ... }
@@ -384,28 +421,43 @@ export class MireWardenBoss extends Phaser.GameObjects.Container {
   public triggerSonicRoar(onHitPlayerCallback?: () => void): void { ... }
@@ -525,21 +594,44 @@ export class MireWardenBoss extends Phaser.GameObjects.Container {
   public defeat(): void { ... }
+  public destroy(fromScene?: boolean): void { ... }

diff --git a/src/scenes/GameScene.ts b/src/scenes/GameScene.ts
index a47bf30..9158340 100644
--- a/src/scenes/GameScene.ts
+++ b/src/scenes/GameScene.ts
@@ -291,6 +291,20 @@ export class GameScene extends Phaser.Scene {
+    // HW-H4-11B: Reset trạng thái đấu trùm Mire Warden khi init/restart GameScene
@@ -917,6 +931,30 @@ export class GameScene extends Phaser.Scene {
+    // Cleanup mireWardenBoss, arena targets, BossEncounterSystem.reset() trong shutdown
```

---

## 6. Kiểm Tra Build, Dữ Liệu & Hồi Quy

- **TypeScript (`npm run check`):** Exit **`0`** (`0` lỗi).
- **Production Build (`npm run build`):** Exit **`0`** (`dist/assets/index-BT-nbxak.js`, `1,186.67 kB`).
- **Verify Data (`npm run verify:data`):** Exit **`0`** (`15/15 PASS`).
- **`git diff --check` & `scripts/temp/`:** Exit **`0`**, `scripts/temp/` trống (`0` tệp).
- **Console Errors / Page Errors (`B01–B10`):** **`0` / `0`**.
- **Targeted Legacy Static Boss Scripts:**
  - `scripts/test_v15_46_boss_pillar_damage_and_free_break.mjs`: **22/22 PASS** (exit `0`).
  - `scripts/test_v15_42_wetlands_boss_sprite.mjs` (`25/27`: 2 fail lịch sử V1.5.2 trên `GameScene.ts` — `distP <= 48` đã thành `65`, hồi sinh `2360,720` đã thành `1420,710`; 5/5 check `MireWardenBoss.ts` PASS).
  - `scripts/test_v15_45_boss_shrine_guidance.mjs` (`12/14`: 2 fail chuỗi tĩnh trên `GameScene.ts`; toàn bộ check `MireWardenBoss` & `handleBossSonicRoar` PASS).
  - `scripts/test_v15_47_boss_composure_assault_and_zero_mechanics.mjs` (`26/28`: 2 fail chuỗi tĩnh trên `UIScene.ts` từ refactor HUD; toàn bộ check `MireWardenBoss` & Sonic Roar PASS).

---

## 7. Những Giới Hạn Còn Tồn Tại & Phát Hiện Báo Owner

1. **Phân loại kiểm thử:** Toàn bộ `B01–B10` chạy dưới dạng `STAGED-INTEGRATION` trên Headless Edge SwiftShader CPU (`route.fulfill` rỗng cho script ngoài `p2game`) để cô lập vòng đời timer/callback.
2. **Phát hiện tách riêng (KHÔNG sửa trong `HW-H4-11B` theo quy tắc không đổi độ khó/sát thương boss):**
   - Tại [GameScene.ts](file:///g:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L7057), `handleBossSonicRoar()` viết `const isRolling = (this.player as any).isRolling || false;`. Vì [BlackKnightPlayer.ts](file:///g:/HOLLOW%20WOODS/src/entities/BlackKnightPlayer.ts#L1665) định nghĩa `isRolling(): boolean` là **phương thức** chứ không phải thuộc tính boolean, biểu thức `(this.player as any).isRolling` luôn là tham chiếu hàm (`truthy`), làm `if (!isRolling)` không bao giờ chạy nhánh trừ `-12 HP / -20 Composure` khi người chơi đứng trong tầm `155px`. Vấn đề này nằm ngoài phạm vi timer lifecycle `H4-NEW-08`, được giữ nguyên nguyên trạng và báo riêng cho Owner quyết định mở task xử lý nếu muốn khôi phục sát thương thực của Sonic Roar.
3. **Trạng thái Registry:** Đã tách và cập nhật `H4-NEW-08` thành **`FIXED-PENDING-OWNER`** trong [V153_TESTER_BUG_REGISTRY.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/Reports/V153_TESTER_BUG_REGISTRY.md) (giữ `HW-H4-03-AUDIT` ở `OPEN`).
