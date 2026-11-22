/**
 * HOLLOW WOODS V1.5 - BỘ TRỢ GIÚP GIAO DIỆN CÀI ĐẶT (SETTINGS UI HELPER)
 * Cung cấp các thanh kéo Slider âm lượng tương tác mượt mà, công tắc bật/tắt Screen Shake,
 * và nút Xóa Bản Lưu an toàn với xác nhận 2 lần (2-Step Safe Confirmation).
 */

import * as Phaser from 'phaser';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';

export interface VolumeSliderOptions {
  trackWidth?: number;
  trackHeight?: number;
  fillColor?: number;
  thumbColor?: number;
  labelWidth?: number;
  showPercent?: boolean;
}

export class SettingsUIHelper {
  /**
   * Tạo thanh trượt âm lượng trực quan có hỗ trợ kéo chuột (Drag), bấm thanh trượt (Click),
   * và hai nút bước nhảy [-] [+]
   */
  public static createVolumeSlider(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    initialValue: number,
    onChange: (val: number) => void,
    options: VolumeSliderOptions = {}
  ): {
    container: Phaser.GameObjects.Container;
    setValue: (val: number) => void;
    getValue: () => number;
  } {
    const container = scene.add.container(x, y);

    const trackW = options.trackWidth || 180;
    const trackH = options.trackHeight || 8;
    const fillColor = options.fillColor ?? 0xe5a93c;
    const thumbColor = options.thumbColor ?? 0xd4af37;
    const labelW = options.labelWidth || 140;

    let currentValue = Math.max(0, Math.min(1, initialValue));

    // 1. Nhãn tên thanh trượt
    const labelTxt = HDTextHelper.createText(scene, -trackW / 2 - labelW / 2 - 25, 0, label, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);

    // 2. Nút giảm [-]
    const decBtn = scene.add.container(-trackW / 2 - 14, 0);
    const decBg = scene.add.graphics();
    decBg.fillStyle(0x1a212d, 0.95);
    decBg.fillRoundedRect(-10, -10, 20, 20, 4);
    decBg.lineStyle(1, 0x4a5a6e, 0.9);
    decBg.strokeRoundedRect(-10, -10, 20, 20, 4);

    const decTxt = HDTextHelper.createText(scene, 0, 0, '-', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);
    decBtn.add([decBg, decTxt]);
    decBtn.setSize(20, 20);
    decBtn.setInteractive(new Phaser.Geom.Rectangle(-10, -10, 20, 20), Phaser.Geom.Rectangle.Contains);
    if (decBtn.input) decBtn.input.cursor = 'pointer';

    // 3. Rãnh trượt (Track Background)
    const trackBg = scene.add.graphics();
    trackBg.fillStyle(0x0e141e, 0.95);
    trackBg.fillRoundedRect(-trackW / 2, -trackH / 2, trackW, trackH, 4);
    trackBg.lineStyle(1, 0x3d4b5c, 0.85);
    trackBg.strokeRoundedRect(-trackW / 2, -trackH / 2, trackW, trackH, 4);

    // 4. Thanh tiến trình đã lấp đầy (Fill Bar)
    const fillGfx = scene.add.graphics();

    // 5. Nút nắm kéo trượt (Thumb / Knob)
    const thumbContainer = scene.add.container(0, 0);
    const thumbGfx = scene.add.graphics();
    thumbGfx.fillStyle(0x0a0e14, 0.6);
    thumbGfx.fillCircle(1, 1, 9);
    thumbGfx.fillStyle(thumbColor, 1);
    thumbGfx.fillCircle(0, 0, 8);
    thumbGfx.lineStyle(1.5, 0xfff0b3, 0.95);
    thumbGfx.strokeCircle(0, 0, 8);
    thumbContainer.add(thumbGfx);
    thumbContainer.setSize(18, 18);
    thumbContainer.setInteractive(new Phaser.Geom.Circle(0, 0, 9), Phaser.Geom.Circle.Contains);
    if (thumbContainer.input) thumbContainer.input.cursor = 'ew-resize';

    // 6. Nút tăng [+]
    const incBtn = scene.add.container(trackW / 2 + 14, 0);
    const incBg = scene.add.graphics();
    incBg.fillStyle(0x1a212d, 0.95);
    incBg.fillRoundedRect(-10, -10, 20, 20, 4);
    incBg.lineStyle(1, 0x4a5a6e, 0.9);
    incBg.strokeRoundedRect(-10, -10, 20, 20, 4);

    const incTxt = HDTextHelper.createText(scene, 0, 0, '+', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);
    incBtn.add([incBg, incTxt]);
    incBtn.setSize(20, 20);
    incBtn.setInteractive(new Phaser.Geom.Rectangle(-10, -10, 20, 20), Phaser.Geom.Rectangle.Contains);
    if (incBtn.input) incBtn.input.cursor = 'pointer';

    // 7. Văn bản phần trăm hiển thị
    const percentTxt = HDTextHelper.createText(scene, trackW / 2 + 48, 0, `${Math.round(currentValue * 100)}%`, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e5a93c'
    }).setOrigin(0.5, 0.5);

