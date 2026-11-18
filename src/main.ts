import * as Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { ScaleManager } from './utils/ScaleManager';

window.addEventListener('DOMContentLoaded', async () => {
  // 1. Khởi tạo P2Game SDK trước khi dựng game Phaser
  try {
    if (typeof window !== 'undefined' && window.p2 && typeof window.p2.init === 'function') {
      const ctx = await window.p2.init({
        timeoutMs: 10000,
        allowStandalone: true,
        debug: false
      });
      console.log('[P2Game SDK] Khởi tạo thành công:', ctx?.sessionId ?? 'standalone');
    } else {
      console.warn('[P2Game SDK] Không tìm thấy window.p2, chạy ở chế độ dự phòng.');
    }
  } catch (err) {
    console.warn('[P2Game SDK] Cảnh báo lỗi khởi tạo SDK (dự phòng standalone):', err);
  }

  const canUseWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  })();

  const existingCanvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  const game = new Phaser.Game({
    ...GameConfig,
    autoFocus: false,
    type: canUseWebGL ? Phaser.WEBGL : Phaser.CANVAS,
    ...(existingCanvas ? { canvas: existingCanvas } : {})
  });

  // Gắn tham chiếu game vào window phục vụ kiểm thử QA & Automation
  if (typeof window !== 'undefined') {
    (window as any).__PHASER_GAME__ = game;
  }

  // 2. Đăng ký vòng đời p2.onPause và p2.onResume cho Phaser Game Loop
  try {
    if (typeof window !== 'undefined' && window.p2) {
      if (typeof window.p2.onPause === 'function') {
        window.p2.onPause(() => {
          console.log('[P2Game SDK] onPause: Tạm dừng game.loop');
          game.loop.sleep();
        });
      }
      if (typeof window.p2.onResume === 'function') {
        window.p2.onResume(() => {
          console.log('[P2Game SDK] onResume: Đánh thức game.loop');
          game.loop.wake();
        });
      }
    }
  } catch (lifecycleErr) {
    console.warn('[P2Game SDK] Lỗi khi đăng ký sự kiện vòng đời:', lifecycleErr);
  }

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

