import * as Phaser from 'phaser';
import { DeveloperModeManager } from './DeveloperModeManager';
import itemData from '../data/items.json';

type DevAction = (...args: unknown[]) => unknown;

const ZONES = [
  ['fog_crossing', 'Ngã Rẽ Sương Mù'], ['bellhollow', 'Bellhollow'], ['sanctuary_farm', 'Nông Trại'],
  ['outer_woods', 'Rừng Ngoài'], ['crooked_path', 'Đường Mòn Cong'], ['deep_forest', 'Rừng Sâu'],
  ['silent_mire', 'Đầm Lầy Tĩnh Lặng'], ['ancient_rune_puzzle', 'Cổ Ngữ'], ['broken_bell_shrine', 'Miếu Chuông Vỡ'],
  ['sub_bell_workshop', 'Xưởng Chuông'], ['sub_root_cellar', 'Hầm Rễ'], ['sub_whispering_clearing', 'Khoảng Trống Thì Thầm'],
  ['abyssal_chasm', 'Vực Thẳm'], ['drowned_mire_depths', 'Đầm Lầy Chìm'], ['whispering_grove_sanctum', 'Thánh Địa Rừng Thì Thầm'],
  ['sunken_crypt_ruins', 'Hầm Mộ Chìm'], ['veil_origin_cavern', 'Hang Nguồn Màn Sương']
] as const;

const CSS = `
#dev-panel-overlay{position:fixed;inset:0 0 0 auto;width:310px;max-width:92vw;z-index:2147483647;display:none;box-sizing:border-box;background:rgba(12,14,18,.92);color:#d8e0e5;border-left:1px solid #56616b;font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:-8px 0 28px #0008;backdrop-filter:blur(8px)}
#dev-panel-overlay *{box-sizing:border-box}#dev-panel-overlay .dp-head{position:sticky;top:0;background:#151a20;border-bottom:1px solid #38434d;padding:10px;z-index:2}#dev-panel-overlay .dp-title{display:flex;align-items:center;justify-content:space-between;font-weight:700;color:#f2c879}#dev-panel-overlay .dp-stats{color:#aebac4;margin:7px 0;white-space:normal}#dev-panel-overlay .dp-badge{border:0;border-radius:10px;background:#9d2525;color:#fff;padding:2px 8px;cursor:pointer}#dev-panel-overlay button,#dev-panel-overlay select,#dev-panel-overlay input{font:inherit;color:inherit;background:#202830;border:1px solid #46525d;border-radius:3px;padding:5px}#dev-panel-overlay button{cursor:pointer}#dev-panel-overlay button:hover{background:#34414b}#dev-panel-overlay .dp-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;margin-top:9px}#dev-panel-overlay .dp-tabs button{padding:5px 1px;font-size:10px}#dev-panel-overlay .dp-tabs button[aria-selected=true]{background:#755f35;color:#fff}#dev-panel-overlay .dp-body{height:calc(100% - 112px);overflow:auto;padding:10px}#dev-panel-overlay .dp-section{border:1px solid #303a43;padding:8px;margin-bottom:8px;border-radius:4px}#dev-panel-overlay h3{font-size:11px;color:#f2c879;margin:0 0 7px;text-transform:uppercase;letter-spacing:.07em}#dev-panel-overlay label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0}#dev-panel-overlay .dp-row{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin:6px 0}#dev-panel-overlay .dp-row>*{flex:1}#dev-panel-overlay input[type=checkbox]{flex:0 0 auto;accent-color:#d5a64f}#dev-panel-overlay input[type=range]{width:100%;padding:0}#dev-panel-overlay .dp-log{max-height:200px;overflow:auto;color:#b9c5cd;white-space:pre-wrap;word-break:break-word}#dev-panel-overlay .dp-note{color:#e1aa74;font-size:10px}#dev-panel-overlay .dp-close{float:right}#dev-panel-overlay .dp-entity{display:flex;justify-content:space-between;border-bottom:1px solid #303a43;padding:5px 0}
`;

