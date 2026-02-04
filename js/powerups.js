// Time Loop Invaders - Power-up System

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = CONFIG.POWERUP_SIZE;
        this.height = CONFIG.POWERUP_SIZE;
        this.alive = true;
        this.bobTimer = Math.random() * Math.PI * 2;
        this.sparkleTimer = 0;
    }
    
    update(dt) {
        this.y += CONFIG.POWERUP_FALL_SPEED * dt;
        this.bobTimer += dt * 4;
        this.sparkleTimer += dt;
        
        // Spawn sparkles
        if (this.sparkleTimer > 0.15) {
            this.sparkleTimer = 0;
            ParticleSystem.sparkle(
                this.x + this.width / 2 + Utils.random(-3, 3),
                this.y + this.height / 2,
                COLORS.WHITE
            );
        }
        
        // Off screen
        if (this.y > CONFIG.CANVAS_HEIGHT + 10) {
            this.alive = false;
        }
    }
    
    draw(ctx) {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y + Math.sin(this.bobTimer) * 4);
        
        // White outline
        ctx.strokeStyle = COLORS.WHITE;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, this.width + 4, this.height + 4);
        ctx.lineWidth = 1;
        
        // Background
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(x, y, this.width, this.height);
        
        // Icon based on type - scaled 2x
        ctx.fillStyle = this.getColor();
        
        switch (this.type) {
            case POWERUP_TYPES.RAPID_FIRE:
                // Fast bullet icon
                ctx.fillRect(x + 6, y + 2, 4, 6);
                ctx.fillRect(x + 6, y + 10, 4, 4);
                break;
                
            case POWERUP_TYPES.WIDE_SHOT:
                // Triple spread icon
                ctx.fillRect(x + 2, y + 6, 4, 6);
                ctx.fillRect(x + 6, y + 4, 4, 8);
                ctx.fillRect(x + 10, y + 6, 4, 6);
                break;
                
            case POWERUP_TYPES.TIME_SHARD:
                // Clock/time icon
                ctx.fillRect(x + 4, y + 4, 8, 8);
                ctx.fillStyle = COLORS.PANEL;
                ctx.fillRect(x + 6, y + 6, 4, 2);
                ctx.fillRect(x + 8, y + 6, 2, 4);
                break;
                
            case POWERUP_TYPES.GHOST_BOOST:
                // Ghost icon
                ctx.globalAlpha = 0.7;
                ctx.fillRect(x + 4, y + 2, 8, 10);
                ctx.fillRect(x + 2, y + 10, 4, 4);
                ctx.fillRect(x + 10, y + 10, 4, 4);
                ctx.globalAlpha = 1;
                break;
                
            case POWERUP_TYPES.SHIELD:
                // Shield icon
                ctx.beginPath();
                ctx.arc(x + 8, y + 8, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = COLORS.PANEL;
                ctx.beginPath();
                ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
    
    getColor() {
        switch (this.type) {
            case POWERUP_TYPES.RAPID_FIRE: return COLORS.YELLOW;
            case POWERUP_TYPES.WIDE_SHOT: return COLORS.CYAN;
            case POWERUP_TYPES.TIME_SHARD: return COLORS.GOLD;
            case POWERUP_TYPES.GHOST_BOOST: return COLORS.WHITE;
            case POWERUP_TYPES.SHIELD: return COLORS.GREEN;
            default: return COLORS.WHITE;
        }
    }
    
    getName() {
        switch (this.type) {
            case POWERUP_TYPES.RAPID_FIRE: return 'RAPID';
            case POWERUP_TYPES.WIDE_SHOT: return 'WIDE';
            case POWERUP_TYPES.TIME_SHARD: return '+5s';
            case POWERUP_TYPES.GHOST_BOOST: return 'GHOST';
            case POWERUP_TYPES.SHIELD: return 'SHIELD';
            default: return '???';
        }
    }
}

const PowerUps = {
    list: [],
    
    reset() {
        this.list = [];
    },
    
    spawn(x, y) {
        // Random chance to spawn (adjusted by difficulty)
        if (Math.random() > CONFIG.getPowerupDropChance()) return;
        
        // Random type (weighted)
        const types = [
            POWERUP_TYPES.RAPID_FIRE,
            POWERUP_TYPES.RAPID_FIRE,
            POWERUP_TYPES.WIDE_SHOT,
            POWERUP_TYPES.WIDE_SHOT,
            POWERUP_TYPES.TIME_SHARD,
            POWERUP_TYPES.GHOST_BOOST,
            POWERUP_TYPES.SHIELD,
            POWERUP_TYPES.SHIELD,
        ];
        
        const type = Utils.randomItem(types);
        this.list.push(new PowerUp(x - CONFIG.POWERUP_SIZE / 2, y, type));
    },
    
    update(dt) {
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].update(dt);
            if (!this.list[i].alive) {
                this.list.splice(i, 1);
            }
        }
    },
    
    draw(ctx) {
        this.list.forEach(p => p.draw(ctx));
    },
    
    collect(index) {
        const powerUp = this.list[index];
        this.list.splice(index, 1);
        return powerUp;
    },
};
