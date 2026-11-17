/**
 * HOLLOW WOODS V1.4 - PHẦN 3: BƯỚC V14-P3-01
 * GIAO DIỆN LỬA TRẠI TRUNG TÂM 3 CẤP (CAMPFIRE MODAL)
 * Thiết kế chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360)
 */

import * as Phaser from 'phaser';
import { CampSystem } from '../systems/CampSystem';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';

export class CampfireModal {
  private scene: Phaser.Scene;
  private campSystem: CampSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;
  private lastToggleTime: number = 0;

  public onOpen?: () => void;
  public onClose?: () => void;

  private levelText!: Phaser.GameObjects.Text;
  private fuelText!: Phaser.GameObjects.Text;
  private radiusText!: Phaser.GameObjects.Text;
  private composureText!: Phaser.GameObjects.Text;
  private woodBtnText!: Phaser.GameObjects.Text;
  private resinBtnText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.campSystem = CampSystem.getInstance();
    this.playerState = PlayerState.getInstance();

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9600);

    this.buildUI();
    this.container.setVisible(false);

    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-ESC', () => {
        if (this.isOpen) this.close();
      });
    }

    this.playerState.on('campfire_updated', () => {
      if (this.isOpen) this.refreshView();
    });
    this.playerState.on('inventory_changed', () => {
      if (this.isOpen) this.refreshView();
    });
  }

  private buildUI(): void {
    const cx = 640;
    const cy = 360;
    const w = 620;
    const h = 420;

    // 1. Nền mờ
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const lx = p.x;
      const ly = p.y;
      if (lx < cx - w / 2 || lx > cx + w / 2 || ly < cy - h / 2 || ly > cy + h / 2) {
        this.close();
      }
    });
    this.container.add(overlay);

    // 2. Khung viền lửa trại gỗ ấm
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1d1a18, 0.96);
    panel.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    panel.lineStyle(2, 0xdd6b20, 0.85); // Viền cam lửa
    panel.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    panel.lineStyle(1, 0x7b341e, 0.6);
    panel.strokeRoundedRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8, 6);
    this.container.add(panel);

    // 3. Tiêu đề
    const title = HDTextHelper.createText(
      this.scene,
      cx,
      cy - h / 2 + 30,
      '🔥 LỬA TRẠI TRUNG TÂM BELLHOLLOW',
      {
        fontSize: '20px',
        color: '#f6ad55',
        fontStyle: 'bold',
        fontFamily: 'serif'
      }
    ).setOrigin(0.5);
    this.container.add(title);

    // 4. Khối thông số ngọn lửa
    this.levelText = HDTextHelper.createText(this.scene, cx, cy - h / 2 + 75, 'CẤP ĐỘ: CẤP 1 (LE LÓI)', {
      fontSize: '16px',
      color: '#ecc94b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.levelText);

    this.fuelText = HDTextHelper.createText(this.scene, cx, cy - h / 2 + 105, 'Thời gian cháy còn lại: 180 giây', {
      fontSize: '14px',
      color: '#e2e8f0'
    }).setOrigin(0.5);
    this.container.add(this.fuelText);

    // Khung hiệu ứng sinh tồn
    const infoBg = this.scene.add.graphics();
    infoBg.fillStyle(0x2a1e17, 0.85);
    infoBg.fillRoundedRect(cx - 240, cy - h / 2 + 135, 480, 80, 6);
    infoBg.lineStyle(1, 0x4a3224, 0.7);
    infoBg.strokeRoundedRect(cx - 240, cy - h / 2 + 135, 480, 80, 6);
    this.container.add(infoBg);

    this.radiusText = HDTextHelper.createText(this.scene, cx - 220, cy - h / 2 + 148, '• Bán kính sưởi ấm & ánh sáng: 120 px', {
      fontSize: '13px',
      color: '#cbd5e0'
    });
    this.composureText = HDTextHelper.createText(this.scene, cx - 220, cy - h / 2 + 172, '• Tốc độ hồi Bình Tâm: +0.5/giây | Hong khô Độ Ẩm cực nhanh', {
      fontSize: '13px',
      color: '#cbd5e0'
    });
    this.container.add([this.radiusText, this.composureText]);

    // 5. Nút nạp Gỗ Khô (res_dry_wood)
    const woodBtnBg = this.scene.add.graphics();
    const bx1 = cx - 240;
    const by1 = cy + 45;
    const bw = 230;
    const bh = 50;
    woodBtnBg.fillStyle(0x322419, 0.95);
    woodBtnBg.fillRoundedRect(bx1, by1, bw, bh, 6);
    woodBtnBg.lineStyle(1, 0xdd6b20, 0.8);
    woodBtnBg.strokeRoundedRect(bx1, by1, bw, bh, 6);
    this.container.add(woodBtnBg);

    this.woodBtnText = HDTextHelper.createText(this.scene, bx1 + bw / 2, by1 + bh / 2, '🪵 Nạp 1 Gỗ Khô (+90s)\n(Bạn có: 0)', {
      fontSize: '12px',
      color: '#fbd38d',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.woodBtnText);

    const woodHit = this.scene.add.zone(bx1 + bw / 2, by1 + bh / 2, bw, bh).setInteractive({ useHandCursor: true });
    woodHit.on('pointerdown', () => {
      const res = this.campSystem.addFuel('res_dry_wood', 1);
      this.statusText.setText(res.message);
      this.statusText.setColor(res.success ? '#68d391' : '#fc8181');
      AudioManager.getInstance().playInteract();
      this.refreshView();
    });
    woodHit.on('pointerover', () => {
      woodBtnBg.clear();
      woodBtnBg.fillStyle(0x4a3524, 1.0);
      woodBtnBg.fillRoundedRect(bx1, by1, bw, bh, 6);
      woodBtnBg.lineStyle(1, 0xf6ad55, 1.0);
      woodBtnBg.strokeRoundedRect(bx1, by1, bw, bh, 6);
    });
    woodHit.on('pointerout', () => {
      woodBtnBg.clear();
      woodBtnBg.fillStyle(0x322419, 0.95);
      woodBtnBg.fillRoundedRect(bx1, by1, bw, bh, 6);
      woodBtnBg.lineStyle(1, 0xdd6b20, 0.8);
      woodBtnBg.strokeRoundedRect(bx1, by1, bw, bh, 6);
    });
    this.container.add(woodHit);

    // 6. Nút nạp Nhựa Cây (res_tree_resin)
    const resinBtnBg = this.scene.add.graphics();
    const bx2 = cx + 10;
    const by2 = cy + 45;
    resinBtnBg.fillStyle(0x272719, 0.95);
    resinBtnBg.fillRoundedRect(bx2, by2, bw, bh, 6);
    resinBtnBg.lineStyle(1, 0xd69e2e, 0.8);
    resinBtnBg.strokeRoundedRect(bx2, by2, bw, bh, 6);
    this.container.add(resinBtnBg);

    this.resinBtnText = HDTextHelper.createText(this.scene, bx2 + bw / 2, by2 + bh / 2, '🍯 Nạp 1 Nhựa Cây (+150s)\n(Bạn có: 0)', {
      fontSize: '12px',
      color: '#faf089',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(this.resinBtnText);

    const resinHit = this.scene.add.zone(bx2 + bw / 2, by2 + bh / 2, bw, bh).setInteractive({ useHandCursor: true });
    resinHit.on('pointerdown', () => {
      const res = this.campSystem.addFuel('res_tree_resin', 1);
      this.statusText.setText(res.message);
      this.statusText.setColor(res.success ? '#68d391' : '#fc8181');
      AudioManager.getInstance().playInteract();
      this.refreshView();
    });
    resinHit.on('pointerover', () => {
      resinBtnBg.clear();
      resinBtnBg.fillStyle(0x3e3e26, 1.0);
      resinBtnBg.fillRoundedRect(bx2, by2, bw, bh, 6);
      resinBtnBg.lineStyle(1, 0xf6e05e, 1.0);
      resinBtnBg.strokeRoundedRect(bx2, by2, bw, bh, 6);
    });
    resinHit.on('pointerout', () => {
      resinBtnBg.clear();
      resinBtnBg.fillStyle(0x272719, 0.95);
      resinBtnBg.fillRoundedRect(bx2, by2, bw, bh, 6);
      resinBtnBg.lineStyle(1, 0xd69e2e, 0.8);
      resinBtnBg.strokeRoundedRect(bx2, by2, bw, bh, 6);
    });
    this.container.add(resinHit);

    // 7. Thông báo trạng thái
    this.statusText = HDTextHelper.createText(
      this.scene,
      cx,
      cy + 130,
      'Duy trì ngọn lửa để sưởi ấm thân nhiệt và giữ an toàn cho làng.',
      {
        fontSize: '13px',
        color: '#a0aec0',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
    this.container.add(this.statusText);

    // 8. Nút đóng [X]
    const closeBtn = this.scene.add.text(cx + w / 2 - 25, cy - h / 2 + 25, '✖', {
      fontSize: '18px',
      color: '#e2e8f0'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());
    closeBtn.on('pointerover', () => closeBtn.setColor('#e53e3e'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#e2e8f0'));
    this.container.add(closeBtn);
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.lastToggleTime = Date.now();
    this.container.setVisible(true);
    this.refreshView();
    if (this.onOpen) this.onOpen();
    AudioManager.getInstance().playInteract();
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) this.onClose();
    AudioManager.getInstance().playInteract();
  }

  public toggle(): void {
    if (Date.now() - this.lastToggleTime < 250) return;
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public refreshView(): void {
    if (!this.isOpen) return;

    const level = this.campSystem.getCampfireLevel();
    const fuel = Math.round(this.campSystem.getCampfireFuel());
    const radius = this.campSystem.getCampfireRadius();
    const compBonus = this.campSystem.getComposureBonus();

    const levelName = level === 3 ? 'CẤP 3: RỰC RỠ 🔥🔥🔥' : level === 2 ? 'CẤP 2: CHÁY ĐỀU 🔥🔥' : 'CẤP 1: LE LÓI 🔥';
    this.levelText.setText(`CẤP ĐỘ: ${levelName}`);
    this.levelText.setColor(level === 3 ? '#fc8181' : level === 2 ? '#f6ad55' : '#ecc94b');

    const minutes = Math.floor(fuel / 60);
    const seconds = fuel % 60;
    this.fuelText.setText(`Thời gian cháy còn lại: ${minutes}m ${seconds}s (${fuel} giây)`);

    this.radiusText.setText(`• Bán kính sưởi ấm & ánh sáng: ${radius} px`);
    this.composureText.setText(`• Tốc độ hồi Bình Tâm: +${compBonus}/giây | Hong khô Độ Ẩm cực nhanh`);

    const woodCount = this.playerState.getItemCount('res_dry_wood');
    const resinCount = this.playerState.getItemCount('res_tree_resin');

    this.woodBtnText.setText(`🪵 Nạp 1 Gỗ Khô (+90s)\n(Bạn có: ${woodCount})`);
    this.resinBtnText.setText(`🍯 Nạp 1 Nhựa Cây (+150s)\n(Bạn có: ${resinCount})`);
  }

  public destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
  }
}
