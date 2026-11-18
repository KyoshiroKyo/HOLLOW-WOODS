import * as Phaser from 'phaser';
import { HDTextHelper } from '../utils/HDTextHelper';

export interface NPCSpec {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  dialogueKey: string;
  robeColor?: number;
  hoodColor?: number;
  patrolMinX?: number;
  patrolMaxX?: number;
  patrolSpeed?: number;
}

export type NPCDirection = 'down' | 'up' | 'left' | 'right';

export class NPCEntity extends Phaser.GameObjects.Container {
  public spec: NPCSpec;
  public npcSprite: Phaser.GameObjects.Sprite;
  private promptBubble: Phaser.GameObjects.Container;
  private namePlate: Phaser.GameObjects.Container;
  private isPlayerNearby: boolean = false;
  private currentDirection: NPCDirection = 'down';
  private baseId: string = 'garth';

  // Lộ trình tuần tra / đi lại nhẹ quanh vị trí (C4-12-09)
  private patrolMinX: number = 0;
  private patrolMaxX: number = 0;
  private patrolSpeed: number = 20;
  private patrolTargetX: number = 0;
  private isPatrolling: boolean = false;
  private isWaitingAtPatrolPoint: boolean = false;
  private waitTimer: number = 0;
  private bubbleTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, spec: NPCSpec) {
    super(scene, spec.x, spec.y);
    this.spec = spec;

    if (spec.patrolMinX !== undefined && spec.patrolMaxX !== undefined) {
      this.patrolMinX = spec.patrolMinX;
      this.patrolMaxX = spec.patrolMaxX;
      this.patrolSpeed = spec.patrolSpeed ?? 20;
      this.patrolTargetX = spec.patrolMaxX;
      this.isPatrolling = true;
      this.isWaitingAtPatrolPoint = true;
      this.waitTimer = 2500;
    }

    // 1. Đăng ký toàn bộ hoạt ảnh chuẩn hóa cho cả 5 NPC nếu chưa có
    NPCEntity.registerAnimations(scene);

    // 2. Xác định baseId theo id / tên nhân vật
    const lowerId = spec.id.toLowerCase();
    const lowerName = spec.name.toLowerCase();
    if (lowerId.includes('edda') || lowerName.includes('edda')) {
      this.baseId = 'edda';
    } else if (lowerId.includes('neris') || lowerName.includes('neris')) {
      this.baseId = 'neris';
    } else if (lowerId.includes('bram') || lowerName.includes('bram') || lowerId.includes('potter')) {
      this.baseId = 'bram';
    } else if (lowerId.includes('finn') || lowerName.includes('finn') || lowerId.includes('errand')) {
      this.baseId = 'finn';
    } else {
      this.baseId = 'garth';
    }

    // 3. C4-13-06: Bóng đổ mặt đất đen mờ mịn (alpha 0.25) ôm sát chân NPC
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillEllipse(0, 0, 16, 5);
    this.add(shadow);

    // 4. Sprite hoạt ảnh chính (Căn chỉnh neo chân origin 0.5, 58/64 = 0.90625 khớp chuẩn đáy ô)
    let initialSheet = 'garth_walk_sheet';
    if (this.baseId === 'edda') {
      initialSheet = scene.textures.exists('edda_idle_sheet') ? 'edda_idle_sheet' : 'edda_idle';
    } else if (this.baseId === 'neris') {
      initialSheet = scene.textures.exists('neris_idle_sheet') ? 'neris_idle_sheet' : 'neris_idle';
    } else if (this.baseId === 'bram') {
      initialSheet = scene.textures.exists('blacksmith_sheet') ? 'blacksmith_sheet' : 'potter_walk_sheet';
    } else if (this.baseId === 'finn') {
      initialSheet = 'errand_boy_walk_sheet';
    } else if (this.baseId === 'campfire_knight') {
      initialSheet = scene.textures.exists('campfire_knight_pray_sheet') ? 'campfire_knight_pray_sheet' : 'campfire_knight_idle_sheet';
    } else {
      initialSheet = scene.textures.exists('garth_walk_sheet') ? 'garth_walk_sheet' : 'garth_walk';
    }

    this.npcSprite = scene.add.sprite(0, 0, initialSheet);
    this.npcSprite.setOrigin(0.5, 58 / 64);
    this.add(this.npcSprite);

    // Khởi chạy hoạt ảnh ban đầu (mặc định idle)
    this.playDirectionalAnim('idle', 'down');

    // 5. Bảng Nhãn Tên & Vai Trò (Scene-level Container đặt depth 5000, không bị mái nhà / Tháp Chuông che)
    this.namePlate = this.createNamePlate(scene, spec);

    // 6. Bong bóng tương tác [E] Trò Chuyện (Đặt depth 5001, chỉ hiện khi người chơi ở gần)
    this.promptBubble = this.createPromptBubble(scene);

    scene.add.existing(this);
    // Depth sorting nhân vật theo tọa độ Y chân
    this.setDepth(spec.y);

    // C4-13-17 / V1.5: Hộp va chạm chân nhỏ gọn (22x14 px) chuẩn xác tại bàn chân NPC trong frame 64x64 px
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(22, 14);
      body.setOffset(21, 50);
      body.setImmovable(true);
    }
  }

  /**
   * Đăng ký toàn bộ hoạt ảnh 64x64 px cho cả 5 NPC dân làng Bellhollow
   */
  public static registerAnimations(scene: Phaser.Scene): void {
    // 1. Edda: Hoạt ảnh 9 frame Idle liên tục
    const eddaSheet = scene.textures.exists('edda_idle_sheet') ? 'edda_idle_sheet' : 'edda_idle';
    if (scene.textures.exists(eddaSheet)) {
      const animKey = 'npc_edda_idle';
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(eddaSheet, { start: 0, end: 8 }),
          frameRate: 6,
          repeat: -1
        });
      }
      // Alias 4 hướng để tương thích hệ thống xoay hướng
      ['down', 'up', 'left', 'right'].forEach(dir => {
        const dKey = `npc_edda_idle_${dir}`;
        if (!scene.anims.exists(dKey)) {
          scene.anims.create({
            key: dKey,
            frames: scene.anims.generateFrameNumbers(eddaSheet, { start: 0, end: 8 }),
            frameRate: 6,
            repeat: -1
          });
        }
      });
    }

    // 2. Neris: Hoạt ảnh 6 frame Idle liên tục
    const nerisSheet = scene.textures.exists('neris_idle_sheet') ? 'neris_idle_sheet' : 'neris_idle';
    if (scene.textures.exists(nerisSheet)) {
      const animKey = 'npc_neris_idle';
      if (!scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(nerisSheet, { start: 0, end: 5 }),
          frameRate: 6,
          repeat: -1
        });
      }
      // Alias 4 hướng
      ['down', 'up', 'left', 'right'].forEach(dir => {
        const dKey = `npc_neris_idle_${dir}`;
        if (!scene.anims.exists(dKey)) {
          scene.anims.create({
            key: dKey,
            frames: scene.anims.generateFrameNumbers(nerisSheet, { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
          });
        }
      });
    }

    // 3. Bram / Blacksmith: Hoạt ảnh rèn sắt đập đe 6 frame liên tục (C4-13-21)
    if (scene.textures.exists('blacksmith_sheet')) {
      const animWork = 'anim_blacksmith_work';
      if (!scene.anims.exists(animWork)) {
        scene.anims.create({
          key: animWork,
          frames: scene.anims.generateFrameNumbers('blacksmith_sheet', { start: 0, end: 5 }),
          frameRate: 6,
          repeat: -1
        });
      }
      if (!scene.anims.exists('npc_bram_work')) {
        scene.anims.create({
          key: 'npc_bram_work',
          frames: scene.anims.generateFrameNumbers('blacksmith_sheet', { start: 0, end: 5 }),
          frameRate: 6,
          repeat: -1
        });
      }
      if (!scene.anims.exists('npc_bram_idle')) {
        scene.anims.create({
          key: 'npc_bram_idle',
          frames: scene.anims.generateFrameNumbers('blacksmith_sheet', { start: 0, end: 5 }),
          frameRate: 6,
          repeat: -1
        });
      }
      ['down', 'up', 'left', 'right'].forEach(dir => {
        const dIdleKey = `npc_bram_idle_${dir}`;
        if (!scene.anims.exists(dIdleKey)) {
          scene.anims.create({
            key: dIdleKey,
            frames: scene.anims.generateFrameNumbers('blacksmith_sheet', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
          });
        }
        const dWalkKey = `npc_bram_walk_${dir}`;
        if (!scene.anims.exists(dWalkKey)) {
          scene.anims.create({
            key: dWalkKey,
            frames: scene.anims.generateFrameNumbers('blacksmith_sheet', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
          });
        }
      });
    }

    // 4. Garth, Finn (và Bram dự phòng nếu thiếu blacksmith_sheet): Hoạt ảnh 4 hướng
    const fourDirNpcs = [
      { id: 'garth', sheet: scene.textures.exists('garth_walk_sheet') ? 'garth_walk_sheet' : 'garth_walk' },
      { id: 'finn', sheet: 'errand_boy_walk_sheet' }
    ];
    if (!scene.textures.exists('blacksmith_sheet')) {
      fourDirNpcs.push({ id: 'bram', sheet: 'potter_walk_sheet' });
    }

    const dirs: { name: NPCDirection; row: number }[] = [
      { name: 'down', row: 0 },
      { name: 'left', row: 1 },
      { name: 'right', row: 2 },
      { name: 'up', row: 3 }
    ];

    for (const npc of fourDirNpcs) {
      if (scene.textures.exists(npc.sheet)) {
        for (const dir of dirs) {
          const walkKey = `npc_${npc.id}_walk_${dir.name}`;
          const startFrame = dir.row * 8;
          if (!scene.anims.exists(walkKey)) {
            scene.anims.create({
              key: walkKey,
              frames: scene.anims.generateFrameNumbers(npc.sheet, {
                start: startFrame,
                end: startFrame + 7
              }),
              frameRate: 8,
              repeat: -1
            });
          }

          const idleKey = `npc_${npc.id}_idle_${dir.name}`;
          if (!scene.anims.exists(idleKey)) {
            scene.anims.create({
              key: idleKey,
              frames: scene.anims.generateFrameNumbers(npc.sheet, {
                frames: [startFrame, startFrame + 1, startFrame, startFrame + 2]
              }),
              frameRate: 4,
              repeat: -1
            });
          }
        }
      }
    }

    // 5. Hiệp Sĩ Canh Lửa: Quỳ cầu nguyện (12 frames) & Đứng trò chuyện (8 frames)
    if (scene.textures.exists('campfire_knight_pray_sheet')) {
      const prayFrames = scene.anims.generateFrameNumbers('campfire_knight_pray_sheet', { start: 0, end: 11 });
      if (!scene.anims.exists('anim_campfire_knight_pray')) {
        scene.anims.create({
          key: 'anim_campfire_knight_pray',
          frames: prayFrames,
          frameRate: 4,
          repeat: -1
        });
      }
      if (!scene.anims.exists('npc_campfire_knight_pray')) {
        scene.anims.create({
          key: 'npc_campfire_knight_pray',
          frames: prayFrames,
          frameRate: 4,
          repeat: -1
        });
      }
    }
    if (scene.textures.exists('campfire_knight_idle_sheet')) {
      const idleFrames = scene.anims.generateFrameNumbers('campfire_knight_idle_sheet', { start: 0, end: 7 });
      if (!scene.anims.exists('anim_campfire_knight_idle')) {
        scene.anims.create({
          key: 'anim_campfire_knight_idle',
          frames: idleFrames,
          frameRate: 6,
          repeat: -1
        });
      }
      if (!scene.anims.exists('npc_campfire_knight_idle')) {
        scene.anims.create({
          key: 'npc_campfire_knight_idle',
          frames: idleFrames,
          frameRate: 6,
          repeat: -1
        });
      }
    }
  }

  /**
   * Bảng nhãn tên và chức vụ NPC với khung nền đen mờ gọn gàng phía sau chữ (depth = 5000)
   */
  private createNamePlate(scene: Phaser.Scene, spec: NPCSpec): Phaser.GameObjects.Container {
    // Đặt độc lập trong scene tại vị trí (x, y - 58) trên đỉnh đầu nhân vật
    const container = scene.add.container(spec.x, spec.y - 58);
    container.setDepth(5000);

    const badgeW = 84;
    const badgeH = 22;

    const bg = scene.add.graphics();
    // Khung nền đen mờ gọn gàng tương phản cao (opacity 0.90)
    bg.fillStyle(0x090d0b, 0.90);
    bg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    // Viền đồng cổ kép sắc sảo không bị chìm trong sương
    bg.lineStyle(1.5, 0x9b7b4d, 0.95);
    bg.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    bg.lineStyle(0.5, 0xd4af37, 0.45);
    bg.strokeRoundedRect(-badgeW / 2 + 1.5, -badgeH / 2 + 1.5, badgeW - 3, badgeH - 3, 3);

    // Biểu tượng đại diện chức danh
    let icon = '🛡️';
    if (this.baseId === 'edda') icon = '🔔';
    else if (this.baseId === 'neris') icon = '🌿';
    else if (this.baseId === 'bram') icon = '🔨';
    else if (this.baseId === 'finn') icon = '📜';
    else if (this.baseId === 'campfire_knight') icon = '🔥';

    // Dòng 1: Tên NPC (vàng kim đậm sắc nét)
    const cleanName = spec.name.replace(/\s*\(.*\)/, '').trim();
    const nameText = HDTextHelper.createText(scene, 0, -5, `${icon} ${cleanName}`, {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Dòng 2: Chức danh / Vai trò (ngà ấm áp)
    const titleText = HDTextHelper.createText(scene, 0, 5, spec.title, {
      fontSize: '7.5px',
      color: '#d8ccb8',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    container.add([bg, nameText, titleText]);
    return container;
  }

  /**
   * Bong bóng nhắc tương tác [E] Trò chuyện (depth = 5001, mặc định ẩn)
   */
  /**
   * Bong bóng nhắc tương tác [E] Trò chuyện (depth = 5001, mặc định ẩn, bán trong suốt chuẩn C4-13-07)
   */
  private createPromptBubble(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const container = scene.add.container(this.spec.x, this.spec.y - 80);
    container.setDepth(5001);

    const bubbleBg = scene.add.graphics();
    // Nền bán trong suốt tinh tế (alpha 0.70) chống đè che tầm nhìn
    bubbleBg.fillStyle(0x090e15, 0.70);
    bubbleBg.fillRoundedRect(-32, -9, 64, 18, 5);
    bubbleBg.lineStyle(1, 0xd4af37, 0.75);
    bubbleBg.strokeRoundedRect(-32, -9, 64, 18, 5);

    // Mũi nhọn hướng xuống bảng tên
    bubbleBg.fillStyle(0x090e15, 0.70);
    bubbleBg.fillTriangle(-3, 9, 3, 9, 0, 12);
    bubbleBg.lineStyle(1, 0xd4af37, 0.75);
    bubbleBg.lineBetween(-3, 9, 0, 12);
    bubbleBg.lineBetween(3, 9, 0, 12);

    const bubbleText = HDTextHelper.createText(scene, 0, 0, '[E] Trò chuyện', {
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    container.add([bubbleBg, bubbleText]);
    container.setVisible(false);

    // Hiệu ứng nhịp bập bùng nhẹ nhàng
    this.bubbleTween = scene.tweens.add({
      targets: container,
      y: this.spec.y - 83,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  /**
   * Phát hoạt ảnh theo trạng thái và hướng
   */
  public playDirectionalAnim(state: 'idle' | 'walk', dir: NPCDirection): void {
    this.currentDirection = dir;

    if (this.baseId === 'campfire_knight') {
      const animKey = this.scene.anims.exists('anim_campfire_knight_pray')
        ? 'anim_campfire_knight_pray'
        : (this.scene.anims.exists('npc_campfire_knight_pray') ? 'npc_campfire_knight_pray' : 'anim_campfire_knight_idle');
      if (this.scene && this.scene.anims && this.scene.anims.exists(animKey)) {
        if (this.npcSprite.anims.currentAnim?.key !== animKey) {
          this.npcSprite.play(animKey, true);
        }
      }
      this.npcSprite.setFlipX(true);
      return;
    }

    let animKey = `npc_${this.baseId}_${state}_${dir}`;
    if (!this.scene.anims.exists(animKey)) {
      if (this.scene.anims.exists(`npc_${this.baseId}_idle`)) {
        animKey = `npc_${this.baseId}_idle`;
      } else if (this.scene.anims.exists(`npc_${this.baseId}_idle_down`)) {
        animKey = `npc_${this.baseId}_idle_down`;
      }
    }

    if (this.scene && this.scene.anims && this.scene.anims.exists(animKey)) {
      if (this.npcSprite.anims.currentAnim?.key !== animKey) {
        this.npcSprite.play(animKey);
      }
    }
  }

  /**
   * Chuyển trạng thái khi trò chuyện (đứng đối thoại <-> quỳ canh lửa)
   */
  public setInteracting(active: boolean, targetX?: number): void {
    if (this.baseId === 'campfire_knight') {
      if (active) {
        // Tạm chuyển sang dáng đứng tương tác (anim_campfire_knight_idle)
        if (targetX !== undefined) {
          this.npcSprite.setFlipX(targetX < this.x);
        }
        const idleKey = this.scene.anims.exists('anim_campfire_knight_idle')
          ? 'anim_campfire_knight_idle'
          : (this.scene.anims.exists('npc_campfire_knight_idle') ? 'npc_campfire_knight_idle' : '');
        if (idleKey && this.scene.anims.exists(idleKey)) {
          this.npcSprite.play(idleKey, true);
        }
      } else {
        // Quay lại tư thế quỳ canh lửa (anim_campfire_knight_pray) hướng về ngọn lửa hồng
        this.npcSprite.setFlipX(true);
        const prayKey = this.scene.anims.exists('anim_campfire_knight_pray')
          ? 'anim_campfire_knight_pray'
          : (this.scene.anims.exists('npc_campfire_knight_pray') ? 'npc_campfire_knight_pray' : '');
        if (prayKey && this.scene.anims.exists(prayKey)) {
          this.npcSprite.play(prayKey, true);
        }
      }
    }
  }

  /**
   * C4-13-07: Cập nhật trạng thái người chơi ở gần với độ mờ gợi ý theo khoảng cách và xoay hướng nhìn
   */
  public setNearby(nearby: boolean, playerX?: number, playerY?: number, distance?: number): void {
    let proximityAlpha = 1.0;
    if (distance !== undefined) {
      if (distance <= 38) {
        proximityAlpha = 1.0;
        nearby = true;
      } else if (distance <= 65) {
        proximityAlpha = 0.45;
        nearby = true;
      } else {
        nearby = false;
        proximityAlpha = 0;
      }
    }

    if (this.isPlayerNearby !== nearby) {
      this.isPlayerNearby = nearby;
      this.promptBubble.setVisible(nearby);
    }

    if (nearby) {
      this.promptBubble.setAlpha(proximityAlpha);
    }

    // Hiệp Sĩ Canh Lửa: giữ nguyên tư thế quỳ canh lửa hướng về bếp lửa hồng cho đến khi nhấn [E] đối thoại
    if (this.baseId === 'campfire_knight') {
      if (!nearby || this.npcSprite.anims.currentAnim?.key?.includes('pray')) {
        this.npcSprite.setFlipX(true);
      }
      return;
    }

    if (nearby && playerX !== undefined && playerY !== undefined) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;

      let faceDir: NPCDirection = 'down';
      if (Math.abs(dx) > Math.abs(dy)) {
        faceDir = dx > 0 ? 'right' : 'left';
      } else {
        faceDir = dy > 0 ? 'down' : 'up';
      }

      if (faceDir !== this.currentDirection) {
        this.playDirectionalAnim('idle', faceDir);
      }
    } else if (!nearby && this.currentDirection !== 'down') {
      this.playDirectionalAnim('idle', 'down');
    }
  }

  /**
   * Cập nhật lộ trình tuần tra và đồng bộ vị trí NamePlate & PromptBubble
   */
  public update(delta: number): void {
    // C4-13-17: Đồng bộ tọa độ hộp va chạm vật lý theo vị trí thực tế của NPC
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).reset(this.x, this.y);
    }

    // C4-132-03: Đồng bộ độ sâu Y-Sorting theo cạnh đáy chân tiếp đất của NPC
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    // Đồng bộ vị trí NamePlate và PromptBubble theo NPC
    if (this.namePlate) {
      this.namePlate.setPosition(this.x, this.y - 58);
    }
    if (this.promptBubble) {
      const baseY = this.y - 80;
      if (!this.bubbleTween || !this.bubbleTween.isPlaying()) {
        this.promptBubble.setPosition(this.x, baseY);
      } else {
        this.promptBubble.x = this.x;
      }
    }

    // Nếu người chơi đang đứng trong tầm trò chuyện, dừng di chuyển
    if (this.isPlayerNearby) {
      return;
    }

    if (!this.isPatrolling) {
      return;
    }

    if (this.isWaitingAtPatrolPoint) {
      this.waitTimer -= delta;
      if (this.waitTimer <= 0) {
        this.isWaitingAtPatrolPoint = false;
        const dir: NPCDirection = this.patrolTargetX > this.x ? 'right' : 'left';
        this.playDirectionalAnim('walk', dir);
      } else {
        if (this.currentDirection !== 'down') {
          this.playDirectionalAnim('idle', 'down');
        }
      }
      return;
    }

    const step = (this.patrolSpeed * delta) / 1000;
    const dist = this.patrolTargetX - this.x;

    if (Math.abs(dist) <= step) {
      this.x = this.patrolTargetX;
      this.setDepth(this.y);
      this.patrolTargetX = (this.patrolTargetX === this.patrolMaxX) ? this.patrolMinX : this.patrolMaxX;
      this.isWaitingAtPatrolPoint = true;
      this.waitTimer = 3500 + Math.random() * 1500;
      this.playDirectionalAnim('idle', 'down');
    } else {
      const moveDir = Math.sign(dist);
      this.x += moveDir * step;
      this.setDepth(this.y);
      const dir: NPCDirection = moveDir > 0 ? 'right' : 'left';
      this.playDirectionalAnim('walk', dir);
    }
  }

  public override setVisible(value: boolean): this {
    super.setVisible(value);
    if (this.namePlate) this.namePlate.setVisible(value);
    if (this.promptBubble) this.promptBubble.setVisible(value && this.isPlayerNearby);
    return this;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.bubbleTween) {
      this.bubbleTween.stop();
      this.bubbleTween.remove();
    }
    if (this.namePlate) {
      this.namePlate.destroy();
    }
    if (this.promptBubble) {
      this.promptBubble.destroy();
    }
    super.destroy(fromScene);
  }

  public getNearby(): boolean {
    return this.isPlayerNearby;
  }
}
