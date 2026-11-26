import * as Phaser from 'phaser';
import dialoguesData from '../data/dialogues.json';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { CampSanctuarySystem } from './CampSanctuarySystem';

export type DialogueState =
  | 'CLOSED'
  | 'PRESENTING'
  | 'WAITING_FOR_CHOICE'
  | 'CHOICE_SELECTED'
  | 'RESPONSE'
  | 'APPLY_EFFECTS_ONCE'
  | 'COMPLETE';

export interface DialogueChoice {
  choiceId?: string;
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
  opensEastGate?: boolean;
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
  showChoices?(choices: Array<{ text: string; index: number }>, onSelect: (index: number) => void, initialHighlight?: number): void;
  highlightChoice?(index: number): void;
  hideChoices?(): void;
}

interface DialogueChainEntry {
  dialogueKey: string;
  payload: DialoguePayload;
  selectedChoice: DialogueChoice | null;
}

export class DialogueSystem {
  private scene: Phaser.Scene;
  private view: IDialogueView | null = null;

  public state: DialogueState = 'CLOSED';
  private currentDialogueKey: string = '';
  private currentPayload: DialoguePayload | null = null;
  private currentLineIndex: number = 0;
  private isTyping: boolean = false;
  private displayedText: string = '';
  private fullTargetText: string = '';
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private lastAdvanceTime: number = 0;
  private enteredChoicesAt: number = 0;
  private highlightedChoiceIndex: number = 0;
  private sessionChain: DialogueChainEntry[] = [];

  // V1.5 - V15-16: Quản lý trạng thái lựa chọn phản hồi tương tác (giữ tương thích caller hiện hành)
  private isShowingChoices: boolean = false;
  private isShowingResponseLine: boolean = false;
  private pendingChoice: DialogueChoice | null = null;
  private keyboardBindings: Array<{ event: string; fn: () => void }> = [];

  public isActive: boolean = false;
  public onDialogueStart?: () => void;
  public onDialogueEnd?: () => void;

  public get isDialogueOpen(): boolean {
    return this.isActive;
  }

  public getState(): DialogueState {
    return this.state;
  }

  public getHighlightedChoiceIndex(): number {
    return this.highlightedChoiceIndex;
  }

  constructor(scene: Phaser.Scene, view?: IDialogueView) {
    this.scene = scene;
    if (view) {
      this.setView(view);
    }

    // Lắng nghe phím bấm kèm danh sách hủy đăng ký sạch khi scene shutdown
    if (scene.input && scene.input.keyboard) {
      const bindKey = (event: string, fn: () => void) => {
        this.keyboardBindings.push({ event, fn });
        scene.input.keyboard!.on(event, fn);
      };

      bindKey('keydown-SPACE', () => {
        if (this.state === 'PRESENTING' || this.state === 'RESPONSE') this.handleAdvance();
      });
      bindKey('keydown-E', () => {
        if (this.state === 'PRESENTING' || this.state === 'RESPONSE') this.handleAdvance();
      });
      bindKey('keydown-ENTER', () => this.handleEnterKey());

      // Phím số chọn lựa chọn hội thoại 1..5
      bindKey('keydown-ONE', () => this.handleNumberKey(0));
      bindKey('keydown-TWO', () => this.handleNumberKey(1));
      bindKey('keydown-THREE', () => this.handleNumberKey(2));
      bindKey('keydown-FOUR', () => this.handleNumberKey(3));
      bindKey('keydown-FIVE', () => this.handleNumberKey(4));
      bindKey('keydown-NUMPAD_ONE', () => this.handleNumberKey(0));
      bindKey('keydown-NUMPAD_TWO', () => this.handleNumberKey(1));
      bindKey('keydown-NUMPAD_THREE', () => this.handleNumberKey(2));
      bindKey('keydown-NUMPAD_FOUR', () => this.handleNumberKey(3));
      bindKey('keydown-NUMPAD_FIVE', () => this.handleNumberKey(4));

      // Điều hướng lựa chọn bằng mũi tên / W-S
      bindKey('keydown-UP', () => this.moveChoiceHighlight(-1));
      bindKey('keydown-W', () => this.moveChoiceHighlight(-1));
      bindKey('keydown-DOWN', () => this.moveChoiceHighlight(1));
      bindKey('keydown-S', () => this.moveChoiceHighlight(1));
    }

    scene.events.once('shutdown', () => this.destroy());
  }

