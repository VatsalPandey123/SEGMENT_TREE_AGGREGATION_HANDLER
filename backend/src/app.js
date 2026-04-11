const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

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
