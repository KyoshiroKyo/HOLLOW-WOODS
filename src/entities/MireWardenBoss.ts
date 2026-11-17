import * as Phaser from 'phaser';

export type MireWardenState =
  | 'DORMANT'
  | 'AWAKENING'
  | 'STALK'
  | 'INVESTIGATING'
  | 'CHARGING'
  | 'STAGGERED'
  | 'PHASE_TRANSITION'
  | 'ENSHROUDED'
  | 'DEFEATED';

export interface RunePillarTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  isLit: boolean;
  isShattered: boolean;
  graphics?: Phaser.GameObjects.Graphics;
  lightObj?: Phaser.GameObjects.Arc;
}

export interface BrazierTarget {
  id: string;
  x: number;
  y: number;
  isLit: boolean;
  graphics?: Phaser.GameObjects.Graphics;
}

export class MireWardenBoss extends Phaser.GameObjects.Container {
  public currentState: MireWardenState = 'DORMANT';
  public phase: 1 | 2 = 1;
  public sealProgress: number = 0;
  public readonly maxSealProgress: number = 3;

  // Thuộc tính tốc độ và di chuyển
  public stalkSpeed: number = 75;
  public chargeSpeed: number = 240;
  public currentSpeed: number = 75;
  private targetX: number = 4500;
  private targetY: number = 250;
  private chargeDirection: { x: number; y: number } = { x: 0, y: 0 };
  private chargeDurationTimer: number = 0;

  // Cơ chế làm choáng (Stagger) chuẩn 3.5 giây (3500ms)
  public isStaggered: boolean = false;
  public staggerTimer: number = 0;
  public readonly STAGGER_DURATION_MS: number = 3500;

  // Đồ họa hiển thị thực thể Boss thủ công pixel art HD
  private bodyGfx: Phaser.GameObjects.Graphics;
  private eyesGfx: Phaser.GameObjects.Graphics;
  private shadowGfx: Phaser.GameObjects.Graphics;
  private auraGfx: Phaser.GameObjects.Graphics;
  private staggerIndicatorContainer: Phaser.GameObjects.Container;
  private staggerPromptText: Phaser.GameObjects.Text;

  // Hoạt ảnh hơi thở và chuyển động
  private breathTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    // Kích hoạt Arcade Physics cho Container
    scene.physics.world.enable(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(64, 48);
      body.setOffset(-32, -24);
      body.setCollideWorldBounds(false);
    }

    // 1. Bóng đổ dưới chân Boss
    this.shadowGfx = scene.add.graphics();
    this.add(this.shadowGfx);
    this.drawShadow();

    // 2. Hào quang ma thuật rễ đầm lầy
    this.auraGfx = scene.add.graphics();
    this.add(this.auraGfx);

    // 3. Thân thể hình bóng quái thú rễ cổ thụ
    this.bodyGfx = scene.add.graphics();
    this.add(this.bodyGfx);

    // 4. Đôi mắt lân tinh u ám
    this.eyesGfx = scene.add.graphics();
    this.add(this.eyesGfx);

    // 5. Huy hiệu cảnh báo khi bị choáng [E] KÍCH HOẠT ẤN PHONG ẤN
    this.staggerIndicatorContainer = scene.add.container(0, -78);
    const promptBg = scene.add.graphics();
    promptBg.fillStyle(0x0e131b, 0.92);
    promptBg.fillRoundedRect(-120, -16, 240, 32, 6);
    promptBg.lineStyle(1.5, 0x00d2d3, 0.95);
    promptBg.strokeRoundedRect(-120, -16, 240, 32, 6);

