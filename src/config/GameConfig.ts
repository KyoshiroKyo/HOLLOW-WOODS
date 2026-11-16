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

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: canUseWebGL ? Phaser.WEBGL : Phaser.CANVAS,
  parent: 'game-container',
  width: 1280,
  height: 720,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
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
