import { NextRequest, NextResponse } from 'next/server';
import { connectDB, McqQuestion, toDoc } from '@/lib/db';
import { buildQuestionFilters, buildSortPipeline, normalizeQuestionMetadata } from '@/lib/query-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const where = buildQuestionFilters({
      chapterId: searchParams.get('chapterId'),
      difficulty: searchParams.get('difficulty'),
      board: searchParams.get('board'),
      year: searchParams.get('year'),
    });

    const pipeline = [
      { $match: where },
      ...buildSortPipeline(),
      { $sort: { createdAt: 1 } },
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

    // Validation based on mcqType
    if (!chapterId) {
      return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
    }

    const resolvedQuestion = question || (mcqType === 'stem_based' ? stem : null);
    if (!resolvedQuestion) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }
    if (mcqType !== 'multiple_statement' && !correctAnswer) {
      return NextResponse.json({ error: 'correctAnswer is required for single and stem-based questions' }, { status: 400 });
    }
    if (mcqType === 'multiple_statement' && !correctCombination) {
      return NextResponse.json({ error: 'correctCombination is required for multiple statement questions' }, { status: 400 });
    }

    // Normalize options
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

    // Normalize metadata
    const metadata = normalizeQuestionMetadata({ board, boardName, board_name, year, questionYear, exam_year, sourceType });

    const createData = {
      chapterId, question: resolvedQuestion,
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
      ...metadata,
      stem: stem || null,
      subMcqs: subMcqs || null,
      statements: statements || null,
      correctCombination: correctCombination || null,
      tips: tips || null,
    };
    console.log('Creating MCQ with data:', JSON.stringify(createData, null, 2));

    const newMcq = await (McqQuestion as any).create(createData, { strict: false });

    return NextResponse.json(toDoc(newMcq.toObject()), { status: 201 });
  } catch (error) {
    console.error('Error creating MCQ question:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json({ error: errorMessage || 'Failed to create MCQ question' }, { status: 500 });
  }
}
