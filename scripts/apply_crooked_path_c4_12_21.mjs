import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/world/WorldBuilder.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Cập nhật nhánh rẽ Outer Woods trong renderCrookedPathTerrain
const oldBranch = `        // 3.3. Nhánh rẽ phía Tây-Nam về Rừng Ngoại Vi (Outer Woods Branch)
        drawTrail([
          { x: 1680, y: 285, r: 18 },
          { x: 1650, y: 370, r: 17 },
          { x: 1610, y: 480, r: 16 }   // Tới lối mòn phụ Rừng Ven (1610, 480)
        ], false);`;

const newBranch = `        // Bãi đất quanh các điểm mốc mới
        drawClearing(1680, 320, 36, 24); // Ngã Ba Rừng Biên Giới
        drawClearing(2650, 260, 30, 20); // Bọc hành trang cũ

        // 3.3. Nhánh rẽ phía Tây-Nam kết nối hai chiều với Rừng Ngoại Vi (Outer Woods Branch C4-12-21)
        drawTrail([
          { x: 1680, y: 285, r: 20 },
          { x: 1660, y: 360, r: 20 },
          { x: 1635, y: 440, r: 21 },
          { x: 1610, y: 500, r: 22 }   // Khớp hoàn hảo vạch chuyển vùng Outer Woods (1600, 440..560)
        ], false);`;

if (!content.includes(oldBranch)) {
  console.error('Could not find oldBranch in WorldBuilder.ts!');
  process.exit(1);
}

content = content.replace(oldBranch, newBranch);
console.log('Successfully updated terrain trails in renderCrookedPathTerrain!');

// 2. Thay thế khối inline cũ trong renderDecorations bằng gọi hàm renderCrookedPathDecorations(zone)
const oldDecorBlock = `    } else if (id === 'crooked_path') {
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
    }`;

const newDecorCall = `    } else if (id === 'crooked_path') {
      this.renderCrookedPathDecorations(zone);
    }`;

if (!content.includes(oldDecorBlock)) {
  console.error('Could not find oldDecorBlock in WorldBuilder.ts!');
  process.exit(1);
}

content = content.replace(oldDecorBlock, newDecorCall);
console.log('Successfully dispatched renderCrookedPathDecorations!');

