import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ActivityLog, toDoc } from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth-cookie';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const rawToken = request.cookies.get('eduAuthToken')?.value;
    const authUser = rawToken ? await verifyAuthToken(rawToken) : null;

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const userId = searchParams.get('userId');

    const filter: Record<string, any> = {};
    if (authUser.role === 'admin') {
      if (userId) filter.userId = userId;
    } else {
      // Non-admins can only view their own activity logs
      filter.userId = authUser.id;
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(toDoc(logs));
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 });
  }
}
