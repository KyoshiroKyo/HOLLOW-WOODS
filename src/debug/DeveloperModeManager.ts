import * as Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { QA_BUILD } from './DevSessionPolicy';
import { QuestSystem } from '../systems/QuestSystem';
import { TIME_CONFIG, type TimePhase } from '../config/TimeConfig';
import type { ZoneId } from '../types';
import type { GameScene } from '../scenes/GameScene';
import { SafeSpawnResolver } from '../systems/SafeSpawnResolver';
import { ContentRegistry } from '../registry/ContentRegistry';
import zonesData from '../data/zones.json';
import itemsData from '../data/items.json';

export interface DeveloperLogEntry {
  level: 'ERROR' | 'WARN';
  time: string;
  message: string;
  count: number;
}

export interface DeveloperPerfSnapshot {
  fps: number | null;
  frameTimeMs: number | null;
  gameObjectCount: number | null;
  colliderCount: number | null;
  staticBodyCount: number | null;
  dynamicBodyCount: number | null;
  jsHeapMb: number | null;
  player: { x: number; y: number } | null;
  zoneId: string | null;
  currentBGM: string | null;
  currentAmbience: string | null;
  isHeartbeatActive: boolean | null;
  isSanityDucked: boolean | null;
}

type DiagnosticEntity = Phaser.GameObjects.Sprite & {
  spec?: { id?: string; name?: string; runtimeKey?: string };
  body?: Phaser.Physics.Arcade.Body;
  currentHp?: number;
  hp?: number;
  maxHp?: number;
  stats?: { health: number; maxHealth: number; isSprinting: boolean };
  wolfState?: string;
  knightState?: string;
  bossState?: string;
  horseState?: string;
};
const QA_ENTITY_FACTORIES = new Map<string, 'skull_wolf' | 'fallen_knight'>([
  ['mon_skull_wolf', 'skull_wolf'],
  ['mon_fallen_knight', 'fallen_knight']
] as const);
export class DeveloperModeManager {
  private static instance: DeveloperModeManager | null = null;
  private enabled = false;
  public get isEnabled(): boolean { return this.enabled; }
  private devSession = false;
  public get isDevSession(): boolean { return this.devSession; }
  public errorCount = 0;
  public warnCount = 0;
  private logs: DeveloperLogEntry[] = [];
  private gameScene: GameScene | null = null;
  public isNoclip = false;
  public speedMultiplier: 1 | 2 | 3 = 1;
  public combatSpeedMultiplier: 1 | 2 | 3 = 1;
  public isGodMode = false;
  public isInfiniteStamina = false;
  public isInfiniteComposure = false;
  public isFreezeAI = false;
  public freezeTime = false;
  public fogEnabled = true;
  public rainEnabled = true;
  private rainBeforeOverride: boolean | null = null;

  private constructor() {
    if (QA_BUILD) this.installErrorCatcher();
  }

  public static getInstance(): DeveloperModeManager {
    if (!DeveloperModeManager.instance) DeveloperModeManager.instance = new DeveloperModeManager();
    return DeveloperModeManager.instance;
  }

  public canToggleWithSimpleF9(): boolean { return QA_BUILD; }

  public canReportProgress(): boolean { return !QA_BUILD && !this.devSession; }

  public markDevUsed(): boolean {
    if (!QA_BUILD) return false;
    this.devSession = true;
    return true;
  }

  private canMutate(): boolean { return this.isEnabled && this.markDevUsed(); }

  public setEnabled(enabled: boolean): void {
    if (enabled && !this.markDevUsed()) return;
    if (!enabled && this.enabled) this.clearTransientControls();
    this.enabled = enabled;
  }

  public attachGameScene(scene: GameScene, continuing: boolean): void {
    this.gameScene = scene;
    this.devSession = QA_BUILD && continuing;
    this.enabled = false;
  }

  public detachGameScene(): void {
    this.setEnabled(false);
    this.gameScene = null;
  }

  private runtime(): any { return this.gameScene as any; }

  public setNoclip(enabled: boolean): void {
    if (!this.canMutate()) return;
    this.isNoclip = enabled;
    const body = this.runtime()?.player?.body;
    if (body?.enable) body.checkCollision.none = enabled;
  }

  public setSpeedMultiplier(mult: 1 | 2 | 3): void {
    if (this.canMutate() && [1, 2, 3].includes(mult)) this.speedMultiplier = mult;
  }

