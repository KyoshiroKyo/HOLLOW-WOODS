
import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import { spawn } from 'node:child_process';

const [build = 'after', sha = 'WORKTREE'] = process.argv.slice(2);
const report = path.resolve('scratch/hw-codex-world-01', build);
fs.mkdirSync(report, {recursive:true});
const tmp = fs.mkdtempSync(path.join(report, 'chrome-'));
const chrome=process.env.HW_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port=Number(process.env.HW_WORLD_PORT ?? '5189');
const base='http://127.0.0.1:'+port;
const result={task:'HW-CODEX-WORLD-01', build, sha, environment:{
  os:'Windows 10 build 19045', node:process.version, browser_mode:'headless Chrome, isolated throwaway profile', endpoint:base, bundle:'npm run build, Vite preview',
  sdk:'external P2Game SDK blocked for isolated standalone test', owner_save_used:false, keyboard:'Chrome DevTools synthetic key events; physical EVKey NOT_RUN',
  window:[1280,720], device_scale_factor:1, graphics_flags: []
},diagnostics:{page_exceptions:[],local_http_errors:[],browser_warnings:[],external_resources_blocked:[]}};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port),'--strictPort', '--outDir', process.env.HW_WORLD_BUILD_DIR ?? 'dist'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let serverLog='';
server.stderr.on('data', c=>serverLog+=c);
let browser, page, sys;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn, max=12000) {
  const deadline=Date.now()+max;
  let last;
  while(Date.now()<deadline){
    try{if(await fn())return;}catch(error){last=error.message;}
    await delay(145);
  }
  throw Error('Timed out'+(last?' - '+last:''));
}
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(2000)});return r.ok?r.json():null;}
async function cdp(url, listener=()=>{}) {
  const socket=new WebSocket(url);
  await once(socket,'open');
  let id=0;
  const waiting=new Map();
  socket.addEventListener('message',e=>{
    const m=JSON.parse(e.data);
    if(m.id&&waiting.has(m.id)){
      const {resolve,reject,timer}=waiting.get(m.id); waiting.delete(m.id); clearTimeout(timer);
      if(m.error)reject(Error(JSON.stringify(m.error))); else resolve(m.result);
    } else if(m.method) listener(m);
  });
  return {socket, send(method,params={}) {
    const sequence=++id;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{waiting.delete(sequence);reject(Error('CDP '+method+' timed out'));},22000);
      waiting.set(sequence,{resolve,reject,timer});
      socket.send(JSON.stringify({id:sequence,method,params}));
    });
  }};
}
async function evaluate(body){
  const expr='(async()=>{const game=window.__PHASER_GAME__, gs=game?.scene.getScene("GameScene"), ui=game?.scene.getScene("UIScene"), p=gs?.player;'+body+'})()';
  const res=await page.send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true,userGesture:true});
  if(res.exceptionDetails) throw Error(res.exceptionDetails.exception?.description??res.exceptionDetails.text);
  return res.result.value;
}
const state=()=>evaluate('return {zone:gs.currentZoneId,x:p.x,y:p.y,anim:p.anims.currentAnim?.key,frame:p.frame?.name,texture:p.texture?.key,armed:p._isWeaponDrawn,scale:p.scaleX,origin:[p.originX,p.originY],body:[p.body?.width,p.body?.height],camZoom:gs.cameras.main.zoom,composure:gs.playerState.stats.composure};');
async function key(type,code,char, modifiers=0) {
  const virtual=code.startsWith('Key')?code.charCodeAt(3):{'ShiftLeft':16,Enter:13,Escape:27,F4:115,F9:120}[code];
  return page.send('Input.dispatchKeyEvent',{type,code,key:char,windowsVirtualKeyCode:virtual,nativeVirtualKeyCode:virtual,modifiers});
}

