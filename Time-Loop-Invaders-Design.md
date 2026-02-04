# Time Loop Invaders — Full Game Design Plan

## Core Concept

**Elevator Pitch:** A 60-second arcade shooter where death rewinds time, but your past selves fight alongside you as ghosts—until you finally break the loop.

**Hook:** Each failed run becomes an ally. The screen gradually fills with your ghost ships, turning failure into progress.

---

## Controls (Keyboard)

| Key | Action |
|-----|--------|
| **A / D** or **← / →** | Move left/right |
| **Space** | Fire primary weapon |
| **Shift** | Activate slow-mo (limited meter) |
| **E** | Deploy bomb (screen-clear, 1 per loop) |
| **R** | Restart loop early (tactical reset) |

---

## Core Mechanics

### The 60-Second Loop
- Each run lasts exactly **60 seconds** (visible countdown timer)
- Enemies descend in increasingly difficult waves
- **Goal:** Destroy the **Loop Boss** that appears at 0:50 to break the cycle

### Ghost System
- When you die, your run is recorded
- Next loop: a translucent "ghost" of your previous ship replays your exact movements and shots
- Ghosts **can damage enemies** but **cannot be hit**
- Stack up to **5 ghosts** (performance balance)
- Strategic implication: intentionally "sacrifice" runs to position ghosts for later

### Synergy Bonuses
- If your shot and a ghost's shot hit the same enemy simultaneously: **2x damage + bonus points**
- Encourages players to learn enemy patterns and coordinate with their past selves

### Power-Ups (dropped by enemies)

| Power-Up | Effect | Duration |
|----------|--------|----------|
| **Rapid Fire** | 2x fire rate | 8 seconds |
| **Wide Shot** | 3-bullet spread | 8 seconds |
| **Time Shard** | +5 seconds to loop | Permanent (that run) |
| **Ghost Boost** | Ghosts deal 2x damage | Rest of loop |
| **Shield** | Absorbs 1 hit | Until hit |

---

## Progression System

### Single Run
- **Waves 1-3 (0:00–0:30):** Basic invaders, slow descent
- **Wave 4 (0:30–0:45):** Elite enemies (zigzag movement, shields)
- **Wave 5 (0:45–0:50):** Mini-boss squadron
- **Loop Boss (0:50–0:60):** Must destroy to win; if timer hits 0:00, loop resets

### Meta Progression (Persistent Unlocks)

| Unlock | Requirement |
|--------|-------------|
| **Ship Skin: Chrome** | Complete 10 loops |
| **Bomb +1** | Defeat Loop Boss once |
| **Ghost Slot +1 (6 max)** | Defeat Loop Boss with 3+ ghosts active |
| **Hard Mode** | Beat the game |
| **Soundtrack Player** | Collect 50 Time Shards total |

---

## Visual Style Guide

### Resolution & Palette
- **Canvas:** 320×180 pixels, scaled up (retro CRT feel)
- **Palette:** Limited 16-color (e.g., PICO-8 or custom synthwave palette)
- **Colors:** Deep purples, cyan, magenta, white highlights, black backgrounds with star parallax

### Key Visual Elements

| Element | Style |
|---------|-------|
| **Player Ship** | Small, angular, cyan thrusters with exhaust trail |
| **Ghosts** | Same ship but 40% opacity, slight chromatic aberration, trailing afterimages |
| **Enemies** | Chunky, insectoid sprites; eyes glow before shooting |
| **Loop Boss** | Large (32×32 px), pulsing core, rotating shield segments |
| **Bullets** | Player = cyan dots; Enemies = magenta diamonds |
| **Explosions** | 4-frame burst, white → yellow → orange → fade |
| **Timer** | Top-center, large pixel font, flashes red under 10 seconds |
| **Background** | 3-layer parallax starfield + distant nebula |

### Screen Effects
- **Loop Reset:** Screen glitches (scanlines + color separation), quick rewind visual of your ship's path
- **Ghost Spawn:** Brief "echo" ripple where ghost appears
- **Slow-Mo:** Subtle CRT curvature + vignette
- **Victory:** Screen shatters like glass, white flash

---

## Sound Effects Suggestions

### Player Actions

