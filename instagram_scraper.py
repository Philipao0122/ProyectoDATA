import asyncio
from playwright.async_api import async_playwright
import sys

async def scrape_instagram_posts(profile_url: str):
    """
    Scrapes Instagram profile for post elements with class '_aagw'
    
    Args:
        profile_url (str): URL of the Instagram profile to scrape
    """
    # Create a browser instance
    async with async_playwright() as p:
        # Launch browser in non-headless mode to see what's happening
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        
        # Create a new page
        page = await context.new_page()
        
        try:
            # Navigate to the Instagram profile
            print(f"Navigating to {profile_url}...")
            await page.goto(profile_url)
            
            # Wait for the posts to load
            print("Waiting for posts to load...")
            await page.wait_for_selector('div._aagw', timeout=30000)  # 30 seconds timeout
            
            # Get all post elements
            post_elements = await page.query_selector_all('div._aagw')
            print(f"Found {len(post_elements)} post elements")
            
            # Extract and print information about each post
            for i, post in enumerate(post_elements, 1):
                # Get the post URL if available
                post_link = await post.query_selector('a')
                if post_link:
                    href = await post_link.get_attribute('href')
                    print(f"\nPost {i}:")
                    print(f"URL: https://www.instagram.com{href if href else 'N/A'}")
                    
                    # Get the image URL if available
                    img = await post.query_selector('img')
                    if img:
                        img_src = await img.get_attribute('src')
                        print(f"Image URL: {img_src}")
            
            print("\nScraping completed!")
            
        except Exception as e:
            print(f"An error occurred: {str(e)}")
        finally:
            # Close the browser
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python instagram_scraper.py <instagram_profile_url>")
        sys.exit(1)
    
    profile_url = sys.argv[1]
    asyncio.run(scrape_instagram_posts(profile_url))
