export class DigitalAsciiArtClock {
    constructor() {
        this.container = null;
        this.clockElement = null;
        this.dateElement = null;
        this.updateInterval = null;
        this.styleElement = null;

        // ASCII art patterns for digits 0-9, colon, and period
        this.asciiDigits = {
            '0': [
                '███',
                '█ █',
                '█ █',
                '█ █',
                '███'
            ],
            '1': [
                ' █ ',
                '██ ',
                ' █ ',
                ' █ ',
                '███'
            ],
            '2': [
                '███',
                '  █',
                '███',
                '█  ',
                '███'
            ],
            '3': [
                '███',
                '  █',
                '███',
                '  █',
                '███'
            ],
            '4': [
                '█ █',
                '█ █',
                '███',
                '  █',
                '  █'
            ],
            '5': [
                '███',
                '█  ',
                '███',
                '  █',
                '███'
            ],
            '6': [
                '███',
                '█  ',
                '███',
                '█ █',
                '███'
            ],
            '7': [
                '███',
                '  █',
                '  █',
                '  █',
                '  █'
            ],
            '8': [
                '███',
                '█ █',
                '███',
                '█ █',
                '███'
            ],
            '9': [
                '███',
                '█ █',
                '███',
                '  █',
                '███'
            ],
            ':': [
                '   ',
                ' ● ',
                '   ',
                ' ● ',
                '   '
            ],
            '.': [
                '   ',
                '   ',
                '   ',
                '   ',
                ' ● '
            ],
            ' ': [
                '   ',
                '   ',
                '   ',
                '   ',
                '   '
            ]
        };

        // Available system monospace fonts (no TTF files needed)
        this.fonts = [
            { name: 'Courier New', fontFamily: '"Courier New", Courier, monospace' },
            { name: 'Monaco', fontFamily: 'Monaco, "Lucida Console", monospace' },
            { name: 'Consolas', fontFamily: 'Consolas, "Liberation Mono", monospace' },
            { name: 'Menlo', fontFamily: 'Menlo, Monaco, "Courier New", monospace' }
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

        // Parameters
        this.parameters = ['FONT', 'FONTSIZE', 'FONT COLOUR'];
        this.currentParameterIndex = 0;

        // Current settings
        this.currentFont = 0;
        this.baseFontSize = 3; // vmin for ASCII art
        this.currentFontSizeMultiplier = 1.0;
        this.currentColor = 0;

        // Parameter display element
        this.parameterDisplay = null;
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
        const currentFont = this.fonts[this.currentFont].fontFamily;
        const currentColor = this.colors[this.currentColor].value;
        const clockFontSize = this.baseFontSize * this.currentFontSizeMultiplier;
        const dateFontSize = (this.baseFontSize * 0.7) * this.currentFontSizeMultiplier;

        this.styleElement.textContent = `
            .ascii-clock-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: black;
                color: ${currentColor};
                font-family: ${currentFont};
                overflow: hidden;
                cursor: none;
                display: flex;
                justify-content: center;
                align-items: center;
                /* Crisp font rendering settings */
                -webkit-font-smoothing: none;
                -moz-osx-font-smoothing: unset;
                font-smooth: never;
                text-rendering: optimizeSpeed;
            }

            .ascii-display {
                text-align: center;
                line-height: 1;
            }

            .ascii-clock {
                font-size: ${clockFontSize}vmin;
                font-weight: bold;
                letter-spacing: 0.1em;
                margin-bottom: 1em;
                white-space: pre;
                /* Crisp font rendering */
                -webkit-font-smoothing: none;
                -moz-osx-font-smoothing: unset;
                font-smooth: never;
                text-rendering: optimizeSpeed;
            }

            .ascii-date {
                font-size: ${dateFontSize}vmin;
                font-weight: bold;
                letter-spacing: 0.1em;
                white-space: pre;
                /* Crisp font rendering */
                -webkit-font-smoothing: none;
                -moz-osx-font-smoothing: unset;
                font-smooth: never;
                text-rendering: optimizeSpeed;
            }

            .parameter-display {
                position: fixed;
                top: 20px;
                left: 20px;
                color: #444;
                font-size: 12px;
                z-index: 1000;
                font-family: 'Courier New', Courier, monospace;
                opacity: 0.7;
                white-space: pre;
                line-height: 1.4;
            }
        `;
    }

    createHTML() {
        const clockContainer = document.createElement('div');
        clockContainer.className = 'ascii-clock-container';

        const display = document.createElement('div');
        display.className = 'ascii-display';

        this.clockElement = document.createElement('div');
        this.clockElement.className = 'ascii-clock';
        this.clockElement.id = 'ascii-clock';

        this.dateElement = document.createElement('div');
        this.dateElement.className = 'ascii-date';
        this.dateElement.id = 'ascii-date';

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
        let display = '';

        // Show all parameters with indicator for current selection
        this.parameters.forEach((param, index) => {
            const indicator = index === this.currentParameterIndex ? '>' : ' ';

            let value = '';
            switch (param) {
                case 'FONT':
                    value = this.fonts[this.currentFont].name;
                    break;
                case 'FONTSIZE':
                    value = Math.round(this.currentFontSizeMultiplier * 100) + '%';
                    break;
                case 'FONT COLOUR':
                    value = this.colors[this.currentColor].name;
                    break;
            }

            display += `${indicator} ${param}: ${value}\n`;
        });

        this.parameterDisplay.textContent = display.trim();
    }

    showSelectedValue() {
        const parameter = this.parameters[this.currentParameterIndex];
        let value = '';

        switch (parameter) {
            case 'FONT':
                value = this.fonts[this.currentFont].name;
                break;
            case 'FONTSIZE':
                value = Math.round(this.currentFontSizeMultiplier * 100) + '%';
                break;
            case 'FONT COLOUR':
                value = this.colors[this.currentColor].name;
                break;
        }

        // Temporarily show the selected value
        const originalText = this.parameterDisplay.textContent;
        this.parameterDisplay.textContent = `${parameter}: ${value}`;

        setTimeout(() => {
            this.updateParameterDisplay();
        }, 1000);
    }

    // Convert text to ASCII art
    textToAscii(text) {
        const lines = ['', '', '', '', ''];

        for (let char of text) {
            const pattern = this.asciiDigits[char] || this.asciiDigits[' '];
            for (let i = 0; i < 5; i++) {
                lines[i] += pattern[i] + ' ';
            }
        }

        return lines.join('\n');
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
        }

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

        this.clockElement.textContent = this.textToAscii(timeString);
        this.dateElement.textContent = this.textToAscii(dateString);
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

        // Clean up all child elements
        while (this.container && this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
}