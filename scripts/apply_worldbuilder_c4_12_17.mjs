import fs from 'fs';

const filePath = 'src/world/WorldBuilder.ts';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update renderZoneTerrain branches
const target1 = `    // 1. Nền mặt đất cơ bản cho từng phân khu
    if (id === 'fog_crossing') {
      this.renderFogCrossingTerrain(bounds);
    } else if (id === 'bellhollow') {
      this.renderBellhollowTerrain(bounds);
    } else if (id === 'crooked_path') {
      this.renderCrookedPathTerrain(bounds);
    } else if (id === 'silent_mire') {
      this.renderSilentMireTerrain(bounds);
    } else if (id === 'broken_bell_shrine') {
      this.renderBrokenBellShrineTerrain(bounds);
    }`;

const replace1 = `    // 1. Nền mặt đất cơ bản cho từng phân khu
    if (id === 'fog_crossing') {
      this.renderFogCrossingTerrain(bounds);
    } else if (id === 'bellhollow') {
      this.renderBellhollowTerrain(bounds);
    } else if (id === 'sanctuary_farm') {
      this.renderSanctuaryFarmTerrain(bounds);
    } else if (id === 'outer_woods') {
      this.renderOuterWoodsTerrain(bounds);
    } else if (id === 'crooked_path') {
      this.renderCrookedPathTerrain(bounds);
    } else if (id === 'silent_mire') {
      this.renderSilentMireTerrain(bounds);
    } else if (id === 'broken_bell_shrine') {
      this.renderBrokenBellShrineTerrain(bounds);
    }`;

if (!code.includes(target1)) {
  throw new Error('Target 1 not found in WorldBuilder.ts');
}
code = code.replace(target1, replace1);

// 2. Insert renderSanctuaryFarmTerrain and renderOuterWoodsTerrain
const target2 = `          ctx.fillStyle = '#1e3019';
          ctx.fillRect(lx - 1, ly, 3, 2);
          ctx.fillStyle = flowerColors[Math.floor(nextRand() * flowerColors.length)];
          ctx.fillRect(lx, ly - 1, 2, 2);
        }

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-12: Dựng bề mặt địa hình, nền rừng sậm màu`;

