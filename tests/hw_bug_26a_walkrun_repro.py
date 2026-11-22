"""
HW-BUG-26A: Black Knight Walk/Run Repro & Deep Telemetry Diagnostic Suite
Target: HOLLOW WOODS V1.5.4 Prep
Mode: QA Automation & Diagnostic Telemetry (Read-only Gameplay)

Investigates 5 Core Hypotheses:
A: Input bug causing isSprinting=True without physical Shift held
B: State/transition bug where isSprinting=False but animKey is 'run'
C: Artwork/atlas/frame bug where animKey='walk', speed=85, but visual looks like run
D: Mode transition artifact (armed/unarmed toggle, damage/roll, phase preservation)
E: Speed multiplier deviation (dev.speedMultiplier > 1 or equipment buff)

Executes 12 test scenarios with high-frequency frame telemetry.
"""

import sys
import os
import time
import json
import socket
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'
REPORT_VISUALS_DIR = Path(__file__).resolve().parents[1] / 'Read' / 'V1.5' / 'Reports' / 'Visuals' / 'HW_BUG_26A'
SCRATCH_DIR = Path(__file__).resolve().parents[1] / 'scratch' / 'hw_bug_26a'

REPORT_VISUALS_DIR.mkdir(parents=True, exist_ok=True)
SCRATCH_DIR.mkdir(parents=True, exist_ok=True)

class StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def run_server(httpd):
    httpd.serve_forever()

