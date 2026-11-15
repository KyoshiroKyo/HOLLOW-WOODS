/**
 * HOLLOW WOODS V1.2 – HỆ THỐNG ÂM THANH KHÍ QUYỂN & HIỆU ỨNG GAMEPLAY
 * (PROCEDURAL WEB AUDIO SYNTHESIZER & AMBIENCE ENGINE)
 *
 * Tính năng chính:
 * 1. Tổng hợp thủ tục hoàn toàn (Procedural Synthesis) qua Web Audio API thuần (Zero 404, Zero external asset).
 * 2. Tuân thủ 100% Chính sách Autoplay của trình duyệt (Browser Autoplay Policy): mở khóa khi có thao tác người dùng.
 * 3. Ambience đa tầng theo vùng (Village, Forest, Mire, Crossing) với cơ chế Crossfade êm ái, chống phát lặp / chồng âm.
 * 4. Hệ thống bước chân 5 loại bề mặt (Grass, Dirt, Stone, Wood, Mud).
 * 5. Bộ lọc Màn Sương u ám (The Veil Low-Pass Filter) gắn kết chặt chẽ với chỉ số Bình tâm (Composure).
 * 6. Cơ chế thời gian chờ (Cooldown / Debounce) cho các âm thanh một lần (One-shot SFX) chống dội âm / méo tiếng.
 * 7. Bật / Tắt âm thanh êm ái (Smooth Gain Ramp), loại bỏ tiếng nổ lách tách (click/pop artifact).
 */

export type TerrainType = 'grass' | 'dirt' | 'stone' | 'wood' | 'mud';
export type AmbienceZone = 'village' | 'forest' | 'mire' | 'crossing';

interface AmbienceChannel {
  zone: AmbienceZone;
  gainNode: GainNode;
  nodes: (AudioNode | number)[]; // Để dọn dẹp (stop / disconnect / clearInterval)
}

export class AudioManager {
  private static instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;

  // Master Gain & The Veil BiquadFilter (Low-pass filter bóp nghẹt âm thanh trong sương)
  private masterGain: GainNode | null = null;
  private veilFilter: BiquadFilterNode | null = null;

  // Quản lý Ambience đa tầng chống lặp
  private activeAmbience: AmbienceChannel | null = null;
  private currentAmbienceZone: AmbienceZone | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private pendingAmbienceZone: AmbienceZone | null = null;
  private windGain: GainNode | null = null; // Tương thích ngược với setWindIntensity

  // Nhịp tim hoảng loạn (Heartbeat Loop)
  private heartbeatTimer: number | null = null;
  private isHeartbeatActive: boolean = false;

  // Cooldown / Debounce cho One-shot SFX (Tránh dội âm khi spam phím)
  private sfxCooldowns: Map<string, number> = new Map();

  // Cấu hình âm lượng
  public isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.85;
  private ambienceVolume: number = 0.55;

  // Trạng thái mở khóa AudioContext
  private isUnlocked: boolean = false;

  private constructor() {
    this.initAudioContext();
    this.setupAutoplayUnlock();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // =========================================================================
  // 1. KHỞI TẠO & MỞ KHÓA AUDIO CONTEXT THEO CHÍNH SÁCH TRÌNH DUYỆT
  // =========================================================================

  private initAudioContext(): void {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();

        // 1. Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        // 2. The Veil Low-Pass Filter (Mặc định 18000Hz: thông thoáng)
        this.veilFilter = this.ctx.createBiquadFilter();
        this.veilFilter.type = 'lowpass';
        this.veilFilter.frequency.setValueAtTime(18000, this.ctx.currentTime);
        this.veilFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

        // Đồ thị âm thanh: Sources -> veilFilter -> masterGain -> destination
        this.veilFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('[AudioManager] Web Audio API không được hỗ trợ hoặc bị hạn chế:', e);
    }
  }

  /**
   * Đăng ký sự kiện người dùng tương tác với trình duyệt để mở khóa âm thanh tự động
   */
  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      this.resumeAudio();
      if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
        window.removeEventListener('pointerdown', unlockHandler);
        window.removeEventListener('keydown', unlockHandler);
        window.removeEventListener('touchstart', unlockHandler);

