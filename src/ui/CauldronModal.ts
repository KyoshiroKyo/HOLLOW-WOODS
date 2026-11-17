/**
 * HOLLOW WOODS V1.4 - PHẦN 3: BƯỚC V14-P3-01
 * GIAO DIỆN NỒI THẢO DƯỢC NERIS (CAULDRON MODAL)
 * Thiết kế chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360)
 */

import * as Phaser from 'phaser';
import { CampSystem, CauldronRecipe } from '../systems/CampSystem';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';

export class CauldronModal {
  private scene: Phaser.Scene;
  private campSystem: CampSystem;
  private playerState: PlayerState;

  private container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;
  private lastToggleTime: number = 0;

  public onOpen?: () => void;
  public onClose?: () => void;

  private recipeListContainer!: Phaser.GameObjects.Container;
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

    this.playerState.on('inventory_changed', () => {
      if (this.isOpen) this.refreshView();
    });
  }

  private buildUI(): void {
    const cx = 640;
    const cy = 360;
    const w = 720;
    const h = 480;

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

    // 2. Khung viền đồng mạ rêu thảo mộc
    const panel = this.scene.add.graphics();
    panel.fillStyle(0x15221b, 0.96);
    panel.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    panel.lineStyle(2, 0x48bb78, 0.85); // Viền lục dược thảo
    panel.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
    panel.lineStyle(1, 0x22543d, 0.6);
    panel.strokeRoundedRect(cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8, 6);
    this.container.add(panel);

    // 3. Tiêu đề
    const title = HDTextHelper.createText(
      this.scene,
      cx,
      cy - h / 2 + 28,
      '🌿 NỒI THẢO DƯỢC NERIS',
      {
        fontSize: '20px',
        color: '#68d391',
        fontStyle: 'bold',
        fontFamily: 'serif'
      }
    ).setOrigin(0.5);
    this.container.add(title);

    const subtitle = HDTextHelper.createText(
      this.scene,
      cx,
      cy - h / 2 + 54,
      'Sắc các loại thuốc đắp, trà an thần và tinh dầu thắp sáng trước khi vào rừng.',
      {
        fontSize: '13px',
        color: '#a0aec0',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
    this.container.add(subtitle);

    // 4. Danh sách công thức
    this.recipeListContainer = this.scene.add.container(cx - w / 2 + 30, cy - h / 2 + 80);
    this.container.add(this.recipeListContainer);

    // 5. Thông báo trạng thái
    this.statusText = HDTextHelper.createText(
      this.scene,
      cx,
      cy + h / 2 - 30,
      'Chọn bài thuốc muốn sắc. Nguyên liệu sẽ được trích từ túi đồ của bạn.',
      {
        fontSize: '13px',
        color: '#a0aec0',
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);
    this.container.add(this.statusText);

    // 6. Nút đóng [X]
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

    this.recipeListContainer.removeAll(true);
    const recipes = this.campSystem.getCauldronRecipes();

    const rowW = 660;
    const rowH = 95;
    const padY = 12;

    recipes.forEach((recipe: CauldronRecipe, idx: number) => {
      const ry = idx * (rowH + padY);
      const check = this.campSystem.canBrewRecipe(recipe.id);

      const rowGfx = this.scene.add.graphics();
      rowGfx.fillStyle(check.canBrew ? 0x1f3427 : 0x18241c, 0.95);
      rowGfx.fillRoundedRect(0, ry, rowW, rowH, 6);
      rowGfx.lineStyle(1, check.canBrew ? 0x48bb78 : 0x2d3748, 0.7);
      rowGfx.strokeRoundedRect(0, ry, rowW, rowH, 6);
      this.recipeListContainer.add(rowGfx);

      // Tên công thức
      const nameText = HDTextHelper.createText(this.scene, 16, ry + 12, recipe.name, {
        fontSize: '15px',
        color: check.canBrew ? '#68d391' : '#a0aec0',
        fontStyle: 'bold'
      });

      // Mô tả
      const descText = HDTextHelper.createText(this.scene, 16, ry + 36, recipe.description, {
        fontSize: '12px',
        color: '#cbd5e0',
        wordWrap: { width: 480 }
      });

      // Nguyên liệu yêu cầu
      const ingStrings = recipe.ingredients.map(ing => {
        const has = this.playerState.getItemCount(ing.key);
        return `${ing.name}: ${has}/${ing.count}`;
      });
      const ingText = HDTextHelper.createText(this.scene, 16, ry + 68, `Nguyên liệu: ${ingStrings.join(' | ')}`, {
        fontSize: '11px',
        color: '#f6ad55'
      });

      this.recipeListContainer.add([nameText, descText, ingText]);

      // Nút Sắc Thuốc
      const btnW = 120;
      const btnH = 38;
      const btnX = rowW - btnW - 16;
      const btnY = ry + (rowH - btnH) / 2;

      const btnGfx = this.scene.add.graphics();
      btnGfx.fillStyle(check.canBrew ? 0x2f855a : 0x2d3748, 1);
      btnGfx.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
      if (check.canBrew) {
        btnGfx.lineStyle(1, 0x68d391, 0.8);
        btnGfx.strokeRoundedRect(btnX, btnY, btnW, btnH, 4);
      }
      this.recipeListContainer.add(btnGfx);

      const btnLabel = HDTextHelper.createText(
        this.scene,
        btnX + btnW / 2,
        btnY + btnH / 2,
        check.canBrew ? '🧪 SẮC THUỐC' : 'THIẾU ĐỒ',
        {
          fontSize: '12px',
          color: check.canBrew ? '#ffffff' : '#718096',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      this.recipeListContainer.add(btnLabel);

      if (check.canBrew) {
        const hitZone = this.scene.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH)
          .setInteractive({ useHandCursor: true });
        hitZone.on('pointerdown', () => {
          const res = this.campSystem.brewRecipe(recipe.id);
          this.statusText.setText(res.message);
          this.statusText.setColor(res.success ? '#68d391' : '#fc8181');
          AudioManager.getInstance().playInteract();
          this.refreshView();
        });
        hitZone.on('pointerover', () => {
          btnGfx.clear();
          btnGfx.fillStyle(0x38a169, 1);
          btnGfx.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
          btnGfx.lineStyle(1, 0x9ae6b4, 1);
          btnGfx.strokeRoundedRect(btnX, btnY, btnW, btnH, 4);
        });
        hitZone.on('pointerout', () => {
          btnGfx.clear();
          btnGfx.fillStyle(0x2f855a, 1);
          btnGfx.fillRoundedRect(btnX, btnY, btnW, btnH, 4);
          btnGfx.lineStyle(1, 0x68d391, 0.8);
          btnGfx.strokeRoundedRect(btnX, btnY, btnW, btnH, 4);
        });
        this.recipeListContainer.add(hitZone);
      }
    });
  }

  public destroy(): void {
    if (this.container) {
      this.container.destroy();
    }
  }
}
