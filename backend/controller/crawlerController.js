const { startCrawler, stopCrawler, getStatus } = require('../workers/crawlerWorker');

const start = async (req, res) => {
  try {
    await startCrawler();
    return res.status(200).json({ message: 'Crawler berhasil dimulai!', status: getStatus() });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal menjalankan crawler', error: err.message });
  }
};

const status = (req, res) => {
  return res.status(200).json({ status: getStatus() });
};

const stop = (req, res) => {
  stopCrawler();
  return res.status(200).json({ message: 'Crawler dihentikan.', status: getStatus() });
};

module.exports = { start, status, stop };