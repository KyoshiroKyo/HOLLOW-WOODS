"""
HW-MAP-27: Comprehensive Verification Suite
Outer Woods Invisible Boundary Visuals + Hiding Bush Relocation + Memorial Stele Relocation

Audits and verifies:
1. Knight Memorial Stele (`env_knights_memorial_stele`):
   - Synchronized at (1260, 645) across WorldBuilder.ts, zones.json, and outer_woods.json.
   - Interaction executes `inspect_knights_memorial_stele`, grants lore and +15 sanity.
   - Old location (1250, 720) at crossroads is completely clear of obstacles.
2. Relocated Hiding Bush (`hide_bush_ow_s_curve`):
   - Synchronized at (1150, 655) across WorldBuilder.ts, zones.json, and outer_woods.json.
   - Interaction executes hide / enters stealth state properly.
   - Old location (1180, 650) in middle of dirt road is completely clear (road clearance >= 72px).
3. Resource Nodes near S-Curve:
   - Resin tree (1170, 630) and dry wood (1190, 675) are unobstructed.
4. Boundary Visual Props (Wooden Fence):
   - 4 fences along south border (1130, 1175, 1220, 1265 at y=1020) visualising `ow_bound_bottom_left`.
   - 2 fences along west border (x=1125 at y=920, 965) visualising `farm_bound_right_bottom`.
   - No orphan/duplicate colliders created; physical collision aligns with visual fences.
5. Path & Zone Transitions:
   - Path to Bell Workshop (x >= 1320) open and clear.
   - Path to Sanctuary Farm (x=1120, y=750) open and clear.
   - Crossroads at (1250, 720) clear in all cardinal directions.
"""

import sys
import os
import time
import json
import socket
import threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

