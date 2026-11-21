"""Capture rendered Black Knight frames from a local production build (Playwright)."""

import argparse
import base64
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

CONFIG = Path(__file__).resolve().parents[1] / 'src/animation/BlackKnightConversion.json'
SUITES = json.loads(CONFIG.read_text())
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('mode', choices=('canvas', 'webgl'))
parser.add_argument('port', type=int, help='Local build port, served under /preview/hollow-woods/')
parser.add_argument('suite', choices=[*SUITES, 'ingress', 'locomotion'])
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--chromium', default='/usr/bin/chromium')
options = parser.parse_args()
MODE, PORT, SUITE = options.mode, options.port, options.suite
ROOT = options.output
ROOT.mkdir(parents=True, exist_ok=True)
SCENE = "window.__PHASER_GAME__.scene.getScene('GameScene')"
ATLAS = {
    'references': 'black_knight_defense',
    'locomotion': 'black_knight_conversion_motion',
    'ingress': 'black_knight_conversion_actions',
}.get(SUITE, 'black_knight_conversion_' + SUITE)
DIRS = ('down', 'up', 'left', 'right')
ART = SUITES.get(SUITE, {})
EVIDENCE = {'renderer': MODE, 'suite': SUITE, 'actions':{}, 'http':[], 'console':[],
            'pageErrors':[], 'atlasResponses':[], 'legacySpriteResponses':[]}
