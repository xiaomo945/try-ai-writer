export interface ProcessedFile {
  text: string;
  tokenCount: number;
  type: string;
}

export interface FileProcessor {
  processFile(
    file: File,
    userType: 'free' | 'pro' | 'max'
  ): Promise<ProcessedFile>;
}

// Simple token count approximation
function approximateTokenCount(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

export class DefaultFileProcessor implements FileProcessor {
  async processFile(
    file: File,
    userType: 'free' | 'pro' | 'max'
  ): Promise<ProcessedFile> {
    if (userType === 'free') {
      throw new Error('文件上传为Pro/Max专属功能');
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (userType === 'pro' && fileSizeMB > 5) {
      throw new Error('Pro用户单文件最大5MB');
    }
    if (userType === 'max' && fileSizeMB > 20) {
      throw new Error('Max用户单文件最大20MB');
    }

    const fileName = file.name.toLowerCase();
    let text = '';
    let type = 'unknown';

    try {
      if (file.type === 'text/plain' || fileName.endsWith('.md')) {
        text = await file.text();
        type = 'text';
      } else if (fileName.endsWith('.txt')) {
        text = await file.text();
        type = 'text';
      } else {
        throw new Error('暂时只支持TXT/MD文件，更多格式即将上线');
      }
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error('文件处理失败');
    }

    return {
      text,
      tokenCount: approximateTokenCount(text),
      type
    };
  }
}

export const fileProcessor = new DefaultFileProcessor();
