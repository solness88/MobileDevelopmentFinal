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
     borderBottomWidth: 1, 
     borderColor: '#ccc', 
     justifyContent: 'center', 
     alignItems: 'center', 
     marginTop: 40
  },
  headerText: { 
    fontSize: 18, 
    fontWeight: 'bold' 
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
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  imagePlaceholder: { 
    height: width * (9/16), 
    backgroundColor: '#eee', 
    justifyContent: 'center', 
    alignItems: 'center' 
  }, // 16:9を動的に計算
  cardContent: { 
    padding: 10 
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
});