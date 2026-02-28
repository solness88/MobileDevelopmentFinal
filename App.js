/**
 * Daily Quiz Application
 * 
 * A React Native quiz app with multiple categories, difficulty levels,
 * and innovative physical interaction hint systems (shake, swipe, voice).
 * 
 * - Quiz system with OpenTriviaDB API integration
 * - Score tracking with AsyncStorage
 * - Statistics and history visualization
 * - Three physical hint methods: shake, swipe, microphone
 * - Sound effects and haptic feedback
 * - Network connectivity detection
 * 
**/

import React, { createContext, useEffect, useState, useContext, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, FlatList, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { styles, colors } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import NetInfo from '@react-native-community/netinfo';

const SettingsContext = createContext();

// ========================================
// Sound Management
// ========================================

/**
 * Sound object storage for audio playback
 * Stores preloaded sound files for quick access
 */
const soundObjects = {};

/**
 * Load all sound effects on app initialization
 * Preloads correct, incorrect, tap, and complete sounds
 */
const loadSounds = async () => {
  try {
    const sounds = {
      correct: require('./assets/sounds/correct.mp3'),
      incorrect: require('./assets/sounds/incorrect.mp3'),
      tap: require('./assets/sounds/tap.mp3'),
      complete: require('./assets/sounds/complete.mp3'),
      hint_1: require('./assets/sounds/hint_1.mp3'),
      hint_2: require('./assets/sounds/hint_2.mp3'),
    };

    for (const [key, source] of Object.entries(sounds)) {
      const { sound } = await Audio.Sound.createAsync(source);
      soundObjects[key] = sound;
    }
  } catch (error) {
    console.log('Error loading sounds:', error);
  }
};

/**
 * Play a sound effect by name
 * Name of the sound to play (correct, incorrect, tap, complete)
 */
const playSound = async (soundName) => {
  try {
    const sound = soundObjects[soundName];
    if (sound) {
      await sound.replayAsync();
    }
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};

// =====================================
// Screen Components
// ========================================
/**
 * HomeScreen - Main category selection screen
 * Displays quiz categories with difficulty selection.
 * Checks network connectivity before allowing quiz start.
 */
function HomeScreen({ navigation }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium'); // Default defficulty is medium
  const [isConnected, setIsConnected] = useState(true);

   /**
   * Monitor network connectivity status
   * Updates UI to prevent quiz start when offline
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

   /**
   * Quiz categories with icons and colors
   * Each category maps to OpenTriviaDB category IDs
   */
  const categories = [
    { id: 9, name: 'General Knowledge', icon: '🎯', color: colors.categories.general },
    { id: 17, name: 'Science & Nature', icon: '🔬', color: colors.categories.science },
    { id: 23, name: 'History', icon: '📚', color: colors.categories.history },
    { id: 21, name: 'Sports', icon: '⚽', color: colors.categories.sports },
    { id: 11, name: 'Film', icon: '🎬', color: colors.categories.film },
    { id: 22, name: 'Geography', icon: '🌍', color: colors.categories.geography }
  ];

  /**
   * Available difficulty levels for quiz selection
   */
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

      {!isConnected && (
        <View style={{ backgroundColor: '#FF6B6B', padding: 12 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
            📡 It's offline. Cannot start Quizzes.
          </Text>
        </View>
      )}

      {/* Difficulty selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {difficulties.map(difficulty => (
          <TouchableOpacity
            key={difficulty.value}
            style={[
              styles.difficultyChip,
              selectedDifficulty === difficulty.value && styles.difficultyChipSelected
            ]}
            onPress={() => {
              playSound('tap');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDifficulty(difficulty.value);
            }}
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

      <View style={styles.flex1}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>Choose a Category</Text>
          }
          renderItem={({ item: category }) => (
            <TouchableOpacity 
              style={styles.categoryCardEnhanced}
              onPress={() => {
                if (!isConnected) {
                  alert('Please access to the internet.');
                  return;
                }
                playSound('tap');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Quiz', { 
                  categoryId: category.id,
                  categoryName: category.name,
                  difficulty: selectedDifficulty
                });
              }}
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
          )}
        />
      </View>
    </View>
  );
}

/**
 * QuizScreen - Main quiz gameplay screen
 * 
 * Handles quiz questions, answer selection, scoring, and hint systems.
 * Features three physical interaction methods for hints:
 * - Shake: Accelerometer-based gesture
 * - Swipe: Touch screen rapid swiping
 * - Shout: Microphone volume detection
 */

/** Last API fetch timestamp to prevent rate limiting */
let globalLastFetchTime = 0;

function QuizScreen({ navigation, route }) {
  const { categoryId, categoryName, difficulty } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [shakeTimer, setShakeTimer] = useState(3);
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [hintsRemaining, setHintsRemaining] = useState(3);

  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [swipeTimer, setSwipeTimer] = useState(3);

  const [isShouting, setIsShouting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [shoutTimer, setShoutTimer] = useState(10);
  const [loudDuration, setLoudDuration] = useState(0);

  const lastSwipeTime = useRef(0);
  const swipeStartY = useRef(0);
  const lastY = useRef(0);
  const lastX = useRef(0);

  const recording = useRef(null);
  const lastVolumeCheckTime = useRef(0);

  useEffect(() => {
    fetchQuestions();
    setHintsRemaining(3);
  }, []);

  // Reset if the user move to History or Settings during quiz challenge
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (!showResult) {
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswer(null);
        setHintsRemaining(3);
      }
    });

    return unsubscribe;
  }, [navigation, showResult]);

  // =================================
  // Shake Hint System (Accelerometer)
  // ===================================

  /** Monitor shake gestures */
  useEffect(() => {
    let subscription;
    let lastShake = 0;

    const startShakeDetection = async () => {
      await Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (acceleration > 2.5 && now - lastShake > 100) {
          console.log('Shake detected! acceleration:', acceleration);
          lastShake = now;
          if (isShaking) {
            console.log('Count increased:', shakeCount + 1);
            setShakeCount(prev => prev + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      });
    };

    startShakeDetection();

    return () => {
      subscription && subscription.remove();
    };
  }, [isShaking]);

  /** Shake countdown timer */
  useEffect(() => {
    if (isShaking && shakeTimer > 0) {
      const timer = setTimeout(() => {
        setShakeTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isShaking && shakeTimer === 0) {
      finishShake();
    }
  }, [isShaking, shakeTimer]);

  // ========================================
  // Swipe Hint System (Touch Screen)
  // ========================================

  /** Swipe countdown timer */
  useEffect(() => {
    if (isSwiping && swipeTimer > 0) {
      const timer = setTimeout(() => {
        setSwipeTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSwiping && swipeTimer === 0) {
      finishSwipe();
    }
  }, [isSwiping, swipeTimer]);

  /** Microphone countdown timer */
  useEffect(() => {
    if (isShouting && shoutTimer > 0) {
      const timer = setTimeout(() => {
        setShoutTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isShouting && shoutTimer === 0) {
      finishShout();
    }
  }, [isShouting, shoutTimer]);

  /** Start shake challenge */
  const startShake = () => {
    console.log('startShake called');
    console.log('hintsRemaining:', hintsRemaining);
    console.log('selectedAnswer:', selectedAnswer);
    console.log('disabledOptions:', disabledOptions);
    if (hintsRemaining <= 0 || selectedAnswer || disabledOptions.length > 0) return;
    console.log('Shake started!');
    setIsShaking(true);
    setShakeCount(0);
    setShakeTimer(3);
    playSound('tap');
  };
    
  /** Evaluate shake result and remove options */
  const finishShake = () => {
    console.log('finishShake called, shakeCount:', shakeCount);
    setIsShaking(false);
    setHintsRemaining(prev => prev - 1);

    if (shakeCount < 5) {
      console.log('Shake failed - too few shakes');
      playSound('incorrect');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      console.log('Shake success!');
      const question = questions[currentQuestion];
      console.log('Current question:', question);
      const incorrectAnswers = question.answers.filter(
        answer => answer !== question.correct_answer
      );
      console.log('Incorrect answers:', incorrectAnswers);

      let toRemove = shakeCount >= 11 ? 2 : 1;
      const removed = incorrectAnswers.slice(0, toRemove);
      console.log('Removing options:', removed);

      setDisabledOptions(removed);
      playSound(toRemove === 2 ? 'hint_2' : 'hint_1');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShakeCount(0);
    setShakeTimer(3);
  };

  /** Start swipe challenge */
  const startSwipe = () => {
    if (hintsRemaining <= 0 || selectedAnswer || disabledOptions.length > 0) return;

    setIsSwiping(true);
    setSwipeCount(0);
    setSwipeTimer(3);
    playSound('tap');
  };

  /** Record swipe start position */
  const handleSwipeStart = (e) => {
    swipeStartY.current = e.nativeEvent.pageY;
    lastY.current = e.nativeEvent.pageY;
    lastX.current = e.nativeEvent.pageX;
  };

  /** Track swipe distance and count */
  const handleSwipeMove = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentY = e.nativeEvent.pageY;
    const currentX = e.nativeEvent.pageX;
    const distanceY = Math.abs(currentY - lastY.current);
    const distanceX = Math.abs(currentX - lastX.current);
    const totalDistance = Math.max(distanceY, distanceX);

    if (totalDistance > 130) {
      lastY.current = currentY;
      lastX.current = currentX;
      setSwipeCount(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /** Start microphone recording and volume monitoring */
  const startShout = async () => {
    if (hintsRemaining <= 0 || selectedAnswer || disabledOptions.length > 0) return;

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && status.metering) {
            const db = status.metering;
            const volume = Math.max(0, db + 160);
            setVolumeLevel(volume);

            // 持続時間カウント
            const now = Date.now();
            if (volume >= 120 && lastVolumeCheckTime.current > 0) {
              const elapsed = (now - lastVolumeCheckTime.current) / 1000;
              setLoudDuration(prev => prev + elapsed);
            }

            lastVolumeCheckTime.current = now;
          }
        },
        100
      );

      recording.current = newRecording;
      setIsShouting(true);
      setVolumeLevel(0);
      setLoudDuration(0);
      setShoutTimer(10);
      lastVolumeCheckTime.current = Date.now();
      playSound('tap');
    } catch (err) {
      console.error('Failed to start recording', err);
      alert('Microphone permission required');
    }
  };

  /** Stop recording and evaluate sustained volume */
  const finishShout = async () => {
    setIsShouting(false);
    setHintsRemaining(prev => prev - 1);
    try {
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        recording.current = null;
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
    if (loudDuration < 5) {
      playSound('incorrect');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      const question = questions[currentQuestion];
      const incorrectAnswers = question.answers.filter(
        answer => answer !== question.correct_answer
      );

      let toRemove;
      if (loudDuration >= 10 && volumeLevel >= 120) {
        toRemove = 2;
      } else if (loudDuration >= 5) {
        toRemove = 1;
      } else {
        toRemove = 0;
      }
      
      if (toRemove === 0) {
        playSound('incorrect');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        const removed = incorrectAnswers.slice(0, toRemove);

        setDisabledOptions(removed);
        playSound(toRemove === 2 ? 'hint_2' : 'hint_1');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    setVolumeLevel(0);
    setLoudDuration(0);
    setShoutTimer(10);
    lastVolumeCheckTime.current = 0;
  };

  // スワイプ終了
  const finishSwipe = () => {
    setIsSwiping(false);
    setHintsRemaining(prev => prev - 1);

    if (swipeCount < 10) {
      playSound('incorrect');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      const question = questions[currentQuestion];
      const incorrectAnswers = question.answers.filter(
        answer => answer !== question.correct_answer
      );

      let toRemove = swipeCount >= 20 ? 2 : 1;
      const removed = incorrectAnswers.slice(0, toRemove);

      setDisabledOptions(removed);
      playSound(toRemove === 2 ? 'hint_2' : 'hint_1');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSwipeCount(0);
    setSwipeTimer(3);
  };

  // ========================================
  // Score Management
  // ========================================
  /**
   * Save quiz result to AsyncStorage
   * Stores score, category, difficulty, timestamp, and percentage
   */
  const saveScore = async (finalScore, totalQuestions) => {
    try {
      const quizResult = {
        id: Date.now().toString(),
        category: categoryName,
        categoryId: categoryId,
        difficulty: difficulty,
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

/**
  * Fetch quiz questions from OpenTriviaDB API
  * Includes error handling and fallback mechanism
  */
  const fetchQuestions = async () => {

    // Prevent the second call within 5 seconds
    const now = Date.now();
    const timeSinceLastFetch = now - globalLastFetchTime;
    if (timeSinceLastFetch < 7000) {
      const waitTime = 7000 - timeSinceLastFetch;
      console.log(`Waiting ${waitTime}ms to avoid rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    globalLastFetchTime = Date.now();
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=multiple`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      console.log(`Fetching ${difficulty} questions for category ${categoryId}`);

      if (data.results.length === 0) {
        console.warn('No questions available');
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
      alert('Failed to load quiz. Please check your connection and try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Decode HTML entities in quiz questions and answers
   * Converts &quot;, &#039;, &amp;, etc. to readable characters
   */
  const decodeHTML = (html) => {
    return html
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  };

  /** Handle answer selection and scoring */
  const handleAnswer = async (answer) => {
    setSelectedAnswer(answer);

    const isCorrect = answer === questions[currentQuestion].correct_answer;
    playSound(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(newScore);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setDisabledOptions([]);
      } else {
        const finalScore = isCorrect ? newScore : score;
        saveScore(finalScore, questions.length);
        playSound('complete');
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
              playSound('tap');
              setCurrentQuestion(0);
              setScore(0);
              setSelectedAnswer(null);
              setShowResult(false);
              setHintsRemaining(3);
              fetchQuestions();
            }}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => {
              playSound('tap');
              navigation.navigate('MainHome');
            }}
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

      <ScrollView style={{ flex: 1 }} scrollEnabled={!isSwiping}>
        <View style={styles.quizQuestionContainer}>
          <Text style={styles.quizQuestionText}>
            {question.question}
          </Text>
          <Text style={styles.quizProgress}>
            Question {currentQuestion + 1} of {questions.length} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • Score: {score}
          </Text>
        </View>

        {/* Hint Selection UI */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 14, color: colors.textLight, marginBottom: 10 }}>
            💡 Hints remaining: {hintsRemaining}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { paddingVertical: 8, paddingHorizontal: 12, minWidth: 90 },
                (hintsRemaining <= 0 || selectedAnswer || disabledOptions.length > 0) && { opacity: 0.5 }
              ]}
              onPress={(hintsRemaining > 0 && !selectedAnswer && disabledOptions.length === 0) ? startShake : undefined}
            >
              <Text style={[styles.secondaryButtonText, { fontSize: 11 }]}>
                📱 Shake
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { paddingVertical: 8, paddingHorizontal: 12, minWidth: 90 },
                (hintsRemaining <= 0 || selectedAnswer || disabledOptions.length > 0) && { opacity: 0.5 }
              ]}
              onPress={(hintsRemaining > 0 && !selectedAnswer && disabledOptions.length === 0) ? startSwipe : undefined}
            >
              <Text style={[styles.secondaryButtonText, { fontSize: 11 }]}>
                👆 Swipe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { paddingVertical: 8, paddingHorizontal: 12, minWidth: 90 },
                (hintsRemaining <= 0 || selectedAnswer || disabledOptions.length > 0) && { opacity: 0.5 }
              ]}
              onPress={(hintsRemaining > 0 && !selectedAnswer && disabledOptions.length === 0) ? startShout : undefined}
            >
              <Text style={[styles.secondaryButtonText, { fontSize: 11 }]}>
                🎤 Shout
              </Text>
            </TouchableOpacity>
          </View>
        </View>




        {/* Overlay during shaking */}
        {isShaking && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <Text style={{ fontSize: 48, marginBottom: 20 }}>📱</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 10 }}>
              SHAKE IT!
            </Text>
            <Text style={{ fontSize: 48, fontWeight: '700', color: colors.primary, marginBottom: 20 }}>
              {shakeCount} times
            </Text>
            <Text style={{ fontSize: 20, color: '#fff', marginBottom: 10 }}>
              {shakeTimer} seconds left
            </Text>
            <Text style={{ fontSize: 16, color: colors.textLight }}>
              {shakeCount < 5 ? '💪 Faster!' : shakeCount < 11 ? '👍 Good!' : '🔥 Amazing!'}
            </Text>
          </View>
        )}

        {/* スワイプ中のオーバーレイ */}
        {isSwiping && (
          <View style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}

            // onTouchMove={handleSwipe}
            onTouchStart={handleSwipeStart}
            onTouchMove={handleSwipeMove}
            pointerEvents="box-only"
          >
            <Text style={{ fontSize: 48, marginBottom: 20 }}>👆</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 10 }}>
              SWIPE IT!
            </Text>
            <Text style={{ fontSize: 48, fontWeight: '700', color: colors.primary, marginBottom: 20 }}>
              {swipeCount} times
            </Text>
            <Text style={{ fontSize: 20, color: '#fff', marginBottom: 10 }}>
              {swipeTimer} seconds left
            </Text>
            <Text style={{ fontSize: 16, color: colors.textLight }}>
              {swipeCount < 10 ? '💪 Faster!' : swipeCount < 20 ? '👍 Good!' : '🔥 Amazing!'}
            </Text>
          </View>
        )}

        {isShouting && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <Text style={{ fontSize: 48, marginBottom: 20 }}>🎤</Text>
            <Text style={{ fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 10 }}>
              SHOUT IT!
            </Text>
            <Text style={{ fontSize: 48, fontWeight: '700', color: colors.primary, marginBottom: 20 }}>
              {loudDuration.toFixed(1)}s
            </Text>
            <Text style={{ fontSize: 20, color: '#fff', marginBottom: 10 }}>
              {shoutTimer} seconds left
            </Text>
            <Text style={{ fontSize: 16, color: colors.textLight }}>
              {loudDuration < 5 ? '📢 Keep shouting!' : loudDuration < 10 ? '👍 Good! Keep going!' : '🔥 Amazing!'}
            </Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.quizOptionsContainer}>
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = answer === question.correct_answer;
            const showCorrect = selectedAnswer && isCorrect;
            const showIncorrect = isSelected && !isCorrect;
            const isDisabled = disabledOptions.includes(answer);
            const canPress = !selectedAnswer && !isDisabled;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect && styles.optionButtonCorrect,
                  showIncorrect && styles.optionButtonIncorrect,
                  isSelected && !showCorrect && !showIncorrect && styles.optionButtonSelected,
                  isDisabled && { opacity: 0.3, backgroundColor: '#ccc' }
                ]}
                onPress={canPress ? () => handleAnswer(answer) : undefined}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  isDisabled && { textDecorationLine: 'line-through', color: '#999' }
                ]}>
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

// =============================================
// HistoryScreen - Quiz history and statistics
// ========================================

/**
 * HistoryScreen - Display quiz history with statistics
 * Shows performance charts, category breakdown, and past results
 */
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

  /** Icon mapping for each quiz category */
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

  /** Load quiz history from AsyncStorage and calculate statistics */
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

  /** Clear all quiz history data */
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

  /** Format date to relative time */
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
        <View style={styles.flex1}>


          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={(
              <View>
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
            </View>
            )}

            renderItem={({ item }) => (
              <View style={styles.archiveCard}>
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
            )}

            ListFooterComponent={
              <TouchableOpacity
                style={[styles.dangerButton, { margin: 15 }]}
                onPress={clearHistory}
              >
                <Text style={styles.dangerButtonText}>Clear All History</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
    </View>
  );
}

// ========================================
// SettingsScreen - App configuration
// ========================================

/**
 * SettingsScreen - User preferences and app info
 * Allows customization of difficulty, question count, and sound settings
 */
function SettingsScreen() {
  const [defaultDifficulty, setDefaultDifficulty] = useState('medium');
  const [questionsPerQuiz, setQuestionsPerQuiz] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const difficulties = ['easy', 'medium', 'hard'];
  const questionOptions = [5, 10, 15];

  return (
    <ScrollView style={styles.settingsBg}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>Quiz Settings</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => {
            const currentIndex = difficulties.indexOf(defaultDifficulty);
            const nextIndex = (currentIndex + 1) % difficulties.length;
            setDefaultDifficulty(difficulties[nextIndex]);
          }}
        >
          <Text>Default Difficulty</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>
            {defaultDifficulty.charAt(0).toUpperCase() + defaultDifficulty.slice(1)} →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => {
            const currentIndex = questionOptions.indexOf(questionsPerQuiz);
            const nextIndex = (currentIndex + 1) % questionOptions.length;
            setQuestionsPerQuiz(questionOptions[nextIndex]);
          }}
        >
          <Text>Questions per Quiz</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{questionsPerQuiz} →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsRow}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          <Text>Sound Effects</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>
            {soundEnabled ? 'ON' : 'OFF'} →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>About</Text>
        </View>
        <View style={styles.settingsRow}>
          <Text>Version</Text>
          <Text style={styles.meta}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// --- Navigation ---
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ========================================
// Navigation Setup
// ========================================

/** Home stack navigator for quiz flow */
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
}

// ========================================
// Main App Component
// ========================================

/** Root app component with navigation and context providers */
export default function App() {
  const [textSize, setTextSize] = useState(18);

  useEffect(() => {
    loadSounds();
  }, []);

  return (
    <SettingsContext.Provider value={{ textSize, setTextSize }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen 
            name="Home" 
            component={HomeStack}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                navigation.navigate('Home', { screen: 'MainHome' });
              },
            })}
          />
          <Tab.Screen name="History">
            {(props) => <HistoryScreen {...props} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SettingsContext.Provider>
  );
}