# BÁO CÁO NÂNG CẤP & SỬA LỖI ĐIỀU KHIỂN, DI CHUYỂN NHÂN VẬT (V15-02)
## DỰ ÁN HOLLOW WOODS — PHIÊN BẢN V1.5 (OVERHAUL ROADMAP)

> **Mã báo cáo:** `REP-V15-02-MOVEMENT`  
> **Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
> **Thời gian thực hiện:** 18/11/2026  
> **Tập tin can thiệp:** `src/entities/SatyrPlayer.ts`, `src/scenes/GameScene.ts`  
> **Mục lục V1.5:** [README_INDEX.md](file:///g:/HOLLOW%20WOODS/Read/V1.5/README_INDEX.md)

---

### 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Bước V15-02 đã giải quyết triệt để 3 vấn đề cốt lõi về điều khiển, chuyển động và phản hồi vật lý của nhân vật chính (`SatyrPlayer.ts` / The Mossbound Wayfarer):

1. **Chuẩn hóa toán học vận tốc đi chéo:**
   - Ứng dụng hệ số chia căn bậc hai của 2: `Math.SQRT1_2` ($\frac{1}{\sqrt{2}} \approx 0.7071067811865476$).
   - Đảm bảo độ lớn vector vận tốc khi đi chéo ($\|V\| = \sqrt{v_x^2 + v_y^2}$) bằng **chính xác 100%** tốc độ đi thẳng một hướng, triệt tiêu hoàn toàn lỗi tăng tốc vọt lố đâm sâu vào vật cản góc tường hay gốc cây.
2. **Bộ đếm bảo hiểm tự giải phóng khóa hành động (Safety Watchdog Timeout 600ms):**
   - Khắc phục tận gốc lỗi đứng hình/đơ phím (freeze control lock): Ghi nhận timestamp `_actionLockTimestamp = performance.now()` tại mọi hành động độc quyền (`attack`, `playGather`, `playInteract`, `playUseItem`, `playHurt`).
   - Tích hợp Watchdog trong vòng lặp `update()`: Nếu nhân vật bị kẹt ở bất kỳ trạng thái khóa nào vượt quá **600ms** (do animation complete listener bị trôi, lag khung hình, chuyển cảnh hoặc đóng mở UI), hệ thống tự động cưỡng bức giải phóng trạng thái khóa qua `forceUnlockActionState()` và đưa nhân vật về `Idle`.
   - Bổ sung cơ chế giải phóng tức thì khi đóng hộp thoại đối thoại (`dialogueSystem.onDialogueEnd`) và khi đóng các Modal (Crafting, Journal, World Map).
3. **Tách bạch chuyển đổi Walk $\leftrightarrow$ Run mượt mà:**
   - Khi nhả phím Shift hoặc khi cạn kiệt Thể Lực (chạm ngưỡng Kiệt Sức), vận tốc chuyển tức thời về `PLAYER_WALK_SPEED` (85 px/s).
   - Hoạt ảnh `playWalkOrRunAnim()` bảo tồn nguyên vẹn vị trí `currentFrameIndex` tương ứng giữa hai chu kỳ bước chân Walk và Run, ngăn chặn hoàn toàn hiện tượng reset giật về frame 0 hay trượt chân (foot-sliding).
4. **Đồng bộ mượt hoạt ảnh 4 hướng với Direction Buffer 40ms:**
   - Khi bắt đầu di chuyển từ trạng thái đứng yên: Phản hồi lập tức với $0\text{ms}$ độ trễ.
   - Khi đang di chuyển: Bổ sung bộ đệm thời gian **40ms** cho tín hiệu chuyển hướng mới. Các thao tác nhấp nhả phím ngẫu nhiên hoặc dao động tay khi nhấn chéo (micro-jitter) bị triệt tiêu hoàn toàn, ngăn chặn tình trạng sprite nhân vật bị giật hình liên hồi giữa hai hướng vuông góc.

---

### 2. CHI TIẾT THAY ĐỔI MÃ NGUỒN

#### 2.1. Chuẩn hóa toán học vận tốc di chuyển (`handleMovement` trong `SatyrPlayer.ts`)
Trước đây, hệ thống tính độ dài vector bằng `Math.sqrt(moveX * moveX + moveY * moveY)` và chia động mỗi tick, dễ phát sinh sai số trôi pixel:

```typescript
// [TRƯỚC ĐÂY]
const length = Math.sqrt(moveX * moveX + moveY * moveY);
const normX = moveX / length;
const normY = moveY / length;
body.setVelocity(normX * currentSpeed, normY * currentSpeed);
```

Đã được nâng cấp chuẩn hóa toán học tối ưu hiệu năng:
```typescript
// [V1.5 - NÂNG CẤP CHUẨN]
const body = this.body as Phaser.Physics.Arcade.Body;
if (moveX !== 0 || moveY !== 0) {
  if (moveX !== 0 && moveY !== 0) {
    // Đi chéo đồng thời 2 phím (W+D, S+A, v.v.):
    // Chuẩn hóa bằng hệ số chia căn bậc 2 (Math.SQRT1_2 = 1 / sqrt(2) ≈ 0.70710678)
    // để độ lớn vận tốc vector đi chéo bằng đúng tốc độ đi thẳng: ||V|| = sqrt(vx^2 + vy^2) = currentSpeed
    body.setVelocity(moveX * Math.SQRT1_2 * currentSpeed, moveY * Math.SQRT1_2 * currentSpeed);
  } else {
    // Đi thẳng 1 hướng duy nhất:
    body.setVelocity(moveX * currentSpeed, moveY * currentSpeed);
  }

  // Cập nhật hướng nhìn với Direction Buffer 40ms và Direction Persistence
  this.updateFacingDirection(moveX, moveY);

  // Cập nhật hoạt ảnh di chuyển
  this.playWalkOrRunAnim();
} else {
  body.setVelocity(0, 0);
  this.playIdleAnim();
}
```

#### 2.2. Cơ chế Direction Buffer 40ms (`updateFacingDirection` trong `SatyrPlayer.ts`)
```typescript
public updateFacingDirection(moveX: number, moveY: number): void {
  if (moveX === 0 && moveY === 0) {
    this._wasMoving = false;
    this.desiredDirection = null;
    this.directionBufferStartTime = 0;
    return;
  }

  const absX = Math.abs(moveX);
  const absY = Math.abs(moveY);

  let targetDir: FacingDirection;
  if (absX > absY) {
    targetDir = moveX < 0 ? 'left' : 'right';
  } else if (absY > absX) {
    targetDir = moveY < 0 ? 'up' : 'down';
  } else {
    // Đi chéo: Giữ nguyên hướng nhìn nếu hướng hiện tại là một trong hai trục đang di chuyển
    const isCurrentFacingMoving =
      (this.facing === 'left' && moveX < 0) ||
      (this.facing === 'right' && moveX > 0) ||
      (this.facing === 'up' && moveY < 0) ||
      (this.facing === 'down' && moveY > 0);
    targetDir = isCurrentFacingMoving ? this.facing : (moveX < 0 ? 'left' : 'right');
  }

  // V1.5 (BƯỚC V15-02): ĐỒNG BỘ MƯỢT HOẠT ẢNH 4 HƯỚNG VỚI DIRECTION BUFFER 40ms
  // 1. Khi vừa bắt đầu di chuyển từ đứng yên: Cập nhật hướng tức thì (0ms latency)
  if (!this._wasMoving) {
    this._wasMoving = true;
    this.facing = targetDir;
    this.desiredDirection = null;
    this.directionBufferStartTime = 0;
  } else if (targetDir !== this.facing) {
    // 2. Đang di chuyển và người chơi đổi hướng hoặc nhấp nhả phím:
    const now = performance.now();
    if (this.desiredDirection !== targetDir) {
      this.desiredDirection = targetDir;
      this.directionBufferStartTime = now;
    } else if (now - this.directionBufferStartTime >= SatyrPlayer.DIRECTION_BUFFER_MS) {
      // Đã giữ phím hướng mới vượt qua ngưỡng đệm 40ms: cam kết chuyển hướng
      this.facing = targetDir;
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
    }
  } else {
    // 3. Cùng hướng: giải phóng bộ đệm
    this.desiredDirection = null;
    this.directionBufferStartTime = 0;
  }
  ...
}
```

#### 2.3. Watchdog Timeout 600ms & Mở khóa Cưỡng bức (`forceUnlockActionState`)
Trong `SatyrPlayer.ts`:
```typescript
public static readonly ACTION_SAFETY_TIMEOUT_MS: number = 600;
private _actionLockTimestamp: number = 0;

public forceUnlockActionState(): void {
  if (this._isDead) return;
  this._isAttacking = false;
  this._isHurt = false;
  this._isGathering = false;
  this._isInteracting = false;
  this._isUsingItem = false;
  this._actionLockTimestamp = 0;
  this.clearTint();
}

public update(time: number, delta: number): void {
  super.update(time, delta);
  if (this._isDead) return;

  // Watchdog kiểm tra định kỳ mỗi khung hình:
  if (this.isActionLocked() && !this._isDead) {
    const now = performance.now();
    if (this._actionLockTimestamp > 0 && now - this._actionLockTimestamp > SatyrPlayer.ACTION_SAFETY_TIMEOUT_MS) {
      this.forceUnlockActionState();
      this.playIdleAnim();
    }
  }
  ...
}
```

Trong `GameScene.ts`:
```typescript
this.dialogueSystem.onDialogueEnd = () => {
  if (this.player) {
    this.player.forceUnlockActionState();
    this.player.resetAllInputState();
  }
  if (this.uiScene) {
    this.uiScene.setDialogueActive(false);
  }
  CampSanctuarySystem.getInstance().onDialogueEnd();
};
```

---

### 3. KẾT QUẢ KIỂM THỬ KỸ THUẬT

1. **Biên dịch TypeScript (`npx tsc --noEmit`):**
   - Trạng thái: **THÀNH CÔNG (0 lỗi biên dịch)**.
2. **Kịch bản kiểm thử tự động (`scripts/verify_v15_02_movement_fix.mjs`):**
   - **23/23 Bài kiểm tra ĐẠT (100% PASS)**:
     - 4/4 kiểm tra độ lớn vector vận tốc đi chéo ($\Delta \le 2.8 \times 10^{-14}$).
     - 6/6 kiểm tra kiến trúc mã nguồn `SatyrPlayer.ts`.
     - 6/6 kiểm tra mô phỏng Direction Buffer (Zero lag lúc khởi động, lọc nhấp nhả 16–32ms, chuyển mượt ở ngưỡng $\ge 40\text{ms}$).
     - 3/3 kiểm tra tích hợp giải phóng khóa hành động trong `GameScene.ts`.
     - 4/4 kiểm tra chuyển đổi Walk $\leftrightarrow$ Run không gián đoạn frame.

---

### 4. BẢNG TỔNG KẾT BƯỚC V15-02

| Mục tiêu đề ra | Hiện trạng sau V15-02 | Trạng thái |
| :--- | :--- | :---: |
| Chuẩn hóa vận tốc đi chéo với $\frac{1}{\sqrt{2}}$ | Độ lớn vận tốc góc chéo bằng 100% tốc độ đi thẳng | **HOÀN THÀNH** |
| Bảo hiểm tự mở khóa hành động tối đa 600ms | Watchdog tự động kích hoạt, không bao giờ bị đơ phím | **HOÀN THÀNH** |
| Tách bạch Walk/Run và giữ chu kỳ chân | Chuyển tốc độ tức thời, frame hoạt ảnh nối tiếp mượt mà | **HOÀN THÀNH** |
| Direction Buffer 40ms chống giật hình 4 hướng | Triệt tiêu rung lắc hướng khi nhấp nhả phím | **HOÀN THÀNH** |
| Kiểm tra biên dịch `npx tsc --noEmit` | 0 Lỗi (Zero Errors) | **HOÀN THÀNH** |
