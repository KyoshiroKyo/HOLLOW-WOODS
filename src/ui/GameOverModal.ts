/**
 * HOLLOW WOODS V1.4 - C4-13-03 / P2-LB-01
 * HD GAME OVER MODAL (BẢNG THÔNG BÁO GỤC NGÃ & BẢNG XẾP HẠNG SINH TỒN P2GAME)
 * Phù hợp với định hướng nghệ thuật Visual Direction A (Dark Woodland Pixel Art)
 * Hiển thị tại UIScene (Zoom 1.0 cố định), căn giữa (640, 360), kích thước 760×470 px
 * Tích hợp Bảng Xếp Hạng window.p2.leaderboard ("survival-score")
 */

import * as Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { LeaderboardService, SubmitScoreParams } from '../services/LeaderboardService';
import { P2LeaderboardEntry } from '../types/p2game';

export interface GameOverModalCallbacks {
  onLoadCheckpoint: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export class GameOverModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private callbacks: GameOverModalCallbacks;
  public isOpen: boolean = false;

  private reasonText!: Phaser.GameObjects.Text;
  private saveStatusText!: Phaser.GameObjects.Text;
  private scoreTitleText!: Phaser.GameObjects.Text;
  private scoreDetailText!: Phaser.GameObjects.Text;

  // Thành phần Bảng xếp hạng P2Game
  private lbRowsContainer!: Phaser.GameObjects.Container;
  private lbStatusText!: Phaser.GameObjects.Text;
  private myRankText!: Phaser.GameObjects.Text;

  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(scene: Phaser.Scene, callbacks: GameOverModalCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9900); // Lớp hiển thị cao hơn HUD và PauseModal

