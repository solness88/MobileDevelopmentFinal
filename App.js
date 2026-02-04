import React, { createContext, useEffect,useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch,ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

const SettingsContext = createContext();

function HomeScreen({ navigation }) {
  const { country } = useContext(SettingsContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ここに取得したAPIキーを貼り付けてください ---
  const API_KEY = Constants.expoConfig.extra.newsApiKey;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // top-headlines エンドポイントを使用
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${API_KEY}`
        );
        const data = await response.json();
        console.log("API Response Status:", data.status); // ログで状況を確認

        if (data.status === 'ok') {

          console.log("Number of articles:", data.articles.length);

          setArticles(data.articles);
        } else {
          console.error('API Error:', data.message);
        }
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [country]); // 設定画面で国が変わるたびに実行される

  return (
    <View style={styles.flex1}>
      <View style={styles.header}><Text style={styles.headerText}>News Reader</Text></View>
      
      {/* カテゴリー選択（横スクロール） */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {['All', 'Business', 'Technology', 'Science', 'Health'].map(cat => (
          <TouchableOpacity key={cat} style={styles.catChip}>
            <Text>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.flex1}>
        <Text style={styles.sectionLabel}>Articles ({country.toUpperCase()})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
        ) : (
          articles.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.homeCard} 
              onPress={() => navigation.navigate('Reader', { article: item })}
            >
              {/* News APIから画像が提供されない場合のプレースホルダー */}
              <Image 
                source={{ uri: item.urlToImage || 'https://via.placeholder.com/400x225?text=No+Image' }} 
                style={styles.imagePlaceholder} 
              />
              <View style={styles.cardContent}>
                <Text style={styles.tag}>[{item.source.name}]</Text>
                <Text style={styles.boldTitle} numberOfLines={3}>{item.title}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.meta}>
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity style={styles.saveBtn}>
                    <Text>SAVE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- 2. Archive Screen ---
function ArchiveScreen() {
  return (
    <View style={styles.flex1}>
      <View style={styles.header}><Text style={styles.headerText}>News Reader</Text></View>
      <Text style={styles.sectionLabel}>Saved articles(12)</Text>
      <ScrollView>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.archiveCard}>
            <Text style={styles.tag}>[Category Tag]</Text>
            <Text style={styles.boldTitle}>Sustainable energy breakthrough in 2026</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.meta}>BBC News • 2h ago</Text>
              <TouchableOpacity style={styles.delBtn}><Text>Delete</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// --- 3. Article Screen (Reader View) ---
function ArticleScreen({ navigation, route }) {
  const { article } = route.params || {};
  
  return (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{article.source.name}</Text>
      </View>
      <WebView 
        source={{ uri: article.url }}
        style={styles.flex1}
      />
    </View>
  );
}

// --- 4. Setting Screen ---
function SettingScreen() {
  const { country, setCountry, isDark, setIsDark, textSize, setTextSize } = useContext(SettingsContext);
  return (
    <ScrollView style={styles.settingsBg}>
      <View style={styles.header}><Text style={styles.headerText}>News Reader</Text></View>
      <Text style={styles.sectionLabel}>Settings</Text>
      
      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}><Text style={styles.groupTitle}>Preferences</Text></View>
        <View style={styles.settingsRow}><Text>News region</Text><Text>Select country ▼</Text></View>
        <View style={styles.settingsRow}><Text>Typography</Text><Text>Sans / Serif</Text></View>
      </View>

      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}><Text style={styles.groupTitle}>Appearance</Text></View>
        <View style={styles.settingsRow}><Text>Dark mode</Text><Switch value={isDark} onValueChange={setIsDark} /></View>
        <View style={styles.settingsRow}><Text>Text size</Text><Text>- / +</Text></View>
      </View>

      <View style={styles.settingsGroup}>
        <View style={styles.groupHeader}><Text style={styles.groupTitle}>Data management</Text></View>
        <View style={styles.settingsRow}><Text>Auto-Clean Old Articles</Text><Switch value={false} /></View>
        <TouchableOpacity style={styles.settingsRow}><Text style={{color:'red'}}>Clear all saved articles(Red)</Text></TouchableOpacity>
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
      <Stack.Screen name="Reader" component={ArticleScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [country, setCountry] = useState('gb');
  const [isDark, setIsDark] = useState(false);
  const [textSize, setTextSize] = useState(18);

  return (
    <SettingsContext.Provider value={{ country, setCountry, isDark, setIsDark, textSize, setTextSize }}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Discover" component={HomeStack} />
          <Tab.Screen name="My archive" component={ArchiveScreen} />
          <Tab.Screen name="Settings" component={SettingScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SettingsContext.Provider>
  );
}

