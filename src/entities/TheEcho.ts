import * as Phaser from 'phaser';
import { SPRITE_THE_ECHO } from '../config/Constants';
import { PlayerState } from '../state/PlayerState';
import { EchoSpec } from '../types';

/**
 * HOLLOW WOODS V1.4 — THỰC THỂ HIỆN TƯỢNG KÝ ỨC (THE ECHO)
 * Phân tách rạch ròi khỏi Quái vật The Listener:
 * - The Echo là hiện tượng bóng mờ ký ức xuất hiện vào Hoàng Hôn / Đêm Sương / Di tích cổ.
 * - Tan biến thành sương khi người chơi lại gần, để lại manh mối cốt truyện & áp lực nhẹ lên Bình Tâm.
 * - TUYỆT ĐỐI KHÔNG CÓ HỘP VA CHẠM GÂY SÁT THƯƠNG VẬT LÝ HAY GÂY TỬ VONG CHO NGƯỜI CHƠI.
 */
export class TheEcho extends Phaser.GameObjects.Container {
  public spec: EchoSpec;
  public isDissolved: boolean = false;
  public isGazedAt: boolean = false;
  private lastGazeTime: number = 0;

  private auraGfx: Phaser.GameObjects.Graphics;
  private spriteObj?: Phaser.GameObjects.Image;
  private floatTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, spec: EchoSpec) {
    super(scene, spec.x, spec.y);
    this.spec = spec;

    // 1. Vầng hào quang sương lam bạc mờ ảo (Ethereal Mist Aura)
    this.auraGfx = scene.add.graphics();
    this.auraGfx.fillStyle(0xaed6f1, 0.22);
    this.auraGfx.fillCircle(0, -32, 26);
    this.auraGfx.fillStyle(0xd5dbdb, 0.16);
    this.auraGfx.fillCircle(0, -32, 16);
    this.add(this.auraGfx);

    // 2. Hình bóng The Echo mờ ảo
    if (scene.textures.exists(SPRITE_THE_ECHO)) {
      this.spriteObj = scene.add.image(0, 0, SPRITE_THE_ECHO);
      this.spriteObj.setOrigin(0.5, 0.95);
      this.spriteObj.setAlpha(0.75);
      this.add(this.spriteObj);
    } else {
      // Đồ họa vector fallback nếu sprite chưa nạp
      const g = scene.add.graphics();
      g.fillStyle(0xd4e6f1, 0.65);
      g.fillEllipse(0, -28, 18, 36);
      g.fillCircle(0, -48, 10);
      this.add(g);
    }

    this.setDepth(spec.y);
    this.setAlpha(0);

    // 3. Hiệu ứng bồng bềnh chập chờn trong sương
    this.floatTween = scene.tweens.add({
      targets: this,
      alpha: 0.70,
      y: spec.y - 6,
      duration: 1350,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.add.existing(this);
  }

  /**
   * V1.4 - P8-03: Kiểm tra tương tác ánh nhìn (Direct Gaze Interaction)
   * The Echo chỉ làm giảm nhẹ 5 điểm Tĩnh Tâm (-5 Composure) nếu người chơi nhìn trực diện vào nó khi đèn lồng đang TẮT.
   */
  public checkDirectGaze(playerX: number, playerY: number, playerFacing: string, isLanternLit: boolean): boolean {
    if (this.isDissolved) return false;
    // Nếu đèn lồng đang BẬT, ánh sáng bảo vệ tâm trí người chơi -> không bị trừ Tĩnh Tâm
    if (isLanternLit) return false;

    const dist = Math.hypot(this.x - playerX, this.y - playerY);
    if (dist > 190 || dist < 10) return false;

    const dx = this.x - playerX;
    const dy = this.y - playerY;

    let isLookingDirectly = false;
    switch (playerFacing) {
      case 'left':
        isLookingDirectly = dx < 0 && Math.abs(dy) <= Math.abs(dx);
        break;
      case 'right':
        isLookingDirectly = dx > 0 && Math.abs(dy) <= Math.abs(dx);
        break;
      case 'up':
        isLookingDirectly = dy < 0 && Math.abs(dx) <= Math.abs(dy);
        break;
      case 'down':
        isLookingDirectly = dy > 0 && Math.abs(dx) <= Math.abs(dy);
        break;
    }

    if (!isLookingDirectly) return false;

    const now = Date.now();
    if (now - this.lastGazeTime < 6000) return false;
    this.lastGazeTime = now;
    this.isGazedAt = true;

    // Giảm nhẹ đúng 5 điểm Tĩnh Tâm (-5 Composure) khi nhìn trực diện trong bóng tối
    PlayerState.getInstance().modifyComposure(-5);

    // Hiệu ứng rùng mình thoáng qua
    if (this.scene) {
      const flash = this.scene.add.graphics();
      flash.fillStyle(0x2c3e50, 0.22);
      flash.fillRect(0, 0, 1280, 720);
      flash.setScrollFactor(0);
      flash.setDepth(9999);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy()
      });
    }

    return true;
  }

  /**
   * Tan biến thành tàn tro phát sáng khi người chơi tiếp cận (Dissolve into Glowing Ash)
   * Để lại manh mối cốt truyện và thì thầm truyền thuyết (lore)
   */
  public dissolve(callback?: (msg: string) => void): void {
    if (this.isDissolved) return;
    this.isDissolved = true;

    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = undefined;
    }

    // V1.4 - P8-03: Hiệu ứng tàn tro phát sáng (Glowing Ash Particles) bay lên khi tan biến
    if (this.scene) {
      for (let i = 0; i < 9; i++) {
        const p = this.scene.add.graphics();
        p.fillStyle(0xaed6f1, 0.85); // lam ngọc bạc phát sáng
        p.fillCircle(0, 0, 1.5 + Math.random() * 2);
        const offsetX = (Math.random() - 0.5) * 32;
        const offsetY = -10 - Math.random() * 26;
        p.setPosition(this.x + offsetX, this.y + offsetY);
        p.setDepth(this.y + 10);
        this.scene.tweens.add({
          targets: p,
          y: p.y - 28 - Math.random() * 28,
          x: p.x + (Math.random() - 0.5) * 22,
          alpha: 0,
          duration: 700 + Math.random() * 450,
          ease: 'Cubic.easeOut',
          onComplete: () => p.destroy()
        });
      }
    }

    // Áp lực tâm lý nhẹ lên Bình Tâm (-3 điểm) khi tiếp xúc ký ức người đã khuất (nếu chưa bị trừ qua ánh nhìn)
    if (!this.isGazedAt) {
      const drain = this.spec.composureDrain ?? 3;
      PlayerState.getInstance().modifyComposure(-drain);
    }

    // Phát sự kiện toàn cảnh thế giới
    this.scene.events.emit('echo_dissolved', {
      echoId: this.spec.id,
      x: this.x,
      y: this.y,
      message: this.spec.message
    });

    // Tween phân rã thành làn sương khói mờ ảo
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.85,
      scaleY: 0.22,
      duration: 650,
      ease: 'Power2',
      onComplete: () => {
        if (callback) {
          callback(this.spec.message);
        }
        this.destroy();
      }
    });
  }

  /**
   * Nguyên tắc thiết kế V1.4: The Echo KHÔNG có sát thương vật lý trực tiếp
   */
  public hasPhysicalDamage(): boolean {
    return false;
  }

  public destroy(fromScene?: boolean): void {
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = undefined;
    }
    if (this.auraGfx) {
      this.auraGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
