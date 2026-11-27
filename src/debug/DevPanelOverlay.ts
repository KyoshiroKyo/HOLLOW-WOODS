import * as Phaser from 'phaser';
import { DeveloperModeManager } from './DeveloperModeManager';
import type { InspectorLayer } from '../utils/HitboxDebugInspector';
import itemData from '../data/items.json';

type DevAction = (...args: unknown[]) => unknown;
export type DevPanelMode = 'full' | 'compact' | 'pill';

interface SavedDevPanelState {
  x: number;
  y: number;
  alpha: number;
  mode: DevPanelMode;
}

const ZONES = [
  ['fog_crossing', 'Ngã Rẽ Sương Mù'], ['bellhollow', 'Bellhollow'], ['sanctuary_farm', 'Nông Trại'],
  ['outer_woods', 'Rừng Ngoài'], ['crooked_path', 'Đường Mòn Cong'], ['deep_forest', 'Rừng Sâu'],
  ['silent_mire', 'Đầm Lầy Tĩnh Lặng'], ['ancient_rune_puzzle', 'Cổ Ngữ'], ['broken_bell_shrine', 'Miếu Chuông Vỡ'],
  ['sub_bell_workshop', 'Xưởng Chuông'], ['sub_root_cellar', 'Hầm Rễ'], ['sub_whispering_clearing', 'Khoảng Trống Thì Thầm'],
  ['abyssal_chasm', 'Vực Thẳm'], ['drowned_mire_depths', 'Đầm Lầy Chìm'], ['whispering_grove_sanctum', 'Thánh Địa Rừng Thì Thầm'],
  ['sunken_crypt_ruins', 'Hầm Mộ Chìm'], ['veil_origin_cavern', 'Hang Nguồn Màn Sương']
] as const;

const CSS = `
:root {
  --dp-bg-alpha: 0.8;
}
#dev-panel-overlay {
  position: fixed;
  left: 20px;
  top: 20px;
  width: 330px;
  max-width: calc(100vw - 16px);
  max-height: min(85vh, 680px);
  z-index: 2147483647;
  display: none;
  box-sizing: border-box;
  background: rgba(12, 14, 18, var(--dp-bg-alpha, 0.8));
  color: #d8e0e5;
  border: 1px solid #56616b;
  border-radius: 6px;
  font: 12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}
#dev-panel-overlay * { box-sizing: border-box; }

/* Header & Drag Handle */
#dev-panel-overlay .dp-head {
  position: sticky;
  top: 0;
  background: rgba(21, 26, 32, 0.95);
  border-bottom: 1px solid #38434d;
  padding: 8px 10px;
  z-index: 2;
  flex-shrink: 0;
  cursor: grab;
}
#dev-panel-overlay .dp-head:active {
  cursor: grabbing;
}
#dev-panel-overlay .dp-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-weight: 700;
  color: #f2c879;
}
#dev-panel-overlay .dp-drag-handle {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}
#dev-panel-overlay .dp-drag-icon {
  font-size: 13px;
  color: #8b99a4;
}
#dev-panel-overlay .dp-head-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
#dev-panel-overlay .dp-btn-sm {
  padding: 2px 6px;
  font-size: 11px;
  line-height: 1.2;
}

#dev-panel-overlay .dp-stats {
  color: #aebac4;
  margin: 5px 0 4px;
  font-size: 11px;
  white-space: normal;
}
#dev-panel-overlay .dp-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}
#dev-panel-overlay .dp-badge {
  border: 0;
  border-radius: 10px;
  background: #9d2525;
  color: #fff;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 11px;
}
#dev-panel-overlay .dp-opacity-box {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #9cb0bf;
}
#dev-panel-overlay .dp-alpha-slider {
  width: 70px;
  cursor: pointer;
  accent-color: #d5a64f;
  padding: 0;
  margin: 0;
}

#dev-panel-overlay button, #dev-panel-overlay select, #dev-panel-overlay input {
  font: inherit;
  color: inherit;
  background: #202830;
  border: 1px solid #46525d;
  border-radius: 3px;
  padding: 4px 6px;
}
#dev-panel-overlay button { cursor: pointer; }
#dev-panel-overlay button:hover, #dev-panel-overlay button[aria-pressed=true] { background: #34414b; }
#dev-panel-overlay .dp-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  margin-top: 8px;
}
#dev-panel-overlay .dp-tabs button {
  padding: 4px 1px;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#dev-panel-overlay .dp-tabs button[aria-selected=true] {
  background: #755f35;
  color: #fff;
  border-color: #f2c879;
}
#dev-panel-overlay .dp-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  user-select: text;
}
#dev-panel-overlay .dp-section {
  border: 1px solid #303a43;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: rgba(18, 22, 28, 0.4);
}
#dev-panel-overlay h3 {
  font-size: 11px;
  color: #f2c879;
  margin: 0 0 7px;
  text-transform: uppercase;
  letter-spacing: .07em;
}
#dev-panel-overlay label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 6px 0;
}
#dev-panel-overlay .dp-row {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  margin: 6px 0;
}
#dev-panel-overlay .dp-row > * { flex: 1; }
#dev-panel-overlay input[type=checkbox] { flex: 0 0 auto; accent-color: #d5a64f; }
#dev-panel-overlay input[type=range] { width: 100%; padding: 0; }
#dev-panel-overlay .dp-log {
  max-height: 200px;
  overflow: auto;
  color: #b9c5cd;
  white-space: pre-wrap;
  word-break: break-word;
}
#dev-panel-overlay .dp-note { color: #e1aa74; font-size: 10px; }
#dev-panel-overlay .dp-entity {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #303a43;
  padding: 5px 0;
}

/* Compact HUD Mode */
#dev-panel-overlay.dp-mode-compact {
  width: 320px;
  max-height: none;
}
#dev-panel-overlay.dp-mode-compact .dp-tabs,
#dev-panel-overlay.dp-mode-compact .dp-body {
  display: none !important;
}

/* Movable Pill Mode */
#dev-panel-overlay.dp-mode-pill {
  width: auto;
  min-width: 170px;
  max-width: 280px;
  border-radius: 20px;
  border: 1px solid #d5a64f;
  padding: 4px 10px;
  cursor: grab;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.7);
}
#dev-panel-overlay.dp-mode-pill:active {
  cursor: grabbing;
}
#dev-panel-overlay.dp-mode-pill .dp-head,
#dev-panel-overlay.dp-mode-pill .dp-body {
  display: none !important;
}
#dev-panel-overlay .dp-pill-wrap {
  display: none;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
#dev-panel-overlay.dp-mode-pill .dp-pill-wrap {
  display: flex !important;
}
#dev-panel-overlay .dp-pill-label {
  font-weight: 700;
  color: #f2c879;
  font-size: 11px;
}
#dev-panel-overlay .dp-pill-stat {
  color: #aebac4;
  font-size: 11px;
}
#dev-panel-overlay .dp-pill-actions {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
}
#dev-panel-overlay .dp-pill-btn {
  padding: 2px 5px;
  font-size: 10px;
  line-height: 1.2;
}
`;

