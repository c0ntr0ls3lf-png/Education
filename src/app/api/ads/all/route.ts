import { NextRequest, NextResponse } from 'next/server';
import { connectDB, AdZone, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    const where: Record<string, unknown> = {};
    if (location) where.location = location;

    const adZones = await AdZone.find(where).sort({ createdAt: -1 }).lean();
    return NextResponse.json(toDoc(adZones));
  } catch (error) {
    console.error('Error fetching ad zones:', error);
    return NextResponse.json({ error: 'Failed to fetch ad zones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, location, type, code, imageUrl, linkUrl, provider, isActive } = body;

    if (!name || !slug || !location || !type) {
      return NextResponse.json({ error: 'name, slug, location, and type are required' }, { status: 400 });
    }

    const newAd = await AdZone.create({
      name, slug, location, type, code, imageUrl, linkUrl, provider,
      isActive: isActive ?? true,
    });

    return NextResponse.json(toDoc(newAd.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating ad zone:', error);
    return NextResponse.json({ error: 'Failed to create ad zone' }, { status: 500 });
  }
}
