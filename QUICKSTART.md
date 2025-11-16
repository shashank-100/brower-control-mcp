# Quick Start Guide

Get Browser MCP up and running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- Chrome browser
- Claude Desktop (or another MCP-compatible AI application)

## Step 1: Install and Build (2 minutes)

```bash
# Clone or download this repository
cd brower-control-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

You should see:
```
✓ Built successfully
```

## Step 2: Install Chrome Extension (1 minute)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Turn on **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Navigate to the `extension` folder inside this project
6. Click **"Select"**
7. ✓ Extension installed!

**Optional but recommended**: Pin the extension
- Click the puzzle icon in Chrome toolbar
- Find "Browser MCP"
- Click the pin icon

## Step 3: Start the MCP Server (30 seconds)

```bash
npm run dev
```

You should see:
```
Browser MCP server started
Waiting for browser extension connection on port 9003...
```

**Keep this terminal window open** - the server needs to stay running.

## Step 4: Connect the Extension (10 seconds)

1. Click the **Browser MCP** icon in Chrome toolbar
2. The popup shows connection status
3. Should automatically connect and show **"Connected"** with green badge ✓

If not connected:
- Click the **"Connect"** button
- Check that step 3 (MCP server) is still running

## Step 5: Configure Claude Desktop (1 minute)

### Find your config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Edit the config:

```json
{
  "mcpServers": {
    "browser": {
      "command": "node",
      "args": ["/REPLACE/WITH/ACTUAL/PATH/brower-control-mcp/dist/index.js"]
    }
  }
}
```

### Get the actual path:

```bash
# Run this in the project directory:
pwd
# Copy the output and append '/dist/index.js'
```

**Example paths:**
- macOS/Linux: `/Users/yourname/projects/brower-control-mcp/dist/index.js`
- Windows: `C:\\Users\\yourname\\projects\\brower-control-mcp\\dist\\index.js`

### Restart Claude Desktop

Close and reopen Claude Desktop completely.

## Step 6: Test It! (30 seconds)

Open Claude Desktop and try:

```
"Navigate to google.com"
```

or

```
"Take a screenshot of the current page"
```

You should see Claude using the browser automation tools! 🎉

## Troubleshooting

### Extension won't connect?

**Check:**
1. Is the MCP server running? (Step 3)
2. Is port 9003 blocked by firewall?
3. Check server terminal for "Browser extension connected" message

**Fix:**
```bash
# Kill anything on port 9003
lsof -ti:9003 | xargs kill -9

# Restart server
npm run dev
```

### Claude Desktop doesn't show browser tools?

**Check:**
1. Config file path is correct (Step 5)
2. Absolute path to `dist/index.js` is correct
3. Restarted Claude Desktop completely

**Fix:**
- Check Claude Desktop logs for errors
- Verify config JSON is valid (use a JSON validator)
- Try running manually: `node /your/path/dist/index.js`

### Browser commands not working?

**Check:**
1. Extension shows "Connected" (green badge)
2. MCP server is running
3. Active tab is the one you want to control

**Fix:**
- Refresh the page you're trying to control
- Click extension icon and hit "Refresh"
- Check browser DevTools console for errors

## Next Steps

Now that it's working:

- **Read [USAGE.md](USAGE.md)** for detailed documentation
- **Read [extension/README.md](extension/README.md)** for extension details
- **Explore all tools** in Claude by asking "What browser tools are available?"
- **Customize** the extension or add new tools

## Common Use Cases

### Web Scraping
```
"Go to hacker news, capture the page structure, and summarize the top stories"
```

### Form Filling
```
"Navigate to example.com/form, fill in the name field with 'John', email with 'john@example.com', and click submit"
```

### Testing
```
"Go to my-app.com, click all the navigation links, and take screenshots of each page"
```

### Research
```
"Search for 'MCP servers' on Google and summarize the first 5 results"
```

## Architecture Diagram

```
┌─────────────────────┐
│  Claude Desktop     │  ← You interact here
└─────────┬───────────┘
          │ MCP Protocol (stdio)
          │
┌─────────▼───────────┐
│   MCP Server        │  ← Step 3: npm run dev
│   (Node.js)         │
│   Port: stdio       │
└─────────┬───────────┘
          │ WebSocket (port 9003)
          │
┌─────────▼───────────┐
│  Chrome Extension   │  ← Step 2: Load unpacked
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  Chrome Browser     │  ← Your browser gets automated
│  (Your Profile)     │
└─────────────────────┘
```

## Support

- **Issues**: Open a GitHub issue
- **Documentation**: See README.md and USAGE.md
- **Examples**: Coming soon!

Happy automating! 🚀
