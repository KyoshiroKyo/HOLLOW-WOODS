import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { SPRITE_FOG_SMOOTH, DEPTH_VEIL_GROUND_FOG, DEPTH_VEIL_PINK_DAWN } from '../config/Constants';
import { HDTextHelper } from '../utils/HDTextHelper';
import { TimeSystem } from './TimeSystem';

export class VeilSystem {
  private scene: Phaser.Scene;
  private playerState: PlayerState;

  // C4-13-06: Hệ thống sương mù đa tầng Parallax 3 lớp mờ ảo (Ground, Mid, High)
  private fogLayerGround: Phaser.GameObjects.TileSprite;
  private fogLayerMid: Phaser.GameObjects.TileSprite;
  private fogLayerHigh: Phaser.GameObjects.TileSprite;

  // C4-134-01: Lớp sương huyền ảo màu hồng ban mai (Mystical Pastel/Morning Pink Mist) tại phân khu khởi đầu
  private fogLayerPinkDawn: Phaser.GameObjects.TileSprite;
  private fogLayerPinkGlow: Phaser.GameObjects.TileSprite;

  // Biến tích lũy trôi dạt tự nhiên (Autonomous Drift)
  private driftGroundX: number = 0;
  private driftMidX: number = 0;
  private driftHighX: number = 0;
  private driftPinkDawnX: number = 0;
  private driftPinkGlowX: number = 0;

  // C4-13-20: Màn sương chuyển cảnh mượt mà khi bước qua ranh giới phân khu chính (Mist Fade Transition ~0.35s)
  private transitionMistOverlay: Phaser.GameObjects.Graphics;
  private isTransitioningMist: boolean = false;

  // V14-P7-01: Chỉ báo thị giác khi tiếng động bị mưa sương át (Rain Threat Visual Indicator)
  private rainAuraThreatOverlay: Phaser.GameObjects.Graphics;
  private hasThreatAuraDrawn: boolean = false;
  
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

    // 1. TẦNG SƯƠNG LÀ LÀ MẶT ĐẤT (Ground-Level Drift Mist - Depth -7000)
    // Nằm ngay trên nền cỏ/đường mòn (-10000), bên dưới mọi nhân vật, NPC và công trình để tăng chiều sâu (kể cả vùng tọa độ âm như Rừng Sâu)
    this.fogLayerGround = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayerGround.setOrigin(0, 0);
    this.fogLayerGround.setScrollFactor(0);
    this.fogLayerGround.setDepth(DEPTH_VEIL_GROUND_FOG);
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

    // 4. C4-134-01: TẦNG SƯƠNG HỒNG BAN MAI (Morning Pink Mist - Depth -6900)
    // Phủ lên mặt đất phân khu khởi đầu Fog Crossing, tạo không gian huyền ảo lung linh
    this.fogLayerPinkDawn = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayerPinkDawn.setOrigin(0, 0);
    this.fogLayerPinkDawn.setScrollFactor(0);
    this.fogLayerPinkDawn.setDepth(DEPTH_VEIL_PINK_DAWN);
    this.fogLayerPinkDawn.setTint(0xff94b8);
    this.fogLayerPinkDawn.setAlpha(0.48);
    this.fogLayerPinkDawn.setTileScale(1.2, 1.15);

    // 5. C4-134-01: TẦNG ÁNH SƯƠNG HỒNG HUYỀN ẢO (Mystical Pink Glow - Depth 455)
    // Tầng sương lững lờ lưng chừng thân cây và tán lá
    this.fogLayerPinkGlow = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayerPinkGlow.setOrigin(0, 0);
    this.fogLayerPinkGlow.setScrollFactor(0);
    this.fogLayerPinkGlow.setDepth(455);
    this.fogLayerPinkGlow.setTint(0xf472b6);
    this.fogLayerPinkGlow.setAlpha(0.34);
    this.fogLayerPinkGlow.setTileScale(1.3, 1.25);

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

