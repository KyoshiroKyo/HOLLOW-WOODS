/**
 * HOLLOW WOODS V3.0 - PASS T12
 * HD VIETNAMESE TYPOGRAPHY HELPER
 * Tiện ích chuẩn hóa hiển thị văn bản Tiếng Việt sắc nét chuẩn HD 100%
 */

import * as Phaser from 'phaser';

export const HD_FONT_FAMILY = '"Segoe UI", "Roboto", "Inter", system-ui, sans-serif';

export class HDTextHelper {
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
   * Áp dụng độ phân giải cao (setResolution = 2) và bộ lọc mượt mà (LINEAR) cho Text GameObject
   * Đồng thời tự động duy trì độ phân giải HD mỗi khi cập nhật chữ
   */
  public static applyHD(textObj: Phaser.GameObjects.Text, resolution: number = 2): Phaser.GameObjects.Text {
    textObj.setResolution(resolution);
    if (textObj.texture) {
      textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    // Ghi đè phương thức setText để tự động làm mới bộ lọc và độ phân giải khi chuỗi ký tự thay đổi
    const originalSetText = textObj.setText.bind(textObj);
    textObj.setText = function (value: string | string[]) {
      const result = originalSetText(value);
      textObj.setResolution(resolution);
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
    resolution: number = 2
  ): Phaser.GameObjects.Text {
    const formattedStyle = this.formatStyle(style);
    const textObj = scene.add.text(x, y, text, formattedStyle);
    return this.applyHD(textObj, resolution);
  }

  /**
   * Cập nhật nội dung văn bản và làm mới bộ lọc Linear Filter
   */
  public static updateText(
    textObj: Phaser.GameObjects.Text,
    text: string | string[],
    resolution: number = 2
  ): void {
    textObj.setText(text);
    textObj.setResolution(resolution);
    if (textObj.texture) {
      textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }
}