with sync_playwright() as pw:
    args = ['--disable-webgl'] if MODE == 'canvas' else [
        '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']
    browser = pw.chromium.launch(executable_path=options.chromium,args=args,headless=True)
    context = browser.new_context(viewport={'width':1280,'height':720})
    context.route('https://games.p2game.io/sdk/p2game-sdk.v1.js',lambda route: route.fulfill(
        body='/* isolated QA fixture, no external score or writes */', content_type='application/javascript'))
    if MODE == 'webgl':
        context.add_init_script("localStorage.setItem('hw_graphics_quality','LOW')")
    page = context.new_page()
    page.on('console',lambda m:EVIDENCE['console'].append([m.type,m.text]) if m.type in ('warning','error') else None)
    page.on('pageerror',lambda e:EVIDENCE['pageErrors'].append(str(e)))
    def response(r):
        if r.status >= 400:
            EVIDENCE['http'].append([r.status, r.url])
        if f'/{ATLAS}.' in r.url:
            EVIDENCE['atlasResponses'].append([r.status,r.url.rsplit('/',1)[1]])
        if '/characters/mossbound_wayfarer/' in r.url or '/satyr_sheet.' in r.url:
            EVIDENCE['legacySpriteResponses'].append([r.status,r.url])
    page.on('response',response)
    def val(expression):
        return page.evaluate(f"()=>{{const s={SCENE},p=s.player;return {expression};}}")
    def wait(expression,timeout=21000):
        page.wait_for_function(f"()=>{{const s={SCENE},p=s.player;return {expression};}}",timeout=timeout)
    def setup():
        page.goto(f'http://127.0.0.1:{PORT}/preview/hollow-woods/',wait_until='domcontentloaded')
        page.wait_for_function("()=>window.__PHASER_GAME__?.scene.isActive('MainMenuScene')&&document.querySelector('#game-startup')?.hidden",timeout=60000)
        page.wait_for_timeout(350)
        page.mouse.click(288,248)
        wait("p?.anims.currentAnim?.key==='wayfarer_idle_down'",45000)
        assert val("s.game.renderer.gl?'webgl':'canvas'")==MODE
        page.evaluate(f"""()=>{{
          const s={SCENE};window.owner=null;
          window.bindKnight=()=>{{
            const p=s.player;
            owner=p;
            window.trace=[];
            window.drawn=new Set();
            window.hitlog=[];
            window.shot=null;
            window.recordKey=null;
            window.shotFrame=3;
            window.sample=()=>{{
              const b=p.body;
              const rendered=s.children.list.filter(o=>o.active&&o.visible&&o.alpha>0&&
                (o===p||/^(black_knight_(movement|armed_idle|core_combat|defense|extended_skills|conversion_[a-z]+)|satyr_sheet|wayfarer_(?!portrait))/.test(o.texture?.key||'')));
              return {{time:performance.now(),texture:p.texture.key,name:p.frame.name,anim:p.anims.currentAnim?.key,
                playing:p.anims.isPlaying,facing:p.facing,armed:p.isWeaponDrawn(),x:p.x,y:p.y,
                lock:p.isActionLocked(),lantern:p.stats.isLanternOn,sta:p.stats.stamina,
                size:[p.width,p.height],scale:[p.scaleX,p.scaleY],zoom:s.cameras.main.zoom,
                pivot:[p.displayOriginX,p.displayOriginY],origin:[p.originX,p.originY],
                localAabb:[b.offset.x-p.displayOriginX,b.offset.y-p.displayOriginY,b.width,b.height],
                actualAabb:[b.left-p.x,b.top-p.y,b.width,b.height],
                offset:[b.offset.x,b.offset.y],angle:p.angle,nearest:p.frame.source.scaleMode,actors:rendered.length}};
            }};
            for(const evt of ['animationstart','animationupdate','animationcomplete','animationstop'])
              p.on(evt,(a,f)=>trace.push({{evt,key:a.key,index:f.index-1,...sample()}}));
            p.on('player_attack',h=>{{
              const {{x,y,reach,radius,facing,playerX,playerY,isWeaponArt,isAoE,knockback,stunDuration,damageMultiplier,weapon}}=h;
              hitlog.push({{hit:{{x,y,reach,radius,facing,playerX,playerY,isWeaponArt,isAoE,
                knockback,stunDuration,damageMultiplier,baseDamage:weapon?.damage}},...sample(),target:window.target?.hp}});
            }});
          }};
          s.game.events.on('postrender',()=>{{
            if(!owner?.active || !recordKey) return;
            const p=owner;
            if(p.anims.currentAnim?.key!==recordKey || !p.willRender(s.cameras.main))return;
            drawn.add(p.frame.name);
            if(shot || p.anims.currentFrame?.index!==shotFrame+1) return;
            const cam=s.cameras.main,top=cam.getWorldPoint(0,0),canvas=s.game.canvas;
            const x=Math.round((p.x-top.x)*cam.zoom),y=Math.round((p.y-top.y)*cam.zoom);
            const crop=document.createElement('canvas');crop.width=248;crop.height=188;
            crop.getContext('2d').drawImage(canvas,x-124,y-150,248,188,0,0,248,188);
            shot=crop.toDataURL('image/png');
          }});
          bindKnight();
        }}""")
    def stage(d, armed=True, zone='fog_crossing', xy=(268,245)):
        page.evaluate(f"""([d,a,z,x,y])=>{{
          const s={SCENE},p=s.player;
          p.resetAllInputState();
          if(p.isDead())p.respawn(x,y);
          s.worldBuilder.ensureZoneRendered(z);s.worldBuilder.setActiveZone(z);
          s.currentZoneId=z;s.previousZoneId=z;s.playerState.setCurrentZone(z);
          p.body.reset(x,y);s.applyCameraBoundsForZone(z);s.cameraSystem.centerOn(x,y);
          p._isWeaponDrawn=a;p._lastAutoZoneCheckTime=performance.now()+30000;p.setFacing(d);
          p.stats.stamina=p.stats.maxStamina;p.stats.composure=90;s.timeSystem.setTimeOfDay(90);
          s.transitionCooldown=0;s.transitionCooldownUntil=0;s.isTransitioning=false;s.lastTransitionId=null;
          trace.length=0;hitlog.length=0;drawn.clear();shot=null;recordKey=null;
        }}""",[d,armed,zone,*xy])
        wait('Math.abs(p.body.left-p.x+9)<.04 && Math.abs(p.body.top-p.y+18)<.04')
    def choose(key, shot_frame=3):
        page.evaluate("([k,i])=>{recordKey=k;shotFrame=i}",[key,shot_frame])
    def start_visual(key):
        page.evaluate(f"""(key)=>{{const s={SCENE},p=s.player;
            s.events.once('postupdate',()=>{{p._isInteracting=true;p.play(key);}});
        }}""",key)
    def release_visual():
        val("(()=>{p._isInteracting=false;p.playIdle();})()")
    def read_frames(key):
        return page.evaluate("(k)=>trace.filter(f=>f.key===k)",key)
    def shot_file(group,d):
        image=val('shot')
        assert image and image.startswith('data:image/png;')
        (ROOT/f'shot-{MODE}-{group}-{d}.png').write_bytes(base64.b64decode(image.split(',',1)[1]))
    def normalize(sample):
        assert sample['localAabb']==[-9,-18,18,12] and all(abs(a-b)<0.04 for a,b in zip(sample['actualAabb'],[-9,-18,18,12])),sample
        assert sample['scale']==[1,1] and sample['angle']==0 and sample['actors']==1 and sample['nearest']==1,sample
    def check_registry():
        rows = page.evaluate(f"""() => {{
            const s={SCENE}; return Object.entries(s.anims.anims.entries)
                .filter(([key]) => /^(wayfarer|satyr)_/.test(key))
                .map(([key, anim]) => [key, anim.frames.map(f=>[f.textureKey, f.textureFrame,
                    !!s.textures.get(f.textureKey).has(f.textureFrame)])]);
        }}""")
        assert rows
        registry = dict(rows)
        for key, frames in rows:
            assert frames and all(t.startswith('black_knight_') and ok for t, _, ok in frames),(key, frames)
            if key.startswith('wayfarer_'):
                assert registry[key.replace('wayfarer_', 'satyr_',1)]==frames,key
        forbidden=val("Object.keys(s.textures.list).filter(k=>k==='satyr_sheet'||/^wayfarer_(?!portrait)/.test(k))")
        assert forbidden==[],forbidden
        EVIDENCE['registry']=dict(rows)
        EVIDENCE['legacyTexturesLoaded']=forbidden

    def check_clip(group, d, spec):
        armed=not group.startswith('unarmed_')
        stage(d,armed)
        count=spec['frames']
        key=f'wayfarer_{group}_{d}'
        choose(key,0 if count==1 else min(count-1,count//2))
        if group=='parry_miss':
            wait('Date.now() - p._lastParryTime >= 1500')
            page.keyboard.press('v')
        elif SUITE=='actions':
            action=group.removeprefix('unarmed_').removeprefix('armed_')
            method = {'interact':'playInteract','gather':'playGather','use_item':'playUseItem'}[action]
            page.evaluate(f"""(m)=>{{const s={SCENE};s.events.once('postupdate',()=>{{
                if(!s.player[m]())window.denied=m;
            }});}}""",method)
        else:
            start_visual(key)
        try:
            wait(f"trace.some(f=>f.key==='{key}'&&f.evt==='animationcomplete')",max(30000,count*6500))
            reads=read_frames(key)
            frames=[f for f in reads if f['evt'] in ('animationstart','animationupdate')]
            expected=[f"{spec.get('prefix',group)}_{d}_{i+spec.get('firstFrame',0)}" for i in range(count)]
            assert [f['name'] for f in frames]==expected,reads
            drawn=val('[...drawn]')
            assert drawn==expected,(key,drawn)
            for f in frames:
                normalize(f)
                assert f['texture']==ATLAS and f['armed']==armed and f['facing']==d,f
            assert not val('hitlog')
            if SUITE!='actions':
                release_visual()
            wait("p.anims.currentAnim?.key.includes('_idle_') && !p.isActionLocked()")
            end=val('sample()')
            normalize(end)
            assert end['size']==[64,64] and end['origin']==[.5,1],end
            shot_file(group,d)
            EVIDENCE['actions'][key]={'rendered':drawn,'frames':frames,'idle':end}
            print(MODE,SUITE,key,len(frames),'PASS',flush=True)
        except Exception:
            EVIDENCE['failed']={'key':key,'trace':read_frames(key),'now':val('sample()'),'drawn':val('[...drawn]')}
            raise

    def visit_gameplay():
        stage('right',False)
        val("(()=>{p.stats.health=54;s.playerState.addItem('item_herbal_poultice',1)})()")
        before=val("s.playerState.getItemCount('item_herbal_poultice')")
        choose('wayfarer_unarmed_use_item_right',3)
        page.keyboard.press('1')
        wait("trace.some(f=>f.key==='wayfarer_unarmed_use_item_right'&&f.evt==='animationcomplete')")
        now=val("s.playerState.getItemCount('item_herbal_poultice')")
        assert now==before-1,(before,now)
        assert len([v for v in read_frames('wayfarer_unarmed_use_item_right') if v['evt']=='animationstart'])==1
        EVIDENCE['useItem']={'inventoryBefore':before,'inventoryAfter':now,'pose':read_frames('wayfarer_unarmed_use_item_right'),'rendered':val('[...drawn]')}

        node=val("s.inventorySystem.nodes.map(n=>n.spec).find(n=>n.x>40&&n.x<416&&n.y>140&&n.y<280)")
        if node:
            stage('right',True,'fog_crossing',(node['x']-20,node['y']))
            choose('wayfarer_armed_gather_right',3)
            page.wait_for_timeout(300)
            page.keyboard.press('e')
            wait("trace.some(f=>f.key==='wayfarer_armed_gather_right'&&f.evt==='animationcomplete')",7000)
            EVIDENCE['gather']={'node':node['id'],'depleted':val(f"s.playerState.isNodeDepleted('{node['id']}')"),
                                'pose': read_frames('wayfarer_armed_gather_right'),'rendered':val('[...drawn]')}
            assert EVIDENCE['gather']['depleted']
        else:
            EVIDENCE['gather']={'fixture':'no Fog Crossing node in bounded sample'}

        stage('up',False,'bellhollow',(540,246))
        choose('wayfarer_unarmed_interact_up')
        page.wait_for_timeout(350)
        page.keyboard.press('e')
        wait("s.dialogueSystem.isActive && trace.some(f=>f.key==='wayfarer_unarmed_interact_up'&&f.evt==='animationcomplete')",7000)
        assert val('[...drawn]')==[f'unarmed_interact_up_{i}' for i in range(6)]
        EVIDENCE['interact']={'dialogueActive':val('s.dialogueSystem.isActive'),'pose':read_frames('wayfarer_unarmed_interact_up'),'rendered':val('[...drawn]')}

    def check_locomotion():
        keys = {'down': 's', 'up': 'w', 'left': 'a', 'right': 'd'}
        points = {
            'fog_crossing': {'down': (305,155), 'up': (305,282), 'left': (310,244), 'right': (244,244)},
            'bellhollow': {'down': (975,267), 'up': (975,354), 'left': (1014,344), 'right': (965,298)},
        }
        for armed in (True,False):
            stance = 'armed' if armed else 'unarmed'
            zone = 'fog_crossing' if armed else 'bellhollow'
            for direction, letter in keys.items():
                stage(direction, armed, zone, points[zone][direction])
                prefix = 'wayfarer_' if armed else 'wayfarer_unarmed_'
                timings = {}
                for phase,gait,count in [
                    ('idle_before', 'idle', 6), ('walk', 'walk', 6),
                    ('run', 'run', 12), ('idle_after', 'idle', 6),
                ]:
                    key = f'{prefix}{gait}_{direction}'
                    choose(key, count//2)
                    val('(()=>{trace.length=0;drawn.clear();shot=null})()')
                    if gait=='walk':
                        page.keyboard.down(letter)
                    elif gait=='run':
                        page.evaluate(f"([x,y])=>{{const s={SCENE};s.player.body.reset(x,y);s.cameraSystem.centerOn(x,y);}}",points[zone][direction])
                        page.keyboard.down('Shift')
                    elif phase == 'idle_after':
                        page.keyboard.up(letter)
                        page.keyboard.up('Shift')
                    for attempt in range(90):
                        if gait!='idle':
                            page.keyboard.down(letter)
                            if gait=='run':
                                page.keyboard.down('Shift')
                        if len(val('[...drawn]')) == count: break
                        # Re-stage long software-rendered captures before crossing
                        # a zone or running out of stamina while sampling loops.
                        if gait!='idle' and (attempt+1) % 20 == 0:
                            page.evaluate(f"""([x,y])=>{{const s={SCENE},p=s.player;
                                p.body.reset(x,y);p.stats.stamina=p.stats.maxStamina;
                                s.cameraSystem.centerOn(x,y);
                            }}""",points[zone][direction])
                        page.wait_for_timeout(85)
                    actual=val('[...drawn]')
                    stem = f'{stance}_run_sequence' if gait=='run' else f'{stance}_{gait}'
                    assert set(actual)=={f'{stem}_{direction}_{i}' for i in range(count)}, (key,actual,val('sample()'))
                    sample=val('sample()')
                    normalize(sample)
                    sampled=[f for f in read_frames(key) if f['evt'] in ('animationstart','animationupdate')]
                    assert sampled and all(f['actors']==1 and f['armed']==armed and f['facing']==direction for f in sampled),sampled
                    duration=val(f"s.anims.get('{key}').duration")
                    if gait=='run':
                        assert abs(duration-840)<.001 and sample['texture']=='black_knight_conversion_motion',sample
                        assert val('p.stats.isSprinting'),sample
                    shot_key=f'{stance}_{gait}'
                    shot_file(shot_key,direction)
                    timings[phase]={'key':key,'duration':duration,'rendered':actual,'frames':sampled,'sample':sample}
                assert val('p.body.velocity.length()')==0
                EVIDENCE['actions'][f'{stance}_{direction}']=timings
                print(MODE,'locomotion',stance,direction,'6 idle, 6 walk, 12 run, 6 idle PASS',flush=True)

    try:
        setup()
        check_registry()
        if SUITE=="ingress": visit_gameplay()
        if SUITE=="locomotion": check_locomotion()
        for group,spec in ART.items():
            for direction in DIRS:
                check_clip(group,direction,spec)
        if SUITE=='actions':
            stage('right')
            wait('Date.now() - p._lastParryTime >= 1500')
            val("""(() => { const p=s.player; function trigger(a) {
                if(a.key!=='wayfarer_parry_right') return;
                p.off('animationstart',trigger);
                s.time.delayedCall(1,()=>p.playHurt());
            } p.on('animationstart',trigger); })()""")
            page.keyboard.press('v')
            wait("trace.some(f=>f.key==='wayfarer_parry_success_right'&&f.evt==='animationcomplete')",25000)
            assert not val("trace.some(f=>f.key==='wayfarer_parry_miss_right')")
            EVIDENCE['successWithoutMiss']=True
        assert not EVIDENCE['http'] and not EVIDENCE['pageErrors'] and not EVIDENCE['legacySpriteResponses'],EVIDENCE
        assert not any('not found' in msg.lower() or 'missing frame' in msg.lower() for _,msg in EVIDENCE['console'])
    finally:
        (ROOT/f'{SUITE}-{MODE}.json').write_text(json.dumps(EVIDENCE,ensure_ascii=False,indent=2)+'\n')
        browser.close()
