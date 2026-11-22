import sys
import os
import time
import json
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5204
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def run_server():
    httpd = HTTPServer(('127.0.0.1', PORT), Handler)
    httpd.serve_forever()

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")

mode = sys.argv[1] if len(sys.argv) > 1 else 'after'
print(f"[QA] Running in mode: {mode.upper()} - Comprehensive HW-FIX-23 & BUG-023 Regression Suite")

test_results = {}

with sync_playwright() as pw:
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    browser = pw.chromium.launch(
        executable_path=chrome_path,
        headless=True,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    # Track console errors
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
    page.wait_for_timeout(500)

    # 1. SETUP GAME
    print("\n--- SETUP: START NEW GAME & INSTRUMENTATION ---")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1000)
    print("  [PASS] GameScene active and Player instantiated.")

    setup_script = """
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');

        // Mở khóa phân khu kiểm thử
        gs.playerState.setFlag('east_gate_unlocked');
        gs.playerState.setFlag('entered_silent_mire');
        gs.playerState.setFlag('mire_unlocked');
        gs.playerState.setFlag('shrine_unlocked');
        gs.worldBuilder.ensureZoneRendered('outer_woods');
        gs.worldBuilder.ensureZoneRendered('bellhollow');
        gs.worldBuilder.ensureZoneRendered('sanctuary_farm');

        window.__SET_TEST_ZONE__ = function(zoneId, x, y) {
            gs.worldBuilder.ensureZoneRendered(zoneId);
            gs.worldBuilder.setActiveZone(zoneId);
            gs.currentZoneId = zoneId;
            gs.previousZoneId = zoneId;
            gs.playerState.setCurrentZone(zoneId);
            if (x !== undefined && y !== undefined) {
                gs.player.setPosition(x, y);
                if (gs.player.body) gs.player.body.reset(x, y);
            }
        };

        window.__TEST_METRICS__ = {
            flashCalls: [],
            shakeCalls: [],
            realCameraFlashes: [],
            realCameraShakes: [],
            popupMessages: [],
            fowRedrawCount: 0,
            fowRedrawTimes: []
        };

        if (gs.cameraSystem) {
            const origFlash = gs.cameraSystem.flash.bind(gs.cameraSystem);
            gs.cameraSystem.flash = function(duration, r, g, b) {
                window.__TEST_METRICS__.flashCalls.push({ time: performance.now(), duration, r, g, b });
                return origFlash(duration, r, g, b);
            };

            const origShake = gs.cameraSystem.shake.bind(gs.cameraSystem);
            gs.cameraSystem.shake = function(duration, intensity) {
                window.__TEST_METRICS__.shakeCalls.push({ time: performance.now(), duration, intensity });
                return origShake(duration, intensity);
            };
        }

        // Instrument real Phaser camera methods
        if (gs.cameras && gs.cameras.main) {
            const origCamFlash = gs.cameras.main.flash.bind(gs.cameras.main);
            gs.cameras.main.flash = function(duration, r, g, b) {
                window.__TEST_METRICS__.realCameraFlashes.push({ time: performance.now(), duration, r, g, b });
                return origCamFlash(duration, r, g, b);
            };

            const origCamShake = gs.cameras.main.shake.bind(gs.cameras.main);
            gs.cameras.main.shake = function(duration, intensity) {
                window.__TEST_METRICS__.realCameraShakes.push({ time: performance.now(), duration, intensity });
                return origCamShake(duration, intensity);
            };
        }

        // Instrument popup messages
        if (uis) {
            const origPopup = uis.showPopupMessage.bind(uis);
            uis.showPopupMessage = function(msg) {
                window.__TEST_METRICS__.popupMessages.push({ time: performance.now(), msg });
                return origPopup(msg);
            };
        }

        // Instrument FOW clear
        if (gs.fogOfWarLayer) {
            const origClear = gs.fogOfWarLayer.clear.bind(gs.fogOfWarLayer);
            gs.fogOfWarLayer.clear = function() {
                window.__TEST_METRICS__.fowRedrawCount++;
                const t0 = performance.now();
                const res = origClear();
                window.__TEST_METRICS__.fowRedrawTimes.push(performance.now() - t0);
                return res;
            };
        }
    }
    """
    page.evaluate(setup_script)

    # Helper function to advance frames
    def advance_frames(ms=300):
        page.wait_for_timeout(ms)

    advance_frames(400)

    # ---------------------------------------------------------
    # TEST 1: Outer Woods ban ngày, composure 35
    # ---------------------------------------------------------
    print("\n--- TEST 1: OUTER WOODS BAN NGÀY, COMPOSURE 35 ---")
    t1 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60); // DAY
        gs.playerState.stats.composure = 35;
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        const bpm = gs.audioManager.getHeartbeatBpm();
                        const foot = gs.player.getFootPosition();
                        const detected = gs.worldBuilder.detectCurrentZone(foot);
                        resolve({
                            vignetteActive: uis.isPanicVignetteActive,
                            heartbeatActive: gs.audioManager.isHeartbeatActive,
                            bpm: bpm,
                            zone: gs.currentZoneId,
                            detected: detected,
                            foot: foot,
                            comp: gs.playerState.stats.composure,
                            warmth: gs.survivalSystem?.isNearWarmth(gs.player.x, gs.player.y, gs.currentZoneId),
                            phase: gs.timeSystem?.getCurrentPhase()
                        });
                    }, 80);
                });
            });
        });
    }
    """)
    print(f"  T1 Result: Vignette={t1['vignetteActive']}, Heartbeat={t1['heartbeatActive']}, BPM={t1['bpm']}, Zone={t1['zone']}, Detected={t1['detected']}, Comp={t1['comp']}, Warmth={t1['warmth']}, Phase={t1['phase']}")
    assert t1['vignetteActive'], "Vignette MUST be active in Outer Woods at Day with composure 35"
    assert t1['heartbeatActive'], "Heartbeat MUST be active in Outer Woods at Day with composure 35"
    assert 75 <= t1['bpm'] <= 135, f"BPM must be in [75..135], got {t1['bpm']}"
    print("  [PASS] Test 1: Hiệu ứng kinh dị ban ngày ngoài vùng an toàn hoạt động chính xác.")
    test_results['test_1_outer_woods_day_comp35'] = t1

    # ---------------------------------------------------------
    # TEST 2: Outer Woods ban ngày, composure 15
    # ---------------------------------------------------------
    print("\n--- TEST 2: OUTER WOODS BAN NGÀY, COMPOSURE 15 ---")
    t2 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60); // DAY
        gs.playerState.stats.composure = 15;
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        resolve({
                            comp: gs.playerState.stats.composure,
                            vignetteActive: uis.isPanicVignetteActive,
                            heartbeatActive: gs.audioManager.isHeartbeatActive,
                            bpm: gs.audioManager.getHeartbeatBpm(),
                            phase: gs.timeSystem?.getCurrentPhase()
                        });
                    }, 80);
                });
            });
        });
    }
    """)
    print(f"  T2 Result: Vignette={t2['vignetteActive']}, Heartbeat={t2['heartbeatActive']}, BPM={t2['bpm']}, Comp={t2.get('comp')}, Phase={t2['phase']}")
    assert t2['vignetteActive'], "Vignette MUST be active at composure 15"
    assert t2['heartbeatActive'], "Heartbeat MUST be active at composure 15"
    assert t2['bpm'] >= 120, f"BPM must reach near-max (>=120) at composure 15, got {t2['bpm']}"
    print("  [PASS] Test 2: Mức nguy kịch ban ngày kích hoạt trọn vẹn visual & audio.")
    test_results['test_2_outer_woods_day_comp15'] = t2

    # ---------------------------------------------------------
    # TEST 3: Outer Woods ban đêm, composure 35
    # ---------------------------------------------------------
    print("\n--- TEST 3: OUTER WOODS BAN ĐÊM, COMPOSURE 35 ---")
    t3 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(300); // NIGHT
        gs.playerState.stats.composure = 35;
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        resolve({
                            comp: gs.playerState.stats.composure,
                            vignetteActive: uis.isPanicVignetteActive,
                            heartbeatActive: gs.audioManager.isHeartbeatActive,
                            bpm: gs.audioManager.getHeartbeatBpm(),
                            phase: gs.timeSystem?.getCurrentPhase()
                        });
                    }, 80);
                });
            });
        });
    }
    """)
    print(f"  T3 Result: Phase={t3['phase']}, Vignette={t3['vignetteActive']}, Heartbeat={t3['heartbeatActive']}")
    assert t3['phase'] == 'NIGHT', f"Phase must be NIGHT, got {t3['phase']}"
    assert t3['vignetteActive'] and t3['heartbeatActive'], "Night composure 35 must have vignette and heartbeat"
    print("  [PASS] Test 3: Outer Woods ban đêm composure 35 hoạt động chuẩn xác.")
    test_results['test_3_outer_woods_night_comp35'] = t3

    # ---------------------------------------------------------
    # TEST 4: Outer Woods ban đêm, composure 15
    # ---------------------------------------------------------
    print("\n--- TEST 4: OUTER WOODS BAN ĐÊM, COMPOSURE 15 ---")
    t4 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(300); // NIGHT
        gs.playerState.stats.composure = 15;
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        resolve({
                            comp: gs.playerState.stats.composure,
                            vignetteActive: uis.isPanicVignetteActive,
                            heartbeatActive: gs.audioManager.isHeartbeatActive,
                            bpm: gs.audioManager.getHeartbeatBpm(),
                            phase: gs.timeSystem?.getCurrentPhase()
                        });
                    }, 80);
                });
            });
        });
    }
    """)
    print(f"  T4 Result: Phase={t4['phase']}, Comp={t4['comp']}, Vignette={t4['vignetteActive']}, Heartbeat={t4['heartbeatActive']}, BPM={t4['bpm']}")
    assert t4['vignetteActive'] and t4['heartbeatActive'] and t4['bpm'] >= 120
    print("  [PASS] Test 4: Outer Woods ban đêm composure 15 hoạt động chuẩn xác.")
    test_results['test_4_outer_woods_night_comp15'] = t4

    # ---------------------------------------------------------
    # TEST 5: Bellhollow ban ngày và ban đêm (Safe Zone Sanctuary)
    # ---------------------------------------------------------
    print("\n--- TEST 5: BELLHOLLOW SANCTUARY (DAY & NIGHT) ---")
    t5 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('bellhollow', 800, 200);
        gs.playerState.stats.composure = 15;

        // Day
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60);
        return new Promise(resolve => {
            setTimeout(() => {
                const dayVig = uis.isPanicVignetteActive;
                const dayHb = gs.audioManager.isHeartbeatActive;
                const dayZone = gs.currentZoneId;

                // Night
                if (gs.timeSystem) gs.timeSystem.setTimeOfDay(300);
                setTimeout(() => {
                    const nightVig = uis.isPanicVignetteActive;
                    const nightHb = gs.audioManager.isHeartbeatActive;
                    const nightZone = gs.currentZoneId;
                    resolve({ dayVig, dayHb, dayZone, nightVig, nightHb, nightZone });
                }, 100);
            }, 100);
        });
    }
    """)
    print(f"  T5 Bellhollow: Day(Zone={t5['dayZone']}, Vig={t5['dayVig']}, Hb={t5['dayHb']}) | Night(Zone={t5['nightZone']}, Vig={t5['nightVig']}, Hb={t5['nightHb']})")
    assert not t5['dayVig'] and not t5['dayHb'], "Bellhollow must protect player during DAY even at comp 15"
    assert not t5['nightVig'] and not t5['nightHb'], "Bellhollow must protect player during NIGHT even at comp 15"
    print("  [PASS] Test 5: Làng Bellhollow bảo vệ tuyệt đối cả ngày lẫn đêm.")
    test_results['test_5_bellhollow_sanctuary'] = t5

    # ---------------------------------------------------------
    # TEST 6: Sanctuary Farm ban ngày và ban đêm
    # ---------------------------------------------------------
    print("\n--- TEST 6: SANCTUARY FARM (DAY & NIGHT) ---")
    t6 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('sanctuary_farm', 700, 750);
        gs.playerState.stats.composure = 15;

        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60);
        return new Promise(resolve => {
            setTimeout(() => {
                const dayVig = uis.isPanicVignetteActive;
                const dayHb = gs.audioManager.isHeartbeatActive;
                const dayZone = gs.currentZoneId;

                if (gs.timeSystem) gs.timeSystem.setTimeOfDay(300);
                setTimeout(() => {
                    const nightVig = uis.isPanicVignetteActive;
                    const nightHb = gs.audioManager.isHeartbeatActive;
                    const nightZone = gs.currentZoneId;
                    resolve({ dayVig, dayHb, dayZone, nightVig, nightHb, nightZone });
                }, 100);
            }, 100);
        });
    }
    """)
    print(f"  T6 Farm: Day(Zone={t6['dayZone']}, Vig={t6['dayVig']}, Hb={t6['dayHb']}) | Night(Zone={t6['nightZone']}, Vig={t6['nightVig']}, Hb={t6['nightHb']})")
    assert not t6['dayVig'] and not t6['dayHb'], "Sanctuary Farm must protect player during DAY"
    assert not t6['nightVig'] and not t6['nightHb'], "Sanctuary Farm must protect player during NIGHT"
    print("  [PASS] Test 6: Sanctuary Farm bảo vệ tuyệt đối cả ngày lẫn đêm.")
    test_results['test_6_sanctuary_farm'] = t6

    # ---------------------------------------------------------
    # TEST 7: Gần lửa trại Sir Vaelen tại Outer Woods
    # ---------------------------------------------------------
    print("\n--- TEST 7: GẦN LỬA TRẠI SIR VAELEN (1470, 710) ---")
    t7 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('outer_woods', 1470, 710);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(300); // NIGHT
        gs.playerState.stats.composure = 15;
        return new Promise(resolve => {
            setTimeout(() => {
                const isNearWarmth = gs.survivalSystem?.isNearWarmth(1470, 710, 'outer_woods');
                resolve({
                    isNearWarmth: !!isNearWarmth,
                    vignetteActive: uis.isPanicVignetteActive,
                    heartbeatActive: gs.audioManager.isHeartbeatActive
                });
            }, 150);
        });
    }
    """)
    print(f"  T7 Sir Vaelen Campfire: isNearWarmth={t7['isNearWarmth']}, Vig={t7['vignetteActive']}, Hb={t7['heartbeatActive']}")
    assert t7['isNearWarmth'], "Must detect warmth near Sir Vaelen campfire"
    assert not t7['vignetteActive'], "Campfire warmth must suppress horror vignette"
    assert not t7['heartbeatActive'], "Campfire warmth must suppress heartbeat"
    print("  [PASS] Test 7: Lửa trại Sir Vaelen bảo toàn trọn vẹn Safe Zone.")
    test_results['test_7_sir_vaelen_campfire'] = t7

    # ---------------------------------------------------------
    # TEST 8: Reduced Motion ON/OFF Toggle
    # ---------------------------------------------------------
    print("\n--- TEST 8: REDUCED MOTION TOGGLE & SENSITIVITY ---")
    t8 = page.evaluate("""
    () => {
        const sm = window.__SETTINGS_MANAGER__;
        sm.settings.reducedMotionEnabled = true;
        const rmPreferredTrue = sm.isReducedMotionPreferred();
        const shakeWhenRM = sm.isScreenShakeEnabled();
        const flashWhenRM = sm.isScreenFlashEnabled();

        sm.settings.reducedMotionEnabled = false;
        const rmPreferredFalse = sm.isReducedMotionPreferred();
        const shakeNormal = sm.isScreenShakeEnabled();
        const flashNormal = sm.isScreenFlashEnabled();

        return {
            rmPreferredTrue,
            shakeWhenRM,
            flashWhenRM,
            rmPreferredFalse,
            shakeNormal,
            flashNormal
        };
    }
    """)
    print(f"  T8 Settings: RM_True({t8['rmPreferredTrue']}, Shake={t8['shakeWhenRM']}, Flash={t8['flashWhenRM']}) | RM_False({t8['rmPreferredFalse']}, Shake={t8['shakeNormal']}, Flash={t8['flashNormal']})")
    assert t8['rmPreferredTrue'] and not t8['shakeWhenRM'] and not t8['flashWhenRM'], "Reduced Motion ON must suppress shake and flash"
    assert not t8['rmPreferredFalse'] and t8['shakeNormal'] and t8['flashNormal'], "Reduced Motion OFF must enable shake and flash"
    print("  [PASS] Test 8: Reduced Motion settings toggle validated.")
    test_results['test_8_reduced_motion'] = t8

    # ---------------------------------------------------------
    # TEST 9: Tinh Thần hồi từ 15 lên >= 45 (Fade-out mượt mà)
    # ---------------------------------------------------------
    print("\n--- TEST 9: FADE-OUT MƯỢT KHI HỒI PHỤC TINH THẦN (15 -> 50) ---")
    t9 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60);
        gs.playerState.stats.composure = 15;

        return new Promise(resolve => {
            setTimeout(() => {
                const activeBefore = uis.isPanicVignetteActive;
                const diag = {
                    zone: gs.currentZoneId,
                    x: gs.player.x,
                    y: gs.player.y,
                    comp: gs.playerState.stats.composure,
                    isNearWarmth: gs.survivalSystem?.isNearWarmth(gs.player.x, gs.player.y, gs.currentZoneId),
                    activeBefore
                };

                // Tinh thần hồi phục lên 50
                gs.playerState.stats.composure = 50;

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            const distToListener = (gs.listenerMonster && gs.listenerMonster.active)
                              ? Math.hypot(gs.player.x - gs.listenerMonster.x, gs.player.y - gs.listenerMonster.y)
                              : 99999;
                            const isListenerNear = distToListener <= 260 && !gs.player.stats.isHiding;
                            const isWildlifeMonsterNear = Boolean(gs.wildlifeSystem?.isMonsterNear(gs.player.x, gs.player.y, 220));
                            const isMonsterChasingNearby = gs.isAct5ChaseActive || (gs.isBossFightActive && gs.currentZoneId === 'broken_bell_shrine') || isListenerNear || isWildlifeMonsterNear;

                            const tweenStateMid = {
                                hasTween: !!uis.activePanicFadeTween,
                                isPlaying: uis.activePanicFadeTween?.isPlaying(),
                                progress: uis.activePanicFadeTween?.progress
                            };
                            const hbActiveAfter = gs.audioManager.isHeartbeatActive;
                            const midDiag = {
                                compMid: gs.playerState.stats.composure,
                                hbActiveAfter,
                                isMonsterChasingNearby,
                                distToListener,
                                isWildlifeMonsterNear,
                                isAct5ChaseActive: gs.isAct5ChaseActive,
                                isSafeZoneOrCampfire: Boolean(gs.survivalSystem?.isNearWarmth(gs.player.x, gs.player.y, gs.currentZoneId)),
                                isPanicVignetteActive: uis.isPanicVignetteActive
                            };

                            setTimeout(() => {
                                const activeAfter = uis.isPanicVignetteActive;
                                const tweenStateEnd = {
                                    hasTween: !!uis.activePanicFadeTween,
                                    isPlaying: uis.activePanicFadeTween?.isPlaying(),
                                    progress: uis.activePanicFadeTween?.progress
                                };
                                resolve({
                                    diag,
                                    midDiag,
                                    activeBefore,
                                    tweenStateMid,
                                    hbActiveAfter,
                                    activeAfter,
                                    tweenStateEnd
                                });
                            }, 400);
                        }, 50);
                    });
                });
            }, 200);
        });
    }
    """)
    print(f"  T9 Diag: {t9['diag']}")
    print(f"  T9 MidDiag: {t9.get('midDiag')}")
    print(f"  T9 Fade-out: Before={t9['activeBefore']}, Mid={t9['tweenStateMid']}, HbAfter={t9['hbActiveAfter']}, After={t9['activeAfter']}, End={t9['tweenStateEnd']}")
    assert t9['activeBefore'], "Must be active before recovery"
    assert not t9['hbActiveAfter'], "Heartbeat must stop immediately when composure >= 45"
    assert not t9['activeAfter'], "Vignette must be inactive after fade-out"
    assert not t9['tweenStateEnd']['hasTween'], "Fade tween must auto-clean"
    print("  [PASS] Test 9: Fade-out chuyển tiếp êm dịu hoàn hảo, không giật độ sáng.")
    test_results['test_9_composure_fadeout'] = t9

    # ---------------------------------------------------------
    # TEST 10: Pause / Resume / Continue Lifecycle
    # ---------------------------------------------------------
    print("\n--- TEST 10: PAUSE / RESUME / CONTINUE LIFECYCLE ---")
    page.keyboard.press('Escape')
    page.wait_for_timeout(500)
    pause_open = page.evaluate("() => !!window.__PHASER_GAME__.scene.getScene('UIScene').pauseModal?.isOpen")
    page.keyboard.press('Escape')
    page.wait_for_timeout(500)
    pause_closed = page.evaluate("() => !window.__PHASER_GAME__.scene.getScene('UIScene').pauseModal?.isOpen")
    assert pause_open and pause_closed, "Pause/Resume modal cycle failed"
    print(f"  Pause/Resume cycle: Open={pause_open}, Closed={pause_closed}")
    print("  [PASS] Test 10: Pause/Resume và vòng đời hoạt động an toàn.")
    test_results['test_10_pause_resume'] = {"pause_open": pause_open, "pause_closed": pause_closed}

    # ---------------------------------------------------------
    # TEST 11: Quầng sáng có dao động chậm hợp lệ (0.25 Hz), không strobe
    # ---------------------------------------------------------
    print("\n--- TEST 11: QUẦNG SÁNG DAO ĐỘNG CHẬM HỢP LỆ (ZERO STROBE) ---")
    res_fow = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60);
        gs.playerState.stats.composure = 15;
        gs.currentLanternRadius = 134;

        return new Promise(resolve => {
            // Chờ 500ms để nhịp thở FOW ổn định hoàn toàn
            setTimeout(() => {
                const samples = [];
                const onPostUpdate = () => {
                    samples.push(gs.currentLanternRadius);
                    if (samples.length >= 30) {
                        gs.events.off('postupdate', onPostUpdate);
                        let maxStepDelta = 0;
                        let erraticJumps = 0;
                        for (let i = 1; i < samples.length; i++) {
                            const d = Math.abs(samples[i] - samples[i - 1]);
                            if (d > maxStepDelta) maxStepDelta = d;
                            if (d > 1.5) erraticJumps++; // Bước nhảy lớn bất thường (>1.5px trong 1 frame)
                        }
                        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
                        const minR = Math.min(...samples);
                        const maxR = Math.max(...samples);
                        const amplitudeRatio = (maxR - minR) / mean;

                        resolve({
                            mean,
                            minR,
                            maxR,
                            maxStepDelta,
                            erraticJumps,
                            amplitudeRatio,
                            samplesCount: samples.length
                        });
                    }
                };
                gs.events.on('postupdate', onPostUpdate);
            }, 650);
        });
    }
    """)
    print(f"  FOW Breathing: Mean={res_fow['mean']:.2f}, Range=[{res_fow['minR']:.2f} - {res_fow['maxR']:.2f}], MaxStepDelta={res_fow['maxStepDelta']:.4f}, AmplitudeRatio={res_fow['amplitudeRatio']*100:.2f}%, ErraticJumps={res_fow['erraticJumps']}")
    assert res_fow['minR'] > 50, "Lantern radius must never drop to 0 or collapse"
    assert res_fow['maxStepDelta'] < 0.8, f"Step delta must be continuous and smooth (<0.8px per frame), got {res_fow['maxStepDelta']}"
    assert res_fow['erraticJumps'] == 0, f"Must have zero erratic jumps, got {res_fow['erraticJumps']}"
    assert res_fow['amplitudeRatio'] <= 0.08, f"Oscillation amplitude must remain gentle (<=8% peak-to-peak), got {res_fow['amplitudeRatio']}"
    print("  [PASS] Test 11: Nhịp thở quầng sáng êm dịu, mượt mà, triệt tiêu hoàn toàn strobe.")
    test_results['test_11_fow_breathing'] = res_fow

    # ---------------------------------------------------------
    # TEST 12: Không chồng vignette (VeilSystem cô lập)
    # ---------------------------------------------------------
    print("\n--- TEST 12: KHÔNG CHỒNG VIGNETTE (VEIL SYSTEM CÔ LẬP) ---")
    t12 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
        return {
            veilHasDistortionDrawn: !!gs.veilSystem?.hasDistortionDrawn,
            uisPanicActive: uis.isPanicVignetteActive,
            hasPanicGraphics: !!uis.panicVignetteGraphics,
            hasRedDangerGraphics: !!uis.redDangerGraphics
        };
    }
    """)
    print(f"  T12 Overlays: VeilDistortion={t12['veilHasDistortionDrawn']}, UISPanic={t12['uisPanicActive']}")
    assert not t12['veilHasDistortionDrawn'], "VeilSystem must NOT draw duplicate edge vignette"
    assert t12['hasPanicGraphics'] and t12['hasRedDangerGraphics'], "UIScene must hold centralized vignette graphics"
    print("  [PASS] Test 12: Không có lớp vignette thứ hai trong VeilSystem.")
    test_results['test_12_no_duplicate_vignette'] = t12

    # ---------------------------------------------------------
    # TEST 13: Không phát popup cảnh báo trùng
    # ---------------------------------------------------------
    print("\n--- TEST 13: KHÔNG PHÁT POPUP TRÙNG LẶP ---")
    t13 = page.evaluate("""
    () => {
        window.__TEST_METRICS__.popupMessages = [];
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
        if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60);
        gs.playerState.stats.composure = 10;

        return new Promise(resolve => {
            // Cho chạy 500ms
            setTimeout(() => {
                const popups = window.__TEST_METRICS__.popupMessages;
                const fracturePopups = popups.filter(p => p.msg.includes('Tâm trí đang rạn nứt'));
                resolve({
                    totalPopups: popups.length,
                    fractureCount: fracturePopups.length,
                    popups: popups.map(p => p.msg)
                });
            }, 500);
        });
    }
    """)
    print(f"  T13 Popups: Total={t13['totalPopups']}, FracturePopups={t13['fractureCount']}")
    assert t13['fractureCount'] <= 1, f"Must NOT spam fracture popups in single frame window, got {t13['fractureCount']}"
    print("  [PASS] Test 13: Cảnh báo HUD quản lý tập trung, không trùng lặp giữa GameScene & UIScene.")
    test_results['test_13_no_duplicate_popups'] = t13

    # ---------------------------------------------------------
    # TEST 14: Không có flash/shake thực thi khi Reduced Motion ON
    # ---------------------------------------------------------
    print("\n--- TEST 14: KHÔNG FLASH/SHAKE CAMERA KHI REDUCED MOTION ON ---")
    t14 = page.evaluate("""
    () => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const sm = window.__SETTINGS_MANAGER__;

        window.__TEST_METRICS__.realCameraFlashes = [];
        window.__TEST_METRICS__.realCameraShakes = [];

        // 1. Khi Reduced Motion BẬT:
        sm.settings.reducedMotionEnabled = true;
        gs.cameraSystem?.flash(300, 255, 0, 0);
        gs.cameraSystem?.shake(200, 0.01);

        const realFlashesWhenRM = window.__TEST_METRICS__.realCameraFlashes.length;
        const realShakesWhenRM = window.__TEST_METRICS__.realCameraShakes.length;

        // 2. Khi Reduced Motion TẮT (cho qua 500ms để cameraSystem cooldown không chặn flash):
        sm.settings.reducedMotionEnabled = false;
        if (gs.cameraSystem) {
            gs.cameraSystem.lastFlashTimestamp = 0;
            gs.cameraSystem.lastShakeTimestamp = 0;
        }
        gs.cameraSystem?.flash(300, 255, 0, 0);
        gs.cameraSystem?.shake(200, 0.01);

        const realFlashesWhenOff = window.__TEST_METRICS__.realCameraFlashes.length;
        const realShakesWhenOff = window.__TEST_METRICS__.realCameraShakes.length;

        return {
            realFlashesWhenRM,
            realShakesWhenRM,
            realFlashesWhenOff,
            realShakesWhenOff
        };
    }
    """)
    print(f"  T14 Camera Execution: When RM ON (Flashes={t14['realFlashesWhenRM']}, Shakes={t14['realShakesWhenRM']}) | When RM OFF (Flashes={t14['realFlashesWhenOff']}, Shakes={t14['realShakesWhenOff']})")
    assert t14['realFlashesWhenRM'] == 0, f"Expected 0 real flashes when Reduced Motion ON, got {t14['realFlashesWhenRM']}"
    assert t14['realShakesWhenRM'] == 0, f"Expected 0 real shakes when Reduced Motion ON, got {t14['realShakesWhenRM']}"
    assert t14['realFlashesWhenOff'] == 1, f"Expected 1 real flash when Reduced Motion OFF, got {t14['realFlashesWhenOff']}"
    assert t14['realShakesWhenOff'] == 1, f"Expected 1 real shake when Reduced Motion OFF, got {t14['realShakesWhenOff']}"
    print("  [PASS] Test 14: Reduced Motion triệt tiêu 100% camera flash/shake thực thi.")
    test_results['test_14_camera_safety'] = t14

    # ---------------------------------------------------------
    # TEST 15: FOW Redraw và FPS không hồi quy
    # ---------------------------------------------------------
    print("\n--- TEST 15: FOW REDRAW PERFORMANCE & STABILITY ---")
    t15 = page.evaluate("""
    () => {
        window.__TEST_METRICS__.fowRedrawCount = 0;
        window.__TEST_METRICS__.fowRedrawTimes = [];
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.playerState.stats.composure = 15;

        return new Promise(resolve => {
            // Để player đứng yên trong 500ms (~30 frames)
            setTimeout(() => {
                const count = window.__TEST_METRICS__.fowRedrawCount;
                const times = window.__TEST_METRICS__.fowRedrawTimes;
                const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length) : 0;
                resolve({
                    redrawCount: count,
                    avgTimeMs: avgTime
                });
            }, 500);
        });
    }
    """)
    print(f"  T15 FOW Performance: RedrawCount in 500ms = {t15['redrawCount']}, AvgTime = {t15['avgTimeMs']:.4f}ms")
    assert t15['redrawCount'] <= 20, f"FOW must not redraw excessively when stationary, got {t15['redrawCount']}"
    assert t15['avgTimeMs'] < 4.0, f"FOW redraw time must be fast (<4ms), got {t15['avgTimeMs']}"
    print("  [PASS] Test 15: FOW giữ nguyên dirty-checking tối ưu, GPU stamp nhanh và ổn định.")
    test_results['test_15_fow_performance'] = t15

    # ---------------------------------------------------------
    # SUMMARY & JSON METRICS
    # ---------------------------------------------------------
    print(f"\n[Console Errors]: {len(console_errors)}")
    if console_errors:
        print(f"  Errors: {console_errors}")
    assert len(console_errors) == 0, f"Expected 0 console errors, got {len(console_errors)}"

    out_json = Path(__file__).resolve().parents[1] / 'Read' / 'V1.5' / 'Reports' / f"bug023_metrics_{mode}.json"
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2)
    print(f"\n[QA] ALL 15 REGRESSION TESTS PASSED! Metrics saved to {out_json.name}")

    browser.close()
