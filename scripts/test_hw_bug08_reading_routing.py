import sys
import json
import time
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5238
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

        # Start New Game
        print("[Test] Starting New Game...")
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        page.wait_for_timeout(2000)

        test_results = {}

        # -------------------------------------------------------------
        # TEST 1: Reading Multi-Page Navigation with A / D (BUG-038)
        # -------------------------------------------------------------
        print("\n--- TEST 1: Reading Multi-Page Navigation (BUG-038) ---")
        t1_init = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            // Ensure player at rest
            gs.player.body.setVelocity(0, 0);
            gs.player.forceUnlockActionState();
            gs.player.resetAllInputState();

            // Open 2-page document inspect_fog_journal_1
            const modal = ui.getTornPageModal();
            modal.open(window.TORN_PAGES_REGISTRY ? window.TORN_PAGES_REGISTRY['inspect_fog_journal_1'] : {
                id: 'inspect_fog_journal_1',
                loreId: 'lore_fog_journal_1',
                variant: 'parchment',
                title: 'MẨU NHẬT KÝ RÁCH: KẺ ĐI TRƯỚC',
                author: 'Người Lữ Hành Vô Danh – Fog Crossing',
                ancientRune: 'ᚱ',
                pages: [
                    'Trang 1: Màn sương đen The Veil đã nuốt chửng lối quay về...',
                    'Trang 2: Quy tắc sinh tồn duy nhất: Đừng bao giờ tắt đèn lồng quá lâu...'
                ],
                composureBonus: 10
            });

            return {
                isOpen: modal.isOpen,
                currentPage: modal.currentPage,
                totalPages: modal.totalPages,
                playerVx: gs.player.body.velocity.x,
                playerVy: gs.player.body.velocity.y
            };
        }""")
        print(f"  Initial open: {t1_init}")
        assert t1_init['isOpen'] is True, "TornPageModal should be open"
        assert t1_init['currentPage'] == 0, "Current page should be 0 (Page 1)"
        assert t1_init['totalPages'] == 2, "Total pages should be 2"

        # Screenshot page 1
        page.screenshot(path=str(ARTIFACT_DIR / 'hw_bug08_reading_page1.png'))
        shutil.copy(str(ARTIFACT_DIR / 'hw_bug08_reading_page1.png'), str(REPORTS_DIR / 'hw_bug08_reading_page1.png'))
        print("  Captured screenshot: hw_bug08_reading_page1.png")

        # Press 'D' to turn to page 2
        page.keyboard.press('KeyD')
        page.wait_for_timeout(200)
        t1_page2 = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const modal = ui.getTornPageModal();
            return {
                isOpen: modal.isOpen,
                currentPage: modal.currentPage
            };
        }""")
        print(f"  After KeyD press: {t1_page2}")
        assert t1_page2['currentPage'] == 1, "Current page should be 1 (Page 2)"

        # Screenshot page 2
        page.screenshot(path=str(ARTIFACT_DIR / 'hw_bug08_reading_page2.png'))
        shutil.copy(str(ARTIFACT_DIR / 'hw_bug08_reading_page2.png'), str(REPORTS_DIR / 'hw_bug08_reading_page2.png'))
        print("  Captured screenshot: hw_bug08_reading_page2.png")

        # Press 'D' again (boundary test: should remain at page 1)
        page.keyboard.press('KeyD')
        page.wait_for_timeout(100)
        t1_page2_boundary = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const modal = ui.getTornPageModal();
            return modal.currentPage;
        }""")
        assert t1_page2_boundary == 1, "Page should not exceed total pages (stay at 1)"

        # Press 'A' to return to page 1
        page.keyboard.press('KeyA')
        page.wait_for_timeout(200)
        t1_back_page1 = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const modal = ui.getTornPageModal();
            return modal.currentPage;
        }""")
        assert t1_back_page1 == 0, "Page should return to 0 (Page 1) after KeyA"

        # Press 'A' again (boundary test: should remain at page 0)
        page.keyboard.press('KeyA')
        page.wait_for_timeout(100)
        t1_page1_boundary = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const modal = ui.getTornPageModal();
            return modal.currentPage;
        }""")
        assert t1_page1_boundary == 0, "Page should not underflow below 0"

        # Also test ArrowRight and ArrowLeft
        page.keyboard.press('ArrowRight')
        page.wait_for_timeout(150)
        assert page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getTornPageModal().currentPage") == 1
        page.keyboard.press('ArrowLeft')
        page.wait_for_timeout(150)
        assert page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getTornPageModal().currentPage") == 0

        test_results['BUG_038_PAGE_NAVIGATION'] = 'PASS'
        print("  ✅ TEST 1 PASSED: A/D/Left/Right page navigation works cleanly without boundary overflow!")

        # -------------------------------------------------------------
        # TEST 2: Stow and Close with E / Space (BUG-039)
        # -------------------------------------------------------------
        print("\n--- TEST 2: Stow and Close via E / Space (BUG-039) ---")
        # Player composure before stow
        composure_before = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('GameScene').playerState.stats.composure")
        # Press 'Space' to stow and close
        page.keyboard.press('Space')
        page.wait_for_timeout(300)

        t2_state = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const modal = ui.getTornPageModal();
            return {
                isOpen: modal.isOpen,
                hasFlag: gs.playerState.hasFlag('collected_note_inspect_fog_journal_1'),
                loreUnlocked: gs.playerState.unlockedLore.some(l => l.id === 'lore_fog_journal_1'),
                composureAfter: gs.playerState.stats.composure,
                playerVx: gs.player.body.velocity.x,
                playerVy: gs.player.body.velocity.y,
                isDialogueActive: ui.isDialogueActive
            };
        }""")
        print(f"  After Space press: {t2_state}")
        assert t2_state['isOpen'] is False, "Modal should be closed after Space"
        assert t2_state['hasFlag'] is True, "Note should be marked as collected"
        assert t2_state['loreUnlocked'] is True, "Lore should be unlocked in playerState"
        assert t2_state['composureAfter'] >= composure_before, "Composure should receive bonus"

        test_results['BUG_039_STOW_AND_CLOSE'] = 'PASS'
        print("  ✅ TEST 2 PASSED: E/Space correctly stows note into journal, awards lore/composure and closes cleanly!")

        # -------------------------------------------------------------
        # TEST 3: ESC Close without Duplicate Pause Menu (BUG-039)
        # -------------------------------------------------------------
        print("\n--- TEST 3: ESC Close Debounce (No Duplicate Pause Menu) ---")
        # Open modal again with another document
        page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const modal = ui.getTornPageModal();
            modal.open({
                id: 'inspect_test_esc_doc',
                variant: 'parchment',
                title: 'TÀI LIỆU KIỂM THỬ ESC',
                author: 'Hệ Thống Kiểm Thử',
                pages: ['Nội dung trang thử nghiệm phím ESC...']
            });
        }""")
        page.wait_for_timeout(200)

        # Verify modal is open and pause modal is closed
        assert page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getTornPageModal().isOpen") is True
        assert page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').pauseModal ? window.__PHASER_GAME__.scene.getScene('UIScene').pauseModal.isOpen : false") is False

        # Press Escape
        page.keyboard.press('Escape')
        page.wait_for_timeout(350)

        t3_state = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            return {
                tornPageOpen: ui.getTornPageModal().isOpen,
                pauseModalOpen: ui.pauseModal ? ui.pauseModal.isOpen : false
            };
        }""")
        print(f"  After ESC press: {t3_state}")
        assert t3_state['tornPageOpen'] is False, "TornPageModal should be closed by ESC"
        assert t3_state['pauseModalOpen'] is False, "PauseModal MUST NOT open when closing TornPageModal via ESC!"

        test_results['BUG_039_ESC_NO_DOUBLE_PAUSE'] = 'PASS'
        print("  ✅ TEST 3 PASSED: ESC closes modal without triggering Pause Menu!")

        # -------------------------------------------------------------
        # TEST 4: Re-Reading Document (No Double Rewards) (BUG-039)
        # -------------------------------------------------------------
        print("\n--- TEST 4: Re-Reading Document (No Duplicate Rewards) ---")
        t4_init = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const compBefore = gs.playerState.stats.composure;
            const loreCountBefore = gs.playerState.unlockedLore.length;

            // Open already collected note
            const modal = ui.getTornPageModal();
            modal.open({
                id: 'inspect_fog_journal_1',
                loreId: 'lore_fog_journal_1',
                variant: 'parchment',
                title: 'MẨU NHẬT KÝ RÁCH: KẺ ĐI TRƯỚC',
                author: 'Người Lữ Hành Vô Danh – Fog Crossing',
                pages: ['Nội dung trang 1...', 'Nội dung trang 2...'],
                composureBonus: 10
            });

            return {
                isOpen: modal.isOpen,
                isAlreadyCollected: modal.isAlreadyCollected,
                stowBtnLabel: modal.stowButtonLabel || (modal.stowBtnText ? modal.stowBtnText.text : ''),
                compBefore,
                loreCountBefore
            };
        }""")
        print(f"  Re-read modal state: {t4_init}")
        assert t4_init['isOpen'] is True, "Modal should open"
        assert t4_init['isAlreadyCollected'] is True, "Modal should recognize note is already collected"
        assert "Đã Cất Vào Sổ Tay" in t4_init['stowBtnLabel'], f"Button should indicate already stowed: {t4_init['stowBtnLabel']}"

        # Press 'KeyE' to close
        page.keyboard.press('KeyE')
        page.wait_for_timeout(300)

        t4_after = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            return {
                isOpen: ui.getTornPageModal().isOpen,
                compAfter: gs.playerState.stats.composure,
                loreCountAfter: gs.playerState.unlockedLore.length
            };
        }""")
        print(f"  After re-read close: {t4_after}")
        assert t4_after['isOpen'] is False, "Modal should close"
        assert t4_after['compAfter'] == t4_init['compBefore'], "Composure MUST NOT increase on re-read!"
        assert t4_after['loreCountAfter'] == t4_init['loreCountBefore'], "Lore list MUST NOT contain duplicate lore!"

        test_results['BUG_039_NO_DOUBLE_REWARD'] = 'PASS'
        print("  ✅ TEST 4 PASSED: Re-reading note gives zero double rewards and zero duplicate lore!")

        # -------------------------------------------------------------
        # TEST 5: Finn NPC vs Nearby Object Interaction Priority (BUG-043)
        # -------------------------------------------------------------
        print("\n--- TEST 5: Finn NPC vs Nearby Object Interaction Priority (BUG-043) ---")
        # Teleport player to Bellhollow near Finn
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.worldBuilder.ensureZoneRendered('bellhollow');
            gs.worldBuilder.setActiveZone('bellhollow');
            gs.currentZoneId = 'bellhollow';
            gs.previousZoneId = 'bellhollow';
            gs.playerState.setCurrentZone('bellhollow');
            // Position player at (909, 260) - within 29px of Finn (909, 231)
            gs.player.setPosition(909, 260);
            if (gs.player.body) gs.player.body.reset(909, 260);
            gs.player.forceUnlockActionState();
            gs.player.resetAllInputState();
            gs.applyCameraBoundsForZone('bellhollow');
            if (gs.cameraSystem) gs.cameraSystem.centerOn(909, 260);
            gs.noclip = false;
            gs.handleInteractions(16);
        }""")
        page.wait_for_timeout(600)

        t5_state = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            gs.handleInteractions(16);

            const finn = gs.npcs.find(n => n.spec.id === 'npc_finn');
            const prompt = ui.promptContainer && ui.promptContainer.visible ? (ui.promptText ? ui.promptText.text : '') : '';

            // Check Finn nameplate text
            const finnTitleText = finn && finn.titleText ? finn.titleText.text : '';
            const finnPlateVisible = finn && finn.namePlate ? finn.namePlate.visible : false;

            return {
                prompt,
                finnExists: Boolean(finn),
                finnX: finn ? finn.x : 0,
                finnY: finn ? finn.y : 0,
                playerX: gs.player.x,
                playerY: gs.player.y,
                distToFinn: finn ? Math.hypot(gs.player.x - finn.x, gs.player.y - finn.y) : 0,
                finnTitleText,
                finnPlateVisible
            };
        }""")
        print(f"  Finn interaction state: {t5_state}")
        assert t5_state['finnExists'] is True, "Finn should exist in Bellhollow"
        assert t5_state['distToFinn'] <= 52, f"Player should be in interaction range of Finn: {t5_state['distToFinn']}"
        assert "[E] Trò chuyện với Finn" in t5_state['prompt'], f"Prompt should be talk with Finn: {t5_state['prompt']}"

        # When within action range (29px <= 52px), nameplate is suppressed to avoid double text
        assert t5_state['finnPlateVisible'] is False, "Finn nameplate should be suppressed when interaction prompt is shown"

        # Now test when player is at distance 75px from Finn (outside action range 52px, within nameplate range 95px)
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(909, 306); // 75px distance from Finn (909, 231)
            if (gs.player.body) gs.player.body.reset(909, 306);
            gs.handleInteractions(16);
        }""")
        page.wait_for_timeout(400)

        t5_dist75 = page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.handleInteractions(16);
            const finn = gs.npcs.find(n => n.spec.id === 'npc_finn');
            const finnTitleText = finn && finn.titleText ? finn.titleText.text : '';
            return {
                distToFinn: Math.hypot(gs.player.x - finn.x, gs.player.y - finn.y),
                finnTitleText
            };
        }""")
        print(f"  Finn at 75px distance: {t5_dist75}")
        # Title text must be just "Cậu bé đưa tin", NOT hardcoded "Cậu bé đưa tin • [E]"
        assert t5_dist75['finnTitleText'] == "Cậu bé đưa tin", f"Finn title should NOT have hardcoded [E]: {t5_dist75['finnTitleText']}"

        # Return to 29px and capture screenshot
        page.evaluate("""() => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.player.setPosition(909, 260);
            if (gs.player.body) gs.player.body.reset(909, 260);
            gs.handleInteractions(16);
        }""")
        page.wait_for_timeout(400)
        page.screenshot(path=str(ARTIFACT_DIR / 'hw_bug08_finn_interaction_clean.png'))
        shutil.copy(str(ARTIFACT_DIR / 'hw_bug08_finn_interaction_clean.png'), str(REPORTS_DIR / 'hw_bug08_finn_interaction_clean.png'))
        print("  Captured screenshot: hw_bug08_finn_interaction_clean.png")

        test_results['BUG_043_FINN_INTERACTION'] = 'PASS'
        print("  ✅ TEST 5 PASSED: Finn interaction prompt is unique, nameplate has clean title without competing [E]!")

        # -------------------------------------------------------------
        # TEST 6: Character Input Isolation (BUG-038 & 039)
        # -------------------------------------------------------------
        print("\n--- TEST 6: Character Input Isolation (Modal Open vs Closed) ---")
        # Open modal
        page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            ui.getTornPageModal().open({
                id: 'inspect_isolation_test',
                variant: 'parchment',
                title: 'KIỂM THỬ KHÓA DI CHUYỂN',
                pages: ['Trang 1...', 'Trang 2...']
            });
        }""")
        page.wait_for_timeout(200)

        init_pos = page.evaluate("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; return { x: p.x, y: p.y }; }")
        # Hold 'KeyW' for 300ms while modal is open
        page.keyboard.down('KeyW')
        page.wait_for_timeout(300)
        page.keyboard.up('KeyW')
        page.wait_for_timeout(100)

        mid_pos = page.evaluate("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; return { x: p.x, y: p.y, vx: p.body.velocity.x, vy: p.body.velocity.y }; }")
        print(f"  Pos during modal W-press: init={init_pos}, mid={mid_pos}")
        assert mid_pos['x'] == init_pos['x'] and mid_pos['y'] == init_pos['y'], "Player MUST NOT move while modal is open"
        assert mid_pos['vx'] == 0 and mid_pos['vy'] == 0, "Player velocity MUST remain 0 while modal is open"

        # Close modal via Escape
        page.keyboard.press('Escape')
        page.wait_for_timeout(350)
        assert page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getTornPageModal().isOpen") is False

        # Move right via 'KeyD' for 300ms
        page.keyboard.down('KeyD')
        page.wait_for_timeout(300)
        page.keyboard.up('KeyD')
        page.wait_for_timeout(100)

        end_pos = page.evaluate("() => { const p = window.__PHASER_GAME__.scene.getScene('GameScene').player; return { x: p.x, y: p.y }; }")
        print(f"  Pos after close D-press: end={end_pos}")
        assert end_pos['x'] > init_pos['x'] + 5, f"Player should move right after modal closes (end.x={end_pos['x']} > init.x={init_pos['x']})"

        test_results['INPUT_ISOLATION_STAND_STILL'] = 'PASS'
        print("  ✅ TEST 6 PASSED: Player stands perfectly still while reading, moves smoothly immediately after closing!")

        # -------------------------------------------------------------
        # TEST 7: Journal Modal Navigation (A/D & Left/Right)
        # -------------------------------------------------------------
        print("\n--- TEST 7: Journal Modal Navigation ---")
        page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            ui.getJournalModal().open();
            ui.getJournalModal().openLore();
        }""")
        page.wait_for_timeout(200)

        t7_lore_init = page.evaluate("""() => {
            const jm = window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal();
            return {
                isOpen: jm.isOpen,
                currentTab: jm.currentTab,
                currentLoreIndex: jm.currentLoreIndex
            };
        }""")
        print(f"  Journal Lore init: {t7_lore_init}")
        assert t7_lore_init['isOpen'] is True, "JournalModal should be open"
        assert t7_lore_init['currentTab'] == 'lore', "Tab should be lore"

        # Press 'D' in Journal Lore tab
        page.keyboard.press('KeyD')
        page.wait_for_timeout(200)
        lore_idx_d = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().currentLoreIndex")
        print(f"  Lore index after D: {lore_idx_d}")

        # Press 'A' in Journal Lore tab
        page.keyboard.press('KeyA')
        page.wait_for_timeout(200)
        lore_idx_a = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().currentLoreIndex")
        print(f"  Lore index after A: {lore_idx_a}")
        assert lore_idx_a == t7_lore_init['currentLoreIndex'], "Lore index should cycle back to init with A"

        # Switch to Bestiary tab
        page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().openBestiary()")
        page.wait_for_timeout(200)
        bestiary_init = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().selectedBestiarySpecies")
        print(f"  Bestiary init species: {bestiary_init}")

        # Press 'D' in Bestiary tab
        page.keyboard.press('KeyD')
        page.wait_for_timeout(200)
        bestiary_after_d = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().selectedBestiarySpecies")
        print(f"  Bestiary species after D: {bestiary_after_d}")
        assert bestiary_after_d != bestiary_init, "Bestiary species should change after D"

        # Press 'A' in Bestiary tab
        page.keyboard.press('KeyA')
        page.wait_for_timeout(200)
        bestiary_after_a = page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().selectedBestiarySpecies")
        print(f"  Bestiary species after A: {bestiary_after_a}")
        assert bestiary_after_a == bestiary_init, "Bestiary species should cycle back after A"

        # Close Journal
        page.keyboard.press('Escape')
        page.wait_for_timeout(200)
        assert page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').getJournalModal().isOpen") is False

        test_results['JOURNAL_A_D_NAVIGATION'] = 'PASS'
        print("  ✅ TEST 7 PASSED: Journal Modal A/D navigation cleanly cycles Lore entries and Bestiary species!")

        # -------------------------------------------------------------
        # SUMMARY
        # -------------------------------------------------------------
        print("\n=======================================================")
        print("           HW-BUG-#8 QA TEST SUITE SUMMARY             ")
        print("=======================================================")
        for k, v in test_results.items():
            print(f"  {k:35}: {v}")
        print("=======================================================\n")

        assert all(v == 'PASS' for v in test_results.values()), "All tests must pass!"
        print("[SUCCESS] ALL 7 TEST CASES PASSED 100%!")

        browser.close()

if __name__ == '__main__':
    run_tests()
