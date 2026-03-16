const express = require("express");
const router = express.Router();
const {
  start,
  status,
  stop,
  scanUrl,
  getScanResult,
} = require("../controller/crawlerController");

// POST /api/crawler/start
router.post("/start", start);

// GET /api/crawler/status
router.get("/status", status);

// POST /api/crawler/stop (bonus)
router.post("/stop", stop);

// POST /api/scan-url
router.post("/scan-url", scanUrl);

// GET /api/scan-result/:submission_id
router.get("/scan-result/:submission_id", getScanResult);

module.exports = router;
