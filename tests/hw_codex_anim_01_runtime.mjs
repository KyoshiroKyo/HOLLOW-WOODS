
import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import { spawn } from 'node:child_process';

const [build = 'after', sha = 'WORKTREE'] = process.argv.slice(2);
const report = path.resolve('scratch/hw-codex-anim-01', build);
fs.mkdirSync(report, {recursive:true});
const tmp = fs.mkdtempSync(path.join(report, 'chrome-'));
const chrome=process.env.HW_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port=Number(process.env.HW_ANIM_PORT ?? '5187');
const base='http://127.0.0.1:'+port;
const result={task:'HW-CODEX-ANIM-01', build, sha, environment:{
  os:'Windows 10 build 19045', node:process.version, browser_mode:'headless Chrome, isolated throwaway profile', endpoint:base, bundle:'npm run build, Vite preview',
  sdk:'external P2Game SDK blocked for isolated standalone test', owner_save_used:false, keyboard:'Chrome DevTools synthetic key events; physical EVKey NOT_RUN',
  window:[1280,720], device_scale_factor:1, graphics_flags: []
},diagnostics:{page_exceptions:[],local_http_errors:[],browser_warnings:[],external_resources_blocked:[]}};
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(port),'--strictPort'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
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
  const virtual=code.startsWith('Key')?code.charCodeAt(3):{'ShiftLeft':16,Enter:13,Escape:27}[code];
  return page.send('Input.dispatchKeyEvent',{type,code,key:char,windowsVirtualKeyCode:virtual,nativeVirtualKeyCode:virtual,modifiers});
}
async function tap(code,char){await key('rawKeyDown',code,char);await delay(65);await key('keyUp',code,char);}
function verifyLocomotion(result, isBaseline) {
  const { frames, transitions, starts, markers, clips } = result.trace;
  const locomotion = /^wayfarer_(unarmed_)?(walk|run)_(right|left|up|down)$/;
  const expectedKeys = ['walk', 'unarmed_walk', 'run', 'unarmed_run'].flatMap(action =>
    ['right', 'left', 'up', 'down'].map(dir => `wayfarer_${action}_${dir}`));
  const movement = frames.filter(frame => locomotion.test(frame.key));
  const changes = transitions.filter(({before, after}) => locomotion.test(before.key) && locomotion.test(after.key));
  const phase = frame => {
    const clip = clips[frame.key];
    const times = clip.frames.map(entry => entry.duration || 1000 / clip.rate);
    return (times.slice(0, frame.index - 1).reduce((sum, ms) => sum + ms, 0) +
      Math.min(frame.elapsed, frame.duration)) / times.reduce((sum, ms) => sum + ms, 0);
  };
  const errors = changes.map(({before, after}) => {
    const error = Math.abs(phase(after) - phase(before));
    return Math.min(error, 1 - error);
  });
  const maxPhaseError = Math.max(...errors);
  const steadySegments = markers.filter(marker => marker.label === 'steady_walk').map(marker =>
    frames.filter(frame => frame.time >= marker.time + 100 && frame.time < marker.time + 1200));
  const tests = {
    four_directions_both_stances: expectedKeys.every(key => movement.some(frame => frame.key === key)),
    walk_run_roundtrips: expectedKeys.filter(key => key.includes('_walk_')).every(walk => {
      const run = walk.replace('_walk_', '_run_');
      return changes.some(({before, after}) => before.key === walk && after.key === run) &&
        changes.some(({before, after}) => before.key === run && after.key === walk);
    }),
    turns_in_both_gaits: ['walk', 'run', 'unarmed_walk', 'unarmed_run'].every(action =>
      changes.some(({before, after}) => before.key === `wayfarer_${action}_right` && after.key === `wayfarer_${action}_down`)),
    phase_regression: isBaseline ? maxPhaseError > 0.05 : maxPhaseError < 1e-8,
    steady_walk_completes_cycle_without_restart: steadySegments.length === 2 && steadySegments.every(segment =>
      segment.length > 0 && new Set(segment.map(frame => frame.index)).size === 6 &&
      !starts.some(start => start.time >= segment[0].time && start.time <= segment.at(-1).time)),
    velocity_matches_gait: movement.every(frame => {
      const running = frame.key.includes('_run_');
      const speed = Math.hypot(...frame.velocity);
      return running === frame.sprinting && (Math.abs(speed - (running ? 140 : 85)) < 0.001 || speed === 0);
    }),
    frame_geometry: movement.every(frame => {
      const run = frame.key.includes('_run_');
      const scale = !run ? 1.5 : frame.armed ? 1.14 : frame.index <= 6 ? 0.99 : 1.11;
      return Math.abs(frame.scale - scale) < 1e-8 && frame.pivot[0] === 0.5 && frame.pivot[1] === (run ? 0.875 : 1) &&
        frame.dimensions[0] === (run ? 84 : 64) && frame.dimensions[1] === (run ? 72 : 64) &&
        frame.body[0] === 18 && frame.body[1] === 12 && frame.camera[2] === 2.2;
    }),
    no_position_jump_at_clip_switch: changes.every(({before, after}) =>
      before.sprite.every((position, axis) => position === after.sprite[axis])),
    blur_releases_movement_and_sprint: /^wayfarer_(unarmed_)?idle_right$/.test(result.after_blur.key) &&
      !result.after_blur.sprinting && result.after_blur.velocity.every(value => value === 0),
    zone_auto_weapon_reenabled: result.auto_weapon_restored.armed === frames[0].armed,
    no_local_runtime_errors: result.diagnostics.page_exceptions.length === 0 && result.diagnostics.local_http_errors.length === 0
  };
  if (Object.values(tests).some(value => !value)) process.exitCode = 1;
  return { tests, locomotion_transitions: changes.length, max_cycle_phase_error: maxPhaseError };
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

  await evaluate(`
    const world=gs.physics.world, camera=gs.cameras.main;
    let steps=0;
    const sceneTrace={frames:[], transitions:[], markers:[], starts:[]};
    window.animTrace=sceneTrace;
    const snapshot=()=>{
      const a=p.anims, b=p.body, f=p.frame;
      return {
        time:game.loop.now, delta:game.loop.delta, rawDelta:game.loop.rawDelta, steps,
        key:a.currentAnim?.key, index:a.currentFrame?.index, count:a.currentAnim?.frames.length,
        elapsed:a.accumulator, duration:a.nextTick, scale:p.scaleX, texture:p.texture.key, frame:f.name,
        pivot:[p.originX,p.originY], dimensions:[f.realWidth,f.realHeight], origin:[p.displayOriginX,p.displayOriginY],
        foot:[b.position.x-p.x,b.position.y-p.y], body:[b.width,b.height],
        sprite:[p.x,p.y], velocity:[b.velocity.x,b.velocity.y], armed:p._isWeaponDrawn,
        sprinting:p.stats.isSprinting, facing:p.facing, camera:[camera.scrollX,camera.scrollY,camera.zoom]
      };
    };
    p.on("animationstart",a=>sceneTrace.starts.push({key:a.key,time:game.loop.now})); const play=p.play;
    p.play=function(...args){
      const before=snapshot();
      const outcome=play.apply(this,args);
      const after=snapshot();
      if(before.key!==after.key) sceneTrace.transitions.push({before,after});
      return outcome;
    };
    const locomotion=p.playWalkOrRunAnim;
    p.playWalkOrRunAnim=function(){
      const count=sceneTrace.transitions.length;
      locomotion.call(this);
      if(sceneTrace.transitions.length>count) sceneTrace.transitions.at(-1).after=snapshot();
    };
    // Exercise the manual stance transition in the same obstacle layout.
    // The production zone check is restored in the separate control case.
    const autoWeapon=p.checkZoneWeaponAutoState;
    p.checkZoneWeaponAutoState=function(){};
    window.restoreAutoWeapon=()=>{p.checkZoneWeaponAutoState=autoWeapon;};
    world.on('worldstep',()=>{steps++;});
    game.events.on('postrender',()=>{sceneTrace.frames.push({...snapshot(), wall:performance.now()}); steps=0;});
    sceneTrace.world={fps:world.fps,fixedStep:world.fixedStep, zoom:camera.zoom,roundPixels:camera.roundPixels};
    sceneTrace.clips=Object.fromEntries(game.anims.anims.entries ? Object.entries(game.anims.anims.entries).filter(([k])=>/^wayfarer_(unarmed_)?(walk|run)_/.test(k)).map(([k,a])=>[k,{rate:a.frameRate,frames:a.frames.map(f=>({duration:f.duration,frame:f.textureFrame}))}]) : []);
    window.animFixture={
      mark:(label)=>sceneTrace.markers.push({label,time:game.loop.now,wall:performance.now()}),
      snapshot
    };
  `);
  const mark=label=>evaluate('window.animFixture.mark('+JSON.stringify(label)+');');
  let modifiers=0; const down=(letter)=>key('rawKeyDown','Key'+letter,letter.toLowerCase(),modifiers);
  const up=(letter)=>key('keyUp','Key'+letter,letter.toLowerCase(),modifiers);
  const shiftDown=()=>key('rawKeyDown','ShiftLeft','Shift',modifiers=8);
  const shiftUp=()=>key('keyUp','ShiftLeft','Shift',modifiers=0);
  const preferred=await state();
  for(let stance=0;stance<2;stance++){
    if(stance){
      await tap('KeyX','x');
      await until(async()=>(await state()).armed!==preferred.armed,4500);
      await delay(750);
      await evaluate('p.body.reset('+preferred.x+','+preferred.y+'); gs.cameraSystem.centerOn(p.x,p.y);');
    }
    const armed=(await state()).armed;
    await mark(armed?'armed_begin':'unarmed_begin');
    const directions=[['D','right'],['S','down'],['A','left'],['W','up']];
    for(const [letter,direction] of directions){
      await mark('walk_'+direction);
      await down(letter); await delay(281);
      await mark('run_'+direction);
      await shiftDown(); await delay(438);
      await mark('release_shift_'+direction);
      await shiftUp(); await delay(159);
      const next=directions[(directions.findIndex(([k])=>k===letter)+1)%4][0];
      if(letter!=='W'){
        await down(next); await delay(32); await up(letter);
      }else await up(letter);
    }
    await delay(220);
    await mark('steady_walk');
    await down('D'); await delay(1280); await up('D'); await delay(150);
    // Turn while sprint remains held across the direction change.
    await mark('sprint_turn');
    await down('D'); await shiftDown(); await delay(273);
    await down('S'); await delay(32); await up('D'); await delay(320);
    await shiftUp(); await up('S'); await delay(170);
  }
  await mark('input_blur_begin');
  await down('D'); await shiftDown(); await delay(200);
  await evaluate("window.dispatchEvent(new Event('blur'));");
  await delay(230);
  result.after_blur=await evaluate('return window.animFixture.snapshot();');
  await shiftUp(); await up('D'); await evaluate('window.__FOCUS_GAME__();');
  await mark('zone_weapon_control');
  await evaluate('window.restoreAutoWeapon();');
  await until(async()=>(await state()).armed===preferred.armed,4000);
  result.auto_weapon_restored=await state();
  result.trace=await evaluate('return window.animTrace;');
  if(process.env.HW_ANIM_MEDIA) {
    await evaluate(`
      p.body.reset(${preferred.x},${preferred.y});
      gs.cameraSystem.centerOn(p.x,p.y);
      const chunks=[];
      const stream=game.canvas.captureStream(60);
      const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2600000});
      recorder.ondataavailable=e=>chunks.push(e.data);
      window.hwAnimRecord={
        recorder,
        data:new Promise(done=>recorder.onstop=()=>{
          stream.getTracks().forEach(track=>track.stop());
          const reader=new FileReader();
          reader.onload=()=>done(reader.result.split(',')[1]);
          reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));
        })
      };
      recorder.start();
    `);
    await delay(200);
    await down('D'); await delay(331); await shiftDown(); await delay(334);
    await down('S'); await delay(32); await up('D'); await delay(377);
    await shiftUp(); await delay(299);
    await down('A'); await delay(32); await up('S'); await delay(390);
    await up('A'); await delay(275);
    const video=await evaluate('window.hwAnimRecord.recorder.stop(); return await window.hwAnimRecord.data;');
    fs.writeFileSync(path.join(report,'gameplay.webm'),Buffer.from(video,'base64'));
  }
  result.assertions = verifyLocomotion(result, build === 'before');
} catch(error){
  result.fatal=error.stack+(serverLog?' '+serverLog.slice(0,500):'');
  process.exitCode=1;
} finally{
  fs.writeFileSync(path.join(report,'runtime.json'),JSON.stringify(result,null,2)+'\n');
  page?.socket.close(); sys?.socket.close(); browser?.kill(); server.kill();
  console.log(JSON.stringify({frames:result.trace?.frames.length,transitions:result.trace?.transitions.length,renderer:result.environment.renderer?.webgl_renderer,assertions:result.assertions,diagnostics:result.diagnostics,fatal:result.fatal},null,2));
}
