#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit_part_d_e_playwright.py
Part D: Actual Physical Walk Test across 5 Outer Woods routes (bidirectional, noclip OFF)
Part E: Visual Composition Audit at 5 target coordinates with F9 ON/OFF
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

PROJECT_ROOT = Path("G:/HOLLOW WOODS")
DIST_DIR = PROJECT_ROOT / "dist"
CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe"
REPORTS_DIR = PROJECT_ROOT / "Read" / "V1.5" / "Reports"
VISUALS_DIR = REPORTS_DIR / "Visuals" / "HW_MAP_ASSET_33"
VISUALS_DIR.mkdir(parents=True, exist_ok=True)

def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('127.0.0.1', 0))
    port = s.getsockname()[1]
    s.close()
    return port

PORT = get_free_port()

class StaticHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def main():
    print(f"Starting local server for {DIST_DIR} on port {PORT}...")
    httpd = HTTPServer(('127.0.0.1', PORT), StaticHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    routes_data = [
        {
            "id": "route_1",
            "name": "Route 1: North Entry <-> Hunter Camp (S-Curve)",
            "waypoints": [[1210, 580], [1170, 625], [1165, 685], [1210, 725], [1260, 745], [1330, 745]]
        },
        {
            "id": "route_2",
            "name": "Route 2: Camp <-> Junction <-> Sir Vaelen Interaction Spot",
            "waypoints": [[1330, 745], [1360, 755], [1410, 755], [1435, 730], [1435, 726]]
        },
        {
            "id": "route_3",
            "name": "Route 3: Junction <-> Bell Workshop corridor",
            "waypoints": [[1330, 745], [1360, 760], [1360, 840], [1360, 920], [1360, 980], [1360, 1000]]
        },
        {
            "id": "route_4",
            "name": "Route 4: Willow Clearing & Forest Edge",
            "waypoints": [[1330, 745], [1270, 745], [1265, 820], [1260, 910], [1240, 930]]
        },
        {
            "id": "route_5",
            "name": "Route 5: Willow Edge Loop -> Workshop Corridor",
            "waypoints": [[1240, 930], [1270, 940], [1300, 950], [1340, 980], [1360, 1000]]
        }
    ]

    visual_targets = [
        {"id": "ow_1187_621", "name": "S-Curve Entrance & Pine Trees", "x": 1187, "y": 621},
        {"id": "ow_1283_923", "name": "Southern Clearing & Willow Approach", "x": 1283, "y": 923},
        {"id": "ow_willow_1200_915", "name": "Ancient Weeping Willow Landmark", "x": 1200, "y": 915},
        {"id": "ow_hollow_tree_1305_885", "name": "Willow Hollow Tree Hiding Spot", "x": 1305, "y": 885},
        {"id": "ow_signpost_1300_985", "name": "Bell Workshop Descent Signpost", "x": 1300, "y": 985}
    ]

    audit_report = {
        "part_d_physical_walk": {},
        "part_e_visual_composition": {},
        "interactables_tested": {},
        "summary": {}
    }

    with sync_playwright() as pw:
        print("Launching headless Chromium...")
        browser = pw.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        print("Loading game...")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1&zone=bellhollow")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=25000)
        page.evaluate("() => window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene')", timeout=25000)

        # Transition to Outer Woods & configure test flags
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'outer_woods';
            gs.worldBuilder.setActiveZone('outer_woods');
            if (window.__DEV_CONFIG__) window.__DEV_CONFIG__.isNoclip = false;
            // Prevent zone auto-switching during physical corridor geometry walking
            gs.transitionCooldown = 9999999;
            gs.transitionCooldownUntil = performance.now() + 9999999;
            gs.player.resetAllActionAndMotionStates();
            gs.player.playIdle();
        }""")
        time.sleep(1.0)

        # =========================================================================
        # PART D: ACTUAL PHYSICAL WALK TEST (BIDIRECTIONAL, NOCLIP OFF)
        # =========================================================================
        print("\n==================================================================")
        print("PART D: ACTUAL PHYSICAL WALK TEST (CONTINUOUS, NOCLIP OFF)")
        print("==================================================================")

        for route in routes_data:
            rid = route["id"]
            rname = route["name"]
            fwd_pts = route["waypoints"]
            rev_pts = list(reversed(fwd_pts))

            print(f"\n--- Testing {rname} ---")

            for direction, waypoints in [("FORWARD", fwd_pts), ("REVERSE", rev_pts)]:
                print(f"  Direction: {direction} ({len(waypoints)} waypoints)")

                run_result = page.evaluate("""async (pts) => {
                    const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                    const p = gs.player;
                    const b = p.body;
                    b.checkCollision.none = false; // Strictly Noclip OFF

                    // Set initial spawn position for start of route ONLY
                    const [startX, startY] = pts[0];
                    p.setPosition(startX, startY);
                    b.reset(startX, startY);
                    p.syncBodyFootAnchor();
                    b.updateFromGameObject();

                    const waypointsResults = [];
                    let totalDistanceTraversed = 0;
                    let totalBlockedTimeMs = 0;
                    let lastX = p.x;
                    let lastY = p.y;
                    let allWaypointsReached = true;

                    // Walk continuously from waypoint to waypoint
                    for (let i = 1; i < pts.length; i++) {
                        const [targetX, targetY] = pts[i];
                        const wpStartTime = performance.now();
                        let wpReached = false;
                        let wpBlockedTime = 0;
                        const speed = 100; // px/sec locomotion speed
                        let framesSinceProgress = 0;
                        let prevDist = Math.hypot(targetX - p.x, targetY - p.y);

                        while (performance.now() - wpStartTime < 8000) { // max 8s per waypoint segment
                            const dx = targetX - p.x;
                            const dy = targetY - p.y;
                            const dist = Math.hypot(dx, dy);

                            if (dist <= 10.0) { // Reached within 10px target radius
                                wpReached = true;
                                break;
                            }

                            // Normalized velocity towards target
                            const vx = (dx / dist) * speed;
                            const vy = (dy / dist) * speed;
                            b.setVelocity(vx, vy);

                            // Wait for next animation frame / physics step
                            await new Promise(r => requestAnimationFrame(r));

                            // Accumulate physical distance traversed
                            const dTraveled = Math.hypot(p.x - lastX, p.y - lastY);
                            totalDistanceTraversed += dTraveled;

                            // Check physical body collision contact
                            const isContact = (b.blocked.left || b.blocked.right || b.blocked.up || b.blocked.down ||
                                               b.touching.left || b.touching.right || b.touching.up || b.touching.down);

                            if (dTraveled < 0.25) {
                                framesSinceProgress++;
                                if (isContact) {
                                    wpBlockedTime += 16.6;
                                    totalBlockedTimeMs += 16.6;
                                }
                            } else {
                                framesSinceProgress = 0;
                            }

                            // If stuck against obstacle for more than 1.5 seconds (90 frames)
                            if (framesSinceProgress > 90) {
                                break;
                            }

                            lastX = p.x;
                            lastY = p.y;
                            prevDist = dist;
                        }

                        b.setVelocity(0, 0);

                        waypointsResults.push({
                            waypointIndex: i,
                            target: [targetX, targetY],
                            endPosition: [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10],
                            reached: wpReached,
                            blockedTimeMs: Math.round(wpBlockedTime),
                            distRemaining: Math.round(Math.hypot(targetX - p.x, targetY - p.y) * 10) / 10
                        });

                        if (!wpReached) {
                            allWaypointsReached = false;
                            break; // Stop further traversal if route segment is blocked
                        }
                    }

                    // Classification
                    let classification = "BLOCKED";
                    if (allWaypointsReached) {
                        classification = "ROUTE PHYSICALLY TRAVERSED";
                    } else if (waypointsResults.some(w => w.reached)) {
                        classification = "PARTIAL";
                    }

                    return {
                        classification,
                        allWaypointsReached,
                        totalDistanceTraversed: Math.round(totalDistanceTraversed * 10) / 10,
                        totalBlockedTimeMs: Math.round(totalBlockedTimeMs),
                        waypointsResults,
                        finalPosition: [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]
                    };
                }""", waypoints)

                dir_key = f"{rid}_{direction.lower()}"
                audit_report["part_d_physical_walk"][dir_key] = {
                    "route_id": rid,
                    "name": rname,
                    "direction": direction,
                    "classification": run_result["classification"],
                    "all_reached": run_result["allWaypointsReached"],
                    "distance_px": run_result["totalDistanceTraversed"],
                    "blocked_time_ms": run_result["totalBlockedTimeMs"],
                    "final_pos": run_result["finalPosition"],
                    "waypoints_summary": run_result["waypointsResults"]
                }

                print(f"    Result: {run_result['classification']} | Dist: {run_result['totalDistanceTraversed']}px | Blocked: {run_result['totalBlockedTimeMs']}ms")
                for w in run_result["waypointsResults"]:
                    print(f"      WP {w['waypointIndex']} -> Target {w['target']}: reached={w['reached']}, endPos={w['endPosition']}, distRem={w['distRemaining']}px")

        # =========================================================================
        # INTERACTABLE & TRANSITION VALIDATION
        # =========================================================================
        print("\n==================================================================")
        print("TESTING INTERACTABLES & TRANSITION TRIGGERS (E KEY & BOUNDS)")
        print("==================================================================")
        interactables_to_test = [
            {"id": "env_knights_memorial_stele", "actionId": "inspect_knights_memorial_stele", "x": 1260, "y": 645, "name": "Bia Đá Tưởng Niệm Kỵ Sĩ"},
            {"id": "hide_bush_ow_s_curve", "actionId": "hide_bush_ow_s_curve", "x": 1150, "y": 655, "name": "Bụi Rậm Khúc Cua Chữ S"},
            {"id": "ow_ancient_willow", "actionId": "inspect_ow_willow", "x": 1200, "y": 915, "name": "Cây Liễu Cổ Thụ Phía Nam"},
            {"id": "hide_tree_ow_willow", "actionId": "hide_tree_ow_willow", "x": 1305, "y": 885, "name": "Cây Rỗng Bãi Liễu"},
            {"id": "sign_sub_bell_workshop", "actionId": "inspect_sign_bell_workshop", "x": 1300, "y": 985, "name": "Biển Chỉ Dẫn Xưởng Chuông"},
            {"id": "gather_wood_ow_1", "actionId": "gather_wood_ow_1", "x": 1190, "y": 675, "name": "Cành Gỗ Khô Rơi"},
            {"id": "gather_resin_ow_1", "actionId": "gather_resin_ow_1", "x": 1170, "y": 630, "name": "Nhựa Thông Rừng Già"},
            {"id": "npc_campfire_knight", "actionId": "talk_sir_vaelen", "x": 1435, "y": 710, "name": "Sir Vaelen - Kỵ Sĩ Trầm Mặc"}
        ]

        for it in interactables_to_test:
            res = page.evaluate("""(item) => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                const zone = gs.worldBuilder.getZone('outer_woods');
                const interactables = zone ? (zone.interactables || []) : [];
                const npcs = zone ? (zone.npcs || []) : [];
                const foundI = interactables.find(i => i.id === item.id);
                const foundN = npcs.find(n => n.id === item.id);
                const found = foundI || foundN;

                let actionFired = false;
                if (found) {
                    try {
                        if (item.actionId.startsWith('talk_')) {
                            if (gs.dialogueSystem && gs.dialogueSystem.startDialogue) {
                                gs.dialogueSystem.startDialogue(found.dialogueKey || 'campfire_knight_intro');
                                actionFired = true;
                            }
                        } else {
                            gs.executeMapInteraction(item.actionId, item.name);
                            actionFired = true;
                        }
                    } catch (e) {
                        actionFired = false;
                    }
                }

                return {
                    found: Boolean(found),
                    coords: found ? { x: found.x, y: found.y } : null,
                    actionFired
                };
            }""", it)
            audit_report["interactables_tested"][it["id"]] = res
            print(f"  Interactable [{it['id']}]: found={res['found']}, coords={res['coords']}, actionFired={res['actionFired']}")

        # Test transition trigger to sub_bell_workshop
        trans_res = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const zone = gs.worldBuilder.getZone('outer_woods');
            const transitions = zone ? (zone.transitions || []) : [];
            const toWorkshop = transitions.find(t => t.id === 'to_bell_workshop');
            return {
                found: Boolean(toWorkshop),
                triggerRect: toWorkshop ? toWorkshop.triggerRect : null,
                targetSpawn: toWorkshop ? toWorkshop.targetSpawn : null,
                status: toWorkshop ? toWorkshop.status : null
            };
        }""")
        print(f"  Transition to sub_bell_workshop: {trans_res}")
        audit_report["transition_workshop"] = trans_res

        # =========================================================================
        # PART E: VISUAL COMPOSITION CAPTURE (F9 ON/OFF AT 5 COORDINATES)
        # =========================================================================
        print("\n==================================================================")
        print("PART E: VISUAL COMPOSITION CAPTURE (F9 ON / OFF)")
        print("==================================================================")

        for vt in visual_targets:
            target_id = vt["id"]
            name = vt["name"]
            x = vt["x"]
            y = vt["y"]

            print(f"\nCapturing: {target_id} ({name}) at ({x}, {y})...")

            # 1. F9 OFF
            page.evaluate(f"""() => {{
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.player.setPosition({x}, {y});
                if (gs.player.body) {{
                    gs.player.body.reset({x}, {y});
                    gs.player.syncBodyFootAnchor();
                    gs.player.body.updateFromGameObject();
                }}
                gs.player.setVelocity(0, 0);
                gs.cameras.main.centerOn({x}, {y});
                gs.cameras.main.setZoom(2.2);
                if (gs.physics.world.debugGraphic) gs.physics.world.debugGraphic.setVisible(false);
                gs.physics.world.drawDebug = false;
            }}""")
            time.sleep(0.5)
            path_off = VISUALS_DIR / f"{target_id}_f9_off.png"
            page.screenshot(path=str(path_off))
            print(f"  -> Captured F9 OFF: {path_off.name} ({path_off.stat().st_size} bytes)")

            # 2. F9 ON
            page.evaluate(f"""() => {{
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.physics.world.drawDebug = true;
                if (!gs.physics.world.debugGraphic) {{
                    gs.physics.world.createDebugGraphic();
                }}
                gs.physics.world.debugGraphic.setVisible(true);
                gs.physics.world.debugGraphic.setDepth(999999);
            }}""")
            time.sleep(0.5)
            path_on = VISUALS_DIR / f"{target_id}_f9_on.png"
            page.screenshot(path=str(path_on))
            print(f"  -> Captured F9 ON:  {path_on.name} ({path_on.stat().st_size} bytes)")

            # Visual canopy occlusion audit at this location
            occlusion_eval = page.evaluate(f"""() => {{
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                const trees = gs.worldBuilder.treeCanopyGroup ? gs.worldBuilder.treeCanopyGroup.getChildren() : [];
                // Check trees whose canopy bounds cover player position ({x}, {y})
                const overlappingTrees = [];
                for (const t of trees) {{
                    const halfW = (t.displayWidth || 120) / 2;
                    const halfH = (t.displayHeight || 120) / 2;
                    if (Math.abs(t.x - {x}) < halfW && Math.abs(t.y - {y}) < halfH) {{
                        overlappingTrees.push({{
                            type: t.texture ? t.texture.key : 'unknown',
                            pos: [t.x, t.y],
                            alpha: t.alpha,
                            depth: t.depth
                        }});
                    }}
                }}
                return {{
                    overlappingTreesCount: overlappingTrees.length,
                    overlappingTrees
                }};
            }}""")

            audit_report["part_e_visual_composition"][target_id] = {
                "name": name,
                "x": x,
                "y": y,
                "f9_off_file": str(path_off.name),
                "f9_on_file": str(path_on.name),
                "occlusion_data": occlusion_eval
            }
            print(f"  Canopy analysis: {occlusion_eval['overlappingTreesCount']} overlapping canopies detected")

        browser.close()

    # Save metrics to JSON
    out_metrics_path = REPORTS_DIR / "physical_walk_and_visuals_metrics.json"
    with open(out_metrics_path, "w", encoding="utf-8") as f:
        json.dump(audit_report, f, indent=2, ensure_ascii=False)
    print(f"\nAudit metrics successfully saved to {out_metrics_path}")

    # Summary report
    print("\n==================================================================")
    print("AUDIT SUMMARY: PART D & PART E COMPLETED")
    print("==================================================================")
    all_routes_pass = all(r["classification"] == "ROUTE PHYSICALLY TRAVERSED" for r in audit_report["part_d_physical_walk"].values())
    print(f"All 10 directional walk routes physically traversed: {all_routes_pass}")
    print(f"All 10 visual screenshots (F9 ON/OFF) saved to {VISUALS_DIR}")

if __name__ == '__main__':
    main()