def main():
    port = get_free_port()
    httpd = HTTPServer(('127.0.0.1', port), StaticHandler)
    server_thread = threading.Thread(target=run_server, args=(httpd,), daemon=True)
    server_thread.start()
    print(f"[HW-BUG-26A] Static test server running at http://127.0.0.1:{port}")

    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    executable = chrome_path if os.path.exists(chrome_path) else None

    anomalies = []
    telemetry_summary = {}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path=executable,
            headless=True,
            args=[
                '--use-gl=angle',
                '--use-angle=swiftshader',
                '--enable-unsafe-swiftshader',
                '--disable-dev-shm-usage',
                '--no-sandbox'
            ]
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        print("\n=== [INIT] Loading HOLLOW WOODS ===")
        page.goto(f"http://127.0.0.1:{port}/?dev=1&zone=bellhollow", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function(
            "() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player",
            timeout=30000
        )
        time.sleep(1.0)

        # Inject Deep Telemetry Recorder
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            window.__TELEMETRY_LOGS__ = [];
            window.__DOM_EVENTS__ = [];
            window.__RECORDING_ACTIVE__ = false;
            window.__RECORDING_TAG__ = '';

            // DOM Keyboard Listener
            const logKeyEvent = (e) => {
                if (!window.__RECORDING_ACTIVE__) return;
                window.__DOM_EVENTS__.push({
                    t: Math.round(performance.now()),
                    tag: window.__RECORDING_TAG__,
                    type: e.type,
                    code: e.code,
                    key: e.key,
                    keyCode: e.keyCode,
                    isComposing: Boolean(e.isComposing),
                    repeat: Boolean(e.repeat),
                    shiftModifier: typeof e.getModifierState === 'function' ? e.getModifierState('Shift') : Boolean(e.shiftKey)
                });
            };
            window.addEventListener('keydown', logKeyEvent, { capture: true, passive: true });
            window.addEventListener('keyup', logKeyEvent, { capture: true, passive: true });

            // Phaser Frame PostUpdate Listener
            gs.events.on('postupdate', (time, delta) => {
                if (!window.__RECORDING_ACTIVE__) return;
                const p = gs.player;
                if (!p) return;

                const body = p.body;
                const vx = body ? body.velocity.x : 0;
                const vy = body ? body.velocity.y : 0;
                const speed = Math.hypot(vx, vy);
                const devSpeedMult = (window.__DEV_CONFIG__ && window.__DEV_CONFIG__.isEnabled) ? (window.__DEV_CONFIG__.speedMultiplier || 1) : 1;

                const holdsObj = {};
                if (p.movementHolds) {
                    for (const [k, v] of p.movementHolds.entries()) {
                        holdsObj[k] = { confirmed: v.confirmed, remainingMs: Math.round(v.expiresAt - performance.now()) };
                    }
                }

                const entry = {
                    t: Math.round(time),
                    perfNow: Math.round(performance.now()),
                    tag: window.__RECORDING_TAG__,
                    activeCodes: Array.from(p.activePhysicalCodes || []),
                    movementHolds: holdsObj,
                    isPhysicalShiftHeld: Boolean(p.isPhysicalShiftHeld),
                    keyShift_isDown: Boolean(p.keyShift && p.keyShift.isDown),
                    cursors_shift_isDown: Boolean(p.cursors?.shift && p.cursors.shift.isDown),
                    stats_isSprinting: Boolean(p.stats.isSprinting),
                    stats_stamina: Math.round(p.stats.stamina * 10) / 10,
                    stats_composure: Math.round(p.stats.composure * 10) / 10,
                    vx: Math.round(vx * 10) / 10,
                    vy: Math.round(vy * 10) / 10,
                    speed: Math.round(speed * 10) / 10,
                    dev_speedMultiplier: devSpeedMult,
                    animKey: p.anims.currentAnim?.key || null,
                    frameTexture: p.anims.currentFrame?.textureKey || null,
                    frameName: p.anims.currentFrame?.frame?.name || null,
                    frameIndex: p.anims.currentFrame?.index || null,
                    displayedHeight: Math.round(p.displayHeight * 10) / 10,
                    scaleX: Math.round(p.scaleX * 100) / 100,
                    scaleY: Math.round(p.scaleY * 100) / 100,
                    bodyHitbox: body ? {
                        width: Math.round(body.width * 10) / 10,
                        height: Math.round(body.height * 10) / 10,
                        offsetX: Math.round(body.offset.x * 10) / 10,
                        offsetY: Math.round(body.offset.y * 10) / 10
                    } : null,
                    facing: p.facing,
                    isWeaponDrawn: Boolean(p._isWeaponDrawn),
                    isActionLocked: Boolean(p.isActionLocked && p.isActionLocked()),
                    isBlocked: body ? {
                        left: body.blocked.left || body.touching.left,
                        right: body.blocked.right || body.touching.right,
                        up: body.blocked.up || body.touching.up,
                        down: body.blocked.down || body.touching.down
                    } : null
                };
                window.__TELEMETRY_LOGS__.push(entry);
            });

            window.startRecording = (tag) => {
                window.__TELEMETRY_LOGS__ = [];
                window.__DOM_EVENTS__ = [];
                window.__RECORDING_TAG__ = tag;
                window.__RECORDING_ACTIVE__ = true;
            };

            window.stopRecording = () => {
                window.__RECORDING_ACTIVE__ = false;
                return {
                    frames: window.__TELEMETRY_LOGS__,
                    domEvents: window.__DOM_EVENTS__
                };
            };
        }""")

        def run_scenario(name, duration_sec, setup_fn, action_fn, check_fn):
            print(f"\n>>> Running Scenario: {name} (duration ~{duration_sec}s) <<<")
            if setup_fn:
                setup_fn()
            page.evaluate(f"() => window.startRecording('{name}')")
            action_meta = action_fn() or {}
            res = page.evaluate("() => window.stopRecording()")
            frames = res['frames']
            dom_events = res['domEvents']
            print(f"Captured {len(frames)} frames, {len(dom_events)} DOM events.")
            telemetry_summary[name] = {
                'frameCount': len(frames),
                'domEventCount': len(dom_events),
                'durationSec': duration_sec
            }
            if check_fn:
                scenario_anomalies = check_fn(frames, dom_events, action_meta)
                if scenario_anomalies:
                    for a in scenario_anomalies:
                        print(f"  [ANOMALY FOUND] {a}")
                        anomalies.append({'scenario': name, 'detail': a})
                else:
                    print(f"  [PASS] Scenario {name} completed without anomalies.")
            return frames, dom_events

        # Helper to reset player to clear road coordinates
        def reset_player_safe(zone='bellhollow', x=120, y=280, weaponDrawn=True):
            page.evaluate(f"""() => {{
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                if (window.__DEV_CONFIG__) window.__DEV_CONFIG__.isNoclip = false;
                gs.currentZoneId = '{zone}';
                gs.player.resetAllInputState();
                gs.player.resetAllActionAndMotionStates();
                gs.player._isWeaponDrawn = {json.dumps(weaponDrawn)};
                gs.player.setPosition({x}, {y});
                gs.player.setVelocity(0, 0);
                gs.player.playIdle();
            }}""")
            time.sleep(0.1)
            page.evaluate("() => { const canvas = document.querySelector('canvas'); if (canvas) canvas.focus(); }")

        # =====================================================================
        # SCENARIO 1: W-ONLY CONTINUOUS WALK FOR 15 SECONDS (No Shift)
        # =====================================================================
        def setup_w15():
            reset_player_safe('bellhollow', 120, 280, weaponDrawn=True)

        def action_w15():
            start_time = time.time()
            page.keyboard.down('KeyW')
            while time.time() - start_time < 15.0:
                y = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').player.y")
                if y < 140:
                    page.evaluate("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; p.y = 280; }")
                time.sleep(0.4)
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            return {'startTime': start_time}

        def check_w15(frames, dom_events, meta):
            issues = []
            if len(frames) < 40:
                issues.append(f"Insufficient frame samples: {len(frames)}")
            for f in frames:
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: isSprinting=True during W-only walk!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: animKey '{f['animKey']}' contains 'run' during W-only walk!")
                if f['frameTexture'] and 'conversion_motion' in f['frameTexture']:
                    issues.append(f"Frame t={f['t']}: frameTexture is conversion_motion during W-only walk!")
                if f['isPhysicalShiftHeld']:
                    issues.append(f"Frame t={f['t']}: isPhysicalShiftHeld=True without Shift pressed!")
                if f['speed'] > 95.0:
                    issues.append(f"Frame t={f['t']}: speed {f['speed']} exceeds walk threshold (95 px/s)!")
            return issues

        run_scenario("1_W_Only_15s", 15.0, setup_w15, action_w15, check_w15)

        # =====================================================================
        # SCENARIOS 2, 3, 4: S, A, D WALK FOR 10 SECONDS EACH (No Shift)
        # =====================================================================
        for key, dir_name in [('KeyS', 'down'), ('KeyA', 'left'), ('KeyD', 'right')]:
            def setup_dir():
                reset_player_safe('bellhollow', 120, 195, weaponDrawn=True)
            def action_dir(k=key):
                start = time.time()
                page.keyboard.down(k)
                while time.time() - start < 10.0:
                    pos = page.evaluate("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; return {x: p.x, y: p.y}; }")
                    if pos['x'] < 60 or pos['x'] > 450 or pos['y'] < 60 or pos['y'] > 300:
                        page.evaluate("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; p.x = 120; p.y = 195; }")
                    time.sleep(0.4)
                page.keyboard.up(k)
                time.sleep(0.2)
                return {'key': k}
            def check_dir(frames, dom_events, meta, d=dir_name):
                issues = []
                for f in frames:
                    if f['stats_isSprinting']:
                        issues.append(f"Frame t={f['t']}: isSprinting=True during {d} walk!")
                    if f['animKey'] and 'run' in f['animKey']:
                        issues.append(f"Frame t={f['t']}: animKey '{f['animKey']}' contains 'run' during {d} walk!")
                    if f['frameTexture'] and 'conversion_motion' in f['frameTexture']:
                        issues.append(f"Frame t={f['t']}: frameTexture is conversion_motion during {d} walk!")
                return issues

            run_scenario(f"234_{dir_name.upper()}_Walk_10s", 10.0, setup_dir, action_dir, check_dir)

        # =====================================================================
        # SCENARIO 5: SPRINT & TRANSITION (Shift Press & Release while holding W)
        # =====================================================================
        def setup_transition():
            reset_player_safe('bellhollow', 120, 300, weaponDrawn=True)
        def action_transition():
            page.keyboard.down('KeyW')
            time.sleep(1.0)
            page.keyboard.down('ShiftLeft')
            time.sleep(1.5)
            shift_release_perf = page.evaluate("() => performance.now()")
            page.keyboard.up('ShiftLeft')
            time.sleep(1.5)
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            return {'shiftReleasePerf': shift_release_perf}

        def check_transition(frames, dom_events, meta):
            issues = []
            rel_t = meta.get('shiftReleasePerf', 0)
            post_shift_frames = [f for f in frames if f['perfNow'] > rel_t + 200 and f['perfNow'] < rel_t + 1400]
            if not post_shift_frames:
                issues.append("No post-shift frames captured")
                return issues
            for f in post_shift_frames:
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: isSprinting True after Shift release!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: animKey '{f['animKey']}' contains 'run' after Shift release!")
                if f['speed'] > 95.0:
                    issues.append(f"Frame t={f['t']}: speed {f['speed']} > 95 after Shift release!")
            return issues

        run_scenario("5_Sprint_Transition_Shift_Release", 4.5, setup_transition, action_transition, check_transition)

        # =====================================================================
        # SCENARIO 6: RAPID SHIFT TAPS DURING WALK
        # =====================================================================
        def setup_rapid():
            reset_player_safe('bellhollow', 120, 300, weaponDrawn=True)
        def action_rapid():
            page.keyboard.down('KeyW')
            time.sleep(0.5)
            for _ in range(4):
                page.keyboard.down('ShiftLeft')
                time.sleep(0.06)
                page.keyboard.up('ShiftLeft')
                time.sleep(0.08)
            final_release_perf = page.evaluate("() => performance.now()")
            time.sleep(1.2)
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            return {'finalReleasePerf': final_release_perf}

        def check_rapid(frames, dom_events, meta):
            issues = []
            final_t = meta.get('finalReleasePerf', 0)
            final_walk_frames = [f for f in frames if f['perfNow'] > final_t + 250 and f['perfNow'] < final_t + 1100]
            if not final_walk_frames:
                issues.append("No final walk frames captured after rapid taps")
                return issues
            for f in final_walk_frames:
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: Stuck sprint after rapid taps!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: Stuck run anim after rapid taps!")
            return issues

        run_scenario("6_Rapid_Shift_Taps", 3.5, setup_rapid, action_rapid, check_rapid)

        # =====================================================================
        # SCENARIO 7: ARMED VS UNARMED LOCOMOTION
        # =====================================================================
        def setup_unarmed():
            # In Bellhollow village (x >= 480), player is in safe sanctuary zone where weapon is sheathed
            reset_player_safe('bellhollow', 600, 260, weaponDrawn=False)
            page.evaluate("""() => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.currentZoneId = 'bellhollow';
                gs.player.setPosition(600, 260);
                gs.player.toggleWeapon(false);
            }""")
            time.sleep(0.6)
        def action_unarmed():
            press_times = {}
            for key, dir_name in [('KeyW', 'up'), ('KeyS', 'down'), ('KeyA', 'left'), ('KeyD', 'right')]:
                t = page.evaluate("() => performance.now()")
                press_times[dir_name] = t
                page.keyboard.down(key)
                time.sleep(0.6)
                page.keyboard.up(key)
                time.sleep(0.2)
            return {'pressTimes': press_times}

        def check_unarmed(frames, dom_events, meta):
            issues = []
            times = meta.get('pressTimes', {})
            for dir_name, start_t in times.items():
                dir_frames = [f for f in frames if f['perfNow'] > start_t + 250 and f['perfNow'] < start_t + 550]
                for f in dir_frames:
                    if f['animKey'] and f"unarmed_walk_{dir_name}" not in f['animKey']:
                        issues.append(f"Frame t={f['t']}: Expected unarmed_walk_{dir_name}, got '{f['animKey']}'")
                    if f['stats_isSprinting']:
                        issues.append(f"Frame t={f['t']}: isSprinting=True during unarmed walk {dir_name}")
            return issues

        run_scenario("7_Armed_Unarmed_Locomotion", 4.0, setup_unarmed, action_unarmed, check_unarmed)

        # =====================================================================
        # SCENARIO 8: WINDOW BLUR / ALT-TAB WHILE HOLDING SHIFT
        # =====================================================================
        def setup_blur():
            reset_player_safe('bellhollow', 120, 250, weaponDrawn=True)
        def action_blur():
            page.keyboard.down('ShiftLeft')
            page.keyboard.down('KeyW')
            time.sleep(0.4)
            page.evaluate("() => window.dispatchEvent(new Event('blur'))")
            time.sleep(0.1)
            page.keyboard.up('ShiftLeft')
            page.keyboard.up('KeyW')
            time.sleep(0.1)
            page.evaluate("() => window.dispatchEvent(new Event('focus'))")
            time.sleep(0.1)
            w_press_t = page.evaluate("() => performance.now()")
            page.keyboard.down('KeyW')
            time.sleep(1.0)
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            return {'wPressT': w_press_t}

        def check_blur(frames, dom_events, meta):
            issues = []
            w_t = meta.get('wPressT', 0)
            eval_frames = [f for f in frames if f['perfNow'] > w_t + 200 and f['perfNow'] < w_t + 900]
            if not eval_frames:
                issues.append("No evaluation frames after blur recovery")
                return issues
            for f in eval_frames:
                if f['isPhysicalShiftHeld']:
                    issues.append(f"Frame t={f['t']}: isPhysicalShiftHeld stuck True after blur recovery!")
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: isSprinting stuck True after blur recovery!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: animKey stuck run after blur recovery!")
            return issues

        run_scenario("8_Blur_AltTab_Recovery", 2.5, setup_blur, action_blur, check_blur)

        # =====================================================================
        # SCENARIO 9: MODAL / ESCAPE RECOVERY WHILE HOLDING SHIFT
        # =====================================================================
        def setup_modal():
            reset_player_safe('bellhollow', 120, 250, weaponDrawn=True)
        def action_modal():
            page.keyboard.down('ShiftLeft')
            page.keyboard.down('KeyW')
            time.sleep(0.3)
            page.keyboard.press('Escape')
            time.sleep(0.3)
            page.keyboard.up('ShiftLeft')
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            page.keyboard.press('Escape')
            time.sleep(0.3)
            w_press_t = page.evaluate("() => performance.now()")
            page.keyboard.down('KeyW')
            time.sleep(1.0)
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            return {'wPressT': w_press_t}

        def check_modal(frames, dom_events, meta):
            issues = []
            w_t = meta.get('wPressT', 0)
            eval_frames = [f for f in frames if f['perfNow'] > w_t + 200 and f['perfNow'] < w_t + 900]
            if not eval_frames:
                issues.append("No evaluation frames after modal close")
                return issues
            for f in eval_frames:
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: isSprinting stuck True after modal close!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: animKey stuck run after modal close!")
            return issues

        run_scenario("9_Modal_Escape_Recovery", 3.0, setup_modal, action_modal, check_modal)

        # =====================================================================
        # SCENARIO 10: WALKING AGAINST SOLID COLLIDER (Outer Woods Bush/Tree at 1187, 621)
        # =====================================================================
        def setup_collider():
            page.evaluate("""() => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.player.resetAllInputState();
                gs.player.setPosition(1187, 621);
                gs.currentZoneId = 'outer_woods';
                gs.cameras.main.centerOn(1187, 621);
                gs.player.setVelocity(0, 0);
                gs.player.playIdle();
            }""")
            time.sleep(0.3)
            page.evaluate("() => { const canvas = document.querySelector('canvas'); if (canvas) canvas.focus(); }")

        def action_collider():
            page.keyboard.down('KeyA')
            time.sleep(3.0)
            page.keyboard.up('KeyA')
            time.sleep(0.2)
            return {}

        def check_collider(frames, dom_events, meta):
            issues = []
            blocked_frames = [f for f in frames if f['isBlocked'] and (f['isBlocked']['left'] or f['isBlocked']['right'] or f['isBlocked']['up'] or f['isBlocked']['down'])]
            print(f"Captured {len(blocked_frames)} frames while colliding against obstacle.")
            for f in blocked_frames:
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: isSprinting=True while blocked by obstacle without Shift!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: animKey '{f['animKey']}' is run while blocked by obstacle without Shift!")
                if f['frameTexture'] and 'conversion_motion' in f['frameTexture']:
                    issues.append(f"Frame t={f['t']}: frameTexture is conversion_motion while blocked by obstacle without Shift!")
            return issues

        run_scenario("10_Outer_Woods_Collider_Walk", 3.5, setup_collider, action_collider, check_collider)

        # =====================================================================
        # SCENARIO 11: SYNTHETIC EVKey / UniKey IME PACKET INJECTION
        # =====================================================================
        def setup_ime():
            reset_player_safe('bellhollow', 120, 250, weaponDrawn=True)
        def action_ime():
            page.evaluate("""() => {
                const evDown = new KeyboardEvent('keydown', {
                    code: '',
                    key: 'Process',
                    keyCode: 229,
                    which: 229,
                    bubbles: true,
                    cancelable: true
                });
                window.dispatchEvent(evDown);

                const evUp = new KeyboardEvent('keyup', {
                    code: '',
                    key: 'Process',
                    keyCode: 229,
                    which: 229,
                    bubbles: true,
                    cancelable: true
                });
                window.dispatchEvent(evUp);
            }""")
            time.sleep(0.1)
            w_press_t = page.evaluate("() => performance.now()")
            page.keyboard.down('KeyW')
            time.sleep(1.5)
            page.keyboard.up('KeyW')
            time.sleep(0.2)
            return {'wPressT': w_press_t}

        def check_ime(frames, dom_events, meta):
            issues = []
            w_t = meta.get('wPressT', 0)
            eval_frames = [f for f in frames if f['perfNow'] > w_t + 200 and f['perfNow'] < w_t + 1300]
            for f in eval_frames:
                if f['stats_isSprinting']:
                    issues.append(f"Frame t={f['t']}: isSprinting=True after synthetic IME packet!")
                if f['animKey'] and 'run' in f['animKey']:
                    issues.append(f"Frame t={f['t']}: animKey contains 'run' after synthetic IME packet!")
            return issues

        run_scenario("11_Synthetic_IME_Packet_Walk", 2.0, setup_ime, action_ime, check_ime)

        # =====================================================================
        # SCENARIO 12: ARTWORK CAPTURE & ATLAS VERIFICATION
        # =====================================================================
        print("\n=== [TEST 12] Live Visual Captures of Locomotion Frames ===")
        captures = {}
        for posture in ['armed', 'unarmed']:
            for dir_name in ['down', 'up', 'left', 'right']:
                for gait in ['walk', 'run']:
                    cap_tag = f"{posture}_{gait}_{dir_name}"
                    prefix = "" if posture == 'armed' else "unarmed_"
                    anim_key = f"wayfarer_{prefix}{gait}_{dir_name}"
                    page.evaluate(f"""() => {{
                        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                        gs.player.setPosition(200, 200);
                        gs.player._isWeaponDrawn = {json.dumps(posture == 'armed')};
                        gs.player.facing = '{dir_name}';
                        gs.player.play('{anim_key}');
                    }}""")
                    time.sleep(0.08)
                    page.evaluate("""() => {
                        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                        gs.cameras.main.centerOn(gs.player.x, gs.player.y);
                    }""")
                    time.sleep(0.05)
                    scr_path = REPORT_VISUALS_DIR / f"{cap_tag}.png"
                    page.screenshot(path=str(scr_path), clip={'x': 640 - 80, 'y': 360 - 80, 'width': 160, 'height': 160})
                    captures[cap_tag] = str(scr_path)

        print(f"Generated {len(captures)} locomotion visual captures in {REPORT_VISUALS_DIR}")

        browser.close()

    print("\n=======================================================")
    print("=== SUMMARY OF HW-BUG-26A DIAGNOSTIC TELEMETRY ===")
    print("=======================================================")
    print(f"Total scenarios tested: {len(telemetry_summary)}")
    print(f"Total anomalies detected: {len(anomalies)}")

    report_data = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S%z'),
        'totalScenarios': len(telemetry_summary),
        'anomaliesCount': len(anomalies),
        'anomalies': anomalies,
        'summary': telemetry_summary
    }

    with open(SCRATCH_DIR / 'telemetry_results.json', 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2)

    if anomalies:
        print("\n[CRITICAL] Anomalies detected:")
        for a in anomalies:
            print(f"  - [{a['scenario']}] {a['detail']}")
        print("\nExiting with code 1 due to detected anomalies.")
        sys.exit(1)
    else:
        print("\n[SUCCESS] ZERO anomalies detected in automated Playwright headless environment.")
        print("Note per HW-BUG-26A spec: Automation cannot replace physical EVKey/UniKey OS keyboard hook.")
        print("Conclusion: NOT REPRODUCED IN AUTOMATION + NEEDS WINDOWS EVKEY verification.")
        sys.exit(0)

if __name__ == '__main__':
    main()
