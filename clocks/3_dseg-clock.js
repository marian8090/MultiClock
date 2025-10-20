export class DSEGClock {
    // Constants for font size calculations
    static PT_TO_VMIN = 0.13889; // 1pt ≈ 0.13889vmin
    static SECONDS_SIZE_REDUCTIONS = {
        minus20: 0.8,  // -20%
        minus30: 0.7,  // -30%
        minus40: 0.6,  // -40%
        minus50: 0.5   // -50%
    };

    constructor() {
        this.container = null;
        this.clockElement = null;
        this.colonElement = null; // Separate colon element for flashing colon mode
        this.reducedSecondsElement = null;
        this.backgroundReducedSecondsElement = null;
        this.backgroundColonElement = null; // Background colon for LCD mode
        this.timeContainer = null;
        this.timeWrapper = null;
        this.backgroundTimeContainer = null;
        this.weekdayDateElement = null;
        this.temperatureElement = null;
        this.backgroundClockElement = null;
        this.backgroundWeekdayDateElement = null;
        this.backgroundTemperatureElement = null;
        this.updateInterval = null;
        this.temperatureFetchInterval = null;
        this.styleElement = null;
        this.currentTemperature = '--';
        this.currentTempHigh = '--';
        this.currentTempLow = '--';
        this.currentWindSpeed = '--';
        this.currentWindDirection = '--';

        // Available font types
        this.fontTypes = [
            { name: 'Classic', value: 'classic' },
            { name: 'Modern', value: 'modern' }
        ];

        // Available font styles
        this.fontStyles = [
            { name: 'Light', value: 'Light' },
            { name: 'Light Italic', value: 'LightItalic' },
            { name: 'Regular', value: 'Regular' },
            { name: 'Italic', value: 'Italic' },
            { name: 'Bold', value: 'Bold' },
            { name: 'Bold Italic', value: 'BoldItalic' }
        ];

        // Available colors
        this.colors = [
            { name: 'Red', value: '#ff0000' },
            { name: 'Green', value: '#00ff00' },
            { name: 'Blue', value: '#0000ff' },
            { name: 'Yellow', value: '#ffff00' },
            { name: 'Magenta', value: '#ff00ff' },
            { name: 'Cyan', value: '#00ffff' },
            { name: 'White', value: '#ffffff' },
            { name: 'NIXIE-warm', value: '#ff5f1f' },
            { name: 'NIXIE-deep', value: '#ff4e11' },
            { name: 'NIXIE-classic', value: '#ff3c00' },
            { name: 'VFD-classic', value: '#66fcf1' },
            { name: 'VFD-soft', value: '#40e0d0' },
            { name: 'LCD', value: '#000000', background: '#949F53' }
        ];

        // Available render modes
        this.renderModes = [
            { name: 'Smooth', value: 'smooth' },
            { name: 'Crisp', value: 'crisp' },
            { name: 'Pixelated', value: 'pixelated' }
        ];

        // Available seconds display modes
        this.secondsDisplayModes = [
            { name: 'Show', value: 'show' },
            { name: '-20%', value: 'minus20' },
            { name: '-30%', value: 'minus30' },
            { name: '-40%', value: 'minus40' },
            { name: '-50%', value: 'minus50' },
            { name: 'OFF-Flash-Colon', value: 'hideflashcolon' },
            { name: 'OFF-Flash-Decimal', value: 'hideflashdecimal' }
        ];

        // Available weekday display modes
        this.weekdayDisplayModes = [
            { name: 'Off', value: 'off' },
            { name: '2 Chars', value: '2chars' },
            { name: '3 Chars', value: '3chars' },
            { name: 'Full', value: 'full' },
            { name: 'Full Separate', value: 'fullseparate' }
        ];

        // Available weather display modes
        this.weatherDisplayModes = [
            { name: 'OFF', value: 'off' },
            { name: 'TEMP', value: 'temp' },
            { name: 'TEMP+HI/LO', value: 'temp_hilo' },
            { name: 'TEMP+WIND', value: 'temp_wind' }
        ];

        // Available background opacity levels (for all color schemes)
        // 50% = what was previously 25%
        this.backgroundOpacities = [
            { name: 'Off', value: 0.00 },
            { name: '5%', value: 0.025 },
            { name: '10%', value: 0.05 },
            { name: '15%', value: 0.075 },
            { name: '20%', value: 0.10 },
            { name: '25%', value: 0.125 },
            { name: '30%', value: 0.15 },
            { name: '35%', value: 0.175 },
            { name: '40%', value: 0.20 },
            { name: '45%', value: 0.225 },
            { name: '50%', value: 0.25 }
        ];

        // Available glow levels for LED effect (percentages of max intensity)
        // 100% = what was previously 80% intensity
        this.glowLevels = [
            { name: 'Off', value: 'none' },
            { name: '10%', value: '0 0 1.2px currentColor' },
            { name: '20%', value: '0 0 2.4px currentColor' },
            { name: '30%', value: '0 0 3.6px currentColor, 0 0 1.2px currentColor' },
            { name: '40%', value: '0 0 4.8px currentColor, 0 0 2.4px currentColor' },
            { name: '50%', value: '0 0 6px currentColor, 0 0 3px currentColor' },
            { name: '60%', value: '0 0 7.2px currentColor, 0 0 4.2px currentColor' },
            { name: '70%', value: '0 0 8.4px currentColor, 0 0 5.4px currentColor, 0 0 1.8px currentColor' },
            { name: '80%', value: '0 0 9.6px currentColor, 0 0 6.6px currentColor, 0 0 2.4px currentColor' },
            { name: '90%', value: '0 0 10.8px currentColor, 0 0 7.8px currentColor, 0 0 3px currentColor' },
            { name: '100%', value: '0 0 12px currentColor, 0 0 9px currentColor, 0 0 3px currentColor' }
        ];

        // Available font sizes (in points, like MS Word) - 36 to 400 with finer steps
        // Used for both time and date font sizes
        this.fontSizes = [36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 108, 116, 124, 132, 140, 148, 156, 164, 172, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 320, 340, 360, 380, 400];

        // Available line spacing options
        this.lineSpacings = [
            { name: '1x', value: 1.0 },
            { name: '2x', value: 2.0 },
            { name: '3x', value: 3.0 },
            { name: '4x', value: 4.0 },
            { name: '5x', value: 5.0 }
        ];

        // Parameters
        this.parameters = ['CLOCK MODEL', 'FONT', 'STYLE', 'TIME FONTSIZE', 'DATE FONTSIZE', 'LINE SPACING', 'FONT COLOUR', 'RENDERER', 'SECONDS', 'WEEKDAY', 'TEMP/WIND', 'BG OPACITY', 'GLOW'];
        this.currentParameterIndex = 0;

        // Reference to MultiClock instance for clock switching
        this.multiClockInstance = null;

        // Current settings
        this.currentFontType = 0; // Classic by default
        this.currentFontStyle = 3; // Italic by default
        this.currentTimeFontSizeIndex = 9; // 72pt by default (index 9 in new array)
        this.currentDateFontSizeIndex = 3; // 48pt by default (index 3 in new array)
        this.currentColor = 6; // White by default
        this.currentRenderMode = 0; // Smooth by default
        this.currentSecondsDisplay = 0; // Show by default
        this.currentWeekdayDisplay = 3; // Full by default (index 3)
        this.currentWeatherDisplay = 0; // OFF by default (index 0)
        this.currentBackgroundOpacity = 0; // Off by default (index 0)
        this.currentGlowLevel = 0; // Off by default (index 0)
        this.currentLineSpacing = 0; // 1x by default (index 0)

        // Colon blink state
        this.colonVisible = true;

        // Parameter display element
        this.parameterDisplay = null;
        this.parameterDisplayTimeout = null;

        // Settings manager (will be set by MultiClock)
        this.settingsManager = null;
        this.clockIndex = null;
    }

    init(container, savedSettings = null) {
        this.container = container;

        // Load saved settings if available
        if (savedSettings) {
            this.loadSettings(savedSettings);
        }

        this.createStyles();
        this.createHTML();
        this.createParameterDisplay();
        this.startUpdate();
        this.startTemperatureFetch();
    }

    // Get current settings for persistence
    getSettings() {
        return {
            currentFontType: this.currentFontType,
            currentFontStyle: this.currentFontStyle,
            currentTimeFontSizeIndex: this.currentTimeFontSizeIndex,
            currentDateFontSizeIndex: this.currentDateFontSizeIndex,
            currentColor: this.currentColor,
            currentRenderMode: this.currentRenderMode,
            currentSecondsDisplay: this.currentSecondsDisplay,
            currentWeekdayDisplay: this.currentWeekdayDisplay,
            currentWeatherDisplay: this.currentWeatherDisplay,
            currentBackgroundOpacity: this.currentBackgroundOpacity,
            currentGlowLevel: this.currentGlowLevel,
            currentLineSpacing: this.currentLineSpacing
        };
    }

    // Load settings from saved data
    loadSettings(settings) {
        if (settings.currentFontType !== undefined && settings.currentFontType >= 0 && settings.currentFontType < this.fontTypes.length) {
            this.currentFontType = settings.currentFontType;
        }
        if (settings.currentFontStyle !== undefined && settings.currentFontStyle >= 0 && settings.currentFontStyle < this.fontStyles.length) {
            this.currentFontStyle = settings.currentFontStyle;
        }
        if (settings.currentTimeFontSizeIndex !== undefined && settings.currentTimeFontSizeIndex >= 0 && settings.currentTimeFontSizeIndex < this.fontSizes.length) {
            this.currentTimeFontSizeIndex = settings.currentTimeFontSizeIndex;
        }
        if (settings.currentDateFontSizeIndex !== undefined && settings.currentDateFontSizeIndex >= 0 && settings.currentDateFontSizeIndex < this.fontSizes.length) {
            this.currentDateFontSizeIndex = settings.currentDateFontSizeIndex;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            this.currentColor = settings.currentColor;
        }
        if (settings.currentRenderMode !== undefined && settings.currentRenderMode >= 0 && settings.currentRenderMode < this.renderModes.length) {
            this.currentRenderMode = settings.currentRenderMode;
        }
        if (settings.currentSecondsDisplay !== undefined && settings.currentSecondsDisplay >= 0 && settings.currentSecondsDisplay < this.secondsDisplayModes.length) {
            this.currentSecondsDisplay = settings.currentSecondsDisplay;
        }
        if (settings.currentWeekdayDisplay !== undefined && settings.currentWeekdayDisplay >= 0 && settings.currentWeekdayDisplay < this.weekdayDisplayModes.length) {
            this.currentWeekdayDisplay = settings.currentWeekdayDisplay;
        }
        // Support both old (currentTemperatureDisplay) and new (currentWeatherDisplay) property names for backward compatibility
        if (settings.currentWeatherDisplay !== undefined && settings.currentWeatherDisplay >= 0 && settings.currentWeatherDisplay < this.weatherDisplayModes.length) {
            this.currentWeatherDisplay = settings.currentWeatherDisplay;
        } else if (settings.currentTemperatureDisplay !== undefined) {
            // Convert old "Show/Hide" settings to new weather display modes
            // Old: 0 = Show, 1 = Hide
            // New: 0 = OFF, 1 = TEMP, 2 = TEMP+HI/LO, 3 = TEMP+WIND
            if (settings.currentTemperatureDisplay === 0) {
                this.currentWeatherDisplay = 2; // Show -> TEMP+HI/LO (was the old "show" behavior)
            } else {
                this.currentWeatherDisplay = 0; // Hide -> OFF
            }
        }
        if (settings.currentBackgroundOpacity !== undefined && settings.currentBackgroundOpacity >= 0 && settings.currentBackgroundOpacity < this.backgroundOpacities.length) {
            this.currentBackgroundOpacity = settings.currentBackgroundOpacity;
        }
        if (settings.currentGlowLevel !== undefined && settings.currentGlowLevel >= 0 && settings.currentGlowLevel < this.glowLevels.length) {
            this.currentGlowLevel = settings.currentGlowLevel;
        }
        if (settings.currentLineSpacing !== undefined && settings.currentLineSpacing >= 0 && settings.currentLineSpacing < this.lineSpacings.length) {
            this.currentLineSpacing = settings.currentLineSpacing;
        }
    }

    // Save current settings
    saveSettings() {
        if (this.settingsManager && this.clockIndex !== null) {
            this.settingsManager.saveClockSettings(this.clockIndex, this.getSettings());
        }
    }

    createStyles() {
        this.styleElement = document.createElement('style');
        this.updateStyles();
        document.head.appendChild(this.styleElement);
    }

    updateStyles() {
        // Generate @font-face declarations for all DSEG7 and DSEG14 variants
        const fontFaces = this.generateFontFaces();

        const currentColorObj = this.colors[this.currentColor];
        const currentColor = currentColorObj.value;
        const backgroundColor = currentColorObj.background || '#000000'; // Use LCD background if available, otherwise black
        const renderMode = this.renderModes[this.currentRenderMode].value;

        // Convert point sizes to vmin using constant
        let clockFontSize = this.fontSizes[this.currentTimeFontSizeIndex] * DSEGClock.PT_TO_VMIN;
        let dateFontSize = this.fontSizes[this.currentDateFontSizeIndex] * DSEGClock.PT_TO_VMIN;
        let weekdayFontSize = dateFontSize; // Same size as date

        // Calculate percentage-reduced seconds font sizes using constants
        const baseTimeFontSize = this.fontSizes[this.currentTimeFontSizeIndex] * DSEGClock.PT_TO_VMIN;
        let minus20SecondsFontSize = baseTimeFontSize * DSEGClock.SECONDS_SIZE_REDUCTIONS.minus20;
        let minus30SecondsFontSize = baseTimeFontSize * DSEGClock.SECONDS_SIZE_REDUCTIONS.minus30;
        let minus40SecondsFontSize = baseTimeFontSize * DSEGClock.SECONDS_SIZE_REDUCTIONS.minus40;
        let minus50SecondsFontSize = baseTimeFontSize * DSEGClock.SECONDS_SIZE_REDUCTIONS.minus50;

        // Apply pixel-perfect rounding for crisp and pixelated modes
        if (renderMode === 'crisp' || renderMode === 'pixelated') {
            const vminToPx = Math.min(window.innerWidth, window.innerHeight) / 100;
            clockFontSize = Math.round(clockFontSize * vminToPx) / vminToPx;
            dateFontSize = Math.round(dateFontSize * vminToPx) / vminToPx;
            weekdayFontSize = Math.round(weekdayFontSize * vminToPx) / vminToPx;
            minus20SecondsFontSize = Math.round(minus20SecondsFontSize * vminToPx) / vminToPx;
            minus30SecondsFontSize = Math.round(minus30SecondsFontSize * vminToPx) / vminToPx;
            minus40SecondsFontSize = Math.round(minus40SecondsFontSize * vminToPx) / vminToPx;
            minus50SecondsFontSize = Math.round(minus50SecondsFontSize * vminToPx) / vminToPx;
        }

        // Generate rendering CSS based on mode
        const renderingCSS = this.getRenderingCSS(renderMode);

        // Get current font family names
        const fontFamily = this.getCurrentFontFamily();
        const weekdayFontFamily = this.getCurrentWeekdayFontFamily();

        // Get glow settings and line spacing
        const glowValue = this.glowLevels[this.currentGlowLevel].value;
        const lineHeight = this.lineSpacings[this.currentLineSpacing].value;

        // Generate glow CSS
        const glowCSS = glowValue !== 'none' ? `text-shadow: ${glowValue};` : '';

        this.styleElement.textContent = `
            ${fontFaces}

            .dseg-clock-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: ${backgroundColor};
                ${currentColorObj.background ? "background-image: url('clocks/DSEG LED background.png'); background-size: cover; background-position: center;" : ''}
                color: ${currentColor};
                font-family: '${fontFamily}', monospace;
                overflow: hidden;
                cursor: none;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                ${renderingCSS.container}
            }

            .dseg-display {
                text-align: center;
            }

            .dseg-time-container {
                margin-bottom: 0.5em;
                position: relative;
                width: 100%;
                text-align: center;
            }

            .dseg-time-wrapper {
                display: inline-block;
                position: relative;
                text-align: left;
            }

            .dseg-time {
                font-size: ${clockFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
                display: inline-block;
            }

            .dseg-time-container .dseg-background {
                opacity: ${this.backgroundOpacities[this.currentBackgroundOpacity].value};
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
                pointer-events: none;
                white-space: nowrap;
            }

            .dseg-weekday-date.dseg-background,
            .dseg-temperature.dseg-background {
                opacity: ${this.backgroundOpacities[this.currentBackgroundOpacity].value};
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1;
                pointer-events: none;
                white-space: pre;
            }

            .dseg-time-minus20-seconds {
                font-size: ${minus20SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus30-seconds {
                font-size: ${minus30SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus40-seconds {
                font-size: ${minus40SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus50-seconds {
                font-size: ${minus50SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-colon {
                font-size: ${clockFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
                display: inline;
            }

            .dseg-weekday-date-container,
            .dseg-temperature-container {
                position: relative;
            }

            .dseg-weekday-date {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                font-family: '${weekdayFontFamily}', monospace;
                text-align: center;
                max-width: 90vw;
                word-wrap: break-word;
                line-height: ${lineHeight};
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-temperature-container {
                margin-top: 0.3em;
            }

            .dseg-temperature {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                font-family: '${weekdayFontFamily}', monospace;
                text-align: center;
                ${renderingCSS.text}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .parameter-display {
                position: fixed;
                top: 0;
                left: 0;
                color: #00ff00;
                font-size: 14px;
                z-index: 1000;
                font-family: 'Courier New', Courier, monospace;
                line-height: 1;
                background: rgba(0, 0, 0, 0.3);
                padding: 8px;
                max-width: 90vw;
                overflow-x: hidden;
            }

            .parameter-row {
                margin: 0;
                padding: 0;
                white-space: nowrap;
            }

            .parameter-row.active .parameter-name {
                background: #00ff00;
                color: #000000;
            }

            .parameter-row.active .parameter-option.selected {
                background: #00ff00;
                color: #000000;
                font-weight: bold;
            }

            .parameter-name {
                display: inline;
                color: #00ff00;
            }

            .parameter-options {
                display: inline;
                color: #888888;
            }

            .parameter-option {
                display: inline;
            }

            .parameter-option.selected {
                font-weight: bold;
                color: #00ff00;
            }

            .parameter-separator {
                color: #444444;
            }
        `;
    }

    generateFontFaces() {
        const fontFaces = [];

        // Generate font-face for DSEG7 Classic variants
        this.fontStyles.forEach(style => {
            const fontName = `DSEG7Classic-${style.value}`;
            fontFaces.push(`
                @font-face {
                    font-family: '${fontName}';
                    src: url('fonts/fonts-DSEG_v046/DSEG7-Classic/DSEG7Classic-${style.value}.ttf') format('truetype');
                }
            `);
        });

        // Generate font-face for DSEG7 Modern variants
        this.fontStyles.forEach(style => {
            const fontName = `DSEG7Modern-${style.value}`;
            fontFaces.push(`
                @font-face {
                    font-family: '${fontName}';
                    src: url('fonts/fonts-DSEG_v046/DSEG7-Modern/DSEG7Modern-${style.value}.ttf') format('truetype');
                }
            `);
        });

        // Generate font-face for DSEG14 Classic variants (for weekday)
        this.fontStyles.forEach(style => {
            const fontName = `DSEG14Classic-${style.value}`;
            fontFaces.push(`
                @font-face {
                    font-family: '${fontName}';
                    src: url('fonts/fonts-DSEG_v046/DSEG14-Classic/DSEG14Classic-${style.value}.ttf') format('truetype');
                }
            `);
        });

        // Generate font-face for DSEG14 Modern variants (for weekday)
        this.fontStyles.forEach(style => {
            const fontName = `DSEG14Modern-${style.value}`;
            fontFaces.push(`
                @font-face {
                    font-family: '${fontName}';
                    src: url('fonts/fonts-DSEG_v046/DSEG14-Modern/DSEG14Modern-${style.value}.ttf') format('truetype');
                }
            `);
        });

        return fontFaces.join('\n');
    }

    getCurrentFontFamily() {
        const fontType = this.fontTypes[this.currentFontType].value;
        const fontStyle = this.fontStyles[this.currentFontStyle].value;
        const fontTypeCapitalized = fontType.charAt(0).toUpperCase() + fontType.slice(1);
        return `DSEG7${fontTypeCapitalized}-${fontStyle}`;
    }

    getCurrentWeekdayFontFamily() {
        const fontType = this.fontTypes[this.currentFontType].value;
        const fontStyle = this.fontStyles[this.currentFontStyle].value;
        const fontTypeCapitalized = fontType.charAt(0).toUpperCase() + fontType.slice(1);
        return `DSEG14${fontTypeCapitalized}-${fontStyle}`;
    }

    getRenderingCSS(renderMode) {
        switch (renderMode) {
            case 'smooth':
                return {
                    container: '',
                    text: ''
                };
            case 'crisp':
                return {
                    container: 'image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;',
                    text: '-webkit-font-smoothing: none; -moz-osx-font-smoothing: grayscale; font-smooth: never;'
                };
            case 'pixelated':
                return {
                    container: 'image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;',
                    text: '-webkit-font-smoothing: none; -moz-osx-font-smoothing: grayscale; font-smooth: never; image-rendering: pixelated;'
                };
            default:
                return {
                    container: '',
                    text: ''
                };
        }
    }

    createHTML() {
        const clockContainer = document.createElement('div');
        clockContainer.className = 'dseg-clock-container';

        const display = document.createElement('div');
        display.className = 'dseg-display';

        // Create container for time that can hold both main time and small seconds
        this.timeContainer = document.createElement('div');
        this.timeContainer.className = 'dseg-time-container';

        // Create wrapper to control positioning
        this.timeWrapper = document.createElement('div');
        this.timeWrapper.className = 'dseg-time-wrapper';

        // Create background container that mirrors the foreground layout
        this.backgroundTimeContainer = document.createElement('div');
        this.backgroundTimeContainer.className = 'dseg-background';

        // Create background inactive segments layer (for LCD mode)
        this.backgroundClockElement = document.createElement('span');
        this.backgroundClockElement.className = 'dseg-time';

        this.backgroundTimeContainer.appendChild(this.backgroundClockElement);

        this.clockElement = document.createElement('span');
        this.clockElement.className = 'dseg-time';

        // Create persistent reduced seconds elements for all sizes (initially hidden)
        // These will stay in the DOM and we'll toggle visibility instead of adding/removing
        this.reducedSecondsElement = document.createElement('span');
        this.reducedSecondsElement.style.display = 'none';

        this.backgroundReducedSecondsElement = document.createElement('span');
        this.backgroundReducedSecondsElement.style.display = 'none';

        // Create colon elements for flash-colon mode (initially hidden)
        this.colonElement = document.createElement('span');
        this.colonElement.className = 'dseg-colon';
        this.colonElement.style.display = 'none';

        this.backgroundColonElement = document.createElement('span');
        this.backgroundColonElement.className = 'dseg-colon';
        this.backgroundColonElement.style.display = 'none';

        this.timeWrapper.appendChild(this.backgroundTimeContainer);
        this.timeWrapper.appendChild(this.clockElement);
        this.timeWrapper.appendChild(this.colonElement);
        this.timeWrapper.appendChild(this.reducedSecondsElement);
        this.backgroundTimeContainer.appendChild(this.backgroundColonElement);
        this.backgroundTimeContainer.appendChild(this.backgroundReducedSecondsElement);
        this.timeContainer.appendChild(this.timeWrapper);

        // Create container for weekday/date with background
        const weekdayDateContainer = document.createElement('div');
        weekdayDateContainer.className = 'dseg-weekday-date-container';

        this.backgroundWeekdayDateElement = document.createElement('div');
        this.backgroundWeekdayDateElement.className = 'dseg-weekday-date dseg-background';

        this.weekdayDateElement = document.createElement('div');
        this.weekdayDateElement.className = 'dseg-weekday-date';

        weekdayDateContainer.appendChild(this.backgroundWeekdayDateElement);
        weekdayDateContainer.appendChild(this.weekdayDateElement);

        // Create container for temperature with background
        const temperatureContainer = document.createElement('div');
        temperatureContainer.className = 'dseg-temperature-container';

        this.backgroundTemperatureElement = document.createElement('div');
        this.backgroundTemperatureElement.className = 'dseg-temperature dseg-background';

        this.temperatureElement = document.createElement('div');
        this.temperatureElement.className = 'dseg-temperature';

        temperatureContainer.appendChild(this.backgroundTemperatureElement);
        temperatureContainer.appendChild(this.temperatureElement);

        display.appendChild(this.timeContainer);
        display.appendChild(weekdayDateContainer);
        display.appendChild(temperatureContainer);
        clockContainer.appendChild(display);

        this.container.appendChild(clockContainer);
    }

    createParameterDisplay() {
        this.parameterDisplay = document.createElement('div');
        this.parameterDisplay.className = 'parameter-display';
        this.updateParameterDisplay();
        this.container.appendChild(this.parameterDisplay);
    }

    updateParameterDisplay() {
        // Build complete menu showing all parameters with all options
        let html = '';

        this.parameters.forEach((paramName, paramIndex) => {
            const isActive = paramIndex === this.currentParameterIndex;
            const activeClass = isActive ? ' active' : '';

            // Get all options for this parameter
            const allOptions = this.getAllOptionsForParameter(paramName);
            const currentSelection = this.getCurrentSelectionForParameter(paramName);

            // Build options HTML with separators (single space between words)
            const optionsHtml = allOptions.map((option, optionIndex) => {
                const isSelected = optionIndex === currentSelection;
                const selectedClass = isSelected ? ' selected' : '';
                const separator = optionIndex < allOptions.length - 1 ? '<span class="parameter-separator"> </span>' : '';
                return `<span class="parameter-option${selectedClass}">${option}</span>${separator}`;
            }).join('');

            html += `<div class="parameter-row${activeClass}">`;
            html += `<span class="parameter-name">${paramName}: </span>`;
            html += `<span class="parameter-options">${optionsHtml}</span>`;
            html += `</div>`;
        });

        this.parameterDisplay.innerHTML = html;
        this.parameterDisplay.style.display = 'block';

        // Show clock number when parameter menu is visible
        if (this.multiClockInstance && this.multiClockInstance.showClockNumber) {
            this.multiClockInstance.showClockNumber();
        }

        // Clear existing timeout
        if (this.parameterDisplayTimeout) {
            clearTimeout(this.parameterDisplayTimeout);
        }

        // Auto-hide after 5 seconds
        this.parameterDisplayTimeout = setTimeout(() => {
            this.parameterDisplay.style.display = 'none';
            // Hide clock number when parameter menu hides
            if (this.multiClockInstance && this.multiClockInstance.hideClockNumber) {
                this.multiClockInstance.hideClockNumber();
            }
        }, 5000);
    }

    showSelectedValue() {
        // Just update the display - it will show all parameters with the new selection highlighted
        this.updateParameterDisplay();
    }

    // Helper method to get all options for a parameter
    getAllOptionsForParameter(paramName) {
        switch (paramName) {
            case 'CLOCK MODEL':
                // Get clock names from MultiClock instance if available
                if (this.multiClockInstance && this.multiClockInstance.clocks) {
                    return this.multiClockInstance.clocks.map(c => c.name);
                }
                return ['Analog', 'Digital', '7-Segment LED', 'Slim Analog', 'DSEG'];
            case 'FONT':
                return this.fontTypes.map(f => f.name);
            case 'STYLE':
                return this.fontStyles.map(f => f.name);
            case 'TIME FONTSIZE':
                return this.fontSizes.map(s => s.toString());
            case 'DATE FONTSIZE':
                return this.fontSizes.map(s => s.toString());
            case 'LINE SPACING':
                return this.lineSpacings.map(l => l.name);
            case 'FONT COLOUR':
                return this.colors.map(c => c.name);
            case 'RENDERER':
                return this.renderModes.map(r => r.name);
            case 'SECONDS':
                return this.secondsDisplayModes.map(s => s.name);
            case 'WEEKDAY':
                return this.weekdayDisplayModes.map(w => w.name);
            case 'TEMP/WIND':
                return this.weatherDisplayModes.map(t => t.name);
            case 'BG OPACITY':
                return this.backgroundOpacities.map(o => o.name);
            case 'GLOW':
                return this.glowLevels.map(g => g.name);
            default:
                return [];
        }
    }

    // Get current selected index for a parameter
    getCurrentSelectionForParameter(paramName) {
        switch (paramName) {
            case 'CLOCK MODEL':
                // Get current clock index from MultiClock instance if available
                if (this.multiClockInstance) {
                    return this.multiClockInstance.currentClockIndex;
                }
                return this.clockIndex || 0;
            case 'FONT':
                return this.currentFontType;
            case 'STYLE':
                return this.currentFontStyle;
            case 'TIME FONTSIZE':
                return this.currentTimeFontSizeIndex;
            case 'DATE FONTSIZE':
                return this.currentDateFontSizeIndex;
            case 'LINE SPACING':
                return this.currentLineSpacing;
            case 'FONT COLOUR':
                return this.currentColor;
            case 'RENDERER':
                return this.currentRenderMode;
            case 'SECONDS':
                return this.currentSecondsDisplay;
            case 'WEEKDAY':
                return this.currentWeekdayDisplay;
            case 'TEMP/WIND':
                return this.currentWeatherDisplay;
            case 'BG OPACITY':
                return this.currentBackgroundOpacity;
            case 'GLOW':
                return this.currentGlowLevel;
            default:
                return 0;
        }
    }

    // Parameter navigation methods
    navigateParameterUp() {
        this.currentParameterIndex = (this.currentParameterIndex - 1 + this.parameters.length) % this.parameters.length;
        this.updateParameterDisplay();
    }

    navigateParameterDown() {
        this.currentParameterIndex = (this.currentParameterIndex + 1) % this.parameters.length;
        this.updateParameterDisplay();
    }

    // Helper method to change parameter value by a given direction (-1 or +1)
    changeParameter(direction) {
        const parameter = this.parameters[this.currentParameterIndex];

        // Handle clock model switching separately (doesn't need save/show)
        if (parameter === 'CLOCK MODEL') {
            if (this.multiClockInstance) {
                const numClocks = this.multiClockInstance.clocks.length;
                const newIndex = (this.multiClockInstance.currentClockIndex + direction + numClocks) % numClocks;
                this.multiClockInstance.switchToClock(newIndex);
            }
            return;
        }

        // Map parameter names to their property and array names
        const parameterMap = {
            'FONT': { property: 'currentFontType', array: 'fontTypes', updateMethod: 'updateStyles' },
            'STYLE': { property: 'currentFontStyle', array: 'fontStyles', updateMethod: 'updateStyles' },
            'TIME FONTSIZE': { property: 'currentTimeFontSizeIndex', array: 'fontSizes', updateMethod: 'updateStyles' },
            'DATE FONTSIZE': { property: 'currentDateFontSizeIndex', array: 'fontSizes', updateMethod: 'updateStyles' },
            'LINE SPACING': { property: 'currentLineSpacing', array: 'lineSpacings', updateMethod: 'updateStyles' },
            'FONT COLOUR': { property: 'currentColor', array: 'colors', updateMethod: 'updateStyles' },
            'RENDERER': { property: 'currentRenderMode', array: 'renderModes', updateMethod: 'updateStyles' },
            'SECONDS': { property: 'currentSecondsDisplay', array: 'secondsDisplayModes', updateMethod: null },
            'WEEKDAY': { property: 'currentWeekdayDisplay', array: 'weekdayDisplayModes', updateMethod: null },
            'TEMP/WIND': { property: 'currentWeatherDisplay', array: 'weatherDisplayModes', updateMethod: 'updateTemperatureDisplay' },
            'BG OPACITY': { property: 'currentBackgroundOpacity', array: 'backgroundOpacities', updateMethod: 'updateStyles' },
            'GLOW': { property: 'currentGlowLevel', array: 'glowLevels', updateMethod: 'updateStyles' }
        };

        const config = parameterMap[parameter];
        if (config) {
            // Update the property value
            const arrayLength = this[config.array].length;
            this[config.property] = (this[config.property] + direction + arrayLength) % arrayLength;

            // Call update method if specified
            if (config.updateMethod) {
                this[config.updateMethod]();
            }
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    changeParameterLeft() {
        this.changeParameter(-1);
    }

    changeParameterRight() {
        this.changeParameter(1);
    }

    updateClock() {
        const now = new Date();
        const secondsMode = this.secondsDisplayModes[this.currentSecondsDisplay].value;
        const weekdayMode = this.weekdayDisplayModes[this.currentWeekdayDisplay].value;

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Determine new text content based on seconds mode
        let newTimeText = '';
        let newReducedSecondsText = '';
        let reducedSecondsClass = '';
        let showReducedSeconds = false;

        if (secondsMode === 'show') {
            newTimeText = `${hours}:${minutes}:${seconds}`;
            showReducedSeconds = false;
        } else if (secondsMode === 'minus20' || secondsMode === 'minus30' || secondsMode === 'minus40' || secondsMode === 'minus50') {
            newTimeText = `${hours}:${minutes}`;
            newReducedSecondsText = `:${seconds}`;
            reducedSecondsClass = `dseg-time-${secondsMode}-seconds`;
            showReducedSeconds = true;
        } else if (secondsMode === 'hideflashcolon') {
            // OFF-Flash-Colon: Hide seconds, flash colon at 2 Hz (illuminates every new second)
            const milliseconds = now.getMilliseconds();
            // 2 Hz = flash on for 0-499ms (first half of second)
            const newColonVisible = (milliseconds < 500);

            // Show HH:MM with colon that will fade independently
            newTimeText = `${hours}:${minutes}`;
            showReducedSeconds = false;
            this.colonVisible = newColonVisible;
        } else if (secondsMode === 'hideflashdecimal') {
            // OFF-Flash-Decimal: Static colon, decimal point flashes at 2 Hz
            const milliseconds = now.getMilliseconds();
            // 2 Hz = flash on for 0-499ms (first half of second)
            this.colonVisible = (milliseconds < 500);
            // Use reduced seconds element for the flashing decimal point
            newTimeText = `${hours}:${minutes}`;
            newReducedSecondsText = '.';
            reducedSecondsClass = 'dseg-time'; // Use standard time class
            showReducedSeconds = true;
        } else {
            // Default fallback for any other mode
            newTimeText = `${hours}:${minutes}`;
            showReducedSeconds = false;
        }

        // Handle time element
        const isFlashingColon = (secondsMode === 'hideflashcolon');

        // Update time text
        this.clockElement.textContent = newTimeText;

        // Handle colon overlay for flashing colon mode
        // The clockElement shows "HH:MM" always at full opacity
        // The colonElement overlays just the colon character with black when hidden
        if (isFlashingColon) {
            // Position colon element to overlay the actual colon in HH:MM
            this.colonElement.textContent = ':';
            this.colonElement.style.display = 'inline-block';
            this.colonElement.style.position = 'absolute';
            this.colonElement.style.left = '2ch'; // Position after "HH" (2 characters)

            // Control colon visibility by overlaying with background color
            this.colonElement.style.opacity = this.colonVisible ? '0' : '1';
            const bgColor = this.colors[this.currentColor].background || '#000000';
            this.colonElement.style.color = bgColor;
        } else {
            this.colonElement.style.display = 'none';
        }

        // Handle reduced seconds element
        if (showReducedSeconds) {
            // For hideflashdecimal mode, control visibility via opacity
            const isFlashingDecimal = (secondsMode === 'hideflashdecimal');

            this.reducedSecondsElement.textContent = newReducedSecondsText;
            this.reducedSecondsElement.className = reducedSecondsClass;
            this.reducedSecondsElement.style.display = 'inline';

            // For flashing decimal, control opacity based on colonVisible
            if (isFlashingDecimal) {
                this.reducedSecondsElement.style.opacity = this.colonVisible ? '1' : '0';
            } else {
                this.reducedSecondsElement.style.opacity = '1';
            }
        } else {
            this.reducedSecondsElement.style.display = 'none';
        }

        // Update background elements (for LCD mode)
        if (secondsMode === 'show') {
            this.backgroundClockElement.textContent = '88:88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundColonElement.style.display = 'none';
            this.backgroundReducedSecondsElement.style.display = 'none';
        } else if (secondsMode === 'hideflashdecimal') {
            // Show decimal point in background for flash-decimal mode
            this.backgroundClockElement.textContent = '88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundColonElement.style.display = 'none';
            this.backgroundReducedSecondsElement.textContent = '.';
            this.backgroundReducedSecondsElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.style.display = 'inline';
        } else if (secondsMode === 'hideflashcolon') {
            // Show full 88:88 in background for flash-colon mode
            this.backgroundClockElement.textContent = '88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundColonElement.style.display = 'none';
            this.backgroundReducedSecondsElement.style.display = 'none';
        } else if (showReducedSeconds) {
            this.backgroundClockElement.textContent = '88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundColonElement.style.display = 'none';
            this.backgroundReducedSecondsElement.textContent = ':88';
            this.backgroundReducedSecondsElement.className = `dseg-time-${secondsMode}-seconds`;
            this.backgroundReducedSecondsElement.style.display = 'inline';
        } else {
            this.backgroundClockElement.textContent = '88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundColonElement.style.display = 'none';
            this.backgroundReducedSecondsElement.style.display = 'none';
        }

        // Weekday and date display
        const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdayNames2Char = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const weekdayNames3Char = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const weekdayFull = weekdayNames[now.getDay()];
        const weekday2Char = weekdayNames2Char[now.getDay()];
        const weekday3Char = weekdayNames3Char[now.getDay()];

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}.${month}.${year}`;

        let newWeekdayDateText = '';
        let bgWeekdayText = '';

        switch (weekdayMode) {
            case 'off':
                newWeekdayDateText = dateString;
                bgWeekdayText = '88.88.8888';
                break;
            case '2chars':
                newWeekdayDateText = `${weekday2Char}  ${dateString}`;
                bgWeekdayText = '88  88.88.8888';
                break;
            case '3chars':
                newWeekdayDateText = `${weekday3Char}  ${dateString}`;
                bgWeekdayText = '888  88.88.8888';
                break;
            case 'full':
                newWeekdayDateText = `${weekdayFull}  ${dateString}`;
                bgWeekdayText = '8'.repeat(weekdayFull.length) + '  88.88.8888';
                break;
            case 'fullseparate':
                newWeekdayDateText = `${weekdayFull}\n${dateString}`;
                bgWeekdayText = '8'.repeat(weekdayFull.length) + '\n88.88.8888';
                break;
            default:
                newWeekdayDateText = dateString;
                bgWeekdayText = '88.88.8888';
        }

        // Handle weekday/date
        this.weekdayDateElement.textContent = newWeekdayDateText;
        this.weekdayDateElement.style.display = 'block';

        // Update background for weekday/date
        this.backgroundWeekdayDateElement.textContent = bgWeekdayText;
        this.backgroundWeekdayDateElement.style.display = 'block';
    }

    startUpdate() {
        this.updateClock();
        // Update every 100ms (10 times per second) to support 2 Hz flashing
        this.updateInterval = setInterval(() => this.updateClock(), 100);
    }

    async fetchTemperature() {
        try {
            // Stevenage, UK coordinates
            const latitude = 51.90;
            const longitude = -0.20;
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/London&temperature_unit=celsius&wind_speed_unit=kmh`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Get current temperature
            const temp = Math.round(data.current.temperature_2m);
            this.currentTemperature = temp.toString();

            // Get today's high and low temperatures (index 0 is today)
            const tempHigh = Math.round(data.daily.temperature_2m_max[0]);
            const tempLow = Math.round(data.daily.temperature_2m_min[0]);
            this.currentTempHigh = tempHigh.toString();
            this.currentTempLow = tempLow.toString();

            // Get wind speed (convert km/h to knots) and direction
            const windSpeedKmh = data.current.wind_speed_10m;
            const windSpeedKnots = Math.round(windSpeedKmh * 0.539957);
            this.currentWindSpeed = windSpeedKnots.toString();

            // Round wind direction to nearest 10 degrees
            const windDirection = data.current.wind_direction_10m;
            const windDirectionRounded = Math.round(windDirection / 10) * 10;
            this.currentWindDirection = windDirectionRounded.toString();

            // Update display immediately if weather is shown
            this.updateTemperatureDisplay();
        } catch (error) {
            console.error('[DSEGClock] Error fetching weather data:', error);
            this.currentTemperature = '--';
            this.currentTempHigh = '--';
            this.currentTempLow = '--';
            this.currentWindSpeed = '--';
            this.currentWindDirection = '--';
            this.updateTemperatureDisplay();
        }
    }

    updateTemperatureDisplay() {
        const weatherMode = this.weatherDisplayModes[this.currentWeatherDisplay].value;

        if (weatherMode === 'off') {
            // Hide weather display
            this.temperatureElement.textContent = '';
            this.temperatureElement.style.display = 'none';
            this.backgroundTemperatureElement.textContent = '';
            this.backgroundTemperatureElement.style.display = 'none';
        } else if (weatherMode === 'temp') {
            // Show temperature only
            const newTemperatureText = `${this.currentTemperature}°`;

            this.temperatureElement.textContent = newTemperatureText;
            this.temperatureElement.style.display = 'block';

            // Background all-segments-on for LCD mode
            this.backgroundTemperatureElement.textContent = '88°';
            this.backgroundTemperatureElement.style.display = 'block';
        } else if (weatherMode === 'temp_hilo') {
            // Show temperature with high/low
            // Using Unicode non-breaking spaces (U+00A0) for better spacing visibility
            const newTemperatureText = `${this.currentTemperature}°\u00A0\u00A0\u00A0${this.currentTempHigh}°/${this.currentTempLow}°`;

            this.temperatureElement.textContent = newTemperatureText;
            this.temperatureElement.style.display = 'block';

            // Background all-segments-on for LCD mode
            // Pattern: 88°   88°/88°  (matching temp, high/low format with all segments visible)
            this.backgroundTemperatureElement.textContent = '88°\u00A0\u00A0\u00A088°/88°';
            this.backgroundTemperatureElement.style.display = 'block';
        } else if (weatherMode === 'temp_wind') {
            // Show temperature with wind (format: 15° 10/250)
            // Using Unicode non-breaking spaces (U+00A0) for better spacing visibility
            const newTemperatureText = `${this.currentTemperature}°\u00A0\u00A0\u00A0${this.currentWindSpeed}/${this.currentWindDirection}`;

            this.temperatureElement.textContent = newTemperatureText;
            this.temperatureElement.style.display = 'block';

            // Background all-segments-on for LCD mode
            // Pattern: 88°   88/888  (matching temp, wind format with all segments visible)
            this.backgroundTemperatureElement.textContent = '88°\u00A0\u00A0\u00A088/888';
            this.backgroundTemperatureElement.style.display = 'block';
        }
    }

    startTemperatureFetch() {
        // Fetch temperature immediately
        this.fetchTemperature();

        // Fetch temperature every 10 minutes (600000 ms)
        this.temperatureFetchInterval = setInterval(() => this.fetchTemperature(), 600000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        if (this.temperatureFetchInterval) {
            clearInterval(this.temperatureFetchInterval);
            this.temperatureFetchInterval = null;
        }

        // Clean up parameter display timeout
        if (this.parameterDisplayTimeout) {
            clearTimeout(this.parameterDisplayTimeout);
        }

        // Clean up all child elements
        while (this.container && this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
}
