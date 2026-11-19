/**
 * HOLLOW WOODS V1.5 - BỘ TRỢ GIÚP THẺ PHÍM BẤM MINH HỌA TRỰC QUAN (KEYCAP BADGE HELPER)
 * Tạo các nút phím cơ phong cách Dark Medieval / Gothic với hiệu ứng nổi 3D,
 * phân chia theo 3 nhóm hành động: Di chuyển, Ánh sáng & Sinh tồn, Chiến đấu tự vệ.
 */

import * as Phaser from 'phaser';
import { HDTextHelper } from '../utils/HDTextHelper';

export interface KeycapStyleOptions {
  bgColor?: number;
  bevelColor?: number;
  shadowColor?: number;
  textColor?: string;
  fontSize?: string;
  minWidth?: number;
  height?: number;
  highlight?: boolean;
}

export class KeycapBadgeHelper {
  /**
   * Tạo một thẻ phím bấm đơn lẻ (Single Keycap Badge) có chiều sâu 3D
   */
  public static createKeycap(
    scene: Phaser.Scene,
    x: number,
    y: number,
    keyText: string,
    options: KeycapStyleOptions = {}
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    const minW = options.minWidth || (keyText.length > 3 ? 56 : (keyText.length > 1 ? 38 : 28));
    const h = options.height || 26;
    const highlight = options.highlight || false;

    const bgColor = options.bgColor ?? (highlight ? 0x3d2b12 : 0x1a212d);
    const bevelColor = options.bevelColor ?? (highlight ? 0xd4af37 : 0x5a6a7e);
    const shadowColor = options.shadowColor ?? 0x070a0e;
    const textColor = options.textColor || (highlight ? '#f9e79f' : '#f1f5f9');
    const fontSize = options.fontSize || (keyText.length > 4 ? '10px' : '11.5px');

    const gfx = scene.add.graphics();

    // 1. Bóng đổ đáy (Drop Shadow 3D)
    gfx.fillStyle(shadowColor, 0.9);
    gfx.fillRoundedRect(-minW / 2 + 1, -h / 2 + 2, minW, h, 4);

    // 2. Thân phím (Key Body)
    gfx.fillStyle(bgColor, 0.98);
    gfx.fillRoundedRect(-minW / 2, -h / 2, minW, h, 4);

    // 3. Viền nổi vát cạnh (Bevel Highlight)
    gfx.lineStyle(1.5, bevelColor, 0.9);
    gfx.strokeRoundedRect(-minW / 2, -h / 2, minW, h, 4);

    // 4. Đường gờ phản quang trên đỉnh phím
    gfx.lineStyle(1, highlight ? 0xf39c12 : 0x8ba2be, 0.45);
    gfx.lineBetween(-minW / 2 + 3, -h / 2 + 2, minW / 2 - 3, -h / 2 + 2);

    // 5. Chữ ký tự phím
    const text = HDTextHelper.createText(scene, 0, 0, keyText, {
      fontFamily: 'Cinzel, "Courier New", monospace, sans-serif',
      fontSize: fontSize,
      fontStyle: 'bold',
      color: textColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    container.add([gfx, text]);
    return container;
  }

  /**
   * Tạo cụm nhiều phím liên tiếp (ví dụ: [W] [A] [S] [D] hoặc [↑] [←] [↓] [→])
   */
  public static createKeyCluster(
    scene: Phaser.Scene,
    startX: number,
    y: number,
    keys: string[],
    gap: number = 4,
    options: KeycapStyleOptions = {}
  ): { container: Phaser.GameObjects.Container; width: number } {
    const group = scene.add.container(startX, y);
    let curX = 0;

    for (const k of keys) {
      const isWide = k.length > 3;
      const kw = isWide ? 56 : (k.length > 1 ? 38 : 28);
      const cap = this.createKeycap(scene, curX + kw / 2, 0, k, { ...options, minWidth: kw });
      group.add(cap);
      curX += kw + gap;
    }

    return { container: group, width: curX - gap };
  }

  /**
   * Tạo một hàng phím hoàn chỉnh gồm: Phím bấm + Tiêu đề hành động + Mô tả
   */
  public static createActionRow(
    scene: Phaser.Scene,
    x: number,
    y: number,
    keys: string[],
    actionTitle: string,
    description: string,
    rowWidth: number = 660
  ): Phaser.GameObjects.Container {
    const row = scene.add.container(x, y);

    // Nền hàng phím mờ nhẹ
    const bg = scene.add.graphics();
    bg.fillStyle(0x111722, 0.55);
    bg.fillRoundedRect(0, -15, rowWidth, 30, 4);
    bg.lineStyle(1, 0x273548, 0.5);
    bg.strokeRoundedRect(0, -15, rowWidth, 30, 4);
    row.add(bg);

    // Cụm phím bên trái (chiều rộng tối đa 140px)
    const cluster = this.createKeyCluster(scene, 10, 0, keys, 4);
    row.add(cluster.container);

    // Tiêu đề hành động (ở x = 165)
    const title = HDTextHelper.createText(scene, 165, 0, actionTitle, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    // Mô tả sinh tồn (ở x = 330)
    const desc = HDTextHelper.createText(scene, 335, 0, description, {
      fontSize: '11px',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    row.add([title, desc]);
    return row;
  }

  /**
   * Tạo tiêu đề nhóm kỹ năng / phím bấm có biểu tượng và dải ngăn cách
   */
  public static createCategoryHeader(
    scene: Phaser.Scene,
    x: number,
    y: number,
    title: string,
    color: string = '#f39c12',
    width: number = 660
  ): Phaser.GameObjects.Container {
    const header = scene.add.container(x, y);

    const txt = HDTextHelper.createText(scene, 0, 0, title, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: color,
      stroke: '#080c12',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    const line = scene.add.graphics();
    line.lineStyle(1, Phaser.Display.Color.HexStringToColor(color).color, 0.65);
    line.lineBetween(txt.width + 12, 0, width, 0);

    header.add([txt, line]);
    return header;
  }

  /**
   * Dựng toàn bộ bảng điều khiển 3 nhóm trực quan hoàn chỉnh
   */
  public static buildControlsGuideContent(
    scene: Phaser.Scene,
    x: number,
    startY: number,
    contentWidth: number = 660
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, startY);
    let curY = 0;

    // --- NHÓM 1: DI CHUYỂN & THỂ LỰC ---
    const h1 = this.createCategoryHeader(scene, 0, curY, '🏃 NHÓM 1: DI CHUYỂN & THỂ LỰC (MOVEMENT & STAMINA)', '#3498db', contentWidth);
    container.add(h1);
    curY += 22;

    const r1 = this.createActionRow(scene, 0, curY, ['W', 'A', 'S', 'D'], 'Di Chuyển Lữ Khách', 'Bước đi thận trọng trong rừng sương mù / [↑←↓→]', contentWidth);
    container.add(r1);
    curY += 34;

    const r2 = this.createActionRow(scene, 0, curY, ['SHIFT'], 'Chạy Nhanh', 'Tiêu hao Thể Lực (Stamina) — bước chạy gây tiếng động', contentWidth);
    container.add(r2);
    curY += 40;

    // --- NHÓM 2: ÁNH SÁNG & SINH TỒN ---
    const h2 = this.createCategoryHeader(scene, 0, curY, '🕯️ NHÓM 2: ÁNH SÁNG & SINH TỒN (LIGHT & SURVIVAL)', '#f1c40f', contentWidth);
    container.add(h2);
    curY += 22;

    const r3 = this.createActionRow(scene, 0, curY, ['F'], 'Hào Quang Hộ Tâm', 'Bật / Tắt nguồn sáng ấm áp — giữ Tinh Thần & xua tan Sương (tiêu hao Thể Lực)', contentWidth);
    container.add(r3);
    curY += 34;

    const r4 = this.createActionRow(scene, 0, curY, ['E'], 'Tương Tác Thế Giới', 'Trò chuyện NPC, nhóm Lửa Trại Sanctuary, nhặt củi & thảo dược', contentWidth);
    container.add(r4);
    curY += 34;

    const r5 = this.createActionRow(scene, 0, curY, ['C', 'I'], 'Bàn Chế Tạo Nhanh', 'Chế tạo đuốc, mồi tiếng động, bẫy rễ cây và dược liệu', contentWidth);
    container.add(r5);
    curY += 34;

    const r6 = this.createActionRow(scene, 0, curY, ['J'], 'Sổ Tay Biên Niên Sử', 'Theo dõi nhiệm vụ, truyền thuyết làng Bellhollow và ký ức cổ ngữ', contentWidth);
    container.add(r6);
    curY += 40;

    // --- NHÓM 3: CHIẾN ĐẤU & TỰ VỆ ---
    const h3 = this.createCategoryHeader(scene, 0, curY, '⚔️ NHÓM 3: CHIẾN ĐẤU & TỰ VỆ (COMBAT & EVASION)', '#e74c3c', contentWidth);
    container.add(h3);
    curY += 22;

    const r7 = this.createActionRow(scene, 0, curY, ['Q'], 'Ném Mồi Tiếng Động', 'Tạo âm vang đánh lạc hướng quái vật mù lòa Kẻ Lắng Nghe', contentWidth);
    container.add(r7);
    curY += 34;

    const r8 = this.createActionRow(scene, 0, curY, ['SPACE'], 'Vũ Khí Tự Vệ', 'Vung gậy / đao tự vệ khi bị dồn vào đường cùng (hoặc Chuột)', contentWidth);
    container.add(r8);
    curY += 34;

    const r9 = this.createActionRow(scene, 0, curY, ['ESC'], 'Tạm Dừng & Lưu Game', 'Mở Menu Tạm Dừng, cài đặt âm lượng, đồ họa và lưu tiến trình', contentWidth);
    container.add(r9);

    return container;
  }
}
