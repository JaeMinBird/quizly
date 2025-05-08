import { QuizQuestion } from '@/utils/parseQuestions';

declare module '*.json' {
  const quizData: {
    questions: QuizQuestion[];
    levels: Record<string, QuizQuestion[]>;
  };
  export default quizData;
}