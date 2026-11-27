/**
 * HOLLOW WOODS V1.5 - GATE 1C & V15-23
 * HD PAUSE MODAL ARCHITECTURE
 * Khung chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360).
 * Tích hợp:
 * 1. Các nút hành động chính (Tiếp tục, Lưu thủ công, Nạp Checkpoint, Quay về Menu, Hướng dẫn phím)
 * 2. Cấu hình hệ thống: Thanh kéo Slider BGM, SFX, Master, Bật/Tắt âm thanh, Toggle Rung Màn Hình (Screen Shake), Đồ họa
 * 3. Nút Xóa Bản Lưu an toàn với xác nhận 2 lần (2-Step Safe Confirmation)
 * 4. Bảng hướng dẫn phím bấm minh họa Keycap Badges trực quan 3 nhóm (Di chuyển, Sinh tồn, Tự vệ)
 */

import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU } from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';
import { GraphicsQualitySystem } from '../systems/GraphicsQualitySystem';
import { SettingsManager } from '../systems/SettingsManager';
import { SettingsUIHelper } from './SettingsUIHelper';
import { KeycapBadgeHelper } from './KeycapBadgeHelper';

export interface PauseModalCallbacks {
  onResume: () => void;
  onSaveManual: () => boolean;
  onReloadCheckpoint: () => void;
  onEmergencyUnstuck?: () => void;
}

