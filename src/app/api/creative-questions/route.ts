import { NextRequest, NextResponse } from 'next/server';
import { connectDB, CreativeQuestion, toDoc } from '@/lib/db';
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
      { $sort: { label: 1 } },
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
      solutionK, solutionKh, solutionG, solutionGh,
      marksK, marksKh, marksG, marksGh, videoUrl, tips,
    } = body;

    if (!chapterId || !question) {
      return NextResponse.json({ error: 'chapterId and question are required' }, { status: 400 });
    }

    // Auto-generate label if empty or not provided
    let finalLabel = label ? String(label).trim() : '';
    if (!finalLabel) {
      const count = await CreativeQuestion.countDocuments({ chapterId });
      finalLabel = String.fromCharCode(65 + (count % 26)); // e.g. A, B, C...
    }

    // Normalize segment fields to subQuestions
    let finalSubA = subQuestionA || null;
    let finalSubB = subQuestionB || null;
    let finalSubC = subQuestionC || null;
    let finalSubQuestions = subQuestions || null;

    const hasSegments = segmentK || segmentKh || segmentG || segmentGh;
    if (hasSegments) {
      const arr: { label: string; text: string }[] = [];
      if (segmentK) {
        const fullText = solutionK ? `${segmentK} <hr> <strong>উত্তর:</strong> ${solutionK}` : segmentK;
        arr.push({ label: 'ক', text: fullText });
      }
      if (segmentKh) {
        const fullText = solutionKh ? `${segmentKh} <hr> <strong>উত্তর:</strong> ${solutionKh}` : segmentKh;
        arr.push({ label: 'খ', text: fullText });
      }
      if (segmentG) {
        const fullText = solutionG ? `${segmentG} <hr> <strong>উত্তর:</strong> ${solutionG}` : segmentG;
        arr.push({ label: 'গ', text: fullText });
      }
      if (segmentGh) {
        const fullText = solutionGh ? `${segmentGh} <hr> <strong>উত্তর:</strong> ${solutionGh}` : segmentGh;
        arr.push({ label: 'ঘ', text: fullText });
      }
      finalSubQuestions = JSON.stringify(arr);
      finalSubA = segmentK || null;
      finalSubB = segmentKh || null;
      finalSubC = segmentG || null;
    } else if (subQuestions && typeof subQuestions === 'string') {
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

    // Normalize metadata
    const metadata = normalizeQuestionMetadata({ board, boardName, board_name, year, questionYear, exam_year, sourceType });

    const newCQ = await CreativeQuestion.create({
      chapterId,
      label: finalLabel,
      question,
      answer,
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
      ...metadata,
      segmentK: segmentK || null,
      segmentKh: segmentKh || null,
      segmentG: segmentG || null,
      segmentGh: segmentGh || null,
      solutionK: solutionK || null,
      solutionKh: solutionKh || null,
      solutionG: solutionG || null,
      solutionGh: solutionGh || null,
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
