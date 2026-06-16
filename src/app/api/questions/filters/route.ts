import { NextRequest, NextResponse } from 'next/server';
import { connectDB, McqQuestion, CreativeQuestion } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get distinct board names and exam years from both collections
    const [mcqBoards, creativeBoards, mcqYears, creativeYears] = await Promise.all([
      McqQuestion.distinct('board_name'),
      CreativeQuestion.distinct('board_name'),
      McqQuestion.distinct('exam_year'),
      CreativeQuestion.distinct('exam_year')
    ]);

    // Merge, filter, and sort boards (ASC)
    const boardsSet = new Set<string>();
    [...mcqBoards, ...creativeBoards].forEach(b => {
      if (b && typeof b === 'string' && b.trim().length > 0) {
        boardsSet.add(b.trim());
      }
    });
    const boards = Array.from(boardsSet).sort((a, b) => a.localeCompare(b));

    // Merge, filter, and sort years (DESC)
    const yearsSet = new Set<number>();
    [...mcqYears, ...creativeYears].forEach(y => {
      if (y != null) {
        const parsed = parseInt(String(y), 10);
        if (!isNaN(parsed)) {
          yearsSet.add(parsed);
        }
      }
    });
    const years = Array.from(yearsSet)
      .sort((a, b) => b - a)
      .map(y => String(y));

    return NextResponse.json({ boards, years });
  } catch (error) {
    console.error('Error fetching question filters:', error);
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}
