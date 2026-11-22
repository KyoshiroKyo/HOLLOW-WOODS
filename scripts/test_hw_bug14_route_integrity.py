import os
import sys
import time
import json
import threading
import socket
import traceback
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(line_buffering=True)

DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

PORT = get_free_port()
httpd = None

def run_server():
    global httpd
    try:
        httpd = HTTPServer(('127.0.0.1', PORT), Handler)
        httpd.serve_forever()
    except Exception:
        pass

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")

os.makedirs('Read/V1.5/Reports/Visuals', exist_ok=True)
results = {}
overall_pass = False
exit_code = 1

pw = None
browser = None
try:
    pw = sync_playwright().start()
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
    page_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    print(f"[Playwright] Loading game from http://127.0.0.1:{PORT}/?dev=1 ...")
    start_load_time = time.time()
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=35000)
    print(f"[Playwright] MainMenuScene active after {(time.time() - start_load_time)*1000:.1f}ms")

    # Start New Game
    print("[Playwright] Starting New Game...")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1500)
    page.click('canvas')
    page.wait_for_timeout(300)

    def stage_player(x, y, zone_id):
        page.evaluate(f"""() => {{
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.noclip = false;
            gs.worldBuilder.ensureZoneRendered('{zone_id}');
            gs.worldBuilder.setActiveZone('{zone_id}');
            gs.currentZoneId = '{zone_id}';
            gs.previousZoneId = '{zone_id}';
            gs.playerState.setCurrentZone('{zone_id}');
            gs.player.setPosition({x}, {y});
            gs.player.forceUnlockActionState();
            gs.player.resetAllInputState();
            if (gs.player.body) gs.player.body.setVelocity(0, 0);
            gs.applyCameraBoundsForZone('{zone_id}');
            if (gs.cameraSystem) gs.cameraSystem.centerOn({x}, {y});
            gs.handleZoneLogic();
        }}""")
        page.wait_for_timeout(200)

    def sample_telemetry():
        return page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const cam = gs.cameras.main;
            const p = gs.player;
            const foot = p.getFootPosition ? p.getFootPosition() : { x: p.x, y: p.y };
            const detected = gs.worldBuilder.detectCurrentZone(foot);
            const bounds = cam.getBounds();
            const followTarget = cam._follow;
            return {
                timestamp: performance.now(),
                player: {
                    x: Math.round(p.x * 10) / 10,
                    y: Math.round(p.y * 10) / 10,
                    footX: Math.round(foot.x * 10) / 10,
                    footY: Math.round(foot.y * 10) / 10,
                    velX: Math.round(p.body?.velocity?.x || 0),
                    velY: Math.round(p.body?.velocity?.y || 0)
                },
                zone: {
                    current: gs.currentZoneId,
                    detected: detected?.id || detected,
                    active: gs.worldBuilder.getActiveZone()?.id
                },
                camera: {
                    bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
                    zoom: Math.round(cam.zoom * 100) / 100,
                    rotation: cam.rotation,
                    hasFollowTarget: Boolean(followTarget === p)
                },
                isTransitioning: gs.isTransitioning,
                transitionCooldown: gs.transitionCooldown,
                lastTransitionId: gs.lastTransitionId
            };
        }""")

    def walk_and_sample(key_code, duration_ms, sample_interval_ms=100):
        samples = []
        page.evaluate(f"""() => {{
            window.dispatchEvent(new KeyboardEvent('keydown', {{ code: '{key_code}', key: '{key_code}' }}));
        }}""")
        try:
            page.keyboard.down(key_code)
        except Exception:
            pass

        start_t = time.time()
        elapsed = 0
        while elapsed < (duration_ms / 1000.0):
            page.wait_for_timeout(sample_interval_ms)
            page.evaluate(f"""() => {{
                window.dispatchEvent(new KeyboardEvent('keydown', {{ code: '{key_code}', key: '{key_code}' }}));
            }}""")
            s = sample_telemetry()
            s['elapsedMs'] = round((time.time() - start_t) * 1000)
            samples.append(s)
            elapsed = time.time() - start_t

        try:
            page.keyboard.up(key_code)
        except Exception:
            pass
        page.evaluate(f"""() => {{
            window.dispatchEvent(new KeyboardEvent('keyup', {{ code: '{key_code}', key: '{key_code}' }}));
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.resetAllInputState();
            gs.player.body.setVelocity(0, 0);
        }}""")
        page.wait_for_timeout(100)
        final_s = sample_telemetry()
        final_s['elapsedMs'] = round((time.time() - start_t) * 1000)
        samples.append(final_s)
        return samples

    print("\n====================================================================")
    print("=== TEST 1: CORE BIDIRECTIONAL ROUTES (WALK & RETURN) ===")
    print("====================================================================")
    # 1.1 Fog Crossing <-> Bellhollow
    stage_player(450, 235, 'fog_crossing')
    s_east = walk_and_sample('KeyD', 2800, 200)
    mid_1_1 = sample_telemetry()
    s_west = walk_and_sample('KeyA', 2800, 200)
    end_1_1 = sample_telemetry()
    t1_1_pass = (mid_1_1['zone']['current'] == 'bellhollow' and end_1_1['zone']['current'] == 'fog_crossing')
    print(f" - [1.1 Fog <-> Bellhollow]: mid={mid_1_1['zone']['current']} end={end_1_1['zone']['current']} | PASS={t1_1_pass}")

    # 1.2 Bellhollow <-> Sanctuary Farm
    stage_player(650, 520, 'bellhollow')
    s_south = walk_and_sample('KeyS', 2000, 200)
    mid_1_2 = sample_telemetry()
    s_north = walk_and_sample('KeyW', 2000, 200)
    end_1_2 = sample_telemetry()
    t1_2_pass = (mid_1_2['zone']['current'] == 'sanctuary_farm' and end_1_2['zone']['current'] == 'bellhollow')
    print(f" - [1.2 Bellhollow <-> Farm]: mid={mid_1_2['zone']['current']} end={end_1_2['zone']['current']} | PASS={t1_2_pass}")

    # 1.3 Bellhollow <-> Outer Woods
    stage_player(1210, 520, 'bellhollow')
    s_south_ow = walk_and_sample('KeyS', 2000, 200)
    mid_1_3 = sample_telemetry()
    s_north_ow = walk_and_sample('KeyW', 2000, 200)
    end_1_3 = sample_telemetry()
    t1_3_pass = (mid_1_3['zone']['current'] == 'outer_woods' and end_1_3['zone']['current'] == 'bellhollow')
    print(f" - [1.3 Bellhollow <-> Outer Woods]: mid={mid_1_3['zone']['current']} end={end_1_3['zone']['current']} | PASS={t1_3_pass}")

    # 1.4 Sanctuary Farm <-> Outer Woods
    stage_player(1090, 750, 'sanctuary_farm')
    s_east_fo = walk_and_sample('KeyD', 2000, 200)
    mid_1_4 = sample_telemetry()
    s_west_fo = walk_and_sample('KeyA', 2000, 200)
    end_1_4 = sample_telemetry()
    t1_4_pass = (mid_1_4['zone']['current'] == 'outer_woods' and end_1_4['zone']['current'] == 'sanctuary_farm')
    print(f" - [1.4 Farm <-> Outer Woods]: mid={mid_1_4['zone']['current']} end={end_1_4['zone']['current']} | PASS={t1_4_pass}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug14_test1_core_routes.png")
    results['test1_core_routes'] = {
        'fog_bellhollow': t1_1_pass,
        'bellhollow_farm': t1_2_pass,
        'bellhollow_outerwoods': t1_3_pass,
        'farm_outerwoods': t1_4_pass
    }

    print("\n====================================================================")
    print("=== TEST 2: SUB-ZONE PORTAL (OUTER WOODS <-> BELL WORKSHOP) ===")
    print("====================================================================")
    # Stage in outer woods above workshop entrance (1360, 980)
    stage_player(1360, 980, 'outer_woods')
    print(" - Walking South into Bell Workshop portal trigger...")
    walk_and_sample('KeyS', 1500, 150)
    page.wait_for_timeout(500)
    workshop_state = sample_telemetry()
    entered_workshop = (workshop_state['zone']['current'] == 'sub_bell_workshop')
    print(f" - Inside Workshop: Pos=({workshop_state['player']['x']}, {workshop_state['player']['y']}) Zone={workshop_state['zone']['current']} | Entered={entered_workshop}")

    # Walk North back through exit portal
    print(" - Walking North out of Bell Workshop portal trigger...")
    walk_and_sample('KeyW', 1500, 150)
    page.wait_for_timeout(500)
    returned_state = sample_telemetry()
    exited_workshop = (returned_state['zone']['current'] == 'outer_woods')
    print(f" - Back in Outer Woods: Pos=({returned_state['player']['x']}, {returned_state['player']['y']}) Zone={returned_state['zone']['current']} | Exited={exited_workshop}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug14_test2_workshop_portal.png")
    results['test2_subzone_portal'] = {
        'entered': entered_workshop,
        'exited': exited_workshop,
        'workshopPos': (workshop_state['player']['x'], workshop_state['player']['y']),
        'returnPos': (returned_state['player']['x'], returned_state['player']['y'])
    }

    print("\n====================================================================")
    print("=== TEST 3: SEQUENTIAL MULTI-ZONE CIRCUIT (NO RELOAD) ===")
    print("====================================================================")
    # Circuit: Fog -> Bellhollow -> Farm -> Outer Woods -> Bellhollow
    circuit_log = []
    # Step 1: Fog -> Bellhollow
    stage_player(450, 235, 'fog_crossing')
    walk_and_sample('KeyD', 2600, 200)
    c1 = sample_telemetry()
    circuit_log.append(('Fog->Bellhollow', c1['zone']['current']))

    # Step 2: Bellhollow -> Farm
    stage_player(650, 520, 'bellhollow')
    walk_and_sample('KeyS', 2000, 200)
    c2 = sample_telemetry()
    circuit_log.append(('Bellhollow->Farm', c2['zone']['current']))

    # Step 3: Farm -> Outer Woods
    stage_player(1090, 750, 'sanctuary_farm')
    walk_and_sample('KeyD', 2000, 200)
    c3 = sample_telemetry()
    circuit_log.append(('Farm->OuterWoods', c3['zone']['current']))

    # Step 4: Outer Woods -> Bellhollow
    stage_player(1210, 590, 'outer_woods')
    walk_and_sample('KeyW', 2000, 200)
    c4 = sample_telemetry()
    circuit_log.append(('OuterWoods->Bellhollow', c4['zone']['current']))

    circuit_pass = (
        c1['zone']['current'] == 'bellhollow' and
        c2['zone']['current'] == 'sanctuary_farm' and
        c3['zone']['current'] == 'outer_woods' and
        c4['zone']['current'] == 'bellhollow'
    )
    print(f" - Circuit Transitions Log: {circuit_log} | PASS={circuit_pass}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug14_test3_circuit.png")
    results['test3_circuit'] = {
        'log': circuit_log,
        'pass': circuit_pass
    }

    print("\n====================================================================")
    print("=== TEST 4: BOUNDARY OSCILLATION & DEBOUNCE (STEP IN & OUT) ===")
    print("====================================================================")
    oscillations = []
    for step in range(3):
        stage_player(650, 520, 'bellhollow')
        page.wait_for_timeout(300)
        # Step South across y=560 into Farm
        walk_and_sample('KeyS', 1800, 150)
        s_in = sample_telemetry()
        page.wait_for_timeout(500)
        # Step North back across y=560 into Bellhollow
        walk_and_sample('KeyW', 1800, 150)
        s_out = sample_telemetry()
        oscillations.append({
            'cycle': step + 1,
            'southZone': s_in['zone']['current'],
            'northZone': s_out['zone']['current']
        })
    osc_pass = all(o['southZone'] == 'sanctuary_farm' and o['northZone'] == 'bellhollow' for o in oscillations)
    print(f" - Oscillation 3-cycle results: {oscillations} | PASS={osc_pass}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug14_test4_oscillation.png")
    results['test4_oscillation'] = {
        'cycles': oscillations,
        'pass': osc_pass
    }

    print("\n====================================================================")
    print("=== TEST 5: GATED ROUTE ENFORCEMENT (EAST GATE LOCKED) ===")
    print("====================================================================")
    # At start of game, East Gate is LOCKED.
    # Player approaches East Gate at (1460, 280) in Bellhollow and walks East toward (1540, 280).
    stage_player(1450, 280, 'bellhollow')
    print(" - Approaching locked East Gate (walking East toward x=1540)...")
    walk_and_sample('KeyD', 1800, 150)
    gate_state = sample_telemetry()
    is_still_bellhollow = (gate_state['zone']['current'] == 'bellhollow')
    # Check that East gate prevented crossing into crooked_path
    print(f" - Gate test state: Pos=({gate_state['player']['x']}, {gate_state['player']['y']}) Zone={gate_state['zone']['current']} | Blocked={is_still_bellhollow}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug14_test5_gated_east_gate.png")
    results['test5_gated_route'] = {
        'blockedFromEntering': is_still_bellhollow,
        'finalZone': gate_state['zone']['current'],
        'playerPos': (gate_state['player']['x'], gate_state['player']['y'])
    }

    print("\n====================================================================")
    print("=== TEST 6: SAVE AT ZONE B THEN CONTINUE ===")
    print("====================================================================")
    # Save inside Sanctuary Farm at (650, 620)
    stage_player(650, 620, 'sanctuary_farm')
    save_result = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').handleSaveManual()")
    print(f" - Saved inside Sanctuary Farm: {save_result}")
    page.wait_for_timeout(500)

    # Continue via handleLoadCheckpoint
    print(" - Executing Continue / Checkpoint reload...")
    page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').handleLoadCheckpoint()")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1200)

    loaded_state = sample_telemetry()
    pos_match = abs(loaded_state['player']['x'] - 650) <= 2.0 and abs(loaded_state['player']['y'] - 620) <= 2.0
    zone_match = (loaded_state['zone']['current'] == 'sanctuary_farm')
    follow_ok = loaded_state['camera']['hasFollowTarget']
    t6_pass = (pos_match and zone_match and follow_ok)
    print(f" - Loaded State: Pos=({loaded_state['player']['x']}, {loaded_state['player']['y']}) Zone={loaded_state['zone']['current']} Follow={follow_ok} | PASS={t6_pass}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug14_test6_save_continue.png")
    results['test6_save_continue'] = {
        'posMatch': pos_match,
        'zoneMatch': zone_match,
        'followOk': follow_ok,
        'pass': t6_pass
    }

    # Evaluate all test cases rigorously
    t1_routes = results.get('test1_core_routes', {})
    t1_pass = bool(
        t1_routes.get('fog_bellhollow') and
        t1_routes.get('bellhollow_farm') and
        t1_routes.get('bellhollow_outerwoods') and
        t1_routes.get('farm_outerwoods')
    )
    t2_portal = results.get('test2_subzone_portal', {})
    t2_pass = bool(t2_portal.get('entered') and t2_portal.get('exited'))

    t3_circuit = results.get('test3_circuit', {})
    t3_pass = bool(t3_circuit.get('pass'))

    t4_osc = results.get('test4_oscillation', {})
    t4_pass = bool(t4_osc.get('pass'))

    t5_gated = results.get('test5_gated_route', {})
    t5_pass = bool(t5_gated.get('blockedFromEntering') and t5_gated.get('finalZone') == 'bellhollow')

    t6_save = results.get('test6_save_continue', {})
    t6_pass = bool(t6_save.get('pass'))

    no_fatal_errors = (len(page_errors) == 0)

    overall_pass = (t1_pass and t2_pass and t3_pass and t4_pass and t5_pass and t6_pass and no_fatal_errors)

    summary = {
        'test_type': 'Integration Test (with stage_player checkpoints)',
        'test1_core_routes': {'pass': t1_pass, 'status': 'PASS' if t1_pass else 'FAIL'},
        'test2_subzone_portal': {'pass': t2_pass, 'status': 'PASS' if t2_pass else 'FAIL'},
        'test3_sequential_circuit': {'pass': t3_pass, 'status': 'PASS' if t3_pass else 'FAIL'},
        'test4_boundary_oscillation': {'pass': t4_pass, 'status': 'PASS' if t4_pass else 'FAIL'},
        'test5_gated_route_enforcement': {'pass': t5_pass, 'status': 'PASS' if t5_pass else 'FAIL'},
        'test6_save_at_zone_b_continue': {'pass': t6_pass, 'status': 'PASS' if t6_pass else 'FAIL'},
        'page_errors_count': len(page_errors),
        'console_errors_count': len(console_errors),
        'overall_pass': overall_pass,
        'final_status': 'PASS' if overall_pass else 'FAIL'
    }

    results['summary'] = summary
    results['pageErrors'] = page_errors
    results['consoleErrors'] = console_errors

    print("\n================ HW-BUG-#14 VERIFICATION SUMMARY ================")
    print(f"Test Type: Integration Test (route traversal via staged checkpoints)")
    print(f"Test 1 (Core Bidirectional Routes):     {'PASS' if t1_pass else 'FAIL'}")
    print(f"Test 2 (Sub-Zone Workshop Portal):      {'PASS' if t2_pass else 'FAIL'}")
    print(f"Test 3 (Sequential Multi-Zone Circuit): {'PASS' if t3_pass else 'FAIL'}")
    print(f"Test 4 (Boundary Oscillation Debounce): {'PASS' if t4_pass else 'FAIL'}")
    print(f"Test 5 (Gated Route Enforcement):       {'PASS' if t5_pass else 'FAIL'}")
    print(f"Test 6 (Save at Zone B then Continue):  {'PASS' if t6_pass else 'FAIL'}")
    print(f"Page Errors: {len(page_errors)} | Console Errors: {len(console_errors)}")
    print(f"OVERALL RESULT: {'PASS' if overall_pass else 'FAIL'}")

    exit_code = 0 if overall_pass else 1

except Exception as e:
    print(f"\n[ERROR] Uncaught exception during HW-BUG-#14 test execution: {e}")
    traceback.print_exc()
    results['exception'] = str(e)
    results['traceback'] = traceback.format_exc()
    results['overall_pass'] = False
    exit_code = 1

finally:
    try:
        with open("Read/V1.5/Reports/HW_BUG_14_ROUTES_DATA.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print("\n[Playwright] HW-BUG-#14 Route data written to Read/V1.5/Reports/HW_BUG_14_ROUTES_DATA.json")
    except Exception as save_err:
        print(f"[ERROR] Failed to save route JSON: {save_err}")

    if browser:
        try:
            browser.close()
        except Exception:
            pass

    if pw:
        try:
            pw.stop()
        except Exception:
            pass

    if httpd:
        try:
            httpd.shutdown()
        except Exception:
            pass

print(f"\n--- HW-BUG-#14 FINISHED WITH EXIT CODE {exit_code} ---")
sys.exit(exit_code)
