"""
Google Search Scraper - Scrapes Google search results for educational content
"""
import asyncio
import aiohttp
from typing import Optional, List, Dict
import logging
from bs4 import BeautifulSoup
import re

logger = logging.getLogger(__name__)

class GoogleScraper:
    """Scrape Google search results for educational answers"""
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    
    async def search_google(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        Search Google and return top results
        
        Args:
            query: Search query
            num_results: Number of results to return
            
        Returns:
            List of dictionaries with title, url, snippet
        """
        try:
            # Try DuckDuckGo first (more scraper-friendly)
            results = await self.search_duckduckgo(query, num_results)
            if results:
                return results
                
            # Fallback to Google
            async with aiohttp.ClientSession() as session:
                # Google search URL
                url = "https://www.google.com/search"
                params = {
                    "q": query,
                    "num": num_results * 2,  # Get more to filter
                    "hl": "en"
                }
                
                async with session.get(url, params=params, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        logger.warning(f"Google search failed with status {resp.status}")
                        return []
                    
                    html = await resp.text()
                    return self._parse_google_results(html, num_results)
                    
        except Exception as e:
            logger.error(f"Google search error: {e}")
            return []
    
    async def search_duckduckgo(self, query: str, num_results: int = 5) -> List[Dict]:
        """
        Search DuckDuckGo (more scraper-friendly alternative)
        
        Args:
            query: Search query
            num_results: Number of results to return
            
        Returns:
            List of dictionaries with title, url, snippet
        """
        try:
            async with aiohttp.ClientSession() as session:
                url = "https://html.duckduckgo.com/html/"
                params = {
                    "q": query,
                    "kl": "us-en"
                }
                
                async with session.get(url, params=params, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        logger.warning(f"DuckDuckGo search failed with status {resp.status}")
                        return []
                    
                    html = await resp.text()
                    return self._parse_duckduckgo_results(html, num_results)
                    
        except Exception as e:
            logger.error(f"DuckDuckGo search error: {e}")
            return []
    
    def _parse_duckduckgo_results(self, html: str, num_results: int) -> List[Dict]:
        """Parse DuckDuckGo search results from HTML"""
        results = []
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find all result divs
        result_divs = soup.find_all('div', class_='result')
        
        for div in result_divs[:num_results]:
            try:
                # Extract title
                title_elem = div.find('a', class_='result__a')
                title = title_elem.get_text() if title_elem else "No title"
                
                # Extract URL
                url = title_elem.get('href') if title_elem else ""
                
                # Extract snippet
                snippet_elem = div.find('a', class_='result__snippet')
                snippet = snippet_elem.get_text() if snippet_elem else ""
                
                if title and url:
                    results.append({
                        "title": title,
                        "url": url,
                        "snippet": snippet
                    })
                    
            except Exception as e:
                logger.warning(f"Error parsing DuckDuckGo result: {e}")
                continue
        
        return results
    
    def _parse_google_results(self, html: str, num_results: int) -> List[Dict]:
        """Parse Google search results from HTML"""
        results = []
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find all search result divs
        search_divs = soup.find_all('div', {'class': re.compile(r'g\s+')})
        
        for div in search_divs[:num_results]:
            try:
                # Extract title
                title_elem = div.find('h3')
                title = title_elem.get_text() if title_elem else "No title"
                
                # Extract URL
                link_elem = div.find('a')
                url = link_elem.get('href') if link_elem else ""
                
                # Clean URL (remove Google redirect)
                if url.startswith('/url?'):
                    url = url.split('&')[0].replace('/url?q=', '')
                
                # Extract snippet
                snippet_elem = div.find('div', {'class': re.compile(r'VwiC3b|st')})
                snippet = snippet_elem.get_text() if snippet_elem else ""
                
                if title and url:
                    results.append({
                        "title": title,
                        "url": url,
                        "snippet": snippet
                    })
                    
            except Exception as e:
                logger.warning(f"Error parsing result: {e}")
                continue
        
        return results
    
    async def scrape_page_content(self, url: str) -> Optional[str]:
        """
        Scrape content from a specific URL
        
        Args:
            url: URL to scrape
            
        Returns:
            Page text content
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        return None
                    
                    html = await resp.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Remove script and style elements
                    for script in soup(["script", "style", "nav", "footer", "header"]):
                        script.decompose()
                    
                    # Get text
                    text = soup.get_text()
                    
                    # Clean up text
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    text = ' '.join(chunk for chunk in chunks if chunk)
                    
                    return text[:3000]  # Limit to 3000 characters
                    
        except Exception as e:
            logger.error(f"Scrape page error for {url}: {e}")
            return None
    
    async def get_answer_from_google(self, query: str) -> Optional[str]:
        """
        Get comprehensive answer by searching Google and scraping top results
        
        Args:
            query: Student's question
            
        Returns:
            Formatted answer with sources
        """
        try:
            # Search Google
            results = await self.search_google(query, num_results=3)
            
            if not results:
                return None
            
            # Scrape content from top results
            answer_parts = []
            answer_parts.append(f"**Answer for: {query}**\n")
            
            for i, result in enumerate(results[:3], 1):
                # Add snippet from search result
                if result.get("snippet"):
                    answer_parts.append(f"\n**Source {i}: {result['title']}**")
                    answer_parts.append(f"Snippet: {result['snippet']}")
                
                # Try to scrape more content
                content = await self.scrape_page_content(result["url"])
                if content:
                    answer_parts.append(f"\nContent: {content[:500]}...")
            
            return "\n".join(answer_parts)
            
        except Exception as e:
            logger.error(f"Get answer from Google error: {e}")
            return None
    
    async def search_bangla_educational(self, query: str) -> Optional[str]:
        """
        Search Bangla educational content specifically
        
        Args:
            query: Search query (can be in Bangla or English)
            
        Returns:
            Educational content relevant to Bangla students
        """
        # Add educational context to query
        educational_query = f"{query} educational solution explanation"
        
        return await self.get_answer_from_google(educational_query)

google_scraper = GoogleScraper()
