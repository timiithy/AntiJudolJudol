const getDashboardStats = async (req, res) => {
  const db = req.app.locals.db;

  // Parameterized values
  const topLimit = 5;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const qTotalSites = `
    SELECT COUNT(*)::int AS total_sites
    FROM gambling_site
  `;

  const qSitesToday = `
    SELECT COUNT(*)::int AS sites_today
    FROM gambling_site
    WHERE tanggal_detect::date = $1::date
  `;

  const qTopDomains = `
    SELECT domain, COUNT(*)::int AS count
    FROM gambling_site
    GROUP BY domain
    ORDER BY count DESC
    LIMIT $1
  `;

  const qTopCountries = `
    SELECT country_origin AS country, COUNT(*)::int AS count
    FROM gambling_site
    GROUP BY country_origin
    ORDER BY count DESC
    LIMIT $1
  `;

  try {
    const [totalRes, todayRes, domainsRes, countriesRes] = await Promise.all([
      db.query(qTotalSites),
      db.query(qSitesToday, [today]),
      db.query(qTopDomains, [topLimit]),
      db.query(qTopCountries, [topLimit]),
    ]);

    return res.json({
      total_sites: totalRes.rows[0]?.total_sites || 0,
      sites_today: todayRes.rows[0]?.sites_today || 0,
      top_domains: domainsRes.rows,
      top_countries: countriesRes.rows,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getDashboardTrend = async (req, res) => {
  const db = req.app.locals.db;

  const qTrend = `
    SELECT
      DATE(tanggal_detect) AS date,
      COUNT(*)::int AS count
    FROM gambling_site
    GROUP BY DATE(tanggal_detect)
    ORDER BY DATE(tanggal_detect) ASC
  `;

  try {
    const result = await db.query(qTrend);
    return res.json(result.rows);
  } catch (error) {
    console.error("getDashboardTrend error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardTrend,
};