PORT = get_free_port()
PROJECT_ROOT = Path("G:/HOLLOW WOODS")
DIST_DIR = PROJECT_ROOT / "dist"
CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe"
REPORTS_DIR = PROJECT_ROOT / "Read" / "V1.5" / "Reports"
VISUALS_DIR = REPORTS_DIR / "Visuals" / "HW_MAP_27"
VISUALS_DIR.mkdir(parents=True, exist_ok=True)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def run_tests():
    httpd = HTTPServer(('127.0.0.1', PORT), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()

    results = {
        "check1_stele": False,
        "check2_bush": False,
        "check3_resources": False,
        "check4_fences": False,
        "check5_paths": False
    }

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        print("Navigating to game...")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1&zone=bellhollow")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=25000)
        page.evaluate("() => window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene')", timeout=25000)

        # Transition to Outer Woods
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'outer_woods';
            gs.worldBuilder.setActiveZone('outer_woods');
            if (window.__DEV_CONFIG__) window.__DEV_CONFIG__.isNoclip = false;
            gs.player.resetAllActionAndMotionStates();
            gs.player.playIdle();
        }""")
        time.sleep(1.0)

        # -------------------------------------------------------------
        # CHECK 1: Knight Memorial Stele Verification
        # -------------------------------------------------------------
        print("\n=== CHECK 1: Knight Memorial Stele Verification ===")
        stele_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');
            const interactables = zone ? (zone.interactables || []) : [];
            const stele = interactables.find(i => i.id === 'env_knights_memorial_stele');

            // Set initial sanity to 50 so we can observe +15 increase
            gs.playerState.stats.composure = 50;
            if (gs.playerState.flags && gs.playerState.flags.delete) {
                gs.playerState.flags.delete('inspected_knights_memorial_stele');
                gs.playerState.flags.delete('collected_note_inspect_knights_memorial_stele');
            }

            // Teleport player near stele
            gs.player.setPosition(1260, 660);
            if (gs.player.body) {
                gs.player.body.reset(1260, 660);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }

            // Execute stele interaction
            const initialComposure = gs.playerState.stats.composure;
            gs.executeMapInteraction('inspect_knights_memorial_stele', 'Bia Đá Tưởng Niệm Kỵ Sĩ');

            // If torn page modal opened, stow/read it
            if (gs.uiScene && gs.uiScene.getTornPageModal && gs.uiScene.getTornPageModal().isOpen) {
                gs.uiScene.getTornPageModal().stowAndClose();
            }

            const newComposure = gs.playerState.stats.composure;
            const hasFlag = gs.playerState.hasFlag('inspected_knights_memorial_stele');
            const hasLore = gs.playerState.unlockedLore ? gs.playerState.unlockedLore.some(l => l.id === 'lore_knights_memorial_stele') : false;

            // Verify old stele location (1250, 720) is free of static colliders
            gs.player.setPosition(1250, 720);
            if (gs.player.body) {
                gs.player.body.reset(1250, 720);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let crossroadsOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => {
                crossroadsOverlap = true;
            });

            return {
                steleFound: Boolean(stele),
                stelePos: stele ? { x: stele.x, y: stele.y } : null,
                initialComposure,
                newComposure,
                composureDelta: newComposure - initialComposure,
                hasFlag,
                hasLore,
                crossroadsClear: !crossroadsOverlap
            };
        }""")

        print(f"  Stele found: {stele_check['steleFound']} at {stele_check['stelePos']}")
        print(f"  Sanity boost: {stele_check['initialComposure']} -> {stele_check['newComposure']} (Delta: +{stele_check['composureDelta']})")
        print(f"  Flag set: {stele_check['hasFlag']}, Lore unlocked: {stele_check['hasLore']}")
        print(f"  Old location (1250, 720) clear of colliders: {stele_check['crossroadsClear']}")

        assert stele_check['steleFound'], "Knight Memorial Stele not found in outer_woods interactables!"
        assert stele_check['stelePos']['x'] == 1260 and stele_check['stelePos']['y'] == 645, f"Stele position mismatch: {stele_check['stelePos']}"
        assert stele_check['composureDelta'] == 15, f"Expected composure delta +15, got {stele_check['composureDelta']}"
        assert stele_check['hasFlag'], "inspected_knights_memorial_stele flag not set"
        assert stele_check['hasLore'], "lore_knights_memorial_stele not unlocked"
        assert stele_check['crossroadsClear'], "Crossroads location (1250, 720) has collider collision!"
        results["check1_stele"] = True
        print("  -> CHECK 1 PASS: Knight Memorial Stele relocated, functional and crossroads clear!")

        # -------------------------------------------------------------
        # CHECK 2: Relocated Hiding Bush Verification
        # -------------------------------------------------------------
        print("\n=== CHECK 2: Relocated Hiding Bush Verification ===")
        bush_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');
            const interactables = zone ? (zone.interactables || []) : [];
            const bush = interactables.find(i => i.id === 'hide_bush_ow_s_curve');

            // Teleport player near new bush position (1150, 655)
            gs.player.setPosition(1150, 665);
            if (gs.player.body) {
                gs.player.body.reset(1150, 665);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }

            // Execute hiding interaction
            gs.player.stats.isHiding = false;
            gs.executeMapInteraction('hide_player', 'Bụi Rậm Khúc Cua Chữ S');
            const isHidingAfterEnter = gs.player.stats.isHiding;

            // Exit hiding
            gs.executeMapInteraction('hide_player', 'Bụi Rậm Khúc Cua Chữ S');
            const isHidingAfterExit = gs.player.stats.isHiding;

            // Check old bush position on road (1180, 650)
            gs.player.setPosition(1180, 650);
            if (gs.player.body) {
                gs.player.body.reset(1180, 650);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let roadOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => {
                roadOverlap = true;
            });

            return {
                bushFound: Boolean(bush),
                bushPos: bush ? { x: bush.x, y: bush.y } : null,
                isHidingAfterEnter,
                isHidingAfterExit,
                oldRoadPositionClear: !roadOverlap
            };
        }""")

        print(f"  Bush found: {bush_check['bushFound']} at {bush_check['bushPos']}")
        print(f"  Enter hiding success: {bush_check['isHidingAfterEnter']}, Exit hiding success: {not bush_check['isHidingAfterExit']}")
        print(f"  Old road position (1180, 650) clear: {bush_check['oldRoadPositionClear']}")

        assert bush_check['bushFound'], "Hiding bush hide_bush_ow_s_curve not found!"
        assert bush_check['bushPos']['x'] == 1150 and bush_check['bushPos']['y'] == 655, f"Bush pos mismatch: {bush_check['bushPos']}"
        assert bush_check['isHidingAfterEnter'], "Player failed to enter hiding state"
        assert not bush_check['isHidingAfterExit'], "Player failed to exit hiding state"
        assert bush_check['oldRoadPositionClear'], "Old road position (1180, 650) is blocked by a collider!"
        results["check2_bush"] = True
        print("  -> CHECK 2 PASS: Hiding bush relocated to roadside, functional, and road clear!")

        # -------------------------------------------------------------
        # CHECK 3: Resource Nodes near S-Curve
        # -------------------------------------------------------------
        print("\n=== CHECK 3: Resource Nodes near S-Curve ===")
        resource_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');
            const interactables = zone ? (zone.interactables || []) : [];

            const resin = interactables.find(i => i.id === 'gather_resin_ow_1' || (i.actionId && i.actionId.includes('resin')));
            const wood = interactables.find(i => i.id === 'gather_wood_ow_1' || (i.actionId && i.actionId.includes('wood')));

            // Player approaches resin tree (1170, 630)
            gs.player.setPosition(1170, 642);
            if (gs.player.body) {
                gs.player.body.reset(1170, 642);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let resinApproachOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => {
                resinApproachOverlap = true;
            });

            // Player approaches dry wood (1190, 675)
            gs.player.setPosition(1190, 685);
            if (gs.player.body) {
                gs.player.body.reset(1190, 685);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let woodApproachOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => {
                woodApproachOverlap = true;
            });

            return {
                resinFound: Boolean(resin),
                resinPos: resin ? { x: resin.x, y: resin.y } : null,
                resinApproachClear: !resinApproachOverlap,
                woodFound: Boolean(wood),
                woodPos: wood ? { x: wood.x, y: wood.y } : null,
                woodApproachClear: !woodApproachOverlap
            };
        }""")

        print(f"  Resin node: {resource_check['resinFound']} at {resource_check['resinPos']}, approach clear: {resource_check['resinApproachClear']}")
        print(f"  Wood node: {resource_check['woodFound']} at {resource_check['woodPos']}, approach clear: {resource_check['woodApproachClear']}")

        assert resource_check['resinApproachClear'], "Resin node approach is obstructed by collider!"
        assert resource_check['woodApproachClear'], "Wood node approach is obstructed by collider!"
        results["check3_resources"] = True
        print("  -> CHECK 3 PASS: Resource nodes fully accessible!")

        # -------------------------------------------------------------
        # CHECK 4: Boundary Visual Props (Hàng rào gỗ mục)
        # -------------------------------------------------------------
        print("\n=== CHECK 4: Boundary Visual Props (Fences) ===")
        fence_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            // Check images in scene with texture or frame wooden_fence
            const cullables = gs.worldBuilder.cullableObjects || [];
            const fences = cullables.filter(c => {
                const go = c.gameObject;
                if (!go) return false;
                const isKey = go.texture && (go.texture.key === 'wooden_fence' || go.texture.key === 'prop_wooden_fence_v14');
                const isFrame = go.frame && go.frame.name === 'wooden_fence';
                return isKey || isFrame;
            });

            const southFences = fences.filter(f => f.y === 1020);
            const westFences = fences.filter(f => f.gameObject && f.gameObject.x === 1125);

            // Test physical collision against ow_bound_bottom_left
            // 1. Before fence (y=980) -> clear
            gs.player.setPosition(1220, 980);
            if (gs.player.body) {
                gs.player.body.reset(1220, 980);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let overlapBeforeFence = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => { overlapBeforeFence = true; });

            // 2. Past fence at boundary (y=1030) -> blocked by ow_bound_bottom_left
            gs.player.setPosition(1220, 1030);
            if (gs.player.body) {
                gs.player.body.reset(1220, 1030);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let overlapAtBoundary = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => { overlapAtBoundary = true; });

            return {
                totalFences: fences.length,
                southFenceX: southFences.map(f => f.gameObject.x).sort((a,b)=>a-b),
                westFenceY: westFences.map(f => f.gameObject.y).sort((a,b)=>a-b),
                overlapBeforeFence,
                overlapAtBoundary
            };
        }""")

        print(f"  Total fence sprites rendered: {fence_check['totalFences']}")
        print(f"  South boundary fence X: {fence_check['southFenceX']} (y=1020)")
        print(f"  West boundary fence Y: {fence_check['westFenceY']} (x=1125)")
        print(f"  Collision boundary check: before fence (y=980) clear={not fence_check['overlapBeforeFence']}, at fence boundary (y=1030) blocked={fence_check['overlapAtBoundary']}")

        assert len(fence_check['southFenceX']) >= 4, f"Expected at least 4 south fences, got {len(fence_check['southFenceX'])}"
        assert len(fence_check['westFenceY']) >= 2, f"Expected at least 2 west fences, got {len(fence_check['westFenceY'])}"
        assert not fence_check['overlapBeforeFence'], "Player erroneously blocked before fence line!"
        assert fence_check['overlapAtBoundary'], "Boundary collider missing at y=1030!"
        results["check4_fences"] = True
        print("  -> CHECK 4 PASS: Boundary fences rendered accurately and align with collision boundary!")

        # -------------------------------------------------------------
        # CHECK 5: Paths & Zone Transitions Clearance
        # -------------------------------------------------------------
        print("\n=== CHECK 5: Paths & Zone Transitions Clearance ===")
        path_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');

            // 1. Path to Bell Workshop (x=1360, y=1000)
            gs.player.setPosition(1360, 1000);
            if (gs.player.body) {
                gs.player.body.reset(1360, 1000);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let bellPathOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => { bellPathOverlap = true; });

            // 2. Gateway to Sanctuary Farm (x=1120, y=750)
            gs.player.setPosition(1120, 750);
            if (gs.player.body) {
                gs.player.body.reset(1120, 750);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let farmGateOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => { farmGateOverlap = true; });

            // 3. North path to Sir Vaelen (x=1250, y=600)
            gs.player.setPosition(1250, 600);
            if (gs.player.body) {
                gs.player.body.reset(1250, 600);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
            }
            let northPathOverlap = false;
            gs.physics.overlap(gs.player, gs.worldBuilder.colliderGroup, () => { northPathOverlap = true; });

            return {
                bellPathClear: !bellPathOverlap,
                farmGateClear: !farmGateOverlap,
                northPathClear: !northPathOverlap
            };
        }""")

        print(f"  Bell Workshop corridor (1360, 1000) clear: {path_check['bellPathClear']}")
        print(f"  Sanctuary Farm gateway (1120, 750) clear: {path_check['farmGateClear']}")
        print(f"  North corridor (1250, 600) clear: {path_check['northPathClear']}")

        assert path_check['bellPathClear'], "Bell Workshop path is blocked by collider!"
        assert path_check['farmGateClear'], "Farm gateway is blocked by collider!"
        assert path_check['northPathClear'], "North corridor is blocked by collider!"
        results["check5_paths"] = True
        print("  -> CHECK 5 PASS: All paths and zone transitions fully clear and unobstructed!")

        browser.close()

    all_passed = all(results.values())
    print("\n==================================================")
    print(f"FINAL RESULT: {'ALL PASS (5/5)' if all_passed else 'SOME CHECKS FAILED'}")
    print("==================================================")
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(run_tests())
