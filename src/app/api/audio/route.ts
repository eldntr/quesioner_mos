import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const samplesDir = path.join(process.cwd(), 'public', 'random_samples');
    if (!fs.existsSync(samplesDir)) {
      return NextResponse.json({ files: [] });
    }

    const directories = fs.readdirSync(samplesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const samples = directories.map(dirName => {
      const dirPath = path.join(samplesDir, dirName);
      
      let transcript = '';
      const transcriptPath = path.join(dirPath, 'transcript.txt');
      if (fs.existsSync(transcriptPath)) {
        transcript = fs.readFileSync(transcriptPath, 'utf8').trim();
        // Remove "Audio Name: ... Transcript: " if it exists
        const match = transcript.match(/Transcript:\s*(.*)/i);
        if (match && match[1]) {
          transcript = match[1].trim();
        }
      }

      // Collect audio files
      const filesInDir = fs.readdirSync(dirPath);
      let audioGt = '', audioLpep = '', audioFt = '', audioMms = '', audioOmnivoice = '', audioId = '';
      
      filesInDir.forEach(f => {
        if (f.startsWith('gt_')) audioGt = `/random_samples/${dirName}/${f}`;
        else if (f.startsWith('LPEP_PPIM_')) audioLpep = `/random_samples/${dirName}/${f}`;
        else if (f.startsWith('ft_')) audioFt = `/random_samples/${dirName}/${f}`;
        else if (f.startsWith('mms_')) audioMms = `/random_samples/${dirName}/${f}`;
        else if (f.startsWith('omnivoice_')) audioOmnivoice = `/random_samples/${dirName}/${f}`;
        else if (f.startsWith('id_')) audioId = `/random_samples/${dirName}/${f}`;
      });

      return {
        id: dirName,
        text: transcript,
        audioGt,
        audioLpep,
        audioFt,
        audioMms,
        audioOmnivoice,
        audioId
      };
    });

    return NextResponse.json({ samples });
  } catch (error) {
    console.error('Error reading samples directory:', error);
    return NextResponse.json({ error: 'Failed to read samples directory' }, { status: 500 });
  }
}
