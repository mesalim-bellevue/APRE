/**
 * Author: Meher Salim
 * File: feedbackRouter.spec.js
 * Description: Test the customer feedback API
 */

const request = require('supertest');
const express = require('express');
const feedbackRouter = require('../../../../src/routes/reports/customer-feedback/feedbackRouter');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo', () => ({
    mongo: jest.fn(async (operations) => {
        const mockDb = {
            collection: jest.fn(() => ({
                find: jest.fn(() => ({
                    toArray: jest.fn().mockResolvedValue([]),
                })),
            })),
        };
        await operations(mockDb);
    }),
}));

const app = express();
app.use(express.json());
app.use('/api/reports/customer-feedback', feedbackRouter);

describe('Customer Feedback API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return feedback for a valid product', async () => {
    // Mock data
    const mockFeedback = [
      {
        _id: '650c1f1e1c9d440000a1b238',
        product: 'Smartphone X',
        feedbackText: 'Great product!',
        feedbackSentiment: 'Positive',
      },
    ];

    // Mock the database operation
    mongo.mockImplementationOnce(async (operations) => {
        const mockDb = {
            collection: jest.fn(() => ({
                find: jest.fn(() => ({
                    toArray: jest.fn().mockResolvedValue(mockFeedback),
                })),
            })),
        };
        await operations(mockDb);
    });

    const response = await request(app).get('/api/reports/customer-feedback/product/Smartphone%20X');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Feedback retrieved for product: Smartphone X');
    expect(response.body.feedback).toEqual(mockFeedback);
  });

  test('should return 404 if no feedback is found for a product', async () => {
    // Mock the database operation
    mongo.mockImplementationOnce(async (operations) => {
        const mockDb = {
            collection: jest.fn(() => ({
                find: jest.fn(() => ({
                    toArray: jest.fn().mockResolvedValue([]),
                })),
            })),
        };
        await operations(mockDb);
    });

    const response = await request(app).get('/api/reports/customer-feedback/product/UnknownProduct');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No feedback found for product: UnknownProduct');
  });

  test('should return 500 if there is a server error', async () => {
    // Mock the database operation to throw an error
    mongo.mockImplementationOnce(async () => {
      throw new Error('Database error');
    });

    const response = await request(app).get('/api/reports/customer-feedback/product/Smartphone%20X');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
  });
});
