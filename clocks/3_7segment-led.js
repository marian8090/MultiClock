export class SevenSegmentLedClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.dateElement = null;
        this.updateInterval = null;
        this.styleElement = null;

        // 7-segment patterns for digits 0-9
        this.segmentPatterns = {
            '0': [true, true, true, true, true, true, false],
            '1': [false, true, true, false, false, false, false],
            '2': [true, true, false, true, true, false, true],
            '3': [true, true, true, true, false, false, true],
            '4': [false, true, true, false, false, true, true],
            '5': [true, false, true, true, false, true, true],
            '6': [true, false, true, true, true, true, true],
            '7': [true, true, true, false, false, false, false],
            '8': [true, true, true, true, true, true, true],
            '9': [true, true, true, true, false, true, true],
            ':': 'colon',
            '.': 'dot',
            ' ': 'space'
        };

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
        this.baseTimeFontSize = 8; // vmin for LED segments
        this.baseDateFontSize = 5.6; // vmin for date (20:14 ratio)
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
        const currentColor = this.colors[this.currentColor].value;
        const renderMode = this.renderModes[this.currentRenderMode].value;

        let timeSegmentSize = this.baseTimeFontSize * this.currentFontSizeMultiplier;
        let dateSegmentSize = this.baseDateFontSize * this.currentFontSizeMultiplier;

        // Apply pixel-perfect rounding for crisp and pixelated modes
        if (renderMode === 'crisp' || renderMode === 'pixelated') {
            const vminToPx = Math.min(window.innerWidth, window.innerHeight) / 100;
            timeSegmentSize = Math.round(timeSegmentSize * vminToPx) / vminToPx;
            dateSegmentSize = Math.round(dateSegmentSize * vminToPx) / vminToPx;
        }

        const segmentWidth = timeSegmentSize * 0.8;
        const segmentHeight = timeSegmentSize * 0.15;
        const dateSegmentWidth = dateSegmentSize * 0.8;
        const dateSegmentHeight = dateSegmentSize * 0.15;

        // Generate rendering CSS based on mode
        const renderingCSS = this.getRenderingCSS(renderMode);

        this.styleElement.textContent = `
            .led-clock-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: black;
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
                margin-bottom: 2em;
            }

            .led-time {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: ${timeSegmentSize * 0.15}vmin;
                margin-bottom: 2.5em;
            }

            .led-date {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: ${dateSegmentSize * 0.15}vmin;
            }

            .led-time .led-digit {
                position: relative;
                width: ${segmentWidth}vmin;
                height: ${timeSegmentSize * 1.5}vmin;
                margin: 0;
            }

            .led-date .led-digit {
                position: relative;
                width: ${dateSegmentWidth}vmin;
                height: ${dateSegmentSize * 1.5}vmin;
                margin: 0;
            }

            .led-time .led-colon {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: ${timeSegmentSize * 1.5}vmin;
                gap: ${timeSegmentSize * 0.2}vmin;
            }

            .led-date .led-colon {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: ${dateSegmentSize * 1.5}vmin;
                gap: ${dateSegmentSize * 0.2}vmin;
            }

            .led-time .led-dot {
                width: ${segmentHeight}vmin;
                height: ${segmentHeight}vmin;
                background: ${currentColor};
                border-radius: 50%;
            }

            .led-date .led-dot {
                width: ${dateSegmentHeight}vmin;
                height: ${dateSegmentHeight}vmin;
                background: ${currentColor};
                border-radius: 50%;
            }

            .led-segment {
                position: absolute;
                background: ${currentColor};
                border-radius: ${segmentHeight * 0.1}vmin;
                transition: opacity 0.1s;
                ${renderingCSS.segment}
            }

            .led-segment.off {
                background: #222;
                box-shadow: none;
                opacity: 0.1;
            }

            /* Horizontal segments for time */
            .led-time .led-segment.horizontal {
                width: ${segmentWidth * 0.8}vmin;
                height: ${segmentHeight}vmin;
                left: ${segmentWidth * 0.1}vmin;
            }

            /* Vertical segments for time */
            .led-time .led-segment.vertical {
                width: ${segmentHeight}vmin;
                height: ${timeSegmentSize * 0.65}vmin;
            }

            /* Horizontal segments for date */
            .led-date .led-segment.horizontal {
                width: ${dateSegmentWidth * 0.8}vmin;
                height: ${dateSegmentHeight}vmin;
                left: ${dateSegmentWidth * 0.1}vmin;
            }

            /* Vertical segments for date */
            .led-date .led-segment.vertical {
                width: ${dateSegmentHeight}vmin;
                height: ${dateSegmentSize * 0.65}vmin;
            }

            /* Segment positions for time */
            .led-time .seg-a { top: 0; }
            .led-time .seg-b { top: ${timeSegmentSize * 0.075}vmin; right: 0; }
            .led-time .seg-c { bottom: ${timeSegmentSize * 0.075}vmin; right: 0; }
            .led-time .seg-d { bottom: 0; }
            .led-time .seg-e { bottom: ${timeSegmentSize * 0.075}vmin; left: 0; }
            .led-time .seg-f { top: ${timeSegmentSize * 0.075}vmin; left: 0; }
            .led-time .seg-g { top: 50%; transform: translateY(-50%); }

            /* Segment positions for date */
            .led-date .seg-a { top: 0; }
            .led-date .seg-b { top: ${dateSegmentSize * 0.075}vmin; right: 0; }
            .led-date .seg-c { bottom: ${dateSegmentSize * 0.075}vmin; right: 0; }
            .led-date .seg-d { bottom: 0; }
            .led-date .seg-e { bottom: ${dateSegmentSize * 0.075}vmin; left: 0; }
            .led-date .seg-f { top: ${dateSegmentSize * 0.075}vmin; left: 0; }
            .led-date .seg-g { top: 50%; transform: translateY(-50%); }

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
                    segment: ''
                };
            case 'crisp':
                return {
                    container: 'image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;',
                    segment: 'image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; transform: translate3d(0, 0, 0);'
                };
            case 'pixelated':
                return {
                    container: 'image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;',
                    segment: 'image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; transform: translate3d(0, 0, 0);'
                };
            default:
                return {
                    container: '',
                    segment: ''
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

    createSegmentDigit(digit) {
        const digitElement = document.createElement('div');
        digitElement.className = 'led-digit';

        if (digit === ':') {
            digitElement.className = 'led-colon';
            const dot1 = document.createElement('div');
            const dot2 = document.createElement('div');
            dot1.className = 'led-dot';
            dot2.className = 'led-dot';
            digitElement.appendChild(dot1);
            digitElement.appendChild(dot2);
            return digitElement;
        }

        if (digit === '.') {
            const dotElement = document.createElement('div');
            dotElement.className = 'led-dot';
            dotElement.style.position = 'absolute';
            dotElement.style.bottom = '0';
            dotElement.style.right = '0';
            digitElement.appendChild(dotElement);
            return digitElement;
        }

        if (digit === ' ') {
            return digitElement;
        }

        const pattern = this.segmentPatterns[digit];
        const segmentNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

        segmentNames.forEach((name, index) => {
            const segment = document.createElement('div');
            const isHorizontal = ['a', 'd', 'g'].includes(name);
            segment.className = `led-segment ${isHorizontal ? 'horizontal' : 'vertical'} seg-${name}`;

            if (!pattern[index]) {
                segment.classList.add('off');
            }

            digitElement.appendChild(segment);
        });

        return digitElement;
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

        // Clear and rebuild time display
        this.clockElement.innerHTML = '';
        for (let char of timeString) {
            this.clockElement.appendChild(this.createSegmentDigit(char));
        }

        // Clear and rebuild date display
        this.dateElement.innerHTML = '';
        for (let char of dateString) {
            this.dateElement.appendChild(this.createSegmentDigit(char));
        }
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