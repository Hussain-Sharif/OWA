import { Bindings } from './types';

// Base62 encoding for shorter URLs
const BASE36_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

function generateShortId(): string {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += BASE36_CHARS[Math.floor(Math.random() * BASE36_CHARS.length)];
  }
  return result;
}

// Batch URL shortening - handles up to 100 URLs in parallel
export async function shortenUrlsBatch(urls: string[], env: Bindings, baseUrl: string): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  
  // Process URLs in parallel for maximum speed
  const promises = urls.map(async (url) => {
    try {
      // Check if already exists (This is Important to persist same URL across requests)
      const existing = await env.URL_SHORTENER.get(`reverse:${url}`);
      if (existing) {
        return { url, shortUrl: `${baseUrl}/${existing}` };
      }

      const shortId = generateShortId();
      const shortUrl = `${baseUrl}/${shortId}`;
      
      // Store both directions
      await Promise.all([
        env.URL_SHORTENER.put(shortId, url, { expirationTtl: 86400 * 30 }), // 30 days
        env.URL_SHORTENER.put(`reverse:${url}`, shortId, { expirationTtl: 86400 * 30 })
      ]);
      
      return { url, shortUrl };
    } catch (error) {
      console.error(`Failed to shorten ${url}:`, error);
      return { url, shortUrl: url }; // Return original if failed
    }
  });
  
  const results = await Promise.all(promises);
  
  results.forEach(({ url, shortUrl }) => {
    urlMap.set(url, shortUrl);
  });
  
  return urlMap;
}

// Single URL shortening
export async function shortenUrl(url: string, env: Bindings, baseUrl: string): Promise<string> {
  const urlMap = await shortenUrlsBatch([url], env, baseUrl);
  return urlMap.get(url) || url;
}

// Resolve short URL
export async function resolveShortUrl(shortId: string, env: Bindings): Promise<string | null> {
  return await env.URL_SHORTENER.get(shortId);
}

// Extract GitHub URLs from text
export function extractGitHubUrls(text: string): string[] {
  const githubUrlRegex = /https:\/\/github\.com\/[^\s\)]+/g;
  return text.match(githubUrlRegex) || [];
}

// Replace URLs in text with shortened versions
export function replaceUrlsInText(text: string, urlMap: Map<string, string>): string {
  let result = text;
  urlMap.forEach((shortUrl, originalUrl) => {
    result = result.replaceAll(originalUrl, shortUrl);
  });
  return result;
}
