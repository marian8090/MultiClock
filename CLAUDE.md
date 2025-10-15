# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MultiClock is a sophisticated modular web-based clock application that allows users to switch between different clock styles with comprehensive customization options. The application features a clean ES6 module architecture with separate modules for each clock type, extensive parameter systems, and advanced rendering options.

## Architecture

The application uses a modular ES6 module system with a robust parameter management framework:
- **Main Controller**: `index.html` - Manages clock selection, keyboard controls, and user interface
- **Clock Modules**: Individual ES6 modules for each clock type with standardized interfaces
- **Font Assets**: Custom fonts and system font integration
- **Parameter System**: Consistent navigation and customization across all clocks

### Available Clock Types

1. **Analog Clock** (`clocks/1_analog-clock.js`):
   - Built with PixiJS v8+ for 2D graphics rendering
   - Features hour/minute markers, analog hands with color-coordinated accents
   - Date display positioned at 3 o'clock
   - 8 FPS update rate for smooth animation
   - **Parameters**: SIZE (20%-300%), COLOR (Original U1/White with red accents, Green variations)
   - **Special Features**: Original U1 maintains traditional white/red color scheme, other colors use coordinated darker accents

2. **Digital Clock** (`clocks/2_digital-clock.js`):
   - CSS/HTML-based digital display with advanced font rendering
   - **Fonts**: 10 options including 4 custom TTF fonts + 6 system monospace fonts
   - **Parameters**: FONT, FONTSIZE (20%-500%), FONT COLOUR (7 colors), RENDERER (3 modes)
   - **Rendering Modes**: Smooth, Crisp (sharp edges), Pixelated (pixel-perfect)
   - **Ratio**: 20:14 time-to-date size ratio for optimal readability

3. **7-Segment LED Clock** (`clocks/3_7segment-led.js`):
   - CSS-generated authentic 7-segment LED display simulation
   - **Parameters**: FONTSIZE (20%-500%), FONT COLOUR (7 colors), RENDERER (3 modes)
   - **Features**: Realistic LED module spacing, integrated colons/dots, pixel-perfect rendering options
   - **Default**: Green color for authentic LED appearance
   - **Ratio**: 20:14 time-to-date size ratio

4. **Slim Analog Clock** (`clocks/4_aviation-clock.js`):
   - Aviation-style slim analog clock with PixiJS rendering
   - Minimalist design inspired by aircraft instruments
   - **Parameters**: SIZE (20%-300%), COLOR variations
   - 8 FPS update rate for smooth animation

5. **DSEG Clock** (`clocks/5_dseg-clock.js`):
   - Professional 7-segment display using DSEG font family
   - **Fonts**: DSEG7-Classic and DSEG7-Modern variants
   - **Parameters**: FONT (Classic/Modern), STYLE (6 weight variants), FONTSIZE (20%-500%), FONT COLOUR (7 colors), RENDERER (3 modes)
   - **Style Variants**: Light, Light Italic, Regular, Italic (default), Bold, Bold Italic
   - **Default**: White color with Italic style
   - **Ratio**: 20:14 time-to-date size ratio
   - **Font Loading**: Dynamic loading of 12 DSEG7 font variants via @font-face
   - **Future Ready**: DSEG14 fonts included for future alphanumeric display extensions

### User Controls

- **Number Keys (1, 2, 3, 4, 5)**: Direct selection of clock styles
- **Arrow Keys (↑/↓)**: Navigate through parameters for selected clock
- **Arrow Keys (←/→)**: Change parameter values
- **F**: Toggle fullscreen mode
- **H**: Show/hide help overlay (auto-hides after 3 seconds)

### Parameter System

Each clock implements a standardized parameter interface:
- **Navigation**: Up/Down arrows cycle through available parameters
- **Adjustment**: Left/Right arrows modify parameter values
- **Display**: Current parameter and value shown in top-left corner (auto-hides after 5 seconds)
- **Consistency**: All clocks follow the same interaction patterns

### Advanced Features

#### Rendering Modes (Clocks 2, 3 & 5)
- **Smooth**: Default CSS rendering with antialiasing
- **Crisp**: Sharp edges with disabled font smoothing for clarity
- **Pixelated**: Pixel-perfect rendering with no sub-pixel artifacts

