// Background service worker for Chrome extension
const API_BASE_URL = "https://useaiwriter.com/api";
const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_ID: "userId",
  GENERATION_HISTORY: "generationHistory",
};

// Initialize context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generate-content",
    title: "Use AI Writer: 生成内容",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "improve-text",
    title: "Use AI Writer: 改进文本",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "summarize",
    title: "Use AI Writer: 总结内容",
    contexts: ["selection"],
  });

  // Initialize storage
  chrome.storage.local.set({
    [STORAGE_KEYS.GENERATION_HISTORY]: [],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab?.id) return;

  const action = info.menuItemId;
  const selectedText = info.selectionText;

  // Send message to content script
  chrome.tabs.sendMessage(tab.id, {
    type: "CONTEXT_MENU_ACTION",
    action,
    selectedText,
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_CONTENT") {
    handleGenerateContent(message.payload)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }

  if (message.type === "GET_HISTORY") {
    chrome.storage.local.get(STORAGE_KEYS.GENERATION_HISTORY, (result) => {
      sendResponse(result[STORAGE_KEYS.GENERATION_HISTORY] || []);
    });
    return true;
  }

  if (message.type === "SAVE_TO_HISTORY") {
    saveToHistory(message.payload).then(sendResponse);
    return true;
  }

  if (message.type === "CHECK_AUTH") {
    checkAuth().then(sendResponse);
    return true;
  }
});

// Generate content via API
async function handleGenerateContent(payload) {
  const { prompt, mode, context } = payload;

  const token = await getAuthToken();
  if (!token) {
    throw new Error("请先登录 Use AI Writer");
  }

  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt,
      mode,
      context,
      source: "chrome-extension",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "生成失败");
  }

  const result = await response.json();

  // Save to history
  await saveToHistory({
    prompt,
    mode,
    result: result.content,
    timestamp: Date.now(),
  });

  return result;
}

// Save generation to history
async function saveToHistory(item) {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GENERATION_HISTORY);
  const history = result[STORAGE_KEYS.GENERATION_HISTORY] || [];

  // Keep only last 50 items
  const updatedHistory = [item, ...history].slice(0, 50);

  await chrome.storage.local.set({
    [STORAGE_KEYS.GENERATION_HISTORY]: updatedHistory,
  });

  return { success: true };
}

// Check authentication status
async function checkAuth() {
  const token = await getAuthToken();
  return { authenticated: !!token };
}

// Get auth token from storage
async function getAuthToken() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKEN);
  return result[STORAGE_KEYS.AUTH_TOKEN];
}

// Handle authentication from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_AUTH") {
    const { token, userId } = message.payload;
    chrome.storage.local.set(
      {
        [STORAGE_KEYS.AUTH_TOKEN]: token,
        [STORAGE_KEYS.USER_ID]: userId,
      },
      () => {
        sendResponse({ success: true });
      }
    );
    return true;
  }

  if (message.type === "LOGOUT") {
    chrome.storage.local.remove(
      [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_ID],
      () => {
        sendResponse({ success: true });
      }
    );
    return true;
  }
});
