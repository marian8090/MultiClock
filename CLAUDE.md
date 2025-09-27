# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MultiClock is a modular web-based clock application that allows users to switch between different clock styles. The application features a clean architecture with separate modules for each clock type and a main controller for managing clock selection.

## Architecture

The application uses a modular ES6 module system:
- **Main Controller**: `index.html` - Manages clock selection and user interface
- **Clock Modules**: Individual ES6 modules for each clock type
- **Font Assets**: Custom fonts stored in the `fonts/` directory

### Available Clock Types

1. **Analog Clock** (`clocks/analog-clock.js`):
   - Built with PixiJS v8+ for 2D graphics rendering
   - Features hour/minute markers, analog hands with red accents
   - Date display positioned at 3 o'clock
   - 8 FPS update rate for smooth animation
   - Responsive design with automatic resizing

2. **Digital Clock** (`clocks/digital-clock.js`):
   - CSS/HTML-based digital display
   - Green text on black background with glow effects
   - Custom PMDG_NG3_DU_A font for aviation-style appearance
   - 1 second update interval

### User Controls

- **Number Keys (1, 2, 3...)**: Direct selection of clock styles
- **Arrow Keys (←/→)**: Cycle through available clocks
- **F11**: Toggle fullscreen mode
- **Escape**: Exit fullscreen mode

### Key Components

- **MultiClock Controller**: Manages clock switching and event handling
- **Clock Base Interface**: Common init/destroy pattern for all clock types
- **Responsive Design**: All clocks support fullscreen and window resizing
- **Font Loading**: Custom fonts loaded from the `fonts/` directory

## Development

**To run the application:**
```bash
# Serve with HTTP server (required for ES6 modules)
python3 -m http.server 8000
# Then open http://localhost:8000 in browser
```

**To add a new clock:**
1. Create new clock module in `clocks/` directory
2. Implement `init(container)` and `destroy()` methods
3. Add to the `clocks` array in `index.html`
4. Update keyboard controls if needed

**To test changes:**
- Modify the relevant module files
- Refresh the browser to see changes
- No build process required

## Technical Configuration

- **Analog Clock**: 8 FPS, PixiJS with WebGL/Canvas rendering
- **Digital Clock**: 1 FPS update, CSS-based styling
- **Fonts**: Custom TTF fonts loaded via CSS @font-face
- **Resolution**: Auto-scaling with 2x pixel density for high-DPI displays

## File Structure

```
MultiClock/
├── index.html              # Main application controller
├── clocks/
│   ├── analog-clock.js     # PixiJS analog clock module
│   └── digital-clock.js    # CSS/JS digital clock module
├── fonts/
│   ├── PMDG_NG3_DU_A.ttf  # Primary digital clock font
│   ├── AppleII-PrintChar21.ttf
│   ├── Perfect DOS VGA 437.ttf
│   └── PMDG_NG3_DU_A-SC70x85-baseline.ttf
└── CLAUDE.md               # This documentation file
```