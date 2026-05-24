const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDashboardTrend,
  getRiskDistribution,
  getKeywordCloud,
} = require("../controller/dashboardController");

router.get("/stats", getDashboardStats);
router.get("/trend", getDashboardTrend);
router.get("/risk-distribution", getRiskDistribution);
router.get("/keywords", getKeywordCloud);

module.exports = router;