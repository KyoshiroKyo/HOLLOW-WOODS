import * as Phaser from 'phaser';
import type { BlackKnightPlayer } from '../entities/BlackKnightPlayer';
import { WORLD_INTERACTION_RADIUS, type InteractableSpec, type ZoneId } from '../types';
import type { WorldBuilder } from '../world/WorldBuilder';
import { HDTextHelper } from './HDTextHelper';

/** F4 inspection of live world geometry in the private QA build. */
export class DebugOverlay {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly text: Phaser.GameObjects.Text;
  private readonly toggleKey: Phaser.Input.Keyboard.Key;
  private visible = false;
  private lastUpdate = -Infinity;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: BlackKnightPlayer,
    uiScene: Phaser.Scene,
    private readonly world: WorldBuilder
  ) {
    this.graphics = scene.add.graphics().setDepth(9999).setVisible(false);
    this.text = HDTextHelper.createText(uiScene, 60, 626, '', {
      fontFamily: 'Consolas, monospace',
      fontSize: '13px',
      color: '#f0ead3',
      backgroundColor: '#101716ed',
      padding: { x: 12, y: 8 }
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(10000).setVisible(false);
    this.toggleKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F4);
  }

  public update(zoneId: ZoneId): void {
    if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) {
      this.visible = !this.visible;
      this.graphics.setVisible(this.visible);
      this.text.setVisible(this.visible);
      this.lastUpdate = -Infinity;
    }
    if (!this.visible || this.scene.time.now - this.lastUpdate < 100) return;
    this.lastUpdate = this.scene.time.now;

    const foot = this.player.getFootPosition();
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const nearest = this.world.getNearbyInteractables(foot, 90).reduce<{
      item: InteractableSpec;
      dist: number;
    } | undefined>((closest, entry) => !closest || entry.dist < closest.dist ? entry : closest, undefined);
    const targetBodyID = nearest?.item.id;
    let candidateBody: Phaser.Physics.Arcade.StaticBody | undefined;
    let candidateID = '';
    let nearestBodyDistance = Infinity;
    let matchingFootprint = false;

    this.graphics.clear();
    this.graphics.lineStyle(0.6, 0x38d0ce, 0.78);
    for (const child of this.world.colliderGroup.getChildren()) {
      const collider = (child as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody | null;
      if (!collider?.enable || collider.right < foot.x - 130 || collider.x > foot.x + 130 ||
          collider.bottom < foot.y - 130 || collider.y > foot.y + 130) continue;
      this.graphics.strokeRect(collider.x, collider.y, collider.width, collider.height);
      const matchesTarget = Boolean(targetBodyID && targetBodyID === child.name);
      if (matchingFootprint && !matchesTarget) continue;
      const distance = Math.hypot(
        foot.x - Phaser.Math.Clamp(foot.x, collider.x, collider.right),
        foot.y - Phaser.Math.Clamp(foot.y, collider.y, collider.bottom)
      );
      if (matchesTarget || distance < nearestBodyDistance) {
        candidateBody = collider;
        candidateID = child.name || '(không có ID)';
        nearestBodyDistance = distance;
        matchingFootprint = matchesTarget;
      }
    }

    this.graphics.lineStyle(0.8, 0x50a9ff, 1);
    if (body?.enable) this.graphics.strokeRect(body.x, body.y, body.width, body.height);
    this.graphics.fillStyle(0x50a9ff).fillCircle(foot.x, foot.y, 1.7);
    if (candidateBody) {
      this.graphics.lineStyle(1, 0x38d0ce, 1)
        .strokeRect(candidateBody.x, candidateBody.y, candidateBody.width, candidateBody.height);
    }

    const item = nearest?.item;
    const radius = item?.triggerRadius ?? WORLD_INTERACTION_RADIUS;
    if (item) {
      this.graphics.lineStyle(0.6, 0xffca65, 0.82).strokeCircle(item.x, item.y, radius);
      this.graphics.fillStyle(0xffca65).fillCircle(item.x, item.y, 2);
    }

    const xy = (x: number, y: number) => '(' + x.toFixed(1) + ', ' + y.toFixed(1) + ')';
    const box = (b: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody) =>
      xy(b.x, b.y) + ' · ' + b.width.toFixed(1) + ' × ' + b.height.toFixed(1);
    this.text.setText([
      '[F4] WORLD QA',
      'Zone ' + zoneId + ' · Người chơi ' + xy(foot.x, foot.y),
      'Body người chơi ' + (body ? box(body) : '—'),
      item ? 'Object ID gần nhất ' + item.id : 'Object ID —',
      item ? 'Anchor ' + xy(item.x, item.y) + ' · R ' + radius + ' · D ' + nearest.dist.toFixed(1) : 'Anchor —',
      'Collider ' + (candidateBody ? candidateID + ' ' + box(candidateBody) : '—')
    ]);
  }

  public destroy(): void {
    this.scene.input.keyboard?.removeKey(this.toggleKey, true);
    this.graphics.destroy();
    this.text.destroy();
  }
}
