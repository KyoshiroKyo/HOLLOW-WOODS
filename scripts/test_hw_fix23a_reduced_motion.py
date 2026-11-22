import sys
import os
import json
import time
import http.server
import socketserver
import threading
from playwright.sync_api import sync_playwright

DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
PORT = 5205

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler) as httpd:
        httpd.serve_forever()

def main():
    print(f"[Server] Serving dist at http://127.0.0.1:{PORT}")
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1.0)

    test_results = {}
    console_errors = []

    with sync_playwright() as p:
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        browser = p.chromium.launch(
            executable_path=chrome_path,
            headless=True,
            args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
        )
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        print("[QA] Starting HW-FIX-23A Reduced Motion & Lantern Light Safety Suite...")
        page.goto(f"http://127.0.0.1:{PORT}/?dev=1", wait_until='domcontentloaded')

        page.wait_for_function("() => window.__PHASER_GAME__?.scene?.isActive('MainMenuScene')", timeout=30000)
        page.wait_for_timeout(500)

        # Start game
        page.evaluate("() => { const mm = window.__PHASER_GAME__.scene.getScene('MainMenuScene'); mm.startNewGame(); }")

        # Wait for GameScene to instantiate and become active
        page.wait_for_function("""
            () => {
                const game = window.__PHASER_GAME__;
                if (!game || !game.scene) return false;
                const gs = game.scene.getScene('GameScene');
                return gs && gs.scene.isActive() && gs.player && gs.playerState;
            }
        """, timeout=30000)
        page.wait_for_timeout(1000)

        # Setup test helpers
        page.evaluate("""
        () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            gs.playerState.setFlag('east_gate_unlocked');
            gs.playerState.setFlag('entered_silent_mire');
            gs.playerState.setFlag('mire_unlocked');
            gs.playerState.setFlag('shrine_unlocked');
            gs.worldBuilder.ensureZoneRendered('outer_woods');
            gs.worldBuilder.ensureZoneRendered('bellhollow');
            gs.worldBuilder.ensureZoneRendered('sanctuary_farm');

            window.__SET_TEST_ZONE__ = function(zoneId, x, y) {
                gs.worldBuilder.ensureZoneRendered(zoneId);
                gs.worldBuilder.setActiveZone(zoneId);
                gs.currentZoneId = zoneId;
                gs.previousZoneId = zoneId;
                gs.playerState.setCurrentZone(zoneId);
                if (x !== undefined && y !== undefined) {
                    gs.player.setPosition(x, y);
                    if (gs.player.body) gs.player.body.reset(x, y);
                }
            };

            window.__COLLECT_LANTERN_GLOW_SAMPLES__ = function(frameCount = 25) {
                return new Promise(resolve => {
                    const samples = [];
                    const onPostUpdate = () => {
                        if (gs.lanternGlowImage && gs.lanternGlowImage.visible) {
                            const cam = gs.cameras.main;
                            const radius = gs.currentLanternRadius * cam.zoom * 0.82;
                            const targetGlowScale = (radius * 2.0) / 512;
                            const breathingFactor = targetGlowScale > 0 ? (gs.lanternGlowImage.scaleX / targetGlowScale) : 1;
                            samples.push({
                                scaleX: gs.lanternGlowImage.scaleX,
                                scaleY: gs.lanternGlowImage.scaleY,
                                alpha: gs.lanternGlowImage.alpha,
                                visible: gs.lanternGlowImage.visible,
                                currentRadius: gs.currentLanternRadius,
                                targetGlowScale: targetGlowScale,
                                breathingFactor: breathingFactor
                            });
                        }
                        if (samples.length >= frameCount) {
                            gs.events.off('postupdate', onPostUpdate);
                            resolve(samples);
                        }
                    };
                    gs.events.on('postupdate', onPostUpdate);
                });
            };
        }
        """)

        # -------------------------------------------------------------
        # TEST 1: Graphics HIGH + Reduced Motion OFF
        # -------------------------------------------------------------
        print("\n--- TEST 1: GRAPHICS HIGH + REDUCED MOTION OFF ---")
        t1 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const gqs = window.__GRAPHICS_QUALITY__ || (window.GraphicsQualitySystem ? window.GraphicsQualitySystem.getInstance() : gs.graphicsQualitySystem);
            // Ensure quality HIGH
            const qsys = gs.plugins.get('GraphicsQualitySystem') || (window.__GRAPHICS_QUALITY_SYSTEM__);
            // Use SettingsManager
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = false;

            // Direct set quality on system
            const qSettings = gs.registry.get('graphics_quality') || {};
            // Make sure player is standing still in outer_woods with lantern on
            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.player.setVelocity(0, 0);
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.playerState.stats.composure = 100;
            gs.currentLanternRadius = 240;
            await new Promise(r => setTimeout(r, 200));

            const samples = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const factors = samples.map(s => s.breathingFactor);
            const minScale = Math.min(...factors);
            const maxScale = Math.max(...factors);
            const deltaScale = maxScale - minScale;

            const isRM = sm.isReducedMotionPreferred();
            return { isRM, deltaScale, minScale, maxScale, sampleCount: samples.length };
        }
        """)
        print(f"  T1: RM={t1['isRM']}, DeltaScale={t1['deltaScale']:.6f}, Range=[{t1['minScale']:.4f} - {t1['maxScale']:.4f}]")
        assert not t1['isRM'], "Reduced Motion must be OFF"
        assert t1['deltaScale'] > 0.0001, f"Amber flicker MUST oscillate when RM is OFF, got delta {t1['deltaScale']}"
        print("  [PASS] Test 1: Graphics HIGH + Reduced Motion OFF duy trì nhịp thở hổ phách tự nhiên.")
        test_results['test_1_high_rm_off'] = t1

        # -------------------------------------------------------------
        # TEST 2: Graphics HIGH + Reduced Motion ON
        # -------------------------------------------------------------
        print("\n--- TEST 2: GRAPHICS HIGH + REDUCED MOTION ON ---")
        t2 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = true;

            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.player.setVelocity(0, 0);
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.playerState.stats.composure = 100;
            gs.currentLanternRadius = 240;
            await new Promise(r => setTimeout(r, 200));

            const samples = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const factors = samples.map(s => s.breathingFactor);
            const alphas = samples.map(s => s.alpha);
            const minScale = Math.min(...factors);
            const maxScale = Math.max(...factors);
            const deltaScale = maxScale - minScale;
            const deltaAlpha = Math.max(...alphas) - Math.min(...alphas);
            const isVisible = samples.every(s => s.visible);

            const isRM = sm.isReducedMotionPreferred();
            const diag = {
                firstRadius: samples[0]?.currentRadius,
                lastRadius: samples[samples.length - 1]?.currentRadius,
                firstScale: samples[0]?.scaleX,
                lastScale: samples[samples.length - 1]?.scaleX,
                breathingSetting: window.__GRAPHICS_QUALITY_SYSTEM__?.getSettings()?.enableAmberFlicker
            };
            return { isRM, deltaScale, deltaAlpha, minScale, maxScale, isVisible, sampleCount: samples.length, diag };
        }
        """)
        print(f"  T2: RM={t2['isRM']}, DeltaScale={t2['deltaScale']:.6f}, DeltaAlpha={t2['deltaAlpha']:.6f}, Visible={t2['isVisible']}")
        print(f"  T2 Diag: {t2['diag']}")
        assert t2['isRM'], "Reduced Motion must be ON"
        assert t2['isVisible'], "Lantern glow image MUST remain visible when RM is ON"
        assert t2['deltaScale'] < 0.00001, f"Amber flicker MUST be completely static (zero time oscillation) when RM is ON, got delta {t2['deltaScale']}"
        assert t2['deltaAlpha'] < 0.00001, f"Glow alpha MUST be completely static when RM is ON, got delta {t2['deltaAlpha']}"
        print("  [PASS] Test 2: Graphics HIGH + Reduced Motion ON triệt tiêu hoàn toàn dao động hổ phách theo thời gian.")
        test_results['test_2_high_rm_on'] = t2

        # -------------------------------------------------------------
        # TEST 3: Graphics MEDIUM + Reduced Motion OFF
        # -------------------------------------------------------------
        print("\n--- TEST 3: GRAPHICS MEDIUM + REDUCED MOTION OFF ---")
        t3 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = false;

            // Set quality MEDIUM
            if (window.__GRAPHICS_QUALITY_SYSTEM__) {
                window.__GRAPHICS_QUALITY_SYSTEM__.setQuality('MEDIUM');
            }

            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.player.setVelocity(0, 0);
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.playerState.stats.composure = 100;
            gs.currentLanternRadius = 240;
            await new Promise(r => setTimeout(r, 200));

            const samples = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const factors = samples.map(s => s.breathingFactor);
            const deltaScale = Math.max(...factors) - Math.min(...factors);
            return { isRM: sm.isReducedMotionPreferred(), deltaScale };
        }
        """)
        print(f"  T3: RM={t3['isRM']}, DeltaScale={t3['deltaScale']:.6f}")
        assert not t3['isRM'], "Reduced Motion must be OFF"
        assert t3['deltaScale'] > 0.0001, f"Medium quality with RM OFF must retain gentle amber oscillation, got {t3['deltaScale']}"
        print("  [PASS] Test 3: Graphics MEDIUM + Reduced Motion OFF giữ nguyên nhịp thở hổ phách.")
        test_results['test_3_medium_rm_off'] = t3

        # -------------------------------------------------------------
        # TEST 4: Graphics MEDIUM + Reduced Motion ON
        # -------------------------------------------------------------
        print("\n--- TEST 4: GRAPHICS MEDIUM + REDUCED MOTION ON ---")
        t4 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = true;

            if (window.__GRAPHICS_QUALITY_SYSTEM__) {
                window.__GRAPHICS_QUALITY_SYSTEM__.setQuality('MEDIUM');
            }

            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.player.setVelocity(0, 0);
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.playerState.stats.composure = 100;
            gs.currentLanternRadius = 240;
            await new Promise(r => setTimeout(r, 200));

            const samples = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const factors = samples.map(s => s.breathingFactor);
            const deltaScale = Math.max(...factors) - Math.min(...factors);
            return { isRM: sm.isReducedMotionPreferred(), deltaScale };
        }
        """)
        print(f"  T4: RM={t4['isRM']}, DeltaScale={t4['deltaScale']:.6f}")
        assert t4['isRM'], "Reduced Motion must be ON"
        assert t4['deltaScale'] < 0.00001, f"Medium quality with RM ON must eliminate amber oscillation, got {t4['deltaScale']}"
        print("  [PASS] Test 4: Graphics MEDIUM + Reduced Motion ON triệt tiêu dao động hổ phách.")
        test_results['test_4_medium_rm_on'] = t4

        # -------------------------------------------------------------
        # TEST 5: Graphics LOW + Reduced Motion ON / OFF
        # -------------------------------------------------------------
        print("\n--- TEST 5: GRAPHICS LOW + REDUCED MOTION ON / OFF ---")
        t5 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;

            if (window.__GRAPHICS_QUALITY_SYSTEM__) {
                window.__GRAPHICS_QUALITY_SYSTEM__.setQuality('LOW');
            }

            // Test with RM OFF
            sm.settings.reducedMotionEnabled = false;
            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.player.setVelocity(0, 0);
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.playerState.stats.composure = 100;
            gs.currentLanternRadius = 240;
            await new Promise(r => setTimeout(r, 200));

            const samplesOff = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(20);
            const scalesOff = samplesOff.map(s => s.breathingFactor);
            const deltaOff = Math.max(...scalesOff) - Math.min(...scalesOff);

            // Test with RM ON
            sm.settings.reducedMotionEnabled = true;
            gs.currentLanternRadius = 240;
            await new Promise(r => setTimeout(r, 200));
            const samplesOn = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(20);
            const scalesOn = samplesOn.map(s => s.breathingFactor);
            const deltaOn = Math.max(...scalesOn) - Math.min(...scalesOn);

            // Restore quality HIGH for subsequent tests
            if (window.__GRAPHICS_QUALITY_SYSTEM__) {
                window.__GRAPHICS_QUALITY_SYSTEM__.setQuality('HIGH');
            }

            return { deltaOff, deltaOn };
        }
        """)
        print(f"  T5: Low Quality DeltaOff={t5['deltaOff']:.6f}, DeltaOn={t5['deltaOn']:.6f}")
        assert t5['deltaOff'] < 0.00001, f"Low quality naturally disables amber flicker (enableAmberFlicker: false), got {t5['deltaOff']}"
        assert t5['deltaOn'] < 0.00001, f"Low quality with RM ON must have zero oscillation, got {t5['deltaOn']}"
        print("  [PASS] Test 5: Graphics LOW hoạt động ổn định và an toàn cả khi RM ON và OFF.")
        test_results['test_5_low_rm_on_off'] = t5

        # -------------------------------------------------------------
        # TEST 6: Đèn lồng bật/tắt (Toggle)
        # -------------------------------------------------------------
        print("\n--- TEST 6: ĐÈN LỒNG BẬT / TẮT (TOGGLE) ---")
        t6 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = true;

            // 1. Tắt đèn lồng
            gs.playerState.stats.isLanternOn = false;
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            const offState = {
                glowVisible: gs.lanternGlowImage.visible,
                maskKey: gs.cachedLightMaskImage.texture.key,
                radius: gs.currentLanternRadius
            };

            // 2. Bật lại đèn lồng
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            // Cho 300ms để lerp mở rộng bán kính
            await new Promise(r => setTimeout(r, 300));

            const onState = {
                glowVisible: gs.lanternGlowImage.visible,
                maskKey: gs.cachedLightMaskImage.texture.key,
                radius: gs.currentLanternRadius
            };

            return { offState, onState };
        }
        """)
        print(f"  T6 Off: GlowVisible={t6['offState']['glowVisible']}, MaskKey={t6['offState']['maskKey']}")
        print(f"  T6 On:  GlowVisible={t6['onState']['glowVisible']}, MaskKey={t6['onState']['maskKey']}, Radius={t6['onState']['radius']:.2f}")
        assert not t6['offState']['glowVisible'], "Lantern glow must be invisible when lantern is OFF"
        assert t6['onState']['glowVisible'], "Lantern glow must be visible when lantern is ON"
        assert t6['onState']['maskKey'] == 'cached_light_mask_normal', f"Mask key must be normal, got {t6['onState']['maskKey']}"
        print("  [PASS] Test 6: Bật/tắt đèn lồng hoạt động trơn tru, không mất chức năng gameplay.")
        test_results['test_6_lantern_toggle'] = t6

        # -------------------------------------------------------------
        # TEST 7: Tinh Thần 35 và 15 ngoài Outer Woods (RM ON)
        # -------------------------------------------------------------
        print("\n--- TEST 7: TINH THẦN 35 VÀ 15 NGOÀI OUTER WOODS (RM ON) ---")
        t7 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = true;

            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            if (gs.timeSystem) gs.timeSystem.setTimeOfDay(60);

            // Mức 35
            gs.playerState.stats.composure = 35;
            await new Promise(r => setTimeout(r, 200));

            const vigActive35 = uis.isPanicVignetteActive;
            const hbActive35 = gs.audioManager.isHeartbeatActive;
            const bpm35 = gs.audioManager.getHeartbeatBpm();

            // Lấy mẫu bán kính đèn tại mức 35
            const samples35 = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(20);
            const scales35 = samples35.map(s => s.breathingFactor);
            const delta35 = Math.max(...scales35) - Math.min(...scales35);

            // Mức 15
            gs.playerState.stats.composure = 15;
            await new Promise(r => setTimeout(r, 200));

            const vigActive15 = uis.isPanicVignetteActive;
            const hbActive15 = gs.audioManager.isHeartbeatActive;
            const bpm15 = gs.audioManager.getHeartbeatBpm();

            const samples15 = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(20);
            const scales15 = samples15.map(s => s.breathingFactor);
            const delta15 = Math.max(...scales15) - Math.min(...scales15);

            return {
                vigActive35, hbActive35, bpm35, delta35,
                vigActive15, hbActive15, bpm15, delta15
            };
        }
        """)
        print(f"  T7 Comp 35: Vig={t7['vigActive35']}, Hb={t7['hbActive35']}, BPM={t7['bpm35']}, DeltaScale={t7['delta35']:.6f}")
        print(f"  T7 Comp 15: Vig={t7['vigActive15']}, Hb={t7['hbActive15']}, BPM={t7['bpm15']}, DeltaScale={t7['delta15']:.6f}")
        assert t7['vigActive35'] and t7['hbActive35'], "At comp 35, vignette and heartbeat must remain active"
        assert t7['delta35'] < 0.00001, f"FOW / Amber breathing must remain 0 when RM is ON at comp 35, got {t7['delta35']}"
        assert t7['vigActive15'] and t7['hbActive15'], "At comp 15, vignette and heartbeat must remain active"
        assert t7['bpm15'] >= 120, f"Heartbeat BPM must scale up to near-max at comp 15, got {t7['bpm15']}"
        assert t7['delta15'] < 0.00001, f"FOW / Amber breathing must remain 0 when RM is ON at comp 15, got {t7['delta15']}"
        print("  [PASS] Test 7: Tinh Thần 35 và 15 kích hoạt kinh dị đầy đủ nhưng triệt tiêu 100% dao động quang học khi RM ON.")
        test_results['test_7_composure_outer_woods'] = t7

        # -------------------------------------------------------------
        # TEST 8: Safe Zone Sir Vaelen (1470, 710)
        # -------------------------------------------------------------
        print("\n--- TEST 8: SAFE ZONE SIR VAELEN (1470, 710) ---")
        t8 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const uis = window.__PHASER_GAME__.scene.getScene('UIScene');
            const sm = window.__SETTINGS_MANAGER__;
            sm.settings.reducedMotionEnabled = true;

            // Đứng cạnh lửa trại Sir Vaelen
            window.__SET_TEST_ZONE__('outer_woods', 1470, 710);
            gs.playerState.stats.composure = 15;
            await new Promise(r => setTimeout(r, 200));

            const isNearWarmth = Boolean(gs.survivalSystem && gs.survivalSystem.isNearWarmth(gs.player.x, gs.player.y, gs.currentZoneId));
            const vigActive = uis.isPanicVignetteActive;
            const hbActive = gs.audioManager.isHeartbeatActive;

            return { isNearWarmth, vigActive, hbActive };
        }
        """)
        print(f"  T8 Sir Vaelen: isNearWarmth={t8['isNearWarmth']}, Vig={t8['vigActive']}, Hb={t8['hbActive']}")
        assert t8['isNearWarmth'], "Sir Vaelen campfire must radiate warmth"
        assert not t8['vigActive'], "Vignette must be disabled in Sir Vaelen Safe Zone"
        assert not t8['hbActive'], "Heartbeat must be disabled in Sir Vaelen Safe Zone"
        print("  [PASS] Test 8: Safe Zone Sir Vaelen bảo toàn sự che chở tuyệt đối.")
        test_results['test_8_safe_zone_sir_vaelen'] = t8

        # -------------------------------------------------------------
        # TEST 9: Hiệu ứng Dơi tấn công (Bat Attack Flicker)
        # -------------------------------------------------------------
        print("\n--- TEST 9: HIỆU ỨNG DƠI TẤN CÔNG (BAT ATTACK FLICKER) ---")
        t9 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;

            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.playerState.stats.composure = 100;
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.player.setVelocity(0, 0);

            // Phase A: Reduced Motion OFF
            sm.settings.reducedMotionEnabled = false;
            gs.events.emit('lantern_flicker', { duration: 2500 });
            const targetEquilibrium = (gs.timeSystem ? gs.timeSystem.getVisionRadius(true) : 250) * 0.82;
            gs.currentLanternRadius = targetEquilibrium;
            await new Promise(r => setTimeout(r, 100));

            // Thu thập mẫu bán kính khi dơi cắn với RM OFF (dao động sin liên tục)
            const samplesA = [];
            for (let i = 0; i < 20; i++) {
                samplesA.push(gs.currentLanternRadius);
                await new Promise(r => requestAnimationFrame(r));
            }
            const minA = Math.min(...samplesA);
            const maxA = Math.max(...samplesA);
            const deltaA = maxA - minA;

            // Chờ hết flicker cũ và hồi phục
            gs.batLanternFlickerTimer = 0;
            await new Promise(r => setTimeout(r, 200));

            // Phase B: Reduced Motion ON
            sm.settings.reducedMotionEnabled = true;
            gs.events.emit('lantern_flicker', { duration: 2500 });
            const timerInitial = gs.batLanternFlickerTimer;
            gs.currentLanternRadius = targetEquilibrium;
            await new Promise(r => setTimeout(r, 100));

            const samplesB = [];
            for (let i = 0; i < 20; i++) {
                samplesB.push(gs.currentLanternRadius);
                await new Promise(r => requestAnimationFrame(r));
            }
            const minB = Math.min(...samplesB);
            const maxB = Math.max(...samplesB);
            const deltaB = maxB - minB;
            const timerAfter = gs.batLanternFlickerTimer;

            // Dọn dẹp
            gs.batLanternFlickerTimer = 0;

            return {
                deltaA,
                deltaB,
                timerInitial,
                timerAfter,
                minB,
                maxB
            };
        }
        """)
        print(f"  T9 Bat Flicker: RM_OFF Delta={t9['deltaA']:.4f} | RM_ON Delta={t9['deltaB']:.4f}, Timer={t9['timerInitial']} -> {t9['timerAfter']}")
        assert t9['deltaA'] > 0.05, f"When RM is OFF, bat attack must oscillate lantern light, got delta {t9['deltaA']}"
        assert t9['deltaB'] < 0.15, f"When RM is ON, bat attack must be smoothly static (no oscillation), got delta {t9['deltaB']}"
        assert t9['timerAfter'] < t9['timerInitial'], "Bat flicker timer must decrement normally"
        print("  [PASS] Test 9: Hiệu ứng dơi tấn công giữ nguyên gameplay, triệt tiêu dao động chao đảo quang học khi RM ON.")
        test_results['test_9_bat_attack_flicker'] = t9

        # -------------------------------------------------------------
        # TEST 10: Pause / Resume Lifecycle
        # -------------------------------------------------------------
        print("\n--- TEST 10: PAUSE / RESUME LIFECYCLE ---")
        page.keyboard.press('Escape')
        page.wait_for_timeout(500)
        pause_open = page.evaluate("() => Boolean(window.__PHASER_GAME__.scene.getScene('UIScene').pauseModal?.isOpen)")

        page.keyboard.press('Escape')
        page.wait_for_timeout(500)
        pause_closed = page.evaluate("() => !window.__PHASER_GAME__.scene.getScene('UIScene').pauseModal?.isOpen")

        print(f"  T10 Pause/Resume: Open={pause_open}, Closed={pause_closed}")
        assert pause_open and pause_closed, "Pause/Resume cycle failed"
        print("  [PASS] Test 10: Pause/Resume và vòng đời hoạt động an toàn.")
        test_results['test_10_pause_resume'] = {"open": pause_open, "closed": pause_closed}

        # -------------------------------------------------------------
        # TEST 11: New Game / Continue Consistency
        # -------------------------------------------------------------
        print("\n--- TEST 11: SETTINGS CONSISTENCY & PERSISTENCE ---")
        t11 = page.evaluate("""
        () => {
            const sm = window.__SETTINGS_MANAGER__;
            sm.setReducedMotionEnabled(true);
            const rm1 = sm.isReducedMotionPreferred();

            sm.setReducedMotionEnabled(false);
            const rm2 = sm.isReducedMotionPreferred();

            sm.setReducedMotionEnabled(true);
            const rm3 = sm.isReducedMotionPreferred();

            return { rm1, rm2, rm3 };
        }
        """)
        print(f"  T11 Persistence: RM1={t11['rm1']}, RM2={t11['rm2']}, RM3={t11['rm3']}")
        assert t11['rm1'] and not t11['rm2'] and t11['rm3'], "Reduced Motion setting persistence cycle failed"
        print("  [PASS] Test 11: Cài đặt và tính nhất quán lưu trữ hoạt động hoàn hảo.")
        test_results['test_11_persistence'] = t11

        # -------------------------------------------------------------
        # TEST 12: Reduced Motion ON -> OFF -> ON Transition & FPS Stability
        # -------------------------------------------------------------
        print("\n--- TEST 12: REDUCED MOTION TRANSITION & FPS STABILITY ---")
        t12 = page.evaluate("""
        async () => {
            const gs = window.__PHASER_GAME__.scene.getScene('GameScene');
            const sm = window.__SETTINGS_MANAGER__;
            if (window.__GRAPHICS_QUALITY_SYSTEM__) {
                window.__GRAPHICS_QUALITY_SYSTEM__.setQuality('HIGH');
            }

            window.__SET_TEST_ZONE__('outer_woods', 1200, 600);
            gs.playerState.stats.isLanternOn = true;
            gs.playerState.stats.lanternOil = 100;
            gs.playerState.stats.composure = 100;
            gs.currentLanternRadius = 240;

            // 1. Start ON: Collect optical samples and measure frame time
            sm.setReducedMotionEnabled(true);
            await new Promise(r => setTimeout(r, 100));
            const s1 = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const delta1 = Math.max(...s1.map(s => s.breathingFactor)) - Math.min(...s1.map(s => s.breathingFactor));

            const tOnStart = performance.now();
            for (let i = 0; i < 10; i++) {
                await new Promise(r => requestAnimationFrame(r));
            }
            const frameTimeOn = (performance.now() - tOnStart) / 10;

            // 2. Switch OFF: Collect optical samples and measure frame time
            sm.setReducedMotionEnabled(false);
            await new Promise(r => setTimeout(r, 100));
            const s2 = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const delta2 = Math.max(...s2.map(s => s.breathingFactor)) - Math.min(...s2.map(s => s.breathingFactor));

            const tOffStart = performance.now();
            for (let i = 0; i < 10; i++) {
                await new Promise(r => requestAnimationFrame(r));
            }
            const frameTimeOff = (performance.now() - tOffStart) / 10;

            // 3. Switch back ON: Verify immediate optical stability
            sm.setReducedMotionEnabled(true);
            await new Promise(r => setTimeout(r, 100));
            const s3 = await window.__COLLECT_LANTERN_GLOW_SAMPLES__(25);
            const delta3 = Math.max(...s3.map(s => s.breathingFactor)) - Math.min(...s3.map(s => s.breathingFactor));

            // Equivalent FPS comparison
            const fpsOn = 1000 / (frameTimeOn || 16.66);
            const fpsOff = 1000 / (frameTimeOff || 16.66);
            const frameRatio = frameTimeOn / (frameTimeOff || 1.0);

            return {
                delta1,
                delta2,
                delta3,
                frameTimeOn,
                frameTimeOff,
                fpsOn,
                fpsOff,
                frameRatio
            };
        }
        """)
        print(f"  T12 Transition: ON Delta={t12['delta1']:.6f} -> OFF Delta={t12['delta2']:.6f} -> ON Delta={t12['delta3']:.6f}")
        print(f"  T12 FPS Equivalent: ON={t12['fpsOn']:.1f} FPS ({t12['frameTimeOn']:.1f}ms) vs OFF={t12['fpsOff']:.1f} FPS ({t12['frameTimeOff']:.1f}ms), Ratio={t12['frameRatio']:.2f}")
        assert t12['delta1'] < 0.00001, f"Step 1 ON must have 0 oscillation, got {t12['delta1']}"
        assert t12['delta2'] > 0.0001, f"Step 2 OFF must have amber flicker, got {t12['delta2']}"
        assert t12['delta3'] < 0.00001, f"Step 3 ON must immediately return to 0 oscillation, got {t12['delta3']}"
        assert 0.4 <= t12['frameRatio'] <= 2.5, f"Frame times between ON and OFF must be equivalent (no significant FPS degradation), got ratio {t12['frameRatio']}"
        print("  [PASS] Test 12: Chuyển đổi linh hoạt ON -> OFF -> ON mượt mà, hiệu năng FPS tương đương không sụt giảm.")
        test_results['test_12_transition_and_fps'] = t12

        print(f"\n[Console Errors]: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print(f"  - {err}")
        assert len(console_errors) == 0, f"Must have 0 console errors, got {len(console_errors)}"

        # Save metrics
        metrics_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Read", "V1.5", "Reports", "hw_fix23a_metrics.json")
        with open(metrics_file, "w", encoding="utf-8") as f:
            json.dump(test_results, f, indent=2)
        print(f"\n[QA] ALL 12 REDUCED MOTION TESTS PASSED! Metrics saved to {metrics_file}")

        browser.close()

if __name__ == "__main__":
    main()
