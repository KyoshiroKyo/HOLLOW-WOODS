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
  
  private eKeyJustPressed: boolean = false;

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
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.stats.isHiding) {
      this.setVelocity(0, 0);
      return;
    }

    const dt = delta / 1000;

    // Xử lý bật/tắt đèn lồng [F]
    if (Phaser.Input.Keyboard.JustDown(this.keyF)) {
      this.toggleLantern();
    }

    // Xử lý phím tương tác [E]
    this.eKeyJustPressed = Phaser.Input.Keyboard.JustDown(this.keyE);

    // Xử lý di chuyển
    this.handleMovement();

    // Cập nhật các chỉ số sinh tồn theo thời gian thực
    this.updateSurvivalStats(dt);

    // Cập nhật độ sâu đồ họa theo trục trời (Y-sorting)
    this.setDepth(Math.floor(this.y));
  }

  private handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    // Kiểm tra đầu vào từ WASD hoặc phím mũi tên
    const left = this.keyA.isDown || this.cursors.left.isDown;
    const right = this.keyD.isDown || this.cursors.right.isDown;
    const up = this.keyW.isDown || this.cursors.up.isDown;
    const down = this.keyS.isDown || this.cursors.down.isDown;

    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (up) moveY -= 1;
    if (down) moveY += 1;

    // Xác định trạng thái chạy nhanh
    const wantsToSprint = (this.keyShift.isDown || this.cursors.shift.isDown) && (moveX !== 0 || moveY !== 0);
    const canSprint = wantsToSprint && this.stats.stamina > 5;
    this.stats.isSprinting = canSprint;

    const currentSpeed = canSprint ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED;

    // Chuẩn hóa vector di chuyển (tránh đi chéo chạy nhanh hơn)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      const normX = moveX / length;
      const normY = moveY / length;

      body.setVelocity(normX * currentSpeed, normY * currentSpeed);

      // Cập nhật hướng nhìn
      this.updateFacingDirection(moveX, moveY);

      // Cập nhật hoạt ảnh di chuyển
      this.playWalkOrRunAnim();
    } else {
      body.setVelocity(0, 0);
      this.playIdleAnim();
    }
  }

  private updateFacingDirection(moveX: number, moveY: number): void {
    if (Math.abs(moveX) > Math.abs(moveY)) {
      if (moveX < 0) {
        this.facing = 'left';
        this.setFlipX(false);
      } else if (moveX > 0) {
        this.facing = 'right';
        this.setFlipX(false); // Không lật hình vì đã có riêng hàng RIGHT độc lập
      }
    } else {
      if (moveY < 0) {
        this.facing = 'up';
        this.setFlipX(false);
      } else if (moveY > 0) {
        this.facing = 'down';
        this.setFlipX(false);
      }
    }
  }

  private playWalkOrRunAnim(): void {
    const isRunning = this.stats.isSprinting;
    const prefix = isRunning ? 'satyr_run_' : 'satyr_walk_';

    let animKey = '';
    if (this.facing === 'down') {
      animKey = `${prefix}down`;
    } else if (this.facing === 'up') {
      animKey = `${prefix}up`;
    } else if (this.facing === 'right') {
      animKey = `${prefix}right`;
    } else {
      animKey = `${prefix}left`;
    }

    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
  }

  private playIdleAnim(): void {
    let animKey = '';
    if (this.facing === 'down') {
      animKey = 'satyr_idle_down';
    } else if (this.facing === 'up') {
      animKey = 'satyr_idle_up';
    } else if (this.facing === 'right') {
      animKey = 'satyr_idle_right';
    } else {
      animKey = 'satyr_idle_left';
    }

    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
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
      }
    } else {
      this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + STAMINA_RECOVERY_RATE * dt);
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
