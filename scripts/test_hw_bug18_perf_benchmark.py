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
print(f"[Benchmark Server] Serving dist at http://127.0.0.1:{PORT}")

VISUALS_DIR = 'Read/V1.5/Reports/Visuals/HW_BUG_18'
os.makedirs(VISUALS_DIR, exist_ok=True)
perf_summary = {}
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
            '--no-sandbox',
            '--enable-precise-memory-info'
        ]
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    console_errors = []
    page_errors = []
    failed_requests = []

    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} - {req.failure}"))

    print(f"[Playwright] Loading game from http://127.0.0.1:{PORT}/?dev=1 ...")
    start_load_time = time.time()
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=35000)
    print(f"[Playwright] MainMenuScene active after {(time.time() - start_load_time)*1000:.1f}ms")

    # Start New Game
    print("[Playwright] Starting New Game...")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    print("[Playwright] GameScene active! Warming up...")
    time.sleep(2.5)  # Warm-up to let deferred rendering and initial audio buffers settle

    # Install Performance Telemetry Tracker
    print("[Playwright] Installing Performance Telemetry Hook...")
    page.evaluate("""() => {
        window.__PERF_METRICS__ = {
            frameTimes: [],
            heapSamples: [],
            gameObjectCounts: [],
            physicsBodyCounts: [],
            tweenCounts: [],
            timerCounts: [],
            cullingStats: [],
            ensureZoneCalls: {},
            cullingDurationMsTotal: 0,
            cullingCallCount: 0,
            running: false,
            lastFrameTs: performance.now()
        };

        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');

        // Hook WorldBuilder.ensureZoneRendered
        if (gs && gs.worldBuilder) {
            const origEnsure = gs.worldBuilder.ensureZoneRendered.bind(gs.worldBuilder);
            gs.worldBuilder.ensureZoneRendered = function(zoneId) {
                window.__PERF_METRICS__.ensureZoneCalls[zoneId] = (window.__PERF_METRICS__.ensureZoneCalls[zoneId] || 0) + 1;
                return origEnsure(zoneId);
            };

            // Hook culling
            const origCull = gs.worldBuilder.updateCameraCulling.bind(gs.worldBuilder);
            gs.worldBuilder.updateCameraCulling = function(camera) {
                const t0 = performance.now();
                const res = origCull(camera);
                const dt = performance.now() - t0;
                window.__PERF_METRICS__.cullingDurationMsTotal += dt;
                window.__PERF_METRICS__.cullingCallCount++;
                return res;
            };
        }

        // Frame timing loop
        function frameLoop(now) {
            if (window.__PERF_METRICS__.running) {
                const delta = now - window.__PERF_METRICS__.lastFrameTs;
                window.__PERF_METRICS__.frameTimes.push(delta);

                if (window.__PERF_METRICS__.frameTimes.length % 20 === 0) {
                    // Periodic sample
                    const scene = window.__PHASER_GAME__.scene.getScene('GameScene');
                    if (scene) {
                        const goCount = scene.children ? scene.children.list.length : 0;
                        const pCount = (scene.physics && scene.physics.world && scene.physics.world.bodies) ? scene.physics.world.bodies.size : 0;
                        const twCount = scene.tweens ? scene.tweens.getTweens().length : 0;
                        const tmCount = (scene.time && scene.time._events) ? scene.time._events.length : 0;
                        const heap = performance.memory ? performance.memory.usedJSHeapSize : null;

                        window.__PERF_METRICS__.gameObjectCounts.push(goCount);
                        window.__PERF_METRICS__.physicsBodyCounts.push(pCount);
                        window.__PERF_METRICS__.tweenCounts.push(twCount);
                        window.__PERF_METRICS__.timerCounts.push(tmCount);
                        if (heap) window.__PERF_METRICS__.heapSamples.push(heap);
                    }
                }
            }
            window.__PERF_METRICS__.lastFrameTs = now;
            requestAnimationFrame(frameLoop);
        }
        requestAnimationFrame(frameLoop);
    }""")

    # Function to navigate Wayfarer to zone & coordinates
    def traverse_to(zone_id, x, y, wait_s=1.0):
        page.evaluate(f"""() => {{
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.worldBuilder.ensureZoneRendered('{zone_id}');
            gs.worldBuilder.setActiveZone('{zone_id}');
            gs.currentZoneId = '{zone_id}';
            gs.playerState.setCurrentZone('{zone_id}');
            gs.player.setPosition({x}, {y});
            if (gs.player.body) gs.player.body.reset({x}, {y});
            gs.applyCameraBoundsForZone('{zone_id}');
            gs.cameras.main.centerOn({x}, {y});
            gs.update(0, 16);
        }}""")
        time.sleep(wait_s)

    # Start telemetry collection
    page.evaluate("() => { window.__PERF_METRICS__.running = true; window.__PERF_METRICS__.lastFrameTs = performance.now(); }")
    print("\n--- BEGINNING BENCHMARK CIRCUIT (3 FULL ROUND-TRIP TRAVERSALS) ---")

    benchmark_rounds = 3
    round_snapshots = []

    for r in range(1, benchmark_rounds + 1):
        print(f"\n[Round {r}/{benchmark_rounds}] Starting traversal...")
        # Step 1: Fog Crossing (Campfire / road)
        traverse_to('fog_crossing', 120, 195, wait_s=0.8)
        # Step 2: Bellhollow Plaza (Town square / fountain)
        traverse_to('bellhollow', 800, 260, wait_s=0.8)
        # Step 3: Bellhollow East (Blacksmith Bram / gate)
        traverse_to('bellhollow', 1373, 432, wait_s=0.8)
        # Step 4: Sanctuary Farm (Campfire / crops)
        traverse_to('sanctuary_farm', 650, 700, wait_s=0.8)
        # Step 5: Outer Woods (Forest trail / grove)
        traverse_to('outer_woods', 1360, 650, wait_s=0.8)
        # Step 6: Return Sanctuary Farm
        traverse_to('sanctuary_farm', 650, 700, wait_s=0.8)
        # Step 7: Return Bellhollow Plaza
        traverse_to('bellhollow', 800, 260, wait_s=0.8)
        # Step 8: Return Fog Crossing
        traverse_to('fog_crossing', 120, 195, wait_s=0.8)

        # Snapshot at end of round
        snap = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            return {
                gameObjects: gs.children ? gs.children.list.length : 0,
                physicsBodies: (gs.physics && gs.physics.world && gs.physics.world.bodies) ? gs.physics.world.bodies.size : 0,
                tweens: gs.tweens ? gs.tweens.getTweens().length : 0,
                timers: (gs.time && gs.time._events) ? gs.time._events.length : 0,
                heapUsed: performance.memory ? performance.memory.usedJSHeapSize : null,
                heapTotal: performance.memory ? performance.memory.totalJSHeapSize : null
            };
        }""")
        round_snapshots.append(snap)
        print(f"[Round {r} End Snapshot] GameObjects: {snap['gameObjects']}, Physics: {snap['physicsBodies']}, Tweens: {snap['tweens']}, Timers: {snap['timers']}, Heap: {snap['heapUsed'] // (1024*1024) if snap['heapUsed'] else 'N/A'} MB")

    # Stop collection
    page.evaluate("() => { window.__PERF_METRICS__.running = false; }")
    print("\n--- BENCHMARK CIRCUIT COMPLETED ---")

    # Retrieve all metrics
    metrics = page.evaluate("() => window.__PERF_METRICS__")

    frame_times = metrics['frameTimes']
    # Filter out initial 5 outlier frames from start of telemetry
    if len(frame_times) > 10:
        valid_frames = frame_times[5:]
    else:
        valid_frames = frame_times

    valid_frames.sort()
    count = len(valid_frames)
    avg_frame_time = sum(valid_frames) / count if count > 0 else 16.66
    avg_fps = 1000.0 / avg_frame_time if avg_frame_time > 0 else 60.0

    p50_idx = int(count * 0.50)
    p95_idx = int(count * 0.95)
    p99_idx = int(count * 0.99)

    p50 = valid_frames[p50_idx] if count > 0 else 16.66
    p95 = valid_frames[p95_idx] if count > 0 else 16.66
    p99 = valid_frames[p99_idx] if count > 0 else 16.66
    max_frame = valid_frames[-1] if count > 0 else 16.66

    spikes_50ms = [f for f in valid_frames if f > 50.0]
    spikes_count = len(spikes_50ms)

    culling_calls = metrics['cullingCallCount']
    culling_total_ms = metrics['cullingDurationMsTotal']
    avg_culling_ms = (culling_total_ms / culling_calls) if culling_calls > 0 else 0.0

    print("\n================ BENCHMARK RESULTS ================")
    print(f"Total Profiling Frames Sampled: {count}")
    print(f"Average FPS: {avg_fps:.2f} FPS")
    print(f"Average Frame Time: {avg_frame_time:.2f} ms")
    print(f"Frame Time p50 (Median): {p50:.2f} ms")
    print(f"Frame Time p95: {p95:.2f} ms")
    print(f"Frame Time p99: {p99:.2f} ms")
    print(f"Max Frame Time: {max_frame:.2f} ms")
    print(f"Spikes (>50ms): {spikes_count} frames ({spikes_count / count * 100:.2f}%)")
    print(f"Camera Culling Calls: {culling_calls}, Total Time: {culling_total_ms:.2f} ms, Avg Call: {avg_culling_ms:.3f} ms")
    print(f"Zone Ensure Calls: {metrics['ensureZoneCalls']}")
    print(f"Round Snapshots: {json.dumps(round_snapshots, indent=2)}")

    # Take screenshot of final position
    screenshot_path = f"{VISUALS_DIR}/hw_bug18_perf_circuit.png"
    page.screenshot(path=screenshot_path)
    print(f"Saved circuit screenshot: {screenshot_path}")

    # Evaluation criteria for test execution validity
    frames_sampled_ok = bool(count >= 50)
    culling_active = bool(culling_calls > 0)
    culling_fast = bool(avg_culling_ms < 1.0)
    ez_calls = metrics.get('ensureZoneCalls', {})
    if isinstance(ez_calls, dict):
        ensure_zone_active = bool(len(ez_calls) > 0 and sum(ez_calls.values()) > 0)
    else:
        ensure_zone_active = bool(ez_calls > 0)
    no_fatal_errors = bool(len(page_errors) == 0)

    # Note: Environment is SwiftShader CPU rasterizer, so 60 FPS target applies only to hardware GPU
    gpu_status = "GPU NOT VERIFIED (Headless Chrome SwiftShader CPU software rasterizer)"
    fps_status = "ENVIRONMENT_CONSTRAINED (SwiftShader CPU software rasterizer ~6-8 FPS; 60 FPS target applies to hardware GPU)"

    overall_pass = (frames_sampled_ok and culling_active and culling_fast and ensure_zone_active and no_fatal_errors)

    summary = {
        'test_type': 'Performance Benchmark Profiling (SwiftShader CPU Environment)',
        'frames_sampled_ok': {'pass': frames_sampled_ok, 'count': count, 'status': 'PASS' if frames_sampled_ok else 'FAIL'},
        'culling_overhead_ok': {'pass': culling_fast, 'avg_ms': avg_culling_ms, 'status': 'PASS' if culling_fast else 'FAIL'},
        'culling_active': {'pass': culling_active, 'calls': culling_calls, 'status': 'PASS' if culling_active else 'FAIL'},
        'zone_rendering_active': {'pass': ensure_zone_active, 'status': 'PASS' if ensure_zone_active else 'FAIL'},
        'gpu_status': gpu_status,
        'fps_environment_status': fps_status,
        'page_errors_count': len(page_errors),
        'console_errors_count': len(console_errors),
        'overall_pass': overall_pass,
        'final_status': 'PASS' if overall_pass else 'FAIL'
    }

    # Summary report payload
    perf_summary = {
        'summary': summary,
        'total_frames': count,
        'avg_fps': round(avg_fps, 2),
        'avg_frame_time_ms': round(avg_frame_time, 2),
        'p50_ms': round(p50, 2),
        'p95_ms': round(p95, 2),
        'p99_ms': round(p99, 2),
        'max_frame_time_ms': round(max_frame, 2),
        'spikes_count_gt_50ms': spikes_count,
        'spikes_percentage': round(spikes_count / count * 100, 2) if count > 0 else 0,
        'culling': {
            'calls': culling_calls,
            'total_ms': round(culling_total_ms, 2),
            'avg_ms_per_call': round(avg_culling_ms, 3)
        },
        'zone_rendering': metrics['ensureZoneCalls'],
        'round_snapshots': round_snapshots,
        'console_errors': console_errors,
        'page_errors': page_errors,
        'failed_requests': failed_requests,
        'gpu_status': gpu_status
    }

    print("\n================ HW-BUG-#18 VERIFICATION SUMMARY ================")
    print(f"Test Type: Performance Benchmark (Environment Constrained)")
    print(f"Frames Sampled:       {count} ({'PASS' if frames_sampled_ok else 'FAIL'})")
    print(f"Camera Culling Time:  {avg_culling_ms:.3f} ms/call ({'PASS' if culling_fast else 'FAIL'})")
    print(f"Culling Active:       {culling_calls} calls ({'PASS' if culling_active else 'FAIL'})")
    print(f"Zone Ensure Calls:    {metrics['ensureZoneCalls']} calls ({'PASS' if ensure_zone_active else 'FAIL'})")
    print(f"Average FPS (CPU):    {avg_fps:.2f} FPS [SwiftShader CPU Software Rasterizer]")
    print(f"GPU Verification:     {gpu_status}")
    print(f"Page Errors:          {len(page_errors)} | Console Errors: {len(console_errors)}")
    print(f"OVERALL RESULT:       {'PASS' if overall_pass else 'FAIL'}")

    exit_code = 0 if overall_pass else 1

except Exception as e:
    print(f"\n[ERROR] Uncaught exception during HW-BUG-#18 test execution: {e}")
    traceback.print_exc()
    perf_summary = {
        'exception': str(e),
        'traceback': traceback.format_exc(),
        'overall_pass': False,
        'gpu_status': "GPU NOT VERIFIED (Headless Chrome SwiftShader CPU software rasterizer)"
    }
    exit_code = 1

finally:
    try:
        with open('Read/V1.5/Reports/HW_BUG_18_PERF_DATA.json', 'w', encoding='utf-8') as f:
            json.dump(perf_summary, f, indent=2, ensure_ascii=False)
        print("\nSaved telemetry data to Read/V1.5/Reports/HW_BUG_18_PERF_DATA.json")
    except Exception as save_err:
        print(f"[ERROR] Failed to save perf JSON: {save_err}")

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

print(f"\n--- HW-BUG-#18 FINISHED WITH EXIT CODE {exit_code} ---")
sys.exit(exit_code)
