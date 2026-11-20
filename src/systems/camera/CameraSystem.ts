import * as Phaser from 'phaser';
import { BlackKnightPlayer } from '../../entities/BlackKnightPlayer';
import { BoundsRect } from '../../types';
import { SettingsManager } from '../SettingsManager';

export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.setupCamera();
  }

  private setupCamera(): void {
    this.camera.setSize(1280, 720);
    this.camera.setRoundPixels(true);
    this.camera.setZoom(2.2);
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
    if (!SettingsManager.getInstance().isScreenShakeEnabled()) return;
    this.camera.shake(duration, intensity);
  }

  public flash(duration: number = 300, red: number = 255, green: number = 255, blue: number = 255): void {
    this.camera.flash(duration, red, green, blue);
  }

  public zoomTo(zoom: number, duration: number = 500): void {
    this.camera.zoomTo(zoom, duration, 'Linear', true);
  }
}
