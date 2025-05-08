const fs = require('fs');
const path = require('path');

// Path to the answers_compiled.txt file (adjust if needed)
const answersFilePath = path.join(__dirname, '../../../answers_compiled.txt');
const outputPath = path.join(__dirname, '../data/quizData.json');

// Function to parse the questions from the file content
function parseQuestionsFile(fileContent) {
  const questions = [];
  const lines = fileContent.split('\n');
  
  let currentQuestion = {};
  let options = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('Question ')) {
      // Start a new question
      if (currentQuestion.question && options.length > 0) {
        questions.push({
          ...currentQuestion,
          options,
        });
      }
      
      // Extract question id and text
      const match = line.match(/Question (\d+): (.*)/);
      if (match) {
        const questionId = match[1];
        const questionText = match[2];
        
        currentQuestion = {
          id: questionId,
          question: questionText,
          correctAnswer: null
        };
        options = [];
      }
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
      ...currentQuestion,
      options,
    });
  }
  
  return questions;
}

try {
  // Read the answers_compiled.txt file
  const fileContent = fs.readFileSync(answersFilePath, 'utf8');
  
  // Parse the questions
  const questions = parseQuestionsFile(fileContent);
  
  // Filter out questions without a correctAnswer
  const validQuestions = questions.filter(q => q.correctAnswer !== null);
  
  // Group questions by level based on their ID
  const levelPattern = /Question (\d+):/;
  const groupedQuestions = {};
  
  validQuestions.forEach(question => {
    // Try to determine the level from question text or context
    // This is simplistic and might need adjustment based on your actual data structure
    const questionId = parseInt(question.id, 10);
    const level = Math.ceil(questionId / 30); // Rough estimate, adjust as needed
    
    if (!groupedQuestions[level]) {
      groupedQuestions[level] = [];
    }
    groupedQuestions[level].push(question);
  });
  
  // Write the questions to the output file
  fs.writeFileSync(
    outputPath, 
    JSON.stringify({ questions: validQuestions, levels: groupedQuestions }, null, 2)
  );
  
  console.log(`Successfully processed ${validQuestions.length} questions and saved to ${outputPath}`);
} catch (error) {
  console.error('Error processing quiz data:', error);
}