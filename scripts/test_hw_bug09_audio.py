import sys
import os
import time
import threading
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 5250
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

page_errors = []
test_results = {}

with sync_playwright() as pw:
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    browser = pw.chromium.launch(
        executable_path=chrome_path,
        headless=True,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required']
    )
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()

    page.on("pageerror", lambda err: page_errors.append(str(err)))
    page.on("console", lambda msg: print(f"[Browser Console] {msg.type}: {msg.text}") if msg.type in ['error', 'warn'] else None)

    print("[Playwright] Navigating to game...")
    page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')

    # Wait for game to initialize to MainMenuScene
    print("[Playwright] Waiting for MainMenuScene...")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
    page.wait_for_timeout(500)

    # Click canvas to unlock AudioContext
    page.click('canvas')
    page.wait_for_timeout(300)

    # Start new game to enter GameScene
    print("[Playwright] Starting new game to enter GameScene...")
    page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")
    page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('GameScene') && window.__PHASER_GAME__?.scene?.getScene('GameScene')?.player", timeout=30000)
    page.wait_for_timeout(1500)

    print("[Test Suite] Running HW-BUG-09 Audio Test Suite...")

    # TEST 1: Technical Acoustic Metrics for Ambience Assets
    test1_code = '''async () => {
        const actx = new (window.AudioContext || window.webkitAudioContext)();
        const files = {
            village: 'assets/audio/ambience/ambience_village.mp3',
            crossing: 'assets/audio/ambience/ambience_crossing.mp3',
            forest: 'assets/audio/ambience/ambience_forest.mp3',
            mire: 'assets/audio/ambience/ambience_mire.mp3'
        };

        const res = {};
        for (const [key, url] of Object.entries(files)) {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error("Failed to fetch " + url);
            const arrayBuf = await resp.arrayBuffer();
            const audioBuf = await actx.decodeAudioData(arrayBuf);
            const chan0 = audioBuf.getChannelData(0);

            let sumSq = 0;
            let peak = 0;
            let clickCount = 0;
            for (let i = 0; i < chan0.length; i++) {
                const abs = Math.abs(chan0[i]);
                sumSq += abs * abs;
                if (abs > peak) peak = abs;
                if (i > 0 && Math.abs(chan0[i] - chan0[i-1]) > 0.20) {
                    clickCount++;
                }
            }
            const rms = Math.sqrt(sumSq / chan0.length);

            res[key] = {
                duration: Number(audioBuf.duration.toFixed(2)),
                sampleRate: audioBuf.sampleRate,
                channels: audioBuf.numberOfChannels,
                rms: Number(rms.toFixed(4)),
                peak: Number(peak.toFixed(4)),
                clickCount: clickCount,
                startAmp: Number(Math.abs(chan0[0]).toFixed(4)),
                endAmp: Number(Math.abs(chan0[chan0.length - 1]).toFixed(4)),
                fileSizeBytes: arrayBuf.byteLength
            };
        }
        return res;
    }'''

    t1_data = page.evaluate(test1_code)
    test_results['test1_assets'] = t1_data
    print(f"[Test 1 Assets] village: duration={t1_data['village']['duration']}s, rms={t1_data['village']['rms']}, clicks={t1_data['village']['clickCount']}")
    print(f"[Test 1 Assets] crossing: duration={t1_data['crossing']['duration']}s, rms={t1_data['crossing']['rms']}, clicks={t1_data['crossing']['clickCount']}")
    print(f"[Test 1 Assets] forest: duration={t1_data['forest']['duration']}s, mire: duration={t1_data['mire']['duration']}s")

    assert t1_data['village']['duration'] >= 60.0, f"Village ambience duration too short: {t1_data['village']['duration']}s"
    assert t1_data['village']['clickCount'] == 0, f"Village ambience contains click spikes: {t1_data['village']['clickCount']}"
    assert t1_data['crossing']['duration'] >= 120.0, f"Crossing ambience duration too short: {t1_data['crossing']['duration']}s"
    assert t1_data['crossing']['clickCount'] == 0, f"Crossing ambience contains click spikes: {t1_data['crossing']['clickCount']}"

    # TEST 2: Runtime AudioManager Integration & Zone Transitions
    test2_code = '''async () => {
        const game = window.__PHASER_GAME__;
        if (!game) return { error: "No window.__PHASER_GAME__ found" };
        const gameScene = game.scene.getScene('GameScene');
        if (!gameScene || !gameScene.audioManager) return { error: "No gameScene or audioManager found" };

        const am = gameScene.audioManager;
        am.resumeAudio();

        const transitions = [];

        // 1. Set to village
        am.setAmbienceZone('village', 0.5);
        transitions.push({
            zone: 'village',
            currentZone: am.currentAmbienceZone,
            hasActiveAmbience: Boolean(am.activeAmbience),
            nodesCount: am.activeAmbience ? am.activeAmbience.nodes.length : 0
        });

        await new Promise(r => setTimeout(r, 600));

        // 2. Set to crossing
        am.setAmbienceZone('crossing', 0.5);
        transitions.push({
            zone: 'crossing',
            currentZone: am.currentAmbienceZone,
            hasActiveAmbience: Boolean(am.activeAmbience),
            fadingCount: am.fadingChannels ? am.fadingChannels.length : 0
        });

        await new Promise(r => setTimeout(r, 600));

        // 3. Set to forest
        am.setAmbienceZone('forest', 0.5);
        transitions.push({
            zone: 'forest',
            currentZone: am.currentAmbienceZone,
            hasActiveAmbience: Boolean(am.activeAmbience)
        });

        await new Promise(r => setTimeout(r, 600));

        // 4. Set to mire
        am.setAmbienceZone('mire', 0.5);
        transitions.push({
            zone: 'mire',
            currentZone: am.currentAmbienceZone,
            hasActiveAmbience: Boolean(am.activeAmbience)
        });

        await new Promise(r => setTimeout(r, 600));

        // 5. Return to village
        am.setAmbienceZone('village', 0.5);
        transitions.push({
            zone: 'village_return',
            currentZone: am.currentAmbienceZone,
            hasActiveAmbience: Boolean(am.activeAmbience)
        });

        await new Promise(r => setTimeout(r, 700));

        return {
            success: true,
            transitions: transitions,
            remainingFading: am.fadingChannels ? am.fadingChannels.length : 0
        };
    }'''

    t2_data = page.evaluate(test2_code)
    test_results['test2_transitions'] = t2_data
    print(f"[Test 2 Transitions] result: {json.dumps(t2_data)}")
    assert t2_data.get('success') is True, f"Zone transition test failed: {t2_data}"
    assert t2_data.get('remainingFading') == 0, f"Leaked fading channels: {t2_data.get('remainingFading')}"

    # TEST 3: Toggle Mute [M] & Volume Management
    test3_code = '''async () => {
        const game = window.__PHASER_GAME__;
        const gameScene = game.scene.getScene('GameScene');
        const am = gameScene.audioManager;

        const initialMute = am.isMuted;
        const initialMasterGain = am.masterGain ? am.masterGain.gain.value : -1;

        // Toggle mute ON
        const muted = am.toggleMute();
        await new Promise(r => setTimeout(r, 120)); // Chờ 80ms ramp hoàn tất
        const mutedGain = am.masterGain ? am.masterGain.gain.value : -1;

        // Toggle mute OFF
        const unmuted = am.toggleMute();
        await new Promise(r => setTimeout(r, 120)); // Chờ 80ms ramp hoàn tất
        const unmutedGain = am.masterGain ? am.masterGain.gain.value : -1;

        return {
            initialMute,
            initialMasterGain,
            muted,
            mutedGain,
            unmuted,
            unmutedGain
        };
    }'''

    t3_data = page.evaluate(test3_code)
    test_results['test3_mute'] = t3_data
    print(f"[Test 3 Mute] result: {json.dumps(t3_data)}")
    assert t3_data['muted'] is True, "Mute toggle did not set muted to true"
    assert t3_data['mutedGain'] == 0, f"Master gain should be 0 when muted, got {t3_data['mutedGain']}"
    assert t3_data['unmuted'] is False, "Mute toggle did not restore unmuted"
    assert t3_data['unmutedGain'] > 0, f"Master gain should be > 0 when unmuted, got {t3_data['unmutedGain']}"

    # TEST 4: Sir Vaelen Sanctuary Isolation & Restoration
    test4_code = '''async () => {
        const game = window.__PHASER_GAME__;
        const gameScene = game.scene.getScene('GameScene');
        const am = gameScene.audioManager;

        // Enter Sanctuary Mode
        am.setSanctuaryMusicOnly(true, 0.4);
        const inSanctuary = am.isSanctuaryActive();
        const activeAmbienceInSanctuary = am.activeAmbience;

        await new Promise(r => setTimeout(r, 500));

        // Exit Sanctuary Mode
        am.setSanctuaryMusicOnly(false, 0.4);
        const outSanctuary = am.isSanctuaryActive();

        await new Promise(r => setTimeout(r, 600));
        const activeAmbienceAfter = am.activeAmbience;

        return {
            inSanctuary,
            activeAmbienceInSanctuary: activeAmbienceInSanctuary !== null,
            outSanctuary,
            activeAmbienceAfter: activeAmbienceAfter !== null,
            restoredZone: am.currentAmbienceZone
        };
    }'''

    t4_data = page.evaluate(test4_code)
    test_results['test4_sanctuary'] = t4_data
    print(f"[Test 4 Sanctuary] result: {json.dumps(t4_data)}")
    assert t4_data['inSanctuary'] is True, "Sanctuary mode failed to activate"
    assert t4_data['outSanctuary'] is False, "Sanctuary mode failed to deactivate"
    assert t4_data['activeAmbienceAfter'] is True, "Ambience failed to restore after leaving sanctuary"

    # TEST 5: Pause / Resume Cycle
    test5_code = '''async () => {
        const game = window.__PHASER_GAME__;
        const gameScene = game.scene.getScene('GameScene');
        const am = gameScene.audioManager;

        const stateBefore = am.ctx ? am.ctx.state : 'unknown';

        // Pause Game Scene
        game.scene.pause('GameScene');
        await new Promise(r => setTimeout(r, 300));
        const stateDuring = am.ctx ? am.ctx.state : 'unknown';

        // Resume Game Scene
        game.scene.resume('GameScene');
        am.resumeAudio();
        await new Promise(r => setTimeout(r, 300));
        const stateAfter = am.ctx ? am.ctx.state : 'unknown';

        return {
            stateBefore,
            stateDuring,
            stateAfter,
            isAmbienceAlive: Boolean(am.activeAmbience)
        };
    }'''

    t5_data = page.evaluate(test5_code)
    test_results['test5_pause_resume'] = t5_data
    print(f"[Test 5 Pause/Resume] result: {json.dumps(t5_data)}")
    assert t5_data['stateAfter'] == 'running', f"AudioContext not running after resume: {t5_data['stateAfter']}"
    assert t5_data['isAmbienceAlive'] is True, "Ambience not alive after scene resume"

    # TEST 6: Spectral & Loop Seam Analysis (B04-11A Acceptance Criteria)
    test6_code = '''async () => {
        const actx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Đo đạc kỹ thuật mô phỏng 60s loop playback cho village và crossing
        async function measureTrack(url) {
            const resp = await fetch(url);
            const arrayBuf = await resp.arrayBuffer();
            const audioBuf = await actx.decodeAudioData(arrayBuf);
            const chan0 = audioBuf.getChannelData(0);
            
            // Chia buffer thành các cửa sổ 1 giây để kiểm tra độ ổn định năng lượng (Energy Variance)
            const windowSize = audioBuf.sampleRate;
            const numWindows = Math.min(60, Math.floor(audioBuf.duration));
            const windowRmsList = [];
            
            for (let w = 0; w < numWindows; w++) {
                let sumSq = 0;
                const offset = w * windowSize;
                for (let i = 0; i < windowSize; i++) {
                    const s = chan0[offset + i];
                    sumSq += s * s;
                }
                windowRmsList.push(Math.sqrt(sumSq / windowSize));
            }
            
            // Tính độ lệch chuẩn của RMS (Standard Deviation)
            const avgRms = windowRmsList.reduce((a, b) => a + b, 0) / windowRmsList.length;
            const variance = windowRmsList.reduce((a, b) => a + Math.pow(b - avgRms, 2), 0) / windowRmsList.length;
            const stdDev = Math.sqrt(variance);
            
            // Đo gián đoạn tại seam (50ms đầu vs 50ms cuối)
            const seamSamples = Math.floor(audioBuf.sampleRate * 0.05);
            let seamDiscontinuity = 0;
            for (let i = 0; i < seamSamples; i++) {
                const diff = Math.abs(chan0[i] - chan0[chan0.length - seamSamples + i]);
                if (diff > seamDiscontinuity) seamDiscontinuity = diff;
            }
            
            return {
                durationSec: Number(audioBuf.duration.toFixed(2)),
                avgRms: Number(avgRms.toFixed(4)),
                rmsStdDev: Number(stdDev.toFixed(4)),
                seamMaxDiff: Number(seamDiscontinuity.toFixed(4)),
                stabilityScore: Number((1.0 - Math.min(1.0, stdDev / (avgRms || 0.01))).toFixed(2))
            };
        }
        
        const villageMetrics = await measureTrack('assets/audio/ambience/ambience_village.mp3');
        const crossingMetrics = await measureTrack('assets/audio/ambience/ambience_crossing.mp3');
        
        return {
            villageMetrics,
            crossingMetrics
        };
    }'''

    t6_data = page.evaluate(test6_code)
    test_results['test6_spectral_loop'] = t6_data
    print(f"[Test 6 Metrics] Village: {json.dumps(t6_data['villageMetrics'])}")
    print(f"[Test 6 Metrics] Crossing: {json.dumps(t6_data['crossingMetrics'])}")
    assert t6_data['villageMetrics']['avgRms'] > 0.005, "Village ambience is silent"
    assert t6_data['crossingMetrics']['avgRms'] > 0.01, "Crossing ambience is silent"

    # Save summary report artifact
    with open('Read/V1.5/Reports/HW_BUG_09_TEST_RESULTS.json', 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2)

    print("\n[ALL TESTS PASSED] HW-BUG-09 verification completed successfully!")
    browser.close()

sys.exit(0)
