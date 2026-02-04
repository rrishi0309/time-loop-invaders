// Time Loop Invaders - Constants & Configuration

// Difficulty presets
const DIFFICULTY = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    NIGHTMARE: 'nightmare',
};

const DIFFICULTY_SETTINGS = {
    [DIFFICULTY.EASY]: {
        name: 'PADAWAN',
        description: 'Relaxed gameplay',
        enemySpeedMult: 0.5,
        enemyFireRateMult: 2.0,  // Enemies fire less often
        enemyBulletSpeedMult: 0.5,
        bossHealthMult: 0.5,
        bossAttackRateMult: 1.8,
        powerupDropChance: 0.3,
        startingBombs: 3,
        maxGhosts: 7,
        loopDuration: 90,
        maxDeaths: 10,
    },
    [DIFFICULTY.NORMAL]: {
        name: 'JEDI KNIGHT',
        description: 'Balanced challenge',
        enemySpeedMult: 0.7,
        enemyFireRateMult: 1.4,
        enemyBulletSpeedMult: 0.7,
        bossHealthMult: 0.8,
        bossAttackRateMult: 1.3,
        powerupDropChance: 0.2,
        startingBombs: 2,
        maxGhosts: 6,
        loopDuration: 75,
        maxDeaths: 8,
    },
    [DIFFICULTY.HARD]: {
        name: 'JEDI MASTER',
        description: 'For skilled pilots',
        enemySpeedMult: 1.0,
        enemyFireRateMult: 1.0,
        enemyBulletSpeedMult: 1.0,
        bossHealthMult: 1.0,
        bossAttackRateMult: 1.0,
        powerupDropChance: 0.15,
        startingBombs: 1,
        maxGhosts: 5,
        loopDuration: 60,
        maxDeaths: 6,
    },
    [DIFFICULTY.NIGHTMARE]: {
        name: 'SITH LORD',
        description: 'Ultimate challenge',
        enemySpeedMult: 1.3,
        enemyFireRateMult: 0.7,
        enemyBulletSpeedMult: 1.2,
        bossHealthMult: 1.5,
        bossAttackRateMult: 0.7,
        powerupDropChance: 0.1,
        startingBombs: 1,
        maxGhosts: 4,
        loopDuration: 50,
        maxDeaths: 4,
    },
};

const CONFIG = {
    // Canvas dimensions (larger for better text readability)
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 360,
    SCALE: 2, // Scale up for display
    
    // Layout (doubled for new resolution)
    TOP_BAR_HEIGHT: 24,
    BOTTOM_BAR_HEIGHT: 24,
    PLAY_AREA_TOP: 24,
    PLAY_AREA_BOTTOM: 336,
    
    // Current difficulty (set by game)
    difficulty: DIFFICULTY.NORMAL,
    
    // Timing (base values)
    LOOP_DURATION: 60, // seconds
    BOSS_SPAWN_TIME: 10, // seconds remaining when boss spawns
    
    // Player (doubled for new resolution)
    PLAYER_SPEED: 160, // pixels per second
    PLAYER_WIDTH: 24,
    PLAYER_HEIGHT: 20,
    PLAYER_FIRE_RATE: 0.15, // seconds between shots
    PLAYER_RAPID_FIRE_RATE: 0.075,
    
    // Bullets (doubled for new resolution)
    BULLET_SPEED: 400,
    BULLET_WIDTH: 4,
    BULLET_HEIGHT: 8,
    ENEMY_BULLET_SPEED: 200,
    ENEMY_BULLET_SIZE: 8,
    
    // Enemies (doubled for new resolution)
    ENEMY_WIDTH: 24,
    ENEMY_HEIGHT: 20,
    ENEMY_SPEED: 40,
    ENEMY_POINTS: 100,
    ELITE_POINTS: 250,
    
    // Boss (doubled for new resolution)
    BOSS_WIDTH: 64,
    BOSS_HEIGHT: 64,
    BOSS_HEALTH: 50,
    BOSS_POINTS: 5000,
    
    // Ghosts
    MAX_GHOSTS: 5,
    GHOST_OPACITY: 0.4,
    
    // Power-ups (doubled for new resolution)
    POWERUP_DURATION: 8, // seconds
    POWERUP_DROP_CHANCE: 0.15,
    POWERUP_SIZE: 16,
    POWERUP_FALL_SPEED: 60,
    
    // Slow-mo
    SLOWMO_MAX: 100,
    SLOWMO_DRAIN_RATE: 25, // per second
    SLOWMO_RECHARGE_RATE: 10, // per second
    SLOWMO_FACTOR: 0.3, // time multiplier when active
    
    // Bombs (base value)
    STARTING_BOMBS: 1,
    
    // Visual effects (doubled for new resolution)
    SCREEN_SHAKE_DURATION: 0.2,
    SCREEN_SHAKE_INTENSITY: 8,
    
    // Get difficulty-adjusted values
    getDifficulty() {
        return DIFFICULTY_SETTINGS[this.difficulty];
    },
    
    getEnemySpeed() {
        return this.ENEMY_SPEED * this.getDifficulty().enemySpeedMult;
    },
    
    getEnemyBulletSpeed() {
        return this.ENEMY_BULLET_SPEED * this.getDifficulty().enemyBulletSpeedMult;
    },
    
    getBossHealth() {
        return Math.floor(this.BOSS_HEALTH * this.getDifficulty().bossHealthMult);
    },
    
    getPowerupDropChance() {
        return this.getDifficulty().powerupDropChance;
    },
    
    getStartingBombs() {
        return this.getDifficulty().startingBombs;
    },
    
    getMaxGhosts() {
        return this.getDifficulty().maxGhosts;
    },
    
    getLoopDuration() {
        return this.getDifficulty().loopDuration;
    },
    
    getMaxDeaths() {
        return this.getDifficulty().maxDeaths;
    },
};

