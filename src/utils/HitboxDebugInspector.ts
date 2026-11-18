/**
 * HOLLOW WOODS V1.4 - PERFORMANCE PROFILER & HITBOX DEBUGGER
 * Phím tắt [F9]: Bật / Tắt bảng giám sát hiệu năng thời gian thực và viền va chạm.
 * Phím tắt [F10]: Kích hoạt chế độ Chạy Thử Hiệu Năng Tự Động (10-Second Stress Benchmark) khi F9 đang bật.
 * 
 * TÍNH NĂNG CHÍNH:
 * 1. FPS & Frame Time: Số khung hình/giây hiện tại (actualFps), 1% Low FPS, thời gian xử lý frame (ms).
 * 2. WebGL Draw Calls: Đếm chính xác số lệnh vẽ (drawElements / drawArrays) mỗi frame qua hook context.
 *    RÀNG BUỘC HIỆU NĂNG: Chỉ kích hoạt hook khi F9 bật. Khi tắt F9, overhead bằng 0 tuyệt đối.
 * 3. Đối tượng & Culling: Đếm GameObject trong scene, số đối tượng/tile hiển thị và culled, textures nạp VRAM.
 * 4. Trạng thái 3 Module Tiled: Hiển thị ON/OFF của YSorting, Culling, PerimeterWalls.
 * 5. Bảng tổng kết Benchmark 10s: Thống kê trung bình, đỉnh điểm, tự động xuất log JSON và cập nhật báo cáo.
 */

import * as Phaser from 'phaser';
import { SatyrPlayer } from '../entities/SatyrPlayer';
import { ZoneId } from '../types';
import { HDTextHelper } from './HDTextHelper';
import { TILED_PIPELINE_CONFIG } from '../config/tiledPipelineConfig';
import { CullingOptimizationModule } from '../world/modules/CullingOptimizationModule';
import { AudioManager } from '../audio/AudioManager';
import { GraphicsQualitySystem } from '../systems/GraphicsQualitySystem';

export interface BenchmarkSample {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  visible: number;
  culled: number;
  total: number;
}

export interface BenchmarkResult {
  timestamp: string;
  zoneId: string;
  durationSeconds: number;
  sampleCount: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  onePercentLowFps: number;
  avgFrameTimeMs: number;
  avgDrawCalls: number;
  peakDrawCalls: number;
  avgVisibleObjects: number;
  avgCulledObjects: number;
  culledRatioPercent: number;
  totalObjects: number;
  vramTextures: number;
  tiledModules: {
    ySorting: boolean;
    culling: boolean;
    perimeterWalls: boolean;
  };
}

export class HitboxDebugInspector {
  private scene: Phaser.Scene;
  private uiScene: Phaser.Scene;
  private player: SatyrPlayer;
  private isEnabled: boolean = false;
  private f8Key!: Phaser.Input.Keyboard.Key;
  private f9Key!: Phaser.Input.Keyboard.Key;
  private f10Key!: Phaser.Input.Keyboard.Key;

  // Graphics overlay vẽ trong GameScene (tọa độ thế giới)
  private debugGfx: Phaser.GameObjects.Graphics;

  // Bảng thông số F9 hiển thị trên UIScene (Zoom 1.0 cố định)
  private uiContainer: Phaser.GameObjects.Container;
  private infoText: Phaser.GameObjects.Text;
  private uiBg: Phaser.GameObjects.Graphics;

  // Bảng tổng kết kết quả Benchmark F10 (Modal giữa màn hình)
  private benchmarkModalContainer!: Phaser.GameObjects.Container;
  private isBenchmarkModalVisible: boolean = false;

  // WebGL Draw Call Interceptor
  private glContext: any = null;
  private originalDrawElements: any = null;
  private originalDrawArrays: any = null;
  private originalDrawElementsInstanced: any = null;
  private originalDrawArraysInstanced: any = null;
  private originalDrawRangeElements: any = null;
  private isHooked: boolean = false;
  private frameDrawCalls: number = 0;
  private lastFrameDrawCalls: number = 0;
  private postRenderListener: (() => void) | null = null;

  // Sliding window tính 1% Low FPS (120 frames gần nhất)
  private frameTimeHistory: number[] = [];
  private readonly HISTORY_SIZE = 120;

  // Quản lý Benchmark 10 giây (F10)
  private isBenchmarking: boolean = false;
  private benchmarkElapsedMs: number = 0;
  private readonly BENCHMARK_DURATION_MS: number = 10000;
  private benchmarkSamples: BenchmarkSample[] = [];
  public lastBenchmarkResult: BenchmarkResult | null = null;

