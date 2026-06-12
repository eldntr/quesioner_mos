import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'audio', 'sentence.json');
    
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      const jsonData = JSON.parse(data);
      return NextResponse.json({ files: jsonData.sentences || [] });
    }

    // Fallback if sentence.json is not found
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(audioDir);
    const audioFiles = files
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.ogg'))
      .map(file => ({ audio: file, text: '', desc: '' }));
      
    return NextResponse.json({ files: audioFiles });
  } catch (error) {
    console.error('Error reading audio directory/json:', error);
    return NextResponse.json({ error: 'Failed to read audio directory' }, { status: 500 });
  }
}
