import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';

//Generates a signed JWT for a user
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

//Register a new user.
//Only admins can create admin-role users (enforced at route level).
const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, password, role: role || 'viewer' });
  const token = generateToken(user._id);

  return { user, token };
};

//Authenticate user with email and password.
const login = async ({ email, password }) => {
  // Include password field explicitly since it's select: false
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Contact an administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  return { user, token };
};

//Get current logged-in user profile
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

//Change password for authenticated user
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  await user.save();
  return true;
};

export default { register, login, getProfile, changePassword, generateToken };
