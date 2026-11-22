"""
HW-BUG-22: Visual Scale Normalization - Targeted Repro / Assertion Test
Verifies Black Knight visual size relative to human NPCs (Sir Vaelen & Garth).
Before fix: Player height is ~31px (ratio to Sir Vaelen 48px is only 0.645, smaller than child Finn 41.6px).
Expected: Player visual height should be normalized (>= 45.0px, ratio to Sir Vaelen >= 0.92).
"""

import sys
import os
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5254
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
    threading.Thread(target=run_server, args=(httpd,), daemon=True).start()

    with sync_playwright() as pw:
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        browser = pw.chromium.launch(
            executable_path=chrome_path if os.path.exists(chrome_path) else None,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        page.goto(f"http://127.0.0.1:{PORT}/?dev=1&zone=bellhollow", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        time.sleep(1.0)

        # Measure player and NPC non-alpha displayed pixel heights
        measurements = page.evaluate("""() => {
            const game = window.__PHASER_GAME__;
            const gs = game.scene.getScene('GameScene');
            const player = gs.player;

            function getFrameAlphaHeight(textureKey, frameName) {
                const texture = game.textures.get(textureKey);
                if (!texture) return 0;
                const frame = texture.get(frameName);
                if (!frame) return 0;

                const sourceImage = texture.getSourceImage();
                const canvas = document.createElement('canvas');
                canvas.width = frame.cutWidth;
                canvas.height = frame.cutHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    sourceImage,
                    frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
                    0, 0, frame.cutWidth, frame.cutHeight
                );
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

                let minY = canvas.height, maxY = -1;
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alpha = data[(y * canvas.width + x) * 4 + 3];
                        if (alpha > 10) {
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                return maxY >= 0 ? maxY - minY + 1 : 0;
            }

            // 1. Player Idle (Armed)
            const idleFrame = player.frame.name;
            const idleRawH = getFrameAlphaHeight(player.texture.key, idleFrame);
            const idleDisplayH = Math.round(idleRawH * player.scaleY * 10) / 10;

            // 2. Player Walk (Armed)
            const walkRawH = getFrameAlphaHeight('black_knight_movement', 'armed_walk_down_0');
            const walkScale = player.getLocomotionArtworkScale();
            const walkDisplayH = Math.round(walkRawH * walkScale * 10) / 10;

            // 3. NPC Garth
            const garthNpc = gs.children.list.find(c => c.spec && c.spec.id === 'npc_garth');
            const garthRawH = garthNpc ? getFrameAlphaHeight(garthNpc.npcSprite.texture.key, garthNpc.npcSprite.frame.name) : 54;
            const garthDisplayH = garthNpc ? garthRawH * garthNpc.npcSprite.scaleY : 54;

            // 4. NPC Sir Vaelen (standing height reference from idle sheet)
            const vaelenRawH = getFrameAlphaHeight('campfire_knight_idle_sheet', 0) || 48;
            const vaelenDisplayH = vaelenRawH * 1.0;

            // 5. NPC Finn (child)
            const finnRawH = getFrameAlphaHeight('errand_boy_walk_sheet', 0) || 49;
            const finnDisplayH = Math.round(finnRawH * 0.85 * 10) / 10;

            return {
                playerIdleDisplayH: idleDisplayH,
                playerWalkDisplayH: walkDisplayH,
                playerScaleX: player.scaleX,
                playerScaleY: player.scaleY,
                garthDisplayH: garthDisplayH,
                vaelenDisplayH: vaelenDisplayH,
                finnDisplayH: finnDisplayH
            };
        }""")

        browser.close()

    print("=== MEASURED VISUAL HEIGHTS ===")
    print(f"Player Idle Displayed Height: {measurements['playerIdleDisplayH']} px (scale={measurements['playerScaleY']})")
    print(f"Player Walk Displayed Height: {measurements['playerWalkDisplayH']} px")
    print(f"Sir Vaelen (Knight Ref):      {measurements['vaelenDisplayH']} px")
    print(f"Garth (Gatekeeper Ref):       {measurements['garthDisplayH']} px")
    print(f"Finn (Child Villager Ref):    {measurements['finnDisplayH']} px")

    # Ratio calculations
    ratio_to_vaelen = measurements['playerWalkDisplayH'] / measurements['vaelenDisplayH']
    print(f"Player-to-Vaelen Ratio:       {ratio_to_vaelen:.3f}")

    # Assertions that will FAIL on unnormalized player size
    assert measurements['playerWalkDisplayH'] >= 45.0, (
        f"BUG CONFIRMED: Player is visibly too small! Walk height={measurements['playerWalkDisplayH']}px "
        f"(expected >= 45.0px, Sir Vaelen is {measurements['vaelenDisplayH']}px)"
    )
    assert ratio_to_vaelen >= 0.92, (
        f"BUG CONFIRMED: Player-to-Knight ratio={ratio_to_vaelen:.3f} is too small! (expected >= 0.92)"
    )
    assert measurements['playerWalkDisplayH'] > measurements['finnDisplayH'], (
        f"BUG CONFIRMED: Player ({measurements['playerWalkDisplayH']}px) is smaller than child Finn ({measurements['finnDisplayH']}px)!"
    )

    print("\nSUCCESS: Player visual size is normalized and proportional to human NPCs!")

if __name__ == '__main__':
    main()