/** HTML developer UI. It lives outside the Phaser canvas and adds no WebGL draw calls. */
export class DevPanelOverlay {
  private static readonly STORAGE_KEY = 'hw_qa_dev_panel_state';

  public readonly manager: DeveloperModeManager;
  private readonly root: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private readonly statLine: HTMLDivElement;
  private readonly badge: HTMLButtonElement;
  private readonly alphaSlider: HTMLInputElement;
  private readonly alphaText: HTMLElement;
  private readonly pillStat: HTMLElement;
  private timer: number | null = null;
  private activeTab = 0;
  private mode: DevPanelMode = 'full';
  private alpha = 0.8;
  private currentLeft = 20;
  private currentTop = 20;
  private selectedItem = '';

  // Drag state
  private isDragging = false;
  private dragPointerId = -1;
  private startPointerX = 0;
  private startPointerY = 0;
  private startPanelLeft = 0;
  private startPanelTop = 0;

  private readonly layers: Record<InspectorLayer, { label: string; checked: boolean }> = {
    showColliders: { label: 'Collider tĩnh/động', checked: true },
    showHitboxes: { label: 'Hitbox đòn đánh', checked: true },
    showHurtboxes: { label: 'Hurtbox Listener', checked: false },
    showTriggers: { label: 'Cửa chuyển vùng', checked: true },
    showInteractRanges: { label: 'Vùng tương tác', checked: true },
    showAIRanges: { label: 'Tầm nghe AI', checked: true },
    showCamera: { label: 'Viewport và camera bounds', checked: false },
    showWorld: { label: 'Giới hạn physics và zone', checked: false },
    showSafeZones: { label: 'Vùng an toàn / Vòng Sáng', checked: false },
    enableObjectPicker: { label: 'Click soi Object', checked: false }
  };

