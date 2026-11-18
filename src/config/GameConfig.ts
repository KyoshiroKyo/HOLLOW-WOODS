import * as Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameScene } from '../scenes/GameScene';
import { HUDScene } from '../ui/HUDScene';
import { UIScene } from '../scenes/UIScene';

const canUseWebGL = (() => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
})();

export const GameConfig: Phaser.Types.Core.GameConfig & { resolution?: number } = {
  type: canUseWebGL ? Phaser.WEBGL : Phaser.CANVAS,
  autoFocus: false,
  parent: 'game-container',
  width: 1280,
  height: 720,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  // V1.4: Khóa tỷ lệ điểm ảnh an toàn (DPR Cap <= 1.0) chống quá tải GPU fill-rate trên màn hình Retina / High-DPI
  resolution: Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, 1.0),
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    GameScene,
    HUDScene,
    UIScene
  ],
  backgroundColor: '#0b0c10'
};
