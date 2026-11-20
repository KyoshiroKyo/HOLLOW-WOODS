// Keeps the startup status available until a rendered Main Menu acknowledges readiness.
(() => {
  const status = document.getElementById('game-startup');
  const message = document.getElementById('game-startup-message');
  const fail = (text) => {
    if (status.hidden || status.dataset.state === 'error') return;
    status.dataset.state = 'error';
    message.textContent = text;
    console.error('[HOLLOW WOODS startup]', text);
  };
  const timer = window.setTimeout(() => {
    fail('Khởi động quá lâu. Hãy kiểm tra kết nối rồi tải lại.');
  }, 45000);

  window.addEventListener('error', (event) => {
    const target = event.target;
    if (target instanceof HTMLScriptElement && target.type === 'module') {
      fail('Không tải được mã trò chơi. Hãy tải lại trang.');
    } else if (event instanceof ErrorEvent) {
      fail('Có lỗi khi khởi động trò chơi. Hãy tải lại trang.');
    }
  }, true);

  window.addEventListener('hollow-woods:startup-ready', () => {
    window.clearTimeout(timer);
    status.hidden = true;
  }, { once: true });
})();