// Color palette
const COLORS = {
    BACKGROUND: '#0D0D1A',
    PANEL: '#1A1A2E',
    CYAN: '#00FFFF',
    MAGENTA: '#FF00FF',
    WHITE: '#FFFFFF',
    YELLOW: '#FFE066',
    RED: '#FF4444',
    GREEN: '#44FF44',
    GRAY: '#666677',
    GOLD: '#FFD700',
    DARK_GRAY: '#333344',
};

// Game states
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    DEATH: 'death',
    VICTORY: 'victory',
    GAME_OVER: 'gameover',
    SETTINGS: 'settings',
};

// Power-up types
const POWERUP_TYPES = {
    RAPID_FIRE: 'rapid',
    WIDE_SHOT: 'wide',
    TIME_SHARD: 'time',
    GHOST_BOOST: 'ghost',
    SHIELD: 'shield',
};

// Enemy types
const ENEMY_TYPES = {
    BASIC: 'basic',
    ELITE: 'elite',
    MINIBOSS: 'miniboss',
};

// Wave definitions (Y positions doubled for new resolution)
const WAVES = [
    // Wave 1: 0:00-0:10 - Basic enemies, slow
    { time: 0, type: ENEMY_TYPES.BASIC, count: 5, formation: 'line', y: 60 },
    { time: 5, type: ENEMY_TYPES.BASIC, count: 6, formation: 'line', y: 50 },
    
    // Wave 2: 0:10-0:20
    { time: 10, type: ENEMY_TYPES.BASIC, count: 7, formation: 'v', y: 60 },
    { time: 15, type: ENEMY_TYPES.BASIC, count: 8, formation: 'line', y: 50 },
    
    // Wave 3: 0:20-0:30
    { time: 20, type: ENEMY_TYPES.BASIC, count: 8, formation: 'grid', y: 60 },
    { time: 25, type: ENEMY_TYPES.BASIC, count: 10, formation: 'line', y: 50 },
    
    // Wave 4: 0:30-0:45 - Elite enemies
    { time: 30, type: ENEMY_TYPES.ELITE, count: 3, formation: 'line', y: 70 },
    { time: 35, type: ENEMY_TYPES.BASIC, count: 6, formation: 'v', y: 50 },
    { time: 40, type: ENEMY_TYPES.ELITE, count: 4, formation: 'line', y: 60 },
    
    // Wave 5: 0:45-0:50 - Mini-boss squadron
    { time: 45, type: ENEMY_TYPES.MINIBOSS, count: 2, formation: 'line', y: 80 },
    { time: 47, type: ENEMY_TYPES.ELITE, count: 3, formation: 'v', y: 50 },
];
