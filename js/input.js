// Time Loop Invaders - Input Handler

const Input = {
    keys: {},
    keysJustPressed: {},
    keysJustReleased: {},
    
    init() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            
            // Prevent default for game keys
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyE', 'KeyR', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysJustReleased[e.code] = true;
        });
        
        // Handle focus loss
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    },
    
    // Clear just pressed/released states (call at end of frame)
    update() {
        this.keysJustPressed = {};
        this.keysJustReleased = {};
    },
    
    // Check if key is currently held
    isHeld(key) {
        return this.keys[key] === true;
    },
    
    // Check if key was just pressed this frame
    isPressed(key) {
        return this.keysJustPressed[key] === true;
    },
    
    // Check if key was just released this frame
    isReleased(key) {
        return this.keysJustReleased[key] === true;
    },
    
    // Movement helpers
    get moveLeft() {
        return this.isHeld('KeyA') || this.isHeld('ArrowLeft');
    },
    
    get moveRight() {
        return this.isHeld('KeyD') || this.isHeld('ArrowRight');
    },
    
    get fire() {
        return this.isHeld('Space');
    },
    
    get firePressed() {
        return this.isPressed('Space');
    },
    
    get slowMo() {
        return this.isHeld('ShiftLeft') || this.isHeld('ShiftRight');
    },
    
    get bomb() {
        return this.isPressed('KeyE');
    },
    
    get restart() {
        return this.isPressed('KeyR');
    },
    
    get pause() {
        return this.isPressed('Escape');
    },
    
    get confirm() {
        return this.isPressed('Enter') || this.isPressed('Space');
    },
    
    get menuUp() {
        return this.isPressed('ArrowUp') || this.isPressed('KeyW');
    },
    
    get menuDown() {
        return this.isPressed('ArrowDown') || this.isPressed('KeyS');
    },
    
    get menuLeft() {
        return this.isPressed('ArrowLeft') || this.isPressed('KeyA');
    },
    
    get menuRight() {
        return this.isPressed('ArrowRight') || this.isPressed('KeyD');
    },
};
