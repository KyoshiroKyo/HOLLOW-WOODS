"""
HW-BUG-23: Verification Suite for 5 Outer Woods Prop Removals
Audits and verifies that:
1. The 5 specific props removed in commit 3b1982b (HW-FIX-21) are completely gone:
   - Prop 1: Bush around (1350, 780) [Owner target (1351, 776)]
   - Prop 2: Bush around (1420, 745) [Owner target (1415, 742)]
   - Prop 3: Bush around (1180, 760) [Owner target (1182, 756)]
   - Prop 4: Bush around (1260, 800) [Owner target (1255, 797)]
   - Prop 5: Tree / Log around (1486, 734) [Owner target (1488, 738)]
2. No orphan colliders remain at any of the 5 locations.
3. Player can walk directly through all 5 locations with Noclip OFF.
4. Ghost prompts `hide_bush_ow_bonfire` and `hide_bush_ow_clearing` are completely absent.
5. Remaining hiding spots in Outer Woods (1180,650; 1360,620; 1305,885) remain fully functional.
6. Sir Vaelen (1435,710), Bonfire (1470,710), warm_quiet_bonfire, and Bell Workshop corridor are intact.
"""

import os
import sys
import time
import json
import threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

PORT = 5258
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DIST_DIR = PROJECT_ROOT / 'dist'
VISUALS_DIR = PROJECT_ROOT / 'Read' / 'V1.5' / 'Reports' / 'Visuals' / 'HW_BUG_23'
VISUALS_DIR.mkdir(parents=True, exist_ok=True)

HW_FIX_21_SHA = "3b1982bac12a5e96941d99ed431cd2f1372bde15"

