// Time Loop Invaders - Ghost Recording & Playback System

class GhostRecording {
    constructor() {
        this.frames = [];
        this.duration = 0;
    }
    
    record(state, dt) {
        this.frames.push({
            time: this.duration,
            x: state.x,
            y: state.y,
            moveDirection: state.moveDirection,
            isFiring: state.isFiring,
            wideShot: state.wideShot,
        });
        this.duration += dt;
    }
    
    getFrameAt(time) {
        if (this.frames.length === 0) return null;
        
        // Find closest frame
        for (let i = this.frames.length - 1; i >= 0; i--) {
            if (this.frames[i].time <= time) {
                return this.frames[i];
            }
        }
        
        return this.frames[0];
    }
}

class Ghost {
    constructor(recording, index) {
        this.recording = recording;
        this.index = index;
        this.x = 0;
        this.y = 0;
        this.moveDirection = 0;
        this.fireTimer = 0;
        this.alive = true;
        this.wideShot = false;
        
        this.width = CONFIG.PLAYER_WIDTH;
        this.height = CONFIG.PLAYER_HEIGHT;
    }
    
    update(dt, elapsedTime, ghostBoostActive) {
        const frame = this.recording.getFrameAt(elapsedTime);
        
        if (!frame) {
            this.alive = false;
            return;
        }
        
        this.x = frame.x;
        this.y = frame.y;
        this.moveDirection = frame.moveDirection;
        this.wideShot = frame.wideShot;
        
        // Fire timer for visual feedback
        this.fireTimer -= dt;
        
        // Fire if the recorded frame was firing
        if (frame.isFiring && this.fireTimer <= 0) {
            this.fire(ghostBoostActive);
            this.fireTimer = CONFIG.PLAYER_FIRE_RATE;
        }
        
        // Check if recording has ended
        if (elapsedTime > this.recording.duration) {
            this.alive = false;
        }
    }
    
    fire(ghostBoostActive) {
        const bulletX = this.x + this.width / 2 - CONFIG.BULLET_WIDTH / 2;
        const bulletY = this.y - CONFIG.BULLET_HEIGHT;
        
        if (this.wideShot) {
            Bullets.spawnGhost(bulletX - 6, bulletY, -0.2);
            Bullets.spawnGhost(bulletX, bulletY, 0);
            Bullets.spawnGhost(bulletX + 6, bulletY, 0.2);
        } else {
            Bullets.spawnGhost(bulletX, bulletY, 0);
        }
        
        // Ghost bullet sound (quieter)
        Audio.play('ghostShoot');
    }
    
    draw(ctx) {
        if (!this.alive) return;
        
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);
        
        ctx.globalAlpha = CONFIG.GHOST_OPACITY;
        
        // Chromatic aberration effect
        // Red offset
        ctx.fillStyle = '#FF000044';
        this.drawShip(ctx, x - 1, y);
        
        // Blue offset
        ctx.fillStyle = '#0000FF44';
        this.drawShip(ctx, x + 1, y);
        
        // Main ghost ship
        ctx.fillStyle = COLORS.CYAN;
        this.drawShip(ctx, x, y);
        
        // Trail effect
        ctx.globalAlpha = CONFIG.GHOST_OPACITY * 0.3;
        this.drawShip(ctx, x, y + 2);
        ctx.globalAlpha = CONFIG.GHOST_OPACITY * 0.15;
        this.drawShip(ctx, x, y + 4);
        
        ctx.globalAlpha = 1;
    }
    
    drawShip(ctx, x, y) {
        // Main body - scaled 2x
        ctx.fillRect(x + 8, y + 4, 8, 16);
        
        // Wings
        ctx.fillRect(x, y + 10, 8, 8);
        ctx.fillRect(x + 16, y + 10, 8, 8);
        
        // Nose
        ctx.fillRect(x + 10, y, 4, 4);
    }
}

const GhostSystem = {
    recordings: [],
    activeGhosts: [],
    currentRecording: null,
    
    reset() {
        this.activeGhosts = [];
        this.currentRecording = null;
    },
    
    startRecording() {
        this.currentRecording = new GhostRecording();
    },
    
    recordFrame(playerState, dt) {
        if (this.currentRecording) {
            this.currentRecording.record(playerState, dt);
        }
    },
    
    saveRecording() {
        if (this.currentRecording && this.currentRecording.frames.length > 10) {
            // Keep only the last MAX_GHOSTS recordings (adjusted by difficulty)
            const maxGhosts = CONFIG.getMaxGhosts();
            if (this.recordings.length >= maxGhosts) {
                this.recordings.shift();
            }
            this.recordings.push(this.currentRecording);
        }
        this.currentRecording = null;
    },
    
    spawnGhosts() {
        this.activeGhosts = [];
        
        for (let i = 0; i < this.recordings.length; i++) {
            this.activeGhosts.push(new Ghost(this.recordings[i], i));
            
            // Play ghost spawn sound with slight delay
            setTimeout(() => {
                Audio.play('ghostSpawn');
            }, i * 100);
        }
    },
    
    update(dt, elapsedTime, ghostBoostActive) {
        for (let i = this.activeGhosts.length - 1; i >= 0; i--) {
            this.activeGhosts[i].update(dt, elapsedTime, ghostBoostActive);
            if (!this.activeGhosts[i].alive) {
                this.activeGhosts.splice(i, 1);
            }
        }
    },
    
    draw(ctx) {
        this.activeGhosts.forEach(g => g.draw(ctx));
    },
    
    get ghostCount() {
        return this.recordings.length;
    },
    
    get activeGhostCount() {
        return this.activeGhosts.length;
    },
    
    clearRecordings() {
        this.recordings = [];
    },
};
