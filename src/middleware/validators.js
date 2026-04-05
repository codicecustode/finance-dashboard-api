import { body, query, param, validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

//Middleware to check validation results and return errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  next();
};

// Auth Validators
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage('Role must be viewer, analyst, or admin'),

  validate,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate,
];

// User Validators
const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin']).withMessage('Role must be viewer, analyst, or admin'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),

  validate,
];

// Financial Record Validators
const createRecordValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => tags.every((t) => typeof t === 'string')).withMessage('Each tag must be a string'),

  validate,
];

const updateRecordValidator = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Category must be between 1 and 50 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  validate,
];

const recordQueryValidator = [
  query('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  query('category')
    .optional()
    .trim(),

  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid date'),

  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('minAmount must be a non-negative number'),

  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxAmount must be a non-negative number'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['date', 'amount', 'category', 'createdAt']).withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  validate,
];

const mongoIdValidator = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
  validate,
];

export {
  registerValidator,
  loginValidator,
  updateUserValidator,
  createRecordValidator,
  updateRecordValidator,
  recordQueryValidator,
  mongoIdValidator,
};
