import * as Phaser from 'phaser';
import { SatyrPlayer } from '../../entities/SatyrPlayer';
import { BoundsRect } from '../../types';

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

  public follow(target: SatyrPlayer): void {
    // Bám theo mục tiêu với độ mượt lerp (0.1, 0.1)
    this.camera.startFollow(target, true, 0.1, 0.1);
    // Vùng chết (deadzone) giúp camera không giật khi nhân vật di chuyển nhỏ
    this.camera.setDeadzone(32, 24);
  }

  public setWorldBounds(bounds: BoundsRect): void {
    this.camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  public update(): void {
    // Đảm bảo tọa độ camera luôn được làm tròn nguyên số để pixel art luôn sắc nét 100%
    this.camera.scrollX = Math.round(this.camera.scrollX);
    this.camera.scrollY = Math.round(this.camera.scrollY);
  }

  public shake(duration: number = 250, intensity: number = 0.008): void {
    this.camera.shake(duration, intensity);
  }

  public flash(duration: number = 300, red: number = 255, green: number = 255, blue: number = 255): void {
    this.camera.flash(duration, red, green, blue);
  }

  public zoomTo(zoom: number, duration: number = 500): void {
    this.camera.zoomTo(zoom, duration, 'Linear', true);
  }
}
