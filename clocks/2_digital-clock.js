export class DigitalClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.dateElement = null;
        this.updateInterval = null;
        this.styleElement = null;

        // Available fonts
        this.fonts = [
            { name: 'PMDG_NG3_DU_A', file: 'PMDG_NG3_DU_A.ttf' },
            { name: 'AppleII-PrintChar21', file: 'AppleII-PrintChar21.ttf' },
            { name: 'Perfect_DOS_VGA_437', file: 'Perfect DOS VGA 437.ttf' },
            { name: 'PMDG_NG3_DU_A_SC70x85', file: 'PMDG_NG3_DU_A-SC70x85-baseline.ttf' },
            { name: 'PMDG_NG3_LCD_9seg', file: 'PMDG_NG3_LCD_9seg.ttf' },
            { name: 'Courier_New', file: null, family: '"Courier New", Courier, monospace' },
            { name: 'Monaco', file: null, family: 'Monaco, "Lucida Console", monospace' }
        ];

        // Available colors
        this.colors = [
            { name: 'Green', value: '#00ff00' },
            { name: 'Red', value: '#ff0000' },
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
        this.parameters = ['FONT', 'FONTSIZE', 'FONT COLOUR', 'RENDERER'];
        this.currentParameterIndex = 0;

        // Current settings
        this.currentFont = 0;
        this.baseFontSize = 19.5; // vmin
        this.currentFontSizeMultiplier = 1.0;
        this.currentColor = 0;
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

        console.log('[DigitalClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[DigitalClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[DigitalClock] After loadSettings() - currentFont:', this.currentFont, 'currentFontSizeMultiplier:', this.currentFontSizeMultiplier, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
        } else {
            console.log('[DigitalClock] No saved settings, using defaults');
        }

        this.createStyles();
        this.createHTML();
        this.createParameterDisplay();
        this.startUpdate();
    }

    // Get current settings for persistence
    getSettings() {
        const settings = {
            currentFont: this.currentFont,
            currentFontSizeMultiplier: this.currentFontSizeMultiplier,
            currentColor: this.currentColor,
            currentRenderMode: this.currentRenderMode
        };
        console.log('[DigitalClock] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[DigitalClock] loadSettings() called with:', settings);

        if (settings.currentFont !== undefined && settings.currentFont >= 0 && settings.currentFont < this.fonts.length) {
            console.log('[DigitalClock] Setting currentFont to:', settings.currentFont);
            this.currentFont = settings.currentFont;
        }
        if (settings.currentFontSizeMultiplier !== undefined && settings.currentFontSizeMultiplier >= 0.2 && settings.currentFontSizeMultiplier <= 5.0) {
            console.log('[DigitalClock] Setting currentFontSizeMultiplier to:', settings.currentFontSizeMultiplier);
            this.currentFontSizeMultiplier = settings.currentFontSizeMultiplier;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[DigitalClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentRenderMode !== undefined && settings.currentRenderMode >= 0 && settings.currentRenderMode < this.renderModes.length) {
            console.log('[DigitalClock] Setting currentRenderMode to:', settings.currentRenderMode);
            this.currentRenderMode = settings.currentRenderMode;
        }

        console.log('[DigitalClock] loadSettings() complete. Final values - currentFont:', this.currentFont, 'currentFontSizeMultiplier:', this.currentFontSizeMultiplier, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
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
        const fontFaces = this.fonts
            .filter(font => font.file !== null)
            .map(font =>
                `@font-face {
                    font-family: '${font.name}';
                    src: url('fonts/${font.file}') format('truetype');
                }`
            ).join('\n');

        const currentFontInfo = this.fonts[this.currentFont];
        const currentFontFamily = currentFontInfo.family || `'${currentFontInfo.name}', 'Courier New', monospace`;
        const currentColor = this.colors[this.currentColor].value;
        const renderMode = this.renderModes[this.currentRenderMode].value;

        let clockFontSize = this.baseFontSize * this.currentFontSizeMultiplier;
        let dateFontSize = (this.baseFontSize * 0.7) * this.currentFontSizeMultiplier;

        // Apply pixel-perfect rounding for crisp and pixelated modes
        if (renderMode === 'crisp' || renderMode === 'pixelated') {
            const vminToPx = Math.min(window.innerWidth, window.innerHeight) / 100;
            clockFontSize = Math.round(clockFontSize * vminToPx) / vminToPx;
            dateFontSize = Math.round(dateFontSize * vminToPx) / vminToPx;
        }

        // Generate rendering CSS based on mode
        const renderingCSS = this.getRenderingCSS(renderMode);

        this.styleElement.textContent = `
            ${fontFaces}

            .digital-clock-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: black;
                color: ${currentColor};
                font-family: ${currentFontFamily};
                overflow: hidden;
                cursor: none;
                display: flex;
                justify-content: center;
                align-items: center;
                ${renderingCSS.container}
            }

            .digital-display {
                text-align: center;
            }

            .digital-clock {
                font-size: ${clockFontSize}vmin;
                font-weight: bold;
                letter-spacing: 0.1em;
                margin-bottom: 0.75em;
                ${renderingCSS.text}
            }

            .digital-date {
                font-size: ${dateFontSize}vmin;
                font-weight: bold;
                letter-spacing: 0.1em;
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
                    text: 'text-rendering: optimizeSpeed; -webkit-font-smoothing: none; -moz-osx-font-smoothing: grayscale;'
                };
            case 'pixelated':
                return {
                    container: 'image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;',
                    text: 'text-rendering: optimizeSpeed; -webkit-font-smoothing: none; -moz-osx-font-smoothing: grayscale; image-rendering: pixelated;'
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
        clockContainer.className = 'digital-clock-container';

        const display = document.createElement('div');
        display.className = 'digital-display';

        this.clockElement = document.createElement('div');
        this.clockElement.className = 'digital-clock';
        this.clockElement.id = 'digital-clock';

        this.dateElement = document.createElement('div');
        this.dateElement.className = 'digital-date';
        this.dateElement.id = 'digital-date';

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
                value = this.fonts[this.currentFont].name.replace(/_/g, ' ');
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
                value = this.fonts[this.currentFont].name.replace(/_/g, ' ');
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
        const originalText = this.parameterDisplay.textContent;
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
                this.currentFont = (this.currentFont - 1 + this.fonts.length) % this.fonts.length;
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
                this.currentFont = (this.currentFont + 1) % this.fonts.length;
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