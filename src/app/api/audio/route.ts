import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    
    // Check if directory exists
    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(audioDir);
    // Filter only audio files
    const audioFiles = files.filter(file => 
      file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg')
    );
    
    return NextResponse.json({ files: audioFiles });
  } catch (error) {
    console.error('Error reading audio directory:', error);
    return NextResponse.json({ error: 'Failed to read audio directory' }, { status: 500 });
  }
}
