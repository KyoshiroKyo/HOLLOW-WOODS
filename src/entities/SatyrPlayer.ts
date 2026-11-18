import * as Phaser from 'phaser';
import { 
  SATYR_SHEET_KEY, 
  WAYFARER_IDLE_KEY,
  WAYFARER_ORIGIN_X,
  WAYFARER_ORIGIN_Y,
  WAYFARER_BODY_WIDTH,
  WAYFARER_BODY_HEIGHT,
  WAYFARER_BODY_OFFSET_X,
  WAYFARER_BODY_OFFSET_Y,
  LANTERN_OFFSET_DOWN,
  LANTERN_OFFSET_UP,
  LANTERN_OFFSET_LEFT,
  LANTERN_OFFSET_RIGHT,
  PLAYER_WALK_SPEED,
  PLAYER_SPRINT_SPEED
} from '../config/Constants';
import { PlayerState } from '../state/PlayerState';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { FacingDirection, PlayerStats } from '../types';
import { AudioManager } from '../audio/AudioManager';

export type OneShotAction =
  | 'interact'
  | 'lantern'
  | 'attack'
  | 'throw_lure'
  | 'craft'
  | 'journal'
  | 'pause'
  | 'poultice'
  | 'oil'
  | 'mute';

export class SatyrPlayer extends Phaser.Physics.Arcade.Sprite {
  private static activeDOMListenerOwner: SatyrPlayer | null = null;

  public facing: FacingDirection = 'down';
  
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyF!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  
  private eKeyJustPressed: boolean = false;

  // Trạng thái đầu vào vật lý (Physical KeyCode + Tương thích bộ gõ Tiếng Việt UniKey / EVKey / OS IME)
  private activePhysicalCodes: Set<string> = new Set();
  private physicalKeyHeldForOneShot: Set<string> = new Set();
  private pendingOneShotActions: Set<OneShotAction> = new Set();
  private keyDownTimestamps: Map<string, number> = new Map();
  private syntheticHoldTimers: Map<string, number> = new Map();
  private lastKeyActivityTime: Map<string, number> = new Map();
  private hasRecentIMEEvent: boolean = false;
  private lastWindowFocusTime: number = 0;
  private lastExhaustPopupTime: number = 0;
  private isComposingInTextInput: boolean = false;
  private isTextInputFocused: boolean = false;
  private domListenersAttached: boolean = false;
  private isPhysicalShiftHeld: boolean = false;

