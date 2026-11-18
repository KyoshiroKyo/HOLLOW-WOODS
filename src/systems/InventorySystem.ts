import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import itemsData from '../data/items.json';
import {
  SPRITE_RES_DRY_WOOD,
  SPRITE_RES_TREE_RESIN,
  SPRITE_RES_FLINT,
  SPRITE_RES_HERBS,
  SPRITE_RES_RUNED_IRON
} from '../config/Constants';

export interface ResourceNodeSpec {
  id: string;
  itemId: string;
  x: number;
  y: number;
  count: number;
}

export interface NearbyResourceInfo {
  id: string;
  itemId: string;
  itemName: string;
  count: number;
  x: number;
  y: number;
  distance: number;
}

export interface HarvestResult {
  harvested: boolean;
  nodeId: string;
  itemId: string;
  itemName: string;
  count: number;
}

export class InventorySystem {
  public static readonly DEFAULT_INTERACTION_RADIUS = 38;
  public static readonly RESPAWN_DELAY_MS = 40000;

  private scene: Phaser.Scene;
  private playerState: PlayerState;
  private lastHarvestTime: number = 0;
  private nodes: {
    spec: ResourceNodeSpec;
    visual: Phaser.GameObjects.Container;
    available: boolean;
    respawnTimer?: Phaser.Time.TimerEvent;
  }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();
    this.spawnDefaultResourceNodes();
    this.syncDepletedState();
  }

  private getSpriteKeyForItem(itemId: string): string {
    switch (itemId) {
      case 'res_dry_wood':
        return SPRITE_RES_DRY_WOOD;
      case 'res_tree_resin':
        return SPRITE_RES_TREE_RESIN;
      case 'res_flint':
        return SPRITE_RES_FLINT;
      case 'res_herbs':
        return SPRITE_RES_HERBS;
      case 'mat_runed_iron':
      case 'res_runed_iron':
        return SPRITE_RES_RUNED_IRON;
      default:
        return SPRITE_RES_DRY_WOOD;
    }
  }

  private spawnDefaultResourceNodes(): void {
    // Đặt các điểm thu thập tài nguyên hợp lý trên bản đồ 5 phân khu
    const defaultNodes: ResourceNodeSpec[] = [
      // 1. Quanh Fog Crossing và cổng làng
      { id: 'node_wood_1', itemId: 'res_dry_wood', x: 220, y: 130, count: 1 },
      { id: 'node_wood_2', itemId: 'res_dry_wood', x: 380, y: 250, count: 1 },

      // 2. Làng Bellhollow (V15-13: Dọn sạch lòng đường, bố trí sát gốc cây, góc vườn & kho củi)
      { id: 'node_wood_bellhollow_1', itemId: 'res_dry_wood', x: 610, y: 145, count: 1 },
      { id: 'node_resin_bellhollow_2', itemId: 'res_tree_resin', x: 730, y: 80, count: 1 },
      { id: 'node_flint_1', itemId: 'res_flint', x: 510, y: 490, count: 1 },
      { id: 'node_resin_1', itemId: 'res_tree_resin', x: 970, y: 75, count: 1 },
      { id: 'node_herb_1', itemId: 'res_herbs', x: 1190, y: 85, count: 2 },
      { id: 'node_herb_2', itemId: 'res_herbs', x: 620, y: 470, count: 1 },
      { id: 'node_wood_3', itemId: 'res_dry_wood', x: 1330, y: 410, count: 1 },

      // 2B. C4-12-20: Rừng Ngoại Vi (Outer Woods: x=1120..1600, y=560..1040 - Vùng tài nguyên tự do đầu game)
      { id: 'node_wood_ow_1', itemId: 'res_dry_wood', x: 1190, y: 650, count: 1 },
      { id: 'node_resin_ow_1', itemId: 'res_tree_resin', x: 1360, y: 620, count: 1 },
      { id: 'node_flint_ow_1', itemId: 'res_flint', x: 1300, y: 755, count: 1 },
      { id: 'node_wood_ow_2', itemId: 'res_dry_wood', x: 1380, y: 720, count: 1 },
      { id: 'node_herb_ow_1', itemId: 'res_herbs', x: 1440, y: 770, count: 2 },
      { id: 'node_flint_ow_2', itemId: 'res_flint', x: 1485, y: 830, count: 1 },
      { id: 'node_wood_ow_3', itemId: 'res_dry_wood', x: 1230, y: 940, count: 1 },
      { id: 'node_resin_ow_2', itemId: 'res_tree_resin', x: 1320, y: 910, count: 1 },
      { id: 'node_herb_ow_2', itemId: 'res_herbs', x: 1280, y: 950, count: 1 },

      // 3. The Crooked Path (Frontier Exploration: x=1600..2880, y=0..640)
      { id: 'node_wood_cp_1', itemId: 'res_dry_wood', x: 1690, y: 430, count: 1 },
      { id: 'node_resin_2', itemId: 'res_tree_resin', x: 1780, y: 190, count: 1 },
      { id: 'node_wood_4', itemId: 'res_dry_wood', x: 2050, y: 360, count: 2 },
      { id: 'node_flint_2', itemId: 'res_flint', x: 2220, y: 210, count: 1 },
      { id: 'node_flint_cp_1', itemId: 'res_flint', x: 2140, y: 320, count: 1 },
      { id: 'node_herb_3', itemId: 'res_herbs', x: 2450, y: 260, count: 2 },
      { id: 'node_herb_cp_2', itemId: 'res_herbs', x: 2700, y: 340, count: 2 },

      // 3B. C4-12-22: Deep Forest (Frontier Wilderness: x=1600..2880, y=-640..0)
      { id: 'node_wood_df_1', itemId: 'res_dry_wood', x: 2030, y: -90, count: 2 },
      { id: 'node_herb_df_1', itemId: 'res_herbs', x: 1780, y: -210, count: 2 },
      { id: 'node_resin_df_1', itemId: 'res_tree_resin', x: 1860, y: -250, count: 1 },
      { id: 'node_flint_df_1', itemId: 'res_flint', x: 2140, y: -350, count: 2 },
      { id: 'node_wood_df_2', itemId: 'res_dry_wood', x: 2360, y: -360, count: 2 },
      { id: 'node_herb_df_2', itemId: 'res_herbs', x: 2720, y: -280, count: 2 },

      // 4. Silent Mire (Forbidden Mire: x=2880..4000, y=100..740)
      { id: 'node_herb_4', itemId: 'res_herbs', x: 3050, y: 280, count: 2 },
      { id: 'node_wood_sm_1', itemId: 'res_dry_wood', x: 3180, y: 310, count: 2 },
      { id: 'node_herb_5', itemId: 'res_herbs', x: 3350, y: 380, count: 2 },
      { id: 'node_resin_3', itemId: 'res_tree_resin', x: 3700, y: 180, count: 1 },
      { id: 'node_flint_sm_1', itemId: 'res_flint', x: 3780, y: 320, count: 1 },
      // V15-12: Phôi Sắt Cổ Ngữ thu thập tại Phế Tích Đầm Lầy
      { id: 'node_iron_sm_1', itemId: 'mat_runed_iron', x: 3560, y: 390, count: 1 }
    ];

    for (const spec of defaultNodes) {
      this.createNodeVisual(spec);
    }
  }

  private createNodeVisual(spec: ResourceNodeSpec): void {
    const itemMeta = itemsData.items.find(i => i.id === spec.itemId);
    const colorHex = itemMeta ? parseInt(itemMeta.iconColor.replace('#', '0x')) : 0x2ecc71;
    const spriteKey = this.getSpriteKeyForItem(spec.itemId);

    const container = this.scene.add.container(spec.x, spec.y);

    // C4-13-06 & V15-12: Bóng đổ mặt đất đen mờ mịn (alpha 0.25) ôm sát vật phẩm
    const baseGfx = this.scene.add.graphics();
    baseGfx.fillStyle(0x000000, 0.25);
    baseGfx.fillEllipse(0, 5, 12, 4);
    container.add(baseGfx);

    let bobTarget: Phaser.GameObjects.GameObject = container;
    if (this.scene.textures && this.scene.textures.exists(spriteKey)) {
      const iconImg = this.scene.add.image(0, -1, spriteKey);
      iconImg.setOrigin(0.5, 0.5);
      iconImg.setScale(1.0); // 24×24 world px sắc nét chuẩn V15-12
      container.add(iconImg);
      bobTarget = iconImg;
    } else {
      const fallback = this.scene.add.graphics();
      fallback.fillStyle(colorHex, 0.95);
      fallback.fillCircle(0, -1, 7);
      fallback.lineStyle(1, 0x111111, 1);
      fallback.strokeCircle(0, -1, 7);
      container.add(fallback);
    }

    container.setDepth(spec.y);

    // Hiệu ứng nhấp nhô nhẹ cho icon (giữ bóng mặt đất cố định)
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: bobTarget,
        y: bobTarget === container ? spec.y - 2 : -3,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.nodes.push({ spec, visual: container, available: true });
  }

  /**
   * Đồng bộ trạng thái cạn kiệt của các mỏ tài nguyên sau khi Load Game
   */
  public syncDepletedState(): void {
    for (const node of this.nodes) {
      const isDepleted = this.playerState.isNodeDepleted(node.spec.id);
      if (isDepleted) {
        node.available = false;
        node.visual.setVisible(false);
        this.scheduleRespawn(node);
      } else {
        if (node.respawnTimer) {
          node.respawnTimer.remove(false);
          node.respawnTimer = undefined;
        }
        node.available = true;
        node.visual.setVisible(true);
      }
    }
  }

  private scheduleRespawn(node: {
    spec: ResourceNodeSpec;
    visual: Phaser.GameObjects.Container;
    available: boolean;
    respawnTimer?: Phaser.Time.TimerEvent;
  }): void {
    if (node.respawnTimer || !this.scene.time) return;
    node.respawnTimer = this.scene.time.delayedCall(InventorySystem.RESPAWN_DELAY_MS, () => {
      node.respawnTimer = undefined;
      this.playerState.clearNodeDepleted(node.spec.id);
      node.available = true;
      node.visual.setVisible(true);
    });
  }

  public getNearbyAvailableNode(
    playerX: number,
    playerY: number,
    radius: number = InventorySystem.DEFAULT_INTERACTION_RADIUS
  ): NearbyResourceInfo | null {
    let bestSpec: ResourceNodeSpec | null = null;
    let bestDistSq = radius * radius;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (!node.available || this.playerState.isNodeDepleted(node.spec.id)) continue;
      const dx = playerX - node.spec.x;
      if (Math.abs(dx) > radius) continue;
      const dy = playerY - node.spec.y;
      if (Math.abs(dy) > radius) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq <= bestDistSq) {
        bestDistSq = distSq;
        bestSpec = node.spec;
      }
    }

    if (!bestSpec) return null;

    const itemMeta = itemsData.items.find(i => i.id === bestSpec!.itemId);
    const itemName = itemMeta ? itemMeta.name : bestSpec.itemId;

    return {
      id: bestSpec.id,
      itemId: bestSpec.itemId,
      itemName,
      count: bestSpec.count,
      x: bestSpec.x,
      y: bestSpec.y,
      distance: Math.sqrt(bestDistSq)
    };
  }

  public checkHarvestNearby(
    playerX: number,
    playerY: number,
    harvestRadius: number = InventorySystem.DEFAULT_INTERACTION_RADIUS
  ): HarvestResult | null {
    // C4-12-04: Debounce 250ms chống spam bấm phím [E] liên tục gây lỗi thu hoạch trùng lặp
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastHarvestTime < 250) {
      return null;
    }

    let targetNode: (typeof this.nodes)[number] | null = null;
    let bestDist = Infinity;

    for (const node of this.nodes) {
      if (!node.available || this.playerState.isNodeDepleted(node.spec.id)) continue;
      const dist = Math.hypot(playerX - node.spec.x, playerY - node.spec.y);
      if (dist <= harvestRadius && dist < bestDist) {
        bestDist = dist;
        targetNode = node;
      }
    }

    if (!targetNode) return null;

    // Ghi nhận mốc thời gian và khóa ngay lập tức để chống thu thập trùng lặp
    this.lastHarvestTime = now;
    targetNode.available = false;
    targetNode.visual.setVisible(false);

    this.playerState.recordResourceHarvest(
      targetNode.spec.itemId,
      targetNode.spec.count,
      targetNode.spec.id
    );

    const itemMeta = itemsData.items.find(i => i.id === targetNode!.spec.itemId);
    const itemName = itemMeta ? itemMeta.name : targetNode.spec.itemId;

    // Tạo hiệu ứng nổ chữ nhặt đồ
    this.createPickupEffect(targetNode.spec.x, targetNode.spec.y, itemName, targetNode.spec.count);

    // Hồi sinh tài nguyên sau 40 giây
    this.scheduleRespawn(targetNode);

    return {
      harvested: true,
      nodeId: targetNode.spec.id,
      itemId: targetNode.spec.itemId,
      itemName,
      count: targetNode.spec.count
    };
  }

  public getNodesSnapshot(): { id: string; itemId: string; x: number; y: number; count: number; available: boolean }[] {
    return this.nodes.map(n => ({
      id: n.spec.id,
      itemId: n.spec.itemId,
      x: n.spec.x,
      y: n.spec.y,
      count: n.spec.count,
      available: n.available
    }));
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

    // C4-13-18: Tung 5 hạt lấp lánh màu xanh khi thu thập, đảm bảo 100% hạt tự destroy sau 500-700ms, không đọng lại
    this.createHarvestParticles(x, y);
  }

  private createHarvestParticles(x: number, y: number): void {
    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const p = this.scene.add.graphics();
      p.fillStyle(0x2ecc71, 0.9);
      p.fillCircle(0, 0, 2);
      p.setPosition(x, y);
      p.setDepth(9999);

      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 14 + Math.random() * 12;
      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist - 18;

      this.scene.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.5,
        duration: 550 + Math.random() * 150,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          p.destroy();
        },
        onStop: () => {
          p.destroy();
        }
      });

      // C4-132-05: Hẹn giờ an toàn tự hủy tối đa 800ms để tuyệt đối không còn bất kỳ chấm tròn màu xanh nào đọng lại lơ lửng trên bản đồ
      this.scene.time.delayedCall(800, () => {
        if (p && p.active) {
          p.destroy();
        }
      });
    }
  }
}

