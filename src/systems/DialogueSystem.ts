import * as Phaser from 'phaser';
import dialoguesData from '../data/dialogues.json';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { CampSanctuarySystem } from './CampSanctuarySystem';

export interface DialogueChoice {
  text: string;
  actionId?: string;
  nextDialogueKey?: string;
  setFlag?: string;
  trustDelta?: number;
  responseLine?: string;
}

export interface DialoguePayload {
  speaker: string;
  portrait: string;
  lines: string[];
  onCompleteFlag?: string;
  nextQuestId?: string;
  rewardItem?: string;
  rewardCount?: number;
  healPlayer?: boolean;
  choices?: DialogueChoice[];
}

export interface IDialogueView {
  showDialogue(speaker: string, portraitKey: string): void;
  updateDialogueText(text: string): void;
  hideDialogue(): void;
  setAdvanceHandler?(handler: () => void): void;
  showChoices?(choices: Array<{ text: string; index: number }>, onSelect: (index: number) => void): void;
  hideChoices?(): void;
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

  // V1.5 - V15-16: Quản lý trạng thái lựa chọn phản hồi tương tác
  private isShowingChoices: boolean = false;
  private isShowingResponseLine: boolean = false;
  private pendingChoice: DialogueChoice | null = null;

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

      // Phím số chọn lựa chọn hội thoại 1, 2, 3
      scene.input.keyboard.on('keydown-ONE', () => this.handleNumberKey(0));
      scene.input.keyboard.on('keydown-TWO', () => this.handleNumberKey(1));
      scene.input.keyboard.on('keydown-THREE', () => this.handleNumberKey(2));
      scene.input.keyboard.on('keydown-NUMPAD_ONE', () => this.handleNumberKey(0));
      scene.input.keyboard.on('keydown-NUMPAD_TWO', () => this.handleNumberKey(1));
      scene.input.keyboard.on('keydown-NUMPAD_THREE', () => this.handleNumberKey(2));
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

    // V15-38: Điều hướng lựa chọn Nghỉ ngơi bên đốm lửa của Sir Vaelen theo tiến trình ký ức & hồi chiêu
    if (dialogueKey === 'campfire_knight_rest_blessing') {
      const audioMgr = (this.scene as any).audioManager as AudioManager;
      if (audioMgr && typeof audioMgr.playBGM === 'function') {
        audioMgr.playBGM('bgm_knights_quiet_fire', 1.5, 0.95);
      }

      const campSys = CampSanctuarySystem.getInstance();
      const currentDay = (this.scene as any).timeSystem ? (this.scene as any).timeSystem.dayCount : PlayerState.getInstance().dayCount;
      if (!campSys.canReceiveBlessing(currentDay)) {
        dialogueKey = 'campfire_knight_rest_cooldown';
      } else {
        const stage = PlayerState.getInstance().memoryAwakeningStage;
        const isStage3 = stage >= 3 || PlayerState.getInstance().hasFlag('campfire_knight_q3_completed');
        dialogueKey = isStage3 ? 'campfire_knight_rest_blessing_stage3' : 'campfire_knight_rest_blessing_stage0_2';
      }
    }

    const rawData = (dialoguesData.dialogues as Record<string, DialoguePayload>)[dialogueKey];
    if (!rawData) {
      console.warn(`Không tìm thấy đoạn hội thoại: ${dialogueKey}`);
      return;
    }

    this.currentPayload = rawData;
    this.currentLineIndex = 0;
    this.isActive = true;
    this.isShowingChoices = false;
    this.isShowingResponseLine = false;
    this.pendingChoice = null;

    if (this.view && this.view.hideChoices) {
      this.view.hideChoices();
    }

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
      else if (this.currentPayload.speaker.includes('Canh Lửa') || this.currentPayload.speaker.includes('Vaelen')) portraitKey = 'portrait_campfire_knight';
      else if (this.currentPayload.speaker.includes('Trùm Mũ')) portraitKey = 'portrait_hooded_knight';
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

    // Khi đang hiển thị lựa chọn: không cho phép bấm Space/E bỏ qua
    if (this.isShowingChoices) {
      return;
    }

