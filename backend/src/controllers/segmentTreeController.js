const segmentTreeService = require('../services/segmentTreeService');
const mongoService = require('../services/mongoService');

function queryHandler(queryType, l, r) {
  const result = segmentTreeService[`query${queryType.charAt(0).toUpperCase() + queryType.slice(1)}`](l, r);
  return result;
}

async function updateHandler(l, r, val) {
  const updateResult = segmentTreeService.updateRange(l, r, val);
  if (!updateResult.success) {
    return updateResult;
  }

  const mongoResult = await mongoService.updateRange(l, r, val);
  if (!mongoResult.success) {
    return {
      success: true,
      warning: mongoResult.error
    };
  }

  return { success: true };
}
// This handler sets the entire array and rebuilds the segment tree and MongoDB collection

async function setArrayHandler(arr) {
  const segmentResult = segmentTreeService.setArray(arr);
  if (!segmentResult.success) {
    return segmentResult;
  }

  const mongoResult = await mongoService.setArray(arr);
  if (!mongoResult.success) {
    return {
      success: true,
      warning: mongoResult.error
    };
  }

  return segmentResult;
}
// This handler compares the results of segment tree queries with MongoDB queries for the same range and returns a detailed report
async function compareHandler(l, r) {
  const segmentSumResult = segmentTreeService.querySum(l, r);
  if (!segmentSumResult.success) {
    return { success: false, error: segmentSumResult.error };
  }

  const segmentMinResult = segmentTreeService.queryMin(l, r);
  const segmentMaxResult = segmentTreeService.queryMax(l, r);
  const mongoResult = await mongoService.queryRange(l, r);
  
  // Return segment tree results even if MongoDB is unavailable
  if (!mongoResult.success) {
    return {
      success: true,
      range: [l, r],
      segmentTree: {
        sum: segmentSumResult.result,
        min: segmentMinResult.result,
        max: segmentMaxResult.result
      },
      mongoDB: null,
      match: null,
      warning: mongoResult.error
    };
  }

  return {
    success: true,
    range: [l, r],
    segmentTree: {
      sum: segmentSumResult.result,
      min: segmentMinResult.result,
      max: segmentMaxResult.result
    },
    mongoDB: {
      sum: mongoResult.sum,
      min: mongoResult.min,
      max: mongoResult.max,
      count: mongoResult.count
    },
    match: {
      sum: segmentSumResult.result === mongoResult.sum,
      min: segmentMinResult.result === mongoResult.min,
      max: segmentMaxResult.result === mongoResult.max
    }
  };
}
// This handler returns the current state of the segment tree and MongoDB connection status, including any warnings if MongoDB is not connected

function getStateHandler() {
  return {
    ...segmentTreeService.getState(),
    mongoConnected: mongoService.isConnected()
  };
}

async function resetHandler() {
  const result = segmentTreeService.reset();
  const mongoResult = await mongoService.reset();

  if (!mongoResult.success) {
    return {
      ...result,
      warning: mongoResult.error
    };
  }

  return result;
}
// This controller provides handlers for all segment tree operations, including querying, updating, setting the array, comparing results with MongoDB, getting the current state, and resetting the data. Each handler ensures that the segment tree and MongoDB remain in sync and provides detailed feedback on the operations performed.

module.exports = {
  queryHandler,
  updateHandler,
  setArrayHandler,
  compareHandler,
  getStateHandler,
  resetHandler
};
