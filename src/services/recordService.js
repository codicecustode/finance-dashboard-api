import  {FinancialRecord}  from "../models/FinancialRecord.js";

//Build filter object from query parameters
const buildFilter = ({ type, category, startDate, endDate, minAmount, maxAmount, search }) => {
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  return filter;
};

//Create a new financial record
const createRecord = async (data, userId) => {
  const record = await FinancialRecord.create({ ...data, createdBy: userId });
  await record.populate('createdBy', 'name email');
  return record;
};

//Get records with filtering, sorting, and pagination
const getRecords = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'date',
    sortOrder = 'desc',
    ...filters
  } = queryParams;

  const filter = buildFilter(filters);
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

//Get a single record by ID
const getRecordById = async (recordId) => {
  const record = await FinancialRecord.findById(recordId).populate('createdBy', 'name email');
  if (!record) {
    const error = new Error('Financial record not found.');
    error.statusCode = 404;
    throw error;
  }
  return record;
};

//Update a financial record
const updateRecord = async (recordId, updates, userId) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    recordId,
    { $set: { ...updates, updatedBy: userId } },
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  if (!record) {
    const error = new Error('Financial record not found.');
    error.statusCode = 404;
    throw error;
  }

  return record;
};

//Soft-delete a financial record
const deleteRecord = async (recordId, userId) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    recordId,
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: userId,
      },
    },
    { new: true }
  );

  if (!record) {
    const error = new Error('Financial record not found.');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

export default { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
