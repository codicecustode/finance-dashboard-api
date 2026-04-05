import express from 'express';
const router = express.Router();
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// All dashboard routes require authentication
router.use(authenticate);
// All dashboard routes require at least viewer role
router.use(authorize('viewer', 'analyst', 'admin'));

const PERIOD_DESC = `Optional time period filter. One of: \`week\`, \`month\`, \`quarter\`, \`year\`. Omit for all-time data.`;

/**
 * @openapi
 * tags:
 *   name: Dashboard
 *   description: Aggregated financial analytics and summary endpoints
 */

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Full dashboard data in a single request
 *     description: Returns summary, category breakdown, monthly trends, recent activity, and top categories in one call.
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Time period filter
 *     responses:
 *       200:
 *         description: Full dashboard payload
 */
router.get('/', dashboardController.getFullDashboard);

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Income, expense totals and net balance
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Time period filter
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               summary:
 *                 income: { total: 15000, count: 6, average: 2500 }
 *                 expense: { total: 8500, count: 12, average: 708.33 }
 *                 netBalance: 6500
 *                 period: month
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @openapi
 * /api/dashboard/categories:
 *   get:
 *     tags: [Dashboard]
 *     summary: Category-wise income and expense breakdown
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by record type
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *     responses:
 *       200:
 *         description: Category totals
 */
router.get('/categories', dashboardController.getCategoryBreakdown);

/**
 * @openapi
 * /api/dashboard/trends/monthly:
 *   get:
 *     tags: [Dashboard]
 *     summary: Monthly income vs expense trends
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of past months to include
 *     responses:
 *       200:
 *         description: Monthly trend data grouped by year/month
 */
router.get('/trends/monthly', dashboardController.getMonthlyTrends);

/**
 * @openapi
 * /api/dashboard/trends/weekly:
 *   get:
 *     tags: [Dashboard]
 *     summary: Weekly income vs expense trends
 *     parameters:
 *       - in: query
 *         name: weeks
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of past weeks to include
 *     responses:
 *       200:
 *         description: Weekly trend data
 */
router.get('/trends/weekly', dashboardController.getWeeklyTrends);

/**
 * @openapi
 * /api/dashboard/recent:
 *   get:
 *     tags: [Dashboard]
 *     summary: Most recent financial activity
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent records list
 */
router.get('/recent', dashboardController.getRecentActivity);

/**
 * @openapi
 * /api/dashboard/top-categories:
 *   get:
 *     tags: [Dashboard]
 *     summary: Top spending categories (expenses only)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *     responses:
 *       200:
 *         description: Ranked list of expense categories
 */
router.get('/top-categories', dashboardController.getTopCategories);

export default router;
