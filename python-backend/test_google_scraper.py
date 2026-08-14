"""
Test Google Scraper
"""
import asyncio
from google_scraper import google_scraper

async def test_google_scraper():
    """Test Google scraper with a sample query"""
    print("Testing Google Scraper...")
    
    # Test with a simple educational query
    query = "What is photosynthesis?"
    print(f"\nQuery: {query}")
    
    result = await google_scraper.get_answer_from_google(query)
    
    if result:
        print("\n✅ Success! Answer retrieved:")
        print(result[:500])
    else:
        print("\n❌ Failed to retrieve answer")

if __name__ == "__main__":
    asyncio.run(test_google_scraper())
