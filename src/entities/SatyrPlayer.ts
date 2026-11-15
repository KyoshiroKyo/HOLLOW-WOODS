import * as Phaser from 'phaser';
import { 
  SATYR_SHEET_KEY, 
  SATYR_ORIGIN_X, 
  SATYR_ORIGIN_Y,
  SATYR_BODY_WIDTH,
  SATYR_BODY_HEIGHT,
  SATYR_BODY_OFFSET_X,
  SATYR_BODY_OFFSET_Y,
  PLAYER_WALK_SPEED,
  PLAYER_SPRINT_SPEED,
  STAMINA_DRAIN_RATE,
  STAMINA_RECOVERY_RATE,
  LANTERN_OIL_DRAIN_RATE,
  COMPOSURE_DRAIN_IN_DARK,
  COMPOSURE_RECOVERY_NEAR_LIGHT
} from '../config/Constants';
import { FacingDirection, PlayerStats } from '../types';

export class SatyrPlayer extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;
  public facing: FacingDirection = 'down';
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyF!: Phaser.Input.Keyboard.Key;
  private keyJ!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  
  private eKeyJustPressed: boolean = false;

  // Trạng thái hành động độc quyền (Exclusive Action States)
  private _isAttacking: boolean = false;
  private _isHurt: boolean = false;
  private _isDead: boolean = false;
  private _isStaminaExhausted: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SATYR_SHEET_KEY, 0);

    // Thêm sprite vào Scene và bật Arcade Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Cấu hình điểm neo tại gót chân để Y-sorting chính xác theo mặt đất (y=58 trong ô 64x64)
    this.setOrigin(SATYR_ORIGIN_X, SATYR_ORIGIN_Y);
    this.setFlipX(false);

    // Cấu hình vùng va chạm vật lý nhỏ ở bàn chân (14×8 px)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(SATYR_BODY_WIDTH, SATYR_BODY_HEIGHT);
      body.setOffset(SATYR_BODY_OFFSET_X, SATYR_BODY_OFFSET_Y);
      body.setCollideWorldBounds(true);
    }

    // Khởi tạo các chỉ số sinh tồn chuẩn Canon V3.0
    this.stats = {
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      lanternOil: 100,
      maxLanternOil: 100,
      composure: 100,
      maxComposure: 100,
      isLanternOn: false,
      isSprinting: false,
      isHiding: false
    };

    // Khởi tạo phím điều khiển
    this.setupInput();

    // Hoạt ảnh mặc định
    this.play('satyr_idle_down');
  }

  private setupInput(): void {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyShift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyE = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyF = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keyJ = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);

    if (this._isDead) {
      this.setVelocity(0, 0);
      return;
    }

    if (this.stats.isHiding) {
      this.setVelocity(0, 0);
      return;
    }

    const dt = delta / 1000;

    // Xử lý bật/tắt đèn lồng [F]
    if (this.keyF && Phaser.Input.Keyboard.JustDown(this.keyF)) {
      this.toggleLantern();
    }

    // Xử lý phím tương tác [E]
    this.eKeyJustPressed = this.keyE ? Phaser.Input.Keyboard.JustDown(this.keyE) : false;

    // Xử lý tấn công [J] hoặc [SPACE]
    if (!this._isAttacking && !this._isHurt) {
      const jPressed = this.keyJ && Phaser.Input.Keyboard.JustDown(this.keyJ);
      const spacePressed = this.keySpace && Phaser.Input.Keyboard.JustDown(this.keySpace);
      if (jPressed || spacePressed) {
        this.attack();
      }
    }

    // Xử lý di chuyển nếu không đang bị khóa hành động
    if (!this._isAttacking && !this._isHurt) {
      this.handleMovement();
    }

    // Cập nhật các chỉ số sinh tồn theo thời gian thực
    this.updateSurvivalStats(dt);

    // Cập nhật độ sâu đồ họa theo trục trời (Y-sorting)
    this.setDepth(Math.floor(this.y));
  }

  private handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    // Kiểm tra đầu vào từ WASD hoặc phím mũi tên
    const left = (this.keyA && this.keyA.isDown) || (this.cursors && this.cursors.left && this.cursors.left.isDown);
    const right = (this.keyD && this.keyD.isDown) || (this.cursors && this.cursors.right && this.cursors.right.isDown);
    const up = (this.keyW && this.keyW.isDown) || (this.cursors && this.cursors.up && this.cursors.up.isDown);
    const down = (this.keyS && this.keyS.isDown) || (this.cursors && this.cursors.down && this.cursors.down.isDown);

    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (up) moveY -= 1;
    if (down) moveY += 1;

    // Quản lý thể lực chạy nhanh kèm ngưỡng phục hồi (Hysteresis)
    const shiftDown = (this.keyShift && this.keyShift.isDown) || (this.cursors && this.cursors.shift && this.cursors.shift.isDown);
    const wantsToSprint = shiftDown && (moveX !== 0 || moveY !== 0);

    if (this.stats.stamina <= 0) {
      this._isStaminaExhausted = true;
    } else if (this.stats.stamina >= 15) {
      this._isStaminaExhausted = false;
    }

    const canSprint = wantsToSprint && !this._isStaminaExhausted && this.stats.stamina > 5;
    this.stats.isSprinting = canSprint;

    const currentSpeed = canSprint ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED;

    // Chuẩn hóa vector di chuyển (tránh đi chéo chạy nhanh hơn)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      const normX = moveX / length;
      const normY = moveY / length;

      body.setVelocity(normX * currentSpeed, normY * currentSpeed);

      // Cập nhật hướng nhìn với nguyên tắc duy trì hướng khi đi chéo
      this.updateFacingDirection(moveX, moveY);

      // Cập nhật hoạt ảnh di chuyển
      this.playWalkOrRunAnim();
    } else {
      body.setVelocity(0, 0);
      this.playIdleAnim();
    }
  }

  /**
   * Cập nhật hướng nhìn với NGUYÊN TẮC DUY TRÌ HƯỚNG NHÌN (Direction Persistence Rule).
   * Triệt tiêu hoàn toàn lỗi giật hướng nhìn (Diagonal Stutter - BUG-05) khi đi chéo.
   */
  public updateFacingDirection(moveX: number, moveY: number): void {
    if (moveX === 0 && moveY === 0) return;

    const absX = Math.abs(moveX);
    const absY = Math.abs(moveY);

    if (absX > absY) {
      // Chiều ngang chiếm ưu thế tuyệt đối
      this.facing = moveX < 0 ? 'left' : 'right';
    } else if (absY > absX) {
      // Chiều dọc chiếm ưu thế tuyệt đối
      this.facing = moveY < 0 ? 'up' : 'down';
    } else {
      // Đi chéo cân bằng (absX === absY > 0)
      // NGUYÊN TẮC DUY TRÌ HƯỚNG NHÌN:
      // Nếu hướng nhìn hiện tại đã thuộc về một trong hai trục đang di chuyển,
      // GIỮ NGUYÊN hướng nhìn đó để tránh rung lắc hướng và reset animation.
      const isCurrentFacingMoving =
        (this.facing === 'left' && moveX < 0) ||
        (this.facing === 'right' && moveX > 0) ||
        (this.facing === 'up' && moveY < 0) ||
        (this.facing === 'down' && moveY > 0);

      if (!isCurrentFacingMoving) {
        // Nếu hướng hiện tại không thuộc vector di chuyển, ưu tiên trục ngang làm mặc định ổn định
        this.facing = moveX < 0 ? 'left' : 'right';
      }
    }

    this.setFlipX(false);
  }

  /**
   * Phát hoạt ảnh Walk hoặc Run.
   * Nếu đang cùng hướng di chuyển và chỉ đổi tốc độ Walk <-> Run,
   * bảo tồn tiến trình frame hiện tại để không bị ngắt quãng giật cục về frame 0.
   */
  private playWalkOrRunAnim(): void {
    if (this._isAttacking || this._isHurt || this._isDead) return;

    const isRunning = this.stats.isSprinting;
    const prefix = isRunning ? 'satyr_run_' : 'satyr_walk_';
    const targetKey = `${prefix}${this.facing}`;

    const currentAnimKey = this.anims.currentAnim?.key;
    if (currentAnimKey === targetKey && this.anims.isPlaying) {
      return;
    }

    const isSameDirection = currentAnimKey?.endsWith(this.facing);
    const isWalkRunSwitch =
      (currentAnimKey?.startsWith('satyr_walk_') && isRunning) ||
      (currentAnimKey?.startsWith('satyr_run_') && !isRunning);

    if (isSameDirection && isWalkRunSwitch && this.anims.currentFrame) {
      const currentFrameIndex = this.anims.currentFrame.index;
      this.play(targetKey);
      const targetAnim = this.anims.get(targetKey);
      if (targetAnim && targetAnim.frames.length > 0) {
        const frameIdx = (currentFrameIndex - 1) % targetAnim.frames.length;
        this.anims.setCurrentFrame(targetAnim.frames[frameIdx]);
      }
    } else {
      this.play(targetKey, true);
    }
  }

  public playIdle(): void {
    this.playIdleAnim();
  }

  private playIdleAnim(): void {
    if (this._isAttacking || this._isHurt || this._isDead) return;

    const targetKey = `satyr_idle_${this.facing}`;
    if (this.anims.currentAnim?.key === targetKey && this.anims.isPlaying) {
      return;
    }

    this.play(targetKey, true);
  }

  // =========================================================================
  // CÁC HÀNH ĐỘNG CHIẾN ĐẤU & PHẢN ỨNG SÁT THƯƠNG (ATTACK, HURT, DEATH)
  // =========================================================================

  public isAttacking(): boolean {
    return this._isAttacking;
  }

  public isHurt(): boolean {
    return this._isHurt;
  }

  public isDead(): boolean {
    return this._isDead;
  }

  public attack(): boolean {
    if (this._isAttacking || this._isHurt || this._isDead) return false;

    this._isAttacking = true;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const animKey = `satyr_attack_${this.facing}`;
    const keyToPlay = this.anims.exists(animKey) ? animKey : 'satyr_attack';
    this.play(keyToPlay, true);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isAttacking = false;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (550ms: 5 frames @ 10fps = 500ms)
    this.scene.time.delayedCall(550, () => {
      if (this._isAttacking) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isAttacking = false;
        this.playIdleAnim();
      }
    });

    return true;
  }

  public playHurt(knockbackVx?: number, knockbackVy?: number): boolean {
    if (this._isDead) return false;

    this._isHurt = true;
    this._isAttacking = false;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (knockbackVx !== undefined && knockbackVy !== undefined) {
      body.setVelocity(knockbackVx, knockbackVy);
    } else {
      body.setVelocity(0, 0);
    }

    // Hiệu ứng màu đỏ khi trúng đòn
    this.setTint(0xff6666);

    const animKey = `satyr_hurt_${this.facing}`;
    const keyToPlay = this.anims.exists(animKey) ? animKey : 'satyr_hurt';
    this.play(keyToPlay, true);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this.clearTint();
        this._isHurt = false;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (550ms: 3 frames @ 6fps = 500ms)
    this.scene.time.delayedCall(550, () => {
      if (this._isHurt) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this.clearTint();
        this._isHurt = false;
        this.playIdleAnim();
      }
    });

    return true;
  }

  public die(): void {
    if (this._isDead) return;

    this._isDead = true;
    this._isAttacking = false;
    this._isHurt = false;

    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.clearTint();

    const animKey = `satyr_death_${this.facing}`;
    const keyToPlay = this.anims.exists(animKey) ? animKey : 'satyr_death';
    this.play(keyToPlay, true);

    // Nhân vật nằm bất động trên mặt đất ở frame cuối cùng, không trở về idle
  }

  public toggleLantern(): void {
    if (this.stats.lanternOil <= 0) {
      this.stats.isLanternOn = false;
      return;
    }
    this.stats.isLanternOn = !this.stats.isLanternOn;
  }

  private updateSurvivalStats(dt: number): void {
    // 1. Quản lý Thể lực (Stamina)
    if (this.stats.isSprinting) {
      this.stats.stamina = Math.max(0, this.stats.stamina - STAMINA_DRAIN_RATE * dt);
      if (this.stats.stamina <= 0) {
        this.stats.isSprinting = false;
        this._isStaminaExhausted = true;
      }
    } else {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + STAMINA_RECOVERY_RATE * dt);
      if (this.stats.stamina >= 15) {
        this._isStaminaExhausted = false;
      }
    }

    // 2. Quản lý Dầu đèn lồng (Lantern Oil)
    if (this.stats.isLanternOn) {
      this.stats.lanternOil = Math.max(0, this.stats.lanternOil - LANTERN_OIL_DRAIN_RATE * dt);
      if (this.stats.lanternOil <= 0) {
        this.stats.isLanternOn = false;
      }
    }

    // 3. Quản lý Bình tâm (Composure)
    if (!this.stats.isLanternOn) {
      this.stats.composure = Math.max(0, this.stats.composure - COMPOSURE_DRAIN_IN_DARK * dt);
    } else {
      this.stats.composure = Math.min(this.stats.maxComposure, this.stats.composure + COMPOSURE_RECOVERY_NEAR_LIGHT * dt);
    }
  }

  public isInteractRequested(): boolean {
    return this.eKeyJustPressed;
  }

  public getFootPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y);
  }
}
