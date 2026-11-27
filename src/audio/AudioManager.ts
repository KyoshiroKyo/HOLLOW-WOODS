/**
 * HOLLOW WOODS V1.3.2 – HỆ THỐNG ÂM THANH KHÍ QUYỂN & HIỆU ỨNG GAMEPLAY
 * (HYBRID PROCEDURAL & SAMPLED WEB AUDIO ENGINE)
 *
 * Tính năng chính:
 * 1. Kiến trúc Hybrid: Tự động nạp các âm thanh mẫu chất lượng cao (Sampled SFX) từ nguồn Horror & Pixel SFX,
 *    đồng thời duy trì bộ tổng hợp thủ tục (Procedural Synth) làm lớp bảo vệ dự phòng không độ trễ (Zero 404).
 * 2. Bộ nén đỉnh âm lượng Master (Master Limiter / DynamicsCompressorNode): Triệt tiêu hoàn toàn hiện tượng
 *    vỡ âm kỹ thuật số (digital clipping) hay ré âm chói tai khi nhiều nguồn âm phát cùng lúc.
 * 3. Chống lỗi bùng nổ tham số âm học (AudioParam Glitch Protection): Kiểm tra ngưỡng thay đổi trước khi
 *    lập lịch điều biến tần số lọc The Veil và cường độ gió, chấm dứt tiếng rít giật bất ngờ khi di chuyển trong sương.
 * 4. Tuân thủ 100% Chính sách Autoplay của trình duyệt: mở khóa êm ái khi có thao tác người dùng.
 * 5. Ambience đa tầng theo vùng (Village, Forest, Mire, Crossing) với cơ chế Crossfade êm dịu, không chồng lặp.
 * 6. Hệ thống bước chân 5 loại bề mặt (Grass, Dirt, Stone, Wood, Mud).
 * 7. Cơ chế thời gian chờ (Cooldown / Debounce) cho các One-shot SFX chống dội âm / méo tiếng.
 * 8. Bật / Tắt âm thanh êm ái (Smooth Gain Ramp), loại bỏ hoàn toàn tiếng nổ lách tách (click/pop artifact).
 */

export type TerrainType = 'grass' | 'dirt' | 'stone' | 'wood' | 'mud';
export type AmbienceZone = 'village' | 'forest' | 'mire' | 'crossing';

// V15-39: Định nghĩa 5 bản nhạc nền nghệ thuật (The Knight's Quiet Fire & Environmental Tracks)
export type BGMTrack =
  | 'bgm_knights_quiet_fire'
  | 'bgm_embervale'
  | 'bgm_beyond_the_hills'
  | 'bgm_evergrove'
  | 'bgm_forgotten_orchard';

// V15-FIX-04: Danh mục đường dẫn 5 bản nhạc nền Streaming
export const BGM_MANIFEST: Record<BGMTrack, string> = {
  bgm_knights_quiet_fire: 'assets/audio/bgm/knights_quiet_fire.mp3',
  bgm_embervale: 'assets/audio/bgm/embervale.mp3',
  bgm_beyond_the_hills: 'assets/audio/bgm/beyond_the_hills.mp3',
  bgm_evergrove: 'assets/audio/bgm/evergrove.mp3',
  bgm_forgotten_orchard: 'assets/audio/bgm/forgotten_orchard.mp3'
};

// V15-FIX-04: Nhóm 1 - CORE_SFX (nạp ngay lúc khởi động game)
export const CORE_SFX_MANIFEST: Record<string, string> = {
  ui_select: 'assets/audio/sfx/ui_select.wav',
  ui_confirm: 'assets/audio/sfx/ui_confirm.wav',
  ui_cancel: 'assets/audio/sfx/ui_cancel.wav',
  dialogue_garth: 'assets/audio/dialogue/dialogue_garth.wav',
  dialogue_edda: 'assets/audio/dialogue/dialogue_edda.wav',
  dialogue_neris: 'assets/audio/dialogue/dialogue_neris.wav',
  dialogue_bram: 'assets/audio/dialogue/dialogue_bram.wav',
  dialogue_finn: 'assets/audio/dialogue/dialogue_finn.wav',
  dialogue_text_blip: 'assets/audio/dialogue/dialogue_text_blip.wav',
  dialogue_blip: 'assets/audio/dialogue/dialogue_text_blip.wav',
  footstep_grass: 'assets/audio/sfx/footstep_grass.mp3',
  footstep_wood_1: 'assets/audio/sfx/v14/footstep_wood_1.wav',
  footstep_stone_1: 'assets/audio/sfx/v14/footstep_stone_1.wav',
  interact: 'assets/audio/sfx/interact.wav',
  craft: 'assets/audio/sfx/craft_success.wav',
  gather: 'assets/audio/sfx/resource_gather.mp3',
  heal_poultice: 'assets/audio/sfx/heal_poultice.wav',
  oil_refill: 'assets/audio/sfx/oil_refill.wav',
  lantern: 'assets/audio/sfx/lantern_toggle.mp3',
  hurt: 'assets/audio/sfx/hurt.wav',
  death: 'assets/audio/sfx/player_death.wav',
  attack: 'assets/audio/sfx/attack_swing.mp3',
  bush_rustle: 'assets/audio/sfx/bush_rustle.mp3',
  quest_update: 'assets/audio/sfx/quest_update.wav',
  bronze_bell: 'assets/audio/sfx/bell_low.mp3',
  listener_alert: 'assets/audio/sfx/listener_alert.mp3',
  herb_gather: 'assets/audio/sfx/herb_gather.wav',
  monster_step: 'assets/audio/sfx/monster_step.mp3',
  ambience_village: 'assets/audio/ambience/ambience_village.mp3',
  ambience_forest: 'assets/audio/ambience/ambience_forest.mp3',
  ambience_mire: 'assets/audio/ambience/ambience_mire.mp3',
  ambience_crossing: 'assets/audio/ambience/ambience_crossing.mp3'
};

// V15-FIX-04: Nhóm 2 - LAZY_SFX (tải theo nhu cầu / phân khu)
export const LAZY_SFX_MANIFEST: Record<string, string> = {
  footstep_mud_1: 'assets/audio/sfx/v14/footstep_mud_1.wav',
  footstep_mud_2: 'assets/audio/sfx/v14/footstep_mud_2.wav',
  footstep_wood_2: 'assets/audio/sfx/v14/footstep_wood_2.wav',
  footstep_stone_2: 'assets/audio/sfx/v14/footstep_stone_2.wav',
  footstep_leaves_1: 'assets/audio/sfx/v14/footstep_leaves_1.mp3',
  runestone: 'assets/audio/sfx/rune_resonance.mp3',
  runestone_err: 'assets/audio/sfx/rune_error.mp3',
  bat_flap: 'assets/audio/sfx/v14/bat_flap.wav',
  bat_screech: 'assets/audio/sfx/v14/bat_screech.wav',
  bat_bite: 'assets/audio/sfx/v14/bat_bite.wav',
  ghost_moan: 'assets/audio/sfx/v14/ghost_moan.wav',
  ghost_whisper: 'assets/audio/sfx/v14/ghost_whisper.wav',
  ghost_scream: 'assets/audio/sfx/v14/ghost_scream.wav',
  ghost_dissipate: 'assets/audio/sfx/v14/ghost_dissipate.wav',
  jumpscare_stinger: 'assets/audio/sfx/v14/jumpscare_stinger.wav',
  sanity_gasp: 'assets/audio/sfx/v14/sanity_gasp.wav',
  scout_whistle: 'assets/audio/sfx/v14/scout_whistle.wav',
  dagger_slash: 'assets/audio/sfx/v14/dagger_slash.wav',
  skull_wolf_growl: 'assets/audio/sfx/v14/skull_wolf_growl.wav',
  skull_wolf_snarl: 'assets/audio/sfx/v14/skull_wolf_snarl.wav',
  behemoth_roar: 'assets/audio/sfx/v14/behemoth_roar.wav',
  behemoth_thud: 'assets/audio/sfx/v14/behemoth_thud.wav',
  void_stalker_drone: 'assets/audio/sfx/v14/void_stalker_drone.wav',
  void_stalker_screech: 'assets/audio/sfx/v14/void_stalker_screech.wav',
  boss_drone: 'assets/audio/sfx/v14/boss_drone.wav',
  rune_shift: 'assets/audio/sfx/v14/rune_shift.wav',
  bell_toll_low: 'assets/audio/sfx/v14/bell_toll_low.wav',
  chest_creak: 'assets/audio/sfx/v14/chest_creak.wav',
  journal_page: 'assets/audio/sfx/v14/journal_page.wav'
};

export const ZONE_SFX_MAP: Record<string, string[]> = {
  bellhollow: ['chest_creak', 'journal_page'],
  sanctuary_farm: ['chest_creak', 'journal_page'],
  sub_bell_workshop: ['chest_creak', 'journal_page'],
  sub_root_cellar: ['chest_creak', 'journal_page'],
  outer_woods: ['skull_wolf_growl', 'skull_wolf_snarl', 'footstep_leaves_1', 'bat_flap', 'bat_screech', 'jumpscare_stinger', 'sanity_gasp', 'dagger_slash'],
  fog_crossing: ['ambience_crossing', 'footstep_leaves_1', 'ghost_whisper', 'jumpscare_stinger', 'sanity_gasp'],
  crooked_path: ['ambience_crossing', 'skull_wolf_growl', 'skull_wolf_snarl', 'bat_flap', 'bat_screech', 'jumpscare_stinger', 'sanity_gasp'],
  sub_whispering_clearing: ['ghost_whisper', 'ghost_moan', 'sanity_gasp'],
  silent_mire: ['ambience_mire', 'footstep_mud_1', 'footstep_mud_2', 'footstep_stone_2', 'rune_shift', 'runestone', 'runestone_err', 'bell_toll_low', 'behemoth_roar', 'behemoth_thud'],
  ancient_rune_puzzle: ['runestone', 'runestone_err', 'rune_shift', 'footstep_mud_1', 'footstep_stone_2', 'bell_toll_low'],
  drowned_mire_depths: ['ambience_mire', 'footstep_mud_1', 'footstep_mud_2', 'rune_shift', 'behemoth_roar', 'behemoth_thud', 'bell_toll_low'],
  broken_bell_shrine: ['bell_toll_low', 'rune_shift', 'runestone', 'runestone_err', 'chest_creak', 'journal_page'],
  deep_forest: ['footstep_leaves_1', 'footstep_stone_2', 'ghost_moan', 'ghost_whisper', 'ghost_scream', 'ghost_dissipate', 'scout_whistle', 'void_stalker_drone', 'void_stalker_screech'],
  whispering_grove_sanctum: ['ghost_whisper', 'ghost_moan', 'ghost_dissipate', 'boss_drone'],
  sunken_crypt_ruins: ['footstep_stone_2', 'ghost_scream', 'ghost_dissipate', 'void_stalker_drone', 'void_stalker_screech', 'boss_drone'],
  veil_origin_cavern: ['void_stalker_drone', 'void_stalker_screech', 'boss_drone', 'ghost_scream'],
  abyssal_chasm: ['void_stalker_drone', 'void_stalker_screech', 'boss_drone', 'ghost_scream']
};

interface AmbienceChannel {
  zone: AmbienceZone;
  gainNode: GainNode;
  nodes: (AudioNode | number)[]; // Để dọn dẹp (stop / disconnect / clearInterval)
}

export class AudioManager {
  private static instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;

  // V15-39 & V15-FIX-04: Quản lý kênh Nhạc Nền BGM Streaming qua HTMLAudioElement
  private currentBGMTrack: BGMTrack | null = null;
  private currentBGMAudio: HTMLAudioElement | null = null;
  private currentBGMVolumeScale: number = 1.0;
  private bgmVolume: number = 0.55;
  private isBGMSuppressed: boolean = false;
  private pendingBGMTrack: { track: BGMTrack; fadeDuration: number; volumeScale: number } | null = null;
  private fadingBGMAudios: { audio: HTMLAudioElement; intervalId: number }[] = [];
  private activeBGMRampInterval: number | null = null;
  private isSanctuaryMusicOnly: boolean = false;
  private savedPreSanctuaryAmbienceZone: AmbienceZone | null = null;

  // Khả năng tương thích ngược
  private currentBGMSource: AudioBufferSourceNode | null = null;
  private currentBGMGain: GainNode | null = null;
  private fadingBGMSources: { source: AudioBufferSourceNode; gain: GainNode; timerId: number }[] = [];

  // Master Gain, Master Limiter & The Veil BiquadFilter (Low-pass filter bóp nghẹt âm thanh trong sương)
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private veilFilter: BiquadFilterNode | null = null;
  private synthFilter: BiquadFilterNode | null = null; // C4-133: Lowpass 5200Hz cho Synth/Noise loại bỏ rít chói tai
  private ambienceFilter: BiquadFilterNode | null = null; // C4-135: Lowpass 2600Hz cho Ambience khử triệt để mọi tiếng rít cao tần

  // Quản lý kênh SFX đồng thời (giới hạn tối đa 4 kênh trùng lặp để chống dội âm / méo tiếng)
  private activeSFXChannels: Map<string, { source: AudioBufferSourceNode; gain: GainNode }[]> = new Map();

  // Bộ nhớ đệm tệp âm thanh mẫu (Sampled Audio Cache)
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private loadingBuffers: Set<string> = new Set();

  // Quản lý Ambience đa tầng chống lặp
  private activeAmbience: AmbienceChannel | null = null;
  private fadingChannels: { channel: AmbienceChannel; timerId: number }[] = [];
  private currentAmbienceZone: AmbienceZone | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private pendingAmbienceZone: AmbienceZone | null = null;
  private windGain: GainNode | null = null; // Tương thích ngược với setWindIntensity
  private rainGain: GainNode | null = null; // V1.4: Kênh âm thanh mưa sương
  private rainSource: AudioBufferSourceNode | null = null; // V15-FIX-02: Tham chiếu nguồn phát tiếng mưa chống rò rỉ loop
  private lastRainTargetGain: number = -1;

  // Tránh spam lập lịch AudioParam gây xung đột / bùng nổ bộ lọc số IIR
  private lastVeilTargetFreq: number = 18000;
  private lastWindTargetGain: number = -1;
  private lastWindIntensity: number = -1;

  // Nhịp tim hoảng loạn (Heartbeat Loop)
  private heartbeatTimer: number | null = null;
  private isHeartbeatActive: boolean = false;
  // V15-58C: Hệ thống nhịp tim Web Audio động & dìm âm tâm lý (Dynamic Heartbeat & Sanity Ducking)
  private currentHeartbeatBpm: number = 75;
  private currentHeartbeatIntervalMs: number = 800;
  private currentHeartbeatGain: number = 0.28;
  private isSanityDucked: boolean = false;

