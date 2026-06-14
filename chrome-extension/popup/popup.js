// Popup script
let currentMode = "blog";
let isAuthenticated = false;

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  setupEventListeners();
  await loadHistory();
});

// Check authentication status
async function checkAuth() {
  const response = await chrome.runtime.sendMessage({ type: "CHECK_AUTH" });
  isAuthenticated = response.authenticated;
  updateAuthUI();
}

// Update UI based on auth status
function updateAuthUI() {
  const authStatus = document.getElementById("authStatus");
  const statusDot = authStatus.querySelector(".status-dot");
  const statusText = authStatus.querySelector(".status-text");
  const loginSection = document.getElementById("loginSection");
  const mainSection = document.getElementById("mainSection");

  if (isAuthenticated) {
    statusDot.classList.add("authenticated");
    statusText.textContent = "已登录";
    loginSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
  } else {
    statusDot.classList.remove("authenticated");
    statusText.textContent = "未登录";
    loginSection.classList.remove("hidden");
    mainSection.classList.add("hidden");
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login button
  document.getElementById("loginBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://useaiwriter.com/login?source=chrome-extension" });
  });

  // Mode buttons
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
    });
  });

  // Generate button
  document.getElementById("generateBtn").addEventListener("click", handleGenerate);

  // Copy button
  document.getElementById("copyBtn").addEventListener("click", handleCopy);

  // Insert button
  document.getElementById("insertBtn").addEventListener("click", handleInsert);

  // Clear history button
  document.getElementById("clearHistoryBtn").addEventListener("click", handleClearHistory);

  // Enter key in textarea
  document.getElementById("promptInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleGenerate();
    }
  });
}

// Handle content generation
async function handleGenerate() {
  const promptInput = document.getElementById("promptInput");
  const generateBtn = document.getElementById("generateBtn");
  const btnText = generateBtn.querySelector(".btn-text");
  const btnLoader = generateBtn.querySelector(".btn-loader");
  const resultSection = document.getElementById("resultSection");
  const resultContent = document.getElementById("resultContent");

  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("请输入内容");
    return;
  }

  // Show loading state
  generateBtn.disabled = true;
  btnText.textContent = "生成中...";
  btnLoader.classList.remove("hidden");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "GENERATE_CONTENT",
      payload: {
        prompt,
        mode: currentMode,
        context: document.title || "Chrome Extension",
      },
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Show result
    resultContent.textContent = response.content;
    resultSection.classList.remove("hidden");

    // Reload history
    await loadHistory();
  } catch (error) {
    alert(`生成失败: ${error.message}`);
  } finally {
    // Reset button state
    generateBtn.disabled = false;
    btnText.textContent = "生成内容";
    btnLoader.classList.add("hidden");
  }
}

// Handle copy to clipboard
async function handleCopy() {
  const resultContent = document.getElementById("resultContent");
  const text = resultContent.textContent;

  try {
    await navigator.clipboard.writeText(text);
    
    const copyBtn = document.getElementById("copyBtn");
    const originalHTML = copyBtn.innerHTML;
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
    }, 2000);
  } catch (error) {
    alert("复制失败");
  }
}

// Handle insert to page
async function handleInsert() {
  const resultContent = document.getElementById("resultContent");
  const text = resultContent.textContent;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, {
      type: "INSERT_TEXT",
      text,
    });

    window.close();
  } catch (error) {
    alert("插入失败，请确保在网页上使用");
  }
}

// Load history
async function loadHistory() {
  const historyList = document.getElementById("historyList");
  
  const history = await chrome.runtime.sendMessage({ type: "GET_HISTORY" });

  if (!history || history.length === 0) {
    historyList.innerHTML = '<div class="empty-state">暂无历史记录</div>';
    return;
  }

  historyList.innerHTML = history
    .map((item) => {
      const time = formatTime(item.timestamp);
      const modeLabel = getModeLabel(item.mode);
      return `
        <div class="history-item" data-prompt="${escapeHtml(item.prompt)}" data-content="${escapeHtml(item.result)}">
          <div class="history-item-header">
            <span class="history-item-mode">${modeLabel}</span>
            <span class="history-item-time">${time}</span>
          </div>
          <div class="history-item-prompt">${escapeHtml(item.prompt)}</div>
        </div>
      `;
    })
    .join("");

  // Add click handlers
  historyList.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const content = item.dataset.content;
      const resultSection = document.getElementById("resultSection");
      const resultContent = document.getElementById("resultContent");
      
      resultContent.textContent = content;
      resultSection.classList.remove("hidden");
    });
  });
}

// Clear history
async function handleClearHistory() {
  if (!confirm("确定要清空所有历史记录吗？")) {
    return;
  }

  await chrome.runtime.sendMessage({
    type: "SAVE_TO_HISTORY",
    payload: null,
    clear: true,
  });

  await loadHistory();
}

// Helper functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getModeLabel(mode) {
  const labels = {
    blog: "博客",
    email: "邮件",
    social: "社交",
    custom: "自定义",
  };
  return labels[mode] || mode;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
