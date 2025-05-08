# Quizly - Interactive Quiz Application

An interactive quiz application with level selection, unlimited quiz mode, and AI-powered explanations.

## Features

- **Level Selection**: Choose from multiple quiz levels with varying difficulty
- **Quiz Modes**:
  - **Standard Mode**: Set number of questions per quiz (5, 10, 15, 20, or 30)
  - **Unlimited Mode**: Continuous quizzing without a preset limit
- **Visual Feedback**: Green highlights for correct answers, red for incorrect
- **AI Explanations**: Get a concise explanation for correct answers using Google's Gemini AI

## Setup

### Prerequisites

- Node.js (v16 or later)
- Google Gemini API Key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and add your Gemini API key:
   ```
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   To get a Gemini API key:
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Create a new API key
   - Copy the key to your `.env.local` file

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Quiz Data

The application uses pre-processed quiz data stored in `src/data/quizData.json`. 

If you want to update the quiz data:

1. Place your new quiz data in `answers_compiled.txt`
2. Run: `npm run generate-quiz-data`

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Google Gemini AI API