  // Cooldown / Debounce cho One-shot SFX (Tránh dội âm khi spam phím)
  private sfxCooldowns: Map<string, number> = new Map();

  // V1.4: Biến thiên chống lặp ngẫu nhiên (No-Repeat Shuffle Cache) & Chặn chồng Jumpscare (3.0s Lockout)
  private lastAmbushTriggerTime: number = 0;
  private lastPlayedSamples: Map<string, string> = new Map();

  // V1.4: Quản lý vòng lặp Drone áp lực khi Boss thức tỉnh (Boss Awakening Drone)
  private bossDroneSource: AudioBufferSourceNode | null = null;
  private bossDroneGain: GainNode | null = null;
  private isBossAwakened: boolean = false;

  // V1.4 - P7: Hệ thống ưu tiên âm thanh & Dìm âm nền (Audio Priority & Ducking)
  private isDucked: boolean = false;
  private duckTimer: number | null = null;
  private currentDuckFactor: number = 1.0;

  // Cấu hình âm lượng phân tầng chuẩn V1.4 (Master 1.0 = 0dB; Ambience 0.25 = -12dB; SFX 0.85 = -1.4dB)
  public isMuted: boolean = false;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.85;
  private ambienceVolume: number = 0.25;

  // Trạng thái mở khóa AudioContext
  private isUnlocked: boolean = false;
  private boundUnlockHandler: (() => void) | null = null;
  private static readonly AUTOPLAY_UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'mousedown', 'click'] as const;

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

        // 2. Master Limiter / DynamicsCompressorNode nối trực tiếp vào đầu ra tổng (masterGain -> compressor -> destination)
        // Chặn đứng hoàn toàn hiện tượng vỡ âm kỹ thuật số (clipping) khi nhiều âm thanh phát cùng lúc
        this.masterLimiter = this.ctx.createDynamicsCompressor();
        this.masterLimiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
        this.masterLimiter.knee.setValueAtTime(10, this.ctx.currentTime);
        this.masterLimiter.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.masterLimiter.release.setValueAtTime(0.18, this.ctx.currentTime);

        // 3. The Veil Low-Pass Filter (Mặc định 18000Hz: thông thoáng, Q = 0.707 Butterworth chống đỉnh cộng hưởng chói tai)
        this.veilFilter = this.ctx.createBiquadFilter();
        this.veilFilter.type = 'lowpass';
        this.veilFilter.frequency.setValueAtTime(18000, this.ctx.currentTime);
        this.veilFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

        // 4. Synth Low-Pass Filter (Cắt 5200Hz cho các nguồn âm tổng hợp/nhiễu trắng, triệt tiêu 100% tiếng rít chói tai)
        this.synthFilter = this.ctx.createBiquadFilter();
        this.synthFilter.type = 'lowpass';
        this.synthFilter.frequency.setValueAtTime(5200, this.ctx.currentTime);
        this.synthFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

        // 5. Ambience Low-Pass Filter (AUDIO-HOTFIX-01: Cắt 3600Hz cho nhạc nền/tiếng gió/khí quyển, loại bỏ sạch dải cao rít kim loại mà không làm nghẹt âm thanh tự nhiên)
        this.ambienceFilter = this.ctx.createBiquadFilter();
        this.ambienceFilter.type = 'lowpass';
        this.ambienceFilter.frequency.setValueAtTime(3600, this.ctx.currentTime);
        this.ambienceFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

        // Đồ thị âm thanh chuẩn hóa:
        // Procedural Synth -> synthFilter -> veilFilter -> masterGain -> masterLimiter -> ctx.destination
        // Ambience Channels -> ambienceFilter -> veilFilter -> masterGain -> masterLimiter -> ctx.destination
        // Direct Sampled SFX -> veilFilter -> masterGain -> masterLimiter -> ctx.destination
        this.synthFilter.connect(this.veilFilter);
        this.ambienceFilter.connect(this.veilFilter);
        this.veilFilter.connect(this.masterGain);
        this.masterGain.connect(this.masterLimiter);
        this.masterLimiter.connect(this.ctx.destination);

        // Nạp trước các tệp âm thanh mẫu
        this.preloadSampledAudio();
      }
    } catch (e) {
      console.warn('[AudioManager] Web Audio API không được hỗ trợ hoặc bị hạn chế:', e);
    }
  }

  /**
   * V15-FIX-04: Tính toán âm lượng BGM thực tế sau khi tính Master, BGM Slider, Hệ số vùng và Trạng thái Tinh thần
   */
  private calculateEffectiveBGMVolume(scale?: number): number {
    if (this.isMuted) return 0;
    if (this.isBGMSuppressed) return 0;
    const s = typeof scale === 'number' ? scale : this.currentBGMVolumeScale;
    const sanityMultiplier = this.isSanityDucked ? 0.45 : 1.0;
    return Math.max(0, Math.min(1, this.masterVolume * this.bgmVolume * s * sanityMultiplier));
  }

  /**
   * V15-FIX-04: Hiệu ứng chuyển âm lượng mượt mà (Fade/Crossfade) cho HTMLAudioElement
   */
  private rampAudioVolume(
    audio: HTMLAudioElement,
    targetVolume: number,
    durationSec: number,
    onComplete?: () => void
  ): number {
    const clampedTarget = Math.max(0, Math.min(1, targetVolume));
    const startVolume = audio.volume;
    const startTime = performance.now();
    const durationMs = Math.max(20, durationSec * 1000);

    const intervalId = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const newVol = startVolume + (clampedTarget - startVolume) * progress;
      try {
        audio.volume = Math.max(0, Math.min(1, newVol));
      } catch {}

      if (progress >= 1) {
        window.clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 25);

    return intervalId;
  }

  /**
   * V15-FIX-04: Nạp trước các tệp âm thanh cốt lõi (CORE_SFX) lúc khởi động.
   * Các tệp âm thanh phụ và BGM chuyển sang tải theo nhu cầu (Lazy Loading / Streaming)
   */
  private preloadSampledAudio(): void {
    if (!this.ctx || typeof window === 'undefined') return;

    for (const [key, url] of Object.entries(CORE_SFX_MANIFEST)) {
      this.loadAudioBuffer(key, url);
    }
  }

  /**
   * V15-FIX-04: Nạp đơn lẻ AudioBuffer bất đồng bộ vào bộ đệm (hỗ trợ gọi theo nhu cầu)
   */
  public async loadAudioBuffer(key: string, url: string): Promise<AudioBuffer | null> {
    if (!this.ctx || typeof window === 'undefined') return null;
    if (this.audioBuffers.has(key)) return this.audioBuffers.get(key)!;
    if (this.loadingBuffers.has(key)) return null;

    this.loadingBuffers.add(key);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      if (!this.ctx) return null;
      const decodedBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      if (decodedBuffer) {
        if (key.startsWith('ambience_') || key.startsWith('bgm_')) {
          this.smoothAudioBufferLoopEdges(decodedBuffer);
        }
        this.audioBuffers.set(key, decodedBuffer);
        if (key === 'skull_wolf_growl') this.audioBuffers.set('wolf_growl', decodedBuffer);
        if (key === 'skull_wolf_snarl') this.audioBuffers.set('wolf_lunge', decodedBuffer);
        return decodedBuffer;
      }
      return null;
    } catch {
      return null;
    } finally {
      this.loadingBuffers.delete(key);
    }
  }

  /**
   * V15-FIX-04: Nạp trước các tệp âm thanh đặc thù cho phân khu (Lazy Preload per Zone)
   */
  public preloadZoneAudio(zoneId: string): void {
    const keys = ZONE_SFX_MAP[zoneId];
    if (!keys || !Array.isArray(keys)) return;
    for (const key of keys) {
      if (!this.audioBuffers.has(key) && !this.loadingBuffers.has(key) && LAZY_SFX_MANIFEST[key]) {
        this.loadAudioBuffer(key, LAZY_SFX_MANIFEST[key]);
      }
    }
  }

  /**
   * AUDIO-HOTFIX-01: Khử giật ở điểm tiếp giáp vòng lặp (Loop Seam Smoothing)
   * Áp dụng cross-fade 50ms giữa đầu và đuôi AudioBuffer, loại bỏ 100% tiếng nổ lách tách/click khi lặp
   */
  private smoothAudioBufferLoopEdges(buffer: AudioBuffer): void {
    try {
      const fadeSamples = Math.min(Math.floor(buffer.sampleRate * 0.05), Math.floor(buffer.length * 0.1));
      if (fadeSamples <= 0) return;
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        const len = data.length;
        for (let i = 0; i < fadeSamples; i++) {
          const alpha = i / fadeSamples;
          const head = data[i];
          const tail = data[len - fadeSamples + i];
          const blended = head * alpha + tail * (1 - alpha);
          data[i] = blended;
          data[len - fadeSamples + i] = blended;
        }
      }
    } catch {}
  }

  /**
   * C4-133-02 & AUDIO-HOTFIX-01: Đồng bộ nhanh các AudioBuffer từ Phaser Cache nạp trước ở PreloadScene
   */
  public syncWithPhaserCache(scene: any): void {
    if (!scene || !scene.cache || !scene.cache.audio) return;
    const audioKeys = [
      'ambience_village', 'ambience_forest', 'ambience_mire', 'ambience_crossing',
      'attack_swing', 'bell_low', 'bush_rustle', 'craft_success', 'footstep_grass',
      'herb_gather', 'hurt', 'interact', 'lantern_toggle', 'listener_alert',
      'monster_step', 'player_death', 'quest_update', 'resource_gather',
      'rune_error', 'rune_resonance', 'ui_select', 'ui_confirm', 'ui_cancel',
      'heal_poultice', 'oil_refill', 'dialogue_garth', 'dialogue_edda',
      'dialogue_neris', 'dialogue_bram', 'dialogue_finn', 'dialogue_text_blip',
      'footstep_mud_1', 'footstep_mud_2', 'footstep_wood_1', 'footstep_wood_2',
      'footstep_stone_1', 'footstep_stone_2', 'footstep_leaves_1',
      'bat_flap', 'bat_screech', 'bat_bite', 'ghost_moan', 'ghost_whisper',
      'ghost_scream', 'ghost_dissipate', 'jumpscare_stinger', 'sanity_gasp',
      'scout_whistle', 'dagger_slash', 'skull_wolf_growl', 'skull_wolf_snarl',
      'behemoth_roar', 'behemoth_thud', 'void_stalker_drone', 'void_stalker_screech',
      'boss_drone', 'rune_shift', 'bell_toll_low', 'chest_creak', 'journal_page',
      'bgm_knights_quiet_fire', 'bgm_embervale', 'bgm_beyond_the_hills', 'bgm_evergrove', 'bgm_forgotten_orchard'
    ];
    for (const key of audioKeys) {
      if (scene.cache.audio.has(key)) {
        const audioData = scene.cache.audio.get(key);
        if (audioData && typeof audioData.getChannelData === 'function') {
          if (key.startsWith('ambience_') || key.startsWith('bgm_')) {
            this.smoothAudioBufferLoopEdges(audioData);
          }
          this.audioBuffers.set(key, audioData);
          if (key === 'attack_swing') this.audioBuffers.set('attack', audioData);
          if (key === 'bell_low') this.audioBuffers.set('bronze_bell', audioData);
          if (key === 'resource_gather') this.audioBuffers.set('gather', audioData);
          if (key === 'rune_error') this.audioBuffers.set('runestone_err', audioData);
          if (key === 'rune_resonance') this.audioBuffers.set('runestone', audioData);
          if (key === 'lantern_toggle') this.audioBuffers.set('lantern', audioData);
          if (key === 'player_death') this.audioBuffers.set('death', audioData);
          if (key === 'dialogue_text_blip') this.audioBuffers.set('dialogue_blip', audioData);
          if (key === 'skull_wolf_growl') this.audioBuffers.set('wolf_growl', audioData);
          if (key === 'skull_wolf_snarl') this.audioBuffers.set('wolf_lunge', audioData);

          if (this.pendingBGMTrack && this.pendingBGMTrack.track === key && this.ctx && this.ctx.state === 'running') {
            const pending = this.pendingBGMTrack;
            this.pendingBGMTrack = null;
            this.playBGM(pending.track, pending.fadeDuration, pending.volumeScale);
          }
        }
      }
    }
  }

  /**
   * V1.4: Thuật toán chống trùng liên tiếp (No-Repeat Shuffle)
   */
  public getNoRepeatSample(category: string, candidates: string[]): string {
    if (candidates.length <= 1) return candidates[0];
    const last = this.lastPlayedSamples.get(category);
    const available = candidates.filter(c => c !== last);
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.lastPlayedSamples.set(category, chosen);
    return chosen;
  }

  /**
   * V1.4: Biến thiên ngẫu nhiên (Pitch & Volume Jitter) loại bỏ cảm giác lặp máy móc
   */
  public applyJitter(
    baseVolume: number,
    volumeJitterPercent: number = 0.10, // ±10%
    minPitch: number = 0.92,
    maxPitch: number = 1.08
  ): { volume: number; pitch: number } {
    const volJitter = (Math.random() * 2 - 1) * volumeJitterPercent;
    const volume = Math.max(0.01, baseVolume * (1 + volJitter));
    const pitch = minPitch + Math.random() * (maxPitch - minPitch);
    return { volume, pitch };
  }

  /**
   * Phát tệp âm thanh mẫu đã nạp trong bộ đệm (giới hạn đa âm Polyphony linh hoạt theo từng loại, giải phóng sạch qua onended)
   */
  public playSampled(
    key: string,
    volume: number = 1.0,
    playbackRate: number = 1.0,
    routeToVeil: boolean = true,
    maxPolyphony: number = 4
  ): boolean {
    if (!this.ctx || this.isMuted) return false;
    const buffer = this.audioBuffers.get(key);
    if (!buffer) {
      if (LAZY_SFX_MANIFEST[key]) {
        this.loadAudioBuffer(key, LAZY_SFX_MANIFEST[key]);
      }
      return false;
    }

    try {
      this.resumeAudio();

      // Giới hạn số lượng âm thanh SFX trùng lặp tối đa theo maxPolyphony (VD: 3 cho bước chân, 2 cho quái)
      const channels = this.activeSFXChannels.get(key) || [];
      while (channels.length >= maxPolyphony) {
        const oldest = channels.shift();
        if (oldest) {
          const t = this.ctx.currentTime;
          oldest.gain.gain.cancelScheduledValues(t);
          oldest.gain.gain.setValueAtTime(oldest.gain.gain.value, t);
          oldest.gain.gain.setTargetAtTime(0.0001, t, 0.025);
          setTimeout(() => {
            try { oldest.source.stop(); } catch {}
            try { oldest.source.disconnect(); oldest.gain.disconnect(); } catch {}
          }, 35);
        }
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.setValueAtTime(playbackRate, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * this.sfxVolume, this.ctx.currentTime);

      source.connect(gain);
      const targetNode = routeToVeil && this.veilFilter ? this.veilFilter : this.masterGain!;
      gain.connect(targetNode);

      channels.push({ source, gain });
      this.activeSFXChannels.set(key, channels);

      source.onended = () => {
        const list = this.activeSFXChannels.get(key);
        if (list) {
          this.activeSFXChannels.set(key, list.filter(item => item.source !== source));
        }
        try {
          source.disconnect();
          gain.disconnect();
        } catch {}
      };

      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Đăng ký sự kiện người dùng tương tác với trình duyệt để mở khóa âm thanh tự động
   */
  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined' || this.isUnlocked) return;
    this.cleanupAutoplayUnlock();

    const unlockHandler = () => {
      this.resumeAudio();
      if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
        this.cleanupAutoplayUnlock();
        this.preloadSampledAudio();
        if (this.pendingAmbienceZone) {
          const zone = this.pendingAmbienceZone;
          this.pendingAmbienceZone = null;
          this.setAmbienceZone(zone, 1.2);
        }
        if (this.pendingBGMTrack) {
          const bgm = this.pendingBGMTrack;
          this.pendingBGMTrack = null;
          this.playBGM(bgm.track, bgm.fadeDuration, bgm.volumeScale);
        }
      }
    };

    this.boundUnlockHandler = unlockHandler;
    for (const ev of AudioManager.AUTOPLAY_UNLOCK_EVENTS) {
      window.addEventListener(ev, unlockHandler, { passive: true, capture: true });
    }
  }

  /**
   * H4-NEW-06: Gỡ sạch toàn bộ capture listener mở khóa autoplay (khớp đúng capture: true)
   */
  private cleanupAutoplayUnlock(): void {
    if (typeof window === 'undefined' || !this.boundUnlockHandler) return;
    const handler = this.boundUnlockHandler;
    this.boundUnlockHandler = null;
    for (const ev of AudioManager.AUTOPLAY_UNLOCK_EVENTS) {
      window.removeEventListener(ev, handler, { capture: true });
    }
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
        this.preloadSampledAudio();
        if (this.pendingAmbienceZone) {
          const zone = this.pendingAmbienceZone;
          this.pendingAmbienceZone = null;
          this.setAmbienceZone(zone, 1.2);
        }
        if (this.pendingBGMTrack) {
          const bgm = this.pendingBGMTrack;
          this.pendingBGMTrack = null;
          this.playBGM(bgm.track, bgm.fadeDuration, bgm.volumeScale);
        }
      }).catch(() => {});
    } else if (this.ctx && this.ctx.state === 'running') {
      this.isUnlocked = true;
      if (this.pendingAmbienceZone) {
        const zone = this.pendingAmbienceZone;
        this.pendingAmbienceZone = null;
        this.setAmbienceZone(zone, 1.2);
      }
      if (this.pendingBGMTrack) {
        const bgm = this.pendingBGMTrack;
        this.pendingBGMTrack = null;
        this.playBGM(bgm.track, bgm.fadeDuration, bgm.volumeScale);
      }
      if (this.currentBGMAudio && this.currentBGMAudio.paused) {
        this.currentBGMAudio.play().catch(() => {});
      }
    }
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked && !!this.ctx && this.ctx.state === 'running';
  }

  // =========================================================================
  // 2. ĐIỀU CHỈNH ÂM LƯỢNG & BẬT / TẮT TIẾNG ÊM ÁI (SMOOTH MUTE)
  // =========================================================================

  /**
   * Bù trừ âm lượng phi phá hủy cho từng nhóm ambience (ambience_forest.mp3 đo gốc -12.8 LUFS)
   */
  private getAmbienceZoneTrim(zone: AmbienceZone | null): number {
    return zone === 'forest' ? 0.28 : 1.0;
  }

  private getEffectiveAmbienceGain(zone: AmbienceZone | null = this.currentAmbienceZone, multiplier: number = 1.0): number {
    const duckFactor = this.isDucked ? this.currentDuckFactor : 1.0;
    return Math.max(0, Math.min(1, this.ambienceVolume * this.getAmbienceZoneTrim(zone) * duckFactor * multiplier));
  }

  private syncCurrentBGMAudioVolume(): void {
    if (this.activeBGMRampInterval !== null) {
      window.clearInterval(this.activeBGMRampInterval);
      this.activeBGMRampInterval = null;
    }
    if (this.currentBGMAudio) {
      this.currentBGMAudio.volume = this.calculateEffectiveBGMVolume();
    }
    if (this.isMuted) {
      for (const fb of this.fadingBGMAudios) {
        try { fb.audio.volume = 0; } catch {}
      }
    }
  }

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
    this.syncCurrentBGMAudioVolume();
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  // C4-132-07: Điều chỉnh âm lượng Master, BGM và SFX
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setMasterVolume(val: number): void {
    this.resumeAudio();
    this.masterVolume = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    if (this.masterGain && this.ctx && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.masterVolume, now + 0.05);
    }
    this.syncCurrentBGMAudioVolume();
  }

  public getMusicVolume(): number {
    return this.ambienceVolume;
  }

  public setMusicVolume(val: number): void {
    this.resumeAudio();
    this.ambienceVolume = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    if (this.activeAmbience && this.ctx) {
      const now = this.ctx.currentTime;
      const targetAmbience = this.getEffectiveAmbienceGain(this.activeAmbience.zone);
      this.activeAmbience.gainNode.gain.cancelScheduledValues(now);
      this.activeAmbience.gainNode.gain.setValueAtTime(this.activeAmbience.gainNode.gain.value, now);
      this.activeAmbience.gainNode.gain.linearRampToValueAtTime(targetAmbience, now + 0.05);
    }
    this.setBGMVolume(this.ambienceVolume);
  }

  // V15-39: Điều chỉnh âm lượng Nhạc Nền BGM
  public getBGMVolume(): number {
    return this.bgmVolume;
  }

  public setBGMVolume(val: number): void {
    this.resumeAudio();
    this.bgmVolume = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    this.syncCurrentBGMAudioVolume();
    if (this.currentBGMGain && this.ctx && !this.isBGMSuppressed) {
      const now = this.ctx.currentTime;
      this.currentBGMGain.gain.cancelScheduledValues(now);
      this.currentBGMGain.gain.setValueAtTime(this.currentBGMGain.gain.value, now);
      this.currentBGMGain.gain.linearRampToValueAtTime(this.bgmVolume, now + 0.08);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(val: number): void {
    this.resumeAudio();
    this.sfxVolume = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
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

    // Chống bùng nổ AudioParam (Filter Glitch): chỉ lập lịch khi tần số thay đổi đáng kể (>= 15Hz)
    if (Math.abs(targetFreq - this.lastVeilTargetFreq) >= 15) {
      this.lastVeilTargetFreq = targetFreq;
      const now = this.ctx.currentTime;
      this.veilFilter.frequency.cancelScheduledValues(now);
      this.veilFilter.frequency.setValueAtTime(this.veilFilter.frequency.value, now);
      this.veilFilter.frequency.linearRampToValueAtTime(targetFreq, now + 0.25);
    }
  }

  // =========================================================================
  // 4. TIẾNG BƯỚC CHÂN THEO 5 BỀ MẶT ĐỊA HÌNH (FOOTSTEPS SFX)
  // =========================================================================

  public playFootstep(terrain: TerrainType = 'grass'): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    // Quy chuẩn V1.4: Cooldown tối thiểu 120ms cho bước chân
    if (!this.checkCooldown('footstep', 120)) return;
    this.resumeAudio();

    // Quy chuẩn V1.4: Phân tầng âm lượng bước chân 0.25 - 0.40 (-12 dB đến -8 dB)
    // Biến thiên ngẫu nhiên (Pitch: 0.92 - 1.08; Volume: ±10%)
    const baseVol = 0.32;
    const { volume, pitch } = this.applyJitter(baseVol, 0.10, 0.92, 1.08);

    // Thuật toán chống trùng liên tiếp (No-Repeat Shuffle) với tối đa 3 kênh phát đồng thời
    let chosenKey: string | null = null;
    if (terrain === 'mud') {
      chosenKey = this.getNoRepeatSample('mud', ['footstep_mud_1', 'footstep_mud_2']);
    } else if (terrain === 'wood') {
      chosenKey = this.getNoRepeatSample('wood', ['footstep_wood_1', 'footstep_wood_2']);
    } else if (terrain === 'stone') {
      chosenKey = this.getNoRepeatSample('stone', ['footstep_stone_1', 'footstep_stone_2']);
    } else if (terrain === 'grass') {
      chosenKey = this.getNoRepeatSample('grass', ['footstep_grass', 'footstep_leaves_1']);
    } else if (terrain === 'dirt') {
      chosenKey = this.getNoRepeatSample('dirt', ['footstep_stone_1', 'footstep_leaves_1']);
    }

    if (chosenKey && this.playSampled(chosenKey, volume, pitch, true, 3)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (terrain) {
      case 'stone': {
        // Đá lát quảng trường Bellhollow: sắc nét, đanh, tần số cao lướt nhanh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

        gain.gain.setValueAtTime(volume * 0.4 * this.sfxVolume, now);
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
        osc.frequency.setValueAtTime(170 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.08);

        gain.gain.setValueAtTime(volume * 0.45 * this.sfxVolume, now);
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
        osc.frequency.setValueAtTime(95 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.12);

        gain.gain.setValueAtTime(volume * 0.45 * this.sfxVolume, now);
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
        osc.frequency.setValueAtTime(120 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

        gain.gain.setValueAtTime(volume * 0.38 * this.sfxVolume, now);
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
        osc.frequency.setValueAtTime(135 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);

        gain.gain.setValueAtTime(volume * 0.3 * this.sfxVolume, now);
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
      
      // Tạo Brownian Noise (1/f^2) bằng Leaky Integrator để triệt tiêu hoàn toàn dải cao rè rè
      let brown = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.015 * white) / 1.015;
        output[i] = brown * 3.0;
      }

      // Khử giật ở điểm tiếp giáp vòng lặp (Loop Seam Smoothing)
      const seamSamples = Math.floor(this.ctx.sampleRate * 0.1);
      for (let i = 0; i < seamSamples; i++) {
        const alpha = i / seamSamples;
        output[i] = output[i] * alpha + output[bufferSize - seamSamples + i] * (1 - alpha);
      }

      return this.noiseBuffer;
    } catch {
      return null;
    }
  }

  /**
   * Ánh xạ Zone ID của game sang 4 nhóm Ambience đặc thù (Hỗ trợ toàn bộ 17 phân khu V1.4)
   */
  public mapZoneToAmbience(zoneId: string): AmbienceZone {
    if (zoneId === 'bellhollow' || zoneId === 'sanctuary_farm' || zoneId === 'sub_bell_workshop') {
      return 'village';
    }
    if (
      zoneId === 'silent_mire' ||
      zoneId === 'drowned_mire_depths' ||
      zoneId === 'ancient_rune_puzzle' ||
      zoneId === 'sunken_crypt_ruins' ||
      zoneId === 'broken_bell_shrine'
    ) {
      return 'mire';
    }
    if (
      zoneId === 'fog_crossing' ||
      zoneId === 'abyssal_chasm' ||
      zoneId === 'veil_origin_cavern' ||
      zoneId === 'sub_root_cellar'
    ) {
      return 'crossing';
    }
    return 'forest'; // outer_woods, crooked_path, deep_forest, whispering_grove_sanctum, sub_whispering_clearing, fallback
  }

  /**
   * C4-13-08 & V1.4: Dọn dẹp sạch sẽ toàn bộ các AudioNode và Timer của một kênh Ambience
   * ngăn chặn rò rỉ bộ nhớ và dội âm lặp
   */
  private cleanupChannelNodes(channel: AmbienceChannel): void {
    for (const item of channel.nodes) {
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
    try {
      channel.gainNode.disconnect();
    } catch {}
  }

  /**
   * Chuyển đổi nhạc nền sang vùng mới với hiệu ứng Crossfade mượt mà (Quy chuẩn V1.4: 1.8s - 2.5s)
   */
  public setAmbienceZone(zoneIdOrType: string, fadeDurationSec: number = 2.0): void {
    const targetZone: AmbienceZone =
      zoneIdOrType === 'village' || zoneIdOrType === 'forest' || zoneIdOrType === 'mire' || zoneIdOrType === 'crossing'
        ? zoneIdOrType
        : this.mapZoneToAmbience(zoneIdOrType);

    // V152-02: Nếu đang ở chế độ Trạm Lửa Sir Vaelen, lưu lại vùng đích và không phát ambience rừng/đầm lầy
    if (this.isSanctuaryMusicOnly) {
      this.savedPreSanctuaryAmbienceZone = targetZone;
      return;
    }

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

      const timerId = window.setTimeout(() => {
        this.cleanupChannelNodes(oldChannel);
        this.fadingChannels = this.fadingChannels.filter(c => c.channel !== oldChannel);
      }, (fadeDurationSec + 0.1) * 1000);

      this.fadingChannels.push({ channel: oldChannel, timerId });
      this.activeAmbience = null;
    }

    // 2. Tạo và Fade-in kênh ambience mới (áp dụng trim phi phá hủy theo vùng, ví dụ ambience_forest)
    const initialAmbienceGain = this.getEffectiveAmbienceGain(targetZone);
    const newChannelGain = this.ctx.createGain();
    newChannelGain.gain.setValueAtTime(0.0001, now);
    newChannelGain.gain.linearRampToValueAtTime(initialAmbienceGain, now + fadeDurationSec);
    const ambienceDest = this.ambienceFilter || this.veilFilter!;
    newChannelGain.connect(ambienceDest);
    this.windGain = newChannelGain; // Lưu lại để setWindIntensity có thể tinh chỉnh
    this.lastWindTargetGain = initialAmbienceGain;
    this.lastWindIntensity = -1;

    const nodesToTrack: (AudioNode | number)[] = [newChannelGain];

    // Ưu tiên nạp và phát tệp âm thanh thực tế từ nguồn Horror SFX đã chọn lọc
    const sampleKey = 'ambience_' + targetZone;
    const sampledBuffer = this.audioBuffers.get(sampleKey);

    if (sampledBuffer) {
      const sampleSource = this.ctx.createBufferSource();
      sampleSource.buffer = sampledBuffer;
      sampleSource.loop = true;
      sampleSource.connect(newChannelGain);
      sampleSource.start(now);
      nodesToTrack.push(sampleSource);

      // AUDIO-HOTFIX-01: Lớp hòa âm nền ấm áp (C3 130Hz) cho làng Bellhollow giúp không gian yên bình và liền mạch
      if (targetZone === 'village') {
        const villageDrone = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        villageDrone.type = 'sine';
        villageDrone.frequency.setValueAtTime(130.81, now);
        droneGain.gain.setValueAtTime(0.018 * this.ambienceVolume, now);
        villageDrone.connect(droneGain);
        droneGain.connect(newChannelGain);
        villageDrone.start(now);
        nodesToTrack.push(villageDrone, droneGain);
      }
    } else {
      // Procedural fallback với Brownian Noise siêu trầm ấm & bộ lọc kép Lowpass 420Hz loại bỏ 100% dải cao rè rè
      const noiseBuffer = this.getOrCreateNoiseBuffer();

      if (noiseBuffer) {
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const bandpass = this.ctx.createBiquadFilter();
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(420, now);
        lowpass.Q.setValueAtTime(0.707, now); // Butterworth alignment: phẳng phiu, loại bỏ 100% dải cao

        if (targetZone === 'village') {
          // LÀNG BELLHOLLOW: Gió êm đềm, tiếng vo ve ấm áp của mái nhà và ánh lửa
          bandpass.type = 'bandpass';
          bandpass.frequency.setValueAtTime(450, now);
          bandpass.Q.setValueAtTime(1.2, now);

          const villageDrone = this.ctx.createOscillator();
          const droneGain = this.ctx.createGain();
          villageDrone.type = 'sine';
          villageDrone.frequency.setValueAtTime(130.81, now); // C3 êm đềm
          droneGain.gain.setValueAtTime(0.025, now);

          villageDrone.connect(droneGain);
          droneGain.connect(newChannelGain);
          villageDrone.start(now);
          nodesToTrack.push(villageDrone, droneGain);

          noiseSource.connect(bandpass);
          bandpass.connect(lowpass);
          lowpass.connect(newChannelGain);
          noiseSource.start(now);
          nodesToTrack.push(noiseSource, bandpass, lowpass);

        } else if (targetZone === 'mire') {
          // ĐẦM LẦY TĨNH LẶNG: Âm trầm đục, gió rít ngột ngạt dưới lòng bùn
          bandpass.type = 'lowpass';
          bandpass.frequency.setValueAtTime(220, now);
          bandpass.Q.setValueAtTime(1.2, now);

          const mireDrone = this.ctx.createOscillator();
          const droneGain = this.ctx.createGain();
          mireDrone.type = 'sine';
          mireDrone.frequency.setValueAtTime(48, now); // Tiếng ục ục trầm 48Hz
          droneGain.gain.setValueAtTime(0.04, now);

          mireDrone.connect(droneGain);
          droneGain.connect(newChannelGain);
          mireDrone.start(now);
          nodesToTrack.push(mireDrone, droneGain);

          noiseSource.connect(bandpass);
          bandpass.connect(lowpass);
          lowpass.connect(newChannelGain);
          noiseSource.start(now);
          nodesToTrack.push(noiseSource, bandpass, lowpass);

        } else if (targetZone === 'crossing') {
          // FOG CROSSING: Gió rít cô độc, sương giá buốt
          bandpass.type = 'bandpass';
          bandpass.frequency.setValueAtTime(340, now);
          bandpass.Q.setValueAtTime(1.2, now);

          noiseSource.connect(bandpass);
          bandpass.connect(lowpass);
          lowpass.connect(newChannelGain);
          noiseSource.start(now);
          nodesToTrack.push(noiseSource, bandpass, lowpass);

        } else {
          // RỪNG NGOÀI & ĐƯỜNG MÒN (FOREST): Gió rít ma mị, cành cây kẽo kẹt
          bandpass.type = 'bandpass';
          bandpass.frequency.setValueAtTime(270, now);
          bandpass.Q.setValueAtTime(1.2, now);

          const forestDrone = this.ctx.createOscillator();
          const droneGain = this.ctx.createGain();
          forestDrone.type = 'sine';
          forestDrone.frequency.setValueAtTime(58, now);
          droneGain.gain.setValueAtTime(0.015, now);

          forestDrone.connect(droneGain);
          droneGain.connect(newChannelGain);
          forestDrone.start(now);
          nodesToTrack.push(forestDrone, droneGain);

          noiseSource.connect(bandpass);
          bandpass.connect(lowpass);
          lowpass.connect(newChannelGain);
          noiseSource.start(now);
          nodesToTrack.push(noiseSource, bandpass, lowpass);
        }
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
    const clamped = Math.max(0.2, Math.min(2.0, intensity));
    if (Math.abs(clamped - this.lastWindIntensity) < 0.05) return;
    this.lastWindIntensity = clamped;

    // AUDIO-HOTFIX-01: Tính toán âm lượng gió tự nhiên theo phân khu (bảo toàn trim vùng và ducking)
    const zoneFactor = this.currentAmbienceZone === 'crossing'
      ? Math.min(1.25, 0.75 + clamped * 0.35)
      : (clamped > 1.0 ? 1.15 : 1.0);
    const targetGain = this.getEffectiveAmbienceGain(this.currentAmbienceZone, zoneFactor);

    // Chống spam gọi AudioParam làm nghẽn CPU âm thanh
    if (Math.abs(targetGain - this.lastWindTargetGain) >= 0.01) {
      this.lastWindTargetGain = targetGain;
      const now = this.ctx.currentTime;
      this.windGain.gain.cancelScheduledValues(now);
      this.windGain.gain.setValueAtTime(this.windGain.gain.value, now);
      // Chuyển tiếp mượt mà trong 0.8 giây để tiếng gió phập phồng tự nhiên, triệt tiêu 100% tiếng giật/zipper noise
      this.windGain.gain.linearRampToValueAtTime(targetGain, now + 0.8);
    }
  }

  /**
   * V1.4: Điều biến âm lượng Mưa Sương (Mist Rain Ambience)
   * Tạo âm thanh tiếng mưa rơi lộp bộp êm dịu, không lấn át tiếng bước chân hay quái vật
   */
  public setRainIntensity(intensity: number): void {
    if (!this.ctx || typeof window === 'undefined') return;
    const clamped = Math.max(0, Math.min(1.0, intensity));
    const targetGain = clamped > 0.05 ? this.ambienceVolume * 0.42 * clamped : 0.0001;

    if (Math.abs(targetGain - this.lastRainTargetGain) < 0.005) return;
    this.lastRainTargetGain = targetGain;

    const now = this.ctx.currentTime;

    if (!this.rainGain) {
      try {
        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.0001, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        this.rainGain.connect(filter);
        if (this.veilFilter) {
          filter.connect(this.veilFilter);
        } else if (this.masterGain) {
          filter.connect(this.masterGain);
        }

        const buf = this.getOrCreateNoiseBuffer();
        if (buf) {
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          src.connect(this.rainGain);
          src.start(0);
          this.rainSource = src;
        }
      } catch (e) {
        console.warn('[AudioManager] setRainIntensity init error:', e);
        return;
      }
    }

    if (this.rainGain) {
      this.rainGain.gain.cancelScheduledValues(now);
      this.rainGain.gain.setValueAtTime(this.rainGain.gain.value, now);
      this.rainGain.gain.linearRampToValueAtTime(targetGain, now + 1.2);
    }
  }

  public stopAmbience(immediate: boolean = false): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dọn sạch dứt điểm mọi kênh đang fade out trong bộ đệm
    for (const fc of this.fadingChannels) {
      clearTimeout(fc.timerId);
      this.cleanupChannelNodes(fc.channel);
    }
    this.fadingChannels = [];

    if (this.activeAmbience) {
      const channel = this.activeAmbience;
      if (immediate) {
        this.cleanupChannelNodes(channel);
        this.activeAmbience = null;
        this.currentAmbienceZone = null;
        if (this.rainSource) {
          try { this.rainSource.stop(); } catch {}
          try { this.rainSource.disconnect(); } catch {}
          this.rainSource = null;
        }
        if (this.rainGain) {
          try { this.rainGain.disconnect(); } catch {}
          this.rainGain = null;
        }
        this.lastRainTargetGain = -1;
      } else {
        channel.gainNode.gain.cancelScheduledValues(now);
        channel.gainNode.gain.setValueAtTime(channel.gainNode.gain.value, now);
        channel.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        const timerId = window.setTimeout(() => {
          this.cleanupChannelNodes(channel);
          this.fadingChannels = this.fadingChannels.filter(c => c.channel !== channel);
        }, 700);
        this.fadingChannels.push({ channel, timerId });
        this.activeAmbience = null;
        this.currentAmbienceZone = null;

        // V152-02: Hạ âm và dừng/ngắt kết nối rainSource sau khi fade-out để tránh rò rỉ tiếng mưa
        if (this.rainSource) {
          const oldRainSource = this.rainSource;
          const oldRainGain = this.rainGain;
          this.rainSource = null;
          this.rainGain = null;
          this.lastRainTargetGain = -1;

          if (oldRainGain) {
            oldRainGain.gain.cancelScheduledValues(now);
            oldRainGain.gain.setValueAtTime(oldRainGain.gain.value, now);
            oldRainGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
          }
          window.setTimeout(() => {
            try { oldRainSource.stop(); } catch {}
            try { oldRainSource.disconnect(); } catch {}
            if (oldRainGain) {
              try { oldRainGain.disconnect(); } catch {}
            }
          }, 700);
        }
      }
    } else {
      this.currentAmbienceZone = null;
      if (immediate) {
        if (this.rainSource) {
          try { this.rainSource.stop(); } catch {}
          try { this.rainSource.disconnect(); } catch {}
          this.rainSource = null;
        }
        if (this.rainGain) {
          try { this.rainGain.disconnect(); } catch {}
          this.rainGain = null;
        }
        this.lastRainTargetGain = -1;
      } else if (this.rainSource) {
        // V152-02: Hạ âm và dừng/ngắt kết nối rainSource sau khi fade-out để tránh rò rỉ tiếng mưa
        const oldRainSource = this.rainSource;
        const oldRainGain = this.rainGain;
        this.rainSource = null;
        this.rainGain = null;
        this.lastRainTargetGain = -1;

        if (oldRainGain) {
          oldRainGain.gain.cancelScheduledValues(now);
          oldRainGain.gain.setValueAtTime(oldRainGain.gain.value, now);
          oldRainGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        }
        window.setTimeout(() => {
          try { oldRainSource.stop(); } catch {}
          try { oldRainSource.disconnect(); } catch {}
          if (oldRainGain) {
            try { oldRainGain.disconnect(); } catch {}
          }
        }, 700);
      }
    }
  }

  // =========================================================================
  // 5B. HỆ THỐNG NHẠC NỀN NGHỆ THUẬT (BGM SYSTEM WITH CROSSFADE - V15-39)
  // =========================================================================

  /**
   * V15-39 & V15-FIX-04: Phát nhạc nền nghệ thuật Streaming qua HTMLAudioElement với hiệu ứng Crossfade mượt mà
   * @param track Tên bản nhạc BGM cần phát
   * @param fadeDuration Thời gian chuyển đổi hòa quyện âm thanh (giây, mặc định 1.5s)
   * @param volumeScale Tỷ lệ âm lượng tương đối cho bản nhạc (mặc định 1.0)
   */
  public playBGM(track: BGMTrack, fadeDuration: number = 1.5, volumeScale: number = 1.0): void {
    if (typeof window === 'undefined') return;

    if (!this.isUnlocked) {
      this.pendingBGMTrack = { track, fadeDuration, volumeScale };
      this.resumeAudio();
      return;
    }

    this.currentBGMVolumeScale = volumeScale;

    // Nếu đang phát đúng track này và audio vẫn đang hoạt động
    if (this.currentBGMTrack === track && this.currentBGMAudio) {
      const targetVol = this.calculateEffectiveBGMVolume(volumeScale);
      if (this.activeBGMRampInterval !== null) {
        window.clearInterval(this.activeBGMRampInterval);
        this.activeBGMRampInterval = null;
      }
      this.activeBGMRampInterval = this.rampAudioVolume(this.currentBGMAudio, targetVol, 0.3, () => {
        this.activeBGMRampInterval = null;
      });
      if (this.currentBGMAudio.paused) {
        this.currentBGMAudio.play().catch(() => {});
      }
      return;
    }

    const bgmUrl = BGM_MANIFEST[track];
    if (!bgmUrl) return;

    // 1. Fade-out kênh BGM streaming cũ (nếu có)
    if (this.currentBGMAudio) {
      if (this.activeBGMRampInterval !== null) {
        window.clearInterval(this.activeBGMRampInterval);
        this.activeBGMRampInterval = null;
      }
      const oldAudio = this.currentBGMAudio;
      const fadeInterval = this.rampAudioVolume(oldAudio, 0, fadeDuration, () => {
        try {
          oldAudio.pause();
          oldAudio.currentTime = 0;
          oldAudio.removeAttribute('src');
          oldAudio.load();
        } catch {}
        this.fadingBGMAudios = this.fadingBGMAudios.filter(f => f.audio !== oldAudio);
      });
      this.fadingBGMAudios.push({ audio: oldAudio, intervalId: fadeInterval });
      this.currentBGMAudio = null;
    }

    // Tương thích ngược: Fade-out kênh WebAudio BGM cũ (nếu có)
    if (this.ctx && this.currentBGMSource && this.currentBGMGain) {
      const now = this.ctx.currentTime;
      const oldSource = this.currentBGMSource;
      const oldGain = this.currentBGMGain;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
      const timerId = window.setTimeout(() => {
        try { oldSource.stop(); } catch {}
        try { oldSource.disconnect(); oldGain.disconnect(); } catch {}
        this.fadingBGMSources = this.fadingBGMSources.filter(f => f.source !== oldSource);
      }, (fadeDuration + 0.1) * 1000);
      this.fadingBGMSources.push({ source: oldSource, gain: oldGain, timerId });
      this.currentBGMSource = null;
      this.currentBGMGain = null;
    }

    this.currentBGMTrack = track;
    this.pendingBGMTrack = null;

    // 2. Tạo đối tượng HTMLAudioElement mới để Streaming không tốn RAM giải mã PCM
    try {
      const newAudio = new Audio(bgmUrl);
      newAudio.loop = true;
      newAudio.volume = 0;

      const playPromise = newAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Ngăn double-BGM nếu track đã bị đổi hoặc dừng trong lúc promise đang chờ resolve
          if (this.currentBGMAudio !== newAudio || this.currentBGMTrack !== track) {
            try {
              newAudio.pause();
              newAudio.currentTime = 0;
              newAudio.removeAttribute('src');
              newAudio.load();
            } catch {}
            return;
          }
          if (this.activeBGMRampInterval !== null) {
            window.clearInterval(this.activeBGMRampInterval);
            this.activeBGMRampInterval = null;
          }
          this.activeBGMRampInterval = this.rampAudioVolume(newAudio, this.calculateEffectiveBGMVolume(volumeScale), fadeDuration, () => {
            this.activeBGMRampInterval = null;
          });
        }).catch(() => {
          // Trình duyệt chặn autoplay khi chưa có tương tác
          if (this.currentBGMAudio === newAudio && this.currentBGMTrack === track) {
            this.pendingBGMTrack = { track, fadeDuration, volumeScale };
          }
        });
      }

      this.currentBGMAudio = newAudio;
    } catch (e) {
      console.warn('[AudioManager] Không thể khởi tạo streaming BGM:', e);
    }
  }

  /**
   * V15-39: Dừng phát nhạc nền với hiệu ứng Fade-out êm dịu
   */
  public stopBGM(fadeDuration: number = 0.8): void {
    this.pendingBGMTrack = null;
    this.currentBGMTrack = null;

    if (this.activeBGMRampInterval !== null) {
      window.clearInterval(this.activeBGMRampInterval);
      this.activeBGMRampInterval = null;
    }

    if (this.currentBGMAudio) {
      const oldAudio = this.currentBGMAudio;
      this.currentBGMAudio = null;
      const fadeInterval = this.rampAudioVolume(oldAudio, 0, fadeDuration, () => {
        try {
          oldAudio.pause();
          oldAudio.currentTime = 0;
          oldAudio.removeAttribute('src');
          oldAudio.load();
        } catch {}
        this.fadingBGMAudios = this.fadingBGMAudios.filter(f => f.audio !== oldAudio);
      });
      this.fadingBGMAudios.push({ audio: oldAudio, intervalId: fadeInterval });
    }

    // Tương thích ngược với kênh WebAudio BGM
    if (this.ctx && this.currentBGMSource && this.currentBGMGain) {
      const now = this.ctx.currentTime;
      const oldSource = this.currentBGMSource;
      const oldGain = this.currentBGMGain;
      this.currentBGMSource = null;
      this.currentBGMGain = null;

      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);

      const timerId = window.setTimeout(() => {
        try { oldSource.stop(); } catch {}
        try { oldSource.disconnect(); oldGain.disconnect(); } catch {}
        this.fadingBGMSources = this.fadingBGMSources.filter(f => f.source !== oldSource);
      }, (fadeDuration + 0.1) * 1000);

      this.fadingBGMSources.push({ source: oldSource, gain: oldGain, timerId });
    }
  }

  /**
   * V15-39: Tạm thời bóp nghẹt / tắt nhạc nền khi vào trạng thái nguy hiểm cao (Boss fight, Quái truy đuổi sát nút)
   */
  public setBGMSuppressed(suppressed: boolean, fadeDuration: number = 0.8): void {
    if (this.isBGMSuppressed === suppressed) return;
    this.isBGMSuppressed = suppressed;

    if (this.currentBGMAudio) {
      const targetGain = this.calculateEffectiveBGMVolume();
      if (this.activeBGMRampInterval !== null) {
        window.clearInterval(this.activeBGMRampInterval);
        this.activeBGMRampInterval = null;
      }
      this.activeBGMRampInterval = this.rampAudioVolume(this.currentBGMAudio, targetGain, fadeDuration, () => {
        this.activeBGMRampInterval = null;
      });
    }

    if (this.ctx && this.currentBGMGain) {
      const now = this.ctx.currentTime;
      const targetGain = suppressed ? 0.0001 : this.bgmVolume;
      this.currentBGMGain.gain.cancelScheduledValues(now);
      this.currentBGMGain.gain.setValueAtTime(this.currentBGMGain.gain.value, now);
      this.currentBGMGain.gain.linearRampToValueAtTime(targetGain, now + fadeDuration);
    }
  }

  /**
   * Đọc trạng thái phát hiện tại khi QA lấy snapshot.
   */
  public getPlaybackDiagnostics() {
    return {
      context: this.ctx?.state ?? 'uninitialized',
      ambience: this.getCurrentAmbience(),
      bgm: this.getCurrentBGM(),
      gain: this.currentBGMAudio?.volume ?? this.currentBGMGain?.gain.value ?? null,
      loop: this.currentBGMAudio?.loop ?? this.currentBGMSource?.loop ?? null,
      sfx: [...this.activeSFXChannels]
        .filter(([, channels]) => channels.length > 0)
        .slice(0, 12)
        .map(([key, channels]) => ({
          key,
          channels: channels.map(({ source, gain }) => ({ gain: gain.gain.value, loop: source.loop }))
        }))
    };
  }

  public getCurrentBGM(): BGMTrack | null {
    return this.currentBGMTrack;
  }

  public getCurrentAmbience(): AmbienceZone | null {
    return this.currentAmbienceZone;
  }

  /**
   * V152-02: Kiểm tra trạng thái cô lập âm thanh Trạm Lửa Sir Vaelen (#10)
   */
  public isSanctuaryActive(): boolean {
    return this.isSanctuaryMusicOnly;
  }

  /**
   * V152-02: Cô lập hoàn toàn âm thanh tại Trạm Lửa Sir Vaelen (#10)
   * - active = true: fade-out về 0 toàn bộ ambience rừng, mưa, gió rít, nhịp tim và tạm ngắt ảo giác âm thanh;
   *   chỉ phát DUY NHẤT bản nhạc du dương bgm_knights_quiet_fire (knights_quiet_fire.mp3) trong trẻo.
   * - active = false: crossfade êm trở lại ambience và BGM rừng.
   */
  public setSanctuaryMusicOnly(active: boolean, fadeDuration: number = 1.2): void {
    if (this.isSanctuaryMusicOnly === active) return;
    this.isSanctuaryMusicOnly = active;

    if (active) {
      if (this.currentAmbienceZone) {
        this.savedPreSanctuaryAmbienceZone = this.currentAmbienceZone;
      }
      // Dập tắt nhịp tim hoảng loạn
      this.setHeartbeatActive(false);

      // Hạ âm / fade-out toàn bộ ambience môi trường và mưa về 0
      this.stopAmbience(false);
      if (this.windGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.windGain.gain.cancelScheduledValues(now);
        this.windGain.gain.setValueAtTime(this.windGain.gain.value, now);
        this.windGain.gain.linearRampToValueAtTime(0.0001, now + fadeDuration);
      }

      // Phát DUY NHẤT bản nhạc du dương bgm_knights_quiet_fire trong trẻo
      this.playBGM('bgm_knights_quiet_fire', fadeDuration, 0.85);
    } else {
      // Khi rời Trạm Lửa: crossfade êm trở lại ambience môi trường
      const returnZone = this.savedPreSanctuaryAmbienceZone || 'forest';
      this.setAmbienceZone(returnZone, fadeDuration);
    }
  }

  // =========================================================================
  // 6. TIẾNG NHỊP TIM ĐẬP DỒN DẬP (HEARTBEAT SFX) & DÌM ÂM TÂM LÝ (V15-58C)
  // =========================================================================

  public setHeartbeatActive(active: boolean, intervalMs: number = 800): void {
    if (!active || this.isSanctuaryMusicOnly) {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
      this.isHeartbeatActive = false;
      this.currentHeartbeatBpm = 75;
      this.currentHeartbeatIntervalMs = 800;
      this.unduckAmbience(0.5);
      if (this.isSanityDucked) {
        this.setSanityDucking(false);
      }
      return;
    }

    this.isHeartbeatActive = true;
    this.currentHeartbeatIntervalMs = intervalMs;
    this.currentHeartbeatBpm = Math.round(60000 / Math.max(100, intervalMs));

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.duckAmbience(0.5, 999999);
    this.triggerHeartbeatBeat();
    this.heartbeatTimer = window.setInterval(() => {
      this.triggerHeartbeatBeat();
    }, intervalMs);
  }

  /**
   * V15-58C: Cập nhật nhịp tim Web Audio động theo mức Tinh Thần & khoảng cách quái vật
   * - Khi Tinh Thần < 45/100 HOẶC có quái vật săn đuổi trong bán kính 220px:
   *   Nhịp tim tự động vang lên trầm ấm.
   *   Nhịp độ (BPM) và âm lượng tăng dần tỷ lệ nghịch với lượng Tinh Thần còn lại (từ 75 BPM tại 45 lên 135 BPM khi < 15).
   * - Khi Tinh Thần < 20/100: Giảm nhẹ âm lượng nhạc nền môi trường (BGM Ducking 0.45) để làm nổi bật tiếng nhịp tim và tiếng thở gấp (uneasyBreathing).
   * - Khi Tinh Thần >= 45 (và không có quái vật săn đuổi) hoặc đứng trong vùng an toàn / Lửa trại:
   *   Tự động tắt nhịp tim và hồi phục âm lượng nhạc nền bình thường.
   */
  public updateDynamicHeartbeat(composure: number, isMonsterNear: boolean = false, isSafeZoneOrCampfire: boolean = false): void {
    if (this.isSanctuaryMusicOnly || isSafeZoneOrCampfire || (composure >= 45 && !isMonsterNear)) {
      if (this.isHeartbeatActive) {
        this.setHeartbeatActive(false);
      }
      if (this.isSanityDucked) {
        this.setSanityDucking(false);
      }
      return;
    }

    // Quái vật săn đuổi gây hoảng sợ tương đương Tinh Thần xuống mức nguy hiểm (<= 30)
    let effectiveComp = composure;
    if (isMonsterNear) {
      effectiveComp = Math.min(effectiveComp, 30);
    }
    effectiveComp = Math.max(0, Math.min(45, effectiveComp));

    // Tính tỷ lệ t từ 0 (tại 45) -> 1 (tại <= 15)
    const t = Math.max(0, Math.min(1, (45 - effectiveComp) / 30));
    const targetBpm = Math.round(75 + t * (135 - 75)); // 75 -> 135 BPM
    const intervalMs = Math.round(60000 / targetBpm);   // 800ms -> 444ms

    this.currentHeartbeatBpm = targetBpm;
    this.currentHeartbeatGain = 0.24 + t * 0.38;

    if (!this.isHeartbeatActive) {
      this.isHeartbeatActive = true;
      this.currentHeartbeatIntervalMs = intervalMs;
      this.duckAmbience(0.55, 999999);
      this.triggerHeartbeatBeat();
      this.heartbeatTimer = window.setInterval(() => {
        this.triggerHeartbeatBeat();
      }, intervalMs);
    } else if (Math.abs(intervalMs - this.currentHeartbeatIntervalMs) >= 20) {
      this.currentHeartbeatIntervalMs = intervalMs;
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = window.setInterval(() => {
        this.triggerHeartbeatBeat();
      }, intervalMs);
    }

    // Khi Tinh Thần < 20/100: Kích hoạt BGM Ducking và phát tiếng thở gấp ngắt quãng
    if (effectiveComp < 20) {
      if (!this.isSanityDucked) {
        this.setSanityDucking(true);
      }
      this.playUneasyBreathing();
    } else {
      if (this.isSanityDucked) {
        this.setSanityDucking(false);
      }
    }
  }

  /**
   * V15-58C: Dìm âm nhạc nền (BGM Ducking) khi Tinh Thần sụt giảm dưới ngưỡng nguy kịch (< 20/100)
   */
  public setSanityDucking(duck: boolean, fadeDuration: number = 0.5): void {
    if (this.isSanityDucked === duck) return;
    this.isSanityDucked = duck;

    if (this.currentBGMAudio) {
      const targetGain = this.calculateEffectiveBGMVolume();
      if (this.activeBGMRampInterval !== null) {
        window.clearInterval(this.activeBGMRampInterval);
        this.activeBGMRampInterval = null;
      }
      this.activeBGMRampInterval = this.rampAudioVolume(this.currentBGMAudio, targetGain, fadeDuration, () => {
        this.activeBGMRampInterval = null;
      });
    }

    if (this.ctx && this.currentBGMGain && !this.isBGMSuppressed) {
      const now = this.ctx.currentTime;
      const targetGain = duck ? (this.bgmVolume * 0.45) : this.bgmVolume;
      this.currentBGMGain.gain.cancelScheduledValues(now);
      this.currentBGMGain.gain.setValueAtTime(this.currentBGMGain.gain.value, now);
      this.currentBGMGain.gain.linearRampToValueAtTime(targetGain, now + fadeDuration);
    }

    if (duck) {
      this.duckAmbience(0.4, 999999);
    } else {
      this.unduckAmbience(0.5);
    }
  }

  public getHeartbeatBpm(): number {
    return this.currentHeartbeatBpm;
  }

  public getCurrentHeartbeatGain(): number {
    return this.currentHeartbeatGain;
  }

  public getIsHeartbeatActive(): boolean {
    return this.isHeartbeatActive;
  }

  public getIsSanityDucked(): boolean {
    return this.isSanityDucked;
  }

  // =========================================================================
  // V1.4 - P7: HỆ THỐNG ƯU TIÊN ÂM THANH & DÌM ÂM NỀN (AUDIO DUCKING & CLEANUP)
  // =========================================================================

  /**
   * Tự động dìm âm nền (Audio Ducking) khi có tín hiệu sinh tồn khẩn cấp
   * (tiếng bước chân The Listener, tiếng tim đập hoảng loạn, tiếng quạ thét báo động)
   */
  public duckAmbience(duckFactor: number = 0.55, durationMs: number = 1400): void {
    if (!this.ctx || !this.activeAmbience) return;
    this.isDucked = true;
    this.currentDuckFactor = duckFactor;

    const now = this.ctx.currentTime;
    const targetGain = this.getEffectiveAmbienceGain(this.activeAmbience.zone);
    this.activeAmbience.gainNode.gain.cancelScheduledValues(now);
    this.activeAmbience.gainNode.gain.setValueAtTime(this.activeAmbience.gainNode.gain.value, now);
    this.activeAmbience.gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.15);

    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
      this.duckTimer = null;
    }

    if (durationMs < 100000) {
      this.duckTimer = window.setTimeout(() => {
        this.unduckAmbience(0.6);
      }, durationMs);
    }
  }

  /**
   * Phục hồi âm lượng nền về mức chuẩn sau khi tín hiệu khẩn cấp kết thúc
   */
  public unduckAmbience(rampSec: number = 0.5): void {
    if (!this.ctx || !this.activeAmbience) return;
    this.isDucked = false;
    this.currentDuckFactor = 1.0;
    const now = this.ctx.currentTime;
    const targetGain = this.getEffectiveAmbienceGain(this.activeAmbience.zone);
    this.activeAmbience.gainNode.gain.cancelScheduledValues(now);
    this.activeAmbience.gainNode.gain.setValueAtTime(this.activeAmbience.gainNode.gain.value, now);
    this.activeAmbience.gainNode.gain.linearRampToValueAtTime(targetGain, now + rampSec);
  }

  public getIsDucked(): boolean {
    return this.isDucked;
  }

  public getCurrentDuckFactor(): number {
    return this.currentDuckFactor;
  }

  /**
   * Tiếng bước chân nặng nề của Kẻ Lắng Nghe kèm cơ chế dìm âm nền để người chơi định vị
   */
  public playListenerStep(volume: number = 1.0): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('listener_step', 260)) return;
    this.duckAmbience(0.65, 550);

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24 * volume * this.sfxVolume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Giải phóng sạch sẽ các vòng lặp âm thanh, timer và bộ đệm khi chuyển cảnh (Zero Orphan Loop)
   */
  public cleanupAudioLoops(): void {
    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
      this.duckTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      this.isHeartbeatActive = false;
    }
    if (this.bossDroneSource) {
      try { this.bossDroneSource.stop(); } catch {}
      try { this.bossDroneSource.disconnect(); } catch {}
      this.bossDroneSource = null;
    }
    if (this.bossDroneGain) {
      try { this.bossDroneGain.disconnect(); } catch {}
      this.bossDroneGain = null;
    }
    if (this.rainSource) {
      try { this.rainSource.stop(); } catch {}
      try { this.rainSource.disconnect(); } catch {}
      this.rainSource = null;
    }
    if (this.rainGain) {
      try { this.rainGain.disconnect(); } catch {}
      this.rainGain = null;
    }
    this.lastRainTargetGain = -1;
    this.isBossAwakened = false;
    this.unduckAmbience(0.1);
  }

  // =========================================================================
  // V1.4: HỆ THỐNG ÂM THANH MỞ RỘNG (JUMPSCARE, MONSTER TELEGRAPH & BOSS AWAKENING)
  // =========================================================================

  /**
   * V1.4: Phát âm thanh hù dọa / phục kích bất ngờ (Bat / Ghost Ambush)
   * - Quy chuẩn: Âm lượng 0.85 - 1.0 (-1.5 dB đến 0 dB)
   * - Tự động Audio Ducking kênh Ambient xuống 50% trong 1.5 giây
   * - Khóa chồng âm (Lockout) 3.0 giây chống spam jumpscare liên tục
   */
  public triggerJumpscare(type: 'bat' | 'ghost', customVolume?: number): boolean {
    const now = Date.now();
    if (now - this.lastAmbushTriggerTime < 3000) {
      return false; // Chặn chồng tiếng hù dọa trong 3.0s
    }
    this.lastAmbushTriggerTime = now;
    this.resumeAudio();

    // 1. Dìm âm Ambient xuống 50% trong 1.5 giây
    this.duckAmbience(0.5, 1500);

    const stingerVol = Math.max(0.85, Math.min(1.0, customVolume ?? 0.95));

    // 2. Phát âm thanh stinger giật mình
    this.playSampled('jumpscare_stinger', stingerVol, 1.0, false, 2);

    // 3. Phát âm thanh quái vật đặc thù với Pitch Jitter
    if (type === 'bat') {
      const { volume: flapVol, pitch: flapPitch } = this.applyJitter(stingerVol * 0.9, 0.10, 0.92, 1.08);
      this.playSampled('bat_flap', flapVol, flapPitch, true, 2);
      setTimeout(() => {
        this.playSampled('bat_screech', stingerVol, 1.02, true, 2);
        this.playSampled('bat_bite', stingerVol * 0.85, 0.98, true, 2);
      }, 180);
    } else if (type === 'ghost') {
      const ghostSample = this.getNoRepeatSample('ghost_jumpscare', ['ghost_scream', 'ghost_moan']);
      this.playSampled(ghostSample, stingerVol, 0.95, true, 2);
      setTimeout(() => {
        this.playSampled('ghost_whisper', stingerVol * 0.75, 0.92, true, 2);
      }, 250);
    }

    // 4. Tiếng thở hắt kinh hoàng của nhân vật chính sau cú giật mình
    setTimeout(() => {
      this.playSampled('sanity_gasp', 0.85, 1.0, true, 1);
    }, 320);

    return true;
  }

  /**
   * V1.4: Phát tín hiệu cảnh báo quái vật & Goblin Scout (Monster Telegraph)
   * - Quy chuẩn: Âm lượng 0.65 - 0.80 (-4 dB đến -2 dB), ưu tiên độ rõ để nhận diện từ xa
   * - Tối đa 2 kênh SFX quái vật cùng loại phát đồng thời
   * - Hỗ trợ suy giảm âm thanh theo khoảng cách (Spatial Attenuation)
   */
  public playMonsterTelegraph(
    type: 'scout_whistle' | 'dagger_slash' | 'wolf_growl' | 'wolf_snarl' | 'behemoth_roar' | 'behemoth_thud' | 'void_drone' | 'void_screech',
    sourceX?: number,
    sourceY?: number,
    listenerX?: number,
    listenerY?: number,
    maxRadius: number = 550
  ): boolean {
    if (!this.checkCooldown(`telegraph_${type}`, 250)) return false;
    const baseVol = 0.72; // Chuẩn 0.65 - 0.80
    const keyMap: Record<string, string[]> = {
      scout_whistle: ['scout_whistle'],
      dagger_slash: ['dagger_slash'],
      wolf_growl: ['skull_wolf_growl', 'skull_wolf_snarl'],
      wolf_snarl: ['skull_wolf_snarl'],
      behemoth_roar: ['behemoth_roar'],
      behemoth_thud: ['behemoth_thud'],
      void_drone: ['void_stalker_drone'],
      void_screech: ['void_stalker_screech']
    };
    const candidates = keyMap[type] || ['scout_whistle'];
    const chosen = this.getNoRepeatSample(type, candidates);

    if (sourceX !== undefined && sourceY !== undefined && listenerX !== undefined && listenerY !== undefined) {
      return this.playSpatialSFX(chosen, sourceX, sourceY, listenerX, listenerY, maxRadius, baseVol, 2);
    } else {
      const { volume, pitch } = this.applyJitter(baseVol, 0.08, 0.94, 1.06);
      return this.playSampled(chosen, volume, pitch, true, 2);
    }
  }

  /**
   * V1.4: Suy giảm âm lượng tuyến tính theo khoảng cách không gian (Spatial Attenuation)
   * - Giảm dần theo cự ly nguồn âm tới người chơi và tắt hẳn ngoài bán kính nghe
   */
  public playSpatialSFX(
    key: string,
    sourceX: number,
    sourceY: number,
    listenerX: number,
    listenerY: number,
    maxRadius: number = 500,
    baseVolume: number = 0.72,
    maxPolyphony: number = 2
  ): boolean {
    const dx = sourceX - listenerX;
    const dy = sourceY - listenerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= maxRadius) return false;
    const factor = Math.max(0, 1 - dist / maxRadius);
    const volume = Math.max(0.01, baseVolume * factor);
    const pitch = 0.96 + Math.random() * 0.08;
    return this.playSampled(key, volume, pitch, true, maxPolyphony);
  }

  /**
   * V1.4: Trạng thái Boss Thức Tỉnh (Boss Awakening State)
   * - Fade-in lớp âm thanh áp lực (drone/heartbeat) trong 1.0 giây
   * - Fade-out trong 2.0 giây khi người chơi rời khỏi vùng ảnh hưởng
   * - Tự động dìm kênh Ambient xuống 50% và kích hoạt nhịp tim dồn dập
   */
  public setBossAwakeningState(active: boolean): void {
    if (this.isBossAwakened === active) return;
    this.isBossAwakened = active;
    if (!this.ctx) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;

    if (active) {
      // 1. Dìm âm Ambient xuống 50%
      this.duckAmbience(0.5, 999999);
      // 2. Kích hoạt nhịp tim dồn dập (550ms)
      this.setHeartbeatActive(true, 550);

      // 3. Fade-in Drone trong 1.0 giây lên 0.90 (-1 dB)
      const buffer = this.audioBuffers.get('boss_drone');
      if (buffer) {
        if (this.bossDroneSource) {
          try { this.bossDroneSource.stop(); } catch {}
          try { this.bossDroneSource.disconnect(); } catch {}
        }
        if (this.bossDroneGain) {
          try { this.bossDroneGain.disconnect(); } catch {}
        }

        this.bossDroneSource = this.ctx.createBufferSource();
        this.bossDroneSource.buffer = buffer;
        this.bossDroneSource.loop = true;

        this.bossDroneGain = this.ctx.createGain();
        this.bossDroneGain.gain.setValueAtTime(0.0001, now);
        this.bossDroneGain.gain.exponentialRampToValueAtTime(0.90 * this.masterVolume, now + 1.0);

        this.bossDroneSource.connect(this.bossDroneGain);
        this.bossDroneGain.connect(this.veilFilter ? this.veilFilter : this.masterGain!);
        this.bossDroneSource.start(0);
      }
    } else {
      // Fade-out Drone trong 2.0 giây
      if (this.bossDroneGain) {
        this.bossDroneGain.gain.cancelScheduledValues(now);
        this.bossDroneGain.gain.setValueAtTime(Math.max(0.0001, this.bossDroneGain.gain.value), now);
        this.bossDroneGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        const src = this.bossDroneSource;
        const gn = this.bossDroneGain;
        setTimeout(() => {
          try { src?.stop(); } catch {}
          try { src?.disconnect(); gn?.disconnect(); } catch {}
        }, 2100);
        this.bossDroneSource = null;
        this.bossDroneGain = null;
      }
      this.setHeartbeatActive(false);
      this.unduckAmbience(2.0);
    }
  }

  /**
   * V1.4: Tương tác vật thể thế giới mới (Rương cổ, Cổ thư, Cổ ngữ)
   */
  public playWorldInteractSFX(type: 'chest' | 'journal' | 'rune' | 'bell'): void {
    if (!this.checkCooldown(`interact_${type}`, 180)) return;
    const keyMap = {
      chest: 'chest_creak',
      journal: 'journal_page',
      rune: 'rune_shift',
      bell: 'bell_toll_low'
    };
    const key = keyMap[type];
    if (key) {
      const { volume, pitch } = this.applyJitter(0.75, 0.08, 0.95, 1.05);
      this.playSampled(key, volume, pitch, true, 2);
    }
  }

  private triggerHeartbeatBeat(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;

    const now = this.ctx.currentTime;
    // Tỷ lệ t tương ứng BPM 75..135
    const t = Math.max(0, Math.min(1, (this.currentHeartbeatBpm - 75) / 60));

    // Lub (nhịp 1): trầm ấm, tăng tần số & âm lượng khi hoảng loạn
    const freq1 = 56 + t * 14; // 56Hz -> 70Hz
    const gain1 = this.currentHeartbeatGain * this.sfxVolume;
    this.playHeartSubBeat(now, freq1, gain1);

    // Dub (nhịp 2): theo sau nhịp 1, khoảng cách thu hẹp khi tim đập nhanh
    const dubDelay = 0.14 - t * 0.03; // 140ms -> 110ms
    const freq2 = 44 + t * 12; // 44Hz -> 56Hz
    const gain2 = this.currentHeartbeatGain * 0.75 * this.sfxVolume;
    this.playHeartSubBeat(now + dubDelay, freq2, gain2);
  }

  private playHeartSubBeat(startTime: number, freq: number, gainLevel: number): void {
    if (!this.ctx || !this.veilFilter) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(24, startTime + 0.1);

      gain.gain.setValueAtTime(gainLevel, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(this.veilFilter);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    } catch {
      // AudioContext có thể bị tạm dừng hoặc gián đoạn
    }
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

    if (this.playSampled('interact', 0.7, 1.0, true)) {
      return;
    }

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

    if (this.playSampled('gather', 0.75, 1.0, true)) {
      return;
    }

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

    gain.gain.setValueAtTime(0.16 * this.sfxVolume, now);
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

    if (this.playSampled('craft', 0.8, 1.0, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    // Hợp âm 3 nốt vui tươi (C5 - E5 - G5)
    const notes = [523.25, 659.25, 783.99];
    for (let i = 0; i < notes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i], noteTime);

      gain.gain.setValueAtTime(0.14 * this.sfxVolume, noteTime);
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

    if (this.playSampled('lantern', 0.75, isOn ? 1.08 : 0.88, true)) {
      return;
    }

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

    gain.gain.setValueAtTime(0.14 * this.sfxVolume, now);
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

    if (this.playSampled('quest_update', 0.8, 1.0, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    // Chuông 2 nốt thanh thoát (G5 -> C6)
    const chimeNotes = [783.99, 1046.50];
    for (let i = 0; i < chimeNotes.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + i * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(chimeNotes[i], noteTime);

      gain.gain.setValueAtTime(0.16 * this.sfxVolume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.veilFilter);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    }
  }

  // =========================================================================
  // C4-133-02: LỜI THOẠI NPC, HIỆU ỨNG GÕ CHỮ & ÂM THANH GIAO DIỆN / VẬT PHẨM
  // =========================================================================

  /**
   * C4-133-02: Phát lời chào của NPC khi bắt đầu hội thoại từ gói Super Dialogue Audio Pack
   */
  public playNPCSpeech(speakerNameOrId: string): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('npc_speech', 350)) return;
    this.resumeAudio();

    let sampleKey = 'dialogue_garth';
    const lower = (speakerNameOrId || '').toLowerCase();
    if (lower.includes('edda') || lower.includes('bà edda')) {
      sampleKey = 'dialogue_edda';
    } else if (lower.includes('neris') || lower.includes('y sư') || lower.includes('thảo dược')) {
      sampleKey = 'dialogue_neris';
    } else if (lower.includes('bram') || lower.includes('thợ rèn')) {
      sampleKey = 'dialogue_bram';
    } else if (lower.includes('finn') || lower.includes('cậu bé')) {
      sampleKey = 'dialogue_finn';
    } else if (lower.includes('garth') || lower.includes('người gác')) {
      sampleKey = 'dialogue_garth';
    }

    // Ghi chú DEC-LOCK-21 / AUD-K12: Sir Vaelen và Sir Mordric dùng tạm giọng trầm mặc định (dialogue_garth)
    // cho tới khi có asset thoại riêng được Owner phê duyệt (BLOCKED ON AUDIO ASSET DEPENDENCY).
    if (this.playSampled(sampleKey, 0.8, 1.0, false)) {
      return;
    }

    // Procedural voice formant fallback (tiếng ậm ừ trầm ấm của NPC)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const isFemale = sampleKey === 'dialogue_edda' || sampleKey === 'dialogue_neris';
    const baseFreq = isFemale ? 280 : 160;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, now + 0.08);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12 * this.sfxVolume, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * C4-133-02: Phát âm gõ máy đánh chữ (Typewriter Blip) khi từng ký tự chạy trong hộp thoại
   */
  public playDialogueBlip(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('dialogue_blip', 45)) return;
    this.resumeAudio();

    if (this.playSampled('dialogue_text_blip', 0.25, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680 + (Math.random() * 80 - 40), now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.025);

    gain.gain.setValueAtTime(0.06 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * V15-22: Phát âm thanh gõ gỗ trầm êm tai khi rê chuột / tương tác thẻ gỗ Menu
   */
  public playWoodTap(volume: number = 0.5): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('wood_tap', 70)) return;
    this.resumeAudio();

    if (this.playSampled('footstep_wood_1', volume * 0.7, 1.25, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.05);

    gain.gain.setValueAtTime(0.12 * volume * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * C4-133-02: Phát âm thanh chọn menu / hover UI
   */
  public playUISelect(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('ui_select', 80)) return;
    this.resumeAudio();

    if (this.playSampled('ui_select', 0.5, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.linearRampToValueAtTime(720, now + 0.04);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * C4-133-02: Phát âm thanh xác nhận nút bấm UI / chấp nhận
   */
  public playUIConfirm(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('ui_confirm', 120)) return;
    this.resumeAudio();

    if (this.playSampled('ui_confirm', 0.65, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * C4-133-02: Phát âm thanh hủy bỏ / đóng modal UI
   */
  public playUICancel(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('ui_cancel', 120)) return;
    this.resumeAudio();

    if (this.playSampled('ui_cancel', 0.6, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.08);

    gain.gain.setValueAtTime(0.1 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * C4-133-02: Tiếng dùng thuốc đắp hồi sinh lực
   */
  public playPoulticeHeal(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('poultice', 200)) return;
    this.resumeAudio();

    if (this.playSampled('heal_poultice', 0.7, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * C4-133-02: Tiếng châm dầu đèn lồng
   */
  public playOilRefill(): void {
    if (!this.ctx || this.isMuted) return;
    if (!this.checkCooldown('oil_refill', 200)) return;
    this.resumeAudio();

    if (this.playSampled('oil_refill', 0.75, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.14);

    gain.gain.setValueAtTime(0.16 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // =========================================================================
  // 8. TÍN HIỆU CẢNH BÁO THE LISTENER & CHUÔNG ĐỒNG MIẾU CỔ
  // =========================================================================

  /**
   * C4-13-08 & C4-132-10: Cảnh báo Kẻ Lắng Nghe - Sử dụng Horror Stinger chân thực hoặc
   * sóng âm tam giác dịu êm, loại bỏ hoàn toàn tiếng còi sawtooth 880Hz chói tai gây điếc tai.
   */
  public playListenerAlert(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('listener_alert', 1200)) return;
    this.resumeAudio();
    this.duckAmbience(0.45, 2200);

    if (this.playSampled('listener_alert', 0.85, 1.0, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(1.0, now);

    // Chuyển sang dạng sóng triangle qua bộ lọc dải thấp thay vì sawtooth trực tiếp
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.55);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, now + 0.03); // Attack mượt 30ms chống pop
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.58);
  }

  private fadeOutSampledChannel(key: string): void {
    if (!this.ctx) return;
    const channels = this.activeSFXChannels.get(key);
    if (!channels || channels.length === 0) return;
    const t = this.ctx.currentTime;
    while (channels.length > 0) {
      const ch = channels.shift();
      if (!ch) continue;
      ch.gain.gain.cancelScheduledValues(t);
      ch.gain.gain.setValueAtTime(ch.gain.gain.value, t);
      ch.gain.gain.setTargetAtTime(0.0001, t, 0.025);
      setTimeout(() => {
        try { ch.source.stop(); } catch {}
        try { ch.source.disconnect(); ch.gain.disconnect(); } catch {}
      }, 35);
    }
  }

  public playBronzeBellToll(): void {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    if (!this.checkCooldown('bronze_bell', 800)) return;
    this.resumeAudio();
    this.fadeOutSampledChannel('bell_toll_low');

    // Giới hạn maxPolyphony = 1 để không chồng 2 lượt chuông dài 11.22s mà không cắt file âm thanh gốc
    if (this.playSampled('bronze_bell', 0.9, 1.0, false, 1)) {
      return;
    }

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
      gain.connect(this.masterLimiter || this.masterGain);

      osc.start(now);
      osc.stop(now + 3.6);
    }
  }

  /**
   * V1.5 - BƯỚC V15-07: Tiếng chuông nứt ngân trầm báo hiệu màn đêm buông xuống
   * Các hài âm bất hòa (Inharmonic Dissonance: 115Hz, 168Hz, 248Hz, 375Hz, 520Hz)
   * tạo cảm giác chuông cổ bị rạn nứt, u ám và điềm gở.
   */
  public playCrackedBellToll(): void {
    if (!this.ctx || this.isMuted || !this.masterGain || this.isSanctuaryMusicOnly) return;
    if (!this.checkCooldown('cracked_bell', 1500)) return;
    this.resumeAudio();
    this.fadeOutSampledChannel('bronze_bell');

    // Giới hạn maxPolyphony = 1 để không chồng 2 lượt chuông nứt dài 11.22s mà không cắt file âm thanh gốc
    if (this.playSampled('bell_toll_low', 0.95, 0.85, false, 1)) {
      return;
    }

    const now = this.ctx.currentTime;
    const freqs = [115, 168, 248, 375, 520, 780];
    const weights = [0.45, 0.30, 0.22, 0.14, 0.08, 0.04];
    const decayTimes = [4.2, 3.8, 3.2, 2.5, 1.8, 1.2];

    for (let i = 0; i < freqs.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freqs[i], now);
      osc.frequency.linearRampToValueAtTime(freqs[i] * 0.985, now + decayTimes[i]);

      gain.gain.setValueAtTime(weights[i] * this.masterVolume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTimes[i]);

      osc.connect(gain);
      gain.connect(this.masterLimiter || this.masterGain);

      osc.start(now);
      osc.stop(now + decayTimes[i] + 0.1);
    }
  }

  /**
   * V1.5 - BƯỚC V15-07: Tiếng sói hú xa xăm trong màn sương đêm (Distant Wolf Howl)
   * Sử dụng tổng hợp sóng sin lướt tần số (Portamento: 320Hz -> 540Hz -> 280Hz)
   * kết hợp LFO rung âm (5.2Hz) và bộ lọc Bandpass mô phỏng tiếng hú vọng qua sương mù dày đặc.
   */
  public playDistantWolfHowl(): void {
    if (!this.ctx || this.isMuted || !this.masterGain) return;
    if (!this.checkCooldown('distant_wolf_howl', 2500)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.8);
    osc.frequency.linearRampToValueAtTime(490, now + 1.8);
    osc.frequency.exponentialRampToValueAtTime(280, now + 3.4);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.2, now);
    lfoGain.gain.setValueAtTime(8, now);
    lfo.connect(osc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(2.2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22 * this.masterVolume, now + 0.7);
    gain.gain.setValueAtTime(0.20 * this.masterVolume, now + 2.0);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter || this.masterLimiter || this.masterGain);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 3.6);
    lfo.stop(now + 3.6);
  }

  /**
   * V1.5 - BƯỚC V15-07: Tín hiệu cảnh báo công bằng khi chuyển sang Đêm Sương
   * Kết hợp tiếng chuông nứt ngân trầm và tiếng sói hú xa xăm
   */
  public playNightfallWarningSound(): void {
    this.playCrackedBellToll();
    if (this.ctx) {
      setTimeout(() => {
        this.playDistantWolfHowl();
      }, 450);
    }
  }

  public playRunestoneResonance(noteIndex: number = 0): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('runestone', 300)) return;
    this.resumeAudio();

    const pitchModifiers = [1.0, 1.25, 1.5];
    const rate = pitchModifiers[noteIndex % pitchModifiers.length] || 1.0;
    if (this.playSampled('runestone', 0.8, rate, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    const baseFreqs = [261.63, 329.63, 392.0]; // Hợp âm C-E-G thanh tao
    const freq = baseFreqs[noteIndex % baseFreqs.length] || 300;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.8);

    gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  /**
   * C4-12-24: Âm thanh cảnh báo khi kích hoạt sai thứ tự Cột Đá Cổ Ngữ.
   * Tiếng gầm gừ trầm u ám qua bộ lọc dải thấp, loại bỏ hài cao chát chúa.
   */
  public playRunestoneError(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('runestone_err', 350)) return;
    this.resumeAudio();

    if (this.playSampled('runestone_err', 0.85, 1.0, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(115, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.65);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(122, now); // Detuned for discordant rumble
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.65);

    gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
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

  /**
   * C4-13-08: Hiệu ứng âm thanh vung gậy / tấn công cận chiến (Staff/Stick Attack Swing)
   */
  public playAttackSwing(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('attack', 200)) return;
    this.resumeAudio();

    if (this.playSampled('attack', 0.8, 1.0, true)) {
      return;
    }

    const now = this.ctx.currentTime;

    // 1. Tiếng xé gió nhanh (Whoosh Noise)
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.14);
      filter.Q.setValueAtTime(1.5, now); // Giảm Q từ 2.8 -> 1.5 chống rít chói

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.veilFilter);

      noise.start(now);
      noise.stop(now + 0.15);
    }

    // 2. Tiếng gậy gỗ rít trầm đục
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.12);

    oscGain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * C4-13-08: Hiệu ứng âm thanh khi bước vào hoặc bước ra khỏi bụi rậm ẩn nấp (Bush Rustle)
   */
  public playBushRustle(entering: boolean = true): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('bush_rustle', 200)) return;
    this.resumeAudio();

    if (this.playSampled('bush_rustle', 0.65, entering ? 1.05 : 0.95, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(entering ? 750 : 880, now);
      filter.frequency.exponentialRampToValueAtTime(entering ? 280 : 360, now + 0.16);
      filter.Q.setValueAtTime(1.2, now); // Giảm Q từ 2.2 -> 1.2 cho âm thanh xào xạc tự nhiên

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.veilFilter);

      noise.start(now);
      noise.stop(now + 0.19);
    }
  }

  // =========================================================================
  // 9. DỌN DẸP & GIẢI PHÓNG TÀI NGUYÊN (CLEANUP)
  // =========================================================================

  /**
   * C4-13-03 & C4-133: Dừng toàn bộ âm thanh môi trường, nhịp tim và giải phóng toàn bộ kênh SFX
   */
  public stopAll(): void {
    if (this.activeBGMRampInterval !== null) {
      window.clearInterval(this.activeBGMRampInterval);
      this.activeBGMRampInterval = null;
    }
    this.stopAmbience(true);
    this.stopBGM(0.1);
    for (const fb of this.fadingBGMAudios) {
      window.clearInterval(fb.intervalId);
      try {
        fb.audio.pause();
        fb.audio.removeAttribute('src');
      } catch {}
    }
    this.fadingBGMAudios = [];
    for (const fb of this.fadingBGMSources) {
      clearTimeout(fb.timerId);
      try { fb.source.stop(); } catch {}
      try { fb.source.disconnect(); fb.gain.disconnect(); } catch {}
    }
    this.fadingBGMSources = [];
    this.setHeartbeatActive(false);
    if (this.bossDroneSource) {
      try { this.bossDroneSource.stop(); } catch {}
      try { this.bossDroneSource.disconnect(); } catch {}
      this.bossDroneSource = null;
    }
    if (this.bossDroneGain) {
      try { this.bossDroneGain.disconnect(); } catch {}
      this.bossDroneGain = null;
    }
    if (this.rainSource) {
      try { this.rainSource.stop(); } catch {}
      try { this.rainSource.disconnect(); } catch {}
      this.rainSource = null;
    }
    if (this.rainGain) {
      try { this.rainGain.disconnect(); } catch {}
      this.rainGain = null;
    }
    this.lastRainTargetGain = -1;
    this.isBossAwakened = false;
    for (const channels of this.activeSFXChannels.values()) {
      for (const ch of channels) {
        try { ch.source.stop(); } catch {}
        try { ch.source.disconnect(); ch.gain.disconnect(); } catch {}
      }
    }
    this.activeSFXChannels.clear();
  }

  public stopAllLoops(): void {
    this.stopAll();
  }

  /**
   * C4-13-03: Hiệu ứng âm thanh khi nhân vật chịu đòn đau
   */
  public playHurt(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    if (!this.checkCooldown('hurt', 300)) return;
    this.resumeAudio();

    if (this.playSampled('hurt', 0.85, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    osc.type = 'triangle'; // Dùng triangle êm dịu hơn nhiều so với sawtooth
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(0.24 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterLimiter || this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /**
   * C4-13-08: Hiệu ứng âm thanh khi nhân vật ngã gục / tử trận (Player Death Downfall & Impact)
   */
  public playPlayerDeath(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    if (!this.checkCooldown('death', 1000)) return;
    this.resumeAudio();

    if (this.playSampled('death', 0.95, 1.0, false)) {
      return;
    }

    const now = this.ctx.currentTime;

    // 1. Tiếng va chạm nặng xuống mặt đất (Heavy impact thud)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(95, now);
    thudOsc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

    thudGain.gain.setValueAtTime(0.32 * this.sfxVolume, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterLimiter || this.masterGain);
    thudOsc.start(now);
    thudOsc.stop(now + 0.48);

    // 2. Âm thanh rền rĩ bi thương u ám kéo dài (Tragic down-sweep)
    const tragicOsc = this.ctx.createOscillator();
    const tragicFilter = this.ctx.createBiquadFilter();
    const tragicGain = this.ctx.createGain();

    tragicFilter.type = 'lowpass';
    tragicFilter.frequency.setValueAtTime(500, now + 0.05);

    tragicOsc.type = 'triangle'; // Dùng triangle thay cho raw sawtooth
    tragicOsc.frequency.setValueAtTime(160, now + 0.05);
    tragicOsc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

    tragicGain.gain.setValueAtTime(0.20 * this.sfxVolume, now + 0.05);
    tragicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    tragicOsc.connect(tragicFilter);
    tragicFilter.connect(tragicGain);
    tragicGain.connect(this.masterLimiter || this.masterGain);
    tragicOsc.start(now + 0.05);
    tragicOsc.stop(now + 0.72);
  }

  /**
   * V1.4: Tiếng quạ kêu cảnh báo (Crow Caw Alert) khi giật mình bay lên
   */
  public playCrowCaw(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('crow_caw', 1100)) return;
    this.resumeAudio();
    this.duckAmbience(0.55, 1300);

    // V15-FIX-02: Tổng hợp âm thanh bằng Web Audio procedural synth sạch sẽ, không gọi vào key không tồn tại
    const now = this.ctx.currentTime;

    // 2 nhịp kêu "Quạ... Quạ!" khàn đục u ám
    const cawBursts = [0, 0.22];
    cawBursts.forEach((delay) => {
      if (!this.ctx || !this.veilFilter) return;
      const t = now + delay;

      // Dual oscillator tạo âm thanh khàn đặc trưng của quạ
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(680, t);
      osc1.frequency.exponentialRampToValueAtTime(410, t + 0.16);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(540, t);
      osc2.frequency.exponentialRampToValueAtTime(360, t + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, t);
      filter.frequency.exponentialRampToValueAtTime(520, t + 0.16);
      filter.Q.setValueAtTime(2.8, t);

      gain.gain.setValueAtTime(0.24 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.veilFilter);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.19);
      osc2.stop(t + 0.19);
    });

    // Đi kèm tiếng đập cánh
    this.playCrowFlap();
  }

  /**
   * V1.4: Tiếng vỗ cánh quạ giật mình bay lên (Crow Wing Flap)
   */
  public playCrowFlap(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('crow_flap', 400)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    // 3 nhịp đập cánh nhanh
    [0, 0.08, 0.17].forEach((delay, idx) => {
      if (!this.ctx || !this.veilFilter) return;
      const t = now + delay;
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450 - idx * 40, t);
      filter.Q.setValueAtTime(1.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime((0.14 - idx * 0.03) * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.veilFilter);

      noise.start(t);
      noise.stop(t + 0.10);
    });
  }

  /**
   * V1.4: Tiếng cánh bướm đêm dập dờn thanh tao (Lantern Moth Shimmer Flutter)
   */
  public playMothFlutter(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('moth_flutter', 2500)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.linearRampToValueAtTime(1750, now + 0.18);
    osc.frequency.linearRampToValueAtTime(1300, now + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1550, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.04 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.40);
  }

  /**
   * V1.4: Tiếng bước chân giả vang vọng trong sương sâu (False Footsteps Event)
   * Âm sắc rỗng và vang xa (hollow bandpass reverb) để phân biệt với quái vật thật
   */
  public playFalseFootsteps(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter || this.isSanctuaryMusicOnly) return;
    if (!this.checkCooldown('false_footsteps', 1800)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    // 4 bước chân nhịp rỗng cách nhau 320ms
    [0, 0.32, 0.64, 0.96].forEach((delay, idx) => {
      if (!this.ctx || !this.veilFilter) return;
      const t = now + delay;
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Filter bandpass với resonance cao tạo tiếng rỗng (hollow wood/stone)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(idx % 2 === 0 ? 320 : 280, t);
      filter.Q.setValueAtTime(4.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.veilFilter);

      noise.start(t);
      noise.stop(t + 0.18);
    });
  }

  /**
   * V1.4: Tiếng gió rít hú báo hiệu Đợt Sương Dâng (Fog Surge Wind Gust)
   */
  public playWindWhoosh(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter || this.isSanctuaryMusicOnly) return;
    if (!this.checkCooldown('wind_whoosh', 5000)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(650, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(140, now + 2.8);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.28 * this.sfxVolume, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    noise.start(now);
    noise.stop(now + 3.1);
  }

  /**
   * V1.4 - P8: Tiếng gầm gừ đe dọa của Sói Xương (Skull Wolf Menacing Growl)
   * Dao động âm tần thấp 65Hz - 42Hz kết hợp LFO rung cổ họng u ám
   */
  public playWolfGrowl(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('wolf_growl', 1800)) return;
    this.resumeAudio();
    this.duckAmbience(0.7, 1200);

    // V15-FIX-02: Đồng bộ key 'skull_wolf_growl' & 'skull_wolf_snarl' với no-repeat shuffle
    const wolfSample = this.getNoRepeatSample('wolf_vocal', ['skull_wolf_growl', 'skull_wolf_snarl']);
    if (this.playSampled(wolfSample, 0.85, 0.95 + Math.random() * 0.1, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(75, now);
    osc1.frequency.linearRampToValueAtTime(55, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(38, now + 0.9);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(62, now);
    osc2.frequency.linearRampToValueAtTime(48, now + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(32, now + 0.9);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.8);
    filter.Q.setValueAtTime(3.2, now);

    gain.gain.setValueAtTime(0.01 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.24 * this.sfxVolume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.0);
    osc2.stop(now + 1.0);
  }

  /**
   * V1.4 - P8: Tiếng xương lách cách khi Sói Xương di chuyển / rình rập (Bone Rattle Clatter)
   */
  public playBoneRattle(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('bone_rattle', 1400)) return;
    this.resumeAudio();

    // V15-FIX-02: Tổng hợp âm thanh bằng Web Audio procedural synth sạch sẽ, không gọi vào key không tồn tại
    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    // 4 nhịp va đập xương khô lách cách
    [0, 0.045, 0.09, 0.14].forEach((delay, idx) => {
      if (!this.ctx || !this.veilFilter) return;
      const t = now + delay;
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400 + idx * 250, t);
      filter.Q.setValueAtTime(7.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.veilFilter);

      noise.start(t);
      noise.stop(t + 0.04);
    });
  }

  /**
   * V1.4 - P8: Tiếng Sói Xương vồ mồi (Skull Wolf Lunge / Snap)
   */
  public playWolfLunge(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    if (!this.checkCooldown('wolf_lunge', 800)) return;
    this.resumeAudio();

    // V15-FIX-02: Đồng bộ key sang 'skull_wolf_snarl' có sẵn trong audioManifest
    if (this.playSampled('skull_wolf_snarl', 0.85, 1.0, true)) {
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(2.0, now);

    gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * V1.4 - P8: Tiếng rạn nứt xương và tan biến thành tro bụi khi bị đánh tan
   */
  public playWolfDissolve(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.8);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    noise.start(now);
    noise.stop(now + 0.9);
  }

  // =========================================================================
  // V1.4 - P8-09: HIỆU ỨNG ÂM THANH QUÁI VẬT BÓNG TỐI (SHADOW MONSTERS SFX)
  // =========================================================================

  /**
   * Tiếng Quạ Bóng Tối kêu chói tai báo động The Listener
   */
  public playShadowCrowCaw(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.24 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  /**
   * Tiếng Quạ Bóng Tối vỗ cánh lao xuống tấn công quấy rối
   */
  public playShadowCrowAttack(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(400, now + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    noise.start(now);
    noise.stop(now + 0.35);
  }

  /**
   * Tiếng thì thầm tâm linh khi người chơi nhìn thẳng vào Bóng Mắt Sương Mù
   */
  public playShadowEyesGaze(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.5);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Tiếng xèo xèo bốc hơi khi Bóng Mắt bị ánh đèn lồng rọi vào tan biến
   */
  public playShadowEyesDissolve(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2500, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    noise.start(now);
    noise.stop(now + 0.5);
  }

  /**
   * Tiếng gầm vang trời của Trùm Bóng Tối Khổng Lồ (Behemoth)
   */
  public playBehemothRoar(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(35, now + 1.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.linearRampToValueAtTime(150, now + 1.4);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 1.6);
  }

  /**
   * Tiếng bước chân nặng trĩu làm rung chuyển mặt đất của Trùm
   */
  public playBehemothStep(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);

    gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Tiếng đòn vỗ đất tạo sóng xung kích địa chấn của Trùm
   */
  public playBehemothSlam(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.65);

    gain.gain.setValueAtTime(0.38 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  /**
   * Tiếng đánh hụt vào không khí và khựng lại lộ sơ hở của Trùm
   */
  public playBehemothMiss(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(160, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    noise.start(now);
    noise.stop(now + 0.6);
  }

  /**
   * Tiếng nổ bóng tối và tan biến của Trùm khi bị đánh bại
   */
  public playBehemothDefeat(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 2.0);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(80, now + 2.0);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 2.3);
  }

  // =========================================================================
  // V1.4 - P8-10: HIỆU ỨNG ÂM THANH NHÓM HIỆP SĨ TÀ ÁC (EVIL KNIGHTS FACTION)
  // =========================================================================

  /**
   * Tiếng va chạm giáp sắt vang rền (Armor Clank / Parry)
   */
  public playArmorClank(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.38);
    osc2.stop(now + 0.38);
  }

  /**
   * Tiếng vó ngựa dồn dập & ngựa hí báo hiệu cú húc càn quét của Kỵ Binh Hắc Ám
   */
  public playHorseCharge(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    // 1. Tiếng ngựa hí (Whinny / Snort)
    const whinny = this.ctx.createOscillator();
    const whinnyGain = this.ctx.createGain();
    whinny.type = 'sawtooth';
    whinny.frequency.setValueAtTime(450, now);
    whinny.frequency.linearRampToValueAtTime(750, now + 0.2);
    whinny.frequency.linearRampToValueAtTime(320, now + 0.55);

    whinnyGain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    whinnyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    whinny.connect(whinnyGain);
    whinnyGain.connect(this.veilFilter);
    whinny.start(now);
    whinny.stop(now + 0.58);

    // 2. Nhịp vó ngựa phi nước đại (Gallop hooves)
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (noiseBuffer) {
      for (let i = 0; i < 4; i++) {
        const stepTime = now + 0.12 * i;
        const hoof = this.ctx.createBufferSource();
        hoof.buffer = noiseBuffer;

        const hoofFilter = this.ctx.createBiquadFilter();
        hoofFilter.type = 'lowpass';
        hoofFilter.frequency.setValueAtTime(220, stepTime);

        const hoofGain = this.ctx.createGain();
        hoofGain.gain.setValueAtTime(0.25 * this.sfxVolume, stepTime);
        hoofGain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.08);

        hoof.connect(hoofFilter);
        hoofFilter.connect(hoofGain);
        hoofGain.connect(this.veilFilter);

        hoof.start(stepTime);
        hoof.stop(stepTime + 0.1);
      }
    }
  }

  /**
   * Tiếng vung kiếm chém sắc bén của Hiệp Sĩ (Sword Slash)
   */
  public playKnightSwordSlash(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.25);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    noise.start(now);
    noise.stop(now + 0.3);
  }

  /**
   * Tiếng tụ năng lượng bóng tối của Chỉ Huy Hiệp Sĩ Trùm Mũ (Powerup Charge)
   */
  public playKnightPowerup(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(900, now + 1.2);

    gain.gain.setValueAtTime(0.05 * this.sfxVolume, now);
    gain.gain.linearRampToValueAtTime(0.32 * this.sfxVolume, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 1.35);
  }

  /**
   * Tiếng giáp sắt đổ ầm xuống đất & tan vỡ khi Hiệp Sĩ ngã xuống (Knight Defeat)
   */
  public playKnightDefeat(): void {
    if (!this.ctx || this.isMuted || !this.veilFilter) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(90, now + 0.8);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    osc.start(now);
    osc.stop(now + 0.9);

    // Kèm tiếng rổn rảng kim loại vỡ vụn
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (noiseBuffer) {
      const metalCrash = this.ctx.createBufferSource();
      metalCrash.buffer = noiseBuffer;

      const metalFilter = this.ctx.createBiquadFilter();
      metalFilter.type = 'bandpass';
      metalFilter.frequency.setValueAtTime(1600, now + 0.1);
      metalFilter.Q.setValueAtTime(3.0, now + 0.1);

      const metalGain = this.ctx.createGain();
      metalGain.gain.setValueAtTime(0.24 * this.sfxVolume, now + 0.1);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      metalCrash.connect(metalFilter);
      metalFilter.connect(metalGain);
      metalGain.connect(this.veilFilter);

      metalCrash.start(now + 0.1);
      metalCrash.stop(now + 0.75);
    }
  }

  /**
   * V1.5 (BƯỚC V15-05): Tiếng thở nhẹ cảnh báo khi Bình Tâm ở Ngưỡng Bất An (25..40/100)
   */
  public playUneasyBreathing(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    if (!this.checkCooldown('uneasy_breathing', 5000)) return;
    this.resumeAudio();

    const now = this.ctx.currentTime;
    const noiseBuffer = this.getOrCreateNoiseBuffer();
    if (!noiseBuffer || !this.veilFilter) return;

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.8);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18 * this.sfxVolume, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.veilFilter);

    source.start(now);
    source.stop(now + 0.9);
  }

  public destroy(): void {
    this.cleanupAutoplayUnlock();
    if (this.activeBGMRampInterval !== null) {
      window.clearInterval(this.activeBGMRampInterval);
      this.activeBGMRampInterval = null;
    }
    this.stopAmbience(true);
    this.stopBGM(0.1);
    for (const fb of this.fadingBGMAudios) {
      window.clearInterval(fb.intervalId);
      try {
        fb.audio.pause();
        fb.audio.removeAttribute('src');
      } catch {}
    }
    this.fadingBGMAudios = [];
    for (const fb of this.fadingBGMSources) {
      clearTimeout(fb.timerId);
      try { fb.source.stop(); } catch {}
      try { fb.source.disconnect(); fb.gain.disconnect(); } catch {}
    }
    this.fadingBGMSources = [];
    if (this.rainSource) {
      try { this.rainSource.stop(); } catch {}
      try { this.rainSource.disconnect(); } catch {}
      this.rainSource = null;
    }
    if (this.rainGain) {
      try { this.rainGain.disconnect(); } catch {}
      this.rainGain = null;
    }
    this.lastRainTargetGain = -1;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.isHeartbeatActive = false;
    this.isSanityDucked = false;
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    this.isUnlocked = false;
    this.audioBuffers.clear();
    this.loadingBuffers.clear();
    AudioManager.instance = null;
  }
}