    // 5. V14-P7-01: CHỈ BÁO THỊ GIÁC NGUY HIỂM KHI MƯA SƯƠNG ÁT ÂM THANH (Visual Threat Indicator - Depth 3200)
    // Hiển thị viền đỏ hổ phách rung động ở rìa màn hình hỗ trợ trợ năng (Accessibility)
    this.rainAuraThreatOverlay = scene.add.graphics();
    this.rainAuraThreatOverlay.setScrollFactor(0);
    this.rainAuraThreatOverlay.setDepth(3200);
    this.rainAuraThreatOverlay.setAlpha(0);
  }

  public update(time: number, delta: number, inDeepFogZone: boolean, zoneId?: string, playerX?: number, timeSystem?: TimeSystem): void {
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
    this.driftPinkDawnX += 14 * dt;
    this.driftPinkGlowX += 9 * dt;

    // Cuộn sương Parallax đồng bộ chuyển động Camera
    this.fogLayerGround.tilePositionX = (camScrollX * 0.15) + this.driftGroundX;
    this.fogLayerGround.tilePositionY = (camScrollY * 0.15) + 3 * Math.sin(time * 0.0009);

    this.fogLayerMid.tilePositionX = (camScrollX * 0.35) + this.driftMidX;
    this.fogLayerMid.tilePositionY = (camScrollY * 0.35) - 2 * Math.cos(time * 0.0007);

    this.fogLayerHigh.tilePositionX = (camScrollX * 0.55) + this.driftHighX;
    this.fogLayerHigh.tilePositionY = (camScrollY * 0.55) + 2 * Math.sin(time * 0.0005);

    // Cuộn sương hồng Parallax
    this.fogLayerPinkDawn.tilePositionX = (camScrollX * 0.20) + this.driftPinkDawnX;
    this.fogLayerPinkDawn.tilePositionY = (camScrollY * 0.20) + 2.5 * Math.sin(time * 0.0008);

    this.fogLayerPinkGlow.tilePositionX = (camScrollX * 0.40) + this.driftPinkGlowX;
    this.fogLayerPinkGlow.tilePositionY = (camScrollY * 0.40) - 2.0 * Math.cos(time * 0.0006);

    // Tính toán độ đậm nhạt & đổi màu của sương hồng theo phong cách "Con đường sương mù" Doraemon:
    // Tại điểm xuất phát / cửa ngõ (x <= 160): sương mù phủ dày đặc (alpha: 0.48, tone hồng/tím sương mai 0xFF94B8 / 0xF472B6)
    // Khi nhân vật tiến sâu dần về phía làng Bellhollow (x: 160 -> 560):
    // Lớp sương tự động giảm độ đậm (alpha từ 0.48 xuống 0.05 rồi tan dần) và chuyển sắc sang tone sương đêm tự nhiên (0x1a2620)
    let pinkFactor = 0;
    if (playerX !== undefined) {
      if (playerX <= 160) {
        pinkFactor = 1.0;
      } else if (playerX < 560) {
        pinkFactor = (560 - playerX) / 400; // Giảm đều từ 1.0 -> 0.0
      } else {
        pinkFactor = 0;
      }
    } else if (zoneId === 'fog_crossing') {
      pinkFactor = 1.0;
    }

    // Đổi màu chuyển sắc từ tone hồng sương mai / tím khói sang tone sương đêm tự nhiên (0x1a2620)
    const dawnR = Math.round(Phaser.Math.Linear(0x1a, 0xff, pinkFactor));
    const dawnG = Math.round(Phaser.Math.Linear(0x26, 0x94, pinkFactor));
    const dawnB = Math.round(Phaser.Math.Linear(0x20, 0xb8, pinkFactor));
    this.fogLayerPinkDawn.setTint((dawnR << 16) | (dawnG << 8) | dawnB);

    const glowR = Math.round(Phaser.Math.Linear(0x18, 0xf4, pinkFactor));
    const glowG = Math.round(Phaser.Math.Linear(0x24, 0x72, pinkFactor));
    const glowB = Math.round(Phaser.Math.Linear(0x1d, 0xb6, pinkFactor));
    this.fogLayerPinkGlow.setTint((glowR << 16) | (glowG << 8) | glowB);

    // Alpha giảm mượt từ 0.48 xuống 0.05 theo pinkFactor
    let targetPinkDawnAlpha = pinkFactor > 0 ? (0.05 + 0.43 * pinkFactor) : 0;
    let targetPinkGlowAlpha = pinkFactor > 0 ? (0.03 + 0.31 * pinkFactor) : 0;

    // Khi bật Đèn Lồng [F]: ánh sáng đèn khoét thủng và làm sương tản bớt ra xung quanh
    if (isLanternOn) {
      targetPinkDawnAlpha *= 0.65;
      targetPinkGlowAlpha *= 0.55;
    }

    this.fogLayerPinkDawn.alpha = Phaser.Math.Linear(this.fogLayerPinkDawn.alpha, targetPinkDawnAlpha, 0.05);
    this.fogLayerPinkGlow.alpha = Phaser.Math.Linear(this.fogLayerPinkGlow.alpha, targetPinkGlowAlpha, 0.05);

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

    // V1.4: Tích hợp hệ số nhân alpha và sắc độ sương mù theo chu kỳ Ngày / Hoàng Hôn / Đêm Sương
    if (timeSystem) {
      const alphaMult = timeSystem.getFogAlphaMultiplier();
      targetAlphaGround *= alphaMult;
      targetAlphaMid *= alphaMult;
      targetAlphaHigh *= alphaMult;

      const fogTint = timeSystem.getFogTint();
      this.fogLayerGround.setTint(fogTint);
      this.fogLayerMid.setTint(fogTint);
      this.fogLayerHigh.setTint(fogTint);
    }

    // Chuyển dịch alpha êm ái hơn với lerp factor 0.04 (chống giật nấc khi qua cổng chuyển vùng)
    this.fogLayerGround.alpha = Phaser.Math.Linear(this.fogLayerGround.alpha, targetAlphaGround, 0.04);
    this.fogLayerMid.alpha = Phaser.Math.Linear(this.fogLayerMid.alpha, targetAlphaMid, 0.04);
    this.fogLayerHigh.alpha = Phaser.Math.Linear(this.fogLayerHigh.alpha, targetAlphaHigh, 0.04);

    // 3. Xử lý hiệu ứng Tâm Lý Kinh Dị khi Composure < 50 hoặc ở vùng sương sâu mà tắt đèn
    const isMindUnstable = composure < 50 || (inDeepFogZone && !isLanternOn);
    this.updatePsychologicalEffects(time, isMindUnstable, composure);
  }

  /**
   * V14-P8-01: Hệ số phân tán sương mù khi bật Đèn Lồng (0.65 khi bật, 1.0 khi tắt).
   * Cung cấp chỉ số đồng bộ hóa nhất quán giữa lớp sương cuộn Parallax (VeilSystem)
   * và vùng sáng đèn lồng (GameScene FogOfWarLayer / Lantern Lighting).
   */
  public getLanternDissipationFactor(): number {
    return this.playerState.stats.isLanternOn ? 0.65 : 1.0;
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

  /**
   * V14-P7-01: Hiển thị chỉ báo thị giác (Visual Threat Indicator) dạng viền rung hổ phách/đỏ sương mù
   * khi trời mưa/sương dày làm át tiếng động (acoustic dampening) và kẻ săn mồi (The Listener) đang đến gần.
   */
  public updateRainThreatVisualIndicator(listenerDist: number, isRaining: boolean): void {
    if (!isRaining || listenerDist >= 260 || listenerDist < 0) {
      if (this.hasThreatAuraDrawn) {
        this.rainAuraThreatOverlay.clear();
        this.rainAuraThreatOverlay.setAlpha(0);
        this.hasThreatAuraDrawn = false;
      }
      return;
    }

    const proximityFactor = Math.max(0, Math.min(1, 1 - listenerDist / 260));
    const pulseAlpha = proximityFactor * (0.28 + 0.18 * Math.sin(Date.now() * 0.007));

    this.rainAuraThreatOverlay.clear();
    // Màu đỏ hổ phách cảnh báo sương mù (0xba3c1e)
    this.rainAuraThreatOverlay.fillStyle(0xba3c1e, pulseAlpha);
    // Viền cảnh báo 4 phía màn hình HD 1280x720
    const borderThickness = Math.round(18 + proximityFactor * 22);
    this.rainAuraThreatOverlay.fillRect(0, 0, 1280, borderThickness);
    this.rainAuraThreatOverlay.fillRect(0, 720 - borderThickness, 1280, borderThickness);
    this.rainAuraThreatOverlay.fillRect(0, 0, borderThickness, 720);
    this.rainAuraThreatOverlay.fillRect(1280 - borderThickness, 0, borderThickness, 720);
    this.rainAuraThreatOverlay.setAlpha(1);
    this.hasThreatAuraDrawn = true;
  }

  /**
   * V14-P7-01: Thu dọn sạch tài nguyên VFX, overlay và tween khi chuyển Scene / chuyển Zone
   */
  public cleanupTransitionVFX(): void {
    if (this.activeWhisperTween) {
      this.activeWhisperTween.stop();
      this.scene.tweens.remove(this.activeWhisperTween);
      this.activeWhisperTween = undefined;
    }
    if (this.hasDistortionDrawn) {
      this.distortionOverlay.clear();
      this.hasDistortionDrawn = false;
    }
    if (this.hasThreatAuraDrawn) {
      this.rainAuraThreatOverlay.clear();
      this.rainAuraThreatOverlay.setAlpha(0);
      this.hasThreatAuraDrawn = false;
    }
    this.whisperText.setAlpha(0);
    this.transitionMistOverlay.setAlpha(0);
    this.isTransitioningMist = false;
  }

  public destroy(): void {
    this.cleanupTransitionVFX();
    this.rainAuraThreatOverlay.destroy();
    this.transitionMistOverlay.destroy();
    this.distortionOverlay.destroy();
    this.whisperText.destroy();
    this.fogLayerGround.destroy();
    this.fogLayerMid.destroy();
    this.fogLayerHigh.destroy();
    this.fogLayerPinkDawn.destroy();
    this.fogLayerPinkGlow.destroy();
  }
}

