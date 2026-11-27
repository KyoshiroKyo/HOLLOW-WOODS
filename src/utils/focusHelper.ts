/**
 * RT-002: Focus canvas an toàn theo Permissions Policy `focus-without-user-activation`.
 * Chỉ gọi `canvas.focus({ preventScroll: true })` khi trình duyệt đang có user activation
 * và không gọi `window.focus()` để tránh vi phạm trong iframe sandbox của P2Game.
 */
export function focusGameCanvasSafely(canvas?: HTMLCanvasElement | null): boolean {
  if (typeof document === 'undefined') return false;
  const nav = typeof navigator !== 'undefined'
    ? (navigator as Navigator & { userActivation?: { isActive?: boolean } })
    : undefined;
  if (!nav?.userActivation?.isActive) {
    return false;
  }

  const target = canvas ?? (document.getElementById('game-canvas') as HTMLCanvasElement | null);
  if (!target || typeof target.focus !== 'function') {
    return false;
  }
  if (document.activeElement === target) {
    return true;
  }

  try {
    target.focus({ preventScroll: true });
    return true;
  } catch {
    return false;
  }
}
