/**
 * HOLLOW WOODS V1.5 - STEP V15-59
 * DEDICATED FULLSCREEN ENDING SCENE
 * 
 * Màn hình Kết Thúc trò chơi chuyên biệt toàn màn hình ở tỷ lệ HD 1280x720 (Zoom 1.0 cố định),
 * tự động khôi phục camera FX, triệt tiêu nguy cơ màn hình đen,
 * hiển thị phân nhánh kết thúc theo Tinh Thần / Mảnh Ký Ức và cung cấp 2 nút điều hướng an toàn.
 */

import * as Phaser from 'phaser';
import { SCENE_ENDING } from '../config/Constants';
import { EndingSystem, EndingType } from '../systems/EndingSystem';

export class EndingScene extends Phaser.Scene {
  private endingSystem!: EndingSystem;

  constructor() {
    super({ key: SCENE_ENDING });
  }

  public create(data?: { endingType?: EndingType }): void {
    // 1. Đảm bảo Camera EndingScene ở Zoom 1.0 cố định và reset camera FX chống kẹt màn hình đen
    this.cameras.main.setZoom(1.0);
    this.cameras.main.resetFX();
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // 2. Khởi tạo EndingSystem trên chính EndingScene
    this.endingSystem = new EndingSystem(this, this);
    const endingType = data?.endingType || this.endingSystem.determineEndingType();
    this.endingSystem.playEndingPresentation(endingType);
  }
}
