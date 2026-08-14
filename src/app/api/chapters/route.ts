import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Chapter, Subject, Class, Explanation, CreativeQuestion, McqQuestion, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const includeContent = searchParams.get('include') === 'content';

    const match: Record<string, unknown> = {};
    if (subjectId) match.subjectId = subjectId;

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjectId',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'subject.classId',
          foreignField: '_id',
          as: 'subject.class',
        },
      },
      { $unwind: { path: '$subject.class', preserveNullAndEmptyArrays: true } },
      { $sort: { order: 1, name: 1 } },
    ];

    if (includeContent) {
      pipeline.splice(5, 0,
        {
          $lookup: {
            from: 'explanations',
            localField: '_id',
            foreignField: 'chapterId',
            as: 'explanations',
          },
        },
        {
          $lookup: {
            from: 'creativequestions',
            localField: '_id',
            foreignField: 'chapterId',
            as: 'creativeQuestions',
          },
        },
        {
          $lookup: {
            from: 'mcqquestions',
            localField: '_id',
            foreignField: 'chapterId',
            as: 'mcqQuestions',
          },
        },
        {
          $addFields: {
            explanations: { $sortArray: { input: '$explanations', sortBy: { order: 1 } } },
            creativeQuestions: { $sortArray: { input: '$creativeQuestions', sortBy: { order: 1 } } },
            mcqQuestions: { $sortArray: { input: '$mcqQuestions', sortBy: { order: 1 } } },
          },
        }
      );
    }

    const chapters = await Chapter.aggregate(pipeline);
    return NextResponse.json(toDoc(chapters));
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, slug, subjectId, description, icon, color, order, isActive, imageUrl, imageVisible, mainBookPdfUrl, mcqPdfUrl, cqPdfUrl } = body;

    if (!name || !slug || !subjectId) {
      return NextResponse.json({ error: 'name, slug, and subjectId are required' }, { status: 400 });
    }

    const newChapter = await Chapter.create({
      name, slug, subjectId, description, sidebarContent: body.sidebarContent, icon, color,
      imageUrl: imageUrl ?? null,
      imageVisible: imageVisible !== false,
      order: order ?? 0,
      isActive: isActive ?? true,
      mainBookPdfUrl: mainBookPdfUrl ?? null,
      mcqPdfUrl: mcqPdfUrl ?? null,
      cqPdfUrl: cqPdfUrl ?? null,
    });

    return NextResponse.json(toDoc(newChapter.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}