#### Font System (Clock 2)
- **Custom TTF Fonts**: PMDG_NG3_DU_A variants, AppleII-PrintChar21, Perfect DOS VGA 437, PMDG_NG3_LCD_9seg
- **System Fonts**: Courier New, Monaco
- **Smart Loading**: TTF files loaded via @font-face, system fonts use CSS font stacks
- **Font Count**: 7 total fonts (5 custom TTF + 2 system fonts)

#### Color Coordination (Clock 1 & 4)
- **Original U1**: White elements with traditional red accents
- **Color Variants**: Main color with mathematically calculated darker accents (60% intensity)
- **Consistent Borders**: Black outlines on all hands for optimal contrast

#### DSEG Font System (Clock 5)
- **DSEG7 Fonts**: Professional 7-segment display fonts with Classic and Modern variants
- **Weight Options**: 6 style variants (Light, Light Italic, Regular, Italic, Bold, Bold Italic)
- **Font Path**: `fonts/fonts-DSEG_v046/DSEG7-{Classic|Modern}/`
- **Dynamic Loading**: All 12 variants loaded via @font-face, switched dynamically based on parameters
- **DSEG14 Available**: 14-segment fonts included for future alphanumeric extensions
- **Format Support**: TTF, WOFF, and WOFF2 formats included for broad compatibility

#### Settings Persistence
- **LocalStorage Backend**: All user preferences saved to browser's localStorage
- **Per-Clock Settings**: Each clock maintains its own independent settings
- **Auto-Save**: Settings saved automatically when changing parameters or switching clocks
- **Session Persistence**: Settings retained across browser sessions (closing/reopening tab)
- **Settings Manager**: Centralized `SettingsManager` class handles all storage operations
- **Settings Saved**:
  - Clock 1: Size, Color
  - Clock 2: Font, Font Size, Color, Renderer
  - Clock 3: Font Size, Color, Renderer
  - Clock 4: Size, Color, Seconds Hand Mode
  - Clock 5: Font Type, Font Style, Font Size, Color, Renderer
- **Storage Keys**: Prefixed with `multiclock_` to avoid conflicts
- **Last Clock**: Last viewed clock automatically restored on page load

#### Cache Busting
- **HTTP Headers**: Meta tags prevent browser from caching HTML
- **Dynamic Imports**: JavaScript modules loaded with timestamp query parameters
- **Instant Updates**: All code changes visible immediately on page reload
- **No Hard Refresh**: Standard F5/Ctrl+R reload sufficient for updates

## Development

**To run the application:**
```bash
# Serve with HTTP server (required for ES6 modules)
python3 -m http.server 8000
# Then open http://localhost:8000 in browser
```

**To add a new clock:**
1. Create new clock module in `clocks/` directory with number prefix (e.g., `6_new-clock.js`)
2. Implement required methods:
   - `init(container, savedSettings = null)` - Initialize clock in provided container, load saved settings
   - `destroy()` - Clean up resources and elements
   - `getSettings()` - Return object with current parameter values for persistence
   - `loadSettings(settings)` - Apply saved settings to clock parameters
   - `saveSettings()` - Save current settings via SettingsManager
   - `navigateParameterUp()` / `navigateParameterDown()` - Parameter navigation
   - `changeParameterLeft()` / `changeParameterRight()` - Parameter value changes (must call saveSettings())
3. Set `settingsManager` and `clockIndex` properties (set by MultiClock before init)
4. Add to the `clocks` array in `index.html`
5. Update help text and keyboard controls if needed

**Parameter Implementation Pattern:**
```javascript
// Required parameter structure
this.parameters = ['PARAM1', 'PARAM2', 'PARAM3'];
this.currentParameterIndex = 0;

// Settings manager (will be set by MultiClock)
this.settingsManager = null;
this.clockIndex = null;

// Required methods for parameter system
updateParameterDisplay() { /* Update UI with current parameter */ }
showSelectedValue() { /* Temporarily show selected value */ }

// Required methods for settings persistence
getSettings() {
    return {
        currentParam1: this.currentParam1,
        currentParam2: this.currentParam2
    };
}

loadSettings(settings) {
    if (settings.currentParam1 !== undefined) {
        this.currentParam1 = settings.currentParam1;
    }
    if (settings.currentParam2 !== undefined) {
        this.currentParam2 = settings.currentParam2;
    }
}

saveSettings() {
    if (this.settingsManager && this.clockIndex !== null) {
        this.settingsManager.saveClockSettings(this.clockIndex, this.getSettings());
    }
}

// Call saveSettings() after every parameter change
changeParameterLeft() {
    // ... modify parameter ...
    this.saveSettings();
    this.showSelectedValue();
}
```

