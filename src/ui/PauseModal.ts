/**
 * HOLLOW WOODS V1.1 - GATE 1C
 * HD PAUSE MODAL ARCHITECTURE
 * Khung chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360), kích thước 480×370 px
 */

import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU } from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';

export interface PauseModalCallbacks {
  onResume: () => void;
  onSaveManual: () => boolean;
  onReloadCheckpoint: () => void;
}

export class PauseModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private callbacks: PauseModalCallbacks;
  public isOpen: boolean = false;
  private saveStatusText!: Phaser.GameObjects.Text;
  private lastToggleTime: number = 0;

  // C4-132-07: Các phần tử hiển thị âm lượng trong PauseModal
  private masterValText!: Phaser.GameObjects.Text;
  private bgmValText!: Phaser.GameObjects.Text;
  private sfxValText!: Phaser.GameObjects.Text;
  private muteBtnText!: Phaser.GameObjects.Text;
  private muteBtnBg!: Phaser.GameObjects.Graphics;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene, callbacks: PauseModalCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9800);

    this.buildUI();
    this.container.setVisible(false);
  }

  private buildUI(): void {
    const modalW = 480;
    const modalH = 370;
    const modalX = (1280 - modalW) / 2; // 400
    const modalY = (720 - modalH) / 2;  // 175

    // 1. Lớp phủ đen mờ toàn màn hình HD 1280×720 (ngăn chặn click xuyên thấu)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.78);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung modal chính phong cách gothic sẫm màu chuẩn HD
    const box = this.scene.add.graphics();
    box.fillStyle(0x0d1118, 0.98);
    box.fillRoundedRect(modalX, modalY, modalW, modalH, 8);
    box.lineStyle(2, 0xd4af37, 0.95);
    box.strokeRoundedRect(modalX, modalY, modalW, modalH, 8);
    box.lineStyle(1, 0x4a3b22, 0.7);
    box.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 6);

    // Tiêu đề
    const title = HDTextHelper.createText(this.scene, 640, modalY + 24, 'TẠM DỪNG HÀNH TRÌNH [ESC]', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Nút đóng nhanh [✕]
    const closeBtn = HDTextHelper.createText(this.scene, modalX + modalW - 25, modalY + 24, '✕', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.close();
      this.callbacks.onResume();
    });

    this.saveStatusText = HDTextHelper.createText(this.scene, 640, modalY + 46, '', {
      fontSize: '12px',
      color: '#2ecc71'
    }).setOrigin(0.5, 0.5);

    // 3. Các nút bấm chức năng chuẩn HD (Rộng 340px, cao 32px)
    let btnY = modalY + 74;

    // Nút 1: Tiếp tục
    const resumeBtn = this.createButton(640, btnY, '▶ TIẾP TỤC TRÒ CHƠI', '#2ecc71', () => {
      this.close();
      this.callbacks.onResume();
    }, 340, 32);

    btnY += 36;
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
    }, 340, 32);

    btnY += 36;
    // Nút 3: Tải lại Checkpoint
    const reloadBtn = this.createButton(640, btnY, '↺ NẠP LẠI ĐIỂM LƯU GẦN NHẤT', '#3498db', () => {
      if (SaveManager.hasSave()) {
        this.close();
        this.callbacks.onReloadCheckpoint();
      } else {
        this.saveStatusText.setText('Không tìm thấy điểm lưu nào để nạp!');
        this.saveStatusText.setColor('#e74c3c');
      }
    }, 340, 32);

    btnY += 36;
    // Nút 4: Quay về Menu
    const quitBtn = this.createButton(640, btnY, '🏠 QUAY VỀ MENU CHÍNH', '#95a5a6', () => {
      // Tự động lưu trước khi thoát
      this.callbacks.onSaveManual();
      this.close();
      this.scene.scene.stop('GameScene');
      this.scene.scene.stop('UIScene');
      this.scene.scene.start(SCENE_MAIN_MENU);
    }, 340, 32);

    // 4. Bảng điều chỉnh âm lượng đa kênh (C4-132-07)
    const audioBox = this.scene.add.graphics();
    audioBox.fillStyle(0x0a0e14, 0.85);
    audioBox.fillRoundedRect(modalX + 20, modalY + 208, 440, 146, 6);
    audioBox.lineStyle(1, 0x3d4852, 0.7);
    audioBox.strokeRoundedRect(modalX + 20, modalY + 208, 440, 146, 6);

    const audioTitle = HDTextHelper.createText(this.scene, 640, modalY + 222, '🔊 ĐIỀU CHỈNH ÂM LƯỢNG', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const audio = AudioManager.getInstance();

    // Hàng 1: Âm Lượng Tổng & Nút Bật/Tắt
    const masterLabel = HDTextHelper.createText(this.scene, modalX + 35, modalY + 252, 'Âm Lượng Tổng:', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const decMasterBtn = this.createStepBtn(modalX + 175, modalY + 252, '[-]', () => {
      audio.setMasterVolume(audio.getMasterVolume() - 0.1);
    });

    this.masterValText = HDTextHelper.createText(this.scene, modalX + 207, modalY + 252, `${Math.round(audio.getMasterVolume() * 100)}%`, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#2ecc71'
    }).setOrigin(0.5, 0.5);

    const incMasterBtn = this.createStepBtn(modalX + 239, modalY + 252, '[+]', () => {
      audio.setMasterVolume(audio.getMasterVolume() + 0.1);
    });

    const muteLabel = HDTextHelper.createText(this.scene, modalX + 300, modalY + 252, 'Bật/Tắt:', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const muteBtnContainer = this.scene.add.container(modalX + 380, modalY + 252);
    this.muteBtnBg = this.scene.add.graphics();
    this.muteBtnText = HDTextHelper.createText(this.scene, 0, 0, audio.isMuted ? '🔇 TẮT' : '🔊 BẬT', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: audio.isMuted ? '#ff7675' : '#2ecc71'
    }).setOrigin(0.5, 0.5);
    muteBtnContainer.add([this.muteBtnBg, this.muteBtnText]);
    muteBtnContainer.setSize(76, 22);
    muteBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-38, -11, 76, 22), Phaser.Geom.Rectangle.Contains);
    if (muteBtnContainer.input) muteBtnContainer.input.cursor = 'pointer';
    muteBtnContainer.on('pointerdown', () => {
      audio.toggleMute();
      this.updateVolumeTexts();
    });

    // Hàng 2: Nhạc Nền (BGM) & Hiệu Ứng (SFX)
    const bgmLabel = HDTextHelper.createText(this.scene, modalX + 35, modalY + 288, 'Nhạc Nền:', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const decBgmBtn = this.createStepBtn(modalX + 130, modalY + 288, '[-]', () => {
      audio.setMusicVolume(audio.getMusicVolume() - 0.1);
    });

    this.bgmValText = HDTextHelper.createText(this.scene, modalX + 158, modalY + 288, `${Math.round(audio.getMusicVolume() * 100)}%`, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#3498db'
    }).setOrigin(0.5, 0.5);

    const incBgmBtn = this.createStepBtn(modalX + 186, modalY + 288, '[+]', () => {
      audio.setMusicVolume(audio.getMusicVolume() + 0.1);
    });

    const sfxLabel = HDTextHelper.createText(this.scene, modalX + 245, modalY + 288, 'Hiệu Ứng:', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const decSfxBtn = this.createStepBtn(modalX + 340, modalY + 288, '[-]', () => {
      audio.setSfxVolume(audio.getSfxVolume() - 0.1);
    });

    this.sfxValText = HDTextHelper.createText(this.scene, modalX + 368, modalY + 288, `${Math.round(audio.getSfxVolume() * 100)}%`, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#e67e22'
    }).setOrigin(0.5, 0.5);

    const incSfxBtn = this.createStepBtn(modalX + 396, modalY + 288, '[+]', () => {
      audio.setSfxVolume(audio.getSfxVolume() + 0.1);
    });

    // Hàng 3: Ghi chú phím tắt
    const tipText = HDTextHelper.createText(this.scene, 640, modalY + 328, '💡 Bấm [-] [+] để chỉnh âm lượng • Phím [M]: Bật/Tắt tiếng nhanh', {
      fontSize: '10.5px',
      fontStyle: 'italic',
      color: '#7f8c8d'
    }).setOrigin(0.5, 0.5);

    this.container.add([
      overlay, box, title, closeBtn, this.saveStatusText,
      resumeBtn, saveBtn, reloadBtn, quitBtn,
      audioBox, audioTitle,
      masterLabel, decMasterBtn, this.masterValText, incMasterBtn,
      muteLabel, muteBtnContainer,
      bgmLabel, decBgmBtn, this.bgmValText, incBgmBtn,
      sfxLabel, decSfxBtn, this.sfxValText, incSfxBtn,
      tipText
    ]);

    this.updateVolumeTexts();
  }

  private createStepBtn(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a2332, 0.95);
    bg.fillRoundedRect(-12, -10, 24, 20, 4);
    bg.lineStyle(1, 0x4a5568, 0.9);
    bg.strokeRoundedRect(-12, -10, 24, 20, 4);

    const txt = HDTextHelper.createText(this.scene, 0, 0, text, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ecf0f1'
    }).setOrigin(0.5, 0.5);

    btn.add([bg, txt]);
    btn.setSize(24, 20);
    btn.setInteractive(new Phaser.Geom.Rectangle(-12, -10, 24, 20), Phaser.Geom.Rectangle.Contains);
    if (btn.input) btn.input.cursor = 'pointer';

    btn.on('pointerdown', () => {
      onClick();
      this.updateVolumeTexts();
    });
    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2d3748, 1);
      bg.fillRoundedRect(-12, -10, 24, 20, 4);
      bg.lineStyle(1, 0xf1c40f, 1);
      bg.strokeRoundedRect(-12, -10, 24, 20, 4);
    });
    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a2332, 0.95);
      bg.fillRoundedRect(-12, -10, 24, 20, 4);
      bg.lineStyle(1, 0x4a5568, 0.9);
      bg.strokeRoundedRect(-12, -10, 24, 20, 4);
    });
    return btn;
  }

  private updateVolumeTexts(): void {
    const audio = AudioManager.getInstance();
    if (this.masterValText) {
      this.masterValText.setText(`${Math.round(audio.getMasterVolume() * 100)}%`);
    }
    if (this.bgmValText) {
      this.bgmValText.setText(`${Math.round(audio.getMusicVolume() * 100)}%`);
    }
    if (this.sfxValText) {
      this.sfxValText.setText(`${Math.round(audio.getSfxVolume() * 100)}%`);
    }
    if (this.muteBtnText && this.muteBtnBg) {
      const isMuted = audio.isMuted;
      this.muteBtnText.setText(isMuted ? '🔇 TẮT' : '🔊 BẬT');
      this.muteBtnText.setColor(isMuted ? '#ff7675' : '#2ecc71');
      this.muteBtnBg.clear();
      this.muteBtnBg.fillStyle(isMuted ? 0x2c1417 : 0x14281f, 0.95);
      this.muteBtnBg.fillRoundedRect(-38, -11, 76, 22, 4);
      this.muteBtnBg.lineStyle(1, isMuted ? 0xe74c3c : 0x2ecc71, 0.85);
      this.muteBtnBg.strokeRoundedRect(-38, -11, 76, 22, 4);
    }
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void, btnW = 360, btnH = 44): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x141a24, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.lineStyle(1.5, 0x4a5568, 0.85);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

    const txt = HDTextHelper.createText(this.scene, 0, 0, text, {
      fontSize: btnH >= 40 ? '15px' : '13.5px',
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
      bg.clear();
      bg.fillStyle(0x222c3d, 1);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(2, 0xd4af37, 1);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor('#ffffff');
    });

    btnContainer.on('pointerout', () => {
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
   * C4-13-09: Dọn dẹp đối tượng hiển thị Modal tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    if (this.container) {
      this.container.removeAll(true);
      this.container.destroy();
    }
  }
}
