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
        this.parameters = ['FONTSIZE', 'FONT COLOUR', 'RENDERER'];
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
    }

    init(container) {
        this.container = container;
        this.createStyles();
        this.createHTML();
        this.createParameterDisplay();
        this.startUpdate();
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
        const parameter = this.parameters[this.currentParameterIndex];
        let value = '';

        switch (parameter) {
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

        this.showSelectedValue();
    }

    changeParameterRight() {
        const parameter = this.parameters[this.currentParameterIndex];

        switch (parameter) {
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
