import asyncio
from playwright.async_api import async_playwright
import requests
from bs4 import BeautifulSoup

async def scrape_site(url):
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent="Mozilla/5.0...")
            page = await context.new_page()
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            title = await page.title()
            content = await page.evaluate("document.body.innerText")
            await browser.close()
            return {"url": url, "title": title, "content": content, "status": "success"}
    except Exception as e:
        return {"url": url, "status": "error", "error": str(e)}