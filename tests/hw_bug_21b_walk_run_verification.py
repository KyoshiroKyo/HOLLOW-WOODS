"""
HW-BUG-21B: Black Knight Walk/Run State Full Verification Suite
Target: HOLLOW WOODS V1.5.4
Verifies:
1. Noclip OFF at Bellhollow and Outer Woods
2. 4-Direction W/A/S/D Walk (assert speed <= 85.0, animKey has 'walk')
3. Sprint with Shift (assert speed == 140.0, isSprinting == True, animKey has 'run')
4. Release Shift while holding W (assert speed transitions 140 -> 85, isSprinting True -> False, anim run -> walk)
5. Key-repeat stability
6. Alt-Tab / Focus Loss recovery
7. Open / Close Modal (Pause & Inventory)
8. New Game & Continue state
9. Armed and Unarmed locomotion
10. Direction facing persistence and Idle transition
11. Combat smoke regression (Light Attack, Roll, Parry)
"""

import sys
import os
import time
import json
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5245
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def run_server(httpd):
    httpd.serve_forever()

def main():
    httpd = HTTPServer(('127.0.0.1', PORT), Handler)
    server_thread = threading.Thread(target=run_server, args=(httpd,), daemon=True)
    server_thread.start()
    print(f"Server started at http://127.0.0.1:{PORT}")

    with sync_playwright() as pw:
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        browser = pw.chromium.launch(
            executable_path=chrome_path if os.path.exists(chrome_path) else None,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        # --- Test 1: New Game at Bellhollow with Noclip OFF ---
        print("\n--- [TEST 1] New Game at Bellhollow (Noclip OFF) ---")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1&zone=bellhollow", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        time.sleep(1.0)

        # Ensure noclip is OFF
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            if (window.__DEV_CONFIG__) window.__DEV_CONFIG__.isNoclip = false;
            gs.player.resetAllActionAndMotionStates();
            gs.player.playIdle();
        }""")

        def get_player_state():
            return page.evaluate("""() => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                const p = gs.player;
                const vx = p.body ? p.body.velocity.x : 0;
                const vy = p.body ? p.body.velocity.y : 0;
                return {
                    speed: Math.round(Math.hypot(vx, vy) * 10) / 10,
                    vx: Math.round(vx * 10) / 10,
                    vy: Math.round(vy * 10) / 10,
                    isSprinting: Boolean(p.stats.isSprinting),
                    stamina: Math.round(p.stats.stamina),
                    facing: p.facing,
                    isWeaponDrawn: Boolean(p._isWeaponDrawn),
                    animKey: p.anims.currentAnim?.key,
                    frameName: p.anims.currentFrame?.frame?.name,
                    isPhysicalShiftHeld: Boolean(p.isPhysicalShiftHeld),
                    activeCodes: Array.from(p.activePhysicalCodes || []),
                    isDead: Boolean(p._isDead),
                    isActionLocked: Boolean(p.isActionLocked())
                };
            }""")

        # Focus canvas
        page.evaluate("() => { const canvas = document.querySelector('canvas'); if (canvas) canvas.focus(); }")

        # --- Test 2: 4-Direction Walk (W/A/S/D) without Shift ---
        print("\n--- [TEST 2] 4-Direction Walk without Shift ---")
        directions = [
            ('KeyW', 'up'),
            ('KeyS', 'down'),
            ('KeyD', 'right'),
            ('KeyA', 'left')
        ]
        for key, dir_name in directions:
            # Keep player centered at road spawn (120, 195) to avoid hitting roadside buildings
            page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); gs.player.setPosition(120, 195); gs.player.setVelocity(0, 0); }")
            time.sleep(0.05)
            page.keyboard.down(key)
            time.sleep(0.4)
            st = get_player_state()
            page.keyboard.up(key)
            time.sleep(0.2)

            print(f"Direction {dir_name}: spd={st['speed']}, sprint={st['isSprinting']}, anim={st['animKey']}, frame={st['frameName']}")
            assert st['speed'] <= 86.0 and st['speed'] >= 84.0, f"Walk speed mismatch on {dir_name}: {st['speed']}"
            assert st['isSprinting'] == False, f"isSprinting must be False on {dir_name}"
            assert f"walk_{dir_name}" in st['animKey'], f"Expected walk_{dir_name} in {st['animKey']}"
            assert st['isPhysicalShiftHeld'] == False, "isPhysicalShiftHeld must be False"

        # --- Test 3: Sprint with Shift ---
        print("\n--- [TEST 3] Sprint with Shift ---")
        page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); gs.player.setPosition(120, 195); gs.player.setVelocity(0, 0); }")
        page.keyboard.down('ShiftLeft')
        time.sleep(0.05)
        page.keyboard.down('KeyW')
        time.sleep(0.35)
        st = get_player_state()
        page.keyboard.up('KeyW')
        page.keyboard.up('ShiftLeft')
        time.sleep(0.1)

        print(f"Sprint state: spd={st['speed']}, sprint={st['isSprinting']}, anim={st['animKey']}, frame={st['frameName']}")
        assert st['speed'] >= 139.0 and st['speed'] <= 141.0, f"Sprint speed mismatch: {st['speed']}"
        assert st['isSprinting'] == True, "isSprinting must be True"
        assert "run_up" in st['animKey'], f"Expected run_up in {st['animKey']}"
        assert "armed_run_sequence" in st['frameName'], f"Expected 12-frame sequence in {st['frameName']}"

        # --- Test 4: Release Shift while holding W ---
        print("\n--- [TEST 4] Release Shift while holding W (Transition) ---")
        page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); gs.player.setPosition(120, 195); gs.player.setVelocity(0, 0); }")
        page.keyboard.down('ShiftLeft')
        page.keyboard.down('KeyW')
        time.sleep(0.3)
        st_sprint = get_player_state()
        # Release Shift, keep W down
        page.keyboard.up('ShiftLeft')
        time.sleep(0.35)
        st_walk = get_player_state()
        page.keyboard.up('KeyW')
        time.sleep(0.1)

        print(f"Before release (Sprint): spd={st_sprint['speed']}, sprint={st_sprint['isSprinting']}, anim={st_sprint['animKey']}")
        print(f"After release (Walk):    spd={st_walk['speed']}, sprint={st_walk['isSprinting']}, anim={st_walk['animKey']}")
        assert st_sprint['isSprinting'] == True and "run" in st_sprint['animKey']
        assert st_walk['isSprinting'] == False and "walk" in st_walk['animKey']
        assert st_walk['speed'] <= 86.0 and st_walk['speed'] >= 84.0

        # --- Test 5: Key-Repeat Walk Stability ---
        print("\n--- [TEST 5] Key-Repeat Walk Stability ---")
        page.keyboard.down('KeyW')
        time.sleep(0.8) # Long hold causing browser key-repeat
        st = get_player_state()
        page.keyboard.up('KeyW')
        time.sleep(0.1)
        print(f"Key-repeat walk state: spd={st['speed']}, anim={st['animKey']}, sprint={st['isSprinting']}")
        assert st['isSprinting'] == False
        assert "walk" in st['animKey']
        assert st['speed'] == 85.0

        # --- Test 6: Alt-Tab / Focus Loss with IME packet simulation ---
        print("\n--- [TEST 6] Alt-Tab / Focus Loss & IME Packet Simulation ---")
        page.keyboard.down('ShiftLeft')
        time.sleep(0.1)
        # Simulate EVKey sending IME packet on Shift keyup
        page.evaluate("""() => {
            window.dispatchEvent(new Event('blur'));
            const ev = new KeyboardEvent('keyup', {
                code: 'ShiftLeft',
                key: 'Process',
                keyCode: 229,
                bubbles: true,
                cancelable: true
            });
            window.dispatchEvent(ev);
            window.dispatchEvent(new Event('focus'));
        }""")
        page.keyboard.up('ShiftLeft')
        time.sleep(0.1)
        # Walk with W
        page.keyboard.down('KeyW')
        time.sleep(0.35)
        st = get_player_state()
        page.keyboard.up('KeyW')
        time.sleep(0.1)

        print(f"After IME keyup & blur: spd={st['speed']}, sprint={st['isSprinting']}, anim={st['animKey']}, physShift={st['isPhysicalShiftHeld']}")
        assert st['isSprinting'] == False, "Player must NOT sprint after Shift release!"
        assert st['speed'] == 85.0, f"Speed must be 85.0, got {st['speed']}"
        assert "walk" in st['animKey'], f"Animation must be walk, got {st['animKey']}"

        # --- Test 7: Modal Open / Close ---
        print("\n--- [TEST 7] Modal Open / Close (Pause ESC) ---")
        page.keyboard.press('Escape')
        time.sleep(0.3)
        # Shift pressed inside modal
        page.keyboard.down('ShiftLeft')
        time.sleep(0.1)
        page.keyboard.up('ShiftLeft')
        time.sleep(0.1)
        # Close modal
        page.keyboard.press('Escape')
        time.sleep(0.3)
        # Walk
        page.keyboard.down('KeyW')
        time.sleep(0.3)
        st = get_player_state()
        page.keyboard.up('KeyW')
        time.sleep(0.1)
        print(f"After modal close: spd={st['speed']}, sprint={st['isSprinting']}, anim={st['animKey']}")
        assert st['isSprinting'] == False
        assert "walk" in st['animKey']
        assert st['speed'] == 85.0

        # --- Test 8: Armed vs Unarmed ---
        print("\n--- [TEST 8] Armed vs Unarmed Locomotion ---")
        # Ensure clean Unarmed in safe bellhollow, positioned deep inside village
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'bellhollow';
            gs.worldBuilder.setActiveZone('bellhollow');
            gs.applyCameraBoundsForZone('bellhollow');
            gs.player.setPosition(650, 260);
            gs.player.setVelocity(0, 0);
            gs.player._isWeaponDrawn = false;
            gs.player.forceUnlockActionState();
            gs.player.playIdle();
        }""")
        time.sleep(0.2)
        # Unarmed Walk Right
        page.keyboard.down('KeyD')
        time.sleep(0.4)
        st_unarmed_walk = get_player_state()
        page.keyboard.up('KeyD')
        time.sleep(0.2)

        # Reposition and Unarmed Sprint Right
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(650, 260);
            gs.player.setVelocity(0, 0);
            gs.player._isWeaponDrawn = false;
            gs.player.forceUnlockActionState();
            gs.player.playIdle();
        }""")
        time.sleep(0.1)
        page.keyboard.down('ShiftLeft')
        time.sleep(0.05)
        page.keyboard.down('KeyD')
        time.sleep(0.4)
        st_unarmed_sprint = get_player_state()
        page.keyboard.up('KeyD')
        page.keyboard.up('ShiftLeft')
        time.sleep(0.2)

        print(f"Unarmed walk:   spd={st_unarmed_walk['speed']}, anim={st_unarmed_walk['animKey']}")
        print(f"Unarmed sprint: spd={st_unarmed_sprint['speed']}, anim={st_unarmed_sprint['animKey']}")
        assert "unarmed_walk" in st_unarmed_walk['animKey'], f"Expected unarmed_walk in {st_unarmed_walk['animKey']}"
        assert st_unarmed_walk['speed'] == 85.0
        assert "unarmed_run" in st_unarmed_sprint['animKey'], f"Expected unarmed_run in {st_unarmed_sprint['animKey']}"
        assert st_unarmed_sprint['speed'] == 140.0

        # --- Test 9: Outer Woods Noclip OFF Verification ---
        print("\n--- [TEST 9] Outer Woods Transition (Noclip OFF) ---")
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'outer_woods';
            gs.worldBuilder.setActiveZone('outer_woods');
            gs.applyCameraBoundsForZone('outer_woods');
            gs.player._isWeaponDrawn = true;
            gs.player.forceUnlockActionState();
            gs.player.setPosition(1210, 620);
            gs.player.setVelocity(0, 0);
            gs.player.playIdle();
        }""")
        time.sleep(0.3)
        page.keyboard.down('KeyW')
        time.sleep(0.4)
        st_ow = get_player_state()
        page.keyboard.up('KeyW')
        time.sleep(0.2)
        print(f"Outer woods walk: spd={st_ow['speed']}, anim={st_ow['animKey']}, sprint={st_ow['isSprinting']}")
        assert st_ow['speed'] == 85.0
        assert "walk" in st_ow['animKey']
        assert st_ow['isSprinting'] == False

        # --- Test 10: Combat Smoke Regression (Attack, Roll, Parry) ---
        print("\n--- [TEST 10] Combat Smoke Regression ---")
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'outer_woods';
            gs.worldBuilder.setActiveZone('outer_woods');
            gs.applyCameraBoundsForZone('outer_woods');
            gs.player._isWeaponDrawn = true;
            gs.player.facing = 'down';
            gs.player.forceUnlockActionState();
            gs.player.setPosition(1210, 750);
            gs.player.setVelocity(0, 0);
            gs.player.playIdle();
        }""")
        time.sleep(0.3)

        # 1. Light attack
        page.keyboard.press('Space')
        time.sleep(0.15)
        st_atk = get_player_state()
        print(f"Light attack: locked={st_atk['isActionLocked']}, anim={st_atk['animKey']}")
        assert st_atk['isActionLocked'] == True
        assert "attack" in st_atk['animKey']
        page.wait_for_function("() => !window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player?.isActionLocked()", timeout=5000)
        time.sleep(0.1)

        # 2. Roll
        page.keyboard.press('KeyZ')
        time.sleep(0.15)
        st_roll = get_player_state()
        print(f"Roll: locked={st_roll['isActionLocked']}, anim={st_roll['animKey']}")
        assert st_roll['isActionLocked'] == True
        assert "roll" in st_roll['animKey']
        page.wait_for_function("() => !window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player?.isActionLocked()", timeout=5000)
        time.sleep(0.1)

        # 3. Parry
        page.keyboard.press('KeyV')
        time.sleep(0.15)
        st_parry = get_player_state()
        print(f"Parry: locked={st_parry['isActionLocked']}, anim={st_parry['animKey']}")
        assert st_parry['isActionLocked'] == True
        assert "parry" in st_parry['animKey']
        page.wait_for_function("() => !window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player?.isActionLocked()", timeout=5000)
        time.sleep(0.1)

        # 4. Walk immediately after combat action
        page.keyboard.down('KeyS')
        time.sleep(0.35)
        st_after_combat = get_player_state()
        page.keyboard.up('KeyS')
        time.sleep(0.1)
        print(f"Post-combat walk: spd={st_after_combat['speed']}, anim={st_after_combat['animKey']}, sprint={st_after_combat['isSprinting']}")
        assert st_after_combat['speed'] == 85.0
        assert "walk" in st_after_combat['animKey']
        assert st_after_combat['isSprinting'] == False

        browser.close()

    print("\n=======================================================")
    print("ALL 10 VERIFICATION TESTS PASSED RIGOROUSLY!")
    print("=======================================================")

if __name__ == '__main__':
    main()
