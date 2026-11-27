import * as Phaser from 'phaser';
import {
  SCENE_GAME, SCENE_PROLOGUE, SPRITE_BELL_TOWER_GRAND_V15, SPRITE_FOG_SMOOTH,
  SPRITE_PROP_LANTERN_POST_V15, SPRITE_TREE_MIST_PINE_V15,
} from '../config/Constants';
import { SettingsManager } from '../systems/SettingsManager';
import { HDTextHelper } from '../utils/HDTextHelper';

// HW-V16-COMPETITION-01 / A08 approved narration.
const CARDS = [
  'Từng có một lời thề\ngiữ lửa nơi rìa rừng sương...',
  'Không còn tên tuổi. Không còn ký ức.\nChỉ còn ánh sáng le lói...',
  'Tiếng chuông đồng khẽ vang...\nhành trình Bellhollow bắt đầu.',
];

export class PrologueScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_PROLOGUE });
  }

  public create(): void {
    const { width, height } = this.scale.gameSize;
    const mid = width / 2;
    const reducedMotion = SettingsManager.getInstance().isReducedMotionPreferred();
    const camera = this.cameras.main.setBackgroundColor('#080c0b');
    const addArt = (key: string, x: number, y: number, w: number, h: number, tint: number) =>
      this.textures.exists(key)
        ? this.add.image(x, y, key).setDisplaySize(w, h).setTint(tint)
        : undefined;

    addArt('menu_black_knight_woodland', mid, height / 2, width, height, 0x606654);
    const shots = [
      addArt(SPRITE_PROP_LANTERN_POST_V15, mid, 245, 112, 224, 0xc4a26e),
      addArt('menu_black_knight_fallback', mid, 244, 810, 456, 0xb5b698),
      addArt(SPRITE_BELL_TOWER_GRAND_V15, mid, 243, 188, 282, 0x998c71),
    ];
    const lighting = addArt(SPRITE_FOG_SMOOTH, mid, 228, 544, 430, 0xdeaa68)?.setAlpha(0.21);
    for (const [x, y, w, h, tint] of [
      [96, 272, 360, 504, 0x38453a], [251, 278, 220, 308, 0x65705b],
      [1182, 270, 370, 518, 0x303f35], [1026, 273, 230, 322, 0x586654],
    ]) {
      addArt(SPRITE_TREE_MIST_PINE_V15, x, y, w, h, tint);
    }
    const mist = addArt(SPRITE_FOG_SMOOTH, mid, 368, 1460, 155, 0x879b8f)?.setAlpha(0.18);
    if (!reducedMotion && mist) {
      this.tweens.add({ targets: mist, x: mid - 58, alpha: 0.28, duration: 4200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    const shade = this.add.graphics();
    shade.fillGradientStyle(0x080c0b, 0x080c0b, 0x080c0b, 0x080c0b, 0, 0, 1, 1);
    shade.fillRect(0, 302, width, 158);
    shade.fillStyle(0x080c0b).fillRect(0, 460, width, height - 460);
    this.add.rectangle(mid, 453, 58, 1, 0xba9257, 0.8);

    const narration = HDTextHelper.createText(this, mid, 489, '', {
      fontSize: '31px', color: '#f0e6d2', align: 'center',
      wordWrap: { width: width - 160 }, padding: { top: 8, bottom: 8 },
    }).setName('prologue-narration').setOrigin(0.5, 0);
    narration.setLineSpacing(8);
    HDTextHelper.createText(this, mid, height - 34, '[ESC / SPACE] Bỏ qua', {
      fontSize: '17px', color: '#bbb5a4', padding: { top: 4, bottom: 4 },
    }).setOrigin(0.5);

    const keyboard = this.input.keyboard;
    let finishing = false;
    let hold: Phaser.Time.TimerEvent | undefined;
    const finish = () => {
      if (finishing) return;
      finishing = true;
      hold?.remove();
      if (reducedMotion) this.scene.start(SCENE_GAME, { isContinue: false });
      else {
        camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          () => this.scene.start(SCENE_GAME, { isContinue: false }));
        camera.fadeOut(280, 0, 0, 0);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (!event.repeat && !event.isComposing && ['Escape', 'Space', 'Enter'].includes(event.code)) finish();
    };
    keyboard?.on('keydown', onKey);
    this.input.once('pointerdown', finish);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      keyboard?.off('keydown', onKey);
      this.input.off('pointerdown', finish);
    });

    const showCard = (index: number) => {
      if (finishing) return;
      if (index === CARDS.length) { finish(); return; }
      shots.forEach((shot, i) => shot?.setVisible(i === index));
      lighting?.setTint(index === 2 ? 0xa6b3a1 : 0xdeaa68);
      narration.setText(CARDS[index]);
      const targets = shots[index] ? [shots[index], narration] : [narration];
      if (!reducedMotion) this.tweens.add({ targets, alpha: { from: 0, to: 1 }, duration: 420, ease: 'Sine.out' });
      hold = this.time.delayedCall(3000, () => {
        if (finishing) return;
        if (reducedMotion) showCard(index + 1);
        else this.tweens.add({ targets, alpha: 0, duration: 340, onComplete: () => showCard(index + 1) });
      });
    };
    if (!reducedMotion) camera.fadeIn(500, 0, 0, 0);
    showCard(0);
  }
}
