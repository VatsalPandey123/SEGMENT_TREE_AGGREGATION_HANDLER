require('dotenv').config();
const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');
const mongoService = require('../backend/src/services/mongoService');
const segmentTreeService = require('../backend/src/services/segmentTreeService');

let initialized = false;

async function initializeApp() {
  if (initialized) return;
  
  try {
    const mongoConnected = await connectDB();
    
    if (mongoConnected) {
      const dbArray = await mongoService.getAll();
      
      if (dbArray.length > 0) {
        segmentTreeService.setArray(dbArray);
      } else {
        await mongoService.setArray(segmentTreeService.getArray());
      }
    }
    
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

// Initialize on first request
app.use(async (req, res, next) => {
  if (!initialized) {
    await initializeApp();
  }
  next();
});

module.exports = app;
