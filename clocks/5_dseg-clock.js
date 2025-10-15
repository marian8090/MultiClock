export class DSEGClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.weekdayElement = null;
        this.dateElement = null;
        this.updateInterval = null;
        this.styleElement = null;

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
            { name: 'White', value: '#ffffff' }
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
            { name: 'Hide', value: 'hide' }
        ];

        // Available weekday display modes
        this.weekdayDisplayModes = [
            { name: 'Show', value: 'show' },
            { name: 'Hide', value: 'hide' }
        ];

        // Available font sizes (in points, like MS Word)
        this.timeFontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96, 144, 200, 288];
        this.dateFontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96, 144, 200, 288];

        // Parameters
        this.parameters = ['FONT', 'STYLE', 'TIME FONTSIZE', 'DATE FONTSIZE', 'FONT COLOUR', 'RENDERER', 'SECONDS', 'WEEKDAY'];
        this.currentParameterIndex = 0;

        // Current settings
        this.currentFontType = 0; // Classic by default
        this.currentFontStyle = 3; // Italic by default
        this.currentTimeFontSizeIndex = 15; // 72pt by default
        this.currentDateFontSizeIndex = 14; // 48pt by default
        this.currentColor = 6; // White by default
        this.currentRenderMode = 0; // Smooth by default
        this.currentSecondsDisplay = 0; // Show by default
        this.currentWeekdayDisplay = 0; // Show by default

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
            currentWeekdayDisplay: this.currentWeekdayDisplay
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

        console.log('[DSEGClock] loadSettings() complete. Final values - currentFontType:', this.currentFontType, 'currentFontStyle:', this.currentFontStyle, 'currentTimeFontSizeIndex:', this.currentTimeFontSizeIndex, 'currentDateFontSizeIndex:', this.currentDateFontSizeIndex, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode, 'currentSecondsDisplay:', this.currentSecondsDisplay, 'currentWeekdayDisplay:', this.currentWeekdayDisplay);
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

        const currentColor = this.colors[this.currentColor].value;
        const renderMode = this.renderModes[this.currentRenderMode].value;

        // Convert point sizes to vmin (1pt ≈ 0.13889vmin)
        let clockFontSize = this.timeFontSizes[this.currentTimeFontSizeIndex] * 0.13889;
        let dateFontSize = this.dateFontSizes[this.currentDateFontSizeIndex] * 0.13889;
        let weekdayFontSize = dateFontSize; // Same size as date

        // Apply pixel-perfect rounding for crisp and pixelated modes
        if (renderMode === 'crisp' || renderMode === 'pixelated') {
            const vminToPx = Math.min(window.innerWidth, window.innerHeight) / 100;
            clockFontSize = Math.round(clockFontSize * vminToPx) / vminToPx;
            dateFontSize = Math.round(dateFontSize * vminToPx) / vminToPx;
            weekdayFontSize = Math.round(weekdayFontSize * vminToPx) / vminToPx;
        }

        // Generate rendering CSS based on mode
        const renderingCSS = this.getRenderingCSS(renderMode);

        // Get current font family names
        const fontFamily = this.getCurrentFontFamily();
        const weekdayFontFamily = this.getCurrentWeekdayFontFamily();

        this.styleElement.textContent = `
            ${fontFaces}

            .dseg-clock-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: black;
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

            .dseg-time {
                font-size: ${clockFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                margin-bottom: 0.5em;
                ${renderingCSS.text}
            }

            .dseg-weekday {
                font-size: ${weekdayFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                margin-bottom: 0.5em;
                font-family: '${weekdayFontFamily}', monospace;
                ${renderingCSS.text}
            }

            .dseg-date {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                ${renderingCSS.text}
            }

            .parameter-display {
                position: fixed;
                top: 20px;
                left: 20px;
                color: #00ff00;
                font-size: 14px;
                z-index: 1000;
                font-family: 'Courier New', Courier, monospace;
                opacity: 0.9;
                white-space: pre;
                line-height: 1.4;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px;
                border-radius: 4px;
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

        this.clockElement = document.createElement('div');
        this.clockElement.className = 'dseg-time';

        this.weekdayElement = document.createElement('div');
        this.weekdayElement.className = 'dseg-weekday';

        this.dateElement = document.createElement('div');
        this.dateElement.className = 'dseg-date';

        display.appendChild(this.clockElement);
        display.appendChild(this.weekdayElement);
        display.appendChild(this.dateElement);
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
        const parameter = this.parameters[this.currentParameterIndex];
        let value = '';

        switch (parameter) {
            case 'FONT':
                value = this.fontTypes[this.currentFontType].name;
                break;
            case 'STYLE':
                value = this.fontStyles[this.currentFontStyle].name;
                break;
            case 'TIME FONTSIZE':
                value = this.timeFontSizes[this.currentTimeFontSizeIndex] + 'pt';
                break;
            case 'DATE FONTSIZE':
                value = this.dateFontSizes[this.currentDateFontSizeIndex] + 'pt';
                break;
            case 'FONT COLOUR':
                value = this.colors[this.currentColor].name;
                break;
            case 'RENDERER':
                value = this.renderModes[this.currentRenderMode].name;
                break;
            case 'SECONDS':
                value = this.secondsDisplayModes[this.currentSecondsDisplay].name;
                break;
            case 'WEEKDAY':
                value = this.weekdayDisplayModes[this.currentWeekdayDisplay].name;
                break;
        }

        this.parameterDisplay.textContent = `${parameter}: ${value}`;
        this.parameterDisplay.style.display = 'block';

        // Clear existing timeout
        if (this.parameterDisplayTimeout) {
            clearTimeout(this.parameterDisplayTimeout);
        }

        // Auto-hide after 5 seconds
        this.parameterDisplayTimeout = setTimeout(() => {
            this.parameterDisplay.style.display = 'none';
        }, 5000);
    }

    showSelectedValue() {
        const parameter = this.parameters[this.currentParameterIndex];
        let value = '';

        switch (parameter) {
            case 'FONT':
                value = this.fontTypes[this.currentFontType].name;
                break;
            case 'STYLE':
                value = this.fontStyles[this.currentFontStyle].name;
                break;
            case 'TIME FONTSIZE':
                value = this.timeFontSizes[this.currentTimeFontSizeIndex] + 'pt';
                break;
            case 'DATE FONTSIZE':
                value = this.dateFontSizes[this.currentDateFontSizeIndex] + 'pt';
                break;
            case 'FONT COLOUR':
                value = this.colors[this.currentColor].name;
                break;
            case 'RENDERER':
                value = this.renderModes[this.currentRenderMode].name;
                break;
            case 'SECONDS':
                value = this.secondsDisplayModes[this.currentSecondsDisplay].name;
                break;
            case 'WEEKDAY':
                value = this.weekdayDisplayModes[this.currentWeekdayDisplay].name;
                break;
        }

        // Temporarily show the selected value
        this.parameterDisplay.textContent = `${parameter}: ${value}`;

        setTimeout(() => {
            this.updateParameterDisplay();
        }, 1000);
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
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    changeParameterRight() {
        const parameter = this.parameters[this.currentParameterIndex];

        switch (parameter) {
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
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    updateClock() {
        const now = new Date();
        const secondsMode = this.secondsDisplayModes[this.currentSecondsDisplay].value;
        const weekdayMode = this.weekdayDisplayModes[this.currentWeekdayDisplay].value;

        let timeString;
        if (secondsMode === 'show') {
            // Show seconds
            timeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } else {
            // Hide seconds, but blink colon at 1Hz
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = now.getSeconds();

            // Toggle colon visibility every second
            this.colonVisible = (seconds % 2 === 0);
            const separator = this.colonVisible ? ':' : ' ';

            timeString = `${hours}${separator}${minutes}`;
        }

        // Weekday display
        const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdayString = weekdayNames[now.getDay()];

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}.${month}.${year}`;

        this.clockElement.textContent = timeString;

        // Show or hide weekday based on setting
        if (weekdayMode === 'show') {
            this.weekdayElement.textContent = weekdayString;
            this.weekdayElement.style.display = 'block';
        } else {
            this.weekdayElement.textContent = '';
            this.weekdayElement.style.display = 'none';
        }

        this.dateElement.textContent = dateString;
    }

    startUpdate() {
        this.updateClock();
        this.updateInterval = setInterval(() => this.updateClock(), 1000);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
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
