const { v4: uuidv4 } = require("uuid");

/**
 * POST /api/check-url
 * User submits a suspicious URL
 * System checks if it's gambling site or safe site
 */
const checkUrl = async (req, res) => {
  const db = req.app.locals.db;
  const { url } = req.body;

  if (!url || typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ message: "URL is required and must be a non-empty string" });
  }

  const id_submission = uuidv4();
  const id_process = uuidv4();

  try {
    // 1. Insert into url_submission
    const qInsertSubmission = `
      INSERT INTO url_submission (id_submission, url)
      VALUES ($1, $2)
      RETURNING id_submission, url
    `;
    const submissionRes = await db.query(qInsertSubmission, [id_submission, url.trim()]);

    // 2. Call AI predictor to check if gambling site (integrate with AI module)
    // For now, we'll use a placeholder. In production, call AI predictor
    const isGamblingSite = await predictGamblingSite(url);
    const riskScore = isGamblingSite ? 0.85 : 0.15; // Placeholder scores
    const htmlTitle = "Sample Title"; // Would come from actual scraping

    // 3. Insert into result table
    const qInsertResult = `
      INSERT INTO result (id_process, id_submission, html_title, risk_score)
      VALUES ($1, $2, $3, $4)
      RETURNING id_process, html_title, risk_score
    `;
    const resultRes = await db.query(qInsertResult, [id_process, id_submission, htmlTitle, riskScore]);

    // 4. Based on risk_score threshold, insert into situs_judol or situs_aman
    let siteType = "safe";
    const riskThreshold = 0.5;

    if (riskScore >= riskThreshold) {
      siteType = "gambling";
      const qInsertJudol = `
        INSERT INTO situs_judol (id_process)
        VALUES ($1)
        ON CONFLICT DO NOTHING
      `;
      await db.query(qInsertJudol, [id_process]);

      // Optional: Add keywords for gambling sites
      // For now, extracting domain as a simple keyword
      const domain = new URL(url).hostname;
      const qInsertKeyword = `
        INSERT INTO keywords (keyword, id_sitejudol)
        VALUES ($1, $2)
      `;
      await db.query(qInsertKeyword, [domain, id_process]);
    } else {
      const qInsertAman = `
        INSERT INTO situs_aman (id_process)
        VALUES ($1)
        ON CONFLICT DO NOTHING
      `;
      await db.query(qInsertAman, [id_process]);
    }

    return res.status(201).json({
      id_submission,
      id_process,
      url: url.trim(),
      is_gambling: siteType === "gambling",
      risk_score: riskScore,
      html_title: htmlTitle,
      status: "processed",
      site_type: siteType,
    });
  } catch (error) {
    console.error("checkUrl error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Placeholder function to predict if URL is a gambling site
 * In production, integrate with AI module at /ai/predictor.py
 */
const predictGamblingSite = async (url) => {
  // TODO: Integrate with AI predictor
  // For now, simple heuristic: if URL contains gambling keywords
  const gamblingKeywords = ["slot", "casino", "poker", "bet", "gambling", "judol"];
  const urlLower = url.toLowerCase();
  return gamblingKeywords.some((keyword) => urlLower.includes(keyword));
};

/**
 * GET /api/check-url/history
 * Get submission history with pagination
 */
const getSubmissionHistory = async (req, res) => {
  const db = req.app.locals.db;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;

  const qData = `
    SELECT
      us.id_submission,
      us.url,
      r.id_process,
      r.html_title,
      r.risk_score,
      CASE
        WHEN sj.id_process IS NOT NULL THEN 'gambling'
        WHEN sa.id_process IS NOT NULL THEN 'safe'
        ELSE 'unknown'
      END AS site_type,
      us.created_at
    FROM url_submission us
    LEFT JOIN result r ON r.id_submission = us.id_submission
    LEFT JOIN situs_judol sj ON sj.id_process = r.id_process
    LEFT JOIN situs_aman sa ON sa.id_process = r.id_process
    ORDER BY us.created_at DESC NULLS LAST
    LIMIT $1 OFFSET $2
  `;

  const qCount = `
    SELECT COUNT(*)::int AS total
    FROM url_submission
  `;

  try {
    const [dataRes, countRes] = await Promise.all([
      db.query(qData, [limit, offset]),
      db.query(qCount),
    ]);

    const total = countRes.rows[0]?.total || 0;

    return res.json({
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      data: dataRes.rows,
    });
  } catch (error) {
    console.error("getSubmissionHistory error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  checkUrl,
  getSubmissionHistory,
};
