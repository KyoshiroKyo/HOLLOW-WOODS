import fs from 'fs';

const filePath = 'src/world/WorldBuilder.ts';
let code = fs.readFileSync(filePath, 'utf8');

// 1. In renderSanctuaryFarmTerrain, insert Central Courtyard and Herb Terrace Bed before drawFarmPath
const targetTerrain = `        // 2. Mạng lưới đường mòn đất nông trại
        const drawFarmPath = (points: Array<{ x: number; y: number; r: number }>) => {`;

const replaceTerrain = `        // 2. Sân làm việc trung tâm & Thềm đất Vườn ươm Thảo Dược (C4-12-19)
        // 2.1. Sân làm việc trung tâm lát đá sỏi nện mộc mạc (wx: 620..710, wy: 635..740)
        const yardLX = toLX(620);
        const yardLY = toLY(635);
        ctx.fillStyle = '#3e2e1e';
        ctx.fillRect(yardLX, yardLY, 92, 106);
        ctx.fillStyle = '#523f2c';
        ctx.fillRect(yardLX + 3, yardLY + 3, 86, 100);
        for (let y = yardLY + 6; y < yardLY + 98; y += 12) {
          for (let x = yardLX + 6; x < yardLX + 84; x += 14) {
            ctx.fillStyle = nextRand() > 0.5 ? '#67523b' : '#382a1c';
            ctx.fillRect(x + Math.floor((nextRand() - 0.5) * 4), y + Math.floor((nextRand() - 0.5) * 4), 6, 4);
          }
        }

        // 2.2. Thềm đất Vườn ươm Thảo Dược Sanctuary (wx: 735..865, wy: 625..720)
        const terraceLX = toLX(735);
        const terraceLY = toLY(625);
        ctx.fillStyle = '#2a1d13';
        ctx.fillRect(terraceLX, terraceLY, 130, 95);
        ctx.fillStyle = '#382519';
        ctx.fillRect(terraceLX + 3, terraceLY + 3, 124, 89);
        ctx.strokeStyle = '#4e5d6c';
        ctx.lineWidth = 2;
        ctx.strokeRect(terraceLX + 1, terraceLY + 1, 128, 93);

        // Lối đi kết nối giữa Sân trung tâm và Thềm vườn dược (wx: 700..740, wy: 650..690)
        ctx.fillStyle = '#523f2c';
        ctx.fillRect(toLX(700), toLY(650), 40, 42);

        // 3. Mạng lưới đường mòn đất nông trại
        const drawFarmPath = (points: Array<{ x: number; y: number; r: number }>) => {`;

if (!code.includes(targetTerrain)) {
  throw new Error('targetTerrain not found in WorldBuilder.ts');
}
code = code.replace(targetTerrain, replaceTerrain);

// 2. Replace renderSanctuaryFarmDecorations
const targetDecorations = `  /**
   * C4-12-17: Bố trí kiến trúc, nhà kho, giếng nước, rương chứa và prop trang trại cho Sanctuary Farm.
   */
  private renderSanctuaryFarmDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Nhà Kho / Chuồng Trại Nông Trại (x=540, y=680, w=100, h=50)
    this.createFarmBarnStructure(540, 680, 100, 50);

    // 2. Giếng Nước / Bơm Nước Nông Trại tại ngã rẽ bờ ao (920, 700)
    this.createVillageWell(920, 700);

    // 3. Rương Trú Ẩn Nông Trại (680, 640)
    this.createChestProp(680, 640);

    // 4. Các cụm thùng gỗ, bao tải và đống củi quanh nhà kho
    this.createVillagePropCluster(515, 725, 'barrels');
    this.createVillagePropCluster(650, 715, 'firewood');

    // 5. Cột đèn lồng gỗ dẫn hướng
    this.createVillageLanternPost(650, 600);
    this.createVillageLanternPost(650, 745);
    this.createVillageLanternPost(1090, 745);

    // 6. Cây ăn trái / vườn cây nông trại phía Bắc ao
    this.createTree(760, 660, 'Cây Ăn Trái Nông Trại');
    this.createTree(840, 660, 'Cây Ăn Trái Nông Trại');
    this.createTree(505, 840, 'Cây Bìa Nông Trại');
    this.createTree(505, 960, 'Cây Bìa Nông Trại');

    // 7. Bụi cây rậm và hàng rào ranh giới
    this.createDenseBush(520, 770);
    this.createDenseBush(890, 670);
    this.createDenseBush(1030, 790);

    this.createFarmPerimeterFences(bounds);
  }`;