    this.staggerPromptText = scene.add.text(0, 0, '[E] KÍCH HOẠT ẤN PHONG ẤN!', {
      fontFamily: 'serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00d2d3',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    this.staggerIndicatorContainer.add([promptBg, this.staggerPromptText]);
    this.staggerIndicatorContainer.setVisible(false);
    this.add(this.staggerIndicatorContainer);

    this.drawBossBody();
    this.setVisible(false);
  }

  /**
   * Vẽ bóng đổ lớn dưới chân Boss
   */
  private drawShadow(): void {
    this.shadowGfx.clear();
    this.shadowGfx.fillStyle(0x000000, 0.45);
    this.shadowGfx.fillEllipse(0, 22, 70, 24);
  }

  /**
   * Vẽ thân thể quái thú Kẻ Nuốt Tiếng Chuông (Mire Warden)
   */
  public drawBossBody(): void {
    this.bodyGfx.clear();
    this.eyesGfx.clear();

    const isPhase2 = this.phase === 2;
    const bodyColor = isPhase2 ? 0x140e1b : 0x161c14;
    const rootColor = isPhase2 ? 0x3d1c3e : 0x243321;
    const hornColor = isPhase2 ? 0x4a235a : 0x1e2718;

    // Khối lưng vòm gù phủ rêu đen dày đặc
    this.bodyGfx.fillStyle(bodyColor, 1);
    this.bodyGfx.fillEllipse(0, -10, 68, 54);

    // Các nhánh rễ và sừng gỗ đan cài trên vai & đỉnh đầu
    this.bodyGfx.fillStyle(rootColor, 1);
    this.bodyGfx.fillTriangle(-26, -30, -38, -62, -18, -35);
    this.bodyGfx.fillTriangle(26, -30, 38, -62, 18, -35);
    this.bodyGfx.fillTriangle(-12, -35, -16, -70, -4, -40);
    this.bodyGfx.fillTriangle(12, -35, 16, -70, 4, -40);

    // Mũ sừng chuông đồng rỉ sét
    this.bodyGfx.fillStyle(hornColor, 0.9);
    this.bodyGfx.fillCircle(0, -28, 22);

    // Hai cánh tay cành gỗ gồ ghề vươn dài
    this.bodyGfx.fillStyle(bodyColor, 1);
    this.bodyGfx.fillRoundedRect(-38, -12, 16, 36, 4);
    this.bodyGfx.fillRoundedRect(22, -12, 16, 36, 4);

    // Đôi mắt lân tinh
    if (this.isStaggered) {
      // Mắt nhắm tịt / lờ mờ khi bị choáng
      this.eyesGfx.fillStyle(0x7f8c8d, 0.8);
      this.eyesGfx.fillCircle(-9, -24, 2);
      this.eyesGfx.fillCircle(9, -24, 2);
    } else if (this.currentState === 'CHARGING') {
      // Mắt đỏ cam rực lửa cuồng nộ khi lao húc
      this.eyesGfx.fillStyle(0xff2200, 1);
      this.eyesGfx.fillCircle(-9, -24, 4.5);
      this.eyesGfx.fillCircle(9, -24, 4.5);
      this.eyesGfx.fillStyle(0xffffaa, 1);
      this.eyesGfx.fillCircle(-9, -24, 2);
      this.eyesGfx.fillCircle(9, -24, 2);
    } else {
      // Mắt lân tinh tím / hổ phách rình mò
      const eyeCol = isPhase2 ? 0x9b59b6 : 0xf39c12;
      this.eyesGfx.fillStyle(eyeCol, 1);
      this.eyesGfx.fillCircle(-9, -24, 3.5);
      this.eyesGfx.fillCircle(9, -24, 3.5);
    }
  }

  /**
   * Kích hoạt trận chiến đấu trùm
   */
  public startBossFight(): void {
    this.setVisible(true);
    this.currentState = 'AWAKENING';
    this.phase = 1;
    this.sealProgress = 0;
    this.isStaggered = false;
    this.staggerTimer = 0;

    // Hiệu ứng bùng nổ khi thức tỉnh
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 0.2, to: 1 },
      scaleY: { from: 0.2, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 1200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.currentState = 'STALK';
        this.drawBossBody();
      }
    });
  }

  /**
   * Tiếp nhận âm thanh đánh động (Mồi ném [Q], chạy nhanh hoặc gõ chuông)
   */
  public hearSound(x: number, y: number, isLureBomb: boolean = false): void {
    if (this.isStaggered || this.currentState === 'DEFEATED' || this.currentState === 'AWAKENING') {
      return;
    }

    this.targetX = x;
    this.targetY = y;

    if (isLureBomb) {
      // Mồi ném [Q] tạo kích động cực mạnh -> Boss lập tức CHARGE vào điểm ném!
      this.triggerCharge(x, y);
    } else if (this.currentState !== 'CHARGING') {
      this.currentState = 'INVESTIGATING';
    }
  }

  /**
   * Kích hoạt cú lao húc (Charge) cuồng bạo
   */
  public triggerCharge(targetX: number, targetY: number): void {
    if (this.isStaggered || this.currentState === 'DEFEATED') return;

    this.currentState = 'CHARGING';
    this.chargeDurationTimer = 2600; // Tối đa lao trong 2.6 giây
    this.targetX = targetX;
    this.targetY = targetY;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.001) {
      this.chargeDirection = { x: dx / dist, y: dy / dist };
    } else {
      this.chargeDirection = { x: 1, y: 0 };
    }

    this.drawBossBody();
  }

  /**
   * Boss đâm trúng Trụ Cổ Ngữ đang phát sáng -> Rơi vào trạng thái CHOÁNG (STAGGERED) trong 3.5s
   */
  public stagger(): void {
    this.isStaggered = true;
    this.currentState = 'STAGGERED';
    this.staggerTimer = this.STAGGER_DURATION_MS; // 3500ms

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }

    this.staggerIndicatorContainer.setVisible(true);
    this.drawBossBody();

    // Rung lắc thân thể choáng váng
    this.scene.tweens.add({
      targets: this,
      angle: { from: -4, to: 4 },
      duration: 100,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.angle = 0;
      }
    });
  }

  /**
   * Người chơi nhấn [E] hoặc dùng Giáo Gỗ phong ấn khi Boss đang bị choáng
   */
  public applySeal(): number {
    if (!this.isStaggered || this.currentState === 'DEFEATED') {
      return this.sealProgress;
    }

    this.sealProgress++;
    this.isStaggered = false;
    this.staggerTimer = 0;
    this.staggerIndicatorContainer.setVisible(false);

    // Hiệu ứng sóng ma thuật bung tỏa từ phong ấn
    this.auraGfx.clear();
    this.auraGfx.fillStyle(0x00d2d3, 0.45);
    this.auraGfx.fillCircle(0, 0, 80);
    this.scene.tweens.add({
      targets: this.auraGfx,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        this.auraGfx.clear();
        this.auraGfx.alpha = 1;
      }
    });

    if (this.sealProgress >= 3) {
      this.defeat();
    } else if (this.sealProgress === 2) {
      this.enterPhase2();
    } else {
      // Hồi phục sau cú đánh nấc 1
      this.currentState = 'STALK';
      this.drawBossBody();
    }

    return this.sealProgress;
  }

  /**
   * Chuyển sang Pha 2 — Bóng Tối & Thắp Sáng Lại
   */
  public enterPhase2(): void {
    this.phase = 2;
    this.currentState = 'PHASE_TRANSITION';

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // Hoạt ảnh gầm thét cuồng nộ giải phóng sương mù tím
    this.drawBossBody();
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 800,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.currentState = 'ENSHROUDED';
        this.drawBossBody();
      }
    });
  }

  /**
   * Boss bị phong ấn vĩnh viễn
   */
  public defeat(): void {
    this.currentState = 'DEFEATED';
    this.isStaggered = false;
    this.staggerIndicatorContainer.setVisible(false);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // Hóa đá thành bức tượng phủ đầy rêu hoa cổ thụ
    this.bodyGfx.clear();
    this.bodyGfx.fillStyle(0x3a403c, 1);
    this.bodyGfx.fillEllipse(0, -10, 68, 54);
    this.bodyGfx.fillStyle(0x27ae60, 0.85); // Hoa rêu nở
    this.bodyGfx.fillCircle(-10, -15, 6);
    this.bodyGfx.fillCircle(12, -8, 8);
    this.eyesGfx.clear();

    this.scene.tweens.add({
      targets: this,
      alpha: 0.75,
      y: this.y + 12,
      duration: 2500,
      ease: 'Power2'
    });
  }

  /**
   * Cập nhật vòng lặp logic theo delta thời gian
   */
  public update(_time: number, delta: number): void {
    if (this.currentState === 'DORMANT' || this.currentState === 'DEFEATED') {
      return;
    }

    // Hiệu ứng thở tự nhiên
    this.breathTimer += delta * 0.003;
    const breathScale = 1 + Math.sin(this.breathTimer) * 0.03;
    this.bodyGfx.setScale(1, breathScale);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Xử lý bộ đếm Choáng (Stagger)
    if (this.isStaggered) {
      this.staggerTimer -= delta;
      if (this.staggerTimer <= 0) {
        // Hết thời gian choáng mà người chơi chưa kịp phong ấn -> Boss hồi phục!
        this.isStaggered = false;
        this.staggerIndicatorContainer.setVisible(false);
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
        this.drawBossBody();
      }
      body.setVelocity(0, 0);
      return;
    }

    // Xử lý chuyển động theo từng trạng thái
    if (this.currentState === 'CHARGING') {
      this.chargeDurationTimer -= delta;
      body.setVelocity(
        this.chargeDirection.x * this.chargeSpeed,
        this.chargeDirection.y * this.chargeSpeed
      );

      if (this.chargeDurationTimer <= 0) {
        // Hết đà lao mà không va chạm trụ -> hồi lại STALK
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
        this.drawBossBody();
      }
    } else if (this.currentState === 'INVESTIGATING') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 30) {
        body.setVelocity((dx / dist) * 115, (dy / dist) * 115);
      } else {
        this.currentState = this.phase === 2 ? 'ENSHROUDED' : 'STALK';
      }
    } else if (this.currentState === 'STALK' || this.currentState === 'ENSHROUDED') {
      // Đi tuần chậm rãi quanh khu vực Miếu Chuông
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 40) {
        // Chọn điểm rình mò ngẫu nhiên mới trong đấu trường (4250..4750, 180..380)
        this.targetX = 4250 + Math.random() * 500;
        this.targetY = 180 + Math.random() * 200;
      } else {
        body.setVelocity((dx / dist) * this.stalkSpeed, (dy / dist) * this.stalkSpeed);
      }
    }
  }
}
