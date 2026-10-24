(function() {
 function visual(path){return window.PatiLifePatileTheme?.asset(path)||path;}
 const physicsClock=window.PatiLifePhysicsClock.create();
 let suikaActive=false,physicsTick=null,particleTick=null,physicsRaf=null,particleRaf=null;

//  12 KADEMELİ EVRİM VE DENGELENMİŞ ÇEMBER BOYUTLARI
        const CAT_ITEMS = [
            { tier: 1,  name: "Yumak",           radius: 14, score: 2,    scale: 2.12, physicsRatio: 0.90, sprite: visual("suika_game/cat_sprites/1.png"),    frozenSprite: visual("suika_game/cat_sprites/1_frozen.png") },
            { tier: 2,  name: "Zil",             radius: 18, score: 4,    scale: 2.10, physicsRatio: 0.90, sprite: visual("suika_game/cat_sprites/2.png"),    frozenSprite: visual("suika_game/cat_sprites/2_frozen.png") },
            { tier: 3,  name: "Süt",             radius: 23, score: 8,    scale: 2.12, physicsRatio: 0.89, sprite: visual("suika_game/cat_sprites/3.png"),    frozenSprite: visual("suika_game/cat_sprites/3_frozen.png") },
            { tier: 4,  name: "Balık",           radius: 29, score: 16,   scale: 2.15, physicsRatio: 0.88, sprite: visual("suika_game/cat_sprites/4.png"),    frozenSprite: visual("suika_game/cat_sprites/4_frozen.png") },
            { tier: 5,  name: "Fare",            radius: 36, score: 32,   scale: 2.16, physicsRatio: 0.88, sprite: visual("suika_game/cat_sprites/5.png"),    frozenSprite: visual("suika_game/cat_sprites/5_frozen.png") },
            { tier: 6,  name: "Konserve",        radius: 44, score: 64,   scale: 2.10, physicsRatio: 0.90, sprite: visual("suika_game/cat_sprites/6.png"),    frozenSprite: visual("suika_game/cat_sprites/6_frozen.png") },
            { tier: 7,  name: "Tavuk",           radius: 53, score: 128,  scale: 2.16, physicsRatio: 0.87, sprite: visual("suika_game/cat_sprites/7.png"),    frozenSprite: visual("suika_game/cat_sprites/7_frozen.png") },
            { tier: 8,  name: "Kral Kedi",       radius: 63, score: 256,  scale: 2.08, physicsRatio: 0.92, sprite: visual("suika_game/cat_sprites/8.png"),    frozenSprite: visual("suika_game/cat_sprites/8_frozen.png") },
            { tier: 9,  name: "Tırmalama Ağacı", radius: 74, score: 512,  scale: 2.26, physicsRatio: 0.80, sprite: visual("suika_game/cat_sprites_v3/9.png"), frozenSprite: visual("suika_game/cat_sprites_v3/9_frozen.png") },
            { tier: 10, name: "Kraliyet Koltuğu",radius: 86, score: 1024, scale: 2.06, physicsRatio: 0.92, sprite: visual("suika_game/cat_sprites_v3/10.png"),frozenSprite: visual("suika_game/cat_sprites_v3/10_frozen.png") },
            { tier: 11, name: "Prenses Kedi",    radius: 98, score: 2048, scale: 2.06, physicsRatio: 0.92, sprite: visual("suika_game/cat_sprites_v3/11.png"),frozenSprite: visual("suika_game/cat_sprites_v3/11_frozen.png") },
            { tier: 12, name: "Kozmik Kedi",     radius: 112, score: 4096, scale: 2.05, physicsRatio: 0.93, sprite: visual("suika_game/cat_sprites_v3/12.png"),frozenSprite: visual("suika_game/cat_sprites_v3/12_frozen.png") }
        ];

        /* ==========================================
            İLERLEME & KAYIT SİSTEMİ (LOCALSTORAGE)
           ========================================== */
        const SAVE_KEY = 'cat_suika_save_v2';
        let currentLevel = 1;
        let maxUnlockedLevel = 1;
        let currentScore = 0;
        let dropsUsedInLevel = 0;
        let levelStars = {};
        let jokerCounts = { hammer: 3, shake: 2, swap: 3 };
        let levelGoals = {};

        let currentDropLevel = 1;
        let nextDropLevel = 1;
        let isDropping = false;
        let isLevelCompleted = false;
        let isVictoryTriggered = false;
        let isVictoryModalOpen = false;
        let isTransitioningLevel = false;
        let victoryTimer = null;
        let modalOpenTimer = null;
        let isHammerMode = false;
        let isGameOver = false;

        //  Combo Sistemi
        let comboCount = 0;
        let comboTimer = null;
        const COMBO_WINDOW_MS = 1200;

        //  Parçacık Sistemi
        let particleCanvas, particleCtx;
        const particles = [];

        //  Game Over Kontrolü
        let dangerTimer = null;
        let dangerAccumulator = 0;
        const DANGER_Y = 188; // Tehlike çizgisi Y konumu
        const DANGER_THRESHOLD_MS = 3000; // 3 saniye tehlikede kalırsa oyun biter

        let soundSettings = { bgm: true, sfx: true, vibration: true };
        let suikaAudioCtx = null;

        let engine, world;
        let ground, leftWall, rightWall;
        let gameCanvas, ctx;
        let suikaContainerWidth = 400;
        let suikaContainerHeight = 800;

        const suikaLoadedImages = {};
        function texture(path){if(!suikaLoadedImages[path]){const img=new Image();img.decoding='async';img.src=path;suikaLoadedImages[path]=img;}return suikaLoadedImages[path];}
        function preloadAssets(){CAT_ITEMS.slice(0,3).forEach(item=>texture(item.sprite));}

        /* ==========================================
            SES MOTORU (WEB AUDIO API)
           ========================================== */
        function initAudio() {
            if (!suikaAudioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) suikaAudioCtx = new AudioContext();
            }
            if (audioCtx && suikaAudioCtx.state === 'suspended') {
                suikaAudioCtx.resume();
            }
        }

        /* ==========================================
            ARKA PLAN MÜZİĞİ (BGM) SENTETİZÖRÜ
           ========================================== */
        let bgmTimer = null;
        let bgmNoteIndex = 0;

        // Tatlı, Neşeli & Rahatlatıcı Kedi Melodisi (Hz & Süre)
        const BGM_MELODY = [
            { f: 523.25, d: 0.28 }, // C5
            { f: 659.25, d: 0.28 }, // E5
            { f: 783.99, d: 0.28 }, // G5
            { f: 880.00, d: 0.28 }, // A5
            { f: 783.99, d: 0.28 }, // G5
            { f: 659.25, d: 0.28 }, // E5
            { f: 587.33, d: 0.28 }, // D5
            { f: 523.25, d: 0.56 }, // C5
            { f: 440.00, d: 0.28 }, // A4
            { f: 523.25, d: 0.28 }, // C5
            { f: 659.25, d: 0.28 }, // E5
            { f: 587.33, d: 0.56 }, // D5
            { f: 493.88, d: 0.28 }, // B4
            { f: 523.25, d: 0.56 }  // C5
        ];

        function startBGM() {
            const suikaScreen = document.getElementById('screen-suika');
            if (suikaScreen && !suikaScreen.classList.contains('active')) return;
            if (!soundSettings.bgm) return;
            initAudio();
            if (!suikaAudioCtx) return;
            if (bgmTimer) return;

            function playNextBgmNote() {
                const sScreen = document.getElementById('screen-suika');
                if (!soundSettings.bgm || !suikaAudioCtx || (sScreen && !sScreen.classList.contains('active'))) {
                    stopBGM();
                    return;
                }
                try {
                    const note = BGM_MELODY[bgmNoteIndex % BGM_MELODY.length];
                    bgmNoteIndex++;

                    const now = suikaAudioCtx.currentTime;
                    const osc = suikaAudioCtx.createOscillator();
                    const gain = suikaAudioCtx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(note.f, now);

                    // Yumuşak çan / marimba tınısı
                    gain.gain.setValueAtTime(0.045, now);
                    gain.gain.exponentialRampToValueAtTime(0.0005, now + note.d * 0.95);

                    osc.connect(gain);
                    gain.connect(suikaAudioCtx.destination);

                    osc.start(now);
                    osc.stop(now + note.d);

                    bgmTimer = setTimeout(playNextBgmNote, note.d * 1000);
                } catch(e) {}
            }

            playNextBgmNote();
        }

        function stopBGM() {
            if (bgmTimer) {
                clearTimeout(bgmTimer);
                bgmTimer = null;
            }
        }

        function toggleBGM() {
            soundSettings.bgm = !soundSettings.bgm;
            if (soundSettings.bgm) {
                startBGM();
            } else {
                stopBGM();
            }
            saveUserProgress();
            updateSoundToggleUI();
        }

        function toggleSFX() {
            soundSettings.sfx = !soundSettings.sfx;
            saveUserProgress();
            updateSoundToggleUI();
        }

        function toggleVibration() {
            soundSettings.vibration = (soundSettings.vibration !== false) ? false : true;
            saveUserProgress();
            updateSoundToggleUI();
            if (soundSettings.vibration) triggerVibrate([25]);
        }

        function triggerVibrate(pattern = [20], style = 'medium') {
            if (soundSettings.vibration === false) return;
            if (!hasUserGesture) return;
            try {
                const Haptics = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) 
                    || (window.Capacitor && window.Capacitor.Haptics);
                if (Haptics) {
                    if (style === 'heavy') {
                        Haptics.impact({ style: 'heavy' });
                    } else if (style === 'medium') {
                        Haptics.impact({ style: 'medium' });
                    } else {
                        Haptics.impact({ style: 'light' });
                    }
                } else if (navigator.vibrate) {
                    navigator.vibrate(pattern);
                }
            } catch(e) {}
        }

        function promptResetSuikaLevels() {
            const settingsModal = document.getElementById('modalSettings');
            if (settingsModal) settingsModal.classList.remove('active');
            const modal = document.getElementById('modalResetAllConfirm');
            if (modal) {
                modal.classList.add('active');
            } else {
                confirmResetAllSuikaLevels();
            }
        }

        function closeResetAllConfirm() {
            const modal = document.getElementById('modalResetAllConfirm');
            if (modal) modal.classList.remove('active');
        }

        function confirmResetAllSuikaLevels() {
            closeResetAllConfirm();
            maxUnlockedLevel = 1;
            currentLevel = 1;
            levelStars = {};
            currentScore = 0;
            dropsUsedInLevel = 0;
            saveUserProgress();
            clearActiveBoardState();
            startLevel(1, true);
            const lvlBadge = document.getElementById('lblCurrentLevel');
            if (lvlBadge) lvlBadge.innerText = '1';
            const scoreBadge = document.getElementById('lblCurrentScore');
            if (scoreBadge) scoreBadge.innerText = '0';
            const dropsBadge = document.getElementById('lblDropsUsed');
            if (dropsBadge) dropsBadge.innerText = '0';
            if (typeof showBubble === 'function') showBubble('Patile seviyeleri 1. seviyeye sıfırlandı!');
        }

        function updateSoundToggleUI() {
            const btnBGM = document.getElementById('btnToggleBGM');
            const btnSFX = document.getElementById('btnToggleSFX');
            const btnVib = document.getElementById('btnToggleVibration');
            if (btnBGM) {
                btnBGM.className = 'settings-toggle ' + (soundSettings.bgm ? 'on' : 'off');
                btnBGM.innerText = soundSettings.bgm ? 'AÇIK' : 'KAPALI';
            }
            if (btnSFX) {
                btnSFX.className = 'settings-toggle ' + (soundSettings.sfx ? 'on' : 'off');
                btnSFX.innerText = soundSettings.sfx ? 'AÇIK' : 'KAPALI';
            }
            if (btnVib) {
                const isVibOn = soundSettings.vibration !== false;
                btnVib.className = 'settings-toggle ' + (isVibOn ? 'on' : 'off');
                btnVib.innerText = isVibOn ? 'AÇIK' : 'KAPALI';
            }
        }

        function playSound(type, param) {
            const suikaScreen = document.getElementById('screen-suika');
            if (suikaScreen && !suikaScreen.classList.contains('active')) return;
            if (!soundSettings.sfx) return;
            initAudio();
            if (!suikaAudioCtx) return;

            try {
                const now = suikaAudioCtx.currentTime;
                const osc = suikaAudioCtx.createOscillator();
                const gain = suikaAudioCtx.createGain();
                osc.connect(gain);
                gain.connect(suikaAudioCtx.destination);

                if (type === 'drop') {
                    triggerVibrate([15], 'light');
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                } else if (type === 'merge') {
                    triggerVibrate([40, 40], 'heavy');
                    const freqs = [330, 392, 440, 493, 523, 587, 659, 783, 880, 988, 1046, 1174];
                    const f = freqs[Math.min((param || 1) - 1, freqs.length - 1)];
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now);
                    osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.2);
                    gain.gain.setValueAtTime(0.35, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                } else if (type === 'hammer') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'swap') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                } else if (type === 'win') {
                    [523, 659, 783, 1046].forEach((fr, idx) => {
                        const o = suikaAudioCtx.createOscillator();
                        const g = suikaAudioCtx.createGain();
                        o.connect(g);
                        g.connect(suikaAudioCtx.destination);
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(fr, now + idx * 0.1);
                        g.gain.setValueAtTime(0.3, now + idx * 0.1);
                        g.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
                        o.start(now + idx * 0.1);
                        o.stop(now + idx * 0.1 + 0.25);
                    });
                }
            } catch(e) {}
        }

        /* ==========================================
            KAYIT & İLERLEME SİSTEMİ
           ========================================== */
        function loadUserProgress() {
            try {
                const raw = localStorage.getItem('cat_suika_save_v2');
                if (raw) {
                    const data = JSON.parse(raw);
                    maxUnlockedLevel = data.maxUnlockedLevel || 1;
                    currentLevel = data.currentLevel || maxUnlockedLevel;
                    levelStars = data.levelStars || {};
                    if (data.jokerCounts) jokerCounts = Object.assign(jokerCounts, data.jokerCounts);
                    if (data.soundSettings) soundSettings = Object.assign(soundSettings, data.soundSettings);
                }
            } catch(e) {}
            updateJokerBadges();
            updateSoundToggleUI();
            updateLevelDifficultyBadge(currentLevel);
        }

        function saveUserProgress() {
            try {
                const payload = {
                    maxUnlockedLevel,
                    currentLevel,
                    levelStars,
                    jokerCounts,
                    soundSettings,
                    currentScore
                };
                localStorage.setItem('cat_suika_save_v2', JSON.stringify(payload));
                window.CloudManager?.saveToCloud();
            } catch(e) {}
        }

        /*  CANLI TAHTA & OBJE DURUMU KAYDI (Debounced - Ana thread'i dondurmaz!) */
        let _saveBoardTimer = null;
        function saveActiveBoardState() {
            if (!world || isLevelCompleted || isGameOver) return;
            if (_saveBoardTimer) clearTimeout(_saveBoardTimer);
            _saveBoardTimer = setTimeout(_performActualBoardSave, 180);
        }

        function _performActualBoardSave() {
            if (!world || isLevelCompleted || isGameOver) return;
            try {
                const bodies = Matter.Composite.allBodies(world);
                const activeBodies = [];
                for (let i = 0; i < bodies.length; i++) {
                    const b = bodies[i];
                    if (b.customData && b.customData.tier) {
                        activeBodies.push({
                            x: Math.round(b.position.x * 10) / 10,
                            y: Math.round(b.position.y * 10) / 10,
                            vx: b.velocity ? Math.round(b.velocity.x * 100) / 100 : 0,
                            vy: b.velocity ? Math.round(b.velocity.y * 100) / 100 : 0,
                            angle: Math.round((b.angle || 0) * 100) / 100,
                            angularVelocity: Math.round((b.angularVelocity || 0) * 100) / 100,
                            isStatic: !!b.isStatic,
                            tier: b.customData.tier,
                            isFrozen: !!b.customData.isFrozen,
                            spawnTime: b.customData.spawnTime || (Date.now() - 5000)
                        });
                    }
                }
                const boardPayload = {
                    level: currentLevel,
                    score: currentScore,
                    dropsUsed: dropsUsedInLevel,
                    levelGoals: levelGoals,
                    currentDropLevel: currentDropLevel,
                    nextDropLevel: nextDropLevel,
                    bodies: activeBodies,
                    timestamp: Date.now()
                };
                localStorage.setItem('cat_suika_active_board_v1', JSON.stringify(boardPayload));
                window.CloudManager?.saveToCloud();
            } catch(e) {}
        }

        function clearActiveBoardState() {
            if (_saveBoardTimer) {
                clearTimeout(_saveBoardTimer);
                _saveBoardTimer = null;
            }
            try {
                localStorage.removeItem('cat_suika_active_board_v1');
                window.CloudManager?.saveToCloud();
            } catch(e) {}
        }

        function updateJokerBadges() {
            document.getElementById('badgeJokerHammer').innerText = jokerCounts.hammer;
            document.getElementById('badgeJokerShake').innerText = jokerCounts.shake;
            document.getElementById('badgeJokerSwap').innerText = jokerCounts.swap;
        }

        /* ==========================================
            SEVİYE OLUŞTURMA MOTORU v2
           ==========================================
           
            TASARIM İLKELERİ:
           
           1. HER SEVİYE BENZERSİZ: Seviye numarası → deterministik hedef seti
           2. KADEMELI ZORLUK EĞRİSİ:
              - İlk 5 seviye: Öğretici (Tier 3-5 hedefler)
              - 6-15: Orta düzey (Tier 4-7)
              - 16-25: İleri (Tier 5-9)
              - 26-35: Uzman (Tier 7-11)
              - 36+: Efsane (Tier 9-12)
           3. RİTİM DÖNGÜSÜ: Her 5 seviyede 1 döngü
              [Kolay → Orta → Orta-Zor → Zor → Boss]
              Boss her zaman en yüksek tier hedeflerle gelir
           4. HEDEF SAYISI: Kolay=1 hedef, Orta=1-2, Zor=2, Boss=2-3
           
            YILDIZ HESAPLAMA:
           Bir Tier N obje üretmek için gereken TEORİK MİNİMUM atış:
             minDrops(N) = 2^(N - maxDropTier)
           Burada maxDropTier düşebilecek en yüksek obje tier'ı (3-5).
           Toplam hedef için tüm goalların minDrops'u toplanır.
           ========================================== */

        // =========================================================================
        //  HOMOJEN & DALGALI SEVİYE MATEMATİĞİ (PACING & RETENTION CURVE)
        // 7 Seviyelik Mükemmel Dalga Ritmi:
        // 1: KOLAY -> 2: ORTA -> 3: KOLAY -> 4: ZOR -> 5: KOLAY -> 6: ORTA -> 7: BOSS
        // =========================================================================
        function getLevelMeta(lvl) {
            const cycle = ((lvl - 1) % 7) + 1; // 1-7 arası dalga pozisyonu
            const phase = Math.floor((lvl - 1) / 7); // Kaçıncı büyük bölge (0, 1, 2, 3...)

            // Dalgalı Ritim Dizilimi (Kullanıcı Formülü: Kolay -> Orta -> Kolay -> Zor -> Kolay -> Orta -> Boss)
            let difficulty;
            if (cycle === 1) difficulty = 'easy';          // 1. Kolay (Ferahlatıcı başlangıç)
            else if (cycle === 2) difficulty = 'medium';    // 2. Orta (Isınma)
            else if (cycle === 3) difficulty = 'easy';      // 3. Kolay (Rahatlatıcı ara nefes)
            else if (cycle === 4) difficulty = 'hard';      // 4. Zor (İlk büyük efor)
            else if (cycle === 5) difficulty = 'easy';      // 5. Kolay (Zordan sonra ödül ve akış)
            else if (cycle === 6) difficulty = 'medium';    // 6. Orta (Boss öncesi hazırlık)
            else difficulty = 'boss';                       // 7. BOSS (Büyük dönemin zirvesi)

            // Kademeli büyüyen tavan tier (Seviye 1-7: max 6, Seviye 8-14: max 7 ... Seviye 42+: max 12)
            const maxReachableTier = Math.min(12, 5 + phase);

            // Düşme havuzu (Düşebilecek max tier)
            let maxDropTier = 3;
            if (lvl >= 6) maxDropTier = 4;
            if (lvl >= 15) maxDropTier = 5;

            return { cycle, phase, difficulty, maxReachableTier, maxDropTier };
        }

        function generateLevelConfig(lvl) {
            const goals = {};
            const { cycle, phase, difficulty } = getLevelMeta(lvl);

            if (difficulty === 'easy') {
                // ==========================================
                // KOLAY SEVİYELER (Cycle 1, 3, 5):
                // Hedefler SADECE Tier 2 (Zil), Tier 3 (Süt), Tier 4 (Balık), Tier 5 (Fare)
                // KESİNLİKLE Taht (T10), Tırmalama (T9), Kral Kedi (T8) ÇIKMAZ!
                // Küçük objeleri birleştirmek kolay ve akıcı olduğu için sayılar bol (10-25 arası)
                // ==========================================
                if (lvl === 1) {
                    // Seviye 1: Giriş ve öğrenme (6 Zil + 4 Balık)
                    goals[2] = { target: 6, current: 0 };
                    goals[4] = { target: 4, current: 0 };
                } else if (lvl === 3) {
                    // Seviye 3: Isınma (8 Zil + 6 Balık)
                    goals[2] = { target: 8, current: 0 };
                    goals[4] = { target: 6, current: 0 };
                } else if (lvl === 5) {
                    // Seviye 5: Fareye geçiş (10 Balık + 8 Fare)
                    goals[4] = { target: 10, current: 0 };
                    goals[5] = { target: 8, current: 0 };
                } else {
                    // İlerleyen kolay seviyeler: 8 farklı zengin arketip rotasyonu
                    const easyIdx = (cycle === 1) ? 0 : (cycle === 3 ? 1 : 2);
                    const arch = ((phase - 1) * 3 + easyIdx) % 8;

                    if (arch === 0) {
                        // Arketip 0: 10 Zil + 20 Balık
                        const countZil = 10 + ((phase - 1) % 3) * 2;
                        goals[2] = { target: countZil, current: 0 };
                        goals[4] = { target: 20, current: 0 };
                    } else if (arch === 1) {
                        // Arketip 1: 20 Fare + 20 Balık
                        goals[5] = { target: 20, current: 0 };
                        goals[4] = { target: 20, current: 0 };
                    } else if (arch === 2) {
                        // Arketip 2: 18 Zil + 12 Süt
                        const countZil = 18 + ((phase - 1) % 3) * 2;
                        const countSut = 12 + ((phase - 1) % 3) * 2;
                        goals[2] = { target: countZil, current: 0 };
                        goals[3] = { target: countSut, current: 0 };
                    } else if (arch === 3) {
                        // Arketip 3: Büyük Balık Avı (22-26 Balık)
                        const countBalik = 22 + ((phase - 1) % 3) * 2;
                        goals[4] = { target: countBalik, current: 0 };
                    } else if (arch === 4) {
                        // Arketip 4: 15 Fare + 15 Balık
                        const countFare = 15 + ((phase - 1) % 3) * 2;
                        const countBalik = 15 + ((phase - 1) % 3) * 2;
                        goals[5] = { target: countFare, current: 0 };
                        goals[4] = { target: countBalik, current: 0 };
                    } else if (arch === 5) {
                        // Arketip 5: 14 Fare + 12 Zil
                        const countFare = 14 + ((phase - 1) % 3) * 2;
                        const countZil = 12 + ((phase - 1) % 3) * 2;
                        goals[5] = { target: countFare, current: 0 };
                        goals[2] = { target: countZil, current: 0 };
                    } else if (arch === 6) {
                        // Arketip 6: 14 Süt + 16 Balık
                        const countSut = 14 + ((phase - 1) % 3) * 2;
                        const countBalik = 16 + ((phase - 1) % 3) * 2;
                        goals[3] = { target: countSut, current: 0 };
                        goals[4] = { target: countBalik, current: 0 };
                    } else {
                        // Arketip 7: 15 Zil + 15 Fare
                        const countZil = 15 + ((phase - 1) % 3) * 2;
                        const countFare = 15 + ((phase - 1) % 3) * 2;
                        goals[2] = { target: countZil, current: 0 };
                        goals[5] = { target: countFare, current: 0 };
                    }
                }

            } else if (difficulty === 'medium') {
                // ==========================================
                // ORTA SEVİYELER (Cycle 2, 6):
                // Hedefler: Tier 4 (Balık), Tier 5 (Fare), Tier 6 (Konserve), Tier 7 (Tavuk), İleride Tier 8 (Kral Kedi)
                // Örnek: 10 Konserve + 5 Tavuk, 15 Fare + 8 Konserve, 6 Tavuk + 8 Konserve vb.
                // ==========================================
                if (lvl === 2) {
                    // İlk orta seviye: 6 Fare + 4 Konserve
                    goals[5] = { target: 6, current: 0 };
                    goals[6] = { target: 4, current: 0 };
                } else if (lvl === 6) {
                    // İlk döngü sonu orta seviye: 6 Konserve + 3 Tavuk
                    goals[6] = { target: 6, current: 0 };
                    goals[7] = { target: 3, current: 0 };
                } else {
                    const medIdx = (cycle === 2) ? 0 : 1;
                    const arch = ((phase - 1) * 2 + medIdx) % 6;

                    if (arch === 0) {
                        // Arketip 0: 10 Konserve + 5 Tavuk
                        const countKonserve = 10 + ((phase - 1) % 3) * 2;
                        goals[6] = { target: countKonserve, current: 0 };
                        goals[7] = { target: 5, current: 0 };
                    } else if (arch === 1) {
                        // Arketip 1: 15 Fare + 8 Konserve
                        const countFare = 15 + ((phase - 1) % 3) * 2;
                        const countKonserve = 8 + ((phase - 1) % 3) * 2;
                        goals[5] = { target: countFare, current: 0 };
                        goals[6] = { target: countKonserve, current: 0 };
                    } else if (arch === 2) {
                        // Arketip 2: 6 Tavuk + 8 Konserve
                        const countTavuk = 6 + ((phase - 1) % 3);
                        const countKonserve = 8 + ((phase - 1) % 3);
                        goals[7] = { target: countTavuk, current: 0 };
                        goals[6] = { target: countKonserve, current: 0 };
                    } else if (arch === 3) {
                        // Arketip 3: 12-16 Konserve Deposu
                        const countKonserve = 12 + ((phase - 1) % 3) * 2;
                        goals[6] = { target: countKonserve, current: 0 };
                    } else if (arch === 4) {
                        // Arketip 4: Kral Kedi & Konserve (phase >= 2)
                        if (phase >= 2) {
                            const countKral = 1 + (phase >= 4 ? 1 : 0);
                            const countKonserve = 6 + ((phase - 1) % 3);
                            goals[8] = { target: countKral, current: 0 };
                            goals[6] = { target: countKonserve, current: 0 };
                        } else {
                            goals[6] = { target: 8, current: 0 };
                            goals[7] = { target: 4, current: 0 };
                        }
                    } else {
                        // Arketip 5: 16 Balık + 5 Tavuk
                        const countBalik = 16 + ((phase - 1) % 3) * 2;
                        const countTavuk = 5 + ((phase - 1) % 2);
                        goals[4] = { target: countBalik, current: 0 };
                        goals[7] = { target: countTavuk, current: 0 };
                    }
                }

            } else if (difficulty === 'hard') {
                // ==========================================
                // ZOR SEVİYELER (Cycle 4):
                // Hedefler: Tier 6 (Konserve), Tier 7 (Tavuk), Tier 8 (Kral Kedi), Tier 9 (Tırmalama), Tier 10 (Taht - ileri fazlarda)
                // Örnek: 10 Konserve + 5 Tavuk, 8 Tavuk + 3 Kral Kedi, 1 Taht + 2 Kral Kedi vb.
                // ==========================================
                if (lvl === 4) {
                    // İlk zor seviye: 8 Konserve + 4 Tavuk
                    goals[6] = { target: 8, current: 0 };
                    goals[7] = { target: 4, current: 0 };
                } else {
                    const arch = (phase - 1) % 5;

                    if (arch === 0) {
                        // Arketip 0: 10 Konserve + 5 Tavuk
                        const countKonserve = 10 + ((phase - 1) % 3) * 2;
                        const countTavuk = 5 + ((phase - 1) % 2);
                        goals[6] = { target: countKonserve, current: 0 };
                        goals[7] = { target: countTavuk, current: 0 };
                    } else if (arch === 1) {
                        // Arketip 1: 8 Tavuk + 3 Kral Kedi
                        const countTavuk = 8 + ((phase - 1) % 2) * 2;
                        goals[7] = { target: countTavuk, current: 0 };
                        goals[8] = { target: 3, current: 0 };
                    } else if (arch === 2) {
                        // Arketip 2: 1 Tırmalama Ağacı + 6 Tavuk
                        const countTirmalama = 1 + (phase >= 3 ? 1 : 0);
                        const countTavuk = 6 + ((phase - 1) % 3);
                        goals[9] = { target: countTirmalama, current: 0 };
                        goals[7] = { target: countTavuk, current: 0 };
                    } else if (arch === 3) {
                        // Arketip 3: 1 Kraliyet Koltuğu (Taht) + 2 Kral Kedi (phase >= 2)
                        if (phase >= 2) {
                            const countKral = 2 + (phase >= 4 ? 1 : 0);
                            goals[10] = { target: 1, current: 0 };
                            goals[8] = { target: countKral, current: 0 };
                        } else {
                            goals[6] = { target: 12, current: 0 };
                            goals[8] = { target: 2, current: 0 };
                        }
                    } else {
                        // Arketip 4: 14 Konserve + 2 Kral Kedi
                        const countKonserve = 14 + ((phase - 1) % 3) * 2;
                        goals[6] = { target: countKonserve, current: 0 };
                        goals[8] = { target: 2, current: 0 };
                    }
                }

            } else {
                // ==========================================
                // 7. BOSS SEVİYELERİ (Cycle 7: Seviye 7, 14, 21, 28, 35, 42...):
                // Her fazın büyük zirvesi! Kademeli olarak en yüksek hedeflere ulaşılır
                // ==========================================
                if (phase === 0) {
                    // Seviye 7 Boss: 2 Kral Kedi (T8) + 5 Tavuk (T7)
                    goals[8] = { target: 2, current: 0 };
                    goals[7] = { target: 5, current: 0 };
                } else if (phase === 1) {
                    // Seviye 14 Boss: 2 Tırmalama Ağacı (T9) + 3 Kral Kedi (T8)
                    goals[9] = { target: 2, current: 0 };
                    goals[8] = { target: 3, current: 0 };
                } else if (phase === 2) {
                    // Seviye 21 Boss: 2 Kraliyet Koltuğu / Taht (T10) + 3 Kral Kedi (T8)
                    goals[10] = { target: 2, current: 0 };
                    goals[8] = { target: 3, current: 0 };
                } else if (phase === 3) {
                    // Seviye 28 Boss: 1 Prenses Kedi (T11) + 2 Kraliyet Koltuğu (T10)
                    goals[11] = { target: 1, current: 0 };
                    goals[10] = { target: 2, current: 0 };
                } else if (phase === 4) {
                    // Seviye 35 Boss: 1 Kozmik Kedi (T12) + 2 Kraliyet Koltuğu (T10)
                    goals[12] = { target: 1, current: 0 };
                    goals[10] = { target: 2, current: 0 };
                } else {
                    // Seviye 42+ Efsanevi Boss: 1 Kozmik Kedi (T12) + 2 Prenses Kedi (T11)
                    goals[12] = { target: 1, current: 0 };
                    goals[11] = { target: 2, current: 0 };
                }
            }

            return goals;
        }

        function renderGoals() {
            const container = document.getElementById('targets-container');
            container.innerHTML = '';
            for (const [tierStr, data] of Object.entries(levelGoals)) {
                const tier = parseInt(tierStr);
                const item = CAT_ITEMS[tier - 1];
                const isDone = data.current >= data.target;

                const slot = document.createElement('div');
                slot.className = 'quest-item-slot';
                slot.innerHTML = `
                    <img class="quest-item-img" src="${item.sprite}" alt="${item.name}">
                    <span class="quest-item-count ${isDone ? 'done' : ''}" id="goal-count-${tier}">
                        ${Math.min(data.current, data.target)}/${data.target}
                    </span>
                `;
                container.appendChild(slot);
            }
        }

        function checkAllGoalsCompleted() {
            if (!levelGoals || Object.keys(levelGoals).length === 0) return false;
            for (const key in levelGoals) {
                if ((levelGoals[key].current || 0) < levelGoals[key].target) {
                    return false;
                }
            }
            return true;
        }

        let pendingVictoryAfterAd = false;

        function checkLevelGoals(mergedTier) {
            if (levelGoals[mergedTier]) {
                levelGoals[mergedTier].current += 1;
                renderGoals();
            }

            if (checkAllGoalsCompleted() && !isLevelCompleted && !isVictoryTriggered) {
                isLevelCompleted = true;
                isVictoryTriggered = true;
                if (typeof AdManager !== 'undefined' && AdManager.isAdShowing) {
                    pendingVictoryAfterAd = true;
                } else {
                    if (victoryTimer) clearTimeout(victoryTimer);
                    victoryTimer = setTimeout(triggerVictory, 350);
                }
            }
        }

        // KESİNTİSİZ ZAFER GÜVENCESİ (GÖREV BİTTİYSE MODAL ASLA KAYBOLMAZ / TAKILI KALMAZ)
        setInterval(() => {
            if (!suikaActive || document.hidden || isGameOver || !world) return;
            if (isVictoryTriggered || isLevelCompleted || isVictoryModalOpen) return;
            if (checkAllGoalsCompleted()) {
                isLevelCompleted = true;
                isVictoryTriggered = true;
                if (typeof AdManager !== 'undefined' && AdManager.isAdShowing) return;
                triggerVictory();
            }
        }, 400);

        /* ==========================================
            AKILLI YILDIZ HESAPLAMA SİSTEMİ
           ==========================================
           
           Suika birleşme fiziğine göre doğru hesaplama:
           
           Bir Tier N obje üretmek için minimum atış sayısı:
             minDropsForTier(N) = 2^(N - dropTier)
           
           Örnek (maxDropTier=3): 
             Tier 3 = 1 atış (direkt düşer)
             Tier 4 = 2 atış (2 x Tier3 birleşir)
             Tier 5 = 4 atış
             Tier 6 = 8 atış
             Tier 7 = 16 atış
             Tier 8 = 32 atış
           
           Toplam hedef atışı = Σ (hedef_count × minDropsForTier)
           
           Toleranslar:
             3 yıldız: ideal × 1.3 (Mükemmel oyun, %30 tolerans)
             2 yıldız: ideal × 2.0 (Ortalama oyun, %100 tolerans)
             1 yıldız: Geri kalan (Uğraştı ama bitti)
           ========================================== */
        function calculateLevelStars(lvl, dropsUsed) {
            const { difficulty } = getLevelMeta(lvl);
            
            // Her bir hedef için gereken ortalama makul atış maliyeti (suika birleştirme dinamiğine göre)
            let estimatedRequiredDrops = 0;
            for (const k in levelGoals) {
                const tier = parseInt(k);
                const count = levelGoals[k].target;
                
                let costPerUnit = 3;
                if (difficulty === 'easy') {
                    // Kolayda küçük objeler (T2 Zil, T3 Süt, T4 Balık, T5 Fare)
                    // T2 Zil: 2 Yumak birleşir (drop havuzunda Yumak %40-50 olduğundan ortalama ~3.5 atış)
                    // T3 Süt: 2 Zil birleşir (~4.0 atış)
                    // T4 Balık: 2 Süt birleşir (~4.5 atış)
                    // T5 Fare: 2 Balık birleşir (~5.5 atış)
                    if (tier === 2) costPerUnit = 3.5;
                    else if (tier === 3) costPerUnit = 4.0;
                    else if (tier === 4) costPerUnit = 4.5;
                    else if (tier === 5) costPerUnit = 5.5;
                    else costPerUnit = 7.0;
                } else if (difficulty === 'medium') {
                    // Ortada T4, T5, T6, T7
                    if (tier <= 4) costPerUnit = 3.5;
                    else if (tier === 5) costPerUnit = 4.5;
                    else if (tier === 6) costPerUnit = 6.0;
                    else if (tier === 7) costPerUnit = 8.5;
                    else costPerUnit = 12.0;
                } else if (difficulty === 'hard') {
                    // Zorda drop havuzunda T3..T7 doğrudan düştüğü için birleştirme hızlıdır
                    if (tier <= 5) costPerUnit = 3.0;
                    else if (tier === 6) costPerUnit = 4.5;
                    else if (tier === 7) costPerUnit = 6.5;
                    else if (tier === 8) costPerUnit = 10.0;
                    else if (tier === 9) costPerUnit = 16.0;
                    else costPerUnit = 24.0;
                } else {
                    // Boss
                    if (tier <= 6) costPerUnit = 4.0;
                    else if (tier === 7) costPerUnit = 6.0;
                    else if (tier === 8) costPerUnit = 9.0;
                    else if (tier === 9) costPerUnit = 15.0;
                    else if (tier === 10) costPerUnit = 24.0;
                    else if (tier === 11) costPerUnit = 36.0;
                    else costPerUnit = 48.0;
                }
                
                estimatedRequiredDrops += costPerUnit * count;
            }

            // Alt sınır: en az 6 atış
            estimatedRequiredDrops = Math.max(6, estimatedRequiredDrops);

            // Eşik değerler (Toleranslı ve adil)
            // 3 Yıldız: Tahmini maliyetin 1.4 katına kadar (İyi bir oyuncu rahatça 3 yıldız alabilir)
            // 2 Yıldız: Tahmini maliyetin 2.2 katına kadar
            // 1 Yıldız: Tamamladı
            const star3Threshold = Math.ceil(estimatedRequiredDrops * 1.4);
            const star2Threshold = Math.ceil(estimatedRequiredDrops * 2.2);

            if (dropsUsed <= star3Threshold) {
                return 3;
            } else if (dropsUsed <= star2Threshold) {
                return 2;
            } else {
                return 1;
            }
        }

        function triggerVictory() {
            if (isVictoryModalOpen) return;
            isVictoryModalOpen = true;
            isVictoryTriggered = true;
            isLevelCompleted = true;

            if (victoryTimer) { clearTimeout(victoryTimer); victoryTimer = null; }
            if (modalOpenTimer) { clearTimeout(modalOpenTimer); modalOpenTimer = null; }

            playSound('win');
            clearActiveBoardState(); // Zafer kazanıldığında tahta kaydı temizlenir
            
            // Yıldız Hesaplama (Ters mantık: Az hamle = 3 Yıldız)
            const earnedStars = calculateLevelStars(currentLevel, dropsUsedInLevel);
            levelStars[currentLevel] = Math.max(levelStars[currentLevel] || 0, earnedStars);

            // SADECE HER 5 SEVİYEDE BİR (5, 10, 15...) 3 JOKERDEN BİRİ RANDOM VERİLİR
            let rewardImg = visual('suika_game/ui_assets/btn_shop.png');
            let rewardQtyText = `+${100 * currentLevel}`;

            if (currentLevel % 5 === 0) {
                const jokerTypes = ['hammer', 'shake', 'swap'];
                const randomJoker = jokerTypes[Math.floor(Math.random() * jokerTypes.length)];
                jokerCounts[randomJoker] += 1;
                
                if (randomJoker === 'hammer') {
                    rewardImg = visual('suika_game/ui_assets/joker_btn_hammer.png');
                } else if (randomJoker === 'shake') {
                    rewardImg = visual('suika_game/ui_assets/joker_btn_tornado.png');
                } else {
                    rewardImg = visual('suika_game/ui_assets/joker_btn_swap.png');
                }
                rewardQtyText = '+1';
            }

            maxUnlockedLevel = Math.max(maxUnlockedLevel, currentLevel + 1);
            saveUserProgress();
            updateJokerBadges();

            // Kesin Yıldız Arka Planı (1, 2 veya 3 yıldız görseli)
            const winCard = document.getElementById('modalCardWin');
            winCard.style.backgroundImage = `url(visual('suika_game/ui_assets/modal_win_${earnedStars}star.png'))`;

            // Seviyede toplanan Suika puanı
            const suikaPoints = currentScore > 0 ? currentScore : (100 * currentLevel);
            // 0.01 Katsayısı: Suika puanının yüzde 1'i (100'de 1'i) PatiLife kedi cüzdanına aktarılır
            const catCoins = Math.max(1, Math.floor(suikaPoints * 0.01));

            // Sol Kutu: Seviye Puanı / Altını
            document.getElementById('lblWinScore').innerText = `+${suikaPoints}`;

            // Sağ Kutu: Ana Oyuna Aktarılan Altın (0.01 katsayısı - 100'de 1)
            const titleRight = document.getElementById('lblWinRewardTitle');
            if (titleRight) titleRight.innerText = 'AKTARILAN';
            document.getElementById('lblWinRewardQty').innerText = `+${catCoins}`;
            document.getElementById('lblWinRewardImg').src = visual('suika_game/ui_assets/btn_shop.png');

            //  HAVAİ FİŞEK VE YILDIZ KUTLAMA ŞÖLENİ
            launchVictoryFireworks();

            //  Zafer Ekranında Tamamlanan Görevleri Göster (Örn: Tırmalama 1/1, Taht 2/2)
            const goalsContainer = document.getElementById('winCompletedGoals');
            if (goalsContainer) {
                goalsContainer.innerHTML = '';
                for (const [tierStr, data] of Object.entries(levelGoals)) {
                    const tier = parseInt(tierStr);
                    const item = CAT_ITEMS[tier - 1];
                    if (item) {
                        const goalItem = document.createElement('div');
                        goalItem.className = 'win-goal-item';
                        goalItem.innerHTML = `
                            <img src="${item.sprite}" class="win-goal-img" alt="${item.name}">
                            <span class="win-goal-text">${data.target}/${data.target}</span>
                            <div class="win-goal-check"></div>
                        `;
                        goalsContainer.appendChild(goalItem);
                    }
                }
            }

            // Ortak Cüzdan: Suika zafer altınının tam 100'de 1'i cüzdana aktarılır
            if (typeof UnifiedBridge !== 'undefined' && typeof UnifiedBridge.addCoinsFromSuika === 'function') {
                UnifiedBridge.addCoinsFromSuika(suikaPoints);
            }

            // Kullanıcı seviye geçişini hissetsin: Modal 1.2 saniye sonra tek bir kez açılır!
            modalOpenTimer = setTimeout(() => {
                const modal = document.getElementById('modalWin');
                if (modal) modal.classList.add('active');
            }, 1200);
        }

        // HAVAİ FİŞEK & ZAFER PATLAMA MOTORU (PÜRÜZSÜZ CANVAS PARÇACIKLARI)
        function launchVictoryFireworks() {
            const colors = ['#FF6B8B', '#FFB834', '#2ECC71', '#4FACFE', '#A29BFE', '#F59E0B', '#FFFFFF'];
            const container = document.getElementById('game-container');
            const w = container ? container.clientWidth : window.innerWidth;
            const h = container ? container.clientHeight : window.innerHeight;

            for (let burst = 0; burst < 6; burst++) {
                setTimeout(() => {
                    const originX = w * (0.15 + Math.random() * 0.7);
                    const originY = h * (0.20 + Math.random() * 0.35);

                    for (let i = 0; i < 32; i++) {
                        const angle = (Math.PI * 2 * i) / 32 + (Math.random() - 0.5) * 0.3;
                        const speed = 2.5 + Math.random() * 6.5;
                        const color = colors[Math.floor(Math.random() * colors.length)];

                        particles.push({
                            x: originX,
                            y: originY,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed - 1.8,
                            size: 3.5 + Math.random() * 4.5,
                            color: color,
                            life: 1.0,
                            decay: 0.012 + Math.random() * 0.01
                        });
                    }

                    // Zafer patlama sesi
                    playSound('merge', (burst % 4) + 1);
                }, burst * 320);
            }
        }

        function openRoadmapFromWin() {
            const winModal = document.getElementById('modalWin');
            if (winModal) winModal.classList.remove('active');

            const completedLvl = currentLevel;
            const onReady = () => {
                openRoadmapModal();
            };

            if (typeof AdManager !== 'undefined' && typeof AdManager.trackSuikaLevelComplete === 'function') {
                AdManager.trackSuikaLevelComplete(completedLvl, onReady);
            } else {
                onReady();
            }
        }

        function goToNextLevel() {
            if (isTransitioningLevel) return;
            isTransitioningLevel = true;

            if (victoryTimer) { clearTimeout(victoryTimer); victoryTimer = null; }
            if (modalOpenTimer) { clearTimeout(modalOpenTimer); modalOpenTimer = null; }

            const winModal = document.getElementById('modalWin');
            if (winModal) winModal.classList.remove('active');

            const completedLvl = currentLevel;
            currentLevel += 1;
            clearActiveBoardState();
            saveUserProgress();

            const onLevelReady = () => {
                startLevel(currentLevel, true);
                setTimeout(() => { isTransitioningLevel = false; }, 600);
            };

            // Seviye geçiş reklamı: Her 2 seviyede bir veya boss sonrası akıllı kısa geçiş reklamı
            if (typeof AdManager !== 'undefined' && typeof AdManager.trackSuikaLevelComplete === 'function') {
                AdManager.trackSuikaLevelComplete(completedLvl, onLevelReady);
            } else {
                onLevelReady();
            }
        }

        function startLevel(lvl, forceReset = false) {
            currentLevel = lvl;
            isLevelCompleted = false;
            isVictoryTriggered = false;
            isVictoryModalOpen = false;
            isGameOver = false;
            isDropping = false;
            comboCount = 0;
            dangerAccumulator = 0;
            cancelHammerMode();

            if (victoryTimer) { clearTimeout(victoryTimer); victoryTimer = null; }
            if (modalOpenTimer) { clearTimeout(modalOpenTimer); modalOpenTimer = null; }

            document.getElementById('lblCurrentLevel').innerText = currentLevel;
            updateLevelDifficultyBadge(currentLevel);
            document.getElementById('danger-warning').style.display = 'none';

            // Fizik dünyasındaki duvarlar ve zemin dışındaki tüm oyun ve engel objelerini temizle
            if (world) {
                const bodies = Matter.Composite.allBodies(world);
                bodies.forEach(b => {
                    if (b !== ground && b !== leftWall && b !== rightWall) {
                        Matter.World.remove(world, b);
                    }
                });
            }

            let restored = false;
            if (!forceReset) {
                try {
                    const raw = localStorage.getItem('cat_suika_active_board_v1');
                    if (raw) {
                        const data = JSON.parse(raw);
                        if (data && data.level === lvl && Array.isArray(data.bodies) && data.bodies.length > 0) {
                            currentScore = data.score || 0;
                            dropsUsedInLevel = data.dropsUsed || 0;
                            levelGoals = data.levelGoals || generateLevelConfig(currentLevel);
                            currentDropLevel = data.currentDropLevel || getRandomDropLevel();
                            nextDropLevel = data.nextDropLevel || getRandomDropLevel();

                            for (const itemData of data.bodies) {
                                const item = CAT_ITEMS[itemData.tier - 1];
                                if (!item) continue;
                                if (itemData.isFrozen) {
                                    const body = Matter.Bodies.circle(itemData.x, itemData.y, item.radius * 0.94, {
                                        isStatic: true,
                                        restitution: 0.1,
                                        friction: 0.8,
                                        angle: itemData.angle || 0,
                                        label: `frozen_cat_${itemData.tier}`,
                                        customData: {
                                            tier: itemData.tier,
                                            isFrozen: true,
                                            sprite: item.frozenSprite,
                                            normalSprite: item.sprite
                                        }
                                    });
                                    Matter.World.add(world, body);
                                } else {
                                    const pRatio = item.physicsRatio || 0.82;
                                    const body = Matter.Bodies.circle(itemData.x, itemData.y, item.radius * pRatio, {
                                        isStatic: itemData.isStatic || false,
                                        restitution: 0.0,
                                        friction: 0.08,
                                        frictionAir: 0.002,
                                        density: 0.001,
                                        angle: itemData.angle || 0,
                                        label: `cat_${itemData.tier}`,
                                        customData: {
                                            tier: itemData.tier,
                                            isFrozen: false,
                                            spawnTime: itemData.spawnTime || (Date.now() - 5000)
                                        }
                                    });
                                    if (itemData.vx !== undefined && itemData.vy !== undefined) {
                                        Matter.Body.setVelocity(body, { x: itemData.vx, y: itemData.vy });
                                    }
                                    if (itemData.angularVelocity !== undefined) {
                                        Matter.Body.setAngularVelocity(body, itemData.angularVelocity);
                                    }
                                    Matter.World.add(world, body);
                                }
                            }
                            restored = true;
                        }
                    }
                } catch(e) {
                    console.error('Kayıtlı tahta yüklenemedi:', e);
                }
            }

            if (!restored) {
                currentScore = 0;
                dropsUsedInLevel = 0;
                levelGoals = generateLevelConfig(currentLevel);
                spawnObstaclesForLevel(currentLevel);
                currentDropLevel = getRandomDropLevel();
                nextDropLevel = getRandomDropLevel();
                clearActiveBoardState();
            }

            document.getElementById('lblCurrentScore').innerText = currentScore;
            document.getElementById('lblDropsUsed').innerText = dropsUsedInLevel;
            renderGoals();
            updateSpawnerItemUI();
            saveUserProgress();
            if (!restored) {
                saveActiveBoardState();
            }
        }

        function updateLevelDifficultyBadge(lvl) {
            const { difficulty } = getLevelMeta(lvl);
            const tag = document.getElementById('lblLevelDiff');
            if (!tag) return;

            if (difficulty === 'easy') {
                tag.className = 'hud-diff-pill diff-easy';
                tag.innerText = 'KOLAY';
            } else if (difficulty === 'medium') {
                tag.className = 'hud-diff-pill diff-medium';
                tag.innerText = 'ORTA';
            } else if (difficulty === 'hard') {
                tag.className = 'hud-diff-pill diff-hard';
                tag.innerText = 'ZOR';
            } else {
                tag.className = 'hud-diff-pill diff-boss';
                tag.innerText = 'BOSS';
            }
        }

        /* ==========================================
            SEVİYE BAZLI AKTİF DROP & ENGEL HAVUZU
           (Kural: Buzlu engeller SADECE yukarıdan düşebilen nesnelerden oluşur;
            böylece tahtada birleştirilemeyen 'çöp' nesne ASLA kalmaz!)
           ========================================== */
        function getLevelDropPool(lvl) {
            const { difficulty, phase } = getLevelMeta(lvl);

            //  BOSS SEVİYELERİ: T1 ve T2 ASLA YOK! Sadece T3..T8
            if (difficulty === 'boss') {
                if (phase >= 3) {
                    return {
                        tiers: [3, 4, 5, 6, 7, 8],
                        weights: [0.20, 0.25, 0.25, 0.15, 0.10, 0.05]
                    };
                } else {
                    return {
                        tiers: [3, 4, 5, 6, 7],
                        weights: [0.30, 0.28, 0.22, 0.13, 0.07]
                    };
                }
            }

            //  ZOR SEVİYELER: T1 ve T2 ASLA YOK! Sadece T3..T7
            if (difficulty === 'hard') {
                return {
                    tiers: [3, 4, 5, 6, 7],
                    weights: [0.35, 0.30, 0.20, 0.10, 0.05]
                };
            }

            //  ORTA SEVİYELER: T1..T5
            if (difficulty === 'medium') {
                return {
                    tiers: [1, 2, 3, 4, 5],
                    weights: [0.28, 0.28, 0.24, 0.14, 0.06]
                };
            }

            //  KOLAY SEVİYELER: T1..T4/5
            if (phase >= 2) {
                return {
                    tiers: [1, 2, 3, 4, 5],
                    weights: [0.40, 0.30, 0.18, 0.08, 0.04]
                };
            } else {
                return {
                    tiers: [1, 2, 3, 4],
                    weights: [0.50, 0.30, 0.15, 0.05]
                };
            }
        }

        /* ==========================================
            DİNAMİK & GÜVENLİ DÜŞEN OBJE SEÇİMİ
           ========================================== */
        function getRandomDropLevel() {
            const pool = getLevelDropPool(currentLevel);
            const r = Math.random();
            let cumulative = 0;
            for (let i = 0; i < pool.tiers.length; i++) {
                cumulative += pool.weights[i];
                if (r < cumulative) {
                    return pool.tiers[i];
                }
            }
            return pool.tiers[pool.tiers.length - 1];
        }

        function updateSpawnerItemUI() {
            const curItem = CAT_ITEMS[currentDropLevel - 1];
            const nextItem = CAT_ITEMS[nextDropLevel - 1];

            const spawnerImg = document.getElementById('spawner-current-item');
            if (spawnerImg) {
                spawnerImg.src = curItem.sprite;
                // Objelerin boyutunu tier'a göre görsel olarak pati ucunda orantıla
                const previewSize = Math.max(28, Math.min(48, Math.round(curItem.radius * 1.5)));
                spawnerImg.style.width = `${previewSize}px`;
                spawnerImg.style.height = `${previewSize}px`;
            }

            const nextImg = document.getElementById('nextItemImg');
            if (nextImg) {
                nextImg.src = nextItem.sprite;
            }
        }

        /* ==========================================
            DİNAMİK BUZLU ENGEL SİSTEMİ
           (Kural: Buzlu engeller SADECE o seviyede düşebilen pool.tiers parçalarından üretilir!)
           ========================================== */
        function spawnObstaclesForLevel(lvl) {
            if (lvl <= 1) return; // Seviye 1: tertemiz öğrenme alanı

            const { difficulty, phase } = getLevelMeta(lvl);
            const pool = getLevelDropPool(lvl); // Sadece ve sadece o seviyede düşebilen tier havuzu!
            let numRows = 1;

            // Zorluk döngüsüne göre katman sayısı
            if (difficulty === 'easy') {
                numRows = Math.min(2, 1 + Math.floor(phase / 2));
            } else if (difficulty === 'medium') {
                numRows = Math.min(3, 1 + Math.floor(phase / 1.5));
            } else if (difficulty === 'hard') {
                numRows = Math.min(4, 2 + Math.floor(phase / 1.5));
            } else {
                // Boss: daha yoğun engeller
                numRows = Math.min(5, 2 + Math.floor(phase / 1.2));
            }

            const groundY = suikaContainerHeight - 96;
            const usableWidth = suikaContainerWidth - 80;

            for (let row = 0; row < numRows; row++) {
                const isEvenRow = (row % 2 === 0);
                const itemsInRow = isEvenRow ? 4 : 3;
                const spacing = usableWidth / (itemsInRow + 1);
                const rowY = groundY - (row * 38); // Katmanlar yukarı doğru dizilir

                for (let col = 1; col <= itemsInRow; col++) {
                    const x = 40 + col * spacing + (isEvenRow ? 0 : spacing * 0.1);
                    
                    //  BUZLU NESNE TIER'I: Kesinlikle ve sadece bu seviyede düşebilen pool.tiers içinden seçilir!
                    // Asla düşmeyen bir nesne buzun içine giremez, böylece çöp olarak kalamaz.
                    const tierIndex = (lvl + row + col) % pool.tiers.length;
                    const tier = pool.tiers[tierIndex];

                    const item = CAT_ITEMS[tier - 1];

                    const body = Matter.Bodies.circle(x, rowY, item.radius * 0.94, {
                        isStatic: true,
                        restitution: 0.1,
                        friction: 0.8,
                        label: `frozen_cat_${tier}`,
                        customData: {
                            tier: tier,
                            isFrozen: true,
                            sprite: item.frozenSprite,
                            normalSprite: item.sprite
                        }
                    });

                    Matter.World.add(world, body);
                }
            }
        }

        /* ==========================================
            MATTER.JS FİZİK MOTORU & CANVAS
           ========================================== */
        function initPhysicsEngine() {
            const container = document.getElementById('game-container');
            suikaContainerWidth = container.clientWidth || 400;
            suikaContainerHeight = container.clientHeight || 800;

            gameCanvas = document.getElementById('matter-canvas');
            gameCanvas.width = suikaContainerWidth;
            gameCanvas.height = suikaContainerHeight;
            ctx = gameCanvas.getContext('2d');

            engine = Matter.Engine.create({ 
                enableSleeping: false,
                positionIterations: 12,
                velocityIterations: 12
            });
            world = engine.world;
            world.gravity.y = 1.0;

            // Zemin ve Duvarlar (Kavanozun iç tabanına ve kenarlarına tam oturan, alt barla çakışmayan sızdırmaz gövdeler)
            const groundY = suikaContainerHeight - 96;
            
            // Ultra Kalın Zemin (120px kalınlık, üst sınırı tam groundY)
            ground = Matter.Bodies.rectangle(suikaContainerWidth / 2, groundY + 60, suikaContainerWidth * 2, 120, {
                isStatic: true, friction: 0.4, restitution: 0.0, label: 'ground'
            });

            // Ultra Kalın Sol Duvar (Sıfır Sürtünme - Objeler Asla Duvara Takılmaz / Yavaşlamaz)
            leftWall = Matter.Bodies.rectangle(16 - 30, suikaContainerHeight / 2, 60, suikaContainerHeight * 2, {
                isStatic: true, friction: 0.0, frictionStatic: 0.0, restitution: 0.0, label: 'wall_left'
            });

            // Ultra Kalın Sağ Duvar (Sıfır Sürtünme - Objeler Asla Duvara Takılmaz / Yavaşlamaz)
            rightWall = Matter.Bodies.rectangle((suikaContainerWidth - 16) + 30, suikaContainerHeight / 2, 60, suikaContainerHeight * 2, {
                isStatic: true, friction: 0.0, frictionStatic: 0.0, restitution: 0.0, label: 'wall_right'
            });

            Matter.World.add(world, [ground, leftWall, rightWall]);

            Matter.Events.on(engine, 'collisionStart', handleCollisions);

            //  Optimize Manyetik Çekim & Hızlı Temas Birleşmesi
            Matter.Events.on(engine, 'beforeUpdate', () => {
                const bodies = Matter.Composite.allBodies(world);
                const toMerge = [];
                const processed = new Set();
                const len = bodies.length;

                for (let i = 0; i < len; i++) {
                    const a = bodies[i];
                    if (!a.customData || a.customData.isFrozen || a.isStatic || processed.has(a)) continue;

                    //  Titreşim Önleyici Sert Dinlenme Kilidi (Resting Velocity Freeze)
                    const aSpeedSq = a.velocity.x * a.velocity.x + a.velocity.y * a.velocity.y;
                    if (aSpeedSq < 0.04 && Math.abs(a.angularVelocity) < 0.03) {
                        Matter.Body.setVelocity(a, { x: 0, y: 0 });
                        Matter.Body.setAngularVelocity(a, 0);
                    }

                    const aTier = a.customData.tier;
                    const aItem = CAT_ITEMS[aTier - 1];
                    const aEffRadius = aItem.radius * (aItem.physicsRatio || 0.82);

                    for (let j = i + 1; j < len; j++) {
                        const b = bodies[j];
                        if (!b.customData || b.customData.isFrozen || b.isStatic || processed.has(b)) continue;

                        if (aTier === b.customData.tier && aTier <= 12) {
                            const dx = b.position.x - a.position.x;
                            const dy = b.position.y - a.position.y;
                            const distSq = dx * dx + dy * dy;

                            const touchRadius = (aEffRadius + aEffRadius) * 1.05;
                            const touchThresholdSq = touchRadius * touchRadius;
                            const magnetRadius = (aEffRadius + aEffRadius) * 1.22;
                            const magnetThresholdSq = magnetRadius * magnetRadius;

                            // 1. Teğet veya değen objeleri anında birleştir
                            if (distSq <= touchThresholdSq) {
                                processed.add(a);
                                processed.add(b);
                                toMerge.push({ a, b, tier: aTier });
                                break;
                            }
                            // 2. Manyetik çekim: Sadece objelerden en az biri aktif hareket halindeyse uygula (Duran nesneleri presleyip titretmez)
                            else {
                                const bSpeedSq = b.velocity.x * b.velocity.x + b.velocity.y * b.velocity.y;
                                if (distSq < magnetThresholdSq && (aSpeedSq > 0.12 || bSpeedSq > 0.12)) {
                                    const dist = Math.sqrt(distSq);
                                    const forceMag = 0.00006 * Math.min(a.mass, b.mass);
                                    const fx = (dx / dist) * forceMag;
                                    const fy = (dy / dist) * forceMag;
                                    Matter.Body.applyForce(a, a.position, { x: fx, y: fy });
                                    Matter.Body.applyForce(b, b.position, { x: -fx, y: -fy });
                                }
                            }
                        }
                    }
                }

                for (let k = 0; k < toMerge.length; k++) {
                    const m = toMerge[k];
                    executeMerge(m.a, m.b, m.tier);
                }
            });

            //  Titreşimsiz Sabit 60 FPS Fizik Döngüsü (Fixed 16.66ms Timestep)
            physicsTick=function renderLoop(timestamp) {
                physicsRaf=null;if(!suikaActive||document.hidden)return;
                physicsClock.tick(Number.isFinite(timestamp)?timestamp:performance.now(),step=>Matter.Engine.update(engine,step));
                drawScene();
                physicsRaf=requestAnimationFrame(physicsTick);
            };physicsTick();
        }

        function drawScene() {
            ctx.clearRect(0, 0, suikaContainerWidth, suikaContainerHeight);

            const bodies = Matter.Composite.allBodies(world);
            bodies.forEach(body => {
                if (body.customData) {
                    const { position, angle, circleRadius, customData } = body;
                    const item = CAT_ITEMS[customData.tier - 1];
                    const spritePath = customData.isFrozen ? item.frozenSprite : item.sprite;
                    const img = texture(spritePath);

                    ctx.save();
                    ctx.translate(Math.round(position.x), Math.round(position.y));
                    ctx.rotate(Math.abs(angle) < 0.004 ? 0 : angle);

                    // Hedefleme Modu Parlaması
                    if (isHammerMode) {
                        ctx.beginPath();
                        ctx.arc(0, 0, item.radius + 4, 0, Math.PI * 2);
                        ctx.strokeStyle = '#FF5E7E';
                        ctx.lineWidth = 3;
                        ctx.setLineDash([4, 4]);
                        ctx.stroke();
                    }

                    if (img && img.complete && img.naturalWidth) {
                        const drawScale = item.scale || 2.22;
                        const drawSize = item.radius * drawScale;
                        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
                    } else {
                        ctx.beginPath();
                        ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
                        ctx.fillStyle = customData.isFrozen ? '#A0E8FF' : '#FFB834';
                        ctx.fill();
                    }

                    ctx.restore();
                }
            });
        }

        /* ==========================================
            BİRLEŞME & KOZMİK İMPARATOR PATLAMASI
           ========================================== */
        function executeMerge(bodyA, bodyB, tier) {
            if (!world) return;
            //  Merge Güvenliği: Body hâlâ world'de mi kontrol et
            try {
                if (!Matter.Composite.get(world, bodyA.id, 'body') ||
                    !Matter.Composite.get(world, bodyB.id, 'body')) return;
            } catch(e) { return; }

            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;

            //  Combo Sayacını İlerlet
            comboCount++;
            if (comboTimer) clearTimeout(comboTimer);
            comboTimer = setTimeout(() => {
                comboCount = 0;
                const cd = document.getElementById('combo-display');
                if (cd) cd.classList.remove('visible');
            }, COMBO_WINDOW_MS);

            // Combo göstergesini güncelle (x2'den itibaren göster, çift hanelerde fontu hafif küçült)
            if (comboCount >= 2) {
                const cd = document.getElementById('combo-display');
                if (cd) {
                    cd.style.fontSize = comboCount >= 10 ? '17px' : '20px';
                    cd.innerText = `x${comboCount} COMBO!`;
                    cd.classList.add('visible');
                }
            }

            //  Birleşme Parçacık Efekti
            spawnMergeParticles(midX, midY, tier);

            // Combo Çarpanı (x2 = 1.5x, x3 = 2x, x4+ = 2.5x)
            let comboMultiplier = 1;
            if (comboCount >= 4) comboMultiplier = 2.5;
            else if (comboCount >= 3) comboMultiplier = 2;
            else if (comboCount >= 2) comboMultiplier = 1.5;

            //  SON SEVİYE 2 KOZMİK İMPARATOR KEDİ (Tier 12) BİRLEŞİNCE: Ekrandan yok olurlar & Dev Kozmik Patlama!
            if (tier === 12) {
                Matter.World.remove(world, [bodyA, bodyB]);
                
                // Dev bonus puanı (combo çarpanı uygulanmış)
                currentScore += Math.round(5000 * comboMultiplier);
                document.getElementById('lblCurrentScore').innerText = currentScore;

                // Hedef sayacını Kozmik Kedi için ilerlet
                checkLevelGoals(12);

                // Özel Zafer / Çan Sesi
                playSound('win');

                // Güçlü şok dalgası: Etraftaki donuk buzları geniş alanda çözer
                unfreezeNearbyObstacles(midX, midY, 260);

                // Yakındaki tüm nesnelere merkezden dışarıya güçlü bir patlama kuvveti uygula
                const bodies = Matter.Composite.allBodies(world);
                bodies.forEach(b => {
                    if (!b.isStatic) {
                        const dx = b.position.x - midX;
                        const dy = b.position.y - midY;
                        const dist = Math.hypot(dx, dy);
                        if (dist > 0 && dist < 280) {
                            const force = 0.024 * b.mass * (1 - dist / 280);
                            Matter.Body.applyForce(b, b.position, {
                                x: (dx / dist) * force,
                                y: (dy / dist) * force - 0.015 * b.mass
                            });
                        }
                    }
                });

                // Hafif ekran sarsıntısı efekti
                const container = document.getElementById('game-container');
                container.classList.add('shake-intense');
                setTimeout(() => container.classList.remove('shake-intense'), 300);

                return;
            }

            // Normal birleşme (Tier 1..11 -> Tier 2..12)
            const nextTier = tier + 1;
            Matter.World.remove(world, [bodyA, bodyB]);
            const newBody = spawnCatBody(midX, midY, nextTier, false);
            Matter.Body.setVelocity(newBody, {
                x: (bodyA.velocity.x + bodyB.velocity.x) * 0.35,
                y: Math.min(-1.2, (bodyA.velocity.y + bodyB.velocity.y) * 0.35)
            });

            currentScore += Math.round(CAT_ITEMS[nextTier - 1].score * comboMultiplier);
            document.getElementById('lblCurrentScore').innerText = currentScore;

            playSound('merge', nextTier);
            checkLevelGoals(nextTier);
            
            // Yakındaki donuk buzları çöz (Kademeli genişleyen şok dalgası)
            unfreezeNearbyObstacles(midX, midY, 90 + nextTier * 12);

            // Tahta durumunu kaydet
            saveActiveBoardState();
        }

        function handleCollisions(event) {
            const pairs = event.pairs;
            const toRemove = new Set();

            pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                if (!bodyA.customData || !bodyB.customData) return;
                if (toRemove.has(bodyA) || toRemove.has(bodyB)) return;

                // 1. Aynı Tür İki Kedi Birleşmesi
                if (!bodyA.customData.isFrozen && !bodyB.customData.isFrozen) {
                    if (bodyA.customData.tier === bodyB.customData.tier && bodyA.customData.tier <= 12) {
                        toRemove.add(bodyA);
                        toRemove.add(bodyB);
                        executeMerge(bodyA, bodyB, bodyA.customData.tier);
                        return;
                    }
                }

                // 2. Normal Objenin Donuk Engele Çarpması (Direkt Çarpma ile Çözme)
                if ((bodyA.customData.isFrozen && !bodyB.customData.isFrozen) || (!bodyA.customData.isFrozen && bodyB.customData.isFrozen)) {
                    const frozenBody = bodyA.customData.isFrozen ? bodyA : bodyB;
                    const normalBody = bodyA.customData.isFrozen ? bodyB : bodyA;
                    const speed = Math.hypot(normalBody.velocity.x, normalBody.velocity.y);
                    
                    // Aynı tür temas ettiyse veya yeterli hızla çarptıysa buzu anında çöz!
                    if (frozenBody.customData.tier === normalBody.customData.tier || speed > 1.2) {
                        unfreezeNearbyObstacles(frozenBody.position.x, frozenBody.position.y, 80);
                    }
                }
            });
        }

        function unfreezeNearbyObstacles(x, y, radius) {
            const bodies = Matter.Composite.allBodies(world);
            let unfrozenAny = false;

            bodies.forEach(b => {
                if (b.customData && b.customData.isFrozen) {
                    const dist = Math.hypot(b.position.x - x, b.position.y - y);
                    if (dist <= radius) {
                        b.customData.isFrozen = false;
                        Matter.Body.setStatic(b, false);
                        
                        // Dinamik fiziğe geçiş
                        b.friction = 0.005;
                        b.frictionAir = 0.001;
                        b.restitution = 0.08;

                        // Şok dalgasıyla hafif yukarı ve yana fırlat
                        const angle = Math.atan2(b.position.y - y, b.position.x - x);
                        Matter.Body.setVelocity(b, {
                            x: Math.cos(angle) * 2 + (Math.random() - 0.5) * 2,
                            y: -2.8 - Math.random() * 2
                        });

                        unfrozenAny = true;
                    }
                }
            });

            if (unfrozenAny) {
                playSound('merge', 2);
                saveActiveBoardState();
            }
        }

        function spawnCatBody(x, y, tier, isFrozen = false) {
            const item = CAT_ITEMS[tier - 1];
            const pRatio = item.physicsRatio || 0.82;
            // Organik ve Sıkı Çarpışma Gövdesi (Sıfır Hava Boşluğu & Akıcı Serbest Düşüş)
            const body = Matter.Bodies.circle(x, y, item.radius * pRatio, {
                restitution: 0.0,
                friction: 0.05,
                frictionAir: 0.001,
                frictionStatic: 0.0,
                density: 0.001,
                label: `cat_${tier}`,
                customData: { tier, isFrozen, spawnTime: Date.now() }
            });
            Matter.World.add(world, body);
            return body;
        }

        /* ==========================================
            ATMA & GECİKMESİZ SIRADAKİ GEÇİŞİ
           ========================================== */
        function dropCurrentItem(dropX) {
            if (typeof checkAllGoalsCompleted === 'function' && checkAllGoalsCompleted()) {
                triggerVictory();
                return;
            }
            if (isDropping || isLevelCompleted || isGameOver || isAnyModalOpen() || isHammerMode) return;

            const currItem = CAT_ITEMS[currentDropLevel - 1];
            const effR = currItem ? (currItem.radius * (currItem.physicsRatio || 0.9)) : 25;
            // Kenara yakın atışlarda duvara yapışıp yavaşlamayı önleyen serbest sınır
            const minX = 18 + effR;
            const maxX = (suikaContainerWidth - 18) - effR;
            const clampX = Math.max(minX, Math.min(maxX, dropX));

            isDropping = true;
            dropsUsedInLevel++;

            // HUD Atış Sayacını Güncelle
            document.getElementById('lblDropsUsed').innerText = dropsUsedInLevel;

            // Sahneye Bırak - Spawner pati pozisyonuna tam senkronize Y koordinatı
            let dropY = 160;
            const spawnerEl = document.getElementById('spawner-current-item');
            if (spawnerEl) {
                const rect = spawnerEl.getBoundingClientRect();
                const containerEl = document.getElementById('game-container');
                const cRect = containerEl ? containerEl.getBoundingClientRect() : { top: 0 };
                const calcY = Math.round((rect.top + rect.height / 2) - cRect.top);
                if (calcY > 50) dropY = calcY;
            }
            spawnCatBody(clampX, dropY, currentDropLevel, false);
            playSound('drop');

            // GECİKMESİZ: Sıradaki hemen patiye gelir, yeni sıradaki seçilir
            currentDropLevel = nextDropLevel;
            nextDropLevel = getRandomDropLevel();
            updateSpawnerItemUI();

            saveActiveBoardState();

            setTimeout(() => {
                isDropping = false;
            }, 300);
        }

        /* ==========================================
            CLOUDMANAGER (GAME CENTER & ICLOUD KVS BULUT KAYIT)
           ========================================== */
        const CloudManager=window.CloudManager,AdManager=window.AdManager;
        window.PatiLifePatileServices={get engine(){return engine;},pauseForAd:()=>window.SuikaEngine?.pause(),resumeAfterAd:()=>{if(!document.hidden&&document.getElementById('screen-suika')?.classList.contains('active'))window.SuikaEngine?.resume();},playSound,get currentLevel(){return currentLevel;},get levelStars(){return levelStars;},get maxUnlockedLevel(){return maxUnlockedLevel;},set maxUnlockedLevel(v){maxUnlockedLevel=v;},startLevel,clearActiveBoardState,get jokerCounts(){return jokerCounts;},updateJokerBadges,saveUserProgress,suikaCloseModals,get pendingVictoryAfterAd(){return pendingVictoryAfterAd;},set pendingVictoryAfterAd(v){pendingVictoryAfterAd=v;},checkAllGoalsCompleted,get isLevelCompleted(){return isLevelCompleted;},set isLevelCompleted(v){isLevelCompleted=v;},triggerVictory};


        /* ==========================================
            JOKER SİSTEMİ & ONAY & HEDEFLEME
           ========================================== */
        let pendingJokerType = null;

        function requestJoker(type) {
            if (isLevelCompleted || isAnyModalOpen()) return;
            
            //  Joker 0 adet ise: Reklam izleme modalını aç!
            if (jokerCounts[type] <= 0) {
                AdManager.promptJokerAd(type);
                return;
            }

            pendingJokerType = type;

            const img = document.getElementById('jokerConfirmImg');
            const title = document.getElementById('jokerConfirmTitle');
            const desc = document.getElementById('jokerConfirmDesc');

            if (type === 'hammer') {
                img.src = visual('suika_game/ui_assets/joker_btn_hammer.png');
                title.innerText = 'ÇEKİÇ JOKERİ';
                desc.innerText = 'Seçtiğin herhangi bir nesneye dokunarak onu sahneden tamamen kaldırır. Kullanılsın mı?';
            } else if (type === 'shake') {
                img.src = visual('suika_game/ui_assets/joker_btn_tornado.png');
                title.innerText = 'KASIRGA JOKERİ';
                desc.innerText = 'Kutudaki tüm nesneleri nazikçe sallar ve birleşmeleri hızlandırır. Kullanılsın mı?';
            } else if (type === 'swap') {
                img.src = visual('suika_game/ui_assets/joker_btn_swap.png');
                title.innerText = 'SÜPÜRGE & KURTARMA JOKERİ';
                desc.innerText = 'Kavanozun en alt sırasındaki nesneleri silerek yukarıdaki tüm objelerin aşağı inmesini ve alan açılmasını sağlar. Kullanılsın mı?';
            }

            document.getElementById('modalJokerConfirm').classList.add('active');
        }

        function closeJokerConfirm() {
            pendingJokerType = null;
            document.getElementById('modalJokerConfirm').classList.remove('active');
        }

        function executePendingJoker() {
            const type = pendingJokerType;
            closeJokerConfirm();
            if (!type) return;

            if (type === 'hammer') {
                toggleHammerMode();
            } else if (type === 'shake') {
                triggerShakeJoker();
            } else if (type === 'swap') {
                triggerSwapJoker();
            }
        }

        function toggleHammerMode() {
            if (jokerCounts.hammer <= 0) return;
            isHammerMode = !isHammerMode;
            document.getElementById('joker-target-hint').style.display = isHammerMode ? 'block' : 'none';
            document.getElementById('btnJokerHammer').classList.toggle('active-mode', isHammerMode);
        }

        function cancelHammerMode() {
            isHammerMode = false;
            document.getElementById('joker-target-hint').style.display = 'none';
            document.getElementById('btnJokerHammer').classList.remove('active-mode');
        }

        function createExplosionParticles(x, y, color = '#FF5E7E', count = 18) {
            if (typeof particles === 'undefined') return;
            if (particles.length > 60) {
                particles.splice(0, particles.length - 30);
            }
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
                const speed = 2.0 + Math.random() * 4.0;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1.0,
                    size: 3.5 + Math.random() * 3.5,
                    color: color,
                    life: 1,
                    decay: 0.025 + Math.random() * 0.02
                });
            }
            for (let i = 0; i < 6; i++) {
                particles.push({
                    x: x + (Math.random() - 0.5) * 24,
                    y: y + (Math.random() - 0.5) * 24,
                    vx: (Math.random() - 0.5) * 5,
                    vy: -2 - Math.random() * 4,
                    size: 2 + Math.random() * 2.5,
                    color: '#FFFDF0',
                    life: 1,
                    decay: 0.03
                });
            }
        }

        function handleHammerClick(x, y) {
            const bodies = Matter.Composite.allBodies(world);
            let hitBody = null;

            for (let i = bodies.length - 1; i >= 0; i--) {
                const b = bodies[i];
                if (b.customData && !b.isStatic) {
                    const dist = Math.hypot(b.position.x - x, b.position.y - y);
                    if (dist <= CAT_ITEMS[b.customData.tier - 1].radius + 15) {
                        hitBody = b;
                        break;
                    }
                }
            }

            if (hitBody) {
                createExplosionParticles(hitBody.position.x, hitBody.position.y, '#FF5E7E', 18);
                Matter.World.remove(world, hitBody);
                playSound('hammer');
                jokerCounts.hammer--;
                updateJokerBadges();
                saveUserProgress();
                cancelHammerMode();
                saveActiveBoardState();
            }
        }

        function triggerShakeJoker() {
            if (jokerCounts.shake <= 0 || isLevelCompleted) return;
            jokerCounts.shake--;
            updateJokerBadges();
            saveUserProgress();

            playSound('drop');
            const container = document.getElementById('game-container');
            container.classList.add('shake-intense');
            setTimeout(() => container.classList.remove('shake-intense'), 600);

            //  ÇAMAŞIR MAKİNESİ GİRDAP DÖNGÜSÜ (Yumuşak & Dengeli Girdap)
            // Objeleri yukarı fırlatmadan, yerinde nazikçe yarım tur çeviren tatlı çalkalama
            const centerX = suikaContainerWidth / 2;
            const centerY = (suikaContainerHeight - 68) * 0.65;
            const swirlDirection = Math.random() > 0.5 ? 1 : -1;

            let pulses = 0;
            const maxPulses = 4;
            const swirlInterval = setInterval(() => {
                pulses++;
                const bodies = Matter.Composite.allBodies(world);
                bodies.forEach(b => {
                    if (!b.isStatic && b.customData && b.customData.tier) {
                        const dx = b.position.x - centerX;
                        const dy = b.position.y - centerY;
                        const dist = Math.hypot(dx, dy) || 1;

                        // Teğetsel çembersel kuvvet (Nazik çamaşır makinesi dönüşü)
                        const tanX = (-dy / dist) * swirlDirection;
                        const tanY = (dx / dist) * swirlDirection;

                        // Çok hafif havalanma + yumuşak çembersel itiş (fırlama yapmaz)
                        const liftY = -0.003 * b.mass;
                        const forceMag = 0.009 * b.mass;

                        Matter.Body.applyForce(b, b.position, {
                            x: tanX * forceMag,
                            y: (tanY * forceMag * 0.6) + liftY
                        });

                        // Nazik spin / yarım tur dönüş
                        Matter.Body.setAngularVelocity(b, swirlDirection * (0.05 + Math.random() * 0.05));
                    }
                });

                // Parçacık kasırgası
                if (typeof createExplosionParticles === 'function' && pulses <= 1) {
                    createExplosionParticles(centerX, centerY, '#60A5FA', 10);
                }

                if (pulses >= maxPulses) {
                    clearInterval(swirlInterval);
                    saveActiveBoardState();
                }
            }, 65);

            // Yakındaki donuk buzları da çöz
            unfreezeNearbyObstacles(centerX, centerY, 200);
        }

        /* ==========================================
            ALT SIRA TEMİZLEME & İKİNCİ ŞANS KURTARMA MEKANİĞİ
           ========================================== */
        function clearBottomRow(countToClear = 4) {
            if (!world) return 0;
            const bodies = Matter.Composite.allBodies(world);
            const catBodies = bodies.filter(b => b.customData && b.customData.tier);
            if (catBodies.length === 0) return 0;

            // En alttaki (en büyük Y) nesneleri en baştan sırala
            catBodies.sort((a, b) => b.position.y - a.position.y);
            const targetBodies = catBodies.slice(0, countToClear);

            targetBodies.forEach(b => {
                spawnMergeParticles(b.position.x, b.position.y, b.customData.tier);
                Matter.World.remove(world, b);
            });

            // Ekran sarsıntısı ve temizleme sesi
            const container = document.getElementById('game-container');
            container.classList.add('shake-intense');
            setTimeout(() => container.classList.remove('shake-intense'), 400);
            playSound('hammer');

            // Kalan nesnelerin serbestçe aşağı dökülmesi için hafif yerçekimi kuvveti
            const remaining = Matter.Composite.allBodies(world);
            remaining.forEach(b => {
                if (!b.isStatic) {
                    Matter.Body.applyForce(b, b.position, {
                        x: (Math.random() - 0.5) * 0.01 * b.mass,
                        y: 0.015 * b.mass
                    });
                }
            });

            // Buzları da çöz
            unfreezeNearbyObstacles(suikaContainerWidth / 2, suikaContainerHeight - 120, 200);

            return targetBodies.length;
        }

        function triggerSwapJoker() {
            if (jokerCounts.swap <= 0 || isLevelCompleted) return;
            jokerCounts.swap--;
            updateJokerBadges();
            saveUserProgress();

            playSound('swap');
            clearBottomRow(4); // En alttaki 4 nesneyi temizle
            saveActiveBoardState();
        }

        function reviveWithJoker() {
            if (jokerCounts.swap <= 0) return;
            
            jokerCounts.swap--;
            updateJokerBadges();
            saveUserProgress();

            // Game Over durumunu iptal et
            isGameOver = false;
            dangerAccumulator = 0;
            document.getElementById('danger-warning').style.display = 'none';
            document.getElementById('modalGameOver').classList.remove('active');

            // En alttaki 5-6 nesneyi patlatarak kavanozu kurtar
            clearBottomRow(5);
            playSound('win');

            saveActiveBoardState();
        }

        /* ==========================================
            HARİTA & AYARLAR MODALLARI
           ========================================== */
        function openRoadmapModal() {
            const grid = document.getElementById('map-levels-grid');
            grid.innerHTML = '';

            // Oyuncunun ilerlemesine göre dinamik toplam seviye sayısı (En az 50 seviye)
            const totalLevelsToDisplay = Math.max(50, maxUnlockedLevel + 8);
            let currentNode = null;

            for (let i = 1; i <= totalLevelsToDisplay; i++) {
                const isUnlocked = i <= maxUnlockedLevel;
                const isCurrent = i === currentLevel;
                const stars = levelStars[i];
                const isSkipped = (stars === -1);

                const node = document.createElement('div');
                node.className = `map-node-btn ${isUnlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''} ${isSkipped ? 'skipped' : ''}`;
                
                let starDisplay = '';
                if (isSkipped) {
                    starDisplay = 'GEÇİLDİ';
                } else if (stars === 3) starDisplay = '';
                else if (stars === 2) starDisplay = '';
                else if (stars === 1) starDisplay = '';

                node.innerHTML = `
                    <span class="map-node-num">${i}</span>
                    <span class="map-node-stars">${starDisplay}</span>
                `;

                if (isCurrent) {
                    currentNode = node;
                }

                if (isUnlocked) {
                    node.onclick = () => {
                        closeModals();
                        if (i !== currentLevel) {
                            clearActiveBoardState();
                            startLevel(i, true);
                        } else {
                            startLevel(i, false);
                        }
                    };
                }

                grid.appendChild(node);
            }

            document.getElementById('modalRoadmap').classList.add('active');

            // En son kaçıncı seviyedeyse o sayının sırasına otomatik odaklan / scroll yap
            setTimeout(() => {
                if (currentNode) {
                    currentNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 80);
        }

        /* ==========================================
            SEVİYEYİ YENİDEN BAŞLATMA (RESET)
           ========================================== */
        function requestRestartLevel() {
            if (isLevelCompleted || isGameOver || isAnyModalOpen()) return;
            document.getElementById('modalRestartConfirm').classList.add('active');
        }

        function closeRestartConfirm() {
            document.getElementById('modalRestartConfirm').classList.remove('active');
        }

        function confirmRestartLevel() {
            closeRestartConfirm();
            clearActiveBoardState();
            startLevel(currentLevel, true);
        }

        function suikaOpenSettingsModal() {
            updateSoundToggleUI();
            document.getElementById('modalSettings').classList.add('active');
        }

        function suikaCloseModals() {
            document.querySelectorAll('.game-modal').forEach(m => m.classList.remove('active'));
        }

        function isAnyModalOpen() {
            return !!document.querySelector('.game-modal.active');
        }

        /* ==========================================
            TOUCH & MOUSE ETKİLEŞİMİ
           ========================================== */
        function initControls() {
            const container = document.getElementById('game-container');
            const spawnerWrapper = document.getElementById('spawner-cat-wrapper');
            const laserBeam = document.getElementById('drop-laser-beam');

            // İlk kullanıcı etkileşiminde sesi ve BGM'yi otomatik başlat
            window.addEventListener('pointerdown', () => {
                initAudio();
                if (soundSettings.bgm && !bgmTimer) {
                    startBGM();
                }
            }, { once: false });

            // Koordinat hesaplama: CSS scale/transform'a duyarsız, gerçek container piksel değeri
            function getPointerPos(e) {
                const rect = container.getBoundingClientRect();
                const clientX = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : 0);
                const clientY = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
                // CSS scale orantısını hesapla (rect gerçek render boyutu, container* fizik boyutu)
                const scaleX = suikaContainerWidth / rect.width;
                const scaleY = suikaContainerHeight / rect.height;
                return {
                    x: (clientX - rect.left) * scaleX,
                    y: (clientY - rect.top) * scaleY
                };
            }

            // Evrim rayı kaydırma etkileşimi (Touch, Mouse Drag ve Wheel)
            const evoRail = document.querySelector('.evolution-rail-container');
            let isRailDragging = false;
            let railStartX = 0;
            let railScrollLeft = 0;

            if (evoRail) {
                evoRail.addEventListener('pointerdown', (e) => {
                    if (e.button !== undefined && e.button !== 0) return;
                    isRailDragging = true;
                    railStartX = e.clientX;
                    railScrollLeft = evoRail.scrollLeft;
                    evoRail.style.cursor = 'grabbing';
                });

                window.addEventListener('pointermove', (e) => {
                    if (!isRailDragging) return;
                    const deltaX = e.clientX - railStartX;
                    evoRail.scrollLeft = railScrollLeft - (deltaX * 1.2);
                });

                const endRailDrag = () => {
                    if (isRailDragging) {
                        isRailDragging = false;
                        if (evoRail) evoRail.style.cursor = 'grab';
                    }
                };

                window.addEventListener('pointerup', endRailDrag);
                window.addEventListener('pointercancel', endRailDrag);

                // Dokunmatik kaydırmanın üst container tarafından engellenmesini önle
                evoRail.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                }, { passive: true });

                evoRail.addEventListener('touchmove', (e) => {
                    e.stopPropagation();
                }, { passive: true });

                // Fare tekerleğiyle yatay kaydırma
                evoRail.addEventListener('wheel', (e) => {
                    if (e.deltaY !== 0 || e.deltaX !== 0) {
                        e.preventDefault();
                        evoRail.scrollLeft += (e.deltaY !== 0 ? e.deltaY : e.deltaX);
                    }
                }, { passive: false });
            }

            // Scroll/zoom engelle (ray ve kaydırılabilir modal/ekran alanları hariç)
            container.addEventListener('touchmove', e => {
                if (e.target.closest('.evolution-rail-container, #map-levels-grid, .modal-card-map, .app-screen, .scrollable')) {
                    return;
                }
                e.preventDefault();
            }, { passive: false });

            container.addEventListener('pointermove', e => {
                if (isAnyModalOpen() || isHammerMode || isRailDragging) return;
                if (e.target.closest('#jokers-dock, #hanging-next-dock, #top-bar-dock, #bottom-panel-dock, .game-modal, #joker-target-hint')) {
                    laserBeam.style.display = 'none';
                    return;
                }
                const pos = getPointerPos(e);
                const clampX = Math.max(35, Math.min(suikaContainerWidth - 35, pos.x));
                spawnerWrapper.style.left = `${clampX}px`;
                laserBeam.style.left = `${clampX}px`;
                laserBeam.style.display = 'block';
            });

            container.addEventListener('pointerleave', () => {
                laserBeam.style.display = 'none';
            });

            // Kullanıcı tıkladığı an fırlatıcı patiyi anında oraya çek
            container.addEventListener('pointerdown', e => {
                if (isAnyModalOpen() || isHammerMode || isRailDragging) return;
                if (e.target.closest('#jokers-dock, #hanging-next-dock, #top-bar-dock, #bottom-panel-dock, .game-modal, #joker-target-hint')) return;
                const pos = getPointerPos(e);
                const clampX = Math.max(35, Math.min(suikaContainerWidth - 35, pos.x));
                spawnerWrapper.style.left = `${clampX}px`;
                laserBeam.style.left = `${clampX}px`;
                laserBeam.style.display = 'block';
            });

            container.addEventListener('pointerup', e => {
                // Herhangi bir modal açıksa, joker onayı bekleniyorsa, oyun bittiyse veya UI'a tıklandıysa obje düşürme
                if (isAnyModalOpen() || isLevelCompleted || isGameOver || pendingJokerType !== null || isRailDragging) {
                    return;
                }

                // UI Elemanlarına (Joker Paneli, Alt Bar, Modal, İpuçları vb.) tıklanıyorsa obje ASLA atılmaz
                if (e.target.closest('#jokers-dock, #hanging-next-dock, #top-bar-dock, #bottom-panel-dock, .game-modal, #joker-target-hint, .dock-action-btn, .btn-pause-round, .joker-hit-area, .joker-badge, #modalJokerConfirm')) {
                    return;
                }

                const pos = getPointerPos(e);
                const clampX = Math.max(35, Math.min(suikaContainerWidth - 35, pos.x));
                spawnerWrapper.style.left = `${clampX}px`;
                laserBeam.style.left = `${clampX}px`;

                //  ÇEKİÇ JOKERİ AKTİFSE: SADECE ÇEKİÇ ÇALIŞIR, KESİNLİKLE OBJE DÜŞMEZ!
                if (isHammerMode) {
                    handleHammerClick(pos.x, pos.y);
                    return;
                }

                if (pos.y > 110 && pos.y < suikaContainerHeight - 70) {
                    dropCurrentItem(clampX);
                }
            });
        }

        /* ==========================================
            PARÇACIK SİSTEMİ (Canvas 2D)
           ========================================== */
        function initParticleCanvas() {
            particleCanvas = document.getElementById('particle-canvas');
            if (!particleCanvas) return;
            const container = document.getElementById('game-container');
            particleCanvas.width = container.clientWidth;
            particleCanvas.height = container.clientHeight;
            particleCtx = particleCanvas.getContext('2d');

            particleTick=function animateParticles() {
                particleRaf=null;if(!suikaActive||document.hidden)return;
                if (!particleCtx) return;
                if (particles.length === 0) {
                    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
                    particleRaf=requestAnimationFrame(particleTick);
                    return;
                }

                particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.08;
                    p.life -= p.decay;
                    p.size *= 0.97;

                    if (p.life <= 0 || p.size < 0.5) {
                        particles.splice(i, 1);
                        continue;
                    }

                    particleCtx.globalAlpha = Math.max(0, p.life);
                    particleCtx.fillStyle = p.color;
                    particleCtx.beginPath();
                    particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    particleCtx.fill();
                }
                particleCtx.globalAlpha = 1;
                particleRaf=requestAnimationFrame(particleTick);
            };particleTick();
        }

        function spawnMergeParticles(x, y, tier) {
            const colors = ['#FFB834', '#FF6B8B', '#2ECC71', '#5ECFFF', '#E74C3C', '#F39C12', '#9B59B6', '#1ABC9C', '#FF5733', '#C0392B', '#8E44AD', '#FFD700'];
            const color = colors[Math.min(tier - 1, colors.length - 1)];
            
            // Maksimum 60 parçacık sınırı ile CPU/GPU koruması
            if (particles.length > 60) {
                particles.splice(0, particles.length - 40);
            }

            const count = Math.min(14, 6 + tier);

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
                const speed = 1.5 + Math.random() * 2.5;
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1.5,
                    size: 3 + Math.random() * 3,
                    color: color,
                    life: 1,
                    decay: 0.02 + Math.random() * 0.015
                });
            }

            // Ek beyaz/altın yıldız parçacıkları
            for (let i = 0; i < 5; i++) {
                particles.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -2 - Math.random() * 3,
                    size: 2 + Math.random() * 2,
                    color: tier >= 8 ? '#FFD700' : '#FFFFFF',
                    life: 1,
                    decay: 0.02
                });
            }
        }

        /* ==========================================
            GAME OVER (KAVANOZ TAŞTI) SİSTEMİ
           ========================================== */
        function startDangerCheck() {
            // Her 500ms'de tehlike çizgisini kontrol et
            setInterval(() => {
                if(!suikaActive||document.hidden)return;
                if (isLevelCompleted || isGameOver || isAnyModalOpen()) {
                    dangerAccumulator = 0;
                    document.getElementById('danger-warning').style.display = 'none';
                    return;
                }

                const bodies = Matter.Composite.allBodies(world);
                let anyAboveLine = false;

                for (const b of bodies) {
                    if (!b.isStatic && b.customData && !b.customData.isFrozen) {
                        // Yeni bırakılan veya hızla düşen objeleri ATLA
                        const speed = Math.hypot(b.velocity.x, b.velocity.y);
                        const age = Date.now() - (b.customData.spawnTime || 0);
                        if (age < 2000 || speed > 1.5) continue; // 2sn'den genç veya hâlâ hareket ediyor

                        // Objenin üst kenarı tehlike çizgisinin üstünde mi?
                        let dangerLimitY = DANGER_Y;
                        const dangerEl = document.getElementById('danger-line');
                        if (dangerEl) {
                            const dRect = dangerEl.getBoundingClientRect();
                            const cEl = document.getElementById('game-container');
                            const cRect = cEl ? cEl.getBoundingClientRect() : { top: 0 };
                            const computedDanger = Math.round(dRect.top - cRect.top);
                            if (computedDanger > 100) dangerLimitY = computedDanger;
                        }
                        if (b.position.y - CAT_ITEMS[b.customData.tier - 1].radius < dangerLimitY) {
                            anyAboveLine = true;
                            break;
                        }
                    }
                }

                if (anyAboveLine) {
                    dangerAccumulator += 500;
                    document.getElementById('danger-warning').style.display = 'block';

                    if (dangerAccumulator >= DANGER_THRESHOLD_MS) {
                        triggerGameOver();
                    }
                } else {
                    dangerAccumulator = Math.max(0, dangerAccumulator - 250); // Yavaşça sıfırla
                    if (dangerAccumulator === 0) {
                        document.getElementById('danger-warning').style.display = 'none';
                    }
                }
            }, 500);
        }

        function triggerGameOver() {
            if (isGameOver || isLevelCompleted) return;
            isGameOver = true;

            playSound('hammer'); // Derin patlama sesi

            // Ekran sarsıntısı
            const container = document.getElementById('game-container');
            container.classList.add('shake-intense');
            setTimeout(() => container.classList.remove('shake-intense'), 500);

            // Game Over modalini göster
            document.getElementById('lblGameOverLevel').innerText = currentLevel;
            
            // Revive butonu ve adet kontrolü
            const reviveCount = jokerCounts.swap || 0;
            const reviveBtn = document.getElementById('btnReviveWithJoker');
            const lblCount = document.getElementById('lblGameOverJokerCount');
            if (lblCount) lblCount.innerText = reviveCount;

            if (reviveBtn) {
                if (reviveCount > 0) {
                    reviveBtn.classList.remove('disabled');
                    reviveBtn.disabled = false;
                } else {
                    reviveBtn.classList.add('disabled');
                    reviveBtn.disabled = true;
                }
            }

            setTimeout(() => {
                document.getElementById('modalGameOver').classList.add('active');
            }, 400);
        }

        function gameOverRetry() {
            document.getElementById('modalGameOver').classList.remove('active');
            clearActiveBoardState();
            const onReady = () => startLevel(currentLevel, true);
            if (typeof AdManager !== 'undefined' && AdManager.triggerSmartInterstitial) {
                AdManager.triggerSmartInterstitial('GameOver Retry', onReady);
            } else {
                onReady();
            }
        }

        function gameOverToMap() {
            document.getElementById('modalGameOver').classList.remove('active');
            openRoadmapModal();
            if (typeof AdManager !== 'undefined' && AdManager.triggerSmartInterstitial) {
                AdManager.triggerSmartInterstitial('GameOver Map');
            }
        }

        /* ==========================================
            BAŞLATMA & OTOMATİK TAHTA SENKRONİZASYONU
           ========================================== */

    // Suika Motorunu Global Köprüye Aç
    let engineInitialized = false;

    window.SuikaEngine = {
        init: function() {
            suikaActive=true;
            if (!engineInitialized) {
                if (typeof preloadAssets === 'function') preloadAssets();
                if (typeof loadUserProgress === 'function') loadUserProgress();
                if (typeof initPhysicsEngine === 'function') initPhysicsEngine();
                if (typeof initParticleCanvas === 'function') initParticleCanvas();
                if (typeof initControls === 'function') initControls();
                if (typeof startDangerCheck === 'function') startDangerCheck();
                if (typeof startLaserAim === 'function') startLaserAim();
                engineInitialized = true;
                setInterval(()=>{if(suikaActive&&!document.hidden&&!isLevelCompleted&&!isGameOver&&world)saveActiveBoardState();},1500);
            }
        },
        pause: function(){physicsClock.reset();suikaActive=false;if(world)saveActiveBoardState();if(physicsRaf!==null)cancelAnimationFrame(physicsRaf);if(particleRaf!==null)cancelAnimationFrame(particleRaf);physicsRaf=particleRaf=null;stopBGM();},
        resume: function(){physicsClock.reset();suikaActive=true;if(physicsRaf===null&&physicsTick)physicsTick();if(particleRaf===null&&particleTick)particleTick();},
        startLevel: function(lvl, isRetry) {
            window.currentLevel = lvl;
            if (typeof startLevel === 'function') {
                startLevel(lvl, isRetry);
            }
        },
        getCurrentLevel: function() {
            return currentLevel;
        }
    };

    document.addEventListener('visibilitychange',()=>{if(document.hidden)window.SuikaEngine.pause();else if(!window.PatiLifeAdPaused&&document.getElementById('screen-suika')?.classList.contains('active'))window.SuikaEngine.resume();});
    window.currentLevel = currentLevel;
    if (typeof startLevel === "function") {
        const _origStartLevel = startLevel;
        window.startLevel = function(lvl, isRetry) {
            window.currentLevel = lvl;
            return _origStartLevel(lvl, isRetry);
        };
    }
    if (typeof dropCurrentItem === "function") window.dropCurrentItem = dropCurrentItem;
    if (typeof requestJoker === "function") window.requestJoker = requestJoker;
    if (typeof executePendingJoker === "function") window.executePendingJoker = executePendingJoker;
    if (typeof closeJokerConfirm === "function") window.closeJokerConfirm = closeJokerConfirm;
    if (typeof cancelHammerMode === "function") window.cancelHammerMode = cancelHammerMode;
    if (typeof triggerVictory === "function") window.triggerVictory = triggerVictory;
    if (typeof openRoadmapModal === "function") window.openRoadmapModal = openRoadmapModal;
    if (typeof openRoadmapFromWin === "function") window.openRoadmapFromWin = openRoadmapFromWin;
    if (typeof goToNextLevel === "function") window.goToNextLevel = goToNextLevel;
    if (typeof gameOverRetry === "function") window.gameOverRetry = gameOverRetry;
    if (typeof gameOverToMap === "function") window.gameOverToMap = gameOverToMap;
    if (typeof requestRestartLevel === "function") window.requestRestartLevel = requestRestartLevel;
    if (typeof closeRestartConfirm === "function") window.closeRestartConfirm = closeRestartConfirm;
    if (typeof confirmRestartLevel === "function") window.confirmRestartLevel = confirmRestartLevel;
    if (typeof suikaOpenSettingsModal === "function") window.suikaOpenSettingsModal = suikaOpenSettingsModal;
    if (typeof suikaCloseModals === "function") window.suikaCloseModals = suikaCloseModals;
    if (typeof toggleBGM === "function") window.toggleBGM = toggleBGM;
    if (typeof toggleSFX === "function") window.toggleSFX = toggleSFX;
    if (typeof toggleVibration === "function") window.toggleVibration = toggleVibration;
    if (typeof triggerVibrate === "function") window.triggerVibrate = triggerVibrate;
    if (typeof promptResetSuikaLevels === "function") window.promptResetSuikaLevels = promptResetSuikaLevels;
    if (typeof closeResetAllConfirm === "function") window.closeResetAllConfirm = closeResetAllConfirm;
    if (typeof confirmResetAllSuikaLevels === "function") window.confirmResetAllSuikaLevels = confirmResetAllSuikaLevels;
    if (typeof reviveWithJoker === "function") window.reviveWithJoker = reviveWithJoker;
})();

