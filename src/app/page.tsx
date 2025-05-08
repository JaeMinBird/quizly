"use client";

import { useState, useEffect } from "react";

// Define the QuizQuestion interface since we removed the import
interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  level?: number;
}

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
    } catch (error) {
      setError('Failed to start quiz. Please try again.');
      console.error(error);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (showAnswer) return; // Prevent selection after answer is shown
    setSelectedOption(optionIndex);
    setShowAnswer(true);
    
    if (optionIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
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
    } else if (!unlimitedMode) {
      setQuizFinished(true);
    } else {
      // This should not happen in unlimited mode due to the check above
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  };

  const restartQuiz = () => {
    setQuizStarted(false);
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md w-full">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p>{error}</p>
          <button 
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors" 
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold mb-2">Quizly</h1>
          <p className="text-gray-600 mb-8">Test your knowledge with these questions</p>
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-lg bg-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Quiz Mode</h2>
            <div className="flex space-x-2 mb-4">
              <button
                className={`flex-1 py-2 px-4 rounded-md border ${!unlimitedMode ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                onClick={() => setUnlimitedMode(false)}
              >
                Standard
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md border ${unlimitedMode ? 'bg-blue-500 text-white' : 'border-gray-300'}`}
                onClick={() => setUnlimitedMode(true)}
              >
                Unlimited
              </button>
            </div>
            
            {!unlimitedMode && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Questions per quiz</label>
                <select
                  className="w-full p-2 border rounded-md bg-white"
                  value={questionsPerQuiz}
                  onChange={(e) => setQuestionsPerQuiz(parseInt(e.target.value))}
                >
                  <option value="5">5 questions</option>
                  <option value="10">10 questions</option>
                  <option value="15">15 questions</option>
                  <option value="20">20 questions</option>
                  <option value="25">25 questions</option>
                </select>
              </div>
            )}
            
            {!unlimitedMode && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Difficulty Level</label>
                <select
                  className="w-full p-2 border rounded-md bg-white"
                  value={selectedLevel === null ? "" : selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value === "" ? null : parseInt(e.target.value))}
                >
                  <option value="">All Levels</option>
                  {availableLevels.map((level) => (
                    <option key={level.level} value={level.level}>
                      Level {level.level} ({level.questionCount} questions)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <button onClick={startQuiz} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          
          <div className="w-32 h-32 rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto my-6">
            <div className="text-3xl font-bold text-blue-500">{percentage}%</div>
          </div>
          
          <p className="text-lg mb-2">
            You scored <span className="font-semibold">{score} out of {totalQuestions}</span>
          </p>
          
          <p className="text-gray-600 mb-6">
            {percentage >= 90 ? '🎉 Excellent! You\'re a master!' : 
             percentage >= 70 ? '👍 Great job! Keep it up!' : 
             percentage >= 50 ? '😊 Good effort! Room for improvement.' : 
             '📚 Keep studying, you\'ll get there!'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={restartQuiz}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen p-4 bg-white flex flex-col">
      <div className="container mx-auto max-w-2xl flex-1 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">
            {unlimitedMode ? `Question ${currentQuestionIndex + 1}` : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
          </div>
          <div className="text-sm font-medium text-gray-600">
            Score: {score}
            {!unlimitedMode && ` / ${questions.length}`}
          </div>
        </div>
        
        <div className="h-1 w-full bg-gray-200 rounded-full mb-6">
          <div 
            className="h-1 bg-green-500 rounded-full" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 flex-1">
          <h2 className="text-xl font-medium mb-6">{currentQuestion.question}</h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === index && showAnswer
                    ? index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : selectedOption === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                      selectedOption === index && showAnswer
                        ? index === currentQuestion.correctAnswer
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : selectedOption === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                  <div>{option}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          {showAnswer && (
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors ml-auto"
            >
              {currentQuestionIndex < questions.length - 1 || unlimitedMode ? 'Next Question' : 'See Results'}
            </button>
          )}
          
          {!showAnswer && (
            <button
              onClick={restartQuiz}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              End Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
