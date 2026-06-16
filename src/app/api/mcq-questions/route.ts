import { NextRequest, NextResponse } from 'next/server';
import { connectDB, McqQuestion, toDoc } from '@/lib/db';

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
      { $sort: { sortPriority: 1, exam_year: -1, order: 1, createdAt: 1 } },
      { $project: { sortPriority: 0 } },
    ];
    const mcqQuestions = await McqQuestion.aggregate(pipeline as any);
    return NextResponse.json(toDoc(mcqQuestions));
  } catch (error) {
    console.error('Error fetching MCQ questions:', error);
    return NextResponse.json({ error: 'Failed to fetch MCQ questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      chapterId, question, optionA, optionB, optionC, optionD, options, correctAnswer,
      explanation, videoUrl, marks, difficulty, tags, order, isActive,
      // Metadata fields
      mcqType, year, board, schoolName, boardName, questionYear, board_name, exam_year, sourceType,
      stem, subMcqs, statements, correctCombination, tips,
    } = body;

    if (!chapterId || !question || !correctAnswer) {
      return NextResponse.json({ error: 'chapterId, question, and correctAnswer are required' }, { status: 400 });
    }

    let finalOptionA = optionA || '';
    let finalOptionB = optionB || '';
    let finalOptionC = optionC || null;
    let finalOptionD = optionD || null;
    let finalOptions = options || null;

    if (options && typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          finalOptionA = parsed[0]?.text || '';
          finalOptionB = parsed[1]?.text || '';
          finalOptionC = parsed[2]?.text || null;
          finalOptionD = parsed[3]?.text || null;
        }
      } catch { /* ignore */ }
    } else if (Array.isArray(options)) {
      finalOptions = JSON.stringify(options);
      finalOptionA = options[0]?.text || '';
      finalOptionB = options[1]?.text || '';
      finalOptionC = options[2]?.text || null;
      finalOptionD = options[3]?.text || null;
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

    const newMcq = await McqQuestion.create({
      chapterId, question,
      optionA: finalOptionA,
      optionB: finalOptionB,
      optionC: finalOptionC,
      optionD: finalOptionD,
      options: finalOptions,
      correctAnswer, explanation, videoUrl,
      marks: marks ?? 1,
      difficulty: difficulty ?? 'medium',
      tags,
      order: order ?? 0,
      isActive: isActive ?? true,
      // Metadata fields
      mcqType: mcqType ?? 'single',
      year: year || null,
      board: board || null,
      schoolName: schoolName || null,
      board_name: finalBoardName,
      exam_year: finalExamYear,
      sourceType: sourceType || 'custom',
      stem: stem || null,
      subMcqs: subMcqs || null,
      statements: statements || null,
      correctCombination: correctCombination || null,
    } as any);

    return NextResponse.json(toDoc(newMcq.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating MCQ question:', error);
    return NextResponse.json({ error: 'Failed to create MCQ question' }, { status: 500 });
  }
}
