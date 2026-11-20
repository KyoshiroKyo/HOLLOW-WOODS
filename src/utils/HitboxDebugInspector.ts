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
import { BlackKnightPlayer } from '../entities/BlackKnightPlayer';
import { ZoneId } from '../types';
import type { GameScene } from '../scenes/GameScene';
import { CampSanctuarySystem } from '../systems/CampSanctuarySystem';
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

const defaults = {
  showColliders: true, showHitboxes: true, showHurtboxes: false, showTriggers: true,
  showInteractRanges: true, showAIRanges: true, showCamera: false, showWorld: false,
  showSafeZones: false, enableObjectPicker: false
};

export type InspectorLayer = keyof typeof defaults;

interface InspectedEntity extends Omit<Phaser.GameObjects.GameObject, 'body'> {
  x: number;
  y: number;
  depth?: number;
  visible?: boolean;
  alpha?: number;
  originX?: number;
  originY?: number;
  scaleX?: number;
  scaleY?: number;
  texture?: { key: string };
  body?: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
  getBounds?: () => Phaser.Geom.Rectangle;
  spec?: { id?: string; name?: string };
  stats?: { health?: number };
  currentHP?: number;
  ai?: { state?: string; currentState?: string };
  anims?: Phaser.Animations.AnimationState;
  npcSprite?: { texture?: { key: string }; anims?: Phaser.Animations.AnimationState };
}

interface PickedFootprint {
  entity: InspectedEntity | null;
  visual: Phaser.Geom.Rectangle | null;
  body: Phaser.Geom.Rectangle | null;
  label: string;
}

export class HitboxDebugInspector {
  private scene: Phaser.Scene;
  private uiScene: Phaser.Scene;
  private player: BlackKnightPlayer;
  private isEnabled: boolean = false;
  private layers = { ...defaults };
  private f8Key!: Phaser.Input.Keyboard.Key;
  private debugGfx: Phaser.GameObjects.Graphics;
  private pickerLabel: Phaser.GameObjects.Text;
  private picked: PickedFootprint | null = null;
  private pickIndex = 0;
  private lastAttack: { x: number; y: number; radius: number; until: number } | null = null;
  private readonly attackHandler = (hit: { x: number; y: number; radius: number }): void => {
    if (this.isEnabled) this.lastAttack = { x: hit.x, y: hit.y, radius: hit.radius, until: this.scene.time.now + 550 };
  };

  public isPicking(): boolean { return this.isEnabled && this.layers.enableObjectPicker; }

