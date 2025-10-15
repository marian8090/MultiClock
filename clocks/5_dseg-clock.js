export class DSEGClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
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

        // Parameters
        this.parameters = ['FONT', 'STYLE', 'FONTSIZE', 'FONT COLOUR', 'RENDERER'];
        this.currentParameterIndex = 0;

        // Current settings
        this.baseTimeFontSize = 19.5; // vmin
        this.baseDateFontSize = 13.65; // vmin (20:14 ratio)
        this.currentFontSizeMultiplier = 1.0;
        this.currentFontType = 0; // Classic by default
        this.currentFontStyle = 3; // Italic by default
        this.currentColor = 6; // White by default
        this.currentRenderMode = 0; // Smooth by default

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
            currentFontSizeMultiplier: this.currentFontSizeMultiplier,
            currentColor: this.currentColor,
            currentRenderMode: this.currentRenderMode
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
        if (settings.currentFontSizeMultiplier !== undefined && settings.currentFontSizeMultiplier >= 0.2 && settings.currentFontSizeMultiplier <= 5.0) {
            console.log('[DSEGClock] Setting currentFontSizeMultiplier to:', settings.currentFontSizeMultiplier);
            this.currentFontSizeMultiplier = settings.currentFontSizeMultiplier;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[DSEGClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentRenderMode !== undefined && settings.currentRenderMode >= 0 && settings.currentRenderMode < this.renderModes.length) {
            console.log('[DSEGClock] Setting currentRenderMode to:', settings.currentRenderMode);
            this.currentRenderMode = settings.currentRenderMode;
        }

        console.log('[DSEGClock] loadSettings() complete. Final values - currentFontType:', this.currentFontType, 'currentFontStyle:', this.currentFontStyle, 'currentFontSizeMultiplier:', this.currentFontSizeMultiplier, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
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
        // Generate @font-face declarations for all DSEG7 variants
        const fontFaces = this.generateFontFaces();

        const currentColor = this.colors[this.currentColor].value;
        const renderMode = this.renderModes[this.currentRenderMode].value;

        let clockFontSize = this.baseTimeFontSize * this.currentFontSizeMultiplier;
        let dateFontSize = this.baseDateFontSize * this.currentFontSizeMultiplier;

        // Apply pixel-perfect rounding for crisp and pixelated modes
        if (renderMode === 'crisp' || renderMode === 'pixelated') {
            const vminToPx = Math.min(window.innerWidth, window.innerHeight) / 100;
            clockFontSize = Math.round(clockFontSize * vminToPx) / vminToPx;
            dateFontSize = Math.round(dateFontSize * vminToPx) / vminToPx;
        }

        // Generate rendering CSS based on mode
        const renderingCSS = this.getRenderingCSS(renderMode);

        // Get current font family name
        const fontFamily = this.getCurrentFontFamily();

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

        // Generate font-face for Classic variants
        this.fontStyles.forEach(style => {
            const fontName = `DSEG7Classic-${style.value}`;
            fontFaces.push(`
                @font-face {
                    font-family: '${fontName}';
                    src: url('fonts/fonts-DSEG_v046/DSEG7-Classic/DSEG7Classic-${style.value}.ttf') format('truetype');
                }
            `);
        });

        // Generate font-face for Modern variants
        this.fontStyles.forEach(style => {
            const fontName = `DSEG7Modern-${style.value}`;
            fontFaces.push(`
                @font-face {
                    font-family: '${fontName}';
                    src: url('fonts/fonts-DSEG_v046/DSEG7-Modern/DSEG7Modern-${style.value}.ttf') format('truetype');
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

        this.dateElement = document.createElement('div');
        this.dateElement.className = 'dseg-date';

        display.appendChild(this.clockElement);
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
            case 'FONTSIZE':
                value = Math.round(this.currentFontSizeMultiplier * 100) + '%';
                break;
            case 'FONT COLOUR':
                value = this.colors[this.currentColor].name;
                break;
            case 'RENDERER':
                value = this.renderModes[this.currentRenderMode].name;
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
            case 'FONTSIZE':
                value = Math.round(this.currentFontSizeMultiplier * 100) + '%';
                break;
            case 'FONT COLOUR':
                value = this.colors[this.currentColor].name;
                break;
            case 'RENDERER':
                value = this.renderModes[this.currentRenderMode].name;
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
            case 'FONTSIZE':
                this.currentFontSizeMultiplier = Math.max(0.2, this.currentFontSizeMultiplier / 1.2);
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
            case 'FONTSIZE':
                this.currentFontSizeMultiplier = Math.min(5.0, this.currentFontSizeMultiplier * 1.2);
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
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}.${month}.${year}`;

        this.clockElement.textContent = timeString;
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
