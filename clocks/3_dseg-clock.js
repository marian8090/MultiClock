export class DSEGClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.clockElementOld = null; // For fade transitions
        this.reducedSecondsElement = null;
        this.reducedSecondsElementOld = null; // For fade transitions
        this.backgroundReducedSecondsElement = null;
        this.timeContainer = null;
        this.timeWrapper = null;
        this.backgroundTimeContainer = null;
        this.weekdayDateElement = null;
        this.weekdayDateElementOld = null; // For fade transitions
        this.temperatureElement = null;
        this.temperatureElementOld = null; // For fade transitions
        this.backgroundClockElement = null;
        this.backgroundWeekdayDateElement = null;
        this.backgroundTemperatureElement = null;
        this.updateInterval = null;
        this.temperatureFetchInterval = null;
        this.styleElement = null;
        this.currentTemperature = '--';
        this.currentTempHigh = '--';
        this.currentTempLow = '--';

        // Track previous values for fade detection
        this.previousTimeText = '';
        this.previousReducedSecondsText = '';
        this.previousWeekdayDateText = '';
        this.previousTemperatureText = '';

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

        // Available temperature display modes
        this.temperatureDisplayModes = [
            { name: 'Show', value: 'show' },
            { name: 'Hide', value: 'hide' }
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

        // Available fade times for smooth transitions
        this.fadeTimes = [
            { name: 'Off', value: 0 },
            { name: '0.05s', value: 0.05 },
            { name: '0.1s', value: 0.1 },
            { name: '0.2s', value: 0.2 },
            { name: '0.3s', value: 0.3 },
            { name: '0.4s', value: 0.4 },
            { name: '0.5s', value: 0.5 }
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
        this.timeFontSizes = [36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 108, 116, 124, 132, 140, 148, 156, 164, 172, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 320, 340, 360, 380, 400];
        this.dateFontSizes = [36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 108, 116, 124, 132, 140, 148, 156, 164, 172, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 320, 340, 360, 380, 400];

        // Available line spacing options
        this.lineSpacings = [
            { name: '1x', value: 1.0 },
            { name: '2x', value: 2.0 },
            { name: '3x', value: 3.0 },
            { name: '4x', value: 4.0 },
            { name: '5x', value: 5.0 }
        ];

        // Parameters
        this.parameters = ['CLOCK MODEL', 'FONT', 'STYLE', 'TIME FONTSIZE', 'DATE FONTSIZE', 'LINE SPACING', 'FONT COLOUR', 'RENDERER', 'SECONDS', 'WEEKDAY', 'TEMPERATURE', 'BG OPACITY', 'FADE TIME', 'GLOW'];
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
        this.currentTemperatureDisplay = 1; // Hide by default
        this.currentBackgroundOpacity = 0; // Off by default (index 0)
        this.currentFadeTime = 0; // Off by default (index 0)
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

        console.log('[DSEGClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[DSEGClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[DSEGClock] After loadSettings() - currentFontType:', this.currentFontType, 'currentFontStyle:', this.currentFontStyle, 'currentFontSizeMultiplier:', this.currentFontSizeMultiplier, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
        } else {
            console.log('[DSEGClock] No saved settings, using defaults');
        }

        this.createStyles();
        this.createHTML();
        this.createParameterDisplay();
        this.startUpdate();
        this.startTemperatureFetch();
    }

    // Get current settings for persistence
    getSettings() {
        const settings = {
            currentFontType: this.currentFontType,
            currentFontStyle: this.currentFontStyle,
            currentTimeFontSizeIndex: this.currentTimeFontSizeIndex,
            currentDateFontSizeIndex: this.currentDateFontSizeIndex,
            currentColor: this.currentColor,
            currentRenderMode: this.currentRenderMode,
            currentSecondsDisplay: this.currentSecondsDisplay,
            currentWeekdayDisplay: this.currentWeekdayDisplay,
            currentTemperatureDisplay: this.currentTemperatureDisplay,
            currentBackgroundOpacity: this.currentBackgroundOpacity,
            currentFadeTime: this.currentFadeTime,
            currentGlowLevel: this.currentGlowLevel,
            currentLineSpacing: this.currentLineSpacing
        };
        console.log('[DSEGClock] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[DSEGClock] loadSettings() called with:', settings);

        if (settings.currentFontType !== undefined && settings.currentFontType >= 0 && settings.currentFontType < this.fontTypes.length) {
            console.log('[DSEGClock] Setting currentFontType to:', settings.currentFontType);
            this.currentFontType = settings.currentFontType;
        }
        if (settings.currentFontStyle !== undefined && settings.currentFontStyle >= 0 && settings.currentFontStyle < this.fontStyles.length) {
            console.log('[DSEGClock] Setting currentFontStyle to:', settings.currentFontStyle);
            this.currentFontStyle = settings.currentFontStyle;
        }
        if (settings.currentTimeFontSizeIndex !== undefined && settings.currentTimeFontSizeIndex >= 0 && settings.currentTimeFontSizeIndex < this.timeFontSizes.length) {
            console.log('[DSEGClock] Setting currentTimeFontSizeIndex to:', settings.currentTimeFontSizeIndex);
            this.currentTimeFontSizeIndex = settings.currentTimeFontSizeIndex;
        }
        if (settings.currentDateFontSizeIndex !== undefined && settings.currentDateFontSizeIndex >= 0 && settings.currentDateFontSizeIndex < this.dateFontSizes.length) {
            console.log('[DSEGClock] Setting currentDateFontSizeIndex to:', settings.currentDateFontSizeIndex);
            this.currentDateFontSizeIndex = settings.currentDateFontSizeIndex;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[DSEGClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentRenderMode !== undefined && settings.currentRenderMode >= 0 && settings.currentRenderMode < this.renderModes.length) {
            console.log('[DSEGClock] Setting currentRenderMode to:', settings.currentRenderMode);
            this.currentRenderMode = settings.currentRenderMode;
        }
        if (settings.currentSecondsDisplay !== undefined && settings.currentSecondsDisplay >= 0 && settings.currentSecondsDisplay < this.secondsDisplayModes.length) {
            console.log('[DSEGClock] Setting currentSecondsDisplay to:', settings.currentSecondsDisplay);
            this.currentSecondsDisplay = settings.currentSecondsDisplay;
        }
        if (settings.currentWeekdayDisplay !== undefined && settings.currentWeekdayDisplay >= 0 && settings.currentWeekdayDisplay < this.weekdayDisplayModes.length) {
            console.log('[DSEGClock] Setting currentWeekdayDisplay to:', settings.currentWeekdayDisplay);
            this.currentWeekdayDisplay = settings.currentWeekdayDisplay;
        }
        if (settings.currentTemperatureDisplay !== undefined && settings.currentTemperatureDisplay >= 0 && settings.currentTemperatureDisplay < this.temperatureDisplayModes.length) {
            console.log('[DSEGClock] Setting currentTemperatureDisplay to:', settings.currentTemperatureDisplay);
            this.currentTemperatureDisplay = settings.currentTemperatureDisplay;
        }
        if (settings.currentBackgroundOpacity !== undefined && settings.currentBackgroundOpacity >= 0 && settings.currentBackgroundOpacity < this.backgroundOpacities.length) {
            console.log('[DSEGClock] Setting currentBackgroundOpacity to:', settings.currentBackgroundOpacity);
            this.currentBackgroundOpacity = settings.currentBackgroundOpacity;
        }
        if (settings.currentFadeTime !== undefined && settings.currentFadeTime >= 0 && settings.currentFadeTime < this.fadeTimes.length) {
            console.log('[DSEGClock] Setting currentFadeTime to:', settings.currentFadeTime);
            this.currentFadeTime = settings.currentFadeTime;
        }
        if (settings.currentGlowLevel !== undefined && settings.currentGlowLevel >= 0 && settings.currentGlowLevel < this.glowLevels.length) {
            console.log('[DSEGClock] Setting currentGlowLevel to:', settings.currentGlowLevel);
            this.currentGlowLevel = settings.currentGlowLevel;
        }
        if (settings.currentLineSpacing !== undefined && settings.currentLineSpacing >= 0 && settings.currentLineSpacing < this.lineSpacings.length) {
            console.log('[DSEGClock] Setting currentLineSpacing to:', settings.currentLineSpacing);
            this.currentLineSpacing = settings.currentLineSpacing;
        }

        console.log('[DSEGClock] loadSettings() complete. Final values - currentFontType:', this.currentFontType, 'currentFontStyle:', this.currentFontStyle, 'currentTimeFontSizeIndex:', this.currentTimeFontSizeIndex, 'currentDateFontSizeIndex:', this.currentDateFontSizeIndex, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode, 'currentSecondsDisplay:', this.currentSecondsDisplay, 'currentWeekdayDisplay:', this.currentWeekdayDisplay, 'currentTemperatureDisplay:', this.currentTemperatureDisplay, 'currentBackgroundOpacity:', this.currentBackgroundOpacity, 'currentFadeTime:', this.currentFadeTime, 'currentGlowLevel:', this.currentGlowLevel, 'currentLineSpacing:', this.currentLineSpacing);
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

        // Convert point sizes to vmin (1pt ≈ 0.13889vmin)
        let clockFontSize = this.timeFontSizes[this.currentTimeFontSizeIndex] * 0.13889;
        let dateFontSize = this.dateFontSizes[this.currentDateFontSizeIndex] * 0.13889;
        let weekdayFontSize = dateFontSize; // Same size as date

        // Calculate percentage-reduced seconds font sizes
        const baseTimeFontSize = this.timeFontSizes[this.currentTimeFontSizeIndex] * 0.13889;
        let minus20SecondsFontSize = baseTimeFontSize * 0.8;  // -20%
        let minus30SecondsFontSize = baseTimeFontSize * 0.7;  // -30%
        let minus40SecondsFontSize = baseTimeFontSize * 0.6;  // -40%
        let minus50SecondsFontSize = baseTimeFontSize * 0.5;  // -50%

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

        // Get fade time, glow settings, and line spacing
        const fadeTime = this.fadeTimes[this.currentFadeTime].value;
        const glowValue = this.glowLevels[this.currentGlowLevel].value;
        const lineHeight = this.lineSpacings[this.currentLineSpacing].value;

        // Generate transition CSS for opacity (will be controlled via JavaScript for cross-fade)
        const transitionCSS = fadeTime > 0 ? `transition: opacity ${fadeTime}s ease;` : '';
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
                ${this.currentColor === 7 ? "background-image: url('clocks/DSEG LED background.png'); background-size: cover; background-position: center;" : ''}
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
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-old {
                font-size: ${clockFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
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
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus20-seconds-old {
                font-size: ${minus20SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }

            .dseg-time-minus30-seconds {
                font-size: ${minus30SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus30-seconds-old {
                font-size: ${minus30SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }

            .dseg-time-minus40-seconds {
                font-size: ${minus40SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus40-seconds-old {
                font-size: ${minus40SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }

            .dseg-time-minus50-seconds {
                font-size: ${minus50SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-time-minus50-seconds-old {
                font-size: ${minus50SecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
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
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-weekday-date-old {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                font-family: '${weekdayFontFamily}', monospace;
                text-align: center;
                max-width: 90vw;
                word-wrap: break-word;
                line-height: ${lineHeight};
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                pointer-events: none;
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
                ${transitionCSS}
                ${glowCSS}
                z-index: 2;
                white-space: pre;
                position: relative;
            }

            .dseg-temperature-old {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0;
                font-family: '${weekdayFontFamily}', monospace;
                text-align: center;
                ${renderingCSS.text}
                ${transitionCSS}
                ${glowCSS}
                z-index: 3;
                white-space: pre;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                pointer-events: none;
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
                overflow-x: auto;
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

        // Create "old" layer for fade transitions
        this.clockElementOld = document.createElement('span');
        this.clockElementOld.className = 'dseg-time-old';
        this.clockElementOld.style.opacity = '0';

        // Create persistent reduced seconds elements for all sizes (initially hidden)
        // These will stay in the DOM and we'll toggle visibility instead of adding/removing
        this.reducedSecondsElement = document.createElement('span');
        this.reducedSecondsElement.style.display = 'none';

        this.reducedSecondsElementOld = document.createElement('span');
        this.reducedSecondsElementOld.style.display = 'none';
        this.reducedSecondsElementOld.style.opacity = '0';

        this.backgroundReducedSecondsElement = document.createElement('span');
        this.backgroundReducedSecondsElement.style.display = 'none';

        this.timeWrapper.appendChild(this.backgroundTimeContainer);
        this.timeWrapper.appendChild(this.clockElement);
        this.timeWrapper.appendChild(this.clockElementOld);
        this.timeWrapper.appendChild(this.reducedSecondsElement);
        this.timeWrapper.appendChild(this.reducedSecondsElementOld);
        this.backgroundTimeContainer.appendChild(this.backgroundReducedSecondsElement);
        this.timeContainer.appendChild(this.timeWrapper);

        // Create container for weekday/date with background
        const weekdayDateContainer = document.createElement('div');
        weekdayDateContainer.className = 'dseg-weekday-date-container';

        this.backgroundWeekdayDateElement = document.createElement('div');
        this.backgroundWeekdayDateElement.className = 'dseg-weekday-date dseg-background';

        this.weekdayDateElement = document.createElement('div');
        this.weekdayDateElement.className = 'dseg-weekday-date';

        // Create "old" layer for weekday/date fade transitions
        this.weekdayDateElementOld = document.createElement('div');
        this.weekdayDateElementOld.className = 'dseg-weekday-date-old';
        this.weekdayDateElementOld.style.opacity = '0';

        weekdayDateContainer.appendChild(this.backgroundWeekdayDateElement);
        weekdayDateContainer.appendChild(this.weekdayDateElement);
        weekdayDateContainer.appendChild(this.weekdayDateElementOld);

        // Create container for temperature with background
        const temperatureContainer = document.createElement('div');
        temperatureContainer.className = 'dseg-temperature-container';

        this.backgroundTemperatureElement = document.createElement('div');
        this.backgroundTemperatureElement.className = 'dseg-temperature dseg-background';

        this.temperatureElement = document.createElement('div');
        this.temperatureElement.className = 'dseg-temperature';

        // Create "old" layer for temperature fade transitions
        this.temperatureElementOld = document.createElement('div');
        this.temperatureElementOld.className = 'dseg-temperature-old';
        this.temperatureElementOld.style.opacity = '0';

        temperatureContainer.appendChild(this.backgroundTemperatureElement);
        temperatureContainer.appendChild(this.temperatureElement);
        temperatureContainer.appendChild(this.temperatureElementOld);

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
                return this.timeFontSizes.map(s => s.toString());
            case 'DATE FONTSIZE':
                return this.dateFontSizes.map(s => s.toString());
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
            case 'TEMPERATURE':
                return this.temperatureDisplayModes.map(t => t.name);
            case 'BG OPACITY':
                return this.backgroundOpacities.map(o => o.name);
            case 'FADE TIME':
                return this.fadeTimes.map(f => f.name);
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
            case 'TEMPERATURE':
                return this.currentTemperatureDisplay;
            case 'BG OPACITY':
                return this.currentBackgroundOpacity;
            case 'FADE TIME':
                return this.currentFadeTime;
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

    changeParameterLeft() {
        const parameter = this.parameters[this.currentParameterIndex];

        switch (parameter) {
            case 'CLOCK MODEL':
                // Switch to previous clock
                if (this.multiClockInstance) {
                    const numClocks = this.multiClockInstance.clocks.length;
                    const newIndex = (this.multiClockInstance.currentClockIndex - 1 + numClocks) % numClocks;
                    this.multiClockInstance.switchToClock(newIndex);
                }
                return; // Don't save settings or show value (clock is switching)
            case 'FONT':
                this.currentFontType = (this.currentFontType - 1 + this.fontTypes.length) % this.fontTypes.length;
                this.updateStyles();
                break;
            case 'STYLE':
                this.currentFontStyle = (this.currentFontStyle - 1 + this.fontStyles.length) % this.fontStyles.length;
                this.updateStyles();
                break;
            case 'TIME FONTSIZE':
                this.currentTimeFontSizeIndex = (this.currentTimeFontSizeIndex - 1 + this.timeFontSizes.length) % this.timeFontSizes.length;
                this.updateStyles();
                break;
            case 'DATE FONTSIZE':
                this.currentDateFontSizeIndex = (this.currentDateFontSizeIndex - 1 + this.dateFontSizes.length) % this.dateFontSizes.length;
                this.updateStyles();
                break;
            case 'LINE SPACING':
                this.currentLineSpacing = (this.currentLineSpacing - 1 + this.lineSpacings.length) % this.lineSpacings.length;
                this.updateStyles();
                break;
            case 'FONT COLOUR':
                this.currentColor = (this.currentColor - 1 + this.colors.length) % this.colors.length;
                this.updateStyles();
                break;
            case 'RENDERER':
                this.currentRenderMode = (this.currentRenderMode - 1 + this.renderModes.length) % this.renderModes.length;
                this.updateStyles();
                break;
            case 'SECONDS':
                this.currentSecondsDisplay = (this.currentSecondsDisplay - 1 + this.secondsDisplayModes.length) % this.secondsDisplayModes.length;
                break;
            case 'WEEKDAY':
                this.currentWeekdayDisplay = (this.currentWeekdayDisplay - 1 + this.weekdayDisplayModes.length) % this.weekdayDisplayModes.length;
                break;
            case 'TEMPERATURE':
                this.currentTemperatureDisplay = (this.currentTemperatureDisplay - 1 + this.temperatureDisplayModes.length) % this.temperatureDisplayModes.length;
                this.updateTemperatureDisplay();
                break;
            case 'BG OPACITY':
                this.currentBackgroundOpacity = (this.currentBackgroundOpacity - 1 + this.backgroundOpacities.length) % this.backgroundOpacities.length;
                this.updateStyles();
                break;
            case 'FADE TIME':
                this.currentFadeTime = (this.currentFadeTime - 1 + this.fadeTimes.length) % this.fadeTimes.length;
                this.updateStyles();
                break;
            case 'GLOW':
                this.currentGlowLevel = (this.currentGlowLevel - 1 + this.glowLevels.length) % this.glowLevels.length;
                this.updateStyles();
                break;
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    changeParameterRight() {
        const parameter = this.parameters[this.currentParameterIndex];

        switch (parameter) {
            case 'CLOCK MODEL':
                // Switch to next clock
                if (this.multiClockInstance) {
                    const numClocks = this.multiClockInstance.clocks.length;
                    const newIndex = (this.multiClockInstance.currentClockIndex + 1) % numClocks;
                    this.multiClockInstance.switchToClock(newIndex);
                }
                return; // Don't save settings or show value (clock is switching)
            case 'FONT':
                this.currentFontType = (this.currentFontType + 1) % this.fontTypes.length;
                this.updateStyles();
                break;
            case 'STYLE':
                this.currentFontStyle = (this.currentFontStyle + 1) % this.fontStyles.length;
                this.updateStyles();
                break;
            case 'TIME FONTSIZE':
                this.currentTimeFontSizeIndex = (this.currentTimeFontSizeIndex + 1) % this.timeFontSizes.length;
                this.updateStyles();
                break;
            case 'DATE FONTSIZE':
                this.currentDateFontSizeIndex = (this.currentDateFontSizeIndex + 1) % this.dateFontSizes.length;
                this.updateStyles();
                break;
            case 'LINE SPACING':
                this.currentLineSpacing = (this.currentLineSpacing + 1) % this.lineSpacings.length;
                this.updateStyles();
                break;
            case 'FONT COLOUR':
                this.currentColor = (this.currentColor + 1) % this.colors.length;
                this.updateStyles();
                break;
            case 'RENDERER':
                this.currentRenderMode = (this.currentRenderMode + 1) % this.renderModes.length;
                this.updateStyles();
                break;
            case 'SECONDS':
                this.currentSecondsDisplay = (this.currentSecondsDisplay + 1) % this.secondsDisplayModes.length;
                break;
            case 'WEEKDAY':
                this.currentWeekdayDisplay = (this.currentWeekdayDisplay + 1) % this.weekdayDisplayModes.length;
                break;
            case 'TEMPERATURE':
                this.currentTemperatureDisplay = (this.currentTemperatureDisplay + 1) % this.temperatureDisplayModes.length;
                this.updateTemperatureDisplay();
                break;
            case 'BG OPACITY':
                this.currentBackgroundOpacity = (this.currentBackgroundOpacity + 1) % this.backgroundOpacities.length;
                this.updateStyles();
                break;
            case 'FADE TIME':
                this.currentFadeTime = (this.currentFadeTime + 1) % this.fadeTimes.length;
                this.updateStyles();
                break;
            case 'GLOW':
                this.currentGlowLevel = (this.currentGlowLevel + 1) % this.glowLevels.length;
                this.updateStyles();
                break;
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    updateClock() {
        const now = new Date();
        const secondsMode = this.secondsDisplayModes[this.currentSecondsDisplay].value;
        const weekdayMode = this.weekdayDisplayModes[this.currentWeekdayDisplay].value;
        const fadeEnabled = this.fadeTimes[this.currentFadeTime].value > 0;

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

            // Use reduced seconds element for the flashing colon to enable smooth fading
            newTimeText = `${hours} ${minutes}`; // Space as placeholder
            newReducedSecondsText = ':'; // Colon that will fade
            reducedSecondsClass = 'dseg-time';
            showReducedSeconds = true;
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

        // Handle time element cross-fade
        if (fadeEnabled && this.previousTimeText !== '' && this.previousTimeText !== newTimeText) {
            // Content changed - trigger cross-fade
            this.clockElementOld.textContent = this.previousTimeText;
            this.clockElementOld.style.opacity = '1';
            this.clockElement.textContent = newTimeText;
            this.clockElement.style.opacity = '0';

            // Use requestAnimationFrame to ensure initial state is rendered before transition
            requestAnimationFrame(() => {
                this.clockElementOld.style.opacity = '0';
                this.clockElement.style.opacity = '1';
            });
        } else {
            // No fade needed - instant update
            this.clockElement.textContent = newTimeText;
            this.clockElement.style.opacity = '1';
            this.clockElementOld.style.opacity = '0';
        }

        // Handle reduced seconds element cross-fade
        if (showReducedSeconds) {
            // For hideflashdecimal and hideflashcolon modes, control visibility via opacity
            const isFlashing = (secondsMode === 'hideflashdecimal' || secondsMode === 'hideflashcolon');

            if (fadeEnabled && this.previousReducedSecondsText !== '' && this.previousReducedSecondsText !== newReducedSecondsText && !isFlashing) {
                // Content changed - trigger cross-fade (but not for flashing modes)
                this.reducedSecondsElementOld.textContent = this.previousReducedSecondsText;
                this.reducedSecondsElementOld.className = reducedSecondsClass + '-old';
                this.reducedSecondsElementOld.style.display = 'inline';
                this.reducedSecondsElementOld.style.opacity = '1';
                this.reducedSecondsElement.textContent = newReducedSecondsText;
                this.reducedSecondsElement.className = reducedSecondsClass;
                this.reducedSecondsElement.style.display = 'inline';
                this.reducedSecondsElement.style.opacity = '0';

                // Use requestAnimationFrame to ensure initial state is rendered before transition
                requestAnimationFrame(() => {
                    this.reducedSecondsElementOld.style.opacity = '0';
                    this.reducedSecondsElement.style.opacity = '1';
                });
            } else {
                // No fade needed or flashing mode
                this.reducedSecondsElement.textContent = newReducedSecondsText;
                this.reducedSecondsElement.className = reducedSecondsClass;
                this.reducedSecondsElement.style.display = 'inline';

                // For flashing modes, control opacity based on colonVisible
                if (isFlashing) {
                    this.reducedSecondsElement.style.opacity = this.colonVisible ? '1' : '0';
                } else {
                    this.reducedSecondsElement.style.opacity = '1';
                }

                this.reducedSecondsElementOld.style.opacity = '0';
            }
        } else {
            this.reducedSecondsElement.style.display = 'none';
            this.reducedSecondsElementOld.style.display = 'none';
        }

        // Update background elements (for LCD mode)
        if (secondsMode === 'show') {
            this.backgroundClockElement.textContent = '88:88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.style.display = 'none';
        } else if (secondsMode === 'hideflashdecimal') {
            // Show decimal point in background for flash-decimal mode
            this.backgroundClockElement.textContent = '88 88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.textContent = '.';
            this.backgroundReducedSecondsElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.style.display = 'inline';
        } else if (secondsMode === 'hideflashcolon') {
            // Show colon in background for flash-colon mode
            this.backgroundClockElement.textContent = '88 88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.textContent = ':';
            this.backgroundReducedSecondsElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.style.display = 'inline';
        } else if (showReducedSeconds) {
            this.backgroundClockElement.textContent = '88:88';
            this.backgroundClockElement.className = 'dseg-time';
            this.backgroundReducedSecondsElement.textContent = ':88';
            this.backgroundReducedSecondsElement.className = `dseg-time-${secondsMode}-seconds`;
            this.backgroundReducedSecondsElement.style.display = 'inline';
        } else {
            this.backgroundClockElement.textContent = '88:88';
            this.backgroundClockElement.className = 'dseg-time';
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

        // Handle weekday/date cross-fade
        if (fadeEnabled && this.previousWeekdayDateText !== '' && this.previousWeekdayDateText !== newWeekdayDateText) {
            this.weekdayDateElementOld.textContent = this.previousWeekdayDateText;
            this.weekdayDateElementOld.style.display = 'block';
            this.weekdayDateElementOld.style.opacity = '1';
            this.weekdayDateElement.textContent = newWeekdayDateText;
            this.weekdayDateElement.style.display = 'block';
            this.weekdayDateElement.style.opacity = '0';

            // Use requestAnimationFrame to ensure initial state is rendered before transition
            requestAnimationFrame(() => {
                this.weekdayDateElementOld.style.opacity = '0';
                this.weekdayDateElement.style.opacity = '1';
            });
        } else {
            this.weekdayDateElement.textContent = newWeekdayDateText;
            this.weekdayDateElement.style.display = 'block';
            this.weekdayDateElement.style.opacity = '1';
            this.weekdayDateElementOld.style.opacity = '0';
        }

        // Update background for weekday/date
        this.backgroundWeekdayDateElement.textContent = bgWeekdayText;
        this.backgroundWeekdayDateElement.style.display = 'block';

        // Store current values for next update
        this.previousTimeText = newTimeText;
        this.previousReducedSecondsText = newReducedSecondsText;
        this.previousWeekdayDateText = newWeekdayDateText;
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
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/London&temperature_unit=celsius`;

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

            // Update display immediately if temperature is shown
            this.updateTemperatureDisplay();
        } catch (error) {
            console.error('[DSEGClock] Error fetching temperature:', error);
            this.currentTemperature = '--';
            this.currentTempHigh = '--';
            this.currentTempLow = '--';
            this.updateTemperatureDisplay();
        }
    }

    updateTemperatureDisplay() {
        const temperatureMode = this.temperatureDisplayModes[this.currentTemperatureDisplay].value;
        const fadeEnabled = this.fadeTimes[this.currentFadeTime].value > 0;

        if (temperatureMode === 'show') {
            // Using Unicode non-breaking spaces (U+00A0) for better spacing visibility
            const newTemperatureText = `${this.currentTemperature}°\u00A0\u00A0\u00A0${this.currentTempHigh}°/${this.currentTempLow}°`;

            // Handle temperature cross-fade
            if (fadeEnabled && this.previousTemperatureText !== '' && this.previousTemperatureText !== newTemperatureText) {
                this.temperatureElementOld.textContent = this.previousTemperatureText;
                this.temperatureElementOld.style.display = 'block';
                this.temperatureElementOld.style.opacity = '1';
                this.temperatureElement.textContent = newTemperatureText;
                this.temperatureElement.style.display = 'block';
                this.temperatureElement.style.opacity = '0';

                // Use requestAnimationFrame to ensure initial state is rendered before transition
                requestAnimationFrame(() => {
                    this.temperatureElementOld.style.opacity = '0';
                    this.temperatureElement.style.opacity = '1';
                });
            } else {
                this.temperatureElement.textContent = newTemperatureText;
                this.temperatureElement.style.display = 'block';
                this.temperatureElement.style.opacity = '1';
                this.temperatureElementOld.style.opacity = '0';
            }

            // Store for next update
            this.previousTemperatureText = newTemperatureText;

            // Background all-segments-on for LCD mode
            // Pattern: 88°   88°/88°  (matching temp, high/low format with all segments visible)
            this.backgroundTemperatureElement.textContent = '88°\u00A0\u00A0\u00A088°/88°';
            this.backgroundTemperatureElement.style.display = 'block';
        } else {
            this.temperatureElement.textContent = '';
            this.temperatureElement.style.display = 'none';
            this.temperatureElementOld.style.opacity = '0';
            this.backgroundTemperatureElement.textContent = '';
            this.backgroundTemperatureElement.style.display = 'none';
            this.previousTemperatureText = '';
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
