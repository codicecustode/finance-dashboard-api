import recordService from '../services/recordService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

const createRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description, tags } = req.body;
    const record = await recordService.createRecord(
      { amount, type, category, date, description, tags },
      req.user._id
    );
    return sendSuccess(res, 201, 'Financial record created successfully.', { record });
  } catch (err) {
    next(err);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query);
    return sendPaginated(res, 'Records retrieved.', result.records, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return sendSuccess(res, 200, 'Record retrieved.', { record });
  } catch (err) {
    next(err);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const { amount, type, category, date, description, tags } = req.body;
    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;

    const record = await recordService.updateRecord(req.params.id, updates, req.user._id);
    return sendSuccess(res, 200, 'Record updated successfully.', { record });
  } catch (err) {
    next(err);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Record deleted successfully.');
  } catch (err) {
    next(err);
  }
};

export default  { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
