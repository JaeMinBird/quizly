import { QuizQuestion } from '../utils/parseQuestions';
// Import the static data
import quizDataJson from './quizData.json';

// Helper function to load quiz data - this will now use the static JSON
export async function loadQuizData(): Promise<QuizQuestion[]> {
  try {
    // Return the questions from the static JSON
    return quizDataJson.questions as QuizQuestion[];
  } catch (error) {
    console.error('Error loading quiz data:', error);
    return [];
  }
}

// Also export functions to get questions by level
export async function getQuestionsByLevel(level: number): Promise<QuizQuestion[]> {
  try {
    // Return the questions for the specified level from the static JSON
    // Convert the number to a string to safely access the levels object
    const levelQuestions = quizDataJson.levels[String(level)];
    return levelQuestions || [];
  } catch (error) {
    console.error(`Error loading quiz data for level ${level}:`, error);
    return [];
  }
}

// Get available levels
export async function getAvailableLevels(): Promise<number[]> {
  try {
    const levels = Object.keys(quizDataJson.levels)
      .map(level => parseInt(level, 10))
      .sort((a, b) => a - b);
    return levels;
  } catch (error) {
    console.error('Error getting available levels:', error);
    return [];
  }
}

// Export all levels
export async function getAllLevels(): Promise<Record<string, QuizQuestion[]>> {
  return quizDataJson.levels as Record<string, QuizQuestion[]>;
}