/** HTML developer UI. It lives outside the Phaser canvas and adds no WebGL draw calls. */
export class DevPanelOverlay {
  private readonly manager: DeveloperModeManager;
  private readonly root: HTMLDivElement;
  private readonly body: HTMLDivElement;
  private readonly statLine: HTMLDivElement;
  private readonly badge: HTMLButtonElement;
  private timer: number | null = null;
  private activeTab = 0;
  private compact = false;
  private selectedItem = '';

  public constructor(manager: DeveloperModeManager = DeveloperModeManager.getInstance()) {
    void Phaser;
    this.manager = manager;
    if (!document.getElementById('dev-panel-overlay-style')) {
      const style = document.createElement('style');
      style.id = 'dev-panel-overlay-style'; style.textContent = CSS; document.head.appendChild(style);
    }
    this.root = document.createElement('div'); this.root.id = 'dev-panel-overlay'; this.root.setAttribute('aria-label', 'Developer Mode');
    this.root.innerHTML = `<div class="dp-head"><div class="dp-title"><span>HOLLOW WOODS · DEV</span><span><button class="dp-close" data-action="close">Đóng F9</button><button data-action="compact">Thu gọn</button></span></div><div class="dp-stats"></div><button class="dp-badge" data-action="logs">● 0</button><div class="dp-tabs" role="tablist"></div></div><div class="dp-body"></div>`;
    document.body.appendChild(this.root);
    this.body = this.root.querySelector('.dp-body') as HTMLDivElement;
    this.statLine = this.root.querySelector('.dp-stats') as HTMLDivElement;
    this.badge = this.root.querySelector('.dp-badge') as HTMLButtonElement;
    this.buildTabs(); this.renderTab();
    this.root.addEventListener('click', this.onClick);
    this.root.addEventListener('change', this.onChange);
    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('keydown', this.onKeyDown);
  }

  public show(): void { this.root.style.display = 'block'; this.update(); if (this.timer === null) this.timer = window.setInterval(() => this.update(), 250); }
  public hide(): void { this.root.style.display = 'none'; if (this.timer !== null) window.clearInterval(this.timer); this.timer = null; document.getElementById('game-canvas')?.focus(); }
  public toggle(): void { this.root.style.display === 'none' ? this.show() : this.hide(); }
  public destroy(): void { this.hide(); this.root.removeEventListener('click', this.onClick); this.root.removeEventListener('change', this.onChange); this.root.removeEventListener('input', this.onInput); this.root.removeEventListener('keydown', this.onKeyDown); this.root.remove(); }

  private buildTabs(): void {
    const tabs = ['Log & Hiệu năng', 'Di chuyển & Map', 'Nhân vật & Đồ', 'Nhiệm vụ & MT', 'Thực thể & AI'];
    const holder = this.root.querySelector('.dp-tabs') as HTMLDivElement;
    tabs.forEach((name, i) => { const button = document.createElement('button'); button.textContent = `${i + 1}`; button.title = name; button.setAttribute('role', 'tab'); button.dataset.tab = String(i); holder.appendChild(button); });
  }

  private renderTab(): void {
    this.root.querySelectorAll('[role=tab]').forEach(el => el.setAttribute('aria-selected', String(Number((el as HTMLElement).dataset.tab) === this.activeTab)));
    const methods = ['getLogs', 'clearLogs', 'setNoclip', 'setSpeedMultiplier', 'teleportToZone', 'teleportToCoords', 'setGodMode', 'setInfiniteStamina', 'setStats', 'giveItem', 'unlockAllGatesAndSeals', 'jumpToQuestStage', 'setTimePhase', 'setFreezeTime', 'setFogEnabled', 'setRainEnabled', 'triggerEnding', 'setFreezeAI', 'spawnTestMonster', 'getNearbyEntities'];
    const api = this.manager as unknown as Record<string, unknown>;
    const missing = methods.filter(name => typeof api[name] !== 'function');
    const note = missing.length ? `<p class="dp-note">Một số điều khiển chưa khả dụng trong DeveloperModeManager hiện tại.</p>` : '';
    const sections = [this.logTab(), this.mapTab(), this.playerTab(), this.worldTab(), this.entityTab()];
    this.body.innerHTML = `${note}${sections[this.activeTab]}`;
    this.syncControls();
  }

