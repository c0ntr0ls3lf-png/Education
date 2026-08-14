import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Subject, Class, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const includeChapters = searchParams.get('include') === 'chapters';

    const match: Record<string, unknown> = {};
    if (classId) match.classId = classId;

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
      { $sort: { order: 1, name: 1 } },
    ];

    if (includeChapters) {
      pipeline.splice(3, 0,
        {
          $lookup: {
            from: 'chapters',
            localField: '_id',
            foreignField: 'subjectId',
            as: 'chapters',
          },
        },
        {
          $addFields: {
            chapters: { $sortArray: { input: '$chapters', sortBy: { order: 1, name: 1 } } },
          },
        }
      );
    }

    const subjects = await Subject.aggregate(pipeline);
    return NextResponse.json(toDoc(subjects));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, classId, description, icon, color, order, isActive, categoryId, subcategoryId } = body;

    if (!name || !slug || !classId) {
      return NextResponse.json({ error: 'name, slug, and classId are required' }, { status: 400 });
    }

    const newSubject = await Subject.create({
      name, slug, classId, description, icon, color,
      order: order ?? 0,
      isActive: isActive ?? true,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
    });

    return NextResponse.json(toDoc(newSubject.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
