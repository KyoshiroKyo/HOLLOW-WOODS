import sys
import os
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5202
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'
OUT_DIR = Path(__file__).resolve().parents[1] / 'Read' / 'V1.5' / 'Reports' / 'Visuals' / 'HW_BUG_01'
OUT_DIR.mkdir(parents=True, exist_ok=True)

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

mode = sys.argv[1] if len(sys.argv) > 1 else 'before'
print(f"[QA] Running in mode: {mode.upper()}")

with sync_playwright() as pw:
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    browser = pw.chromium.launch(
        executable_path=chrome_path,
        headless=True,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
    page.wait_for_timeout(500)
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1500)

    # Focus canvas
    page.mouse.click(200, 50)
    page.wait_for_timeout(300)

    def set_camera(cx, cy, zoom=1.0):
        page.evaluate(f"""() => {{
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.cameras.main.stopFollow();
            gs.cameras.main.setZoom({zoom});
            gs.cameras.main.centerOn({cx}, {cy});
        }}""")
        page.wait_for_timeout(350)

    def teleport_bellhollow(x, y):
        page.evaluate(f"""() => {{
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.worldBuilder.ensureZoneRendered('bellhollow');
            gs.currentZoneId = 'bellhollow';
            gs.playerState.setCurrentZone('bellhollow');
            gs.player.forceUnlockActionState();
            gs.player.setPosition({x}, {y});
            if (gs.player.body) gs.player.body.reset({x}, {y});
        }}""")
        page.wait_for_timeout(300)

    # Place player near Edda's yard
    teleport_bellhollow(1130, 180)

    # 1. Snapshot Angle 1: Overview Edda's House & 3 Bushes (1140, 150)
    set_camera(1140, 150, 1.0)
    path_a1_10 = OUT_DIR / f"{mode}_angle1_edda_overview_10x.png"
    page.screenshot(path=str(path_a1_10))
    print(f"[QA] Captured: {path_a1_10.name}")

    set_camera(1140, 150, 1.5)
    path_a1_15 = OUT_DIR / f"{mode}_angle1_edda_overview_15x.png"
    page.screenshot(path=str(path_a1_15))
    print(f"[QA] Captured: {path_a1_15.name}")

    # 2. Snapshot Angle 2: Close-up West Approach (1048, 94 & 1084, 162)
    set_camera(1070, 140, 1.5)
    path_a2 = OUT_DIR / f"{mode}_angle2_west_bushes_15x.png"
    page.screenshot(path=str(path_a2))
    print(f"[QA] Captured: {path_a2.name}")

    # 3. Snapshot Angle 3: Close-up South-East Bush (1204, 204)
    set_camera(1200, 190, 1.5)
    path_a3 = OUT_DIR / f"{mode}_angle3_southeast_bush_15x.png"
    page.screenshot(path=str(path_a3))
    print(f"[QA] Captured: {path_a3.name}")

    # If AFTER mode, perform interactive runtime checks
    if mode == 'after':
        print("\n--- RUNTIME VERIFICATION (AFTER MODE) ---")

        # Verify Noclip OFF
        noclip_state = page.evaluate("() => !!(window.__PHASER_GAME__.scene.getScene('GameScene').player?.noclip || window.__PHASER_GAME__.scene.getScene('GameScene').noclip)")
        print(f"[QA] Noclip status: {'ON' if noclip_state else 'OFF'}")
        assert not noclip_state, "Noclip must be OFF for collision tests"

        # Walk through the 3 removed bush positions to verify zero collision
        # 1. Walk through (1084, 162)
        print("[QA] Walking through former bush (1084, 162)...")
        teleport_bellhollow(1060, 162)
        for _ in range(12):
            page.keyboard.down('KeyD')
            page.wait_for_timeout(85)
            page.keyboard.up('KeyD')
            page.wait_for_timeout(15)
        pos_b1 = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
        print(f"[QA] Walked through (1084, 162) -> reached ({pos_b1['x']}, {pos_b1['y']})")
        assert pos_b1['x'] >= 1100, f"Blocked at bush (1084, 162): x={pos_b1['x']}"

        # 2. Walk through (1204, 204)
        print("[QA] Walking through former bush (1204, 204)...")
        teleport_bellhollow(1180, 204)
        for _ in range(12):
            page.keyboard.down('KeyD')
            page.wait_for_timeout(85)
            page.keyboard.up('KeyD')
            page.wait_for_timeout(15)
        pos_b2 = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
        print(f"[QA] Walked through (1204, 204) -> reached ({pos_b2['x']}, {pos_b2['y']})")
        assert pos_b2['x'] >= 1220, f"Blocked at bush (1204, 204): x={pos_b2['x']}"

        # 3. Approach and interact with Elder Edda at (1160, 160)
        print("[QA] Approaching Elder Edda at (1160, 160)...")
        teleport_bellhollow(1140, 160)
        page.wait_for_timeout(400)

        edda_info = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const edda = gs.npcs.find(n => n.spec.id === 'npc_edda');
            const dist = edda ? Math.hypot(gs.player.x - edda.x, gs.player.y - edda.y) : -1;
            return { exists: !!edda, dist: Math.round(dist) };
        }""")
        print(f"[QA] Edda NPC detected: {edda_info}")
        assert edda_info['exists'], "Elder Edda NPC not found in scene!"

        # Press E
        print("[QA] Pressing [E] to talk to Edda...")
        page.keyboard.press('KeyE')
        page.wait_for_timeout(600)

        dialogue_state = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            return {
                isDialogueActive: !!(gs.dialogueSystem?.isActive || gs.isDialogueActive),
                hasTalked: gs.playerState.hasFlag('talked_to_edda') || gs.playerState.hasFlag('met_edda')
            };
        }""")
        print(f"[QA] Dialogue with Edda status: {dialogue_state}")
        assert dialogue_state['isDialogueActive'] or dialogue_state['hasTalked'], "Failed to trigger dialogue with Edda!"

        # Dismiss dialogue
        page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); if (gs.dialogueSystem) gs.dialogueSystem.endDialogue(); }")
        page.wait_for_timeout(200)
        print("[QA] ALL RUNTIME VERIFICATION CHECKS PASSED!")

    browser.close()
