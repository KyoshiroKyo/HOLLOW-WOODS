/**
 * HOLLOW WOODS V1.3 - C4-13-03
 * HD GAME OVER MODAL (BẢNG THÔNG BÁO GỤC NGÃ TRONG SƯƠNG ĐẶC)
 * Phù hợp với định hướng nghệ thuật Visual Direction A (Dark Woodland Pixel Art)
 * Hiển thị tại UIScene (Zoom 1.0 cố định), căn giữa (640, 360), kích thước 520×400 px
 */

import * as Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';

export interface GameOverModalCallbacks {
  onLoadCheckpoint: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export class GameOverModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private callbacks: GameOverModalCallbacks;
  public isOpen: boolean = false;
  private reasonText!: Phaser.GameObjects.Text;
  private saveStatusText!: Phaser.GameObjects.Text;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene, callbacks: GameOverModalCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9900); // Lớp hiển thị cao hơn HUD và PauseModal

    this.buildUI();
    this.container.setVisible(false);
  }

  private buildUI(): void {
    const modalW = 520;
    const modalH = 400;
    const modalX = (1280 - modalW) / 2; // 380
    const modalY = (720 - modalH) / 2;  // 160

    // 1. Lớp phủ đen mờ u ám toàn màn hình (chặn mọi click xuyên thấu)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x060202, 0.88);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung modal chính phong cách Dark Woodland cổ kính
    const box = this.scene.add.graphics();
    // Nền hộp tối sẫm ánh đỏ sương đêm
    box.fillStyle(0x0d0708, 0.98);
    box.fillRoundedRect(modalX, modalY, modalW, modalH, 8);

    // Đường viền ngoài đỏ thẫm
    box.lineStyle(2, 0x8b0000, 0.95);
    box.strokeRoundedRect(modalX, modalY, modalW, modalH, 8);

    // Đường viền trong đồng cổ
    box.lineStyle(1, 0x5a2d22, 0.75);
    box.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 6);

    // Dải trang trí đỉnh
    box.fillStyle(0x2d0b0e, 0.85);
    box.fillRect(modalX + 8, modalY + 8, modalW - 16, 32);

    // Nhãn phụ trang trí đỉnh
    const tagText = HDTextHelper.createText(this.scene, 640, modalY + 24, '† DỊ CẢNH RỪNG LIỄU — BÓNG ĐÊM NUỐT CHỬNG †', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#c0392b',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Tiêu đề Game Over chính
    const title = HDTextHelper.createText(this.scene, 640, modalY + 68, 'GỤC NGÃ TRONG SƯƠNG ĐẶC', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0.5);

    // Dòng nguyên nhân gục ngã (được cập nhật động khi mở bảng)
    this.reasonText = HDTextHelper.createText(
      this.scene,
      640,
      modalY + 104,
      'Sinh lực cạn kiệt... Màn sương lạnh nuốt chửng hơi thở cuối cùng.',
      {
        fontSize: '13px',
        fontStyle: 'italic',
        color: '#bdc3c7',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
        wordWrap: { width: modalW - 60 }
      }
    ).setOrigin(0.5, 0.5);

    // Thông tin điểm lưu
    this.saveStatusText = HDTextHelper.createText(this.scene, 640, modalY + 134, '', {
      fontSize: '12px',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    // Đường gạch ngăn cách phong cách rêu đá
    const divider = this.scene.add.graphics();
    divider.lineStyle(1, 0x4a2a1a, 0.8);
    divider.lineBetween(modalX + 40, modalY + 152, modalX + modalW - 40, modalY + 152);

    // 3. Hệ thống 3 nút chức năng (Rộng 380px, Cao 46px)
    let btnY = modalY + 184;

    // Nút 1: Nạp Điểm Lưu Gần Nhất
    const reloadBtn = this.createButton(
      640,
      btnY,
      '↺ NẠP ĐIỂM LƯU GẦN NHẤT (LOAD CHECKPOINT)',
      '#3498db',
      0x132130,
      () => {
        this.close();
        this.callbacks.onLoadCheckpoint();
      }
    );

    btnY += 58;
    // Nút 2: Chơi Lại Từ Đầu
    const restartBtn = this.createButton(
      640,
      btnY,
      '🔄 CHƠI LẠI TỪ ĐẦU (RESTART)',
      '#e67e22',
      0x2a1a10,
      () => {
        this.close();
        this.callbacks.onRestart();
      }
    );

    btnY += 58;
    // Nút 3: Quay Về Màn Hình Chính
    const menuBtn = this.createButton(
      640,
      btnY,
      '🏠 VỀ MÀN HÌNH CHÍNH (MAIN MENU)',
      '#95a5a6',
      0x1a1c20,
      () => {
        this.close();
        this.callbacks.onMainMenu();
      }
    );

    // Chú thích chân trang
    const footerText = HDTextHelper.createText(
      this.scene,
      640,
      modalY + modalH - 18,
      'HOLLOW WOODS V1.3 — Kẻ Lắng Nghe luôn rình rập trong màn sương',
      {
        fontSize: '11px',
        color: '#666666'
      }
    ).setOrigin(0.5, 0.5);

    this.container.add([
      overlay,
      box,
      tagText,
      title,
      this.reasonText,
      this.saveStatusText,
      divider,
      reloadBtn,
      restartBtn,
      menuBtn,
      footerText
    ]);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    color: string,
    bgColorHex: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);
    const btnW = 380;
    const btnH = 46;

    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColorHex, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.lineStyle(1.5, 0x5a2d22, 0.9);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

    const txt = HDTextHelper.createText(this.scene, 0, 0, text, {
      fontSize: '14px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    const hitZone = this.scene.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });

    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(bgColorHex + 0x111111, 1);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(2, 0xe74c3c, 1);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor('#ffffff');
    });

    hitZone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColorHex, 0.95);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(1.5, 0x5a2d22, 0.9);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor(color);
    });

    hitZone.on('pointerdown', () => {
      onClick();
    });

    btnContainer.add([bg, txt, hitZone]);
    return btnContainer;
  }

  public open(reason?: string): void {
    if (this.isOpen) return;
    this.isOpen = true;

    if (reason) {
      this.reasonText.setText(reason);
    } else {
      this.reasonText.setText('Sinh lực cạn kiệt... Màn sương lạnh nuốt chửng hơi thở cuối cùng.');
    }

    if (SaveManager.hasSave()) {
      this.saveStatusText.setText('✔ Có dữ liệu điểm lưu gần nhất để tiếp tục hành trình');
      this.saveStatusText.setColor('#2ecc71');
    } else {
      this.saveStatusText.setText('⚠ Chưa có dữ liệu điểm lưu (sẽ bắt đầu lại từ đầu phân khu)');
      this.saveStatusText.setColor('#f39c12');
    }

    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 350,
      ease: 'Power2'
    });

    if (this.onOpen) {
      this.onOpen();
    }
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);

    if (this.onClose) {
      this.onClose();
    }
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
