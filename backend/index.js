const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const postsRoutes = require('./routes/posts');
const crawlerRoutes = require('./routes/crawler');

const app = express();
const PORT = process.env.PORT || 5000;

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API Backend berjalan!' });
});
app.use('/api/posts', postsRoutes);
app.use('/api/crawler', crawlerRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});