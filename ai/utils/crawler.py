"""
utils/crawler.py — Web Crawler (Optimized)
================================
Crawl website dengan Playwright (utama) atau requests (fallback).
Optimasi: Menunggu render JavaScript (networkidle) untuk menghindari "konten minim".
"""

import re, logging, asyncio, sys
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

sys.dont_write_bytecode = True 
logger = logging.getLogger(__name__)

async def crawl_website(url: str, max_internal: int = 2, timeout: int = 40000) -> dict:
    """
    Crawl URL dan kembalikan konten teks dengan optimasi render JS.
    """
    try:
        from playwright.async_api import async_playwright
        return await _playwright_crawl(url, max_internal, timeout)
    except ImportError:
        logger.debug("Playwright tidak tersedia, fallback ke requests.")
        return await _requests_crawl(url)

# ── Playwright ───────────────────────────────────────────────────────────────
async def _playwright_crawl(url: str, max_internal: int = 2, timeout: int = 60000) -> dict:
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

    async with async_playwright() as p:
        browser = None
        try:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-features=IsolateOrigins,site-per-process",
                ]
            )
            ctx = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
                viewport={'width': 1366, 'height': 768},
                ignore_https_errors=True,
            )

            # Stealth lebih lanjut (opsional tapi sangat membantu)
            await ctx.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3]});
            """)

            page = await ctx.new_page()

            # === STRATEGI WAIT YANG LEBIH BAIK ===
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=timeout)
            except PlaywrightTimeout:
                await page.goto(url, wait_until="load", timeout=timeout)

            # Tunggu body muncul
            await page.wait_for_selector("body", timeout=10000)

            # Tambahan wait yang efektif untuk situs judi:
            await asyncio.sleep(4)  # beri waktu JS render

            # Scroll ke bawah untuk trigger lazy load
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            await page.evaluate("window.scrollTo(0, 0)")

            # Ambil teks dengan cara yang lebih baik
            main_text = await page.evaluate("""() => {
                // Prioritaskan visible text + hapus script/style
                return document.body.innerText || document.body.textContent || "";
            }""")

            title = await page.title()

            # Sub-pages (jika masih mau)
            texts = [main_text]
            if max_internal > 0:
                links = _links(BeautifulSoup(await page.content(), "html.parser"), url)[:max_internal]
                for link in links:
                    try:
                        await page.goto(link, wait_until="domcontentloaded", timeout=15000)
                        await asyncio.sleep(2)
                        sub_text = await page.evaluate("() => document.body.innerText || ''")
                        texts.append(sub_text[:3000])
                    except Exception:
                        continue

            await browser.close()

        except Exception as e:
            if browser:
                await browser.close()
            logger.warning(f"Playwright error on {url}: {e}")
            return await _requests_crawl(url)

    content = _normalize(" ".join(filter(None, [title, *texts])))
    word_count = len(content.split())

    return {
        "url": url,
        "title": title,
        "content": content,
        "word_count": word_count,
        "pages_crawled": len(texts),
        "status": "success",
    }

# ── Requests fallback ─────────────────────────────────────────────────────────
async def _requests_crawl(url: str) -> dict:
    try:
        import requests
        # Beberapa situs judi blokir UA default, pakai yang mirip browser asli
        resp = requests.get(
            url, timeout=15, verify=False,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}
        )
        resp.raise_for_status()
        soup    = _parse(resp.text)
        title   = _title(soup)
        content = _normalize(f"{title} {_text(soup)}")
        return {
            "url": url, "title": title, "content": content,
            "word_count": len(content.split()), "pages_crawled": 1, "status": "success (fallback)"
        }
    except Exception as e:
        return {
            "url": url, "title": "", "content": "", "word_count": 0,
            "pages_crawled": 0, "status": "error", "error": str(e)
        }

# ── Helpers ───────────────────────────────────────────────────────────────────
def _parse(html: str) -> BeautifulSoup:
    soup = BeautifulSoup(html, "html.parser")
    # Hapus elemen yang benar-benar sampah. 
    # Nav dan Footer jangan dihapus dulu karena kadang teks promosi judi ada di sana.
    for tag in soup(["script", "style", "noscript", "iframe"]):
        tag.decompose()
    return soup

def _title(soup: BeautifulSoup) -> str:
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    return ""

def _text(soup: BeautifulSoup) -> str:
    # Prioritaskan area konten utama jika ada
    main = soup.find("main") or soup.find("article") or soup.find("body")
    return (main or soup).get_text(separator=" ", strip=True)

def _links(soup: BeautifulSoup, base: str) -> list:
    base_domain = urlparse(base).netloc
    links = []
    for a in soup.find_all("a", href=True):
        full = urljoin(base, a["href"])
        p    = urlparse(full)
        # Hanya ambil link dari domain yang sama
        if (p.netloc == base_domain and p.scheme in ("http", "https")
                and not re.search(r"\.(jpg|jpeg|png|pdf|zip|mp4|css|js)$", p.path, re.I)
                and full.strip("/") != base.strip("/") 
                and full not in links):
            links.append(full)
        if len(links) >= 5: # Limit pencarian sub-page
            break
    return links

def _normalize(text: str, max_words: int = 5000) -> str:
    # Hapus whitespace berlebih dan simbol aneh
    text = re.sub(r"\s+", " ", text)
    words = text.strip().split()
    return " ".join(words[:max_words])