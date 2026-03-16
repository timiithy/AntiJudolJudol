const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDashboardTrend,
} = require("../controller/dashboardController");

router.get("/stats", getDashboardStats);
router.get("/trend", getDashboardTrend);

module.exports = router;