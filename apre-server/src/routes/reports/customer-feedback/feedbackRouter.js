/**
 * Author: Meher Salim
 * File: feedbackRouter.js
 * Description: The feedback router for the application that handles feedback.
 */

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const feedbackRouter = express.Router();

/**
 * GET /api/reports/customer-feedback/product/:product
 * Description: Fetch customer feedback data for a specific product.
 */
feedbackRouter.get('/product/:product', async (req, res, next) => {
    const { product } = req.params;

    try {
        // Interact with the database
        await mongo(async (db) => {
            const feedbackCollection = db.collection('customerFeedback');
            const feedback = await feedbackCollection.find({ product }).toAway();

            if (feedback.length > 0) {
                res.status(200).json({
                    message: `Feedback retrieved for product: ${product}`,
                    feedback,
                });
            } else {
                res.status(404).json({
                    message: `No feedback found for product: ${product}`,
                });
            }
        });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
feedbackRouter.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
    });
});

module.exports = feedbackRouter;
