import React, { createContext, useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

// --- 1. Home Screen (カテゴリー選択) ---
function HomeScreen({ navigation }) {
  const categories = [
    { id: 9, name: 'General Knowledge', icon: '🎯', color: '#FF6B6B' },
    { id: 17, name: 'Science & Nature', icon: '🔬', color: '#4ECDC4' },
    { id: 23, name: 'History', icon: '📚', color: '#45B7D1' },
    { id: 21, name: 'Sports', icon: '⚽', color: '#FFA07A' },
    { id: 11, name: 'Film', icon: '🎬', color: '#98D8C8' },
    { id: 22, name: 'Geography', icon: '🌍', color: '#6C5CE7' }
  ];

  return (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Daily Quiz</Text>
      </View>
      
      {/* 難易度選択（今後実装） */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {['Easy', 'Medium', 'Hard'].map(difficulty => (
          <View key={difficulty} style={styles.catChip}>
            <Text>{difficulty}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView style={styles.flex1}>
        <Text style={styles.sectionLabel}>Choose a Category</Text>
        
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id}
            style={styles.homeCard}
            onPress={() => navigation.navigate('Quiz', { 
              categoryId: category.id,
              categoryName: category.name 
            })}
          >
            <View style={[styles.cardContent, { flexDirection: 'row', alignItems: 'center' }]}>
              <Text style={{ fontSize: 50, marginRight: 15 }}>{category.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.boldTitle}>{category.name}</Text>
                <Text style={styles.meta}>Tap to start 10 questions</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// --- 2. Quiz Screen ---
function QuizScreen({ navigation, route }) {
  const { categoryId, categoryName } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // スコアを保存する関数
  const saveScore = async (finalScore, totalQuestions) => {
    try {
      const quizResult = {
        id: Date.now().toString(), // ユニークID
        category: categoryName,
        categoryId: categoryId,
        score: finalScore,
        total: totalQuestions,
        percentage: Math.round((finalScore / totalQuestions) * 100),
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      // 既存の履歴を取得
      const existingHistory = await AsyncStorage.getItem('quizHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // 新しい結果を追加
      history.unshift(quizResult); // 最新が最初に来るように

      // 最大50件まで保存（古いものを削除）
      if (history.length > 50) {
        history.pop();
      }

      // 保存
      await AsyncStorage.setItem('quizHistory', JSON.stringify(history));
      console.log('Score saved successfully:', quizResult);

    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple`
      );
      const data = await response.json();
      
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
        // 最後の質問なので結果を保存
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
        <Text style={{ marginTop: 10 }}>Loading questions...</Text>
      </View>
    );
  }

  if (showResult) {
    return (
      <View style={styles.flex1}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Quiz Complete!</Text>
        </View>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>
            {score >= 7 ? '🎉' : score >= 5 ? '👍' : '📚'}
          </Text>
          <Text style={[styles.largeHeadline, { textAlign: 'center' }]}>
            Your Score: {score}/{questions.length}
          </Text>
          <Text style={[styles.meta, { textAlign: 'center', marginTop: 10 }]}>
            {score >= 7 ? 'Excellent!' : score >= 5 ? 'Good job!' : 'Keep learning!'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.backBtn, { marginTop: 30, width: 200 }]}
            onPress={() => navigation.goBack()}
          >
            <Text>Back to Categories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveBtn, { marginTop: 15, width: 200 }]}
            onPress={() => {
              setCurrentQuestion(0);
              setScore(0);
              setSelectedAnswer(null);
              setShowResult(false);
              fetchQuestions();
            }}
          >
            <Text>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 15 }}>
          <Text style={{ fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{categoryName}</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 15 }}>
          <Text style={styles.meta}>Question {currentQuestion + 1}/{questions.length}</Text>
          <Text style={styles.meta}>Score: {score}</Text>
        </View>

        <Text style={[styles.largeHeadline, { fontSize: 20 }]}>
          {question.question}
        </Text>

        <View style={{ marginTop: 30 }}>
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === question.correct_answer;
            const showCorrect = selectedAnswer && isCorrect;
            const showIncorrect = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.homeCard,
                  { 
                    marginHorizontal: 15,
                    marginBottom: 15,
                    backgroundColor: showCorrect ? '#4ECDC4' : showIncorrect ? '#FF6B6B' : '#fff'
                  }
                ]}
                onPress={() => !selectedAnswer && handleAnswer(answer)}
                disabled={selectedAnswer !== null}
              >
                <View style={styles.cardContent}>
                  <Text style={[styles.boldTitle, { color: (showCorrect || showIncorrect) ? '#fff' : '#000' }]}>
                    {answer}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// --- 3. History Screen (履歴) ---
function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadHistory();
    
    // 画面がフォーカスされたときに履歴を再読み込み
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });

    return unsubscribe;
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const savedHistory = await AsyncStorage.getItem('quizHistory');
      const historyData = savedHistory ? JSON.parse(savedHistory) : [];
      setHistory(historyData);

      // 統計を計算
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
              <Text style={styles.meta}>Total Quizzes:</Text>
              <Text style={styles.boldTitle}>{stats.totalQuizzes}</Text>
            </View>
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
                  <Text style={styles.meta}>{formatDate(item.date)}</Text>
                </View>
                <Text style={{ fontSize: 30 }}>
                  {item.percentage >= 70 ? '🎉' : item.percentage >= 50 ? '👍' : '📚'}
                </Text>
              </View>
            </View>
          ))}

          {/* クリアボタン */}
          <TouchableOpacity 
            style={[styles.delBtn, { margin: 15, padding: 15, alignItems: 'center' }]}
            onPress={clearHistory}
          >
            <Text style={{ color: 'red' }}>Clear All History</Text>
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