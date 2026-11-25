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
    page_errors = []
    failed_requests = []
    aborted_media_requests = []
    http_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: page_errors.append(str(err)))
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
            const pb = p.body;
            const foot = p.getFootPosition ? p.getFootPosition() : { x: p.x, y: p.y };
            const detected = gs.worldBuilder.detectCurrentZone(foot);
            return {
                timestamp: performance.now(),
                player: {
                    x: Math.round(p.x * 10) / 10,
                    y: Math.round(p.y * 10) / 10,
                    footX: Math.round(foot.x * 10) / 10,
                    footY: Math.round(foot.y * 10) / 10,
                    velX: Math.round(pb?.velocity?.x || 0),
                    velY: Math.round(pb?.velocity?.y || 0),
                    body: pb ? {
                        x: Math.round(pb.x * 10) / 10,
                        y: Math.round(pb.y * 10) / 10,
                        right: Math.round(pb.right * 10) / 10,
                        bottom: Math.round(pb.bottom * 10) / 10,
                        blocked: pb.blocked,
                        touching: pb.touching
                    } : null
                },
                zone: gs.currentZoneId,
                staticBodiesCount: gs.physics.world.staticBodies?.size ?? gs.physics.world.staticBodies?.length ?? 0,
                colliderGroupCount: gs.worldBuilder?.colliderGroup?.getChildren()?.length || 0
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
    print("=== CASE A: FOG CROSSING & LỐI VÀO BELLHOLLOW ===")
    print("====================================================================")
    # A1: Từ điểm xuất phát (120, 195), đi sang Đông dọc lối mòn tới (350, 195)
    stage_player(120, 195, 'fog_crossing')
    init_a = sample_telemetry()
    print(f" - [A1 Start]: Pos=({init_a['player']['x']}, {init_a['player']['y']}) Zone={init_a['zone']}")
    walk_and_sample('KeyD', 2000, 200)
    mid_a = sample_telemetry()
    print(f" - [A1 Mid Walk Path]: Pos=({mid_a['player']['x']}, {mid_a['player']['y']}) Path open={mid_a['player']['x'] > 180}")

    # A2: Thử rào chắn phía Bắc Fog Crossing (đi North vào fence y=40)
    stage_player(200, 70, 'fog_crossing')
    walk_and_sample('KeyW', 1000, 150)
    north_fence_a = sample_telemetry()
    north_blocked = north_fence_a['player']['body']['blocked']['up'] or north_fence_a['player']['y'] >= 50
    print(f" - [A2 North Boundary Test]: Pos=({north_fence_a['player']['x']}, {north_fence_a['player']['y']}) Blocked={north_blocked}")

    # A3: Đi xuyên qua Cổng Tây vào Bellhollow
    stage_player(450, 235, 'fog_crossing')
    walk_and_sample('KeyD', 2800, 200)
    gate_a = sample_telemetry()
    gate_cleared = (gate_a['zone'] == 'bellhollow' and gate_a['player']['x'] >= 510)
    print(f" - [A3 West Gate Passage]: Pos=({gate_a['player']['x']}, {gate_a['player']['y']}) Zone={gate_a['zone']} Cleared={gate_cleared}")

    case_a_pass = (mid_a['player']['x'] > 180 and north_blocked and gate_cleared)
    print(f" => CASE A PASS: {case_a_pass}")
    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug15_case_a_fog_crossing.png")
    results['case_a'] = {
        'pathOpen': mid_a['player']['x'] > 180,
        'northBlocked': north_blocked,
        'gateCleared': gate_cleared,
        'pass': case_a_pass
    }

    print("\n====================================================================")
    print("=== CASE B: BELLHOLLOW (EDDA, NERIS, GARTH, BRAM & QUẢNG TRƯỜNG) ===")
    print("====================================================================")
    # B1: Đi quanh Garth tại (540, 205)
    stage_player(510, 250, 'bellhollow')
    walk_and_sample('KeyD', 1500, 150)
    garth_bypass = sample_telemetry()
    print(f" - [B1 Bypass Garth on road]: Pos=({garth_bypass['player']['x']}, {garth_bypass['player']['y']}) Passed={garth_bypass['player']['x'] >= 560}")

    # B2: Đi quanh Edda tại (680, 230) và giếng trung tâm (800, 260)
    stage_player(620, 260, 'bellhollow')
    walk_and_sample('KeyD', 2200, 200)
    square_pos = sample_telemetry()
    print(f" - [B2 Central Square]: Pos=({square_pos['player']['x']}, {square_pos['player']['y']}) Reached={square_pos['player']['x'] >= 750}")

    # B3: Đi quanh Neris tại (1050, 220)
    stage_player(950, 250, 'bellhollow')
    walk_and_sample('KeyD', 1800, 150)
    neris_bypass = sample_telemetry()
    print(f" - [B3 Neris Road]: Pos=({neris_bypass['player']['x']}, {neris_bypass['player']['y']}) Passed={neris_bypass['player']['x'] >= 1050}")

    # B4: Tuyến xưởng rèn Bram tại (1373, 432)
    # Đi dọc đường đất từ (1190, 375) qua (1260, 410) tới sân rèn (1330, 440)
    stage_player(1190, 375, 'bellhollow')
    walk_and_sample('KeyD', 1500, 150)
    walk_and_sample('KeyS', 1000, 150)
    bram_courtyard = sample_telemetry()
    print(f" - [B4 Bram Courtyard Path]: Pos=({bram_courtyard['player']['x']}, {bram_courtyard['player']['y']}) Reached courtyard={bram_courtyard['player']['x'] >= 1250 and bram_courtyard['player']['y'] >= 400}")

    # Thử đâm vào chân móng xưởng Bram (1373, 432): móng [1296, 400, 1450, 432]
    # Đi từ (1350, 470) lên North vào móng -> phải bị cản lại ở y >= 432
    stage_player(1350, 460, 'bellhollow')
    walk_and_sample('KeyW', 1000, 150)
    bram_footing_test = sample_telemetry()
    bram_blocked_at_footing = (bram_footing_test['player']['y'] >= 430)
    print(f" - [B4 Bram Smithy Footing Collider]: Pos=({bram_footing_test['player']['x']}, {bram_footing_test['player']['y']}) Blocked={bram_blocked_at_footing}")

    case_b_pass = (
        garth_bypass['player']['x'] >= 560 and
        square_pos['player']['x'] >= 750 and
        neris_bypass['player']['x'] >= 1050 and
        bram_courtyard['player']['x'] >= 1250 and
        bram_courtyard['player']['y'] >= 400 and
        bram_blocked_at_footing
    )
    print(f" => CASE B PASS: {case_b_pass}")
    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug15_case_b_bellhollow.png")
    results['case_b'] = {
        'garthBypass': garth_bypass['player']['x'] >= 560,
        'squareReached': square_pos['player']['x'] >= 750,
        'nerisBypass': neris_bypass['player']['x'] >= 1050,
        'bramCourtyardOpen': bram_courtyard['player']['x'] >= 1250 and bram_courtyard['player']['y'] >= 400,
        'bramFootingBlocked': bram_blocked_at_footing,
        'pass': case_b_pass
    }

    print("\n====================================================================")
    print("=== CASE C: BELLHOLLOW <-> SANCTUARY FARM ===")
    print("====================================================================")
    # C1: Đi qua lối Nam vào Nông Trại
    stage_player(650, 520, 'bellhollow')
    walk_and_sample('KeyS', 2000, 200)
    farm_entry = sample_telemetry()
    in_farm = (farm_entry['zone'] == 'sanctuary_farm' and farm_entry['player']['y'] >= 580)
    print(f" - [C1 Southern Entry to Farm]: Pos=({farm_entry['player']['x']}, {farm_entry['player']['y']}) InFarm={in_farm}")

    # C2: Đi vòng quanh các ô thảo mộc (730, 625)
    stage_player(700, 660, 'sanctuary_farm')
    walk_and_sample('KeyD', 1800, 150)
    plots_path = sample_telemetry()
    print(f" - [C2 Walk along Herb Terrace]: Pos=({plots_path['player']['x']}, {plots_path['player']['y']}) Open={plots_path['player']['x'] >= 760}")

    # C3: Thử chân hàng rào phía Nam (y=1020, player.body.bottom chạm 1020 khi player.y=1026)
    stage_player(650, 990, 'sanctuary_farm')
    walk_and_sample('KeyS', 1000, 150)
    farm_south_fence = sample_telemetry()
    fence_blocked = (1000 <= farm_south_fence['player']['y'] <= 1028)
    print(f" - [C3 South Fence Collision]: Pos=({farm_south_fence['player']['x']}, {farm_south_fence['player']['y']}) Blocked={fence_blocked}")

    case_c_pass = (in_farm and plots_path['player']['x'] >= 760 and fence_blocked)
    print(f" => CASE C PASS: {case_c_pass}")
    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug15_case_c_farm.png")
    results['case_c'] = {
        'inFarm': in_farm,
        'herbTerraceOpen': plots_path['player']['x'] >= 760,
        'southFenceBlocked': fence_blocked,
        'pass': case_c_pass
    }

    print("\n====================================================================")
    print("=== CASE D: OUTER WOODS (TRẠI THỢ SĂN, SIR VAELEN, XƯỞNG CHUÔNG) ===")
    print("====================================================================")
    # D1: Đi vào Outer Woods từ Bellhollow SE
    stage_player(1210, 520, 'bellhollow')
    walk_and_sample('KeyS', 2000, 200)
    ow_entry = sample_telemetry()
    in_ow = (ow_entry['zone'] == 'outer_woods' and ow_entry['player']['y'] >= 580)
    print(f" - [D1 Entry to Outer Woods]: Pos=({ow_entry['player']['x']}, {ow_entry['player']['y']}) InOuterWoods={in_ow}")

    # D2: Lối đi dọc rừng ven về phía lối Xưởng Chuông (1360, 980)
    stage_player(1360, 850, 'outer_woods')
    walk_and_sample('KeyS', 1800, 150)
    workshop_approach = sample_telemetry()
    print(f" - [D2 Approach Bell Workshop]: Pos=({workshop_approach['player']['x']}, {workshop_approach['player']['y']})")

    # D3: Chuyển tiếp vào Xưởng Chuông Bỏ Hoang
    walk_and_sample('KeyS', 1000, 150)
    page.wait_for_timeout(400)
    in_workshop = sample_telemetry()
    workshop_entered = (in_workshop['zone'] == 'sub_bell_workshop')
    print(f" - [D3 Enter Abandoned Workshop]: Pos=({in_workshop['player']['x']}, {in_workshop['player']['y']}) Zone={in_workshop['zone']} Entered={workshop_entered}")

    case_d_pass = (in_ow and workshop_entered)
    print(f" => CASE D PASS: {case_d_pass}")
    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug15_case_d_outer_woods.png")
    results['case_d'] = {
        'inOuterWoods': in_ow,
        'workshopEntered': workshop_entered,
        'pass': case_d_pass
    }

    print("\n====================================================================")
    print("=== CASE E: CÁC TUYẾN MỞ HỢP LỆ & CHECK COLLIDER TRÙNG (SAVE/CONTINUE) ===")
    print("====================================================================")
    # E1: Tuyến thông Farm <-> Outer Woods (1090, 750) <-> (1140, 750)
    stage_player(1080, 750, 'sanctuary_farm')
    walk_and_sample('KeyD', 2000, 200)
    farm_ow_link = sample_telemetry()
    link_open = (farm_ow_link['zone'] == 'outer_woods' and farm_ow_link['player']['x'] >= 1130)
    print(f" - [E1 Farm-OuterWoods Corridor]: Pos=({farm_ow_link['player']['x']}, {farm_ow_link['player']['y']}) Zone={farm_ow_link['zone']} Open={link_open}")

    # E2: Kiểm tra va chạm rào chắn Cổng Đông (1485, 280)
    stage_player(1450, 280, 'bellhollow')
    walk_and_sample('KeyD', 1500, 150)
    east_gate_barrier = sample_telemetry()
    barrier_held = (east_gate_barrier['player']['x'] <= 1500 and east_gate_barrier['zone'] == 'bellhollow')
    print(f" - [E2 East Gate Closed Barrier]: Pos=({east_gate_barrier['player']['x']}, {east_gate_barrier['player']['y']}) Held={barrier_held}")

    # E3: Kiểm tra Save/Continue xem có nhân đôi / sinh trùng collider không
    before_save = sample_telemetry()
    print(f" - [E3 Before Save]: StaticBodies={before_save['staticBodiesCount']} ColliderGroup={before_save['colliderGroupCount']}")
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleSaveManual();
        window.__hw15PrevPlayer = gs.player;
    }""")
    page.wait_for_timeout(500)
    page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').handleLoadCheckpoint()")
    page.wait_for_function("""() => {
        const gs = window.__PHASER_GAME__?.scene?.getScene('GameScene');
        return Boolean(
            gs &&
            window.__PHASER_GAME__.scene.isActive('GameScene') &&
            gs.player &&
            gs.player !== window.__hw15PrevPlayer &&
            (gs.worldBuilder?.colliderGroup?.getChildren()?.length || 0) > 0
        );
    }""", timeout=30000)
    page.wait_for_timeout(1200)

    after_continue = sample_telemetry()
    print(f" - [E3 After Continue]: StaticBodies={after_continue['staticBodiesCount']} ColliderGroup={after_continue['colliderGroupCount']}")

    # Collider count must be non-zero and identical (no duplicates created on reload)
    no_duplicate_colliders = (
        before_save['staticBodiesCount'] > 0 and
        before_save['colliderGroupCount'] > 0 and
        before_save['staticBodiesCount'] == after_continue['staticBodiesCount'] and
        before_save['colliderGroupCount'] == after_continue['colliderGroupCount']
    )
    print(f" - [E3 No Duplicate Colliders]: {no_duplicate_colliders} (Delta Static: {after_continue['staticBodiesCount'] - before_save['staticBodiesCount']}, Delta Group: {after_continue['colliderGroupCount'] - before_save['colliderGroupCount']})")

    case_e_pass = (link_open and barrier_held and no_duplicate_colliders)
    print(f" => CASE E PASS: {case_e_pass}")
    page.screenshot(path="Read/V1.5/Reports/Visuals/hw_bug15_case_e_gating_save_continue.png")
    results['case_e'] = {
        'corridorOpen': link_open,
        'eastGateBarrierHeld': barrier_held,
        'noDuplicateColliders': no_duplicate_colliders,
        'beforeStaticBodies': before_save['staticBodiesCount'],
        'afterStaticBodies': after_continue['staticBodiesCount'],
        'pass': case_e_pass
    }

    # Evaluate all test cases rigorously
    ca_pass = bool(results.get('case_a', {}).get('pass'))
    cb_pass = bool(results.get('case_b', {}).get('pass'))
    cc_pass = bool(results.get('case_c', {}).get('pass'))
    cd_pass = bool(results.get('case_d', {}).get('pass'))
    ce_pass = bool(results.get('case_e', {}).get('pass'))

    no_fatal_errors = (len(page_errors) == 0 and len(console_errors) == 0 and len(failed_requests) == 0 and len(http_errors) == 0)

    overall_pass = (ca_pass and cb_pass and cc_pass and cd_pass and ce_pass and no_fatal_errors)

    summary = {
        'test_type': 'Staged integration (collision boundary verification via staged checkpoints)',
        'case_a_fog_bellhollow': {'pass': ca_pass, 'status': 'PASS' if ca_pass else 'FAIL'},
        'case_b_bellhollow_village': {'pass': cb_pass, 'status': 'PASS' if cb_pass else 'FAIL'},
        'case_c_bellhollow_farm': {'pass': cc_pass, 'status': 'PASS' if cc_pass else 'FAIL'},
        'case_d_outer_woods': {'pass': cd_pass, 'status': 'PASS' if cd_pass else 'FAIL'},
        'case_e_gating_save_continue': {'pass': ce_pass, 'status': 'PASS' if ce_pass else 'FAIL'},
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

    print("\n================ HW-BUG-#15 VERIFICATION SUMMARY ================")
    print(f"Test Type: Integration Test (collider regression across world zones)")
    print(f"Case A (Fog Crossing & Entrance):       {'PASS' if ca_pass else 'FAIL'}")
    print(f"Case B (Bellhollow Village Props/NPCs): {'PASS' if cb_pass else 'FAIL'}")
    print(f"Case C (Bellhollow <-> Farm Fence):     {'PASS' if cc_pass else 'FAIL'}")
    print(f"Case D (Outer Woods & Campfire):        {'PASS' if cd_pass else 'FAIL'}")
    print(f"Case E (Valid Routes & Save/Continue):  {'PASS' if ce_pass else 'FAIL'}")
    print(f"Page Errors: {len(page_errors)} | Console Errors: {len(console_errors)} | Failed Requests: {len(failed_requests)} | HTTP Errors: {len(http_errors)} | Aborted Audio Transitions: {len(aborted_media_requests)}")
    print(f"OVERALL RESULT: {'PASS' if overall_pass else 'FAIL'}")

    exit_code = 0 if overall_pass else 1

except Exception as e:
    print(f"\n[ERROR] Uncaught exception during HW-BUG-#15 test execution: {e}")
    traceback.print_exc()
    results['exception'] = str(e)
    results['traceback'] = traceback.format_exc()
    results['overall_pass'] = False
    exit_code = 1

finally:
    try:
        with open("Read/V1.5/Reports/HW_BUG_15_COLLISION_DATA.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print("\n[Playwright] HW-BUG-#15 Collision data written to Read/V1.5/Reports/HW_BUG_15_COLLISION_DATA.json")
    except Exception as save_err:
        print(f"[ERROR] Failed to save collision JSON: {save_err}")

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

print(f"\n--- HW-BUG-#15 FINISHED WITH EXIT CODE {exit_code} ---")
sys.exit(exit_code)
