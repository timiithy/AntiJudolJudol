let crawlerStatus = 'idle'; // idle | running | stopped

async function startCrawler() {
  if (crawlerStatus === 'running') {
    console.log('Crawler sudah berjalan.');
    return;
  }

  crawlerStatus = 'running';
  console.log('Crawler dimulai...');

  // Simulasi crawler berjalan di background
  // Modifikasi sesuai sama crawler yang mau dipake
  const interval = setInterval(async () => {
    if (crawlerStatus !== 'running') {
      clearInterval(interval);
      console.log('Crawler dihentikan.');
      return;
    }

    console.log('Crawler sedang mendeteksi URL baru...');
    // SETELAH BUAT DB, KERJAIN ===> Logika crawling di sini: Detect URL baru -> Insert ke tabel url -> Queue scraping job

  }, 5000);
}

function stopCrawler() {
  crawlerStatus = 'stopped';
}

function getStatus() {
  return crawlerStatus;
}

module.exports = { startCrawler, stopCrawler, getStatus };