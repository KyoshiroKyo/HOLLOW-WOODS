import sys
import os
import time
import threading
import json
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
    browser_candidates = [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
        "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    ]
    chrome_path = next((p for p in browser_candidates if os.path.exists(p)), None)
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

    test_t0 = time.time()
    bgm_stream_paths = (
        "/assets/audio/bgm/knights_quiet_fire.mp3",
        "/assets/audio/bgm/embervale.mp3",
        "/assets/audio/bgm/beyond_the_hills.mp3",
        "/assets/audio/bgm/evergrove.mp3",
        "/assets/audio/bgm/forgotten_orchard.mp3",
    )
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    failed_requests = []
    aborted_media_requests = []
    http_errors = []
    def _on_request_failed(req):
        if "p2game" in req.url:
            return
        rtype = getattr(req, "resource_type", "unknown")
        failure_str = str(req.failure)
        ts_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        elapsed = round(time.time() - test_t0, 3)
        if rtype == "media" and "ERR_ABORTED" in failure_str and any(p in req.url for p in bgm_stream_paths):
            aborted_media_requests.append({
                "url": req.url,
                "method": req.method,
                "resource_type": rtype,
                "failure": failure_str,
                "timestamp_iso": ts_iso,
                "elapsed_s": elapsed,
                "reason": "Intentional HTMLAudioElement BGM stream cancellation on zone switch or page reload/close (AudioManager.stopBGM lifecycle)",
            })
        else:
            failed_requests.append({
                "url": req.url,
                "method": req.method,
                "resource_type": rtype,
                "failure": failure_str,
                "timestamp_iso": ts_iso,
                "elapsed_s": elapsed,
                "reason": "Unexpected request failure",
            })
    page.on("requestfailed", _on_request_failed)
    page.on("response", lambda resp: http_errors.append({
        "status": resp.status,
        "method": resp.request.method,
        "url": resp.url,
        "resource_type": getattr(resp.request, "resource_type", "unknown"),
        "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "elapsed_s": round(time.time() - test_t0, 3),
    }) if (resp.status >= 400 and "p2game" not in resp.url) else None)

    print(f"[Playwright] Loading game from http://127.0.0.1:{PORT}/?dev=1 ...")
    start_load_time = time.time()
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')

    # Wait for MainMenuScene
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=35000)
    print(f"[Playwright] MainMenuScene active after {(time.time() - start_load_time)*1000:.1f}ms")

    # Start New Game
    print("\n[Playwright] Starting New Game...")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1500)

    # Click canvas to ensure focus
    page.click('canvas')
    page.wait_for_timeout(300)

    # Helper function to stage player and verify initial state
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
                player: {
                    x: Math.round(p.x * 10) / 10,
                    y: Math.round(p.y * 10) / 10,
                    footX: Math.round(foot.x * 10) / 10,
                    footY: Math.round(foot.y * 10) / 10,
                    velX: Math.round(p.body?.velocity?.x || 0),
                    velY: Math.round(p.body?.velocity?.y || 0),
                    facing: p.facing
                },
                zone: {
                    current: gs.currentZoneId,
                    detected: detected,
                    active: gs.worldBuilder.getActiveZone()?.id
                },
                camera: {
                    bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
                    scrollX: Math.round(cam.scrollX * 10) / 10,
                    scrollY: Math.round(cam.scrollY * 10) / 10,
                    zoom: Math.round(cam.zoom * 100) / 100,
                    rotation: cam.rotation,
                    hasFollowTarget: Boolean(followTarget === p)
                },
                transitionsCount: gs.lastTransitionId || null
            };
        }""")

    # Function to walk holding a physical key for duration_ms while collecting samples
    def walk_and_sample(key_code, duration_ms, sample_interval_ms=100):
        samples = []
        # Key down
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
            # Re-dispatch keydown periodically so movement holds do not expire
            page.evaluate(f"""() => {{
                window.dispatchEvent(new KeyboardEvent('keydown', {{ code: '{key_code}', key: '{key_code}' }}));
            }}""")
            s = sample_telemetry()
            s['elapsedMs'] = round((time.time() - start_t) * 1000)
            samples.append(s)
            elapsed = time.time() - start_t

        # Key up
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

    print("\n=======================================================")
    print("=== TEST CASE (A): FOG CROSSING <-> BELLHOLLOW ===")
    print("=======================================================")
    # Fog crossing to Bellhollow: stage at (450, 235) (West Gate passage), walk East (KeyD) across x=480 into Bellhollow, then walk West (KeyA) back to 450.
    stage_player(450, 235, 'fog_crossing')
    initial_a = sample_telemetry()
    print(f" - [Case A Start]: Player=({initial_a['player']['x']}, {initial_a['player']['y']}) Zone={initial_a['zone']['current']} Bounds={initial_a['camera']['bounds']}")

    # Walk East towards Bellhollow (3.0 seconds)
    print(" - Walking East (KeyD) across West Gate into Bellhollow...")
    samples_a_east = walk_and_sample('KeyD', 3000, 200)
    mid_a = sample_telemetry()
    print(f" - [Case A Mid]: Player=({mid_a['player']['x']}, {mid_a['player']['y']}) Zone={mid_a['zone']['current']}")

    # Walk West back to Fog Crossing (3.0 seconds)
    print(" - Walking West (KeyA) across West Gate back into Fog Crossing...")
    samples_a_west = walk_and_sample('KeyA', 3000, 200)
    end_a = sample_telemetry()
    print(f" - [Case A End]: Player=({end_a['player']['x']}, {end_a['player']['y']}) Zone={end_a['zone']['current']}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug13_route_a_fog_bellhollow.png")
    results['case_a'] = {
        'initial': initial_a,
        'eastCrossing': samples_a_east,
        'westCrossing': samples_a_west,
        'final': end_a,
        'crossedToBellhollow': any(s['zone']['current'] == 'bellhollow' for s in samples_a_east),
        'returnedToFog': end_a['zone']['current'] == 'fog_crossing',
        'cameraRotations': [s['camera']['rotation'] for s in samples_a_east + samples_a_west],
        'followMaintained': all(s['camera']['hasFollowTarget'] for s in samples_a_east + samples_a_west)
    }

    print("\n=======================================================")
    print("=== TEST CASE (B): BELLHOLLOW <-> SANCTUARY FARM ===")
    print("=======================================================")
    # Bellhollow to Farm: stage at (650, 520) in Bellhollow, walk South (KeyS) across y=560 to ~600, then North (KeyW) back to 520.
    stage_player(650, 520, 'bellhollow')
    initial_b = sample_telemetry()
    print(f" - [Case B Start]: Player=({initial_b['player']['x']}, {initial_b['player']['y']}) Zone={initial_b['zone']['current']}")

    # Walk South into Farm (1.4 seconds)
    print(" - Walking South (KeyS) into Sanctuary Farm...")
    samples_b_south = walk_and_sample('KeyS', 1400, 150)
    mid_b = sample_telemetry()
    print(f" - [Case B Mid]: Player=({mid_b['player']['x']}, {mid_b['player']['y']}) Zone={mid_b['zone']['current']}")

    # Walk North back into Bellhollow (1.4 seconds)
    print(" - Walking North (KeyW) back into Bellhollow...")
    samples_b_north = walk_and_sample('KeyW', 1400, 150)
    end_b = sample_telemetry()
    print(f" - [Case B End]: Player=({end_b['player']['x']}, {end_b['player']['y']}) Zone={end_b['zone']['current']}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug13_route_b_bellhollow_farm.png")
    results['case_b'] = {
        'initial': initial_b,
        'southCrossing': samples_b_south,
        'northCrossing': samples_b_north,
        'final': end_b,
        'crossedToFarm': any(s['zone']['current'] == 'sanctuary_farm' for s in samples_b_south),
        'returnedToBellhollow': end_b['zone']['current'] == 'bellhollow',
        'followMaintained': all(s['camera']['hasFollowTarget'] for s in samples_b_south + samples_b_north)
    }

    print("\n=======================================================")
    print("=== TEST CASE (C): BELLHOLLOW <-> OUTER WOODS ===")
    print("=======================================================")
    # Bellhollow to Outer Woods: stage at (1210, 520), walk South (KeyS) across y=560 to ~600, then North (KeyW) back.
    stage_player(1210, 520, 'bellhollow')
    initial_c = sample_telemetry()
    print(f" - [Case C Start]: Player=({initial_c['player']['x']}, {initial_c['player']['y']}) Zone={initial_c['zone']['current']}")

    # Walk South into Outer Woods (1.4 seconds)
    print(" - Walking South (KeyS) into Outer Woods...")
    samples_c_south = walk_and_sample('KeyS', 1400, 150)
    mid_c = sample_telemetry()
    print(f" - [Case C Mid]: Player=({mid_c['player']['x']}, {mid_c['player']['y']}) Zone={mid_c['zone']['current']}")

    # Walk North back into Bellhollow (1.4 seconds)
    print(" - Walking North (KeyW) back into Bellhollow...")
    samples_c_north = walk_and_sample('KeyW', 1400, 150)
    end_c = sample_telemetry()
    print(f" - [Case C End]: Player=({end_c['player']['x']}, {end_c['player']['y']}) Zone={end_c['zone']['current']}")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug13_route_c_bellhollow_outerwoods.png")
    results['case_c'] = {
        'initial': initial_c,
        'southCrossing': samples_c_south,
        'northCrossing': samples_c_north,
        'final': end_c,
        'crossedToOuterWoods': any(s['zone']['current'] == 'outer_woods' for s in samples_c_south),
        'returnedToBellhollow': end_c['zone']['current'] == 'bellhollow',
        'followMaintained': all(s['camera']['hasFollowTarget'] for s in samples_c_south + samples_c_north)
    }

    print("\n=======================================================")
    print("=== TEST CASE (D): ĐI DỌC RANH GIỚI KHÔNG BƯỚC QUA ===")
    print("=======================================================")
    # Subcase D1: Along Fog Crossing border at x=465, y=190..250 (parallel to x=480).
    stage_player(465, 190, 'fog_crossing')
    print(" - Walking parallel to border in Fog Crossing (x=465, y=190 -> 250)...")
    samples_d1 = walk_and_sample('KeyS', 1200, 120)
    samples_d1_return = walk_and_sample('KeyW', 1200, 120)
    d1_zones = [s['zone']['current'] for s in samples_d1 + samples_d1_return]
    d1_clean = all(z == 'fog_crossing' for z in d1_zones)
    print(f" - Subcase D1: Zone preserved strictly as fog_crossing? {d1_clean} (Zones seen: {set(d1_zones)})")

    # Subcase D2: Along Bellhollow-Farm border at y=535, x=580..680 (parallel to y=560).
    stage_player(580, 535, 'bellhollow')
    print(" - Walking parallel to border in Bellhollow (y=535, x=580 -> 680)...")
    samples_d2 = walk_and_sample('KeyD', 1400, 120)
    samples_d2_return = walk_and_sample('KeyA', 1400, 120)
    d2_zones = [s['zone']['current'] for s in samples_d2 + samples_d2_return]
    d2_clean = all(z == 'bellhollow' for z in d2_zones)
    print(f" - Subcase D2: Zone preserved strictly as bellhollow? {d2_clean} (Zones seen: {set(d2_zones)})")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug13_case_d_boundary_walk.png")
    results['case_d'] = {
        'd1_clean': d1_clean,
        'd1_zones_seen': list(set(d1_zones)),
        'd2_clean': d2_clean,
        'd2_zones_seen': list(set(d2_zones))
    }

    print("\n=======================================================")
    print("=== TEST CASE (E): ĐỨNG TẠI VÙNG GIAO NHAU (2.5s) ===")
    print("=======================================================")
    # Standing directly on the boundary seam:
    # E1: At x=480, y=220 (West Gate seam between Fog Crossing and Bellhollow) for 2.5s
    stage_player(480, 220, 'bellhollow')
    print(" - Standing at seam x=480, y=220 for 2.5s...")
    e1_samples = []
    for _ in range(25):
        page.wait_for_timeout(100)
        e1_samples.append(sample_telemetry())
    e1_zones = [s['zone']['current'] for s in e1_samples]
    e1_stable = (len(set(e1_zones)) == 1)
    print(f" - Seam E1 Stability: {e1_stable} (Zones seen: {set(e1_zones)})")

    # E2: At x=650, y=560 (Seam between Bellhollow and Farm) for 2.5s
    stage_player(650, 560, 'sanctuary_farm')
    print(" - Standing at seam x=650, y=560 for 2.5s...")
    e2_samples = []
    for _ in range(25):
        page.wait_for_timeout(100)
        e2_samples.append(sample_telemetry())
    e2_zones = [s['zone']['current'] for s in e2_samples]
    e2_stable = (len(set(e2_zones)) == 1)
    print(f" - Seam E2 Stability: {e2_stable} (Zones seen: {set(e2_zones)})")

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug13_case_e_seam_standing.png")
    results['case_e'] = {
        'e1_stable': e1_stable,
        'e1_zones_seen': list(set(e1_zones)),
        'e2_stable': e2_stable,
        'e2_zones_seen': list(set(e2_zones))
    }

    print("\n=======================================================")
    print("=== TEST CASE (F): SAVE / CONTINUE SÁT RANH GIỚI ===")
    print("=======================================================")
    # Save near seam (475, 220 in fog_crossing)
    stage_player(475, 220, 'fog_crossing')
    before_save = sample_telemetry()
    print(f" - State before save: Pos=({before_save['player']['x']}, {before_save['player']['y']}) Zone={before_save['zone']['current']} Bounds={before_save['camera']['bounds']}")

    # Execute manual save
    save_result = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return gs.handleSaveManual();
    }""")
    print(f" - Save execution result: {save_result}")
    page.wait_for_timeout(500)

    # Reload via scene restart with continue mode or SaveManager load
    print(" - Reloading game state via Continue / Checkpoint...")
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleLoadCheckpoint();
    }""")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1200)

    after_continue = sample_telemetry()
    print(f" - State after continue: Pos=({after_continue['player']['x']}, {after_continue['player']['y']}) Zone={after_continue['zone']['current']} Bounds={after_continue['camera']['bounds']}")
    print(f" - Camera follow target maintained? {after_continue['camera']['hasFollowTarget']}")

    f_pos_matches = abs(after_continue['player']['x'] - before_save['player']['x']) <= 2.0 and abs(after_continue['player']['y'] - before_save['player']['y']) <= 2.0
    f_zone_matches = (after_continue['zone']['current'] == before_save['zone']['current'])
    f_bounds_valid = (after_continue['camera']['bounds']['width'] >= 1280 and after_continue['camera']['bounds']['height'] >= 720)
    f_follow_ok = after_continue['camera']['hasFollowTarget']

    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug13_case_f_save_continue.png")
    results['case_f'] = {
        'beforeSave': before_save,
        'afterContinue': after_continue,
        'posMatches': f_pos_matches,
        'zoneMatches': f_zone_matches,
        'boundsValid': f_bounds_valid,
        'followOk': f_follow_ok
    }

    # Evaluate all test cases rigorously
    case_a_pass = bool(
        results.get('case_a', {}).get('crossedToBellhollow') and
        results.get('case_a', {}).get('returnedToFog') and
        results.get('case_a', {}).get('followMaintained') and
        all(r == 0 for r in results.get('case_a', {}).get('cameraRotations', []))
    )
    case_b_pass = bool(
        results.get('case_b', {}).get('crossedToFarm') and
        results.get('case_b', {}).get('returnedToBellhollow') and
        results.get('case_b', {}).get('followMaintained')
    )
    case_c_pass = bool(
        results.get('case_c', {}).get('crossedToOuterWoods') and
        results.get('case_c', {}).get('returnedToBellhollow') and
        results.get('case_c', {}).get('followMaintained')
    )
    case_d_pass = bool(
        results.get('case_d', {}).get('d1_clean') and
        results.get('case_d', {}).get('d2_clean')
    )
    case_e_pass = bool(
        results.get('case_e', {}).get('e1_stable') and
        results.get('case_e', {}).get('e2_stable')
    )
    case_f_pass = bool(
        results.get('case_f', {}).get('posMatches') and
        results.get('case_f', {}).get('zoneMatches') and
        results.get('case_f', {}).get('boundsValid') and
        results.get('case_f', {}).get('followOk')
    )
    no_fatal_errors = (len(page_errors) == 0 and len(console_errors) == 0 and len(failed_requests) == 0 and len(http_errors) == 0)

    overall_pass = (case_a_pass and case_b_pass and case_c_pass and case_d_pass and case_e_pass and case_f_pass and no_fatal_errors)

    summary = {
        'test_type': 'Staged integration (camera boundary verification with stage_player checkpoints)',
        'case_a_fog_bellhollow': {'pass': case_a_pass, 'status': 'PASS' if case_a_pass else 'FAIL'},
        'case_b_bellhollow_farm': {'pass': case_b_pass, 'status': 'PASS' if case_b_pass else 'FAIL'},
        'case_c_bellhollow_outerwoods': {'pass': case_c_pass, 'status': 'PASS' if case_c_pass else 'FAIL'},
        'case_d_boundary_walk': {'pass': case_d_pass, 'status': 'PASS' if case_d_pass else 'FAIL'},
        'case_e_seam_standing': {'pass': case_e_pass, 'status': 'PASS' if case_e_pass else 'FAIL'},
        'case_f_save_continue': {'pass': case_f_pass, 'status': 'PASS' if case_f_pass else 'FAIL'},
        'page_errors_count': len(page_errors),
        'console_errors_count': len(console_errors),
        'failed_requests_count': len(failed_requests),
        'http_errors_count': len(http_errors),
        'aborted_audio_requests_count': len(aborted_media_requests),
        'overall_pass': overall_pass,
        'final_status': 'PASS' if overall_pass else 'FAIL'
    }

    results['summary'] = summary
    results['pageErrors'] = page_errors
    results['consoleErrors'] = console_errors
    results['failedRequests'] = failed_requests
    results['httpErrors'] = http_errors
    results['abortedAudioRequests'] = aborted_media_requests

    print("\n================ HW-BUG-#13 VERIFICATION SUMMARY ================")
    print(f"Test Type: Integration Test (boundary transitions via staged checkpoints)")
    print(f"Case A (Fog Crossing <-> Bellhollow):  {'PASS' if case_a_pass else 'FAIL'}")
    print(f"Case B (Bellhollow <-> Farm):          {'PASS' if case_b_pass else 'FAIL'}")
    print(f"Case C (Bellhollow <-> Outer Woods):   {'PASS' if case_c_pass else 'FAIL'}")
    print(f"Case D (Parallel Boundary Walk):       {'PASS' if case_d_pass else 'FAIL'}")
    print(f"Case E (Seam Standing Stability):      {'PASS' if case_e_pass else 'FAIL'}")
    print(f"Case F (Save / Continue At Boundary):  {'PASS' if case_f_pass else 'FAIL'}")
    print(f"Page Errors: {len(page_errors)} | Console Errors: {len(console_errors)} | Failed Requests: {len(failed_requests)} | HTTP Errors: {len(http_errors)} | Aborted Audio Transitions: {len(aborted_media_requests)}")
    print(f"OVERALL RESULT: {'PASS' if overall_pass else 'FAIL'}")

    exit_code = 0 if overall_pass else 1

except Exception as e:
    print(f"\n[ERROR] Uncaught exception during HW-BUG-#13 test execution: {e}")
    traceback.print_exc()
    results['exception'] = str(e)
    results['traceback'] = traceback.format_exc()
    results['overall_pass'] = False
    exit_code = 1

finally:
    # Always save telemetry before exiting
    try:
        with open("Read/V1.5/Reports/HW_BUG_13_CAMERA_DATA.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print("\n[Playwright] HW-BUG-#13 Telemetry data written to Read/V1.5/Reports/HW_BUG_13_CAMERA_DATA.json")
    except Exception as save_err:
        print(f"[ERROR] Failed to save telemetry JSON: {save_err}")

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

print(f"\n--- HW-BUG-#13 FINISHED WITH EXIT CODE {exit_code} ---")
sys.exit(exit_code)
