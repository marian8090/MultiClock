export class AviationClock {
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

        // Available colors - Same as clock 2 (Digital Clock)
        this.colors = [
            { name: 'Green', value: 0x00FF00 },
            { name: 'Red', value: 0xFF0000 },
            { name: 'Blue', value: 0x0000FF },
            { name: 'Yellow', value: 0xFFFF00 },
            { name: 'Magenta', value: 0xFF00FF },
            { name: 'Cyan', value: 0x00FFFF },
            { name: 'White', value: 0xFFFFFF }
        ];

        // Available seconds hand modes
        this.secondsHandModes = [
            { name: '1Hz', value: '1hz' },
            { name: 'Continuous 60Hz', value: '60hz' },
            { name: 'None', value: 'none' }
        ];

        // Parameters
        this.parameters = ['CLOCK MODEL', 'SIZE', 'COLOR', 'SECONDS HAND'];
        this.currentParameterIndex = 0;

        // Current settings - Default to Green (index 0)
        this.baseSizeMultiplier = 1.0;
        this.currentSizeMultiplier = 1.0;
        this.currentColor = 0; // Green default for aviation
        this.currentSecondsHandMode = 0; // 1Hz default

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

        console.log('[AviationClock] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[AviationClock] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[AviationClock] After loadSettings() - currentSizeMultiplier:', this.currentSizeMultiplier, 'currentColor:', this.currentColor, 'currentSecondsHandMode:', this.currentSecondsHandMode);
        } else {
            console.log('[AviationClock] No saved settings, using defaults');
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

        this.updateFPS();

        this.buildClock();
        this.createParameterDisplay();
        this.setupEventListeners();
        this.startAnimation();
    }

    // Get current settings for persistence
    getSettings() {
        const settings = {
            currentSizeMultiplier: this.currentSizeMultiplier,
            currentColor: this.currentColor,
            currentSecondsHandMode: this.currentSecondsHandMode
        };
        console.log('[AviationClock] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[AviationClock] loadSettings() called with:', settings);

        if (settings.currentSizeMultiplier !== undefined && settings.currentSizeMultiplier >= 0.2 && settings.currentSizeMultiplier <= 3.0) {
            console.log('[AviationClock] Setting currentSizeMultiplier to:', settings.currentSizeMultiplier);
            this.currentSizeMultiplier = settings.currentSizeMultiplier;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[AviationClock] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentSecondsHandMode !== undefined && settings.currentSecondsHandMode >= 0 && settings.currentSecondsHandMode < this.secondsHandModes.length) {
            console.log('[AviationClock] Setting currentSecondsHandMode to:', settings.currentSecondsHandMode);
            this.currentSecondsHandMode = settings.currentSecondsHandMode;
        }

        console.log('[AviationClock] loadSettings() complete. Final values - currentSizeMultiplier:', this.currentSizeMultiplier, 'currentColor:', this.currentColor, 'currentSecondsHandMode:', this.currentSecondsHandMode);
    }

    // Save current settings
    saveSettings() {
        if (this.settingsManager && this.clockIndex !== null) {
            this.settingsManager.saveClockSettings(this.clockIndex, this.getSettings());
        }
    }

    updateFPS() {
        const secondsHandMode = this.secondsHandModes[this.currentSecondsHandMode].value;
        if (secondsHandMode === '60hz') {
            this.app.ticker.maxFPS = 60;
            console.log('Aviation Clock: Set to 60 FPS for smooth 60Hz second hand');
        } else {
            this.app.ticker.maxFPS = 8;
            console.log('Aviation Clock: Set to 8 FPS for standard mode');
        }
    }

    buildClock() {
        this.clockX = 0.5 * this.app.screen.width;
        this.clockY = 0.5 * this.app.screen.height;
        this.ro = Math.min(this.app.screen.width, this.app.screen.height) * 0.49 * this.currentSizeMultiplier;
        this.borderLineWidth = 0.001 * this.ro; // Thinner borders for aviation style
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
        // For all colors, extract RGB components and make them darker (multiply by 0.6)
        const r = Math.floor(((color >> 16) & 0xFF) * 0.6);
        const g = Math.floor(((color >> 8) & 0xFF) * 0.6);
        const b = Math.floor((color & 0xFF) * 0.6);
        return (r << 16) | (g << 8) | b;
    }

    buildWatchFace() {
        // Date Text at 3 o'clock position - increased size by 50%
        const dayTextStyle = new PIXI.TextStyle({
            fill: this.color,
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 0.15 * this.ro, // Increased from 0.1 to 0.15 (50% larger)
            fontWeight: "bold"
        });

        this.dayText = new PIXI.Text('--', dayTextStyle);
        this.dayText.x = this.clockX + 0.5 * this.ro;
        this.dayText.y = this.clockY - 0.5 * 0.15 * this.ro; // Adjusted for new size
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
        // Very slim hour hand for aviation style
        const w = 0.025 * this.ro; // Much thinner
        const h = 0.5 * this.ro;   // Shorter than original
        const darkerColor = this.getDarkerColor(this.color);

        this.hourHand.clear();
        this.hourHand.x = this.clockX;
        this.hourHand.y = this.clockY;

        this.hourHand.beginFill(this.color);
        this.hourHand.drawRect(-w / 2, -h, w, h);
        this.hourHand.endFill();

        // Small center circle
        this.hourHand.beginFill(darkerColor);
        this.hourHand.drawCircle(0, 0, w);
        this.hourHand.endFill();
    }

    buildMinuteHand() {
        // Very slim minute hand for aviation style
        const w = 0.02 * this.ro;  // Even thinner
        const h = 0.75 * this.ro;  // Longer than hour hand
        const darkerColor = this.getDarkerColor(this.color);

        this.minuteHand.clear();
        this.minuteHand.x = this.clockX;
        this.minuteHand.y = this.clockY;

        this.minuteHand.beginFill(this.color);
        this.minuteHand.drawRect(-w / 2, -h, w, h);
        this.minuteHand.endFill();

        // Small center circle
        this.minuteHand.beginFill(darkerColor);
        this.minuteHand.drawCircle(0, 0, w * 1.2);
        this.minuteHand.endFill();
    }

    buildSecondHand() {
        this.secondHand.clear();
        this.secondHand.x = this.clockX;
        this.secondHand.y = this.clockY;

        // Only draw second hand if not in 'none' mode
        if (this.secondsHandModes[this.currentSecondsHandMode].value !== 'none') {
            // Ultra-slim second hand for aviation style
            const w = 0.008 * this.ro; // Ultra thin
            const h = 0.8 * this.ro;   // Long and thin
            const darkerColor = this.getDarkerColor(this.color);

            this.secondHand.beginFill(darkerColor);

            // Simple thin rectangle
            this.secondHand.drawRect(-w / 2, -h, w, h);

            // Small center circle
            this.secondHand.drawCircle(0, 0, w * 2);
            this.secondHand.endFill();

            // Make visible
            this.secondHand.visible = true;
        } else {
            // Hide second hand
            this.secondHand.visible = false;
        }
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

            // Handle different second hand modes
            const secondsHandMode = this.secondsHandModes[this.currentSecondsHandMode].value;
            if (secondsHandMode === '1hz') {
                // 1Hz second hand updates - discrete jumps
                this.secondHand.rotation = (t.getSeconds()) / 60 * 2 * Math.PI;
            } else if (secondsHandMode === '60hz') {
                // Continuous 60Hz second hand - smooth movement
                this.secondHand.rotation = (t.getSeconds() + t.getMilliseconds() / 1000) / 60 * 2 * Math.PI;
            }
            // For 'none' mode, we don't update rotation (hand is invisible anyway)

            // Smooth minute and hour hands
            this.minuteHand.rotation = (t.getMinutes() + t.getSeconds() / 60) / 30 * Math.PI;
            this.hourHand.rotation = (t.getHours() + t.getMinutes() / 60 + t.getSeconds() / 3600) * 30 / 180 * Math.PI;
        };

        this.app.ticker.add(this.animationTicker);
    }

    createParameterDisplay() {
        // Create CSS styles for parameter display
        if (!document.getElementById('aviation-clock-styles')) {
            const style = document.createElement('style');
            style.id = 'aviation-clock-styles';
            style.textContent = `
                .aviation-parameter-display {
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
                .aviation-parameter-row {
                    margin: 0;
                    padding: 0;
                    white-space: nowrap;
                }
                .aviation-parameter-row.active .aviation-parameter-name {
                    background: #00ff00;
                    color: #000000;
                }
                .aviation-parameter-row.active .aviation-parameter-option.selected {
                    background: #00ff00;
                    color: #000000;
                    font-weight: bold;
                }
                .aviation-parameter-name {
                    display: inline;
                    color: #00ff00;
                }
                .aviation-parameter-options {
                    display: inline;
                    color: #888888;
                }
                .aviation-parameter-option {
                    display: inline;
                }
                .aviation-parameter-option.selected {
                    font-weight: bold;
                    color: #00ff00;
                }
                .aviation-parameter-separator {
                    color: #444444;
                }
            `;
            document.head.appendChild(style);
        }

        this.parameterDisplay = document.createElement('div');
        this.parameterDisplay.className = 'aviation-parameter-display';
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
                const separator = optionIndex < allOptions.length - 1 ? '<span class="aviation-parameter-separator"> </span>' : '';
                return `<span class="aviation-parameter-option${selectedClass}">${option}</span>${separator}`;
            }).join('');
            html += `<div class="aviation-parameter-row${activeClass}"><span class="aviation-parameter-name">${paramName}: </span><span class="aviation-parameter-options">${optionsHtml}</span></div>`;
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
            case 'SIZE':
                const sizeOptions = [];
                for (let pct = 20; pct <= 300; pct += 10) sizeOptions.push(pct + '%');
                return sizeOptions;
            case 'COLOR':
                return this.colors.map(c => c.name);
            case 'SECONDS HAND':
                return this.secondsHandModes.map(m => m.name);
            default:
                return [];
        }
    }

    getCurrentSelectionForParameter(paramName) {
        switch (paramName) {
            case 'CLOCK MODEL':
                if (this.multiClockInstance) return this.multiClockInstance.currentClockIndex;
                return this.clockIndex || 0;
            case 'SIZE':
                const currentPct = Math.round(this.currentSizeMultiplier * 100);
                const sizeIndex = Math.round((currentPct - 20) / 10);
                return Math.max(0, Math.min(28, sizeIndex));
            case 'COLOR':
                return this.currentColor;
            case 'SECONDS HAND':
                return this.currentSecondsHandMode;
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

        console.log('[AviationClock] changeParameterLeft() - parameter:', parameter);

        switch (parameter) {
            case 'CLOCK MODEL':
                if (this.multiClockInstance) {
                    const numClocks = this.multiClockInstance.clocks.length;
                    const newIndex = (this.multiClockInstance.currentClockIndex - 1 + numClocks) % numClocks;
                    this.multiClockInstance.switchToClock(newIndex);
                }
                return;
            case 'SIZE':
                this.currentSizeMultiplier = Math.max(0.2, this.currentSizeMultiplier / 1.2);
                console.log('[AviationClock] Changed size to:', this.currentSizeMultiplier);
                this.buildClock();
                break;
            case 'COLOR':
                this.currentColor = (this.currentColor - 1 + this.colors.length) % this.colors.length;
                console.log('[AviationClock] Changed color to:', this.currentColor);
                this.buildClock();
                break;
            case 'SECONDS HAND':
                this.currentSecondsHandMode = (this.currentSecondsHandMode - 1 + this.secondsHandModes.length) % this.secondsHandModes.length;
                console.log('[AviationClock] Changed seconds hand mode to:', this.currentSecondsHandMode);
                this.updateFPS();
                this.buildClock();
                break;
        }

        console.log('[AviationClock] Calling saveSettings()');
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
            case 'SIZE':
                this.currentSizeMultiplier = Math.min(3.0, this.currentSizeMultiplier * 1.2);
                this.buildClock();
                break;
            case 'COLOR':
                this.currentColor = (this.currentColor + 1) % this.colors.length;
                this.buildClock();
                break;
            case 'SECONDS HAND':
                this.currentSecondsHandMode = (this.currentSecondsHandMode + 1) % this.secondsHandModes.length;
                this.updateFPS();
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
        const styleElement = document.getElementById('aviation-clock-styles');
        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }

        if (this.app) {
            this.app.destroy(true, { children: true, texture: false, baseTexture: false });
        }
    }
}