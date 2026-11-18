/**
 * HOLLOW WOODS V1.5 - HỆ THỐNG QUẢN LÝ CÀI ĐẶT TOÀN CỤC (SETTINGS MANAGER)
 * Quản lý đồng bộ: Âm lượng (Master, BGM, SFX, Mute), Rung Màn Hình (Screen Shake),
 * và Chất Lượng Đồ Họa (Graphics Quality).
 * Lưu trữ kép: LocalStorage + CloudSaveService (p2.storage).
 */

import { AudioManager } from '../audio/AudioManager';
import { GraphicsQualitySystem, GraphicsQualityLevel } from './GraphicsQualitySystem';
import { saveSettings, loadSettings, GameSettingsData } from '../services/CloudSaveService';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  screenShakeEnabled: boolean;
  graphicsQuality: GraphicsQualityLevel;
}

export type SettingsChangeListener = (settings: GameSettings) => void;

export class SettingsManager {
  private static instance: SettingsManager | null = null;
  private static readonly STORAGE_KEY = 'hw_settings';
  private static readonly LOCAL_PREFIX_KEY = 'hollow_woods_settings';

  private settings: GameSettings = {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.85,
    isMuted: false,
    screenShakeEnabled: true,
    graphicsQuality: 'HIGH'
  };

