import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, phone, targetExam } = req.body;

  try {
    const userExists = await User.findOne({ email, phone });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const targetRole = role || 'student';
    const user = await User.create({
      name,
      email,
      password,
      role: targetRole,
      phone,
      targetExam,
    });

    if (user) {
      generateToken(res, user.id, user.role);
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    const user = await User.findOne({ email, phone });

    if (user && (await User.matchPassword(password, user.password_hash))) {
      generateToken(res, user.id, user.role);

      res.json({
        success: true,
        data: {
          _id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      data: req.user,
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};