const terrainMethods = `          ctx.fillStyle = '#1e3019';
          ctx.fillRect(lx - 1, ly, 3, 2);
          ctx.fillStyle = flowerColors[Math.floor(nextRand() * flowerColors.length)];
          ctx.fillRect(lx, ly - 1, 2, 2);
        }

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-17: Dựng bề mặt địa hình Nông Trại Trú Ẩn (Sanctuary Farm) trên 1 CanvasTexture duy nhất (sanctuary_farm_ground_baked_v12).
   * Khớp nối hoàn toàn với Lối Nam Bellhollow tại (650, 560) và lối sang Rừng Ngoại Vi tại (1120, 740).
   * Bao gồm thảm cỏ đồng quê ấm áp, 2 thửa ruộng thảo mộc cày luống màu mỡ, ao tưới nước tự nhiên và mạng lưới đường đất rộng rãi.
   */
  private renderSanctuaryFarmTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'sanctuary_farm_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 640 (x: 480..1120)
      const H = bounds.height; // 480 (y: 560..1040)
      const ox = bounds.x;     // 480
      const oy = bounds.y;     // 560

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 823417;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. Nền thảm cỏ đồng quê màu nâu rêu sậm
        ctx.fillStyle = '#2b3c23';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.28;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Quầng sáng đồng cỏ ấm áp ở trung tâm nông trại
        const farmWarmth = ctx.createRadialGradient(
          toLX(720), toLY(750), 40,
          toLX(720), toLY(750), 380
        );
        farmWarmth.addColorStop(0, 'rgba(78, 102, 54, 0.40)');
        farmWarmth.addColorStop(0.65, 'rgba(52, 74, 40, 0.22)');
        farmWarmth.addColorStop(1, 'rgba(16, 26, 16, 0.65)');
        ctx.fillStyle = farmWarmth;
        ctx.fillRect(0, 0, W, H);

        // Bóng râm thảm thực vật rìa Tây (wx < 530) và rìa Nam (wy > 980)
        const westShade = ctx.createLinearGradient(0, 0, toLX(530), 0);
        westShade.addColorStop(0, 'rgba(12, 18, 14, 0.78)');
        westShade.addColorStop(1, 'rgba(12, 18, 14, 0)');
        ctx.fillStyle = westShade;
        ctx.fillRect(0, 0, toLX(530), H);

        const southShade = ctx.createLinearGradient(0, toLY(980), 0, H);
        southShade.addColorStop(0, 'rgba(12, 18, 14, 0)');
        southShade.addColorStop(1, 'rgba(12, 18, 14, 0.85)');
        ctx.fillStyle = southShade;
        ctx.fillRect(0, toLY(980), W, H - toLY(980));

        // Rải rác đốm rêu và cỏ dại nông trại
        const farmMossPalette = ['#24351f', '#32482a', '#3c5532', '#48633c'];
        for (let i = 0; i < 900; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 3 + Math.floor(nextRand() * 9);
          const ph = 3 + Math.floor(nextRand() * 6);
          ctx.fillStyle = farmMossPalette[Math.floor(nextRand() * farmMossPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // 2. Mạng lưới đường mòn đất nông trại
        const drawFarmPath = (points: Array<{ x: number; y: number; r: number }>) => {
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
              const wobble = Math.sin(wx * 0.05 + wy * 0.04) * 2;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Viền đất ẩm cỏ dập
          ctx.fillStyle = '#3a3a28';
          for (const sp of samples) {
            const rOut = sp.r + 5;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.8), rOut * 2, Math.round(rOut * 1.6));
          }
          // Lớp 2: Lòng đường đất nâu ấm
          ctx.fillStyle = '#654c35';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.8), sp.r * 2, Math.round(sp.r * 1.6));
          }
          // Lớp 3: Vệt lối mòn sáng
          ctx.fillStyle = '#7a5d43';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(3, Math.round(sp.r * 0.5));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }
          // Lớp 4: Sỏi rải rác
          for (let i = 0; i < samples.length; i += 4) {
            const sp = samples[i];
            const sx = sp.lx + Math.round((nextRand() - 0.5) * sp.r * 1.5);
            const sy = sp.ly + Math.round((nextRand() - 0.5) * sp.r * 1.2);
            ctx.fillStyle = nextRand() > 0.5 ? '#8e775a' : '#453323';
            ctx.fillRect(sx, sy, 2, 2);
          }
        };

        // Đường Lối Bắc nối từ Cổng Nam Bellhollow (650, 560) xuống ngã ba nông trại (650, 740)
        drawFarmPath([
          { x: 650, y: 560, r: 20 },
          { x: 650, y: 620, r: 21 },
          { x: 645, y: 680, r: 22 },
          { x: 650, y: 740, r: 24 }
        ]);

        // Đường trục Đông-Tây nối từ Khu Nhà Kho (540, 740) qua Ngã Ba sang Rừng Ngoại Vi (1120, 740)
        drawFarmPath([
          { x: 535, y: 740, r: 18 },
          { x: 650, y: 740, r: 24 },
          { x: 770, y: 745, r: 20 },
          { x: 910, y: 740, r: 21 },
          { x: 1030, y: 745, r: 22 },
          { x: 1120, y: 740, r: 22 }
        ]);

        // Đường dẫn Nam đi giữa 2 khu ruộng canh tác
        drawFarmPath([
          { x: 650, y: 740, r: 22 },
          { x: 650, y: 820, r: 18 },
          { x: 655, y: 900, r: 18 },
          { x: 650, y: 970, r: 19 }
        ]);

        // 3. Hai thửa ruộng canh tác lớn (Furrowed Soil Crop Fields - theo layout concept)
        const drawTilledField = (fx: number, fy: number, fw: number, fh: number, seedColor: string) => {
          const lfx = toLX(fx);
          const lfy = toLY(fy);
          // Nền đất mùn hữu cơ sẫm màu
          ctx.fillStyle = '#342315';
          ctx.fillRect(lfx, lfy, fw, fh);
          // Viền bờ đất xới
          ctx.strokeStyle = '#23170d';
          ctx.lineWidth = 3;
          ctx.strokeRect(lfx, lfy, fw, fh);

          // Các luống đất xới ngang đều đặn với vệt rãnh và gờ đất
          const furrowH = 14;
          for (let y = lfy + 4; y < lfy + fh - 4; y += furrowH) {
            // Rãnh tối
            ctx.fillStyle = '#20150c';
            ctx.fillRect(lfx + 3, y, fw - 6, 4);
            // Gờ đất sáng
            ctx.fillStyle = '#48331e';
            ctx.fillRect(lfx + 3, y + 4, fw - 6, 6);
            // Vệt đất xốp
            ctx.fillStyle = '#5a3f27';
            ctx.fillRect(lfx + 5, y + 6, fw - 10, 2);

            // Mầm cây / luống thảo dược nhô lên đều đặn
            for (let x = lfx + 8; x < lfx + fw - 8; x += 16) {
              const sproutX = x + Math.floor((nextRand() - 0.5) * 4);
              ctx.fillStyle = seedColor;
              ctx.fillRect(sproutX, y + 3, 3, 3);
              ctx.fillStyle = '#78b857';
              ctx.fillRect(sproutX + 1, y + 2, 2, 2);
            }
          }
        };

        // Ruộng Tây (Thảo mộc xanh):
        drawTilledField(520, 800, 95, 160, '#4e8238');
        // Ruộng Đông (Thảo mộc hoa vàng/tím):
        drawTilledField(705, 800, 185, 160, '#5a8f42');

        // 4. Hồ Nước Tưới Tiêu / Ao Nông Trại Tự Nhiên (Irrigation Pond: wx 930..1020, wy 705..785)
        const pondLX = toLX(975);
        const pondLY = toLY(745);
        const prx = 44;
        const pry = 32;

        // Bờ đất sỏi quanh ao
        ctx.fillStyle = '#35271d';
        ctx.beginPath();
        ctx.ellipse(pondLX, pondLY, prx + 8, pry + 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Viền đá cuội quanh bờ ao
        for (let a = 0; a < Math.PI * 2; a += 0.35) {
          const bx = pondLX + Math.cos(a) * (prx + 5);
          const by = pondLY + Math.sin(a) * (pry + 4);
          ctx.fillStyle = nextRand() > 0.5 ? '#485257' : '#333b40';
          ctx.fillRect(Math.round(bx - 3), Math.round(by - 2), 6, 5);
        }

        // Lòng nước ao sâu màu xanh rêu
        const pondGrad = ctx.createRadialGradient(pondLX, pondLY, 6, pondLX, pondLY, prx);
        pondGrad.addColorStop(0, '#264858');
        pondGrad.addColorStop(0.7, '#1b323e');
        pondGrad.addColorStop(1, '#132129');
        ctx.fillStyle = pondGrad;
        ctx.beginPath();
        ctx.ellipse(pondLX, pondLY, prx, pry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vài cụm bèo tây / hoa súng trên mặt ao
        ctx.fillStyle = '#3b6e45';
        ctx.fillRect(pondLX - 16, pondLY - 8, 8, 5);
        ctx.fillRect(pondLX + 12, pondLY + 4, 7, 5);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(pondLX - 13, pondLY - 7, 2, 2);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-17: Dựng bề mặt địa hình Rừng Ngoại Vi (Outer Woods) trên 1 CanvasTexture duy nhất (outer_woods_ground_baked_v12).
   * Khớp nối hoàn hảo với Lối Đông-Nam Bellhollow tại (1210, 560) và Lối Tây từ Nông Trại tại (1120, 740).
   * Bao gồm thảm lá kim tối màu, rêu rừng ẩm, bãi trại thợ săn và đường mòn đất uốn lượn tự nhiên.
   */
  private renderOuterWoodsTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
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
        const woodsMossPalette = ['#1a2918', '#253920', '#2d4428', '#1c2618'];
        for (let i = 0; i < 750; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 4 + Math.floor(nextRand() * 8);
          const ph = 3 + Math.floor(nextRand() * 5);
          ctx.fillStyle = woodsMossPalette[Math.floor(nextRand() * woodsMossPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // 2. Mạng lưới đường mòn đất rừng ngoại vi
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

        // Đường mòn từ Lối Đông-Nam Bellhollow (1210, 560) xuống ngã ba rừng ven (1270, 740)
        drawWoodsPath([
          { x: 1210, y: 560, r: 20 },
          { x: 1235, y: 620, r: 20 },
          { x: 1255, y: 680, r: 21 },
          { x: 1270, y: 740, r: 22 }
        ]);

        // Đường mòn liên thông từ Nông Trại Trú Ẩn (1120, 740) vào bãi trại thợ săn (1330, 730)
        drawWoodsPath([
          { x: 1120, y: 740, r: 22 },
          { x: 1200, y: 745, r: 21 },
          { x: 1270, y: 740, r: 22 },
          { x: 1330, y: 730, r: 24 }
        ]);

        // Đường mòn khám phá tiếp nối về phía Đông-Nam (1330 -> 1460, 810)
        drawWoodsPath([
          { x: 1330, y: 730, r: 24 },
          { x: 1390, y: 760, r: 19 },
          { x: 1460, y: 810, r: 18 }
        ]);

        // 3. Bãi đất trại thợ săn (Hunter's Camp Clearing quanh wx 1330, wy 730)
        const campLX = toLX(1330);
        const campLY = toLY(730);
        ctx.fillStyle = '#423220';
        ctx.beginPath();
        ctx.ellipse(campLX, campLY, 36, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        // Đống tro tàn và vòng đá lửa trại
        ctx.fillStyle = '#1c1c1c';
        ctx.beginPath();
        ctx.ellipse(campLX, campLY, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Viền đá cuội quanh bếp lửa
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
          const rx = campLX + Math.cos(a) * 14;
          const ry = campLY + Math.sin(a) * 10;
          ctx.fillStyle = '#414a4e';
          ctx.fillRect(Math.round(rx - 2), Math.round(ry - 2), 5, 4);
        }

        // Than hồng âm ỉ
        ctx.fillStyle = '#d35400';
        ctx.fillRect(campLX - 3, campLY - 2, 6, 4);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(campLX - 1, campLY - 1, 3, 2);

        // 4. Con suối nhỏ / lạch nước rừng ven phía Đông (wx: 1435..1475, wy: 830..930)
        const brookLX = toLX(1455);
        ctx.fillStyle = '#182530';
        for (let by = toLY(830); by < toLY(930); by += 8) {
          const wobble = Math.sin(by * 0.08) * 6;
          ctx.fillRect(brookLX + wobble - 8, by, 16, 8);
          ctx.fillStyle = '#223847';
          ctx.fillRect(brookLX + wobble - 4, by + 2, 8, 4);
        }

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-12: Dựng bề mặt địa hình, nền rừng sậm màu`;

