/**
 * HOLLOW WOODS V3.0 - PASS T15
 * HD OVERHAUL FOR JOURNAL MODAL
 * Khung chuẩn HD 1280×720, căn giữa (640, 360), kích thước 840×520 px
 */

import * as Phaser from 'phaser';
import { PlayerState, LoreEntry } from '../state/PlayerState';
import { HDTextHelper } from '../utils/HDTextHelper';

export class JournalModal {
  private scene: Phaser.Scene;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  private currentTab: 'quest' | 'lore' = 'quest';
  private currentLoreIndex: number = 0;

  private contentContainer: Phaser.GameObjects.Container;
  private tabQuestBtn!: Phaser.GameObjects.Text;
  private tabLoreBtn!: Phaser.GameObjects.Text;

  public isOpen: boolean = false;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9600);

    this.contentContainer = scene.add.container(0, 0);

    this.buildUI();
    this.container.setVisible(false);

    // Lắng nghe phím bấm J mở/đóng nhật ký
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-J', () => this.toggle());
      scene.input.keyboard.on('keydown-ESC', () => {
        if (this.isOpen) this.close();
      });
    }
  }

  private buildUI(): void {
    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2; // 220
    const modalY = (720 - modalH) / 2;  // 100

    // 1. Lớp phủ đen mờ nền toàn màn hình HD 1280×720
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung sổ nhật ký giấy da sẫm màu chuẩn HD (840×520 px)
    const book = this.scene.add.graphics();
    book.fillStyle(0x151310, 0.98); // Nền giấy da cổ tối
    book.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    book.lineStyle(2, 0xa08149, 1);
    book.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);
    book.lineStyle(1, 0x4a3c22, 0.8);
    book.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 8);

    // Đường gáy sổ ở giữa phân chia 2 trang
    book.lineStyle(2, 0x4a3c22, 0.7);
    book.lineBetween(modalX + modalW / 2, modalY + 60, modalX + modalW / 2, modalY + modalH - 25);

    // Tiêu đề chính
    const title = HDTextHelper.createText(this.scene, modalX + 30, modalY + 20, '📖 SỔ TAY LỮ KHÁCH [Phím J]', {
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nút đóng [✕]
    const closeBtn = HDTextHelper.createText(this.scene, modalX + modalW - 35, modalY + 20, '✕', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());

    // 3. Hai Tab điều hướng chuẩn HD: [NHIỆM VỤ] và [CỔ THƯ & MANH MỐI]
    this.tabQuestBtn = HDTextHelper.createText(this.scene, modalX + 320, modalY + 20, '[1. TIẾN TRÌNH NHIỆM VỤ]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setInteractive({ useHandCursor: true });
    this.tabQuestBtn.on('pointerdown', () => {
      this.currentTab = 'quest';
      this.refresh();
    });

    this.tabLoreBtn = HDTextHelper.createText(this.scene, modalX + 570, modalY + 20, '[2. CỔ THƯ & MANH MỐI]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    this.tabLoreBtn.on('pointerdown', () => {
      this.currentTab = 'lore';
      this.refresh();
    });

    this.container.add([overlay, book, title, closeBtn, this.tabQuestBtn, this.tabLoreBtn, this.contentContainer]);
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    this.isOpen = true;
    this.refresh();
    this.container.setVisible(true);
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

  public refresh(): void {
    this.contentContainer.removeAll(true);

    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2;
    const modalY = (720 - modalH) / 2;

    if (this.currentTab === 'quest') {
      this.tabQuestBtn.setColor('#f39c12');
      this.tabLoreBtn.setColor('#7f8c8d');
      this.renderQuestTab(modalX, modalY, modalW, modalH);
    } else {
      this.tabQuestBtn.setColor('#7f8c8d');
      this.tabLoreBtn.setColor('#f39c12');
      this.renderLoreTab(modalX, modalY, modalW, modalH);
    }
  }

  private renderQuestTab(mx: number, my: number, mw: number, _mh: number): void {
    const currentQ = this.playerState.getCurrentQuest();
    if (!currentQ) return;

    // Cột bên trái: Chi tiết nhiệm vụ chính hiện tại
    const qTitle = HDTextHelper.createText(this.scene, mx + 30, my + 70, currentQ.title, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e67e22',
      stroke: '#000000',
      strokeThickness: 2
    });

    const qDesc = HDTextHelper.createText(this.scene, mx + 30, my + 105, currentQ.description, {
      fontSize: '13px',
      color: '#bdc3c7',
      wordWrap: { width: mw / 2 - 50 },
      lineSpacing: 5
    });

    const taskTitle = HDTextHelper.createText(this.scene, mx + 30, my + 175, 'MỤC TIÊU CẦN LÀM:', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });

    let taskY = my + 205;
    for (const task of currentQ.tasks) {
      const mark = task.done ? '☑' : '☐';
      const color = task.done ? '#2ecc71' : '#f8f9fa';
      const t = HDTextHelper.createText(this.scene, mx + 30, taskY, `${mark} ${task.text}`, {
        fontSize: '13px',
        color: color,
        wordWrap: { width: mw / 2 - 50 },
        lineSpacing: 4
      });
      this.contentContainer.add(t);
      taskY += 34;
    }

    // Cột bên phải: Danh mục các Hồi đã mở khóa
    const histTitle = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, my + 70, 'DANH SÁCH CÁC HỒI:', {
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#3498db'
    });

    let histY = my + 108;
    for (const q of this.playerState.quests.values()) {
      const isCurrent = q.id === currentQ.id;
      const marker = isCurrent ? '▶ ' : '• ';
      const color = isCurrent ? '#f39c12' : '#95a5a6';

      const row = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, histY, `${marker}${q.title}`, {
        fontSize: '14px',
        fontStyle: isCurrent ? 'bold' : 'normal',
        color: color
      });
      this.contentContainer.add(row);
      histY += 32;
    }

    this.contentContainer.add([qTitle, qDesc, taskTitle, histTitle]);
  }

  private renderLoreTab(mx: number, my: number, mw: number, mh: number): void {
    const list = this.playerState.unlockedLore;
    if (list.length === 0) {
      const emptyText = HDTextHelper.createText(this.scene, mx + mw / 2, my + mh / 2, 'Chưa tìm thấy cổ thư hay manh mối nào...', {
        fontSize: '16px',
        fontStyle: 'italic',
        color: '#7f8c8d'
      }).setOrigin(0.5, 0.5);
      this.contentContainer.add(emptyText);
      return;
    }

    if (this.currentLoreIndex >= list.length) {
      this.currentLoreIndex = 0;
    }

    const entry: LoreEntry = list[this.currentLoreIndex];

    // Tiêu đề Cổ thư chuẩn HD
    const lTitle = HDTextHelper.createText(this.scene, mx + 40, my + 70, entry.title, {
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Tác giả / Nguồn gốc
    const lAuthor = HDTextHelper.createText(this.scene, mx + 40, my + 102, `Ghi lại bởi: ${entry.author}`, {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#95a5a6'
    });

    // Nội dung cổ thư chuẩn HD
    const lContent = HDTextHelper.createText(this.scene, mx + 40, my + 135, entry.content, {
      fontSize: '15px',
      color: '#f0e6d2',
      wordWrap: { width: mw - 80 },
      lineSpacing: 8
    });

    // Nút lật trang (Trang trước / Trang sau)
    const pageNav = HDTextHelper.createText(this.scene, mx + mw / 2, my + mh - 30, `< Trang ${this.currentLoreIndex + 1} / ${list.length} > (Nhấn để lật trang)`, {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    pageNav.on('pointerdown', () => {
      this.currentLoreIndex = (this.currentLoreIndex + 1) % list.length;
      this.refresh();
    });

    this.contentContainer.add([lTitle, lAuthor, lContent, pageNav]);
  }
}
