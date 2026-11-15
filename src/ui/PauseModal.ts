/**
 * HOLLOW WOODS V1.1 - GATE 1C
 * HD PAUSE MODAL ARCHITECTURE
 * Khung chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360), kích thước 480×370 px
 */

import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU } from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';

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
    const title = HDTextHelper.createText(this.scene, 640, modalY + 30, 'TẠM DỪNG HÀNH TRÌNH [ESC]', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    // Nút đóng nhanh [✕]
    const closeBtn = HDTextHelper.createText(this.scene, modalX + modalW - 30, modalY + 30, '✕', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      this.close();
      this.callbacks.onResume();
    });

    this.saveStatusText = HDTextHelper.createText(this.scene, 640, modalY + 62, '', {
      fontSize: '13px',
      color: '#2ecc71'
    }).setOrigin(0.5, 0.5);

    // 3. Các nút bấm chức năng chuẩn HD (Rộng 360px, cao 44px)
    let btnY = modalY + 104;

    // Nút 1: Tiếp tục
    const resumeBtn = this.createButton(640, btnY, '▶ TIẾP TỤC TRÒ CHƠI', '#2ecc71', () => {
      this.close();
      this.callbacks.onResume();
    });

    btnY += 56;
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
    });

    btnY += 56;
    // Nút 3: Tải lại Checkpoint
    const reloadBtn = this.createButton(640, btnY, '↺ NẠP LẠI ĐIỂM LƯU GẦN NHẤT', '#3498db', () => {
      if (SaveManager.hasSave()) {
        this.close();
        this.callbacks.onReloadCheckpoint();
      } else {
        this.saveStatusText.setText('Không tìm thấy điểm lưu nào để nạp!');
        this.saveStatusText.setColor('#e74c3c');
      }
    });

    btnY += 56;
    // Nút 4: Quay về Menu
    const quitBtn = this.createButton(640, btnY, '🏠 QUAY VỀ MENU CHÍNH', '#95a5a6', () => {
      // Tự động lưu trước khi thoát
      this.callbacks.onSaveManual();
      this.close();
      this.scene.scene.stop('GameScene');
      this.scene.scene.stop('UIScene');
      this.scene.scene.start(SCENE_MAIN_MENU);
    });

    this.container.add([overlay, box, title, closeBtn, this.saveStatusText, resumeBtn, saveBtn, reloadBtn, quitBtn]);
  }

  private createButton(x: number, y: number, text: string, color: string, onClick: () => void): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);
    const btnW = 360;
    const btnH = 44;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x141a24, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.lineStyle(1.5, 0x4a5568, 0.85);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

    const txt = HDTextHelper.createText(this.scene, 0, 0, text, {
      fontSize: '15px',
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
    if (this.isOpen) this.close();
    else this.open();
  }
}
