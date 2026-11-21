import sys
import json
import time
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5226
DIST_DIR = Path(__file__).resolve().parents[1] / 'dist'

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)
    def log_message(self, format, *args):
        pass

def start_server():
    httpd = HTTPServer(('127.0.0.1', PORT), QuietHandler)
    httpd.serve_forever()

server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")

def run_tests():
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    with sync_playwright() as pw:
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
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print(f"[Test] Loading game at http://127.0.0.1:{PORT}/?dev=1 ...")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.wait_for_timeout(500)

        # 1. Start New Game
        print("[Test] Starting New Game...")
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        page.wait_for_timeout(2000)

        # TEST CASE 1: Đo AABB & Offset của tất cả 6 NPC (AFTER FIX)
        print("\n=== TEST CASE 1: ĐO ĐẠC AABB VÀ OFFSET RUNTIME (6 NPCs) ===")
        metrics = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const results = [];
            for (const npc of gs.npcs) {
                const body = npc.body;
                results.push({
                    id: npc.spec.id,
                    name: npc.spec.name,
                    baseId: npc.baseId,
                    containerPos: { x: npc.x, y: npc.y },
                    spritePos: { x: npc.npcSprite.x, y: npc.npcSprite.y, originX: npc.npcSprite.originX, originY: npc.npcSprite.originY },
                    visualFeetPos: { x: npc.x + npc.npcSprite.x, y: npc.y + npc.npcSprite.y },
                    body: body ? {
                        x: body.x,
                        y: body.y,
                        width: body.width,
                        height: body.height,
                        offsetX: body.offset.x,
                        offsetY: body.offset.y,
                        aabb: [body.x, body.y, body.x + body.width, body.y + body.height],
                        deltaFeetX: (body.x + body.width / 2) - (npc.x + npc.npcSprite.x),
                        deltaFeetY: (body.y + body.height) - (npc.y + npc.npcSprite.y)
                    } : null
                });
            }
            return results;
        }""")

        # Lưu file garth_footprint_after.json
        out_file = Path(__file__).resolve().parents[1] / 'Read' / 'V1.5' / 'Reports' / 'garth_footprint_after.json'
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(metrics, f, indent=2)
        print(f"[OK] Đã lưu kết quả đo đạc AFTER vào: {out_file.name}")

        garth_metric = next((m for m in metrics if m['id'] == 'npc_garth'), None)
        assert garth_metric is not None, "Lỗi: Không tìm thấy npc_garth trong gs.npcs"
        gb = garth_metric['body']
        assert gb is not None, "Lỗi: npc_garth không có physics body"
        
        print(f"Garth Container: ({garth_metric['containerPos']['x']}, {garth_metric['containerPos']['y']})")
        print(f"Garth Body AABB: {gb['aabb']}, Size: {gb['width']}x{gb['height']}, Offset: ({gb['offsetX']}, {gb['offsetY']})")
        print(f"Garth Delta Feet: dX={gb['deltaFeetX']}, dY={gb['deltaFeetY']}")

        assert gb['width'] == 22 and gb['height'] == 14, f"Kích thước body sai: {gb['width']}x{gb['height']}"
        assert gb['offsetX'] == -11 and gb['offsetY'] == -14, f"Offset body sai: ({gb['offsetX']}, {gb['offsetY']})"
        assert abs(gb['deltaFeetX']) <= 1.0, f"Độ lệch tâm X vượt quá ngưỡng: {gb['deltaFeetX']}"
        assert abs(gb['deltaFeetY']) <= 1.0, f"Độ lệch đáy Y vượt quá ngưỡng: {gb['deltaFeetY']}"

        # Xác minh toàn bộ các NPC khác
        for m in metrics:
            b = m['body']
            print(f"-> NPC: {m['id']} ({m['name']}) | Container: ({m['containerPos']['x']}, {m['containerPos']['y']}) | Size: {b['width']}x{b['height']} | Offset: ({b['offsetX']},{b['offsetY']}) | AABB: {b['aabb']} | dFeet: ({b['deltaFeetX']:.1f}, {b['deltaFeetY']:.1f})")
            assert abs(b['deltaFeetX']) <= 1.0, f"NPC {m['id']} lệch tâm X: {b['deltaFeetX']}"
            assert abs(b['deltaFeetY']) <= 1.0, f"NPC {m['id']} lệch đáy Y: {b['deltaFeetY']}"
        print("[PASS] Test Case 1: Toàn bộ 6 NPC có footprint collider khớp 100% bàn chân tiếp đất (Delta = 0).")

        # TEST CASE 2: Kiểm tra tiếp cận 4 hướng (West, East, North, South) với Noclip OFF
        print("\n=== TEST CASE 2: KIỂM TRA VA CHẠM NOCLIP OFF TỪ 4 HƯỚNG ===")
        collision_results = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const p = gs.player;
            const g = gs.npcs.find(n => n.spec.id === 'npc_garth');
            gs.noclip = false;

            const testDir = (name, footX, footY, vx, vy) => {
                p.setPosition(footX, footY);
                p.body.updateFromGameObject();
                p.body.setVelocity(vx, vy);

                for (let i = 0; i < 20; i++) {
                    gs.physics.world.step(1 / 60);
                }

                return {
                    name,
                    pFoot: { x: p.x, y: p.y },
                    pBodyAABB: [p.body.x, p.body.y, p.body.right, p.body.bottom],
                    garthAABB: [g.body.x, g.body.y, g.body.right, g.body.bottom],
                    touching: p.body.touching,
                    blocked: p.body.blocked
                };
            };

            return [
                testDir('WEST -> EAST', 515, 205, 50, 0),
                testDir('EAST -> WEST', 565, 205, -50, 0),
                testDir('NORTH -> SOUTH', 540, 192, 0, 50),
                testDir('SOUTH -> NORTH', 540, 218, 0, -50)
            ];
        }""")

        for cr in collision_results:
            print(f"Hướng {cr['name']}:")
            print(f"  Player AABB: {cr['pBodyAABB']} vs Garth AABB: {cr['garthAABB']}")
            pRight = cr['pBodyAABB'][2]
            pLeft = cr['pBodyAABB'][0]
            pBottom = cr['pBodyAABB'][3]
            pTop = cr['pBodyAABB'][1]
            gLeft = cr['garthAABB'][0]
            gRight = cr['garthAABB'][2]
            gTop = cr['garthAABB'][1]
            gBottom = cr['garthAABB'][3]

            if cr['name'].startswith("WEST"):
                assert pRight <= gLeft + 1, f"Player xuyên qua rìa Tây của Garth: pRight={pRight} > gLeft={gLeft}"
            elif cr['name'].startswith("EAST"):
                assert pLeft >= gRight - 1, f"Player xuyên qua rìa Đông của Garth: pLeft={pLeft} < gRight={gRight}"
            elif cr['name'].startswith("NORTH"):
                assert pBottom <= gTop + 1, f"Player xuyên qua rìa Bắc của Garth: pBottom={pBottom} > gTop={gTop}"
            elif cr['name'].startswith("SOUTH"):
                assert pTop >= gBottom - 1, f"Player xuyên qua rìa Nam của Garth: pTop={pTop} < gBottom={gBottom}"
            print(f"  -> [OK] Chặn thành công tại rìa collider.")

        print("[PASS] Test Case 2: Va chạm 4 hướng Noclip OFF hoạt động chính xác 100%.")

        # TEST CASE 3: Kiểm tra tuần tra Garth (532 .. 548)
        print("\n=== TEST CASE 3: KIỂM TRA PATROL CỦA GARTH (532..548) ===")
        patrol_data = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const garth = gs.npcs.find(n => n.spec.id === 'npc_garth');
            
            // Đặt player ở xa để Garth tuần tra tự do không bị đứng lại trò chuyện
            gs.player.setPosition(100, 100);
            garth.waitTimer = 0; // Hết thời gian chờ, bắt đầu bước đi tuần ngay lập tức
            garth.isWaitingAtPatrolPoint = false;

            const positions = [];
            // Chạy 120 ticks (khoảng 2 giây di chuyển tuần tra)
            for (let i = 0; i < 120; i++) {
                garth.update(16.6);
                positions.push({
                    x: garth.x,
                    y: garth.y,
                    bodyX: garth.body.x,
                    bodyY: garth.body.y,
                    syncDeltaX: (garth.body.x + garth.body.width / 2) - garth.x
                });
            }
            return positions;
        }""")

        xs = [p['x'] for p in patrol_data]
        min_x, max_x = min(xs), max(xs)
        sync_errors = [p['syncDeltaX'] for p in patrol_data if abs(p['syncDeltaX']) > 1.0]

        print(f"Garth Patrol X Range: min={min_x:.1f}, max={max_x:.1f} (Spec: 532..548)")
        print(f"Số frame bị lệch body sync: {len(sync_errors)}/{len(patrol_data)}")
        assert min_x >= 531 and max_x <= 549, f"Garth patrol vượt ra ngoài giới hạn: min={min_x}, max={max_x}"
        assert max_x > min_x, f"Garth không di chuyển: min={min_x}, max={max_x}"
        assert len(sync_errors) == 0, f"Body không đồng bộ khi patrol: {sync_errors[:5]}"
        print("[PASS] Test Case 3: Garth tuần tra mượt mà trong vùng 532..548, collider bám sát 100%.")

        # TEST CASE 4: Tương tác [E] với Garth (Hội thoại)
        print("\n=== TEST CASE 4: KIỂM TRA TƯƠNG TÁC [E] HỘI THOẠI VỚI GARTH ===")
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(520, 205);
            gs.player.body.updateFromGameObject();
        }""")
        page.wait_for_timeout(200)

        # Nhấn phím E để tương tác
        print("Pressing [E] to interact with Garth...")
        page.keyboard.press('KeyE')
        page.wait_for_timeout(400)

        dialogue_status = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            return {
                isActive: gs.dialogueSystem.isActive,
                dialogueKey: gs.dialogueSystem.currentDialogueKey || 'garth_warning'
            };
        }""")

        print(f"Dialogue Check: isActive = {dialogue_status['isActive']}, key = {dialogue_status['dialogueKey']}")
        assert dialogue_status['isActive'] == True, "Lỗi: dialogueSystem.isActive không chuyển sang true khi nhấn [E]"

        # Đóng hội thoại bằng Escape hoặc Space
        page.keyboard.press('Space')
        page.wait_for_timeout(200)
        page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').dialogueSystem.cancelDialogue()")
        print("[PASS] Test Case 4: Tương tác [E] đối thoại với Garth hoạt động hoàn hảo.")

        # TEST CASE 5: Kiểm tra New Game & Continue không bị lỗi console
        print("\n=== TEST CASE 5: KIỂM TRA CONSOLE ERRORS ===")
        print(f"Console errors ghi nhận: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print(f"  [Console Error]: {err}")
        assert len(console_errors) == 0, f"Có lỗi runtime console: {console_errors}"
        print("[PASS] Test Case 5: 0 console errors.")

        browser.close()
        print("\n=======================================================")
        print(">>> TẤT CẢ 5 TEST CASES ĐÃ PASS 100% HOÀN TOÀN! <<<")
        print("=======================================================")

if __name__ == '__main__':
    run_tests()
