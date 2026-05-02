const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const alertObserver  = require('./observers/alertObserver');
const alertHandler   = require('./observers/alertHandler');
alertObserver.subscribe(alertHandler);

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', require('./routes/health.routes'));
app.use('/api/countries', require('./routes/countries.routes'));
app.use('/api/indicators', require('./routes/indicators.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/ranking', require('./routes/ranking.routes'));
app.use('/api/compare', require('./routes/compare.routes'));
app.use('/api/alerts', require('./routes/alerts.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/etl', require('./routes/etl.routes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
