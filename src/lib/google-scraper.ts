/**
 * Google Search Scraper for Next.js API
 * Scrapes Google/DuckDuckGo for educational content
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export class GoogleScraper {
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  async searchDuckDuckGo(query: string, numResults: number = 5): Promise<SearchResult[]> {
    try {
      const url = 'https://html.duckduckgo.com/html/';
      const params = new URLSearchParams({
        q: query,
        kl: 'us-en',
      });

      const response = await fetch(`${url}?${params}`, {
        headers: this.headers,
      });

      if (!response.ok) {
        console.warn(`DuckDuckGo search failed with status ${response.status}`);
        return [];
      }

      const html = await response.text();
      return this.parseDuckDuckGoResults(html, numResults);
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return [];
    }
  }

  private parseDuckDuckGoResults(html: string, numResults: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    // Simple regex-based parsing (more reliable than DOM parsing in serverless)
    const resultRegex = /<a[^>]*class="result__a"[^>]*>(.*?)<\/a>/gi;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/gi;
    
    const titleMatches = [...html.matchAll(resultRegex)];
    const snippetMatches = [...html.matchAll(snippetRegex)];

    for (let i = 0; i < Math.min(titleMatches.length, numResults); i++) {
      const titleMatch = titleMatches[i];
      const snippetMatch = snippetMatches[i];

      if (titleMatch) {
        const title = this.stripHtml(titleMatch[1]);
        const urlMatch = titleMatch[0].match(/href="([^"]*)"/);
        const url = urlMatch ? urlMatch[1] : '';
        const snippet = snippetMatch ? this.stripHtml(snippetMatch[1]) : '';

        if (title && url) {
          results.push({ title, url, snippet });
        }
      }
    }

    return results;
  }

  async scrapePageContent(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (!response.ok) return null;

      const html = await response.text();
      
      // Remove script and style tags
      const cleanHtml = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');

      // Extract text content
      const text = this.stripHtml(cleanHtml);
      
      // Clean up whitespace
      const cleanText = text
        .split(/\s+/)
        .filter(word => word.length > 0)
        .join(' ')
        .substring(0, 3000);

      return cleanText;
    } catch (error) {
      console.error('Scrape page error:', error);
      return null;
    }
  }

  async getAnswerFromGoogle(query: string): Promise<string | null> {
    try {
      const results = await this.searchDuckDuckGo(query, 3);

      if (!results.length) return null;

      const answerParts: string[] = [];
      answerParts.push(`**Answer for: ${query}**\n`);

      for (let i = 0; i < Math.min(results.length, 3); i++) {
        const result = results[i];
        
        if (result.snippet) {
          answerParts.push(`\n**Source ${i + 1}: ${result.title}**`);
          answerParts.push(`Snippet: ${result.snippet}`);
        }

        // Try to scrape more content
        const content = await this.scrapePageContent(result.url);
        if (content) {
          answerParts.push(`\nContent: ${content.substring(0, 500)}...`);
        }
      }

      return answerParts.join('\n');
    } catch (error) {
      console.error('Get answer from Google error:', error);
      return null;
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}

export const googleScraper = new GoogleScraper();
