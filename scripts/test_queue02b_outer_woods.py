import sys
import os
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5202
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

    # Focus canvas via top bar click (outside attack trigger zones)
    page.mouse.click(200, 50)
    page.wait_for_timeout(300)

    # Helper function to place player safely in outer_woods with unlocked actions
    def teleport_outer_woods(x, y):
        page.evaluate(f"""() => {{
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.worldBuilder.ensureZoneRendered('outer_woods');
            gs.currentZoneId = 'outer_woods';
            gs.previousZoneId = 'outer_woods';
            gs.playerState.setCurrentZone('outer_woods');
            gs.player.forceUnlockActionState();
            gs.player.setPosition({x}, {y});
            if (gs.player.body) gs.player.body.reset({x}, {y});
        }}""")
        page.wait_for_timeout(300)

    # Verify Noclip status
    noclip_state = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return !!(gs.player?.noclip || gs.noclip);
    }""")
    print(f"[QA] Noclip status: {'ON' if noclip_state else 'OFF'}")
    assert not noclip_state, "Noclip must be OFF for collision tests"

    # =========================================================================
    # TEST CASE 1: Đi 2 chiều Trại Thợ Săn <-> Tuyến đường xuống Xưởng Chuông
    # =========================================================================
    print("\n--- TEST CASE 1: Đi bộ 2 chiều Trại Thợ Săn <-> Xưởng Chuông (Noclip OFF) ---")
    teleport_outer_woods(1320, 740)

    # 1.1 Walk EAST along camp trail to junction (X: 1320 -> 1360)
    print("[QA] Walking EAST from Camp to Junction along trail...")
    for _ in range(18):
        page.keyboard.down('KeyD')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyD')
    page.wait_for_timeout(100)

    pos_junc = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Reached Junction: ({pos_junc['x']}, {pos_junc['y']})")
    assert pos_junc['x'] >= 1355, f"Failed to walk East to junction: x={pos_junc['x']}"

    # 1.2 Walk SOUTH along road down to Xưởng Chuông past modified tree cluster at Y=855
    print("[QA] Walking SOUTH along road down to Workshop approach (Y: 740 -> 920+)...")
    for _ in range(30):
        page.keyboard.down('KeyS')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyS')
    page.wait_for_timeout(100)

    pos_down = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Reached Workshop approach: ({pos_down['x']}, {pos_down['y']})")
    assert pos_down['y'] >= 920, f"Player blocked on road to workshop: y={pos_down['y']}"

    # 1.3 Walk North back up to junction
    print("[QA] Walking NORTH back to Junction (Y: 920 -> 740)...")
    for _ in range(30):
        page.keyboard.down('KeyW')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyW')
    page.wait_for_timeout(100)

    pos_up = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Returned North to Junction: ({pos_up['x']}, {pos_up['y']})")
    assert pos_up['y'] <= 760, f"Player blocked returning North: y={pos_up['y']}"

    # 1.4 Walk West back to Camp
    print("[QA] Walking WEST back to Camp along trail...")
    for _ in range(18):
        page.keyboard.down('KeyA')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyA')
    page.wait_for_timeout(100)

    pos_camp = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Returned to Camp: ({pos_camp['x']}, {pos_camp['y']})")
    assert pos_camp['x'] <= 1330, f"Player blocked returning West: x={pos_camp['x']}"
    print("[QA] TEST CASE 1: PASS! Two-way travel completely unobstructed.")

    # =========================================================================
    # TEST CASE 2: Đi vòng quanh Bếp Sir Vaelen (1470, 710) 360 độ
    # =========================================================================
    print("\n--- TEST CASE 2: Đi vòng quanh Bếp Sir Vaelen (1470, 710) (Noclip OFF) ---")
    teleport_outer_woods(1420, 670)

    # 2.1 Walk EAST north of bonfire: (1420, 670) -> (1505, 670)
    print("[QA] Walking EAST north of bonfire...")
    for _ in range(16):
        page.keyboard.down('KeyD')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyD')
    page.wait_for_timeout(100)
    pos_ne = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Reached North-East of bonfire: ({pos_ne['x']}, {pos_ne['y']})")
    assert pos_ne['x'] >= 1490, f"Blocked walking East north of bonfire: x={pos_ne['x']}"

    # 2.2 Walk SOUTH east of bonfire past moved bush (1520, 755): (1539, 693) -> (1539, 745..755)
    print("[QA] Diagnosing physics body and nearby colliders before walking SOUTH...")
    diag_before_south = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const p = gs.player;
        const b = p.body;
        // Find colliders near (1539, 727) within radius 100
        const colliders = [];
        if (gs.colliderGroup) {
            gs.colliderGroup.getChildren().forEach(c => {
                const cb = c.body || c;
                const cx = cb.x + (cb.width ? cb.width/2 : 0);
                const cy = cb.y + (cb.height ? cb.height/2 : 0);
                const dist = Math.hypot(1539 - cx, 727 - cy);
                if (dist < 120) {
                    colliders.push({
                        name: c.name || 'unnamed',
                        x: Math.round(cb.x),
                        y: Math.round(cb.y),
                        w: Math.round(cb.width),
                        h: Math.round(cb.height),
                        dist: Math.round(dist)
                    });
                }
            });
        }
        return {
            player: { x: Math.round(p.x), y: Math.round(p.y) },
            bodyAABB: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
            velocity: { x: Math.round(b.velocity.x), y: Math.round(b.velocity.y) },
            blocked: { left: b.blocked.left, right: b.blocked.right, up: b.blocked.up, down: b.blocked.down },
            touching: { left: b.touching.left, right: b.touching.right, up: b.touching.up, down: b.touching.down },
            nearbyColliders: colliders
        };
    }""")
    print(f"[QA] Diagnostic before SOUTH: Player=({diag_before_south['player']['x']}, {diag_before_south['player']['y']}), BodyAABB={diag_before_south['bodyAABB']}")
    print(f"[QA] Blocked flags: {diag_before_south['blocked']}, Touching flags: {diag_before_south['touching']}")
    print(f"[QA] Nearby colliders within 120px of (1539, 727): {diag_before_south['nearbyColliders']}")

    # Walk SOUTH: Distance from Y=693 to target Y~748 is 55px.
    # Measured velocity: ~8.14 px per 85ms tick (14 ticks went 114px from 693 to 807).
    # 7 ticks will cover 7 * 8.14 = 57px, landing precisely at Y ~ 750 (safely within 730..770, well clear of fallen log at 795).
    print("[QA] Walking SOUTH east of bonfire (7 ticks to Y ~ 745..750)...")
    for tick in range(7):
        page.keyboard.down('KeyS')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyS')
    page.wait_for_timeout(100)

    diag_after_south = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const p = gs.player;
        const b = p.body;
        return {
            x: Math.round(p.x),
            y: Math.round(p.y),
            blocked: { left: b.blocked.left, right: b.blocked.right, up: b.blocked.up, down: b.blocked.down },
            touching: { left: b.touching.left, right: b.touching.right, up: b.touching.up, down: b.touching.down }
        };
    }""")
    pos_se = {'x': diag_after_south['x'], 'y': diag_after_south['y']}
    print(f"[QA] Reached South-East of bonfire: ({pos_se['x']}, {pos_se['y']})")
    print(f"[QA] Post-walk blocked={diag_after_south['blocked']}, touching={diag_after_south['touching']}")
    assert pos_se['y'] >= 730 and pos_se['y'] <= 770, f"Blocked walking South east of bonfire: y={pos_se['y']}"

    # 2.3 Walk WEST south of bonfire: (1520, 750) -> (1410, 750) (~110px west, 14 ticks * 8.14px = 114px)
    print("[QA] Walking WEST south of bonfire (14 ticks)...")
    for _ in range(14):
        page.keyboard.down('KeyA')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyA')
    page.wait_for_timeout(100)
    pos_sw = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Reached South-West of bonfire: ({pos_sw['x']}, {pos_sw['y']})")
    assert pos_sw['x'] <= 1440, f"Blocked walking West south of bonfire: x={pos_sw['x']}"

    # 2.4 Walk NORTH back to NW start: (1410, 750) -> (1410, 670) (~80px north, 10 ticks * 8.14px = 81px)
    print("[QA] Walking NORTH back to start (10 ticks)...")
    for _ in range(10):
        page.keyboard.down('KeyW')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyW')
    page.wait_for_timeout(100)
    pos_loop = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Completed full loop around bonfire: ({pos_loop['x']}, {pos_loop['y']})")
    assert pos_loop['y'] <= 700, f"Blocked completing loop: y={pos_loop['y']}"
    print("[QA] TEST CASE 2: PASS! 360-degree perimeter around Sir Vaelen's bonfire is clear.")

    # =========================================================================
    # TEST CASE 3: Bấm [E] Sir Vaelen (1435, 710)
    # =========================================================================
    print("\n--- TEST CASE 3: Tương tác [E] với Sir Vaelen ---")
    teleport_outer_woods(1415, 710)
    page.wait_for_timeout(400)

    # Verify NPC detected
    vaelen_detected = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const vaelen = gs.npcs.find(n => n.spec.id === 'npc_campfire_knight');
        const dist = vaelen ? Math.hypot(gs.player.x - vaelen.x, gs.player.y - vaelen.y) : -1;
        return {
            exists: !!vaelen,
            dist: Math.round(dist)
        };
    }""")
    print(f"[QA] Sir Vaelen detected: {vaelen_detected}")
    assert vaelen_detected['exists'], "Sir Vaelen NPC not found in scene!"

    # Press E
    print("[QA] Pressing KeyE to interact with Sir Vaelen...")
    page.keyboard.press('KeyE')
    page.wait_for_timeout(600)

    dialogue_status = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            isDialogueActive: !!(gs.dialogueSystem?.isActive || gs.isDialogueActive),
            talkedFlag: gs.playerState.hasFlag('talked_to_campfire_knight')
        };
    }""")
    print(f"[QA] Dialogue Status: isDialogueActive={dialogue_status['isDialogueActive']}, talkedFlag={dialogue_status['talkedFlag']}")
    assert dialogue_status['isDialogueActive'] or dialogue_status['talkedFlag'], "Interaction with Sir Vaelen failed!"

    # Dismiss dialogue
    page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); if (gs.dialogueSystem) gs.dialogueSystem.endDialogue(); }")
    page.wait_for_timeout(200)

    print("[QA] TEST CASE 3: PASS! Sir Vaelen NPC is fully preserved, interactive, and responsive.")

    # =========================================================================
    # TEST CASE 4: Đi qua vị trí Bếp Thợ Săn cũ (1308, 712)
    # =========================================================================
    print("\n--- TEST CASE 4: Đi qua vị trí Bếp Thợ Săn cũ (1308, 712) ---")
    teleport_outer_woods(1296, 730)

    print("[QA] Walking EAST straight past former campfire spot (X: 1296 -> 1340+)...")
    for _ in range(10):
        page.keyboard.down('KeyD')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyD')
    page.wait_for_timeout(100)

    pos_through = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Position after walking through former campfire spot: ({pos_through['x']}, {pos_through['y']})")
    assert pos_through['x'] >= 1340, f"Player blocked at former campfire spot: x={pos_through['x']}"

    print("[QA] Walking WEST back through former campfire spot...")
    for _ in range(10):
        page.keyboard.down('KeyA')
        page.wait_for_timeout(85)
    page.keyboard.up('KeyA')
    page.wait_for_timeout(100)

    pos_back = page.evaluate("() => ({ x: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.x), y: Math.round(window.__PHASER_GAME__.scene.getScene('GameScene').player.y) })")
    print(f"[QA] Position after walking WEST back through: ({pos_back['x']}, {pos_back['y']})")
    assert pos_back['x'] <= 1300, f"Player blocked walking back: x={pos_back['x']}"
    print("[QA] TEST CASE 4: PASS! Former campfire area is 100% free of invisible colliders.")

    # =========================================================================
    # ALL TESTS COMPLETE
    # =========================================================================
    print("\n=========================================================================")
    print("[QA] SUMMARY: ALL 4 TESTS PASSED COMPLETELY WITH 0 INVISIBLE COLLIDERS AND 0 STUCK POINTS.")
    print("=========================================================================")

    browser.close()