if (!code.includes(target2)) {
  throw new Error('Target 2 not found in WorldBuilder.ts');
}
code = code.replace(target2, terrainMethods);

// 3. Update renderDecorations branches
const target3 = `      // 12. C4-12-18A (Mục 2F): Sương mù khí quyển đa tầng ven bìa rừng & dày đặc dần về phía Cổng Đông
      this.createBellhollowBoundaryFog();
    } else if (id === 'crooked_path') {`;

const replace3 = `      // 12. C4-12-18A (Mục 2F): Sương mù khí quyển đa tầng ven bìa rừng & dày đặc dần về phía Cổng Đông
      this.createBellhollowBoundaryFog();
    } else if (id === 'sanctuary_farm') {
      this.renderSanctuaryFarmDecorations(zone);
    } else if (id === 'outer_woods') {
      this.renderOuterWoodsDecorations(zone);
    } else if (id === 'crooked_path') {`;

if (!code.includes(target3)) {
  throw new Error('Target 3 not found in WorldBuilder.ts');
}
code = code.replace(target3, replace3);

// 4. Update createVillageFence to skip south fence at gate openings and add gateposts
const target4 = `    // 5. Hàng rào ranh giới Bắc (y = 26) & Nam (y = 532) của ngôi làng trong tầm nhìn camera
    for (let fx = 490; fx < 1540; fx += 92) {
      addFenceSegment(fx, 26, false);
      addFenceSegment(fx, 532, false);
    }
  }`;

