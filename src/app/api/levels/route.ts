import { NextResponse } from 'next/server';
import { getAllLevels } from '@/data/quizData';

export async function GET() {
  try {
    // Get all levels
    const levels = await getAllLevels();
    
    // Return just the level numbers and the count of questions in each level
    const levelInfo = Object.entries(levels).map(([level, questions]) => ({
      level: parseInt(level, 10),
      questionCount: questions.length
    }));
    
    return NextResponse.json({ levels: levelInfo });
  } catch (error) {
    console.error('Error loading level data:', error);
    return NextResponse.json({ error: 'Failed to load level data' }, { status: 500 });
  }
}