# Time Loop Invaders — Detailed UI Plan

This document covers every screen, element, animation, and interaction. Designed for a **320×180 pixel canvas** (16:9, scales cleanly to 1280×720, 1920×1080).

---

## Screen Layout Grid

```
┌────────────────────────────────────────────────────────────┐
│  TOP BAR (12px height)                                     │
│  [Ghost Count]     [TIMER]     [Score]                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                                                            │
│                    PLAY AREA                               │
│                   (320 × 156px)                            │
│                                                            │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  BOTTOM BAR (12px height)                                  │
│  [Power-Up]  [Slow-Mo Meter]  [Bomb Icon]                  │
└────────────────────────────────────────────────────────────┘
```

---

## 1. Main Menu Screen

### Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  ◆ TIME LOOP INVADERS ◆                    │
│                     (Title, centered)                      │
│                                                            │
│              ▸ START GAME                                  │
│                UNLOCKS                                     │
│                SETTINGS                                    │
│                CREDITS                                     │
│                QUIT                                        │
│                                                            │
│  [Ghost ship drifts across background slowly]              │
│                                                            │
│                              [v1.0]        [Best: 00:00]   │
└────────────────────────────────────────────────────────────┘
```

### Element Specifications

| Element | Position | Size | Style |
|---------|----------|------|-------|
| **Title** | Center, Y: 30px | 128×16px | Custom pixel font, cyan with magenta drop shadow, gentle float animation (±2px Y) |
| **Menu Options** | Center, Y: 70–130px | 8px font height | White default, cyan when selected, "▸" arrow indicator |
| **Background** | Full screen | 320×180 | Parallax starfield (3 layers), slow scroll upward |
| **Ghost Ship** | Roaming | 16×12px | 30% opacity, drifts left-to-right, loops |
| **Version** | Bottom-left, 4px margin | 4px font | Dark gray, unobtrusive |
| **Best Time** | Bottom-right, 4px margin | 6px font | Shows fastest Loop Boss kill; "—:—" if none |

### Animations & Transitions

| Action | Animation |
|--------|-----------|
| **Menu Navigate** | Selected item scales up 110% + color shift (white → cyan), 0.1s ease |
| **Menu Select** | Flash white, 0.2s hold, then screen wipe (scanline dissolve) |
| **Idle (10s)** | Title pulses glow, ghost ships increase in frequency |
| **Enter from Victory** | Confetti particles fade in background for 5s |

### Sound Mapping

| Action | Sound |
|--------|-------|
| Navigate | Soft "blip" |
| Confirm | Deeper "blip" + echo |
| Back | Descending "boop" |

---

## 2. Gameplay HUD

### Top Bar (12px height)

```
┌────────────────────────────────────────────────────────────┐
│ 👻×3          ◀ 00:47 ▶           ★ 12,450                 │
└────────────────────────────────────────────────────────────┘
```

| Element | Position | Details |
|---------|----------|---------|
| **Ghost Counter** | Left, 4px margin | Icon (mini ghost, 8×8px) + "×#" number; pulses when ghost spawns |
| **Timer** | Center | Large font (10px), countdown from 60; brackets are decorative arrows |
| **Score** | Right, 4px margin | Star icon + number; rolls up smoothly on points gained |

#### Timer States

| Time Remaining | Visual Change |
|----------------|---------------|
| 60–11 seconds | White text, steady |
| 10–6 seconds | Yellow text, pulses every second |
| 5–1 seconds | Red text, faster pulse, screen edge vignette |
| Boss Phase (10s) | Timer box gets red border, "WARNING" flashes once |

---

### Bottom Bar (12px height)

```
┌────────────────────────────────────────────────────────────┐
│ [RAPID●●●○○]     [▰▰▰▰▱▱▱▱▱▱]     [💣×1]                  │
└────────────────────────────────────────────────────────────┘
```

| Element | Position | Details |
|---------|----------|---------|
| **Active Power-Up** | Left, 4px margin | Icon + name + duration pips (●=active, ○=depleted); empty if none |
| **Slow-Mo Meter** | Center | 10-segment bar; cyan when full, depletes yellow, recharges white |
| **Bomb Counter** | Right, 4px margin | Bomb icon + "×#"; grayed out if 0; flashes when available |

#### Power-Up Display States

| State | Visual |
|-------|--------|
| No power-up | Slot is dim, shows "—" |
| Power-up active | Icon + label + countdown pips animate out |
| Power-up expiring (2s left) | Pips flash rapidly |
| New power-up collected | Slot flashes white, icon "pops" in (scale 150% → 100%) |

---

### In-Play Area Elements

| Element | Details |
|---------|---------|
| **Player Ship** | 12×10px, cyan, visible thruster glow when moving |
| **Ghost Ships** | Same sprite, 40% opacity, chromatic aberration offset (1px RGB split), faint trail |
| **Bullets (Player)** | 2×4px cyan rectangles |
| **Bullets (Ghost)** | Same but 50% opacity, no glow |
| **Bullets (Enemy)** | 4×4px magenta diamonds, slight glow |
| **Enemies** | 12×10px to 16×14px, varied sprites, eyes glow 0.2s before shooting |
| **Loop Boss** | 32×32px, centered when spawned, health bar appears above it |
| **Explosions** | 4-frame animation, 16×16px, additive blending |
| **Power-Up Drops** | 8×8px, white outline, inner icon, bobs up/down (±1px), sparkle particles |

---

### Boss Health Bar (appears at 0:50)

```
         ╔═══════════════════════════════════════╗
         ║  ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱  ║
         ╚═══════════════════════════════════════╝
