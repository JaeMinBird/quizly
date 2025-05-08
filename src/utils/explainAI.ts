import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

/**
 * Generates an explanation for a correct answer
 * 
 * @param question - The quiz question
 * @param correctAnswer - The correct answer
 * @returns A single sentence explanation of why the answer is correct
 */
export async function generateExplanation(question: string, correctAnswer: string): Promise<string> {
  try {
    const prompt = `You are a helpful assistant for a quiz application. 
    For the following question and its correct answer, provide a SINGLE SENTENCE explanation of why this answer is correct.
    Keep it concise, informative, and suitable for educational purposes.
    
    Question: ${question}
    Correct Answer: ${correctAnswer}
    
    Your explanation (in a single sentence):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let explanation = response.text().trim();
    
    // Ensure the explanation is a single sentence
    if (explanation.includes('.')) {
      explanation = explanation.split('.')[0] + '.';
    }
    
    return explanation || 'No explanation available.';
  } catch (error) {
    console.error('Error generating explanation:', error);
    return 'Unable to generate explanation at this time.';
  }
}