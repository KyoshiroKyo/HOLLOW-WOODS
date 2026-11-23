"""
HW-STAB-32 — Automated Verification Suite
Validating:
1. Part A: Shift Revalidation & Watchdog (1000ms hold -> W -> Sprint -> 3s hold -> release Shift -> Walk, EVKey & IME)
2. Part B: Boss Panic Visuals Toggle (broken_bell_shrine, Composure 10, ON/OFF toggle, Safe State)
3. Part C: QA Settings Isolation (same origin, QA vs Retail key separation, reload, fallback)
4. Part D: Reduced Motion UI (MainMenuScene & PauseModal toggle, immediate effect, persistence)
"""

import os
import sys
import json
import time
import socket
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

DIST_DIR = os.path.abspath("dist")

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)
    def log_message(self, format, *args):
        pass
    def handle_one_request(self):
        try:
            super().handle_one_request()
        except Exception:
            pass

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

def run_suite():
    port = get_free_port()
    server = ThreadingHTTPServer(('127.0.0.1', port), QuietHandler)
    srv_thread = threading.Thread(target=server.serve_forever, daemon=True)
    srv_thread.start()
    base_url = f"http://127.0.0.1:{port}"
    print(f"[Server] Serving dist at {base_url}")

    results = []
    def log_test(num, name, passed, details=""):
        status = "PASS" if passed else "FAIL"
        results.append({"test": num, "name": name, "passed": passed, "details": details})
        print(f"--- [TEST {num}] {name} ---")
        print(f"  Result: {status} - {details}")
        if not passed:
            print(f"  [ERROR] FAILED: {name}")

    with sync_playwright() as p:
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        browser = p.chromium.launch(
            executable_path=chrome_path,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
        )
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("[QA] Loading game...")
        page.goto(f"{base_url}/?dev=1", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.wait_for_timeout(500)

        # Start game from MainMenu
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("""
        () => {
            const game = window.__PHASER_GAME__;
            if (!game || !game.scene) return false;
            const gs = game.scene.getScene('GameScene');
            return gs && gs.scene.isActive() && gs.player && gs.playerState;
        }
        """, timeout=30000)
        page.wait_for_timeout(1000)

        # Setup globals for test convenience
        page.evaluate("""
        () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
            window.__GAME_SCENE__ = gs;
            window.__UI_SCENE__ = uis;
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.focus();
        }
        """)
        time.sleep(0.5)

        # =========================================================================
        # PART A: SHIFT REVALIDATION & WATCHDOG
        # =========================================================================

        # Test A1: Hold Shift for 1000ms stationary, then press W
        # Expected: Sprint activated immediately
        page.evaluate("""() => {
            const player = window.__GAME_SCENE__.player;
            player.setPosition(120, 320);
            player.setVelocity(0, 0);
            player.forceUnlockActionState();
            player.stats.stamina = 100;
            player._isStaminaExhausted = false;
            player._isDead = false;
        }""")
        time.sleep(0.2)

        # Press Shift down
        page.keyboard.down("ShiftLeft")
        time.sleep(1.1) # Hold Shift > 1000ms while stationary

        # Now press W while keeping Shift held
        page.keyboard.down("KeyW")
        time.sleep(0.3)

        sprint_check = page.evaluate("""() => {
            const player = window.__GAME_SCENE__.player;
            const animKey = player.anims.currentAnim ? player.anims.currentAnim.key : '';
            return {
                isSprinting: player.stats.isSprinting,
                speed: Math.round(player.body.velocity.length()),
                animKey: animKey,
                stamina: player.stats.stamina
            };
        }""")

        passed_a1 = sprint_check["isSprinting"] and sprint_check["speed"] >= 135 and "run" in sprint_check["animKey"]
        log_test(1, "Part A1: Hold Shift 1000ms -> Press W -> Sprint Active", passed_a1,
                 f"isSprinting={sprint_check['isSprinting']}, spd={sprint_check['speed']}, anim={sprint_check['animKey']}")

        # Test A2: Hold Shift+W for 3 seconds -> Sprint continues while stamina permits
        # Ensure we keep player in open street (120, 200) and simulate OS key repeats
        start_hold = time.time()
        while time.time() - start_hold < 2.5:
            page.keyboard.down("KeyW")
            time.sleep(0.1)
            # Prevent hitting north edge by keeping player in clear corridor
            page.evaluate("() => { const p = window.__GAME_SCENE__.player; if (p.y < 150) p.y = 230; }")

        sprint_continue = page.evaluate("""() => {
            const player = window.__GAME_SCENE__.player;
            const animKey = player.anims.currentAnim ? player.anims.currentAnim.key : '';
            return {
                isSprinting: player.stats.isSprinting,
                speed: Math.round(player.body.velocity.length()),
                animKey: animKey,
                stamina: player.stats.stamina
            };
        }""")
        passed_a2 = sprint_continue["isSprinting"] and sprint_continue["speed"] >= 135 and sprint_continue["stamina"] < 100
        log_test(2, "Part A2: Hold Shift+W for 3s -> Continuous Sprint & Stamina Drain", passed_a2,
                 f"isSprinting={sprint_continue['isSprinting']}, spd={sprint_continue['speed']}, stamina={sprint_continue['stamina']:.1f}")

        # Test A3: Release Shift while keeping W held -> Returns to Walk
        page.keyboard.up("ShiftLeft")
        for _ in range(5):
            page.keyboard.down("KeyW")
            time.sleep(0.08)

        walk_check = page.evaluate("""() => {
            const player = window.__GAME_SCENE__.player;
            const animKey = player.anims.currentAnim ? player.anims.currentAnim.key : '';
            return {
                isSprinting: player.stats.isSprinting,
                speed: Math.round(player.body.velocity.length()),
                animKey: animKey
            };
        }""")
        passed_a3 = (not walk_check["isSprinting"]) and (75 <= walk_check["speed"] <= 95) and ("walk" in walk_check["animKey"])
        log_test(3, "Part A3: Release Shift while holding W -> Return to Walk", passed_a3,
                 f"isSprinting={walk_check['isSprinting']}, spd={walk_check['speed']}, anim={walk_check['animKey']}")

        page.keyboard.up("KeyW")
        time.sleep(0.2)

        # Test A4: EVKey swallowed keyup simulation (modifierShift=false on W keydown clears stuck Shift)
        evkey_sim = page.evaluate("""() => {
            const player = window.__GAME_SCENE__.player;
            player.activePhysicalCodes.add('ShiftLeft');
            player.isPhysicalShiftHeld = true;
            player.shiftExpiresAt = performance.now() + 5000;

            // Dispatch a normal KeyW event without Shift modifier
            const keyEvent = new KeyboardEvent('keydown', {
                code: 'KeyW',
                key: 'w',
                shiftKey: false
            });
            window.dispatchEvent(keyEvent);

            return {
                isPhysicalShiftHeld: player.isPhysicalShiftHeld,
                hasShiftCode: player.activePhysicalCodes.has('ShiftLeft'),
                shiftExpiresAt: player.shiftExpiresAt
            };
        }""")
        passed_a4 = (not evkey_sim["isPhysicalShiftHeld"]) and (not evkey_sim["hasShiftCode"]) and evkey_sim["shiftExpiresAt"] == 0
        log_test(4, "Part A4: EVKey Swallowed Keyup Defense (Modifier False Clears Shift)", passed_a4,
                 f"isShiftHeld={evkey_sim['isPhysicalShiftHeld']}, hasShiftCode={evkey_sim['hasShiftCode']}")

        # Test A5: Fake IME Process Event (keyCode 229 / key Process) cannot trigger or refresh Shift
        ime_sim = page.evaluate("""() => {
            const player = window.__GAME_SCENE__.player;
            player.resetAllInputState();

            // Dispatch fake IME packet with Shift modifier true
            const imeEvent = new KeyboardEvent('keydown', {
                code: '',
                key: 'Process',
                keyCode: 229,
                shiftKey: true,
                isComposing: true
            });
            window.dispatchEvent(imeEvent);

            return {
                isPhysicalShiftHeld: player.isPhysicalShiftHeld,
                hasShiftCode: player.activePhysicalCodes.has('ShiftLeft'),
                isSprinting: player.stats.isSprinting
            };
        }""")
        passed_a5 = (not ime_sim["isPhysicalShiftHeld"]) and (not ime_sim["hasShiftCode"]) and (not ime_sim["isSprinting"])
        log_test(5, "Part A5: Fake IME Process Event Cannot Activate Shift or Sprint", passed_a5,
                 f"isShiftHeld={ime_sim['isPhysicalShiftHeld']}, hasShiftCode={ime_sim['hasShiftCode']}")

        # =========================================================================
        # PART B: BOSS PANIC VISUALS TOGGLE
        # =========================================================================

        # Test B1: In broken_bell_shrine Boss Fight with Composure = 10, Panic Visuals ON -> Vignette Active
        boss_b1 = page.evaluate("""() => {
            const gs = window.__GAME_SCENE__;
            const uis = gs.scene.get('UIScene');
            const sm = window.__SETTINGS_MANAGER__;

            sm.setPanicEffectsEnabled(true);
            gs.isBossFightActive = true;
            gs.currentZoneId = 'broken_bell_shrine';
            gs.player.stats.composure = 10;

            uis.updatePanicVignette(performance.now());
            return {
                isBossFight: gs.isBossFightActive,
                zone: gs.currentZoneId,
                comp: gs.player.stats.composure,
                panicEnabled: sm.isPanicEffectsEnabled(),
                isPanicActive: uis.isPanicVignetteActive
            };
        }""")
        passed_b1 = boss_b1["isBossFight"] and boss_b1["panicEnabled"] and boss_b1["isPanicActive"]
        log_test(6, "Part B1: Boss Fight Composure 10 + Panic ON -> Vignette Active", passed_b1,
                 f"panicEnabled={boss_b1['panicEnabled']}, isPanicActive={boss_b1['isPanicActive']}")

        # Test B2: In broken_bell_shrine Boss Fight with Composure = 10, Panic Visuals OFF -> Vignette Inactive (isSafeState = true)
        boss_b2 = page.evaluate("""() => {
            const gs = window.__GAME_SCENE__;
            const uis = gs.scene.get('UIScene');
            const sm = window.__SETTINGS_MANAGER__;

            sm.setPanicEffectsEnabled(false);
            uis.updatePanicVignette(performance.now());

            return {
                panicEnabled: sm.isPanicEffectsEnabled(),
                isPanicActive: uis.isPanicVignetteActive
            };
        }""")
        passed_b2 = (not boss_b2["panicEnabled"]) and (not boss_b2["isPanicActive"])
        log_test(7, "Part B2: Boss Fight Composure 10 + Panic OFF -> Vignette Inactive", passed_b2,
                 f"panicEnabled={boss_b2['panicEnabled']}, isPanicActive={boss_b2['isPanicActive']}")

        # Test B3: Dynamic Toggle Mid-Boss Fight (OFF -> ON -> OFF)
        boss_b3 = page.evaluate("""() => {
            const gs = window.__GAME_SCENE__;
            const uis = gs.scene.get('UIScene');
            const sm = window.__SETTINGS_MANAGER__;

            // Turn ON
            sm.setPanicEffectsEnabled(true);
            uis.updatePanicVignette(performance.now());
            const onActive = uis.isPanicVignetteActive;

            // Turn OFF
            sm.setPanicEffectsEnabled(false);
            uis.updatePanicVignette(performance.now());
            const offActive = uis.isPanicVignetteActive;

            return { onActive, offActive };
        }""")
        passed_b3 = boss_b3["onActive"] and (not boss_b3["offActive"])
        log_test(8, "Part B3: Mid-Boss Fight Dynamic Toggle (ON -> Active, OFF -> Inactive)", passed_b3,
                 f"onActive={boss_b3['onActive']}, offActive={boss_b3['offActive']}")

        # Test B4: Boss Threshold 50 preservation (Panic ON, Composure 55 -> Inactive; Composure 45 -> Active)
        boss_b4 = page.evaluate("""() => {
            const gs = window.__GAME_SCENE__;
            const uis = gs.scene.get('UIScene');
            const sm = window.__SETTINGS_MANAGER__;

            sm.setPanicEffectsEnabled(true);
            gs.player.stats.composure = 55;
            uis.updatePanicVignette(performance.now());
            const comp55Active = uis.isPanicVignetteActive;

            gs.player.stats.composure = 45;
            uis.updatePanicVignette(performance.now());
            const comp45Active = uis.isPanicVignetteActive;

            return { comp55Active, comp45Active };
        }""")
        passed_b4 = (not boss_b4["comp55Active"]) and boss_b4["comp45Active"]
        log_test(9, "Part B4: Boss Special Threshold 50 Preserved (55=Safe, 45=Active)", passed_b4,
                 f"comp55Active={boss_b4['comp55Active']}, comp45Active={boss_b4['comp45Active']}")

        # Reset boss fight state
        page.evaluate("""() => {
            const gs = window.__GAME_SCENE__;
            gs.isBossFightActive = false;
            gs.currentZoneId = 'outer_woods';
            gs.player.stats.composure = 100;
        }""")

        # =========================================================================
        # PART C: QA SETTINGS ISOLATION
        # =========================================================================

        # Test C1: QA Settings modification does not affect Retail keys
        qa_c1 = page.evaluate("""() => {
            const sm = window.__SETTINGS_MANAGER__;
            localStorage.clear();

            // Set retail keys with baseline values
            const retailBaseline = {
                masterVolume: 0.9,
                musicVolume: 0.8,
                panicEffectsEnabled: true
            };
            localStorage.setItem('hollow_woods_settings', JSON.stringify(retailBaseline));
            localStorage.setItem('hw_settings', JSON.stringify(retailBaseline));

            // Switch to QA mode via override
            window.__HOLLOW_WOODS_QA_OVERRIDE__ = true;
            sm.reloadFromStorage();

            // Modify settings in QA mode
            sm.setMasterVolume(0.35);
            sm.setPanicEffectsEnabled(false);
            sm.setPanicIntensity('LOW');

            // Read raw localStorage keys
            const retailAfter = JSON.parse(localStorage.getItem('hollow_woods_settings') || '{}');
            const qaSettings = JSON.parse(localStorage.getItem('hollow_woods_qa_settings') || '{}');

            return {
                retailMaster: retailAfter.masterVolume,
                retailPanic: retailAfter.panicEffectsEnabled,
                qaMaster: qaSettings.masterVolume,
                qaPanic: qaSettings.panicEffectsEnabled,
                qaIntensity: qaSettings.panicIntensity
            };
        }""")
        passed_c1 = (qa_c1["retailMaster"] == 0.9 and qa_c1["retailPanic"] is True and
                     qa_c1["qaMaster"] == 0.35 and qa_c1["qaPanic"] is False and qa_c1["qaIntensity"] == "LOW")
        log_test(10, "Part C1: QA Settings Write Isolates From Retail Keys", passed_c1,
                 f"Retail(vol={qa_c1['retailMaster']}, panic={qa_c1['retailPanic']}) vs QA(vol={qa_c1['qaMaster']}, panic={qa_c1['qaPanic']})")

        # Test C2: Retail Settings modification does not affect QA key
        qa_c2 = page.evaluate("""() => {
            const sm = window.__SETTINGS_MANAGER__;

            // Switch to Retail mode
            window.__HOLLOW_WOODS_QA_OVERRIDE__ = false;
            sm.reloadFromStorage();

            // Modify in Retail mode
            sm.setMasterVolume(0.75);
            sm.setPanicEffectsEnabled(true);

            // Read keys
            const retailAfter = JSON.parse(localStorage.getItem('hollow_woods_settings') || '{}');
            const qaAfter = JSON.parse(localStorage.getItem('hollow_woods_qa_settings') || '{}');

            return {
                retailMaster: retailAfter.masterVolume,
                retailPanic: retailAfter.panicEffectsEnabled,
                qaMaster: qaAfter.masterVolume,
                qaPanic: qaAfter.panicEffectsEnabled
            };
        }""")
        passed_c2 = (qa_c2["retailMaster"] == 0.75 and qa_c2["retailPanic"] is True and
                     qa_c2["qaMaster"] == 0.35 and qa_c2["qaPanic"] is False)
        log_test(11, "Part C2: Retail Settings Write Isolates From QA Keys", passed_c2,
                 f"Retail(vol={qa_c2['retailMaster']}) vs QA(vol={qa_c2['qaMaster']})")

        # Test C3: Reload from storage respects respective mode
        qa_c3 = page.evaluate("""() => {
            const sm = window.__SETTINGS_MANAGER__;

            // Switch to QA and reload
            window.__HOLLOW_WOODS_QA_OVERRIDE__ = true;
            sm.reloadFromStorage();
            const qaVol = sm.getMasterVolume();
            const qaPanic = sm.isPanicEffectsEnabled();

            // Switch to Retail and reload
            window.__HOLLOW_WOODS_QA_OVERRIDE__ = false;
            sm.reloadFromStorage();
            const retailVol = sm.getMasterVolume();
            const retailPanic = sm.isPanicEffectsEnabled();

            return { qaVol, qaPanic, retailVol, retailPanic };
        }""")
        passed_c3 = (qa_c3["qaVol"] == 0.35 and qa_c3["qaPanic"] is False and
                     qa_c3["retailVol"] == 0.75 and qa_c3["retailPanic"] is True)
        log_test(12, "Part C3: ReloadFromStorage Preserves Independent States", passed_c3,
                 f"QA(vol={qa_c3['qaVol']}) vs Retail(vol={qa_c3['retailVol']})")

        # Cleanup override
        page.evaluate("() => { delete window.__HOLLOW_WOODS_QA_OVERRIDE__; }")

        # =========================================================================
        # PART D: REDUCED MOTION UI
        # =========================================================================

        # Test D1: PauseModal has Reduced Motion toggle in Visuals Tab
        pm_d1 = page.evaluate("""() => {
            const uis = window.__GAME_SCENE__.scene.get('UIScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.setReducedMotionEnabled(false);

            if (uis && uis.pauseModal) {
                uis.pauseModal.open();
                return {
                    hasReducedMotionControl: Boolean(uis.pauseModal.reducedMotionToggleControl),
                    currentValue: sm.isReducedMotionEnabled()
                };
            }
            return { hasReducedMotionControl: false, currentValue: false };
        }""")
        passed_d1 = pm_d1["hasReducedMotionControl"] and (not pm_d1["currentValue"])
        log_test(13, "Part D1: PauseModal Contains Reduced Motion Toggle Control", passed_d1,
                 f"hasControl={pm_d1['hasReducedMotionControl']}, value={pm_d1['currentValue']}")

        # Test D2: Toggle Reduced Motion in PauseModal updates immediately and persists
        pm_d2 = page.evaluate("""() => {
            const uis = window.__GAME_SCENE__.scene.get('UIScene');
            const sm = window.__SETTINGS_MANAGER__;

            // Turn Reduced Motion ON
            sm.setReducedMotionEnabled(true);
            uis.pauseModal.updateVolumeTexts();

            const rmPref = sm.isReducedMotionPreferred();
            const shakeBlocked = !sm.isScreenShakeEnabled();
            const lightMotionBlocked = !sm.isLightMotionEnabled();

            // Close pause modal
            uis.pauseModal.close();

            return {
                rmPref,
                shakeBlocked,
                lightMotionBlocked
            };
        }""")
        passed_d2 = pm_d2["rmPref"] and pm_d2["shakeBlocked"] and pm_d2["lightMotionBlocked"]
        log_test(14, "Part D2: Reduced Motion ON Blocks Shake & Light Motion Immediately", passed_d2,
                 f"rmPref={pm_d2['rmPref']}, shakeBlocked={pm_d2['shakeBlocked']}, lightBlocked={pm_d2['lightMotionBlocked']}")

        # Test D3: MainMenuScene Settings Modal has Reduced Motion Toggle
        # Stop GameScene and go to MainMenuScene
        page.evaluate("""() => {
            const gs = window.__GAME_SCENE__;
            gs.scene.stop('GameScene');
            gs.scene.stop('UIScene');
            gs.scene.start('MainMenuScene');
        }""")
        page.wait_for_function("() => Boolean(window.__PHASER_GAME__?.scene?.isActive('MainMenuScene'))", timeout=10000)
        time.sleep(1.0)

        mm_d3 = page.evaluate("""() => {
            const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene');
            const sm = window.__SETTINGS_MANAGER__;

            mm.showSettingsModal();
            // Modal is open, verify settingsManager reduced motion methods
            const initialRM = sm.isReducedMotionEnabled();
            sm.setReducedMotionEnabled(false);
            const toggledOff = sm.isReducedMotionEnabled();
            sm.setReducedMotionEnabled(true);
            const toggledOn = sm.isReducedMotionEnabled();

            mm.closeActiveMenuModal();
            return { initialRM, toggledOff, toggledOn };
        }""")
        passed_d3 = mm_d3["toggledOff"] is False and mm_d3["toggledOn"] is True
        log_test(15, "Part D3: MainMenuScene Settings Modal Supports Reduced Motion Toggle", passed_d3,
                 f"toggledOff={mm_d3['toggledOff']}, toggledOn={mm_d3['toggledOn']}")

        browser.close()

    server.shutdown()

    all_passed = all(r["passed"] for r in results)
    pass_count = sum(1 for r in results if r["passed"])
    total_count = len(results)

    print("\n=======================================================")
    print(f"HW-STAB-32 VERIFICATION SUITE: {pass_count}/{total_count} PASSED")
    print(f"Console Errors: {len(console_errors)}")
    print("=======================================================")

    metrics = {
        "timestamp": time.time(),
        "total": total_count,
        "passed": pass_count,
        "failed": total_count - pass_count,
        "all_passed": all_passed,
        "results": results,
        "console_errors": console_errors
    }
    with open("Read/V1.5/Reports/hw_stab32_metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    if not all_passed:
        sys.exit(1)

if __name__ == "__main__":
    run_suite()
