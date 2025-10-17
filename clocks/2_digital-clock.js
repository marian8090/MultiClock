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
            { name: 'lcddot_tr', file: 'lcddot_tr.ttf' },
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

        // Available font sizes (in points, like MS Word) - same as Clock 5
        this.fontSizes = [36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 108, 116, 124, 132, 140, 148, 156, 164, 172, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 320, 340, 360, 380, 400];

        // Parameters
        this.parameters = ['CLOCK MODEL', 'FONT', 'FONTSIZE', 'FONT COLOUR', 'RENDERER'];
        this.currentParameterIndex = 0;

        // Current settings
        this.currentFont = 0;
        this.currentFontSizeIndex = 9; // 72pt by default (index 9)
        this.currentColor = 0;
        this.currentRenderMode = 0; // Smooth by default

        // Parameter display element
        this.parameterDisplay = null;
        this.parameterDisplayTimeout = null;

        // Settings manager (will be set by MultiClock)
        this.settingsManager = null;
        this.clockIndex = null;

        // Reference to MultiClock instance for clock switching
        this.multiClockInstance = null;
    }

    init(container, savedSettings = null) {
        this.container = container;

        console.log('[DigitalClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[DigitalClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[DigitalClock] After loadSettings() - currentFont:', this.currentFont, 'currentFontSizeIndex:', this.currentFontSizeIndex, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
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
            currentFontSizeIndex: this.currentFontSizeIndex,
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
        if (settings.currentFontSizeIndex !== undefined && settings.currentFontSizeIndex >= 0 && settings.currentFontSizeIndex < this.fontSizes.length) {
            console.log('[DigitalClock] Setting currentFontSizeIndex to:', settings.currentFontSizeIndex);
            this.currentFontSizeIndex = settings.currentFontSizeIndex;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[DigitalClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentRenderMode !== undefined && settings.currentRenderMode >= 0 && settings.currentRenderMode < this.renderModes.length) {
            console.log('[DigitalClock] Setting currentRenderMode to:', settings.currentRenderMode);
            this.currentRenderMode = settings.currentRenderMode;
        }

        console.log('[DigitalClock] loadSettings() complete. Final values - currentFont:', this.currentFont, 'currentFontSizeIndex:', this.currentFontSizeIndex, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
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

        // Convert point sizes to vmin (1pt ≈ 0.13889vmin)
        let clockFontSize = this.fontSizes[this.currentFontSizeIndex] * 0.13889;
        let dateFontSize = clockFontSize * 0.7; // 70% of time size

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
                return this.fonts.map(f => f.name.replace(/_/g, ' '));
            case 'FONTSIZE':
                return this.fontSizes.map(s => s.toString());
            case 'FONT COLOUR':
                return this.colors.map(c => c.name);
            case 'RENDERER':
                return this.renderModes.map(r => r.name);
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
                return this.currentFont;
            case 'FONTSIZE':
                return this.currentFontSizeIndex;
            case 'FONT COLOUR':
                return this.currentColor;
            case 'RENDERER':
                return this.currentRenderMode;
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
                this.currentFont = (this.currentFont - 1 + this.fonts.length) % this.fonts.length;
                this.updateStyles();
                break;
            case 'FONTSIZE':
                this.currentFontSizeIndex = (this.currentFontSizeIndex - 1 + this.fontSizes.length) % this.fontSizes.length;
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
            case 'CLOCK MODEL':
                // Switch to next clock
                if (this.multiClockInstance) {
                    const numClocks = this.multiClockInstance.clocks.length;
                    const newIndex = (this.multiClockInstance.currentClockIndex + 1) % numClocks;
                    this.multiClockInstance.switchToClock(newIndex);
                }
                return; // Don't save settings or show value (clock is switching)
            case 'FONT':
                this.currentFont = (this.currentFont + 1) % this.fonts.length;
                this.updateStyles();
                break;
            case 'FONTSIZE':
                this.currentFontSizeIndex = (this.currentFontSizeIndex + 1) % this.fontSizes.length;
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