export class AnalogClock {
    constructor() {
        this.app = null;
        this.watch = null;
        this.hourHand = null;
        this.minuteHand = null;
        this.secondHand = null;
        this.dayText = null;
        this.clockX = 0;
        this.clockY = 0;
        this.ro = 0;
        this.borderLineWidth = 0;
        this.animationTicker = null;
        this.resizeHandler = null;

        // Available colors - Same as other clocks (standard RGB)
        this.colors = [
            { name: 'Original U1', value: 0xFFFFFF }, // White (with red accents)
            { name: 'Green', value: 0x00FF00 },
            { name: 'Red', value: 0xFF0000 },
            { name: 'Blue', value: 0x0000FF },
            { name: 'Yellow', value: 0xFFFF00 },
            { name: 'Magenta', value: 0xFF00FF },
            { name: 'Cyan', value: 0x00FFFF },
            { name: 'White', value: 0xFFFFFF }
        ];

        // Available size multipliers (20% to 300% in 10% increments)
        this.sizeMultipliers = [];
        for (let pct = 20; pct <= 300; pct += 10) {
            this.sizeMultipliers.push(pct / 100);
        }

        // Parameters
        this.parameters = ['CLOCK MODEL', 'SIZE', 'COLOR'];
        this.currentParameterIndex = 0;

        // Current settings
        this.currentSizeIndex = 8; // 100% (index 8: 20,30,40,50,60,70,80,90,100)
        this.currentColor = 0; // Original U1 (white)

        // Parameter display element
        this.parameterDisplay = null;
        this.parameterDisplayTimeout = null;

        // Settings manager (will be set by MultiClock)
        this.settingsManager = null;
        this.clockIndex = null;

        // Reference to MultiClock instance for clock switching
        this.multiClockInstance = null;
    }

    async init(container, savedSettings = null) {
        this.container = container;

        console.log('[AnalogClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[AnalogClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[AnalogClock] After loadSettings() - currentSizeIndex:', this.currentSizeIndex, 'currentColor:', this.currentColor);
        } else {
            console.log('[AnalogClock] No saved settings, using defaults');
        }

        this.app = new PIXI.Application();

        await this.app.init({
            antialias: true,
            autoDensity: true,
            resolution: 2,
            background: '#000000',
            resizeTo: window,
        });

        container.appendChild(this.app.canvas);

        this.app.ticker.maxFPS = 8;