  public constructor(manager: DeveloperModeManager = DeveloperModeManager.getInstance()) {
    void Phaser;
    this.manager = manager;
    if (!document.getElementById('dev-panel-overlay-style')) {
      const style = document.createElement('style');
      style.id = 'dev-panel-overlay-style';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    this.root = document.createElement('div');
    this.root.id = 'dev-panel-overlay';
    this.root.setAttribute('aria-label', 'Developer Mode');
    this.root.setAttribute('tabindex', '-1');
    this.root.innerHTML = `
      <div class="dp-head">
        <div class="dp-title">
          <div class="dp-drag-handle" title="Kéo để di chuyển">
            <span class="dp-drag-icon">⠿</span>
            <span class="dp-title-text">HOLLOW WOODS · DEV</span>
          </div>
          <div class="dp-head-actions">
            <button class="dp-btn-sm" data-action="reset-pos" title="Đặt lại vị trí mặc định">↺</button>
            <button class="dp-btn-sm" data-action="mode-compact" title="Thu gọn thành HUD">_</button>
            <button class="dp-btn-sm" data-action="mode-pill" title="Thu nhỏ thành DEV Pill">●</button>
            <button class="dp-btn-sm dp-close" data-action="close" title="Đóng Dev Mode (F9)">✕</button>
          </div>
        </div>
        <div class="dp-stats"></div>
        <div class="dp-subhead">
          <button class="dp-badge" data-action="logs" title="Bug & Cảnh báo">● 0</button>
          <div class="dp-opacity-box">
            <span>Nền: <b class="dp-alpha-text">80%</b></span>
            <input type="range" class="dp-alpha-slider" min="30" max="95" value="80" data-action="alpha" title="Độ mờ nền Dev Panel (30% - 95%)">
          </div>
        </div>
        <div class="dp-tabs" role="tablist"></div>
      </div>
      <div class="dp-body"></div>
      <div class="dp-pill-wrap" title="Kéo để di chuyển, nhấp đúp để mở rộng">
        <span class="dp-drag-icon">⠿</span>
        <span class="dp-pill-label">DEV</span>
        <span class="dp-pill-stat" data-pill-stat>60 FPS</span>
        <div class="dp-pill-actions">
          <button class="dp-pill-btn" data-action="mode-compact" title="Mở Compact HUD">HUD</button>
          <button class="dp-pill-btn" data-action="mode-full" title="Mở Full Dev Panel">⛶</button>
          <button class="dp-pill-btn" data-action="close" title="Đóng Dev Mode (F9)">✕</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.body = this.root.querySelector('.dp-body') as HTMLDivElement;
    this.statLine = this.root.querySelector('.dp-stats') as HTMLDivElement;
    this.badge = this.root.querySelector('.dp-badge') as HTMLButtonElement;
    this.alphaSlider = this.root.querySelector('.dp-alpha-slider') as HTMLInputElement;
    this.alphaText = this.root.querySelector('.dp-alpha-text') as HTMLElement;
    this.pillStat = this.root.querySelector('[data-pill-stat]') as HTMLElement;

    this.loadState();
    this.applyMode();
    this.applyAlpha();
    this.applyPosition();

    this.buildTabs();
    this.renderTab();

    // Event listeners
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('change', this.onChange);
    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('keydown', this.onKeyDown);
    this.root.addEventListener('pointerdown', this.onPointerDown);
    this.root.addEventListener('pointermove', this.onPointerMove);
    this.root.addEventListener('pointerup', this.onPointerUp);
    this.root.addEventListener('pointercancel', this.onPointerCancel);
    this.root.addEventListener('dblclick', this.onDblClick);
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onWindowKeyDown);
  }

  public show(): void {
    this.root.style.display = 'flex';
    this.clampToViewport();
    this.syncControls();
    this.update();
    if (this.timer === null) {
      this.timer = window.setInterval(() => this.update(), 250);
    }
  }

  public hide(): void {
    const restoreFocus = this.root.contains(document.activeElement);
    this.root.style.display = 'none';
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (restoreFocus) {
      document.getElementById('game-canvas')?.focus();
    }
  }

  public toggle(): void {
    this.root.style.display === 'none' ? this.show() : this.hide();
  }

  public setMode(mode: DevPanelMode): void {
    this.mode = mode;
    this.applyMode();
    this.clampToViewport();
    this.update();
    this.saveState();
  }

  public getMode(): DevPanelMode {
    return this.mode;
  }

  public destroy(): void {
    this.hide();
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onWindowKeyDown);
    this.root.removeEventListener('click', this.onClick);
    this.root.removeEventListener('change', this.onChange);
    this.root.removeEventListener('input', this.onInput);
    this.root.removeEventListener('keydown', this.onKeyDown);
    this.root.removeEventListener('pointerdown', this.onPointerDown);
    this.root.removeEventListener('pointermove', this.onPointerMove);
    this.root.removeEventListener('pointerup', this.onPointerUp);
    this.root.removeEventListener('pointercancel', this.onPointerCancel);
    this.root.removeEventListener('dblclick', this.onDblClick);
    this.root.remove();
  }

  private applyMode(): void {
    this.root.classList.remove('dp-mode-compact', 'dp-mode-pill');
    if (this.mode === 'compact') {
      this.root.classList.add('dp-mode-compact');
    } else if (this.mode === 'pill') {
      this.root.classList.add('dp-mode-pill');
    }
  }

  private applyAlpha(): void {
    this.root.style.setProperty('--dp-bg-alpha', String(this.alpha));
    const percent = `${Math.round(this.alpha * 100)}%`;
    if (this.alphaText) this.alphaText.textContent = percent;
    if (this.alphaSlider && Number(this.alphaSlider.value) !== Math.round(this.alpha * 100)) {
      this.alphaSlider.value = String(Math.round(this.alpha * 100));
    }
  }

  private applyPosition(): void {
    this.root.style.left = `${Math.round(this.currentLeft)}px`;
    this.root.style.top = `${Math.round(this.currentTop)}px`;
    this.root.style.right = 'auto';
    this.root.style.bottom = 'auto';
  }

  private clampToViewport(): void {
    const pad = 10;
    const width = this.root.offsetWidth || (this.mode === 'pill' ? 180 : 330);
    const height = this.root.offsetHeight || (this.mode === 'pill' ? 36 : (this.mode === 'compact' ? 110 : 450));
    const maxLeft = Math.max(pad, window.innerWidth - width - pad);
    const maxTop = Math.max(pad, window.innerHeight - height - pad);
    this.currentLeft = Math.min(Math.max(pad, this.currentLeft), maxLeft);
    this.currentTop = Math.min(Math.max(pad, this.currentTop), maxTop);
    this.applyPosition();
  }

  private resetPosition(): void {
    const width = this.mode === 'pill' ? 180 : 330;
    this.currentLeft = Math.max(10, window.innerWidth - width - 16);
    this.currentTop = 16;
    this.applyPosition();
    this.saveState();
  }

  private onWindowResize = (): void => {
    this.clampToViewport();
  };

  private loadState(): void {
    this.currentLeft = Math.max(10, window.innerWidth - 330 - 16);
    this.currentTop = 16;
    this.alpha = 0.8;
    this.mode = 'full';

    try {
      const raw = localStorage.getItem(DevPanelOverlay.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Partial<SavedDevPanelState>;
        if (typeof data.x === 'number' && Number.isFinite(data.x)) this.currentLeft = data.x;
        if (typeof data.y === 'number' && Number.isFinite(data.y)) this.currentTop = data.y;
        if (typeof data.alpha === 'number' && Number.isFinite(data.alpha) && data.alpha >= 30 && data.alpha <= 95) {
          this.alpha = data.alpha / 100;
        }
        if (data.mode === 'full' || data.mode === 'compact' || data.mode === 'pill') {
          this.mode = data.mode;
        }
      }
    } catch {
      // Ignore storage error
    }
  }

  private saveState(): void {
    try {
      const data: SavedDevPanelState = {
        x: Math.round(this.currentLeft),
        y: Math.round(this.currentTop),
        alpha: Math.round(this.alpha * 100),
        mode: this.mode
      };
      localStorage.setItem(DevPanelOverlay.STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota error
    }
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('button, input, select, textarea, [data-nodrag], [role="tab"]')) {
      return;
    }
    if (this.mode !== 'pill' && !target.closest('.dp-head')) {
      return;
    }

    this.isDragging = true;
    this.dragPointerId = event.pointerId;
    this.startPointerX = event.clientX;
    this.startPointerY = event.clientY;
    this.startPanelLeft = this.currentLeft;
    this.startPanelTop = this.currentTop;

    try {
      this.root.setPointerCapture(event.pointerId);
    } catch {
      // Ignore capture error
    }
    event.preventDefault();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging || event.pointerId !== this.dragPointerId) return;

    const deltaX = event.clientX - this.startPointerX;
    const deltaY = event.clientY - this.startPointerY;
    const rawLeft = this.startPanelLeft + deltaX;
    const rawTop = this.startPanelTop + deltaY;

    const pad = 10;
    const width = this.root.offsetWidth || (this.mode === 'pill' ? 180 : 330);
    const height = this.root.offsetHeight || (this.mode === 'pill' ? 36 : (this.mode === 'compact' ? 110 : 450));
    const maxLeft = Math.max(pad, window.innerWidth - width - pad);
    const maxTop = Math.max(pad, window.innerHeight - height - pad);

    let left = Math.min(Math.max(pad, rawLeft), maxLeft);
    let top = Math.min(Math.max(pad, rawTop), maxTop);

    // Subtle edge snapping within 16px
    if (left < pad + 16) left = pad;
    else if (left > maxLeft - 16) left = maxLeft;

    this.currentLeft = left;
    this.currentTop = top;
    this.applyPosition();
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.isDragging || event.pointerId !== this.dragPointerId) return;
    this.isDragging = false;
    this.dragPointerId = -1;
    try {
      this.root.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore capture release error
    }
    this.saveState();
  };

  private onPointerCancel = (event: PointerEvent): void => {
    if (!this.isDragging || event.pointerId !== this.dragPointerId) return;
    this.isDragging = false;
    this.dragPointerId = -1;
    try {
      this.root.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore capture release error
    }
  };

  private onDblClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (target.closest('button, input, select, textarea')) return;
    if (this.mode === 'pill') {
      this.setMode('full');
    }
  };

  private buildTabs(): void {
    const tabs = ['Log & Hiệu năng', 'Di chuyển & Map', 'Nhân vật & Đồ', 'Nhiệm vụ & MT', 'Thực thể & AI'];
    const holder = this.root.querySelector('.dp-tabs') as HTMLDivElement;
    tabs.forEach((name, i) => {
      const button = document.createElement('button');
      button.textContent = name;
      button.title = name;
      button.setAttribute('role', 'tab');
      button.dataset.tab = String(i);
      holder.appendChild(button);
    });
  }

  private renderTab(): void {
    this.root.querySelectorAll('[role=tab]').forEach(el =>
      el.setAttribute('aria-selected', String(Number((el as HTMLElement).dataset.tab) === this.activeTab))
    );
    const methods = [
      'getLogs', 'clearLogs', 'setNoclip', 'setSpeedMultiplier', 'teleportToZone', 'teleportToCoords',
      'setGodMode', 'setInfiniteStamina', 'setStats', 'giveItem', 'unlockAllGatesAndSeals', 'jumpToQuestStage',
      'setTimePhase', 'setFreezeTime', 'setFogEnabled', 'setRainEnabled', 'triggerEnding', 'setFreezeAI',
      'spawnTestMonster', 'getNearbyEntities'
    ];
    const api = this.manager as unknown as Record<string, unknown>;
    const missing = methods.filter(name => typeof api[name] !== 'function');
    const note = missing.length ? `<p class="dp-note">Một số điều khiển chưa khả dụng trong DeveloperModeManager hiện tại.</p>` : '';
    const sections = [this.logTab(), this.mapTab(), this.playerTab(), this.worldTab(), this.entityTab()];
    this.body.innerHTML = `${note}${sections[this.activeTab]}`;
    this.syncControls();
  }

  private logTab(): string {
    return `<section class="dp-section"><h3>Hiệu năng</h3><div data-perf></div><div data-profiler style="white-space:pre-line"></div></section><section class="dp-section"><h3>Bug / Warning</h3><div class="dp-row"><button data-action="copy-bug">Copy Bug Info</button><button data-action="copy-log">Copy Log</button><button data-action="clear-log">Xóa</button></div><div class="dp-log" data-logs></div></section>`;
  }
  private mapTab(): string {
    return `<section class="dp-section"><h3>Di chuyển</h3><label>Noclip <input type="checkbox" data-control="noclip"></label><div class="dp-row">${[1,2,3].map(n=>`<button data-action="speed" data-value="${n}">${n}x</button>`).join('')}</div><p>Hồi chiêu chiến đấu</p><div class="dp-row">${[1,2,3].map(n=>`<button data-action="combat-speed" data-value="${n}">${n}x</button>`).join('')}</div><label>Phân khu <select data-control="zone">${ZONES.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><div class="dp-row"><input placeholder="X" data-x type="number"><input placeholder="Y" data-y type="number"><button data-action="goto">Đi tới</button></div></section><section class="dp-section"><h3>Lớp debug</h3>${Object.entries(this.layers).map(([id, layer]) => `<label>${layer.label}<input type="checkbox" data-layer="${id}" ${layer.checked ? 'checked' : ''}></label>`).join('')}</section>`;
  }
  private playerTab(): string {
    return `<section class="dp-section"><h3>Nhân vật</h3><label>God Mode <input type="checkbox" data-control="god"></label><label>Vô hạn Thể Lực <input type="checkbox" data-control="stamina"></label><label>Vô hạn Tinh Thần <input type="checkbox" data-control="composure"></label><button data-action="refill">Hồi đầy chỉ số</button>${['HP','Stamina','Tinh Thần'].map((n,i)=>`<label>${n}<input type="range" min="0" max="100" value="100" data-stat="${i}"></label>`).join('')}<button data-action="sanity15">Tinh Thần = 15</button></section><section class="dp-section"><h3>Vật phẩm</h3><input placeholder="Lọc items.json…" data-search><div data-items></div><div class="dp-row"><button data-action="item" data-value="1">+1</button><button data-action="item" data-value="5">+5</button></div></section>`;
  }
  private worldTab(): string {
    return `<section class="dp-section"><h3>Nhiệm vụ & Môi trường</h3><button data-action="gates">Mở mọi Cổng & Phong Ấn</button><label>Xem chặng <select data-control="act"><option value="0">Tiến trình hiện tại</option>${[1,2,3,4,5,6,7].map(n=>`<option>${n}</option>`).join('')}</select></label><div class="dp-row">${['Ngày','Hoàng Hôn','Đêm'].map((n,i)=>`<button data-action="time" data-value="${i}">${n}</button>`).join('')}</div>${[['Đóng băng thời gian','timeFrozen'],['Sương mù','fog'],['Mưa','rain']].map(([n,id])=>`<label>${n}<input type="checkbox" data-control="${id}"></label>`).join('')}<div class="dp-row">${[['True','true'],['Sacrifice','sacrifice'],['Fog Loop','fog_loop']].map(([n,id])=>`<button data-action="ending" data-value="${id}">${n}</button>`).join('')}</div></section>`;
  }
  private entityTab(): string {
    return `<section class="dp-section"><h3>Thực thể & AI</h3><label>Đóng băng AI <input type="checkbox" data-control="aiFrozen"></label><div class="dp-row">${['The Listener','Skull Wolf','Fallen Knight'].map(n=>`<button data-action="spawn" data-value="${n}">${n}</button>`).join('')}</div><div data-entities></div></section>`;
  }

  private syncControls(): void {
    this.root.querySelectorAll<HTMLInputElement>('[data-control]').forEach(input => {
      const value = (({
        noclip: this.manager.isNoclip,
        god: this.manager.isGodMode,
        stamina: this.manager.isInfiniteStamina,
        composure: this.manager.isInfiniteComposure,
        timeFrozen: this.manager.freezeTime,
        fog: this.manager.fogEnabled,
        rain: this.manager.rainEnabled,
        aiFrozen: this.manager.isFreezeAI
      } as Record<string, boolean>)[input.dataset.control || '']);
      if (typeof value === 'boolean') input.checked = value;
    });
    this.refreshItems();
    this.refreshEntities();
    this.syncSpeeds();
  }

  private syncSpeeds(): void {
    const speeds = { speed: this.manager.speedMultiplier, 'combat-speed': this.manager.combatSpeedMultiplier };
    for (const button of this.body.querySelectorAll<HTMLButtonElement>('[data-action="speed"],[data-action="combat-speed"]')) {
      const action = button.dataset.action as keyof typeof speeds;
      button.setAttribute('aria-pressed', String(Number(button.dataset.value) === speeds[action]));
    }
  }

  private update = (): void => {
    const snapshot = this.manager.getPerfSnapshot();
    const logs = this.manager.getLogs();
    const bugs = this.manager.errorCount + this.manager.warnCount;

    if (this.pillStat) {
      this.pillStat.textContent = `${snapshot.fps?.toFixed(0) ?? '—'} FPS${bugs > 0 ? ` · ${bugs}!` : ''}`;
    }

    if (this.mode === 'pill') {
      // Avoid expensive tab/profiler DOM updates in Pill mode
      return;
    }

    this.badge.textContent = `● ${bugs}`;
    this.badge.title = `${this.manager.errorCount} Bug · ${this.manager.warnCount} Warn`;
    this.statLine.textContent = `FPS ${snapshot.fps?.toFixed(0) ?? '—'} · (${snapshot.player ? `${snapshot.player.x.toFixed(0)}, ${snapshot.player.y.toFixed(0)}` : '—'}) · ${snapshot.zoneId ?? '—'}`;

    if (this.mode === 'full' && this.activeTab === 0) {
      const perf = this.body.querySelector('[data-perf]');
      if (perf) {
        perf.innerHTML = `FPS: ${snapshot.fps?.toFixed(1) ?? '—'} · Frame: ${snapshot.frameTimeMs?.toFixed(1) ?? '—'} ms<br>Quan hệ va chạm: ${snapshot.colliderCount ?? '—'}<br>Body bật: ${snapshot.staticBodyCount ?? '—'} tĩnh · ${snapshot.dynamicBodyCount ?? '—'} động · Object: ${snapshot.gameObjectCount ?? '—'}<br>JS Heap: ${snapshot.jsHeapMb ?? '—'} MB<br>Audio: BGM ${snapshot.currentBGM ?? '—'} · Ambience ${snapshot.currentAmbience ?? '—'} · Heartbeat ${snapshot.isHeartbeatActive ?? '—'} · Sanity Duck ${snapshot.isSanityDucked ?? '—'}`;
      }
      const profiler = this.body.querySelector('[data-profiler]');
      const snapshotText = this.getProfilerInfo?.() ?? '';
      if (profiler && profiler.textContent !== snapshotText) profiler.textContent = snapshotText;
      const logNode = this.body.querySelector('[data-logs]');
      if (logNode) {
        logNode.textContent = logs.map(entry => `[${entry.time}] ${entry.level}: ${entry.message}${entry.count > 1 ? ` ×${entry.count}` : ''}`).join('\n') || 'Chưa có Bug / Warning';
      }
    }
  };

  private call(name: string, ...args: unknown[]): unknown {
    const fn = (this.manager as unknown as Record<string, unknown>)[name] as DevAction | undefined;
    if (!fn) return undefined;
    try {
      return fn.apply(this.manager, args);
    } catch (error) {
      console.warn(`Dev panel action ${name} failed`, error);
      return undefined;
    }
  }

  private onClick = (event: Event): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action],[data-tab]');
    if (!target) return;
    if (target.dataset.tab !== undefined) {
      this.activeTab = Number(target.dataset.tab);
      if (this.mode !== 'full') {
        this.setMode('full');
      } else {
        this.renderTab();
        this.update();
      }
      return;
    }
    const value = target.dataset.value;
    switch (target.dataset.action) {
      case 'close':
        this.manager.setEnabled(false);
        this.hide();
        break;
      case 'reset-pos':
        this.resetPosition();
        break;
      case 'mode-compact':
        this.setMode(this.mode === 'compact' ? 'full' : 'compact');
        break;
      case 'mode-pill':
        this.setMode('pill');
        break;
      case 'mode-full':
        this.setMode('full');
        break;
      case 'logs':
        this.activeTab = 0;
        if (this.mode !== 'full') this.setMode('full');
        this.renderTab();
        this.update();
        break;
      case 'copy-bug':
        this.copyBugInfo(target);
        break;
      case 'clear-log':
        this.manager.clearLogs();
        this.update();
        break;
      case 'copy-log': {
        // SE-004: Không gọi navigator.clipboard (P2Game sandbox cấm clipboard-write)
        const logText = this.manager.getLogs()
          .map(e => `[${e.time}] ${e.level}: ${e.message}${e.count > 1 ? ` ×${e.count}` : ''}`)
          .join('\n');
        this.presentCopyTextarea('[data-log-summary]', 'Dev Logs', logText, target, 'Đã chọn log');
        break;
      }
      case 'speed':
        this.manager.setSpeedMultiplier(Number(value) as 1 | 2 | 3);
        this.syncSpeeds();
        break;
      case 'combat-speed':
        this.manager.setCombatSpeedMultiplier(Number(value) as 1 | 2 | 3);
        this.syncSpeeds();
        break;
      case 'refill':
        this.manager.refillStats();
        break;
      case 'goto':
        this.manager.teleportToCoords(
          Number(this.root.querySelector<HTMLInputElement>('[data-x]')?.value),
          Number(this.root.querySelector<HTMLInputElement>('[data-y]')?.value)
        );
        break;
      case 'sanity15':
        this.manager.setStats({ composure: 15 });
        break;
      case 'item':
        if (this.selectedItem) this.manager.giveItem(this.selectedItem, Number(value));
        break;
      case 'gates':
        this.manager.unlockAllGatesAndSeals();
        break;
      case 'time':
        this.manager.setTimePhase(['DAY', 'DUSK', 'NIGHT'][Number(value)] as 'DAY' | 'DUSK' | 'NIGHT');
        break;
      case 'ending':
        this.manager.triggerEnding(value as 'true' | 'sacrifice' | 'fog_loop');
        break;
      case 'spawn':
        this.manager.spawnTestMonster(
          ({
            'The Listener': 'listener',
            'Skull Wolf': 'skull_wolf',
            'Fallen Knight': 'fallen_knight'
          } as Record<string, 'listener' | 'skull_wolf' | 'fallen_knight'>)[value || 'listener']
        );
        break;
    }
  };

  private onChange = (event: Event): void => {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    if (input.matches('[data-action="alpha"]')) {
      const val = Number((input as HTMLInputElement).value);
      this.alpha = Math.min(Math.max(30, val), 95) / 100;
      this.applyAlpha();
      this.saveState();
      return;
    }
    if (input.matches('[data-control]')) {
      if (input.dataset.control === 'act') {
        this.manager.jumpToQuestStage(Number(input.value));
        return;
      }
      const actions: Record<string, string> = {
        noclip: 'setNoclip',
        god: 'setGodMode',
        stamina: 'setInfiniteStamina',
        composure: 'setInfiniteComposure',
        timeFrozen: 'setFreezeTime',
        fog: 'setFogEnabled',
        rain: 'setRainEnabled',
        aiFrozen: 'setFreezeAI'
      };
      const action = actions[input.dataset.control || ''];
      if (action) this.call(action, input instanceof HTMLInputElement ? input.checked : input.value);
      if (input.dataset.control === 'zone') this.manager.teleportToZone(input.value);
    }
    if (input instanceof HTMLInputElement && input.dataset.layer !== undefined) {
      const layer = input.dataset.layer;
      if (Object.hasOwn(this.layers, layer)) {
        const key = layer as InspectorLayer;
        this.layers[key].checked = input.checked;
        this.layerHandler?.(key, input.checked);
      }
    }
    if (input instanceof HTMLInputElement && input.dataset.stat !== undefined) {
      const key = ['hp', 'stamina', 'composure'][Number(input.dataset.stat)];
      this.manager.setStats({ [key]: Number(input.value) });
    }
  };

  private onInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    if (input.matches('[data-action="alpha"]')) {
      const val = Number(input.value);
      this.alpha = Math.min(Math.max(30, val), 95) / 100;
      this.applyAlpha();
      return;
    }
    if (input.matches('[data-search]')) {
      this.refreshItems(input.value);
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.manager.setEnabled(false);
      this.hide();
      document.getElementById('game-canvas')?.focus();
      return;
    }
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) {
      event.stopPropagation();
    }
  };

  private onWindowKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.root.style.display !== 'none') {
      event.preventDefault();
      this.manager.setEnabled(false);
      this.hide();
      document.getElementById('game-canvas')?.focus();
    }
  };

  public layerHandler?: (layer: InspectorLayer, enabled: boolean) => void;
  public getBugInfo?: () => string;
  public getProfilerInfo?: () => string;

  private presentCopyTextarea(
    selector: string,
    ariaLabel: string,
    text: string,
    target: HTMLElement,
    label: string
  ): void {
    const area = this.body.querySelector<HTMLTextAreaElement>(selector) ?? document.createElement('textarea');
    if (selector === '[data-bug-summary]') area.dataset.bugSummary = '';
    else area.dataset.logSummary = '';
    area.readOnly = true;
    area.setAttribute('aria-label', ariaLabel);
    area.value = text;
    this.body.prepend(area);
    area.select();
    target.textContent = label;
  }

  private copyBugInfo(target: HTMLElement): void {
    const summary = this.getBugInfo?.();
    if (!summary) return;
    // SE-004: Không gọi navigator.clipboard để tuân thủ P2Game static scan (không khai báo clipboard-write)
    this.presentCopyTextarea('[data-bug-summary]', 'Bug Info', summary, target, 'Đã chọn thông tin');
  }

  private refreshItems(query = ''): void {
    const list = this.body.querySelector('[data-items]');
    if (!list) return;
    const needle = query.trim().toLocaleLowerCase();
    const found = itemData.items.filter(
      item => !needle || item.id.toLocaleLowerCase().includes(needle) || item.name.toLocaleLowerCase().includes(needle)
    );
    list.innerHTML = found.slice(0, 12).map(item => `<button data-item="${item.id}">${item.name}</button>`).join('');
    list.querySelectorAll<HTMLElement>('[data-item]').forEach(button =>
      button.addEventListener('click', () => {
        this.selectedItem = button.dataset.item || '';
      })
    );
  }

  private refreshEntities(): void {
    const list = this.body.querySelector('[data-entities]');
    if (!list) return;
    const entities = this.manager.getNearbyEntities();
    const rows = Array.isArray(entities) ? (entities as Array<{ id: string; name: string; x?: number; y?: number }>) : [];
    list.innerHTML =
      rows.map(e => `<div class="dp-entity"><span>${e.name} (${e.x?.toFixed(0) ?? '?'}, ${e.y?.toFixed(0) ?? '?'})</span><button data-fly="${e.id}">Bay tới</button></div>`).join('') ||
      '<p class="dp-note">Chưa có dữ liệu thực thể.</p>';
    list.querySelectorAll<HTMLElement>('[data-fly]').forEach(button =>
      button.addEventListener('click', () => {
        const id = button.dataset.fly;
        if (id) this.manager.teleportToNPC(id);
      })
    );
  }
}
