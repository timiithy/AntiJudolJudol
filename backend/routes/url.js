const express = require("express");
const router = express.Router();

const {
  checkUrl,
  getSubmissionHistory,
} = require("../controller/urlController");

// POST /api/check-url
// Submit a URL to check if it's a gambling site
router.post("/", checkUrl);

// GET /api/check-url/history
// Get submission history
router.get("/history", getSubmissionHistory);

module.exports = router;