  private logTab(): string { return `<section class="dp-section"><h3>Hiệu năng</h3><div data-perf></div></section><section class="dp-section"><h3>Bug / Warning</h3><div class="dp-row"><button data-action="copy-log">Copy Log</button><button data-action="clear-log">Xóa</button></div><div class="dp-log" data-logs></div></section>`; }
  private mapTab(): string { return `<section class="dp-section"><h3>Di chuyển</h3><label>Noclip <input type="checkbox" data-control="noclip"></label><div class="dp-row">${[1,2,3].map(n=>`<button data-action="speed" data-value="${n}">${n}x</button>`).join('')}</div><label>Phân khu <select data-control="zone">${ZONES.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><div class="dp-row"><input placeholder="X" data-x type="number"><input placeholder="Y" data-y type="number"><button data-action="goto">Đi tới</button></div></section><section class="dp-section"><h3>Lớp debug</h3>${[['Collision','showColliders'],['Hitbox','showHitboxes'],['Trigger','showTriggers'],['Interact','showInteractRanges'],['AI Range','showAIRanges'],['Click soi Object','enableObjectPicker']].map(([n,id])=>`<label>${n}<input type="checkbox" data-layer="${id}" ${id==='showColliders'||id==='showHitboxes'||id==='showTriggers'||id==='showInteractRanges'||id==='showAIRanges'?'checked':''}></label>`).join('')}</section>`; }
  private playerTab(): string { return `<section class="dp-section"><h3>Nhân vật</h3><label>God Mode <input type="checkbox" data-control="god"></label><label>Vô hạn Thể Lực <input type="checkbox" data-control="stamina"></label>${['HP','Stamina','Tinh Thần'].map((n,i)=>`<label>${n}<input type="range" min="0" max="100" value="100" data-stat="${i}"></label>`).join('')}<button data-action="sanity15">Tinh Thần = 15</button></section><section class="dp-section"><h3>Vật phẩm</h3><input placeholder="Lọc items.json…" data-search><div data-items></div><div class="dp-row"><button data-action="item" data-value="1">+1</button><button data-action="item" data-value="5">+5</button></div></section>`; }
  private worldTab(): string { return `<section class="dp-section"><h3>Nhiệm vụ & Môi trường</h3><button data-action="gates">Mở mọi Cổng & Phong Ấn</button><label>Nhảy Chặng <select data-control="act">${[1,2,3,4,5,6,7].map(n=>`<option>${n}</option>`).join('')}</select></label><div class="dp-row">${['Ngày','Hoàng Hôn','Đêm'].map((n,i)=>`<button data-action="time" data-value="${i}">${n}</button>`).join('')}</div>${[['Đóng băng thời gian','timeFrozen'],['Sương mù','fog'],['Mưa','rain']].map(([n,id])=>`<label>${n}<input type="checkbox" data-control="${id}"></label>`).join('')}<div class="dp-row">${[['True','true'],['Sacrifice','sacrifice'],['Fog Loop','fog_loop']].map(([n,id])=>`<button data-action="ending" data-value="${id}">${n}</button>`).join('')}</div></section>`; }
  private entityTab(): string { return `<section class="dp-section"><h3>Thực thể & AI</h3><label>Đóng băng AI <input type="checkbox" data-control="aiFrozen"></label><div class="dp-row">${['The Listener','Skull Wolf','Fallen Knight'].map(n=>`<button data-action="spawn" data-value="${n}">${n}</button>`).join('')}</div><div data-entities></div></section>`; }

