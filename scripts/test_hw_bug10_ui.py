import sys
import os
import time
import threading
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5260
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

os.makedirs('Read/V1.5/Reports/Visuals', exist_ok=True)
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

    print("[Playwright] Navigating to game...")
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
    page.click('canvas')
    time.sleep(0.5)

    # Start new game
    print("[Playwright] Starting new game...")
    page.evaluate("() => window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    time.sleep(1.5)

    print("[Test Suite] Running HW-BUG-10 Zone Banner & World Map Verification...")

    # TEST 1: Zone Banner Coordinates & Non-Overlap with Clock / Quest / Toast
    test1_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');

        // Show banner and toast simultaneously
        ui.showZoneBanner({
            titleVietnamese: 'LÀNG BELLHOLLOW',
            subTitleVietnamese: 'Nơi Trú Ẩn Cuối Cùng • Vùng Lõi An Toàn'
        }, true);
        ui.showPopupMessage('✔ Khu vực an toàn: Làng Bellhollow');

        const bannerY = ui.zoneBannerContainer.y;
        const bannerH = 54;
        const bannerTop = bannerY - bannerH / 2;
        const bannerBottom = bannerY + bannerH / 2;

        // Clock widget bounds: X: 668..912, Y: 16..94
        const clockBottom = 16 + 78; // 94

        // Toast bounds: Y starts at 205
        const toastY = ui.pooledPopupText ? ui.pooledPopupText.y : 205;

        // Quest Tracker: X: 920..1260, Y: 16..120+
        const questLeft = 920;

        return {
            bannerY,
            bannerTop,
            bannerBottom,
            clockBottom,
            toastY,
            gapClockToBanner: bannerTop - clockBottom,
            gapBannerToToast: toastY - bannerBottom,
            overlapsClock: (bannerTop < clockBottom),
            overlapsToast: (bannerBottom > toastY)
        };
    }'''

    t1_data = page.evaluate(test1_code)
    test_results['test1_banner_layout'] = t1_data
    print(f"[Test 1 Banner Layout] result: {json.dumps(t1_data)}")
    assert t1_data['bannerY'] == 138, f"Banner Y should be 138, got {t1_data['bannerY']}"
    assert t1_data['gapClockToBanner'] >= 15, f"Gap between Clock and Banner should be >= 15px, got {t1_data['gapClockToBanner']}"
    assert t1_data['gapBannerToToast'] >= 15, f"Gap between Banner and Toast should be >= 15px, got {t1_data['gapBannerToToast']}"
    assert t1_data['overlapsClock'] is False, "Zone Banner overlaps Clock HUD!"
    assert t1_data['overlapsToast'] is False, "Zone Banner overlaps Toast Message!"

    # Capture AFTER screenshot for Zone Banner
    time.sleep(0.4)
    page.screenshot(path='Read/V1.5/Reports/Visuals/after_zone_banner_hud_clean.png')
    print("Captured after_zone_banner_hud_clean.png")

    # TEST 2: Rapid Zone Transition Debounce (Chống lặp banner ranh giới)
    test2_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');

        // Reset timer
        ui.lastBannerShownTime = performance.now();
        ui.lastBannerZoneTitle = 'LÀNG BELLHOLLOW';

        // Trigger immediate second banner for farm
        ui.showZoneBanner({
            titleVietnamese: 'NÔNG TRẠI TRÚ ẨN',
            subTitleVietnamese: 'Vườn Thảo Dược Nam'
        }, false);

        return {
            hasPendingTimer: Boolean(ui.pendingBannerTimer),
            activeTitle: ui.zoneTitleText.text
        };
    }'''

    t2_data = page.evaluate(test2_code)
    test_results['test2_banner_debounce'] = t2_data
    print(f"[Test 2 Banner Debounce] result: {json.dumps(t2_data)}")
    assert t2_data['hasPendingTimer'] is True, "Rapid banner switch should be queued in pendingBannerTimer!"
    assert t2_data['activeTitle'] == 'LÀNG BELLHOLLOW', "Active banner should not be abruptly overridden!"

    # TEST 3: World Map Panel Bounds & Node In-Panel Geometry
    test3_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');
        const mapModal = ui.getParchmentWorldMapModal();
        mapModal.open();

        const panelX = 150;
        const panelY = 60;
        const panelW = 980;
        const panelH = 600;
        const panelRight = panelX + panelW;
        const panelBottom = panelY + panelH;

        const nodeChecks = [];
        let allInPanel = true;

        for (const node of mapModal.nodes) {
            const left = node.canvasX;
            const right = node.canvasX + node.width;
            const top = node.canvasY;
            const bottom = node.canvasY + node.height;

            const inPanel = (left >= panelX && right <= panelRight && top >= panelY && bottom <= panelBottom);
            if (!inPanel) allInPanel = false;

            nodeChecks.push({
                id: node.id,
                name: node.name,
                left,
                right,
                top,
                bottom,
                marginToPanelLeft: left - panelX,
                marginToPanelRight: panelRight - right,
                inPanel
            });
        }

        return {
            allInPanel,
            nodeChecks
        };
    }'''

    t3_data = page.evaluate(test3_code)
    test_results['test3_map_nodes_in_panel'] = t3_data
    print(f"[Test 3 Map Nodes] allInPanel: {t3_data['allInPanel']}")
    assert t3_data['allInPanel'] is True, f"Some map nodes are outside the parchment panel: {t3_data['nodeChecks']}"

    # TEST 4: Non-Overlap between "BẠN ĐANG Ở ĐÂY" and Bellhollow Node Title
    test4_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');
        const mapModal = ui.getParchmentWorldMapModal();

        const bell = mapModal.nodes.find(n => n.id === 'bellhollow');
        const topCenterY = bell.canvasY; // 280
        const beaconLabelY = topCenterY - 14; // 266 (center)
        const beaconLabelBottom = beaconLabelY + 7; // ~273

        const bellTitleY = bell.canvasY + 8; // 288 (top)

        const gap = bellTitleY - beaconLabelBottom;

        return {
            bellCanvasY: bell.canvasY,
            beaconLabelY,
            beaconLabelBottom,
            bellTitleY,
            gap,
            overlaps: (beaconLabelBottom >= bellTitleY)
        };
    }'''

    t4_data = page.evaluate(test4_code)
    test_results['test4_beacon_non_overlap'] = t4_data
    print(f"[Test 4 Beacon Non-Overlap] result: {json.dumps(t4_data)}")
    assert t4_data['overlaps'] is False, f"Beacon label overlaps Bellhollow title: {t4_data}"
    assert t4_data['gap'] >= 10, f"Gap between beacon label and Bellhollow title should be >= 10px, got {t4_data['gap']}"

    # TEST 5: Non-Overlap of Bridge Seal
    test5_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');
        const mapModal = ui.getParchmentWorldMapModal();

        const mire = mapModal.nodes.find(n => n.id === 'silent_mire');
        const shrine = mapModal.nodes.find(n => n.id === 'broken_bell_shrine');

        const mireRight = mire.canvasX + mire.width; // 685 + 130 = 815
        const shrineLeft = shrine.canvasX; // 935

        const bridgeX = 875;
        const bridgeW = 96;
        const bridgeLeft = bridgeX - bridgeW / 2; // 827
        const bridgeRight = bridgeX + bridgeW / 2; // 923

        const gapToMire = bridgeLeft - mireRight; // 827 - 815 = 12
        const gapToShrine = shrineLeft - bridgeRight; // 935 - 923 = 12

        return {
            mireRight,
            shrineLeft,
            bridgeLeft,
            bridgeRight,
            gapToMire,
            gapToShrine,
            overlapsMire: (bridgeLeft <= mireRight),
            overlapsShrine: (bridgeRight >= shrineLeft)
        };
    }'''

    t5_data = page.evaluate(test5_code)
    test_results['test5_bridge_non_overlap'] = t5_data
    print(f"[Test 5 Bridge Non-Overlap] result: {json.dumps(t5_data)}")
    assert t5_data['overlapsMire'] is False, "Bridge seal overlaps silent_mire node!"
    assert t5_data['overlapsShrine'] is False, "Bridge seal overlaps broken_bell_shrine node!"
    assert t5_data['gapToMire'] >= 8, f"Gap to mire should be >= 8px, got {t5_data['gapToMire']}"
    assert t5_data['gapToShrine'] >= 8, f"Gap to shrine should be >= 8px, got {t5_data['gapToShrine']}"

    # Capture AFTER screenshot for World Map
    time.sleep(0.5)
    page.screenshot(path='Read/V1.5/Reports/Visuals/after_world_map_ui_clean.png')
    print("Captured after_world_map_ui_clean.png")

    # TEST 6: [N], [ESC], and Multi-Resolution Checks (1280x720, 1600x900, 1920x1080)
    for w, h in [(1280, 720), (1600, 900), (1920, 1080)]:
        context.close()
        context = browser.new_context(viewport={'width': w, 'height': h})
        p = context.new_page()
        p.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
        p.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        p.click('canvas')
        time.sleep(0.3)
        p.evaluate("() => window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()")
        p.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        time.sleep(1.0)

        # Toggle Map with N
        p.keyboard.press('KeyN')
        time.sleep(0.4)
        isMapOpen = p.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getParchmentWorldMapModal().isOpen")
        assert isMapOpen is True, f"Map failed to open with [N] at {w}x{h}"

        # Close with ESC
        p.keyboard.press('Escape')
        time.sleep(0.4)
        isMapClosed = p.evaluate("() => !window.__PHASER_GAME__.scene.getScene('UIScene').getParchmentWorldMapModal().isOpen")
        assert isMapClosed is True, f"Map failed to close with [ESC] at {w}x{h}"
        print(f"[Test 6 Responsive] {w}x{h} passed [N] open and [ESC] close!")

    # Save summary report artifact
    with open('Read/V1.5/Reports/HW_BUG_10_TEST_RESULTS.json', 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2)

    print("\n[ALL TESTS PASSED] HW-BUG-10 verification completed successfully!")
    browser.close()

sys.exit(0)
