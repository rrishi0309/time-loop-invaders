// Time Loop Invaders - Parallax Starfield Background

class Star {
    constructor(layer) {
        this.layer = layer;
        this.reset();
        this.y = Utils.random(0, CONFIG.CANVAS_HEIGHT);
    }
    
    reset() {
        this.x = Utils.random(0, CONFIG.CANVAS_WIDTH);
        this.y = -2;
        this.speed = (this.layer + 1) * 8 + Utils.random(-2, 2);
        this.size = this.layer === 2 ? 2 : 1;
        this.brightness = 0.3 + this.layer * 0.25 + Utils.random(0, 0.2);
    }
    
    update(dt, speedMultiplier = 1) {
        this.y += this.speed * dt * speedMultiplier;
        
        if (this.y > CONFIG.CANVAS_HEIGHT + 2) {
            this.reset();
        }
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.brightness;
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

class Nebula {
    constructor() {
        this.reset();
        this.y = Utils.random(0, CONFIG.CANVAS_HEIGHT);
    }
    
    reset() {
        this.x = Utils.random(20, CONFIG.CANVAS_WIDTH - 20);
        this.y = -40;
        this.width = Utils.random(40, 80);
        this.height = Utils.random(30, 60);
        this.color = Utils.randomItem(['#1A0A2E', '#0A1A2E', '#2E0A1A']);
        this.speed = 3;
    }
    
    update(dt) {
        this.y += this.speed * dt;
        
        if (this.y > CONFIG.CANVAS_HEIGHT + 60) {
            this.reset();
        }
    }
    
    draw(ctx) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.color;
        
        // Draw soft blob
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        
        for (let i = 3; i >= 1; i--) {
            ctx.globalAlpha = 0.1 * i;
            ctx.beginPath();
            ctx.ellipse(cx, cy, this.width / 2 * (i / 3), this.height / 2 * (i / 3), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
}

const Starfield = {
    stars: [],
    nebulae: [],
    
    init() {
        this.stars = [];
        this.nebulae = [];
        
        // Create stars in 3 layers (back to front)
        for (let layer = 0; layer < 3; layer++) {
            const count = 15 + layer * 10;
            for (let i = 0; i < count; i++) {
                this.stars.push(new Star(layer));
            }
        }
        
        // Create nebulae
        for (let i = 0; i < 2; i++) {
            this.nebulae.push(new Nebula());
        }
    },
    
    update(dt, speedMultiplier = 1) {
        this.stars.forEach(star => star.update(dt, speedMultiplier));
        this.nebulae.forEach(nebula => nebula.update(dt * speedMultiplier));
    },
    
    draw(ctx) {
        // Draw nebulae first (background)
        this.nebulae.forEach(nebula => nebula.draw(ctx));
        
        // Draw stars by layer
        for (let layer = 0; layer < 3; layer++) {
            this.stars
                .filter(s => s.layer === layer)
                .forEach(star => star.draw(ctx));
        }
    },
};
