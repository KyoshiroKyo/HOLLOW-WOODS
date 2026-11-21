import * as Phaser from 'phaser';
import { HDTextHelper } from '../utils/HDTextHelper';

import type { NPCSpec } from '../types';

export type NPCDirection = 'down' | 'up' | 'left' | 'right';

export class NPCEntity extends Phaser.GameObjects.Container {
  public spec: NPCSpec;
  public npcSprite: Phaser.GameObjects.Sprite;
  private namePlate: Phaser.GameObjects.Container;
  private questIndicator: Phaser.GameObjects.Container;
  private questStatus: 'none' | 'new' | 'complete' = 'none';
  private questIndicatorText!: Phaser.GameObjects.Text;
  private questIndicatorBg!: Phaser.GameObjects.Graphics;
  private isPlayerNearby: boolean = false;
  private isShowingNamePlate: boolean = false;
  private isNamePlateSuppressed: boolean = false;
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
  private namePlateTween?: Phaser.Tweens.Tween;
  private indicatorTween?: Phaser.Tweens.Tween;
  private headOffsetY: number = 52;
  private namePlateWidth = 100;

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
    } else if (lowerId.includes('knight') || lowerId.includes('vaelen') || lowerName.includes('vaelen') || lowerName.includes('knight') || lowerName.includes('kỵ sĩ')) {
      this.baseId = 'campfire_knight';
    } else if (lowerId.includes('garth') || lowerName.includes('garth')) {
      this.baseId = 'garth';
    } else {
      this.baseId = 'garth';
    }

    if (this.baseId === 'finn') {
      this.headOffsetY = 54;
    } else if (this.baseId === 'bram') {
      this.headOffsetY = 48;
    } else if (this.baseId === 'campfire_knight') {
      this.headOffsetY = 46;
    } else {
      this.headOffsetY = 52;
    }

    // 3. V1.5-09: Đồng bộ kích thước bóng đổ elip mềm dưới chân tương ứng chiều rộng vai từng NPC
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.28);
    let shadowW = 18, shadowH = 5.5;
    if (this.baseId === 'bram') {
      shadowW = 24; shadowH = 7.5;
    } else if (this.baseId === 'garth' || this.baseId === 'campfire_knight') {
      shadowW = 22; shadowH = 7.0;
    } else if (this.baseId === 'edda') {
      shadowW = 16; shadowH = 5.0;
    } else if (this.baseId === 'neris') {
      shadowW = 15; shadowH = 5.0;
    } else if (this.baseId === 'finn') {
      shadowW = 12; shadowH = 4.0;
    }
    shadow.fillEllipse(0, 0, shadowW, shadowH);
    this.add(shadow);

    // 4. V1.5-09: Căn chuẩn điểm neo chân origin(0.5, 1.0) cho 100% thực thể
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
      // V15-31: Bắt buộc dùng texture riêng biệt từ gói 2D_SL_Knight_v1.0_3, tuyệt đối không fallback về Garth
      if (scene.textures.exists('campfire_knight_pray_sheet')) {
        initialSheet = 'campfire_knight_pray_sheet';
      } else if (scene.textures.exists('campfire_knight_pray_sheet.png')) {
        initialSheet = 'campfire_knight_pray_sheet.png';
      } else if (scene.textures.exists('campfire_knight_idle_sheet')) {
        initialSheet = 'campfire_knight_idle_sheet';
      } else {
        initialSheet = 'campfire_knight_idle_sheet.png';
      }
    } else {
      initialSheet = scene.textures.exists('garth_walk_sheet') ? 'garth_walk_sheet' : 'garth_walk';
    }

    this.npcSprite = scene.add.sprite(0, 0, initialSheet);
    this.npcSprite.setOrigin(0.5, 1.0);
    if (this.baseId === 'bram') this.npcSprite.setScale(0.82);
    this.add(this.npcSprite);

    // Khởi chạy hoạt ảnh ban đầu (mặc định idle)
    this.playDirectionalAnim('idle', 'down');

    // 5. Bảng Nhãn Tên & Vai Trò (Scene-level Container đặt depth 5000, ẩn mặc định, fade-in 150ms khi <= 95px)
    this.namePlate = this.createNamePlate(scene, spec);

    // 6. Biểu tượng Nhiệm Vụ lơ lửng tinh tế khi ở xa > 95px (!: nhiệm vụ mới, ?: trả nhiệm vụ)
    this.questIndicator = this.createQuestIndicator(scene);

    scene.add.existing(this);
    // Depth sorting nhân vật theo tọa độ Y chân
    this.setDepth(spec.y);

    // V1.5.3 (HW-BUG-#3 FIX): Thiết lập footprint collider chuẩn xác tại gốc bàn chân Container (0, 0)
    // Phân loại kích thước hộp va chạm theo tỷ lệ thể hình của từng loại NPC
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      let bodyW = 22;
      let bodyH = 14;
      if (this.baseId === 'bram') {
        bodyW = 24;
        bodyH = 14;
      } else if (this.baseId === 'garth' || this.baseId === 'campfire_knight') {
        bodyW = 22;
        bodyH = 14;
      } else if (this.baseId === 'edda' || this.baseId === 'neris') {
        bodyW = 16;
        bodyH = 12;
      } else if (this.baseId === 'finn') {
        bodyW = 14;
        bodyH = 10;
      }

      body.setSize(bodyW, bodyH);
      // Container origin là (0, 0) tại bàn chân tiếp đất (do sprite có origin 0.5, 1.0)
      // Căn giữa theo trục X (-width / 2) và đặt đáy hộp va chạm tại Y = 0 (-height)
      body.setOffset(-Math.round(bodyW / 2), -bodyH);
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
   * Bảng nhãn tên và chức vụ NPC với khung nền đen mờ tinh tế (depth = 5000, mặc định ẩn, fade-in 150ms khi <= 95px)
   */
  private createNamePlate(scene: Phaser.Scene, spec: NPCSpec): Phaser.GameObjects.Container {
    // V1.5-09: Đặt độc lập trong scene phía trên đỉnh đầu nhân vật theo headOffsetY
    const container = scene.add.container(spec.x, spec.y - this.headOffsetY);
    container.setDepth(5000);
    container.setAlpha(0);
    container.setVisible(false);

    // Dòng 1: Tên NPC (vàng kim đậm sắc nét)
    const cleanName = spec.name.replace(/\s*\(.*\)/, '').trim();

    // Biểu tượng đại diện chức danh
    let icon = '🛡️';
    if (this.baseId === 'edda') icon = '🔔';
    else if (this.baseId === 'neris') icon = '🌿';
    else if (this.baseId === 'bram') icon = '🔨';
    else if (this.baseId === 'finn') icon = '📜';
    else if (this.baseId === 'campfire_knight') icon = '🔥';

    const nameText = HDTextHelper.createText(scene, 0, -7, `${icon} ${cleanName}`, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    // Dòng 2: Chức danh / Vai trò + gợi ý [E] (ngà ấm áp)
    const titleText = HDTextHelper.createText(scene, 0, 8, `${spec.title} • [E]`, {
      fontSize: '9px',
      color: '#d8ccb8',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    const badgeW = Math.max(100, Math.ceil(Math.max(nameText.width, titleText.width)) + 20);
    this.namePlateWidth = badgeW;
    const badgeH = 36;
    const bg = scene.add.graphics();
    bg.fillStyle(0x090d0b, 0.94);
    bg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    bg.lineStyle(1.5, 0x9b7b4d, 0.95);
    bg.strokeRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    container.add([bg, nameText, titleText]);
    return container;
  }

  /**
   * Biểu tượng nhiệm vụ nhỏ tinh tế lơ lửng trên đầu NPC khi người chơi ở xa (> 95px)
   * (!: nhiệm vụ mới, ?: trả nhiệm vụ)
   */
  private createQuestIndicator(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const container = scene.add.container(this.spec.x, this.spec.y - this.headOffsetY - 12);
    container.setDepth(5002);
    container.setVisible(false);

    this.questIndicatorBg = scene.add.graphics();
    this.questIndicatorBg.fillStyle(0x090e15, 0.92);
    this.questIndicatorBg.fillCircle(0, 0, 8.5);
    this.questIndicatorBg.lineStyle(1.5, 0xf39c12, 1);
    this.questIndicatorBg.strokeCircle(0, 0, 8.5);

    this.questIndicatorText = HDTextHelper.createText(scene, 0, 0, '!', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    container.add([this.questIndicatorBg, this.questIndicatorText]);

    // Hiệu ứng nhấp nhô nhẹ lơ lửng (bobbing +-3px)
    this.indicatorTween = scene.tweens.add({
      targets: container,
      y: this.spec.y - this.headOffsetY - 16,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  /**
   * Cập nhật trạng thái nhiệm vụ của NPC ('none' | 'new' | 'complete')
   */
  public setQuestStatus(status: 'none' | 'new' | 'complete'): void {
    if (this.questStatus === status) return;
    this.questStatus = status;

    if (status === 'none') {
      this.questIndicator.setVisible(false);
      return;
    }

    const isNew = status === 'new';
    const color = isNew ? 0xf39c12 : 0xf1c40f;
    const colorHex = isNew ? '#f39c12' : '#f1c40f';
    const char = isNew ? '!' : '?';

    this.questIndicatorBg.clear();
    this.questIndicatorBg.fillStyle(0x090e15, 0.92);
    this.questIndicatorBg.fillCircle(0, 0, 8.5);
    this.questIndicatorBg.lineStyle(1.5, color, 1);
    this.questIndicatorBg.strokeCircle(0, 0, 8.5);

    this.questIndicatorText.setText(char);
    this.questIndicatorText.setColor(colorHex);

    // Chỉ hiển thị biểu tượng nếu nhãn tên chưa mở và không bị tạm ẩn do khung nhắc [E]
    if (!this.isShowingNamePlate && !this.isNamePlateSuppressed) {
      this.questIndicator.setVisible(true);
    }
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
   * V15-29: Tạm ẩn bảng tên cố định khi khung nhắc tương tác [E] trên đầu NPC đang hiển thị
   */
  public setNamePlateSuppressed(suppressed: boolean): void {
    if (this.isNamePlateSuppressed === suppressed) return;
    this.isNamePlateSuppressed = suppressed;
    if (suppressed) {
      if (this.namePlateTween) {
        this.namePlateTween.stop();
        this.namePlateTween.remove();
        this.namePlateTween = undefined;
      }
      this.isShowingNamePlate = false;
      if (this.namePlate) {
        this.namePlate.setAlpha(0);
        this.namePlate.setVisible(false);
      }
      if (this.questIndicator) {
        this.questIndicator.setVisible(false);
      }
    }
  }

  /**
   * V15-25: Cập nhật hiển thị nhãn tên mượt mà theo khoảng cách <= 95px cho đúng 1 NPC gần nhất
   * V15-29: Tự động nhường chỗ cho khung nhắc [E] tương tác khi người chơi bước vào tầm hành động
   */
  public setNearby(nearby: boolean, playerX?: number, playerY?: number, distance?: number, isClosest: boolean = true): void {
    this.isPlayerNearby = nearby;
    const shouldShowPlate = isClosest && distance !== undefined && distance <= 95 && !this.isNamePlateSuppressed;

    if (shouldShowPlate !== this.isShowingNamePlate) {
      this.isShowingNamePlate = shouldShowPlate;
      if (this.namePlateTween) {
        this.namePlateTween.stop();
        this.namePlateTween.remove();
        this.namePlateTween = undefined;
      }

      if (shouldShowPlate) {
        this.questIndicator.setVisible(false);
        this.namePlate.setVisible(true);
        this.namePlateTween = this.scene.tweens.add({
          targets: this.namePlate,
          alpha: 1,
          duration: 150,
          ease: 'Quad.easeOut'
        });
      } else {
        this.namePlateTween = this.scene.tweens.add({
          targets: this.namePlate,
          alpha: 0,
          duration: 150,
          ease: 'Quad.easeIn',
          onComplete: () => {
            this.namePlate.setVisible(false);
            if (this.questStatus !== 'none' && !this.isShowingNamePlate && !this.isNamePlateSuppressed) {
              this.questIndicator.setVisible(true);
            }
          }
        });
      }
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
   * Cập nhật lộ trình tuần tra và đồng bộ vị trí NamePlate & QuestIndicator
   */
  public update(delta: number): void {
    // C4-13-17 & HW-BUG-#3: Đồng bộ tọa độ hộp va chạm vật lý theo vị trí thực tế của NPC
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
    }

    // C4-132-03: Đồng bộ độ sâu Y-Sorting theo cạnh đáy chân tiếp đất của NPC
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    // Đồng bộ vị trí NamePlate và QuestIndicator theo NPC
    if (this.namePlate) {
      const camera = this.scene.cameras.main;
      const view = camera.worldView;
      const scale = 1 / camera.zoom;
      if (this.namePlate.scaleX !== scale) this.namePlate.setScale(scale);
      const marginX = (this.namePlateWidth / 2 + 8) * scale;
      const marginY = 26 * scale;
      const headY = this.y - this.headOffsetY;
      const x = view.width > 2 * marginX
        ? Phaser.Math.Clamp(this.x, view.left + marginX, view.right - marginX)
        : this.x;
      const y = view.height > 2 * marginY
        ? Phaser.Math.Clamp(headY, view.top + marginY, view.bottom - marginY)
        : headY;
      this.namePlate.setPosition(x, y);
    }
    if (this.questIndicator) {
      this.questIndicator.x = this.x;
      if (!this.indicatorTween || !this.indicatorTween.isPlaying()) {
        this.questIndicator.y = this.y - this.headOffsetY - 12;
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
    if (this.namePlate) this.namePlate.setVisible(value && this.isShowingNamePlate);
    if (this.questIndicator) this.questIndicator.setVisible(value && !this.isShowingNamePlate && this.questStatus !== 'none');
    return this;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.namePlateTween) {
      this.namePlateTween.stop();
      this.namePlateTween.remove();
      this.namePlateTween = undefined;
    }
    if (this.indicatorTween) {
      this.indicatorTween.stop();
      this.indicatorTween.remove();
      this.indicatorTween = undefined;
    }
    if (this.namePlate) {
      this.namePlate.destroy();
    }
    if (this.questIndicator) {
      this.questIndicator.destroy();
    }
    super.destroy(fromScene);
  }

  public getNearby(): boolean {
    return this.isPlayerNearby;
  }
}
