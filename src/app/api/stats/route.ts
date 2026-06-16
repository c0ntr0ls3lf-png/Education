import { NextResponse } from 'next/server';
import { connectDB, Class, Subject, Chapter, Explanation, CreativeQuestion, McqQuestion, User, Exam, ExamAttempt, Testimonial, FAQ } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const [
      totalClasses,
      totalSubjects,
      totalChapters,
      totalExplanations,
      totalCreativeQuestions,
      totalMcqQuestions,
      totalUsers,
      totalExams,
      totalExamAttempts,
      totalTestimonials,
      totalFaqs,
    ] = await Promise.all([
      Class.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      Chapter.countDocuments({ isActive: true }),
      Explanation.countDocuments({ isActive: true }),
      CreativeQuestion.countDocuments({ isActive: true }),
      McqQuestion.countDocuments({ isActive: true }),
      User.countDocuments(),
      Exam.countDocuments({ isActive: true }),
      ExamAttempt.countDocuments(),
      Testimonial.countDocuments({ isActive: true }),
      FAQ.countDocuments({ isActive: true }),
    ]);

    const totalQuestions = totalExplanations + totalCreativeQuestions + totalMcqQuestions;

    return NextResponse.json({
      totalClasses,
      totalSubjects,
      totalChapters,
      totalExplanations,
      totalCreativeQuestions,
      totalMcqQuestions,
      totalQuestions,
      totalUsers,
      totalExams,
      totalExamAttempts,
      totalTestimonials,
      totalFaqs,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
