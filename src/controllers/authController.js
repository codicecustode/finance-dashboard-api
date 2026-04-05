import authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Only admins can create admin-role users
    const assignedRole =
      role === 'admin' && (!req.user || req.user.role !== 'admin') ? 'viewer' : role;

    const { user, token } = await authService.register({
      name,
      email,
      password,
      role: assignedRole,
    });

    return sendSuccess(res, 201, 'Account created successfully.', { user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    return sendSuccess(res, 200, 'Login successful.', { user, token });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return sendSuccess(res, 200, 'Profile retrieved.', { user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user._id, { currentPassword, newPassword });
    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (err) {
    next(err);
  }
};

export default{ register, login, getProfile, changePassword };