    // Khi đang hiển thị câu phản hồi sau khi chọn lựa chọn
    if (this.isShowingResponseLine) {
      if (this.isTyping) {
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

      this.isShowingResponseLine = false;
      const nextKey = this.pendingChoice?.nextDialogueKey;
      this.pendingChoice = null;

      if (nextKey) {
        this.startDialogue(nextKey);
      } else {
        this.endDialogue();
      }
      return;
    }

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
    } else if (this.currentPayload.choices && this.currentPayload.choices.length > 0) {
      // Khi đã đọc hết câu thoại chính: mở bảng Lựa Chọn Hội Thoại Tương Tác
      this.isShowingChoices = true;
      const choiceItems = this.currentPayload.choices.map((c, i) => ({ text: c.text, index: i }));
      if (this.view && this.view.showChoices) {
        this.view.showChoices(choiceItems, (idx) => this.selectChoice(idx));
      }
    } else {
      this.endDialogue();
    }
  }

  /**
   * V1.5 - V15-16: Xử lý phím tắt số [1], [2], [3]
   */
  public handleNumberKey(choiceIndex: number): void {
    if (!this.isActive || !this.isShowingChoices || !this.currentPayload?.choices) return;
    if (choiceIndex >= 0 && choiceIndex < this.currentPayload.choices.length) {
      AudioManager.getInstance().playUISelect();
      this.selectChoice(choiceIndex);
    }
  }

  /**
   * V1.5 - V15-16: Xử lý kích hoạt một Lựa Chọn Hội Thoại
   */
  public selectChoice(choiceIndex: number): void {
    if (!this.isActive || !this.isShowingChoices || !this.currentPayload?.choices) return;
    const choice = this.currentPayload.choices[choiceIndex];
    if (!choice) return;

    this.isShowingChoices = false;
    if (this.view && this.view.hideChoices) {
      this.view.hideChoices();
    }

    const state = PlayerState.getInstance();

    // 1. Ghi nhận cờ cốt truyện tương tác (Story Flag)
    if (choice.setFlag) {
      state.setStoryFlag(choice.setFlag);
    }

    // 2. Tác động điểm tin cậy dân làng (Village Trust Score)
    if (typeof choice.trustDelta === 'number' && choice.trustDelta !== 0) {
      state.addVillageTrust(choice.trustDelta);
    }

    // 3. Nếu có câu phản hồi đặc thù của NPC
    if (choice.responseLine) {
      this.isShowingResponseLine = true;
      this.pendingChoice = choice;
      this.showLine(choice.responseLine);
      return;
    }

    // 4. Nếu có nhánh hội thoại tiếp theo
    if (choice.nextDialogueKey) {
      this.startDialogue(choice.nextDialogueKey);
      return;
    }

    // 5. Kết thúc hội thoại
    this.endDialogue();
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
      if (payload.rewardItem.startsWith('quest_') && state.getItemCount(payload.rewardItem) > 0) {
        // Đã sở hữu vật phẩm nhiệm vụ duy nhất này, không thêm trùng lặp
      } else {
        state.addItem(payload.rewardItem, payload.rewardCount || 1);
      }
    }

    // 4. Hồi phục máu/tâm lý nếu NPC chữa thương
    if (payload.healPlayer) {
      state.stats.health = state.stats.maxHealth;
      state.stats.composure = state.stats.maxComposure;
      state.emit('stats_changed', state.stats);
    }

    // 5. V15-38: Kích hoạt hiệu ứng sau khi nghe lời chúc nghỉ ngơi của Sir Vaelen
    if (
      payload.onCompleteFlag === 'vaelen_blessing_stage0_2_received' ||
      payload.onCompleteFlag === 'vaelen_blessing_stage3_received'
    ) {
      const campSys = CampSanctuarySystem.getInstance();
      const currentDay = (this.scene as any).timeSystem ? (this.scene as any).timeSystem.dayCount : state.dayCount;
      campSys.recordBlessingReceived(currentDay);
      campSys.applyCampfireBlessing(120);

      // Hồi phục nhanh 35 điểm Tinh Thần & hong khô hoàn toàn Độ Ẩm
      state.stats.composure = Math.min(state.stats.maxComposure, state.stats.composure + 35);
      state.stats.moisture = 0;
      state.emit('stats_changed', state.stats);

      if (payload.onCompleteFlag === 'vaelen_blessing_stage3_received') {
        state.unlockLore('lore_campfire_knight_vow');
      }

      const uiScene = (this.scene as any).uiScene;
      if (uiScene && typeof uiScene.showPopupMessage === 'function') {
        uiScene.showPopupMessage('🔥 [LỜI CHÚC BÊN ĐỐM LỬA]: +35 Tinh Thần, Hong khô hoàn toàn Độ Ẩm! Nhận bùa chú kiên định (-20% tụt Tinh Thần trong 120s).');
        if (payload.onCompleteFlag === 'vaelen_blessing_stage3_received') {
          uiScene.showPopupMessage('📖 SỔ TAY LỮ KHÁCH [J]: Đã ghi nhận câu châm ngôn "Audentes Fortuna Iuvat" vào Trang Kỷ Niệm của Sir Vaelen!');
        }
      }
    }

    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    this.isShowingChoices = false;
    this.isShowingResponseLine = false;
    this.pendingChoice = null;
    this.isActive = false;
    this.currentPayload = null;

    if (this.view) {
      if (this.view.hideChoices) {
        this.view.hideChoices();
      }
      this.view.hideDialogue();
    }

    if (this.onDialogueEnd) {
      this.onDialogueEnd();
    }

    this.scene.events.emit('dialogue_completed', payload);
  }

  public destroy(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }
  }
}