    this.buildUI();
    this.container.setVisible(false);
  }

  private buildUI(): void {
    const modalW = 760;
    const modalH = 470;
    const modalX = (1280 - modalW) / 2; // 260
    const modalY = (720 - modalH) / 2;  // 125

    // 1. Lớp phủ đen mờ u ám toàn màn hình (chặn mọi click xuyên thấu)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x060202, 0.90);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung modal chính phong cách Dark Woodland cổ kính
    const box = this.scene.add.graphics();
    // Nền hộp tối sẫm ánh đỏ sương đêm
    box.fillStyle(0x0d0708, 0.98);
    box.fillRoundedRect(modalX, modalY, modalW, modalH, 8);

    // Đường viền ngoài đỏ thẫm
    box.lineStyle(2, 0x8b0000, 0.95);
    box.strokeRoundedRect(modalX, modalY, modalW, modalH, 8);

    // Đường viền trong đồng cổ
    box.lineStyle(1, 0x5a2d22, 0.75);
    box.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 6);

    // Dải trang trí đỉnh
    box.fillStyle(0x2d0b0e, 0.85);
    box.fillRect(modalX + 8, modalY + 8, modalW - 16, 28);

    // Nhãn phụ trang trí đỉnh
    const tagText = HDTextHelper.createText(this.scene, 640, modalY + 22, '† DỊ CẢNH RỪNG LIỄU — BÓNG ĐÊM NUỐT CHỬNG †', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#c0392b',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Đường phân cách dọc 2 cột (Cột Trái: Game Over & Nút bấm | Cột Phải: Bảng xếp hạng P2Game)
    const vDivider = this.scene.add.graphics();
    vDivider.lineStyle(1, 0x4a2a1a, 0.7);
    vDivider.lineBetween(modalX + 400, modalY + 44, modalX + 400, modalY + modalH - 20);

    // ==========================================
    // CỘT TRÁI: THÔNG TIN GỤC NGÃ & ĐIỂM SINH TỒN
    // ==========================================
    const leftCenterX = modalX + 205; // 465

    // Tiêu đề Game Over chính
    const title = HDTextHelper.createText(this.scene, leftCenterX, modalY + 54, 'GỤC NGÃ TRONG SƯƠNG ĐẶC', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Dòng nguyên nhân gục ngã
    this.reasonText = HDTextHelper.createText(
      this.scene,
      leftCenterX,
      modalY + 84,
      'Sinh lực cạn kiệt... Màn sương nuốt chửng hơi thở cuối cùng.',
      {
        fontSize: '12px',
        fontStyle: 'italic',
        color: '#bdc3c7',
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center',
        wordWrap: { width: 360 }
      }
    ).setOrigin(0.5, 0.5);

    // Khung huy hiệu Điểm Sinh Tồn (Survival Score Badge)
    const scoreBoxGfx = this.scene.add.graphics();
    scoreBoxGfx.fillStyle(0x1a0f12, 0.95);
    scoreBoxGfx.fillRoundedRect(modalX + 25, modalY + 108, 360, 64, 6);
    scoreBoxGfx.lineStyle(1.5, 0xd35400, 0.85);
    scoreBoxGfx.strokeRoundedRect(modalX + 25, modalY + 108, 360, 64, 6);

    this.scoreTitleText = HDTextHelper.createText(this.scene, leftCenterX, modalY + 126, 'ĐIỂM SINH TỒN: 0 ĐIỂM', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.scoreDetailText = HDTextHelper.createText(this.scene, leftCenterX, modalY + 152, 'Sống sót: Ngày 1 • Tinh thần: 100% • Khám phá: 0', {
      fontSize: '11px',
      color: '#ecf0f1',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Thông tin điểm lưu
    this.saveStatusText = HDTextHelper.createText(this.scene, leftCenterX, modalY + 188, '', {
      fontSize: '11px',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5);

    // Đường gạch ngang nhỏ
    const hDivider = this.scene.add.graphics();
    hDivider.lineStyle(1, 0x4a2a1a, 0.6);
    hDivider.lineBetween(modalX + 35, modalY + 208, modalX + 375, modalY + 208);

    // 3 Nút chức năng cột trái
    let btnY = modalY + 236;
    const btnW = 340;
    const btnH = 38;

    // Nút 1: Nạp Điểm Lưu Gần Nhất
    const reloadBtn = this.createButton(
      leftCenterX,
      btnY,
      btnW,
      btnH,
      '↺ NẠP ĐIỂM LƯU GẦN NHẤT (LOAD)',
      '#3498db',
      0x132130,
      () => {
        this.close();
        this.callbacks.onLoadCheckpoint();
      }
    );

    btnY += 48;
    // Nút 2: Chơi Lại Từ Đầu
    const restartBtn = this.createButton(
      leftCenterX,
      btnY,
      btnW,
      btnH,
      '🔄 CHƠI LẠI TỪ ĐẦU (RESTART)',
      '#e67e22',
      0x2a1a10,
      () => {
        this.close();
        this.callbacks.onRestart();
      }
    );

    btnY += 48;
    // Nút 3: Quay Về Màn Hình Chính
    const menuBtn = this.createButton(
      leftCenterX,
      btnY,
      btnW,
      btnH,
      '🏠 VỀ MÀN HÌNH CHÍNH (MENU)',
      '#95a5a6',
      0x1a1c20,
      () => {
        this.close();
        this.callbacks.onMainMenu();
      }
    );

    // Chú thích chân trang cột trái
    const footerText = HDTextHelper.createText(
      this.scene,
      leftCenterX,
      modalY + modalH - 20,
      'Kẻ Lắng Nghe luôn ghi nhớ tiếng bước chân trong sương',
      {
        fontSize: '10px',
        fontStyle: 'italic',
        color: '#666666'
      }
    ).setOrigin(0.5, 0.5);

    // ==========================================
    // CỘT PHẢI: BẢNG XẾP HẠNG SINH TỒN P2GAME
    // ==========================================
    const rightCenterX = modalX + 575; // 835

    const lbHeaderGfx = this.scene.add.graphics();
    lbHeaderGfx.fillStyle(0x221316, 0.9);
    lbHeaderGfx.fillRoundedRect(modalX + 418, modalY + 44, 318, 38, 5);
    lbHeaderGfx.lineStyle(1, 0x8b0000, 0.8);
    lbHeaderGfx.strokeRoundedRect(modalX + 418, modalY + 44, 318, 38, 5);

    const lbTitle = HDTextHelper.createText(this.scene, rightCenterX, modalY + 56, '🏆 BẢNG XẾP HẠNG SINH TỒN', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const lbSubTitle = HDTextHelper.createText(this.scene, rightCenterX, modalY + 72, 'P2.LEADERBOARD • TOP CAO NHẤT', {
      fontSize: '10px',
      color: '#bdc3c7'
    }).setOrigin(0.5, 0.5);

    // Khung bảng hiển thị các hàng xếp hạng
    const lbTableGfx = this.scene.add.graphics();
    lbTableGfx.fillStyle(0x0c0708, 0.95);
    lbTableGfx.fillRoundedRect(modalX + 418, modalY + 88, 318, 252, 6);
    lbTableGfx.lineStyle(1, 0x3d1e18, 0.85);
    lbTableGfx.strokeRoundedRect(modalX + 418, modalY + 88, 318, 252, 6);

    // Tiêu đề cột
    const colHeader = HDTextHelper.createText(this.scene, modalX + 430, modalY + 98, 'HẠNG    LỮ KHÁCH                     ĐIỂM', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#888888'
    });

    const colLine = this.scene.add.graphics();
    colLine.lineStyle(1, 0x331914, 0.8);
    colLine.lineBetween(modalX + 424, modalY + 114, modalX + 730, modalY + 114);

    // Container động cho các dòng bảng xếp hạng
    this.lbRowsContainer = this.scene.add.container(0, 0);

    // Trạng thái tải bảng xếp hạng
    this.lbStatusText = HDTextHelper.createText(this.scene, rightCenterX, modalY + 180, 'Đang tải bảng xếp hạng...', {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0.5);

    // Hàng hiển thị thứ hạng của tôi
    const myRankGfx = this.scene.add.graphics();
    myRankGfx.fillStyle(0x1a1215, 0.95);
    myRankGfx.fillRoundedRect(modalX + 418, modalY + 346, 318, 32, 5);
    myRankGfx.lineStyle(1, 0xd35400, 0.7);
    myRankGfx.strokeRoundedRect(modalX + 418, modalY + 346, 318, 32, 5);

    this.myRankText = HDTextHelper.createText(this.scene, rightCenterX, modalY + 362, 'Thứ hạng của bạn: Đang đồng bộ...', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // Nút làm mới / đăng nhập bảng xếp hạng
    const refreshBtn = this.createButton(
      rightCenterX,
      modalY + 400,
      318,
      32,
      '⚡ LÀM MỚI BẢNG XẾP HẠNG',
      '#e67e22',
      0x1f1410,
      () => {
        this.fetchLeaderboardData();
      }
    );

    const lbSyncNotice = HDTextHelper.createText(
      this.scene,
      rightCenterX,
      modalY + modalH - 20,
      'Điểm được kiểm định và lưu trữ trên p2game.io',
      {
        fontSize: '10px',
        color: '#555555'
      }
    ).setOrigin(0.5, 0.5);

    this.container.add([
      overlay,
      box,
      tagText,
      vDivider,
      title,
      this.reasonText,
      scoreBoxGfx,
      this.scoreTitleText,
      this.scoreDetailText,
      this.saveStatusText,
      hDivider,
      reloadBtn,
      restartBtn,
      menuBtn,
      footerText,
      lbHeaderGfx,
      lbTitle,
      lbSubTitle,
      lbTableGfx,
      colHeader,
      colLine,
      this.lbRowsContainer,
      this.lbStatusText,
      myRankGfx,
      this.myRankText,
      refreshBtn,
      lbSyncNotice
    ]);
  }

  private createButton(
    x: number,
    y: number,
    btnW: number,
    btnH: number,
    text: string,
    color: string,
    bgColorHex: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btnContainer = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColorHex, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 5);
    bg.lineStyle(1.5, 0x5a2d22, 0.9);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 5);

    const txt = HDTextHelper.createText(this.scene, 0, 0, text, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const hitZone = this.scene.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });

    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(bgColorHex + 0x111111, 1);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 5);
      bg.lineStyle(2, 0xe74c3c, 1);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 5);
      txt.setColor('#ffffff');
    });

    hitZone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColorHex, 0.95);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 5);
      bg.lineStyle(1.5, 0x5a2d22, 0.9);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 5);
      txt.setColor(color);
    });

    hitZone.on('pointerdown', () => {
      onClick();
    });

    btnContainer.add([bg, txt, hitZone]);
    return btnContainer;
  }

  /**
   * Mở modal GameOver và hiển thị điểm sinh tồn + nạp bảng xếp hạng
   */
  public open(reason?: string, scoreParams?: SubmitScoreParams): void {
    if (this.isOpen) return;
    this.isOpen = true;

    if (reason) {
      this.reasonText.setText(reason);
    } else {
      this.reasonText.setText('Sinh lực cạn kiệt... Màn sương lạnh nuốt chửng hơi thở cuối cùng.');
    }

    if (SaveManager.hasSave()) {
      this.saveStatusText.setText('✔ Có dữ liệu điểm lưu gần nhất để tiếp tục hành trình');
      this.saveStatusText.setColor('#2ecc71');
    } else {
      this.saveStatusText.setText('⚠ Chưa có dữ liệu điểm lưu (sẽ bắt đầu lại từ đầu)');
      this.saveStatusText.setColor('#f39c12');
    }

    // Hiển thị điểm số tính toán
    if (scoreParams) {
      const score = LeaderboardService.getInstance().calculateSurvivalScore(scoreParams);
      this.scoreTitleText.setText(`ĐIỂM SINH TỒN: ${score.toLocaleString()} ĐIỂM`);
      const secrets = (scoreParams.unlockedLoreCount || 0) + (scoreParams.relicsCount || 0);
      this.scoreDetailText.setText(
        `Sống sót: Ngày ${scoreParams.dayCount} • Tinh thần: ${Math.round(scoreParams.composure)}% • Bí mật: ${secrets}`
      );
    } else {
      this.scoreTitleText.setText('ĐIỂM SINH TỒN: ĐANG CẬP NHẬT');
      this.scoreDetailText.setText('');
    }

    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 350,
      ease: 'Power2'
    });

    // Tự động tải và đồng bộ bảng xếp hạng P2Game
    this.fetchLeaderboardData();

    if (this.onOpen) {
      this.onOpen();
    }
  }

  /**
   * Truy vấn Top 5 bảng xếp hạng và thứ hạng cá nhân từ P2Game SDK
   */
  private async fetchLeaderboardData(): Promise<void> {
    this.lbStatusText.setText('Đang đồng bộ với p2game.io...');
    this.lbStatusText.setVisible(true);
    this.lbRowsContainer.removeAll(true);

    try {
      const service = LeaderboardService.getInstance();
      const [topScores, aroundMe] = await Promise.all([
        service.getTopScores(6),
        service.getScoresAroundMe(3)
      ]);

      this.lbStatusText.setVisible(false);

      const modalX = (1280 - 760) / 2;
      const modalY = (720 - 470) / 2;
      let startY = modalY + 124;

      if (!topScores || topScores.length === 0) {
        this.lbStatusText.setText('Chưa có dữ liệu bảng xếp hạng.');
        this.lbStatusText.setVisible(true);
      } else {
        topScores.slice(0, 6).forEach((entry: P2LeaderboardEntry, idx: number) => {
          const rowY = startY + idx * 34;

          // Màu sắc thứ hạng: Top 1 Vàng, Top 2 Bạc, Top 3 Đồng
          let rankColor = '#bdc3c7';
          let rowBgColor = 0x140c0f;
          if (entry.rank === 1) {
            rankColor = '#f1c40f';
            rowBgColor = 0x22170b;
          } else if (entry.rank === 2) {
            rankColor = '#e0e0e0';
            rowBgColor = 0x1a1a1f;
          } else if (entry.rank === 3) {
            rankColor = '#e67e22';
            rowBgColor = 0x1f140e;
          }

          if (entry.isMe) {
            rowBgColor = 0x2d1a10;
          }

          const rowGfx = this.scene.add.graphics();
          rowGfx.fillStyle(rowBgColor, 0.85);
          rowGfx.fillRoundedRect(modalX + 424, rowY - 12, 306, 28, 4);

          // Nhãn Rank
          const rankLabel = HDTextHelper.createText(this.scene, modalX + 434, rowY, `#${entry.rank}`, {
            fontSize: '11px',
            fontStyle: 'bold',
            color: rankColor
          }).setOrigin(0, 0.5);

          // Tên người chơi (rút gọn nếu quá dài)
          const rawName = entry.displayName || (entry.playerId === 'local-player' ? 'Lữ khách cục bộ' : 'Lữ khách ẩn danh');
          const safeName = rawName.length > 15 ? rawName.slice(0, 13) + '..' : rawName;
          const nameLabel = HDTextHelper.createText(this.scene, modalX + 472, rowY, safeName, {
            fontSize: '11px',
            color: entry.isMe ? '#f39c12' : '#ecf0f1'
          }).setOrigin(0, 0.5);

          // Điểm số
          const scoreLabel = HDTextHelper.createText(
            this.scene,
            modalX + 720,
            rowY,
            entry.score.toLocaleString(),
            {
              fontSize: '11px',
              fontStyle: 'bold',
              color: '#f39c12'
            }
          ).setOrigin(1, 0.5);

          this.lbRowsContainer.add([rowGfx, rankLabel, nameLabel, scoreLabel]);
        });
      }

      // Cập nhật thông tin thứ hạng của tôi
      const meEntry = aroundMe?.find((e: P2LeaderboardEntry) => e.isMe) || topScores?.find((e: P2LeaderboardEntry) => e.isMe);
      if (meEntry) {
        this.myRankText.setText(`Thứ hạng của bạn: #${meEntry.rank} • ${meEntry.score.toLocaleString()} điểm`);
        this.myRankText.setColor('#2ecc71');
      } else {
        const lastScore = service.getLastSubmittedScore();
        if (lastScore > 0) {
          this.myRankText.setText(`Điểm lượt này: ${lastScore.toLocaleString()} điểm (Đã gửi)`);
        } else {
          this.myRankText.setText('Chưa xếp hạng lượt này.');
        }
        this.myRankText.setColor('#f39c12');
      }
    } catch (err) {
      console.warn('[GameOverModal] Lỗi khi nạp dữ liệu bảng xếp hạng:', err);
      this.lbStatusText.setText('Không thể kết nối máy chủ xếp hạng.');
      this.lbStatusText.setVisible(true);
    }
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);

    if (this.onClose) {
      this.onClose();
    }
  }

  public destroy(): void {
    if (this.container) {
      this.container.removeAll(true);
      this.container.destroy();
    }
  }
}
