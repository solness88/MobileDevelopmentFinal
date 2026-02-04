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
import { extractArticleContent } from './utils/articleExtractor';

const SettingsContext = createContext();

function HomeScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Technology');

  useEffect(() => {
    const fetchWikipediaArticles = async () => {
      setLoading(true);
      try {
        const searchKeywords = {
          'Technology': 'technology computer software internet',
          'Science': 'science physics chemistry biology',
          'History': 'history civilization ancient modern',
          'Nature': 'nature animals plants ecology environment',
          'Space': 'space astronomy universe planet galaxy'
        };
        
        const keyword = searchKeywords[category];
        
        const searchResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&format=json&origin=*&srlimit=20`
        );
        const searchData = await searchResponse.json();
        
        console.log(`Fetched ${searchData.query.search.length} search results for ${category}`);
        
        // 各記事の詳細を取得（エラーハンドリング強化）
        const articlePromises = searchData.query.search.slice(0, 10).map(async (item) => {
          try {
            const detailResponse = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`,
              {
                headers: {
                  'User-Agent': 'WikiReaderApp/1.0 (Educational Project)',
                  'Api-User-Agent': 'WikiReaderApp/1.0 (Educational Project)'
                }
              }
            );
            
            // レスポンスがJSONかチェック
            const contentType = detailResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.warn(`Non-JSON response for ${item.title}`);
              return null;
            }
            
            const detail = await detailResponse.json();
            
            // エラーレスポンスをチェック
            if (detail.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
              console.warn(`Article not found: ${item.title}`);
              return null;
            }
            
            return {
              title: detail.title,
              description: detail.extract || 'No description available',
              content: detail.extract || '',
              url: detail.content_urls?.desktop?.page || '',
              urlToImage: detail.thumbnail?.source || null,
              publishedAt: detail.timestamp || new Date().toISOString(),
              source: { name: 'Wikipedia' },
              author: 'Wikipedia Contributors',
              pageTitle: item.title
            };
          } catch (error) {
            console.error(`Error fetching detail for ${item.title}:`, error.message);
            return null;
          }
        });
        
        const detailedArticles = await Promise.all(articlePromises);
        const validArticles = detailedArticles.filter(article => article !== null);
        
        console.log(`Successfully loaded ${validArticles.length} articles`);
        setArticles(validArticles);
        
      } catch (error) {
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWikipediaArticles();
  }, [category]);

  return (
    <View style={styles.flex1}>
      <View style={styles.header}><Text style={styles.headerText}>Wiki Reader</Text></View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {['Technology', 'Science', 'History', 'Nature', 'Space'].map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[
              styles.catChip, 
              category === cat && { backgroundColor: '#007AFF', borderColor: '#007AFF' }
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={category === cat && { color: '#fff' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.flex1}>
        <Text style={styles.sectionLabel}>Articles ({category})</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
        ) : articles.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
            No articles found
          </Text>
        ) : (
          articles.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.homeCard} 
              onPress={() => navigation.navigate('Reader', { article: item })}
            >
              {item.urlToImage ? (
                <Image 
                  source={{ uri: item.urlToImage }} 
                  style={styles.imagePlaceholder} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#999' }}>No Image</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.tag}>[Wikipedia]</Text>
                <Text style={styles.boldTitle} numberOfLines={3}>{item.title}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.meta}>Wikipedia</Text>
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
  const { textSize } = useContext(SettingsContext);
  const { article } = route.params || {};
  const [fullContent, setFullContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullArticle = async () => {
      setLoading(true);
      try {
        // デバッグ: pageTitleが正しく取得できているか確認
        console.log('Fetching article:', article.pageTitle);
        
        if (!article.pageTitle) {
          throw new Error('Article pageTitle is missing');
        }
        
        // User-Agentにメールアドレスを含める（your-email@example.comを実際のメールに変更）
        const USER_AGENT = 'WikiReaderApp/1.0 (solness.stf@gmail.com; Educational Project)';
        
        // まずsummaryエンドポイントで取得（これは安定している）
        const summaryResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article.pageTitle)}`,
          {
            headers: {
              'User-Agent': USER_AGENT,
              'Api-User-Agent': USER_AGENT
            }
          }
        );
        
        if (!summaryResponse.ok) {
          throw new Error(`HTTP error! status: ${summaryResponse.status}`);
        }
        
        const summaryData = await summaryResponse.json();
        
        // extract_html があればHTMLタグを削除して使用
        let fullText = '';
        
        if (summaryData.extract_html) {
          fullText = summaryData.extract_html
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        } else if (summaryData.extract) {
          fullText = summaryData.extract;
        }
        
        // より詳細な本文が必要な場合は、mobile-htmlを試す（fallback）
        if (fullText.length < 500) {
          try {
            const htmlResponse = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(article.pageTitle)}`,
              {
                headers: {
                  'User-Agent': USER_AGENT,
                  'Api-User-Agent': USER_AGENT
                }
              }
            );
            
            if (htmlResponse.ok) {
              const htmlText = await htmlResponse.text();
              // HTMLから本文を抽出（簡易版）
              const textOnly = htmlText
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (textOnly.length > fullText.length) {
                fullText = textOnly;
              }
            }
          } catch (htmlError) {
            console.log('mobile-html fetch failed, using summary only');
          }
        }
        
        setFullContent(fullText || article.description || '本文を取得できませんでした。');
        
      } catch (error) {
        console.error('Fetch Full Article Error:', error.message);
        console.error('Article pageTitle:', article?.pageTitle);
        setFullContent(article.description || '本文を取得できませんでした。');
      } finally {
        setLoading(false);
      }
    };

    if (article?.pageTitle) {
      fetchFullArticle();
    } else {
      console.warn('No pageTitle available for article:', article?.title);
      setFullContent(article?.description || '');
      setLoading(false);
    }
  }, [article]);

  if (!article) {
    return (
      <View style={styles.flex1}>
        <View style={styles.header}><Text style={styles.headerText}>Wiki Reader</Text></View>
        <View style={styles.container}>
          <Text>記事が見つかりません</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text>BACK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 15 }}>
          <Text style={{ fontSize: 16 }}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Wikipedia</Text>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionLabel}>Selected article</Text>
        
        <Text style={styles.largeHeadline}>{article.title}</Text>
        
        <Text style={styles.meta}>Wikipedia</Text>
        
        {article.urlToImage && (
          <Image 
            source={{ uri: article.urlToImage }} 
            style={styles.featuredImage}
            resizeMode="cover"
          />
        )}
        
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 30 }} />
        ) : (
          <Text style={[styles.bodyText, { fontSize: textSize }]}>
            {fullContent}
          </Text>
        )}
        
        <View style={styles.rowAround}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text>BACK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Text>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

