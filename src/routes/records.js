import express from 'express';
const router = express.Router();
import recordController from '../controllers/recordController.js'
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createRecordValidator,
  updateRecordValidator,
  recordQueryValidator,
  mongoIdValidator,
} from '../middleware/validators.js';

// All record routes require authentication
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Records
 *   description: Financial record management
 */

/**
 * @openapi
 * /api/records:
 *   get:
 *     tags: [Records]
 *     summary: Get all financial records (Viewer, Analyst, Admin)
 *     description: Supports filtering, sorting, and pagination. Soft-deleted records are excluded.
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in description, category, or tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, amount, category, createdAt]
 *           default: date
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of financial records
 */
router.get(
  '/',
  authorize('viewer', 'analyst', 'admin'),
  recordQueryValidator,
  recordController.getRecords
);

/**
 * @openapi
 * /api/records/{id}:
 *   get:
 *     tags: [Records]
 *     summary: Get a single financial record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record data
 *       404:
 *         description: Record not found
 */
router.get(
  '/:id',
  authorize('viewer', 'analyst', 'admin'),
  mongoIdValidator('id'),
  recordController.getRecordById
);

/**
 * @openapi
 * /api/records:
 *   post:
 *     tags: [Records]
 *     summary: Create a new financial record (Analyst, Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 2500.00
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: income
 *               category:
 *                 type: string
 *                 example: salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               description:
 *                 type: string
 *                 example: Monthly salary payment
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["work", "regular"]
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Forbidden — analyst or admin role required
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  authorize('analyst', 'admin'),
  createRecordValidator,
  recordController.createRecord
);

/**
 * @openapi
 * /api/records/{id}:
 *   patch:
 *     tags: [Records]
 *     summary: Update a financial record (Analyst, Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category: { type: string }
 *               date: { type: string, format: date }
 *               description: { type: string }
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
router.patch(
  '/:id',
  authorize('analyst', 'admin'),
  mongoIdValidator('id'),
  updateRecordValidator,
  recordController.updateRecord
);

/**
 * @openapi
 * /api/records/{id}:
 *   delete:
 *     tags: [Records]
 *     summary: Soft-delete a financial record (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record soft-deleted
 *       403:
 *         description: Forbidden — admin role required
 *       404:
 *         description: Record not found
 */
router.delete(
  '/:id',
  authorize('admin'),
  mongoIdValidator('id'),
  recordController.deleteRecord
);

export default router;