  private readonly boundKeyDown = (e: KeyboardEvent) => this.handleDOMKeyDown(e);
  private readonly boundKeyUp = (e: KeyboardEvent) => this.handleDOMKeyUp(e);
  private readonly boundCompositionStart = (e: CompositionEvent) => this.handleDOMCompositionStart(e);
  private readonly boundCompositionEnd = (e: CompositionEvent) => this.handleDOMCompositionEnd(e);
  private readonly boundWindowBlur = () => this.resetAllInputState();
  private readonly boundWindowFocus = () => {
    this.lastWindowFocusTime = Date.now();
    this.syncTextInputFocusState();
    this.resetAllInputState();
  };
  private readonly boundVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.hidden) {
      this.resetAllInputState();
    }
  };
  private readonly boundFocusChange = () => this.syncTextInputFocusState();
  private readonly boundPointerDown = (pointer: Phaser.Input.Pointer) => {
    if (pointer.leftButtonDown()) {
      // C4-132-01: Bỏ qua click chuột khi vừa lấy lại focus trong 350ms đầu
      if (Date.now() - this.lastWindowFocusTime < 350) {
        return;
      }
      // C4-132-01: Bỏ qua khi con trỏ chuột nằm trên vùng HUD góc trên trái hoặc thanh phím tắt dưới đáy
      if (pointer.y > 640 || (pointer.x < 340 && pointer.y < 160)) {
        return;
      }
      const uiScene = this.scene.scene.get('UIScene') as any;
      if (uiScene && uiScene.isAnyModalOpen) {
        return;
      }
      const gameScene = this.scene as any;
      if (gameScene.dialogueSystem && gameScene.dialogueSystem.isActive) {
        return;
      }
      if (!this.isActionLocked()) {
        this.pendingOneShotActions.add('attack');
      }
    }
  };

  // Trạng thái hành động độc quyền (Exclusive Action States)
  private _isAttacking: boolean = false;
  private _isHurt: boolean = false;
  private _isDead: boolean = false;
  private _isGathering: boolean = false;
  private _isInteracting: boolean = false;
  private _isUsingItem: boolean = false;
  private _isStaminaExhausted: boolean = false;
  private _lastAttackTime: number = 0;

  // V1.5 (BƯỚC V15-02): Bộ đếm bảo hiểm tự giải phóng khóa hành động (Safety Watchdog Timeout tối đa 600ms)
  public static readonly ACTION_SAFETY_TIMEOUT_MS: number = 600;
  private _actionLockTimestamp: number = 0;

  // V1.5 (BƯỚC V15-02): Bộ đệm chuyển hướng 40ms (Direction Buffer) chống giật hoạt ảnh khi nhấp nhả phím
  public static readonly DIRECTION_BUFFER_MS: number = 40;
  private desiredDirection: FacingDirection | null = null;
  private directionBufferStartTime: number = 0;
  private _wasMoving: boolean = false;

  // Lớp hiển thị đồ họa trực quan của chiếc đèn lồng hổ phách (C4-12-07 Lantern Overlay)
  private lanternOverlayGfx: Phaser.GameObjects.Graphics | null = null;
  private footShadowGfx: Phaser.GameObjects.Graphics | null = null;
  private lastLanternToggleTime: number = 0;

  // C4-13-01: Quản lý trạng thái ẩn nấp an toàn (Hiding & Stealth Stance)
  public lastSafePosition: { x: number; y: number } = { x: 0, y: 0 };
  public hidingTimestamp: number = 0;

  // C4-12-29: Tái sử dụng đối tượng Vector2 & Lantern Position tránh cấp phát rác (Zero-Allocation Pool)
  private cachedFootPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  private cachedLanternPos: { x: number; y: number; isVisible: boolean } = { x: 0, y: 0, isVisible: true };

  /**
   * Nguồn trạng thái sinh tồn duy nhất (Single Authoritative Survival State từ PlayerState)
   */
  public get stats(): PlayerStats {
    return PlayerState.getInstance().stats;
  }

  public set stats(value: PlayerStats) {
    Object.assign(PlayerState.getInstance().stats, value);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Khởi tạo sprite với texture của The Mossbound Wayfarer (hoặc fallback SATYR_SHEET_KEY)
    const initialTexture = scene.textures.exists(WAYFARER_IDLE_KEY) ? WAYFARER_IDLE_KEY : SATYR_SHEET_KEY;
    super(scene, x, y, initialTexture, 0);

    // Thêm sprite vào Scene và bật Arcade Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Cấu hình điểm neo bàn chân (foot anchor origin: 0.5, 0.90625 -> y=58 trong ô 64x64)
    this.setOrigin(WAYFARER_ORIGIN_X, WAYFARER_ORIGIN_Y);
    this.setFlipX(false);

    // Cấu hình vùng va chạm vật lý nhỏ ở bàn chân (14×8 px, offset 25, 50)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(WAYFARER_BODY_WIDTH, WAYFARER_BODY_HEIGHT);
      body.setOffset(WAYFARER_BODY_OFFSET_X, WAYFARER_BODY_OFFSET_Y);
      body.setCollideWorldBounds(true);
    }

    // Khởi tạo phím điều khiển
    this.setupInput();

    // C4-13-06: Khởi tạo bóng đổ mặt đất mịn màng (alpha 0.25) ôm sát chân nhân vật
    this.footShadowGfx = scene.add.graphics();
    this.footShadowGfx.fillStyle(0x000000, 0.25);
    this.footShadowGfx.fillEllipse(0, 0, 16, 5);
    this.footShadowGfx.setDepth(this.depth - 1);

    // Khởi tạo lớp đồ họa đèn lồng trực quan gắn trên nhân vật
    this.lanternOverlayGfx = scene.add.graphics();
    this.lanternOverlayGfx.setDepth(this.depth + 1);

    // Hoạt ảnh mặc định ban đầu: The Mossbound Wayfarer đứng thở nhẹ hướng DOWN
    const defaultAnim = this.scene.anims.exists('wayfarer_idle_down') ? 'wayfarer_idle_down' : 'satyr_idle_down';
    this.play(defaultAnim);
  }

  private setupInput(): void {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyShift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyE = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyF = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.attachDOMInputListeners();
    this.scene.input.on('pointerdown', this.boundPointerDown);
  }

  public static isEditableElement(target: EventTarget | Element | null | undefined): boolean {
    if (!target || typeof target !== 'object') return false;
    const el = target as HTMLElement;
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      return true;
    }
    if (el.isContentEditable) {
      return true;
    }
    if (typeof el.getAttribute === 'function') {
      const ce = el.getAttribute('contenteditable');
      if (ce === 'true' || ce === '') return true;
    }
    if (typeof el.closest === 'function') {
      const parentCe = el.closest('[contenteditable="true"], [contenteditable=""], input, textarea, select');
      if (parentCe) return true;
    }
    return false;
  }

  public static isTextInputOrComposing(event?: KeyboardEvent | CompositionEvent | null): boolean {
    if (event) {
      if (SatyrPlayer.isEditableElement(event.target)) return true;
      if ('isComposing' in event && event.isComposing && SatyrPlayer.isEditableElement(document?.activeElement)) {
        return true;
      }
    }
    if (typeof document !== 'undefined' && SatyrPlayer.isEditableElement(document.activeElement)) {
      return true;
    }
    return false;
  }

  public static resolvePhysicalCode(event: KeyboardEvent): string | null {
    const rawCode = event.code || '';
    switch (rawCode) {
      case 'KeyW':
      case 'KeyA':
      case 'KeyS':
      case 'KeyD':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'Space':
      case 'Enter':
      case 'NumpadEnter':
      case 'Escape':
      case 'Tab':
      case 'KeyE':
      case 'KeyF':
      case 'KeyQ':
      case 'KeyI':
      case 'KeyJ':
      case 'KeyM':
      case 'Digit1':
      case 'Digit2':
      case 'Numpad1':
      case 'Numpad2':
        return rawCode === 'NumpadEnter' ? 'Enter' : rawCode === 'Numpad1' ? 'Digit1' : rawCode === 'Numpad2' ? 'Digit2' : rawCode;
      default:
        break;
    }

    // Hỗ trợ gói ký tự Unicode (VK_PACKET keyCode=231 / IME keyCode=229) từ UniKey & EVKey (Telex / VNI)
    const rawKey = (event.key || '').toLowerCase();
    switch (rawKey) {
      case 'w':
      case 'ư':
      case 'ă':
      case 'ơ':
        return 'KeyW';
      case 'a':
      case 'â':
        return 'KeyA';
      case 's':
        return 'KeyS';
      case 'd':
      case 'đ':
        return 'KeyD';
      case 'e':
      case 'ê':
        return 'KeyE';
      case 'f':
        return 'KeyF';
      case 'q':
        return 'KeyQ';
      case 'i':
        return 'KeyI';
      case 'j':
        return 'KeyJ';
      case 'm':
        return 'KeyM';
      case '1':
        return 'Digit1';
      case '2':
        return 'Digit2';
      case 'escape':
      case 'esc':
        return 'Escape';
      case 'enter':
        return 'Enter';
      case 'tab':
        return 'Tab';
      case ' ':
        return 'Space';
      case 'shift':
        return 'ShiftLeft';
      case 'arrowup':
        return 'ArrowUp';
      case 'arrowdown':
        return 'ArrowDown';
      case 'arrowleft':
        return 'ArrowLeft';
      case 'arrowright':
        return 'ArrowRight';
      default:
        break;
    }

    switch (event.keyCode) {
      case 87:
        return 'KeyW';
      case 65:
        return 'KeyA';
      case 83:
        return 'KeyS';
      case 68:
        return 'KeyD';
      case 69:
        return 'KeyE';
      case 70:
        return 'KeyF';
      case 81:
        return 'KeyQ';
      case 73:
        return 'KeyI';
      case 74:
        return 'KeyJ';
      case 77:
        return 'KeyM';
      case 49:
      case 97:
        return 'Digit1';
      case 50:
      case 98:
        return 'Digit2';
      case 27:
        return 'Escape';
      case 13:
        return 'Enter';
      case 9:
        return 'Tab';
      case 32:
        return 'Space';
      case 16:
        return 'ShiftLeft';
      case 38:
        return 'ArrowUp';
      case 40:
        return 'ArrowDown';
      case 37:
        return 'ArrowLeft';
      case 39:
        return 'ArrowRight';
      default:
        return null;
    }
  }

  public static isGameControlCode(code: string | null): boolean {
    if (!code) return false;
    switch (code) {
      case 'KeyW':
      case 'KeyA':
      case 'KeyS':
      case 'KeyD':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'Space':
      case 'KeyE':
      case 'KeyF':
      case 'KeyQ':
      case 'KeyI':
      case 'KeyJ':
      case 'KeyM':
      case 'Digit1':
      case 'Digit2':
      case 'Tab':
      case 'Escape':
        return true;
      default:
        return false;
    }
  }

  private isEditableTextContext(eventTarget?: EventTarget | null): boolean {
    if (SatyrPlayer.isEditableElement(eventTarget)) return true;
    if (typeof document !== 'undefined' && SatyrPlayer.isEditableElement(document.activeElement)) {
      return true;
    }
    return false;
  }

  private setPhaserKeyboardsEnabled(enabled: boolean): void {
    if (!this.scene || !this.scene.game || !this.scene.game.scene) return;
    for (const sc of this.scene.game.scene.scenes) {
      if (sc && sc.input && sc.input.keyboard) {
        sc.input.keyboard.enabled = enabled;
        if (!enabled) {
          sc.input.keyboard.resetKeys();
        }
      }
    }
  }

  private syncTextInputFocusState(eventTarget?: EventTarget | null): void {
    const focused = this.isEditableTextContext(eventTarget);
    this.isTextInputFocused = focused;
    if (focused || this.isComposingInTextInput) {
      this.setPhaserKeyboardsEnabled(false);
      this.resetAllInputState();
    } else {
      this.setPhaserKeyboardsEnabled(true);
    }
  }

  private attachDOMInputListeners(): void {
    if (typeof window === 'undefined') return;

    if (SatyrPlayer.activeDOMListenerOwner && SatyrPlayer.activeDOMListenerOwner !== this) {
      SatyrPlayer.activeDOMListenerOwner.cleanupDOMListeners();
    }
    if (this.domListenersAttached) {
      this.cleanupDOMListeners();
    }

    window.addEventListener('keydown', this.boundKeyDown, { capture: true, passive: false });
    window.addEventListener('keyup', this.boundKeyUp, { capture: true, passive: false });
    window.addEventListener('compositionstart', this.boundCompositionStart, { capture: true });
    window.addEventListener('compositionend', this.boundCompositionEnd, { capture: true });
    window.addEventListener('blur', this.boundWindowBlur);
    window.addEventListener('focus', this.boundWindowFocus);
    window.addEventListener('focusin', this.boundFocusChange, { capture: true });
    window.addEventListener('focusout', this.boundFocusChange, { capture: true });
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.boundVisibilityChange);
    }

    this.domListenersAttached = true;
    SatyrPlayer.activeDOMListenerOwner = this;

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupDOMListeners());
    this.once(Phaser.GameObjects.Events.DESTROY, () => this.cleanupDOMListeners());
  }

  public cleanupDOMListeners(): void {
    if (typeof window !== 'undefined' && this.domListenersAttached) {
      window.removeEventListener('keydown', this.boundKeyDown, { capture: true });
      window.removeEventListener('keyup', this.boundKeyUp, { capture: true });
      window.removeEventListener('compositionstart', this.boundCompositionStart, { capture: true });
      window.removeEventListener('compositionend', this.boundCompositionEnd, { capture: true });
      window.removeEventListener('blur', this.boundWindowBlur);
      window.removeEventListener('focus', this.boundWindowFocus);
      window.removeEventListener('focusin', this.boundFocusChange, { capture: true });
      window.removeEventListener('focusout', this.boundFocusChange, { capture: true });
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.boundVisibilityChange);
      }
    }
    this.domListenersAttached = false;
    if (SatyrPlayer.activeDOMListenerOwner === this) {
      SatyrPlayer.activeDOMListenerOwner = null;
    }
    this.clearAllSyntheticHoldTimers();
  }

  private isMovementOrSprintCode(code: string): boolean {
    return (
      code === 'KeyW' ||
      code === 'KeyA' ||
      code === 'KeyS' ||
      code === 'KeyD' ||
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'ShiftLeft' ||
      code === 'ShiftRight'
    );
  }

  private armSyntheticHoldWatchdog(code: string, durationMs: number = 550): void {
    if (typeof window === 'undefined') return;
    const prev = this.syntheticHoldTimers.get(code);
    if (prev !== undefined) {
      window.clearTimeout(prev);
    }
    const timerId = window.setTimeout(() => {
      this.syntheticHoldTimers.delete(code);
      this.releasePhysicalCode(code);
    }, durationMs);
    this.syntheticHoldTimers.set(code, timerId);
  }

  private clearSyntheticHoldWatchdog(code: string): void {
    if (typeof window === 'undefined') return;
    const prev = this.syntheticHoldTimers.get(code);
    if (prev !== undefined) {
      window.clearTimeout(prev);
      this.syntheticHoldTimers.delete(code);
    }
  }

  private clearAllSyntheticHoldTimers(): void {
    if (typeof window === 'undefined') return;
    for (const timerId of this.syntheticHoldTimers.values()) {
      window.clearTimeout(timerId);
    }
    this.syntheticHoldTimers.clear();
  }

  private resetPhaserKeyForCode(code: string): void {
    switch (code) {
      case 'KeyW':
        this.keyW?.reset();
        break;
      case 'KeyA':
        this.keyA?.reset();
        break;
      case 'KeyS':
        this.keyS?.reset();
        break;
      case 'KeyD':
        this.keyD?.reset();
        break;
      case 'ArrowUp':
        this.cursors?.up?.reset();
        break;
      case 'ArrowDown':
        this.cursors?.down?.reset();
        break;
      case 'ArrowLeft':
        this.cursors?.left?.reset();
        break;
      case 'ArrowRight':
        this.cursors?.right?.reset();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keyShift?.reset();
        this.cursors?.shift?.reset();
        break;
      case 'KeyE':
        this.keyE?.reset();
        break;
      case 'KeyF':
        this.keyF?.reset();
        break;
      case 'Space':
        this.keySpace?.reset();
        break;
    }
  }

  private releasePhysicalCode(code: string): void {
    this.activePhysicalCodes.delete(code);
    this.lastKeyActivityTime.delete(code);
    this.keyDownTimestamps.delete(code);
    this.physicalKeyHeldForOneShot.delete(code);
    this.clearSyntheticHoldWatchdog(code);
    this.resetPhaserKeyForCode(code);
  }

  public resetAllInputState(): void {
    // V1.5: Giải phóng cưỡng bức trạng thái khóa hành động nếu không tử vong, chống đơ nhân vật
    if (!this._isDead) {
      this.forceUnlockActionState();
    }
    this.desiredDirection = null;
    this.directionBufferStartTime = 0;
    this._wasMoving = false;

    this.isPhysicalShiftHeld = false;
    this.activePhysicalCodes.clear();
    this.lastKeyActivityTime.clear();
    this.physicalKeyHeldForOneShot.clear();
    this.pendingOneShotActions.clear();
    this.keyDownTimestamps.clear();
    this.clearAllSyntheticHoldTimers();
    this.eKeyJustPressed = false;
    this.hasRecentIMEEvent = false;

    this.keyW?.reset();
    this.keyA?.reset();
    this.keyS?.reset();
    this.keyD?.reset();
    this.keyShift?.reset();
    this.keyE?.reset();
    this.keyF?.reset();
    this.keySpace?.reset();
    this.cursors?.up?.reset();
    this.cursors?.down?.reset();
    this.cursors?.left?.reset();
    this.cursors?.right?.reset();
    this.cursors?.shift?.reset();

    if (this.scene && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.resetKeys();
    }

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (body && typeof body.setVelocity === 'function') {
      body.setVelocity(0, 0);
    }
  }

  private handleDOMCompositionStart(event: CompositionEvent): void {
    if (this.isEditableTextContext(event.target)) {
      this.isComposingInTextInput = true;
      this.setPhaserKeyboardsEnabled(false);
      this.resetAllInputState();
    }
  }

  private handleDOMCompositionEnd(event: CompositionEvent): void {
    this.isComposingInTextInput = false;
    if (this.isEditableTextContext(event.target)) {
      this.resetAllInputState();
      return;
    }
    this.setPhaserKeyboardsEnabled(true);
    this.physicalKeyHeldForOneShot.clear();
  }

  private handleDOMKeyDown(event: KeyboardEvent): void {
    if (this.isEditableTextContext(event.target) || this.isComposingInTextInput) {
      this.isTextInputFocused = true;
      this.setPhaserKeyboardsEnabled(false);
      this.resetAllInputState();
      return;
    }

    if (this.isTextInputFocused) {
      this.isTextInputFocused = false;
      this.setPhaserKeyboardsEnabled(true);
    }

    // C4-135-01: Đồng bộ trạng thái phím Shift từ native OS / browser modifier state
    if (typeof event.getModifierState === 'function') {
      this.isPhysicalShiftHeld = event.getModifierState('Shift');
    } else if (typeof event.shiftKey === 'boolean') {
      this.isPhysicalShiftHeld = event.shiftKey;
    }

    const code = SatyrPlayer.resolvePhysicalCode(event);
    if (!code) return;

    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      this.isPhysicalShiftHeld = true;
    }

    // Chặn hành vi mặc định của trình duyệt cho các phím điều khiển game khi đang chơi
    // (ngăn cuộn trang Space/Arrows, ngăn nhảy tab khỏi canvas, và ngăn hệ điều hành đệm gõ văn bản/IME)
    if (SatyrPlayer.isGameControlCode(code)) {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    }

    const isSyntheticOrIME =
      !event.code ||
      event.keyCode === 231 ||
      event.keyCode === 229 ||
      event.key === 'Process' ||
      event.isComposing === true;

    if (isSyntheticOrIME) {
      this.hasRecentIMEEvent = true;
    }

    if (this.isMovementOrSprintCode(code)) {
      this.lastKeyActivityTime.set(code, performance.now());
      if (!this.activePhysicalCodes.has(code)) {
        this.keyDownTimestamps.set(code, performance.now());
      }
      this.activePhysicalCodes.add(code);

      // C4-135-01: Nếu người chơi đang giữ Shift trong khi gõ các phím di chuyển, duy trì trạng thái Shift
      if (this.isPhysicalShiftHeld) {
        this.activePhysicalCodes.add('ShiftLeft');
        this.lastKeyActivityTime.set('ShiftLeft', performance.now());
      }

      // C4-135-01: Tuyệt đối không lập lịch giải phóng tự động (synthetic watchdog) cho phím Shift
      if (isSyntheticOrIME && code !== 'ShiftLeft' && code !== 'ShiftRight') {
        this.armSyntheticHoldWatchdog(code, 450);
      }
      return;
    }

    // Các hành động 1 lần (One-shot) — Chống lặp khi giữ phím (event.repeat)
    if (event.repeat || this.physicalKeyHeldForOneShot.has(code)) {
      return;
    }

    this.physicalKeyHeldForOneShot.add(code);
    if (code === 'KeyE') {
      this.pendingOneShotActions.add('interact');
    } else if (code === 'KeyF') {
      this.pendingOneShotActions.add('lantern');
    } else if (code === 'Space') {
      this.pendingOneShotActions.add('attack');
    } else if (code === 'KeyQ') {
      this.pendingOneShotActions.add('throw_lure');
    } else if (code === 'KeyI' || code === 'Tab' || code === 'KeyC') {
      this.pendingOneShotActions.add('craft');
    } else if (code === 'KeyJ') {
      this.pendingOneShotActions.add('journal');
    } else if (code === 'Escape') {
      this.pendingOneShotActions.add('pause');
    } else if (code === 'Digit1') {
      this.pendingOneShotActions.add('poultice');
    } else if (code === 'Digit2') {
      this.pendingOneShotActions.add('oil');
    } else if (code === 'KeyM') {
      this.pendingOneShotActions.add('mute');
    }

    if (isSyntheticOrIME && typeof window !== 'undefined') {
      window.setTimeout(() => {
        this.physicalKeyHeldForOneShot.delete(code);
      }, 180);
    }
  }

  private handleDOMKeyUp(event: KeyboardEvent): void {
    if (this.isEditableTextContext(event.target) || this.isComposingInTextInput) {
      this.resetAllInputState();
      return;
    }

    // C4-135-01: Đồng bộ trạng thái phím Shift từ native OS / browser modifier state
    if (typeof event.getModifierState === 'function') {
      this.isPhysicalShiftHeld = event.getModifierState('Shift');
    } else if (typeof event.shiftKey === 'boolean') {
      this.isPhysicalShiftHeld = event.shiftKey;
    }

    const code = SatyrPlayer.resolvePhysicalCode(event);
    if (!code) return;

    // Chặn hành vi mặc định của trình duyệt cho các phím điều khiển game khi đang chơi
    // (ngăn cuộn trang Space/Arrows, ngăn nhảy tab khỏi canvas, và ngăn hệ điều hành đệm gõ văn bản/IME)
    if (SatyrPlayer.isGameControlCode(code)) {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    }

    const isSyntheticVKPacketKeyUp =
      !event.code && (event.keyCode === 231 || event.keyCode === 229 || event.keyCode === 0);

    if (isSyntheticVKPacketKeyUp && this.isMovementOrSprintCode(code)) {
      // Gói VK_PACKET của UniKey/EVKey tự phát keyup ảo ngay sau keydown khi ngón tay vẫn giữ phím;
      // giữ trạng thái di chuyển cho đến khi có hardware keyup thực sự (event.code='KeyW', keyCode=87) hoặc hết watchdog 550ms.
      return;
    }

    // C4-135-01: Nếu OS xác nhận phím Shift vẫn đang được giữ vật lý, không giải phóng Shift
    if ((code === 'ShiftLeft' || code === 'ShiftRight') && this.isPhysicalShiftHeld) {
      return;
    }

    this.releasePhysicalCode(code);
    if (code === 'ShiftLeft' || code === 'ShiftRight') {
      this.isPhysicalShiftHeld = false;
    }
  }

  public consumeAction(action: OneShotAction): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction(action);
  }

  private consumeOneShotAction(action: OneShotAction): boolean {
    if (this._isDead) {
      this.pendingOneShotActions.clear();
      return false;
    }
    if (this.pendingOneShotActions.has(action)) {
      this.pendingOneShotActions.delete(action);
      return true;
    }
    return false;
  }

  public isLureRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('throw_lure');
  }

  public isCraftingRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('craft');
  }

  public isJournalRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('journal');
  }

  public isPauseRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('pause');
  }

  public isPoulticeRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('poultice');
  }

  public isOilRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('oil');
  }

  public isMuteRequested(): boolean {
    if (this._isDead) return false;
    return this.consumeOneShotAction('mute');
  }

  public isPhysicalCodeDown(code: string): boolean {
    return this.activePhysicalCodes.has(code);
  }

  public update(time: number, delta: number): void {
    super.update(time, delta);

    if (this._isDead) {
      this.setVelocity(0, 0);
      return;
    }

    // V1.5 (BƯỚC V15-02): BỘ ĐẾM BẢO HIỂM TỰ GIẢI PHÓNG HÀNH ĐỘNG (SAFETY WATCHDOG TIMEOUT 600ms)
    // Nếu nhân vật bị kẹt ở bất kỳ trạng thái khóa hành động nào (tấn công, nhặt đồ [E], dùng vật phẩm, trúng đòn)
    // vượt quá 600ms mà animation không tự hoàn tất (do frame drop, timer trôi, đóng hộp thoại hoặc chuyển cảnh),
    // tự động cưỡng bức giải phóng trạng thái khóa để người chơi không bao giờ bị đơ phím hay đứng im.
    if (this.isActionLocked() && !this._isDead) {
      const now = performance.now();
      if (this._actionLockTimestamp > 0 && now - this._actionLockTimestamp > SatyrPlayer.ACTION_SAFETY_TIMEOUT_MS) {
        this.forceUnlockActionState();
        this.playIdleAnim();
      }
    }

    // C4-13-01: Ưu tiên xử lý phím tương tác [E] trước các lệnh khóa di chuyển/ẩn nấp
    const phaserE = this.keyE ? Phaser.Input.Keyboard.JustDown(this.keyE) : false;
    const physicalE = this.consumeOneShotAction('interact');
    this.eKeyJustPressed = phaserE || physicalE;

    // Khi đang ẩn nấp: triệt tiêu vận tốc di chuyển vật lý nhưng bảo toàn khả năng nhận diện phím [E] và phím di chuyển
    if (this.stats.isHiding) {
      this.setVelocity(0, 0);
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      }
      return;
    }

    // Không kích hoạt điều khiển nhân vật khi đang gõ văn bản hoặc đang ghép chữ trong ô nhập liệu
    if (this.isTextInputFocused || this.isComposingInTextInput || this.isEditableTextContext()) {
      this.setVelocity(0, 0);
      this.playIdleAnim();
      return;
    }

    // Xử lý bật/tắt đèn lồng [F] (tiêu thụ đồng thời cả Phaser KeyF và Physical KeyF để tránh bật/tắt kép)
    const phaserF = this.keyF ? Phaser.Input.Keyboard.JustDown(this.keyF) : false;
    const physicalF = this.consumeOneShotAction('lantern');
    if (phaserF || physicalF) {
      this.toggleLantern();
    }

    // Xử lý tấn công cận chiến bằng [SPACE] (tách biệt hoàn toàn khỏi phím [J] Sổ Tay)
    const phaserSpace = this.keySpace ? Phaser.Input.Keyboard.JustDown(this.keySpace) : false;
    const physicalSpace = this.consumeOneShotAction('attack');
    if (!this.isActionLocked() && (phaserSpace || physicalSpace)) {
      this.attack();
    }

    // C4-132-01: Chống kẹt trôi phím khi bật gõ Tiếng Việt Telex/VNI hoặc mất focus
    const nowPerf = performance.now();
    for (const code of Array.from(this.activePhysicalCodes)) {
      if (!this.isMovementOrSprintCode(code)) continue;

      const lastTime = this.lastKeyActivityTime.get(code) ?? 0;
      const timeSinceLastActivity = nowPerf - lastTime;

      let phaserKeyIsDown = false;
      switch (code) {
        case 'KeyW': phaserKeyIsDown = Boolean(this.keyW && this.keyW.isDown); break;
        case 'KeyA': phaserKeyIsDown = Boolean(this.keyA && this.keyA.isDown); break;
        case 'KeyS': phaserKeyIsDown = Boolean(this.keyS && this.keyS.isDown); break;
        case 'KeyD': phaserKeyIsDown = Boolean(this.keyD && this.keyD.isDown); break;
        case 'ArrowUp': phaserKeyIsDown = Boolean(this.cursors?.up && this.cursors.up.isDown); break;
        case 'ArrowDown': phaserKeyIsDown = Boolean(this.cursors?.down && this.cursors.down.isDown); break;
        case 'ArrowLeft': phaserKeyIsDown = Boolean(this.cursors?.left && this.cursors.left.isDown); break;
        case 'ArrowRight': phaserKeyIsDown = Boolean(this.cursors?.right && this.cursors.right.isDown); break;
        case 'ShiftLeft':
        case 'ShiftRight':
          phaserKeyIsDown = Boolean(
            (this.keyShift && this.keyShift.isDown) ||
            (this.cursors?.shift && this.cursors.shift.isDown)
          );
          break;
      }

      // Xử lý riêng Shift: trong Windows phím Shift không phát sinh sự kiện keydown lặp lại (auto-repeat).
      // Shift được giải phóng chuẩn xác thông qua DOM keyup hoặc khi cả 2 hệ thống đều xác nhận nhả phím.
      // Tách biệt cơ chế giám sát phím Shift (do Windows không auto-repeat Shift khi giữ)
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        const isShiftHeld =
          this.isPhysicalShiftHeld ||
          phaserKeyIsDown ||
          Boolean(this.keyShift && this.keyShift.isDown) ||
          Boolean(this.cursors && this.cursors.shift && this.cursors.shift.isDown);

        if (isShiftHeld) {
          this.lastKeyActivityTime.set(code, nowPerf);
          continue;
        }

        // Chỉ giải phóng khi cả OS modifier, Phaser và DOM keyup đều xác nhận Shift đã thực sự nhả
        this.releasePhysicalCode(code);
        continue;
      }

      // Đối với các phím di chuyển WASD / Mũi tên:
      // Tuyệt đối KHÔNG xóa mã phím chỉ vì phaserKeyIsDown == false khi người chơi đang giữ phím,
      // bởi vì bộ gõ Tiếng Việt (EVKey / UniKey) gửi sự kiện với keyCode=229 (VK_PROCESSKEY) khiến phaserKeyIsDown luôn là false.
      // Chỉ giải phóng khi:
      // 1. Phím Phaser không down VÀ không nhận được sự kiện lặp lại (auto-repeat) DOM nào trong hơn 650ms.
      // 2. Hoặc phát hiện sự kiện IME và đã quá 650ms không có tín hiệu mới.
      const isPhaserDown = phaserKeyIsDown;
      const isDOMActive = timeSinceLastActivity <= 650;
      if (!isPhaserDown && !isDOMActive) {
        this.releasePhysicalCode(code);
      } else if (this.hasRecentIMEEvent && timeSinceLastActivity > 650) {
        this.releasePhysicalCode(code);
      }
    }

    // Xử lý di chuyển nếu không đang bị khóa hành động
    if (!this.isActionLocked()) {
      this.handleMovement();
    } else {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // C4-14-11 Display Guardrail: Bảo đảm nhân vật chính luôn hiển thị đầy đủ Sprite (visible = true, alpha = 1)
    // khi không ẩn nấp và không chết, chống tàng hình hoặc mờ đục ngoài ý muốn khi chuyển phân khu
    if (!this.stats.isHiding && !this._isDead) {
      if (!this.visible) {
        this.setVisible(true);
      }
      if (!this._isHurt && this.alpha < 1) {
        this.setAlpha(1);
      }
    }

    // Cập nhật độ sâu đồ họa theo trục trời (Y-sorting) chỉ khi thay đổi integer Y
    const targetDepth = Math.floor(this.y);
    if (this.depth !== targetDepth) {
      this.setDepth(targetDepth);
    }

    // Cập nhật lớp hiển thị đèn lồng hổ phách theo tư thế và nhịp chuyển động (C4-12-07)
    this.updateLanternVisual();

    // C4-13-06: Cập nhật vị trí và hiển thị của bóng đổ mặt đất theo tọa độ chân Satyr
    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y);
      this.footShadowGfx.setDepth(this.depth - 1);
      this.footShadowGfx.setVisible(this.visible && !this.stats.isHiding && !this._isDead);
    }
  }

  private handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    // Kiểm tra đầu vào từ Physical KeyboardEvent.code (tương thích UniKey/EVKey Telex & VNI) hoặc Phaser Key
    const left =
      this.isPhysicalCodeDown('KeyA') ||
      this.isPhysicalCodeDown('ArrowLeft') ||
      Boolean(this.keyA && this.keyA.isDown) ||
      Boolean(this.cursors && this.cursors.left && this.cursors.left.isDown);
    const right =
      this.isPhysicalCodeDown('KeyD') ||
      this.isPhysicalCodeDown('ArrowRight') ||
      Boolean(this.keyD && this.keyD.isDown) ||
      Boolean(this.cursors && this.cursors.right && this.cursors.right.isDown);
    const up =
      this.isPhysicalCodeDown('KeyW') ||
      this.isPhysicalCodeDown('ArrowUp') ||
      Boolean(this.keyW && this.keyW.isDown) ||
      Boolean(this.cursors && this.cursors.up && this.cursors.up.isDown);
    const down =
      this.isPhysicalCodeDown('KeyS') ||
      this.isPhysicalCodeDown('ArrowDown') ||
      Boolean(this.keyS && this.keyS.isDown) ||
      Boolean(this.cursors && this.cursors.down && this.cursors.down.isDown);

    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (up) moveY -= 1;
    if (down) moveY += 1;

    // C4-13-18 & C4-132-01 & C4-135-01: Quản lý thể lực chạy nhanh & chu trình Kiệt Sức (Exhaustion) chuẩn hóa
    const shiftDown =
      this.isPhysicalShiftHeld ||
      this.isPhysicalCodeDown('ShiftLeft') ||
      this.isPhysicalCodeDown('ShiftRight') ||
      Boolean(this.keyShift && this.keyShift.isDown) ||
      Boolean(this.cursors && this.cursors.shift && this.cursors.shift.isDown);
    const isMoving = moveX !== 0 || moveY !== 0;
    const wantsToSprint = shiftDown && isMoving;

    if (this.stats.stamina <= 0) {
      if (!this._isStaminaExhausted) {
        this._isStaminaExhausted = true;
        const now = Date.now();
        if (now - this.lastExhaustPopupTime >= 4000) {
          this.lastExhaustPopupTime = now;
          const uiScene = this.scene.scene.get('UIScene') as any;
          if (uiScene && typeof uiScene.showPopupMessage === 'function') {
            uiScene.showPopupMessage('Kiệt sức! Cần nghỉ lấy hơi...');
          }
        }
      }
    } else if (this._isStaminaExhausted && this.stats.stamina >= 25) {
      // C4-132-01 & C4-135-01: Khi thể lực hồi phục đủ (>= 30/100), tự động mở khóa kiệt sức để người chơi duy trì giữ Shift chạy tiếp
      if (this.stats.stamina >= 30) {
        this._isStaminaExhausted = false;
      }
    }

    const canSprint = wantsToSprint && !this._isStaminaExhausted && this.stats.stamina > 0;
    this.stats.isSprinting = canSprint;

    const equipSys = EquipmentSystem.getInstance();
    const sprintSpeed = PLAYER_SPRINT_SPEED * equipSys.getSprintSpeedMultiplier();
    const baseSpeed = canSprint ? sprintSpeed : PLAYER_WALK_SPEED;

    // C4-13-18: Khi Bình Tâm cạn kiệt (0/100), nhân vật hoảng loạn: giảm 15% tốc độ di chuyển
    let speedMultiplier = 1.0;
    if (this.stats.composure <= 0) {
      speedMultiplier *= 0.85;
    }
    const currentSpeed = baseSpeed * speedMultiplier;

    // Chuẩn hóa vector di chuyển (tránh đi chéo chạy nhanh hơn và chống vọt lố vào vật cản)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (moveX !== 0 || moveY !== 0) {
      if (moveX !== 0 && moveY !== 0) {
        // V1.5: Đi chéo đồng thời 2 phím (W+D, S+A, v.v.):
        // Chuẩn hóa bằng hệ số chia căn bậc 2 (Math.SQRT1_2 = 1 / Math.SQRT2 ≈ 0.70710678)
        // để độ lớn vận tốc vector đi chéo bằng đúng tốc độ đi thẳng, triệt tiêu hiện tượng vọt lố vào vật cản
        body.setVelocity(moveX * Math.SQRT1_2 * currentSpeed, moveY * Math.SQRT1_2 * currentSpeed);
      } else {
        // Đi thẳng 1 hướng duy nhất:
        body.setVelocity(moveX * currentSpeed, moveY * currentSpeed);
      }

      // Cập nhật hướng nhìn với Direction Buffer 40ms và Direction Persistence
      this.updateFacingDirection(moveX, moveY);

      // Cập nhật hoạt ảnh di chuyển
      this.playWalkOrRunAnim();
    } else {
      body.setVelocity(0, 0);
      this.playIdleAnim();
    }
  }

  /**
   * Cập nhật hướng nhìn với NGUYÊN TẮC DUY TRÌ HƯỚNG NHÌN (Direction Persistence Rule)
   * kết hợp DIRECTION BUFFER 40ms: Triệt tiêu hoàn toàn lỗi giật hoạt ảnh khi nhấp nhả phím.
   */
  public updateFacingDirection(moveX: number, moveY: number): void {
    if (moveX === 0 && moveY === 0) {
      this._wasMoving = false;
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
      return;
    }

    const absX = Math.abs(moveX);
    const absY = Math.abs(moveY);

    let targetDir: FacingDirection;

    if (absX > absY) {
      // Chiều ngang chiếm ưu thế tuyệt đối
      targetDir = moveX < 0 ? 'left' : 'right';
    } else if (absY > absX) {
      // Chiều dọc chiếm ưu thế tuyệt đối
      targetDir = moveY < 0 ? 'up' : 'down';
    } else {
      // Đi chéo cân bằng (absX === absY > 0)
      // NGUYÊN TẮC DUY TRÌ HƯỚNG NHÌN:
      // Nếu hướng nhìn hiện tại đã thuộc về một trong hai trục đang di chuyển,
      // GIỮ NGUYÊN hướng nhìn đó để tránh rung lắc hướng và reset animation.
      const isCurrentFacingMoving =
        (this.facing === 'left' && moveX < 0) ||
        (this.facing === 'right' && moveX > 0) ||
        (this.facing === 'up' && moveY < 0) ||
        (this.facing === 'down' && moveY > 0);

      if (isCurrentFacingMoving) {
        targetDir = this.facing;
      } else {
        // Nếu hướng hiện tại không thuộc vector di chuyển, ưu tiên trục ngang làm mặc định ổn định
        targetDir = moveX < 0 ? 'left' : 'right';
      }
    }

    // V1.5 (BƯỚC V15-02): ĐỒNG BỘ MƯỢT HOẠT ẢNH 4 HƯỚNG VỚI DIRECTION BUFFER 40ms
    // 1. Khi nhân vật vừa từ trạng thái đứng yên bắt đầu di chuyển: cập nhật hướng ngay lập tức (không có độ trễ)
    if (!this._wasMoving) {
      this._wasMoving = true;
      this.facing = targetDir;
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
    } else if (targetDir !== this.facing) {
      // 2. Đang di chuyển và người chơi đổi hướng hoặc nhấp nhả phím:
      const now = performance.now();
      if (this.desiredDirection !== targetDir) {
        this.desiredDirection = targetDir;
        this.directionBufferStartTime = now;
      } else if (now - this.directionBufferStartTime >= SatyrPlayer.DIRECTION_BUFFER_MS) {
        // Đã giữ phím hướng mới vượt qua ngưỡng đệm 40ms: cam kết chuyển hướng mượt mà
        this.facing = targetDir;
        this.desiredDirection = null;
        this.directionBufferStartTime = 0;
      }
    } else {
      // 3. Đang đi cùng hướng: giải phóng bộ đệm
      this.desiredDirection = null;
      this.directionBufferStartTime = 0;
    }

    // Với The Mossbound Wayfarer (đã có đủ 4 hàng Down/Up/Left/Right), không lật gương flipX.
    // Với sheet Satyr cũ 50-frame (640×320 chỉ có hướng phải), lật ngang khi sang trái.
    const isWayfarer = (this.texture && this.texture.key.startsWith('wayfarer_')) || 
                       (this.anims.currentAnim && this.anims.currentAnim.key.startsWith('wayfarer_'));
    if (isWayfarer) {
      this.setFlipX(false);
    } else {
      const realFrameCount = this.texture && this.texture.frameTotal > 1 ? this.texture.frameTotal - 1 : 50;
      if (realFrameCount <= 50) {
        if (moveX < 0 || this.facing === 'left') {
          this.setFlipX(true);
        } else if (moveX > 0 || this.facing === 'right') {
          this.setFlipX(false);
        }
      } else {
        this.setFlipX(false);
      }
    }
  }

  /**
   * C4-12-20: Thiết lập hướng nhìn nhân vật và kích hoạt hoạt ảnh nghỉ (idle) tương ứng.
   */
  public setFacing(direction: FacingDirection): void {
    this.facing = direction;
    const isWayfarer = (this.texture && this.texture.key.startsWith('wayfarer_')) || 
                       (this.anims.currentAnim && this.anims.currentAnim.key.startsWith('wayfarer_'));
    if (isWayfarer) {
      this.setFlipX(false);
    } else {
      if (direction === 'left') {
        this.setFlipX(true);
      } else if (direction === 'right') {
        this.setFlipX(false);
      }
    }
    this.playIdleAnim();
  }

  private safePlayAnim(key: string, ignoreIfPlaying: boolean = true): boolean {
    const anim = this.scene.anims.get(key);
    if (!anim || !anim.frames || anim.frames.length === 0) {
      // V14-P8-11: Nếu animation đích không tồn tại hoặc rỗng, bảo đảm sprite luôn có frame hoạt ảnh hiển thị
      const fallbackIdle = this.scene.anims.exists('wayfarer_idle_down')
        ? 'wayfarer_idle_down'
        : (this.scene.anims.exists('satyr_idle_down') ? 'satyr_idle_down' : null);
      if (fallbackIdle && key !== fallbackIdle) {
        this.play(fallbackIdle, true);
      }
      return false;
    }
    this.play(key, ignoreIfPlaying);
    return true;
  }

  /**
   * Phát hoạt ảnh Walk hoặc Run theo 4 hướng.
   * Ưu tiên khóa wayfarer_* và tương thích với satyr_*.
   * Nếu đang cùng hướng di chuyển và chỉ đổi tốc độ Walk <-> Run,
   * bảo tồn tiến trình frame hiện tại để không bị ngắt quãng giật cục về frame 0.
   */
  private playWalkOrRunAnim(): void {
    if (this.isActionLocked()) return;

    const isRunning = this.stats.isSprinting;
    const action = isRunning ? 'run' : 'walk';
    const wayfarerKey = `wayfarer_${action}_${this.facing}`;
    const satyrKey = `satyr_${action}_${this.facing}`;
    const targetKey = this.scene.anims.exists(wayfarerKey) ? wayfarerKey : satyrKey;

    const currentAnimKey = this.anims.currentAnim?.key;
    if (currentAnimKey === targetKey && this.anims.isPlaying) {
      return;
    }

    const targetAnim = this.scene.anims.get(targetKey);
    if (!targetAnim || !targetAnim.frames || targetAnim.frames.length === 0) {
      const fallbackKey = isRunning
        ? (this.scene.anims.exists('wayfarer_run_down') ? 'wayfarer_run_down' : 'satyr_run_down')
        : (this.scene.anims.exists('wayfarer_walk_down') ? 'wayfarer_walk_down' : 'satyr_walk_down');
      this.safePlayAnim(fallbackKey, true);
      return;
    }

    const isSameDirection = currentAnimKey?.endsWith(this.facing);
    const isWalkRunSwitch =
      (currentAnimKey?.includes('_walk_') && isRunning) ||
      (currentAnimKey?.includes('_run_') && !isRunning);

    if (isSameDirection && isWalkRunSwitch && this.anims.currentFrame) {
      const currentFrameIndex = Math.max(0, this.anims.currentFrame.index - 1);
      this.play(targetKey);
      const frameIdx = currentFrameIndex % targetAnim.frames.length;
      this.anims.setCurrentFrame(targetAnim.frames[frameIdx]);
    } else {
      this.play(targetKey, true);
    }
  }

  public playIdle(): void {
    this.playIdleAnim();
  }

  private playIdleAnim(): void {
    if (this.isActionLocked()) return;

    const wayfarerKey = `wayfarer_idle_${this.facing}`;
    const satyrKey = `satyr_idle_${this.facing}`;
    const targetKey = this.scene.anims.exists(wayfarerKey) ? wayfarerKey : satyrKey;

    if (this.anims.currentAnim?.key === targetKey && this.anims.isPlaying) {
      return;
    }

    if (!this.safePlayAnim(targetKey, true)) {
      const fallbackKey = this.scene.anims.exists('wayfarer_idle_down') ? 'wayfarer_idle_down' : 'satyr_idle_down';
      this.safePlayAnim(fallbackKey, true);
    }
  }

  // =========================================================================
  // CÁC HÀNH ĐỘNG CHIẾN ĐẤU & PHẢN ỨNG SÁT THƯƠNG (ATTACK, HURT, DEATH)
  // =========================================================================

  public isAttacking(): boolean {
    return this._isAttacking;
  }

  public isHurt(): boolean {
    return this._isHurt;
  }

  public isDead(): boolean {
    return this._isDead;
  }

  public isGathering(): boolean {
    return this._isGathering;
  }

  public isInteracting(): boolean {
    return this._isInteracting;
  }

  public isUsingItem(): boolean {
    return this._isUsingItem;
  }

  /**
   * V1.5 (BƯỚC V15-03): THUẬT TOÁN TRƯỢT GÓC (CORNER ASSIST / EDGE SLIDING)
   * Khi nhân vật đi thẳng hoặc đi chéo chạm nhẹ vào rìa góc của hộp va chạm tĩnh (sai số lệch tâm dưới 10px),
   * tự động đẩy nhẹ nhân vật trượt vòng qua góc vật cản thay vì kẹt đứng im tại chỗ.
   */
  public applyCornerAssistWith(obstacle: Phaser.Physics.Arcade.Sprite): void {
    if (!obstacle || !obstacle.body || !this.body || this._isDead) return;

    const pBody = this.body as Phaser.Physics.Arcade.Body;
    const oBody = obstacle.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;

    const CORNER_THRESHOLD = 10; // Ngưỡng lệch tâm tối đa 10px để kích hoạt trượt góc
    const SLIDE_NUDGE = 2.0;     // Tốc độ lướt trượt qua góc (px mỗi khung hình)

    const pLeft = pBody.x;
    const pRight = pBody.right;
    const pTop = pBody.y;
    const pBottom = pBody.bottom;

    const oLeft = oBody.x;
    const oRight = oBody.right;
    const oTop = oBody.y;
    const oBottom = oBody.bottom;

    let nudgeX = 0;
    let nudgeY = 0;

    // 1. Trượt góc khi bị chặn hướng LÊN (Blocked UP): Chạm đáy vật cản
    if (pBody.blocked.up || Math.abs(pTop - oBottom) <= 3) {
      const overlapLeft = oRight - pLeft;   // Mép phải vật cản quẹt vào mép trái nhân vật
      const overlapRight = pRight - oLeft;  // Mép trái vật cản quẹt vào mép phải nhân vật

      if (overlapLeft > 0 && overlapLeft <= CORNER_THRESHOLD) {
        // Chỉ quẹt nhẹ mép trái: Lướt sang PHẢI để vòng qua góc
        nudgeX = Math.min(overlapLeft, SLIDE_NUDGE);
      } else if (overlapRight > 0 && overlapRight <= CORNER_THRESHOLD) {
        // Chỉ quẹt nhẹ mép phải: Lướt sang TRÁI để vòng qua góc
        nudgeX = -Math.min(overlapRight, SLIDE_NUDGE);
      }
    }

    // 2. Trượt góc khi bị chặn hướng XUỐNG (Blocked DOWN): Chạm đỉnh vật cản
    if (pBody.blocked.down || Math.abs(pBottom - oTop) <= 3) {
      const overlapLeft = oRight - pLeft;
      const overlapRight = pRight - oLeft;

      if (overlapLeft > 0 && overlapLeft <= CORNER_THRESHOLD) {
        nudgeX = Math.min(overlapLeft, SLIDE_NUDGE);
      } else if (overlapRight > 0 && overlapRight <= CORNER_THRESHOLD) {
        nudgeX = -Math.min(overlapRight, SLIDE_NUDGE);
      }
    }

    // 3. Trượt góc khi bị chặn hướng TRÁI (Blocked LEFT): Chạm sườn phải vật cản
    if (pBody.blocked.left || Math.abs(pLeft - oRight) <= 3) {
      const overlapTop = oBottom - pTop;    // Mép đáy vật cản quẹt vào mép trên nhân vật
      const overlapBottom = pBottom - oTop; // Mép đỉnh vật cản quẹt vào mép dưới nhân vật

      if (overlapTop > 0 && overlapTop <= CORNER_THRESHOLD) {
        // Chỉ quẹt nhẹ mép trên: Lướt XUỐNG để vòng qua góc
        nudgeY = Math.min(overlapTop, SLIDE_NUDGE);
      } else if (overlapBottom > 0 && overlapBottom <= CORNER_THRESHOLD) {
        // Chỉ quẹt nhẹ mép dưới: Lướt LÊN để vòng qua góc
        nudgeY = -Math.min(overlapBottom, SLIDE_NUDGE);
      }
    }

    // 4. Trượt góc khi bị chặn hướng PHẢI (Blocked RIGHT): Chạm sườn trái vật cản
    if (pBody.blocked.right || Math.abs(pRight - oLeft) <= 3) {
      const overlapTop = oBottom - pTop;
      const overlapBottom = pBottom - oTop;

      if (overlapTop > 0 && overlapTop <= CORNER_THRESHOLD) {
        nudgeY = Math.min(overlapTop, SLIDE_NUDGE);
      } else if (overlapBottom > 0 && overlapBottom <= CORNER_THRESHOLD) {
        nudgeY = -Math.min(overlapBottom, SLIDE_NUDGE);
      }
    }

    // Áp dụng trượt mượt mà
    if (nudgeX !== 0) {
      this.x += nudgeX;
      pBody.x += nudgeX;
    }
    if (nudgeY !== 0) {
      this.y += nudgeY;
      pBody.y += nudgeY;
    }
  }

  /**
   * V1.5 (BƯỚC V15-02): Giải phóng cưỡng bức toàn bộ trạng thái khóa hành động.
   * Đảm bảo sau khi tấn công, thu thập [E], bật tắt đèn [F] hoặc đóng hộp thoại,
   * nhân vật không bao giờ bị đơ phím hay đứng im vô thời hạn.
   */
  public forceUnlockActionState(): void {
    if (this._isDead) return;
    this._isAttacking = false;
    this._isHurt = false;
    this._isGathering = false;
    this._isInteracting = false;
    this._isUsingItem = false;
    this._actionLockTimestamp = 0;
    this.clearTint();
  }

  public isActionLocked(): boolean {
    return this._isAttacking || this._isHurt || this._isDead || this._isGathering || this._isInteracting || this._isUsingItem;
  }

  public attack(): boolean {
    if (this.isActionLocked()) return false;

    const equipSys = EquipmentSystem.getInstance();
    const weaponDef = equipSys.getActiveWeaponDef();

    // V1.4 - P8-03: Kiểm tra hồi chiêu vũ khí (Attack Cooldown)
    const now = Date.now();
    if (now - this._lastAttackTime < weaponDef.attackCooldown) {
      return false;
    }

    // V1.4: Kiểm tra và tiêu hao Thể Lực (Stamina) hợp lý theo từng loại vũ khí
    if (this.stats.stamina < weaponDef.staminaCost) {
      return false;
    }
    this.stats.stamina = Math.max(0, this.stats.stamina - weaponDef.staminaCost);
    this._lastAttackTime = now;

    this._isAttacking = true;
    this._actionLockTimestamp = performance.now();
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    // C4-13-08: Phát âm thanh vung gậy tấn công cận chiến
    AudioManager.getInstance().playAttackSwing();

    // V1.4 - P8-03: Tính toán vùng quét va chạm 4 hướng chuẩn xác theo reach của từng vũ khí
    let hitX = this.x;
    let hitY = this.y;
    const reach = weaponDef.reach || 42;
    switch (this.facing) {
      case 'left': hitX -= reach; break;
      case 'right': hitX += reach; break;
      case 'up': hitY -= reach; break;
      case 'down': hitY += reach; break;
    }

    // Phát sự kiện để GameScene xử lý âm thanh cảnh báo và quét va chạm thực thể
    this.emit('player_attack', {
      x: hitX,
      y: hitY,
      radius: weaponDef.radius || 42,
      reach,
      facing: this.facing,
      playerX: this.x,
      playerY: this.y,
      weapon: weaponDef
    });

    const wayfarerKey = `wayfarer_attack_${this.facing}`;
    const satyrKey = `satyr_attack_${this.facing}`;
    const keyToPlay = this.scene.anims.exists(wayfarerKey)
      ? wayfarerKey
      : this.scene.anims.exists(satyrKey)
      ? satyrKey
      : (this.scene.anims.exists('wayfarer_attack') ? 'wayfarer_attack' : 'satyr_attack');
    this.safePlayAnim(keyToPlay, true);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isAttacking = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (550ms: 6 frames @ 12fps = 500ms)
    this.scene.time.delayedCall(550, () => {
      if (this._isAttacking) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isAttacking = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    });

    return true;
  }

  public playHurt(knockbackVx?: number, knockbackVy?: number): boolean {
    if (this._isDead) return false;

    this._isHurt = true;
    this._actionLockTimestamp = performance.now();
    this._isAttacking = false;
    this._isGathering = false;
    this._isInteracting = false;
    this._isUsingItem = false;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (knockbackVx !== undefined && knockbackVy !== undefined) {
      body.setVelocity(knockbackVx, knockbackVy);
    } else {
      body.setVelocity(0, 0);
    }

    // Hiệu ứng màu đỏ khi trúng đòn
    this.setTint(0xff6666);

    const wayfarerKey = `wayfarer_hurt_${this.facing}`;
    const satyrKey = `satyr_hurt_${this.facing}`;
    const keyToPlay = this.scene.anims.exists(wayfarerKey)
      ? wayfarerKey
      : this.scene.anims.exists(satyrKey)
      ? satyrKey
      : (this.scene.anims.exists('wayfarer_hurt') ? 'wayfarer_hurt' : 'satyr_hurt');
    this.safePlayAnim(keyToPlay, true);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this.clearTint();
        this._isHurt = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (450ms: 3 frames @ 8fps = 375ms)
    this.scene.time.delayedCall(450, () => {
      if (this._isHurt) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this.clearTint();
        this._isHurt = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    });

    return true;
  }

  public die(): void {
    if (this._isDead) return;

    this._isDead = true;
    this._isAttacking = false;
    this._isHurt = false;
    this._isGathering = false;
    this._isInteracting = false;
    this._isUsingItem = false;
    this.stats.isSprinting = false;

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
    this.clearTint();
    this.resetAllInputState();

    const wayfarerKey = `wayfarer_death_${this.facing}`;
    const satyrKey = `satyr_death_${this.facing}`;
    const keyToPlay = this.scene.anims.exists(wayfarerKey)
      ? wayfarerKey
      : this.scene.anims.exists(satyrKey)
      ? satyrKey
      : (this.scene.anims.exists('wayfarer_death') ? 'wayfarer_death' : 'satyr_death');

    this.safePlayAnim(keyToPlay, true);

    // C4-13-03: Nhân vật nằm bất động trên mặt đất ở frame cuối cùng, không lặp lại và không trở về idle
    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this.anims.pause();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
  }

  /**
   * C4-13-03: Khôi phục trạng thái nhân vật sau khi nạp điểm lưu hoặc chơi lại.
   * Giải phóng cờ tử vong, mở khóa điều khiển, đưa về tọa độ chỉ định và phát idle.
   */
  public respawn(x: number, y: number): void {
    this._isDead = false;
    this._isAttacking = false;
    this._isHurt = false;
    this._isGathering = false;
    this._isInteracting = false;
    this._isUsingItem = false;
    this.stats.isHiding = false;
    this.stats.isSprinting = false;

    this.clearTint();
    this.setPosition(x, y);
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      if (body.reset) {
        body.reset(x, y);
      }
    }
    this.setVisible(true);
    this.setActive(true);
    this.lastSafePosition = { x, y };
    this.resetAllInputState();
    this.playIdle();
  }

  /**
   * Kích hoạt hoạt ảnh tương tác (nói chuyện với NPC, bàn chế tạo, kiểm tra cổng Đông).
   * Khóa di chuyển tạm thời ~500ms rồi tự động trở về Idle.
   */
  public playInteract(): boolean {
    if (this.isActionLocked()) return false;

    this._isInteracting = true;
    this._actionLockTimestamp = performance.now();
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const wayfarerKey = `wayfarer_interact_${this.facing}`;
    const satyrKey = `satyr_interact_${this.facing}`;
    const keyToPlay = this.scene.anims.exists(wayfarerKey)
      ? wayfarerKey
      : this.scene.anims.exists(satyrKey)
      ? satyrKey
      : (this.scene.anims.exists('wayfarer_interact') ? 'wayfarer_interact' : 'satyr_interact');

    if (!keyToPlay) {
      this._isInteracting = false;
      this._actionLockTimestamp = 0;
      return false;
    }

    this.safePlayAnim(keyToPlay, false);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isInteracting = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (550ms: 4 frames @ 8fps = 500ms)
    this.scene.time.delayedCall(550, () => {
      if (this._isInteracting) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isInteracting = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    });

    return true;
  }

  /**
   * Kích hoạt hoạt ảnh thu thập tài nguyên (cúi người nhặt gỗ khô, hái thảo mộc, lấy nhựa cây).
   * Khóa di chuyển tạm thời ~500ms rồi tự động trở về Idle.
   */
  public playGather(): boolean {
    if (this.isActionLocked()) return false;

    this._isGathering = true;
    this._actionLockTimestamp = performance.now();
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const wayfarerKey = `wayfarer_gather_${this.facing}`;
    const satyrKey = `satyr_gather_${this.facing}`;
    const keyToPlay = this.scene.anims.exists(wayfarerKey)
      ? wayfarerKey
      : this.scene.anims.exists(satyrKey)
      ? satyrKey
      : (this.scene.anims.exists('wayfarer_gather') ? 'wayfarer_gather' : 'satyr_gather');

    if (!keyToPlay) {
      this._isGathering = false;
      this._actionLockTimestamp = 0;
      return false;
    }

    this.safePlayAnim(keyToPlay, false);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isGathering = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (550ms: 4 frames @ 8fps = 500ms)
    this.scene.time.delayedCall(550, () => {
      if (this._isGathering) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isGathering = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    });

    return true;
  }

  /**
   * Kích hoạt hoạt ảnh dùng nhanh vật phẩm (uống/dùng thuốc đắp thảo mộc, rót bình dầu đèn).
   * Khóa di chuyển tạm thời ~500ms rồi tự động trở về Idle.
   */
  public playUseItem(): boolean {
    if (this.isActionLocked()) return false;

    this._isUsingItem = true;
    this._actionLockTimestamp = performance.now();
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    const wayfarerKey = `wayfarer_use_item_${this.facing}`;
    const satyrKey = `satyr_use_item_${this.facing}`;
    const keyToPlay = this.scene.anims.exists(wayfarerKey)
      ? wayfarerKey
      : this.scene.anims.exists(satyrKey)
      ? satyrKey
      : (this.scene.anims.exists('wayfarer_use_item') ? 'wayfarer_use_item' : 'satyr_use_item');

    if (!keyToPlay) {
      this._isUsingItem = false;
      this._actionLockTimestamp = 0;
      return false;
    }

    this.safePlayAnim(keyToPlay, false);

    const onAnimComplete = (anim: Phaser.Animations.Animation) => {
      if (anim.key === keyToPlay) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isUsingItem = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);

    // Fallback bảo vệ bằng Phaser delayedCall (550ms: 4 frames @ 8fps = 500ms)
    this.scene.time.delayedCall(550, () => {
      if (this._isUsingItem) {
        this.off(Phaser.Animations.Events.ANIMATION_COMPLETE, onAnimComplete);
        this._isUsingItem = false;
        this._actionLockTimestamp = 0;
        this.playIdleAnim();
      }
    });

    return true;
  }

  public toggleLantern(): void {
    const now = performance.now();
    if (now - this.lastLanternToggleTime < 180) {
      return; // Chống dội phím [F] (180ms debounce) ngăn ngừa giật lag và nhấp nháy ánh sáng
    }
    this.lastLanternToggleTime = now;

    // V1.5: Đảm bảo sau khi bật tắt đèn lồng [F], nếu có trạng thái khóa hành động nào bị kẹt, tự động giải phóng
    if (this.isActionLocked() && !this._isDead) {
      if (this._actionLockTimestamp > 0 && now - this._actionLockTimestamp > 300) {
        this.forceUnlockActionState();
        this.playIdleAnim();
      }
    }

    const state = PlayerState.getInstance();
    if (this.stats.lanternOil <= 0) {
      this.stats.isLanternOn = false;
      state.emit('stats_changed', this.stats);
      state.emit('lantern_empty');
      this.updateLanternVisual();
      return;
    }
    this.stats.isLanternOn = !this.stats.isLanternOn;
    state.emit('stats_changed', this.stats);
    this.updateLanternVisual();

    // C4-13-06: Cập nhật vị trí và hiển thị của bóng đổ mặt đất theo tọa độ chân Satyr
    if (this.footShadowGfx) {
      this.footShadowGfx.setPosition(this.x, this.y);
      this.footShadowGfx.setDepth(this.depth - 1);
      this.footShadowGfx.setVisible(this.visible && !this.stats.isHiding && !this._isDead);
    }
  }

  // Bảng tọa độ cung vung gậy chính xác theo từng frame của hoạt ảnh Attack (C4-13-04)
  private static readonly ATTACK_LANTERN_OFFSETS: Record<'down' | 'up' | 'left' | 'right', Array<{ x: number; y: number }>> = {
    down: [
      { x: -7, y: -17 }, // Frame 0: Giương gậy lấy đà
      { x: -8, y: -18 }, // Frame 1: Đỉnh cung vung
      { x: -1, y: -6 },  // Frame 2: Gậy bổ xuống phía trước
      { x: 2, y: -6 },   // Frame 3: Điểm chạm va đập
      { x: -5, y: -15 }, // Frame 4: Quán tính lùi
      { x: -5, y: -16 }  // Frame 5: Hồi thế ban đầu
    ],
    up: [
      { x: 18, y: -20 }, // Frame 0: Rút gậy sau lưng
      { x: 20, y: -17 }, // Frame 1: Giương cao
      { x: 0, y: -37 },  // Frame 2: Vung thẳng lên cao
      { x: -1, y: -36 }, // Frame 3: Điểm phóng lực
      { x: 13, y: -22 }, // Frame 4: Hạ gậy
      { x: 13, y: -20 }  // Frame 5: Hồi thế
    ],
    left: [
      { x: -6, y: -25 }, // Frame 0: Giương gậy chếch trên
      { x: -2, y: -27 }, // Frame 1: Cung vung cực đại
      { x: -22, y: -14 },// Frame 2: Chém quét ngang mạnh mẽ
      { x: -22, y: -18 },// Frame 3: Strike release
      { x: -17, y: -20 },// Frame 4: Thu gậy
      { x: -13, y: -20 } // Frame 5: Hồi thế
    ],
    right: [
      { x: 5, y: -25 },  // Frame 0: Giương gậy chếch trên
      { x: 1, y: -27 },  // Frame 1: Cung vung cực đại
      { x: 21, y: -14 }, // Frame 2: Chém quét ngang mạnh mẽ
      { x: 21, y: -17 }, // Frame 3: Strike release
      { x: 16, y: -20 }, // Frame 4: Thu gậy
      { x: 12, y: -20 }  // Frame 5: Hồi thế
    ]
  };

  /**
   * Tính toán vị trí thực tế của chiếc đèn lồng treo trên cây gậy gỗ trong tọa độ thế giới.
   * Đồng bộ 100% theo 4 hướng nhìn (DOWN, UP, LEFT, RIGHT) và chuẩn hóa từng frame hoạt ảnh (C4-13-04).
   * C4-12-29: Sử dụng cached object tái sử dụng để triệt tiêu 100% việc cấp phát rác trên heap mỗi frame.
   */
  public getLanternWorldPosition(): { x: number; y: number; isVisible: boolean } {
    if (!this.visible || this.stats.isHiding) {
      this.cachedLanternPos.x = this.x;
      this.cachedLanternPos.y = this.y - 20;
      this.cachedLanternPos.isVisible = false;
      return this.cachedLanternPos;
    }

    let offsetX = LANTERN_OFFSET_DOWN.x;
    let offsetY = LANTERN_OFFSET_DOWN.y;
    if (this.facing === 'up') {
      offsetX = LANTERN_OFFSET_UP.x;
      offsetY = LANTERN_OFFSET_UP.y;
    } else if (this.facing === 'left') {
      offsetX = LANTERN_OFFSET_LEFT.x;
      offsetY = LANTERN_OFFSET_LEFT.y;
    } else if (this.facing === 'right') {
      offsetX = LANTERN_OFFSET_RIGHT.x;
      offsetY = LANTERN_OFFSET_RIGHT.y;
    }

    let animBobX = 0;
    let animBobY = 0;
    const currentAnimKey = this.anims.currentAnim?.key ?? '';
    // Phaser AnimationFrame index là 1-based (1..N) nên trừ 1 để quy về 0-based
    const frameIdx = Math.max(0, (this.anims.currentFrame?.index ?? 1) - 1);

    if (currentAnimKey.includes('_attack_')) {
      // Hoạt ảnh vung gậy tấn công: theo dõi sát sao cung vung gậy gỗ 6 frame theo bảng tọa độ
      const attackFrames = SatyrPlayer.ATTACK_LANTERN_OFFSETS[this.facing] ?? SatyrPlayer.ATTACK_LANTERN_OFFSETS.down;
      const targetFrame = attackFrames[Math.min(frameIdx, attackFrames.length - 1)];
      offsetX = targetFrame.x;
      offsetY = targetFrame.y;
    } else if (currentAnimKey.includes('_walk_')) {
      // Nhịp bước đi bộ 6 frames: gậy nhấp nhô nhịp nhàng theo bước chân chuẩn pixel art
      const bobWalkY = [1, 2, 0, 1, 2, 0];
      animBobY = bobWalkY[frameIdx % bobWalkY.length];
      if (this.facing === 'left') {
        const bobWalkX = [1, 1, 0, 0, 0, 0];
        animBobX = bobWalkX[frameIdx % bobWalkX.length];
      } else if (this.facing === 'right') {
        const bobWalkX = [-1, -1, 0, 0, 0, 0];
        animBobX = bobWalkX[frameIdx % bobWalkX.length];
      }
    } else if (currentAnimKey.includes('_run_')) {
      // Nhịp chạy nhanh 6 frames: gậy chúi và dao động biên độ lớn hơn
      const bobRunY = [0, 2, -1, 0, 2, -1];
      animBobY = bobRunY[frameIdx % bobRunY.length];
      if (this.facing === 'left') {
        const bobRunX = [1, 0, -1, -2, -1, -1];
        animBobX = bobRunX[frameIdx % bobRunX.length];
      } else if (this.facing === 'right') {
        const bobRunX = [-1, 0, 1, 2, 1, 1];
        animBobX = bobRunX[frameIdx % bobRunX.length];
      }
    } else if (currentAnimKey.includes('_gather_')) {
      // Cúi người thu hoạch tài nguyên: hạ thấp gậy theo tay
      animBobY = 3;
    } else if (currentAnimKey.includes('_interact_')) {
      // Đưa tay tương tác
      animBobY = -1;
    } else if (currentAnimKey.includes('_use_item_')) {
      // Nâng cao tay dùng vật phẩm
      animBobY = -2;
    } else if (currentAnimKey.includes('_hurt_')) {
      // Giật người khi trúng đòn
      animBobX = (this.facing === 'left' ? 2 : -2);
      animBobY = -2;
    } else if (currentAnimKey.includes('_death_')) {
      // Gục ngã trên mặt đất
      animBobY = 16;
      animBobX = (this.facing === 'left' ? -2 : 2);
    } else {
      // Đứng nghỉ (Idle): nhịp thở cực kỳ nhẹ nhàng
      animBobY = Math.sin(this.scene.time.now * 0.003) * 0.4;
    }

    this.cachedLanternPos.x = Math.round(this.x + offsetX + animBobX);
    this.cachedLanternPos.y = Math.round(this.y + offsetY + animBobY);
    this.cachedLanternPos.isVisible = true;
    return this.cachedLanternPos;
  }

  /**
   * Cập nhật hiển thị trực quan chiếc đèn lồng hổ phách (C4-13-04):
   * - Trạng thái TẮT (OFF / hết dầu): Tuyệt đối KHÔNG vẽ khối hộp màu nâu giả lập tách rời. Xóa sạch graphics.
   * - Trạng thái BẬT (ON): Đốm lửa sống động bập bùng và quầng sáng hổ phách đồng tâm chính xác trên đầu gậy.
   */
  public updateLanternVisual(): void {
    if (!this.lanternOverlayGfx) return;

    const lanternPos = this.getLanternWorldPosition();
    if (!lanternPos.isVisible) {
      this.lanternOverlayGfx.clear();
      return;
    }

    const hasOil = this.stats.lanternOil > 0;
    const isLit = this.stats.isLanternOn && hasOil;

    if (!isLit) {
      // C4-13-04: Xóa bỏ hoàn toàn khối hộp vuông màu nâu tách rời.
      // Khi đèn tắt, texture nhân vật đã có sẵn cây gậy gỗ pixel-art tự nhiên.
      this.lanternOverlayGfx.clear();
      return;
    }

    const lx = lanternPos.x;
    const ly = lanternPos.y;

    // Chiếu độ sâu đồ họa phù hợp theo từng hướng nhìn:
    // - Hướng UP: gậy và đèn bị thân người phía sau che khuất -> depth - 1
    // - Hướng DOWN, LEFT, RIGHT: gậy và đèn ở phía trước cơ thể -> depth + 1
    const lanternDepth = this.facing === 'up' ? this.depth - 1 : this.depth + 1;
    if (this.lanternOverlayGfx.depth !== lanternDepth) {
      this.lanternOverlayGfx.setDepth(lanternDepth);
    }
    this.lanternOverlayGfx.clear();

    const time = this.scene.time.now;
    const flicker = Math.sin(time * 0.009) * 0.08 + Math.cos(time * 0.017) * 0.05;

    // 1. Quầng sáng dịu nhẹ bao quanh lồng đèn (Soft Ambient Micro-Glow)
    this.lanternOverlayGfx.fillStyle(0xf39c12, Math.max(0.06, 0.12 + flicker));
    this.lanternOverlayGfx.fillCircle(lx, ly + 0.5, 9);

    this.lanternOverlayGfx.fillStyle(0xf1c40f, Math.max(0.12, 0.22 + flicker));
    this.lanternOverlayGfx.fillCircle(lx, ly + 0.5, 5);

    this.lanternOverlayGfx.fillStyle(0xfff7db, Math.max(0.25, 0.40 + flicker));
    this.lanternOverlayGfx.fillCircle(lx, ly + 0.5, 2.5);

    // 2. Điểm xuyết ngọn lửa và tim đèn sống động (Living Core Flame)
    this.lanternOverlayGfx.fillStyle(0xfefae0, 0.95);
    this.lanternOverlayGfx.fillRect(lx, ly, 1, 1);

    const flameTipOffsetY = Math.sin(time * 0.02) > 0 ? -1 : 0;
    this.lanternOverlayGfx.fillStyle(0xffd166, 0.85);
    this.lanternOverlayGfx.fillRect(lx, ly + flameTipOffsetY, 1, 1);

    // Vệt sáng thủy tinh màu hổ phách
    this.lanternOverlayGfx.fillStyle(0xf39c12, 0.45);
    this.lanternOverlayGfx.fillRect(lx - 1, ly - 1, 1, 1);
    this.lanternOverlayGfx.fillRect(lx + 1, ly + 1, 1, 1);
  }

  public destroy(fromScene?: boolean): void {
    if (this.scene && this.scene.input) {
      this.scene.input.off('pointerdown', this.boundPointerDown);
    }
    if (this.lanternOverlayGfx) {
      this.lanternOverlayGfx.destroy();
      this.lanternOverlayGfx = null;
    }
    if (this.footShadowGfx) {
      this.footShadowGfx.destroy();
      this.footShadowGfx = null;
    }
    super.destroy(fromScene);
  }

  public isInteractRequested(): boolean {
    const requested = this.eKeyJustPressed;
    this.eKeyJustPressed = false;
    return requested;
  }

  /**
   * C4-12-29: Tái sử dụng cached Vector2 đối với vị trí chân Satyr để loại bỏ hoàn toàn việc cấp phát new Vector2 mỗi frame
   */
  public getFootPosition(): Phaser.Math.Vector2 {
    return this.cachedFootPos.set(this.x, this.y);
  }

  /**
   * C4-13-01: Kiểm tra xem có phím di chuyển nào (WASD hoặc Phím mũi tên) đang được nhấn không
   */
  public hasMovementInput(): boolean {
    return (
      this.isPhysicalCodeDown('KeyA') ||
      this.isPhysicalCodeDown('ArrowLeft') ||
      this.isPhysicalCodeDown('KeyD') ||
      this.isPhysicalCodeDown('ArrowRight') ||
      this.isPhysicalCodeDown('KeyW') ||
      this.isPhysicalCodeDown('ArrowUp') ||
      this.isPhysicalCodeDown('KeyS') ||
      this.isPhysicalCodeDown('ArrowDown') ||
      Boolean(this.keyA && this.keyA.isDown) ||
      Boolean(this.keyD && this.keyD.isDown) ||
      Boolean(this.keyW && this.keyW.isDown) ||
      Boolean(this.keyS && this.keyS.isDown) ||
      Boolean(this.cursors && (
        (this.cursors.left && this.cursors.left.isDown) ||
        (this.cursors.right && this.cursors.right.isDown) ||
        (this.cursors.up && this.cursors.up.isDown) ||
        (this.cursors.down && this.cursors.down.isDown)
      ))
    );
  }

  /**
   * C4-13-01: Kích hoạt trạng thái ẩn nấp và lưu lại tọa độ đứng an toàn trước khi vào chỗ trốn
   */
  public enterHiding(safePos?: { x: number; y: number }): void {
    this.lastSafePosition = safePos ? { x: safePos.x, y: safePos.y } : { x: this.x, y: this.y };
    this.stats.isHiding = true;
    this.hidingTimestamp = Date.now();
    this.setVisible(false);
    this.setVelocity(0, 0);
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
    // C4-13-08: Phát tiếng lá xào xạc khi bước vào bụi rậm
    AudioManager.getInstance().playBushRustle(true);
  }

  /**
   * C4-13-01: Thoát khỏi trạng thái ẩn nấp, trả nhân vật về vị trí an toàn ngoài rìa collider, bật hiển thị và mở khóa điều khiển
   */
  public exitHiding(): void {
    this.stats.isHiding = false;
    this.setVisible(true);
    this.setAlpha(1);
    if (this.lastSafePosition.x !== 0 || this.lastSafePosition.y !== 0) {
      this.setPosition(this.lastSafePosition.x, this.lastSafePosition.y);
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).reset(this.lastSafePosition.x, this.lastSafePosition.y);
      }
    }
    this.playIdleAnim();
    this.resetAllInputState();
    // C4-13-08: Phát tiếng lá xào xạc khi bước ra khỏi bụi rậm
    AudioManager.getInstance().playBushRustle(false);
  }
}
