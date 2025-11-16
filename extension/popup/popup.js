// Popup script for Browser MCP extension

const statusBadge = document.getElementById('connection-status');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const reconnectInfo = document.getElementById('reconnect-info');
const reconnectCount = document.getElementById('reconnect-count');
const connectBtn = document.getElementById('connect-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Update UI based on connection state
function updateUI(state) {
  // Update status badge
  if (state.connected) {
    statusBadge.textContent = 'Connected';
    statusBadge.className = 'status-badge connected';
    connectBtn.textContent = 'Connected';
    connectBtn.disabled = true;
  } else {
    statusBadge.textContent = 'Disconnected';
    statusBadge.className = 'status-badge disconnected';
    connectBtn.textContent = 'Connect';
    connectBtn.disabled = false;
  }

  // Show/hide error
  if (state.lastError) {
    errorMessage.textContent = state.lastError;
    errorSection.style.display = 'block';
  } else {
    errorSection.style.display = 'none';
  }

  // Show/hide reconnect info
  if (state.reconnectAttempts > 0) {
    reconnectCount.textContent = state.reconnectAttempts;
    reconnectInfo.style.display = 'block';
  } else {
    reconnectInfo.style.display = 'none';
  }
}

// Get current state from background
async function refreshState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getState' });
    updateUI(response);
  } catch (error) {
    console.error('Failed to get state:', error);
  }
}

// Connect to MCP server
async function connect() {
  try {
    statusBadge.textContent = 'Connecting...';
    statusBadge.className = 'status-badge connecting';

    await chrome.runtime.sendMessage({ type: 'connect' });

    // Wait a bit and refresh state
    setTimeout(refreshState, 1000);
  } catch (error) {
    console.error('Failed to connect:', error);
    errorMessage.textContent = error.message;
    errorSection.style.display = 'block';
  }
}

// Event listeners
connectBtn.addEventListener('click', connect);
refreshBtn.addEventListener('click', refreshState);

// Initial state update
refreshState();

// Auto-refresh every 2 seconds
setInterval(refreshState, 2000);
