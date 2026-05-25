import asyncio
import requests
from bs4 import BeautifulSoup
import urllib3
from urllib.parse import urlparse
import re

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

STANDARD_PORTS = {
    'http': [80, None],
    'https': [443, None],
}

def validate_url(url: str) -> dict | None:
    """
    Validasi URL sebelum di-crawl.
    Return dict error jika tidak valid, None jika valid.
    """
    # Input kosong
    if not url or not url.strip():
        return {'url': url, 'status': 'invalid', 'error': 'URL tidak boleh kosong'}

    # Tambahkan scheme jika tidak ada
    if not url.startswith(('http://', 'https://')):
        url_with_scheme = 'https://' + url
    else:
        url_with_scheme = url

    parsed = urlparse(url_with_scheme)

    # Harus punya domain yang valid
    # Cek karakter tidak valid atau bukan link
    if not parsed.netloc:
        return {'url': url, 'status': 'invalid', 'error': 'Format URL tidak valid. Masukkan URL yang lengkap (misal: https://example.com)'}

    # Cek karakter aneh di URL ($$, spasi, dll)
    if re.search(r'[\s\$\^\*\!\#\@\%]', url_with_scheme):
        return {'url': url, 'status': 'invalid', 'error': 'Format URL tidak valid. Periksa kembali URL Anda.'}

    # Netloc harus mengandung titik (bukan sekadar kata)
    # misal "judionline" tanpa TLD → tidak valid
    if '.' not in parsed.netloc.split(':')[0]:
        return {'url': url, 'status': 'invalid', 'error': 'Format URL tidak valid. Domain harus mengandung TLD (misal: .com, .net)'}

    # Port non-standar
    port = parsed.port
    scheme = parsed.scheme
    if port is not None and port not in STANDARD_PORTS.get(scheme, []):
        return {
            'url': url_with_scheme,
            'status': 'non_standard_port',
            'error': f'❌ Port non-standar ({port}) terdeteksi. Situs ini menggunakan port tidak umum yang mencurigakan dan tidak bisa dianalisis.'
        }

    return None  # valid


async def scrape_site(url: str) -> dict:
    # Normalisasi scheme dulu
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    # Validasi sebelum request
    error = validate_url(url)
    if error:
        return error

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _requests_scrape, url)


def _requests_scrape(url: str) -> dict:
    try:
        resp = requests.get(url, timeout=15, verify=False, headers=HEADERS)

        # Handle 404 dan HTTP error lainnya
        if resp.status_code == 404:
            return {'url': url, 'status': 'error', 'error': 'URL tidak dapat diakses (404 Not Found)', 'word_count': 0}
        
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

        word_count = len(content.split())

        # Konten terlalu sedikit - REJECT karena tidak cukup data untuk analisis
        if word_count < 50:
            return {
                'url': url,
                'status': 'thin_content',
                'error': f'❌ Konten tidak cukup untuk dianalisis. Halaman hanya memiliki {word_count} kata (minimum 50 kata diperlukan). Halaman ini terlalu kosong atau tidak bisa diproses.',
                'word_count': word_count
            }

        return {
            'url': url,
            'title': title,
            'content': content,
            'word_count': word_count,
            'status': 'success'
        }

    except requests.exceptions.Timeout:
        return {'url': url, 'status': 'error', 'error': '❌ Server tidak merespons (timeout 15 detik). URL tidak dapat diakses.', 'word_count': 0}
    except requests.exceptions.ConnectionError:
        return {'url': url, 'status': 'error', 'error': '❌ URL tidak dapat diakses. Periksa kembali URL atau coba lagi nanti.', 'word_count': 0}
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return {'url': url, 'status': 'error', 'error': f'❌ Halaman tidak ditemukan (404). URL yang Anda cek tidak ada atau sudah dihapus.', 'word_count': 0}
        return {'url': url, 'status': 'error', 'error': f'❌ URL tidak dapat diakses (Error {e.response.status_code}). Coba lagi nanti.', 'word_count': 0}
    except Exception as e:
        return {'url': url, 'status': 'error', 'error': f'❌ Gagal memproses URL: {str(e)}', 'word_count': 0}
