/**
 * HOLLOW WOODS V1.5 - GIAO DIỆN TRANG GIẤY CỔ & BIỂN BÁO TƯƠNG TÁC (TORN PAGE & PAPER NOTE MODAL)
 * Hỗ trợ đa dạng chủ đề hình ảnh (Visual Variants):
 * 1. parchment: Giấy da dê cổ rách viền (Aged Torn Parchment)
 * 2. notice: Bản thông báo làng / Cáo thị có Dấu Sáp Đỏ (Red Wax Seal)
 * 3. signpost: Bảng gỗ sồi phong hóa, 4 đinh tán kim loại góc, chữ khắc gỗ sáng màu
 * 4. stele: Phiến đá cự thạch xám phủ rêu xanh, chữ khắc đá sáng màu
 * 
 * Hỗ trợ hiệu ứng lật trang, âm thanh trực quan, đọc tương tác và cất vào Sổ Tay [J].
 */

import * as Phaser from 'phaser';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { TornPageEntry, NoteVisualVariant } from '../data/tornPagesData';
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
   * Dựng cấu trúc giao diện Trang Giấy / Biển Báo Cổ
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

    // 2. Đồ họa nền tấm nền (Parchment / Signpost / Notice / Stele)
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
    this.prevPageBtn.on('pointerout', () => this.updateNavButtonColors());

    this.nextPageBtn = HDTextHelper.createText(this.scene, 910, 428, 'Trang Tiếp [D] ►', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#7f5a2b'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this.nextPageBtn.on('pointerdown', () => this.nextPage());
    this.nextPageBtn.on('pointerover', () => this.nextPageBtn.setColor('#e67e22'));
    this.nextPageBtn.on('pointerout', () => this.updateNavButtonColors());

    // 6. Nút Cất vào Sổ Tay & Đóng / Đã Đọc & Đóng
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
      const variant = this.currentEntry?.variant || 'parchment';
      this.drawStowButton(true, variant);
      this.stowBtnText.setColor('#ffe082');
    });
    this.stowBtnContainer.on('pointerout', () => {
      const variant = this.currentEntry?.variant || 'parchment';
      this.drawStowButton(false, variant);
      this.updateStowButtonTextColor(variant);
    });

    // 7. Nút [ESC] Đóng
    this.closeBtnText = HDTextHelper.createText(this.scene, 790, 485, '[ESC] Đóng', {
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#a08560'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    this.closeBtnText.on('pointerdown', () => this.close());
    this.closeBtnText.on('pointerover', () => this.closeBtnText.setColor('#f5f6fa'));
    this.closeBtnText.on('pointerout', () => {
      const variant = this.currentEntry?.variant || 'parchment';
      this.updateCloseButtonTextColor(variant);
    });

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

  // =========================================================================
  // THEME RENDERING METHODS
  // =========================================================================

  /**
   * 1. PARCHMENT: Trang giấy da dê rách viền cổ điển
   */
  private renderAgedParchmentGraphics(): void {
    this.parchmentBg.clear();
    const cx = 640;
    const cy = 320;
    const w = 680;
    const h = 420;
    const left = cx - w / 2;
    const top = cy - h / 2;

    // Lớp bóng đổ rìa giấy cháy sém
    this.parchmentBg.fillStyle(0x1e140a, 0.65);
    this.parchmentBg.fillRoundedRect(left - 8, top - 6, w + 16, h + 14, 8);

    // Viền cháy loang màu nâu sẫm
    this.parchmentBg.fillStyle(0x52381f, 0.95);
    this.parchmentBg.fillRoundedRect(left - 4, top - 3, w + 8, h + 7, 6);

    // Lớp giấy nền vàng cũ da dê
    this.parchmentBg.fillStyle(0xede0c4, 1.0);
    this.parchmentBg.fillRoundedRect(left, top, w, h, 4);

    // Vết ố loang màu nước trà & nếp gấp mờ
    this.parchmentBg.fillStyle(0xdfcaa2, 0.35);
    this.parchmentBg.fillCircle(left + 75, top + 80, 55);
    this.parchmentBg.fillCircle(left + w - 90, top + h - 70, 70);
    this.parchmentBg.fillEllipse(cx, top + 60, 240, 25);

    // Đường thớ giấy ngang cổ điển nét siêu mảnh
    this.parchmentBg.lineStyle(1, 0xdfcaa2, 0.25);
    for (let y = top + 25; y < top + h - 20; y += 14) {
      this.parchmentBg.lineBetween(left + 20, y, left + w - 20, y);
    }

    // Viền chỉ trang trí nạm đồng xỉn bên trong
    this.parchmentBg.lineStyle(1.5, 0x9b7a42, 0.65);
    this.parchmentBg.strokeRoundedRect(left + 14, top + 14, w - 28, h - 28, 4);
    this.parchmentBg.lineStyle(1, 0x6e5229, 0.35);
    this.parchmentBg.strokeRoundedRect(left + 18, top + 18, w - 36, h - 36, 3);

    // Rách góc tự nhiên ở mép giấy
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
   * 2. NOTICE: Giấy cáo thị / thông báo có Dấu Sáp Đỏ (Red Wax Seal)
   */
  private renderNoticeGraphics(): void {
    this.parchmentBg.clear();
    const cx = 640;
    const cy = 320;
    const w = 680;
    const h = 420;
    const left = cx - w / 2;
    const top = cy - h / 2;

    // Bóng đổ nền
    this.parchmentBg.fillStyle(0x16120b, 0.7);
    this.parchmentBg.fillRoundedRect(left - 6, top - 4, w + 12, h + 10, 6);

    // Viền sờn cạnh
    this.parchmentBg.fillStyle(0x6e5337, 0.9);
    this.parchmentBg.fillRoundedRect(left - 2, top - 2, w + 4, h + 4, 4);

    // Nền giấy vàng ngả sờn viền (Yellowed vellum parchment)
    this.parchmentBg.fillStyle(0xf5ebd6, 1.0);
    this.parchmentBg.fillRoundedRect(left, top, w, h, 3);

    // Vết ố thời gian mờ
    this.parchmentBg.fillStyle(0xe5d7bd, 0.35);
    this.parchmentBg.fillCircle(left + 80, top + 75, 45);
    this.parchmentBg.fillCircle(left + w - 120, top + h - 80, 55);

    // Đinh ghim sắt ở giữa mép trên
    this.parchmentBg.fillStyle(0x2a2a2a, 0.9);
    this.parchmentBg.fillCircle(cx, top + 10, 6);
    this.parchmentBg.fillStyle(0x666666, 0.9);
    this.parchmentBg.fillCircle(cx, top + 9, 3);

    // Dấu Sáp Đỏ tròn (Red Wax Seal) ở góc trên bên phải
    const waxX = left + w - 52;
    const waxY = top + 52;
    this.parchmentBg.fillStyle(0x991818, 0.95);
    this.parchmentBg.fillCircle(waxX, waxY, 21);
    this.parchmentBg.fillStyle(0x7f1212, 0.95);
    this.parchmentBg.fillCircle(waxX + 1, waxY + 1, 16);
    // Vòng dập nổi vàng thau bên trong dấu sáp
    this.parchmentBg.lineStyle(1.5, 0xd4af37, 0.9);
    this.parchmentBg.strokeCircle(waxX, waxY, 12);
    this.parchmentBg.fillStyle(0xd4af37, 0.95);
    this.parchmentBg.fillCircle(waxX, waxY, 4);

    // Viền khung chỉ trang trí đôi bên trong
    this.parchmentBg.lineStyle(1.5, 0x8b5a2b, 0.6);
    this.parchmentBg.strokeRoundedRect(left + 14, top + 14, w - 28, h - 28, 4);
    this.parchmentBg.lineStyle(1, 0x9b1b1b, 0.4);
    this.parchmentBg.strokeRoundedRect(left + 18, top + 18, w - 36, h - 36, 3);

    // Đường gân chia phân tách tiêu đề phong cách Cáo Thị
    this.dividerGfx.clear();
    this.dividerGfx.lineStyle(1.5, 0x851414, 0.8);
    this.dividerGfx.lineBetween(cx - 240, 214, cx + 240, 214);
    this.dividerGfx.fillStyle(0x851414, 0.9);
    this.dividerGfx.fillCircle(cx, 214, 4);
    this.dividerGfx.lineStyle(1, 0x851414, 0.4);
    this.dividerGfx.strokeCircle(cx, 214, 7);
  }

  /**
   * 3. SIGNPOST: Khung bảng gỗ sồi phong hóa, 4 đinh tán kim loại góc
   */
  private renderSignpostGraphics(): void {
    this.parchmentBg.clear();
    const cx = 640;
    const cy = 320;
    const w = 680;
    const h = 420;
    const left = cx - w / 2;
    const top = cy - h / 2;

    // Lớp bóng đổ sâu đậm
    this.parchmentBg.fillStyle(0x0c0805, 0.85);
    this.parchmentBg.fillRoundedRect(left - 6, top - 4, w + 12, h + 10, 8);

    // Viền khung gỗ sồi già sẫm màu
    this.parchmentBg.fillStyle(0x1f1208, 0.98);
    this.parchmentBg.fillRoundedRect(left - 3, top - 3, w + 6, h + 6, 6);

    // Nền gỗ sồi phong hóa (Weathered Oak Planks)
    this.parchmentBg.fillStyle(0x321e10, 1.0);
    this.parchmentBg.fillRoundedRect(left, top, w, h, 4);

    // Các rãnh ghép ván gỗ ngang (Horizontal timber seams)
    for (let y = top + 70; y < top + h; y += 70) {
      this.parchmentBg.lineStyle(2, 0x180d07, 0.95);
      this.parchmentBg.lineBetween(left + 6, y, left + w - 6, y);
      this.parchmentBg.lineStyle(1, 0x4a2e1a, 0.5);
      this.parchmentBg.lineBetween(left + 6, y + 1, left + w - 6, y + 1);
    }

    // Vân gỗ tự nhiên mảnh
    this.parchmentBg.lineStyle(1, 0x24150b, 0.4);
    for (let y = top + 16; y < top + h - 10; y += 18) {
      this.parchmentBg.lineBetween(left + 14, y, left + w - 14, y);
    }

    // Mắt gỗ sồi già
    this.parchmentBg.fillStyle(0x221309, 0.5);
    this.parchmentBg.fillCircle(left + 85, top + 115, 8);
    this.parchmentBg.fillCircle(left + w - 105, top + 265, 10);

    // Viền đồng xỉn chạm nổi bên trong
    this.parchmentBg.lineStyle(1.5, 0x8a6d3b, 0.6);
    this.parchmentBg.strokeRoundedRect(left + 12, top + 12, w - 24, h - 24, 4);

    // 4 Đinh tán kim loại góc (Corner Iron Rivets with Brass Pin)
    const studs = [
      { x: left + 22, y: top + 22 },
      { x: left + w - 22, y: top + 22 },
      { x: left + 22, y: top + h - 22 },
      { x: left + w - 22, y: top + h - 22 }
    ];
    for (const s of studs) {
      this.parchmentBg.fillStyle(0x181818, 0.95);
      this.parchmentBg.fillCircle(s.x, s.y, 7);
      this.parchmentBg.lineStyle(1, 0x4a4a4a, 0.8);
      this.parchmentBg.strokeCircle(s.x, s.y, 7);
      this.parchmentBg.fillStyle(0xb8924b, 0.95);
      this.parchmentBg.fillCircle(s.x, s.y, 3);
    }

    // Đường gân chia phân tách rãnh gỗ khắc chữ
    this.dividerGfx.clear();
    this.dividerGfx.lineStyle(2, 0x180d07, 0.95);
    this.dividerGfx.lineBetween(cx - 240, 214, cx + 240, 214);
    this.dividerGfx.lineStyle(1, 0x5a3921, 0.65);
    this.dividerGfx.lineBetween(cx - 240, 215, cx + 240, 215);
    this.dividerGfx.fillStyle(0xb8924b, 0.95);
    this.dividerGfx.fillCircle(cx, 214, 4);
    this.dividerGfx.lineStyle(1, 0xb8924b, 0.5);
    this.dividerGfx.strokeCircle(cx, 214, 7);
  }

  /**
   * 4. STELE: Phiến đá xám cự thạch phủ rêu xanh (Ancient Mossy Runestone Stele)
   */
  private renderSteleGraphics(): void {
    this.parchmentBg.clear();
    const cx = 640;
    const cy = 320;
    const w = 680;
    const h = 420;
    const left = cx - w / 2;
    const top = cy - h / 2;

    // Lớp bóng đổ sâu
    this.parchmentBg.fillStyle(0x0e1115, 0.85);
    this.parchmentBg.fillRoundedRect(left - 6, top - 4, w + 12, h + 10, 6);

    // Viền đá góc cạnh gồ ghề
    this.parchmentBg.fillStyle(0x14181f, 0.98);
    this.parchmentBg.fillRoundedRect(left - 3, top - 3, w + 6, h + 6, 4);

    // Khối cự thạch đá xám xanh (Ancient Slate Slab)
    this.parchmentBg.fillStyle(0x28303b, 1.0);
    this.parchmentBg.fillRoundedRect(left, top, w, h, 2);

    // Rãnh nứt cổ xưa trên bề mặt đá
    this.parchmentBg.lineStyle(1.5, 0x181e26, 0.7);
    this.parchmentBg.lineBetween(left + 35, top + 35, left + 75, top + 85);
    this.parchmentBg.lineBetween(left + w - 45, top + h - 85, left + w - 90, top + h - 30);
    this.parchmentBg.lineBetween(cx - 60, top + 15, cx - 20, top + 45);

    // Mảng rêu xanh rừng già (Wild Forest Moss Patches) bám ở các góc và mép đá
    this.parchmentBg.fillStyle(0x274e38, 0.85);
    this.parchmentBg.fillCircle(left + 45, top + 22, 16);
    this.parchmentBg.fillCircle(left + 64, top + 18, 12);
    this.parchmentBg.fillCircle(left + w - 70, top + 20, 18);
    this.parchmentBg.fillCircle(left + w - 90, top + 25, 13);
    this.parchmentBg.fillCircle(left + 38, top + h - 25, 20);
    this.parchmentBg.fillCircle(left + 58, top + h - 20, 14);
    this.parchmentBg.fillCircle(left + w - 50, top + h - 22, 16);

    // Viền chạm khắc cổ ngữ ngọc bích mờ
    this.parchmentBg.lineStyle(1.5, 0x48bb78, 0.4);
    this.parchmentBg.strokeRoundedRect(left + 14, top + 14, w - 28, h - 28, 2);

    // Đường gân chia phân tách đá cổ
    this.dividerGfx.clear();
    this.dividerGfx.lineStyle(1.5, 0x3d4f61, 0.9);
    this.dividerGfx.lineBetween(cx - 240, 214, cx + 240, 214);
    this.dividerGfx.fillStyle(0x48bb78, 0.95);
    this.dividerGfx.fillCircle(cx, 214, 4);
    this.dividerGfx.lineStyle(1, 0x48bb78, 0.5);
    this.dividerGfx.strokeCircle(cx, 214, 7);
  }

  // =========================================================================
  // TYPOGRAPHY & BUTTON STYLING
  // =========================================================================

  /**
   * Áp dụng màu sắc chữ và font tương ứng với từng loại chủ đề
   */
  private applyTypographyTheme(variant: NoteVisualVariant): void {
    if (variant === 'signpost') {
      this.runeText.setColor('#f5be42');
      this.titleText.setColor('#ffd166');
      this.titleText.setStroke('#180d07', 2);
      this.authorText.setColor('#d4be98');
      this.bodyText.setColor('#fef9e7'); // Chữ khắc gỗ trắng ngà tương phản cao
      this.pageIndicatorText.setColor('#d4be98');
      this.prevPageBtn.setColor('#f5be42');
      this.nextPageBtn.setColor('#f5be42');
      this.closeBtnText.setColor('#c2a677');
    } else if (variant === 'notice') {
      this.runeText.setColor('#851414');
      this.titleText.setColor('#3a0e0e');
      this.titleText.setStroke('#f5ebd6', 1);
      this.authorText.setColor('#6d4838');
      this.bodyText.setColor('#1a120c'); // Chữ mực đen nâu sẫm
      this.pageIndicatorText.setColor('#705342');
      this.prevPageBtn.setColor('#854434');
      this.nextPageBtn.setColor('#854434');
      this.closeBtnText.setColor('#8d6a50');
    } else if (variant === 'stele') {
      this.runeText.setColor('#68d391');
      this.titleText.setColor('#9ae6b4');
      this.titleText.setStroke('#14181f', 2);
      this.authorText.setColor('#a0aec0');
      this.bodyText.setColor('#edf2f7'); // Chữ khắc đá sáng màu
      this.pageIndicatorText.setColor('#a0aec0');
      this.prevPageBtn.setColor('#68d391');
      this.nextPageBtn.setColor('#68d391');
      this.closeBtnText.setColor('#94a3b8');
    } else {
      // parchment
      this.runeText.setColor('#8b6834');
      this.titleText.setColor('#2a1a0c');
      this.titleText.setStroke('', 0);
      this.authorText.setColor('#5f4528');
      this.bodyText.setColor('#1e130a');
      this.pageIndicatorText.setColor('#6d5236');
      this.prevPageBtn.setColor('#7f5a2b');
      this.nextPageBtn.setColor('#7f5a2b');
      this.closeBtnText.setColor('#a08560');
    }
  }

  /**
   * Cập nhật màu nút chuyển trang khi di chuột ra
   */
  private updateNavButtonColors(): void {
    const variant = this.currentEntry?.variant || 'parchment';
    if (variant === 'signpost') {
      this.prevPageBtn.setColor('#f5be42');
      this.nextPageBtn.setColor('#f5be42');
    } else if (variant === 'notice') {
      this.prevPageBtn.setColor('#854434');
      this.nextPageBtn.setColor('#854434');
    } else if (variant === 'stele') {
      this.prevPageBtn.setColor('#68d391');
      this.nextPageBtn.setColor('#68d391');
    } else {
      this.prevPageBtn.setColor('#7f5a2b');
      this.nextPageBtn.setColor('#7f5a2b');
    }
  }

  private updateStowButtonTextColor(variant: NoteVisualVariant): void {
    if (variant === 'signpost') {
      this.stowBtnText.setColor('#fff0b3');
    } else if (variant === 'notice') {
      this.stowBtnText.setColor('#ffe8d6');
    } else if (variant === 'stele') {
      this.stowBtnText.setColor('#e6fffa');
    } else {
      this.stowBtnText.setColor('#fff0b3');
    }
  }

  private updateCloseButtonTextColor(variant: NoteVisualVariant): void {
    if (variant === 'signpost') {
      this.closeBtnText.setColor('#c2a677');
    } else if (variant === 'notice') {
      this.closeBtnText.setColor('#8d6a50');
    } else if (variant === 'stele') {
      this.closeBtnText.setColor('#94a3b8');
    } else {
      this.closeBtnText.setColor('#a08560');
    }
  }

  /**
   * Vẽ nền nút Cất vào Sổ Tay / Đã Đọc theo variant
   */
  private drawStowButton(isHover: boolean = false, variant: NoteVisualVariant = 'parchment'): void {
    this.stowBtnBg.clear();
    const btnW = 320;
    const btnH = 34;
    const left = -btnW / 2;
    const top = -btnH / 2;

    let bgColor = 0x1b140c;
    let borderColor = 0x8a6d3b;

    if (variant === 'signpost') {
      bgColor = isHover ? 0x2e190b : 0x1a0f08;
      borderColor = isHover ? 0xffd166 : 0xb8924b;
    } else if (variant === 'notice') {
      bgColor = isHover ? 0x361612 : 0x24110e;
      borderColor = isHover ? 0xd4af37 : 0x991818;
    } else if (variant === 'stele') {
      bgColor = isHover ? 0x1a232c : 0x12171e;
      borderColor = isHover ? 0x68d391 : 0x3d6e53;
    } else {
      bgColor = isHover ? 0x2d1f11 : 0x1b140c;
      borderColor = isHover ? 0xd4af37 : 0x8a6d3b;
    }

    const alpha = isHover ? 0.98 : 0.92;

    this.stowBtnBg.fillStyle(bgColor, alpha);
    this.stowBtnBg.fillRoundedRect(left, top, btnW, btnH, 5);
    this.stowBtnBg.lineStyle(1.5, borderColor, 0.95);
    this.stowBtnBg.strokeRoundedRect(left, top, btnW, btnH, 5);
    this.stowBtnBg.lineStyle(1, borderColor, 0.35);
    this.stowBtnBg.strokeRoundedRect(left + 2, top + 2, btnW - 4, btnH - 4, 4);
  }

  // =========================================================================
  // INTERACTION LIFECYCLE
  // =========================================================================

  /**
   * Mở trang giấy / biển báo / văn bia tương tác
   */
  public open(entry: TornPageEntry): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.currentEntry = entry;
    this.currentPageIndex = 0;

    if (this.onOpen) {
      this.onOpen();
    }

    const variant: NoteVisualVariant = entry.variant || 'parchment';

    // Kiểm tra xem đã thu thập / đọc chưa
    this.isAlreadyCollected = this.playerState.hasFlag('collected_note_' + entry.id) ||
                             (Boolean(entry.loreId) && this.playerState.unlockedLore.some(l => l.id === entry.loreId));

    // Cập nhật nội dung tiêu đề và tác giả
    this.runeText.setText(entry.ancientRune || (variant === 'signpost' ? '🧭' : variant === 'notice' ? '📜' : variant === 'stele' ? 'ᛋ' : 'ᚱ'));
    this.titleText.setText(entry.title.toUpperCase());
    this.authorText.setText(entry.author || 'Mảnh Giấy Cổ Vô Danh');

    // Vẽ theme đồ họa tương ứng
    if (variant === 'signpost') {
      this.renderSignpostGraphics();
    } else if (variant === 'notice') {
      this.renderNoticeGraphics();
    } else if (variant === 'stele') {
      this.renderSteleGraphics();
    } else {
      this.renderAgedParchmentGraphics();
    }

    // Áp dụng màu typography và button
    this.applyTypographyTheme(variant);
    this.drawStowButton(false, variant);
    this.updatePageContent();

    // Hiển thị nhãn nút hành động
    let stowLabel = '';
    if (entry.loreId) {
      stowLabel = this.isAlreadyCollected ? '[E / Space] Đã Cất Vào Sổ Tay • Đóng' : '[E / Space] Cất vào Sổ Tay & Đóng';
    } else {
      stowLabel = this.isAlreadyCollected ? '[E / Space] Đã Đọc • Đóng' : '[E / Space] Đã Đọc & Đóng';
    }
    this.stowBtnText.setText(stowLabel);

    // Phát âm thanh phù hợp theo loại vật liệu
    try {
      const audio = AudioManager.getInstance();
      if (variant === 'signpost') {
        audio.playInteract();
      } else if (variant === 'stele') {
        audio.playWorldInteractSFX('rune');
      } else {
        audio.playWorldInteractSFX('journal');
      }
    } catch {
      // Ignored
    }

    // Đăng ký phím tắt bàn phím
    this.setupKeyboardListeners();

    // Hiệu ứng mở giấy / bảng gỗ (scale nhẹ và fade-in)
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
      const audio = AudioManager.getInstance();
      const variant = this.currentEntry.variant || 'parchment';
      if (variant === 'signpost') {
        audio.playInteract();
      } else if (variant === 'stele') {
        audio.playWorldInteractSFX('rune');
      } else {
        audio.playWorldInteractSFX('journal');
      }
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
      const audio = AudioManager.getInstance();
      const variant = this.currentEntry.variant || 'parchment';
      if (variant === 'signpost') {
        audio.playInteract();
      } else if (variant === 'stele') {
        audio.playWorldInteractSFX('rune');
      } else {
        audio.playWorldInteractSFX('journal');
      }
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

    // 1. Mở khóa lore trong Sổ Tay [J] nếu có loreId
    if (entry.loreId) {
      this.playerState.unlockLore(entry.loreId);
    }

    // 2. Ghi nhận cờ đã thu thập / đọc để đổi trạng thái prompt trên bản đồ
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
   * Đóng giao diện trang giấy / biển báo
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

// Xuất alias PaperNoteModal để dùng song song linh hoạt
export { TornPageModal as PaperNoteModal };