    // Vùng chạm trực tiếp lên thanh track (Click to Jump)
    const trackHitZone = scene.add.zone(0, 0, trackW + 16, 24).setInteractive({ useHandCursor: 'pointer' });

    // Hàm cập nhật hình thái
    const renderVisuals = () => {
      fillGfx.clear();
      const fillW = Math.max(0, Math.min(trackW, trackW * currentValue));
      if (fillW > 0) {
        fillGfx.fillStyle(fillColor, 0.95);
        fillGfx.fillRoundedRect(-trackW / 2, -trackH / 2, fillW, trackH, 4);
      }
      thumbContainer.x = -trackW / 2 + fillW;
      percentTxt.setText(`${Math.round(currentValue * 100)}%`);
    };

    const applyValue = (val: number, notify: boolean = true) => {
      currentValue = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
      renderVisuals();
      if (notify) {
        onChange(currentValue);
      }
    };

    renderVisuals();

    // Sự kiện nút [-] và [+]
    decBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      applyValue(currentValue - 0.05);
    });
    incBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      applyValue(currentValue + 0.05);
    });

    // Hover effect cho [-] và [+]
    decBtn.on('pointerover', () => {
      decBg.lineStyle(1.5, 0xd4af37, 1);
      decBg.strokeRoundedRect(-10, -10, 20, 20, 4);
    });
    decBtn.on('pointerout', () => {
      decBg.clear();
      decBg.fillStyle(0x1a212d, 0.95);
      decBg.fillRoundedRect(-10, -10, 20, 20, 4);
      decBg.lineStyle(1, 0x4a5a6e, 0.9);
      decBg.strokeRoundedRect(-10, -10, 20, 20, 4);
    });
    incBtn.on('pointerover', () => {
      incBg.lineStyle(1.5, 0xd4af37, 1);
      incBg.strokeRoundedRect(-10, -10, 20, 20, 4);
    });
    incBtn.on('pointerout', () => {
      incBg.clear();
      incBg.fillStyle(0x1a212d, 0.95);
      incBg.fillRoundedRect(-10, -10, 20, 20, 4);
      incBg.lineStyle(1, 0x4a5a6e, 0.9);
      incBg.strokeRoundedRect(-10, -10, 20, 20, 4);
    });

    // Kéo trượt & Bấm thanh trượt
    let isDragging = false;
    const calculateValueFromPointer = (pointerX: number) => {
      const worldMatrix = container.getWorldTransformMatrix();
      const localX = pointerX - worldMatrix.tx;
      const normalized = (localX + trackW / 2) / trackW;
      applyValue(normalized);
    };

    trackHitZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      calculateValueFromPointer(pointer.x);
    });

    const onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        calculateValueFromPointer(pointer.x);
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
      }
    };

    scene.input.on('pointermove', onPointerMove);
    scene.input.on('pointerup', onPointerUp);

    container.once('destroy', () => {
      if (scene.input) {
        scene.input.off('pointermove', onPointerMove);
        scene.input.off('pointerup', onPointerUp);
      }
    });

    container.add([
      labelTxt,
      trackBg,
      fillGfx,
      trackHitZone,
      thumbContainer,
      decBtn,
      incBtn,
      percentTxt
    ]);

    return {
      container,
      setValue: (val: number) => applyValue(val, false),
      getValue: () => currentValue
    };
  }

  /**
   * Tạo nút công tắc Bật/Tắt Rung Màn Hình (Screen Shake Toggle)
   */
  public static createScreenShakeToggle(
    scene: Phaser.Scene,
    x: number,
    y: number,
    initialEnabled: boolean,
    onToggle: (enabled: boolean) => void,
    width: number = 440
  ): { container: Phaser.GameObjects.Container; setEnabled: (val: boolean) => void } {
    const container = scene.add.container(x, y);
    let enabled = initialEnabled;

    const bg = scene.add.graphics();
    const btnBoxW = 120;
    const btnBoxH = 26;
    const btnX = width / 2 - btnBoxW / 2;

    const labelTxt = HDTextHelper.createText(scene, -width / 2, 0, '📳 Rung Màn Hình (Panic Shake):', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0, 0.5);

    const descTxt = HDTextHelper.createText(
      scene,
      -width / 2,
      20,
      'Rung giật camera khi hoảng loạn mất bình tâm hoặc bị quái vật tập kích.',
      {
        fontSize: '10px',
        fontStyle: 'italic',
        color: '#94a3b8'
      }
    ).setOrigin(0, 0.5);

    const btnContainer = scene.add.container(btnX, 0);
    const btnBg = scene.add.graphics();
    const btnTxt = HDTextHelper.createText(scene, 0, 0, enabled ? '✔ ĐANG BẬT' : '✖ ĐÃ TẮT', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: enabled ? '#2ecc71' : '#e74c3c'
    }).setOrigin(0.5, 0.5);

    btnContainer.add([btnBg, btnTxt]);
    btnContainer.setSize(btnBoxW, btnBoxH);
    btnContainer.setInteractive(new Phaser.Geom.Rectangle(-btnBoxW / 2, -btnBoxH / 2, btnBoxW, btnBoxH), Phaser.Geom.Rectangle.Contains);
    if (btnContainer.input) btnContainer.input.cursor = 'pointer';

    const renderBtn = (isHover: boolean = false) => {
      btnBg.clear();
      const fill = enabled ? (isHover ? 0x1b3827 : 0x14281e) : (isHover ? 0x3d1c21 : 0x2b1418);
      const stroke = enabled ? (isHover ? 0x2ecc71 : 0x27ae60) : (isHover ? 0xe74c3c : 0xc0392b);
      btnBg.fillStyle(fill, 0.95);
      btnBg.fillRoundedRect(-btnBoxW / 2, -btnBoxH / 2, btnBoxW, btnBoxH, 4);
      btnBg.lineStyle(1.5, stroke, 0.95);
      btnBg.strokeRoundedRect(-btnBoxW / 2, -btnBoxH / 2, btnBoxW, btnBoxH, 4);

      btnTxt.setText(enabled ? '✔ ĐANG BẬT' : '✖ ĐÃ TẮT');
      btnTxt.setColor(enabled ? '#2ecc71' : '#e74c3c');
    };

    renderBtn();

    btnContainer.on('pointerover', () => renderBtn(true));
    btnContainer.on('pointerout', () => renderBtn(false));
    btnContainer.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      enabled = !enabled;
      renderBtn(true);
      onToggle(enabled);
    });

    container.add([bg, labelTxt, descTxt, btnContainer]);

    return {
      container,
      setEnabled: (val: boolean) => {
        enabled = val;
        renderBtn();
      }
    };
  }

  /**
   * Tạo Nút Xóa Bản Lưu an toàn với xác nhận 2 lần (2-Step Safe Confirmation)
   * Tránh hoàn toàn việc người chơi lỡ tay bấm nhầm xóa mất tiến trình.
   */
  public static createSafeClearSaveButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onConfirmed: () => void,
    width: number = 360,
    height: number = 32
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    let stage: 'IDLE' | 'CONFIRMING' | 'DONE' = 'IDLE';
    let timeoutTimer: number | null = null;

    const bg = scene.add.graphics();
    const txt = HDTextHelper.createText(scene, 0, 0, '🗑️ XÓA TIẾN TRÌNH BẢN LƯU', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5);

    const hitZone = scene.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });

    const cancelBtn = scene.add.container(width / 2 + 35, 0);
    const cancelBg = scene.add.graphics();
    cancelBg.fillStyle(0x273548, 0.95);
    cancelBg.fillRoundedRect(-24, -12, 48, 24, 4);
    cancelBg.lineStyle(1, 0x64748b, 0.85);
    cancelBg.strokeRoundedRect(-24, -12, 48, 24, 4);

    const cancelTxt = HDTextHelper.createText(scene, 0, 0, 'HỦY', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5, 0.5);
    cancelBtn.add([cancelBg, cancelTxt]);
    cancelBtn.setSize(48, 24);
    cancelBtn.setInteractive(new Phaser.Geom.Rectangle(-24, -12, 48, 24), Phaser.Geom.Rectangle.Contains);
    if (cancelBtn.input) cancelBtn.input.cursor = 'pointer';
    cancelBtn.setVisible(false);

    const resetToIdle = () => {
      stage = 'IDLE';
      cancelBtn.setVisible(false);
      if (timeoutTimer !== null) {
        window.clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      render(false);
    };

    const render = (isHover: boolean = false) => {
      bg.clear();
      if (stage === 'IDLE') {
        const fill = isHover ? 0x2b1418 : 0x1d1012;
        const stroke = isHover ? 0xe74c3c : 0x8a3324;
        bg.fillStyle(fill, 0.95);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
        bg.lineStyle(1.5, stroke, 0.85);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 4);
        txt.setText('🗑️ XÓA TIẾN TRÌNH BẢN LƯU');
        txt.setColor(isHover ? '#ff7675' : '#e74c3c');
      } else if (stage === 'CONFIRMING') {
        bg.fillStyle(0x4a1217, 0.98);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
        bg.lineStyle(2, 0xf1c40f, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 4);
        txt.setText('⚠️ XÁC NHẬN XÓA TIẾN TRÌNH? (BẤM LẦN NỮA)');
        txt.setColor('#f1c40f');
        cancelBtn.setVisible(true);
      } else if (stage === 'DONE') {
        bg.fillStyle(0x14281e, 0.95);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 4);
        bg.lineStyle(1.5, 0x2ecc71, 0.9);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 4);
        txt.setText('✔ ĐÃ XÓA TOÀN BỘ TIẾN TRÌNH THÀNH CÔNG');
        txt.setColor('#2ecc71');
        cancelBtn.setVisible(false);
      }
    };

    render(false);

    hitZone.on('pointerover', () => render(true));
    hitZone.on('pointerout', () => render(false));
    hitZone.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();

      if (stage === 'IDLE') {
        stage = 'CONFIRMING';
        render(true);
        // Tự động hoàn tác sau 5 giây nếu người chơi không bấm tiếp
        timeoutTimer = window.setTimeout(() => {
          resetToIdle();
        }, 5000);
      } else if (stage === 'CONFIRMING') {
        if (timeoutTimer !== null) {
          window.clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
        stage = 'DONE';
        render(false);
        onConfirmed();
        // Sau 3 giây trở về trạng thái IDLE
        window.setTimeout(() => {
          resetToIdle();
        }, 3000);
      }
    });

    cancelBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      resetToIdle();
    });

    container.add([bg, txt, hitZone, cancelBtn]);
    return container;
  }
}
