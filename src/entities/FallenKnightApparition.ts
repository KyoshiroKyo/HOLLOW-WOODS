/**
 * HOLLOW WOODS V1.5 — BƯỚC V15-58A
 * THỰC THỂ: ẢO ẢNH HIỆP SĨ SA NGÃ (FALLEN KNIGHT APPARITION)
 * 
 * Hiện tượng ảo giác tâm lý khi Tinh Thần (Sanity) sụt giảm xuống dưới 30/100.
 * TUYỆT ĐỐI KHÔNG GẮN PHYSICS COLLIDER (Kế thừa trực tiếp từ Phaser.GameObjects.Sprite)
 * để đảm bảo 100% không bao giờ gây kẹt đường hoặc cản trở di chuyển của người chơi.
 */

import * as Phaser from 'phaser';
import { SPRITE_FALLEN_KNIGHT } from '../config/Constants';

export class FallenKnightApparition extends Phaser.GameObjects.Sprite {
  private footGfx: Phaser.GameObjects.Graphics;
  private auraGfx: Phaser.GameObjects.Graphics;
  private isDissipating: boolean = false;
  private baseAlpha: number = 0.68;
  private pulseTimer: number = Math.random() * Math.PI * 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Kế thừa trực tiếp Phaser.GameObjects.Sprite, không thêm vào Arcade Physics
    super(scene, x, y, SPRITE_FALLEN_KNIGHT);
    scene.add.existing(this);

    // Căn chuẩn điểm neo chân origin(0.5, 1.0) và Y-Sorting
    this.setOrigin(0.5, 1.0);
    this.setDepth(Math.floor(y));

    // Phủ lớp bóng mờ tối sẫm (Dark Spectral Tint)
    this.setTint(0x281938);
    this.setAlpha(this.baseAlpha);

    // Bóng ma mờ dưới chân
    this.footGfx = scene.add.graphics();
    this.footGfx.fillStyle(0x06030a, 0.45);
    this.footGfx.fillEllipse(0, 0, 26, 9);
    this.footGfx.setPosition(x, y);
    this.footGfx.setDepth(this.depth - 1);

    // Vầng khói tà khí nhấp nhô nhẹ quanh thân
    this.auraGfx = scene.add.graphics();
    this.auraGfx.setDepth(this.depth - 1);
    this.drawAura();

    // Phát hoạt ảnh đứng yên (idle) nếu có sẵn, hoặc dùng frame tĩnh
    if (scene.anims && scene.anims.exists('fallen_knight_idle')) {
      this.play('fallen_knight_idle', true);
    } else {
      this.setFrame(0);
    }
  }

  private drawAura(): void {
    if (!this.auraGfx || this.isDissipating) return;
    this.auraGfx.clear();
    this.auraGfx.fillStyle(0x180924, 0.28);
    this.auraGfx.fillCircle(this.x, this.y - 24, 20);
    this.auraGfx.fillStyle(0x0f0417, 0.18);
    this.auraGfx.fillCircle(this.x - 4, this.y - 32, 14);
    this.auraGfx.fillCircle(this.x + 4, this.y - 18, 16);
  }

  public update(_time: number, delta: number, playerX: number, _playerY: number): void {
    if (this.isDissipating || !this.active) return;

    // 1. Luôn xoay mặt nhìn chằm chằm về phía người chơi từ trong sương
    if (playerX < this.x) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    // 2. Alpha nhấp nhô nhẹ (Subtle ethereal pulse)
    this.pulseTimer += delta * 0.003;
    const pulse = Math.sin(this.pulseTimer) * 0.14;
    const currentAlpha = Phaser.Math.Clamp(this.baseAlpha + pulse, 0.42, 0.85);
    this.setAlpha(currentAlpha);

    // Cập nhật vị trí bóng chân và vầng khói
    this.footGfx.setPosition(this.x, this.y);
    this.footGfx.setAlpha(currentAlpha * 0.6);
    this.drawAura();
  }

  /**
   * Kích hoạt tan rã bạo phát (Smoke Burst Dissipation)
   * Khi người chơi đến quá gần (< 85px), rọi sáng [F], hoặc vung kiếm chém trúng.
   */
  public triggerSmokeBurst(): void {
    if (this.isDissipating) return;
    this.isDissipating = true;

    const scene = this.scene;
    const x = this.x;
    const y = this.y - 20;

    // 1. Xóa ngay footGfx và auraGfx
    if (this.footGfx) {
      this.footGfx.destroy();
    }
    if (this.auraGfx) {
      this.auraGfx.destroy();
    }

    // 2. Sinh cụm 20 hạt khói đen/tím bung nở dữ dội tứ phía (Smoke Burst Particles)
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const p = scene.add.graphics();
      const pAngle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.35;
      const speed = Phaser.Math.Between(45, 115);
      const targetX = x + Math.cos(pAngle) * speed;
      const targetY = y + Math.sin(pAngle) * speed;
      const radius = Phaser.Math.Between(4, 9);
      const color = i % 2 === 0 ? 0x120617 : 0x2d1240;

      p.fillStyle(color, 0.88);
      p.fillCircle(0, 0, radius);
      p.setPosition(x, y);
      p.setDepth(this.depth + 2);

      scene.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 1.6,
        scaleY: 1.6,
        duration: Phaser.Math.Between(380, 580),
        ease: 'Cubic.easeOut',
        onComplete: () => {
          p.destroy();
        }
      });
    }

    // 3. Ẩn và hủy sprite ngay lập tức
    this.setVisible(false);
    this.destroy();
  }

  /**
   * Tự động mờ dần và dọn dẹp sạch khỏi bộ nhớ
   * Khi người chơi bỏ đi xa (> 320px) hoặc bước vào vùng an toàn/lửa trại
   */
  public fadeOutAndDestroy(): void {
    if (this.isDissipating) return;
    this.isDissipating = true;

    this.scene.tweens.add({
      targets: [this, this.footGfx, this.auraGfx],
      alpha: 0,
      duration: 1000,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.footGfx) this.footGfx.destroy();
        if (this.auraGfx) this.auraGfx.destroy();
        this.destroy();
      }
    });
  }

  public getIsDissipating(): boolean {
    return this.isDissipating;
  }
}
