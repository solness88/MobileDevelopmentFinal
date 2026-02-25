# Daily Quiz App

A React Native quiz application with innovative physical interaction hint systems using device sensors.

## Features

- **Quiz System**: 6 categories with 3 difficulty levels
- **Physical Hint Interactions**:
  - 📱 Shake: Accelerometer-based gesture detection
  - 👆 Swipe: Rapid touch screen swiping
  - 🎤 Shout: Microphone volume detection
- **Score Tracking**: Local storage with AsyncStorage
- **Statistics Dashboard**: Performance graphs and category breakdown
- **Sound Effects**: Audio feedback for user interactions
- **Haptic Feedback**: Vibration responses for correct/incorrect answers
- **Network Detection**: Offline mode handling

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Storage**: AsyncStorage
- **Charts**: react-native-chart-kit
- **Audio**: expo-av
- **Sensors**: expo-sensors (Accelerometer)
- **Testing**: Jest + React Native Testing Library

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news-reader-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## Project Structure
```
daily-quiz-app/
├── App.js                 # Main application file
├── styles.js              # Centralized styling
├── assets/
│   └── sounds/           # Sound effect files
├── __tests__/
│   ├── utils.test.js     # Unit tests
│   └── integration.test.js # Integration tests
└── README.md
```

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Usage

### Starting a Quiz
1. Select difficulty level (Easy, Medium, Hard)
2. Choose a category
3. Answer 10 questions

### Using Hints
Each quiz session provides 3 hints. Choose from:
- **Shake**: Shake your device (5+ shakes = 1 option removed, 11+ = 2 options removed)
- **Swipe**: Rapidly swipe the screen (10+ swipes = 1 option, 20+ = 2 options)
- **Shout**: Speak loudly into microphone (5s at 120dB+ = 1 option, 10s = 2 options)

### Viewing History
- Navigate to History tab
- View statistics, performance graphs, and past quiz results
- Clear history if needed

## API

This app uses the [Open Trivia Database API](https://opentdb.com/) for quiz questions.

## Configuration

Sound effects can be toggled in Settings screen (currently display-only, full functionality planned for future release).

## Known Issues

- Settings screen displays preferences but does not persist changes yet
- Limited to 10 questions per quiz session

## Future Enhancements

- Customizable question count
- Achievement system
- Daily challenges
- Leaderboard functionality

## Acknowledgments

- Open Trivia Database for quiz questions
- Expo team for excellent development tools
- React Native community for libraries and support