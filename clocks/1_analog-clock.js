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

        // Available colors - U1 original is white, GREEN variations for other colors
        this.colors = [
            { name: 'Original U1', value: 0xFFFFFF }, // White
            { name: 'Green', value: 0x00FF00 },        // Full green
            { name: 'Dark Green', value: 0x008800 },   // Red -> darker green
            { name: 'Blue Green', value: 0x0088FF },   // Blue -> blue-green
            { name: 'Yellow Green', value: 0x88FF00 }, // Yellow -> yellow-green
            { name: 'Purple Green', value: 0x8800FF }, // Magenta -> purple-green
            { name: 'Cyan Green', value: 0x00FFFF }    // Cyan -> cyan-green
        ];

        // Parameters
        this.parameters = ['SIZE', 'COLOR'];
        this.currentParameterIndex = 0;

        // Current settings
        this.baseSizeMultiplier = 1.0;
        this.currentSizeMultiplier = 1.0;
        this.currentColor = 0; // Original U1 (white)

        // Parameter display element
        this.parameterDisplay = null;
        this.parameterDisplayTimeout = null;

        // Settings manager (will be set by MultiClock)
        this.settingsManager = null;
        this.clockIndex = null;
    }

    async init(container, savedSettings = null) {
        this.container = container;

        console.log('[AnalogClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[AnalogClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[AnalogClock] After loadSettings() - currentSizeMultiplier:', this.currentSizeMultiplier, 'currentColor:', this.currentColor);
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
            currentSizeMultiplier: this.currentSizeMultiplier,
            currentColor: this.currentColor
        };
        console.log('[AnalogClock] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[AnalogClock] loadSettings() called with:', settings);

        if (settings.currentSizeMultiplier !== undefined && settings.currentSizeMultiplier >= 0.2 && settings.currentSizeMultiplier <= 3.0) {
            console.log('[AnalogClock] Setting currentSizeMultiplier to:', settings.currentSizeMultiplier);
            this.currentSizeMultiplier = settings.currentSizeMultiplier;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[AnalogClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }

        console.log('[AnalogClock] loadSettings() complete. Final values - currentSizeMultiplier:', this.currentSizeMultiplier, 'currentColor:', this.currentColor);
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
        this.ro = Math.min(this.app.screen.width, this.app.screen.height) * 0.49 * this.currentSizeMultiplier;
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
        this.dayText.x = this.clockX + 0.46 * this.ro;
        this.dayText.y = this.clockY - 0.5 * 0.11 * this.ro;
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
            document.head.appendChild(style);
        }

        this.parameterDisplay = document.createElement('div');
        this.parameterDisplay.className = 'analog-parameter-display';
        this.updateParameterDisplay();
        this.container.appendChild(this.parameterDisplay);
    }

    updateParameterDisplay() {
        const parameter = this.parameters[this.currentParameterIndex];
        let value = '';

        switch (parameter) {
            case 'SIZE':
                value = Math.round(this.currentSizeMultiplier * 100) + '%';
                break;
            case 'COLOR':
                value = this.colors[this.currentColor].name;
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
            case 'SIZE':
                value = Math.round(this.currentSizeMultiplier * 100) + '%';
                break;
            case 'COLOR':
                value = this.colors[this.currentColor].name;
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
            case 'SIZE':
                this.currentSizeMultiplier = Math.max(0.2, this.currentSizeMultiplier / 1.2);
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
            case 'SIZE':
                this.currentSizeMultiplier = Math.min(3.0, this.currentSizeMultiplier * 1.2);
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