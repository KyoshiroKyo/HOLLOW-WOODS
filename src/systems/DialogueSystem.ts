import * as Phaser from 'phaser';
import dialoguesData from '../data/dialogues.json';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';

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

export interface IDialogueView {
  showDialogue(speaker: string, portraitKey: string): void;
  updateDialogueText(text: string): void;
  hideDialogue(): void;
  setAdvanceHandler?(handler: () => void): void;
}

export class DialogueSystem {
  private scene: Phaser.Scene;
  private view: IDialogueView | null = null;

  private currentPayload: DialoguePayload | null = null;
  private currentLineIndex: number = 0;
  private isTyping: boolean = false;
  private displayedText: string = '';
  private fullTargetText: string = '';
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private lastAdvanceTime: number = 0;

  public isActive: boolean = false;
  public onDialogueStart?: () => void;
  public onDialogueEnd?: () => void;

  public get isDialogueOpen(): boolean {
    return this.isActive;
  }

  constructor(scene: Phaser.Scene, view?: IDialogueView) {
    this.scene = scene;
    if (view) {
      this.setView(view);
    }

    // Lắng nghe phím bấm
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-SPACE', () => this.handleAdvance());
      scene.input.keyboard.on('keydown-E', () => this.handleAdvance());
      scene.input.keyboard.on('keydown-ENTER', () => this.handleAdvance());
    }
  }

  public setView(view: IDialogueView): void {
    this.view = view;
    if (this.view.setAdvanceHandler) {
      this.view.setAdvanceHandler(() => this.handleAdvance());
    }
  }

  public startDialogue(dialogueKey: string): void {
    // C4-132-02: Khóa cứng sự kiện tua thoại trong 260ms đầu tiên để cú nhấn [E] mở thoại không bao giờ nuốt mất câu số 1
    this.lastAdvanceTime = Date.now();

    const rawData = (dialoguesData.dialogues as Record<string, DialoguePayload>)[dialogueKey];
    if (!rawData) {
      console.warn(`Không tìm thấy đoạn hội thoại: ${dialogueKey}`);
      return;
    }

    this.currentPayload = rawData;
    this.currentLineIndex = 0;
    this.isActive = true;

    // C4-13-11: Tự động đóng mọi modal đang mở để đảm bảo chỉ có duy nhất 1 cửa sổ/hội thoại hiển thị
    if (this.view) {
      const ui = (this.view as any);
      if (ui.craftingModal?.isOpen) ui.craftingModal.close();
      if (ui.journalModal?.isOpen) ui.journalModal.close();
      if (ui.pauseModal?.isOpen) ui.pauseModal.close();
    }

    if (this.onDialogueStart) {
      this.onDialogueStart();
    }

    // Cập nhật ảnh chân dung của người nói
    let portraitKey = this.currentPayload.portrait;
    if (!portraitKey) {
      if (this.currentPayload.speaker.includes('Edda')) portraitKey = 'portrait_edda';
      else if (this.currentPayload.speaker.includes('Garth')) portraitKey = 'portrait_garth';
      else if (this.currentPayload.speaker.includes('Neris')) portraitKey = 'portrait_neris';
      else if (this.currentPayload.speaker.includes('Bram') || this.currentPayload.speaker.includes('Thợ Rèn')) portraitKey = 'portrait_blacksmith';
      else if (this.currentPayload.speaker.includes('Finn')) portraitKey = 'portrait_finn';
      else if (this.currentPayload.speaker.includes('Wayfarer') || this.currentPayload.speaker.includes('Lữ Khách')) portraitKey = 'wayfarer_portrait';
      else portraitKey = 'wayfarer_portrait';
    }

    if (this.view) {
      this.view.showDialogue(this.currentPayload.speaker, portraitKey);
    }

    // C4-133-02: Phát giọng thoại mở đầu của NPC
    AudioManager.getInstance().playNPCSpeech(this.currentPayload.speaker);

    this.showLine(this.currentPayload.lines[0]);
  }

  private showLine(text: string): void {
    this.fullTargetText = text;
    this.displayedText = '';
    if (this.view) {
      this.view.updateDialogueText('');
    }
    this.isTyping = true;

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    let charIndex = 0;
    this.typewriterTimer = this.scene.time.addEvent({
      delay: 22,
      repeat: text.length - 1,
      callback: () => {
        const char = text[charIndex];
        this.displayedText += char;
        if (this.view) {
          this.view.updateDialogueText(this.displayedText);
        }
        // C4-133-02: Phát âm typewriter êm dịu cách nhịp 2 ký tự và bỏ qua khoảng trắng
        if (charIndex % 2 === 0 && char !== ' ') {
          AudioManager.getInstance().playDialogueBlip();
        }
        charIndex++;
        if (charIndex >= text.length) {
          this.isTyping = false;
        }
      }
    });
  }

  public handleAdvance(): void {
    if (!this.isActive || !this.currentPayload) return;

    // C4-132-02: Tăng thời gian chống dội phím (debounce) từ 100ms lên 260ms chống nhảy cóc thoại
    const now = Date.now();
    if (now - this.lastAdvanceTime < 260) return;
    this.lastAdvanceTime = now;

    if (this.isTyping) {
      // Bấm lần đầu: hiện ngay toàn bộ dòng chữ
      if (this.typewriterTimer) {
        this.typewriterTimer.remove();
        this.typewriterTimer = null;
      }
      this.displayedText = this.fullTargetText;
      if (this.view) {
        this.view.updateDialogueText(this.fullTargetText);
      }
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
    if (!this.isActive || !this.currentPayload) return;

    const payload = this.currentPayload;
    const state = PlayerState.getInstance();

    // 1. Kích hoạt cờ cốt truyện
    if (payload.onCompleteFlag) {
      state.setFlag(payload.onCompleteFlag);
    }

    // 2. Chuyển quest kế tiếp nếu có
    if (payload.nextQuestId) {
      state.setCurrentQuest(payload.nextQuestId);
    }

    // 3. Trao thưởng vật phẩm
    if (payload.rewardItem) {
      state.addItem(payload.rewardItem, payload.rewardCount || 1);
    }

    // 4. Hồi phục máu/tâm lý nếu NPC chữa thương
    if (payload.healPlayer) {
      state.stats.health = state.stats.maxHealth;
      state.stats.composure = state.stats.maxComposure;
      state.emit('stats_changed', state.stats);
    }

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    this.isActive = false;
    this.currentPayload = null;

    if (this.view) {
      this.view.hideDialogue();
    }

    if (this.onDialogueEnd) {
      this.onDialogueEnd();
    }
  }

  public destroy(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
  }
}
