import * as Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';

export type WeatherType = 'CLEAR' | 'MIST_RAIN';

export interface WeatherChangeEvent {
  from: WeatherType;
  to: WeatherType;
  intensity: number;
}

export interface RainParticle {
  x: number;
  y: number;
  length: number;
  speed: number;
  slant: number;
  alpha: number;
}

export class WeatherSystem {
  private currentWeather: WeatherType = 'CLEAR';
  private rainIntensity: number = 0; // 0.0 -> 1.0
  private targetRainIntensity: number = 0;
  private weatherTimer: number = 0;
  private rainDuration: number = 0;
  private nextWeatherCheckTime: number = 60; // Kiểm tra sau mỗi 60s

  // Bộ đệm hạt mưa (Particle Pool - 75 hạt tái sử dụng, không cấp phát bộ nhớ mới)
  private rainParticles: RainParticle[] = [];
  private readonly maxParticles: number = 75;

  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  constructor() {
    this.initParticlePool();
  }

  private initParticlePool(): void {
    for (let i = 0; i < this.maxParticles; i++) {
      this.rainParticles.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        length: 8 + Math.random() * 7, // 8-15px mảnh
        speed: 280 + Math.random() * 120, // 280-400 px/s
        slant: -1.5 - Math.random() * 1.5, // Hạt mưa nghiêng nhẹ theo chiều gió
        alpha: 0.18 + Math.random() * 0.25
      });
    }
  }

  public on(event: string, callback: (...args: any[]) => void): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return this;
  }

  public off(event: string, callback: (...args: any[]) => void): this {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter(cb => cb !== callback));
    }
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    const list = this.listeners.get(event);
    if (list && list.length > 0) {
      for (const cb of list) {
        try {
          cb(...args);
        } catch (e) {
          console.error(`[WeatherSystem] Error in event listener "${event}":`, e);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Cập nhật bước thời tiết mỗi khung hình
   */
  public update(dt: number, currentZoneId: string, timePhase: string, allowRandomRain = true): void {
    if (dt <= 0) return;

    // 1. Chuyển dịch mượt mà cường độ mưa (Fade In / Fade Out)
    if (this.rainIntensity !== this.targetRainIntensity) {
      const step = (1.0 / 3.5) * dt; // Chuyển tiếp trong ~3.5 giây
      if (this.rainIntensity < this.targetRainIntensity) {
        this.rainIntensity = Math.min(this.targetRainIntensity, this.rainIntensity + step);
      } else {
        this.rainIntensity = Math.max(this.targetRainIntensity, this.rainIntensity - step);
      }

      // Đồng bộ âm thanh mưa nền với AudioManager
      try {
        AudioManager.getInstance().setRainIntensity(this.rainIntensity);
      } catch {
        // Mock fallback trong môi trường kiểm thử
      }
    }

    // 2. Quản lý thời lượng Mưa Sương
    if (this.currentWeather === 'MIST_RAIN') {
      this.weatherTimer += dt;
      if (this.weatherTimer >= this.rainDuration) {
        this.stopRain();
      }
    } else if (allowRandomRain) {
      // 3. Tự động kiểm tra thời tiết ngẫu nhiên theo vùng
      this.nextWeatherCheckTime -= dt;
      if (this.nextWeatherCheckTime <= 0) {
        this.nextWeatherCheckTime = 75 + Math.random() * 45; // 75s - 120s
        this.evaluateWeatherChance(currentZoneId, timePhase);
      }
    }

    // 4. Cập nhật vị trí hạt mưa trong pool
    if (this.rainIntensity > 0.05) {
      const activeCount = Math.floor(this.maxParticles * this.rainIntensity);
      for (let i = 0; i < activeCount; i++) {
        const p = this.rainParticles[i];
        p.y += p.speed * dt;
        p.x += p.slant * p.speed * dt * 0.15;

        // Tái tạo vòng lặp hạt khi rơi khỏi đáy màn hình
        if (p.y > 720) {
          p.y = -15;
          p.x = Math.random() * 1280;
        }
        if (p.x < -20) p.x = 1290;
        if (p.x > 1300) p.x = -10;
      }
    }
  }

  /**
   * Đánh giá xác suất xuất hiện Mưa Sương dựa theo phân khu và pha thời gian
   */
  private evaluateWeatherChance(zoneId: string, timePhase: string): void {
    let rainChance = 0.20; // 20% cơ sở

    if (zoneId === 'silent_mire') {
      rainChance = 0.65; // Đầm lầy mưa ẩm thường xuyên
    } else if (zoneId === 'outer_woods' || zoneId === 'crooked_path' || zoneId === 'deep_forest') {
      rainChance = 0.40;
    } else if (zoneId === 'bellhollow' || zoneId === 'sanctuary_farm') {
      rainChance = 0.15; // Vùng thung lũng làng ít mưa hơn
    }

    if (timePhase === 'DUSK') {
      rainChance += 0.20; // Dễ mưa sương vào hoàng hôn
    } else if (timePhase === 'NIGHT') {
      rainChance += 0.15;
    }

    if (Math.random() < rainChance) {
      const duration = 60 + Math.random() * 30; // 60s - 90s
      this.startRain(duration);
    }
  }

  /**
   * Kích hoạt Mưa Sương (Mist Rain)
   */
  public startRain(duration: number = 75): void {
    if (this.currentWeather === 'MIST_RAIN') return;

    const prev = this.currentWeather;
    this.currentWeather = 'MIST_RAIN';
    this.targetRainIntensity = 1.0;
    this.rainDuration = duration;
    this.weatherTimer = 0;

    this.emit('weather_changed', { from: prev, to: 'MIST_RAIN', intensity: 1.0 });
  }

  /**
   * Ngừng Mưa Sương, chuyển dần về CLEAR
   */
  public stopRain(): void {
    if (this.currentWeather === 'CLEAR') return;

    const prev = this.currentWeather;
    this.currentWeather = 'CLEAR';
    this.targetRainIntensity = 0.0;
    this.weatherTimer = 0;

    this.emit('weather_changed', { from: prev, to: 'CLEAR', intensity: 0.0 });
  }

  /**
   * Vẽ hiệu ứng hạt mưa mảnh lên Graphics layer (Tối ưu GPU, zero allocations)
   */
  public renderRainParticles(gfx: Phaser.GameObjects.Graphics): void {
    if (!gfx || this.rainIntensity <= 0.02) {
      if (gfx) gfx.clear();
      return;
    }

    gfx.clear();
    const activeCount = Math.floor(this.maxParticles * this.rainIntensity);

    for (let i = 0; i < activeCount; i++) {
      const p = this.rainParticles[i];
      const alpha = p.alpha * this.rainIntensity;
      gfx.lineStyle(1, 0xa4c6d6, alpha);
      gfx.lineBetween(p.x, p.y, p.x + p.slant * 4, p.y + p.length);
    }
  }

  public isRaining(): boolean {
    return this.rainIntensity > 0.15;
  }

  public getRainIntensity(): number {
    return this.rainIntensity;
  }

  public getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  /**
   * Hệ số suy giảm tiếng ồn bước chân trong mưa:
   * Giảm 40% bán kính phát hiện bước chân của The Listener khi trời mưa sương (0.6x)
   */
  public getFootstepNoiseDampening(): number {
    if (!this.isRaining()) return 1.0;
    return Math.max(0.6, 1.0 - 0.4 * this.rainIntensity);
  }

  /**
   * Khoảng cách cảnh báo thính giác công bằng (Fair Play) trong mưa:
   * Khi The Listener tiếp cận trong vòng 220px, kích hoạt nhịp tim/sương mờ để tránh phục kích vô hình
   */
  public getFairPlayListenerAlertDistance(): number {
    return 220;
  }

  public destroy(): void {
    this.listeners.clear();
    this.rainParticles = [];
  }
}
