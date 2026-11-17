/**
 * HOLLOW WOODS V1.2 – HỆ THỐNG NÔNG TRẠI THẢO DƯỢC SANCTUARY FARM (C4-12-16)
 * Quản lý 4 ô đất trồng thảo mộc nhỏ gọn, hỗ trợ đầy đủ 4 trạng thái trực quan:
 * 1. empty (ô đất đã xới / trống)
 * 2. planted (vừa gieo hạt / nảy mầm)
 * 3. growing (đang phát triển / cây non xanh lá)
 * 4. harvest_ready (trưởng thành / sẵn sàng thu hoạch hoa lá thảo mộc)
 *
 * Tính năng chống bug:
 * - Chống bấm [E] nhận trùng lặp nhiều lần (Atomic stage transition + Cooldown).
 * - Tính toán sinh trưởng ổn định theo mốc thời gian thực (Timestamp drift-free).
 * - Lưu/tải toàn vẹn qua SaveManager và chuyển đổi scene/zone.
 */

import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { CropType, HerbPlotData, HerbPlotStage } from '../types';
import { AudioManager } from '../audio/AudioManager';

export class FarmingSystem {
  public static readonly STAGE_GROWING_MS = 12000;  // 12 giây: chuyển từ planted -> growing
  public static readonly STAGE_MATURE_MS = 25000;   // 25 giây: chuyển từ growing -> harvest_ready
  public static readonly INTERACTION_RADIUS = 34;   // Bán kính tương tác từng ô đất

