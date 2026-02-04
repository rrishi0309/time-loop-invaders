// Time Loop Invaders - Menu Screens

const Screens = {
    // Menu state
    selectedOption: 0,
    menuOptions: ['START GAME', 'DIFFICULTY', 'HOW TO PLAY', 'CREDITS'],
    
    // Difficulty selection
    currentDifficulty: DIFFICULTY.NORMAL,
    difficultyOptions: [DIFFICULTY.EASY, DIFFICULTY.NORMAL, DIFFICULTY.HARD, DIFFICULTY.NIGHTMARE],
    showDifficultyMenu: false,
    difficultyIndex: 1, // Default to NORMAL
    
    // Credits screen (Star Wars crawl style)
    showCredits: false,
    creditsScrollY: 0,
    
    // Instructions screen
    showInstructions: false,
    instructionsPage: 0,
    
    // Star Wars quotes for various moments
    deathQuotes: [
        '"I have a bad feeling about this..."',
        '"That\'s not how the Force works!"',
        '"The dark side clouds everything."',
        '"Do or do not. There is no try."',
        '"I find your lack of skill disturbing."',
        '"You have failed me for the last time."',
        '"Impressive... most impressive. But not good enough."',
        '"The Force is not strong with this one."',
        '"You were the chosen one!"',
        '"This is where the fun begins... again."',
    ],
    victoryQuotes: [
        '"The Force is strong with you!"',
        '"Great shot kid, that was one in a million!"',
        '"You have learned well, young Padawan."',
        '"This is the way."',
        '"A Jedi uses the Force for knowledge and defense."',
        '"The Force will be with you. Always."',
        '"Never tell me the odds!"',
        '"I am one with the Force, the Force is with me."',
    ],
    gameOverQuotes: [
        '"You were supposed to destroy them, not join them!"',
        '"I sense a great disturbance in the Force."',
        '"So this is how liberty dies... with thunderous applause."',
        '"The ability to speak does not make you intelligent."',
        '"Your overconfidence is your weakness."',
        '"There is another... try again you must."',
    ],
    currentDeathQuote: '',
    currentVictoryQuote: '',
    currentGameOverQuote: '',
    
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
        
        // Credits screen (scrolling)
        if (this.showCredits) {
            this.creditsScrollY += dt * 30; // Scroll speed
            if (Input.confirm || Input.pause) {
                this.showCredits = false;
                this.creditsScrollY = 0;
                Audio.play('menuNav');
                ensureMusic();
            }
            return null;
        }
        
        // Instructions screen
        if (this.showInstructions) {
            if (Input.menuLeft || Input.menuRight) {
                this.instructionsPage = (this.instructionsPage + 1) % 2;
                Audio.play('menuNav');
            }
            if (Input.confirm || Input.pause) {
                this.showInstructions = false;
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
            if (this.menuOptions[this.selectedOption] === 'HOW TO PLAY') {
                this.showInstructions = true;
                this.instructionsPage = 0;
                Audio.play('menuConfirm');
                return null;
            }
            if (this.menuOptions[this.selectedOption] === 'CREDITS') {
                this.showCredits = true;
                this.creditsScrollY = 0;
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
        
        // Instructions overlay
        if (this.showInstructions) {
            this.drawInstructionsScreen(ctx);
        }
        
        // Credits overlay (Star Wars crawl)
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
        // Full black background (like Star Wars opening)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Draw stars in background
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % CONFIG.CANVAS_WIDTH;
            const y = (i * 89) % CONFIG.CANVAS_HEIGHT;
            ctx.fillRect(x, y, 1, 1);
        }
        
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        ctx.textAlign = 'center';
        
        // Star Wars style crawling text
        const crawlText = [
            { text: 'A long time ago in a galaxy', size: 10, color: COLORS.CYAN },
            { text: 'far, far away....', size: 10, color: COLORS.CYAN },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'TIME LOOP INVADERS', size: 18, color: COLORS.GOLD },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'A STAR WARS FAN GAME', size: 12, color: COLORS.YELLOW },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'Episode I', size: 14, color: COLORS.GOLD },
            { text: 'THE VIBE AWAKENS', size: 16, color: COLORS.GOLD },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'It is a period of intense', size: 10, color: COLORS.WHITE },
            { text: 'coding. A brave developer,', size: 10, color: COLORS.WHITE },
            { text: 'striking from the Vibe', size: 10, color: COLORS.WHITE },
            { text: 'Coding Club, has created', size: 10, color: COLORS.WHITE },
            { text: 'an epic space adventure.', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'CREATED BY', size: 10, color: COLORS.GRAY },
            { text: 'RISHI RAMESH', size: 16, color: COLORS.MAGENTA },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'MADE DURING', size: 10, color: COLORS.GRAY },
            { text: 'VIBE CODING CLUB', size: 14, color: COLORS.CYAN },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'MUSIC INSPIRED BY', size: 8, color: COLORS.GRAY },
            { text: 'JOHN WILLIAMS', size: 12, color: COLORS.YELLOW },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '"May the Force be with you"', size: 10, color: COLORS.CYAN },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: '', size: 10, color: COLORS.WHITE },
            { text: 'SPECIAL THANKS TO', size: 8, color: COLORS.GRAY },
            { text: 'George Lucas', size: 10, color: COLORS.WHITE },
            { text: 'The Star Wars Universe', size: 10, color: COLORS.WHITE },
            { text: 'All the Vibe Coders', size: 10, color: COLORS.WHITE },
        ];
        
        // Draw crawl text with perspective effect
        let yOffset = CONFIG.CANVAS_HEIGHT - this.creditsScrollY;
        
        crawlText.forEach((line, index) => {
            const y = yOffset + index * 22;
            
            // Only draw if on screen
            if (y > -30 && y < CONFIG.CANVAS_HEIGHT + 30) {
                // Perspective fade (text fades as it goes up)
                const fadeStart = CONFIG.CANVAS_HEIGHT * 0.3;
                let alpha = 1;
                if (y < fadeStart) {
                    alpha = Math.max(0, y / fadeStart);
                }
                
                ctx.globalAlpha = alpha;
                ctx.font = `${line.size}px "Press Start 2P"`;
                ctx.fillStyle = line.color;
                ctx.fillText(line.text, centerX, y);
            }
        });
        
        ctx.globalAlpha = 1;
        
        // Reset scroll if past all text
        if (this.creditsScrollY > crawlText.length * 22 + CONFIG.CANVAS_HEIGHT) {
            this.creditsScrollY = 0;
        }
        
        // Back hint (always visible at bottom)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - 25, CONFIG.CANVAS_WIDTH, 25);
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '10px "Press Start 2P"';
        ctx.fillText('Press SPACE or ESC to return', centerX, CONFIG.CANVAS_HEIGHT - 8);
    },
    
    drawInstructionsScreen(ctx) {
        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        ctx.textAlign = 'center';
        
        // Title
        ctx.fillStyle = COLORS.GOLD;
        ctx.font = '18px "Press Start 2P"';
        ctx.fillText('★ JEDI TRAINING ★', centerX, 35);
        
        if (this.instructionsPage === 0) {
            // Page 1: Controls
            ctx.fillStyle = COLORS.CYAN;
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText('CONTROLS', centerX, 70);
            
            const controls = [
                { key: 'A/D or ←/→', action: 'Move your ship' },
                { key: 'SPACE', action: 'Fire lasers' },
                { key: 'SHIFT', action: 'Activate slow-mo' },
                { key: 'E', action: 'Deploy proton bomb' },
                { key: 'R', action: 'Restart loop early' },
                { key: 'ESC', action: 'Pause game' },
            ];
            
            ctx.font = '10px "Press Start 2P"';
            controls.forEach((ctrl, i) => {
                const y = 100 + i * 28;
                ctx.fillStyle = COLORS.YELLOW;
                ctx.textAlign = 'right';
                ctx.fillText(ctrl.key, centerX - 20, y);
                ctx.fillStyle = COLORS.WHITE;
                ctx.textAlign = 'left';
                ctx.fillText(ctrl.action, centerX + 20, y);
            });
            
            // Yoda quote
            ctx.textAlign = 'center';
            ctx.fillStyle = COLORS.GREEN;
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('"Control, control, you must learn control!"', centerX, 290);
            ctx.fillStyle = COLORS.GRAY;
            ctx.fillText('- Master Yoda', centerX, 305);
            
        } else {
            // Page 2: How to Play
            ctx.fillStyle = COLORS.CYAN;
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText('THE MISSION', centerX, 70);
            
            const instructions = [
                'Each loop lasts 60 seconds.',
                'Destroy enemies to score points.',
                'When you die, your run becomes',
                'a GHOST that fights with you!',
                '',
                'Stack up to 5+ ghosts to',
                'overwhelm the LOOP BOSS.',
                '',
                'Defeat the boss before time',
                'runs out to BREAK THE LOOP!',
            ];
            
            ctx.font = '10px "Press Start 2P"';
            ctx.fillStyle = COLORS.WHITE;
            instructions.forEach((line, i) => {
                ctx.fillText(line, centerX, 100 + i * 20);
            });
            
            // Han Solo quote
            ctx.fillStyle = COLORS.CYAN;
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('"Never tell me the odds!"', centerX, 310);
            ctx.fillStyle = COLORS.GRAY;
            ctx.fillText('- Han Solo', centerX, 325);
        }
        
        // Page indicator
        ctx.fillStyle = COLORS.GRAY;
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`Page ${this.instructionsPage + 1}/2  (←/→ to switch)`, centerX, CONFIG.CANVAS_HEIGHT - 35);
        
        // Back hint
        ctx.fillStyle = COLORS.GRAY;
        ctx.fillText('Press SPACE or ESC to return', centerX, CONFIG.CANVAS_HEIGHT - 12);
    },
    
    // === PAUSE MENU ===
    pauseOptions: ['RESUME', 'RESTART LOOP', 'QUIT TO MENU'],
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
        // Pick a random Star Wars death quote
        this.currentDeathQuote = this.deathQuotes[Math.floor(Math.random() * this.deathQuotes.length)];
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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            
            ctx.fillStyle = COLORS.RED;
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('LOOP FAILED', CONFIG.CANVAS_WIDTH / 2, 80);
            
            // Star Wars quote
            ctx.fillStyle = COLORS.YELLOW;
            ctx.font = '10px "Press Start 2P"';
            ctx.fillText(this.currentDeathQuote, CONFIG.CANVAS_WIDTH / 2, 115);
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(`Time: ${Utils.formatTime(CONFIG.getLoopDuration() - this.stats.time)}`, CONFIG.CANVAS_WIDTH / 2, 160);
            ctx.fillText(`Score: ${Utils.formatNumber(this.stats.score)}`, CONFIG.CANVAS_WIDTH / 2, 190);
            
            // Lives remaining
            const livesLeft = this.maxDeaths - this.deathCount;
            ctx.fillStyle = livesLeft <= 2 ? COLORS.RED : COLORS.YELLOW;
            ctx.fillText(`Attempts Left: ${livesLeft}`, CONFIG.CANVAS_WIDTH / 2, 230);
            
            ctx.fillStyle = COLORS.GREEN;
            ctx.fillText('Ghost Saved ✓', CONFIG.CANVAS_WIDTH / 2, 270);
            
            // Encouraging message
            ctx.fillStyle = COLORS.CYAN;
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('The Force will guide your ghost...', CONFIG.CANVAS_WIDTH / 2, 310);
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
        
        // Pick a random Star Wars victory quote
        this.currentVictoryQuote = this.victoryQuotes[Math.floor(Math.random() * this.victoryQuotes.length)];
        
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
            ctx.fillStyle = COLORS.GOLD;
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('✧ LOOP BROKEN ✧', CONFIG.CANVAS_WIDTH / 2, 40);
            
            // Star Wars victory quote
            ctx.fillStyle = COLORS.CYAN;
            ctx.font = '10px "Press Start 2P"';
            ctx.fillText(this.currentVictoryQuote, CONFIG.CANVAS_WIDTH / 2, 65);
            
            // Difficulty badge
            const diffSettings = DIFFICULTY_SETTINGS[this.stats.difficulty || this.currentDifficulty];
            ctx.font = '12px "Press Start 2P"';
            ctx.fillStyle = this.getDifficultyColor(this.stats.difficulty || this.currentDifficulty);
            ctx.fillText(diffSettings.name + ' MODE', CONFIG.CANVAS_WIDTH / 2, 90);
        }
        
        // Stats panel
        if (this.victoryPhase >= 2) {
            const panelX = (CONFIG.CANVAS_WIDTH - 320) / 2;
            const panelY = 105;
            
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
        // Pick a random Star Wars game over quote
        this.currentGameOverQuote = this.gameOverQuotes[Math.floor(Math.random() * this.gameOverQuotes.length)];
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
            ctx.fillText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, 55);
            
            // Star Wars quote
            ctx.fillStyle = COLORS.YELLOW;
            ctx.font = '9px "Press Start 2P"';
            ctx.fillText(this.currentGameOverQuote, CONFIG.CANVAS_WIDTH / 2, 85);
            
            // Subtitle
            ctx.fillStyle = COLORS.GRAY;
            ctx.font = '10px "Press Start 2P"';
            ctx.fillText('The dark side has claimed your ship...', CONFIG.CANVAS_WIDTH / 2, 110);
        }
        
        // Stats panel
        if (this.gameOverPhase >= 1) {
            const panelX = (CONFIG.CANVAS_WIDTH - 320) / 2;
            const panelY = 130;
            
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
