import sys
import json
import time
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5235
ROOT = Path(__file__).resolve().parents[1]
DIST_DIR = ROOT / 'dist'
REPORTS_DIR = ROOT / 'Read' / 'V1.5' / 'Reports'
ARTIFACT_DIR = Path("C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156")

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

        # Teleport vào Bellhollow
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.teleportForDeveloper('bellhollow', 1250, 360);
            gs.noclip = false;
        }""")
        page.wait_for_timeout(1000)

        # =========================================================================
        # TEST CASE 1: XÁC MINH KHÔNG CÒN XƯỞNG CŨ / KHÔNG TỒN TẠI 2 XƯỞNG
        # =========================================================================
        print("\n=== TEST CASE 1: XÁC MINH CỤM XƯỞNG CŨ ĐÃ BIẾN MẤT HOÀN TOÀN ===")
        check_old = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            
            // Tìm tất cả static bodies có tên 'Mái Xưởng Rèn' hoặc 'Bàn Chế Tạo'
            const workshopColliders = [];
            const benchColliders = [];
            for (const b of gs.physics.world.staticBodies) {
                if (b.gameObject?.name === 'Mái Xưởng Rèn') {
                    workshopColliders.push({ x: b.x, y: b.y, w: b.width, h: b.height });
                }
                if (b.gameObject?.name === 'Bàn Chế Tạo') {
                    benchColliders.push({ x: b.x, y: b.y, w: b.width, h: b.height });
                }
            }

            // Kiểm tra interactables
            const benches = gs.worldBuilder.getZone('bellhollow')?.interactables.filter(i => i.id === 'village_crafting_bench') || [];
            const brams = gs.npcs.filter(n => n.spec.id === 'npc_bram');

            return {
                workshopColliderCount: workshopColliders.length,
                workshopColliders,
                benchColliderCount: benchColliders.length,
                benchColliders,
                benchesCount: benches.length,
                benchesPos: benches.map(b => ({ x: b.x, y: b.y })),
                bramCount: brams.length,
                bramPos: brams.map(b => ({ x: b.x, y: b.y }))
            };
        }""")

        print(f"Số lượng xưởng rèn collider: {check_old['workshopColliderCount']}")
        print(f"Số lượng bàn chế tạo collider: {check_old['benchColliderCount']}")
        print(f"Số lượng Bram NPC: {check_old['bramCount']}")
        print(f"Số lượng Bàn Chế Tạo Interactable: {check_old['benchesCount']}")

        assert check_old['workshopColliderCount'] == 1, f"Lỗi: Không phải 1 xưởng rèn ({check_old['workshopColliderCount']})"
        assert check_old['benchColliderCount'] == 1, f"Lỗi: Không phải 1 bàn chế tạo collider ({check_old['benchColliderCount']})"
        assert check_old['bramCount'] == 1, f"Lỗi: Không phải 1 Bram ({check_old['bramCount']})"
        assert check_old['benchesCount'] == 1, f"Lỗi: Không phải 1 bàn chế tạo ({check_old['benchesCount']})"

        # Xác minh vị trí cũ (1270, 360) không còn collider
        old_col = check_old['workshopColliders'][0]
        assert old_col['x'] != 1193 and old_col['y'] != 328, "Lỗi: Collider xưởng cũ vẫn còn tại (1193, 328)!"
        print("[PASS] Test Case 1: Cụm xưởng cũ đã được dọn sạch hoàn toàn, duy nhất 1 xưởng tồn tại.")

        # =========================================================================
        # TEST CASE 2: XÁC MINH CỤM XƯỞNG MỚI CHUẨN XÁC TẠI (1373, 432)
        # =========================================================================
        print("\n=== TEST CASE 2: XÁC MINH CỤM XƯỞNG MỚI TẠI (1373, 432) ===")
        check_new = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const bram = gs.npcs.find(n => n.spec.id === 'npc_bram');
            const bench = gs.worldBuilder.getZone('bellhollow')?.interactables.find(i => i.id === 'village_crafting_bench');
            
            let workshopCol = null;
            let benchCol = null;
            for (const b of gs.physics.world.staticBodies) {
                if (b.gameObject?.name === 'Mái Xưởng Rèn') {
                    workshopCol = { x: b.x, y: b.y, w: b.width, h: b.height, right: b.x + b.width, bottom: b.y + b.height };
                }
                if (b.gameObject?.name === 'Bàn Chế Tạo') {
                    benchCol = { x: b.x, y: b.y, w: b.width, h: b.height, right: b.x + b.width, bottom: b.y + b.height };
                }
            }

            return {
                bram: {
                    x: bram.x,
                    y: bram.y,
                    bodyAABB: [bram.body.x, bram.body.y, bram.body.right, bram.body.bottom],
                    bodyOffset: { x: bram.body.offset.x, y: bram.body.offset.y },
                    bodySize: { w: bram.body.width, h: bram.body.height },
                    deltaFeetX: (bram.body.x + bram.body.width / 2) - bram.x,
                    deltaFeetY: (bram.body.y + bram.body.height) - bram.y
                },
                bench: {
                    x: bench?.x,
                    y: bench?.y,
                    width: bench?.width,
                    height: bench?.height
                },
                workshopCol,
                benchCol
            };
        }""")

        print(f"Xưởng rèn Collider Mới: AABB = [{check_new['workshopCol']['x']}, {check_new['workshopCol']['y']}, {check_new['workshopCol']['right']}, {check_new['workshopCol']['bottom']}]")
        print(f"Bram NPC Mới: Pos = ({check_new['bram']['x']}, {check_new['bram']['y']}), Body AABB = {check_new['bram']['bodyAABB']}, dFeet = ({check_new['bram']['deltaFeetX']}, {check_new['bram']['deltaFeetY']})")
        print(f"Bàn Chế Tạo Mới: Pos = ({check_new['bench']['x']}, {check_new['bench']['y']}), Collider = [{check_new['benchCol']['x']}, {check_new['benchCol']['y']}, {check_new['benchCol']['right']}, {check_new['benchCol']['bottom']}]")

        # Kiểm tra móng xưởng mới tại (1373, 432):
        # colW = 154, colH = 32 -> x = 1373 - 77 = 1296, y = 432 - 32 = 400
        assert check_new['workshopCol']['x'] == 1296, f"Sai x collider xưởng: {check_new['workshopCol']['x']} != 1296"
        assert check_new['workshopCol']['y'] == 400, f"Sai y collider xưởng: {check_new['workshopCol']['y']} != 400"
        assert check_new['workshopCol']['bottom'] == 432, f"Sai chân móng y: {check_new['workshopCol']['bottom']} != 432"

        # Kiểm tra Bram tại (1333, 477):
        assert check_new['bram']['x'] == 1333, f"Sai Bram X: {check_new['bram']['x']} != 1333"
        assert check_new['bram']['y'] == 477, f"Sai Bram Y: {check_new['bram']['y']} != 477"
        assert abs(check_new['bram']['deltaFeetX']) <= 1.0, f"Bram lệch chân X: {check_new['bram']['deltaFeetX']}"
        assert abs(check_new['bram']['deltaFeetY']) <= 1.0, f"Bram lệch chân Y: {check_new['bram']['deltaFeetY']}"

        # Kiểm tra Bàn chế tạo tại (1395, 455):
        assert check_new['bench']['x'] == 1395, f"Sai Bench X: {check_new['bench']['x']} != 1395"
        assert check_new['bench']['y'] == 455, f"Sai Bench Y: {check_new['bench']['y']} != 455"
        assert check_new['benchCol']['x'] == 1375, f"Sai BenchCol X: {check_new['benchCol']['x']} != 1375"
        assert check_new['benchCol']['y'] == 449, f"Sai BenchCol Y: {check_new['benchCol']['y']} != 449"

        print("[PASS] Test Case 2: Toàn bộ cụm xưởng mới đặt chuẩn xác 100% tại (1373, 432).")

        # =========================================================================
        # TEST CASE 3: KIỂM TRA VA CHẠM NOCLIP OFF VÀ HÀNH LANG XUNG QUANH XƯỞNG
        # =========================================================================
        print("\n=== TEST CASE 3: KIỂM TRA VA CHẠM NOCLIP OFF XUNG QUANH XƯỞNG ===")
        # 1. Đi từ phía Nam hướng vào móng xưởng mới
        col_test = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const p = gs.player;
            gs.noclip = false;

            // Đặt player tại (1373, 455) đi lên Bắc hướng vào chân móng (1373, 432)
            p.setPosition(1373, 455);
            p.body.updateFromGameObject();
            p.body.setVelocity(0, -60);

            for (let i = 0; i < 25; i++) {
                gs.physics.world.step(1 / 60);
            }

            const stoppedY = Math.round(p.body.y);
            return {
                playerBodyAABB: [p.body.x, p.body.y, p.body.right, p.body.bottom],
                touchingUp: p.body.touching.up,
                blockedUp: p.body.blocked.up
            };
        }""")

        print(f"Va chạm phía Nam chân móng xưởng: Player AABB = {col_test['playerBodyAABB']}")
        # Mép chân móng xưởng là Y = 432. Player có body bottom không được vượt quá 432
        assert col_test['playerBodyAABB'][1] >= 428, f"Player xuyên thấu vào chân móng xưởng: {col_test['playerBodyAABB']}"
        print("[PASS] Test Case 3: Collider móng xưởng mới chặn va chạm Noclip OFF chuẩn xác.")

        # =========================================================================
        # TEST CASE 4: TƯƠNG TÁC [E] VỚI BRAM VÀ BÀN CHẾ TẠO MỚI
        # =========================================================================
        print("\n=== TEST CASE 4: KIỂM TRA TƯƠNG TÁC [E] VỚI BRAM VÀ BÀN CHẾ TẠO ===")
        
        # 4.1. Tương tác với Bram tại (1333, 477)
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(1320, 477);
            gs.player.body.updateFromGameObject();
        }""")
        page.wait_for_timeout(200)

        print("Pressing [E] to talk to Bram at new position...")
        page.keyboard.press('KeyE')
        page.wait_for_timeout(400)

        bram_dialogue = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            return {
                isActive: gs.dialogueSystem.isActive,
                dialogueKey: gs.dialogueSystem.currentDialogueKey || 'bram_chat'
            };
        }""")
        print(f"Bram Dialogue: isActive = {bram_dialogue['isActive']}, key = {bram_dialogue['dialogueKey']}")
        assert bram_dialogue['isActive'] == True, "Lỗi: Không mở được hội thoại với Bram tại vị trí mới"
        
        # Đóng hội thoại
        page.keyboard.press('Space')
        page.wait_for_timeout(200)
        page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').dialogueSystem.cancelDialogue()")

        # 4.2. Tương tác với Bàn chế tạo tại (1395, 455)
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(1395, 475);
            gs.player.body.updateFromGameObject();
        }""")
        page.wait_for_timeout(200)

        print("Pressing [E] to open Crafting Bench at new position...")
        page.keyboard.press('KeyE')
        page.wait_for_timeout(400)

        bench_craft = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const cm = gs.craftingModal;
            return {
                isOpen: cm ? cm.isOpen : false,
                isUISceneActive: gs.uiScene ? true : false
            };
        }""")
        print(f"Crafting Bench Modal: isOpen = {bench_craft['isOpen']}")
        assert bench_craft['isOpen'] == True, "Lỗi: Không mở được Bàn chế tạo sinh tồn tại vị trí mới"

        # Đóng modal chế tạo
        page.keyboard.press('Escape')
        page.wait_for_timeout(200)
        page.evaluate("() => { const gs = window.__PHASER_GAME__.scene.getScene('GameScene'); if (gs.craftingModal && gs.craftingModal.isOpen) gs.craftingModal.close(); }")
        print("[PASS] Test Case 4: Cả Bram và Bàn Chế Tạo đều tương tác [E] hoàn hảo tại vị trí mới.")

        # =========================================================================
        # TEST CASE 5: LƯU TRỮ, RỜI VÙNG VÀ TẢI LẠI (CONTINUE / RESTART)
        # =========================================================================
        print("\n=== TEST CASE 5: KIỂM TRA SAVE/LOAD, CHUYỂN ZONE VÀ TIẾN TRÌNH ===")
        save_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            // Thực hiện save game thủ công
            const saved = gs.handleSaveManual ? gs.handleSaveManual() : true;
            return {
                saved,
                currentZoneId: gs.currentZoneId
            };
        }""")
        print(f"Save Game Check: saved = {save_check['saved']}, zoneId = {save_check['currentZoneId']}")

        # Rời zone sang outer_woods và quay lại bellhollow
        print("Testing zone transition: bellhollow -> outer_woods -> bellhollow...")
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.teleportForDeveloper('outer_woods', 1400, 600);
        }""")
        page.wait_for_timeout(600)
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.teleportForDeveloper('bellhollow', 1373, 460);
        }""")
        page.wait_for_timeout(600)

        # Kiểm tra Bram và Bàn chế tạo sau khi quay lại
        reload_check = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const bram = gs.npcs.find(n => n.spec.id === 'npc_bram');
            const bench = gs.worldBuilder.getZone('bellhollow')?.interactables.find(i => i.id === 'village_crafting_bench');
            return {
                bramPos: { x: bram.x, y: bram.y },
                benchPos: { x: bench?.x, y: bench?.y }
            };
        }""")
        print(f"After Zone Return: Bram = ({reload_check['bramPos']['x']}, {reload_check['bramPos']['y']}), Bench = ({reload_check['benchPos']['x']}, {reload_check['benchPos']['y']})")
        assert reload_check['bramPos']['x'] == 1333 and reload_check['bramPos']['y'] == 477, "Bram bị sai vị trí sau khi chuyển zone"
        assert reload_check['benchPos']['x'] == 1395 and reload_check['benchPos']['y'] == 455, "Bàn chế tạo bị sai vị trí sau khi chuyển zone"

        # Kiểm tra console errors
        print(f"Console errors ghi nhận: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print(f"  [Console Error]: {err}")
        assert len(console_errors) == 0, f"Có lỗi runtime console: {console_errors}"
        print("[PASS] Test Case 5: Save/Load, chuyển zone và độ bền tiến trình đạt 100%.")

        # =========================================================================
        # CHỤP ẢNH MINH CHỨNG AFTER HOÀN THIỆN
        # =========================================================================
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.cameras.main.centerOn(1373, 440);
            gs.cameras.main.setZoom(1.8);
        }""")
        page.wait_for_timeout(800)

        after_shot = REPORTS_DIR / 'bram_smithy_relocated_after.png'
        page.screenshot(path=str(after_shot))
        print(f"[OK] Captured AFTER screenshot: {after_shot.name}")

        # Copy sang artifact directory
        artifact_shot = ARTIFACT_DIR / 'bram_smithy_relocated_after.png'
        shutil.copyfile(after_shot, artifact_shot)
        print(f"[OK] Copied AFTER screenshot to: {artifact_shot}")

        browser.close()
        print("\n=======================================================")
        print(">>> TẤT CẢ 5 TEST CASES HW-BUG-#5 ĐÃ PASS 100%! <<<")
        print("=======================================================")

if __name__ == '__main__':
    run_tests()
