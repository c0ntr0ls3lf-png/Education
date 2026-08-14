import { NextRequest, NextResponse } from 'next/server';
import { connectDB, PendingChange, ActivityLog, User, toDoc } from '@/lib/db';
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
    const status = searchParams.get('status'); // 'pending' | 'approved' | 'rejected'
    const entityType = searchParams.get('entityType');

    const filter: Record<string, any> = {};

    if (authUser.role === 'admin') {
      if (status) filter.status = status;
      if (entityType) filter.entityType = entityType;
    } else if (authUser.role === 'teacher') {
      filter.teacherId = authUser.id;
      if (status) filter.status = status;
      if (entityType) filter.entityType = entityType;
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const changes = await PendingChange.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(toDoc(changes));
  } catch (error) {
    console.error('Error fetching pending changes:', error);
    return NextResponse.json({ error: 'Failed to fetch pending changes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const rawToken = request.cookies.get('eduAuthToken')?.value;
    const authUser = rawToken ? await verifyAuthToken(rawToken) : null;

    if (!authUser || (authUser.role !== 'teacher' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized or Forbidden' }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId, action, data } = body;

    if (!entityType || !action || !data) {
      return NextResponse.json({ error: 'entityType, action, and data are required' }, { status: 400 });
    }

    // Fetch user's name for denormalization
    const dbUser = await User.findById(authUser.id).lean();
    const teacherName = dbUser?.name || authUser.email || 'Teacher';

    const newPendingChange = await PendingChange.create({
      teacherId: authUser.id,
      teacherName,
      entityType,
      entityId: entityId || null,
      action,
      data,
      status: 'pending',
      isLocked: false,
    });

    // Create activity log
    await ActivityLog.create({
      userId: authUser.id,
      userName: teacherName,
      userRole: authUser.role,
      action: `${action === 'create' ? 'Submitted new' : 'Submitted edit for'} ${entityType}`,
      entityType,
      entityId: entityId || newPendingChange._id.toString(),
      status: 'pending',
    });

    return NextResponse.json(toDoc(newPendingChange.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating pending change:', error);
    return NextResponse.json({ error: 'Failed to submit pending change' }, { status: 500 });
  }
}
