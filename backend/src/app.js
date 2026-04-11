const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/api/debug', (req, res) => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'not set';
  const masked = mongoUri === 'not set' ? 'not set' : mongoUri.substring(0, 20) + '...' + mongoUri.substring(mongoUri.length - 20);
  res.json({
    env_mongo_uri: process.env.MONGO_URI ? 'set' : 'not set',
    env_mongodb_uri: process.env.MONGODB_URI ? 'set' : 'not set',
    masked_uri: masked,
    node_env: process.env.NODE_ENV
  });
});

app.get('/api/test-db', async (req, res) => {
  const mongoose = require('mongoose');
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  try {
    if (mongoose.connection.readyState === 1) {
      return res.json({ status: 'connected', host: mongoose.connection.host });
    }
    
    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    res.json({ status: 'connected', host: conn.connection.host });
  } catch (error) {
    res.status(500).json({ 
      status: 'failed', 
      error: error.message,
      name: error.name 
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Segment Tree Aggregation Handler API',
    version: '1.0.0',
    endpoints: {
      queries: {
        sum: 'GET /api/sum?l={left}&r={right}',
        min: 'GET /api/min?l={left}&r={right}',
        max: 'GET /api/max?l={left}&r={right}',
        compare: 'GET /api/compare?l={left}&r={right}'
      },
      mutations: {
        update: 'POST /api/update { l, r, val }',
        setArray: 'POST /api/array { array: [...] }'
      },
      state: {
        get: 'GET /api/state',
        reset: 'GET /api/reset'
      }
    }
  });
});

module.exports = app;
