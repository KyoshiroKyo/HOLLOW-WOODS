import os
import sys
import time
import json
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5270
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def run_server():
    try:
        httpd = HTTPServer(('127.0.0.1', PORT), Handler)
        httpd.serve_forever()
    except Exception:
        pass

server_thread = threading.Thread(target=run_server, daemon=True)
server_thread.start()
print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")

VISUALS_DIR = 'Read/V1.5/Reports/Visuals/HW_BUG_17'
os.makedirs(VISUALS_DIR, exist_ok=True)
results = {}

with sync_playwright() as pw:
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    browser = pw.chromium.launch(
        executable_path=chrome_path,
        headless=True,
        args=[
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--disable-dev-shm-usage',
            '--no-sandbox'
        ]
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    console_errors = []
    page_errors = []
    failed_requests = []

    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    page.on("requestfailed", lambda req: failed_requests.append(f"{req.method} {req.url} - {req.failure}"))

    print(f"[Playwright] Loading game from http://127.0.0.1:{PORT}/?dev=1 ...")
    start_load_time = time.time()
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=35000)
    print(f"[Playwright] MainMenuScene active after {(time.time() - start_load_time)*1000:.1f}ms")

    # Start New Game
    print("[Playwright] Starting New Game...")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    print("[Playwright] GameScene active!")
    time.sleep(1.5)

    def wait_game_ready():
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=20000)
        time.sleep(0.8)

    # -------------------------------------------------------------
    # TEST 1: New Game -> Save tại Fog Crossing -> Continue
    # -------------------------------------------------------------
    print("\n--- TEST 1: New Game -> Save at Fog Crossing -> Continue ---")
    t1_before = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            cameraBounds: gs.cameras.main.getBounds()
        };
    }""")
    print(f"Test 1 Before Save: {t1_before}")

    # Save game at Fog Crossing
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleSaveManual();
    }""")
    time.sleep(0.5)

    # Reload checkpoint
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleLoadCheckpoint();
    }""")
    wait_game_ready()

    t1_after = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const camBounds = gs.cameras.main.getBounds();
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            cameraBounds: { x: camBounds.x, y: camBounds.y, width: camBounds.width, height: camBounds.height },
            matchZone: gs.currentZoneId === 'fog_crossing',
            matchStateZone: gs.playerState.getCurrentZone() === 'fog_crossing',
            validPosition: gs.player.x >= 110 && gs.player.x <= 130 && gs.player.y >= 185 && gs.player.y <= 205
        };
    }""")
    print(f"Test 1 After Continue: {t1_after}")
    results['test1'] = {
        'pass': t1_after['matchZone'] and t1_after['matchStateZone'] and t1_after['validPosition'],
        'before': t1_before,
        'after': t1_after
    }

    # -------------------------------------------------------------
    # TEST 2: Tới Bellhollow -> Save -> Reload/Continue
    # -------------------------------------------------------------
    print("\n--- TEST 2: Move to Bellhollow -> Save -> Reload/Continue ---")
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.worldBuilder.ensureZoneRendered('bellhollow');
        gs.worldBuilder.setActiveZone('bellhollow');
        gs.currentZoneId = 'bellhollow';
        gs.previousZoneId = 'bellhollow';
        gs.playerState.setCurrentZone('bellhollow');
        gs.player.setPosition(800, 260);
        if (gs.player.body) gs.player.body.reset(800, 260);
        gs.applyCameraBoundsForZone('bellhollow');
        gs.cameras.main.centerOn(800, 260);
        gs.update(0, 16);
    }""")
    time.sleep(0.5)

    # Save game at Bellhollow
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleSaveManual();
    }""")
    time.sleep(0.5)

    # Reload checkpoint
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleLoadCheckpoint();
    }""")
    wait_game_ready()

    t2_after = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const camBounds = gs.cameras.main.getBounds();
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            cameraBounds: { x: camBounds.x, y: camBounds.y, width: camBounds.width, height: camBounds.height },
            matchZone: gs.currentZoneId === 'bellhollow',
            matchStateZone: gs.playerState.getCurrentZone() === 'bellhollow',
            validPosition: Math.abs(gs.player.x - 800) <= 20 && Math.abs(gs.player.y - 260) <= 20,
            hasVisitedBellhollow: gs.playerState.hasVisitedZone('bellhollow')
        };
    }""")
    print(f"Test 2 After Continue: {t2_after}")
    results['test2'] = {
        'pass': t2_after['matchZone'] and t2_after['matchStateZone'] and t2_after['validPosition'] and t2_after['hasVisitedBellhollow'],
        'data': t2_after
    }

    # -------------------------------------------------------------
    # TEST 3: Tới Sanctuary Farm -> Save -> Reload/Continue
    # -------------------------------------------------------------
    print("\n--- TEST 3: Move to Sanctuary Farm -> Save -> Reload/Continue ---")
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.worldBuilder.ensureZoneRendered('sanctuary_farm');
        gs.worldBuilder.setActiveZone('sanctuary_farm');
        gs.currentZoneId = 'sanctuary_farm';
        gs.previousZoneId = 'sanctuary_farm';
        gs.playerState.setCurrentZone('sanctuary_farm');
        gs.player.setPosition(650, 700);
        if (gs.player.body) gs.player.body.reset(650, 700);
        gs.applyCameraBoundsForZone('sanctuary_farm');
        gs.cameras.main.centerOn(650, 700);
        gs.update(0, 16);
    }""")
    time.sleep(0.5)

    # Save game at Sanctuary Farm
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleSaveManual();
    }""")
    time.sleep(0.5)

    # Reload checkpoint
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleLoadCheckpoint();
    }""")
    wait_game_ready()

    t3_after = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const camBounds = gs.cameras.main.getBounds();
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            cameraBounds: { x: camBounds.x, y: camBounds.y, width: camBounds.width, height: camBounds.height },
            matchZone: gs.currentZoneId === 'sanctuary_farm',
            matchStateZone: gs.playerState.getCurrentZone() === 'sanctuary_farm',
            validPosition: Math.abs(gs.player.x - 650) <= 20 && Math.abs(gs.player.y - 700) <= 20,
            hasVisitedFarm: gs.playerState.hasVisitedZone('sanctuary_farm')
        };
    }""")
    print(f"Test 3 After Continue: {t3_after}")
    results['test3'] = {
        'pass': t3_after['matchZone'] and t3_after['matchStateZone'] and t3_after['validPosition'] and t3_after['hasVisitedFarm'],
        'data': t3_after
    }

    # -------------------------------------------------------------
    # TEST 4: Mở World Map trước và sau Save (đối chiếu node/marker)
    # -------------------------------------------------------------
    print("\n--- TEST 4: World Map Modal Verification (Before & After Save) ---")
    # Open map while at Sanctuary Farm
    map_before = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const mapModal = gs.uiScene.getParchmentWorldMapModal();
        mapModal.open();

        const activeZone = gs.playerState.getCurrentZone();
        const visitedZones = gs.playerState.getVisitedZones();
        const nodes = mapModal.nodes;
        const currentNode = nodes.find(n => n.id === activeZone);

        // Find beacon and label inside contentContainer
        let beaconFound = false;
        let beaconX = null;
        let beaconY = null;
        let beaconLabelText = null;

        mapModal.contentContainer.each(child => {
            if (child.text && child.text.includes('BẠN ĐANG Ở ĐÂY')) {
                beaconLabelText = child.text;
                beaconX = child.x;
                beaconY = child.y;
                beaconFound = true;
            }
        });

        return {
            isOpen: mapModal.isOpen,
            activeZone,
            visitedZones,
            discoveredCount: nodes.filter(n => visitedZones.includes(n.id)).length,
            currentNodeId: currentNode ? currentNode.id : null,
            currentNodeCanvasX: currentNode ? currentNode.canvasX : null,
            currentNodeCanvasY: currentNode ? currentNode.canvasY : null,
            beaconFound,
            beaconLabelText,
            beaconX,
            beaconY
        };
    }""")
    print(f"World Map Before Save: {map_before}")

    # Capture visual of World Map at Sanctuary Farm
    time.sleep(0.5)
    path_map_farm = f"{VISUALS_DIR}/hw_bug17_world_map_farm.png"
    page.screenshot(path=path_map_farm)
    print(f"Saved visual: {path_map_farm}")

    # Close map
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.uiScene.getParchmentWorldMapModal().close();
    }""")
    time.sleep(0.3)

    # Save & reload
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleSaveManual();
        gs.handleLoadCheckpoint();
    }""")
    wait_game_ready()

    # Re-open World Map
    map_after = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const mapModal = gs.uiScene.getParchmentWorldMapModal();
        mapModal.open();

        const activeZone = gs.playerState.getCurrentZone();
        const visitedZones = gs.playerState.getVisitedZones();
        const nodes = mapModal.nodes;
        const currentNode = nodes.find(n => n.id === activeZone);

        let beaconFound = false;
        let beaconX = null;
        let beaconY = null;
        let beaconLabelText = null;

        mapModal.contentContainer.each(child => {
            if (child.text && child.text.includes('BẠN ĐANG Ở ĐÂY')) {
                beaconLabelText = child.text;
                beaconX = child.x;
                beaconY = child.y;
                beaconFound = true;
            }
        });

        return {
            isOpen: mapModal.isOpen,
            activeZone,
            visitedZones,
            discoveredCount: nodes.filter(n => visitedZones.includes(n.id)).length,
            currentNodeId: currentNode ? currentNode.id : null,
            currentNodeCanvasX: currentNode ? currentNode.canvasX : null,
            currentNodeCanvasY: currentNode ? currentNode.canvasY : null,
            beaconFound,
            beaconLabelText,
            beaconX,
            beaconY
        };
    }""")
    print(f"World Map After Continue: {map_after}")

    # Close map
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.uiScene.getParchmentWorldMapModal().close();
    }""")

    test4_pass = (
        map_before['isOpen'] and map_after['isOpen'] and
        map_before['activeZone'] == 'sanctuary_farm' and map_after['activeZone'] == 'sanctuary_farm' and
        map_before['currentNodeId'] == 'sanctuary_farm' and map_after['currentNodeId'] == 'sanctuary_farm' and
        map_before['beaconFound'] and map_after['beaconFound'] and
        map_before['discoveredCount'] == map_after['discoveredCount']
    )
    results['test4'] = {'pass': test4_pass, 'before': map_before, 'after': map_after}

    # -------------------------------------------------------------
    # TEST 5: Mở khóa vùng qua tiến trình hợp lệ -> Save/Continue
    # -------------------------------------------------------------
    print("\n--- TEST 5: Quest Progression & Zone Gating Unlock -> Save/Continue ---")
    t5_progression = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;

        // Tiến trình: Đặt cờ hoàn thành nhiệm vụ Act 1 & mở khóa sang Outer Woods
        ps.setFlag('entered_sanctuary_farm');
        ps.setFlag('farm_cleared');
        ps.markZoneVisited('outer_woods');

        const flagsBefore = Array.from(ps.flags);
        const visitedBefore = ps.getVisitedZones();
        const unlockedBefore = ps.getUnlockedZones();

        gs.handleSaveManual();

        return {
            flagsBefore,
            visitedBefore,
            unlockedBefore
        };
    }""")

    # Reload checkpoint
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleLoadCheckpoint();
    }""")
    wait_game_ready()

    t5_restored = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;

        const flagsAfter = Array.from(ps.flags);
        const visitedAfter = ps.getVisitedZones();
        const unlockedAfter = ps.getUnlockedZones();

        return {
            flagsAfter,
            visitedAfter,
            unlockedAfter,
            farmEnteredPreserved: ps.hasFlag('entered_sanctuary_farm'),
            outerWoodsVisitedPreserved: ps.hasVisitedZone('outer_woods')
        };
    }""")
    print(f"Test 5 Progression Restoration: {t5_restored}")
    results['test5'] = {
        'pass': t5_restored['farmEnteredPreserved'] and t5_restored['outerWoodsVisitedPreserved'],
        'before': t5_progression,
        'after': t5_restored
    }

    # -------------------------------------------------------------
    # TEST 6: Restart sau khi đã đi qua nhiều vùng
    # -------------------------------------------------------------
    print("\n--- TEST 6: Restart after multi-zone exploration ---")
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.handleRestartGame();
    }""")
    wait_game_ready()

    t6_after = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;
        const camBounds = gs.cameras.main.getBounds();

        return {
            zone: gs.currentZoneId,
            playerStateZone: ps.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            visitedZones: ps.getVisitedZones(),
            flagsCount: ps.flags.size,
            isMapOpen: gs.uiScene.getParchmentWorldMapModal().isOpen,
            resetZoneMatch: gs.currentZoneId === 'fog_crossing',
            resetPosMatch: gs.player.x >= 110 && gs.player.x <= 130 && gs.player.y >= 185 && gs.player.y <= 205
        };
    }""")
    print(f"Test 6 After Restart: {t6_after}")
    results['test6'] = {
        'pass': t6_after['resetZoneMatch'] and t6_after['resetPosMatch'] and (not t6_after['isMapOpen']),
        'data': t6_after
    }

    # -------------------------------------------------------------
    # TEST 7: Đóng/mở World Map liên tục sau Continue
    # -------------------------------------------------------------
    print("\n--- TEST 7: Toggle World Map Rapidly After Continue ---")
    t7_toggle = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const mapModal = gs.uiScene.getParchmentWorldMapModal();

        const history = [];
        for (let i = 0; i < 5; i++) {
            mapModal.open();
            history.push({ step: `open_${i}`, isOpen: mapModal.isOpen, hasTween: !!mapModal.pulseTween });
            mapModal.close();
            history.push({ step: `close_${i}`, isOpen: mapModal.isOpen, hasTween: !!mapModal.pulseTween });
        }

        return {
            history,
            finalIsOpen: mapModal.isOpen,
            finalTweenCleaned: !mapModal.pulseTween
        };
    }""")
    print(f"Test 7 Rapid Toggle: finalIsOpen={t7_toggle['finalIsOpen']}, finalTweenCleaned={t7_toggle['finalTweenCleaned']}")
    results['test7'] = {
        'pass': (not t7_toggle['finalIsOpen']) and t7_toggle['finalTweenCleaned'],
        'data': t7_toggle
    }

    # -------------------------------------------------------------
    # TEST 8: Đổi tracked quest rồi mở World Map
    # -------------------------------------------------------------
    print("\n--- TEST 8: Change Tracked Quest & Verify World Map Dynamic Target ---")
    t8_data = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;
        const mapModal = gs.uiScene.getParchmentWorldMapModal();

        // 1. Chuyển sang nhiệm vụ Q02_MEET_NERIS (Mục tiêu: Làng Bellhollow)
        ps.setCurrentQuest('Q02_MEET_NERIS');
        mapModal.open();

        const quest1 = ps.getCurrentQuest();
        const subTitle1 = mapModal.subTitleText ? mapModal.subTitleText.text : '';
        let badgeText1 = null;

        mapModal.contentContainer.each(child => {
            if (child.text && child.text.includes('🎯 MỤC TIÊU')) {
                badgeText1 = child.text;
            }
        });

        // 2. Chuyển sang nhiệm vụ Q03_PREPARE_RESOURCES (Mục tiêu: Nông Trại / Rừng Ngoài)
        ps.setCurrentQuest('Q03_PREPARE_RESOURCES');
        mapModal.refreshTrackedQuest();

        const quest2 = ps.getCurrentQuest();
        const subTitle2 = mapModal.subTitleText ? mapModal.subTitleText.text : '';
        let badgeText2 = null;

        mapModal.contentContainer.each(child => {
            if (child.text && child.text.includes('🎯 MỤC TIÊU')) {
                badgeText2 = child.text;
            }
        });

        mapModal.close();

        return {
            quest1Id: quest1 ? quest1.id : null,
            subTitle1,
            badgeText1,
            quest2Id: quest2 ? quest2.id : null,
            subTitle2,
            badgeText2,
            dynamicUpdateWorking: !!badgeText1 && !!badgeText2 && subTitle1 !== subTitle2
        };
    }""")
    print(f"Test 8 Tracked Quest Dynamic Target: {t8_data}")
    results['test8'] = {
        'pass': t8_data['dynamicUpdateWorking'],
        'data': t8_data
    }

    # Save summary data
    summary_data = {
        'console_errors': console_errors,
        'page_errors': page_errors,
        'failed_requests': failed_requests,
        'results': results
    }

    with open('Read/V1.5/Reports/HW_BUG_17_SAVE_DATA.json', 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, indent=2, ensure_ascii=False)
    print("\nSaved telemetry data to Read/V1.5/Reports/HW_BUG_17_SAVE_DATA.json")

    browser.close()

print("\n--- HW-BUG-17 VERIFICATION SUMMARY ---")
print(f"Console errors: {len(console_errors)}")
print(f"Page errors: {len(page_errors)}")
print(f"Failed requests (404): {len(failed_requests)}")
for i in range(1, 9):
    key = f"test{i}"
    print(f"TEST {i} PASS: {results[key]['pass']}")
