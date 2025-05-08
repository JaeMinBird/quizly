export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

export function parseQuestionsFile(fileContent: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const lines = fileContent.split("\n");
  
  let currentQuestion: Partial<QuizQuestion> = {};
  let options: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a question line
    if (line.startsWith("Question ")) {
      // If we were processing a previous question, add it to the array
      if (currentQuestion.question && options.length > 0) {
        questions.push({
          id: currentQuestion.id || "",
          question: currentQuestion.question,
          options,
          correctAnswer: currentQuestion.correctAnswer || 0
        });
      }
      
      // Start a new question
      const questionId = line.split(":")[0].replace("Question ", "").trim();
      const questionText = line.includes(":") ? line.split(":")[1].trim() : "";
      
      currentQuestion = {
        id: questionId,
        question: questionText,
      };
      options = [];
    } 
    // Check if this is an option line
    else if (/^\s*\[\d+\]/.test(line)) {
      const optionMatch = line.match(/^\s*\[(\d+)\]\s*(.*)/);
      
      if (optionMatch) {
        const optionNumber = parseInt(optionMatch[1], 10);
        let optionText = optionMatch[2].trim();
        
        // Check if this is the correct answer
        if (optionText.endsWith("→ CORRECT")) {
          optionText = optionText.replace("→ CORRECT", "").trim();
          currentQuestion.correctAnswer = optionNumber - 1; // Zero-indexed
        }
        
        options.push(optionText);
      }
    }
  }
  
  // Add the final question
  if (currentQuestion.question && options.length > 0) {
    questions.push({
      id: currentQuestion.id || "",
      question: currentQuestion.question,
      options,
      correctAnswer: currentQuestion.correctAnswer || 0
    });
  }
  
  return questions;
}