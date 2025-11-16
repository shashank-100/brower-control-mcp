# Usage Guide

This guide explains how to install, configure, and use the Browser MCP server.

## Prerequisites

- Node.js 18+ installed
- Chrome browser
- Claude Desktop, VS Code, Cursor, or another MCP-compatible AI application

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

This creates the executable server in the `dist/` directory.

## Configuration

### Claude Desktop

Add the Browser MCP server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "browser": {
      "command": "node",
      "args": ["/absolute/path/to/brower-control-mcp/dist/index.js"]
    }
  }
}
```

**Important**: Replace `/absolute/path/to/brower-control-mcp/dist/index.js` with the actual absolute path to your `dist/index.js` file.

**Example paths**:
- macOS/Linux: `/Users/username/projects/brower-control-mcp/dist/index.js`
- Windows: `C:\\Users\\username\\projects\\brower-control-mcp\\dist\\index.js`

### VS Code (with Cline or Continue)

Add to your VS Code settings:

```json
{
  "cline.mcpServers": {
    "browser": {
      "command": "node",
      "args": ["/absolute/path/to/brower-control-mcp/dist/index.js"]
    }
  }
}
```

### Cursor / Windsurf

Similar MCP configuration in their respective settings files.

## Chrome Extension Setup

**⚠️ Important**: The MCP server alone is not sufficient. You also need a Chrome extension to complete the system.

The extension must:
1. Connect to WebSocket on `ws://localhost:9003`
2. Listen for browser automation commands
3. Execute commands in the browser
4. Return ARIA snapshots and results

The extension is a separate component that needs to be built and installed in Chrome.

## How to Use

### Starting the Server

#### Automatic (Recommended)

When you configure Claude Desktop (or other MCP clients), the server starts automatically when the application launches.

You'll see a message in the logs:
```
Browser MCP server started
Waiting for browser extension connection on port 9003...
```

#### Manual (for Testing)

You can also run the server manually for testing:

```bash
npm run dev
```

Or after building:

```bash
node dist/index.js
```

### Connecting the Chrome Extension

1. Install and enable the compatible Chrome extension
2. Click the extension icon in your browser toolbar
3. The extension will connect to the MCP server on port 9003
4. You should see: "Browser extension connected" in the server logs

### Using Tools in Claude Desktop

Once everything is connected, you can ask Claude to automate your browser:

**Examples**:

```
"Navigate to google.com and search for 'MCP servers'"

"Take a screenshot of the current page"

"Click the 'Sign In' button and type my email"

"Get the console logs from this page"

"Capture a snapshot of the current page state"
```

Claude will use the available browser automation tools to perform these actions.

## Available Tools

### Navigation Tools

- **navigate**: Navigate to a URL
  ```
  navigate to https://example.com
  ```

- **goBack**: Go back in browser history
  ```
  go back to the previous page
  ```

- **goForward**: Go forward in browser history
  ```
  go forward
  ```

### Interaction Tools

- **click**: Click an element by CSS selector or ARIA label
  ```
  click the submit button
  ```

- **hover**: Hover over an element
  ```
  hover over the menu
  ```

- **type**: Type text into an input element
  ```
  type "hello world" into the search box
  ```

- **selectOption**: Select an option in a dropdown
  ```
  select "United States" from the country dropdown
  ```

- **drag**: Drag one element to another
  ```
  drag the file to the upload area
  ```

### Inspection Tools

- **snapshot**: Capture current page state using ARIA snapshot
  ```
  capture a snapshot of the page
  ```

- **screenshot**: Take a screenshot of the current page
  ```
  take a screenshot
  ```

- **getConsoleLogs**: Retrieve browser console logs
  ```
  get the console logs
  ```

### Utility Tools

- **wait**: Wait for a specified number of seconds
  ```
  wait for 3 seconds
  ```

- **pressKey**: Press a keyboard key (e.g., Enter, Escape, ArrowDown)
  ```
  press the Enter key
  ```