// 3. Bổ sung method renderCrookedPathDecorations và các hàm helper
const newMethods = `  /**
   * C4-12-21: Xây dựng bản đồ môi trường chi tiết cho phân khu Frontier: Lối Mòn Quanh Co (The Crooked Path).
   * Thiết kế con đường rừng uốn lượn tự nhiên với các khúc cua, khoảng rừng thưa, điểm mốc định hướng (landmarks),
   * ngách khám phá phụ, bố cục rễ cây, cụm cây sồi, tảng đá, gỗ mục và sương mù dẫn hướng người chơi một cách tự nhiên.
   */
  private renderCrookedPathDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Biển Báo & Cột Mốc Định Hướng (Signs & Landmark Totems)
    this.createStoneSign(1660, 320, 'LỐI MÒN QUANH CO');
    this.createStoneSign(2100, 45, 'NGUY HIỂM: RỪNG SÂU');
    this.createStoneMarker(2760, 240); // Cột đá cổ Bắc ngưỡng cửa Đầm Lầy
    this.createStoneMarker(2760, 360); // Cột đá cổ Nam ngưỡng cửa Đầm Lầy

    // 2. Hệ Thống 6 Cột Đèn Lồng Dẫn Hướng Gỗ
    this.createVillageLanternPost(1680, 310); // Đèn ngã ba lối rẽ Outer Woods
    this.createVillageLanternPost(1860, 250); // Đèn bãi cây rỗng 1
    this.createVillageLanternPost(2030, 230); // Đèn ngã rẽ Rừng Sâu
    this.createVillageLanternPost(2170, 260); // Đèn khối đá canh gác
    this.createVillageLanternPost(2330, 360); // Đèn vực rễ cây
    this.createVillageLanternPost(2680, 310); // Đèn ngưỡng cửa đầm lầy

    // 3. Thân Cây Đổ, Rễ Cây Xoắn & Gỗ Mục (Fallen Timber & Tangled Roots)
    this.createFallenLog(1740, 350, 56, 15);   // Thân cây mục bên lối rẽ Outer Woods
    this.createFallenLog(2280, 380, 64, -18);  // Thân sồi bắc qua vực rễ
    this.createFallenLog(2580, 260, 52, 22);   // Cây mục ven bụi rậm đầm lầy
    this.createTangledRoots(1980, 210);        // Cụm rễ cây xoắn gồ ghề ngã ba
    this.createTangledRoots(2420, 330);        // Cụm rễ cây xoắn sườn đồi

    // 4. Nơi Ẩn Nấp & Thân Cây Cổ Thụ Rỗng (Stealth Hiding Spots)
    this.createHollowTree(1900, 180, 'Thân Cây Rỗng (Chỗ trốn)');
    this.createHollowTree(2350, 420, 'Thân Cây Rỗng (Chỗ trốn)');
    this.createDenseBush(1820, 260); // Bụi trốn 1
    this.createDenseBush(2180, 200); // Bụi trốn 2
    this.createDenseBush(2500, 380); // Bụi trốn 3
    this.createDenseBush(1710, 390);
    this.createDenseBush(2010, 160);
    this.createDenseBush(2320, 300);
    this.createDenseBush(2620, 360);

    // 5. Khối Đá Canh Gác Cổ Đại & Đá Tảng (Great Sentinel Rock & Boulders)
    this.createRock(2100, 280, 58, 36); // Great Sentinel Rock
    this.createRock(1790, 220, 38, 22);
    this.createRock(2220, 330, 42, 26);
    this.createRock(2440, 410, 36, 20);
    this.createRock(2720, 270, 40, 24);

    // 6. Bọc Hành Trang Người Đi Rừng (Hunter's Lost Cache)
    this.createHunterLostCache(2650, 260);

    // 7. Quần Thể Cây Sồi & Thông Cổ Thụ Dày Đặc Dọc Viền Bắc/Nam (Natural Boundary Framing)
    // Dàn cây viền phía Bắc (chừa nhánh rẽ Rừng Sâu 2020..2120, y < 50)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 110) {
      if (x < 2010 || x > 2130) {
        this.createTree(x, 100 + ((x % 3) * 20), 'Cây Rừng Cổ Thụ Viền Bắc');
      }
    }

    // Dàn cây viền phía Nam (chừa lối mòn kết nối Outer Woods 1600..1660, y: 440..540)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 115) {
      if (x > 1660) {
        this.createTree(x, 500 + ((x % 2) * 25), 'Cây Rừng Cổ Thụ Viền Nam');
      }
    }

    // 8. Sương Mù Ranh Giới Khí Quyển (Crooked Path Atmospheric Fog)
    this.createCrookedPathAtmosphericFog();
  }

  /**
   * C4-12-21: Tạo Cột Mốc Đá Cổ Ngưỡng Cửa (Weathered Stone Marker).
   */
  private createStoneMarker(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng chân cột đá
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillEllipse(x + 5, y + 16, 22, 8);

    // Thân cột đá obelisk phong rêu sứt mẻ
    g.fillStyle(0x2f353b, 1);
    g.fillRect(x, y - 18, 12, 34);
    g.fillStyle(0x42494f, 1);
    g.fillRect(x + 2, y - 16, 8, 30);
    g.fillStyle(0x5a636a, 1);
    g.fillRect(x + 3, y - 14, 5, 26);

    // Ký hiệu cổ khắc chìm rỉ sáng mờ ảo
    g.fillStyle(0x2ecc71, 0.6);
    g.fillRect(x + 4, y - 6, 3, 10);
    g.fillRect(x + 3, y - 2, 5, 2);

    // Vệt rêu xanh bám chân cột
    g.fillStyle(0x388e3c, 0.85);
    g.fillRect(x + 1, y + 8, 10, 6);

    g.setDepth(y + 16);

    const body = this.colliderGroup.create(x + 6, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(12, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-6, -5);
  }

  /**
   * C4-12-21: Tạo Cụm Rễ Cây Xoắn Gồ Ghề (Tangled Roots).
   */
  private createTangledRoots(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng rễ cây
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillRoundedRect(x - 14, y + 2, 32, 10, 3);

    // Rễ sồi già gồ lên mặt đất
    g.fillStyle(0x2d1a0e, 1);
    g.fillRect(x - 12, y - 2, 28, 6);
    g.fillRect(x - 8, y - 5, 20, 5);
    g.fillStyle(0x3e2716, 1);
    g.fillRect(x - 10, y - 1, 24, 3);
    g.fillStyle(0x5d3a22, 1);
    g.fillRect(x - 6, y - 4, 16, 2);

    // Rêu ẩm bám kẽ rễ
    g.fillStyle(0x4caf50, 0.8);
    g.fillRect(x - 4, y - 2, 8, 2);

    g.setDepth(y + 4);
  }

  /**
   * C4-12-21: Tạo Bọc Hành Trang Cũ Của Người Đi Rừng (Hunter's Lost Cache).
   */
  private createHunterLostCache(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 6, y + 8, 18, 6);

    // Nan gỗ bánh xe mục vỡ
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 6, y - 4, 3, 14);
    g.fillRect(x - 8, y + 2, 16, 2);

    // Túi da cũ kỹ sờn rách
    g.fillStyle(0x5d4037, 1);
    g.fillRoundedRect(x, y - 2, 14, 10, 2);
    g.fillStyle(0x795548, 1);
    g.fillRect(x + 2, y, 10, 5);

    // Khóa kim loại hoen gỉ
    g.fillStyle(0xbcaaa4, 1);
    g.fillRect(x + 6, y + 1, 3, 3);

    g.setDepth(y + 6);
  }

  /**
   * C4-12-21: Hiệu ứng sương mù khí quyển u ám dọc hai bên viền Đường Mòn Quanh Co (The Crooked Path).
   * Giữ lòng đường mòn và các ngọn đèn lồng rõ nét để người chơi định vị và lẩn trốn.
   */
  private createCrookedPathAtmosphericFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addFog = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      depth: number,
      driftX: number = 20,
      duration: number = 7400
    ) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(scaleX, scaleY);
      mist.setAlpha(alpha);
      mist.setTint(tint);
      mist.setDepth(depth);

      if (this.scene.tweens && driftX > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + driftX,
          alpha: Math.max(0.08, alpha - 0.06),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // Sương mù phía Bắc (dày đặc hướng lên Rừng Sâu)
    addFog(1820, 60, 1.25, 0.65, 0.32, 0x1b2723, 600, 18, 7200);
    addFog(2100, 40, 1.35, 0.70, 0.40, 0x141d1a, 600, 22, 6800);
    addFog(2480, 70, 1.30, 0.65, 0.34, 0x182420, 600, 16, 7600);
    addFog(2800, 65, 1.25, 0.65, 0.35, 0x17221e, 600, 18, 7400);

    // Sương mù phía Nam
    addFog(1940, 560, 1.25, 0.65, 0.30, 0x1d2924, 600, 20, 7800);
    addFog(2360, 570, 1.35, 0.70, 0.34, 0x17231f, 600, 18, 7200);
    addFog(2760, 560, 1.30, 0.65, 0.38, 0x121b18, 600, 16, 7500);

    // Sương mù đầm lầy phía Đông (tiếp giáp Silent Mire tại x ~ 2880)
    addFog(2860, 280, 0.90, 0.95, 0.42, 0x111a17, 605, 14, 6600);
  }

`;

const markerDetectCurrentZone = '  public detectCurrentZone(pos: Point2D): ZoneId {';
const idxMarker = content.indexOf(markerDetectCurrentZone);
if (idxMarker === -1) {
  console.error('Could not find detectCurrentZone marker!');
  process.exit(1);
}

content = content.substring(0, idxMarker) + newMethods + content.substring(idxMarker);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated WorldBuilder.ts for C4-12-21!');