  public setCombatSpeedMultiplier(mult: 1 | 2 | 3): void {
    if (this.canMutate() && [1, 2, 3].includes(mult)) this.combatSpeedMultiplier = mult;
  }

  public getCombatSpeedMultiplier(): number {
    return this.isEnabled ? this.combatSpeedMultiplier : 1;
  }

  public teleportToCoords(x: number, y: number): void {
    if (!this.canMutate() || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const scene = this.runtime();
    const zone = scene?.worldBuilder?.detectCurrentZone({ x, y });
    if (zone) this.gameScene?.teleportForDeveloper(zone, x, y);
  }

  public teleportToZone(zoneId: string): void {
    if (!this.canMutate()) return;
    const zone = zonesData.zones.find(entry => entry.id === zoneId);
    if (zone) this.gameScene?.teleportForDeveloper(zone.id as ZoneId, zone.defaultSpawn.x, zone.defaultSpawn.y);
  }

  public teleportToNPC(npcId: string): void {
    if (!this.canMutate()) return;
    const target = this.getNearbyEntities().find(entity => entity.id === npcId);
    if (target) this.teleportToCoords(target.x, target.y + 34);
  }

  public setGodMode(enabled: boolean): void { if (this.canMutate()) this.isGodMode = enabled; }
  public setInfiniteStamina(enabled: boolean): void { if (this.canMutate()) this.isInfiniteStamina = enabled; }
  public setInfiniteComposure(enabled: boolean): void { if (this.canMutate()) this.isInfiniteComposure = enabled; }

  public refillStats(): void {
    const stats = this.runtime()?.playerState?.stats;
    if (stats) this.setStats({ hp: stats.maxHealth, stamina: stats.maxStamina, composure: stats.maxComposure });
  }

  public setStats(values: { hp?: number; stamina?: number; composure?: number }): void {
    if (!this.canMutate()) return;
    const state = this.runtime()?.playerState;
    if (!state) return;
    const stats = state.stats;
    if (typeof values.hp === 'number' && Number.isFinite(values.hp)) stats.health = Phaser.Math.Clamp(values.hp, 0, stats.maxHealth);
    if (typeof values.stamina === 'number' && Number.isFinite(values.stamina)) stats.stamina = Phaser.Math.Clamp(values.stamina, 0, stats.maxStamina);
    if (typeof values.composure === 'number' && Number.isFinite(values.composure)) stats.composure = Phaser.Math.Clamp(values.composure, 0, stats.maxComposure);
    state.emit('stats_changed', stats);
  }

  public giveItem(itemId: string, count: number): void {
    if (!this.canMutate()) return;
    if (itemsData.items.some(item => item.id === itemId) && Number.isInteger(count) && count > 0) {
      this.runtime()?.playerState?.addItem(itemId, count);
    }
  }

  public unlockAllGatesAndSeals(): void {
    if (!this.canMutate()) return;
    const scene = this.runtime();
    if (!scene) return;
    for (const flag of ['east_gate_unlocked', 'ancient_root_seal_unlocked', 'mire_unlocked', 'shrine_unlocked', 'mire_pillars_solved', 'bellhollow_ward_seal_broken']) {
      scene.playerState.setFlag(flag);
    }
    scene.worldBuilder.syncAllWorldGates(scene.playerState);
  }

  public jumpToQuestStage(stage: number): void {
    if (!this.canMutate()) return;
    const quests = QuestSystem.getInstance();
    if (stage === 0 || quests.getStage(stage)) {
      quests.setDeveloperStagePreview(stage || null);
      this.runtime()?.uiScene?.updateQuestTracker();
    }
  }

  public setTimePhase(phase: TimePhase): void {
    if (!this.canMutate() || !TIME_CONFIG.phases[phase]) return;
    const { DAY, DUSK, NIGHT } = TIME_CONFIG.phases;
    const midpoints = { DAY: DAY.duration / 2, DUSK: DAY.duration + DUSK.duration / 2,
      NIGHT: DAY.duration + DUSK.duration + NIGHT.duration / 2 };
    this.runtime()?.timeSystem?.setTimeOfDay(midpoints[phase]);
  }

  public setFreezeTime(enabled: boolean): void { if (this.canMutate()) this.freezeTime = enabled; }

  public setFogEnabled(enabled: boolean): void {
    if (!this.canMutate()) return;
    this.fogEnabled = enabled;
    this.runtime()?.fogOfWarLayer?.setVisible(enabled);
  }

  public setRainEnabled(enabled: boolean): void {
    if (!this.canMutate()) return;
    this.rainEnabled = enabled;
    const weather = this.runtime()?.weatherSystem;
    if (!weather) return;
    this.rainBeforeOverride ??= weather.getCurrentWeather() === 'MIST_RAIN';
    if (enabled) weather.startRain();
    else weather.stopRain();
  }

  public triggerEnding(ending: 'true' | 'sacrifice' | 'fog_loop'): void {
    if (!this.canMutate()) return;
    const names = { true: 'true_ending', sacrifice: 'sacrifice_ending', fog_loop: 'fog_loop_ending' } as const;
    if (names[ending]) this.runtime()?.endingSystem?.playEndingPresentation(names[ending]);
  }

  public setFreezeAI(enabled: boolean): void {
    if (!this.canMutate()) return;
    this.isFreezeAI = enabled;
    if (enabled) {
      this.runtime()?.listenerMonster?.setVelocity(0, 0);
      this.runtime()?.mireWardenBoss?.body?.setVelocity(0, 0);
      this.runtime()?.wildlifeSystem?.stopDebugMotion();
    }
  }

  public getSpawnableCatalog() {
    if (!QA_BUILD) return [];
    const registry = ContentRegistry.getInstance();
    return [...QA_ENTITY_FACTORIES.keys()].flatMap(runtimeKey => {
      const entry = registry.getByRuntimeKey(runtimeKey);
      return entry ? [{ runtimeKey, name: entry.nameVi }] : [];
    });
  }

  public spawnTestMonster(runtimeKey: string): void {
    if (!this.canMutate()) return;
    const factory = QA_ENTITY_FACTORIES.get(runtimeKey);
    const scene = this.runtime();
    if (!factory || !scene?.player || !ContentRegistry.getInstance().getByRuntimeKey(runtimeKey)) return;
    const { x, y } = scene.player;
    const zone = scene.currentZoneId;
    const position = SafeSpawnResolver.resolveSafeSpawn(scene, x + 80, y, zone);
    if (!position || Math.hypot(position.x - x, position.y - y) < 32) return;
    scene.wildlifeSystem?.spawnDebugCreature(factory, position.x, position.y);
  }

  public getNearbyEntities(): Array<{ id: string; name: string; x: number; y: number }> {
    const scene = this.runtime();
    if (!scene?.player) return [];
    const entities = scene.npcs.map((npc: { spec: { id: string; name: string }; x: number; y: number }) =>
      ({ id: npc.spec.id, name: npc.spec.name || npc.spec.id, x: npc.x, y: npc.y }));
    const listener = scene.listenerMonster;
    if (listener?.active) entities.push({ id: 'listener', name: 'Kẻ Lắng Nghe', x: listener.x, y: listener.y });
    return entities;
  }

  public getEntitySnapshot() {
    const scene = this.runtime();
    if (!QA_BUILD || !this.isEnabled || !scene?.player) return null;

    const registry = ContentRegistry.getInstance();
    const wildlife = scene.wildlifeSystem;
    const groups: Array<{ type: string; key?: string; entities: Array<DiagnosticEntity | null> }> = [
      { type: 'player', entities: [scene.player] },
      { type: 'npc', entities: scene.npcs },
      { type: 'enemy', key: 'mon_the_listener', entities: [scene.listenerMonster] },
      { type: 'enemy', key: 'mon_skull_wolf', entities: wildlife.getSkullWolves() },
      { type: 'enemy', key: 'mon_shadow_crow', entities: wildlife.getShadowCrows() },
      { type: 'enemy', key: 'mon_shadow_eyes', entities: wildlife.getShadowEyes() },
      { type: 'enemy', key: 'mon_fallen_knight', entities: wildlife.getFallenKnights() },
      { type: 'enemy', key: 'mon_dread_horseman', entities: wildlife.getDreadHorsemen() },
      { type: 'enemy', entities: [...wildlife.getMistBats(), ...wildlife.getWanderingShades(), ...wildlife.getGoblinScouts()] },
      { type: 'boss', key: 'mon_mire_warden', entities: [scene.mireWardenBoss] },
      { type: 'boss', key: 'boss_hooded_knight', entities: [wildlife.getHoodedKnight()] },
      { type: 'boss', key: 'boss_shadow_behemoth', entities: [wildlife.getShadowBehemoth()] },
      { type: 'apparition', entities: scene.knightApparitions },
      { type: 'ambient', entities: wildlife.getEntities() }
    ];

    const active = groups.flatMap(({ type, key, entities }) => entities.filter((e): e is DiagnosticEntity => Boolean(e?.active)).map(e => {
      const texture = e.texture?.key ?? null;
      const frame = e.frame?.name ?? null;
      const animation = e.anims?.currentAnim?.key ?? null;
      const body = e.body;
      const id = e.spec?.id || e.name || null;
      const runtimeKey = key ?? e.spec?.runtimeKey ?? (type === 'npc' ? e.spec?.id : null) ?? null;
      const zone = scene.worldBuilder.detectCurrentZone({ x: e.x, y: e.y });
      const issues: string[] = [];
      if (type === 'player' && SafeSpawnResolver.isPositionBlocked(scene, e.x, e.y)) issues.push('player_foot_overlap');
      if (!texture || texture === '__MISSING' || !scene.textures.exists(texture)) issues.push('missing_texture');
      if (animation && !scene.anims.exists(animation)) issues.push('animation_not_registered');
      if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) issues.push('invalid_position');
      const bounds = scene.worldBuilder.getZone(zone)?.bounds;
      if (bounds && (e.x < bounds.x || e.x > bounds.x + bounds.width ||
          e.y < bounds.y || e.y > bounds.y + bounds.height)) issues.push('position_outside_zone');
      if (body?.enable && (body.width <= 0 || body.height <= 0)) issues.push('invalid_collision_bounds');
      if (type === 'apparition' && body?.enable) issues.push('unexpected_apparition_collision');
      if (type === 'player' && animation && /_(walk|run)_/.test(animation) &&
          animation.includes('_run_') !== Boolean(e.stats?.isSprinting)) issues.push('gait_mismatch');
      if (runtimeKey && !registry.getByRuntimeKey(runtimeKey)) issues.push('runtime_key_not_registered');

      return {
        id, name: e.spec?.name || e.name || e.constructor.name, type, zone, runtimeKey,
        x: e.x, y: e.y, texture, frame, animation, qaOnly: e.getData('qaSpawn') === true,
        currentHp: e.currentHp ?? e.hp ?? e.stats?.health ?? null,
        maxHp: e.maxHp ?? e.stats?.maxHealth ?? null,
        state: e.wolfState ?? e.knightState ?? e.bossState ?? e.horseState ?? e.state ?? null,
        collider: body?.enable ? { x: body.x, y: body.y, width: body.width, height: body.height } : null,
        issues
      };
    }));
    const seenIds = new Set<string>();
    for (const entity of active) {
      if (!entity.id) continue;
      const key = `${entity.zone}/${entity.type}/${entity.id}`;
      if (seenIds.has(key)) entity.issues.push('duplicate_active_id');
      seenIds.add(key);
    }

    const catalog = registry.getAllEntries()
      .filter(entry => ['NPC', 'MON', 'ANI', 'MOD', 'AST'].includes(entry.type))
      .map(entry => ({
        id: entry.id, type: entry.type, name: entry.nameVi, runtimeKey: entry.runtimeKey,
        status: entry.status, qaSpawnable: QA_ENTITY_FACTORIES.has(entry.runtimeKey),
        assets: (entry.assetRefs ?? []).map(id => ({ id, filePath: registry.getAsset(id)?.filePath ?? null }))
      }));
    return {
      capturedAt: new Date().toISOString(),
      build: (import.meta as ImportMeta & { env?: { VITE_BUILD_SHA?: string } }).env?.VITE_BUILD_SHA ?? null,
      zone: scene.currentZoneId,
      active,
      catalog,
      registryChecks: registry.validateRegistry(),
      performance: this.getPerfSnapshot(),
      log: this.getLogs()
    };
  }

