/**
 * HOLLOW WOODS V1.4 - GRAPHICS QUALITY & AUTO-FALLBACK SYSTEM
 * Quản lý chất lượng đồ họa hiệu ứng ánh sáng hổ phách và sương mù cho máy yếu (Integrated GPU):
 * 
 * 1. HIGH: Đầy đủ 2 lớp sương mù cuộn, 30 hạt đom đóm, ánh sáng hổ phách nhấp nháy 1.0x.
 * 2. MEDIUM: 1 lớp sương mù chính, 15 hạt đom đóm (50%), lớp ánh sáng 0.5x (giảm 75% fill-rate).
 * 3. LOW: Sương mù tĩnh nhẹ, 0 hạt thừa, lớp ánh sáng 0.35x (giảm 88% fill-rate, giữ vững 60 FPS).
 * 
 * Tự động chuyển xuống MEDIUM / LOW nếu FPS tụt dưới 38 FPS trong 4 giây liên tục.
 */

export type GraphicsQualityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GraphicsQualitySettings {
  level: GraphicsQualityLevel;
  lightingScale: number;           // 1.0 (High), 0.5 (Medium), 0.35 (Low)
  bufferWidth: number;             // 1280 (High), 640 (Medium), 448 (Low)
  bufferHeight: number;            // 720 (High), 360 (Medium), 252 (Low)
  maxFireflies: number;            // 30 (High), 15 (Medium), 0 (Low)
  maxFogLayers: number;            // 2 (High), 1 (Medium), 1 (Low)
  enableAmberFlicker: boolean;     // true (High), true (Medium), false (Low)
  enableParallaxDrift: boolean;    // true (High), true (Medium), false (Low)
  description: string;
}

export const GRAPHICS_QUALITY_CONFIG: Record<GraphicsQualityLevel, GraphicsQualitySettings> = {
  HIGH: {
    level: 'HIGH',
    lightingScale: 1.0,
    bufferWidth: 1280,
    bufferHeight: 720,
    maxFireflies: 30,
    maxFogLayers: 2,
    enableAmberFlicker: true,
    enableParallaxDrift: true,
    description: 'Chất lượng Cao (Đầy đủ 2 lớp sương mù cuộn, Ánh sáng hổ phách 1.0x, 30 đom đóm)'
  },
  MEDIUM: {
    level: 'MEDIUM',
    lightingScale: 0.5,
    bufferWidth: 640,
    bufferHeight: 360,
    maxFireflies: 15,
    maxFogLayers: 1,
    enableAmberFlicker: true,
    enableParallaxDrift: true,
    description: 'Chất lượng Cân Bằng (Lớp ánh sáng 0.5x - giảm 75% tải GPU, 1 lớp sương mù, 15 đom đóm)'
  },
  LOW: {
    level: 'LOW',
    lightingScale: 0.35,
    bufferWidth: 448,
    bufferHeight: 252,
    maxFireflies: 0,
    maxFogLayers: 1,
    enableAmberFlicker: false,
    enableParallaxDrift: false,
    description: 'Chất lượng Tiết Kiệm (Lớp ánh sáng 0.35x, sương mù tĩnh nhẹ, tắt hạt thừa, ưu tiên 60 FPS)'
  }
};

export class GraphicsQualitySystem {
  private static instance: GraphicsQualitySystem;
  private currentQuality: GraphicsQualityLevel = 'HIGH';

  // Biến theo dõi Auto-Fallback (FPS < 38 trong 4 giây liên tục)
  private lowFpsDurationMs: number = 0;
  private readonly LOW_FPS_THRESHOLD: number = 38.0;
  private readonly LOW_FPS_REQUIRED_MS: number = 4000;
  private autoFallbackTriggered: boolean = false;

  // Lắng nghe thay đổi chất lượng đồ họa
  private listeners: Array<(settings: GraphicsQualitySettings) => void> = [];

  private constructor() {
    this.loadSavedQuality();
  }

  public static getInstance(): GraphicsQualitySystem {
    if (!GraphicsQualitySystem.instance) {
      GraphicsQualitySystem.instance = new GraphicsQualitySystem();
    }
    return GraphicsQualitySystem.instance;
  }

  private loadSavedQuality(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('hw_graphics_quality');
        if (saved === 'HIGH' || saved === 'MEDIUM' || saved === 'LOW') {
          this.currentQuality = saved;
          return;
        }
      }
    } catch {
      // Ignored
    }
    this.currentQuality = 'HIGH';
  }

  public saveQuality(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('hw_graphics_quality', this.currentQuality);
      }
    } catch {
      // Ignored
    }
  }

  public getQuality(): GraphicsQualityLevel {
    return this.currentQuality;
  }

  public getSettings(): GraphicsQualitySettings {
    return GRAPHICS_QUALITY_CONFIG[this.currentQuality];
  }

  public setQuality(level: GraphicsQualityLevel, notify: boolean = true): GraphicsQualitySettings {
    this.currentQuality = level;
    this.lowFpsDurationMs = 0;
    this.saveQuality();

    const settings = this.getSettings();
    if (notify) {
      for (const cb of this.listeners) {
        try {
          cb(settings);
        } catch (err) {
          console.error('[GraphicsQualitySystem] Callback error:', err);
        }
      }
    }
    return settings;
  }

  public cycleQuality(): GraphicsQualitySettings {
    if (this.currentQuality === 'HIGH') {
      return this.setQuality('MEDIUM');
    } else if (this.currentQuality === 'MEDIUM') {
      return this.setQuality('LOW');
    } else {
      return this.setQuality('HIGH');
    }
  }

  public onQualityChange(callback: (settings: GraphicsQualitySettings) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Kiểm tra tự động giáng cấp (Auto-Fallback) nếu FPS < 38 trong 4 giây liên tục
   */
  public updateAutoFallback(fps: number, deltaMs: number): { fallbackOccurred: boolean; newLevel?: GraphicsQualityLevel } {
    if (this.currentQuality === 'LOW') {
      this.lowFpsDurationMs = 0;
      return { fallbackOccurred: false };
    }

    if (fps > 0 && fps < this.LOW_FPS_THRESHOLD) {
      this.lowFpsDurationMs += deltaMs;
      if (this.lowFpsDurationMs >= this.LOW_FPS_REQUIRED_MS) {
        const nextLevel: GraphicsQualityLevel = this.currentQuality === 'HIGH' ? 'MEDIUM' : 'LOW';
        console.warn(`[GraphicsQualitySystem] FPS dropped below ${this.LOW_FPS_THRESHOLD} for 4s (${fps.toFixed(1)} FPS). Auto-fallback -> ${nextLevel}`);
        this.setQuality(nextLevel);
        this.autoFallbackTriggered = true;
        this.lowFpsDurationMs = 0;
        return { fallbackOccurred: true, newLevel: nextLevel };
      }
    } else if (fps >= this.LOW_FPS_THRESHOLD + 4) {
      // Giảm dần biến tích lũy nếu FPS ổn định trở lại
      this.lowFpsDurationMs = Math.max(0, this.lowFpsDurationMs - deltaMs * 0.5);
    }

    return { fallbackOccurred: false };
  }

  public getLowFpsProgress(): number {
    return Math.min(1.0, this.lowFpsDurationMs / this.LOW_FPS_REQUIRED_MS);
  }

  public isAutoFallbackTriggered(): boolean {
    return this.autoFallbackTriggered;
  }
}
