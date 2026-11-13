import * as Phaser from 'phaser';
import zonesData from '../data/zones.json';
import { ZoneData, ZoneId, InteractableSpec, TransitionZone, Point2D } from '../types';
import {
  TILE_FOREST_GRASS,
  TILE_DIRT_TRAIL,
  TILE_SWAMP_MUD,
  TILE_COBBLE_ROAD,
  TILE_STONE_FLOOR,
  SPRITE_TREE_OAK_1,
  SPRITE_TREE_OAK_2,
  SPRITE_TREE_OAK_3,
  SPRITE_BUSH_DENSE_1,
  SPRITE_BUSH_DENSE_2,
  SPRITE_HOLLOW_TREE,
  SPRITE_TREE_DEAD,
  SPRITE_HOUSE_EDDA,
  SPRITE_HOUSE_NERIS,
  SPRITE_BELL_TOWER,
  SPRITE_BROKEN_SHRINE,
  SPRITE_PILLAR_MOON,
  SPRITE_PILLAR_ROOT,
  SPRITE_PILLAR_EYE,
  SPRITE_VILLAGE_WELL,
  SPRITE_CRAFTING_BENCH,
  SPRITE_STONE_ALTAR,
  SPRITE_WOODEN_FENCE,
  SPRITE_SIGNPOST
} from '../config/Constants';

export class WorldBuilder {
  private scene: Phaser.Scene;
  private zones: Map<ZoneId, ZoneData> = new Map();
  private activeZoneId: ZoneId = 'fog_crossing';

  public colliderGroup!: Phaser.Physics.Arcade.StaticGroup;
  public treeCanopyGroup!: Phaser.GameObjects.Group;
  public interactables: InteractableSpec[] = [];
  public transitions: TransitionZone[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadZonesData();
  }

  private loadZonesData(): void {
    for (const z of zonesData.zones as ZoneData[]) {
      this.zones.set(z.id, z);
    }
  }

  public getZone(id: ZoneId): ZoneData | undefined {
    return this.zones.get(id);
  }

  public getActiveZone(): ZoneData {
    return this.zones.get(this.activeZoneId) || (zonesData.zones[0] as ZoneData);
  }

  public buildWorld(): void {
    this.colliderGroup = this.scene.physics.add.staticGroup();
    this.treeCanopyGroup = this.scene.add.group();

    // Dựng cảnh cho tất cả 5 phân khu
    for (const zone of this.zones.values()) {
      this.renderZoneTerrain(zone);
      this.setupZoneColliders(zone);
      this.setupZoneInteractables(zone);
      this.setupZoneTransitions(zone);
    }
  }

