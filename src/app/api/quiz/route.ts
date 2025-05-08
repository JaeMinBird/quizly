import { NextResponse } from 'next/server';
import { loadQuizData, getQuestionsByLevel, getAllLevels } from '@/data/quizData';

export async function GET(request: Request) {
  try {
    // Get the URL to check for query parameters
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    
    let questions;
    
    // Check if a specific level was requested
    if (level) {
      questions = await getQuestionsByLevel(parseInt(level, 10));
    } else {
      // No level specified, return all questions
      questions = await loadQuizData();
    }
    
    // Return the questions
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error loading quiz data:', error);
    return NextResponse.json({ error: 'Failed to load quiz data' }, { status: 500 });
  }
}