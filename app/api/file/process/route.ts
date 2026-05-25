import { NextRequest, NextResponse } from 'next/server';
import { DefaultFileProcessor } from '@/lib/file-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userType = formData.get('userType') as 'free' | 'pro' | 'max' || 'free';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (userType === 'free') {
      return NextResponse.json(
        { error: 'File upload is a Pro/Max exclusive feature' },
        { status: 403 }
      );
    }

    const processor = new DefaultFileProcessor();
    const processed = await processor.processFile(file, userType);

    return NextResponse.json(processed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
