/** 
 * Developer: Meher Salim
 * File: call-duration-display.spec.js
 * Description: This file contains unit tests for the call-duration-display.js file.
 */
const request = require('supertest');
const express = require('express');
const createError = require('http-errors');
const { mongo } = require('../../../utils/mongo');
const callDurationRoute = require('../../../routes/reports/agent-performance/call-duration-display'); // Adjust the path as needed

const app = express();
app.use(express.json());
app.use('/api', callDurationRoute);

describe('GET /api/reports/agent-performance/call-duration-by-date-range-display', () => {
  beforeAll(() => {
    // Mock MongoDB connection and collection
    mongo.getDb = jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
          { date: new Date('2023-01-01'), duration: 120 },
          { date: new Date('2023-01-02'), duration: 90 },
        ]),
      }),
    });
  });

  it('should return call duration data for a valid date range', async () => {
    const response = await request(app)
      .get('/api/reports/agent-performance/call-duration-by-date-range-display')
      .query({ startDate: '2023-01-01', endDate: '2023-01-31' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { date: '2023-01-01T00:00:00.000Z', duration: 120 },
      { date: '2023-01-02T00:00:00.000Z', duration: 90 },
    ]);
  });

  it('should return 400 if startDate or endDate is missing', async () => {
    const response = await request(app)
      .get('/api/reports/agent-performance/call-duration-by-date-range-display')
      .query({ startDate: '2023-01-01' }); // Missing endDate

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Start date and end date are required.');
  });

  it('should return 500 if there is a server error', async () => {
    // Simulate a database error
    mongo.getDb = jest.fn().mockImplementation(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/api/reports/agent-performance/call-duration-by-date-range-display')
      .query({ startDate: '2023-01-01', endDate: '2023-01-31' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
  });
});
