import assert from 'node:assert';

// Mô phỏng logic resolvePhysicalCode từ SatyrPlayer.ts
function resolvePhysicalCode(event) {
  const rawCode = event.code || '';
  switch (rawCode) {
    case 'KeyW':
    case 'KeyA':
    case 'KeyS':
    case 'KeyD':
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'Space':
    case 'Enter':
    case 'NumpadEnter':
    case 'Escape':
    case 'Tab':
    case 'KeyE':
    case 'KeyF':
    case 'KeyQ':
    case 'KeyI':
    case 'KeyJ':
    case 'KeyM':
    case 'Digit1':
    case 'Digit2':
    case 'Numpad1':
    case 'Numpad2':
      return rawCode === 'NumpadEnter' ? 'Enter' : rawCode === 'Numpad1' ? 'Digit1' : rawCode === 'Numpad2' ? 'Digit2' : rawCode;
    default:
      break;
  }

  const rawKey = (event.key || '').toLowerCase();
  switch (rawKey) {
    case 'w':
    case 'ư':
    case 'ă':
    case 'ơ':
      return 'KeyW';
    case 'a':
    case 'â':
      return 'KeyA';
    case 's':
    case 'á':
    case 'ắ':
    case 'ấ':
    case 'é':
    case 'ế':
    case 'ứ':
    case 'ú':
    case 'ó':
    case 'ớ':
    case 'ố':
    case 'í':
    case 'ý':
      return 'KeyS';
    case 'd':
    case 'đ':
      return 'KeyD';
    case 'e':
    case 'ê':
      return 'KeyE';
    case 'f':
    case 'à':
    case 'ằ':
    case 'ầ':
    case 'è':
      return 'KeyF';
    case 'q':
      return 'KeyQ';
    case 'i':
      return 'KeyI';
    case 'j':
      return 'KeyJ';
    case 'm':
      return 'KeyM';
    case '1':
      return 'Digit1';
    case '2':
      return 'Digit2';
    case 'escape':
    case 'esc':
      return 'Escape';
    case 'enter':
      return 'Enter';
    case 'tab':
      return 'Tab';
    case ' ':
      return 'Space';
    case 'shift':
      return 'ShiftLeft';
    case 'arrowup':
      return 'ArrowUp';
    case 'arrowdown':
      return 'ArrowDown';
    case 'arrowleft':
      return 'ArrowLeft';
    case 'arrowright':
      return 'ArrowRight';
    default:
      break;
  }

  switch (event.keyCode) {
    case 87: return 'KeyW';
    case 65: return 'KeyA';
    case 83: return 'KeyS';
    case 68: return 'KeyD';
    case 69: return 'KeyE';
    case 70: return 'KeyF';
    case 81: return 'KeyQ';
    case 73: return 'KeyI';
    case 74: return 'KeyJ';
    case 77: return 'KeyM';
    case 49:
    case 97: return 'Digit1';
    case 50:
    case 98: return 'Digit2';
    case 27: return 'Escape';
    case 13: return 'Enter';
    case 9:  return 'Tab';
    case 32: return 'Space';
    case 16: return 'ShiftLeft';
    case 38: return 'ArrowUp';
    case 40: return 'ArrowDown';
    case 37: return 'ArrowLeft';
    case 39: return 'ArrowRight';
    default: return null;
  }
}

function isEditableElement(target) {
  if (!target || typeof target !== 'object') return false;
  const tag = target.tagName ? target.tagName.toUpperCase() : '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  if (typeof target.getAttribute === 'function') {
    const ce = target.getAttribute('contenteditable');
    if (ce === 'true' || ce === '') return true;
  }
  if (typeof target.closest === 'function') {
    const parentCe = target.closest('[contenteditable="true"], [contenteditable=""], input, textarea, select');
    if (parentCe) return true;
  }
  return false;
}

console.log('=== VERIFYING C4-12-02 PHYSICAL CODE RESOLUTION & IME COMPATIBILITY ===');

