"use client";

import { useState, useEffect } from "react";
import { QuizQuestion } from "@/utils/parseQuestions";

interface LevelInfo {
  level: number;
  questionCount: number;
}

export default function Home() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<LevelInfo[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [questionsPerQuiz, setQuestionsPerQuiz] = useState(15);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Fetch quiz data and available levels when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available levels
        const levelsResponse = await fetch('/api/levels');
        if (!levelsResponse.ok) {
          throw new Error('Failed to fetch level data');
        }
        const levelsData = await levelsResponse.json();
        setAvailableLevels(levelsData.levels);

        // Fetch all questions for unlimited mode
        const allQuestionsResponse = await fetch('/api/quiz');
        if (!allQuestionsResponse.ok) {
          throw new Error('Failed to fetch quiz data');
        }
        const allQuestionsData = await allQuestionsResponse.json();
        setAllQuestions(allQuestionsData.questions);
      } catch (error) {
        setError('Failed to load quiz data. Please try again later.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startQuiz = async () => {
    try {
      let quizQuestions: QuizQuestion[];
      
      if (unlimitedMode) {
        // In unlimited mode, use all questions and shuffle them
        quizQuestions = shuffleArray([...allQuestions]);
      } else if (selectedLevel !== null) {
        // Fetch questions for the selected level
        const response = await fetch(`/api/quiz?level=${selectedLevel}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data for selected level');
        }
        const data = await response.json();
        quizQuestions = shuffleArray(data.questions);
        
        // If not unlimited mode, limit to questionsPerQuiz
        quizQuestions = quizQuestions.slice(0, questionsPerQuiz);
      } else {
        // No level selected - take random questions from all questions
        quizQuestions = shuffleArray([...allQuestions]).slice(0, questionsPerQuiz);
      }
      
      setQuestions(quizQuestions);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setShowAnswer(false);
      setScore(0);
      setQuizFinished(false);
      setExplanation(null);
    } catch (error) {
      setError('Failed to start quiz. Please try again.');
      console.error(error);
    }
  };

  // Function to fetch explanation for a correct answer
  const fetchExplanation = async (question: string, correctAnswer: string) => {
    setLoadingExplanation(true);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, correctAnswer }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch explanation');
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setExplanation('Unable to generate explanation at this time.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showAnswer) return; // Prevent selection after answer is shown
    setSelectedOption(optionIndex);
    setShowAnswer(true);
    
    if (optionIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
      // Don't fetch explanation when the answer is correct
      setExplanation(null);
    } else {
      // Fetch explanation only when the answer is incorrect
      const currentQ = questions[currentQuestionIndex];
      fetchExplanation(currentQ.question, currentQ.options[currentQ.correctAnswer]);
    }
  };

  const handleNextQuestion = () => {
    // In unlimited mode, we don't finish until user chooses to stop
    if (unlimitedMode && currentQuestionIndex >= questions.length - 1) {
      // If we're near the end of the available questions, get more questions
      const moreQuestions = shuffleArray([...allQuestions]).slice(0, 15);
      setQuestions([...questions, ...moreQuestions]);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setExplanation(null);
    } else if (!unlimitedMode) {
      setQuizFinished(true);
    } else {
      // This should not happen in unlimited mode due to the check above
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setExplanation(null);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setExplanation(null);
  };

  const getProgressPercentage = () => {
    if (unlimitedMode) {
      // In unlimited mode, just show progress within the current set
      return ((currentQuestionIndex + 1) % 15) / 15 * 100;
    }
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-xl">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="apple-card text-center max-w-md w-full">
          <div className="text-apple-red text-xl mb-4">Error</div>
          <p>{error}</p>
          <button 
            className="apple-button mt-6" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
        <div className="apple-card text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2">Quizly</h1>
          <p className="text-apple-gray mb-8">Test your knowledge with these questions</p>
          
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-apple-blue to-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Quiz Mode</h2>
            <div className="flex space-x-2 mb-4">
              <button
                className={`flex-1 py-2 px-4 rounded-md border ${!unlimitedMode ? 'bg-apple-blue text-white' : 'border-gray-300'}`}
                onClick={() => setUnlimitedMode(false)}
              >
                Standard
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md border ${unlimitedMode ? 'bg-apple-blue text-white' : 'border-gray-300'}`}
                onClick={() => setUnlimitedMode(true)}
              >
                Unlimited
              </button>
            </div>
            
            {!unlimitedMode && (
              <div className="mb-4">
                <label className="block text-sm text-apple-gray mb-1">Questions per quiz</label>
                <select
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                  value={questionsPerQuiz}
                  onChange={(e) => setQuestionsPerQuiz(parseInt(e.target.value, 10))}
                >
                  <option value="5">5 questions</option>
                  <option value="10">10 questions</option>
                  <option value="15">15 questions</option>
                  <option value="20">20 questions</option>
                  <option value="30">30 questions</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm text-apple-gray mb-1">
                {unlimitedMode ? 'Starting Level (Optional)' : 'Select Level (Optional)'}
              </label>
              <select
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                value={selectedLevel === null ? '' : selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value, 10) : null)}
              >
                <option value="">All Levels (Random)</option>
                {availableLevels.map((level) => (
                  <option key={level.level} value={level.level}>
                    Level {level.level} ({level.questionCount} questions)
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={startQuiz} 
            className="apple-button w-full"
            disabled={loading}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const scorePercentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
        <div className="apple-card max-w-md w-full result-card">
          <h1 className="text-2xl font-bold mb-4">Quiz Complete!</h1>
          
          <div className="score-circle">
            {scorePercentage}%
          </div>
          
          <p className="text-xl mb-2">Your Score: {score}/{questions.length}</p>
          <p className="text-apple-gray mb-6">
            {scorePercentage >= 80 
              ? "Excellent! You're a master of this topic!" 
              : scorePercentage >= 60 
                ? "Good job! You have a solid understanding." 
                : "Keep practicing to improve your knowledge."}
          </p>
          
          <button onClick={restartQuiz} className="apple-button w-full">
            New Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Display for unlimited mode
  const unlimitedDisplay = unlimitedMode ? (
    <div className="mb-2">
      <span className="text-apple-gray">Unlimited Mode | Question {currentQuestionIndex + 1}</span>
      <span className="ml-2 px-2 py-0.5 bg-apple-blue text-white text-xs rounded-full">Score: {score}</span>
    </div>
  ) : null;

  // Handle the case where we're waiting for more questions
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-xl">Loading more questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="apple-card flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          {unlimitedDisplay || (
            <p className="text-apple-gray">Question {currentQuestionIndex + 1} of {questions.length}</p>
          )}
          <div className="quiz-progress mt-2">
            <div className="quiz-progress-bar" style={{ width: `${getProgressPercentage()}%` }}></div>
          </div>
        </div>
        
        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-1">
            {currentQuestion?.id && <span className="text-apple-gray font-normal">{currentQuestion.id}: </span>}
            {currentQuestion?.question}
          </h2>
        </div>
        
        {/* Options */}
        <div className="flex-1 mb-6">
          {currentQuestion?.options.map((option, index) => (
            <div
              key={index}
              className={`quiz-option ${selectedOption === index ? 'selected' : ''} 
                ${showAnswer && index === currentQuestion.correctAnswer ? 'correct' : ''} 
                ${showAnswer && selectedOption === index && selectedOption !== currentQuestion.correctAnswer ? 'incorrect' : ''}`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3">
                  {String.fromCharCode(65 + index)}
                </div>
                <div>{option}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Explanation Section */}
        {showAnswer && selectedOption !== null && selectedOption !== currentQuestion.correctAnswer && (
          <div className="mb-6">
            <div className="p-4 bg-apple-red bg-opacity-10 rounded-lg border border-apple-red">
              <h3 className="text-sm font-semibold text-apple-red mb-1">Why is this incorrect?</h3>
              {loadingExplanation ? (
                <div className="flex items-center text-apple-gray">
                  <div className="w-4 h-4 border-2 border-apple-red border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Generating explanation...</span>
                </div>
              ) : (
                <p className="text-sm">{explanation}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex">
          {unlimitedMode && (
            <button 
              className="apple-button-secondary mr-2" 
              onClick={() => setQuizFinished(true)}
            >
              End Quiz
            </button>
          )}
          
          {showAnswer && (
            <button 
              className="apple-button flex-1" 
              onClick={handleNextQuestion}
            >
              {currentQuestionIndex < questions.length - 1 || unlimitedMode ? 'Next Question' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
