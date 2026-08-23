import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Use a global variable to prevent creating multiple PrismaClient instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.identity || !body.mos) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Insert evaluator
    const evaluator = await prisma.evaluator.create({
      data: {
        name: body.identity.name,
        age: body.identity.age,
        gender: body.identity.gender,
        javaneseFluency: body.identity.javaneseFluency,
        region: body.identity.region,
        finalComment: body.identity.finalComment
      }
    });

    // We need to ensure AudioSample exists, but for simplicity in this evaluation we can upsert it or just create it if it doesn't exist
    // Alternatively, since samples are read from disk dynamically, we can just upsert the sample based on ID.
    const sampleIds = new Set([
      ...body.mos.map((m: any) => m.sampleId)
    ]);

    for (const sId of Array.from(sampleIds)) {
      // In a real app we'd get the actual targetText from the backend, but since we just have ID, we'll store ID in both
      await prisma.audioSample.upsert({
        where: { id: sId as string },
        update: {},
        create: {
          id: sId as string,
          targetText: 'Transcript loaded dynamically',
          audioGt: '',
          audioLpep: '',
          audioFt: '',
          audioMms: '',
          audioOmnivoice: '',
          audioId: ''
        }
      });
    }

    // Insert MOS responses
    if (body.mos.length > 0) {
      await prisma.mosResponse.createMany({
        data: body.mos.map((m: any) => ({
          evaluatorId: evaluator.id,
          sampleId: m.sampleId,
          modelType: m.modelType,
          mos_n_score: m.mos_n_score,
          mos_pa_score: m.mos_pa_score,
          comment: m.comment
        }))
      });
    }


    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing score submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  
  // Simple auth check
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const evaluators = await prisma.evaluator.findMany({
      include: {
        mosResponses: {
          include: { sample: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const scores = evaluators.map(ev => ({
      timestamp: ev.createdAt,
      identity: {
        name: ev.name,
        age: ev.age,
        gender: ev.gender,
        javaneseFluency: ev.javaneseFluency,
        region: ev.region,
        finalComment: ev.finalComment
      },
      mosResults: ev.mosResponses.map(r => ({
        sampleId: r.sampleId,
        modelType: r.modelType,
        mos_pa: r.mos_pa_score,
        mos_n: r.mos_n_score,
        comment: r.comment
      }))
    }));

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.mosResponse.deleteMany({});
    await prisma.evaluator.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
