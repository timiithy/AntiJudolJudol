const parsePositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const escapeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

const buildCsv = (rows, columns) => {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsv(row[c])).join(","));
  return [header, ...lines].join("\n");
};

/**
 * GET /api/gambling-sites
 * List all detected gambling sites with pagination
 */
const listGamblingSites = async (req, res) => {
  const db = req.app.locals.db;
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);
  const offset = (page - 1) * limit;

  const qData = `
    SELECT
      sj.id_process,
      us.id_submission,
      us.url,
      r.html_title,
      r.risk_score,
      us.created_at,
      string_agg(DISTINCT k.keyword, ', ') AS keywords
    FROM situs_judol sj
    JOIN result r ON r.id_process = sj.id_process
    JOIN url_submission us ON us.id_submission = r.id_submission
    LEFT JOIN keywords k ON k.id_situsjudol = sj.id_situsjudol
    GROUP BY sj.id_process, us.id_submission, us.url, r.html_title, r.risk_score, us.created_at
    ORDER BY us.created_at DESC NULLS LAST
    LIMIT $1 OFFSET $2
  `;

  const qCount = `
    SELECT COUNT(*)::int AS total
    FROM situs_judol sj
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
    console.error("listGamblingSites error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/safe-sites
 * List all detected safe sites with pagination
 */
const listSafeSites = async (req, res) => {
  const db = req.app.locals.db;
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);
  const offset = (page - 1) * limit;

  const qData = `
    SELECT
      sa.id_process,
      us.id_submission,
      us.url,
      r.html_title,
      r.risk_score,
      us.created_at
    FROM situs_aman sa
    JOIN result r ON r.id_process = sa.id_process
    JOIN url_submission us ON us.id_submission = r.id_submission
    ORDER BY us.created_at DESC NULLS LAST
    LIMIT $1 OFFSET $2
  `;

  const qCount = `
    SELECT COUNT(*)::int AS total
    FROM situs_aman sa
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
    console.error("listSafeSites error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/gambling-sites/export
 * Export all gambling sites as CSV
 */
const exportGamblingSites = async (req, res) => {
  const db = req.app.locals.db;

  const qExport = `
    SELECT
      sj.id_process,
      us.id_submission,
      us.url,
      r.html_title,
      r.risk_score,
      us.created_at,
      string_agg(DISTINCT k.keyword, ', ') AS keywords
    FROM situs_judol sj
    JOIN result r ON r.id_process = sj.id_process
    JOIN url_submission us ON us.id_submission = r.id_submission
    LEFT JOIN keywords k ON k.id_situsjudol = sj.id_situsjudol
    GROUP BY sj.id_process, us.id_submission, us.url, r.html_title, r.risk_score, us.created_at
    ORDER BY us.created_at DESC NULLS LAST
  `;

  try {
    const result = await db.query(qExport);

    if (result.rows.length === 0) {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="gambling_sites.csv"`);
      return res.status(200).send("No data");
    }

    const columns = result.fields.map((f) => f.name);
    const csv = buildCsv(result.rows, columns);

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="gambling_sites_${stamp}.csv"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error("exportGamblingSites error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/safe-sites/export
 * Export all safe sites as CSV
 */
const exportSafeSites = async (req, res) => {
  const db = req.app.locals.db;

  const qExport = `
    SELECT
      sa.id_process,
      us.id_submission,
      us.url,
      r.html_title,
      r.risk_score,
      us.created_at
    FROM situs_aman sa
    JOIN result r ON r.id_process = sa.id_process
    JOIN url_submission us ON us.id_submission = r.id_submission
    ORDER BY us.created_at DESC NULLS LAST
  `;

  try {
    const result = await db.query(qExport);

    if (result.rows.length === 0) {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="safe_sites.csv"`);
      return res.status(200).send("No data");
    }

    const columns = result.fields.map((f) => f.name);
    const csv = buildCsv(result.rows, columns);

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="safe_sites_${stamp}.csv"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error("exportSafeSites error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  listGamblingSites,
  listSafeSites,
  exportGamblingSites,
  exportSafeSites,
};