  private bodyRect(entity: InspectedEntity): Phaser.Geom.Rectangle | null {
    const b = entity.body;
    return b && b.enable ? new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height) : null;
  }

  private describe(entity: InspectedEntity, point: Phaser.Math.Vector2): PickedFootprint {
    const visual = entity.visible === false ? null : entity.getBounds?.() ?? null;
    const body = this.bodyRect(entity);
    const b = entity.body;
    const anims = entity.anims ?? entity.npcSprite?.anims;
    const id = entity.spec?.id || entity.getData?.('id') || entity.name || entity.type;
    const key = entity.texture?.key ?? entity.npcSprite?.texture?.key ?? '—';
    const hp = entity.stats?.health ?? entity.currentHP;
    const camera = this.scene.cameras.main;
    const name = entity.spec?.name || entity.name || entity.type;
    const debugWorld = `${Math.round(point.x)}, ${Math.round(point.y)}`;
    const label = [
      `${name} · ${id} · ${key}`,
      `World (${Math.round(entity.x)}, ${Math.round(entity.y)}) · trỏ (${debugWorld}) · depth ${entity.depth ?? 0}`,
      `Origin ${entity.originX ?? '—'},${entity.originY ?? '—'} · scale ${entity.scaleX ?? '—'},${entity.scaleY ?? '—'}`,
      `Visual ${visual ? `${Math.round(visual.width)}×${Math.round(visual.height)}` : '—'} · Collider ${body ? `${body.width}×${body.height} @ ${Math.round(body.x)},${Math.round(body.y)}` : '—'}`,
      `Body ${b ? (b.physicsType === Phaser.Physics.Arcade.STATIC_BODY ? 'static' : 'dynamic') : '—'} · offset ${b ? `${b.offset.x},${b.offset.y}` : '—'}`,
      `HP ${hp ?? '—'} · AI ${entity.ai?.currentState ?? entity.ai?.state ?? '—'} · ${anims?.currentAnim?.key ?? '—'} #${anims?.currentFrame?.index ?? '—'}`,
      `Zoom ${camera.zoom.toFixed(2)}× · ${(this.scene as GameScene).getCurrentZoneId()}`
    ].join('\n');
    return { entity, visual, body, label };
  }

  private clearPick(): void {
    this.picked = null;
    this.pickIndex = 0;
    this.pickerLabel.setVisible(false);
  }

  private readonly pickerHandler = (pointer: Phaser.Input.Pointer): void => {
    if (!this.isPicking() || pointer.button !== 0) return;
    const camera = this.scene.cameras.main;
    const point = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    const world = this.scene as GameScene;
    const builder = (world as any).worldBuilder;
    const hits: PickedFootprint[] = [];

    this.scene.children.depthSort();
    for (const child of this.scene.children.list.slice().reverse() as InspectedEntity[]) {
      if (!child.active || child.visible !== true || child.alpha === 0 || child.cameraFilter & camera.id ||
          !['Sprite', 'Image', 'Container', 'TileSprite', 'NineSlice'].includes(child.type)) continue;
      if (child.getBounds?.().contains(point.x, point.y)) hits.push(this.describe(child, point));
    }
    for (const child of builder?.colliderGroup.getChildren() ?? []) {
      if (hits.some(hit => hit.entity === child)) continue;
      if (this.bodyRect(child)?.contains(point.x, point.y)) hits.push(this.describe(child, point));
    }
    for (const transition of builder?.getTransitions() ?? []) {
      if (transition.fromZone !== world.getCurrentZoneId()) continue;
      const b = transition.triggerRect;
      const bounds = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
      if (bounds.contains(point.x, point.y)) {
        hits.push({ entity: null, body: bounds, visual: null, label: `Trigger ${transition.id} · ${transition.fromZone} → ${transition.toZone}
${b.x}, ${b.y} · ${b.width}×${b.height}` });
      }
    }
    if (!hits.length) { this.clearPick(); return; }
    this.pickIndex = pointer.event?.shiftKey ? (this.pickIndex + 1) % hits.length : 0;
    const hit = hits[this.pickIndex];
    this.picked = hit;
    const x = Phaser.Math.Clamp(pointer.x + 10, 12, 860);
    const y = Phaser.Math.Clamp(pointer.y - 116, 12, 620);
    this.pickerLabel.setText(`${hit.label}
${this.pickIndex + 1}/${hits.length} · Shift+click để chọn lớp dưới`);
    this.pickerLabel.setPosition(x, y).setVisible(true);
  };

  private cameraTrace: string[] = [];
  private nextTraceTime = 0;
  private frameTimes: number[] = [];

  private updateDiagnostics(zoneId: ZoneId, deltaMs: number): void {
    if (Number.isFinite(deltaMs) && deltaMs > 0) {
      this.frameTimes.push(deltaMs);
      if (this.frameTimes.length > 120) this.frameTimes.shift();
    }
    const now = this.scene.time.now;
    if (now < this.nextTraceTime) return;
    this.nextTraceTime = now + 250;
    const camera = this.scene.cameras.main;
    const p = this.player;
    const camp = CampSanctuarySystem.getInstance();
    const flags = [camera.shakeEffect.isRunning && 'shake', camera.flashEffect.isRunning && 'flash',
      camera.fadeEffect.isRunning && 'fade', camera.panEffect.isRunning && 'pan'].filter(Boolean);
    const cameraRuntime = camera as unknown as { _follow?: unknown; rotation?: number };
    const follow = cameraRuntime._follow === p ? 'player' : 'other/none';
    this.cameraTrace.push(`${Math.round(now)}ms ${zoneId} @ ${Math.round(p.x)},${Math.round(p.y)} · ` +
      `scroll ${Math.round(camera.scrollX)},${Math.round(camera.scrollY)} · rot ${cameraRuntime.rotation?.toFixed(3) ?? '—'} · zoom ${camera.zoom.toFixed(2)} · follow ${follow} · ` +
      `FX ${flags.join(',') || '—'} · camp ${camp.isPlayerInSanctuary(p.x, p.y, zoneId)} · ` +
      `Tinh Thần ${p.stats.composure.toFixed(1)} · v ${Math.round(p.body?.velocity.x ?? 0)},${Math.round(p.body?.velocity.y ?? 0)}`);
    if (this.cameraTrace.length > 24) this.cameraTrace.shift();
  }

  public getProfilerInfo(): string {
    const culling = CullingOptimizationModule.getInstance().getStats();
    const world = this.scene as GameScene;
    const runtime = world as any;
    const zoneId = world.getCurrentZoneId();
    const triggers = runtime.worldBuilder?.getTransitions().filter((t: { fromZone: string }) => t.fromZone === zoneId).length ?? 0;
    const frames = this.frameTimes;
    const worst = [...frames].sort((a, b) => b - a).slice(0, Math.ceil(frames.length / 100));
    const low = worst.length ? (1000 * worst.length / worst.reduce((sum, ms) => sum + ms, 0)).toFixed(1) : '—';
    const benchmark = this.isBenchmarking
      ? `F10 đang đo ${(this.benchmarkElapsedMs / 1000).toFixed(1)}s`
      : this.lastBenchmarkResult ? `F10 ${this.lastBenchmarkResult.avgFps} FPS trung bình` : 'F10 đo 10 giây';
    return [
      `1% low ${low} FPS · ${frames.length} frame · draw calls ${this.isHooked ? this.lastFrameDrawCalls : '—'}`,
      `Cullable hiển thị ${culling.visible}/${culling.total} · Texture ${Object.keys(this.scene.textures.list).length}`,
      `Trigger vùng ${triggers} · F8 ${GraphicsQualitySystem.getInstance().getSettings().level} · ${benchmark}`
    ].join(String.fromCharCode(10));
  }

  public getBugInfo(): string {
    const scene = this.scene as GameScene;
    const camera = scene.cameras.main;
    const view = camera.worldView;
    const clamp = camera.getBounds();
    const world = scene.physics.world.bounds;
    const p = this.player;
    const rounded = (r: Phaser.Geom.Rectangle) => [r.x, r.y, r.width, r.height].map(value => Math.round(value)).join(', ');
    const audio = AudioManager.getInstance().getPlaybackDiagnostics();
    const flags = ['east_gate_unlocked', 'mire_unlocked', 'mire_pillars_solved', 'shrine_unlocked']
      .filter(flag => (scene as any).playerState.hasFlag(flag));
    return [
      `HOLLOW WOODS QA · ${scene.getCurrentZoneId()}`,
      `Player ${Math.round(p.x)}, ${Math.round(p.y)} · Canvas ${scene.game.scale.width}×${scene.game.scale.height}`,
      `Camera ${rounded(view)} · bounds ${rounded(clamp)} · zoom ${camera.zoom.toFixed(2)}`,
      `Physics world ${rounded(world)} · frame ${scene.game.loop.delta.toFixed(2)} ms · FPS ${scene.game.loop.actualFps.toFixed(1)}`,
      `Animation ${p.anims.currentAnim?.key ?? '—'} #${p.anims.currentFrame?.index ?? '—'}`,
      `Vòng Sáng ${p.stats.isLanternOn ? 'bật' : 'tắt'} · Quest ${(scene as any).playerState.currentQuestId ?? '—'} · Cổng ${flags.join(', ') || '—'}`,
      `Audio ${audio.context} · ambience ${audio.ambience ?? '—'} · BGM ${audio.bgm ?? '—'} · gain ${audio.gain?.toFixed(3) ?? '—'} · loop ${audio.loop ?? '—'}`,
      this.picked?.label ?? 'Chưa chọn đối tượng',
      'Camera và trạng thái quan sát · 250 ms/mẫu',
      ...this.cameraTrace
    ].join('\n');
  }

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

  // Quản lý Benchmark 10 giây (F10)
  private isBenchmarking: boolean = false;
  private benchmarkElapsedMs: number = 0;
  private readonly BENCHMARK_DURATION_MS: number = 10000;
  private benchmarkSamples: BenchmarkSample[] = [];
  public lastBenchmarkResult: BenchmarkResult | null = null;

  constructor(scene: Phaser.Scene, player: BlackKnightPlayer, uiScene?: Phaser.Scene) {
    this.scene = scene;
    this.uiScene = uiScene || scene;
    this.player = player;

    // Graphics vẽ trên layer cao nhất của GameScene
    this.debugGfx = this.scene.add.graphics();
    this.debugGfx.setDepth(999999);
    this.debugGfx.setVisible(false);
    this.pickerLabel = this.createPickerLabel();
    this.scene.input.on('pointerdown', this.pickerHandler);
    this.player.on('player_attack', this.attackHandler);

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
      this.scene.input.keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.F8);
    }

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

  private createPickerLabel(): Phaser.GameObjects.Text {
    return this.uiScene.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffffff', backgroundColor: '#101820',
      wordWrap: { width: 410 }, padding: { x: 5, y: 4 }
    }).setDepth(100011).setScrollFactor(0).setVisible(false);
  }

  public setUIScene(uiScene: Phaser.Scene): void {
    if (this.uiScene !== uiScene) {
      if (this.benchmarkModalContainer) {
        this.benchmarkModalContainer.destroy();
      }
      this.pickerLabel.destroy();
      this.uiScene = uiScene;
      this.pickerLabel = this.createPickerLabel();
      this.picked = null;

      this.createBenchmarkModalUI();
    }
  }

  /**
   * Vòng lặp cập nhật chính mỗi frame
   */
  public update(currentZoneId: ZoneId, delta?: number): void {
    const deltaMs = delta !== undefined ? delta : (this.scene.game.loop.delta || 16.6);

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

    // Tiến trình Benchmark 10s tự động
    if (this.isBenchmarking) {
      this.updateBenchmarkProgress(currentZoneId, deltaMs);
    }

    this.updateDiagnostics(currentZoneId, deltaMs);
    this.renderDebugGraphics(currentZoneId);
  }

  /**
   * Bật / Tắt chế độ kiểm tra kỹ thuật & Profiler F9
   */
  public toggleDebug(): void {
    this.isEnabled = !this.isEnabled;
    this.debugGfx.setVisible(this.isEnabled);
    if (!this.isEnabled) { this.debugGfx.clear(); this.clearPick(); this.lastAttack = null; this.cameraTrace = []; this.frameTimes = []; this.nextTraceTime = 0; }

    if (this.isEnabled) {
      // Kích hoạt hook WebGL Draw Calls
      this.hookWebGLDrawCalls();

      // Vẽ từng lớp bằng debugGfx để các công tắc lớp hoạt động độc lập.
      if (this.scene.physics && this.scene.physics.world) {
        this.scene.physics.world.drawDebug = false;
        if (this.scene.physics.world.debugGraphic) {
          this.scene.physics.world.debugGraphic.clear();
          this.scene.physics.world.debugGraphic.setVisible(false);
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

  public setLayerOptions(options: Partial<Record<InspectorLayer, boolean>>): void {
    this.layers = { ...this.layers, ...options };
    if (!this.layers.enableObjectPicker) this.clearPick();
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
   * Bắt đầu phiên Chạy Thử Hiệu Năng 10 giây (F10)
   */
  public toggleBenchmark(): void {
    if (!this.isEnabled) return;
    if (this.isBenchmarkModalVisible) this.closeBenchmarkModal();
    else if (!this.isBenchmarking) this.startBenchmark();
  }

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
  private renderDebugGraphics(currentZoneId: ZoneId): void {
    this.debugGfx.clear();

    const gameScene = this.scene as GameScene;
    const runtime = gameScene as any;
    const builder = runtime.worldBuilder;
    const physics = this.scene.physics.world;
    const camera = this.scene.cameras.main;
    const view = camera.worldView;
    const staticBodies = physics.staticBodies;
    const dynamicBodies = physics.bodies;

    if (this.layers.showColliders) {
      for (const bodies of [staticBodies, dynamicBodies]) {
        const color = bodies === staticBodies ? 0xff5555 : 0x30dfbb;
        this.debugGfx.lineStyle(1.3, color, 0.95);
        this.debugGfx.fillStyle(color, 0.20);
        for (const body of bodies) {
          if (!body.enable || body.right < view.left || body.left > view.right ||
              body.bottom < view.top || body.top > view.bottom) continue;
          this.debugGfx.fillRect(body.x, body.y, body.width, body.height);
          this.debugGfx.strokeRect(body.x, body.y, body.width, body.height);
        }
      }
    }

    if (this.layers.showTriggers) {
      this.debugGfx.lineStyle(2, 0xf4a630, 0.95);
      for (const transition of builder?.getTransitions() ?? []) {
        if (transition.fromZone !== currentZoneId) continue;
        const { x, y, width, height } = transition.triggerRect;
        this.debugGfx.strokeRect(x, y, width, height);
      }
    }
    if (this.layers.showInteractRanges) {
      this.debugGfx.lineStyle(1.2, 0xf3e76b, 0.72);
      for (const inter of builder?.interactables ?? []) {
        if (!view.contains(inter.x, inter.y)) continue;
        this.debugGfx.strokeRect(inter.x, inter.y, inter.width, inter.height);
        if (inter.triggerDist) this.debugGfx.strokeCircle(inter.x, inter.y, inter.triggerDist);
      }
    }

    if (this.layers.showHitboxes && this.lastAttack && this.scene.time.now <= this.lastAttack.until) {
      const { x, y, radius } = this.lastAttack;
      this.debugGfx.lineStyle(2, 0xff6d4a, 0.95);
      this.debugGfx.fillStyle(0xff6d4a, 0.22);
      this.debugGfx.fillCircle(x, y, radius);
      this.debugGfx.strokeCircle(x, y, radius);
    }
    if (this.layers.showHurtboxes && runtime.listenerMonster?.active) {
      // Corresponds to the extra tolerance used by the player hit test.
      const listener = runtime.listenerMonster;
      this.debugGfx.lineStyle(1.5, 0xf68de8, 0.95);
      this.debugGfx.strokeCircle(listener.x, listener.y, 24);
    }
    if (this.layers.showAIRanges && runtime.listenerMonster?.active && Number.isFinite(runtime.listenerMonster.hearingRadius)) {
      const listener = runtime.listenerMonster;
      this.debugGfx.lineStyle(1.5, 0x55d6ff, 0.85);
      this.debugGfx.strokeCircle(listener.x, listener.y, listener.hearingRadius);
      if (this.player.stats.isLanternOn) {
        this.debugGfx.lineStyle(1, 0xffd166, 0.8);
        this.debugGfx.strokeCircle(listener.x, listener.y, listener.hearingRadius * 1.3);
      }
    }
    if (this.layers.showSafeZones) {
      const camp = CampSanctuarySystem.getInstance();
      this.debugGfx.lineStyle(1.6, 0x61d577, 0.85);
      this.debugGfx.strokeCircle(camp.campfireX, camp.campfireY, camp.sanctuaryRadius);
      this.debugGfx.strokeCircle(camp.knightX, camp.knightY, camp.sanctuaryRadius);
      const light = this.player.getLanternWorldPosition();
      if (light.isVisible && Number.isFinite(runtime.currentLanternRadius)) {
        this.debugGfx.lineStyle(1.6, 0xffbf42, 0.85);
        this.debugGfx.strokeCircle(light.x, light.y, runtime.currentLanternRadius * 0.82);
      }
    }
    if (this.layers.showCamera) {
      const clamp = camera.getBounds();
      this.debugGfx.lineStyle(2, 0x80b2ff, 0.9);
      this.debugGfx.strokeRect(clamp.x, clamp.y, clamp.width, clamp.height);
      this.debugGfx.lineStyle(1, 0xc5dbff, 0.95);
      this.debugGfx.strokeRect(view.x + 2, view.y + 2, view.width - 4, view.height - 4);
    }
    if (this.layers.showWorld) {
      const world = physics.bounds;
      const zone = builder?.getZone(currentZoneId)?.bounds;
      this.debugGfx.lineStyle(2.3, 0xc879ed, 0.9);
      this.debugGfx.strokeRect(world.x, world.y, world.width, world.height);
      if (zone) {
        this.debugGfx.lineStyle(1.5, 0xffdfef, 0.9);
        this.debugGfx.strokeRect(zone.x, zone.y, zone.width, zone.height);
      }
    }
    if (this.picked?.entity && !this.picked.entity.scene) this.clearPick();
    if (this.picked) {
      const { entity } = this.picked;
      const visual = entity?.getBounds?.() ?? this.picked.visual;
      const body = entity ? this.bodyRect(entity) : this.picked.body;
      const footprint = visual ?? body;
      if (!footprint || !Phaser.Geom.Intersects.RectangleToRectangle(view, footprint)) {
        this.clearPick();
      } else {
        if (visual) {
          this.debugGfx.lineStyle(2, 0x52e6ff, 0.95);
          this.debugGfx.strokeRect(visual.x, visual.y, visual.width, visual.height);
        }
        if (body) {
          this.debugGfx.lineStyle(2, 0xff704f, 0.95);
          this.debugGfx.strokeRect(body.x, body.y, body.width, body.height);
        }
      }
    }

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
    this.scene.input.off('pointerdown', this.pickerHandler);
    this.player.off('player_attack', this.attackHandler);
    this.pickerLabel?.destroy();
    this.unhookWebGLDrawCalls();
    if (this.debugGfx) {
      this.debugGfx.destroy();
    }
    if (this.benchmarkModalContainer) {
      this.benchmarkModalContainer.destroy();
    }
  }
}
