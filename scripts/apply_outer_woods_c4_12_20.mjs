import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/world/WorldBuilder.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Thay thế renderOuterWoodsTerrain
const oldTerrainStart = '  private renderOuterWoodsTerrain(bounds: { x: number; y: number; width: number; height: number }): void {';
const oldTerrainEnd = '    groundImg.setDepth(-98);\n  }';

const newTerrainCode = `  private renderOuterWoodsTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'outer_woods_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 480 (x: 1120..1600)
      const H = bounds.height; // 480 (y: 560..1040)
      const ox = bounds.x;     // 1120
      const oy = bounds.y;     // 560

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 614259;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. Nền cỏ rừng lá kim tối màu
        ctx.fillStyle = '#202f1d';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Bóng tối rừng sâu sẫm màu ở phía Đông (wx > 1440) và phía Nam (wy > 960)
        const eastForestShade = ctx.createLinearGradient(toLX(1440), 0, W, 0);
        eastForestShade.addColorStop(0, 'rgba(10, 16, 12, 0)');
        eastForestShade.addColorStop(0.5, 'rgba(10, 16, 12, 0.45)');
        eastForestShade.addColorStop(1, 'rgba(10, 16, 12, 0.88)');
        ctx.fillStyle = eastForestShade;
        ctx.fillRect(toLX(1440), 0, W - toLX(1440), H);

        const southForestShade = ctx.createLinearGradient(0, toLY(960), 0, H);
        southForestShade.addColorStop(0, 'rgba(10, 16, 12, 0)');
        southForestShade.addColorStop(1, 'rgba(10, 16, 12, 0.85)');
        ctx.fillStyle = southForestShade;
        ctx.fillRect(0, toLY(960), W, H - toLY(960));

        // Rải rác đốm rêu rừng và mùn lá kim sẫm màu
        const woodsMossPalette = ['#1a2918', '#253920', '#2d4428', '#1c2618', '#3b2c1b', '#2e2215'];
        for (let i = 0; i < 900; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 4 + Math.floor(nextRand() * 8);
          const ph = 3 + Math.floor(nextRand() * 5);
          ctx.fillStyle = woodsMossPalette[Math.floor(nextRand() * woodsMossPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // C4-12-20: Các khoảng rừng thưa tự nhiên (Forest Clearings)
        // 1.1. Bãi Cửa Rừng phía Bắc (North Entrance Clearing: quanh wx 1210, wy 620)
        const northLX = toLX(1210);
        const northLY = toLY(620);
        ctx.fillStyle = '#324426';
        ctx.beginPath();
        ctx.ellipse(northLX, northLY, 44, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1.2. Bãi Đất Trại Thợ Săn (Hunter's Camp Clearing: quanh wx 1330, wy 730)
        const campLX = toLX(1330);
        const campLY = toLY(730);
        ctx.fillStyle = '#423220';
        ctx.beginPath();
        ctx.ellipse(campLX, campLY, 48, 34, 0, 0, Math.PI * 2);
        ctx.fill();

        // Đống tro tàn và vòng đá lửa trại
        ctx.fillStyle = '#1c1c1c';
        ctx.beginPath();
        ctx.ellipse(campLX, campLY, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Viền đá cuội quanh bếp lửa
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
          const rx = campLX + Math.cos(a) * 15;
          const ry = campLY + Math.sin(a) * 11;
          ctx.fillStyle = '#414a4e';
          ctx.fillRect(Math.round(rx - 2), Math.round(ry - 2), 5, 4);
        }

        // Than hồng âm ỉ
        ctx.fillStyle = '#d35400';
        ctx.fillRect(campLX - 4, campLY - 2, 8, 4);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(campLX - 2, campLY - 1, 4, 2);

        // 1.3. Bãi Suối Rừng Phía Đông (East Brook Clearing: quanh wx 1460, wy 810)
        const brookClearLX = toLX(1460);
        const brookClearLY = toLY(810);
        ctx.fillStyle = '#26382e';
        ctx.beginPath();
        ctx.ellipse(brookClearLX, brookClearLY, 42, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1.4. Bãi Liễu Cổ Thụ Bí Ẩn Phía Nam (South Willow Clearing: quanh wx 1260, wy 920)
        const willowLX = toLX(1260);
        const willowLY = toLY(920);
        ctx.fillStyle = '#2a3d22';
        ctx.beginPath();
        ctx.ellipse(willowLX, willowLY, 54, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#344e2b';
        ctx.beginPath();
        ctx.ellipse(willowLX, willowLY, 38, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hoa dại tím và vàng mọc rải rác quanh bãi liễu
        const flowerPalette = ['#9b59b6', '#f1c40f', '#aed581', '#e082ba'];
        for (let f = 0; f < 35; f++) {
          const fx = willowLX + (nextRand() - 0.5) * 80;
          const fy = willowLY + (nextRand() - 0.5) * 60;
          ctx.fillStyle = flowerPalette[Math.floor(nextRand() * flowerPalette.length)];
          ctx.fillRect(Math.round(fx), Math.round(fy), 3, 3);
        }

        // 2. Mạng lưới đường mòn đất rừng tự nhiên & lối rẽ phụ
        const drawWoodsPath = (points: Array<{ x: number; y: number; r: number }>) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.06 + wy * 0.05) * 2;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Rìa cỏ dập
          ctx.fillStyle = '#323220';
          for (const sp of samples) {
            const rOut = sp.r + 5;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.8), rOut * 2, Math.round(rOut * 1.6));
          }
          // Lớp 2: Đất nâu rừng
          ctx.fillStyle = '#5c452e';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.8), sp.r * 2, Math.round(sp.r * 1.6));
          }
          // Lớp 3: Lối mòn mòn vẹt
          ctx.fillStyle = '#705439';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(3, Math.round(sp.r * 0.5));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }
        };

        // Tuyến đường chính: Từ Cổng Làng Bellhollow (1210, 560) qua Bãi Cửa Rừng xuống Ngã Ba Trại Thợ Săn (1270, 740)
        drawWoodsPath([
          { x: 1210, y: 560, r: 20 },
          { x: 1235, y: 620, r: 20 },
          { x: 1255, y: 680, r: 21 },
          { x: 1270, y: 740, r: 22 }
        ]);

        // Nhánh liên thông từ Nông Trại Trú Ẩn (1120, 740) sang Ngã Ba Trại (1270, 740) và vào Bãi Trại (1330, 730)
        drawWoodsPath([
          { x: 1120, y: 740, r: 22 },
          { x: 1200, y: 745, r: 21 },
          { x: 1270, y: 740, r: 22 },
          { x: 1330, y: 730, r: 24 }
        ]);

        // Nhánh rẽ chính tiếp nối từ Bãi Trại về phía Bãi Suối Rừng Đông-Nam (1330 -> 1460, 810)
        drawWoodsPath([
          { x: 1330, y: 730, r: 24 },
          { x: 1390, y: 760, r: 20 },
          { x: 1460, y: 810, r: 19 }
        ]);

        // C4-12-20: Nhánh rẽ phụ khám phá tiếp nối về phía Đông tiếp giáp biên giới Đường Mòn Quanh Co
        drawWoodsPath([
          { x: 1460, y: 810, r: 19 },
          { x: 1510, y: 795, r: 17 },
          { x: 1555, y: 780, r: 16 }
        ]);

        // C4-12-20: Nhánh rẽ phụ uốn lượn xuống Bãi Liễu Cổ Thụ Bí Ẩn Phía Nam (1270, 740 -> 1260, 920)
        drawWoodsPath([
          { x: 1270, y: 740, r: 21 },
          { x: 1265, y: 820, r: 18 },
          { x: 1260, y: 910, r: 22 }
        ]);

        // 3. Con suối nhỏ / lạch nước rừng ven phía Đông (wx: 1445..1480, wy: 780..960)
        const brookLX = toLX(1460);
        ctx.fillStyle = '#15222c';
        for (let by = toLY(780); by < toLY(960); by += 8) {
          const wobble = Math.sin(by * 0.08) * 7;
          ctx.fillRect(brookLX + wobble - 9, by, 18, 8);
          ctx.fillStyle = '#203442';
          ctx.fillRect(brookLX + wobble - 5, by + 2, 10, 4);
          ctx.fillStyle = '#2d4a5d';
          ctx.fillRect(brookLX + wobble - 2, by + 3, 4, 2);
        }

        // Bờ đá cuội và đá bước qua suối (Stepping Stones) tại wy ~ 845
        for (let si = 0; si < 3; si++) {
          const sx = brookLX - 6 + si * 5;
          const sy = toLY(840 + si * 8);
          ctx.fillStyle = '#485250';
          ctx.fillRect(sx, sy, 8, 6);
          ctx.fillStyle = '#6f7a78';
          ctx.fillRect(sx + 1, sy + 1, 6, 3);
        }

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }`;

