import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../config/Constants';

export class ScaleManager {
  public static calculateIntegerScale(windowWidth: number, windowHeight: number): number {
    const scaleX = Math.floor(windowWidth / VIRTUAL_WIDTH);
    const scaleY = Math.floor(windowHeight / VIRTUAL_HEIGHT);
    const scale = Math.min(scaleX, scaleY);
    return Math.max(1, scale); // Tối thiểu 1×
  }

  public static applyCanvasSampling(canvas: HTMLCanvasElement): void {
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = width * dpr / canvas.width;
    const scaleY = height * dpr / canvas.height;
    const integerScale = Math.round(scaleX);
    const integerDisplay = integerScale >= 1
      && Math.abs(scaleX - integerScale) < 0.01
      && Math.abs(scaleY - integerScale) < 0.01;
    // Sprites keep their own filtering in the renderer. Fractional CSS scaling samples the composed frame.
    canvas.style.imageRendering = integerDisplay ? 'pixelated' : 'auto';
  }
}

