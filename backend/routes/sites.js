const express = require("express");
const router = express.Router();

const {
  listGamblingSites,
  listSafeSites,
  exportGamblingSites,
  exportSafeSites,
} = require("../controller/siteController");

// Gambling sites routes
router.get("/gambling-sites", listGamblingSites);
router.get("/gambling-sites/export", exportGamblingSites);

// Safe sites routes
router.get("/safe-sites", listSafeSites);
router.get("/safe-sites/export", exportSafeSites);

module.exports = router;
