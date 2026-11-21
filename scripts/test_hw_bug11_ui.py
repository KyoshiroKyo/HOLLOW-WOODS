import sys
import os
import time
import threading
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5262
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

    print("[Test Suite] HW-BUG-#11 Main Menu, Taskbar Input & Dialogue Verification...")

    # =========================================================================
    # TEST 1: Main Menu Title, Subtitle, 5 Buttons, Scrim & Click-away
    # =========================================================================
    t1_code = '''() => {
        const game = window.__PHASER_GAME__;
        const menu = game.scene.getScene('MainMenuScene');

        const children = menu.children.list;
        const textElements = children.filter(c => c.type === 'Text');
        const titleText = textElements.find(t => t.text === 'HOLLOW WOODS');
        const sub1Text = textElements.find(t => t.text === 'DỊ CẢNH RỪNG SƯƠNG');
        const sub2Text = textElements.find(t => t.text === 'THE FOG THAT REMEMBERS');

        const btnNew = menu.children.getByName('menu-new');
        const btnContinue = menu.children.getByName('menu-continue');
        const btnLeaderboard = menu.children.getByName('menu-leaderboard');
        const btnSettings = menu.children.getByName('menu-settings');
        const btnGuide = menu.children.getByName('menu-guide');

        // Check continue button subline text
        let continueSubText = '';
        if (btnContinue && btnContinue.list) {
            const texts = btnContinue.list.filter(c => c.type === 'Text');
            if (texts.length >= 2) {
                continueSubText = texts[1].text;
            }
        }

        return {
            hasTitle: !!titleText,
            titleFontSize: titleText ? titleText.style.fontSize : null,
            hasSub1: !!sub1Text,
            hasSub2: !!sub2Text,
            hasBtnNew: !!btnNew,
            hasBtnContinue: !!btnContinue,
            hasBtnLeaderboard: !!btnLeaderboard,
            hasBtnSettings: !!btnSettings,
            hasBtnGuide: !!btnGuide,
            continueSubText: continueSubText
        };
    }'''

    t1_data = page.evaluate(t1_code)
    test_results['test1_main_menu_layout'] = t1_data
    print(f"[Test 1 Main Menu Layout] {json.dumps(t1_data, ensure_ascii=False)}")
    assert t1_data['hasTitle'] is True, "Title HOLLOW WOODS missing!"
    assert t1_data['hasSub1'] is True, "Subtitle 1 DỊ CẢNH RỪNG SƯƠNG missing!"
    assert t1_data['hasSub2'] is True, "Subtitle 2 THE FOG THAT REMEMBERS missing!"
    assert t1_data['hasBtnNew'] is True, "Button New Game missing!"
    assert t1_data['hasBtnContinue'] is True, "Button Continue missing!"
    assert t1_data['hasBtnLeaderboard'] is True, "Button Leaderboard missing!"
    assert t1_data['hasBtnSettings'] is True, "Button Settings missing!"
    assert t1_data['hasBtnGuide'] is True, "Button Guide missing!"
    assert len(t1_data['continueSubText']) > 0, "Continue subtext is empty!"

    # Test Main Menu Modal Click-away: Settings
    t1_modal_code = '''() => {
        const game = window.__PHASER_GAME__;
        const menu = game.scene.getScene('MainMenuScene');
        menu.showSettingsModal();
        const isOpenBefore = !!menu.activeMenuModal;

        const overlayHit = menu.activeMenuModal.list.find(c => c.type === 'Zone');

        // Click inside modal box (640, 360) -> should stay open
        if (overlayHit) {
            overlayHit.emit('pointerdown', { x: 640, y: 360 });
        }
        const isOpenAfterInsideClick = !!menu.activeMenuModal;

        // Click outside modal box (100, 100) -> should close
        if (overlayHit) {
            overlayHit.emit('pointerdown', { x: 100, y: 100 });
        }
        const isOpenAfterOutsideClick = !!menu.activeMenuModal;

        return {
            isOpenBefore,
            isOpenAfterInsideClick,
            isOpenAfterOutsideClick
        };
    }'''
    t1_modal_data = page.evaluate(t1_modal_code)
    print(f"[Test 1 Settings Click-away] {json.dumps(t1_modal_data)}")
    assert t1_modal_data['isOpenBefore'] is True, "Settings modal should open!"
    assert t1_modal_data['isOpenAfterInsideClick'] is True, "Click inside modal should NOT close it!"
    assert t1_modal_data['isOpenAfterOutsideClick'] is False, "Click outside modal SHOULD close it!"

    # Capture Main Menu Screenshot
    page.screenshot(path='Read/V1.5/Reports/Visuals/hw_bug11_main_menu.png')
    page.screenshot(path='C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_bug11_main_menu.png')
    print("[Screenshot] Captured Main Menu screenshot.")

    # =========================================================================
    # START GAME FOR IN-GAME TESTS
    # =========================================================================
    print("[Playwright] Starting new game for in-game tests...")
    page.evaluate("() => window.__PHASER_GAME__.scene.getScene('MainMenuScene').startNewGame()")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    time.sleep(1.5)

    # =========================================================================
    # TEST 2: Taskbar Buttons & Hotkey Synchronization
    # =========================================================================
    t2_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');

        const taskbarActiveInitial = {
            craft: ui.isTaskbarButtonActive('craft'),
            journal: ui.isTaskbarButtonActive('journal'),
            map: ui.isTaskbarButtonActive('map'),
            pause: ui.isTaskbarButtonActive('pause')
        };

        // Open World Map via toggleWorldMap()
        ui.toggleWorldMap();
        const mapOpen = ui.parchmentWorldMapModal && ui.parchmentWorldMapModal.isOpen;
        const mapTaskbarActive = ui.isTaskbarButtonActive('map');

        // Close World Map via ESC
        ui.handleESC();
        const mapClosedAfterESC = !(ui.parchmentWorldMapModal && ui.parchmentWorldMapModal.isOpen);
        const mapTaskbarInactive = !ui.isTaskbarButtonActive('map');

        // Open Crafting via toggleCrafting()
        ui.toggleCrafting();
        const craftOpen = ui.craftingModal && ui.craftingModal.isOpen;
        const craftTaskbarActive = ui.isTaskbarButtonActive('craft');

        // Close Crafting via ESC
        ui.handleESC();
        const craftClosedAfterESC = !(ui.craftingModal && ui.craftingModal.isOpen);

        // Open Journal via toggleJournal()
        ui.toggleJournal();
        const journalOpen = ui.journalModal && ui.journalModal.isOpen;
        const journalTaskbarActive = ui.isTaskbarButtonActive('journal');

        return {
            taskbarActiveInitial,
            mapOpen,
            mapTaskbarActive,
            mapClosedAfterESC,
            mapTaskbarInactive,
            craftOpen,
            craftTaskbarActive,
            craftClosedAfterESC,
            journalOpen,
            journalTaskbarActive
        };
    }'''

    t2_data = page.evaluate(t2_code)
    test_results['test2_taskbar_sync'] = t2_data
    print(f"[Test 2 Taskbar Synchronization] {json.dumps(t2_data)}")
    assert t2_data['mapOpen'] is True, "World Map should open!"
    assert t2_data['mapTaskbarActive'] is True, "Map taskbar button should show active state!"
    assert t2_data['mapClosedAfterESC'] is True, "World Map should close on ESC!"
    assert t2_data['mapTaskbarInactive'] is True, "Map taskbar button should be inactive after closing!"
    assert t2_data['craftOpen'] is True, "Crafting modal should open!"
    assert t2_data['craftTaskbarActive'] is True, "Crafting taskbar button should show active state!"
    assert t2_data['craftClosedAfterESC'] is True, "Crafting modal should close on ESC!"
    assert t2_data['journalOpen'] is True, "Journal modal should open!"
    assert t2_data['journalTaskbarActive'] is True, "Journal taskbar button should show active state!"

    # =========================================================================
    # TEST 3: Modal Click-away & Input Containment (No Leaked Attacks)
    # =========================================================================
    t3_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');
        const gameScene = game.scene.getScene('GameScene');
        const player = gameScene.player;

        // Journal is currently open from Test 2.
        // Click outside journal at (100, 50) -> should close safely
        player.pendingOneShotActions.clear();
        ui.journalModal.container.list[0].emit('pointerdown', { x: 100, y: 50 });
        const journalClosed = !(ui.journalModal && ui.journalModal.isOpen);

        // Check if attack was triggered
        const leakedAttack = player.pendingOneShotActions.has('attack') || player.pendingOneShotActions.has('heavy_attack');

        // Test Map Click-away
        ui.toggleWorldMap();
        const mapOpen = ui.parchmentWorldMapModal && ui.parchmentWorldMapModal.isOpen;
        player.pendingOneShotActions.clear();
        ui.parchmentWorldMapModal.container.list[0].emit('pointerdown', { x: 50, y: 50 });
        const mapClosed = !(ui.parchmentWorldMapModal && ui.parchmentWorldMapModal.isOpen);
        const mapLeakedAttack = player.pendingOneShotActions.has('attack');

        return {
            journalClosed,
            leakedAttack,
            mapOpen,
            mapClosed,
            mapLeakedAttack
        };
    }'''

    t3_data = page.evaluate(t3_code)
    test_results['test3_clickaway_and_input_containment'] = t3_data
    print(f"[Test 3 Clickaway & Input Containment] {json.dumps(t3_data)}")
    assert t3_data['journalClosed'] is True, "Journal should close on click-away!"
    assert t3_data['leakedAttack'] is False, "Closing modal via click-away leaked an attack!"
    assert t3_data['mapOpen'] is True, "Map should open!"
    assert t3_data['mapClosed'] is True, "Map should close on click-away!"
    assert t3_data['mapLeakedAttack'] is False, "Closing map leaked an attack!"

    # =========================================================================
    # TEST 4: Dialogue UI, Ribbon Alignment & Name/Title Separation
    # =========================================================================
    t4_code = '''() => {
        const game = window.__PHASER_GAME__;
        const ui = game.scene.getScene('UIScene');

        // Test with Garth
        ui.showDialogue('Garth – Người Gác Cổng', 'portrait_garth');
        const nameText = ui.dialogueSpeakerText.text;
        const titleText = ui.dialogueSpeakerTitleText ? ui.dialogueSpeakerTitleText.text : '';
        const titleVisible = ui.dialogueSpeakerTitleText ? ui.dialogueSpeakerTitleText.visible : false;
        const portraitKey = ui.dialoguePortraitSprite.texture.key;
        const portraitAspect = ui.dialoguePortraitSprite.displayWidth / ui.dialoguePortraitSprite.displayHeight;

        // Test with Sir Vaelen (fallback resolution)
        ui.showDialogue('Sir Vaelen — Kỵ Sĩ Trầm Mặc', '');
        const vaelenName = ui.dialogueSpeakerText.text;
        const vaelenTitle = ui.dialogueSpeakerTitleText ? ui.dialogueSpeakerTitleText.text : '';
        const vaelenPortrait = ui.dialoguePortraitSprite.texture.key;

        // Test with Finn
        ui.showDialogue('Finn – Cậu Bé Đưa Tin', '');
        const finnName = ui.dialogueSpeakerText.text;
        const finnTitle = ui.dialogueSpeakerTitleText ? ui.dialogueSpeakerTitleText.text : '';
        const finnPortrait = ui.dialoguePortraitSprite.texture.key;

        // Test typewriter long text
        ui.updateDialogueText('Đêm nay sương mù lại tràn về từ phía Đầm Lầy Im Lặng. Cậu phải hết sức cẩn thận khi bước qua cây cầu gỗ mục nát phía đông...');

        return {
            nameText,
            titleText,
            titleVisible,
            portraitKey,
            portraitAspect,
            vaelenName,
            vaelenTitle,
            vaelenPortrait,
            finnName,
            finnTitle,
            finnPortrait,
            contentWidth: ui.dialogueContentText.style.wordWrapWidth
        };
    }'''

    t4_data = page.evaluate(t4_code)
    test_results['test4_dialogue_ui'] = t4_data
    print(f"[Test 4 Dialogue UI] {json.dumps(t4_data, ensure_ascii=False)}")
    assert t4_data['nameText'] == 'Garth', f"Speaker name should be 'Garth', got {t4_data['nameText']}"
    assert 'Người Gác Cổng' in t4_data['titleText'], f"Speaker title should contain 'Người Gác Cổng', got {t4_data['titleText']}"
    assert t4_data['titleVisible'] is True, "Speaker title should be visible!"
    assert t4_data['portraitKey'] == 'portrait_garth', f"Portrait should be portrait_garth, got {t4_data['portraitKey']}"
    assert abs(t4_data['portraitAspect'] - 1.0) < 0.01, f"Portrait aspect ratio should be 1:1, got {t4_data['portraitAspect']}"
    assert t4_data['vaelenName'] == 'Sir Vaelen', f"Vaelen name should be 'Sir Vaelen', got {t4_data['vaelenName']}"
    assert 'Kỵ Sĩ Trầm Mặc' in t4_data['vaelenTitle'], f"Vaelen title should contain 'Kỵ Sĩ Trầm Mặc', got {t4_data['vaelenTitle']}"
    assert 'campfire_knight' in t4_data['vaelenPortrait'], f"Vaelen portrait should resolve to campfire knight, got {t4_data['vaelenPortrait']}"
    assert t4_data['finnName'] == 'Finn', f"Finn name should be 'Finn', got {t4_data['finnName']}"
    assert 'Cậu Bé Đưa Tin' in t4_data['finnTitle'], f"Finn title should contain 'Cậu Bé Đưa Tin', got {t4_data['finnTitle']}"
    assert t4_data['finnPortrait'] == 'portrait_finn', f"Finn portrait should resolve to portrait_finn, got {t4_data['finnPortrait']}"
    assert t4_data['contentWidth'] == 900, f"Dialogue content wordWrap width should be 900px, got {t4_data['contentWidth']}"

    # Capture Dialogue Screenshot
    page.screenshot(path='Read/V1.5/Reports/Visuals/hw_bug11_dialogue.png')
    page.screenshot(path='C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_bug11_dialogue.png')
    print("[Screenshot] Captured Dialogue UI screenshot.")

    # Hide dialogue
    page.evaluate("() => window.__PHASER_GAME__.scene.getScene('UIScene').hideDialogue()")
    time.sleep(0.3)

    # Capture Taskbar & HUD Screenshot
    page.screenshot(path='Read/V1.5/Reports/Visuals/hw_bug11_taskbar.png')
    page.screenshot(path='C:/Users/Kyoshiro/.gemini/antigravity/brain/dc0f9c86-d78f-43b6-895c-34fe12680156/hw_bug11_taskbar.png')
    print("[Screenshot] Captured Taskbar & HUD screenshot.")

    # =========================================================================
    # TEST 5: NPC Visual Scale & Physics Footprint Stability (BUG-042)
    # =========================================================================
    t5_code = '''() => {
        const game = window.__PHASER_GAME__;
        const gameScene = game.scene.getScene('GameScene');
        const npcs = gameScene.npcs || [];

        const npcData = {};
        for (const npc of npcs) {
            const body = npc.body;
            npcData[npc.baseId] = {
                scaleX: npc.npcSprite.scaleX,
                scaleY: npc.npcSprite.scaleY,
                headOffsetY: npc.headOffsetY,
                bodyWidth: body ? body.width : null,
                bodyHeight: body ? body.height : null,
                bodyLeft: body ? body.x : null,
                bodyBottom: body ? body.bottom : null
            };
        }

        return npcData;
    }'''

    t5_data = page.evaluate(t5_code)
    test_results['test5_npc_scale_and_physics'] = t5_data
    print(f"[Test 5 NPC Scale & Physics] {json.dumps(t5_data)}")

    # Garth verification
    if 'garth' in t5_data:
        g = t5_data['garth']
        assert g['scaleX'] == 1.0, f"Garth scale should be 1.0, got {g['scaleX']}"
        assert g['headOffsetY'] == 52, f"Garth headOffsetY should be 52, got {g['headOffsetY']}"
        assert g['bodyWidth'] == 22, f"Garth bodyWidth should be 22, got {g['bodyWidth']}"
        assert g['bodyHeight'] == 14, f"Garth bodyHeight should be 14, got {g['bodyHeight']}"
        print(f"[Verified] Garth scale 1.0, body 22x14 footprint preserved.")

    # Finn verification
    if 'finn' in t5_data:
        f = t5_data['finn']
        assert f['scaleX'] == 0.85, f"Finn scale should be 0.85, got {f['scaleX']}"
        assert f['headOffsetY'] == 42, f"Finn headOffsetY should be 42, got {f['headOffsetY']}"
        assert f['bodyWidth'] == 14, f"Finn bodyWidth should be 14, got {f['bodyWidth']}"
        assert f['bodyHeight'] == 10, f"Finn bodyHeight should be 10, got {f['bodyHeight']}"
        print(f"[Verified] Finn young boy scale 0.85, body 14x10 preserved.")

    # Bram verification
    if 'bram' in t5_data:
        b = t5_data['bram']
        assert b['scaleX'] == 1.08, f"Bram scale should be 1.08, got {b['scaleX']}"
        assert b['headOffsetY'] == 56, f"Bram headOffsetY should be 56, got {b['headOffsetY']}"
        assert b['bodyWidth'] == 24, f"Bram bodyWidth should be 24, got {b['bodyWidth']}"
        assert b['bodyHeight'] == 14, f"Bram bodyHeight should be 14, got {b['bodyHeight']}"
        print(f"[Verified] Bram blacksmith scale 1.08, body 24x14 preserved.")

    # Edda / Neris verification
    if 'edda' in t5_data:
        e = t5_data['edda']
        assert e['scaleX'] == 0.95, f"Edda scale should be 0.95, got {e['scaleX']}"
        assert e['headOffsetY'] == 48, f"Edda headOffsetY should be 48, got {e['headOffsetY']}"
        assert e['bodyWidth'] == 16, f"Edda bodyWidth should be 16, got {e['bodyWidth']}"
        assert e['bodyHeight'] == 12, f"Edda bodyHeight should be 12, got {e['bodyHeight']}"
        print(f"[Verified] Edda scale 0.95, body 16x12 preserved.")

    if 'neris' in t5_data:
        n = t5_data['neris']
        assert n['scaleX'] == 0.95, f"Neris scale should be 0.95, got {n['scaleX']}"
        assert n['headOffsetY'] == 48, f"Neris headOffsetY should be 48, got {n['headOffsetY']}"
        assert n['bodyWidth'] == 16, f"Neris bodyWidth should be 16, got {n['bodyWidth']}"
        assert n['bodyHeight'] == 12, f"Neris bodyHeight should be 12, got {n['bodyHeight']}"
        print(f"[Verified] Neris scale 0.95, body 16x12 preserved.")

    print("\n=======================================================")
    print("ALL 5/5 HW-BUG-#11 PLAYWRIGHT AUTOMATED TEST CASES PASSED!")
    print("=======================================================")

sys.exit(0)