  private syncControls(): void {
    this.root.querySelectorAll<HTMLInputElement>('[data-control]').forEach(input => { const value = (({ noclip: this.manager.isNoclip, god: this.manager.isGodMode, stamina: this.manager.isInfiniteStamina, timeFrozen: this.manager.freezeTime, fog: this.manager.fogEnabled, rain: this.manager.rainEnabled, aiFrozen: this.manager.isFreezeAI } as Record<string, boolean>)[input.dataset.control || '']); if (typeof value === 'boolean') input.checked = value; });
    this.refreshItems(); this.refreshEntities();
  }
  private update = (): void => {
    const snapshot = this.manager.getPerfSnapshot(); const logs = this.manager.getLogs();
    const bugs = this.manager.errorCount + this.manager.warnCount;
    this.badge.textContent = `● ${bugs}`; this.badge.title = `${this.manager.errorCount} Bug · ${this.manager.warnCount} Warn`;
    this.statLine.textContent = `FPS ${snapshot.fps?.toFixed(0) ?? '—'} · (${snapshot.player ? `${snapshot.player.x.toFixed(0)}, ${snapshot.player.y.toFixed(0)}` : '—'}) · ${snapshot.zoneId ?? '—'}`;
    if (this.activeTab === 0) {
      const perf = this.body.querySelector('[data-perf]'); if (perf) perf.innerHTML = `FPS: ${snapshot.fps?.toFixed(1) ?? '—'} · Frame: ${snapshot.frameTimeMs?.toFixed(1) ?? '—'} ms<br>Collider: ${snapshot.colliderCount ?? '—'} · Entity: ${snapshot.gameObjectCount ?? '—'}<br>JS Heap: ${snapshot.jsHeapMb ?? '—'} MB<br>Audio: BGM ${snapshot.currentBGM ?? '—'} · Ambience ${snapshot.currentAmbience ?? '—'} · Heartbeat ${snapshot.isHeartbeatActive ?? '—'} · Sanity Duck ${snapshot.isSanityDucked ?? '—'}`;
      const logNode = this.body.querySelector('[data-logs]'); if (logNode) logNode.textContent = logs.map(entry => `[${entry.time}] ${entry.level}: ${entry.message}`).join('\n') || 'Chưa có Bug / Warning';
    }
  };
  private call(name: string, ...args: unknown[]): unknown { const fn = (this.manager as unknown as Record<string, unknown>)[name] as DevAction | undefined; if (!fn) return undefined; try { return fn.apply(this.manager, args); } catch (error) { console.warn(`Dev panel action ${name} failed`, error); return undefined; } }
  private onClick = (event: Event): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action],[data-tab]'); if (!target) return;
    if (target.dataset.tab !== undefined) { this.activeTab = Number(target.dataset.tab); this.renderTab(); this.update(); return; }
    const value = target.dataset.value;
    switch (target.dataset.action) {
      case 'close': this.manager.setEnabled(false); this.hide(); break;
      case 'compact': this.compact = !this.compact; this.body.style.display = this.compact ? 'none' : ''; break;
      case 'logs': this.activeTab = 0; this.renderTab(); this.update(); break;
      case 'clear-log': this.manager.clearLogs(); this.update(); break;
      case 'copy-log': void navigator.clipboard?.writeText(this.manager.getLogs().map(e=>`[${e.time}] ${e.level}: ${e.message}`).join('\n')); break;
      case 'speed': this.manager.setSpeedMultiplier(Number(value) as 1 | 2 | 3); break;
      case 'goto': this.manager.teleportToCoords(Number(this.root.querySelector<HTMLInputElement>('[data-x]')?.value), Number(this.root.querySelector<HTMLInputElement>('[data-y]')?.value)); break;
      case 'sanity15': this.manager.setStats({ composure: 15 }); break;
      case 'item': if (this.selectedItem) this.manager.giveItem(this.selectedItem, Number(value)); break;
      case 'gates': this.manager.unlockAllGatesAndSeals(); break;
      case 'time': this.manager.setTimePhase(['DAY','DUSK','NIGHT'][Number(value)] as 'DAY' | 'DUSK' | 'NIGHT'); break;
      case 'ending': this.manager.triggerEnding(value as 'true' | 'sacrifice' | 'fog_loop'); break;
      case 'spawn': this.manager.spawnTestMonster(({ 'The Listener':'listener', 'Skull Wolf':'skull_wolf', 'Fallen Knight':'fallen_knight' } as Record<string, 'listener'|'skull_wolf'|'fallen_knight'>)[value || 'listener']); break;
    }
  };
  private onChange = (event: Event): void => {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    if (input.matches('[data-control]')) {
      if (input.dataset.control === 'act') { this.manager.jumpToQuestStage(Number(input.value)); return; }
      const actions: Record<string, string> = { noclip:'setNoclip', god:'setGodMode', stamina:'setInfiniteStamina', timeFrozen:'setFreezeTime', fog:'setFogEnabled', rain:'setRainEnabled', aiFrozen:'setFreezeAI' };
      const action = actions[input.dataset.control || '']; if (action) this.call(action, input instanceof HTMLInputElement ? input.checked : input.value);
      if (input.dataset.control === 'zone') this.manager.teleportToZone(input.value);
    }
    if (input instanceof HTMLInputElement && input.dataset.layer !== undefined) {
      const layer = input.dataset.layer;
      if (['showColliders','showHitboxes','showTriggers','showInteractRanges','showAIRanges','enableObjectPicker'].includes(layer)) this.layerHandler?.(layer, input.checked);
    }
    if (input instanceof HTMLInputElement && input.dataset.stat !== undefined) { const key = ['hp','stamina','composure'][Number(input.dataset.stat)]; this.manager.setStats({ [key]: Number(input.value) }); }
  };
  private onInput = (event: Event): void => { const input = event.target as HTMLInputElement; if (input.matches('[data-search]')) this.refreshItems(input.value); };
  private onKeyDown = (event: KeyboardEvent): void => { if ((event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) && event.target !== this.root.querySelector('[data-search]')) event.stopPropagation(); };
  public layerHandler?: (layer: string, enabled: boolean) => void;
  private refreshItems(query = ''): void {
    const list = this.body.querySelector('[data-items]'); if (!list) return;
    const needle = query.trim().toLocaleLowerCase();
    const found = itemData.items.filter(item => !needle || item.id.toLocaleLowerCase().includes(needle) || item.name.toLocaleLowerCase().includes(needle));
    list.innerHTML = found.slice(0, 12).map(item=>`<button data-item="${item.id}">${item.name}</button>`).join('');
    list.querySelectorAll<HTMLElement>('[data-item]').forEach(button=>button.addEventListener('click',()=>{this.selectedItem=button.dataset.item||'';}));
  }
  private refreshEntities(): void { const list=this.body.querySelector('[data-entities]'); if(!list)return; const entities=this.manager.getNearbyEntities(); const rows=Array.isArray(entities)?entities as Array<{name:string;x?:number;y?:number}>:[]; list.innerHTML=rows.map(e=>`<div class="dp-entity"><span>${e.name} (${e.x?.toFixed(0)??'?'}, ${e.y?.toFixed(0)??'?'})</span><button data-fly="${e.x??0},${e.y??0}">Bay tới</button></div>`).join('')||'<p class="dp-note">Chưa có dữ liệu thực thể.</p>'; list.querySelectorAll<HTMLElement>('[data-fly]').forEach(button=>button.addEventListener('click',()=>{const [x,y]=(button.dataset.fly||'0,0').split(',').map(Number);this.manager.teleportToCoords(x,y);})); }
}
