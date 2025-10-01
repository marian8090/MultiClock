export class SettingsSync {
    constructor(options = {}) {
        this.serverUrl = options.serverUrl || 'ws://192.168.1.220:8080';
        this.websocket = null;
        this.reconnectInterval = 3000; // 3 seconds
        this.reconnectTimer = null;
        this.isConnected = false;
        this.callbacks = {
            onClockChange: null,
            onParameterChange: null,
            onConnectionChange: null,
            onStateSync: null
        };

        // Status indicator element
        this.statusIndicator = null;
        this.createStatusIndicator();
    }

    createStatusIndicator() {
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.id = 'sync-status';
        this.statusIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #ff4444;
            border: 2px solid #333;
            z-index: 3000;
            transition: background-color 0.3s ease;
        `;
        this.statusIndicator.title = 'Sync Status: Disconnected';
        document.body.appendChild(this.statusIndicator);
    }

    updateStatusIndicator(connected) {
        if (this.statusIndicator) {
            this.statusIndicator.style.backgroundColor = connected ? '#44ff44' : '#ff4444';
            this.statusIndicator.title = connected ? 'Sync Status: Connected' : 'Sync Status: Disconnected';
        }
    }

    connect() {
        try {
            this.websocket = new WebSocket(this.serverUrl);

            this.websocket.onopen = () => {
                console.log('Connected to sync server');
                this.isConnected = true;
                this.updateStatusIndicator(true);
                this.clearReconnectTimer();

                if (this.callbacks.onConnectionChange) {
                    this.callbacks.onConnectionChange(true);
                }

                // Request current state
                this.send({
                    type: 'get_state'
                });
            };

            this.websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing sync message:', error);
                }
            };

            this.websocket.onclose = () => {
                console.log('Disconnected from sync server');
                this.isConnected = false;
                this.updateStatusIndicator(false);

                if (this.callbacks.onConnectionChange) {
                    this.callbacks.onConnectionChange(false);
                }

                this.scheduleReconnect();
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
                this.updateStatusIndicator(false);
            };

        } catch (error) {
            console.error('Failed to connect to sync server:', error);
            this.scheduleReconnect();
        }
    }

    handleMessage(message) {
        const { type, data } = message;

        switch (type) {
            case 'clock_change':
                if (this.callbacks.onClockChange) {
                    this.callbacks.onClockChange(data.clockIndex);
                }
                break;

            case 'parameter_change':
                if (this.callbacks.onParameterChange) {
                    this.callbacks.onParameterChange(data);
                }
                break;

            case 'state_sync':
                if (this.callbacks.onStateSync) {
                    this.callbacks.onStateSync(data);
                }
                break;

            default:
                console.log('Unknown sync message type:', type);
        }
    }

    send(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    broadcastClockChange(clockIndex) {
        return this.send({
            type: 'clock_change',
            data: { clockIndex }
        });
    }

    broadcastParameterChange(clockIndex, parameter, value) {
        return this.send({
            type: 'parameter_change',
            data: {
                clockIndex,
                parameter,
                value
            }
        });
    }

    scheduleReconnect() {
        this.clearReconnectTimer();
        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect to sync server...');
            this.connect();
        }, this.reconnectInterval);
    }

    clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    disconnect() {
        this.clearReconnectTimer();
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.isConnected = false;
        this.updateStatusIndicator(false);
    }

    // Event callback setters
    onClockChange(callback) {
        this.callbacks.onClockChange = callback;
    }

    onParameterChange(callback) {
        this.callbacks.onParameterChange = callback;
    }

    onConnectionChange(callback) {
        this.callbacks.onConnectionChange = callback;
    }

    onStateSync(callback) {
        this.callbacks.onStateSync = callback;
    }

    // Helper method to extract parameter values from clock instances
    getClockParameters(clockInstance) {
        const parameters = {};

        if (clockInstance.parameters) {
            clockInstance.parameters.forEach(param => {
                switch (param) {
                    case 'SIZE':
                        parameters.SIZE = clockInstance.currentSizeMultiplier || 1.0;
                        break;
                    case 'COLOR':
                        parameters.COLOR = clockInstance.currentColor || 0;
                        break;
                    case 'FONT':
                        parameters.FONT = clockInstance.currentFont || 0;
                        break;
                    case 'FONTSIZE':
                        parameters.FONTSIZE = clockInstance.currentFontSizeMultiplier || 1.0;
                        break;
                    case 'FONT COLOUR':
                        parameters['FONT COLOUR'] = clockInstance.currentColor || 0;
                        break;
                    case 'RENDERER':
                        parameters.RENDERER = clockInstance.currentRenderMode || 0;
                        break;
                }
            });
        }

        return parameters;
    }

    // Helper method to apply parameter values to clock instances
    applyClockParameters(clockInstance, parameters) {
        if (!clockInstance || !parameters) return;

        Object.entries(parameters).forEach(([param, value]) => {
            switch (param) {
                case 'SIZE':
                    if (clockInstance.currentSizeMultiplier !== undefined) {
                        clockInstance.currentSizeMultiplier = value;
                        if (clockInstance.updateSize) clockInstance.updateSize();
                    }
                    break;
                case 'COLOR':
                    if (clockInstance.currentColor !== undefined) {
                        clockInstance.currentColor = value;
                        if (clockInstance.updateColor) clockInstance.updateColor();
                    }
                    break;
                case 'FONT':
                    if (clockInstance.currentFont !== undefined) {
                        clockInstance.currentFont = value;
                        if (clockInstance.updateFont) clockInstance.updateFont();
                    }
                    break;
                case 'FONTSIZE':
                    if (clockInstance.currentFontSizeMultiplier !== undefined) {
                        clockInstance.currentFontSizeMultiplier = value;
                        if (clockInstance.updateFontSize) clockInstance.updateFontSize();
                    }
                    break;
                case 'FONT COLOUR':
                    if (clockInstance.currentColor !== undefined) {
                        clockInstance.currentColor = value;
                        if (clockInstance.updateColor) clockInstance.updateColor();
                    }
                    break;
                case 'RENDERER':
                    if (clockInstance.currentRenderMode !== undefined) {
                        clockInstance.currentRenderMode = value;
                        if (clockInstance.updateRenderMode) clockInstance.updateRenderMode();
                    }
                    break;
            }
        });
    }

    destroy() {
        this.disconnect();
        if (this.statusIndicator && this.statusIndicator.parentNode) {
            this.statusIndicator.parentNode.removeChild(this.statusIndicator);
        }
    }
}