import sys
import json
import time
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

PORT = 5237
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
    test_results = {}
    
    # =========================================================================
    # TEST 1: ASSET & ATLAS INTEGRITY (OFFLINE VERIFICATION)
    # =========================================================================
    print("\n--- TEST 1: ASSET & ATLAS INTEGRITY ---")
    atlas_png_path = ROOT / 'public' / 'assets' / 'atlases' / 'item_icons_atlas.png'
    atlas_json_path = ROOT / 'public' / 'assets' / 'atlases' / 'item_icons_atlas.json'
    items_json_path = ROOT / 'src' / 'data' / 'items.json'
    contact_sheet_path = REPORTS_DIR / 'item_icons_contact_sheet.png'
    
    assert atlas_png_path.exists(), f"Atlas PNG missing: {atlas_png_path}"
    assert atlas_json_path.exists(), f"Atlas JSON missing: {atlas_json_path}"
    assert items_json_path.exists(), f"Items JSON missing: {items_json_path}"
    assert contact_sheet_path.exists(), f"Contact sheet missing: {contact_sheet_path}"
    
    with open(items_json_path, 'r', encoding='utf-8') as f:
        items_meta = json.load(f)['items']
    with open(atlas_json_path, 'r', encoding='utf-8') as f:
        atlas_meta = json.load(f)['frames']
        
    atlas_img = Image.open(atlas_png_path).convert('RGBA')
    
    missing_items = []
    blank_frames = []
    for it in items_meta:
        it_id = it['id']
        if it_id not in atlas_meta:
            missing_items.append(it_id)
            continue
        rect = atlas_meta[it_id]['frame']
        assert rect['w'] == 16 and rect['h'] == 16, f"Frame {it_id} size {rect['w']}x{rect['h']} != 16x16"
        crop = atlas_img.crop((rect['x'], rect['y'], rect['x'] + 16, rect['y'] + 16))
        # check alpha pixels
        non_zero = sum(1 for p in crop.getdata() if p[3] > 20)
        if non_zero < 20:
            blank_frames.append((it_id, non_zero))
            
    print(f"Total items in items.json: {len(items_meta)}")
    print(f"Total frames in item_icons_atlas: {len(atlas_meta)}")
    print(f"Missing items: {missing_items}")
    print(f"Blank frames (<20 non-zero pixels): {blank_frames}")
    
    # Check aliases
    aliases = ['item_runed_iron_part', 'food_root_soup', 'quest_corrupted_knight_crest']
    missing_aliases = [a for a in aliases if a not in atlas_meta]
    print(f"Missing aliases: {missing_aliases}")
    
    test_1_pass = (len(missing_items) == 0 and len(blank_frames) == 0 and len(missing_aliases) == 0)
    test_results['test_1_asset_atlas_integrity'] = test_1_pass
    print(f"TEST 1 RESULT: {'PASS' if test_1_pass else 'FAIL'}")
    assert test_1_pass, "Test 1 failed!"

    # =========================================================================
    # BROWSER AUTOMATION TESTS WITH PLAYWRIGHT
    # =========================================================================
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
        network_404s = []
        
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("response", lambda res: network_404s.append(res.url) if res.status == 404 else None)

        print(f"\n[Test] Loading game at http://127.0.0.1:{PORT}/?dev=1 ...")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.wait_for_timeout(500)

        # 1. Start New Game
        print("[Test] Starting New Game...")
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        page.wait_for_timeout(2000)

        # =========================================================================
        # TEST 2: RUNTIME PRELOAD & TEXTURE RESOLUTION
        # =========================================================================
        print("\n--- TEST 2: RUNTIME PRELOAD & ATLAS RESOLUTION ---")
        t2_eval = page.evaluate("""() => {
            const game = window.__PHASER_GAME__;
            const textures = game.textures;
            const hasAtlas = textures.exists('item_icons_atlas');
            if (!hasAtlas) return { hasAtlas: false, error: 'Atlas item_icons_atlas not in texture manager' };
            
            const atlas = textures.get('item_icons_atlas');
            const items = window.__PHASER_GAME__.scene.getScene('GameScene').playerState.itemData?.items || [];
            
            // Check all 43 item keys
            const itemKeys = [
                'res_dry_wood', 'res_flint', 'res_tree_resin', 'res_herbs', 'seed_herbs',
                'item_lantern_oil', 'item_herbal_poultice', 'item_noise_lure', 'quest_bronze_clapper',
                'lore_satyr_journal', 'mat_forest_rope', 'mat_charcoal', 'mat_runed_iron',
                'food_calming_tea', 'food_roasted_mushroom', 'food_forest_root_soup', 'res_forest_roots',
                'res_forest_mushroom', 'res_tough_fiber', 'seed_roots', 'seed_mushroom', 'seed_fiber',
                'eqp_moss_cloak', 'eqp_trail_boots', 'eqp_field_backpack', 'eqp_bell_ward_charm',
                'wpn_walking_staff', 'wpn_iron_spear', 'wpn_hunting_hatchet', 'item_resin_flare',
                'item_bell_mold', 'item_medicinal_roots', 'relic_heart_of_roots', 'item_broken_patrol_lantern',
                'item_root_flower', 'mat_skull_fang', 'mat_shadow_essence', 'quest_corrupted_crest',
                'item_knight_journal_page', 'quest_rune_fragment', 'quest_purification_key',
                'eqp_skull_fang_charm', 'eqp_abyssal_ward_charm'
            ];
            
            const missingFrames = [];
            for (const key of itemKeys) {
                if (!atlas.has(key)) {
                    missingFrames.push(key);
                }
            }
            
            return {
                hasAtlas: true,
                totalFrames: atlas.getFrameNames().length,
                checkedCount: itemKeys.length,
                missingFrames
            };
        }""")
        print("Test 2 eval:", t2_eval)
        test_2_pass = (t2_eval.get('hasAtlas') is True and len(t2_eval.get('missingFrames', [])) == 0)
        test_results['test_2_runtime_preload'] = test_2_pass
        print(f"TEST 2 RESULT: {'PASS' if test_2_pass else 'FAIL'}")
        assert test_2_pass, f"Test 2 failed: {t2_eval}"

        # =========================================================================
        # TEST 3: QUICKBAR / HOTBAR UI INTEGRITY & ZERO EMOJI FALLBACK
        # =========================================================================
        print("\n--- TEST 3: HOTBAR UI PIXEL ART INTEGRITY ---")
        t3_eval = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const ps = ui.playerState;
            
            // Clear inventory first
            ps.inventory.clear();
            
            // Set 8 specific items
            const testItems = [
                ['item_herbal_poultice', 5],
                ['item_lantern_oil', 3],
                ['res_dry_wood', 12],
                ['res_flint', 4],
                ['wpn_hunting_hatchet', 1],
                ['eqp_moss_cloak', 1],
                ['mat_runed_iron', 2],
                ['quest_bronze_clapper', 1]
            ];
            for (const [id, count] of testItems) {
                ps.addItem(id, count);
            }
            
            ui.updateQuickSlotCounts();
            
            const slots = [];
            for (let i = 0; i < 8; i++) {
                const img = ui.inventorySlotImages[i];
                const txt = ui.inventorySlotIcons[i];
                const countTxt = ui.inventorySlotCounts[i];
                slots.push({
                    slotIndex: i,
                    imgVisible: img.visible,
                    imgTexture: img.texture?.key,
                    imgFrame: img.frame?.name,
                    imgAlpha: img.alpha,
                    textStr: txt.text,
                    countStr: countTxt.text
                });
            }
            
            return { slots };
        }""")
        print("Hotbar slots verification:")
        all_hotbar_imgs_ok = True
        for s in t3_eval['slots']:
            print(f"  Slot {s['slotIndex']}: imgVisible={s['imgVisible']}, tex={s['imgTexture']}, frame={s['imgFrame']}, text='{s['textStr']}', count='{s['countStr']}'")
            if not s['imgVisible'] or s['imgTexture'] != 'item_icons_atlas' or s['textStr'] != '':
                all_hotbar_imgs_ok = False
        
        # Test x0 on empty consumable slot 1
        t3_x0_eval = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const ps = ui.playerState;
            // Set item_lantern_oil count to 0 in slot 1
            ps.inventory.set('item_lantern_oil', 0);
            ui.updateQuickSlotCounts();
            const img = ui.inventorySlotImages[1];
            const countTxt = ui.inventorySlotCounts[1];
            return {
                imgVisible: img.visible,
                imgAlpha: img.alpha,
                countStr: countTxt.text
            };
        }""")
        print("Slot 1 x0 test:", t3_x0_eval)
        x0_ok = (t3_x0_eval['imgVisible'] is True and t3_x0_eval['imgAlpha'] == 0.4 and t3_x0_eval['countStr'] == 'x0')
        
        # Restore item_lantern_oil to 3
        page.evaluate("() => { const ui = window.__PHASER_GAME__.scene.getScene('UIScene'); ui.playerState.addItem('item_lantern_oil', 3); ui.updateQuickSlotCounts(); }")
        page.wait_for_timeout(300)

        # Screenshot hotbar
        shot_hotbar = REPORTS_DIR / 'hw_bug07_hotbar_verified.png'
        shot_hotbar_artifact = ARTIFACT_DIR / 'hw_bug07_hotbar_verified.png'
        page.screenshot(path=str(shot_hotbar))
        shutil.copyfile(shot_hotbar, shot_hotbar_artifact)
        print("Saved hotbar screenshot:", shot_hotbar)

        test_3_pass = (all_hotbar_imgs_ok and x0_ok)
        test_results['test_3_hotbar_pixel_art'] = test_3_pass
        print(f"TEST 3 RESULT: {'PASS' if test_3_pass else 'FAIL'}")
        assert test_3_pass, "Test 3 failed!"

        # =========================================================================
        # TEST 4: CRAFTING MODAL & QUICKCRAFT SIDEBAR UI
        # =========================================================================
        print("\n--- TEST 4: CRAFTING MODAL & QUICKCRAFT SIDEBAR ---")
        t4_craft_modal = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            ui.craftingModal.open();
            
            const cm = ui.craftingModal;
            const isOpen = cm.isOpen;
            
            // Check detailPreviewImage
            const previewImg = cm.detailPreviewImage;
            const previewOk = (previewImg && previewImg.visible && previewImg.texture?.key === 'item_icons_atlas');
            
            // Check grid tiles
            let gridTilesCount = 0;
            let gridTilesWithImg = 0;
            for (const [recipeId, tile] of cm.gridTileGfx.entries()) {
                gridTilesCount++;
                if (tile.iconImg && tile.iconImg.texture?.key === 'item_icons_atlas') {
                    gridTilesWithImg++;
                }
            }
            
            // Check ingredient badges in detail panel
            const ingCount = cm.detailIngredientsContainer.length;
            
            return {
                isOpen,
                previewOk,
                previewTexture: previewImg?.texture?.key,
                previewFrame: previewImg?.frame?.name,
                gridTilesCount,
                gridTilesWithImg,
                ingCount
            };
        }""")
        print("Crafting modal eval:", t4_craft_modal)
        page.wait_for_timeout(400)
        
        shot_craft = REPORTS_DIR / 'hw_bug07_crafting_modal_verified.png'
        shot_craft_artifact = ARTIFACT_DIR / 'hw_bug07_crafting_modal_verified.png'
        page.screenshot(path=str(shot_craft))
        shutil.copyfile(shot_craft, shot_craft_artifact)
        print("Saved crafting modal screenshot:", shot_craft)

        # Close Crafting Modal
        page.evaluate("() => { const ui = window.__PHASER_GAME__.scene.getScene('UIScene'); ui.craftingModal.close(); }")
        page.wait_for_timeout(400)

        # QuickCraft Sidebar check
        t4_sidebar = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const qc = ui.quickCraftSidebar;
            
            let slotImgsOk = 0;
            for (const slot of qc.slots) {
                if (slot.iconImg && slot.iconImg.texture?.key === 'item_icons_atlas') {
                    slotImgsOk++;
                }
            }
            
            // Trigger flyout on slot 0
            const recipe = qc.craftingSystem.recipes.find(r => r.id === qc.pinnedRecipeIds[0]);
            qc.showFlyout(recipe, 300);
            
            const flyoutVisible = qc.flyoutContainer.visible;
            const flyoutChildren = qc.flyoutContainer.length;
            
            return {
                slotsCount: qc.slots.length,
                slotImgsOk,
                flyoutVisible,
                flyoutChildren
            };
        }""")
        print("QuickCraft sidebar eval:", t4_sidebar)
        page.wait_for_timeout(300)

        shot_sidebar = REPORTS_DIR / 'hw_bug07_quickcraft_flyout_verified.png'
        shot_sidebar_artifact = ARTIFACT_DIR / 'hw_bug07_quickcraft_flyout_verified.png'
        page.screenshot(path=str(shot_sidebar))
        shutil.copyfile(shot_sidebar, shot_sidebar_artifact)
        print("Saved quickcraft screenshot:", shot_sidebar)

        # Hide flyout
        page.evaluate("() => { const ui = window.__PHASER_GAME__.scene.getScene('UIScene'); ui.quickCraftSidebar.hideFlyout(); }")
        page.wait_for_timeout(200)

        test_4_pass = (t4_craft_modal['isOpen'] and t4_craft_modal['previewOk'] and 
                       t4_craft_modal['gridTilesWithImg'] > 0 and t4_sidebar['slotImgsOk'] == 4)
        test_results['test_4_crafting_quickcraft'] = test_4_pass
        print(f"TEST 4 RESULT: {'PASS' if test_4_pass else 'FAIL'}")
        assert test_4_pass, "Test 4 failed!"

        # =========================================================================
        # TEST 5: STORAGE CHEST & EQUIPMENT MODAL UI
        # =========================================================================
        print("\n--- TEST 5: STORAGE CHEST & EQUIPMENT MODAL ---")
        t5_chest = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            ui.openStorageChest();
            
            const scm = ui.getStorageChestModal();
            const isOpen = scm.isOpen;
            
            // Deposit an item from inventory into chest
            scm.campSystem.depositItem('res_dry_wood', 5);
            scm.refreshView();
            
            const invChildren = scm.leftInventoryContainer.length;
            const chestChildren = scm.rightChestContainer.length;
            
            return {
                isOpen,
                invChildren,
                chestChildren,
                usedSlots: scm.campSystem.getUsedSlotCount()
            };
        }""")
        print("Storage chest eval:", t5_chest)
        page.wait_for_timeout(400)

        shot_chest = REPORTS_DIR / 'hw_bug07_storage_chest_verified.png'
        shot_chest_artifact = ARTIFACT_DIR / 'hw_bug07_storage_chest_verified.png'
        page.screenshot(path=str(shot_chest))
        shutil.copyfile(shot_chest, shot_chest_artifact)
        print("Saved storage chest screenshot:", shot_chest)

        # Close chest modal
        page.evaluate("() => { const ui = window.__PHASER_GAME__.scene.getScene('UIScene'); ui.getStorageChestModal().close(); }")
        page.wait_for_timeout(400)

        # Open equipment modal
        t5_equip = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            ui.openEquipmentModal();
            
            const em = ui.getEquipmentModal();
            const isOpen = em.isOpen;
            
            // Equip eqp_moss_cloak to body slot
            em.equipSystem.equip('body', 'eqp_moss_cloak');
            em.refreshView();
            
            const equippedBody = em.equipSystem.getEquipped('body');
            
            return {
                isOpen,
                equippedBody,
                slotsCount: em.slotsContainer.length,
                invCount: em.inventoryListContainer.length,
                wpnCount: em.weaponsContainer.length
            };
        }""")
        print("Equipment modal eval:", t5_equip)
        page.wait_for_timeout(400)

        shot_equip = REPORTS_DIR / 'hw_bug07_equipment_modal_verified.png'
        shot_equip_artifact = ARTIFACT_DIR / 'hw_bug07_equipment_modal_verified.png'
        page.screenshot(path=str(shot_equip))
        shutil.copyfile(shot_equip, shot_equip_artifact)
        print("Saved equipment modal screenshot:", shot_equip)

        # Close equipment modal
        page.evaluate("() => { const ui = window.__PHASER_GAME__.scene.getScene('UIScene'); ui.getEquipmentModal().close(); }")
        page.wait_for_timeout(400)

        test_5_pass = (t5_chest['isOpen'] and t5_chest['usedSlots'] > 0 and 
                       t5_equip['isOpen'] and t5_equip['equippedBody'] == 'eqp_moss_cloak')
        test_results['test_5_storage_and_equipment'] = test_5_pass
        print(f"TEST 5 RESULT: {'PASS' if test_5_pass else 'FAIL'}")
        assert test_5_pass, "Test 5 failed!"

        # =========================================================================
        # TEST 6: SAVE/LOAD LIFECYCLE & LEGACY ALIAS INTEGRITY
        # =========================================================================
        print("\n--- TEST 6: SAVE/LOAD LIFECYCLE & ALIAS INTEGRITY ---")
        t6_save_eval = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const ps = ui.playerState;
            
            // Inject alias items into player state
            ps.addItem('item_runed_iron_part', 4);
            ps.addItem('food_root_soup', 2);
            ps.addItem('quest_corrupted_knight_crest', 1);
            
            // Save state cleanly via storage chest autoSave
            const scm = ui.getStorageChestModal();
            scm.open();
            scm.close();
            
            return {
                savedOk: true,
                equippedBody: ps.equippedSlots?.body,
                ironPart: ps.getItemCount('item_runed_iron_part'),
                rootSoup: ps.getItemCount('food_root_soup')
            };
        }""")
        print("Save alias inject eval:", t6_save_eval)
        page.wait_for_timeout(1000)

        # Reload and Continue Game
        print("[Test] Reloading page to test Save/Continue with legacy aliases...")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.wait_for_timeout(1000)

        # Click Continue Game
        print("[Test] Continuing game...")
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.continueGame(); }")
        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
        page.wait_for_timeout(2000)

        t6_verify = page.evaluate("""() => {
            const ui = window.__PHASER_GAME__.scene.getScene('UIScene');
            const ps = ui.playerState;
            
            // Check inventory count
            const ironPartCount = ps.getItemCount('item_runed_iron_part');
            const rootSoupCount = ps.getItemCount('food_root_soup');
            const normIron = ps.getItemCount('mat_runed_iron');
            
            // Check equipped items
            const equippedBody = ui.getEquipmentModal().equipSystem.getEquipped('body');
            
            // Check that ItemIconHelper resolves these items without error
            const textures = window.__PHASER_GAME__.textures;
            const hasAtlas = textures.exists('item_icons_atlas');
            const atlas = textures.get('item_icons_atlas');
            
            const hasIronFrame = atlas.has('item_runed_iron_part') || atlas.has('mat_runed_iron');
            const hasSoupFrame = atlas.has('food_root_soup') || atlas.has('food_forest_root_soup');
            const hasCrestFrame = atlas.has('quest_corrupted_knight_crest') || atlas.has('quest_corrupted_crest');
            
            return {
                ironPartCount,
                rootSoupCount,
                normIron,
                equippedBody,
                hasAtlas,
                hasIronFrame,
                hasSoupFrame,
                hasCrestFrame
            };
        }""")
        print("Continue Game state verification:", t6_verify)

        test_6_pass = (t6_verify['equippedBody'] == 'eqp_moss_cloak' and 
                       t6_verify['ironPartCount'] == 4 and 
                       t6_verify['rootSoupCount'] == 2 and 
                       t6_verify['hasIronFrame'] and 
                       t6_verify['hasSoupFrame'])
        test_results['test_6_save_load_lifecycle'] = test_6_pass
        print(f"TEST 6 RESULT: {'PASS' if test_6_pass else 'FAIL'}")
        assert test_6_pass, f"Test 6 failed: {t6_verify}"

        # Network 404 check
        print("\n--- NETWORK 404 & CONSOLE ERROR AUDIT ---")
        bad_404s = [u for u in network_404s if 'item_icons_atlas' in u or 'icon' in u or 'asset' in u]
        print(f"Total 404 requests: {len(network_404s)} | Item/Atlas 404s: {bad_404s}")
        print(f"Console errors: {len(console_errors)}")
        assert len(bad_404s) == 0, f"Found 404 assets: {bad_404s}"

        browser.close()

    print("\n========================================================")
    print("ALL 6 ITEM ICONS INTEGRITY TEST CASES PASSED SUCCESSFULLY!")
    print("========================================================")
    for k, v in test_results.items():
        print(f"  {k}: {'PASS' if v else 'FAIL'}")

if __name__ == '__main__':
    run_tests()
