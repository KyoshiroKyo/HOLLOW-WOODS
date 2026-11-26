/**
 * HOLLOW WOODS V1.3.2 - C4-132-08
 * AUDITED RESOURCE PRELOADER & ASSET INTEGRITY SYSTEM
 * 100% Relative Asset Paths for P2Game.io iframe compatibility
 */

import * as Phaser from 'phaser';
import { 
  SCENE_PRELOAD, 
  SCENE_MAIN_MENU, 
  SATYR_PORTRAIT_KEY, 
  BLACK_KNIGHT_ARMED_IDLE_KEY,
  BLACK_KNIGHT_MOVEMENT_KEY,
  BLACK_KNIGHT_CORE_COMBAT_KEY,
  BLACK_KNIGHT_DEFENSE_KEY,
  BLACK_KNIGHT_EXTENDED_SKILLS_KEY,
  WAYFARER_PORTRAIT_KEY,
  BLACK_KNIGHT_CONVERSION_ACTIONS_KEY,
  BLACK_KNIGHT_CONVERSION_AIR_KEY,
  BLACK_KNIGHT_CONVERSION_COMBAT_KEY,
  BLACK_KNIGHT_CONVERSION_STATES_KEY,
  BLACK_KNIGHT_CONVERSION_MOTION_KEY,
  TILE_FOREST_GRASS,
  TILE_DIRT_TRAIL,
  TILE_SWAMP_MUD,
  TILE_COBBLE_ROAD,
  TILE_STONE_FLOOR,
  CONFIG_USE_V14_PILOT_ENVIRONMENT,
  CONFIG_USE_V14_ENVIRONMENT,
  TILE_FOREST_GRASS_V14_A,
  TILE_FOREST_GRASS_V14_B,
  TILE_FOREST_GRASS_V14_C,
  TILE_DIRT_TRAIL_V14_A,
  TILE_DIRT_TRAIL_V14_B,
  TILE_COBBLE_ROAD_V14,
  TILE_STONE_FLOOR_V14,
  TILE_SWAMP_MUD_V14_A,
  TILE_SWAMP_MUD_V14_B,
  TILE_ABYSSAL_SOIL_V14_A,
  TILE_ABYSSAL_SOIL_V14_B,
  TILE_TILLED_SOIL_V14,
  TILE_WOOD_PLANK_WEATHERED_V14,
  SPRITE_NPC_GARTH,
  PORTRAIT_GARTH,
  SPRITE_NPC_EDDA,
  PORTRAIT_EDDA,
  SPRITE_NPC_NERIS,
  PORTRAIT_NERIS,
  SPRITE_NPC_BRAM,
  PORTRAIT_BRAM,
  SPRITE_NPC_FINN,
  PORTRAIT_FINN,
  SPRITE_BLACKSMITH_SHEET,
  SPRITE_NPC_BLACKSMITH,
  PORTRAIT_BLACKSMITH,
  SPRITE_GARTH_IDLE,
  SPRITE_GARTH_WALK,
  SPRITE_EDDA_IDLE,
  SPRITE_EDDA_WALK,
  SPRITE_NERIS_IDLE,
  SPRITE_NERIS_WALK,
  SPRITE_EDDA_IDLE_SHEET,
  SPRITE_NERIS_IDLE_SHEET,
  SPRITE_GARTH_WALK_SHEET,
  SPRITE_POTTER_WALK_SHEET,
  SPRITE_ERRAND_BOY_WALK_SHEET,
  SPRITE_CAMPFIRE_KNIGHT_PRAY,
  SPRITE_CAMPFIRE_KNIGHT_IDLE,
  PORTRAIT_CAMPFIRE_KNIGHT,
  SPRITE_THE_LISTENER,
  SPRITE_THE_ECHO,
  SPRITE_SKULL_WOLF,
  PORTRAIT_SKULL_WOLF,
  SPRITE_SHADOW_CROW,
  SPRITE_SHADOW_EYES,
  SPRITE_SHADOW_BIG_BOSS,
  PORTRAIT_SHADOW_BIG_BOSS,
  SPRITE_BOSS_WETLANDS_IDLE,
  SPRITE_BOSS_WETLANDS_WALK,
  SPRITE_BOSS_WETLANDS_ATTACK1,
  SPRITE_BOSS_WETLANDS_ATTACK2,
  SPRITE_BOSS_WETLANDS_HIT,
  SPRITE_BOSS_WETLANDS_DEATH,
  SPRITE_FALLEN_KNIGHT,
  PORTRAIT_FALLEN_KNIGHT,
  SPRITE_DREAD_HORSEMAN,
  PORTRAIT_DREAD_HORSEMAN,
  SPRITE_HOODED_KNIGHT,
  PORTRAIT_HOODED_KNIGHT,
  SPRITE_MIST_BAT,
  SPRITE_WANDERING_SHADE,
  SPRITE_GOBLIN_SCOUT,
  SPRITE_FOG_SMOOTH,
  SPRITE_HOUSE_ELDER_EDDA_V15,
  SPRITE_HOUSE_HERBALIST_NERIS_V15,
  SPRITE_SMITHY_WORKSHOP_BRAM_V15,
  SPRITE_GATEHOUSE_GARTH_V15,
  SPRITE_BELL_TOWER_GRAND_V15,
  SPRITE_VILLAGE_WELL_DETAILED_V15,
  SPRITE_BUILDING_RANGER_OUTPOST_V15,
  SPRITE_TREE_MIST_PINE_V15,
  SPRITE_TREE_MOSSY_OAK_GRAND_V15,
  SPRITE_TREE_WEEPING_WILLOW_V15,
  SPRITE_TREE_WITHERED_GNARLED_V15,
  SPRITE_DECAL_WILD_GRASS_V15,
  SPRITE_DECAL_FERN_CLUSTER_V15,
  SPRITE_DECAL_GLOWING_MUSHROOMS_V15,
  SPRITE_DECAL_AUTUMN_LEAVES_V15,
  SPRITE_DECAL_PEBBLES_STONES_V15,
  SPRITE_DECAL_SWAMP_PUDDLE_V15,
  SPRITE_RES_RUNED_IRON,
  SPRITE_CAMPFIRE_TIER1_V15,
  SPRITE_CAMPFIRE_TIER2_V15,
  SPRITE_CAMPFIRE_TIER3_V15,
  SPRITE_CAMPFIRE_UNLIT_V15,
  SPRITE_PROP_CHEST_BRONZE_V15,
  SPRITE_PROP_CAULDRON_TRIPOD_V15,
  SPRITE_PROP_WAYFARER_TENT_V15,
  SPRITE_PROP_LANTERN_POST_V15,
  SPRITE_PROP_SIGNPOST_WOOD_V15
} from '../config/Constants';

import { HUDIconGenerator } from '../utils/HUDIconGenerator';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';
import {
  AtlasTextureResolver,
  ATLAS_PROPS_KEY,
  ATLAS_PROPS_PNG,
  ATLAS_PROPS_JSON
} from '../utils/AtlasTextureResolver';
import {
  ATLAS_ITEM_ICONS_KEY,
  ATLAS_ITEM_ICONS_PNG,
  ATLAS_ITEM_ICONS_JSON
} from '../utils/ItemIconHelper';

