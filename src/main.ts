import * as Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { ScaleManager } from './utils/ScaleManager';
import { SaveManager } from './systems/SaveManager';
import { SCENE_MAIN_MENU } from './config/Constants';

async function withDeadline<T>(pending: Promise<T>, delayMs: number, failure: string): Promise<T> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      pending,
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(failure)), delayMs);
      }),
    ]);
  } finally {
    window.clearTimeout(timer);
  }
}

async function waitForSdkScript(): Promise<void> {
  const src = document.getElementById('game-container')?.dataset.sdkSrc;
  if (window.p2 || !src) return;
  const script = document.createElement('script');
  script.id = 'p2game-sdk';
  script.src = src;
  const events = new AbortController();
  const loaded = new Promise<void>((resolve) => {
    script.addEventListener('load', () => resolve(), { signal: events.signal });
    script.addEventListener('error', () => resolve(), { signal: events.signal });
  });
  document.head.append(script);
  try {
    await withDeadline(loaded, 12000, 'P2Game tải quá lâu. Hãy kiểm tra mạng rồi tải lại.');
  } finally {
    events.abort();
  }
}

async function initSdk(): Promise<void> {
  try {
    if (typeof window.p2?.init !== 'function') {
      console.warn('[P2Game SDK] Không tìm thấy window.p2, chạy ở chế độ dự phòng.');
      return;
    }
    const ctx = await window.p2.init({
      timeoutMs: 10000,
      allowStandalone: true,
      debug: false
    });
    console.log('[P2Game SDK] Khởi tạo thành công:', ctx?.sessionId ?? 'standalone');
  } catch (err) {
    console.warn('[P2Game SDK] Cảnh báo lỗi khởi tạo SDK (dự phòng standalone):', err);
  }
}

async function startGame(): Promise<void> {
  const uiFontSample = 'Sinh Lực · Thể Lực · Tinh Thần · Vòng Sáng';
  const uiFontsReady = Promise.allSettled([
    document.fonts.load('400 16px "Hollow Woods UI"', uiFontSample),
    document.fonts.load('700 16px "Hollow Woods UI"', uiFontSample),
  ]);
  await waitForSdkScript();
  await withDeadline(initSdk(), 11000, 'P2Game chưa phản hồi. Hãy tải lại để kết nối lại.');
  await withDeadline(uiFontsReady, 4500, 'Font trò chơi tải chậm.').catch((error) => {
    console.warn('[HOLLOW WOODS startup]', error);
  });

  const canUseWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  })();

  const existingCanvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (existingCanvas) {
    existingCanvas.tabIndex = 0;
    existingCanvas.style.outline = 'none';
  }

  const game = new Phaser.Game({
    ...GameConfig,
    autoFocus: true,
    type: canUseWebGL ? Phaser.WEBGL : Phaser.CANVAS,
    ...(existingCanvas ? { canvas: existingCanvas } : {})
  });

  const onMenuRendered = () => {
    if (game.scene.isActive(SCENE_MAIN_MENU) && game.canvas.clientWidth > 0 && game.canvas.clientHeight > 0) {
      game.events.off(Phaser.Core.Events.POST_RENDER, onMenuRendered);
      window.dispatchEvent(new Event('hollow-woods:startup-ready'));
    }
  };
  game.events.on(Phaser.Core.Events.POST_RENDER, onMenuRendered);

  const focusGameCanvas = () => {
    try {
      window.focus();
      const cv = game.canvas || existingCanvas;
      if (cv && typeof cv.focus === 'function') {
        cv.focus();
      }
    } catch {}
  };

  // Gắn tham chiếu game vào window phục vụ kiểm thử QA & Automation
  if (typeof window !== 'undefined') {
    (window as any).__PHASER_GAME__ = game;
    (window as any).__FOCUS_GAME__ = focusGameCanvas;
  }

  // Tự động nhận tiêu điểm bàn phím khi người chơi click/chạm vào màn hình Web / iframe
  window.addEventListener('pointerdown', () => focusGameCanvas(), { passive: true });
  window.addEventListener('click', () => focusGameCanvas(), { passive: true });

  // V15-48: Chặn trình duyệt / iframe cuộn trang ngoài ý muốn khi nhấn phím điều hướng & phím Space
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) ||
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
    ) {
      e.preventDefault();
    }
  }, { passive: false });

  // 2. Đăng ký đủ 3 sự kiện vòng đời P2Game SDK (onPause, onResume, onBeforeUnload)
  try {
    if (typeof window !== 'undefined' && window.p2) {
      if (typeof window.p2.onPause === 'function') {
        window.p2.onPause(() => {
          console.log('[P2Game SDK] onPause: Tạm dừng game & âm thanh');
          game.loop.sleep();
          try {
            if (game.sound) game.sound.pauseAll();
          } catch {}
        });
      }
      if (typeof window.p2.onResume === 'function') {
        window.p2.onResume(() => {
          console.log('[P2Game SDK] onResume: Khôi phục game & âm thanh');
          game.loop.wake();
          try {
            if (game.sound) game.sound.resumeAll();
          } catch {}
        });
      }
      if (typeof window.p2.onBeforeUnload === 'function') {
        window.p2.onBeforeUnload(() => {
          console.log('[P2Game SDK] onBeforeUnload: Lưu nhanh tiến trình');
          try {
            SaveManager.quickSaveOnUnload();
          } catch (unloadErr) {
            console.warn('[P2Game SDK] Lỗi lưu nhanh onBeforeUnload:', unloadErr);
          }
        });
      }
    }
  } catch (lifecycleErr) {
    console.warn('[P2Game SDK] Lỗi khi đăng ký sự kiện vòng đời:', lifecycleErr);
  }

  game.events.once(Phaser.Core.Events.READY, () => {
    game.canvas.tabIndex = 0;
    game.canvas.style.outline = 'none';
    const updateSampling = () => ScaleManager.applyCanvasSampling(game.canvas);
    updateSampling();
    game.scale.on(Phaser.Scale.Events.RESIZE, updateSampling);
    game.events.once(Phaser.Core.Events.DESTROY, () => {
      game.scale.off(Phaser.Scale.Events.RESIZE, updateSampling);
    });
    focusGameCanvas();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  void startGame().catch((error: unknown) => {
    console.error('[HOLLOW WOODS startup]', error);
    const status = document.getElementById('game-startup');
    const message = document.getElementById('game-startup-message');
    if (status) status.dataset.state = 'error';
    if (message) {
      message.textContent = error instanceof Error && error.message.startsWith('P2Game')
        ? error.message
        : 'Không thể khởi động trò chơi. Hãy kiểm tra kết nối rồi tải lại.';
    }
  });
}, { once: true });

