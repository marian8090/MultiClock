# MultiClock Synchronization

This adds real-time synchronization to the MultiClock application, allowing clock settings to be shared across multiple devices instantly.

## Features

- **Real-time sync**: Clock changes appear instantly on all connected devices
- **Parameter synchronization**: All clock settings (size, color, font, etc.) sync across devices
- **Connection status**: Visual indicator shows sync connection status
- **Offline fallback**: App works normally when sync server is unavailable
- **Easy setup**: Simple Node.js server with WebSocket communication

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Sync Server
```bash
npm start
# or
node sync-server.js
```

The server will run on `http://localhost:8080` and serve both the web app and WebSocket sync.

### 3. Open Multiple Browser Windows
- Open `http://localhost:8080` in multiple browser windows/tabs
- Or access from different devices on the same network using your IP address
- Changes made in one window will instantly appear in all others

## Testing Synchronization

### Option 1: Use the Test Page
Open `http://localhost:8080/test-sync.html` to test sync functionality with buttons and logs.

### Option 2: Use Multiple Clock Windows
1. Open `http://localhost:8080` in multiple browser windows
2. Use keyboard controls in one window:
   - Press `1`, `2`, or `3` to change clocks
   - Use arrow keys to change parameters
3. Watch changes appear instantly in other windows

## How It Works

### Architecture
- **Backend**: Node.js server with WebSocket support
- **Frontend**: SettingsSync class handles WebSocket communication
- **Integration**: MultiClock class automatically broadcasts changes

### Sync Status Indicator
A small colored circle appears in the top-right corner:
- 🟢 **Green**: Connected and syncing
- 🔴 **Red**: Disconnected (app still works locally)

### What Gets Synchronized
- **Clock Selection**: Switching between Analog, Digital, and 7-Segment clocks
- **All Parameters**: Size, color, font, font size, rendering mode, etc.
- **Real-time Updates**: Changes appear within milliseconds

## Deployment Options

### Local Network
Replace `localhost` with your computer's IP address to sync across devices on the same network:
```javascript
// In js/settings-sync.js, change:
this.serverUrl = options.serverUrl || 'ws://YOUR_IP_ADDRESS:8080';
```

### Cloud Deployment
Deploy the sync server to any Node.js hosting service:
- Heroku
- Railway
- DigitalOcean
- AWS/Azure/GCP

Update the `serverUrl` in `js/settings-sync.js` to point to your deployed server.

## Configuration

### Server Port
Change the server port by setting the `PORT` environment variable:
```bash
PORT=3000 npm start
```

### WebSocket URL
Update the WebSocket URL in `js/settings-sync.js`:
```javascript
this.serverUrl = 'ws://your-server:port';
```

## Technical Details

### Message Types
- `clock_change`: Broadcast when switching between clock types
- `parameter_change`: Broadcast when adjusting clock parameters
- `state_sync`: Full state synchronization for new connections

### Conflict Resolution
- **Last change wins**: Most recent change takes precedence
- **No conflicts**: All changes are applied in order received
- **Graceful degradation**: App works normally if sync fails

### Performance
- **Lightweight**: Only parameter changes are transmitted
- **Efficient**: WebSocket connection with minimal overhead
- **Responsive**: Changes appear within 50ms typically

## Troubleshooting

### Sync Not Working
1. Check that the sync server is running (`npm start`)
2. Verify WebSocket URL in browser developer tools
3. Check firewall settings for port 8080
4. Look for errors in browser console

### Connection Issues
- Red status indicator means server is unreachable
- App continues working locally without sync
- Auto-reconnection attempts every 3 seconds

### Port Conflicts
If port 8080 is in use, change it:
```bash
PORT=3000 npm start
```

## Files Added/Modified

### New Files
- `sync-server.js` - WebSocket server
- `js/settings-sync.js` - Frontend sync client
- `package.json` - Node.js dependencies
- `test-sync.html` - Sync testing interface

### Modified Files
- `index.html` - Added sync integration to MultiClock class

The original functionality remains unchanged - sync is purely additive.