try{
  await until(async()=>{const response=await fetch(base,{signal:AbortSignal.timeout(1000)});return response.ok;});
  browser=spawn(chrome,['--headless=new','--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-extensions','--window-size=1280,720','--user-data-dir='+tmp,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let browserLog='';
  browser.stderr.on('data', c=>browserLog+=c);
  browser.on('error',e=>{browserLog+=e.message;});
  let cdpPort; try {await until(()=>{cdpPort=fs.readFileSync(path.join(tmp,'DevToolsActivePort'),'utf8').trim().split(/\r?\n/)[0]; return /^\d+$/.test(cdpPort);},7000);}
  catch(e){throw Error('Chrome CDP did not start: '+browserLog.trim().slice(0,850));}
  const endpoint='http://127.0.0.1:'+cdpPort;
  const version=await get(endpoint+'/json/version');
  result.environment.browser=version.Browser;
  sys=await cdp(version.webSocketDebuggerUrl);
  try {
    const {gpu}=await sys.send('SystemInfo.getInfo');
    result.environment.chrome_gpu={devices:gpu.devices,feature_status:{gpu_compositing:gpu.featureStatus.gpu_compositing,webgl:gpu.featureStatus.webgl,webgl2:gpu.featureStatus.webgl2},gl_renderer:gpu.auxAttributes?.glRenderer,gl_vendor:gpu.auxAttributes?.glVendor};
  }catch(e){result.environment.chrome_gpu_error=e.message;}
  const targets=await get(endpoint+'/json/list');
  const requestUrls=new Map();
  page=await cdp(targets.find(x=>x.type==='page').webSocketDebuggerUrl, ({method,params:p})=>{
    if(method==='Runtime.exceptionThrown') result.diagnostics.page_exceptions.push(p.exceptionDetails.exception?.description??p.exceptionDetails.text);
    if(method==='Runtime.consoleAPICalled'&&['warning','error'].includes(p.type)){
      const log=p.args.map(a=>a.value??'').join(' ');
      if(log&&!result.diagnostics.browser_warnings.includes(log)) result.diagnostics.browser_warnings.push(log);
    }
    if(method==='Network.requestWillBeSent') requestUrls.set(p.requestId,p.request.url);
    if(method==='Network.responseReceived'&&p.response.url.startsWith(base)&&p.response.status>=400) result.diagnostics.local_http_errors.push({url:p.response.url,status:p.response.status});
    if(method==='Network.loadingFailed') {
      const url=requestUrls.get(p.requestId);
      if(url?.startsWith(base)&&!p.canceled)result.diagnostics.local_http_errors.push({url,error:p.errorText});
      else if(url?.startsWith('https://')&&p.blockedReason)result.diagnostics.external_resources_blocked.push(url);
    }
  });
  await page.send('Page.enable'); await page.send('Runtime.enable'); await page.send('Network.enable');
  await page.send('Network.setBlockedURLs',{urls:['https://*','http://games.p2game.io/*']});
  await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
  await page.send('Page.navigate',{url:base+'/?dev=1'});
  await until(()=>evaluate('return !!game?.scene.isActive("MainMenuScene")&&!!document.querySelector("#game-startup")?.hidden;'),35000);
  const engine=await evaluate('const r=game.renderer, gl=r.gl, d=gl?.getExtension("WEBGL_debug_renderer_info"), rect=game.canvas.getBoundingClientRect(); return {type:r.type,renderer:r.type===2?"WebGL":"Canvas",webgl_version:gl?.getParameter(gl.VERSION)??null,webgl_renderer:d?gl.getParameter(d.UNMASKED_RENDERER_WEBGL):null,webgl_vendor:d?gl.getParameter(d.UNMASKED_VENDOR_WEBGL):null,canvas:[game.canvas.width,game.canvas.height],viewport:[innerWidth,innerHeight],pixel_ratio:devicePixelRatio,rect:[rect.left,rect.top,rect.width,rect.height],graphics_quality:window.__SETTINGS_MANAGER__?.getGraphicsQuality?.()??null};');
  result.environment.renderer=engine;
  const [x0,y0,w,h]=engine.rect;
  const x=x0+288*w/1280, y=y0+248*h/720;
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
  await page.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
  await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
  await until(()=>evaluate('return !!p && game.scene.isActive("GameScene") && game.scene.isActive("UIScene");'),22000);
  await delay(1300);
  await evaluate('window.__FOCUS_GAME__();');


  const observations = {};
  await evaluate(`
    window.worldQA = {actions:[]};
    const action=gs.executeMapInteraction, setPrompt=ui.setInteractionPrompt;
    gs.executeMapInteraction=function(id,...rest){window.worldQA.actions.push(id);return action.call(this,id,...rest);};
    ui.setInteractionPrompt=function(text,x,y,...rest){
      window.worldQA.prompt = {text,x,y};
      return setPrompt.call(this,text,x,y,...rest);
    };
  `);
  const moveTo = (zone,x,y) => evaluate(`
    gs.worldBuilder.ensureZoneRendered('${zone}');
    gs.currentZoneId='${zone}'; gs.previousZoneId='${zone}';
    gs.playerState.setCurrentZone('${zone}');
    gs.worldBuilder.setActiveZone('${zone}');
    gs.applyCameraBoundsForZone('${zone}');
    p.body.reset(${x}, ${y}); p.resetAllInputState();
    gs.cameraSystem.centerOn(p.x,p.y);
  `);
  async function inspect(label,x,y,radius=90) {
    observations[label] = await evaluate(`
      const wb=gs.worldBuilder;
      const near=(x,y)=>Math.hypot(x-${x},y-${y})<=${radius};
      const read=()=>ui.tornPageModal?.isOpen??false;
      return {
        zone:gs.currentZoneId,pos:[p.x,p.y],foot:[p.getFootPosition().x,p.getFootPosition().y],
        debug:window.__DEV_SESSION_POLICY__?.isQABuild(),menu:!!ui.craftingModal?.isOpen,
        interactions:wb.getNearbyInteractables(p.getFootPosition(),90).map(({item,dist})=>({id:item.id,at:[item.x,item.y],dist,triggerRadius:item.triggerRadius})),
        prompt:window.worldQA.prompt, actions:[...window.worldQA.actions], modal:read(),
        runedIron:gs.playerState.getItemCount("mat_runed_iron"), mold:gs.playerState.getItemCount("item_bell_mold"),
        props:gs.children.list.filter(o=>o.frame&&near(o.x,o.y)&&!/^(black_knight|npc|garth)/.test(o.texture?.key)).map(o=>({
          id:o.name, key:o.texture.key, frame:o.frame.name, at:[o.x,o.y],size:[o.displayWidth,o.displayHeight],
          depth:o.depth,visible:o.visible, bounds:((b)=>[b.x,b.y,b.width,b.height])(o.getBounds())
        })),
        bodies:wb.colliderGroup.getChildren().filter(o=>near(o.body.center.x,o.body.center.y)).map(o=>[o.name,o.body.x,o.body.y,o.body.width,o.body.height,o.body.enable]),
        overlay:gs.debugOverlay ? {visible:gs.debugOverlay.visible, text:gs.debugOverlay.text?.text} : null, devEnabled:gs.devPanel?.isVisible??false
      };
    `);
  }
  async function screen(label) {
    const shot = await page.send('Page.captureScreenshot',{format:'png',fromSurface:true});
    fs.writeFileSync(path.join(report,label+'.png'),Buffer.from(shot.data,'base64'));
  }
  async function press(letter) {
    await key('rawKeyDown','Key'+letter,letter.toLowerCase());
    await delay(80);
    await key('keyUp','Key'+letter,letter.toLowerCase());
    await delay(160);
  }
  const toggle = async (code) => {
    await key('rawKeyDown',code,code);
    await delay(84);
    await key('keyUp',code,code);
    await delay(120);
  };
  if (build !== 'before') await toggle('F4');
  await inspect('overlay_start',120,195);
  await moveTo('fog_crossing',240,203); await delay(350);
  await inspect('fog_sign',240,180); await screen('01_FOG_SIGN'); await press('E');
  await inspect('fog_sign_e',240,180);
  await evaluate('if(ui.tornPageModal?.isOpen)ui.tornPageModal.close();');
  if (build !== 'before') {
    // Start clear of the stump so collision separation cannot push the player into range.
    await moveTo('fog_crossing',245,136); await delay(350);
    await inspect('fog_old_anchor',240,180); await press('E');
    await inspect('fog_old_anchor_e',240,180);
  }
  await moveTo('bellhollow',664,294); await delay(350);
  await inspect('village_entry',630,240,110); await screen('02_VILLAGE_ENTRY'); await press('E');
  await inspect('village_notice_e',664,266);
  await evaluate('if(ui.tornPageModal?.isOpen)ui.tornPageModal.close();');
  await moveTo('bellhollow',599,228); await delay(340); await inspect('village_west_sign',600,205); await press('E');
  await inspect('village_west_sign_e',600,205);
  await evaluate('if(ui.tornPageModal?.isOpen)ui.tornPageModal.close();');
  await moveTo('bellhollow',1395,480); await delay(350);
  await inspect('village_bench',1395,455); await screen('03_VILLAGE_BENCH'); await press('E');
  await inspect('village_bench_e',1395,455);
  await evaluate('if(ui.craftingModal?.isOpen)ui.craftingModal.close();');
  await moveTo('sub_bell_workshop',1340,1248); await delay(500);
  await inspect('workshop_bench',1360,1205,102); await screen('04_WORKSHOP_BENCH'); await press('E');
  await inspect('workshop_bench_e',1360,1205,102);
  await moveTo('sub_bell_workshop',1340,1248); await delay(250);
  await key('rawKeyDown','KeyW','w'); await delay(580); await key('keyUp','KeyW','w'); await delay(160);
  await inspect('bench_walk',1340,1216,95);
  await moveTo('sub_bell_workshop',1440,1262); await delay(350);
  await inspect('workshop_rock',1440,1233); await screen('05_WORKSHOP_ROCK');
  await key('rawKeyDown','KeyW','w'); await delay(600); await key('keyUp','KeyW','w'); await delay(150);
  await inspect('rock_walk',1440,1233);
  if (build !== 'before') {
    await moveTo('sub_bell_workshop',1478,1262); await delay(300);
    await key('rawKeyDown','KeyW','w'); await delay(600); await key('keyUp','KeyW','w'); await delay(150);
    await inspect('rock_bypass',1440,1233);
  }
  await moveTo('bellhollow',1200,525); await delay(300);
  await inspect('outer_woods_sign',1200,510); await screen('06_OUTER_WOODS_SIGN');
  await moveTo('sanctuary_farm',724,655); await delay(300);
  await inspect('farm_prop_cluster',722,630,115);
  if (build !== 'before') {
    await moveTo('sub_bell_workshop',1340,1251); await delay(450);
    if (build === 'qa') { await delay(1500); await screen('07_QA_OVERLAY'); }
    await inspect('overlay_finish',1340,1217);
    await toggle('F4'); await inspect('overlay_hidden',1340,1217);
    if (build === 'after') {
      await toggle('F9');
      observations.public_gate=await evaluate('return {qa:window.__DEV_SESSION_POLICY__?.isQABuild(),inspector:!!gs.hitboxInspector,panel:!!gs.devPanel,overlay:!!gs.debugOverlay};');
    }
    await moveTo('sub_bell_workshop',1310,1176); await delay(310); await inspect('workshop_mold',1310,1160); await press('E');
    await inspect('workshop_mold_e',1310,1160);
    await moveTo('sub_bell_workshop',1360,1170); await delay(350); await inspect('workshop_journal',1360,1160); await press('E');
    await inspect('workshop_journal_e',1360,1160);
    await evaluate('if(ui.tornPageModal?.isOpen)ui.tornPageModal.close();');
    await moveTo('outer_woods',1360,971); await delay(380);
    await key('rawKeyDown','KeyS','s'); await delay(730); await key('keyUp','KeyS','s'); await delay(850);
    await inspect('enter_workshop_walk',1360,1100,110);
    await moveTo('fog_crossing',436,222); await delay(380);
    await key('rawKeyDown','KeyD','d'); await delay(625); await key('keyUp','KeyD','d'); await delay(850);
    await inspect('enter_bellhollow_walk',520,260,110);
    await moveTo('crooked_path',2129,341); await delay(430);
    await inspect('sentinel_rock',2129,314);
    await moveTo('crooked_path',2190,83); await delay(430);
    await inspect('deep_forest_sign',2185,58);
  }
  result.observations=observations;
  const at = (label, id) => {
    const row = observations[label];
    const anchor = row.interactions.find(entry => entry.id === id)?.at;
    const sprite = row.props.find(entry => entry.id === id && entry.visible && entry.key !== '__MISSING');
    const body = row.bodies.find(entry => entry[0] === id);
    return Boolean(anchor && sprite && body?.[5] &&
      anchor.every((value, axis) => Math.abs(sprite.at[axis] - value) < 0.001) &&
      Math.abs(body[1] + body[3] / 2 - anchor[0]) < 0.001 &&
      body[2] <= anchor[1] && body[2] + body[4] >= anchor[1] &&
      sprite.depth === anchor[1]);
  };
  const actionIs = (label, expected) => observations[label].actions.at(-1) === expected;
  if (build !== 'before') {
    result.checks = {
      fog_sign_anchored: at('fog_sign', 'fog_sign'),
      fog_sign_opens_at_sprite: actionIs('fog_sign_e', 'read_fog_sign') && observations.fog_sign_e.modal,
      fog_old_anchor_outside_trigger_radius: !observations.fog_old_anchor_e.modal &&
        observations.fog_old_anchor_e.actions.length === observations.fog_old_anchor.actions.length,
      west_village_sign_anchored: at('village_west_sign', 'bellhollow_west_sign'),
      west_village_sign_opens: actionIs('village_west_sign_e', 'read_bellhollow_west_sign') && observations.village_west_sign_e.modal,
      village_board_opens_at_foot: actionIs('village_notice_e', 'read_bellhollow_notice_board') && observations.village_notice_e.modal,
      village_bench_anchored: at('village_bench', 'village_crafting_bench'),
      crafting_menu_opens: actionIs('village_bench_e', 'open_crafting_bench') && observations.village_bench_e.menu,
      workshop_bench_anchored: at('workshop_bench', 'inspect_ancient_workbench'),
      workshop_bench_resolves_quest_item: actionIs('workshop_bench_e', 'inspect_ancient_workbench') &&
        observations.workshop_bench_e.runedIron === observations.workshop_bench.runedIron + 1 &&
        !observations.workshop_bench_e.interactions.some(entry => entry.id === 'inspect_runed_iron_part'),
      workshop_bench_blocks: Math.abs(observations.bench_walk.pos[1] - 1235) < 1,
      workshop_rock_blocks: Math.abs(observations.rock_walk.pos[1] - 1251) < 1,
      workshop_rock_can_walk_around: observations.rock_bypass.pos[1] < 1225,
      outer_woods_gate_sign_anchored: at('outer_woods_sign', 'bellhollow_outer_woods_gate_sign'),
      farm_bench_anchored: at('farm_prop_cluster', 'farm_processing_bench'),
      farm_sign_anchored: at('farm_prop_cluster', 'farm_herb_terrace_sign'),
      workshop_mold_collectible: actionIs('workshop_mold_e', 'inspect_bell_mold') &&
        observations.workshop_mold_e.mold === observations.workshop_mold.mold + 1 &&
        !observations.workshop_mold_e.interactions.some(entry => entry.id === 'inspect_bell_mold'),
      workshop_journal_opens: actionIs('workshop_journal_e', 'read_blacksmith_journal') && observations.workshop_journal_e.modal,
      workshop_portal_clear: observations.enter_workshop_walk.zone === 'sub_bell_workshop',
      west_bellhollow_portal_clear: observations.enter_bellhollow_walk.zone === 'bellhollow',
      sentinel_rock_anchored: at('sentinel_rock', 'cp_ancient_sentinel_rock'),
      deep_forest_sign_anchored: at('deep_forest_sign', 'crooked_path_deep_forest_sign'),
      clean_local_runtime: result.diagnostics.page_exceptions.length === 0 && result.diagnostics.local_http_errors.length === 0
    };
    if (build === 'qa') {
      const overlay = observations.overlay_finish.overlay;
      result.checks.owner_overlay = Boolean(overlay?.visible && overlay.text.includes('inspect_ancient_workbench') &&
        overlay.text.includes('1340.0, 1217.0') && overlay.text.includes('60.0 × 12.0') &&
        !observations.overlay_hidden.overlay?.visible && !observations.overlay_finish.devEnabled);
    } else {
      result.checks.public_build_no_qa_controls = Object.values(observations.public_gate).every(value => value === false);
    }
    if (Object.values(result.checks).some(value => !value)) process.exitCode = 1;
  }
} catch(error) {
  result.fatal=error.stack+(serverLog?' '+serverLog.slice(0,500):'');
  process.exitCode=1;
} finally {
  fs.writeFileSync(path.join(report,'runtime.json'),JSON.stringify(result,null,2)+'\n');
  page?.socket.close(); sys?.socket.close(); browser?.kill(); server.kill();
  console.log(JSON.stringify({checks:result.checks,renderer:result.environment.renderer?.webgl_renderer,diagnostics:result.diagnostics,fatal:result.fatal},null,2));
}
