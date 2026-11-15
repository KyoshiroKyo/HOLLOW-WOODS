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
import { HerbPlotData, HerbPlotStage } from '../types';
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
   * Vẽ chi tiết pixel-art cho từng ô đất theo 4 trạng thái sinh trưởng
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

    // 1. Khung luống đất & Nền đất ẩm xới sâu
    // Viền khung gỗ sồi bảo vệ luống đất
    g.fillStyle(0x3e2723, 1);
    g.fillRect(-pw / 2 - 2, -ph / 2 - 2, pw + 4, ph + 4);
    g.lineStyle(1, 0x5d4037, 1);
    g.strokeRect(-pw / 2 - 2, -ph / 2 - 2, pw + 4, ph + 4);

    // Lớp đất phù sa giàu dinh dưỡng
    g.fillStyle(0x271911, 1);
    g.fillRect(-pw / 2, -ph / 2, pw, ph);

    // Các đường xới rãnh luống đất
    g.fillStyle(0x1c110b, 1);
    g.fillRect(-pw / 2 + 2, -4, pw - 4, 2);
    g.fillRect(-pw / 2 + 2, 4, pw - 4, 2);

    container.add(g);

    // 2. Thể hiện cây trồng theo 4 trạng thái
    if (stage === 'empty') {
      // Ô đất trống: Đất tơi xốp, có vài vệt sỏi nhỏ
      const emptyG = this.scene.add.graphics();
      emptyG.fillStyle(0x4a3b32, 0.8);
      emptyG.fillRect(-8, -2, 3, 2);
      emptyG.fillRect(6, 3, 2, 2);
      container.add(emptyG);

    } else if (stage === 'planted') {
      // Vừa gieo hạt / nảy mầm: Mầm non xanh nhú khỏi mặt đất
      const sproutG = this.scene.add.graphics();
      const sproutPositions = [-12, -4, 4, 12];
      for (const sx of sproutPositions) {
        // Hạt mầm & chồi non xanh nõn
        sproutG.fillStyle(0x2ecc71, 1);
        sproutG.fillRect(sx, -2, 3, 4);
        sproutG.fillStyle(0x82e0aa, 1);
        sproutG.fillRect(sx - 1, -4, 2, 2);
        sproutG.fillRect(sx + 2, -4, 2, 2);
      }
      container.add(sproutG);

    } else if (stage === 'growing') {
      // Đang phát triển: Bụi thảo mộc xanh rậm rạp, lá tỏa nhánh
      const growG = this.scene.add.graphics();
      const plantPositions = [-10, 0, 10];
      for (const px of plantPositions) {
        // Thân & tán lá non xanh tươi
        growG.fillStyle(0x1e8449, 1);
        growG.fillRect(px - 4, -7, 8, 8);
        growG.fillStyle(0x27ae60, 1);
        growG.fillRect(px - 5, -10, 10, 6);
        growG.fillStyle(0x52be80, 1);
        growG.fillRect(px - 3, -12, 6, 3);
        // Gân lá thảo mộc bạc
        growG.fillStyle(0xd5f5e3, 0.9);
        growG.fillRect(px - 1, -9, 2, 4);
      }
      container.add(growG);

    } else if (stage === 'harvest_ready') {
      // Trưởng thành / Sẵn sàng thu hoạch: Bụi thảo dược xòe hoa nở rộ
      const matureG = this.scene.add.graphics();
      const maturePositions = [-11, 0, 11];
      for (const px of maturePositions) {
        // Tán lá xum xuê
        matureG.fillStyle(0x196f3d, 1);
        matureG.fillRect(px - 6, -9, 12, 10);
        matureG.fillStyle(0x229954, 1);
        matureG.fillRect(px - 7, -13, 14, 7);
        matureG.fillStyle(0x58d68d, 1);
        matureG.fillRect(px - 4, -16, 8, 4);
        // Gân lá bạc lấp lánh
        matureG.fillStyle(0xe8f8f5, 1);
        matureG.fillRect(px - 1, -12, 2, 5);
        // Hoa dược tính vàng hổ phách rực rỡ
        matureG.fillStyle(0xf1c40f, 1);
        matureG.fillRect(px - 4, -15, 3, 3);
        matureG.fillRect(px + 2, -15, 3, 3);
        matureG.fillStyle(0xffffff, 1);
        matureG.fillRect(px - 3, -14, 1, 1);
        matureG.fillRect(px + 3, -14, 1, 1);
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
      const hasSeeds = this.playerState.getItemCount('seed_herbs') >= 1;
      const hasHerbs = this.playerState.getItemCount('res_herbs') >= 1;
      if (hasSeeds) {
        return '[E] Gieo Hạt Giống Thảo Dược';
      } else if (hasHerbs) {
        return '[E] Ươm mầm Thảo Dược Bạc';
      } else {
        return '[E] Cần Hạt Giống hoặc Thảo Dược để gieo';
      }
    }

    if (stage === 'planted') {
      const elapsed = Date.now() - plot.plantedAt;
      const rem = Math.max(1, Math.ceil((FarmingSystem.STAGE_MATURE_MS - elapsed) / 1000));
      return `[E] Thảo dược đang nảy mầm... (${rem}s)`;
    }

    if (stage === 'growing') {
      const elapsed = Date.now() - plot.plantedAt;
      const rem = Math.max(1, Math.ceil((FarmingSystem.STAGE_MATURE_MS - elapsed) / 1000));
      return `[E] Thảo dược đang lớn... (${rem}s)`;
    }

    // harvest_ready
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

    // TRƯỜNG HỢP 1: Ô đất trống -> Tiến hành Gieo Hạt / Ươm mầm
    if (stage === 'empty') {
      const hasSeeds = this.playerState.getItemCount('seed_herbs') >= 1;
      const hasHerbs = this.playerState.getItemCount('res_herbs') >= 1;

      if (hasSeeds) {
        this.playerState.removeItem('seed_herbs', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('seed_herbs');
        onFeedback?.('🌱 Đã gieo Hạt Giống Thảo Dược vào ô đất!');
        return true;
      } else if (hasHerbs) {
        this.playerState.removeItem('res_herbs', 1);
        const plantedAt = Date.now();
        this.playerState.updateHerbPlot(plotId, 'planted', plantedAt);
        this.renderPlotVisual(plotId);
        AudioManager.getInstance().playResourceGather('res_herbs');
        onFeedback?.('🌱 Đã ươm mầm nhánh Thảo Dược Bạc vào ô đất!');
        return true;
      } else {
        onFeedback?.('⚠️ Cần có Hạt Giống hoặc Thảo Dược trong túi đồ để gieo trồng.');
        return false;
      }
    }

    // TRƯỜNG HỢP 2: Đang nảy mầm hoặc đang lớn -> Thông báo thời gian chờ
    if (stage === 'planted' || stage === 'growing') {
      const elapsed = Date.now() - plot.plantedAt;
      const rem = Math.max(1, Math.ceil((FarmingSystem.STAGE_MATURE_MS - elapsed) / 1000));
      onFeedback?.(`🌱 Cây thảo dược đang sinh trưởng (còn khoảng ${rem} giây nữa mới có thể thu hoạch)...`);
      return false;
    }

    // TRƯỜNG HỢP 3: Đã chín (harvest_ready) -> Thu hoạch (Chống trùng lặp tuyệt đối)
    if (stage === 'harvest_ready') {
      // Chuyển ngay trạng thái về rỗng để ngăn chặn hoàn toàn việc bấm liên tục nhân đôi tài nguyên
      this.playerState.updateHerbPlot(plotId, 'empty', 0);
      this.renderPlotVisual(plotId);

      // Cộng sản vật vào túi đồ: +2 Thảo Dược Bạc, +1 Hạt Giống
      this.playerState.addItem('res_herbs', 2);
      this.playerState.addItem('seed_herbs', 1);

      AudioManager.getInstance().playResourceGather('res_herbs');
      onFeedback?.('🌿 Đã thu hoạch thành công: +2 Thảo Dược Bạc, +1 Hạt Giống!');
      return true;
    }

    return false;
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
