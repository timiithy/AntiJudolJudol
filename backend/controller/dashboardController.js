/**
 * GET /api/dashboard/stats
 * Dashboard statistics for the new simplified flow
 */
const getDashboardStats = async (req, res) => {
  const db = req.app.locals.db;

  const qTotalGambling = `
    SELECT COUNT(*)::int AS total_gambling
    FROM situs_judol
  `;

  const qTotalSafe = `
    SELECT COUNT(*)::int AS total_safe
    FROM situs_aman
  `;

  const qGamblingToday = `
    SELECT COUNT(*)::int AS gambling_today
    FROM situs_judol sj
    JOIN result r ON r.id_process = sj.id_process
    WHERE DATE(r.created_at) = CURRENT_DATE
  `;

  const qSafeToday = `
    SELECT COUNT(*)::int AS safe_today
    FROM situs_aman sa
    JOIN result r ON r.id_process = sa.id_process
    WHERE DATE(r.created_at) = CURRENT_DATE
  `;

  const qTopGamblingDomains = `
    SELECT
      SUBSTRING(us.url FROM 'https?://([^/]+)') AS domain,
      COUNT(*)::int AS count,
      AVG(r.risk_score)::float AS avg_risk_score
    FROM situs_judol sj
    JOIN result r ON r.id_process = sj.id_process
    JOIN url_submission us ON us.id_submission = r.id_submission
    GROUP BY SUBSTRING(us.url FROM 'https?://([^/]+)')
    ORDER BY count DESC
    LIMIT 5
  `;

  const qAverageRiskScore = `
    SELECT AVG(r.risk_score)::float AS avg_risk_score
    FROM result r
    JOIN situs_judol sj ON sj.id_process = r.id_process
  `;

  try {
    const [
      gamblingRes,
      safeRes,
      gamblingTodayRes,
      safeTodayRes,
      domainsRes,
      riskRes,
    ] = await Promise.all([
      db.query(qTotalGambling),
      db.query(qTotalSafe),
      db.query(qGamblingToday),
      db.query(qSafeToday),
      db.query(qTopGamblingDomains),
      db.query(qAverageRiskScore),
    ]);

    return res.json({
      total_gambling_sites: gamblingRes.rows[0]?.total_gambling || 0,
      total_safe_sites: safeRes.rows[0]?.total_safe || 0,
      gambling_sites_today: gamblingTodayRes.rows[0]?.gambling_today || 0,
      safe_sites_today: safeTodayRes.rows[0]?.safe_today || 0,
      average_risk_score: riskRes.rows[0]?.avg_risk_score || 0,
      top_gambling_domains: domainsRes.rows,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/dashboard/trend
 * Time-series trend of detected gambling and safe sites
 */
const getDashboardTrend = async (req, res) => {
  const db = req.app.locals.db;

  const qTrend = `
    SELECT
      DATE(r.created_at) AS date,
      COUNT(CASE WHEN sj.id_process IS NOT NULL THEN 1 END)::int AS gambling_count,
      COUNT(CASE WHEN sa.id_process IS NOT NULL THEN 1 END)::int AS safe_count,
      (COUNT(CASE WHEN sj.id_process IS NOT NULL THEN 1 END) + 
       COUNT(CASE WHEN sa.id_process IS NOT NULL THEN 1 END))::int AS total_count
    FROM result r
    LEFT JOIN situs_judol sj ON sj.id_process = r.id_process
    LEFT JOIN situs_aman sa ON sa.id_process = r.id_process
    GROUP BY DATE(r.created_at)
    ORDER BY DATE(r.created_at) ASC
  `;

  try {
    const result = await db.query(qTrend);
    return res.json(result.rows);
  } catch (error) {
    console.error("getDashboardTrend error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/dashboard/risk-distribution
 * Risk score distribution for gambling sites
 */
const getRiskDistribution = async (req, res) => {
  const db = req.app.locals.db;

  const qRiskDist = `
    SELECT
      CASE
        WHEN r.risk_score >= 0.8 THEN 'very_high'
        WHEN r.risk_score >= 0.6 THEN 'high'
        WHEN r.risk_score >= 0.4 THEN 'medium'
        WHEN r.risk_score >= 0.2 THEN 'low'
        ELSE 'very_low'
      END AS risk_level,
      COUNT(*)::int AS count,
      ROUND(AVG(r.risk_score)::numeric, 2)::float AS avg_score
    FROM result r
    JOIN situs_judol sj ON sj.id_process = r.id_process
    GROUP BY risk_level
    ORDER BY CASE risk_level
      WHEN 'very_high' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
      WHEN 'very_low' THEN 5
    END
  `;

  try {
    const result = await db.query(qRiskDist);
    return res.json(result.rows);
  } catch (error) {
    console.error("getRiskDistribution error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardTrend,
  getRiskDistribution,
};