  private listeners: Set<SettingsChangeListener> = new Set();
  private saveDebounceTimer: number | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.loadFromLocalStorage();
    this.applyToSystems();
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Khởi tạo và nạp cài đặt từ Cloud (nếu có)
   */
  public async initAsync(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const cloudData = await loadSettings();
      if (cloudData) {
        this.mergeSettings(cloudData);
        this.applyToSystems();
        this.notifyListeners();
      }
    } catch (e) {
      console.warn('[SettingsManager] Không thể tải cài đặt từ đám mây, sử dụng cấu hình cục bộ:', e);
    }
  }

  /**
   * Nạp từ LocalStorage đồng bộ lúc khởi động
   */
  private loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const raw = localStorage.getItem(SettingsManager.LOCAL_PREFIX_KEY) || localStorage.getItem(SettingsManager.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.mergeSettings(data);
      }
    } catch (e) {
      console.warn('[SettingsManager] Lỗi đọc cấu hình từ localStorage:', e);
    }
  }

  private mergeSettings(data: Partial<GameSettingsData>): void {
    if (typeof data.masterVolume === 'number') {
      this.settings.masterVolume = Math.max(0, Math.min(1, data.masterVolume));
    }
    if (typeof data.musicVolume === 'number') {
      this.settings.musicVolume = Math.max(0, Math.min(1, data.musicVolume));
    }
    if (typeof data.sfxVolume === 'number') {
      this.settings.sfxVolume = Math.max(0, Math.min(1, data.sfxVolume));
    }
    if (typeof data.isMuted === 'boolean') {
      this.settings.isMuted = data.isMuted;
    }
    if (typeof data.screenShakeEnabled === 'boolean') {
      this.settings.screenShakeEnabled = data.screenShakeEnabled;
    }
    if (data.graphicsQuality && (data.graphicsQuality === 'HIGH' || data.graphicsQuality === 'MEDIUM' || data.graphicsQuality === 'LOW')) {
      this.settings.graphicsQuality = data.graphicsQuality as GraphicsQualityLevel;
    }
  }

  /**
   * Đồng bộ cài đặt xuống các hệ thống (AudioManager, GraphicsQualitySystem)
   */
  public applyToSystems(): void {
    try {
      const audio = AudioManager.getInstance();
      audio.setMasterVolume(this.settings.masterVolume);
      audio.setMusicVolume(this.settings.musicVolume);
      audio.setSfxVolume(this.settings.sfxVolume);
      audio.setMute(this.settings.isMuted);

      const gqs = GraphicsQualitySystem.getInstance();
      if (gqs.getSettings().level !== this.settings.graphicsQuality) {
        gqs.setQuality(this.settings.graphicsQuality, false);
      }
    } catch (e) {
      console.warn('[SettingsManager] Lỗi áp dụng cấu hình vào hệ thống con:', e);
    }
  }

  /**
   * Lưu cài đặt vào LocalStorage và lên Cloud (debounced)
   */
  private scheduleSave(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const json = JSON.stringify(this.settings);
        localStorage.setItem(SettingsManager.LOCAL_PREFIX_KEY, json);
        localStorage.setItem(SettingsManager.STORAGE_KEY, json);
      } catch (e) {
        console.warn('[SettingsManager] Lỗi ghi cấu hình localStorage:', e);
      }
    }

    if (this.saveDebounceTimer !== null) {
      window.clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = window.setTimeout(async () => {
      this.saveDebounceTimer = null;
      try {
        await saveSettings({
          ...this.settings,
          updatedAt: Date.now()
        });
      } catch {}
    }, 1000);
  }

  // --- GETTERS & SETTERS ---

  public getSettings(): Readonly<GameSettings> {
    return { ...this.settings };
  }

  public isScreenShakeEnabled(): boolean {
    return this.settings.screenShakeEnabled;
  }

  public setScreenShakeEnabled(enabled: boolean): void {
    if (this.settings.screenShakeEnabled === enabled) return;
    this.settings.screenShakeEnabled = enabled;
    this.scheduleSave();
    this.notifyListeners();
  }

  public toggleScreenShake(): boolean {
    this.setScreenShakeEnabled(!this.settings.screenShakeEnabled);
    return this.settings.screenShakeEnabled;
  }

  public getMasterVolume(): number {
    return this.settings.masterVolume;
  }

  public setMasterVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(vol * 100) / 100));
    if (this.settings.masterVolume === clamped) return;
    this.settings.masterVolume = clamped;
    AudioManager.getInstance().setMasterVolume(clamped);
    this.scheduleSave();
    this.notifyListeners();
  }

  public getMusicVolume(): number {
    return this.settings.musicVolume;
  }

  public setMusicVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(vol * 100) / 100));
    if (this.settings.musicVolume === clamped) return;
    this.settings.musicVolume = clamped;
    AudioManager.getInstance().setMusicVolume(clamped);
    this.scheduleSave();
    this.notifyListeners();
  }

  public getSfxVolume(): number {
    return this.settings.sfxVolume;
  }

  public setSfxVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(vol * 100) / 100));
    if (this.settings.sfxVolume === clamped) return;
    this.settings.sfxVolume = clamped;
    AudioManager.getInstance().setSfxVolume(clamped);
    this.scheduleSave();
    this.notifyListeners();
  }

  public isMuted(): boolean {
    return this.settings.isMuted;
  }

  public setMute(muted: boolean): void {
    if (this.settings.isMuted === muted) return;
    this.settings.isMuted = muted;
    AudioManager.getInstance().setMute(muted);
    this.scheduleSave();
    this.notifyListeners();
  }

  public toggleMute(): boolean {
    this.setMute(!this.settings.isMuted);
    return this.settings.isMuted;
  }

  public getGraphicsQuality(): GraphicsQualityLevel {
    return this.settings.graphicsQuality;
  }

  public setGraphicsQuality(level: GraphicsQualityLevel): void {
    if (this.settings.graphicsQuality === level) return;
    this.settings.graphicsQuality = level;
    GraphicsQualitySystem.getInstance().setQuality(level);
    this.scheduleSave();
    this.notifyListeners();
  }

  public cycleGraphicsQuality(): GraphicsQualityLevel {
    const current = this.settings.graphicsQuality;
    const next: GraphicsQualityLevel = current === 'HIGH' ? 'MEDIUM' : current === 'MEDIUM' ? 'LOW' : 'HIGH';
    this.setGraphicsQuality(next);
    return next;
  }

  public onSettingsChange(callback: SettingsChangeListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const copy = this.getSettings();
    for (const listener of this.listeners) {
      try {
        listener(copy);
      } catch (e) {
        console.error('[SettingsManager] Lỗi thực thi listener:', e);
      }
    }
  }
}
