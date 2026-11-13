import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import itemsData from '../data/items.json';

export interface ResourceNodeSpec {
  id: string;
  itemId: string;
  x: number;
  y: number;
  count: number;
}

export class InventorySystem {
  private scene: Phaser.Scene;
  private playerState: PlayerState;
  private nodes: { spec: ResourceNodeSpec; visual: Phaser.GameObjects.Container; available: boolean }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();
    this.spawnDefaultResourceNodes();
  }

  private spawnDefaultResourceNodes(): void {
    // Đặt các điểm thu thập tài nguyên hợp lý trên bản đồ 5 phân khu
    const defaultNodes: ResourceNodeSpec[] = [
      // 1. Quanh Fog Crossing và cổng làng
      { id: 'node_wood_1', itemId: 'res_dry_wood', x: 220, y: 130, count: 1 },
      { id: 'node_wood_2', itemId: 'res_dry_wood', x: 380, y: 250, count: 1 },
      
      // 2. Làng Bellhollow
      { id: 'node_flint_1', itemId: 'res_flint', x: 620, y: 350, count: 1 },
      { id: 'node_resin_1', itemId: 'res_tree_resin', x: 880, y: 200, count: 1 },
      { id: 'node_herb_1', itemId: 'res_herbs', x: 1040, y: 180, count: 2 },
      { id: 'node_herb_2', itemId: 'res_herbs', x: 740, y: 440, count: 1 },
      { id: 'node_wood_3', itemId: 'res_dry_wood', x: 1120, y: 380, count: 1 },

      // 3. The Crooked Path
      { id: 'node_resin_2', itemId: 'res_tree_resin', x: 1780, y: 190, count: 1 },
      { id: 'node_wood_4', itemId: 'res_dry_wood', x: 2050, y: 360, count: 2 },
      { id: 'node_flint_2', itemId: 'res_flint', x: 2220, y: 210, count: 1 },
      { id: 'node_herb_3', itemId: 'res_herbs', x: 2450, y: 260, count: 2 },

      // 4. Silent Mire
      { id: 'node_herb_4', itemId: 'res_herbs', x: 3050, y: 280, count: 2 },
      { id: 'node_herb_5', itemId: 'res_herbs', x: 3350, y: 380, count: 2 },
      { id: 'node_resin_3', itemId: 'res_tree_resin', x: 3700, y: 180, count: 1 }
    ];

    for (const spec of defaultNodes) {
      this.createNodeVisual(spec);
    }
  }

  private createNodeVisual(spec: ResourceNodeSpec): void {
    const itemMeta = itemsData.items.find(i => i.id === spec.itemId);
    const colorHex = itemMeta ? parseInt(itemMeta.iconColor.replace('#', '0x')) : 0x2ecc71;

    const container = this.scene.add.container(spec.x, spec.y);
    const g = this.scene.add.graphics();
    
    // Hạt tài nguyên phát sáng nhẹ
    g.fillStyle(colorHex, 0.9);
    g.fillCircle(0, 0, 4);
    g.lineStyle(1, 0xffffff, 0.8);
    g.strokeCircle(0, 0, 4);

    // Hạt hào quang xung quanh
    g.fillStyle(colorHex, 0.3);
    g.fillCircle(0, 0, 8);

    container.add(g);
    container.setDepth(spec.y);

    // Hiệu ứng lơ lửng nhấp nháy
    this.scene.tweens.add({
      targets: container,
      y: spec.y - 3,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.nodes.push({ spec, visual: container, available: true });
  }

  public checkHarvestNearby(playerX: number, playerY: number, harvestRadius: number = 32): { harvested: boolean; itemName: string } | null {
    for (const node of this.nodes) {
      if (!node.available) continue;

      const dist = Math.hypot(playerX - node.spec.x, playerY - node.spec.y);
      if (dist <= harvestRadius) {
        // Thu hoạch tài nguyên
        node.available = false;
        node.visual.setVisible(false);

        this.playerState.addItem(node.spec.itemId, node.spec.count);

        const itemMeta = itemsData.items.find(i => i.id === node.spec.itemId);
        const itemName = itemMeta ? itemMeta.name : node.spec.itemId;

        // Tạo hiệu ứng nổ hạt nhặt đồ
        this.createPickupEffect(node.spec.x, node.spec.y, itemName, node.spec.count);

        // Hồi sinh tài nguyên sau 40 giây
        this.scene.time.delayedCall(40000, () => {
          node.available = true;
          node.visual.setVisible(true);
        });

        return { harvested: true, itemName };
      }
    }
    return null;
  }

  private createPickupEffect(x: number, y: number, name: string, count: number): void {
    const text = this.scene.add.text(x, y - 10, `+${count} ${name}`, {
      fontFamily: 'sans-serif',
      fontSize: '10px',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(10000);

    this.scene.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
}

