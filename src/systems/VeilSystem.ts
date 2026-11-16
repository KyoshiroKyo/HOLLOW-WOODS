import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { SPRITE_FOG_SMOOTH } from '../config/Constants';
import { HDTextHelper } from '../utils/HDTextHelper';

export class VeilSystem {
  private scene: Phaser.Scene;
  private playerState: PlayerState;

  // C4-13-06: Hệ thống sương mù đa tầng Parallax 3 lớp mờ ảo (Ground, Mid, High)
  private fogLayerGround: Phaser.GameObjects.TileSprite;
  private fogLayerMid: Phaser.GameObjects.TileSprite;
  private fogLayerHigh: Phaser.GameObjects.TileSprite;

  // Biến tích lũy trôi dạt tự nhiên (Autonomous Drift)
  private driftGroundX: number = 0;
  private driftMidX: number = 0;
  private driftHighX: number = 0;

  // C4-13-20: Màn sương chuyển cảnh mượt mà khi bước qua ranh giới phân khu chính (Mist Fade Transition ~0.35s)
  private transitionMistOverlay: Phaser.GameObjects.Graphics;
  private isTransitioningMist: boolean = false;
  
  // Hiệu ứng nhận thức tâm lý (Psychological Horror)
  private whisperText: Phaser.GameObjects.Text;
  private distortionOverlay: Phaser.GameObjects.Graphics;
  private nextWhisperTime: number = 0;

  private whispers: string[] = [
    '“Satyr... quay lại đi... con đường về nhà ở phía sau...”',
    '“Đừng nghe bà lão... tiếng chuông sẽ giết chết tất cả...”',
    '“Có kẻ đang thở ngay sau gáy ngươi...”',
    '“Khu rừng nhớ rõ ngươi... ngươi đã từng ở đây...”',
    '“Chiếc đèn thứ hai... hãy đi theo chiếc đèn thứ hai...”'
  ];
  private hasDistortionDrawn: boolean = false;
  private activeWhisperTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();

    // 1. TẦNG SƯƠNG LÀ LÀ MẶT ĐẤT (Ground-Level Drift Mist - Depth -40)
    // Nằm ngay trên nền cỏ/đường mòn (-98), bên dưới nhân vật, NPC và công trình để tăng chiều sâu
    this.fogLayerGround = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayerGround.setOrigin(0, 0);
    this.fogLayerGround.setScrollFactor(0);
    this.fogLayerGround.setDepth(-40);
    this.fogLayerGround.setAlpha(0.24);
    this.fogLayerGround.setTileScale(1.15, 1.1);

    // 2. TẦNG SƯƠNG LƯNG CHỪNG THÂN CÂY (Mid-Canopy Atmospheric Mist - Depth 450)
    // Đan xen giữa thân cây và mái nhà, tạo cảm giác mờ ảo sương rừng
    this.fogLayerMid = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayerMid.setOrigin(0, 0);
    this.fogLayerMid.setScrollFactor(0);
    this.fogLayerMid.setDepth(450);
    this.fogLayerMid.setAlpha(0.18);
    this.fogLayerMid.setTileScale(1.35, 1.25);

    // 3. TẦNG SƯƠNG MÂY TRÊN CAO (Upper Canopy Ambient Veil - Depth 2800)
    // Bao phủ trên ngọn cây, trôi chậm theo gió, bên dưới giao diện HUD/UI
    this.fogLayerHigh = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayerHigh.setOrigin(0, 0);
    this.fogLayerHigh.setScrollFactor(0);
    this.fogLayerHigh.setDepth(2800);
    this.fogLayerHigh.setAlpha(0.14);
    this.fogLayerHigh.setTileScale(1.55, 1.45);

    this.distortionOverlay = scene.add.graphics();
    this.distortionOverlay.setScrollFactor(0);
    this.distortionOverlay.setDepth(5600);

