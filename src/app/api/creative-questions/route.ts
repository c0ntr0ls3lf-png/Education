import { NextRequest, NextResponse } from 'next/server';
import { connectDB, CreativeQuestion, toDoc } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    const difficulty = searchParams.get('difficulty');
    const board = searchParams.get('board');
    const year = searchParams.get('year');

    const where: Record<string, unknown> = {};
    if (chapterId) where.chapterId = chapterId;
    if (difficulty) where.difficulty = difficulty;

    if (board && board !== 'all') {
      where.board_name = { $regex: new RegExp('^' + board.replace(/-/g, ' ') + '$', 'i') };
    }
    if (year && year !== 'all') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        where.exam_year = parsedYear;
      }
    }

    const currentYear = new Date().getFullYear();
    const pipeline: Record<string, unknown>[] = [
      { $match: where },
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
    const creativeQuestions = await CreativeQuestion.aggregate(pipeline as any);
    return NextResponse.json(toDoc(creativeQuestions));
  } catch (error) {
    console.error('Error fetching creative questions:', error);
    return NextResponse.json({ error: 'Failed to fetch creative questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { chapterId, label, question, answer, marks, difficulty, explanation, tags, order, isActive, subQuestionA, subQuestionB, subQuestionC, subQuestions,
      // Metadata fields
      year, board, schoolName,
      boardName, questionYear, board_name, exam_year, sourceType,
      segmentK, segmentKh, segmentG, segmentGh,
      marksK, marksKh, marksG, marksGh, videoUrl, tips,
    } = body;

    if (!chapterId || !label || !question) {
      return NextResponse.json({ error: 'chapterId, label, and question are required' }, { status: 400 });
    }

    let finalSubA = subQuestionA || null;
    let finalSubB = subQuestionB || null;
    let finalSubC = subQuestionC || null;
    let finalSubQuestions = subQuestions || null;

    if (subQuestions && typeof subQuestions === 'string') {
      try {
        const parsed = JSON.parse(subQuestions);
        if (Array.isArray(parsed)) {
          finalSubA = parsed[0]?.text || null;
          finalSubB = parsed[1]?.text || null;
          finalSubC = parsed[2]?.text || null;
        }
      } catch { /* ignore */ }
    } else if (Array.isArray(subQuestions)) {
      finalSubQuestions = JSON.stringify(subQuestions);
      finalSubA = subQuestions[0]?.text || null;
      finalSubB = subQuestions[1]?.text || null;
      finalSubC = subQuestions[2]?.text || null;
    }

    const finalBoardName = board_name || boardName || board || null;
    let finalExamYear: number | null = null;
    const rawYear = (exam_year !== undefined && exam_year !== null && exam_year !== '') ? exam_year : ((questionYear !== undefined && questionYear !== null && questionYear !== '') ? questionYear : null);
    if (rawYear !== null) {
      const parsed = parseInt(String(rawYear), 10);
      if (!isNaN(parsed)) {
        finalExamYear = parsed;
      }
    }
    
    // Auto Current Year Support: If year is empty
    if (!finalExamYear) {
      finalExamYear = new Date().getFullYear();
    }

    const newCQ = await CreativeQuestion.create({
      chapterId, label, question, answer,
      marks: marks ?? 10,
      difficulty: difficulty ?? 'medium',
      explanation,
      subQuestionA: finalSubA,
      subQuestionB: finalSubB,
      subQuestionC: finalSubC,
      subQuestions: finalSubQuestions,
      tags,
      order: order ?? 0,
      isActive: isActive ?? true,
      // Metadata fields
      year: year || null,
      board: board || null,
      schoolName: schoolName || null,
      board_name: finalBoardName,
      exam_year: finalExamYear,
      sourceType: sourceType || 'custom',
      segmentK: segmentK || null,
      segmentKh: segmentKh || null,
      segmentG: segmentG || null,
      segmentGh: segmentGh || null,
      marksK: marksK ?? null,
      marksKh: marksKh ?? null,
      marksG: marksG ?? null,
      marksGh: marksGh ?? null,
      videoUrl: videoUrl || null,
    } as any);

    return NextResponse.json(toDoc(newCQ.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating creative question:', error);
    return NextResponse.json({ error: 'Failed to create creative question' }, { status: 500 });
  }
}
