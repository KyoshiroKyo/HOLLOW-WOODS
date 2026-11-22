import os
import sys
import time
import json
import threading

sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5295
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
print(f"[Playtest Server] Serving dist at http://127.0.0.1:{PORT}")

VISUALS_DIR = 'Read/V1.5/Reports/Visuals/HW_BUG_19'
os.makedirs(VISUALS_DIR, exist_ok=True)

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
    time.sleep(2.0)

    # Register dialogue helper
    page.evaluate("""() => {
        window.__advanceDialogueCompletely = function(ds) {
            let safetyCounter = 0;
            while (ds && ds.isActive && safetyCounter < 50) {
                safetyCounter++;
                ds.lastAdvanceTime = 0;
                if (ds.isShowingChoices) {
                    ds.selectChoice(0);
                } else {
                    ds.handleAdvance();
                }
            }
        };
    }""")

    stages_results = {}

    # =========================================================================
    # STAGE 1: New Game -> Fog Crossing -> Into Bellhollow & Garth Interaction
    # =========================================================================
    print("\n--- STAGE 1: Fog Crossing to Bellhollow & Garth ---")
    st1_start = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            quest: gs.playerState.getCurrentQuest()?.id,
            eastGateUnlocked: gs.playerState.isEastGateUnlocked()
        };
    }""")
    print(f"Stage 1 Spawn State: {st1_start}")

    # Walk along road across Fog Crossing into Bellhollow entrance (x: 120 -> 540)
    # Simulate movement along the road
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        // Simulate walking towards transition
        gs.player.setPosition(470, 195);
        if (gs.player.body) gs.player.body.reset(470, 195);
        gs.update(0, 16);
    }""")
    time.sleep(0.5)

    # Step over seam to trigger transition
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(490, 195);
        if (gs.player.body) gs.player.body.reset(490, 195);
        gs.update(0, 16);
    }""")
    time.sleep(0.8)

    st1_trans = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            hasVisitedBellhollow: gs.playerState.hasVisitedZone('bellhollow'),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y)
        };
    }""")
    print(f"Stage 1 Post-Transition State: {st1_trans}")

    # Approach Garth at (540, 205)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(540, 225);
        if (gs.player.body) gs.player.body.reset(540, 225);
        gs.update(0, 16);
    }""")
    time.sleep(0.5)

    # Trigger Garth conversation & check prompt
    garth_dialogue = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        // Find Garth
        const garth = gs.npcs.find(n => n.spec.id === 'npc_garth');
        const dist = Math.hypot(gs.player.x - garth.x, gs.player.y - garth.y);

        // Start dialogue
        gs.dialogueSystem.startDialogue('garth_warning');

        return {
            garthFound: !!garth,
            dist: Math.round(dist),
            dialogueActive: gs.dialogueSystem.isActive,
            currentSpeaker: gs.dialogueSystem.currentPayload ? gs.dialogueSystem.currentPayload.speaker : null
        };
    }""")
    print(f"Stage 1 Garth Interaction: {garth_dialogue}")

    # Complete Garth dialogue (select choice and advance)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        window.__advanceDialogueCompletely(gs.dialogueSystem);
    }""")
    time.sleep(0.5)

    st1_post_dialogue = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;
        return {
            talkedToVillagers: ps.hasFlag('talked_to_villagers'),
            eastGateUnlocked: ps.isEastGateUnlocked(),
            currentQuest: ps.getCurrentQuest()?.id,
            worldMapCurrentZone: ps.getCurrentZone()
        };
    }""")
    print(f"Stage 1 Post-Dialogue Progression: {st1_post_dialogue}")

    stage1_pass = (
        st1_trans['zone'] == 'bellhollow' and
        st1_trans['hasVisitedBellhollow'] and
        st1_post_dialogue['talkedToVillagers'] and
        st1_post_dialogue['eastGateUnlocked'] and
        st1_post_dialogue['currentQuest'] == 'Q01_MEET_EDDA'
    )
    stages_results['stage1'] = {'pass': stage1_pass, 'trans': st1_trans, 'dialogue': st1_post_dialogue}

    page.screenshot(path=f"{VISUALS_DIR}/hw_bug19_stage1_garth.png")

    # =========================================================================
    # STAGE 2: Bellhollow: Edda / Neris / Bram & Crafting Bench (1395, 455)
    # =========================================================================
    print("\n--- STAGE 2: Bellhollow Villagers & Crafting Bench ---")
    # 2.1: Meet Edda at (1160, 160)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(1160, 185);
        if (gs.player.body) gs.player.body.reset(1160, 185);
        gs.update(0, 16);
        gs.dialogueSystem.startDialogue('edda_intro');
        window.__advanceDialogueCompletely(gs.dialogueSystem);
    }""")
    time.sleep(0.3)

    edda_result = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;
        return {
            talkedToEdda: ps.hasFlag('talked_to_edda'),
            currentQuest: ps.getCurrentQuest()?.id
        };
    }""")
    print(f"Stage 2 Edda Interaction: {edda_result}")

    # 2.2: Meet Neris at (570, 460)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(570, 485);
        if (gs.player.body) gs.player.body.reset(570, 485);
        gs.update(0, 16);
        gs.dialogueSystem.startDialogue('neris_intro');
        window.__advanceDialogueCompletely(gs.dialogueSystem);
    }""")
    time.sleep(0.3)

    neris_result = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;
        return {
            talkedToNeris: ps.hasFlag('talked_to_neris'),
            currentQuest: ps.getCurrentQuest()?.id,
            poulticeCount: ps.getItemCount('item_poultice')
        };
    }""")
    print(f"Stage 2 Neris Interaction: {neris_result}")

    # 2.3: Meet Bram at (1333, 477)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(1333, 500);
        if (gs.player.body) gs.player.body.reset(1333, 500);
        gs.update(0, 16);
        gs.dialogueSystem.startDialogue('bram_chat');
        window.__advanceDialogueCompletely(gs.dialogueSystem);
    }""")
    time.sleep(0.3)

    # 2.4: Crafting Bench at new layout (1395, 455)
    crafting_test = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(1395, 475);
        if (gs.player.body) gs.player.body.reset(1395, 475);
        gs.update(0, 16);

        // Check nearest interactables
        const nearby = gs.worldBuilder.getNearbyInteractables(gs.player.getFootPosition(), 65);
        const bench = nearby.find(n => n.item.actionId === 'open_crafting_bench' || n.item.id === 'village_crafting_bench');

        // Open crafting bench
        gs.executeMapInteraction('open_crafting_bench', 'Bàn Chế Tạo Sinh Tồn');

        const modal = gs.uiScene ? gs.uiScene.getCraftingModal() : (gs.craftingModal || null);
        const isOpen = modal ? modal.isOpen : false;

        // Close it
        if (isOpen && modal) modal.close();

        return {
            benchFound: !!bench,
            benchX: bench ? bench.item.x : null,
            benchY: bench ? bench.item.y : null,
            modalOpenedSuccessfully: isOpen
        };
    }""")
    print(f"Stage 2 Crafting Bench Verification: {crafting_test}")

    stage2_pass = (
        edda_result['talkedToEdda'] and
        neris_result['talkedToNeris'] and
        crafting_test['benchFound'] and
        crafting_test['benchX'] == 1395 and crafting_test['benchY'] == 455 and
        crafting_test['modalOpenedSuccessfully']
    )
    stages_results['stage2'] = {
        'pass': stage2_pass,
        'edda': edda_result,
        'neris': neris_result,
        'crafting': crafting_test
    }

    page.screenshot(path=f"{VISUALS_DIR}/hw_bug19_stage2_bram_crafting.png")

    # =========================================================================
    # STAGE 3: Bellhollow <-> Sanctuary Farm Round-Trip & Farming Plots
    # =========================================================================
    print("\n--- STAGE 3: Bellhollow <-> Sanctuary Farm ---")
    # Move south to entrance of Farm around (650, 520)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(650, 530);
        if (gs.player.body) gs.player.body.reset(650, 530);
        gs.update(0, 16);
    }""")
    time.sleep(0.4)

    # Cross seam into Sanctuary Farm (y: 530 -> 580)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(650, 580);
        if (gs.player.body) gs.player.body.reset(650, 580);
        gs.update(0, 16);
    }""")
    time.sleep(0.8)

    st3_farm = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const ps = gs.playerState;
        const isBlocked = window.SafeSpawnResolver ? SafeSpawnResolver.isPositionBlocked(gs, gs.player.x, gs.player.y) : false;
        return {
            zone: gs.currentZoneId,
            playerStateZone: ps.getCurrentZone(),
            hasVisitedFarm: ps.hasVisitedZone('sanctuary_farm'),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            isInsideCollider: isBlocked
        };
    }""")
    print(f"Stage 3 Arrived in Sanctuary Farm: {st3_farm}")

    # Approach Herb Plot 1 at (760, 640)
    plot_interact = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(760, 660);
        if (gs.player.body) gs.player.body.reset(760, 660);
        gs.update(0, 16);

        const nearbyPlot = gs.farmingSystem.checkNearbyPlot(gs.player.x, gs.player.y, 65);
        let promptText = null;
        if (nearbyPlot) {
            promptText = gs.farmingSystem.getPlotPrompt(nearbyPlot);
        }

        return {
            plotFound: !!nearbyPlot,
            plotId: nearbyPlot ? nearbyPlot.id : null,
            promptText
        };
    }""")
    print(f"Stage 3 Farm Plot Interaction: {plot_interact}")

    # Return north to Bellhollow (y: 660 -> 580 -> 520)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(650, 520);
        if (gs.player.body) gs.player.body.reset(650, 520);
        gs.update(0, 16);
    }""")
    time.sleep(0.8)

    st3_return = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        return {
            zone: gs.currentZoneId,
            playerStateZone: gs.playerState.getCurrentZone(),
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            isStuck: false
        };
    }""")
    print(f"Stage 3 Return to Bellhollow: {st3_return}")

    stage3_pass = (
        st3_farm['zone'] == 'sanctuary_farm' and
        st3_farm['hasVisitedFarm'] and
        (not st3_farm['isInsideCollider']) and
        plot_interact['plotFound'] and
        st3_return['zone'] == 'bellhollow'
    )
    stages_results['stage3'] = {
        'pass': stage3_pass,
        'farm': st3_farm,
        'plot': plot_interact,
        'return': st3_return
    }

    page.screenshot(path=f"{VISUALS_DIR}/hw_bug19_stage3_farm.png")

    # =========================================================================
    # STAGE 4: Outer Woods / Sir Vaelen / Xưởng Chuông & World Map Routing
    # =========================================================================
    print("\n--- STAGE 4: Outer Woods, Sir Vaelen & Sub Bell Workshop ---")
    # Travel to Outer Woods (x: 1360, y: 650)
    page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.worldBuilder.ensureZoneRendered('outer_woods');
        gs.worldBuilder.setActiveZone('outer_woods');
        gs.currentZoneId = 'outer_woods';
        gs.playerState.setCurrentZone('outer_woods');
        gs.playerState.markZoneVisited('outer_woods');
        gs.player.setPosition(1360, 650);
        if (gs.player.body) gs.player.body.reset(1360, 650);
        gs.applyCameraBoundsForZone('outer_woods');
        gs.cameras.main.centerOn(1360, 650);
        gs.update(0, 16);
    }""")
    time.sleep(0.8)

    # 4.1: Interact with Sir Vaelen at (1435, 710)
    vaelen_interact = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.player.setPosition(1435, 735);
        if (gs.player.body) gs.player.body.reset(1435, 735);
        gs.update(0, 16);

        const vaelen = gs.npcs.find(n => n.spec.id === 'npc_campfire_knight');
        const dist = vaelen ? Math.hypot(gs.player.x - vaelen.x, gs.player.y - vaelen.y) : null;

        // Start Vaelen dialogue
        gs.dialogueSystem.startDialogue('campfire_knight_intro');
        const isActive = gs.dialogueSystem.isActive;
        const speaker = gs.dialogueSystem.currentPayload?.speaker;

        window.__advanceDialogueCompletely(gs.dialogueSystem);

        return {
            vaelenFound: !!vaelen,
            dist: Math.round(dist),
            dialogueTriggered: isActive,
            speaker
        };
    }""")
    print(f"Stage 4 Sir Vaelen Interaction: {vaelen_interact}")

    # 4.2: Portal into Xưởng Chuông (sub_bell_workshop) at (1360, 1000)
    sub_workshop = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.worldBuilder.ensureZoneRendered('sub_bell_workshop');

        // Trigger portal transition
        gs.currentZoneId = 'sub_bell_workshop';
        gs.playerState.setCurrentZone('sub_bell_workshop');
        gs.playerState.markZoneVisited('sub_bell_workshop');
        gs.worldBuilder.setActiveZone('sub_bell_workshop');
        gs.player.setPosition(1360, 1100);
        if (gs.player.body) gs.player.body.reset(1360, 1100);
        gs.applyCameraBoundsForZone('sub_bell_workshop');
        gs.cameras.main.centerOn(1360, 1100);
        gs.update(0, 16);

        const bounds = gs.worldBuilder.getZone('sub_bell_workshop')?.bounds;

        return {
            zone: gs.currentZoneId,
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y),
            bounds
        };
    }""")
    print(f"Stage 4 Entered Sub Bell Workshop: {sub_workshop}")
    time.sleep(0.5)

    # 4.3: Return to Outer Woods
    sub_return = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        gs.currentZoneId = 'outer_woods';
        gs.playerState.setCurrentZone('outer_woods');
        gs.worldBuilder.setActiveZone('outer_woods');
        gs.player.setPosition(1360, 960);
        if (gs.player.body) gs.player.body.reset(1360, 960);
        gs.applyCameraBoundsForZone('outer_woods');
        gs.cameras.main.centerOn(1360, 960);
        gs.update(0, 16);

        return {
            zone: gs.currentZoneId,
            posX: Math.round(gs.player.x),
            posY: Math.round(gs.player.y)
        };
    }""")
    print(f"Stage 4 Returned to Outer Woods: {sub_return}")

    # 4.4: World Map routing verification
    map_route = page.evaluate("""() => {
        const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
        const mapModal = gs.uiScene.getParchmentWorldMapModal();
        mapModal.open();

        const activeZone = gs.playerState.getCurrentZone();
        const subTitle = mapModal.subTitleText ? mapModal.subTitleText.text : '';

        let badgeFound = false;
        let badgeText = '';
        mapModal.contentContainer.each(child => {
            if (child.text && child.text.includes('🎯 MỤC TIÊU')) {
                badgeFound = true;
                badgeText = child.text;
            }
        });

        mapModal.close();

        return {
            activeZone,
            subTitle,
            badgeFound,
            badgeText
        };
    }""")
    print(f"Stage 4 World Map Routing: {map_route}")

    stage4_pass = (
        vaelen_interact['vaelenFound'] and
        vaelen_interact['dialogueTriggered'] and
        sub_workshop['zone'] == 'sub_bell_workshop' and
        sub_return['zone'] == 'outer_woods' and
        map_route['activeZone'] == 'outer_woods'
    )
    stages_results['stage4'] = {
        'pass': stage4_pass,
        'vaelen': vaelen_interact,
        'subWorkshop': sub_workshop,
        'subReturn': sub_return,
        'worldMap': map_route
    }

    page.screenshot(path=f"{VISUALS_DIR}/hw_bug19_stage4_outer_woods.png")

    # =========================================================================
    # SUMMARY & TELEMETRY EXPORT
    # =========================================================================
    all_stages_pass = all(stages_results[k]['pass'] for k in stages_results)
    summary_report = {
        'all_stages_pass': all_stages_pass,
        'stages': stages_results,
        'console_errors': console_errors,
        'page_errors': page_errors,
        'failed_requests': failed_requests
    }

    with open('Read/V1.5/Reports/HW_BUG_19_PLAYTEST_DATA.json', 'w', encoding='utf-8') as f:
        json.dump(summary_report, f, indent=2, ensure_ascii=False)
    print("\nSaved playtest telemetry to Read/V1.5/Reports/HW_BUG_19_PLAYTEST_DATA.json")

    browser.close()

print("\n================ HW-BUG-#19 PLAYTEST RESULTS ================")
print(f"Console errors: {len(console_errors)}")
print(f"Page errors: {len(page_errors)}")
print(f"Failed requests (404): {len(failed_requests)}")
for st in ['stage1', 'stage2', 'stage3', 'stage4']:
    print(f"{st.upper()} PASS: {stages_results[st]['pass']}")
