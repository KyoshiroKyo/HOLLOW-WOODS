import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU, SCENE_GAME, SPRITE_FOG_SMOOTH } from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';
import { SettingsManager } from '../systems/SettingsManager';
import { SettingsUIHelper } from '../ui/SettingsUIHelper';
import { KeycapBadgeHelper } from '../ui/KeycapBadgeHelper';
import { LeaderboardService } from '../services/LeaderboardService';
import type { P2GamePlayer, P2LeaderboardEntry } from '../types/p2game';

const MENU_ORDER = ['new', 'continue', 'leaderboard', 'settings', 'guide'] as const;
type MenuAction = typeof MENU_ORDER[number];

interface MenuButton {
  enabled: boolean;
  activate: () => void;
  setFocused: (focused: boolean) => void;
}

export class MainMenuScene extends Phaser.Scene {
  private activeMenuModal?: Phaser.GameObjects.Container;
  private readonly menuButtons = new Map<MenuAction, MenuButton>();
  private menuSelection?: MenuAction;
  private continueBtnContainer?: Phaser.GameObjects.Container;
  private continueBtnX: number = 288;
  private continueBtnY: number = 306;
  private authContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_MAIN_MENU });
  }

  public create(): void {
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1.0);

    this.menuButtons.clear();
    this.menuSelection = undefined;
    this.activeMenuModal = undefined;
    this.continueBtnContainer = undefined;
    this.createCinematicBackdrop();

    HDTextHelper.createText(this, 76, 82, 'HOLLOW WOODS', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#E09F3E',
      stroke: '#080c09',
      strokeThickness: 4,
    });
    HDTextHelper.createText(this, 80, 155, 'DỊ CẢNH RỪNG SƯƠNG', {
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#E8DFC8',
      stroke: '#080c09',
      strokeThickness: 2,
    }).setLetterSpacing(0.5);
    HDTextHelper.createText(this, 80, 181, 'THE FOG THAT REMEMBERS', {
      fontSize: '13px',
      color: '#C8CFC2',
      stroke: '#080c09',
      strokeThickness: 1.5,
    }).setLetterSpacing(0.5);
    this.add.rectangle(80, 204, 114, 2, 0xC8963E).setOrigin(0, 0);

    const menuX = 288;
    const firstY = 248;
    const step = 58;
    this.createMenuButton('new', menuX, firstY, 'BƯỚC VÀO MÀN SƯƠNG', null, '#ffdc9a', true, () => this.startNewGame());
    this.continueBtnX = menuX;
    this.continueBtnY = firstY + step;
    this.renderContinueButton();
    this.createMenuButton('leaderboard', menuX, firstY + step * 2, 'BẢNG XẾP HẠNG', null, '#E8DFC8', true, () => this.showLeaderboardModal());
    this.createMenuButton('settings', menuX, firstY + step * 3, 'CÀI ĐẶT TRÒ CHƠI', null, '#E8DFC8', true, () => this.showSettingsModal());
    this.createMenuButton('guide', menuX, firstY + step * 4, 'BIÊN NIÊN SỬ & HƯỚNG DẪN', null, '#E8DFC8', true, () => this.showChronicleAndGuideModal());

    const guideTitle = HDTextHelper.createText(this, 82, 562, 'ĐIỀU KHIỂN  [H]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#dfba78',
    });
    HDTextHelper.createText(this, 82, 587, 'WASD Di chuyển · F Vòng Sáng', {
      fontSize: '14px',
      color: '#C8CFC2',
    });
    HDTextHelper.createText(this, 82, 609, 'E Tương tác · J Sổ tay', {
      fontSize: '14px',
      color: '#C8CFC2',
    });
    const guideHit = this.add.zone(82, 556, 412, 77).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    guideHit.on('pointerdown', () => {
      AudioManager.getInstance().playWoodTap();
      this.showChronicleAndGuideModal();
    });
    guideHit.on('pointerover', () => guideTitle.setColor('#fff2c2'));
    guideHit.on('pointerout', () => guideTitle.setColor('#dfba78'));

    const keyboard = this.input.keyboard;
    if (keyboard) {
      const activate = () => {
        if (this.activeMenuModal) return;
        const selected = this.menuSelection && this.menuButtons.get(this.menuSelection);
        if (selected && selected.enabled) selected.activate();
        else if (SaveManager.hasSave()) this.continueGame();
        else this.startNewGame();
      };
      keyboard.on('keydown-ENTER', activate);
      keyboard.on('keydown-SPACE', activate);
      keyboard.on('keydown-UP', () => this.moveMenuSelection(-1));
      keyboard.on('keydown-DOWN', () => this.moveMenuSelection(1));
      keyboard.on('keydown-ESC', () => this.closeActiveMenuModal());
      keyboard.on('keydown-H', () => {
        if (this.activeMenuModal) this.closeActiveMenuModal();
        else this.showChronicleAndGuideModal();
      });
    }

    // Mở khóa âm thanh khi tương tác
    const audio = AudioManager.getInstance();
    if (audio.isAudioUnlocked()) {
      audio.setAmbienceZone('forest', 2.0);
    } else {
      const unlockAndPlayAmbience = () => {
        audio.resumeAudio();
        audio.setAmbienceZone('forest', 2.0);
      };
      this.input.once('pointerdown', unlockAndPlayAmbience);
      if (this.input.keyboard) {
        this.input.keyboard.once('keydown', unlockAndPlayAmbience);
      }
    }

    // =========================================================================
    // 7. V152-08: WIDGET ĐĂNG NHẬP CHUẨN P2.AUTH & TÍN HIỆU P2.READY()
    // =========================================================================
    this.setupAuthWidget();

    // Phát tín hiệu p2.ready() ngay khi MainMenuScene vẽ xong khung hình đầu tiên (tránh cảnh báo SD-004)
    this.events.once('render', () => {
      try {
        if (typeof window !== 'undefined' && window.p2 && typeof window.p2.ready === 'function') {
          window.p2.ready();
          console.log('[P2Game SDK] Đã phát tín hiệu p2.ready() khi MainMenuScene hoàn thành khung hình đầu tiên.');
        }
      } catch (err) {
        console.warn('[P2Game SDK] Lỗi khi gọi p2.ready() từ MainMenuScene:', err);
      }
    });
  }

  private createCinematicBackdrop(): void {
    this.cameras.main.setBackgroundColor('#141712');
    if (this.textures.exists('menu_black_knight_woodland')) {
      this.add.image(640, 360, 'menu_black_knight_woodland').setDisplaySize(1280, 720).setTint(0x606853);
    }

    const cinematicKey = 'menu_black_knight_cinematic';
    const animationKey = 'menu_black_knight_cover_loop';
    if (this.textures.exists(cinematicKey) && this.textures.get(cinematicKey).has('11')) {
      if (!this.anims.exists(animationKey)) {
        this.anims.create({
          key: animationKey,
          frames: this.anims.generateFrameNumbers(cinematicKey, { start: 0, end: 11 }),
          frameRate: 10,
          repeat: -1,
        });
      }
      this.add.sprite(800, 353, cinematicKey, 0)
        .setName('menu-black-knight-art')
        .setDisplaySize(960, 540)
        .play(animationKey);
    } else if (this.textures.exists('menu_black_knight_fallback')) {
      this.add.image(800, 353, 'menu_black_knight_fallback')
        .setName('menu-black-knight-art')
        .setDisplaySize(960, 540);
    }

    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      const mist = this.add.image(1010, 572, SPRITE_FOG_SMOOTH)
        .setDisplaySize(620, 144)
        .setTint(0x9aa690)
        .setAlpha(0.14);
      this.tweens.add({ targets: mist, x: 950, alpha: 0.07, duration: 8500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // B04-13B: Lớp tối nhẹ chuyển sắc bên trái (Ember Gold & Dark Moss UI Contrast Scrim)
    // Giữ Black Knight bên phải sáng rõ và rực rỡ, tạo nền tối tĩnh lặng cho menu và tiêu đề
    const leftVignette = this.add.graphics();
    leftVignette.fillGradientStyle(0x0c0f0d, 0x0c0f0d, 0x0c0f0d, 0x0c0f0d, 0.90, 0.0, 0.90, 0.0);
    leftVignette.fillRect(0, 0, 580, 720);
  }

  private focusMenuAction(action?: MenuAction): void {
    if (this.menuSelection === action) return;
    if (this.menuSelection) this.menuButtons.get(this.menuSelection)?.setFocused(false);
    this.menuSelection = action;
    if (action) this.menuButtons.get(action)?.setFocused(true);
  }

  private moveMenuSelection(direction: -1 | 1): void {
    if (this.activeMenuModal) return;
    const enabled = MENU_ORDER.filter((action) => this.menuButtons.get(action)?.enabled);
    if (enabled.length === 0) return;
    const index = this.menuSelection ? enabled.indexOf(this.menuSelection) : -1;
    const next = index === -1
      ? enabled[direction === 1 ? 0 : enabled.length - 1]
      : enabled[(index + direction + enabled.length) % enabled.length];
    this.focusMenuAction(next);
  }

  private createMenuButton(
    action: MenuAction,
    x: number,
    y: number,
    mainText: string,
    subText: string | null,
    color: string,
    enabled: boolean,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y).setName(`menu-${action}`);
    const width = 416;
    const height = subText ? 54 : 48;
    const primary = action === 'new';
    const baseKey = this.textures.exists('menu_black_knight_button') ? 'menu_black_knight_button' : 'ui_pack_btn_wood';
    const hoverKey = this.textures.exists('menu_black_knight_button_hover') ? 'menu_black_knight_button_hover' : baseKey;
    const material = this.textures.exists(baseKey)
      ? this.add.image(0, 0, baseKey).setDisplaySize(width, height)
      : this.add.rectangle(0, 0, width, height);
    const main = HDTextHelper.createText(this, 0, subText ? -9 : 0, mainText, {
      fontSize: '17px', fontStyle: 'bold', color,
    }).setOrigin(0.5);
    btn.add([material, main]);
    if (subText) {
      btn.add(HDTextHelper.createText(this, 0, 13, subText, {
        fontSize: '11px',
        color: enabled ? '#C8CFC2' : '#8a9485',
        maxLines: 1,
        stroke: '#0b0e0c',
        strokeThickness: 1.5,
        wordWrap: { width: width - 40, useAdvancedWrap: true },
      }).setOrigin(0.5));
    }

    const setFocused = (focused: boolean) => {
      const highlight = enabled && focused;
      const shade = highlight ? 0x92703f : primary ? 0x5f4f30 : 0x394238;
      if (material instanceof Phaser.GameObjects.Image) {
        material.setTexture(highlight ? hoverKey : baseKey).setDisplaySize(width, height).setTint(shade);
      } else {
        material.setFillStyle(shade, 0.9).setStrokeStyle(1, highlight ? 0xe0aa59 : 0x5f664e);
      }
      main.setColor(highlight ? '#fff6e0' : color);
    };
    const activate = () => {
      AudioManager.getInstance().playInteract();
      onClick();
    };
    setFocused(this.menuSelection === action);
    this.menuButtons.set(action, { enabled, activate, setFocused });

    const hitZone = this.add.zone(0, 0, width, height).setInteractive({ useHandCursor: enabled });
    btn.add(hitZone);
    if (enabled) {
      hitZone.on('pointerover', () => {
        this.focusMenuAction(action);
        AudioManager.getInstance().playWoodTap(0.45);
      });
      hitZone.on('pointerout', () => {
        if (this.menuSelection === action) this.focusMenuAction(undefined);
      });
      hitZone.on('pointerup', activate);
    } else {
      btn.setAlpha(0.65);
      hitZone.on('pointerdown', onClick);
    }
    return btn;
  }

  private async continueGame(): Promise<void> {
    AudioManager.getInstance().playInteract();
    const saveData = await SaveManager.loadGameAsync();
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_GAME, { isContinue: true, saveData });
    });
  }

  private startNewGame(): void {
    AudioManager.getInstance().playInteract();
    SaveManager.clearSave();
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_GAME, { isContinue: false });
    });
  }

  private renderContinueButton(): void {
    if (this.continueBtnContainer) {
      this.continueBtnContainer.destroy();
      this.continueBtnContainer = undefined;
    }

    const hasSaveGame = SaveManager.hasSave();
    const saveSummary = SaveManager.getSaveSummary();

    if (hasSaveGame && saveSummary) {
      const checkpointDesc = saveSummary.checkpoint || 'Hồi 0 • Cổng Làng Bellhollow • Ngày 1';
      this.continueBtnContainer = this.createMenuButton(
        'continue',
        this.continueBtnX,
        this.continueBtnY,
        'TIẾP TỤC HÀNH TRÌNH',
        checkpointDesc,
        '#e5a93c',
        true,
        () => this.continueGame()
      );

    } else {
      this.continueBtnContainer = this.createMenuButton(
        'continue',
        this.continueBtnX,
        this.continueBtnY,
        'TIẾP TỤC HÀNH TRÌNH',
        'Chưa có bản lưu hành trình',
        '#C8CFC2',
        false,
        () => this.showNoticeToast('⚠️ Chưa có bản lưu hành trình! Vui lòng chọn Bước Vào Màn Sương.')
      );
    }
  }

  private onSaveDataCleared(): void {
    this.renderContinueButton();
    this.showNoticeToast('✔ Đã xóa toàn bộ tiến trình bản lưu!');
  }

  /**
   * Hộp thoại Cài Đặt (Settings Modal)
   */
  private showSettingsModal(): void {
    this.closeActiveMenuModal();

    const modal = this.add.container(640, 360).setDepth(9000);
    const modalW = 680;
    const modalH = 540;

    // Lớp phủ mờ nền
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(-640, -360, 1280, 720);

    // HitZone đóng modal khi nhấn ra ngoài
    const overlayHit = this.add.zone(0, 0, 1280, 720).setInteractive();
    overlayHit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const lx = pointer.x - 640;
      const ly = pointer.y - 360;
      if (lx < -modalW / 2 || lx > modalW / 2 || ly < -modalH / 2 || ly > modalH / 2) {
        this.closeActiveMenuModal();
      }
    });

    // Khung hộp thoại gỗ tối viền đồng xỉn
    const box = this.add.graphics();
    box.fillStyle(0x120d09, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.8, 0x8a6d3b, 0.95);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1, 0x5c4627, 0.55);
    box.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 30, '⚙ CÀI ĐẶT TRÒ CHƠI & HỆ THỐNG', {
      fontFamily: 'Cinzel, Georgia, "Times New Roman", serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#140d06',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    const subTitle = HDTextHelper.createText(this, 0, -modalH / 2 + 52, 'Âm thanh đa kênh • Rung màn hình hoảng loạn • Quản lý bản lưu', {
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#9e8c75'
    }).setOrigin(0.5, 0.5);

    // Phân cách 1
    const div1 = this.add.graphics();
    div1.lineStyle(1, 0x3d2b18, 0.8);
    div1.lineBetween(-modalW / 2 + 24, -modalH / 2 + 66, modalW / 2 - 24, -modalH / 2 + 66);

    const settings = SettingsManager.getInstance();

    // --- HW-FX-31: Tab Bar: [ 🔊 ÂM LƯỢNG & TIẾN TRÌNH ] và [ 👁️ HÌNH ẢNH & TIẾP CẬN ] ---
    let activeSettingsTab: 'AUDIO' | 'VISUALS' = 'AUDIO';

    const tabAudioBtn = this.add.container(-140, -modalH / 2 + 86);
    const tabAudioBg = this.add.graphics();
    const tabAudioTxt = HDTextHelper.createText(this, 0, 0, '🔊 ÂM LƯỢNG & LƯU TRỮ', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f'
    }).setOrigin(0.5, 0.5);
    tabAudioBtn.add([tabAudioBg, tabAudioTxt]);
    tabAudioBtn.setSize(240, 26);
    tabAudioBtn.setInteractive(new Phaser.Geom.Rectangle(-120, -13, 240, 26), Phaser.Geom.Rectangle.Contains);
    if (tabAudioBtn.input) tabAudioBtn.input.cursor = 'pointer';

    const tabVisualsBtn = this.add.container(140, -modalH / 2 + 86);
    const tabVisualsBg = this.add.graphics();
    const tabVisualsTxt = HDTextHelper.createText(this, 0, 0, '👁️ HÌNH ẢNH & TIẾP CẬN', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);
    tabVisualsBtn.add([tabVisualsBg, tabVisualsTxt]);
    tabVisualsBtn.setSize(240, 26);
    tabVisualsBtn.setInteractive(new Phaser.Geom.Rectangle(-120, -13, 240, 26), Phaser.Geom.Rectangle.Contains);
    if (tabVisualsBtn.input) tabVisualsBtn.input.cursor = 'pointer';

    const renderTabs = () => {
      tabAudioBg.clear();
      const isAudio = activeSettingsTab === 'AUDIO';
      tabAudioBg.fillStyle(isAudio ? 0x2b2210 : 0x141a24, 0.95);
      tabAudioBg.fillRoundedRect(-120, -13, 240, 26, 4);
      tabAudioBg.lineStyle(1.5, isAudio ? 0xf1c40f : 0x4a5568, 0.9);
      tabAudioBg.strokeRoundedRect(-120, -13, 240, 26, 4);
      tabAudioTxt.setColor(isAudio ? '#f1c40f' : '#94a3b8');

      tabVisualsBg.clear();
      const isVisuals = activeSettingsTab === 'VISUALS';
      tabVisualsBg.fillStyle(isVisuals ? 0x2b2210 : 0x141a24, 0.95);
      tabVisualsBg.fillRoundedRect(-120, -13, 240, 26, 4);
      tabVisualsBg.lineStyle(1.5, isVisuals ? 0xf1c40f : 0x4a5568, 0.9);
      tabVisualsBg.strokeRoundedRect(-120, -13, 240, 26, 4);
      tabVisualsTxt.setColor(isVisuals ? '#f1c40f' : '#94a3b8');

      audioTabGroup.setVisible(isAudio);
      visualsTabGroup.setVisible(isVisuals);
    };

    tabAudioBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      activeSettingsTab = 'AUDIO';
      renderTabs();
    });

    tabVisualsBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      activeSettingsTab = 'VISUALS';
      renderTabs();
    });

    // --- TAB 1: ÂM LƯỢNG & TIẾN TRÌNH ---
    const audioTabGroup = this.add.container(0, 0);

    // 1. THANH KÉO ÂM LƯỢNG NHẠC NỀN (BGM)
    const bgmSlider = SettingsUIHelper.createVolumeSlider(
      this,
      40,
      -modalH / 2 + 130,
      '🎵 Nhạc Nền (BGM):',
      settings.getMusicVolume(),
      (val) => settings.setMusicVolume(val),
      { trackWidth: 200, fillColor: 0x3498db, thumbColor: 0x5dade2 }
    );

    // 2. THANH KÉO ÂM LƯỢNG HIỆU ỨNG (SFX)
    const sfxSlider = SettingsUIHelper.createVolumeSlider(
      this,
      40,
      -modalH / 2 + 172,
      '🔊 Hiệu Ứng (SFX):',
      settings.getSfxVolume(),
      (val) => settings.setSfxVolume(val),
      { trackWidth: 200, fillColor: 0xe67e22, thumbColor: 0xf39c12 }
    );

    // 3. THANH KÉO ÂM LƯỢNG TỔNG (MASTER) & NÚT MUTE
    const masterSlider = SettingsUIHelper.createVolumeSlider(
      this,
      -10,
      -modalH / 2 + 214,
      '🎚️ Âm Lượng Tổng:',
      settings.getMasterVolume(),
      (val) => settings.setMasterVolume(val),
      { trackWidth: 150, fillColor: 0x2ecc71, thumbColor: 0x58d68d }
    );

    // Nút Bật/Tắt Toàn Bộ Âm Thanh (Mute)
    const muteBtnContainer = this.add.container(modalW / 2 - 95, -modalH / 2 + 214);
    const muteBtnBg = this.add.graphics();
    const muteBtnTxt = HDTextHelper.createText(this, 0, 0, settings.isMuted() ? '🔇 TẮT TIẾNG' : '🔊 BẬT TIẾNG', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: settings.isMuted() ? '#e74c3c' : '#2ecc71'
    }).setOrigin(0.5, 0.5);
    muteBtnContainer.add([muteBtnBg, muteBtnTxt]);
    muteBtnContainer.setSize(96, 26);
    muteBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-48, -13, 96, 26), Phaser.Geom.Rectangle.Contains);
    if (muteBtnContainer.input) muteBtnContainer.input.cursor = 'pointer';

    const renderMuteBtn = (isHover: boolean = false) => {
      muteBtnBg.clear();
      const muted = settings.isMuted();
      const fill = muted ? (isHover ? 0x3d1c21 : 0x2b1418) : (isHover ? 0x1b3827 : 0x14281e);
      const stroke = muted ? 0xe74c3c : 0x2ecc71;
      muteBtnBg.fillStyle(fill, 0.95);
      muteBtnBg.fillRoundedRect(-48, -13, 96, 26, 4);
      muteBtnBg.lineStyle(1.5, stroke, 0.9);
      muteBtnBg.strokeRoundedRect(-48, -13, 96, 26, 4);
      muteBtnTxt.setText(muted ? '🔇 TẮT TIẾNG' : '🔊 BẬT TIẾNG');
      muteBtnTxt.setColor(muted ? '#ff7675' : '#2ecc71');
    };
    renderMuteBtn();

    muteBtnContainer.on('pointerover', () => renderMuteBtn(true));
    muteBtnContainer.on('pointerout', () => renderMuteBtn(false));
    muteBtnContainer.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      settings.toggleMute();
      renderMuteBtn(true);
    });

    // Phân cách trong tab Audio
    const divAudio = this.add.graphics();
    divAudio.lineStyle(1, 0x3d2b18, 0.8);
    divAudio.lineBetween(-modalW / 2 + 24, -modalH / 2 + 252, modalW / 2 - 24, -modalH / 2 + 252);

    const saveSectionLabel = HDTextHelper.createText(this, 0, -modalH / 2 + 280, 'QUẢN LÝ TIẾN TRÌNH LƯU TRỮ TRÒ CHƠI', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5);

    const clearSaveBtn = SettingsUIHelper.createSafeClearSaveButton(
      this,
      0,
      -modalH / 2 + 322,
      () => {
        SaveManager.clearSave();
        this.onSaveDataCleared();
      },
      380,
      30
    );

    audioTabGroup.add([
      bgmSlider.container,
      sfxSlider.container,
      masterSlider.container,
      muteBtnContainer,
      divAudio,
      saveSectionLabel,
      clearSaveBtn
    ]);

    // --- TAB 2: HÌNH ẢNH & TIẾP CẬN ---
    const visualsTabGroup = this.add.container(0, 0);

    // 1. CHẤT LƯỢNG ĐỒ HỌA (GRAPHICS QUALITY)
    const gfxContainer = this.add.container(0, -modalH / 2 + 120);
    const gfxLabel = HDTextHelper.createText(this, -270, 0, '🖥️ Mức Đồ Họa & Sương Mù:', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const gfxBtn = this.add.container(170, 0);
    const gfxBtnBg = this.add.graphics();
    const gfxBtnTxt = HDTextHelper.createText(this, 0, 0, '', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f1c40f'
    }).setOrigin(0.5, 0.5);
    gfxBtn.add([gfxBtnBg, gfxBtnTxt]);
    gfxBtn.setSize(200, 26);
    gfxBtn.setInteractive(new Phaser.Geom.Rectangle(-100, -13, 200, 26), Phaser.Geom.Rectangle.Contains);
    if (gfxBtn.input) gfxBtn.input.cursor = 'pointer';

    const renderGfxBtn = (isHover: boolean = false) => {
      const q = settings.getGraphicsQuality();
      let label = '🌟 CAO (HIGH)';
      let col = '#f1c40f';
      let bgC = 0x2e2305;
      let strokeC = 0xf1c40f;
      if (q === 'MEDIUM') {
        label = '⚡ CÂN BẰNG (MEDIUM)';
        col = '#3498db';
        bgC = 0x0e243b;
        strokeC = 0x3498db;
      } else if (q === 'LOW') {
        label = '🍃 MƯỢT MÀ (LOW)';
        col = '#2ecc71';
        bgC = 0x0e2b1b;
        strokeC = 0x2ecc71;
      }
      gfxBtnBg.clear();
      gfxBtnBg.fillStyle(isHover ? (bgC + 0x111111) : bgC, 0.95);
      gfxBtnBg.fillRoundedRect(-100, -13, 200, 26, 4);
      gfxBtnBg.lineStyle(1.5, strokeC, 0.9);
      gfxBtnBg.strokeRoundedRect(-100, -13, 200, 26, 4);
      gfxBtnTxt.setText(label);
      gfxBtnTxt.setColor(col);
    };
    renderGfxBtn();

    gfxBtn.on('pointerover', () => renderGfxBtn(true));
    gfxBtn.on('pointerout', () => renderGfxBtn(false));
    gfxBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      settings.cycleGraphicsQuality();
      renderGfxBtn(true);
    });

    gfxContainer.add([gfxLabel, gfxBtn]);

    // 2. TÙY CHỌN GIẢM CHUYỂN ĐỘNG (REDUCED MOTION)
    const reducedMotionToggle = SettingsUIHelper.createGenericToggle(
      this,
      0,
      -modalH / 2 + 165,
      '♿ Giảm Chuyển Động (Reduced Motion):',
      'Tắt rung giật & dao động thị giác để bảo vệ mắt.',
      settings.isReducedMotionEnabled(),
      (enabled) => {
        settings.setReducedMotionEnabled(enabled);
        shakeToggle.setEnabled(settings.isScreenShakeEnabled());
        lightMotionToggle.setEnabled(settings.isRawLightMotionEnabled());
      },
      540
    );

    // 3. TÙY CHỌN RUNG MÀN HÌNH (SCREEN SHAKE)
    const shakeToggle = SettingsUIHelper.createGenericToggle(
      this,
      0,
      -modalH / 2 + 210,
      '📳 Rung Màn Hình (Screen Shake):',
      'Rung giật camera khi nguy kịch hoặc bị quái vật tập kích.',
      settings.isScreenShakeEnabled(),
      (enabled) => settings.setScreenShakeEnabled(enabled),
      540
    );

    // 4. HIỆU ỨNG HOẢNG SỢ (PANIC VISUALS)
    const panicToggle = SettingsUIHelper.createGenericToggle(
      this,
      0,
      -modalH / 2 + 255,
      '👁️ Hiệu Ứng Hoảng Sợ (Panic Visuals):',
      'Sương tím & vệt đỏ kinh dị tâm lý khi Tinh Thần <40%.',
      settings.isPanicEffectsEnabled(),
      (enabled) => settings.setPanicEffectsEnabled(enabled),
      540
    );

    // 5. DAO ĐỘNG ÁNH SÁNG (LIGHT MOTION)
    const lightMotionToggle = SettingsUIHelper.createGenericToggle(
      this,
      0,
      -modalH / 2 + 300,
      '✨ Dao Động Ánh Sáng (Light Motion):',
      'Nhịp thở FOW & đèn lồng (tự tắt khi Reduced Motion ON).',
      settings.isRawLightMotionEnabled(),
      (enabled) => settings.setLightMotionEnabled(enabled),
      540
    );

    // 6. CƯỜNG ĐỘ HOẢNG SỢ (PANIC INTENSITY)
    const intensitySelector = SettingsUIHelper.createIntensitySelector(
      this,
      0,
      -modalH / 2 + 345,
      '🎨 Cường Độ Hoảng Sợ (Intensity):',
      'Độ đậm nhạt của lớp sương và viền trang trí.',
      settings.getPanicIntensity(),
      () => settings.cyclePanicIntensity(),
      540
    );

    visualsTabGroup.add([
      gfxContainer,
      reducedMotionToggle.container,
      shakeToggle.container,
      panicToggle.container,
      lightMotionToggle.container,
      intensitySelector.container
    ]);

    renderTabs();

    // Nút Đóng [ESC]
    const closeBtn = this.add.container(0, modalH / 2 - 34);
    const closeBg = this.add.graphics();
    const renderCloseBtn = (isHover: boolean) => {
      closeBg.clear();
      closeBg.fillStyle(isHover ? 0x2e2017 : 0x1e1610, 0.95);
      closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
      closeBg.lineStyle(1.4, isHover ? 0xe5a93c : 0x6e5233, 0.9);
      closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);
    };
    renderCloseBtn(false);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5eedc'
    }).setOrigin(0.5, 0.5);

    const closeHit = this.add.zone(0, 0, 180, 32).setInteractive({ useHandCursor: true });
    closeHit.on('pointerover', () => {
      renderCloseBtn(true);
      closeText.setColor('#fff4da');
    });
    closeHit.on('pointerout', () => {
      renderCloseBtn(false);
      closeText.setColor('#f5eedc');
    });
    closeHit.on('pointerdown', () => this.closeActiveMenuModal());

    closeBtn.add([closeBg, closeText, closeHit]);

    modal.add([
      overlay,
      overlayHit,
      box,
      title,
      subTitle,
      div1,
      tabAudioBtn,
      tabVisualsBtn,
      audioTabGroup,
      visualsTabGroup,
      closeBtn
    ]);

    this.activeMenuModal = modal;
  }

  /**
   * Hộp thoại Biên Niên Sử & Hướng Dẫn (Chronicle, Lore & Controls Guide Modal)
   */
  private showChronicleAndGuideModal(): void {
    this.closeActiveMenuModal();

    const modal = this.add.container(640, 360).setDepth(9000);
    const modalW = 760;
    const modalH = 580;

    // Lớp phủ mờ nền
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(-640, -360, 1280, 720);

    const overlayHit = this.add.zone(0, 0, 1280, 720).setInteractive();
    overlayHit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const lx = pointer.x - 640;
      const ly = pointer.y - 360;
      if (lx < -modalW / 2 || lx > modalW / 2 || ly < -modalH / 2 || ly > modalH / 2) {
        this.closeActiveMenuModal();
      }
    });

    const box = this.add.graphics();
    box.fillStyle(0x120d09, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.8, 0x8a6d3b, 0.95);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1, 0x5c4627, 0.55);
    box.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 28, '📜 BIÊN NIÊN SỬ & HƯỚNG DẪN ĐIỀU KHIỂN', {
      fontFamily: 'Cinzel, Georgia, "Times New Roman", serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#140d06',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Phần Cốt Truyện / Lore Banner súc tích
    const loreBox = this.add.graphics();
    loreBox.fillStyle(0x0a0705, 0.65);
    loreBox.fillRoundedRect(-modalW / 2 + 20, -modalH / 2 + 48, modalW - 40, 68, 6);
    loreBox.lineStyle(1, 0x422f1d, 0.75);
    loreBox.strokeRoundedRect(-modalW / 2 + 20, -modalH / 2 + 48, modalW - 40, 68, 6);

    const loreText = HDTextHelper.createText(
      this,
      0,
      -modalH / 2 + 82,
      '✦ DỊ CẢNH RỪNG SƯƠNG (THE FOG THAT REMEMBERS) ✦\n' +
      'Đại Hồng Chung Bellhollow nứt đôi khiến mạch rễ tha hóa trỗi dậy, giam cầm thung lũng trong Màn Sương Ký Ức vĩnh cửu.\n' +
      'Ngươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi — thắp sáng Đèn Lồng Hổ Phách để giữ vững Bình Tâm, giải mã cổ ngữ,\n' +
      'và quyết định vận mệnh thung lũng qua 3 Kết Thúc: Bình Minh Của Tiếng Chuông, Người Canh Gác Vĩnh Hằng, hoặc Màn Đêm Vĩnh Cửu.',
      {
        fontSize: '11px',
        color: '#dfd5c4',
        align: 'center',
        lineSpacing: 4
      }
    ).setOrigin(0.5, 0.5);

    // Bảng Phím Bấm Trực Quan (Keycap Badges theo 3 nhóm)
    const controlsGuide = KeycapBadgeHelper.buildControlsGuideContent(
      this,
      -modalW / 2 + 50,
      -modalH / 2 + 130,
      modalW - 100
    );

    // Nút Đóng
    const closeBtn = this.add.container(0, modalH / 2 - 30);
    const closeBg = this.add.graphics();
    const renderCloseBtn = (isHover: boolean) => {
      closeBg.clear();
      closeBg.fillStyle(isHover ? 0x2e2017 : 0x1e1610, 0.95);
      closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
      closeBg.lineStyle(1.4, isHover ? 0xe5a93c : 0x6e5233, 0.9);
      closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);
    };
    renderCloseBtn(false);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5eedc'
    }).setOrigin(0.5, 0.5);

    const closeHit = this.add.zone(0, 0, 180, 32).setInteractive({ useHandCursor: true });
    closeHit.on('pointerover', () => {
      renderCloseBtn(true);
      closeText.setColor('#fff4da');
    });
    closeHit.on('pointerout', () => {
      renderCloseBtn(false);
      closeText.setColor('#f5eedc');
    });
    closeHit.on('pointerdown', () => this.closeActiveMenuModal());

    closeBtn.add([closeBg, closeText, closeHit]);

    modal.add([overlay, overlayHit, box, title, loreBox, loreText, controlsGuide, closeBtn]);
    this.activeMenuModal = modal;
  }

  private closeActiveMenuModal(): void {
    if (this.activeMenuModal) {
      AudioManager.getInstance().playInteract();
      this.activeMenuModal.destroy();
      this.activeMenuModal = undefined;
    }
  }

  private showNoticeToast(message: string): void {
    AudioManager.getInstance().playInteract();
    const toast = HDTextHelper.createText(this, 390, 500, message, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#e5a93c',
      backgroundColor: '#120d09ee',
      padding: { x: 14, y: 8 },
      stroke: '#0f0a06',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(9999);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 476,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => toast.destroy()
    });
  }

  /**
   * V152-08: Quản lý hiển thị tài khoản người chơi chuẩn p2.auth
   * TUYỆT ĐỐI KHÔNG tự dựng form đăng nhập riêng.
   */
  private setupAuthWidget(): void {
    if (this.authContainer) {
      this.authContainer.destroy();
    }
    this.authContainer = this.add.container(1250, 28).setDepth(8500);

    const updateDisplay = (player: P2GamePlayer | null) => {
      if (!this.authContainer || !this.sys.isActive()) return;
      this.authContainer.removeAll(true);

      const isAuthenticated = Boolean(player && !player.anonymous);
      const displayName = isAuthenticated ? (player?.displayName || 'Người Chơi') : 'Khách';

      const bg = this.add.graphics();
      const text = HDTextHelper.createText(this, isAuthenticated ? -12 : -110, 0, `👤 ${displayName}`, {
        fontSize: '11.5px',
        fontStyle: isAuthenticated ? 'bold' : 'normal',
        color: isAuthenticated ? '#f39c12' : '#94a3b8'
      }).setOrigin(isAuthenticated ? 1 : 0, 0.5);

      if (isAuthenticated) {
        const textWidth = text.width;
        bg.fillStyle(0x0e0c08, 0.85);
        bg.fillRoundedRect(-textWidth - 28, -14, textWidth + 28, 28, 6);
        bg.lineStyle(1, 0x8a6d3b, 0.7);
        bg.strokeRoundedRect(-textWidth - 28, -14, textWidth + 28, 28, 6);
        this.authContainer.add([bg, text]);
      } else {
        // Nút Đăng Nhập gọi trực tiếp window.p2.auth.requestLogin()
        const loginBtnW = 92;
        const loginBtnH = 26;
        const loginBtnX = -loginBtnW;
        const loginBtnY = -loginBtnH / 2;

        const btnBg = this.add.graphics();
        const renderBtn = (hover: boolean) => {
          btnBg.clear();
          btnBg.fillStyle(hover ? 0x2e1d0f : 0x16100a, 0.92);
          btnBg.fillRoundedRect(loginBtnX, loginBtnY, loginBtnW, loginBtnH, 5);
          btnBg.lineStyle(1.2, hover ? 0xf1c40f : 0x8a6d3b, 0.9);
          btnBg.strokeRoundedRect(loginBtnX, loginBtnY, loginBtnW, loginBtnH, 5);
        };
        renderBtn(false);

        const btnText = HDTextHelper.createText(this, loginBtnX + loginBtnW / 2, 0, '🔑 ĐĂNG NHẬP', {
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#e5a93c'
        }).setOrigin(0.5, 0.5);

        const hitZone = this.add.zone(loginBtnX + loginBtnW / 2, 0, loginBtnW, loginBtnH).setInteractive({ useHandCursor: true });
        hitZone.on('pointerover', () => {
          renderBtn(true);
          btnText.setColor('#fff4da');
        });
        hitZone.on('pointerout', () => {
          renderBtn(false);
          btnText.setColor('#e5a93c');
        });
        hitZone.on('pointerdown', async () => {
          AudioManager.getInstance().playInteract();
          try {
            if (typeof window !== 'undefined' && window.p2?.auth?.requestLogin) {
              const loggedPlayer = await window.p2.auth.requestLogin();
              if (loggedPlayer) {
                updateDisplay(loggedPlayer);
              }
            } else {
              this.showNoticeToast('Nền tảng P2Game chưa sẵn sàng hoặc đang chạy Offline.');
            }
          } catch (loginErr: any) {
            console.warn('[MainMenuScene] requestLogin error:', loginErr);
          }
        });

        // Nền pill nhỏ bao quanh chữ "👤 Khách"
        bg.fillStyle(0x0e0c08, 0.7);
        bg.fillRoundedRect(-200, -14, 96, 28, 5);
        bg.lineStyle(1, 0x4a3824, 0.5);
        bg.strokeRoundedRect(-200, -14, 96, 28, 5);

        text.setPosition(-192, 0);

        this.authContainer.add([bg, text, btnBg, btnText, hitZone]);
      }
    };

    // Đọc trạng thái người chơi ban đầu
    if (typeof window !== 'undefined' && window.p2?.auth?.getUser) {
      window.p2.auth.getUser().then((player) => {
        updateDisplay(player);
      }).catch(() => {
        updateDisplay(null);
      });

      // Lắng nghe thay đổi trạng thái đăng nhập
      if (typeof window.p2.auth.onChange === 'function') {
        const unsubscribe = window.p2.auth.onChange((player) => {
          updateDisplay(player);
        });
        this.events.once('shutdown', unsubscribe);
      }
    } else {
      updateDisplay(null);
    }
  }

  /**
   * V152-08: Mở modal Bảng Xếp Hạng Sinh Tồn tuần (WEEKLY) và thứ hạng cá nhân
   * Sử dụng nền giấy da UI Pack và bọc try/catch chuẩn P2GameError
   */
  private showLeaderboardModal(): void {
    this.closeActiveMenuModal();

    const modal = this.add.container(640, 360).setDepth(9000);
    const modalW = 780;
    const modalH = 550;

    // 1. Nền tối phủ mờ
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(-640, -360, 1280, 720);

    const overlayHit = this.add.zone(0, 0, 1280, 720).setInteractive();
    overlayHit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const lx = pointer.x - 640;
      const ly = pointer.y - 360;
      if (lx < -modalW / 2 || lx > modalW / 2 || ly < -modalH / 2 || ly > modalH / 2) {
        this.closeActiveMenuModal();
      }
    });

    // 2. Khung viền hộp thoại (kết hợp hình ảnh UI Pack nếu có)
    const box = this.add.graphics();
    box.fillStyle(0x120d09, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(2, 0x8a6d3b, 0.95);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1, 0x5c4627, 0.6);
    box.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    // Dùng texture UI Pack trang trí nền nếu tồn tại
    if (this.textures.exists('ui_pack_panel_modal')) {
      const decorImg = this.add.image(0, 0, 'ui_pack_panel_modal');
      decorImg.setDisplaySize(modalW - 12, modalH - 12);
      decorImg.setAlpha(0.28);
      modal.add(decorImg);
    }

    // Tiêu đề modal
    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 28, '🏆 BẢNG XẾP HẠNG SINH TỒN (SURVIVAL SCORE)', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5, 0.5);

    const subtitle = HDTextHelper.createText(this, 0, -modalH / 2 + 48, '❖ Top 10 Hàng Tuần (WEEKLY) & Thứ Hạng Xung Quanh Bạn ❖', {
      fontSize: '11px',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);

    // Tiêu đề các cột
    const tableHeaderY = -modalH / 2 + 76;
    const headerRank = HDTextHelper.createText(this, -modalW / 2 + 40, tableHeaderY, 'HẠNG', { fontSize: '11px', fontStyle: 'bold', color: '#c8963e' });
    const headerName = HDTextHelper.createText(this, -modalW / 2 + 120, tableHeaderY, 'NGƯỜI CHƠI', { fontSize: '11px', fontStyle: 'bold', color: '#c8963e' });
    const headerDay = HDTextHelper.createText(this, modalW / 2 - 240, tableHeaderY, 'NGÀY', { fontSize: '11px', fontStyle: 'bold', color: '#c8963e' });
    const headerScore = HDTextHelper.createText(this, modalW / 2 - 60, tableHeaderY, 'ĐIỂM SỐ', { fontSize: '11px', fontStyle: 'bold', color: '#c8963e' }).setOrigin(1, 0);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0x5c4627, 0.6);
    divider.lineBetween(-modalW / 2 + 30, tableHeaderY + 20, modalW / 2 - 30, tableHeaderY + 20);

    // Container chứa danh sách các dòng điểm số
    const rowsContainer = this.add.container(0, 0);

    const statusText = HDTextHelper.createText(this, 0, 0, '⏳ Đang tải dữ liệu bảng xếp hạng...', {
      fontSize: '13px',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    // Nút đóng
    const closeBtn = this.add.container(0, modalH / 2 - 28);
    const closeBg = this.add.graphics();
    const renderCloseBtn = (hover: boolean) => {
      closeBg.clear();
      closeBg.fillStyle(hover ? 0x3d2817 : 0x1e150d, 0.95);
      closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
      closeBg.lineStyle(1.2, hover ? 0xf1c40f : 0x8a6d3b, 0.9);
      closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);
    };
    renderCloseBtn(false);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f5eedc'
    }).setOrigin(0.5, 0.5);

    const closeHit = this.add.zone(0, 0, 180, 32).setInteractive({ useHandCursor: true });
    closeHit.on('pointerover', () => {
      renderCloseBtn(true);
      closeText.setColor('#fff4da');
    });
    closeHit.on('pointerout', () => {
      renderCloseBtn(false);
      closeText.setColor('#f5eedc');
    });
    closeHit.on('pointerdown', () => this.closeActiveMenuModal());
    closeBtn.add([closeBg, closeText, closeHit]);

    modal.add([
      overlay,
      overlayHit,
      box,
      title,
      subtitle,
      headerRank,
      headerName,
      headerDay,
      headerScore,
      divider,
      rowsContainer,
      statusText,
      closeBtn
    ]);

    this.activeMenuModal = modal;

    // Tải dữ liệu từ LeaderboardService
    (async () => {
      try {
        const [topScores, aroundMe] = await Promise.all([
          LeaderboardService.getInstance().getTopScores(10, 'WEEKLY'),
          LeaderboardService.getInstance().getScoresAroundMe(3)
        ]);

        if (!modal.active || !this.sys.isActive()) return;
        statusText.setVisible(false);

        // Hiển thị thông tin thứ hạng của người chơi nếu có
        const myRankEntry = aroundMe?.find((e: P2LeaderboardEntry) => e.isMe) || topScores?.find((e: P2LeaderboardEntry) => e.isMe);
        if (myRankEntry) {
          subtitle.setText(`❖ Top 10 Hàng Tuần • Thứ hạng của bạn: #${myRankEntry.rank} (${myRankEntry.score.toLocaleString()} điểm) ❖`);
        }

        if (!topScores || topScores.length === 0) {
          statusText.setText('Chưa có dữ liệu xếp hạng trong tuần này.');
          statusText.setVisible(true);
          return;
        }

        const startY = tableHeaderY + 30;
        const rowHeight = 28;

        topScores.forEach((entry: P2LeaderboardEntry, idx: number) => {
          const rowY = startY + idx * rowHeight;
          const isTop3 = entry.rank <= 3;
          const rankColor = entry.rank === 1 ? '#f1c40f' : (entry.rank === 2 ? '#e0e0e0' : (entry.rank === 3 ? '#cd7f32' : '#cbd5e1'));

          const rowBg = this.add.graphics();
          if (entry.isMe) {
            rowBg.fillStyle(0x27ae60, 0.18);
            rowBg.fillRoundedRect(-modalW / 2 + 25, rowY - 12, modalW - 50, 24, 4);
          } else if (idx % 2 === 1) {
            rowBg.fillStyle(0xffffff, 0.03);
            rowBg.fillRoundedRect(-modalW / 2 + 25, rowY - 12, modalW - 50, 24, 4);
          }

          const rankText = HDTextHelper.createText(this, -modalW / 2 + 40, rowY, `#${entry.rank}`, {
            fontSize: '11px',
            fontStyle: isTop3 ? 'bold' : 'normal',
            color: rankColor
          }).setOrigin(0, 0.5);

          const nameText = HDTextHelper.createText(this, -modalW / 2 + 120, rowY, entry.displayName || 'Vô Danh', {
            fontSize: '11px',
            fontStyle: entry.isMe ? 'bold' : 'normal',
            color: entry.isMe ? '#2ecc71' : '#f5eedc'
          }).setOrigin(0, 0.5);

          const dayVal = entry.meta?.day ? `Ngày ${entry.meta.day}` : '-';
          const dayText = HDTextHelper.createText(this, modalW / 2 - 240, rowY, dayVal, {
            fontSize: '11px',
            color: '#94a3b8'
          }).setOrigin(0, 0.5);

          const scoreText = HDTextHelper.createText(this, modalW / 2 - 60, rowY, entry.score.toLocaleString(), {
            fontSize: '11.5px',
            fontStyle: 'bold',
            color: '#f39c12'
          }).setOrigin(1, 0.5);

          rowsContainer.add([rowBg, rankText, nameText, dayText, scoreText]);
        });
      } catch (err: any) {
        console.warn('[MainMenuScene] Lỗi nạp bảng xếp hạng:', err);
        statusText.setText('Không thể kết nối máy chủ xếp hạng.');
        statusText.setVisible(true);
      }
    })();
  }
}
