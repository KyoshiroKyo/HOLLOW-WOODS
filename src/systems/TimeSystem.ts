import { TIME_CONFIG, TimePhase, PhaseVisualConfig, TimeSystemConfig } from '../config/TimeConfig';
import { PlayerState } from '../state/PlayerState';

export interface TimeTickEvent {
  dayCount: number;
  timeOfDay: number;
  phase: TimePhase;
  phaseProgress: number;
  dayProgress: number;
}

export interface PhaseChangeEvent {
  from: TimePhase;
  to: TimePhase;
  dayCount: number;
  alert: string;
}

/**
 * Hàm nội suy màu sắc 24-bit RGB mượt mà
 */
export function lerpColor(c1: number, c2: number, t: number): number {
  const clampedT = Math.max(0, Math.min(1, t));
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * clampedT);
  const g = Math.round(g1 + (g2 - g1) * clampedT);
  const b = Math.round(b1 + (b2 - b1) * clampedT);

  return (r << 16) | (g << 8) | b;
}

/**
 * Hàm làm mịn đường cong mượt mà (Hermite Smoothstep)
 */
export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

export class TimeSystem {
  private config: TimeSystemConfig;
  private dayCount: number = 1;
  private timeOfDay: number = 0; // Giây trong chu kỳ 360s
  private isPaused: boolean = false;
  private currentPhase: TimePhase = 'DAY';
  private previousPhase: TimePhase = 'DAY';

  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  constructor(initialDay: number = 1, initialTime: number = 0, config: TimeSystemConfig = TIME_CONFIG) {
    this.config = config;
    this.dayCount = Math.max(1, Math.floor(initialDay));
    this.timeOfDay = Math.max(0, Math.min(this.config.totalDayDuration, initialTime));
    this.currentPhase = this.determinePhase(this.timeOfDay);
    this.previousPhase = this.currentPhase;
    this.syncToPlayerState();
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
          console.error(`[TimeSystem] Error in listener for event "${event}":`, e);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Cập nhật bước thời gian thế giới khi không bị tạm dừng
   */
  public update(dt: number): void {
    if (this.isPaused || dt <= 0) return;

    this.timeOfDay += dt;

    // Khi vượt quá độ dài một ngày (360s): bước sang ngày mới
    if (this.timeOfDay >= this.config.totalDayDuration) {
      this.timeOfDay -= this.config.totalDayDuration;
      this.dayCount += 1;
      this.emit('new_day', this.dayCount);
    }

    // Xác định pha hiện tại
    const newPhase = this.determinePhase(this.timeOfDay);
    if (newPhase !== this.currentPhase) {
      this.previousPhase = this.currentPhase;
      this.currentPhase = newPhase;
      const phaseConfig = this.config.phases[newPhase];
      const eventData: PhaseChangeEvent = {
        from: this.previousPhase,
        to: this.currentPhase,
        dayCount: this.dayCount,
        alert: phaseConfig.transitionAlert
      };
      this.emit('phase_changed', eventData);
    }

    this.syncToPlayerState();

    const tickData: TimeTickEvent = {
      dayCount: this.dayCount,
      timeOfDay: this.timeOfDay,
      phase: this.currentPhase,
      phaseProgress: this.getPhaseProgress(),
      dayProgress: this.getDayProgress()
    };
    this.emit('time_tick', tickData);
  }

  /**
   * Xác định pha thời gian dựa theo số giây trong ngày
   */
  public determinePhase(t: number): TimePhase {
    const dayDur = this.config.phases.DAY.duration;
    const duskDur = this.config.phases.DUSK.duration;
    if (t < dayDur) {
      return 'DAY';
    } else if (t < dayDur + duskDur) {
      return 'DUSK';
    } else {
      return 'NIGHT';
    }
  }

  /**
   * Tiến độ trong pha hiện tại (0.0 đến 1.0)
   */
  public getPhaseProgress(): number {
    const dayDur = this.config.phases.DAY.duration;
    const duskDur = this.config.phases.DUSK.duration;
    const nightDur = this.config.phases.NIGHT.duration;

    if (this.currentPhase === 'DAY') {
      return Math.max(0, Math.min(1, this.timeOfDay / dayDur));
    } else if (this.currentPhase === 'DUSK') {
      return Math.max(0, Math.min(1, (this.timeOfDay - dayDur) / duskDur));
    } else {
      return Math.max(0, Math.min(1, (this.timeOfDay - dayDur - duskDur) / nightDur));
    }
  }

  /**
   * Tiến độ toàn bộ ngày 360s (0.0 đến 1.0)
   */
  public getDayProgress(): number {
    return Math.max(0, Math.min(1, this.timeOfDay / this.config.totalDayDuration));
  }

  public getCurrentPhase(): TimePhase {
    return this.currentPhase;
  }

  public getDayCount(): number {
    return this.dayCount;
  }

  public getTimeOfDay(): number {
    return this.timeOfDay;
  }

  public getCurrentConfig(): PhaseVisualConfig {
    return this.config.phases[this.currentPhase];
  }

  public isTimePaused(): boolean {
    return this.isPaused;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * V1.4: Chuyển sang pha thời gian tiếp theo (dùng khi nghỉ ngơi tại Lều Trú Ẩn)
   */
  public advanceToNextPhase(): void {
    const dayDur = this.config.phases.DAY.duration;
    const duskDur = this.config.phases.DUSK.duration;

    if (this.currentPhase === 'DAY') {
      this.timeOfDay = dayDur; // Chuyển sang DUSK
    } else if (this.currentPhase === 'DUSK') {
      this.timeOfDay = dayDur + duskDur; // Chuyển sang NIGHT
    } else {
      // Đang là NIGHT -> bước sang DAY của ngày tiếp theo
      this.timeOfDay = 0;
      this.dayCount += 1;
      this.emit('new_day', this.dayCount);
    }

    const newPhase = this.determinePhase(this.timeOfDay);
    this.previousPhase = this.currentPhase;
    this.currentPhase = newPhase;
    this.emit('phase_changed', {
      from: this.previousPhase,
      to: this.currentPhase,
      dayCount: this.dayCount,
      alert: this.config.phases[newPhase].transitionAlert
    });
    this.syncToPlayerState();
  }

  /**
   * Đặt trực tiếp thời gian trong ngày
   */
  public setTimeOfDay(t: number, day?: number): void {
    if (day !== undefined) this.dayCount = day;
    this.timeOfDay = Math.max(0, Math.min(this.config.totalDayDuration - 0.1, t));
    const newPhase = this.determinePhase(this.timeOfDay);
    if (newPhase !== this.currentPhase) {
      this.previousPhase = this.currentPhase;
      this.currentPhase = newPhase;
      this.emit('phase_changed', {
        from: this.previousPhase,
        to: this.currentPhase,
        dayCount: this.dayCount,
        alert: this.config.phases[newPhase].transitionAlert
      });
    }
    this.syncToPlayerState();
  }

  public setTime(timeOfDay: number, dayCount?: number): void {
    this.timeOfDay = Math.max(0, Math.min(this.config.totalDayDuration, timeOfDay));
    if (dayCount !== undefined) {
      this.dayCount = Math.max(1, Math.floor(dayCount));
    }
    const newPhase = this.determinePhase(this.timeOfDay);
    if (newPhase !== this.currentPhase) {
      this.previousPhase = this.currentPhase;
      this.currentPhase = newPhase;
      this.emit('phase_changed', {
        from: this.previousPhase,
        to: this.currentPhase,
        dayCount: this.dayCount,
        alert: this.config.phases[newPhase].transitionAlert
      });
    }
    this.syncToPlayerState();
  }

  /**
   * Tính toán hệ số chuyển tiếp (blend factor 0.0 -> 1.0) giữa pha hiện tại và pha kế tiếp
   */
  private getTransitionBlend(): { fromPhase: TimePhase; toPhase: TimePhase; blend: number } {
    const halfBlend = this.config.transitionBlendDuration / 2;
    const t = this.timeOfDay;
    const dayToDusk = this.config.phases.DAY.duration; // 180
    const duskToNight = dayToDusk + this.config.phases.DUSK.duration; // 270
    const nightToDay = this.config.totalDayDuration; // 360

    // 1. Chuyển tiếp DAY -> DUSK (quanh mốc 180s)
    if (t >= dayToDusk - halfBlend && t <= dayToDusk + halfBlend) {
      const raw = (t - (dayToDusk - halfBlend)) / this.config.transitionBlendDuration;
      return { fromPhase: 'DAY', toPhase: 'DUSK', blend: smoothstep(raw) };
    }

    // 2. Chuyển tiếp DUSK -> NIGHT (quanh mốc 270s)
    if (t >= duskToNight - halfBlend && t <= duskToNight + halfBlend) {
      const raw = (t - (duskToNight - halfBlend)) / this.config.transitionBlendDuration;
      return { fromPhase: 'DUSK', toPhase: 'NIGHT', blend: smoothstep(raw) };
    }

    // 3. Chuyển tiếp NIGHT -> DAY (quanh mốc 360s / 0s)
    if (t >= nightToDay - halfBlend) {
      const raw = (t - (nightToDay - halfBlend)) / this.config.transitionBlendDuration;
      return { fromPhase: 'NIGHT', toPhase: 'DAY', blend: smoothstep(raw) };
    }
    if (t <= halfBlend) {
      const raw = (t + halfBlend) / this.config.transitionBlendDuration;
      return { fromPhase: 'NIGHT', toPhase: 'DAY', blend: smoothstep(raw) };
    }

    return { fromPhase: this.currentPhase, toPhase: this.currentPhase, blend: 0 };
  }

  /**
   * Lấy bán kính tầm nhìn nội suy mượt mà (có tính chuyển tiếp)
   */
  public getVisionRadius(isLanternLit: boolean): number {
    const { fromPhase, toPhase, blend } = this.getTransitionBlend();
    const fromVal = isLanternLit
      ? this.config.phases[fromPhase].visionRadiusLit
      : this.config.phases[fromPhase].visionRadiusUnlit;
    const toVal = isLanternLit
      ? this.config.phases[toPhase].visionRadiusLit
      : this.config.phases[toPhase].visionRadiusUnlit;

    if (blend <= 0) return fromVal;
    return Math.round(fromVal + (toVal - fromVal) * blend);
  }

  /**
   * Lấy màu ánh sáng môi trường nội suy mượt mà
   */
  public getAmbientTint(): number {
    const { fromPhase, toPhase, blend } = this.getTransitionBlend();
    const c1 = this.config.phases[fromPhase].ambientColor;
    const c2 = this.config.phases[toPhase].ambientColor;
    return blend <= 0 ? c1 : lerpColor(c1, c2, blend);
  }

  /**
   * Lấy màu sắc sương mù nội suy mượt mà
   */
  public getFogTint(): number {
    const { fromPhase, toPhase, blend } = this.getTransitionBlend();
    const c1 = this.config.phases[fromPhase].fogColor;
    const c2 = this.config.phases[toPhase].fogColor;
    return blend <= 0 ? c1 : lerpColor(c1, c2, blend);
  }

  public getFogColor(): number {
    return this.getFogTint();
  }

  /**
   * Lấy hệ số nhân độ đậm nhạt của sương mù
   */
  public getFogAlphaMultiplier(): number {
    const { fromPhase, toPhase, blend } = this.getTransitionBlend();
    const a1 = this.config.phases[fromPhase].fogAlphaMultiplier;
    const a2 = this.config.phases[toPhase].fogAlphaMultiplier;
    return blend <= 0 ? a1 : a1 + (a2 - a1) * blend;
  }

  public getFogAlpha(): number {
    return this.getFogAlphaMultiplier();
  }

  /**
   * Lấy cường độ gió nền nội suy mượt mà
   */
  public getWindIntensity(): number {
    const { fromPhase, toPhase, blend } = this.getTransitionBlend();
    const w1 = this.config.phases[fromPhase].windIntensity;
    const w2 = this.config.phases[toPhase].windIntensity;
    return blend <= 0 ? w1 : w1 + (w2 - w1) * blend;
  }

  /**
   * Lấy tốc độ tụt / hồi Bình Tâm
   */
  public getComposureDrainRate(inDeepFog: boolean, isLanternLit: boolean): number {
    const cfg = this.getCurrentConfig();
    if (isLanternLit) {
      return -cfg.composureRecoveryLit; // Số âm biểu thị hồi phục
    }
    return inDeepFog ? cfg.composureDrainDeepFog : cfg.composureDrainNormal;
  }

  public getFormattedTime(): string {
    const cfg = this.getCurrentConfig();
    const minutes = Math.floor(this.timeOfDay / 60);
    const seconds = Math.floor(this.timeOfDay % 60);
    const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `Ngày ${this.dayCount} — ${cfg.vietnameseName} (${minutes}:${secStr})`;
  }

  private syncToPlayerState(): void {
    const state = PlayerState.getInstance();
    state.dayCount = this.dayCount;
    state.timeOfDay = Math.round(this.timeOfDay * 10) / 10;
  }

  public destroy(): void {
    this.listeners.clear();
  }
}