    // Dòng chữ thì thầm tâm lý ma quái ở góc trên màn hình chuẩn HD 1280×720
    this.whisperText = HDTextHelper.createText(scene, 640, 110, '', {
      fontSize: '16px',
      fontStyle: 'italic',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(9900).setAlpha(0);

    // 4. C4-13-20: MÀN SƯƠNG CHUYỂN CẢNH MƯỢT MÀ (Mist Fade Transition - Depth 8400)
    // Phủ toàn màn hình ngay dưới HUD (8500), tạo hiệu ứng sương rừng cuộn trào khi qua phân khu mới
    this.transitionMistOverlay = scene.add.graphics();
    this.transitionMistOverlay.setScrollFactor(0);
    this.transitionMistOverlay.setDepth(8400);
    this.transitionMistOverlay.setAlpha(0);
    this.transitionMistOverlay.fillStyle(0x131d18, 0.88);
    this.transitionMistOverlay.fillRect(0, 0, 1280, 720);
  }

  public update(time: number, delta: number, inDeepFogZone: boolean, zoneId?: string): void {
    const dt = delta / 1000;
    const composure = this.playerState.stats.composure;
    const isLanternOn = this.playerState.stats.isLanternOn;
    const cam = this.scene.cameras.main;
    const camScrollX = cam ? cam.scrollX : 0;
    const camScrollY = cam ? cam.scrollY : 0;

    // 1. Cập nhật tích lũy trôi dạt tự nhiên đa vận tốc
    this.driftGroundX += 12 * dt;
    this.driftMidX += 19 * dt;
    this.driftHighX += 7 * dt;

    // Cuộn sương Parallax đồng bộ chuyển động Camera
    this.fogLayerGround.tilePositionX = (camScrollX * 0.15) + this.driftGroundX;
    this.fogLayerGround.tilePositionY = (camScrollY * 0.15) + 3 * Math.sin(time * 0.0009);

    this.fogLayerMid.tilePositionX = (camScrollX * 0.35) + this.driftMidX;
    this.fogLayerMid.tilePositionY = (camScrollY * 0.35) - 2 * Math.cos(time * 0.0007);

    this.fogLayerHigh.tilePositionX = (camScrollX * 0.55) + this.driftHighX;
    this.fogLayerHigh.tilePositionY = (camScrollY * 0.55) + 2 * Math.sin(time * 0.0005);

    // 2. C4-13-06: Phân tầng độ đậm nhạt chuyển tiếp tự nhiên theo vùng không gian
    let targetAlphaGround = 0.24;
    let targetAlphaMid = 0.18;
    let targetAlphaHigh = 0.14;

    if (zoneId === 'bellhollow' || zoneId === 'sanctuary_farm') {
      // Vùng làng & nông trại: sương mỏng thanh thoát, thoáng đãng, sắc nét
      targetAlphaGround = 0.22;
      targetAlphaMid = 0.15;
      targetAlphaHigh = 0.11;
    } else if (zoneId === 'outer_woods') {
      // Rừng ngoại vi: sương lượn quanh gốc sồi và bãi trại
      targetAlphaGround = 0.32;
      targetAlphaMid = 0.25;
      targetAlphaHigh = 0.18;
    } else if (zoneId === 'crooked_path' || zoneId === 'fog_crossing') {
      // Đường mòn xuyên sương: sương mù dày hơn
      targetAlphaGround = 0.42;
      targetAlphaMid = 0.34;
      targetAlphaHigh = 0.25;
    } else if (inDeepFogZone || zoneId === 'deep_forest' || zoneId === 'silent_mire' || zoneId === 'broken_bell_shrine') {
      // Vùng rừng sâu và đầm lầy: sương mù dày đặc cuộn trôi
      targetAlphaGround = 0.54;
      targetAlphaMid = 0.44;
      targetAlphaHigh = 0.34;
    }

    // Khi đèn lồng tắt: sương tụ lại dày đặc hơn trong bóng tối
    if (!isLanternOn) {
      targetAlphaGround += 0.14;
      targetAlphaMid += 0.12;
      targetAlphaHigh += 0.08;
    }

    // Chuyển dịch alpha êm ái hơn với lerp factor 0.04 (chống giật nấc khi qua cổng chuyển vùng)
    this.fogLayerGround.alpha = Phaser.Math.Linear(this.fogLayerGround.alpha, targetAlphaGround, 0.04);
    this.fogLayerMid.alpha = Phaser.Math.Linear(this.fogLayerMid.alpha, targetAlphaMid, 0.04);
    this.fogLayerHigh.alpha = Phaser.Math.Linear(this.fogLayerHigh.alpha, targetAlphaHigh, 0.04);

    // 3. Xử lý hiệu ứng Tâm Lý Kinh Dị khi Composure < 50 hoặc ở vùng sương sâu mà tắt đèn
    const isMindUnstable = composure < 50 || (inDeepFogZone && !isLanternOn);
    this.updatePsychologicalEffects(time, isMindUnstable, composure);
  }

  private updatePsychologicalEffects(time: number, unstable: boolean, composure: number): void {
    if (!unstable) {
      if (this.hasDistortionDrawn) {
        this.distortionOverlay.clear();
        this.hasDistortionDrawn = false;
      }
      this.whisperText.setAlpha(0);
      return;
    }

    // Mức độ hoảng loạn từ 0 -> 1
    const panicSeverity = Math.max(0, (50 - composure) / 50);

    // A. Hiệu ứng viền màn hình đỏ tía rùng rợn (Vignette giật cục) chuẩn HD 1280×720
    if (panicSeverity > 0.15) {
      this.distortionOverlay.clear();
      const pulseAlpha = (Math.sin(time * 0.005) * 0.5 + 0.5) * panicSeverity * 0.45;
      this.distortionOverlay.fillStyle(0x3a0d1a, pulseAlpha);
      // Viền 4 góc
      this.distortionOverlay.fillRect(0, 0, 1280, 32);
      this.distortionOverlay.fillRect(0, 720 - 32, 1280, 32);
      this.distortionOverlay.fillRect(0, 0, 32, 720);
      this.distortionOverlay.fillRect(1280 - 32, 0, 32, 720);
      this.hasDistortionDrawn = true;
    } else if (this.hasDistortionDrawn) {
      this.distortionOverlay.clear();
      this.hasDistortionDrawn = false;
    }

    // B. Xuất hiện tiếng thì thầm ma mị từ sương mù (Quy Tắc 1)
    if (time > this.nextWhisperTime) {
      this.nextWhisperTime = time + Phaser.Math.Between(7000, 12000);
      const chosenWhisper = Phaser.Utils.Array.GetRandom(this.whispers);
      
      this.whisperText.setText(chosenWhisper);

      // C4-12-29: Hủy bỏ tween whisper cũ trước khi tạo tween mới để tránh rò rỉ tween manager
      if (this.activeWhisperTween) {
        this.activeWhisperTween.stop();
        this.scene.tweens.remove(this.activeWhisperTween);
        this.activeWhisperTween = undefined;
      }

      this.activeWhisperTween = this.scene.tweens.add({
        targets: this.whisperText,
        alpha: 0.95,
        y: 100,
        duration: 900,
        hold: 3000,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          this.whisperText.setY(110);
          this.activeWhisperTween = undefined;
        }
      });
    }
  }

