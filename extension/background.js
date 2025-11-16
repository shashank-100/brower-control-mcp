// Background service worker for Browser MCP extension
// Manages WebSocket connection to the MCP server

const WS_URL = 'ws://localhost:9003';
let ws = null;
let reconnectInterval = null;
let isConnecting = false;

// Connection state
const state = {
  connected: false,
  lastError: null,
  reconnectAttempts: 0
};

// Connect to MCP server
function connect() {
  if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) {
    return;
  }

  isConnecting = true;
  console.log('[Browser MCP] Connecting to MCP server...');

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[Browser MCP] Connected to MCP server');
      isConnecting = false;
      state.connected = true;
      state.lastError = null;
      state.reconnectAttempts = 0;

      // Update badge
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });

      // Clear reconnect interval
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[Browser MCP] Received message:', message.type);

        // Handle different message types
        const response = await handleMessage(message);

        // Send response back to MCP server
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(response));
        }
      } catch (error) {
        console.error('[Browser MCP] Error handling message:', error);

        // Send error response
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: `${message.type}_response`,
            error: error.message,
            data: null
          }));
        }
      }
    };

    ws.onerror = (error) => {
      console.error('[Browser MCP] WebSocket error:', error);
      isConnecting = false;
      state.lastError = 'Connection error';
    };

    ws.onclose = () => {
      console.log('[Browser MCP] Disconnected from MCP server');
      isConnecting = false;
      state.connected = false;
      ws = null;

      // Update badge
      chrome.action.setBadgeText({ text: '✗' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });

      // Attempt to reconnect
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          state.reconnectAttempts++;
          console.log(`[Browser MCP] Reconnection attempt ${state.reconnectAttempts}...`);
          connect();
        }, 5000);
      }
    };
  } catch (error) {
    console.error('[Browser MCP] Failed to create WebSocket:', error);
    isConnecting = false;
    state.lastError = error.message;
  }
}

// Handle messages from MCP server
async function handleMessage(message) {
  const { type } = message;

  switch (type) {
    case 'browser_navigate':
      return await handleNavigate(message);

    case 'browser_go_back':
      return await handleGoBack(message);

    case 'browser_go_forward':
      return await handleGoForward(message);

    case 'browser_click':
      return await handleClick(message);

    case 'browser_hover':
      return await handleHover(message);

    case 'browser_type':
      return await handleType(message);

    case 'browser_select_option':
      return await handleSelectOption(message);

    case 'browser_drag':
      return await handleDrag(message);

    case 'browser_press_key':
      return await handlePressKey(message);

    case 'browser_screenshot':
      return await handleScreenshot(message);

    case 'browser_get_console_logs':
      return await handleGetConsoleLogs(message);

    case 'browser_capture_snapshot':
      return await handleCaptureSnapshot(message);

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

// Execute script in active tab
async function executeInTab(func, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error('No active tab found');
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: func,
    args: args
  });

  return results[0]?.result;
}

// Navigation handlers
async function handleNavigate(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.tabs.update(tab.id, { url: message.url });

  // Wait for page to load
  await new Promise((resolve) => {
    const listener = (tabId, changeInfo) => {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });

  return {
    type: 'browser_navigate_response',
    data: { success: true },
    error: null
  };
}

async function handleGoBack(message) {
  await executeInTab(() => window.history.back());
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    type: 'browser_go_back_response',
    data: { success: true },
    error: null
  };
}

async function handleGoForward(message) {
  await executeInTab(() => window.history.forward());
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    type: 'browser_go_forward_response',
    data: { success: true },
    error: null
  };
}

// Interaction handlers
async function handleClick(message) {
  const result = await executeInTab((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    element.click();
    return { success: true };
  }, [message.selector]);

  return {
    type: 'browser_click_response',
    data: result,
    error: null
  };
}

async function handleHover(message) {
  const result = await executeInTab((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const event = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);

    return { success: true };
  }, [message.selector]);

  return {
    type: 'browser_hover_response',
    data: result,
    error: null
  };
}

async function handleType(message) {
  const result = await executeInTab((selector, text) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    element.focus();
    element.value = text;

    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    return { success: true };
  }, [message.selector, message.text]);

  return {
    type: 'browser_type_response',
    data: result,
    error: null
  };
}

