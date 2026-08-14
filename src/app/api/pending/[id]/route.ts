import { NextRequest, NextResponse } from 'next/server';
import {
  connectDB,
  PendingChange,
  ActivityLog,
  Notification,
  User,
  Class,
  Subject,
  Chapter,
  McqQuestion,
  CreativeQuestion,
  Explanation,
  toDoc
} from '@/lib/db';
import { verifyAuthToken } from '@/lib/auth-cookie';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const rawToken = request.cookies.get('eduAuthToken')?.value;
    const authUser = rawToken ? await verifyAuthToken(rawToken) : null;

    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, note } = body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject".' }, { status: 400 });
    }

    const pendingChange = await PendingChange.findById(id);
    if (!pendingChange) {
      return NextResponse.json({ error: 'Pending change not found' }, { status: 404 });
    }

    if (pendingChange.status !== 'pending') {
      return NextResponse.json({ error: 'Change has already been processed' }, { status: 400 });
    }

    // Fetch admin details
    const adminUser = await User.findById(authUser.id).lean();
    const adminName = adminUser?.name || authUser.email || 'Admin';

    if (action === 'approve') {
      let finalEntityId = pendingChange.entityId;

      // Apply the change to the actual collection
      const type = pendingChange.entityType;
      const data = pendingChange.data;

      if (pendingChange.action === 'create') {
        let createdDoc;
        switch (type) {
          case 'class':
            createdDoc = await Class.create(data);
            break;
          case 'subject':
            createdDoc = await Subject.create(data);
            break;
          case 'chapter':
            createdDoc = await Chapter.create(data);
            break;
          case 'mcq':
            createdDoc = await McqQuestion.create(data);
            break;
          case 'cq':
            createdDoc = await CreativeQuestion.create(data);
            break;
          case 'explanation':
            createdDoc = await Explanation.create(data);
            break;
          default:
            return NextResponse.json({ error: `Unsupported entity type for creation: ${type}` }, { status: 400 });
        }
        if (createdDoc) {
          finalEntityId = createdDoc._id.toString();
          pendingChange.entityId = finalEntityId;
        }
      } else if (pendingChange.action === 'update') {
        if (!finalEntityId) {
          return NextResponse.json({ error: 'entityId is required for updates' }, { status: 400 });
        }

        switch (type) {
          case 'class':
            await Class.findByIdAndUpdate(finalEntityId, data, { new: true });
            break;
          case 'subject':
            await Subject.findByIdAndUpdate(finalEntityId, data, { new: true });
            break;
          case 'chapter':
            await Chapter.findByIdAndUpdate(finalEntityId, data, { new: true });
            break;
          case 'mcq':
            await McqQuestion.findByIdAndUpdate(finalEntityId, data, { new: true });
            break;
          case 'cq':
            await CreativeQuestion.findByIdAndUpdate(finalEntityId, data, { new: true });
            break;
          case 'explanation':
            await Explanation.findByIdAndUpdate(finalEntityId, data, { new: true });
            break;
          case 'class_change':
            // Update the user's class and category
            await User.findByIdAndUpdate(pendingChange.teacherId, {
              classId: data.newClassId,
              selectedCategoryId: data.newCategoryId
            });
            break;
          default:
            return NextResponse.json({ error: `Unsupported entity type for updates: ${type}` }, { status: 400 });
        }
      }

      pendingChange.status = 'approved';
      pendingChange.isLocked = true;
      pendingChange.reviewedBy = authUser.id;
      pendingChange.reviewNote = note || 'Approved by Admin';
      await pendingChange.save();

      // Create notification for the teacher/student
      await Notification.create({
        userId: pendingChange.teacherId,
        title: 'Submission Approved',
        message: `Your request to ${pendingChange.action} ${type} has been approved.`,
        type: 'approval',
        link: type === 'class_change' ? '/dashboard' : `/t/${pendingChange.teacherName}` // adjust as needed
      });

      // Create activity log
      await ActivityLog.create({
        userId: authUser.id,
        userName: adminName,
        userRole: 'admin',
        action: `Approved ${pendingChange.action} of ${type}`,
        entityType: type,
        entityId: finalEntityId || pendingChange._id.toString(),
        status: 'approved',
      });

    } else if (action === 'reject') {
      pendingChange.status = 'rejected';
      pendingChange.reviewedBy = authUser.id;
      pendingChange.reviewNote = note || 'Rejected by Admin';
      await pendingChange.save();

      // Create notification for the teacher/student
      await Notification.create({
        userId: pendingChange.teacherId,
        title: 'Submission Rejected',
        message: `Your request to ${pendingChange.action} ${pendingChange.entityType} was rejected. Reason: ${pendingChange.reviewNote}`,
        type: 'rejection',
        link: '#'
      });

      // Create activity log
      await ActivityLog.create({
        userId: authUser.id,
        userName: adminName,
        userRole: 'admin',
        action: `Rejected ${pendingChange.action} of ${pendingChange.entityType}`,
        entityType: pendingChange.entityType,
        entityId: pendingChange.entityId || pendingChange._id.toString(),
        status: 'rejected',
      });
    }

    return NextResponse.json(toDoc(pendingChange.toObject()));
  } catch (error) {
    console.error('Error processing pending change:', error);
    return NextResponse.json({ error: 'Failed to process pending change' }, { status: 500 });
  }
}
