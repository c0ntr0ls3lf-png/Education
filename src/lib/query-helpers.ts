/**
 * Common query helpers for API routes to reduce code duplication
 */

export interface QuestionFilters {
  chapterId?: string | null;
  difficulty?: string | null;
  board?: string | null;
  year?: string | null;
}

export function buildQuestionFilters(filters: QuestionFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  
  if (filters.chapterId) where.chapterId = filters.chapterId;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  
  if (filters.board && filters.board !== 'all') {
    where.board_name = { $regex: new RegExp('^' + filters.board.replace(/-/g, ' ') + '$', 'i') };
  }
  
  if (filters.year && filters.year !== 'all') {
    const parsedYear = parseInt(filters.year, 10);
    if (!isNaN(parsedYear)) {
      where.exam_year = parsedYear;
    }
  }
  
  return where;
}

export function buildSortPipeline() {
  const currentYear = new Date().getFullYear();
  return [
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
}

export interface QuestionMetadata {
  board?: string | null;
  boardName?: string | null;
  board_name?: string | null;
  year?: string | null;
  questionYear?: string | null;
  exam_year?: string | number | null;
  sourceType?: string | null;
}

export function normalizeQuestionMetadata(metadata: QuestionMetadata) {
  const finalBoardName = metadata.board_name || metadata.boardName || metadata.board || null;
  
  let finalExamYear: number | null = null;
  const rawYear = (metadata.exam_year !== undefined && metadata.exam_year !== null && metadata.exam_year !== '') 
    ? metadata.exam_year 
    : ((metadata.questionYear !== undefined && metadata.questionYear !== null && metadata.questionYear !== '') 
      ? metadata.questionYear 
      : null);
  
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
  
  return {
    board_name: finalBoardName,
    exam_year: finalExamYear,
    sourceType: metadata.sourceType || 'custom',
  };
}
