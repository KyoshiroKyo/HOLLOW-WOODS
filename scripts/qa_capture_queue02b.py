import sys
import os
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5201
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

label = sys.argv[1] if len(sys.argv) > 1 else "before"
out_dir = Path(__file__).resolve().parents[1] / 'Read/V1.5/Reports/Visuals/V153_AG_QUEUE_02B'
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

    # Angles to capture:
    # 1. Trại thợ săn & Trạm lửa Sir Vaelen: (1380, 720)
    # 2. Ngã rẽ & Tuyến đường xuống Xưởng Chuông: (1360, 820)
    # 3. Cửa rừng phía Bắc giáp Bellhollow: (1220, 640)
    shots = [
        ("angle1_camp_vaelen", 1380, 720),
        ("angle2_junction_workshop", 1360, 820),
        ("angle3_north_gate", 1220, 640),
    ]

    for name, cam_x, cam_y in shots:
        for zoom in [1.0, 1.5]:
            zoom_tag = "10x" if zoom == 1.0 else "15x"
            page.evaluate(f"""() => {{
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.player.setPosition({cam_x}, {cam_y});
                if (gs.player.body) {{
                    gs.player.body.reset({cam_x}, {cam_y});
                }}
                gs.cameras.main.stopFollow();
                gs.cameras.main.centerOn({cam_x}, {cam_y});
                gs.cameras.main.setZoom({zoom});
            }}""")
            time.sleep(0.6)
            path = out_dir / f"{label}_{name}_{zoom_tag}.png"
            page.screenshot(path=str(path))
            print(f"[Playwright] Captured: {path.name}")

    browser.close()
    print(f"[Playwright] Capture {label} completed successfully.")
