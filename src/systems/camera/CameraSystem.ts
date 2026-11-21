import * as Phaser from 'phaser';
import { BlackKnightPlayer } from '../../entities/BlackKnightPlayer';
import { BoundsRect } from '../../types';
import { SettingsManager } from '../SettingsManager';

const DEFAULT_WORLD_ZOOM = 2.2;

export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private zoneZoom = DEFAULT_WORLD_ZOOM;
  private lastFlashTimestamp: number = 0;
  private lastShakeTimestamp: number = 0;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.setupCamera();
  }

  private setupCamera(): void {
    this.camera.setSize(1280, 720);
    this.camera.setRoundPixels(true);
    this.camera.setZoom(DEFAULT_WORLD_ZOOM);
  }

  public follow(target: BlackKnightPlayer): void {
    // Bám theo mục tiêu với độ mượt lerp (0.1, 0.1)
    this.camera.startFollow(target, true, 0.1, 0.1);
    // Vùng chết (deadzone) giúp camera không giật khi nhân vật di chuyển nhỏ
    this.camera.setDeadzone(32, 24);
  }

  public setWorldBounds(bounds: BoundsRect): void {
    const current = this.camera.getBounds();
    if (current.x !== bounds.x || current.y !== bounds.y ||
        current.width !== bounds.width || current.height !== bounds.height) {
      this.camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    // A narrow room must still cover the viewport at its camera clamp.
    const fit = Math.max(this.camera.width / bounds.width, this.camera.height / bounds.height);
    const zoom = Math.max(DEFAULT_WORLD_ZOOM, Math.ceil(fit * 100) / 100);
    if (zoom !== this.zoneZoom) {
      this.zoneZoom = zoom;
      this.camera.setZoom(zoom);
    }
  }

  /**
   * C4-13-02: Lập tức canh giữa camera vào tọa độ đích mà không bị trễ hay giật lag khi chuyển vùng
   */
  public centerOn(x: number, y: number): void {
    this.camera.centerOn(x, y);
    this.camera.scrollX = Math.round(this.camera.scrollX);
    this.camera.scrollY = Math.round(this.camera.scrollY);
  }

  public shake(duration: number = 250, intensity: number = 0.008): void {
    const settings = SettingsManager.getInstance();
    if (!settings.isScreenShakeEnabled()) return;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastShakeTimestamp < 120) return;
    this.lastShakeTimestamp = now;

    const safeIntensity = Math.min(0.018, intensity);
    const safeDuration = Math.min(400, duration);
    this.camera.shake(safeDuration, safeIntensity);
  }

  public flash(duration: number = 300, red: number = 255, green: number = 255, blue: number = 255): void {
    const settings = SettingsManager.getInstance();
    if (!settings.isScreenFlashEnabled()) return;

    // V1.5.3 (BUG-023 FIX): Chống nhấp nháy/chớp camera dồn dập (thời gian giãn cách tối thiểu 450ms)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastFlashTimestamp < 450) return;
    this.lastFlashTimestamp = now;

    // Giảm độ gắt RGB để bảo vệ mắt, tránh flash chói lóa tương phản cực mạnh
    const safeR = Math.min(190, red);
    const safeG = Math.min(190, green);
    const safeB = Math.min(190, blue);
    const safeDuration = Math.min(380, Math.max(140, duration));

    this.camera.flash(safeDuration, safeR, safeG, safeB);
  }

  public zoomTo(zoom: number, duration: number = 500): void {
    this.camera.zoomTo(zoom, duration, 'Linear', true);
  }
}
