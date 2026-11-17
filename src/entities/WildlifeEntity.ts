import * as Phaser from 'phaser';
import { WildlifeSpec, WildlifeSpecies, WildlifeState, WildlifeSpookEvent } from '../types';
import { AudioManager } from '../audio/AudioManager';

export class WildlifeEntity extends Phaser.GameObjects.Container {
  public spec: WildlifeSpec;
  public species: WildlifeSpecies;
  public state: WildlifeState;
  public isHibernating: boolean = false;

  public originalX: number;
  public originalY: number;

  private gfx: Phaser.GameObjects.Graphics;
  private glowGfx?: Phaser.GameObjects.Graphics;

  // Thuộc tính hành vi Quạ
  private idleTimer: number = 0;
  private respawnTimer: number = 0;
  private headBobTimer: number = 0;
  private isAlerted: boolean = false;
  private flightTween?: Phaser.Tweens.Tween;

  // Thuộc tính hành vi Bướm Đêm
  private flutterSeed: number;
  private wingPhase: number = 0;
  private mothIndex: number;
  private lightOrbitRadius: number;

  constructor(scene: Phaser.Scene, spec: WildlifeSpec, index: number = 0) {
    super(scene, spec.x, spec.y);
    this.spec = spec;
    this.species = spec.species;
    this.originalX = spec.x;
    this.originalY = spec.y;
    this.mothIndex = index;
    this.flutterSeed = Math.random() * 1000 + index * 50;
    this.lightOrbitRadius = 36 + (index % 4) * 12;

    this.state = this.species === 'crow' ? 'perched' : 'fluttering';

    // Đồ họa vẽ vector pixel
    if (this.species === 'lantern_moth') {
      this.glowGfx = scene.add.graphics();
      this.add(this.glowGfx);
    }
    this.gfx = scene.add.graphics();
    this.add(this.gfx);

    this.setDepth(this.species === 'crow' ? 3500 : 5010);

    if (this.species === 'crow') {
      this.drawCrowPerched(0);
    } else {
      this.drawLanternMoth(0);
    }

    scene.add.existing(this);
  }

  // =========================================================================
  // PHẦN 1: ĐỒ HỌA & HÀNH VI QUẠ RỪNG (CROW — HW-ANI-AMBIENT-000001)
  // =========================================================================

  private drawCrowPerched(headBobOffset: number = 0): void {
    const g = this.gfx;
    g.clear();

    // 1. Bóng đổ chân mờ mịn
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(0, 6, 12, 4);

    // 2. Móng vuốt bám cành cây/hàng rào (Dark slate gray)
    g.fillStyle(0x272730, 1);
    g.fillRect(-4, 3, 2, 4);
    g.fillRect(2, 3, 2, 4);

    // 3. Đuôi lông dài vuốt nhọn phía sau
    g.fillStyle(0x13131a, 1);
    g.fillTriangle(-4, 2, -12, 5, -5, -2);

    // 4. Thân quạ hình bầu dục thon gọn
    g.fillStyle(0x1a1a24, 1);
    g.fillEllipse(0, 0, 14, 10);

    // 5. Cánh gập màu lông vũ than đen kèm vệt sáng xanh xám
    g.fillStyle(0x28283a, 1);
    g.fillEllipse(-1, -1, 10, 6);
    g.fillStyle(0x38384e, 0.7);
    g.fillRect(-3, -2, 5, 2);

    // 6. Đầu quạ nhấp nhô
    const hy = -6 + headBobOffset;
    g.fillStyle(0x181822, 1);
    g.fillCircle(4, hy, 4);

    // 7. Mỏ nhọn sắc bén (Crow Beak)
    g.fillStyle(0x3a3a46, 1);
    g.fillTriangle(7, hy - 2, 12, hy, 7, hy + 2);

    // 8. Mắt đen ánh hổ phách cảnh giác
    g.fillStyle(this.isAlerted ? 0xe67e22 : 0x0a0a0e, 1);
    g.fillCircle(5, hy - 1, 1);
  }

