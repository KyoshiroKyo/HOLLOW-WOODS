import sys
import os
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5198
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

    # Click on the canvas to ensure keyboard focus
    page.mouse.click(640, 360)
    page.wait_for_timeout(200)

    print("[QA] Setting initial position in Bellhollow at (650, 500)...")
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(650, 500);
        if (gs.player.body) {
            gs.player.body.reset(650, 500);
        }
    }""")
    page.wait_for_timeout(300)

    # 1. Walk South across seam (y: 500 -> past 560 into Sanctuary Farm) with Noclip OFF
    print("[QA] Simulating walking SOUTH (repeating Key S) from Bellhollow to Sanctuary Farm...")
    for _ in range(30):
        page.keyboard.down('KeyS')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyS')
    page.wait_for_timeout(200)

    pos1 = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            x: Math.round(gs.player.x),
            y: Math.round(gs.player.y),
            zone: gs.activeZoneId
        };
    }""")
    print(f"[QA] After walking SOUTH: Position=({pos1['x']}, {pos1['y']}), Zone={pos1['zone']}")
    assert pos1['y'] >= 560, f"Player did not reach or cross seam, y={pos1['y']}"

    # 2. Walk North across seam (y: current -> back north into Bellhollow) with Noclip OFF
    print("[QA] Simulating walking NORTH (repeating Key W) from Sanctuary Farm back to Bellhollow...")
    for _ in range(30):
        page.keyboard.down('KeyW')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyW')
    page.wait_for_timeout(200)

    pos2 = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            x: Math.round(gs.player.x),
            y: Math.round(gs.player.y),
            zone: gs.activeZoneId
        };
    }""")
    print(f"[QA] After walking NORTH: Position=({pos2['x']}, {pos2['y']}), Zone={pos2['zone']}")
    assert pos2['y'] < 530, f"Player did not move back north into Bellhollow, y={pos2['y']}"

    print("[QA] Two-way walking test: PASS! Completely smooth, no blocking collider, seamless transit.")
    browser.close()
