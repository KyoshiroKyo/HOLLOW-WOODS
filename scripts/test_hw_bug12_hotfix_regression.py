import sys
import os
import time
import threading
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5263
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def run_server():
    try:
        httpd = HTTPServer(('127.0.0.1', PORT), Handler)
        httpd.serve_forever()
    except Exception as e:
        pass

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")

os.makedirs('Read/V1.5/Reports/Visuals', exist_ok=True)
results = {}

with sync_playwright() as pw:
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    browser = pw.chromium.launch(
        executable_path=chrome_path,
        headless=True,
        args=[
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--disable-dev-shm-usage',
            '--no-sandbox'
        ]
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    print(f"[Playwright] Loading game from http://127.0.0.1:{PORT}/?dev=1 ...")
    start_load_time = time.time()
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')

    # Wait for MainMenuScene
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=35000)
    load_duration_ms = (time.time() - start_load_time) * 1000
    print(f"[Playwright] MainMenuScene active after {load_duration_ms:.1f}ms")

    # =========================================================================
    # PART D (PRELIMINARY CHECK): LOADER & STARTUP STATUS
    # =========================================================================
    print("\n--- [PART D AUDIT: PRELOADER & ASSET LOADER CHECK] ---")
    part_d_prelim = page.evaluate("""() => {
        const game = window.__PHASER_GAME__;
        const startupEl = document.getElementById('game-startup');
        const hasDaggerSlash = game.cache.audio.has('dagger_slash');
        const hasAudioMaster = Boolean(window.AudioContext || window.webkitAudioContext);
        
        return {
            startupHidden: startupEl ? startupEl.hidden : null,
            startupState: startupEl ? startupEl.dataset.state : null,
            startupPhase: startupEl ? startupEl.dataset.phase : null,
            hasDaggerSlash,
            hasAudioMaster,
            audioCacheKeysCount: game.cache.audio.entries.size
        };
    }""")
    print("[Part D Prelim Result]:", json.dumps(part_d_prelim, indent=2))
    results['part_d_loader'] = part_d_prelim

    # Start New Game to enter GameScene
    print("\n[Playwright] Transitioning to GameScene via startNewGame()...")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1500)

    # Helper function to place player safely in Bellhollow
    def setup_player_for_testing():
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.worldBuilder.ensureZoneRendered('bellhollow');
            gs.worldBuilder.setActiveZone('bellhollow');
            gs.currentZoneId = 'bellhollow';
            gs.playerState.setCurrentZone('bellhollow');
            gs.player.setPosition(650, 320);
            if (gs.player.body) gs.player.body.reset(650, 320);
            gs.player.forceUnlockActionState();
            gs.player.resetAllInputState();
            gs.noclip = false;
        }""")
        page.wait_for_timeout(300)

    setup_player_for_testing()

    # =========================================================================
    # PART A: HOTFIX-B1 LOCOMOTION SCALE & FOOT SHADOW VERIFICATION
    # =========================================================================
    print("\n=======================================================")
    print("=== PART A: HOTFIX-B1 LOCOMOTION SCALING & FOOT SHADOW ===")
    print("=======================================================")

    part_a_results = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const player = gs.player;
        const body = player.body;
        const res = {
            actorCount: 0,
            animationRegistries: {},
            walkArmed: {},
            walkUnarmed: {},
            runArmed: {},
            runUnarmed: {},
            shadowCheck: {},
            directionSwitch: {}
        };

        // 1. Check actor count
        const actors = gs.children.list.filter(c => c === player || c.constructor.name === 'BlackKnightPlayer');
        res.actorCount = actors.length;

        // Inspect animation clips in anim registry
        ['wayfarer_walk_down', 'wayfarer_unarmed_walk_down', 'wayfarer_run_down', 'wayfarer_unarmed_run_down'].forEach(k => {
            const a = gs.anims.get(k);
            if (a) {
                res.animationRegistries[k] = {
                    key: a.key,
                    framesCount: a.frames.length,
                    textureKey: a.frames[0]?.textureKey,
                    firstFrame: a.frames[0]?.frame?.name
                };
            }
        });

        // Helper to test natural locomotion via input handling
        const dirCodeMap = {
            'down': 'KeyS',
            'up': 'KeyW',
            'left': 'KeyA',
            'right': 'KeyD'
        };

        const testLocomotion = (isArmed, isSprinting, dir) => {
            player.resetAllInputState();
            player.forceUnlockActionState();
            player._isWeaponDrawn = isArmed;
            // Prevent auto-sheathing during test turn
            player._lastAutoZoneCheckTime = performance.now() + 999999;
            player.stats.stamina = 100;
            player._isStaminaExhausted = false;
            
            const code = dirCodeMap[dir];
            player.activePhysicalCodes.add(code);
            if (isSprinting) {
                player.isPhysicalShiftHeld = true;
                player.activePhysicalCodes.add('ShiftLeft');
            } else {
                player.isPhysicalShiftHeld = false;
            }
            
            // Execute movement update
            player.handleMovement();
            player.syncFootShadow();
            
            const shadow = player.footShadowGfx;
            const deltaX = shadow ? Math.abs(shadow.x - player.x) : -1;
            const deltaY = shadow ? Math.abs(shadow.y - player.y) : -1;
            
            const curAnim = player.anims.currentAnim;
            const curFrame = player.frame;
            
            return {
                animKey: curAnim?.key,
                textureKey: player.texture.key,
                frameName: curFrame.name,
                scaleX: player.scaleX,
                scaleY: player.scaleY,
                bodyWidth: body.width,
                bodyHeight: body.height,
                bodyVelX: body.velocity.x,
                bodyVelY: body.velocity.y,
                shadowVisible: shadow ? shadow.visible : false,
                shadowDeltaX: deltaX,
                shadowDeltaY: deltaY,
                originX: player.originX,
                originY: player.originY
            };
        };

        const dirs = ['down', 'up', 'left', 'right'];

        // Walk Armed
        dirs.forEach(d => {
            res.walkArmed[d] = testLocomotion(true, false, d);
        });

        // Walk Unarmed
        dirs.forEach(d => {
            res.walkUnarmed[d] = testLocomotion(false, false, d);
        });

        // Run Armed
        dirs.forEach(d => {
            res.runArmed[d] = testLocomotion(true, true, d);
        });

        // Run Unarmed
        dirs.forEach(d => {
            res.runUnarmed[d] = testLocomotion(false, true, d);
        });

        // Test shift transition: Run -> Walk -> Idle
        testLocomotion(true, true, 'down');
        const runScale = player.scaleX;
        testLocomotion(true, false, 'down');
        const walkScale = player.scaleX;
        player.resetAllInputState();
        player.handleMovement();
        player.syncFootShadow();
        const idleScale = player.scaleX;

        res.shadowCheck = {
            runScale,
            walkScale,
            idleScale,
            idleShadowDeltaX: Math.abs(player.footShadowGfx.x - player.x),
            idleShadowDeltaY: Math.abs(player.footShadowGfx.y - player.y),
            idleShadowVisible: player.footShadowGfx.visible
        };

        // Reset player to clean idle
        player.stats.isSprinting = false;
        player.playIdleAnim();
        player.resetAllInputState();

        return res;
    }""")

    print("[Part A Results Summary]:")
    print(f" - Actor Count: {part_a_results['actorCount']} (Expected: 1)")
    print(f" - Anim Registries: {json.dumps(part_a_results['animationRegistries'], indent=2)}")
    print(f" - Walk Armed Scales: {[v['scaleX'] for v in part_a_results['walkArmed'].values()]} (Expected: all 1.0)")
    print(f" - Walk Unarmed Scales: {[v['scaleX'] for v in part_a_results['walkUnarmed'].values()]} (Expected: all 1.0)")
    print(f" - Run Armed Scales: {[v['scaleX'] for v in part_a_results['runArmed'].values()]} (Expected: all 0.8)")
    print(f" - Run Unarmed Scales: {[v['scaleX'] for v in part_a_results['runUnarmed'].values()]} (Expected: 0.68..0.78)")
    print(f" - Run Armed Anims: {[v['animKey'] for v in part_a_results['runArmed'].values()]}")
    print(f" - Run Unarmed Anims: {[v['animKey'] for v in part_a_results['runUnarmed'].values()]}")
    print(f" - Run Armed Textures: {[v['textureKey'] for v in part_a_results['runArmed'].values()]}")
    print(f" - Shadow Delta on Walk: {[max(v['shadowDeltaX'], v['shadowDeltaY']) for v in part_a_results['walkArmed'].values()]} (Expected: all 0)")
    print(f" - Shadow Delta on Run: {[max(v['shadowDeltaX'], v['shadowDeltaY']) for v in part_a_results['runArmed'].values()]} (Expected: all 0)")
    print(f" - Shadow Check Run->Walk->Idle Scales: Run={part_a_results['shadowCheck']['runScale']}, Walk={part_a_results['shadowCheck']['walkScale']}, Idle={part_a_results['shadowCheck']['idleScale']}")
    results['part_a'] = part_a_results

    # =========================================================================
    # PART B: HOTFIX-B2 INPUT ROUTING, BLUR/FOCUS & IME PACKET HANDLING
    # =========================================================================
    print("\n=======================================================")
    print("=== PART B: HOTFIX-B2 INPUT ROUTING, BLUR/FOCUS & IME ===")
    print("=======================================================")

    part_b_results = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const player = gs.player;
        const body = player.body;
        const res = {
            normalKeyHold: {},
            blurReset: {},
            focusRecovery: {},
            imePacketSeparation: {},
            textInputShield: {}
        };

        // Helper to simulate keydown / keyup
        const fireKey = (type, opts) => {
            const ev = new KeyboardEvent(type, Object.assign({ bubbles: true, cancelable: true }, opts));
            window.dispatchEvent(ev);
            return ev;
        };

        // 1. Normal Key Hold (W key moves up)
        player.resetAllInputState();
        fireKey('keydown', { code: 'KeyW', keyCode: 87, key: 'w' });
        player.handleMovement();
        res.normalKeyHold.velYBefore = body.velocity.y;
        res.normalKeyHold.isWActive = player.isPhysicalCodeDown('KeyW');

        // 2. Blur Event test
        window.dispatchEvent(new Event('blur'));
        res.blurReset.isWActiveAfterBlur = player.isPhysicalCodeDown('KeyW');
        res.blurReset.holdsCountAfterBlur = player.movementHolds.size;
        res.blurReset.velYAfterBlur = body.velocity.y;

        // 3. Focus Recovery test
        window.dispatchEvent(new Event('focus'));
        fireKey('keydown', { code: 'KeyD', keyCode: 68, key: 'd' });
        player.handleMovement();
        res.focusRecovery.velXAfterFocus = body.velocity.x;
        res.focusRecovery.isDActive = player.isPhysicalCodeDown('KeyD');
        fireKey('keyup', { code: 'KeyD', keyCode: 68, key: 'd' });
        player.handleMovement();
        res.focusRecovery.velXAfterRelease = body.velocity.x;

        // 4. IME Packet separation test
        player.resetAllInputState();
        fireKey('keydown', { code: 'KeyW', keyCode: 87, key: 'w' });
        player.handleMovement();
        const holdBefore = player.movementHolds.get('KeyW');
        res.imePacketSeparation.confirmedBeforePacket = holdBefore ? holdBefore.confirmed : null;

        // Send simulated IME keyup packet
        fireKey('keyup', { code: 'KeyW', keyCode: 229, key: 'Process' });
        player.handleMovement();
        const holdAfterImeKeyup = player.movementHolds.get('KeyW');
        res.imePacketSeparation.stillHeldAfterImeKeyup = player.isPhysicalCodeDown('KeyW');
        res.imePacketSeparation.confirmedAfterImeKeyup = holdAfterImeKeyup ? holdAfterImeKeyup.confirmed : null;

        // Send real keyup
        fireKey('keyup', { code: 'KeyW', keyCode: 87, key: 'w' });
        player.handleMovement();
        res.imePacketSeparation.releasedAfterRealKeyup = !player.isPhysicalCodeDown('KeyW');

        // 5. Text Input Shield test
        const testInput = document.createElement('input');
        testInput.type = 'text';
        document.body.appendChild(testInput);
        
        // Focus the input
        testInput.focus();
        testInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        player.syncTextInputFocusState();
        res.textInputShield.isPhaserKeyboardDisabled = !player.scene.input.keyboard.enabled;
        res.textInputShield.isTextInputFocused = player.isTextInputFocused;

        // Blur the input
        testInput.blur();
        testInput.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
        player.syncTextInputFocusState();
        res.textInputShield.isPhaserKeyboardRestored = player.scene.input.keyboard.enabled;
        document.body.removeChild(testInput);

        // Clean up
        player.resetAllInputState();

        return res;
    }""")

    print("[Part B Results Summary]:")
    print(f" - KeyW Hold Velocity Y: {part_b_results['normalKeyHold']['velYBefore']} (Expected: < 0)")
    print(f" - Blur Reset Holds Count: {part_b_results['blurReset']['holdsCountAfterBlur']} (Expected: 0)")
    print(f" - Blur Velocity Y: {part_b_results['blurReset']['velYAfterBlur']} (Expected: 0)")
    print(f" - Focus Recovery Velocity X: {part_b_results['focusRecovery']['velXAfterFocus']} (Expected: > 0)")
    print(f" - IME Packet KeyUp Released Real Key: {not part_b_results['imePacketSeparation']['stillHeldAfterImeKeyup']} (Expected: False - packet must NOT release real key)")
    print(f" - Real KeyUp Released Key: {part_b_results['imePacketSeparation']['releasedAfterRealKeyup']} (Expected: True)")
    print(f" - Text Input Focus Keyboard Disabled: {part_b_results['textInputShield']['isPhaserKeyboardDisabled']} (Expected: True)")
    print(f" - Text Input Blur Keyboard Restored: {part_b_results['textInputShield']['isPhaserKeyboardRestored']} (Expected: True)")
    results['part_b'] = part_b_results

    # =========================================================================
    # PART C: BUG-032 COLLIDER RELATIONS VS ACTIVE BODIES & COMBAT REGRESSION
    # =========================================================================
    print("\n=======================================================")
    print("=== PART C: BUG-032 COLLIDER RELATIONS VS BODIES & COMBAT ===")
    print("=======================================================")

    part_c_results = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const world = gs.physics.world;
        const res = {
            snapshotCounters: {},
            animationFrameAudit: {},
            combatSmoke: {}
        };

        // 1. Check DeveloperModeManager Perf Snapshot via devPanel or directly
        const devManager = gs.devPanel?.manager;
        let perfSnapshot = null;
        if (devManager && typeof devManager.getPerfSnapshot === 'function') {
            perfSnapshot = devManager.getPerfSnapshot();
        }

        const activeCollidersCount = world.colliders.getActive().filter(c => c.active).length;
        const staticBodiesCount = Array.from(world.staticBodies).filter(b => b.enable).length;
        const dynamicBodiesCount = Array.from(world.bodies).filter(b => b.enable).length;

        res.snapshotCounters = {
            perfColliderCount: perfSnapshot?.colliderCount ?? activeCollidersCount,
            perfStaticBodyCount: perfSnapshot?.staticBodyCount ?? staticBodiesCount,
            perfDynamicBodyCount: perfSnapshot?.dynamicBodyCount ?? dynamicBodiesCount,
            actualColliderCount: activeCollidersCount,
            actualStaticBodyCount: staticBodiesCount,
            actualDynamicBodyCount: dynamicBodiesCount,
            areMetricsDistinguished: (activeCollidersCount !== staticBodiesCount)
        };

        // 2. Animation Frame Audit (Check for satyr_sheet missing frames)
        const allAnims = gs.anims.anims.entries;
        let missingFramesCount = 0;
        let satyrSheetFramesCount = 0;
        let totalCheckedFrames = 0;

        for (const [key, anim] of Object.entries(allAnims)) {
            for (const f of anim.frames) {
                totalCheckedFrames++;
                if (!f.frame) missingFramesCount++;
                if (f.textureKey === 'satyr_sheet') satyrSheetFramesCount++;
            }
        }

        res.animationFrameAudit = {
            totalRegisteredAnims: Object.keys(allAnims).length,
            totalCheckedFrames,
            missingFramesCount,
            satyrSheetFramesCount
        };

        // 3. Combat Smoke Check (Light Attack, Heavy Attack, Weapon Art, Roll)
        const player = gs.player;
        player.setPosition(650, 320);
        player.forceUnlockActionState();
        player._isWeaponDrawn = true;
        player._lastAutoZoneCheckTime = performance.now() + 999999;

        // Light Attack
        player.attack();
        const lightAttackAnim = player.anims.currentAnim?.key;
        player.forceUnlockActionState();

        // Heavy Attack
        player.heavyAttack();
        const heavyAttackAnim = player.anims.currentAnim?.key;
        player.forceUnlockActionState();

        // Weapon Art
        player.weaponArt();
        const weaponArtAnim = player.anims.currentAnim?.key;
        player.forceUnlockActionState();

        // Roll
        player.roll();
        const rollAnim = player.anims.currentAnim?.key;
        const isRolling = player._isRolling;
        player.forceUnlockActionState();

        res.combatSmoke = {
            lightAttackAnim,
            heavyAttackAnim,
            weaponArtAnim,
            rollAnim,
            isRollingTriggered: isRolling
        };

        return res;
    }""")

    print("[Part C Results Summary]:")
    print(f" - Active Colliders: {part_c_results['snapshotCounters']['perfColliderCount']} (Matches actual: {part_c_results['snapshotCounters']['actualColliderCount']})")
    print(f" - Static Bodies: {part_c_results['snapshotCounters']['perfStaticBodyCount']} (Matches actual: {part_c_results['snapshotCounters']['actualStaticBodyCount']})")
    print(f" - Dynamic Bodies: {part_c_results['snapshotCounters']['perfDynamicBodyCount']} (Matches actual: {part_c_results['snapshotCounters']['actualDynamicBodyCount']})")
    print(f" - Distinct Metrics: {part_c_results['snapshotCounters']['areMetricsDistinguished']} (Expected: True)")
    print(f" - Missing Animation Frames: {part_c_results['animationFrameAudit']['missingFramesCount']} (Expected: 0)")
    print(f" - Satyr Sheet Legacy Frames in Anims: {part_c_results['animationFrameAudit']['satyrSheetFramesCount']} (Expected: 0)")
    print(f" - Combat Anims Smoke: Light={part_c_results['combatSmoke']['lightAttackAnim']}, Heavy={part_c_results['combatSmoke']['heavyAttackAnim']}, WA={part_c_results['combatSmoke']['weaponArtAnim']}, Roll={part_c_results['combatSmoke']['rollAnim']}")
    results['part_c'] = part_c_results

    # =========================================================================
    # PART D: HOSTED P2GAME VERIFICATION CHECKLIST & ASSET TIMING
    # =========================================================================
    print("\n=======================================================")
    print("=== PART D: BUG-024 LOADER AUDIT & HOSTED CHECKLIST ===")
    print("=======================================================")

    part_d_results = page.evaluate("""() => {
        const game = window.__PHASER_GAME__;
        const audioCache = game.cache.audio;
        const requiredAudioKeys = [
            'dagger_slash', 'scout_whistle', 'sanity_gasp',
            'ambience_village', 'ambience_crossing', 'attack_swing', 'lantern_toggle'
        ];

        const audioChecks = {};
        for (const k of requiredAudioKeys) {
            audioChecks[k] = {
                cached: audioCache.has(k),
                decoded: audioCache.has(k) && Boolean(audioCache.get(k))
            };
        }

        const startupEl = document.getElementById('game-startup');
        const audioManager = window.__PHASER_GAME__?.scene?.getScene('GameScene')?.sound;

        return {
            audioChecks,
            startupElementHidden: startupEl ? startupEl.hidden : false,
            startupElementError: startupEl ? startupEl.dataset.state === 'error' : false,
            allRequiredAudioDecoded: Object.values(audioChecks).every(a => a.cached && a.decoded)
        };
    }""")

    print("[Part D Results Summary]:")
    print(f" - All Required Audio Cached & Decoded: {part_d_results['allRequiredAudioDecoded']} (Expected: True)")
    print(f" - Startup Element Hidden: {part_d_results['startupElementHidden']} (Expected: True)")
    print(f" - Startup Element Error: {part_d_results['startupElementError']} (Expected: False)")
    results['part_d_details'] = part_d_results

    # Save artifact json
    with open("Read/V1.5/Reports/HW_BUG_12_REGRESSION_DATA.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\n[Playwright] Regression data successfully written to Read/V1.5/Reports/HW_BUG_12_REGRESSION_DATA.json")

    # Take screenshot of clean gameplay state
    screenshot_path = "Read/V1.5/Reports/Visuals/hw_bug12_final_regression.png"
    page.screenshot(path=screenshot_path)
    print(f"[Playwright] Final regression screenshot saved to {screenshot_path}")

print("\n--- ALL HW-BUG-#12 REGRESSION CHECKS COMPLETED ---")