  private drawCrowFlying(wingPhase: number): void {
    const g = this.gfx;
    g.clear();

    const wingSpan = Math.sin(wingPhase);
    const wingHeight = wingSpan * 9;

    // 1. Thân quạ khi bay lượn
    g.fillStyle(0x14141c, 1);
    g.fillEllipse(0, 0, 15, 6);

    // 2. Đuôi quạ xòe nhẹ
    g.fillStyle(0x181822, 1);
    g.fillTriangle(-6, 0, -14, -3, -14, 3);

    // 3. Đầu quạ vươn tới hướng bay
    g.fillStyle(0x161620, 1);
    g.fillCircle(7, -1, 3.5);
    g.fillStyle(0x3a3a46, 1);
    g.fillTriangle(10, -2, 14, -1, 10, 0);

    // 4. Hai cánh quạ dang rộng vỗ nhịp nhàng
    g.fillStyle(0x28283a, 1);
    // Cánh trái
    g.fillTriangle(-2, -1, -6, -8 - wingHeight, 5, -2);
    // Cánh phải
    g.fillTriangle(-2, 1, -6, 8 + wingHeight, 5, 2);

    // Viền lông cánh ánh xanh than
    g.fillStyle(0x3e3e54, 0.8);
    g.fillRect(-5, -6 - wingHeight, 3, 2);
    g.fillRect(-5, 5 + wingHeight, 3, 2);
  }

