const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const postsRoutes = require('./routes/posts');
const crawlerRoutes = require('./routes/crawler');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});
app.locals.db = pool;
app.use(express.json());
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
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});