```

| Feature | Details |
|---------|---------|
| Position | Top-center, below timer (Y: 16px) |
| Size | 120×6px bar inside 124×10px frame |
| Color | Green (>50%), Yellow (25–50%), Red (<25%) |
| Animation | Depletes smoothly (not instant), flashes white on hit |
| Label | "LOOP GUARDIAN" in 4px font above bar |

---

## 3. Pause Menu

Triggered by **ESC** key. Game freezes, dims, overlay appears.

### Layout

```
┌────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░┌──────────────────────┐░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│       PAUSED         │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│                      │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│   ▸ RESUME           │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│     SETTINGS         │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│     RESTART LOOP     │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│     QUIT TO MENU     │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░│                      │░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░└──────────────────────┘░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────────────┘
```

| Feature | Details |
|---------|---------|
| Background | Gameplay frozen, 60% black overlay, subtle scanlines |
| Panel | Centered, 120×80px, dark purple with cyan border (1px) |
| Title | "PAUSED" in 8px font, centered top of panel |
| Options | 6px font, same selection style as main menu |

### Animations

| Action | Animation |
|--------|-----------|
| Open | Panel scales from 0% → 100% (0.15s, ease-out), background dims |
| Close (Resume) | Panel scales down, background undims, gameplay resumes |
| Quit Confirm | Sub-panel appears: "Are you sure? YES / NO" |

---

## 4. Death / Loop Reset Screen

Appears when player is hit (no shield). Brief, impactful, fast.

### Sequence (1.5s total)

| Time | Event | Visual | Audio |
|------|-------|--------|-------|
| 0.0s | Death | Ship explodes (8-frame animation), screen shake (4px, 0.2s) | Explosion + descending synth |
| 0.3s | Freeze | Frame freezes, chromatic aberration intensifies | Music pitch-drops |
| 0.6s | Rewind FX | Ghost trail of your path rewinds visually (your ship's trajectory reverses rapidly) | VHS rewind "scrrrch" |
| 1.2s | Stats Flash | Quick overlay (centered): | Glitch stutter sound |
| 1.5s | Restart | Screen "clicks" back to loop start | Music restarts, ghost spawn sound |

### Stats Flash Overlay (0.3s duration)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    LOOP FAILED                             │
│                                                            │
│                 Time: 00:32                                │
│                 Score: 8,240                               │
│                 Ghost Saved ✓                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- White text on transparent dark overlay
- "Ghost Saved ✓" confirms your run is now a ghost
- Appears and disappears quickly (not interactive)

---

## 5. Victory Screen

Triggered when Loop Boss is destroyed.

### Sequence

| Time | Event | Visual | Audio |
|------|-------|--------|-------|
| 0.0s | Boss Death | Boss explodes in large, multi-frame animation (16 frames) | Layered explosion |
| 0.5s | Screen Shatter | Cracks spread from boss position, fragments fall | Glass shatter |
| 1.0s | White Flash | Screen flashes white, clears to victory screen | Triumphant synth chord |

### Victory Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  ✧ LOOP BROKEN ✧                           │
│                                                            │
│            ╔══════════════════════════╗                    │
│            ║   FINAL TIME    00:52    ║                    │
│            ║   SCORE         24,800   ║                    │
│            ║   GHOSTS USED      4     ║                    │
│            ║   SYNERGY HITS    12     ║                    │
│            ╠══════════════════════════╣                    │
│            ║   RANK             A     ║                    │
│            ╚══════════════════════════╝                    │
│                                                            │
│              ▸ PLAY AGAIN                                  │
│                MAIN MENU                                   │
│                                                            │
│          🔓 NEW UNLOCK: Ghost Slot +1                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Rank System

| Rank | Criteria |
|------|----------|
| **S** | Beat boss with 10+ seconds left, 0 deaths this run |
| **A** | Beat boss with 5+ seconds left |
| **B** | Beat boss with any time left |
| **C** | Beat boss on final second |

### Element Details

| Element | Style |
|---------|-------|
| Title "LOOP BROKEN" | Glowing cyan, particle sparkles around it |
| Stats Panel | Dark purple box, cyan border, stats roll up (slot machine style) |
| Rank | Large letter (24×24px area), color-coded (S=gold, A=cyan, B=white, C=gray), "stamps" in with impact |
| Unlock Banner | Gold background strip, slides in from bottom if new unlock achieved |
| Menu Options | Same style as main menu |

---

## 6. Settings Menu

Accessible from Main Menu or Pause Menu.

### Layout

```
┌────────────────────────────────────────────────────────────┐
│                       SETTINGS                             │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│    AUDIO                                                   │
│      Master Volume      ◀ ▰▰▰▰▰▰▰▱▱▱ ▶     70%            │
│      Music Volume       ◀ ▰▰▰▰▰▰▰▰▱▱ ▶     80%            │
│      SFX Volume         ◀ ▰▰▰▰▰▰▰▰▰▰ ▶    100%            │
│                                                            │
│    DISPLAY                                                 │
│      Fullscreen         ◀    ON    ▶                       │
│      CRT Filter         ◀    ON    ▶                       │
│      Screen Shake       ◀    ON    ▶                       │
│                                                            │
│    CONTROLS                                                │
│      View Key Bindings         [ENTER]                     │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│                     ▸ BACK                                 │
└────────────────────────────────────────────────────────────┘
```

### Interaction Model

| Control | Action |
|---------|--------|
| **↑ / ↓** | Navigate options |
| **← / →** | Adjust value (sliders, toggles) |
| **Enter** | Open sub-menu (Key Bindings) |
| **ESC** | Back |

### Slider Behavior

- 10 segments per slider
- Visual: filled segments (▰) vs empty (▱)
- Arrows (◀ ▶) highlight when adjusting
- Percentage shown on right

### Toggle Behavior

- Options cycle: ON ↔ OFF (some have more: CRT Filter could be OFF / SUBTLE / FULL)
- Current value centered between arrows

---

## 7. Key Bindings Sub-Menu

```
┌────────────────────────────────────────────────────────────┐
│                     KEY BINDINGS                           │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│       ACTION              PRIMARY       ALTERNATE          │
│    ─────────────────────────────────────────────────────   │
│       Move Left              A              ←              │
│       Move Right             D              →              │
│       Fire                 SPACE           —               │
│       Slow-Mo              SHIFT           —               │
│       Bomb                   E             —               │
│       Restart Loop           R             —               │
│       Pause                 ESC            —               │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│    Select action + press ENTER to rebind                   │
│                     ▸ BACK                                 │
└────────────────────────────────────────────────────────────┘
```

### Rebinding Flow

1. Select action row
2. Press ENTER → row highlights, "PRESS NEW KEY" prompt
3. Press any valid key → binds immediately, shows new key
4. Press ESC during binding → cancels, keeps old key

---

## 8. Unlocks Screen

```
┌────────────────────────────────────────────────────────────┐
│                       UNLOCKS                              │
│  ───────────────────────────────────────────────────────   │
│                                                            │
│    SHIPS                                                   │
│      [■] Default         [■] Chrome         [□] Neon       │
│      [□] Stealth         [□] Golden                        │
│                                                            │
│    UPGRADES                                                │
│      [■] Bomb +1              Defeat Loop Boss             │
│      [■] Ghost Slot 6         3+ ghosts active on win      │
│      [□] Ghost Slot 7         5+ ghosts active on win      │
│      [□] Slow-Mo +50%         Collect 100 Time Shards      │
│                                                            │
│    MODES                                                   │
│      [■] Normal                                            │
│      [□] Hard Mode            Beat the game                │
│      [□] Endless              Beat Hard Mode               │
│                                                            │
│  ───────────────────────────────────────────────────────   │
│    Progress: 5/14 (36%)                    ▸ BACK          │
└────────────────────────────────────────────────────────────┘
```

### Element Details

| Element | Style |
|---------|-------|
| [■] Unlocked | Cyan filled square, name in white |
| [□] Locked | Gray outline square, name in gray, requirement shown |
| Ship Icons | 16×16px preview when selected |
| Progress Bar | Bottom, shows overall completion |

### Interaction

- Navigate with ↑↓←→
- Selecting a ship equips it (if unlocked)
- Selecting locked item shows requirement tooltip

---

## 9. Tutorial / First-Run Onboarding

First-time players get an interactive tutorial (can be skipped).

### Sequence

| Step | Screen Content | Player Action |
|------|----------------|---------------|
| 1 | "MOVE with A/D or ←→" — only movement enabled | Move left and right |
| 2 | "FIRE with SPACE" — enemies appear | Destroy 3 enemies |
| 3 | "COLLECT POWER-UPS" — power-up drops | Collect 1 power-up |
| 4 | "USE SLOW-MO with SHIFT" — meter shown | Activate slow-mo |
| 5 | "DEPLOY BOMB with E" — enemies swarm | Use bomb |
| 6 | "WHEN YOU DIE..." — player is intentionally killed | Get hit |
| 7 | "...YOUR GHOST JOINS YOU" — loop restarts with ghost | Observe ghost |
| 8 | "DESTROY THE LOOP GUARDIAN TO WIN" — boss spawns | Fight boss |
| 9 | "GOOD LUCK" — tutorial ends | Auto-transition |

### Tutorial UI Additions

| Element | Details |
|---------|---------|
| **Instruction Banner** | Top of screen, black bar with white text, arrow pointing at relevant UI element |
| **Highlight Pulse** | Relevant control/area pulses with cyan outline |
| **Skip Prompt** | "Hold ESC to skip" in bottom-right, 2s hold to skip |
| **Progress Dots** | ●●●○○○○○○ at bottom showing tutorial progress |

---

## 10. Typography System

| Use | Font Size | Style | Color |
|-----|-----------|-------|-------|
| **Title/Headers** | 10–12px | Custom pixel font, bold | Cyan, white |
| **Menu Options** | 8px | Regular pixel font | White (default), Cyan (selected) |
| **HUD Numbers** | 8px | Monospace pixel font | White, contextual colors |
| **Body Text** | 6px | Regular pixel font | White, gray |
| **Tiny Labels** | 4px | Condensed pixel font | Gray |

### Recommended Fonts (Free)

- **Press Start 2P** (Google Fonts) — classic arcade
- **Pixel Operator** — clean, readable
- **04b03** — ultra-small sizes

---

## 11. Color Palette Reference

| Name | Hex | Use |
|------|-----|-----|
| **Background Black** | #0D0D1A | Screen backgrounds |
| **Deep Purple** | #1A1A2E | Panels, UI boxes |
| **Cyan** | #00FFFF | Player, highlights, positive |
| **Magenta** | #FF00FF | Enemies, danger |
| **White** | #FFFFFF | Text, bullets |
| **Yellow** | #FFE066 | Warnings, medium alerts |
| **Red** | #FF4444 | Critical alerts, damage |
| **Green** | #44FF44 | Health, positive feedback |
| **Gray** | #666677 | Disabled, secondary text |
| **Gold** | #FFD700 | Unlocks, S-rank |

---

## 12. UI State Diagram

```
                         ┌──────────────┐
                         │  BOOT/SPLASH │
                         └──────┬───────┘
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │               MAIN MENU                   │
        │  [Start] [Unlocks] [Settings] [Credits]   │
        └───────┬────────┬─────────┬───────┬────────┘
                │        │         │       │
     ┌──────────┘        │         │       └────────────┐
     ▼                   ▼         ▼                    ▼
