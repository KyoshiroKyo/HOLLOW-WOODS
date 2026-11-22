"""
HW-BUG-21A: Black Knight Walk/Run Diagnostic Automation Script
Target: HOLLOW WOODS V1.5.4 Prep
Mode: Targeted QA Telemetry Logger
Executes 8 locomotion scenarios and captures frame-by-frame timeline telemetry.
"""

import sys
import os
import time
import json
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5229
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def run_server(httpd):
    httpd.serve_forever()

def main():
    try:
        httpd = HTTPServer(('127.0.0.1', PORT), Handler)
    except OSError:
        print(f"Port {PORT} already in use or unavailable.")
        return

    server_thread = threading.Thread(target=run_server, args=(httpd,), daemon=True)
    server_thread.start()
    print(f"Static test server running at http://127.0.0.1:{PORT}")

    with sync_playwright() as pw:
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        browser = pw.chromium.launch(
            executable_path=chrome_path if os.path.exists(chrome_path) else None,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1&zone=bellhollow", wait_until='domcontentloaded')

        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        time.sleep(1.0)

        # Focus canvas without clicking (clicking causes attack)
        page.evaluate("() => { const canvas = document.querySelector('canvas'); if (canvas) canvas.focus(); }")

        # Attach telemetry recorder to GameScene postupdate event
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            window.__DIAGNOSTIC_LOGS__ = [];
            window.__RECORDING_ACTIVE__ = false;
            window.__TOTAL_FRAMES__ = 0;

            gs.events.on('postupdate', (time, delta) => {
                window.__TOTAL_FRAMES__++;
                if (!window.__RECORDING_ACTIVE__) return;

                const p = gs.player;
                if (!p) return;

                const vx = p.body ? p.body.velocity.x : 0;
                const vy = p.body ? p.body.velocity.y : 0;
                const speed = Math.hypot(vx, vy);

                const entry = {
                    t: Math.round(time),
                    tag: window.__CURRENT_TAG__ || '',
                    w: Boolean(p.keyW?.isDown),
                    a: Boolean(p.keyA?.isDown),
                    s: Boolean(p.keyS?.isDown),
                    d: Boolean(p.keyD?.isDown),
                    shiftDownPhaser: Boolean(p.keyShift?.isDown),
                    shiftDownCursor: Boolean(p.cursors?.shift?.isDown),
                    isPhysicalShiftHeld: Boolean(p.isPhysicalShiftHeld),
                    activeCodes: Array.from(p.activePhysicalCodes || []),
                    isSprinting: Boolean(p.stats.isSprinting),
                    stamina: Math.round(p.stats.stamina),
                    isWeaponDrawn: Boolean(p._isWeaponDrawn),
                    facing: p.facing,
                    speed: Math.round(speed * 10) / 10,
                    animKey: p.anims.currentAnim?.key || null,
                    frameName: p.anims.currentFrame?.frame?.name || null,
                    frameIndex: p.anims.currentFrame?.index || null
                };
                window.__DIAGNOSTIC_LOGS__.push(entry);
            });

            window.startRecording = (tag) => {
                window.__CURRENT_TAG__ = tag;
                window.__RECORDING_ACTIVE__ = true;
            };
            window.stopRecording = () => {
                window.__RECORDING_ACTIVE__ = false;
            };
            window.clearLogs = () => {
                window.__DIAGNOSTIC_LOGS__ = [];
            };
        }""")

        results = {}

        def run_scenario(name, action_fn):
            print(f"\n--- Running Scenario: {name} ---")
            page.evaluate(f"() => {{ window.clearLogs(); window.startRecording('{name}'); }}")
            action_fn()
            time.sleep(0.1)
            res = page.evaluate("() => { window.stopRecording(); return { logs: window.__DIAGNOSTIC_LOGS__, total: window.__TOTAL_FRAMES__ }; }")
            logs = res['logs']
            print(f"Captured {len(logs)} frames for {name} (total scene frames: {res['total']})")
            results[name] = logs
            return logs

        # Ensure player starts in clean idle
        page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); gs.player.resetAllActionAndMotionStates(); gs.player.playIdle(); }")
        time.sleep(0.2)

        # 1. Đi W/A/S/D, không Shift
        def test_wasd_no_shift():
            for key in ['KeyW', 'KeyA', 'KeyS', 'KeyD']:
                page.keyboard.down(key)
                time.sleep(0.3)
                page.keyboard.up(key)
                time.sleep(0.1)
        run_scenario("1_WASD_No_Shift", test_wasd_no_shift)

        # 2. Đi trong khi giữ Shift
        def test_sprint_shift():
            page.keyboard.down('ShiftLeft')
            time.sleep(0.05)
            page.keyboard.down('KeyW')
            time.sleep(0.5)
            page.keyboard.up('KeyW')
            time.sleep(0.05)
            page.keyboard.up('ShiftLeft')
            time.sleep(0.1)
        run_scenario("2_Sprint_With_Shift", test_sprint_shift)

        # 3. Nhả Shift nhưng vẫn giữ W
        def test_release_shift_hold_w():
            page.keyboard.down('ShiftLeft')
            page.keyboard.down('KeyW')
            time.sleep(0.4) # Running
            page.keyboard.up('ShiftLeft') # Release Shift, keep W
            time.sleep(0.6) # Walking while W held
            page.keyboard.up('KeyW')
            time.sleep(0.1)
        run_scenario("3_Release_Shift_Hold_W", test_release_shift_hold_w)

        # 4. Nhấn/nhả Shift nhanh trong khi giữ W
        def test_rapid_shift_tap():
            page.keyboard.down('KeyW')
            time.sleep(0.2)
            for _ in range(3):
                page.keyboard.down('ShiftLeft')
                time.sleep(0.05)
                page.keyboard.up('ShiftLeft')
                time.sleep(0.08)
            time.sleep(0.3)
            page.keyboard.up('KeyW')
            time.sleep(0.1)
        run_scenario("4_Rapid_Shift_Tap", test_rapid_shift_tap)

        # 5. Alt-Tab hoặc đổi focus khi đang giữ Shift
        def test_alt_tab_focus():
            page.keyboard.down('ShiftLeft')
            page.keyboard.down('KeyW')
            time.sleep(0.3)
            # Window loses focus (Alt-Tab)
            page.evaluate("() => { window.dispatchEvent(new Event('blur')); }")
            time.sleep(0.1)
            # Keys released outside window
            page.keyboard.up('ShiftLeft')
            page.keyboard.up('KeyW')
            time.sleep(0.1)
            # Page regains focus
            page.evaluate("() => { window.dispatchEvent(new Event('focus')); }")
            time.sleep(0.1)
            # Now user presses W WITHOUT Shift
            page.keyboard.down('KeyW')
            time.sleep(0.5)
            page.keyboard.up('KeyW')
            time.sleep(0.1)
        run_scenario("5_Blur_Focus_Shift", test_alt_tab_focus)

        # 6. Mở/đóng modal
        def test_modal_open_close():
            page.keyboard.down('KeyW')
            time.sleep(0.2)
            # Open Pause Modal with ESC
            page.keyboard.press('Escape')
            time.sleep(0.3)
            # In modal, press Shift
            page.keyboard.down('ShiftLeft')
            time.sleep(0.1)
            page.keyboard.up('ShiftLeft')
            time.sleep(0.1)
            # Close modal with ESC
            page.keyboard.press('Escape')
            time.sleep(0.3)
            # Walk again without Shift
            page.keyboard.down('KeyW')
            time.sleep(0.5)
            page.keyboard.up('KeyW')
            time.sleep(0.1)
        run_scenario("6_Modal_Open_Close", test_modal_open_close)

        # 7. Chuyển vùng
        def test_zone_transition():
            page.keyboard.down('KeyW')
            time.sleep(0.3)
            page.evaluate("""() => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.applyCameraBoundsForZone('bellhollow');
                gs.currentZoneId = 'bellhollow';
            }""")
            time.sleep(0.3)
            page.keyboard.up('KeyW')
            time.sleep(0.1)
        run_scenario("7_Zone_Transition", test_zone_transition)

        # 8. Armed và Unarmed
        def test_armed_and_unarmed():
            page.evaluate("""() => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.currentZoneId = 'bellhollow';
                gs.player._isWeaponDrawn = true;
            }""")
            # Walk armed
            page.keyboard.down('KeyW')
            time.sleep(0.3)
            # Sprint armed
            page.keyboard.down('ShiftLeft')
            time.sleep(0.3)
            page.keyboard.up('ShiftLeft')
            page.keyboard.up('KeyW')
            time.sleep(0.2)

            # Toggle to Unarmed
            page.evaluate("""() => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.player._isWeaponDrawn = false;
            }""")
            time.sleep(0.1)
            # Walk unarmed
            page.keyboard.down('KeyW')
            time.sleep(0.3)
            # Sprint unarmed
            page.keyboard.down('ShiftLeft')
            time.sleep(0.3)
            page.keyboard.up('ShiftLeft')
            page.keyboard.up('KeyW')
            time.sleep(0.1)
        run_scenario("8_Armed_Unarmed", test_armed_and_unarmed)

        browser.close()

    print("\nDiagnostic complete! Scenarios captured successfully.")

if __name__ == '__main__':
    main()
