import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const colors = {
  primary: '#4ECDC4',      // main color(Turquoise)
  primaryDark: '#3AB5AC',  // Strong Turquoise
  secondary: '#FF6B6B',    // Accent color(red)
  success: '#4ECDC4',      // Success（green turquoise）
  warning: '#FFA07A',      // Warning（Orange）
  danger: '#FF6B6B',       // Danger（red）
  background: '#F7F7F7',   // background
  cardBackground: '#FFFFFF', // Card background
  text: '#333333',         // Text
  textLight: '#888888',    // Light text
  border: '#E0E0E0',       // Border
  
  // Category color
  categories: {
    general: '#FF6B6B',
    science: '#4ECDC4',
    history: '#45B7D1',
    sports: '#FFA07A',
    film: '#98D8C8',
    geography: '#6C5CE7'
  }
};

export const styles = StyleSheet.create({
  flex1: {
    flex: 1, backgroundColor: '#fff'
  },
  header: {
    height: 60, 
    backgroundColor: colors.primary,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  catScroll: { 
    paddingVertical: 10, 
    maxHeight: 60, 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  catChip: { 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    marginRight: 10, 
    marginLeft: 10 
  },
  sectionLabel: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    margin: 15 
  },
  homeCard: { 
    margin: 15,
    marginHorizontal: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imagePlaceholder: { 
    height: width * (9/16), 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center' 
  }, // 16:9を動的に計算
  cardContent: { 
    padding: 16 
  },
  archiveCard: { 
    marginHorizontal: 15, 
    marginBottom: 10, 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  tag: { 
    color: '#666', 
    fontSize: 12 
  },
  boldTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginVertical: 5 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  meta: { 
    color: '#888', 
    fontSize: 12 
  },
  saveBtn: { 
    padding: 8, 
    borderWidth: 1, 
    borderColor: '#000' 
  },
  delBtn: { 
    padding: 8, 
    borderWidth: 1, 
    borderColor: '#000' 
  },
  largeHeadline: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginHorizontal: 15 
  },
  featuredImage: { 
    height: 200, 
    backgroundColor: '#eee', 
    margin: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  bodyText: { 
    margin: 15, 
    lineHeight: 28 
  },
  rowAround: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 20 
  },
  backBtn: { 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#000', 
    width: 100, 
    alignItems: 'center' 
  },
  settingsBg: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  settingsGroup: { 
    marginBottom: 20, 
    backgroundColor: '#fff' 
  },
  groupHeader: { 
    backgroundColor: '#777', 
    padding: 10 
  },
  groupTitle: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  settingsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  featuredImage: { 
    height: 200,
    width: '100%', // 追加
    backgroundColor: '#eee', 
    margin: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  // Button styles
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCardEnhanced: {
    margin: 15,
    marginHorizontal: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  categoryAccentBar: {
    height: 4,
    width: '100%',
  },
  categoryCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  categoryMeta: {
    fontSize: 13,
    color: colors.textLight,
  },
  categoryArrow: {
    fontSize: 20,
    color: colors.textLight,
    marginLeft: 8,
  },
  quizContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quizQuestionContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quizQuestionText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
    textAlign: 'center',
  },
  quizProgress: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
  quizOptionsContainer: {
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionButtonCorrect: {
    backgroundColor: '#4CAF50',
    borderColor: colors.success,
    backgroundColor: colors.success + '20',
  },
  optionButtonIncorrect: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '20',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 24,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  resultPercentage: {
    fontSize: 20,
    color: colors.textLight,
    marginBottom: 30,
  },
  resultStatsContainer: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultStatRowLast: {
    borderBottomWidth: 0,
  },
  resultStatLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  resultStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  resultButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  difficultyChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: colors.cardBackground,
  },
  difficultyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  difficultyChipTextSelected: {
    color: '#fff',
  },
  // Settings Screen styles
  settingsGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    marginTop: 10,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },

  settingValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});