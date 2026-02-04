// Time Loop Invaders - Main Game Controller

const Game = {
    canvas: null,
    ctx: null,
    
    // Timing
    lastTime: 0,
    deltaTime: 0,
    timeScale: 1,
    
    // Game state
    state: GAME_STATE.MENU,
    
    // Loop state
    loopTime: 0,
    elapsedTime: 0,
    score: 0,
    totalScore: 0, // Accumulated across all loops
    synergyHits: 0,
    totalSynergyHits: 0,
    deathCount: 0, // Deaths in current game session
    
    // Screen shake
    shakeTime: 0,
    shakeIntensity: 0,
    
    // Stats
    bestTime: null,
    
    async init() {
        console.log('Initializing Time Loop Invaders...');
        
        // Setup canvas
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set native resolution
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        // Scale for display
        this.canvas.style.width = `${CONFIG.CANVAS_WIDTH * CONFIG.SCALE}px`;
        this.canvas.style.height = `${CONFIG.CANVAS_HEIGHT * CONFIG.SCALE}px`;
        
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // Initialize subsystems
        Input.init();
        Audio.init();
        Starfield.init();
        HUD.init();
        Screens.init();
        
        // Hide loading
        document.getElementById('loading').style.display = 'none';
        
        // Load best time from storage
        try {
            this.bestTime = localStorage.getItem('timeLoopInvaders_bestTime');
        } catch (e) {
            this.bestTime = null;
        }
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
        
        console.log('Game initialized!');
    },
    
    gameLoop(currentTime) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent huge jumps
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        // Update
        this.update(this.deltaTime);
        
        // Render
        this.render();
        
        // Clear just-pressed states
        Input.update();
        
        // Continue loop
        requestAnimationFrame((t) => this.gameLoop(t));
    },
    
    update(dt) {
        // Update starfield always
        Starfield.update(dt, this.state === GAME_STATE.PLAYING ? 1 : 0.5);
        
        switch (this.state) {
            case GAME_STATE.MENU:
                this.updateMenu(dt);
                break;
                
            case GAME_STATE.PLAYING:
                this.updateGameplay(dt);
                break;
                
            case GAME_STATE.PAUSED:
                this.updatePaused(dt);
                break;
                
            case GAME_STATE.DEATH:
                this.updateDeath(dt);
                break;
                
            case GAME_STATE.VICTORY:
                this.updateVictory(dt);
                break;
                
            case GAME_STATE.GAME_OVER:
                this.updateGameOver(dt);
                break;
        }
        
        // Update screen shake
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
        }
    },
    
    render() {
        const ctx = this.ctx;
        
        // Clear
        ctx.fillStyle = COLORS.BACKGROUND;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Apply screen shake
        if (this.shakeTime > 0) {
            const shake = Utils.getShakeOffset(this.shakeIntensity);
            ctx.save();
            ctx.translate(shake.x, shake.y);
        }
        
        // Draw starfield (always)
        Starfield.draw(ctx);
        
        switch (this.state) {
            case GAME_STATE.MENU:
                Screens.drawMainMenu(ctx);
                break;
                
            case GAME_STATE.PLAYING:
            case GAME_STATE.PAUSED:
            case GAME_STATE.DEATH:
                this.renderGameplay(ctx);
                break;
                
            case GAME_STATE.VICTORY:
                Screens.drawVictory(ctx);
                break;
                
            case GAME_STATE.GAME_OVER:
                Screens.drawGameOver(ctx);
                break;
        }
        
        // Restore from shake
        if (this.shakeTime > 0) {
            ctx.restore();
        }
    },
    
    // === MENU STATE ===
    updateMenu(dt) {
        // Start menu music if not playing
        if (!Audio.musicPlaying) {
            Audio.startMusic('menu');
        }
        
        const selection = Screens.updateMainMenu(dt);
        
        if (selection === 'START GAME') {
            Screens.startTransition(() => {
                this.startGame();
            });
        }
    },
    
    // === GAMEPLAY STATE ===
    startGame() {
        this.state = GAME_STATE.PLAYING;
        this.loopTime = CONFIG.getLoopDuration();
        this.elapsedTime = 0;
        this.score = 0;
        this.totalScore = 0;
        this.synergyHits = 0;
        this.totalSynergyHits = 0;
        this.deathCount = 0;
        this.timeScale = 1;
        
        // Reset all game objects
        Player.init();
        Bullets.reset();
        Enemies.reset();
        PowerUps.reset();
        ParticleSystem.reset();
        Boss.reset();
        GhostSystem.reset();
        GhostSystem.clearRecordings(); // Fresh start
        
        // Start ghost recording
        GhostSystem.startRecording();
        
        // Spawn ghosts from previous recordings
        GhostSystem.spawnGhosts();
        
        // Start music (continues the Star Wars theme)
        Audio.startMusic('gameplay');
    },
    
    restartLoop() {
        this.state = GAME_STATE.PLAYING;
        this.loopTime = CONFIG.getLoopDuration();
        this.elapsedTime = 0;
        // Keep totalScore, add current score to it
        this.totalScore += this.score;
        this.totalSynergyHits += this.synergyHits;
        this.score = 0;
        this.synergyHits = 0;
        this.timeScale = 1;
        
        // Reset game objects but keep ghost recordings
        Player.init();
        Bullets.reset();
        Enemies.reset();
        PowerUps.reset();
        ParticleSystem.reset();
        Boss.reset();
        GhostSystem.reset();
        
        // Start new recording
        GhostSystem.startRecording();
        
        // Spawn ghosts from recordings
        GhostSystem.spawnGhosts();
        
        // Music continues playing
        Audio.startMusic('gameplay');
    },
    
    updateGameplay(dt) {
        // Check for pause
        if (Input.pause) {
            this.state = GAME_STATE.PAUSED;
            Screens.pauseSelected = 0;
            return;
        }
        
        // Check for manual restart
        if (Input.restart) {
            this.playerDeath();
            return;
        }
        
        // Slow-mo time scale
        const targetTimeScale = Player.slowMoActive ? CONFIG.SLOWMO_FACTOR : 1;
        this.timeScale = Utils.lerp(this.timeScale, targetTimeScale, dt * 10);
        
        const scaledDt = dt * this.timeScale;
        
        // Update timer
        this.loopTime -= dt; // Timer always runs at normal speed
        this.elapsedTime += dt;
        
        // Timer sound when low
        if (this.loopTime <= 10 && this.loopTime > 0) {
            const prevSecond = Math.ceil(this.loopTime + dt);
            const currentSecond = Math.ceil(this.loopTime);
            if (prevSecond !== currentSecond) {
                Audio.play('timerTick');
            }
        }
        
        // Spawn boss at 10 seconds remaining
        if (this.loopTime <= CONFIG.BOSS_SPAWN_TIME && !Boss.active) {
            Boss.spawn();
            Enemies.destroyAll();
            HUD.flashWarning();
            
            // Switch to boss music
            Audio.startMusic('boss');
        }
        
        // Time ran out
        if (this.loopTime <= 0 && !Boss.active) {
            this.playerDeath();
            return;
        }
        
        // Update player
        Player.update(scaledDt, this.timeScale);
        
        // Record player state for ghost
        if (Player.alive) {
            GhostSystem.recordFrame(Player.getState(), dt);
        }
        
        // Update ghosts
        GhostSystem.update(scaledDt, this.elapsedTime, Player.ghostBoost);
        
        // Update enemies
        if (!Boss.active) {
            Enemies.update(scaledDt, Player.x + Player.width / 2, Player.y, this.elapsedTime);
        }
        
        // Update boss
        Boss.update(scaledDt, Player.x + Player.width / 2, Player.y);
        
        // Update bullets
        Bullets.update(scaledDt);
        
        // Update power-ups
        PowerUps.update(scaledDt);
        
        // Update particles
        ParticleSystem.update(scaledDt);
        
        // Update HUD
        HUD.update(dt);
        
        // Handle bomb
        if (Input.bomb && Player.useBomb()) {
            this.triggerBomb();
        }
        
        // Check collisions
        this.checkCollisions();
    },
    
    checkCollisions() {
        const playerRect = {
            x: Player.x,
            y: Player.y,
            width: Player.width,
            height: Player.height
        };
        
        // Player bullets vs enemies
        for (let i = Bullets.playerBullets.length - 1; i >= 0; i--) {
            const bullet = Bullets.playerBullets[i];
            
            // Check vs regular enemies
            for (let j = Enemies.list.length - 1; j >= 0; j--) {
                const enemy = Enemies.list[j];
                
                if (Utils.rectCollision(bullet, enemy)) {
                    bullet.alive = false;
                    
                    // Check for synergy (ghost bullet hit same enemy this frame)
                    const isSynergy = bullet.isGhost ? false : this.checkSynergyHit(enemy);
                    const damage = (bullet.isGhost && Player.ghostBoost) ? 2 : 1;
                    
                    if (enemy.hit(isSynergy ? damage * 2 : damage)) {
                        // Enemy destroyed
                        this.score += enemy.points * (isSynergy ? 2 : 1);
                        PowerUps.spawn(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        
                        if (isSynergy) {
                            this.synergyHits++;
                            Audio.play('synergy');
                        }
                    }
                    break;
                }
            }
            
            // Check vs boss
            if (Boss.active && Boss.alive && bullet.alive) {
                const bossRect = { x: Boss.x, y: Boss.y, width: Boss.width, height: Boss.height };
                
                if (Utils.rectCollision(bullet, bossRect)) {
                    bullet.alive = false;
                    const isSynergy = bullet.isGhost ? false : this.checkSynergyHitBoss();
                    const damage = (bullet.isGhost && Player.ghostBoost) ? 2 : 1;
                    
                    if (Boss.hit(isSynergy ? damage * 2 : damage, isSynergy)) {
                        // Boss destroyed - VICTORY!
                        this.score += CONFIG.BOSS_POINTS;
                        this.triggerVictory();
                        return;
                    }
                    
                    if (isSynergy) {
                        this.synergyHits++;
                    }
                }
            }
        }
        
        // Enemy bullets vs player
        if (Player.alive && !Player.invulnerable) {
            for (let i = Bullets.enemyBullets.length - 1; i >= 0; i--) {
                const bullet = Bullets.enemyBullets[i];
                
                if (Utils.rectCollision(bullet, playerRect)) {
                    bullet.alive = false;
                    
                    if (Player.hit()) {
                        this.playerDeath();
                        return;
                    }
                }
            }
        }
        
        // Enemies vs player (collision)
        if (Player.alive && !Player.invulnerable) {
            for (const enemy of Enemies.list) {
                const enemyRect = { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
                
                if (Utils.rectCollision(playerRect, enemyRect)) {
                    if (Player.hit()) {
                        this.playerDeath();
                        return;
                    }
                }
            }
        }
        
        // Power-ups vs player
        for (let i = PowerUps.list.length - 1; i >= 0; i--) {
            const powerUp = PowerUps.list[i];
            const powerUpRect = { x: powerUp.x, y: powerUp.y, width: powerUp.width, height: powerUp.height };
            
            if (Utils.rectCollision(playerRect, powerUpRect)) {
                const collected = PowerUps.collect(i);
                
                if (collected.type === POWERUP_TYPES.TIME_SHARD) {
                    this.loopTime = Math.min(CONFIG.LOOP_DURATION, this.loopTime + 5);
                } else {
                    Player.collectPowerUp(collected.type);
                }
                
                // Flash effect
                ParticleSystem.emit(collected.x + 4, collected.y + 4, 8, {
                    color: collected.getColor(),
                    life: 0.3,
                    size: 2,
                });
            }
        }
    },
    
    checkSynergyHit(enemy) {
        // Check if a ghost bullet also hit this enemy recently
        // Simplified: check if ghost bullets are near the enemy
        for (const bullet of Bullets.playerBullets) {
            if (bullet.isGhost && Utils.distance(
                bullet.x, bullet.y,
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2
            ) < 15) {
                return true;
            }
        }
        return false;
    },
    
    checkSynergyHitBoss() {
        for (const bullet of Bullets.playerBullets) {
            if (bullet.isGhost && Utils.distance(
                bullet.x, bullet.y,
                Boss.x + Boss.width / 2, Boss.y + Boss.height / 2
            ) < 20) {
                return true;
            }
        }
        return false;
    },
    
    triggerBomb() {
        // Clear all enemies and bullets
        Enemies.destroyAll();
        Bullets.clearEnemyBullets();
        
        // Screen effect
        this.shake(0.3, 6);
        
        // Big flash
        ParticleSystem.emit(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, 50, {
            color: COLORS.WHITE,
            life: 0.5,
            size: 3,
            vx: 0,
            vy: 0,
        });
    },
    
    playerDeath() {
        // Save recording before death
        GhostSystem.saveRecording();
        
        this.deathCount++;
        this.shake(0.2, CONFIG.SCREEN_SHAKE_INTENSITY);
        
        // Check for game over (max deaths reached)
        const maxDeaths = CONFIG.getMaxDeaths();
        if (this.deathCount >= maxDeaths) {
            this.triggerGameOver();
            return;
        }
        
        // Start death sequence (will restart loop)
        this.state = GAME_STATE.DEATH;
        Screens.startDeath(this.loopTime, this.score, this.deathCount, maxDeaths);
    },
    
    triggerGameOver() {
        this.state = GAME_STATE.GAME_OVER;
        
        // Calculate final stats
        this.totalScore += this.score;
        this.totalSynergyHits += this.synergyHits;
        
        Audio.pauseMusic();
        Audio.play('death');
        this.shake(0.3, 6);
        
        Screens.startGameOver(
            this.totalScore,
            this.deathCount,
            GhostSystem.ghostCount,
            this.totalSynergyHits
        );
    },
    
    triggerVictory() {
        this.state = GAME_STATE.VICTORY;
        
        // Stop music and play victory fanfare
        Audio.stopMusic();
        Audio.play('victory');
        this.shake(0.5, 8);
        
        // Save best time
        const finalTime = this.loopTime;
        if (!this.bestTime || finalTime > parseFloat(this.bestTime)) {
            this.bestTime = finalTime.toFixed(2);
            try {
                localStorage.setItem('timeLoopInvaders_bestTime', this.bestTime);
            } catch (e) {}
        }
        
        Screens.startVictory(
            this.loopTime,
            this.score,
            GhostSystem.ghostCount,
            this.synergyHits
        );
        
        // Clear ghost recordings for fresh start
        GhostSystem.clearRecordings();
    },
    
    renderGameplay(ctx) {
        // Draw ghosts
        GhostSystem.draw(ctx);
        
        // Draw enemies
        Enemies.draw(ctx);
        
        // Draw boss
        Boss.draw(ctx);
        
        // Draw power-ups
        PowerUps.draw(ctx);
        
        // Draw bullets
        Bullets.draw(ctx);
        
        // Draw player
        Player.draw(ctx);
        
        // Draw particles
        ParticleSystem.draw(ctx);
        
        // Draw boss health bar
        Boss.drawHealthBar(ctx);
        
        // Draw HUD
        HUD.draw(ctx, {
            timeRemaining: Math.max(0, this.loopTime),
            score: this.score,
            ghostCount: GhostSystem.ghostCount,
            slowMoMeter: Player.slowMoMeter,
            bombs: Player.bombs,
            activePowerUp: Player.activePowerUp,
            powerUpTimer: Player.powerUpTimer,
            bossActive: Boss.active,
            deathCount: this.deathCount,
            maxDeaths: CONFIG.getMaxDeaths(),
        });
        
        // Slow-mo vignette
        if (Player.slowMoActive) {
            HUD.drawVignette(ctx, 0.4);
        }
        
        // Draw pause overlay
        if (this.state === GAME_STATE.PAUSED) {
            Screens.drawPauseMenu(ctx);
        }
        
        // Draw death overlay
        if (this.state === GAME_STATE.DEATH) {
            Screens.drawDeath(ctx);
        }
    },
    
    // === PAUSE STATE ===
    updatePaused(dt) {
        const selection = Screens.updatePauseMenu(dt);
        
        switch (selection) {
            case 'RESUME':
                this.state = GAME_STATE.PLAYING;
                break;
            case 'RESTART LOOP':
                this.playerDeath();
                break;
            case 'QUIT TO MENU':
                this.state = GAME_STATE.MENU;
                GhostSystem.clearRecordings();
                Audio.startMusic('menu');
                break;
        }
    },
    
    // === DEATH STATE ===
    updateDeath(dt) {
        const complete = Screens.updateDeath(dt);
        
        if (complete) {
            this.restartLoop();
        }
    },
    
    // === VICTORY STATE ===
    updateVictory(dt) {
        const selection = Screens.updateVictory(dt);
        
        if (selection === 'PLAY AGAIN') {
            this.startGame();
        } else if (selection === 'MAIN MENU') {
            this.state = GAME_STATE.MENU;
            Audio.startMusic('menu');
        }
    },
    
    // === GAME OVER STATE ===
    updateGameOver(dt) {
        const selection = Screens.updateGameOver(dt);
        
        if (selection === 'TRY AGAIN') {
            this.startGame();
        } else if (selection === 'MAIN MENU') {
            this.state = GAME_STATE.MENU;
            GhostSystem.clearRecordings();
            Audio.startMusic('menu');
        }
    },
    
    // === UTILITIES ===
    shake(duration, intensity) {
        this.shakeTime = duration;
        this.shakeIntensity = intensity;
    },
};

// Start the game when page loads
window.addEventListener('load', () => {
    Game.init();
});