  public setView(view: IDialogueView): void {
    this.view = view;
    if (this.view.setAdvanceHandler) {
      this.view.setAdvanceHandler(() => this.handleAdvance());
    }
  }

  public startDialogue(dialogueKey: string, preserveChain: boolean = false): void {
    // C4-132-02: Khóa cứng sự kiện tua thoại trong 260ms đầu tiên để cú nhấn [E] mở thoại không bao giờ nuốt mất câu số 1
    this.lastAdvanceTime = Date.now();

    // V15-38 & V15-FIX-03: Điều hướng an toàn lựa chọn Nghỉ ngơi bên đốm lửa của Sir Vaelen theo tiến trình ký ức & hồi chiêu
    if (dialogueKey === 'campfire_knight_rest_blessing') {
      try {
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
      } catch (err) {
        console.warn('[DialogueSystem] Error routing campfire_knight_rest_blessing, fallback to stage0_2:', err);
        dialogueKey = 'campfire_knight_rest_blessing_stage0_2';
      }
    }

    const rawData = (dialoguesData.dialogues as Record<string, DialoguePayload>)[dialogueKey];
    if (!rawData) {
      console.warn(`Không tìm thấy đoạn hội thoại: ${dialogueKey}`);
      return;
    }

    if (!preserveChain) {
      this.sessionChain = [];
    }

    this.currentDialogueKey = dialogueKey;
    this.currentPayload = rawData;
    this.currentLineIndex = 0;
    this.state = 'PRESENTING';
    this.isActive = true;
    this.isShowingChoices = false;
    this.isShowingResponseLine = false;
    this.pendingChoice = null;
    this.highlightedChoiceIndex = 0;

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

    if (!preserveChain && this.onDialogueStart) {
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
      else if (this.currentPayload.speaker.includes('Trùm Mũ') || this.currentPayload.speaker.includes('Mordric') || this.currentPayload.speaker.includes('Kỵ Sĩ Bóng Tối')) portraitKey = 'portrait_hooded_knight';
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
    if (this.state !== 'PRESENTING' && this.state !== 'RESPONSE') return;

    // C4-132-02: Tăng thời gian chống dội phím (debounce) từ 100ms lên 260ms chống nhảy cóc thoại
    const now = Date.now();
    if (now - this.lastAdvanceTime < 260) return;
    this.lastAdvanceTime = now;

    // Khi đang hiển thị lựa chọn: không cho phép bấm Space/E bỏ qua
    if (this.isShowingChoices) {
      return;
    }

    // Khi đang hiển thị câu phản hồi sau khi chọn lựa chọn
    if (this.isShowingResponseLine && this.state === 'RESPONSE') {
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
        this.startDialogue(nextKey, true);
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
      // Khi đã đọc hết câu thoại chính: chuyển sang WAITING_FOR_CHOICE
      this.state = 'WAITING_FOR_CHOICE';
      this.isShowingChoices = true;
      this.enteredChoicesAt = Date.now();
      this.highlightedChoiceIndex = 0;
      const choiceItems = this.currentPayload.choices.map((c, i) => ({ text: c.text, index: i }));
      if (this.view && this.view.showChoices) {
        this.view.showChoices(choiceItems, (idx) => this.selectChoice(idx), 0);
      }
    } else {
      this.sessionChain.push({
        dialogueKey: this.currentDialogueKey,
        payload: this.currentPayload,
        selectedChoice: null
      });
      this.endDialogue();
    }
  }

  public moveChoiceHighlight(delta: number): void {
    if (this.state !== 'WAITING_FOR_CHOICE' || !this.currentPayload?.choices?.length) return;
    const len = this.currentPayload.choices.length;
    this.highlightedChoiceIndex = (this.highlightedChoiceIndex + delta + len) % len;
    if (this.view && this.view.highlightChoice) {
      this.view.highlightChoice(this.highlightedChoiceIndex);
    }
  }

  private handleEnterKey(): void {
    if (!this.isActive || !this.currentPayload) return;
    const now = Date.now();
    if (this.state === 'WAITING_FOR_CHOICE') {
      if (now - this.enteredChoicesAt < 260) return;
      AudioManager.getInstance().playUISelect();
      this.selectChoice(this.highlightedChoiceIndex);
      return;
    }
    this.handleAdvance();
  }

  /**
   * V1.5 - V15-16 & HW-V16-A05: Hỗ trợ phím tắt số [1]..[5]
   */
  public handleNumberKey(choiceIndex: number): void {
    if (this.state !== 'WAITING_FOR_CHOICE' || !this.isActive || !this.isShowingChoices || !this.currentPayload?.choices) return;
    if (choiceIndex >= 0 && choiceIndex < this.currentPayload.choices.length) {
      AudioManager.getInstance().playUISelect();
      this.selectChoice(choiceIndex);
    }
  }

  /**
   * Xử lý kích hoạt một Lựa Chọn Hội Thoại đúng 1 lần theo State Machine:
   * WAITING_FOR_CHOICE -> CHOICE_SELECTED -> (RESPONSE | nextDialogueKey | APPLY_EFFECTS_ONCE)
   */
  public selectChoice(choiceIndex: number): void {
    if (this.state !== 'WAITING_FOR_CHOICE' || !this.isActive || !this.isShowingChoices || !this.currentPayload?.choices) return;
    const choice = this.currentPayload.choices[choiceIndex];
    if (!choice) return;

    this.state = 'CHOICE_SELECTED';
    this.highlightedChoiceIndex = choiceIndex;
    this.lastAdvanceTime = Date.now();
    this.isShowingChoices = false;
    if (this.view && this.view.hideChoices) {
      this.view.hideChoices();
    }

    this.sessionChain.push({
      dialogueKey: this.currentDialogueKey,
      payload: this.currentPayload,
      selectedChoice: choice
    });

    // Chuyển sang trạng thái RESPONSE nếu có câu phản hồi của NPC (chỉ áp dụng effects khi COMPLETE)
    if (choice.responseLine) {
      this.state = 'RESPONSE';
      this.isShowingResponseLine = true;
      this.pendingChoice = choice;
      this.showLine(choice.responseLine);
      return;
    }

    if (choice.nextDialogueKey) {
      this.startDialogue(choice.nextDialogueKey, true);
      return;
    }

    this.endDialogue();
  }

  public endDialogue(): void {
    if (!this.isActive || !this.currentPayload) return;

    // Bảo toàn trường hợp gọi trực tiếp hoặc hoàn tất node cuối chưa đưa vào sessionChain
    const alreadyRecorded =
      this.sessionChain.length > 0 &&
      this.sessionChain[this.sessionChain.length - 1].dialogueKey === this.currentDialogueKey;
    if (!alreadyRecorded) {
      this.sessionChain.push({
        dialogueKey: this.currentDialogueKey,
        payload: this.currentPayload,
        selectedChoice: null
      });
    }

    this.state = 'APPLY_EFFECTS_ONCE';
    const state = PlayerState.getInstance();
    const rootPayload = this.sessionChain[this.sessionChain.length - 1].payload;
    const hadRuneCharmBeforePass = state.hasFlag('edda_rune_charm_granted');
    let shouldHealService = false;

    for (const entry of this.sessionChain) {
      const { dialogueKey, payload, selectedChoice } = entry;

      // 1. Ghi nhận Story Flag của choice (bất biến theo dialogue)
      if (selectedChoice?.setFlag) {
        state.setStoryFlag(selectedChoice.setFlag);
      }

      // 2. Guard chống lặp điểm tin cậy theo từng dialogueKey ổn định (không dùng array index)
      if (selectedChoice && typeof selectedChoice.trustDelta === 'number' && selectedChoice.trustDelta !== 0) {
        const trustMarker = `dlg_trust:${dialogueKey}`;
        if (!state.hasFlag(trustMarker) && !state.hasStoryFlag(trustMarker)) {
          state.addVillageTrust(selectedChoice.trustDelta);
          state.setStoryFlag(trustMarker);
        }
      }

      // 3. Kích hoạt cờ hoàn tất hội thoại (mỗi cờ chỉ kích hoạt checkQuestProgression 1 lần trong PlayerState)
      if (payload.onCompleteFlag && !state.hasFlag(payload.onCompleteFlag)) {
        state.setFlag(payload.onCompleteFlag);
      }

      // 4. Chuyển quest kế tiếp đúng 1 lần theo dialogueKey
      if (payload.nextQuestId) {
        const questMarker = `dlg_quest:${dialogueKey}`;
        if (!state.hasFlag(questMarker) && !state.hasStoryFlag(questMarker)) {
          state.setCurrentQuest(payload.nextQuestId);
          state.setStoryFlag(questMarker);
        }
      }

      // 5. Mở Cổng Đông Bellhollow (tính trạng thái qua WorldGatingSystem + flag)
      if (payload.opensEastGate && !state.hasFlag('east_gate_unlocked')) {
        state.setFlag('east_gate_unlocked');
      }

      // 6. Guard chống lặp phần thưởng vật phẩm (trừ quest_* trùng lặp & reward chỉ cấp 1 lần)
      if (payload.rewardItem) {
        const rewardMarker = `dlg_reward:${dialogueKey}`;
        const questAlreadyOwned = payload.rewardItem.startsWith('quest_') && state.getItemCount(payload.rewardItem) > 0;
        const runeCharmAlreadyGranted = dialogueKey === 'edda_rune_guide' && hadRuneCharmBeforePass;
        if (
          !state.hasFlag(rewardMarker) &&
          !state.hasStoryFlag(rewardMarker) &&
          !questAlreadyOwned &&
          !runeCharmAlreadyGranted
        ) {
          state.addItem(payload.rewardItem, payload.rewardCount || 1);
          state.setStoryFlag(rewardMarker);
        }
      }

      if (payload.healPlayer) {
        shouldHealService = true;
      }

      // 7. V15-38: Hiệu ứng Lời Chúc Bên Đốm Lửa của Sir Vaelen (cooldown theo ngày vẫn giữ nguyên)
      if (
        payload.onCompleteFlag === 'vaelen_blessing_stage0_2_received' ||
        payload.onCompleteFlag === 'vaelen_blessing_stage3_received'
      ) {
        const campSys = CampSanctuarySystem.getInstance();
        const currentDay = (this.scene as any).timeSystem ? (this.scene as any).timeSystem.dayCount : state.dayCount;
        campSys.recordBlessingReceived(currentDay);
        campSys.applyCampfireBlessing(120);

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
    }

    // Dịch vụ NPC lặp lại hợp lệ (chữa trị / hồi phục thể lực & bình tâm của Neris / Vaelen)
    if (shouldHealService) {
      state.stats.health = state.stats.maxHealth;
      state.stats.composure = state.stats.maxComposure;
      state.emit('stats_changed', state.stats);
    }

    this.state = 'COMPLETE';
    this.closeInternal();
    this.scene.events.emit('dialogue_completed', rootPayload);
  }

  /** Close an interrupted conversation without applying the completion effects. */
  public cancelDialogue(): void {
    if (!this.isActive && this.state === 'CLOSED') return;
    this.closeInternal();
  }

  private closeInternal(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.remove();
      this.typewriterTimer = null;
    }

    this.isTyping = false;
    this.isShowingChoices = false;
    this.isShowingResponseLine = false;
    this.pendingChoice = null;
    this.highlightedChoiceIndex = 0;
    this.sessionChain = [];
    this.isActive = false;
    this.currentPayload = null;
    this.currentDialogueKey = '';
    this.state = 'CLOSED';

    if (this.view) {
      if (this.view.hideChoices) {
        this.view.hideChoices();
      }
      this.view.hideDialogue();
    }

    if (this.onDialogueEnd) {
      this.onDialogueEnd();
    }
  }

  public destroy(): void {
    if (this.scene?.input?.keyboard) {
      for (const { event, fn } of this.keyboardBindings) {
        this.scene.input.keyboard.off(event, fn);
      }
    }
    this.keyboardBindings = [];
    this.cancelDialogue();
  }
}
