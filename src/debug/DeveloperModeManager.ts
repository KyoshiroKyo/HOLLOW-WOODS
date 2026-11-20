import * as Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import type { GameScene } from '../scenes/GameScene';
import zonesData from '../data/zones.json';
import itemsData from '../data/items.json';

export interface DeveloperLogEntry {
  level: 'ERROR' | 'WARN';
  time: string;
  message: string;
}

export interface DeveloperPerfSnapshot {
  fps: number | null;
  frameTimeMs: number | null;
  gameObjectCount: number | null;
  colliderCount: number | null;
  jsHeapMb: number | null;
  player: { x: number; y: number } | null;
  zoneId: string | null;
  currentBGM: string | null;
  currentAmbience: string | null;
  isHeartbeatActive: boolean | null;
  isSanityDucked: boolean | null;
}

export class DeveloperModeManager {
  private static instance: DeveloperModeManager | null = null;
  public isEnabled = false;
  public isDevSession = false;
  public errorCount = 0;
  public warnCount = 0;
  private logs: DeveloperLogEntry[] = [];
  private gameScene: GameScene | null = null;
  public isNoclip = false;
  public speedMultiplier: 1 | 2 | 3 = 1;
  public isGodMode = false;
  public isInfiniteStamina = false;
  public isFreezeAI = false;
  public freezeTime = false;
  public fogEnabled = true;
  public rainEnabled = true;

  private constructor() {
    this.installErrorCatcher();
  }

  public static getInstance(): DeveloperModeManager {
    if (!DeveloperModeManager.instance) DeveloperModeManager.instance = new DeveloperModeManager();
    return DeveloperModeManager.instance;
  }

  public canToggleWithSimpleF9(): boolean {
    const isDevelopmentBuild = (import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV;
    return isDevelopmentBuild || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === '1');
  }

  public markDevUsed(): void {
    this.isDevSession = true;
  }

  public setEnabled(enabled: boolean): void { this.isEnabled = enabled; }

  public attachGameScene(scene: GameScene): void {
    this.gameScene = scene;
  }

  public detachGameScene(): void {
    this.gameScene = null;
  }

  private runtime(): any { return this.gameScene as any; }

