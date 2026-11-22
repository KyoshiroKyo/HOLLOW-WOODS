"""
HW-BUG-24A: Outer Woods Path Audit After HW-FIX-21
Comprehensive physical path traversal audit covering 5 key routes in Outer Woods:
1. North entry <-> Hunter Camp (S-Curve)
2. Camp <-> Junction <-> Sir Vaelen
3. Junction <-> Bell Workshop
4. Willow Clearing & Forest Edge
5. Sir Vaelen Bonfire Perimeter Loop

Mode: SOURCE READ-ONLY + QA + DOC-ONLY
Noclip: Strictly OFF (body.checkCollision.none = false)
Movement: Physical 60Hz Arcade velocity simulation & waypoint traversal.
"""

import os
import sys
import math
import time
import json
import threading
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

PORT = 5264
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DIST_DIR = PROJECT_ROOT / 'dist'
VISUALS_DIR = PROJECT_ROOT / 'Read' / 'V1.5' / 'Reports' / 'Visuals' / 'HW_BUG_24A'
VISUALS_DIR.mkdir(parents=True, exist_ok=True)

ROUTES = [
    {
        "id": "route_1_north_to_camp",
        "name": "Route 1: North Entry <-> Hunter Camp (S-Curve)",
        "color": (46, 204, 113),  # Emerald Green
        "waypoints": [
            [1210, 580],
            [1170, 625],
            [1165, 685],
            [1210, 725],
            [1260, 745],
            [1330, 745]
        ],
        "screenshotPos": [1170, 650],
        "screenshotName": "hw_bug_24a_route1_s_curve.png",
        "desc": "Lối vào phía Bắc Bellhollow qua khúc cua chữ S đến Bãi Trại Thợ Săn"
    },
    {
        "id": "route_2_camp_to_vaelen",
        "name": "Route 2: Camp <-> Junction <-> Sir Vaelen",
        "color": (52, 152, 219),  # Blue
        "waypoints": [
            [1330, 745],
            [1360, 755],
            [1410, 755],
            [1435, 730],
            [1435, 710]
        ],
        "screenshotPos": [1385, 740],
        "screenshotName": "hw_bug_24a_route2_vaelen_junction.png",
        "desc": "Trục ngã ba Trại Thợ Săn rẽ Đông sang Trạm Lửa Sir Vaelen"
    },
    {
        "id": "route_3_junction_to_bell_workshop",
        "name": "Route 3: Junction <-> Bell Workshop",
        "color": (155, 89, 182),  # Purple
        "waypoints": [
            [1330, 745],
            [1360, 760],
            [1360, 840],
            [1360, 920],
            [1360, 980],
            [1360, 1000]
        ],
        "screenshotPos": [1360, 880],
        "screenshotName": "hw_bug_24a_route3_bell_corridor.png",
        "desc": "Hành lang thẳng X=1360 xuống portal Xưởng Chuông Bỏ Hoang"
    },
    {
        "id": "route_4_willow_clearing",
        "name": "Route 4: Willow Clearing & Forest Edge",
        "color": (230, 126, 34),  # Orange
        "waypoints": [
            [1330, 745],
            [1270, 745],
            [1265, 820],
            [1260, 910],
            [1240, 930]
        ],
        "screenshotPos": [1260, 870],
        "screenshotName": "hw_bug_24a_route4_willow_clearing.png",
        "desc": "Nhánh rẽ Tây Nam xuống Bãi Liễu Cổ Thụ & Cây Rỗng phía Nam"
    },
    {
        "id": "route_5_vaelen_perimeter_loop",
        "name": "Route 5: Sir Vaelen Bonfire Perimeter Loop",
        "color": (231, 76, 60),  # Red
        "waypoints": [
            [1490, 680],
            [1505, 710],
            [1490, 745],
            [1430, 745],
            [1420, 710],
            [1440, 680],
            [1490, 680]
        ],
        "screenshotPos": [1470, 710],
        "screenshotName": "hw_bug_24a_route5_bonfire_loop.png",
        "desc": "Vòng tuần hoàn 360 độ quanh tâm Bếp Lửa Cổ và Sir Vaelen"
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

        print("=== HW-BUG-24A: Connecting to Outer Woods ===")
        page.goto(f'http://127.0.0.1:{PORT}/?dev=1&zone=outer_woods', wait_until='domcontentloaded')
        page.wait_for_function('() => window.__PHASER_GAME__?.scene?.isActive("MainMenuScene")', timeout=30000)
        page.evaluate('() => window.__PHASER_GAME__.scene.getScene("MainMenuScene").startNewGame()')
        page.wait_for_function('() => window.__PHASER_GAME__?.scene?.isActive("GameScene") && window.__PHASER_GAME__?.scene?.getScene("GameScene")?.player', timeout=30000)

        # Switch to Outer Woods & strictly verify Noclip OFF
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.currentZoneId = 'outer_woods';
            gs.worldBuilder.setActiveZone('outer_woods');
            gs.applyCameraBoundsForZone('outer_woods');
            gs.player.body.checkCollision.none = false; // Strictly Noclip OFF
            gs.player.resetAllActionAndMotionStates();
        }""")
        time.sleep(0.5)

        # Run physical simulation across all 5 routes
        print("\n--- Performing 2-Way Continuous Physical Traversal Across 5 Routes ---")
        audit_res = page.evaluate("""(routes) => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const p = gs.player;
            const b = p.body;
            b.checkCollision.none = false;

            const colliders = [];
            gs.worldBuilder.colliderGroup.getChildren().forEach(c => {
                if (c.body) {
                    colliders.push({
                        name: c.name || 'unnamed',
                        x: c.body.x,
                        y: c.body.y,
                        right: c.body.right,
                        bottom: c.body.bottom,
                        w: c.body.width,
                        h: c.body.height
                    });
                }
            });

            function getMinDistanceToColliders(bx, by, bw, bh) {
                const bRight = bx + bw;
                const bBottom = by + bh;
                let minDist = 999999;
                let nearest = null;

                for (const col of colliders) {
                    const dx = Math.max(0, col.x - bRight, bx - col.right);
                    const dy = Math.max(0, col.y - bBottom, by - col.bottom);
                    const dist = Math.hypot(dx, dy);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = col.name;
                    }
                }
                return { minDist: Math.round(minDist * 10) / 10, nearest };
            }

            function walkPath(wps) {
                const pathPoints = [];
                let totalSteps = 0;
                let minClearance = 999999;
                let nearestObstacle = null;

                // 1. SETUP
                p.setPosition(wps[0][0], wps[0][1]);
                p.syncBodyFootAnchor();
                b.updateFromGameObject();
                pathPoints.push([Math.round(p.x), Math.round(p.y)]);

                let overallSuccess = true;

                for (let i = 1; i < wps.length; i++) {
                    const [targetX, targetY] = wps[i];
                    let currentDist = Math.hypot(p.x - targetX, p.y - targetY);
                    let stuckCounter = 0;
                    let lastPos = { x: p.x, y: p.y };

                    while (currentDist > 4.0 && stuckCounter < 60) {
                        totalSteps++;
                        const angle = Math.atan2(targetY - p.y, targetX - p.x);
                        const speed = 85.0; // Standard walk speed
                        const dt = 1.0 / 60.0;
                        const stepDist = speed * dt;

                        const nextX = p.x + Math.cos(angle) * stepDist;
                        const nextY = p.y + Math.sin(angle) * stepDist;

                        p.setPosition(nextX, nextY);
                        p.syncBodyFootAnchor();
                        b.updateFromGameObject();

                        let hasCollision = false;
                        gs.physics.overlap(p, gs.worldBuilder.colliderGroup, () => {
                            hasCollision = true;
                        });

                        if (hasCollision) {
                            p.setPosition(lastPos.x, lastPos.y);
                            p.syncBodyFootAnchor();
                            b.updateFromGameObject();
                            stuckCounter++;
                        } else {
                            stuckCounter = 0;
                            lastPos = { x: p.x, y: p.y };
                            pathPoints.push([Math.round(p.x), Math.round(p.y)]);
                        }

                        const cl = getMinDistanceToColliders(b.x, b.y, b.width, b.height);
                        if (cl.minDist < minClearance) {
                            minClearance = cl.minDist;
                            nearestObstacle = cl.nearest;
                        }

                        currentDist = Math.hypot(p.x - targetX, p.y - targetY);
                    }

                    if (currentDist > 5.0) {
                        overallSuccess = false;
                        break;
                    }
                }

                return {
                    success: overallSuccess,
                    totalSteps,
                    minClearance,
                    nearestObstacle,
                    pathPoints
                };
            }

            const results = [];
            for (const r of routes) {
                const forward = walkPath(r.waypoints);
                const backward = walkPath([...r.waypoints].reverse());

                results.push({
                    id: r.id,
                    name: r.name,
                    forwardSuccess: forward.success,
                    forwardMinClearance: forward.minClearance,
                    forwardNearestObstacle: forward.nearestObstacle,
                    forwardPath: forward.pathPoints,
                    backwardSuccess: backward.success,
                    backwardMinClearance: backward.minClearance,
                    backwardNearestObstacle: backward.nearestObstacle,
                    backwardPath: backward.pathPoints
                });
            }

            return {
                results,
                totalColliders: colliders.length,
                playerBodySize: { w: b.width, h: b.height }
            };
        }""", ROUTES)

        print(f"Total colliders analyzed in Outer Woods: {audit_res['totalColliders']}")
        print(f"Player Body AABB: {audit_res['playerBodySize']['w']}x{audit_res['playerBodySize']['h']} px\n")

        # Verify each route
        all_routes_pass = True
        for r in audit_res['results']:
            print(f"[{r['name']}]")
            print(f"  Forward Traversal:  Success={r['forwardSuccess']}, Min Clearance={r['forwardMinClearance']}px (Nearest: '{r['forwardNearestObstacle']}')")
            print(f"  Backward Traversal: Success={r['backwardSuccess']}, Min Clearance={r['backwardMinClearance']}px (Nearest: '{r['backwardNearestObstacle']}')")
            assert r['forwardSuccess'], f"Route {r['name']} failed on forward pass!"
            assert r['backwardSuccess'], f"Route {r['name']} failed on backward pass!"

        print("\n-> ALL 5 ROUTES PASS TWO-WAY CONTINUOUS PHYSICAL TRAVERSAL 100%!")

        # Capture individual route screenshots
        print("\n--- Capturing Route Screenshots ---")
        for r in ROUTES:
            page.evaluate("""(pos) => {
                const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
                gs.player.setPosition(pos[0], pos[1]);
                gs.player.syncBodyFootAnchor();
                gs.player.body.updateFromGameObject();
                gs.player.facing = 'down';
                gs.player.playIdle();
                gs.cameras.main.centerOn(pos[0], pos[1]);
            }""", r['screenshotPos'])
            page.wait_for_timeout(350)
            shot_path = VISUALS_DIR / r['screenshotName']
            page.screenshot(path=str(shot_path))
            print(f"  Saved screenshot: {shot_path.name}")

        # Capture zone overview for Route Map background
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.cameras.main.centerOn(1360, 800);
            gs.cameras.main.setZoom(1.0);
        }""")
        page.wait_for_timeout(400)
        overview_shot = VISUALS_DIR / 'outer_woods_overview_raw.png'
        page.screenshot(path=str(overview_shot))

        browser.close()

    # Generate annotated route map
    print("\n--- Generating Annotated Route Map ---")
    generate_route_map(overview_shot, audit_res['results'])

    print("\n=======================================================")
    print("HW-BUG-24A AUDIT COMPLETE: 100% PASS (VERIFIED-NO-CHANGE)")
    print("Zero path blockers detected across all 5 key routes.")
    print("=======================================================\n")