  private scene: Phaser.Scene;
  private playerState: PlayerState;
  private plotContainers: Map<string, Phaser.GameObjects.Container> = new Map();
  private lastInteractTime: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();
    this.initPlotVisuals();
  }

  /**
   * Tính toán trạng thái sinh trưởng của ô đất dựa trên thời điểm gieo trồng (drift-free timestamp)
   */
  public computeStage(plantedAt: number): HerbPlotStage {
    if (plantedAt === 0) return 'empty';
    const elapsed = Date.now() - plantedAt;
    if (elapsed >= FarmingSystem.STAGE_MATURE_MS) {
      return 'harvest_ready';
    }
    if (elapsed >= FarmingSystem.STAGE_GROWING_MS) {
      return 'growing';
    }
    return 'planted';
  }

  /**
   * Khởi tạo hình ảnh hiển thị cho 4 ô đất tại Sanctuary Farm
   */
  private initPlotVisuals(): void {
    const plots = this.playerState.getHerbPlots();
    for (const plot of plots) {
      const container = this.scene.add.container(plot.x, plot.y);
      container.setDepth(plot.y + 4);
      this.plotContainers.set(plot.id, container);
      this.renderPlotVisual(plot.id);
    }
  }

  /**
   * Vẽ chi tiết pixel-art cho từng ô đất theo 5 trạng thái quy trình sinh tồn
   * 1. empty (chưa làm đất) / 2. prepared (đã xới đất tơi xốp)
   * 3. planted (nảy mầm) / 4. growing (sinh trưởng) / 5. harvest_ready (thu hoạch)
   */
  public renderPlotVisual(plotId: string): void {
    const plot = this.playerState.getHerbPlot(plotId);
    const container = this.plotContainers.get(plotId);
    if (!plot || !container) return;

    // C4-12-29: Hủy toàn bộ tween đang chạy trên các phần tử con trước khi dọn dẹp để tránh rò rỉ tween
    for (const child of container.list) {
      this.scene.tweens.killTweensOf(child);
    }
    container.removeAll(true);

    const stage = this.computeStage(plot.plantedAt);
    if (plot.stage !== stage) {
      plot.stage = stage;
    }

    const g = this.scene.add.graphics();
    const pw = 40;
    const ph = 20;

    // 1. Khung luống đất & Nền đất
    // Viền khung gỗ sồi bảo vệ luống đất
    g.fillStyle(0x3e2723, 1);
    g.fillRect(-pw / 2 - 2, -ph / 2 - 2, pw + 4, ph + 4);
    g.lineStyle(1, 0x5d4037, 1);
    g.strokeRect(-pw / 2 - 2, -ph / 2 - 2, pw + 4, ph + 4);

    if (plot.isPrepared) {
      // Đất đã làm tơi xốp & bón lót ẩm
      g.fillStyle(0x271911, 1);
      g.fillRect(-pw / 2, -ph / 2, pw, ph);

      // Các luống đất xới rãnh gọn gàng
      g.fillStyle(0x1c110b, 1);
      g.fillRect(-pw / 2 + 2, -4, pw - 4, 2);
      g.fillRect(-pw / 2 + 2, 4, pw - 4, 2);
    } else {
      // Đất thô chưa xới: hơi khô cứng, nhạt màu hơn và có sỏi vụn
      g.fillStyle(0x38281f, 1);
      g.fillRect(-pw / 2, -ph / 2, pw, ph);
      g.fillStyle(0x241812, 1);
      g.fillRect(-pw / 2 + 4, -2, 6, 3);
      g.fillRect(2, 2, 8, 3);
      g.fillStyle(0x5c483a, 1);
      g.fillRect(-10, -5, 3, 2);
      g.fillRect(10, 3, 2, 2);
    }

    container.add(g);

    const crop: CropType = plot.cropType || 'herbs';

    // 2. Thể hiện cây trồng theo các trạng thái
    if (stage === 'empty') {
      if (plot.isPrepared) {
        // Đất đã xới sẵn sàng gieo: vệt đất ẩm tơi xốp
        const prepG = this.scene.add.graphics();
        prepG.fillStyle(0x4a3b32, 0.8);
        prepG.fillRect(-8, -2, 3, 2);
        prepG.fillRect(6, 3, 2, 2);
        container.add(prepG);
      }
    } else if (stage === 'planted') {
      // Vừa gieo hạt / nảy mầm
      const sproutG = this.scene.add.graphics();
      if (crop === 'roots') {
        // Mầm rễ rừng: chồi non xanh ánh cam đất
        const sproutPositions = [-10, 0, 10];
        for (const sx of sproutPositions) {
          sproutG.fillStyle(0xd35400, 1);
          sproutG.fillRect(sx - 1, 0, 3, 3);
          sproutG.fillStyle(0x27ae60, 1);
          sproutG.fillRect(sx, -3, 2, 3);
        }
      } else if (crop === 'mushroom') {
        // Bào tử nấm: những đốm tai nấm mầm nhỏ màu xám be
        const sporePositions = [-12, -4, 4, 12];
        for (const sx of sporePositions) {
          sproutG.fillStyle(0xd7ccc8, 1);
          sproutG.fillRect(sx, -2, 3, 3);
          sproutG.fillStyle(0x8d6e63, 1);
          sproutG.fillRect(sx, -4, 3, 2);
        }
      } else if (crop === 'fiber') {
        // Mầm cỏ sợi: những sợi kim xanh nhọn
        const sproutPositions = [-12, -6, 0, 6, 12];
        for (const sx of sproutPositions) {
          sproutG.fillStyle(0x558b2f, 1);
          sproutG.fillRect(sx, -4, 2, 5);
          sproutG.fillStyle(0xaed581, 1);
          sproutG.fillRect(sx, -5, 1, 2);
        }
      } else {
        // Mầm Thảo Dược Bạc
        const sproutPositions = [-12, -4, 4, 12];
        for (const sx of sproutPositions) {
          sproutG.fillStyle(0x2ecc71, 1);
          sproutG.fillRect(sx, -2, 3, 4);
          sproutG.fillStyle(0x82e0aa, 1);
          sproutG.fillRect(sx - 1, -4, 2, 2);
          sproutG.fillRect(sx + 2, -4, 2, 2);
        }
      }
      container.add(sproutG);

    } else if (stage === 'growing') {
      // Đang phát triển
      const growG = this.scene.add.graphics();
      if (crop === 'roots') {
        // Cây rễ củ: tán lá rậm rạp răng cưa và đầu củ trồi nhẹ
        const plantPositions = [-10, 0, 10];
        for (const px of plantPositions) {
          growG.fillStyle(0xd35400, 1);
          growG.fillRect(px - 2, -2, 4, 3);
          growG.fillStyle(0x1e8449, 1);
          growG.fillRect(px - 4, -8, 8, 7);
          growG.fillStyle(0x2ecc71, 1);
          growG.fillRect(px - 3, -11, 6, 4);
        }
      } else if (crop === 'mushroom') {
        // Nấm đang nở: các mũ nấm nâu be hình vòm
        const plantPositions = [-10, 0, 10];
        for (const px of plantPositions) {
          growG.fillStyle(0xefebe9, 1);
          growG.fillRect(px - 1, -4, 2, 4);
          growG.fillStyle(0x8d6e63, 1);
          growG.fillRect(px - 4, -8, 8, 5);
          growG.fillStyle(0xa1887f, 1);
          growG.fillRect(px - 3, -9, 6, 2);
        }
      } else if (crop === 'fiber') {
        // Cỏ sợi đang lớn: khóm cỏ cao vươn thẳng
        const plantPositions = [-12, -4, 4, 12];
        for (const px of plantPositions) {
          growG.fillStyle(0x33691e, 1);
          growG.fillRect(px - 2, -10, 4, 10);
          growG.fillStyle(0x689f38, 1);
          growG.fillRect(px - 1, -13, 2, 5);
        }
      } else {
        // Thảo dược Bạc đang lớn
        const plantPositions = [-10, 0, 10];
        for (const px of plantPositions) {
          growG.fillStyle(0x1e8449, 1);
          growG.fillRect(px - 4, -7, 8, 8);
          growG.fillStyle(0x27ae60, 1);
          growG.fillRect(px - 5, -10, 10, 6);
          growG.fillStyle(0x52be80, 1);
          growG.fillRect(px - 3, -12, 6, 3);
          growG.fillStyle(0xd5f5e3, 0.9);
          growG.fillRect(px - 1, -9, 2, 4);
        }
      }
      container.add(growG);

    } else if (stage === 'harvest_ready') {
      // Trưởng thành / Sẵn sàng thu hoạch
      const matureG = this.scene.add.graphics();
      if (crop === 'roots') {
        // Rễ rừng trưởng thành: Củ rễ to tròn màu nâu cam lộ trên đất, lá xanh tốt
        const maturePositions = [-11, 0, 11];
        for (const px of maturePositions) {
          matureG.fillStyle(0xba4a00, 1);
          matureG.fillRect(px - 4, -4, 8, 5);
          matureG.fillStyle(0xe59866, 1);
          matureG.fillRect(px - 2, -3, 4, 2);
          matureG.fillStyle(0x196f3d, 1);
          matureG.fillRect(px - 6, -11, 12, 8);
          matureG.fillStyle(0x27ae60, 1);
          matureG.fillRect(px - 4, -14, 8, 4);
        }
      } else if (crop === 'mushroom') {
        // Nấm rừng trưởng thành: Cụm nấm nâu vàng có chấm sáng lấp lánh
        const maturePositions = [-11, 0, 11];
        for (const px of maturePositions) {
          matureG.fillStyle(0xd7ccc8, 1);
          matureG.fillRect(px - 2, -5, 4, 6);
          matureG.fillStyle(0x6d4c41, 1);
          matureG.fillRect(px - 6, -12, 12, 8);
          matureG.fillStyle(0x8d6e63, 1);
          matureG.fillRect(px - 5, -14, 10, 3);
          matureG.fillStyle(0xffecb3, 1);
          matureG.fillRect(px - 3, -11, 2, 2);
          matureG.fillRect(px + 2, -10, 2, 2);
        }
      } else if (crop === 'fiber') {
        // Cỏ sợi bện dây trưởng thành: Bụi cỏ sợi cao màu vàng lục, óng ánh
        const maturePositions = [-12, -4, 4, 12];
        for (const px of maturePositions) {
          matureG.fillStyle(0x558b2f, 1);
          matureG.fillRect(px - 2, -14, 5, 14);
          matureG.fillStyle(0x9ccc65, 1);
          matureG.fillRect(px - 3, -17, 6, 5);
          matureG.fillStyle(0xfff9c4, 0.9);
          matureG.fillRect(px, -16, 2, 7);
        }
      } else {
        // Thảo dược bạc nở hoa vàng hổ phách
        const maturePositions = [-11, 0, 11];
        for (const px of maturePositions) {
          matureG.fillStyle(0x196f3d, 1);
          matureG.fillRect(px - 6, -9, 12, 10);
          matureG.fillStyle(0x229954, 1);
          matureG.fillRect(px - 7, -13, 14, 7);
          matureG.fillStyle(0x58d68d, 1);
          matureG.fillRect(px - 4, -16, 8, 4);
          matureG.fillStyle(0xe8f8f5, 1);
          matureG.fillRect(px - 1, -12, 2, 5);
          matureG.fillStyle(0xf1c40f, 1);
          matureG.fillRect(px - 4, -15, 3, 3);
          matureG.fillRect(px + 2, -15, 3, 3);
          matureG.fillStyle(0xffffff, 1);
          matureG.fillRect(px - 3, -14, 1, 1);
          matureG.fillRect(px + 3, -14, 1, 1);
        }
      }
      container.add(matureG);

      // Hiệu ứng thở / lấp lánh nhẹ nhàng khi thảo mộc đã chín
      this.scene.tweens.add({
        targets: matureG,
        scaleY: 1.06,
        alpha: 0.92,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Cập nhật chu kỳ sinh trưởng của toàn bộ 4 ô đất
   */
  public update(): void {
    const plots = this.playerState.getHerbPlots();
    for (const plot of plots) {
      if (plot.plantedAt > 0) {
        const computed = this.computeStage(plot.plantedAt);
        if (computed !== plot.stage) {
          plot.stage = computed;
          this.renderPlotVisual(plot.id);
        }
      }
    }
  }

  /**
   * Tìm ô đất gần người chơi nhất trong phạm vi tương tác
   */
  public checkNearbyPlot(playerX: number, playerY: number, radius: number = FarmingSystem.INTERACTION_RADIUS): HerbPlotData | null {
    const plots = this.playerState.getHerbPlots();
    let bestPlot: HerbPlotData | null = null;
    let bestDistSq = radius * radius;

    for (let i = 0; i < plots.length; i++) {
      const plot = plots[i];
      const dx = playerX - plot.x;
      if (Math.abs(dx) > radius) continue;
      const dy = playerY - plot.y;
      if (Math.abs(dy) > radius) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq <= bestDistSq) {
        bestDistSq = distSq;
        bestPlot = plot;
      }
    }

    return bestPlot;
  }

  /**
   * Lấy dòng nhắc tương tác [E] tương ứng với trạng thái hiện tại của ô đất
   */
  public getPlotPrompt(plot: HerbPlotData): string {
    const stage = this.computeStage(plot.plantedAt);

    if (stage === 'empty') {
      if (!plot.isPrepared) {
        return '[E] Làm Đất Chuẩn Bị Luống Trồng';
      }
      const hasSeeds = this.playerState.getItemCount('seed_herbs') >= 1;
      const hasRoots = this.playerState.getItemCount('seed_roots') >= 1;
      const hasMushroom = this.playerState.getItemCount('seed_mushroom') >= 1;
      const hasFiber = this.playerState.getItemCount('seed_fiber') >= 1;
      const hasHerbs = this.playerState.getItemCount('res_herbs') >= 1;
      const hasCropRoots = this.playerState.getItemCount('res_forest_roots') >= 1;
      const hasCropMushroom = this.playerState.getItemCount('res_forest_mushroom') >= 1;

      if (hasSeeds) {
        return '[E] Gieo Hạt Giống Thảo Dược';
      } else if (hasRoots) {
        return '[E] Gieo Củ Giống Rễ Rừng';
      } else if (hasMushroom) {
        return '[E] Ươm Bào Tử Nấm Rừng';
      } else if (hasFiber) {
        return '[E] Gieo Hạt Giống Cỏ Sợi Bện Dây';
      } else if (hasHerbs) {
        return '[E] Ươm mầm Thảo Dược Bạc';
      } else if (hasCropRoots) {
        return '[E] Ươm củ Rễ Rừng';
      } else if (hasCropMushroom) {
        return '[E] Cấy tai Nấm Rừng';
      } else {
        return '[E] Cần Hạt Giống hoặc Thảo Dược để gieo';
      }
    }

    const cropName = plot.cropType === 'roots' ? 'Rễ rừng'
      : plot.cropType === 'mushroom' ? 'Nấm rừng'
      : plot.cropType === 'fiber' ? 'Cỏ sợi'
      : 'Thảo dược';

    if (stage === 'planted') {
      const elapsed = Date.now() - plot.plantedAt;
      const rem = Math.max(1, Math.ceil((FarmingSystem.STAGE_MATURE_MS - elapsed) / 1000));
      return `[E] ${cropName} đang nảy mầm... (${rem}s)`;
    }

    if (stage === 'growing') {
      const elapsed = Date.now() - plot.plantedAt;
      const rem = Math.max(1, Math.ceil((FarmingSystem.STAGE_MATURE_MS - elapsed) / 1000));
      return `[E] ${cropName} đang lớn... (${rem}s)`;
    }

    // harvest_ready
    if (plot.cropType === 'roots') {
      return '[E] Thu Hoạch Rễ Rừng (+2 Rễ Rừng, +1 Củ Giống)';
    } else if (plot.cropType === 'mushroom') {
      return '[E] Thu Hoạch Nấm Rừng (+2 Nấm, +1 Bào Tử)';
    } else if (plot.cropType === 'fiber') {
      return '[E] Thu Hoạch Cỏ Sợi Bện Dây (+3 Cỏ Sợi, +1 Hạt Giống)';
    }
    return '[E] Thu Hoạch Thảo Dược Bạc (+2 Thảo Dược, +1 Hạt Giống)';
  }

  /**
   * Xử lý tương tác của người chơi với ô đất khi bấm phím [E]
   */
  public interactWithPlot(plotId: string, onFeedback?: (msg: string) => void): boolean {
    const now = performance.now();
    if (now - this.lastInteractTime < 350) return false;
    this.lastInteractTime = now;

    const plot = this.playerState.getHerbPlot(plotId);
    if (!plot) return false;

    const stage = this.computeStage(plot.plantedAt);

    // TRƯỜNG HỢP 1: Ô đất trống -> Bước 1: Làm đất (nếu chưa chuẩn bị), Bước 2: Gieo hạt
    if (stage === 'empty') {
      if (!plot.isPrepared) {
        plot.isPrepared = true;
        this.playerState.updateHerbPlot(plotId, 'empty', 0, undefined, true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🌱 Đã xới đất tơi xốp! Luống đất sẵn sàng để gieo hạt giống.');
        return true;
      }

      const hasHerbSeeds = this.playerState.getItemCount('seed_herbs') >= 1;
      const hasRootSeeds = this.playerState.getItemCount('seed_roots') >= 1;
      const hasMushroomSeeds = this.playerState.getItemCount('seed_mushroom') >= 1;
      const hasFiberSeeds = this.playerState.getItemCount('seed_fiber') >= 1;
      const hasHerbs = this.playerState.getItemCount('res_herbs') >= 1;
      const hasRoots = this.playerState.getItemCount('res_forest_roots') >= 1;
      const hasMushroom = this.playerState.getItemCount('res_forest_mushroom') >= 1;

      if (hasHerbSeeds) {
        this.playerState.removeItem('seed_herbs', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'herbs', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('seed_herbs');
        onFeedback?.('🌱 Đã gieo Hạt Giống Thảo Dược vào ô đất!');
        return true;
      } else if (hasRootSeeds) {
        this.playerState.removeItem('seed_roots', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'roots', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('seed_herbs');
        onFeedback?.('🥕 Đã gieo Củ Giống Rễ Rừng vào ô đất!');
        return true;
      } else if (hasMushroomSeeds) {
        this.playerState.removeItem('seed_mushroom', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'mushroom', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('seed_herbs');
        onFeedback?.('🍄 Đã ươm Bào Tử Nấm Rừng vào luống đất!');
        return true;
      } else if (hasFiberSeeds) {
        this.playerState.removeItem('seed_fiber', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'fiber', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('seed_herbs');
        onFeedback?.('🌾 Đã gieo Hạt Giống Cỏ Sợi Bện Dây vào ô đất!');
        return true;
      } else if (hasHerbs) {
        this.playerState.removeItem('res_herbs', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'herbs', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🌱 Đã ươm mầm nhánh Thảo Dược Bạc vào ô đất!');
        return true;
      } else if (hasRoots) {
        this.playerState.removeItem('res_forest_roots', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'roots', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🥕 Đã ươm củ Rễ Rừng vào luống đất!');
        return true;
      } else if (hasMushroom) {
        this.playerState.removeItem('res_forest_mushroom', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt, 'mushroom', true);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🍄 Đã cấy tai Nấm Rừng vào đất mùn!');
        return true;
      } else {
        // C4-132-05: Kích hoạt cơ chế cứu trợ cấp lại 2 Hạt Giống Thảo Dược miễn phí từ túi dự trữ của Neris
        const granted = this.checkAndGrantEmergencySeeds(onFeedback);
        if (!granted) {
          onFeedback?.('⚠️ Cần có Hạt Giống hoặc Thảo Dược trong túi đồ để gieo trồng.');
        }
        return false;
      }
    }

    // TRƯỜNG HỢP 2: Đang nảy mầm hoặc đang lớn -> Thông báo thời gian chờ
    if (stage === 'planted' || stage === 'growing') {
      const elapsed = Date.now() - plot.plantedAt;
      const rem = Math.max(1, Math.ceil((FarmingSystem.STAGE_MATURE_MS - elapsed) / 1000));
      const cropName = plot.cropType === 'roots' ? 'Cây rễ rừng'
        : plot.cropType === 'mushroom' ? 'Cụm nấm rừng'
        : plot.cropType === 'fiber' ? 'Cỏ sợi bện dây'
        : 'Cây thảo dược';
      onFeedback?.(`🌱 ${cropName} đang sinh trưởng (còn khoảng ${rem} giây nữa mới có thể thu hoạch)...`);
      return false;
    }

    // TRƯỜNG HỢP 3: Đã chín (harvest_ready) -> Thu hoạch (Chống trùng lặp tuyệt đối)
    if (stage === 'harvest_ready') {
      const crop: CropType = plot.cropType || 'herbs';
      // Chuyển ngay trạng thái về rỗng để ngăn chặn hoàn toàn việc bấm liên tục nhân đôi tài nguyên
      this.playerState.updateHerbPlot(plotId, 'empty', 0);
      plot.isPrepared = false;
      plot.cropType = undefined;
      this.renderPlotVisual(plotId);

      if (crop === 'roots') {
        this.playerState.addItem('res_forest_roots', 2);
        this.playerState.addItem('seed_roots', 1);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🥕 Đã thu hoạch thành công: +2 Rễ Rừng, +1 Củ Giống!');
      } else if (crop === 'mushroom') {
        this.playerState.addItem('res_forest_mushroom', 2);
        this.playerState.addItem('seed_mushroom', 1);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🍄 Đã thu hoạch thành công: +2 Nấm Rừng, +1 Bào Tử Nấm!');
      } else if (crop === 'fiber') {
        this.playerState.addItem('res_tough_fiber', 3);
        this.playerState.addItem('seed_fiber', 1);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🌾 Đã thu hoạch thành công: +3 Cỏ Sợi Bện Dây, +1 Hạt Giống Cỏ Sợi!');
      } else {
        // Mặc định hoặc Thảo Dược Bạc
        // Cộng sản vật vào túi đồ: +2 Thảo Dược Bạc, +1 Hạt Giống
        this.playerState.addItem('res_herbs', 2);
        this.playerState.addItem('seed_herbs', 1);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🌿 Đã thu hoạch thành công: +2 Thảo Dược Bạc, +1 Hạt Giống!');
      }
      return true;
    }

    return false;
  }

  /**
   * C4-132-05: Cơ chế cứu trợ Hạt Giống Thảo Dược tại Sanctuary Farm (M-16).
   * Kiểm tra khi người chơi đứng tại khu vực ô đất trồng ở Sanctuary Farm (hoặc khi trò chuyện với Neris):
   * nếu tổng số Hạt Giống Thảo Dược trong túi đồ bằng 0 VÀ cả 4 ô đất trồng đều đang trống
   * (không có cây nào đang lớn để chờ thu hoạch), tự động kích hoạt cơ chế cứu trợ cấp lại
   * 2 Hạt Giống Thảo Dược miễn phí từ túi dự trữ của Neris kèm thông báo hướng dẫn:
   * "Neris vừa chia sẻ thêm cho bạn 2 Hạt Giống Thảo Dược dự phòng. Hãy gieo trồng cẩn thận!"
   */
  public checkAndGrantEmergencySeeds(onFeedback?: (msg: string) => void): boolean {
    const seedCount = this.playerState.getItemCount('seed_herbs');
    if (seedCount > 0) return false;

    const plots = this.playerState.getHerbPlots();
    const allEmpty = plots.every(p => this.computeStage(p.plantedAt) === 'empty');
    if (!allEmpty) return false;

    // Cấp lại 2 Hạt Giống Thảo Dược miễn phí từ túi dự trữ của Neris
    this.playerState.addItem('seed_herbs', 2);
    AudioManager.getInstance().playResourceGather('seed_herbs');
    const msg = 'Neris vừa chia sẻ thêm cho bạn 2 Hạt Giống Thảo Dược dự phòng. Hãy gieo trồng cẩn thận!';
    if (onFeedback) {
      onFeedback(msg);
    }
    return true;
  }

  /**
   * Dọn dẹp đồ họa khi chuyển scene
   */
  public destroy(): void {
    for (const container of this.plotContainers.values()) {
      container.destroy(true);
    }
    this.plotContainers.clear();
  }
}