  /**
   * Quạ giật mình vỗ cánh bay lên trời (Spook Trigger)
   */
  public spook(cause: 'player_sprint' | 'player_attack' | 'listener_near' | 'flare_ignite'): void {
    if (this.species !== 'crow' || this.state === 'spooked' || this.isHibernating) {
      return;
    }

    this.state = 'spooked';
    this.isAlerted = true;

    // Phát âm thanh tiếng quạ kêu chói tai & đập cánh
    AudioManager.getInstance().playCrowCaw();

    // Phát sự kiện cảnh báo toàn hệ thống (GameScene & ListenerAI nhận diện)
    const spookEvent: WildlifeSpookEvent = {
      crowId: this.spec.id,
      x: this.x,
      y: this.y,
      cause,
      noiseRadius: cause === 'listener_near' ? 220 : 320
    };
    this.scene.events.emit('wildlife_spooked', spookEvent);

    // Hướng bay: ngẫu nhiên hơi lệch trái hoặc phải (-1 hoặc +1)
    const flightDir = Math.random() > 0.5 ? 1 : -1;
    this.scaleX = flightDir;

    // Tween vỗ cánh bay vút lên bầu trời
    this.flightTween = this.scene.tweens.add({
      targets: this,
      x: this.x + flightDir * 95,
      y: this.y - 145,
      alpha: 0,
      duration: 1350,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        this.wingPhase += 0.45;
        this.drawCrowFlying(this.wingPhase);
      },
      onComplete: () => {
        this.setVisible(false);
        // Hồi sinh sau 20 - 30 giây khi yên tĩnh trở lại
        this.respawnTimer = 22000 + Math.random() * 8000;
      }
    });
  }

  private updateCrow(
    dt: number,
    playerX: number,
    playerY: number,
    isPlayerSprinting: boolean,
    isPlayerAttacking: boolean,
    listenerX?: number,
    listenerY?: number,
    isListenerActive?: boolean
  ): void {
    // Nếu quạ đã bay đi, đếm ngược thời gian hồi sinh
    if (this.state === 'spooked') {
      if (this.respawnTimer > 0) {
        this.respawnTimer -= dt * 1000;
        if (this.respawnTimer <= 0) {
          // Quay về cành cây ban đầu
          this.x = this.originalX;
          this.y = this.originalY;
          this.alpha = 1;
          this.state = 'perched';
          this.isAlerted = false;
          this.setVisible(true);
          this.drawCrowPerched(0);
        }
      }
      return;
    }

    const distToPlayer = Math.hypot(playerX - this.x, playerY - this.y);

    // 1. Kiểm tra mối đe dọa từ THE LISTENER (Quạ cảnh giác tự nhiên)
    if (isListenerActive && listenerX !== undefined && listenerY !== undefined) {
      const distToListener = Math.hypot(listenerX - this.x, listenerY - this.y);
      if (distToListener < 165) {
        this.spook('listener_near');
        return;
      }
    }

    // 2. Kiểm tra mối đe dọa từ NGƯỜI CHƠI (Đòn đánh hoặc Chạy nước rút ồn ào)
    if (isPlayerAttacking && distToPlayer < 220) {
      this.spook('player_attack');
      return;
    }

    if (isPlayerSprinting && distToPlayer < 140) {
      this.spook('player_sprint');
      return;
    }

    if (!isPlayerSprinting && distToPlayer < 52) {
      this.spook('player_sprint');
      return;
    }

    // 3. Trạng thái cảnh giác (Alert) khi người chơi ở cự ly vừa phải (53 - 90px)
    if (distToPlayer <= 90) {
      if (!this.isAlerted) {
        this.isAlerted = true;
        this.state = 'alert';
      }
      this.headBobTimer += dt * 8;
      const bob = Math.sin(this.headBobTimer) > 0.4 ? -1.5 : 0;
      this.drawCrowPerched(bob);
      // Hướng mặt về phía người chơi
      this.scaleX = playerX >= this.x ? 1 : -1;
      return;
    }

    // 4. Trạng thái đậu yên bình (Perched Idle)
    if (this.isAlerted) {
      this.isAlerted = false;
      this.state = 'perched';
    }

    this.idleTimer += dt;
    if (this.idleTimer >= 3.2) {
      this.idleTimer = 0;
      const bob = Math.random() > 0.5 ? -1 : 0;
      this.drawCrowPerched(bob);
    }
  }

  // =========================================================================
  // PHẦN 2: ĐỒ HỌA & HÀNH VI BƯỚM ĐÊM HỔ PHÁCH (LANTERN MOTH — HW-ANI-AMBIENT-000002)
  // =========================================================================

  private drawLanternMoth(wingPhase: number): void {
    const g = this.gfx;
    g.clear();

    const wingFlap = Math.abs(Math.sin(wingPhase));
    const wingW = 4 + wingFlap * 4.5;
    const wingH = 5 + wingFlap * 2;

    // 1. Thân bướm đêm hổ phách mảnh dẻ
    g.fillStyle(0x78390b, 1);
    g.fillEllipse(0, 0, 2.5, 7);

    // 2. Hai cánh trước lân tinh mỏng màu vàng hổ phách (Gossamer Amber Wings)
    g.fillStyle(0xffe082, 0.85);
    g.lineStyle(0.8, 0xf39c12, 0.95);

    // Cánh trái trên & dưới
    g.fillEllipse(-wingW, -2, wingW, wingH);
    g.strokeEllipse(-wingW, -2, wingW, wingH);
    g.fillEllipse(-wingW * 0.75, 2.5, wingW * 0.75, wingH * 0.75);

    // Cánh phải trên & dưới
    g.fillEllipse(wingW, -2, wingW, wingH);
    g.strokeEllipse(wingW, -2, wingW, wingH);
    g.fillEllipse(wingW * 0.75, 2.5, wingW * 0.75, wingH * 0.75);

    // 3. Đốm phấn phát quang ở chóp cánh
    g.fillStyle(0xfff9c4, 0.95);
    g.fillCircle(-wingW * 1.1, -2, 0.9);
    g.fillCircle(wingW * 1.1, -2, 0.9);

    // 4. Quầng sáng lân tinh dịu mắt
    if (this.glowGfx) {
      this.glowGfx.clear();
      this.glowGfx.fillStyle(0xffb300, 0.18);
      this.glowGfx.fillCircle(0, 0, 16);
      this.glowGfx.fillStyle(0xffe082, 0.28);
      this.glowGfx.fillCircle(0, 0, 8);
    }
  }

  private updateLanternMoth(
    dt: number,
    timePhase: 'DAY' | 'DUSK' | 'NIGHT',
    playerLightPos?: { x: number; y: number; active: boolean },
    campfirePos?: { x: number; y: number; active: boolean }
  ): void {
    // Ban ngày bướm đêm ẩn mình trong tán cây/rễ ẩm (Fade Out)
    if (timePhase === 'DAY') {
      if (this.alpha > 0) {
        this.alpha = Math.max(0, this.alpha - dt * 1.8);
        if (this.alpha === 0) this.setVisible(false);
      }
      return;
    }

    // Hoàng hôn và Đêm sương: Hiện lên và bay lượn (Fade In)
    if (!this.visible) this.setVisible(true);
    if (this.alpha < 1) {
      this.alpha = Math.min(1, this.alpha + dt * 1.5);
    }

    // Nhịp vỗ cánh nhanh thanh thoát (8 - 12 Hz)
    this.wingPhase += dt * 16;
    this.drawLanternMoth(this.wingPhase);

    this.flutterSeed += dt * 2.2;
    const wobbleX = Math.cos(this.flutterSeed) * 16 * dt;
    const wobbleY = Math.sin(this.flutterSeed * 1.4) * 12 * dt;

    // 1. ƯU TIÊN 1: Hướng về ánh sáng Đèn Lồng [F] của người chơi nếu đang bật trong cự ly 220px
    if (playerLightPos && playerLightPos.active) {
      const distToLight = Math.hypot(playerLightPos.x - this.x, playerLightPos.y - this.y);
      if (distToLight < 220) {
        // Quỹ đạo lượn tròn nhẹ quanh ngọn đèn lồng của người chơi
        const orbitAngle = this.flutterSeed * 0.9 + this.mothIndex * 1.2;
        const targetX = playerLightPos.x + Math.cos(orbitAngle) * this.lightOrbitRadius;
        const targetY = playerLightPos.y + Math.sin(orbitAngle) * (this.lightOrbitRadius * 0.7);

        this.x = Phaser.Math.Linear(this.x, targetX, 0.045);
        this.y = Phaser.Math.Linear(this.y, targetY, 0.045);
        this.state = 'fluttering';
        return;
      }
    }

    // 2. ƯU TIÊN 2: Hướng về Lửa Trại Làng Bellhollow nếu đang cháy trong cự ly 260px
    if (campfirePos && campfirePos.active) {
      const distToCamp = Math.hypot(campfirePos.x - this.x, campfirePos.y - this.y);
      if (distToCamp < 260) {
        const orbitAngle = this.flutterSeed * 0.7 + this.mothIndex * 1.5;
        const targetX = campfirePos.x + Math.cos(orbitAngle) * 55;
        const targetY = campfirePos.y + Math.sin(orbitAngle) * 40;

        this.x = Phaser.Math.Linear(this.x, targetX, 0.035);
        this.y = Phaser.Math.Linear(this.y, targetY, 0.035);
        this.state = 'fluttering';
        return;
      }
    }

    // 3. MẶC ĐỊNH: Bay lượn dập dờn tự nhiên quanh điểm sinh ban đầu (Bụi cây/vườn thảo dược)
    const floatRadius = 38;
    const targetBaseX = this.originalX + Math.cos(this.flutterSeed * 0.5) * floatRadius;
    const targetBaseY = this.originalY + Math.sin(this.flutterSeed * 0.6) * (floatRadius * 0.6);

    this.x = Phaser.Math.Linear(this.x, targetBaseX + wobbleX, 0.03);
    this.y = Phaser.Math.Linear(this.y, targetBaseY + wobbleY, 0.03);
  }

  // =========================================================================
  // PHẦN 3: VÒNG ĐỜI & CULLING KIỂM SOÁT HIỆU NĂNG WEBGL
  // =========================================================================

  public setHibernating(hibernating: boolean): void {
    if (this.isHibernating === hibernating) return;
    this.isHibernating = hibernating;
    this.state = hibernating ? 'hibernating' : (this.species === 'crow' ? 'perched' : 'fluttering');
    this.setVisible(!hibernating);
  }

  public update(
    _time: number,
    delta: number,
    context: {
      playerX: number;
      playerY: number;
      isPlayerSprinting: boolean;
      isPlayerAttacking: boolean;
      timePhase: 'DAY' | 'DUSK' | 'NIGHT';
      listenerX?: number;
      listenerY?: number;
      isListenerActive?: boolean;
      playerLightPos?: { x: number; y: number; active: boolean };
      campfirePos?: { x: number; y: number; active: boolean };
    }
  ): void {
    if (this.isHibernating) return;

    const dt = delta / 1000;

    if (this.species === 'crow') {
      this.updateCrow(
        dt,
        context.playerX,
        context.playerY,
        context.isPlayerSprinting,
        context.isPlayerAttacking,
        context.listenerX,
        context.listenerY,
        context.isListenerActive
      );
    } else {
      this.updateLanternMoth(
        dt,
        context.timePhase,
        context.playerLightPos,
        context.campfirePos
      );
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.flightTween) {
      this.flightTween.stop();
      this.flightTween = undefined;
    }
    if (this.glowGfx) {
      this.glowGfx.destroy();
      this.glowGfx = undefined;
    }
    if (this.gfx) {
      this.gfx.destroy();
    }
    super.destroy(fromScene);
  }
}
