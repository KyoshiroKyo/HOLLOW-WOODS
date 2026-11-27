import zoneData from '../data/zones.json';
import type { ZoneData } from '../types';
import type { GameScene } from '../scenes/GameScene';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
/**
 * HOLLOW WOODS V1.4 - PARCHMENT WORLD MAP MODAL (PHÍM M)
 * Bản đồ Thế giới Giấy Da toàn vùng lấy Làng Bellhollow làm trung tâm.
 * - Tông màu Giấy da cổ, nâu đất, mực tối và ánh vàng hổ phách đậm chất Dark Woodland.
 * - Cơ chế Sương Mù Khám Phá (Fog of War): Các vùng chưa từng đến bị phủ mực sương mù mờ ảo;
 *   khi người chơi đến đâu, bản đồ tự động vén sương tới đó và lưu vào PlayerState.
 * - Tạm dừng di chuyển nhân vật khi đang mở bản đồ.
 * - Hiển thị các địa danh quan trọng (Landmarks) và ghi chú manh mối nhiệm vụ.
 */

import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';
import { QuestSystem } from '../systems/QuestSystem';

export class ParchmentWorldMapModal {
  public static readonly MAP_WIDTH = 980;
  public static readonly MAP_HEIGHT = 600;

  private scene: Phaser.Scene;
  private playerState: PlayerState;
  public container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;

