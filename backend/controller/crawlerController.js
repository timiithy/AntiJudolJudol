const pool = require("../db/db");
const {
  startCrawler,
  stopCrawler,
  getStatus,
} = require("../workers/crawlerWorker");

const start = async (req, res) => {
  try {
    await startCrawler();
    return res
      .status(200)
      .json({ message: "Crawler berhasil dimulai!", status: getStatus() });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal menjalankan crawler", error: err.message });
  }
};

const status = (req, res) => {
  return res.status(200).json({ status: getStatus() });
};

const stop = (req, res) => {
  stopCrawler();
  return res
    .status(200)
    .json({ message: "Crawler dihentikan.", status: getStatus() });
};

// POST /api/scan-url
const scanUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: "URL is required",
      });
    }

    const query = `
      INSERT INTO user_submitted_url (url, submitted_at, status)
      VALUES ($1, NOW(), $2)
      RETURNING submission_id
    `;

    const values = [url, "processing"];

    const result = await pool.query(query, values);

    return res.json({
      submission_id: result.rows[0].submission_id,
      status: "processing",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// GET /api/scan-result/:submission_id
const getScanResult = async (req, res) => {
  try {
    const { submission_id } = req.params;

    const query = `
      SELECT
        u.url,
        s.scrape_id,
        g.probability_score,
        g.kategori,
        g.country_origin
      FROM user_submitted_url u
      LEFT JOIN scrape_user_submitted s
        ON u.submission_id = s.submission_id
      LEFT JOIN gambling_site g
        ON s.scrape_id = g.scrape_id
      WHERE u.submission_id = $1
    `;

    const result = await pool.query(query, [submission_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Submission not found",
      });
    }

    const data = result.rows[0];

    const url = data.url;

    // if still processing
    if (!data.scrape_id) {
      return res.json({
        url,
        status: "processing",
      });
    }

    // NOT gambling
    if (!data.probability_score) {
      return res.json({
        url,
        status: "Aman",
        probability: 0.12,
      });
    }

    // gambling detected
    return res.json({
      url,
      status: "Tidak Aman",
      probability: data.probability_score,
      category: data.kategori,
      country_origin: data.country_origin,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = { start, status, stop, scanUrl, getScanResult };
