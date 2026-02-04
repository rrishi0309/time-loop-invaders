// Time Loop Invaders - Bullet System

class Bullet {
    constructor(x, y, vx, vy, isPlayer = true, isGhost = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.isPlayer = isPlayer;
        this.isGhost = isGhost;
        this.alive = true;
        
        if (isPlayer) {
            this.width = CONFIG.BULLET_WIDTH;
            this.height = CONFIG.BULLET_HEIGHT;
        } else {
            this.width = CONFIG.ENEMY_BULLET_SIZE;
            this.height = CONFIG.ENEMY_BULLET_SIZE;
        }
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Check bounds
        if (this.y < CONFIG.TOP_BAR_HEIGHT - 10 || 
            this.y > CONFIG.CANVAS_HEIGHT + 10 ||
            this.x < -10 || 
            this.x > CONFIG.CANVAS_WIDTH + 10) {
            this.alive = false;
        }
    }
    
    draw(ctx) {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        
        if (this.isPlayer) {
            // Cyan rectangle bullet
            ctx.globalAlpha = this.isGhost ? 0.5 : 1;
            ctx.fillStyle = COLORS.CYAN;
            ctx.fillRect(x, y, this.width, this.height);
            
            // Glow effect (only for non-ghost)
            if (!this.isGhost) {
                ctx.globalAlpha = 0.3;
                ctx.fillRect(x - 1, y, this.width + 2, this.height);
            }
            ctx.globalAlpha = 1;
        } else {
            // Magenta diamond bullet
            ctx.fillStyle = COLORS.MAGENTA;
            ctx.save();
            ctx.translate(x + this.width / 2, y + this.height / 2);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-this.width / 2.8, -this.height / 2.8, this.width / 1.4, this.height / 1.4);
            ctx.restore();
            
            // Glow
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(x + this.width / 2, y + this.height / 2, this.width / 2 + 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

const Bullets = {
    playerBullets: [],
    enemyBullets: [],
    
    reset() {
        this.playerBullets = [];
        this.enemyBullets = [];
    },
    
    spawnPlayer(x, y, angleOffset = 0) {
        const vx = Math.sin(angleOffset) * CONFIG.BULLET_SPEED;
        const vy = -CONFIG.BULLET_SPEED * Math.cos(angleOffset);
        this.playerBullets.push(new Bullet(x, y, vx, vy, true, false));
    },
    
    spawnGhost(x, y, angleOffset = 0) {
        const vx = Math.sin(angleOffset) * CONFIG.BULLET_SPEED;
        const vy = -CONFIG.BULLET_SPEED * Math.cos(angleOffset);
        this.playerBullets.push(new Bullet(x, y, vx, vy, true, true));
    },
    
    spawnEnemy(x, y, targetX, targetY) {
        const angle = Math.atan2(targetY - y, targetX - x);
        const vx = Math.cos(angle) * CONFIG.ENEMY_BULLET_SPEED;
        const vy = Math.sin(angle) * CONFIG.ENEMY_BULLET_SPEED;
        this.enemyBullets.push(new Bullet(x, y, vx, vy, false, false));
    },
    
    spawnEnemyDown(x, y) {
        this.enemyBullets.push(new Bullet(x, y, 0, CONFIG.ENEMY_BULLET_SPEED, false, false));
    },
    
    update(dt) {
        // Update player bullets
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.playerBullets[i].update(dt);
            if (!this.playerBullets[i].alive) {
                this.playerBullets.splice(i, 1);
            }
        }
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].update(dt);
            if (!this.enemyBullets[i].alive) {
                this.enemyBullets.splice(i, 1);
            }
        }
    },
    
    draw(ctx) {
        this.playerBullets.forEach(b => b.draw(ctx));
        this.enemyBullets.forEach(b => b.draw(ctx));
    },
    
    // Clear all bullets (for bomb)
    clearEnemyBullets() {
        this.enemyBullets.forEach(b => {
            ParticleSystem.emit(b.x, b.y, 3, {
                color: COLORS.MAGENTA,
                life: 0.2,
                size: 2,
            });
        });
        this.enemyBullets = [];
    },
};
