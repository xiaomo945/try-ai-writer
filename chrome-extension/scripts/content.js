// Content script - injected into web pages
let floatingButton = null;
let panel = null;

// Initialize floating button
function initFloatingButton() {
  if (floatingButton) return;

  floatingButton = document.createElement("div");
  floatingButton.id = "use-ai-writer-btn";
  floatingButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
  `;
  floatingButton.className = "use-ai-writer-floating-btn";
  floatingButton.title = "Use AI Writer - AI写作助手";

  floatingButton.addEventListener("click", togglePanel);
  document.body.appendChild(floatingButton);
}

// Toggle AI panel
function togglePanel() {
  if (panel) {
    panel.remove();
    panel = null;
    return;
  }

  panel = document.createElement("div");
  panel.id = "use-ai-writer-panel";
  panel.className = "use-ai-writer-panel";
  panel.innerHTML = `
    <div class="use-ai-writer-panel-header">
      <h3>Use AI Writer</h3>
      <button class="use-ai-writer-close">&times;</button>
    </div>
    <div class="use-ai-writer-panel-content">
      <div class="use-ai-writer-modes">
        <button class="mode-btn active" data-mode="blog">博客</button>
        <button class="mode-btn" data-mode="email">邮件</button>
        <button class="mode-btn" data-mode="social">社交媒体</button>
        <button class="mode-btn" data-mode="custom">自定义</button>
      </div>
      <textarea class="use-ai-writer-input" placeholder="输入主题或关键词..."></textarea>
      <button class="use-ai-writer-generate">生成内容</button>
      <div class="use-ai-writer-result"></div>
    </div>
  `;

  document.body.appendChild(panel);

  // Event listeners
  panel.querySelector(".use-ai-writer-close").addEventListener("click", () => {
    panel.remove();
    panel = null;
  });

  panel.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      panel.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  panel.querySelector(".use-ai-writer-generate").addEventListener("click", handleGenerate);
}

// Handle content generation
async function handleGenerate() {
  const input = panel.querySelector(".use-ai-writer-input");
  const resultDiv = panel.querySelector(".use-ai-writer-result");
  const generateBtn = panel.querySelector(".use-ai-writer-generate");
  const activeMode = panel.querySelector(".mode-btn.active").dataset.mode;

  const prompt = input.value.trim();
  if (!prompt) {
    resultDiv.innerHTML = '<div class="error">请输入内容</div>';
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "生成中...";
  resultDiv.innerHTML = '<div class="loading">正在生成...</div>';

  try {
    const response = await chrome.runtime.sendMessage({
      type: "GENERATE_CONTENT",
      payload: {
        prompt,
        mode: activeMode,
        context: document.title,
      },
    });

    if (response.error) {
      throw new Error(response.error);
    }

    resultDiv.innerHTML = `
      <div class="result-content">
        ${response.content}
      </div>
      <div class="result-actions">
        <button class="copy-btn">复制</button>
        <button class="insert-btn">插入到页面</button>
      </div>
    `;

    // Copy button
    resultDiv.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(response.content);
      resultDiv.querySelector(".copy-btn").textContent = "已复制!";
      setTimeout(() => {
        resultDiv.querySelector(".copy-btn").textContent = "复制";
      }, 2000);
    });

    // Insert button
    resultDiv.querySelector(".insert-btn").addEventListener("click", () => {
      insertTextToActiveElement(response.content);
    });
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">${error.message}</div>`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "生成内容";
  }
}

// Insert text to active element
function insertTextToActiveElement(text) {
  const activeElement = document.activeElement;
  if (
    activeElement &&
    (activeElement.tagName === "TEXTAREA" ||
      activeElement.tagName === "INPUT" ||
      activeElement.isContentEditable)
  ) {
    if (activeElement.isContentEditable) {
      activeElement.textContent = text;
    } else {
      activeElement.value = text;
    }
    activeElement.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Handle text selection
function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText && selectedText.length > 10) {
    showSelectionActions(selectedText);
  }
}

// Show actions for selected text
function showSelectionActions(text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const actions = document.createElement("div");
  actions.className = "use-ai-writer-selection-actions";
  actions.style.top = `${rect.bottom + window.scrollY + 10}px`;
  actions.style.left = `${rect.left + window.scrollX}px`;
  actions.innerHTML = `
    <button data-action="improve">改进文本</button>
    <button data-action="summarize">总结</button>
    <button data-action="expand">扩展</button>
  `;

  document.body.appendChild(actions);

  actions.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleSelectionAction(btn.dataset.action, text);
      actions.remove();
    });
  });

  // Remove on click outside
  setTimeout(() => {
    document.addEventListener(
      "click",
      () => {
        actions.remove();
      },
      { once: true }
    );
  }, 100);
}

// Handle selection action
async function handleSelectionAction(action, text) {
  const prompts = {
    improve: "改进以下文本，使其更加流畅和专业：",
    summarize: "总结以下内容：",
    expand: "扩展以下内容，增加更多细节：",
  };

  const prompt = `${prompts[action]}\n\n${text}`;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "GENERATE_CONTENT",
      payload: {
        prompt,
        mode: "custom",
        context: document.title,
      },
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Show result in panel
    togglePanel();
    const resultDiv = panel.querySelector(".use-ai-writer-result");
    resultDiv.innerHTML = `
      <div class="result-content">
        ${response.content}
      </div>
      <div class="result-actions">
        <button class="copy-btn">复制</button>
        <button class="replace-btn">替换选中文本</button>
      </div>
    `;

    resultDiv.querySelector(".copy-btn").addEventListener("click", () => {
      navigator.clipboard.writeText(response.content);
      resultDiv.querySelector(".copy-btn").textContent = "已复制!";
      setTimeout(() => {
        resultDiv.querySelector(".copy-btn").textContent = "复制";
      }, 2000);
    });

    resultDiv.querySelector(".replace-btn").addEventListener("click", () => {
      replaceSelectedText(response.content);
    });
  } catch (error) {
    alert(`错误: ${error.message}`);
  }
}

// Replace selected text
function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
  }
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTEXT_MENU_ACTION") {
    const { action, selectedText } = message;
    handleSelectionAction(action, selectedText);
  }
});

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFloatingButton);
} else {
  initFloatingButton();
}

// Listen for text selection
document.addEventListener("mouseup", handleTextSelection);
