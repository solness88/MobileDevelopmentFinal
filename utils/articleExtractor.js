import { decode } from 'html-entities';

export async function extractArticleContent(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // HTMLから本文を抽出（簡易版）
    // <article>, <main>, <p>タグなどから抽出
    let content = html;
    
    // scriptとstyleタグを削除
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // articleタグの中身を抽出
    const articleMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = articleMatch[1];
    } else {
      // mainタグを試す
      const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch) {
        content = mainMatch[1];
      }
    }
    
    // HTMLタグを削除してテキストのみ抽出
    content = content.replace(/<[^>]+>/g, ' ');
    content = decode(content); // HTMLエンティティをデコード
    content = content.replace(/\s+/g, ' ').trim(); // 余分な空白を削除
    
    return content;
  } catch (error) {
    console.error('Failed to extract article:', error);
    return null;
  }
}