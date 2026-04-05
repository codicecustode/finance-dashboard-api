import jwt from 'jsonwebtoken';
import {User, ROLES} from '../models/User.js';
import { sendError } from '../utils/response.js';

// Verifies JWT token and attaches user to req.user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required. Please provide a valid Bearer token.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Your session has expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid token. Please log in again.');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, 'Authentication error.');
  }
};

//Role-based authorization middleware
//Usage: authorize('admin') or authorize('admin', 'analyst')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      );
    }

    next();
  };
};

export  { authenticate, authorize };
