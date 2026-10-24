/* Shared services do not initialize or load the optional puzzle scene. */
(function(){window.PatiLifePatileServices={pendingVictoryAfterAd:false,isLevelCompleted:false,checkAllGoalsCompleted:()=>false,triggerVictory:()=>{}};
        /* ==========================================
            ADMANAGER (ÖDÜLLÜ REKLAM & JOKER & ATLAMA)
           ========================================== */
        const AdManager = {
            targetJokerType: null,
            adTimer: null,
            adCountdown: 5,
            onSuccessCallback: null,

            promptJokerAd: function(type) {
                this.targetJokerType = type;
                const img = document.getElementById('rewardJokerPromptImg');
                const title = document.getElementById('rewardJokerPromptTitle');
                const desc = document.getElementById('rewardJokerPromptDesc');

                if (type === 'hammer') {
                    if (img) img.src = 'suika_game/ui_assets/joker_btn_hammer.png';
                    if (title) title.innerText = 'ÇEKİÇ JOKERİ TÜKENDİ!';
                    if (desc) desc.innerHTML = 'Kısa bir sponsor reklamı izleyerek anında <b>+1 Çekiç Jokeri</b> kazanmak ister misin?';
                } else if (type === 'shake') {
                    if (img) img.src = 'suika_game/ui_assets/joker_btn_tornado.png';
                    if (title) title.innerText = 'KASIRGA JOKERİ TÜKENDİ!';
                    if (desc) desc.innerHTML = 'Kısa bir sponsor reklamı izleyerek anında <b>+1 Kasırga Jokeri</b> kazanmak ister misin?';
                } else {
                    if (img) img.src = 'suika_game/ui_assets/joker_btn_swap.png';
                    if (title) title.innerText = 'KURTARMA JOKERİ TÜKENDİ!';
                    if (desc) desc.innerHTML = 'Kısa bir sponsor reklamı izleyerek anında <b>+1 Kurtarma Jokeri</b> kazanmak ister misin?';
                }

                document.getElementById('modalRewardJokerPrompt').classList.add('active');
            },

            confirmWatchForJoker: function() {
                const type = this.targetJokerType;
                window.PatiLifePatileServices.suikaCloseModals();
                if (!type) return;

                const jokerName = type === 'hammer' ? 'Çekiç' : type === 'shake' ? 'Kasırga' : 'Kurtarma';
                return this.showRewardedAd({
                    title: `+1 ${jokerName} Jokeri Ödülü`,
                    onReward: () => {
                        window.PatiLifePatileServices.jokerCounts[type] = (window.PatiLifePatileServices.jokerCounts[type] || 0) + 1;
                        window.PatiLifePatileServices.updateJokerBadges();
                        window.PatiLifePatileServices.saveUserProgress();
                        if (typeof window.PatiLifePatileServices.playSound === 'function') window.PatiLifePatileServices.playSound('win');
                        if (typeof showBubble === 'function') {
                            showBubble(`+1 ${jokerName} Jokeri Hesabına Eklendi!`);
                        }
                    }
                });
            },

            watchAdForSkipLevel: function() {
                window.PatiLifePatileServices.suikaCloseModals();
                return this.showRewardedAd({
                    title: `Seviye ${window.PatiLifePatileServices.currentLevel} Atlama Ödülü`,
                    onReward: () => {
                        // 1. Bu seviyeyi ATLANDI (-1) olarak kaydet (Yıldız almaz, haritada geçildi rozeti alır)
                        window.PatiLifePatileServices.levelStars[window.PatiLifePatileServices.currentLevel] = -1;
                        // 2. Bir sonraki seviyenin kilidini aç
                        window.PatiLifePatileServices.maxUnlockedLevel = Math.max(window.PatiLifePatileServices.maxUnlockedLevel, window.PatiLifePatileServices.currentLevel + 1);
                        window.PatiLifePatileServices.saveUserProgress();
                        window.PatiLifePatileServices.clearActiveBoardState();

                        if (typeof showBubble === 'function') {
                            showBubble(`Seviye ${window.PatiLifePatileServices.currentLevel} Atlandı! Yol haritasında Geçildi olarak işaretlendi.`);
                        }

                        // 3. Sonraki seviyeyi başlat
                        const nextLvl = window.PatiLifePatileServices.currentLevel + 1;
                        window.PatiLifePatileServices.startLevel(nextLvl, true);
                    }
                });
            },

            // 1. Ödüllü Reklam: Ücretsiz Taze Kedi Kumu Dökme
            watchAdForLitterRefill: function() {
                return this.showRewardedAd({
                    title: 'Ücretsiz Taze Kum Ödülü',
                    onReward: () => {
                        if (window.PatiLifeHousehold) { window.PatiLifeHousehold.sponsorLitter(); return; }
                        GameState.litterCleanCount = 0;
                        GameState.toiletFullness = 0;
                        updateHUD();
                        saveGameState();
                        sfxCoin();
                        sfxSandDig();
                        closeLitterPurchaseModal();
                        showBubble('Taze kedi kumu ücretsiz döküldü!');
                        addXP(25, 'Sponsorlu Kum Yenileme');
                    }
                });
            },

            // 2. Ödüllü Reklam: Sponsorlu Gurme Ziyafet Paketi
            watchAdForFreeFood: function() {
                return this.showRewardedAd({
                    title: 'Sponsorlu Gurme Ziyafeti',
                    onReward: () => {
                        GameState.hunger = Math.min(100, (GameState.hunger ?? 50) + 45);
                        GameState.coins = (GameState.coins || 0) + 30;
                        GameState.happy = Math.min(100, (GameState.happy ?? 50) + 20);
                        addXP(25, 'Sponsorlu Gurme Ziyafet');
                        updateHUD();
                        saveGameState();
                        sfxCoin();
                        sfxEat();
                        closeModals();
                        showBubble('+30 Altın ve Lezzetli Ziyafet Paketi Alındı!');
                    }
                });
            },

            // 3. Ödüllü Reklam: Sponsorlu Kristal Su Pınarı
            watchAdForFreeWater: function() {
                return this.showRewardedAd({
                    title: 'Sponsorlu Kristal Su Pınarı',
                    onReward: () => {
                        GameState.thirst = Math.min(100, (GameState.thirst ?? 50) + 50);
                        GameState.coins = (GameState.coins || 0) + 25;
                        GameState.happy = Math.min(100, (GameState.happy ?? 50) + 20);
                        addXP(25, 'Sponsorlu Kristal Su');
                        if (typeof trackQuestProgress === 'function') trackQuestProgress('water', 1);
                        updateHUD();
                        saveGameState();
                        sfxCoin();
                        sfxEat();
                        closeModals();
                        showBubble('+25 Altın ve Taze Su Pınarı Dolduruldu!');
                    }
                });
            },

            // 4. Ödüllü Reklam: Ücretsiz Pati Altını Sandığı
            watchAdForFreeCoins: function() {
                return this.showRewardedAd({
                    title: 'Ücretsiz Pati Altını Ödülü',
                    onReward: () => {
                        GameState.coins = (GameState.coins || 0) + 40;
                        addXP(20, 'Sponsorlu Altın Sandığı');
                        updateHUD();
                        saveGameState();
                        sfxCoin();
                        showBubble('+40 Pati Altını Cüzdanına Eklendi!');
                    }
                });
            },

            // 5. Ödüllü Reklam: Anında Uyandır ve Tam Enerji Doldur
            watchAdForEnergyWake: function() {
                return this.showRewardedAd({
                    title: 'Anında Uyandır & Tam Enerji',
                    onReward: () => {
                        wakeUp();
                        GameState.energy = 100;
                        updateHUD();
                        saveGameState();
                        sfxFanfare();
                        showBubble('Kedi enerjisi %100 olarak zinde uyandı!');
                    }
                });
            },

        };
        window.AdManager = Object.assign(window.PatiLifeAds.create(), AdManager);
})();
