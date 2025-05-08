import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key from environment variables
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

// Initialize the Gemini Pro model if API key exists
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
} else {
  console.error('Error: Google Gemini API key is not defined in the environment variables');
}

/**
 * Generate an explanation for why an answer is correct
 * 
 * @param question The quiz question
 * @param correctAnswer The correct answer to explain
 * @returns A brief explanation of why the answer is correct
 */
export async function generateExplanation(question: string, correctAnswer: string): Promise<string> {
  try {
    // Check if model is available (API key is set)
    if (!model) {
      return 'API key not configured. Please add your Gemini API key to the .env.local file.';
    }
    
    // Create a prompt that asks for a brief explanation
    const prompt = `
      Question: ${question}
      Correct answer: ${correctAnswer}
      
      Please provide a concise, one-sentence explanation of why this answer is correct.
      Keep your explanation under 200 characters if possible.
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Return the generated explanation
    return text.trim();
  } catch (error) {
    console.error('Error generating explanation:', error);
    return 'Unable to generate an explanation at this time.';
  }
}