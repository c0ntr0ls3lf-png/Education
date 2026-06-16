import { NextRequest, NextResponse } from 'next/server';
import { connectDB, AdZone, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    const where: Record<string, unknown> = { isActive: true };
    if (location) where.location = location;

    const adZones = await AdZone.find(where).sort({ createdAt: 1 }).lean();
    return NextResponse.json(toDoc(adZones));
  } catch (error) {
    console.error('Error fetching ad zones:', error);
    return NextResponse.json({ error: 'Failed to fetch ad zones' }, { status: 500 });
  }
}
