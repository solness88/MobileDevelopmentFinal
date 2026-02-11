import React, { createContext, useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles, colors } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

// --- 1. Home Screen (Select category) ---
function HomeScreen({ navigation }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium'); // Default defficulty is medium

  const categories = [
    { id: 9, name: 'General Knowledge', icon: '🎯', color: colors.categories.general },
    { id: 17, name: 'Science & Nature', icon: '🔬', color: colors.categories.science },
    { id: 23, name: 'History', icon: '📚', color: colors.categories.history },
    { id: 21, name: 'Sports', icon: '⚽', color: colors.categories.sports },
    { id: 11, name: 'Film', icon: '🎬', color: colors.categories.film },
    { id: 22, name: 'Geography', icon: '🌍', color: colors.categories.geography }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', emoji: '😊' },
    { value: 'medium', label: 'Medium', emoji: '🤔' },
    { value: 'hard', label: 'Hard', emoji: '🔥' }
  ];

  return (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daily Quiz</Text>
      </View>
      
      {/* 難易度選択 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {difficulties.map(difficulty => (
          <TouchableOpacity
            key={difficulty.value}
            style={[
              styles.difficultyChip,
              selectedDifficulty === difficulty.value && { 
                backgroundColor: '#007AFF', 
                borderColor: '#007AFF' 
              }
            ]}
            onPress={() => setSelectedDifficulty(difficulty.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.difficultyChipText,
              selectedDifficulty === difficulty.value && { color: '#fff' }
            ]}>
              {difficulty.emoji} {difficulty.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.flex1}>
        <Text style={styles.sectionLabel}>Choose a Category</Text>
        
        {categories.map((category) => (
        <TouchableOpacity 
          key={category.id}
          style={styles.categoryCardEnhanced}
          onPress={() => navigation.navigate('Quiz', { 
            categoryId: category.id,
            categoryName: category.name,
            difficulty: selectedDifficulty
          })}
          activeOpacity={0.7}
        >
            <View style={[styles.categoryAccentBar, { backgroundColor: category.color }]} />
            <View style={styles.categoryCardBody}>
              <View style={[
                styles.categoryIconContainer,
                { backgroundColor: category.color + '20' }
              ]}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryMeta}>
                  {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} • 10 questions
                </Text>
              </View>
              <Text style={styles.categoryArrow}>›</Text>
            </View>
        </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// --- 2. Quiz Screen ---
function QuizScreen({ navigation, route }) {
  const { categoryId, categoryName, difficulty } = route.params; // difficultyを追加
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // スコアを保存する関数（難易度も保存）
  const saveScore = async (finalScore, totalQuestions) => {
    try {
      const quizResult = {
        id: Date.now().toString(),
        category: categoryName,
        categoryId: categoryId,
        difficulty: difficulty, // 難易度を追加
        score: finalScore,
        total: totalQuestions,
        percentage: Math.round((finalScore / totalQuestions) * 100),
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      const existingHistory = await AsyncStorage.getItem('quizHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      history.unshift(quizResult);

      if (history.length > 50) {
        history.pop();
      }

      await AsyncStorage.setItem('quizHistory', JSON.stringify(history));
      console.log('Score saved successfully:', quizResult);

    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // APIリクエストに難易度を追加
      const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=multiple`
      );
      const data = await response.json();
      
      console.log(`Fetching ${difficulty} questions for category ${categoryId}`);
      
      if (data.results.length === 0) {
        console.warn('No questions available for this difficulty/category combination');
        // フォールバック: 難易度なしで再取得
        const fallbackResponse = await fetch(
          `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`
        );
        const fallbackData = await fallbackResponse.json();
        data.results = fallbackData.results;
      }
      
      const formattedQuestions = data.results.map(q => {
        const allAnswers = [...q.incorrect_answers, q.correct_answer];
        const shuffled = allAnswers.sort(() => Math.random() - 0.5);
        
        return {
          question: decodeHTML(q.question),
          correct_answer: decodeHTML(q.correct_answer),
          answers: shuffled.map(a => decodeHTML(a)),
          difficulty: q.difficulty
        };
      });
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const decodeHTML = (html) => {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    
    const newScore = answer === questions[currentQuestion].correct_answer ? score + 1 : score;
    
    if (answer === questions[currentQuestion].correct_answer) {
      setScore(newScore);
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        const finalScore = answer === questions[currentQuestion].correct_answer ? newScore : score;
        saveScore(finalScore, questions.length);
        setShowResult(true);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <View style={[styles.flex1, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Loading {difficulty} questions...</Text>
      </View>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : percentage >= 40 ? '😊' : '📚';
    const message = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Great Job!' : percentage >= 40 ? 'Good Effort!' : 'Keep Learning!';
    
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultTitle}>{message}</Text>
        <Text style={styles.resultScore}>{score}/{questions.length}</Text>
        <Text style={styles.resultPercentage}>{percentage}% Correct</Text>
        
        <View style={styles.resultStatsContainer}>
          <View style={styles.resultStatRow}>
            <Text style={styles.resultStatLabel}>Category</Text>
            <Text style={styles.resultStatValue}>{categoryName}</Text>
          </View>
          <View style={styles.resultStatRow}>
            <Text style={styles.resultStatLabel}>Difficulty</Text>
            <Text style={styles.resultStatValue}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
          <View style={[styles.resultStatRow, styles.resultStatRowLast]}>
            <Text style={styles.resultStatLabel}>Questions</Text>
            <Text style={styles.resultStatValue}>{questions.length}</Text>
          </View>
        </View>

        <View style={styles.resultButtonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              setCurrentQuestion(0);
              setScore(0);
              setSelectedAnswer(null);
              setShowResult(false);
              fetchQuestions();
            }}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('MainHome')}
          >
            <Text style={styles.secondaryButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View style={styles.quizContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 15 }}>
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{categoryName}</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.quizQuestionContainer}>
          <Text style={styles.quizQuestionText}>
            {question.question}
          </Text>
          <Text style={styles.quizProgress}>
            Question {currentQuestion + 1} of {questions.length} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • Score: {score}
          </Text>
        </View>

        <View style={styles.quizOptionsContainer}>
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === question.correct_answer;
            const showCorrect = selectedAnswer && isCorrect;
            const showIncorrect = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect && styles.optionButtonCorrect,
                  showIncorrect && styles.optionButtonIncorrect,
                  isSelected && !showCorrect && !showIncorrect && styles.optionButtonSelected
                ]}
                onPress={() => !selectedAnswer && handleAnswer(answer)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText]}>
                  {showCorrect && '✅ '}
                  {showIncorrect && '❌ '}
                  {answer}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// --- 3. History Screen (履歴) ---
function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    averageScore: 0
  });
  const [chartData, setChartData] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);

  const categoryIcons = {
    'General Knowledge': '🎯',
    'Science & Nature': '🔬',
    'History': '📚',
    'Sports': '⚽',
    'Film': '🎬',
    'Geography': '🌍'
  };

  useEffect(() => {
    loadHistory();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });

    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const savedHistory = await AsyncStorage.getItem('quizHistory');
      const historyData = savedHistory ? JSON.parse(savedHistory) : [];
      setHistory(historyData);

      if (historyData.length > 0) {
        const totalQuizzes = historyData.length;
        const totalQuestions = historyData.reduce((sum, item) => sum + item.total, 0);
        const totalCorrect = historyData.reduce((sum, item) => sum + item.score, 0);
        const averageScore = Math.round((totalCorrect / totalQuestions) * 100);

        setStats({
          totalQuizzes,
          totalQuestions,
          totalCorrect,
          averageScore
        });

        // 正答率の推移データ（最新10件）
        const recentQuizzes = historyData.slice(0, 10).reverse();
        const labels = recentQuizzes.map((_, index) => `${index + 1}`);
        const data = recentQuizzes.map(item => item.percentage);

        setChartData({
          labels: labels,
          datasets: [
            {
              data: data,
              color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
              strokeWidth: 2
            }
          ]
        });

        // カテゴリー別統計
        const categoryMap = {};
        historyData.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = { total: 0, correct: 0, count: 0 };
          }
          categoryMap[item.category].total += item.total;
          categoryMap[item.category].correct += item.score;
          categoryMap[item.category].count += 1;
        });

        const categoryStatsArray = Object.keys(categoryMap).map(category => ({
          category: category,
          percentage: Math.round((categoryMap[category].correct / categoryMap[category].total) * 100),
          count: categoryMap[category].count
        }));

        setCategoryStats(categoryStatsArray);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('quizHistory');
      setHistory([]);
      setStats({
        totalQuizzes: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        averageScore: 0
      });
      setChartData(null);
      setCategoryStats([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex1, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Quiz History</Text>
      </View>

      {history.length === 0 ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>📊</Text>
          <Text style={styles.sectionLabel}>No quiz history yet</Text>
          <Text style={styles.meta}>Complete a quiz to see your results here</Text>
        </View>
      ) : (
        <ScrollView style={styles.flex1}>
          {/* 統計サマリー */}
          <View style={{ margin: 15, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
            <Text style={[styles.boldTitle, { marginBottom: 10 }]}>Your Stats</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={styles.meta}>Questions Answered:</Text>
              <Text style={styles.boldTitle}>{stats.totalQuestions}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={styles.meta}>Correct Answers:</Text>
              <Text style={styles.boldTitle}>{stats.totalCorrect}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.meta}>Average Score:</Text>
              <Text style={[styles.boldTitle, { color: stats.averageScore >= 70 ? '#4ECDC4' : '#FF6B6B' }]}>
                {stats.averageScore}%
              </Text>
            </View>
          </View>

          {/* カテゴリー別成績 */}
          {categoryStats.length > 0 && (
            <View style={{ margin: 15 }}>
              <Text style={[styles.boldTitle, { marginBottom: 10 }]}>Performance by Category</Text>
              {categoryStats.map((item, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={styles.meta}>{item.category}</Text>
                    <Text style={styles.boldTitle}>{item.percentage}%</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 }}>
                    <View 
                      style={{ 
                        height: 8, 
                        width: `${item.percentage}%`, 
                        backgroundColor: item.percentage >= 70 ? '#4ECDC4' : item.percentage >= 50 ? '#FFA07A' : '#FF6B6B',
                        borderRadius: 4 
                      }} 
                    />
                  </View>
                  <Text style={[styles.meta, { fontSize: 10, marginTop: 2 }]}>
                    {item.count} quiz{item.count !== 1 ? 'zes' : ''} completed
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionLabel}>Recent Quizzes</Text>

          {/* 履歴リスト */}
          {history.map((item) => (
            <View key={item.id} style={styles.archiveCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tag}>[{item.category}]</Text>
                  <Text style={styles.boldTitle}>
                    Score: {item.score}/{item.total} ({item.percentage}%)
                  </Text>
                  <Text style={styles.meta}>
                    {item.difficulty ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1) : 'Mixed'} • {formatDate(item.date)}
                  </Text>
                </View>
                <Text style={{ fontSize: 30 }}>
                  {categoryIcons[item.category] || '📝'}
                </Text>
              </View>
            </View>
          ))}

          {/* クリアボタン */}
          <TouchableOpacity 
            style={[styles.dangerButton, { margin: 15 }]}
            onPress={clearHistory}
          >
            <Text style={styles.dangerButtonText}>Clear All History</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

// --- 4. Settings Screen ---
function SettingsScreen() {
  return (
    <ScrollView style={styles.settingsBg}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <Text style={styles.sectionLabel}>Settings</Text>
      
      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Preferences</Text>
        </View>
        <View style={styles.settingsRow}>
          <Text>Default Difficulty</Text>
          <Text>Medium →</Text>
        </View>
        <View style={styles.settingsRow}>
          <Text>Questions per Quiz</Text>
          <Text>10 →</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// --- Navigation ---
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [textSize, setTextSize] = useState(18);

  return (
    <SettingsContext.Provider value={{ textSize, setTextSize }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="History">
            {(props) => <HistoryScreen {...props} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SettingsContext.Provider>
  );
}