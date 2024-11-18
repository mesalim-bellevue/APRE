/** 
 * Developer: Meher Salim
 * File: call-duration-display.js
 * Description: This file contains the routes for fetching call duration data by date range.
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

// Function to fetch all call duration data by date range from the database
async function fetchCallDurations(startDate, endDate) {
  const db = mongo.getDb(); // Get the database connection
  console.log(`Fetching data from ${startDate} to ${endDate}`); // Log date range

  // Query the database to find call duration data within the specified date range
  const callData = await db.collection('callDurations').find({
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).toArray();
  
  // Return the call duration data
  return callData;
  console.log('Data retrieved:', callData); // Log retrieved data
}

// Route to handle fetching call duration data by date range
router.get('/reports/agent-performance/call-duration-by-date-range-display', async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Validate input dates
  if (!startDate || !endDate) {
    return next(createError(400, 'Start date and end date are required.'));
  }

  // Check if the input dates are valid
  try {
    const callData = await fetchCallDurations(startDate, endDate);
    res.json(callData);
  } catch (error) {
    next(createError(500, 'Internal Server Error'));
  }
});

module.exports = router;