def generate_route_map(bg_image_path, audit_results):
    if not bg_image_path.exists():
        return

    img = Image.open(bg_image_path).convert('RGBA')
    draw = ImageDraw.Draw(img)

    # Zone bounds in world coordinates: x: 1120..1600 (W=480), y: 560..1040 (H=480)
    # Viewport center at (1360, 800), viewport size: 1280x720
    # Camera zoom = 1.0, so ScreenX = WorldX - (1360 - 640) = WorldX - 720
    # ScreenY = WorldY - (800 - 360) = WorldY - 440
    cam_offset_x = 720
    cam_offset_y = 440

    def world_to_screen(wx, wy):
        return (wx - cam_offset_x, wy - cam_offset_y)

    # Draw routes and waypoints
    for r_def, r_res in zip(ROUTES, audit_results):
        color = r_def['color']
        wps = r_def['waypoints']

        # Draw path lines
        screen_wps = [world_to_screen(x, y) for x, y in wps]
        for i in range(len(screen_wps) - 1):
            p0 = screen_wps[i]
            p1 = screen_wps[i + 1]
            draw.line([p0, p1], fill=color + (220,), width=4)

        # Draw waypoint nodes
        for idx, pt in enumerate(screen_wps):
            r = 6 if idx in (0, len(screen_wps) - 1) else 4
            draw.ellipse([pt[0] - r, pt[1] - r, pt[0] + r, pt[1] + r], fill=(255, 255, 255, 255), outline=color, width=2)

    # Draw Legend Card
    card_x0, card_y0 = 20, 20
    card_w, card_h = 440, 230
    draw.rectangle([card_x0, card_y0, card_x0 + card_w, card_y0 + card_h], fill=(15, 23, 20, 220), outline=(50, 80, 60), width=2)
    draw.text((card_x0 + 15, card_y0 + 12), "HOLLOW WOODS V1.5.4 — OUTER WOODS ROUTE AUDIT", fill=(255, 255, 255))
    draw.text((card_x0 + 15, card_y0 + 30), "Audit Status: VERIFIED-NO-CHANGE (Noclip OFF Pass 100%)", fill=(46, 204, 113))

    legend_y = card_y0 + 55
    for r_def in ROUTES:
        color = r_def['color']
        draw.rectangle([card_x0 + 15, legend_y + 3, card_x0 + 30, legend_y + 13], fill=color)
        draw.text((card_x0 + 38, legend_y), f"{r_def['name']}", fill=(230, 230, 230))
        legend_y += 32

    map_path = VISUALS_DIR / 'hw_bug_24a_route_map.png'
    img.save(map_path)
    print(f"  Generated annotated route map: {map_path.name}")

if __name__ == '__main__':
    main()
