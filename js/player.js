// Time Loop Invaders - Player Ship

const Player = {
    x: 0,
    y: 0,
    width: CONFIG.PLAYER_WIDTH,
    height: CONFIG.PLAYER_HEIGHT,
    speed: CONFIG.PLAYER_SPEED,
    
    // State
    alive: true,
    invulnerable: false,
    invulnerableTime: 0,
    
    // Firing
    fireTimer: 0,
    fireRate: CONFIG.PLAYER_FIRE_RATE,
    wideShot: false,
    
    // Power-ups
    hasShield: false,
    ghostBoost: false,
    activePowerUp: null,
    powerUpTimer: 0,
    
    // Slow-mo
    slowMoMeter: CONFIG.SLOWMO_MAX,
    slowMoActive: false,
    
    // Bombs
    bombs: CONFIG.STARTING_BOMBS,
    
    // Movement tracking for ghost recording
    moveDirection: 0, // -1, 0, 1
    isFiring: false,
    
    init() {
        this.reset();
    },
    
    reset() {
        this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CONFIG.PLAY_AREA_BOTTOM - this.height - 16;
        this.alive = true;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.fireTimer = 0;
        this.fireRate = CONFIG.PLAYER_FIRE_RATE;
        this.wideShot = false;
        this.hasShield = false;
        this.ghostBoost = false;
        this.activePowerUp = null;
        this.powerUpTimer = 0;
        this.slowMoMeter = CONFIG.SLOWMO_MAX;
        this.slowMoActive = false;
        this.bombs = CONFIG.getStartingBombs();
        this.moveDirection = 0;
        this.isFiring = false;
    },
    
    update(dt, timeScale = 1) {
        if (!this.alive) return;
        
        const effectiveDt = dt * timeScale;
        
        // Invulnerability
        if (this.invulnerable) {
            this.invulnerableTime -= dt;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Movement
        this.moveDirection = 0;
        if (Input.moveLeft) {
            this.x -= this.speed * effectiveDt;
            this.moveDirection = -1;
        }
        if (Input.moveRight) {
            this.x += this.speed * effectiveDt;
            this.moveDirection = 1;
        }
        
        // Clamp to play area
        this.x = Utils.clamp(this.x, 4, CONFIG.CANVAS_WIDTH - this.width - 4);
        
        // Firing
        this.fireTimer -= effectiveDt;
        this.isFiring = false;
        
        if (Input.fire && this.fireTimer <= 0) {
            this.fire();
            this.fireTimer = this.fireRate;
            this.isFiring = true;
        }
        
        // Slow-mo
        if (Input.slowMo && this.slowMoMeter > 0) {
            this.slowMoActive = true;
            this.slowMoMeter -= CONFIG.SLOWMO_DRAIN_RATE * dt;
            this.slowMoMeter = Math.max(0, this.slowMoMeter);
        } else {
            this.slowMoActive = false;
            this.slowMoMeter += CONFIG.SLOWMO_RECHARGE_RATE * dt;
            this.slowMoMeter = Math.min(CONFIG.SLOWMO_MAX, this.slowMoMeter);
        }
        
        // Power-up timer
        if (this.activePowerUp) {
            this.powerUpTimer -= dt;
            if (this.powerUpTimer <= 0) {
                this.deactivatePowerUp();
            }
        }
    },
    
    fire() {
        const bulletX = this.x + this.width / 2 - CONFIG.BULLET_WIDTH / 2;
        const bulletY = this.y - CONFIG.BULLET_HEIGHT;
        
        if (this.wideShot) {
            // 3-bullet spread
            Bullets.spawnPlayer(bulletX - 6, bulletY, -0.2);
            Bullets.spawnPlayer(bulletX, bulletY, 0);
            Bullets.spawnPlayer(bulletX + 6, bulletY, 0.2);
        } else {
            Bullets.spawnPlayer(bulletX, bulletY, 0);
        }
        
        Audio.play('shoot');
    },
    
    hit() {
        if (this.invulnerable) return false;
        
        if (this.hasShield) {
            this.hasShield = false;
            this.invulnerable = true;
            this.invulnerableTime = 0.5;
            Audio.play('shieldHit');
            ParticleSystem.emit(this.x + this.width / 2, this.y + this.height / 2, 10, {
                color: COLORS.CYAN,
                life: 0.3,
            });
            return false;
        }
        
        this.alive = false;
        Audio.play('death');
        ParticleSystem.explode(this.x + this.width / 2, this.y + this.height / 2, {
            size: 20,
            particleCount: 15,
            color: COLORS.CYAN,
        });
        return true;
    },
    
    collectPowerUp(type) {
        Audio.play('powerup');
        
        switch (type) {
            case POWERUP_TYPES.RAPID_FIRE:
                this.activePowerUp = type;
                this.powerUpTimer = CONFIG.POWERUP_DURATION;
                this.fireRate = CONFIG.PLAYER_RAPID_FIRE_RATE;
                break;
                
            case POWERUP_TYPES.WIDE_SHOT:
                this.activePowerUp = type;
                this.powerUpTimer = CONFIG.POWERUP_DURATION;
                this.wideShot = true;
                break;
                
            case POWERUP_TYPES.TIME_SHARD:
                // Handled by game (adds time)
                break;
                
            case POWERUP_TYPES.GHOST_BOOST:
                this.activePowerUp = type;
                this.powerUpTimer = 999; // Rest of loop
                this.ghostBoost = true;
                break;
                
            case POWERUP_TYPES.SHIELD:
                this.hasShield = true;
                break;
        }
    },
    
    deactivatePowerUp() {
        if (this.activePowerUp === POWERUP_TYPES.RAPID_FIRE) {
            this.fireRate = CONFIG.PLAYER_FIRE_RATE;
        } else if (this.activePowerUp === POWERUP_TYPES.WIDE_SHOT) {
            this.wideShot = false;
        } else if (this.activePowerUp === POWERUP_TYPES.GHOST_BOOST) {
            this.ghostBoost = false;
        }
        this.activePowerUp = null;
        this.powerUpTimer = 0;
    },
    
    useBomb() {
        if (this.bombs <= 0) return false;
        
        this.bombs--;
        Audio.play('bomb');
        return true;
    },
    
    draw(ctx) {
        if (!this.alive) return;
        
        // Blink when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
            return;
        }
        
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        
        // Draw ship body (angular design) - scaled 2x
        ctx.fillStyle = COLORS.CYAN;
        
        // Main body
        ctx.fillRect(x + 8, y + 4, 8, 16);
        
        // Wings
        ctx.fillRect(x, y + 10, 8, 8);
        ctx.fillRect(x + 16, y + 10, 8, 8);
        
        // Nose
        ctx.fillRect(x + 10, y, 4, 4);
        
        // Thruster glow (when moving or always subtle)
        const thrusterIntensity = this.moveDirection !== 0 ? 1 : 0.5;
        ctx.globalAlpha = thrusterIntensity;
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.fillRect(x + 10, y + 18, 4, 4);
        if (this.moveDirection !== 0) {
            ctx.fillRect(x + 10, y + 20, 4, 2);
        }
        ctx.globalAlpha = 1;
        
        // Shield visual
        if (this.hasShield) {
            ctx.strokeStyle = COLORS.CYAN;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.2;
            ctx.beginPath();
            ctx.arc(x + this.width / 2, y + this.height / 2, this.width / 2 + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
        }
    },
    
    // Get current state for ghost recording
    getState() {
        return {
            x: this.x,
            y: this.y,
            moveDirection: this.moveDirection,
            isFiring: this.isFiring,
            wideShot: this.wideShot,
        };
    },
};