  /**
   * Dựng bề mặt đất, thảm cỏ, đường mòn và cảnh quan chi tiết cho từng phân khu bằng TileSprite.
   */
  private renderZoneTerrain(zone: ZoneData): void {
    const { bounds, id } = zone;

    // 1. Nền mặt đất cơ bản cho từng phân khu bằng TileSprite
    let baseTexture = TILE_FOREST_GRASS;
    let baseTint = 0xffffff;

    if (id === 'fog_crossing') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x889888; // Sương mù xám nhạt phủ lên thảm cỏ
    } else if (id === 'bellhollow') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x99aa88; // Cỏ làng ấm áp
    } else if (id === 'crooked_path') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x6e7d68; // Cỏ rừng rậm tối màu
    } else if (id === 'silent_mire') {
      baseTexture = TILE_SWAMP_MUD;
      baseTint = 0x88aa99; // Bùn rêu nước đầm lầy huyền bí
    } else if (id === 'broken_bell_shrine') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x777788; // Đất rêu phong xám lạnh quanh miếu đổ
    }

    const ground = this.scene.add.tileSprite(bounds.x, bounds.y, bounds.width, bounds.height, baseTexture);
    ground.setOrigin(0, 0);
    ground.setDepth(-100);
    if (baseTint !== 0xffffff) ground.setTint(baseTint);

    // 2. Vẽ đường mòn, đường đá cuội và sân gạch bằng TileSprite
    if (id === 'fog_crossing') {
      // Đường mòn đất xuyên qua màn sương
      const trail = this.scene.add.tileSprite(bounds.x, 160, bounds.width, 50, TILE_DIRT_TRAIL);
      trail.setOrigin(0, 0);
      trail.setDepth(-95);
      trail.setTint(0x999988);
    } else if (id === 'bellhollow') {
      // Đường đá cuội làng Bellhollow
      const mainRoad = this.scene.add.tileSprite(bounds.x, 240, bounds.width, 60, TILE_COBBLE_ROAD);
      mainRoad.setOrigin(0, 0);
      mainRoad.setDepth(-95);

      const pathEdda = this.scene.add.tileSprite(700, 120, 40, 130, TILE_COBBLE_ROAD);
      pathEdda.setOrigin(0, 0);
      pathEdda.setDepth(-95);

      const pathNeris = this.scene.add.tileSprite(960, 120, 40, 130, TILE_COBBLE_ROAD);
      pathNeris.setOrigin(0, 0);
      pathNeris.setDepth(-95);

      const pathTower = this.scene.add.tileSprite(820, 240, 50, 120, TILE_COBBLE_ROAD);
      pathTower.setOrigin(0, 0);
      pathTower.setDepth(-95);
    } else if (id === 'crooked_path') {
      // Đường mòn uốn lượn qua rừng bằng TileSprite
      const trailSegments = [
        { x: bounds.x, y: 260, w: 350, h: 50 },
        { x: bounds.x + 300, y: 220, w: 350, h: 60 },
        { x: bounds.x + 600, y: 260, w: 350, h: 60 },
        { x: bounds.x + 900, y: 280, w: 380, h: 50 }
      ];
      for (const seg of trailSegments) {
        const trail = this.scene.add.tileSprite(seg.x, seg.y, seg.w, seg.h, TILE_DIRT_TRAIL);
        trail.setOrigin(0, 0);
        trail.setDepth(-95);
        trail.setTint(0x887766);
      }
    } else if (id === 'silent_mire') {
      // Lối đi gờ đất mộc nổi trên đầm lầy
      const mirePaths = [
        { x: bounds.x, y: 300, w: 400, h: 40 },
        { x: bounds.x + 380, y: 220, w: 500, h: 40 },
        { x: bounds.x + 850, y: 270, w: 270, h: 45 }
      ];
      for (const p of mirePaths) {
        const path = this.scene.add.tileSprite(p.x, p.y, p.w, p.h, TILE_DIRT_TRAIL);
        path.setOrigin(0, 0);
        path.setDepth(-95);
        path.setTint(0x665544);
      }
    } else if (id === 'broken_bell_shrine') {
      // Sân gạch đá cổ của Miếu Chuông bằng TileSprite
      const courtyard = this.scene.add.tileSprite(bounds.x + 200, 160, 560, 280, TILE_STONE_FLOOR);
      courtyard.setOrigin(0, 0);
      courtyard.setDepth(-95);
      courtyard.setTint(0x888899);
    }

    // 3. Dựng các chi tiết kiến trúc đặc thù
    this.renderDecorations(zone);
  }

  private renderDecorations(zone: ZoneData): void {
    const { id, bounds } = zone;

    if (id === 'fog_crossing') {
      // Vẽ cổng sương mù và bia đá dẫn lối
      this.createTree(160, 100, 'Cây Khô Sương Mù');
      this.createTree(300, 240, 'Cây Khô Sương Mù');
      this.createStoneSign(240, 180, 'TẤM BIỂN MỤC');
    } else if (id === 'bellhollow') {
      // Nhà của Edda (Nhà gỗ mái rạ)
      this.createBuilding(650, 80, 112, 48, 0x5a3d28, 0x8a6338, 'Nhà Edda – Người Giữ Chuông');
      // Nhà của Neris (Nhà thảo mộc)
      this.createBuilding(920, 80, 112, 48, 0x4a4335, 0x6e7845, 'Nhà Neris – Thảo Mộc');
      // Tháp chuông làng Bellhollow
      this.createBellTower(800, 280, 80, 64);
      // Giếng nước làng
      this.createVillageWell(720, 380);
      // Quầy chế tạo
      this.createCraftingBench(960, 360);
      // Hàng rào làng
      this.createVillageFence(bounds);
    } else if (id === 'crooked_path') {
      // Cây cổ thụ có thân rỗng
      this.createHollowTree(1900, 180, 'Thân Cây Rỗng (Chỗ trốn)');
      this.createHollowTree(2350, 420, 'Thân Cây Rỗng (Chỗ trốn)');
      // Bụi rậm rậm rạp
      this.createDenseBush(1820, 260);
      this.createDenseBush(2180, 200);
      this.createDenseBush(2500, 380);
      // Tảng đá cổ
      this.createRock(2100, 280, 56, 32);
      // Thêm các cây rừng
      for (let x = bounds.x + 80; x < bounds.x + bounds.width - 80; x += 180) {
        this.createTree(x, 120 + ((x % 3) * 30), 'Cây Rừng Cổ Thụ');
        this.createTree(x + 50, 460 + ((x % 2) * 40), 'Cây Rừng Cổ Thụ');
      }
    } else if (id === 'silent_mire') {
      // Vũng nước đầm lầy đen kịt
      this.createMireWater(3200, 250, 180, 90);
      // 3 Cột đá cổ ngữ (Mặt Trăng, Rễ Cây, Con Mắt)
      this.createRunestonePillar(3400, 220, 'Trăng Khuyết', 0x5dade2);
      this.createRunestonePillar(3520, 360, 'Rễ Rừng', 0x58d68d);
      this.createRunestonePillar(3640, 220, 'Con Mắt', 0xaf7ac5);
      // Bụi rậm đầm lầy
      this.createDenseBush(3100, 380);
      this.createDenseBush(3750, 200);
    } else if (id === 'broken_bell_shrine') {
      // Miếu chuông phế tích
      this.createShrineAltar(4500, 250, 96, 64);
      // 2 Cột đá miếu
      this.createShrinePillar(4350, 180);
      this.createShrinePillar(4650, 180);
      // Bệ thờ đổ nát ẩn nấp
      this.createHidingRubble(4360, 380);
      // Bụi rậm miếu
      this.createDenseBush(4700, 340);
    }
  }

  // --- CÁC HÀM TẠO ĐỐI TƯỢNG ĐỒ HỌA & VA CHẠM THỰC THẾ (SPRITES PIXEL ART THẬT - PASS T08) ---

  private createTree(x: number, y: number, label?: string): void {
    let treeKey = SPRITE_TREE_OAK_1;
    if (label?.includes('Khô')) {
      treeKey = SPRITE_TREE_DEAD;
    } else if (Math.floor(x / 100) % 3 === 1) {
      treeKey = SPRITE_TREE_OAK_2;
    } else if (Math.floor(x / 100) % 3 === 2) {
      treeKey = SPRITE_TREE_OAK_3;
    }

    const tree = this.scene.add.image(x, y, treeKey);
    const scale = treeKey === SPRITE_TREE_DEAD ? 1.5 : 1.0;
    tree.setScale(scale);
    tree.setOrigin(0.5, 0.88);
    tree.setDepth(y);

    // Chuẩn collider gốc cây (20×12 px) để nhân vật có thể đi xuyên dưới tán lá
    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(20, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-10, -6);
  }

  private createHollowTree(x: number, y: number, _label?: string): void {
    const tree = this.scene.add.image(x, y, SPRITE_HOLLOW_TREE);
    tree.setOrigin(0.5, 0.85);
    tree.setDepth(y);

    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(28, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-14, -7);
  }

  private createDenseBush(x: number, y: number): void {
    const bushKey = (Math.floor(x) % 2 === 0) ? SPRITE_BUSH_DENSE_1 : SPRITE_BUSH_DENSE_2;
    const bush = this.scene.add.image(x, y, bushKey);
    bush.setOrigin(0.5, 0.85);
    bush.setDepth(y);
  }

  private createStoneSign(x: number, y: number, _text?: string): void {
    const sign = this.scene.add.image(x, y, SPRITE_SIGNPOST);
    sign.setOrigin(0.5, 0.85);
    sign.setDepth(y);
  }

  private createBuilding(x: number, y: number, w: number, h: number, _wallColor: number, _roofColor: number, name?: string): void {
    const isEdda = name?.includes('Edda');
    const houseKey = isEdda ? SPRITE_HOUSE_EDDA : SPRITE_HOUSE_NERIS;

    // Sprite nhà có kích thước 112×80 px, đặt tại (x, y - 16) để chân nhà khớp đúng với lưới collider
    const house = this.scene.add.image(x, y - 16, houseKey);
    house.setOrigin(0, 0);
    house.setDepth(y + h);

    // Collider ở chân tường để tạo chiều sâu cho phép đứng trước cửa
    const body = this.colliderGroup.create(x + w / 2, y + h - 12, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w, 24);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w / 2, -12);
  }

  private createBellTower(x: number, y: number, w: number, h: number): void {
    // Tháp chuông làng Bellhollow bằng sprite SPRITE_BELL_TOWER (80×112 px)
    const tower = this.scene.add.image(x, y - 48, SPRITE_BELL_TOWER);
    tower.setOrigin(0, 0);
    tower.setDepth(y + h);

    const body = this.colliderGroup.create(x + w / 2, y + h - 16, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w, 32);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w / 2, -16);
  }

  private createVillageWell(x: number, y: number): void {
    const well = this.scene.add.image(x, y, SPRITE_VILLAGE_WELL);
    well.setOrigin(0.5, 0.75);
    well.setDepth(y);

    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 20);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -10);
  }

  private createCraftingBench(x: number, y: number): void {
    const bench = this.scene.add.image(x + 18, y + 9, SPRITE_CRAFTING_BENCH);
    bench.setOrigin(0.5, 0.7);
    bench.setDepth(y + 18);

    const body = this.colliderGroup.create(x + 18, y + 9, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(48, 20);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-24, -10);
  }

  private createVillageFence(bounds: { x: number; y: number; width: number; height: number }): void {
    for (let fx = bounds.x; fx < bounds.x + bounds.width; fx += 44) {
      const topFence = this.scene.add.image(fx, bounds.y + 12, SPRITE_WOODEN_FENCE);
      topFence.setOrigin(0, 0.5);
      topFence.setDepth(bounds.y + 20);

      const botFence = this.scene.add.image(fx, bounds.y + bounds.height - 12, SPRITE_WOODEN_FENCE);
      botFence.setOrigin(0, 0.5);
      botFence.setDepth(bounds.y + bounds.height);
    }
  }

  private createRock(x: number, y: number, w: number, h: number): void {
    const rock = this.scene.add.graphics();
    rock.fillStyle(0x424949, 1);
    rock.fillEllipse(x + w / 2, y + h / 2, w, h);
    rock.setDepth(y + h);

    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w, h);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w / 2, -h / 2);
  }

  private createMireWater(x: number, y: number, w: number, h: number): void {
    const water = this.scene.add.graphics();
    water.fillStyle(0x0e1716, 0.95);
    water.fillEllipse(x + w / 2, y + h / 2, w, h);
    water.lineStyle(2, 0x192e27, 0.8);
    water.strokeEllipse(x + w / 2, y + h / 2, w, h);
    water.setDepth(-80);

    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.85, h * 0.8);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.425, -h * 0.4);
  }

  private createRunestonePillar(x: number, y: number, runeName: string, _glowColor: number): void {
    let pillarKey = SPRITE_PILLAR_MOON;
    if (runeName.includes('Rễ') || runeName.includes('Root')) {
      pillarKey = SPRITE_PILLAR_ROOT;
    } else if (runeName.includes('Mắt') || runeName.includes('Eye')) {
      pillarKey = SPRITE_PILLAR_EYE;
    }

    const pillar = this.scene.add.image(x, y, pillarKey);
    pillar.setOrigin(0.5, 0.85);
    pillar.setDepth(y);

    const body = this.colliderGroup.create(x, y - 6, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(20, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-10, -8);
  }

  private createShrineAltar(x: number, y: number, w: number, h: number): void {
    const shrine = this.scene.add.image(x, y - 16, SPRITE_BROKEN_SHRINE);
    shrine.setOrigin(0, 0);
    shrine.setDepth(y + h);

    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w, h * 0.7);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w / 2, -h * 0.35);
  }

  private createShrinePillar(x: number, y: number): void {
    const pillar = this.scene.add.image(x, y, SPRITE_STONE_ALTAR);
    pillar.setOrigin(0.5, 0.8);
    pillar.setDepth(y);

    const body = this.colliderGroup.create(x, y - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);
  }

  private createHidingRubble(x: number, y: number): void {
    const rubble = this.scene.add.image(x, y, SPRITE_STONE_ALTAR);
    rubble.setOrigin(0, 0);
    rubble.setDepth(y + 20);
  }

  private setupZoneColliders(zone: ZoneData): void {
    for (const spec of zone.colliders) {
      if (spec.type === 'boundary') {
        const wall = this.colliderGroup.create(
          spec.x + spec.width / 2, 
          spec.y + spec.height / 2, 
          undefined
        ) as Phaser.Physics.Arcade.Sprite;
        wall.setVisible(false);
        const b = wall.body as Phaser.Physics.Arcade.Body;
        b.setSize(spec.width, spec.height);
        b.setOffset(-spec.width / 2, -spec.height / 2);
      }
    }
  }

  private setupZoneInteractables(zone: ZoneData): void {
    for (const item of zone.interactables) {
      this.interactables.push(item);
    }
  }

  private setupZoneTransitions(zone: ZoneData): void {
    for (const trans of zone.transitions) {
      this.transitions.push(trans);
    }
  }

  public detectCurrentZone(pos: Point2D): ZoneId {
    for (const zone of this.zones.values()) {
      const b = zone.bounds;
      if (pos.x >= b.x && pos.x <= b.x + b.width && pos.y >= b.y && pos.y <= b.y + b.height) {
        if (this.activeZoneId !== zone.id) {
          this.activeZoneId = zone.id;
        }
        return zone.id;
      }
    }
    return this.activeZoneId;
  }

  public checkInteractableNearby(pos: Point2D, radius: number = 38): InteractableSpec | null {
    for (const item of this.interactables) {
      const dist = Phaser.Math.Distance.Between(pos.x, pos.y, item.x, item.y);
      if (dist <= radius) {
        return item;
      }
    }
    return null;
  }
}
