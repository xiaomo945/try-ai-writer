import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { originalText, editInstruction, mode } = await req.json();
    if (!originalText || !editInstruction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For now, simulate a call to a model (DeepSeek or Claude) by just echoing with a note.
    const editedText = `${editInstruction.includes('Shorten') 
      ? originalText.split(' ').slice(0, Math.ceil(originalText.split(' ').length / 2)).join(' ') 
      : editInstruction.includes('Expand')
        ? `${originalText} [Added: This is an expanded example for demonstration purposes. In production, this would call an LLM API.]`
        : `${editInstruction} applied: ${originalText}`}`;
    
    return NextResponse.json({ editedText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process edit' }, { status: 500 });
  }
}
