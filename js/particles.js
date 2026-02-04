// Time Loop Invaders - Particle System

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || Utils.random(-30, 30);
        this.vy = options.vy || Utils.random(-30, 30);
        this.life = options.life || 0.5;
        this.maxLife = this.life;
        this.size = options.size || 2;
        this.color = options.color || COLORS.WHITE;
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 0.98;
        this.shrink = options.shrink !== false;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += this.gravity * dt;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.life -= dt;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const size = this.shrink ? this.size * alpha : this.size;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.floor(this.x - size / 2),
            Math.floor(this.y - size / 2),
            Math.ceil(size),
            Math.ceil(size)
        );
        ctx.globalAlpha = 1;
    }
    
    get isDead() {
        return this.life <= 0;
    }
}

class Explosion {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.frameTime = 0;
        this.frameDuration = options.frameDuration || 0.05;
        this.maxFrames = options.frames || 4;
        this.size = options.size || 32; // Doubled
        this.colors = options.colors || [COLORS.WHITE, COLORS.YELLOW, '#FFA500', COLORS.RED];
    }
    
    update(dt) {
        this.frameTime += dt;
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.frame++;
        }
    }
    
    draw(ctx) {
        if (this.frame >= this.maxFrames) return;
        
        const progress = this.frame / this.maxFrames;
        const size = this.size * (0.5 + progress * 0.5);
        const color = this.colors[Math.min(this.frame, this.colors.length - 1)];
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = color;
        
        // Draw explosion shape
        const cx = Math.floor(this.x);
        const cy = Math.floor(this.y);
        const r = Math.floor(size / 2);
        
        // Center
        ctx.fillRect(cx - r/2, cy - r/2, r, r);
        
        // Arms
        const armLength = r * (1 - progress * 0.5);
        ctx.fillRect(cx - armLength, cy - 1, armLength * 2, 2);
        ctx.fillRect(cx - 1, cy - armLength, 2, armLength * 2);
        
        // Diagonal pixels
        const diagDist = Math.floor(r * 0.7);
        ctx.fillRect(cx - diagDist, cy - diagDist, 2, 2);
        ctx.fillRect(cx + diagDist - 2, cy - diagDist, 2, 2);
        ctx.fillRect(cx - diagDist, cy + diagDist - 2, 2, 2);
        ctx.fillRect(cx + diagDist - 2, cy + diagDist - 2, 2, 2);
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    get isDead() {
        return this.frame >= this.maxFrames;
    }
}

const ParticleSystem = {
    particles: [],
    explosions: [],
    
    reset() {
        this.particles = [];
        this.explosions = [];
    },
    
    emit(x, y, count, options = {}) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, {
                ...options,
                vx: options.vx !== undefined ? options.vx : Utils.random(-50, 50),
                vy: options.vy !== undefined ? options.vy : Utils.random(-50, 50),
            }));
        }
    },
    
    explode(x, y, options = {}) {
        this.explosions.push(new Explosion(x, y, options));
        
        // Also emit particles
        const count = options.particleCount || 8;
        const speed = options.particleSpeed || 60;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed + Utils.random(-10, 10),
                vy: Math.sin(angle) * speed + Utils.random(-10, 10),
                color: options.color || COLORS.YELLOW,
                life: 0.3,
                size: 2,
            }));
        }
    },
    
    sparkle(x, y, color = COLORS.WHITE) {
        this.particles.push(new Particle(x, y, {
            vx: Utils.random(-20, 20),
            vy: Utils.random(-40, -20),
            color: color,
            life: 0.4,
            size: 1,
            gravity: 50,
        }));
    },
    
    update(dt) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].isDead) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(dt);
            if (this.explosions[i].isDead) {
                this.explosions.splice(i, 1);
            }
        }
    },
    
    draw(ctx) {
        this.explosions.forEach(e => e.draw(ctx));
        this.particles.forEach(p => p.draw(ctx));
    },
};
