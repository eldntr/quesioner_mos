import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// For Vercel, /tmp is writable but ephemeral. 
// For local development, we use a file in the project directory.
const isVercel = process.env.VERCEL === '1';
const DATA_FILE = isVercel 
  ? '/tmp/mos_scores.json' 
  : path.join(process.cwd(), 'mos_scores.json');

// Memory fallback just in case
let memoryFallback: any[] = [];

function getScores() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading scores file:', error);
  }
  return memoryFallback;
}

function saveScore(scoreData: any) {
  const scores = getScores();
  scores.push({
    ...scoreData,
    timestamp: new Date().toISOString()
  });
  
  memoryFallback = scores;
  
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
  } catch (error) {
    console.error('Error writing scores file:', error);
  }
}

export async function GET(request: Request) {
  // Simple Admin Password check for GET requests
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  
  // SECURECODER RULE: Do not hardcode secrets. Fallback to 'default-fallback' is bad for production
  // but since the user explicitly requested a specific password and we are enforcing env var:
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set!');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const scores = getScores();
  return NextResponse.json({ scores });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.identity || !body.results) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    saveScore(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing score submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Clear memory
  memoryFallback = [];
  
  // Clear file
  try {
    if (fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing scores file:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