**To test changes:**
- Modify the relevant module files
- Refresh the browser to see changes (F5/Ctrl+R)
- Cache-busting ensures immediate updates without hard refresh
- No build process required
- Use browser dev tools for debugging
- Console logging available for settings save/load flow debugging

## Technical Configuration

- **Analog Clocks (1 & 4)**: 8 FPS, PixiJS with WebGL/Canvas rendering, responsive scaling
- **Digital Clock (2)**: 1 second updates, CSS-based with font smoothing control
- **7-Segment LED (3)**: 1 second updates, pure CSS segments with realistic spacing
- **DSEG Clock (5)**: 1 second updates, DSEG7 font variants with dynamic loading
- **Fonts**: Custom TTF fonts + system font fallbacks for cross-platform compatibility
- **Resolution**: Auto-scaling with pixel-perfect options for crisp rendering
- **Responsive**: All clocks support fullscreen and window resizing

## File Structure

```
MultiClock/
├── index.html                          # Main application controller
├── clocks/
│   ├── 1_analog-clock.js               # PixiJS analog clock with color system
│   ├── 2_digital-clock.js              # CSS digital clock with fonts & rendering
│   ├── 3_7segment-led.js               # 7-segment LED display simulation
│   ├── 4_aviation-clock.js             # Slim aviation-style analog clock
│   └── 5_dseg-clock.js                 # DSEG 7-segment font clock
├── fonts/
│   ├── PMDG_NG3_DU_A.ttf              # Aviation-style digital font
│   ├── AppleII-PrintChar21.ttf        # Retro computer font
│   ├── Perfect DOS VGA 437.ttf        # DOS/VGA style font
│   ├── PMDG_NG3_DU_A-SC70x85-baseline.ttf  # Condensed variant
│   ├── PMDG_NG3_LCD_9seg.ttf          # 9-segment LCD font
│   └── fonts-DSEG_v046/               # DSEG font family directory
│       ├── DSEG7-Classic/             # Classic 7-segment variants (6 styles)
│       ├── DSEG7-Modern/              # Modern 7-segment variants (6 styles)
│       ├── DSEG14-Classic/            # Classic 14-segment variants (for future use)
│       └── DSEG14-Modern/             # Modern 14-segment variants (for future use)
└── CLAUDE.md                           # This comprehensive documentation
```

## Design Principles

- **Modularity**: Each clock is self-contained with standardized interfaces
- **Consistency**: Uniform parameter navigation and display across all clocks
- **Quality**: Pixel-perfect rendering options for sharp visual output
- **Authenticity**: Real-world inspired designs (U1 watch, LED displays, digital fonts)
- **Performance**: Optimized update rates and efficient rendering
- **Accessibility**: Clear visual hierarchy and intuitive controls

## Recent Enhancements

- **Settings Persistence**: Full localStorage-based settings persistence across all clocks and browser sessions
- **Cache Busting**: HTTP headers and dynamic imports with timestamps for instant code updates
- **Advanced Color System**: Dynamic accent color calculation with authentic U1 support
- **Rendering Modes**: User-selectable crisp/pixelated options for optimal display quality
- **Realistic LED Spacing**: Proper 7-segment module gaps based on hardware standards
- **System Font Integration**: Cross-platform monospace font support (optimized font list)
- **Parameter Auto-Hide**: Clean interface with context-sensitive displays
- **Improved Ratios**: Optimized 20:14 time-to-date proportions for readability
- **DSEG Font Family**: Professional 7-segment display fonts with 12 variant combinations (Clock 5)
- **Aviation Clock**: Slim analog clock inspired by aircraft instruments (Clock 4)
- **Dynamic Font Loading**: Runtime font switching with multiple weight and style options
- **Debug Logging**: Comprehensive console logging for settings persistence debugging

This architecture provides a solid foundation for adding new clock types while maintaining consistency and quality across the entire application.