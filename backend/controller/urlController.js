const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/check-url
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
    console.log("[checkUrl] Processing URL:", url.trim());

    // 2. Panggil AI service terlebih dahulu
    let aiResult;
    try {
      console.log("[checkUrl] Calling AI service at:", AI_SERVICE_URL);
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/classify`, { url: url.trim() });
      console.log("[checkUrl] AI response received:", JSON.stringify(aiResponse.data));

      if (aiResponse.data.status === "error") {
        return res.status(422).json({ message: aiResponse.data.message || "AI gagal memproses URL" });
      }

      // Validasi struktur response AI
      aiResult = aiResponse.data.results;
      if (!aiResult || typeof aiResult !== "object") {
        console.error("[checkUrl] Invalid AI response structure:", aiResult);
        return res.status(422).json({ message: "AI returned invalid structure" });
      }

      console.log("[checkUrl] AI result validated successfully");
    } catch (aiErr) {
      console.error("[checkUrl] AI service error:", aiErr.message);
      if (aiErr.response?.data) {
        console.error("[checkUrl] AI error response:", aiErr.response.data);
      }
      return res.status(503).json({ message: "AI service tidak tersedia, coba lagi nanti" });
    }

    // Extract data dengan fallback values
    const decision = aiResult.decision || "NORMAL";
    const isGambling = decision === "JUDI ONLINE";
    const riskScore = aiResult.score ?? 0;
    const htmlTitle = aiResult.title || "N/A";
    const riskLevel = aiResult.risk_level || "Rendah";
    const category = aiResult.category || "Uncategorized";
    const detectedKeywords = aiResult.detected_keywords || [];
    const detectedAt = aiResult.detected_at || new Date().toISOString();
    const methodUsed = aiResult.method_used || "hybrid";

    console.log("[checkUrl] AI Result parsed - isGambling:", isGambling, "score:", riskScore);

    // Database operations - optional, boleh gagal tanpa mempengaruhi response ke user
    try {
      // 1. Insert ke url_submission
      await db.query(
        `INSERT INTO url_submission (id_submission, url) VALUES ($1, $2)`,
        [id_submission, url.trim()]
      );
      console.log("[checkUrl] URL submission recorded:", id_submission);

      // 3. Insert ke result
      await db.query(
        `INSERT INTO result (id_process, id_submission, html_title, risk_score) VALUES ($1, $2, $3, $4)`,
        [id_process, id_submission, htmlTitle, riskScore]
      );
      console.log("[checkUrl] Result recorded:", id_process);

      // 4. Insert ke situs_judol atau situs_aman
      if (isGambling) {
        await db.query(
          `INSERT INTO situs_judol (id_process) VALUES ($1) ON CONFLICT DO NOTHING`,
          [id_process]
        );
        console.log("[checkUrl] Marked as gambling site");

        // 5. Simpan keywords yang terdeteksi
        for (const kw of detectedKeywords.slice(0, 20)) {
          try {
            await db.query(
              `INSERT INTO keywords (keyword, id_sitejudol) VALUES ($1, $2)`,
              [kw, id_process]
            );
          } catch (kwErr) {
            console.warn("[checkUrl] Failed to insert keyword:", kw, kwErr.message);
          }
        }
      } else {
        await db.query(
          `INSERT INTO situs_aman (id_process) VALUES ($1) ON CONFLICT DO NOTHING`,
          [id_process]
        );
        console.log("[checkUrl] Marked as safe site");
      }
    } catch (dbErr) {
      console.warn("[checkUrl] Database operation failed (non-critical):", dbErr.message);
      // Jangan berhenti di sini, tetap return response ke user
    }

    // 6. Return hasil lengkap ke FE
    const responseData = {
      id_submission,
      id_process,
      url: url.trim(),
      is_gambling: isGambling,
      risk_score: riskScore,
      risk_level: riskLevel,
      category,
      html_title: htmlTitle,
      detected_keywords: detectedKeywords,
      detected_at: detectedAt,
      method_used: methodUsed,
      site_type: isGambling ? "gambling" : "safe",
    };

    console.log("[checkUrl] Sending response:", JSON.stringify(responseData));
    return res.status(201).json(responseData);

  } catch (error) {
    console.error("[checkUrl] Unexpected error:", error.message);
    console.error("[checkUrl] Error details:", error.stack);
    return res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

/**
 * GET /api/check-url/history
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

  const qCount = `SELECT COUNT(*)::int AS total FROM url_submission`;

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

module.exports = { checkUrl, getSubmissionHistory };