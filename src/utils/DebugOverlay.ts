/**
 * HOLLOW WOODS V1.3
 * HD DEBUG OVERLAY (PHÍM F4)
 * Hiển thị chuẩn khung 64×64 của Satyr và hộp va chạm chân 14×8 px trên độ phân giải 1280×720
 * Bảng chữ số liệu render tại UIScene (Zoom 1.0), bounding box render tại GameScene (World Space)
 */

import * as Phaser from 'phaser';
import { SatyrPlayer } from '../entities/SatyrPlayer';
import { 
  SATYR_FRAME_WIDTH, 
  SATYR_FRAME_HEIGHT, 
  SATYR_ORIGIN_X, 
  SATYR_ORIGIN_Y,
  SATYR_BODY_WIDTH,
  SATYR_BODY_HEIGHT,
  SATYR_BODY_OFFSET_X,
  SATYR_BODY_OFFSET_Y
} from '../config/Constants';
import { ZoneId } from '../types';
import { HDTextHelper } from './HDTextHelper';

export class DebugOverlay {
  private scene: Phaser.Scene;
  private uiScene: Phaser.Scene;
  private player: SatyrPlayer;
  private graphics: Phaser.GameObjects.Graphics;
  private textObject: Phaser.GameObjects.Text;
  private isVisible: boolean = false;
  private f4Key: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, player: SatyrPlayer, uiScene?: Phaser.Scene) {
    this.scene = scene;
    this.uiScene = uiScene || scene;
    this.player = player;

    // Graphics vẽ trong GameScene (world coordinates bao quanh player)
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(9999);

    // Bảng thông số Debug chuẩn HD đặt tại (24, 140) trên UIScene (Zoom 1.0 cố định)
    this.textObject = HDTextHelper.createText(this.uiScene, 24, 140, '', {
      fontFamily: 'Consolas, monospace',
      fontSize: '13px',
      color: '#00ffcc',
      backgroundColor: '#0a0e14dd',
      padding: { x: 12, y: 10 },
      stroke: '#000000',
      strokeThickness: 2
    });
    this.textObject.setScrollFactor(0);
    this.textObject.setDepth(10000);

    this.graphics.setVisible(this.isVisible);
    this.textObject.setVisible(this.isVisible);

    if (scene.input && scene.input.keyboard) {
      this.f4Key = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F4);
    } else {
      throw new Error('Keyboard input not available');
    }
  }

  public setUIScene(uiScene: Phaser.Scene): void {
    if (this.uiScene !== uiScene) {
      if (this.textObject) {
        this.textObject.destroy();
      }
      this.uiScene = uiScene;
      this.textObject = HDTextHelper.createText(this.uiScene, 24, 140, '', {
        fontFamily: 'Consolas, monospace',
        fontSize: '13px',
        color: '#00ffcc',
        backgroundColor: '#0a0e14dd',
        padding: { x: 12, y: 10 },
        stroke: '#000000',
        strokeThickness: 2
      });
      this.textObject.setScrollFactor(0);
      this.textObject.setDepth(10000);
      this.textObject.setVisible(this.isVisible);
    }
  }

  public update(currentZoneId: ZoneId): void {
    if (Phaser.Input.Keyboard.JustDown(this.f4Key)) {
      this.isVisible = !this.isVisible;
      this.graphics.setVisible(this.isVisible);
      this.textObject.setVisible(this.isVisible);
    }

    if (!this.isVisible) return;

    this.graphics.clear();

    const px = this.player.x;
    const py = this.player.y;

    // 1. Vẽ Canvas Bounds chuẩn 64×64 của Satyr (Khung vàng)
    const canvasTopLeftX = px - SATYR_FRAME_WIDTH * SATYR_ORIGIN_X;
    const canvasTopLeftY = py - SATYR_FRAME_HEIGHT * SATYR_ORIGIN_Y;
    this.graphics.lineStyle(1.5, 0xf1c40f, 0.95);
    this.graphics.strokeRect(canvasTopLeftX, canvasTopLeftY, SATYR_FRAME_WIDTH, SATYR_FRAME_HEIGHT);

    // 2. Vẽ Opaque Bounds thực tế của Satyr (Khoảng 36×58 px màu xanh lá)
    const opaqueTopLeftX = canvasTopLeftX + 14;
    const opaqueTopLeftY = canvasTopLeftY + 4;
    this.graphics.lineStyle(1.5, 0x2ecc71, 0.9);
    this.graphics.strokeRect(opaqueTopLeftX, opaqueTopLeftY, 36, 58);

    // 3. Vẽ Hộp va chạm vật lý gót chân (Collider Body 14×8 px màu xanh dương)
    const bodyTopLeftX = canvasTopLeftX + SATYR_BODY_OFFSET_X;
    const bodyTopLeftY = canvasTopLeftY + SATYR_BODY_OFFSET_Y;
    this.graphics.lineStyle(1.5, 0x3498db, 1);
    this.graphics.fillStyle(0x3498db, 0.45);
    this.graphics.fillRect(bodyTopLeftX, bodyTopLeftY, SATYR_BODY_WIDTH, SATYR_BODY_HEIGHT);
    this.graphics.strokeRect(bodyTopLeftX, bodyTopLeftY, SATYR_BODY_WIDTH, SATYR_BODY_HEIGHT);

    // 4. Vẽ Foot Anchor (Điểm neo gót chân màu đỏ rực)
    this.graphics.fillStyle(0xe74c3c, 1);
    this.graphics.fillCircle(px, py, 3);

    // 5. Cập nhật thông số Debug chuẩn HD
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = body ? Math.round(body.speed) : 0;
    const animName = this.player.anims.currentAnim?.key || 'none';
    const flipStr = this.player.flipX ? 'CÓ (Lật phải)' : 'KHÔNG';

    let cullingInfo = '';
    const wb = (this.scene as any).worldBuilder;
    if (wb && typeof wb.getCullableStats === 'function') {
      const stats = wb.getCullableStats();
      cullingInfo = `  |  Culling: ${stats.visible}/${stats.total} hiện (${stats.culled} ẩn)`;
    }

    this.textObject.setText([
      '=== [F4] THÔNG SỐ KỸ THUẬT NHÂN VẬT SATYR — HOLLOW WOODS V1.4 ===',
      `Tọa độ gót chân: X = ${Math.round(px)}, Y = ${Math.round(py)}`,
      `Phân khu hiện tại: ${currentZoneId}`,
      `Vận tốc: ${speed} px/s  |  Hướng mặt: ${this.player.facing}  |  FlipX: ${flipStr}`,
      `Hoạt ảnh đang chạy: ${animName}`,
      `Khung Sprite Sheet: 64×64 px (Chuẩn lưới Satyr 22 cột × 4 hàng)`,
      `Hộp va chạm chân (Collider): ${SATYR_BODY_WIDTH}×${SATYR_BODY_HEIGHT} px  |  Offset: (${SATYR_BODY_OFFSET_X}, ${SATYR_BODY_OFFSET_Y})`,
      `Điểm neo chân (Origin): (${SATYR_ORIGIN_X.toFixed(2)}, ${SATYR_ORIGIN_Y.toFixed(2)})  |  Bàn chân tại y = 58`,
      `Độ phân giải: 1280×720 HD  |  Camera Zoom: 2.2×  |  FPS: ${Math.round(this.scene.game.loop.actualFps)}${cullingInfo}`
    ]);
  }
}
