import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Chapter, Explanation, CreativeQuestion, McqQuestion, toDoc } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('include') === 'content';
    const board = searchParams.get('board');
    const year = searchParams.get('year');

    const chapter = await Chapter.findById(id).lean();
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    if (includeContent) {
      const currentYear = new Date().getFullYear();

      const matchCq: Record<string, any> = { chapterId: id };
      if (board && board !== 'all') {
        matchCq.board_name = { $regex: new RegExp('^' + board.replace(/-/g, ' ') + '$', 'i') };
      }
      if (year && year !== 'all') {
        const parsedYear = parseInt(year, 10);
        if (!isNaN(parsedYear)) {
          matchCq.exam_year = parsedYear;
        }
      }

      const matchMcq: Record<string, any> = { chapterId: id };
      if (board && board !== 'all') {
        matchMcq.board_name = { $regex: new RegExp('^' + board.replace(/-/g, ' ') + '$', 'i') };
      }
      if (year && year !== 'all') {
        const parsedYear = parseInt(year, 10);
        if (!isNaN(parsedYear)) {
          matchMcq.exam_year = parsedYear;
        }
      }

      const cqPipeline: Record<string, unknown>[] = [
        { $match: matchCq },
        {
          $addFields: {
            sortPriority: {
              $switch: {
                branches: [
                  { case: { $and: [ { $eq: ['$sourceType', 'board'] }, { $eq: ['$exam_year', currentYear] } ] }, then: 1 },
                  { case: { $eq: ['$sourceType', 'board'] }, then: 2 },
                  { case: { $eq: ['$sourceType', 'school'] }, then: 3 },
                  { case: { $eq: ['$sourceType', 'model_test'] }, then: 4 },
                ],
                default: 5,
              },
            },
          },
        },
        { $sort: { sortPriority: 1, exam_year: -1, order: 1, label: 1 } },
        { $project: { sortPriority: 0 } },
      ];
      const mcqPipeline: Record<string, unknown>[] = [
        { $match: matchMcq },
        {
          $addFields: {
            sortPriority: {
              $switch: {
                branches: [
                  { case: { $and: [ { $eq: ['$sourceType', 'board'] }, { $eq: ['$exam_year', currentYear] } ] }, then: 1 },
                  { case: { $eq: ['$sourceType', 'board'] }, then: 2 },
                  { case: { $eq: ['$sourceType', 'school'] }, then: 3 },
                  { case: { $eq: ['$sourceType', 'model_test'] }, then: 4 },
                ],
                default: 5,
              },
            },
          },
        },
        { $sort: { sortPriority: 1, exam_year: -1, order: 1 } },
        { $project: { sortPriority: 0 } },
      ];

      const [explanations, cqs, mcqs, totalCqCount, totalMcqCount] = await Promise.all([
        Explanation.find({ chapterId: id }).sort({ order: 1 }).lean(),
        CreativeQuestion.aggregate(cqPipeline as any),
        McqQuestion.aggregate(mcqPipeline as any),
        CreativeQuestion.countDocuments({ chapterId: id }),
        McqQuestion.countDocuments({ chapterId: id })
      ]);
      return NextResponse.json(toDoc({ 
        ...chapter, 
        explanations, 
        creativeQuestions: cqs, 
        mcqQuestions: mcqs,
        totalCqCount,
        totalMcqCount
      }));
    }

    return NextResponse.json(toDoc(chapter));
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { id: _, createdAt, updatedAt, ...updateData } = body;

    const updatedChapter = await Chapter.findByIdAndUpdate(id, {
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.slug !== undefined && { slug: updateData.slug }),
      ...(updateData.subjectId !== undefined && { subjectId: updateData.subjectId }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.sidebarContent !== undefined && { sidebarContent: updateData.sidebarContent }),
      ...(updateData.icon !== undefined && { icon: updateData.icon }),
      ...(updateData.color !== undefined && { color: updateData.color }),
      ...(updateData.imageUrl !== undefined && { imageUrl: updateData.imageUrl }),
      ...(updateData.imageVisible !== undefined && { imageVisible: updateData.imageVisible }),
      ...(updateData.order !== undefined && { order: updateData.order }),
      ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
      ...(updateData.mainBookPdfUrl !== undefined && { mainBookPdfUrl: updateData.mainBookPdfUrl }),
      ...(updateData.mcqPdfUrl !== undefined && { mcqPdfUrl: updateData.mcqPdfUrl }),
      ...(updateData.cqPdfUrl !== undefined && { cqPdfUrl: updateData.cqPdfUrl }),
    }, { new: true }).lean();

    return NextResponse.json(toDoc(updatedChapter));
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    await Chapter.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}
