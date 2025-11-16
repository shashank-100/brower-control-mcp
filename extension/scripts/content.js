// Content script for Browser MCP extension
// Collects console logs and assists with page interaction

// Store console logs
window.__browserMcpLogs = [];

// Maximum number of logs to store
const MAX_LOGS = 100;

// Intercept console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

function interceptConsole(type) {
  console[type] = function(...args) {
    // Call original console method
    originalConsole[type].apply(console, args);

    // Store log
    const logEntry = {
      type: type,
      message: args.map(arg => {
        try {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        } catch (e) {
          return String(arg);
        }
      }).join(' '),
      timestamp: Date.now()
    };

    window.__browserMcpLogs.push(logEntry);

    // Keep only the last MAX_LOGS entries
    if (window.__browserMcpLogs.length > MAX_LOGS) {
      window.__browserMcpLogs.shift();
    }
  };
}

// Intercept all console methods
['log', 'info', 'warn', 'error', 'debug'].forEach(interceptConsole);

// Capture uncaught errors
window.addEventListener('error', (event) => {
  const logEntry = {
    type: 'error',
    message: `Uncaught error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
    timestamp: Date.now()
  };

  window.__browserMcpLogs.push(logEntry);

  if (window.__browserMcpLogs.length > MAX_LOGS) {
    window.__browserMcpLogs.shift();
  }
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const logEntry = {
    type: 'error',
    message: `Unhandled promise rejection: ${event.reason}`,
    timestamp: Date.now()
  };

  window.__browserMcpLogs.push(logEntry);

  if (window.__browserMcpLogs.length > MAX_LOGS) {
    window.__browserMcpLogs.shift();
  }
});

console.log('[Browser MCP] Content script loaded');