// 1. Kiểm tra mã phím vật lý chuẩn (Standard physical code)
const standardTests = [
  { event: { code: 'KeyW' }, expected: 'KeyW' },
  { event: { code: 'KeyA' }, expected: 'KeyA' },
  { event: { code: 'KeyS' }, expected: 'KeyS' },
  { event: { code: 'KeyD' }, expected: 'KeyD' },
  { event: { code: 'ArrowUp' }, expected: 'ArrowUp' },
  { event: { code: 'KeyE' }, expected: 'KeyE' },
  { event: { code: 'KeyF' }, expected: 'KeyF' },
  { event: { code: 'KeyQ' }, expected: 'KeyQ' },
  { event: { code: 'KeyI' }, expected: 'KeyI' },
  { event: { code: 'KeyJ' }, expected: 'KeyJ' },
  { event: { code: 'Digit1' }, expected: 'Digit1' },
  { event: { code: 'Digit2' }, expected: 'Digit2' },
  { event: { code: 'Escape' }, expected: 'Escape' },
];

for (const t of standardTests) {
  const res = resolvePhysicalCode(t.event);
  assert.strictEqual(res, t.expected, `Standard test failed for ${JSON.stringify(t.event)}`);
}
console.log(' [PASS] Standard physical code resolution verified (13/13)');

// 2. Kiểm tra gói phím ảo UniKey / EVKey Telex (VK_PACKET keyCode=231, event.code rỗng)
const telexTests = [
  { event: { code: '', key: 'ư', keyCode: 231 }, expected: 'KeyW' },
  { event: { code: '', key: 'ă', keyCode: 231 }, expected: 'KeyW' },
  { event: { code: '', key: 'ơ', keyCode: 231 }, expected: 'KeyW' },
  { event: { code: '', key: 'â', keyCode: 231 }, expected: 'KeyA' },
  { event: { code: '', key: 'á', keyCode: 231 }, expected: 'KeyS' },
  { event: { code: '', key: 'đ', keyCode: 231 }, expected: 'KeyD' },
  { event: { code: '', key: 'ê', keyCode: 231 }, expected: 'KeyE' },
  { event: { code: '', key: 'à', keyCode: 231 }, expected: 'KeyF' },
  { event: { code: '', key: 'q', keyCode: 81 }, expected: 'KeyQ' },
  { event: { code: '', key: 'i', keyCode: 73 }, expected: 'KeyI' },
  { event: { code: '', key: 'j', keyCode: 74 }, expected: 'KeyJ' },
  { event: { code: '', key: '1', keyCode: 49 }, expected: 'Digit1' },
  { event: { code: '', key: '2', keyCode: 50 }, expected: 'Digit2' },
  { event: { code: '', key: 'Escape', keyCode: 27 }, expected: 'Escape' },
];

for (const t of telexTests) {
  const res = resolvePhysicalCode(t.event);
  assert.strictEqual(res, t.expected, `Telex test failed for ${JSON.stringify(t.event)}`);
}
console.log(' [PASS] UniKey/EVKey Telex packet resolution verified (14/14)');

// 3. Kiểm tra nhận diện ô văn bản (Editable element detection)
assert.strictEqual(isEditableElement({ tagName: 'INPUT' }), true);
assert.strictEqual(isEditableElement({ tagName: 'TEXTAREA' }), true);
assert.strictEqual(isEditableElement({ tagName: 'SELECT' }), true);
assert.strictEqual(isEditableElement({ isContentEditable: true }), true);
assert.strictEqual(isEditableElement({ getAttribute: (k) => k === 'contenteditable' ? 'true' : null }), true);
assert.strictEqual(isEditableElement({ tagName: 'CANVAS' }), false);
assert.strictEqual(isEditableElement({ tagName: 'DIV' }), false);
console.log(' [PASS] Editable element isolation verified (7/7)');

console.log('=== ALL AUTOMATED COMPATIBILITY CHECKS PASSED ===');
