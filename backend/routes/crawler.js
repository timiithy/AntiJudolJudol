const express = require('express');
const router = express.Router();
const { start, status, stop } = require('../controller/crawlerController');

// POST /api/crawler/start
router.post('/start', start);

// GET /api/crawler/status
router.get('/status', status);

// POST /api/crawler/stop (bonus)
router.post('/stop', stop);

module.exports = router;