const idxTerrainStart = content.indexOf(oldTerrainStart);
const idxTerrainEnd = content.indexOf(oldTerrainEnd, idxTerrainStart);

if (idxTerrainStart === -1 || idxTerrainEnd === -1) {
  console.error('Could not find renderOuterWoodsTerrain block!');
  process.exit(1);
}

content = content.substring(0, idxTerrainStart) + newTerrainCode + content.substring(idxTerrainEnd + oldTerrainEnd.length);
console.log('Successfully replaced renderOuterWoodsTerrain!');

// 2. Thay thế renderOuterWoodsDecorations
const oldDecorStart = '  private renderOuterWoodsDecorations(_zone: ZoneData): void {';
const oldDecorEnd = '    this.createRock(1450, 840, 36, 22);\n  }';

const newDecorCode = `  /**
   * C4-12-20: Xây dựng bản đồ môi trường chi tiết cho Rừng Ngoại Vi (Outer Woods).
   * Không gian khám phá mở với 4 khoảng rừng thưa (Cửa rừng Bắc, Bãi trại thợ săn, Bãi suối rừng, Bãi liễu cổ thụ),
   * đường mòn uốn lượn có tuyến chính và lối rẽ phụ tiếp cận nguồn tài nguyên đầu game (gỗ khô, đá lửa, nhựa cây, thảo mộc),
   * các cụm cây cổ thụ, thân cây đổ có nấm mọc, bụi rậm, đá tảng và lớp sương mù ranh giới nhẹ nhàng.
   */
  private renderOuterWoodsDecorations(_zone: ZoneData): void {

    // 1. Biển Chỉ Dẫn Mộc Mạc tại cửa rừng phía Bắc (1220, 640)
    this.createStoneSign(1220, 640, 'RỪNG NGOẠI VI');

    // 2. Bãi Trại Thợ Săn (Hunter's Camp: 1320..1360, 700..740)
    this.createHunterCampfire(1320, 720);
    this.createHunterLeanToShelter(1350, 690);
    this.createHunterPeltRack(1285, 730);
    this.createVillagePropCluster(1385, 725, 'firewood');
    this.createVillagePropCluster(1275, 710, 'barrels');

    // 3. Hệ thống Cột Đèn Lồng Gỗ Dẫn Hướng
    this.createVillageLanternPost(1210, 600); // Đèn cửa rừng Bắc
    this.createVillageLanternPost(1310, 700); // Đèn bãi trại
    this.createVillageLanternPost(1390, 755); // Đèn ngã rẽ suối rừng
    this.createVillageLanternPost(1270, 825); // Đèn lối rẽ Bãi Liễu

    // 4. Thân Cây Cổ Thụ Đổ (Fallen Logs)
    this.createFallenLog(1190, 670, 48, 12);  // Gần bãi cửa rừng
    this.createFallenLog(1475, 795, 54, -20); // Ven suối rừng
    this.createFallenLog(1220, 955, 62, 8);   // Bãi Liễu cổ thụ phía Nam

    // 5. Cây Rỗng Rừng Ven (Hollow Trees)
    this.createHollowTree(1360, 620, 'Cây Rỗng Rừng Ven');
    this.createHollowTree(1320, 910, 'Cây Rỗng Bãi Liễu');

    // 6. Quần thể Cây Sồi & Thông Cổ Thụ bao quanh viền tự nhiên
    // Phía Bắc (giáp Bellhollow): chừa lối đi 1150..1270
    this.createTree(1140, 585, 'Cây Bìa Bắc Rừng Ven');
    this.createTree(1280, 585, 'Cây Bìa Bắc Rừng Ven');
    this.createTree(1170, 630, 'Cây Thông Ven Làng');
    this.createTree(1450, 650, 'Cây Cổ Thụ Rừng Ven');

    // Phía Tây (giáp Sanctuary Farm): chừa lối mòn 1120, 680..820
    this.createTree(1130, 620, 'Cây Bìa Tây Rừng Ven');
    this.createTree(1135, 870, 'Cây Bìa Tây Rừng Ven');

    // Bãi Liễu Cổ Thụ phía Nam (1260, 890)
    this.createTree(1260, 890, 'Cây Liễu Đại Ngàn Phía Nam');
    this.createTree(1200, 985, 'Cây Cổ Thụ Viền Nam');
    this.createTree(1340, 990, 'Cây Cổ Thụ Viền Nam');
    this.createTree(1460, 985, 'Cây Cổ Thụ Viền Nam');
    this.createTree(1540, 980, 'Cây Cổ Thụ Viền Nam');

    // Phía Đông (giáp biên giới Đường Mòn Quanh Co)
    this.createTree(1530, 630, 'Cây Cổ Thụ Viền Đông');
    this.createTree(1540, 730, 'Cây Cổ Thụ Viền Đông');
    this.createTree(1550, 850, 'Cây Cổ Thụ Viền Đông');

    // Cây bóng mát giữa các khoảng rừng thưa
    this.createTree(1230, 830, 'Cây Sồi Ven Rừng');
    this.createTree(1370, 860, 'Cây Sồi Rừng Ven');
    this.createTree(1490, 880, 'Cây Sồi Ven Suối');

    // 7. Bụi Rậm & Đá Tảng Bờ Suối
    this.createDenseBush(1180, 760);
    this.createDenseBush(1235, 780);
    this.createDenseBush(1350, 780);
    this.createDenseBush(1400, 890);
    this.createDenseBush(1480, 730);
    this.createDenseBush(1510, 830);
    this.createDenseBush(1280, 970);

    this.createRock(1410, 750, 38, 22);
    this.createRock(1450, 840, 32, 18);
    this.createRock(1490, 920, 30, 16);

    // 8. Sương Mù Ranh Giới Nhẹ Nhàng (Boundary Mist)
    this.createOuterWoodsBoundaryFog();
  }`;

