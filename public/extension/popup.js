const API_BASE = 'https://tryaiwriter.com';

document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt');
  const generateBtn = document.getElementById('generateBtn');
  const resultDiv = document.getElementById('result');

  function showResult(html, className = '') {
    resultDiv.innerHTML = html;
    resultDiv.className = 'result-area show' + (className ? ' ' + className : '');
  }

  function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? 'Generating...' : 'Generate';
  }

  async function generate() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      promptInput.focus();
      return;
    }

    setLoading(true);
    showResult('<span class="loading">Generating with AI...</span>', 'loading');

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: 'custom' }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${response.status})`);
      }

      const text = await response.text();
      const formatted = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/## (.+)/g, '<strong>$1</strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

      const actionsHtml = `
        <div class="result-actions">
          <button id="copyBtn" class="btn btn-outline" style="flex:1">Copy</button>
          <a href="${API_BASE}/write" target="_blank" class="btn btn-primary" style="flex:1; text-decoration:none;">Open Editor</a>
        </div>`;

      showResult(formatted + actionsHtml);

      // Copy button handler
      document.getElementById('copyBtn').addEventListener('click', async () => {
        await navigator.clipboard.writeText(text);
        const btn = document.getElementById('copyBtn');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      });
    } catch (error) {
      showResult(
        `<span class="error">Failed to generate: ${error.message}</span>
         <p style="margin-top:8px;font-size:12px;color:#64748b;">Try opening <a href="${API_BASE}/write" target="_blank" style="color:#34d399;">the editor</a> directly.</p>`
      );
    } finally {
      setLoading(false);
    }
  }

  generateBtn.addEventListener('click', generate);
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  });

  // Focus input on open
  promptInput.focus();
});