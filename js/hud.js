// Time Loop Invaders - HUD (Heads-Up Display)

const HUD = {
    displayScore: 0,
    targetScore: 0,
    scoreAnimationSpeed: 5000, // points per second
    
    // Warning flash
    warningFlash: false,
    warningTimer: 0,
    
    init() {
        this.displayScore = 0;
        this.targetScore = 0;
    },
    
    setScore(score) {
        this.targetScore = score;
    },
    
    flashWarning() {
        this.warningFlash = true;
        this.warningTimer = 1;
    },
    
    update(dt) {
        // Animate score
        if (this.displayScore < this.targetScore) {
            this.displayScore = Math.min(
                this.targetScore,
                this.displayScore + this.scoreAnimationSpeed * dt
            );
        }
        
        // Warning timer
        if (this.warningTimer > 0) {
            this.warningTimer -= dt;
            if (this.warningTimer <= 0) {
                this.warningFlash = false;
            }
        }
    },
    
    draw(ctx, gameState) {
        const {
            timeRemaining,
            score,
            ghostCount,
            slowMoMeter,
            bombs,
            activePowerUp,
            powerUpTimer,
            bossActive,
            deathCount,
            maxDeaths
        } = gameState;
        
        this.setScore(score);
        
        // === TOP BAR ===
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.TOP_BAR_HEIGHT);
        
        // Ghost counter (left)
        this.drawGhostCounter(ctx, ghostCount);
        
        // Timer (center)
        this.drawTimer(ctx, timeRemaining, bossActive);
        
        // Score (right)
        this.drawScore(ctx);
        
        // Lives/Attempts indicator (far right, small)
        this.drawLives(ctx, deathCount, maxDeaths);
        
        // === BOTTOM BAR ===
        ctx.fillStyle = COLORS.PANEL;
        ctx.fillRect(0, CONFIG.CANVAS_HEIGHT - CONFIG.BOTTOM_BAR_HEIGHT, CONFIG.CANVAS_WIDTH, CONFIG.BOTTOM_BAR_HEIGHT);
        
        // Power-up display (left)
        this.drawPowerUp(ctx, activePowerUp, powerUpTimer);
        
        // Slow-mo meter (center)
        this.drawSlowMoMeter(ctx, slowMoMeter);
        
        // Bomb counter (right)
        this.drawBombCounter(ctx, bombs);
        
        // Warning flash overlay
        if (this.warningFlash && Math.floor(this.warningTimer * 4) % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        }
    },
    
    drawGhostCounter(ctx, count) {
        const x = 8;
        const y = 4;
        
        // Ghost icon (simplified)
        ctx.fillStyle = COLORS.WHITE;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + 2, y + 2, 12, 10);
        ctx.fillRect(x, y + 10, 4, 4);
        ctx.fillRect(x + 12, y + 10, 4, 4);
        ctx.globalAlpha = 1;
        
        // Count
        ctx.fillStyle = COLORS.WHITE;
        ctx.font = '14px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(`x${count}`, x + 22, y + 14);
    },
    
    drawTimer(ctx, timeRemaining, bossActive) {
        const x = CONFIG.CANVAS_WIDTH / 2;
        const y = 4;
        
        // Determine color based on time
        let color = COLORS.WHITE;
        let pulse = false;
        
        if (timeRemaining <= 5) {
            color = COLORS.RED;
            pulse = true;
        } else if (timeRemaining <= 10) {
            color = COLORS.YELLOW;
            pulse = true;
        }
        
        // Boss phase border
        if (bossActive) {
            ctx.strokeStyle = COLORS.RED;
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 50, y - 2, 100, 20);
            ctx.lineWidth = 1;
        }
        
        // Timer text
        ctx.fillStyle = color;
        if (pulse && Math.floor(Date.now() / 250) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(Utils.formatTime(timeRemaining), x, y + 14);
        ctx.globalAlpha = 1;
        
        // Decorative arrows
        ctx.fillStyle = COLORS.GRAY;
        ctx.fillText('◀', x - 55, y + 14);
        ctx.fillText('▶', x + 55, y + 14);
    },
    
    drawScore(ctx) {
        const x = CONFIG.CANVAS_WIDTH - 8;
        const y = 4;
        
        // Star icon
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = COLORS.GOLD;
        ctx.textAlign = 'right';
        ctx.fillText('★', x - 90, y + 14);
        
        // Score
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillText(Utils.formatNumber(Math.floor(this.displayScore)), x, y + 14);
    },
    
    drawPowerUp(ctx, activePowerUp, timer) {
        const x = 8;
        const y = CONFIG.CANVAS_HEIGHT - CONFIG.BOTTOM_BAR_HEIGHT + 4;
        
        if (!activePowerUp) {
            ctx.fillStyle = COLORS.GRAY;
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText('—', x, y + 12);
            return;
        }
        
        // Power-up name
        let name = '';
        let color = COLORS.WHITE;
        
        switch (activePowerUp) {
            case POWERUP_TYPES.RAPID_FIRE:
                name = 'RAPID';
                color = COLORS.YELLOW;
                break;
            case POWERUP_TYPES.WIDE_SHOT:
                name = 'WIDE';
                color = COLORS.CYAN;
                break;
            case POWERUP_TYPES.GHOST_BOOST:
                name = 'GHOST';
                color = COLORS.WHITE;
                break;
        }
        
        ctx.fillStyle = color;
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(name, x, y + 12);
        
        // Duration pips
        const maxPips = 5;
        const pipsFilled = Math.ceil((timer / CONFIG.POWERUP_DURATION) * maxPips);
        const flash = timer <= 2 && Math.floor(Date.now() / 100) % 2 === 0;
        
        for (let i = 0; i < maxPips; i++) {
            ctx.fillStyle = i < pipsFilled ? (flash ? COLORS.WHITE : color) : COLORS.DARK_GRAY;
            ctx.fillRect(x + 70 + i * 8, y + 4, 6, 10);
        }
    },
    
    drawSlowMoMeter(ctx, meter) {
        const x = CONFIG.CANVAS_WIDTH / 2 - 80;
        const y = CONFIG.CANVAS_HEIGHT - CONFIG.BOTTOM_BAR_HEIGHT + 6;
        const width = 160;
        const height = 12;
        
        // Background
        ctx.fillStyle = COLORS.DARK_GRAY;
        ctx.fillRect(x, y, width, height);
        
        // Fill
        const percent = meter / CONFIG.SLOWMO_MAX;
        let color = COLORS.CYAN;
        
        if (percent < 0.3) {
            color = COLORS.YELLOW;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * percent, height);
        
        // Segments
        const segments = 10;
        for (let i = 1; i < segments; i++) {
            ctx.fillStyle = COLORS.PANEL;
            ctx.fillRect(x + (width / segments) * i - 1, y, 2, height);
        }
        
        // Border
        ctx.strokeStyle = COLORS.GRAY;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.lineWidth = 1;
    },
    
    drawBombCounter(ctx, bombs) {
        const x = CONFIG.CANVAS_WIDTH - 8;
        const y = CONFIG.CANVAS_HEIGHT - CONFIG.BOTTOM_BAR_HEIGHT + 4;
        
        // Bomb icon
        const iconX = x - 50;
        
        ctx.fillStyle = bombs > 0 ? COLORS.RED : COLORS.DARK_GRAY;
        
        // Simple bomb shape
        ctx.fillRect(iconX, y + 4, 16, 12);
        ctx.fillRect(iconX + 4, y, 8, 4);
        ctx.fillRect(iconX + 6, y - 2, 4, 2);
        
        // Fuse spark
        if (bombs > 0 && Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = COLORS.YELLOW;
            ctx.fillRect(iconX + 6, y - 4, 4, 4);
        }
        
        // Count
        ctx.fillStyle = bombs > 0 ? COLORS.WHITE : COLORS.GRAY;
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'right';
        ctx.fillText(`x${bombs}`, x, y + 12);
    },
    
    drawLives(ctx, deathCount = 0, maxDeaths = 6) {
        const livesLeft = maxDeaths - deathCount;
        const x = CONFIG.CANVAS_WIDTH - 130;
        const y = 6;
        
        // Color based on lives remaining
        let baseColor;
        if (livesLeft <= 2) {
            baseColor = COLORS.RED;
        } else if (livesLeft <= 4) {
            baseColor = COLORS.YELLOW;
        } else {
            baseColor = COLORS.GREEN;
        }
        
        // Draw lives as small squares
        for (let i = 0; i < Math.min(maxDeaths, 10); i++) {
            const lx = x + i * 10;
            if (i < livesLeft) {
                ctx.fillStyle = baseColor;
                ctx.fillRect(lx, y, 8, 8);
            } else {
                ctx.fillStyle = COLORS.DARK_GRAY;
                ctx.fillRect(lx, y, 8, 8);
            }
        }
    },
    
    // Draw vignette effect for tension
    drawVignette(ctx, intensity = 0.3) {
        const gradient = ctx.createRadialGradient(
            CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, CONFIG.CANVAS_WIDTH / 4,
            CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, CONFIG.CANVAS_WIDTH
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    },
};
