import * as Phaser from 'phaser';
import puzzlesData from '../data/puzzles.json';
import { PlayerState } from '../state/PlayerState';

export interface PuzzlePillarState {
  id: string;
  activated: boolean;
}

export class PuzzleSystem {
  private scene: Phaser.Scene;
  private playerState: PlayerState;

  // Trạng thái Câu đố 1: Chiếc Đèn Thứ Hai
  public fakeLanternActive: boolean = true;
  private fakeLanternContainer!: Phaser.GameObjects.Container;
  public treeSymbolsFound: Set<string> = new Set();

  // Trạng thái Câu đố 2: Ba Cột Đá Tiếng Vọng
  public currentSequence: string[] = [];
  public isMirePuzzleSolved: boolean = false;
  private pillarStates: Map<string, boolean> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();

    this.setupFakeLantern();
    this.pillarStates.set('pillar_moon', false);
    this.pillarStates.set('pillar_root', false);
    this.pillarStates.set('pillar_eye', false);
  }

  // --- CÂU ĐỐ 1: CHIẾC ĐÈN THỨ HAI TRONG SƯƠNG (ACT 3) ---

  private setupFakeLantern(): void {
    const puzzleMeta = puzzlesData.puzzles.crooked_path_lanterns;
    const pos = puzzleMeta.fakeLanternPos;

    this.fakeLanternContainer = this.scene.add.container(pos.x, pos.y);
    const g = this.scene.add.graphics();

    // Ngọn đèn lồng ma quái phát sáng lập lòe màu xanh lục ma mị
    g.fillStyle(0x1abc9c, 0.4);
    g.fillCircle(0, 0, 36);
    g.fillStyle(0x16a085, 0.8);
    g.fillCircle(0, 0, 16);
    g.fillStyle(0xa3e4d7, 1);
    g.fillCircle(0, 0, 6);

    this.fakeLanternContainer.add(g);
    this.fakeLanternContainer.setDepth(pos.y);

    // Chuyển động bập bùng ma quái
    this.scene.tweens.add({
      targets: this.fakeLanternContainer,
      y: pos.y - 12,
      alpha: 0.5,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public checkFakeLanternProximity(playerX: number, playerY: number, onFailTriggered: (msg: string) => void): boolean {
    if (!this.fakeLanternActive) return false;

    const puzzleMeta = puzzlesData.puzzles.crooked_path_lanterns;
    const dist = Math.hypot(playerX - puzzleMeta.fakeLanternPos.x, playerY - puzzleMeta.fakeLanternPos.y);

    if (dist <= 35) {
      // Người chơi đã vi phạm Quy Tắc 2: Đi theo chiếc đèn thứ hai!
      onFailTriggered('⚠️ BẠN ĐÃ VI PHẠM QUY TẮC 2: Đi theo chiếc đèn thứ hai! Màn sương đã đưa bạn trở lại lối mòn...');
      return true;
    }
    return false;
  }

  public inspectTreeSymbol(symbolId: string, playerHasLanternOn: boolean): { success: boolean; msg: string } {
    if (!playerHasLanternOn) {
      return {
        success: false,
        msg: 'Ký hiệu trên thân cây bị sương mù làm nhòe! Hãy kích hoạt Vòng Sáng Hộ Tâm [F] để soi sáng.'
      };
    }

    if (!this.treeSymbolsFound.has(symbolId)) {
      this.treeSymbolsFound.add(symbolId);
      if (this.treeSymbolsFound.size >= 3) {
        this.playerState.setFlag('crooked_path_solved');
        this.fakeLanternActive = false;
        this.fakeLanternContainer.setVisible(false);
        return {
          success: true,
          msg: '🎉 Bạn đã soi sáng đủ 3 Ký Hiệu Ranh Giới! Chiếc đèn ma tan biến, con đường sang Đầm Lầy Tĩnh Lặng đã mở ra!'
        };
      }
      return {
        success: true,
        msg: `Đã soi sáng Ký Hiệu Cổ (${this.treeSymbolsFound.size}/3). Tiếp tục tìm các ký hiệu khác!`
      };
    }

    return { success: true, msg: 'Ký hiệu này đã được soi sáng.' };
  }

  // --- CÂU ĐỐ 2: BA CỘT ĐÁ TIẾNG VỌNG (ACT 4) ---

  public interactPillar(pillarId: string): { 
    solved: boolean; 
    failed: boolean; 
    msg: string; 
    alreadySolved?: boolean; 
    alreadyLit?: boolean; 
    stepIndex?: number; 
  } {
    // 1. Kiểm tra trạng thái đã giải đố thành công (chống nhận thưởng/lặp thao tác trùng lặp)
    if (this.isMirePuzzleSolved || this.playerState.hasFlag('mire_pillars_solved')) {
      this.isMirePuzzleSolved = true;
      return { 
        solved: true, 
        failed: false, 
        alreadySolved: true, 
        msg: '✨ Ba Cột Đá Tiếng Vọng đã được mở khóa hoàn toàn! Phong ấn Miếu Chuông đã được giải trừ.' 
      };
    }

    // 2. Kiểm tra nếu cột đá này đã được kích hoạt trong chuỗi hiện tại
    if (this.currentSequence.includes(pillarId)) {
      return {
        solved: false,
        failed: false,
        alreadyLit: true,
        stepIndex: this.currentSequence.length,
        msg: `Cột đá này đã được kích hoạt và đang tỏa sáng. Tiến trình: (${this.currentSequence.length}/3). Hãy tìm Cột Đá tiếp theo!`
      };
    }

    const puzzleMeta = puzzlesData.puzzles.silent_mire_pillars;
    const expectedPillarId = puzzleMeta.correctSequence[this.currentSequence.length];

    if (pillarId === expectedPillarId) {
      // Kích hoạt đúng cột đá kế tiếp
      this.currentSequence.push(pillarId);
      this.pillarStates.set(pillarId, true);
      const step = this.currentSequence.length;

      if (step === puzzleMeta.correctSequence.length) {
        this.isMirePuzzleSolved = true;
        this.playerState.setFlag('mire_pillars_solved');
        this.playerState.setFlag('mire_puzzle_solved');
        return {
          solved: true,
          failed: false,
          stepIndex: step,
          msg: '🎉 KÍCH HOẠT THÀNH CÔNG BA CỘT ĐÁ TIẾNG VỌNG! Nước đầm lầy đã rút, con đường đến Miếu Chuông đã mở!'
        };
      }

      const pillarName = pillarId === 'pillar_moon' ? 'Mặt Trăng (1/3)' : 'Rễ Cây (2/3)';
      return {
        solved: false,
        failed: false,
        stepIndex: step,
        msg: `✨ Cột Đá ${pillarName} bừng sáng hào quang! Hãy kích hoạt cột đá tiếp theo.`
      };
    } else {
      // Kích hoạt sai thứ tự! Cơ chế đặt lại mượt mà (smooth reset)
      this.currentSequence = [];
      this.pillarStates.set('pillar_moon', false);
      this.pillarStates.set('pillar_root', false);
      this.pillarStates.set('pillar_eye', false);

      return {
        solved: false,
        failed: true,
        stepIndex: 0,
        msg: '⚡ SAI THỨ TỰ! Tiếng gầm vọng lại từ đáy bùn sâu... Kẻ Lắng Nghe đang hướng tới vị trí này! Các cột đá đã được hoàn tác.'
      };
    }
  }

  public resetPillars(): void {
    this.currentSequence = [];
    this.pillarStates.set('pillar_moon', false);
    this.pillarStates.set('pillar_root', false);
    this.pillarStates.set('pillar_eye', false);
  }

  public getLitPillarsCount(): number {
    return this.currentSequence.length;
  }

  public isSolved(): boolean {
    return this.isMirePuzzleSolved || this.playerState.hasFlag('mire_pillars_solved');
  }

  public isPillarLit(pillarId: string): boolean {
    return this.pillarStates.get(pillarId) || false;
  }
}

