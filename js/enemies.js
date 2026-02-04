// Time Loop Invaders - Enemy System

class Enemy {
    constructor(x, y, type = ENEMY_TYPES.BASIC) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        
        // Get difficulty settings
        const diff = CONFIG.getDifficulty();
        const speedMult = diff.enemySpeedMult;
        const fireRateMult = diff.enemyFireRateMult;
        
        // Set properties based on type
        switch (type) {
            case ENEMY_TYPES.BASIC:
                this.width = 12;
                this.height = 10;
                this.health = 1;
                this.points = CONFIG.ENEMY_POINTS;
                this.speed = CONFIG.ENEMY_SPEED * speedMult;
                this.fireRate = (2 + Math.random() * 2) * fireRateMult;
                break;
                
            case ENEMY_TYPES.ELITE:
                this.width = 14;
                this.height = 12;
                this.health = 3;
                this.points = CONFIG.ELITE_POINTS;
                this.speed = CONFIG.ENEMY_SPEED * 1.5 * speedMult;
                this.fireRate = 1.5 * fireRateMult;
                this.hasShield = true;
                break;
                
            case ENEMY_TYPES.MINIBOSS:
                this.width = 20;
                this.height = 16;
                this.health = 8;
                this.points = CONFIG.ELITE_POINTS * 2;
                this.speed = CONFIG.ENEMY_SPEED * 0.8 * speedMult;
                this.fireRate = 1 * fireRateMult;
                break;
        }
        
