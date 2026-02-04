import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
});