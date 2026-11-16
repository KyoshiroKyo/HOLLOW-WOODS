import * as Phaser from 'phaser';
import zonesData from '../data/zones.json';
import { ZoneData, ZoneId, InteractableSpec, TransitionZone, Point2D } from '../types';
import { PlayerState } from '../state/PlayerState';
import { ZoneConnectionRegistry } from './ZoneConnectionRegistry';
import {
  TILE_FOREST_GRASS,
  TILE_SWAMP_MUD,
  TILE_COBBLE_ROAD,
  TILE_STONE_FLOOR,
  SPRITE_TREE_OAK_1,
  SPRITE_TREE_OAK_2,
  SPRITE_TREE_OAK_3,
  SPRITE_BUSH_DENSE_1,
  SPRITE_BUSH_DENSE_2,
  SPRITE_HOLLOW_TREE,
  SPRITE_TREE_DEAD,
  SPRITE_HOUSE_EDDA,
  SPRITE_HOUSE_NERIS,
  SPRITE_BELL_TOWER,
  SPRITE_BROKEN_SHRINE,
  SPRITE_PILLAR_MOON,
  SPRITE_PILLAR_ROOT,
  SPRITE_PILLAR_EYE,
  SPRITE_VILLAGE_WELL,
  SPRITE_CRAFTING_BENCH,
  SPRITE_STONE_ALTAR,
  SPRITE_ROCK_LARGE,
  SPRITE_ROCK_MEDIUM,
  SPRITE_WOODEN_FENCE,
  SPRITE_SIGNPOST,
  SPRITE_FOG_SMOOTH
} from '../config/Constants';

export interface RunestoneVisualEntry {
  id: string;
  name: string;
  x: number;
  y: number;
  glowColor: number;
  sprite: Phaser.GameObjects.Image;
  glowGraphics: Phaser.GameObjects.Graphics;
  beamGraphics: Phaser.GameObjects.Graphics;
  isLit: boolean;
}

export interface CullableObject {
  gameObject: Phaser.GameObjects.GameObject & { setVisible: (visible: boolean) => any; visible: boolean };
  x: number;
  y: number;
  radius: number;
}

export class WorldBuilder {
  private scene: Phaser.Scene;
  private zones: Map<ZoneId, ZoneData> = new Map();
  private sortedZonesByArea: ZoneData[] = [];
  private cullableObjects: CullableObject[] = [];
  private activeZoneId: ZoneId = 'fog_crossing';

  public colliderGroup!: Phaser.Physics.Arcade.StaticGroup;
  public treeCanopyGroup!: Phaser.GameObjects.Group;
  public interactables: InteractableSpec[] = [];
  public transitions: TransitionZone[] = [];

  // C4-12-03: Quản lý trạng thái và hình ảnh Cổng Đông làng Bellhollow
  private eastGateVisual?: Phaser.GameObjects.Graphics;
  private eastGateColliderBody?: Phaser.Physics.Arcade.Sprite;
  private isEastGateOpen: boolean = false;
  private eastGateX: number = 1485;
  private eastGateRoadY: number = 280;

  // C4-12-28: Quản lý trạng thái và rào ấn Kết Giới Cổng Miếu Chuông Phế Tích
  private shrineGateX: number = 3960;
  private shrineGateY: number = 280;
  private shrineWardVisual?: Phaser.GameObjects.Graphics;
  private shrineWardPillarsGfx?: Phaser.GameObjects.Graphics;
  private shrineWardColliderBody?: Phaser.Physics.Arcade.Sprite;
  private isShrineWardOpen: boolean = false;

