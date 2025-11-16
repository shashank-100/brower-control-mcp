# Browser MCP

Browser MCP is an MCP (Model Context Protocol) server + Chrome extension that allows you to automate your browser using AI applications like VS Code, Claude, Cursor, and Windsurf.

## Features

⚡ **Fast**: Automation happens locally on your machine, resulting in better performance without network latency.

🔒 **Private**: Since automation happens locally, your browser activity stays on your device and isn't sent to remote servers.

👤 **Logged In**: Uses your existing browser profile, keeping you logged into all your services.

🥷🏼 **Stealth**: Avoids basic bot detection and CAPTCHAs by using your real browser fingerprint.

## Architecture

This project consists of two parts:

1. **MCP Server** (this repository): Provides browser automation tools via the Model Context Protocol
2. **Chrome Extension** (required): Connects your browser to the MCP server via WebSocket

The server communicates with the Chrome extension through a local WebSocket connection (default port: 9003), ensuring all automation happens on your local machine with no data sent to external servers.

## Installation

```bash
npm install
npm run build
```

## Usage

### Running the Server

```bash
npm run dev
```

Or after building:

```bash
node dist/index.js
```

### Configuration for Claude Desktop

Add this to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

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

### Chrome Extension Setup

You'll need a compatible Chrome extension that:
- Connects to WebSocket on port 9003
- Responds to browser automation commands
- Captures ARIA snapshots for page state

The extension handles the actual browser automation while the MCP server provides the AI interface.

## Available Tools

### Navigation Tools

- **navigate**: Navigate to a URL
- **goBack**: Go back in browser history
- **goForward**: Go forward in browser history

### Interaction Tools

- **click**: Click an element by CSS selector or ARIA label
- **hover**: Hover over an element
- **type**: Type text into an input element
- **selectOption**: Select an option in a dropdown
- **drag**: Drag one element to another

### Inspection Tools

- **snapshot**: Capture current page state using ARIA snapshot
- **screenshot**: Take a screenshot of the current page
- **getConsoleLogs**: Retrieve browser console logs

### Utility Tools

- **wait**: Wait for a specified number of seconds
- **pressKey**: Press a keyboard key (e.g., Enter, Escape, ArrowDown)

## Development

### Project Structure

```
src/
├── index.ts              # Main entry point
├── server.ts             # MCP server setup
├── context.ts            # WebSocket connection manager
├── ws.ts                 # WebSocket server creation
├── tools/
│   ├── tool.ts          # Tool type definitions
│   ├── common.ts        # Navigation tools
│   ├── custom.ts        # Screenshot and console tools
│   └── snapshot.ts      # Interaction tools
├── resources/
│   └── resource.ts      # Resource type definitions
└── utils/
    ├── port.ts          # Port management utilities
    └── snapshot.ts      # ARIA snapshot capture
```

### Build & Development Scripts

- `npm run build`: Build the project
- `npm run watch`: Watch mode for development
- `npm run typecheck`: Type check without building
- `npm run dev`: Build and run the server
- `npm run inspector`: Run MCP inspector for debugging

## How It Works

1. The MCP server starts and creates a WebSocket server on port 9003
2. The Chrome extension connects to the WebSocket server
3. AI applications (Claude, VS Code, etc.) communicate with the MCP server via stdio
4. When a tool is called, the MCP server sends commands to the browser via WebSocket
5. The extension executes the command in the actual browser
6. Results are captured (ARIA snapshot, screenshot, etc.) and returned to the AI

This architecture ensures:
- **Local execution**: Everything runs on your machine
- **Real browser**: Uses your actual Chrome profile with all logins
- **Privacy**: No data leaves your device
- **Stealth**: Real browser fingerprint, not a headless automation tool

## Protocol Messages

The server communicates with the browser extension using JSON messages over WebSocket:

### Request Format
```json
{
  "type": "browser_click",
  "selector": "#submit-button"
}
```

### Response Format
```json
{
  "type": "browser_click_response",
  "data": { "snapshot": "..." },
  "error": null
}
```

### Supported Message Types

- `browser_navigate` / `browser_navigate_response`
- `browser_go_back` / `browser_go_back_response`
- `browser_go_forward` / `browser_go_forward_response`
- `browser_click` / `browser_click_response`
- `browser_hover` / `browser_hover_response`
- `browser_type` / `browser_type_response`
- `browser_select_option` / `browser_select_option_response`
- `browser_drag` / `browser_drag_response`
- `browser_press_key` / `browser_press_key_response`
- `browser_screenshot` / `browser_screenshot_response`
- `browser_get_console_logs` / `browser_get_console_logs_response`
- `browser_capture_snapshot` / `browser_capture_snapshot_response`

## Security & Privacy

- All automation happens locally on your machine
- No data is sent to external servers
- WebSocket connection is local only (127.0.0.1)
- Uses your existing browser profile and credentials
- Full control over what the AI can access

## Troubleshooting

### "No connection to browser extension" Error

Make sure:
1. The Chrome extension is installed and enabled
2. The extension is connected (check the extension icon)
3. The MCP server is running
4. No firewall is blocking port 9003

### Port Already in Use

The server automatically kills any process using port 9003 when starting. If you see issues:
- Check if another instance is running
- Try changing the port in `src/ws.ts`

## Credits

This project is adapted from Microsoft's Playwright MCP server, refocused on automating existing user browsers rather than creating new automated instances.

## License

MIT
