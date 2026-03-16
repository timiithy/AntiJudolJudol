const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadCSV } = require('../controller/postController');

// POST /api/posts/upload-csv
router.post('/upload-csv', upload.single('file'), uploadCSV);

module.exports = router;