import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  // Simple Admin Password check for GET requests
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set!');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching from Supabase:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }

  // Map to match the old format
  const formattedScores = scores?.map(score => ({
    id: score.id,
    identity: score.identity,
    results: score.results,
    timestamp: score.created_at
  })) || [];

  return NextResponse.json({ scores: formattedScores });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.identity || !body.results) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('scores')
      .insert([
        { 
          identity: body.identity, 
          results: body.results 
        }
      ]);

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }
    
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

  const supabase = await createClient();
  
  // To delete all rows, we need to match all. A trick is to filter by id is not null.
  const { error } = await supabase
    .from('scores')
    .delete()
    .not('id', 'is', 'null');

  if (error) {
    console.error('Error clearing scores from Supabase:', error);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
