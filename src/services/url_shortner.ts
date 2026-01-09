import type { Bindings } from "../libs/types";

const BASE36_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

function generateShortId(): string {
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += BASE36_CHARS[Math.floor(Math.random() * BASE36_CHARS.length)];
    }
    return result;
}

export async function shortenUrlsBatch(
    urls: string[],
    env: Bindings,
    baseUrl: string,
): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();

    const promises = urls.map(async (url) => {
        try {
            const existing = await env.URL_SHORTENER.get(`reverse:${url}`);
            if (existing) {
                return { url, shortUrl: `${baseUrl}/${existing}` };
            }

            const uniqueId = generateShortId();
            const shortUrl = `${baseUrl}/${uniqueId}`;
            await Promise.all([
                env.URL_SHORTENER.put(uniqueId, url, { expirationTtl: 86400 * 30 }), // 30 days
                env.URL_SHORTENER.put(`reverse:${url}`, uniqueId, { expirationTtl: 86400 * 30 }),
            ]);

            return { url, shortUrl };
        } catch (error) {
            console.error(`Failed to shorten ${url}:`, error);
            return { url, shortUrl: url };
        }
    });

    const results = await Promise.all(promises);
    results.forEach(({ url, shortUrl }) => {
        urlMap.set(url, shortUrl);
    });

    return urlMap;
}

export async function shortenUrl(url: string, env: Bindings, baseUrl: string): Promise<string> {
    const urlMap = await shortenUrlsBatch([url], env, baseUrl);
    return urlMap.get(url) || url;
}

export async function resolveShortUrl(uniqueId: string, env: Bindings): Promise<string | null> {
    return await env.URL_SHORTENER.get(uniqueId);
}

export function extractGitHubUrls(text: string): string[] {
    const githubUrlRegex = /https:\/\/github\.com\/[^\s)]+/g;
    return text.match(githubUrlRegex) || [];
}

export function replaceUrlsInText(text: string, urlMap: Map<string, string>): string {
    let result = text;
    urlMap.forEach((shortUrl, originalUrl) => {
        result = result.replaceAll(originalUrl, shortUrl);
    });
    return result;
}
