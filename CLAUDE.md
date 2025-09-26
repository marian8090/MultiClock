# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file web-based analog clock application built with PixiJS. The entire application consists of one HTML file (`pixiClockU1.html`) that contains embedded CSS and JavaScript.

## Architecture

The clock application uses:
- **PixiJS** v8+ loaded from CDN for 2D graphics rendering
- **PIXI.Application** as the main application container with WebGL/Canvas rendering
- **PIXI.Graphics** for drawing clock components (face, hands, hour/minute markers)
- **PIXI.Text** for displaying the current date
- **PIXI.Container** for organizing clock elements

### Key Components

- **Watch Face**: Hour markers (12 positions with special styling for 3,6,9,12) and minute markers (60 positions)
- **Clock Hands**: Hour, minute, and second hands with different styling and red accents
- **Date Display**: Shows current day of month positioned at 3 o'clock
- **Animation Loop**: Uses PIXI ticker at 8 FPS to update hand positions based on current time
- **Responsive Design**: Automatic resizing when window dimensions change (including fullscreen F11)

### Coordinate System

- Clock center: `(0.5 * screen.width, 0.5 * screen.height)`
- Outer radius: `Math.min(screen.width, screen.height) * 0.48`
- All dimensions are proportional to the outer radius for responsive scaling
- Window resize triggers complete clock rebuild with new dimensions

## Development

Since this is a single HTML file with no build process:

**To run the application:**
```bash
# Open directly in browser
open pixiClockU1.html
# Or serve with a simple HTTP server
python3 -m http.server 8000
```

**To test changes:**
- Modify the HTML file directly
- Refresh the browser to see changes
- No compilation or build steps required

## Key Configuration

- **Frame Rate**: Currently set to 8 FPS (`app.ticker.maxFPS = 8`)
- **Colors**: White (#FFFFFF) for main elements, red (#FF0000) for accents, black (#000000) background
- **Resolution**: Auto-scaling with 2x pixel density for crisp rendering on high-DPI displays

## File Structure

```
U1-clock/
└── pixiClockU1.html    # Complete clock application (HTML + CSS + JS)
```