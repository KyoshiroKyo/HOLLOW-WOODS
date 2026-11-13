import * as Phaser from 'phaser';
import dialoguesData from '../data/dialogues.json';
import { PlayerState } from '../state/PlayerState';
import { HDTextHelper } from '../utils/HDTextHelper';

export interface DialoguePayload {
  speaker: string;
  portrait: string;
  lines: string[];
  onCompleteFlag?: string;
  nextQuestId?: string;
  rewardItem?: string;
  rewardCount?: number;
  healPlayer?: boolean;
}

export class DialogueSystem {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private speakerText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private continuePrompt: Phaser.GameObjects.Text;
  private portraitSprite: Phaser.GameObjects.Image;

  private currentPayload: DialoguePayload | null = null;
  private currentLineIndex: number = 0;
  private isTyping: boolean = false;
  private displayedText: string = '';
  private fullTargetText: string = '';
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;

  public isActive: boolean = false;
  public onDialogueStart?: () => void;
  public onDialogueEnd?: () => void;

  public get isDialogueOpen(): boolean {
    return this.isActive;
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 1. Dựng khung hộp thoại HD đặt tại tọa độ (640, 590) kích thước 1060×185 px
    this.container = scene.add.container(640, 590);
    this.container.setScrollFactor(0);
    this.container.setDepth(9000);

    const boxWidth = 1060;
    const boxHeight = 185;
    const halfW = boxWidth / 2;
    const halfH = boxHeight / 2;

    // Nền hộp thoại màu đá đen trung cổ có viền vàng mộc sang trọng
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0e14, 0.95);
    bg.fillRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);
    bg.lineStyle(2, 0xd4af37, 1);
    bg.strokeRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);

    // Viền lót bên trong tăng chiều sâu mỹ thuật
    bg.lineStyle(1, 0x4a3b22, 0.7);
    bg.strokeRoundedRect(-halfW + 4, -halfH + 4, boxWidth - 8, boxHeight - 8, 8);

    // Khung chân dung bên trái (140×140 px)
    const portraitBg = scene.add.graphics();
    portraitBg.fillStyle(0x151b24, 1);
    portraitBg.fillRoundedRect(-halfW + 24, -70, 140, 140, 8);
    portraitBg.lineStyle(2, 0xb8860b, 1);
    portraitBg.strokeRoundedRect(-halfW + 24, -70, 140, 140, 8);

    // Chân dung người nói (Tâm tại x = -halfW + 24 + 70 = -436, y = 0)
    this.portraitSprite = scene.add.image(-halfW + 94, 0, 'satyr_portrait');
    this.portraitSprite.setDisplaySize(124, 124);

    // Tên người nói chuẩn HD Tiếng Việt (Cỡ 24px)
    this.speakerText = HDTextHelper.createText(scene, -halfW + 184, -halfH + 20, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nội dung câu thoại chuẩn HD Tiếng Việt (Cỡ đúng chuẩn 20px)
    this.contentText = HDTextHelper.createText(scene, -halfW + 184, -halfH + 60, '', {
      fontSize: '20px',
      color: '#f8f9fa',
      wordWrap: { width: boxWidth - 215 },
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 1
    });

    // Lời nhắc tiếp tục chuẩn HD Tiếng Việt
    this.continuePrompt = HDTextHelper.createText(scene, halfW - 25, halfH - 25, '▶ [E / SPACE]', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#bdc3c7'
    }).setOrigin(1, 0.5);

    this.container.add([bg, portraitBg, this.portraitSprite, this.speakerText, this.contentText, this.continuePrompt]);
    this.container.setVisible(false);

    // Hiệu ứng nhấp nháy chữ Tiếp tục
    scene.tweens.add({
      targets: this.continuePrompt,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Lắng nghe phím bấm
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-SPACE', () => this.handleAdvance());
      scene.input.keyboard.on('keydown-E', () => this.handleAdvance());
      scene.input.keyboard.on('keydown-ENTER', () => this.handleAdvance());
    }
  }

  public startDialogue(dialogueKey: string): void {
    const rawData = (dialoguesData.dialogues as Record<string, DialoguePayload>)[dialogueKey];
    if (!rawData) {
      console.warn(`Không tìm thấy đoạn hội thoại: ${dialogueKey}`);
      return;
    }

    this.currentPayload = rawData;
    this.currentLineIndex = 0;
    this.isActive = true;
    this.container.setVisible(true);

    if (this.onDialogueStart) {
      this.onDialogueStart();
    }

    // Cập nhật ảnh chân dung của người nói (Dark Rogue hoặc Garth/Edda/Neris)
    let portraitKey = this.currentPayload.portrait;
    if (!portraitKey || !this.scene.textures.exists(portraitKey)) {
      if (this.currentPayload.speaker.includes('Edda')) portraitKey = 'portrait_edda';
      else if (this.currentPayload.speaker.includes('Garth')) portraitKey = 'portrait_garth';
      else if (this.currentPayload.speaker.includes('Neris')) portraitKey = 'portrait_neris';
      else portraitKey = 'satyr_portrait';
    }
    this.portraitSprite.setTexture(portraitKey);
    this.portraitSprite.setDisplaySize(124, 124);

    this.speakerText.setText(this.currentPayload.speaker);
    this.showLine(this.currentPayload.lines[0]);
  }

  private showLine(text: string): void {
    this.fullTargetText = text;
    this.displayedText = '';
    this.contentText.setText('');
    this.isTyping = true;

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
    }

    let charIndex = 0;
    this.typewriterTimer = this.scene.time.addEvent({
      delay: 22,
      repeat: text.length - 1,
      callback: () => {
        this.displayedText += text[charIndex];
        this.contentText.setText(this.displayedText);
        charIndex++;
        if (charIndex >= text.length) {
          this.isTyping = false;
        }
      }
    });
  }

  public handleAdvance(): void {
    if (!this.isActive || !this.currentPayload) return;

    if (this.isTyping) {
      // Bấm lần đầu: hiện ngay toàn bộ dòng chữ
      if (this.typewriterTimer) this.typewriterTimer.remove();
      this.contentText.setText(this.fullTargetText);
      this.isTyping = false;
      return;
    }

    // Bấm lần hai: chuyển câu tiếp theo
    this.currentLineIndex++;
    if (this.currentLineIndex < this.currentPayload.lines.length) {
      this.showLine(this.currentPayload.lines[this.currentLineIndex]);
    } else {
      this.endDialogue();
    }
  }

  public endDialogue(): void {
    if (!this.currentPayload) return;

    const state = PlayerState.getInstance();

    // 1. Kích hoạt cờ cốt truyện
    if (this.currentPayload.onCompleteFlag) {
      state.setFlag(this.currentPayload.onCompleteFlag);
    }

    // 2. Chuyển quest kế tiếp nếu có
    if (this.currentPayload.nextQuestId) {
      state.setCurrentQuest(this.currentPayload.nextQuestId);
    }

    // 3. Trao thưởng vật phẩm
    if (this.currentPayload.rewardItem) {
      state.addItem(this.currentPayload.rewardItem, this.currentPayload.rewardCount || 1);
    }

    // 4. Hồi phục máu/tâm lý nếu NPC chữa thương
    if (this.currentPayload.healPlayer) {
      state.stats.health = state.stats.maxHealth;
      state.stats.composure = state.stats.maxComposure;
      state.emit('stats_changed', state.stats);
    }

    this.isActive = false;
    this.container.setVisible(false);
    this.currentPayload = null;

    if (this.onDialogueEnd) {
      this.onDialogueEnd();
    }
  }
}