const idxDecorStart = content.indexOf(oldDecorStart);
const idxDecorEnd = content.indexOf(oldDecorEnd, idxDecorStart);

if (idxDecorStart === -1 || idxDecorEnd === -1) {
  console.error('Could not find renderOuterWoodsDecorations block!');
  process.exit(1);
}

content = content.substring(0, idxDecorStart) + newDecorCode + content.substring(idxDecorEnd + oldDecorEnd.length);
console.log('Successfully replaced renderOuterWoodsDecorations!');

// 3. Thêm các hàm helper createHunterLeanToShelter, createHunterPeltRack, createFallenLog, createOuterWoodsBoundaryFog
const helperMethods = `  /**
   * C4-12-20: Tạo Lều Bạt Dã Ngoại Thợ Săn (Hunter Lean-To Shelter).
   * Khung gỗ cọc chéo, phủ bạt thô màu xám-lục sẫm, đệm rơm rạ và đèn lồng ấm.
   */
  private createHunterLeanToShelter(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ dưới lều
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRoundedRect(x - 4, y + 8, 38, 16, 4);

    // Đệm rơm lót sàn lều
    g.fillStyle(0xb58931, 0.85);
    g.fillRect(x + 2, y + 6, 26, 8);
    g.fillStyle(0x8a631c, 0.7);
    g.fillRect(x + 4, y + 7, 22, 6);

    // 2 Cọc gỗ chống xiên
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 2, y - 14, 4, 26);
    g.fillRect(x + 28, y - 14, 4, 26);

    // Mái bạt thô dốc nghiêng phủ rêu mốc
    g.fillStyle(0x2d3a33, 1);
    g.fillRect(x - 4, y - 16, 38, 6);
    g.fillStyle(0x3e4e45, 1);
    g.fillRect(x - 2, y - 19, 34, 5);
    g.fillStyle(0x4a5d52, 1);
    g.fillRect(x, y - 21, 30, 4);

    // Nếp gấp dây chằng và viền bạt
    g.fillStyle(0x1a241f, 1);
    g.fillRect(x - 2, y - 12, 34, 2);

    g.setDepth(y + 12);

    const body = this.colliderGroup.create(x + 15, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -6);
  }

  /**
   * C4-12-20: Tạo Giá Phơi Da Thú & Thảo Mộc (Hunter Pelt & Herb Rack).
   */
  private createHunterPeltRack(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 10, y + 14, 20, 6);

    // Khung chữ A gỗ sồi
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x, y - 10, 3, 24);
    g.fillRect(x + 16, y - 10, 3, 24);
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x - 2, y - 6, 23, 3);
    g.fillRect(x - 2, y + 4, 23, 3);

    // Tấm da thú căng dây phơi
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x + 3, y - 3, 13, 10);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(x + 5, y - 1, 9, 6);

    // Bó cỏ thơm treo một bên
    g.fillStyle(0x7cb342, 1);
    g.fillRect(x + 17, y - 4, 3, 8);

    g.setDepth(y + 10);
  }

  /**
   * C4-12-20: Tạo Thân Cây Cổ Thụ Đổ (Fallen Log) phủ rêu và nấm rừng.
   */
  private createFallenLog(x: number, y: number, length: number = 50, angleDeg: number = 0): void {
    const g = this.scene.add.graphics();
    g.save();
    g.translateCanvas(x, y);
    if (angleDeg !== 0) {
      g.rotateCanvas((angleDeg * Math.PI) / 180);
    }

    // Bóng đổ của thân cây
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRoundedRect(-length / 2, 4, length, 12, 4);

    // Vỏ thân cây gỗ sẫm màu
    g.fillStyle(0x382415, 1);
    g.fillRoundedRect(-length / 2, -5, length, 11, 3);
    g.fillStyle(0x4a3220, 1);
    g.fillRect(-length / 2 + 3, -4, length - 6, 5);

    // Lớp rêu nhung xanh mướt trên lưng thân cây
    g.fillStyle(0x388e3c, 0.9);
    g.fillRect(-length / 2 + 5, -6, length * 0.45, 3);
    g.fillStyle(0x66bb6a, 0.85);
    g.fillRect(-length / 2 + 8, -5, length * 0.35, 2);

    // Cụm nấm sò / nấm mộc nhĩ vàng cam mọc bên sườn cây
    g.fillStyle(0xffb74d, 1);
    g.fillRect(-length / 2 + 18, 3, 5, 3);
    g.fillRect(-length / 2 + 25, 4, 6, 3);
    g.fillStyle(0xfff3e0, 1);
    g.fillRect(-length / 2 + 19, 3, 3, 1);

    g.restore();
    g.setDepth(y + 4);

    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(Math.round(length * 0.8), 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-Math.round(length * 0.4), -5);
  }

  /**
   * C4-12-20: Hiệu ứng sương mù khí quyển nhẹ nhàng bao quanh viền Rừng Ngoại Vi (Outer Woods).
   * Giữ 4 khoảng rừng thưa và các điểm mốc định hướng (trại thợ săn, biển chỉ dẫn, lối mòn) hoàn toàn rõ ràng.
   */
  private createOuterWoodsBoundaryFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addMist = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      depth: number,
      driftX: number = 18,
      duration: number = 7500
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
          alpha: Math.max(0.06, alpha - 0.05),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // 1. Dải sương mù nhẹ nhàng dọc ranh giới phía Đông (tiếp giáp vùng rừng sâu hiểm trở x: 1540..1590)
    addMist(1560, 640, 0.85, 0.90, 0.22, 0x24352e, 600, 14, 7200);
    addMist(1570, 790, 0.90, 0.95, 0.26, 0x1d2c26, 605, 16, 7800);
    addMist(1560, 940, 0.85, 0.90, 0.24, 0x1a2621, 600, 15, 8200);

    // 2. Dải sương mù viền phía Nam (chân rặng núi đá & cây cổ thụ y: 990..1030)
    addMist(1200, 1010, 1.10, 0.65, 0.24, 0x283832, 600, 18, 7600);
    addMist(1380, 1015, 1.15, 0.65, 0.26, 0x22302b, 600, 20, 8000);
    addMist(1500, 1010, 1.05, 0.65, 0.28, 0x1c2823, 600, 16, 7400);

    // 3. Sương mù mỏng nhẹ phảng phất bên lạch nước rừng phía Đông
    addMist(1470, 870, 0.70, 0.75, 0.18, 0x364843, 595, 12, 6800);
  }

`;

const markerDetectCurrentZone = '  public detectCurrentZone(pos: Point2D): ZoneId {';
const idxMarker = content.indexOf(markerDetectCurrentZone);
if (idxMarker === -1) {
  console.error('Could not find detectCurrentZone marker!');
  process.exit(1);
}

content = content.substring(0, idxMarker) + helperMethods + content.substring(idxMarker);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated WorldBuilder.ts for C4-12-20!');
