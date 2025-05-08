import { NextRequest, NextResponse } from 'next/server';
import { generateExplanation } from '@/utils/geminiAI';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the question and correct answer
    const body = await req.json();
    const { question, correctAnswer } = body;

    // Validate the request data
    if (!question || !correctAnswer) {
      return NextResponse.json(
        { error: 'Question and correct answer are required' },
        { status: 400 }
      );
    }

    // Generate the explanation using Gemini AI
    const explanation = await generateExplanation(question, correctAnswer);

    // Return the explanation
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error in explanation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}