export class PreloadScene extends Phaser.Scene {
  // V15-21: Bộ sưu tập Mẹo Sinh Tồn & Mảnh Truyền Thuyết Rừng Sương
  private static readonly LORE_TIPS: string[] = [
    'Khi màn đêm buông xuống, lũ quái vật trong sương trở nên hung hãn hơn gấp bội — hãy giữ chặt ánh lửa của bạn.',
    'Đừng bao giờ bước chệch khỏi con đường mòn khi Vòng Sáng Hộ Tâm [F] chưa sẵn sàng dẫn lối giữa màn sương.',
    'Ba Quy Tắc Bằng Máu của Bà Lão Edda là bức tường thành duy nhất ngăn tâm trí bạn sụp đổ trước Kẻ Lắng Nghe.',
    'Dùng gậy gỗ hoặc vũ khí khua rậm vào bụi cây có thể làm lộ diện các dược thảo quý và hạt nhựa thông ẩn giấu.',
    'Khi chỉ số Bình Tâm tụt xuống mức báo động, màn sương sẽ co thắt tầm nhìn và đánh thức những ảo ảnh kinh hoàng.',
    'Đứng gần ngọn Lửa Trại Sanctuary Camp sẽ sưởi ấm thân nhiệt và phục hồi sự tỉnh táo cho tâm trí bạn.',
    'Kẻ Lắng Nghe săn mồi hoàn toàn bằng âm thanh — hãy bước đi thật khẽ hoặc ném mồi đánh lạc hướng [Phím Q].',
    'Đại Hồng Chung làng Bellhollow từng cứu cả thung lũng... cho đến đêm định mệnh khi thân chuông nứt làm đôi.',
    'Thảo dược bạc kết hợp với cành khô có thể chế thành Thuốc Đắp giúp hồi sinh lực và trấn an tinh thần tức thì.',
    'Những chiếc đèn ma lập lòe trong đầm lầy không có người cầm — tiến lại gần sẽ dẫn bạn vào hố bùn không đáy.'
  ];

  constructor() {
    super({ key: SCENE_PRELOAD });
  }

  public preload(): void {
    // C4-13-11: Tạo texture trong suốt 1x1 sớm nhất có thể chống ô vuông lỗi texture
    if (!this.textures.exists('dummy_transparent')) {
      const dummyGfx = this.make.graphics({ x: 0, y: 0 });
      dummyGfx.generateTexture('dummy_transparent', 1, 1);
      dummyGfx.destroy();
    }

    // =========================================================================
    // V15-21: XÂY DỰNG GIAO DIỆN MÀN HÌNH CHỜ DARK WOODLAND FOLKLORE (HD 1280×720)
    // =========================================================================
    this.cameras.main.setBackgroundColor('#0b0e14');

    // 1. Phông nền rừng sương thẫm (#0b0e14) có chiều sâu điện ảnh
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x06080d, 0x06080d, 0x0b0e14, 0x081016, 1);
    bgGraphics.fillRect(0, 0, 1280, 720);

    // Hàng cây thông rừng sâu mờ ảo phía xa dưới chân màn hình
    bgGraphics.fillStyle(0x070b0e, 0.45);
    const treePositions = [60, 130, 210, 300, 960, 1050, 1140, 1220];
    const treeHeights = [110, 140, 95, 125, 100, 135, 115, 150];
    treePositions.forEach((tx, idx) => {
      const th = treeHeights[idx];
      bgGraphics.fillTriangle(tx - 35, 720, tx, 720 - th, tx + 35, 720);
    });

    // Lớp sương mù chân đất mờ ảo
    bgGraphics.fillStyle(0x0a1017, 0.4);
    bgGraphics.fillRect(0, 650, 1280, 70);

    // 2. Biểu tượng Đèn Lồng Cổ (Ancient Brass Lantern) đung đưa phát quầng sáng hổ phách
    const lanternContainer = this.add.container(640, 185);

    // Quầng sáng hổ phách tỏa rộng
    const auraGfx = this.add.graphics();
    auraGfx.fillStyle(0xf39c12, 0.08);
    auraGfx.fillCircle(0, 0, 85);
    auraGfx.fillStyle(0xe67e22, 0.15);
    auraGfx.fillCircle(0, 0, 54);
    auraGfx.fillStyle(0xfff9c4, 0.28);
    auraGfx.fillCircle(0, 0, 28);
    lanternContainer.add(auraGfx);

    // Cấu trúc thân đèn lồng bằng đồng cổ
    const lanternGfx = this.add.graphics();
    // Dây xích treo phía trên
    lanternGfx.lineStyle(2, 0x5d4037, 1);
    lanternGfx.lineBetween(0, -50, 0, -20);
    // Vòng khuyên treo
    lanternGfx.lineStyle(2, 0xd4af37, 1);
    lanternGfx.strokeCircle(0, -20, 6);
    // Mái che nón chóp đèn
    lanternGfx.fillStyle(0x3e2723, 1);
    lanternGfx.fillTriangle(0, -22, -20, -10, 20, -10);
    lanternGfx.fillRect(-22, -10, 44, 4);
    // Buồng kính hổ phách
    lanternGfx.fillStyle(0xffecb3, 0.14);
    lanternGfx.fillRect(-17, -6, 34, 38);
    // Khung nẹp nan đồng 4 cạnh
    lanternGfx.lineStyle(2, 0x5d4037, 0.95);
    lanternGfx.strokeRect(-17, -6, 34, 38);
    lanternGfx.lineBetween(-6, -6, -6, 32);
    lanternGfx.lineBetween(6, -6, 6, 32);
    // Đế đèn lồng bằng sắt sẫm
    lanternGfx.fillStyle(0x27170e, 1);
    lanternGfx.fillRect(-20, 32, 40, 7);
    lanternContainer.add(lanternGfx);

    // Ngọn lửa lập lòe bên trong buồng kính
    const flameGfx = this.add.graphics();
    flameGfx.fillStyle(0xf39c12, 1);
    flameGfx.fillCircle(0, 14, 7);
    flameGfx.fillStyle(0xffeb3b, 1);
    flameGfx.fillCircle(0, 13, 4);
    flameGfx.fillStyle(0xffffff, 1);
    flameGfx.fillCircle(0, 12, 2);
    lanternContainer.add(flameGfx);

