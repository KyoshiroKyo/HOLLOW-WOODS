/**
 * HOLLOW WOODS V3.0 – HỆ THỐNG ÂM THANH KHÍ QUYỂN (WEB AUDIO SYNTHESIZER)
 * Quản lý và tổng hợp âm thanh thủ tục (procedural synthesis) bằng Web Audio API thuần.
 * Không phụ thuộc vào asset âm thanh bên ngoài, chống lỗi 404 và tối ưu dung lượng.
 */

export type TerrainType = 'grass' | 'dirt' | 'mud';

export class AudioManager {
  private static instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;

  // Master Gain & BiquadFilter (The Veil Muffled Filter)
  private masterGain: GainNode | null = null;
  private veilFilter: BiquadFilterNode | null = null;

  // Khí quyển sương mù (Wind Ambience Loop)
  private windGain: GainNode | null = null;
  private isWindPlaying: boolean = false;

  // Nhịp tim hoảng loạn (Heartbeat Loop)
  private heartbeatTimer: number | null = null;
  private isHeartbeatActive: boolean = false;

  // Cấu hình âm lượng
  public isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private sfxVolume: number = 0.9;
  private ambienceVolume: number = 0.6;

  private constructor() {
    this.initAudioContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initAudioContext(): void {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();

        // 1. Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        // 2. The Veil Low-Pass Filter (Hiệu ứng bóp nghẹt âm thanh u ám trong sương)
        this.veilFilter = this.ctx.createBiquadFilter();
        this.veilFilter.type = 'lowpass';
        this.veilFilter.frequency.setValueAtTime(18000, this.ctx.currentTime); // Bình thường: thông thoáng
        this.veilFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

        // Kết nối đồ thị âm thanh: Source -> veilFilter -> masterGain -> destination
        this.veilFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio API không được hỗ trợ hoặc bị chặn trên môi trường này:', e);
    }
  }

  /**
   * Kích hoạt lại AudioContext khi người chơi bấm phím/click chuột
   */
  public resumeAudio(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Cập nhật bộ lọc âm thanh của Màn Sương (The Veil Muffled Effect)
   * @param inDeepFog Có đang trong vùng sương mù dày đặc hay không
   * @param composure Chỉ số bình tâm (0–100)
   */
  public updateVeilFilter(inDeepFog: boolean, composure: number): void {
    if (!this.ctx || !this.veilFilter) return;

    let targetFreq = 18000;
    if (inDeepFog) {
      // Khi ở trong sương, âm thanh bị nghẹt lại, tần số cắt giảm xuống 1200Hz - 2200Hz
      targetFreq = 1600;
    }

    // Nếu bình tâm suy giảm nghiêm trọng (< 50), âm thanh càng bí bách hoảng loạn
    if (composure < 50) {
      targetFreq = Math.min(targetFreq, 600 + composure * 15);
    }

    this.veilFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.3);
  }

  // =========================================================================
  // 1. TIẾNG BƯỚC CHÂN SATYR TRÊN CÁC LOẠI ĐỊA HÌNH
  // =========================================================================

  public playFootstep(terrain: TerrainType = 'grass'): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (terrain === 'grass') {
      // Tiếng xào xạc nhẹ: tần số thấp lướt nhanh
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    } else if (terrain === 'mud') {
      // Tiếng bì bõm đầm lầy: tần số trầm và ẩm
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      gain.gain.setValueAtTime(0.14 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else {
      // Đất khô / đường mòn: tiếng nện cộm
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

      gain.gain.setValueAtTime(0.1 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    }

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // =========================================================================
  // 2. TIẾNG GIÓ RÍT MÀN SƯƠNG (THE VEIL WIND AMBIENCE)
  // =========================================================================

  public startWindAmbience(): void {
    if (!this.ctx || this.isWindPlaying || !this.veilFilter) return;
    this.resumeAudio();

    try {
      // Tạo Noise Buffer 2 giây
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter tạo tiếng gió rít u ám
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(260, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.06 * this.ambienceVolume, this.ctx.currentTime);

      whiteNoise.connect(bandpass);
      bandpass.connect(this.windGain);
      this.windGain.connect(this.veilFilter);

      whiteNoise.start();
      this.isWindPlaying = true;
    } catch {
      // Fallback nếu không tạo được noise
    }
  }

  public setWindIntensity(intensity: number): void {
    if (!this.ctx || !this.windGain) return;
    const targetGain = Math.max(0.02, Math.min(0.2, intensity * 0.12 * this.ambienceVolume));
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);
  }

  // =========================================================================
  // 3. TIẾNG NHỊP TIM ĐẬP DỒN DẬP (HEARTBEAT HOẢNG LOẠN)
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
  // 4. TÍN HIỆU CẢNH BÁO CỦA KẺ LẮNG NGHE (THE LISTENER TELEGRAPH)
  // =========================================================================

  public playListenerAlert(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Âm thanh kim loại ma mị rùng rợn: lướt từ tần số cao xuống thấp
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

  // =========================================================================
  // 5. TIẾNG CHUÔNG ĐỒNG BELLHOLLOW (BRONZE BELL TOLL)
  // =========================================================================

  public playBronzeBellToll(): void {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    // Chuông đồng tạo từ 3 hài âm cộng hưởng (Fundamental + Harmonics)
    const freqs = [180, 360, 545, 920];
    const weights = [0.35, 0.25, 0.15, 0.08];

    for (let i = 0; i < freqs.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freqs[i], now);

      gain.gain.setValueAtTime(weights[i] * this.masterVolume, now);
      // Tiếng chuông ngân dài 3.5 giây rồi tắt dần
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.6);
    }
  }

  // =========================================================================
  // 6. ÂM VANG 3 CỘT ĐÁ ĐẦM LẦY (RUNESTONE RESONANCE)
  // =========================================================================

  public playRunestoneResonance(noteIndex: number = 0): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
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

  // =========================================================================
  // 7. HIỆU ỨNG TƯƠNG TÁC & VẬT PHẨM (UI / INTERACTION SFX)
  // =========================================================================

  public playCraftSuccess(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(480, now + 0.08);
    osc.frequency.setValueAtTime(640, now + 0.16);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playLanternToggle(isOn: boolean): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (isOn) {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    } else {
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    }

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // =========================================================================
  // DỌN DẸP & GIẢI PHÓNG TÀI NGUYÊN (CLEANUP)
  // =========================================================================

  public destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    AudioManager.instance = null;
  }
}

