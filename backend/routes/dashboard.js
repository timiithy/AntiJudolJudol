const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDashboardTrend,
  getRiskDistribution,
} = require("../controller/dashboardController");

router.get("/stats", getDashboardStats);
router.get("/trend", getDashboardTrend);
router.get("/risk-distribution", getRiskDistribution);

module.exports = router;