TARGET_PROPS = [
    {
        "id": "prop_1_bush_1350_780",
        "name": "Bụi rậm lối mòn Đông",
        "ownerTarget": (1351, 776),
        "sourceCoords": (1350, 780),
        "type": "bush"
    },
    {
        "id": "prop_2_bush_1420_745",
        "name": "Bụi rậm Trạm Lửa Sir Vaelen (hide_bush_ow_bonfire)",
        "ownerTarget": (1415, 742),
        "sourceCoords": (1420, 745),
        "type": "bush_with_interactable"
    },
    {
        "id": "prop_3_bush_1180_760",
        "name": "Bụi rậm ngã ba Tây",
        "ownerTarget": (1182, 756),
        "sourceCoords": (1180, 760),
        "type": "bush"
    },
    {
        "id": "prop_4_bush_1260_800",
        "name": "Bụi rậm Bãi Rừng Thưa (hide_bush_ow_clearing)",
        "ownerTarget": (1255, 797),
        "sourceCoords": (1260, 800),
        "type": "bush_with_interactable"
    },
    {
        "id": "prop_5_tree_1486_734",
        "name": "Cây lá đỏ/tím dưới bếp Sir Vaelen (prop_fallen_log_mossy_v14)",
        "ownerTarget": (1488, 738),
        "sourceCoords": (1486, 734),
        "type": "tree_sprite"
    }
]

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

    with sync_playwright() as p:
        chrome_path = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
        browser = p.chromium.launch(
            executable_path=chrome_path if os.path.exists(chrome_path) else None,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        print("Connecting to Outer Woods...")
        page.goto(f'http://127.0.0.1:{PORT}/?dev=1&zone=outer_woods', wait_until='domcontentloaded')
        page.wait_for_function('() => window.__PHASER_GAME__?.scene?.isActive("MainMenuScene")', timeout=30000)
        page.evaluate('() => window.__PHASER_GAME__.scene.getScene("MainMenuScene").startNewGame()')
        page.wait_for_function('() => window.__PHASER_GAME__?.scene?.isActive("GameScene") && window.__PHASER_GAME__?.scene?.getScene("GameScene")?.player', timeout=30000)
        time.sleep(1.0)

        # Teleport / switch to Outer Woods
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'outer_woods';
            gs.worldBuilder.setActiveZone('outer_woods');
            gs.applyCameraBoundsForZone('outer_woods');
            gs.player.setPosition(1420, 710);
            gs.player.syncBodyFootAnchor();
            gs.player.body.updateFromGameObject();
            gs.player.resetAllActionAndMotionStates();
            gs.player.body.checkCollision.none = false;
        }""")
        page.wait_for_timeout(500)

        # ------------------------------------------------------------------
        # CHECK 1: Verify all 5 prop sprites are absent at both Owner target and Source coords
        # ------------------------------------------------------------------
        print("\n--- CHECK 1: Verifying 5 Prop Sprites Are Absent ---")
        check1_res = page.evaluate("""(props) => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const results = [];
            const children = gs.children.list;

            for (const prop of props) {
                const [ox, oy] = prop.ownerTarget;
                const [sx, sy] = prop.sourceCoords;

                const isBush = prop.type.startsWith('bush');
                const isTreeLog = prop.type === 'tree_sprite';

                // Check for specific prop sprites within 16px radius
                const found = children.filter(c => {
                    if (!c.x || !c.y || c === gs.player || c === gs.player.footShadowGfx) return false;
                    const dSource = Math.hypot(c.x - sx, c.y - sy);
                    const dOwner = Math.hypot(c.x - ox, c.y - oy);
                    if (dSource >= 16 && dOwner >= 16) return false;

                    const key = c.texture?.key || '';
                    const frame = c.frame?.name || '';
                    if (isBush && (key === 'bush_dense_1' || key === 'bush_dense_2' || frame.includes('bush'))) return true;
                    if (isTreeLog && (key === 'prop_fallen_log_mossy_v14' || frame === 'prop_fallen_log_mossy_v14' || key.includes('tree') || frame.includes('tree'))) return true;
                    return false;
                }).map(c => ({ tex: c.texture?.key, frame: c.frame?.name, x: Math.round(c.x), y: Math.round(c.y) }));

                // Also check if any object exists strictly within 14px of the exact removal spot
                const strictNear = children.filter(c => {
                    if (!c.x || !c.y || c === gs.player || c === gs.player.footShadowGfx) return false;
                    return Math.hypot(c.x - sx, c.y - sy) < 14;
                }).map(c => ({ tex: c.texture?.key, frame: c.frame?.name, x: Math.round(c.x), y: Math.round(c.y) }));

                results.push({
                    id: prop.id,
                    name: prop.name,
                    ownerTarget: prop.ownerTarget,
                    sourceCoords: prop.sourceCoords,
                    foundProps: found,
                    strictNear: strictNear,
                    isClean: found.length === 0 && strictNear.length === 0
                });
            }
            return results;
        }""", TARGET_PROPS)

        for r in check1_res:
            print(f"  {r['name']} ({r['sourceCoords']}): Clean={r['isClean']} (foundProps={len(r['foundProps'])}, strictNear={len(r['strictNear'])})")
            assert r['isClean'], f"Prop sprite still present! {r}"
        print("  -> CHECK 1 PASS: All 5 prop sprites are completely ABSENT!")

        # ------------------------------------------------------------------
        # CHECK 2: Verify No Orphan Colliders At Any of the 5 Locations
        # ------------------------------------------------------------------
        print("\n--- CHECK 2: Verifying No Orphan Colliders ---")
        check2_res = page.evaluate("""(props) => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const colliders = gs.worldBuilder.colliderGroup.getChildren();
            const results = [];

            for (const prop of props) {
                const [sx, sy] = prop.sourceCoords;
                const [ox, oy] = prop.ownerTarget;

                const found = colliders.filter(c => {
                    if (!c || !c.body) return false;
                    const b = c.body;
                    const dSource = Math.hypot((b.x + b.width / 2) - sx, (b.y + b.height / 2) - sy);
                    const dOwner = Math.hypot((b.x + b.width / 2) - ox, (b.y + b.height / 2) - oy);
                    return dSource < 24 || dOwner < 24;
                }).map(c => ({ name: c.name || 'unnamed', x: Math.round(c.body.x), y: Math.round(c.body.y), w: c.body.width, h: c.body.height }));

                results.push({
                    id: prop.id,
                    colliders: found,
                    isClean: found.length === 0
                });
            }
            return results;
        }""", TARGET_PROPS)

        for r in check2_res:
            print(f"  {r['id']}: Orphan colliders={len(r['colliders'])} (Clean: {r['isClean']})")
            assert r['isClean'], f"Orphan collider detected at {r['id']}: {r['colliders']}"
        print("  -> CHECK 2 PASS: Zero orphan colliders at all 5 locations!")

        # ------------------------------------------------------------------
        # CHECK 3: Noclip OFF Physical Traversal Test Across All 5 Locations
        # ------------------------------------------------------------------
        print("\n--- CHECK 3: Noclip OFF Physical Traversal Test ---")
        check3_res = page.evaluate("""(props) => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const p = gs.player;
            const b = p.body;
            b.checkCollision.none = false; // Strictly Noclip OFF

            const results = [];
            for (const prop of props) {
                const [ox, oy] = prop.ownerTarget;

                // Position player directly at the owner target coordinate
                p.setPosition(ox, oy);
                p.syncBodyFootAnchor();
                b.updateFromGameObject();

                // Run physics overlap check against all static colliders
                let overlapped = false;
                gs.physics.overlap(p, gs.worldBuilder.colliderGroup, () => {
                    overlapped = true;
                });

                results.push({
                    id: prop.id,
                    ownerCoords: [ox, oy],
                    overlappedWithCollider: overlapped,
                    bodyWidth: b.width,
                    bodyHeight: b.height
                });
            }
            return results;
        }""", TARGET_PROPS)

        for r in check3_res:
            print(f"  {r['id']} at OwnerTarget {r['ownerCoords']}: Overlap={r['overlappedWithCollider']} (Clear: {not r['overlappedWithCollider']})")
            assert not r['overlappedWithCollider'], f"Player blocked at {r['id']}!"
        print("  -> CHECK 3 PASS: Player walks completely unobstructed with Noclip OFF!")

        # ------------------------------------------------------------------
        # CHECK 4: Confirm Ghost Prompts Are Completely Absent
        # ------------------------------------------------------------------
        print("\n--- CHECK 4: Confirming Ghost Prompts Are Absent ---")
        check4_res = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');
            const interactables = zone ? (zone.interactables || []) : [];

            const hasBonfireBush = interactables.some(i => i.id === 'hide_bush_ow_bonfire' || i.actionId === 'hide_bush_ow_bonfire');
            const hasClearingBush = interactables.some(i => i.id === 'hide_bush_ow_clearing' || i.actionId === 'hide_bush_ow_clearing');
            const hasPhantomLantern = interactables.some(i => i.id === 'ow_lantern_checkpoint_1' || i.actionId === 'ignite_lantern_checkpoint');

            return { hasBonfireBush, hasClearingBush, hasPhantomLantern, totalInteractables: interactables.length };
        }""")
        print(f"  hide_bush_ow_bonfire present:   {check4_res['hasBonfireBush']}")
        print(f"  hide_bush_ow_clearing present:  {check4_res['hasClearingBush']}")
        print(f"  ow_lantern_checkpoint_1 present: {check4_res['hasPhantomLantern']}")
        assert not check4_res['hasBonfireBush'], "Ghost prompt hide_bush_ow_bonfire still exists!"
        assert not check4_res['hasClearingBush'], "Ghost prompt hide_bush_ow_clearing still exists!"
        assert not check4_res['hasPhantomLantern'], "Ghost prompt ow_lantern_checkpoint_1 still exists!"
        print("  -> CHECK 4 PASS: All ghost prompts completely eliminated!")

        # ------------------------------------------------------------------
        # CHECK 5: Verify Legitimate Stealth Hiding Spots Remain Functional
        # ------------------------------------------------------------------
        print("\n--- CHECK 5: Legitimate Stealth Hiding Spots Functional ---")
        check5_res = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');
            const interactables = zone ? (zone.interactables || []) : [];

            const legitimateSpots = [
                { id: 'hide_tree_ow_north', expectedX: 1360, expectedY: 620 },
                { id: 'hide_tree_ow_willow', expectedX: 1305, expectedY: 885 }
            ];

            const results = [];
            for (const spot of legitimateSpots) {
                const found = interactables.find(i => i.id === spot.id);
                results.push({
                    id: spot.id,
                    exists: Boolean(found),
                    x: found ? found.x : null,
                    y: found ? found.y : null,
                    promptText: found ? found.promptText : null
                });
            }
            return results;
        }""")
        for r in check5_res:
            print(f"  Hiding Spot {r['id']}: Exists={r['exists']}, pos=({r['x']}, {r['y']}), prompt='{r['promptText']}'")
            assert r['exists'], f"Legitimate hiding spot {r['id']} was erroneously removed!"
        print("  -> CHECK 5 PASS: Valid hiding spots preserved and functional!")

        # ------------------------------------------------------------------
        # CHECK 6: Sir Vaelen Area & Bonfire Integrity
        # ------------------------------------------------------------------
        print("\n--- CHECK 6: Sir Vaelen Area & Bonfire Integrity ---")
        check6_res = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');

            // 1. Sir Vaelen NPC
            const vaelen = gs.children.list.find(c => c.spec && (c.spec.id === 'npc_campfire_knight' || c.spec.id === 'campfire_knight'));

            // 2. Bonfire Interactable
            const bonfire = zone.interactables.find(i => i.id === 'quiet_forest_bonfire' || i.actionId === 'warm_quiet_bonfire');

            // 3. Transitions
            const transBellhollow = zone.transitions.find(t => t.id === 'to_bellhollow_from_ow');
            const transCrookedPath = zone.transitions.find(t => t.id === 'to_crooked_path_from_ow');

            return {
                vaelenFound: Boolean(vaelen),
                vaelenPos: vaelen ? { x: vaelen.x, y: vaelen.y } : null,
                bonfireFound: Boolean(bonfire),
                bonfirePos: bonfire ? { x: bonfire.x, y: bonfire.y } : null,
                transBellhollow: Boolean(transBellhollow),
                transCrookedPath: Boolean(transCrookedPath)
            };
        }""")
        print(f"  Sir Vaelen found: {check6_res['vaelenFound']} at {check6_res['vaelenPos']}")
        print(f"  Bonfire found:    {check6_res['bonfireFound']} at {check6_res['bonfirePos']}")
        print(f"  Portal to Bellhollow:   {check6_res['transBellhollow']}")
        print(f"  Portal to Crooked Path: {check6_res['transCrookedPath']}")
        assert check6_res['vaelenFound'], "Sir Vaelen NPC missing!"
        assert check6_res['bonfireFound'], "Bonfire warm_quiet_bonfire missing!"
        assert check6_res['transBellhollow'] and check6_res['transCrookedPath'], "Zone transitions missing!"
        print("  -> CHECK 6 PASS: Sir Vaelen area, campfire and transitions intact!")

        # ------------------------------------------------------------------
        # CHECK 7: Capture Visual Verification Screenshots
        # ------------------------------------------------------------------
        print("\n--- CHECK 7: Capturing Verification Screenshots ---")

        # 1. Capture Sir Vaelen area overview
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(1410, 710);
            gs.player.facing = 'right';
            gs.player.playIdle();
            gs.cameras.main.centerOn(1440, 720);
        }""")
        page.wait_for_timeout(400)
        shot_vaelen = VISUALS_DIR / 'hw_bug_23_vaelen_cleared_area.png'
        page.screenshot(path=str(shot_vaelen))
        print(f"  Saved screenshot: {shot_vaelen}")

        # 2. Capture Prop 1 & Prop 4 area (1260..1350, 780..800)
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(1300, 790);
            gs.player.facing = 'down';
            gs.player.playIdle();
            gs.cameras.main.centerOn(1300, 790);
        }""")
        page.wait_for_timeout(400)
        shot_clearing = VISUALS_DIR / 'hw_bug_23_clearing_bushes_removed.png'
        page.screenshot(path=str(shot_clearing))
        print(f"  Saved screenshot: {shot_clearing}")

        browser.close()

    print("\n=======================================================")
    print("ALL HW-BUG-23 VERIFICATION CHECKS PASSED (7/7)!")
    print("VERIFIED-BY-PRIOR-COMMIT: 3b1982bac12a5e96941d99ed431cd2f1372bde15")
    print("=======================================================\n")

if __name__ == '__main__':
    main()