| Action | Sound Description | Notes |
|--------|-------------------|-------|
| **Move** | Soft synthetic "whoosh" | Very subtle; pans left/right with movement |
| **Shoot** | Punchy 8-bit "pew" | Short, satisfying, not fatiguing on repeat |
| **Bomb Deploy** | Deep bass "THOOM" + rising whine | 0.5s charge, then explosion |
| **Bomb Explosion** | Layered crackle + low reverb boom | Screen shake sync |
| **Slow-Mo Activate** | Tape slow-down effect + synth swell | Pitch drops |
| **Slow-Mo End** | Quick tape speed-up "zip" | Returns to normal |
| **Get Power-Up** | Bright chime + digital sparkle | Positive feedback |
| **Shield Hit** | Electric crackle + glass "ting" | Indicates protection worked |
| **Death** | Explosion + descending synth | Slightly melancholic |

### Ghost System

| Action | Sound Description | Notes |
|--------|-------------------|-------|
| **Ghost Spawn (Loop Start)** | Ethereal "whoosh" + reversed reverb | One per ghost, staggered |
| **Ghost Fires** | Quieter, filtered version of player shot | 50% volume, more "distant" |
| **Synergy Hit** | Normal hit + harmonic "ding" overtone | Reward feedback |

### Enemies

| Action | Sound Description | Notes |
|--------|-------------------|-------|
| **Enemy Shoot** | Lower-pitched "pip" | Distinct from player |
| **Enemy Hit** | Crunchy 8-bit "crackle" | Satisfying destruction |
| **Enemy Death** | Short explosion + point "ding" | Quick, not intrusive |
| **Elite Enemy Appears** | Warning klaxon (2 beeps) | Alerts player |
| **Loop Boss Spawn** | Deep horn + heartbeat pulse | Tension builder |
| **Loop Boss Hit** | Metallic clang + spark | Feels armored |
| **Loop Boss Death** | Long, layered explosion + victory sting | Climactic |

### UI & Loop System

| Action | Sound Description | Notes |
|--------|-------------------|-------|
| **Timer Tick (under 10s)** | Subtle tick, increasing tempo | Builds urgency |
| **Loop Reset** | VHS rewind "scrrrch" + glitch stutter | Iconic, memorable |
| **Victory** | Glass shatter + triumphant synth chord | Big payoff |
| **Menu Select** | Clean digital "blip" | |
| **Menu Confirm** | Deeper "blip" + slight echo | |

---

## Music Direction

| Phase | Style | BPM | Feel |
|-------|-------|-----|------|
| **Menu** | Ambient synth pads, slow arpeggios | 70 | Mysterious, anticipation |
| **Gameplay (0:00–0:30)** | Driving synthwave, steady beat | 120 | Focused, energetic |
| **Gameplay (0:30–0:50)** | Adds intensity layers, busier drums | 130 | Escalating tension |
| **Boss Phase (0:50–0:60)** | Aggressive bass drops, staccato hits | 140 | Climactic urgency |
| **Victory** | Major key resolution, triumphant | — | Release, achievement |
| **Death/Loop Reset** | Music glitches, pitch-drops, restarts | — | "Broken record" feel |

**Tip:** Consider having the music subtly evolve across loops—more layers or intensity as ghost count increases.

---

## Technical Recommendations

| Aspect | Suggestion |
|--------|------------|
| **Engine** | Godot (free, great for 2D), or LÖVE2D (Lua-based, lightweight) |
| **Pixel Art Tool** | Aseprite (animation support) |
| **SFX Tool** | SFXR/BFXR (retro sounds), or Chiptone |
| **Music Tool** | FamiStudio (authentic 8-bit), or FL Studio with chiptune VSTs |
| **Scope** | MVP in 4–6 weeks solo; full polish 8–12 weeks |

---

## Development Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **1. Prototype** | Week 1–2 | Player movement, shooting, basic enemies, 60s timer, single ghost recording/playback |
| **2. Core Loop** | Week 3–4 | Ghost stacking, synergy system, power-ups, Loop Boss |
| **3. Polish** | Week 5–6 | All SFX, music, screen effects, meta progression |
| **4. Playtesting** | Week 7–8 | Balance tuning, bug fixes, onboarding/tutorial |
| **5. Release** | Week 9+ | Itch.io / Steam launch, trailer |
