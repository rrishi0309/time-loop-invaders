// Time Loop Invaders - Menu Screens

const Screens = {
    // Menu state
    selectedOption: 0,
    menuOptions: ['START GAME', 'DIFFICULTY', 'CREDITS'],
    
    // Difficulty selection
    currentDifficulty: DIFFICULTY.NORMAL,
    difficultyOptions: [DIFFICULTY.EASY, DIFFICULTY.NORMAL, DIFFICULTY.HARD, DIFFICULTY.NIGHTMARE],
    showDifficultyMenu: false,
    difficultyIndex: 1, // Default to NORMAL
    
    // Credits screen
    showCredits: false,
    
    // Transitions
    fadeAlpha: 0,
    transitioning: false,
    transitionCallback: null,
    
    // Title animation
    titleOffset: 0,
    titleTimer: 0,
    
    // Ghost ship animation (menu background)
    menuGhostX: -20,
    menuGhostY: 80,
    
    // Victory/Death stats
    stats: {
        time: 0,
        score: 0,
        ghostsUsed: 0,
        synergyHits: 0,
        rank: 'B',
    },
    
    init() {
        this.selectedOption = 0;
        this.fadeAlpha = 0;
        this.transitioning = false;
    },
    
    update(dt) {
        // Title float animation
        this.titleTimer += dt;
        this.titleOffset = Math.sin(this.titleTimer * 2) * 2;
        
        // Menu ghost animation
        this.menuGhostX += 15 * dt;
        if (this.menuGhostX > CONFIG.CANVAS_WIDTH + 20) {
            this.menuGhostX = -20;
            this.menuGhostY = Utils.random(40, 140);
        }
        
        // Transition fade
        if (this.transitioning) {
            this.fadeAlpha += dt * 3;
            if (this.fadeAlpha >= 1) {
                this.fadeAlpha = 1;
                if (this.transitionCallback) {
                    this.transitionCallback();
                    this.transitionCallback = null;
                }
                // Fade back in
                setTimeout(() => {
                    this.transitioning = false;
                    this.fadeAlpha = 0;
                }, 100);
            }
        }
    },
    
    startTransition(callback) {
        this.transitioning = true;
        this.fadeAlpha = 0;
        this.transitionCallback = callback;
        Audio.play('menuConfirm');
    },
    
    // === MAIN MENU ===
    updateMainMenu(dt) {
        this.update(dt);
        
        if (this.transitioning) return null;
        
        // Ensure music is playing when user interacts
        const ensureMusic = () => {
            if (!Audio.musicPlaying) {
                Audio.startMusic('menu');
            }
        };
        
        // Credits screen
        if (this.showCredits) {
            if (Input.confirm || Input.pause) {
                this.showCredits = false;
                Audio.play('menuNav');
                ensureMusic();
            }
            return null;
        }
        
        // Difficulty sub-menu
        if (this.showDifficultyMenu) {
            if (Input.menuUp) {
                this.difficultyIndex = (this.difficultyIndex - 1 + this.difficultyOptions.length) % this.difficultyOptions.length;
                Audio.play('menuNav');
                ensureMusic();
            }
            if (Input.menuDown) {
                this.difficultyIndex = (this.difficultyIndex + 1) % this.difficultyOptions.length;
                Audio.play('menuNav');
                ensureMusic();
            }
            if (Input.confirm) {
                this.currentDifficulty = this.difficultyOptions[this.difficultyIndex];
                CONFIG.difficulty = this.currentDifficulty;
                this.showDifficultyMenu = false;
                Audio.play('menuConfirm');
                ensureMusic();
            }
            if (Input.pause) {
                this.showDifficultyMenu = false;
                Audio.play('menuNav');
                ensureMusic();
            }
            return null;
        }
        
        // Navigation
        if (Input.menuUp) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
            Audio.play('menuNav');
            ensureMusic();
        }
        if (Input.menuDown) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
            Audio.play('menuNav');
            ensureMusic();
        }
        
        // Selection
        if (Input.confirm) {
            ensureMusic();
            if (this.menuOptions[this.selectedOption] === 'DIFFICULTY') {
                this.showDifficultyMenu = true;
                Audio.play('menuConfirm');
                return null;
            }
            if (this.menuOptions[this.selectedOption] === 'CREDITS') {
                this.showCredits = true;
                Audio.play('menuConfirm');
                return null;
            }
            return this.menuOptions[this.selectedOption];
        }
        
        return null;
    },
    
    drawMainMenu(ctx) {
        // Background (starfield draws behind)
        
        // Ghost ship drifting
        ctx.globalAlpha = 0.3;
        this.drawShipSprite(ctx, Math.floor(this.menuGhostX * 2), Math.floor(this.menuGhostY * 2));
        ctx.globalAlpha = 1;
        
        // Star Wars subtitle
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.GOLD;
        ctx.fillText('★ A STAR WARS FAN GAME ★', CONFIG.CANVAS_WIDTH / 2, 30);
        
        // Title
        ctx.fillStyle = COLORS.CYAN;
        ctx.font = '24px "Press Start 2P"';
        
        // Shadow
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.fillText('TIME LOOP INVADERS', CONFIG.CANVAS_WIDTH / 2 + 2, 60 + this.titleOffset + 2);
        
        // Main title
        ctx.fillStyle = COLORS.CYAN;
        ctx.fillText('TIME LOOP INVADERS', CONFIG.CANVAS_WIDTH / 2, 60 + this.titleOffset);
        
        // Decorative diamonds
        ctx.fillText('◆', CONFIG.CANVAS_WIDTH / 2 - 200, 60 + this.titleOffset);
        ctx.fillText('◆', CONFIG.CANVAS_WIDTH / 2 + 200, 60 + this.titleOffset);
        
        // Current difficulty display
        const diffSettings = DIFFICULTY_SETTINGS[this.currentDifficulty];
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = this.getDifficultyColor(this.currentDifficulty);
        ctx.fillText(`< ${diffSettings.name} >`, CONFIG.CANVAS_WIDTH / 2, 90);
        
        // Menu options
        ctx.font = '16px "Press Start 2P"';
        
        this.menuOptions.forEach((option, index) => {
            const y = 130 + index * 35;
            const isSelected = index === this.selectedOption && !this.showDifficultyMenu;
            
            if (isSelected) {
                ctx.fillStyle = COLORS.CYAN;
                ctx.fillText('▸ ' + option, CONFIG.CANVAS_WIDTH / 2, y);
            } else {
                ctx.fillStyle = COLORS.WHITE;
                ctx.fillText(option, CONFIG.CANVAS_WIDTH / 2, y);
            }
        });
        
        // Difficulty sub-menu
        if (this.showDifficultyMenu) {
            this.drawDifficultyMenu(ctx);
        }
        
        // Credits overlay
        if (this.showCredits) {
            this.drawCreditsScreen(ctx);
        }
        
        // Credits at bottom
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('Made during Vibe Coding Club', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 35);
        ctx.fillStyle = COLORS.CYAN;
        ctx.fillText('By Rishi Ramesh', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 22);
        
        // Controls hint
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('↑↓ SELECT   SPACE/ENTER CONFIRM', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 8);
        
        // Transition overlay
        this.drawTransition(ctx);
    },
    
    drawDifficultyMenu(ctx) {
        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Panel
        const panelWidth = 400;
        const panelHeight = 260;
        const panelX = (CONFIG.CANVAS_WIDTH - panelWidth) / 2;
        const panelY = (CONFIG.CANVAS_HEIGHT - panelHeight) / 2;
        
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = COLORS.CYAN;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.lineWidth = 1;
        
        // Title
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '18px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT DIFFICULTY', CONFIG.CANVAS_WIDTH / 2, panelY + 35);
        
        // Difficulty options
        ctx.font = '14px "Press Start 2P"';
        
        this.difficultyOptions.forEach((diff, index) => {
            const settings = DIFFICULTY_SETTINGS[diff];
            const y = panelY + 75 + index * 45;
            const isSelected = index === this.difficultyIndex;
            
            // Name
            ctx.fillStyle = isSelected ? this.getDifficultyColor(diff) : COLORS.GRAY;
            ctx.textAlign = 'center';
            ctx.fillText(isSelected ? '▸ ' + settings.name : settings.name, CONFIG.CANVAS_WIDTH / 2, y);
            
            // Description (only for selected)
            if (isSelected) {
                ctx.fillStyle = COLORS.WHITE;
                ctx.font = '10px "Press Start 2P"';
                ctx.fillText(settings.description, CONFIG.CANVAS_WIDTH / 2, y + 18);
                ctx.font = '14px "Press Start 2P"';
            }
        });
        
        // Controls hint
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('ESC to cancel', CONFIG.CANVAS_WIDTH / 2, panelY + panelHeight - 15);
    },
    
    getDifficultyColor(diff) {
        switch (diff) {
            case DIFFICULTY.EASY: return COLORS.GREEN;
            case DIFFICULTY.NORMAL: return COLORS.CYAN;
            case DIFFICULTY.HARD: return COLORS.YELLOW;
            case DIFFICULTY.NIGHTMARE: return COLORS.RED;
            default: return COLORS.WHITE;
        }
    },
    
    drawCreditsScreen(ctx) {
        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Panel
        const panelWidth = 450;
        const panelHeight = 280;
        const panelX = (CONFIG.CANVAS_WIDTH - panelWidth) / 2;
        const panelY = (CONFIG.CANVAS_HEIGHT - panelHeight) / 2;
        
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.lineWidth = 1;
        
        ctx.textAlign = 'center';
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        
        // Title
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = '18px "Press Start 2P"';
        ctx.fillText('★ CREDITS ★', centerX, panelY + 40);
        
        // Star Wars subtitle
        ctx.fillStyle = COLORS.YELLOW;
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('A Star Wars Fan Game', centerX, panelY + 70);
        
        // Main credit
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('Made during', centerX, panelY + 110);
        ctx.fillStyle = COLORS.CYAN;
        ctx.font = '14px "Press Start 2P"';
        ctx.fillText('Vibe Coding Club', centerX, panelY + 135);
        
        // Creator
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('Created by', centerX, panelY + 175);
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.font = '16px "Press Start 2P"';
        ctx.fillText('Rishi Ramesh', centerX, panelY + 200);
        
        // Music credit
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText('Music inspired by John Williams', centerX, panelY + 235);
        
        // Back hint
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('Press SPACE or ESC to return', centerX, panelY + panelHeight - 15);
    },
    
    // === PAUSE MENU ===
    pauseOptions: ['RESUME', 'SETTINGS', 'RESTART LOOP', 'QUIT TO MENU'],
    pauseSelected: 0,
    
    updatePauseMenu(dt) {
        if (Input.menuUp) {
            this.pauseSelected = (this.pauseSelected - 1 + this.pauseOptions.length) % this.pauseOptions.length;
            Audio.play('menuNav');
        }
        if (Input.menuDown) {
            this.pauseSelected = (this.pauseSelected + 1) % this.pauseOptions.length;
            Audio.play('menuNav');
        }
        
        if (Input.confirm) {
            Audio.play('menuConfirm');
            return this.pauseOptions[this.pauseSelected];
        }
        
        if (Input.pause) {
            return 'RESUME';
        }
        
        return null;
    },
    
    drawPauseMenu(ctx) {
        // Dim overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += 4) {
            ctx.fillRect(0, y, CONFIG.CANVAS_WIDTH, 2);
        }
        
        // Panel
        const panelWidth = 280;
        const panelHeight = 200;
        const panelX = (CONFIG.CANVAS_WIDTH - panelWidth) / 2;
        const panelY = (CONFIG.CANVAS_HEIGHT - panelHeight) / 2;
        
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        ctx.strokeStyle = COLORS.CYAN;
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        ctx.lineWidth = 1;
        
        // Title
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '18px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', CONFIG.CANVAS_WIDTH / 2, panelY + 35);
        
        // Options
        ctx.font = '14px "Press Start 2P"';
        
        this.pauseOptions.forEach((option, index) => {
            const y = panelY + 70 + index * 32;
            const isSelected = index === this.pauseSelected;
            
            if (isSelected) {
                ctx.fillStyle = COLORS.CYAN;
                ctx.fillText('▸ ' + option, CONFIG.CANVAS_WIDTH / 2, y);
            } else {
                ctx.fillStyle = COLORS.WHITE;
                ctx.fillText(option, CONFIG.CANVAS_WIDTH / 2, y);
            }
        });
    },
    
    // === DEATH SCREEN ===
    deathTimer: 0,
    deathPhase: 0,
    deathCount: 0,
    maxDeaths: 6,
    
    startDeath(time, score, deathCount = 1, maxDeaths = 6) {
        this.deathTimer = 0;
        this.deathPhase = 0;
        this.stats.time = time;
        this.stats.score = score;
        this.deathCount = deathCount;
        this.maxDeaths = maxDeaths;
    },
    
    updateDeath(dt) {
        this.deathTimer += dt;
        
        // Phase transitions
        if (this.deathTimer > 0.3 && this.deathPhase === 0) {
            this.deathPhase = 1; // Freeze
        }
        if (this.deathTimer > 0.6 && this.deathPhase === 1) {
            this.deathPhase = 2; // Rewind
            Audio.play('rewind');
        }
        if (this.deathTimer > 1.2 && this.deathPhase === 2) {
            this.deathPhase = 3; // Stats flash
        }
        
        return this.deathTimer > 1.8;
    },
    
    drawDeath(ctx) {
        // Chromatic aberration based on phase
        if (this.deathPhase >= 1) {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }
        
        // Stats flash
        if (this.deathPhase === 3) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('LOOP FAILED', CONFIG.CANVAS_WIDTH / 2, 120);
            
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(`Time: ${Utils.formatTime(CONFIG.getLoopDuration() - this.stats.time)}`, CONFIG.CANVAS_WIDTH / 2, 170);
            ctx.fillText(`Score: ${Utils.formatNumber(this.stats.score)}`, CONFIG.CANVAS_WIDTH / 2, 200);
            
            // Lives remaining
            const livesLeft = this.maxDeaths - this.deathCount;
            ctx.fillStyle = livesLeft <= 2 ? COLORS.RED : COLORS.YELLOW;
            ctx.fillText(`Attempts Left: ${livesLeft}`, CONFIG.CANVAS_WIDTH / 2, 240);
            
            ctx.fillStyle = COLORS.GREEN;
            ctx.fillText('Ghost Saved ✓', CONFIG.CANVAS_WIDTH / 2, 280);
        }
    },
    
    // === VICTORY SCREEN ===
    victoryTimer: 0,
    victoryPhase: 0,
    
    startVictory(time, score, ghostsUsed, synergyHits) {
        this.victoryTimer = 0;
        this.victoryPhase = 0;
        this.stats.time = time;
        this.stats.score = score;
        this.stats.ghostsUsed = ghostsUsed;
        this.stats.synergyHits = synergyHits;
        this.stats.difficulty = this.currentDifficulty;
        
        // Calculate rank (adjusted by difficulty)
        const diffMult = {
            [DIFFICULTY.EASY]: 0,
            [DIFFICULTY.NORMAL]: 1,
            [DIFFICULTY.HARD]: 2,
            [DIFFICULTY.NIGHTMARE]: 3,
        }[this.currentDifficulty] || 1;
        
        if ((time >= 10 && ghostsUsed === 0) || (diffMult >= 2 && time >= 5)) {
            this.stats.rank = 'S';
        } else if (time >= 5 || diffMult >= 2) {
            this.stats.rank = 'A';
        } else if (time > 1) {
            this.stats.rank = 'B';
        } else {
            this.stats.rank = 'C';
        }
    },
    
    victoryMenuSelected: 0,
    victoryOptions: ['PLAY AGAIN', 'MAIN MENU'],
    
    updateVictory(dt) {
        this.victoryTimer += dt;
        
        // Phase transitions
        if (this.victoryTimer > 0.5) this.victoryPhase = 1;
        if (this.victoryTimer > 1.0) this.victoryPhase = 2;
        if (this.victoryTimer > 2.0) this.victoryPhase = 3;
        
        if (this.victoryPhase >= 3) {
            if (Input.menuUp || Input.menuDown) {
                this.victoryMenuSelected = (this.victoryMenuSelected + 1) % 2;
                Audio.play('menuNav');
            }
            
            if (Input.confirm) {
                Audio.play('menuConfirm');
                return this.victoryOptions[this.victoryMenuSelected];
            }
        }
        
        return null;
    },
    
    drawVictory(ctx) {
        // White flash at start
        if (this.victoryTimer < 0.3) {
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - this.victoryTimer / 0.3})`;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            return;
        }
        
        // Background
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Title with sparkles
        if (this.victoryPhase >= 1) {
            ctx.fillStyle = COLORS.CYAN;
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('✧ LOOP BROKEN ✧', CONFIG.CANVAS_WIDTH / 2, 50);
            
            // Difficulty badge
            const diffSettings = DIFFICULTY_SETTINGS[this.stats.difficulty || this.currentDifficulty];
            ctx.font = '12px "Press Start 2P"';
            ctx.fillStyle = this.getDifficultyColor(this.stats.difficulty || this.currentDifficulty);
            ctx.fillText(diffSettings.name + ' MODE', CONFIG.CANVAS_WIDTH / 2, 75);
        }
        
        // Stats panel
        if (this.victoryPhase >= 2) {
            const panelX = (CONFIG.CANVAS_WIDTH - 320) / 2;
            const panelY = 95;
            
            ctx.fillStyle = COLORS.PANEL;
            ctx.fillRect(panelX, panelY, 320, 140);
            ctx.strokeStyle = COLORS.CYAN;
            ctx.lineWidth = 2;
            ctx.strokeRect(panelX, panelY, 320, 140);
            ctx.lineWidth = 1;
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '14px "Press Start 2P"';
            ctx.textAlign = 'left';
            
            ctx.fillText('FINAL TIME', panelX + 20, panelY + 30);
            ctx.textAlign = 'right';
            ctx.fillText(Utils.formatTime(this.stats.time), panelX + 300, panelY + 30);
            
            ctx.textAlign = 'left';
            ctx.fillText('SCORE', panelX + 20, panelY + 55);
            ctx.textAlign = 'right';
            ctx.fillText(Utils.formatNumber(this.stats.score), panelX + 300, panelY + 55);
            
            ctx.textAlign = 'left';
            ctx.fillText('GHOSTS USED', panelX + 20, panelY + 80);
            ctx.textAlign = 'right';
            ctx.fillText(this.stats.ghostsUsed.toString(), panelX + 300, panelY + 80);
            
            ctx.textAlign = 'left';
            ctx.fillText('SYNERGY HITS', panelX + 20, panelY + 105);
            ctx.textAlign = 'right';
            ctx.fillText(this.stats.synergyHits.toString(), panelX + 300, panelY + 105);
            
            // Rank
            let rankColor = COLORS.WHITE;
            if (this.stats.rank === 'S') rankColor = COLORS.GOLD;
            if (this.stats.rank === 'A') rankColor = COLORS.CYAN;
            
            ctx.fillStyle = rankColor;
            ctx.font = '32px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(this.stats.rank, CONFIG.CANVAS_WIDTH / 2, panelY + 135);
        }
        
        // Menu options
        if (this.victoryPhase >= 3) {
            ctx.font = '16px "Press Start 2P"';
            
            this.victoryOptions.forEach((option, index) => {
                const y = 280 + index * 30;
                const isSelected = index === this.victoryMenuSelected;
                
                ctx.fillStyle = isSelected ? COLORS.CYAN : COLORS.WHITE;
                ctx.fillText(isSelected ? '▸ ' + option : option, CONFIG.CANVAS_WIDTH / 2, y);
            });
        }
    },
    
    // === GAME OVER SCREEN ===
    gameOverTimer: 0,
    gameOverPhase: 0,
    gameOverMenuSelected: 0,
    gameOverOptions: ['TRY AGAIN', 'MAIN MENU'],
    gameOverStats: {
        score: 0,
        deaths: 0,
        ghosts: 0,
        synergy: 0,
    },
    
    startGameOver(totalScore, deaths, ghosts, synergy) {
        this.gameOverTimer = 0;
        this.gameOverPhase = 0;
        this.gameOverMenuSelected = 0;
        this.gameOverStats = {
            score: totalScore,
            deaths: deaths,
            ghosts: ghosts,
            synergy: synergy,
        };
    },
    
    updateGameOver(dt) {
        this.gameOverTimer += dt;
        
        if (this.gameOverTimer > 0.5) this.gameOverPhase = 1;
        if (this.gameOverTimer > 1.5) this.gameOverPhase = 2;
        
        if (this.gameOverPhase >= 2) {
            if (Input.menuUp || Input.menuDown) {
                this.gameOverMenuSelected = (this.gameOverMenuSelected + 1) % 2;
                Audio.play('menuNav');
            }
            
            if (Input.confirm) {
                Audio.play('menuConfirm');
                return this.gameOverOptions[this.gameOverMenuSelected];
            }
        }
        
        return null;
    },
    
    drawGameOver(ctx) {
        // Dark red overlay
        ctx.fillStyle = 'rgba(40, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Title
        if (this.gameOverPhase >= 1) {
            ctx.fillStyle = COLORS.RED;
            ctx.font = '28px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, 70);
            
            // Subtitle
            ctx.fillStyle = COLORS.GRAY;
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText('The loop has consumed you...', CONFIG.CANVAS_WIDTH / 2, 100);
        }
        
        // Stats panel
        if (this.gameOverPhase >= 1) {
            const panelX = (CONFIG.CANVAS_WIDTH - 320) / 2;
            const panelY = 120;
            
            ctx.fillStyle = COLORS.PANEL;
            ctx.fillRect(panelX, panelY, 320, 120);
            ctx.strokeStyle = COLORS.RED;
            ctx.lineWidth = 2;
            ctx.strokeRect(panelX, panelY, 320, 120);
            ctx.lineWidth = 1;
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '14px "Press Start 2P"';
            ctx.textAlign = 'left';
            
            ctx.fillText('TOTAL SCORE', panelX + 20, panelY + 30);
            ctx.textAlign = 'right';
            ctx.fillText(Utils.formatNumber(this.gameOverStats.score), panelX + 300, panelY + 30);
            
            ctx.textAlign = 'left';
            ctx.fillText('DEATHS', panelX + 20, panelY + 60);
            ctx.textAlign = 'right';
            ctx.fillStyle = COLORS.RED;
            ctx.fillText(this.gameOverStats.deaths.toString(), panelX + 300, panelY + 60);
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.textAlign = 'left';
            ctx.fillText('GHOSTS CREATED', panelX + 20, panelY + 90);
            ctx.textAlign = 'right';
            ctx.fillText(this.gameOverStats.ghosts.toString(), panelX + 300, panelY + 90);
        }
        
        // Menu options
        if (this.gameOverPhase >= 2) {
            ctx.font = '16px "Press Start 2P"';
            ctx.textAlign = 'center';
            
            this.gameOverOptions.forEach((option, index) => {
                const y = 280 + index * 30;
                const isSelected = index === this.gameOverMenuSelected;
                
                ctx.fillStyle = isSelected ? COLORS.CYAN : COLORS.WHITE;
                ctx.fillText(isSelected ? '▸ ' + option : option, CONFIG.CANVAS_WIDTH / 2, y);
            });
        }
    },
    
    // === HELPERS ===
    drawShipSprite(ctx, x, y) {
        ctx.fillStyle = COLORS.CYAN;
        ctx.fillRect(x + 8, y + 4, 8, 16);
        ctx.fillRect(x, y + 10, 8, 8);
        ctx.fillRect(x + 16, y + 10, 8, 8);
        ctx.fillRect(x + 10, y, 4, 4);
    },
    
    drawTransition(ctx) {
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }
    },
};