const replaceDecorations = `  /**
   * C4-12-19: Xây dựng bản đồ môi trường chi tiết cho Sanctuary Farm (Nông trại Trú Ẩn).
   * Bố trí kiến trúc gọn gàng, ấm cúng với lối vào rõ ràng, khu sân làm việc trung tâm,
   * mái che sơ chế thảo mộc, nguồn nước/giếng tưới, khu 4 ô đất trồng thảo mộc thông thoáng,
   * hàng rào gỗ và thảm thực vật cây cỏ tự nhiên bao quanh.
   */
  private renderSanctuaryFarmDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Biển Đón Vào Nông Trại Trú Ẩn tại cửa ngõ phía Bắc (615, 590)
    this.createStoneSign(615, 590, 'NÔNG TRẠI TRÚ ẨN');

    // 2. Nhà Kho / Chuồng Trại Nông Trại (x=540, y=680, w=100, h=50)
    this.createFarmBarnStructure(540, 680, 100, 50);

    // 3. Mái Che & Bàn Sơ Chế Thảo Mộc (Herbalist Processing Shelter & Workbench: 685, 625)
    this.createHerbalistProcessingShelter(685, 625);

    // 4. Giếng Nước Nông Trại & Nguồn nước tưới cây (920, 700)
    this.createVillageWell(920, 700);

    // 5. Khu Vườn Dược Sanctuary Terrace (Bờ đá, máng nước, biển đề danh: 730, 625)
    this.createSanctuaryHerbTerrace(730, 625);

    // 6. Rương Trú Ẩn Nông Trại (680, 640)
    this.createChestProp(680, 640);

    // 7. Cụm thùng gỗ, bao tải nông sản, đống củi và xe cút kít (wheelbarrow)
    this.createVillagePropCluster(515, 725, 'barrels');
    this.createVillagePropCluster(650, 715, 'firewood');
    this.createFarmWheelbarrow(615, 710);

    // 8. Hệ thống cột đèn lồng gỗ dẫn hướng ấm áp
    this.createVillageLanternPost(650, 600);
    this.createVillageLanternPost(650, 745);
    this.createVillageLanternPost(740, 715);
    this.createVillageLanternPost(1090, 745);

    // 9. Cây ăn trái & rặng cây xanh tự nhiên bao quanh (chừa trống hoàn toàn 4 ô đất 760..840, 640..690)
    this.createTree(760, 595, 'Cây Ăn Trái Nông Trại');
    this.createTree(850, 595, 'Cây Ăn Trái Nông Trại');
    this.createTree(905, 640, 'Cây Ăn Trái Nông Trại');
    this.createTree(505, 840, 'Cây Bìa Nông Trại');
    this.createTree(505, 960, 'Cây Bìa Nông Trại');

    // 10. Bụi cây rậm và hoa cỏ đồng quê tự nhiên
    this.createDenseBush(520, 770);
    this.createDenseBush(610, 610);
    this.createDenseBush(720, 725);
    this.createDenseBush(880, 660);
    this.createDenseBush(1030, 790);

    // 11. Hàng rào chu vi nông trại & rào bờ ruộng
    this.createFarmPerimeterFences(bounds);
  }`;

if (!code.includes(targetDecorations)) {
  throw new Error('targetDecorations not found in WorldBuilder.ts');
}
code = code.replace(targetDecorations, replaceDecorations);

// 3. Update createFarmPerimeterFences to add decorative fences for the herb terrace
const targetFences = `    // Hàng rào ngăn bờ ruộng phía Bắc (wy = 788) chừa lối đi giữa ruộng
    addFarmFence(520, 788, true);
    addFarmFence(568, 788, true);
    addFarmFence(710, 788, true);
    addFarmFence(758, 788, true);
    addFarmFence(806, 788, true);
    addFarmFence(854, 788, true);
  }`;

const replaceFences = `    // Hàng rào ngăn bờ ruộng phía Bắc (wy = 788) chừa lối đi giữa ruộng
    addFarmFence(520, 788, true);
    addFarmFence(568, 788, true);
    addFarmFence(710, 788, true);
    addFarmFence(758, 788, true);
    addFarmFence(806, 788, true);
    addFarmFence(854, 788, true);

    // Hàng rào gỗ nhỏ trang trí bao quanh phía Bắc & Đông Vườn Dược Sanctuary (chừa lối Tây thông thoáng)
    addFarmFence(740, 616, false);
    addFarmFence(788, 616, false);
    addFarmFence(836, 616, false);
    addFarmFence(868, 650, false);
    addFarmFence(868, 700, false);
  }`;

if (!code.includes(targetFences)) {
  throw new Error('targetFences not found in WorldBuilder.ts');
}
code = code.replace(targetFences, replaceFences);

// 4. Add helper methods before detectCurrentZone
const targetHelper = `  public detectCurrentZone(pos: Point2D): ZoneId {`;