## Architecture

```
┌─────────────────────┐
│  AI Application     │
│  (Claude Desktop)   │
└──────────┬──────────┘
           │ MCP Protocol (stdio)
           │
┌──────────▼──────────┐
│   MCP Server        │
│   (Node.js)         │  ← This project
│   Port: stdio       │
└──────────┬──────────┘
           │ WebSocket (port 9003)
           │
┌──────────▼──────────┐
│  Chrome Extension   │  ← Needs to be installed
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Chrome Browser     │
│  (Your Profile)     │
└─────────────────────┘
```

## Troubleshooting

### "No connection to browser extension" Error

**Symptoms**: Tools return an error about no browser extension connection.

**Solutions**:
1. Ensure the Chrome extension is installed and enabled
2. Click the extension icon to connect to the MCP server
3. Check that the server is running (look for logs)
4. Verify no firewall is blocking port 9003
5. Restart both the server and browser

### Port Already in Use

**Symptoms**: Server fails to start with "port already in use" error.

**Solutions**:
The server automatically kills processes on port 9003 when starting. If you still see issues:

1. Manually check what's using the port:
   ```bash
   lsof -i:9003
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   ```

3. Change the port in `src/ws.ts` if needed:
   ```typescript
   export const DEFAULT_WS_PORT = 9004; // Change this
   ```

### Claude Desktop Not Finding Tools

**Symptoms**: Tools don't appear in Claude Desktop.

**Solutions**:
1. Check the config file path is correct
2. Verify the absolute path to `dist/index.js` is correct
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors
5. Run the server manually to test: `node dist/index.js`

### Server Crashes or Stops

**Symptoms**: Server stops working after some time.

**Solutions**:
1. Check the logs for error messages
2. Ensure Node.js version is 18+
3. Verify WebSocket connection is stable
4. Restart the AI application (which will restart the server)

## Development

### Running in Development Mode

```bash
npm run watch
```

This watches for file changes and rebuilds automatically.

### Type Checking

```bash
npm run typecheck
```

### Debugging

Use the MCP Inspector:

```bash
npm run inspector
```

This launches the MCP inspector on ports 9001-9002 for debugging tool calls and server communication.

## Security & Privacy

- **Local Only**: All automation happens on your local machine
- **No External Servers**: No data is sent to remote servers
- **WebSocket Local**: WebSocket connection is local only (127.0.0.1)
- **Your Profile**: Uses your existing browser profile and credentials
- **Full Control**: You control what the AI can access

## Publishing & Distribution

### Publishing to npm

1. Update `package.json` with your package name:
   ```json
   {
     "name": "@your-username/browser-mcp",
     "version": "0.1.0"
   }
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Publish:
   ```bash
   npm publish --access public
   ```

### Installing from npm

Once published, users can install with:

```bash
npm install -g @your-username/browser-mcp
```

Then configure Claude Desktop to use the global installation:

```json
{
  "mcpServers": {
    "browser": {
      "command": "browser-mcp"
    }
  }
}
```

## Advanced Usage

### Running as a Service (Linux)

Create a systemd service file at `/etc/systemd/system/browser-mcp.service`:

```ini
[Unit]
Description=Browser MCP Server
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/brower-control-mcp
ExecStart=/usr/bin/node /path/to/brower-control-mcp/dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable browser-mcp
sudo systemctl start browser-mcp
```

### Running with PM2

```bash
pm2 start dist/index.js --name browser-mcp
pm2 save
pm2 startup
```

## Next Steps

1. **Build the Chrome Extension**: The MCP server requires a companion Chrome extension to function
2. **Test the Integration**: Use Claude Desktop to test browser automation
3. **Customize Tools**: Add or modify tools in `src/tools/` to fit your needs
4. **Share**: Publish to npm or share with your team

## Support

For issues, questions, or contributions:
- GitHub Issues: [Your Repository URL]
- Documentation: See README.md
- Examples: Check the `examples/` directory (if created)

## License

MIT