        this.fireTimer = Math.random() * this.fireRate;
        this.moveTimer = 0;
        this.moveDirection = Math.random() > 0.5 ? 1 : -1;
        this.eyeGlowTimer = 0;
        this.isGlowing = false;
    }
    
    update(dt, playerX, playerY) {
        if (!this.alive) return;
        
        // Movement patterns
        this.moveTimer += dt;
        
        switch (this.type) {
            case ENEMY_TYPES.BASIC:
                // Slow descent with slight side-to-side
                this.y += this.speed * dt;
                this.x += Math.sin(this.moveTimer * 2) * this.speed * 0.5 * dt;
                break;
                
            case ENEMY_TYPES.ELITE:
                // Zigzag movement
                this.y += this.speed * 0.5 * dt;
                if (this.moveTimer > 1) {
                    this.moveTimer = 0;
                    this.moveDirection *= -1;
                }
                this.x += this.moveDirection * this.speed * dt;
                break;
                
            case ENEMY_TYPES.MINIBOSS:
                // Slow descent, wider movement
                this.y += this.speed * dt;
                this.x += Math.sin(this.moveTimer) * this.speed * dt;
                break;
        }
        
        // Keep in bounds
        this.x = Utils.clamp(this.x, 4, CONFIG.CANVAS_WIDTH - this.width - 4);
        
        // Firing
        this.fireTimer -= dt;
        
        // Eye glow before shooting
        if (this.fireTimer <= 0.2 && !this.isGlowing) {
            this.isGlowing = true;
            this.eyeGlowTimer = 0.2;
        }
        
        if (this.eyeGlowTimer > 0) {
            this.eyeGlowTimer -= dt;
        } else {
            this.isGlowing = false;
        }
        
        if (this.fireTimer <= 0) {
            this.fire(playerX, playerY);
            this.fireTimer = this.fireRate + Math.random() * 0.5;
        }
        
        // Check if off screen
        if (this.y > CONFIG.CANVAS_HEIGHT + 20) {
            this.alive = false;
        }
    }
    
    fire(playerX, playerY) {
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y + this.height;
        
        if (this.type === ENEMY_TYPES.MINIBOSS) {
            // Triple shot
            Bullets.spawnEnemyDown(bulletX - 6, bulletY);
            Bullets.spawnEnemyDown(bulletX, bulletY);
            Bullets.spawnEnemyDown(bulletX + 6, bulletY);
        } else {
            Bullets.spawnEnemy(bulletX, bulletY, playerX, playerY);
        }
        
        Audio.play('enemyShoot');
    }
    
    hit(damage = 1) {
        if (this.hasShield && this.health > 1) {
            this.hasShield = false;
            this.health -= damage;
            Audio.play('enemyHit');
            ParticleSystem.emit(this.x + this.width / 2, this.y + this.height / 2, 5, {
                color: COLORS.CYAN,
                life: 0.2,
            });
            return false;
        }
        
        this.health -= damage;
        
        if (this.health <= 0) {
            this.alive = false;
            Audio.play('enemyDeath');
            ParticleSystem.explode(this.x + this.width / 2, this.y + this.height / 2, {
                size: this.type === ENEMY_TYPES.MINIBOSS ? 24 : 16,
                color: COLORS.MAGENTA,
            });
            return true; // Destroyed
        } else {
            Audio.play('enemyHit');
            ParticleSystem.emit(this.x + this.width / 2, this.y + this.height / 2, 3, {
                color: COLORS.WHITE,
                life: 0.15,
            });
            return false;
        }
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        
        ctx.fillStyle = COLORS.MAGENTA;
        
        switch (this.type) {
            case ENEMY_TYPES.BASIC:
                this.drawBasic(ctx, x, y);
                break;
            case ENEMY_TYPES.ELITE:
                this.drawElite(ctx, x, y);
                break;
            case ENEMY_TYPES.MINIBOSS:
                this.drawMiniboss(ctx, x, y);
                break;
        }
        
        // Draw shield if present
        if (this.hasShield) {
            ctx.strokeStyle = COLORS.CYAN;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(x + this.width / 2, y + this.height / 2, this.width / 2 + 2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    drawBasic(ctx, x, y) {
        // Insectoid body - scaled 2x
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.fillRect(x + 6, y, 12, 6);
        ctx.fillRect(x + 2, y + 6, 20, 8);
        ctx.fillRect(x + 4, y + 14, 16, 6);
        
        // Wings
        ctx.fillRect(x, y + 6, 4, 6);
        ctx.fillRect(x + 20, y + 6, 4, 6);
        
        // Eyes
        ctx.fillStyle = this.isGlowing ? COLORS.WHITE : COLORS.YELLOW;
        ctx.fillRect(x + 6, y + 8, 4, 4);
        ctx.fillRect(x + 14, y + 8, 4, 4);
    }
    
    drawElite(ctx, x, y) {
        // Armored body - scaled 2x
        ctx.fillStyle = '#AA00AA';
        ctx.fillRect(x + 8, y, 12, 8);
        ctx.fillRect(x + 2, y + 8, 24, 10);
        ctx.fillRect(x + 6, y + 18, 16, 6);
        
        // Armor plates
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.fillRect(x + 4, y + 8, 6, 8);
        ctx.fillRect(x + 18, y + 8, 6, 8);
        
        // Wings
        ctx.fillRect(x, y + 10, 4, 8);
        ctx.fillRect(x + 24, y + 10, 4, 8);
        
        // Eyes
        ctx.fillStyle = this.isGlowing ? COLORS.WHITE : COLORS.RED;
        ctx.fillRect(x + 8, y + 10, 4, 4);
        ctx.fillRect(x + 16, y + 10, 4, 4);
    }
    
    drawMiniboss(ctx, x, y) {
        // Large body - scaled 2x
        ctx.fillStyle = '#660066';
        ctx.fillRect(x + 12, y, 16, 8);
        ctx.fillRect(x + 4, y + 8, 32, 16);
        ctx.fillRect(x + 8, y + 24, 24, 8);
        
        // Armor
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.fillRect(x + 8, y + 8, 8, 12);
        ctx.fillRect(x + 24, y + 8, 8, 12);
        
        // Core
        ctx.fillStyle = COLORS.CYAN;
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
        ctx.fillRect(x + 16, y + 12, 8, 8);
        ctx.globalAlpha = 1;
        
        // Wings
        ctx.fillStyle = COLORS.MAGENTA;
        ctx.fillRect(x, y + 12, 6, 12);
        ctx.fillRect(x + 34, y + 12, 6, 12);
        
        // Eyes
        ctx.fillStyle = this.isGlowing ? COLORS.WHITE : COLORS.RED;
        ctx.fillRect(x + 10, y + 10, 6, 4);
        ctx.fillRect(x + 24, y + 10, 6, 4);
    }
}

const Enemies = {
    list: [],
    waveIndex: 0,
    
    reset() {
        this.list = [];
        this.waveIndex = 0;
    },
    
    spawnWave(wave) {
        const { type, count, formation, y } = wave;
        
        switch (formation) {
            case 'line':
                this.spawnLine(type, count, y);
                break;
            case 'v':
                this.spawnV(type, count, y);
                break;
            case 'grid':
                this.spawnGrid(type, count, y);
                break;
        }
        
        if (type === ENEMY_TYPES.ELITE) {
            Audio.play('eliteWarning');
        }
    },
    
    spawnLine(type, count, y) {
        const spacing = CONFIG.CANVAS_WIDTH / (count + 1);
        for (let i = 0; i < count; i++) {
            const x = spacing * (i + 1) - CONFIG.ENEMY_WIDTH / 2;
            this.list.push(new Enemy(x, y, type));
        }
    },
    
    spawnV(type, count, y) {
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const spacing = 40;
        
        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / 2);
            const side = i % 2 === 0 ? -1 : 1;
            const x = centerX + side * (row + 1) * spacing - CONFIG.ENEMY_WIDTH / 2;
            const yOffset = row * 24;
            this.list.push(new Enemy(x, y + yOffset, type));
        }
    },
    
    spawnGrid(type, count, y) {
        const cols = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / cols);
        const spacingX = CONFIG.CANVAS_WIDTH / (cols + 1);
        const spacingY = 30;
        
        let spawned = 0;
        for (let row = 0; row < rows && spawned < count; row++) {
            for (let col = 0; col < cols && spawned < count; col++) {
                const x = spacingX * (col + 1) - CONFIG.ENEMY_WIDTH / 2;
                this.list.push(new Enemy(x, y + row * spacingY, type));
                spawned++;
            }
        }
    },
    
    update(dt, playerX, playerY, elapsedTime) {
        // Check for wave spawns
        while (this.waveIndex < WAVES.length && WAVES[this.waveIndex].time <= elapsedTime) {
            this.spawnWave(WAVES[this.waveIndex]);
            this.waveIndex++;
        }
        
        // Update enemies
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].update(dt, playerX, playerY);
            if (!this.list[i].alive) {
                this.list.splice(i, 1);
            }
        }
    },
    
    draw(ctx) {
        this.list.forEach(e => e.draw(ctx));
    },
    
    destroyAll() {
        this.list.forEach(e => {
            e.alive = false;
            ParticleSystem.explode(e.x + e.width / 2, e.y + e.height / 2, {
                size: 12,
                color: COLORS.MAGENTA,
            });
        });
        this.list = [];
    },
};