    // Hiệu ứng đung đưa nhẹ nhàng cho đèn lồng
    this.tweens.add({
      targets: lanternContainer,
      angle: { from: -3.5, to: 3.5 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Hiệu ứng bập bùng cho ngọn lửa
    this.tweens.add({
      targets: flameGfx,
      scaleY: { from: 0.88, to: 1.15 },
      scaleX: { from: 0.92, to: 1.08 },
      alpha: { from: 0.85, to: 1.0 },
      duration: 320,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Hiệu ứng thở nhẹ nhàng cho quầng sáng hổ phách
    this.tweens.add({
      targets: auraGfx,
      scale: { from: 0.94, to: 1.07 },
      alpha: { from: 0.8, to: 1.0 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Các hạt tàn lửa (Embers) bay lên từ đèn lồng
    const embers: Phaser.GameObjects.Arc[] = [];
    for (let i = 0; i < 12; i++) {
      const ember = this.add.circle(
        640 + Phaser.Math.Between(-18, 18),
        195 + Phaser.Math.Between(-10, 15),
        Phaser.Math.FloatBetween(1.2, 2.4),
        i % 2 === 0 ? 0xf39c12 : 0xfff9c4
      );
      ember.setAlpha(0);
      embers.push(ember);

      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(70, 130),
        x: ember.x + Phaser.Math.Between(-35, 35),
        alpha: { from: 0.85, to: 0 },
        duration: Phaser.Math.Between(1800, 3000),
        delay: Phaser.Math.Between(0, 2200),
        repeat: -1,
        ease: 'Quad.easeOut'
      });
    }

    // 3. Tiêu đề trò chơi HOLLOW WOODS & Dòng mô tả (Chuẩn hóa HD sắc nét không nhòe v152-06a)
    HDTextHelper.createText(this, 640, 280, 'HOLLOW WOODS', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    HDTextHelper.createText(this, 640, 310, 'THE FOG THAT REMEMBERS', {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#8c9ba5',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // 4. Thanh tiến trình tải (Loading Bar) — Khung viền gỗ sồi nạm đồng cổ
    const barWidth = 480;
    const barHeight = 22;
    const barX = 640 - barWidth / 2;
    const barY = 380 - barHeight / 2;

    const progressBox = this.add.graphics();
    // Nền gỗ sồi tối
    progressBox.fillStyle(0x140e0a, 0.95);
    progressBox.fillRect(barX, barY, barWidth, barHeight);
    // Viền đồng cổ 2px
    progressBox.lineStyle(2, 0x8c6d36, 1);
    progressBox.strokeRect(barX, barY, barWidth, barHeight);
    // 4 đinh tán đồng tại 4 góc
    progressBox.fillStyle(0xd4af37, 1);
    progressBox.fillCircle(barX + 4, barY + 4, 2.5);
    progressBox.fillCircle(barX + barWidth - 4, barY + 4, 2.5);
    progressBox.fillCircle(barX + 4, barY + barHeight - 4, 2.5);
    progressBox.fillCircle(barX + barWidth - 4, barY + barHeight - 4, 2.5);
    // Rãnh trũng lòng trong
    progressBox.fillStyle(0x080b0f, 1);
    progressBox.fillRect(barX + 4, barY + 4, barWidth - 8, barHeight - 8);

    const progressBar = this.add.graphics();

    // Dòng trạng thái chung phía trên thanh tải
    const loadingText = HDTextHelper.createText(this, 640, 350, 'Đang xuyên qua Màn Sương...', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#cbd5e1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Con số phần trăm nằm chính giữa thanh tải
    const percentText = HDTextHelper.createText(this, 640, 380, '0%', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Dòng hiển thị tên tài nguyên đang nạp phía dưới thanh tải
    const assetStatusText = HDTextHelper.createText(this, 640, 408, 'Đang chuẩn bị tài nguyên khởi động...', {
      fontSize: '12px',
      color: '#94a3b8',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // 5. Khu vực Mẹo Sinh Tồn & Mảnh Truyền Thuyết (Survival Tips & Lore Quotes)
    const tipBox = this.add.graphics();
    const boxW = 680;
    const boxH = 88;
    const boxX = 640 - boxW / 2;
    const boxY = 485 - boxH / 2;

    tipBox.fillStyle(0x0d121a, 0.88);
    tipBox.fillRoundedRect(boxX, boxY, boxW, boxH, 6);
    tipBox.lineStyle(1, 0x4a3728, 0.8);
    tipBox.strokeRoundedRect(boxX, boxY, boxW, boxH, 6);

    HDTextHelper.createText(this, 640, boxY + 16, '❖ MẸO SINH TỒN & TRUYỀN THUYẾT ❖', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Lựa chọn ngẫu nhiên một câu mẹo truyền thuyết khi khởi động
    let currentTipIndex = Phaser.Math.Between(0, PreloadScene.LORE_TIPS.length - 1);
    const tipText = HDTextHelper.createText(this, 640, boxY + 50, `“${PreloadScene.LORE_TIPS[currentTipIndex]}”`, {
      fontSize: '14px',
      fontStyle: 'italic',
      color: '#ecf0f1',
      align: 'center',
      wordWrap: { width: 620 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Tự động xoay tua mẹo truyền thuyết mỗi 4.5 giây nếu quá trình nạp kéo dài
    const tipTimerEvent = this.time.addEvent({
      delay: 4500,
      loop: true,
      callback: () => {
        this.tweens.add({
          targets: tipText,
          alpha: 0,
          duration: 350,
          onComplete: () => {
            currentTipIndex = (currentTipIndex + 1) % PreloadScene.LORE_TIPS.length;
            tipText.setText(`“${PreloadScene.LORE_TIPS[currentTipIndex]}”`);
            this.tweens.add({
              targets: tipText,
              alpha: 1,
              duration: 350
            });
          }
        });
      }
    });

    // =========================================================================
    // LẮNG NGHE TIẾN TRÌNH TẢI TÀI NGUYÊN (LOADER EVENTS)
    // =========================================================================
    let lastProgress = 0;
    const fileProgress = new WeakMap<Phaser.Loader.File, number>();
    const notifyStartupProgress = () => window.dispatchEvent(new Event('hollow-woods:startup-progress'));
    notifyStartupProgress();
    this.load.on('progress', (value: number) => {
      if (value > lastProgress) {
        lastProgress = value;
        notifyStartupProgress();
      }
      percentText.setText(`${Math.floor(value * 100)}%`);
      const fillW = Math.max(0, (barWidth - 8) * value);

      progressBar.clear();
      // Lõi thanh tải chảy mượt màu vàng hổ phách ấm
      progressBar.fillStyle(0xd35400, 1);
      progressBar.fillRect(barX + 4, barY + 4, fillW, barHeight - 8);
      progressBar.fillStyle(0xf39c12, 1);
      progressBar.fillRect(barX + 4, barY + 4, fillW, (barHeight - 8) - 3);
      // Dải sáng óng ánh trên đỉnh
      progressBar.fillStyle(0xfff9c4, 0.65);
      progressBar.fillRect(barX + 4, barY + 5, fillW, 2);

      // Điểm sáng đầu mút thanh tải
      if (fillW > 4) {
        progressBar.fillStyle(0xfff9c4, 0.9);
        progressBar.fillRect(barX + 4 + fillW - 3, barY + 4, 3, barHeight - 8);
      }
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File, progress: number) => {
      if (progress > (fileProgress.get(file) ?? 0)) {
        fileProgress.set(file, progress);
        notifyStartupProgress();
      }
      const rawName = typeof file.key === 'string' && file.key.trim().length > 0
        ? file.key
        : (typeof file.url === 'string' ? file.url : 'Tài nguyên');
      let displayName = String(rawName);
      if (displayName.length > 36) {
        displayName = '...' + displayName.substring(displayName.length - 33);
      }
      assetStatusText.setText(`Đang nạp: ${displayName}`);
    });

    // V15-39: Bắt lỗi nạp an toàn chống sập tiến trình nạp
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`[PreloadScene] Cảnh báo nạp tài nguyên: ${file.key} (${file.src || file.url}) - Bỏ qua an toàn.`);
    });

    this.load.on('complete', () => {
      tipTimerEvent.destroy();
      percentText.setText('100%');
      loadingText.setText('Khởi tạo thế giới hoàn tất...');
      assetStatusText.setText('Sẵn sàng bước vào Khu Rừng Rỗng...');

      // Điền đầy đủ thanh tải vàng kim rực rỡ
      progressBar.clear();
      progressBar.fillStyle(0xf39c12, 1);
      progressBar.fillRect(barX + 4, barY + 4, barWidth - 8, barHeight - 8);
      progressBar.fillStyle(0xfff9c4, 0.7);
      progressBar.fillRect(barX + 4, barY + 5, barWidth - 8, 2);
    });

    this.load.image('menu_black_knight_woodland', 'assets/ui/menu/black_knight_woodland.png');
    this.load.image('menu_black_knight_fallback', 'assets/ui/menu/black_knight_fallback.png');
    this.load.image('menu_black_knight_button', 'assets/ui/menu/black_knight_button.png');
    this.load.image('menu_black_knight_button_hover', 'assets/ui/menu/black_knight_button_hover.png');
    this.load.spritesheet('menu_black_knight_cinematic', 'assets/ui/menu/black_knight_cinematic.png', {
      frameWidth: 640,
      frameHeight: 360,
    });

    this.load.atlas(
      BLACK_KNIGHT_ARMED_IDLE_KEY,
      'assets/characters/black_knight/black_knight_armed_idle.png',
      'assets/characters/black_knight/black_knight_armed_idle.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_MOVEMENT_KEY,
      'assets/characters/black_knight/black_knight_movement.png',
      'assets/characters/black_knight/black_knight_movement.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_CORE_COMBAT_KEY,
      'assets/characters/black_knight/black_knight_core_combat.png',
      'assets/characters/black_knight/black_knight_core_combat.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_DEFENSE_KEY,
      'assets/characters/black_knight/black_knight_defense.png',
      'assets/characters/black_knight/black_knight_defense.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_EXTENDED_SKILLS_KEY,
      'assets/characters/black_knight/black_knight_extended_skills.png',
      'assets/characters/black_knight/black_knight_extended_skills.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_CONVERSION_ACTIONS_KEY,
      'assets/characters/black_knight/black_knight_conversion_actions.png',
      'assets/characters/black_knight/black_knight_conversion_actions.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_CONVERSION_AIR_KEY,
      'assets/characters/black_knight/black_knight_conversion_air.png',
      'assets/characters/black_knight/black_knight_conversion_air.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_CONVERSION_COMBAT_KEY,
      'assets/characters/black_knight/black_knight_conversion_combat.png',
      'assets/characters/black_knight/black_knight_conversion_combat.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_CONVERSION_STATES_KEY,
      'assets/characters/black_knight/black_knight_conversion_states.png',
      'assets/characters/black_knight/black_knight_conversion_states.json'
    );
    this.load.atlas(
      BLACK_KNIGHT_CONVERSION_MOTION_KEY,
      'assets/characters/black_knight/black_knight_conversion_motion.png',
      'assets/characters/black_knight/black_knight_conversion_motion.json'
    );

    const blackKnightPortrait = 'assets/characters/black_knight/black_knight_portrait.png';
    this.load.image(SATYR_PORTRAIT_KEY, blackKnightPortrait);
    this.load.image(WAYFARER_PORTRAIT_KEY, blackKnightPortrait);

    // 4. Nạp các tileset môi trường đã trích xuất
    this.load.image('tx_grass', 'assets/environment/tilesets/TX Tileset Grass.png');
    this.load.image('tx_stone', 'assets/environment/tilesets/TX Tileset Stone Ground.png');
    this.load.image('tx_wall', 'assets/environment/tilesets/TX Tileset Wall.png');

    // 5. Nạp Texture Atlas gộp toàn bộ Props, Cây cối, Nhà cửa, Đèn lồng & Vật phẩm (HW-V14-ATLAS)
    // Toàn bộ 51 sprite vật thể đơn lẻ được gộp vào 1 Texture Atlas duy nhất (1024x512 <= 2048x2048)
    // với padding 2px và extrude 1px chống lem pixel viền. Mọi truy xuất key cũ được AtlasTextureResolver tự động điều phối.
    AtlasTextureResolver.install();
    this.load.atlas(ATLAS_PROPS_KEY, ATLAS_PROPS_PNG, ATLAS_PROPS_JSON);

    // BUG-025: Nạp Texture Atlas trọn bộ 43 biểu tượng vật phẩm Pixel Art 16x16
    this.load.atlas(ATLAS_ITEM_ICONS_KEY, ATLAS_ITEM_ICONS_PNG, ATLAS_ITEM_ICONS_JSON);

    // 8. Nạp các tile địa hình mặt đất (PASS T07)
    this.load.image(TILE_FOREST_GRASS, 'assets/environment/tiles/tile_forest_grass.png');
    this.load.image(TILE_DIRT_TRAIL, 'assets/environment/tiles/tile_dirt_trail.png');
    this.load.image(TILE_SWAMP_MUD, 'assets/environment/tiles/tile_swamp_mud.png');
    this.load.image(TILE_COBBLE_ROAD, 'assets/environment/tiles/tile_cobble_road.png');
    this.load.image(TILE_STONE_FLOOR, 'assets/environment/tiles/tile_stone_floor.png');

    // V15-10: Nạp bộ Sprite Kiến Trúc Làng Bellhollow Pixel Art Chuẩn Hóa V1.5
    this.load.image(SPRITE_HOUSE_ELDER_EDDA_V15, 'assets/buildings/house_elder_edda.png');
    this.load.image(SPRITE_HOUSE_HERBALIST_NERIS_V15, 'assets/buildings/house_herbalist_neris.png');
    this.load.image(SPRITE_SMITHY_WORKSHOP_BRAM_V15, 'assets/buildings/smithy_workshop_bram_stone.png');
    this.load.image(SPRITE_GATEHOUSE_GARTH_V15, 'assets/buildings/gatehouse_garth.png');
    this.load.image(SPRITE_BELL_TOWER_GRAND_V15, 'assets/buildings/bell_tower_grand.png');
    this.load.image(SPRITE_VILLAGE_WELL_DETAILED_V15, 'assets/buildings/village_well_detailed.png');
    this.load.image(SPRITE_BUILDING_RANGER_OUTPOST_V15, 'assets/buildings/ranger_cabin_wood.png');

    // V15-11: Nạp bộ Sprite Cây Cổ Thụ & Lớp Phủ Mặt Đất Rừng Sương V1.5
    this.load.image(SPRITE_TREE_MIST_PINE_V15, 'assets/environment/trees/tree_mist_pine.png');
    this.load.image(SPRITE_TREE_MOSSY_OAK_GRAND_V15, 'assets/environment/trees/tree_mossy_oak_grand.png');
    this.load.image(SPRITE_TREE_WEEPING_WILLOW_V15, 'assets/environment/trees/tree_weeping_willow.png');
    this.load.image(SPRITE_TREE_WITHERED_GNARLED_V15, 'assets/environment/trees/tree_withered_gnarled.png');

    // V15-61: Nạp bộ Sprite Cây Cối Pixel Art Bổ Sung (Không nằm trong Atlas Props)
    // Lưu ý: Các sprite cây sồi, cây khô, cây rỗng, bụi rậm, bạch dương, phong đỏ, gỗ mục và vật phẩm tài nguyên
    // (res_dry_wood, res_tree_resin, res_flint, res_herbs) đã được đóng gói tối ưu trong Atlas Props (hollow_props_atlas)
    // và được AtlasTextureResolver tự động điều phối, tuyệt đối không nạp lặp để tránh cảnh báo Texture key in use.
    // V152-09: Hợp nhất cặp cây trùng 100% byte (tree_pine_tall_topdown dùng chung tree_mist_pine.png)
    this.load.image('tree_pine_tall_topdown', 'assets/environment/trees/tree_mist_pine.png');
    this.load.image('tree_pine_med_topdown', 'assets/environment/trees/tree_pine_med_topdown.png');
    this.load.image('tree_pine_slender_topdown', 'assets/environment/trees/tree_pine_slender_topdown.png');

    this.load.image(SPRITE_DECAL_WILD_GRASS_V15, 'assets/environment/foliage/decal_wild_grass.png');
    this.load.image(SPRITE_DECAL_FERN_CLUSTER_V15, 'assets/environment/foliage/decal_fern_cluster.png');
    this.load.image(SPRITE_DECAL_GLOWING_MUSHROOMS_V15, 'assets/environment/foliage/decal_glowing_mushrooms.png');
    this.load.image(SPRITE_DECAL_AUTUMN_LEAVES_V15, 'assets/environment/foliage/decal_autumn_leaves.png');
    this.load.image(SPRITE_DECAL_PEBBLES_STONES_V15, 'assets/environment/foliage/decal_pebbles_stones.png');
    this.load.image(SPRITE_DECAL_SWAMP_PUDDLE_V15, 'assets/environment/foliage/decal_swamp_puddle.png');

    // V15-12: Nạp bộ Sprite Vật Phẩm Thu Thập Bổ Sung Ngoài Thế Giới (Không nằm trong Atlas)
    this.load.image(SPRITE_RES_RUNED_IRON, 'assets/environment/pickups/res_runed_iron.png');

    // V15-12: Nạp bộ Sprite Cụm Sanctuary Camp & Đạo Cụ Làng V1.5
    this.load.image(SPRITE_CAMPFIRE_UNLIT_V15, 'assets/environment/props/campfire_unlit.png');
    this.load.image(SPRITE_CAMPFIRE_TIER1_V15, 'assets/environment/props/campfire_tier1.png');
    this.load.image(SPRITE_CAMPFIRE_TIER2_V15, 'assets/environment/props/campfire_tier2.png');
    this.load.image(SPRITE_CAMPFIRE_TIER3_V15, 'assets/environment/props/campfire_tier3.png');
    this.load.image(SPRITE_PROP_CHEST_BRONZE_V15, 'assets/environment/props/prop_chest_bronze.png');
    this.load.image(SPRITE_PROP_CAULDRON_TRIPOD_V15, 'assets/environment/props/prop_cauldron_tripod.png');
    this.load.image(SPRITE_PROP_WAYFARER_TENT_V15, 'assets/environment/props/prop_wayfarer_tent.png');
    this.load.image(SPRITE_PROP_LANTERN_POST_V15, 'assets/environment/props/prop_lantern_post.png');
    this.load.image(SPRITE_PROP_SIGNPOST_WOOD_V15, 'assets/environment/props/prop_signpost_wood.png');

    // 8.1 Nạp các tài nguyên môi trường V1.4 Mẫu & Mở Rộng Toàn Hệ Thống (HW-V14-EXP)
    if (CONFIG_USE_V14_PILOT_ENVIRONMENT || CONFIG_USE_V14_ENVIRONMENT) {
      this.load.image(TILE_FOREST_GRASS_V14_A, 'assets/environment/v14/tiles/tile_forest_grass_v14_a.png');
      this.load.image(TILE_FOREST_GRASS_V14_B, 'assets/environment/v14/tiles/tile_forest_grass_v14_b.png');
      this.load.image(TILE_FOREST_GRASS_V14_C, 'assets/environment/v14/tiles/tile_forest_grass_v14_c.png');
      this.load.image(TILE_DIRT_TRAIL_V14_A, 'assets/environment/v14/tiles/tile_dirt_trail_v14_a.png');
      this.load.image(TILE_DIRT_TRAIL_V14_B, 'assets/environment/v14/tiles/tile_dirt_trail_v14_b.png');
      this.load.image(TILE_COBBLE_ROAD_V14, 'assets/environment/v14/tiles/tile_cobble_road_v14.png');
      this.load.image(TILE_STONE_FLOOR_V14, 'assets/environment/v14/tiles/tile_stone_floor_v14.png');
      this.load.image(TILE_SWAMP_MUD_V14_A, 'assets/environment/v14/tiles/tile_swamp_mud_v14_a.png');
      this.load.image(TILE_SWAMP_MUD_V14_B, 'assets/environment/v14/tiles/tile_swamp_mud_v14_b.png');
      this.load.image(TILE_ABYSSAL_SOIL_V14_A, 'assets/environment/v14/tiles/tile_abyssal_soil_v14_a.png');
      this.load.image(TILE_ABYSSAL_SOIL_V14_B, 'assets/environment/v14/tiles/tile_abyssal_soil_v14_b.png');
      this.load.image(TILE_TILLED_SOIL_V14, 'assets/environment/v14/tiles/tile_tilled_soil_v14.png');
      this.load.image(TILE_WOOD_PLANK_WEATHERED_V14, 'assets/environment/v14/tiles/tile_wood_plank_weathered_v14.png');
    }

    // 9. V15-FIX-05: Chuẩn hóa toàn bộ sprite & chân dung NPC về 1 nguồn duy nhất tại assets/characters/npcs/
    this.load.image(PORTRAIT_GARTH, 'assets/characters/npcs/portrait_garth.png');
    this.load.image(PORTRAIT_EDDA, 'assets/characters/npcs/portrait_edda.png');
    this.load.image(PORTRAIT_NERIS, 'assets/characters/npcs/portrait_neris.png');
    this.load.image(PORTRAIT_BRAM, 'assets/characters/npcs/portrait_blacksmith.png');
    this.load.image(PORTRAIT_BLACKSMITH, 'assets/characters/npcs/portrait_blacksmith.png');
    this.load.image(PORTRAIT_FINN, 'assets/characters/npcs/portrait_finn.png');

    // Nạp các Spritesheet 64x64 px chuẩn hóa từ assets/characters/npcs/
    this.load.spritesheet(SPRITE_EDDA_IDLE_SHEET, 'assets/characters/npcs/edda_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_NERIS_IDLE_SHEET, 'assets/characters/npcs/neris_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_GARTH_WALK_SHEET, 'assets/characters/npcs/garth_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_POTTER_WALK_SHEET, 'assets/characters/npcs/potter_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_ERRAND_BOY_WALK_SHEET, 'assets/characters/npcs/errand_boy_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_BLACKSMITH_SHEET, 'assets/characters/npcs/blacksmith_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // V14-P8-14A & V15-31: Nạp sprite NPC Sir Vaelen — Kỵ Sĩ Trầm Mặc (2D_SL_Knight_v1.0_3)
    this.load.spritesheet(SPRITE_CAMPFIRE_KNIGHT_PRAY, 'assets/characters/npcs/campfire_knight_pray_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('campfire_knight_pray_sheet.png', 'assets/characters/npcs/campfire_knight_pray_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_CAMPFIRE_KNIGHT_IDLE, 'assets/characters/npcs/campfire_knight_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('campfire_knight_idle_sheet.png', 'assets/characters/npcs/campfire_knight_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_CAMPFIRE_KNIGHT, 'assets/characters/npcs/portrait_campfire_knight.png');
    this.load.image('portrait_campfire_knight.png', 'assets/characters/npcs/portrait_campfire_knight.png');

    // Giữ tương thích các khóa nạp spritesheet cũ (garth_idle, garth_walk, edda_idle, edda_walk, neris_idle, neris_walk)
    this.load.spritesheet(SPRITE_GARTH_IDLE, 'assets/characters/npcs/garth_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_GARTH_WALK, 'assets/characters/npcs/garth_walk_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_EDDA_IDLE, 'assets/characters/npcs/edda_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_EDDA_WALK, 'assets/characters/npcs/edda_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_NERIS_IDLE, 'assets/characters/npcs/neris_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_NERIS_WALK, 'assets/characters/npcs/neris_idle_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Giữ tương thích các khóa sprite ảnh tĩnh cũ (npc_garth, npc_edda, npc_neris, npc_bram, npc_finn, npc_blacksmith)
    this.load.image(SPRITE_NPC_GARTH, 'assets/characters/npcs/npc_garth.png');
    this.load.image(SPRITE_NPC_EDDA, 'assets/characters/npcs/npc_edda.png');
    this.load.image(SPRITE_NPC_NERIS, 'assets/characters/npcs/npc_neris.png');
    this.load.image(SPRITE_NPC_BRAM, 'assets/characters/npcs/npc_blacksmith.png');
    this.load.image(SPRITE_NPC_BLACKSMITH, 'assets/characters/npcs/npc_blacksmith.png');
    this.load.image(SPRITE_NPC_FINN, 'assets/characters/npcs/npc_finn.png');

    // 10. Nạp các sprite quái vật bóng đêm & tàn ảnh (PASS T10, GATE 2B)
    this.load.spritesheet(SPRITE_THE_LISTENER, 'assets/monsters/the_listener.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(SPRITE_THE_ECHO, 'assets/monsters/the_echo.png');
    this.load.spritesheet(SPRITE_SKULL_WOLF, 'assets/characters/monsters/skull_wolf_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_SKULL_WOLF, 'assets/characters/monsters/portrait_skull_wolf.png');

    // V1.4 - P8-09: Quái Vật Bóng Tối (Shadow Crow, Shadow Eyes, Abyssal Shade Behemoth)
    this.load.spritesheet(SPRITE_SHADOW_CROW, 'assets/characters/monsters/shadow_crow_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet(SPRITE_SHADOW_EYES, 'assets/characters/monsters/shadow_eyes_sheet.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    this.load.spritesheet(SPRITE_SHADOW_BIG_BOSS, 'assets/characters/bosses/shadow_big_boss_sheet.png', {
      frameWidth: 80,
      frameHeight: 80
    });
    this.load.image(PORTRAIT_SHADOW_BIG_BOSS, 'assets/characters/bosses/portrait_shadow_big_boss.png');

    // V15-42: Bộ Sprite Boss Kẻ Nuốt Tiếng Chuông (SHADOW Series - The Shadowed Wetlands Boss v1.1)
    this.load.spritesheet(SPRITE_BOSS_WETLANDS_IDLE, 'assets/characters/bosses/wetlands_boss/boss_wetlands_idle.png', {
      frameWidth: 247,
      frameHeight: 87
    });
    this.load.spritesheet(SPRITE_BOSS_WETLANDS_WALK, 'assets/characters/bosses/wetlands_boss/boss_wetlands_walk.png', {
      frameWidth: 247,
      frameHeight: 87
    });
    this.load.spritesheet(SPRITE_BOSS_WETLANDS_ATTACK1, 'assets/characters/bosses/wetlands_boss/boss_wetlands_attack1.png', {
      frameWidth: 247,
      frameHeight: 87
    });
    this.load.spritesheet(SPRITE_BOSS_WETLANDS_ATTACK2, 'assets/characters/bosses/wetlands_boss/boss_wetlands_attack2.png', {
      frameWidth: 247,
      frameHeight: 87
    });
    this.load.spritesheet(SPRITE_BOSS_WETLANDS_HIT, 'assets/characters/bosses/wetlands_boss/boss_wetlands_hit.png', {
      frameWidth: 247,
      frameHeight: 87
    });
    this.load.spritesheet(SPRITE_BOSS_WETLANDS_DEATH, 'assets/characters/bosses/wetlands_boss/boss_wetlands_death.png', {
      frameWidth: 247,
      frameHeight: 87
    });

    // V1.4 - Bước 13: Sinh vật Phục kích N3XUS & Trinh sát Goblin Scout
    this.load.spritesheet(SPRITE_MIST_BAT, 'assets/characters/monsters/bat_sheet.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet(SPRITE_WANDERING_SHADE, 'assets/characters/monsters/ghost_sheet.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet(SPRITE_GOBLIN_SCOUT, 'assets/characters/monsters/goblin_scout_dagger_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // V1.4 - P8-10: Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction)
    this.load.spritesheet(SPRITE_FALLEN_KNIGHT, 'assets/characters/enemies/fallen_knight_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_FALLEN_KNIGHT, 'assets/characters/enemies/portrait_fallen_knight.png');
    this.load.spritesheet(SPRITE_DREAD_HORSEMAN, 'assets/characters/enemies/dread_horseman_sheet.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.image(PORTRAIT_DREAD_HORSEMAN, 'assets/characters/enemies/portrait_dread_horseman.png');
    this.load.spritesheet(SPRITE_HOODED_KNIGHT, 'assets/characters/bosses/hooded_knight_sheet.png', {
      frameWidth: 160,
      frameHeight: 160
    });
    this.load.image(PORTRAIT_HOODED_KNIGHT, 'assets/characters/bosses/portrait_hooded_knight.png');

    this.load.image(SPRITE_FOG_SMOOTH, 'assets/environment/sprites/fog_smooth.png');

    // 12. Nạp toàn bộ hiệu ứng âm thanh & âm thanh khí quyển mã nguồn mở (C4-133-02)
    // Nhạc nền khí quyển theo vùng (Ambience)
    this.load.audio('ambience_village', 'assets/audio/ambience/ambience_village.mp3');
    this.load.audio('ambience_forest', 'assets/audio/ambience/ambience_forest.mp3');
    this.load.audio('ambience_mire', 'assets/audio/ambience/ambience_mire.mp3');
    this.load.audio('ambience_crossing', 'assets/audio/ambience/ambience_crossing.mp3');

    // SFX Hành động, Sinh tồn & Chiến đấu
    this.load.audio('attack_swing', 'assets/audio/sfx/attack_swing.mp3');
    this.load.audio('bell_low', 'assets/audio/sfx/bell_low.mp3');
    this.load.audio('bush_rustle', 'assets/audio/sfx/bush_rustle.mp3');
    this.load.audio('craft_success', 'assets/audio/sfx/craft_success.wav');
    this.load.audio('footstep_grass', 'assets/audio/sfx/footstep_grass.mp3');
    this.load.audio('herb_gather', 'assets/audio/sfx/herb_gather.wav');
    this.load.audio('hurt', 'assets/audio/sfx/hurt.wav');
    this.load.audio('interact', 'assets/audio/sfx/interact.wav');
    this.load.audio('lantern_toggle', 'assets/audio/sfx/lantern_toggle.mp3');
    this.load.audio('listener_alert', 'assets/audio/sfx/listener_alert.mp3');
    this.load.audio('monster_step', 'assets/audio/sfx/monster_step.mp3');
    this.load.audio('player_death', 'assets/audio/sfx/player_death.wav');
    this.load.audio('quest_update', 'assets/audio/sfx/quest_update.wav');
    this.load.audio('resource_gather', 'assets/audio/sfx/resource_gather.mp3');
    this.load.audio('rune_error', 'assets/audio/sfx/rune_error.mp3');
    this.load.audio('rune_resonance', 'assets/audio/sfx/rune_resonance.mp3');
    this.load.audio('ui_select', 'assets/audio/sfx/ui_select.wav');
    this.load.audio('ui_confirm', 'assets/audio/sfx/ui_confirm.wav');
    this.load.audio('ui_cancel', 'assets/audio/sfx/ui_cancel.wav');
    this.load.audio('heal_poultice', 'assets/audio/sfx/heal_poultice.wav');
    this.load.audio('oil_refill', 'assets/audio/sfx/oil_refill.wav');

    // Giọng thoại mở đầu NPC & Hiệu ứng máy đánh chữ (Super Dialogue & 8-bit Pack)
    this.load.audio('dialogue_garth', 'assets/audio/dialogue/dialogue_garth.wav');
    this.load.audio('dialogue_edda', 'assets/audio/dialogue/dialogue_edda.wav');
    this.load.audio('dialogue_neris', 'assets/audio/dialogue/dialogue_neris.wav');
    this.load.audio('dialogue_bram', 'assets/audio/dialogue/dialogue_bram.wav');
    this.load.audio('dialogue_finn', 'assets/audio/dialogue/dialogue_finn.wav');
    this.load.audio('dialogue_text_blip', 'assets/audio/dialogue/dialogue_text_blip.wav');

    // 13. V1.4 - Nạp toàn bộ tài nguyên âm thanh mở rộng V1.4 (Bề mặt di chuyển, Hù dọa, Quái vật, Boss)
    this.load.audio('footstep_mud_1', 'assets/audio/sfx/v14/footstep_mud_1.wav');
    this.load.audio('footstep_mud_2', 'assets/audio/sfx/v14/footstep_mud_2.wav');
    this.load.audio('footstep_wood_1', 'assets/audio/sfx/v14/footstep_wood_1.wav');
    this.load.audio('footstep_wood_2', 'assets/audio/sfx/v14/footstep_wood_2.wav');
    this.load.audio('footstep_stone_1', 'assets/audio/sfx/v14/footstep_stone_1.wav');
    this.load.audio('footstep_stone_2', 'assets/audio/sfx/v14/footstep_stone_2.wav');
    this.load.audio('footstep_leaves_1', 'assets/audio/sfx/v14/footstep_leaves_1.mp3');
    this.load.audio('bat_flap', 'assets/audio/sfx/v14/bat_flap.wav');
    this.load.audio('bat_screech', 'assets/audio/sfx/v14/bat_screech.wav');
    this.load.audio('bat_bite', 'assets/audio/sfx/v14/bat_bite.wav');
    this.load.audio('ghost_moan', 'assets/audio/sfx/v14/ghost_moan.wav');
    this.load.audio('ghost_whisper', 'assets/audio/sfx/v14/ghost_whisper.wav');
    this.load.audio('ghost_scream', 'assets/audio/sfx/v14/ghost_scream.wav');
    this.load.audio('ghost_dissipate', 'assets/audio/sfx/v14/ghost_dissipate.wav');
    this.load.audio('jumpscare_stinger', 'assets/audio/sfx/v14/jumpscare_stinger.wav');
    this.load.audio('sanity_gasp', 'assets/audio/sfx/v14/sanity_gasp.wav');
    this.load.audio('scout_whistle', 'assets/audio/sfx/v14/scout_whistle.wav');
    this.load.audio('dagger_slash', 'assets/audio/sfx/v14/dagger_slash.wav');
    this.load.audio('skull_wolf_growl', 'assets/audio/sfx/v14/skull_wolf_growl.wav');
    this.load.audio('skull_wolf_snarl', 'assets/audio/sfx/v14/skull_wolf_snarl.wav');
    this.load.audio('behemoth_roar', 'assets/audio/sfx/v14/behemoth_roar.wav');
    this.load.audio('behemoth_thud', 'assets/audio/sfx/v14/behemoth_thud.wav');
    this.load.audio('void_stalker_drone', 'assets/audio/sfx/v14/void_stalker_drone.wav');
    this.load.audio('void_stalker_screech', 'assets/audio/sfx/v14/void_stalker_screech.wav');
    this.load.audio('boss_drone', 'assets/audio/sfx/v14/boss_drone.wav');
    this.load.audio('rune_shift', 'assets/audio/sfx/v14/rune_shift.wav');
    this.load.audio('bell_toll_low', 'assets/audio/sfx/v14/bell_toll_low.wav');
    this.load.audio('chest_creak', 'assets/audio/sfx/v14/chest_creak.wav');
    this.load.audio('journal_page', 'assets/audio/sfx/v14/journal_page.wav');

    // =========================================================================
    // V152-06B: Nạp trọn bộ 28 Asset UI Pack Pixel Art (Dark Woodland Parchment)
    // =========================================================================
    // Books & Journals
    this.load.image('ui_pack_open_book', 'assets/ui/books/ui_pack_open_book.png');
    this.load.image('ui_pack_open_book_desk', 'assets/ui/books/ui_pack_open_book_desk.png');

    // Scrolls & Map Pins
    this.load.image('ui_pack_map_pin', 'assets/ui/scrolls/ui_pack_map_pin.png');
    this.load.image('ui_pack_scroll_compact', 'assets/ui/scrolls/ui_pack_scroll_compact.png');
    this.load.image('ui_pack_world_map_scroll', 'assets/ui/scrolls/ui_pack_world_map_scroll.png');

    // Panels & Headers
    this.load.image('ui_pack_panel_cutout_modal', 'assets/ui/panels/ui_pack_panel_cutout_modal.png');
    this.load.image('ui_pack_panel_dialogue', 'assets/ui/panels/ui_pack_panel_dialogue.png');
    this.load.image('ui_pack_panel_hud', 'assets/ui/panels/ui_pack_panel_hud.png');
    this.load.image('ui_pack_panel_modal', 'assets/ui/panels/ui_pack_panel_modal.png');
    this.load.image('ui_pack_panel_quest', 'assets/ui/panels/ui_pack_panel_quest.png');
    this.load.image('ui_pack_ribbon_header', 'assets/ui/panels/ui_pack_ribbon_header.png');
    this.load.image('ui_pack_ribbon_header_alt', 'assets/ui/panels/ui_pack_ribbon_header_alt.png');

    // Slots & Inventory Frames
    this.load.image('ui_pack_hotbar_bg', 'assets/ui/slots/ui_pack_hotbar_bg.png');
    this.load.image('ui_pack_slot_equip', 'assets/ui/slots/ui_pack_slot_equip.png');
    this.load.image('ui_pack_slot_hover', 'assets/ui/slots/ui_pack_slot_hover.png');
    this.load.image('ui_pack_slot_idle', 'assets/ui/slots/ui_pack_slot_idle.png');
    this.load.image('ui_pack_slot_large', 'assets/ui/slots/ui_pack_slot_large.png');
    this.load.image('ui_pack_slot_selected', 'assets/ui/slots/ui_pack_slot_selected.png');

    // Icons, Tabs & Equipment Placeholders
    this.load.image('ui_pack_btn_wood', 'assets/ui/icons/ui_pack_btn_wood.png');
    this.load.image('ui_pack_btn_wood_hover', 'assets/ui/icons/ui_pack_btn_wood_hover.png');
    this.load.image('ui_pack_tab_craft', 'assets/ui/icons/ui_pack_tab_craft.png');
    this.load.image('ui_pack_tab_equip', 'assets/ui/icons/ui_pack_tab_equip.png');
    this.load.image('ui_pack_tab_journal', 'assets/ui/icons/ui_pack_tab_journal.png');
    this.load.image('ui_pack_tab_map', 'assets/ui/icons/ui_pack_tab_map.png');
    this.load.image('ui_pack_equip_back', 'assets/ui/icons/ui_pack_equip_back.png');
    this.load.image('ui_pack_equip_body', 'assets/ui/icons/ui_pack_equip_body.png');
    this.load.image('ui_pack_equip_charm', 'assets/ui/icons/ui_pack_equip_charm.png');
    this.load.image('ui_pack_equip_feet', 'assets/ui/icons/ui_pack_equip_feet.png');

    // V15-39 & V15-FIX-04: 5 bản nhạc nền BGM chuyển sang Streaming Audio qua HTMLAudioElement trong AudioManager (giảm 500MB RAM decode PCM)
    // - bgm_knights_quiet_fire: 'assets/audio/bgm/knights_quiet_fire.mp3'
    // - bgm_embervale: 'assets/audio/bgm/embervale.mp3'
    // - bgm_beyond_the_hills: 'assets/audio/bgm/beyond_the_hills.mp3'
    // - bgm_evergrove: 'assets/audio/bgm/evergrove.mp3'
    // - bgm_forgotten_orchard: 'assets/audio/bgm/forgotten_orchard.mp3'
  }

  public create(): void {
    // Tạo texture trong suốt 1x1 chuẩn cho các collider vô hình, chống fallback sang __DEFAULT (hộp xanh lá X)
    if (!this.textures.exists('dummy_transparent')) {
      const dummyGfx = this.make.graphics({ x: 0, y: 0 });
      dummyGfx.generateTexture('dummy_transparent', 1, 1);
      dummyGfx.destroy();
    }

    // C4-13-15: Nạp 4 Icon Pixel Art (16x16 px) sắc nét cho các thuộc tính sinh tồn HUD
    HUDIconGenerator.generateAllHUDIcons(this);

    // HW-V14-ATLAS: Đồng bộ hóa Texture Atlas & thiết lập NEAREST Filter cho toàn bộ Tilemap & Atlas (chống lem viền pixel)
    AtlasTextureResolver.syncTextures(this);

    // BUG-025: Thiết lập NEAREST Filter cho Item Icons Atlas chống nhòe mờ biểu tượng
    if (this.textures.exists(ATLAS_ITEM_ICONS_KEY)) {
      this.textures.get(ATLAS_ITEM_ICONS_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // V14-P8-14B: Đăng ký 2 hoạt ảnh chuẩn của Hiệp Sĩ Canh Lửa (anim_campfire_knight_pray và anim_campfire_knight_idle)
    if (this.textures.exists(SPRITE_CAMPFIRE_KNIGHT_PRAY) && !this.anims.exists('anim_campfire_knight_pray')) {
      this.anims.create({
        key: 'anim_campfire_knight_pray',
        frames: this.anims.generateFrameNumbers(SPRITE_CAMPFIRE_KNIGHT_PRAY, { start: 0, end: 11 }),
        frameRate: 4,
        repeat: -1
      });
    }
    if (this.textures.exists(SPRITE_CAMPFIRE_KNIGHT_IDLE) && !this.anims.exists('anim_campfire_knight_idle')) {
      this.anims.create({
        key: 'anim_campfire_knight_idle',
        frames: this.anims.generateFrameNumbers(SPRITE_CAMPFIRE_KNIGHT_IDLE, { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }

    // V15-42: Đăng ký toàn bộ hoạt ảnh của Boss Kẻ Nuốt Tiếng Chuông (SHADOW Series)
    if (this.textures.exists(SPRITE_BOSS_WETLANDS_IDLE) && !this.anims.exists('anim_boss_wetlands_idle')) {
      this.anims.create({
        key: 'anim_boss_wetlands_idle',
        frames: this.anims.generateFrameNumbers(SPRITE_BOSS_WETLANDS_IDLE, { start: 0, end: 13 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (this.textures.exists(SPRITE_BOSS_WETLANDS_WALK) && !this.anims.exists('anim_boss_wetlands_walk')) {
      this.anims.create({
        key: 'anim_boss_wetlands_walk',
        frames: this.anims.generateFrameNumbers(SPRITE_BOSS_WETLANDS_WALK, { start: 0, end: 13 }),
        frameRate: 12,
        repeat: -1
      });
    }
    if (this.textures.exists(SPRITE_BOSS_WETLANDS_ATTACK1) && !this.anims.exists('anim_boss_wetlands_attack1')) {
      this.anims.create({
        key: 'anim_boss_wetlands_attack1',
        frames: this.anims.generateFrameNumbers(SPRITE_BOSS_WETLANDS_ATTACK1, { start: 0, end: 9 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (this.textures.exists(SPRITE_BOSS_WETLANDS_ATTACK2) && !this.anims.exists('anim_boss_wetlands_attack2')) {
      this.anims.create({
        key: 'anim_boss_wetlands_attack2',
        frames: this.anims.generateFrameNumbers(SPRITE_BOSS_WETLANDS_ATTACK2, { start: 0, end: 8 }),
        frameRate: 12,
        repeat: 0
      });
    }
    if (this.textures.exists(SPRITE_BOSS_WETLANDS_HIT) && !this.anims.exists('anim_boss_wetlands_hit')) {
      this.anims.create({
        key: 'anim_boss_wetlands_hit',
        frames: this.anims.generateFrameNumbers(SPRITE_BOSS_WETLANDS_HIT, { start: 0, end: 0 }),
        frameRate: 8,
        repeat: 0
      });
    }
    if (this.textures.exists(SPRITE_BOSS_WETLANDS_DEATH) && !this.anims.exists('anim_boss_wetlands_death')) {
      this.anims.create({
        key: 'anim_boss_wetlands_death',
        frames: this.anims.generateFrameNumbers(SPRITE_BOSS_WETLANDS_DEATH, { start: 0, end: 32 }),
        frameRate: 12,
        repeat: 0
      });
    }

    // C4-133-02: Đồng bộ tức thì các AudioBuffer đã được Phaser nạp vào AudioManager
    AudioManager.getInstance().syncWithPhaserCache(this);

    // V15-21: Thêm hiệu ứng mờ dần chuyển cảnh mượt mà (Camera Fade Out 450ms) khi tải xong 100%
    let isTransitioning = false;
    const proceedToMenu = () => {
      if (isTransitioning) return;
      isTransitioning = true;
      this.scene.start(SCENE_MAIN_MENU);
    };

    this.cameras.main.fadeOut(450, 11, 14, 20);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, proceedToMenu);
    this.time.delayedCall(550, proceedToMenu);
  }
}

