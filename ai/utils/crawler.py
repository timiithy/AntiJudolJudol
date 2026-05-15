import asyncio
import requests
from bs4 import BeautifulSoup
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
}

BLOCK_SIGNALS = [
    'security verification', 'verify you are a human',
    'performing security check', 'cloudflare',
    'access denied', 'enable javascript',
    'please wait while we check',
]

async def scrape_site(url: str) -> dict:
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    # Jalankan requests di thread pool agar tidak block event loop
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _requests_scrape, url)

def _requests_scrape(url: str) -> dict:
    try:
        resp = requests.get(url, timeout=15, verify=False, headers=HEADERS)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, 'lxml')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()

        title = soup.title.string.strip() if soup.title and soup.title.string else ''
        content = soup.get_text(separator=' ', strip=True)

        # Deteksi halaman blokir/cloudflare
        content_lower = content.lower()
        is_blocked = any(sig in content_lower for sig in BLOCK_SIGNALS) and len(content.split()) < 200
        if is_blocked:
            return {'url': url, 'status': 'blocked', 'error': 'Halaman terblokir (Cloudflare/security check)', 'word_count': 0}

        return {
            'url': url,
            'title': title,
            'content': content,
            'word_count': len(content.split()),
            'status': 'success'
        }

    except requests.exceptions.Timeout:
        return {'url': url, 'status': 'error', 'error': 'Request timeout (15s)', 'word_count': 0}
    except requests.exceptions.ConnectionError:
        return {'url': url, 'status': 'error', 'error': 'Tidak bisa terhubung ke URL', 'word_count': 0}
    except Exception as e:
        return {'url': url, 'status': 'error', 'error': str(e), 'word_count': 0}