  public setNoclip(enabled: boolean): void {
    this.markDevUsed(); this.isNoclip = enabled;
    const scene = this.runtime(); const player = scene?.player; const body = player?.body;
    if (body) { body.checkCollision.none = enabled; body.enable = true; }
    if (scene?.worldBuilder) scene.worldBuilder.noclipEnabled = enabled;
  }
  public setSpeedMultiplier(mult: 1 | 2 | 3): void { this.markDevUsed(); if ([1, 2, 3].includes(mult)) this.speedMultiplier = mult; }
  public teleportToCoords(x: number, y: number): void {
    this.markDevUsed(); const p = this.runtime()?.player;
    if (!p || !Number.isFinite(x) || !Number.isFinite(y)) return;
    p.setPosition(x, y); const b = p.body; if (b?.reset) b.reset(x, y); b?.setVelocity?.(0, 0);
  }
  public teleportToZone(zoneId: string): void {
    this.markDevUsed(); const scene = this.runtime(); const zone = (zonesData.zones as any[]).find(z => z.id === zoneId);
    if (!scene || !zone?.defaultSpawn) return;
    const transition = scene.worldBuilder?.getTransitions?.().find((t: any) => t.toZone === zoneId);
    if (transition && typeof scene.executeTransition === 'function') scene.executeTransition(transition);
    else { scene.worldBuilder?.setActiveZone?.(zoneId); this.teleportToCoords(zone.defaultSpawn.x, zone.defaultSpawn.y); }
  }
  public teleportToNPC(npcId: string): void {
    this.markDevUsed(); const scene = this.runtime();
    const entity = scene?.npcs?.find((n: any) => n?.id === npcId || n?.name === npcId) ?? (scene?.listenerMonster?.id === npcId ? scene.listenerMonster : null);
    if (entity && Number.isFinite(entity.x) && Number.isFinite(entity.y)) this.teleportToCoords(entity.x, entity.y);
  }
  public setGodMode(enabled: boolean): void { this.markDevUsed(); this.isGodMode = enabled; }
  public setInfiniteStamina(enabled: boolean): void { this.markDevUsed(); this.isInfiniteStamina = enabled; }
  public setStats(values: { hp?: number; stamina?: number; composure?: number }): void {
    this.markDevUsed(); const s = this.runtime()?.playerState?.stats; if (!s) return;
    if (Number.isFinite(values.hp)) s.health = Math.max(0, Math.min(s.maxHealth ?? 100, values.hp!));
    if (Number.isFinite(values.stamina)) s.stamina = Math.max(0, Math.min(s.maxStamina ?? 100, values.stamina!));
    if (Number.isFinite(values.composure)) s.composure = Math.max(0, Math.min(100, values.composure!));
    this.runtime()?.playerState?.emit?.('stats_changed', s);
  }
  public giveItem(itemId: string, count: number): void {
    this.markDevUsed(); const scene = this.runtime(); const exists = (itemsData.items as any[]).some(i => i.id === itemId);
    if (exists && Number.isInteger(count) && count > 0) scene?.playerState?.addItem?.(itemId, count);
  }
  public unlockAllGatesAndSeals(): void {
    this.markDevUsed(); const s = this.runtime()?.playerState; if (!s) return;
    ['east_gate_unlocked','ancient_root_seal_unlocked','mire_unlocked','shrine_unlocked','mire_pillars_solved','bellhollow_ward_seal_broken'].forEach(f => s.setFlag?.(f));
    const w = this.runtime()?.worldBuilder; w?.updateEastGateInteractable?.(true); w?.updateShrineWardInteractable?.(true);
  }
  public jumpToQuestStage(stage: number): void {
    this.markDevUsed(); const s = this.runtime()?.playerState; if (!s || !Number.isInteger(stage) || stage < 1 || stage > 7) return;
    s.setFlag?.(`dev_quest_stage_${stage}`); const q = this.runtime()?.questSystem; q?.setStage?.(stage);
  }
  public setTimePhase(phase: 'DAY' | 'DUSK' | 'NIGHT'): void {
    this.markDevUsed(); const t = this.runtime()?.timeSystem; const hours: Record<string, number> = { DAY: 12, DUSK: 19, NIGHT: 23 };
    if (t && hours[phase] !== undefined) t.setTimeOfDay?.(hours[phase]);
  }
  public setFreezeTime(enabled: boolean): void { this.markDevUsed(); this.freezeTime = enabled; this.runtime()?.timeSystem?.setPaused?.(enabled); }
  public setFogEnabled(enabled: boolean): void { this.markDevUsed(); this.fogEnabled = enabled; this.runtime()?.veilSystem?.setEnabled?.(enabled); }
  public setRainEnabled(enabled: boolean): void { this.markDevUsed(); this.rainEnabled = enabled; const w = this.runtime()?.weatherSystem; enabled ? w?.startRain?.() : w?.stopRain?.(); }
  public triggerEnding(ending: 'true' | 'sacrifice' | 'fog_loop'): void {
    this.markDevUsed(); const e = this.runtime()?.endingSystem; const type = ending === 'fog_loop' ? 'fog_loop_ending' : `${ending}_ending`;
    e?.playEndingPresentation?.(type);
  }
  public setFreezeAI(enabled: boolean): void { this.markDevUsed(); this.isFreezeAI = enabled; }
  public spawnTestMonster(type: 'listener' | 'skull_wolf' | 'fallen_knight'): void {
    this.markDevUsed(); const s = this.runtime(); const p = s?.player; if (!s || !p) return;
    if (type === 'listener') { s.listenerMonster?.setPosition?.(p.x + 80, p.y); return; }
    const group = type === 'skull_wolf' ? s.skullWolves : s.fallenKnights;
    const target = Array.isArray(group) ? group[0] : null; target?.setPosition?.(p.x + 80, p.y);
  }
  public getNearbyEntities(): Array<{ id: string; name: string; x: number; y: number }> {
    const s = this.runtime(); const p = s?.player; if (!p) return [];
    return [...(s.npcs ?? []), ...(s.listenerMonster ? [s.listenerMonster] : [])]
      .filter((e: any) => Number.isFinite(e?.x) && Number.isFinite(e?.y))
      .map((e: any) => ({ id: String(e.id ?? e.name ?? 'entity'), name: String(e.name ?? e.id ?? 'Entity'), x: e.x, y: e.y }));
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
    const entry: DeveloperLogEntry = { level, time: new Date().toLocaleTimeString(), message };
    this.logs.push(entry);
    if (this.logs.length > 80) this.logs.shift();
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
      fps: null, frameTimeMs: null, gameObjectCount: null, colliderCount: null, jsHeapMb: null,
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
        empty.colliderCount = scene.physics?.world?.colliders?.getActive?.().length ?? null;
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
