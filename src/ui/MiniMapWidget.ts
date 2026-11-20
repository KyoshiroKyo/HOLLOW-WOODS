/**
 * HOLLOW WOODS V1.4 - WOODLAND COMPACT MINI-MAP (PHÍM N)
 * Mini-map định hướng góc trên bên phải màn hình.
 * - Khung viền gỗ tối và đồng cổ bán trong suốt, không che khuất thanh chỉ số sinh tồn.
 * - Nền địa hình đơn giản hóa render vào CanvasTexture tĩnh 1 lần duy nhất khi chuyển map (chống tụt FPS).
 * - Hiển thị chấm sáng người chơi kèm mũi tên xoay theo hướng nhìn.
 * - Hiển thị ngọn đèn lồng đã thắp, điểm lưu game và cổng chuyển vùng lân cận.
 * - TUYỆT ĐỐI KHÔNG HIỂN THỊ QUÁI VẬT để bảo toàn yếu tố kinh dị bất ngờ.
 */

import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { ZoneData, TransitionZone } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';
import { QuestSystem } from '../systems/QuestSystem';

export class MiniMapWidget {
  private scene: Phaser.Scene;
  private playerState: PlayerState;
  public container: Phaser.GameObjects.Container;

  // Tọa độ và kích thước khung Mini-map (Góc trên phải, dưới thanh Quest)
  public static readonly WIDTH = 190;
  public static readonly HEIGHT = 144;
  public static readonly MAP_W = 180;
  public static readonly MAP_H = 120;
  public static readonly POS_X = 1070;
  public static readonly POS_Y = 104;

  private frameBg!: Phaser.GameObjects.Graphics;
  private terrainImage!: Phaser.GameObjects.Image;
  private dynamicGfx!: Phaser.GameObjects.Graphics;
  private headerText!: Phaser.GameObjects.Text;
  private zoneNameText!: Phaser.GameObjects.Text;
  private questHintText!: Phaser.GameObjects.Text;