  private clearTransientControls(): void {
    const scene = this.runtime();
    const body = scene?.player?.body;
    if (this.isNoclip && body?.enable) body.checkCollision.none = false;
    if (!this.fogEnabled) scene?.fogOfWarLayer?.setVisible(true);
    if (this.rainBeforeOverride !== null && scene?.weatherSystem) {
      if (this.rainBeforeOverride) scene.weatherSystem.startRain();
      else scene.weatherSystem.stopRain();
    }
    this.isNoclip = false;
    this.speedMultiplier = 1;
    this.combatSpeedMultiplier = 1;
    this.isGodMode = false;
    this.isInfiniteStamina = false;
    this.isInfiniteComposure = false;
    this.isFreezeAI = false;
    this.freezeTime = false;
    this.fogEnabled = true;
    this.rainEnabled = true;
    this.rainBeforeOverride = null;
    QuestSystem.getInstance().setDeveloperStagePreview(null);
    if (scene?.uiScene?.sys?.isActive()) scene.uiScene.updateQuestTracker();
  }

  public getLogs(): DeveloperLogEntry[] {
    return this.logs.map(entry => ({ ...entry }));
  }

  public clearLogs(): void {
    this.logs = [];
    this.errorCount = 0;
    this.warnCount = 0;
  }

