/**
 * HOLLOW WOODS V3.0 - PASS T12
 * HD VIETNAMESE TYPOGRAPHY HELPER
 * Tiện ích chuẩn hóa hiển thị văn bản Tiếng Việt sắc nét chuẩn HD 100%
 */

import * as Phaser from 'phaser';

export const HD_FONT_FAMILY = '"Segoe UI", "Roboto", "Inter", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif';

export class HDTextHelper {
  /**
   * Tính toán độ phân giải Text HD tối ưu theo Device Pixel Ratio (tối thiểu 2x, tối đa 3x)
   */
  public static getOptimalResolution(): number {
    if (typeof window !== 'undefined' && window.devicePixelRatio) {
      return Math.max(2, Math.min(window.devicePixelRatio, 3));
    }
    return 2;
  }

  /**
   * Chuẩn hóa style chữ với font chữ HD Tiếng Việt mặc định
   */
  public static formatStyle(style?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: HD_FONT_FAMILY,
      ...style
    };
  }

  /**
   * Áp dụng độ phân giải cao và bộ lọc mượt mà (LINEAR) cho Text GameObject
   * Đồng thời tự động duy trì độ phân giải HD mỗi khi cập nhật chữ
   */
  public static applyHD(textObj: Phaser.GameObjects.Text, resolution?: number): Phaser.GameObjects.Text {
    const res = resolution ?? this.getOptimalResolution();
    textObj.setResolution(res);
    if (textObj.texture) {
      textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    // Ghi đè phương thức setText để tự động làm mới bộ lọc và độ phân giải khi chuỗi ký tự thay đổi
    const originalSetText = textObj.setText.bind(textObj);
    textObj.setText = function (value: string | string[]) {
      const stringValue = Array.isArray(value) ? value.join('\n') : String(value);
      if (textObj.text === stringValue) {
        return textObj; // Tránh tạo lại canvas context và texture upload nếu nội dung không đổi
      }
      const result = originalSetText(value);
      textObj.setResolution(res);
      if (textObj.texture) {
        textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      return result;
    };

    return textObj;
  }

  /**
   * Tạo nhanh đối tượng Phaser.GameObjects.Text chuẩn HD hỗ trợ tiếng Việt
   */
  public static createText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle,
    resolution?: number
  ): Phaser.GameObjects.Text {
    const formattedStyle = this.formatStyle(style);
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    const textObj = scene.add.text(roundX, roundY, text, formattedStyle);
    return this.applyHD(textObj, resolution);
  }

  /**
   * Cập nhật nội dung văn bản và làm mới bộ lọc Linear Filter
   */
  public static updateText(
    textObj: Phaser.GameObjects.Text,
    text: string | string[],
    resolution?: number
  ): void {
    const res = resolution ?? this.getOptimalResolution();
    textObj.setText(text);
    textObj.setResolution(res);
    if (textObj.texture) {
      textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }
}

