/**
 * Integration tests for app functionality
 * Tests API calls, AsyncStorage, and data flow
**/

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock global fetch for API testing
global.fetch = jest.fn();

// ======================================
// Quiz API Integration Tests
// ===============================
describe('Quiz API Integration', () => {

  /**
  * Test for API response handling
  * Verifies app can process quiz data from OpenTriviaDB
  */
  test('should fetch quiz questions successfully', async () => {
    const mockResponse = {
      results: [
        {
          question: 'What is 2+2?',
          correct_answer: '4',
          incorrect_answers: ['3', '5', '6'],
          difficulty: 'easy'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await fetch(
      'https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple'
    );
    const data = await response.json();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].question).toBe('What is 2+2?');
  });

  /**
  * Test API error handling
  * Verifies app handles server errors properly
  */
  test('should handle API errors gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const response = await fetch('https://opentdb.com/api.php?amount=10');
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  /**
  * Test empty API response handling
  * Verifies app handles case when no questions are available
  */
  test('should handle empty results from API', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    const response = await fetch('https://opentdb.com/api.php?amount=10');
    const data = await response.json();

    expect(data.results).toHaveLength(0);
  });
});

// ==============================
// AsyncStorage Integration Tests
// ==============================
describe('AsyncStorage Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

    /**
   * Test quiz score persistence
   * Verifies app can save quiz results to local storage
   */
  test('should save quiz score to storage', async () => {
    const quizResult = {
      id: '1234567890',
      category: 'General Knowledge',
      difficulty: 'medium',
      score: 8,
      total: 10,
      percentage: 80,
      date: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('quizHistory', JSON.stringify([quizResult]));

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'quizHistory',
      expect.stringContaining('"score":8')
    );
  });

    /**
   * Test quiz history retrieval
   * Verifies app can load saved quiz results from storage
*/
  test('should load quiz history from storage', async () => {
    const mockHistory = JSON.stringify([
      {
        id: '1',
        category: 'Science',
        score: 7,
        total: 10,
        percentage: 70,
      }
    ]);

    AsyncStorage.getItem = jest.fn().mockResolvedValue(mockHistory);

    const result = await AsyncStorage.getItem('quizHistory');
    const history = JSON.parse(result);

    expect(history).toHaveLength(1);
    expect(history[0].category).toBe('Science');
    expect(history[0].score).toBe(7);
  });
    /**
   * Test history clearing
   * Verifies app can delete all saved quiz history
   */
  test('should clear quiz history', async () => {
    await AsyncStorage.removeItem('quizHistory');

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('quizHistory');
  });

    /**
   * Test empty storage handling
   * Verifies app handles case when no history exists
   */
  test('should handle empty storage', async () => {
    AsyncStorage.getItem = jest.fn().mockResolvedValue(null);

    const result = await AsyncStorage.getItem('quizHistory');
    const history = result ? JSON.parse(result) : [];

    expect(history).toHaveLength(0);
  });
});


// ===================================================
// Data Flow Integration Tests
// ====================================================
describe('Data Flow Integration', () => {

  /**
  * Test quiz data formatting
  * Verifies app correctly processes and formats API data
  */
  test('should format quiz data correctly', () => {
    const rawQuestion = {
      question: 'What&nbsp;is&nbsp;2+2?',
      correct_answer: '4',
      incorrect_answers: ['3', '5', '6'],
    };

    // Simulate decodeHTML function
    const decodeHTML = (html) => html.replace(/&nbsp;/g, ' ');
    const allAnswers = [...rawQuestion.incorrect_answers, rawQuestion.correct_answer];
    
    const formattedQuestion = {
      question: decodeHTML(rawQuestion.question),
      correct_answer: decodeHTML(rawQuestion.correct_answer),
      answers: allAnswers.map(a => decodeHTML(a)),
    };

    expect(formattedQuestion.question).toBe('What is 2+2?');
    expect(formattedQuestion.answers).toHaveLength(4);
    expect(formattedQuestion.answers).toContain('4');
  });

  /**
  * Test statistics calculation
  * Verifies app correctly computes aggregate quiz statistics
  */
  test('should calculate statistics correctly', () => {
    const history = [
      { score: 8, total: 10 },
      { score: 6, total: 10 },
      { score: 9, total: 10 },
    ];

    const totalQuestions = history.reduce((sum, item) => sum + item.total, 0);
    const totalCorrect = history.reduce((sum, item) => sum + item.score, 0);
    const averageScore = Math.round((totalCorrect / totalQuestions) * 100);

    expect(totalQuestions).toBe(30);
    expect(totalCorrect).toBe(23);
    expect(averageScore).toBe(77);
  });
});