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
        this.color = 0xFFFFFF;
        this.borderLineWidth = 0;
        this.animationTicker = null;
        this.resizeHandler = null;
    }

    async init(container) {
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
        this.setupEventListeners();
        this.startAnimation();
    }

    buildClock() {
        this.clockX = 0.5 * this.app.screen.width;
        this.clockY = 0.5 * this.app.screen.height;
        this.ro = Math.min(this.app.screen.width, this.app.screen.height) * 0.49;
        this.borderLineWidth = 0.002 * this.ro;

        if (this.watch) {
            this.app.stage.removeChild(this.watch);
        }

        this.watch = new PIXI.Container();

        this.buildWatchFace();
        this.buildHands();

        this.app.stage.addChild(this.watch);
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
        const hRed = 0.24 * this.ro;

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

        this.hourHand.beginFill(0xFF0000);
        this.hourHand.lineStyle(0, 0x000000);
        this.hourHand.moveTo(w1 / 2, 0);
        this.hourHand.lineTo(w1 / 2, -hRed);
        this.hourHand.lineTo(-w1 / 2, -hRed);
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
        const hRed = 0.12 * this.ro;

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

        this.minuteHand.beginFill(0xFF0000);
        this.minuteHand.lineStyle(0, 0x000000);
        this.minuteHand.moveTo(w1 / 2, 0);
        this.minuteHand.lineTo(w1 / 2, -hRed);
        this.minuteHand.lineTo(-w1 / 2, -hRed);
        this.minuteHand.lineTo(-w1 / 2, 0);
        this.minuteHand.lineTo(w1 / 2, 0);
        this.minuteHand.drawCircle(0, 0, w1 / 2);
        this.minuteHand.closePath();
        this.minuteHand.endFill();
    }

    buildSecondHand() {
        const w1 = 0.11 * this.ro;

        this.secondHand.clear();
        this.secondHand.x = this.clockX;
        this.secondHand.y = this.clockY;

        this.secondHand.lineStyle(this.borderLineWidth, 0x000000);
        this.secondHand.beginFill(0xFF0000);
        this.secondHand.drawRect(-0.015 * this.ro, -0.15 * this.ro, 0.03 * this.ro, 0.69 * this.ro);
        this.secondHand.drawCircle(0, 0, w1 * 0.4);
        this.secondHand.drawCircle(0, 0, w1 * 0.1);

        this.secondHand.beginFill(0xFFFFFF);
        this.secondHand.drawRect(-0.015 * this.ro, 0.54 * this.ro, 0.03 * this.ro, 0.08 * this.ro);

        this.secondHand.beginFill(0xFF0000);
        this.secondHand.drawRect(-0.055 * this.ro, 0.62 * this.ro, 0.11 * this.ro, 0.11 * this.ro);

        this.secondHand.beginFill(0xFFFFFF);
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

    destroy() {
        if (this.animationTicker) {
            this.app.ticker.remove(this.animationTicker);
        }

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }

        if (this.app) {
            this.app.destroy(true, { children: true, texture: false, baseTexture: false });
        }
    }
}