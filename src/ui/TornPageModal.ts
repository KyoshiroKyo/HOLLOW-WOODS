/**
 * HOLLOW WOODS V1.5 - GIAO DIỆN TRANG GIẤY CỔ TƯƠNG TÁC (TORN PAGE MODAL)
 * Thiết kế trang giấy da dê cổ rách viền (Aged Torn Parchment) mở ra giữa màn hình
 * Hỗ trợ hiệu ứng lật trang, âm thanh sột soạt, đọc tương tác và cất vào Sổ Tay [J].
 */

import * as Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { TornPageEntry } from '../data/tornPagesData';
import { PlayerState } from '../state/PlayerState';

export class TornPageModal {
  private scene: Phaser.Scene;
  private playerState: PlayerState;
  private container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;

  private currentEntry: TornPageEntry | null = null;
  private currentPageIndex: number = 0;
  private isAlreadyCollected: boolean = false;

  // Visual Components
  private overlayBg!: Phaser.GameObjects.Graphics;
  private parchmentBg!: Phaser.GameObjects.Graphics;
  private runeText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private authorText!: Phaser.GameObjects.Text;
  private dividerGfx!: Phaser.GameObjects.Graphics;
  private bodyTextContainer!: Phaser.GameObjects.Container;
  private bodyText!: Phaser.GameObjects.Text;
  private pageIndicatorText!: Phaser.GameObjects.Text;

  // Navigation & Action Buttons
  private prevPageBtn!: Phaser.GameObjects.Text;
  private nextPageBtn!: Phaser.GameObjects.Text;
  private stowBtnContainer!: Phaser.GameObjects.Container;
  private stowBtnBg!: Phaser.GameObjects.Graphics;
  private stowBtnText!: Phaser.GameObjects.Text;
  private closeBtnText!: Phaser.GameObjects.Text;

  // Keyboard Handlers
  private keyListeners: Array<{ key: Phaser.Input.Keyboard.Key; handler: () => void }> = [];

