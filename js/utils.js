// Time Loop Invaders - Utility Functions

const Utils = {
    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Check rectangle collision
    rectCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },
    
    // Distance between two points
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    
    // Random number between min and max
    random(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Random item from array
    randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // Format time as MM:SS
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Format number with commas
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    // Ease out quad
    easeOutQuad(t) {
        return t * (2 - t);
    },
    
    // Ease in out quad
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    
    // Create chromatic aberration effect offsets
    chromaticAberration(ctx, draw, offsetX = 1, offsetY = 0) {
        // Red channel
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.3;
        ctx.save();
        ctx.translate(-offsetX, offsetY);
        ctx.fillStyle = '#FF0000';
        draw();
        ctx.restore();
        
        // Blue channel
        ctx.save();
        ctx.translate(offsetX, -offsetY);
        ctx.fillStyle = '#0000FF';
        draw();
        ctx.restore();
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    },
    
    // Screen shake offset
    getShakeOffset(intensity) {
        return {
            x: Utils.random(-intensity, intensity),
            y: Utils.random(-intensity, intensity)
        };
    },
};
