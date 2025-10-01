#!/usr/bin/env node

const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

class MultiClockSyncServer {
    constructor(port = 8080) {
        this.port = port;
        this.clients = new Set();
        this.currentState = {
            clockIndex: 0,
            clockSettings: {}
        };

        // Create HTTP server to serve static files
        this.httpServer = http.createServer((req, res) => {
            this.handleHttpRequest(req, res);
        });

        // Create WebSocket server
        this.wss = new WebSocket.Server({ server: this.httpServer });
        this.setupWebSocketHandlers();
    }

    handleHttpRequest(req, res) {
        // Serve static files from the current directory
        let filePath = req.url === '/' ? '/index.html' : req.url;

        // Security: prevent directory traversal
        filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        const fullPath = path.join(__dirname, filePath);

        // Check if file exists
        fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }

            // Get file extension for content type
            const ext = path.extname(fullPath).toLowerCase();
            const contentType = this.getContentType(ext);

            // Read and serve the file
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server error');
                    return;
                }

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
    }

    getContentType(ext) {
        const types = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.ttf': 'font/ttf',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2'
        };
        return types[ext] || 'application/octet-stream';
    }

    setupWebSocketHandlers() {
        this.wss.on('connection', (ws) => {
            console.log('Client connected. Total clients:', this.clients.size + 1);
            this.clients.add(ws);

            // Send current state to newly connected client
            this.sendToClient(ws, {
                type: 'state_sync',
                data: this.currentState
            });

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('Invalid JSON message:', error);
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);
                console.log('Client disconnected. Total clients:', this.clients.size);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }

    handleMessage(sender, message) {
        const { type, data } = message;

        switch (type) {
            case 'clock_change':
                this.currentState.clockIndex = data.clockIndex;
                this.broadcastToOthers(sender, {
                    type: 'clock_change',
                    data: { clockIndex: data.clockIndex }
                });
                console.log(`Clock changed to: ${data.clockIndex}`);
                break;

            case 'parameter_change':
                // Store parameter changes per clock type
                const clockKey = `clock_${data.clockIndex}`;
                if (!this.currentState.clockSettings[clockKey]) {
                    this.currentState.clockSettings[clockKey] = {};
                }
                this.currentState.clockSettings[clockKey][data.parameter] = data.value;

                this.broadcastToOthers(sender, {
                    type: 'parameter_change',
                    data: data
                });
                console.log(`Parameter changed - Clock ${data.clockIndex}: ${data.parameter} = ${data.value}`);
                break;

            case 'get_state':
                this.sendToClient(sender, {
                    type: 'state_sync',
                    data: this.currentState
                });
                break;

            default:
                console.log('Unknown message type:', type);
        }
    }

    sendToClient(client, message) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    broadcastToOthers(sender, message) {
        this.clients.forEach(client => {
            if (client !== sender && client.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message);
            }
        });
    }

    broadcastToAll(message) {
        this.clients.forEach(client => {
            this.sendToClient(client, message);
        });
    }

    start() {
        this.httpServer.listen(this.port, '0.0.0.0', () => {
            console.log(`MultiClock Sync Server running on http://0.0.0.0:${this.port}`);
            console.log(`Access from local network: http://192.168.1.220:${this.port}`);
            console.log('WebSocket server ready for connections');
        });
    }
}

// Start the server
const port = process.env.PORT || 8080;
const server = new MultiClockSyncServer(port);
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});