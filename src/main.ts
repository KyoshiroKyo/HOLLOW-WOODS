import * as Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { ScaleManager } from './utils/ScaleManager';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(GameConfig);

  // Áp dụng pixelated rendering cho canvas khi canvas sẵn sàng
  game.events.once(Phaser.Core.Events.READY, () => {
    if (game.canvas) {
      ScaleManager.applyPixelatedCanvas(game.canvas);
    }
  });

  // Tự động căn chỉnh và tối ưu khi thay đổi kích thước cửa sổ
  window.addEventListener('resize', () => {
    if (game.canvas) {
      ScaleManager.applyPixelatedCanvas(game.canvas);
    }
  });
});

