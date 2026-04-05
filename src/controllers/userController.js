import userService from '../services/userService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page, limit, search } = req.query;
    const result = await userService.getAllUsers({
      role,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page,
      limit,
      search,
    });
    return sendPaginated(res, 'Users retrieved.', result.users, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, 200, 'User retrieved.', { user });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await userService.updateUser(req.params.id, updates, req.user._id);
    return sendSuccess(res, 200, 'User updated successfully.', { user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
};

export default { getAllUsers, getUserById, updateUser, deleteUser };