  private currentZoneId: string = '';
  private currentTransitions: TransitionZone[] = [];
  private targetCompassAngle: number = 0;
  private currentCompassAngle: number = 0;
  private zoneBounds: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 2000, height: 1500 };
  public isVisible: boolean = true;

  public getCurrentZoneId(): string {
    return this.currentZoneId;
  }

  public getPlayerState(): PlayerState {
    return this.playerState;
  }

  constructor(scene: Phaser.Scene, playerState: PlayerState) {
    this.scene = scene;
    this.playerState = playerState;
    this.container = this.scene.add.container(MiniMapWidget.POS_X, MiniMapWidget.POS_Y);
    this.container.setDepth(900); // Nằm trên gameplay, dưới các modal toàn màn hình
    this.container.setVisible(false); // V152-06A: Gỡ bỏ hoàn toàn Mini-map góc màn hình
    this.isVisible = false;
    this.buildWidgetUI();
  }

  private buildWidgetUI(): void {
    const w = MiniMapWidget.WIDTH;
    const h = MiniMapWidget.HEIGHT;
    const mapW = MiniMapWidget.MAP_W;
    const mapH = MiniMapWidget.MAP_H;
    const offsetX = (w - mapW) / 2;
    const offsetY = 20;

    // 1. Khung viền gỗ tối & đồng cổ (Aged Walnut & Antique Bronze Frame)
    this.frameBg = this.scene.add.graphics();
    // Nền bán trong suốt
    this.frameBg.fillStyle(0x0e0b08, 0.88);
    this.frameBg.fillRoundedRect(0, 0, w, h, 6);
    // Viền gỗ ngoài
    this.frameBg.lineStyle(2, 0x422f1d, 0.95);
    this.frameBg.strokeRoundedRect(0, 0, w, h, 6);
    // Viền đồng vàng chỉ trong
    this.frameBg.lineStyle(1, 0x96733e, 0.6);
    this.frameBg.strokeRoundedRect(2, 2, w - 4, h - 4, 5);

    // Vạch cắt viền map
    this.frameBg.lineStyle(1, 0x24180d, 0.9);
    this.frameBg.strokeRect(offsetX - 1, offsetY - 1, mapW + 2, mapH + 2);

    // Ký hiệu 4 hướng la bàn cổ (Bắc / Nam / Đông / Tây)
    this.frameBg.fillStyle(0xd4af37, 0.9);
    // Chấm chỉ hướng Bắc ở trên
    this.frameBg.fillTriangle(w / 2, offsetY - 5, w / 2 - 3, offsetY - 1, w / 2 + 3, offsetY - 1);

    // 2. Tiêu đề Mini-map & Tên phân khu
    this.headerText = HDTextHelper.createText(this.scene, 8, 4, '🧭 LA BÀN [N]', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#080503',
      strokeThickness: 2
    });

    this.zoneNameText = HDTextHelper.createText(this.scene, w - 8, 4, '...', {
      fontSize: '9.5px',
      color: '#c2b097',
      stroke: '#080503',
      strokeThickness: 2
    }).setOrigin(1, 0);

    // 3. Ảnh nền địa hình tĩnh (RenderTexture/CanvasTexture)
    const emptyTextureKey = 'minimap_terrain_empty';
    if (!this.scene.textures.exists(emptyTextureKey)) {
      const dummyGfx = this.scene.make.graphics({ x: 0, y: 0 });
      dummyGfx.fillStyle(0x131a14, 1);
      dummyGfx.fillRect(0, 0, mapW, mapH);
      dummyGfx.generateTexture(emptyTextureKey, mapW, mapH);
      dummyGfx.destroy();
    }

    this.terrainImage = this.scene.add.image(offsetX, offsetY, emptyTextureKey);
    this.terrainImage.setOrigin(0, 0);

    // 4. Lớp đồ họa động (Dynamic Graphics): Người chơi, Đèn lồng, Cổng chuyển vùng
    this.dynamicGfx = this.scene.add.graphics();
    this.dynamicGfx.setPosition(offsetX, offsetY);

    // 5. Nhãn chỉ dẫn mục tiêu nhiệm vụ (Quest Stage Target Label)
    this.questHintText = HDTextHelper.createText(this.scene, w / 2, h - 2, '', {
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#080503',
      strokeThickness: 2
    }).setOrigin(0.5, 1);

    // Gom toàn bộ vào container
    this.container.add([this.frameBg, this.headerText, this.zoneNameText, this.questHintText, this.terrainImage, this.dynamicGfx]);
  }

  /**
   * Tạo nền địa hình tĩnh cho phân khu hiện tại và vẽ vào CanvasTexture 1 lần duy nhất (PASS T-PERF)
   */
  public updateZoneTerrain(
    zone: ZoneData,
    colliders?: { x: number; y: number; width: number; height: number }[],
    transitions?: TransitionZone[]
  ): void {
    if (!zone) return;
    this.currentZoneId = zone.id;
    this.currentTransitions = transitions || [];
    this.zoneBounds = {
      x: zone.bounds.x,
      y: zone.bounds.y,
      width: Math.max(100, zone.bounds.width),
      height: Math.max(100, zone.bounds.height)
    };

    this.zoneNameText.setText(zone.name);

    const textureKey = `minimap_tex_${zone.id}`;
    const mapW = MiniMapWidget.MAP_W;
    const mapH = MiniMapWidget.MAP_H;

    // Tỉ lệ chuyển đổi tọa độ từ thế giới sang minimap
    const scaleX = mapW / this.zoneBounds.width;
    const scaleY = mapH / this.zoneBounds.height;

    const toMapX = (wx: number) => Math.max(0, Math.min(mapW, (wx - this.zoneBounds.x) * scaleX));
    const toMapY = (wy: number) => Math.max(0, Math.min(mapH, (wy - this.zoneBounds.y) * scaleY));

    // Nếu texture cho phân khu này chưa được tạo, vẽ tĩnh 1 lần
    if (this.scene.textures.exists(textureKey)) {
      this.terrainImage.setTexture(textureKey);
      return;
    }

    const gfx = this.scene.make.graphics({ x: 0, y: 0 });

    // 1. Nền cỏ / đất rừng u tối (Dark Woodland Base)
    gfx.fillStyle(0x131c15, 1); // Xanh sẫm đất rừng
    gfx.fillRect(0, 0, mapW, mapH);

    // 2. Đường mòn / Đất nện (Cobblestone / Dirt Trails)
    gfx.fillStyle(0x382c1e, 0.9); // Nâu đất nện
    if (zone.id.includes('bellhollow')) {
      // Trục đường chính xuyên tâm Bellhollow
      const roadStartX = toMapX(300);
      const roadEndX = toMapX(1500);
      const roadY = toMapY(280);
      gfx.fillRect(roadStartX, roadY - 4, roadEndX - roadStartX, 8);
      // Ngã rẽ lên trạm kiểm lâm / nông trại
      const forkX = toMapX(750);
      gfx.fillRect(forkX - 3, toMapY(100), 6, toMapY(900) - toMapY(100));
    } else {
      // Đường mòn tượng trưng xuyên tâm
      gfx.fillRect(0, mapH / 2 - 3, mapW, 6);
    }

    // 3. Mặt nước / Đầm lầy (Swamp / Water / Mire)
    if (zone.id.includes('mire') || zone.id.includes('crossing')) {
      gfx.fillStyle(0x132624, 0.85); // Xanh rêu đầm lầy
      gfx.fillRoundedRect(10, 10, mapW - 20, mapH - 20, 8);
    }

    // 4. Vật cản tĩnh, Vách đá, Tường ranh giới (Static Colliders / Cliffs)
    if (colliders && colliders.length > 0) {
      gfx.fillStyle(0x272b30, 0.9); // Xám đá đậm
      for (const col of colliders) {
        const cx = toMapX(col.x);
        const cy = toMapY(col.y);
        const cw = Math.max(2, col.width * scaleX);
        const ch = Math.max(2, col.height * scaleY);
        gfx.fillRect(cx, cy, cw, ch);
      }
    }

    // 5. Cổng chuyển cảnh (Portals / Transitions)
    if (transitions && transitions.length > 0) {
      gfx.fillStyle(0x6c5ce7, 0.9); // Tím phát quang
      for (const tr of transitions) {
        if (!tr.triggerRect) continue;
        const tx = toMapX(tr.triggerRect.x);
        const ty = toMapY(tr.triggerRect.y);
        const tw = Math.max(3, tr.triggerRect.width * scaleX);
        const th = Math.max(3, tr.triggerRect.height * scaleY);
        gfx.fillRect(tx, ty, tw, th);
      }
    }

    gfx.generateTexture(textureKey, mapW, mapH);
    gfx.destroy();

    // Giữ Nearest-Neighbor chống mờ
    if (this.scene.textures.exists(textureKey)) {
      this.scene.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.terrainImage.setTexture(textureKey);
    }
  }

  /**
   * Cập nhật vị trí động người chơi, đèn lồng và cổng chuyển khu vực mỗi frame
   * (Chỉ vẽ vài điểm sáng đơn giản, 0 gây lag)
   */
  public updateDynamicMarkers(
    playerX: number,
    playerY: number,
    facing: string,
    litLanterns: { x: number; y: number }[] = [],
    campfires: { x: number; y: number }[] = []
  ): void {
    if (!this.isVisible || !this.dynamicGfx) return;

    this.dynamicGfx.clear();
    const mapW = MiniMapWidget.MAP_W;
    const mapH = MiniMapWidget.MAP_H;

    const scaleX = mapW / this.zoneBounds.width;
    const scaleY = mapH / this.zoneBounds.height;

    const toMapX = (wx: number) => (wx - this.zoneBounds.x) * scaleX;
    const toMapY = (wy: number) => (wy - this.zoneBounds.y) * scaleY;

    // 1. Vẽ các điểm lưu / Lửa trại (Save Points / Campfires)
    for (const cf of campfires) {
      const cx = toMapX(cf.x);
      const cy = toMapY(cf.y);
      if (cx >= 0 && cx <= mapW && cy >= 0 && cy <= mapH) {
        // Quầng lửa trại xanh ngọc / cam ấm
        this.dynamicGfx.fillStyle(0x27ae60, 0.4);
        this.dynamicGfx.fillCircle(cx, cy, 5);
        this.dynamicGfx.fillStyle(0x2ecc71, 1);
        this.dynamicGfx.fillCircle(cx, cy, 2.5);
      }
    }

    // 2. Vẽ các ngọn đèn lồng đã thắp sáng (Lit Lanterns)
    for (const lt of litLanterns) {
      const lx = toMapX(lt.x);
      const ly = toMapY(lt.y);
      if (lx >= 0 && lx <= mapW && ly >= 0 && ly <= mapH) {
        this.dynamicGfx.fillStyle(0xf39c12, 0.4);
        this.dynamicGfx.fillCircle(lx, ly, 4);
        this.dynamicGfx.fillStyle(0xf1c40f, 1);
        this.dynamicGfx.fillCircle(lx, ly, 2);
      }
    }

    // 3. Vẽ vị trí người chơi (Mũi tên ánh sáng hổ phách xoay theo hướng nhìn)
    const px = Math.max(3, Math.min(mapW - 3, toMapX(playerX)));
    const py = Math.max(3, Math.min(mapH - 3, toMapY(playerY)));

    // Quầng sáng hổ phách bao quanh người chơi
    this.dynamicGfx.fillStyle(0xf39c12, 0.35);
    this.dynamicGfx.fillCircle(px, py, 6);

    // Mũi tên định hướng (Compass Arrow)
    this.dynamicGfx.fillStyle(0xfff3d1, 1);
    this.dynamicGfx.lineStyle(1, 0xd35400, 1);

    // Tính toán góc theo hướng nhìn của nhân vật
    let angleRad = Math.PI / 2; // Mặc định hướng xuống (Down)
    if (facing.includes('up')) angleRad = -Math.PI / 2;
    if (facing.includes('left')) angleRad = Math.PI;
    if (facing.includes('right')) angleRad = 0;
    if (facing === 'up_left') angleRad = -Math.PI * 0.75;
    if (facing === 'up_right') angleRad = -Math.PI * 0.25;
    if (facing === 'down_left') angleRad = Math.PI * 0.75;
    if (facing === 'down_right') angleRad = Math.PI * 0.25;

    // Vẽ tam giác mũi tên xoay
    const arrowLen = 6;
    const arrowW = 4;
    const tipX = px + Math.cos(angleRad) * arrowLen;
    const tipY = py + Math.sin(angleRad) * arrowLen;
    const leftX = px + Math.cos(angleRad + 2.5) * arrowW;
    const leftY = py + Math.sin(angleRad + 2.5) * arrowW;
    const rightX = px + Math.cos(angleRad - 2.5) * arrowW;
    const rightY = py + Math.sin(angleRad - 2.5) * arrowW;

    this.dynamicGfx.fillTriangle(tipX, tipY, leftX, leftY, rightX, rightY);
    this.dynamicGfx.strokeTriangle(tipX, tipY, leftX, leftY, rightX, rightY);

    // 4. Mũi tên La Bàn chỉ mục tiêu nhiệm vụ kế tiếp (Golden Quest Target Compass Needle)
    try {
      const currentStage = QuestSystem.getInstance().getCurrentStageInfo(this.playerState);
      let isCurrentZoneTarget = (this.currentZoneId === currentStage.targetZone);
      if (currentStage.targetZone === 'sub_bell_workshop' && (this.currentZoneId === 'sub_bell_workshop' || this.currentZoneId === 'sub_root_cellar')) {
        isCurrentZoneTarget = true;
      }

      if (isCurrentZoneTarget) {
        this.questHintText.setText(`🎯 ĐÃ ĐẾN: CHẶNG ${currentStage.stageNumber}`);
        this.questHintText.setColor('#2ecc71');

        let targetLandmarkX = this.zoneBounds.x + this.zoneBounds.width / 2;
        let targetLandmarkY = this.zoneBounds.y + this.zoneBounds.height / 2;

        if (this.currentZoneId === 'outer_woods') {
          targetLandmarkX = 1470; targetLandmarkY = 710;
        } else if (this.currentZoneId === 'silent_mire') {
          targetLandmarkX = 4200; targetLandmarkY = 240;
        } else if (this.currentZoneId === 'broken_bell_shrine') {
          targetLandmarkX = 4500; targetLandmarkY = 240;
        } else if (this.currentZoneId === 'bellhollow') {
          targetLandmarkX = 798; targetLandmarkY = 275;
        }

        this.targetCompassAngle = Math.atan2(targetLandmarkY - playerY, targetLandmarkX - playerX);
      } else {
        const shortName = currentStage.targetZoneName.split('(')[0].trim();
        this.questHintText.setText(`🎯 Chặng ${currentStage.stageNumber}: ${shortName}`);
        this.questHintText.setColor('#f1c40f');

        let matchedTransition: TransitionZone | undefined;
        for (const tr of this.currentTransitions) {
          if (tr.toZone === currentStage.targetZone) {
            matchedTransition = tr;
            break;
          }
        }

        if (matchedTransition && matchedTransition.triggerRect) {
          const twx = matchedTransition.triggerRect.x + matchedTransition.triggerRect.width / 2;
          const twy = matchedTransition.triggerRect.y + matchedTransition.triggerRect.height / 2;
          this.targetCompassAngle = Math.atan2(twy - playerY, twx - playerX);
        } else {
          const hint = currentStage.directionHint;
          if (hint.includes('Đông Bắc')) {
            this.targetCompassAngle = -Math.PI * 0.25;
          } else if (hint.includes('Tây Bắc')) {
            this.targetCompassAngle = -Math.PI * 0.75;
          } else if (hint.includes('Đông Nam')) {
            this.targetCompassAngle = Math.PI * 0.25;
          } else if (hint.includes('Tây Nam')) {
            this.targetCompassAngle = Math.PI * 0.75;
          } else if (hint.includes('Bắc')) {
            this.targetCompassAngle = -Math.PI / 2;
          } else if (hint.includes('Nam')) {
            this.targetCompassAngle = Math.PI / 2;
          } else if (hint.includes('Tây')) {
            this.targetCompassAngle = Math.PI;
          } else {
            this.targetCompassAngle = 0;
          }
        }
      }

      // Xoay góc la bàn nhiệm vụ mượt mà không bị giật khi chuyển vùng
      this.currentCompassAngle = Phaser.Math.Angle.RotateTo(this.currentCompassAngle, this.targetCompassAngle, 0.12);

      // Điểm định vị mục tiêu trên vành la bàn
      const cx = mapW / 2;
      const cy = mapH / 2;
      const radX = mapW / 2 - 8;
      const radY = mapH / 2 - 8;
      const qx = cx + Math.cos(this.currentCompassAngle) * radX;
      const qy = cy + Math.sin(this.currentCompassAngle) * radY;

      // Quầng sáng vàng hổ phách định vị trên vành la bàn
      this.dynamicGfx.fillStyle(0xf1c40f, 0.45);
      this.dynamicGfx.fillCircle(qx, qy, 6.5);
      this.dynamicGfx.fillStyle(0xfff3a1, 1.0);
      this.dynamicGfx.fillCircle(qx, qy, 3);

      // Mũi nhọn hướng tâm chỉ về mục tiêu
      const qTipX = qx + Math.cos(this.currentCompassAngle) * 7;
      const qTipY = qy + Math.sin(this.currentCompassAngle) * 7;
      const qLeftX = qx + Math.cos(this.currentCompassAngle + 2.4) * 5;
      const qLeftY = qy + Math.sin(this.currentCompassAngle + 2.4) * 5;
      const qRightX = qx + Math.cos(this.currentCompassAngle - 2.4) * 5;
      const qRightY = qy + Math.sin(this.currentCompassAngle - 2.4) * 5;

      this.dynamicGfx.fillStyle(0xf1c40f, 1);
      this.dynamicGfx.lineStyle(1, 0x7e5109, 1);
      this.dynamicGfx.fillTriangle(qTipX, qTipY, qLeftX, qLeftY, qRightX, qRightY);
      this.dynamicGfx.strokeTriangle(qTipX, qTipY, qLeftX, qLeftY, qRightX, qRightY);
    } catch {
      // Ignored
    }
  }

  /**
   * Bật/tắt hiển thị Mini-map (Phím N)
   */
  public toggle(): boolean {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
    return this.isVisible;
  }

  /**
   * Dọn dẹp đối tượng đồ họa & container khi tắt scene
   */
  public destroy(): void {
    if (this.container) {
      this.container.destroy(true);
    }
  }
}
