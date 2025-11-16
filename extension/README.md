# Browser MCP Chrome Extension

This Chrome extension connects your browser to the Browser MCP server, enabling AI applications to automate and control your browser.

## Features

- **WebSocket Connection**: Connects to the MCP server on `ws://localhost:9003`
- **Browser Automation**: Executes navigation, interaction, and inspection commands
- **Console Log Capture**: Automatically collects browser console logs
- **ARIA Snapshots**: Captures accessible page structure for AI context
- **Screenshots**: Takes full-page screenshots
- **Auto-Reconnect**: Automatically reconnects if the connection is lost
- **Status UI**: Popup interface showing connection status

## Installation

### Development Mode (Load Unpacked)

1. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the `extension` directory from this repository
   - The extension should now appear in your extensions list

3. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Browser MCP" and click the pin icon
   - The extension icon will now appear in your toolbar

4. **Generate Icons** (Optional)
   ```bash
   cd extension
   node generate-placeholder-icons.js
   ```
   Follow the instructions to create proper icons, or use default Chrome icons.

### Production (Chrome Web Store)

*Coming soon - extension will be published to Chrome Web Store*

## Usage

### 1. Start the MCP Server

First, ensure the MCP server is running:

```bash
# In the project root directory
npm run dev
```

You should see:
```
Browser MCP server started
Waiting for browser extension connection on port 9003...
```

### 2. Connect the Extension

- Click the Browser MCP extension icon in your toolbar
- The popup will show the connection status
- If not connected, click the "Connect" button
- You should see "Connected" status with a green badge

### 3. Use with AI Applications

Once connected, you can use AI applications (Claude Desktop, VS Code, etc.) to control your browser:

**Example commands:**
- "Navigate to google.com"
- "Click the search button"
- "Take a screenshot"
- "Get the console logs"
- "Type 'hello world' into the search box"

## Extension Structure

```
extension/
├── manifest.json          # Extension manifest (Chrome)
├── background.js          # Background service worker (WebSocket handler)
├── scripts/
│   └── content.js        # Content script (console log capture)
├── popup/
│   ├── popup.html        # Popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
└── icons/
    ├── icon.svg          # SVG icon template
    ├── icon16.png        # 16x16 icon
    ├── icon48.png        # 48x48 icon
    └── icon128.png       # 128x128 icon
```

## How It Works

```
┌─────────────────────┐
│  MCP Server         │
│  (Node.js)          │
│  Port: 9003         │
└──────────┬──────────┘
           │ WebSocket
           ↓
┌─────────────────────┐
│  Background Worker  │ ← Receives commands
│  (Extension)        │   Manages WebSocket
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌─────────┐  ┌─────────┐
│ Content │  │ Chrome  │
│ Script  │  │ APIs    │
└─────────┘  └─────────┘
    │             │
    └──────┬──────┘
           ↓
    ┌─────────────┐
    │   Browser   │
    │   (Tabs)    │
    └─────────────┘
```

### Message Flow

1. **AI Application** → MCP Server (stdio)
2. **MCP Server** → Extension (WebSocket)
3. **Extension Background** → Tab (Chrome API)
4. **Tab** executes action
5. **Tab** → Extension Background (result)
6. **Extension Background** → MCP Server (WebSocket)
7. **MCP Server** → AI Application (stdio)

## Supported Commands

The extension handles these message types:

### Navigation
- `browser_navigate` - Navigate to URL
- `browser_go_back` - Go back in history
- `browser_go_forward` - Go forward in history

### Interaction
- `browser_click` - Click element
- `browser_hover` - Hover over element
- `browser_type` - Type into input
- `browser_select_option` - Select dropdown option
- `browser_drag` - Drag and drop
- `browser_press_key` - Press keyboard key

### Inspection
- `browser_screenshot` - Capture screenshot
- `browser_get_console_logs` - Get console logs
- `browser_capture_snapshot` - Get ARIA snapshot

## Development

### Testing the Extension

1. **Check Background Worker Logs**
   - Go to `chrome://extensions/`
   - Find Browser MCP
   - Click "service worker" link
   - View console logs

2. **Check Content Script Logs**
   - Open DevTools on any page (F12)
   - Check for "[Browser MCP] Content script loaded"

3. **Test WebSocket Connection**
   - Open extension popup
   - Check connection status
   - View reconnect attempts

### Debugging

**Connection Issues:**
- Ensure MCP server is running (`npm run dev`)
- Check server logs for "Browser extension connected"
- Verify no firewall blocking port 9003
- Check background worker console for errors

**Command Execution Issues:**
- Open DevTools on the page
- Check for JavaScript errors
- Verify element selectors are correct
- Check content script is loaded

**Console Logs Not Captured:**
- Verify content script loaded before page scripts
- Check `window.__browserMcpLogs` in console
- Content script only captures logs after it loads

### Modifying the Extension

**Adding New Commands:**

1. Add handler in `background.js`:
   ```javascript
   async function handleNewCommand(message) {
     const result = await executeInTab((arg) => {
       // Your logic here
       return { success: true };
     }, [message.arg]);

     return {
       type: 'browser_new_command_response',
       data: result,
       error: null
     };
   }
   ```

2. Add case in `handleMessage()`:
   ```javascript
   case 'browser_new_command':
     return await handleNewCommand(message);
   ```

3. Add corresponding tool in MCP server

**Customizing the UI:**
- Edit `popup/popup.html` for structure
- Edit `popup/popup.css` for styling
- Edit `popup/popup.js` for behavior

## Security & Privacy

- **Local Only**: WebSocket connection is local (127.0.0.1)
- **No External Data**: Nothing sent to external servers
- **Your Browser Profile**: Uses your real browser with your logins
- **Permissions**: Only uses necessary Chrome permissions
- **Open Source**: All code is visible and auditable

## Troubleshooting

### Extension Won't Load

- Check Chrome version (requires Manifest V3 support)
- Verify all files are present
- Check for syntax errors in manifest.json
- Look for errors in `chrome://extensions/`

### WebSocket Connection Fails

- Ensure MCP server is running
- Check port 9003 is not blocked
- Verify server shows "Waiting for browser extension connection"
- Check background worker console for errors

### Commands Not Working

- Verify extension is connected (popup shows green)
- Check element selectors are valid
- Ensure content script loaded
- Look for errors in page DevTools

### Auto-Reconnect Not Working

- Check background worker logs
- Verify MCP server restarts properly
- Check for WebSocket errors
- Try manually clicking "Connect" in popup

## Publishing

### Prepare for Chrome Web Store

1. **Create proper icons** (see `icons/README.md`)
2. **Update version** in `manifest.json`
3. **Create screenshots** for store listing
4. **Write store description**
5. **Zip the extension directory**
6. **Submit to Chrome Web Store**

### Version Updates

When updating the extension:

1. Update `version` in `manifest.json`
2. Update version in `popup/popup.html`
3. Test thoroughly
4. Create git tag
5. Submit update to Chrome Web Store

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [Repository URL]
- Documentation: See main README.md
- MCP Server: See USAGE.md