const replace4 = `    // 5. Hàng rào ranh giới Bắc (y = 26) & Nam (y = 532) của ngôi làng trong tầm nhìn camera
    for (let fx = 490; fx < 1540; fx += 92) {
      addFenceSegment(fx, 26, false);
      // C4-12-17: Chừa lối đi thông thoáng cho Lối Nam Nông Trại (610..710) và Lối Đông-Nam Rừng Ngoại Vi (1150..1270)
      const inFarmGate = fx >= 580 && fx <= 710;
      const inOuterWoodsGate = fx >= 1150 && fx <= 1270;
      if (!inFarmGate && !inOuterWoodsGate) {
        addFenceSegment(fx, 532, false);
      }
    }

    // Cổng gỗ & trụ đèn dẫn hướng tại 2 lối ra Vùng Lõi
    this.createVillageLanternPost(606, 532);
    this.createVillageLanternPost(714, 532);
    this.createVillageLanternPost(1146, 532);
    this.createVillageLanternPost(1274, 532);
  }`;

if (!code.includes(target4)) {
  throw new Error('Target 4 not found in WorldBuilder.ts');
}
code = code.replace(target4, replace4);

// 5. Add decoration methods and helper structures before the end of the class
const target5 = `  public detectCurrentZone(pos: Point2D): ZoneId {`;