  // Callbacks
  public onOpen?: () => void;
  public onStow?: (entry: TornPageEntry) => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9800); // Đặt trên HUD thường, dưới popup hệ thống
    this.container.setVisible(false);

    this.buildUI();
  }

  /**
   * Dựng cấu trúc giao diện Trang Giấy Cổ Rách Viền
   */
  private buildUI(): void {
    // 1. Lớp phủ nền tối mờ tập trung ánh nhìn
    this.overlayBg = this.scene.add.graphics();
    this.overlayBg.fillStyle(0x000000, 0.76);
    this.overlayBg.fillRect(0, 0, 1280, 720);
    this.overlayBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    this.overlayBg.on('pointerdown', () => {
      this.close();
    });

    // 2. Đồ họa Trang Giấy Rách Viền (Torn Parchment Graphics)
    this.parchmentBg = this.scene.add.graphics();

    // 3. Tiêu đề, Cổ Ngữ & Tác giả
    this.runeText = HDTextHelper.createText(this.scene, 640, 140, 'ᚱ', {
      fontFamily: 'serif',
      fontSize: '24px',
      color: '#8b6834',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    this.titleText = HDTextHelper.createText(this.scene, 640, 172, '', {
      fontFamily: '"Times New Roman", Georgia, serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#2a1a0c',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.authorText = HDTextHelper.createText(this.scene, 640, 196, '', {
      fontFamily: '"Times New Roman", Georgia, serif',
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#5f4528',
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.dividerGfx = this.scene.add.graphics();

    // 4. Khung nội dung trang giấy
    this.bodyTextContainer = this.scene.add.container(640, 310);
    this.bodyText = HDTextHelper.createText(this.scene, 0, 0, '', {
      fontFamily: '"Times New Roman", Georgia, serif',
      fontSize: '14.5px',
      color: '#1e130a',
      wordWrap: { width: 560 },
      lineSpacing: 8,
      align: 'left'
    }).setOrigin(0.5, 0.5);
    this.bodyTextContainer.add(this.bodyText);

    // 5. Điều hướng trang
    this.pageIndicatorText = HDTextHelper.createText(this.scene, 640, 428, 'Trang 1 / 1', {
      fontFamily: '"Times New Roman", Georgia, serif',
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#6d5236'
    }).setOrigin(0.5, 0.5);

    this.prevPageBtn = HDTextHelper.createText(this.scene, 370, 428, '◄ Trang Trước [A]', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#7f5a2b'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    this.prevPageBtn.on('pointerdown', () => this.prevPage());
    this.prevPageBtn.on('pointerover', () => this.prevPageBtn.setColor('#e67e22'));
    this.prevPageBtn.on('pointerout', () => this.prevPageBtn.setColor('#7f5a2b'));

    this.nextPageBtn = HDTextHelper.createText(this.scene, 910, 428, 'Trang Tiếp [D] ►', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#7f5a2b'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this.nextPageBtn.on('pointerdown', () => this.nextPage());
    this.nextPageBtn.on('pointerover', () => this.nextPageBtn.setColor('#e67e22'));
    this.nextPageBtn.on('pointerout', () => this.nextPageBtn.setColor('#7f5a2b'));

    // 6. Nút Cất vào Sổ Tay & Đóng
    this.stowBtnContainer = this.scene.add.container(560, 485);
    this.stowBtnBg = this.scene.add.graphics();
    this.stowBtnText = HDTextHelper.createText(this.scene, 0, 0, '[E / Space] Cất vào Sổ Tay & Đóng', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fff0b3'
    }).setOrigin(0.5, 0.5);
    this.stowBtnContainer.add([this.stowBtnBg, this.stowBtnText]);

    const stowHitArea = new Phaser.Geom.Rectangle(-160, -18, 320, 36);
    this.stowBtnContainer.setInteractive(stowHitArea, Phaser.Geom.Rectangle.Contains);
    this.stowBtnContainer.on('pointerdown', () => this.stowAndClose());
    this.stowBtnContainer.on('pointerover', () => {
      this.drawStowButton(true);
      this.stowBtnText.setColor('#ffe082');
    });
    this.stowBtnContainer.on('pointerout', () => {
      this.drawStowButton(false);
      this.stowBtnText.setColor('#fff0b3');
    });

    // 7. Nút [ESC] Đóng
    this.closeBtnText = HDTextHelper.createText(this.scene, 790, 485, '[ESC] Đóng', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#a08560'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    this.closeBtnText.on('pointerdown', () => this.close());
    this.closeBtnText.on('pointerover', () => this.closeBtnText.setColor('#f5f6fa'));
    this.closeBtnText.on('pointerout', () => this.closeBtnText.setColor('#a08560'));

    this.container.add([
      this.overlayBg,
      this.parchmentBg,
      this.runeText,
      this.titleText,
      this.authorText,
      this.dividerGfx,
      this.bodyTextContainer,
      this.pageIndicatorText,
      this.prevPageBtn,
      this.nextPageBtn,
      this.stowBtnContainer,
      this.closeBtnText
    ]);
  }

  /**
   * Vẽ hình dáng trang giấy rách viền (Aged Torn Parchment) nghệ thuật
   */
  private renderAgedParchmentGraphics(): void {
    this.parchmentBg.clear();
    const cx = 640;
    const cy = 320;
    const w = 680;
    const h = 420;
    const left = cx - w / 2;
    const top = cy - h / 2;

    // 1. Lớp bóng đổ rìa giấy cháy sém
    this.parchmentBg.fillStyle(0x1e140a, 0.65);
    this.parchmentBg.fillRoundedRect(left - 8, top - 6, w + 16, h + 14, 8);

    // 2. Viền cháy loang màu nâu sẫm (Burnt sienna irregular edges)
    this.parchmentBg.fillStyle(0x52381f, 0.95);
    this.parchmentBg.fillRoundedRect(left - 4, top - 3, w + 8, h + 7, 6);

    // 3. Lớp giấy nền vàng cũ da dê (Warm Aged Parchment)
    this.parchmentBg.fillStyle(0xede0c4, 1.0);
    this.parchmentBg.fillRoundedRect(left, top, w, h, 4);

    // 4. Vết ố loang màu nước trà & nếp gấp mờ (Tea stain & fold lines)
    this.parchmentBg.fillStyle(0xdfcaa2, 0.35);
    this.parchmentBg.fillCircle(left + 75, top + 80, 55);
    this.parchmentBg.fillCircle(left + w - 90, top + h - 70, 70);
    this.parchmentBg.fillEllipse(cx, top + 60, 240, 25);

    // Đường thớ giấy ngang cổ điển nét siêu mảnh
    this.parchmentBg.lineStyle(1, 0xdfcaa2, 0.25);
    for (let y = top + 25; y < top + h - 20; y += 14) {
      this.parchmentBg.lineBetween(left + 20, y, left + w - 20, y);
    }

    // 5. Viền chỉ trang trí nạm đồng xỉn bên trong
    this.parchmentBg.lineStyle(1.5, 0x9b7a42, 0.65);
    this.parchmentBg.strokeRoundedRect(left + 14, top + 14, w - 28, h - 28, 4);
    this.parchmentBg.lineStyle(1, 0x6e5229, 0.35);
    this.parchmentBg.strokeRoundedRect(left + 18, top + 18, w - 36, h - 36, 3);

    // 6. Rách góc tự nhiên ở mép giấy
    this.parchmentBg.fillStyle(0x3e2916, 0.8);
    this.parchmentBg.fillTriangle(left + w - 14, top, left + w, top + 14, left + w, top);
    this.parchmentBg.fillTriangle(left, top + h - 14, left + 14, top + h, left, top + h);

    // Đường gân chia phân tách tiêu đề
    this.dividerGfx.clear();
    this.dividerGfx.lineStyle(1.5, 0x8a6833, 0.7);
    this.dividerGfx.lineBetween(cx - 240, 214, cx + 240, 214);
    this.dividerGfx.fillStyle(0x8a6833, 0.9);
    this.dividerGfx.fillCircle(cx, 214, 4);
    this.dividerGfx.lineStyle(1, 0x8a6833, 0.4);
    this.dividerGfx.strokeCircle(cx, 214, 7);
  }

  /**
   * Vẽ nền nút Cất vào Sổ Tay
   */
  private drawStowButton(isHover: boolean = false): void {
    this.stowBtnBg.clear();
    const btnW = 320;
    const btnH = 34;
    const left = -btnW / 2;
    const top = -btnH / 2;

    const bgColor = isHover ? 0x2d1f11 : 0x1b140c;
    const borderColor = isHover ? 0xd4af37 : 0x8a6d3b;
    const alpha = isHover ? 0.98 : 0.92;

    this.stowBtnBg.fillStyle(bgColor, alpha);
    this.stowBtnBg.fillRoundedRect(left, top, btnW, btnH, 5);
    this.stowBtnBg.lineStyle(1.5, borderColor, 0.95);
    this.stowBtnBg.strokeRoundedRect(left, top, btnW, btnH, 5);
    this.stowBtnBg.lineStyle(1, 0x4a3a1f, 0.5);
    this.stowBtnBg.strokeRoundedRect(left + 2, top + 2, btnW - 4, btnH - 4, 4);
  }

  /**
   * Mở trang giấy nhật ký tương tác
   */
  public open(entry: TornPageEntry): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.currentEntry = entry;
    this.currentPageIndex = 0;

    if (this.onOpen) {
      this.onOpen();
    }

    // Kiểm tra xem đã thu thập chưa
    this.isAlreadyCollected = this.playerState.hasFlag('collected_note_' + entry.id) ||
                             this.playerState.unlockedLore.some(l => l.id === entry.loreId);

    // Cập nhật nội dung
    this.runeText.setText(entry.ancientRune || 'ᚱ');
    this.titleText.setText(entry.title.toUpperCase());
    this.authorText.setText(entry.author || 'Mảnh Giấy Cổ Vô Danh');

    this.renderAgedParchmentGraphics();
    this.drawStowButton(false);
    this.updatePageContent();

    // Hiển thị nút cất hay đã cất
    const stowLabel = this.isAlreadyCollected ? '[E / Space] Đã Cất Vào Sổ Tay • Đóng' : '[E / Space] Cất vào Sổ Tay & Đóng';
    this.stowBtnText.setText(stowLabel);

    // Âm thanh mở giấy sột soạt
    try {
      AudioManager.getInstance().playWorldInteractSFX('journal');
    } catch {
      // Ignored
    }

    // Đăng ký phím tắt bàn phím
    this.setupKeyboardListeners();

    // Hiệu ứng mở giấy (scale nhẹ và fade-in)
    this.container.setAlpha(0);
    this.container.setScale(0.94);
    this.container.setVisible(true);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 180,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Cập nhật nội dung hiển thị theo trang hiện tại
   */
  private updatePageContent(): void {
    if (!this.currentEntry) return;

    const totalPages = Math.max(1, this.currentEntry.pages.length);
    const content = this.currentEntry.pages[this.currentPageIndex] || '';

    // Hiệu ứng lật trang nhẹ
    this.bodyText.setAlpha(0);
    this.bodyText.setText(content);

    this.scene.tweens.add({
      targets: this.bodyText,
      alpha: 1,
      duration: 140,
      ease: 'Quad.easeOut'
    });

    this.pageIndicatorText.setText(`Trang ${this.currentPageIndex + 1} / ${totalPages}`);

    // Cập nhật hiển thị nút chuyển trang
    this.prevPageBtn.setVisible(this.currentPageIndex > 0);
    this.nextPageBtn.setVisible(this.currentPageIndex < totalPages - 1);
  }

  /**
   * Lật sang trang tiếp theo
   */
  public nextPage(): void {
    if (!this.currentEntry || this.currentPageIndex >= this.currentEntry.pages.length - 1) return;
    this.currentPageIndex++;
    try {
      AudioManager.getInstance().playWorldInteractSFX('journal');
    } catch {
      // Ignored
    }
    this.updatePageContent();
  }

  /**
   * Lật về trang trước đó
   */
  public prevPage(): void {
    if (!this.currentEntry || this.currentPageIndex <= 0) return;
    this.currentPageIndex--;
    try {
      AudioManager.getInstance().playWorldInteractSFX('journal');
    } catch {
      // Ignored
    }
    this.updatePageContent();
  }

  /**
   * Cất vào Sổ Tay [J], mở khóa Lore/Thức tỉnh ký ức và đóng modal
   */
  public stowAndClose(): void {
    if (!this.isOpen || !this.currentEntry) return;

    const entry = this.currentEntry;

    // 1. Mở khóa lore trong Sổ Tay [J]
    this.playerState.unlockLore(entry.loreId);

    // 2. Ghi nhận cờ đã thu thập để đổi trạng thái prompt trên tường
    this.playerState.setFlag('collected_note_' + entry.id);

    // 3. Nếu là trang nhật ký cốt truyện thức tỉnh ký ức Hiệp Sĩ Đen
    if (typeof entry.memoryAwakeningStage === 'number' && entry.memoryAwakeningStage > 0) {
      if (this.playerState.memoryAwakeningStage < entry.memoryAwakeningStage) {
        this.playerState.setMemoryAwakeningStage(entry.memoryAwakeningStage);
      }
    }

    // 4. Cộng điểm Bình Tâm nếu là lần đầu đọc
    if (!this.isAlreadyCollected && entry.composureBonus) {
      this.playerState.modifyComposure(entry.composureBonus);
    }

    // 5. Thưởng vật phẩm đính kèm nếu có
    if (!this.isAlreadyCollected && entry.rewardItem) {
      this.playerState.addItem(entry.rewardItem.itemId, entry.rewardItem.count);
    }

    if (this.onStow) {
      this.onStow(entry);
    }

    this.close();
  }

  /**
   * Đóng giao diện trang giấy
   */
  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.cleanupKeyboardListeners();

    try {
      AudioManager.getInstance().playUICancel();
    } catch {
      // Ignored
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
        if (this.onClose) {
          this.onClose();
        }
      }
    });
  }

  /**
   * Đăng ký phím tắt bàn phím (E, Space, Enter, ESC, A, D, Mũi tên)
   */
  private setupKeyboardListeners(): void {
    this.cleanupKeyboardListeners();
    if (!this.scene.input || !this.scene.input.keyboard) return;

    const kb = this.scene.input.keyboard;

    const addKeyHandler = (keyCode: number, handler: () => void) => {
      const key = kb.addKey(keyCode);
      this.keyListeners.push({ key, handler });
    };

    // Phím Cất & Đóng: E, Space, Enter
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.E, () => this.stowAndClose());
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.SPACE, () => this.stowAndClose());
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.ENTER, () => this.stowAndClose());

    // Phím Đóng: ESC
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.ESC, () => this.close());

    // Phím chuyển trang: A / ArrowLeft, D / ArrowRight
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.A, () => this.prevPage());
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.LEFT, () => this.prevPage());
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.D, () => this.nextPage());
    addKeyHandler(Phaser.Input.Keyboard.KeyCodes.RIGHT, () => this.nextPage());

    // Bắt sự kiện keydown mỗi frame
    this.scene.events.on('update', this.handleUpdateKeys, this);
  }

  private handleUpdateKeys(): void {
    if (!this.isOpen) return;
    for (const item of this.keyListeners) {
      if (item.key && Phaser.Input.Keyboard.JustDown(item.key)) {
        item.handler();
        break;
      }
    }
  }

  private cleanupKeyboardListeners(): void {
    this.scene.events.off('update', this.handleUpdateKeys, this);
    if (this.scene.input && this.scene.input.keyboard) {
      for (const item of this.keyListeners) {
        this.scene.input.keyboard.removeKey(item.key);
      }
    }
    this.keyListeners = [];
  }

  /**
   * Hủy modal dọn dẹp sạch sẽ tài nguyên tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    this.cleanupKeyboardListeners();
    if (this.container) {
      this.container.destroy();
    }
  }
}