  private addLog(level: DeveloperLogEntry['level'], message: string): void {
    const last = this.logs.at(-1);
    if (last?.level === level && last.message === message) {
      last.count++;
    } else {
      this.logs.push({ level, time: new Date().toLocaleTimeString(), message, count: 1 });
      if (this.logs.length > 80) this.logs.shift();
    }
    if (level === 'ERROR') this.errorCount += 1;
    else this.warnCount += 1;
  }

  private installErrorCatcher(): void {
    if (typeof window === 'undefined') return;
    const priorOnError = window.onerror;
    window.onerror = (message, source, line, column, error) => {
      this.addLog('ERROR', error?.stack || `${String(message)} (${String(source || '')}:${String(line || 0)}:${String(column || 0)})`);
      return priorOnError ? priorOnError.call(window, message, source, line, column, error) : false;
    };
    const priorRejection = window.onunhandledrejection;
    window.onunhandledrejection = event => {
      const reason = event.reason;
      this.addLog('ERROR', reason instanceof Error ? (reason.stack || reason.message) : String(reason));
      if (priorRejection) priorRejection.call(window, event);
    };

    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);
    console.error = ((...args: unknown[]) => {
      this.addLog('ERROR', args.map(String).join(' '));
      originalError(...args);
    }) as typeof console.error;
    console.warn = ((...args: unknown[]) => {
      this.addLog('WARN', args.map(String).join(' '));
      originalWarn(...args);
    }) as typeof console.warn;
  }

  public getPerfSnapshot(): DeveloperPerfSnapshot {
    const empty: DeveloperPerfSnapshot = {
      fps: null, frameTimeMs: null, gameObjectCount: null, colliderCount: null, staticBodyCount: null, dynamicBodyCount: null, jsHeapMb: null,
      player: null, zoneId: null, currentBGM: null, currentAmbience: null,
      isHeartbeatActive: null, isSanityDucked: null
    };
    try {
      const scene = this.gameScene;
      if (scene && scene.sys?.isActive()) {
        const game: Phaser.Game = scene.game;
        empty.fps = Number.isFinite(game.loop.actualFps) ? game.loop.actualFps : null;
        empty.frameTimeMs = Number.isFinite(game.loop.delta) ? game.loop.delta : null;
        empty.gameObjectCount = scene.children?.list?.length ?? null;
        const world = scene.physics?.world;
        empty.colliderCount = world?.colliders.getActive().filter(collider => collider.active).length ?? null;
        empty.staticBodyCount = world ? Array.from(world.staticBodies).filter(body => body.enable).length : null;
        empty.dynamicBodyCount = world ? Array.from(world.bodies).filter(body => body.enable).length : null;
        const runtime = scene as unknown as { player?: { x?: number; y?: number }; getCurrentZoneId?: () => string };
        const player = runtime.player;
        if (typeof player?.x === 'number' && typeof player.y === 'number') empty.player = { x: player.x, y: player.y };
        empty.zoneId = runtime.getCurrentZoneId?.() ?? null;
      }
      const audio = AudioManager.getInstance();
      empty.currentBGM = audio.getCurrentBGM();
      empty.currentAmbience = audio.getCurrentAmbience();
      empty.isHeartbeatActive = audio.getIsHeartbeatActive();
      empty.isSanityDucked = audio.getIsSanityDucked();
      const memory = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory;
      if (typeof memory?.usedJSHeapSize === 'number') empty.jsHeapMb = Math.round(memory.usedJSHeapSize / 1048576 * 10) / 10;
    } catch {
      // A snapshot is diagnostic only; missing scene/browser data must not affect gameplay.
    }
    return empty;
  }
}
