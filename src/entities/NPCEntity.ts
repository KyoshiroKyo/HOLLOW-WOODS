import * as Phaser from 'phaser';
import {
  SPRITE_NPC_GARTH,
  SPRITE_NPC_EDDA,
  SPRITE_NPC_NERIS
} from '../config/Constants';

export interface NPCSpec {
  id: string;
  name: string;
  title: string;
  x: number;
  y: number;
  dialogueKey: string;
  robeColor?: number;
  hoodColor?: number;
}

export class NPCEntity extends Phaser.GameObjects.Container {
  public spec: NPCSpec;
  private promptBubble: Phaser.GameObjects.Container;
  private isPlayerNearby: boolean = false;
  public npcSprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, spec: NPCSpec) {
    super(scene, spec.x, spec.y);
    this.spec = spec;

    // 1. Phân giải đúng sprite pixel art cho từng NPC (PASS T09 - Xóa bỏ hoàn toàn hình khối thô sơ)
    let spriteKey = SPRITE_NPC_GARTH;
    if (spec.id === 'edda' || spec.name.includes('Edda')) {
      spriteKey = SPRITE_NPC_EDDA;
    } else if (spec.id === 'neris' || spec.name.includes('Neris')) {
      spriteKey = SPRITE_NPC_NERIS;
    }

    this.npcSprite = scene.add.image(0, 0, spriteKey);
    this.npcSprite.setOrigin(0.5, 0.90);
    this.add(this.npcSprite);

    // 2. Tên và danh hiệu phía trên
    const nameTag = scene.add.text(0, -42, spec.name, {
      fontFamily: 'serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);
    this.add(nameTag);

    // 3. Bong bóng gợi ý [E] Trò Chuyện
    this.promptBubble = scene.add.container(0, -56);
    const bubbleBg = scene.add.graphics();
    bubbleBg.fillStyle(0x111111, 0.85);
    bubbleBg.fillRoundedRect(-24, -8, 48, 16, 4);
    bubbleBg.lineStyle(1, 0xe67e22, 1);
    bubbleBg.strokeRoundedRect(-24, -8, 48, 16, 4);

    const bubbleText = scene.add.text(0, 0, '[E] Nói', {
      fontFamily: 'sans-serif',
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    this.promptBubble.add([bubbleBg, bubbleText]);
    this.promptBubble.setVisible(false);
    this.add(this.promptBubble);

    scene.add.existing(this);
    this.setDepth(spec.y);

    // Hiệu ứng bập bùng nhẹ của bong bóng
    scene.tweens.add({
      targets: this.promptBubble,
      y: -59,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setNearby(nearby: boolean): void {
    if (this.isPlayerNearby !== nearby) {
      this.isPlayerNearby = nearby;
      this.promptBubble.setVisible(nearby);
    }
  }

  public getNearby(): boolean {
    return this.isPlayerNearby;
  }
}
