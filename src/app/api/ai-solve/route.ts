import { NextRequest, NextResponse } from 'next/server';
import { googleScraper } from '@/lib/google-scraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, image_base64, subject, chapter, question_type } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // Build enhanced prompt
    let enhancedPrompt = prompt;
    if (subject) enhancedPrompt = `Subject: ${subject}\n${enhancedPrompt}`;
    if (chapter) enhancedPrompt = `Chapter: ${chapter}\n${enhancedPrompt}`;
    if (question_type) enhancedPrompt = `Question Type: ${question_type}\n${enhancedPrompt}`;

    // Try Python backend first
    let answer: string | null = null;
    let provider: string | null = null;

    try {
      const pythonResponse = await fetch('http://127.0.0.1:8000/api/solve-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_base64,
          subject,
          chapter,
          question_type,
        }),
      });

      if (pythonResponse.ok) {
        const data = await pythonResponse.json();
        if (data.success && data.answer) {
          answer = data.answer;
          provider = data.provider || 'python_backend';
        }
      }
    } catch (error) {
      console.log('Python backend not available, using Google scraper');
    }

    // Fallback to Google scraper if Python backend fails
    if (!answer) {
      console.log('Using Google scraper fallback');
      answer = await googleScraper.getAnswerFromGoogle(enhancedPrompt);
      provider = 'google_scraper';
    }

    if (!answer) {
      return NextResponse.json({ error: 'Failed to get answer from any source' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      answer,
      provider,
    });
  } catch (error) {
    console.error('Error in AI solve:', error);
    return NextResponse.json({ error: 'Failed to solve problem' }, { status: 500 });
  }
}