  /**
   * C4-13-20: Kích hoạt hiệu ứng màn sương chuyển cảnh mượt mà (Mist Fade Transition 0.35 giây)
   * khi người chơi bước qua ranh giới giữa các phân khu chính.
   */
  public triggerZoneTransitionMist(duration: number = 350, onMidpoint?: () => void): void {
    if (this.isTransitioningMist) return;
    this.isTransitioningMist = true;

    const halfDuration = Math.round(duration * 0.48); // ~170ms

    this.scene.tweens.add({
      targets: this.transitionMistOverlay,
      alpha: 0.82,
      duration: halfDuration,
      ease: 'Sine.easeIn',
      onComplete: () => {
        if (onMidpoint) {
          try {
            onMidpoint();
          } catch (e) {
            console.warn('[VeilSystem] onMidpoint error:', e);
          }
        }
        this.scene.tweens.add({
          targets: this.transitionMistOverlay,
          alpha: 0,
          duration: duration - halfDuration,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.isTransitioningMist = false;
          }
        });
      }
    });
  }

  public destroy(): void {
    if (this.activeWhisperTween) {
      this.activeWhisperTween.stop();
      this.scene.tweens.remove(this.activeWhisperTween);
      this.activeWhisperTween = undefined;
    }
    this.transitionMistOverlay.destroy();
    this.distortionOverlay.destroy();
    this.whisperText.destroy();
    this.fogLayerGround.destroy();
    this.fogLayerMid.destroy();
    this.fogLayerHigh.destroy();
  }
}

