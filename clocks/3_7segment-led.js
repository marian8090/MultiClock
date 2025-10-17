export class SevenSegmentLedClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.dateElement = null;
        this.updateInterval = null;
        this.styleElement = null;

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
        this.parameters = ['CLOCK MODEL', 'FONTSIZE', 'FONT COLOUR', 'RENDERER'];
        this.currentParameterIndex = 0;

        // Current settings
        this.baseTimeFontSize = 19.5; // vmin
        this.baseDateFontSize = 13.65; // vmin (20:14 ratio)
        this.currentFontSizeMultiplier = 1.0;
        this.currentColor = 1; // Green by default
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

        console.log('[SevenSegmentLedClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[SevenSegmentLedClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[SevenSegmentLedClock] After loadSettings() - currentFontSizeMultiplier:', this.currentFontSizeMultiplier, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
        } else {
            console.log('[SevenSegmentLedClock] No saved settings, using defaults');
        }

        this.createStyles();
        this.createHTML();
        this.createParameterDisplay();
        this.startUpdate();
    }

    // Get current settings for persistence
    getSettings() {
        const settings = {
            currentFontSizeMultiplier: this.currentFontSizeMultiplier,
            currentColor: this.currentColor,
            currentRenderMode: this.currentRenderMode
        };
        console.log('[SevenSegmentLedClock] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[SevenSegmentLedClock] loadSettings() called with:', settings);

        if (settings.currentFontSizeMultiplier !== undefined && settings.currentFontSizeMultiplier >= 0.2 && settings.currentFontSizeMultiplier <= 5.0) {
            console.log('[SevenSegmentLedClock] Setting currentFontSizeMultiplier to:', settings.currentFontSizeMultiplier);
            this.currentFontSizeMultiplier = settings.currentFontSizeMultiplier;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[SevenSegmentLedClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentRenderMode !== undefined && settings.currentRenderMode >= 0 && settings.currentRenderMode < this.renderModes.length) {
            console.log('[SevenSegmentLedClock] Setting currentRenderMode to:', settings.currentRenderMode);
            this.currentRenderMode = settings.currentRenderMode;
        }

        console.log('[SevenSegmentLedClock] loadSettings() complete. Final values - currentFontSizeMultiplier:', this.currentFontSizeMultiplier, 'currentColor:', this.currentColor, 'currentRenderMode:', this.currentRenderMode);
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
        const fontFace = `@font-face {
            font-family: 'PMDG_NG3_LCD_9seg';
            src: url('fonts/PMDG_NG3_LCD_9seg.ttf') format('truetype');
        }`;

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

        this.styleElement.textContent = `
            ${fontFace}

            .led-clock-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: black;
                color: ${currentColor};
                font-family: 'PMDG_NG3_LCD_9seg', monospace;
                overflow: hidden;
                cursor: none;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                ${renderingCSS.container}
            }

            .led-display {
                text-align: center;
            }

            .led-time {
                font-size: ${clockFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                margin-bottom: 0.5em;
                ${renderingCSS.text}
            }

            .led-date {
                font-size: ${dateFontSize}vmin;
                font-weight: normal;
                letter-spacing: 0.05em;
                ${renderingCSS.text}
            }

            .parameter-display {
                position: fixed;
                top: 0;
                left: 0;
                color: #00ff00;
                font-size: 12px;
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
        clockContainer.className = 'led-clock-container';

        const display = document.createElement('div');
        display.className = 'led-display';

        this.clockElement = document.createElement('div');
        this.clockElement.className = 'led-time';

        this.dateElement = document.createElement('div');
        this.dateElement.className = 'led-date';

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
        let html = '';
        this.parameters.forEach((paramName, paramIndex) => {
            const isActive = paramIndex === this.currentParameterIndex;
            const activeClass = isActive ? ' active' : '';
            const allOptions = this.getAllOptionsForParameter(paramName);
            const currentSelection = this.getCurrentSelectionForParameter(paramName);
            const optionsHtml = allOptions.map((option, optionIndex) => {
                const isSelected = optionIndex === currentSelection;
                const selectedClass = isSelected ? ' selected' : '';
                const separator = optionIndex < allOptions.length - 1 ? '<span class="parameter-separator"> </span>' : '';
                return `<span class="parameter-option${selectedClass}">${option}</span>${separator}`;
            }).join('');
            html += `<div class="parameter-row${activeClass}"><span class="parameter-name">${paramName}: </span><span class="parameter-options">${optionsHtml}</span></div>`;
        });
        this.parameterDisplay.innerHTML = html;
        this.parameterDisplay.style.display = 'block';
        if (this.parameterDisplayTimeout) clearTimeout(this.parameterDisplayTimeout);
        this.parameterDisplayTimeout = setTimeout(() => { this.parameterDisplay.style.display = 'none'; }, 5000);
    }

    showSelectedValue() { this.updateParameterDisplay(); }

    getAllOptionsForParameter(paramName) {
        switch (paramName) {
            case 'CLOCK MODEL':
                if (this.multiClockInstance && this.multiClockInstance.clocks) return this.multiClockInstance.clocks.map(c => c.name);
                return ['Analog', 'Digital', '7-Segment LED', 'Slim Analog', 'DSEG'];
            case 'FONTSIZE':
                const sizeOptions = [];
                for (let pct = 20; pct <= 500; pct += 10) sizeOptions.push(pct + '%');
                return sizeOptions;
            case 'FONT COLOUR':
                return this.colors.map(c => c.name);
            case 'RENDERER':
                return this.renderModes.map(r => r.name);
            default:
                return [];
        }
    }

    getCurrentSelectionForParameter(paramName) {
        switch (paramName) {
            case 'CLOCK MODEL':
                if (this.multiClockInstance) return this.multiClockInstance.currentClockIndex;
                return this.clockIndex || 0;
            case 'FONTSIZE':
                const currentPct = Math.round(this.currentFontSizeMultiplier * 100);
                const sizeIndex = Math.round((currentPct - 20) / 10);
                return Math.max(0, Math.min(48, sizeIndex));
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
                if (this.multiClockInstance) {
                    const numClocks = this.multiClockInstance.clocks.length;
                    const newIndex = (this.multiClockInstance.currentClockIndex - 1 + numClocks) % numClocks;
                    this.multiClockInstance.switchToClock(newIndex);
                }
                return;
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
            case 'CLOCK MODEL':
                if (this.multiClockInstance) {
                    const numClocks = this.multiClockInstance.clocks.length;
                    const newIndex = (this.multiClockInstance.currentClockIndex + 1) % numClocks;
                    this.multiClockInstance.switchToClock(newIndex);
                }
                return;
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