        this.buildClock();
        this.createParameterDisplay();
        this.setupEventListeners();
        this.startAnimation();
    }

    // Get current settings for persistence
    getSettings() {
        const settings = {
            currentSizeIndex: this.currentSizeIndex,
            currentColor: this.currentColor
        };
        console.log('[AnalogClock] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[AnalogClock] loadSettings() called with:', settings);

        if (settings.currentSizeIndex !== undefined && settings.currentSizeIndex >= 0 && settings.currentSizeIndex < this.sizeMultipliers.length) {
            console.log('[AnalogClock] Setting currentSizeIndex to:', settings.currentSizeIndex);
            this.currentSizeIndex = settings.currentSizeIndex;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[AnalogClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }

        console.log('[AnalogClock] loadSettings() complete. Final values - currentSizeIndex:', this.currentSizeIndex, 'currentColor:', this.currentColor);
    }

    // Save current settings
    saveSettings() {
        if (this.settingsManager && this.clockIndex !== null) {
            this.settingsManager.saveClockSettings(this.clockIndex, this.getSettings());
        }
    }

    buildClock() {
        this.clockX = 0.5 * this.app.screen.width;
        this.clockY = 0.5 * this.app.screen.height;
        this.ro = Math.min(this.app.screen.width, this.app.screen.height) * 0.49 * this.sizeMultipliers[this.currentSizeIndex];
        this.borderLineWidth = 0.002 * this.ro;
        this.color = this.colors[this.currentColor].value;

        if (this.watch) {
            this.app.stage.removeChild(this.watch);
        }

        this.watch = new PIXI.Container();

        this.buildWatchFace();
        this.buildHands();

        this.app.stage.addChild(this.watch);
    }

    getDarkerColor(color) {
        // Special case for Original U1 (white) - return red for traditional look
        if (color === 0xFFFFFF) {
            return 0xFF0000; // Red
        }

        // For other colors, extract RGB components and make them darker (multiply by 0.6)
        const r = Math.floor(((color >> 16) & 0xFF) * 0.6);
        const g = Math.floor(((color >> 8) & 0xFF) * 0.6);
        const b = Math.floor((color & 0xFF) * 0.6);
        return (r << 16) | (g << 8) | b;
    }

    buildWatchFace() {
        // Hour markers
        for (let hour = 0; hour <= 12; hour += 1) {
            const hourRef = new PIXI.Graphics();
            hourRef.beginFill(this.color);

            let w, h;
            if (hour % 3 == 0) {
                w = 0.11 * this.ro;
                h = 0.14 * this.ro;
            } else {
                w = 0.11 * this.ro;
                h = 0.07 * this.ro;
            }

            hourRef.x = this.clockX + 0.80 * this.ro * Math.sin(hour * 30 / 180 * Math.PI);
            hourRef.y = this.clockY - 0.80 * this.ro * Math.cos(hour * 30 / 180 * Math.PI);
            hourRef.drawRect(-w / 2, 0, w, h);

            if (hour == 0) {
                hourRef.drawRect(-w / 2, 1.1 * h, w, 0.35 * h);
            }

            hourRef.endFill();
            hourRef.rotation = hour * 30 / 180 * Math.PI;
            this.watch.addChild(hourRef);
        }

        // Minute markers
        for (let minute = 0; minute <= 60; minute += 1) {
            const minuteRef = new PIXI.Graphics();
            minuteRef.beginFill(this.color);

            let w, h;
            if (minute % 5 == 0) {
                w = 0.03 * this.ro;
                h = 0.04 * this.ro;
            } else {
                w = 0.02 * this.ro;
                h = 0.04 * this.ro;
            }

            minuteRef.x = this.clockX + 0.8 * this.ro * Math.sin(minute * 6 / 180 * Math.PI);
            minuteRef.y = this.clockY - 0.8 * this.ro * Math.cos(minute * 6 / 180 * Math.PI);
            minuteRef.drawRect(-w / 2, -h, w, h);
            minuteRef.endFill();
            minuteRef.rotation = minute * 6 / 180 * Math.PI;
            this.watch.addChild(minuteRef);
        }

        // Date Text
        const dayTextStyle = new PIXI.TextStyle({
            fill: this.color,
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 0.12 * this.ro,
            fontWeight: "bold"
        });

        this.dayText = new PIXI.Text('--', dayTextStyle);
        this.dayText.anchor.set(1, 0.5); // Right-align text (anchor at right edge)
        this.dayText.x = this.clockX + 0.63 * this.ro; // Position right edge further left (1 char width)
        this.dayText.y = this.clockY;
        this.watch.addChild(this.dayText);
    }

    buildHands() {
        // Hour Hand
        this.hourHand = new PIXI.Graphics();
        this.buildHourHand();
        this.watch.addChild(this.hourHand);

        // Minute Hand
        this.minuteHand = new PIXI.Graphics();
        this.buildMinuteHand();
        this.watch.addChild(this.minuteHand);

        // Second Hand
        this.secondHand = new PIXI.Graphics();
        this.buildSecondHand();
        this.watch.addChild(this.secondHand);
    }

    buildHourHand() {
        const w1 = 0.11 * this.ro;
        const w2 = 0.03 * this.ro;
        const h1 = 0.45 * this.ro;
        const h2 = (0.45 + 0.07) * this.ro;
        const hAccent = 0.24 * this.ro;
        const darkerColor = this.getDarkerColor(this.color);

        this.hourHand.clear();
        this.hourHand.x = this.clockX;
        this.hourHand.y = this.clockY;

        this.hourHand.beginFill(this.color);
        this.hourHand.lineStyle(this.borderLineWidth, 0x000000);
        this.hourHand.moveTo(w1 / 2, 0);
        this.hourHand.lineTo(w1 / 2, -h1);
        this.hourHand.lineTo(w2 / 2, -h1);
        this.hourHand.lineTo(w2 / 2, -h2);
        this.hourHand.lineTo(-w2 / 2, -h2);
        this.hourHand.lineTo(-w2 / 2, -h1);
        this.hourHand.lineTo(-w1 / 2, -h1);
        this.hourHand.lineTo(-w1 / 2, 0);
        this.hourHand.lineTo(w1 / 2, 0);
        this.hourHand.closePath();
        this.hourHand.endFill();

        this.hourHand.beginFill(darkerColor);
        this.hourHand.lineStyle(this.borderLineWidth, 0x000000);
        this.hourHand.moveTo(w1 / 2, 0);
        this.hourHand.lineTo(w1 / 2, -hAccent);
        this.hourHand.lineTo(-w1 / 2, -hAccent);
        this.hourHand.lineTo(-w1 / 2, 0);
        this.hourHand.lineTo(w1 / 2, 0);
        this.hourHand.drawCircle(0, 0, w1 / 2);
        this.hourHand.closePath();
        this.hourHand.endFill();
    }

    buildMinuteHand() {
        const w1 = 0.11 * this.ro;
        const w2 = 0.03 * this.ro;
        const h1 = 0.73 * this.ro;
        const h2 = (0.73 + 0.07) * this.ro;
        const hAccent = 0.12 * this.ro;
        const darkerColor = this.getDarkerColor(this.color);

        this.minuteHand.clear();
        this.minuteHand.x = this.clockX;
        this.minuteHand.y = this.clockY;

        this.minuteHand.beginFill(this.color);
        this.minuteHand.lineStyle(this.borderLineWidth, 0x000000);
        this.minuteHand.moveTo(w1 / 2, 0);
        this.minuteHand.lineTo(w1 / 2, -h1);
        this.minuteHand.lineTo(w2 / 2, -h1);
        this.minuteHand.lineTo(w2 / 2, -h2);
        this.minuteHand.lineTo(-w2 / 2, -h2);
        this.minuteHand.lineTo(-w2 / 2, -h1);
        this.minuteHand.lineTo(-w1 / 2, -h1);
        this.minuteHand.lineTo(-w1 / 2, 0);
        this.minuteHand.lineTo(w1 / 2, 0);
        this.minuteHand.closePath();
        this.minuteHand.endFill();

        this.minuteHand.beginFill(darkerColor);
        this.minuteHand.lineStyle(this.borderLineWidth, 0x000000);
        this.minuteHand.moveTo(w1 / 2, 0);
        this.minuteHand.lineTo(w1 / 2, -hAccent);
        this.minuteHand.lineTo(-w1 / 2, -hAccent);
        this.minuteHand.lineTo(-w1 / 2, 0);
        this.minuteHand.lineTo(w1 / 2, 0);
        this.minuteHand.drawCircle(0, 0, w1 / 2);
        this.minuteHand.closePath();
        this.minuteHand.endFill();
    }

    buildSecondHand() {
        const w1 = 0.11 * this.ro;
        const darkerColor = this.getDarkerColor(this.color);
        // For Original U1, use white stripes; for other colors, use the main color
        const stripeColor = (this.color === 0xFFFFFF) ? 0xFFFFFF : this.color;

        this.secondHand.clear();
        this.secondHand.x = this.clockX;
        this.secondHand.y = this.clockY;

        this.secondHand.lineStyle(this.borderLineWidth, 0x000000);
        this.secondHand.beginFill(darkerColor);
        this.secondHand.drawRect(-0.015 * this.ro, -0.15 * this.ro, 0.03 * this.ro, 0.69 * this.ro);
        this.secondHand.drawCircle(0, 0, w1 * 0.4);
        this.secondHand.drawCircle(0, 0, w1 * 0.1);

        this.secondHand.beginFill(stripeColor);
        this.secondHand.drawRect(-0.015 * this.ro, 0.54 * this.ro, 0.03 * this.ro, 0.08 * this.ro);

        this.secondHand.beginFill(darkerColor);
        this.secondHand.drawRect(-0.055 * this.ro, 0.62 * this.ro, 0.11 * this.ro, 0.11 * this.ro);

        this.secondHand.beginFill(stripeColor);
        this.secondHand.drawRect(-0.015 * this.ro, 0.73 * this.ro, 0.03 * this.ro, 0.08 * this.ro);
        this.secondHand.closePath();
        this.secondHand.endFill();
    }

    setupEventListeners() {
        this.resizeHandler = () => {
            setTimeout(() => this.buildClock(), 50);
        };
        window.addEventListener('resize', this.resizeHandler);
    }

    startAnimation() {
        this.animationTicker = (delta) => {
            const t = new Date();

            this.dayText.text = t.getDate();
            this.secondHand.rotation = (t.getSeconds() + t.getMilliseconds() / 1000) / 60 * 2 * Math.PI + 1 * Math.PI;
            this.minuteHand.rotation = (t.getMinutes() + t.getSeconds() / 60 + t.getMilliseconds() / 1000 / 60) / 30 * Math.PI;
            this.hourHand.rotation = (t.getHours() + t.getMinutes() / 60 + t.getSeconds() / 3600 + t.getMilliseconds() / 3600000) * 30 / 180 * Math.PI;
        };

        this.app.ticker.add(this.animationTicker);
    }

    createParameterDisplay() {
        // Create CSS styles for parameter display
        if (!document.getElementById('analog-clock-styles')) {
            const style = document.createElement('style');
            style.id = 'analog-clock-styles';
            style.textContent = `
                .analog-parameter-display {
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
                    overflow-x: hidden;
                }

                .analog-parameter-row {
                    margin: 0;
                    padding: 0;
                    white-space: nowrap;
                }

                .analog-parameter-row.active .analog-parameter-name {
                    background: #00ff00;
                    color: #000000;
                }

                .analog-parameter-row.active .analog-parameter-option.selected {
                    background: #00ff00;
                    color: #000000;
                    font-weight: bold;
                }

                .analog-parameter-name {
                    display: inline;
                    color: #00ff00;
                }

                .analog-parameter-options {
                    display: inline;
                    color: #888888;
                }

                .analog-parameter-option {
                    display: inline;
                }

                .analog-parameter-option.selected {
                    font-weight: bold;
                    color: #00ff00;
                }

                .analog-parameter-separator {
                    color: #444444;
                }
            `;
            document.head.appendChild(style);
        }

        this.parameterDisplay = document.createElement('div');
        this.parameterDisplay.className = 'analog-parameter-display';
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
                const separator = optionIndex < allOptions.length - 1 ? '<span class="analog-parameter-separator"> </span>' : '';
                return `<span class="analog-parameter-option${selectedClass}">${option}</span>${separator}`;
            }).join('');

            html += `<div class="analog-parameter-row${activeClass}">`;
            html += `<span class="analog-parameter-name">${paramName}: </span>`;
            html += `<span class="analog-parameter-options">${optionsHtml}</span>`;
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
            case 'SIZE':
                // Generate size options from 20% to 300%
                const sizeOptions = [];
                for (let pct = 20; pct <= 300; pct += 10) {
                    sizeOptions.push(pct + '%');
                }
                return sizeOptions;
            case 'COLOR':
                return this.colors.map(c => c.name);
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
            case 'SIZE':
                return this.currentSizeIndex;
            case 'COLOR':
                return this.currentColor;
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
            case 'SIZE':
                this.currentSizeIndex = (this.currentSizeIndex - 1 + this.sizeMultipliers.length) % this.sizeMultipliers.length;
                this.buildClock();
                break;
            case 'COLOR':
                this.currentColor = (this.currentColor - 1 + this.colors.length) % this.colors.length;
                this.buildClock();
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
            case 'SIZE':
                this.currentSizeIndex = (this.currentSizeIndex + 1) % this.sizeMultipliers.length;
                this.buildClock();
                break;
            case 'COLOR':
                this.currentColor = (this.currentColor + 1) % this.colors.length;
                this.buildClock();
                break;
        }

        this.saveSettings();
        this.showSelectedValue();
    }

    destroy() {
        if (this.animationTicker) {
            this.app.ticker.remove(this.animationTicker);
        }

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        // Clean up parameter display
        if (this.parameterDisplayTimeout) {
            clearTimeout(this.parameterDisplayTimeout);
        }
        if (this.parameterDisplay && this.parameterDisplay.parentNode) {
            this.parameterDisplay.parentNode.removeChild(this.parameterDisplay);
        }

        // Clean up styles
        const styleElement = document.getElementById('analog-clock-styles');
        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }

        if (this.app) {
            this.app.destroy(true, { children: true, texture: false, baseTexture: false });
        }
    }
}