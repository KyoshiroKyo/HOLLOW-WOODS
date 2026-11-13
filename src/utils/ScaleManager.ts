import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config/Constants';

export class ScaleManager {
  public static calculateIntegerScale(windowWidth: number, windowHeight: number): number {
    const scaleX = Math.floor(windowWidth / VIRTUAL_WIDTH);
    const scaleY = Math.floor(windowHeight / VIRTUAL_HEIGHT);
    const scale = Math.min(scaleX, scaleY);
    return Math.max(1, scale); // Tối thiểu 1×
  }

  public static applyPixelatedCanvas(canvas: HTMLCanvasElement): void {
    canvas.style.imageRendering = 'pixelated';
  }
}