        // Nếu có ambience đang chờ do autoplay bị hoãn, phát ngay lập tức
        if (this.pendingAmbienceZone) {
          const zone = this.pendingAmbienceZone;
          this.pendingAmbienceZone = null;
          this.setAmbienceZone(zone, 1.2);
        }
      }
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true, capture: true });
    window.addEventListener('keydown', unlockHandler, { passive: true, capture: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true, capture: true });
  }

  /**
   * Kích hoạt hoặc khôi phục AudioContext khi người chơi thao tác
   */
  public resumeAudio(): void {
    if (!this.ctx) {
      this.initAudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (this.ctx && this.ctx.state === 'running') {
      this.isUnlocked = true;
    }
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked && !!this.ctx && this.ctx.state === 'running';
  }

  // =========================================================================
  // 2. ĐIỀU CHỈNH ÂM LƯỢNG & BẬT / TẮT TIẾNG ÊM ÁI (SMOOTH MUTE)
  // =========================================================================

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = muted ? 0 : this.masterVolume;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      // Chuyển âm lượng mượt trong 0.08s loại bỏ tiếng lách tách (pop/click)
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 0.08);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Kiểm tra thời gian chờ để không dội âm khi spam phím
   */
  private checkCooldown(key: string, cooldownMs: number): boolean {
    const now = performance.now();
    const last = this.sfxCooldowns.get(key) || 0;
    if (now - last < cooldownMs) {
      return false;
    }
    this.sfxCooldowns.set(key, now);
    return true;
  }

  // =========================================================================
  // 3. BỘ LỌC KHÍ QUYỂN MÀN SƯƠNG (THE VEIL LOW-PASS FILTER)
  // =========================================================================

  public updateVeilFilter(inDeepFog: boolean, composure: number): void {
    if (!this.ctx || !this.veilFilter) return;

    let targetFreq = 18000;
    if (inDeepFog) {
      // Khi chìm trong sương mù, dải cao bị triệt tiêu, âm thanh nghẹt đặc
      targetFreq = 1600;
    }

    // Nếu chỉ số bình tâm suy giảm (< 50), tần số cắt ép xuống thấp hơn gây cảm giác bí bách
    if (composure < 50) {
      targetFreq = Math.min(targetFreq, 500 + composure * 18);
    }

    this.veilFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.35);
  }

  // =========================================================================
  // 4. TIẾNG BƯỚC CHÂN THEO 5 BỀ MẶT ĐỊA HÌNH (FOOTSTEPS SFX)
  // =========================================================================

  public playFootstep(terrain: TerrainType = 'grass'): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('footstep', 130)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (terrain) {
      case 'stone': {
        // Đá lát quảng trường Bellhollow: sắc nét, đanh, tần số cao lướt nhanh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

        gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.veilFilter);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'wood': {
        // Cầu gỗ, sàn nhà, ván gỗ đầm lầy: cộng hưởng trầm rỗng
        osc.type = 'sine';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.08);

        gain.gain.setValueAtTime(0.16 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.veilFilter);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }

      case 'mud': {
        // Bùn lầy đầm lầy: ướt át, bì bõm
        osc.type = 'sine';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.12);

        gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.veilFilter);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      case 'dirt': {
        // Đường đất khô: nện cộm, trầm đục
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

        gain.gain.setValueAtTime(0.11 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.veilFilter);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'grass':
      default: {
        // Cỏ xanh xào xạc: nhẹ nhàng, êm ái
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(135, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);

        gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.veilFilter);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }
    }
  }

  // =========================================================================
  // 5. HỆ THỐNG ÂM THANH NỀN ĐA TẦNG & CROSSFADE KHÔNG CHỒNG LẶP (AMBIENCE)
  // =========================================================================

  private getOrCreateNoiseBuffer(): AudioBuffer | null {
    if (this.noiseBuffer) return this.noiseBuffer;
    if (!this.ctx) return null;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      return this.noiseBuffer;
    } catch {
      return null;
    }
  }

  /**
   * Ánh xạ Zone ID của game sang 4 nhóm Ambience đặc thù
   */
  public mapZoneToAmbience(zoneId: string): AmbienceZone {
    if (zoneId === 'bellhollow' || zoneId === 'sanctuary_farm') {
      return 'village';
    }
    if (zoneId === 'silent_mire' || zoneId === 'ancient_rune_puzzle' || zoneId === 'broken_bell_shrine') {
      return 'mire';
    }
    if (zoneId === 'fog_crossing') {
      return 'crossing';
    }
    return 'forest'; // outer_woods, crooked_path, deep_forest, fallback
  }

  /**
   * Chuyển đổi nhạc nền sang vùng mới với hiệu ứng Crossfade mượt mà, chống tạo vòng lặp kép
   */
  public setAmbienceZone(zoneIdOrType: string, fadeDurationSec: number = 1.4): void {
    const targetZone: AmbienceZone =
      zoneIdOrType === 'village' || zoneIdOrType === 'forest' || zoneIdOrType === 'mire' || zoneIdOrType === 'crossing'
        ? zoneIdOrType
        : this.mapZoneToAmbience(zoneIdOrType);

    // Nếu AudioContext chưa được mở khóa, lưu lại để kích hoạt ngay khi người dùng chạm vào game
    if (!this.ctx || this.ctx.state === 'suspended') {
      this.pendingAmbienceZone = targetZone;
      this.resumeAudio();
      return;
    }

    // Nếu đang phát đúng loại ambience này, không tạo lại để chống chồng lặp
    if (this.currentAmbienceZone === targetZone && this.activeAmbience) {
      return;
    }

    this.currentAmbienceZone = targetZone;
    const now = this.ctx.currentTime;

    // 1. Fade-out kênh ambience cũ (nếu có)
    if (this.activeAmbience) {
      const oldChannel = this.activeAmbience;
      oldChannel.gainNode.gain.cancelScheduledValues(now);
      oldChannel.gainNode.gain.setValueAtTime(oldChannel.gainNode.gain.value, now);
      oldChannel.gainNode.gain.linearRampToValueAtTime(0.0001, now + fadeDurationSec);

      window.setTimeout(() => {
        for (const item of oldChannel.nodes) {
          if (typeof item === 'number') {
            clearInterval(item);
          } else {
            try {
              (item as AudioScheduledSourceNode).stop?.();
            } catch {}
            try {
              item.disconnect();
            } catch {}
          }
        }
      }, (fadeDurationSec + 0.1) * 1000);

      this.activeAmbience = null;
    }

    // 2. Tạo và Fade-in kênh ambience mới
    const newChannelGain = this.ctx.createGain();
    newChannelGain.gain.setValueAtTime(0.0001, now);
    newChannelGain.gain.linearRampToValueAtTime(this.ambienceVolume, now + fadeDurationSec);
    newChannelGain.connect(this.veilFilter!);
    this.windGain = newChannelGain; // Lưu lại để setWindIntensity có thể tinh chỉnh

    const nodesToTrack: (AudioNode | number)[] = [newChannelGain];
    const noiseBuffer = this.getOrCreateNoiseBuffer();

    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const bandpass = this.ctx.createBiquadFilter();

      if (targetZone === 'village') {
        // LÀNG BELLHOLLOW: Gió êm đềm, tiếng vo ve ấm áp của mái nhà và ánh lửa
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(450, now);
        bandpass.Q.setValueAtTime(1.8, now);

        const villageDrone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        villageDrone.type = 'sine';
        villageDrone.frequency.setValueAtTime(130.81, now); // C3 êm đềm
        droneGain.gain.setValueAtTime(0.035, now);

        villageDrone.connect(droneGain);
        droneGain.connect(newChannelGain);
        villageDrone.start(now);
        nodesToTrack.push(villageDrone, droneGain);

        noiseSource.connect(bandpass);
        bandpass.connect(newChannelGain);
        noiseSource.start(now);
        nodesToTrack.push(noiseSource, bandpass);

      } else if (targetZone === 'mire') {
        // ĐẦM LẦY TĨNH LẶNG: Âm trầm đục, gió rít ngột ngạt dưới lòng bùn
        bandpass.type = 'lowpass';
        bandpass.frequency.setValueAtTime(220, now);
        bandpass.Q.setValueAtTime(3.2, now);

        const mireDrone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        mireDrone.type = 'sine';
        mireDrone.frequency.setValueAtTime(48, now); // Tiếng ục ục trầm 48Hz
        droneGain.gain.setValueAtTime(0.06, now);

        mireDrone.connect(droneGain);
        droneGain.connect(newChannelGain);
        mireDrone.start(now);
        nodesToTrack.push(mireDrone, droneGain);

        noiseSource.connect(bandpass);
        bandpass.connect(newChannelGain);
        noiseSource.start(now);
        nodesToTrack.push(noiseSource, bandpass);

      } else if (targetZone === 'crossing') {
        // FOG CROSSING: Gió rít cô độc, sương giá buốt
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(340, now);
        bandpass.Q.setValueAtTime(3.5, now);

        noiseSource.connect(bandpass);
        bandpass.connect(newChannelGain);
        noiseSource.start(now);
        nodesToTrack.push(noiseSource, bandpass);

      } else {
        // RỪNG NGOÀI & ĐƯỜNG MÒN (FOREST): Gió rít ma mị, cành cây kẽo kẹt
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(270, now);
        bandpass.Q.setValueAtTime(2.6, now);

        const forestDrone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        forestDrone.type = 'sawtooth';
        forestDrone.frequency.setValueAtTime(58, now); // Dissonance nhẹ
        droneGain.gain.setValueAtTime(0.018, now);

        forestDrone.connect(droneGain);
        droneGain.connect(newChannelGain);
        forestDrone.start(now);
        nodesToTrack.push(forestDrone, droneGain);

        noiseSource.connect(bandpass);
        bandpass.connect(newChannelGain);
        noiseSource.start(now);
        nodesToTrack.push(noiseSource, bandpass);
      }
    }

    this.activeAmbience = {
      zone: targetZone,
      gainNode: newChannelGain,
      nodes: nodesToTrack
    };
  }

  /**
   * Tương thích ngược: Bắt đầu gió sương mù
   */
  public startWindAmbience(): void {
    this.setAmbienceZone('crossing', 1.5);
  }

  public setWindIntensity(intensity: number): void {
    if (!this.ctx || !this.windGain) return;
    const targetGain = Math.max(0.02, Math.min(0.25, intensity * 0.12 * this.ambienceVolume));
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);
  }

  public stopAmbience(immediate: boolean = false): void {
    if (!this.activeAmbience || !this.ctx) return;
    const now = this.ctx.currentTime;
    const channel = this.activeAmbience;

    if (immediate) {
      for (const item of channel.nodes) {
        if (typeof item === 'number') clearInterval(item);
        else {
          try { (item as AudioScheduledSourceNode).stop?.(); } catch {}
          try { item.disconnect(); } catch {}
        }
      }
    } else {
      channel.gainNode.gain.cancelScheduledValues(now);
      channel.gainNode.gain.setValueAtTime(channel.gainNode.gain.value, now);
      channel.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      window.setTimeout(() => {
        for (const item of channel.nodes) {
          if (typeof item === 'number') clearInterval(item);
          else {
            try { (item as AudioScheduledSourceNode).stop?.(); } catch {}
            try { item.disconnect(); } catch {}
          }
        }
      }, 900);
    }

    this.activeAmbience = null;
    this.currentAmbienceZone = null;
  }

  // =========================================================================
  // 6. TIẾNG NHỊP TIM ĐẬP DỒN DẬP (HEARTBEAT SFX)
  // =========================================================================

  public setHeartbeatActive(active: boolean, intervalMs: number = 800): void {
    if (this.isHeartbeatActive === active) return;
    this.isHeartbeatActive = active;

    if (active) {
      this.triggerHeartbeatBeat();
      this.heartbeatTimer = window.setInterval(() => {
        this.triggerHeartbeatBeat();
      }, intervalMs);
    } else {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    }
  }

  private triggerHeartbeatBeat(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;

    const now = this.ctx.currentTime;
    // Nhịp tim đôi (Thump-Thump)
    this.playHeartSubBeat(now, 58, 0.28);
    this.playHeartSubBeat(now + 0.14, 46, 0.2);
  }

  private playHeartSubBeat(startTime: number, freq: number, gainLevel: number): void {
    if (!this.ctx || !this.veilFilter) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(25, startTime + 0.1);

    gain.gain.setValueAtTime(gainLevel * this.sfxVolume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(startTime);
    osc.stop(startTime + 0.12);
  }

  // =========================================================================
  // 7. CÁC HIỆU ỨNG TƯƠNG TÁC, NHIỆM VỤ & THU THẬP TÀI NGUYÊN
  // =========================================================================

  /**
   * Tiếng tương tác [E] với NPC, vật thể, biển báo, rương
   */
  public playInteract(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('interact', 160)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Tiếng thu thập tài nguyên (Cành khô, nhựa cây, thảo dược, đá lửa)
   */
  public playResourceGather(resourceType?: string): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('gather', 180)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (resourceType === 'res_herbs') {
      // Tiếng ngắt lá thảo dược nhẹ nhàng
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);
    } else if (resourceType === 'res_flint') {
      // Tiếng cộc đá cứng
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
    } else {
      // Cành khô hoặc nhựa cây: gãy cành lách tách
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
    }

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Tiếng chế tạo vật phẩm thành công
   */
  public playCraftSuccess(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('craft', 250)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    // Hợp âm 3 nốt vui tươi (C5 - E5 - G5)
    const notes = [523.25, 659.25, 783.99];
    for (let i = 0; i < notes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], noteTime);

      gain.gain.setValueAtTime(0.16 * this.sfxVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.veilFilter);

      osc.start(noteTime);
      osc.stop(noteTime + 0.28);
    }
  }

  /**
   * Tiếng bật / tắt Đèn Lồng Hổ Phách
   */
  public playLanternToggle(isOn: boolean): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('lantern', 180)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (isOn) {
      // Bật đèn: Tiếng đánh lửa ấm áp lướt lên
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
    } else {
      // Tắt đèn: Tiếng tắt lửa trượt xuống
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
    }

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Tín hiệu chuông pha lê khi hoàn thành mục tiêu nhiệm vụ hoặc nhận nhiệm vụ mới
   */
  public playQuestUpdate(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('quest_update', 300)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    // Chuông 2 nốt thanh thoát (G5 -> C6)
    const chimeNotes = [783.99, 1046.50];
    for (let i = 0; i < chimeNotes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(chimeNotes[i], noteTime);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.veilFilter);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    }
  }

  // =========================================================================
  // 8. TÍN HIỆU CẢNH BÁO THE LISTENER & CHUÔNG ĐỒNG MIẾU CỔ
  // =========================================================================

  public playListenerAlert(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('listener_alert', 1200)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.5);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playBronzeBellToll(): void {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    if (!this.checkCooldown('bronze_bell', 800)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    // Chuông đồng tạo từ 4 hài âm cộng hưởng
    const freqs = [180, 360, 545, 920];
    const weights = [0.35, 0.25, 0.15, 0.08];

    for (let i = 0; i < freqs.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freqs[i], now);

      gain.gain.setValueAtTime(weights[i] * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.6);
    }
  }

  public playRunestoneResonance(noteIndex: number = 0): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('runestone', 300)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const baseFreqs = [261.63, 329.63, 392.0]; // Hợp âm C-E-G thanh tao
    const freq = baseFreqs[noteIndex % baseFreqs.length] || 300;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.8);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  /**
   * C4-12-24: Âm thanh cảnh báo khi kích hoạt sai thứ tự Cột Đá Cổ Ngữ.
   * Tiếng gầm gừ trầm đục (sawtooth + detuned sine) trượt tần số xuống vực sâu.
   */
  public playRunestoneError(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('runestone_err', 350)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(115, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.65);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(122, now); // Detuned for discordant rumble
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.65);

    gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.veilFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);
  }

  /**
   * C4-12-24: Hợp âm khải hoàn khi giải mã thành công Ba Cột Đá Cổ Ngữ (C4 - E4 - G4 - C5).
   */
  public playRunestoneChord(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('runestone_chord', 500)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const freqs = [261.63, 329.63, 392.0, 523.25];
    for (let i = 0; i < freqs.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freqs[i], now + i * 0.08);
      osc.frequency.exponentialRampToValueAtTime(freqs[i] * 1.02, now + 1.8);

      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(gain);
      gain.connect(this.veilFilter);

      osc.start(now + i * 0.08);
      osc.stop(now + 2.1);
    }
  }

  // =========================================================================
  // 9. DỌN DẸP & GIẢI PHÓNG TÀI NGUYÊN (CLEANUP)
  // =========================================================================

  /**
   * C4-13-03: Dừng toàn bộ âm thanh môi trường và nhịp tim
   */
  public stopAll(): void {
    this.stopAmbience(true);
    this.setHeartbeatActive(false);
  }

  /**
   * C4-13-03: Hiệu ứng âm thanh khi nhân vật chịu đòn đau hoặc ngã gục
   */
  public playHurt(): void {
    if (!this.isUnlocked || !this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public destroy(): void {
    this.stopAmbience(true);
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    this.isUnlocked = false;
    AudioManager.instance = null;
  }
}
