import { FinancialRecord } from '../models/FinancialRecord.js';

//Helper: get date range boundaries for period filters
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return { $gte: start, $lte: now };
};

//Overall financial summary: total income, expenses, net balance
const getSummary = async (period) => {
  const dateFilter = period ? getDateRange(period) : null;
  const matchStage = { isDeleted: false };
  if (dateFilter) matchStage.date = dateFilter;

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
  ]);

  const summary = {
    income: { total: 0, count: 0, average: 0 },
    expense: { total: 0, count: 0, average: 0 },
    netBalance: 0,
    period: period || 'all-time',
  };

  result.forEach(({ _id, total, count, avgAmount }) => {
    summary[_id] = {
      total: Math.round(total * 100) / 100,
      count,
      average: Math.round(avgAmount * 100) / 100,
    };
  });

  summary.netBalance =
    Math.round((summary.income.total - summary.expense.total) * 100) / 100;

  return summary;
};

//Category-wise breakdown of income and expenses
const getCategoryBreakdown = async (type, period) => {
  const matchStage = { isDeleted: false };
  if (type) matchStage.type = type;

  const dateFilter = period ? getDateRange(period) : null;
  if (dateFilter) matchStage.date = dateFilter;

  return FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        total: { $round: ['$total', 2] },
        count: 1,
        average: { $round: ['$avgAmount', 2] },
      },
    },
  ]);
};

//Monthly trend data — income vs expenses over the past N months
const getMonthlyTrends = async (months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        data: {
          $push: {
            type: '$_id.type',
            total: { $round: ['$total', 2] },
            count: '$count',
          },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        data: 1,
      },
    },
  ]);
};

//Weekly trend data for the past N weeks
const getWeeklyTrends = async (weeks = 8) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  return FinancialRecord.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$date' },
          week: { $isoWeek: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        week: '$_id.week',
        type: '$_id.type',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
  ]);
};

//Recent activity — latest N records
const getRecentActivity = async (limit = 10) => {
  return FinancialRecord.find({ isDeleted: false })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('amount type category date description createdBy createdAt');
};

//Top spending categories (expenses only)
const getTopCategories = async (limit = 5, period) => {
  const matchStage = { isDeleted: false, type: 'expense' };
  const dateFilter = period ? getDateRange(period) : null;
  if (dateFilter) matchStage.date = dateFilter;

  return FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: Number(limit) },
    {
      $project: {
        _id: 0,
        category: '$_id',
        total: { $round: ['$total', 2] },
        count: 1,
      },
    },
  ]);
};

//Full dashboard aggregation (single call for frontend)
const getFullDashboard = async (period) => {
  const [summary, categoryBreakdown, monthlyTrends, recentActivity, topCategories] =
    await Promise.all([
      getSummary(period),
      getCategoryBreakdown(null, period),
      getMonthlyTrends(6),
      getRecentActivity(5),
      getTopCategories(5, period),
    ]);

  return {
    summary,
    categoryBreakdown,
    monthlyTrends,
    recentActivity,
    topCategories,
  };
};

export default {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
  getTopCategories,
  getFullDashboard,
};
