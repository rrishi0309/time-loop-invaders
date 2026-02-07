# Time Loop Invaders

A retro arcade shooter where death rewinds time, but your past selves fight alongside you as ghosts—until you finally break the loop.

## Play the Game

Open `index.html` in a browser or visit the hosted version.

## Controls

| Key | Action |
|-----|--------|
| **A / D** or **← / →** | Move left/right |
| **Space** | Fire |
| **Shift** | Slow-mo (limited meter) |
| **E** | Deploy bomb |
| **R** | Restart loop |
| **ESC** | Pause |

## Features

- 60-second time loops
- Ghost system - your previous runs fight alongside you
- Multiple difficulty levels (Padawan to Sith Lord)
- Star Wars-inspired music and sound effects
- Retro pixel art aesthetics
- Boss battles

## How to Play

1. Each run lasts 60 seconds
2. Destroy enemies and survive
3. When you die, your run becomes a "ghost" that replays alongside you
4. Stack up to 5+ ghosts to overwhelm the Loop Boss
5. Defeat the boss before time runs out to break the loop!

## Development

Pure HTML5 Canvas + JavaScript. No build tools required.

```bash
# Run locally with any static server
python -m http.server 8080
# or
npx serve
```

Then open http://localhost:8080

Play here now: https://rrishi0309.github.io/time-loop-invaders/