  private backdrop!: Phaser.GameObjects.Graphics;
  private parchmentBg!: Phaser.GameObjects.Graphics;
  private contentContainer!: Phaser.GameObjects.Container;
  private subTitleText!: Phaser.GameObjects.Text;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene, playerState: PlayerState) {
    this.scene = scene;
    this.playerState = playerState;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1500); // Nằm trên toàn bộ UI thông thường
    this.container.setVisible(false);

    this.buildBaseModal();
  }

  private buildBaseModal(): void {
    // 1. Màn đen phủ viền mờ ảo (Vignette Backdrop)
    this.backdrop = this.scene.add.graphics();
    this.backdrop.fillStyle(0x05070a, 0.85);
    this.backdrop.fillRect(0, 0, 1280, 720);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Nhấp chuột ra ngoài khung bản đồ giấy da để đóng an toàn (BUG-037)
      if (pointer.x < px || pointer.x > px + pw || pointer.y < py || pointer.y > py + ph) {
        this.close();
      }
    });

    // 2. Khung Giấy Da Cổ (Aged Parchment Board) kích thước 980x600 px tại tâm (640, 360)
    const px = 150;
    const py = 60;
    const pw = 980;
    const ph = 600;

    // V152-06B: Sprite Cuộn Bản Đồ Giấy Da Cổ từ UI Pack
    let scrollSprite: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_world_map_scroll')) {
      scrollSprite = this.scene.add.image(640, 360, 'ui_pack_world_map_scroll');
      scrollSprite.setDisplaySize(pw + 30, ph + 30);
      scrollSprite.setTint(0xdfd3b6);
      scrollSprite.setAlpha(0.75);
    }

    this.parchmentBg = this.scene.add.graphics();
    // Nền giấy da ngả vàng nâu cũ kỹ
    this.parchmentBg.fillStyle(0xd9c29e, 1);
    this.parchmentBg.fillRoundedRect(px, py, pw, ph, 10);
    // Viền cháy xém / viền mực sẫm
    this.parchmentBg.lineStyle(4, 0x3d2714, 0.95);
    this.parchmentBg.strokeRoundedRect(px, py, pw, ph, 10);
    // Chỉ viền đôi phong cách cổ
    this.parchmentBg.lineStyle(1.5, 0x8a623a, 0.7);
    this.parchmentBg.strokeRoundedRect(px + 4, py + 4, pw - 8, ph - 8, 8);

    // Lưới hoa văn kinh tuyến vĩ tuyến mờ nhạt trên giấy da
    this.parchmentBg.lineStyle(1, 0xbaa17e, 0.35);
    for (let lx = px + 60; lx < px + pw; lx += 80) {
      this.parchmentBg.lineBetween(lx, py + 20, lx, py + ph - 20);
    }
    for (let ly = py + 60; ly < py + ph; ly += 70) {
      this.parchmentBg.lineBetween(px + 20, ly, px + pw - 20, ly);
    }

    // Tiêu đề cổ điển & Hoa văn La bàn trên đầu bản đồ
    const titleText = HDTextHelper.createText(this.scene, 640, py + 14, 'Khu Rừng Rỗng', {
      fontFamily: 'Georgia, serif',
      fontSize: '23px',
      fontStyle: 'bold',
      color: '#2a1a0d',
      stroke: '#d9c29e',
      strokeThickness: 1
    }).setOrigin(0.5, 0);

    this.subTitleText = HDTextHelper.createText(this.scene, 640, py + 45, '', {
      fontSize: '12px',
      wordWrap: { width: 825, useAdvancedWrap: true },
      fontStyle: 'bold',
      color: '#8a4b12'
    }).setOrigin(0.5, 0);

    // Nút đóng góc trên phải [X]
    const closeBtn = HDTextHelper.createText(this.scene, px + pw - 28, py + 16, '✖ [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#8b2500',
      backgroundColor: '#ebd8bc',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());

    this.contentContainer = this.scene.add.container(0, 0);

    const modalChildren: Phaser.GameObjects.GameObject[] = [
      this.backdrop,
      ...(scrollSprite ? [scrollSprite] : []),
      this.parchmentBg,
      titleText,
      this.subTitleText,
      closeBtn,
      this.contentContainer
    ];
    this.container.add(modalChildren);
  }

  /**
   * Mở Bản đồ Giấy Da và vẽ toàn bộ các phân khu, đường mòn và lớp sương mù Fog of War
   */
  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.setVisible(true);

    try {
      AudioManager.getInstance().playWorldInteractSFX('journal');
    } catch {
      // Ignored
    }

    this.renderWorldMapContent();

    if (this.onOpen) {
      this.onOpen();
    }
  }

  public refreshTrackedQuest(): void {
    if (this.isOpen) this.renderWorldMapContent();
  }

  /**
   * Đóng Bản đồ Giấy Da
   */
  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);


    try {
      AudioManager.getInstance().playUICancel();
    } catch {
      // Ignored
    }

    if (this.onClose) {
      this.onClose();
    }
  }

  public toggle(): boolean {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
    return this.isOpen;
  }

  /**
   * Dựng nội dung bản đồ: Tuyến đường mòn, Các khu vực, Sương mù Fog of War và Điểm đứng
   */
  private project(x: number, y: number) {
    return { x: 11 + (x - this.worldLeft) * this.mapScale, y: 56 + (y - this.worldTop) * this.mapScale };
  }

  private readonly regions = (zoneData.zones as ZoneData[]).filter(zone => !WorldGatingSystem.isZonePending(zone.id));
  private readonly worldLeft = Math.min(...this.regions.map(zone => zone.bounds.x));
  private readonly worldTop = Math.min(...this.regions.map(zone => zone.bounds.y));
  private readonly mapScale = Math.min(
    890 / (Math.max(...this.regions.map(zone => zone.bounds.x + zone.bounds.width)) - this.worldLeft),
    374 / (Math.max(...this.regions.map(zone => zone.bounds.y + zone.bounds.height)) - this.worldTop)
  );
  private readonly insets = new Set(['ancient_rune_puzzle', 'sub_whispering_clearing', 'sub_root_cellar', 'sub_bell_workshop']);
  private readonly atlasKey = 'parchment-map-terrain';
  private terrain?: Phaser.Textures.CanvasTexture;
  private terrainImage?: Phaser.GameObjects.Image;
  private discoveryKey = '';

  private drawTerrain(known: Set<string>): void {
    const signature = Array.from(known).sort().join('|');
    if (this.terrain && signature === this.discoveryKey) return;
    const texture = this.terrain ?? this.scene.textures.createCanvas(this.atlasKey, 920, 480);
    if (!texture) return;
    this.terrain = texture;
    this.discoveryKey = signature;
    const ctx = texture.context;
    const page = ctx.createRadialGradient(365, 225, 35, 465, 242, 575);
    page.addColorStop(0, '#ead6ac');
    page.addColorStop(0.65, '#d3b386');
    page.addColorStop(1, '#ad8055');
    ctx.fillStyle = page;
    ctx.fillRect(0, 0, 920, 480);

    let seed = 2843;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    ctx.fillStyle = 'rgba(87,54,29,.14)';
    for (let i = 0; i < 9200; i++) {
      ctx.fillRect(random() * 920, random() * 480, random() * 2 + 0.4, random() * 1.25 + 0.3);
    }
    // Broad, translucent fog washes sit under the discovered geography.
    for (let i = 0; i < 21; i++) {
      const x = random() * 920;
      const y = 25 + random() * 430;
      const radius = 35 + random() * 90;
      const fog = ctx.createRadialGradient(x, y, 5, x, y, radius);
      fog.addColorStop(0, 'rgba(239,229,202,.31)');
      fog.addColorStop(1, 'rgba(239,229,202,0)');
      ctx.fillStyle = fog;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.strokeStyle = 'rgba(101,70,39,.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 919, 479);
    ctx.strokeRect(5.5, 5.5, 909, 469);

    const palette = new Map<string, string>([
      ['fog_crossing', '#afaa81'], ['bellhollow', '#c3ab76'], ['sanctuary_farm', '#b0a365'],
      ['outer_woods', '#89916a'], ['crooked_path', '#a29668'], ['deep_forest', '#78845c'],
      ['silent_mire', '#86958a'], ['broken_bell_shrine', '#9b8772']
    ]);
    const sprite = (key: string, x: number, y: number, height: number) => {
      if (!this.scene.textures.exists(key)) return;
      const image = this.scene.textures.get(key).getSourceImage() as HTMLImageElement;
      const width = height * image.width / image.height;
      ctx.drawImage(image, x - width / 2, y - height, width, height);
    };
    const paintOrder = this.regions.filter(zone => known.has(zone.id) && !this.insets.has(zone.id))
      .sort((a, b) => a.bounds.y - b.bounds.y);
    for (const zone of paintOrder) {
      const origin = this.project(zone.bounds.x, zone.bounds.y);
      const w = zone.bounds.width * this.mapScale;
      const h = zone.bounds.height * this.mapScale;
      const {x, y} = origin;
      const edge = [[.02,.16],[.11,.05],[.29,.04],[.42,.08],[.66,.025],[.91,.06],[.98,.21],
        [.96,.39],[.99,.54],[.94,.74],[.96,.89],[.85,.97],[.66,.94],[.48,.99],
        [.27,.94],[.09,.96],[.025,.77],[.04,.55],[0,.37]];
      ctx.save();
      ctx.beginPath();
      for (const [dx, dy] of edge) ctx.lineTo(x + w * dx, y + h * dy);
      ctx.closePath();
      ctx.fillStyle = palette.get(zone.id) ?? '#b2966e';
      ctx.fill();
      ctx.strokeStyle = '#786744';
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.clip();

      const baked = this.scene.textures.getTextureKeys().find(key => key.startsWith(zone.id + '_ground_baked_'));
      if (baked) {
        ctx.globalAlpha = .20;
        ctx.drawImage(this.scene.textures.get(baked).getSourceImage() as HTMLCanvasElement, x, y, w, h);
        ctx.globalAlpha = 1;
      }
      const isMire = zone.id === 'silent_mire';
      ctx.strokeStyle = isMire ? '#d0d2ae' : '#695e3c';
      for (let i = 0; i < w * h / 145; i++) {
        const a = x + random() * w;
        const b = y + random() * h;
        ctx.globalAlpha = .19 + random() * .21;
        ctx.beginPath();
        ctx.moveTo(a, b);
        ctx.quadraticCurveTo(a + 5, b - 3, a + 11 + random() * 6, b);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (['outer_woods', 'deep_forest', 'fog_crossing', 'crooked_path'].includes(zone.id)) {
        const trees = Array.from({ length: Math.floor(w * h / 450) }, () =>
          ({ x: x + random() * w, y: y + random() * h })).sort((a, b) => a.y - b.y);
        for (const tree of trees) sprite('tree_pine_tall_topdown', tree.x, tree.y, 13 + random() * 14);
      }
      if (zone.id === 'bellhollow') {
        const tower = this.project(900, 130);
        sprite('bell_tower_grand', tower.x, tower.y, 37);
        const homes = zone.colliders.filter(collider => collider.id.includes('house'));
        for (const house of homes) {
          const at = this.project(house.x + house.width / 2, house.y + house.height / 2);
          sprite('house_elder_edda', at.x, at.y, 21);
        }
      }
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.font = 'bold 15px Georgia';
    ctx.fillStyle = '#593c24';
    ctx.fillText('B', 866, 44);
    ctx.beginPath();
    ctx.moveTo(866, 51);
    ctx.lineTo(859, 78);
    ctx.lineTo(866, 72);
    ctx.lineTo(873, 78);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#805b32';
    ctx.beginPath();
    ctx.arc(866, 68, 19, 0, Math.PI * 2);
    ctx.stroke();
    texture.refresh();
    if (!this.terrainImage) {
      this.terrainImage = this.scene.add.image(180, 125, texture.key).setOrigin(0);
      this.container.addAt(this.terrainImage, this.container.getIndex(this.contentContainer));
    }
  }

  private renderWorldMapContent(): void {
    this.contentContainer.removeAll(true);
    const active = this.playerState.getCurrentZone() || 'fog_crossing';
    const known = new Set(this.regions.filter(zone => zone.id === active || this.playerState.hasVisitedZone(zone.id))
      .map(zone => zone.id));
    // Legacy saves seed Bellhollow in visitedZones before the opening quest is completed.
    if (active === 'fog_crossing' && known.size <= 2 && !this.playerState.hasFlag('map_bellhollow_charted') &&
        !this.playerState.hasFlag('talked_to_edda')) {
      known.delete('bellhollow');
    }
    this.drawTerrain(known);
    const quests = QuestSystem.getInstance();
    const tracked = quests.getTrackedQuestDisplay(this.playerState);
    const objective = tracked?.targetName ?? tracked?.nextTask?.text;
    this.subTitleText.setText(objective ? 'Mục tiêu · ' + objective : 'N / Esc · Gấp bản đồ');
    const gates = WorldGatingSystem.getInstance();
    const topology = ZoneConnectionRegistry.getInstance();
    const located = (x: number, y: number) => {
      const point = this.project(x, y);
      return { x: 180 + point.x, y: 125 + point.y };
    };
    const caption = (x: number, y: number, label: string, size = 12, color = '#342717', width = 880) =>
      HDTextHelper.createText(this.scene, x, y, label, {
        fontSize: size + 'px', fontFamily: 'Georgia, serif', fontStyle: 'bold', color,
        stroke: '#efdbb1', strokeThickness: 3, align: 'center', wordWrap: { width, useAdvancedWrap: true }
      }).setOrigin(0.5);
    const ink = this.scene.add.graphics();
    this.contentContainer.add(ink);

    if (known.size <= 2) {
      this.contentContainer.add(caption(782, 368, 'Địa hình chưa khảo sát', 16, '#76583b'));
    }
    const drawnGates = new Set<string>();
    for (const region of this.regions.filter(zone => known.has(zone.id))) {
      for (const route of topology.getRuntimeExits(region.id)) {
        if (route.status !== 'active' || WorldGatingSystem.isZonePending(route.toZone)) continue;
        const at = located(route.triggerRect.x + route.triggerRect.width / 2, route.triggerRect.y + route.triggerRect.height / 2);
        const end = located(route.targetSpawn.x, route.targetSpawn.y);
        const locked = !gates.isZoneUnlocked(route.toZone, this.playerState) ||
          (route.toZone === 'broken_bell_shrine' && !quests.getBridgeSealState(this.playerState).isBroken);
        if (locked && route.barrierType !== 'open') {
          if (drawnGates.has(route.id)) continue;
          drawnGates.add(route.id);
          ink.fillStyle(0x802c25).fillRoundedRect(at.x - 6, at.y - 3, 12, 10, 2);
          ink.lineStyle(2, 0x802c25).strokeCircle(at.x, at.y - 4, 4);
          ink.fillStyle(0xf3d9a5).fillCircle(at.x, at.y + 2, 1.6);
        } else if (!locked && known.has(route.toZone) && !this.insets.has(route.toZone) &&
            !this.insets.has(region.id) && Phaser.Math.Distance.Between(at.x, at.y, end.x, end.y) <= 95) {
          ink.lineStyle(5, 0xeee0aa, .9).lineBetween(at.x, at.y, end.x, end.y);
          ink.lineStyle(1.5, 0x604729, .9).lineBetween(at.x, at.y, end.x, end.y);
        }
      }
      const local = this.insets.has(region.id);
      const at = located(local ? region.defaultSpawn.x : region.bounds.x + region.bounds.width / 2,
        local ? region.defaultSpawn.y : region.bounds.y + region.bounds.height * .66);
      if (local) {
        ink.fillStyle(0x503720).fillCircle(at.x, at.y, 5);
        ink.fillStyle(0xffe8bc).fillCircle(at.x, at.y, 1.5);
      }
      const labelWidth = Math.max(76, region.bounds.width * this.mapScale - 10);
      const isTrailhead = region.id === 'fog_crossing';
      this.contentContainer.add(caption(at.x, at.y + (local || isTrailhead ? 18 : 0),
        isTrailhead ? 'Lối Mòn\nXuyên Sương' : region.titleVietnamese,
        local || isTrailhead ? 11 : 13, '#342717', labelWidth));
    }

    const point = (this.scene.scene.get('GameScene') as GameScene | undefined)?.getMapPlayerPosition();
    const current = this.regions.find(region => region.id === active);
    const target = this.regions.find(region => region.id === tracked?.targetZone);
    const pins = this.scene.add.graphics();
    this.contentContainer.add(pins);
    if (target && tracked?.nextTask) {
      const at = located(target.defaultSpawn.x, target.defaultSpawn.y);
      pins.lineStyle(6, 0xf8e2b5).strokeCircle(at.x, at.y, 8);
      pins.lineStyle(2, 0x9a3d25).strokeCircle(at.x, at.y, 8);
      pins.fillStyle(0x9a3d25).fillCircle(at.x, at.y, 2.5);
    }
    if (current) {
      const position = point ?? current.defaultSpawn;
      const at = located(position.x, position.y);
      pins.fillStyle(0xffe8ae).fillCircle(at.x, at.y, 7);
      pins.fillStyle(0x2d4e39).fillCircle(at.x, at.y, 4.5);
    }

    const stats = caption(181, 625, 'Đã khám phá ' + known.size + '/' + this.regions.length, 13).setOrigin(0, .5);
    const legend = caption(1099, 625, '● Bạn đang ở đây  ◎ Mục tiêu  ▪ Phong ấn  Nét nối · Lối đi đã biết', 12).setOrigin(1, .5);
    this.contentContainer.add([stats, legend]);
  }

  public destroy(): void {
    this.container.destroy(true);
    if (this.terrain) this.scene.textures.remove(this.atlasKey);
  }

}