const decorationMethods = `  /**
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
  }

  /**
   * C4-12-17: Bố trí lều trại thợ săn, bếp lửa, đống củi, biển chỉ dẫn và quần thể thông rừng ven cho Outer Woods.
   */
  private renderOuterWoodsDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Bếp lửa trại thợ săn tại bãi đất trống (1320, 720)
    this.createHunterCampfire(1320, 720);

    // 2. Biển chỉ dẫn mộc mạc tại lối vào rừng ven (1220, 640)
    this.createStoneSign(1220, 640, 'RỪNG NGOẠI VI');

    // 3. Đống củi và thùng gỗ dã ngoại của thợ săn
    this.createVillagePropCluster(1370, 710, 'firewood');
    this.createVillagePropCluster(1275, 710, 'barrels');

    // 4. Đèn lồng treo tại cửa rừng và bãi trại
    this.createVillageLanternPost(1210, 600);
    this.createVillageLanternPost(1310, 700);

    // 5. Quần thể cây thông cổ thụ, cây rỗng và thảm thực vật rừng ven
    this.createHollowTree(1360, 630, 'Cây Rỗng Rừng Ven');
    this.createTree(1170, 630, 'Cây Thông Ven Làng');
    this.createTree(1450, 660, 'Cây Cổ Thụ Rừng Ven');
    this.createTree(1230, 830, 'Cây Sồi Ven Rừng');
    this.createTree(1370, 860, 'Cây Sồi Rừng Ven');
    this.createTree(1510, 840, 'Cây Cổ Thụ Rừng Ven');
    this.createTree(1520, 690, 'Cây Cổ Thụ Rừng Ven');

    // Bụi rậm và đá tảng
    this.createDenseBush(1180, 760);
    this.createDenseBush(1350, 780);
    this.createDenseBush(1480, 730);
    this.createRock(1410, 750, 44, 26);
    this.createRock(1450, 840, 36, 22);
  }

  /**
   * Tạo công trình Nhà Kho / Chuồng Trại Nông Trại (Barn) với khung gỗ sồi và mái lợp rơm rạ rêu phong.
   */
  private createFarmBarnStructure(x: number, y: number, w: number, h: number): void {
    const g = this.scene.add.graphics();
    // Bóng chân tường
    g.fillStyle(0x0a0e0c, 0.55);
    g.fillRoundedRect(x - 4, y + h - 8, w + 8, 16, 4);

    // Khung tường gỗ sẫm màu
    g.fillStyle(0x382417, 1);
    g.fillRect(x, y, w, h);

    // Các cột trụ gỗ sồi chịu lực
    g.fillStyle(0x24170e, 1);
    g.fillRect(x, y, 6, h);
    g.fillRect(x + w / 2 - 3, y, 6, h);
    g.fillRect(x + w - 6, y, 6, h);

    // Nan ván gỗ ngang & cửa đôi nhà kho
    g.fillStyle(0x4a3220, 1);
    for (let py = y + 4; py < y + h - 4; py += 8) {
      g.fillRect(x + 8, py, w - 16, 2);
    }
    // Cửa đôi lớn
    g.fillStyle(0x23160d, 1);
    g.fillRect(x + w / 2 - 16, y + 14, 32, h - 14);
    g.fillStyle(0x5a3e28, 1);
    g.fillRect(x + w / 2 - 14, y + 16, 13, h - 18);
    g.fillRect(x + w / 2 + 1, y + 16, 13, h - 18);

    // Mái ngói rơm rạ rêu phong vươn cao
    g.fillStyle(0x6e4e2a, 1);
    g.fillTriangle(x - 6, y + 6, x + w / 2, y - 26, x + w + 6, y + 6);
    g.fillStyle(0x8a6336, 1);
    g.fillTriangle(x - 2, y + 4, x + w / 2, y - 24, x + w + 2, y + 4);
    // Vệt rêu xanh trên mái
    g.fillStyle(0x3b582b, 0.7);
    g.fillRect(x + 12, y - 8, 20, 6);
    g.fillRect(x + w - 36, y - 4, 18, 5);

    g.setDepth(y + h);

    // Collider chân tường
    const colW = w - 8;
    const colH = 22;
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);
  }

  /**
   * Tạo Rương Trú Ẩn Nông Trại (Storage Chest).
   */
  private createChestProp(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng rương
    g.fillStyle(0x0a0e0c, 0.5);
    g.fillEllipse(x + 14, y + 16, 26, 8);

    // Thân rương gỗ nẹp sắt
    g.fillStyle(0x422d1b, 1);
    g.fillRect(x, y, 28, 18);
    g.fillStyle(0x5e4128, 1);
    g.fillRect(x + 2, y + 2, 24, 14);

    // Nắp rương và nẹp sắt đen
    g.fillStyle(0x22272a, 1);
    g.fillRect(x, y + 6, 28, 2);
    g.fillRect(x + 4, y, 3, 18);
    g.fillRect(x + 21, y, 3, 18);

    // Ổ khóa đồng vàng
    g.fillStyle(0xd4ac0d, 1);
    g.fillRect(x + 12, y + 5, 4, 5);

    g.setDepth(y + 18);

    const body = this.colliderGroup.create(x + 14, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -7);
  }

  /**
   * Tạo bếp lửa trại thợ săn (Campfire).
   */
  private createHunterCampfire(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Quầng sáng ấm áp
    g.fillStyle(0xf39c12, 0.16);
    g.fillCircle(x + 18, y + 15, 34);
    g.fillStyle(0xe67e22, 0.22);
    g.fillCircle(x + 18, y + 15, 20);

    // Các khúc củi chéo nhau
    g.fillStyle(0x2a1a10, 1);
    g.fillRect(x + 8, y + 12, 20, 6);
    g.fillRect(x + 15, y + 5, 6, 20);

    // Đốm lửa và than hồng
    g.fillStyle(0xd35400, 1);
    g.fillCircle(x + 18, y + 15, 8);
    g.fillStyle(0xf39c12, 1);
    g.fillCircle(x + 18, y + 14, 5);
    g.fillStyle(0xfef9e7, 1);
    g.fillCircle(x + 18, y + 13, 2);

    g.setDepth(y + 18);

    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: g,
        alpha: 0.82,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    const body = this.colliderGroup.create(x + 18, y + 15, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -8);
  }

  /**
   * Hàng rào gỗ bao quanh đồng ruộng Sanctuary Farm.
   */
  private createFarmPerimeterFences(bounds: { x: number; y: number; width: number; height: number }): void {
    const addFarmFence = (fx: number, fy: number, withCollider: boolean = true) => {
      const fence = this.scene.add.image(fx, fy, SPRITE_WOODEN_FENCE);
      fence.setOrigin(0, 0.78);
      fence.setDepth(fy);

      if (withCollider) {
        const body = this.colliderGroup.create(fx + 23, fy - 4, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        (body.body as Phaser.Physics.Arcade.Body).setSize(42, 10);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-21, -5);
      }
    };

    // Hàng rào phía Tây bảo vệ nông trại dọc theo bờ rừng (x = 496, y = 600..980)
    for (let fy = 620; fy < 980; fy += 70) {
      addFarmFence(496, fy, true);
    }

    // Hàng rào ngăn bờ ruộng phía Bắc (wy = 788) chừa lối đi giữa ruộng
    addFarmFence(520, 788, true);
    addFarmFence(568, 788, true);
    addFarmFence(710, 788, true);
    addFarmFence(758, 788, true);
    addFarmFence(806, 788, true);
    addFarmFence(854, 788, true);
  }

  public detectCurrentZone(pos: Point2D): ZoneId {`;

if (!code.includes(target5)) {
  throw new Error('Target 5 not found in WorldBuilder.ts');
}
code = code.replace(target5, decorationMethods);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched src/world/WorldBuilder.ts!');
