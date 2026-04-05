import dashboardService from '../services/dashboardService.js';
import { sendSuccess, sendError } from'../utils/response.js';

const getFullDashboard = async (req, res, next) => {
  try {
    const { period } = req.query;
    const data = await dashboardService.getFullDashboard(period);
    return sendSuccess(res, 200, 'Dashboard data retrieved.', { data });
  } catch (err) {
    next(err);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const { period } = req.query;
    const summary = await dashboardService.getSummary(period);
    return sendSuccess(res, 200, 'Summary retrieved.', { summary });
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type, period } = req.query;
    const breakdown = await dashboardService.getCategoryBreakdown(type, period);
    return sendSuccess(res, 200, 'Category breakdown retrieved.', { breakdown });
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const { months = 12 } = req.query;
    const trends = await dashboardService.getMonthlyTrends(Number(months));
    return sendSuccess(res, 200, 'Monthly trends retrieved.', { trends });
  } catch (err) {
    next(err);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const { weeks = 8 } = req.query;
    const trends = await dashboardService.getWeeklyTrends(Number(weeks));
    return sendSuccess(res, 200, 'Weekly trends retrieved.', { trends });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const activity = await dashboardService.getRecentActivity(Number(limit));
    return sendSuccess(res, 200, 'Recent activity retrieved.', { activity });
  } catch (err) {
    next(err);
  }
};

const getTopCategories = async (req, res, next) => {
  try {
    const { limit = 5, period } = req.query;
    const categories = await dashboardService.getTopCategories(Number(limit), period);
    return sendSuccess(res, 200, 'Top categories retrieved.', { categories });
  } catch (err) {
    next(err);
  }
};

export default{
  getFullDashboard,
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
  getTopCategories,
};
