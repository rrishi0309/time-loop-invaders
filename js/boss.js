// Time Loop Invaders - Loop Boss

const Boss = {
    x: 0,
    y: 0,
    width: CONFIG.BOSS_WIDTH,
    height: CONFIG.BOSS_HEIGHT,
    
    active: false,
    alive: false,
    health: 0,
    maxHealth: CONFIG.BOSS_HEALTH,
    
    // Animation
    pulseTimer: 0,
    rotationAngle: 0,
    hitFlash: 0,
    
    // Attack patterns
    attackTimer: 0,
    attackPattern: 0,
    
    // Movement
    moveTimer: 0,
    targetX: 0,
    
    spawn() {
        this.active = true;
        this.alive = true;
        this.maxHealth = CONFIG.getBossHealth();
        this.health = this.maxHealth;
        this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
        this.y = -this.height;
        this.targetX = this.x;
        this.attackTimer = 1;
        this.attackPattern = 0;
        this.pulseTimer = 0;
        this.rotationAngle = 0;
        this.hitFlash = 0;
        this.moveTimer = 0;
        this.attackRate = 0.8 * CONFIG.getDifficulty().bossAttackRateMult;
        
        Audio.play('bossSpawn');
    },
    
    reset() {
        this.active = false;
        this.alive = false;
    },
    
    update(dt, playerX, playerY) {
        if (!this.active || !this.alive) return;
        
        // Entry animation
        if (this.y < 25) {
            this.y += 30 * dt;
            return;
        }
        
        // Animation timers
        this.pulseTimer += dt * 3;
        this.rotationAngle += dt * 0.5;
        
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }
        
        // Movement
        this.moveTimer += dt;
        if (this.moveTimer > 2) {
            this.moveTimer = 0;
            this.targetX = Utils.random(20, CONFIG.CANVAS_WIDTH - this.width - 20);
        }
        
        this.x = Utils.lerp(this.x, this.targetX, dt * 2);
        
        // Attack patterns
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this.attack(playerX, playerY);
            this.attackTimer = this.attackRate || 0.8;
            this.attackPattern = (this.attackPattern + 1) % 3;
        }
    },
    
    attack(playerX, playerY) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        
        switch (this.attackPattern) {
            case 0:
                // Spread shot
                for (let i = -2; i <= 2; i++) {
                    const angle = Math.PI / 2 + i * 0.2;
                    Bullets.enemyBullets.push({
                        x: cx,
                        y: cy,
                        vx: Math.cos(angle) * CONFIG.ENEMY_BULLET_SPEED,
                        vy: Math.sin(angle) * CONFIG.ENEMY_BULLET_SPEED,
                        width: CONFIG.ENEMY_BULLET_SIZE,
                        height: CONFIG.ENEMY_BULLET_SIZE,
                        isPlayer: false,
                        alive: true,
                        update: function(dt) {
                            this.x += this.vx * dt;
                            this.y += this.vy * dt;
                            if (this.y > CONFIG.CANVAS_HEIGHT + 10 || this.x < -10 || this.x > CONFIG.CANVAS_WIDTH + 10) {
                                this.alive = false;
                            }
                        },
                        draw: function(ctx) {
                            ctx.fillStyle = COLORS.MAGENTA;
                            ctx.save();
                            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                            ctx.rotate(Math.PI / 4);
                            ctx.fillRect(-this.width / 2.8, -this.height / 2.8, this.width / 1.4, this.height / 1.4);
                            ctx.restore();
                        }
                    });
                }
                break;
                
            case 1:
                // Aimed shot
                Bullets.spawnEnemy(cx, cy, playerX, playerY);
                Bullets.spawnEnemy(cx - 10, cy, playerX, playerY);
                Bullets.spawnEnemy(cx + 10, cy, playerX, playerY);
                break;
                
            case 2:
                // Circle burst
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    Bullets.enemyBullets.push({
                        x: cx,
                        y: cy,
                        vx: Math.cos(angle) * CONFIG.ENEMY_BULLET_SPEED * 0.8,
                        vy: Math.sin(angle) * CONFIG.ENEMY_BULLET_SPEED * 0.8,
                        width: CONFIG.ENEMY_BULLET_SIZE,
                        height: CONFIG.ENEMY_BULLET_SIZE,
                        isPlayer: false,
                        alive: true,
                        update: function(dt) {
                            this.x += this.vx * dt;
                            this.y += this.vy * dt;
                            if (this.y > CONFIG.CANVAS_HEIGHT + 10 || this.y < -10 || this.x < -10 || this.x > CONFIG.CANVAS_WIDTH + 10) {
                                this.alive = false;
                            }
                        },
                        draw: function(ctx) {
                            ctx.fillStyle = COLORS.MAGENTA;
                            ctx.save();
                            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                            ctx.rotate(Math.PI / 4);
                            ctx.fillRect(-this.width / 2.8, -this.height / 2.8, this.width / 1.4, this.height / 1.4);
                            ctx.restore();
                        }
                    });
                }
                break;
        }
        
        Audio.play('enemyShoot');
    },
    
    hit(damage = 1, isSynergy = false) {
        if (!this.alive) return false;
        
        this.health -= damage;
        this.hitFlash = 0.1;
        
        Audio.play('bossHit');
        
        if (isSynergy) {
            Audio.play('synergy');
        }
        
        ParticleSystem.emit(
            this.x + this.width / 2 + Utils.random(-10, 10),
            this.y + this.height / 2 + Utils.random(-10, 10),
            5,
            { color: COLORS.WHITE, life: 0.2 }
        );
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    },
    
    die() {
        this.alive = false;
        
        // Big explosion sequence
        Audio.play('bossDeath');
        
        // Multiple explosions
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                ParticleSystem.explode(
                    this.x + this.width / 2 + Utils.random(-15, 15),
                    this.y + this.height / 2 + Utils.random(-15, 15),
                    { size: 20, particleCount: 12, color: COLORS.MAGENTA }
                );
            }, i * 50);
        }
        
        // Final big explosion
        setTimeout(() => {
            ParticleSystem.explode(
                this.x + this.width / 2,
                this.y + this.height / 2,
                { size: 40, particleCount: 30, color: COLORS.WHITE }
            );
        }, 400);
    },
    
    draw(ctx) {
        if (!this.active || !this.alive) return;
        
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        
        // Hit flash
        if (this.hitFlash > 0) {
            ctx.fillStyle = COLORS.WHITE;
        } else {
            ctx.fillStyle = '#440044';
        }
        
        // Main body - scaled 2x
        ctx.fillRect(x + 16, y + 8, 32, 48);
        ctx.fillRect(x + 8, y + 16, 48, 32);
        
        // Outer shell
        ctx.fillStyle = this.hitFlash > 0 ? COLORS.WHITE : COLORS.MAGENTA;
        ctx.fillRect(x + 20, y, 24, 8);
        ctx.fillRect(x + 20, y + 56, 24, 8);
        ctx.fillRect(x, y + 20, 8, 24);
        ctx.fillRect(x + 56, y + 20, 8, 24);
        
        // Rotating shield segments
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.rotate(this.rotationAngle);
        
        ctx.fillStyle = COLORS.CYAN;
        ctx.globalAlpha = 0.6;
        
        // Shield pieces
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.fillRect(28, -4, 12, 8);
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Pulsing core
        const pulseSize = 16 + Math.sin(this.pulseTimer) * 4;
        ctx.fillStyle = COLORS.CYAN;
        ctx.globalAlpha = 0.8 + Math.sin(this.pulseTimer) * 0.2;
        ctx.fillRect(
            x + this.width / 2 - pulseSize / 2,
            y + this.height / 2 - pulseSize / 2,
            pulseSize,
            pulseSize
        );
        ctx.globalAlpha = 1;
        
        // Eyes
        ctx.fillStyle = this.hitFlash > 0 ? COLORS.WHITE : COLORS.RED;
        ctx.fillRect(x + 20, y + 24, 8, 8);
        ctx.fillRect(x + 36, y + 24, 8, 8);
    },
    
    drawHealthBar(ctx) {
        if (!this.active || !this.alive) return;
        
        const barWidth = 240;
        const barHeight = 12;
        const x = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
        const y = CONFIG.TOP_BAR_HEIGHT + 8;
        
        // Label
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('LOOP GUARDIAN', CONFIG.CANVAS_WIDTH / 2, y - 4);
        
        // Background
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(x - 4, y - 4, barWidth + 8, barHeight + 8);
        
        // Border
        ctx.strokeStyle = COLORS.CYAN;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 4, y - 4, barWidth + 8, barHeight + 8);
        ctx.lineWidth = 1;
        
        // Health fill
        const healthPercent = this.health / this.maxHealth;
        let fillColor = COLORS.GREEN;
        if (healthPercent < 0.5) fillColor = COLORS.YELLOW;
        if (healthPercent < 0.25) fillColor = COLORS.RED;
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, barWidth * healthPercent, 4);
    },
    
    get healthPercent() {
        return this.health / this.maxHealth;
    },
};
