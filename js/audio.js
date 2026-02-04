// Time Loop Invaders - Audio System (Star Wars Styled Epic Music & SFX)

const Audio = {
    context: null,
    masterVolume: 0.7,
    sfxVolume: 1.0,
    musicVolume: 0.6,
    enabled: true,
    
    // Music state
    musicPlaying: false,
    currentMusic: null,
    musicNodes: [],
    musicInterval: null,
    musicPhase: 'menu', // menu, gameplay, intense, boss, victory
    
    // Audio elements for MP3 playback
    menuMusicElement: null,
    menuMusicLoaded: false,
    
    init() {
        // Preload menu music MP3
        this.preloadMenuMusic();
        
        // Create audio context and start music on first user interaction
        const startAudio = () => {
            this.initContext();
            // Try to start music after user interaction
            if (this.menuMusicElement) {
                this.menuMusicElement.play().catch(e => {
                    console.log('Music will start when game begins');
                });
            }
        };
        
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
    },
    
    preloadMenuMusic() {
        try {
            this.menuMusicElement = new window.Audio('assets/starwars-menu-song.mp3');
            this.menuMusicElement.loop = true;
            this.menuMusicElement.volume = this.musicVolume * this.masterVolume;
            this.menuMusicElement.preload = 'auto';
            
            this.menuMusicElement.addEventListener('canplaythrough', () => {
                this.menuMusicLoaded = true;
                console.log('Menu music loaded successfully');
            });
            
            this.menuMusicElement.addEventListener('loadeddata', () => {
                console.log('Menu music data loaded');
            });
            
            this.menuMusicElement.addEventListener('error', (e) => {
                console.warn('Could not load menu music:', e);
                this.menuMusicLoaded = false;
                this.menuMusicElement = null;
            });
            
            // Force load
            this.menuMusicElement.load();
        } catch (e) {
            console.warn('Error creating audio element:', e);
            this.menuMusicElement = null;
        }
    },
    
    initContext() {
        if (this.context) return;
        
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.context.destination);
        
        // Create separate gains for SFX and Music
        this.sfxGain = this.context.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.masterGain);
        
        this.musicGain = this.context.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.masterGain);
        
        // Add reverb for cinematic feel
        this.createReverb();
        
        console.log('Audio initialized - Star Wars Mode');
    },
    
    async createReverb() {
        // Create a simple convolution reverb
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * 1.5; // 1.5 second reverb
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverb = this.context.createConvolver();
        this.reverb.buffer = impulse;
        
        this.reverbGain = this.context.createGain();
        this.reverbGain.gain.value = 0.2;
        this.reverb.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
    },
    
    play(soundName) {
        if (!this.enabled) return;
        
        // Auto-initialize context if needed
        if (!this.context) {
            this.initContext();
        }
        if (!this.context) return;
        
        const volume = this.sfxVolume * this.masterVolume;
        
        switch (soundName) {
            // === PLAYER SOUNDS (Rebel/X-Wing style) ===
            case 'shoot':
                this.playLaserBlast(800, 400, 0.08, volume * 0.4);
                break;
                
            case 'ghostShoot':
                this.playLaserBlast(600, 300, 0.06, volume * 0.2);
                break;
                
            // === ENEMY SOUNDS (TIE Fighter style) ===
            case 'enemyShoot':
                this.playTIELaser(volume * 0.35);
                break;
                
            case 'enemyHit':
                this.playImpact(300, 0.1, volume * 0.4);
                break;
                
            case 'enemyDeath':
                this.playExplosion(0.2, volume * 0.5, 'small');
                break;
                
            // === PLAYER DEATH ===
            case 'death':
                this.playExplosion(0.4, volume * 0.6, 'large');
                this.playTone(300, 0.5, 'sawtooth', volume * 0.3, 0.01, 0.49, -200);
                break;
                
            // === POWER-UPS (Force/Jedi style) ===
            case 'powerup':
                this.playForcePowerUp(volume * 0.5);
                break;
                
            // === BOMB (Proton torpedo) ===
            case 'bomb':
                this.playProtonTorpedo(volume * 0.7);
                break;
                
            case 'shieldHit':
                this.playShieldImpact(volume * 0.4);
                break;
                
            // === GHOST SYSTEM ===
            case 'ghostSpawn':
                this.playForceGhost(volume * 0.3);
                break;
                
            case 'synergy':
                this.playSynergyChime(volume * 0.4);
                break;
                
            // === BOSS (Imperial/Vader style) ===
            case 'bossSpawn':
                this.playImperialMarch(volume * 0.5);
                break;
                
            case 'bossHit':
                this.playImpact(150, 0.12, volume * 0.5);
                this.playTone(100, 0.08, 'square', volume * 0.3, 0.01, 0.07);
                break;
                
            case 'bossDeath':
                this.playDeathStarExplosion(volume * 0.7);
                break;
                
            case 'eliteWarning':
                this.playWarningKlaxon(volume * 0.4);
                break;
                
            case 'rewind':
                this.playTimeRewind(volume * 0.5);
                break;
                
            // === MENU SOUNDS ===
            case 'menuNav':
                this.playMenuBeep(440, volume * 0.25);
                break;
                
            case 'menuConfirm':
                this.playMenuConfirm(volume * 0.35);
                break;
                
            case 'victory':
                this.playVictoryFanfare(volume * 0.5);
                break;
                
            case 'timerTick':
                this.playTone(800, 0.03, 'sine', volume * 0.15, 0.005, 0.025);
                break;
        }
    },
    
    // === STAR WARS STYLE SOUND EFFECTS ===
    
    playLaserBlast(startFreq, endFreq, duration, volume) {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(startFreq, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.context.currentTime + duration);
        
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        // Add a subtle "pew" click
        const click = this.context.createOscillator();
        const clickGain = this.context.createGain();
        click.type = 'square';
        click.frequency.value = startFreq * 1.5;
        clickGain.gain.setValueAtTime(volume * 0.3, this.context.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.02);
        click.connect(clickGain);
        clickGain.connect(this.sfxGain);
        
        osc.start();
        click.start();
        osc.stop(this.context.currentTime + duration);
        click.stop(this.context.currentTime + 0.02);
    },
    
    playTIELaser(volume) {
        if (!this.context) return;
        
        // TIE Fighter lasers have that distinctive screaming sound
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(180, this.context.currentTime);
        osc1.frequency.linearRampToValueAtTime(120, this.context.currentTime + 0.1);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(220, this.context.currentTime);
        osc2.frequency.linearRampToValueAtTime(140, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.context.currentTime + 0.1);
        osc2.stop(this.context.currentTime + 0.1);
    },
    
    playExplosion(duration, volume, size = 'medium') {
        if (!this.context) return;
        
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = size === 'large' ? 800 : size === 'small' ? 2000 : 1200;
        
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        if (this.reverb) gain.connect(this.reverb);
        
        // Add low rumble for larger explosions
        if (size === 'large') {
            const rumble = this.context.createOscillator();
            const rumbleGain = this.context.createGain();
            rumble.type = 'sine';
            rumble.frequency.setValueAtTime(60, this.context.currentTime);
            rumble.frequency.exponentialRampToValueAtTime(20, this.context.currentTime + duration);
            rumbleGain.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
            rumbleGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            rumble.connect(rumbleGain);
            rumbleGain.connect(this.sfxGain);
            rumble.start();
            rumble.stop(this.context.currentTime + duration);
        }
        
        noise.start();
        noise.stop(this.context.currentTime + duration);
    },
    
    playImpact(freq, duration, volume) {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.context.currentTime + duration);
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        // Add noise burst
        this.playNoise(duration * 0.5, volume * 0.3, 0.01, duration * 0.4);
        
        osc.start();
        osc.stop(this.context.currentTime + duration);
    },
    
    playForcePowerUp(volume) {
        if (!this.context) return;
        
        // Mystical ascending arpeggio (like the Force theme)
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0, this.context.currentTime);
                gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                if (this.reverb) gain.connect(this.reverb);
                
                osc.start();
                osc.stop(this.context.currentTime + 0.2);
            }, i * 50);
        });
    },
    
    playProtonTorpedo(volume) {
        if (!this.context) return;
        
        // Charge-up sound
        const charge = this.context.createOscillator();
        const chargeGain = this.context.createGain();
        charge.type = 'sawtooth';
        charge.frequency.setValueAtTime(100, this.context.currentTime);
        charge.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.3);
        chargeGain.gain.setValueAtTime(volume * 0.3, this.context.currentTime);
        chargeGain.gain.linearRampToValueAtTime(volume * 0.6, this.context.currentTime + 0.3);
        charge.connect(chargeGain);
        chargeGain.connect(this.sfxGain);
        charge.start();
        charge.stop(this.context.currentTime + 0.3);
        
        // Explosion after charge
        setTimeout(() => {
            this.playExplosion(0.5, volume, 'large');
        }, 300);
    },
    
    playShieldImpact(volume) {
        if (!this.context) return;
        
        // Electric crackle
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2000, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.context.currentTime + 0.1);
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        // High-pitched ting
        const ting = this.context.createOscillator();
        const tingGain = this.context.createGain();
        ting.type = 'sine';
        ting.frequency.value = 3000;
        tingGain.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
        tingGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
        ting.connect(tingGain);
        tingGain.connect(this.sfxGain);
        
        osc.start();
        ting.start();
        osc.stop(this.context.currentTime + 0.1);
        ting.stop(this.context.currentTime + 0.15);
    },
    
    playForceGhost(volume) {
        if (!this.context) return;
        
        // Ethereal whoosh with reversed reverb feel
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(400, this.context.currentTime + 0.3);
        
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 5;
        
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.4);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        if (this.reverb) gain.connect(this.reverb);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.4);
    },
    
    playSynergyChime(volume) {
        if (!this.context) return;
        
        // Harmonic power chord
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        freqs.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(volume / freqs.length, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            if (this.reverb) gain.connect(this.reverb);
            
            osc.start();
            osc.stop(this.context.currentTime + 0.3);
        });
    },
    
    playImperialMarch(volume) {
        if (!this.context) return;
        
        // Ominous low brass notes (Imperial March inspired)
        const notes = [
            { freq: 146.83, dur: 0.3 }, // D3
            { freq: 146.83, dur: 0.3 }, // D3
            { freq: 146.83, dur: 0.3 }, // D3
            { freq: 116.54, dur: 0.2 }, // Bb2
            { freq: 174.61, dur: 0.1 }, // F3
        ];
        
        let time = 0;
        notes.forEach((note) => {
            setTimeout(() => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                
                osc.type = 'sawtooth';
                osc.frequency.value = note.freq;
                
                gain.gain.setValueAtTime(volume, this.context.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + note.dur);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                if (this.reverb) gain.connect(this.reverb);
                
                osc.start();
                osc.stop(this.context.currentTime + note.dur);
            }, time * 1000);
            time += note.dur;
        });
    },
    
    playDeathStarExplosion(volume) {
        if (!this.context) return;
        
        // Multiple layered explosions
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                this.playExplosion(0.4 + i * 0.1, volume * (1 - i * 0.1), i < 3 ? 'medium' : 'large');
            }, i * 120);
        }
        
        // Final massive boom
        setTimeout(() => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, this.context.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.context.currentTime + 1);
            
            gain.gain.setValueAtTime(volume, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 1);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            if (this.reverb) gain.connect(this.reverb);
            
            osc.start();
            osc.stop(this.context.currentTime + 1);
        }, 600);
    },
    
    playWarningKlaxon(volume) {
        if (!this.context) return;
        
        // Two-tone alert
        [0, 150].forEach((delay) => {
            setTimeout(() => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                
                osc.type = 'square';
                osc.frequency.value = delay === 0 ? 880 : 660;
                
                gain.gain.setValueAtTime(volume, this.context.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.12);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start();
                osc.stop(this.context.currentTime + 0.12);
            }, delay);
        });
    },
    
    playTimeRewind(volume) {
        if (!this.context) return;
        
        // Descending pitch with flutter
        const osc = this.context.createOscillator();
        const lfo = this.context.createOscillator();
        const lfoGain = this.context.createGain();
        const gain = this.context.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.5);
        
        lfo.type = 'sine';
        lfo.frequency.value = 20;
        lfoGain.gain.value = 50;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        // Add noise for tape effect
        this.playNoise(0.5, volume * 0.4, 0.05, 0.45);
        
        osc.start();
        lfo.start();
        osc.stop(this.context.currentTime + 0.5);
        lfo.stop(this.context.currentTime + 0.5);
    },
    
    playMenuBeep(freq, volume) {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.context.currentTime + 0.05);
    },
    
    playMenuConfirm(volume) {
        if (!this.context) return;
        
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(volume, this.context.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start();
                osc.stop(this.context.currentTime + 0.1);
            }, i * 60);
        });
    },
    
    playVictoryFanfare(volume) {
        if (!this.context) return;
        
        // Triumphant Star Wars style fanfare
        const notes = [
            { freq: 392.00, dur: 0.15 }, // G4
            { freq: 392.00, dur: 0.15 }, // G4
            { freq: 392.00, dur: 0.15 }, // G4
            { freq: 311.13, dur: 0.4 },  // Eb4
            { freq: 466.16, dur: 0.1 },  // Bb4
            { freq: 392.00, dur: 0.15 }, // G4
            { freq: 311.13, dur: 0.4 },  // Eb4
            { freq: 466.16, dur: 0.1 },  // Bb4
            { freq: 392.00, dur: 0.6 },  // G4
        ];
        
        let time = 0;
        notes.forEach((note) => {
            setTimeout(() => {
                // Brass-like sound with multiple oscillators
                const oscs = [];
                const gains = [];
                
                [1, 2, 3, 4].forEach((harmonic) => {
                    const osc = this.context.createOscillator();
                    const gain = this.context.createGain();
                    
                    osc.type = harmonic === 1 ? 'sawtooth' : 'sine';
                    osc.frequency.value = note.freq * harmonic;
                    
                    const harmonicVol = volume / (harmonic * 2);
                    gain.gain.setValueAtTime(harmonicVol, this.context.currentTime);
                    gain.gain.setValueAtTime(harmonicVol, this.context.currentTime + note.dur * 0.7);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + note.dur);
                    
                    osc.connect(gain);
                    gain.connect(this.sfxGain);
                    if (this.reverb) gain.connect(this.reverb);
                    
                    oscs.push(osc);
                    gains.push(gain);
                });
                
                oscs.forEach(osc => {
                    osc.start();
                    osc.stop(this.context.currentTime + note.dur);
                });
            }, time * 1000);
            time += note.dur + 0.02;
        });
    },
    
    // === BACKGROUND MUSIC ===
    
    startMusic(phase = 'menu') {
        if (!this.enabled) return;
        
        this.musicPhase = phase;
        this.musicPlaying = true;
        
        // Try to play the Star Wars MP3 if available
        if (this.menuMusicElement) {
            this.menuMusicElement.volume = this.musicVolume * this.masterVolume;
            
            if (this.menuMusicElement.paused) {
                const playPromise = this.menuMusicElement.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Music playing');
                    }).catch(e => {
                        console.warn('Could not play music:', e.message);
                        // Try procedural fallback
                        this.playProceduralFallback(phase);
                    });
                }
            }
            return;
        }
        
        // Fallback to procedural music
        this.playProceduralFallback(phase);
    },
    
    playProceduralFallback(phase) {
        if (!this.context) {
            this.initContext();
        }
        if (!this.context) return;
        
        this.stopProceduralMusic();
        
        switch (phase) {
            case 'menu':
                this.playMenuMusicProcedural();
                break;
            case 'gameplay':
                this.playGameplayMusic();
                break;
            case 'boss':
                this.playBossMusic();
                break;
        }
    },
    
    stopProceduralMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        this.musicNodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        this.musicNodes = [];
    },
    
    stopMusic() {
        this.musicPlaying = false;
        this.stopProceduralMusic();
        
        // Stop menu music MP3 if playing
        if (this.menuMusicElement) {
            this.menuMusicElement.pause();
            this.menuMusicElement.currentTime = 0;
        }
    },
    
    // Pause music without resetting (for game over screen etc)
    pauseMusic() {
        if (this.menuMusicElement && !this.menuMusicElement.paused) {
            this.menuMusicElement.pause();
        }
        this.stopProceduralMusic();
        this.musicPlaying = false;
    },
    
    resumeMusic() {
        if (this.enabled) {
            if (this.menuMusicElement) {
                this.menuMusicElement.play().catch(e => {});
            }
            this.musicPlaying = true;
        }
    },
    
    playMenuMusic() {
        // Try to play the MP3 file first
        if (this.menuMusicElement && this.menuMusicLoaded) {
            this.menuMusicElement.volume = this.musicVolume * this.masterVolume;
            this.menuMusicElement.currentTime = 0;
            this.menuMusicElement.play().catch(e => {
                console.warn('Could not play menu music, using procedural fallback');
                this.playMenuMusicProcedural();
            });
            return;
        }
        
        // Fallback to procedural music
        this.playMenuMusicProcedural();
    },
    
    playMenuMusicProcedural() {
        if (!this.context) return;
        
        // Ambient pads with slow arpeggios (mysterious, anticipation)
        const playPad = () => {
            if (!this.musicPlaying || this.musicPhase !== 'menu') return;
            
            const chords = [
                [130.81, 164.81, 196.00], // C3, E3, G3
                [116.54, 146.83, 174.61], // Bb2, D3, F3
                [123.47, 155.56, 185.00], // B2, Eb3, F#3
                [130.81, 155.56, 196.00], // C3, Eb3, G3
            ];
            
            const chord = chords[Math.floor(Math.random() * chords.length)];
            
            chord.forEach((freq) => {
                const osc = this.context.createOscillator();
                const gain = this.context.createGain();
                const filter = this.context.createBiquadFilter();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                filter.type = 'lowpass';
                filter.frequency.value = 500;
                
                gain.gain.setValueAtTime(0, this.context.currentTime);
                gain.gain.linearRampToValueAtTime(this.musicVolume * 0.15, this.context.currentTime + 1);
                gain.gain.setValueAtTime(this.musicVolume * 0.15, this.context.currentTime + 3);
                gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 4);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start();
                osc.stop(this.context.currentTime + 4);
                this.musicNodes.push(osc);
            });
        };
        
        playPad();
        this.musicInterval = setInterval(playPad, 4000);
    },
    
    playGameplayMusic() {
        if (!this.context) return;
        
        // Driving synthwave beat
        let beat = 0;
        const bpm = 120;
        const beatInterval = (60 / bpm) * 1000 / 2; // 8th notes
        
        const playBeat = () => {
            if (!this.musicPlaying || this.musicPhase !== 'gameplay') return;
            
            const vol = this.musicVolume * 0.3;
            
            // Kick on 1 and 3
            if (beat % 4 === 0) {
                this.playDrum('kick', vol);
            }
            
            // Snare on 2 and 4
            if (beat % 4 === 2) {
                this.playDrum('snare', vol * 0.7);
            }
            
            // Hi-hat on every 8th
            this.playDrum('hihat', vol * 0.3);
            
            // Bass line
            if (beat % 2 === 0) {
                const bassNotes = [65.41, 73.42, 82.41, 73.42]; // C2, D2, E2, D2
                const note = bassNotes[Math.floor(beat / 2) % bassNotes.length];
                this.playBassNote(note, beatInterval * 1.5 / 1000, vol * 0.5);
            }
            
            beat++;
        };
        
        playBeat();
        this.musicInterval = setInterval(playBeat, beatInterval);
    },
    
    playBossMusic() {
        if (!this.context) return;
        
        // Intense, aggressive
        let beat = 0;
        const bpm = 140;
        const beatInterval = (60 / bpm) * 1000 / 2;
        
        const playBeat = () => {
            if (!this.musicPlaying || this.musicPhase !== 'boss') return;
            
            const vol = this.musicVolume * 0.35;
            
            // Double kick
            if (beat % 2 === 0) {
                this.playDrum('kick', vol);
            }
            
            // Snare
            if (beat % 4 === 2) {
                this.playDrum('snare', vol * 0.8);
            }
            
            // Aggressive hi-hat
            this.playDrum('hihat', vol * 0.4);
            
            // Menacing bass
            if (beat % 4 === 0) {
                const bassNotes = [55.00, 51.91, 49.00, 46.25]; // A1, Ab1, G1, Gb1
                const note = bassNotes[Math.floor(beat / 4) % bassNotes.length];
                this.playBassNote(note, beatInterval * 3 / 1000, vol * 0.6);
            }
            
            beat++;
        };
        
        playBeat();
        this.musicInterval = setInterval(playBeat, beatInterval);
    },
    
    playDrum(type, volume) {
        if (!this.context) return;
        
        switch (type) {
            case 'kick':
                const kick = this.context.createOscillator();
                const kickGain = this.context.createGain();
                kick.type = 'sine';
                kick.frequency.setValueAtTime(150, this.context.currentTime);
                kick.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.1);
                kickGain.gain.setValueAtTime(volume, this.context.currentTime);
                kickGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
                kick.connect(kickGain);
                kickGain.connect(this.musicGain);
                kick.start();
                kick.stop(this.context.currentTime + 0.2);
                break;
                
            case 'snare':
                // Noise burst
                const snareLength = 0.1;
                const snareBuffer = this.context.createBuffer(1, this.context.sampleRate * snareLength, this.context.sampleRate);
                const snareData = snareBuffer.getChannelData(0);
                for (let i = 0; i < snareBuffer.length; i++) {
                    snareData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / snareBuffer.length, 2);
                }
                const snare = this.context.createBufferSource();
                snare.buffer = snareBuffer;
                const snareFilter = this.context.createBiquadFilter();
                snareFilter.type = 'highpass';
                snareFilter.frequency.value = 1000;
                const snareGain = this.context.createGain();
                snareGain.gain.value = volume;
                snare.connect(snareFilter);
                snareFilter.connect(snareGain);
                snareGain.connect(this.musicGain);
                snare.start();
                break;
                
            case 'hihat':
                const hhLength = 0.05;
                const hhBuffer = this.context.createBuffer(1, this.context.sampleRate * hhLength, this.context.sampleRate);
                const hhData = hhBuffer.getChannelData(0);
                for (let i = 0; i < hhBuffer.length; i++) {
                    hhData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hhBuffer.length, 3);
                }
                const hh = this.context.createBufferSource();
                hh.buffer = hhBuffer;
                const hhFilter = this.context.createBiquadFilter();
                hhFilter.type = 'highpass';
                hhFilter.frequency.value = 5000;
                const hhGain = this.context.createGain();
                hhGain.gain.value = volume;
                hh.connect(hhFilter);
                hhFilter.connect(hhGain);
                hhGain.connect(this.musicGain);
                hh.start();
                break;
        }
    },
    
    playBassNote(freq, duration, volume) {
        if (!this.context) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.setValueAtTime(volume, this.context.currentTime + duration * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start();
        osc.stop(this.context.currentTime + duration);
    },
    
    // === UTILITY ===
    
    playTone(frequency, duration, type, volume, attack, decay, pitchBend = 0) {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        if (pitchBend !== 0) {
            oscillator.frequency.linearRampToValueAtTime(
                frequency + pitchBend,
                this.context.currentTime + duration
            );
        }
        
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + attack);
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + attack + decay);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },
    
    playNoise(duration, volume, attack, decay) {
        if (!this.context) return;
        
        const bufferSize = this.context.sampleRate * duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.context.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = this.context.createGain();
        gainNode.gain.setValueAtTime(0, this.context.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + attack);
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + attack + decay);
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 4000;
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        noise.start(this.context.currentTime);
        noise.stop(this.context.currentTime + duration);
    },
    
    setMasterVolume(value) {
        this.masterVolume = Utils.clamp(value, 0, 1);
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    },
    
    setSFXVolume(value) {
        this.sfxVolume = Utils.clamp(value, 0, 1);
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    },
    
    setMusicVolume(value) {
        this.musicVolume = Utils.clamp(value, 0, 1);
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        // Also update MP3 volume
        if (this.menuMusicElement) {
            this.menuMusicElement.volume = this.musicVolume * this.masterVolume;
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
        return this.enabled;
    },
};