export class PauseModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private callbacks: PauseModalCallbacks;
  public isOpen: boolean = false;
  private saveStatusText!: Phaser.GameObjects.Text;
  private lastToggleTime: number = 0;

  // Hiển thị chất lượng đồ họa & sương mù / ánh sáng
  private graphicsQualityBtnText!: Phaser.GameObjects.Text;
  private graphicsQualityBtnBg!: Phaser.GameObjects.Graphics;
  private graphicsDescText!: Phaser.GameObjects.Text;
  private unsubscribeQuality?: () => void;

  // Hộp thoại phụ hướng dẫn phím (Controls Guide Sub-Modal)
  private guideOverlayContainer?: Phaser.GameObjects.Container;
  private onKeydownH?: () => void;

  // Sliders và toggles tham chiếu
  private bgmSliderControl?: { container: Phaser.GameObjects.Container; setValue: (val: number) => void; getValue: () => number };
  private sfxSliderControl?: { container: Phaser.GameObjects.Container; setValue: (val: number) => void; getValue: () => number };
  private masterSliderControl?: { container: Phaser.GameObjects.Container; setValue: (val: number) => void; getValue: () => number };
  private reducedMotionToggleControl?: { container: Phaser.GameObjects.Container; setEnabled: (val: boolean) => void };
  private shakeToggleControl?: { container: Phaser.GameObjects.Container; setEnabled: (val: boolean) => void };
  private panicToggleControl?: { container: Phaser.GameObjects.Container; setEnabled: (val: boolean) => void };
  private lightMotionToggleControl?: { container: Phaser.GameObjects.Container; setEnabled: (val: boolean) => void };
  private panicIntensityControl?: { container: Phaser.GameObjects.Container; setValue: (val: 'LOW' | 'STANDARD' | 'HIGH') => void };
  private muteBtnTxt?: Phaser.GameObjects.Text;
  private muteBtnBg?: Phaser.GameObjects.Graphics;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene, callbacks: PauseModalCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9800);

    this.unsubscribeQuality = GraphicsQualitySystem.getInstance().onQualityChange(() => {
      this.updateGraphicsQualityText();
    });

    this.buildUI();
    this.container.setVisible(false);

    // Lắng nghe phím H để mở hướng dẫn phím khi đang mở Pause Menu (lưu handler để gỡ khi destroy)
    if (this.scene.input && this.scene.input.keyboard) {
      this.onKeydownH = () => {
        if (this.isOpen) {
          this.toggleGuideOverlay();
        }
      };
      this.scene.input.keyboard.on('keydown-H', this.onKeydownH);
    }
  }

  private buildUI(): void {
    const modalW = 540;
    const modalH = 580;
    const modalX = (1280 - modalW) / 2; // 370
    const modalY = (720 - modalH) / 2;  // 70

    // 1. Lớp phủ đen mờ toàn màn hình HD 1280×720 (ngăn chặn click xuyên thấu)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.78);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Nếu đang mở bảng hướng dẫn phụ, đóng bảng hướng dẫn trước
      if (this.guideOverlayContainer && this.guideOverlayContainer.visible) {
        this.toggleGuideOverlay();
        return;
      }
      // Nhấp chuột ra ngoài khung menu Pause để đóng / tiếp tục trò chơi (BUG-037)
      if (pointer.x < modalX || pointer.x > modalX + modalW || pointer.y < modalY || pointer.y > modalY + modalH) {
        this.close();
      }
    });

    // 2. Khung modal chính phong cách gothic sẫm màu chuẩn HD
    let panelImg: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_panel_modal')) {
      panelImg = this.scene.add.image(640, 360, 'ui_pack_panel_modal');
      panelImg.setDisplaySize(modalW + 24, modalH + 24);
      panelImg.setTint(0xbaa187);
      panelImg.setAlpha(0.65);
    }

    const box = this.scene.add.graphics();
    box.fillStyle(0x0d1118, 0.98);
    box.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    box.lineStyle(2, 0xd4af37, 0.95);
    box.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);
    box.lineStyle(1, 0x4a3b22, 0.7);
    box.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 8);

    // Tiêu đề
    const title = HDTextHelper.createText(this.scene, 640, modalY + 22, 'TẠM DỪNG HÀNH TRÌNH [ESC]', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Nút đóng nhanh [✕]
    const closeBtn = HDTextHelper.createText(this.scene, modalX + modalW - 25, modalY + 22, '✕', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.close();
      this.callbacks.onResume();
    });

    this.saveStatusText = HDTextHelper.createText(this.scene, 640, modalY + 44, '', {
      fontSize: '11.5px',
      color: '#2ecc71'
    }).setOrigin(0.5, 0.5);

    // 3. Các nút bấm chức năng chính (Rộng 380px, cao 26px)
    let btnY = modalY + 68;

    // Nút 1: Tiếp tục
    const resumeBtn = this.createButton(640, btnY, '▶ TIẾP TỤC TRÒ CHƠI', '#2ecc71', () => {
      this.close();
      this.callbacks.onResume();
    }, 380, 26);

    btnY += 30;
    // Nút 2: Lưu thủ công
    const saveBtn = this.createButton(640, btnY, '💾 LƯU GAME THỦ CÔNG', '#f39c12', () => {
      const success = this.callbacks.onSaveManual();
      if (success) {
        this.saveStatusText.setText('✔ Đã lưu tiến trình thành công vào bộ nhớ!');
        this.saveStatusText.setColor('#2ecc71');
      } else {
        this.saveStatusText.setText('✖ Không thể lưu tiến trình!');
        this.saveStatusText.setColor('#e74c3c');
      }
    }, 380, 26);

    btnY += 30;
    // Nút 3: Tải lại Checkpoint
    const reloadBtn = this.createButton(640, btnY, '↺ NẠP LẠI ĐIỂM LƯU GẦN NHẤT', '#3498db', () => {
      if (SaveManager.hasSave()) {
        this.close();
        this.callbacks.onReloadCheckpoint();
      } else {
        this.saveStatusText.setText('Không tìm thấy điểm lưu nào để nạp!');
        this.saveStatusText.setColor('#e74c3c');
      }
    }, 380, 26);

    btnY += 30;
    // Nút 4: Gỡ Kẹt Về Điểm An Toàn [F8] (V15-34)
    const unstuckBtn = this.createButton(640, btnY, '🛡️ GỠ KẸT VỀ ĐIỂM AN TOÀN [F8]', '#e67e22', () => {
      this.close();
      if (this.callbacks.onEmergencyUnstuck) {
        this.callbacks.onEmergencyUnstuck();
      }
    }, 380, 26);

    btnY += 30;
    // Nút 5: Hướng dẫn phím bấm trực quan (Keycaps)
    const guideBtn = this.createButton(640, btnY, '📜 BẢNG PHÍM ĐIỀU KHIỂN & HƯỚNG DẪN [H]', '#b8860b', () => {
      this.toggleGuideOverlay();
    }, 380, 26);

    btnY += 30;
    // Nút 6: Quay về Menu
    const quitBtn = this.createButton(640, btnY, '🏠 QUAY VỀ MENU CHÍNH', '#95a5a6', () => {
      this.callbacks.onSaveManual();
      this.close();
      this.scene.scene.stop('GameScene');
      this.scene.scene.stop('UIScene');
      this.scene.scene.start(SCENE_MAIN_MENU);
    }, 380, 26);

    // 4. Bảng điều chỉnh cấu hình hệ thống & âm lượng đa kênh
    const settingsBox = this.scene.add.graphics();
    const sBoxY = modalY + 252;
    const sBoxH = modalH - 266;
    settingsBox.fillStyle(0x0a0e14, 0.92);
    settingsBox.fillRoundedRect(modalX + 14, sBoxY, modalW - 28, sBoxH, 6);
    settingsBox.lineStyle(1, 0x3d4852, 0.7);
    settingsBox.strokeRoundedRect(modalX + 14, sBoxY, modalW - 28, sBoxH, 6);

    const settings = SettingsManager.getInstance();

    // --- HW-FX-31: Tab Bar: [ 🔊 ÂM LƯỢNG & TIẾN TRÌNH ] và [ 👁️ HÌNH ẢNH & TIẾP CẬN ] ---
    let activeSettingsTab: 'AUDIO' | 'VISUALS' = 'AUDIO';

    const tabAudioBtn = this.scene.add.container(modalX + 138, sBoxY + 15);
    const tabAudioBg = this.scene.add.graphics();
    const tabAudioTxt = HDTextHelper.createText(this.scene, 0, 0, '🔊 ÂM LƯỢNG', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f1c40f'
    }).setOrigin(0.5, 0.5);
    tabAudioBtn.add([tabAudioBg, tabAudioTxt]);
    tabAudioBtn.setSize(220, 22);
    tabAudioBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -11, 220, 22), Phaser.Geom.Rectangle.Contains);
    if (tabAudioBtn.input) tabAudioBtn.input.cursor = 'pointer';

    const tabVisualsBtn = this.scene.add.container(modalX + 374, sBoxY + 15);
    const tabVisualsBg = this.scene.add.graphics();
    const tabVisualsTxt = HDTextHelper.createText(this.scene, 0, 0, '👁️ HÌNH ẢNH & TIẾP CẬN', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);
    tabVisualsBtn.add([tabVisualsBg, tabVisualsTxt]);
    tabVisualsBtn.setSize(220, 22);
    tabVisualsBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -11, 220, 22), Phaser.Geom.Rectangle.Contains);
    if (tabVisualsBtn.input) tabVisualsBtn.input.cursor = 'pointer';

    const renderTabs = () => {
      tabAudioBg.clear();
      const isAudio = activeSettingsTab === 'AUDIO';
      tabAudioBg.fillStyle(isAudio ? 0x2b2210 : 0x141a24, 0.95);
      tabAudioBg.fillRoundedRect(-110, -11, 220, 22, 4);
      tabAudioBg.lineStyle(1.5, isAudio ? 0xf1c40f : 0x4a5568, 0.9);
      tabAudioBg.strokeRoundedRect(-110, -11, 220, 22, 4);
      tabAudioTxt.setColor(isAudio ? '#f1c40f' : '#94a3b8');

      tabVisualsBg.clear();
      const isVisuals = activeSettingsTab === 'VISUALS';
      tabVisualsBg.fillStyle(isVisuals ? 0x2b2210 : 0x141a24, 0.95);
      tabVisualsBg.fillRoundedRect(-110, -11, 220, 22, 4);
      tabVisualsBg.lineStyle(1.5, isVisuals ? 0xf1c40f : 0x4a5568, 0.9);
      tabVisualsBg.strokeRoundedRect(-110, -11, 220, 22, 4);
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
    const audioTabGroup = this.scene.add.container(0, 0);

    // Thanh trượt Nhạc Nền (BGM Slider)
    this.bgmSliderControl = SettingsUIHelper.createVolumeSlider(
      this.scene,
      modalX + 310,
      sBoxY + 52,
      '🎵 Nhạc Nền (BGM):',
      settings.getMusicVolume(),
      (val) => settings.setMusicVolume(val),
      { trackWidth: 160, fillColor: 0x3498db, labelWidth: 130 }
    );

    // Thanh trượt Hiệu Ứng (SFX Slider)
    this.sfxSliderControl = SettingsUIHelper.createVolumeSlider(
      this.scene,
      modalX + 310,
      sBoxY + 88,
      '🔊 Hiệu Ứng (SFX):',
      settings.getSfxVolume(),
      (val) => settings.setSfxVolume(val),
      { trackWidth: 160, fillColor: 0xe67e22, labelWidth: 130 }
    );

    // Âm Lượng Tổng & Nút Bật/Tắt Âm Thanh
    this.masterSliderControl = SettingsUIHelper.createVolumeSlider(
      this.scene,
      modalX + 250,
      sBoxY + 124,
      '🎚️ Âm Lượng Tổng:',
      settings.getMasterVolume(),
      (val) => settings.setMasterVolume(val),
      { trackWidth: 110, fillColor: 0x2ecc71, labelWidth: 120 }
    );

    // Nút Mute
    const muteBtnContainer = this.scene.add.container(modalX + modalW - 74, sBoxY + 124);
    this.muteBtnBg = this.scene.add.graphics();
    this.muteBtnTxt = HDTextHelper.createText(this.scene, 0, 0, settings.isMuted() ? '🔇 TẮT' : '🔊 BẬT', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: settings.isMuted() ? '#ff7675' : '#2ecc71'
    }).setOrigin(0.5, 0.5);
    muteBtnContainer.add([this.muteBtnBg, this.muteBtnTxt]);
    muteBtnContainer.setSize(68, 22);
    muteBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-34, -11, 68, 22), Phaser.Geom.Rectangle.Contains);
    if (muteBtnContainer.input) muteBtnContainer.input.cursor = 'pointer';

    const renderMute = (isHover: boolean = false) => {
      if (!this.muteBtnBg || !this.muteBtnTxt) return;
      this.muteBtnBg.clear();
      const muted = settings.isMuted();
      const fill = muted ? (isHover ? 0x3d1c21 : 0x2b1418) : (isHover ? 0x1b3827 : 0x14281e);
      const stroke = muted ? 0xe74c3c : 0x2ecc71;
      this.muteBtnBg.fillStyle(fill, 0.95);
      this.muteBtnBg.fillRoundedRect(-34, -11, 68, 22, 4);
      this.muteBtnBg.lineStyle(1, stroke, 0.85);
      this.muteBtnBg.strokeRoundedRect(-34, -11, 68, 22, 4);
      this.muteBtnTxt.setText(muted ? '🔇 TẮT' : '🔊 BẬT');
      this.muteBtnTxt.setColor(muted ? '#ff7675' : '#2ecc71');
    };
    renderMute();

    muteBtnContainer.on('pointerover', () => renderMute(true));
    muteBtnContainer.on('pointerout', () => renderMute(false));
    muteBtnContainer.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      settings.toggleMute();
      renderMute(true);
    });

    const dividerAudio = this.scene.add.graphics();
    dividerAudio.lineStyle(1, 0x243142, 0.8);
    dividerAudio.lineBetween(modalX + 24, sBoxY + 154, modalX + modalW - 24, sBoxY + 154);

    // Nút Xóa Bản Lưu An Toàn
    const clearSaveBtn = SettingsUIHelper.createSafeClearSaveButton(
      this.scene,
      640,
      sBoxY + 192,
      () => {
        SaveManager.clearSave();
        this.saveStatusText.setText('✔ Đã xóa toàn bộ tiến trình bản lưu!');
        this.saveStatusText.setColor('#e74c3c');
      },
      360,
      26
    );

    const tipTextAudio = HDTextHelper.createText(this.scene, 640, sBoxY + 246, '💡 Phím [F8]: Gỡ Kẹt Khẩn Cấp • [H]: Xem Phím • [ESC]: Tiếp Tục', {
      fontSize: '10.5px',
      fontStyle: 'italic',
      color: '#7f8c8d'
    }).setOrigin(0.5, 0.5);

    audioTabGroup.add([
      this.bgmSliderControl.container,
      this.sfxSliderControl.container,
      this.masterSliderControl.container,
      muteBtnContainer,
      dividerAudio,
      clearSaveBtn,
      tipTextAudio
    ]);

    // --- TAB 2: HÌNH ẢNH & TIẾP CẬN ---
    const visualsTabGroup = this.scene.add.container(0, 0);

    // 1. Mục Đồ Họa & Sương Mù
    const graphicsLabel = HDTextHelper.createText(this.scene, modalX + 28, sBoxY + 38, '🖥️ Đồ Họa:', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const graphicsBtnContainer = this.scene.add.container(modalX + 355, sBoxY + 38);
    this.graphicsQualityBtnBg = this.scene.add.graphics();
    this.graphicsQualityBtnText = HDTextHelper.createText(this.scene, 0, 0, '🌟 CAO (HIGH)', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f1c40f'
    }).setOrigin(0.5, 0.5);
    graphicsBtnContainer.add([this.graphicsQualityBtnBg, this.graphicsQualityBtnText]);
    graphicsBtnContainer.setSize(180, 22);
    graphicsBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-90, -11, 180, 22), Phaser.Geom.Rectangle.Contains);
    if (graphicsBtnContainer.input) graphicsBtnContainer.input.cursor = 'pointer';
    graphicsBtnContainer.on('pointerdown', () => {
      GraphicsQualitySystem.getInstance().cycleQuality();
      this.updateGraphicsQualityText();
    });

    this.graphicsDescText = HDTextHelper.createText(this.scene, modalX + 28, sBoxY + 54, '', {
      fontSize: '9px',
      fontStyle: 'italic',
      color: '#94a3b8'
    }).setOrigin(0, 0.5);

    // 2. Giảm Chuyển Động (Reduced Motion Toggle)
    this.reducedMotionToggleControl = SettingsUIHelper.createGenericToggle(
      this.scene,
      modalX + 250,
      sBoxY + 78,
      '♿ Giảm Chuyển Động (Reduced Motion):',
      'Tắt rung giật & dao động thị giác để bảo vệ mắt.',
      settings.isReducedMotionEnabled(),
      (enabled) => {
        settings.setReducedMotionEnabled(enabled);
        this.updateVolumeTexts();
      },
      modalW - 56
    );

    // 3. Rung Màn Hình (Screen Shake Toggle)
    this.shakeToggleControl = SettingsUIHelper.createGenericToggle(
      this.scene,
      modalX + 250,
      sBoxY + 118,
      '📳 Rung Màn Hình (Screen Shake):',
      'Rung giật camera khi nguy kịch hoặc bị tập kích.',
      settings.isScreenShakeEnabled(),
      (enabled) => settings.setScreenShakeEnabled(enabled),
      modalW - 56
    );

    // 4. Hiệu ứng Hoảng Sợ (Panic Visuals Toggle)
    this.panicToggleControl = SettingsUIHelper.createGenericToggle(
      this.scene,
      modalX + 250,
      sBoxY + 158,
      '👁️ Hiệu Ứng Hoảng Sợ (Panic Visuals):',
      'Sương tím & vệt đỏ kinh dị tâm lý khi Tinh Thần <40%.',
      settings.isPanicEffectsEnabled(),
      (enabled) => settings.setPanicEffectsEnabled(enabled),
      modalW - 56
    );

    // 5. Dao Động Ánh Sáng (Light Motion Toggle)
    this.lightMotionToggleControl = SettingsUIHelper.createGenericToggle(
      this.scene,
      modalX + 250,
      sBoxY + 198,
      '✨ Dao Động Ánh Sáng (Light Motion):',
      'Nhịp thở FOW & đèn lồng (tự tắt khi Reduced Motion ON).',
      settings.isRawLightMotionEnabled(),
      (enabled) => settings.setLightMotionEnabled(enabled),
      modalW - 56
    );

    // 6. Cường Độ Hoảng Sợ (Panic Intensity Selector)
    this.panicIntensityControl = SettingsUIHelper.createIntensitySelector(
      this.scene,
      modalX + 250,
      sBoxY + 238,
      '🎨 Cường Độ Hoảng Sợ (Intensity):',
      'Độ đậm nhạt của lớp sương và viền hoảng sợ trang trí.',
      settings.getPanicIntensity(),
      () => settings.cyclePanicIntensity(),
      modalW - 56
    );

    const tipTextVisuals = HDTextHelper.createText(this.scene, 640, sBoxY + 276, '💡 Reduced Motion ưu tiên cao nhất, chặn toàn bộ rung giật & dao động', {
      fontSize: '10px',
      fontStyle: 'italic',
      color: '#7f8c8d'
    }).setOrigin(0.5, 0.5);

    visualsTabGroup.add([
      graphicsLabel,
      graphicsBtnContainer,
      this.graphicsDescText,
      this.reducedMotionToggleControl.container,
      this.shakeToggleControl.container,
      this.panicToggleControl.container,
      this.lightMotionToggleControl.container,
      this.panicIntensityControl.container,
      tipTextVisuals
    ]);

    renderTabs();

    const pauseElements: Phaser.GameObjects.GameObject[] = [
      overlay,
      ...(panelImg ? [panelImg] : []),
      box, title, closeBtn, this.saveStatusText,
      resumeBtn, saveBtn, reloadBtn, unstuckBtn, guideBtn, quitBtn,
      settingsBox,
      tabAudioBtn, tabVisualsBtn,
      audioTabGroup, visualsTabGroup
    ];
    this.container.add(pauseElements);

    this.updateGraphicsQualityText();
  }

  /**
   * Bật/Tắt hiển thị bảng Keycap Badges hướng dẫn phím bấm
   */
  public isGuideOpen(): boolean {
    return Boolean(this.guideOverlayContainer);
  }

  public toggleGuideOverlay(): void {
    if (this.guideOverlayContainer) {
      this.guideOverlayContainer.destroy();
      this.guideOverlayContainer = undefined;
      return;
    }

    const overlay = this.scene.add.container(640, 360).setDepth(9950);
    const w = 700;
    const h = 500;

    const bgCover = this.scene.add.graphics();
    bgCover.fillStyle(0x000000, 0.85);
    bgCover.fillRect(-640, -360, 1280, 720);
    bgCover.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);

    const box = this.scene.add.graphics();
    box.fillStyle(0x10151f, 0.98);
    box.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    box.lineStyle(2, 0xd4af37, 0.95);
    box.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    const title = HDTextHelper.createText(this.scene, 0, -h / 2 + 25, '📜 BẢNG PHÍM ĐIỀU KHIỂN & SINH TỒN [H]', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const closeBtn = HDTextHelper.createText(this.scene, w / 2 - 25, -h / 2 + 25, '✕', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleGuideOverlay());

    const guideContent = KeycapBadgeHelper.buildControlsGuideContent(
      this.scene,
      -w / 2 + 25,
      -h / 2 + 55,
      w - 50
    );

    const closeBottomBtn = this.createButton(0, h / 2 - 25, '✕ ĐÓNG BẢNG HƯỚNG DẪN [ESC / H]', '#ecf0f1', () => {
      this.toggleGuideOverlay();
    }, 280, 26);

    overlay.add([bgCover, box, title, closeBtn, guideContent, closeBottomBtn]);
    this.guideOverlayContainer = overlay;
  }

  private updateGraphicsQualityText(): void {
    if (
      !this.scene ||
      !this.scene.sys ||
      !this.graphicsQualityBtnText ||
      !this.graphicsQualityBtnText.scene ||
      !(this.graphicsQualityBtnText as any).context
    ) {
      return;
    }
    const gqs = GraphicsQualitySystem.getInstance();
    const settings = gqs.getSettings();
    let label = '';
    let color = '#2ecc71';
    let badgeColor = 0x14281f;
    let strokeColor = 0x2ecc71;

    if (settings.level === 'HIGH') {
      label = '🌟 CAO (HIGH - 1.0x Buffer)';
      color = '#f1c40f';
      badgeColor = 0x2e2305;
      strokeColor = 0xf1c40f;
    } else if (settings.level === 'MEDIUM') {
      label = '⚡ CÂN BẰNG (MEDIUM - 0.5x Buffer)';
      color = '#3498db';
      badgeColor = 0x0e243b;
      strokeColor = 0x3498db;
    } else {
      label = '🍃 MƯỢT MÀ (LOW - 0.35x Buffer)';
      color = '#2ecc71';
      badgeColor = 0x0e2b1b;
      strokeColor = 0x2ecc71;
    }
    this.graphicsQualityBtnText.setText(label);
    this.graphicsQualityBtnText.setColor(color);
    if (this.graphicsQualityBtnBg) {
      this.graphicsQualityBtnBg.clear();
      this.graphicsQualityBtnBg.fillStyle(badgeColor, 0.95);
      this.graphicsQualityBtnBg.fillRoundedRect(-110, -11, 220, 22, 4);
      this.graphicsQualityBtnBg.lineStyle(1.5, strokeColor, 0.9);
      this.graphicsQualityBtnBg.strokeRoundedRect(-110, -11, 220, 22, 4);
    }
    if (this.graphicsDescText) {
      this.graphicsDescText.setText(`Buffer: ${settings.lightingScale}x • Sương: ${settings.maxFogLayers} lớp • Đom đóm: ${settings.maxFireflies}`);
    }
  }

  public updateVolumeTexts(): void {
    const settings = SettingsManager.getInstance();
    if (this.masterSliderControl) {
      this.masterSliderControl.setValue(settings.getMasterVolume());
    }
    if (this.bgmSliderControl) {
      this.bgmSliderControl.setValue(settings.getMusicVolume());
    }
    if (this.sfxSliderControl) {
      this.sfxSliderControl.setValue(settings.getSfxVolume());
    }
    if (this.reducedMotionToggleControl) {
      this.reducedMotionToggleControl.setEnabled(settings.isReducedMotionEnabled());
    }
    if (this.shakeToggleControl) {
      this.shakeToggleControl.setEnabled(settings.isScreenShakeEnabled());
    }
    if (this.panicToggleControl) {
      this.panicToggleControl.setEnabled(settings.isPanicEffectsEnabled());
    }
    if (this.lightMotionToggleControl) {
      this.lightMotionToggleControl.setEnabled(settings.isRawLightMotionEnabled());
    }
    if (this.panicIntensityControl) {
      this.panicIntensityControl.setValue(settings.getPanicIntensity());
    }
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void, btnW = 360, btnH = 44): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);

    let btnSprite: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_btn_wood')) {
      btnSprite = this.scene.add.image(0, 0, 'ui_pack_btn_wood');
      btnSprite.setDisplaySize(btnW, btnH);
      btnSprite.setTint(0xbaa187);
      btnContainer.add(btnSprite);
    }

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x141a24, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.lineStyle(1.5, 0x4a5568, 0.85);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

    const txt = HDTextHelper.createText(this.scene, 0, 0, text, {
      fontSize: btnH >= 40 ? '15px' : '12.5px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    btnContainer.add([bg, txt]);
    btnContainer.setSize(btnW, btnH);
    btnContainer.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
    if (btnContainer.input) {
      btnContainer.input.cursor = 'pointer';
    }

    btnContainer.on('pointerdown', onClick);
    btnContainer.on('pointerover', () => {
      if (btnSprite && this.scene.textures.exists('ui_pack_btn_wood_hover')) {
        btnSprite.setTexture('ui_pack_btn_wood_hover');
      }
      bg.clear();
      bg.fillStyle(0x222c3d, 1);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(2, 0xd4af37, 1);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor('#ffffff');
    });

    btnContainer.on('pointerout', () => {
      if (btnSprite && this.scene.textures.exists('ui_pack_btn_wood')) {
        btnSprite.setTexture('ui_pack_btn_wood');
      }
      bg.clear();
      bg.fillStyle(0x141a24, 0.95);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(1.5, 0x4a5568, 0.85);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor(color);
    });

    return btnContainer;
  }

  public open(): void {
    const ui = this.scene as any;
    // Chặn mở khi đối thoại đang chạy (Mutual Exclusion)
    if (ui && ui.isDialogueActive) {
      return;
    }
    // Đóng các modal khác nếu đang mở
    if (ui && ui.craftingModal && ui.craftingModal.isOpen) {
      ui.craftingModal.close();
    }
    if (ui && ui.journalModal && ui.journalModal.isOpen) {
      ui.journalModal.close();
    }

    this.isOpen = true;
    this.container.setVisible(true);
    this.updateVolumeTexts();
    this.updateGraphicsQualityText();
    const summary = SaveManager.getSaveSummary();
    if (summary) {
      this.saveStatusText.setText(`Điểm lưu hiện tại: ${summary.checkpoint} (${summary.date})`);
      this.saveStatusText.setColor('#bdc3c7');
    } else {
      this.saveStatusText.setText('Chưa có file lưu nào trong phiên.');
      this.saveStatusText.setColor('#7f8c8d');
    }
    if (this.onOpen) {
      this.onOpen();
    }
  }

  public close(): void {
    if (this.guideOverlayContainer) {
      this.guideOverlayContainer.destroy();
      this.guideOverlayContainer = undefined;
    }
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) {
      this.onClose();
    }
  }

  public toggle(): void {
    const now = performance.now();
    if (now - this.lastToggleTime < 250) return;
    this.lastToggleTime = now;

    if (this.isOpen) this.close();
    else this.open();
  }

  /**
   * Dọn dẹp đối tượng hiển thị Modal tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    if (this.onKeydownH && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.off('keydown-H', this.onKeydownH);
      this.onKeydownH = undefined;
    }
    if (this.guideOverlayContainer) {
      this.guideOverlayContainer.destroy();
      this.guideOverlayContainer = undefined;
    }
    if (this.unsubscribeQuality) {
      this.unsubscribeQuality();
      this.unsubscribeQuality = undefined;
    }
    if (this.container) {
      this.container.removeAll(true);
      this.container.destroy();
    }
  }
}
