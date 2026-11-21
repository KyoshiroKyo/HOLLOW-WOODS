import sys
import os
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5199
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass # suppress logs

def run_server():
    httpd = HTTPServer(('127.0.0.1', PORT), Handler)
    httpd.serve_forever()

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")

label = sys.argv[1] if len(sys.argv) > 1 else "before"
out_dir = Path(__file__).resolve().parents[1] / 'Read/V1.5/Reports/Visuals/V153_AG_QUEUE_02A'
out_dir.mkdir(parents=True, exist_ok=True)

with sync_playwright() as pw:
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    browser = pw.chromium.launch(
        executable_path=chrome_path,
        headless=True,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    print("[Playwright] Navigating to game...")
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')

    # Wait for MainMenuScene
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
    print("[Playwright] MainMenuScene active. Starting new game...")
    time.sleep(0.5)

    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")

    # Wait for GameScene
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    print("[Playwright] GameScene active with player ready.")
    time.sleep(2.0)

    # Position player at (650, 520) (just north of seam 560, facing south)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(650, 520);
        if (gs.player.body) {
            gs.player.body.reset(650, 520);
        }
        gs.cameras.main.centerOn(650, 560);
    }""")
    time.sleep(1.0)

    # 1. Capture seam overview at (650, 560) (Gate corridor and lateral boundary)
    path_overview = out_dir / f"{label}_boundary_overview_x650_y560.png"
    page.screenshot(path=str(path_overview))
    print(f"[Playwright] Saved: {path_overview}")

    # 2. Position player slightly further east along seam at (800, 560) to see lateral boundary
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(750, 540);
        if (gs.player.body) {
            gs.player.body.reset(750, 540);
        }
        gs.cameras.main.centerOn(750, 560);
    }""")
    time.sleep(1.0)
    path_east = out_dir / f"{label}_boundary_lateral_x750_y560.png"
    page.screenshot(path=str(path_east))
    print(f"[Playwright] Saved: {path_east}")

    # 3. Position player at farm side (650, 600) looking north
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(650, 600);
        if (gs.player.body) {
            gs.player.body.reset(650, 600);
        }
        gs.cameras.main.centerOn(650, 560);
    }""")
    time.sleep(1.0)
    path_farm_side = out_dir / f"{label}_boundary_from_farm_x650_y560.png"
    page.screenshot(path=str(path_farm_side))
    print(f"[Playwright] Saved: {path_farm_side}")

    browser.close()
    print("[Playwright] Capture completed.")