const newHelpers = `  /**
   * C4-12-19: Tạo Mái Che & Bàn Sơ Chế Thảo Mộc (Herbalist Processing Shelter & Workbench).
   */
  private createHerbalistProcessingShelter(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng mát dưới mái che
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRoundedRect(x - 6, y + 10, 46, 22, 4);

    // 4 Cột gỗ sồi chịu lực của giàn che (Pergola)
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 2, y - 18, 4, 32);
    g.fillRect(x + 32, y - 18, 4, 32);
    g.fillStyle(0x2d1b13, 1);
    g.fillRect(x + 4, y - 14, 3, 26);
    g.fillRect(x + 28, y - 14, 3, 26);

    // Mái che rơm rạ / ván gỗ nghiêng che nắng mưa
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - 6, y - 22, 46, 6);
    g.fillStyle(0x795548, 1);
    g.fillRect(x - 4, y - 25, 42, 5);
    g.fillStyle(0xa1887f, 1);
    g.fillRect(x - 2, y - 27, 38, 4);
    // Vệt rêu xanh trên mái
    g.fillStyle(0x388e3c, 0.7);
    g.fillRect(x + 2, y - 24, 10, 3);
    g.fillRect(x + 22, y - 26, 12, 3);

    // Bó thảo dược phơi khô treo lủng lẳng dưới xà mái
    const dryHerbColors = [0x81c784, 0xffd54f, 0xaed581, 0xdce775];
    for (let i = 0; i < 4; i++) {
      g.fillStyle(dryHerbColors[i], 1);
      g.fillRect(x + 3 + i * 8, y - 16, 4, 7);
      g.fillStyle(0x558b2f, 1);
      g.fillRect(x + 4 + i * 8, y - 14, 2, 6);
    }

    // Bàn sơ chế gỗ dày dặn (Workbench)
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x, y + 2, 34, 14);
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x + 2, y + 3, 30, 4);

    // Đạo cụ trên bàn: thớt gỗ, cối chày đá, hũ thuốc hổ phách
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(x + 4, y + 1, 9, 7);
    g.fillStyle(0xb0bec5, 1);
    g.fillRect(x + 16, y, 6, 6);
    g.fillStyle(0xffb74d, 1);
    g.fillRect(x + 24, y - 1, 4, 6);

    g.setDepth(y + 14);

    // Collider nhẹ cho bàn sơ chế (chỉ chân bàn phía trên để nhân vật đứng trước bàn tương tác mượt mà)
    const body = this.colliderGroup.create(x + 17, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -5);
  }

  /**
   * C4-12-19: Tạo khu vực Vườn Dược Sanctuary Terrace (Bờ đá, máng nước tưới, biển đề danh).
   */
  private createSanctuaryHerbTerrace(x: number, y: number): void {
    const g = this.scene.add.graphics();

    // Máng nước tưới cây bằng gỗ (Water Trough)
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 8, y + 18, 18, 6);

    // Thân máng nước gỗ
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x, y + 4, 16, 12);
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x + 1, y + 5, 14, 10);
    // Nước trong máng xanh ngọc
    g.fillStyle(0x29b6f6, 1);
    g.fillRect(x + 2, y + 6, 12, 7);
    g.fillStyle(0xb3e5fc, 0.8);
    g.fillRect(x + 3, y + 7, 5, 2);

    // Xô múc nước bằng gỗ có quai sắt
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x + 19, y + 7, 8, 9);
    g.fillStyle(0x78909c, 1);
    g.fillRect(x + 20, y + 4, 6, 3);

    // Biển gỗ cắm đầu bờ vườn: "VƯỜN DƯỢC"
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 10, y + 2, 3, 14);
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x - 16, y - 4, 15, 8);
    g.fillStyle(0xa1887f, 1);
    g.fillRect(x - 15, y - 3, 13, 2);

    g.setDepth(y + 12);
  }

  /**
   * C4-12-19: Tạo Xe Cút Kít Nông Trại (Wheelbarrow) chở nông sản và đất mùn.
   */
  private createFarmWheelbarrow(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng xe
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 8, y + 10, 20, 6);

    // Bánh xe gỗ đơn
    g.fillStyle(0x261c14, 1);
    g.fillRect(x - 4, y + 4, 4, 8);
    // Thân thùng xe gỗ
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x, y + 2, 18, 9);
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x + 2, y + 3, 14, 6);
    // Đất mùn và nhánh thảo mộc trong xe
    g.fillStyle(0x271911, 1);
    g.fillRect(x + 3, y + 2, 12, 4);
    g.fillStyle(0x4caf50, 1);
    g.fillRect(x + 5, y, 4, 3);
    g.fillStyle(0x81c784, 1);
    g.fillRect(x + 10, y + 1, 4, 2);
    // Càng xe gỗ
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x + 16, y + 6, 8, 2);
    g.fillRect(x + 16, y + 9, 8, 2);

    g.setDepth(y + 8);
  }

  public detectCurrentZone(pos: Point2D): ZoneId {`;

if (!code.includes(targetHelper)) {
  throw new Error('targetHelper not found in WorldBuilder.ts');
}
code = code.replace(targetHelper, newHelpers);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated WorldBuilder.ts for C4-12-19!');
