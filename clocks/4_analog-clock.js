export class AnalogClock2 {
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

        // Available colors
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
            { name: '60HZ', value: '60hz' },
            { name: 'None', value: 'none' }
        ];

        // Available hour tick marks modes
        this.hourTicksModes = [
            { name: 'None', value: 'none' },
            { name: 'Small', value: 'small' },
            { name: 'Large', value: 'large' }
        ];

        // Available date display modes
        this.dateModes = [
            { name: 'OFF', value: 'off' },
            { name: 'DAY', value: 'day' },
            { name: 'WEEKDAY+DAY', value: 'weekday_day' }
        ];

        // Available width multipliers
        this.widthMultipliers = [
            { name: '1x', value: 1.0 },
            { name: '1.5x', value: 1.5 },
            { name: '2x', value: 2.0 },
            { name: '3x', value: 3.0 },
            { name: '4x', value: 4.0 },
            { name: '5x', value: 5.0 }
        ];

        // Parameters
        this.parameters = ['CLOCK MODEL', 'SIZE', 'COLOR', 'SECONDS HAND', 'TICKS', 'DATE', 'WIDTH'];
        this.currentParameterIndex = 0;

        // Current settings - Default to Green (index 0)
        this.baseSizeMultiplier = 1.0;
        this.currentSizeMultiplier = 1.0;
        this.currentColor = 0; // Green default
        this.currentSecondsHandMode = 0; // 1Hz default
        this.currentHourTicksMode = 0; // None default
        this.currentDateMode = 1; // DAY default
        this.currentWidthMultiplier = 0; // 1x default

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

        console.log('[AnalogClock2] init() called with savedSettings:', savedSettings);

        // Load saved settings if available
        if (savedSettings) {
            console.log('[AnalogClock2] Calling loadSettings() with:', savedSettings);
            this.loadSettings(savedSettings);
            console.log('[AnalogClock2] After loadSettings() - currentSizeMultiplier:', this.currentSizeMultiplier, 'currentColor:', this.currentColor, 'currentSecondsHandMode:', this.currentSecondsHandMode, 'currentHourTicksMode:', this.currentHourTicksMode, 'currentDateMode:', this.currentDateMode);
        } else {
            console.log('[AnalogClock2] No saved settings, using defaults');
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
            currentSecondsHandMode: this.currentSecondsHandMode,
            currentHourTicksMode: this.currentHourTicksMode,
            currentDateMode: this.currentDateMode,
            currentWidthMultiplier: this.currentWidthMultiplier
        };
        console.log('[AnalogClock2] getSettings() returning:', settings);
        return settings;
    }

    // Load settings from saved data
    loadSettings(settings) {
        console.log('[AnalogClock2] loadSettings() called with:', settings);

        if (settings.currentSizeMultiplier !== undefined && settings.currentSizeMultiplier >= 0.2 && settings.currentSizeMultiplier <= 3.0) {
            console.log('[AnalogClock2] Setting currentSizeMultiplier to:', settings.currentSizeMultiplier);
            this.currentSizeMultiplier = settings.currentSizeMultiplier;
        }
        if (settings.currentColor !== undefined && settings.currentColor >= 0 && settings.currentColor < this.colors.length) {
            console.log('[AnalogClock2] Setting currentColor to:', settings.currentColor);
            this.currentColor = settings.currentColor;
        }
        if (settings.currentSecondsHandMode !== undefined && settings.currentSecondsHandMode >= 0 && settings.currentSecondsHandMode < this.secondsHandModes.length) {
            console.log('[AnalogClock2] Setting currentSecondsHandMode to:', settings.currentSecondsHandMode);
            this.currentSecondsHandMode = settings.currentSecondsHandMode;
        }
        if (settings.currentHourTicksMode !== undefined && settings.currentHourTicksMode >= 0 && settings.currentHourTicksMode < this.hourTicksModes.length) {
            console.log('[AnalogClock2] Setting currentHourTicksMode to:', settings.currentHourTicksMode);
            this.currentHourTicksMode = settings.currentHourTicksMode;
        }
        if (settings.currentDateMode !== undefined && settings.currentDateMode >= 0 && settings.currentDateMode < this.dateModes.length) {
            console.log('[AnalogClock2] Setting currentDateMode to:', settings.currentDateMode);
            this.currentDateMode = settings.currentDateMode;
        }
        if (settings.currentWidthMultiplier !== undefined && settings.currentWidthMultiplier >= 0 && settings.currentWidthMultiplier < this.widthMultipliers.length) {
            console.log('[AnalogClock2] Setting currentWidthMultiplier to:', settings.currentWidthMultiplier);
            this.currentWidthMultiplier = settings.currentWidthMultiplier;
        }

        console.log('[AnalogClock2] loadSettings() complete. Final values - currentSizeMultiplier:', this.currentSizeMultiplier, 'currentColor:', this.currentColor, 'currentSecondsHandMode:', this.currentSecondsHandMode, 'currentHourTicksMode:', this.currentHourTicksMode, 'currentDateMode:', this.currentDateMode, 'currentWidthMultiplier:', this.currentWidthMultiplier);
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
            console.log('Analog Clock 2: Set to 60 FPS for smooth 60Hz second hand');
        } else {
            this.app.ticker.maxFPS = 8;
            console.log('Analog Clock 2: Set to 8 FPS for standard mode');
        }
    }

    buildClock() {
        this.clockX = 0.5 * this.app.screen.width;
        this.clockY = 0.5 * this.app.screen.height;
        this.ro = Math.min(this.app.screen.width, this.app.screen.height) * 0.49 * this.currentSizeMultiplier;
        this.borderLineWidth = 0.001 * this.ro; // Thinner borders
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
        // Build hour tick marks if enabled
        const hourTicksMode = this.hourTicksModes[this.currentHourTicksMode].value;
        if (hourTicksMode === 'small') {
            this.buildSmallHourTicks();
        } else if (hourTicksMode === 'large') {
            this.buildLargeTickMarks();
        }

        // Date Text at 3 o'clock position
        const dateMode = this.dateModes[this.currentDateMode].value;
        if (dateMode !== 'off') {
            const dayTextStyle = new PIXI.TextStyle({
                fill: this.color,
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: 0.15 * this.ro,
                fontWeight: "bold"
            });

            this.dayText = new PIXI.Text('--', dayTextStyle);
            this.dayText.anchor.set(1, 0.5); // Right-align text
            this.dayText.x = this.clockX + 0.65 * this.ro; // Position within inner circle (closer to center)
            this.dayText.y = this.clockY;
            this.watch.addChild(this.dayText);
        } else {
            this.dayText = null;
        }
    }

    buildSmallHourTicks() {
        // Draw 12 hour tick marks (small size)
        const widthMult = this.widthMultipliers[this.currentWidthMultiplier].value;
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const tickLength = 0.06 * this.ro; // Small tick length
            const tickWidth = 0.008 * this.ro * widthMult; // Thin tick width with multiplier

            const x1 = this.clockX + Math.sin(angle) * (this.ro - tickLength);
            const y1 = this.clockY - Math.cos(angle) * (this.ro - tickLength);
            const x2 = this.clockX + Math.sin(angle) * this.ro;
            const y2 = this.clockY - Math.cos(angle) * this.ro;

            const tick = new PIXI.Graphics();
            tick.moveTo(x1, y1);
            tick.lineTo(x2, y2);
            tick.stroke({ width: tickWidth, color: this.color });
            this.watch.addChild(tick);
        }
    }

    buildLargeTickMarks() {
        // Draw 12 large hour tick marks
        const widthMult = this.widthMultipliers[this.currentWidthMultiplier].value;
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const tickLength = 0.1 * this.ro; // Larger tick length for hour marks
            const tickWidth = 0.015 * this.ro * widthMult; // Thicker tick width for hour marks

            const x1 = this.clockX + Math.sin(angle) * (this.ro - tickLength);
            const y1 = this.clockY - Math.cos(angle) * (this.ro - tickLength);
            const x2 = this.clockX + Math.sin(angle) * this.ro;
            const y2 = this.clockY - Math.cos(angle) * this.ro;

            const tick = new PIXI.Graphics();
            tick.moveTo(x1, y1);
            tick.lineTo(x2, y2);
            tick.stroke({ width: tickWidth, color: this.color });
            this.watch.addChild(tick);
        }

        // Draw 48 smaller minute tick marks (between hour marks)
        for (let i = 0; i < 60; i++) {
            // Skip positions where hour marks are
            if (i % 5 !== 0) {
                const angle = (i * 6) * Math.PI / 180;
                const tickLength = 0.04 * this.ro; // Smaller tick length for minute marks
                const tickWidth = 0.005 * this.ro * widthMult; // Thin tick width for minute marks

                const x1 = this.clockX + Math.sin(angle) * (this.ro - tickLength);
                const y1 = this.clockY - Math.cos(angle) * (this.ro - tickLength);
                const x2 = this.clockX + Math.sin(angle) * this.ro;
                const y2 = this.clockY - Math.cos(angle) * this.ro;

                const tick = new PIXI.Graphics();
                tick.moveTo(x1, y1);
                tick.lineTo(x2, y2);
                tick.stroke({ width: tickWidth, color: this.color });
                this.watch.addChild(tick);
            }
        }
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
        // Hour hand - extended proportionally
        const widthMult = this.widthMultipliers[this.currentWidthMultiplier].value;
        const w = 0.025 * this.ro * widthMult;
        const h = 0.6 * this.ro; // Extended from 0.5 to 0.6 (20% increase)

        this.hourHand.clear();
        this.hourHand.x = this.clockX;
        this.hourHand.y = this.clockY;

        this.hourHand.beginFill(this.color);
        this.hourHand.drawRect(-w / 2, -h, w, h);
        this.hourHand.endFill();

        // Small center circle - same color as rest
        this.hourHand.beginFill(this.color);
        this.hourHand.drawCircle(0, 0, w);
        this.hourHand.endFill();
    }

    buildMinuteHand() {
        // Minute hand - extended to touch minute tick marks
        const widthMult = this.widthMultipliers[this.currentWidthMultiplier].value;
        const w = 0.02 * this.ro * widthMult;
        const h = 0.96 * this.ro; // Extended to reach minute tick marks (outer edge minus tick length)

        this.minuteHand.clear();
        this.minuteHand.x = this.clockX;
        this.minuteHand.y = this.clockY;

        this.minuteHand.beginFill(this.color);
        this.minuteHand.drawRect(-w / 2, -h, w, h);
        this.minuteHand.endFill();

        // Small center circle - same color as rest
        this.minuteHand.beginFill(this.color);
        this.minuteHand.drawCircle(0, 0, w * 1.2);
        this.minuteHand.endFill();
    }

    buildSecondHand() {
        this.secondHand.clear();
        this.secondHand.x = this.clockX;
        this.secondHand.y = this.clockY;

        // Only draw second hand if not in 'none' mode
        if (this.secondsHandModes[this.currentSecondsHandMode].value !== 'none') {
            // Second hand - extended to touch minute tick marks, bright color
            const widthMult = this.widthMultipliers[this.currentWidthMultiplier].value;
            const w = 0.008 * this.ro * widthMult;
            const h = 0.96 * this.ro; // Extended to reach minute tick marks

            // Use bright color (full color instead of darker)
            this.secondHand.beginFill(this.color);

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

            // Update date text based on mode
            const dateMode = this.dateModes[this.currentDateMode].value;
            if (this.dayText) {
                if (dateMode === 'day') {
                    this.dayText.text = t.getDate();
                } else if (dateMode === 'weekday_day') {
                    const weekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                    const weekday = weekdayNames[t.getDay()];
                    this.dayText.text = `${weekday}${t.getDate()}`; // No space between weekday and day
                }
            }

            // Handle different second hand modes
            const secondsHandMode = this.secondsHandModes[this.currentSecondsHandMode].value;

            // Update minute and hour hands based on mode
            if (secondsHandMode === '60hz') {
                // 60Hz mode - smooth movement with millisecond precision for all hands
                const ms = t.getMilliseconds() / 1000;
                this.secondHand.rotation = (t.getSeconds() + ms) / 60 * 2 * Math.PI;
                this.minuteHand.rotation = (t.getMinutes() + (t.getSeconds() + ms) / 60) / 30 * Math.PI;
                this.hourHand.rotation = (t.getHours() + (t.getMinutes() + (t.getSeconds() + ms) / 60) / 60) * 30 / 180 * Math.PI;
            } else {
                // 1Hz mode or None - discrete jumps (no milliseconds)
                if (secondsHandMode === '1hz') {
                    this.secondHand.rotation = t.getSeconds() / 60 * 2 * Math.PI;
                }
                this.minuteHand.rotation = (t.getMinutes() + t.getSeconds() / 60) / 30 * Math.PI;
                this.hourHand.rotation = (t.getHours() + t.getMinutes() / 60 + t.getSeconds() / 3600) * 30 / 180 * Math.PI;
            }
        };

        this.app.ticker.add(this.animationTicker);
    }

    createParameterDisplay() {
        // Create CSS styles for parameter display
        if (!document.getElementById('analog2-clock-styles')) {
            const style = document.createElement('style');
            style.id = 'analog2-clock-styles';
            style.textContent = `
                .analog2-parameter-display {
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
                .analog2-parameter-row {
                    margin: 0;
                    padding: 0;
                    white-space: nowrap;
                }
                .analog2-parameter-row.active .analog2-parameter-name {
                    background: #00ff00;
                    color: #000000;
                }
                .analog2-parameter-row.active .analog2-parameter-option.selected {
                    background: #00ff00;
                    color: #000000;
                    font-weight: bold;
                }
                .analog2-parameter-name {
                    display: inline;
                    color: #00ff00;
                }
                .analog2-parameter-options {
                    display: inline;
                    color: #888888;
                }
                .analog2-parameter-option {
                    display: inline;
                }
                .analog2-parameter-option.selected {
                    font-weight: bold;
                    color: #00ff00;
                }
                .analog2-parameter-separator {
                    color: #444444;
                }
            `;
            document.head.appendChild(style);
        }

        this.parameterDisplay = document.createElement('div');
        this.parameterDisplay.className = 'analog2-parameter-display';
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
                const separator = optionIndex < allOptions.length - 1 ? '<span class="analog2-parameter-separator"> </span>' : '';
                return `<span class="analog2-parameter-option${selectedClass}">${option}</span>${separator}`;
            }).join('');
            html += `<div class="analog2-parameter-row${activeClass}"><span class="analog2-parameter-name">${paramName}: </span><span class="analog2-parameter-options">${optionsHtml}</span></div>`;
        });
        this.parameterDisplay.innerHTML = html;
        this.parameterDisplay.style.display = 'block';

        // Show clock number when parameter menu is visible
        if (this.multiClockInstance && this.multiClockInstance.showClockNumber) {
            this.multiClockInstance.showClockNumber();
        }

        if (this.parameterDisplayTimeout) clearTimeout(this.parameterDisplayTimeout);
        this.parameterDisplayTimeout = setTimeout(() => {
            this.parameterDisplay.style.display = 'none';
            // Hide clock number when parameter menu hides
            if (this.multiClockInstance && this.multiClockInstance.hideClockNumber) {
                this.multiClockInstance.hideClockNumber();
            }
        }, 5000);
    }

    showSelectedValue() { this.updateParameterDisplay(); }

    getAllOptionsForParameter(paramName) {
        switch (paramName) {
            case 'CLOCK MODEL':
                if (this.multiClockInstance && this.multiClockInstance.clocks) return this.multiClockInstance.clocks.map(c => c.name);
                return ['Analog', 'Digital', '7-Segment LED', 'Analog', 'DSEG'];
            case 'SIZE':
                const sizeOptions = [];
                for (let pct = 20; pct <= 300; pct += 10) sizeOptions.push(pct + '%');
                return sizeOptions;
            case 'COLOR':
                return this.colors.map(c => c.name);
            case 'SECONDS HAND':
                return this.secondsHandModes.map(m => m.name);
            case 'TICKS':
                return this.hourTicksModes.map(m => m.name);
            case 'DATE':
                return this.dateModes.map(m => m.name);
            case 'WIDTH':
                return this.widthMultipliers.map(m => m.name);
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
            case 'TICKS':
                return this.currentHourTicksMode;
            case 'DATE':
                return this.currentDateMode;
            case 'WIDTH':
                return this.currentWidthMultiplier;
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

        console.log('[AnalogClock2] changeParameterLeft() - parameter:', parameter);

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
                console.log('[AnalogClock2] Changed size to:', this.currentSizeMultiplier);
                this.buildClock();
                break;
            case 'COLOR':
                this.currentColor = (this.currentColor - 1 + this.colors.length) % this.colors.length;
                console.log('[AnalogClock2] Changed color to:', this.currentColor);
                this.buildClock();
                break;
            case 'SECONDS HAND':
                this.currentSecondsHandMode = (this.currentSecondsHandMode - 1 + this.secondsHandModes.length) % this.secondsHandModes.length;
                console.log('[AnalogClock2] Changed seconds hand mode to:', this.currentSecondsHandMode);
                this.updateFPS();
                this.buildClock();
                break;
            case 'TICKS':
                this.currentHourTicksMode = (this.currentHourTicksMode - 1 + this.hourTicksModes.length) % this.hourTicksModes.length;
                console.log('[AnalogClock2] Changed ticks mode to:', this.currentHourTicksMode);
                this.buildClock();
                break;
            case 'DATE':
                this.currentDateMode = (this.currentDateMode - 1 + this.dateModes.length) % this.dateModes.length;
                console.log('[AnalogClock2] Changed date mode to:', this.currentDateMode);
                this.buildClock();
                break;
            case 'WIDTH':
                this.currentWidthMultiplier = (this.currentWidthMultiplier - 1 + this.widthMultipliers.length) % this.widthMultipliers.length;
                console.log('[AnalogClock2] Changed width multiplier to:', this.currentWidthMultiplier);
                this.buildClock();
                break;
        }

        console.log('[AnalogClock2] Calling saveSettings()');
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
            case 'TICKS':
                this.currentHourTicksMode = (this.currentHourTicksMode + 1) % this.hourTicksModes.length;
                this.buildClock();
                break;
            case 'DATE':
                this.currentDateMode = (this.currentDateMode + 1) % this.dateModes.length;
                this.buildClock();
                break;
            case 'WIDTH':
                this.currentWidthMultiplier = (this.currentWidthMultiplier + 1) % this.widthMultipliers.length;
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
        const styleElement = document.getElementById('analog2-clock-styles');
        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }

        if (this.app) {
            this.app.destroy(true, { children: true, texture: false, baseTexture: false });
        }
    }
}
