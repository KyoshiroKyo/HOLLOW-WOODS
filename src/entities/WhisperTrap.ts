/**
 * HOLLOW WOODS V1.5 — BƯỚC V15-58B
 * THỰC THỂ BẪY TƯƠNG TÁC GIẢ: "TIẾNG GỌI TRONG SƯƠNG" (WHISPER TRAP)
 * 
 * Hiện tượng bẫy tâm linh dựa theo Quy Tắc Bằng Máu Số 1:
 * "Không đáp lại tiếng gọi trong sương mù dù đó là giọng của người thân quen nhất."
 */

import * as Phaser from 'phaser';
import { HDTextHelper } from '../utils/HDTextHelper';

export interface WhisperLureOption {
  speaker: string;
  quote: string;
}

export class WhisperTrap {
  public scene: Phaser.Scene;
  public x: number;
  public y: number;
  public active: boolean = true;
  public lifetime: number = 15.0; // 15 giây tự tan biến nếu làm ngơ
  public promptText: string;
  public voiceSnippet: string;
  public speakerName: string;

  private container: Phaser.GameObjects.Container;
  private lightGfx: Phaser.GameObjects.Graphics;
  private floatingText: Phaser.GameObjects.Text;
  private pulseTween?: Phaser.Tweens.Tween;
  private isFading: boolean = false;

  public static readonly LURE_OPTIONS: WhisperLureOption[] = [
    { speaker: 'Garth', quote: '"Này... Garth đây... Mau lại đây!"' },
    { speaker: 'Bà lão Edda', quote: '"Lữ khách ơi... ta tìm thấy lối rồi..."' },
    { speaker: 'Finn', quote: '"Anh ơi! Có thư khẩn từ làng... lại đây!"' },
    { speaker: 'Neris', quote: '"Thuốc thảo mộc của anh xong rồi... mau qua đây..."' },
    { speaker: 'Giọng Quen', quote: '"Ai đó... đang thì thào gọi tên bạn từ trong sương..."' }
  ];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    // Chọn ngẫu nhiên câu thoại mồi nhử đánh lừa người chơi
    const chosen = Phaser.Utils.Array.GetRandom(WhisperTrap.LURE_OPTIONS);
    this.speakerName = chosen.speaker;
    this.voiceSnippet = chosen.quote;
    this.promptText = `[E] Đáp lại tiếng gọi quen thuộc... (${chosen.speaker}?)`;

    this.container = scene.add.container(x, y);
    this.container.setDepth(Math.floor(y) + 15);

    // Đốm sáng lập lòe yếu ớt lệch khỏi đường mòn
    this.lightGfx = scene.add.graphics();
    this.container.add(this.lightGfx);
    this.drawLight();

    // Dòng chữ thì thầm mờ ảo trôi dạt phía trên đốm sáng
    this.floatingText = HDTextHelper.createText(scene, 0, -30, chosen.quote, {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#f9e79f',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.container.add(this.floatingText);

    // Hiệu ứng lập lòe nhấp nháy yếu ớt (faint flickering)
    this.pulseTween = scene.tweens.add({
      targets: this.container,
      alpha: { from: 0.35, to: 0.85 },
      scaleX: { from: 0.9, to: 1.12 },
      scaleY: { from: 0.9, to: 1.12 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private drawLight(): void {
    this.lightGfx.clear();
    // Vầng hào quang ánh sáng giả dối (Deceptive Mist Light)
    this.lightGfx.fillStyle(0xf9e79f, 0.12);
    this.lightGfx.fillCircle(0, 0, 48);
    this.lightGfx.fillStyle(0xfad7a0, 0.22);
    this.lightGfx.fillCircle(0, 0, 26);
    this.lightGfx.fillStyle(0xfef9e7, 0.6);
    this.lightGfx.fillCircle(0, 0, 10);
    this.lightGfx.fillStyle(0xffffff, 0.92);
    this.lightGfx.fillCircle(0, 0, 3.5);
  }

  public update(dt: number): boolean {
    if (!this.active || this.isFading) return false;

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.fadeOutAndDestroy();
      return false;
    }
    return true;
  }

  /**
   * Tự động tan biến sau 15 giây nếu người chơi tỉnh táo làm ngơ
   */
  public fadeOutAndDestroy(): void {
    if (!this.active || this.isFading) return;
    this.isFading = true;

    if (this.pulseTween) {
      this.pulseTween.stop();
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 0.4,
      scaleY: 0.4,
      duration: 1000,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });
  }

  public destroy(): void {
    this.active = false;
    if (this.pulseTween) this.pulseTween.stop();
    if (this.container) {
      this.container.destroy();
    }
  }
}
