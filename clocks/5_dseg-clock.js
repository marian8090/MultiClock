export class DSEGClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.timeContainer = null;
        this.weekdayDateElement = null;
        this.temperatureElement = null;
        this.updateInterval = null;
        this.temperatureFetchInterval = null;
        this.styleElement = null;
        this.currentTemperature = '--';
        this.currentTempHigh = '--';
        this.currentTempLow = '--';

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
            { name: 'Small', value: 'small' },
            { name: 'Hide', value: 'hide' }
        ];

        // Available weekday display modes
        this.weekdayDisplayModes = [
            { name: 'Show', value: 'show' },
            { name: 'Hide', value: 'hide' }
        ];

        // Available temperature display modes
        this.temperatureDisplayModes = [
            { name: 'Show', value: 'show' },
            { name: 'Hide', value: 'hide' }
        ];

        // Available font sizes (in points, like MS Word)
        this.timeFontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96, 144, 200, 288];
        this.dateFontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96, 144, 200, 288];

        // Parameters
        this.parameters = ['FONT', 'STYLE', 'TIME FONTSIZE', 'DATE FONTSIZE', 'FONT COLOUR', 'RENDERER', 'SECONDS', 'WEEKDAY', 'TEMPERATURE'];
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
        this.currentTemperatureDisplay = 1; // Hide by default

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
            currentTemperatureDisplay: this.currentTemperatureDisplay
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

        console.log('[DSEGClock] loadSettings() complete. Final values - currentFontType:', this.currentFontType, 'currentFontStyle:', this.currentFontStyle, 'currentTimeFontSizeIndex:', this.currentTimeFontSizeIndex, 'currentDateFontSizeIndex:', this.currentDateFontSizeIndex, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode, 'currentSecondsDisplay:', this.currentSecondsDisplay, 'currentWeekdayDisplay:', this.currentWeekdayDisplay, 'currentTemperatureDisplay:', this.currentTemperatureDisplay);
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

        // Calculate small seconds font size (one step smaller)
        const smallSecondsIndex = Math.max(0, this.currentTimeFontSizeIndex - 1);
        let smallSecondsFontSize = this.timeFontSizes[smallSecondsIndex] * 0.13889;

        // Apply pixel-perfect rounding for crisp and pixelated modes
        if (renderMode === 'crisp' || renderMode === 'pixelated') {
            const vminToPx = Math.min(window.innerWidth, window.innerHeight) / 100;
            clockFontSize = Math.round(clockFontSize * vminToPx) / vminToPx;
            dateFontSize = Math.round(dateFontSize * vminToPx) / vminToPx;
            weekdayFontSize = Math.round(weekdayFontSize * vminToPx) / vminToPx;
            smallSecondsFontSize = Math.round(smallSecondsFontSize * vminToPx) / vminToPx;
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
                background-color: ${backgroundColor};
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
                margin-bottom: 0.3em;
                display: flex;
                justify-content: center;
                align-items: baseline;
            }

            .dseg-time {
                font-size: ${clockFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                ${renderingCSS.text}
            }

            .dseg-time-small-seconds {
                font-size: ${smallSecondsFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                ${renderingCSS.text}
            }

            .dseg-weekday-date {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                font-family: '${weekdayFontFamily}', monospace;
                text-align: center;
                max-width: 90vw;
                word-wrap: break-word;
                line-height: 1.3;
                ${renderingCSS.text}
            }

            .dseg-temperature {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                font-family: '${weekdayFontFamily}', monospace;
                text-align: center;
                margin-top: 0.3em;
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

        // Create container for time that can hold both main time and small seconds
        this.timeContainer = document.createElement('div');
        this.timeContainer.className = 'dseg-time-container';

        this.clockElement = document.createElement('span');
        this.clockElement.className = 'dseg-time';

        this.timeContainer.appendChild(this.clockElement);

        this.weekdayDateElement = document.createElement('div');
        this.weekdayDateElement.className = 'dseg-weekday-date';

        this.temperatureElement = document.createElement('div');
        this.temperatureElement.className = 'dseg-temperature';

        display.appendChild(this.timeContainer);
        display.appendChild(this.weekdayDateElement);
        display.appendChild(this.temperatureElement);
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
            case 'TEMPERATURE':
                value = this.temperatureDisplayModes[this.currentTemperatureDisplay].name;
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
            case 'TEMPERATURE':
                value = this.temperatureDisplayModes[this.currentTemperatureDisplay].name;
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
            case 'TEMPERATURE':
                this.currentTemperatureDisplay = (this.currentTemperatureDisplay - 1 + this.temperatureDisplayModes.length) % this.temperatureDisplayModes.length;
                this.updateTemperatureDisplay();
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
            case 'TEMPERATURE':
                this.currentTemperatureDisplay = (this.currentTemperatureDisplay + 1) % this.temperatureDisplayModes.length;
                this.updateTemperatureDisplay();
                break;
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    updateClock() {
        const now = new Date();
        const secondsMode = this.secondsDisplayModes[this.currentSecondsDisplay].value;
        const weekdayMode = this.weekdayDisplayModes[this.currentWeekdayDisplay].value;

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Remove any existing small seconds element
        const existingSmallSeconds = this.timeContainer.querySelector('.dseg-time-small-seconds');
        if (existingSmallSeconds) {
            existingSmallSeconds.remove();
        }

        if (secondsMode === 'show') {
            // Show seconds at regular size
            this.clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        } else if (secondsMode === 'small') {
            // Show main time without seconds
            this.clockElement.textContent = `${hours}:${minutes}`;

            // Create and append small seconds element
            const smallSecondsElement = document.createElement('span');
            smallSecondsElement.className = 'dseg-time-small-seconds';
            smallSecondsElement.textContent = `:${seconds}`;
            this.timeContainer.appendChild(smallSecondsElement);
        } else {
            // Hide seconds, but blink colon at 1Hz
            const secondsNum = now.getSeconds();
            this.colonVisible = (secondsNum % 2 === 0);
            const separator = this.colonVisible ? ':' : ' ';
            this.clockElement.textContent = `${hours}${separator}${minutes}`;
        }

        // Weekday and date display
        const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdayString = weekdayNames[now.getDay()];

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}.${month}.${year}`;

        // Show weekday and date on one line if weekday is shown, otherwise just date
        if (weekdayMode === 'show') {
            this.weekdayDateElement.textContent = `${weekdayString}  ${dateString}`;
            this.weekdayDateElement.style.display = 'block';
        } else {
            this.weekdayDateElement.textContent = dateString;
            this.weekdayDateElement.style.display = 'block';
        }
    }

    startUpdate() {
        this.updateClock();
        this.updateInterval = setInterval(() => this.updateClock(), 1000);
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

        if (temperatureMode === 'show') {
            // Using Unicode non-breaking spaces (U+00A0) for better spacing visibility
            this.temperatureElement.textContent = `${this.currentTemperature}°\u00A0\u00A0\u00A0${this.currentTempHigh}°/${this.currentTempLow}°`;
            this.temperatureElement.style.display = 'block';
        } else {
            this.temperatureElement.textContent = '';
            this.temperatureElement.style.display = 'none';
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