┌─────────┐       ┌──────────┐ ┌──────────┐      ┌──────────┐
│GAMEPLAY │◀─────▶│ UNLOCKS  │ │ SETTINGS │      │ CREDITS  │
└────┬────┘       └──────────┘ └──────────┘      └──────────┘
     │
     ├────────────────┐
     ▼                ▼
┌─────────┐    ┌────────────┐
│  PAUSE  │    │DEATH/RESET │
└────┬────┘    └─────┬──────┘
     │               │
     │               ▼
     │         ┌──────────┐
     │         │ GAMEPLAY │ (loops back)
     │         └──────────┘
     │
     ├─────────────────┐
     ▼                 ▼
┌─────────┐     ┌───────────┐
│  QUIT   │     │  VICTORY  │
│ CONFIRM │     └─────┬─────┘
└────┬────┘           │
     │                ▼
     ▼          ┌───────────┐
┌─────────┐     │ MAIN MENU │
│MAIN MENU│     │ or RETRY  │
└─────────┘     └───────────┘
```

---

## Implementation Checklist

| Screen | Priority | Complexity |
|--------|----------|------------|
| Gameplay HUD | High | Medium |
| Death/Loop Reset | High | Medium |
| Main Menu | High | Low |
| Pause Menu | Medium | Low |
| Victory Screen | Medium | Medium |
| Settings | Medium | Medium |
| Tutorial | Low (post-MVP) | High |
| Unlocks Screen | Low (post-MVP) | Medium |
| Key Bindings | Low | Low |