  constructor(scene: Phaser.Scene, player: SatyrPlayer, uiScene?: Phaser.Scene) {
    this.scene = scene;
    this.uiScene = uiScene || scene;
    this.player = player;

    // Graphics vẽ trên layer cao nhất của GameScene
    this.debugGfx = this.scene.add.graphics();
    this.debugGfx.setDepth(999999);
    this.debugGfx.setVisible(false);

    // V1.5 (BƯỚC V15-04): Đảm bảo Arcade Physics Debug luôn tắt khi khởi tạo
    if (this.scene.physics && this.scene.physics.world) {
      this.scene.physics.world.drawDebug = false;
      if (this.scene.physics.world.debugGraphic) {
        this.scene.physics.world.debugGraphic.clear();
        this.scene.physics.world.debugGraphic.setVisible(false);
      }
    }

    if (this.scene.input && this.scene.input.keyboard) {
      this.f8Key = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F8);
      this.f9Key = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F9);
      this.f10Key = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F10);
      this.scene.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.F8,
        Phaser.Input.Keyboard.KeyCodes.F9,
        Phaser.Input.Keyboard.KeyCodes.F10
      ]);
    }

    // V1.5 (BƯỚC V15-04): Khởi tạo bảng hiển thị ở góc dưới bên phải màn hình (X: 840, Y: 420),
    // tuyệt đối không đặt đè lên cụm 4 thanh chỉ số ở góc trên bên trái (X: 12..374, Y: 8..100).
    // Trạng thái mặc định luôn là TẮT hoàn toàn (false).
    this.uiContainer = this.uiScene.add.container(840, 420);
    this.uiContainer.setScrollFactor(0);
    this.uiContainer.setDepth(100000);
    this.uiContainer.setVisible(false);

    this.uiBg = this.uiScene.add.graphics();
    this.infoText = HDTextHelper.createText(this.uiScene, 10, 8, '', {
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: '11px',
      color: '#00ffcc',
      stroke: '#000000',
      strokeThickness: 2,
      lineSpacing: 1.5
    });

    this.uiContainer.add([this.uiBg, this.infoText]);

    // Khởi tạo container Modal Benchmark F10 ở trung tâm màn hình (640, 360)
    this.createBenchmarkModalUI();
  }

  /**
   * Tạo giao diện Modal kết quả Benchmark F10
   */
  private createBenchmarkModalUI(): void {
    this.benchmarkModalContainer = this.uiScene.add.container(640, 360);
    this.benchmarkModalContainer.setScrollFactor(0);
    this.benchmarkModalContainer.setDepth(100010);
    this.benchmarkModalContainer.setVisible(false);
  }

  public setUIScene(uiScene: Phaser.Scene): void {
    if (this.uiScene !== uiScene) {
      if (this.uiContainer) {
        this.uiContainer.destroy();
      }
      if (this.benchmarkModalContainer) {
        this.benchmarkModalContainer.destroy();
      }
      this.uiScene = uiScene;

      this.uiContainer = this.uiScene.add.container(840, 420);
      this.uiContainer.setScrollFactor(0);
      this.uiContainer.setDepth(100000);
      this.uiContainer.setVisible(this.isEnabled);

      this.uiBg = this.uiScene.add.graphics();
      this.infoText = HDTextHelper.createText(this.uiScene, 10, 8, '', {
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: '11px',
        color: '#00ffcc',
        stroke: '#000000',
        strokeThickness: 2,
        lineSpacing: 1.5
      });

      this.uiContainer.add([this.uiBg, this.infoText]);
      this.createBenchmarkModalUI();
    }
  }

  /**
   * Vòng lặp cập nhật chính mỗi frame
   */
  public update(currentZoneId: ZoneId, delta?: number): void {
    const deltaMs = delta !== undefined ? delta : (this.scene.game.loop.delta || 16.6);

    // Bắt phím F9: Bật / Tắt Profiler
    if (this.f9Key && Phaser.Input.Keyboard.JustDown(this.f9Key)) {
      this.toggleDebug();
    }

    // Bắt phím F10: Kích hoạt / Hủy Benchmark 10s (chỉ khi F9 đang bật)
    if (this.isEnabled && this.f10Key && Phaser.Input.Keyboard.JustDown(this.f10Key)) {
      if (this.isBenchmarkModalVisible) {
        this.closeBenchmarkModal();
      } else if (!this.isBenchmarking) {
        this.startBenchmark();
      }
    }

    // Bắt phím F8: Chuyển đổi chất lượng đồ họa HIGH -> MEDIUM -> LOW
    if (this.isEnabled && this.f8Key && Phaser.Input.Keyboard.JustDown(this.f8Key)) {
      const newSettings = GraphicsQualitySystem.getInstance().cycleQuality();
      const gameScene = this.scene as any;
      if (gameScene && typeof gameScene.applyGraphicsQuality === 'function') {
        gameScene.applyGraphicsQuality(newSettings);
      }
      if (this.uiScene && typeof (this.uiScene as any).showPopupMessage === 'function') {
        (this.uiScene as any).showPopupMessage(
          `⚙️ Chế độ Đồ họa: [${newSettings.level}] (Buffer ${newSettings.lightingScale}x, ${newSettings.maxFogLayers} lớp sương)`
        );
      }
      try {
        AudioManager.getInstance().playUISelect();
      } catch {
        // Ignored
      }
    }

    if (!this.isEnabled) return;

    // Ghi nhận lịch sử frame time cho 1% Low FPS
    this.frameTimeHistory.push(deltaMs);
    if (this.frameTimeHistory.length > this.HISTORY_SIZE) {
      this.frameTimeHistory.shift();
    }

    // Tiến trình Benchmark 10s tự động
    if (this.isBenchmarking) {
      this.updateBenchmarkProgress(currentZoneId, deltaMs);
    }

    this.renderDebugGraphics(currentZoneId, deltaMs);
  }

  /**
   * Bật / Tắt chế độ kiểm tra kỹ thuật & Profiler F9
   */
  public toggleDebug(): void {
    this.isEnabled = !this.isEnabled;
    this.debugGfx.setVisible(this.isEnabled);
    this.uiContainer.setVisible(this.isEnabled);

    if (this.isEnabled) {
      // Kích hoạt hook WebGL Draw Calls
      this.hookWebGLDrawCalls();

      // Bật Arcade Physics Debug Graphics
      if (this.scene.physics && this.scene.physics.world) {
        this.scene.physics.world.drawDebug = true;
        if (!this.scene.physics.world.debugGraphic) {
          this.scene.physics.world.createDebugGraphic();
        }
        if (this.scene.physics.world.debugGraphic) {
          this.scene.physics.world.debugGraphic.setVisible(true);
          this.scene.physics.world.debugGraphic.setDepth(999998);
        }
      }

      try {
        AudioManager.getInstance().playUIConfirm();
      } catch {
        // Ignored
      }
    } else {
      // Tắt hook WebGL Draw Calls hoàn toàn (Overhead = 0)
      this.unhookWebGLDrawCalls();

      // Nếu benchmark đang chạy thì dừng
      if (this.isBenchmarking) {
        this.isBenchmarking = false;
        this.benchmarkSamples = [];
      }
      this.closeBenchmarkModal();

      // Tắt Arcade Physics Debug Graphics
      if (this.scene.physics && this.scene.physics.world) {
        this.scene.physics.world.drawDebug = false;
        if (this.scene.physics.world.debugGraphic) {
          this.scene.physics.world.debugGraphic.clear();
          this.scene.physics.world.debugGraphic.setVisible(false);
        }
      }

      try {
        AudioManager.getInstance().playUICancel();
      } catch {
        // Ignored
      }
    }
  }

  /**
   * Lấy context WebGL từ renderer
   */
  private getWebGLContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
    const renderer = this.scene.game.renderer as any;
    if (!renderer) return null;
    if (renderer.gl) return renderer.gl;
    if (renderer.context) return renderer.context;
    if (this.scene.game.canvas) {
      return (
        (this.scene.game.canvas.getContext('webgl2') as any) ||
        (this.scene.game.canvas.getContext('webgl') as any)
      );
    }
    return null;
  }

  /**
   * Kích hoạt hook đếm lệnh vẽ WebGL (drawElements / drawArrays)
   */
  private hookWebGLDrawCalls(): void {
    if (this.isHooked) return;
    const gl = this.getWebGLContext();
    if (!gl) return;

    this.glContext = gl;
    this.originalDrawElements = gl.drawElements;
    this.originalDrawArrays = gl.drawArrays;

    const self = this;

    gl.drawElements = function(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr): void {
      self.frameDrawCalls++;
      return self.originalDrawElements.call(this, mode, count, type, offset);
    };

    gl.drawArrays = function(mode: GLenum, first: GLint, count: GLsizei): void {
      self.frameDrawCalls++;
      return self.originalDrawArrays.call(this, mode, first, count);
    };

    if ((gl as any).drawElementsInstanced) {
      this.originalDrawElementsInstanced = (gl as any).drawElementsInstanced;
      (gl as any).drawElementsInstanced = function(): any {
        self.frameDrawCalls++;
        return self.originalDrawElementsInstanced.apply(this, arguments);
      };
    }

    if ((gl as any).drawArraysInstanced) {
      this.originalDrawArraysInstanced = (gl as any).drawArraysInstanced;
      (gl as any).drawArraysInstanced = function(): any {
        self.frameDrawCalls++;
        return self.originalDrawArraysInstanced.apply(this, arguments);
      };
    }

    if ((gl as any).drawRangeElements) {
      this.originalDrawRangeElements = (gl as any).drawRangeElements;
      (gl as any).drawRangeElements = function(): any {
        self.frameDrawCalls++;
        return self.originalDrawRangeElements.apply(this, arguments);
      };
    }

    this.postRenderListener = () => {
      self.lastFrameDrawCalls = self.frameDrawCalls;
      self.frameDrawCalls = 0;
    };

    this.scene.game.events.on('postrender', this.postRenderListener);
    this.isHooked = true;
  }

  /**
   * Khôi phục hàm vẽ WebGL gốc (Overhead = 0 khi F9 tắt)
   */
  private unhookWebGLDrawCalls(): void {
    if (!this.isHooked || !this.glContext) return;

    this.glContext.drawElements = this.originalDrawElements;
    this.glContext.drawArrays = this.originalDrawArrays;

    if (this.originalDrawElementsInstanced) {
      (this.glContext as any).drawElementsInstanced = this.originalDrawElementsInstanced;
    }
    if (this.originalDrawArraysInstanced) {
      (this.glContext as any).drawArraysInstanced = this.originalDrawArraysInstanced;
    }
    if (this.originalDrawRangeElements) {
      (this.glContext as any).drawRangeElements = this.originalDrawRangeElements;
    }

    if (this.postRenderListener) {
      this.scene.game.events.off('postrender', this.postRenderListener);
      this.postRenderListener = null;
    }

    this.isHooked = false;
    this.frameDrawCalls = 0;
    this.lastFrameDrawCalls = 0;
  }

  /**
   * Tính toán chỉ số 1% Low FPS từ lịch sử frame time
   */
  private calculateOnePercentLowFps(currentFps: number): number {
    if (this.frameTimeHistory.length < 10) return Math.round(currentFps);

    const sorted = [...this.frameTimeHistory].sort((a, b) => a - b);
    const worstCount = Math.max(1, Math.ceil(sorted.length * 0.01));
    const worstSlice = sorted.slice(sorted.length - worstCount);
    const avgWorstTime = worstSlice.reduce((sum, v) => sum + v, 0) / worstCount;

    return avgWorstTime > 0 ? Math.min(60, Math.round(1000 / avgWorstTime)) : Math.round(currentFps);
  }

  /**
   * Bắt đầu phiên Chạy Thử Hiệu Năng 10 giây (F10)
   */
  public startBenchmark(): void {
    if (this.isBenchmarking) return;
    this.isBenchmarking = true;
    this.benchmarkElapsedMs = 0;
    this.benchmarkSamples = [];
    this.closeBenchmarkModal();

    try {
      AudioManager.getInstance().playUIConfirm();
    } catch {
      // Ignored
    }
  }

  /**
   * Cập nhật và thu thập mẫu trong 10 giây benchmark
   */
  private updateBenchmarkProgress(currentZoneId: ZoneId, deltaMs: number): void {
    this.benchmarkElapsedMs += deltaMs;

    const fps = this.scene.game.loop.actualFps || (deltaMs > 0 ? 1000 / deltaMs : 60);
    const cullingStats = CullingOptimizationModule.getInstance().getStats();

    this.benchmarkSamples.push({
      fps: Math.round(fps * 10) / 10,
      frameTimeMs: Math.round(deltaMs * 10) / 10,
      drawCalls: this.lastFrameDrawCalls,
      visible: cullingStats.visible,
      culled: cullingStats.culled,
      total: cullingStats.total
    });

    if (this.benchmarkElapsedMs >= this.BENCHMARK_DURATION_MS) {
      this.finishBenchmark(currentZoneId);
    }
  }

  /**
   * Kết thúc và tổng hợp kết quả Benchmark
   */
  private finishBenchmark(currentZoneId: ZoneId): void {
    this.isBenchmarking = false;
    const sampleCount = this.benchmarkSamples.length;
    if (sampleCount === 0) return;

    const fpsList = this.benchmarkSamples.map(s => s.fps);
    const avgFps = Math.round(fpsList.reduce((a, b) => a + b, 0) / sampleCount * 10) / 10;
    const minFps = Math.round(Math.min(...fpsList));
    const maxFps = Math.round(Math.max(...fpsList));

    // 1% Low của toàn bộ phiên benchmark
    const sortedTimes = this.benchmarkSamples.map(s => s.frameTimeMs).sort((a, b) => a - b);
    const worstCount = Math.max(1, Math.ceil(sortedTimes.length * 0.01));
    const worstSlice = sortedTimes.slice(sortedTimes.length - worstCount);
    const avgWorstTime = worstSlice.reduce((sum, v) => sum + v, 0) / worstCount;
    const onePercentLowFps = avgWorstTime > 0 ? Math.round(1000 / avgWorstTime) : minFps;

    const drawCallsList = this.benchmarkSamples.map(s => s.drawCalls);
    const avgDrawCalls = Math.round(drawCallsList.reduce((a, b) => a + b, 0) / sampleCount);
    const peakDrawCalls = Math.max(...drawCallsList);

    const avgFrameTimeMs = Math.round(this.benchmarkSamples.map(s => s.frameTimeMs).reduce((a, b) => a + b, 0) / sampleCount * 10) / 10;
    const avgVisible = Math.round(this.benchmarkSamples.map(s => s.visible).reduce((a, b) => a + b, 0) / sampleCount);
    const avgCulled = Math.round(this.benchmarkSamples.map(s => s.culled).reduce((a, b) => a + b, 0) / sampleCount);
    const totalObjs = this.benchmarkSamples[sampleCount - 1].total;
    const culledRatioPercent = totalObjs > 0 ? Math.round((avgCulled / totalObjs) * 1000) / 10 : 0;

    const vramTextures = this.scene.textures ? Object.keys(this.scene.textures.list).length : 0;

    const result: BenchmarkResult = {
      timestamp: new Date().toISOString(),
      zoneId: currentZoneId,
      durationSeconds: 10,
      sampleCount,
      avgFps,
      minFps,
      maxFps,
      onePercentLowFps,
      avgFrameTimeMs,
      avgDrawCalls,
      peakDrawCalls,
      avgVisibleObjects: avgVisible,
      avgCulledObjects: avgCulled,
      culledRatioPercent,
      totalObjects: totalObjs,
      vramTextures,
      tiledModules: {
        ySorting: TILED_PIPELINE_CONFIG.enableYSortingModule,
        culling: TILED_PIPELINE_CONFIG.enableCullingOptimization,
        perimeterWalls: TILED_PIPELINE_CONFIG.enableAutoPerimeterWalls
      }
    };

    this.lastBenchmarkResult = result;

    // Xuất bảng ra Console
    console.log('=== [HOLLOW WOODS V1.4] 10-SECOND STRESS BENCHMARK RESULTS ===');
    console.table({
      'Zone': result.zoneId,
      'Avg FPS': result.avgFps,
      '1% Low FPS': result.onePercentLowFps,
      'Min FPS': result.minFps,
      'Max FPS': result.maxFps,
      'Avg Frame Time (ms)': result.avgFrameTimeMs,
      'Avg Draw Calls': result.avgDrawCalls,
      'Peak Draw Calls': result.peakDrawCalls,
      'Visible Objects': result.avgVisibleObjects,
      'Culled Objects': `${result.avgCulledObjects} (${result.culledRatioPercent}%)`,
      'Total Objects': result.totalObjects,
      'VRAM Textures': result.vramTextures
    });

    // Lưu trữ localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('hw_last_benchmark_result', JSON.stringify(result, null, 2));
      }
    } catch {
      // Ignored
    }

    // Tự động tải xuống file JSON trên trình duyệt
    this.exportBenchmarkJson(result);

    // Hiển thị Modal tổng kết trên màn hình
    this.showBenchmarkModal(result);

    try {
      AudioManager.getInstance().playQuestUpdate();
    } catch {
      // Ignored
    }
  }

  /**
   * Tự động tải xuống file JSON báo cáo benchmark
   */
  private exportBenchmarkJson(result: BenchmarkResult): void {
    try {
      if (typeof window !== 'undefined' && window.document) {
        const jsonStr = JSON.stringify(result, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benchmark_report_${result.zoneId}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.warn('[HitboxDebugInspector] Auto-download JSON skipped:', err);
    }
  }

  /**
   * Hiển thị bảng tổng kết Benchmark giữa màn hình
   */
  private showBenchmarkModal(result: BenchmarkResult): void {
    this.benchmarkModalContainer.removeAll(true);
    this.isBenchmarkModalVisible = true;
    this.benchmarkModalContainer.setVisible(true);

    const modalW = 680;
    const modalH = 430;

    // Lớp phủ nền mờ
    const backdrop = this.uiScene.add.graphics();
    backdrop.fillStyle(0x000000, 0.72);
    backdrop.fillRect(-640, -360, 1280, 720);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);
    backdrop.on('pointerdown', () => this.closeBenchmarkModal());

    // Khung bảng kết quả gỗ tối viền xanh ngọc
    const cardBg = this.uiScene.add.graphics();
    cardBg.fillStyle(0x0d141e, 0.96);
    cardBg.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    cardBg.lineStyle(2, 0x00ffcc, 0.95);
    cardBg.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    cardBg.lineStyle(1, 0x334e68, 0.6);
    cardBg.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    // Tiêu đề bảng
    const titleText = HDTextHelper.createText(this.uiScene, 0, -modalH / 2 + 32, '📊 KẾT QUẢ BENCHMARK HIỆU NĂNG 10 GIÂY (F10)', {
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#00ffcc'
    });
    titleText.setOrigin(0.5);

    const subTitle = HDTextHelper.createText(this.uiScene, 0, -modalH / 2 + 56, `Khu vực: [${result.zoneId.toUpperCase()}] — Mẫu ghi nhận: ${result.sampleCount} frames (10.0s)`, {
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: '12px',
      color: '#94a3b8'
    });
    subTitle.setOrigin(0.5);

    // Nội dung phân tích kỹ thuật
    const summaryLines = [
      `🚀 TỐC ĐỘ KHUNG HÌNH (FPS):`,
      `   • FPS Trung bình   : ${result.avgFps} FPS`,
      `   • 1% Low FPS       : ${result.onePercentLowFps} FPS  (Tối thiểu: ${result.minFps} FPS, Đỉnh: ${result.maxFps} FPS)`,
      `   • Thời gian Frame  : ${result.avgFrameTimeMs} ms / frame`,
      ``,
      `🎨 WEBGL & KẾT XUẤT ĐỒ HỌA:`,
      `   • WebGL Draw Calls : ~${result.avgDrawCalls} calls/frame (Đỉnh tải: ${result.peakDrawCalls} calls)`,
      `   • Textures nạp VRAM: ${result.vramTextures} textures`,
      ``,
      `🌲 HIỆU QUẢ CULLING & VẬT THỂ:`,
      `   • Vật thể kết xuất : ${result.avgVisibleObjects} / ${result.totalObjects} đối tượng`,
      `   • Đã Cull thành công: ${result.avgCulledObjects} đối tượng (${result.culledRatioPercent}% tải)`,
      ``,
      `⚙️ TRẠNG THÁI TILED PIPELINE:`,
      `   • Y-Sorting: [${result.tiledModules.ySorting ? 'ON' : 'OFF'}]  |  Culling: [${result.tiledModules.culling ? 'ON' : 'OFF'}]  |  Perimeter: [${result.tiledModules.perimeterWalls ? 'ON' : 'OFF'}]`
    ];

    const bodyText = HDTextHelper.createText(this.uiScene, -modalW / 2 + 36, -modalH / 2 + 82, summaryLines, {
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: '12px',
      color: '#f8fafc',
      lineSpacing: 3
    });

    // Nút đóng bảng
    const closeBtnBg = this.uiScene.add.graphics();
    closeBtnBg.fillStyle(0x1e293b, 0.95);
    closeBtnBg.fillRoundedRect(-140, modalH / 2 - 46, 280, 32, 6);
    closeBtnBg.lineStyle(1.5, 0x00ffcc, 0.85);
    closeBtnBg.strokeRoundedRect(-140, modalH / 2 - 46, 280, 32, 6);

    const closeBtnText = HDTextHelper.createText(this.uiScene, 0, modalH / 2 - 30, '✖ [ESC / F10 / CLICK] ĐÓNG BẢNG', {
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#00ffcc'
    });
    closeBtnText.setOrigin(0.5);

    const hitArea = this.uiScene.add.zone(0, modalH / 2 - 30, 280, 32);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => this.closeBenchmarkModal());
    hitArea.on('pointerover', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0x334e68, 0.95);
      closeBtnBg.fillRoundedRect(-140, modalH / 2 - 46, 280, 32, 6);
      closeBtnBg.lineStyle(1.5, 0x38bdf8, 1);
      closeBtnBg.strokeRoundedRect(-140, modalH / 2 - 46, 280, 32, 6);
    });
    hitArea.on('pointerout', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0x1e293b, 0.95);
      closeBtnBg.fillRoundedRect(-140, modalH / 2 - 46, 280, 32, 6);
      closeBtnBg.lineStyle(1.5, 0x00ffcc, 0.85);
      closeBtnBg.strokeRoundedRect(-140, modalH / 2 - 46, 280, 32, 6);
    });

    this.benchmarkModalContainer.add([
      backdrop,
      cardBg,
      titleText,
      subTitle,
      bodyText,
      closeBtnBg,
      closeBtnText,
      hitArea
    ]);
  }

  /**
   * Đóng bảng kết quả Benchmark
   */
  public closeBenchmarkModal(): void {
    if (!this.isBenchmarkModalVisible) return;
    this.isBenchmarkModalVisible = false;
    this.benchmarkModalContainer.setVisible(false);
    this.benchmarkModalContainer.removeAll(true);
  }

  public isBenchmarkModalOpen(): boolean {
    return this.isBenchmarkModalVisible;
  }

  /**
   * Vẽ viền hitbox thế giới và cập nhật bảng F9 Profiler góc màn hình
   */
  private renderDebugGraphics(currentZoneId: ZoneId, deltaMs: number): void {
    this.debugGfx.clear();

    let staticColliderCount = 0;
    let dynamicCount = 0;
    let interactableCount = 0;

    // 1. VẼ TOÀN BỘ VẬT CẢN TĨNH / BIÊN BẢN ĐỒ (STATIC COLLIDERS) TỪ WORLDBUILDER
    const gameScene = this.scene as any;
    const wb = gameScene.worldBuilder;

    if (wb && wb.colliderGroup && wb.colliderGroup.getChildren) {
      const colliders = wb.colliderGroup.getChildren();
      staticColliderCount = colliders.length;

      for (let i = 0; i < colliders.length; i++) {
        const item = colliders[i];
        if (item && item.body) {
          const body = item.body as Phaser.Physics.Arcade.Body;
          if (body.enable) {
            this.debugGfx.fillStyle(0xff0000, 0.32);
            this.debugGfx.fillRect(body.x, body.y, body.width, body.height);

            this.debugGfx.lineStyle(1.5, 0xff3333, 0.95);
            this.debugGfx.strokeRect(body.x, body.y, body.width, body.height);

            this.debugGfx.fillStyle(0xffff00, 0.8);
            this.debugGfx.fillCircle(body.center.x, body.center.y, 2);
          }
        }
      }
    }

    // 2. VẼ CÁC VẬT THỂ TƯƠNG TÁC (INTERACTABLES)
    if (wb && wb.interactables && Array.isArray(wb.interactables)) {
      interactableCount = wb.interactables.length;
      for (let i = 0; i < wb.interactables.length; i++) {
        const inter = wb.interactables[i];
        if (inter) {
          this.debugGfx.fillStyle(0xf1c40f, 0.20);
          this.debugGfx.fillRect(inter.x, inter.y, inter.width, inter.height);

          this.debugGfx.lineStyle(1.5, 0xf39c12, 0.9);
          this.debugGfx.strokeRect(inter.x, inter.y, inter.width, inter.height);
        }
      }
    }

    // 3. VẼ HỘP VA CHẠM NHÂN VẬT CHÍNH (PLAYER)
    if (this.player && this.player.body) {
      dynamicCount++;
      const pBody = this.player.body as Phaser.Physics.Arcade.Body;
      
      this.debugGfx.fillStyle(0x00ff88, 0.45);
      this.debugGfx.fillRect(pBody.x, pBody.y, pBody.width, pBody.height);

      this.debugGfx.lineStyle(2, 0x00ffcc, 1);
      this.debugGfx.strokeRect(pBody.x, pBody.y, pBody.width, pBody.height);

      this.debugGfx.fillStyle(0xffffff, 1);
      this.debugGfx.fillCircle(this.player.x, this.player.y, 3);
    }

    // 4. VẼ CÁC THỰC THỂ DYNAMIC KHÁC (NPCs & MONSTERS)
    if (gameScene.listenerMonster && gameScene.listenerMonster.body) {
      dynamicCount++;
      const mBody = gameScene.listenerMonster.body as Phaser.Physics.Arcade.Body;
      this.debugGfx.fillStyle(0x9b59b6, 0.4);
      this.debugGfx.fillRect(mBody.x, mBody.y, mBody.width, mBody.height);
      this.debugGfx.lineStyle(2, 0x8e44ad, 1);
      this.debugGfx.strokeRect(mBody.x, mBody.y, mBody.width, mBody.height);
    }

    if (gameScene.skullWolves && Array.isArray(gameScene.skullWolves)) {
      for (const wolf of gameScene.skullWolves) {
        if (wolf && wolf.body) {
          dynamicCount++;
          const wBody = wolf.body as Phaser.Physics.Arcade.Body;
          this.debugGfx.fillStyle(0xe74c3c, 0.4);
          this.debugGfx.fillRect(wBody.x, wBody.y, wBody.width, wBody.height);
          this.debugGfx.lineStyle(1.5, 0xc0392b, 1);
          this.debugGfx.strokeRect(wBody.x, wBody.y, wBody.width, wBody.height);
        }
      }
    }

    if (gameScene.evilKnightsSystem && gameScene.evilKnightsSystem.getKnights) {
      const knights = gameScene.evilKnightsSystem.getKnights();
      for (const k of knights) {
        if (k && k.body) {
          dynamicCount++;
          const kBody = k.body as Phaser.Physics.Arcade.Body;
          this.debugGfx.fillStyle(0xe74c3c, 0.4);
          this.debugGfx.fillRect(kBody.x, kBody.y, kBody.width, kBody.height);
          this.debugGfx.lineStyle(1.5, 0xff0000, 1);
          this.debugGfx.strokeRect(kBody.x, kBody.y, kBody.width, kBody.height);
        }
      }
    }

    // 5. THU THẬP SỐ LIỆU ĐO LƯỜNG HIỆU NĂNG THỜI GIAN THỰC
    const px = Math.round(this.player.x);
    const py = Math.round(this.player.y);
    const actualFps = this.scene.game.loop.actualFps || (deltaMs > 0 ? 1000 / deltaMs : 60);
    const onePercentLow = this.calculateOnePercentLowFps(actualFps);
    const drawCalls = this.lastFrameDrawCalls;

    const totalGameObjects = this.scene.children ? this.scene.children.list.length : 0;
    const cullingStats = CullingOptimizationModule.getInstance().getStats();
    const vramTextures = this.scene.textures ? Object.keys(this.scene.textures.list).length : 0;

    const ySortingStatus = TILED_PIPELINE_CONFIG.enableYSortingModule ? 'ON' : 'OFF';
    const cullingStatus = TILED_PIPELINE_CONFIG.enableCullingOptimization ? 'ON' : 'OFF';
    const perimeterStatus = TILED_PIPELINE_CONFIG.enableAutoPerimeterWalls ? 'ON' : 'OFF';
    const gSettings = GraphicsQualitySystem.getInstance().getSettings();

    // Xây dựng các dòng thông số hiển thị
    const lines = [
      '⚡ [F9] PERFORMANCE PROFILER & HITBOX DEBUGGER',
      '────────────────────────────────────────────────────────',
      `📊 HIỆU NĂNG THỜI GIAN THỰC:`,
      `   • FPS Hiện tại: ${actualFps.toFixed(1)} FPS  (1% Low: ${onePercentLow} FPS)`,
      `   • Frame Time  : ${deltaMs.toFixed(1)} ms`,
      `   • Draw Calls  : ${drawCalls} calls/frame`,
      `⚙️ CHẤT LƯỢNG ĐỒ HỌA [F8]:`,
      `   • Mức cấu hình: [${gSettings.level}] (Buffer: ${gSettings.lightingScale}x, Sương: ${gSettings.maxFogLayers} lớp, Đom đóm: ${gSettings.maxFireflies})`,
      `📦 KẾT XUẤT & ĐỐI TƯỢNG (CULLING):`,
      `   • GameObjects : ${totalGameObjects} đối tượng active`,
      `   • Hiển thị    : ${cullingStats.visible} / ${cullingStats.total} (Culled: ${cullingStats.culled})`,
      `   • VRAM Textures: ${vramTextures} textures đã nạp`,
      `⚙️ TRẠNG THÁI TILED PIPELINE:`,
      `   • YSorting: [${ySortingStatus}]  |  Culling: [${cullingStatus}]  |  Walls: [${perimeterStatus}]`,
      `🎯 HITBOX & MÔI TRƯỜNG:`,
      `   • Tọa độ: X = ${px}, Y = ${py} | Phân khu: ${currentZoneId}`,
      `   • Colliders: ${staticColliderCount} | Dynamic: ${dynamicCount} | Triggers: ${interactableCount}`,
      '────────────────────────────────────────────────────────'
    ];

    if (this.isBenchmarking) {
      const remainingSec = Math.max(0, (this.BENCHMARK_DURATION_MS - this.benchmarkElapsedMs) / 1000).toFixed(1);
      const progressPercent = Math.min(100, Math.round((this.benchmarkElapsedMs / this.BENCHMARK_DURATION_MS) * 100));
      const barCount = Math.floor(progressPercent / 10);
      const progressBar = '='.repeat(barCount) + '>'.repeat(barCount < 10 ? 1 : 0) + ' '.repeat(Math.max(0, 9 - barCount));
      lines.push(`⏱️ [F10] BENCHMARK ĐANG CHẠY: ${remainingSec}s [${progressBar}] ${progressPercent}%`);
      lines.push('   (Đang thu thập mẫu FPS, Draw Calls & Culling...)');
    } else if (this.lastBenchmarkResult) {
      lines.push(`🏆 BENCHMARK GẦN NHẤT: Avg ${this.lastBenchmarkResult.avgFps} FPS | DrawCalls: ${this.lastBenchmarkResult.avgDrawCalls}`);
      lines.push('💡 [F8]: Đổi Đồ Họa  |  [F10]: Chạy lại Benchmark  |  [F9]: Tắt Profiler');
    } else {
      lines.push('💡 [F8]: Đổi Đồ Họa  |  [F10]: 10s Stress Benchmark  |  [F9]: Tắt');
    }

    this.infoText.setText(lines);

    // V1.5 (BƯỚC V15-04): Neo bảng thông số F9 vào góc dưới bên phải màn hình (hoặc cạnh phải dưới khung Nhiệm vụ),
    // kích thước box tự co giãn và cách mép phải 16px, mép đáy 16px. Tuyệt đối không đè lên cụm 4 thanh chỉ số góc trên trái.
    const bounds = this.infoText.getBounds();
    const boxW = Math.max(370, bounds.width + 20);
    const boxH = bounds.height + 16;
    const posX = Math.max(16, 1264 - boxW);
    const posY = Math.max(16, 704 - boxH);
    this.uiContainer.setPosition(posX, posY);

    // Cập nhật khung nền
    this.uiBg.clear();
    this.uiBg.fillStyle(0x0a0f16, 0.92);
    this.uiBg.fillRoundedRect(0, 0, boxW, boxH, 6);
    this.uiBg.lineStyle(1.5, this.isBenchmarking ? 0xf39c12 : 0x00ffcc, 0.95);
    this.uiBg.strokeRoundedRect(0, 0, boxW, boxH, 6);
  }

  public isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  public setDebugEnabled(enabled: boolean): void {
    if (this.isEnabled !== enabled) {
      this.toggleDebug();
    }
  }

  public destroy(): void {
    this.unhookWebGLDrawCalls();
    if (this.debugGfx) {
      this.debugGfx.destroy();
    }
    if (this.uiContainer) {
      this.uiContainer.destroy();
    }
    if (this.benchmarkModalContainer) {
      this.benchmarkModalContainer.destroy();
    }
  }
}
