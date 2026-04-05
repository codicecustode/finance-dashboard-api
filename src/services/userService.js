import { User } from '../models/User.js';

//Get all users with optional filters (admin only)
const getAllUsers = async ({ role, isActive, page = 1, limit = 20, search }) => {
  const filter = {};

  if (role) filter.role = role;
  if (typeof isActive !== 'undefined') filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

//Get a single user by ID
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

//Update user details (admin operation)
const updateUser = async (userId, updates, requestingUserId) => {
  // Prevent an admin from deactivating themselves
  if (updates.isActive === false && userId === requestingUserId.toString()) {
    const error = new Error('You cannot deactivate your own account.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

//Delete a user (admin operation). Prevents self-deletion.
const deleteUser = async (userId, requestingUserId) => {
  if (userId === requestingUserId.toString()) {
    const error = new Error('You cannot delete your own account.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

export default { getAllUsers, getUserById, updateUser, deleteUser };
