"use client";

/**
 * 导出内容为PDF
 * @param content HTML内容
 * @param title 文档标题
 */
export async function exportToPDF(content: string, title: string = "document"): Promise<void> {
  // 动态导入html2pdf.js
  const html2pdf = (await import("html2pdf.js")).default;

  // 创建临时容器
  const container = document.createElement("div");
  container.innerHTML = content;
  container.style.padding = "20px";
  container.style.fontFamily = "system-ui, -apple-system, sans-serif";
  container.style.fontSize = "14px";
  container.style.lineHeight = "1.6";
  container.style.color = "#333";
  
  // 添加标题
  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  titleElement.style.fontSize = "24px";
  titleElement.style.fontWeight = "bold";
  titleElement.style.marginBottom = "20px";
  titleElement.style.color = "#059669";
  container.insertBefore(titleElement, container.firstChild);

  // 配置PDF选项
  const opt = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
    filename: `${title}-${Date.now()}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  // 生成PDF
  await html2pdf()
    .set(opt)
    .from(container)
    .save();

  // 清理临时容器
  container.remove();
}

/**
 * 导出Markdown为PDF
 * @param markdown Markdown内容
 * @param title 文档标题
 */
export async function exportMarkdownToPDF(markdown: string, title: string = "document"): Promise<void> {
  // 简单的Markdown转HTML转换
  const html = markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  await exportToPDF(html, title);
}