async function handleSelectOption(message) {
  const result = await executeInTab((selector, value) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    if (element.tagName !== 'SELECT') {
      throw new Error(`Element is not a select: ${selector}`);
    }

    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));

    return { success: true };
  }, [message.selector, message.value]);

  return {
    type: 'browser_select_option_response',
    data: result,
    error: null
  };
}

async function handleDrag(message) {
  const result = await executeInTab((fromSelector, toSelector) => {
    const fromElement = document.querySelector(fromSelector);
    const toElement = document.querySelector(toSelector);

    if (!fromElement) {
      throw new Error(`Source element not found: ${fromSelector}`);
    }
    if (!toElement) {
      throw new Error(`Target element not found: ${toSelector}`);
    }

    // Simulate drag and drop
    const dragStartEvent = new DragEvent('dragstart', { bubbles: true });
    const dropEvent = new DragEvent('drop', { bubbles: true });
    const dragEndEvent = new DragEvent('dragend', { bubbles: true });

    fromElement.dispatchEvent(dragStartEvent);
    toElement.dispatchEvent(dropEvent);
    fromElement.dispatchEvent(dragEndEvent);

    return { success: true };
  }, [message.fromSelector, message.toSelector]);

  return {
    type: 'browser_drag_response',
    data: result,
    error: null
  };
}

async function handlePressKey(message) {
  const result = await executeInTab((key) => {
    const event = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true
    });
    document.activeElement.dispatchEvent(event);

    return { success: true };
  }, [message.key]);

  return {
    type: 'browser_press_key_response',
    data: result,
    error: null
  };
}

// Inspection handlers
async function handleScreenshot(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: 'png'
  });

  // Remove data URL prefix to get base64
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');

  return {
    type: 'browser_screenshot_response',
    data: { image: base64 },
    error: null
  };
}

async function handleGetConsoleLogs(message) {
  // Console logs are collected by content script
  const result = await executeInTab(() => {
    // Return logs stored by content script
    return window.__browserMcpLogs || [];
  });

  return {
    type: 'browser_get_console_logs_response',
    data: { logs: result || [] },
    error: null
  };
}

async function handleCaptureSnapshot(message) {
  const snapshot = await executeInTab(() => {
    // Capture ARIA snapshot of the page
    function getAriaSnapshot(element = document.body, depth = 0, maxDepth = 5) {
      if (depth > maxDepth) return null;

      const role = element.getAttribute('role') || element.tagName.toLowerCase();
      const name = element.getAttribute('aria-label') ||
                   element.getAttribute('aria-labelledby') ||
                   element.getAttribute('title') ||
                   element.textContent?.substring(0, 50) || '';

      const snapshot = {
        role,
        name: name.trim(),
        tag: element.tagName.toLowerCase()
      };

      // Add important attributes
      if (element.id) snapshot.id = element.id;
      if (element.className) snapshot.class = element.className;
      if (element.href) snapshot.href = element.href;
      if (element.value !== undefined) snapshot.value = element.value;

      // Recursively get children (limit to interactive elements)
      const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'form'];
      const children = Array.from(element.children)
        .filter(child => {
          const tag = child.tagName.toLowerCase();
          return interactiveTags.includes(tag) ||
                 child.getAttribute('role') ||
                 child.querySelector(interactiveTags.join(','));
        })
        .map(child => getAriaSnapshot(child, depth + 1, maxDepth))
        .filter(Boolean);

      if (children.length > 0) {
        snapshot.children = children;
      }

      return snapshot;
    }

    const ariaTree = getAriaSnapshot();
    return JSON.stringify(ariaTree, null, 2);
  });

  return {
    type: 'browser_capture_snapshot_response',
    data: { snapshot },
    error: null
  };
}

// Get connection state
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getState') {
    sendResponse(state);
  } else if (request.type === 'connect') {
    connect();
    sendResponse({ success: true });
  }
  return true;
});

// Start connection on install/startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Browser MCP] Extension installed');
  connect();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('[Browser MCP] Extension started');
  connect();
});

// Auto-connect on load
connect();