  // C4-12-24: Quản lý hiệu ứng trực quan và trạng thái phát sáng của 3 Cột Đá Cổ Ngữ
  public runestoneVisuals: Map<string, RunestoneVisualEntry> = new Map();
  public centralAltarGlow?: Phaser.GameObjects.Graphics;
  public centralAltarBeam?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loadZonesData();
  }

  private loadZonesData(): void {
    for (const z of zonesData.zones as ZoneData[]) {
      this.zones.set(z.id, z);
    }
    // C4-12-29: Pre-sort zones theo diện tích 1 lần duy nhất lúc khởi tạo,
    // loại bỏ hoàn toàn việc cấp phát mảng Array.from() và gọi .sort() 60 lần/giây trong update()
    this.sortedZonesByArea = (zonesData.zones as ZoneData[]).slice().sort((a, b) => {
      const areaA = a.bounds.width * a.bounds.height;
      const areaB = b.bounds.width * b.bounds.height;
      return areaA - areaB;
    });
  }

  public getZone(id: ZoneId): ZoneData | undefined {
    return this.zones.get(id);
  }

  public getActiveZone(): ZoneData {
    return this.zones.get(this.activeZoneId) || (zonesData.zones[0] as ZoneData);
  }

  public getConnectionRegistry(): ZoneConnectionRegistry {
    return ZoneConnectionRegistry.getInstance();
  }

  // C4-12-27: Truy vấn danh sách điểm chuyển tiếp và tìm theo ID
  public getTransitions(): TransitionZone[] {
    return this.transitions;
  }

  public getTransitionById(id: string): TransitionZone | undefined {
    return this.transitions.find(t => t.id === id);
  }

  public buildWorld(): void {
    this.colliderGroup = this.scene.physics.add.staticGroup();
    this.treeCanopyGroup = this.scene.add.group();

    // Dựng cảnh cho tất cả 5 phân khu
    for (const zone of this.zones.values()) {
      this.renderZoneTerrain(zone);
      this.setupZoneColliders(zone);
      this.setupZoneInteractables(zone);
      this.setupZoneTransitions(zone);
    }

    // C4-13-20: Dựng các dải tiếp giáp địa hình chuyển tiếp tự nhiên (180px–220px) xóa bỏ đường cắt dọc hai thái cực
    this.renderZoneBoundaryTransitions();

    // C4-13-06: Đảm bảo toàn bộ vật thể va chạm trong colliderGroup vô hình tuyệt đối (alpha 0, visible false)
    const children = this.colliderGroup.getChildren();
    for (let i = 0; i < children.length; i++) {
      const spr = children[i] as Phaser.Physics.Arcade.Sprite;
      spr.setVisible(false);
      spr.setAlpha(0);
    }
  }

  /**
   * Dựng bề mặt đất, thảm cỏ, đường mòn và cảnh quan chi tiết cho từng phân khu bằng TileSprite.
   */
  private renderZoneTerrain(zone: ZoneData): void {
    const { bounds, id } = zone;

    // 1. Nền mặt đất cơ bản cho từng phân khu
    if (id === 'fog_crossing') {
      this.renderFogCrossingTerrain(bounds);
    } else if (id === 'bellhollow') {
      this.renderBellhollowTerrain(bounds);
    } else if (id === 'sanctuary_farm') {
      this.renderSanctuaryFarmTerrain(bounds);
    } else if (id === 'outer_woods') {
      this.renderOuterWoodsTerrain(bounds);
    } else if (id === 'crooked_path') {
      this.renderCrookedPathTerrain(bounds);
    } else if (id === 'deep_forest') {
      this.renderDeepForestTerrain(bounds);
    } else if (id === 'silent_mire') {
      this.renderSilentMireTerrain(bounds);
    } else if (id === 'ancient_rune_puzzle') {
      this.renderAncientRunePuzzleTerrain(bounds);
    } else if (id === 'broken_bell_shrine') {
      this.renderBrokenBellShrineTerrain(bounds);
    }

    // 3. Dựng các chi tiết kiến trúc đặc thù
    this.renderDecorations(zone);
  }

  /**
   * C4-12-18A (Mục 2A & 2D): Dựng địa hình Lối Mòn Xuyên Sương (Fog Crossing) trên 1 CanvasTexture duy nhất,
   * đảm bảo đường mòn đất nối liền mạch không đứt đoạn vào cổng Tây làng Bellhollow (x = 480, y ~ 230).
   */
  private renderFogCrossingTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'fog_crossing_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const canvasTex = this.scene.textures.createCanvas(texKey, bounds.width, bounds.height);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        // 1. Nền cỏ rừng sương mù tối màu có chiều sâu (không lặp ô xanh ô-liu đơn điệu)
        ctx.fillStyle = '#263326';
        ctx.fillRect(0, 0, bounds.width, bounds.height);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          for (let gy = 0; gy < bounds.height; gy += 32) {
            for (let gx = 0; gx < bounds.width; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Bóng rừng sẫm màu hai bên rìa Bắc - Nam
        const topGrad = ctx.createLinearGradient(0, 0, 0, 95);
        topGrad.addColorStop(0, 'rgba(12, 18, 14, 0.82)');
        topGrad.addColorStop(1, 'rgba(12, 18, 14, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, bounds.width, 95);

        const botGrad = ctx.createLinearGradient(0, bounds.height - 95, 0, bounds.height);
        botGrad.addColorStop(0, 'rgba(12, 18, 14, 0)');
        botGrad.addColorStop(1, 'rgba(12, 18, 14, 0.82)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, bounds.height - 95, bounds.width, 95);

        // Thảm rêu và bụi cỏ tự nhiên rải rác
        let seed = 104729;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        for (let i = 0; i < 240; i++) {
          const px = Math.floor(nextRand() * bounds.width);
          const py = Math.floor(nextRand() * bounds.height);
          const w = 4 + Math.floor(nextRand() * 8);
          const h = 3 + Math.floor(nextRand() * 5);
          ctx.fillStyle = nextRand() > 0.5 ? 'rgba(31, 46, 31, 0.65)' : 'rgba(54, 74, 48, 0.45)';
          ctx.fillRect(px, py, w, h);
        }

        // 2. Đường mòn đất uốn lượn tự nhiên từ điểm xuất phát (80, 180) qua biển chỉ đường (240, 180)
        // và hạ dần xuống y = 232 tại ranh giới x = 480 để nối thẳng vào đường cổng Tây làng Bellhollow
        const trailCenterY = (x: number): number => {
          if (x <= 240) {
            return 184 + Math.sin(x * 0.025) * 4;
          }
          const t = (x - 240) / 240; // 0..1 từ x=240 đến x=480
          const smooth = t * t * (3 - 2 * t);
          return 184 + smooth * 48; // 184 -> 232 tại x=480
        };

        for (let x = 0; x < bounds.width; x += 2) {
          const cy = Math.round(trailCenterY(x));
          const halfW = 22 + Math.round(Math.sin(x * 0.07) * 2);

          // Viền cỏ đạp dập / đất ẩm chuyển tiếp
          ctx.fillStyle = '#3b3728';
          ctx.fillRect(x, cy - halfW - 6, 2, halfW * 2 + 12);

          // Lớp đất nâu trầm bên ngoài
          ctx.fillStyle = '#523e2c';
          ctx.fillRect(x, cy - halfW - 2, 2, halfW * 2 + 4);

          // Lòng đường đất nâu ấm
          ctx.fillStyle = '#684f38';
          ctx.fillRect(x, cy - halfW + 2, 2, halfW * 2 - 4);

          // Vệt đất mòn sáng nhẹ ở tâm lối đi
          ctx.fillStyle = '#785c42';
          ctx.fillRect(x, cy - 8, 2, 16);
        }

        // Sỏi đá nhỏ và đá bước chân dọc lối mòn
        for (let i = 0; i < 140; i++) {
          const px = Math.floor(nextRand() * bounds.width);
          const cy = trailCenterY(px);
          const offset = (nextRand() - 0.5) * 38;
          const py = Math.round(cy + offset);
          ctx.fillStyle = nextRand() > 0.45 ? '#463525' : '#877560';
          ctx.fillRect(px, py, 2 + Math.floor(nextRand() * 2), 2);
        }

        // Bậc đá cổ dẫn vào cổng Tây làng ở x = 452..480
        for (let sx = 452; sx < 480; sx += 7) {
          const sy = Math.round(trailCenterY(sx));
          ctx.fillStyle = '#545b61';
          ctx.fillRect(sx, sy - 16, 5, 32);
          ctx.fillStyle = '#6d757c';
          ctx.fillRect(sx + 1, sy - 15, 3, 30);
        }

        // C4-13-16: Gradient sương đen sâu thẳm che phủ và làm chìm hẳn con đường ở rìa Tây (x: 0..80)
        // kết hợp với thân cây cổ thụ đổ và bụi rậm xóa bỏ hoàn toàn hiện tượng đường bị cắt cụt vào nền đen
        const westEdgeGrad = ctx.createLinearGradient(0, 0, 80, 0);
        westEdgeGrad.addColorStop(0, 'rgba(8, 12, 10, 0.98)');
        westEdgeGrad.addColorStop(0.4, 'rgba(12, 18, 14, 0.85)');
        westEdgeGrad.addColorStop(0.7, 'rgba(20, 28, 22, 0.45)');
        westEdgeGrad.addColorStop(1, 'rgba(20, 28, 22, 0)');
        ctx.fillStyle = westEdgeGrad;
        ctx.fillRect(0, 0, 80, bounds.height);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-18A (Mục 2A & 2D): Thiết kế lại toàn bộ mặt đất, Quảng trường trung tâm lát đá cuội
   * và mạng lưới đường mòn đất/đá kết nối chặt chẽ cho làng Bellhollow.
   * Tất cả được kết xuất vào 1 CanvasTexture duy nhất (bellhollow_ground_baked_v12) ở depth -98
   * để đảm bảo hiệu năng tối đa (không sinh hàng trăm GameObject nhỏ lẻ).
   */
  private renderBellhollowTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'bellhollow_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 1120 (x: 480..1600)
      const H = bounds.height; // 960  (y: -200..760)
      const ox = bounds.x;     // 480
      const oy = bounds.y;     // -200

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 918273;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        // Hàm đổi tọa độ thế giới (wx, wy) sang tọa độ cục bộ trên Canvas (lx, ly)
        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // =========================================================================
        // 1. NỀN CỎ RỪNG ĐA SẮC ĐỘ & CHUYỂN TIẾP BÌA RỪNG (THAY THẾ CỎ XANH Ô-LIU ĐƠN ĐIỆU)
        // =========================================================================
        ctx.fillStyle = '#2a3d24';
        ctx.fillRect(0, 0, W, H);

        // Pha trộn nhẹ vân cỏ từ TILE_FOREST_GRASS với độ mờ thấp để giữ chất liệu pixel-art mà không bị lặp lưới
        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.26;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Tạo vùng cỏ trảng làng ấm hơn quanh khu dân cư (wx: 520..1260, wy: 50..500)
        const meadowGrad = ctx.createRadialGradient(
          toLX(840), toLY(280), 60,
          toLX(860), toLY(280), 540
        );
        meadowGrad.addColorStop(0, 'rgba(72, 98, 52, 0.42)');
        meadowGrad.addColorStop(0.55, 'rgba(48, 70, 38, 0.25)');
        meadowGrad.addColorStop(1, 'rgba(18, 28, 18, 0.72)');
        ctx.fillStyle = meadowGrad;
        ctx.fillRect(0, 0, W, H);

        // Bóng tối bìa rừng phía Bắc (wy < 60), phía Nam (wy > 510) và bìa rừng phía Đông (wx > 1340)
        const northShade = ctx.createLinearGradient(0, toLY(-200), 0, toLY(90));
        northShade.addColorStop(0, 'rgba(12, 18, 14, 0.88)');
        northShade.addColorStop(0.75, 'rgba(16, 25, 18, 0.55)');
        northShade.addColorStop(1, 'rgba(16, 25, 18, 0)');
        ctx.fillStyle = northShade;
        ctx.fillRect(0, 0, W, toLY(90));

        const southShade = ctx.createLinearGradient(0, toLY(460), 0, toLY(760));
        southShade.addColorStop(0, 'rgba(16, 25, 18, 0)');
        southShade.addColorStop(0.35, 'rgba(16, 25, 18, 0.55)');
        southShade.addColorStop(1, 'rgba(10, 16, 12, 0.90)');
        ctx.fillStyle = southShade;
        ctx.fillRect(0, toLY(460), W, H - toLY(460));

        const eastForestShade = ctx.createLinearGradient(toLX(1280), 0, toLX(1600), 0);
        eastForestShade.addColorStop(0, 'rgba(16, 24, 18, 0)');
        eastForestShade.addColorStop(0.6, 'rgba(16, 24, 18, 0.42)');
        eastForestShade.addColorStop(1, 'rgba(12, 18, 15, 0.78)');
        ctx.fillStyle = eastForestShade;
        ctx.fillRect(toLX(1280), 0, W - toLX(1280), H);

        // Thảm rêu rừng, cụm cỏ non và lá rụng phân bố hữu cơ trên mặt đất
        const mossPalette = ['#23341e', '#314729', '#3a5330', '#445e37', '#293b22'];
        for (let i = 0; i < 1600; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 4 + Math.floor(nextRand() * 12);
          const ph = 3 + Math.floor(nextRand() * 8);
          ctx.fillStyle = mossPalette[Math.floor(nextRand() * mossPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
          if (nextRand() > 0.6) {
            ctx.fillRect(lx + 2, ly - 2, Math.max(2, pw - 4), ph + 3);
          }
        }

        // =========================================================================
        // 2. HÀM VẼ ĐƯỜNG MÒN ĐẤT / SỎI HỮU CƠ (CÓ VIỀN CỎ ĐẠP & SỎI CHUYỂN TIẾP)
        // =========================================================================
        const drawOrganicDirtPath = (
          points: Array<{ x: number; y: number; r: number }>,
          withSteppingStones: boolean = false
        ) => {
          // Nội suy dày dọc theo chuỗi điểm để tạo đường cong mượt
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.045 + wy * 0.035) * 2.5;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Viền đất ẩm & cỏ dập chuyển tiếp tự nhiên (Outer Transition)
          ctx.fillStyle = '#383826';
          for (const sp of samples) {
            const rOut = sp.r + 6;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.82), rOut * 2, Math.round(rOut * 1.64));
          }

          // Lớp 2: Bờ đất nâu sẫm (Dark Earth Rim)
          ctx.fillStyle = '#4e3b29';
          for (const sp of samples) {
            const rMid = sp.r + 3;
            ctx.fillRect(sp.lx - rMid, sp.ly - Math.round(rMid * 0.82), rMid * 2, Math.round(rMid * 1.64));
          }

          // Lớp 3: Lòng đường đất nâu ấm (Main Dirt Trail)
          ctx.fillStyle = '#684e37';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.8), sp.r * 2, Math.round(sp.r * 1.6));
          }

          // Lớp 4: Vệt đất sỏi sáng nhẹ ở giữa lối đi (Worn Center Track)
          ctx.fillStyle = '#795c42';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(4, Math.round(sp.r * 0.52));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }

          // Lớp 5: Rải sỏi nhỏ, vết bánh xe và lá khô dọc hai bên mép đường
          for (let i = 0; i < samples.length; i += 3) {
            const sp = samples[i];
            for (let k = 0; k < 2; k++) {
              const ang = nextRand() * Math.PI * 2;
              const rad = nextRand() * (sp.r + 4);
              const px = Math.round(sp.lx + Math.cos(ang) * rad);
              const py = Math.round(sp.ly + Math.sin(ang) * rad * 0.8);
              ctx.fillStyle = nextRand() > 0.5 ? '#433222' : '#8b7357';
              ctx.fillRect(px, py, 2 + Math.floor(nextRand() * 2), 2);
            }
          }

          // Tùy chọn: Đá lát bước chân (Stepping Stones) điểm xuyết trên lối mòn
          if (withSteppingStones) {
            for (let i = 8; i < samples.length - 8; i += 14) {
              const sp = samples[i];
              const oxStone = Math.round((nextRand() - 0.5) * 6);
              const oyStone = Math.round((nextRand() - 0.5) * 5);
              ctx.fillStyle = '#484e54';
              ctx.fillRect(sp.lx + oxStone - 5, sp.ly + oyStone - 4, 10, 7);
              ctx.fillStyle = '#687078';
              ctx.fillRect(sp.lx + oxStone - 4, sp.ly + oyStone - 3, 8, 5);
            }
          }
        };

        // =========================================================================
        // 3. MẠNG LƯỚI ĐƯỜNG MÒN KẾT NỐI TẤT CẢ CÁC KHU VỰC TRONG LÀNG BELLHOLLOW
        // =========================================================================
        // 3.1. Đường Cổng Tây (nối liền mạch từ Fog Crossing tại x=480, y=232 qua vị trí Garth (530, 220) vào Quảng Trường Trung Tâm)
        drawOrganicDirtPath([
          { x: 480, y: 232, r: 22 },
          { x: 535, y: 238, r: 24 },
          { x: 610, y: 262, r: 23 },
          { x: 705, y: 288, r: 25 }
        ], true);

        // 3.2. Nhánh đường Tây-Bắc dẫn lên Nhà Edda (650..762, 80..128) và bãi gỗ/nhựa cây (640..680, 185..220)
        drawOrganicDirtPath([
          { x: 625, y: 260, r: 17 },
          { x: 665, y: 205, r: 17 },
          { x: 706, y: 145, r: 19 }
        ], true);

        // 3.3. Nhánh đường Đông-Bắc dẫn lên Nhà Thảo Mộc của Neris (920..1032, 80..128), vị trí Neris (970, 130) & cụm thảo mộc (1040, 180)
        drawOrganicDirtPath([
          { x: 895, y: 272, r: 18 },
          { x: 945, y: 205, r: 18 },
          { x: 976, y: 145, r: 20 },
          { x: 1038, y: 178, r: 15 }
        ], true);

        // 3.4. Nhánh đường Tây-Nam dẫn xuống bãi đá lửa (620, 350), thảo mộc Nam (740, 440) và Lối Nam ra Nông Trại Trú Ẩn (650, 520)
        drawOrganicDirtPath([
          { x: 715, y: 348, r: 16 },
          { x: 645, y: 356, r: 15 },
          { x: 735, y: 432, r: 15 },
          { x: 675, y: 480, r: 16 },
          { x: 650, y: 520, r: 18 }
        ], false);

        // 3.5. Nhánh đường Đông-Nam từ Quảng Trường qua Khu Chế Tạo (960..985, 360..375), Vườn Thảo Dược và Lối Đông Nam ra Rừng Ngoại Vi (1200, 510)
        drawOrganicDirtPath([
          { x: 905, y: 345, r: 19 },
          { x: 975, y: 368, r: 22 },
          { x: 1055, y: 392, r: 17 },
          { x: 1125, y: 385, r: 15 },
          { x: 1165, y: 450, r: 16 },
          { x: 1200, y: 510, r: 18 }
        ], true);

        // 3.6. Đường Rừng Phía Đông (từ Quảng Trường Trung Tâm x=935 uốn lượn qua Cổng Đông x=1490 tới ranh giới The Crooked Path x=1600, y=280)
        drawOrganicDirtPath([
          { x: 925, y: 300, r: 23 },
          { x: 1045, y: 288, r: 21 },
          { x: 1185, y: 274, r: 20 },
          { x: 1335, y: 286, r: 20 },
          { x: 1475, y: 278, r: 21 },
          { x: 1600, y: 282, r: 22 }
        ], false);

        // =========================================================================
        // 4. HÀM VẼ SÂN ĐÁ CUỘI CỔ (COBBLESTONE COURTYARD / PLAZA) CÓ VIỀN ĐÁ & RÊU PHONG
        // =========================================================================
        const cobbleTileImg = this.scene.textures.get(TILE_COBBLE_ROAD).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        const drawCobbleCourtyard = (
          wxCenter: number,
          wyCenter: number,
          radiusX: number,
          radiusY: number,
          shape: 'oval' | 'rounded_rect' = 'oval'
        ) => {
          const cx = toLX(wxCenter);
          const cy = toLY(wyCenter);
          const rx = Math.round(radiusX);
          const ry = Math.round(radiusY);

          const isInside = (dx: number, dy: number, pad: number): boolean => {
            const arx = Math.max(4, rx + pad);
            const ary = Math.max(4, ry + pad);
            if (shape === 'oval') {
              return (dx * dx) / (arx * arx) + (dy * dy) / (ary * ary) <= 1.0;
            }
            // Hình chữ nhật bo góc mềm (Superellipse bậc 4)
            const nx = Math.abs(dx) / arx;
            const ny = Math.abs(dy) / ary;
            return Math.pow(nx, 3.2) + Math.pow(ny, 3.2) <= 1.0;
          };

          // 4.1. Viền đất/cỏ chuyển tiếp quanh sân đá
          for (let dy = -ry - 8; dy <= ry + 8; dy += 2) {
            for (let dx = -rx - 8; dx <= rx + 8; dx += 2) {
              if (isInside(dx, dy, 6) && !isInside(dx, dy, -2)) {
                ctx.fillStyle = (dx + dy) % 4 === 0 ? '#3a3728' : '#523f2c';
                ctx.fillRect(cx + dx, cy + dy, 2, 2);
              }
            }
          }

          // 4.2. Nền vữa đá, vân TILE_COBBLE_ROAD mờ & mạch rêu phong dưới các viên đá cuội
          for (let dy = -ry; dy <= ry; dy += 2) {
            for (let dx = -rx; dx <= rx; dx += 2) {
              if (isInside(dx, dy, 0)) {
                ctx.fillStyle = nextRand() > 0.32 ? '#2c3230' : '#354831';
                ctx.fillRect(cx + dx, cy + dy, 2, 2);
              }
            }
          }
          if (cobbleTileImg && cobbleTileImg.width > 0) {
            ctx.save();
            ctx.globalAlpha = 0.22;
            for (let ty = -ry + 4; ty <= ry - 16; ty += 16) {
              for (let tx = -rx + 4; tx <= rx - 16; tx += 16) {
                if (isInside(tx + 8, ty + 8, -4)) {
                  ctx.drawImage(cobbleTileImg, cx + tx, cy + ty, 16, 16);
                }
              }
            }
            ctx.restore();
          }

          // 4.3. Lát từng viên đá cuội đa sắc độ (xám lam, xám ấm, đá rêu) theo hàng so le
          const stoneColors = ['#4f565c', '#5b636a', '#646c73', '#565c58', '#68655c', '#485056'];
          for (let row = -ry + 2; row <= ry - 3; row += 7) {
            const rowOffset = (Math.floor((row + ry) / 7) % 2) * 5;
            for (let col = -rx + 2 + rowOffset; col <= rx - 4; col += 10) {
              const stoneW = 7 + (Math.abs(col * 3 + row) % 3);
              const stoneH = 5;
              if (!isInside(col, row, -3) || !isInside(col + stoneW, row + stoneH, -3)) {
                continue;
              }
              const baseCol = stoneColors[Math.floor(nextRand() * stoneColors.length)];
              ctx.fillStyle = baseCol;
              ctx.fillRect(cx + col, cy + row, stoneW, stoneH);

              // Viền sáng phía trên viên đá tạo độ nổi khối pixel-art
              ctx.fillStyle = 'rgba(215, 225, 230, 0.16)';
              ctx.fillRect(cx + col, cy + row, stoneW - 1, 1);

              // Viền tối dưới chân viên đá
              ctx.fillStyle = 'rgba(15, 20, 24, 0.32)';
              ctx.fillRect(cx + col, cy + row + stoneH - 1, stoneW, 1);
            }
          }

          // 4.4. Viền đá bó vỉa (Curb Stones) bao quanh mép sân đá
          const steps = Math.max(48, Math.round((rx + ry) * 1.1));
          for (let s = 0; s < steps; s++) {
            const ang = (s / steps) * Math.PI * 2;
            let bx = Math.cos(ang) * (rx - 2);
            let by = Math.sin(ang) * (ry - 2);
            if (shape === 'rounded_rect') {
              const cosA = Math.cos(ang);
              const sinA = Math.sin(ang);
              const scale = Math.pow(Math.pow(Math.abs(cosA), 3.2) + Math.pow(Math.abs(sinA), 3.2), -1 / 3.2);
              bx = cosA * (rx - 2) * scale;
              by = sinA * (ry - 2) * scale;
            }
            const px = Math.round(cx + bx);
            const py = Math.round(cy + by);
            ctx.fillStyle = '#363c40';
            ctx.fillRect(px - 3, py - 2, 6, 5);
            ctx.fillStyle = '#6a7278';
            ctx.fillRect(px - 2, py - 1, 4, 3);
          }
        };

        // =========================================================================
        // 5. DỰNG QUẢNG TRƯỜNG TRUNG TÂM BELLHOLLOW & CÁC SÂN ĐÁ CÔNG TRÌNH
        // =========================================================================
        // 5.1. Quảng Trường Trung Tâm (Central Village Square: wx = 695..925, wy = 245..395)
        // Kết nối Tháp Chuông (820..900, 252..310), Bà Lão Edda (790, 330) và Giếng Làng (726, 376)
        drawCobbleCourtyard(810, 322, 118, 74, 'rounded_rect');

        // Họa tiết vòng đá cổ đồng tâm tại tâm Quảng Trường Trung Tâm & quanh Giếng Làng
        const drawStoneRing = (wx: number, wy: number, rRing: number) => {
          const rcx = toLX(wx);
          const rcy = toLY(wy);
          for (let a = 0; a < 36; a++) {
            const rad = (a / 36) * Math.PI * 2;
            const px = Math.round(rcx + Math.cos(rad) * rRing);
            const py = Math.round(rcy + Math.sin(rad) * (rRing * 0.72));
            ctx.fillStyle = a % 2 === 0 ? '#787e82' : '#586066';
            ctx.fillRect(px - 2, py - 2, 4, 3);
          }
        };
        drawStoneRing(825, 322, 44);
        drawStoneRing(726, 376, 26);

        // 5.2. Sân hiên lát đá trước Nhà Edda (wx: 648..760, wy: 98..154)
        drawCobbleCourtyard(704, 126, 54, 24, 'rounded_rect');

        // 5.3. Sân hiên lát đá rộng rãi trước Nhà Thảo Mộc Neris (wx: 914..1026, wy: 92..156)
        // Đảm bảo NPC Neris tại (970, 130) đứng chính giữa sân đá thoáng đãng trước cửa nhà
        drawCobbleCourtyard(970, 126, 56, 26, 'rounded_rect');

        // 5.4. Sân đá Khu Chế Tạo & Lò Rèn (wx: 932..1022, wy: 342..394)
        drawCobbleCourtyard(978, 368, 46, 26, 'rounded_rect');

        // 5.5. Sân đá Trạm Gác Cổng Tây chỗ Garth (wx: 500..564, wy: 196..248)
        drawCobbleCourtyard(530, 222, 34, 24, 'oval');

        // 5.6. Lối bậc đá dẫn từ Quảng Trường lên Tháp Chuông (wx: 825..895, wy: 245..328)
        drawCobbleCourtyard(860, 295, 36, 30, 'rounded_rect');

        // 5.7. Sân hiên trước Nhà Dân Làng Tây-Nam (wx: 520..616, wy: 418..454)
        drawCobbleCourtyard(568, 434, 42, 18, 'rounded_rect');

        // =========================================================================
        // 6. CHI TIẾT THẢM THỰC VẬT MẶT ĐẤT (HOA DẠI, LÁ RỤNG, ÁNH ĐÈN ẤM TRÊN NỀN ĐÁ)
        // =========================================================================
        // Ánh phản chiếu vàng ấm dịu trên mặt đá quanh Giếng Làng, Tháp Chuông và Bàn Chế Tạo
        const addWarmGroundPool = (wx: number, wy: number, radius: number, alpha: number) => {
          const lx = toLX(wx);
          const ly = toLY(wy);
          const g = ctx.createRadialGradient(lx, ly, 4, lx, ly, radius);
          g.addColorStop(0, `rgba(243, 156, 18, ${alpha})`);
          g.addColorStop(0.6, `rgba(211, 84, 0, ${alpha * 0.45})`);
          g.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = g;
          ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);
        };
        addWarmGroundPool(726, 376, 56, 0.22); // Quanh giếng làng
        addWarmGroundPool(855, 326, 64, 0.20); // Trước cửa tháp chuông & Bà Lão Edda
        addWarmGroundPool(978, 368, 54, 0.22); // Quanh bàn chế tạo & lò rèn
        addWarmGroundPool(704, 122, 48, 0.18); // Trước hiên nhà Edda
        addWarmGroundPool(970, 122, 50, 0.20); // Trước hiên nhà Neris
        addWarmGroundPool(530, 218, 46, 0.18); // Trạm gác cổng Tây chỗ Garth
        addWarmGroundPool(568, 430, 42, 0.16); // Trước hiên nhà Tây-Nam

        // Hoa dại nhỏ & lá thu rụng ven lối mòn trong vùng hiển thị chính (wy: 40..520)
        const flowerColors = ['#d4ac0d', '#e67e22', '#c0392b', '#a9dfbf', '#d2b4de'];
        for (let i = 0; i < 220; i++) {
          const wx = 500 + nextRand() * 1060;
          const wy = 55 + nextRand() * 440;
          const lx = toLX(wx);
          const ly = toLY(wy);
          // Tránh vẽ đè lên chính giữa tâm sân đá quảng trường
          if (wx > 710 && wx < 910 && wy > 260 && wy < 380) continue;
          ctx.fillStyle = '#1e3019';
          ctx.fillRect(lx - 1, ly, 3, 2);
          ctx.fillStyle = flowerColors[Math.floor(nextRand() * flowerColors.length)];
          ctx.fillRect(lx, ly - 1, 2, 2);
        }

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-17: Dựng bề mặt địa hình Nông Trại Trú Ẩn (Sanctuary Farm) trên 1 CanvasTexture duy nhất (sanctuary_farm_ground_baked_v12).
   * Khớp nối hoàn toàn với Lối Nam Bellhollow tại (650, 560) và lối sang Rừng Ngoại Vi tại (1120, 740).
   * Bao gồm thảm cỏ đồng quê ấm áp, 2 thửa ruộng thảo mộc cày luống màu mỡ, ao tưới nước tự nhiên và mạng lưới đường đất rộng rãi.
   */
  private renderSanctuaryFarmTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'sanctuary_farm_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 640 (x: 480..1120)
      const H = bounds.height; // 480 (y: 560..1040)
      const ox = bounds.x;     // 480
      const oy = bounds.y;     // 560

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 823417;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. Nền thảm cỏ đồng quê màu nâu rêu sậm
        ctx.fillStyle = '#2b3c23';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.28;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Quầng sáng đồng cỏ ấm áp ở trung tâm nông trại
        const farmWarmth = ctx.createRadialGradient(
          toLX(720), toLY(750), 40,
          toLX(720), toLY(750), 380
        );
        farmWarmth.addColorStop(0, 'rgba(78, 102, 54, 0.40)');
        farmWarmth.addColorStop(0.65, 'rgba(52, 74, 40, 0.22)');
        farmWarmth.addColorStop(1, 'rgba(16, 26, 16, 0.65)');
        ctx.fillStyle = farmWarmth;
        ctx.fillRect(0, 0, W, H);

        // Bóng râm thảm thực vật rìa Tây (wx < 530) và rìa Nam (wy > 980)
        const westShade = ctx.createLinearGradient(0, 0, toLX(530), 0);
        westShade.addColorStop(0, 'rgba(12, 18, 14, 0.78)');
        westShade.addColorStop(1, 'rgba(12, 18, 14, 0)');
        ctx.fillStyle = westShade;
        ctx.fillRect(0, 0, toLX(530), H);

        const southShade = ctx.createLinearGradient(0, toLY(980), 0, H);
        southShade.addColorStop(0, 'rgba(12, 18, 14, 0)');
        southShade.addColorStop(1, 'rgba(12, 18, 14, 0.85)');
        ctx.fillStyle = southShade;
        ctx.fillRect(0, toLY(980), W, H - toLY(980));

        // Rải rác đốm rêu và cỏ dại nông trại
        const farmMossPalette = ['#24351f', '#32482a', '#3c5532', '#48633c'];
        for (let i = 0; i < 900; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 3 + Math.floor(nextRand() * 9);
          const ph = 3 + Math.floor(nextRand() * 6);
          ctx.fillStyle = farmMossPalette[Math.floor(nextRand() * farmMossPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // 2. Sân làm việc trung tâm & Thềm đất Vườn ươm Thảo Dược (C4-12-19)
        // 2.1. Sân làm việc trung tâm lát đá sỏi nện mộc mạc (wx: 620..710, wy: 635..740)
        const yardLX = toLX(620);
        const yardLY = toLY(635);
        ctx.fillStyle = '#3e2e1e';
        ctx.fillRect(yardLX, yardLY, 92, 106);
        ctx.fillStyle = '#523f2c';
        ctx.fillRect(yardLX + 3, yardLY + 3, 86, 100);
        for (let y = yardLY + 6; y < yardLY + 98; y += 12) {
          for (let x = yardLX + 6; x < yardLX + 84; x += 14) {
            ctx.fillStyle = nextRand() > 0.5 ? '#67523b' : '#382a1c';
            ctx.fillRect(x + Math.floor((nextRand() - 0.5) * 4), y + Math.floor((nextRand() - 0.5) * 4), 6, 4);
          }
        }

        // 2.2. Thềm đất Vườn ươm Thảo Dược Sanctuary (wx: 735..865, wy: 625..720)
        const terraceLX = toLX(735);
        const terraceLY = toLY(625);
        ctx.fillStyle = '#2a1d13';
        ctx.fillRect(terraceLX, terraceLY, 130, 95);
        ctx.fillStyle = '#382519';
        ctx.fillRect(terraceLX + 3, terraceLY + 3, 124, 89);
        ctx.strokeStyle = '#4e5d6c';
        ctx.lineWidth = 2;
        ctx.strokeRect(terraceLX + 1, terraceLY + 1, 128, 93);

        // Lối đi kết nối giữa Sân trung tâm và Thềm vườn dược (wx: 700..740, wy: 650..690)
        ctx.fillStyle = '#523f2c';
        ctx.fillRect(toLX(700), toLY(650), 40, 42);

        // 3. Mạng lưới đường mòn đất nông trại
        const drawFarmPath = (points: Array<{ x: number; y: number; r: number }>) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.05 + wy * 0.04) * 2;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Viền đất ẩm cỏ dập
          ctx.fillStyle = '#3a3a28';
          for (const sp of samples) {
            const rOut = sp.r + 5;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.8), rOut * 2, Math.round(rOut * 1.6));
          }
          // Lớp 2: Lòng đường đất nâu ấm
          ctx.fillStyle = '#654c35';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.8), sp.r * 2, Math.round(sp.r * 1.6));
          }
          // Lớp 3: Vệt lối mòn sáng
          ctx.fillStyle = '#7a5d43';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(3, Math.round(sp.r * 0.5));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }
          // Lớp 4: Sỏi rải rác
          for (let i = 0; i < samples.length; i += 4) {
            const sp = samples[i];
            const sx = sp.lx + Math.round((nextRand() - 0.5) * sp.r * 1.5);
            const sy = sp.ly + Math.round((nextRand() - 0.5) * sp.r * 1.2);
            ctx.fillStyle = nextRand() > 0.5 ? '#8e775a' : '#453323';
            ctx.fillRect(sx, sy, 2, 2);
          }
        };

        // Đường Lối Bắc nối từ Cổng Nam Bellhollow (650, 560) xuống ngã ba nông trại (650, 740)
        drawFarmPath([
          { x: 650, y: 560, r: 20 },
          { x: 650, y: 620, r: 21 },
          { x: 645, y: 680, r: 22 },
          { x: 650, y: 740, r: 24 }
        ]);

        // Đường trục Đông-Tây nối từ Khu Nhà Kho (540, 740) qua Ngã Ba sang Rừng Ngoại Vi (1120, 740)
        drawFarmPath([
          { x: 535, y: 740, r: 18 },
          { x: 650, y: 740, r: 24 },
          { x: 770, y: 745, r: 20 },
          { x: 910, y: 740, r: 21 },
          { x: 1030, y: 745, r: 22 },
          { x: 1120, y: 740, r: 22 }
        ]);

        // Đường dẫn Nam đi giữa 2 khu ruộng canh tác
        drawFarmPath([
          { x: 650, y: 740, r: 22 },
          { x: 650, y: 820, r: 18 },
          { x: 655, y: 900, r: 18 },
          { x: 650, y: 970, r: 19 }
        ]);

        // 3. Hai thửa ruộng canh tác lớn (Furrowed Soil Crop Fields - theo layout concept)
        const drawTilledField = (fx: number, fy: number, fw: number, fh: number, seedColor: string) => {
          const lfx = toLX(fx);
          const lfy = toLY(fy);
          // Nền đất mùn hữu cơ sẫm màu
          ctx.fillStyle = '#342315';
          ctx.fillRect(lfx, lfy, fw, fh);
          // Viền bờ đất xới
          ctx.strokeStyle = '#23170d';
          ctx.lineWidth = 3;
          ctx.strokeRect(lfx, lfy, fw, fh);

          // Các luống đất xới ngang đều đặn với vệt rãnh và gờ đất
          const furrowH = 14;
          for (let y = lfy + 4; y < lfy + fh - 4; y += furrowH) {
            // Rãnh tối
            ctx.fillStyle = '#20150c';
            ctx.fillRect(lfx + 3, y, fw - 6, 4);
            // Gờ đất sáng
            ctx.fillStyle = '#48331e';
            ctx.fillRect(lfx + 3, y + 4, fw - 6, 6);
            // Vệt đất xốp
            ctx.fillStyle = '#5a3f27';
            ctx.fillRect(lfx + 5, y + 6, fw - 10, 2);

            // Mầm cây / luống thảo dược nhô lên đều đặn
            for (let x = lfx + 8; x < lfx + fw - 8; x += 16) {
              const sproutX = x + Math.floor((nextRand() - 0.5) * 4);
              ctx.fillStyle = seedColor;
              ctx.fillRect(sproutX, y + 3, 3, 3);
              ctx.fillStyle = '#78b857';
              ctx.fillRect(sproutX + 1, y + 2, 2, 2);
            }
          }
        };

        // Ruộng Tây (Thảo mộc xanh):
        drawTilledField(520, 800, 95, 160, '#4e8238');
        // Ruộng Đông (Thảo mộc hoa vàng/tím):
        drawTilledField(705, 800, 185, 160, '#5a8f42');

        // 4. Hồ Nước Tưới Tiêu / Ao Nông Trại Tự Nhiên (Irrigation Pond: wx 930..1020, wy 705..785)
        const pondLX = toLX(975);
        const pondLY = toLY(745);
        const prx = 44;
        const pry = 32;

        // Bờ đất sỏi quanh ao
        ctx.fillStyle = '#35271d';
        ctx.beginPath();
        ctx.ellipse(pondLX, pondLY, prx + 8, pry + 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Viền đá cuội quanh bờ ao
        for (let a = 0; a < Math.PI * 2; a += 0.35) {
          const bx = pondLX + Math.cos(a) * (prx + 5);
          const by = pondLY + Math.sin(a) * (pry + 4);
          ctx.fillStyle = nextRand() > 0.5 ? '#485257' : '#333b40';
          ctx.fillRect(Math.round(bx - 3), Math.round(by - 2), 6, 5);
        }

        // Lòng nước ao sâu màu xanh rêu
        const pondGrad = ctx.createRadialGradient(pondLX, pondLY, 6, pondLX, pondLY, prx);
        pondGrad.addColorStop(0, '#264858');
        pondGrad.addColorStop(0.7, '#1b323e');
        pondGrad.addColorStop(1, '#132129');
        ctx.fillStyle = pondGrad;
        ctx.beginPath();
        ctx.ellipse(pondLX, pondLY, prx, pry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vài cụm bèo tây / hoa súng trên mặt ao
        ctx.fillStyle = '#3b6e45';
        ctx.fillRect(pondLX - 16, pondLY - 8, 8, 5);
        ctx.fillRect(pondLX + 12, pondLY + 4, 7, 5);
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(pondLX - 13, pondLY - 7, 2, 2);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-17: Dựng bề mặt địa hình Rừng Ngoại Vi (Outer Woods) trên 1 CanvasTexture duy nhất (outer_woods_ground_baked_v12).
   * Khớp nối hoàn hảo với Lối Đông-Nam Bellhollow tại (1210, 560) và Lối Tây từ Nông Trại tại (1120, 740).
   * Bao gồm thảm lá kim tối màu, rêu rừng ẩm, bãi trại thợ săn và đường mòn đất uốn lượn tự nhiên.
   */
  private renderOuterWoodsTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'outer_woods_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 480 (x: 1120..1600)
      const H = bounds.height; // 480 (y: 560..1040)
      const ox = bounds.x;     // 1120
      const oy = bounds.y;     // 560

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 614259;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. Nền cỏ rừng lá kim tối màu
        ctx.fillStyle = '#202f1d';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Bóng tối rừng sâu sẫm màu ở phía Đông (wx > 1440) và phía Nam (wy > 960)
        const eastForestShade = ctx.createLinearGradient(toLX(1440), 0, W, 0);
        eastForestShade.addColorStop(0, 'rgba(10, 16, 12, 0)');
        eastForestShade.addColorStop(0.5, 'rgba(10, 16, 12, 0.45)');
        eastForestShade.addColorStop(1, 'rgba(10, 16, 12, 0.88)');
        ctx.fillStyle = eastForestShade;
        ctx.fillRect(toLX(1440), 0, W - toLX(1440), H);

        const southForestShade = ctx.createLinearGradient(0, toLY(960), 0, H);
        southForestShade.addColorStop(0, 'rgba(10, 16, 12, 0)');
        southForestShade.addColorStop(1, 'rgba(10, 16, 12, 0.85)');
        ctx.fillStyle = southForestShade;
        ctx.fillRect(0, toLY(960), W, H - toLY(960));

        // Rải rác đốm rêu rừng và mùn lá kim sẫm màu
        const woodsMossPalette = ['#1a2918', '#253920', '#2d4428', '#1c2618', '#3b2c1b', '#2e2215'];
        for (let i = 0; i < 900; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 4 + Math.floor(nextRand() * 8);
          const ph = 3 + Math.floor(nextRand() * 5);
          ctx.fillStyle = woodsMossPalette[Math.floor(nextRand() * woodsMossPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // C4-12-20: Các khoảng rừng thưa tự nhiên (Forest Clearings)
        // 1.1. Bãi Cửa Rừng phía Bắc (North Entrance Clearing: quanh wx 1210, wy 620)
        const northLX = toLX(1210);
        const northLY = toLY(620);
        ctx.fillStyle = '#324426';
        ctx.beginPath();
        ctx.ellipse(northLX, northLY, 44, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1.2. Bãi Đất Trại Thợ Săn (Hunter's Camp Clearing: quanh wx 1330, wy 730)
        const campLX = toLX(1330);
        const campLY = toLY(730);
        ctx.fillStyle = '#423220';
        ctx.beginPath();
        ctx.ellipse(campLX, campLY, 48, 34, 0, 0, Math.PI * 2);
        ctx.fill();

        // Đống tro tàn và vòng đá lửa trại
        ctx.fillStyle = '#1c1c1c';
        ctx.beginPath();
        ctx.ellipse(campLX, campLY, 15, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Viền đá cuội quanh bếp lửa
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
          const rx = campLX + Math.cos(a) * 15;
          const ry = campLY + Math.sin(a) * 11;
          ctx.fillStyle = '#414a4e';
          ctx.fillRect(Math.round(rx - 2), Math.round(ry - 2), 5, 4);
        }

        // Than hồng âm ỉ
        ctx.fillStyle = '#d35400';
        ctx.fillRect(campLX - 4, campLY - 2, 8, 4);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(campLX - 2, campLY - 1, 4, 2);

        // 1.3. Bãi Suối Rừng Phía Đông (East Brook Clearing: quanh wx 1460, wy 810)
        const brookClearLX = toLX(1460);
        const brookClearLY = toLY(810);
        ctx.fillStyle = '#26382e';
        ctx.beginPath();
        ctx.ellipse(brookClearLX, brookClearLY, 42, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1.4. Bãi Liễu Cổ Thụ Bí Ẩn Phía Nam (South Willow Clearing: quanh wx 1260, wy 920)
        const willowLX = toLX(1260);
        const willowLY = toLY(920);
        ctx.fillStyle = '#2a3d22';
        ctx.beginPath();
        ctx.ellipse(willowLX, willowLY, 54, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#344e2b';
        ctx.beginPath();
        ctx.ellipse(willowLX, willowLY, 38, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hoa dại tím và vàng mọc rải rác quanh bãi liễu
        const flowerPalette = ['#9b59b6', '#f1c40f', '#aed581', '#e082ba'];
        for (let f = 0; f < 35; f++) {
          const fx = willowLX + (nextRand() - 0.5) * 80;
          const fy = willowLY + (nextRand() - 0.5) * 60;
          ctx.fillStyle = flowerPalette[Math.floor(nextRand() * flowerPalette.length)];
          ctx.fillRect(Math.round(fx), Math.round(fy), 3, 3);
        }

        // 2. Mạng lưới đường mòn đất rừng tự nhiên & lối rẽ phụ
        const drawWoodsPath = (points: Array<{ x: number; y: number; r: number }>) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.06 + wy * 0.05) * 2;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Rìa cỏ dập
          ctx.fillStyle = '#323220';
          for (const sp of samples) {
            const rOut = sp.r + 5;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.8), rOut * 2, Math.round(rOut * 1.6));
          }
          // Lớp 2: Đất nâu rừng
          ctx.fillStyle = '#5c452e';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.8), sp.r * 2, Math.round(sp.r * 1.6));
          }
          // Lớp 3: Lối mòn mòn vẹt
          ctx.fillStyle = '#705439';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(3, Math.round(sp.r * 0.5));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }
        };

        // Tuyến đường chính: Từ Cổng Làng Bellhollow (1210, 560) qua Bãi Cửa Rừng xuống Ngã Ba Trại Thợ Săn (1270, 740)
        drawWoodsPath([
          { x: 1210, y: 560, r: 20 },
          { x: 1235, y: 620, r: 20 },
          { x: 1255, y: 680, r: 21 },
          { x: 1270, y: 740, r: 22 }
        ]);

        // Nhánh liên thông từ Nông Trại Trú Ẩn (1120, 740) sang Ngã Ba Trại (1270, 740) và vào Bãi Trại (1330, 730)
        drawWoodsPath([
          { x: 1120, y: 740, r: 22 },
          { x: 1200, y: 745, r: 21 },
          { x: 1270, y: 740, r: 22 },
          { x: 1330, y: 730, r: 24 }
        ]);

        // Nhánh rẽ chính tiếp nối từ Bãi Trại về phía Bãi Suối Rừng Đông-Nam (1330 -> 1460, 810)
        drawWoodsPath([
          { x: 1330, y: 730, r: 24 },
          { x: 1390, y: 760, r: 20 },
          { x: 1460, y: 810, r: 19 }
        ]);

        // C4-12-20: Nhánh rẽ phụ khám phá tiếp nối về phía Đông tiếp giáp biên giới Đường Mòn Quanh Co
        drawWoodsPath([
          { x: 1460, y: 810, r: 19 },
          { x: 1510, y: 795, r: 17 },
          { x: 1555, y: 780, r: 16 }
        ]);

        // C4-12-20: Nhánh rẽ phụ uốn lượn xuống Bãi Liễu Cổ Thụ Bí Ẩn Phía Nam (1270, 740 -> 1260, 920)
        drawWoodsPath([
          { x: 1270, y: 740, r: 21 },
          { x: 1265, y: 820, r: 18 },
          { x: 1260, y: 910, r: 22 }
        ]);

        // 3. Con suối nhỏ / lạch nước rừng ven phía Đông (wx: 1445..1480, wy: 780..960)
        const brookLX = toLX(1460);
        ctx.fillStyle = '#15222c';
        for (let by = toLY(780); by < toLY(960); by += 8) {
          const wobble = Math.sin(by * 0.08) * 7;
          ctx.fillRect(brookLX + wobble - 9, by, 18, 8);
          ctx.fillStyle = '#203442';
          ctx.fillRect(brookLX + wobble - 5, by + 2, 10, 4);
          ctx.fillStyle = '#2d4a5d';
          ctx.fillRect(brookLX + wobble - 2, by + 3, 4, 2);
        }

        // Bờ đá cuội và đá bước qua suối (Stepping Stones) tại wy ~ 845
        for (let si = 0; si < 3; si++) {
          const sx = brookLX - 6 + si * 5;
          const sy = toLY(840 + si * 8);
          ctx.fillStyle = '#485250';
          ctx.fillRect(sx, sy, 8, 6);
          ctx.fillStyle = '#6f7a78';
          ctx.fillRect(sx + 1, sy + 1, 6, 3);
        }

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-12: Dựng bề mặt địa hình, nền rừng sậm màu và mạng lưới đường mòn đất uốn lượn tự nhiên
   * cho Đường Mòn Quanh Co (The Crooked Path) trên 1 CanvasTexture duy nhất (crooked_path_ground_baked_v12).
   * Khớp nối chuẩn xác 100% với Cổng Đông Bellhollow tại (1600, 282) và Đầm Lầy Tĩnh Lặng tại (2880, 300).
   */
  private renderCrookedPathTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'crooked_path_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 1280
      const H = bounds.height; // 640
      const ox = bounds.x;     // 1600
      const oy = bounds.y;     // 0

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 716253;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. NỀN RỪNG SẬM MÀU CÓ CHIỀU SÂU
        ctx.fillStyle = '#22321e';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.22;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Bóng rừng phía Bắc (wy < 140) và phía Nam (wy > 480)
        const northShade = ctx.createLinearGradient(0, 0, 0, 140);
        northShade.addColorStop(0, 'rgba(10, 16, 12, 0.90)');
        northShade.addColorStop(0.7, 'rgba(14, 22, 16, 0.45)');
        northShade.addColorStop(1, 'rgba(14, 22, 16, 0)');
        ctx.fillStyle = northShade;
        ctx.fillRect(0, 0, W, 140);

        const southShade = ctx.createLinearGradient(0, H - 140, 0, H);
        southShade.addColorStop(0, 'rgba(14, 22, 16, 0)');
        southShade.addColorStop(0.3, 'rgba(14, 22, 16, 0.45)');
        southShade.addColorStop(1, 'rgba(10, 16, 12, 0.90)');
        ctx.fillStyle = southShade;
        ctx.fillRect(0, H - 140, W, 140);

        // Thảm rêu, lá kim rụng và bụi đất rừng hữu cơ
        const forestPalette = ['#1d2919', '#273822', '#2f4429', '#3b5433', '#433120'];
        for (let i = 0; i < 1800; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 3 + Math.floor(nextRand() * 10);
          const ph = 3 + Math.floor(nextRand() * 6);
          ctx.fillStyle = forestPalette[Math.floor(nextRand() * forestPalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // C4-13-20: Hòa sắc chuyển tiếp tự nhiên rộng 200px (2680..2880) giữa Đường Mòn Quanh Co và Đầm Lầy Tĩnh Lặng
        // Xóa bỏ hoàn toàn vạch cắt dọc thô sơ "hai thế cực" giữa nền cỏ và nền bùn đầm lầy tại x = 2880
        const eastMireTransition = ctx.createLinearGradient(toLX(2680), 0, toLX(2880), 0);
        eastMireTransition.addColorStop(0, 'rgba(28, 40, 34, 0)');
        eastMireTransition.addColorStop(0.35, 'rgba(28, 40, 34, 0.45)');
        eastMireTransition.addColorStop(0.7, 'rgba(24, 36, 30, 0.78)');
        eastMireTransition.addColorStop(1, 'rgba(28, 40, 34, 0.98)');
        ctx.fillStyle = eastMireTransition;
        ctx.fillRect(toLX(2680), 0, toLX(2880) - toLX(2680), H);

        // 2. HÀM VẼ ĐƯỜNG MÒN ĐẤT RỪNG UỐN LƯỢN TỰ NHIÊN
        const drawTrail = (points: Array<{ x: number; y: number; r: number }>, withStones: boolean = false) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.05 + wy * 0.04) * 2.5;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Viền đất ẩm & cỏ dập (Outer transition)
          ctx.fillStyle = '#343825';
          for (const sp of samples) {
            const rOut = sp.r + 6;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.82), rOut * 2, Math.round(rOut * 1.64));
          }

          // Lớp 2: Bờ đất nâu sẫm
          ctx.fillStyle = '#4a3827';
          for (const sp of samples) {
            const rMid = sp.r + 3;
            ctx.fillRect(sp.lx - rMid, sp.ly - Math.round(rMid * 0.82), rMid * 2, Math.round(rMid * 1.64));
          }

          // Lớp 3: Lòng đường đất rừng ấm
          ctx.fillStyle = '#654c35';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.8), sp.r * 2, Math.round(sp.r * 1.6));
          }

          // Lớp 4: Vệt đất mòn sáng
          ctx.fillStyle = '#775a3e';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(4, Math.round(sp.r * 0.52));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }

          // C4-13-20: Hòa sắc lòng đường tiếp giáp Silent Mire (x: 2760..2880)
          // chuyển tiếp mượt mà từ đất rừng ấm sang gờ đất đầm lầy nâu rêu (#413a2c và #564d3b)
          for (const sp of samples) {
            if (sp.lx >= toLX(2760)) {
              const blendRatio = (sp.lx - toLX(2760)) / (toLX(2880) - toLX(2760));
              ctx.save();
              ctx.globalAlpha = Math.min(1.0, blendRatio * 0.95);
              ctx.fillStyle = '#413a2c';
              ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.78), sp.r * 2, Math.round(sp.r * 1.56));
              ctx.fillStyle = '#564d3b';
              const rIn = Math.max(4, Math.round(sp.r * 0.5));
              ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
              ctx.restore();
            }
          }

          // Lớp 5: Sỏi rừng và vết rễ cây gồ ghề
          for (let i = 0; i < samples.length; i += 3) {
            const sp = samples[i];
            for (let k = 0; k < 2; k++) {
              const ang = nextRand() * Math.PI * 2;
              const rad = nextRand() * (sp.r + 3);
              const px = Math.round(sp.lx + Math.cos(ang) * rad);
              const py = Math.round(sp.ly + Math.sin(ang) * rad * 0.8);
              ctx.fillStyle = nextRand() > 0.5 ? '#3a2b1c' : '#887256';
              ctx.fillRect(px, py, 2 + Math.floor(nextRand() * 2), 2);
            }
          }

          if (withStones) {
            for (let i = 10; i < samples.length - 10; i += 16) {
              const sp = samples[i];
              const oxStone = Math.round((nextRand() - 0.5) * 6);
              const oyStone = Math.round((nextRand() - 0.5) * 4);
              ctx.fillStyle = '#494f54';
              ctx.fillRect(sp.lx + oxStone - 5, sp.ly + oyStone - 3, 10, 6);
              ctx.fillStyle = '#6c747a';
              ctx.fillRect(sp.lx + oxStone - 4, sp.ly + oyStone - 2, 8, 4);
            }
          }
        };

        // Hàm vẽ bãi đất trống hữu cơ quanh hốc cây / tảng đá
        const drawClearing = (wx: number, wy: number, rx: number, ry: number) => {
          const cx = toLX(wx);
          const cy = toLY(wy);
          ctx.fillStyle = '#343825';
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx + 6, ry + 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#4a3827';
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx + 3, ry + 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#654c35';
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        };

        // Bãi đất quanh các điểm mốc
        drawClearing(1900, 180, 36, 26); // Thân cây rỗng 1
        drawClearing(2100, 280, 48, 32); // Tảng đá lớn giữa rừng
        drawClearing(2350, 420, 36, 26); // Thân cây rỗng 2

        // 3.1. Tuyến đường chính uốn lượn từ Cổng Đông Bellhollow sang Silent Mire
        drawTrail([
          { x: 1600, y: 282, r: 22 }, // Khớp 100% Cổng Đông Bellhollow!
          { x: 1720, y: 275, r: 21 },
          { x: 1820, y: 265, r: 20 }, // Gần bụi rậm trốn 1 (1820, 260)
          { x: 1910, y: 235, r: 22 }, // Gần thân cây rỗng 1 (1900, 180)
          { x: 2020, y: 245, r: 22 }, // Ngã 3 rẽ Rừng Sâu
          { x: 2120, y: 270, r: 23 }, // Vòng qua tảng đá (2100, 280)
          { x: 2240, y: 310, r: 21 }, // Lượn xuống phía Nam
          { x: 2340, y: 345, r: 22 }, // Gần thân cây rỗng 2 (2350, 420)
          { x: 2480, y: 340, r: 21 }, // Gần bụi rậm 3 (2500, 380)
          { x: 2620, y: 315, r: 21 },
          { x: 2750, y: 295, r: 20 },
          { x: 2880, y: 300, r: 20 }  // Khớp 100% cổng vào Silent Mire!
        ], true);

        // 3.2. Nhánh rẽ phía Bắc lên Rừng Sâu (Deep Forest Branch)
        drawTrail([
          { x: 2020, y: 245, r: 20 },
          { x: 2055, y: 170, r: 18 },
          { x: 2085, y: 95, r: 17 },
          { x: 2100, y: 35, r: 18 }   // Tới biển cảnh báo Rừng Sâu (2100, 35)
        ], false);

        // Bãi đất quanh các điểm mốc mới
        drawClearing(1680, 320, 36, 24); // Ngã Ba Rừng Biên Giới
        drawClearing(2650, 260, 30, 20); // Bọc hành trang cũ

        // 3.3. Nhánh rẽ phía Tây-Nam kết nối hai chiều với Rừng Ngoại Vi (Outer Woods Branch C4-12-21)
        drawTrail([
          { x: 1680, y: 285, r: 20 },
          { x: 1660, y: 360, r: 20 },
          { x: 1635, y: 440, r: 21 },
          { x: 1610, y: 500, r: 22 }   // Khớp hoàn hảo vạch chuyển vùng Outer Woods (1600, 440..560)
        ], false);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-22: Dựng bề mặt địa hình phân khu Rừng Sâu (Deep Forest) trên 1 CanvasTexture duy nhất (deep_forest_ground_baked_v12).
   * Không gian nguyên sinh rậm rạp, thâm u hơn hẳn Outer Woods, với các bãi rừng tối, bãi nấm phát quang,
   * cây đại thụ đổ bắc ngang và đường mòn nối tiếp từ Đường Mòn Quanh Co (x: 2000..2160, y: 0) dẫn tới ngưỡng cửa Đầm Lầy Cổ Ngữ (x: 2840, y: -260).
   */
  private renderDeepForestTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'deep_forest_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 1280
      const H = bounds.height; // 640
      const ox = bounds.x;     // 1600
      const oy = bounds.y;     // -640

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 482917;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. NỀN RỪNG NGUYÊN SINH TỐI TĂM THÂM U
        ctx.fillStyle = '#101813';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.15;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Tán rừng rậm tối đặc phía Bắc (wy < -520 -> ly < 120) và hai bên mép rừng
        const northCanopy = ctx.createLinearGradient(0, 0, 0, 160);
        northCanopy.addColorStop(0, 'rgba(6, 10, 8, 0.94)');
        northCanopy.addColorStop(0.6, 'rgba(10, 16, 12, 0.55)');
        northCanopy.addColorStop(1, 'rgba(10, 16, 12, 0)');
        ctx.fillStyle = northCanopy;
        ctx.fillRect(0, 0, W, 160);

        const westCanopy = ctx.createLinearGradient(0, 0, 120, 0);
        westCanopy.addColorStop(0, 'rgba(6, 10, 8, 0.88)');
        westCanopy.addColorStop(1, 'rgba(6, 10, 8, 0)');
        ctx.fillStyle = westCanopy;
        ctx.fillRect(0, 0, 120, H);

        const eastCanopy = ctx.createLinearGradient(W - 120, 0, W, 0);
        eastCanopy.addColorStop(0, 'rgba(6, 10, 8, 0)');
        eastCanopy.addColorStop(1, 'rgba(6, 10, 8, 0.88)');
        ctx.fillStyle = eastCanopy;
        ctx.fillRect(W - 120, 0, 120, H);

        // Mảng thảm rêu ẩm ướt và đốm lá kim mục nát
        const deepForestPalette = ['#0c140f', '#142118', '#1a2b1f', '#223627', '#2b1e15'];
        for (let i = 0; i < 2200; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const sz = 2 + Math.floor(nextRand() * 5);
          ctx.fillStyle = deepForestPalette[Math.floor(nextRand() * deepForestPalette.length)];
          ctx.globalAlpha = 0.45 + nextRand() * 0.4;
          ctx.fillRect(lx, ly, sz, sz);
        }

        // Mảng rêu phát quang lam lục quanh Khoảng Rừng Nấm (wx ~ 1780, wy ~ -220 -> lx ~ 180, ly ~ 420)
        ctx.save();
        for (let i = 0; i < 300; i++) {
          const angle = nextRand() * Math.PI * 2;
          const r = nextRand() * 65;
          const lx = 180 + Math.cos(angle) * r;
          const ly = 420 + Math.sin(angle) * r;
          ctx.fillStyle = nextRand() > 0.4 ? '#164336' : '#1f604e';
          ctx.globalAlpha = 0.35 + nextRand() * 0.35;
          ctx.fillRect(Math.round(lx), Math.round(ly), 2 + Math.floor(nextRand() * 3), 2 + Math.floor(nextRand() * 3));
        }
        ctx.restore();

        // 2. CÁC KHOẢNG ĐẤT RỪNG THƯA (CLEARINGS)
        const drawClearing = (wx: number, wy: number, rx: number, ry: number, isBioluminescent: boolean = false) => {
          const cx = toLX(wx);
          const cy = toLY(wy);
          ctx.save();
          const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, rx);
          if (isBioluminescent) {
            g.addColorStop(0, '#1d3e33');
            g.addColorStop(0.55, '#162e26');
            g.addColorStop(0.85, '#11221c');
            g.addColorStop(1, 'rgba(16, 24, 19, 0)');
          } else {
            g.addColorStop(0, '#38281a');
            g.addColorStop(0.5, '#2a1e14');
            g.addColorStop(0.8, '#1e1610');
            g.addColorStop(1, 'rgba(16, 24, 19, 0)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        // 2.1. Bãi cửa rừng phía Nam (nối với Crooked Path)
        drawClearing(2080, -60, 48, 32);
        // 2.2. Khoảng Rừng Nấm Phát Quang phía Tây
        drawClearing(1780, -220, 60, 44, true);
        // 2.3. Khoảng Rừng Cây Cổ Thụ Đổ Trung Tâm
        drawClearing(2140, -320, 68, 48);
        // 2.4. Khoảng Đá Ổ Kẻ Lắng Nghe phía Bắc
        drawClearing(2380, -480, 56, 40);
        // 2.5. Bãi ngưỡng cửa Đầm Lầy phía Đông
        drawClearing(2720, -280, 52, 36);

        // 3. MẠNG LƯỚI ĐƯỜNG MÒN ĐẤT NÉN TỰ NHIÊN RỪNG SÂU (Hài hòa hữu cơ, không tạo vệt hình ống giả cành cây)
        const drawTrail = (points: { x: number; y: number; r: number }[]) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let p = 0; p < points.length - 1; p++) {
            const p0 = points[p];
            const p1 = points[p + 1];
            const dx = p1.x - p0.x;
            const dy = p1.y - p0.y;
            const dist = Math.hypot(dx, dy);
            const steps = Math.max(1, Math.ceil(dist / 2));

            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + dx * t;
              const wy = p0.y + dy * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.04 + wy * 0.05) * 1.8;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp 1: Viền thảm cỏ rêu dập & đất ẩm ven lối mòn
          ctx.save();
          ctx.fillStyle = '#152219';
          ctx.globalAlpha = 0.50;
          for (const sp of samples) {
            const rOut = sp.r + 4;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.78), rOut * 2, Math.round(rOut * 1.56));
          }

          // Lớp 2: Lòng đường đất mùn rừng sẫm màu
          ctx.fillStyle = '#221a14';
          ctx.globalAlpha = 0.78;
          for (const sp of samples) {
            const rMid = sp.r + 2;
            ctx.fillRect(sp.lx - rMid, sp.ly - Math.round(rMid * 0.75), rMid * 2, Math.round(rMid * 1.50));
          }

          // Lớp 3: Vệt đất nén tự nhiên của lối mòn
          ctx.fillStyle = '#2e2218';
          ctx.globalAlpha = 0.85;
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.72), sp.r * 2, Math.round(sp.r * 1.44));
          }

          // Lớp 4: Tim đường mòn nhẹ nhàng
          ctx.fillStyle = '#3a2c1f';
          ctx.globalAlpha = 0.65;
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(3, Math.round(sp.r * 0.48));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.68), rIn * 2, Math.round(rIn * 1.36));
          }

          // Lớp 5: Đốm mùn lá kim và sỏi đen rừng sâu tự nhiên
          for (let i = 0; i < samples.length; i += 3) {
            const sp = samples[i];
            for (let k = 0; k < 2; k++) {
              const ang = nextRand() * Math.PI * 2;
              const rad = nextRand() * (sp.r + 2);
              const px = Math.round(sp.lx + Math.cos(ang) * rad);
              const py = Math.round(sp.ly + Math.sin(ang) * rad * 0.7);
              ctx.fillStyle = nextRand() > 0.4 ? '#18261d' : '#453526';
              ctx.globalAlpha = 0.60;
              ctx.fillRect(px, py, 2, 2);
            }
          }
          ctx.restore();
        };

        // Tuyến chính từ Lối Nam (2080, 0) nối lên Trung Tâm (2140, -320)
        drawTrail([
          { x: 2080, y: 0, r: 12 },     // Khớp tuyệt đối với Cổng Bắc Đường Mòn Quanh Co
          { x: 2075, y: -80, r: 12 },
          { x: 2085, y: -160, r: 13 },
          { x: 2110, y: -240, r: 13 },
          { x: 2140, y: -320, r: 14 }   // Khoảng Rừng Cây Cổ Thụ Đổ Trung Tâm
        ]);

        // Nhánh rẽ sang Khoảng Rừng Nấm Phát Quang phía Tây
        drawTrail([
          { x: 2085, y: -160, r: 12 },
          { x: 2010, y: -180, r: 11 },
          { x: 1910, y: -195, r: 12 },
          { x: 1840, y: -210, r: 12 },
          { x: 1780, y: -220, r: 13 }
        ]);

        // Nhánh rẽ từ Trung Tâm uốn lên Ổ Kẻ Lắng Nghe phía Bắc
        drawTrail([
          { x: 2140, y: -320, r: 13 },
          { x: 2210, y: -380, r: 12 },
          { x: 2280, y: -430, r: 11 },
          { x: 2340, y: -465, r: 10 },
          { x: 2380, y: -480, r: 10 }
        ]);

        // Nhánh rẽ từ Trung Tâm sang Ngưỡng Cửa Đầm Lầy phía Đông
        drawTrail([
          { x: 2140, y: -320, r: 13 },
          { x: 2280, y: -310, r: 12 },
          { x: 2420, y: -300, r: 12 },
          { x: 2560, y: -290, r: 11 },
          { x: 2700, y: -280, r: 11 },
          { x: 2840, y: -260, r: 11 }   // Hướng tới Cổng ranh giới Đầm Lầy Silent Mire
        ]);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-12: Dựng bề mặt địa hình đầm lầy, vũng bùn nước đen kịt, lối đi gờ đất nổi và cầu ván gỗ mục
   * cho Đầm Lầy Tĩnh Lặng (Silent Mire) trên 1 CanvasTexture duy nhất (silent_mire_ground_baked_v12).
   * Khớp nối chuẩn xác 100% với Đường Mòn Quanh Co tại (2880, 300) và Miếu Chuông tại (4000, 280).
   */
  private renderSilentMireTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'silent_mire_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 1120
      const H = bounds.height; // 640
      const ox = bounds.x;     // 2880
      const oy = bounds.y;     // 100

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 543219;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. NỀN BÙN ĐẦM LẦY & VŨNG NƯỚC ĐEN KỊT HUYỀN BÍ
        ctx.fillStyle = '#1c2822';
        ctx.fillRect(0, 0, W, H);

        const swampImg = this.scene.textures.get(TILE_SWAMP_MUD).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (swampImg && swampImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.28;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(swampImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Vùng nước trũng sẫm màu đầm lầy
        const swampGrad = ctx.createRadialGradient(toLX(3400), toLY(300), 80, toLX(3400), toLY(300), 520);
        swampGrad.addColorStop(0, 'rgba(26, 44, 34, 0.45)');
        swampGrad.addColorStop(0.6, 'rgba(18, 30, 24, 0.65)');
        swampGrad.addColorStop(1, 'rgba(10, 18, 14, 0.90)');
        ctx.fillStyle = swampGrad;
        ctx.fillRect(0, 0, W, H);

        // Thảm rêu nước, bèo tây và bùn lầy rải rác
        const mirePalette = ['#15241b', '#1f3427', '#2a4435', '#334f3e', '#232b21'];
        for (let i = 0; i < 1600; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 4 + Math.floor(nextRand() * 10);
          const ph = 3 + Math.floor(nextRand() * 6);
          ctx.fillStyle = mirePalette[Math.floor(nextRand() * mirePalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // C4-13-20: Hòa sắc chuyển tiếp tự nhiên rộng 200px (2880..3080) từ Đường Mòn Quanh Co sang Đầm Lầy Tĩnh Lặng
        const westForestTransition = ctx.createLinearGradient(0, 0, toLX(3080), 0);
        westForestTransition.addColorStop(0, 'rgba(28, 40, 34, 0.98)');
        westForestTransition.addColorStop(0.3, 'rgba(28, 40, 34, 0.70)');
        westForestTransition.addColorStop(0.7, 'rgba(28, 40, 34, 0.35)');
        westForestTransition.addColorStop(1, 'rgba(28, 40, 34, 0)');
        ctx.fillStyle = westForestTransition;
        ctx.fillRect(0, 0, toLX(3080), H);

        // 2. VẼ BỜ ĐẤT NỔI & CẦU VÁN GỖ MỤC (BOARDWALK)
        const drawMireTrail = (points: Array<{ x: number; y: number; r: number }>, isBoardwalk: boolean = false) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.05 + wy * 0.04) * 2.0;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Lớp bờ bùn sẫm
          ctx.fillStyle = '#222d25';
          for (const sp of samples) {
            const rOut = sp.r + 5;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.8), rOut * 2, Math.round(rOut * 1.6));
          }

          // Lòng gờ đất nâu rêu nổi trên bùn
          ctx.fillStyle = '#413a2c';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.78), sp.r * 2, Math.round(sp.r * 1.56));
          }

          // Vệt đất nổi nén chặt
          ctx.fillStyle = '#564d3b';
          for (let i = 0; i < samples.length; i += 2) {
            const sp = samples[i];
            const rIn = Math.max(4, Math.round(sp.r * 0.5));
            ctx.fillRect(sp.lx - rIn, sp.ly - Math.round(rIn * 0.75), rIn * 2, Math.round(rIn * 1.5));
          }

          // Nếu là đoạn cầu ván gỗ (Wooden Boardwalk) bắc qua vũng sương lầy
          if (isBoardwalk) {
            for (let i = 4; i < samples.length - 4; i += 8) {
              const sp = samples[i];
              // C4-13-20: Chỉ bắt đầu lát ván gỗ khi đã đi vào sâu trong đầm lầy (sp.lx >= toLX(2940)),
              // để đoạn tiếp giáp (2880..2940) là gờ đất nén nâu rêu liền mạch 100% với Crooked Path
              if (sp.lx < toLX(2940)) continue;
              const bw = sp.r * 2 + 2;
              ctx.fillStyle = '#2c271f'; // Bóng thanh gỗ
              ctx.fillRect(sp.lx - Math.round(bw / 2), sp.ly - 2, bw, 6);
              ctx.fillStyle = '#4a4133'; // Ván gỗ mục
              ctx.fillRect(sp.lx - Math.round(bw / 2) + 1, sp.ly - 3, bw - 2, 5);
              ctx.fillStyle = '#635845'; // Vân sáng ván
              ctx.fillRect(sp.lx - Math.round(bw / 2) + 2, sp.ly - 3, bw - 4, 2);
            }
          }
        };

        // 3. TRẬN ĐỊA ĐÁ CỔ NGỮ (ANCIENT RUNE GROVE DAIS)
        // Khu vực gò đất đá cổ linh thiêng nổi giữa đầm lầy tại (3340..3700, 180..380)
        const daisCX = toLX(3520);
        const daisCY = toLY(290);
        ctx.fillStyle = '#28362b';
        ctx.beginPath();
        ctx.ellipse(daisCX, daisCY, 195, 115, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3c4c3e';
        ctx.beginPath();
        ctx.ellipse(daisCX, daisCY, 180, 100, 0, 0, Math.PI * 2);
        ctx.fill();

        // Các phiến đá lát cổ hình tròn / elip kết nối 3 cột đá
        for (let a = 0; a < Math.PI * 2; a += 0.28) {
          const rRing = 135;
          const px = daisCX + Math.cos(a) * rRing;
          const py = daisCY + Math.sin(a) * (rRing * 0.55);
          ctx.fillStyle = '#4d555c';
          ctx.fillRect(px - 6, py - 4, 12, 8);
          ctx.fillStyle = '#656e75';
          ctx.fillRect(px - 5, py - 3, 10, 6);
        }

        // Bệ đá quanh từng Cột Đá Cổ Ngữ
        const drawPillarBase = (wx: number, wy: number) => {
          const px = toLX(wx);
          const py = toLY(wy);
          ctx.fillStyle = '#363d42';
          ctx.fillRect(px - 22, py - 14, 44, 28);
          ctx.fillStyle = '#545d63';
          ctx.fillRect(px - 18, py - 11, 36, 22);
          ctx.fillStyle = '#6d777e';
          ctx.fillRect(px - 14, py - 8, 28, 16);
        };
        drawPillarBase(3400, 220); // Cột Trăng Khuyết
        drawPillarBase(3520, 360); // Cột Rễ Rừng
        drawPillarBase(3640, 220); // Cột Con Mắt

        // 4. MẠNG LƯỚI ĐƯỜNG MÒN ĐẦM LẦY KẾT NỐI
        // 4.1. Lối vào phía Tây từ Crooked Path qua vũng nước tới gò đá cổ
        drawMireTrail([
          { x: 2880, y: 300, r: 20 }, // Khớp 100% Crooked Path!
          { x: 2990, y: 310, r: 19 },
          { x: 3110, y: 325, r: 19 }, // Đoạn cầu ván gỗ qua vũng nước
          { x: 3240, y: 295, r: 21 },
          { x: 3350, y: 260, r: 22 }  // Chạm vào bệ đá Trận Địa Cổ Ngữ
        ], true);

        // 4.2. Lối đi nội bộ giữa 3 cột đá trong gò đá cổ
        drawMireTrail([
          { x: 3350, y: 260, r: 18 },
          { x: 3400, y: 225, r: 18 },
          { x: 3520, y: 270, r: 20 },
          { x: 3520, y: 350, r: 18 }
        ], false);
        drawMireTrail([
          { x: 3520, y: 270, r: 20 },
          { x: 3640, y: 225, r: 18 },
          { x: 3680, y: 275, r: 20 }
        ], false);

        // 4.3. Tuyến đường phía Đông từ Trận Địa Cổ Ngữ sang cổng Miếu Chuông
        drawMireTrail([
          { x: 3680, y: 275, r: 20 },
          { x: 3790, y: 305, r: 19 }, // Đoạn ván gỗ thứ hai
          { x: 3900, y: 295, r: 20 },
          { x: 4000, y: 280, r: 20 }  // Khớp 100% cổng Miếu Chuông!
        ], true);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  /**
   * C4-12-24: Dựng bề mặt địa hình Khu Vực Câu Đố Cổ Ngữ (Ancient Rune Puzzle Area)
   * trên 1 CanvasTexture riêng biệt (ancient_rune_puzzle_ground_baked_v12) tại độ sâu depth = -97.
   * Thiết kế một khoảng sân đá cổ kính, các phiến đá lát cổ, vòng tròn nghi thức kết nối 3 cột đá
   * và bệ thờ trung tâm với độ sắc nét pixel-art cao.
   */
  private renderAncientRunePuzzleTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'ancient_rune_puzzle_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 350
      const H = bounds.height; // 280
      const ox = bounds.x;     // 3350
      const oy = bounds.y;     // 150

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        ctx.clearRect(0, 0, W, H);

        const cx = toLX(3520);
        const cy = toLY(280);

        // 1. Khoảng sân đá cổ hình elip lớn (Ancient Stone Courtyard)
        ctx.fillStyle = '#1e2824';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 155, 115, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2b3632';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 145, 105, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3a4742';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 135, 95, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Viền đá phiến cổ bo quanh sân (Outer stone flagstones border)
        for (let a = 0; a < Math.PI * 2; a += 0.18) {
          const rx = 138;
          const ry = 98;
          const px = cx + Math.cos(a) * rx;
          const py = cy + Math.sin(a) * ry;
          ctx.fillStyle = '#26302c';
          ctx.fillRect(px - 5, py - 4, 10, 8);
          ctx.fillStyle = '#485550';
          ctx.fillRect(px - 4, py - 3, 8, 6);
          ctx.fillStyle = '#5c6b65';
          ctx.fillRect(px - 3, py - 2, 6, 4);
        }

        // 3. Vòng tròn nghi thức phù văn cổ (Ritual Arcane Rune Inlay)
        ctx.strokeStyle = '#324a42';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 110, 75, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#4b6e62';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 108, 73, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Các đường dẫn năng lượng cổ từ tâm (3520, 280) nối tới 3 vị trí Cột Đá
        const drawEnergyChannel = (tx: number, ty: number) => {
          const tlx = toLX(tx);
          const tly = toLY(ty);
          ctx.strokeStyle = '#2b3f37';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(tlx, tly);
          ctx.stroke();

          ctx.strokeStyle = '#445f54';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(tlx, tly);
          ctx.stroke();

          ctx.strokeStyle = '#688e80';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(tlx, tly);
          ctx.stroke();
        };

        drawEnergyChannel(3400, 220); // Dẫn tới Cột Trăng
        drawEnergyChannel(3520, 360); // Dẫn tới Cột Rễ
        drawEnergyChannel(3640, 220); // Dẫn tới Cột Mắt

        // 4. Các phiến đá lát sân đan xen (Interlocking Flagstones)
        const stonePalette = ['#3e4c46', '#475650', '#50615a', '#34413b'];
        for (let row = -5; row <= 5; row++) {
          for (let col = -7; col <= 7; col++) {
            const sx = cx + col * 18 + (row % 2) * 9;
            const sy = cy + row * 15;
            const distNorm = Math.hypot((sx - cx) / 125, (sy - cy) / 85);
            if (distNorm < 0.92) {
              const pIdx = Math.abs((row * 7 + col * 13) % stonePalette.length);
              ctx.fillStyle = stonePalette[pIdx];
              ctx.fillRect(sx - 7, sy - 5, 14, 10);
              ctx.fillStyle = '#2a3530';
              ctx.strokeRect(sx - 7.5, sy - 5.5, 15, 11);
              if ((row + col) % 3 === 0) {
                ctx.fillStyle = '#22382e';
                ctx.fillRect(sx - 3, sy - 2, 4, 3);
              }
            }
          }
        }

        // 5. Bệ đá móng nâng cao cho 3 Cột Đá Cổ Ngữ
        const drawPillarPedestal = (wx: number, wy: number) => {
          const px = toLX(wx);
          const py = toLY(wy);
          ctx.fillStyle = '#161e1a';
          ctx.beginPath();
          ctx.ellipse(px, py + 6, 26, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#2d3834';
          ctx.fillRect(px - 22, py - 12, 44, 24);
          ctx.fillStyle = '#44524c';
          ctx.fillRect(px - 18, py - 9, 36, 18);
          ctx.fillStyle = '#596b63';
          ctx.fillRect(px - 14, py - 6, 28, 12);
          ctx.fillStyle = '#6f8379';
          ctx.strokeRect(px - 18, py - 9, 36, 18);
        };

        drawPillarPedestal(3400, 220); // Bệ Trăng Khuyết
        drawPillarPedestal(3520, 360); // Bệ Rễ Rừng
        drawPillarPedestal(3640, 220); // Bệ Con Mắt

        // 6. Nền móng Bệ Thờ Trung Tâm (Central Altar Foundation)
        ctx.fillStyle = '#1b2420';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, 38, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#32403a';
        ctx.fillRect(cx - 32, cy - 12, 64, 24);
        ctx.fillStyle = '#4b5e56';
        ctx.fillRect(cx - 28, cy - 9, 56, 18);
        ctx.fillStyle = '#657d73';
        ctx.fillRect(cx - 24, cy - 6, 48, 12);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-97);
  }

  /**
   * C4-12-12: Dựng bề mặt địa hình sân đá cuội cổ, sàn đá slate và lối đá tiếp cận miếu
   * cho Miếu Chuông Phế Tích (The Broken Bell Shrine) trên 1 CanvasTexture duy nhất (broken_bell_shrine_ground_baked_v12).
   * Khớp nối chuẩn xác 100% với Đầm Lầy Tĩnh Lặng tại (4000, 280).
   */
  private renderBrokenBellShrineTerrain(bounds: { x: number; y: number; width: number; height: number }): void {
    const texKey = 'broken_bell_shrine_ground_baked_v12';
    if (!this.scene.textures.exists(texKey)) {
      const W = bounds.width;  // 960
      const H = bounds.height; // 600
      const ox = bounds.x;     // 4000
      const oy = bounds.y;     // 0

      const canvasTex = this.scene.textures.createCanvas(texKey, W, H);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        ctx.imageSmoothingEnabled = false;

        let seed = 432198;
        const nextRand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };

        const toLX = (wx: number) => Math.round(wx - ox);
        const toLY = (wy: number) => Math.round(wy - oy);

        // 1. NỀN RỪNG XÁM LẠNH RÊU PHONG QUANH MIẾU ĐỔ
        ctx.fillStyle = '#22232b';
        ctx.fillRect(0, 0, W, H);

        const grassImg = this.scene.textures.get(TILE_FOREST_GRASS).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (grassImg && grassImg.width > 0) {
          ctx.save();
          ctx.globalAlpha = 0.20;
          for (let gy = 0; gy < H; gy += 32) {
            for (let gx = 0; gx < W; gx += 32) {
              ctx.drawImage(grassImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // Quầng sáng mờ ảo uy nghiêm tỏa ra từ bàn thờ miếu
        const altarAura = ctx.createRadialGradient(toLX(4500), toLY(250), 40, toLX(4500), toLY(250), 420);
        altarAura.addColorStop(0, 'rgba(68, 72, 88, 0.45)');
        altarAura.addColorStop(0.5, 'rgba(42, 45, 56, 0.35)');
        altarAura.addColorStop(1, 'rgba(18, 19, 24, 0.85)');
        ctx.fillStyle = altarAura;
        ctx.fillRect(0, 0, W, H);

        // Rêu xám lạnh và bụi đá vôi rải rác
        const stonePalette = ['#20222a', '#2c2f3b', '#393d4a', '#474b5a', '#303a35'];
        for (let i = 0; i < 1400; i++) {
          const lx = Math.floor(nextRand() * W);
          const ly = Math.floor(nextRand() * H);
          const pw = 3 + Math.floor(nextRand() * 9);
          const ph = 3 + Math.floor(nextRand() * 5);
          ctx.fillStyle = stonePalette[Math.floor(nextRand() * stonePalette.length)];
          ctx.fillRect(lx, ly, pw, ph);
        }

        // 2. LỐI ĐÁ CỔ DẪN TỪ ĐẦM LẦY VÀO SÂN MIẾU
        const drawShrineApproach = (points: Array<{ x: number; y: number; r: number }>) => {
          const samples: Array<{ lx: number; ly: number; r: number }> = [];
          for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            const steps = Math.max(1, Math.ceil(dist / 2));
            for (let s = 0; s <= steps; s++) {
              const t = s / steps;
              const wx = p0.x + (p1.x - p0.x) * t;
              const wy = p0.y + (p1.y - p0.y) * t;
              const wr = p0.r + (p1.r - p0.r) * t;
              const wobble = Math.sin(wx * 0.04 + wy * 0.05) * 2.0;
              samples.push({
                lx: toLX(wx),
                ly: toLY(wy + wobble),
                r: Math.round(wr)
              });
            }
          }

          // Viền chuyển tiếp đất cỏ rêu
          ctx.fillStyle = '#2f343a';
          for (const sp of samples) {
            const rOut = sp.r + 5;
            ctx.fillRect(sp.lx - rOut, sp.ly - Math.round(rOut * 0.8), rOut * 2, Math.round(rOut * 1.6));
          }

          // Nền đá cổ
          ctx.fillStyle = '#464c54';
          for (const sp of samples) {
            ctx.fillRect(sp.lx - sp.r, sp.ly - Math.round(sp.r * 0.78), sp.r * 2, Math.round(sp.r * 1.56));
          }

          // Đá lát phiến rải rác trên lối vào
          for (let i = 4; i < samples.length - 4; i += 7) {
            const sp = samples[i];
            ctx.fillStyle = '#5c646e';
            ctx.fillRect(sp.lx - 8, sp.ly - 5, 16, 10);
            ctx.fillStyle = '#78828e';
            ctx.fillRect(sp.lx - 6, sp.ly - 4, 12, 8);
          }
        };

        // 3. SÂN ĐÁ CUỘI CỔ / GẠCH ĐÁ MIẾU CHUÔNG (GRAND CEREMONIAL COURTYARD)
        const courtyardCX = toLX(4500);
        const courtyardCY = toLY(260);
        const crx = 240;
        const cry = 130;

        // Viền rêu đất ẩm quanh sân miếu
        ctx.fillStyle = '#2b3137';
        ctx.beginPath();
        ctx.ellipse(courtyardCX, courtyardCY, crx + 10, cry + 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nền đá slate xám xanh cổ kính
        ctx.fillStyle = '#3c434b';
        ctx.beginPath();
        ctx.ellipse(courtyardCX, courtyardCY, crx + 4, cry + 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mặt sàn lát đá cuội và phiến đá cổ
        const stoneTileImg = this.scene.textures.get(TILE_STONE_FLOOR).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
        if (stoneTileImg && stoneTileImg.width > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(courtyardCX, courtyardCY, crx, cry, 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = 0.45;
          for (let gy = courtyardCY - cry; gy < courtyardCY + cry; gy += 32) {
            for (let gx = courtyardCX - crx; gx < courtyardCX + crx; gx += 32) {
              ctx.drawImage(stoneTileImg, gx, gy, 32, 32);
            }
          }
          ctx.restore();
        }

        // C4-13-19: Xóa bỏ khối chữ nhật màu xám vẽ lót bị lệch, giữ mặt sàn đá cuội phế tích liền mạch và đồng bộ
        // Bậc đá dẫn lên 2 cột đá miếu và bệ thờ ẩn nấp
        const drawStep = (wx: number, wy: number, w: number, h: number) => {
          const px = toLX(wx);
          const py = toLY(wy);
          ctx.fillStyle = '#444c54';
          ctx.fillRect(px - Math.round(w / 2), py - Math.round(h / 2), w, h);
          ctx.fillStyle = '#65707c';
          ctx.fillRect(px - Math.round(w / 2) + 2, py - Math.round(h / 2) + 2, w - 4, h - 4);
        };
        drawStep(4350, 180, 48, 24); // Chân cột miếu trái
        drawStep(4650, 180, 48, 24); // Chân cột miếu phải
        drawStep(4360, 380, 52, 28); // Khu gạch đá ẩn nấp

        // 4. KẾT NỐI LỐI TIẾP CẬN TỪ RANH GIỚI ĐẦM LẦY
        drawShrineApproach([
          { x: 4000, y: 280, r: 20 }, // Khớp 100% ranh giới Silent Mire!
          { x: 4090, y: 275, r: 20 },
          { x: 4190, y: 268, r: 22 },
          { x: 4280, y: 262, r: 24 }  // Hòa vào sân đá cổ miếu chuông!
        ]);

        canvasTex.refresh();
      }
    }

    const groundImg = this.scene.add.image(bounds.x, bounds.y, texKey);
    groundImg.setOrigin(0, 0);
    groundImg.setDepth(-98);
  }

  private renderDecorations(zone: ZoneData): void {
    const { id, bounds } = zone;

    if (id === 'fog_crossing') {
      // C4-13-16: Dựng cụm cảnh quan chặn đầu đường phía Tây (x: 0..90)
      this.createWestBarrierLandscape();

      // Vẽ cổng sương mù và bia đá dẫn lối
      this.createTree(160, 100, 'Cây Khô Sương Mù');
      this.createTree(300, 240, 'Cây Khô Sương Mù');
      this.createStoneSign(240, 180, 'TẤM BIỂN MỤC');
    } else if (id === 'bellhollow') {
      // =========================================================================
      // C4-12-18A (Mục 2B, 3 & 4): BỐ TRÍ NHÀ CỬA, CÔNG TRÌNH KIẾN TRÚC & PROP LÀNG BELLHOLLOW
      // Đảm bảo khoảng trống thông thoáng cho 3 NPC: Garth (530,220), Edda (790,330), Neris (970,130)
      // và giữ toàn bộ 7 mỏ tài nguyên + Bàn Chế Tạo (978,369) + Bệ Tháp Chuông (860,324) dễ tiếp cận.
      // =========================================================================

      // 1. Nhà của Edda (Tây-Bắc Quảng Trường: x=648, y=50, chân tường kết thúc ở y=98)
      this.createBuilding(648, 50, 112, 48, 0x5a3d28, 0x8a6338, 'Nhà Edda – Người Giữ Chuông');
      this.createChimneySmoke(732, 34);
      this.createVillagePropCluster(630, 94, 'firewood');
      this.createVillagePropCluster(770, 96, 'barrels');
      this.createVillageLanternPost(638, 134);

      // 2. Nhà Thảo Mộc của Neris (Đông-Bắc Quảng Trường: x=914, y=44, chân tường kết thúc ở y=92)
      // NPC Neris đứng tại (970, 130) trên sân đá hiên nhà, cách chân tường 38px hoàn toàn thông thoáng!
      this.createBuilding(914, 44, 112, 48, 0x4a4335, 0x6e7845, 'Nhà Neris – Thảo Mộc');
      this.createChimneySmoke(940, 28);
      this.createApothecaryTables(892, 110, 1044, 110);
      this.createVillageLanternPost(902, 146);

      // 3. Tháp Chuông Làng Bellhollow (Bắc-Trung Tâm Quảng Trường: x=820, y=252, chân tháp ở y=310)
      // Bà Lão Edda đứng tại (790, 330) (depth 330 > 310), hoàn toàn tách biệt không bị đè hình hay kẹt tên!
      this.createBellTower(820, 252, 80, 58);
      this.createVillageLanternPost(756, 286);

      // 4. Giếng Nước Làng Có Mái Che tại Quảng Trường Trung Tâm (726, 376)
      this.createVillageWell(726, 376);

      // 5. Xưởng Chế Tạo & Lò Rèn Có Mái Che (Đông-Nam Quảng Trường: 960, 360; tương tác tại 978, 369)
      this.createCraftingWorkshopPavilion(936, 318);
      this.createCraftingBench(960, 360);
      this.createVillageLanternPost(922, 372);

      // 6. Trạm Gác Cổng Tây (Phía Bắc vị trí Garth 530, 220; chân trạm gác kết thúc ở y=184)
      this.createWestWatchpost(504, 136);
      this.createStoneSign(580, 194, 'LÀNG BELLHOLLOW');
      this.createVillageLanternPost(496, 202);

      // 7. Nhà Dân Làng Tây-Nam (x=516, y=376, cân đối bố cục Tây-Nam như ảnh concept, cách xa mỏ đá lửa 620,350)
      this.createSouthWestCottage(516, 376);
      this.createVillagePropCluster(632, 418, 'barrels');

      // 8. Khu Vườn Thảo Dược & Nhà Kho Đông-Nam (x=1030, y=420, phía Nam mỏ gỗ 1120,380)
      this.createSanctuaryHerbGarden(1030, 420);

      // 9. Hệ thống Hàng Rào Gỗ Trung Cổ bao quanh làng và phân khu (chừa lối đi rộng rãi)
      this.createVillageFence(bounds);

      // 10. C4-12-18A (Mục 2E): Cổng Rừng Phía Đông (Outer Woods Entrance: "Rừng Ngoại Vi →")
      // Dẫn thẳng tới điểm chuyển vùng thực tế to_crooked_path (x=1580, y=200..360)
      this.createEastForestEntrance(1485, 280);

      // 11. C4-12-18A (Mục 2C): Quần thể cây cổ thụ đa kích thước, bụi rậm, cành khô & thảm thực vật tự nhiên
      this.createBellhollowVegetation();

      // 12. C4-12-18A (Mục 2F): Sương mù khí quyển đa tầng ven bìa rừng & dày đặc dần về phía Cổng Đông
      this.createBellhollowBoundaryFog();
    } else if (id === 'sanctuary_farm') {
      this.renderSanctuaryFarmDecorations(zone);
    } else if (id === 'outer_woods') {
      this.renderOuterWoodsDecorations(zone);
    } else if (id === 'crooked_path') {
      this.renderCrookedPathDecorations(zone);
    } else if (id === 'deep_forest') {
      this.renderDeepForestDecorations(zone);
    } else if (id === 'silent_mire') {
      this.renderSilentMireDecorations(zone);
    } else if (id === 'ancient_rune_puzzle') {
      this.renderAncientRunePuzzleDecorations(zone);
    } else if (id === 'broken_bell_shrine') {
      this.renderBrokenBellShrineDecorations(zone);
    }
  }

  // --- CÁC HÀM TẠO ĐỐI TƯỢNG ĐỒ HỌA & VA CHẠM THỰC THẾ (SPRITES PIXEL ART THẬT - PASS T08) ---

  /**
   * C4-13-16: Dựng cụm cảnh quan kể chuyện chặn lối quay lại ở rìa phía Tây đầu màn chơi (x: 0..90).
   * Gồm:
   * 1. Thân cây cổ thụ đổ chắn ngang đường (Fallen Ancient Tree Trunk) với rễ xoắn, rêu phong và nấm rừng.
   * 2. Hàng rào gỗ gãy nát (Broken Wooden Fence) với các cọc gỗ xiêu vẹo, thanh ngang gãy vỡ.
   * 3. Bụi rậm rậm rạp (Dense bushes) và dây leo ken chặt quanh thân cây.
   * 4. Lớp sương mù dày đặc đa tầng cuộn trào che phủ hoàn toàn mép đen của bản đồ.
   * 5. Hộp va chạm vật lý chặn tuyệt đối nhân vật đi ngược vào hư vô.
   */
  private createWestBarrierLandscape(): void {
    const barrierX = 48;
    const roadCenterY = 184;

    // 1. Hai cây cổ thụ khô/già ở hai mấu rìa Bắc - Nam kẹp lấy lối mòn
    this.createHollowTree(32, 135, 'Cây Khô Rìa Tây Bắc');
    this.createHollowTree(28, 235, 'Cây Khô Rìa Tây Nam');

    // 2. Thân cây cổ thụ đổ chắn ngang đường (y: 138..232)
    const trunkGfx = this.scene.add.graphics();
    trunkGfx.save();
    trunkGfx.translateCanvas(barrierX, roadCenterY);

    // Bóng đổ sâu thẳm dưới thân cây
    trunkGfx.fillStyle(0x0a0e0c, 0.65);
    trunkGfx.fillEllipse(-4, 0, 36, 102);

    // Rễ cây xoắn xít vươn về hướng Tây (x < barrierX)
    trunkGfx.fillStyle(0x28180d, 1);
    trunkGfx.fillRect(-24, -30, 16, 8);
    trunkGfx.fillRect(-28, -6, 20, 10);
    trunkGfx.fillRect(-22, 22, 14, 8);
    trunkGfx.fillRect(-18, 38, 12, 7);

    // Lõi và vỏ thân cây đại thụ đổ ngang
    trunkGfx.fillStyle(0x2d1a0e, 1);
    trunkGfx.fillRoundedRect(-12, -48, 22, 96, 5);

    // Thớ gỗ sẫm màu bên trong
    trunkGfx.fillStyle(0x3e2615, 1);
    trunkGfx.fillRoundedRect(-9, -45, 16, 90, 4);

    // Các vết nứt toác, thớ gỗ mục gãy
    trunkGfx.fillStyle(0x1a0f08, 1);
    trunkGfx.fillRect(-6, -35, 4, 18);
    trunkGfx.fillRect(-3, 5, 5, 22);
    trunkGfx.fillRect(-7, 28, 4, 12);

    // Điểm nhấn vỏ cây sáng nhẹ phản chiếu ánh sương
    trunkGfx.fillStyle(0x523924, 0.85);
    trunkGfx.fillRect(3, -42, 3, 30);
    trunkGfx.fillRect(4, 8, 3, 32);

    // Mảng rêu nhung xanh sẫm bám dọc sống thân cây
    trunkGfx.fillStyle(0x2e6b30, 0.95);
    trunkGfx.fillRoundedRect(-8, -42, 7, 36, 2);
    trunkGfx.fillRoundedRect(-7, 10, 8, 32, 2);

    trunkGfx.fillStyle(0x438a45, 0.9);
    trunkGfx.fillRect(-6, -38, 4, 26);
    trunkGfx.fillRect(-5, 14, 5, 22);

    trunkGfx.fillStyle(0x66bb6a, 0.8);
    trunkGfx.fillRect(-4, -32, 2, 14);
    trunkGfx.fillRect(-3, 20, 2, 12);

    // Cụm nấm sò / nấm mộc nhĩ rừng mọc bên sườn cây
    trunkGfx.fillStyle(0xd35400, 1);
    trunkGfx.fillRect(7, -20, 5, 4);
    trunkGfx.fillRect(8, -12, 6, 4);
    trunkGfx.fillRect(7, 18, 5, 4);
    trunkGfx.fillRect(8, 28, 6, 4);

    trunkGfx.fillStyle(0xf39c12, 1);
    trunkGfx.fillRect(8, -19, 3, 2);
    trunkGfx.fillRect(9, -11, 4, 2);
    trunkGfx.fillRect(8, 19, 3, 2);
    trunkGfx.fillRect(9, 29, 4, 2);

    trunkGfx.restore();
    trunkGfx.setDepth(roadCenterY + 15);
    this.registerCullable(trunkGfx, barrierX, roadCenterY, 70);

    // 3. Hàng rào gỗ gãy nát (Broken Fence)
    const fenceGfx = this.scene.add.graphics();
    fenceGfx.save();
    fenceGfx.translateCanvas(barrierX + 8, roadCenterY);

    // Cọc 1 (phía Bắc: y = -32) - xiêu vẹo nghiêng sang trái
    fenceGfx.fillStyle(0x3a2414, 1);
    fenceGfx.fillRect(0, -38, 6, 22);
    fenceGfx.fillStyle(0x563b25, 1);
    fenceGfx.fillRect(1, -37, 4, 20);
    // Vết gãy nhọn trên đỉnh cọc
    fenceGfx.fillStyle(0x6d4c30, 1);
    fenceGfx.fillRect(2, -40, 2, 3);

    // Cọc 2 (ở giữa: y = 2) - gãy ngang lưng
    fenceGfx.fillStyle(0x3a2414, 1);
    fenceGfx.fillRect(-2, -6, 6, 18);
    fenceGfx.fillStyle(0x563b25, 1);
    fenceGfx.fillRect(-1, -5, 4, 16);

    // Cọc 3 (phía Nam: y = 30) - xiêu vẹo nghiêng sang phải
    fenceGfx.fillStyle(0x3a2414, 1);
    fenceGfx.fillRect(2, 22, 6, 24);
    fenceGfx.fillStyle(0x563b25, 1);
    fenceGfx.fillRect(3, 23, 4, 22);

    // Các thanh xà ngang gãy vỡ, chỏng chơ
    fenceGfx.fillStyle(0x422c1b, 1);
    fenceGfx.fillRect(-6, -26, 16, 4);
    fenceGfx.fillRect(-4, 12, 18, 4);
    // Thanh gãy chéo đâm xuống đất
    fenceGfx.lineStyle(3, 0x4a3220, 1);
    fenceGfx.lineBetween(4, -18, -4, 2);
    fenceGfx.lineBetween(2, 8, 8, 26);

    fenceGfx.restore();
    fenceGfx.setDepth(roadCenterY + 18);
    this.registerCullable(fenceGfx, barrierX + 8, roadCenterY, 60);

    // 4. Bụi rậm rậm rạp và rêu cỏ ken chặt hai bên chân rào chắn
    this.createDenseBush(24, 165);
    this.createDenseBush(56, 148);
    this.createDenseBush(62, 172);
    this.createDenseBush(58, 198);
    this.createDenseBush(42, 224);
    this.createDenseBush(20, 208);

    // 5. Lớp sương mù dày đặc cuộn trào che kín phần mép đen của bản đồ (x: 0..65)
    if (this.scene.textures.exists(SPRITE_FOG_SMOOTH)) {
      const addWestDenseMist = (
        mx: number,
        my: number,
        scaleX: number,
        scaleY: number,
        alpha: number,
        tint: number,
        depth: number,
        driftX: number = 16,
        duration: number = 6400
      ) => {
        const mist = this.scene.add.image(mx, my, SPRITE_FOG_SMOOTH);
        mist.setOrigin(0.5, 0.5);
        mist.setScale(scaleX, scaleY);
        mist.setAlpha(alpha);
        mist.setTint(tint);
        mist.setDepth(depth);
        this.registerCullable(mist, mx, my, 130);

        if (this.scene.tweens && driftX > 0) {
          this.scene.tweens.add({
            targets: mist,
            x: mx + driftX,
            alpha: Math.max(0.2, alpha - 0.12),
            duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      };

      // Tầng sương mù nền (depth -60, che phủ mặt đất và mép ngoài x=0..40)
      addWestDenseMist(20, 130, 1.35, 0.85, 0.75, 0x3d4f47, -60, 12, 6200);
      addWestDenseMist(25, 185, 1.45, 1.05, 0.82, 0x2e3d37, -60, 16, 7000);
      addWestDenseMist(18, 240, 1.30, 0.90, 0.78, 0x3d4f47, -60, 14, 6600);

      // Tầng sương mù nổi cuộn trào phía trước (depth 260, trôi lững lờ trước thân cây và hàng rào)
      addWestDenseMist(42, 170, 1.25, 0.75, 0.65, 0x5a6d65, 260, 18, 5800);
      addWestDenseMist(36, 205, 1.20, 0.80, 0.60, 0x485952, 260, 15, 7400);
    }

    // 6. Vật thể va chạm vật lý chặn nhân vật trong colliderGroup
    const barrierBody = this.colliderGroup.create(barrierX, roadCenterY, undefined) as Phaser.Physics.Arcade.Sprite;
    barrierBody.setVisible(false);
    const b = barrierBody.body as Phaser.Physics.Arcade.Body;
    b.setSize(30, 120);
    b.setOffset(-15, -60);
  }

  /**
   * C4-13-11: Khởi tạo hình ảnh an toàn tuyệt đối chống thiếu Texture Placeholder (magenta/green missing texture)
   */
  private safeAddImage(x: number, y: number, key: string, fallbackKey: string = 'dummy_transparent'): Phaser.GameObjects.Image {
    const validKey = (this.scene.textures && this.scene.textures.exists(key))
      ? key
      : ((this.scene.textures && this.scene.textures.exists(fallbackKey)) ? fallbackKey : key);
    return this.scene.add.image(x, y, validKey);
  }

  private createTree(x: number, y: number, label?: string): void {
    let treeKey = SPRITE_TREE_OAK_1;
    if (label?.includes('Khô')) {
      treeKey = SPRITE_TREE_DEAD;
    } else if (Math.floor(x / 100) % 3 === 1) {
      treeKey = SPRITE_TREE_OAK_2;
    } else if (Math.floor(x / 100) % 3 === 2) {
      treeKey = SPRITE_TREE_OAK_3;
    }

    const tree = this.safeAddImage(x, y, treeKey);
    const scale = treeKey === SPRITE_TREE_DEAD ? 1.05 : 1.0;
    tree.setScale(scale);
    tree.setOrigin(0.5, 0.88);
    tree.setDepth(y);
    this.registerCullable(tree, x, y, 90);
    this.treeCanopyGroup.add(tree);

    // Chuẩn collider gốc cây (20×12 px) để nhân vật có thể đi xuyên dưới tán lá
    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(20, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-10, -6);
  }

  private createHollowTree(x: number, y: number, _label?: string): void {
    const tree = this.safeAddImage(x, y, SPRITE_HOLLOW_TREE);
    tree.setOrigin(0.5, 0.85);
    tree.setDepth(y);
    this.registerCullable(tree, x, y, 70);
    this.treeCanopyGroup.add(tree);

    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(28, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-14, -7);
  }

  private createDenseBush(x: number, y: number): void {
    // C4-132-03: Vùng cấm rải chướng ngại vật ngẫu nhiên (Exclusion Zone bán kính 220px quanh tâm Miếu Chuông Vỡ 4500, 250)
    // đảm bảo tuyệt đối không có bụi cây đè chồng lên giữa Miếu Chuông Vỡ
    if (Math.hypot(x - 4500, y - 250) < 220) {
      return;
    }

    const bushKey = (Math.floor(x) % 2 === 0) ? SPRITE_BUSH_DENSE_1 : SPRITE_BUSH_DENSE_2;
    const bush = this.safeAddImage(x, y, bushKey);
    bush.setOrigin(0.5, 0.85);
    bush.setDepth(y);
    this.registerCullable(bush, x, y, 40);
  }

  private createStoneSign(x: number, y: number, _text?: string): void {
    const sign = this.safeAddImage(x, y, SPRITE_SIGNPOST);
    sign.setOrigin(0.5, 0.90);
    sign.setDepth(y);
    this.registerCullable(sign, x, y, 32);

    // C4-13-17: Hộp va chạm chân biển chỉ đường chuẩn xác chống đi xuyên
    const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(14, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-7, -5);
  }

  private createBuilding(x: number, y: number, w: number, h: number, _wallColor: number, _roofColor: number, name?: string): void {
    const isEdda = name?.includes('Edda');
    const houseKey = isEdda ? SPRITE_HOUSE_EDDA : SPRITE_HOUSE_NERIS;

    // C4-12-30: Chân móng công trình mềm mại với bóng đổ tiếp xúc và viền đất đá rêu phong (depth -95)
    const footingGfx = this.scene.add.graphics();
    footingGfx.fillStyle(0x080c09, 0.52);
    footingGfx.fillRoundedRect(x - 3, y + h - 8, w + 6, 14, 5);
    footingGfx.fillStyle(0x1e261f, 0.40);
    footingGfx.fillRect(x + 2, y + h - 4, w - 4, 7);
    footingGfx.setDepth(-95);
    this.registerCullable(footingGfx, x + w / 2, y + h, Math.max(w, h));

    // Sprite nhà có kích thước 112×80 px, đặt tại (x, y - 24) để mái nhà vươn lên cao
    // và chân tường khớp chính xác với đường Y-sorting (y + h)
    const house = this.safeAddImage(x, y - 24, houseKey);
    house.setOrigin(0, 0);
    house.setDepth(y + h);
    this.registerCullable(house, x + w / 2, y + h / 2, Math.max(w, h));

    // C4-13-17: Chuẩn hóa hộp va chạm bao phủ trọn vẹn thân tường và chân công trình,
    // chống nhân vật đi xuyên qua tường hoặc leo lên mái nhà từ phía bắc/hai bên
    const colW = w - 6;
    const colH = Math.max(h - 6, 42);
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);
  }

  private createBellTower(x: number, y: number, w: number, h: number): void {
    // C4-12-30: Móng đá tiếp xúc và bóng đổ chân tháp chuông (depth -95)
    const towerFooting = this.scene.add.graphics();
    towerFooting.fillStyle(0x080c09, 0.55);
    towerFooting.fillRoundedRect(x - 4, y + h - 10, w + 8, 16, 6);
    towerFooting.fillStyle(0x222a24, 0.42);
    towerFooting.fillRect(x + 2, y + h - 5, w - 4, 8);
    towerFooting.setDepth(-95);
    this.registerCullable(towerFooting, x + w / 2, y + h, Math.max(w, h));

    // Tháp chuông làng Bellhollow bằng sprite SPRITE_BELL_TOWER (80×112 px)
    // Đặt đỉnh tháp tại (x, y - 52) để chân tháp kết thúc đúng tại (y + h = 310),
    // nằm hoàn toàn phía Bắc Bà Lão Edda (790, 330)
    const tower = this.safeAddImage(x, y - 52, SPRITE_BELL_TOWER);
    tower.setOrigin(0, 0);
    tower.setDepth(y + h);
    this.registerCullable(tower, x + w / 2, y + h / 2, Math.max(w, h));

    // C4-13-17: Chuẩn hóa hộp va chạm Tháp Chuông bao phủ toàn bộ bệ đá và thân tháp
    const colW = w - 8;
    const colH = Math.max(h - 4, 54);
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);
  }

  private createVillageWell(x: number, y: number): void {
    const well = this.safeAddImage(x, y, SPRITE_VILLAGE_WELL);
    well.setOrigin(0.5, 0.88);
    well.setDepth(y);
    this.registerCullable(well, x, y, 40);

    // C4-13-17: Chuẩn hóa hộp va chạm thành giếng đá bao phủ chân công trình
    const body = this.colliderGroup.create(x, y - 6, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 22);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -11);
  }

  private createCraftingBench(x: number, y: number): void {
    const bench = this.safeAddImage(x + 18, y + 9, SPRITE_CRAFTING_BENCH);
    bench.setOrigin(0.5, 0.72);
    bench.setDepth(y + 18);
    this.registerCullable(bench, x + 18, y + 9, 50);

    // C4-13-17: Chuẩn hóa hộp va chạm chân bàn chế tạo khép kín với xưởng rèn
    const body = this.colliderGroup.create(x + 18, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(52, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-26, -8);
  }

  /**
   * Dựng mái vòm xưởng rèn & kho củi phía sau Bàn Chế Tạo (không cản lối tiếp cận phía trước bàn).
   */
  private createCraftingWorkshopPavilion(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Khung cột gỗ & tường hậu che gió phía Bắc bàn chế tạo
    g.fillStyle(0x1f150e, 1);
    g.fillRect(x, y + 18, 84, 24);
    g.fillStyle(0x362417, 1);
    g.fillRect(x + 2, y + 20, 80, 20);

    // Ngăn xếp củi khô bên trái xưởng (như ảnh concept!)
    g.fillStyle(0x1a110b, 1);
    g.fillRect(x + 4, y + 22, 22, 16);
    const logColors = [0x6e472b, 0x855836, 0x54351f];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillStyle(logColors[(row + col) % logColors.length], 1);
        g.fillCircle(x + 8 + col * 4, y + 35 - row * 4, 2.2);
      }
    }

    // Mái ngói đá đen phủ rêu của xưởng chế tạo
    g.fillStyle(0x1b222b, 1);
    g.fillRect(x - 4, y, 92, 20);
    g.fillStyle(0x283240, 1);
    g.fillRect(x - 2, y + 2, 88, 16);
    g.fillStyle(0x3b281a, 1);
    g.fillRect(x - 4, y + 18, 92, 3);
    // Rêu xanh trên mái xưởng
    g.fillStyle(0x35542c, 1);
    g.fillRect(x + 8, y + 4, 20, 5);
    g.fillRect(x + 54, y + 6, 22, 5);

    // Thùng gỗ & xô nước rèn bên phải xưởng
    g.fillStyle(0x4a301d, 1);
    g.fillRect(x + 86, y + 28, 11, 14);
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(x + 86, y + 31, 11, 2);
    g.fillRect(x + 86, y + 37, 11, 2);

    g.setDepth(y + 42);
    this.registerCullable(g, x + 42, y + 20, 60);

    // C4-13-17: Chuẩn hóa hộp va chạm toàn bộ xưởng rèn & kho củi (bao trùm mái nhà và tường hậu)
    // chống triệt để việc nhân vật đi xuyên lên mái từ phía bắc hoặc xuyên qua đống củi
    const body = this.colliderGroup.create(x + 42, y + 20, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(88, 40);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-44, -20);
  }

  /**
   * Trạm gác Cổng Tây phía Bắc NPC Garth (530, 220), tạo chiều sâu cho lối vào làng mà không chắn đường đi.
   */
  private createWestWatchpost(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ
    g.fillStyle(0x0a0e0c, 0.55);
    g.fillRect(x + 2, y + 42, 64, 6);

    // Thân chòi gác gỗ & chân đá
    g.fillStyle(0x221811, 1);
    g.fillRect(x + 4, y + 18, 56, 28);
    g.fillStyle(0x4a3728, 1);
    g.fillRect(x + 6, y + 20, 52, 16);
    g.fillStyle(0x3d464f, 1);
    g.fillRect(x + 6, y + 36, 52, 9);

    // Cửa sổ nhỏ phát sáng vàng ấm trên chòi gác
    g.fillStyle(0x1f150e, 1);
    g.fillRect(x + 16, y + 23, 10, 9);
    g.fillStyle(0xf39c12, 1);
    g.fillRect(x + 18, y + 25, 6, 5);
    g.fillStyle(0xfef9e7, 1);
    g.fillRect(x + 19, y + 26, 4, 3);

    // Giá treo giáo/khiên & thùng tiếp tế cạnh chòi gác
    g.fillStyle(0x543824, 1);
    g.fillRect(x + 36, y + 24, 16, 18);
    g.fillStyle(0x7f8c8d, 1);
    g.fillRect(x + 41, y + 27, 6, 8);

    // Mái ngói đá đen phủ rêu
    g.fillStyle(0x1c232b, 1);
    g.fillRect(x, y, 64, 20);
    g.fillStyle(0x2b3642, 1);
    g.fillRect(x + 2, y + 2, 60, 16);
    g.fillStyle(0x36542d, 1);
    g.fillRect(x + 8, y + 5, 18, 5);
    g.fillRect(x + 38, y + 8, 16, 5);

    g.setDepth(y + 46);
    this.registerCullable(g, x + 32, y + 23, 50);

    // C4-13-17: Chuẩn hóa hộp va chạm trạm gác bao phủ toàn bộ mái và thân chòi
    const body = this.colliderGroup.create(x + 32, y + 24, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(58, 42);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-29, -21);
  }

  /**
   * Nhà dân làng phía Tây-Nam Quảng Trường (x=516, y=376), tái sử dụng sprite kiến trúc gỗ đá trung cổ.
   */
  private createSouthWestCottage(x: number, y: number): void {
    // C4-12-30: Chân móng nhà phụ Tây Nam tiếp xúc êm ái với nền đất (depth -95)
    const cottageFooting = this.scene.add.graphics();
    cottageFooting.fillStyle(0x080c09, 0.48);
    cottageFooting.fillRoundedRect(x - 2, y + 42, 98, 12, 5);
    cottageFooting.setDepth(-95);
    this.registerCullable(cottageFooting, x + 47, y + 46, 60);

    const house = this.scene.add.image(x, y - 22, SPRITE_HOUSE_EDDA);
    house.setOrigin(0, 0);
    house.setScale(0.92, 0.92);
    house.setTint(0xd8cfc4);
    house.setDepth(y + 48);
    this.registerCullable(house, x + 47, y + 20, 60);

    // C4-13-17: Chuẩn hóa hộp va chạm nhà dân Tây-Nam bao phủ toàn bộ thân tường và mái nhà
    const colW = 96;
    const colH = 46;
    const body = this.colliderGroup.create(x + 47, y + 25, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);
  }

  /**
   * Bàn bày thuốc & giá thảo dược hai bên hiên Nhà Thảo Mộc của Neris (không chắn lối vào gặp Neris tại 970,130).
   */
  private createApothecaryTables(leftX: number, leftY: number, rightX: number, rightY: number): void {
    const g = this.scene.add.graphics();

    // Bàn thảo dược bên trái (bình thuốc xanh/tím/vàng)
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRect(leftX - 12, leftY + 5, 24, 5);
    g.fillStyle(0x3b2618, 1);
    g.fillRect(leftX - 12, leftY - 4, 24, 10);
    g.fillStyle(0x593b25, 1);
    g.fillRect(leftX - 11, leftY - 3, 22, 6);
    g.fillStyle(0x48c9b0, 1);
    g.fillRect(leftX - 8, leftY - 6, 3, 4);
    g.fillStyle(0xaf7ac5, 1);
    g.fillRect(leftX - 2, leftY - 7, 3, 5);
    g.fillStyle(0xf4d03f, 1);
    g.fillRect(leftX + 4, leftY - 6, 4, 4);

    // Bàn giỏ lá thuốc & thùng gỗ bên phải
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRect(rightX - 12, rightY + 5, 24, 5);
    g.fillStyle(0x3b2618, 1);
    g.fillRect(rightX - 12, rightY - 4, 24, 10);
    g.fillStyle(0x593b25, 1);
    g.fillRect(rightX - 11, rightY - 3, 22, 6);
    g.fillStyle(0x2ecc71, 1);
    g.fillRect(rightX - 8, rightY - 6, 7, 4);
    g.fillStyle(0xe67e22, 1);
    g.fillRect(rightX + 2, rightY - 6, 6, 4);

    g.setDepth(leftY + 8);
    this.registerCullable(g, (leftX + rightX) / 2, (leftY + rightY) / 2, 50);

    // C4-13-17: Bổ sung hộp va chạm chân vật thể chuẩn xác cho cả 2 kệ bàn thảo dược cạnh nhà Neris
    const leftBody = this.colliderGroup.create(leftX, leftY + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    leftBody.setVisible(false);
    (leftBody.body as Phaser.Physics.Arcade.Body).setSize(26, 14);
    (leftBody.body as Phaser.Physics.Arcade.Body).setOffset(-13, -7);

    const rightBody = this.colliderGroup.create(rightX, rightY + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    rightBody.setVisible(false);
    (rightBody.body as Phaser.Physics.Arcade.Body).setSize(26, 14);
    (rightBody.body as Phaser.Physics.Arcade.Body).setOffset(-13, -7);
  }

  /**
   * Khu vườn thảo dược & nhà kho nông cụ ở góc Đông-Nam làng (x=1030, y=420) theo đúng ảnh concept.
   * Các luống đất tương tác được điều khiển động qua FarmingSystem (C4-12-16).
   */
  private createSanctuaryHerbGarden(x: number, y: number): void {
    const g = this.scene.add.graphics();

    // 2 Luống đất trồng thảo dược có viền gỗ sồi rộng rãi
    g.fillStyle(0x2b1d13, 1);
    g.fillRect(x, y + 2, 104, 18);
    g.fillStyle(0x3d2b1d, 1);
    g.fillRect(x + 2, y + 4, 100, 14);

    g.fillStyle(0x2b1d13, 1);
    g.fillRect(x, y + 28, 104, 18);
    g.fillStyle(0x3d2b1d, 1);
    g.fillRect(x + 2, y + 30, 100, 14);

    // Thùng nước tưới cây bên cạnh luống vườn
    g.fillStyle(0x4a3221, 1);
    g.fillRect(x - 14, y + 10, 11, 14);
    g.fillStyle(0x2980b9, 1);
    g.fillRect(x - 12, y + 11, 7, 3);

    // Biển gỗ nhỏ cắm đầu luống vườn: "Vườn Dược Sanctuary"
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - 12, y + 32, 3, 10);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(x - 16, y + 27, 12, 7);

    g.setDepth(y + 2);
    this.registerCullable(g, x + 50, y + 20, 70);
  }

  /**
   * Cụm đạo cụ làng (thùng gỗ, kiện hàng, đống củi) tạo sức sống quanh các công trình.
   */
  private createVillagePropCluster(x: number, y: number, type: 'barrels' | 'firewood'): void {
    const g = this.scene.add.graphics();
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillEllipse(x, y + 6, 24, 8);

    if (type === 'barrels') {
      g.fillStyle(0x4a311e, 1);
      g.fillRect(x - 10, y - 6, 9, 12);
      g.fillStyle(0x5c3e26, 1);
      g.fillRect(x, y - 4, 10, 10);
      g.fillStyle(0x2c3e50, 1);
      g.fillRect(x - 10, y - 3, 9, 2);
      g.fillRect(x, y - 1, 10, 2);
    } else {
      g.fillStyle(0x3b2618, 1);
      g.fillRect(x - 10, y - 3, 20, 8);
      g.fillStyle(0x6e472b, 1);
      g.fillRect(x - 8, y - 6, 16, 4);
      g.fillStyle(0x855836, 1);
      g.fillRect(x - 6, y - 8, 12, 3);
    }
    g.setDepth(y + 6);
    this.registerCullable(g, x, y, 30);

    // C4-13-17: Bổ sung hộp va chạm chân cụm thùng gỗ & đống củi làng
    const body = this.colliderGroup.create(x, y + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(22, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-11, -6);
  }

  /**
   * Cột đèn lồng gỗ phát ánh sáng vàng ấm dọc theo đường làng và Quảng trường trung tâm (C4-13-06: Quầng sáng ấm chuyển sắc tự nhiên).
   */
  private createVillageLanternPost(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // 1. Quầng sáng ấm 3 tầng chuyển sắc mịn màng, loại bỏ hoàn toàn viền cắt gắt
    g.fillStyle(0xf39c12, 0.05);
    g.fillCircle(x + 6, y - 16, 28);
    g.fillStyle(0xf39c12, 0.09);
    g.fillCircle(x + 6, y - 16, 18);
    g.fillStyle(0xffe082, 0.16);
    g.fillCircle(x + 6, y - 16, 9);

    // 2. Bóng chân cột đen mờ mịn (alpha 0.25)
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(x, y + 2, 12, 4);

    // 3. Thân cột gỗ sồi & tay treo chữ L
    g.fillStyle(0x24170f, 1);
    g.fillRect(x - 2, y - 24, 4, 26);
    g.fillStyle(0x3d281a, 1);
    g.fillRect(x - 1, y - 23, 2, 24);
    g.fillStyle(0x24170f, 1);
    g.fillRect(x - 2, y - 24, 10, 3);

    // 4. Đèn lồng treo phát sáng pixel art
    g.fillStyle(0xd35400, 1);
    g.fillRect(x + 4, y - 20, 5, 7);
    g.fillStyle(0xf39c12, 1);
    g.fillRect(x + 5, y - 19, 3, 5);
    g.fillStyle(0xfef9e7, 1);
    g.fillRect(x + 6, y - 18, 1, 3);

    g.setDepth(y + 2);
    this.registerCullable(g, x, y, 35);

    // C4-13-17: Bổ sung hộp va chạm chân cột đèn lồng làng
    const body = this.colliderGroup.create(x, y - 1, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(8, 8);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-4, -4);
  }

  /**
   * Hiệu ứng khói bếp nhẹ bay lên từ ống khói nhà dân làng Bellhollow.
   */
  private createChimneySmoke(x: number, y: number): void {
    const smoke = this.scene.add.graphics();
    smoke.fillStyle(0xd5dbdb, 0.28);
    smoke.fillCircle(0, 0, 5);
    smoke.fillCircle(4, -7, 6);
    smoke.fillCircle(1, -15, 7);
    smoke.setPosition(x, y);
    smoke.setDepth(y + 90);
    this.registerCullable(smoke, x, y, 30);

    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: smoke,
        y: y - 8,
        alpha: 0.12,
        duration: 2600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Hệ thống hàng rào gỗ trung cổ phân tách không gian làng và bìa rừng,
   * có collider chuẩn xác và chừa lối đi thông thoáng tại mọi ngả đường.
   */
  private createVillageFence(_bounds: { x: number; y: number; width: number; height: number }): void {
    const addFenceSegment = (fx: number, fy: number, withCollider: boolean = true) => {
      const fence = this.scene.add.image(fx, fy, SPRITE_WOODEN_FENCE);
      fence.setOrigin(0, 0.78);
      fence.setDepth(fy);
      this.registerCullable(fence, fx + 23, fy, 40);

      if (withCollider) {
        const body = this.colliderGroup.create(fx + 23, fy - 4, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        (body.body as Phaser.Physics.Arcade.Body).setSize(42, 10);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-21, -5);
      }
    };

    // 1. Hàng rào gỗ trang trí hai bên Cổng Tây & lối dẫn vào Quảng Trường (chừa trống hoàn toàn đường đi & mỏ tài nguyên)
    addFenceSegment(510, 290, true);
    addFenceSegment(556, 290, true);

    // 2. Hàng rào gỗ dọc khuôn viên giữa Nhà Edda và Nhà Neris ở phía Bắc (x: 775..895, y: 92)
    addFenceSegment(778, 92, true);
    addFenceSegment(826, 92, true);

    // 3. Hàng rào gỗ bao quanh phía Bắc & Nam Khu Vườn Thảo Dược Đông-Nam (x: 1030..1130)
    addFenceSegment(1030, 418, false);
    addFenceSegment(1078, 418, false);
    addFenceSegment(1030, 482, true);
    addFenceSegment(1078, 482, true);

    // 4. Hàng rào gỗ dọc lối ra Cổng Đông (x: 1050..1240, phía Bắc đường rừng Đông ở y=236)
    addFenceSegment(1060, 236, true);
    addFenceSegment(1108, 236, true);
    addFenceSegment(1156, 236, true);

    // 5. Hàng rào ranh giới Bắc (y = 26) & Nam (y = 532) của ngôi làng trong tầm nhìn camera
    for (let fx = 490; fx < 1540; fx += 92) {
      addFenceSegment(fx, 26, false);
      // C4-12-17: Chừa lối đi thông thoáng cho Lối Nam Nông Trại (610..710) và Lối Đông-Nam Rừng Ngoại Vi (1150..1270)
      const inFarmGate = fx >= 580 && fx <= 710;
      const inOuterWoodsGate = fx >= 1150 && fx <= 1270;
      if (!inFarmGate && !inOuterWoodsGate) {
        addFenceSegment(fx, 532, false);
      }
    }

    // Cổng gỗ & trụ đèn dẫn hướng tại 2 lối ra Vùng Lõi
    this.createVillageLanternPost(606, 532);
    this.createVillageLanternPost(714, 532);
    this.createVillageLanternPost(1146, 532);
    this.createVillageLanternPost(1274, 532);
  }

  /**
   * C4-12-18A (Mục 2E): Thiết kế Cổng Rừng Phía Đông (Outer Woods Entrance: "Rừng Ngoại Vi →")
   * Nổi bật với cổng vòm gỗ-đá cổ, biển chỉ đường, đèn lồng treo và hàng rào dẫn lối thẳng tới
   * điểm chuyển vùng thực tế to_crooked_path (x = 1580, y = 200..360), sẵn sàng cho C4-12-20 & C4-12-27.
   */
  private createEastForestEntrance(gateX: number, roadY: number): void {
    this.eastGateX = gateX;
    this.eastGateRoadY = roadY;

    const northPostY = roadY - 40; // 240
    const southPostY = roadY + 42; // 322

    // 1. Hàng rào gỗ dẫn hướng hai bên lối vào Cổng Đông
    const northFence = this.scene.add.image(gateX - 54, northPostY, SPRITE_WOODEN_FENCE);
    northFence.setOrigin(0, 0.78);
    northFence.setDepth(northPostY);

    const northFenceBody = this.colliderGroup.create(gateX - 31, northPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    northFenceBody.setVisible(false);
    (northFenceBody.body as Phaser.Physics.Arcade.Body).setSize(46, 12);
    (northFenceBody.body as Phaser.Physics.Arcade.Body).setOffset(-23, -6);

    const southFence = this.scene.add.image(gateX - 54, southPostY, SPRITE_WOODEN_FENCE);
    southFence.setOrigin(0, 0.78);
    southFence.setDepth(southPostY);

    const southFenceBody = this.colliderGroup.create(gateX - 31, southPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    southFenceBody.setVisible(false);
    (southFenceBody.body as Phaser.Physics.Arcade.Body).setSize(46, 12);
    (southFenceBody.body as Phaser.Physics.Arcade.Body).setOffset(-23, -6);

    // 2. Biển chỉ đường gỗ cổ (SPRITE_SIGNPOST) và Cột đèn lồng ấm trước Cổng Đông
    this.createStoneSign(gateX - 62, southPostY + 4, 'RỪNG NGOẠI VI');
    this.createVillageLanternPost(gateX - 36, northPostY - 2);

    // 3. Trụ cổng đá - gỗ phía Bắc (depth = northPostY = 240)
    const northPillar = this.scene.add.graphics();
    northPillar.fillStyle(0x0a0e0c, 0.55);
    northPillar.fillEllipse(gateX, northPostY + 2, 22, 8);
    // Chân trụ đá rêu phong
    northPillar.fillStyle(0x252b30, 1);
    northPillar.fillRect(gateX - 8, northPostY - 18, 16, 20);
    northPillar.fillStyle(0x49525b, 1);
    northPillar.fillRect(gateX - 6, northPostY - 16, 12, 16);
    northPillar.fillStyle(0x36542d, 1);
    northPillar.fillRect(gateX - 7, northPostY - 4, 10, 5);
    // Thân cột gỗ sồi vươn lên vòm cổng
    northPillar.fillStyle(0x24170f, 1);
    northPillar.fillRect(gateX - 5, northPostY - 52, 10, 36);
    northPillar.fillStyle(0x422b1b, 1);
    northPillar.fillRect(gateX - 3, northPostY - 50, 6, 34);
    northPillar.setDepth(northPostY);

    const northBody = this.colliderGroup.create(gateX, northPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    northBody.setVisible(false);
    (northBody.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (northBody.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);

    // 4. Trụ cổng đá - gỗ phía Nam (depth = southPostY = 322)
    const southPillar = this.scene.add.graphics();
    southPillar.fillStyle(0x0a0e0c, 0.55);
    southPillar.fillEllipse(gateX, southPostY + 2, 22, 8);
    southPillar.fillStyle(0x252b30, 1);
    southPillar.fillRect(gateX - 8, southPostY - 18, 16, 20);
    southPillar.fillStyle(0x49525b, 1);
    southPillar.fillRect(gateX - 6, southPostY - 16, 12, 16);
    southPillar.fillStyle(0x36542d, 1);
    southPillar.fillRect(gateX - 6, southPostY - 4, 11, 5);
    southPillar.fillStyle(0x24170f, 1);
    southPillar.fillRect(gateX - 5, southPostY - 118, 10, 102);
    southPillar.fillStyle(0x422b1b, 1);
    southPillar.fillRect(gateX - 3, southPostY - 116, 6, 98);
    // Đèn lồng cảnh giới treo trên trụ cổng Đông
    southPillar.fillStyle(0xf39c12, 0.18);
    southPillar.fillCircle(gateX - 10, southPostY - 34, 18);
    southPillar.fillStyle(0xd35400, 1);
    southPillar.fillRect(gateX - 12, southPostY - 37, 5, 7);
    southPillar.fillStyle(0xfef9e7, 1);
    southPillar.fillRect(gateX - 11, southPostY - 35, 3, 3);
    southPillar.setDepth(southPostY);

    const southBody = this.colliderGroup.create(gateX, southPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    southBody.setVisible(false);
    (southBody.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (southBody.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);

    // 5. Vòm cổng gỗ-đá trên cao & Bảng tên treo "Rừng Ngoại Vi →" (depth = southPostY + 35 để người chơi đi xuyên qua dưới vòm cổng)
    const archY = northPostY - 54; // 186
    const overheadArch = this.scene.add.graphics();
    // Xà ngang vòm cổng bằng gỗ sồi & ngói đá phủ rêu
    overheadArch.fillStyle(0x1b222a, 1);
    overheadArch.fillRect(gateX - 16, archY - 6, 32, 16);
    overheadArch.fillStyle(0x3d281a, 1);
    overheadArch.fillRect(gateX - 14, archY - 2, 28, 10);
    overheadArch.fillStyle(0x36542d, 1);
    overheadArch.fillRect(gateX - 10, archY - 5, 18, 4);

    // Bảng gỗ treo "Rừng Ngoại Vi →" dưới vòm cổng (theo đúng ảnh concept!)
    overheadArch.fillStyle(0x1a120b, 1);
    overheadArch.fillRect(gateX - 38, archY + 10, 76, 16);
    overheadArch.fillStyle(0x3b281a, 1);
    overheadArch.fillRect(gateX - 36, archY + 12, 72, 12);
    overheadArch.lineStyle(1, 0x8a6d3b, 0.85);
    overheadArch.strokeRect(gateX - 36, archY + 12, 72, 12);
    overheadArch.setDepth(southPostY + 35);

    const signLabel = this.scene.add.text(gateX, archY + 18, 'Rừng Ngoại Vi →', {
      fontFamily: 'serif',
      fontSize: '8px',
      color: '#f5e6c8',
      stroke: '#140d08',
      strokeThickness: 2
    });
    signLabel.setOrigin(0.5, 0.5);
    signLabel.setResolution(2);
    signLabel.setDepth(southPostY + 36);

    // 6. Hai cột mốc đá cổ dẫn thẳng tới vạch chuyển vùng to_crooked_path (x = 1580)
    const markerNorth = this.scene.add.image(gateX + 62, northPostY + 2, SPRITE_STONE_ALTAR);
    markerNorth.setScale(0.55);
    markerNorth.setOrigin(0.5, 0.8);
    markerNorth.setDepth(northPostY + 2);

    const markerSouth = this.scene.add.image(gateX + 62, southPostY - 2, SPRITE_STONE_ALTAR);
    markerSouth.setScale(0.55);
    markerSouth.setOrigin(0.5, 0.8);
    markerSouth.setDepth(southPostY - 2);

    // 7. C4-12-03: Khối va chạm chặn Cổng Đông (kết nối kín từ Trụ Bắc tới Trụ Nam)
    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    this.eastGateColliderBody = this.colliderGroup.create(gateX, roadY, dummyKey) as Phaser.Physics.Arcade.Sprite;
    this.eastGateColliderBody.setVisible(false);
    this.eastGateColliderBody.setAlpha(0);
    const gateBody = this.eastGateColliderBody.body as Phaser.Physics.Arcade.Body;
    gateBody.setSize(16, 76);
    gateBody.setOffset(-8, -38);
    gateBody.enable = !this.isEastGateOpen;
    gateBody.checkCollision.none = this.isEastGateOpen;

    // 8. C4-12-03: Vẽ hình ảnh Cổng Đông (cổng đóng khóa xích vs cổng mở gập hai bên)
    this.renderEastGateBarrier(gateX, roadY, this.isEastGateOpen);
    this.updateEastGateInteractable(this.isEastGateOpen);
  }

  /**
   * C4-12-03: Kiểm tra trạng thái Cổng Đông đã mở hay chưa
   */
  public isEastGateUnlocked(): boolean {
    return this.isEastGateOpen;
  }

  /**
   * C4-12-03: Cập nhật trạng thái Cổng Đông (Mở/Khóa), đồng bộ collider và hình ảnh
   */
  public setEastGateOpen(open: boolean): void {
    this.isEastGateOpen = open;

    if (this.eastGateColliderBody) {
      const body = this.eastGateColliderBody.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.enable = !open;
        body.checkCollision.none = open;
      }
    }

    this.renderEastGateBarrier(this.eastGateX, this.eastGateRoadY, open);
    this.updateEastGateInteractable(open);
  }

  /**
   * C4-12-03 & C4-12-28: Cập nhật nội dung nhắc tương tác [E] cho Cổng Đông
   */
  public updateEastGateInteractable(isOpen: boolean): void {
    const gateInteractable = this.interactables.find(item => item.id === 'east_gate_barrier');
    if (gateInteractable) {
      gateInteractable.promptText = isOpen
        ? '[E] Cổng Đông (Đã mở - Đi vào Đường Mòn Quanh Co)'
        : '[E] Kiểm tra Cổng Đông (Khóa chặt)';
    }
  }

  /**
   * C4-12-28: Đồng bộ toàn bộ các cổng chặn thế giới tập trung theo trạng thái PlayerState
   */
  public syncAllWorldGates(playerState: PlayerState): void {
    const isEastGateOpen = playerState.isEastGateUnlocked();
    this.setEastGateOpen(isEastGateOpen);

    const isShrineOpen = playerState.isShrineUnlocked();
    this.setShrineWardOpen(isShrineOpen);

    const isMireOpen = playerState.isSilentMireUnlocked();
    const mireGate = this.interactables.find(
      i => i.id === 'df_mire_boundary_gate' || i.actionId === 'inspect_df_mire_boundary_gate'
    );
    if (mireGate) {
      mireGate.promptText = isMireOpen
        ? '[E] Ranh Giới Đầm Lầy (Đường mòn đã thông suốt)'
        : '[E] Kiểm tra Ranh Giới Đầm Lầy (Bụi gai phong tỏa)';
    }
  }

  /**
   * C4-12-28: Kiểm tra trạng thái Kết Giới Cổng Miếu Chuông đã mở hay chưa
   */
  public isShrineWardUnlocked(): boolean {
    return this.isShrineWardOpen;
  }

  /**
   * C4-12-28: Cập nhật trạng thái Kết Giới Cổng Miếu Chuông (Mở/Khóa), đồng bộ collider và hình ảnh
   */
  public setShrineWardOpen(open: boolean): void {
    this.isShrineWardOpen = open;

    if (this.shrineWardColliderBody) {
      const body = this.shrineWardColliderBody.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.enable = !open;
        body.checkCollision.none = open;
      }
    }

    this.renderShrineWardBarrier(this.shrineGateX, this.shrineGateY, open);
    this.updateShrineWardInteractable(open);
  }

  /**
   * C4-12-28: Cập nhật dòng nhắc tương tác [E] cho Kết Giới Cổng Miếu
   */
  public updateShrineWardInteractable(isOpen: boolean): void {
    const ward = this.interactables.find(item => item.id === 'sm_shrine_gate_ward');
    if (ward) {
      ward.promptText = isOpen
        ? '[E] Cổng Miếu Chuông (Đã giải phong ấn - Tiến vào)'
        : '[E] Kiểm tra Kết Giới Cổng Miếu (Phong ấn cổ xưa)';
    }
  }

  /**
   * C4-12-28: Vẽ hiệu ứng Kết Giới Cổng Miếu Chuông Phế Tích
   * - Khóa (isOpen = false): Màn kết giới năng lượng tím ma mị với ký hiệu cổ ngữ phong tỏa.
   * - Mở (isOpen = true): Màn năng lượng tan biến, để lại lối đi thông suốt với hào quang đồng cổ thanh bình.
   */
  public renderShrineWardBarrier(x: number, y: number, isOpen: boolean): void {
    if (!this.shrineWardVisual) return;
    this.shrineWardVisual.clear();

    if (!isOpen) {
      // Màn kết giới tím ma mị bao phủ lối đi (y - 20 .. y + 20)
      this.shrineWardVisual.fillStyle(0x8e44ad, 0.45);
      this.shrineWardVisual.fillRect(x - 4, y - 24, 8, 48);

      // Viền năng lượng tím sáng
      this.shrineWardVisual.lineStyle(2, 0xbb86fc, 0.9);
      this.shrineWardVisual.strokeRect(x - 4, y - 24, 8, 48);

      // Lõi năng lượng trung tâm
      this.shrineWardVisual.fillStyle(0xdda0dd, 0.7);
      this.shrineWardVisual.fillRect(x - 1, y - 20, 2, 40);

      // Ký hiệu 3 phong ấn cổ ngữ trên màn chắn
      this.shrineWardVisual.fillStyle(0xffffff, 0.9);
      this.shrineWardVisual.fillCircle(x, y - 12, 3); // Biểu tượng Trăng
      this.shrineWardVisual.fillCircle(x, y, 3);      // Biểu tượng Rễ
      this.shrineWardVisual.fillCircle(x, y + 12, 3); // Biểu tượng Mắt
    } else {
      // Khi đã mở: Màn kết giới tan biến, để lại 2 vệt sáng hoàng kim đồng dịu nhẹ dưới chân cột đá
      this.shrineWardVisual.fillStyle(0xd4af37, 0.4);
      this.shrineWardVisual.fillEllipse(x, y - 20, 16, 6);
      this.shrineWardVisual.fillEllipse(x, y + 20, 16, 6);
      this.shrineWardVisual.lineStyle(1, 0xf1c40f, 0.6);
      this.shrineWardVisual.strokeEllipse(x, y - 20, 16, 6);
      this.shrineWardVisual.strokeEllipse(x, y + 20, 16, 6);
    }
  }

  /**
   * C4-12-03: Vẽ pixel-art hiển thị Cổng Đông làng Bellhollow
   * - Khóa (isOpen = false): Hàng rào gỗ sồi kiên cố, xà ngang nẹp sắt, xích sắt quấn quanh và ổ khóa đồng niêm phong.
   * - Mở (isOpen = true): Cánh cổng gập áp sát hai bên trụ đá, xích khóa tháo rời, ánh sáng đèn lồng rọi thông suốt lối đi.
   */
  private renderEastGateBarrier(gateX: number, roadY: number, isOpen: boolean): void {
    if (!this.eastGateVisual) {
      this.eastGateVisual = this.scene.add.graphics();
    }
    this.eastGateVisual.clear();
    this.eastGateVisual.setDepth(roadY - 2);

    if (!isOpen) {
      // --- TRẠNG THÁI CỔNG ĐÓNG / KHÓA CHẶT (LOCKED) ---
      // 1. Bóng đổ nền đất dưới chân hàng rào cổng
      this.eastGateVisual.fillStyle(0x0a0e0c, 0.45);
      this.eastGateVisual.fillRect(gateX - 7, roadY - 37, 14, 74);

      // 2. Tấm ván gỗ sồi kiên cố cánh Bắc (y = 244..280)
      this.eastGateVisual.fillStyle(0x1a120b, 1);
      this.eastGateVisual.fillRect(gateX - 6, roadY - 36, 12, 36);
      this.eastGateVisual.fillStyle(0x382417, 1);
      this.eastGateVisual.fillRect(gateX - 5, roadY - 35, 10, 34);
      // Khe nẹp gỗ
      this.eastGateVisual.fillStyle(0x23170e, 1);
      this.eastGateVisual.fillRect(gateX - 1, roadY - 35, 2, 34);
      // Viền sáng vân gỗ
      this.eastGateVisual.fillStyle(0x4d3322, 1);
      this.eastGateVisual.fillRect(gateX - 4, roadY - 34, 2, 32);

      // 3. Tấm ván gỗ sồi kiên cố cánh Nam (y = 282..316)
      this.eastGateVisual.fillStyle(0x1a120b, 1);
      this.eastGateVisual.fillRect(gateX - 6, roadY + 1, 12, 35);
      this.eastGateVisual.fillStyle(0x382417, 1);
      this.eastGateVisual.fillRect(gateX - 5, roadY + 2, 10, 33);
      this.eastGateVisual.fillStyle(0x23170e, 1);
      this.eastGateVisual.fillRect(gateX - 1, roadY + 2, 2, 33);
      this.eastGateVisual.fillStyle(0x4d3322, 1);
      this.eastGateVisual.fillRect(gateX + 2, roadY + 3, 2, 31);

      // 4. Thanh giằng ngang gỗ gia cố (Horizontal Crossbeams)
      // Xà ngang trên (y = roadY - 26)
      this.eastGateVisual.fillStyle(0x22160d, 1);
      this.eastGateVisual.fillRect(gateX - 8, roadY - 27, 16, 6);
      this.eastGateVisual.fillStyle(0x422a1a, 1);
      this.eastGateVisual.fillRect(gateX - 7, roadY - 26, 14, 4);
      // Xà ngang giữa (y = roadY - 3..roadY + 3)
      this.eastGateVisual.fillStyle(0x22160d, 1);
      this.eastGateVisual.fillRect(gateX - 8, roadY - 3, 16, 6);
      this.eastGateVisual.fillStyle(0x422a1a, 1);
      this.eastGateVisual.fillRect(gateX - 7, roadY - 2, 14, 4);
      // Xà ngang dưới (y = roadY + 24)
      this.eastGateVisual.fillStyle(0x22160d, 1);
      this.eastGateVisual.fillRect(gateX - 8, roadY + 23, 16, 6);
      this.eastGateVisual.fillStyle(0x422a1a, 1);
      this.eastGateVisual.fillRect(gateX - 7, roadY + 24, 14, 4);

      // 5. Thanh chéo gia cố Z-brace cánh Bắc và Nam
      this.eastGateVisual.lineStyle(2, 0x2b1c11, 1);
      this.eastGateVisual.lineBetween(gateX - 5, roadY - 24, gateX + 4, roadY - 5);
      this.eastGateVisual.lineStyle(1, 0x4d3322, 0.9);
      this.eastGateVisual.lineBetween(gateX - 4, roadY - 24, gateX + 3, roadY - 5);

      this.eastGateVisual.lineStyle(2, 0x2b1c11, 1);
      this.eastGateVisual.lineBetween(gateX - 5, roadY + 5, gateX + 4, roadY + 23);
      this.eastGateVisual.lineStyle(1, 0x4d3322, 0.9);
      this.eastGateVisual.lineBetween(gateX - 4, roadY + 5, gateX + 3, roadY + 23);

      // 6. Bản lề sắt đúc rèn đen gắn vào hai trụ cổng
      this.eastGateVisual.fillStyle(0x1a2128, 1);
      this.eastGateVisual.fillRect(gateX - 9, roadY - 30, 4, 4);
      this.eastGateVisual.fillRect(gateX - 9, roadY + 26, 4, 4);
      this.eastGateVisual.fillStyle(0x5a6775, 1);
      this.eastGateVisual.fillRect(gateX - 8, roadY - 29, 2, 2);
      this.eastGateVisual.fillRect(gateX - 8, roadY + 27, 2, 2);

      // 7. Xích sắt quấn quanh và Ổ khóa đồng niêm phong (padlock & chain)
      this.eastGateVisual.fillStyle(0x2c353e, 1);
      this.eastGateVisual.fillRect(gateX - 7, roadY - 6, 14, 3);
      this.eastGateVisual.fillRect(gateX - 7, roadY + 3, 14, 3);
      this.eastGateVisual.fillStyle(0x616e7d, 1);
      this.eastGateVisual.fillRect(gateX - 6, roadY - 5, 3, 1);
      this.eastGateVisual.fillRect(gateX, roadY - 5, 3, 1);
      this.eastGateVisual.fillRect(gateX - 4, roadY + 4, 3, 1);
      this.eastGateVisual.fillRect(gateX + 2, roadY + 4, 3, 1);

      // Càng khóa đồng chữ U
      this.eastGateVisual.lineStyle(2, 0x8a6d3b, 1);
      this.eastGateVisual.strokeCircle(gateX, roadY - 3, 4);

      // Thân ổ khóa đồng đúc hình chữ nhật
      this.eastGateVisual.fillStyle(0x8a6d3b, 1);
      this.eastGateVisual.fillRect(gateX - 5, roadY - 2, 10, 8);
      this.eastGateVisual.fillStyle(0xd4af37, 1);
      this.eastGateVisual.fillRect(gateX - 4, roadY - 1, 8, 6);
      this.eastGateVisual.fillStyle(0x1a120b, 1);
      this.eastGateVisual.fillRect(gateX - 1, roadY + 1, 2, 3); // Lỗ tra chìa khóa

      // 8. Đốm rêu xanh rừng rậm bám chân cổng
      this.eastGateVisual.fillStyle(0x2d4624, 0.9);
      this.eastGateVisual.fillRect(gateX - 6, roadY - 36, 4, 3);
      this.eastGateVisual.fillRect(gateX + 2, roadY + 33, 4, 3);
      this.eastGateVisual.fillStyle(0x476d39, 0.85);
      this.eastGateVisual.fillRect(gateX - 5, roadY - 35, 2, 2);
      this.eastGateVisual.fillRect(gateX + 3, roadY + 34, 2, 2);

      // 9. Dấu ấn niêm phong cấm cổ ngữ màu đỏ sẫm mờ ảo
      this.eastGateVisual.fillStyle(0x8b0000, 0.65);
      this.eastGateVisual.fillCircle(gateX, roadY - 14, 4);
      this.eastGateVisual.fillStyle(0xff4d4d, 0.45);
      this.eastGateVisual.fillCircle(gateX, roadY - 14, 2);
    } else {
      // --- TRẠNG THÁI CỔNG MỞ RỘNG (UNLOCKED) ---
      // 1. Ánh sáng vàng ấm từ đèn lồng rọi qua lối đi thông thoáng
      this.eastGateVisual.fillStyle(0xf39c12, 0.15);
      this.eastGateVisual.fillEllipse(gateX + 10, roadY, 56, 32);
      this.eastGateVisual.fillStyle(0xfef9e7, 0.08);
      this.eastGateVisual.fillEllipse(gateX + 6, roadY, 30, 20);

      // 2. Cánh cổng Bắc được gập mở ép sát về phía trụ cổng Bắc (y: 242..260)
      this.eastGateVisual.fillStyle(0x0a0e0c, 0.35);
      this.eastGateVisual.fillEllipse(gateX + 6, roadY - 26, 14, 6);
      this.eastGateVisual.fillStyle(0x1a120b, 1);
      this.eastGateVisual.fillRect(gateX - 2, roadY - 36, 10, 18);
      this.eastGateVisual.fillStyle(0x382417, 1);
      this.eastGateVisual.fillRect(gateX - 1, roadY - 35, 8, 16);
      this.eastGateVisual.fillStyle(0x4d3322, 1);
      this.eastGateVisual.fillRect(gateX, roadY - 34, 2, 14);
      // Xà nẹp bản lề mở
      this.eastGateVisual.fillStyle(0x22160d, 1);
      this.eastGateVisual.fillRect(gateX - 3, roadY - 32, 12, 3);
      this.eastGateVisual.fillStyle(0x5a6775, 1);
      this.eastGateVisual.fillRect(gateX - 4, roadY - 32, 2, 3);

      // 3. Cánh cổng Nam được gập mở ép sát về phía trụ cổng Nam (y: 300..318)
      this.eastGateVisual.fillStyle(0x0a0e0c, 0.35);
      this.eastGateVisual.fillEllipse(gateX + 6, roadY + 26, 14, 6);
      this.eastGateVisual.fillStyle(0x1a120b, 1);
      this.eastGateVisual.fillRect(gateX - 2, roadY + 18, 10, 18);
      this.eastGateVisual.fillStyle(0x382417, 1);
      this.eastGateVisual.fillRect(gateX - 1, roadY + 19, 8, 16);
      this.eastGateVisual.fillStyle(0x4d3322, 1);
      this.eastGateVisual.fillRect(gateX, roadY + 20, 2, 14);
      // Xà nẹp bản lề mở
      this.eastGateVisual.fillStyle(0x22160d, 1);
      this.eastGateVisual.fillRect(gateX - 3, roadY + 29, 12, 3);
      this.eastGateVisual.fillStyle(0x5a6775, 1);
      this.eastGateVisual.fillRect(gateX - 4, roadY + 29, 2, 3);

      // 4. Xích sắt và ổ khóa đã tháo bỏ, treo buông lơi bên cạnh trụ Bắc
      this.eastGateVisual.fillStyle(0x5a6775, 0.8);
      this.eastGateVisual.fillRect(gateX - 6, roadY - 20, 2, 8);
      this.eastGateVisual.fillStyle(0xd4af37, 0.85);
      this.eastGateVisual.fillRect(gateX - 8, roadY - 14, 5, 5);

      // 5. Vệt bụi đất thông suốt trên lòng đường (y: 262..298 là hoàn toàn trống trải!)
      this.eastGateVisual.fillStyle(0x534335, 0.4);
      this.eastGateVisual.fillRect(gateX - 8, roadY - 14, 16, 28);
    }
  }

  /**
   * C4-12-18A (Mục 2C): Tăng mật độ cây cổ thụ đa kích thước (tree_oak_1..3, tree_dead, hollow_tree),
   * bụi rậm (bush_dense_1..2), cành cây khô, dương xỉ và hoa dại dọc ranh giới làng & quanh các cụm nhà.
   * Phân bố theo cụm tự nhiên (có khoảng dày, khoảng thưa) và chừa trống hoàn toàn mọi đường đi, NPC & mỏ tài nguyên.
   */
  private createBellhollowVegetation(): void {
    const placeVariantTree = (
      x: number,
      y: number,
      variant: 'oak1' | 'oak2' | 'oak3' | 'dead' | 'hollow',
      scale: number = 1.0,
      tint: number = 0xffffff,
      withCollider: boolean = true
    ) => {
      let key = SPRITE_TREE_OAK_1;
      if (variant === 'oak2') key = SPRITE_TREE_OAK_2;
      else if (variant === 'oak3') key = SPRITE_TREE_OAK_3;
      else if (variant === 'dead') key = SPRITE_TREE_DEAD;
      else if (variant === 'hollow') key = SPRITE_HOLLOW_TREE;

      const tree = this.scene.add.image(x, y, key);
      const finalScale = variant === 'dead' ? scale * 1.05 : scale;
      tree.setScale(finalScale);
      tree.setOrigin(0.5, 0.88);
      if (tint !== 0xffffff) {
        tree.setTint(tint);
      }
      tree.setDepth(y);
      this.registerCullable(tree, x, y, 80);
      this.treeCanopyGroup.add(tree);

      if (withCollider) {
        const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        const bw = variant === 'hollow' ? 24 : 18;
        const bh = 12;
        (body.body as Phaser.Physics.Arcade.Body).setSize(bw, bh);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-bw / 2, -bh / 2);
      }
    };

    const placeBush = (x: number, y: number, scale: number = 1.0, tint: number = 0xffffff) => {
      const bushKey = Math.floor(x + y) % 2 === 0 ? SPRITE_BUSH_DENSE_1 : SPRITE_BUSH_DENSE_2;
      const bush = this.scene.add.image(x, y, bushKey);
      bush.setScale(scale);
      bush.setOrigin(0.5, 0.85);
      if (tint !== 0xffffff) {
        bush.setTint(tint);
      }
      bush.setDepth(y);
      this.registerCullable(bush, x, y, 40);
    };

    // =========================================================================
    // 1. DẢI RỪNG BIÊN GIỚI PHÍA BẮC (North Woodland Rim: y = 30..78)
    // =========================================================================
    const northRimTrees: Array<{ x: number; y: number; v: 'oak1' | 'oak2' | 'oak3' | 'dead' | 'hollow'; s: number; t: number; c: boolean }> = [
      { x: 504, y: 64, v: 'oak2', s: 1.08, t: 0xc8d6c2, c: true },
      { x: 556, y: 44, v: 'oak1', s: 1.15, t: 0xb8ccb2, c: false },
      { x: 604, y: 68, v: 'oak3', s: 0.94, t: 0xd4e2ce, c: true },
      // Cụm cây cổ thụ xen giữa Nhà Edda (648..760) và Nhà Neris (914..1026)
      { x: 794, y: 54, v: 'oak1', s: 1.12, t: 0xc2d4bc, c: true },
      { x: 846, y: 38, v: 'oak3', s: 0.96, t: 0xb0c4aa, c: false },
      { x: 886, y: 64, v: 'oak2', s: 0.92, t: 0xd0dec8, c: true },
      // Cụm rừng rậm phía Đông-Bắc sau Nhà Neris kéo dài tới Cổng Đông
      { x: 1068, y: 58, v: 'oak2', s: 1.05, t: 0xc8d8c0, c: true },
      { x: 1126, y: 42, v: 'oak1', s: 1.18, t: 0xb4c8ae, c: false },
      { x: 1184, y: 72, v: 'oak3', s: 0.95, t: 0xcadac4, c: true },
      { x: 1246, y: 48, v: 'oak1', s: 1.14, t: 0xaec2a8, c: false },
      { x: 1308, y: 74, v: 'dead', s: 1.05, t: 0xb8c0b8, c: true },
      { x: 1364, y: 52, v: 'oak2', s: 1.16, t: 0xa8bc9e, c: false },
      { x: 1424, y: 76, v: 'oak3', s: 1.02, t: 0xb8ccb0, c: true },
      { x: 1492, y: 50, v: 'oak1', s: 1.20, t: 0x9eb296, c: false },
      { x: 1554, y: 72, v: 'oak2', s: 1.10, t: 0xa4b89c, c: false }
    ];
    for (const tr of northRimTrees) {
      placeVariantTree(tr.x, tr.y, tr.v, tr.s, tr.t, tr.c);
    }

    // =========================================================================
    // 2. CỤM CÂY CẢNH QUAN QUANH NHÀ & VEN QUẢNG TRƯỜNG (Tránh hoàn toàn đường đi & mỏ tài nguyên)
    // =========================================================================
    const villageInteriorTrees: Array<{ x: number; y: number; v: 'oak1' | 'oak2' | 'oak3' | 'dead' | 'hollow'; s: number; t: number }> = [
      // Giữa Trạm Gác Cổng Tây và Nhà Edda (phía Bắc đường Tây, cách xa mỏ nhựa cây 640,185)
      { x: 594, y: 144, v: 'oak3', s: 0.86, t: 0xdce8d4 },
      // Giữa sân Nhà Edda và Tháp Chuông
      { x: 782, y: 162, v: 'oak2', s: 0.88, t: 0xd4e2cc },
      // Phía Đông Nhà Thảo Mộc Neris (phía Bắc đường Đông, cách xa mỏ thảo mộc 1040,180)
      { x: 1106, y: 148, v: 'oak1', s: 0.98, t: 0xc8d8c2 },
      { x: 1172, y: 186, v: 'oak3', s: 0.90, t: 0xd2e0ca },
      { x: 1244, y: 152, v: 'hollow', s: 1.05, t: 0xc4d0be },
      // Bìa rừng phía Bắc hành lang Cổng Đông (y <= 215, không chạm đường Đông y=250..315)
      { x: 1322, y: 192, v: 'oak2', s: 1.04, t: 0xb8ccb0 },
      { x: 1388, y: 168, v: 'oak1', s: 1.12, t: 0xaec2a6 },
      { x: 1442, y: 204, v: 'dead', s: 0.95, t: 0xbac2b8 },
      { x: 1538, y: 206, v: 'oak3', s: 1.02, t: 0xa4b89e },

      // Khu vực Tây-Nam (quanh Nhà Tây-Nam, cách xa mỏ đá lửa 620,350 và mỏ thảo mộc 740,440)
      { x: 498, y: 342, v: 'oak3', s: 0.92, t: 0xcadac2 },
      { x: 668, y: 472, v: 'oak2', s: 0.94, t: 0xcfdcc8 },
      { x: 842, y: 468, v: 'oak3', s: 0.88, t: 0xd4e0ce },

      // Khu vực Đông-Nam & Nam hành lang Cổng Đông (y >= 355, cách xa mỏ gỗ 1120,380)
      { x: 1184, y: 438, v: 'oak1', s: 1.04, t: 0xc2d4bc },
      { x: 1252, y: 382, v: 'oak3', s: 0.92, t: 0xc8d8c0 },
      { x: 1326, y: 424, v: 'oak2', s: 1.08, t: 0xb6caa8 },
      { x: 1392, y: 368, v: 'dead', s: 1.00, t: 0xb8c0b8 },
      { x: 1448, y: 406, v: 'hollow', s: 1.08, t: 0xb2c2aa },
      { x: 1534, y: 374, v: 'oak1', s: 1.08, t: 0xa2b69a }
    ];
    for (const tr of villageInteriorTrees) {
      placeVariantTree(tr.x, tr.y, tr.v, tr.s, tr.t, true);
    }

    // =========================================================================
    // 3. DẢI RỪNG BIÊN GIỚI PHÍA NAM (South Woodland Rim: y = 504..542)
    // =========================================================================
    const southRimTrees: Array<{ x: number; y: number; v: 'oak1' | 'oak2' | 'oak3' | 'dead'; s: number; t: number }> = [
      { x: 518, y: 514, v: 'oak1', s: 1.12, t: 0xb4c8ae },
      { x: 586, y: 528, v: 'oak3', s: 0.98, t: 0xc2d4bc },
      { x: 654, y: 512, v: 'oak2', s: 1.08, t: 0xb8ccb0 },
      { x: 728, y: 526, v: 'oak1', s: 1.14, t: 0xaec2a8 },
      { x: 804, y: 514, v: 'oak3', s: 0.96, t: 0xc4d6be },
      { x: 882, y: 528, v: 'oak2', s: 1.10, t: 0xb6caa8 },
      { x: 958, y: 510, v: 'oak1', s: 1.12, t: 0xb0c4aa },
      { x: 1038, y: 526, v: 'oak3', s: 1.00, t: 0xbcccb4 },
      { x: 1118, y: 514, v: 'oak2', s: 1.08, t: 0xb2c6ac },
      { x: 1198, y: 528, v: 'dead', s: 1.10, t: 0xb4bcb4 },
      { x: 1276, y: 512, v: 'oak1', s: 1.16, t: 0xa6ba9e },
      { x: 1358, y: 526, v: 'oak2', s: 1.10, t: 0xa2b69a },
      { x: 1436, y: 510, v: 'oak3', s: 1.04, t: 0x9eb296 },
      { x: 1512, y: 524, v: 'oak1', s: 1.18, t: 0x96aa90 }
    ];
    for (const tr of southRimTrees) {
      placeVariantTree(tr.x, tr.y, tr.v, tr.s, tr.t, false);
    }

    // =========================================================================
    // 4. BỤI RẬM, CÀNH CÂY KHÔ, DƯƠNG XỈ & HOA RỪNG TỰ NHIÊN QUANH LÀNG
    // =========================================================================
    const bushPlacements: Array<{ x: number; y: number; s: number; t: number }> = [
      { x: 496, y: 178, s: 0.85, t: 0xc8dac2 },
      { x: 618, y: 122, s: 0.82, t: 0xd4e4ce },
      { x: 774, y: 104, s: 0.80, t: 0xd4e4ce },
      { x: 896, y: 86, s: 0.85, t: 0xcadac4 },
      { x: 1048, y: 94, s: 0.88, t: 0xc8dac2 },
      { x: 1084, y: 162, s: 0.84, t: 0xc4d6be },
      { x: 1204, y: 204, s: 0.92, t: 0xb8ccb0 },
      { x: 1352, y: 214, s: 0.95, t: 0xaec2a6 },
      { x: 1418, y: 222, s: 0.88, t: 0xa8bc9e },
      { x: 1518, y: 224, s: 0.92, t: 0x9eb296 },
      { x: 510, y: 312, s: 0.84, t: 0xcadac4 },
      { x: 638, y: 444, s: 0.88, t: 0xc8dac2 },
      { x: 878, y: 452, s: 0.84, t: 0xcfdcc8 },
      { x: 1018, y: 468, s: 0.82, t: 0xc8dac2 },
      { x: 1152, y: 466, s: 0.90, t: 0xc2d4bc },
      { x: 1288, y: 356, s: 0.88, t: 0xb8ccb0 },
      { x: 1416, y: 348, s: 0.94, t: 0xaec2a6 },
      { x: 1516, y: 344, s: 0.96, t: 0x9eb296 }
    ];
    for (const bp of bushPlacements) {
      placeBush(bp.x, bp.y, bp.s, bp.t);
    }

    // 5. Cành cây khô, khúc gỗ mục phủ rêu & cụm hoa/cỏ ven rừng (1 đối tượng Graphics nhẹ duy nhất ở depth -90)
    const floorFlora = this.scene.add.graphics();
    const fallenBranches = [
      { x: 590, y: 164, w: 16, h: 4 },
      { x: 806, y: 174, w: 14, h: 3 },
      { x: 1138, y: 196, w: 18, h: 4 },
      { x: 1268, y: 218, w: 20, h: 4 },
      { x: 1396, y: 230, w: 18, h: 4 },
      { x: 1364, y: 340, w: 20, h: 4 },
      { x: 1218, y: 352, w: 16, h: 4 },
      { x: 684, y: 458, w: 18, h: 4 }
    ];
    for (const fb of fallenBranches) {
      floorFlora.fillStyle(0x0a0e0c, 0.4);
      floorFlora.fillRect(fb.x - 1, fb.y + 2, fb.w + 2, fb.h);
      floorFlora.fillStyle(0x4a321f, 1);
      floorFlora.fillRect(fb.x, fb.y, fb.w, fb.h);
      floorFlora.fillStyle(0x63442b, 1);
      floorFlora.fillRect(fb.x + 2, fb.y, fb.w - 4, 1);
      // Rêu xanh bám trên khúc gỗ mục
      floorFlora.fillStyle(0x3b5e31, 1);
      floorFlora.fillRect(fb.x + 4, fb.y + 1, 6, 2);
    }
    floorFlora.setDepth(-90);
  }

  /**
   * C4-12-18A (Mục 2F): Hiệu ứng sương mù khí quyển nhiều tầng dọc theo ranh giới tiếp giáp rừng
   * của làng Bellhollow, dày và tối dần về phía lối vào rừng Outer Woods (Cổng Đông x: 1300..1600).
   * Tái sử dụng hoàn toàn texture SPRITE_FOG_SMOOTH (512×256) sẵn có, tuyệt đối không vẽ lại mỗi frame.
   */
  private createBellhollowBoundaryFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addBoundaryMist = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      _depth: number = -65,
      driftX: number = 22,
      duration: number = 7200
    ) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(scaleX, scaleY);
      mist.setAlpha(alpha);
      mist.setTint(tint);
      mist.setDepth(-65); // C4-12-30: Sương mù ranh giới ở depth -65 (trên nền đất, tuyệt đối không che người chơi, NPC, bảng tên hay tương tác)
      this.registerCullable(mist, x, y, 120);

      if (this.scene.tweens && driftX > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + driftX,
          alpha: Math.max(0.08, alpha - 0.06),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // 1. Lớp sương mù nhẹ phảng phất dọc bìa rừng phía Bắc (y ~ 18..48) & phía Nam (y ~ 515..555)
    // Giữ vùng Quảng Trường Trung Tâm (x: 640..1080, y: 90..440) hoàn toàn trong trẻo, sắc nét!
    addBoundaryMist(640, 22, 1.15, 0.55, 0.20, 0x8ea39b, 600, 18, 6800);
    addBoundaryMist(980, 18, 1.25, 0.55, 0.22, 0x829992, 600, 24, 7600);
    addBoundaryMist(1320, 26, 1.30, 0.65, 0.28, 0x5c706b, 600, 20, 7100);

    addBoundaryMist(660, 535, 1.20, 0.60, 0.22, 0x829992, 600, 20, 7400);
    addBoundaryMist(1020, 540, 1.25, 0.60, 0.24, 0x768c86, 600, 22, 7900);
    addBoundaryMist(1360, 530, 1.30, 0.68, 0.30, 0x4f615d, 600, 18, 6900);

    // 2. C4-13-06: Sương mù ranh giới Cổng Tây được hòa trộn mềm mịn (BlendMode SCREEN, loại bỏ khối elip xám bất thường)
    // Giữ vùng giao cắt Cổng Tây tự nhiên, không tạo hình thoi/viên nang xám trên thảm cỏ
    addBoundaryMist(480, 140, 1.10, 0.45, 0.12, 0x5c706b, 580, 10, 6400);
    addBoundaryMist(480, 360, 1.10, 0.45, 0.12, 0x5c706b, 580, 10, 6600);

    // 3. Màn sương rừng dày và tối dần về phía Lối Vào Rừng Outer Woods (Cổng Đông x: 1280..1620)
    // Tầng ngoài (x ~ 1320): sương xám lục nhạt bắt đầu phủ lên đường rừng
    addBoundaryMist(1330, 175, 0.90, 0.85, 0.24, 0x526662, 590, 16, 6500);
    addBoundaryMist(1330, 395, 0.90, 0.85, 0.24, 0x526662, 590, 16, 6700);

    // Tầng giữa quanh Cổng Đông "Rừng Ngoại Vi →" (x ~ 1460..1500): sương rừng sẫm màu bao quanh vòm cổng
    addBoundaryMist(1465, 185, 0.95, 0.95, 0.34, 0x2c3b39, 610, 14, 5800);
    addBoundaryMist(1465, 385, 0.95, 0.95, 0.34, 0x2c3b39, 610, 14, 6100);
    addBoundaryMist(1510, 280, 0.82, 0.78, 0.28, 0x23302e, 615, 12, 5400);

    // Tầng sâu sát vạch chuyển vùng Outer Woods / The Crooked Path (x ~ 1575..1620): sương đêm dày & tối thẫm
    addBoundaryMist(1585, 210, 0.95, 1.05, 0.46, 0x141d1c, 620, 10, 5200);
    addBoundaryMist(1585, 355, 0.95, 1.05, 0.46, 0x141d1c, 620, 10, 5500);
    addBoundaryMist(1610, 280, 0.88, 0.95, 0.52, 0x0d1413, 625, 8, 4900);
  }

  /**
   * C4-13-06: Khởi tạo tảng đá / Cột mốc đá cổ pixel art sắc nét, thay thế hoàn toàn khối elip xám giữ chỗ.
   * Đồng bộ bóng đổ mờ mịn (alpha 0.25) và hitbox vật lý ẩn chuẩn xác.
   */
  private createRock(x: number, y: number, w: number, h: number): void {
    // C4-132-03: Vùng cấm rải chướng ngại vật ngẫu nhiên (Exclusion Zone bán kính 220px quanh tâm Miếu Chuông Vỡ 4500, 250)
    // đảm bảo tuyệt đối không có tảng đá lớn (rock_large) hay đá trung đè chồng lên giữa Miếu Chuông Vỡ
    if (Math.hypot(x + w / 2 - 4500, y + h / 2 - 250) < 220) {
      return;
    }

    // 1. Bóng đổ mặt đất mịn màng (alpha 0.25) ôm sát chân đá
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillEllipse(x + w / 2, y + h - 1, Math.max(w * 0.9, 20), Math.max(h * 0.42, 8));
    shadow.setDepth(y + h - 2);
    this.registerCullable(shadow, x + w / 2, y + h / 2, Math.max(w, h));

    // 2. Sprite tảng đá Pixel Art sắc nét
    const isLarge = w >= 48 || h >= 30;
    const spriteKey = isLarge ? SPRITE_ROCK_LARGE : SPRITE_ROCK_MEDIUM;

    if (this.scene.textures && this.scene.textures.exists(spriteKey)) {
      const rockImg = this.scene.add.image(x + w / 2, y + h - 2, spriteKey);
      rockImg.setOrigin(0.5, 0.88);
      // Cân đối scale theo kích thước mong muốn của ô (khớp tỷ lệ pixel art chuẩn)
      const baseW = isLarge ? 64 : 48;
      const baseH = isLarge ? 48 : 40;
      const targetScale = Math.max(0.75, Math.min(1.4, Math.max(w / baseW, h / baseH)));
      rockImg.setScale(targetScale);
      rockImg.setDepth(y + h);
      this.registerCullable(rockImg, x + w / 2, y + h / 2, Math.max(w, h));
    } else {
      // Fallback đồ họa nhiều lớp vân đá pixel art (không dùng elip xám đơn sắc)
      const rock = this.scene.add.graphics();
      // Khối thân đá chính màu xám hoa cương
      rock.fillStyle(0x384145, 1);
      rock.fillRoundedRect(x + 2, y + 2, w - 4, h - 4, 6);
      // Mảng vân sáng góc trên
      rock.fillStyle(0x56656a, 1);
      rock.fillRoundedRect(x + 4, y + 3, w * 0.6, h * 0.45, 4);
      // Đốm rêu xanh tự nhiên trên lưng đá
      rock.fillStyle(0x27ae60, 0.7);
      rock.fillRect(x + 6, y + 4, Math.max(6, w * 0.25), 3);
      rock.fillStyle(0x1e8449, 0.8);
      rock.fillRect(x + 8, y + 7, Math.max(4, w * 0.2), 2);
      rock.setDepth(y + h);
      this.registerCullable(rock, x + w / 2, y + h / 2, Math.max(w, h));
    }

    // 3. Vật thể va chạm Arcade Physics hoàn toàn vô hình
    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    const body = this.colliderGroup.create(x + w / 2, y + h / 2, dummyKey) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    body.setAlpha(0);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.82, h * 0.68);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.41, -h * 0.34);
  }

  private createMireWater(x: number, y: number, w: number, h: number): void {
    const water = this.scene.add.graphics();
    water.fillStyle(0x0e1716, 0.95);
    water.fillEllipse(x + w / 2, y + h / 2, w, h);
    water.lineStyle(2, 0x192e27, 0.8);
    water.strokeEllipse(x + w / 2, y + h / 2, w, h);
    water.setDepth(-80);
    this.registerCullable(water, x + w / 2, y + h / 2, Math.max(w, h));

    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.85, h * 0.8);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.425, -h * 0.4);
  }

  /**
   * C4-12-24: Tạo Cột Đá Cổ Ngữ tương tác với vòng hào quang và hiệu ứng ánh sáng động.
   */
  private createRunestonePillar(x: number, y: number, runeName: string, glowColor: number): void {
    let pillarKey = SPRITE_PILLAR_MOON;
    let pillarId = 'pillar_moon';
    let color = glowColor || 0x5dade2;

    if (runeName.includes('Rễ') || runeName.includes('Root')) {
      pillarKey = SPRITE_PILLAR_ROOT;
      pillarId = 'pillar_root';
      color = glowColor || 0x58d68d;
    } else if (runeName.includes('Mắt') || runeName.includes('Eye')) {
      pillarKey = SPRITE_PILLAR_EYE;
      pillarId = 'pillar_eye';
      color = glowColor || 0xaf7ac5;
    }

    if (this.runestoneVisuals.has(pillarId)) {
      return;
    }

    // 1. Vòng hào quang chân đế & ký hiệu cổ ngữ
    const glowGraphics = this.scene.add.graphics();
    glowGraphics.fillStyle(color, 0.22);
    glowGraphics.fillEllipse(x, y + 4, 34, 15);
    glowGraphics.fillCircle(x, y - 28, 10);
    glowGraphics.setDepth(y - 2);

    // Hiệu ứng thở nhẹ nhàng khi ở trạng thái nghỉ
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: glowGraphics,
        alpha: 0.38,
        duration: 1800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 2. Tia sáng năng lượng thiên giới vươn lên khi kích hoạt
    const beamGraphics = this.scene.add.graphics();
    beamGraphics.setDepth(650);
    beamGraphics.setAlpha(0);

    // 3. Sprite Cột Đá Cổ Ngữ (pixel art sắc nét)
    const pillar = this.safeAddImage(x, y, pillarKey);
    pillar.setOrigin(0.5, 0.85);
    pillar.setDepth(y);
    this.registerCullable(pillar, x, y, 60);
    this.registerCullable(glowGraphics, x, y, 60);
    this.registerCullable(beamGraphics, x, y, 60);

    // 4. Khối va chạm chân cột (18×14 px) - C4-13-19: Nhỏ gọn đúng bằng bệ đá, giải phóng lối đi xung quanh
    const body = this.colliderGroup.create(x, y - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);

    // 5. Đăng ký vào sổ lưu trữ visual của WorldBuilder
    const entry: RunestoneVisualEntry = {
      id: pillarId,
      name: runeName,
      x,
      y,
      glowColor: color,
      sprite: pillar,
      glowGraphics,
      beamGraphics,
      isLit: false
    };
    this.runestoneVisuals.set(pillarId, entry);

    // Nếu câu đố đã giải từ trước (Savegame), khôi phục trạng thái phát sáng rực rỡ
    const isAlreadySolved = PlayerState.getInstance().hasFlag('mire_pillars_solved');
    if (isAlreadySolved) {
      this.setPillarLit(pillarId, true, false);
    }
  }

  /**
   * C4-12-24: Cập nhật trạng thái hiển thị phát sáng tức thì cho Cột Đá Cổ Ngữ.
   */
  public setPillarLit(pillarId: string, isLit: boolean, isFailed: boolean = false): void {
    const entry = this.runestoneVisuals.get(pillarId);
    if (!entry) return;

    entry.isLit = isLit;

    if (isFailed) {
      // Phản hồi lỗi: chớp đỏ và rung nhẹ
      entry.glowGraphics.clear();
      entry.glowGraphics.fillStyle(0xe74c3c, 0.85);
      entry.glowGraphics.fillEllipse(entry.x, entry.y + 4, 38, 18);
      entry.glowGraphics.fillCircle(entry.x, entry.y - 28, 16);
      entry.beamGraphics.setAlpha(0);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: entry.sprite,
          x: entry.x + 3,
          duration: 40,
          yoyo: true,
          repeat: 4,
          onComplete: () => {
            entry.sprite.x = entry.x;
            this.setPillarLit(pillarId, false, false);
          }
        });
      }
      return;
    }

    if (isLit) {
      // Hào quang sáng rực rỡ khi kích hoạt đúng thứ tự
      entry.glowGraphics.clear();
      entry.glowGraphics.fillStyle(entry.glowColor, 0.85);
      entry.glowGraphics.fillEllipse(entry.x, entry.y + 4, 40, 18);
      entry.glowGraphics.fillCircle(entry.x, entry.y - 28, 15);
      entry.glowGraphics.lineStyle(2, 0xffffff, 0.9);
      entry.glowGraphics.strokeCircle(entry.x, entry.y - 28, 15);

      // Cột tia sáng năng lượng
      entry.beamGraphics.clear();
      entry.beamGraphics.fillStyle(entry.glowColor, 0.45);
      entry.beamGraphics.fillRect(entry.x - 3, entry.y - 75, 6, 50);
      entry.beamGraphics.fillStyle(0xffffff, 0.75);
      entry.beamGraphics.fillRect(entry.x - 1, entry.y - 75, 2, 50);
      entry.beamGraphics.setAlpha(1);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: entry.beamGraphics,
          alpha: 0.65,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      // Trạng thái nghỉ ban đầu
      entry.glowGraphics.clear();
      entry.glowGraphics.fillStyle(entry.glowColor, 0.22);
      entry.glowGraphics.fillEllipse(entry.x, entry.y + 4, 34, 15);
      entry.glowGraphics.fillCircle(entry.x, entry.y - 28, 10);
      entry.beamGraphics.clear();
      entry.beamGraphics.setAlpha(0);
    }
  }

  /**
   * C4-12-24: Đặt lại trạng thái hào quang của tất cả các Cột Đá khi chọn sai thứ tự.
   */
  public resetAllPillars(): void {
    for (const [id] of this.runestoneVisuals) {
      this.setPillarLit(id, false, false);
    }
  }

  /**
   * C4-12-24: Kích hoạt toàn bộ hiệu ứng chúc mừng khi giải mã thành công Ba Cột Đá.
   */
  public triggerRunePuzzleSolvedCelebration(): void {
    for (const [id] of this.runestoneVisuals) {
      this.setPillarLit(id, true, false);
    }

    if (this.centralAltarGlow) {
      this.centralAltarGlow.clear();
      this.centralAltarGlow.fillStyle(0x38d8a2, 0.85);
      this.centralAltarGlow.fillEllipse(3520, 280, 52, 26);
      this.centralAltarGlow.lineStyle(2, 0xffffff, 0.95);
      this.centralAltarGlow.strokeEllipse(3520, 280, 52, 26);
    }

    if (this.centralAltarBeam) {
      this.centralAltarBeam.clear();
      this.centralAltarBeam.fillStyle(0x38d8a2, 0.5);
      this.centralAltarBeam.fillRect(3520 - 4, 280 - 110, 8, 110);
      this.centralAltarBeam.fillStyle(0xffffff, 0.85);
      this.centralAltarBeam.fillRect(3520 - 2, 280 - 110, 4, 110);
      this.centralAltarBeam.setAlpha(1);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: this.centralAltarBeam,
          alpha: 0.65,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  /**
   * C4-12-24: Tạo Bệ Thờ Trung Tâm Trận Địa (Stone Altar: stone_altar.png, 60×42 px).
   */
  private createStoneAltar(x: number, y: number): void {
    // Bóng bệ thờ trên mặt đá
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x0c1214, 0.6);
    shadow.fillEllipse(x, y + 6, 68, 28);
    shadow.setDepth(y - 2);

    // Hào quang bệ thờ
    this.centralAltarGlow = this.scene.add.graphics();
    this.centralAltarGlow.fillStyle(0x38d8a2, 0.25);
    this.centralAltarGlow.fillEllipse(x, y + 2, 54, 22);
    this.centralAltarGlow.setDepth(y - 1);

    // Cột tia sáng trung tâm (khi giải thành công)
    this.centralAltarBeam = this.scene.add.graphics();
    this.centralAltarBeam.setDepth(600);

    // Sprite Bệ Thờ Cổ (stone_altar.png: 60×42 px)
    const altar = this.safeAddImage(x, y, SPRITE_STONE_ALTAR);
    altar.setOrigin(0.5, 0.78);
    altar.setDepth(y);
    this.registerCullable(altar, x, y, 70);
    this.registerCullable(shadow, x, y, 70);
    this.registerCullable(this.centralAltarGlow, x, y, 70);
    this.registerCullable(this.centralAltarBeam, x, y, 70);

    // C4-13-19: Khối va chạm chân bệ thờ nhỏ gọn (28×14 px), nhân vật đi lại xung quanh hoàn toàn thông thoáng
    const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(28, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-14, -7);

    if (PlayerState.getInstance().hasFlag('mire_pillars_solved')) {
      this.triggerRunePuzzleSolvedCelebration();
    }
  }

  /**
   * C4-12-24: Tạo Bia Đá Cổ Thư Đầm Lầy (Ancient Rune Stele: 3460, 290).
   */
  private createAncientRuneStele(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng bia đá
    g.fillStyle(0x0c1214, 0.55);
    g.fillEllipse(x + 3, y + 14, 26, 10);

    // Thân bia đá cổ
    g.fillStyle(0x28323a, 1);
    g.fillRoundedRect(x - 10, y - 16, 20, 28, 3);
    g.fillStyle(0x3c4954, 1);
    g.fillRoundedRect(x - 8, y - 14, 16, 24, 2);
    g.fillStyle(0x566572, 1);
    g.fillRect(x - 6, y - 12, 12, 4);

    // Ký hiệu khắc cổ ngữ rực sáng mờ
    g.fillStyle(0x5dade2, 0.75);
    g.fillRect(x - 4, y - 4, 8, 2);
    g.fillRect(x - 5, y, 10, 2);
    g.fillRect(x - 3, y + 4, 6, 2);

    g.setDepth(y + 10);

    const body = this.colliderGroup.create(x, y + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(16, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-8, -6);
  }

  /**
   * C4-12-24: Tạo Đỉnh Đá Cổ Nghi Thức (Ancient Stone Brazier).
   */
  private createAncientBrazier(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Chân đế đá
    g.fillStyle(0x0c1214, 0.45);
    g.fillEllipse(x, y + 6, 18, 8);
    g.fillStyle(0x303840, 1);
    g.fillRect(x - 6, y - 10, 12, 16);
    g.fillStyle(0x4a5560, 1);
    g.fillRect(x - 8, y - 14, 16, 5);

    // Than hồng ma mị tím lam
    g.fillStyle(0x8e44ad, 0.65);
    g.fillCircle(x, y - 14, 4);
    g.fillStyle(0xbb86fc, 0.85);
    g.fillCircle(x, y - 15, 2);

    g.setDepth(y + 4);
  }

  /**
   * C4-12-25: Tạo Bệ Thờ Miếu Chuông Vỡ (SPRITE_BROKEN_SHRINE 96×80 px) cùng Bệ Đá Đặt Lưỡi Chuông
   * và quầng sáng đồng vàng lập lòe mời gọi khi chưa thu thập.
   */
  private createShrineAltar(x: number, y: number, w: number, h: number): void {
    // 1. Bóng đổ kiến trúc miếu phế tích
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x0c1014, 0.65);
    shadow.fillEllipse(x + w / 2, y + h - 6, w * 1.15, h * 0.45);
    shadow.setDepth(y - 2);

    // 2. Sprite kiến trúc Miếu Chuông Phế Tích (broken_shrine.png 96×80 px) - Tích hợp quả chuông cổ vỡ bên trong belfry
    const shrine = this.safeAddImage(x + w / 2, y + 20, SPRITE_BROKEN_SHRINE);
    shrine.setOrigin(0.5, 0.82);
    shrine.setDepth(y + h);
    this.registerCullable(shrine, x + w / 2, y + h / 2, Math.max(w, h));
    this.registerCullable(shadow, x + w / 2, y + h - 6, Math.max(w, h));

    // 3. C4-13-19: Khối va chạm chân tường miếu (48×16 px) gọn gàng, giải phóng toàn bộ khoảng sân trước cho nhân vật đi lại
    const body = this.colliderGroup.create(x + w / 2, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(48, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-24, -8);

    // 4. Quầng sáng đồng vàng lập lòe tại bệ đặt Lưỡi Chuông Đồng nếu chưa thu hồi
    if (!PlayerState.getInstance().hasFlag('clapper_collected')) {
      const clapperAura = this.scene.add.graphics();
      clapperAura.fillStyle(0xd4ac0d, 0.35);
      clapperAura.fillCircle(x + w / 2, y + 16, 16);
      clapperAura.fillStyle(0xf39c12, 0.55);
      clapperAura.fillCircle(x + w / 2, y + 16, 9);
      clapperAura.fillStyle(0xfff3a8, 0.85);
      clapperAura.fillCircle(x + w / 2, y + 16, 4);
      clapperAura.setDepth(y + h + 2);
      this.registerCullable(clapperAura, x + w / 2, y + 16, 30);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: clapperAura,
          alpha: 0.45,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  /**
   * C4-12-25: Tạo Cột Đá Miếu Phong Hóa Cổ Kính với chân đế và khối va chạm gọn gàng.
   */
  private createShrinePillar(x: number, y: number): void {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x0e1114, 0.55);
    shadow.fillEllipse(x, y + 6, 32, 14);
    shadow.setDepth(y - 2);

    const pillar = this.scene.add.image(x, y, SPRITE_PILLAR_ROOT);
    pillar.setOrigin(0.5, 0.85);
    pillar.setDepth(y);
    this.registerCullable(pillar, x, y, 40);
    this.registerCullable(shadow, x, y + 6, 40);

    const body = this.colliderGroup.create(x, y - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(20, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-10, -8);
  }

  /**
   * C4-12-25: Tạo Điểm Ẩn Nấp Khối Đá Đổ Nát (shrine_hiding_spot).
   */
  private createHidingRubble(x: number, y: number): void {
    const g = this.scene.add.graphics();
    g.fillStyle(0x0e1114, 0.6);
    g.fillEllipse(x, y + 8, 48, 20);

    g.fillStyle(0x353d45, 1);
    g.fillRoundedRect(x - 22, y - 14, 44, 24, 4);
    g.fillStyle(0x4c5762, 1);
    g.fillRoundedRect(x - 18, y - 11, 36, 18, 2);
    g.fillStyle(0x667482, 1);
    g.fillRect(x - 14, y - 8, 28, 8);

    // Rêu phong xám xanh
    g.fillStyle(0x2e463a, 0.85);
    g.fillRect(x - 16, y - 2, 12, 6);
    g.fillRect(x + 4, y - 6, 10, 5);

    g.setDepth(y + 10);
    this.registerCullable(g, x, y, 40);

    const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(36, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-18, -8);
  }

  /**
   * C4-12-25: Tạo Bia Đá Cổ Miếu Chuông ghi chép lời nguyền Màn Sương.
   */
  private createShrineInscribedStele(x: number, y: number): void {
    const g = this.scene.add.graphics();
    g.fillStyle(0x0e1114, 0.55);
    g.fillEllipse(x + 2, y + 14, 26, 10);

    g.fillStyle(0x2a3138, 1);
    g.fillRoundedRect(x - 10, y - 16, 20, 28, 3);
    g.fillStyle(0x3e4750, 1);
    g.fillRoundedRect(x - 8, y - 14, 16, 24, 2);
    g.fillStyle(0x57636e, 1);
    g.fillRect(x - 6, y - 12, 12, 4);

    // Ký tự cổ ngữ màu đồng ấm
    g.fillStyle(0xd4ac0d, 0.75);
    g.fillRect(x - 4, y - 4, 8, 2);
    g.fillRect(x - 5, y, 10, 2);
    g.fillRect(x - 3, y + 4, 6, 2);

    g.setDepth(y + 10);
    this.registerCullable(g, x, y, 30);

    const body = this.colliderGroup.create(x, y + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(16, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-8, -6);
  }

  /**
   * C4-12-25: Tạo Lớp Sương Mù Khí Quyển Tím Xám Huyền Bí quanh Miếu Chuông.
   */
  private createBrokenBellShrineAtmosphericFog(): void {
    const fogPositions = [
      { x: 4100, y: 150, alpha: 0.16, scale: 2.2 },
      { x: 4300, y: 440, alpha: 0.18, scale: 2.4 },
      { x: 4700, y: 180, alpha: 0.15, scale: 2.2 },
      { x: 4800, y: 420, alpha: 0.20, scale: 2.5 }
    ];

    for (const p of fogPositions) {
      const fog = this.scene.add.image(p.x, p.y, SPRITE_FOG_SMOOTH);
      fog.setTint(0x403d52);
      fog.setAlpha(p.alpha);
      fog.setScale(p.scale);
      fog.setDepth(-65); // C4-12-30: Sương mù ranh giới ở depth -65 (trên nền đất, tuyệt đối không che Miếu Chuông hay Bệ Thờ)
      this.registerCullable(fog, p.x, p.y, 140);

      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: fog,
          x: p.x + 35,
          alpha: p.alpha + 0.08,
          duration: 6500 + Math.random() * 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  private setupZoneColliders(zone: ZoneData): void {
    for (const spec of zone.colliders) {
      if (spec.type === 'boundary') {
        const wall = this.colliderGroup.create(
          spec.x + spec.width / 2, 
          spec.y + spec.height / 2, 
          undefined
        ) as Phaser.Physics.Arcade.Sprite;
        wall.setVisible(false);
        const b = wall.body as Phaser.Physics.Arcade.Body;
        b.setSize(spec.width, spec.height);
        b.setOffset(-spec.width / 2, -spec.height / 2);
      }
    }
  }

  private setupZoneInteractables(zone: ZoneData): void {
    for (const item of zone.interactables) {
      this.interactables.push(item);
    }
  }

  private setupZoneTransitions(zone: ZoneData): void {
    for (const trans of zone.transitions) {
      this.transitions.push(trans);
    }
  }

  /**
   * C4-12-19: Xây dựng bản đồ môi trường chi tiết cho Sanctuary Farm (Nông trại Trú Ẩn).
   * Bố trí kiến trúc gọn gàng, ấm cúng với lối vào rõ ràng, khu sân làm việc trung tâm,
   * mái che sơ chế thảo mộc, nguồn nước/giếng tưới, khu 4 ô đất trồng thảo mộc thông thoáng,
   * hàng rào gỗ và thảm thực vật cây cỏ tự nhiên bao quanh.
   */
  private renderSanctuaryFarmDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Biển Đón Vào Nông Trại Trú Ẩn tại cửa ngõ phía Bắc (615, 590)
    this.createStoneSign(615, 590, 'NÔNG TRẠI TRÚ ẨN');

    // 2. Nhà Kho / Chuồng Trại Nông Trại (x=540, y=680, w=100, h=50)
    this.createFarmBarnStructure(540, 680, 100, 50);

    // 3. Mái Che & Bàn Sơ Chế Thảo Mộc (Herbalist Processing Shelter & Workbench: 685, 625)
    this.createHerbalistProcessingShelter(685, 625);

    // 4. Giếng Nước Nông Trại & Nguồn nước tưới cây (920, 700)
    this.createVillageWell(920, 700);

    // 5. Khu Vườn Dược Sanctuary Terrace (Bờ đá, máng nước, biển đề danh: 730, 625)
    this.createSanctuaryHerbTerrace(730, 625);

    // 6. Rương Trú Ẩn Nông Trại (680, 640)
    this.createChestProp(680, 640);

    // 7. Cụm thùng gỗ, bao tải nông sản, đống củi và xe cút kít (wheelbarrow)
    this.createVillagePropCluster(515, 725, 'barrels');
    this.createVillagePropCluster(650, 715, 'firewood');
    this.createFarmWheelbarrow(615, 710);

    // 8. Hệ thống cột đèn lồng gỗ dẫn hướng ấm áp
    this.createVillageLanternPost(650, 600);
    this.createVillageLanternPost(650, 745);
    this.createVillageLanternPost(740, 715);
    this.createVillageLanternPost(1090, 745);

    // 9. Cây ăn trái & rặng cây xanh tự nhiên bao quanh (chừa trống hoàn toàn 4 ô đất 760..840, 640..690)
    this.createTree(760, 595, 'Cây Ăn Trái Nông Trại');
    this.createTree(850, 595, 'Cây Ăn Trái Nông Trại');
    this.createTree(905, 640, 'Cây Ăn Trái Nông Trại');
    this.createTree(505, 840, 'Cây Bìa Nông Trại');
    this.createTree(505, 960, 'Cây Bìa Nông Trại');

    // 10. Bụi cây rậm và hoa cỏ đồng quê tự nhiên
    this.createDenseBush(520, 770);
    this.createDenseBush(610, 610);
    this.createDenseBush(720, 725);
    this.createDenseBush(880, 660);
    this.createDenseBush(1030, 790);

    // 11. Hàng rào chu vi nông trại & rào bờ ruộng
    this.createFarmPerimeterFences(bounds);
  }

  /**
   * C4-12-17: Bố trí lều trại thợ săn, bếp lửa, đống củi, biển chỉ dẫn và quần thể thông rừng ven cho Outer Woods.
   */
  /**
   * C4-12-20: Xây dựng bản đồ môi trường chi tiết cho Rừng Ngoại Vi (Outer Woods).
   * Không gian khám phá mở với 4 khoảng rừng thưa (Cửa rừng Bắc, Bãi trại thợ săn, Bãi suối rừng, Bãi liễu cổ thụ),
   * đường mòn uốn lượn có tuyến chính và lối rẽ phụ tiếp cận nguồn tài nguyên đầu game (gỗ khô, đá lửa, nhựa cây, thảo mộc),
   * các cụm cây cổ thụ, thân cây đổ có nấm mọc, bụi rậm, đá tảng và lớp sương mù ranh giới nhẹ nhàng.
   */
  private renderOuterWoodsDecorations(_zone: ZoneData): void {

    // 1. Biển Chỉ Dẫn Mộc Mạc tại cửa rừng phía Bắc (1220, 640)
    this.createStoneSign(1220, 640, 'RỪNG NGOẠI VI');

    // 2. Bãi Trại Thợ Săn (Hunter's Camp: 1320..1360, 700..740)
    this.createHunterCampfire(1320, 720);
    this.createHunterLeanToShelter(1350, 690);
    this.createHunterPeltRack(1285, 730);
    this.createVillagePropCluster(1385, 725, 'firewood');
    this.createVillagePropCluster(1275, 710, 'barrels');

    // 3. Hệ thống Cột Đèn Lồng Gỗ Dẫn Hướng
    this.createVillageLanternPost(1210, 600); // Đèn cửa rừng Bắc
    this.createVillageLanternPost(1310, 700); // Đèn bãi trại
    this.createVillageLanternPost(1390, 755); // Đèn ngã rẽ suối rừng
    this.createVillageLanternPost(1270, 825); // Đèn lối rẽ Bãi Liễu

    // 4. Thân Cây Cổ Thụ Đổ (Fallen Logs)
    this.createFallenLog(1190, 670, 48, 12);  // Gần bãi cửa rừng
    this.createFallenLog(1475, 795, 54, -20); // Ven suối rừng
    this.createFallenLog(1220, 955, 62, 8);   // Bãi Liễu cổ thụ phía Nam

    // 5. Cây Rỗng Rừng Ven (Hollow Trees)
    this.createHollowTree(1360, 620, 'Cây Rỗng Rừng Ven');
    this.createHollowTree(1320, 910, 'Cây Rỗng Bãi Liễu');

    // 6. Quần thể Cây Sồi & Thông Cổ Thụ bao quanh viền tự nhiên
    // Phía Bắc (giáp Bellhollow): chừa lối đi 1150..1270
    this.createTree(1140, 585, 'Cây Bìa Bắc Rừng Ven');
    this.createTree(1280, 585, 'Cây Bìa Bắc Rừng Ven');
    this.createTree(1170, 630, 'Cây Thông Ven Làng');
    this.createTree(1450, 650, 'Cây Cổ Thụ Rừng Ven');

    // Phía Tây (giáp Sanctuary Farm): chừa lối mòn 1120, 680..820
    this.createTree(1130, 620, 'Cây Bìa Tây Rừng Ven');
    this.createTree(1135, 870, 'Cây Bìa Tây Rừng Ven');

    // Bãi Liễu Cổ Thụ phía Nam (1260, 890)
    this.createTree(1260, 890, 'Cây Liễu Đại Ngàn Phía Nam');
    this.createTree(1200, 985, 'Cây Cổ Thụ Viền Nam');
    this.createTree(1340, 990, 'Cây Cổ Thụ Viền Nam');
    this.createTree(1460, 985, 'Cây Cổ Thụ Viền Nam');
    this.createTree(1540, 980, 'Cây Cổ Thụ Viền Nam');

    // Phía Đông (giáp biên giới Đường Mòn Quanh Co)
    this.createTree(1530, 630, 'Cây Cổ Thụ Viền Đông');
    this.createTree(1540, 730, 'Cây Cổ Thụ Viền Đông');
    this.createTree(1550, 850, 'Cây Cổ Thụ Viền Đông');

    // Cây bóng mát giữa các khoảng rừng thưa
    this.createTree(1230, 830, 'Cây Sồi Ven Rừng');
    this.createTree(1370, 860, 'Cây Sồi Rừng Ven');
    this.createTree(1490, 880, 'Cây Sồi Ven Suối');

    // 7. Bụi Rậm & Đá Tảng Bờ Suối
    this.createDenseBush(1180, 760);
    this.createDenseBush(1235, 780);
    this.createDenseBush(1350, 780);
    this.createDenseBush(1400, 890);
    this.createDenseBush(1480, 730);
    this.createDenseBush(1510, 830);
    this.createDenseBush(1280, 970);

    this.createRock(1410, 750, 38, 22);
    this.createRock(1450, 840, 32, 18);
    this.createRock(1490, 920, 30, 16);

    // 8. Sương Mù Ranh Giới Nhẹ Nhàng (Boundary Mist)
    this.createOuterWoodsBoundaryFog();
  }

  /**
   * Tạo công trình Nhà Kho / Chuồng Trại Nông Trại (Barn) với khung gỗ sồi và mái lợp rơm rạ rêu phong.
   */
  private createFarmBarnStructure(x: number, y: number, w: number, h: number): void {
    const g = this.scene.add.graphics();
    // Bóng chân tường
    g.fillStyle(0x0a0e0c, 0.55);
    g.fillRoundedRect(x - 4, y + h - 8, w + 8, 16, 4);

    // Khung tường gỗ sẫm màu
    g.fillStyle(0x382417, 1);
    g.fillRect(x, y, w, h);

    // Các cột trụ gỗ sồi chịu lực
    g.fillStyle(0x24170e, 1);
    g.fillRect(x, y, 6, h);
    g.fillRect(x + w / 2 - 3, y, 6, h);
    g.fillRect(x + w - 6, y, 6, h);

    // Nan ván gỗ ngang & cửa đôi nhà kho
    g.fillStyle(0x4a3220, 1);
    for (let py = y + 4; py < y + h - 4; py += 8) {
      g.fillRect(x + 8, py, w - 16, 2);
    }
    // Cửa đôi lớn
    g.fillStyle(0x23160d, 1);
    g.fillRect(x + w / 2 - 16, y + 14, 32, h - 14);
    g.fillStyle(0x5a3e28, 1);
    g.fillRect(x + w / 2 - 14, y + 16, 13, h - 18);
    g.fillRect(x + w / 2 + 1, y + 16, 13, h - 18);

    // Mái ngói rơm rạ rêu phong vươn cao
    g.fillStyle(0x6e4e2a, 1);
    g.fillTriangle(x - 6, y + 6, x + w / 2, y - 26, x + w + 6, y + 6);
    g.fillStyle(0x8a6336, 1);
    g.fillTriangle(x - 2, y + 4, x + w / 2, y - 24, x + w + 2, y + 4);
    // Vệt rêu xanh trên mái
    g.fillStyle(0x3b582b, 0.7);
    g.fillRect(x + 12, y - 8, 20, 6);
    g.fillRect(x + w - 36, y - 4, 18, 5);

    g.setDepth(y + h);
    this.registerCullable(g, x + w / 2, y + h / 2, Math.max(w, h));

    // Collider chân tường
    const colW = w - 8;
    const colH = 22;
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);
  }

  /**
   * Tạo Rương Trú Ẩn Nông Trại (Storage Chest).
   */
  private createChestProp(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng rương
    g.fillStyle(0x0a0e0c, 0.5);
    g.fillEllipse(x + 14, y + 16, 26, 8);

    // Thân rương gỗ nẹp sắt
    g.fillStyle(0x422d1b, 1);
    g.fillRect(x, y, 28, 18);
    g.fillStyle(0x5e4128, 1);
    g.fillRect(x + 2, y + 2, 24, 14);

    // Nắp rương và nẹp sắt đen
    g.fillStyle(0x22272a, 1);
    g.fillRect(x, y + 6, 28, 2);
    g.fillRect(x + 4, y, 3, 18);
    g.fillRect(x + 21, y, 3, 18);

    // Ổ khóa đồng vàng
    g.fillStyle(0xd4ac0d, 1);
    g.fillRect(x + 12, y + 5, 4, 5);

    g.setDepth(y + 18);
    this.registerCullable(g, x + 14, y + 10, 30);

    const body = this.colliderGroup.create(x + 14, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -7);
  }

  /**
   * Tạo bếp lửa trại thợ săn (Campfire) (C4-13-06: Quầng sáng ấm chuyển sắc tự nhiên, bóng đổ mềm mịn).
   */
  private createHunterCampfire(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // 1. Quầng sáng ấm chuyển sắc tự nhiên 3 tầng, không có viền cắt gắt
    g.fillStyle(0xf39c12, 0.06);
    g.fillCircle(x + 18, y + 15, 38);
    g.fillStyle(0xe67e22, 0.12);
    g.fillCircle(x + 18, y + 15, 24);
    g.fillStyle(0xffe082, 0.18);
    g.fillCircle(x + 18, y + 15, 12);

    // 2. Bóng mặt đất mềm mịn dưới đống lửa (alpha 0.25)
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(x + 18, y + 21, 24, 7);

    // 3. Các khúc củi chéo nhau
    g.fillStyle(0x2a1a10, 1);
    g.fillRect(x + 8, y + 12, 20, 6);
    g.fillRect(x + 15, y + 5, 6, 20);

    // 4. Đốm lửa và than hồng
    g.fillStyle(0xd35400, 1);
    g.fillCircle(x + 18, y + 15, 8);
    g.fillStyle(0xf39c12, 1);
    g.fillCircle(x + 18, y + 14, 5);
    g.fillStyle(0xfef9e7, 1);
    g.fillCircle(x + 18, y + 13, 2);

    g.setDepth(y + 18);
    this.registerCullable(g, x + 18, y + 15, 40);

    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: g,
        alpha: 0.82,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    const body = this.colliderGroup.create(x + 18, y + 15, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -8);
  }

  /**
   * Hàng rào gỗ bao quanh đồng ruộng Sanctuary Farm.
   */
  private createFarmPerimeterFences(_bounds: { x: number; y: number; width: number; height: number }): void {
    const addFarmFence = (fx: number, fy: number, withCollider: boolean = true) => {
      const fence = this.scene.add.image(fx, fy, SPRITE_WOODEN_FENCE);
      fence.setOrigin(0, 0.78);
      fence.setDepth(fy);
      this.registerCullable(fence, fx + 23, fy, 40);

      if (withCollider) {
        const body = this.colliderGroup.create(fx + 23, fy - 4, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        (body.body as Phaser.Physics.Arcade.Body).setSize(42, 10);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-21, -5);
      }
    };

    // Hàng rào phía Tây bảo vệ nông trại dọc theo bờ rừng (x = 496, y = 600..980)
    for (let fy = 620; fy < 980; fy += 70) {
      addFarmFence(496, fy, true);
    }

    // Hàng rào ngăn bờ ruộng phía Bắc (wy = 788) chừa lối đi giữa ruộng
    addFarmFence(520, 788, true);
    addFarmFence(568, 788, true);
    addFarmFence(710, 788, true);
    addFarmFence(758, 788, true);
    addFarmFence(806, 788, true);
    addFarmFence(854, 788, true);

    // Hàng rào gỗ nhỏ trang trí bao quanh phía Bắc & Đông Vườn Dược Sanctuary (chừa lối Tây thông thoáng)
    addFarmFence(740, 616, false);
    addFarmFence(788, 616, false);
    addFarmFence(836, 616, false);
    addFarmFence(868, 650, false);
    addFarmFence(868, 700, false);
  }

  /**
   * C4-12-19: Tạo Mái Che & Bàn Sơ Chế Thảo Mộc (Herbalist Processing Shelter & Workbench).
   */
  private createHerbalistProcessingShelter(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng mát dưới mái che
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRoundedRect(x - 6, y + 10, 46, 22, 4);

    // 4 Cột gỗ sồi chịu lực của giàn che (Pergola)
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 2, y - 18, 4, 32);
    g.fillRect(x + 32, y - 18, 4, 32);
    g.fillStyle(0x2d1b13, 1);
    g.fillRect(x + 4, y - 14, 3, 26);
    g.fillRect(x + 28, y - 14, 3, 26);

    // Mái che rơm rạ / ván gỗ nghiêng che nắng mưa
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x - 6, y - 22, 46, 6);
    g.fillStyle(0x795548, 1);
    g.fillRect(x - 4, y - 25, 42, 5);
    g.fillStyle(0xa1887f, 1);
    g.fillRect(x - 2, y - 27, 38, 4);
    // Vệt rêu xanh trên mái
    g.fillStyle(0x388e3c, 0.7);
    g.fillRect(x + 2, y - 24, 10, 3);
    g.fillRect(x + 22, y - 26, 12, 3);

    // Bó thảo dược phơi khô treo lủng lẳng dưới xà mái
    const dryHerbColors = [0x81c784, 0xffd54f, 0xaed581, 0xdce775];
    for (let i = 0; i < 4; i++) {
      g.fillStyle(dryHerbColors[i], 1);
      g.fillRect(x + 3 + i * 8, y - 16, 4, 7);
      g.fillStyle(0x558b2f, 1);
      g.fillRect(x + 4 + i * 8, y - 14, 2, 6);
    }

    // Bàn sơ chế gỗ dày dặn (Workbench)
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x, y + 2, 34, 14);
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x + 2, y + 3, 30, 4);

    // Đạo cụ trên bàn: thớt gỗ, cối chày đá, hũ thuốc hổ phách
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(x + 4, y + 1, 9, 7);
    g.fillStyle(0xb0bec5, 1);
    g.fillRect(x + 16, y, 6, 6);
    g.fillStyle(0xffb74d, 1);
    g.fillRect(x + 24, y - 1, 4, 6);

    g.setDepth(y + 14);
    this.registerCullable(g, x + 17, y, 40);

    // Collider nhẹ cho bàn sơ chế (chỉ chân bàn phía trên để nhân vật đứng trước bàn tương tác mượt mà)
    const body = this.colliderGroup.create(x + 17, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -5);
  }

  /**
   * C4-12-19: Tạo khu vực Vườn Dược Sanctuary Terrace (Bờ đá, máng nước tưới, biển đề danh).
   */
  private createSanctuaryHerbTerrace(x: number, y: number): void {
    const g = this.scene.add.graphics();

    // Máng nước tưới cây bằng gỗ (Water Trough)
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 8, y + 18, 18, 6);

    // Thân máng nước gỗ
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x, y + 4, 16, 12);
    g.fillStyle(0x5d4037, 1);
    g.fillRect(x + 1, y + 5, 14, 10);
    // Nước trong máng xanh ngọc
    g.fillStyle(0x29b6f6, 1);
    g.fillRect(x + 2, y + 6, 12, 7);
    g.fillStyle(0xb3e5fc, 0.8);
    g.fillRect(x + 3, y + 7, 5, 2);

    // Xô múc nước bằng gỗ có quai sắt
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x + 19, y + 7, 8, 9);
    g.fillStyle(0x78909c, 1);
    g.fillRect(x + 20, y + 4, 6, 3);

    // Biển gỗ cắm đầu bờ vườn: "VƯỜN DƯỢC"
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 10, y + 2, 3, 14);
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x - 16, y - 4, 15, 8);
    g.fillStyle(0xa1887f, 1);
    g.fillRect(x - 15, y - 3, 13, 2);

    g.setDepth(y + 12);
    this.registerCullable(g, x + 8, y + 8, 30);
  }

  /**
   * C4-12-19: Tạo Xe Cút Kít Nông Trại (Wheelbarrow) chở nông sản và đất mùn.
   */
  private createFarmWheelbarrow(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng xe
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 8, y + 10, 20, 6);

    // Bánh xe gỗ đơn
    g.fillStyle(0x261c14, 1);
    g.fillRect(x - 4, y + 4, 4, 8);
    // Thân thùng xe gỗ
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x, y + 2, 18, 9);
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x + 2, y + 3, 14, 6);
    // Đất mùn và nhánh thảo mộc trong xe
    g.fillStyle(0x271911, 1);
    g.fillRect(x + 3, y + 2, 12, 4);
    g.fillStyle(0x4caf50, 1);
    g.fillRect(x + 5, y, 4, 3);
    g.fillStyle(0x81c784, 1);
    g.fillRect(x + 10, y + 1, 4, 2);
    // Càng xe gỗ
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x + 16, y + 6, 8, 2);
    g.fillRect(x + 16, y + 9, 8, 2);

    g.setDepth(y + 8);
    this.registerCullable(g, x + 8, y + 6, 25);
  }

  /**
   * C4-12-20: Tạo Lều Bạt Dã Ngoại Thợ Săn (Hunter Lean-To Shelter).
   * Khung gỗ cọc chéo, phủ bạt thô màu xám-lục sẫm, đệm rơm rạ và đèn lồng ấm.
   */
  private createHunterLeanToShelter(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ dưới lều
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRoundedRect(x - 4, y + 8, 38, 16, 4);

    // Đệm rơm lót sàn lều
    g.fillStyle(0xb58931, 0.85);
    g.fillRect(x + 2, y + 6, 26, 8);
    g.fillStyle(0x8a631c, 0.7);
    g.fillRect(x + 4, y + 7, 22, 6);

    // 2 Cọc gỗ chống xiên
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 2, y - 14, 4, 26);
    g.fillRect(x + 28, y - 14, 4, 26);

    // Mái bạt thô dốc nghiêng phủ rêu mốc
    g.fillStyle(0x2d3a33, 1);
    g.fillRect(x - 4, y - 16, 38, 6);
    g.fillStyle(0x3e4e45, 1);
    g.fillRect(x - 2, y - 19, 34, 5);
    g.fillStyle(0x4a5d52, 1);
    g.fillRect(x, y - 21, 30, 4);

    // Nếp gấp dây chằng và viền bạt
    g.fillStyle(0x1a241f, 1);
    g.fillRect(x - 2, y - 12, 34, 2);

    g.setDepth(y + 12);
    this.registerCullable(g, x + 15, y, 40);

    const body = this.colliderGroup.create(x + 15, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -6);
  }

  /**
   * C4-12-20: Tạo Giá Phơi Da Thú & Thảo Mộc (Hunter Pelt & Herb Rack).
   */
  private createHunterPeltRack(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 10, y + 14, 20, 6);

    // Khung chữ A gỗ sồi
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x, y - 10, 3, 24);
    g.fillRect(x + 16, y - 10, 3, 24);
    g.fillStyle(0x4e342e, 1);
    g.fillRect(x - 2, y - 6, 23, 3);
    g.fillRect(x - 2, y + 4, 23, 3);

    // Tấm da thú căng dây phơi
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(x + 3, y - 3, 13, 10);
    g.fillStyle(0x8d6e63, 1);
    g.fillRect(x + 5, y - 1, 9, 6);

    // Bó cỏ thơm treo một bên
    g.fillStyle(0x7cb342, 1);
    g.fillRect(x + 17, y - 4, 3, 8);

    g.setDepth(y + 10);
    this.registerCullable(g, x + 10, y, 30);
  }

  /**
   * C4-12-20: Tạo Thân Cây Cổ Thụ Đổ (Fallen Log) phủ rêu và nấm rừng.
   */
  private createFallenLog(x: number, y: number, length: number = 50, angleDeg: number = 0): void {
    const g = this.scene.add.graphics();
    g.save();
    g.translateCanvas(x, y);
    if (angleDeg !== 0) {
      g.rotateCanvas((angleDeg * Math.PI) / 180);
    }

    // Bóng đổ của thân cây
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillRoundedRect(-length / 2, 4, length, 12, 4);

    // Vỏ thân cây gỗ sẫm màu
    g.fillStyle(0x382415, 1);
    g.fillRoundedRect(-length / 2, -5, length, 11, 3);
    g.fillStyle(0x4a3220, 1);
    g.fillRect(-length / 2 + 3, -4, length - 6, 5);

    // Lớp rêu nhung xanh mướt trên lưng thân cây
    g.fillStyle(0x388e3c, 0.9);
    g.fillRect(-length / 2 + 5, -6, length * 0.45, 3);
    g.fillStyle(0x66bb6a, 0.85);
    g.fillRect(-length / 2 + 8, -5, length * 0.35, 2);

    // Cụm nấm sò / nấm mộc nhĩ vàng cam mọc bên sườn cây
    g.fillStyle(0xffb74d, 1);
    g.fillRect(-length / 2 + 18, 3, 5, 3);
    g.fillRect(-length / 2 + 25, 4, 6, 3);
    g.fillStyle(0xfff3e0, 1);
    g.fillRect(-length / 2 + 19, 3, 3, 1);

    g.restore();
    g.setDepth(y + 4);
    this.registerCullable(g, x, y, Math.max(length, 40));

    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(Math.round(length * 0.8), 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-Math.round(length * 0.4), -5);
  }

  /**
   * C4-12-20: Hiệu ứng sương mù khí quyển nhẹ nhàng bao quanh viền Rừng Ngoại Vi (Outer Woods).
   * Giữ 4 khoảng rừng thưa và các điểm mốc định hướng (trại thợ săn, biển chỉ dẫn, lối mòn) hoàn toàn rõ ràng.
   */
  private createOuterWoodsBoundaryFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addMist = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      _depth: number = -65,
      driftX: number = 18,
      duration: number = 7500
    ) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(scaleX, scaleY);
      mist.setAlpha(alpha);
      mist.setTint(tint);
      mist.setDepth(-65); // C4-12-30: Sương mù ranh giới ở depth -65 (trên nền đất, tuyệt đối không che người chơi, NPC, bảng tên hay tương tác)
      this.registerCullable(mist, x, y, 120);

      if (this.scene.tweens && driftX > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + driftX,
          alpha: Math.max(0.06, alpha - 0.05),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // 1. Dải sương mù nhẹ nhàng dọc ranh giới phía Đông (tiếp giáp vùng rừng sâu hiểm trở x: 1540..1590)
    addMist(1560, 640, 0.85, 0.90, 0.22, 0x24352e, 600, 14, 7200);
    addMist(1570, 790, 0.90, 0.95, 0.26, 0x1d2c26, 605, 16, 7800);
    addMist(1560, 940, 0.85, 0.90, 0.24, 0x1a2621, 600, 15, 8200);

    // 2. Dải sương mù viền phía Nam (chân rặng núi đá & cây cổ thụ y: 990..1030)
    addMist(1200, 1010, 1.10, 0.65, 0.24, 0x283832, 600, 18, 7600);
    addMist(1380, 1015, 1.15, 0.65, 0.26, 0x22302b, 600, 20, 8000);
    addMist(1500, 1010, 1.05, 0.65, 0.28, 0x1c2823, 600, 16, 7400);

    // 3. Sương mù mỏng nhẹ phảng phất bên lạch nước rừng phía Đông
    addMist(1470, 870, 0.70, 0.75, 0.18, 0x364843, 595, 12, 6800);
  }

  /**
   * C4-12-21: Xây dựng bản đồ môi trường chi tiết cho phân khu Frontier: Lối Mòn Quanh Co (The Crooked Path).
   * Thiết kế con đường rừng uốn lượn tự nhiên với các khúc cua, khoảng rừng thưa, điểm mốc định hướng (landmarks),
   * ngách khám phá phụ, bố cục rễ cây, cụm cây sồi, tảng đá, gỗ mục và sương mù dẫn hướng người chơi một cách tự nhiên.
   */
  private renderCrookedPathDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Biển Báo & Cột Mốc Định Hướng (Signs & Landmark Totems)
    this.createStoneSign(1660, 320, 'LỐI MÒN QUANH CO');
    this.createStoneSign(2100, 45, 'NGUY HIỂM: RỪNG SÂU');
    this.createStoneMarker(2760, 240); // Cột đá cổ Bắc ngưỡng cửa Đầm Lầy
    this.createStoneMarker(2760, 360); // Cột đá cổ Nam ngưỡng cửa Đầm Lầy

    // 2. Hệ Thống 6 Cột Đèn Lồng Dẫn Hướng Gỗ
    this.createVillageLanternPost(1680, 310); // Đèn ngã ba lối rẽ Outer Woods
    this.createVillageLanternPost(1860, 250); // Đèn bãi cây rỗng 1
    this.createVillageLanternPost(2030, 230); // Đèn ngã rẽ Rừng Sâu
    this.createVillageLanternPost(2170, 260); // Đèn khối đá canh gác
    this.createVillageLanternPost(2330, 360); // Đèn vực rễ cây
    this.createVillageLanternPost(2680, 310); // Đèn ngưỡng cửa đầm lầy

    // 3. Thân Cây Đổ, Rễ Cây Xoắn & Gỗ Mục (Fallen Timber & Tangled Roots)
    this.createFallenLog(1740, 350, 56, 15);   // Thân cây mục bên lối rẽ Outer Woods
    this.createFallenLog(2280, 380, 64, -18);  // Thân sồi bắc qua vực rễ
    this.createFallenLog(2580, 260, 52, 22);   // Cây mục ven bụi rậm đầm lầy
    this.createTangledRoots(1980, 210);        // Cụm rễ cây xoắn gồ ghề ngã ba
    this.createTangledRoots(2420, 330);        // Cụm rễ cây xoắn sườn đồi

    // 4. Nơi Ẩn Nấp & Thân Cây Cổ Thụ Rỗng (Stealth Hiding Spots)
    this.createHollowTree(1900, 180, 'Thân Cây Rỗng (Chỗ trốn)');
    this.createHollowTree(2350, 420, 'Thân Cây Rỗng (Chỗ trốn)');
    this.createDenseBush(1820, 260); // Bụi trốn 1
    this.createDenseBush(2180, 200); // Bụi trốn 2
    this.createDenseBush(2500, 380); // Bụi trốn 3
    this.createDenseBush(1710, 390);
    this.createDenseBush(2010, 160);
    this.createDenseBush(2320, 300);
    this.createDenseBush(2620, 360);

    // 5. Khối Đá Canh Gác Cổ Đại & Đá Tảng (Great Sentinel Rock & Boulders)
    this.createRock(2100, 280, 58, 36); // Great Sentinel Rock
    this.createRock(1790, 220, 38, 22);
    this.createRock(2220, 330, 42, 26);
    this.createRock(2440, 410, 36, 20);
    this.createRock(2720, 270, 40, 24);

    // 6. Bọc Hành Trang Người Đi Rừng (Hunter's Lost Cache)
    this.createHunterLostCache(2650, 260);

    // 7. Quần Thể Cây Sồi & Thông Cổ Thụ Dày Đặc Dọc Viền Bắc/Nam (Natural Boundary Framing)
    // Dàn cây viền phía Bắc (chừa nhánh rẽ Rừng Sâu 2020..2120, y < 50)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 110) {
      if (x < 2010 || x > 2130) {
        this.createTree(x, 100 + ((x % 3) * 20), 'Cây Rừng Cổ Thụ Viền Bắc');
      }
    }

    // Dàn cây viền phía Nam (chừa lối mòn kết nối Outer Woods 1600..1660, y: 440..540)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 115) {
      if (x > 1660) {
        this.createTree(x, 500 + ((x % 2) * 25), 'Cây Rừng Cổ Thụ Viền Nam');
      }
    }

    // 8. Sương Mù Ranh Giới Khí Quyển (Crooked Path Atmospheric Fog)
    this.createCrookedPathAtmosphericFog();
  }

  /**
   * C4-12-21: Tạo Cột Mốc Đá Cổ Ngưỡng Cửa (Weathered Stone Marker).
   */
  private createStoneMarker(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng chân cột đá
    g.fillStyle(0x0a0e0c, 0.45);
    g.fillEllipse(x + 5, y + 16, 22, 8);

    // Thân cột đá obelisk phong rêu sứt mẻ
    g.fillStyle(0x2f353b, 1);
    g.fillRect(x, y - 18, 12, 34);
    g.fillStyle(0x42494f, 1);
    g.fillRect(x + 2, y - 16, 8, 30);
    g.fillStyle(0x5a636a, 1);
    g.fillRect(x + 3, y - 14, 5, 26);

    // Ký hiệu cổ khắc chìm rỉ sáng mờ ảo
    g.fillStyle(0x2ecc71, 0.6);
    g.fillRect(x + 4, y - 6, 3, 10);
    g.fillRect(x + 3, y - 2, 5, 2);

    // Vệt rêu xanh bám chân cột
    g.fillStyle(0x388e3c, 0.85);
    g.fillRect(x + 1, y + 8, 10, 6);

    g.setDepth(y + 16);
    this.registerCullable(g, x + 6, y + 4, 30);

    const body = this.colliderGroup.create(x + 6, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(12, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-6, -5);
  }

  /**
   * C4-12-21: Tạo Cụm Rễ Cây Xoắn Gồ Ghề (Tangled Roots).
   */
  private createTangledRoots(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng rễ cây
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillRoundedRect(x - 14, y + 2, 32, 10, 3);

    // Rễ sồi già gồ lên mặt đất
    g.fillStyle(0x2d1a0e, 1);
    g.fillRect(x - 12, y - 2, 28, 6);
    g.fillRect(x - 8, y - 5, 20, 5);
    g.fillStyle(0x3e2716, 1);
    g.fillRect(x - 10, y - 1, 24, 3);
    g.fillStyle(0x5d3a22, 1);
    g.fillRect(x - 6, y - 4, 16, 2);

    // Rêu ẩm bám kẽ rễ
    g.fillStyle(0x4caf50, 0.8);
    g.fillRect(x - 4, y - 2, 8, 2);

    g.setDepth(y + 4);
    this.registerCullable(g, x, y, 40);
  }

  /**
   * C4-12-21: Tạo Bọc Hành Trang Cũ Của Người Đi Rừng (Hunter's Lost Cache).
   */
  private createHunterLostCache(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng đổ
    g.fillStyle(0x0a0e0c, 0.4);
    g.fillEllipse(x + 6, y + 8, 18, 6);

    // Nan gỗ bánh xe mục vỡ
    g.fillStyle(0x3e2723, 1);
    g.fillRect(x - 6, y - 4, 3, 14);
    g.fillRect(x - 8, y + 2, 16, 2);

    // Túi da cũ kỹ sờn rách
    g.fillStyle(0x5d4037, 1);
    g.fillRoundedRect(x, y - 2, 14, 10, 2);
    g.fillStyle(0x795548, 1);
    g.fillRect(x + 2, y, 10, 5);

    // Khóa kim loại hoen gỉ
    g.fillStyle(0xbcaaa4, 1);
    g.fillRect(x + 6, y + 1, 3, 3);

    g.setDepth(y + 6);
    this.registerCullable(g, x + 6, y + 8, 25);
  }

  /**
   * C4-12-21: Hiệu ứng sương mù khí quyển u ám dọc hai bên viền Đường Mòn Quanh Co (The Crooked Path).
   * Giữ lòng đường mòn và các ngọn đèn lồng rõ nét để người chơi định vị và lẩn trốn.
   */
  private createCrookedPathAtmosphericFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addFog = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      _depth: number = -65,
      driftX: number = 20,
      duration: number = 7400
    ) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(scaleX, scaleY);
      mist.setAlpha(alpha);
      mist.setTint(tint);
      mist.setDepth(-65); // C4-12-30: Sương mù ranh giới ở depth -65 (trên nền đất, tuyệt đối không che người chơi, NPC, bảng tên hay tương tác)
      this.registerCullable(mist, x, y, 120);

      if (this.scene.tweens && driftX > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + driftX,
          alpha: Math.max(0.08, alpha - 0.06),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // Sương mù phía Bắc (dày đặc hướng lên Rừng Sâu)
    addFog(1820, 60, 1.25, 0.65, 0.32, 0x1b2723, 600, 18, 7200);
    addFog(2100, 40, 1.35, 0.70, 0.40, 0x141d1a, 600, 22, 6800);
    addFog(2480, 70, 1.30, 0.65, 0.34, 0x182420, 600, 16, 7600);
    addFog(2800, 65, 1.25, 0.65, 0.35, 0x17221e, 600, 18, 7400);

    // Sương mù phía Nam
    addFog(1940, 560, 1.25, 0.65, 0.30, 0x1d2924, 600, 20, 7800);
    addFog(2360, 570, 1.35, 0.70, 0.34, 0x17231f, 600, 18, 7200);
    addFog(2760, 560, 1.30, 0.65, 0.38, 0x121b18, 600, 16, 7500);

    // Sương mù đầm lầy phía Đông (tiếp giáp Silent Mire tại x ~ 2880)
    addFog(2860, 280, 0.90, 0.95, 0.42, 0x111a17, 605, 14, 6600);
  }

  /**
   * C4-12-22: Xây dựng đạo cụ trang trí và cảnh quan phân khu Rừng Sâu (Deep Forest).
   * Bố cục u tịch, rậm rạp với các hốc cây cổ thụ ẩn nấp, bụi rậm, nấm phát quang,
   * thân sồi mục khổng lồ, ổ đá Kẻ Lắng Nghe và hệ thống 4 cột đèn lồng định hướng.
   */
  private renderDeepForestDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Biển Báo & Cột Mốc Định Hướng (Signs & Landmark Markers)
    this.createStoneSign(2040, -80, 'RỪNG SÂU');
    this.createStoneSign(2340, -490, 'LÃNH ĐỊA KẺ LẮNG NGHE');
    this.createStoneMarker(2840, -220); // Cột đá cổ Bắc ranh giới Đầm Lầy
    this.createStoneMarker(2840, -320); // Cột đá cổ Nam ranh giới Đầm Lầy

    // 2. Hệ Thống 4 Cột Đèn Lồng Dẫn Hướng Gỗ
    this.createVillageLanternPost(2060, -90);  // Đèn cửa rừng phía Nam
    this.createVillageLanternPost(1920, -210); // Đèn ngã rẽ Nấm Phát Quang
    this.createVillageLanternPost(2120, -290); // Đèn bãi Cây Cổ Thụ Đổ Trung Tâm
    this.createVillageLanternPost(2500, -320); // Đèn đường mòn phía Đông

    // 3. Thân Cây Cổ Thụ Đổ, Rễ Cây Xoắn & Gỗ Mục (Fallen Timber & Tangled Roots)
    this.createFallenLog(2120, -340, 72, 10);  // Colossal Fallen Titan Oak
    this.createFallenLog(1880, -200, 50, -25); // Thân cây mục ven bãi nấm
    this.createFallenLog(2260, -280, 58, 20);  // Cây mục khúc quanh phía Đông
    this.createFallenLog(2540, -360, 52, -15); // Cây mục ven ranh giới
    this.createTangledRoots(1960, -180);       // Búi rễ cây xoắn phía Tây
    this.createTangledRoots(2320, -420);       // Búi rễ cây sườn dốc phía Bắc
    this.createTangledRoots(2680, -250);       // Búi rễ cây ven Đầm Lầy

    // 4. Nơi Ẩn Nấp & Thân Cây Cổ Thụ Rỗng (Stealth Hiding Spots vs. The Listener)
    this.createHollowTree(1820, -240, 'Thân Cây Rỗng (Chỗ trốn)');
    this.createHollowTree(2180, -300, 'Cây Đổ Thân Rỗng (Chỗ trốn)');
    this.createHollowTree(2450, -470, 'Thân Cây Rỗng Vực Thẳm (Chỗ trốn)');
    this.createDenseBush(2020, -360); // Bụi trốn trung tâm
    this.createDenseBush(2240, -520); // Bụi trốn vực đá
    this.createDenseBush(2600, -300); // Bụi trốn đầm lầy

    // Các bụi rậm cảnh quan che chắn bổ sung
    this.createDenseBush(1750, -150);
    this.createDenseBush(2100, -420);
    this.createDenseBush(2480, -220);
    this.createDenseBush(2740, -340);

    // 5. Khối Đá & Mỏm Đá Rừng Sâu (Boulders & Rocks)
    this.createRock(2340, -490, 54, 34); // Khối đá ổ Kẻ Lắng Nghe
    this.createRock(1800, -260, 38, 24);
    this.createRock(2080, -360, 44, 28);
    this.createRock(2640, -260, 42, 26);

    // 6. Đạo Cụ Đặc Thù: Cụm Nấm Phát Quang & Ổ Kẻ Lắng Nghe
    this.createBioluminescentMushrooms(1760, -200);
    this.createBioluminescentMushrooms(1840, -260);
    this.createListenerNestClue(2340, -490);

    // 7. Quần Thể Cây Sồi & Thông Cổ Thụ Viền Rừng (Natural Boundary Tree Clusters)
    // Dàn cây viền phía Bắc (wy: -610..-570)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 105) {
      this.createTree(x, -590 + ((x % 3) * 18), 'Cây Rừng Cổ Thụ Viền Bắc');
    }

    // Dàn cây viền phía Tây (wx: 1620..1660)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
      this.createTree(1640 + ((Math.abs(y) % 2) * 20), y, 'Cây Rừng Cổ Thụ Viền Tây');
    }

    // Dàn cây viền phía Đông (wx: 2820..2860, chừa lối sang Đầm Lầy tại y ~ -260..-300)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
      if (y < -330 || y > -210) {
        this.createTree(2840 + ((Math.abs(y) % 2) * 20), y, 'Cây Rừng Cổ Thụ Viền Đông');
      }
    }

    // Dàn cây viền phía Nam (wy: -45..-15, chừa lối thông Crooked Path 2000..2160)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 110) {
      if (x < 1990 || x > 2170) {
        this.createTree(x, -35 + ((x % 2) * 15), 'Cây Rừng Cổ Thụ Viền Nam');
      }
    }

    // 8. Sương Mù Khí Quyển Rừng Sâu (Deep Forest Atmospheric Fog)
    this.createDeepForestAtmosphericFog();
  }

  /**
   * C4-12-22: Tạo Khóm Nấm Rừng Phát Quang (Bioluminescent Mushrooms).
   */
  private createBioluminescentMushrooms(x: number, y: number): void {
    const container = this.scene.add.container(x, y);

    const g = this.scene.add.graphics();
    // Vầng hào quang xanh ngọc mờ ảo
    g.fillStyle(0x1abc9c, 0.22);
    g.fillCircle(0, 0, 20);
    g.fillStyle(0x16a085, 0.35);
    g.fillCircle(0, 2, 12);

    // Thân và mũ nấm tí hon phát quang
    const mushrooms = [
      { ox: -6, oy: 4, r: 4, col: 0x2ecc71 },
      { ox: 0, oy: -2, r: 6, col: 0x1abc9c },
      { ox: 7, oy: 2, r: 5, col: 0x3498db },
      { ox: -2, oy: 8, r: 3, col: 0x5dade2 }
    ];

    for (const m of mushrooms) {
      // Chân nấm
      g.fillStyle(0xd5f5e3, 0.85);
      g.fillRect(m.ox - 1, m.oy + 1, 2, 5);
      // Mũ nấm phát sáng
      g.fillStyle(m.col, 0.95);
      g.fillCircle(m.ox, m.oy, m.r);
      // Chấm sáng lấp lánh trên nón nấm
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(m.ox - 1, m.oy - 2, 2, 2);
    }

    container.add(g);
    container.setDepth(y + 8);
    this.registerCullable(container, x, y, 30);

    // Hiệu ứng thở nhẹ nhàng cho vầng sáng nấm
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: container,
        alpha: 0.65,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * C4-12-22: Tạo Dấu Vết Ổ Đá Kẻ Lắng Nghe (The Listener's Clawed Altar).
   */
  private createListenerNestClue(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Vết cào móng vuốt rướm máu khô trên mỏm đá
    g.fillStyle(0x4a0e17, 0.85);
    g.fillRect(x - 12, y - 10, 2, 14);
    g.fillRect(x - 8, y - 12, 2, 16);
    g.fillRect(x - 4, y - 9, 2, 13);
    g.fillRect(x, y - 11, 2, 15);

    // Mẩu xương khô rải rác
    g.fillStyle(0xdfd8ca, 0.85);
    g.fillRect(x + 8, y + 4, 8, 3);
    g.fillRect(x + 12, y + 2, 2, 7);
    g.fillRect(x - 16, y + 6, 6, 2);

    g.setDepth(y + 12);
    this.registerCullable(g, x, y, 30);
  }

  /**
   * C4-12-22: Sương mù khí quyển u uất của phân khu Rừng Sâu (Deep Forest Atmospheric Fog).
   */
  private createDeepForestAtmosphericFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addFog = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      _depth: number = -65,
      driftX: number = 22,
      duration: number = 7800
    ) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(scaleX, scaleY);
      mist.setAlpha(alpha);
      mist.setTint(tint);
      mist.setDepth(-65); // C4-12-30: Sương mù ranh giới ở depth -65 (trên nền đất, tuyệt đối không che người chơi, NPC, bảng tên hay tương tác)
      this.registerCullable(mist, x, y, 120);

      if (this.scene.tweens && driftX > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + driftX,
          alpha: Math.max(0.08, alpha - 0.08),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // Sương mù đỉnh Bắc (lãnh địa sâu hiểm trở)
    addFog(1840, -560, 1.40, 0.75, 0.38, 0x0f1814, 600, 24, 8200);
    addFog(2180, -580, 1.45, 0.80, 0.42, 0x0a120e, 600, 26, 7600);
    addFog(2540, -560, 1.40, 0.75, 0.40, 0x0d1511, 600, 22, 8000);

    // Sương mù khoảng rừng nấm phía Tây
    addFog(1760, -220, 1.25, 0.70, 0.32, 0x13231c, 600, 18, 7400);

    // Sương mù ranh giới phía Đông (tiếp giáp Silent Mire)
    addFog(2800, -280, 1.30, 0.75, 0.44, 0x0d1410, 600, 20, 7200);
  }

  /**
   * C4-12-23: Xây dựng đạo cụ trang trí và cảnh quan phân khu Đầm Lầy Tĩnh Lặng (Silent Mire).
   * Khắc họa vùng đất ngập nước sương độc ăn mòn tâm trí, gò đất Trận Địa Cổ Ngữ, cầu ván gỗ mục,
   * khối cự thạch chìm, gốc cổ thụ liễu héo tàn và hệ thống 4 cột đèn lồng định hướng.
   */
  private renderSilentMireDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Biển Báo & Cột Mốc Định Hướng (Signs & Landmark Markers)
    this.createStoneSign(2940, 300, 'ĐẦM LẦY TĨNH LẶNG');
    this.createStoneMarker(2900, 250); // Cột đá mốc Tây Bắc
    this.createStoneMarker(2900, 370); // Cột đá mốc Tây Nam
    this.createStoneMarker(3960, 230); // Cột đá mốc Đông Bắc
    this.createStoneMarker(3960, 370); // Cột đá mốc Đông Nam

    // 2. Hệ Thống 4 Cột Đèn Lồng Dẫn Hướng Gỗ
    this.createVillageLanternPost(2940, 290);  // Đèn cửa ngõ phía Tây
    this.createVillageLanternPost(3120, 310);  // Đèn đầu cầu ván gỗ
    this.createVillageLanternPost(3520, 260);  // Đèn tâm bệ đá Cổ Ngữ
    this.createVillageLanternPost(3920, 290);  // Đèn cửa ngõ sang Miếu Chuông

    // 3. Trận Địa 3 Cột Đá Cổ Ngữ & Bệ Thờ Cổ được khởi tạo chi tiết trong phân khu ancient_rune_puzzle
    // (renderAncientRunePuzzleDecorations) đảm bảo tính mô-đun và chống trùng lặp thực thể.

    // 4. Vùng Nước Lầy Sâu & Vực Nước Đen (Murky Deep Water Pools with Colliders)
    this.createMireWater(3200, 250, 180, 90);   // Hố bùn trung tâm
    this.createMireWater(3020, 380, 220, 110);  // Vũng lầy Tây Nam
    this.createMireWater(3180, 140, 200, 85);   // Vũng sụt Bắc
    this.createMireWater(3600, 430, 240, 120);  // Hồ lầy Đông Nam

    // 5. Cầu Ván Gỗ, Khối Cự Thạch Chìm, Cổ Thụ Liễu & Kết Giới Miếu Chuông
    this.createBoardwalkPier(3150, 320);
    this.createSunkenMonolithRuins(3220, 200, 44, 40);
    this.createSunkenMonolithRuins(3720, 390, 48, 42);
    this.createDeadTitanWillow(3560, 160);
    this.createShrineGateWard(3960, 280);

    // 6. Cụm Lau Sậy & Cỏ Lác Đầm Lầy (Cattails & Marsh Reeds)
    this.createCattailsCluster(2980, 290);
    this.createCattailsCluster(3100, 350);
    this.createCattailsCluster(3280, 270);
    this.createCattailsCluster(3450, 410);
    this.createCattailsCluster(3680, 390);
    this.createCattailsCluster(3850, 320);

    // 7. Nơi Ẩn Nấp & Bụi Rậm Đầm Lầy (Stealth Hiding Spots)
    this.createHollowTree(3080, 260, 'Hốc Cây Liễu Mục (Chỗ trốn)');
    this.createDenseBush(3320, 340); // Cụm lau sậy dày đầm lầy
    this.createDenseBush(3760, 320); // Bụi cỏ lác rậm rạp phía Đông

    // Bụi rậm cảnh quan đầm lầy
    this.createDenseBush(2960, 360);
    this.createDenseBush(3380, 180);
    this.createDenseBush(3680, 200);
    this.createDenseBush(3880, 340);

    // 8. Thân Cây Đổ & Búi Rễ Xoắn (Fallen Timber & Tangled Mire Roots)
    this.createFallenLog(3040, 240, 50, -15);
    this.createFallenLog(3720, 350, 54, 20);
    this.createTangledRoots(3300, 230);
    this.createTangledRoots(3700, 260);

    // 9. Quần Thể Cây Liễu Khô & Cây Khẳng Khiu Viền Đầm Lầy (Boundary Trees)
    // Dàn cây viền phía Bắc (wy: 120..150)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 110) {
      this.createTree(x, 130 + ((x % 3) * 16), 'Cây Khô Đầm Lầy Viền Bắc');
    }

    // Dàn cây viền phía Nam (wy: 660..700)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 115) {
      this.createTree(x, 670 + ((x % 2) * 18), 'Cây Khô Đầm Lầy Viền Nam');
    }

    // Dàn cây viền phía Tây (chừa lối vào Crooked Path y: 260..400 và lối Rừng Sâu y: 160..240)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
      if (y < 150 || (y > 235 && y < 265) || y > 400) {
        this.createTree(2900 + ((Math.abs(y) % 2) * 18), y, 'Cây Khô Viền Tây');
      }
    }

    // Dàn cây viền phía Đông (chừa lối sang Miếu Chuông y: 240..400)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
      if (y < 235 || y > 400) {
        this.createTree(3960 + ((Math.abs(y) % 2) * 18), y, 'Cây Khô Viền Đông');
      }
    }

    // 10. Sương Mù Khí Quyển Đầm Lầy (Silent Mire Atmospheric Fog)
    this.createSilentMireAtmosphericFog();
  }

  /**
   * C4-12-24: Xây dựng đạo cụ trang trí và cấu trúc cho Khu Vực Câu Đố Cổ Ngữ (Ancient Rune Puzzle Area).
   * Tạo 3 Cột Đá Cổ Ngữ (pillar_moon, pillar_root, pillar_eye), Bệ Thờ Trung Tâm (stone_altar),
   * Bia Đá Cổ Thư (rune_clue_stele) và 4 Đỉnh Đá Nghi Thức thắp lửa ma mị tím lam.
   */
  private renderAncientRunePuzzleDecorations(_zone: ZoneData): void {
    // 1. Trận Địa 3 Cột Đá Cổ Ngữ
    this.createRunestonePillar(3400, 220, 'Trăng Khuyết', 0x5dade2);
    this.createRunestonePillar(3520, 360, 'Rễ Rừng', 0x58d68d);
    this.createRunestonePillar(3640, 220, 'Con Mắt', 0xaf7ac5);

    // 2. Bệ Thờ Trung Tâm Trận Địa (Stone Altar: stone_altar.png, 60×42 px)
    this.createStoneAltar(3520, 280);

    // 3. Bia Đá Cổ Thư Đầm Lầy (Gợi ý thứ tự giải đố)
    this.createAncientRuneStele(3460, 290);

    // 4. Bốn Đỉnh Đá Nghi Thức (Ancient Stone Braziers) tại 4 góc sân
    this.createAncientBrazier(3380, 260); // Tây
    this.createAncientBrazier(3660, 260); // Đông
    this.createAncientBrazier(3460, 370); // Tây Nam
    this.createAncientBrazier(3580, 370); // Đông Nam
  }

  /**
   * C4-12-25: Xây dựng đạo cụ trang trí và cấu trúc cho phân khu Miếu Chuông Phế Tích (The Broken Bell Shrine).
   * Tạo không gian miếu cổ uy nghiêm với Bệ Thờ Miếu Chuông (broken_shrine, stone_altar),
   * Quả Chuông Cổ Khổng Lồ vỡ rạn nứt, 4 Cột Đá Phế Tích, Bia Đá Cổ Miếu Chuông,
   * Khu ẩn nấp sau phiến đá vỡ & hốc cây cổ miếu, cùng hệ thống 3 cột đèn lồng dẫn hướng.
   */
  private renderBrokenBellShrineDecorations(zone: ZoneData): void {
    const { bounds } = zone;

    // 1. Kiến trúc Miếu Chuông Vỡ & Bệ Thờ Chính (4500, 250)
    // C4-13-19: Quả Chuông Cổ Khổng Lồ vỡ đã được tích hợp trực tiếp bên trong mái vòm miếu cổ (broken_shrine.png),
    // loại bỏ tảng đá đè phía trước và vật thể đồ họa tách rời lơ lửng phía trên nóc miếu.
    this.createShrineAltar(4500, 250, 96, 64);

    // 3. Hệ thống Cột Đá Miếu & Di Tích Phong Hóa
    this.createShrinePillar(4350, 180); // Cột Tây Bắc
    this.createShrinePillar(4650, 180); // Cột Đông Bắc
    this.createShrinePillar(4680, 380); // Cột Đông Nam
    this.createShrinePillar(4320, 380); // Cột Tây Nam

    // 4. Khu Vực Ẩn Nấp Sinh Tồn (Stealth Hiding Spots)
    this.createHidingRubble(4360, 380); // Khối đá đổ nát che chở shrine_hiding_spot
    this.createHollowTree(4140, 190, 'Hốc Cây Cổ Miếu (Chỗ trốn)');
    this.createDenseBush(4180, 360);   // Bụi rậm ngõ Nam
    this.createDenseBush(4730, 350);   // Bụi rậm phía Đông ngoài sân miếu (C4-132-03)

    // 5. Đạo Cụ Kể Chuyện Qua Môi Trường (Environmental Storytelling)
    this.createShrineInscribedStele(4280, 270); // Bia Đá Cổ Miếu Chuông

    // 6. Hệ Thống 3 Cột Đèn Lồng Dẫn Hướng Gỗ / Đá
    this.createVillageLanternPost(4060, 270); // Đèn cửa ngõ ranh giới phía Tây
    this.createVillageLanternPost(4380, 230); // Đèn thềm đá sân miếu Bắc
    this.createVillageLanternPost(4620, 290); // Đèn thềm đá sân miếu Nam

    // 7. Thân Cây Đổ & Búi Rễ Xoắn Cổ Miếu
    this.createFallenLog(4220, 330, 48, -12);
    this.createFallenLog(4620, 390, 52, 15);
    this.createTangledRoots(4420, 190);
    this.createTangledRoots(4580, 190);

    // 8. Quần Thể Cây Khô Viền Miếu Chuông (Boundary Trees)
    // Cây viền phía Bắc (wy: 30..60)
    for (let x = bounds.x + 30; x < bounds.x + bounds.width - 30; x += 105) {
      this.createTree(x, 40 + ((x % 3) * 14), 'Cây Khô Miếu Viền Bắc');
    }

    // Cây viền phía Nam (wy: 550..580)
    for (let x = bounds.x + 30; x < bounds.x + bounds.width - 30; x += 110) {
      this.createTree(x, 560 + ((x % 2) * 16), 'Cây Khô Miếu Viền Nam');
    }

    // Cây viền phía Đông (wx: 4910..4940)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 90) {
      this.createTree(4920 + ((Math.abs(y) % 2) * 16), y, 'Cây Khô Miếu Viền Đông');
    }

    // Cây viền phía Tây (chừa lối vào đầm lầy y: 220..360)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 90) {
      if (y < 210 || y > 370) {
        this.createTree(4010 + ((Math.abs(y) % 2) * 16), y, 'Cây Khô Miếu Viền Tây');
      }
    }

    // 9. Lớp Sương Mù Khí Quyển Miếu Chuông (Atmospheric Fog)
    this.createBrokenBellShrineAtmosphericFog();
  }

  /**
   * C4-12-23: Tạo Cầu Ván Gỗ Mục (Wooden Boardwalk Pier).
   */
  private createBoardwalkPier(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng cầu gỗ trên mặt nước
    g.fillStyle(0x0a100d, 0.5);
    g.fillRoundedRect(x - 30, y - 10, 60, 24, 4);

    // Cọc gỗ cắm sâu dưới nước
    g.fillStyle(0x1e1610, 1);
    g.fillRect(x - 26, y + 2, 5, 14);
    g.fillRect(x + 21, y + 2, 5, 14);
    // Rêu bám mực nước chân cọc
    g.fillStyle(0x2d3a2f, 0.85);
    g.fillRect(x - 26, y + 10, 5, 6);
    g.fillRect(x + 21, y + 10, 5, 6);

    // Dầm đỡ ngang bằng gỗ
    g.fillStyle(0x2f2318, 1);
    g.fillRect(x - 28, y - 4, 56, 5);

    // Mặt sàn ván gỗ mục
    g.fillStyle(0x423525, 1);
    g.fillRect(x - 28, y - 8, 56, 12);

    // Kẽ ghép từng thanh ván gỗ
    g.fillStyle(0x2a1f14, 0.9);
    for (let px = -24; px <= 24; px += 8) {
      g.fillRect(x + px, y - 8, 1, 12);
    }

    // Vân sáng mép ván gỗ
    g.fillStyle(0x5a4a35, 0.8);
    g.fillRect(x - 27, y - 7, 54, 2);

    // Vệt rêu ẩm ướt bám mặt ván
    g.fillStyle(0x3e583c, 0.7);
    g.fillRect(x - 14, y - 4, 8, 3);
    g.fillRect(x + 10, y - 6, 6, 2);

    g.setDepth(y + 12);
    this.registerCullable(g, x, y, 40);
  }

  /**
   * C4-12-23: Tạo Khối Cự Thạch Chìm Phế Tích (Sunken Monolith Ruins).
   */
  private createSunkenMonolithRuins(x: number, y: number, w: number = 44, h: number = 40): void {
    const g = this.scene.add.graphics();
    // Bóng chìm trong bùn nước
    g.fillStyle(0x08100e, 0.6);
    g.fillEllipse(x + w / 2, y + h / 2 + 10, w + 12, h * 0.7);

    // Chân cự thạch chìm ngập trong bùn đen
    g.fillStyle(0x182422, 0.85);
    g.fillRect(x + 2, y + 14, w - 4, h - 14);

    // Viền ngấn nước lầy
    g.fillStyle(0x2d483e, 0.6);
    g.fillRect(x - 2, y + 16, w + 4, 3);

    // Khối đá nổi trên mặt nước
    g.fillStyle(0x323a40, 1);
    g.fillRect(x + 4, y, w - 8, 18);
    g.fillStyle(0x465058, 1);
    g.fillRect(x + 6, y + 2, w - 12, 14);
    g.fillStyle(0x5e6a74, 1);
    g.fillRect(x + 8, y + 2, w - 16, 4);

    // Ký hiệu cổ khắc chìm phát sáng ngọc bích
    g.fillStyle(0x38d8a2, 0.75);
    g.fillRect(x + Math.floor(w / 2) - 2, y + 6, 4, 8);
    g.fillRect(x + Math.floor(w / 2) - 5, y + 8, 10, 2);

    // Rêu phong và tảo bám ngấn nước
    g.fillStyle(0x345a3c, 0.8);
    g.fillRect(x + 4, y + 14, w - 8, 4);

    g.setDepth(y + h);
    this.registerCullable(g, x + w / 2, y + h / 2, Math.max(w, h));

    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.75, h * 0.6);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.375, -h * 0.3);
  }

  /**
   * C4-12-23: Tạo Gốc Cổ Thụ Liễu Héo Tàn (The Dead Titan Willow).
   */
  private createDeadTitanWillow(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Bóng cây khổng lồ trên bùn lầy
    g.fillStyle(0x09100d, 0.55);
    g.fillEllipse(x, y + 22, 54, 18);

    // Búi rễ cây gồ ghề vươn vào nước bùn
    g.fillStyle(0x1c1613, 1);
    g.fillRect(x - 28, y + 12, 20, 6);
    g.fillRect(x + 10, y + 14, 18, 5);
    g.fillStyle(0x284232, 0.7);
    g.fillRect(x - 22, y + 14, 10, 3);

    // Thân cây liễu cổ thụ xoắn ốc
    g.fillStyle(0x251e18, 1);
    g.fillRect(x - 16, y - 26, 32, 44);
    g.fillStyle(0x362c24, 1);
    g.fillRect(x - 12, y - 24, 24, 40);
    g.fillStyle(0x4c3e34, 1);
    g.fillRect(x - 6, y - 22, 12, 34);

    // Hốc rỗng lớn giữa thân cây mục
    g.fillStyle(0x0c0806, 0.95);
    g.fillEllipse(x, y + 4, 14, 18);

    // Các cành liễu khẳng khiu trơ trụi rủ xuống
    g.fillStyle(0x211a15, 1);
    g.fillRect(x - 24, y - 32, 10, 4);
    g.fillRect(x + 14, y - 30, 10, 4);
    g.fillRect(x - 26, y - 28, 3, 22);
    g.fillRect(x - 18, y - 24, 2, 26);
    g.fillRect(x + 18, y - 26, 2, 24);
    g.fillRect(x + 24, y - 24, 3, 20);

    // Các dải địa y / rêu xám rủ lơ lửng
    g.fillStyle(0x526658, 0.65);
    g.fillRect(x - 25, y - 14, 1, 14);
    g.fillRect(x - 17, y - 10, 1, 16);
    g.fillRect(x + 19, y - 12, 1, 14);
    g.fillRect(x + 25, y - 8, 1, 12);

    g.setDepth(y + 24);
    this.registerCullable(g, x, y, 60);

    const body = this.colliderGroup.create(x, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(36, 18);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-18, -9);
  }

  /**
   * C4-12-23: Tạo Cụm Lau Sậy & Cỏ Lác Đầm Lầy (Cattails & Marsh Reeds).
   */
  private createCattailsCluster(x: number, y: number): void {
    const g = this.scene.add.graphics();
    // Vạt nước và bèo tây nhỏ quanh gốc
    g.fillStyle(0x183024, 0.6);
    g.fillEllipse(x - 6, y + 6, 12, 5);
    g.fillEllipse(x + 8, y + 7, 10, 4);

    // Thân lau sậy mảnh mai
    g.fillStyle(0x405c32, 0.9);
    g.fillRect(x - 8, y - 14, 2, 20);
    g.fillRect(x - 3, y - 18, 2, 24);
    g.fillRect(x + 2, y - 16, 2, 22);
    g.fillRect(x + 7, y - 12, 2, 18);

    // Bông cỏ lác hình trụ màu nâu nhung
    g.fillStyle(0x3e2412, 1);
    g.fillRect(x - 8, y - 13, 3, 8);
    g.fillRect(x - 3, y - 17, 3, 9);
    g.fillRect(x + 2, y - 15, 3, 8);
    g.fillRect(x + 7, y - 11, 3, 7);

    // Vệt sáng trên bông cỏ lác
    g.fillStyle(0x613b1e, 0.85);
    g.fillRect(x - 7, y - 12, 1, 6);
    g.fillRect(x - 2, y - 16, 1, 7);

    // Ngọn nhọn trên đầu bông
    g.fillStyle(0x728a52, 0.9);
    g.fillRect(x - 7, y - 16, 1, 3);
    g.fillRect(x - 2, y - 20, 1, 3);
    g.fillRect(x + 3, y - 18, 1, 3);

    g.setDepth(y + 8);
    this.registerCullable(g, x, y, 30);
  }

  /**
   * C4-12-23 & C4-12-28: Tạo Kết Giới Cổng Miếu Phế Tích (Shrine Gate Ward)
   * Tích hợp đầy đủ trụ đá cổ ngữ, collider va chạm vật lý và màn năng lượng rào ấn.
   */
  private createShrineGateWard(x: number, y: number): void {
    this.shrineGateX = x;
    this.shrineGateY = y;

    // 1. Dựng 2 Cột đá phong hóa hai bên lối vào
    this.shrineWardPillarsGfx = this.scene.add.graphics();
    const g = this.shrineWardPillarsGfx;
    g.fillStyle(0x2a3036, 1);
    g.fillRect(x - 6, y - 56, 12, 36);
    g.fillRect(x - 6, y + 20, 12, 36);

    g.fillStyle(0x404850, 1);
    g.fillRect(x - 4, y - 54, 8, 32);
    g.fillRect(x - 4, y + 22, 8, 32);

    g.fillStyle(0x5e6872, 1);
    g.fillRect(x - 2, y - 52, 4, 28);
    g.fillRect(x - 2, y + 24, 4, 28);

    // Điểm nhấn hoa văn cổ ngữ khắc trên thân 2 cột đá
    g.fillStyle(0x8e44ad, 0.7);
    g.fillRect(x - 1, y - 44, 2, 8);
    g.fillRect(x - 1, y + 32, 2, 8);
    g.setDepth(y + 36);
    this.registerCullable(this.shrineWardPillarsGfx, x, y, 70);

    // 2. Tạo vật thể va chạm vật lý (Collider body) hoàn toàn vô hình
    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    this.shrineWardColliderBody = this.colliderGroup.create(x, y, dummyKey) as Phaser.Physics.Arcade.Sprite;
    this.shrineWardColliderBody.setVisible(false);
    this.shrineWardColliderBody.setAlpha(0);
    const body = this.shrineWardColliderBody.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 76);
    body.setOffset(-8, -38);
    body.enable = !this.isShrineWardOpen;
    body.checkCollision.none = this.isShrineWardOpen;

    // 3. Tạo đồ họa màn kết giới trực quan (Visual barrier)
    this.shrineWardVisual = this.scene.add.graphics();
    this.shrineWardVisual.setDepth(y + 38);
    this.renderShrineWardBarrier(x, y, this.isShrineWardOpen);
    this.registerCullable(this.shrineWardVisual, x, y, 70);

    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: this.shrineWardVisual,
        alpha: 0.7,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * C4-12-23: Sương mù khí quyển u ám của phân khu Đầm Lầy Tĩnh Lặng (Silent Mire Atmospheric Fog).
   */
  private createSilentMireAtmosphericFog(): void {
    if (!this.scene.textures.exists(SPRITE_FOG_SMOOTH)) return;

    const addFog = (
      x: number,
      y: number,
      scaleX: number,
      scaleY: number,
      alpha: number,
      tint: number,
      _depth: number = -65,
      driftX: number = 22,
      duration: number = 7600
    ) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(scaleX, scaleY);
      mist.setAlpha(alpha);
      mist.setTint(tint);
      mist.setDepth(-65); // C4-12-30: Sương mù ranh giới ở depth -65 (trên nền đất, tuyệt đối không che người chơi, NPC, bảng tên hay tương tác)
      this.registerCullable(mist, x, y, 120);

      if (this.scene.tweens && driftX > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + driftX,
          alpha: Math.max(0.08, alpha - 0.08),
          duration,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };

    // Sương mù viền Bắc (ngập nước u ám)
    addFog(3120, 140, 1.40, 0.75, 0.38, 0x141822, 600, 22, 7800);
    addFog(3520, 130, 1.45, 0.80, 0.40, 0x101a14, 600, 24, 8200);
    addFog(3880, 140, 1.35, 0.75, 0.36, 0x161324, 600, 20, 7400);

    // Sương mù viền Nam (vùng lầy sâu)
    addFog(3120, 680, 1.40, 0.75, 0.38, 0x121a16, 600, 22, 8000);
    addFog(3520, 670, 1.45, 0.80, 0.42, 0x0f1812, 600, 25, 7600);
    addFog(3880, 680, 1.35, 0.75, 0.36, 0x151222, 600, 20, 8200);

    // Sương mù ranh giới phía Tây (tiếp giáp Crooked Path)
    addFog(2920, 220, 1.25, 0.70, 0.32, 0x161c18, 600, 18, 7200);

    // Sương mù ranh giới phía Đông (tiếp giáp Miếu Chuông)
    addFog(3940, 220, 1.30, 0.75, 0.40, 0x161225, 600, 20, 7500);
  }

  /**
   * C4-13-20: Dựng các dải tiếp giáp địa hình chuyển tiếp tự nhiên rộng 180px–220px giữa các phân khu
   * (Đặc biệt giữa Crooked Path và Silent Mire tại x = 2880; Silent Mire và Broken Bell Shrine tại x = 4000;
   * Bellhollow và Crooked Path tại x = 1600).
   * Gồm: mảng cỏ sẫm, thảm rêu ẩm, đá cuội rải rác, bụi cây tự nhiên đan xen và lớp sương mù biên giới
   * xóa bỏ hoàn toàn đường cắt thẳng đứng "hai thái cực" chia đôi màn hình.
   */
  private renderZoneBoundaryTransitions(): void {
    // 1. RANH GIỚI CROOKED PATH <-> SILENT MIRE (x = 2880, Dải tiếp giáp 200px: 2780..2980)
    this.renderCrookedPathToMireTransition(2880);

    // 2. RANH GIỚI SILENT MIRE <-> BROKEN BELL SHRINE (x = 4000, Dải tiếp giáp 200px: 3900..4100)
    this.renderMireToShrineTransition(4000);

    // 3. RANH GIỚI BELLHOLLOW <-> CROOKED PATH (x = 1600, Dải tiếp giáp 180px: 1510..1690)
    this.renderVillageToForestTransition(1600);
  }

  /**
   * C4-13-20: Dải chuyển tiếp địa hình giữa Đường Mòn Quanh Co và Đầm Lầy Tĩnh Lặng tại x = 2880 (Dải rộng 200px: 2780..2980).
   */
  private renderCrookedPathToMireTransition(seamX: number): void {
    // 1.1. Mảng cỏ sẫm, thảm rêu ẩm và bờ đất đan xen bắc cầu qua ranh giới (depth: -90)
    const turfGfx = this.scene.add.graphics();
    turfGfx.setDepth(-90);

    // Cụm rêu và bùn đất hữu cơ phía Bắc đường mòn (y: 110..265)
    turfGfx.fillStyle(0x1a2620, 0.72);
    turfGfx.fillEllipse(seamX - 10, 160, 160, 48);
    turfGfx.fillStyle(0x233328, 0.65);
    turfGfx.fillEllipse(seamX + 25, 205, 140, 42);
    turfGfx.fillStyle(0x18241d, 0.80);
    turfGfx.fillEllipse(seamX - 35, 235, 110, 36);

    // Cụm rêu và bùn đất hữu cơ phía Nam đường mòn (y: 335..600)
    turfGfx.fillStyle(0x1a2620, 0.75);
    turfGfx.fillEllipse(seamX + 15, 360, 150, 45);
    turfGfx.fillStyle(0x223226, 0.68);
    turfGfx.fillEllipse(seamX - 25, 410, 140, 44);
    turfGfx.fillStyle(0x17221b, 0.82);
    turfGfx.fillEllipse(seamX + 20, 480, 160, 50);
    turfGfx.fillStyle(0x1b2820, 0.70);
    turfGfx.fillEllipse(seamX - 15, 550, 150, 46);

    // Mảng đất nén mờ mịn chuyển tiếp hai bên mép đường (y: 276..284 và y: 316..324)
    turfGfx.fillStyle(0x383125, 0.75);
    turfGfx.fillRect(seamX - 70, 276, 140, 7);
    turfGfx.fillRect(seamX - 70, 317, 140, 7);

    this.registerCullable(turfGfx, seamX, 300, 260);

    // 1.2. Đá cuội, sỏi rừng và sỏi đầm lầy rải rác (Pebbles & Fieldstones)
    const stonesGfx = this.scene.add.graphics();
    stonesGfx.setDepth(-88);
    const stoneList = [
      { x: seamX - 42, y: 275, w: 9, h: 5, c: 0x48524d },
      { x: seamX - 16, y: 274, w: 7, h: 4, c: 0x36403b },
      { x: seamX + 14, y: 276, w: 10, h: 6, c: 0x4f5a54 },
      { x: seamX + 38, y: 273, w: 8, h: 5, c: 0x3a4540 },
      { x: seamX - 35, y: 325, w: 9, h: 5, c: 0x3d4742 },
      { x: seamX - 8, y: 326, w: 11, h: 6, c: 0x4e5852 },
      { x: seamX + 22, y: 324, w: 8, h: 4, c: 0x38423d },
      { x: seamX + 46, y: 327, w: 10, h: 5, c: 0x49534d },
      // Rải rác trên thảm cỏ
      { x: seamX - 55, y: 215, w: 12, h: 7, c: 0x39433e },
      { x: seamX + 48, y: 228, w: 10, h: 6, c: 0x47524c },
      { x: seamX - 30, y: 385, w: 11, h: 6, c: 0x3d4742 },
      { x: seamX + 35, y: 440, w: 13, h: 7, c: 0x45504a }
    ];
    for (const st of stoneList) {
      // Bóng sỏi
      stonesGfx.fillStyle(0x0e1411, 0.45);
      stonesGfx.fillEllipse(st.x + 1, st.y + 2, st.w + 2, st.h);
      // Thân đá cuội
      stonesGfx.fillStyle(st.c, 1);
      stonesGfx.fillRoundedRect(st.x - Math.round(st.w / 2), st.y - Math.round(st.h / 2), st.w, st.h, 2);
    }
    this.registerCullable(stonesGfx, seamX, 300, 260);

    // 1.3. Bụi cây tự nhiên (Dense Bushes & Shrubs) mọc đan xen hai bên xóa sổ đường cắt dọc
    this.createDenseBush(seamX - 35, 235);
    this.createDenseBush(seamX + 25, 245);
    this.createDenseBush(seamX - 25, 365);
    this.createDenseBush(seamX + 30, 370);
    this.createDenseBush(seamX - 60, 160);
    this.createDenseBush(seamX + 45, 490);

    // 1.4. Lớp sương mù biên giới đan xen (Border Mist Layer) tại depth -65
    const addSeamFog = (x: number, y: number, drift: number) => {
      const mist = this.scene.add.image(x, y, SPRITE_FOG_SMOOTH);
      mist.setOrigin(0.5, 0.5);
      mist.setScale(1.2, 0.85);
      mist.setAlpha(0.38);
      mist.setTint(0x1b2722);
      mist.setDepth(-65);
      this.registerCullable(mist, x, y, 110);
      if (this.scene.tweens && drift > 0) {
        this.scene.tweens.add({
          targets: mist,
          x: x + drift,
          duration: 6800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    };
    addSeamFog(seamX - 15, 195, 25);
    addSeamFog(seamX, 300, 20);
    addSeamFog(seamX + 15, 420, 28);
    addSeamFog(seamX - 10, 540, 22);
  }

  /**
   * C4-13-20: Dải chuyển tiếp địa hình giữa Đầm Lầy Tĩnh Lặng và Miếu Chuông Phế Tích tại x = 4000 (Dải rộng 200px: 3900..4100).
   */
  private renderMireToShrineTransition(seamX: number): void {
    const turfGfx = this.scene.add.graphics();
    turfGfx.setDepth(-90);

    // Mảng đất và đá vụn chuyển tiếp từ bùn lầy sang sân đá phế tích miếu cổ
    turfGfx.fillStyle(0x1c2522, 0.75);
    turfGfx.fillEllipse(seamX - 15, 170, 150, 46);
    turfGfx.fillStyle(0x252e2c, 0.70);
    turfGfx.fillEllipse(seamX + 20, 210, 140, 42);
    turfGfx.fillStyle(0x1a2320, 0.78);
    turfGfx.fillEllipse(seamX - 20, 360, 150, 44);
    turfGfx.fillStyle(0x27302d, 0.68);
    turfGfx.fillEllipse(seamX + 25, 420, 140, 45);

    // Mảnh phiến đá lát cổ phong hóa vỡ rải rác
    turfGfx.fillStyle(0x353f45, 0.85);
    turfGfx.fillRect(seamX - 50, 275, 18, 10);
    turfGfx.fillRect(seamX - 15, 273, 22, 12);
    turfGfx.fillRect(seamX + 20, 276, 20, 11);
    turfGfx.fillRect(seamX + 55, 274, 18, 10);
    turfGfx.fillRect(seamX - 35, 287, 24, 12);
    turfGfx.fillRect(seamX + 8, 285, 22, 11);

    this.registerCullable(turfGfx, seamX, 280, 260);

    // Bụi rậm và sỏi đá tự nhiên hai bên lối vào
    this.createDenseBush(seamX - 25, 235);
    this.createDenseBush(seamX + 25, 245);
    this.createDenseBush(seamX - 25, 335);
    this.createDenseBush(seamX + 20, 340);

    // Sương mù biên giới miếu cổ
    const mist = this.scene.add.image(seamX, 280, SPRITE_FOG_SMOOTH);
    mist.setOrigin(0.5, 0.5);
    mist.setScale(1.25, 0.85);
    mist.setAlpha(0.35);
    mist.setTint(0x181e26);
    mist.setDepth(-65);
    this.registerCullable(mist, seamX, 280, 120);
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: mist,
        x: seamX + 20,
        duration: 7200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * C4-13-20: Dải chuyển tiếp địa hình giữa Làng Bellhollow và Đường Mòn Quanh Co tại x = 1600 (Dải rộng 180px: 1510..1690).
   */
  private renderVillageToForestTransition(seamX: number): void {
    const turfGfx = this.scene.add.graphics();
    turfGfx.setDepth(-90);

    // Mảng đất và rêu rừng bìa làng
    turfGfx.fillStyle(0x273622, 0.72);
    turfGfx.fillEllipse(seamX - 10, 180, 140, 44);
    turfGfx.fillStyle(0x2c3b26, 0.65);
    turfGfx.fillEllipse(seamX + 15, 220, 130, 40);
    turfGfx.fillStyle(0x253420, 0.75);
    turfGfx.fillEllipse(seamX - 15, 350, 140, 42);
    turfGfx.fillStyle(0x2b3924, 0.68);
    turfGfx.fillEllipse(seamX + 20, 400, 130, 40);

    this.registerCullable(turfGfx, seamX, 280, 240);

    // Bụi cây tự nhiên và sương mù bìa rừng
    this.createDenseBush(seamX - 15, 240);
    this.createDenseBush(seamX + 20, 245);
    this.createDenseBush(seamX - 15, 325);
    this.createDenseBush(seamX + 20, 330);

    const mist = this.scene.add.image(seamX, 282, SPRITE_FOG_SMOOTH);
    mist.setOrigin(0.5, 0.5);
    mist.setScale(1.2, 0.8);
    mist.setAlpha(0.32);
    mist.setTint(0x17221b);
    mist.setDepth(-65);
    this.registerCullable(mist, seamX, 282, 110);
    if (this.scene.tweens) {
      this.scene.tweens.add({
        targets: mist,
        x: seamX + 20,
        duration: 7000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  public detectCurrentZone(pos: Point2D): ZoneId {
    // C4-13-19 & C4-132-03: Cơ chế vùng đệm trễ vị trí (Hysteresis Margin 80px) chống dao động phân khu lặp lại
    // Đặc biệt bảo vệ ranh giới giữa Đầm Lầy Tĩnh Lặng, Câu Đố Cổ Ngữ và Miếu Chuông Phế Tích
    if (this.activeZoneId === 'ancient_rune_puzzle') {
      const activeZone = this.zones.get('ancient_rune_puzzle');
      if (activeZone) {
        const b = activeZone.bounds;
        const margin = 80;
        if (
          pos.x >= b.x - margin &&
          pos.x <= b.x + b.width + margin &&
          pos.y >= b.y - margin &&
          pos.y <= b.y + b.height + margin
        ) {
          return 'ancient_rune_puzzle';
        }
      }
    }

    if (this.activeZoneId === 'broken_bell_shrine') {
      const activeZone = this.zones.get('broken_bell_shrine');
      if (activeZone) {
        const b = activeZone.bounds;
        const margin = 80;
        if (
          pos.x >= b.x - margin &&
          pos.x <= b.x + b.width + margin &&
          pos.y >= b.y - margin &&
          pos.y <= b.y + b.height + margin
        ) {
          return 'broken_bell_shrine';
        }
      }
    }

    // C4-12-29: Sử dụng mảng sortedZonesByArea đã pre-sort sẵn (zero heap allocation, zero per-frame sort)
    for (let i = 0; i < this.sortedZonesByArea.length; i++) {
      const zone = this.sortedZonesByArea[i];
      const b = zone.bounds;
      if (pos.x >= b.x && pos.x <= b.x + b.width && pos.y >= b.y && pos.y <= b.y + b.height) {
        if (this.activeZoneId !== zone.id) {
          this.activeZoneId = zone.id;
        }
        return zone.id;
      }
    }
    return this.activeZoneId;
  }

  public checkInteractableNearby(pos: Point2D, radius: number = 38): InteractableSpec | null {
    // C4-12-29: Tối ưu so sánh khoảng cách với delta rejection và bình phương bán kính (loại bỏ Math.sqrt)
    const radiusSq = radius * radius;
    for (let i = 0; i < this.interactables.length; i++) {
      const item = this.interactables[i];
      const dx = pos.x - item.x;
      if (Math.abs(dx) > radius) continue;
      const dy = pos.y - item.y;
      if (Math.abs(dy) > radius) continue;
      if (dx * dx + dy * dy <= radiusSq) {
        return item;
      }
    }
    return null;
  }

  /**
   * C4-13-07: Tìm vật thể tương tác gần nhất trong phạm vi gợi ý (maxRadius mặc định 65px)
   * Trả về thông tin vật thể kèm khoảng cách chính xác để tính toán độ mờ (proximity alpha)
   */
  public checkInteractableProximity(pos: Point2D, maxRadius: number = 65): { item: InteractableSpec; dist: number } | null {
    let closestItem: InteractableSpec | null = null;
    let closestDistSq = maxRadius * maxRadius;

    for (let i = 0; i < this.interactables.length; i++) {
      const item = this.interactables[i];
      const dx = pos.x - item.x;
      if (Math.abs(dx) > maxRadius) continue;
      const dy = pos.y - item.y;
      if (Math.abs(dy) > maxRadius) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq <= closestDistSq) {
        closestDistSq = distSq;
        closestItem = item;
      }
    }

    if (closestItem) {
      return { item: closestItem, dist: Math.sqrt(closestDistSq) };
    }
    return null;
  }

  /**
   * C4-12-29: Đăng ký một thực thể môi trường vào hệ thống Camera Frustum Culling
   */
  public registerCullable(gameObject: any, x?: number, y?: number, radius: number = 80): void {
    if (!gameObject || typeof gameObject.setVisible !== 'function') return;
    const posX = x !== undefined ? x : (gameObject.x || 0);
    const posY = y !== undefined ? y : (gameObject.y || 0);
    this.cullableObjects.push({
      gameObject,
      x: posX,
      y: posY,
      radius
    });
  }

  /**
   * C4-12-29: Thống kê hiệu năng Camera Culling (tổng số đối tượng đăng ký và số đối tượng đang hiển thị)
   */
  public getCullableStats(): { total: number; visible: number; culled: number } {
    let visibleCount = 0;
    for (let i = 0; i < this.cullableObjects.length; i++) {
      if (this.cullableObjects[i].gameObject.visible) {
        visibleCount++;
      }
    }
    return {
      total: this.cullableObjects.length,
      visible: visibleCount,
      culled: this.cullableObjects.length - visibleCount
    };
  }

  /**
   * C4-12-29: Cập nhật culling theo camera frustum với biên lề an toàn 180px
   */
  public updateCameraCulling(camera: Phaser.Cameras.Scene2D.Camera): void {
    if (!camera || !camera.worldView) return;
    const view = camera.worldView;
    const margin = 180;
    const minX = view.x - margin;
    const maxX = view.right + margin;
    const minY = view.y - margin;
    const maxY = view.bottom + margin;

    for (let i = 0; i < this.cullableObjects.length; i++) {
      const obj = this.cullableObjects[i];
      // C4-13-02: Loại trừ tuyệt đối nhân vật chính (player) khỏi Camera Culling
      if ((obj.gameObject as any).isPlayer || obj.gameObject === (this.scene as any).player) {
        continue;
      }
      const isInside = (
        obj.x + obj.radius >= minX &&
        obj.x - obj.radius <= maxX &&
        obj.y + obj.radius >= minY &&
        obj.y - obj.radius <= maxY
      );
      if (obj.gameObject.visible !== isInside) {
        obj.gameObject.setVisible(isInside);
      }
      // C4-13-20: Đồng bộ trạng thái ngủ đông setActive(false) để engine bỏ qua update/transform của đối tượng ngoài tầm nhìn
      if (typeof obj.gameObject.setActive === 'function' && obj.gameObject.active !== isInside) {
        obj.gameObject.setActive(isInside);
      }
    }
  }

  /**
   * C4-13-20: Tự động đặt trạng thái ngủ đông (setActive(false), setVisible(false))
   * cho các đối tượng trang trí của những phân khu ở xa ngoài tầm nhìn để máy nạp và xử lý ít tài nguyên hơn.
   */
  public hibernateDistantZoneObjects(currentZoneId: ZoneId): void {
    const activeZone = this.zones.get(currentZoneId);
    if (!activeZone) return;

    // Xác định biên an toàn quanh phân khu hiện tại (bao gồm cả phân khu liền kề trong cự ly 1200px)
    const activeMinX = activeZone.bounds.x - 1200;
    const activeMaxX = activeZone.bounds.x + activeZone.bounds.width + 1200;
    const activeMinY = activeZone.bounds.y - 1000;
    const activeMaxY = activeZone.bounds.y + activeZone.bounds.height + 1000;

    for (let i = 0; i < this.cullableObjects.length; i++) {
      const obj = this.cullableObjects[i];
      if ((obj.gameObject as any).isPlayer || obj.gameObject === (this.scene as any).player) {
        continue;
      }
      const isFarDistant = (
        obj.x < activeMinX || obj.x > activeMaxX ||
        obj.y < activeMinY || obj.y > activeMaxY
      );

      if (isFarDistant) {
        if (obj.gameObject.visible) obj.gameObject.setVisible(false);
        if (typeof obj.gameObject.setActive === 'function' && obj.gameObject.active) {
          obj.gameObject.setActive(false);
        }
      }
    }
  }

  /**
   * C4-13-02: Tự động giảm độ đậm (alpha = 0.35) khi nhân vật đi bên dưới tán cây
   * để người chơi luôn luôn nhìn thấy rõ nhân vật của mình.
   */
  public updateCanopyTransparency(playerX: number, playerY: number): void {
    const trees = this.treeCanopyGroup.getChildren() as Phaser.GameObjects.Image[];
    for (let i = 0; i < trees.length; i++) {
      const tree = trees[i];
      if (!tree.active) continue;

      const halfW = (tree.displayWidth || 80) * 0.5;
      const height = tree.displayHeight || 120;
      const topY = tree.y - height * (tree.originY || 0.88);
      const bottomY = tree.y + 8;

      const isUnderCanopy = (
        playerX >= tree.x - halfW &&
        playerX <= tree.x + halfW &&
        playerY >= topY &&
        playerY <= bottomY
      );

      const targetAlpha = isUnderCanopy ? 0.35 : 1.0;
      if (Math.abs(tree.alpha - targetAlpha) > 0.05) {
        tree.alpha = Phaser.Math.Linear(tree.alpha, targetAlpha, 0.2);
      } else if (tree.alpha !== targetAlpha) {
        tree.alpha = targetAlpha;
      }
    }
  }

  public destroy(): void {
    this.cullableObjects = [];
  }
}
